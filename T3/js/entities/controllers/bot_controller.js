import { Controller } from "./controller.js";

export class BotController extends Controller{
    /**
     * @param {THREE.js Object} model
     * @param {list} plazers
     * @param {list} bots
     * @param {list} walls
     * @param {Object} shootParams
     */
    constructor(player_tank,index) {
        super(player_tank)

        this.index = index;

        // if (!shootParams) {
        //     shootParams = {
        //         bulletSpeed: 2,
        //         damage: 1,
        //         shootCooldown: 3000,
        //     };
        // }

        // self.shootParams = shootParams;
        // this._lastShootTime = 0;

        this._projectiles = [];

        this._nextMove = {
            isDirectional: false,
            rotation: 0,
            movement: 0,
            moveX: 0,
            moveZ: 0,
        };

        this.isMoving = false;
    }

    control(input = {}, AI = null) {
        if (AI == null) {
            console.warn(
                `Tried to control Bot ${this.index + 1} but their 'AI' attribute was 'null'`
            );
            return;
        }
        AI.nextAction(this.index);

        this.isMoving = true;
        this.move();
    }

    setNextMove(nextMove) {
        this._nextMove = nextMove;
    }

    move() {
        if (this._target.health == 0) {
            return;
        }
        if (this._nextMove.isDirectional) {
            this._target._tank.moveDirectional(
                this._nextMove.moveX,
                this._nextMove.moveZ
            );
        } else {
            this._target.moveRotating(
                this._nextMove.movement,
                this._nextMove.rotation,
                this.isMoving
            );
        }

        this.resetMove();
    }

    resetMove() {
        this._nextMove = {
            isDirectional: false,
            rotation: 0,
            movement: 0,
            moveX: 0,
            movez: 0,
        };
    }

    rotateLeft() {
        this._nextMove.rotation -= 1;
    }

    rotateRight() {
        this._nextMove.rotation += 1;
    }

    forward() {
        this._nextMove.movement += 1;
    }

    reverse() {
        this._nextMove.movement -= 1;
    }

    shoot() {
        if (this._target.health > 0) {
            this._target.shoot();
        }
    }
}
