// functions and core os here


// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    initFanterOS();
});

function initFanterOS() {
    // ===== GLOBAL VARIABLES =====
    window.windows = [];
    window.nextWindowId = 1;
    window.activeWindowId = null;
    window.startMenuOpen = false;
    window.bootMenuOpen = false;
    window.currentBootResults = [];
    window.selectedBootIndex = -1;
    window.resizeData = null;
    window.pinnedApps = JSON.parse(localStorage.getItem('pinnedApps') || '[]');
    window.recentApps = JSON.parse(localStorage.getItem('recentApps') || '[]');
    window.soundEnabled = localStorage.getItem('soundEnabled') !== 'false';
    window.soundVolume = parseInt(localStorage.getItem('soundVolume') || '100');
    window.currentCategory = 'all';
    window.currentSearchTerm = '';
    window.isMarqueeSelecting = false;
    window.marqueeStartX = 0;
    window.marqueeStartY = 0;
    window.selectedIcons = [];
    window.GAMES_DATA = [];
    window.gamePlayTime = JSON.parse(localStorage.getItem('gamePlayTime') || '{}');
    window.achievements = JSON.parse(localStorage.getItem('fanter_achievements') || '{}');

    // ===== ICON URLS =====
    window.ICON_URLS = {
        gamehub: 'https://png.pngtree.com/png-clipart/20200224/original/pngtree-game-control-line-icon-vector-png-image_5209084.jpg',
        emulators: 'https://cdn-icons-png.flaticon.com/512/3659/3659892.png',
        fantersearch: 'https://cdn-icons-png.flaticon.com/512/2811/2811806.png',
        fantarena: 'https://www.clipartmax.com/png/middle/213-2137325_chat-service-icon-transparent-png-chat-app-icon-png.png',
        flashgames: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRyT2jnbsFTNI1TsyzRqTvixcENBsmsN8nknw&s',
        tetris: 'https://tetris.wiki/images/thumb/5/52/Tetris_%28N3TWORK%29_icon.png/220px-Tetris_%28N3TWORK%29_icon.png',
        solitaire: 'https://play-lh.googleusercontent.com/1ywLh7-1RvXuE40IcxXL3vU4LhdkcopUOxJrrZjRlyZX-b_4zgXd2Hc5EyyWwmfruns',
        minesweeper: 'https://p1.hiclipart.com/preview/249/974/567/red-circle-minesweeper-minesweeper-deluxe-minesweeper-adfree-video-games-land-mine-naval-mine-android-png-clipart.jpg',
        appstore: 'https://cdn-icons-png.flaticon.com/512/1045/1045274.png',
        settings: 'https://cdn-icons-png.flaticon.com/512/892/892775.png'
    };

    // ===== DESKTOP ICONS =====
    window.DESKTOP_ICONS_LEFT = [
        { id: 'gamehub', name: 'Game Hub', icon: '🎮', iconUrl: window.ICON_URLS.gamehub, category: 'games' },
        { id: 'emulators', name: 'Emulators', icon: '🕹️', iconUrl: window.ICON_URLS.emulators, category: 'games' },
        { id: 'fantersearch', name: 'Fanter Search', icon: '🔍', iconUrl: window.ICON_URLS.fantersearch, category: 'tools', url: 'https://chipikipal800.github.io/Fanter-search/', external: true },
        { id: 'settings', name: 'Settings', icon: '⚙️', iconUrl: window.ICON_URLS.settings, category: 'system', url: 'settings.html' }
    ];

    window.DESKTOP_ICONS_RIGHT = [
        { id: 'tetris', name: 'Tetris', icon: '🧩', iconUrl: window.ICON_URLS.tetris, category: 'games', url: 'https://chipikipal800.github.io/Tetris/Tetris.htm', external: true },
        { id: 'solitaire', name: 'Solitaire', icon: '🃏', iconUrl: window.ICON_URLS.solitaire, category: 'games', url: 'https://chipikipal800.github.io/SolitareGame/', external: true },
        { id: 'minesweeper', name: 'Minesweeper', icon: '💣', iconUrl: window.ICON_URLS.minesweeper, category: 'games', url: 'https://chipikipal800.github.io/minesweepere/', external: true },
        { id: 'appstore', name: 'FantAppStore', icon: '📦', iconUrl: window.ICON_URLS.appstore, category: 'system', builtin: true }
    ];

    // ===== ALL APPS =====
    window.ALL_APPS = [
        { id: 'gamehub', name: 'Game Hub', icon: '🎮', iconUrl: window.ICON_URLS.gamehub, category: 'games', builtin: true },
        { id: 'emulators', name: 'Emulators', icon: '🕹️', iconUrl: window.ICON_URLS.emulators, category: 'games', builtin: true },
        { id: 'fantersearch', name: 'Fanter Search', icon: '🔍', iconUrl: window.ICON_URLS.fantersearch, category: 'tools', builtin: true, url: 'https://chipikipal800.github.io/Fanter-search/', external: true },
        { id: 'appstore', name: 'FantAppStore', icon: '📦', iconUrl: window.ICON_URLS.appstore, category: 'system', builtin: true },
        { id: 'flashgames', name: 'Flash Games', icon: '⚡', iconUrl: window.ICON_URLS.flashgames, category: 'games', builtin: false, url: 'https://chipikipal800.github.io/flash-games/list.html', external: true },
        { id: 'fantarena', name: 'fantarena', icon: '🏟️', iconUrl: window.ICON_URLS.fantarena, category: 'social', builtin: false, url: 'fantarena.html' },
        { id: 'tetris', name: 'Tetris', icon: '🧩', iconUrl: window.ICON_URLS.tetris, url: 'https://chipikipal800.github.io/Tetris/Tetris.htm', category: 'games', external: true },
        { id: 'solitaire', name: 'Solitaire', icon: '🃏', iconUrl: window.ICON_URLS.solitaire, url: 'https://chipikipal800.github.io/SolitareGame/', category: 'games', external: true },
        { id: 'minesweeper', name: 'Minesweeper', icon: '💣', iconUrl: window.ICON_URLS.minesweeper, url: 'https://chipikipal800.github.io/minesweepere/', category: 'games', external: true },
        { id: 'calculator', name: 'Calculator', icon: '🧮', category: 'tools', appType: 'calculator' },
        { id: 'thefactory', name: 'The Factory', icon: '🏭', category: 'tools', appType: 'factory' },
        { id: 'thestudio', name: 'The Studio', icon: '🎨', category: 'creative', appType: 'studio' },
        { id: 'weather', name: 'Weather', icon: '🌤️', category: 'tools', appType: 'weather' },
        { id: 'notes', name: 'Notes', icon: '📋', category: 'tools', appType: 'notes' },
        { id: 'timer', name: 'Timer', icon: '⏱️', category: 'tools', appType: 'timer' },
        { id: 'tasks', name: 'Tasks', icon: '✅', category: 'tools', appType: 'tasks' },
        { id: 'whiteboard', name: 'Whiteboard', icon: '✏️', category: 'creative', appType: 'whiteboard' },
        { id: 'settings', name: 'Settings', icon: '⚙️', iconUrl: window.ICON_URLS.settings, category: 'system', url: 'settings.html' },
        { id: 'shop', name: 'Shop', icon: '🛒', category: 'system', url: 'shop.html' },
        { id: 'account', name: 'Account', icon: '👤', category: 'system', url: 'fantaccount.html' },
        { id: 'stealth', name: 'Stealth', icon: '🕵️', category: 'tools', appType: 'stealth' }
    ];

    // ===== STORE APPS =====
    window.STORE_APPS = [
        { id: 'flashgames', name: 'Flash Games', icon: '⚡', iconUrl: window.ICON_URLS.flashgames, category: 'games', description: '264 classic flash games - Bloons, Fancy Pants, Riddle School, and more!', creator: 'abcatlmfao', url: 'https://chipikipal800.github.io/flash-games/list.html' },
        { id: 'fantarena', name: 'Fantarena', icon: '🏟️', iconUrl: window.ICON_URLS.fantarena, category: 'social', description: 'Chat with friends in real-time! Join channels, send messages, and make groups.', creator: 'abcatlmfao', url: 'fantarena.html' }
    ];

    window.installedApps = JSON.parse(localStorage.getItem('installedApps') || '[]');

    // ===== HELPER FUNCTIONS =====
    function showToast(msg) {
        const toast = document.getElementById('toast');
        if (!toast) return;
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2500);
    }

    function showToastLarge(msg) {
        const toast = document.getElementById('toastLarge');
        if (!toast) return;
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }

    function playSound(type) {
        if (!window.soundEnabled) return;
        try {
            if (!window.audioCtx) window.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = window.audioCtx.createOscillator();
            const gain = window.audioCtx.createGain();
            osc.connect(gain);
            gain.connect(window.audioCtx.destination);
            osc.type = 'sine';
            gain.gain.value = window.soundVolume / 100 * 0.2;
            if (type === 'click') { 
                osc.frequency.value = 880; 
                gain.gain.exponentialRampToValueAtTime(0.00001, window.audioCtx.currentTime + 0.15); 
            } else if (type === 'open') { 
                osc.frequency.value = 523.25; 
                gain.gain.exponentialRampToValueAtTime(0.00001, window.audioCtx.currentTime + 0.25); 
            } else if (type === 'close') { 
                osc.frequency.value = 261.63; 
                gain.gain.exponentialRampToValueAtTime(0.00001, window.audioCtx.currentTime + 0.2); 
            }
            osc.start();
            osc.stop(window.audioCtx.currentTime + 0.2);
        } catch(e) {}
    }

    function updateRecentApps(appId, appName, appIcon, appIconId) {
        window.recentApps = [{ id: appId, name: appName, icon: appIcon, iconId: appIconId }, ...window.recentApps.filter(a => a.id !== appId)].slice(0, 5);
        localStorage.setItem('recentApps', JSON.stringify(window.recentApps));
        renderRecentApps();
    }

    function renderRecentApps() {
        const container = document.getElementById('recentAppsList');
        if (!container) return;
        container.innerHTML = window.recentApps.map(app => `
            <div class="recent-app-item" data-id="${app.id}">
                <div class="recent-app-icon">${window.ICON_URLS[app.iconId] ? `<img src="${window.ICON_URLS[app.iconId]}" onerror="this.style.display='none';this.parentElement.innerHTML='${app.icon}'">` : app.icon}</div>
                <div class="recent-app-name">${app.name.length > 8 ? app.name.slice(0,6)+'..' : app.name}</div>
            </div>
        `).join('');
        container.querySelectorAll('.recent-app-item').forEach(el => {
            el.addEventListener('click', () => {
                const app = window.ALL_APPS.find(a => a.id === el.dataset.id);
                if (app) launchApp(app);
                playSound('click');
            });
        });
    }

    function updateClock() {
        const now = new Date();
        const timeEl = document.getElementById('taskbarTime');
        const dateEl = document.getElementById('taskbarDate');
        const widgetTimeEl = document.getElementById('widgetTime');
        const widgetDateEl = document.getElementById('widgetDate');
        const calendarDayEl = document.getElementById('calendarDay');
        const calendarMonthEl = document.getElementById('calendarMonth');
        
        if (timeEl) timeEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (dateEl) dateEl.textContent = now.toLocaleDateString([], { month: 'short', day: 'numeric' });
        if (widgetTimeEl) widgetTimeEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (widgetDateEl) widgetDateEl.textContent = now.toLocaleDateString([], { month: 'short', day: 'numeric' });
        if (calendarDayEl) calendarDayEl.textContent = now.getDate();
        if (calendarMonthEl) {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            calendarMonthEl.textContent = months[now.getMonth()];
        }
    }

    async function updateBattery() {
        if ('getBattery' in navigator) {
            try {
                const battery = await navigator.getBattery();
                const levelEl = document.getElementById('batteryLevel');
                const statusEl = document.getElementById('batteryStatus');
                if (levelEl) levelEl.textContent = `${Math.round(battery.level * 100)}%`;
                if (statusEl) statusEl.textContent = battery.charging ? 'Charging ⚡' : 'Discharging';
            } catch(e) {}
        } else {
            const levelEl = document.getElementById('batteryLevel');
            const statusEl = document.getElementById('batteryStatus');
            if (levelEl) levelEl.textContent = 'N/A';
            if (statusEl) statusEl.textContent = 'N/A';
        }
    }

    async function updateWeather() {
        try {
            const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=40.7128&longitude=-74.0060&current_weather=true&temperature_unit=fahrenheit');
            const data = await res.json();
            if (data.current_weather) {
                const tempEl = document.getElementById('weatherTemp');
                const condEl = document.getElementById('weatherCondition');
                if (tempEl) tempEl.textContent = `${Math.round(data.current_weather.temperature)}°F`;
                if (condEl) condEl.textContent = data.current_weather.weathercode === 0 ? 'Clear' : 'Cloudy';
            }
        } catch(e) {}
    }

    async function loadGames() {
        try {
            const res = await fetch('./config/games.json');
            let text = await res.text();
            text = text.replace(/,(\s*}\s*)\]/g, '$1]').replace(/,\s*\]/, ']');
            window.GAMES_DATA = JSON.parse(text);
            console.log(`Loaded ${window.GAMES_DATA.length} games`);
        } catch(e) {
            console.warn('No games.json, using fallback');
            window.GAMES_DATA = [];
        }
    }

    function showGameDetails(game) {
        playSound('click');
        const modal = document.getElementById('gameModal');
        const content = document.getElementById('gameModalContent');
        if (!modal || !content) return;
        
        content.innerHTML = `
            <div style="position:relative;">
                <button class="close-modal" onclick="document.getElementById('gameModal').classList.remove('open')">✕</button>
                <div class="game-modal-header">
                    <img src="${game.image}">
                    <div class="overlay">
                        <h2>${game.name}</h2>
                        <span class="tag">${game.category}</span>
                    </div>
                </div>
                <div class="game-modal-body">
                    <div class="game-modal-left">
                        <div class="game-description">${game.desc || 'No description'}</div>
                        <div class="game-info-row"><span>⏱️ Played: ${Math.floor(window.gamePlayTime[game.name] || 0)}h</span></div>
                        <button class="game-play-btn" id="playGameBtn">🎮 PLAY NOW</button>
                    </div>
                    <div class="game-modal-right">
                        <div class="game-info-row"><span>Developer</span><span>${game.developer || 'Unknown'}</span></div>
                        <div class="game-info-row"><span>Release</span><span>${game.releaseDate || 'Unknown'}</span></div>
                        <div class="game-info-row"><span>Category</span><span>${game.category}</span></div>
                    </div>
                </div>
            </div>
        `;
        modal.classList.add('open');
        const playBtn = document.getElementById('playGameBtn');
        if (playBtn) {
            playBtn.onclick = () => {
                window.location.href = game.url;
                modal.classList.remove('open');
                window.gamePlayTime[game.name] = (window.gamePlayTime[game.name] || 0) + 0.5;
                localStorage.setItem('gamePlayTime', JSON.stringify(window.gamePlayTime));
                playSound('click');
            };
        }
    }

    function loadSavedWallpaper() {
        const savedWallpaper = localStorage.getItem('fanter_wallpaper');
        const customWallpaper = localStorage.getItem('fanter_wallpaper_custom');
        const bgDiv = document.getElementById('desktopBg');
        if (!bgDiv) return;
        
        if (customWallpaper) {
            bgDiv.style.backgroundImage = `url(${customWallpaper})`;
            bgDiv.className = 'desktop-bg';
        } else if (savedWallpaper) {
            bgDiv.className = 'desktop-bg';
            bgDiv.classList.add(`wallpaper-${savedWallpaper}`);
        } else {
            bgDiv.className = 'desktop-bg wallpaper-solace';
        }
    }

    function setWallpaper(type) {
        const bgDiv = document.getElementById('desktopBg');
        if (!bgDiv) return;
        bgDiv.className = 'desktop-bg';
        bgDiv.classList.add(`wallpaper-${type}`);
        localStorage.setItem('fanter_wallpaper', type);
        localStorage.removeItem('fanter_wallpaper_custom');
        showToast('Wallpaper changed!');
        playSound('click');
    }

    function uploadWallpaper() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    const bgDiv = document.getElementById('desktopBg');
                    if (bgDiv) {
                        bgDiv.style.backgroundImage = `url(${ev.target.result})`;
                        bgDiv.className = 'desktop-bg';
                        localStorage.setItem('fanter_wallpaper_custom', ev.target.result);
                        localStorage.removeItem('fanter_wallpaper');
                        showToast('Wallpaper changed!');
                        playSound('click');
                    }
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    }

    function showShortcuts() {
        alert(`⌨️ KEYBOARD SHORTCUTS\n\nCtrl+K → Quick launch / search games\nCtrl+W → Close active window\nCtrl+M → Minimize active window\nCtrl+/ → Show this menu\nEsc → Close menus / Exit fullscreen\n\n🖱️ Right-click desktop → Wallpaper & Widgets\n🖱️ Double-click titlebar → Maximize window`);
    }

    function showAchievement(name, reward) {
        const popup = document.getElementById('achievementPopup');
        const nameEl = document.getElementById('achievementName');
        const rewardEl = document.getElementById('achievementReward');
        if (!popup || !nameEl || !rewardEl) return;
        
        nameEl.textContent = name;
        rewardEl.textContent = `+${reward} 🪙`;
        popup.classList.add('show');
        setTimeout(() => popup.classList.remove('show'), 4000);
        
        if (!window.achievements[name]) {
            window.achievements[name] = true;
            localStorage.setItem('fanter_achievements', JSON.stringify(window.achievements));
            const currentUser = JSON.parse(localStorage.getItem('fanter_currentUser') || 'null');
            if (currentUser) {
                currentUser.coins = (currentUser.coins || 0) + reward;
                localStorage.setItem('fanter_currentUser', JSON.stringify(currentUser));
            }
            playSound('click');
        }
    }

    function updateSoundIcon() {
        const iconSpan = document.getElementById('soundIcon');
        const volumeSpan = document.getElementById('soundVolume');
        if (!iconSpan || !volumeSpan) return;
        
        if (window.soundEnabled && window.soundVolume > 0) {
            iconSpan.textContent = '🔊';
            volumeSpan.textContent = `${window.soundVolume}%`;
        } else {
            iconSpan.textContent = '🔇';
            volumeSpan.textContent = 'Mute';
        }
    }

    function toggleSound() {
        window.soundEnabled = !window.soundEnabled;
        localStorage.setItem('soundEnabled', window.soundEnabled);
        updateSoundIcon();
        if (window.soundEnabled) playSound('click');
    }

    // ===== WINDOW MANAGEMENT =====
    function setupWindowEvents(win, id) {
        const header = win.querySelector('.window-header');
        const minBtn = win.querySelector('.window-control.minimize');
        const maxBtn = win.querySelector('.window-control.maximize');
        const closeBtn = win.querySelector('.window-control.close');
        
        win.addEventListener('mousedown', () => focusWindow(id));
        
        let drag = null;
        if (header) {
            header.addEventListener('mousedown', (e) => {
                if (e.target.closest('.window-controls')) return;
                drag = { x: e.clientX, y: e.clientY, left: parseInt(win.style.left), top: parseInt(win.style.top) };
                document.addEventListener('mousemove', onDrag);
                document.addEventListener('mouseup', stopDrag);
            });
        }
        
        function onDrag(e) {
            if (!drag) return;
            win.style.left = `${drag.left + (e.clientX - drag.x)}px`;
            win.style.top = `${drag.top + (e.clientY - drag.y)}px`;
        }
        
        function stopDrag() {
            drag = null;
            document.removeEventListener('mousemove', onDrag);
            document.removeEventListener('mouseup', stopDrag);
        }
        
        if (minBtn) minBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleMinimize(id); playSound('click'); });
        if (maxBtn) maxBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleMaximize(id); playSound('click'); });
        if (closeBtn) closeBtn.addEventListener('click', (e) => { e.stopPropagation(); closeWindowWithAnimation(id); playSound('close'); });
        if (header) header.addEventListener('dblclick', () => toggleMaximize(id));
    }

    function addResizeHandles(win, id) {
        const handles = ['n', 's', 'w', 'e', 'nw', 'ne', 'sw', 'se'];
        handles.forEach(dir => {
            const handle = document.createElement('div');
            handle.className = `resize-handle resize-${dir}`;
            win.appendChild(handle);
            handle.addEventListener('mousedown', (e) => {
                e.stopPropagation();
                const rect = win.getBoundingClientRect();
                window.resizeData = { id, dir, startX: e.clientX, startY: e.clientY, startW: rect.width, startH: rect.height, startL: rect.left, startT: rect.top };
                document.addEventListener('mousemove', onResize);
                document.addEventListener('mouseup', stopResize);
            });
        });
    }

    function onResize(e) {
        if (!window.resizeData) return;
        const dx = e.clientX - window.resizeData.startX;
        const dy = e.clientY - window.resizeData.startY;
        const win = window.windows.find(w => w.id === window.resizeData.id);
        if (!win || win.maximized) return;
        
        let newW = window.resizeData.startW, newH = window.resizeData.startH;
        let newL = window.resizeData.startL, newT = window.resizeData.startT;
        
        if (window.resizeData.dir.includes('e')) newW = Math.max(400, window.resizeData.startW + dx);
        if (window.resizeData.dir.includes('w')) { newW = Math.max(400, window.resizeData.startW - dx); newL = window.resizeData.startL + dx; }
        if (window.resizeData.dir.includes('s')) newH = Math.max(300, window.resizeData.startH + dy);
        if (window.resizeData.dir.includes('n')) { newH = Math.max(300, window.resizeData.startH - dy); newT = window.resizeData.startT + dy; }
        
        win.element.style.width = `${newW}px`;
        win.element.style.height = `${newH}px`;
        win.element.style.left = `${newL}px`;
        win.element.style.top = `${newT}px`;
        win.w = newW;
        win.h = newH;
        win.x = newL;
        win.y = newT;
    }

    function stopResize() {
        window.resizeData = null;
        document.removeEventListener('mousemove', onResize);
        document.removeEventListener('mouseup', stopResize);
    }

    function focusWindow(id) {
        window.activeWindowId = id;
        window.windows.forEach(win => {
            win.element.classList.remove('active');
            if (win.id === id) {
                win.element.classList.add('active');
                win.element.style.zIndex = 100 + window.windows.findIndex(w => w.id === id);
            }
        });
        updateTaskbar();
    }

    function toggleMinimize(id) {
        const win = window.windows.find(w => w.id === id);
        if (win) {
            win.minimized = !win.minimized;
            win.element.classList.toggle('minimized', win.minimized);
            if (win.minimized && window.activeWindowId === id) {
                const next = window.windows.find(w => !w.minimized);
                if (next) focusWindow(next.id);
                else window.activeWindowId = null;
            } else if (!win.minimized) {
                focusWindow(id);
            }
            updateTaskbar();
        }
    }

    function toggleMaximize(id) {
        const win = window.windows.find(w => w.id === id);
        if (win) {
            if (win.maximized) {
                win.element.classList.remove('maximized');
                win.element.style.width = `${win.w}px`;
                win.element.style.height = `${win.h}px`;
                win.element.style.left = `${win.x}px`;
                win.element.style.top = `${win.y}px`;
                win.maximized = false;
                const taskbar = document.getElementById('taskbar');
                if (taskbar) taskbar.style.display = 'flex';
                showToastLarge('ESC to exit fullscreen');
            } else {
                win.w = parseInt(win.element.style.width);
                win.h = parseInt(win.element.style.height);
                win.x = parseInt(win.element.style.left);
                win.y = parseInt(win.element.style.top);
                win.element.classList.add('maximized');
                win.maximized = true;
                const taskbar = document.getElementById('taskbar');
                if (taskbar) taskbar.style.display = 'none';
                showToastLarge('⛶ Fullscreen - ESC to exit');
            }
            updateTaskbar();
            playSound('click');
        }
    }

    function closeWindowWithAnimation(id) {
        const win = window.windows.find(w => w.id === id);
        if (win) {
            win.element.classList.add('closing');
            setTimeout(() => closeWindow(id), 200);
        }
    }

    function closeWindow(id) {
        const win = window.windows.find(w => w.id === id);
        if (win) {
            win.element.remove();
            window.windows = window.windows.filter(w => w.id !== id);
            if (window.activeWindowId === id) {
                const next = window.windows.find(w => !w.minimized);
                if (next) focusWindow(next.id);
                else window.activeWindowId = null;
            }
            updateTaskbar();
        }
    }

    function updateTaskbar() {
        const container = document.getElementById('taskbarApps');
        if (!container) return;
        
        container.innerHTML = window.windows.map(win => `
            <div class="taskbar-app ${window.activeWindowId === win.id ? 'active' : ''}" data-id="${win.id}">
                <span>${win.app.icon}</span>
                <span>${win.app.name}</span>
            </div>
        `).join('');
        
        container.querySelectorAll('.taskbar-app').forEach(el => {
            el.addEventListener('click', () => {
                const id = parseInt(el.dataset.id);
                const win = window.windows.find(w => w.id === id);
                if (win) {
                    if (win.minimized) toggleMinimize(id);
                    else focusWindow(id);
                    playSound('click');
                }
            });
        });
    }

    // ===== DESKTOP ICON FUNCTIONS =====
    function createIconElement(icon, pos) {
        const div = document.createElement('div');
        div.className = 'desktop-icon';
        div.setAttribute('data-id', icon.id);
        div.setAttribute('data-name', icon.name);
        div.setAttribute('data-iconurl', icon.iconUrl || '');
        div.setAttribute('data-url', icon.url || '');
        div.setAttribute('data-external', icon.external || false);
        div.style.left = `${pos.x}px`;
        div.style.top = `${pos.y}px`;
        div.innerHTML = `
            <div class="icon">${icon.iconUrl ? `<img src="${icon.iconUrl}" onerror="this.style.display='none';this.parentElement.innerHTML='${icon.icon}'">` : icon.icon}</div>
            <div class="label">${icon.name}</div>
            <div class="unpin-btn" data-id="${icon.id}">✕</div>
        `;
        setupDesktopIconDrag(div);
        return div;
    }

    function setupDesktopIconDrag(el) {
        let isDragging = false;
        let dragStartX = 0, dragStartY = 0;
        let startLeft = 0, startTop = 0;
        let hasMoved = false;
        
        el.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('unpin-btn')) return;
            e.stopPropagation();
            isDragging = true;
            hasMoved = false;
            dragStartX = e.clientX;
            dragStartY = e.clientY;
            startLeft = parseFloat(el.style.left);
            startTop = parseFloat(el.style.top);
            el.classList.add('dragging');
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const dx = e.clientX - dragStartX;
            const dy = e.clientY - dragStartY;
            if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasMoved = true;
            let newLeft = startLeft + dx;
            let newTop = startTop + dy;
            newLeft = Math.max(5, Math.min(newLeft, window.innerWidth - 100));
            newTop = Math.max(5, Math.min(newTop, window.innerHeight - 100));
            el.style.left = `${newLeft}px`;
            el.style.top = `${newTop}px`;
        });
        
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                el.classList.remove('dragging');
                if (!hasMoved) {
                    const app = window.ALL_APPS.find(a => a.id === el.dataset.id);
                    if (app) launchApp(app);
                    playSound('click');
                } else {
                    const positions = JSON.parse(localStorage.getItem('desktopIconPositions') || '{}');
                    positions[el.dataset.id] = { x: parseFloat(el.style.left), y: parseFloat(el.style.top) };
                    localStorage.setItem('desktopIconPositions', JSON.stringify(positions));
                }
            }
        });
        
        const unpinBtn = el.querySelector('.unpin-btn');
        if (unpinBtn) {
            unpinBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                unpinAppFromDesktop(unpinBtn.dataset.id);
                el.remove();
            });
        }
    }

    function renderDesktopIcons() {
        const leftContainer = document.getElementById('desktopIconsLeft');
        const rightContainer = document.getElementById('desktopIconsRight');
        if (!leftContainer || !rightContainer) return;
        
        const savedPositions = JSON.parse(localStorage.getItem('desktopIconPositions') || '{}');
        
        leftContainer.innerHTML = '';
        rightContainer.innerHTML = '';
        
        window.DESKTOP_ICONS_LEFT.forEach((icon, idx) => {
            const pos = savedPositions[icon.id] || { x: 20, y: 70 + idx * 100 };
            const iconDiv = createIconElement(icon, pos);
            leftContainer.appendChild(iconDiv);
        });
        
        window.DESKTOP_ICONS_RIGHT.forEach((icon, idx) => {
            const pos = savedPositions[icon.id] || { x: window.innerWidth - 105, y: 70 + idx * 100 };
            const iconDiv = createIconElement(icon, pos);
            rightContainer.appendChild(iconDiv);
        });
        
        const pinnedIcons = window.pinnedApps.filter(p => 
            !window.DESKTOP_ICONS_LEFT.some(i => i.id === p.id) && 
            !window.DESKTOP_ICONS_RIGHT.some(i => i.id === p.id)
        );
        pinnedIcons.forEach((icon, idx) => {
            const pos = savedPositions[icon.id] || { 
                x: window.innerWidth - 105, 
                y: 70 + (window.DESKTOP_ICONS_RIGHT.length + idx) * 100 
            };
            const iconDiv = createIconElement(icon, pos);
            rightContainer.appendChild(iconDiv);
        });
    }

    function pinAppToDesktop(appId, appName, appIcon, appCategory, appIconUrl, appUrl) {
        if (!window.pinnedApps.find(p => p.id === appId)) {
            window.pinnedApps.push({ 
                id: appId, 
                name: appName, 
                icon: appIcon, 
                category: appCategory, 
                iconUrl: appIconUrl, 
                url: appUrl 
            });
            localStorage.setItem('pinnedApps', JSON.stringify(window.pinnedApps));
            renderDesktopIcons();
            showToast(`Pinned "${appName}" to desktop!`);
            playSound('click');
        }
    }

    function unpinAppFromDesktop(appId) {
        window.pinnedApps = window.pinnedApps.filter(p => p.id !== appId);
        localStorage.setItem('pinnedApps', JSON.stringify(window.pinnedApps));
        renderDesktopIcons();
        showToast('Removed from desktop');
        playSound('click');
    }

    // ===== MARQUEE SELECTION =====
    function startMarquee(e) {
        if (e.target.closest('.desktop-icon')) return;
        if (e.target !== document.getElementById('desktopBg') && !e.target.closest('.desktop-bg')) return;
        
        window.isMarqueeSelecting = true;
        window.marqueeStartX = e.clientX;
        window.marqueeStartY = e.clientY;
        const marquee = document.getElementById('marqueeSelection');
        if (!marquee) return;
        
        marquee.style.left = `${window.marqueeStartX}px`;
        marquee.style.top = `${window.marqueeStartY}px`;
        marquee.style.width = '0';
        marquee.style.height = '0';
        marquee.style.display = 'block';
        window.selectedIcons = [];
    }

    function updateMarquee(e) {
        if (!window.isMarqueeSelecting) return;
        const marquee = document.getElementById('marqueeSelection');
        if (!marquee) return;
        
        const currentX = e.clientX;
        const currentY = e.clientY;
        const width = Math.abs(currentX - window.marqueeStartX);
        const height = Math.abs(currentY - window.marqueeStartY);
        const left = Math.min(window.marqueeStartX, currentX);
        const top = Math.min(window.marqueeStartY, currentY);
        
        marquee.style.left = `${left}px`;
        marquee.style.top = `${top}px`;
        marquee.style.width = `${width}px`;
        marquee.style.height = `${height}px`;
        
        document.querySelectorAll('.desktop-icon').forEach(icon => {
            icon.style.outline = '';
        });
        window.selectedIcons = [];
        
        document.querySelectorAll('.desktop-icon').forEach(icon => {
            const rect = icon.getBoundingClientRect();
            if (rect.right > left && rect.left < left + width && rect.bottom > top && rect.top < top + height) {
                window.selectedIcons.push(icon);
                icon.style.outline = `2px solid var(--accent)`;
                icon.style.outlineOffset = '2px';
            }
        });
    }

    function endMarquee(e) {
        if (!window.isMarqueeSelecting) {
            document.querySelectorAll('.desktop-icon').forEach(icon => {
                icon.style.outline = '';
            });
            return;
        }
        window.isMarqueeSelecting = false;
        const marquee = document.getElementById('marqueeSelection');
        if (marquee) marquee.style.display = 'none';
        
        if (window.selectedIcons.length === 0) return;
        
        if (e.ctrlKey) {
            window.selectedIcons.forEach(icon => {
                const app = window.ALL_APPS.find(a => a.id === icon.dataset.id);
                if (app) launchApp(app);
            });
        } else if (window.selectedIcons.length === 1) {
            const app = window.ALL_APPS.find(a => a.id === window.selectedIcons[0].dataset.id);
            if (app) launchApp(app);
        }
        window.selectedIcons.forEach(icon => icon.style.outline = '');
        window.selectedIcons = [];
    }

    // ===== APP WINDOW CREATION =====
    function createGameHubWindow() {
        const id = window.nextWindowId++;
        const win = document.createElement('div');
        win.className = 'window';
        win.id = `window-${id}`;
        win.style.cssText = `left:80px; top:60px; width:1000px; height:650px;`;
        win.innerHTML = `
            <div class="window-header">
                <div class="window-title"><span>🎮</span><span>Game Hub</span></div>
                <div class="window-controls">
                    <button class="window-control minimize">─</button>
                    <button class="window-control maximize">□</button>
                    <button class="window-control close">✕</button>
                </div>
            </div>
            <div class="window-content" style="padding:16px;">
                <div style="display:flex; gap:10px; margin-bottom:16px;">
                    <input type="text" id="gameSearch-${id}" placeholder="Search games..." style="flex:2; padding:10px 14px; background:rgba(0,0,0,0.3); border:1px solid var(--border-glass); border-radius:30px; color:white; font-size:13px;">
                    <select id="categorySelect-${id}" style="padding:10px 14px; background:rgba(0,0,0,0.3); border:1px solid var(--border-glass); border-radius:30px; color:white;">
                        <option value="all">All Games</option>
                        <option value="action">Action</option>
                        <option value="platformer">Platformer</option>
                        <option value="adventure">Adventure</option>
                        <option value="horror">Horror</option>
                    </select>
                    <button id="randomGameBtn-${id}" style="padding:10px 20px; background:var(--accent); border:none; border-radius:30px; color:white; cursor:pointer;">🎲 Random</button>
                </div>
                <div id="gameGrid-${id}" style="display:grid; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); gap:14px; max-height:500px; overflow-y:auto;"></div>
                <div style="text-align:center; padding:10px; color:gray; font-size:10px; border-top:1px solid var(--border-glass); margin-top:12px;">a site created by abcatlmfao · parcoil network</div>
            </div>
        `;
        document.body.appendChild(win);
        window.windows.push({ id, element: win, app: { id: 'gamehub', name: 'Game Hub', icon: '🎮' }, minimized: false, maximized: false, x:80, y:60, w:1000, h:650 });
        focusWindow(id);
        setupWindowEvents(win, id);
        addResizeHandles(win, id);
        updateTaskbar();
        playSound('open');
        
        const searchInput = document.getElementById(`gameSearch-${id}`);
        const categorySelect = document.getElementById(`categorySelect-${id}`);
        const grid = document.getElementById(`gameGrid-${id}`);
        const randomBtn = document.getElementById(`randomGameBtn-${id}`);
        
        function renderGames() {
            let filtered = [...window.GAMES_DATA];
            const cat = categorySelect?.value || 'all';
            if (cat !== 'all') filtered = filtered.filter(g => g.category === cat);
            const term = searchInput?.value.toLowerCase() || '';
            if (term) filtered = filtered.filter(g => g.name.toLowerCase().includes(term));
            if (filtered.length === 0) { 
                grid.innerHTML = '<div style="text-align:center;padding:40px;">No games found</div>'; 
                return; 
            }
            grid.innerHTML = filtered.map(game => `
                <div class="game-card" data-game='${JSON.stringify(game)}'>
                    <img src="${game.image}" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
                    <div class="game-card-info">
                        <div class="game-card-title">${game.name}</div>
                        <div class="game-card-category">${game.category}</div>
                    </div>
                </div>
            `).join('');
            grid.querySelectorAll('.game-card').forEach(card => {
                card.addEventListener('click', () => {
                    const game = JSON.parse(card.dataset.game);
                    showGameDetails(game);
                    playSound('click');
                });
            });
        }
        if (searchInput) searchInput.addEventListener('input', renderGames);
        if (categorySelect) categorySelect.addEventListener('change', renderGames);
        if (randomBtn) randomBtn.addEventListener('click', () => {
            if (window.GAMES_DATA.length) showGameDetails(window.GAMES_DATA[Math.floor(Math.random() * window.GAMES_DATA.length)]);
        });
        renderGames();
        return id;
    }

    function createEmulatorsWindow() {
        const id = window.nextWindowId++;
        const win = document.createElement('div');
        win.className = 'window';
        win.id = `window-${id}`;
        win.style.cssText = `left:100px; top:80px; width:550px; height:450px;`;
        win.innerHTML = `
            <div class="window-header">
                <div class="window-title"><span>🕹️</span><span>Emulators</span></div>
                <div class="window-controls">
                    <button class="window-control minimize">─</button>
                    <button class="window-control maximize">□</button>
                    <button class="window-control close">✕</button>
                </div>
            </div>
            <div class="window-content" style="padding:16px;">
                <div style="display:grid; gap:10px;">
                    <div class="emulator-item" data-url="https://chipikipal800.github.io/MKGBA2.0/"><span>🎮</span><div><div>Game Boy Advance</div></div><span>▶</span></div>
                    <div class="emulator-item" data-url="https://chipikipal800.github.io/nes-emulator-/"><span>📺</span><div><div>NES</div></div><span>▶</span></div>
                    <div class="emulator-item" data-url="https://chipikipal800.github.io/n64-emulator/"><span>🎮</span><div><div>Nintendo 64</div></div><span>▶</span></div>
                    <div class="emulator-item" data-url="https://chipikipal800.github.io/Sega-Genesis-Emulator-/"><span>🌀</span><div><div>Sega Genesis</div></div><span>▶</span></div>
                    <div class="emulator-item" data-url="https://chipikipal800.github.io/Virtual-boy-emulator-/"><span>🕶️</span><div><div>Virtual Boy</div></div><span>▶</span></div>
                    <div class="emulator-item" data-url="https://chipikipal800.github.io/atari7800-emulatorwroms/"><span>🎮</span><div><div>Atari 7800</div></div><span>▶</span></div>
                    <div class="emulator-item" data-url="https://chipikipal800.github.io/Atari-2600-emulator-/"><span>🕹️</span><div><div>Atari 2600</div></div><span>▶</span></div>
                    <div class="emulator-item" data-url="https://chipikipal800.github.io/Snes-emulator-html/"><span>⚡</span><div><div>SNES</div></div><span>▶</span></div>
                    <div class="emulator-item" data-url="https://chipikipal800.github.io/Gameboy-color-emulator-/"><span>🎨</span><div><div>Game Boy Color</div></div><span>▶</span></div>
                     <div class="emulator-item" data-url="https://chipikipal800.github.io/Sega-Master-System-Emulator-/"><span>🕹️</span><div><div>Sega Master System</div></div><span>▶</span></div>
                      <div class="emulator-item" data-url="https://chipikipal800.github.io/Sega-32X-Champion-Collection/"><span>👑</span><div><div>Sega 32x Champions Collection</div></div><span>▶</span></div>
                      <div class="emulator-item" data-url="https://chipikipal800.github.io/game-boy-emulator/"><span>🎮</span><div><div>Game Boy</div></div><span>▶</span></div>
                      <div class="emulator-item" data-url="https://chipikipal800.github.io/pokemon-rom-hack-dump/"><span>🐁</span><div><div>Pokemon Dump</div></div><span>▶</span></div>
                      <div class="emulator-item" data-url="https://chipikipal800.github.io/marioromhack-dump/"><span>🍄</span><div><div>Mario Dump</div></div><span>▶</span></div>
                </div>
            </div>
        `;
        document.body.appendChild(win);
        window.windows.push({ id, element: win, app: { id: 'emulators', name: 'Emulators', icon: '🕹️' }, minimized: false, maximized: false, x:100, y:80, w:550, h:450 });
        focusWindow(id);
        setupWindowEvents(win, id);
        addResizeHandles(win, id);
        updateTaskbar();
        playSound('open');
        win.querySelectorAll('.emulator-item').forEach(el => {
            el.addEventListener('click', () => window.open(el.dataset.url, '_blank'));
        });
        return id;
    }

    function createExternalWindow(app, x = 150, y = 100, w = 1000, h = 700) {
        const id = window.nextWindowId++;
        const win = document.createElement('div');
        win.className = 'window';
        win.id = `window-${id}`;
        win.style.cssText = `left:${x}px; top:${y}px; width:${w}px; height:${h}px;`;
        win.innerHTML = `
            <div class="window-header">
                <div class="window-title"><span><img src="${app.iconUrl || ''}" style="width:18px;height:18px;border-radius:5px;" onerror="this.style.display='none';this.parentElement.innerHTML='${app.icon}'"></span><span>${app.name}</span></div>
                <div class="window-controls">
                    <button class="window-control minimize">─</button>
                    <button class="window-control maximize">□</button>
                    <button class="window-control close">✕</button>
                </div>
            </div>
            <div class="window-content"><iframe src="${app.url}" style="width:100%; height:100%; border:none;"></iframe></div>
        `;
        document.body.appendChild(win);
        window.windows.push({ id, element: win, app, minimized: false, maximized: false, x, y, w, h });
        focusWindow(id);
        setupWindowEvents(win, id);
        addResizeHandles(win, id);
        updateTaskbar();
        playSound('open');
        return id;
    }

    function createCalculatorWindow() {
        const id = window.nextWindowId++;
        const win = document.createElement('div');
        win.className = 'window';
        win.id = `window-${id}`;
        win.style.cssText = `left:150px; top:100px; width:400px; height:500px;`;
        win.innerHTML = `
            <div class="window-header">
                <div class="window-title"><span>🧮</span><span>Calculator</span></div>
                <div class="window-controls">
                    <button class="window-control minimize">─</button>
                    <button class="window-control maximize">□</button>
                    <button class="window-control close">✕</button>
                </div>
            </div>
            <div class="window-content">
                <div style="background:rgba(0,0,0,0.3); border-radius:14px; padding:16px; text-align:right; font-size:28px; font-family:monospace; margin-bottom:14px;" id="calcDisplay-${id}">0</div>
                <div style="display:flex; gap:8px; margin-bottom:14px;">
                    <button class="calc-mode-btn" data-mode="basic">Basic</button>
                    <button class="calc-mode-btn" data-mode="scientific">Scientific</button>
                </div>
                <div id="calcButtons-${id}" class="calculator-grid"></div>
            </div>
        `;
        document.body.appendChild(win);
        window.windows.push({ id, element: win, app: { id: 'calculator', name: 'Calculator', icon: '🧮' }, minimized: false, maximized: false, x:150, y:100, w:400, h:500 });
        focusWindow(id);
        setupWindowEvents(win, id);
        addResizeHandles(win, id);
        updateTaskbar();
        playSound('open');
        
        let calcExpr = '', mode = 'basic';
        const display = document.getElementById(`calcDisplay-${id}`);
        const buttonsContainer = document.getElementById(`calcButtons-${id}`);
        const basicButtons = ['7','8','9','/','4','5','6','*','1','2','3','-','0','.','=','+','C','⌫'];
        const scientificButtons = ['7','8','9','/','4','5','6','*','1','2','3','-','0','.','=','+','C','⌫','sin','cos','tan','√','^','(',')'];
        
        function updateDisplay() { display.innerText = calcExpr || '0'; }
        function renderButtons() {
            const buttons = mode === 'basic' ? basicButtons : scientificButtons;
            buttonsContainer.innerHTML = buttons.map(btn => `<button class="calc-btn" data-val="${btn}">${btn}</button>`).join('');
            buttonsContainer.querySelectorAll('.calc-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const val = btn.dataset.val;
                    if (val === 'C') calcExpr = '';
                    else if (val === '⌫') calcExpr = calcExpr.slice(0, -1);
                    else if (val === '=') { try { calcExpr = eval(calcExpr).toString(); } catch(e) { calcExpr = 'Error'; } }
                    else if (val === 'sin') calcExpr = `Math.sin(${calcExpr})`;
                    else if (val === 'cos') calcExpr = `Math.cos(${calcExpr})`;
                    else if (val === 'tan') calcExpr = `Math.tan(${calcExpr})`;
                    else if (val === '√') calcExpr = `Math.sqrt(${calcExpr})`;
                    else if (val === '^') calcExpr += '**';
                    else calcExpr += val;
                    updateDisplay();
                    playSound('click');
                });
            });
        }
        win.querySelectorAll('.calc-mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                mode = btn.dataset.mode;
                win.querySelectorAll('.calc-mode-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderButtons();
                playSound('click');
            });
        });
        win.querySelector('.calc-mode-btn').classList.add('active');
        renderButtons();
        return id;
    }

    function createFactoryWindow() {
        const id = window.nextWindowId++;
        const win = document.createElement('div');
        win.className = 'window';
        win.id = `window-${id}`;
        win.style.cssText = `left:150px; top:80px; width:500px; height:450px;`;
        win.innerHTML = `
            <div class="window-header">
                <div class="window-title"><span>🏭</span><span>The Factory</span></div>
                <div class="window-controls">
                    <button class="window-control minimize">─</button>
                    <button class="window-control maximize">□</button>
                    <button class="window-control close">✕</button>
                </div>
            </div>
            <div class="window-content">
                <select id="factoryType-${id}" style="width:100%; padding:10px; background:rgba(0,0,0,0.3); border:1px solid var(--border-glass); border-radius:10px; color:white; margin-bottom:14px;">
                    <option value="joke">😂 Joke</option>
                    <option value="quote">💭 Quote</option>
                    <option value="fact">📚 Random Fact</option>
                    <option value="randomizer">🎲 Randomizer</option>
                </select>
                <div id="factoryOutput-${id}" style="background:rgba(0,0,0,0.3); padding:16px; border-radius:14px; min-height:120px; margin-bottom:14px;"></div>
                <button id="factoryGenerate-${id}" style="width:100%; padding:10px; background:var(--accent); border:none; border-radius:30px; color:white; cursor:pointer;">Generate</button>
            </div>
        `;
        document.body.appendChild(win);
        window.windows.push({ id, element: win, app: { id: 'thefactory', name: 'The Factory', icon: '🏭' }, minimized: false, maximized: false, x:150, y:80, w:500, h:450 });
        focusWindow(id);
        setupWindowEvents(win, id);
        addResizeHandles(win, id);
        updateTaskbar();
        playSound('open');
        
        const jokes = ["Why don't scientists trust atoms? They make up everything!", "What do you call a fake noodle? An impasta!", "Why did the scarecrow win an award? He was outstanding in his field!"];
        const quotes = ["The only limit is your imagination.", "Believe you can and you're halfway there.", "Success is not final, failure is not fatal."];
        const facts = ["Octopuses have three hearts.", "Bananas are berries, but strawberries aren't.", "A day on Venus is longer than a year on Venus."];
        
        function generate() {
            const type = document.getElementById(`factoryType-${id}`).value;
            const output = document.getElementById(`factoryOutput-${id}`);
            if (type === 'joke') output.innerHTML = jokes[Math.floor(Math.random() * jokes.length)];
            else if (type === 'quote') output.innerHTML = `"${quotes[Math.floor(Math.random() * quotes.length)]}"`;
            else if (type === 'fact') output.innerHTML = facts[Math.floor(Math.random() * facts.length)];
            else if (type === 'randomizer') {
                const num = Math.floor(Math.random() * 100) + 1;
                output.innerHTML = `🎲 Random number: ${num}<br>🪙 Coin flip: ${Math.random() > 0.5 ? 'Heads' : 'Tails'}<br>🎲 Dice roll: ${Math.floor(Math.random() * 6) + 1}`;
            }
            playSound('click');
        }
        document.getElementById(`factoryGenerate-${id}`).onclick = generate;
        generate();
        return id;
    }

    function createStudioWindow() {
        const id = window.nextWindowId++;
        const win = document.createElement('div');
        win.className = 'window';
        win.id = `window-${id}`;
        win.style.cssText = `left:150px; top:80px; width:500px; height:520px;`;
        win.innerHTML = `
            <div class="window-header">
                <div class="window-title"><span>🎨</span><span>The Studio</span></div>
                <div class="window-controls">
                    <button class="window-control minimize">─</button>
                    <button class="window-control maximize">□</button>
                    <button class="window-control close">✕</button>
                </div>
            </div>
            <div class="window-content" style="text-align:center;">
                <canvas id="studioCanvas-${id}" width="400" height="400" style="border:2px solid var(--border-glass); border-radius:12px; background:white; cursor:crosshair;"></canvas>
                <div style="margin-top:10px; display:flex; gap:8px; justify-content:center;">
                    <input type="color" id="studioColor-${id}" value="#000000">
                    <button id="studioClear-${id}" class="calc-btn">Clear</button>
                    <button id="studioSave-${id}" class="calc-btn">Save</button>
                </div>
            </div>
        `;
        document.body.appendChild(win);
        window.windows.push({ id, element: win, app: { id: 'thestudio', name: 'The Studio', icon: '🎨' }, minimized: false, maximized: false, x:150, y:80, w:500, h:520 });
        focusWindow(id);
        setupWindowEvents(win, id);
        addResizeHandles(win, id);
        updateTaskbar();
        playSound('open');
        
        const canvas = document.getElementById(`studioCanvas-${id}`);
        const ctx = canvas.getContext('2d');
        let drawing = false;
        let color = document.getElementById(`studioColor-${id}`).value;
        canvas.width = 400; canvas.height = 400;
        ctx.fillStyle = 'white';
        ctx.fillRect(0,0,400,400);
        canvas.addEventListener('mousedown', () => drawing = true);
        canvas.addEventListener('mouseup', () => drawing = false);
        canvas.addEventListener('mousemove', (e) => {
            if (!drawing) return;
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const x = (e.clientX - rect.left) * scaleX;
            const y = (e.clientY - rect.top) * scaleY;
            ctx.fillStyle = color;
            ctx.fillRect(x-4, y-4, 8, 8);
        });
        document.getElementById(`studioColor-${id}`).addEventListener('change', (e) => color = e.target.value);
        document.getElementById(`studioClear-${id}`).onclick = () => { ctx.fillStyle = 'white'; ctx.fillRect(0,0,400,400); playSound('click'); };
        document.getElementById(`studioSave-${id}`).onclick = () => { const link = document.createElement('a'); link.download = 'drawing.png'; link.href = canvas.toDataURL(); link.click(); playSound('click'); };
        return id;
    }

    function createWeatherWindow() {
        const id = window.nextWindowId++;
        const win = document.createElement('div');
        win.className = 'window';
        win.id = `window-${id}`;
        win.style.cssText = `left:150px; top:100px; width:420px; height:400px;`;
        win.innerHTML = `
            <div class="window-header">
                <div class="window-title"><span>🌤️</span><span>Weather</span></div>
                <div class="window-controls">
                    <button class="window-control minimize">─</button>
                    <button class="window-control maximize">□</button>
                    <button class="window-control close">✕</button>
                </div>
            </div>
            <div class="window-content" style="text-align:center;">
                <input type="text" id="weatherCity-${id}" placeholder="Enter city..." style="width:100%; padding:10px; background:rgba(0,0,0,0.3); border:1px solid var(--border-glass); border-radius:10px; color:white; margin-bottom:10px;">
                <button id="weatherGet-${id}" style="width:100%; padding:10px; background:var(--accent); border:none; border-radius:30px; color:white; cursor:pointer;">Get Weather</button>
                <div id="weatherResult-${id}" style="margin-top:14px; background:rgba(0,0,0,0.3); padding:16px; border-radius:14px;"></div>
            </div>
        `;
        document.body.appendChild(win);
        window.windows.push({ id, element: win, app: { id: 'weather', name: 'Weather', icon: '🌤️' }, minimized: false, maximized: false, x:150, y:100, w:420, h:400 });
        focusWindow(id);
        setupWindowEvents(win, id);
        addResizeHandles(win, id);
        updateTaskbar();
        playSound('open');
        
        document.getElementById(`weatherGet-${id}`).onclick = async () => {
            const city = document.getElementById(`weatherCity-${id}`).value;
            if (!city) return;
            try {
                const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`);
                const geoData = await geoRes.json();
                if (!geoData.results) { document.getElementById(`weatherResult-${id}`).innerHTML = 'City not found'; return; }
                const { latitude, longitude, name } = geoData.results[0];
                const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&temperature_unit=fahrenheit`);
                const weatherData = await weatherRes.json();
                const temp = Math.round(weatherData.current_weather.temperature);
                document.getElementById(`weatherResult-${id}`).innerHTML = `<div style="font-size:42px;">${temp}°F</div><div>${name}</div><div>${weatherData.current_weather.weathercode === 0 ? '☀️ Clear' : '☁️ Cloudy'}</div>`;
                playSound('click');
            } catch(e) { document.getElementById(`weatherResult-${id}`).innerHTML = 'Error fetching weather'; }
        };
        return id;
    }

    function createNotesWindow() {
        const id = window.nextWindowId++;
        const win = document.createElement('div');
        win.className = 'window';
        win.id = `window-${id}`;
        win.style.cssText = `left:150px; top:100px; width:400px; height:380px;`;
        win.innerHTML = `
            <div class="window-header">
                <div class="window-title"><span>📋</span><span>Notes</span></div>
                <div class="window-controls">
                    <button class="window-control minimize">─</button>
                    <button class="window-control maximize">□</button>
                    <button class="window-control close">✕</button>
                </div>
            </div>
            <div class="window-content"><textarea id="notesText-${id}" style="width:100%; height:100%; background:rgba(0,0,0,0.3); border:none; color:white; padding:10px; resize:none;" placeholder="Write your notes here..."></textarea></div>
        `;
        document.body.appendChild(win);
        window.windows.push({ id, element: win, app: { id: 'notes', name: 'Notes', icon: '📋' }, minimized: false, maximized: false, x:150, y:100, w:400, h:380 });
        focusWindow(id);
        setupWindowEvents(win, id);
        addResizeHandles(win, id);
        updateTaskbar();
        playSound('open');
        
        const saved = localStorage.getItem('user_notes');
        const textarea = document.getElementById(`notesText-${id}`);
        if (saved) textarea.value = saved;
        textarea.addEventListener('input', () => localStorage.setItem('user_notes', textarea.value));
        return id;
    }

    function createTimerWindow() {
        const id = window.nextWindowId++;
        const win = document.createElement('div');
        win.className = 'window';
        win.id = `window-${id}`;
        win.style.cssText = `left:150px; top:100px; width:380px; height:320px;`;
        win.innerHTML = `
            <div class="window-header">
                <div class="window-title"><span>⏱️</span><span>Timer</span></div>
                <div class="window-controls">
                    <button class="window-control minimize">─</button>
                    <button class="window-control maximize">□</button>
                    <button class="window-control close">✕</button>
                </div>
            </div>
            <div class="window-content" style="text-align:center;">
                <div style="font-size:44px; font-family:monospace; margin:16px 0;" id="timerDisplay-${id}">25:00</div>
                <div style="display:flex; gap:8px; justify-content:center;">
                    <button id="timerStart-${id}" class="calc-btn">Start</button>
                    <button id="timerPause-${id}" class="calc-btn">Pause</button>
                    <button id="timerReset-${id}" class="calc-btn">Reset</button>
                </div>
            </div>
        `;
        document.body.appendChild(win);
        window.windows.push({ id, element: win, app: { id: 'timer', name: 'Timer', icon: '⏱️' }, minimized: false, maximized: false, x:150, y:100, w:380, h:320 });
        focusWindow(id);
        setupWindowEvents(win, id);
        addResizeHandles(win, id);
        updateTaskbar();
        playSound('open');
        
        let interval = null, time = 25 * 60;
        const display = document.getElementById(`timerDisplay-${id}`);
        function update() { const m = Math.floor(time/60), s = time%60; display.innerText = `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`; }
        document.getElementById(`timerStart-${id}`).onclick = () => { if(interval) clearInterval(interval); interval = setInterval(() => { if(time>0){time--; update();}else{clearInterval(interval); showToast('Time is up!'); playSound('click');} },1000); playSound('click'); };
        document.getElementById(`timerPause-${id}`).onclick = () => { if(interval) clearInterval(interval); interval = null; playSound('click'); };
        document.getElementById(`timerReset-${id}`).onclick = () => { time = 25*60; update(); playSound('click'); };
        update();
        return id;
    }

    function createTasksWindow() {
        const id = window.nextWindowId++;
        const win = document.createElement('div');
        win.className = 'window';
        win.id = `window-${id}`;
        win.style.cssText = `left:150px; top:100px; width:400px; height:420px;`;
        win.innerHTML = `
            <div class="window-header">
                <div class="window-title"><span>✅</span><span>Tasks</span></div>
                <div class="window-controls">
                    <button class="window-control minimize">─</button>
                    <button class="window-control maximize">□</button>
                    <button class="window-control close">✕</button>
                </div>
            </div>
            <div class="window-content">
                <div style="display:flex; gap:8px; margin-bottom:14px;">
                    <input type="text" id="taskInput-${id}" placeholder="New task..." style="flex:1; padding:8px; background:rgba(0,0,0,0.3); border:1px solid var(--border-glass); border-radius:10px; color:white;">
                    <button id="addTask-${id}" class="calc-btn">Add</button>
                </div>
                <div id="taskList-${id}" style="display:flex; flex-direction:column; gap:8px;"></div>
            </div>
        `;
        document.body.appendChild(win);
        window.windows.push({ id, element: win, app: { id: 'tasks', name: 'Tasks', icon: '✅' }, minimized: false, maximized: false, x:150, y:100, w:400, h:420 });
        focusWindow(id);
        setupWindowEvents(win, id);
        addResizeHandles(win, id);
        updateTaskbar();
        playSound('open');
        
        let tasks = JSON.parse(localStorage.getItem('user_tasks') || '[]');
        const list = document.getElementById(`taskList-${id}`);
        const input = document.getElementById(`taskInput-${id}`);
        function render() {
            list.innerHTML = tasks.map((t,i) => `
                <div style="display:flex; align-items:center; gap:8px; padding:6px; background:rgba(255,255,255,0.05); border-radius:8px;">
                    <input type="checkbox" ${t.done ? 'checked' : ''} data-index="${i}">
                    <span style="flex:1; ${t.done ? 'text-decoration:line-through; color:gray;' : ''}">${t.text}</span>
                    <button class="delete-task" data-index="${i}" style="background:none; border:none; color:var(--danger); cursor:pointer;">🗑</button>
                </div>
            `).join('');
            list.querySelectorAll('input[type="checkbox"]').forEach(cb => { cb.onchange = () => { tasks[cb.dataset.index].done = cb.checked; localStorage.setItem('user_tasks', JSON.stringify(tasks)); render(); playSound('click'); }; });
            list.querySelectorAll('.delete-task').forEach(btn => { btn.onclick = () => { tasks.splice(btn.dataset.index, 1); localStorage.setItem('user_tasks', JSON.stringify(tasks)); render(); playSound('click'); }; });
        }
        document.getElementById(`addTask-${id}`).onclick = () => { if(input.value.trim()) { tasks.push({ text: input.value.trim(), done: false }); localStorage.setItem('user_tasks', JSON.stringify(tasks)); input.value = ''; render(); playSound('click'); } };
        render();
        return id;
    }

    
