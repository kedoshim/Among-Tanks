import { Scene } from "../../../build/three.module.js";
import KeyboardState from "../../../libs/util/KeyboardState.js";
import { Controller } from "./controllers/controller.js";
import { Tank } from "./tanks/tank.js";
import * as THREE from "three";

/**
 * Represents players and enemies
 */
export class Entity {
    /**
     * The number of created entities
     *
     * @static
     * @type {number}
     */
    static entityNumber = 0;
    /**
     * Creates an instance of Entity.
     *
     * @constructor
     * @param {string} [name=""] Entity's name
     * @param {Array.<number>} [spawnPoint=[0, 0]] [x,z] coordinates
     * @param {Tank} [tank=null] The tank assigned to the entity
     * @param {Controller} [controller=null] The controller assigned to the entity
     */
    constructor(
        name = "",
        spawnPoint = [0, 0],
        tank = null,
        controller = null
    ) {
        this._name = name || `Entity_${Entity.entityNumber}`;
        this._spawnPoint = spawnPoint;
        this._tank = tank;
        this._controller = controller;

        Entity.entityNumber++;
    }

    /**
     * Calls the controller with the specified inputs
     *
     * @param {KeyboardState} keyboard
     * @param {Gamepad} gamepad
     */
    runController(inputs = {}, AI = null) {
        if (this._controller == null) {
            console.warn(
                `Tried to control Entity ${this._name} but their '_controller' attribute was 'null'`
            );
            return;
        }

        this._controller.control(inputs, AI);
    }

    reset(scene) {
        this.tank.projectiles.forEach((projectile) => {
            scene.remove(projectile);
        });
        this._tank.reset();
    }

    /**
     * Loads entity's tanks in the provided scene
     *
     * @param {Scene} scene
     */
    load(scene) {
        if (this._tank == null) {
            console.warn(
                `Tried to load Entity ${this._name} but their '_tank' attribute was 'null'`
            );
            return;
        }

        scene.add(this._tank._model);

        let [x, z] = this._spawnPoint;

        this._tank._model.position.x = x;
        this._tank._model.position.z = z;

        this._tank._healthBar.createLifeBar();
        this._tank._healthBar.setHealthBarPosition(this._tank._model.position);

        scene.add(this._tank._healthBar.model);
    }

    loadHitBox(scene) {
        // Create a bounding box helper
        let helper = new THREE.Box3Helper(this.tank.collisionShape, "blue");
        scene.add(helper);

        return helper;
    }

    set name(name) {
        this._name = name;
    }
    // Getters

    /**
     * @type {string}
     */
    get name() {
        return this._name;
    }

    /**
     * @type {Array.<number>} [x,z] coordinates
     */
    get spawnPoint() {
        return this._spawnPoint;
    }

    /**
     * @type {Tank}
     */
    get tank() {
        return this._tank;
    }

    /**
     * @type {Controller}
     */
    get controller() {
        return this._controller;
    }

    /**
     * @readonly
     * @type {number}
     */
    get totalEntitiesNumber() {
        return Entity.entityNumber;
    }

    /**
     * @type {int}
     */
    get health() {
        return this._tank._health;
    }

    // Setters

    /**
     * @param {string} name
     */
    set name(name) {
        this._name = name;
    }

    /**
     * @param {Array.<number>} spawnPoint [x,z] coordinates
     */
    set spawnPoint(spawnPoint) {
        this._spawnPoint = spawnPoint;
    }

    /**
     * @param {Tank} tank
     */
    set tank(tank) {
        this._tank = tank;
    }

    /**
     * @param {Controller} controller
     */
    set controller(controller) {
        this._controller = controller;
    }

    /**
     * @param {int} health
     */
    set health(health) {
        this._tank._health = health;
    }
}
