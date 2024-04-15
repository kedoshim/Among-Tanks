import { Tank } from "./tank.js";
import { createCommonTank } from "./models/common_tank_model.js";

/**
* Represent the basic starter tank
*/
export class CommonTank extends Tank {
  constructor(tankColor, amogColor) {
    let moveSpeed = 100;
    let rotationSpeed = 30;
    super(tankColor, amogColor, moveSpeed, rotationSpeed);

    this.model = createCommonTank(this.tankColor, this.amogColor);
    this.modelName = "common";
    // this.x = this.model.position.x;
    // this.z = this.model.position.z;
    // this.rotation = this.model.rotation;
  }
}
