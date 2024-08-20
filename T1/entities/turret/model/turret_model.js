import * as THREE from "three";
import { CSG } from "../../../../libs/other/CSGMesh.js";

let cachedTurret = null;

export function createTurret() {
    if (cachedTurret)
        return cachedTurret.clone();
    
    function createBaseCSG(width = 4) {
        let cilynderGeometry = new THREE.CylinderGeometry(width, width, 1);
        let cilynder = new THREE.Mesh(cilynderGeometry, material);
        cilynder.position.set(0.0, 0.5, 0.0);

        let cubeGeometry = new THREE.BoxGeometry(
            width * 1.5,
            width * 3,
            width * 1.5
        );
        let cube1 = new THREE.Mesh(cubeGeometry, material);
        let cube2 = new THREE.Mesh(cubeGeometry, material);
        let cube3 = new THREE.Mesh(cubeGeometry, material);
        let cube4 = new THREE.Mesh(cubeGeometry, material);
        let d = width * 1.6;
        cube1.position.set(0.0, 0, d);
        cube2.position.set(0.0, 0, -d);
        cube3.position.set(d, 0, 0);
        cube4.position.set(-d, 0, 0);

        cilynder.updateMatrix();

        cube1.updateMatrix();
        cube2.updateMatrix();
        cube3.updateMatrix();
        cube4.updateMatrix();

        let cilynderCSG = CSG.fromMesh(cilynder);

        let cube1CSG = CSG.fromMesh(cube1);
        let cube2CSG = CSG.fromMesh(cube2);
        let cube3CSG = CSG.fromMesh(cube3);
        let cube4CSG = CSG.fromMesh(cube4);

        let baseCSG = cilynderCSG.subtract(cube1CSG);
        baseCSG = baseCSG.subtract(cube2CSG);
        baseCSG = baseCSG.subtract(cube3CSG);
        baseCSG = baseCSG.subtract(cube4CSG);

        let base = CSG.toMesh(baseCSG, new THREE.Matrix4());
        base.material = new THREE.MeshPhongMaterial({ color: "gray" });

        return base;
    }

    function createSupportCSG(x, z, y, height = 3) {
        let cilynder1Geometry = new THREE.CylinderGeometry(0.6, 1, height);
        let cilynder1 = new THREE.Mesh(cilynder1Geometry, material);
        cilynder1.position.set(-0.1, 2, 0.0);
        // scene.add(cilynder1);

        let cilynder2Geometry = new THREE.CylinderGeometry(0.6, 1, height);
        let cilynder2 = new THREE.Mesh(cilynder2Geometry, material);
        cilynder2.position.set(0.1, 2, 0.0);
        // scene.add(cilynder2);

        let cubeGeometry = new THREE.BoxGeometry(1.3, height, 1.1);
        let cube1 = new THREE.Mesh(cubeGeometry, material);
        cube1.position.set(0, 2, 0.0);
        // scene.add(cube1);

        let cilynder1CSG = CSG.fromMesh(cilynder1);
        let cilynder2CSG = CSG.fromMesh(cilynder2);

        let cube1CSG = CSG.fromMesh(cube1);

        let barCSG = cilynder1CSG.intersect(cilynder2CSG);
        barCSG = barCSG.intersect(cube1CSG);

        let bar = CSG.toMesh(barCSG, new THREE.Matrix4());
        bar.material = new THREE.MeshPhongMaterial({ color: "white" });

        bar.position.set(x, z, y);

        // scene.add(bar);
        return bar;
    }

    function createCannonCSG(x, z, y) {
        let yPos = 0;
        let h = 0;
        //cannon center
        let centerThickness = 2.4;
        let cilynder1Geometry = new THREE.CylinderGeometry(
            centerThickness,
            centerThickness,
            7
        );
        let cilynder1 = new THREE.Mesh(cilynder1Geometry, material);
        cilynder1.position.set(0, h + centerThickness / 2, yPos);
        cilynder1.rotateX(Math.PI / 2);

        //cannon thin
        let thinThickness = 1.4;
        let cilynder2Geometry = new THREE.CylinderGeometry(
            thinThickness,
            thinThickness,
            7
        );
        let cilynder2 = new THREE.Mesh(cilynder2Geometry, material);
        cilynder2.position.set(0, h + centerThickness / 2, yPos + 4);
        cilynder2.rotateX(Math.PI / 2);

        //cannon tip
        let tipThickness = 1.9;
        let cilynder3Geometry = new THREE.CylinderGeometry(
            tipThickness,
            tipThickness,
            4.5
        );
        let cilynder3 = new THREE.Mesh(cilynder3Geometry, material);
        cilynder3.position.set(0, h + centerThickness / 2, yPos + 9.5);
        cilynder3.rotateX(Math.PI / 2);

        //cannon inside
        let insideThickness = thinThickness - 0.5;
        let cilynder4Geometry = new THREE.CylinderGeometry(
            insideThickness,
            insideThickness,
            10
        );
        let cilynder4 = new THREE.Mesh(cilynder4Geometry, material);
        cilynder4.position.set(0, h + centerThickness / 2, yPos + 8);
        cilynder4.rotateX(Math.PI / 2);

        let radius1 = 2.1;
        let radius2 = radius1 * 0.3;
        let torusGeometry = new THREE.TorusGeometry(radius1, radius2);
        let torus = new THREE.Mesh(torusGeometry, material);
        torus.position.set(0, h + 0.5 + centerThickness / 2, yPos - 4.8);
        torus.scale.set(1.6, 1, 1.3);
        torus.rotateY(Math.PI / 2);

        radius1 = 0.8;
        radius2 = radius1 * 0.5;
        let q = 1.5;
        let miniTorusGeometry = new THREE.TorusGeometry(
            radius1,
            radius2,
            undefined,
            undefined,
            Math.PI * 1.3
        );
        let miniTorus1 = new THREE.Mesh(miniTorusGeometry, material);
        miniTorus1.position.set(q, h - 0.8, 0);
        miniTorus1.rotateZ(3 * (Math.PI / 2));

        let miniTorus2 = new THREE.Mesh(miniTorusGeometry, material);
        miniTorus2.position.set(-q, h - 0.8, 0);
        miniTorus2.rotateZ((Math.PI / 2) * 0.7);

        let cubeGeometry = new THREE.BoxGeometry(1, 5, 20);
        let cube1 = new THREE.Mesh(cubeGeometry, material);
        cube1.position.set(q + 0.7, h + 0.5 + centerThickness / 2, 5);
        let cube2 = new THREE.Mesh(cubeGeometry, material);
        cube2.position.set(-(q + 0.7), h + 0.5 + centerThickness / 2, 5);

        cilynder1.updateMatrix();
        cilynder2.updateMatrix();
        cilynder3.updateMatrix();
        cilynder4.updateMatrix();
        torus.updateMatrix();
        miniTorus1.updateMatrix();
        miniTorus2.updateMatrix();
        cube1.updateMatrix();
        cube2.updateMatrix();

        // scene.add(cilynder1);
        // scene.add(cilynder2);
        // scene.add(cilynder3);
        // scene.add(cilynder4);
        // scene.add(torus);
        // scene.add(miniTorus1);
        // scene.add(miniTorus2);
        // scene.add(cube1);
        // scene.add(cube2);

        let cilynder1CSG = CSG.fromMesh(cilynder1);
        let cilynder2CSG = CSG.fromMesh(cilynder2);
        let cilynder3CSG = CSG.fromMesh(cilynder3);
        let cilynder4CSG = CSG.fromMesh(cilynder4);

        let torusCSG = CSG.fromMesh(torus);
        let miniTorus1CSG = CSG.fromMesh(miniTorus1);
        let miniTorus2CSG = CSG.fromMesh(miniTorus2);

        let cube1CSG = CSG.fromMesh(cube1);
        let cube2CSG = CSG.fromMesh(cube2);

        let cannonCSG = cilynder1CSG.union(cilynder2CSG);
        cannonCSG = cannonCSG.union(cilynder3CSG);
        cannonCSG = cannonCSG.union(torusCSG);
        cannonCSG = cannonCSG.subtract(cube1CSG);
        cannonCSG = cannonCSG.subtract(cube2CSG);
        cannonCSG = cannonCSG.union(miniTorus1CSG);
        cannonCSG = cannonCSG.union(miniTorus2CSG);
        cannonCSG = cannonCSG.subtract(cilynder4CSG);

        let cannon = CSG.toMesh(cannonCSG, new THREE.Matrix4());
        cannon.material = new THREE.MeshPhongMaterial({ color: "gray" });
        cannon.position.set(x, z, y);

        // scene.add(cannon);
        return cannon;
    }

    //base
    let base = createBaseCSG();

    //4 supports
    let supports = new THREE.Mesh();
    let d = 2;
    let h = 2;
    let support1 = createSupportCSG(0, h, d);
    let support2 = createSupportCSG(0, h, -d);
    let support3 = createSupportCSG(d, h, 0);
    let support4 = createSupportCSG(-d, h, 0);
    support3.rotateY(Math.PI / 2);
    support4.rotateY(Math.PI / 2);
    supports.add(support1, support2, support3, support4);
    base.add(supports);

    //base
    let base2 = createBaseCSG(3.1);
    base2.position.set(0, h + 1, 0);
    base.add(base2);

    let base3 = createBaseCSG(2);
    base3.position.set(0, h + 1.5, 0);
    base.add(base3);

    //cannon
    let cannon = createCannonCSG(0, 5.8, 0);
    base.add(cannon);

    return base;

    cachedTurret = base;
}