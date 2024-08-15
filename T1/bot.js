import {Projectile} from '../T1/projectile.js';
import * as THREE from 'three';


export class AISystem {
    constructor(player, walls, bots, turrets=null, parentNode=null) {
        this.player = player;
        this.walls = walls;
        this.bots = bots
        this.turrets = turrets;

        this.parentNode = parentNode;
    }

    nextAction(botIndex) {
        let test = this.thereIsObjectsBetweenPlayerAndBot(botIndex);
        console.log(test)
        if (test) {
            this.evadeTheProjectiles(botIndex);
        }
        else if (this.isPlayerInFrontOfBot(botIndex)) {
            this.shoot(botIndex);
        }
        else {
            this.trackPlayer(botIndex);
        }
    }

    //-------------- States --------------

    thereIsObjectsBetweenPlayerAndBot(botIndex) {
        let bot = this.bots[botIndex].player_tank;
        let player = this.player;
        let walls = this.walls;

        let playerPosition = player._tank._model.position.clone();
        let botPosition = bot._tank._model.position.clone();

        // Create a Raycaster
        let direction = new THREE.Vector3().subVectors(botPosition, playerPosition).normalize();
        let raycaster = new THREE.Raycaster(playerPosition, direction);

        // Verify intersections with walls
        let intersects = raycaster.intersectObjects(walls.map(wall => wall.model), true);

        // Verify if some intersections is betwenn the player and the bot
        for (let i = 0; i < intersects.length; i++) {
            let intersect = intersects[i];
            if (intersect.distance <= playerPosition.distanceTo(botPosition)) {
                return true;
            }
        }

        return false;
    }
    

    isPlayerInFrontOfBot(botIndex) {
        let bot = this.bots[botIndex].player_tank;
        let player = this.player;

        let playerPosition = player._tank._model.position.clone();
        let botPosition = bot._tank._model.position.clone();
        let dif = playerPosition.sub(botPosition);
        let direction = new THREE.Vector3(0,0,1);
        direction.applyQuaternion(bot.tank._model.quaternion);

        if (direction.angleTo(dif) <= 0.03) {
            return true;
        }

        return false;
    }

    // Check the turret state for 
    checkTurretState(botIndex) {
        
    }

    // -------------- Complex Actions --------------

    trackPlayer(botIndex) {
        let bot = this.bots[botIndex].player_tank;
        let player = this.player;
        let nextMove = {
            isDirectional: false,
            rotation: 0,
            movement: 0,
            moveX: 0,
            movez: 0
        };

        let playerPosition = player._tank._model.position.clone();
        let botPosition = bot._tank._model.position.clone();
        let dif = playerPosition.sub(botPosition);
        let direction = new THREE.Vector3(0,0,1);
        direction.applyQuaternion(bot._tank._model.quaternion);

        let y_axis = new THREE.Vector3(0,1,0);
        let actualAngle = direction.angleTo(dif);

        // rotate right
        let rotationAngle = Math.PI / 32;
        let imaginary_vector_rotation = direction.clone();

        imaginary_vector_rotation.applyAxisAngle(y_axis, rotationAngle);

        let new_angle = imaginary_vector_rotation.angleTo(dif);

        if (new_angle < actualAngle) {
            nextMove["rotation"] = 1;
        }
        else {
            nextMove["rotation"] = -1;
        }

        this.bots[botIndex].setNextMove(nextMove);
    }

    evadeTheProjectiles(botIndex) {

    }
    
    // -------------- Actions --------------
    rotateLeft(botIndex) {
        this.bots[botIndex].rotateLeft();
    }

    rotateRight(botIndex) {
        this.bots[botIndex].rotateRight();
    }

    forward(botIndex) {
        this.bots[botIndex].forward();
    }

    reverse(botIndex) {
        this.bots[botIndex].reverse();
    }

    shoot(botIndex) {
        this.bots[botIndex].shoot();
    }
}




export class Bot {
    /**
     * @param {THREE.js Object} model 
     * @param {list} plazers 
     * @param {list} bots 
     * @param {list} walls
     * @param {Object} shootParams 
     */
    constructor(player_tank, shootParams=null) {
        this.player_tank = player_tank;
        console.log(player_tank)

        if (!shootParams) {
            shootParams = {
                bulletSpeed: 2,
                damage: 1,
                shootCooldown: 3000
            }
        }

        self.shootParams = shootParams;
        this._lastShootTime = 0;
        this._projectiles = [];

        this._nextMove = {
            isDirectional: false,
            rotation: 0,
            movement: 0,
            moveX: 0,
            movez: 0
        };
    }

    setNextMove(nextMove) {
        this._nextMove = nextMove;
    }

    move() {
        if (this.player_tank.health == 0) {
            return;
        }
        if (this._nextMove.isDirectional) {
            this.player_tank._tank.moveDirectional(this._nextMove.moveX, this._nextMove.movez);
        }
        else {
            this.player_tank._tank.moveRotating(this._nextMove.movement, this._nextMove.rotation);
        }
        
        this.resetMove();
    }

    resetMove() {
        this._nextMove = {
            isDirectional: false,
            rotation: 0,
            movement: 0,
            moveX: 0,
            movez: 0
        };
    }

    rotateLeft() {
        this._nextMove.rotation -= 1;
    }

    rotateRight() {
        this._nextMove.rotation += 1;
    }

    forward() {
        this._nextMove.movement += 1;
    }

    reverse() {
        this._nextMove.movement -= 1;
    }

    shoot() {
        if (this.player_tank.health > 0) {
            this.player_tank._tank.shoot();
        }
    }
}

export class Turret {
    constructor(model, players, bots, shootParams=null) {
        this.model = model;
        this.players = players;
        this.bots = bots;

        if (!shootParams) {
            shootParams = {
                bulletSpeed: 2,
                damage: 1,
                shootCooldown: 3000
            }
        }

        self.shootParams = shootParams;
        this._bulletSpeed = this.shootParams.bulletSpeed;
        TouchList._damage = this.shootParams.damage;

        this._shootCooldown = this.shootParams.shootCooldown;
        this._lastShootTime = 0;
    }

    trackNearestTank() {
        // perseguir o tanque mais próximo
    }

    shoot() {
        const currentTime = Date.now();
        if (currentTime - this._lastShootTime >= this.shootParams.shootCooldown) {
            return;
        }

        this._lastShootTime = currentTime;

        const length = 11;
        const projectilePosition = this.model.position.clone(); // Posição inicial do projétil é a mesma do bot

        const turretForwardVector = new THREE.Vector3(0, 0, 1); // Vetor de avanço do bot na direção Z positiva
        turretForwardVector.applzQuaternion(this.model.quaternion); // Aplicar rotação do bot ao vetor de avanço

        // Calcular a direção do projétil com base no vetor de avanço do bot
        const originalDirection = turretForwardVector.normalize();

        // Adicionar a direção ao vetor posição para obter a posição final do projétil
        projectilePosition.addScaledVector(originalDirection, length);

        // Criar o projétil na posição calculada e com a direção correta
        let projectile = new Projectile(
            projectilePosition,
            originalDirection.clone(),
            this._bulletSpeed,
            this._damage,
            ricochetsAmount=0
        );
        this._projectiles.push(projectile);
    }
}