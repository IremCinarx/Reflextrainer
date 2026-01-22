// Countdown
function showCountdown(onFinish) {
  const overlay = document.createElement('div');
  overlay.id = 'countdown-overlay';
  overlay.innerHTML = `<div id="countdown-number">3</div>`;
  document.body.appendChild(overlay);

  const numbers = ['3', '2', '1', 'LOS'];
  let index = 0;

  const el = document.getElementById('countdown-number');
  el.textContent = numbers[index];

  const interval = setInterval(() => {
    index++;
    if (index >= numbers.length) {
      clearInterval(interval);
      overlay.remove();
      onFinish();
      return;
    }
    el.textContent = numbers[index];
    el.style.animation = 'pop 0.4s ease';
  }, 800);
}

// GameManager
class GameManager {
  constructor() {
    this.currentLevel = 1;
    this.completedLevels = this.loadProgress();
    this.initEventListeners();
    this.updateLevelButtons();
    this.showScreen('start-screen');
  }

  loadProgress() {
    const saved = localStorage.getItem('completedLevels');
    return saved ? JSON.parse(saved) : [];
  }

  saveProgress() {
    localStorage.setItem('completedLevels', JSON.stringify(this.completedLevels));
  }

  initEventListeners() {
    const startBtn = document.getElementById('start-btn');
    if (startBtn) startBtn.addEventListener('click', () => this.showScreen('main-menu'));

    document.querySelectorAll('.level-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const level = parseInt(btn.dataset.level, 10);
        if (this.isLevelUnlocked(level)) this.startLevel(level);
      });
    });

    const gameBackBtn = document.getElementById('game-back-btn');
    if (gameBackBtn) gameBackBtn.addEventListener('click', () => this.showScreen('main-menu'));

    const continueBtn = document.getElementById('continue-btn');
    if (continueBtn) continueBtn.addEventListener('click', () => this.showScreen('main-menu'));

    const menuBtn = document.getElementById('menu-btn');
    if (menuBtn) menuBtn.addEventListener('click', () => this.showScreen('main-menu'));

    const retryBtn = document.getElementById('retry-btn');
    if (retryBtn) retryBtn.addEventListener('click', () => this.retryLevel());

    const nextLevelBtn = document.getElementById('next-level-btn');
    if (nextLevelBtn) nextLevelBtn.addEventListener('click', () => this.nextLevel());
  }

  isLevelUnlocked(level) {
    return level === 1 || this.completedLevels.includes(level - 1);
  }

  isAllLevelsCompleted() {
    return this.completedLevels.length === 4;
  }

  updateLevelButtons() {
    document.querySelectorAll('.level-btn').forEach(btn => {
      const level = parseInt(btn.dataset.level, 10);
      if (this.completedLevels.includes(level)) {
        btn.classList.add('completed');
      } else {
        btn.classList.remove('completed');
      }
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
    switch (levelNum) {
      case 1: new Level1().start(); break;
      case 2: new Level2().start(); break;
      case 3: new Level3().start(); break;
      case 4: new Level4().start(); break;
    }
  }

  retryLevel() {
    this.startLevel(this.currentLevel);
  }

  nextLevel() {
    const nextLevel = Math.min(4, this.currentLevel + 1);
    if (this.isLevelUnlocked(nextLevel)) {
      this.startLevel(nextLevel);
    }
  }

  completeLevel(levelNum, score, passed = true) {
    if (passed && !this.completedLevels.includes(levelNum)) {
      this.completedLevels.push(levelNum);
      this.saveProgress();
    }

    this.showResults(levelNum, score, passed);
    this.updateLevelButtons();
  }

  showResults(levelNum, score, passed) {
    const isAllComplete = this.isAllLevelsCompleted();
    const nextUnlocked = this.isLevelUnlocked(levelNum + 1);
    
    let buttonsHtml = `
      <button id="retry-btn">Wiederholen</button>
    `;
    
    if (nextUnlocked && levelNum < 4) {
      buttonsHtml += `
        <button id="next-level-btn">Nächstes Level</button>
      `;
    }
      buttonsHtml += `
    <button id="menu-btn-level">← Menü</button>
  `;

    
    if (isAllComplete) {
      buttonsHtml += `
        <a href="https://forms.gle/DYr5GXWQ9coDCLpN7" target="_blank" class="eval-btn">
          Spiel auswerten →
        </a>
      `;
    }

    const resultsContent = document.getElementById('results-content');
    const timeLimits = {
      1: 'Keine Zeitbegrenzung',
      2: '10 Sekunden',
      3: '60 Sekunden',
      4: '45 Sekunden'
    };
    resultsContent.innerHTML = `
      <div class="results-simple">
        <p>${passed ? 'Level bestanden ✅' : 'Level nicht bestanden ❌'}</p>
        <p>${score}</p>
        <p><strong>Zeitlimit:</strong> ${timeLimits[levelNum]}</p>  <!-- ⭐ NEU! -->
      </div>
      <div class="results-buttons">
        ${buttonsHtml}
      </div>
    `;

    this.showScreen('results-screen');
    
    const retryBtn = document.getElementById('retry-btn');
    if (retryBtn) retryBtn.addEventListener('click', () => this.retryLevel());
    
    const nextBtn = document.getElementById('next-level-btn');
    if (nextBtn) nextBtn.addEventListener('click', () => this.nextLevel());

    const menuBtnLevel = document.getElementById('menu-btn-level');
  if (menuBtnLevel) {
    menuBtnLevel.addEventListener('click', () => this.showScreen('main-menu'));
   }

  }
  


  showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(screenId);
    if (target) target.classList.add('active');
  }
}

