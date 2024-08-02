import {Projectile} from '../T1/projectile.js';

class Bot {
    /**
     * @param {Three.js Object} model 
     * @param {list} players 
     * @param {list} bots 
     * @param {list} walls
     * @param {Object} shootParams 
     */
    constructor(model, players, bots, walls, shootParams=null) {
        self.model = model;
        self.players = players;
        self.bots = bots;
        this.walls = walls;

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

//--------------------------------------------------------------------------------------------
// Escreva o Seu bot aqui, seguindo este modelo (renomei a sua classe como quiser):
export class Nome1 extends Bot {
    constructor(model, players, bots, walls, shootParams=null) {
        super(model, players, bots, walls, shootParams);
    }

    nextAction() {
        // Escreva a lógica do seu bot aqui
    }
}


// Bot do Yan:
export class Tracker extends Bot {
    constructor(model, players, bots, walls, shootParams=null) {
        super(model, players, bots, walls, shootParams);
    }

    nextAction() {
        // Escreva a lógica do seu bot aqui
    }
}
//--------------------------------------------------------------------------------------------

export class Turret extends Bot {
    constructor(model, players, bots, walls, shootParams=null) {
        super(model,players,bots, walls, shootParams);

        this._bulletSpeed = this.shootParams.bulletSpeed;
        TouchList._damage = this.shootParams.damage;

        this._shootCooldown = this.shootParams.shootCooldown;
    }

    trackNearestTank() {
        // perseguir o tanque mais próximo
    }
}