function createStealthWindow() {
    const id = window.nextWindowId++;
    const win = document.createElement('div');
    win.className = 'window opening';
    win.id = `window-${id}`;
    win.style.cssText = `left:150px; top:100px; width:550px; height:600px;`;
    win.innerHTML = `
        <div class="window-header">
            <div class="window-title"><span>Stealth Control Center</span></div>
            <div class="window-controls">
                <button class="window-control minimize">─</button>
                <button class="window-control maximize">□</button>
                <button class="window-control close">✕</button>
            </div>
        </div>
        <div class="window-content" style="padding:20px; overflow-y:auto;">
            <div style="margin-bottom:24px; background:rgba(124,92,255,0.1); border-radius:16px; padding:14px; text-align:center;">
                <div style="display:flex; align-items:center; justify-content:center; gap:8px; margin-bottom:5px;">
                    <span style="font-size:12px; color:#7c5cff;">● ACTIVE</span>
                    <span style="font-size:11px; color:#888;">Stealth Mode Ready</span>
                </div>
                <div style="font-size:11px; color:#666;">Press \` (backtick) to panic | Auto-hides when tab loses focus</div>
            </div>

            <div style="background:rgba(255,255,255,0.03); border-radius:16px; padding:16px; margin-bottom:16px;">
                <div style="font-size:12px; font-weight:600; margin-bottom:12px; color:#7c5cff;">🎯 PANIC BUTTON (\` key)</div>
                <div style="display:flex; gap:10px;">
                    <input type="text" id="panicUrlInput" class="stealth-input" value="${localStorage.getItem('panicUrl') || 'https://classroom.google.com'}" placeholder="https://classroom.google.com" style="flex:1; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:10px 14px; color:white; font-size:13px;">
                    <button id="savePanicBtn" style="background:linear-gradient(135deg,#7c5cff,#5a3cc9); border:none; border-radius:12px; padding:10px 20px; color:white; cursor:pointer;">Save</button>
                </div>
            </div>

            <div style="background:rgba(255,255,255,0.03); border-radius:16px; padding:16px; margin-bottom:16px;">
                <div style="font-size:12px; font-weight:600; margin-bottom:12px; color:#7c5cff;">🎨 DISGUISE SETTINGS</div>
                <div style="margin-bottom:12px;">
                    <div style="font-size:11px; color:#888; margin-bottom:6px;">Favicon Preview:</div>
                    <div style="display:flex; align-items:center; gap:12px;">
                        <img id="faviconPreview" src="${localStorage.getItem('stealthFavicon') || 'https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png'}" style="width:28px; height:28px; border-radius:6px; background:white; padding:4px;">
                        <select id="faviconSelect" style="flex:1; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); border-radius:10px; padding:8px 12px; color:white; font-size:12px;">
                            <option value="https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png">📁 Google Drive</option>
                            <option value="https://ssl.gstatic.com/images/branding/product/1x/classroom_2020q4_32dp.png">📚 Google Classroom</option>
                            <option value="https://ssl.gstatic.com/images/branding/product/1x/docs_2020q4_32dp.png">📄 Google Docs</option>
                            <option value="https://ssl.gstatic.com/images/branding/product/1x/sheets_2020q4_32dp.png">📊 Google Sheets</option>
                            <option value="https://www.google.com/s2/favicons?domain=khanacademy.org">🎓 Khan Academy</option>
                        </select>
                    </div>
                </div>
                <div>
                    <div style="font-size:11px; color:#888; margin-bottom:6px;">Tab Title:</div>
                    <input type="text" id="titleInput" class="stealth-input" value="${localStorage.getItem('stealthTitle') || 'Google Drive'}" placeholder="My Study Notes" style="width:100%; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:10px 14px; color:white; font-size:13px;">
                </div>
            </div>

            <div style="background:rgba(255,255,255,0.03); border-radius:16px; padding:16px; margin-bottom:16px;">
                <div style="font-size:12px; font-weight:600; margin-bottom:12px; color:#7c5cff;">🤫 AUTO-STEALTH</div>
                <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;">
                    <span style="font-size:13px;">Hide when tab loses focus</span>
                    <label class="switch">
                        <input type="checkbox" id="autoStealthToggle" ${localStorage.getItem('autoStealth') !== 'false' ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>
                <div style="display:flex; align-items:center; justify-content:space-between;">
                    <span style="font-size:13px;">Pause games when hiding</span>
                    <label class="switch">
                        <input type="checkbox" id="pauseGamesToggle" checked>
                        <span class="slider"></span>
                    </label>
                </div>
            </div>

            <div style="background:rgba(255,255,255,0.03); border-radius:16px; padding:16px;">
                <div style="font-size:12px; font-weight:600; margin-bottom:12px; color:#7c5cff;">⚡ QUICK PROFILES</div>
                <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:12px;">
                    <button class="profile-btn" data-favicon="https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png" data-title="Algebra 2 Notes">📚 Math</button>
                    <button class="profile-btn" data-favicon="https://ssl.gstatic.com/images/branding/product/1x/classroom_2020q4_32dp.png" data-title="Periodic Table Study">🔬 Science</button>
                    <button class="profile-btn" data-favicon="https://ssl.gstatic.com/images/branding/product/1x/docs_2020q4_32dp.png" data-title="Romeo & Juliet Essay">📖 English</button>
                    <button class="profile-btn" data-favicon="https://www.google.com/s2/favicons?domain=khanacademy.org" data-title="History Notes">📜 History</button>
                </div>
                <button id="saveSettingsBtn" style="width:100%; background:linear-gradient(135deg,#7c5cff,#5a3cc9); border:none; border-radius:14px; padding:12px; color:white; font-weight:600; cursor:pointer; margin-top:8px;">Save All Settings</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(win);
    
    win.addEventListener('animationend', () => win.classList.remove('opening'), { once: true });
    window.windows.push({ id, element: win, app: { id: 'stealth', name: 'Stealth', icon: '🕵️' }, minimized: false, maximized: false, x:150, y:100, w:550, h:600 });
    focusWindow(id);
    setupWindowEvents(win, id);
    addResizeHandles(win, id);
    updateTaskbar();
    playSound('open');
    
    // Bind events
    const panicInput = document.getElementById('panicUrlInput');
    const savePanicBtn = document.getElementById('savePanicBtn');
    const faviconSelect = document.getElementById('faviconSelect');
    const titleInput = document.getElementById('titleInput');
    const autoStealthToggle = document.getElementById('autoStealthToggle');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    const faviconPreview = document.getElementById('faviconPreview');
    
    if (faviconSelect) {
        faviconSelect.addEventListener('change', () => {
            if (faviconPreview) faviconPreview.src = faviconSelect.value;
        });
    }
    
    if (savePanicBtn) {
        savePanicBtn.addEventListener('click', () => {
            let panicUrl = panicInput.value.trim();
            if (!panicUrl.startsWith('http')) panicUrl = 'https://' + panicUrl;
            localStorage.setItem('panicUrl', panicUrl);
            showToast('Panic URL saved! Press ` to test');
            playSound('click');
        });
    }
    
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', () => {
            if (faviconSelect) localStorage.setItem('stealthFavicon', faviconSelect.value);
            if (titleInput) localStorage.setItem('stealthTitle', titleInput.value.trim() || 'Google Drive');
            if (autoStealthToggle) localStorage.setItem('autoStealth', autoStealthToggle.checked);
            showToast('Stealth settings saved!');
            playSound('click');
            applyStealth();
        });
    }
    
    document.querySelectorAll('.profile-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const favicon = btn.dataset.favicon;
            const title = btn.dataset.title;
            if (favicon && faviconSelect) {
                for (let i = 0; i < faviconSelect.options.length; i++) {
                    if (faviconSelect.options[i].value === favicon) {
                        faviconSelect.selectedIndex = i;
                        if (faviconPreview) faviconPreview.src = favicon;
                        break;
                    }
                }
            }
            if (title && titleInput) titleInput.value = title;
            showToast(`Profile loaded: ${btn.textContent}`);
            playSound('click');
        });
    });
    
    return id;
}

