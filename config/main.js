// ===== MAIN.JS - CLEAN CARD DESIGN =====

// Make gamesData global
window.gamesData = [];
window.gameEarnings = JSON.parse(localStorage.getItem('gameEarnings') || '{}');
window.gamePlayCounts = JSON.parse(localStorage.getItem('gamePlayCounts') || '{}');

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  var sitename = "fanter beta.";
  var subtext = "v0.3, achievements added, shop, pets, and more! :3";

  var serverUrl1 = "https://gms.parcoil.com";
  var currentPageTitle = document.title;
  document.title = currentPageTitle + " | " + sitename;

  function getFavourites() {
    return JSON.parse(localStorage.getItem("favourites") || "[]");
  }

  window.toggleFavourite = function(gameName) {
    var favs = getFavourites();
    var isAdding = false;
    
    if (favs.indexOf(gameName) !== -1) {
      favs = favs.filter(function(f) { return f !== gameName; });
      isAdding = false;
    } else {
      favs.push(gameName);
      isAdding = true;
    }
    localStorage.setItem("favourites", JSON.stringify(favs));
    
    var favBtn = document.querySelector('.game-fav-btn[data-game="' + gameName.replace(/['"]/g, '\\"') + '"]');
    if (favBtn) {
      favBtn.textContent = isAdding ? "★" : "☆";
      favBtn.classList.toggle('active', isAdding);
    }
    
    if (typeof syncFavoriteToAccount === 'function') {
      syncFavoriteToAccount(gameName, isAdding);
    }
    
    if (typeof checkAchievements === 'function') {
      setTimeout(function() { checkAchievements(); }, 100);
    }
  };

  window.displayFilteredGames = function(filteredGames) {
    var gamesContainer = document.getElementById("gamesContainer");
    if (!gamesContainer) return;
    gamesContainer.innerHTML = "";
    
    if (!filteredGames || filteredGames.length === 0) {
      gamesContainer.innerHTML = '<div style="text-align:center;padding:40px;color:rgba(255,255,255,0.5);">no games found 😔</div>';
      return;
    }
    
    var favourites = getFavourites();
    
    for (var i = 0; i < filteredGames.length; i++) {
      var game = filteredGames[i];
      var gameDiv = document.createElement("div");
      gameDiv.className = "game";
      gameDiv.setAttribute("data-game-name", game.name);
      
      var earnedCoins = window.gameEarnings[game.name] || 0;
      var playCount = window.gamePlayCounts[game.name] || 0;
      var isFav = favourites.indexOf(game.name) !== -1;
      
      var avgRating = '0.0';
      if (typeof globalRatings !== 'undefined' && globalRatings[game.name]) {
        avgRating = globalRatings[game.name].average.toFixed(1);
      }
      
      var imageSrc;
      if (game.image && game.image.indexOf('http') === 0) {
        imageSrc = game.image;
      } else if (game.image) {
        imageSrc = serverUrl1 + "/" + game.url + "/" + game.image;
      } else {
        imageSrc = 'https://via.placeholder.com/200x113?text=No+Image';
      }
      
      var categoryColor = getCategoryColor(game.category);
      var categoryIcon = getCategoryIcon(game.category);
      var shortName = game.name.length > 18 ? game.name.substring(0, 16) + '...' : game.name;
      
      gameDiv.innerHTML = `
        <div class="game-image-container">
          <img src="${imageSrc}" alt="${escapeHtml(game.name)}" loading="lazy">
        </div>
        <div class="game-info">
          <div class="game-title-row">
            <span class="game-name" title="${escapeHtml(game.name)}">${escapeHtml(shortName)}</span>
            <button class="game-fav-btn ${isFav ? 'active' : ''}" data-game="${escapeHtml(game.name)}">${isFav ? '★' : '☆'}</button>
          </div>
          <div class="game-category-tag" style="background: ${categoryColor}20; color: ${categoryColor}">${categoryIcon} ${game.category || 'other'}</div>
          <div class="game-stats-row">
            <span>🎮 ${playCount}</span>
            <span>🪙 ${Math.floor(earnedCoins * 100) / 100}</span>
            <span>⏱️ ${game.loadTime || '1-3s'}</span>
          </div>
          <div class="game-rating-row">
            <div class="game-stars">
              ${[1,2,3,4,5].map(function(s) { 
                return '<span class="game-star" data-value="' + s + '">★</span>';
              }).join('')}
            </div>
            <span class="game-rating-text">${avgRating}</span>
          </div>
          <button class="game-play-btn" data-game="${escapeHtml(game.name)}" data-url="${escapeHtml(game.url)}">▶ play</button>
        </div>
      `;
      
      gamesContainer.appendChild(gameDiv);
    }
    
    attachGameCardEvents();
    updateStarDisplays(); // FIX: now defined below
  };

  // ===== FIX: updateStarDisplays — was called but never defined =====
  function updateStarDisplays() {
    if (typeof globalRatings === 'undefined' || typeof userVotes === 'undefined') return;
    
    document.querySelectorAll('.game').forEach(function(gameCard) {
      var gameName = gameCard.getAttribute('data-game-name');
      if (!gameName) return;
      
      var userRating = userVotes[gameName] || 0;
      var stars = gameCard.querySelectorAll('.game-star');
      
      for (var i = 0; i < stars.length; i++) {
        if (i < userRating) {
          stars[i].classList.add('active');
        } else {
          stars[i].classList.remove('active');
        }
      }
      
      var ratingText = gameCard.querySelector('.game-rating-text');
      if (ratingText && globalRatings[gameName]) {
        ratingText.textContent = globalRatings[gameName].average.toFixed(1);
      }
    });
  }

  // Make updateStarDisplays available globally so ratings.js / other scripts can call it too
  window.updateStarDisplays = updateStarDisplays;

  function updateStarDisplay(gameName, userRating) {
    var gameCard = document.querySelector('.game[data-game-name="' + CSS.escape(gameName) + '"]');
    if (gameCard) {
      var stars = gameCard.querySelectorAll('.game-star');
      for (var i = 0; i < stars.length; i++) {
        if (i < userRating) {
          stars[i].classList.add('active');
        } else {
          stars[i].classList.remove('active');
        }
      }
      var ratingText = gameCard.querySelector('.game-rating-text');
      if (ratingText && globalRatings[gameName]) {
        ratingText.innerHTML = globalRatings[gameName].average.toFixed(1);
      }
    }
    
    var modalStars = document.querySelectorAll('.modal-star');
    if (modalStars.length > 0) {
      for (var i = 0; i < modalStars.length; i++) {
        if (i < userRating) {
          modalStars[i].style.color = '#ffcc00';
        } else {
          modalStars[i].style.color = 'rgba(255,255,255,0.2)';
        }
      }
    }
  }
  
  function attachGameCardEvents() {
    document.querySelectorAll('.game-play-btn').forEach(function(btn) {
      btn.onclick = function(e) {
        e.stopPropagation();
        var gameName = btn.getAttribute('data-game');
        var gameUrl = btn.getAttribute('data-url');
        if (gameName && gameUrl) {
          if (typeof trackPlayedGame === 'function') trackPlayedGame(gameName);
          if (typeof trackGamePlayCount === 'function') trackGamePlayCount(gameName);
          var playUrl = 'play.html?gameurl=' + encodeURIComponent(gameUrl) + '&game=' + encodeURIComponent(gameName);
          window.open(playUrl, '_blank');
        }
      };
    });
    
    document.querySelectorAll('.game-fav-btn').forEach(function(btn) {
      btn.onclick = function(e) {
        e.stopPropagation();
        var gameName = btn.getAttribute('data-game');
        if (gameName && typeof window.toggleFavourite === 'function') {
          window.toggleFavourite(gameName);
          var isFav = JSON.parse(localStorage.getItem("favourites") || "[]").indexOf(gameName) !== -1;
          btn.textContent = isFav ? '★' : '☆';
          btn.classList.toggle('active', isFav);
        }
      };
    });
    
    document.querySelectorAll('.game-star').forEach(function(star) {
      star.onclick = function(e) {
        e.stopPropagation();
        var gameDiv = star.closest('.game');
        var gameName = gameDiv.getAttribute('data-game-name');
        var value = parseInt(star.getAttribute('data-value'));
        if (gameName && typeof submitRating === 'function') {
          submitRating(gameName, value);
          var stars = gameDiv.querySelectorAll('.game-star');
          for (var i = 0; i < stars.length; i++) {
            if (i < value) {
              stars[i].classList.add('active');
            } else {
              stars[i].classList.remove('active');
            }
          }
          var ratingText = gameDiv.querySelector('.game-rating-text');
          if (ratingText && typeof globalRatings !== 'undefined' && globalRatings[gameName]) {
            ratingText.innerHTML = globalRatings[gameName].average.toFixed(1);
          }
        }
      };
    });
    
    document.querySelectorAll('.game').forEach(function(card) {
      card.onclick = function(e) {
        if (e.target.tagName === 'BUTTON' || e.target.classList.contains('game-star')) return;
        var gameName = card.getAttribute('data-game-name');
        if (gameName && window.gamesData) {
          var gameData = null;
          for (var i = 0; i < window.gamesData.length; i++) {
            if (window.gamesData[i].name === gameName) {
              gameData = window.gamesData[i];
              break;
            }
          }
          if (gameData) {
            var img = card.querySelector('.game-image-container img');
            showGameDetailsModal(
              gameData.name,
              gameData.url,
              img ? img.src : '',
              gameData.desc || getDefaultDescription(gameData.category),
              gameData.category,
              gameData.loadTime,
              gameData.developer,
              gameData.releaseDate
            );
          }
        }
      };
    });
  }

  function handleSearchInput() {
    var searchInput = document.getElementById("searchInput");
    if (!searchInput) return;
    var searchInputValue = searchInput.value.toLowerCase();
    
    if (typeof checkSecretNames === 'function') {
      checkSecretNames(searchInputValue);
    }
    
    var filteredGames;
    var favFilterOn = localStorage.getItem("favFilter") === "true";
    if (favFilterOn) {
      var favs = getFavourites();
      filteredGames = window.gamesData.filter(function(game) {
        return favs.indexOf(game.name) !== -1 && game.name.toLowerCase().indexOf(searchInputValue) !== -1;
      });
    } else {
      filteredGames = window.gamesData.filter(function(game) {
        return game.name.toLowerCase().indexOf(searchInputValue) !== -1;
      });
    }
    window.displayFilteredGames(filteredGames);
  }

  window.toggleFavFilter = function() {
    var current = localStorage.getItem("favFilter") === "true";
    localStorage.setItem("favFilter", (!current).toString());
    handleSearchInput();
    var favToggleBtn = document.getElementById("favToggleBtn");
    if (favToggleBtn) {
      var on = localStorage.getItem("favFilter") === "true";
      favToggleBtn.textContent = on ? "show: on ✅" : "show: off ❌";
    }
  };

  window.toggleFavSidebar = function() {
    var btn = document.getElementById("favSidebarBtn");
    if (!btn) return;
    var favFilterOn = localStorage.getItem("favFilter") === "true";
    btn.classList.toggle("active", !favFilterOn);
    btn.classList.toggle("visible", !favFilterOn);
    btn.textContent = !favFilterOn ? "✕" : "★";
  };

  fetch("./config/games.json")
    .then(function(response) { return response.json(); })
    .then(function(data) {
      window.gamesData = data;
      handleSearchInput();
      console.log("✅ Loaded " + window.gamesData.length + " games successfully!");
      if (typeof updateGameOfDay === 'function') updateGameOfDay();
      if (typeof loadUserFavorites === 'function') loadUserFavorites();
    })
    .catch(function(error) { console.error("Error fetching games:", error); });

  var searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", handleSearchInput);
  }
  
  var titleEl = document.getElementById("title");
  if (titleEl) titleEl.innerHTML = sitename;
  
  var subtitleEl = document.getElementById("subtitle");
  if (subtitleEl) subtitleEl.innerHTML = subtext;
});

