// ===== GAME DETAILS MODAL (FIXED) =====

let currentDetailGame = null;

// Helper to get favourites (global fallback)
function getFavouritesGlobal() {
  return JSON.parse(localStorage.getItem("favourites") || "[]");
}

// Helper to toggle favourite
function toggleFavouriteGlobal(gameName) {
  let favs = getFavouritesGlobal();
  let isAdding = false;
  
  if (favs.includes(gameName)) {
    favs = favs.filter(f => f !== gameName);
    isAdding = false;
  } else {
    favs.push(gameName);
    isAdding = true;
  }
  localStorage.setItem("favourites", JSON.stringify(favs));
  
  // Try to call window.toggleFavourite if available
  if (typeof window.toggleFavourite === 'function') {
    window.toggleFavourite(gameName);
  }
  
  return isAdding;
}

function showGameDetails(gameName, gameUrl, gameImage, gameRating) {
  currentDetailGame = { name: gameName, url: gameUrl, image: gameImage };
  
  // Get ratings from global if available
  let userRating = 0;
  let avgRating = gameRating || { average: 0, count: 0 };
  
  if (typeof userVotes !== 'undefined') {
    userRating = userVotes[gameName] || 0;
  } else {
    const votes = JSON.parse(localStorage.getItem('userVotes') || '{}');
    userRating = votes[gameName] || 0;
  }
  
  // Create modal
  let modal = document.getElementById('gamedetails-modal');
  if (modal) modal.remove();
  
  modal = document.createElement('div');
  modal.id = 'gamedetails-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.85);
    backdrop-filter: blur(10px);
    z-index: 100000;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
  `;
  
  const isFavorited = getFavouritesGlobal().includes(gameName);
  
  modal.innerHTML = `
    <div class="gamedetails-container" style="
      background: rgba(15,20,40,0.98);
      border: 2px solid rgba(45,90,227,0.5);
      border-radius: 24px;
      max-width: 500px;
      width: 90%;
      max-height: 85vh;
      overflow-y: auto;
      transform: scale(0.9);
      transition: transform 0.3s ease;
    ">
      <div style="position: relative;">
        <button class="gamedetails-close" style="
          position: absolute;
          top: 15px;
          right: 15px;
          background: rgba(255,255,255,0.1);
          border: none;
          border-radius: 50%;
          width: 35px;
          height: 35px;
          font-size: 20px;
          cursor: pointer;
          color: white;
          z-index: 10;
        ">✕</button>
        <img src="${gameImage}" alt="${gameName}" style="
          width: 100%;
          border-radius: 24px 24px 0 0;
          max-height: 250px;
          object-fit: cover;
        ">
      </div>
      <div style="padding: 25px;">
        <h2 style="font-size: 24px; margin-bottom: 10px;">${escapeHtml(gameName)}</h2>
        
        <div style="display: flex; gap: 15px; margin-bottom: 20px;">
          <div style="background: rgba(45,90,227,0.2); padding: 5px 12px; border-radius: 20px;">
            <span>⭐ ${avgRating.average.toFixed(1)} (${avgRating.count})</span>
          </div>
          <div style="background: rgba(255,204,0,0.2); padding: 5px 12px; border-radius: 20px;">
            <span>your rating: ${userRating > 0 ? '★'.repeat(userRating) + '☆'.repeat(5-userRating) : 'not rated'}</span>
          </div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <div style="display: flex; gap: 8px; margin-bottom: 15px;">
            ${[1,2,3,4,5].map(star => `
              <span class="detail-star" data-value="${star}" style="
                font-size: 32px;
                cursor: pointer;
                color: ${userRating >= star ? '#ffcc00' : 'rgba(255,255,255,0.2)'};
                transition: all 0.1s ease;
              ">★</span>
            `).join('')}
          </div>
        </div>
        
        <div style="display: flex; gap: 15px; flex-wrap: wrap;">
          <button class="settings-btn" id="gamedetails-play" style="flex: 1;">🎮 play now</button>
          <button class="settings-btn" id="gamedetails-favorite" style="flex: 1;">${isFavorited ? '★ favorited' : '☆ favorite'}</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Animate in
  setTimeout(() => {
    modal.style.opacity = '1';
    modal.style.visibility = 'visible';
    const container = modal.querySelector('.gamedetails-container');
    if (container) container.style.transform = 'scale(1)';
  }, 10);
  
  // Close button
  modal.querySelector('.gamedetails-close').onclick = () => closeGameDetails();
  modal.onclick = (e) => { if (e.target === modal) closeGameDetails(); };
  
  // Star rating
  modal.querySelectorAll('.detail-star').forEach(star => {
    star.onclick = () => {
      const value = parseInt(star.dataset.value);
      if (typeof submitRating === 'function') {
        submitRating(gameName, value);
      } else {
        // Fallback rating
        let votes = JSON.parse(localStorage.getItem('userVotes') || '{}');
        votes[gameName] = value;
        localStorage.setItem('userVotes', JSON.stringify(votes));
        showRatingToastFallback(`You rated "${gameName}" ${value}★!`);
      }
      // Update star colors
      modal.querySelectorAll('.detail-star').forEach((s, idx) => {
        s.style.color = idx < value ? '#ffcc00' : 'rgba(255,255,255,0.2)';
      });
      // Update user rating display
      const ratingDiv = modal.querySelector('.detail-star').parentElement.parentElement.nextSibling;
      if (ratingDiv) {
        ratingDiv.innerHTML = `<span>your rating: ${'★'.repeat(value)}${'☆'.repeat(5-value)}</span>`;
      }
    };
    star.onmouseenter = () => {
      const value = parseInt(star.dataset.value);
      modal.querySelectorAll('.detail-star').forEach((s, idx) => {
        s.style.color = idx < value ? '#ffcc66' : 'rgba(255,255,255,0.2)';
      });
    };
    star.onmouseleave = () => {
      modal.querySelectorAll('.detail-star').forEach((s, idx) => {
        s.style.color = idx < userRating ? '#ffcc00' : 'rgba(255,255,255,0.2)';
      });
    };
  });
  
  // Play button
  document.getElementById('gamedetails-play').onclick = () => {
    if (typeof trackPlayedGame === 'function') trackPlayedGame(gameName);
    const finalUrl = gameUrl.startsWith('http') ? gameUrl : `play.html?gameurl=${encodeURIComponent(gameUrl)}/&game=${encodeURIComponent(gameName)}`;
    window.open(finalUrl, '_blank');
    closeGameDetails();
  };
  
  // Favorite button
  document.getElementById('gamedetails-favorite').onclick = () => {
    const isNowFavorited = toggleFavouriteGlobal(gameName);
    const favBtn = document.getElementById('gamedetails-favorite');
    favBtn.textContent = isNowFavorited ? '★ favorited' : '☆ favorite';
    
    // Also update the game card button if it exists
    const gameCardBtn = document.querySelector(`.fav-btn[data-game="${gameName.replace(/['"]/g, '\\"')}"]`);
    if (gameCardBtn) {
      gameCardBtn.textContent = isNowFavorited ? '★' : '☆';
    }
  };
}

