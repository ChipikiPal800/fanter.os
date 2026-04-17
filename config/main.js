// ===== MAIN.JS - COMPLETE REWRITE =====

// Wait for DOM to be fully loaded before running
document.addEventListener('DOMContentLoaded', function() {
  var sitename = "fanter beta.";
  var subtext = "v0.02, achievements added, bugfixes and more coming soon! :3";

  var serverUrl1 = "https://gms.parcoil.com";
  var currentPageTitle = document.title;
  document.title = `${currentPageTitle} | ${sitename}`;
  let gamesData = [];

  function getFavourites() {
    return JSON.parse(localStorage.getItem("favourites") || "[]");
  }

  window.toggleFavourite = function(gameName) {
    let favs = getFavourites();
    let isAdding = false;
    
    if (favs.includes(gameName)) {
      favs = favs.filter(f => f !== gameName);
      isAdding = false;
    } else {
      favs.push(gameName);
      isAdding = true;
    }
    localStorage.setItem("favourites", JSON.stringify(favs));
    
    if (typeof syncFavoriteToAccount === 'function') {
      syncFavoriteToAccount(gameName, isAdding);
    }
    
    if (typeof checkAchievements === 'function') {
      setTimeout(() => checkAchievements(), 100);
    }
    
    const favBtn = document.querySelector(`.fav-btn[data-game="${gameName.replace(/['"]/g, '\\"')}"]`);
    if (favBtn) {
      favBtn.textContent = isAdding ? "★" : "☆";
    }
  };

  function displayFilteredGames(filteredGames) {
    const gamesContainer = document.getElementById("gamesContainer");
    if (!gamesContainer) return;
    gamesContainer.innerHTML = "";
    
    filteredGames.forEach((game, idx) => {
      // Get game data - make a copy to avoid reference issues
      const gameName = game.name;
      const gameUrlValue = game.url;
      const gameImageValue = game.image;
      
      console.log(`[${idx}] Game: "${gameName}", URL: "${gameUrlValue}"`);
      
      const gameDiv = document.createElement("div");
      gameDiv.classList.add("game");
      
      const gameImage = document.createElement("img");
      let imageSrc;
      if (gameImageValue && gameImageValue.startsWith('http')) {
        imageSrc = gameImageValue;
      } else if (gameImageValue) {
        imageSrc = `${serverUrl1}/${gameUrlValue}/${gameImageValue}`;
      } else {
        imageSrc = 'https://via.placeholder.com/200x200?text=No+Image';
      }
      gameImage.src = imageSrc;
      gameImage.alt = gameName;
      gameImage.style.cursor = 'pointer';
      
      // Store URL directly on the image element
      gameImage.setAttribute('data-game-url', gameUrlValue || '');
      gameImage.setAttribute('data-game-name', gameName);
      
      gameImage.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const url = this.getAttribute('data-game-url');
        const name = this.getAttribute('data-game-name');
        
        console.log("🎮 Game clicked:", name);
        console.log("🔗 URL from data attribute:", url);
        
        if (!url || url === 'undefined' || url === 'null' || url === '') {
          console.error("❌ No valid URL for game:", name);
          alert(`Game "${name}" has no valid URL. Please check the games.json file.`);
          return;
        }
        
        const playUrl = `play.html?gameurl=${encodeURIComponent(url)}&game=${encodeURIComponent(name)}`;
        console.log("🚀 Opening:", playUrl);
        window.open(playUrl, '_blank');
        
        return false;
      };
      
      const gameNameElem = document.createElement("p");
      gameNameElem.textContent = gameName;
      
      const favBtn = document.createElement("button");
      favBtn.classList.add("fav-btn");
      favBtn.setAttribute("data-game", gameName);
      favBtn.textContent = getFavourites().includes(gameName) ? "★" : "☆";
      favBtn.title = "favourite";
      favBtn.onclick = (e) => {
        e.stopPropagation();
        window.toggleFavourite(gameName);
        favBtn.textContent = getFavourites().includes(gameName) ? "★" : "☆";
      };
      
      gameDiv.appendChild(gameImage);
      gameDiv.appendChild(gameNameElem);
      gameDiv.appendChild(favBtn);
      
      if (typeof createRatingHTML === 'function') {
        try {
          const userVotesGlobal = JSON.parse(localStorage.getItem('userVotes') || '{}');
          gameDiv.insertAdjacentHTML('beforeend', createRatingHTML(gameName, userVotesGlobal[gameName] || 0));
        } catch (err) {
          console.error("Error adding rating:", err);
        }
      }
      
      gamesContainer.appendChild(gameDiv);
    });
    
    if (typeof attachRatingListeners === 'function') {
      attachRatingListeners();
    }
    
    console.log(`✅ Displayed ${filteredGames.length} games`);
  }

  function handleSearchInput() {
    const searchInput = document.getElementById("searchInput");
    if (!searchInput) return;
    const searchInputValue = searchInput.value.toLowerCase();
    
    if (typeof checkSecretNames === 'function') {
      checkSecretNames(searchInputValue);
    }
    
    let filteredGames;
    const favFilterOn = localStorage.getItem("favFilter") === "true";
    if (favFilterOn) {
      const favs = getFavourites();
      filteredGames = gamesData.filter((game) =>
        favs.includes(game.name) && game.name.toLowerCase().includes(searchInputValue)
      );
    } else {
      filteredGames = gamesData.filter((game) =>
        game.name.toLowerCase().includes(searchInputValue)
      );
    }
    displayFilteredGames(filteredGames);
  }

  window.toggleFavFilter = function() {
    const current = localStorage.getItem("favFilter") === "true";
    localStorage.setItem("favFilter", (!current).toString());
    handleSearchInput();
    const favToggleBtn = document.getElementById("favToggleBtn");
    if (favToggleBtn) {
      const on = localStorage.getItem("favFilter") === "true";
      favToggleBtn.textContent = on ? "show: on ✅" : "show: off ❌";
    }
  };

  window.toggleFavSidebar = function() {
    const btn = document.getElementById("favSidebarBtn");
    if (!btn) return;
    const favFilterOn = localStorage.getItem("favFilter") === "true";
    btn.classList.toggle("active", !favFilterOn);
    btn.classList.toggle("visible", !favFilterOn);
    btn.textContent = !favFilterOn ? "✕" : "★";

    if (!favFilterOn) {
      const favs = getFavourites();
      const allCards = Array.from(document.querySelectorAll(".game"));
      const searchBar = document.getElementById("searchInput");
      if (!searchBar) return;
      const searchRect = searchBar.getBoundingClientRect();
      const searchCenterX = searchRect.left + searchRect.width / 2;
      const searchCenterY = searchRect.top + searchRect.height / 2;

      const nonFavedCards = allCards.filter(card =>
        !favs.includes(card.querySelector("p").textContent)
      );

      nonFavedCards.sort((a, b) => {
        const ra = a.getBoundingClientRect();
        const rb = b.getBoundingClientRect();
        const da = Math.hypot((ra.left + ra.width / 2) - searchCenterX, (ra.top + ra.height / 2) - searchCenterY);
        const db = Math.hypot((rb.left + rb.width / 2) - searchCenterX, (rb.top + rb.height / 2) - searchCenterY);
        return da - db;
      });

      let delay = 0;

      nonFavedCards.forEach((card) => {
        const cardRect = card.getBoundingClientRect();
        const cardCenterX = cardRect.left + cardRect.width / 2;
        const cardCenterY = cardRect.top + cardRect.height / 2;

        const clone = card.cloneNode(true);
        clone.style.cssText = `
          position: fixed;
          left: ${cardRect.left}px;
          top: ${cardRect.top}px;
          width: ${cardRect.width}px;
          height: ${cardRect.height}px;
          margin: 0;
          padding: 0;
          z-index: 9999;
          pointer-events: none;
          transform-origin: center center;
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 8px 25px rgba(45, 90, 227, 0.4);
        `;
        document.body.appendChild(clone);
        card.style.visibility = "hidden";

        const tx = searchCenterX - cardCenterX;
        const ty = searchCenterY - cardCenterY;

        setTimeout(() => {
          clone.style.transition = `transform 0.42s cubic-bezier(0.55, 0, 0.85, 0.6), opacity 0.18s ease 0.26s, border-radius 0.42s ease`;
          clone.style.transform = `translate(${tx}px, ${ty}px) scale(0.05)`;
          clone.style.opacity = "0";
          clone.style.borderRadius = "50%";
          setTimeout(() => clone.remove(), 500);
        }, delay);

        delay += 30;
      });

      setTimeout(() => {
        searchBar.style.transition = "box-shadow 0.15s ease, border-color 0.15s ease";
        searchBar.style.boxShadow = "0 0 40px rgba(45, 90, 227, 0.9), 0 0 80px rgba(45, 90, 227, 0.4)";
        searchBar.style.borderColor = "rgba(45, 90, 227, 1)";
        setTimeout(() => {
          searchBar.style.boxShadow = "";
          searchBar.style.borderColor = "";
        }, 300);
      }, delay + 100);

      setTimeout(() => {
        localStorage.setItem("favFilter", "true");
        handleSearchInput();
      }, delay + 280);

    } else {
      localStorage.setItem("favFilter", "false");
      handleSearchInput();
    }
  };

  // Load games
  fetch("./config/games.json")
    .then((response) => response.json())
    .then((data) => {
      gamesData = data;
      window.gamesData = gamesData;
      handleSearchInput();
      const btn = document.getElementById("favSidebarBtn");
      if (btn && localStorage.getItem("favFilter") === "true") {
        btn.classList.add("active");
        btn.classList.add("visible");
        btn.textContent = "✕";
      }
      console.log(`✅ Loaded ${gamesData.length} games successfully!`);
      
      if (typeof loadUserFavorites === 'function') {
        loadUserFavorites();
      }
    })
    .catch((error) => console.error("Error fetching games:", error));

  // Set up event listeners
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", handleSearchInput);
  }
  
  const titleEl = document.getElementById("title");
  if (titleEl) titleEl.innerHTML = sitename;
  
  const subtitleEl = document.getElementById("subtitle");
  if (subtitleEl) subtitleEl.innerHTML = subtext;
});


