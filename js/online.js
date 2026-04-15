// online.js - Socket.IO client for online multiplayer
const OnlineManager = (() => {
  let socket = null;
  let myNickname = '';
  let mySocketId = '';
  let lobbyPlayers = [];
  let pendingInviteFrom = null;
  let matchData = null;
  let onLobbyUpdate = null;
  let onInviteReceived = null;
  let onInviteDeclined = null;
  let onMatchStart = null;
  let onOpponentDisconnect = null;
  let onGameStateReceived = null;
  let connected = false;

  function connect(serverUrl = 'http://localhost:3000') {
    return new Promise((resolve, reject) => {
      if (typeof io === 'undefined') {
        reject(new Error('Socket.IO not loaded'));
        return;
      }
      socket = io(serverUrl, { transports: ['websocket', 'polling'] });

      socket.on('connect', () => {
        mySocketId = socket.id;
        connected = true;
        resolve();
      });

      socket.on('connect_error', (err) => {
        reject(err);
      });

      socket.on('lobby_update', (players) => {
        lobbyPlayers = players.filter(p => p.id !== mySocketId);
        if (onLobbyUpdate) onLobbyUpdate(lobbyPlayers);
      });

      socket.on('invite_received', (data) => {
        pendingInviteFrom = data;
        if (onInviteReceived) onInviteReceived(data);
      });

      socket.on('invite_declined', (data) => {
        if (onInviteDeclined) onInviteDeclined(data);
      });

      socket.on('match_start', (data) => {
        matchData = data;
        if (onMatchStart) onMatchStart(data);
      });

      socket.on('opponent_disconnect', () => {
        if (onOpponentDisconnect) onOpponentDisconnect();
      });

      socket.on('game_state', (data) => {
        if (onGameStateReceived) onGameStateReceived(data);
      });
    });
  }

  function registerNickname(nickname) {
    return new Promise((resolve) => {
      socket.emit('register_nickname', { nickname }, (response) => {
        if (response.success) {
          myNickname = nickname;
        }
        resolve(response);
      });
    });
  }

  function getLobby() {
    return new Promise((resolve) => {
      socket.emit('get_lobby', {}, (response) => {
        lobbyPlayers = (response.players || []).filter(p => p.id !== mySocketId);
        resolve(lobbyPlayers);
      });
    });
  }

  function sendInvite(targetId) {
    return new Promise((resolve) => {
      socket.emit('send_invite', { targetId }, (response) => {
        resolve(response);
      });
    });
  }

  function respondToInvite(fromId, accepted, myCharacter) {
    socket.emit('invite_response', { fromId, accepted, myCharacter });
    pendingInviteFrom = null;
  }

  function sendCharacterSelect(characterId) {
    socket.emit('character_select', { characterId });
  }

  function sendGameState(state) {
    if (socket && connected) {
      socket.emit('game_state', state);
    }
  }

  function disconnect() {
    if (socket) { socket.disconnect(); connected = false; }
  }

  function isConnected() { return connected; }
  function getMyNickname() { return myNickname; }
  function getMatchData() { return matchData; }
  function getLobbyPlayers() { return lobbyPlayers; }
  function getPendingInvite() { return pendingInviteFrom; }

  function on(event, handler) {
    switch (event) {
      case 'lobby_update': onLobbyUpdate = handler; break;
      case 'invite_received': onInviteReceived = handler; break;
      case 'invite_declined': onInviteDeclined = handler; break;
      case 'match_start': onMatchStart = handler; break;
      case 'opponent_disconnect': onOpponentDisconnect = handler; break;
      case 'game_state': onGameStateReceived = handler; break;
    }
  }

  return {
    connect, registerNickname, getLobby, sendInvite, respondToInvite,
    sendCharacterSelect, sendGameState, disconnect, isConnected,
    getMyNickname, getMatchData, getLobbyPlayers, getPendingInvite, on
  };
})();
