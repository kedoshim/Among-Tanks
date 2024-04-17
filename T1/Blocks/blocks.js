import * as THREE from 'three';

export class CollisionBlock{
    constructor(BLockSize) {
        this.blockSize = BLockSize
        this.collisionShape = null;
    }

    createCollisionShape(model,min,max) {
        try {
            let collisionShape = new THREE.Box3()
            collisionShape.set(min, max);
            model.geometry.boundingBox = collisionShape;
            this.model = model;
            this.collisionShape = collisionShape;
        } catch (error) {
            console.log("Error while creating Collision Shape: " + error);
        }
    }
}