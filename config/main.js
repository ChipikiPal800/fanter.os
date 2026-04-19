// ===== MAIN.JS - FANTER v0.3 =====
window.gamesData = [];
window.gameEarnings = JSON.parse(localStorage.getItem('gameEarnings') || '{}');
window.gamePlayCounts = JSON.parse(localStorage.getItem('gamePlayCounts') || '{}');

// ===== BIN CONFIG =====
const GAMES_BIN_ID = "69e4616f856a6821894c5ef5", REVIEWS_BIN_ID = "69e4369d856a6821894bd849", RATINGS_BIN_ID = "69e045ec856a6821893bc134";
const BIN_API_KEY = "$2a$10$2cPmKAGNYxPTRLV03OfVruvfhNpW/VHtJSzR.AVNHumZ7etLdT33.";
var globalRatings = {}, globalReviews = {}, userVotes = JSON.parse(localStorage.getItem('userVotes') || '{}');

// ===== HELPERS =====
function getCategoryColor(c) { return { action: '#ff4444', puzzle: '#44ff44', racing: '#ff8844', sports: '#44ff88', adventure: '#44aaff', platformer: '#ff44ff', strategy: '#88ff44', horror: '#aa44ff', arcade: '#ff44aa', simulation: '#44ffcc', sandbox: '#ff8844', multiplayer: '#ffaa44' }[c] || '#aaaaaa'; }
function getCategoryIcon(c) { return { action: '⚔️', puzzle: '🧩', racing: '🏎️', sports: '⚽', adventure: '🗺️', platformer: '🏃', strategy: '♟️', horror: '👻', arcade: '🕹️', simulation: '🏭', sandbox: '🎨', multiplayer: '👥' }[c] || '🎮'; }
function getDefaultDescription(c) { return { action: 'fast-paced action', puzzle: 'challenge your brain', racing: 'high-speed racing', sports: 'competitive sports', adventure: 'epic adventure', platformer: 'jump and run', strategy: 'plan and outsmart', horror: 'survive the terror', arcade: 'classic arcade', simulation: 'build and manage', sandbox: 'create and explore' }[c] || 'fun game'; }
function escapeHtml(s) { if (!s) return ''; return s.replace(/[&<>]/g, function(m) { if (m === '&') return '&amp;'; if (m === '<') return '&lt;'; if (m === '>') return '&gt;'; return m; }); }
function showToast(m) { var t = document.querySelector('.rating-toast'); if (!t) { t = document.createElement('div'); t.className = 'rating-toast'; document.body.appendChild(t); } t.textContent = m; t.classList.add('show'); setTimeout(function() { t.classList.remove('show'); }, 2000); }
function getCurrentUser() { return JSON.parse(localStorage.getItem('fanter_currentUser') || 'null'); }
function updateHeaderCoins() { var u = getCurrentUser(), e = document.getElementById('headerCoinAmount'); if (e && u) e.textContent = Math.floor((u.coins || 0) * 100) / 100; }
function getActiveCoinMultiplier() { var p = localStorage.getItem('equippedPet'); return { chinchilla: 1, dragon: 1.5, cat: 1.2, dog: 1.2, owl: 1.3, fox: 1.4 }[p] || 1; }

