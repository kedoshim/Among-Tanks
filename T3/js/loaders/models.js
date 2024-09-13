import * as THREE from "three"
import { GLTFLoader } from "../../../build/jsm/loaders/GLTFLoader.js";
import { getMaxSize } from "../../../libs/util/util.js";
import { Color, MeshLambertMaterial } from "../../../build/three.module.js";

export function loadGLBFile(
    asset,
    file,
    desiredScale,
    scene,
    position = { x: 0, y: 0, z: 0 },
    rotation
) {
    let loader = new GLTFLoader();
    loader.load(
        file,
        function (gltf) {
            let obj = gltf.scene;
            obj.traverse(function (child) {
                if (child.isMesh) {
                    child.castShadow = false;
                    child.material = new MeshLambertMaterial({
                        color: child.material.color,
                    })
                }
            });
            obj = normalizeAndRescale(obj, desiredScale);
            //obj = fixPosition(obj);
            obj.updateMatrixWorld(true);
            obj.position.set(position.x, position.y, position.z);
            obj.rotation.set(0, -THREE.MathUtils.degToRad(rotation + 90), 0);
            scene.add(obj);

            // Store loaded gltf in our js object
            asset.object = gltf.scene;
        },
        null,
        null
    );
}

// Normalize scale and multiple by the newScale
function normalizeAndRescale(obj, newScale)
{
  var scale = getMaxSize(obj); // Available in 'utils.js'
  obj.scale.set(newScale * (1.0/scale),
                newScale * (1.0/scale),
                newScale * (1.0/scale));
  return obj;
}