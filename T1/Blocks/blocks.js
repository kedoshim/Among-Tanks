import * as THREE from 'three';

export class Block {
    constructor(position, BLOCK_SIZE) {
        this.BLOCK_SIZE = BLOCK_SIZE;
        this.position_x = position.x;
        this.position_y = position.y;
        this.position_z = position.z;
        this._model = null;
    }

    /**
     * 
     * @param {Object} offset 
     * @param {Object} color 
     */
    createBlock(offset, color) {
        let {x, y} = offset;
        const BLOCK_SIZE = this.BLOCK_SIZE;
        const i = this.position_x;
        const j = this.position_z;
        const k = this.position_y;
    
        const geometry = new THREE.BoxGeometry(BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE); 
        const material = new THREE.MeshBasicMaterial(color); 
    
        let cube = new THREE.Mesh(geometry, material);
    
        // Defina as coordenadas x, y e z da posição do cubo
        cube.position.x = -(BLOCK_SIZE * (Math.abs(i - x)));
        cube.position.y = k;
        cube.position.z = -(BLOCK_SIZE * (Math.abs(j - y)));
    
        this._model = cube;
    }

    get model() {
        return this._model;
    }
}

export class CollisionBlock extends Block {
    constructor(position, BLOCK_SIZE) {
        super(position, BLOCK_SIZE);
        this.collisionShape = null;
    }

    createCollisionShape() {
        try {
            const collisionShape = new THREE.Box3().setFromObject(this._model);
            this.collisionShape = collisionShape;
        } catch (error) {
            console.log("Não foi possível criar o collisionShape: " + error);
        }
    }
}