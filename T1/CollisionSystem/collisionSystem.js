


class CollisionSystem {
    constructor(players, map) {
        this.players = players;
        this.map = map;
    }

    checkCollisionBetwennCollisionShapes(collisionShape1, collisionShape2) {
        return collisionShape1.intersectsBox(collisionShape2);
    }
}

class ProjectileCollisionSystem extends CollisionSystem {
    constructor(players, map, minDistanceForDanger=5) {
        super(players, map);
        this.minDistanceForDanger = minDistanceForDanger;
        this.projectiles = [];
        this.projectilesNearPlayers = {}; // chave: índice do jogador, valor: lista de projéteis próximos.
    }

    addProjectile(projectile) {
        this.projectiles.push(projectile);
    }

    checkForProjectilesNearPlayers() {
        let players = this.players;
        let projectiles = this.projectiles;
        let minDistanceForDanger = this.minDistanceForDanger;
        let projectilesNearPlayer;
        
        for (let playerIndex = 0; playerIndex < players.length; playerIndex++) {
            projectilesNearPlayer = projectiles.filter((projectile) => {
                return players[playerIndex].position.distanceTo(projectile.position) < minDistanceForDanger;
            });
            this.projectilesNearPlayers[playerIndex] = projectilesNearPlayer;
            projectilesNearPlayer = [];
        }
    }
}

class TankCollisionSystem extends CollisionSystem {
    constructor(players, map) {
        super(players, map);
    }
}