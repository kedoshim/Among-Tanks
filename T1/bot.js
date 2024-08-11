import {Projectile} from '../T1/projectile.js';

class MathSupp {
    calculateLineEquation(x1, z1, x2, z2) {
        const a = z1 - z2;
        const b = x2 - x1;
        const c = x1 * z2 - x2 * z1;
        return { a, b, c };
    }

    sideIntersection(a, b, c, x1, z1, x2, z2) {
        if (b === 0) {
          // Reta vertical
          if (x1 <= -c / a && -c / a <= x2) return true;
        } else if (a === 0) {
          // Reta horizontal
          if (z1 <= -c / b && -c / b <= z2) return true;
        } else {
          const intersecaoX = -c / a;
          const intersecaoz = -c / b;
          if (x1 <= intersecaoX && intersecaoX <= x2) return true;
          if (z1 <= intersecaoz && intersecaoz <= z2) return true;
        }
        return false;
    }

    verifyIntersection(a, b, c, xc, zc, BS) {
        // Coordenadas dos vértices do quadrado
        const halfBS = BS / 2;
        const vertices = [
            { x: xc - halfBS, z: zc - halfBS },
            { x: xc + halfBS, z: zc - halfBS },
            { x: xc + halfBS, z: zc + halfBS },
            { x: xc - halfBS, z: zc + halfBS }
        ];

        return (
            MathSupp.sideIntersection(a, b, c, vertices[0].x, vertices[0].z, vertices[1].x, vertices[1].z) ||
            MathSupp.sideIntersection(a, b, c, vertices[1].x, vertices[1].z, vertices[2].x, vertices[2].z) ||
            MathSupp.sideIntersection(a, b, c, vertices[2].x, vertices[2].z, vertices[3].x, vertices[3].z) ||
            MathSupp.sideIntersection(a, b, c, vertices[3].x, vertices[3].z, vertices[0].x, vertices[0].z)
          );
    }
}


export class Node {
    constructor(player, walls, bots, turrets, parentNode=null) {
        this.player = player;
        this.walls = walls;
        this.bots = bots
        this.turrets = turrets;

        this.parentNode = parentNode;
    }

    nextAction(botIndex) {
        if (this.thereIsObjectsBetweenPlayerAndBot(botIndex)) {
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
        // check if there is an object between a bot and a plazer
        let bot = this.bots[botIndex];
        let player = this.player;
        let walls = this.walls;
        let wall, wallPosition;
        const BLOCK_SIZE = wall.BLOCK_SIZE;

        let playerPosition = player.model.position.clone();
        let botPosition = bot.model.position.clone();

        const {a,b,c} = MathSupp.calculateLineEquation(playerPosition.x, playerPosition.z, botPosition.x, botPosition.z);
        
        for(let wallIndex = 0; wallIndex < walls.length; wallIndex++) {
            wall = walls[wallIndex];
            wallPosition = wall.model.position.clone();

            if (MathSupp.verifyIntersection(a,b,c, wallPosition.x, wallPosition.z, BLOCK_SIZE)) {
                return true;
            }
        }

        return false;
    }

    isPlayerInFrontOfBot(botIndex) {
        let bot = this.bots[botIndex];
        let player = this.player;

        let playerPosition = player.model.position.clone();
        let botPosition = bot.model.position.clone();
        let dif = playerPosition.sub(botPosition);
        let direction = new THREE.Vector3(0,0,1);
        direction.applyQuaternion(botPosition.model.quaternion);

        if (direction.angleTo(dif) <= 0.18) {
            return true;
        }

        return false;
    }

    // Check the turret state for 
    checkTurretState(botIndex) {
        let bot = this.bots[botIndex];
        
    }

    // -------------- Complex Actions --------------

    trackPlayer(botIndex) {

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
     * @param {Three.js Object} model 
     * @param {list} plazers 
     * @param {list} bots 
     * @param {list} walls
     * @param {Object} shootParams 
     */
    constructor(model, shootParams=null) {
        self.model = model;

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

    move() {
        if (this._nextMove.isDirectional) {
            this.model.moveDirectional(this._nextMove.moveX, this._nextMove.movez);
        }
        else {
            this.model.moveRotating(this._nextMove.movement, this._nextMove.rotation);
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
        this.model.shoot();
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