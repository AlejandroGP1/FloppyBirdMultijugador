/**
 * Configuración global del juego ⚙️
 * Aquí puedes ajustar casi cualquier valor del juego.
 */
export const CONFIG = {
    gravity: 0.4,           // Fuerza con la que cae la paloma
    flapPower: -6,         // Fuerza del salto/vuelo
    initialObstacleInterval: 1800, // Tiempo base entre obstáculos (ms)
    stormObstacleInterval: 1300,   // Tiempo entre obstáculos durante la tormenta (ms)
    maxStormObstacles: 15,         // Cuántos obstáculos dura cada tormenta
    stormIntensity: 0.3,           // Probabilidad de obstáculos extra en tormenta

    // Frases que dice la paloma al coger corazones
    frases: [
        "¡Qué pro!", "¡AWEBO!", "Ruuu Ruuu~", "¡Queeeeso!",
        "I luv u", "uwu", "Dayum!", ":3)9", "owo", "¡Guapa!",
        "Horizontal rotiender", "Wao Incredible", "Womp Womp", "Fih",
        "Libertad", "Y a su barco le llamo...", "🌈", "Kiwi aproved"
    ],

    // Emojis de los corazones
    heartsSymbols: ['💖', '💕', '💗', '💓', '🌸', '✨'],

    // Emojis de los planetas gigantes de fondo
    planets: ['🪐', '🌍', '🌑', '🌕'],

    // Emojis de las nubes (desactivadas pero aquí por si las quieres)
    cloudSymbols: ['☁️', '💨', '🌫️'],
    cloudMinSize: 8,
    cloudMaxSize: 15,

    // Configuración de Firebase (proporcionada por el usuario)
    firebaseConfig: {
        apiKey: "AIzaSyBzQlYDusO4y518jIG0KPpyeq-dyBGrWDw",
        authDomain: "flappymulti-29d9a.firebaseapp.com",
        projectId: "flappymulti-29d9a",
        storageBucket: "flappymulti-29d9a.firebasestorage.app",
        messagingSenderId: "392540646214",
        appId: "1:392540646214:web:dbd46c128a3ef398e8d347",
        measurementId: "G-21H47BVYC7",
        databaseURL: "https://flappymulti-29d9a-default-rtdb.firebaseio.com/"
    },

    // Ajustes multijugador
    multiplayer: {
        reviveTime: 5000, // 5 segundos para revivir
        syncRate: 50      // ms entre actualizaciones de red
    }
};
