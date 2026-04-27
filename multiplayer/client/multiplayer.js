// multiplayer/client/multiplayer.js
const NETPLAY_SERVER = 'https://your-netplay-server.onrender.com'; // Replace with your Render URL

let socket = null;
let currentUser = JSON.parse(localStorage.getItem('fanter_currentUser') || '{"username":"Guest"}');

// Initialize socket connection
function initSocket() {
    socket = io(NETPLAY_SERVER);
    
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
        promptShareRoom(roomId);
    });
    
    socket.on('room-joined', ({ roomId, gameName, gameCore, romId, hostName }) => {
        showStatus(`✅ Joined ${gameName} hosted by ${hostName}`, '#4cd964');
        startEmulatorStream(gameName, gameCore, romId, roomId, false);
    });
    
    socket.on('player-joined', ({ playerName }) => {
        showStatus(`👤 ${playerName} joined your game!`, '#ffcc66');
    });
    
    socket.on('player-left', () => {
        showStatus(`👋 A player left the game`, '#a0a0c0');
    });
    
    socket.on('room-closed', ({ reason }) => {
        showStatus(`🚪 Game ended: ${reason}`, '#ff5e5e');
        closeEmulator();
    });
    
    socket.on('join-error', (message) => {
        showStatus(`❌ ${message}`, '#ff5e5e');
    });
    
    socket.on('signal', ({ signal, from }) => {
        // Handle WebRTC signaling (for video stream and controller sync)
        handleSignaling(signal, from);
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
            <div class="room-game">🎮 ${room.gameName}</div>
            <div class="room-host">👤 Host: ${room.hostName}</div>
            <div class="room-players">👥 ${room.playerCount} player(s)</div>
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
    
    const [gameName, gameCore, romId] = selection.split('|');
    
    socket.emit('create-room', {
        gameName,
        gameCore,
        romId,
        playerName: currentUser.username
    });
}

// Join a room
function joinRoom(roomId) {
    socket.emit('join-room', {
        roomId,
        playerName: currentUser.username
    });
}

// Show join modal
function showJoinModal() {
    document.getElementById('joinModal').classList.add('show');
}

// Confirm join from modal
function confirmJoin() {
    const roomCode = document.getElementById('roomCodeInput').value.trim().toUpperCase();
    if (roomCode) {
        document.getElementById('joinModal').classList.remove('show');
        joinRoom(roomCode);
    }
}

// Share room code
function promptShareRoom(roomId) {
    const shareMessage = `🎮 Join my game on fanterOS!\nRoom Code: ${roomId}\n${window.location.href}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'fanterOS Multiplayer',
            text: `Join my game! Room code: ${roomId}`,
            url: window.location.href
        });
    } else {
        prompt('Share this room code with your friend:', roomId);
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
    }, 3000);
}

// Start emulator with stream support
function startEmulatorStream(gameName, gameCore, romId, roomId, isHost) {
    // This will launch the emulator with WebRTC stream
    // We'll use EmulatorJS with netplay configuratin
    window.open(`/emulator.html?game=${gameName}&core=${gameCore}&rom=${romId}&room=${roomId}&host=${isHost}`, '_blank');
}

// Handle WebRTC signaling
function handleSignaling(signal, from) {
    // WebRTC logic will go here when we set up the stream
    console.log('Signal received from:', from, signal);
}

// Refresh rooms list
function refreshRooms() {
    if (socket) {
        socket.emit('get-rooms');
    }
}

// Event listeners
document.getElementById('hostGameBtn').addEventListener('click', hostGame);
document.getElementById('confirmJoinBtn').addEventListener('click', confirmJoin);

// Close modal
document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('joinModal').classList.remove('show');
});

// Auto-refresh rooms every 5 seconds
setInterval(refreshRooms, 5000);

// Initialize
initSocket();