// ===== HELPER FUNCTIONS =====
function getCategoryColor(category) {
  var colors = {
    'action': '#ff4444', 'puzzle': '#44ff44', 'racing': '#ff8844',
    'sports': '#44ff88', 'adventure': '#44aaff', 'platformer': '#ff44ff',
    'strategy': '#88ff44', 'horror': '#aa44ff', 'arcade': '#ff44aa',
    'simulation': '#44ffcc', 'sandbox': '#ff8844', 'multiplayer': '#ffaa44'
  };
  return colors[category] || '#aaaaaa';
}

function getCategoryIcon(category) {
  var icons = {
    'action': '⚔️', 'puzzle': '🧩', 'racing': '🏎️', 'sports': '⚽',
    'adventure': '🗺️', 'platformer': '🏃', 'strategy': '♟️',
    'horror': '👻', 'arcade': '🕹️', 'simulation': '🏭', 'sandbox': '🎨',
    'multiplayer': '👥'
  };
  return icons[category] || '🎮';
}

function getDefaultDescription(category) {
  var desc = {
    'action': 'fast-paced action game',
    'puzzle': 'challenge your brain',
    'racing': 'high-speed racing action',
    'sports': 'competitive sports gameplay',
    'adventure': 'epic adventure awaits',
    'platformer': 'jump and run through levels',
    'strategy': 'plan and outsmart opponents',
    'horror': 'survive the terror',
    'arcade': 'classic arcade fun',
    'simulation': 'build and manage',
    'sandbox': 'create and explore'
  };
  return desc[category] || 'fun game to play';
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

// ===== GAME DETAILS MODAL WITH REVIEWS =====
function showGameDetailsModal(gameName, gameUrl, gameImage, gameDescription, gameCategory, gameLoadTime, gameDeveloper, gameReleaseDate) {
  var existingModal = document.getElementById('gameModal');
  if (existingModal) existingModal.remove();
  
  var gamePlayCount = window.gamePlayCounts[gameName] || 0;
  var gameEarned = window.gameEarnings[gameName] || 0;
  var isFavorited = JSON.parse(localStorage.getItem("favourites") || "[]").indexOf(gameName) !== -1;
  
  var userRating = 0;
  if (typeof userVotes !== 'undefined' && userVotes[gameName]) {
    userRating = userVotes[gameName];
  }
  
  var avgRating = '0.0';
  var ratingCount = 0;
  if (typeof globalRatings !== 'undefined' && globalRatings[gameName]) {
    avgRating = globalRatings[gameName].average.toFixed(1);
    ratingCount = globalRatings[gameName].count;
  }
  
  var playtimeHours = Math.floor(gamePlayCount * 0.5);
  var categoryColor = getCategoryColor(gameCategory);
  var categoryIcon = getCategoryIcon(gameCategory);
  
  // Get reviews for this game
  var gameReviews = JSON.parse(localStorage.getItem('gameReviews_' + gameName) || '[]');
  var currentUser = JSON.parse(localStorage.getItem('fanter_currentUser') || 'null');
  
  var modal = document.createElement('div');
  modal.id = 'gameModal';
  modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);backdrop-filter:blur(8px);z-index:20000;display:flex;align-items:center;justify-content:center;';
  
  modal.innerHTML = `
    <div style="background:linear-gradient(135deg,#1a1a2e,#0f0f2a);border-radius:20px;max-width:900px;width:90%;max-height:85vh;overflow-y:auto;position:relative;">
      <button onclick="this.closest('#gameModal').remove()" style="position:absolute;top:15px;right:15px;background:rgba(0,0,0,0.5);border:none;border-radius:50%;width:35px;height:35px;font-size:20px;cursor:pointer;color:white;z-index:10;">✕</button>
      <div style="position:relative;height:200px;overflow:hidden;">
        <img src="${gameImage}" alt="${gameName}" style="width:100%;height:100%;object-fit:cover;filter:brightness(0.7);">
        <div style="position:absolute;bottom:0;left:0;right:0;padding:20px;background:linear-gradient(transparent,rgba(0,0,0,0.9));">
          <div style="font-size:28px;font-weight:bold;color:white;font-family:Orbitron">${escapeHtml(gameName)}</div>
          <div style="display:inline-block;font-size:12px;padding:4px 12px;border-radius:20px;margin-top:10px;background:${categoryColor}20;color:${categoryColor}">${categoryIcon} ${gameCategory || 'other'}</div>
        </div>
      </div>
      
      <!-- Tabs -->
      <div style="display:flex;gap:5px;padding:15px 20px 0 20px;border-bottom:1px solid rgba(255,255,255,0.1);">
        <button class="modal-tab active" data-tab="details" style="background:none;border:none;color:white;padding:10px 20px;cursor:pointer;font-size:14px;border-bottom:2px solid #ffcc00;margin-bottom:-1px;">📋 details</button>
        <button class="modal-tab" data-tab="reviews" style="background:none;border:none;color:rgba(255,255,255,0.5);padding:10px 20px;cursor:pointer;font-size:14px;border-bottom:2px solid transparent;margin-bottom:-1px;">💬 reviews (${gameReviews.length})</button>
      </div>
      
      <!-- Details Tab Content -->
      <div id="modalTab-details" class="modal-tab-content" style="display:block;">
        <div style="display:flex;flex-wrap:wrap;padding:20px;gap:20px;">
          <div style="width:200px;flex-shrink:0;">
            <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:15px;text-align:center;margin-bottom:15px;">
              <div style="font-size:11px;color:rgba(255,255,255,0.5);">TIME PLAYED</div>
              <div style="font-size:28px;font-weight:bold;color:#00ff88;">${playtimeHours}h</div>
            </div>
            <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:15px;">
              <div style="display:flex;justify-content:space-between;padding:8px 0;"><span style="font-size:12px;color:rgba(255,255,255,0.6);">🎮 PLAYS</span><span style="font-size:12px;font-weight:bold;color:#ffcc00;">${gamePlayCount}</span></div>
              <div style="display:flex;justify-content:space-between;padding:8px 0;"><span style="font-size:12px;color:rgba(255,255,255,0.6);">🪙 EARNED</span><span style="font-size:12px;font-weight:bold;color:#ffcc00;">${Math.floor(gameEarned * 100) / 100}</span></div>
              <div style="display:flex;justify-content:space-between;padding:8px 0;"><span style="font-size:12px;color:rgba(255,255,255,0.6);">⭐ RATING</span><span style="font-size:12px;font-weight:bold;color:#ffcc00;">${avgRating}/5 (${ratingCount})</span></div>
              <div style="display:flex;justify-content:space-between;padding:8px 0;"><span style="font-size:12px;color:rgba(255,255,255,0.6);">⏱️ LOAD TIME</span><span style="font-size:12px;font-weight:bold;color:#ffcc00;">${gameLoadTime || '1-3 sec'}</span></div>
              ${gameDeveloper ? `<div style="display:flex;justify-content:space-between;padding:8px 0;"><span style="font-size:12px;color:rgba(255,255,255,0.6);">👨‍💻 DEV</span><span style="font-size:12px;font-weight:bold;color:#ffcc00;">${escapeHtml(gameDeveloper)}</span></div>` : ''}
            </div>
          </div>
          <div style="flex:1;">
            <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:15px;margin-bottom:15px;">
              <p style="font-size:13px;line-height:1.5;color:rgba(255,255,255,0.8);">${escapeHtml(gameDescription)}</p>
            </div>
            <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:15px;margin-bottom:15px;">
              <div style="margin-bottom:15px;">
                <div style="display:flex;gap:5px;">
                  ${[1,2,3,4,5].map(function(s) {
                    return '<span class="modal-star" data-value="' + s + '" style="font-size:24px;cursor:pointer;color:' + (userRating >= s ? '#ffcc00' : 'rgba(255,255,255,0.2)') + ';">★</span>';
                  }).join('')}
                </div>
                <div style="font-size:11px;color:rgba(255,255,255,0.5);margin-top:5px;">your rating: ${userRating > 0 ? '★'.repeat(userRating) + '☆'.repeat(5-userRating) : 'not rated'}</div>
              </div>
            </div>
            <div style="display:flex;gap:15px;">
              <button id="modalPlayBtn" style="flex:1;background:linear-gradient(135deg,#2d5ae3,#1a3a8a);border:none;border-radius:30px;padding:12px;color:white;font-size:14px;font-weight:bold;cursor:pointer;">🎮 PLAY NOW</button>
              <button id="modalFavBtn" style="background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:30px;padding:12px 20px;color:white;cursor:pointer;">${isFavorited ? '★ FAVORITED' : '☆ FAVORITE'}</button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Reviews Tab Content -->
      <div id="modalTab-reviews" class="modal-tab-content" style="display:none;padding:20px;">
        <!-- Write Review Section -->
        ${currentUser && currentUser.username !== 'Guest' ? `
          <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:15px;margin-bottom:20px;">
            <div style="font-size:14px;color:white;margin-bottom:10px;">write a review</div>
            <textarea id="reviewText" placeholder="share your thoughts about this game..." style="width:100%;padding:12px;border-radius:10px;border:1px solid rgba(45,90,227,0.4);background:rgba(0,0,0,0.3);color:white;font-size:13px;resize:vertical;min-height:80px;margin-bottom:10px;"></textarea>
            <div style="display:flex;gap:10px;align-items:center;">
              <div style="display:flex;gap:5px;" id="reviewStars">
                ${[1,2,3,4,5].map(s => `<span class="review-star" data-value="${s}" style="font-size:20px;cursor:pointer;color:rgba(255,255,255,0.2);">★</span>`).join('')}
              </div>
              <button id="submitReviewBtn" style="background:linear-gradient(135deg,#2d5ae3,#1a3a8a);border:none;border-radius:20px;padding:8px 20px;color:white;font-size:13px;cursor:pointer;margin-left:auto;">post review</button>
            </div>
          </div>
        ` : `
          <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:20px;text-align:center;margin-bottom:20px;">
            <p style="color:rgba(255,255,255,0.5);">please log in to write a review</p>
          </div>
        `}
        
        <!-- Reviews List -->
        <div id="reviewsList">
          ${gameReviews.length === 0 ? `
            <div style="text-align:center;padding:40px;color:rgba(255,255,255,0.5);">
              <div style="font-size:48px;margin-bottom:10px;">💬</div>
              <div>no reviews yet. be the first!</div>
            </div>
          ` : gameReviews.slice().reverse().map(review => `
            <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:15px;margin-bottom:10px;border-left:3px solid ${review.rating >= 4 ? '#00ff88' : review.rating >= 2 ? '#ffcc00' : '#ff4444'};">
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
                <div style="width:30px;height:30px;background:linear-gradient(135deg,#2d5ae3,#ffcc00);border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:12px;">${review.username[0].toUpperCase()}</div>
                <div>
                  <div style="font-size:13px;font-weight:bold;color:white;">${escapeHtml(review.username)}</div>
                  <div style="font-size:10px;color:rgba(255,255,255,0.4);">${review.date}</div>
                </div>
                <div style="margin-left:auto;color:#ffcc00;">${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}</div>
              </div>
              <div style="font-size:12px;color:rgba(255,255,255,0.8);padding-left:40px;">${escapeHtml(review.text)}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Tab switching
  modal.querySelectorAll('.modal-tab').forEach(tab => {
    tab.onclick = () => {
      modal.querySelectorAll('.modal-tab').forEach(t => {
        t.style.color = 'rgba(255,255,255,0.5)';
        t.style.borderBottom = '2px solid transparent';
      });
      tab.style.color = 'white';
      tab.style.borderBottom = '2px solid #ffcc00';
      
      modal.querySelectorAll('.modal-tab-content').forEach(c => c.style.display = 'none');
      document.getElementById('modalTab-' + tab.dataset.tab).style.display = 'block';
    };
  });
  
  // Star rating for review
  let selectedReviewRating = 0;
  modal.querySelectorAll('.review-star').forEach(star => {
    star.onmouseenter = () => {
      const val = parseInt(star.dataset.value);
      modal.querySelectorAll('.review-star').forEach((s, i) => {
        s.style.color = i < val ? '#ffcc00' : 'rgba(255,255,255,0.2)';
      });
    };
    star.onmouseleave = () => {
      modal.querySelectorAll('.review-star').forEach((s, i) => {
        s.style.color = i < selectedReviewRating ? '#ffcc00' : 'rgba(255,255,255,0.2)';
      });
    };
    star.onclick = () => {
      selectedReviewRating = parseInt(star.dataset.value);
      modal.querySelectorAll('.review-star').forEach((s, i) => {
        s.style.color = i < selectedReviewRating ? '#ffcc00' : 'rgba(255,255,255,0.2)';
      });
    };
  });
  
  // Submit review
  document.getElementById('submitReviewBtn')?.addEventListener('click', () => {
    const reviewText = document.getElementById('reviewText').value.trim();
    if (!reviewText) { alert('please write something!'); return; }
    if (selectedReviewRating === 0) { alert('please select a rating!'); return; }
    
    const reviews = JSON.parse(localStorage.getItem('gameReviews_' + gameName) || '[]');
    reviews.push({
      username: currentUser.username,
      text: reviewText,
      rating: selectedReviewRating,
      date: new Date().toLocaleDateString()
    });
    localStorage.setItem('gameReviews_' + gameName, JSON.stringify(reviews));
    
    // Refresh modal
    showGameDetailsModal(gameName, gameUrl, gameImage, gameDescription, gameCategory, gameLoadTime, gameDeveloper, gameReleaseDate);
    showToast('✅ Review posted!');
  });
  
  // Play button
  document.getElementById('modalPlayBtn').onclick = function() {
    if (typeof trackPlayedGame === 'function') trackPlayedGame(gameName);
    var playUrl = 'play.html?gameurl=' + encodeURIComponent(gameUrl) + '&game=' + encodeURIComponent(gameName);
    window.open(playUrl, '_blank');
    modal.remove();
  };
  
  // Favorite button
  document.getElementById('modalFavBtn').onclick = function() {
    if (typeof window.toggleFavourite === 'function') {
      window.toggleFavourite(gameName);
      var newFav = JSON.parse(localStorage.getItem("favourites") || "[]").indexOf(gameName) !== -1;
      this.textContent = newFav ? '★ FAVORITED' : '☆ FAVORITE';
    }
  };
  
  // Star rating for game
  document.querySelectorAll('.modal-star').forEach(function(star) {
    star.onclick = function() {
      var value = parseInt(this.getAttribute('data-value'));
      if (typeof submitRating === 'function') {
        submitRating(gameName, value);
        var stars = document.querySelectorAll('.modal-star');
        for (var i = 0; i < stars.length; i++) {
          stars[i].style.color = i < value ? '#ffcc00' : 'rgba(255,255,255,0.2)';
        }
      }
    };
  });
}

