class GameManager {
    constructor() {
        this.currentLevel = 1;
        this.completedLevels = this.loadProgress();
        this.initEventListeners();
        this.updateLevelButtons();
    }

    loadProgress() {
        const saved = localStorage.getItem('completedLevels');
        return saved ? JSON.parse(saved) : [];
    }

    saveProgress() {
        localStorage.setItem('completedLevels', JSON.stringify(this.completedLevels));
    }

    initEventListeners() {
        // Level selection buttons
        document.querySelectorAll('.level-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const level = parseInt(btn.dataset.level);
                if (this.isLevelUnlocked(level)) {
                    this.startLevel(level);
                }
            });
        });

        // Results screen buttons
        const continueBtn = document.getElementById('continue-btn');
         if (continueBtn) {
          continueBtn.addEventListener('click', () => this.showScreen('main-menu'));
        }

       const menuBtn = document.getElementById('menu-btn');
        if (menuBtn) {
         menuBtn.addEventListener('click', () => this.showScreen('main-menu'));
        }

       /* document.getElementById('continue-btn').addEventListener('click', () => {
            this.showScreen('main-menu');
        });

        document.getElementById('menu-btn').addEventListener('click', () => {
            this.showScreen('main-menu');
        });*/
    }

    isLevelUnlocked(level) {
        return level === 1 || this.completedLevels.includes(level - 1);
    }

   /* updateLevelButtons() {
        document.querySelectorAll('.level-btn').forEach(btn => {
            const level = parseInt(btn.dataset.level);
            if (this.isLevelUnlocked(level)) {
                btn.classList.remove('locked');
            } else {
                btn.classList.add('locked');
            }
        });
    }*/
    updateLevelButtons() {
  document.querySelectorAll('.level-btn').forEach(btn => {
    const level = parseInt(btn.dataset.level);

    // Completed-Status (für ✓)
    if (this.completedLevels.includes(level)) {
      btn.classList.add('completed');
    } else {
      btn.classList.remove('completed');
    }

    // Locked/Unlocked
    if (this.isLevelUnlocked(level)) {
      btn.classList.remove('locked');
    } else {
      btn.classList.add('locked');
    }
  });
}


    startLevel(levelNum) {
        this.currentLevel = levelNum;
        this.showScreen('game-screen');
        
        // Load the appropriate level
        switch(levelNum) {
            case 1:
                new Level1().start();
                break;
            case 2:
                new Level2().start();
                break;
            case 3:
                new Level3().start();
                break;
            case 4:
                new Level4().start();
                break;
        }
    }

 /*   completeLevel(levelNum, score, passed = true) {
  // Nur speichern/freischalten wenn bestanden
  if (passed && !this.completedLevels.includes(levelNum)) {
    this.completedLevels.push(levelNum);
    this.saveProgress();
  }

  this.showResults(levelNum, score, passed);
  this.updateLevelButtons();
}*/
    completeLevel(levelNum, score, passed = true, explanation = '') {
  if (passed && !this.completedLevels.includes(levelNum)) {
    this.completedLevels.push(levelNum);
    this.saveProgress();
  }

  this.showResults(levelNum, score, passed, explanation);
  this.updateLevelButtons();
}


/*showResults(levelNum, score, passed) {
  const resultsContent = document.getElementById('results-content');

  resultsContent.innerHTML = passed
    ? `
      <p>You completed Level ${levelNum} ✅</p>
      <p>Score: ${score}</p>
    `
    : `
      <p>Level ${levelNum} not passed ❌</p>
      <p>${score}</p>
      <p>Du musst das Zeitlimit einhalten, sonst wird das nächste Level nicht freigeschaltet.</p>
    `;

  this.showScreen('results-screen');
}*/
showResults(levelNum, score, passed, explanation = '') {
  const resultsContent = document.getElementById('results-content');

  const extra = (!passed && explanation)
    ? `<p>${explanation}</p>`
    : '';

  resultsContent.innerHTML = passed
    ? `
      <p>You completed Level ${levelNum} ✅</p>
      <p>${score}</p>
    `
    : `
      <p>Level ${levelNum} not passed ❌</p>
      <p>${score}</p>
      ${extra}
    `;

  this.showScreen('results-screen');
}


   /* showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }
}*/
    showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });

    const target = document.getElementById(screenId);
    if (!target) {
        console.error('Screen not found:', screenId);
        return;
    }

    target.classList.add('active');
}
}


// Initialize game when page loads
let gameManager;
window.addEventListener('DOMContentLoaded', () => {
    gameManager = new GameManager();
});


class Level1 {
    constructor() {
        this.attempts = 0;
        this.maxAttempts = 5;
        this.times = [];
        this.container = document.getElementById('game-container');
    }

