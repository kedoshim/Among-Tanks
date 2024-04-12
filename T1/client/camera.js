import * as THREE from "three";
import { OrbitControls } from "../../build/jsm/controls/OrbitControls.js";
import { Entity } from "./entities/entity.js";
import { getConfig } from "./config.js";

/**
 * Class used to manage the camera during the game
 */
export class CameraControls {
  /**
   * Creates an instance of CameraControls.
   *
   * @constructor
   * @param {THREE.WebGLRenderer} renderer
   */
  constructor(renderer) {
    const cameraConfig = getConfig().cameraConfig;

    this._camera = new THREE.PerspectiveCamera(
      cameraConfig.FOV,
      window.innerWidth / window.innerHeight,
      cameraConfig.near,
      cameraConfig.far
    );
    this._camera.name = "Main Camera";

    this._camera.position.copy(new THREE.Vector3(-30, 40, 30));
    this._mediumPoint = new THREE.Vector3(0, 0, 0);
    this._camera.lookAt(this._mediumPoint);
    this._padding = 20;
    this._height = 40;

    this._orbit = new OrbitControls(this._camera, renderer.domElement); // Enable mouse rotation, pan, zoom etc.
    this._orbit.enabled = false;
  }

  enableOrbitControls() {
    this._lastPosition = this._camera.position;
    this._orbit.enabled = true;
  }

  disableOrbitControls() {
    this._orbit.enabled = false;
    this._camera.position.copy(this._lastPosition);
  }

  /**
   * Activates or deactivates Orbit controls
   */
  changeCameraMode() {
    if (this._orbit.enabled == false) this.enableOrbitControls();
    else this.disableOrbitControls();
  }

  /**
   * Receives an array of players and calculates the edges of a rectangle that
   * contains all players
   *
   * @param {Array.<Entity>} players
   * @returns {{ maxX: number; minX: number; maxZ: number; minZ: number; }}
   */
  _getExtremes(players) {
    let extremes = {
      maxX: 0,
      minX: 0,
      maxZ: 0,
      minZ: 0,
    };

    players.forEach((player) => {
      let positionX = player.tank.model.position.x;

      let positionZ = player.tank.model.position.z;

      if (positionX > extremes.maxX) extremes.maxX = positionX;
      if (positionX < extremes.minX) extremes.minX = positionX;
      if (positionZ > extremes.maxZ) extremes.maxZ = positionZ;
      if (positionZ < extremes.minZ) extremes.minZ = positionZ;
    });
    extremes.maxX += this._padding;
    extremes.maxZ += this._padding;
    extremes.minX -= this._padding;
    extremes.minZ -= this._padding / (this._height / 100);

    // console.log(extremes);
    return extremes;
  }

  /**
   * Receives two coordinates and based on them, the camera FOV
   * and the window aspect ratio, calculates the height the camera
   * should be to show every player in the screen
   *
   * @param {Array.<number>} point1
   * @param {Array.<number>} point2
   * @returns {number}
   */
  _calculateHeight(point1, point2) {
    let distanceX = Math.abs(point1[0] - point2[0]);
    let distanceZ = Math.abs(point1[1] - point2[1]);

    let height = this._camera.position.y;
    const halfCameraAngle = this._camera.fov / 2


    let xVirtualDistance = distanceX / this._camera.aspect;
    if (xVirtualDistance < distanceZ)
      height = distanceZ / (Math.tan(THREE.MathUtils.degToRad(halfCameraAngle)) * 2);
    else {
      height =
        xVirtualDistance / (Math.tan(THREE.MathUtils.degToRad(halfCameraAngle)) * 2);
    }
    // console.log(height);
    return height;
  }

  /**
   * Receives two coordinates and calculates the
   * point perfectly between them
   *
   * @param {Array.<number>} point1
   * @param {Array.<number>} point2
   * @returns {Array.<number>}
   */
  _calculateMediumPoint(point1, point2) {
    let mediumX = (point1[0] + point2[0]) / 2;
    let mediumZ = (point1[1] + point2[1]) / 2;

    return [mediumX, mediumZ];
  }

  /**
   * Description placeholder
   *
   * @param {Array.<Entity>} players
   */
  calculatePosition(players) {
    if (this._orbit.enabled) {
      return;
    }
    let borders = this._getExtremes(players);

    const point1 = [borders.minX, borders.minZ];
    const point2 = [borders.maxX, borders.maxZ];
    this._mediumPoint = this._calculateMediumPoint(point1, point2);

    this._height = this._calculateHeight(point1, point2);

    this._camera.position.x = this._mediumPoint[0];
    this._camera.position.y = this._height;
    this._camera.position.z = this._mediumPoint[1] + this._height / 4;
    this._camera.lookAt(
      new THREE.Vector3(this._mediumPoint[0], 0, this._mediumPoint[1])
    );
  }

  /**
   * Gets the Camera being controlled
   */
  get camera() {
    return this._camera;
  }

  /**
   * Sets the Camera being controlled
   *
   * @type {THREE.PerspectiveCamera}
   */
  set camera(camera) {
    this._camera = camera;
  }
}
