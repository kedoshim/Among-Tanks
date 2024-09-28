import * as THREE from "three";

export class Portal {
    constructor(walls) {
        this.walls = walls;
        this.isOpen = false;
        this.playerPassThePortal = false;

        this.isAnimationFinished = false;
    }

    open() {
        if (this.isOpen) {
            return;
        }

        console.log("Abrindo")

        this.animateWall('open');

        if (this.isAnimationFinished)
            this.isOpen = true;
    }

    close() {
        if (!this.isOpen) {
            return;
        }

        this.animateWall('close');

        if (this.isAnimationFinished) {
            this.isOpen = false;
            this.playerPassThePortal = true;
        }
        
    }

    animateWall(instruction) {
        const step = 0.10;  // Velocidade de movimento por frame (ajustável)
        this.isAnimationFinished = false;

        for (let index = 0; index < this.walls.length; index++) {
            let wall = this.walls[index];
            let wallVerticalPosition = wall.model.position.y;

            if (instruction == 'open') {
                const endY = -wall.BLOCK_SIZE;
                console.log(endY)
                if (wallVerticalPosition > endY) {
                    wall.model.position.y -= step;
                    wall.createCollisionShape();
                    this.isAnimationFinished = false;
                }
                else {
                    this.isAnimationFinished = true;
                }
            }
            else if (instruction == 'close') {
                const endY = wall.BLOCK_SIZE - 4;
                if (wallVerticalPosition < endY) {
                    wall.model.position.y += step;
                    wall.createCollisionShape();
                    this.isAnimationFinished = false;
                }
                else {
                    this.isAnimationFinished = true;
                }
            }
        }
    }
}
