import { createGroundPlaneXZ } from "./public/util/util.js";
import * as THREE from "./public/three/build/three.module.js";

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

    const createBlock = (i, j, color, yTranslation) => {
        const geometry = new THREE.BoxGeometry(
            BLOCK_SIZE,
            BLOCK_SIZE,
            BLOCK_SIZE
        );
        const material = new THREE.MeshBasicMaterial({ color });
        const cube = new THREE.Mesh(geometry, material);
        const translation = getTranslation(i, j, yTranslation);
        cube.translateX(translation.x);
        cube.translateY(translation.y);
        cube.translateZ(translation.z);

        // if (color === wallColor) {
        //     let wall = new CollisionBlock();
        //     wall.setBlockSize(BLOCK_SIZE);
        //     wall.setModel(cube);
        //     wall.createCollisionShape();
        //     // this.walls.push(wall);
        //     let helper = new THREE.Box3Helper(wall.collisionShape, 0x000000);
        //     scene.add(helper);
        // }

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
                        groundColor,
                        -BLOCK_SIZE / 2 + levelHeight
                    );
                    break;
                case "WallBlock":
                    createBlock(
                        i,
                        j,
                        wallColor,
                        BLOCK_SIZE / 2 + levelHeight
                    );
                    break;
                case "Spawn":
                    createBlock(
                        i,
                        j,
                        spawnColor,
                        -BLOCK_SIZE / 2 + levelHeight
                    );
                    const translation = getTranslation(i, j, -13);
                    // const spawn = [translation.x, translation.z];
                    // this.playerSpawnPoint[spawnIndex] = spawn;
                    spawnIndex++;
                    break;
                default:
                    break;
            }
        }
    }
}
