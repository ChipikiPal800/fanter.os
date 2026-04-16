// ===== GAME CATEGORIES / TAGS WITH SORTING =====

let currentCategory = 'all';
let currentSort = 'default';

const CATEGORY_ICONS = {
  'action': '⚔️',
  'puzzle': '🧩',
  'racing': '🏎️',
  'sports': '⚽',
  'adventure': '🗺️',
  'platformer': '🏃',
  'strategy': '♟️',
  'multiplayer': '👥',
  'arcade': '🕹️',
  'horror': '👻',
  'other': '🎮'
};

const CATEGORY_COLORS = {
  'action': '#ff4444',
  'puzzle': '#44ff44',
  'racing': '#ff8844',
  'sports': '#44ff88',
  'adventure': '#44aaff',
  'platformer': '#ff44ff',
  'strategy': '#88ff44',
  'multiplayer': '#ffaa44',
  'arcade': '#ff44aa',
  'horror': '#aa44ff',
  'other': '#aaaaaa'
};

function getCategoryIcon(category) {
  return CATEGORY_ICONS[category] || '🎮';
}

function getCategoryColor(category) {
  return CATEGORY_COLORS[category] || '#aaaaaa';
}

// Add category tag to game cards using data from games.json
function addCategoryTags() {
  document.querySelectorAll('.game').forEach(gameCard => {
    if (gameCard.hasAttribute('data-category-added')) return;
    
    const gameName = gameCard.querySelector('p')?.textContent;
    if (gameName && typeof gamesData !== 'undefined') {
      const gameData = gamesData.find(g => g.name === gameName);
      const category = gameData?.category || 'other';
      const categoryTag = document.createElement('div');
      categoryTag.className = 'game-category';
      categoryTag.style.cssText = `
        display: inline-block;
        font-size: 10px;
        padding: 2px 8px;
        border-radius: 20px;
        background: ${getCategoryColor(category)}20;
        color: ${getCategoryColor(category)};
        margin-top: 5px;
        font-family: monospace;
      `;
      categoryTag.innerHTML = `${getCategoryIcon(category)} ${category}`;
      gameCard.appendChild(categoryTag);
      gameCard.setAttribute('data-category', category);
      gameCard.setAttribute('data-category-added', 'true');
    }
  });
}

// Filter games by category
function filterByCategory(category) {
  const games = document.querySelectorAll('.game');
  let visibleCount = 0;
  
  games.forEach(game => {
    const gameCategory = game.getAttribute('data-category');
    if (category === 'all' || gameCategory === category) {
      game.style.display = '';
      visibleCount++;
    } else {
      game.style.display = 'none';
    }
  });
  
  updateCategoryCount(visibleCount);
  return visibleCount;
}

// Sort games
function sortGames(sortType) {
  const container = document.getElementById('gamesContainer');
  const games = Array.from(container.children);
  
  const sortedGames = [...games].sort((a, b) => {
    const aName = a.querySelector('p')?.textContent || '';
    const bName = b.querySelector('p')?.textContent || '';
    
    switch(sortType) {
      case 'name-asc':
        return aName.localeCompare(bName);
      case 'name-desc':
        return bName.localeCompare(aName);
      case 'rating-desc':
        const aRating = parseFloat(a.querySelector('.rating-average')?.textContent?.match(/★ ([\d.]+)/)?.[1] || 0);
        const bRating = parseFloat(b.querySelector('.rating-average')?.textContent?.match(/★ ([\d.]+)/)?.[1] || 0);
        return bRating - aRating;
      case 'rating-asc':
        const aRatingAsc = parseFloat(a.querySelector('.rating-average')?.textContent?.match(/★ ([\d.]+)/)?.[1] || 0);
        const bRatingAsc = parseFloat(b.querySelector('.rating-average')?.textContent?.match(/★ ([\d.]+)/)?.[1] || 0);
        return aRatingAsc - bRatingAsc;
      default:
        return 0;
    }
  });
  
  sortedGames.forEach(game => container.appendChild(game));
}

// Combined filter and sort
function filterAndSort() {
  filterByCategory(currentCategory);
  if (currentSort !== 'default') {
    sortGames(currentSort);
  }
}

function updateCategoryCount(visibleCount) {
  let countDisplay = document.getElementById('category-count');
  if (!countDisplay) {
    const filterBar = document.getElementById('category-filter-bar');
    if (filterBar) {
      countDisplay = document.createElement('div');
      countDisplay.id = 'category-count';
      countDisplay.style.cssText = `
        text-align: center;
        font-size: 12px;
        color: rgba(255,255,255,0.5);
        margin-top: 10px;
        font-family: monospace;
      `;
      filterBar.parentNode.insertBefore(countDisplay, filterBar.nextSibling);
    }
  }
  if (countDisplay) {
    const totalGames = document.querySelectorAll('.game').length;
    countDisplay.textContent = `showing ${visibleCount} of ${totalGames} games`;
  }
}