function closeGameDetails() {
  const modal = document.getElementById('gamedetails-modal');
  if (modal) {
    modal.style.opacity = '0';
    modal.style.visibility = 'hidden';
    setTimeout(() => modal.remove(), 300);
  }
}

function showRatingToastFallback(message) {
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

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

// Setup game details on click
function setupGameDetailsOnClick() {
  document.querySelectorAll('.game').forEach(gameCard => {
    if (gameCard.hasAttribute('data-details-setup')) return;
    
    const img = gameCard.querySelector('img');
    const gameName = gameCard.querySelector('p')?.textContent;
    
    if (img && gameName && window.gamesData) {
      const gameData = window.gamesData.find(g => g.name === gameName);
      const gameUrl = gameData?.url || '';
      
      // Get rating
      let gameRating = { average: 0, count: 0 };
      if (typeof globalRatings !== 'undefined' && globalRatings[gameName]) {
        gameRating = globalRatings[gameName];
      }
      
      // Save original click
      const originalClick = img.onclick;
      
      // Create new click that shows details
      img.onclick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        showGameDetails(gameName, gameUrl, img.src, gameRating);
        return false;
      };
      
      gameCard.setAttribute('data-details-setup', 'true');
    }
  });
}

// Watch for new games
if (typeof MutationObserver !== 'undefined') {
  const observer = new MutationObserver(() => {
    setupGameDetailsOnClick();
  });
  const gamesContainer = document.getElementById('gamesContainer');
  if (gamesContainer) {
    observer.observe(gamesContainer, { childList: true, subtree: true });
  }
}

// Also run after games load
setTimeout(setupGameDetailsOnClick, 1000);

console.log('✅ Game Details Modal ready!');
