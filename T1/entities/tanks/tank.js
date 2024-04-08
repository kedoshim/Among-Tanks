import * as THREE from "three";

/**
* General class that represents any tank model
*/
export class Tank {
  constructor(tankColor, amogColor, moveSpeed = 1, rotationSpeed = 0.15) {
    this._tankColor = tankColor;
    this._amogColor = amogColor;
    this._moveSpeed = moveSpeed;
    this._rotationSpeed = rotationSpeed/2;
    this._animationRotationSpeed = rotationSpeed;

    this._model = null;

    this._lastValidTargetAngle = 0;
  }

  // Getters
  get tankColor() {
    return this._tankColor;
  }

  get amogColor() {
    return this._amogColor;
  }

  get moveSpeed() {
    return this._moveSpeed;
  }

  get rotationSpeed() {
    return this._rotationSpeed;
  }

  get model() {
    return this._model;
  }

  get lastValidTargetAngle() {
    return this._lastValidTargetAngle;
  }

  // Setters
  set tankColor(color) {
    this._tankColor = color;
  }

  set amogColor(color) {
    this._amogColor = color;
  }

  set moveSpeed(speed) {
    this._moveSpeed = speed;
  }

  set rotationSpeed(speed) {
    this._rotationSpeed = speed;
  }

  set model(model) {
    this._model = model;
  }

  set lastValidTargetAngle(angle) {
    this._lastValidTargetAngle = angle;
  }

  move(moveX, moveZ) {
    // if (moveX !== 0 || moveZ !== 0) console.log("moving ["+moveX+","+moveZ+"]");

    // Calculate diagonal movement direction
    let moveMagnitude = Math.sqrt(moveX * moveX + moveZ * moveZ);
    if (moveMagnitude > 0) {
      moveX /= moveMagnitude;
      moveZ /= moveMagnitude;
    }

    // If there's movement input, calculate the target angle
    let targetAngle = null;
    if (moveX !== 0 || moveZ !== 0) {
      targetAngle = Math.atan2(moveZ, moveX);
      targetAngle += Math.PI / 2; // Adjust rotation since lookAt is rotated 90 degrees
    }

    // If there's no movement input, use the last valid target angle
    // Makes it so the rotation animation only stops at the last inputed direction
    if (targetAngle === null) {
      targetAngle = this.lastValidTargetAngle;
    } else {
      // Update last valid target angle
      this.lastValidTargetAngle = targetAngle;
    }

    // Calculate the difference between current rotation and target angle
    let rotationDifference = targetAngle - this.model.rotation.y;
    // Wrap the difference into range [-π, π]
    rotationDifference =
      THREE.MathUtils.euclideanModulo(
        rotationDifference + Math.PI,
        2 * Math.PI
      ) - Math.PI;

    // Smoothly rotate this.model towards the target angle
    this.model.rotation.y += rotationDifference * this._animationRotationSpeed;

    // Move this.model
    this.model.position.x += this._moveSpeed * moveX;
    this.model.position.z += this._moveSpeed * moveZ;
  }

  moveRotating(forwardForce, rotationDirection) {

    if (Math.abs(forwardForce) > 1) {
      forwardForce = (forwardForce >= 0) ? 1 : -1;
    }
    this.model.translateZ(forwardForce * this._moveSpeed);

    this.model.rotateY(this._rotationSpeed * rotationDirection);

    this._lastValidTargetAngle = this._model.rotation.y;
  }

  shoot() {
    // console.log("shoot");
    //shooting logic
  }
}
