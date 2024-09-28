

class PowerUpSystem {
    constructor(types, amount, params=null) {
        this.types = types; // lista de power-ups
        this.amount = amount;
        this.params = params;

        this.powerUps = [];
    }

    createPowerUps() {
        // Cria os Power-Ups
    }
}


class PowerUp {
    constructor(model, type) {
        this.model = model;
        this.collisionShape = new THREE.Box3().setFromObject(model);
        this.type = type;

        this.playerGet = false;
    }

    playerGet() {
        this.playerGet = true;
    }
}

