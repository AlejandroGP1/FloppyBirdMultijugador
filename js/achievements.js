export class AchievementManager {
    constructor(gameManager) {
        this.gm = gameManager;
        this.highScore = parseInt(localStorage.getItem('palomo_highscore')) || 0;
        
        this.milestones = [
            { pts: 100, icon: '🌼', name: 'Margarita', phrase: 'Eres tan fresca y natural como una flor de campo 🌸', color: '#ffffff' },
            { pts: 200, icon: '🌷', name: 'Tulipán', phrase: 'Mi amor por ti florece con cada segundo que pasa 💕', color: '#ff69b4' },
            { pts: 300, icon: '🌹', name: 'Rosa', phrase: 'Nuestra pasión es tan eterna como el aroma de una rosa 🌹', color: '#ff0000' },
            { pts: 400, icon: '🌻', name: 'Girasol', phrase: 'Tú eres el sol que ilumina todos mis días ☀️', color: '#ffd700' },
            { pts: 500, icon: '🌺', name: 'Orquídea', phrase: 'Eres la persona más única y especial del mundo entero 🌈', color: '#da70d6' },
            { pts: 609, icon: '🪷', name: 'Loto Eterno', phrase: 'Tu paz es mi hogar, te amo por siempre y para siempre 🕊️💜', color: '#ffb6c1' }
        ];

        this.toastedMilestones = new Set();
        this.init();
    }

    init() {
        this.grid = document.getElementById('achievements-grid');
        this.detailScreen = document.getElementById('achievement-detail-screen');
        this.canvas = document.getElementById('flower-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.phraseEl = document.getElementById('flower-phrase');
        this.toastEl = document.getElementById('achievement-toast');
        this.hScoreVal = document.getElementById('high-score-val');

        document.getElementById('achievements-btn').onclick = () => this.showGrid();
        document.getElementById('achievements-over-btn').onclick = () => this.showGrid();
        document.getElementById('back-to-menu').onclick = () => this.gm.showScreen('start-screen');
        document.getElementById('back-to-achievements').onclick = () => this.showGrid();
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
        this.toastEl.innerHTML = `<span>${m.icon}</span> ¡Has desbloqueado: ${m.name}! 🌸`;
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
            node.innerHTML = `<span>${isUnlocked ? m.icon : '🔒'}</span><label>${m.pts} pts</label>`;
            if (isUnlocked) node.onclick = () => this.showDetail(m);
            this.grid.appendChild(node);
        });
    }

    showDetail(m) {
        this.gm.showScreen('achievement-detail-screen');
        this.phraseEl.innerText = m.phrase;
        this.phraseEl.classList.remove('show');
        this.drawFlower(m);
    }

    drawFlower(m) {
        const ctx = this.ctx;
        const pts = m.pts;
        const color = m.color;
        let progress = 0;
        const startTime = performance.now();
        const duration = 2000; // 2 segundos

        const animate = (time) => {
            progress = (time - startTime) / duration;
            if (progress > 1) progress = 1;

            ctx.clearRect(0, 0, 400, 400);
            ctx.save();
            ctx.translate(200, 200);

            // Dibujar tallo
            ctx.beginPath();
            ctx.strokeStyle = '#2d5a27';
            ctx.lineWidth = 10;
            ctx.moveTo(0, 50);
            ctx.lineTo(0, 50 + 150 * progress);
            ctx.stroke();

            // Dibujar pétalos según progreso
            this.renderFlowerGeometry(ctx, pts, color, progress);

            ctx.restore();

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.phraseEl.classList.add('show');
            }
        };
        requestAnimationFrame(animate);
    }

    renderFlowerGeometry(ctx, pts, color, progress) {
        const petals = (pts === 609) ? 12 : 8;
        
        ctx.save();
        // Sutil giro para vida
        ctx.rotate(progress * 0.2);

        for (let i = 0; i < petals; i++) {
            const angle = (i / petals) * Math.PI * 2;
            const petalProgress = Math.max(0, Math.min(1, progress * 1.5 - (i / petals)));
            
            if (petalProgress <= 0) continue;

            ctx.save();
            ctx.rotate(angle);
            
            ctx.beginPath();
            ctx.fillStyle = color;
            ctx.strokeStyle = 'rgba(0,0,0,0.2)';
            ctx.lineWidth = 2;

            if (pts === 100) { // Margarita: Ovalos
                ctx.ellipse(0, -40 * petalProgress, 15 * petalProgress, 35 * petalProgress, 0, 0, Math.PI * 2);
            } else if (pts === 200) { // Tulipán: Copa
                ctx.moveTo(-20 * petalProgress, 0);
                ctx.quadraticCurveTo(0, -60 * petalProgress, 20 * petalProgress, 0);
                ctx.lineTo(0, -20 * petalProgress);
                ctx.closePath();
            } else if (pts === 300) { // Rosa: Corazón
                ctx.moveTo(0, 0);
                ctx.bezierCurveTo(-40 * petalProgress, -40 * petalProgress, -10 * petalProgress, -70 * petalProgress, 0, -30 * petalProgress);
                ctx.bezierCurveTo(10 * petalProgress, -70 * petalProgress, 40 * petalProgress, -40 * petalProgress, 0, 0);
            } else if (pts === 400) { // Girasol: Triángulos
                ctx.moveTo(0, 0);
                ctx.lineTo(-10 * petalProgress, -60 * petalProgress);
                ctx.lineTo(0, -75 * petalProgress);
                ctx.lineTo(10 * petalProgress, -60 * petalProgress);
                ctx.closePath();
            } else if (pts === 500) { // Orquídea: Pétalos complejos
                ctx.ellipse(0, -30 * petalProgress, 25 * petalProgress, 45 * petalProgress, 0, 0, Math.PI * 2);
            } else if (pts === 609) { // Loto: Capas
                ctx.moveTo(0, 0);
                ctx.quadraticCurveTo(-30 * petalProgress, -50 * petalProgress, 0, -80 * petalProgress);
                ctx.quadraticCurveTo(30 * petalProgress, -50 * petalProgress, 0, 0);
            }

            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }

        // Centro de la flor
        if (progress > 0.5) {
            const centerProgress = (progress - 0.5) * 2;
            ctx.beginPath();
            ctx.fillStyle = (pts === 400) ? '#4B2C20' : (pts === 100 ? '#ffd700' : 'white');
            ctx.arc(0, 0, 15 * centerProgress, 0, Math.PI * 2);
            ctx.fill();
            
            if (pts === 609 && progress === 1) {
                ctx.font = '40px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('🕊️', 0, 0);
            }
        }

        ctx.restore();
    }
}
