import * as THREE from 'three';

export class CollisionSystem {
    constructor(players, walls) {
        this.players = players;
        this.walls = walls;
    }

    checkCollisionBetwennCollisionShapes(collisionShape1, collisionShape2) {
        return collisionShape1.intersectsBox(collisionShape2);
    }
}

export class ProjectileCollisionSystem extends CollisionSystem {
    constructor(players, walls) {
        super(players, walls);
        this._projectiles = [];
    }

    #getAllProjectilesInScene() {
        let players = this.players;
        let player = null;
        let projectiles = [];

        for (let playerIndex = 0; playerIndex < players.length; playerIndex++) {
            player = players[playerIndex];
            for (let projectileIndex = 0; projectileIndex < player._tank.projectiles.length; projectileIndex++) {
                projectiles.push(player._tank.projectiles[projectileIndex]);
            }
        }
        this._projectiles = [];
        this._projectiles = projectiles;
    }

    checkIfThereHasBeenCollisionWithTanks() {
        let players = this.players;
        let player = null;
        let hitTank = false;

        this.#getAllProjectilesInScene();
        let projectiles = this._projectiles;
        
        for (let playerIndex = 0; playerIndex < players.length; playerIndex++) {
            player = players[playerIndex];
            for (let projectileIndex = 0; projectileIndex < projectiles.length; projectileIndex++) {
                hitTank = this.checkCollisionBetwennCollisionShapes(player._tank.collisionShape, projectiles[projectileIndex].collisionShape)

                if(hitTank) {
                    projectiles[projectileIndex].hitTank();
                    player.lifes -= projectiles[projectileIndex].damage;
                }
            }
        }
    }

    checkCollisionWithWalls() {
        let walls = this.walls;
        let wall = null;
        let hitWall;

        this.#getAllProjectilesInScene();
        let projectiles = this._projectiles;

        for (let projectileIndex = 0; projectileIndex < projectiles.length; projectileIndex++) {
            for (let wallIndex = 0; wallIndex < walls.length; wallIndex++) {
                wall = walls[wallIndex];
                hitWall = this.checkCollisionBetwennCollisionShapes(wall.collisionShape, projectiles[projectileIndex].collisionShape);

                if(hitWall) {
                    //projectiles[projectileIndex].reflection(wall.position);
                    this.#calculateReflectionDirection(wall.model.position, projectiles[projectileIndex]);
                    projectiles[projectileIndex].hitWall();
                    console.log("O projétil colidiu com o muro!");
                }
            }
        }
    }

    #calculateReflectionDirection(wallPosition, projectile) {
        // Poosiible directions for reflection
        const directions = {
            left: new THREE.Vector3(-1, 0, 0),
            right: new THREE.Vector3(1, 0, 0),
            up: new THREE.Vector3(0, 0, -1),
            down: new THREE.Vector3(0, 0, 1)
        };

        // calculate the difference betwenn positions
        const x_distance = wallPosition.x - projectile.projectile.position.x;
        const z_distance = wallPosition.z - projectile.projectile.position.z;

        // Impact directions based on distances
        let sideOfImpactX = x_distance > 0 ? directions.left : directions.right;
        let sideOfImpactZ = z_distance > 0 ? directions.up : directions.down;

        // Define the reflection direction based on impact direction
        let reflectionDirection;
        if (Math.abs(x_distance) > Math.abs(z_distance)) {
            reflectionDirection = sideOfImpactX;
        } else {
            reflectionDirection = sideOfImpactZ;
        }

        // Apply the reflection
        projectile.reflection(reflectionDirection);
    }
}

export class TankCollisionSystem extends CollisionSystem {
    constructor(players, walls) {
        super(players, walls);
    }

    checkCollisionWithWalls() {
        let walls = this.walls;
        let wall = null;
        let player = null;
        let players = this.players;

        for (let playerIndex = 0; playerIndex < players.length; playerIndex++) {
            player = players[playerIndex];

            for (let wallIndex = 0; wallIndex < walls.length; wallIndex++) {
                wall = walls[wallIndex];
                hitWall = this.checkCollisionBetwennCollisionShapes(wall.collisionShape, player._tank.collisionShape);

                if(hitWall) {
                    //TODO: fazer o resto da colisão
                }
            }
        }
    }
}