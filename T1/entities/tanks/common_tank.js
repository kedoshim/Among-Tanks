import { Tank } from "./tank.js";
import { createCommonTank } from "./models/common_tank_model.js";

/**
 * Represent the basic starter tank
 */
export class CommonTank extends Tank {
  constructor(tankColor, amogColor) {
    let moveSpeed = 1;
    let rotationSpeed = 0.15;
    let maxHealth = 10;

    let shootingOpitions = {
      bulletSpeed : 2,
      spreadShots : 1,
      semiAutoShots : 1,
      cooldown : 250,
      damage : 2,
    }
    super(tankColor, amogColor, moveSpeed, rotationSpeed, maxHealth, shootingOpitions);

    this.model = createCommonTank(this.tankColor, this.amogColor);
  }
}
