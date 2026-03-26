import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, set, onDisconnect } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { CONFIG } from './config.js';

export class MultiplayerManager {
    constructor(gameManager) {
        this.gm = gameManager;
        this.role = null; // 'p1' o 'p2'
        this.partnerRole = null;
        
        // Inicializar Firebase
        const app = initializeApp(CONFIG.firebaseConfig);
        this.db = getDatabase(app);
        this.sessionRef = ref(this.db, 'session');
    }

    setRole(role) {
        this.role = role;
        this.partnerRole = (role === 'p1' ? 'p2' : 'p1');
        this.myRef = ref(this.db, `session/${this.role}`);
        this.partnerRef = ref(this.db, `session/${this.partnerRole}`);

        this.setupPresence();
        this.listenForPartner();
    }

    setupPresence() {
        // Al desconectarse, marcar como inactivo (remover datos)
        onDisconnect(this.myRef).remove();
    }

    // Envía mi estado actual a la red
    sendUpdate(pigeon, isDead) {
        if (!this.role) return;
        set(this.myRef, {
            y: pigeon.y,
            velocity: pigeon.velocity,
            rotation: pigeon.rotation,
            isDead: isDead,
            lastSeen: Date.now()
        });
    }

    listenForPartner() {
        onValue(this.partnerRef, (snapshot) => {
            const data = snapshot.val();
            const now = Date.now();
            
            // Si el compañero no existe o lleva más de 10s sin reportar, lo consideramos desconectado
            if (!data || (now - data.lastSeen > 10000)) {
                this.gm.updatePartnerData(null);
            } else {
                this.gm.updatePartnerData(data);
            }
        });
    }
}
