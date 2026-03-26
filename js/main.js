import { CONFIG } from './config.js';
import { Utils } from './utils.js';
import { ParticleSystem } from './particles.js';
import { Pigeon, Entity, Star } from './entities.js';

class GameManager {
    constructor() {
        this.screens = {
            start: document.getElementById('start-screen'),
            game: document.getElementById('game-screen'),
            over: document.getElementById('game-over-screen')
        };
        this.ui = {
            score: document.getElementById('score-val'),
            finalScoreVal: document.getElementById('final-score-val'),
            gameArea: document.getElementById('game-area')
        };
        this.pigeon = new Pigeon(document.getElementById('pigeon'));
        
        this.entities = [];
        this.score = 0;
        this.isGameOver = true;
        this.lastTime = 0;
        this.gameLoop = null;

        this.storm = {
            active: false,
            trigger: 30,
            count: 0,
            overlay: document.getElementById('storm-overlay') || this.createStormOverlay()
        };

        this.initEvents();
        this.startBgHearts();
        this.startMenuDecorations();
    }

    // Crea emojis flotantes decorativos en los menús para que se vean más "guay"
    startMenuDecorations() {
        const emojis = ['✨', '🌸', '💖', '🕊️', '☁️', '🦋', '🎈'];

        setInterval(() => {
            // Buscamos pantallas activas (Start o Game Over)
            const activeScreen = document.querySelector('.screen.active');
            if (activeScreen && (activeScreen.id === 'start-screen' || activeScreen.id === 'game-over-screen')) {
                this.spawnMenuEmoji(activeScreen, emojis);
            }
        }, 1200);
    }

    spawnMenuEmoji(container, emojis) {
        const span = document.createElement('span');
        span.innerText = Utils.pick(emojis);
        span.style.position = 'absolute';
        span.style.left = `${Utils.random(10, 90)}%`;
        span.style.top = `${Utils.random(20, 80)}%`;
        span.style.fontSize = `${Utils.random(1.5, 3)}rem`;
        span.style.opacity = '0';
        span.style.transition = 'all 2.5s ease-out';
        span.style.pointerEvents = 'none';
        span.style.zIndex = '5';

        container.appendChild(span);

        // Animación suave de aparición y desvanecimiento con movimiento
        setTimeout(() => {
            span.style.opacity = '0.7';
            span.style.transform = `translateY(-50px) rotate(${Utils.random(-30, 30)}deg) scale(1.2)`;
        }, 50);

        setTimeout(() => {
            span.style.opacity = '0';
            span.style.transform = `translateY(-100px) rotate(${Utils.random(-60, 60)}deg) scale(0.8)`;
        }, 1800);

        setTimeout(() => span.remove(), 2600);
    }

    createStormOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'storm-overlay';
        document.body.appendChild(overlay);
        return overlay;
    }

    initEvents() {
        document.getElementById('start-btn').onclick = () => this.start();
        document.getElementById('restart-btn').onclick = () => this.start();

        const handleAction = (e) => {
            if (e.type === 'touchstart') e.preventDefault();
            if (!this.isGameOver) this.pigeon.flap();
        };

        document.getElementById('flap-btn').addEventListener('touchstart', handleAction, { passive: false });
        document.getElementById('flap-btn').addEventListener('mousedown', handleAction);
        this.ui.gameArea.addEventListener('touchstart', handleAction, { passive: false });
        this.ui.gameArea.addEventListener('mousedown', handleAction);

        document.addEventListener('keydown', (e) => {
            if ((e.code === 'Space' || e.code === 'ArrowUp') && !this.isGameOver) {
                if (e.target === document.body) e.preventDefault();
                this.pigeon.flap();
            }
        });
    }

    startBgHearts() {
        setInterval(() => {
            const heart = document.createElement('div');
            heart.className = 'bg-heart';
            heart.innerText = Utils.pick(CONFIG.heartsSymbols);
            heart.style.left = `${Utils.random(0, 100)}%`;
            heart.style.animationDuration = `${Utils.random(4, 7)}s`;
            document.getElementById('bg-hearts').appendChild(heart);
            setTimeout(() => heart.remove(), 7000);
        }, 500);
    }

    // Se ejecuta al iniciar el juego
    start() {
        this.isGameOver = false;
        this.score = 0;
        this.updateScore();
        this.pigeon.reset();
        this.entities.forEach(en => en.remove());
        this.entities = [];
        this.lastTime = performance.now();
        this.storm.active = false;
        this.storm.trigger = 30; // Puntos para activar la primera tormenta
        this.storm.overlay.classList.remove('active');

        this.screens.start.classList.remove('active');
        this.screens.over.classList.remove('active');
        this.screens.game.classList.add('active');

        if (this.gameLoop) cancelAnimationFrame(this.gameLoop);
        this.gameLoop = requestAnimationFrame((t) => this.update(t));

        this.startSpawners();
    }

    // Calcula cuánto debe aumentar la velocidad según la puntuación
    getSpeedMultiplier() {
        // Aumenta la velocidad un 2% cada 20 puntos logrados (Progreso más lento y justo)
        return 1.0 + Math.floor(this.score / 20) * 0.02;
    }

    // Inicia los generadores de obstáculos y tiempo
    startSpawners() {
        if (this.obstacleTimer) clearInterval(this.obstacleTimer);
        // Genera un nuevo obstáculo cada 1.8 segundos
        this.obstacleTimer = setInterval(() => this.spawnManager(), 1800);

        if (this.scoreTimer) clearInterval(this.scoreTimer);
        // Suma 1 punto cada segundo
        this.scoreTimer = setInterval(() => {
            if (!this.isGameOver) {
                this.score++;
                this.updateScore();
            }
        }, 1000);

        // Removed background cloud spawner as requested
        // Removed parallax stars for mobile performance

        // Generador de chispas ambientales para dar vida al fondo
        setInterval(() => {
            if (!this.isGameOver) this.spawnAmbientSparkle();
        }, 400);
    }

    // Gestiona la aparición de obstáculos y eventos (como la tormenta)
    spawnManager() {
        if (this.isGameOver) return;

        // Activa la tormenta si alcanzamos el puntaje necesario
        if (this.score >= this.storm.trigger && !this.storm.active) {
            this.activateStorm();
        }

        // Si la tormenta está activa, gestionamos su fin y dificultad extra
        if (this.storm.active) {
            this.storm.count++;
            if (this.storm.count >= CONFIG.maxStormObstacles) {
                this.deactivateStorm();
                return;
            }
            // 30% de probabilidad de generar obstáculos adicionales durante la tormenta
            if (Math.random() < 0.3) this.spawnObstacle();
        }

        this.spawnObstacle();
    }

    // Elige y crea un obstáculo o ítem al azar
    spawnObstacle() {
        const r = Math.random();

        if (r < 0.05) {
            // 🌸 Flor de loto: otorga invulnerabilidad
            const lotus = new Entity(this.ui.gameArea, 'lotus-pickup', '🪷');
            lotus.y = Utils.random(20, 80);
            lotus.speed = 1.4 * this.getSpeedMultiplier();
            lotus.hitboxScale = 1.5; // Hitbox 50% más grande
            lotus.el.style.top = `${lotus.y}%`;
            this.entities.push(lotus);
        } else if (r < 0.15) {
            // ☄️ Ráfaga de meteoritos
            this.spawnMeteorites();
        } else if (r < 0.35) {
            // 💖 Corazón normal: +5 puntos
            const heart = new Entity(this.ui.gameArea, 'heart-pickup', '💖');
            heart.y = Utils.random(15, 85);
            heart.speed = (this.storm.active ? 1.6 : 1.2) * this.getSpeedMultiplier();
            heart.hitboxScale = 1.5; // Hitbox 50% más grande
            heart.el.style.top = `${heart.y}%`;
            this.entities.push(heart);
        } else if (r < 0.45) {
            // 🪐 Planetas gigantes decorativos
            const planet = new Entity(this.ui.gameArea, 'planet', Utils.pick(CONFIG.planets));
            planet.y = Utils.random(10, 90);
            planet.speed = 1.0 * this.getSpeedMultiplier();
            planet.hitboxScale = 0.65; // Hitbox 35% más pequeña
            planet.el.style.fontSize = `${Utils.random(12, 30)}rem`;
            planet.el.style.top = `${planet.y}%`;
            this.entities.push(planet);
        } else {
            // 🧱 Pilares / Obstáculos normales
            const isTop = Math.random() > 0.5;
            const obs = new Entity(this.ui.gameArea, `obstacle ${isTop ? 'top' : ''}`);
            obs.el.style.height = `${Utils.random(15, 45)}%`;
            obs.speed = (this.storm.active ? 1.8 : 1.2) * this.getSpeedMultiplier();
            // Efecto de inclinación aleatoria
            if (Math.random() < 0.4) obs.el.style.transform = `skewX(${Utils.random(-20, 20)}deg)`;
            this.entities.push(obs);
        }
    }

    // Genera 3 meteoritos que caen en abanico
    spawnMeteorites() {
        const startY = Utils.random(10, 40); // Aparecen desde arriba-izquierda
        const speedsY = [0, 0.8, 1.6];       // Diferentes ángulos de caída

        for (let i = 0; i < 3; i++) {
            const met = new Entity(this.ui.gameArea, 'projectile', '☄️');
            met.y = startY;
            met.x = 105 + (i * 5); // Escalonados horizontalmente
            met.speed = 1.8 * this.getSpeedMultiplier();
            met.speedY = speedsY[i] * this.getSpeedMultiplier();
            met.el.style.top = `${met.y}%`;
            this.entities.push(met);
        }
    }

    // Activa el modo tormenta (lluvia, rayos y más dificultad)
    activateStorm() {
        this.storm.active = true;
        this.storm.count = 0;
        this.storm.overlay.classList.add('active');
        this.screens.game.classList.add('storm-active'); // Fuerza la noche y pausa el ciclo
        ParticleSystem.createPhrase(window.innerWidth / 2, window.innerHeight * 0.3, "¡TORMENTA MÁGICA!");

        // Aumentamos la frecuencia de aparición durante la tormenta
        clearInterval(this.obstacleTimer);
        this.obstacleTimer = setInterval(() => this.spawnManager(), CONFIG.stormObstacleInterval);
    }

    // Finaliza la tormenta y suelta el premio gordo
    deactivateStorm() {
        this.storm.active = false;
        this.storm.overlay.classList.remove('active');
        this.screens.game.classList.remove('storm-active'); // Reanuda el ciclo normal
        this.storm.trigger += 80; // Siguiente tormenta en +80 puntos

        // 💗 Corazón Gigante: +30 puntos
        const giant = new Entity(this.ui.gameArea, 'giant-heart', '💗');
        giant.y = 50;
        giant.speed = 0.5; // Muy lento para que sea fácil atraparlo
        giant.hitboxScale = 1.5; // Hitbox 50% más grande
        giant.el.style.top = '50%';
        giant.el.style.transform = 'translateY(-50%)';
        giant.el.style.zIndex = '100';
        this.entities.push(giant);

        // Volvemos al intervalo de generación normal
        clearInterval(this.obstacleTimer);
        this.obstacleTimer = setInterval(() => this.spawnManager(), CONFIG.initialObstacleInterval);
    }

    updateScore() {
        this.ui.score.innerText = this.score;
        this.ui.score.classList.remove('bounce');
        void this.ui.score.offsetWidth; // Force reflow
        this.ui.score.classList.add('bounce');
    }

    // Crea una pequeña chispa que flota por el fondo
    spawnAmbientSparkle() {
        const s = document.createElement('div');
        s.className = 'sparkle';
        s.style.left = `${Utils.random(10, 110)}%`;
        s.style.top = `${Utils.random(0, 100)}%`;

        const size = Utils.random(2, 6);
        s.style.width = `${size}px`;
        s.style.height = `${size}px`;

        const duration = Utils.random(3, 6);
        s.style.setProperty('--duration', `${duration}s`);

        this.ui.gameArea.appendChild(s);
        setTimeout(() => s.remove(), duration * 1000);
    }

    // Bucle principal de actualización (se ejecuta ~60 veces por segundo)
    update(timestamp) {
        if (this.isGameOver) return;

        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        // Multiplicador basado en el tiempo para fluidez
        const tm = Math.min(deltaTime / 16.66, 3);

        this.pigeon.update(deltaTime, tm);
        
        // Crear rastro de la paloma aleatoriamente
        if (Math.random() < 0.4) {
            const rect = this.pigeon.getRect();
            ParticleSystem.createTrail(rect.left, rect.top + rect.height / 2, this.pigeon.rotation);
        }

        // Muerte por salir de límites
        if (this.pigeon.y < -5 || this.pigeon.y > 105) {
            this.gameOver();
            return;
        }

        // Efectos de tormenta (lluvia y rayos)
        if (this.storm.active) {
            if (Math.random() < 0.4 * tm) this.spawnRain();
            if (Math.random() < 0.02 * tm) this.spawnLightning();
        }

        const pRect = this.pigeon.getRect();
        const hitMargin = 15;
        const pBox = {
            left: pRect.left + hitMargin,
            right: pRect.right - hitMargin,
            top: pRect.top + hitMargin,
            bottom: pRect.bottom - hitMargin
        };

        // Actualizamos todos los objetos activos
        for (let i = this.entities.length - 1; i >= 0; i--) {
            const en = this.entities[i];
            en.update(tm);

            if (en.isDead) {
                this.entities.splice(i, 1);
                continue;
            }

            // Detección de colisión con hitbox ajustada
            let eRect = en.getRect();
            if (en.hitboxScale !== 1.0) {
                const centerW = eRect.left + eRect.width / 2;
                const centerH = eRect.top + eRect.height / 2;
                const newW = eRect.width * en.hitboxScale;
                const newH = eRect.height * en.hitboxScale;
                eRect = {
                    left: centerW - newW / 2,
                    right: centerW + newW / 2,
                    top: centerH - newH / 2,
                    bottom: centerH + newH / 2,
                    width: newW,
                    height: newH
                };
            }

            if (pBox.left < eRect.right && pBox.right > eRect.left &&
                pBox.top < eRect.bottom && pBox.bottom > eRect.top) {

                this.handleCollision(en, eRect);
            }
        }

        this.gameLoop = requestAnimationFrame((t) => this.update(t));
    }

    // Gestiona qué pasa cuando la paloma toca algo
    handleCollision(en, eRect) {
        if (en.type === 'projectile' || en.el?.classList.contains('obstacle')) {
            if (this.pigeon.isInvulnerable) {
                if (en.remove) {
                    ParticleSystem.createExplosion(eRect.left, eRect.top, '#ff3377', 10);
                    en.remove();
                }
                return;
            }
            this.gameOver();
        } else if (en.el?.classList.contains('heart-pickup')) {
            // Recoger corazón pequeño
            this.score += 5;
            this.updateScore();
            this.collectFeedback(en, eRect);
        } else if (en.el?.classList.contains('giant-heart')) {
            // Recoger corazón gigante
            this.score += 30;
            this.updateScore();
            this.collectFeedback(en, eRect, 4, 600);
        } else if (en.el?.classList.contains('lotus-pickup')) {
            // Recoger flor de loto (Invulnerabilidad)
            this.pigeon.makeInvulnerable(7000);
            en.remove();
        }
    }

    // Efectos visuales al recoger un ítem
    collectFeedback(en, rect, scale = 3, duration = 300) {
        if (en.isDead) return;
        en.isDead = true;

        en.el.style.transform = `scale(${scale})`;
        en.el.style.opacity = '0';
        en.el.style.transition = `all ${duration / 1000}s ease-out`;
        ParticleSystem.createPhrase(rect.left, rect.top, Utils.pick(CONFIG.frases));
        ParticleSystem.createRipple(rect.left + rect.width / 2, rect.top + rect.height / 2);
        setTimeout(() => en.remove(), duration);
    }

    // Crea gotas de lluvia decorativas
    spawnRain() {
        const rain = document.createElement('div');
        rain.className = 'rain-drop';
        rain.style.left = `${Utils.random(0, 120)}%`;
        rain.style.animationDuration = `${Utils.random(0.3, 0.6)}s`;
        this.ui.gameArea.appendChild(rain);
        setTimeout(() => rain.remove(), 800);
    }

    // Crea un flash de rayo
    spawnLightning() {
        const l = document.createElement('div');
        l.className = 'lightning';
        document.body.appendChild(l);
        setTimeout(() => l.remove(), 400);
    }

    // Gestiona la pantalla de muerte
    gameOver() {
        if (this.isGameOver) return;
        this.isGameOver = true;

        // Flash rojo y temblor de pantalla
        const flash = document.createElement('div');
        flash.id = 'flash-overlay';
        flash.className = 'flash-anim';
        document.body.appendChild(flash);
        this.ui.gameArea.classList.add('shake');

        this.ui.finalScoreVal.innerText = this.score;

        setTimeout(() => {
            flash.remove();
            this.ui.gameArea.classList.remove('shake');
            this.screens.game.classList.remove('active');
            this.screens.over.classList.add('active');
        }, 600);
    }
}

// Inicialización cuando carga la página
document.addEventListener('DOMContentLoaded', () => {
    window.Game = new GameManager();
});