let gameManager;
window.addEventListener('DOMContentLoaded', () => {
  gameManager = new GameManager();
});

// Level 1 – Warm-up (GEFIXT: Genau 5 Runden, kein Mehrfachklick)
class Level1 {
  constructor() {
    this.attempts = 0;
    this.maxAttempts = 5;
    this.times = [];
    this.currentRoundActive = false;
    this.container = document.getElementById('game-container');
  }

  start() {
    this.container.innerHTML = `
      <div id="level1-container">
        <h2>Klicke so schnell wie möglich auf das grüne Quadrat!</h2>
        <p>Runde: <span id="round">1</span> / ${this.maxAttempts}</p>
        <div id="reaction-box" class="reaction-box">
          <div id="green-square"></div>
          <p id="waiting-text">Warte auf grün...</p>
        </div>
      </div>
    `;
    showCountdown(() => this.nextRound());
  }

  nextRound() {
    this.currentRoundActive = false;
    
    const square = document.getElementById('green-square');
    const waitingText = document.getElementById('waiting-text');
    const box = document.getElementById('reaction-box');

    square.style.display = 'none';
    waitingText.style.display = 'block';
    square.onclick = null;

    const boxWidth = box.offsetWidth - 40;
    const boxHeight = box.offsetHeight - 40;
    const squareSize = 80;

    const delay = Math.random() * 2000 + 1000;

    setTimeout(() => {
      waitingText.style.display = 'none';

      const randomLeft = Math.random() * (boxWidth - squareSize);
      const randomTop = Math.random() * (boxHeight - squareSize);

      square.style.left = `${20 + randomLeft}px`;
      square.style.top = `${20 + randomTop}px`;
      square.style.width = `${squareSize}px`;
      square.style.height = `${squareSize}px`;
      square.style.display = 'block';

      this.currentRoundActive = true;
      this.startTime = performance.now();
      
      square.onclick = () => {
        if (this.currentRoundActive) {
          this.handleClick();
        }
      };
    }, delay);
  }

  handleClick() {
    this.currentRoundActive = false;
    document.getElementById('green-square').onclick = null;

    const reactionTime = performance.now() - this.startTime;
    this.times.push(reactionTime);
    this.attempts++;

    document.getElementById('round').textContent = this.attempts + 1;

    if (this.attempts < this.maxAttempts) {
      setTimeout(() => this.nextRound(), 800);
    } else {
      this.complete();
    }
  }

  complete() {
    const avgTime = Math.round(this.times.reduce((a, b) => a + b) / this.times.length);
    gameManager.completeLevel(1, `Durchschnitt: ${avgTime}ms`, true);
  }
}

// Level 2 – Nummern Kiste
class Level2 {
  constructor() {
    this.round = 0;
    this.maxRounds = 5;
    this.correctHits = 0;
    this.levelStart = 0;
    this.totalTimeLimitMs = 10000;
    this.targetNumber = null;
    this.container = document.getElementById('game-container');
  }

  start() {
    this.levelStart = performance.now();
    this.container.innerHTML = `
      <div id="level2-container">
        <h2>Finde die gesuchte Zahl in der Kiste!</h2>
        <p>Runde: <span id="round">1</span> / ${this.maxRounds}</p>
        <div id="target-box"></div>
        <div id="grid-3x3" class="num-grid"></div>
      </div>
    `;
    showCountdown(() => this.nextRound());
  }

