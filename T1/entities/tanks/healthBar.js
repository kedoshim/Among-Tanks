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
        let percentageLife = actualLife*2 / 20
        let color = new THREE.Color();
        let width = this.originalWidth * percentageLife;

        let red, green;

        if (percentageLife < 0.1) {
          red = 0;
          green = 0;
        } else if (percentageLife < 0.5) {
          red = 1;
          green = (percentageLife - 0.1) * 2;
        } else {
          red = Math.log2(1 / percentageLife);
          green = 1;
        }
        color.setRGB( red, green, 0  )

        this.model.material.color.copy(color);
        this.model.scale.setX(width);
    }
}