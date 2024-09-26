import { Tank } from "./tank.js";
import { createCommonTank } from "./models/common_tank_model.js";
import audioSystem from "../../audioSystem.js";
// import { createOldTank } from "./models/old_tank_model.js";

/**
 * Represent the basic starter tank
 */
export class EnemyCommonTank extends Tank {
    constructor(tankColor, amogColor) {
        let moveSpeed = 0.8;
        let rotationSpeed = 0.1;
        let maxHealth = 10;

        let shootingOpitions = {
            bulletSpeed: 1,
            spreadShots: 1,
            semiAutoShots: 1,
            cooldown: 300,
            damage: 1,
        };
        super(
            tankColor,
            amogColor,
            moveSpeed,
            rotationSpeed,
            maxHealth,
            shootingOpitions
        );

        this.model = createCommonTank(this.tankColor, this.amogColor, true);
    }

    takeDamage(damage) {
        this._health -= damage;

        audioSystem.play("bot-damage", false, 0.2);
    }
}
