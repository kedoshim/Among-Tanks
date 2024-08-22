export function createSkirtTank(tankColor, amogColor) {
  let tank = createAmogus(0, 0, amogColor);
  addBlowgun(tank, tankColor);
  addHelmet(tank, tankColor);
  let a = new THREE.SphereGeometry(
    9,
    100,
    50,
    0,
    Math.PI * 2,
    0,
    Math.PI / 3 //sets it to be a half sphere
  );
  let tankCenter = new THREE.Mesh(a, setDefaultMaterial(tankColor));
  tankCenter.position.set(0, -10, 0);
  tank.add(tankCenter);
  return tank;
}
