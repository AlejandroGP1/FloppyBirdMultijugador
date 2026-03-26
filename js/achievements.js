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
        this.flowerContainer = document.getElementById('flower-container');
        this.phraseEl = document.getElementById('flower-phrase');
        this.toastEl = document.getElementById('achievement-toast');
        this.hScoreVal = document.getElementById('high-score-val');

        // Eventos de botones
        document.getElementById('achievements-btn').onclick = () => this.showGrid();
        document.getElementById('achievements-over-btn').onclick = () => this.showGrid();
        document.getElementById('back-to-menu').onclick = () => this.gm.showScreen('start');
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
        this.gm.showScreen('achievements');
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
                node.onclick = () => this.showDetail(m);
            }
            this.grid.appendChild(node);
        });
    }

    showDetail(m) {
        this.gm.showScreen('detail');
        this.flowerContainer.innerHTML = ''; // Limpiar anterior
        this.phraseEl.innerText = m.phrase;
        this.phraseEl.classList.remove('show');

        // Dibujar flor paso a paso en 2D/3D simulado
        this.drawFlower(m);

        setTimeout(() => {
            if (this.detailScreen.classList.contains('active')) {
                this.phraseEl.classList.add('show');
            }
        }, 3000);
    }

    drawFlower(m) {
        const center = document.createElement('div');
        center.style.width = '30px';
        center.style.height = '30px';
        center.style.borderRadius = '50%';
        center.style.background = m.color === '#ffffff' ? '#ffd700' : 'white';
        center.style.position = 'absolute';
        center.style.zIndex = '10';
        center.style.boxShadow = `0 0 20px ${m.color}`;
        center.classList.add('petal');
        this.flowerContainer.appendChild(center);
        setTimeout(() => center.classList.add('show'), 100);

        const petalsCount = m.pts === 609 ? 12 : 8;
        for (let i = 0; i < petalsCount; i++) {
            setTimeout(() => {
                const petal = document.createElement('div');
                petal.className = 'petal';
                petal.style.width = m.pts === 609 ? '35px' : '30px';
                petal.style.height = '70px';
                petal.style.background = m.color;
                petal.style.borderRadius = '20px 20px 0 0';
                petal.style.position = 'absolute';
                petal.style.bottom = '50%';
                petal.style.left = 'calc(50% - 15px)';
                petal.style.transformOrigin = 'bottom center';
                petal.style.transform = `rotate(${i * (360 / petalsCount)}deg)`;
                petal.style.opacity = '0';
                petal.style.border = '1px solid rgba(0,0,0,0.1)';
                
                this.flowerContainer.appendChild(petal);
                // Forzar animación
                setTimeout(() => petal.classList.add('show'), 50);
            }, i * 300); // 300ms entre pétalos
        }

        // Caso especial Loto 609: Paloma en el centro
        if (m.pts === 609) {
            setTimeout(() => {
                const pigeon = document.createElement('div');
                pigeon.innerText = '🕊️';
                pigeon.style.fontSize = '2.5rem';
                pigeon.style.position = 'absolute';
                pigeon.style.zIndex = '20';
                pigeon.style.opacity = '0';
                pigeon.style.transition = 'all 1s ease';
                this.flowerContainer.appendChild(pigeon);
                setTimeout(() => pigeon.style.opacity = '1', 100);
            }, 4000);
        }
    }
}