// Add category filter bar
function addCategoryFilterBar() {
  const searchContainer = document.querySelector('.center');
  if (!searchContainer || document.getElementById('category-filter-bar')) return;
  
  const filterBar = document.createElement('div');
  filterBar.id = 'category-filter-bar';
  filterBar.style.cssText = `
    margin: 15px auto;
    max-width: 900px;
  `;
  
  // Get unique categories from gamesData
  let availableCategories = ['all'];
  if (typeof gamesData !== 'undefined' && gamesData.length) {
    const cats = new Set(gamesData.map(g => g.category || 'other'));
    availableCategories.push(...Array.from(cats).sort());
  } else {
    availableCategories.push(...Object.keys(CATEGORY_ICONS));
  }
  
  // Category buttons row
  const categoryRow = document.createElement('div');
  categoryRow.style.cssText = `
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
    margin-bottom: 15px;
  `;
  
  availableCategories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'category-btn';
    btn.setAttribute('data-category', cat);
    btn.style.cssText = `
      background: rgba(20,30,50,0.8);
      border: 1px solid rgba(45,90,227,0.4);
      border-radius: 30px;
      padding: 6px 14px;
      color: white;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
    `;
    btn.innerHTML = cat === 'all' ? '🎮 all' : `${getCategoryIcon(cat)} ${cat}`;
    btn.onmouseenter = () => {
      btn.style.borderColor = getCategoryColor(cat);
      btn.style.transform = 'translateY(-2px)';
    };
    btn.onmouseleave = () => {
      btn.style.borderColor = 'rgba(45,90,227,0.4)';
      btn.style.transform = 'translateY(0)';
    };
    btn.onclick = () => {
      document.querySelectorAll('.category-btn').forEach(b => {
        b.style.background = 'rgba(20,30,50,0.8)';
        b.style.color = 'white';
      });
      btn.style.background = `linear-gradient(135deg, ${getCategoryColor(cat)}40, ${getCategoryColor(cat)}20)`;
      btn.style.color = getCategoryColor(cat);
      currentCategory = cat;
      filterAndSort();
    };
    categoryRow.appendChild(btn);
  });
  
  // Sort options row
  const sortRow = document.createElement('div');
  sortRow.style.cssText = `
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
    align-items: center;
    margin-top: 5px;
  `;
  
  sortRow.innerHTML = `
    <span style="font-size: 11px; color: rgba(255,255,255,0.4);">sort by:</span>
    <button class="sort-btn" data-sort="default" style="
      background: rgba(20,30,50,0.6);
      border: 1px solid rgba(45,90,227,0.3);
      border-radius: 20px;
      padding: 4px 12px;
      color: white;
      font-size: 11px;
      cursor: pointer;
      transition: all 0.2s ease;
    ">default</button>
    <button class="sort-btn" data-sort="name-asc" style="
      background: rgba(20,30,50,0.6);
      border: 1px solid rgba(45,90,227,0.3);
      border-radius: 20px;
      padding: 4px 12px;
      color: white;
      font-size: 11px;
      cursor: pointer;
      transition: all 0.2s ease;
    ">name A-Z</button>
    <button class="sort-btn" data-sort="name-desc" style="
      background: rgba(20,30,50,0.6);
      border: 1px solid rgba(45,90,227,0.3);
      border-radius: 20px;
      padding: 4px 12px;
      color: white;
      font-size: 11px;
      cursor: pointer;
      transition: all 0.2s ease;
    ">name Z-A</button>
    <button class="sort-btn" data-sort="rating-desc" style="
      background: rgba(20,30,50,0.6);
      border: 1px solid rgba(45,90,227,0.3);
      border-radius: 20px;
      padding: 4px 12px;
      color: white;
      font-size: 11px;
      cursor: pointer;
      transition: all 0.2s ease;
    ">highest rated</button>
    <button class="sort-btn" data-sort="rating-asc" style="
      background: rgba(20,30,50,0.6);
      border: 1px solid rgba(45,90,227,0.3);
      border-radius: 20px;
      padding: 4px 12px;
      color: white;
      font-size: 11px;
      cursor: pointer;
      transition: all 0.2s ease;
    ">lowest rated</button>
  `;
  
  sortRow.querySelectorAll('.sort-btn').forEach(btn => {
    btn.onclick = () => {
      const sortType = btn.getAttribute('data-sort');
      currentSort = sortType;
      
      sortRow.querySelectorAll('.sort-btn').forEach(b => {
        b.style.background = 'rgba(20,30,50,0.6)';
        b.style.borderColor = 'rgba(45,90,227,0.3)';
        b.style.color = 'white';
      });
      btn.style.background = `rgba(45,90,227,0.3)`;
      btn.style.borderColor = `rgba(45,90,227,0.8)`;
      btn.style.color = '#ffcc00';
      
      filterAndSort();
    };
  });
  
  filterBar.appendChild(categoryRow);
  filterBar.appendChild(sortRow);
  
  searchContainer.parentNode.insertBefore(filterBar, searchContainer.nextSibling);
}

// Initialize categories
function initCategories() {
  if (!document.getElementById('category-filter-bar')) {
    addCategoryFilterBar();
  }
  addCategoryTags();
  filterAndSort();
}

// Run after games load
if (typeof gamesData !== 'undefined') {
  // If gamesData already exists
  setTimeout(initCategories, 500);
}

// Watch for games container changes
if (typeof MutationObserver !== 'undefined') {
  const observer = new MutationObserver(() => {
    addCategoryTags();
    if (!document.getElementById('category-filter-bar')) {
      addCategoryFilterBar();
    }
  });
  const gamesContainer = document.getElementById('gamesContainer');
  if (gamesContainer) {
    observer.observe(gamesContainer, { childList: true, subtree: true });
  }
}

console.log('✅ Game Categories with Sorting ready!');
