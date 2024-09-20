import { createGroundPlaneXZ } from "./public/util/util.js";
import * as THREE from "./public/three/build/three.module.js";
import { getTexture } from "./loaders/textures.js";

const wallColor = 0x404040;
const groundColor = 0xb2beb5;
const spawnColor = 0xff0000;

export function loadLevel(level, scene) {
    const levelHeight = 5;
    const data = level.blocks;
    let { x, y } = level.offset;

    const BLOCK_SIZE = 17;

    const getTranslation = (i, j, yTranslation) => {
        return {
            x: BLOCK_SIZE * i + 1 - x,
            y: yTranslation,
            z: BLOCK_SIZE * j + 1 - y,
        };
    };

    const createBlock = (
        i,
        j,
        yTranslation,
        materialParameters,
        hasCollision = false
    ) => {
        const geometry = new THREE.BoxGeometry(
            BLOCK_SIZE,
            BLOCK_SIZE,
            BLOCK_SIZE
        );
        let material = new THREE.MeshLambertMaterial(materialParameters);
        const cube = new THREE.Mesh(geometry, material);
        cube.receiveShadow = true;

        const translation = getTranslation(i, j, yTranslation);
        //console.log(translation)
        cube.translateX(translation.x);
        cube.translateY(translation.y);
        cube.translateZ(translation.z);
        cube.castShadow = true;

        scene.add(cube);
    };

    const plane = createGroundPlaneXZ(
        1000,
        1000,
        undefined,
        undefined,
        "rgb(30, 41, 94)"
    );
    scene.add(plane);

    let spawnIndex = 0;

    for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data[i].length; j++) {
            switch (data[i][j].type) {
                case "GroundBlock":
                    createBlock(
                        i,
                        j,
                        -BLOCK_SIZE / 2 + levelHeight,
                        {
                            color: data[i][j].color,
                            map: getTexture("basic_floor"),
                        },
                        false
                    );
                    break;
                case "WallBlock":
                    createBlock(
                        i,
                        j,
                        BLOCK_SIZE / 2 + levelHeight,
                        {
                            color: data[i][j].color,
                            map: getTexture("basic_wall"),
                        },
                        true
                    );
                    break;
                case "Spawn":
                    createBlock(i, j, -BLOCK_SIZE / 2 + levelHeight, {
                        color: 0xff0000,
                        map: getTexture("basic_wall"),
                    });
                    spawnIndex++;
                    break;
                default:
                    break;
            }
        }
    }
}
