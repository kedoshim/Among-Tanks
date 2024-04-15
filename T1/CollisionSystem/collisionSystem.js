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
  constructor(players, walls = null) {
    super(players, walls);
    this._projectiles = [];
  }

  #getAllProjectilesInScene() {
    let players = this.players;
    let player = null;
    let projectiles = [];

    for (let playerIndex = 0; playerIndex < players.length; playerIndex++) {
      player = players[playerIndex];
      for (
        let projectileIndex = 0;
        projectileIndex < player._tank.projectiles.length;
        projectileIndex++
      ) {
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
      for (
        let projectileIndex = 0;
        projectileIndex < projectiles.length;
        projectileIndex++
      ) {
        hitTank = this.checkCollisionBetwennCollisionShapes(
          player._tank.collisionShape,
          projectiles[projectileIndex].collisionShape
        );

        if (hitTank) {
          projectiles[projectileIndex].hitTank();
          player.health -= projectiles[projectileIndex].damage;
          if (player.health < 0) player.health = 0;
        //   console.log(player);
        }
      }
    }
  }

  checkCollisionWithWalls() {
    let walls = this.walls;
    let wall = null;

    this.#getAllProjectilesInScene();
    let projectiles = this._projectiles;

    for (
      let projectileIndex = 0;
      projectileIndex < projectiles.length;
      projectileIndex++
    ) {
      for (let wallIndex = 0; wallIndex < walls.length; wallIndex++) {
        wall = walls[wallIndex];
        hitWall = this.checkCollisionBetwennCollisionShapes(
          wall.collisionShape,
          projectiles[projectileIndex].collisionShape
        );

        if (hitWall) {
          projectiles[projectileIndex].reflection(wall.position);
          projectiles[projectileIndex].hitWall();
        }
      }
    }
  }
}

export class TankCollisionSystem extends CollisionSystem {
  constructor(players, walls) {
    super(players, walls);
  }
}
