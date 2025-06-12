const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('scoreValue');
const timerElement = document.getElementById('timerValue');
const gameOverOverlay = document.getElementById('gameOverOverlay');
const gameOverText = document.getElementById('gameOverText');
const finalScoreElement = document.getElementById('finalScore');

// Set canvas size
canvas.width = 400;
canvas.height = 400;

// Game variables
let score = 0;
const gridSize = 20;
const pacmanSize = 15;
const dotSize = 4;
const wallSize = gridSize;
const gameTime = 30; // 30 seconds game time
let timeLeft = gameTime;
let gameOver = false;
let speedReductionTimer = 0;
const speedReductionDuration = 4; // 4 seconds of speed reduction
let speedBoostTimer = 0;
const speedBoostDuration = 4; // 4 seconds of speed boost

// Pacman properties
const pacman = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    baseSpeed: 3,
    speed: 3,
    direction: 0, // 0: right, 1: down, 2: left, 3: up
    mouthOpen: 0,
    mouthSpeed: 0.15
};

// Create walls
const walls = [];
function generateWalls() {
    // Clear existing walls
    walls.length = 0;
    
    // Number of walls to generate (adjust this to control difficulty)
    const numWalls = 15;
    
    for (let i = 0; i < numWalls; i++) {
        // Generate random position aligned to grid
        const x = Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize;
        const y = Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize;
        
        // Don't place walls too close to Pacman's starting position
        const distanceToPacman = Math.sqrt(
            Math.pow(x - pacman.x, 2) + Math.pow(y - pacman.y, 2)
        );
        
        if (distanceToPacman > gridSize * 3) {
            walls.push({ x, y });
        }
    }
}

// Create dots
const dots = [];
function generateDots() {
    dots.length = 0;
    const possiblePositions = [];
    
    // First, collect all possible positions
    for (let x = gridSize; x < canvas.width; x += gridSize) {
        for (let y = gridSize; y < canvas.height; y += gridSize) {
            // Don't place dots where walls are
            const isWall = walls.some(wall => wall.x === x && wall.y === y);
            if (!isWall) {
                possiblePositions.push({ x, y });
            }
        }
    }
    
    // Shuffle the positions
    for (let i = possiblePositions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [possiblePositions[i], possiblePositions[j]] = [possiblePositions[j], possiblePositions[i]];
    }
    
    // Create exactly 10 slow dots and 10 speed boost dots
    const numSpecialDots = 10;
    for (let i = 0; i < possiblePositions.length; i++) {
        const pos = possiblePositions[i];
        let dotType = 'normal';
        if (i < numSpecialDots) {
            dotType = 'slow';
        } else if (i < numSpecialDots * 2) {
            dotType = 'boost';
        }
        dots.push({
            x: pos.x,
            y: pos.y,
            eaten: false,
            type: dotType
        });
    }
}

// Initialize game elements
generateWalls();
generateDots();

// Handle keyboard input
const keys = {};
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});
document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

function checkWallCollision(newX, newY) {
    const pacmanRadius = pacmanSize;
    return walls.some(wall => {
        const dx = Math.abs(newX - (wall.x + wallSize/2));
        const dy = Math.abs(newY - (wall.y + wallSize/2));
        return dx < (pacmanRadius + wallSize/2) && dy < (pacmanRadius + wallSize/2);
    });
}

function updatePacman() {
    // Update direction based on key presses
    if (keys['ArrowRight']) pacman.direction = 0;
    if (keys['ArrowDown']) pacman.direction = 1;
    if (keys['ArrowLeft']) pacman.direction = 2;
    if (keys['ArrowUp']) pacman.direction = 3;

    // Calculate new position
    let newX = pacman.x;
    let newY = pacman.y;
    
    switch (pacman.direction) {
        case 0: newX += pacman.speed; break;
        case 1: newY += pacman.speed; break;
        case 2: newX -= pacman.speed; break;
        case 3: newY -= pacman.speed; break;
    }

    // Check wall collision before updating position
    if (!checkWallCollision(newX, newY)) {
        pacman.x = newX;
        pacman.y = newY;
    }

    // Keep Pacman within bounds
    pacman.x = Math.max(pacmanSize, Math.min(canvas.width - pacmanSize, pacman.x));
    pacman.y = Math.max(pacmanSize, Math.min(canvas.height - pacmanSize, pacman.y));

    // Update mouth animation
    pacman.mouthOpen += pacman.mouthSpeed;
    if (pacman.mouthOpen > 0.5 || pacman.mouthOpen < 0) {
        pacman.mouthSpeed = -pacman.mouthSpeed;
    }
}

