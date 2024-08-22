import * as THREE from "three";
import { CSG } from "../../../../libs/other/CSGMesh.js";

export function createTurret(
    _x,
    _y,
    _z,
    floorColor = "gray",
    bodyColor = "red",
    cannonColor = "white"
) {
    let material = new THREE.MeshPhongMaterial({ color: "white" });

    let halfCapsuleObject;

    function createBase(blockWidth = 17) {
        let floorGeometry = new THREE.BoxGeometry(blockWidth, 4, blockWidth);
        floorGeometry.translate(0, 2, 0);

        let base = new THREE.Mesh(floorGeometry);
        base.material = new THREE.MeshPhongMaterial({
            color: floorColor,
        });
        base.castShadow = true;
        return base;
    }

    function createMid() {
        //mid
        let bodyGeometry = new THREE.SphereGeometry(5, 8, 8);
        bodyGeometry.translate(0, 9, 0);

        //base
        let halfCapsule = createHalfCapsule(1, 0.7, 1);
        halfCapsule.translateY(2);

        halfCapsule.updateMatrix();

        let bodyCSG = CSG.fromGeometry(bodyGeometry);
        let halfCapsuleCSG = CSG.fromMesh(halfCapsule);

        let midCSG = halfCapsuleCSG.union(bodyCSG);

        let mid = CSG.toMesh(midCSG, new THREE.Matrix4());
        mid.material = new THREE.MeshPhongMaterial({
            color: bodyColor,
        });
        mid.castShadow = true;
        return mid;
    }

    function createCannon() {
        let outerWidth = 0.7;
        let outerLength = 0.8;

        let outerCapsule = createHalfCapsule(
            outerWidth,
            outerLength,
            outerWidth
        );
        outerCapsule.rotateX((3 * Math.PI) / 2);

        let innerWidth = 0.4;
        let innerLength = 0.6;

        let innerCapsule = createHalfCapsule(
            innerWidth,
            innerLength,
            innerWidth
        );
        innerCapsule.rotateX((3 * Math.PI) / 2);

        outerCapsule.updateMatrix();
        innerCapsule.updateMatrix();

        let outerCSG = CSG.fromMesh(outerCapsule);
        let innerCSG = CSG.fromMesh(innerCapsule);

        let cannonCSG = outerCSG.subtract(innerCSG);

        let cannon = CSG.toMesh(cannonCSG, new THREE.Matrix4());
        cannon.material = new THREE.MeshPhongMaterial({
            color: cannonColor,
        });
        cannon.castShadow = true;
        return cannon;
    }

    function createAmogus() {
        let amogus = createHalfCapsule(0.5, 0.6, 0.5);
        amogus.material = new THREE.MeshPhongMaterial({
            color: bodyColor,
        });

        let amogusFaceGeometry = new THREE.SphereGeometry(4, 8, 8);
        let amogusFace = new THREE.Mesh(amogusFaceGeometry);
        amogusFace.material = new THREE.MeshPhongMaterial({
            color: "white",
        });
        amogusFace.castShadow = true;
        amogusFace.scale.set(1, 0.5, 1);
        amogus.add(amogusFace);
        amogusFace.position.set(0, 3, 3);

        amogus.castShadow = true;
        return amogus;
    }

    function createHalfCapsule(scaleX = 1, scaleY = 1, scaleZ = 1) {
        // Check if halfCapsuleObject exists, and if so, clone it
        if (halfCapsuleObject) {
            let newObject = halfCapsuleObject.clone();
            newObject.geometry = halfCapsuleObject.geometry.clone();
            newObject.scale.set(scaleX, scaleY, scaleZ);
            return newObject;
        }

        // If halfCapsuleObject doesn't exist, create it
        let capsuleGeometry = new THREE.CapsuleGeometry(6, 3);
        capsuleGeometry.translate(0, 0, 0); // Translate capsuleGeometry before converting to CSG

        let boxGeometry = new THREE.BoxGeometry(15, 10, 15);
        boxGeometry.translate(0, 5, 0);

        let capsuleCSG = CSG.fromGeometry(capsuleGeometry);
        let boxCSG = CSG.fromGeometry(boxGeometry);

        let halfCapsuleCSG = capsuleCSG.intersect(boxCSG);
        halfCapsuleObject = CSG.toMesh(halfCapsuleCSG, new THREE.Matrix4());
        halfCapsuleObject.castShadow = true;

        return createHalfCapsule(scaleX, scaleY, scaleZ);
    }

    //base
    let base = createBase(17);

    //mid
    let mid = createMid();

    //cannon
    let cannon = createCannon();
    mid.add(cannon);
    cannon.position.set(0, 9.5, 8);

    //amogus
    let amogus = createAmogus();
    mid.add(amogus);
    amogus.translateY(13);

    base.position.set(_x, _y, _z)
    mid.position.set(_x, _y+2, _z)
    
    return {
        base: base,
        body: mid,
    };
}