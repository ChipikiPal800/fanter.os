// multiplayer/client/streaming.js
// WebRTC streaming for netplay

class NetplayStream {
    constructor(serverUrl, roomId, isHost, gameName, gameCore, romUrl) {
        this.serverUrl = serverUrl;
        this.roomId = roomId;
        this.isHost = isHost;
        this.gameName = gameName;
        this.gameCore = gameCore;
        this.romUrl = romUrl;
        
        this.socket = null;
        this.peerConnection = null;
        this.mediaStream = null;
        this.dataChannel = null;
        this.emulatorElement = null;
        
        // STUN servers for NAT traversal
        this.configuration = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' },
                { urls: 'stun:stun3.l.google.com:19302' },
                { urls: 'stun:stun4.l.google.com:19302' }
            ]
        };
    }
    
    async start() {
        await this.connectToServer();
        
        if (this.isHost) {
            await this.initHost();
        } else {
            await this.initGuest();
        }
    }
    
    connectToServer() {
        return new Promise((resolve) => {
            this.socket = io(this.serverUrl);
            
            this.socket.on('connect', () => {
                console.log('Connected to netplay server');
                
                if (this.isHost) {
                    this.socket.emit('create-room', {
                        gameName: this.gameName,
                        playerName: localStorage.getItem('fanter_username') || 'Player',
                        gameCore: this.gameCore,
                        romId: this.romUrl
                    });
                } else {
                    this.socket.emit('join-room', {
                        roomId: this.roomId,
                        playerName: localStorage.getItem('fanter_username') || 'Player'
                    });
                }
                resolve();
            });
            
            this.socket.on('room-created', (data) => {
                this.roomId = data.roomId;
                this.onRoomCreated?.(this.roomId);
            });
            
            this.socket.on('room-joined', async (data) => {
                this.gameName = data.gameName;
                this.gameCore = data.gameCore;
                this.romUrl = data.romId;
                await this.initGuest();
                this.onGameJoined?.();
            });
            
            this.socket.on('signal', async ({ signal, from }) => {
                await this.peerConnection.setRemoteDescription(new RTCSessionDescription(signal));
                if (signal.type === 'offer') {
                    const answer = await this.peerConnection.createAnswer();
                    await this.peerConnection.setLocalDescription(answer);
                    this.socket.emit('signal', { roomId: this.roomId, signal: answer, to: from });
                }
            });
        });
    }
    
    async initHost() {
        // Create peer connection
        this.peerConnection = new RTCPeerConnection(this.configuration);
        
        // Create data channel for controller inputs
        this.dataChannel = this.peerConnection.createDataChannel('controller');
        this.dataChannel.onmessage = (event) => {
            const input = JSON.parse(event.data);
            this.onControllerInput?.(input);
        };
        
        // Capture emulator canvas stream
        this.emulatorElement = document.getElementById('gameCanvas');
        if (this.emulatorElement && this.emulatorElement.captureStream) {
            this.mediaStream = this.emulatorElement.captureStream(30); // 30 FPS
            this.mediaStream.getTracks().forEach(track => {
                this.peerConnection.addTrack(track, this.mediaStream);
            });
        }
        
        // Handle ICE candidates
        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                this.socket.emit('signal', {
                    roomId: this.roomId,
                    signal: { type: 'candidate', candidate: event.candidate }
                });
            }
        };
        
        // Create offer
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);
        this.socket.emit('signal', { roomId: this.roomId, signal: offer });
        
        // Setup controller capture
        this.setupControllerCapture();
    }
    
    async initGuest() {
        // Create peer connection
        this.peerConnection = new RTCPeerConnection(this.configuration);
        
        // Handle incoming tracks (video stream)
        this.peerConnection.ontrack = (event) => {
            const videoElement = document.getElementById('gameStream');
            if (videoElement && event.streams[0]) {
                videoElement.srcObject = event.streams[0];
                videoElement.play();
            }
            this.onStreamStarted?.();
        };
        
        // Handle data channel
        this.peerConnection.ondatachannel = (event) => {
            this.dataChannel = event.channel;
            this.dataChannel.onmessage = (msg) => {
                // Host might send game state updates here
                console.log('Received data:', msg.data);
            };
        };
        
        // Handle ICE candidates
        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                this.socket.emit('signal', {
                    roomId: this.roomId,
                    signal: { type: 'candidate', candidate: event.candidate }
                });
            }
        };
        
        // Setup controller capture (guest sends inputs to host)
        this.setupControllerCapture();
    }
    
    setupControllerCapture() {
        // Capture keyboard inputs
        const keyMap = {
            'ArrowUp': 'up', 'ArrowDown': 'down', 'ArrowLeft': 'left', 'ArrowRight': 'right',
            'z': 'b', 'Z': 'b', 'x': 'a', 'X': 'a', 'a': 'y', 'A': 'y', 's': 'x', 'S': 'x',
            'q': 'l', 'Q': 'l', 'w': 'r', 'W': 'r', 'Enter': 'start', 'Shift': 'select'
        };
        
        const sendInput = (input, pressed) => {
            if (this.dataChannel && this.dataChannel.readyState === 'open') {
                this.dataChannel.send(JSON.stringify({ [input]: pressed }));
            }
        };
        
        document.addEventListener('keydown', (e) => {
            const mapped = keyMap[e.key];
            if (mapped) {
                e.preventDefault();
                sendInput(mapped, true);
            }
        });
        
        document.addEventListener('keyup', (e) => {
            const mapped = keyMap[e.key];
            if (mapped) {
                e.preventDefault();
                sendInput(mapped, false);
            }
        });
        
        // Touch controls for mobile
        const buttons = ['up', 'down', 'left', 'right', 'a', 'b', 'x', 'y', 'l', 'r', 'start', 'select'];
        buttons.forEach(btn => {
            const el = document.getElementById(`btn-${btn}`);
            if (el) {
                el.addEventListener('touchstart', () => sendInput(btn, true));
                el.addEventListener('touchend', () => sendInput(btn, false));
                el.addEventListener('mousedown', () => sendInput(btn, true));
                el.addEventListener('mouseup', () => sendInput(btn, false));
            }
        });
    }
    
    sendControllerInput(input) {
        if (this.dataChannel && this.dataChannel.readyState === 'open') {
            this.dataChannel.send(JSON.stringify(input));
        }
    }
    
    onRoomCreated(callback) {
        this.onRoomCreated = callback;
    }
    
    onGameJoined(callback) {
        this.onGameJoined = callback;
    }
    
    onControllerInput(callback) {
        this.onControllerInput = callback;
    }
    
    onStreamStarted(callback) {
        this.onStreamStarted = callback;
    }
    
    disconnect() {
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
        }
        if (this.peerConnection) {
            this.peerConnection.close();
        }
        if (this.socket) {
            this.socket.disconnect();
        }
    }
}
