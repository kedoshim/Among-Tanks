import * as THREE from "three";
import { setDefaultMaterial } from "../../libs/util/util.js";

export class Projectile {
    constructor(
        position,
        direction,
        speed = 0.1,
        damage = 1,
        ricochetsAmount = 2,
        color = "white"
    ) {
        this.id = Date.now() + Math.floor(Math.random() * 9);
        this.damage = damage;
        this.speed = speed;
        this.ricochetsAmount = ricochetsAmount;
        this.ricochetsLeft = ricochetsAmount;
        this.hitAnyTank = false;
        this.alreadyInScene = false;
        this.direction = direction.normalize();

        this.model = this.build_projectile(1, color); // modelo do projétil
        this.model.position.set(position.x, position.y - 3, position.z);
        this.lastPosition = new THREE.Vector3(
            position.x,
            position.y - 3,
            position.z
        );

        this.collisionShape = new THREE.Box3().setFromObject(this.model);

        this.previousPosition = null;
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

    getModel() {
        return this.model;
    }

    getPosition() {
        return this.position;
    }

    getCollisionShape() {
        return this.collisionShape;
    }

    // Cria uma esfera para representar o projétil
    build_projectile(radius, color) {
        let projectile_sphere = new THREE.SphereGeometry(radius);
        let material = setDefaultMaterial(color);
        return new THREE.Mesh(projectile_sphere, material);
    }

    moveStep() {
        let step = this.direction.clone().multiplyScalar(this.speed);
        this.lastPosition = new THREE.Vector3(
            this.model.position.x,
            this.model.position.y,
            this.model.position.z
        );
        this.model.position.add(step);
        this.collisionShape = null;
        this.collisionShape = new THREE.Box3().setFromObject(this.model);
    }

    reflection(vector) {
        this.direction.reflect(vector).normalize();
    }
}
