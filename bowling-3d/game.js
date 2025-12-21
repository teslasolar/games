// Bowling 3D - Main game logic
const Game = {
    frame: 1,
    ballNum: 1,
    frames: [],
    canBowl: true,
    pinsDownThisFrame: 0,

    init() {
        Scene.init();
        Pins.init();
        Ball.init();

        this.resetGame();
        this.animate();
    },

    resetGame() {
        this.frame = 1;
        this.ballNum = 1;
        this.frames = [];
        this.canBowl = true;
        this.pinsDownThisFrame = 0;

        for (let i = 0; i < 10; i++) {
            this.frames.push({ rolls: [], score: null });
        }

        Pins.resetAll();
        Ball.reset();
        Scene.resetCamera();
        this.updateUI();

        document.getElementById('game-over').classList.remove('visible');
        document.getElementById('hint').classList.remove('hidden');
    },

    restart() {
        this.resetGame();
    },

    onBallThrown() {
        this.canBowl = false;
    },

    onBallStopped() {
        const standing = Pins.countStanding();
        const knocked = 10 - standing - this.pinsDownThisFrame;

        const currentFrame = this.frames[this.frame - 1];
        currentFrame.rolls.push(knocked);
        this.pinsDownThisFrame += knocked;

        // Check for strike/spare
        if (this.ballNum === 1 && standing === 0) {
            this.showResult('STRIKE!', 'strike');
            this.nextFrame();
        } else if (this.ballNum === 2 && standing === 0) {
            this.showResult('SPARE!', 'spare');
            this.nextFrame();
        } else if (this.ballNum === 2) {
            this.showResult(knocked > 0 ? `+${knocked}` : 'GUTTER');
            this.nextFrame();
        } else {
            // First ball, pins remaining
            if (knocked === 0) {
                this.showResult('GUTTER');
            } else {
                this.showResult(`+${knocked}`);
            }
            this.ballNum = 2;
            Pins.reset(true); // Keep fallen pins removed
            Ball.reset();
            this.canBowl = true;
        }

        this.calculateScores();
        this.updateUI();
    },

    nextFrame() {
        if (this.frame >= 10) {
            this.endGame();
            return;
        }

        this.frame++;
        this.ballNum = 1;
        this.pinsDownThisFrame = 0;

        setTimeout(() => {
            Pins.resetAll();
            Ball.reset();
            this.canBowl = true;
            this.updateUI();
        }, 1500);
    },

    calculateScores() {
        let total = 0;

        for (let i = 0; i < 10; i++) {
            const frame = this.frames[i];
            if (frame.rolls.length === 0) continue;

            const r1 = frame.rolls[0] || 0;
            const r2 = frame.rolls[1] || 0;

            if (r1 === 10) {
                // Strike
                const bonus = this.getNextRolls(i, 2);
                if (bonus !== null) {
                    total += 10 + bonus;
                    frame.score = total;
                }
            } else if (r1 + r2 === 10) {
                // Spare
                const bonus = this.getNextRolls(i, 1);
                if (bonus !== null) {
                    total += 10 + bonus;
                    frame.score = total;
                }
            } else if (frame.rolls.length >= 2) {
                // Open frame
                total += r1 + r2;
                frame.score = total;
            }
        }
    },

    getNextRolls(frameIndex, count) {
        let rolls = [];
        let fi = frameIndex + 1;
        let ri = 0;

        while (rolls.length < count && fi < 10) {
            const frame = this.frames[fi];
            if (!frame.rolls[ri]) return null;

            rolls.push(frame.rolls[ri]);
            ri++;

            if (ri >= frame.rolls.length || frame.rolls[0] === 10) {
                fi++;
                ri = 0;
            }
        }

        if (rolls.length < count) return null;
        return rolls.reduce((a, b) => a + b, 0);
    },

    showResult(text, type = '') {
        const popup = document.getElementById('popup');
        const resultText = document.getElementById('result-text');

        resultText.textContent = text;
        resultText.className = 'result-text ' + type;
        popup.classList.add('visible');

        setTimeout(() => popup.classList.remove('visible'), 1200);
    },

    updateUI() {
        document.getElementById('frame').textContent = this.frame;
        document.getElementById('ball-num').textContent = this.ballNum;

        // Update scoreboard
        let html = '';
        for (let i = 0; i < 10; i++) {
            const frame = this.frames[i];
            const isActive = i === this.frame - 1;
            const r1 = frame.rolls[0];
            const r2 = frame.rolls[1];

            let roll1 = r1 !== undefined ? (r1 === 10 ? 'X' : r1 === 0 ? '-' : r1) : '';
            let roll2 = '';

            if (r2 !== undefined) {
                if (r1 + r2 === 10) roll2 = '/';
                else if (r2 === 0) roll2 = '-';
                else roll2 = r2;
            }

            html += `
                <div class="frame-box ${isActive ? 'active' : ''}">
                    <div class="frame-num">${i + 1}</div>
                    <div class="frame-rolls">
                        <span>${roll1}</span>
                        <span>${roll2}</span>
                    </div>
                    <div class="frame-score">${frame.score || ''}</div>
                </div>
            `;
        }
        document.getElementById('scoreboard').innerHTML = html;
    },

    endGame() {
        const finalScore = this.frames[9].score || 0;
        document.getElementById('final-score').textContent = finalScore;
        document.getElementById('game-over').classList.add('visible');
        this.canBowl = false;
    },

    animate() {
        requestAnimationFrame(() => this.animate());

        const delta = 1 / 60;

        Ball.update(delta);
        Pins.update(delta);
        Scene.render();
    }
};

// Start game
Game.init();
