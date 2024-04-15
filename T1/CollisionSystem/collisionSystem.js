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
            let projectile = projectiles[projectileIndex];
            let hasHitWall = false; // Variável para controlar se o projétil colidiu com um muro
    
            for (let wallIndex = 0; wallIndex < walls.length; wallIndex++) {
                wall = walls[wallIndex];
                hitWall = this.checkCollisionBetwennCollisionShapes(wall.collisionShape, projectile.collisionShape);
    
                if(hitWall) {
                    if (!hasHitWall) { // Verifica se o projétil já colidiu com um muro
                        this.#calculateReflectionDirection(wall.model.position, projectile);
                        projectile.hitWall();
                        hasHitWall = true; // Define que o projétil colidiu com um muro
                    }
                }
            }
        }
    }

    #calculateReflectionDirection(wallPosition, projectile) {    

        // calculate the difference betwenn positions
        const x_distance = wallPosition.x - projectile.projectile.position.x;
        const z_distance = wallPosition.z - projectile.projectile.position.z;
        let reflectionDirection = null;
        
    
        if (Math.abs(x_distance) > Math.abs(z_distance)) {
            reflectionDirection = new THREE.Vector3(x_distance > 0 ? -1 : 1, 0, 0);
        } else {
            reflectionDirection = new THREE.Vector3(0, 0, z_distance > 0 ? 1 : -1);
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
        let walls = this.walls; // lista de todos os muros
        let players = this.players; // lista de todos os jogadores
        let wall, wallHorizontalIndexAux=0, wallVerticalIndexAux=0; // variáveis auxiliares
        let player;
        let hitWall;
        let theImpactWasInThehorizontal;
        let horizontal, vertical;
        let slideVector;
        let dotProduct;

        for (let playerIndex = 0; playerIndex < players.length; playerIndex++) {
            player = players[playerIndex];
            horizontal = false;
            vertical = false;
            slideVector = new THREE.Vector3(0, 0, 1);
            slideVector.applyQuaternion(player._tank.model.quaternion);
            player._tank.collidedWithWalls = false;
            if(!player._tank._positiveMovement) {
                slideVector.multiplyScalar(-1);
            }

            for (let wallIndex = 0; wallIndex < walls.length; wallIndex++) {
                wall = walls[wallIndex];
                hitWall = this.checkCollisionBetwennCollisionShapes(wall.collisionShape, player._tank.collisionShape);
                dotProduct = this.#dotProductBetweenTankDirectionAndVectorPosition(slideVector, wall.model.position, player._tank.model.position);

                if(hitWall && dotProduct > 0) {
                    theImpactWasInThehorizontal = this.#theCollisionWasInTheHorizontal(wall.model.position, player._tank.model.position);

                    if(theImpactWasInThehorizontal && !horizontal) {
                        horizontal = true;
                        slideVector.x = 0;
                    }
                    else if(!theImpactWasInThehorizontal && !vertical) {
                        vertical = true;
                        slideVector.z = 0;
                    }

                    player._tank.collidedWithWalls = true;
                }
            }
            player._tank.slideVector = slideVector.normalize();
        }
    }

    #theCollisionWasInTheHorizontal(wallPosition, tankPosition) {
        const x_distance = wallPosition.x - tankPosition.x;
        const z_distance = wallPosition.z - tankPosition.z;
        let direction; // true: Horizontal Orientation, false: Vertical Orientation

        if (Math.abs(x_distance) > Math.abs(z_distance)) {
            direction = true;
        } else {
            direction = false;
        }

        return direction;
    }

    // t = w - t
    #dotProductBetweenTankDirectionAndVectorPosition(tankDirection, wallPosition, tankPosition) {
        let t = new THREE.Vector3(wallPosition.x - tankPosition.x, wallPosition.y - tankPosition.y, wallPosition.z - tankPosition.z);

        return tankDirection.dot(t);
    }
}