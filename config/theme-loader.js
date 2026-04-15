// Theme loader - runs on every page
window.loadAndApplyTheme = function() {
  const settings = JSON.parse(localStorage.getItem("themeSettings") || "{}");
  
  console.log("Theme Loader - Settings found:", settings);
  
  if (Object.keys(settings).length === 0) {
    console.log("No theme settings found, using defaults");
    return;
  }
  
  // Remove existing theme classes
  document.body.classList.remove(
    'theme-bg-chill', 'theme-bg-parallax', 'theme-bg-solid', 'theme-bg-aurora', 'theme-bg-void',
    'theme-dark', 'theme-light', 'theme-rainbow', 'theme-neon'
  );
  
  // Apply background type
  if (settings.bg) {
    document.body.classList.add(`theme-bg-${settings.bg}`);
    console.log("Applied background:", settings.bg);
    
    // Handle solid color
    if (settings.bg === 'solid' && settings.solidColor) {
      document.body.style.setProperty('--solid-bg-color', settings.solidColor);
      document.body.style.background = settings.solidColor;
      document.body.style.animation = 'none';
    }
  }
  
  // Apply theme preset
  if (settings.theme && settings.theme !== 'chill') {
    document.body.classList.add(`theme-${settings.theme}`);
    console.log("Applied theme preset:", settings.theme);
  }
  
  // Apply text styles
  if (settings.fontColor) {
    document.documentElement.style.setProperty('--text-color', settings.fontColor);
    console.log("Applied font color:", settings.fontColor);
  }
  
  if (settings.fontSize) {
    document.body.style.fontSize = settings.fontSize + 'px';
    console.log("Applied font size:", settings.fontSize);
  }
  
  if (settings.font) {
    const fontMap = {
      'ubuntu': 'Ubuntu, sans-serif',
      'orbitron': 'Orbitron, monospace',
      'rajdhani': 'Rajdhani, sans-serif',
      'exo2': "'Exo 2', sans-serif",
      'spacegrotesk': "'Space Grotesk', sans-serif"
    };
    const fontValue = fontMap[settings.font] || settings.font;
    document.documentElement.style.setProperty('--site-font', fontValue);
    document.body.style.fontFamily = fontValue;
    console.log("Applied font:", settings.font);
  }

  // Apply card background color
  if (settings.cardBg) {
    document.documentElement.style.setProperty('--card-bg', settings.cardBg);
    console.log("Applied card background:", settings.cardBg);
  }
};

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', window.loadAndApplyTheme);
} else {
  window.loadAndApplyTheme();
}