  nextRound() {
    if (this.round >= this.maxRounds) {
      this.complete();
      return;
    }

    this.round++;
    document.getElementById('round').textContent = this.round;
    this.targetNumber = Math.floor(Math.random() * 9) + 1;
    document.getElementById('target-box').textContent = this.targetNumber;

    const grid = document.getElementById('grid-3x3');
    grid.innerHTML = '';
    grid.classList.remove('locked');

    const nums = [1,2,3,4,5,6,7,8,9];
    nums.sort(() => Math.random() - 0.5);

    nums.forEach(n => {
      const cell = document.createElement('div');
      cell.className = 'num-cell';
      cell.textContent = n;
      cell.addEventListener('click', () => this.handleClick(cell, n));
      grid.appendChild(cell);
    });
  }

  handleClick(cell, value) {
    const grid = document.getElementById('grid-3x3');
    if (!grid || grid.classList.contains('locked')) return;
    
    grid.classList.add('locked');

    if (value === this.targetNumber) {
      this.correctHits++;
      cell.classList.add('correct');
    } else {
      cell.classList.add('wrong');
    }

    setTimeout(() => this.nextRound(), 300);
  }

  complete() {
    const totalTime = performance.now() - this.levelStart;
    const timeOk = totalTime <= this.totalTimeLimitMs;
    const hitsOk = this.correctHits === this.maxRounds;  // ALLE 5 richtig!
    const passed = timeOk && hitsOk;

    const scoreText = `Zeit: ${Math.round(totalTime)}ms | Treffer: ${this.correctHits}/${this.maxRounds}`;
    gameManager.completeLevel(2, scoreText, passed);
    /*const passed = totalTime <= this.totalTimeLimitMs;
    gameManager.completeLevel(2, `Zeit: ${Math.round(totalTime)}ms | Treffer: ${this.correctHits}/${this.maxRounds}`, passed);*/
  }
}

// Level 3 – Simon Sequence
class Level3 {
  constructor() {
    this.container = document.getElementById('game-container');
    this.sequence = [];
    this.playerSeq = [];
    this.round = 0;
    this.locked = false;
    this.playToken = 0;
    this.maxRounds = 5;
    this.totalTimeLimitMs = 60000;
    this.levelStart = 0;
  }

  start() {
    this.levelStart = performance.now();
    this.container.innerHTML = `
      <div class="simon-wrapper">
        <h2>Merke dir die Farbreihenfolge!</h2>
        <p>Runde: <span id="round">1</span> / ${this.maxRounds}</p>
        <div id="simon-grid"></div>
        <p id="simon-status">Bereit?</p>
      </div>
    `;

    const grid = document.getElementById('simon-grid');
    const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12'];

    for (let i = 0; i < 4; i++) {
      const panel = document.createElement('div');
      panel.className = 'simon-panel';
      panel.style.background = colors[i];
      panel.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.playerClick(i);
      });
      grid.appendChild(panel);
    }

    showCountdown(() => this.nextRound());
  }

  setStatus(text) {
    const el = document.getElementById('simon-status');
    if (el) el.textContent = text;
  }

  nextRound() {
    this.round++;
    const roundEl = document.getElementById('round');
    if (roundEl) roundEl.textContent = this.round;

    this.playerSeq = [];

    const lenByRound = [3,4,5,6,7];
    const len = lenByRound[this.round - 1] ?? 5;

    this.sequence = [];
    let prev = -1;
    for (let i = 0; i < len; i++) {
      let v = Math.floor(Math.random() * 4);
      while (v === prev) v = Math.floor(Math.random() * 4);
      this.sequence.push(v);
      prev = v;
    }

    this.setStatus('Merken...');
    setTimeout(() => this.playSequence(), 350);
  }

  sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  async flashPanel(id, onMs) {
    const panel = document.querySelectorAll('.simon-panel')[id];
    panel.classList.add('flash');
    await this.sleep(onMs);
    panel.classList.remove('flash');
  }

  async playSequence() {
    this.locked = true;
    const onMs = 220;
    const offMs = 160;
    this.playToken++;
    const token = this.playToken;

    for (let i = 0; i < this.sequence.length; i++) {
      if (token !== this.playToken) return;
      await this.flashPanel(this.sequence[i], onMs);
      await this.sleep(offMs);
    }

    this.locked = false;
    this.setStatus('Deine Reihe!');
  }

  async flashPanelQuick(id) {
    const panel = document.querySelectorAll('.simon-panel')[id];
    panel.classList.add('flash');
    await this.sleep(140);
    panel.classList.remove('flash');
  }

  playerClick(id) {
    if (this.locked) return;

    this.playerSeq.push(id);
    this.flashPanelQuick(id);

    const idx = this.playerSeq.length - 1;
    if (this.playerSeq[idx] !== this.sequence[idx]) {
        this.playerSeq = [];
      this.setStatus('Fehler! Warte...');

      setTimeout(() => {
        this.setStatus('Nochmal merken...');
        this.playSequence();
      }, 3000);// 3 seconden delay 
      return;
    }

    if (this.playerSeq.length === this.sequence.length) {
      if (this.round < this.maxRounds) {
        this.setStatus('Nächste Runde...');
        setTimeout(() => this.nextRound(), 800);
      } else {
        this.setStatus('Perfekt erledigt!');
        this.complete();
      }
      return;
    }

    const rest = this.sequence.length - this.playerSeq.length;
    this.setStatus(`Noch ${rest}...`);
  }

  complete() {
   const totalTime = performance.now() - this.levelStart;
    const passed = totalTime <= this.totalTimeLimitMs;
    const scoreText = `Zeit: ${Math.round(totalTime)}ms`;
    gameManager.completeLevel(3, scoreText, passed);
  }
}

