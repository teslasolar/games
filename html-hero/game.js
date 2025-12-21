// HTML Hero - Main game logic
const Game = {
    currentChallenge: 0,
    xp: 0,
    level: 1,
    streak: 0,
    xpPerLevel: 100,

    init() {
        Editor.init();
        Preview.init();

        document.getElementById('run-btn').onclick = () => this.runCode();
        document.getElementById('check-btn').onclick = () => this.checkSolution();
        document.getElementById('hint-btn').onclick = () => this.showHint();
        document.getElementById('skip-btn').onclick = () => this.skipChallenge();

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') this.runCode();
            if (e.ctrlKey && e.key === 's') { e.preventDefault(); this.checkSolution(); }
        });

        this.loadChallenge(0);
    },

    loadChallenge(index) {
        if (index >= CHALLENGES.length) {
            this.showVictory();
            return;
        }

        this.currentChallenge = index;
        const challenge = CHALLENGES[index];

        document.getElementById('challenge-num').textContent = `Challenge ${index + 1}`;
        document.getElementById('challenge-title').textContent = challenge.title;
        document.getElementById('challenge-desc').innerHTML = challenge.desc;
        document.getElementById('challenge-hint').innerHTML = challenge.hint;
        document.getElementById('challenge-hint').classList.remove('visible');

        const diffEl = document.getElementById('challenge-diff');
        diffEl.textContent = challenge.difficulty;
        diffEl.className = 'challenge-diff ' + challenge.difficulty.toLowerCase();

        Editor.setValue(challenge.starter);
        Preview.clear();
        Editor.focus();
    },

    runCode() {
        const code = Editor.getValue();
        Preview.render(code);
        this.showToast('Code executed!', 'info');
    },

    checkSolution() {
        const code = Editor.getValue();
        Preview.render(code);

        // Wait for iframe to load
        setTimeout(() => {
            const challenge = CHALLENGES[this.currentChallenge];
            const doc = Preview.getDocument();

            if (!doc) {
                this.showToast('Could not check solution', 'error');
                return;
            }

            try {
                if (challenge.check(doc)) {
                    this.solveChallenge(challenge);
                } else {
                    this.streak = 0;
                    this.updateStats();
                    this.showToast('Not quite right... Keep trying!', 'error');
                }
            } catch (e) {
                this.showToast('Error in your code!', 'error');
            }
        }, 100);
    },

    solveChallenge(challenge) {
        this.streak++;
        const bonusXP = Math.floor(challenge.xp * (1 + this.streak * 0.1));
        this.addXP(bonusXP);

        this.showModal(
            `🎉 Challenge Complete!`,
            `You solved "${challenge.title}" perfectly!`,
            `+${bonusXP} XP` + (this.streak > 1 ? ` (${this.streak}x streak!)` : ''),
            () => {
                this.hideModal();
                this.loadChallenge(this.currentChallenge + 1);
            }
        );

        this.spawnConfetti();
    },

    addXP(amount) {
        this.xp += amount;

        while (this.xp >= this.xpPerLevel) {
            this.xp -= this.xpPerLevel;
            this.level++;
            this.showLevelUp();
        }

        this.updateStats();
    },

    updateStats() {
        document.getElementById('level').textContent = this.level;
        document.getElementById('xp-fill').style.width = (this.xp / this.xpPerLevel * 100) + '%';
        document.getElementById('streak').textContent = this.streak + '🔥';
    },

    showHint() {
        const hint = document.getElementById('challenge-hint');
        hint.classList.toggle('visible');
        this.showToast('Hint revealed!', 'info');
    },

    skipChallenge() {
        this.streak = 0;
        this.updateStats();
        this.loadChallenge(this.currentChallenge + 1);
        this.showToast('Challenge skipped', 'info');
    },

    showToast(message, type = '') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = 'toast visible ' + type;

        setTimeout(() => toast.classList.remove('visible'), 2000);
    },

    showModal(title, message, xpText, onClose) {
        const modal = document.getElementById('modal');
        const content = document.getElementById('modal-content');

        content.innerHTML = `
            <h2>${title}</h2>
            <p>${message}</p>
            <div class="xp-gain">${xpText}</div>
            <button>Continue</button>
        `;

        content.querySelector('button').onclick = onClose;
        modal.classList.add('visible');
    },

    hideModal() {
        document.getElementById('modal').classList.remove('visible');
    },

    showLevelUp() {
        const el = document.createElement('div');
        el.className = 'level-up';
        el.textContent = `⚡ LEVEL ${this.level}! ⚡`;
        document.body.appendChild(el);

        setTimeout(() => el.remove(), 1500);
    },

    showVictory() {
        this.showModal(
            '🏆 YOU ARE AN HTML HERO! 🏆',
            'You completed all challenges! You now have the power to build anything with HTML!',
            `Final Level: ${this.level}`,
            () => {
                this.hideModal();
                this.currentChallenge = 0;
                this.loadChallenge(0);
            }
        );
    },

    spawnConfetti() {
        const colors = ['#ff6b6b', '#feca57', '#4ade80', '#60a5fa', '#a78bfa'];

        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * 100 + 'vw';
                confetti.style.top = '-10px';
                confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
                document.body.appendChild(confetti);

                setTimeout(() => confetti.remove(), 3000);
            }, i * 30);
        }
    }
};

// Start the game
Game.init();
