import { Tank } from "./tank.js";
import { createCommonTank } from "./models/common_tank_model.js";
// import { createOldTank } from "./models/old_tank_model.js";

/**
 * Represent the basic starter tank
 */
export class EnemyCommonTank extends Tank {
  constructor(tankColor, amogColor) {
    let moveSpeed = 0.8;
    let rotationSpeed = 0.10;
    let maxHealth = 10;

    let shootingOpitions = {
      bulletSpeed : 1,
      spreadShots : 1,
      semiAutoShots : 1,
      cooldown : 300,
      damage : 1,
    }
    super(tankColor, amogColor, moveSpeed, rotationSpeed, maxHealth, shootingOpitions);

    this.model = createCommonTank(this.tankColor, this.amogColor, true);
  }
}
