import { CONFIG } from './config.js';
import { Utils } from './utils.js';
import { ParticleSystem } from './particles.js';

/**
 * Clase base para todos los objetos del juego (obstáculos, corazones, etc.)
 */
export class Entity {
    constructor(container, type, content = '') {
        this.container = container;
        this.el = document.createElement('div');
        this.el.className = type;
        if (content) this.el.innerText = content;

        this.x = 105; // Empieza justo fuera de la pantalla a la derecha
        this.y = 50;  // Altura por defecto (50%)
        this.speed = 1.2; // Velocidad de movimiento a la izquierda

        this.container.appendChild(this.el);
        this.isDead = false; // Marcador para eliminar del bucle
        this.hitboxScale = 1.0; // Escala por defecto de la caja de colisión
    }

    // Se ejecuta en cada frame del juego
    update(timeMultiplier) {
        this.x -= this.speed * timeMultiplier;

        // Soporte para movimiento vertical (ej: meteoritos)
        if (this.speedY) {
            this.y += this.speedY * timeMultiplier;
            this.el.style.top = `${this.y}%`;
        }

        this.el.style.left = `${this.x}%`;

        // Si sale de la pantalla, se marca para borrar
        if (this.x < -20 || this.y > 120 || this.y < -20) this.remove();
    }

    remove() {
        this.isDead = true;
        this.el.remove();
    }

    getRect() { return this.el.getBoundingClientRect(); }
}

/**
 * Estrellas de fondo para el efecto de profundidad (Parallax)
 */
export class Star extends Entity {
    constructor(container, speedScale) {
        super(container, 'star-particle');
        this.y = Utils.random(0, 100);
        this.el.style.top = `${this.y}%`;
        this.el.innerText = '✨';
        this.el.style.fontSize = `${Utils.random(0.5, 1.5)}rem`;
        this.el.style.opacity = Utils.random(0.2, 0.7);
        this.speed = 0.1 * speedScale; // Muy lentas
        this.el.style.zIndex = '1';
    }
}

/**
 * La protagonista del juego: La Paloma 🕊️
 */
export class Pigeon {
    constructor(el, emoji = '🕊️') {
        this.el = el;
        this.emoji = emoji;
        this.y = 50;         // Altura actual (centro de la pantalla)
        this.velocity = 0;   // Velocidad vertical actual (gravedad/vuelo)
        this.rotation = 0;   // Ángulo de inclinación
        this.isInvulnerable = false; // ¿Está en modo Dios?
        this.invulnTimer = 0;        // Tiempo restante de invulnerabilidad
        this.isDead = false;         // ¿Está muerto esperando reanimación?
        this.reviveTimer = 0;        // Tiempo que lleva el compañero vivo solo

        // Seteamos el emoji inicial si existe un span interno
        const span = this.el.querySelector('span');
        if (span) span.innerText = this.emoji;
    }

    // Reinicia a la paloma para una nueva partida
    reset() {
        this.y = 50;
        this.velocity = 0;
        this.rotation = 0;
        this.isInvulnerable = false;
        this.isDead = false;
        this.reviveTimer = 0;
        this.el.classList.remove('invulnerable');
        this.el.style.opacity = '1';
        this.updateElement();
    }

    // Acción de volar/saltar
    flap() {
        this.velocity = CONFIG.flapPower;
        const rect = this.getRect();
        // Creamos una explosión pequeña de chispas blancas al saltar
        ParticleSystem.createExplosion(rect.left + rect.width / 2, rect.top + rect.height * 0.2, 'white', 8);
    }

    // Actualiza la posición y físicas
    update(deltaTime, timeMultiplier) {
        // Aplicamos la gravedad
        this.velocity += CONFIG.gravity * timeMultiplier;
        this.y += (this.velocity * 0.4) * timeMultiplier;

        // Calculamos la rotación según la velocidad (sube inclinado, baja picado)
        this.rotation = Math.min(Math.max(this.velocity * 4, -30), 45);

        // Control del tiempo de invulnerabilidad
        if (this.isInvulnerable) {
            this.invulnTimer -= deltaTime;
            if (this.invulnTimer <= 0) {
                this.isInvulnerable = false;
                this.el.classList.remove('invulnerable');
                const aura = document.querySelector('.invuln-aura');
                if (aura) aura.classList.remove('active');
            }
        }

        this.updateElement();
    }

    // Aplica los valores visuales al elemento HTML (incluye Squash & Stretch)
    updateElement() {
        // Multiplicador aumentado a 0.1 para que sea MUY visible incluso en emojis
        const stretch = 1 + Math.abs(this.velocity) * 0.1;
        const squash = 1 / stretch;

        // Si sube se estira (stretch > 1, squash < 1), si cae se aplasta
        const scaleY = this.velocity < 0 ? stretch : squash;
        const scaleX = this.velocity < 0 ? squash : stretch;

        this.el.style.top = `${this.y}%`;
        // Forzamos display inline-block para asegurar que la transformación se aplique bien al emoji
        this.el.style.display = 'inline-block';
        
        // Si está muerto, bajamos opacidad
        if (this.isDead) {
            this.el.style.opacity = '0.3';
            this.el.style.transform = `translateY(-50%) rotate(180deg) scale(0.8)`;
        } else {
            this.el.style.opacity = '1';
            this.el.style.transform = `translateY(-50%) rotate(${this.rotation}deg) scale(${scaleX}, ${scaleY})`;
        }
    }

    getRect() { return this.el.getBoundingClientRect(); }

    // Activa el modo invulnerable (aura dorada)
    makeInvulnerable(duration) {
        this.isInvulnerable = true;
        this.invulnTimer = duration;
        this.el.classList.add('invulnerable');
        const aura = document.querySelector('.invuln-aura');
        if (aura) aura.classList.add('active');
    }
}
