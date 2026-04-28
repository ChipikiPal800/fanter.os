// multiplayer/client/multiplayer.js
const NETPLAY_SERVER = 'https://fanter-netplay.onrender.com';

let socket = null;
let currentUser = JSON.parse(localStorage.getItem('fanter_currentUser') || '{"username":"Guest"}');
let currentRoomId = null;

// Initialize socket connection
function initSocket() {
    socket = io(NETPLAY_SERVER, {
        transports: ['websocket', 'polling']
    });
    
    socket.on('connect', () => {
        showStatus('✅ Connected to multiplayer server', '#4cd964');
        refreshRooms();
    });
    
    socket.on('disconnect', () => {
        showStatus('❌ Disconnected from multiplayer server', '#ff5e5e');
    });
    
    socket.on('rooms-list', (rooms) => {
        displayRooms(rooms);
    });
    
    socket.on('room-created', ({ roomId }) => {
        showStatus(`🎮 Room created! Code: ${roomId}`, '#ffcc66');
        currentRoomId = roomId;
        
        // Get selected game info
        const gameSelect = document.getElementById('gameSelect');
        const selectedValue = gameSelect.value;
        
        if (!selectedValue) {
            showStatus('❌ Please select a game', '#ff5e5e');
            return;
        }
        
        const [gameName, gameCore, romUrl] = selectedValue.split('|');
        
        // Open game window as HOST
        const gameWindow = window.open(`play.html?host=true&room=${roomId}&game=${encodeURIComponent(gameName)}&core=${gameCore}&rom=${encodeURIComponent(romUrl)}`, '_blank');
        
        if (!gameWindow) {
            showStatus('⚠️ Popup blocked! Allow popups for this site', '#ffcc66');
        }
    });
    
    socket.on('room-joined', ({ roomId, gameName, gameCore, romId, hostName }) => {
        showStatus(`✅ Joined ${gameName} hosted by ${hostName}`, '#4cd964');
        currentRoomId = roomId;
        
        // Open game window as GUEST
        const gameWindow = window.open(`play.html?host=false&room=${roomId}&game=${encodeURIComponent(gameName)}&core=${gameCore}&rom=${encodeURIComponent(romId)}`, '_blank');
        
        if (!gameWindow) {
            showStatus('⚠️ Popup blocked! Allow popups for this site', '#ffcc66');
        }
    });
    
    socket.on('join-error', (message) => {
        showStatus(`❌ ${message}`, '#ff5e5e');
    });
    
    socket.on('player-joined', ({ playerName }) => {
        showStatus(`👤 ${playerName} joined your game!`, '#ffcc66');
        refreshRooms();
    });
    
    socket.on('player-left', ({ playerId }) => {
        showStatus(`👋 A player left the game`, '#a0a0c0');
        refreshRooms();
    });
    
    socket.on('room-closed', ({ reason }) => {
        showStatus(`🚪 Game ended: ${reason}`, '#ff5e5e');
        currentRoomId = null;
        refreshRooms();
    });
    
    socket.on('become-host', ({ gameName, roomId }) => {
        showStatus(`👑 You are now the host!`, '#ffcc66');
        refreshRooms();
    });
    
    socket.on('room-update', ({ playerCount }) => {
        refreshRooms();
    });
}

// Display active rooms
function displayRooms(rooms) {
    const container = document.getElementById('roomsList');
    
    if (!rooms || rooms.length === 0) {
        container.innerHTML = '<div class="no-rooms">🎮 No active games. Host one to start!</div>';
        return;
    }
    
    container.innerHTML = rooms.map(room => `
        <div class="room-card" onclick="joinRoom('${room.roomId}')">
            <div class="room-game">🎮 ${escapeHtml(room.gameName)}</div>
            <div class="room-host">👤 Host: ${escapeHtml(room.hostName)}</div>
            <div class="room-players">👥 ${room.playerCount}/4 players</div>
        </div>
    `).join('');
}

// Host a game
function hostGame() {
    const gameSelect = document.getElementById('gameSelect');
    const selection = gameSelect.value;
    
    if (!selection) {
        showStatus('❌ Please select a game to host', '#ff5e5e');
        return;
    }
    
    if (!socket || !socket.connected) {
        showStatus('❌ Not connected to server', '#ff5e5e');
        return;
    }
    
    const [gameName, gameCore, romId] = selection.split('|');
    
    socket.emit('create-room', {
        gameName: gameName,
        playerName: currentUser.username,
        gameCore: gameCore,
        romId: romId
    });
}