// Toast helper
function showToast(message) {
  let toast = document.querySelector('.rating-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'rating-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

// ===== GAME RATINGS SYSTEM =====
const RATINGS_BIN_ID = "69e045ec856a6821893bc134";
const RATINGS_API_KEY = "$2a$10$2cPmKAGNYxPTRLV03OfVruvfhNpW/VHtJSzR.AVNHumZ7etLdT33.";

var globalRatings = {};
var userVotes = JSON.parse(localStorage.getItem('userVotes') || '{}');

async function loadGlobalRatings() {
  try {
    var response = await fetch('https://api.jsonbin.io/v3/b/' + RATINGS_BIN_ID + '/latest', {
      headers: { 'X-Master-Key': RATINGS_API_KEY }
    });
    var data = await response.json();
    if (data.record && data.record.ratings) {
      globalRatings = data.record.ratings;
    }
    console.log('✅ Global ratings loaded:', Object.keys(globalRatings).length, 'games rated');
    // FIX: re-sync stars after ratings load
    if (typeof window.updateStarDisplays === 'function') {
      window.updateStarDisplays();
    }
  } catch (error) {
    console.error('Failed to load ratings:', error);
  }
}

async function saveGlobalRatings() {
  try {
    await fetch('https://api.jsonbin.io/v3/b/' + RATINGS_BIN_ID, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': RATINGS_API_KEY
      },
      body: JSON.stringify({ ratings: globalRatings })
    });
    console.log('✅ Ratings saved to cloud');
  } catch (error) {
    console.error('Failed to save ratings:', error);
  }
}

