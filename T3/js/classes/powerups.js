import * as THREE from "three";

export class PowerUpSystem {
    constructor(params) {
        this.params = params;

        this.powerUps = [];
    }
}


export class PowerUp {
    constructor(model, type) {
        this.model = model;
        this.collisionShape = new THREE.Box3().setFromObject(model);
        this.type = type;

        this.playerGet = false;

        this.getTime = 0;
    }

    playerGet() {
        this.playerGet = true;
        this.getTime = Date.now();
    }

    isPlayerGet() {
        return this.playerGet;
    }
}

