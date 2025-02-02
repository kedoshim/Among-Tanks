import * as THREE from "three";
import { Projectile } from "../../../js/classes/projectile.js";
import { Object3D } from "../../../../build/three.module.js";
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
        maxHealth = 10,
        shootingOpitions = null
    ) {
        this._tankColor = tankColor;
        this._amogColor = amogColor;
        this._moveSpeed = moveSpeed;
        this._rotationSpeed = rotationSpeed / 2;
        this._animationRotationSpeed = rotationSpeed;
        this._inMovement = false;
        this._positiveMovement = true;

        if (!shootingOpitions) {
            this.shootingOpitions = shootingOpitions = {
                bulletSpeed: 2,
                damage: 1,
                spreadShots: 1,
                semiAutoShots: 1,
                cooldown: 500,
            };
        }

        this._bulletSpeed = shootingOpitions.bulletSpeed;
        this._damage = shootingOpitions.damage;
        this._spreadShots = shootingOpitions.spreadShots;
        this._semiAutoShots = shootingOpitions.semiAutoShots;
        this._shootCooldown = 1000; //shootingOpitions.cooldown

        // Cria a barra de vida
        this._maxHealth = maxHealth;
        this._health = this._maxHealth;
        this._healthBar = new HealthBar(this._maxHealth);

        this._hitboxSize = 6;

        this._model = null;

        this._projectiles = [];
        this.collisionShape = null;
        this._collidedWithWalls = false;
        this.slideVector = new THREE.Vector3(0, 0, 0);

        this._lastValidTargetAngle = 0;

        this._lastShootTime = 0; // Last time the shoot function was called
        this.died = false;
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

    get inMovement() {
        return this._inMovement;
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

    get collidedWithWalls() {
        return this._collidedWithWalls;
    }

    get lostHealth() {
        return this._maxHealth - this._health;
    }

    get position() {
        if (this._model) return this._model.position;
    }
    get rotation() {
        if (this._model) return this._model.rotation;
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
        const boxSize = 6;
        const position = this._model.position;
        let p1 = new THREE.Vector3(
            position.x - boxSize,
            position.y - 9,
            position.z - boxSize
        );
        let p2 = new THREE.Vector3(
            position.x + boxSize,
            position.y + 5,
            position.z + boxSize
        );
        this.collisionShape = new THREE.Box3(p1, p2);
    }

    set collidedWithWalls(collided) {
        this._collidedWithWalls = collided;
    }

    set inMovement(inMovement) {
        trhis._inMovement = inMovement;
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

    set position(position) {
        if (this._model) this._model.position = position;
    }
    set rotation(rotation) {
        if (this._model) this._model.rotation = rotation;
    }

    set projectiles(projectiles) {
        this._projectiles = projectiles;
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

        if (!this.collidedWithWalls) {
            // Movimento normal se não houver colisão com as paredes
            this.model.position.x += this._moveSpeed * moveX;
            this.model.position.z += this._moveSpeed * moveZ;
        } else {
            if (this.inMovement && forwardForce !== 0) {
                // Deslizar enquanto estiver em contato com a parede
                this.model.position.add(this.slideVector);
            }
        }

        // Resetar a flag de colisão com as paredes
        this.collidedWithWalls = false;

        // Resetar o movimento
        this._inMovement = false;

        // Smoothly rotate this.model towards the target angle
        this.model.rotation.y +=
            rotationDifference * this._animationRotationSpeed;
        // Move this.model

        //console.log(moveX, moveZ);

        this.collisionShape = null;
        if (!this.died) {
            const p1 = new THREE.Vector3(
                this.position.x - this._hitboxSize,
                this.position.y - 9,
                this.position.z - this._hitboxSize
            );
            const p2 = new THREE.Vector3(
                this.position.x + this._hitboxSize,
                this.position.y + 5,
                this.position.z + this._hitboxSize
            );
            this.collisionShape = new THREE.Box3(p1, p2);
        }
    }

    /**
     * Moves the tank following the rotationalMovement mode
     *
     * @param {number} forwardForce Varies from -1 (moves backwards) to 1 (moves frontwards)
     * @param {number} rotationDirection Varies from -1 (left) to 1 (right)
     */
    moveRotating(forwardForce, rotationDirection, isMoving = false) {
        if (Math.abs(forwardForce) > 1) {
            forwardForce = forwardForce >= 0 ? 1 : -1;
        }
        if (Math.abs(rotationDirection) > 1) {
            rotationDirection = rotationDirection >= 0 ? 1 : -1;
        }

        if (!this.collidedWithWalls) {
            // Movimento normal se não houver colisão com as paredes
            this.model.translateZ(forwardForce * this._moveSpeed);
        } else {
            if ((this.inMovement || isMoving) && forwardForce !== 0) {
                // Deslizar enquanto estiver em contato com a parede
                this.model.position.add(this.slideVector);
            }
        }

        // Resetar a flag de colisão com as paredes
        this.collidedWithWalls = false;

        // Resetar o movimento
        this._inMovement = false;

        // Rodar o tanque
        if (forwardForce == 0)
            this.model.rotateY(this._rotationSpeed * 0.5 * rotationDirection);
        else this.model.rotateY(this._rotationSpeed * rotationDirection);

        // Atualizar a última angulação válida
        this._lastValidTargetAngle = this._model.rotation.y;

        // Atualizar a forma de colisão do tanque
        this.collisionShape = null;
        if (!this.died) {
            const p1 = new THREE.Vector3(
                this.position.x - this._hitboxSize,
                this.position.y - 9,
                this.position.z - this._hitboxSize
            );
            const p2 = new THREE.Vector3(
                this.position.x + this._hitboxSize,
                this.position.y + 5,
                this.position.z + this._hitboxSize
            );
            this.collisionShape = new THREE.Box3(p1, p2);
        }

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
        this._walkingAudio.play();
    }

    die() {
        this.died = true;
    }

    reset() {
        this.died = false;
        this._health = this._maxHealth;
        this._healthBar = new HealthBar(this._maxHealth);
        this._projectiles = [];
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

        const length = 11; // Posição de disparo do projétil em relação ao tanque
        const projectilePosition = this.model.position.clone(); // Posição inicial do projétil é a mesma do tanque

        const tankForwardVector = new THREE.Vector3(0, 0, 1); // Vetor de avanço do tanque na direção Z positiva
        tankForwardVector.applyQuaternion(this.model.quaternion); // Aplicar rotação do tanque ao vetor de avanço

        // Calcular a direção do projétil com base no vetor de avanço do tanque
        const originalDirection = tankForwardVector.normalize();

        // Se houver apenas 1 tiro, não é necessário calcular a direção do spread
        if (this._spreadShots === 1) {
            // Adicionar a direção ao vetor posição para obter a posição final do projétil
            projectilePosition.addScaledVector(originalDirection, length);

            // Criar o projétil na posição calculada e com a direção correta
            let projectile = new Projectile(
                projectilePosition,
                originalDirection.clone(),
                this._bulletSpeed,
                this._damage
            );
            this._projectiles.push(projectile);
        } else {
            // Distribuir o cone de tiro entre os projéteis
            const spreadAngle = Math.PI / 2; // Ângulo máximo do cone (90 graus em radianos)
            const angleIncrement = spreadAngle / (this._spreadShots - 1); // Incremento de ângulo entre os projéteis

            // Loop para disparar múltiplos projéteis com um pequeno atraso entre cada tiro
            for (let i = 0; i < this._spreadShots; i++) {
                // Calcular a direção para o projétil atual com base no ângulo do cone
                const angle =
                    (i - (this._spreadShots - 1) / 2) * angleIncrement; // Distribuição simétrica em relação ao eixo central
                const direction = originalDirection
                    .clone()
                    .applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);

                // Adicionar a direção ao vetor posição para obter a posição final do projétil
                const projectileDirection = direction.normalize();
                const projectilePosition = this.model.position
                    .clone()
                    .addScaledVector(projectileDirection, length);

                // Criar o projétil na posição calculada e com a direção correta
                let projectile = new Projectile(
                    projectilePosition,
                    projectileDirection,
                    this._bulletSpeed,
                    this._damage
                );
                this._projectiles.push(projectile);
            }
        }

        // console.log(this._projectiles)

        var audio = new Audio("./assets/audio/shot.mp3"); // Áudio do tiro
        audio.play();
    }

    canShoot() {
        if (currentTime - this._lastShootTime < this._shootCooldown) {
            return false;
        }
        return true;
    }
}
