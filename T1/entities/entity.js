/**
* Represents players and enemies
*/
export class Entity {
  static entityNumber = 0;
  constructor(name = "", spawnPoint = [0, 0], tank = null, controller = null) {
    this._name = name || `Entity_${Entity.entityNumber}`;
    this._spawnPoint = spawnPoint;
    this._tank = tank;
    this._controller = controller;

    Entity.entityNumber++;
  }

  runController(keyboard) {
    this._controller.control(keyboard);
  }

  loadPlayer(scene) {
    scene.add(this._tank._model);

    let [x, z] = this._spawnPoint;

    this._tank._model.position.x = x;
    this._tank._model.position.z = z;
  }

  loadProjectile(scene) {
    // TODO: carregar os projéteis na cena
    let projectile = this._tank.projectiles[this._tank.projectiles.lenght - 1];
    scene.add(projectile);
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

  set tank(tank) {
    this._tank = model;
  }

  get tank() {
    return this._tank;
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