// ===== SYNC GAMES TO BIN =====
async function syncGamesToBin(data) {
  if (!data || !data.length) return;
  try {
    var binData = { games: [], lastUpdated: new Date().toISOString() };
    for (var i = 0; i < data.length; i++) {
      binData.games.push({ name: data[i].name, desc: data[i].desc || getDefaultDescription(data[i].category), category: data[i].category, url: data[i].url });
    }
    await fetch('https://api.jsonbin.io/v3/b/' + GAMES_BIN_ID, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-Master-Key': BIN_API_KEY }, body: JSON.stringify(binData) });
    console.log('✅ Games synced');
  } catch (e) { console.error('Sync failed:', e); }
}

// ===== REVIEWS =====
async function loadGlobalReviews() { try { var r = await fetch('https://api.jsonbin.io/v3/b/' + REVIEWS_BIN_ID + '/latest', { headers: { 'X-Master-Key': BIN_API_KEY } }), d = await r.json(); if (d.record && d.record.reviews) globalReviews = d.record.reviews; } catch (e) {} }
async function saveGlobalReviews() { try { await fetch('https://api.jsonbin.io/v3/b/' + REVIEWS_BIN_ID, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-Master-Key': BIN_API_KEY }, body: JSON.stringify({ reviews: globalReviews }) }); } catch (e) {} }
async function submitGameReview(game, user, text, rating) {
  if (!globalReviews[game]) globalReviews[game] = [];
  var rev = { username: user, text: text, rating: rating, date: new Date().toLocaleDateString(), timestamp: Date.now() };
  var idx = -1; for (var i = 0; i < globalReviews[game].length; i++) { if (globalReviews[game][i].username === user) { idx = i; break; } }
  if (idx !== -1) globalReviews[game][idx] = rev; else globalReviews[game].push(rev);
  await saveGlobalReviews();
  var local = JSON.parse(localStorage.getItem('gameReviews_' + game) || '[]'), lIdx = -1;
  for (var i = 0; i < local.length; i++) { if (local[i].username === user) { lIdx = i; break; } }
  if (lIdx !== -1) local[lIdx] = rev; else local.push(rev);
  localStorage.setItem('gameReviews_' + game, JSON.stringify(local));
}
function getGameReviews(game) {
  var revs = globalReviews[game] ? globalReviews[game].slice() : [], local = JSON.parse(localStorage.getItem('gameReviews_' + game) || '[]');
  for (var i = 0; i < local.length; i++) { var found = false; for (var j = 0; j < revs.length; j++) { if (revs[j].username === local[i].username && revs[j].timestamp === local[i].timestamp) { found = true; break; } } if (!found) revs.push(local[i]); }
  revs.sort(function(a, b) { return (b.timestamp || 0) - (a.timestamp || 0); });
  return revs;
}

// ===== RATINGS =====
async function loadGlobalRatings() { try { var r = await fetch('https://api.jsonbin.io/v3/b/' + RATINGS_BIN_ID + '/latest', { headers: { 'X-Master-Key': BIN_API_KEY } }), d = await r.json(); if (d.record && d.record.ratings) globalRatings = d.record.ratings; if (window.updateStarDisplays) window.updateStarDisplays(); } catch (e) {} }
async function saveGlobalRatings() { try { await fetch('https://api.jsonbin.io/v3/b/' + RATINGS_BIN_ID, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-Master-Key': BIN_API_KEY }, body: JSON.stringify({ ratings: globalRatings }) }); } catch (e) {} }
function submitRating(game, rating) {
  if (!globalRatings[game]) globalRatings[game] = { total: 0, count: 0, average: 0 };
  var user = getCurrentUser();
  if (user) { user.stats = user.stats || { ratingsGiven: 0 }; user.stats.ratingsGiven++; localStorage.setItem('fanter_currentUser', JSON.stringify(user)); }
  if (userVotes[game]) { globalRatings[game].total -= userVotes[game]; globalRatings[game].count--; }
  globalRatings[game].total += rating; globalRatings[game].count++; globalRatings[game].average = globalRatings[game].total / globalRatings[game].count;
  userVotes[game] = rating; localStorage.setItem('userVotes', JSON.stringify(userVotes));
  saveGlobalRatings(); showToast('You rated "' + game + '" ' + rating + '★!');
}

// ===== ACCOUNT =====
function updateUserInStorage(u) { localStorage.setItem('fanter_currentUser', JSON.stringify(u)); var users = JSON.parse(localStorage.getItem('fanter_users') || '[]'), i = -1; for (var j = 0; j < users.length; j++) { if (users[j].id === u.id) { i = j; break; } } if (i !== -1) { users[i] = u; localStorage.setItem('fanter_users', JSON.stringify(users)); } }
function syncFavoriteToAccount(game, add) { var u = getCurrentUser(); if (!u) return; u.favorites = u.favorites || []; if (add) { if (u.favorites.indexOf(game) === -1) u.favorites.push(game); } else { u.favorites = u.favorites.filter(function(f) { return f !== game; }); } u.stats.favoritesCount = u.favorites.length; updateUserInStorage(u); localStorage.setItem('favourites', JSON.stringify(u.favorites)); }
function trackPlayedGame(game) { var u = getCurrentUser(), earned = 0.05 * getActiveCoinMultiplier(); window.gameEarnings[game] = (window.gameEarnings[game] || 0) + earned; window.gamePlayCounts[game] = (window.gamePlayCounts[game] || 0) + 1; localStorage.setItem('gameEarnings', JSON.stringify(window.gameEarnings)); localStorage.setItem('gamePlayCounts', JSON.stringify(window.gamePlayCounts)); if (u) { u.coins = (u.coins || 0) + earned; u.playedGames = u.playedGames || []; var idx = u.playedGames.indexOf(game); if (idx !== -1) u.playedGames.splice(idx, 1); u.playedGames.unshift(game); if (u.playedGames.length > 50) u.playedGames.pop(); u.stats.gamesPlayed = u.playedGames.length; updateUserInStorage(u); } updateHeaderCoins(); return earned; }

// ===== DOM READY =====
document.addEventListener('DOMContentLoaded', function() {
  var sitename = "fanter beta.", subtext = "v0.3, achievements added, shop, pets, and more! :3";
  document.title = document.title + " | " + sitename;
  document.getElementById("title").innerHTML = sitename;
  document.getElementById("subtitle").innerHTML = subtext;

  function getFavourites() { return JSON.parse(localStorage.getItem("favourites") || "[]"); }

  window.toggleFavourite = function(game) {
    var favs = getFavourites(), isAdding = favs.indexOf(game) === -1;
    if (isAdding) favs.push(game); else favs = favs.filter(function(f) { return f !== game; });
    localStorage.setItem("favourites", JSON.stringify(favs));
    var btn = document.querySelector('.game-fav-btn[data-game="' + game.replace(/['"]/g, '\\"') + '"]');
    if (btn) { btn.textContent = isAdding ? "★" : "☆"; if (isAdding) btn.classList.add('active'); else btn.classList.remove('active'); }
    syncFavoriteToAccount(game, isAdding);
    if (typeof checkAchievements === 'function') setTimeout(checkAchievements, 100);
  };

  window.displayFilteredGames = function(games) {
    var container = document.getElementById("gamesContainer");
    if (!container) return;
    container.innerHTML = "";
    if (!games || !games.length) { container.innerHTML = '<div style="text-align:center;padding:40px;color:rgba(255,255,255,0.5);">no games found 😔</div>'; return; }
    var favs = getFavourites();
    for (var i = 0; i < games.length; i++) {
      var g = games[i], earned = window.gameEarnings[g.name] || 0, plays = window.gamePlayCounts[g.name] || 0, isFav = favs.indexOf(g.name) !== -1;
          var avg = '0.0';
          if (globalRatings[g.name] && globalRatings[g.name].average != null) {
          avg = globalRatings[g.name].average.toFixed(1);
}
      var img = g.image; if (img && img.indexOf('http') !== 0) img = 'https://via.placeholder.com/200x113?text=No+Image';
      var color = getCategoryColor(g.category), icon = getCategoryIcon(g.category), short = g.name.length > 18 ? g.name.substring(0, 16) + '...' : g.name;
      var div = document.createElement("div"); div.className = "game"; div.setAttribute("data-game-name", g.name);
      div.innerHTML = '<div class="game-image-container"><img src="' + img + '" alt="' + escapeHtml(g.name) + '" loading="lazy"></div><div class="game-info"><div class="game-title-row"><span class="game-name" title="' + escapeHtml(g.name) + '">' + escapeHtml(short) + '</span><button class="game-fav-btn ' + (isFav ? 'active' : '') + '" data-game="' + escapeHtml(g.name) + '">' + (isFav ? '★' : '☆') + '</button></div><div class="game-category-tag" style="background:' + color + '20;color:' + color + '">' + icon + ' ' + (g.category||'other') + '</div><div class="game-stats-row"><span>🎮 ' + plays + '</span><span>🪙 ' + Math.floor(earned*100)/100 + '</span><span>⏱️ ' + (g.loadTime||'1-3s') + '</span></div><div class="game-rating-row"><div class="game-stars">' + [1,2,3,4,5].map(function(s){ return '<span class="game-star" data-value="' + s + '">★</span>'; }).join('') + '</div><span class="game-rating-text">' + avg + '</span></div><button class="game-play-btn" data-game="' + escapeHtml(g.name) + '" data-url="' + escapeHtml(g.url) + '">▶ play</button></div>';
      container.appendChild(div);
    }
    attachGameCardEvents(); updateStarDisplays();
  };

  function updateStarDisplays() {
    var cards = document.querySelectorAll('.game');
    for (var i = 0; i < cards.length; i++) {
      var c = cards[i], n = c.getAttribute('data-game-name'), r = userVotes[n] || 0;
      var stars = c.querySelectorAll('.game-star');
      for (var j = 0; j < stars.length; j++) { if (j < r) stars[j].classList.add('active'); else stars[j].classList.remove('active'); }
      var t = c.querySelector('.game-rating-text');
      if (t && globalRatings[n]) t.textContent = globalRatings[n].average.toFixed(1);
    }
  }
  window.updateStarDisplays = updateStarDisplays;

  function attachGameCardEvents() {
    document.querySelectorAll('.game-play-btn').forEach(function(b) { b.onclick = function(e) { e.stopPropagation(); var n = b.dataset.game, u = b.dataset.url; if (n && u) { trackPlayedGame(n); if (typeof trackGamePlayCount === 'function') trackGamePlayCount(n); window.open('play.html?gameurl=' + encodeURIComponent(u) + '&game=' + encodeURIComponent(n), '_blank'); } }; });
    document.querySelectorAll('.game-fav-btn').forEach(function(b) { b.onclick = function(e) { e.stopPropagation(); var n = b.dataset.game; if (n) { window.toggleFavourite(n); var f = JSON.parse(localStorage.getItem("favourites")||"[]").indexOf(n) !== -1; b.textContent = f ? '★' : '☆'; if (f) b.classList.add('active'); else b.classList.remove('active'); } }; });
    document.querySelectorAll('.game-star').forEach(function(s) { s.onclick = function(e) { e.stopPropagation(); var c = s.closest('.game'), n = c.dataset.gameName, v = parseInt(s.dataset.value); if (n) { submitRating(n, v); var stars = c.querySelectorAll('.game-star'); for (var i = 0; i < stars.length; i++) { if (i < v) stars[i].classList.add('active'); else stars[i].classList.remove('active'); } var t = c.querySelector('.game-rating-text'); if (t && globalRatings[n]) t.innerHTML = globalRatings[n].average.toFixed(1); } }; });
    document.querySelectorAll('.game').forEach(function(c) { c.onclick = function(e) { if (e.target.tagName === 'BUTTON' || e.target.classList.contains('game-star')) return; var n = c.dataset.gameName, g = window.gamesData.find(function(g) { return g.name === n; }); if (g) { var img = c.querySelector('.game-image-container img'); showGameDetailsModal(g.name, g.url, img ? img.src : '', g.desc || getDefaultDescription(g.category), g.category, g.loadTime, g.developer, g.releaseDate); } }; });
  }

  function handleSearchInput() {
    var v = (document.getElementById("searchInput")?.value || '').toLowerCase(), favOn = localStorage.getItem("favFilter") === "true", favs = getFavourites();
    var filtered = window.gamesData.filter(function(g) { return (favOn ? favs.indexOf(g.name) !== -1 : true) && g.name.toLowerCase().indexOf(v) !== -1; });
    window.displayFilteredGames(filtered);
  }

  window.toggleFavFilter = function() { var c = localStorage.getItem("favFilter") === "true"; localStorage.setItem("favFilter", !c); handleSearchInput(); var b = document.getElementById("favToggleBtn"); if (b) b.textContent = !c ? "show: on ✅" : "show: off ❌"; };
  window.toggleFavSidebar = function() { var b = document.getElementById("favSidebarBtn"); if (!b) return; var o = localStorage.getItem("favFilter") === "true"; if (!o) { b.classList.add('active'); b.classList.add('visible'); } else { b.classList.remove('active'); b.classList.remove('visible'); } b.textContent = !o ? "✕" : "★"; };

  fetch("./config/games.json").then(function(r) { return r.json(); }).then(function(d) {
    window.gamesData = d; handleSearchInput();
    console.log("✅ Loaded " + d.length + " games!");
    var last = localStorage.getItem('lastGamesBinSync'), today = new Date().toDateString();
    if (last !== today) { syncGamesToBin(d); localStorage.setItem('lastGamesBinSync', today); } else console.log('⏭️ Games already synced today');
    if (typeof updateGameOfDay === 'function') updateGameOfDay();
    if (typeof loadUserFavorites === 'function') loadUserFavorites();
  }).catch(function(e) { console.error("Error fetching games:", e); });

  document.getElementById("searchInput")?.addEventListener("input", handleSearchInput);
  setInterval(updateHeaderCoins, 1000); updateHeaderCoins();
});

// ===== GAME DETAILS MODAL =====
function showGameDetailsModal(n, u, img, desc, cat, load, dev, rel) {
  var old = document.getElementById('gameModal'); if (old) old.remove();
  var plays = window.gamePlayCounts[n] || 0, earned = window.gameEarnings[n] || 0, favs = JSON.parse(localStorage.getItem("favourites")||"[]"), isFav = favs.indexOf(n) !== -1;
  var ur = (typeof userVotes !== 'undefined' && userVotes[n]) || 0, avg = '0.0', cnt = 0;
  if (globalRatings[n]) { avg = globalRatings[n].average.toFixed(1); cnt = globalRatings[n].count; }
  var hrs = Math.floor(plays * 0.5), color = getCategoryColor(cat), icon = getCategoryIcon(cat), revs = getGameReviews(n), user = getCurrentUser(), hasRev = revs.some(function(r) { return r.username === (user && user.username); });
  var modal = document.createElement('div'); modal.id = 'gameModal'; modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);backdrop-filter:blur(8px);z-index:20000;display:flex;align-items:center;justify-content:center;';
  
  var html = '<div style="background:linear-gradient(135deg,#1a1a2e,#0f0f2a);border-radius:20px;max-width:900px;width:90%;max-height:85vh;overflow-y:auto;position:relative;">';
  html += '<button onclick="this.closest(\'#gameModal\').remove()" style="position:absolute;top:15px;right:15px;background:rgba(0,0,0,0.5);border:none;border-radius:50%;width:35px;height:35px;font-size:20px;cursor:pointer;color:white;z-index:10;">✕</button>';
  html += '<div style="position:relative;height:200px;overflow:hidden;"><img src="' + img + '" alt="' + escapeHtml(n) + '" style="width:100%;height:100%;object-fit:cover;filter:brightness(0.7);">';
  html += '<div style="position:absolute;bottom:0;left:0;right:0;padding:20px;background:linear-gradient(transparent,rgba(0,0,0,0.9));"><div style="font-size:28px;font-weight:bold;color:white;font-family:Orbitron">' + escapeHtml(n) + '</div>';
  html += '<div style="display:inline-block;font-size:12px;padding:4px 12px;border-radius:20px;margin-top:10px;background:' + color + '20;color:' + color + '">' + icon + ' ' + (cat||'other') + '</div></div></div>';
  html += '<div style="display:flex;gap:5px;padding:15px 20px 0;border-bottom:1px solid rgba(255,255,255,0.1);"><button class="modal-tab active" data-tab="details" style="background:none;border:none;color:white;padding:10px 20px;cursor:pointer;font-size:14px;border-bottom:2px solid #ffcc00;">📋 details</button>';
  html += '<button class="modal-tab" data-tab="reviews" style="background:none;border:none;color:rgba(255,255,255,0.5);padding:10px 20px;cursor:pointer;font-size:14px;border-bottom:2px solid transparent;">💬 reviews (' + revs.length + ')</button></div>';
  html += '<div id="modalTab-details" class="modal-tab-content" style="display:block;"><div style="display:flex;flex-wrap:wrap;padding:20px;gap:20px;"><div style="width:200px;">';
  html += '<div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:15px;text-align:center;margin-bottom:15px;"><div style="font-size:11px;color:rgba(255,255,255,0.5);">TIME PLAYED</div><div style="font-size:28px;font-weight:bold;color:#00ff88;">' + hrs + 'h</div></div>';
  html += '<div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:15px;">';
  html += '<div style="display:flex;justify-content:space-between;padding:8px 0;"><span>🎮 PLAYS</span><span style="color:#ffcc00;">' + plays + '</span></div>';
  html += '<div style="display:flex;justify-content:space-between;padding:8px 0;"><span>🪙 EARNED</span><span style="color:#ffcc00;">' + Math.floor(earned*100)/100 + '</span></div>';
  html += '<div style="display:flex;justify-content:space-between;padding:8px 0;"><span>⭐ RATING</span><span style="color:#ffcc00;">' + avg + '/5 (' + cnt + ')</span></div>';
  html += '<div style="display:flex;justify-content:space-between;padding:8px 0;"><span>⏱️ LOAD</span><span style="color:#ffcc00;">' + (load||'1-3s') + '</span></div>';
  if (dev) html += '<div style="display:flex;justify-content:space-between;padding:8px 0;"><span>👨‍💻 DEV</span><span style="color:#ffcc00;">' + escapeHtml(dev) + '</span></div>';
  html += '</div></div><div style="flex:1;"><div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:15px;margin-bottom:15px;"><p>' + escapeHtml(desc) + '</p></div>';
  html += '<div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:15px;margin-bottom:15px;"><div style="display:flex;gap:5px;">';
  for (var s = 1; s <= 5; s++) html += '<span class="modal-star" data-value="' + s + '" style="font-size:24px;cursor:pointer;color:' + (ur>=s?'#ffcc00':'rgba(255,255,255,0.2)') + ';">★</span>';
  html += '</div><div style="font-size:11px;color:rgba(255,255,255,0.5);margin-top:5px;">your rating: ' + (ur>0?'★'.repeat(ur)+'☆'.repeat(5-ur):'not rated') + '</div></div>';
  html += '<div style="display:flex;gap:15px;"><button id="modalPlayBtn" style="flex:1;background:linear-gradient(135deg,#2d5ae3,#1a3a8a);border:none;border-radius:30px;padding:12px;color:white;font-weight:bold;cursor:pointer;">🎮 PLAY NOW</button>';
  html += '<button id="modalFavBtn" style="background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:30px;padding:12px 20px;color:white;cursor:pointer;">' + (isFav?'★ FAVORITED':'☆ FAVORITE') + '</button></div></div></div></div>';
  html += '<div id="modalTab-reviews" class="modal-tab-content" style="display:none;padding:20px;">';
  if (user && user.username !== 'Guest' && !hasRev) {
    html += '<div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:15px;margin-bottom:20px;"><div style="color:white;margin-bottom:10px;">write a review</div>';
    html += '<textarea id="reviewText" placeholder="share your thoughts..." style="width:100%;padding:12px;border-radius:10px;border:1px solid rgba(45,90,227,0.4);background:rgba(0,0,0,0.3);color:white;resize:vertical;min-height:80px;margin-bottom:10px;"></textarea>';
    html += '<div style="display:flex;gap:10px;align-items:center;"><div id="reviewStars" style="display:flex;gap:5px;">';
    for (var s = 1; s <= 5; s++) html += '<span class="review-star" data-value="' + s + '" style="font-size:20px;cursor:pointer;color:rgba(255,255,255,0.2);">★</span>';
    html += '</div><button id="submitReviewBtn" style="background:linear-gradient(135deg,#2d5ae3,#1a3a8a);border:none;border-radius:20px;padding:8px 20px;color:white;margin-left:8px;cursor:pointer;">post</button></div></div>';
  } else if (user && user.username !== 'Guest') {
    html += '<div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:20px;text-align:center;margin-bottom:20px;"><p style="color:rgba(255,255,255,0.5);">you\'ve already reviewed</p>';
    html += '<button id="deleteReviewBtn" style="background:rgba(220,50,50,0.2);border:1px solid rgba(220,50,50,0.5);border-radius:20px;padding:8px 20px;color:#ff6666;margin-top:10px;cursor:pointer;">delete</button></div>';
  } else {
    html += '<div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:20px;text-align:center;margin-bottom:20px;"><p style="color:rgba(255,255,255,0.5);">log in to review</p></div>';
  }
  html += '<div id="reviewsList">';
  if (revs.length) {
    for (var i = 0; i < revs.length; i++) {
      var r = revs[i];
      html += '<div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:15px;margin-bottom:10px;border-left:3px solid ' + (r.rating>=4?'#00ff88':r.rating>=2?'#ffcc00':'#ff4444') + ';">';
      html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;"><div style="width:30px;height:30px;background:linear-gradient(135deg,#2d5ae3,#ffcc00);border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;">' + r.username[0].toUpperCase() + '</div>';
      html += '<div><div style="font-weight:bold;color:white;">' + escapeHtml(r.username) + '</div><div style="font-size:10px;color:rgba(255,255,255,0.4);">' + r.date + '</div></div>';
      html += '<div style="margin-left:auto;color:#ffcc00;">' + '★'.repeat(r.rating) + '☆'.repeat(5-r.rating) + '</div></div>';
      html += '<div style="padding-left:40px;color:rgba(255,255,255,0.8);">' + escapeHtml(r.text) + '</div></div>';
    }
  } else {
    html += '<div style="text-align:center;padding:40px;color:rgba(255,255,255,0.5);"><div style="font-size:48px;">💬</div>no reviews yet</div>';
  }
  html += '</div></div></div>';
  modal.innerHTML = html;
  document.body.appendChild(modal);
  
  modal.querySelectorAll('.modal-tab').forEach(function(t) {
    t.onclick = function() {
      modal.querySelectorAll('.modal-tab').forEach(function(x) { x.style.color = 'rgba(255,255,255,0.5)'; x.style.borderBottom = '2px solid transparent'; });
      t.style.color = 'white'; t.style.borderBottom = '2px solid #ffcc00';
      modal.querySelectorAll('.modal-tab-content').forEach(function(c) { c.style.display = 'none'; });
      document.getElementById('modalTab-' + t.dataset.tab).style.display = 'block';
    };
  });
  
  var sel = 0;
  modal.querySelectorAll('.review-star').forEach(function(s) {
    s.onmouseenter = function() { var v = parseInt(s.dataset.value); modal.querySelectorAll('.review-star').forEach(function(x, i) { x.style.color = i < v ? '#ffcc00' : 'rgba(255,255,255,0.2)'; }); };
    s.onmouseleave = function() { modal.querySelectorAll('.review-star').forEach(function(x, i) { x.style.color = i < sel ? '#ffcc00' : 'rgba(255,255,255,0.2)'; }); };
    s.onclick = function() { sel = parseInt(s.dataset.value); modal.querySelectorAll('.review-star').forEach(function(x, i) { x.style.color = i < sel ? '#ffcc00' : 'rgba(255,255,255,0.2)'; }); };
  });
  
  var submitBtn = document.getElementById('submitReviewBtn');
  if (submitBtn) submitBtn.addEventListener('click', async function() { var t = document.getElementById('reviewText').value.trim(); if (!t) return alert('write something!'); if (!sel) return alert('pick a rating!'); await submitGameReview(n, user.username, t, sel); showGameDetailsModal(n, u, img, desc, cat, load, dev, rel); showToast('✅ Review posted!'); });
  var delBtn = document.getElementById('deleteReviewBtn');
  if (delBtn) delBtn.addEventListener('click', async function() { if (!confirm('delete?')) return; await deleteGameReview(n, user.username); showGameDetailsModal(n, u, img, desc, cat, load, dev, rel); showToast('🗑️ Deleted'); });
  document.getElementById('modalPlayBtn').onclick = function() { trackPlayedGame(n); window.open('play.html?gameurl=' + encodeURIComponent(u) + '&game=' + encodeURIComponent(n), '_blank'); modal.remove(); };
  document.getElementById('modalFavBtn').onclick = function() { window.toggleFavourite(n); this.textContent = JSON.parse(localStorage.getItem("favourites")||"[]").indexOf(n) !== -1 ? '★ FAVORITED' : '☆ FAVORITE'; };
  document.querySelectorAll('.modal-star').forEach(function(s) { s.onclick = function() { var v = parseInt(this.dataset.value); submitRating(n, v); document.querySelectorAll('.modal-star').forEach(function(x, i) { x.style.color = i < v ? '#ffcc00' : 'rgba(255,255,255,0.2)'; }); }; });
}

async function deleteGameReview(game, user) {
  if (!globalReviews[game]) return;
  globalReviews[game] = globalReviews[game].filter(function(r) { return r.username !== user; });
  await saveGlobalReviews();
  var local = JSON.parse(localStorage.getItem('gameReviews_' + game) || '[]');
  local = local.filter(function(r) { return r.username !== user; });
  localStorage.setItem('gameReviews_' + game, JSON.stringify(local));
}

// ===== ACHIEVEMENTS =====
function trackGamePlayCount(g) { window.gamePlayCounts[g] = (window.gamePlayCounts[g]||0)+1; localStorage.setItem('gamePlayCounts', JSON.stringify(window.gamePlayCounts)); if(window.gamePlayCounts[g]>=50&&typeof checkAndUnlockAchievement==='function') checkAndUnlockAchievement(59); if(window.gamePlayCounts[g]>=100) checkAndUnlockAchievement(60); }
function checkAndUnlockAchievement(id) { var u = getCurrentUser(); if(!u) return; var a = JSON.parse(localStorage.getItem('fanter_achievements')||'{}'); if(a[id]) return; a[id]=true; localStorage.setItem('fanter_achievements',JSON.stringify(a)); var r = id<=10?3:id<=20?5:id<=30?10:id<=40?17.5:id<=50?25:50; u.coins = (u.coins||0)+r; u.achievements = a; updateUserInStorage(u); updateHeaderCoins(); console.log('🏆 Achievement unlocked! +'+r+'🪙'); }
function initAchievementTriggers() { /* your existing triggers */ }
initAchievementTriggers();
loadGlobalRatings(); loadGlobalReviews();
console.log('💀 Type "crashFanter()" for a surprise...');
