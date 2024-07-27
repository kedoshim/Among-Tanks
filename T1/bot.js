import {Projectile} from '../T1/projectile.js';

export class Bot {

}

export class Turret {
    constructor(model, player, bots, shootingOptions=null) {
        this.model = model;
        this.player = player;
        this.bots = bots;

        if (!shootingOptions) {
            shootingOptions = {
                bulletSpeed: 2,
                damage: 1,
            }
        }

        this._bulletSpeed = shootingOptions.bulletSpeed;
        TouchList._damage = shootingOptions.damage;

        this._lastShootTime = 0;
        this._shootCooldown = 3000;

        this._projectiles = [];
    }

    trackNearestTank() {
        // perseguir o tanque mais próximo
    }

    shoot() {
        const currentTime = Date.now();
        if (currentTime - this._lastShootTime >= this._shootCooldown) {
            return;
        }

        this._lastShootTime = currentTime;

        const length = 11;
        const projectilePosition = this.model.position.clone(); // Posição inicial do projétil é a mesma da turreta

        const turretForwardVector = new THREE.Vector3(0, 0, 1); // Vetor de avanço da turreta na direção Z positiva
        turretForwardVector.applyQuaternion(this.model.quaternion); // Aplicar rotação da turreta ao vetor de avanço

        // Calcular a direção do projétil com base no vetor de avanço da turreta
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