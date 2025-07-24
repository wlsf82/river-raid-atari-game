// River Raid Game - Atari Inspired
class RiverRaidGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.width = this.canvas.width;
    this.height = this.canvas.height;

    // Game state
    this.gameRunning = true;
    this.score = 0;
    this.lives = 3;
    this.fuel = 100;
    this.fuelDepletion = 0.02;
    this.scrollSpeed = 2;
    this.highScore = this.loadHighScore();

    // Extra life system
    this.extraLifeScore = 2500; // Points needed for first extra life
    this.nextExtraLifeThreshold = 2500; // Next score threshold for extra life

    // Player
    this.player = {
      x: this.width / 2 - 15,
      y: this.height - 80,
      width: 30,
      height: 40,
      speed: 5,
      color: '#00ff00'
    };

    // Game objects
    this.bullets = [];
    this.enemies = [];
    this.fuelDepots = [];
    this.riverBanks = [];
    this.explosions = [];

    // River generation
    this.riverWidth = 400;
    this.riverCenterX = this.width / 2;
    this.riverOffset = 0;
    this.distanceTraveled = 0;
    this.riverWidthCycle = 0; // Track the width change cycle

    this.initializeRiver();
    this.bindEvents();
    this.gameLoop();
  }

  checkBonusLife() {
    // Check if player has reached a score milestone for extra life
    if (this.score >= this.nextExtraLifeThreshold) {
      this.lives++;
      this.nextExtraLifeThreshold += this.extraLifeScore; // Set next threshold

      // Show bonus life notification
      this.showBonusLifeMessage();

      console.log(`Bonus life! Score: ${this.score}, Lives: ${this.lives}`);
    }
  }

  showBonusLifeMessage() {
    // Create temporary message element
    const message = document.createElement('div');
    message.textContent = 'BONUS LIFE!';
    message.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(255, 215, 0, 0.9);
      color: #000;
      padding: 20px 40px;
      border: 3px solid #ffff00;
      border-radius: 10px;
      font-size: 24px;
      font-weight: bold;
      z-index: 1000;
      animation: bonusLifePulse 2s ease-in-out;
    `;

    // Add CSS animation
    if (!document.querySelector('#bonusLifeStyle')) {
      const style = document.createElement('style');
      style.id = 'bonusLifeStyle';
      style.textContent = `
        @keyframes bonusLifePulse {
          0%, 100% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
          20%, 80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(message);

    // Remove message after animation
    setTimeout(() => {
      if (message.parentNode) {
        message.parentNode.removeChild(message);
      }
    }, 2000);
  }

  loadHighScore() {
    try {
      const savedHighScore = localStorage.getItem('riverRaidHighScore');
      return savedHighScore ? parseInt(savedHighScore, 10) : 0;
    } catch (error) {
      console.warn('Could not load high score from localStorage:', error);
      return 0;
    }
  }

  saveHighScore() {
    try {
      localStorage.setItem('riverRaidHighScore', this.highScore.toString());
    } catch (error) {
      console.warn('Could not save high score to localStorage:', error);
    }
  }

  initializeRiver() {
    // Create initial river banks
    for (let y = 0; y < this.height + 100; y += 10) {
      this.addRiverSegment(y);
    }
  }

  addRiverSegment(y) {
    const variation = Math.sin(y * 0.01) * 50 + Math.random() * 20 - 10;
    const centerX = this.width / 2 + variation;

    // Calculate dynamic river width based on actual game distance, not segment position
    const baseWidth = this.riverWidth;
    const widthModulation = this.calculateRiverWidth(this.distanceTraveled + y);
    const finalWidth = baseWidth + widthModulation;

    // Ensure minimum and maximum width bounds for better gameplay
    const minWidth = 150; // Narrower minimum for more challenge
    const maxWidth = 650; // Wider maximum for relief sections
    const clampedWidth = Math.max(minWidth, Math.min(maxWidth, finalWidth));

    this.riverBanks.push({
      y: y,
      leftX: centerX - clampedWidth / 2,
      rightX: centerX + clampedWidth / 2
    });
  }  calculateRiverWidth(y) {
    // Use the y position for river generation, but don't update actual distance traveled
    const segmentDistance = Math.abs(y);

    // Create different width patterns based on game progression
    const scoreInfluence = this.score * 0.005; // Reduced for more gradual difficulty
    const distanceKm = segmentDistance / 50; // Convert to km for easier understanding

    // Create dramatic width changes with multiple wave patterns
    const longWave = Math.sin(distanceKm * 0.1) * 120;     // Very long, dramatic changes
    const mediumWave = Math.sin(distanceKm * 0.3) * 80;    // Medium-length changes
    const shortWave = Math.sin(distanceKm * 0.8) * 50;     // Quick variations
    const microWave = Math.sin(distanceKm * 2.0) * 25;     // Fine detail variations

    // Score-based difficulty: higher score = generally narrower river
    const difficultyModifier = -scoreInfluence * 30;

    // Create specific challenging sections at certain distances
    const challengingSections = this.getChallengineSections(distanceKm);

    // Periodic wide sections for relief
    const reliefSections = Math.sin(distanceKm * 0.05) * 60;

    // Add some controlled randomness
    const randomVariation = (Math.random() - 0.5) * 20;

    return longWave + mediumWave + shortWave + microWave +
           difficultyModifier + challengingSections + reliefSections + randomVariation;
  }  getChallengineSections(distanceKm) {
    // Create specific narrow sections at certain milestones
    const milestones = [5, 12, 20, 30, 45, 60]; // km marks for challenging sections
    let challengeModifier = 0;

    for (let milestone of milestones) {
      const proximity = Math.abs(distanceKm - milestone);
      if (proximity < 2) { // Within 2km of milestone
        const intensity = (2 - proximity) / 2; // 0 to 1, stronger closer to milestone
        challengeModifier -= intensity * 100; // Make river narrower
      }
    }

    // Progressive difficulty: river gets generally narrower over distance
    const progressiveDifficulty = -(distanceKm * 0.8);

    return challengeModifier + progressiveDifficulty;
  }

  bindEvents() {
    this.keys = {};

    document.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;

      if (e.code === 'Space') {
        e.preventDefault();
        this.shoot();
      }

      if (e.code === 'KeyR' && !this.gameRunning) {
        this.restart();
      }
    });

    document.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });
  }

  shoot() {
    if (!this.gameRunning) return;

    this.bullets.push({
      x: this.player.x + this.player.width / 2 - 2,
      y: this.player.y,
      width: 4,
      height: 10,
      speed: 8
    });
  }

  update() {
    if (!this.gameRunning) return;

    this.updatePlayer();
    this.updateBullets();
    this.updateEnemies();
    this.updateFuelDepots();
    this.updateRiver();
    this.updateExplosions();
    this.checkCollisions();
    this.spawnEnemies();
    this.spawnFuelDepots();
    this.updateFuel();
    this.checkGameOver();
  }

  updatePlayer() {
    // Player movement
    if (this.keys['ArrowLeft'] && this.player.x > 0) {
      this.player.x -= this.player.speed;
    }
    if (this.keys['ArrowRight'] && this.player.x < this.width - this.player.width) {
      this.player.x += this.player.speed;
    }
    if (this.keys['ArrowUp'] && this.player.y > 0) {
      this.player.y -= this.player.speed;
    }
    if (this.keys['ArrowDown'] && this.player.y < this.height - this.player.height) {
      this.player.y += this.player.speed;
    }

    // Check if player is outside river boundaries
    const playerCenterX = this.player.x + this.player.width / 2;
    for (let bank of this.riverBanks) {
      if (Math.abs(bank.y - this.player.y) < 20) {
        if (playerCenterX < bank.leftX || playerCenterX > bank.rightX) {
          this.playerHit();
          break;
        }
      }
    }
  }

  updateBullets() {
    this.bullets = this.bullets.filter(bullet => {
      bullet.y -= bullet.speed;
      return bullet.y > -bullet.height;
    });
  }

  updateEnemies() {
    this.enemies.forEach(enemy => {
      enemy.y += this.scrollSpeed + enemy.speed;
    });

    this.enemies = this.enemies.filter(enemy => enemy.y < this.height + 50);
  }

  updateFuelDepots() {
    this.fuelDepots.forEach(depot => {
      depot.y += this.scrollSpeed;
    });

    this.fuelDepots = this.fuelDepots.filter(depot => depot.y < this.height + 50);
  }

  updateRiver() {
    // Move river banks down
    this.riverBanks.forEach(bank => {
      bank.y += this.scrollSpeed;
    });

    // Track distance traveled for river width calculations
    this.distanceTraveled += this.scrollSpeed;

    // Remove old river segments and add new ones
    this.riverBanks = this.riverBanks.filter(bank => bank.y < this.height + 100);

    while (this.riverBanks.length < (this.height / 10) + 20) {
      const lastY = this.riverBanks.length > 0 ?
        Math.min(...this.riverBanks.map(b => b.y)) : 0;
      this.addRiverSegment(lastY - 10);
    }
  }

  updateExplosions() {
    this.explosions.forEach(explosion => {
      explosion.life--;
      explosion.size += 2;
    });

    this.explosions = this.explosions.filter(explosion => explosion.life > 0);
  }

  spawnEnemies() {
    if (Math.random() < 0.01) {
      const riverBank = this.riverBanks.find(bank => bank.y < 50 && bank.y > -50);
      if (riverBank) {
        const x = riverBank.leftX + Math.random() * (riverBank.rightX - riverBank.leftX - 30);

        this.enemies.push({
          x: x,
          y: -30,
          width: 30,
          height: 20,
          speed: Math.random() * 2 + 1,
          type: Math.random() > 0.7 ? 'helicopter' : 'ship',
          color: Math.random() > 0.5 ? '#ff0000' : '#ff8800'
        });
      }
    }
  }

  spawnFuelDepots() {
    if (Math.random() < 0.005) {
      const riverBank = this.riverBanks.find(bank => bank.y < 50 && bank.y > -50);
      if (riverBank) {
        const x = riverBank.leftX + Math.random() * (riverBank.rightX - riverBank.leftX - 40);

        this.fuelDepots.push({
          x: x,
          y: -40,
          width: 40,
          height: 20,
          color: '#ffff00'
        });
      }
    }
  }

  checkCollisions() {
    // Bullet-enemy collisions
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        if (this.isColliding(this.bullets[i], this.enemies[j])) {
          this.createExplosion(this.enemies[j].x + this.enemies[j].width / 2,
                             this.enemies[j].y + this.enemies[j].height / 2);
          this.score += this.enemies[j].type === 'helicopter' ? 200 : 100;
          this.checkBonusLife(); // Check for bonus life after scoring
          this.bullets.splice(i, 1);
          this.enemies.splice(j, 1);
          break;
        }
      }
    }

    // Player-enemy collisions
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      if (this.isColliding(this.player, this.enemies[i])) {
        this.createExplosion(this.player.x + this.player.width / 2,
                           this.player.y + this.player.height / 2);
        this.enemies.splice(i, 1);
        this.playerHit();
      }
    }

    // Player-fuel depot collisions
    for (let i = this.fuelDepots.length - 1; i >= 0; i--) {
      if (this.isColliding(this.player, this.fuelDepots[i])) {
        this.fuel = Math.min(100, this.fuel + 30);
        this.score += 50;
        this.checkBonusLife(); // Check for bonus life after scoring
        this.fuelDepots.splice(i, 1);
      }
    }
  }

  isColliding(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
  }

  createExplosion(x, y) {
    this.explosions.push({
      x: x,
      y: y,
      size: 10,
      life: 20,
      color: '#ff6600'
    });
  }

  playerHit() {
    this.lives--;
    this.player.x = this.width / 2 - 15;
    this.player.y = this.height - 80;

    if (this.lives <= 0) {
      this.gameRunning = false;
    }
  }

  updateFuel() {
    this.fuel -= this.fuelDepletion;
    if (this.fuel <= 0) {
      this.fuel = 0;
      this.playerHit();
    }
  }

  checkGameOver() {
    if (this.lives <= 0) {
      this.gameRunning = false;

      // Check if we have a new high score
      let isNewRecord = false;
      if (this.score > this.highScore) {
        this.highScore = this.score;
        this.saveHighScore();
        isNewRecord = true;
      }

      // Update game over message
      const gameOverText = document.getElementById('gameOverText');
      if (isNewRecord) {
        gameOverText.textContent = 'NEW RECORD!';
        gameOverText.style.color = '#ffff00';
      } else {
        gameOverText.textContent = 'GAME OVER';
        gameOverText.style.color = '#fff';
      }

      // Update final score displays
      document.getElementById('finalScore').textContent = this.score;
      document.getElementById('finalHighScore').textContent = this.highScore;

      document.getElementById('gameOver').style.display = 'block';
    }
  }

  render() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Draw river (background)
    this.ctx.fillStyle = '#1e3a8a';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw river banks
    this.ctx.fillStyle = '#228B22';
    for (let i = 0; i < this.riverBanks.length - 1; i++) {
      const current = this.riverBanks[i];
      const next = this.riverBanks[i + 1];

      // Left bank
      this.ctx.beginPath();
      this.ctx.moveTo(0, current.y);
      this.ctx.lineTo(current.leftX, current.y);
      this.ctx.lineTo(next.leftX, next.y);
      this.ctx.lineTo(0, next.y);
      this.ctx.fill();

      // Right bank
      this.ctx.beginPath();
      this.ctx.moveTo(this.width, current.y);
      this.ctx.lineTo(current.rightX, current.y);
      this.ctx.lineTo(next.rightX, next.y);
      this.ctx.lineTo(this.width, next.y);
      this.ctx.fill();
    }

    // Draw player
    this.ctx.fillStyle = this.player.color;
    this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);

    // Draw player details (simple jet shape)
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(this.player.x + 13, this.player.y - 5, 4, 8);

    // Draw bullets
    this.ctx.fillStyle = '#ffff00';
    this.bullets.forEach(bullet => {
      this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });

    // Draw enemies
    this.enemies.forEach(enemy => {
      this.ctx.fillStyle = enemy.color;
      this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

      if (enemy.type === 'helicopter') {
        // Draw rotor
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(enemy.x - 5, enemy.y - 2, enemy.width + 10, 2);
      }
    });

    // Draw fuel depots
    this.ctx.fillStyle = '#ffff00';
    this.fuelDepots.forEach(depot => {
      this.ctx.fillRect(depot.x, depot.y, depot.width, depot.height);
      this.ctx.fillStyle = '#ff0000';
      this.ctx.fillRect(depot.x + 5, depot.y + 5, depot.width - 10, depot.height - 10);
      this.ctx.fillStyle = '#ffff00';
    });

    // Draw explosions
    this.explosions.forEach(explosion => {
      this.ctx.fillStyle = explosion.color;
      this.ctx.beginPath();
      this.ctx.arc(explosion.x, explosion.y, explosion.size, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // Update UI
    document.getElementById('score').textContent = this.score;
    document.getElementById('fuel').textContent = Math.floor(this.fuel);
    document.getElementById('lives').textContent = this.lives;
    document.getElementById('highScore').textContent = this.highScore;
    document.getElementById('distance').textContent = Math.floor(this.distanceTraveled / 50); // Convert to km
  }

  gameLoop() {
    this.update();
    this.render();
    requestAnimationFrame(() => this.gameLoop());
  }

  restart() {
    this.gameRunning = true;
    this.score = 0;
    this.lives = 3;
    this.fuel = 100;
    this.distanceTraveled = 0;
    this.riverWidthCycle = 0;
    this.nextExtraLifeThreshold = 2500; // Reset bonus life threshold
    this.player.x = this.width / 2 - 15;
    this.player.y = this.height - 80;
    this.bullets = [];
    this.enemies = [];
    this.fuelDepots = [];
    this.explosions = [];
    this.riverBanks = []; // Clear existing river
    this.initializeRiver(); // Regenerate river with reset parameters
    document.getElementById('gameOver').style.display = 'none';
  }
}

// Start the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new RiverRaidGame();
});
