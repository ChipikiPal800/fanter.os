// these change the name of the site (at the top
var sitename = "fanter beta."; // Change this to change the name of your website.

var subtext = "v0.2, games not added, styling incomplete. :3"; // set the subtext

// more settings in main.css

// end of config

// only change this if you know what your doing - a wise man

// also if you're a beginner coder, use this code to study or something; this code is pretty good
// -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

var serverUrl1 = "https://gms.parcoil.com";
var currentPageTitle = document.title;
document.title = `${currentPageTitle} | ${sitename}`;
let gamesData = [];

function getFavourites() {
  return JSON.parse(localStorage.getItem("favourites") || "[]");
}

function toggleFavourite(gameName) {
  let favs = getFavourites();
  if (favs.includes(gameName)) {
    favs = favs.filter(f => f !== gameName);
  } else {
    favs.push(gameName);
  }
  localStorage.setItem("favourites", JSON.stringify(favs));
}

function displayFilteredGames(filteredGames) {
  const gamesContainer = document.getElementById("gamesContainer");
  gamesContainer.innerHTML = "";
  filteredGames.forEach((game) => {
    const gameDiv = document.createElement("div");
    gameDiv.classList.add("game");
    const gameImage = document.createElement("img");
    let imageSrc;
    if (game.image.startsWith('http')) {
      imageSrc = game.image;
    } else {
      imageSrc = `${serverUrl1}/${game.url}/${game.image}`;
    }
    gameImage.src = imageSrc;
    gameImage.alt = game.name;
    gameImage.onclick = () => {
      if (game.url.startsWith('http')) {
        window.location.href = game.url;
      } else {
        window.location.href = `play.html?gameurl=${game.url}/`;
      }
    };
    const gameName = document.createElement("p");
    gameName.textContent = game.name;
    const favBtn = document.createElement("button");
    favBtn.classList.add("fav-btn");
    favBtn.textContent = getFavourites().includes(game.name) ? "★" : "☆";
    favBtn.title = "favourite";
    favBtn.onclick = (e) => {
      e.stopPropagation();
      toggleFavourite(game.name);
      favBtn.textContent = getFavourites().includes(game.name) ? "★" : "☆";
    };
    gameDiv.appendChild(gameImage);
    gameDiv.appendChild(gameName);
    gameDiv.appendChild(favBtn);
    gamesContainer.appendChild(gameDiv);
  });
}

function handleSearchInput() {
  const searchInputValue = document
    .getElementById("searchInput")
    .value.toLowerCase();
  let filteredGames;
  const favFilterOn = localStorage.getItem("favFilter") === "true";
  if (favFilterOn) {
    const favs = getFavourites();
    filteredGames = gamesData.filter((game) =>
      favs.includes(game.name) &&
      game.name.toLowerCase().includes(searchInputValue)
    );
  } else {
    filteredGames = gamesData.filter((game) =>
      game.name.toLowerCase().includes(searchInputValue)
    );
  }
  displayFilteredGames(filteredGames);
}

function toggleFavFilter() {
  const current = localStorage.getItem("favFilter") === "true";
  localStorage.setItem("favFilter", (!current).toString());
  handleSearchInput();
}

function toggleFavSidebar() {
  const btn = document.getElementById("favSidebarBtn");
  const favFilterOn = localStorage.getItem("favFilter") === "true";
  btn.classList.toggle("active", !favFilterOn);
  btn.classList.toggle("visible", !favFilterOn);
  btn.textContent = !favFilterOn ? "✕" : "★";

  if (!favFilterOn) {
    const favs = getFavourites();
    const allCards = Array.from(document.querySelectorAll(".game"));
    const searchBar = document.getElementById("searchInput");
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
}

fetch("./config/games.json")
  .then((response) => response.json())
  .then((data) => {
    gamesData = data;
    handleSearchInput();
    const btn = document.getElementById("favSidebarBtn");
    if (btn && localStorage.getItem("favFilter") === "true") {
      btn.classList.add("active");
      btn.classList.add("visible");
      btn.textContent = "✕";
    }
  })
  .catch((error) => console.error("Error fetching games:", error));

document
  .getElementById("searchInput")
  .addEventListener("input", handleSearchInput);
document.getElementById("title").innerHTML = `${sitename}`;
document.getElementById("subtitle").innerHTML = `${subtext}`;
window.toggleFavSidebar = toggleFavSidebar;
window.toggleFavFilter = toggleFavFilter;


