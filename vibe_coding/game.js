const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('scoreValue');
const timerElement = document.getElementById('timerValue');

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

// Pacman properties
const pacman = {
    x: canvas.width / 2,
    y: canvas.height / 2,
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
    for (let x = gridSize; x < canvas.width; x += gridSize) {
        for (let y = gridSize; y < canvas.height; y += gridSize) {
            // Don't place dots where walls are
            const isWall = walls.some(wall => wall.x === x && wall.y === y);
            if (!isWall) {
                dots.push({ x, y, eaten: false });
            }
        }
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
            }
        }
    });
}

function drawPacman() {
    ctx.beginPath();
    const startAngle = (pacman.direction * 90 + 30 + pacman.mouthOpen * 60) * Math.PI / 180;
    const endAngle = (pacman.direction * 90 - 30 - pacman.mouthOpen * 60) * Math.PI / 180;
    
    ctx.arc(pacman.x, pacman.y, pacmanSize, startAngle, endAngle);
    ctx.lineTo(pacman.x, pacman.y);
    ctx.fillStyle = 'yellow';
    ctx.fill();
    ctx.closePath();
}

function drawDots() {
    dots.forEach(dot => {
        if (!dot.eaten) {
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, dotSize, 0, Math.PI * 2);
            ctx.fillStyle = 'white';
            ctx.fill();
            ctx.closePath();
        }
    });
}

function drawWalls() {
    walls.forEach(wall => {
        ctx.fillStyle = '#0000FF';
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

function gameLoop() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update game state
    if (!gameOver) {
        updatePacman();
        checkDotCollision();
        updateTimer();
    }

    // Draw game elements
    drawWalls();
    drawDots();
    drawPacman();

    // Check win/lose conditions
    const allDotsEaten = dots.every(dot => dot.eaten);
    if (allDotsEaten) {
        ctx.fillStyle = 'white';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('You Win!', canvas.width / 2, canvas.height / 2);
        gameOver = true;
    } else if (gameOver) {
        ctx.fillStyle = 'white';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2);
        ctx.font = '20px Arial';
        ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 40);
    }

    // Continue game loop
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop(); 