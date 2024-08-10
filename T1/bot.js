import {Projectile} from '../T1/projectile.js';



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
        // check if there is an wall between a bot and a player
    }

    isPlayerInFrontOfBot(botIndex) {
        
    }

    // Check the turret state for 
    checkTurretState(botIndex) {

    }

    // -------------- Complex Actions --------------

    trackPlayer(botIndex) {

    }

    evadeTheProjectiles(botIndex) {

    }
    
    // -------------- Actions --------------
    rotateLeft(botIndex) {
        // rotate
    }

    rotateRight(botIndex) {
        // rotate
    }

    forward(botIndex) {
        // go forward
    }

    reverse(botIndex) {
        // go reverse
    }

    shoot(botIndex) {
        // shoot
    }
}




class Bot {
    /**
     * @param {Three.js Object} model 
     * @param {list} players 
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
        turretForwardVector.applyQuaternion(this.model.quaternion); // Aplicar rotação do bot ao vetor de avanço

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