// Stealth helper functions
let stealthActive = true;

function saveOriginalIdentity() {
    const faviconLink = document.querySelector("link[rel*='icon']");
    window.originalFavicon = faviconLink ? faviconLink.href : '';
    window.originalTitle = document.title;
}

function applyStealth() {
    const stealthFavicon = localStorage.getItem('stealthFavicon');
    const stealthTitle = localStorage.getItem('stealthTitle');
    
    if (stealthFavicon) {
        let link = document.querySelector("link[rel*='icon']");
        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
        }
        link.href = stealthFavicon;
    }
    if (stealthTitle) {
        document.title = stealthTitle;
    }
}

function revertIdentity() {
    let link = document.querySelector("link[rel*='icon']");
    if (link && window.originalFavicon) {
        link.href = window.originalFavicon;
    }
    document.title = window.originalTitle || 'fanterOS';
}

function activatePanic() {
    const panicUrl = localStorage.getItem('panicUrl') || 'https://classroom.google.com';
    const overlay = document.createElement('div');
    overlay.id = 'panicOverlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: white;
        z-index: 999999;
    `;
    const iframe = document.createElement('iframe');
    iframe.src = panicUrl;
    iframe.style.cssText = `width:100%; height:100%; border:none;`;
    overlay.appendChild(iframe);
    document.body.appendChild(overlay);
    
    const closePanic = (e) => {
        if (e.key === 'Escape') {
            overlay.remove();
            document.removeEventListener('keydown', closePanic);
        }
    };
    document.addEventListener('keydown', closePanic);
}



// Override launchApp to handle stealth
const originalLaunchApp = window.launchApp;
window.launchApp = function(app) {
    if (app.id === 'stealth') {
        createStealthWindow();
    } else {
        originalLaunchApp(app);
    }
};

// Add panic keyboard listener
document.addEventListener('keydown', (e) => {
    if (e.key === '`') {
        e.preventDefault();
        activatePanic();
        playSound('click');
    }
});

