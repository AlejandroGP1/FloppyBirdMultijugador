/**
 * Utilidades matemáticas y de apoyo 🛠️
 */
export class Utils {
    // Genera un número aleatorio con decimales
    static random(min, max) { return Math.random() * (max - min) + min; }
    
    // Genera un número entero aleatorio
    static randomInt(min, max) { return Math.floor(this.random(min, max)); }
    
    // Elige un elemento al azar de un Array (lista)
    static pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
}
