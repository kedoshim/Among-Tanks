import * as THREE from "three";
import { Projectile } from "../../Projectiles/projectile.js";
import { Box3, Object3D } from "../../../build/three.module.js";

/**
* General class that represents any tank model
*/
export class Tank {
  /**
   * Creates an instance of Tank.
   *
   * @constructor
   * @param {string} tankColor
   * @param {string} amogColor
   * @param {number} [moveSpeed=1]
   * @param {number} [rotationSpeed=0.15]
   */
  constructor(tankColor, amogColor, moveSpeed = 1, rotationSpeed = 0.15) {
    this._tankColor = tankColor;
    this._amogColor = amogColor;
    this._moveSpeed = moveSpeed;
    this._rotationSpeed = rotationSpeed / 2;
    this._animationRotationSpeed = rotationSpeed;
    this._inMovement = false;
    this._positiveMovement = true;

    this._model = null;

    this._projectiles = [];
    this.collisionShape = null;
    this._collidedWithWalls = false;
    this.slideVector = new THREE.Vector3(0,0,0);

    this._lastValidTargetAngle = 0;
  }

  // Getters
  /**
   * Description placeholder
   */
  get tankColor() {
    return this._tankColor;
  }

  /**
   * Description placeholder
   */
  get amogColor() {
    return this._amogColor;
  }

  /**
   * Description placeholder
   */
  get moveSpeed() {
    return this._moveSpeed;
  }

  /**
   * Description placeholder
   */
  get rotationSpeed() {
    return this._rotationSpeed;
  }

  get inMovement() {
    return this._inMovement;
  }

  /**
   * Description placeholder
   */
  get model() {
    return this._model;
  }

  /**
   * Sets the last movement direction angle selected by
   * the player
   */
  get lastValidTargetAngle() {
    return this._lastValidTargetAngle;
  }

  get projectiles() {
    return this._projectiles;
  }

  get collidedWithWalls() {
    return this._collidedWithWalls;
  }

  // Setters
  /**
   * @type {String}
   */
  set tankColor(color) {
    this._tankColor = color;
  }

  /**
   * @type {*}
   */
  set amogColor(color) {
    this._amogColor = color;
  }

  /**
   * @type {number}
   */
  set moveSpeed(speed) {
    this._moveSpeed = speed;
  }

  /**
   * @type {number}
   */
  set rotationSpeed(speed) {
    this._rotationSpeed = speed;
  }

  /**
   * @type {Object3D}
   */
  set model(model) {
    this._model = model;
    this.collisionShape = new THREE.Box3().setFromObject(model);
  }

  set collidedWithWalls(collided) {
    this._collidedWithWalls = collided;
  }

  set inMovement(inMovement) {
    trhis._inMovement = inMovement;
  }

  /**
   * Sets the last movement direction angle selected by
   * the player
   *
   * @type {number}
   */
  set lastValidTargetAngle(angle) {
    this._lastValidTargetAngle = angle;
  }

  /**
   * Moves the tank following the directionalMovement mode
   *
   * @param {number} moveX The amount and direction of movement in the X axis [-1,1]
   * @param {number} moveZ The amount and direction of movement in the X axis [-1,1]
   */
  moveDirectional(moveX, moveZ) {
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

    this.collisionShape = null;
    this.collisionShape = new THREE.Box3().setFromObject(this.model);
  }

  /**
   * Moves the tank following the rotationalMovement mode
   *
   * @param {number} forwardForce Varies from -1 (moves backwards) to 1 (moves frontwards)
   * @param {number} rotationDirection Varies from -1 (left) to 1 (right)
   */
  moveRotating(forwardForce, rotationDirection) {
    if (Math.abs(forwardForce) > 1) {
      forwardForce = forwardForce >= 0 ? 1 : -1;
    }
    if (Math.abs(rotationDirection) > 1) {
      rotationDirection = rotationDirection >= 0 ? 1 : -1;
    }

    if (!this.collidedWithWalls) {
      // Movimento normal se não houver colisão com as paredes
      this.model.translateZ(forwardForce * this._moveSpeed);
    }
    else {
        if(this.inMovement && forwardForce !== 0) {
          // Deslizar enquanto estiver em contato com a parede
          this.model.position.add(this.slideVector);
        }
    }

    // Resetar a flag de colisão com as paredes
    this.collidedWithWalls = false;

    // Resetar o movimento
    this._inMovement = false;

    // Rodar o tanque
    this.model.rotateY(this._rotationSpeed * rotationDirection);

    // Atualizar a última angulação válida
    this._lastValidTargetAngle = this._model.rotation.y;

    // Atualizar a forma de colisão do tanque
    this.collisionShape = null;
    this.collisionShape = new THREE.Box3().setFromObject(this.model);
  }
  /**
   * Makes the tank shoot
   */
  shoot() {
    const length = 16; // Posição de disparo do projétil em relação ao tanque
    const projectilePosition = this.model.position.clone(); // Posição inicial do projétil é a mesma do tanque

    const tankForwardVector = new THREE.Vector3(0, 0, 1); // Vetor de avanço do tanque na direção Z positiva
    tankForwardVector.applyQuaternion(this.model.quaternion); // Aplicar rotação do tanque ao vetor de avanço

    // Calcular a direção do projétil com base no vetor de avanço do tanque
    const direction = tankForwardVector.normalize();

    // Adicionar a direção ao vetor posição para obter a posição final do projétil
    projectilePosition.addScaledVector(direction, length);

    // Criar o projétil na posição calculada e com a direção correta
    let projectile = new Projectile(projectilePosition, direction);
    this._projectiles.push(projectile);
}
}