// Auto-stealth on tab switch
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        if (localStorage.getItem('autoStealth') !== 'false') {
            applyStealth();
        }
    } else {
        if (localStorage.getItem('autoStealth') !== 'false') {
            revertIdentity();
        }
    }
});

// Initialize stealth on page load
saveOriginalIdentity();
applyStealth();

    function createWhiteboardWindow() {
        const id = window.nextWindowId++;
        const win = document.createElement('div');
        win.className = 'window';
        win.id = `window-${id}`;
        win.style.cssText = `left:150px; top:100px; width:500px; height:520px;`;
        win.innerHTML = `
            <div class="window-header">
                <div class="window-title"><span>✏️</span><span>Whiteboard</span></div>
                <div class="window-controls">
                    <button class="window-control minimize">─</button>
                    <button class="window-control maximize">□</button>
                    <button class="window-control close">✕</button>
                </div>
            </div>
            <div class="window-content" style="text-align:center;">
                <canvas id="whiteboardCanvas-${id}" width="400" height="400" style="border:2px solid var(--border-glass); border-radius:12px; background:white; cursor:crosshair;"></canvas>
                <div style="margin-top:10px; display:flex; gap:8px; justify-content:center;">
                    <input type="color" id="whiteboardColor-${id}" value="#000000">
                    <button id="whiteboardClear-${id}" class="calc-btn">Clear</button>
                    <button id="whiteboardSave-${id}" class="calc-btn">Save</button>
                </div>
            </div>
        `;
        document.body.appendChild(win);
        window.windows.push({ id, element: win, app: { id: 'whiteboard', name: 'Whiteboard', icon: '✏️' }, minimized: false, maximized: false, x:150, y:100, w:500, h:520 });
        focusWindow(id);
        setupWindowEvents(win, id);
        addResizeHandles(win, id);
        updateTaskbar();
        playSound('open');
        
        const canvas = document.getElementById(`whiteboardCanvas-${id}`);
        const ctx = canvas.getContext('2d');
        let drawing = false;
        let color = document.getElementById(`whiteboardColor-${id}`).value;
        canvas.width = 400; canvas.height = 400;
        ctx.fillStyle = 'white';
        ctx.fillRect(0,0,400,400);
        canvas.addEventListener('mousedown', () => drawing = true);
        canvas.addEventListener('mouseup', () => drawing = false);
        canvas.addEventListener('mousemove', (e) => {
            if(!drawing) return;
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const x = (e.clientX - rect.left) * scaleX;
            const y = (e.clientY - rect.top) * scaleY;
            ctx.fillStyle = color;
            ctx.fillRect(x-4, y-4, 8, 8);
        });
        document.getElementById(`whiteboardColor-${id}`).addEventListener('change', (e) => color = e.target.value);
        document.getElementById(`whiteboardClear-${id}`).onclick = () => { ctx.fillStyle = 'white'; ctx.fillRect(0,0,400,400); playSound('click'); };
        document.getElementById(`whiteboardSave-${id}`).onclick = () => { const link = document.createElement('a'); link.download = 'whiteboard.png'; link.href = canvas.toDataURL(); link.click(); playSound('click'); };
        return id;
    }

    function createAppStoreWindow() {
        const id = window.nextWindowId++;
        const win = document.createElement('div');
        win.className = 'window';
        win.id = `window-${id}`;
        win.style.cssText = `left:200px; top:80px; width:750px; height:600px;`;
        win.innerHTML = `
            <div class="window-header">
                <div class="window-title"><span>📦</span><span>FantAppStore</span></div>
                <div class="window-controls">
                    <button class="window-control minimize">─</button>
                    <button class="window-control maximize">□</button>
                    <button class="window-control close">✕</button>
                </div>
            </div>
            <div class="window-content">
                <div style="margin-bottom:14px;"><input type="text" id="appStoreSearch-${id}" placeholder="Search apps..." style="width:100%; padding:10px 14px; background:rgba(0,0,0,0.3); border:1px solid var(--border-glass); border-radius:30px; color:white;"></div>
                <div style="display:flex; gap:8px; margin-bottom:14px; flex-wrap:wrap;">
                    <button class="store-cat-btn active" data-cat="all">All</button>
                    <button class="store-cat-btn" data-cat="games">🎮 Games</button>
                    <button class="store-cat-btn" data-cat="social">💬 Social</button>
                </div>
                <div id="appStoreGrid-${id}" style="display:grid; grid-template-columns:repeat(auto-fill,minmax(210px,1fr)); gap:14px; max-height:420px; overflow-y:auto;"></div>
            </div>
        `;
        document.body.appendChild(win);
        window.windows.push({ id, element: win, app: { id: 'appstore', name: 'FantAppStore', icon: '📦' }, minimized: false, maximized: false, x:200, y:80, w:750, h:600 });
        focusWindow(id);
        setupWindowEvents(win, id);
        addResizeHandles(win, id);
        updateTaskbar();
        playSound('open');
        
        function renderStore() {
            const searchTerm = document.getElementById(`appStoreSearch-${id}`).value.toLowerCase();
            const activeCat = win.querySelector('.store-cat-btn.active')?.dataset.cat || 'all';
            let filtered = window.STORE_APPS.filter(app => {
                const matchesSearch = app.name.toLowerCase().includes(searchTerm);
                const matchesCat = activeCat === 'all' || app.category === activeCat;
                return matchesSearch && matchesCat;
            });
            const grid = document.getElementById(`appStoreGrid-${id}`);
            grid.innerHTML = filtered.map(app => {
                const isInstalled = window.installedApps.includes(app.id);
                return `
                    <div style="background:rgba(255,255,255,0.05); border-radius:14px; padding:14px;">
                        <div style="font-size:42px; text-align:center; margin-bottom:10px;"><img src="${app.iconUrl}" style="width:42px;height:42px;border-radius:10px;" onerror="this.style.display='none';this.parentElement.innerHTML='${app.icon}'"></div>
                        <div style="font-weight:600; margin-bottom:3px;">${app.name}</div>
                        <div style="font-size:10px; color:gray; margin-bottom:8px;">by ${app.creator}</div>
                        <div style="font-size:10px; color:var(--text-muted); margin-bottom:10px; line-height:1.3;">${app.description}</div>
                        <button class="install-btn-${id}" data-id="${app.id}" data-url="${app.url}" data-name="${app.name}" data-icon="${app.icon}" data-iconurl="${app.iconUrl}" style="width:100%; padding:8px; background:${isInstalled ? 'rgba(255,255,255,0.1)' : 'var(--accent)'}; border:none; border-radius:10px; color:white; cursor:pointer;">${isInstalled ? '✓ Installed' : '📥 Install'}</button>
                    </div>
                `;
            }).join('');
            grid.querySelectorAll(`.install-btn-${id}`).forEach(btn => {
                btn.addEventListener('click', () => {
                    const appId = btn.dataset.id, appName = btn.dataset.name, appIcon = btn.dataset.icon, appIconUrl = btn.dataset.iconurl, appUrl = btn.dataset.url;
                    if(window.installedApps.includes(appId)) {
                        window.installedApps = window.installedApps.filter(i => i !== appId);
                        showToast(`Uninstalled ${appName}`);
                    } else {
                        window.installedApps.push(appId);
                        if(!window.ALL_APPS.find(a => a.id === appId)) {
                            window.ALL_APPS.push({ id: appId, name: appName, icon: appIcon, iconUrl: appIconUrl, url: appUrl, category: 'games', external: true });
                            renderStartApps();
                        }
                        showToast(`Installed ${appName}! Check the Start Menu`);
                    }
                    localStorage.setItem('installedApps', JSON.stringify(window.installedApps));
                    renderStore();
                    playSound('click');
                });
            });
        }
        win.querySelectorAll('.store-cat-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                win.querySelectorAll('.store-cat-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderStore();
                playSound('click');
            });
        });
        document.getElementById(`appStoreSearch-${id}`).addEventListener('input', renderStore);
        renderStore();
        return id;
    }

    function launchApp(app) {
    
    if (app.id === 'stealth') {
        createStealthWindow();
        return;
    }
    
    const existing = window.windows.find(w => w.app?.id === app.id);
    if (existing) {
        if (existing.minimized) toggleMinimize(existing.id);
        focusWindow(existing.id);
        return;
    }
    updateRecentApps(app.id, app.name, app.icon, app.id);
    if (app.id === 'gamehub') createGameHubWindow();
    else if (app.id === 'emulators') createEmulatorsWindow();
    else if (app.id === 'appstore') createAppStoreWindow();
    else if (app.id === 'calculator') createCalculatorWindow();
    else if (app.id === 'thefactory') createFactoryWindow();
    else if (app.id === 'thestudio') createStudioWindow();
    else if (app.id === 'weather') createWeatherWindow();
    else if (app.id === 'notes') createNotesWindow();
    else if (app.id === 'timer') createTimerWindow();
    else if (app.id === 'tasks') createTasksWindow();
    else if (app.id === 'whiteboard') createWhiteboardWindow();
    else if (app.url) createExternalWindow(app);
    else showToast(`${app.name} coming soon!`);
    playSound('click');
}

    // ===== START MENU =====
    function renderStartApps() {
        const container = document.getElementById('startApps');
        if (!container) return;
        
        let filtered = window.ALL_APPS;
        if (window.currentCategory !== 'all') filtered = filtered.filter(a => a.category === window.currentCategory);
        if (window.currentSearchTerm) filtered = filtered.filter(a => a.name.toLowerCase().includes(window.currentSearchTerm.toLowerCase()));
        
        container.innerHTML = filtered.map(app => `
            <div class="start-app" data-app-id="${app.id}">
                <div class="start-app-icon">${app.iconUrl ? `<img src="${app.iconUrl}" onerror="this.style.display='none';this.parentElement.innerHTML='${app.icon}'">` : app.icon}</div>
                <div class="start-app-name">${app.name}</div>
                <div class="start-app-pin" data-id="${app.id}" data-name="${app.name}" data-icon="${app.icon}" data-category="${app.category}" data-iconurl="${app.iconUrl || ''}" data-url="${app.url || ''}">📌</div>
            </div>
        `).join('');
        
        container.querySelectorAll('.start-app').forEach(el => {
            el.addEventListener('click', (e) => { 
                if (e.target.classList.contains('start-app-pin')) return; 
                const app = window.ALL_APPS.find(a => a.id === el.dataset.appId); 
                if (app) launchApp(app); 
            });
            const pinBtn = el.querySelector('.start-app-pin');
            if (pinBtn) pinBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                pinAppToDesktop(pinBtn.dataset.id, pinBtn.dataset.name, pinBtn.dataset.icon, pinBtn.dataset.category, pinBtn.dataset.iconurl, pinBtn.dataset.url);
            });
        });
    }

    function toggleStartMenu() {
        window.startMenuOpen = !window.startMenuOpen;
        const menu = document.getElementById('startMenu');
        if (menu) menu.classList.toggle('open', window.startMenuOpen);
        if (window.startMenuOpen) { 
            const search = document.getElementById('startSearch');
            if (search) search.focus(); 
            renderStartApps(); 
        }
    }

    // ===== BOOT MENU =====
    function updateBootResults(query) {
        const container = document.getElementById('bootResults');
        if (!container) return;
        
        let results = query ? window.GAMES_DATA.filter(g => g.name.toLowerCase().includes(query.toLowerCase())).slice(0,10) : window.GAMES_DATA.slice(0,8);
        window.currentBootResults = results;
        window.selectedBootIndex = results.length > 0 ? 0 : -1;
        
        if (!results.length) { 
            container.innerHTML = '<div style="padding:16px;text-align:center;">no games found</div>'; 
            return; 
        }
        
        container.innerHTML = results.map((game,idx) => `
            <div class="boot-result ${idx === window.selectedBootIndex ? 'selected' : ''}" data-index="${idx}">
                <div class="boot-result-icon">🎮</div>
                <div class="boot-result-info">
                    <div class="boot-result-name">${game.name}</div>
                    <div class="boot-result-desc">${game.category}</div>
                </div>
            </div>
        `).join('');
        
        container.querySelectorAll('.boot-result').forEach(el => { 
            el.addEventListener('click', () => { 
                const game = window.currentBootResults[parseInt(el.dataset.index)]; 
                if (game) showGameDetails(game); 
                toggleBootMenu(); 
                playSound('click'); 
            }); 
        });
    }

    function toggleBootMenu() {
        window.bootMenuOpen = !window.bootMenuOpen;
        const menu = document.getElementById('bootMenu');
        if (menu) menu.classList.toggle('open', window.bootMenuOpen);
        if (window.bootMenuOpen) { 
            const search = document.getElementById('bootSearch');
            if (search) { search.focus(); updateBootResults(''); }
        }
    }

    // ===== RECENT APPS DRAG =====
    function initRecentAppsDrag() {
        const recentRow = document.getElementById('recentAppsRow');
        if (!recentRow) return;
        
        let isDragging = false, startX = 0, startLeft = 0;
        
        recentRow.addEventListener('mousedown', (e) => {
            if (e.target.closest('.recent-app-item')) return;
            isDragging = true;
            startX = e.clientX;
            startLeft = parseFloat(recentRow.style.left) || (window.innerWidth/2 - recentRow.offsetWidth/2);
            recentRow.style.cursor = 'grabbing';
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            let newLeft = startLeft + (e.clientX - startX);
            newLeft = Math.max(10, Math.min(newLeft, window.innerWidth - recentRow.offsetWidth - 10));
            recentRow.style.left = `${newLeft}px`;
            recentRow.style.transform = 'none';
        });
        
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                recentRow.style.cursor = '';
                const centerX = window.innerWidth/2 - recentRow.offsetWidth/2;
                const leftX = 10;
                const rightX = window.innerWidth - recentRow.offsetWidth - 10;
                const currentLeft = parseFloat(recentRow.style.left);
                let snapPos = 'center';
                
                if (Math.abs(currentLeft - leftX) < Math.abs(currentLeft - centerX) && Math.abs(currentLeft - leftX) < Math.abs(currentLeft - rightX)) snapPos = 'left';
                else if (Math.abs(currentLeft - rightX) < Math.abs(currentLeft - centerX)) snapPos = 'right';
                
                if (snapPos === 'left') recentRow.style.left = `${leftX}px`;
                else if (snapPos === 'right') recentRow.style.left = `${rightX}px`;
                else recentRow.style.left = `${centerX}px`;
                
                localStorage.setItem('recentSnapPosition', snapPos);
            }
        });
        
        const savedPos = localStorage.getItem('recentSnapPosition');
        if (savedPos === 'left') recentRow.style.left = '10px';
        else if (savedPos === 'right') recentRow.style.left = `${window.innerWidth - recentRow.offsetWidth - 10}px`;
        else recentRow.style.left = `${window.innerWidth/2 - recentRow.offsetWidth/2}px`;
        
        recentRow.style.transform = 'none';
    }

    // ===== WIDGET DRAGGING =====
    function initWidgetDragging() {
        const savedPositions = JSON.parse(localStorage.getItem('widgetPositions') || '{}');
        const widgetsContainer = document.getElementById('desktopWidgets');
        
        if (widgetsContainer) {
            Object.entries(savedPositions).forEach(([id, pos]) => {
                const widget = document.getElementById(id);
                if (widget) {
                    widget.style.position = 'absolute';
                    widget.style.left = `${pos.left}px`;
                    widget.style.top = `${pos.top}px`;
                    widget.style.margin = '0';
                    widgetsContainer.style.position = 'relative';
                    widgetsContainer.style.height = '0';
                }
            });
        }
        
        document.querySelectorAll('.widget').forEach(widget => {
            let isDragging = false;
            let startX = 0, startY = 0;
            let startLeft = 0, startTop = 0;
            
            widget.addEventListener('mousedown', (e) => {
                e.stopPropagation();
                isDragging = true;
                startX = e.clientX;
                startY = e.clientY;
                const rect = widget.getBoundingClientRect();
                startLeft = rect.left;
                startTop = rect.top;
                widget.style.position = 'absolute';
                widget.style.left = `${startLeft}px`;
                widget.style.top = `${startTop}px`;
                widget.style.margin = '0';
                widget.classList.add('dragging');
            });
            
            document.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
                let newLeft = startLeft + dx;
                let newTop = startTop + dy;
                newLeft = Math.max(5, Math.min(newLeft, window.innerWidth - widget.offsetWidth - 5));
                newTop = Math.max(5, Math.min(newTop, window.innerHeight - 100));
                widget.style.left = `${newLeft}px`;
                widget.style.top = `${newTop}px`;
            });
            
            document.addEventListener('mouseup', () => {
                if (isDragging) {
                    isDragging = false;
                    widget.classList.remove('dragging');
                    const positions = JSON.parse(localStorage.getItem('widgetPositions') || '{}');
                    positions[widget.id] = { left: parseFloat(widget.style.left), top: parseFloat(widget.style.top) };
                    localStorage.setItem('widgetPositions', JSON.stringify(positions));
                }
            });
        });
    }

    // ===== INITIALIZE DESKTOP =====
    async function initDesktop() {
        await loadGames();
        updateClock();
        updateBattery();
        updateWeather();
        
        setInterval(updateClock, 1000);
        setInterval(updateBattery, 30000);
        setInterval(updateWeather, 600000);
        
        loadSavedWallpaper();
        renderDesktopIcons();
        renderStartApps();
        renderRecentApps();
        updateSoundIcon();
        initRecentAppsDrag();
        initWidgetDragging();
        
        // Event listeners
        const startBtn = document.getElementById('startBtn');
        if (startBtn) startBtn.onclick = toggleStartMenu;
        
        const bootSearch = document.getElementById('bootSearch');
        if (bootSearch) bootSearch.oninput = (e) => updateBootResults(e.target.value);
        if (bootSearch) bootSearch.onkeydown = (e) => {
            if (e.key === 'ArrowDown') { 
                e.preventDefault(); 
                if (window.selectedBootIndex < window.currentBootResults.length - 1) {
                    window.selectedBootIndex++; 
                    updateBootResults(document.getElementById('bootSearch').value);
                }
            } else if (e.key === 'ArrowUp') { 
                e.preventDefault(); 
                if (window.selectedBootIndex > 0) {
                    window.selectedBootIndex--; 
                    updateBootResults(document.getElementById('bootSearch').value);
                }
            } else if (e.key === 'Enter') { 
                e.preventDefault(); 
                if (window.currentBootResults[window.selectedBootIndex]) { 
                    showGameDetails(window.currentBootResults[window.selectedBootIndex]); 
                    toggleBootMenu(); 
                }
            }
        };
        
        const datetimeBtn = document.getElementById('datetimeBtn');
        if (datetimeBtn) datetimeBtn.onclick = () => document.getElementById('widgetsPanel').classList.toggle('open');
        
        const closeWidgetsPanel = document.getElementById('closeWidgetsPanel');
        if (closeWidgetsPanel) closeWidgetsPanel.onclick = () => document.getElementById('widgetsPanel').classList.remove('open');
        
        const soundControl = document.getElementById('soundControl');
        if (soundControl) soundControl.onclick = toggleSound;
        
        // Wallpaper menu
        const wallpaperMenu = document.getElementById('wallpaperMenu');
        const ctxWallpaperPresets = document.getElementById('ctxWallpaperPresets');
        if (ctxWallpaperPresets) ctxWallpaperPresets.onclick = () => wallpaperMenu.classList.toggle('open');
        
        const closeWallpaperMenu = document.getElementById('closeWallpaperMenu');
        if (closeWallpaperMenu) closeWallpaperMenu.onclick = () => wallpaperMenu.classList.remove('open');
        
        document.querySelectorAll('.wallpaper-option').forEach(opt => {
            opt.addEventListener('click', () => {
                setWallpaper(opt.dataset.wallpaper);
                if (wallpaperMenu) wallpaperMenu.classList.remove('open');
            });
        });
        
        // Widget toggles
        document.querySelectorAll('.widgets-panel-item').forEach(item => {
            item.addEventListener('click', () => {
                const widget = item.dataset.widget;
                const el = document.getElementById(`${widget}Widget`);
                if (el) {
                    if (el.style.display === 'none') {
                        el.style.display = 'block';
                        document.getElementById(`${widget}WidgetToggle`).textContent = '✅';
                    } else {
                        el.style.display = 'none';
                        document.getElementById(`${widget}WidgetToggle`).textContent = '❌';
                    }
                    localStorage.setItem(`widget_${widget}`, el.style.display !== 'none');
                    playSound('click');
                }
            });
        });
        
        // Context menu
        const ctxRefresh = document.getElementById('ctxRefresh');
        if (ctxRefresh) ctxRefresh.onclick = () => location.reload();
        
        const ctxWallpaper = document.getElementById('ctxWallpaper');
        if (ctxWallpaper) ctxWallpaper.onclick = uploadWallpaper;
        
        const ctxWidgets = document.getElementById('ctxWidgets');
        if (ctxWidgets) {
            ctxWidgets.onclick = () => {
                const widgetsDiv = document.getElementById('desktopWidgets');
                if (widgetsDiv) {
                    if (widgetsDiv.style.display === 'none') {
                        widgetsDiv.style.display = 'flex';
                        showToast('Widgets shown');
                    } else {
                        widgetsDiv.style.display = 'none';
                        showToast('Widgets hidden');
                    }
                }
            };
        }
        
        const ctxShortcuts = document.getElementById('ctxShortcuts');
        if (ctxShortcuts) ctxShortcuts.onclick = showShortcuts;
        
        // Right click
        const desktopBg = document.getElementById('desktopBg');
        if (desktopBg) {
            desktopBg.oncontextmenu = (e) => {
                e.preventDefault();
                const menu = document.getElementById('contextMenu');
                if (menu) {
                    menu.style.left = `${e.clientX}px`;
                    menu.style.top = `${e.clientY}px`;
                    menu.classList.add('visible');
                    setTimeout(() => document.addEventListener('click', () => menu.classList.remove('visible'), { once: true }), 10);
                }
            };
        }
        
        // Marquee selection
        if (desktopBg) desktopBg.addEventListener('mousedown', startMarquee);
        document.addEventListener('mousemove', updateMarquee);
        document.addEventListener('mouseup', endMarquee);
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && window.activeWindowId) {
                const win = window.windows.find(w => w.id === window.activeWindowId);
                if (win && win.maximized) toggleMaximize(window.activeWindowId);
                else if (window.bootMenuOpen) toggleBootMenu();
                else if (window.startMenuOpen) toggleStartMenu();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); toggleBootMenu(); }
            if ((e.ctrlKey || e.metaKey) && e.key === '/') { e.preventDefault(); showShortcuts(); }
            if ((e.ctrlKey || e.metaKey) && e.key === 'w') { e.preventDefault(); if (window.activeWindowId) closeWindowWithAnimation(window.activeWindowId); }
            if ((e.ctrlKey || e.metaKey) && e.key === 'm') { e.preventDefault(); if (window.activeWindowId) toggleMinimize(window.activeWindowId); }
        });
        
        showToast('🎉 Welcome to fanterOS!');
    }

    // ===== STARTUP =====
    const savedUserData = localStorage.getItem('fanter_currentUser');
    const loginScreen = document.getElementById('loginScreen');
    const desktop = document.getElementById('desktop');
    
    if (savedUserData && JSON.parse(savedUserData).username !== 'Guest') {
        const currentUser = JSON.parse(savedUserData);
        const userNameEl = document.getElementById('startUserName');
        const userEmailEl = document.getElementById('startUserEmail');
        if (userNameEl) userNameEl.textContent = currentUser.username;
        if (userEmailEl) userEmailEl.textContent = currentUser.email || `${currentUser.username}@fanter.os`;
        if (loginScreen) loginScreen.style.display = 'none';
        if (desktop) {
            desktop.style.display = 'block';
            desktop.classList.add('visible');
        }
        initDesktop();
    } else {
        if (loginScreen) loginScreen.classList.add('visible');
        
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) loginBtn.onclick = handleLogin;
        
        const showRegister = document.getElementById('showRegister');
        if (showRegister) showRegister.onclick = () => window.location.href = 'fantaccount.html';
    }
}