// Level 4 – Memory
class Level4 {
  constructor() {
    this.container = document.getElementById('game-container');
    this.round = 0;
    this.locked = false;
    this.first = null;
    this.second = null;
    this.matchedCount = 0;
    this.totalCards = 0;
    this.queue = Promise.resolve();
    this.maxRounds = 5;
    this.totalTimeLimitMs = 45000;
    this.levelStart = 0;
  }

  start() {
    this.levelStart = performance.now();
    this.container.innerHTML = `
      <div id="level4-container">
        <h2>Finde alle passenden Kartenpaare!</h2>
        <p>Runde: <span id="round">1</span> / ${this.maxRounds}</p>
        <div class="memory-grid"></div>
      </div>
    `;
    showCountdown(() => this.nextRound());
  }

  enqueue(fn) {
    this.queue = this.queue.then(() => fn()).catch(() => {});
  }

  nextRound() {
    this.round++;
    const roundEl = document.getElementById('round');
    if (roundEl) roundEl.textContent = this.round;

    this.locked = true;
    this.first = null;
    this.second = null;
    this.matchedCount = 0;

    const cardsByRound = [6,6,8,8,12];
    const total = cardsByRound[this.round - 1] ?? 12;
    this.totalCards = total;

    const pairs = total / 2;
    const values = [];
    for (let i = 1; i <= pairs; i++) values.push(i, i);
    for (let i = values.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [values[i], values[j]] = [values[j], values[i]];
    }

    const grid = this.container.querySelector('.memory-grid');
    grid.innerHTML = '';
    let cols = 4;
    if (total === 6) cols = 3;
    grid.style.gridTemplateColumns = `repeat(${cols}, 80px)`;

    const symbols = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    values.forEach(v => {
      const card = document.createElement('div');
      card.className = 'memory-card';
      card.dataset.value = String(v);

      const inner = document.createElement('div');
      inner.className = 'card-inner';

      const back = document.createElement('div');
      back.className = 'card-face card-back';

      const front = document.createElement('div');
      front.className = 'card-face card-front';
      front.textContent = symbols[v - 1] ?? String(v);

      inner.appendChild(back);
      inner.appendChild(front);
      card.appendChild(inner);

      card.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.enqueue(() => this.flip(card));
      });

      grid.appendChild(card);
    });

    const revealMs = [900, 800, 850, 900, 2600][this.round - 1] ?? 900;
    const cards = Array.from(grid.querySelectorAll('.memory-card'));
    
    setTimeout(() => {
      cards.forEach(c => c.classList.add('revealed'));
      setTimeout(() => {
        cards.forEach(c => c.classList.remove('revealed'));
        this.locked = false;
      }, revealMs);
    }, 220);
  }

  async flip(card) {
    if (this.locked || card.classList.contains('matched') || card.classList.contains('revealed')) return;

    card.classList.add('revealed');

    if (!this.first) {
      this.first = card;
      return;
    }

    this.second = card;
    this.locked = true;

    const a = this.first.dataset.value;
    const b = this.second.dataset.value;

    if (a === b) {
      this.first.classList.add('matched');
      this.second.classList.add('matched');
      this.matchedCount += 2;
      this.resetPick();

      if (this.matchedCount === this.totalCards) {
        if (this.round < this.maxRounds) {
          setTimeout(() => this.nextRound(), 380);
        } else {
          this.complete();
        }
      } else {
        this.locked = false;
      }
      return;
    }

    setTimeout(() => {
      this.first.classList.remove('revealed');
      this.second.classList.remove('revealed');
      this.resetPick();
    }, 430);
  }

  resetPick() {
    this.first = null;
    this.second = null;
    this.locked = false;
  }

  complete() {
    const totalTime = performance.now() - this.levelStart;
    const passed = totalTime <= this.totalTimeLimitMs;
    const scoreText = `Zeit: ${Math.round(totalTime)}ms`;
    gameManager.completeLevel(4, scoreText, passed);
  }
}
