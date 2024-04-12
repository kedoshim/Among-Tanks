


export class CollisionSystem {
    constructor(players, map) {
        this.players = players;
        this.map = map;
    }

    checkCollisionBetwennCollisionShapes(collisionShape1, collisionShape2) {
        return collisionShape1.intersectsBox(collisionShape2);
    }
}

export class ProjectileCollisionSystem extends CollisionSystem {
    constructor(players, map=null, minDistanceForDanger=5) {
        super(players, map);
    }

    checkIfThereHasBeenCollisionWithTanks() {
        let players = this.players;
        let player = null;
        let hitTank = false;
        let projectiles = [];

        for (let playerIndex = 0; playerIndex < players.length; playerIndex++) {
            player = players[playerIndex];
            for (let projectileIndex = 0; projectileIndex < player._tank.projectiles.length; projectileIndex++) {
                projectiles.push(player._tank.projectiles[projectileIndex]);
            }
        }
        
        for (let playerIndex = 0; playerIndex < players.length; playerIndex++) {
            player = players[playerIndex];
            for (let projectileIndex = 0; projectileIndex < projectiles.length; projectileIndex++) {
                hitTank = this.checkCollisionBetwennCollisionShapes(player._tank.collisionShape, projectiles[projectileIndex].collisionShape)

                if(hitTank) {
                    projectiles[projectileIndex].hitTank();
                    player.lifes -= projectiles[projectileIndex].damage;
                    console.log(player);
                }
            }
        }
    }
}

export class TankCollisionSystem extends CollisionSystem {
    constructor(players, map) {
        super(players, map);
    }
}