function updateSpeedReduction() {
    if (speedReductionTimer > 0) {
        speedReductionTimer -= 1/60; // Decrease timer
        if (speedReductionTimer <= 0) {
            // Restore normal speed when timer expires
            pacman.speed = pacman.baseSpeed;
            speedReductionTimer = 0;
        }
    }
}

function updateSpeedBoost() {
    if (speedBoostTimer > 0) {
        speedBoostTimer -= 1/60; // Decrease timer
        if (speedBoostTimer <= 0) {
            // Restore normal speed when timer expires
            pacman.speed = pacman.baseSpeed;
            speedBoostTimer = 0;
        }
    }
}

function checkDotCollision() {
    dots.forEach(dot => {
        if (!dot.eaten) {
            const dx = pacman.x - dot.x;
            const dy = pacman.y - dot.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < pacmanSize) {
                dot.eaten = true;
                score += 10;
                scoreElement.textContent = score;
                
                // Apply speed effects based on dot type
                if (dot.type === 'slow') {
                    pacman.speed = pacman.baseSpeed / 4;
                    speedReductionTimer = speedReductionDuration;
                } else if (dot.type === 'boost') {
                    pacman.speed = pacman.baseSpeed * 2;
                    speedBoostTimer = speedBoostDuration;
                }
            }
        }
    });
}

function drawPacman() {
    ctx.save();
    ctx.translate(pacman.x, pacman.y);
    
    // Rotate based on direction
    const rotation = (pacman.direction * 90) * Math.PI / 180;
    ctx.rotate(rotation);

    // Draw dog head (white)
    ctx.beginPath();
    ctx.fillStyle = 'white';
    
    // Main head shape
    ctx.arc(0, 0, pacmanSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Snout
    ctx.beginPath();
    ctx.ellipse(pacmanSize * 0.4, 0, pacmanSize * 0.5, pacmanSize * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Ears
    ctx.beginPath();
    ctx.moveTo(-pacmanSize * 0.3, -pacmanSize * 0.5);
    ctx.lineTo(-pacmanSize * 0.6, -pacmanSize * 0.8);
    ctx.lineTo(-pacmanSize * 0.3, -pacmanSize * 0.3);
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(-pacmanSize * 0.3, pacmanSize * 0.5);
    ctx.lineTo(-pacmanSize * 0.6, pacmanSize * 0.8);
    ctx.lineTo(-pacmanSize * 0.3, pacmanSize * 0.3);
    ctx.fill();

    // Draw purple details
    ctx.fillStyle = '#9370DB';
    
    // Eyes
    ctx.beginPath();
    ctx.arc(pacmanSize * 0.2, -pacmanSize * 0.2, pacmanSize * 0.15, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(pacmanSize * 0.2, pacmanSize * 0.2, pacmanSize * 0.15, 0, Math.PI * 2);
    ctx.fill();
    
    // Nose
    ctx.beginPath();
    ctx.arc(pacmanSize * 0.7, 0, pacmanSize * 0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function drawDots() {
    dots.forEach(dot => {
        if (!dot.eaten) {
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, dotSize, 0, Math.PI * 2);
            // Set color based on dot type
            switch(dot.type) {
                case 'slow':
                    ctx.fillStyle = '#FF69B4'; // Pink for slow dots
                    break;
                case 'boost':
                    ctx.fillStyle = '#9370DB'; // Purple for speed boost dots
                    break;
                default:
                    ctx.fillStyle = 'white'; // White for normal dots
            }
            ctx.fill();
            ctx.closePath();
        }
    });
}

function drawWalls() {
    walls.forEach(wall => {
        ctx.fillStyle = '#9370DB';
        ctx.fillRect(wall.x, wall.y, wallSize, wallSize);
    });
}

function updateTimer() {
    if (!gameOver) {
        timeLeft -= 1/60; // Decrease by 1/60th of a second (assuming 60fps)
        if (timeLeft <= 0) {
            timeLeft = 0;
            gameOver = true;
        }
        // Update the timer display in the header
        timerElement.textContent = Math.ceil(timeLeft);
    }
}

function showGameOver(isWin) {
    gameOver = true;
    gameOverText.textContent = isWin ? 'You Win!' : 'Game Over!';
    finalScoreElement.textContent = `Final Score: ${score}`;
    gameOverOverlay.classList.add('visible');
}

function gameLoop() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update game state
    if (!gameOver) {
        updatePacman();
        checkDotCollision();
        updateTimer();
        updateSpeedReduction();
        updateSpeedBoost();
    }

    // Draw game elements
    drawWalls();
    drawDots();
    drawPacman();

    // Check win/lose conditions
    const allDotsEaten = dots.every(dot => dot.eaten);
    if (allDotsEaten) {
        showGameOver(true);
    } else if (gameOver && !gameOverOverlay.classList.contains('visible')) {
        showGameOver(false);
    }

    // Continue game loop
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop(); 