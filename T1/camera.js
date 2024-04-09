import * as THREE from "three";
import { OrbitControls } from "../build/jsm/controls/OrbitControls.js";

export class CameraControls {
  constructor(renderer) {
    this._camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    );
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

  changeCameraMode() {
    if (this._orbit.enabled == false)
      this.enableOrbitControls();
    else
      this.disableOrbitControls();
  }

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
    extremes.minZ -= this._padding/(this._height/100);

    // console.log(extremes);
    return extremes;
  }

  _calculateHeight(point1, point2) {
    let distanceX = Math.abs(point1[0] - point2[0]);
    let distanceZ = Math.abs(point1[1] - point2[1]);

    let height = this._camera.position.y;
    let xVirtualDistance = distanceX / this._camera.aspect;
    if (xVirtualDistance < distanceZ)
      height = distanceZ / (Math.tan(THREE.MathUtils.degToRad(22, 5)) * 2);
    else {
      height =
        xVirtualDistance / (Math.tan(THREE.MathUtils.degToRad(22, 5)) * 2);
    }
    // console.log(height);
    return height;
  }

  _calculateMediumPoint(point1, point2) {
    let mediumX = (point1[0] + point2[0]) / 2;
    let mediumZ = (point1[1] + point2[1]) / 2;

    return [mediumX, mediumZ];
  }

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
    this._camera.position.z =
      this._mediumPoint[1] + this._height / 4;
    this._camera.lookAt(
      new THREE.Vector3(this._mediumPoint[0], 0, this._mediumPoint[1])
    );
  }

  get camera() {
    return this._camera;
  }

  set camera(camera) {
    this._camera = camera;
  }
}