    start() {
        this.container.innerHTML = `
            <div id="level1-container">
                <h2>Klicken Sie so schnell wie möglich auf das grüne Quadrat!</h2>
                <p>Round: <span id="round">1</span> / ${this.maxAttempts}</p>
                <div id="reaction-area">
                    <div id="green-square"></div>
                    <p id="waiting-text">Wait for green...</p>
                </div>
            </div>
        `;

        this.addStyles();
        this.nextRound();
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #level1-container {
                text-align: center;
                width: 100%;
            }
            #reaction-area {
                width: 400px;
                height: 400px;
                background: #f0f0f0;
                border-radius: 10px;
                margin: 20px auto;
                position: relative; /* Important for absolute positioning of children */
                overflow: hidden; /* Ensures square doesn't go outside */
                display: flex;
                justify-content: center;
                align-items: center;
            }
            #green-square {
                width: 100px;
                height: 100px;
                background: #4caf50;
                border-radius: 10px;
                cursor: pointer;
                display: none;
                position: absolute; /* Allows precise positioning with top/left */
            }
            #waiting-text {
                color: #999;
                font-size: 20px;
            }
        `;
        document.head.appendChild(style);
    }

    nextRound() {
        const square = document.getElementById('green-square');
        const waitingText = document.getElementById('waiting-text');
        const reactionArea = document.getElementById('reaction-area');

        square.style.display = 'none';
        waitingText.style.display = 'block';

        // Random delay between 1-3 seconds
        const delay = Math.random() * 2000 + 1000;

        setTimeout(() => {
            waitingText.style.display = 'none';

            // Calculate random position
            const reactionAreaWidth = reactionArea.offsetWidth;
            const reactionAreaHeight = reactionArea.offsetHeight;
            const squareWidth = square.offsetWidth;
            const squareHeight = square.offsetHeight;

            // Ensure the square stays within the bounds
            const maxLeft = reactionAreaWidth - squareWidth;
            const maxTop = reactionAreaHeight - squareHeight;

            // Generate random coordinates
            // Math.random() returns a float between 0 (inclusive) and 1 (exclusive) [3](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random)
            const randomLeft = Math.floor(Math.random() * maxLeft);
            const randomTop = Math.floor(Math.random() * maxTop);

            square.style.left = `${randomLeft}px`;
            square.style.top = `${randomTop}px`;
            square.style.display = 'block';

            this.startTime = performance.now();

            // Re-assign onclick to ensure it's active for the new round
            square.onclick = () => this.handleClick();
        }, delay);
    }

    handleClick() {
        const reactionTime = performance.now() - this.startTime;
        this.times.push(reactionTime);
        this.attempts++;

        // Update round display, ensuring it doesn't go past maxAttempts
        if (this.attempts <= this.maxAttempts) {
            document.getElementById('round').textContent = this.attempts + 1;
        }


        if (this.attempts < this.maxAttempts) {
            this.nextRound();
        } else {
            this.complete();
        }
    }

    complete() {
        const avgTime = Math.round(this.times.reduce((a, b) => a + b) / this.times.length);
        // Assuming gameManager is globally available or passed in
        if (typeof gameManager !== 'undefined' && gameManager.completeLevel) {
            gameManager.completeLevel(1, avgTime + 'ms',true);
        } else {
            this.container.innerHTML = `
                <div id="level1-container">
                    <h2>Level 1 Complete!</h2>
                    <p>Your average reaction time: ${avgTime}ms</p>
                    <button onclick="location.reload()">Play Again</button>
                </div>
            `;
        }
    }
}


class Level2 {
    constructor() {
        // wie viele unden 
        this.attempts = 0;
        this.maxAttempts = 10;
        this.correctClicks = 0;
        this.container = document.getElementById('game-container');
        // gefragte farben 
        this.colors = ['red', 'blue', 'green', 'yellow'];
        this.colorNames = {
            red: '#e74c3c',
            blue: '#3498db',
            green: '#2ecc71',
            yellow: '#f39c12'
             };
        //zeitlimit
       this.totalTimeLimitMs = 30000; // z.B. 30 Sekunden für ALLE 10 Runden
       this.levelStart = 0;
   
    }

    start() {
        this.levelStart = performance.now();

        this.container.innerHTML = `
            <div id="level2-container">
                <h2>Click ONLY when the word matches the color!</h2>
                <p>Score: <span id="score">0</span> / ${this.maxAttempts}</p>
                <div id="color-display">
                    <div id="color-word"></div>
                </div>
                <button id="match-btn">MATCH!</button>
                <button id="skip-btn">No Match</button>
            </div>
        `;

        this.addStyles();
        this.nextRound();
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #level2-container {
                text-align: center;
            }
            #color-display {
                width: 400px;
                height: 200px;
                background: #f0f0f0;
                border-radius: 10px;
                margin: 20px auto;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            #color-word {
                font-size: 48px;
                font-weight: bold;
            }
            #match-btn, #skip-btn {
                margin: 10px;
                padding: 15px 30px;
                font-size: 18px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            }
            #match-btn {
                background: #2ecc71;
                color: white;
            }
            #skip-btn {
                background: #e74c3c;
                color: white;
            }
        `;
        document.head.appendChild(style);
    }

    nextRound() {
        if (this.attempts >= this.maxAttempts) {
            this.complete();
            return;
        }

        // 50% chance of match
        const isMatch = Math.random() < 0.5;
        const wordColor = this.colors[Math.floor(Math.random() * this.colors.length)];
        const displayColor = isMatch ? wordColor : this.colors[Math.floor(Math.random() * this.colors.length)];

        const colorWord = document.getElementById('color-word');
        colorWord.textContent = wordColor.toUpperCase();
        colorWord.style.color = this.colorNames[displayColor];

        this.currentMatch = isMatch;

        document.getElementById('match-btn').onclick = () => this.handleAnswer(true);
        document.getElementById('skip-btn').onclick = () => this.handleAnswer(false);

    }

    handleAnswer(userSaysMatch) {
        if (userSaysMatch === this.currentMatch) {
            this.correctClicks++;
        }

        this.attempts++;
        document.getElementById('score').textContent = this.correctClicks;

        this.nextRound();
    }