// ===== GAME RATINGS SYSTEM =====
const RATINGS_BIN_ID = "69e045ec856a6821893bc134";
const RATINGS_API_KEY = "$2a$10$2cPmKAGNYxPTRLV03OfVruvfhNpW/VHtJSzR.AVNHumZ7etLdT33.";

let globalRatings = {};
let userVotes = JSON.parse(localStorage.getItem('userVotes') || '{}');

async function loadGlobalRatings() {
  try {
    const response = await fetch(`https://api.jsonbin.io/v3/b/${RATINGS_BIN_ID}/latest`, {
      headers: { 'X-Master-Key': RATINGS_API_KEY }
    });
    const data = await response.json();
    if (data.record && data.record.ratings) {
      globalRatings = data.record.ratings;
    }
    console.log('✅ Global ratings loaded:', Object.keys(globalRatings).length, 'games rated');
  } catch (error) {
    console.error('Failed to load ratings:', error);
  }
  refreshAllRatings();
}

async function saveGlobalRatings() {
  try {
    const response = await fetch(`https://api.jsonbin.io/v3/b/${RATINGS_BIN_ID}`, {
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
  
  const currentUser = JSON.parse(localStorage.getItem('fanter_currentUser') || 'null');
  if (currentUser) {
    currentUser.stats = currentUser.stats || { ratingsGiven: 0, favoritesCount: 0, gamesPlayed: 0 };
    currentUser.stats.ratingsGiven = (currentUser.stats.ratingsGiven || 0) + 1;
    localStorage.setItem('fanter_currentUser', JSON.stringify(currentUser));
    
    let users = JSON.parse(localStorage.getItem('fanter_users') || '[]');
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
      users[userIndex].stats = currentUser.stats;
      localStorage.setItem('fanter_users', JSON.stringify(users));
    }
  }
  
  if (userVotes[gameName]) {
    const oldRating = userVotes[gameName];
    globalRatings[gameName].total -= oldRating;
    globalRatings[gameName].count -= 1;
  }
  
  globalRatings[gameName].total += rating;
  globalRatings[gameName].count += 1;
  globalRatings[gameName].average = globalRatings[gameName].total / globalRatings[gameName].count;
  
  userVotes[gameName] = rating;
  localStorage.setItem('userVotes', JSON.stringify(userVotes));
  
  saveGlobalRatings();
  showRatingToast(`You rated "${gameName}" ${rating}★!`);
  updateStarDisplay(gameName, rating);
  
  if (typeof checkAchievements === 'function') {
    setTimeout(() => checkAchievements(), 100);
  }
  if (typeof checkLoyalCustomer === 'function') {
    setTimeout(() => checkLoyalCustomer(), 100);
  }
}

function updateStarDisplay(gameName, userRating) {
  const ratingContainer = document.querySelector(`.game-rating[data-game="${CSS.escape(gameName)}"]`);
  if (!ratingContainer) return;
  
  const stars = ratingContainer.querySelectorAll('.star');
  stars.forEach((star, index) => {
    if (index < userRating) {
      star.classList.add('active');
    } else {
      star.classList.remove('active');
    }
  });
  
  const avgDisplay = ratingContainer.querySelector('.rating-average');
  const gameRating = globalRatings[gameName];
  if (avgDisplay && gameRating) {
    avgDisplay.innerHTML = `<span class="star-small">★</span> ${gameRating.average.toFixed(1)} (${gameRating.count})`;
  }
}

function refreshAllRatings() {
  document.querySelectorAll('.game-rating').forEach(container => {
    const gameName = container.getAttribute('data-game');
    const gameRating = globalRatings[gameName];
    const userRating = userVotes[gameName] || 0;
    
    const stars = container.querySelectorAll('.star');
    stars.forEach((star, index) => {
      if (index < userRating) {
        star.classList.add('active');
      } else {
        star.classList.remove('active');
      }
    });
    
    const avgDisplay = container.querySelector('.rating-average');
    if (avgDisplay && gameRating) {
      avgDisplay.innerHTML = `<span class="star-small">★</span> ${gameRating.average.toFixed(1)} (${gameRating.count})`;
    } else if (avgDisplay) {
      avgDisplay.innerHTML = `<span class="star-small">★</span> 0.0 (0)`;
    }
  });
}

function showRatingToast(message) {
  let toast = document.querySelector('.rating-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'rating-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2000);
}

function createRatingHTML(gameName, currentRating = 0) {
  const gameRating = globalRatings[gameName];
  const avgRating = gameRating ? gameRating.average.toFixed(1) : '0.0';
  const ratingCount = gameRating ? gameRating.count : 0;
  
  return `
    <div class="game-rating" data-game="${gameName.replace(/['"]/g, '&quot;')}">
      <div class="stars" data-game="${gameName.replace(/['"]/g, '&quot;')}">
        ${[1, 2, 3, 4, 5].map(starNum => `
          <span class="star ${currentRating >= starNum ? 'active' : ''}" data-value="${starNum}">★</span>
        `).join('')}
      </div>
      <div class="rating-average">
        <span class="star-small">★</span> ${avgRating} (${ratingCount})
      </div>
    </div>
  `;
}

function attachRatingListeners() {
  document.querySelectorAll('.stars').forEach(starsContainer => {
    const gameName = starsContainer.getAttribute('data-game');
    
    starsContainer.querySelectorAll('.star').forEach(star => {
      star.removeEventListener('click', star.clickHandler);
      star.removeEventListener('mouseenter', star.mouseEnterHandler);
      star.removeEventListener('mouseleave', star.mouseLeaveHandler);
      
      const ratingValue = parseInt(star.getAttribute('data-value'));
      
      star.clickHandler = () => submitRating(gameName, ratingValue);
      star.mouseEnterHandler = () => {
        starsContainer.querySelectorAll('.star').forEach((s, idx) => {
          if (idx < ratingValue) {
            s.classList.add('hover');
          }
        });
      };
      star.mouseLeaveHandler = () => {
        starsContainer.querySelectorAll('.star').forEach(s => {
          s.classList.remove('hover');
        });
      };
      
      star.addEventListener('click', star.clickHandler);
      star.addEventListener('mouseenter', star.mouseEnterHandler);
      star.addEventListener('mouseleave', star.mouseLeaveHandler);
    });
  });
}

loadGlobalRatings();


// ===== ACCOUNT SYSTEM HELPER FUNCTIONS =====

function updateAccountButtonDisplay() {
  const currentUser = JSON.parse(localStorage.getItem('fanter_currentUser') || 'null');
  const accountNameSpan = document.getElementById('accountName');
  if (accountNameSpan) {
    accountNameSpan.textContent = currentUser ? (currentUser.displayName || currentUser.username) : 'Guest';
  }
}

document.addEventListener('DOMContentLoaded', function() {
  updateAccountButtonDisplay();
});

window.addEventListener('storage', function(e) {
  if (e.key === 'fanter_currentUser') {
    updateAccountButtonDisplay();
  }
});


// ===== ACCOUNT SYNC FUNCTIONS =====

function getCurrentUser() {
  return JSON.parse(localStorage.getItem('fanter_currentUser') || 'null');
}

function updateUserInStorage(updatedUser) {
  localStorage.setItem('fanter_currentUser', JSON.stringify(updatedUser));
  
  let users = JSON.parse(localStorage.getItem('fanter_users') || '[]');
  const index = users.findIndex(u => u.id === updatedUser.id);
  if (index !== -1) {
    users[index] = updatedUser;
    localStorage.setItem('fanter_users', JSON.stringify(users));
  }
}

function syncFavoriteToAccount(gameName, isAdding) {
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  
  let favorites = currentUser.favorites || [];
  
  if (isAdding) {
    if (!favorites.includes(gameName)) {
      favorites.push(gameName);
    }
  } else {
    favorites = favorites.filter(f => f !== gameName);
  }
  
  currentUser.favorites = favorites;
  currentUser.stats.favoritesCount = favorites.length;
  updateUserInStorage(currentUser);
  
  localStorage.setItem("favourites", JSON.stringify(favorites));
}

function trackPlayedGame(gameName) {
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  
  let playedGames = currentUser.playedGames || [];
  
  if (!playedGames.includes(gameName)) {
    playedGames.unshift(gameName);
  } else {
    const index = playedGames.indexOf(gameName);
    playedGames.splice(index, 1);
    playedGames.unshift(gameName);
  }
  
  if (playedGames.length > 50) playedGames.pop();
  
  currentUser.playedGames = playedGames;
  currentUser.stats.gamesPlayed = playedGames.length;
  updateUserInStorage(currentUser);
}

function loadUserFavorites() {
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  
  const favorites = currentUser.favorites || [];
  localStorage.setItem("favourites", JSON.stringify(favorites));
  
  if (typeof handleSearchInput === 'function') {
    handleSearchInput();
  }
}


// ===== ACHIEVEMENT TRIGGERS =====

let gamePlayCounts = JSON.parse(localStorage.getItem('gamePlayCounts') || '{}');

function trackGamePlayCount(gameName) {
  gamePlayCounts[gameName] = (gamePlayCounts[gameName] || 0) + 1;
  localStorage.setItem('gamePlayCounts', JSON.stringify(gamePlayCounts));
  
  if (gamePlayCounts[gameName] >= 50) {
    if (typeof checkAndUnlockAchievement === 'function') checkAndUnlockAchievement(59);
  }
  if (gamePlayCounts[gameName] >= 100) {
    if (typeof checkAndUnlockAchievement === 'function') checkAndUnlockAchievement(60);
  }
}

let themeChangeCount = parseInt(localStorage.getItem('themeChangeCount') || '0');

function trackThemeChange() {
  themeChangeCount++;
  localStorage.setItem('themeChangeCount', themeChangeCount);
  if (themeChangeCount >= 10) {
    if (typeof checkAndUnlockAchievement === 'function') checkAndUnlockAchievement(56);
  }
}

let idleAchievementGranted = false;

function startIdleTracking() {
  if (idleAchievementGranted) return;
  
  let lastActivity = Date.now();
  
  function resetIdleTimer() {
    lastActivity = Date.now();
  }
  
  function checkIdle() {
    if (!idleAchievementGranted) {
      const idleTime = (Date.now() - lastActivity) / 1000 / 60;
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

const FOOD_GAMES = ['burger', 'pizza', 'taco', 'sushi', 'cake', 'cookie', 'food', 'chef', 'restaurant', 'cooking', 'baking', 'donut', 'ice cream', 'candy', 'chocolate'];

function isFoodGame(gameName) {
  const lowerName = gameName.toLowerCase();
  return FOOD_GAMES.some(food => lowerName.includes(food));
}

const SECRET_NAMES = [':)', 'creamypeanut', 'bloxy', 'abcatlmfao'];

function checkSecretNames(searchTerm) {
  const searchLower = searchTerm.toLowerCase();
  let foundCount = 0;
  SECRET_NAMES.forEach(name => {
    if (searchLower.includes(name.toLowerCase())) {
      foundCount++;
    }
  });
  if (foundCount >= SECRET_NAMES.length) {
    if (typeof checkAndUnlockAchievement === 'function') checkAndUnlockAchievement(53);
  }
}

let pageLoadTime = Date.now();
window.addEventListener('beforeunload', () => {
  const timeOnPage = (Date.now() - pageLoadTime) / 1000;
  if (timeOnPage <= 10) {
    localStorage.setItem('pendingAltF4', 'true');
  }
});

function checkAltF4() {
  if (localStorage.getItem('pendingAltF4') === 'true') {
    localStorage.removeItem('pendingAltF4');
    if (typeof checkAndUnlockAchievement === 'function') checkAndUnlockAchievement(54);
  }
}

function checkOGFanter() {
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.createdAt) {
    const joinDate = new Date(currentUser.createdAt);
    const cutoffDate = new Date('2025-04-01');
    if (joinDate >= cutoffDate) {
      if (typeof checkAndUnlockAchievement === 'function') checkAndUnlockAchievement(58);
    }
  }
}

function checkLoyalCustomer() {
  if (!window.gamesData) return;
  const ratedGames = Object.keys(userVotes || {}).length;
  if (ratedGames >= window.gamesData.length) {
    if (typeof checkAndUnlockAchievement === 'function') checkAndUnlockAchievement(62);
  }
}

function checkTotalPlayTime() {
  const sessionStart = localStorage.getItem('sessionStart');
  if (sessionStart) {
    const totalPausedTime = parseInt(localStorage.getItem('totalPausedTime') || '0');
    const activeTime = (Date.now() - parseInt(sessionStart) - totalPausedTime) / 1000 / 60 / 60;
    if (activeTime >= 50) {
      if (typeof checkAndUnlockAchievement === 'function') checkAndUnlockAchievement(61);
    }
  }
}

function checkAndUnlockAchievement(achievementId) {
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  
  let achievements = JSON.parse(localStorage.getItem('fanter_achievements') || '{}');
  if (achievements[achievementId]) return;
  
  achievements[achievementId] = true;
  localStorage.setItem('fanter_achievements', JSON.stringify(achievements));
  
  currentUser.achievements = achievements;
  updateUserInStorage(currentUser);
  
  const achievementNames = {
    53: "The Chosen One", 54: "Alt+F4", 55: "Mentally Insane", 56: "Indecisive",
    57: "Big Back", 58: "OG Fanter", 59: "Addicted", 60: "Committed",
    61: "Top 1 Unemployed", 62: "Loyal Customer", 63: "System Failure"
  };
  
  const achievementIcons = {
    53: "👑", 54: "💀", 55: "🤪", 56: "🎨", 57: "🍔", 58: "🦖",
    59: "🎮", 60: "💪", 61: "🛋️", 62: "⭐", 63: "💻"
  };
  
  showAchievementToastNotification(achievementNames[achievementId] || "Achievement Unlocked!", achievementIcons[achievementId] || "🏆");
  console.log(`🏆 Achievement Unlocked: ${achievementNames[achievementId]}`);
}

function showAchievementToastNotification(name, icon) {
  let toast = document.querySelector('.achievement-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'achievement-toast';
    document.body.appendChild(toast);
  }
  
  toast.innerHTML = `
    <span class="achievement-icon">${icon}</span>
    <div class="achievement-content">
      <div class="achievement-title">ACHIEVEMENT UNLOCKED!</div>
      <div class="achievement-name">${name}</div>
    </div>
  `;
  
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

function triggerPageCrash() {
  const crashOverlay = document.createElement('div');
  crashOverlay.id = 'crash-overlay';
  crashOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #000088;
    z-index: 999999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-family: 'Courier New', monospace;
    color: white;
    text-align: center;
    animation: fadeIn 0.3s ease;
  `;
  
  crashOverlay.innerHTML = `
    <div style="background: white; color: black; padding: 20px; border: 2px solid silver; max-width: 500px; margin: 20px;">
      <pre style="font-size: 20px; margin: 0;">😵</pre>
      <h1 style="font-size: 24px; margin: 10px 0;">:(</h1>
      <p style="font-size: 16px;">Your Fanter ran into a problem and needs to restart.</p>
      <p style="font-size: 14px; margin-top: 20px;">*** STOP: 0x000000F4 (0x00000000, 0x00000000, 0x00000000, 0x00000000)</p>
      <div style="margin-top: 30px;">
        <div style="display: inline-block; width: 20px; height: 20px; background: white; margin: 0 5px; animation: blink 1s step-end infinite;"></div>
        <span style="margin-left: 10px;">Restarting in <span id="crash-countdown">5</span> seconds...</span>
      </div>
    </div>
  `;
  
  document.body.appendChild(crashOverlay);
  
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
  `;
  document.head.appendChild(style);
  
  if (typeof checkAndUnlockAchievement === 'function') checkAndUnlockAchievement(63);
  
  let seconds = 5;
  const countdownEl = document.getElementById('crash-countdown');
  const interval = setInterval(() => {
    seconds--;
    if (countdownEl) countdownEl.textContent = seconds;
    if (seconds <= 0) {
      clearInterval(interval);
      window.location.reload();
    }
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

window.crashFanter = function() {
  triggerPageCrash();
};
console.log('💀 Type "crashFanter()" for a surprise...');
