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
                node.onclick = () => this.showDetail(m);
            }
            this.grid.appendChild(node);
        });
    }

    showDetail(m) {
        this.gm.showScreen('achievement-detail-screen');
        this.flowerContainer.innerHTML = this.getFlowerSVG(m);
        this.phraseEl.innerText = m.phrase;
        this.phraseEl.classList.remove('show');
        
        setTimeout(() => {
            this.phraseEl.classList.add('show');
        }, 3500); // Aparece casi al final del dibujo
    }

    getFlowerSVG(m) {
        let paths = '';
        const color = m.color;

        if (m.pts === 100) { // Margarita
            paths = `<circle cx="50" cy="50" r="8" fill="#ffd700" class="drawing-path" stroke="#ffd700" />`;
            for(let i=0; i<8; i++) {
                paths += `<ellipse cx="50" cy="25" rx="5" ry="15" fill="none" stroke="white" class="drawing-path" transform="rotate(${i * 45} 50 50)" />`;
            }
        } else if (m.pts === 200) { // Tulipán
            paths = `<path d="M35 50 Q50 90 65 50 Q70 30 50 20 Q30 30 35 50" stroke="${color}" class="drawing-path" />
                     <path d="M42 45 Q50 65 58 45" stroke="${color}" class="drawing-path" />`;
        } else if (m.pts === 300) { // Rosa
            paths = `<path d="M50 50 M50 20 C20 20 20 80 50 80 C80 80 80 20 50 20" stroke="${color}" class="drawing-path" />
                     <path d="M50 35 C35 35 35 65 50 65 C65 65 65 35 50 35" stroke="${color}" class="drawing-path" />
                     <path d="M50 45 C45 45 45 55 50 55 C55 55 55 45 50 45" stroke="${color}" class="drawing-path" />`;
        } else if (m.pts === 400) { // Girasol
            paths = `<circle cx="50" cy="50" r="15" fill="#4B2C20" class="drawing-path" stroke="#4B2C20" />`;
            for(let i=0; i<16; i++) {
                paths += `<path d="M50 35 L55 20 L50 15 L45 20 Z" fill="none" stroke="#ffd700" class="drawing-path" transform="rotate(${i * 22.5} 50 50)" />`;
            }
        } else if (m.pts === 500) { // Orquídea
            paths = `<path d="M50 50 L30 20 Q50 10 70 20 Z" stroke="${color}" class="drawing-path" />
                     <path d="M50 50 L20 60 Q50 80 80 60 Z" stroke="${color}" class="drawing-path" />
                     <path d="M50 50 L50 80" stroke="${color}" class="drawing-path" />`;
        } else if (m.pts === 609) { // Loto con Paloma
            for(let i=0; i<10; i++) {
                paths += `<path d="M50 50 Q30 20 50 10 Q70 20 50 50" stroke="${color}" class="drawing-path" transform="rotate(${i * 36} 50 50)" />`;
                paths += `<path d="M50 55 Q20 35 50 25 Q80 35 50 55" stroke="${color}" class="drawing-path" transform="rotate(${i * 36 + 18} 50 50)" />`;
            }
            // La paloma aparece al final (estática pero en el centro)
            paths += `<text x="50" y="58" font-size="20" text-anchor="middle" style="opacity:0; animation: fadeIn 1s forwards 4s;">🕊️</text>`;
            paths += `<style>@keyframes fadeIn { to { opacity: 1; } }</style>`;
        }

        return `<svg viewBox="0 0 100 100">${paths}</svg>`;
    }
}