complete() {
  const totalTime = performance.now() - this.levelStart;

  const correct = Number(this.correctClicks); // 🔒 sicher Zahl
  const minCorrect = 8;

  const passed =
    totalTime <= this.totalTimeLimitMs &&
    correct >= minCorrect;

  console.log(
    'LEVEL 2 RESULT →',
    'correct:', correct,
    'time:', Math.round(totalTime),
    'passed:', passed
  );
    const explanation = (totalTime > this.totalTimeLimitMs)
  ? 'Du warst zu langsam: Du musst das Zeitlimit für alle 10 Runden einhalten.'
  : 'Du musst mindestens 8 von 10 richtig haben.';


  gameManager.completeLevel(
    2,
    `Time: ${Math.round(totalTime)}ms | Score: ${correct}/${this.maxAttempts}`, passed, passed ? '' : explanation);
}


}



class Level3 {
    constructor() {
        this.attempts = 0;
        this.maxAttempts = 15;
        this.correctClicks = 0;
        this.container = document.getElementById('game-container');
    }

    isPrime(num) {
        if (num < 2) return false;
        for (let i = 2; i <= Math.sqrt(num); i++) {
            if (num % i === 0) return false;
        }
        return true;
    }

    start() {
        this.container.innerHTML = `
            <div id="level3-container">
                <h2>Click ONLY on Prime Numbers!</h2>
                <p>Score: <span id="score">0</span> / ${this.maxAttempts}</p>
                <div id="number-display">
                    <div id="current-number"></div>
                </div>
                <button id="prime-btn">PRIME!</button>
                <button id="not-prime-btn">Not Prime</button>
            </div>
        `;

        this.addStyles();
        this.nextRound();
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #level3-container {
                text-align: center;
            }
            #number-display {
                width: 400px;
                height: 200px;
                background: #f0f0f0;
                border-radius: 10px;
                margin: 20px auto;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            #current-number {
                font-size: 72px;
                font-weight: bold;
                color: #333;
            }
            #prime-btn, #not-prime-btn {
                margin: 10px;
                padding: 15px 30px;
                font-size: 18px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            }
            #prime-btn {
                background: #3498db;
                color: white;
            }
            #not-prime-btn {
                background: #95a5a6;
                color: white;
            }
        `;
        document.head.appendChild(style);
    }

    nextRound() {
        if (this.attempts >= this.maxAttempts) {
            this.complete();
            return;
        }

        // Generate random number between 1 and 30
        const number = Math.floor(Math.random() * 30) + 1;
        
        document.getElementById('current-number').textContent = number;
        this.currentNumber = number;
        this.currentIsPrime = this.isPrime(number);

        document.getElementById('prime-btn').onclick = () => this.handleAnswer(true);
        document.getElementById('not-prime-btn').onclick = () => this.handleAnswer(false);
    }

    handleAnswer(userSaysPrime) {
        if (userSaysPrime === this.currentIsPrime) {
            this.correctClicks++;
        }

        this.attempts++;
        document.getElementById('score').textContent = this.correctClicks;

        this.nextRound();
    }

    complete() {
        const accuracy = Math.round((this.correctClicks / this.maxAttempts) * 100);
         // Mindestgenauigkeit erforderlich (z.B. 80%)
        const minAccuracy = 80;
        const passed = accuracy >= minAccuracy;
        gameManager.completeLevel(3, accuracy + '% accuracy',passed,  passed ? '' : 'Du brauchst mindestens 80% richtige Antworten.');
    }
}


class Level4 {
    constructor() {
        this.caught = 0;
        this.maxBalls = 10;
        this.container = document.getElementById('game-container');
        this.balls = [];
        this.animationId = null;

        this.missed = 0;
        this.maxMisses = 3;

    }

    start() {
    this.startTime = Date.now(); // Zeit-Tracking starten
        this.container.innerHTML = `
            <div id="level4-container">
                <h2>Catch the falling balls!</h2>
             <p>
              Caught: <span id="caught">0</span> / ${this.maxBalls}
              | Missed: <span id="missed">0</span> / ${this.maxMisses}
             </p>

                <canvas id="game-canvas" width="400" height="500"></canvas>
            </div>
        `;

        this.addStyles();
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        
        this.spawnBall();
        this.gameLoop();
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #level4-container {
                text-align: center;
            }
            #game-canvas {
                border: 2px solid #333;
                border-radius: 10px;
                margin: 20px auto;
                display: block;
                background: #e8f4f8;
            }
        `;
        document.head.appendChild(style);
    }

    spawnBall() {
        if (this.caught >= this.maxBalls) return;

        const ball = {
            x: Math.random() * (this.canvas.width - 40) + 20,
            y: 0,
            radius: 20,
            speed: 2 + Math.random() * 3,
            color: '#e74c3c'
        };
        this.balls.push(ball);
    }

    gameLoop() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Update and draw balls
        for (let i = this.balls.length - 1; i >= 0; i--) {
            const ball = this.balls[i];
            ball.y += ball.speed;

            // Draw ball
            this.ctx.beginPath();
            this.ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = ball.color;
            this.ctx.fill();
            this.ctx.closePath();

            if (ball.y > this.canvas.height + ball.radius) {
            this.balls.splice(i, 1);

            this.missed++;
            const missedEl = document.getElementById('missed');
            if (missedEl) missedEl.textContent = this.missed;

             // ❌ bei 3 verpassten -> sofort verlieren
            if (this.missed >= this.maxMisses) {
            this.complete(false);
            return;
          }

          this.spawnBall();
        }

        }

        if (this.caught < this.maxBalls) {
            this.animationId = requestAnimationFrame(() => this.gameLoop());
        } else {
            this.complete();
        }
    }

    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Check if clicked on any ball
        for (let i = this.balls.length - 1; i >= 0; i--) {
            const ball = this.balls[i];
            const distance = Math.sqrt((x - ball.x) ** 2 + (y - ball.y) ** 2);

            if (distance < ball.radius) {
                this.balls.splice(i, 1);
                this.caught++;
                document.getElementById('caught').textContent = this.caught;
                this.spawnBall();
                break;
            }
        }
    }
   /* complete() {
        cancelAnimationFrame(this.animationId);
          // Berechne die benötigte Zeit
    const timeTaken = Date.now() - this.startTime; // Du musst this.startTime bei Level-Start setzen
    const timeLimitMs = 30000; // z.B. 30 Sekunden
    const passed = timeTaken <= timeLimitMs;
    
    gameManager.completeLevel(4, Math.round(timeTaken / 1000) + 's', passed);
        
    }*/
    complete(passedOverride = null) {
    cancelAnimationFrame(this.animationId);

    const timeTaken = Date.now() - this.startTime;
    const timeLimitMs = 30000;

     // Standard: bestehen nur wenn Zeit ok UND genug gefangen
    let passed = (timeTaken <= timeLimitMs) && (this.caught >= this.maxBalls);

    // Wenn wir explizit verloren haben (z.B. 3 misses)
    if (passedOverride !== null) passed = passedOverride;
        let explanation = '';
if (passedOverride === false) {
  explanation = 'Du hast 3 Bälle verpasst. Maximal 2 sind erlaubt.';
} else if (timeTaken > timeLimitMs) {
  explanation = 'Du warst zu langsam: Du musst das Zeitlimit einhalten.';
}

    const info = `Time: ${Math.round(timeTaken / 1000)}s | Caught: ${this.caught}/${this.maxBalls} | Missed: ${this.missed}/${this.maxMisses}`;
    gameManager.completeLevel(4, info, passed,passed ? '' : explanation);
  }

}
