import { Utils } from './utils.js';
import { CONFIG } from './config.js';

/**
 * Sistema de efectos especiales y partículas ✨
 */
export class ParticleSystem {
    
    // Crea una onda expansiva en la posición indicada
    static createRipple(x, y) {
        const ripple = document.createElement('div');
        ripple.className = 'ripple';
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        document.body.appendChild(ripple);
        // Desaparece después de la animación de CSS
        setTimeout(() => ripple.remove(), 600);
    }

    // Crea una explosión de chispas de colores
    static createExplosion(x, y, color = 'white', count = 10) {
        for (let i = 0; i < count; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            p.style.backgroundColor = color;
            p.style.left = `${x}px`;
            p.style.top = `${y}px`;
            
            const size = Utils.random(4, 12);
            p.style.width = `${size}px`;
            p.style.height = `${size}px`;

            // Dirección y velocidad aleatoria para cada chispa
            const angle = Math.random() * Math.PI * 2;
            const speed = Utils.random(30, 110);
            const destX = x + Math.cos(angle) * speed;
            const destY = y + Math.sin(angle) * speed + 60; // Caída por "gravedad"

            p.style.transform = `translate(0, 0) scale(1)`;
            document.body.appendChild(p);

            // Iniciamos la animación de movimiento
            requestAnimationFrame(() => {
                p.style.transform = `translate(${destX - x}px, ${destY - y}px) scale(0)`;
                p.style.opacity = '0';
            });
            setTimeout(() => p.remove(), 800);
        }
    }

    // Crea un texto flotante (ej: "I luv u")
    static createPhrase(x, y, text) {
        const phrase = document.createElement('div');
        phrase.className = 'affection-phrase';
        phrase.innerText = text;
        phrase.style.left = `${x - 20}px`;
        phrase.style.top = `${y - 30}px`;
        document.body.appendChild(phrase);
        setTimeout(() => phrase.remove(), 1500);
    }

    // Crea el rastro/estela "fantasmal" de la paloma
    static createTrail(x, y, rotation) {
        const t = document.createElement('div');
        t.className = 'trail-pigeon';
        // HTML interno para pintar la paloma invertida
        t.innerHTML = '<span style="display:inline-block; transform: scaleX(-1);">🕊️</span>';
        t.style.left = `${x}px`;
        t.style.top = `${y}px`;
        t.style.transform = `translateY(-50%) rotate(${rotation}deg)`;
        document.body.appendChild(t);
        
        // Se hace pequeño y desaparece suavemente
        requestAnimationFrame(() => {
            t.style.opacity = '0';
            t.style.transform = `translateY(-50%) rotate(${rotation}deg) scale(0.4)`;
        });
        setTimeout(() => t.remove(), 300);
    }
}