function submitRating(gameName, rating) {
  if (!globalRatings[gameName]) {
    globalRatings[gameName] = { total: 0, count: 0, average: 0 };
  }
  
  var currentUser = JSON.parse(localStorage.getItem('fanter_currentUser') || 'null');
  if (currentUser) {
    currentUser.stats = currentUser.stats || { ratingsGiven: 0, favoritesCount: 0, gamesPlayed: 0 };
    currentUser.stats.ratingsGiven = (currentUser.stats.ratingsGiven || 0) + 1;
    localStorage.setItem('fanter_currentUser', JSON.stringify(currentUser));
    
    var users = JSON.parse(localStorage.getItem('fanter_users') || '[]');
    var userIndex = -1;
    for (var i = 0; i < users.length; i++) {
      if (users[i].id === currentUser.id) { userIndex = i; break; }
    }
    if (userIndex !== -1) {
      users[userIndex].stats = currentUser.stats;
      localStorage.setItem('fanter_users', JSON.stringify(users));
    }
  }
  
  if (userVotes[gameName]) {
    var oldRating = userVotes[gameName];
    globalRatings[gameName].total -= oldRating;
    globalRatings[gameName].count -= 1;
  }
  
  globalRatings[gameName].total += rating;
  globalRatings[gameName].count += 1;
  globalRatings[gameName].average = globalRatings[gameName].total / globalRatings[gameName].count;
  
  userVotes[gameName] = rating;
  localStorage.setItem('userVotes', JSON.stringify(userVotes));
  
  saveGlobalRatings();
  showRatingToast('You rated "' + gameName + '" ' + rating + '★!');
}

