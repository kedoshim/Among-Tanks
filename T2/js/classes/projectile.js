import * as THREE from "three";
import { setDefaultMaterial } from "../../../libs/util/util.js";

export class Projectile {
    constructor(
        position,
        direction,
        speed = 0.1,
        damage = 1,
        ricochetsAmount = 2,
        size = 1,
        isTurretProjectile = false,
        color = "white"
    ) {
        this.damage = damage;
        this.speed = speed;
        this.ricochetsAmount = ricochetsAmount;
        this.ricochetsLeft = ricochetsAmount;
        this.hitAnyTank = false;
        this.alreadyInScene = false;
        this.direction = direction.normalize();

        this.isTurretProjectile = isTurretProjectile;

        this.projectile = this.build_projectile(size, color); // modelo do projétil
        this.projectile.position.set(position.x, position.y + 2, position.z);
        this.lastPosition = new THREE.Vector3(
            position.x,
            position.y - 3,
            position.z
        );

        this.collisionShape = new THREE.Box3().setFromObject(this.projectile);

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

    hitTurretWall() {
        this.ricochetsLeft = 0;
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

    // Cria uma esfera para representar o projétil
    build_projectile(radius, color) {
        let projectile_sphere = new THREE.SphereGeometry(radius);
        let material = new THREE.MeshPhongMaterial({color:"white",emissive:"#aaaaaa"})
        const model = new THREE.Mesh(projectile_sphere, material);
        model.castShadow = true;
        return model;
    }

    moveStep() {
        let step = this.direction.clone().multiplyScalar(this.speed);
        this.lastPosition = new THREE.Vector3(
            this.projectile.position.x,
            this.projectile.position.y,
            this.projectile.position.z
        );
        this.projectile.position.add(step);
        this.collisionShape = null;
        this.collisionShape = new THREE.Box3().setFromObject(this.projectile);
    }

    reflection(vector) {
        this.direction.reflect(vector).normalize();
    }
}
