import * as THREE from "../../public/three/build/three.module.js";
import { TextGeometry } from "../../public/three/examples/jsm/geometries/TextGeometry.js";
import { getCachedFont } from "../../preload.js";

export class NickDisplay {
    constructor(nickname, color = 0x000000) {
        this.nickname = nickname;
        this._model = this.createModel(nickname, color);
        console.log("Model created:", this._model);
    }

    createModel(nick, color, width = 5, height = 2) {
        const font = getCachedFont();
        const geometry = new TextGeometry(nick, {
            font: font,
            size: 3,
            depth: 0,
            curveSegments: 12,
            bevelEnabled: false,
            bevelThickness: 1,
            bevelSize: 8,
            bevelOffset: 0,
            bevelSegments: 5,
        });

        const materialBar = new THREE.MeshBasicMaterial({
            color: color,
        });
        let model = new THREE.Mesh(geometry, materialBar);
        model.rotateX(THREE.MathUtils.degToRad(-30));
        model.translateY(10);
        model.translateX(-6);

        return model;
    }

    get model() {
        return this._model;
    }

    setHealthBarPosition(tankPosition) {
        this.model.position.set(
            tankPosition.x,
            tankPosition.y - 9,
            tankPosition.z + 10
        );
        // console.log(this.model.position)
    }

    updateHealthBar(actualLife) {
        let percentageLife = actualLife / this.maxLife;
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
        color.setRGB(red, green, 0);

        this.model.material.color.copy(color);
        this.model.scale.setX(width);
    }
}
