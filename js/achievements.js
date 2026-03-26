export class AchievementManager {
    constructor(gameManager) {
        this.gm = gameManager;
        this.highScore = parseInt(localStorage.getItem('palomo_highscore')) || 0;
        
        this.milestones = [
            { pts: 100, icon: '🌼', name: 'Margarita', file: 'margarita.html' },
            { pts: 200, icon: '🌷', name: 'Tulipán', file: 'tulipan.html' },
            { pts: 300, icon: '🌹', name: 'Rosa', file: 'rosa.html' },
            { pts: 400, icon: '🌻', name: 'Girasol', file: 'girasol.html' },
            { pts: 500, icon: '🌺', name: 'Orquídea', file: 'orquidea.html' },
            { pts: 609, icon: '🪷', name: 'Loto Eterno', file: 'loto.html' }
        ];

        this.toastedMilestones = new Set();
        this.init();
    }

    init() {
        this.grid = document.getElementById('achievements-grid');
        this.toastEl = document.getElementById('achievement-toast');
        this.hScoreVal = document.getElementById('high-score-val');

        // Eventos de botones
        const achBtn = document.getElementById('achievements-btn');
        if (achBtn) achBtn.onclick = () => this.showGrid();
        
        const achOverBtn = document.getElementById('achievements-over-btn');
        if (achOverBtn) achOverBtn.onclick = () => this.showGrid();

        const backBtn = document.getElementById('back-to-menu');
        if (backBtn) backBtn.onclick = () => this.gm.showScreen('start-screen');
    }

    checkUnlock(score) {
        this.milestones.forEach(m => {
            if (score >= m.pts && !this.toastedMilestones.has(m.pts) && score > this.highScore) {
                this.toastedMilestones.add(m.pts);
                this.showToast(m);
            }
        });
    }

    showToast(m) {
        if (!this.toastEl) return;
        this.toastEl.innerHTML = `<span>${m.icon}</span> ¡Logro desbloqueado: ${m.name}! 🌸`;
        this.toastEl.classList.add('show');
        setTimeout(() => this.toastEl.classList.remove('show'), 4000);
    }

    updateHighScore(score) {
        if (score > this.highScore) {
            this.highScore = score;
            localStorage.setItem('palomo_highscore', this.highScore);
        }
        if (this.hScoreVal) this.hScoreVal.innerText = this.highScore;
    }

    resetToasts() {
        this.toastedMilestones.clear();
    }

    showGrid() {
        this.gm.showScreen('achievements-screen');
        this.grid.innerHTML = '';
        
        this.milestones.forEach(m => {
            const isUnlocked = this.highScore >= m.pts;
            const node = document.createElement('div');
            node.className = `achievement-node ${isUnlocked ? 'unlocked' : 'locked'}`;
            node.innerHTML = `
                <span>${isUnlocked ? m.icon : '🔒'}</span>
                <label>${m.pts} pts</label>
            `;
            
            if (isUnlocked) {
                node.onclick = () => {
                    window.open(`flores/${m.file}`, '_blank');
                };
            }
            this.grid.appendChild(node);
        });
    }
}
