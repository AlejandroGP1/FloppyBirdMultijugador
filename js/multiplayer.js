import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, set, onDisconnect, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { CONFIG } from './config.js';

export class MultiplayerManager {
    constructor(gameManager) {
        this.gm = gameManager;
        this.playerId = 'player_' + Math.random().toString(36).substr(2, 9);
        this.partnerId = null;
        
        // Inicializar Firebase
        const app = initializeApp(CONFIG.firebaseConfig);
        this.db = getDatabase(app);
        this.playersRef = ref(this.db, 'players');
        this.myRef = ref(this.db, `players/${this.playerId}`);

        this.setupPresence();
        this.listenForPlayers();
    }

    setupPresence() {
        // Al desconectarse, eliminar mi rastro
        onDisconnect(this.myRef).remove();
    }

    // Envía mi estado actual a la red
    sendUpdate(pigeon, isGameOver) {
        set(this.myRef, {
            y: pigeon.y,
            velocity: pigeon.velocity,
            rotation: pigeon.rotation,
            isDead: isGameOver,
            lastSeen: Date.now()
        });
    }

    listenForPlayers() {
        onValue(this.playersRef, (snapshot) => {
            const players = snapshot.val();
            let foundPartner = false;

            if (players) {
                const now = Date.now();
                // Buscamos a alguien que no sea yo y que esté activo (lastSeen < 10s)
                for (let id in players) {
                    if (id !== this.playerId) {
                        const p = players[id];
                        if (now - p.lastSeen < 10000) { 
                            this.partnerId = id;
                            this.gm.updatePartnerData(p);
                            foundPartner = true;
                            break;
                        }
                    }
                }
            }

            if (!foundPartner) {
                this.partnerId = null;
                this.gm.updatePartnerData(null);
            }
        });
    }
}
