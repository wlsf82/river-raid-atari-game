# River Raid - Atari Inspired PWA

A modern Progressive Web App (PWA) recreation of the classic Atari River Raid game, built with HTML5 Canvas and JavaScript. Now with offline support and installable on any device!

## 🚀 PWA Features

### **Progressive Web App Capabilities**

- **📱 Installable**: Add to home screen on mobile devices and desktop
- **🔄 Offline Support**: Play even without internet connection
- **⚡ Fast Loading**: Service worker caching for instant startup
- **📺 Standalone Mode**: Runs like a native app without browser UI
- **🎮 Landscape Optimized**: Best experience in landscape orientation

### **Installation**

1. Open the game in a modern web browser
2. Look for the "📱 Install River Raid" prompt
3. Click to install as a PWA on your device
4. Launch from home screen/desktop like a native app

## Game Features

### Gameplay

- **Vertical scrolling action**: Navigate through a winding river
- **Fuel management**: Monitor your fuel levels and refuel at fuel depots
- **Enemy combat**: Shoot down helicopters and ships for points
- **Lives system**: Start with 3 lives, lose one when hit or running out of fuel
- **Bonus lives**: Earn extra lives every 2,500 points for extended gameplay
- **Progressive difficulty**: Game gets more challenging as you progress

### Controls

- **Arrow Keys**: Move your jet fighter
  - ← → : Move left/right
  - ↑ ↓ : Move up/down
- **Spacebar**: Fire bullets
- **R**: Restart game (when game over)

### Game Elements

- **Green Jet**: Your fighter aircraft
- **Red/Orange Enemies**: Ships and helicopters to destroy
- **Yellow Fuel Depots**: Fly over these to refuel
- **Green Banks**: River boundaries - avoid touching them!
- **Blue Water**: Safe flying area

### Scoring

- **Ships**: 100 points
- **Helicopters**: 200 points
- **Fuel Depots**: 50 points
- **Bonus Lives**: Awarded every 2,500 points (2.5K, 5K, 7.5K, 10K, etc.)

## How to Play

1. Open `index.html` in any modern web browser
2. Use arrow keys to navigate through the river
3. Press spacebar to shoot enemies
4. Fly over yellow fuel depots to refuel
5. Avoid hitting the green river banks
6. Try to achieve the highest score possible!

## Game Mechanics

### Fuel System

- Fuel depletes continuously during flight
- Fuel depots appear randomly along the river
- Running out of fuel costs a life

### Lives

- Start with 3 lives
- Earn bonus lives every 2,500 points for extended gameplay
- Lose a life by:
  - Colliding with enemies
  - Flying into river banks
  - Running out of fuel
- Game ends when all lives are lost

### River Navigation

- The river winds and changes width dynamically
- Stay within the blue water area
- River banks are deadly obstacles

### Bonus Life System

- **Score Milestones**: Earn extra lives at specific point thresholds
- **2,500 Point Intervals**: First bonus life at 2.5K points, then every 2.5K thereafter
- **Visual Notification**: Golden "BONUS LIFE!" message appears when earned
- **Extended Gameplay**: Allows for longer sessions and higher score potential
- **Classic Arcade Feel**: Traditional bonus life system from retro gaming

## Technical Details

### PWA Architecture

- **Web App Manifest**: `manifest.json` with app metadata and icons
- **Service Worker**: `sw.js` provides offline caching and background sync
- **Cache Strategy**: Cache-first for static assets, network-first for dynamic content
- **Offline Fallback**: Full game functionality available offline
- **Install Prompt**: Native browser install prompt integration

### Files

- `index.html`: Main game interface and PWA entry point
- `game.js`: Complete game engine and logic
- `sw.js`: Service worker for offline support and caching
- `manifest.json`: PWA manifest with app configuration
- `icon-192.png` & `icon-512.png`: App icons for different platforms
- `README.md`: This documentation

### Browser Compatibility

- Works in all modern browsers supporting HTML5 Canvas
- **PWA Support**: Chrome, Firefox, Safari, Edge (latest versions)
- **Service Workers**: Supported in all modern browsers
- **Installation**: Available on mobile (Android/iOS) and desktop
- **Offline Mode**: Full functionality without internet connection
- Responsive design for different screen sizes

## Development

### Architecture

- Object-oriented JavaScript design
- Modular game systems (player, enemies, bullets, etc.)
- Efficient collision detection
- Smooth 60fps gameplay loop

### Customization

The game can be easily modified by adjusting variables in `game.js`:

- `scrollSpeed`: River scrolling speed
- `fuelDepletion`: Rate of fuel consumption
- Spawn rates for enemies and fuel depots
- Player movement speed
- River width and variation

## Installation & Running

### Option 1: Direct Browser

1. Download or clone the files
2. Open `index.html` in your web browser
3. Start playing immediately!

### Option 2: Local Server (Recommended)

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js
npx http-server

# Using PHP
php -S localhost:8000
```

Then visit `http://localhost:8000` in your browser.

## Credits

Inspired by the classic Atari River Raid game by Carol Shaw (1982). This modern web implementation captures the essence of the original while adding contemporary web technologies and smooth gameplay.

Enjoy flying through the river and achieving high scores!
