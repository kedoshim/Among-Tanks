import * as THREE from "three";
import { setDefaultMaterial } from "../../../../../libs/util/util.js";
import { GLTFLoader } from "../../../../../build/jsm/loaders/GLTFLoader.js";
import { darkenColor } from "../../../utils.js";
import { MeshPhongMaterial } from "../../../../../build/three.module.js";

let cachedTank = null;

let material = new THREE.MeshPhongMaterial({ color: "white" });

export function preloadCommonTankModel() {
    return new Promise((resolve, reject) => {
        const loader = new GLTFLoader();

        loader.load(
            "./assets/models/tanks/turtle_tank.glb",
            function (gltf) {
                cachedTank = gltf.scene;
                const scaleFactor = 10;
                cachedTank.scale.set(scaleFactor, scaleFactor, scaleFactor);
                cachedTank.position.set(40, 11, 40);

                cachedTank.rotation.y = 0; // 180 degrees in radians

                cachedTank.traverse((node) => {
                    if (node.isMesh) {
                        node.castShadow = true;
                        node.receiveShadow = true;
                        let color = node.material.color;
                        let shine =
                            (100 - node.material.roughness * 1.2 * 100) / 2;
                        // console.log(shine);
                        node.material = new THREE.MeshPhongMaterial({
                            color: color,
                            shininess: shine,
                            specular: darkenColor(color, -0.3),
                        });
                    }
                });

                console.log("Model preloaded:", cachedTank.position);
                resolve(cachedTank);
            },
            undefined,
            function (error) {
                reject(error);
            }
        );
    });
}

export function createCommonTank(tankColor, amogColor, sus = false) {
    if (cachedTank) {
        //     console.log("Using cached tank model");

        // Clone the cached tank model
        const tankClone = cachedTank.clone();

        // Traverse the cloned tank model to create unique materials
        tankClone.traverse((child) => {
            if (child.isMesh) {
                // Check if the material is an array (multiple materials)
                if (Array.isArray(child.material)) {
                    child.material = child.material.map((material) =>
                        material.clone()
                    );
                } else {
                    // Single material
                    child.material = child.material.clone();
                }

                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        // Find the "Shell" object within the cloned model
        const shellObject = tankClone.getObjectByName("Shell");
        if (shellObject) {
            // Traverse the children of the "Shell" object to set color
            shellObject.children[0].material.color.set(tankColor);
            shellObject.children[1].material.color.set(
                darkenColor("Black", -0.7)
            );
        } else {
            console.warn(`"Shell" object not found in the tank model.`);
        }

        const cannonCaseObject = tankClone.getObjectByName("CannonCase");

        if (cannonCaseObject) {
            // Traverse the children of the "Shell" object to set color
            cannonCaseObject.traverse((child) => {
                if (child.isMesh) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach((material) => {
                            if (material.color) {
                                material.color.set(darkenColor(tankColor, 0.5));
                            }
                        });
                    } else if (child.material.color) {
                        child.material.color.set(darkenColor(tankColor, 0.5));
                    }
                }
            });
        } else {
            console.warn(`"Shell" object not found in the tank model.`);
        }

        const amogusObject = tankClone.getObjectByName("Amogus");
        if (amogusObject) {
            amogusObject.children[0].material.color.set(amogColor);
            amogusObject.material.color.set(amogColor);
            if (sus) {
                amogusObject.children[1].material.emissive.set(
                    darkenColor("#ff5050", 0.5)
                );
            }
            else {
                amogusObject.children[1].material.emissive.set(
                    darkenColor(amogusObject.children[1].material.color, 0.8)
                );
            }
        } else {
            console.warn(`"Amogus" object not found in the tank model.`);
        }

        const headObject = tankClone.getObjectByName("Head");
        if (headObject) {
            headObject.material.color.set(darkenColor(amogColor, -0.5));
        } else {
            console.warn(`"Head" object not found in the tank model.`);
        }
        const tailObject = tankClone.getObjectByName("Tail");
        if (tailObject) {
            tailObject.material.color.set(darkenColor(amogColor, -0.5));
        } else {
            console.warn(`"Tail" object not found in the tank model.`);
        }

        return tankClone;
    } else {
        console.error("Tank model is not yet loaded.");
        return null;
    }
}
