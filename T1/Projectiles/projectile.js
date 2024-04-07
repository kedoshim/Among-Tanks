import * as THREE from 'three';
import { setDefaultMaterial } from "../libs/util/util.js";

class Projectile {
    constructor(position, direction, speed=0.5, damage=1, ricochetsAmount=2, color="white") {
        this.damage = damage;
        this.speed = speed;
        this.ricochetsAmount = ricochetsAmount;
        this.ricochetsLeft = ricochetsAmount;
        this.direction = direction.normalize();

        this.projectile = this.build_projectile(0.5, color);
        this.projectile.position.set(position);

        this.collisionShape = new THREE.Box3().setFromObject(this.projectile);
    }

    setDirection(direction) {
        this.direction = direction.normalize();
    }

    getProjectile() {
        return this.projectile;
    }

    getPosition() {
        return this.position;
    }

    getCollisionShape() {
        return this.collisionShape;
    }

    build_projectile(radius, color) {
        const projectile_sphere = new THREE.SphereGeometry(radius);
        const material = setDefaultMaterial(color);
        return new THREE.Mesh(projectile_sphere, material);
    }

    moveStep() {
        let step = this.direction.clone().multiplyScalar(this.speed);
        this.projectile.position.add(step);
        this.collisionShape = new THREE.Box3().setFromObject(this.projectile);
    }
}