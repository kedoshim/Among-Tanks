import { Tank } from "./tank.js";
import { createCommonTank } from "./models/common_tank_model.js";

export class CommonTank extends Tank {
  constructor(tankColor, amogColor) {
    let moveSpeed = 1;
    let rotationSpeed = 0.15;
    super(tankColor, amogColor, moveSpeed, rotationSpeed);

    this.model = createCommonTank(this.tankColor, this.amogColor);
  }
}
