import * as THREE from "three";
import { CSG } from "../../../../../libs/other/CSGMesh.js";

export function createTurret(
    _x,
    _y,
    _z,
    floorColor = "#303030",
    bodyColor = "red",
    cannonColor = "white"
) {
    let material = new THREE.MeshPhongMaterial({ color: "white" });

    let halfCapsuleObject;

    function createFloor(blockWidth = 17) {
        let floorGeometry = new THREE.BoxGeometry(blockWidth, 4, blockWidth);
        floorGeometry.translate(0, 2, 0);

        let floor = new THREE.Mesh(floorGeometry);
        floor.material = new THREE.MeshPhongMaterial({
            color: floorColor,
        });

        let invisible = new THREE.BoxGeometry(17, 17, 17);

        // Create an invisible material
        let invisibleMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000, // The color doesn't matter because the material will be transparent
            transparent: true,
            opacity: 0, // Set opacity to 0 to make it invisible
        });

        // Create the mesh with the geometry and invisible material
        invisible = new THREE.Mesh(invisible, invisibleMaterial);

        floor.add(invisible);

        floor.castShadow = true;

        //base
        let base = createHalfCapsule(1, 0.7, 1);
        base.material = new THREE.MeshPhongMaterial({
            color: darkenColor(bodyColor, 0.9),
        })
        base.translateY(2);
        floor.add(base);
        return floor;
    }

    function createMid() {
        //mid
        let bodyGeometry = new THREE.SphereGeometry(5, 8, 8);
        bodyGeometry.translate(0, 9, 0);

        //mid
        let backGeometry = new THREE.SphereGeometry(2, 8, 8);
        backGeometry.translate(0, 9, -5);

        let outerWidth = 0.7;
        let outerLength = 0.8;
        let cannonHole = createHalfCapsule(outerWidth, outerLength, outerWidth);
        cannonHole.rotateX((3 * Math.PI) / 2);
        cannonHole.translateY(-8);
        cannonHole.translateZ(9.5);

        cannonHole.updateMatrix();

        let bodyCSG = CSG.fromGeometry(bodyGeometry);
        let backCSG = CSG.fromGeometry(backGeometry);
        let holeCSG = CSG.fromMesh(cannonHole);

        let midCSG = bodyCSG.subtract(holeCSG);
        midCSG = midCSG.union(backCSG);

        let mid = CSG.toMesh(midCSG, new THREE.Matrix4());
        mid.material = new THREE.MeshPhongMaterial({
            color: darkenColor(bodyColor, 0.7),
        });
        return mid;
    }

    function createCannon() {
        let outerWidth = 0.2;
        let outerLength = 0.8;

        let outerCapsule = createHalfCapsule(
            outerWidth,
            outerLength,
            outerWidth
        );
        outerCapsule.rotateX((3 * Math.PI) / 2);

        let innerWidth = 0.1;
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
    let floor = createFloor(17);

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

    floor.position.set(_x, _y, _z);
    mid.position.set(_x, _y + 2, _z);

    return {
        base: floor,
        body: mid,
    };
}

function darkenColor(rgbString, factor) {
    // Parse the RGB string into a Three.js color object
    const color = new THREE.Color(rgbString);

    // Darken the color by multiplying its components by the factor
    color.r *= 1 - factor;
    color.g *= 1 - factor;
    color.b *= 1 - factor;

    // Return the darkened color as an RGB string
    return color.getStyle();
}