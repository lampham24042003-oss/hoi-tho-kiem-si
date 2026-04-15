// server.js - Node.js + Socket.IO backend for online multiplayer
'use strict';

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Serve game files statically
app.use(express.static(path.join(__dirname, '..')));

// ═════════════════════════════════════════════════
// State
// ═════════════════════════════════════════════════
const players = new Map();  // socketId → { id, nickname, status, roomId }
const rooms    = new Map();  // roomId → { host, guest, state }
const nicknames = new Set(); // reserved nicknames

// Helper: broadcast lobby update to all
function broadcastLobby() {
  const list = Array.from(players.values())
    .map(p => ({ id: p.id, nickname: p.nickname, status: p.status }));
  io.emit('lobby_update', list);
}

// ═════════════════════════════════════════════════
// Socket Events
// ═════════════════════════════════════════════════
io.on('connection', (socket) => {
  console.log(`[+] Kết nối: ${socket.id}`);

  // ── Register nickname ────────────────────────────────────────
  socket.on('register_nickname', ({ nickname }, callback) => {
    if (!nickname || nickname.trim().length < 2 || nickname.trim().length > 20) {
      return callback({ success: false, error: 'Tên phải từ 2 đến 20 ký tự!' });
    }

    const cleanNick = nickname.trim();

    // Check uniqueness (case-insensitive)
    const lowerNick = cleanNick.toLowerCase();
    const exists = Array.from(players.values()).some(
      p => p.nickname.toLowerCase() === lowerNick
    );

    if (exists) {
      return callback({ success: false, error: 'Tên này đã được sử dụng! Vui lòng chọn tên khác.' });
    }

    // Register player
    const player = {
      id: socket.id,
      nickname: cleanNick,
      status: 'idle',
      roomId: null
    };
    players.set(socket.id, player);
    nicknames.add(lowerNick);

    console.log(`[+] Đăng ký: ${cleanNick} (${socket.id})`);
    broadcastLobby();

    callback({ success: true, nickname: cleanNick });
  });

  // ── Get lobby ────────────────────────────────────────────────
  socket.on('get_lobby', (_, callback) => {
    const list = Array.from(players.values())
      .map(p => ({ id: p.id, nickname: p.nickname, status: p.status }));
    callback({ players: list });
  });

  // ── Send invite ──────────────────────────────────────────────
  socket.on('send_invite', ({ targetId }, callback) => {
    const sender = players.get(socket.id);
    const target = players.get(targetId);

    if (!sender) return callback({ success: false, error: 'Bạn chưa đăng ký!' });
    if (!target) return callback({ success: false, error: 'Người chơi không tồn tại!' });
    if (target.status !== 'idle') return callback({ success: false, error: 'Người chơi đang bận!' });
    if (sender.status !== 'idle') return callback({ success: false, error: 'Bạn đang trong trận đấu!' });

    io.to(targetId).emit('invite_received', {
      fromId: socket.id,
      nickname: sender.nickname
    });

    callback({ success: true });
  });

  // ── Invite response ──────────────────────────────────────────
  socket.on('invite_response', ({ fromId, accepted }) => {
    const responder = players.get(socket.id);
    const inviter   = players.get(fromId);

    if (!accepted) {
      // Declined
      if (inviter) {
        io.to(fromId).emit('invite_declined', { nickname: responder?.nickname || 'Ai đó' });
      }
      return;
    }

    if (!responder || !inviter) return;

    // Create match room
    const roomId = `room_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const firstPick = Math.random() < 0.5 ? inviter.nickname : responder.nickname;

    rooms.set(roomId, {
      host: fromId,
      guest: socket.id,
      hostNickname: inviter.nickname,
      guestNickname: responder.nickname,
      state: 'char_select',
      hostChar: null,
      guestChar: null
    });

    inviter.status = 'playing';
    inviter.roomId = roomId;
    responder.status = 'playing';
    responder.roomId = roomId;

    // Both players join the Socket.IO room
    socket.join(roomId);
    io.sockets.sockets.get(fromId)?.join(roomId);

    const matchPayload = {
      roomId,
      hostNickname: inviter.nickname,
      guestNickname: responder.nickname,
      firstPick
    };

    io.to(fromId).emit('match_start', matchPayload);
    io.to(socket.id).emit('match_start', matchPayload);

    broadcastLobby();
    console.log(`[*] Trận đấu bắt đầu: ${roomId} (${inviter.nickname} vs ${responder.nickname})`);
  });

  // ── Character select ─────────────────────────────────────────
  socket.on('character_select', ({ characterId }) => {
    const player = players.get(socket.id);
    if (!player || !player.roomId) return;

    const room = rooms.get(player.roomId);
    if (!room) return;

    // Send to the other player in the room
    socket.to(player.roomId).emit('game_state', {
      type: 'char_select',
      characterId,
      from: socket.id
    });

    // Store selection
    if (room.host === socket.id) room.hostChar = characterId;
    else room.guestChar = characterId;
  });

  // ── Real-time game state ─────────────────────────────────────
  socket.on('game_state', (state) => {
    const player = players.get(socket.id);
    if (!player || !player.roomId) return;
    socket.to(player.roomId).emit('game_state', { ...state, from: socket.id });
  });

  // ── Disconnect ───────────────────────────────────────────────
  socket.on('disconnect', () => {
    const player = players.get(socket.id);
    if (player) {
      console.log(`[-] Ngắt kết nối: ${player.nickname} (${socket.id})`);

      // Notify opponent if in a room
      if (player.roomId) {
        const room = rooms.get(player.roomId);
        if (room) {
          const opponentId = room.host === socket.id ? room.guest : room.host;
          const opponent = players.get(opponentId);
          if (opponent) {
            io.to(opponentId).emit('opponent_disconnect');
            opponent.status = 'idle';
            opponent.roomId = null;
          }
          rooms.delete(player.roomId);
        }
      }

      // Remove player
      nicknames.delete(player.nickname.toLowerCase());
      players.delete(socket.id);
      broadcastLobby();
    }
  });
});

// ═════════════════════════════════════════════════
// HTTP routes
// ═════════════════════════════════════════════════
app.get('/api/status', (_, res) => {
  res.json({
    online: players.size,
    rooms: rooms.size,
    players: Array.from(players.values()).map(p => ({
      nickname: p.nickname,
      status: p.status
    }))
  });
});

// ═════════════════════════════════════════════════
// Start server
// ═════════════════════════════════════════════════
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║   🗡️  Hơi Thở Kiếm Sĩ - Game Server   🗡️  ║');
  console.log('╠══════════════════════════════════════════╣');
  console.log(`║   Server: http://localhost:${PORT}           ║`);
  console.log(`║   Game:   http://localhost:${PORT}/index.html ║`);
  console.log('║   Tạo bởi: Lam Phạm - BabyBlue          ║');
  console.log('╚══════════════════════════════════════════╝\n');
});
