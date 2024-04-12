import * as THREE from "three";

export class HealthBar {
    constructor(maxLife) {
        this.maxLife = maxLife;
        this.model = null;
    }

    createLifeBar(width=5, height=2) {
        let geometry = new THREE.BoxGeometry(width, height, 1);
        let materialBar = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        let healthBar = new THREE.Mesh(geometry, materialBar);

        this.originalWidth = width;
        this.originalHeight = height;
        this.model = healthBar;
    }

    getHealthBar() {
        return this.model;
    }

    setHealthBarPosition(tankPosition) {
        this.model.position.set(tankPosition.x, tankPosition.y-9, tankPosition.z + 10);
    }

    updateHealthBar(actualLife) {
        let percentageLife = actualLife / this.maxLife;
        let color = new THREE.Color();
        let width = this.originalWidth * percentageLife;

        if(percentageLife >= 0.75) {
            color.setRGB(0, 1, 0);
        }
        else if(percentageLife >= 0.35) {
            color.setRGB(1, 1, 0); // Amarelo
        }
        else {
            color.setRGB(1, 0, 0);
        }

        this.model.material.color.copy(color);
        this.model.scale.setX(width);
    }
}