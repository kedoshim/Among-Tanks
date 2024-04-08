import { Controller } from "./controllers/controller.js";

export class Entity {
  static entityNumber = 0;
  constructor(name = "", spawnPoint = [0, 0], model = null, controller = null) {
    this._name = name || `Entity_${Entity.entityNumber}`;
    this._spawnPoint = spawnPoint;
    this._model = model;
    this._controller = controller;

    Entity.entityNumber++;
  }

  runController(keyboard) {
    this._controller.control(keyboard);
  }

  load(scene) {
    scene.add(this._model._model);

    let [x, z] = this._spawnPoint;

    this._model._model.position.x = x;
    this._model._model.position.z = z;
  }

  set name(name) {
    this._name = name;
  }

  get name() {
    return this._name;
  }

  set spawnPoint(spawnPoint) {
    this._spawnPoint = spawnPoint;
  }

  get spawnPoint() {
    return this.spawnPoint;
  }

  set model(model) {
    this._model = model;
  }

  get model() {
    return this._model;
  }

  set controller(controller) {
    this._controller = controller;
  }

  get controller() {
    return this._controller;
  }

  get totalEntitiesNumber() {
    return Entity.entityNumber;
  }
}