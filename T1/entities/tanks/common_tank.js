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
    let bulletSpeed = 2;
    let damage = 1;
    super(tankColor, amogColor, moveSpeed, rotationSpeed, damage, bulletSpeed, maxHealth);

    this.model = createCommonTank(this.tankColor, this.amogColor);
  }
}
