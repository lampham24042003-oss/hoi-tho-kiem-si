// main.js - Application flow controller
// Screens: splash → menu → mode_select → difficulty_select → char_select → game → result
// Online:  splash → menu → online_nickname → online_lobby → char_select → game → result

'use strict';

const App = (() => {
  let currentScreen = null;
  let selectedMode = null; // 'offline' | 'online'
  let selectedDifficulty = 'medium';
  let p1Char = null;
  let p2Char = null;
  let charSelectPhase = 1;
  let onlineData = {};
  let assetsLoaded = false;

  // ── Screen registry ──────────────────────────────────────────
  const screens = {};
  function registerScreen(id) {
    screens[id] = document.getElementById(id);
  }

  function showScreen(id) {
    Object.values(screens).forEach(s => { if (s) s.classList.remove('active'); });
    if (screens[id]) {
      screens[id].classList.add('active');
      currentScreen = id;
    }
    
    // BGM handling
    if (window.BGMManager) {
      if (id === 'main-menu') {
        BGMManager.play('bgm_main menu');
      } else if (['difficulty-select', 'online-nickname', 'online-lobby', 'char-select', 'online-char-select', 'result-screen'].includes(id)) {
        BGMManager.play('bgm_mode');
      }
    }
  }

  // ── Init ─────────────────────────────────────────────────────
  async function init() {
    // Register all screens
    ['init-screen', 'splash-screen', 'loading-screen', 'main-menu', 'mode-select',
     'difficulty-select', 'char-select', 'game-screen', 'online-nickname',
     'online-lobby', 'online-char-select', 'result-screen'].forEach(registerScreen);

    showScreen('init-screen');

    document.getElementById('init-screen').addEventListener('click', () => {
      // Unlock audio contexts on first interaction
      if (window.AudioManager && window.AudioManager.getCtx) window.AudioManager.getCtx();
      if (window.BGMManager) window.BGMManager.play('bgm_main menu');

      // Now show splash
      showScreen('splash-screen');

      // Splash animation then load assets
      setTimeout(async () => {
        showScreen('loading-screen');
        await Images.preloadAll();
        assetsLoaded = true;
        setTimeout(() => showScreen('main-menu'), 600);
      }, 2800);
    }, { once: true });

    // Bind menu buttons
    _bindButtons();
    _buildCharSelectUI();
    _buildOnlineCharSelectUI();

    // Audio Mute toggle
    const muteBtn = document.getElementById('btn-master-mute');
    if (muteBtn) {
      muteBtn.addEventListener('click', () => {
        if (window.GlobalAudio) {
           const muted = window.GlobalAudio.toggleMute();
           muteBtn.textContent = muted ? '🔇' : '🔊';
           muteBtn.style.background = muted ? 'rgba(255,0,0,0.4)' : 'rgba(0,0,0,0.6)';
        }
      });
    }
  }

  function _bindButtons() {
    // Main menu
    _on('btn-offline', () => { selectedMode = 'offline'; showScreen('difficulty-select'); });
    _on('btn-training', () => { selectedMode = 'training'; selectedDifficulty = 'none'; _startCharSelect(); });
    _on('btn-online', () => { selectedMode = 'online'; showScreen('online-nickname'); });

    // Difficulty
    ['easy', 'medium', 'hard'].forEach(diff => {
      _on(`btn-diff-${diff}`, () => {
        selectedDifficulty = diff;
        _startCharSelect('offline');
      });
    });

    // In-game Exit button
    _on('btn-game-exit', () => {
      const isOnline = (selectedMode === 'online');
      stopGame();
      if (isOnline) {
        // If online, properly handle exit logic later (forfeit)
        showScreen('main-menu');
      } else {
        showScreen('main-menu');
      }
    });

    // Online nickname
    _on('btn-nickname-submit', _handleNicknameSubmit);
    const nicknameInput = document.getElementById('nickname-input');
    if (nicknameInput) nicknameInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') _handleNicknameSubmit();
    });

    // Online lobby
    _on('btn-refresh-lobby', _refreshLobby);
    _on('btn-lobby-search', _searchLobby);
    _on('btn-back-lobby', () => showScreen('main-menu'));

    // Char select
    _on('btn-char-confirm', _confirmCharSelect);
    _on('btn-char-back', () => {
      if (charSelectPhase === 2) {
        _startCharSelect(selectedMode);
      } else {
        if (selectedMode === 'offline') showScreen('difficulty-select');
        else if (selectedMode === 'training') showScreen('main-menu');
        else showScreen('online-lobby');
      }
    });

    const stageSelect = document.getElementById('stage-select');
    if (stageSelect) {
      stageSelect.addEventListener('change', (e) => {
        const previewImg = document.getElementById('stage-preview-img');
        if (previewImg) previewImg.src = `assets/bg/${e.target.value}.png`;
      });
    }

    // Online char select
    _on('btn-online-char-confirm', _confirmOnlineCharSelect);

    // Result screen
    _on('btn-rematch', _startRematch);
    _on('btn-back-menu', () => {
      stopGame();
      showScreen('main-menu');
    });

    // Pause (handled by game engine ESC key, but for menu btn)
    _on('btn-pause-resume', () => { if (currentGame) currentGame.togglePause(); });
    _on('btn-pause-quit', () => {
      stopGame();
      showScreen('main-menu');
    });
  }

  function _on(id, fn) {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', fn);
  }

  // ── Character Select ─────────────────────────────────────────
  function _buildCharSelectUI() {
    const grid = document.getElementById('char-select-grid');
    if (!grid) return;
    grid.innerHTML = '';
    CHARACTER_ORDER.forEach(id => {
      const c = CHARACTERS[id];
      const card = document.createElement('div');
      card.className = 'char-card';
      card.dataset.charId = id;
      card.innerHTML = `
        <div class="char-card-img-wrap">
          <img src="${c.spriteUrl}" alt="${c.displayName}" loading="lazy">
          <div class="char-card-aura" style="--aura: ${c.auraColor}"></div>
        </div>
        <div class="char-card-name" style="color: ${c.selectColor}">${c.displayName}</div>
        <div class="char-card-desc">${c.description}</div>
      `;
      card.addEventListener('click', () => _selectChar(id));
      grid.appendChild(card);
    });
  }

  function _buildOnlineCharSelectUI() {
    const grid = document.getElementById('online-char-select-grid');
    if (!grid) return;
    grid.innerHTML = '';
    CHARACTER_ORDER.forEach(id => {
      const c = CHARACTERS[id];
      const card = document.createElement('div');
      card.className = 'char-card';
      card.dataset.charId = id;
      card.innerHTML = `
        <div class="char-card-img-wrap">
          <img src="${c.spriteUrl}" alt="${c.displayName}" loading="lazy">
        </div>
        <div class="char-card-name" style="color: ${c.selectColor}">${c.displayName}</div>
      `;
      card.addEventListener('click', () => _selectOnlineChar(id));
      grid.appendChild(card);
    });
  }

  function _startCharSelect(mode) {
    // Reset selection
    p1Char = null;
    p2Char = null;
    charSelectPhase = 1;
    document.querySelectorAll('.char-card').forEach(c => c.classList.remove('selected', 'locked'));
    
    const titleObj = document.getElementById('char-select-title');
    if (titleObj) titleObj.textContent = '🗡️ Chọn Nhân Vật';
    
    const confirmBtn = document.getElementById('btn-char-confirm');
    if (confirmBtn) confirmBtn.textContent = 'Xác Nhận ✓';
    
    document.getElementById('char-preview-name').textContent = 'Chọn nhân vật';
    document.getElementById('char-preview-name').style.color = '#fff';
    document.getElementById('char-preview-desc').textContent = '';
    
    if (document.getElementById('char-preview-tags')) document.getElementById('char-preview-tags').innerHTML = '';
    if (document.getElementById('char-preview-stats')) document.getElementById('char-preview-stats').innerHTML = '';
    if (document.getElementById('char-preview-mechanics')) document.getElementById('char-preview-mechanics').style.display = 'none';
    
    document.getElementById('char-preview-img').src = '';
    document.getElementById('btn-char-confirm').disabled = true;
    showScreen('char-select');
  }

  function _renderStars(val) {
    let html = '';
    for(let i=0; i<5; i++) {
        html += i < val ? '<span class="filled">★</span>' : '<span>★</span>';
    }
    return html;
  }

  function _selectChar(charId) {
    if (charSelectPhase === 2 && charId === p1Char) {
      _showToast('Không thể chọn trùng nhân vật!');
      return;
    }

    if (charSelectPhase === 1) {
      p1Char = charId;
    } else {
      p2Char = charId;
    }

    const c = CHARACTERS[charId];
    document.querySelectorAll('#char-select-grid .char-card').forEach(card => {
      if (!card.classList.contains('locked')) {
        card.classList.toggle('selected', card.dataset.charId === charId);
      }
    });
    // Preview
    document.getElementById('char-preview-name').textContent = c.displayName;
    document.getElementById('char-preview-name').style.color = c.selectColor;
    document.getElementById('char-preview-desc').textContent = c.description;
    
    const tagsContainer = document.getElementById('char-preview-tags');
    if (tagsContainer) {
      tagsContainer.innerHTML = c.tags ? c.tags.map(t => `<div class="char-tag">${t}</div>`).join('') : '';
    }

    const statsContainer = document.getElementById('char-preview-stats');
    if (statsContainer) {
      if (c.stats) {
        statsContainer.innerHTML = `
          <div class="stat-row"><span class="stat-label">Tấn công</span><span class="stat-stars">${_renderStars(c.stats.attack)}</span></div>
          <div class="stat-row"><span class="stat-label">Phòng thủ</span><span class="stat-stars">${_renderStars(c.stats.defense)}</span></div>
          <div class="stat-row"><span class="stat-label">Tốc độ</span><span class="stat-stars">${_renderStars(c.stats.speed)}</span></div>
          <div class="stat-row"><span class="stat-label">Linh hoạt</span><span class="stat-stars">${_renderStars(c.stats.agility)}</span></div>
          <div class="stat-row"><span class="stat-label">Độ khó</span><span class="stat-stars">${_renderStars(c.stats.difficulty)}</span></div>
        `;
      } else {
        statsContainer.innerHTML = '';
      }
    }

    const mechText = document.getElementById('char-preview-mechanics-text');
    const mechDetails = document.getElementById('char-preview-mechanics');
    if (mechText && mechDetails) {
      if (c.mechanicsDescription) {
        mechDetails.style.display = 'block';
        mechText.innerHTML = c.mechanicsDescription;
        mechDetails.removeAttribute('open');
      } else {
        mechDetails.style.display = 'none';
      }
    }

    document.getElementById('char-preview-img').src = c.spriteUrl;
    document.getElementById('char-preview-ultimate').textContent = c.ultimateName;
    document.getElementById('btn-char-confirm').disabled = false;
  }

  function _confirmCharSelect() {
    if (charSelectPhase === 1) {
      if (!p1Char) return;

      if (selectedMode === 'training') {
        p2Char = 'murata';
        _launchGame();
        return;
      }

      charSelectPhase = 2;
      
      const titleObj = document.getElementById('char-select-title');
      if (titleObj) titleObj.textContent = '🗡️ Chọn Đối Thủ (Bot)';
      
      const confirmBtn = document.getElementById('btn-char-confirm');
      if (confirmBtn) {
        confirmBtn.textContent = 'Bắt Đầu Trận Đấu ⚔️';
        confirmBtn.disabled = true;
      }
      
      document.querySelectorAll('#char-select-grid .char-card').forEach(card => {
        card.classList.remove('selected');
        if (card.dataset.charId === p1Char) {
          card.classList.add('locked');
        }
      });
      
      // Clear preview
      document.getElementById('char-preview-name').textContent = 'Chọn đối thủ';
      document.getElementById('char-preview-name').style.color = '#fff';
      document.getElementById('char-preview-desc').textContent = '';
      if (document.getElementById('char-preview-tags')) document.getElementById('char-preview-tags').innerHTML = '';
      if (document.getElementById('char-preview-stats')) document.getElementById('char-preview-stats').innerHTML = '';
      if (document.getElementById('char-preview-mechanics')) document.getElementById('char-preview-mechanics').style.display = 'none';
      document.getElementById('char-preview-img').src = '';
      document.getElementById('char-preview-ultimate').textContent = '—';
      return;
    }

    if (charSelectPhase === 2) {
      if (!p2Char) return;
      _launchGame();
    }
  }

  // ── Launch Game ───────────────────────────────────────────────
  function _launchGame() {
    const stageSelect = document.getElementById('stage-select');
    const selectedBg = stageSelect ? stageSelect.value : 'bg_sagiri'; // Fallback
    
    if (window.BGMManager && p1Char) {
      BGMManager.play('bgm_' + p1Char);
    }

    const healBtn = document.getElementById('btn-heal-dummy');
    if (healBtn) {
      healBtn.style.display = selectedMode === 'training' ? 'block' : 'none';
      if (selectedMode === 'training') {
        healBtn.onclick = () => {
          if (typeof currentGame !== 'undefined' && currentGame && currentGame.p2) {
             currentGame.p2.hp = currentGame.p2.maxHp;
             if (window.Effects) {
                Effects.floatingText(currentGame.p2.centerX, currentGame.p2.y - 20, 'HỒI PHỤC', 'heal');
             }
          }
        };
      }
    }

    showScreen('game-screen');
    setTimeout(() => {
      startGame({
        mode: selectedMode,
        difficulty: selectedDifficulty,
        p1Char,
        p2Char,
        bgId: selectedBg,
        onGameEnd: (winner) => {
          _showResult(winner);
        }
      });
    }, 100);
  }

  function _showResult(winner) {
    const p1Data = CHARACTERS[p1Char];
    const p2Data = CHARACTERS[p2Char];

    let titleText, titleColor, subtitleText;
    if (winner === 'p1') {
      titleText = `${p1Data.displayName} CHIẾN THẮNG!`;
      titleColor = p1Data.selectColor;
      subtitleText = 'Xuất sắc! Bạn đã đánh bại đối thủ!';
    } else if (winner === 'p2') {
      titleText = `${p2Data.displayName} CHIẾN THẮNG!`;
      titleColor = p2Data.selectColor;
      subtitleText = selectedMode === 'offline' ? 'Bot đã chiến thắng! Hãy thử lại!' : 'Đối thủ đã thắng!';
    } else {
      titleText = 'HÒA!';
      titleColor = '#ffdd00';
      subtitleText = 'Trận đấu bằng nhau!';
    }

    document.getElementById('result-title').textContent = titleText;
    document.getElementById('result-title').style.color = titleColor;
    document.getElementById('result-subtitle').textContent = subtitleText;
    document.getElementById('result-img').src = winner === 'p1' ? p1Data.ultimateUrl
      : winner === 'p2' ? p2Data.ultimateUrl : p1Data.ultimateUrl;

    showScreen('result-screen');
  }

  function _startRematch() {
    const stageSelect = document.getElementById('stage-select');
    const selectedBg = stageSelect ? stageSelect.value : 'bg_sagiri';

    if (window.BGMManager && p1Char) {
      BGMManager.play('bgm_' + p1Char);
    }

    showScreen('game-screen');
    setTimeout(() => {
      startGame({
        mode: selectedMode,
        difficulty: selectedDifficulty,
        p1Char,
        p2Char,
        bgId: selectedBg,
        onGameEnd: _showResult
      });
    }, 100);
  }

  // ── Online Mode ───────────────────────────────────────────────
  async function _handleNicknameSubmit() {
    const input = document.getElementById('nickname-input');
    const errEl = document.getElementById('nickname-error');
    const nick = input ? input.value.trim() : '';

    if (!nick || nick.length < 2 || nick.length > 20) {
      if (errEl) errEl.textContent = 'Tên phải từ 2-20 ký tự!';
      return;
    }

    if (errEl) errEl.textContent = 'Đang kết nối...';

    try {
      await OnlineManager.connect();
      const res = await OnlineManager.registerNickname(nick);
      if (res.success) {
        onlineData.nickname = nick;
        if (errEl) errEl.textContent = '';
        _setupOnlineEvents();
        await _refreshLobby();
        showScreen('online-lobby');
        document.getElementById('lobby-my-name').textContent = `Xin chào, ${nick}`;
      } else {
        if (errEl) errEl.textContent = res.error || 'Tên đã được dùng! Hãy chọn tên khác.';
      }
    } catch (e) {
      if (errEl) errEl.textContent = 'Không thể kết nối server. Hãy đảm bảo server đang chạy.';
    }
  }

  function _setupOnlineEvents() {
    OnlineManager.on('lobby_update', (players) => {
      _renderLobbyPlayers(players);
    });

    OnlineManager.on('invite_received', (data) => {
      _showInvitePopup(data);
    });

    OnlineManager.on('invite_declined', (data) => {
      _showToast(`${data.nickname} đã từ chối lời mời!`);
    });

    OnlineManager.on('match_start', (data) => {
      onlineData.matchData = data;
      const myNick = OnlineManager.getMyNickname();
      const isHost = data.hostNickname === myNick;
      onlineData.isFirst = isHost ? data.firstPick === myNick : data.firstPick === myNick;
      onlineData.opponentChar = null;
      _startOnlineCharSelect(data);
    });

    OnlineManager.on('opponent_disconnect', () => {
      _showToast('Đối thủ đã ngắt kết nối!');
      setTimeout(() => showScreen('online-lobby'), 2000);
    });
  }

  async function _refreshLobby() {
    const players = await OnlineManager.getLobby();
    _renderLobbyPlayers(players);
  }

  function _renderLobbyPlayers(players) {
    const list = document.getElementById('lobby-player-list');
    if (!list) return;
    list.innerHTML = '';
    if (players.length === 0) {
      list.innerHTML = '<div class="lobby-empty">Không có người chơi nào trực tuyến</div>';
      return;
    }
    players.forEach(p => {
      const item = document.createElement('div');
      item.className = 'lobby-player-item';
      item.innerHTML = `
        <span class="player-nick">${p.nickname}</span>
        <span class="player-status ${p.status}">${p.status === 'idle' ? 'Sẵn sàng' : 'Đang chơi'}</span>
        ${p.status === 'idle' ? `<button class="btn-invite-player" data-id="${p.id}">Mời</button>` : ''}
      `;
      const inviteBtn = item.querySelector('.btn-invite-player');
      if (inviteBtn) {
        inviteBtn.addEventListener('click', () => _sendInviteTo(p.id, p.nickname));
      }
      list.appendChild(item);
    });
  }

  function _searchLobby() {
    const query = document.getElementById('lobby-search-input')?.value.trim().toLowerCase();
    const items = document.querySelectorAll('.lobby-player-item');
    items.forEach(item => {
      const nick = item.querySelector('.player-nick')?.textContent.toLowerCase() || '';
      item.style.display = nick.includes(query) ? '' : 'none';
    });
  }

  async function _sendInviteTo(targetId, targetNick) {
    _showToast(`Đã gửi lời mời cho ${targetNick}...`);
    const res = await OnlineManager.sendInvite(targetId);
    if (!res.success) _showToast(res.error || 'Không thể gửi lời mời');
  }

  function _showInvitePopup(data) {
    const popup = document.getElementById('invite-popup');
    if (!popup) return;
    document.getElementById('invite-from-name').textContent = data.nickname;
    popup.classList.add('visible');

    document.getElementById('btn-invite-accept').onclick = () => {
      popup.classList.remove('visible');
      OnlineManager.respondToInvite(data.fromId, true, null);
    };
    document.getElementById('btn-invite-decline').onclick = () => {
      popup.classList.remove('visible');
      OnlineManager.respondToInvite(data.fromId, false, null);
    };
  }

  function _startOnlineCharSelect(matchData) {
    // Mark locked chars
    const myNick = OnlineManager.getMyNickname();
    const amFirstPick = matchData.firstPick === myNick;

    document.getElementById('online-char-select-title').textContent =
      amFirstPick ? 'Bạn chọn trước!' : 'Đang chờ đối thủ chọn...';

    document.querySelectorAll('#online-char-select-grid .char-card').forEach(c => {
      c.classList.remove('selected', 'locked');
      c.style.pointerEvents = amFirstPick ? 'auto' : 'none';
    });

    OnlineManager.on('game_state', (state) => {
      if (state.type === 'char_select') {
        // Lock opponent's char
        document.querySelectorAll('#online-char-select-grid .char-card').forEach(c => {
          if (c.dataset.charId === state.characterId) c.classList.add('locked');
        });
        onlineData.opponentChar = state.characterId;
        document.getElementById('online-char-select-title').textContent = 'Bây giờ bạn chọn!';
        document.querySelectorAll('#online-char-select-grid .char-card').forEach(c => {
          if (!c.classList.contains('locked')) c.style.pointerEvents = 'auto';
        });
      }
    });

    showScreen('online-char-select');
  }

  function _selectOnlineChar(charId) {
    document.querySelectorAll('#online-char-select-grid .char-card').forEach(c => {
      if (!c.classList.contains('locked')) c.classList.toggle('selected', c.dataset.charId === charId);
    });
    onlineData.myChar = charId;
    document.getElementById('btn-online-char-confirm').disabled = false;
  }

  function _confirmOnlineCharSelect() {
    if (!onlineData.myChar) return;
    OnlineManager.sendCharacterSelect(onlineData.myChar);
    p1Char = onlineData.myChar;
    p2Char = onlineData.opponentChar;
    if (p1Char && p2Char) _launchGame();
    else _showToast('Đang chờ đối thủ chọn nhân vật...');
  }

  function _showToast(msg) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('visible');
    setTimeout(() => toast.classList.remove('visible'), 3000);
  }

  return { init };
})();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', App.init);
} else {
  App.init();
}
