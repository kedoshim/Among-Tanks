


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
    constructor(players, map) {
        super(players, map);
    }
}

class TankCollisionSystem extends CollisionSystem {
    constructor(players, map) {
        super(players, map);
    }
}