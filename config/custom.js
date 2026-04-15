// Initialize the homepage
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('title').textContent = 'fanter beta';
  document.getElementById('subtitle').textContent = 'v0.25, some settings complete, more games added, bugfixes and more coming soon! :3';
  
  // Load your games
  loadGames();
  
  // Setup search functionality
  setupSearch();
});

async function loadGames() {
  // You can replace this with your actual games data
  const games = [
    { name: 'Game 1', url: 'game1' },
    { name: 'Game 2', url: 'game2' },
    // Add more games here
  ];
  
  const container = document.getElementById('gamesContainer');
  games.forEach(game => {
    const card = document.createElement('div');
    card.className = 'game-card';
    card.innerHTML = `<h3>${game.name}</h3>`;
    card.onclick = () => {
      window.location.href = `/play.html?gameurl=${game.url}`;
    };
    container.appendChild(card);
  });
}

function setupSearch() {
  const searchInput = document.getElementById('searchInput');
  const gameCards = document.querySelectorAll('.game-card');
  
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    gameCards.forEach(card => {
      const gameName = card.textContent.toLowerCase();
      card.style.display = gameName.includes(query) ? 'block' : 'none';
    });
  });
}
