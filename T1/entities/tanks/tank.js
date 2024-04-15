import * as THREE from "three";
import { Projectile } from "../../Projectiles/projectile.js";
import { Box3, Object3D } from "../../../build/three.module.js";
import { HealthBar } from "./healthBar.js";

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
  constructor(
    tankColor,
    amogColor,
    moveSpeed = 1,
    rotationSpeed = 0.15,
    maxHealth = 10
  ) {
    this._tankColor = tankColor;
    this._amogColor = amogColor;
    this._moveSpeed = moveSpeed;
    this._rotationSpeed = rotationSpeed / 2;
    this._animationRotationSpeed = rotationSpeed;

    this._maxHealth = maxHealth;
    this._health = this._maxHealth;
    this._healthBar = new HealthBar(this._maxHealth);

    this._model = null;

    this._projectiles = [];
    this.collisionShape = null;

    this._lastValidTargetAngle = 0;

    this._shootCooldown = 250; // Cooldown time in milliseconds
    this._lastShootTime = 0; // Last time the shoot function was called
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

  get health() {
    return this._health;
  }
  get healthBar() {
    return this._healthBar;
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

  get lostHealth() {
    return this._maxHealth - this._health;
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

  set health(health) {
    this._health = health;
  }
  set healthBar(healthBar) {
    this._healthBar = healthBar;
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

    this.model.translateZ(forwardForce * this._moveSpeed);

    if(forwardForce == 0)
      this.model.rotateY(this._rotationSpeed * 0.5 * rotationDirection);
    else
      this.model.rotateY(this._rotationSpeed * rotationDirection);

    this._lastValidTargetAngle = this._model.rotation.y;

    this.collisionShape = null;
    this.collisionShape = new THREE.Box3().setFromObject(this.model);

    // if (forwardForce != 0) {
    //   this._playWalkingSound();
    // }
  }

  _playWalkingSound() {

    // Check if audio is not paused (i.e., playing)
    if (!this._walkingAudio.paused) {
      return; // If playing, do nothing
    }

    // If not playing, start playing the audio
    this._walkingAudio.play()
  }

  /**
   * Makes the tank shoot
   */
  shoot() {
    const currentTime = Date.now();

    if (currentTime - this._lastShootTime < this._shootCooldown) {
      return;
    }

    this._lastShootTime = currentTime;


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

    var audio = new Audio("audio/shot.mp3");
    audio.play();
  }
}