// ===== SUPABASE LOGIN =====
const SUPABASE_URL = "https://gvzgnclowylrrpovdvtw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2emduY2xvd3lscnJwb3ZkdnR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0NjM5ODEsImV4cCI6MjA5MjAzOTk4MX0.p7oeYBVX870iSK-TLDRj6pfW7wLj7HJsTHjNWaNpL7o";

let supabaseClient = null;

function initSupabase() {
    if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase ready');
    } else {
        setTimeout(initSupabase, 100);
    }
}
initSupabase();

async function handleLogin() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const errorEl = document.getElementById('loginError');
    
    if (!username || !password) {
        if (errorEl) errorEl.textContent = 'Enter username and password';
        return;
    }
    if (!supabaseClient) {
        if (errorEl) errorEl.textContent = 'Supabase connecting... try again';
        return;
    }
    try {
        const { data: profile, error: profileError } = await supabaseClient.from('profiles').select('id, email').eq('username', username).single();
        if (profileError || !profile) {
            if (errorEl) errorEl.textContent = 'User not found';
            return;
        }
        const { data, error } = await supabaseClient.auth.signInWithPassword({ email: profile.email, password: password });
        if (error) throw error;
        
        const currentUser = data.user;
        currentUser.username = username;
        localStorage.setItem('fanter_currentUser', JSON.stringify(currentUser));
        
        const userNameEl = document.getElementById('startUserName');
        const userEmailEl = document.getElementById('startUserEmail');
        if (userNameEl) userNameEl.textContent = username;
        if (userEmailEl) userEmailEl.textContent = profile.email;
        
        const loginScreen = document.getElementById('loginScreen');
        const desktop = document.getElementById('desktop');
        const fadeOverlay = document.getElementById('fadeOverlay');
        
        if (loginScreen) {
            loginScreen.style.transition = 'opacity 0.5s ease';
            loginScreen.style.opacity = '0';
        }
        
        setTimeout(() => {
            if (loginScreen) {
                loginScreen.classList.remove('visible');
                loginScreen.style.display = 'none';
            }
            if (fadeOverlay) fadeOverlay.classList.add('active');
            setTimeout(() => {
                if (desktop) {
                    desktop.style.display = 'block';
                    desktop.classList.add('visible');
                }
                if (fadeOverlay) fadeOverlay.classList.remove('active');
                showToast(`Welcome back, ${username}!`);
                showAchievement('Welcome Aboard', 3);
                initDesktop();
            }, 2000);
        }, 500);
    } catch(err) {
        const errorEl = document.getElementById('loginError');
        if (errorEl) errorEl.textContent = err.message;
    }
}