function showRatingToast(message) {
  var toast = document.querySelector('.rating-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'rating-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(function() { toast.classList.remove('show'); }, 2000);
}

loadGlobalRatings();

// ===== ACCOUNT FUNCTIONS =====
function getCurrentUser() {
  return JSON.parse(localStorage.getItem('fanter_currentUser') || 'null');
}

function updateUserInStorage(updatedUser) {
  localStorage.setItem('fanter_currentUser', JSON.stringify(updatedUser));
  
  var users = JSON.parse(localStorage.getItem('fanter_users') || '[]');
  var index = -1;
  for (var i = 0; i < users.length; i++) {
    if (users[i].id === updatedUser.id) { index = i; break; }
  }
  if (index !== -1) {
    users[index] = updatedUser;
    localStorage.setItem('fanter_users', JSON.stringify(users));
  }

  // FIX: Sync key stats to Supabase so leaderboard stays current
  if (window.supabase && updatedUser.id && !updatedUser.id.startsWith('guest_')) {
    window.supabase.from('profiles').update({
      coins: updatedUser.coins || 0,
      games_played: (updatedUser.stats && updatedUser.stats.gamesPlayed) || 0,
      achievements_count: Object.keys(
        JSON.parse(localStorage.getItem('fanter_achievements') || '{}')
      ).length
    }).eq('id', updatedUser.id).then(function() {
      console.log('✅ Profile synced to Supabase');
    }).catch(function(err) {
      console.warn('Supabase sync failed (non-critical):', err);
    });
  }
}

function syncFavoriteToAccount(gameName, isAdding) {
  var currentUser = getCurrentUser();
  if (!currentUser) return;
  
  var favorites = currentUser.favorites || [];
  if (isAdding) {
    if (favorites.indexOf(gameName) === -1) favorites.push(gameName);
  } else {
    favorites = favorites.filter(function(f) { return f !== gameName; });
  }
  
  currentUser.favorites = favorites;
  currentUser.stats.favoritesCount = favorites.length;
  updateUserInStorage(currentUser);
  localStorage.setItem("favourites", JSON.stringify(favorites));
}

function trackPlayedGame(gameName) {
  var currentUser = getCurrentUser();
  var multiplier = getActiveCoinMultiplier();
  var earned = 0.05 * multiplier;
  
  window.gameEarnings[gameName] = (window.gameEarnings[gameName] || 0) + earned;
  localStorage.setItem('gameEarnings', JSON.stringify(window.gameEarnings));
  
  window.gamePlayCounts[gameName] = (window.gamePlayCounts[gameName] || 0) + 1;
  localStorage.setItem('gamePlayCounts', JSON.stringify(window.gamePlayCounts));
  
  if (currentUser) {
    currentUser.coins = (currentUser.coins || 0) + earned;
    
    var playedGames = currentUser.playedGames || [];
    if (playedGames.indexOf(gameName) === -1) {
      playedGames.unshift(gameName);
    } else {
      var idx = playedGames.indexOf(gameName);
      playedGames.splice(idx, 1);
      playedGames.unshift(gameName);
    }
    if (playedGames.length > 50) playedGames.pop();
    
    currentUser.playedGames = playedGames;
    currentUser.stats.gamesPlayed = playedGames.length;
    updateUserInStorage(currentUser);
  }
  
  updateHeaderCoins();
  
  var gameCard = document.querySelector('.game[data-game-name="' + CSS.escape(gameName) + '"]');
  if (gameCard) {
    var statsRow = gameCard.querySelector('.game-stats-row');
    if (statsRow) {
      var playCountSpan = statsRow.querySelector('span:first-child');
      var earningsSpan = statsRow.querySelector('span:nth-child(2)');
      if (playCountSpan) playCountSpan.innerHTML = '🎮 ' + window.gamePlayCounts[gameName];
      if (earningsSpan) earningsSpan.innerHTML = '🪙 ' + Math.floor(window.gameEarnings[gameName] * 100) / 100;
    }
  }
  
  console.log('🎮 Played: ' + gameName + ' | +' + earned.toFixed(2) + '🪙');
  return earned;
}

function getActiveCoinMultiplier() {
  var equippedPet = localStorage.getItem('equippedPet');
  var petMultipliers = {
    'chinchilla': 1.0, 'dragon': 1.5, 'cat': 1.2,
    'dog': 1.2, 'owl': 1.3, 'fox': 1.4
  };
  return petMultipliers[equippedPet] || 1.0;
}

function loadUserFavorites() {
  var currentUser = getCurrentUser();
  if (!currentUser) return;
  var favorites = currentUser.favorites || [];
  localStorage.setItem("favourites", JSON.stringify(favorites));
}

function updateHeaderCoins() {
  var currentUser = getCurrentUser();
  var coinEl = document.getElementById('headerCoinAmount');
  if (coinEl && currentUser) {
    coinEl.textContent = Math.floor((currentUser.coins || 0) * 100) / 100;
  }
}

function updateAccountButtonDisplay() {
  var currentUser = getCurrentUser();
  var accountNameSpan = document.getElementById('accountName');
  if (accountNameSpan) {
    accountNameSpan.textContent = currentUser ? (currentUser.displayName || currentUser.username) : 'Guest';
  }
}

document.addEventListener('DOMContentLoaded', function() {
  updateAccountButtonDisplay();
  updateHeaderCoins();
});

setInterval(updateHeaderCoins, 1000);

// ===== ACHIEVEMENT TRIGGERS =====
function trackGamePlayCount(gameName) {
  window.gamePlayCounts[gameName] = (window.gamePlayCounts[gameName] || 0) + 1;
  localStorage.setItem('gamePlayCounts', JSON.stringify(window.gamePlayCounts));
  if (window.gamePlayCounts[gameName] >= 50) {
    if (typeof checkAndUnlockAchievement === 'function') checkAndUnlockAchievement(59);
  }
  if (window.gamePlayCounts[gameName] >= 100) {
    if (typeof checkAndUnlockAchievement === 'function') checkAndUnlockAchievement(60);
  }
}

function trackThemeChange() {
  var themeChangeCount = parseInt(localStorage.getItem('themeChangeCount') || '0');
  themeChangeCount++;
  localStorage.setItem('themeChangeCount', themeChangeCount);
  if (themeChangeCount >= 10) {
    if (typeof checkAndUnlockAchievement === 'function') checkAndUnlockAchievement(56);
  }
}

var idleAchievementGranted = false;

function startIdleTracking() {
  if (idleAchievementGranted) return;
  var lastActivity = Date.now();
  function resetIdleTimer() { lastActivity = Date.now(); }
  function checkIdle() {
    if (!idleAchievementGranted) {
      var idleTime = (Date.now() - lastActivity) / 1000 / 60;
      if (idleTime >= 60) {
        if (typeof checkAndUnlockAchievement === 'function') checkAndUnlockAchievement(55);
        idleAchievementGranted = true;
      }
    }
  }
  document.addEventListener('mousemove', resetIdleTimer);
  document.addEventListener('keydown', resetIdleTimer);
  document.addEventListener('click', resetIdleTimer);
  setInterval(checkIdle, 60000);
}

var FOOD_GAMES = ['burger', 'pizza', 'taco', 'sushi', 'cake', 'cookie', 'food', 'chef', 'restaurant', 'cooking', 'baking', 'donut', 'ice cream', 'candy', 'chocolate'];

function isFoodGame(gameName) {
  var lowerName = gameName.toLowerCase();
  for (var i = 0; i < FOOD_GAMES.length; i++) {
    if (lowerName.indexOf(FOOD_GAMES[i]) !== -1) return true;
  }
  return false;
}

var SECRET_NAMES = [':)', 'creamypeanut', 'bloxy', 'abcatlmfao'];

function checkSecretNames(searchTerm) {
  var searchLower = searchTerm.toLowerCase();
  var foundCount = 0;
  for (var i = 0; i < SECRET_NAMES.length; i++) {
    if (searchLower.indexOf(SECRET_NAMES[i].toLowerCase()) !== -1) foundCount++;
  }
  if (foundCount >= SECRET_NAMES.length) {
    if (typeof checkAndUnlockAchievement === 'function') checkAndUnlockAchievement(53);
  }
}

var pageLoadTime = Date.now();
window.addEventListener('beforeunload', function() {
  var timeOnPage = (Date.now() - pageLoadTime) / 1000;
  if (timeOnPage <= 10) localStorage.setItem('pendingAltF4', 'true');
});

function checkAltF4() {
  if (localStorage.getItem('pendingAltF4') === 'true') {
    localStorage.removeItem('pendingAltF4');
    if (typeof checkAndUnlockAchievement === 'function') checkAndUnlockAchievement(54);
  }
}

function checkOGFanter() {
  var currentUser = getCurrentUser();
  if (currentUser && currentUser.createdAt) {
    var joinDate = new Date(currentUser.createdAt);
    var cutoffDate = new Date('2025-04-01');
    if (joinDate >= cutoffDate) {
      if (typeof checkAndUnlockAchievement === 'function') checkAndUnlockAchievement(58);
    }
  }
}

function checkLoyalCustomer() {
  if (!window.gamesData) return;
  var ratedGames = 0;
  for (var key in userVotes) { ratedGames++; }
  if (ratedGames >= window.gamesData.length) {
    if (typeof checkAndUnlockAchievement === 'function') checkAndUnlockAchievement(62);
  }
}

function checkTotalPlayTime() {
  var sessionStart = localStorage.getItem('sessionStart');
  if (sessionStart) {
    var totalPausedTime = parseInt(localStorage.getItem('totalPausedTime') || '0');
    var activeTime = (Date.now() - parseInt(sessionStart) - totalPausedTime) / 1000 / 60 / 60;
    if (activeTime >= 50) {
      if (typeof checkAndUnlockAchievement === 'function') checkAndUnlockAchievement(61);
    }
  }
}

function checkAndUnlockAchievement(achievementId) {
  var currentUser = getCurrentUser();
  if (!currentUser) return;
  
  var achievements = JSON.parse(localStorage.getItem('fanter_achievements') || '{}');
  if (achievements[achievementId]) return;
  
  achievements[achievementId] = true;
  localStorage.setItem('fanter_achievements', JSON.stringify(achievements));
  
  var coinReward = 0;
  if (achievementId <= 10) coinReward = 3;
  else if (achievementId <= 20) coinReward = 5;
  else if (achievementId <= 30) coinReward = 10;
  else if (achievementId <= 40) coinReward = 17.5;
  else if (achievementId <= 50) coinReward = 25;
  else coinReward = 50;
  
  if (coinReward > 0) {
    currentUser.coins = (currentUser.coins || 0) + coinReward;
    updateUserInStorage(currentUser);
  }
  
  currentUser.achievements = achievements;
  updateUserInStorage(currentUser);
  
  var achievementNames = {
    53: "The Chosen One", 54: "Alt+F4", 55: "Mentally Insane", 56: "Indecisive",
    57: "Big Back", 58: "OG Fanter", 59: "Addicted", 60: "Committed",
    61: "Top 1 Unemployed", 62: "Loyal Customer", 63: "System Failure"
  };
  
  var achievementIcons = {
    53: "👑", 54: "💀", 55: "🤪", 56: "🎨", 57: "🍔", 58: "🦖",
    59: "🎮", 60: "💪", 61: "🛋️", 62: "⭐", 63: "💻"
  };
  
  showAchievementToastNotification(achievementNames[achievementId] || "Achievement Unlocked!", achievementIcons[achievementId] || "🏆", coinReward);
  console.log('🏆 Achievement Unlocked: ' + (achievementNames[achievementId] || "Unknown") + ' +' + coinReward + '🪙');
  
  if (typeof updateHeaderCoins === 'function') updateHeaderCoins();
}

function showAchievementToastNotification(name, icon, coins) {
  var toast = document.querySelector('.achievement-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'achievement-toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = '<span class="achievement-icon">' + icon + '</span><div class="achievement-content"><div class="achievement-title">ACHIEVEMENT UNLOCKED!</div><div class="achievement-name">' + name + '</div><div class="achievement-reward" style="color:#ffcc00; font-size:11px; margin-top:4px;">+' + coins + ' 🪙</div></div>';
  toast.classList.add('show');
  setTimeout(function() { toast.classList.remove('show'); }, 4000);
}

function triggerPageCrash() {
  if (typeof checkAndUnlockAchievement === 'function') checkAndUnlockAchievement(63);
  
  var crashOverlay = document.createElement('div');
  crashOverlay.id = 'crash-overlay';
  crashOverlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:#000088;z-index:999999;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:"Courier New",monospace;color:white;text-align:center;';
  crashOverlay.innerHTML = '<div style="background:white;color:black;padding:20px;border:2px solid silver;max-width:500px;margin:20px;"><pre style="font-size:20px;margin:0;">😵</pre><h1 style="font-size:24px;margin:10px 0;">:(</h1><p style="font-size:16px;">Your Fanter ran into a problem and needs to restart.</p><p style="font-size:14px;margin-top:20px;">*** STOP: 0x000000F4</p><div style="margin-top:30px;"><span>Restarting in <span id="crash-countdown">5</span> seconds...</span></div></div>';
  document.body.appendChild(crashOverlay);
  
  var seconds = 5;
  var countdownEl = document.getElementById('crash-countdown');
  var interval = setInterval(function() {
    seconds--;
    if (countdownEl) countdownEl.textContent = seconds;
    if (seconds <= 0) { clearInterval(interval); window.location.reload(); }
  }, 1000);
}

function initAchievementTriggers() {
  checkAltF4();
  checkOGFanter();
  checkTotalPlayTime();
  startIdleTracking();
  setInterval(checkTotalPlayTime, 60000);
  setInterval(checkLoyalCustomer, 30000);
}

initAchievementTriggers();

window.crashFanter = function() { triggerPageCrash(); };

console.log('💀 Type "crashFanter()" for a surprise...');
