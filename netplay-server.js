// multiplayer/server/netplay-server.js
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Store active rooms
const rooms = new Map();

io.on('connection', (socket) => {
    console.log('🎮 Player connected:', socket.id);
    
    // Create a new game room
    socket.on('create-room', ({ gameName, playerName, gameCore, romId }) => {
        const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
        rooms.set(roomId, {
            gameName,
            gameCore,
            romId,
            host: socket.id,
            hostName: playerName,
            players: [{ id: socket.id, name: playerName, isHost: true }],
            createdAt: Date.now()
        });
        socket.join(roomId);
        socket.emit('room-created', { roomId });
        console.log(`✅ Room created: ${roomId} for ${gameName} by ${playerName}`);
    });
    
    // Join an existing room
    socket.on('join-room', ({ roomId, playerName }) => {
        const room = rooms.get(roomId);
        if (!room) {
            socket.emit('join-error', 'Room not found or game already started');
            return;
        }
        
        socket.join(roomId);
        room.players.push({ id: socket.id, name: playerName, isHost: false });
        rooms.set(roomId, room);
        
        // Notify host that someone joined
        io.to(room.host).emit('player-joined', { playerName, playerId: socket.id });
        
        // Send room info to joining player
        socket.emit('room-joined', { 
            roomId, 
            gameName: room.gameName,
            gameCore: room.gameCore,
            romId: room.romId,
            hostName: room.hostName,
            isHost: false
        });
        
        console.log(`👤 ${playerName} joined room ${roomId}`);
    });
    
    // WebRTC signaling (for video strem and controller inputs)
    socket.on('signal', ({ roomId, signal, to }) => {
        if (to) {
            io.to(to).emit('signal', { signal, from: socket.id });
        } else {
            socket.to(roomId).emit('signal', { signal, from: socket.id });
        }
    });
    
    // Controller input from guest to host
    socket.on('controller-input', ({ roomId, input }) => {
        const room = rooms.get(roomId);
        if (room && room.host === socket.id) {
            // Host is sending their own inputs (not needed, emulator captures directly)
            return;
        }
        if (room && room.host) {
            io.to(room.host).emit('controller-input', { input, playerId: socket.id });
        }
    });
    
    // Leave room
    socket.on('leave-room', ({ roomId }) => {
        const room = rooms.get(roomId);
        if (room) {
            const wasHost = room.host === socket.id;
            room.players = room.players.filter(p => p.id !== socket.id);
            
            if (room.players.length === 0 || wasHost) {
                rooms.delete(roomId);
                console.log(`🗑️ Room deleted: ${roomId}`);
                io.to(roomId).emit('room-closed', { reason: wasHost ? 'Host left' : 'All players left' });
            } else {
                rooms.set(roomId, room);
                io.to(room.host).emit('player-left', { playerId: socket.id });
            }
        }
        socket.leave(roomId);
        console.log(`👋 Player left room: ${roomId}`);
    });
    
    // Get list of active rooms
    socket.on('get-rooms', () => {
        const activeRooms = Array.from(rooms.entries()).map(([id, room]) => ({
            roomId: id,
            gameName: room.gameName,
            hostName: room.hostName,
            playerCount: room.players.length,
            createdAt: room.createdAt
        }));
        socket.emit('rooms-list', activeRooms);
    });
    
    // Handle disconnect
    socket.on('disconnect', () => {
        console.log('🔌 Player disconnected:', socket.id);
        // Clean up rooms where this socket was a player
        for (const [roomId, room] of rooms.entries()) {
            if (room.players.some(p => p.id === socket.id)) {
                const wasHost = room.host === socket.id;
                room.players = room.players.filter(p => p.id !== socket.id);
                
                if (room.players.length === 0 || wasHost) {
                    rooms.delete(roomId);
                    console.log(`🗑️ Room deleted (disconnect): ${roomId}`);
                    io.to(roomId).emit('room-closed', { reason: wasHost ? 'Host disconnected' : 'All players left' });
                } else {
                    rooms.set(roomId, room);
                    io.to(room.host).emit('player-left', { playerId: socket.id });
                }
            }
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(` 67
   
    `);
});
