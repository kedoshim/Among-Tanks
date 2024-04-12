// import { Scene } from "../../../build/three.module.js";
import KeyboardState from "../../../libs/util/KeyboardState.js";
import { Controller } from "./controllers/controller.js";
import { Tank } from "./tanks/tank.js";

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
  constructor(name = "", spawnPoint = [0, 0], tank = null, controller = null) {
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
  runController(keyboard, gamepad) {
    if (this._controller == null) {
      console.warn(
        `Tried to control Entity ${this._name} but their '_controller' attribute was 'null'`
      );
      return;
    }

    this._controller.control(keyboard, gamepad);
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
    return this.spawnPoint;
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
}
