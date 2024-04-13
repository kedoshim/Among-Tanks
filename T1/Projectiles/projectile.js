import * as THREE from 'three';
import { setDefaultMaterial } from "../../libs/util/util.js";

export class Projectile {
    constructor(position, direction, speed=1.0, damage=1, ricochetsAmount=2, color="white") {
        this.damage = damage;
        this.speed = speed;
        this.ricochetsAmount = ricochetsAmount;
        this.ricochetsLeft = ricochetsAmount;
        this.hitAnyTank = false;
        this.alreadyInScene = false;
        this.direction = direction.normalize();

        this.projectile = this.build_projectile(1, color);
        this.projectile.position.set(position.x, position.y - 3, position.z);

        this.collisionShape = new THREE.Box3().setFromObject(this.projectile);
    }

    setDirection(direction) {
        this.direction = direction.normalize();
    }

    hitTank() {
        this.hitAnyTank = true;
    }

    hitWall() {
        this.ricochetsLeft -= 1;
    }

    isAlreadyInScene() {
        return this.alreadyInScene;
    }

    setAlreadyInScene(value) {
        this.alreadyInScene = value;
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
        let projectile_sphere = new THREE.SphereGeometry(radius);
        let material = setDefaultMaterial(color);
        return new THREE.Mesh(projectile_sphere, material);
    }

    moveStep() {
        let step = this.direction.clone().multiplyScalar(this.speed);
        this.projectile.position.add(step);
        this.collisionShape = null;
        this.collisionShape = new THREE.Box3().setFromObject(this.projectile);
    }

    reflection(vector) {
        this.direction.reflect(vector).normalize();
    }
}