// Join a room by ID
function joinRoom(roomId) {
    if (!socket || !socket.connected) {
        showStatus('❌ Not connected to server', '#ff5e5e');
        return;
    }
    
    socket.emit('join-room', {
        roomId: roomId,
        playerName: currentUser.username
    });
}

// Show join modal
function showJoinModal() {
    document.getElementById('joinModal').classList.add('show');
    document.getElementById('roomCodeInput').focus();
}

// Confirm join from modal
function confirmJoin() {
    const roomCode = document.getElementById('roomCodeInput').value.trim().toUpperCase();
    if (roomCode) {
        document.getElementById('joinModal').classList.remove('show');
        joinRoom(roomCode);
    } else {
        showStatus('❌ Please enter a room code', '#ff5e5e');
    }
}

// Share room code
function shareRoomCode() {
    if (!currentRoomId) {
        showStatus('❌ No active room to share', '#ff5e5e');
        return;
    }
    
    const shareText = `🎮 Join my game on fanterOS!\nRoom Code: ${currentRoomId}\n${window.location.href}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'fanterOS Multiplayer',
            text: `Join my game! Room code: ${currentRoomId}`,
            url: window.location.href
        }).catch(() => {
            prompt('Share this room code with your friend:', currentRoomId);
        });
    } else {
        prompt('Share this room code with your friend:', currentRoomId);
    }
}

// Show status message
function showStatus(message, color = '#a0a0c0') {
    const statusEl = document.getElementById('status');
    statusEl.innerHTML = message;
    statusEl.style.color = color;
    setTimeout(() => {
        if (statusEl.innerHTML === message) {
            statusEl.innerHTML = '';
        }
    }, 4000);
}

// Refresh rooms list
function refreshRooms() {
    if (socket && socket.connected) {
        socket.emit('get-rooms');
    }
}

// Escape HTML
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ===== GAME LIST - Updated with test GB ROM =====
const gameList = [
    { display: "🎮 Test Game Boy ROM", core: "gb", rom: "https://drive.usercontent.google.com/download?id=1Fz8tHIKaf0MCPEQQbZ2SFdhyU3cIfgRp&export=download" },
    { display: "🎲 Mario Party 3", core: "n64", rom: "https://drive.usercontent.google.com/download?id=YOUR_MP3_FILE_ID&export=download" },
    { display: "🏎️ Mario Kart 64", core: "n64", rom: "https://drive.usercontent.google.com/download?id=YOUR_MK64_FILE_ID&export=download" },
    { display: "👊 Super Smash Bros", core: "n64", rom: "https://drive.usercontent.google.com/download?id=YOUR_SSB_FILE_ID&export=download" },
    { display: "⚡ Pokémon Stadium", core: "n64", rom: "https://drive.usercontent.google.com/download?id=YOUR_PS_FILE_ID&export=download" },
    { display: "🏁 Diddy Kong Racing", core: "n64", rom: "https://drive.usercontent.google.com/download?id=YOUR_DKR_FILE_ID&export=download" },
    { display: "⭐ Super Mario 64", core: "n64", rom: "https://drive.usercontent.google.com/download?id=YOUR_SM64_FILE_ID&export=download" },
    { display: "🗡️ Zelda Ocarina of Time", core: "n64", rom: "https://drive.usercontent.google.com/download?id=YOUR_ZELDA_FILE_ID&export=download" },
    { display: "🦊 Star Fox 64", core: "n64", rom: "https://drive.usercontent.google.com/download?id=YOUR_STARFOX_FILE_ID&export=download" }
];

function populateGameSelect() {
    const select = document.getElementById('gameSelect');
    if (!select) return;
    
    select.innerHTML = '<option value="">Select a game...</option>';
    
    gameList.forEach(game => {
        const option = document.createElement('option');
        option.value = `${game.display}|${game.core}|${game.rom}`;
        option.textContent = game.display;
        select.appendChild(option);
    });
}

// ===== EVENT LISTENERS =====
document.getElementById('hostGameBtn').addEventListener('click', hostGame);
document.getElementById('confirmJoinBtn').addEventListener('click', confirmJoin);

// Close modal
const closeBtn = document.querySelector('.close');
if (closeBtn) {
    closeBtn.addEventListener('click', () => {
        document.getElementById('joinModal').classList.remove('show');
    });
}

// Click outside modal to close
document.getElementById('joinModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('joinModal')) {
        document.getElementById('joinModal').classList.remove('show');
    }
});

// Enter key in room code input
document.getElementById('roomCodeInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        confirmJoin();
    }
});

// Auto-refresh rooms every 5 seconds
setInterval(refreshRooms, 5000);

// Initialize
populateGameSelect();
initSocket();
