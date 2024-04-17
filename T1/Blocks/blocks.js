import * as THREE from 'three';

export class CollisionBlock{
    constructor() {
        this.collisionShape = null;
    }

    createCollisionShape(model,min,max) {
        try {
            let collisionShape = new THREE.Box3().setFromObject(model);
            // collisionShape.set(min,max)
            this.model = model;
            this.collisionShape = collisionShape;
        } catch (error) {
            console.log("Error while creating Collision Shape: " + error);
        }
    }
}