import * as THREE from "three";

let previousCollision = { collided: false, horizontal: false };
let previousBlockThatCollided = null;
let actualPlayer = null;
let vertical = false;
let horizontal = false;
let slideVector = null;

// verifica se há colisão entre as Bounding Boxes
function checkCollisionBetwennCollisionShapes(
    collisionShape1,
    collisionShape2
) {
    if (collisionShape2) return collisionShape1.intersectsBox(collisionShape2);
}

export function checkProjectilePlayerCollison(projectiles, players) {
    let hitTank = false;

    // itera sobre todos os jogadores
    for (const key in players) {
        const player = players[key];

        // itera sobre todos os projéteis da cena
        for (
            let projectileIndex = 0;
            projectileIndex < projectiles.length;
            projectileIndex++
        ) {
            if (!player._tank.collisionShape) return;
            hitTank = checkCollisionBetwennCollisionShapes(
                // Verifica se o projétil selecionado atual colidiu com o tanque atual
                player._tank.collisionShape,
                projectiles[projectileIndex].collisionShape
            );

            /**
             * Marcar no projétil que ele acertou um jogador
             * Se o projétil colidiu com o tanque, então diminuir a vida do jogador
             * Se a vida for zerada, o jogador é declarado morto
             */
            if (hitTank) {
                projectiles[projectileIndex].hitTank();
                player.health -= projectiles[projectileIndex].damage;
                if (player.health <= 0) {
                    player._tank.die();
                }
            }
        }
    }
}
/**
 * Função responsável por detectar as colisões dos projéteis com as paredes
 */
export function checkProjectileWallCollison(projectiles, walls) {
    let wall = null;
    let hitWall;
    let wallsThatCollided = [];

    // iterar sobre todos os projéteis da cena
    for (
        let projectileIndex = 0;
        projectileIndex < projectiles.length;
        projectileIndex++
    ) {
        let projectile = projectiles[projectileIndex];
        wallsThatCollided = [];

        // iterar sobre todos os muros da cena
        for (let wallIndex = 0; wallIndex < walls.length; wallIndex++) {
            wall = walls[wallIndex];
            hitWall = checkCollisionBetwennCollisionShapes(
                wall.collisionShape,
                projectile.collisionShape
            );

            // se foi detectada alguma colisão do projétil com algum muro, adicionar o muro na lista de muros atingidos
            if (hitWall) {
                wallsThatCollided.push(wall);
            }
        }

        // Se colidiu apenas com um muro, calcular a reflexão na parede e dizer ao projétil que ele acertou um muro (diminuir um ricochete)
        if (wallsThatCollided.length === 1) {
            _calculateReflectionDirection(
                wallsThatCollided[0].model.position,
                projectile
            );
            projectile.hitWall();
        } else if (wallsThatCollided.length > 1) {
            /**
             * Se o projétil atingiu mais de um muro ao mesmo tempo é necessário tratar todas essas colisões com cuidado
             */
            _calculateReflectionDirectionBasedOnMultiplesBlocks(
                wallsThatCollided,
                projectile
            );
            projectile.hitWall();
        }
    }
}

// calcula que tipo de reflexão deverá ser aplicada dependendo da quantidade de muros atingidos
function _calculateReflectionDirectionBasedOnMultiplesBlocks(
    walls,
    projectile
) {
    // Se forem 3 muros, simplesmente fazer o projétil "dar meia volta"
    if (walls.length === 3) {
        projectile.direction.multiplyScalar(-1);
        projectile.model.position.set(
            projectile.lastPosition.x,
            projectile.lastPosition.y,
            projectile.lastPosition.z
        );
    }

    // Para 2 muros detectados nas colisões, verificar se eles são vizinhos na horizontal ou na vertical
    const dHorizontal = walls[0].model.position.z - walls[1].model.position.z;
    const dVertical = walls[0].model.position.x - walls[1].model.position.x;
    let reflectionDirection;

    // Se ambos estão na horizontal verificar em qual lado o projétil atingiu
    if (dHorizontal === 0) {
        // detecta em qual lado o projétil colidiu nos muros
        if (projectile.model.position.z < walls[0].model.position.z) {
            reflectionDirection = new THREE.Vector3(0, 0, -1);
        } else {
            reflectionDirection = new THREE.Vector3(0, 0, 1);
        }
        projectile.reflection(reflectionDirection);
    }
    // Se ambos estão na vertical, verificar em qual lado o projétil colidiu
    if (dVertical === 0) {
        // verificar se colidiu na frente ou atrás dos muros
        if (projectile.model.position.x < walls[0].model.position.x) {
            reflectionDirection = new THREE.Vector3(-1, 0, 0);
        } else {
            reflectionDirection = new THREE.Vector3(1, 0, 0);
        }
        projectile.reflection(reflectionDirection);
    }
}

function _calculateReflectionDirection(wallPosition, projectile) {
    // calculate the difference betwenn positions
    const x_distance = wallPosition.x - projectile.model.position.x;
    const z_distance = wallPosition.z - projectile.model.position.z;
    let reflectionDirection = null;

    // verifica em qual lado o projétil acertou
    if (Math.abs(x_distance) > Math.abs(z_distance)) {
        reflectionDirection = new THREE.Vector3(x_distance > 0 ? 1 : -1, 0, 0);
    } else {
        reflectionDirection = new THREE.Vector3(0, 0, z_distance > 0 ? -1 : 1);
    }
    // Apply the reflection
    projectile.reflection(reflectionDirection);
}

/**
 * Método responsável por detectar a colisão entre os tanques e os muros
 */
export function checkPlayerWallCollision(players, walls) {
    let wall,
        wallHorizontalIndexAux = 0,
        wallVerticalIndexAux = 0; // variáveis auxiliares
    let hitWall;
    let theImpactWasInThehorizontal;
    let slideVector;
    let dotProduct;

    // itera sobre todos os players
    for (const key in players) {
        const player = players[key];
        actualPlayer = player;
        horizontal = false;
        vertical = false;
        slideVector = new THREE.Vector3(0, 0, 1);
        slideVector.applyQuaternion(player._tank.model.quaternion);
        player._tank.collidedWithWalls = false;
        if (!player._tank._positiveMovement) {
            slideVector.multiplyScalar(-1);
        }

        // itera sobre todos os muros
        for (let wallIndex = 0; wallIndex < walls.length; wallIndex++) {
            wall = walls[wallIndex];
            hitWall = checkCollisionBetwennCollisionShapes(
                wall.collisionShape,
                player._tank.collisionShape
            );
            dotProduct = _dotProductBetweenTankDirectionAndVectorPosition(
                slideVector,
                wall.model.position,
                player._tank.model.position
            );

            /**
             * Se houve colisão com o muro atual e o tanque está se movimentando em direção ao muro
             * então verificar se a colisão foi válida
             */
            if (hitWall && dotProduct > -4.4) {
                // Verifica se o impacto foi na horizontal
                theImpactWasInThehorizontal =
                    _theCollisionWasInTheHorizontal(
                        wall.model.position,
                        player._tank.model.position
                    );

                // verifica se a colisão atual é válida se já houveram outras colisões
                let collisionIsValid = _checkIfTheCollisionIsVallid(
                    wall,
                    theImpactWasInThehorizontal
                );

                // Se a colisão foi válida atualizar o sistema de colisão
                if (collisionIsValid) {
                    /**
                     * Se o impacto foi na horizontal e ainda não houve colisão na horizontal
                     * adicionar o muro atual na memória e marcar que houve colisão na horizontal
                     */
                    if (theImpactWasInThehorizontal && !horizontal) {
                        horizontal = true;
                        previousBlockThatCollided = wall;
                        previousCollision.collided = true;
                        previousCollision.horizontal =
                            theImpactWasInThehorizontal;
                    } else if (
                        /**
                         * Do contrário, verificar se o impacto foi na vertical e se já houve impacto na vertical. Se não houve
                         * impacto na vertical, adicionar o bloco atual na memória e marcar que houve impacto na vertical
                         */
                        !theImpactWasInThehorizontal &&
                        !vertical
                    ) {
                        vertical = true;
                        previousBlockThatCollided = wall;
                        previousCollision.collided = true;
                        previousCollision.horizontal =
                            theImpactWasInThehorizontal;
                    }
                }

                // marca que o jogador colidiu com algum muro
                player._tank.collidedWithWalls = true;
            }
        }

        // Se houve impacto na horizontal, zerar o movimento na horizontal
        if (horizontal || Math.abs(slideVector.x) < 0.24)
            slideVector.x = 0;
        // Se houve impacto na vertical, zerar o movimento na vertical
        if (vertical || Math.abs(slideVector.z) < 0.24) slideVector.z = 0;

        // Aplicar o movimento de deslizar nas paredes no tanque
        player._tank.slideVector = slideVector;
        previousBlockThatCollided = null;
        previousCollision = { collided: false, horizontal: false };
    }
}

// verifica se a colisão foi na horizontal e, se sim, retorna true, senão false
function _theCollisionWasInTheHorizontal(wallPosition, tankPosition) {
    const x_distance = wallPosition.x - tankPosition.x;
    const z_distance = wallPosition.z - tankPosition.z;
    let direction; // true: Horizontal Orientation, false: Vertical Orientation

    if (Math.abs(x_distance) > Math.abs(z_distance)) {
        direction = true;
    } else {
        direction = false;
    }

    return direction;
}

/**
 *  Calcula o produto interno entre o vetor que aponta na direção do movimento e o vetor que vai da posição do tanque
 *  até o centro do muro. O produto interno serve para verificar se o tanque está se movimentado em direção ao muro.
 */
function _dotProductBetweenTankDirectionAndVectorPosition(
    tankDirection,
    wallPosition,
    tankPosition
) {
    let t = new THREE.Vector3(
        wallPosition.x - tankPosition.x,
        wallPosition.y - tankPosition.y,
        wallPosition.z - tankPosition.z
    );

    return tankDirection.dot(t);
}

/**
 * Checa se a colisão atual é válida em relação à última colisão detectada. Isso é utilizado para verificar se o tanque colidiu
 * em mais de um muro.
 */
function _checkIfTheCollisionIsVallid(wall, horizontal) {
    // Se não nenhuma colisão foi detectada, então a colisao atual é válida
    if (previousBlockThatCollided === null) {
        return true;
    }

    let BLOCK_SIZE = previousBlockThatCollided.BLOCK_SIZE;

    let vertical = !horizontal;

    // dHorizontal e dVertical := se for 0, estão no mesmo eixo
    let dHorizontal =
        wall.model.position.x - previousBlockThatCollided.model.position.x; // 0 => possuem a mesma coordenada em x
    let dVertical =
        wall.model.position.z - previousBlockThatCollided.model.position.z; // 0 => possuem a mesma coordenada em z

    // Se ambos os blocos estão na horizontal e são vizinhos

    if (
        dHorizontal === 0 &&
        (Math.abs(dVertical) == BLOCK_SIZE * 2 ||
            Math.abs(dVertical) == BLOCK_SIZE)
    ) {
        horizontal = true;

        // Se a colisão anterior foi na vertical ela deve ser desconsiderada
        if (previousCollision.horizontal !== true) {
            vertical = false;
            previousBlockThatCollided = null;

            // E se a colisão atual é na horizontal, então a colisão é válida
            if (horizontal) {
                return true;
            } else {
                return false;
            }
        } else {
            /**
             * Se a colisão anterior foi na horizontal e a atual também foi na horizontal,
             * então a colisão atual é válida.
             */
            if (horizontal) {
                return true;
            }
            // Se a colisão atual foi na vertical, então não foi válida
            else {
                return false;
            }
        }
    }

    // Verifica se ambos os blocos são vizinhos e estão na vertical
    if (
        dVertical === 0 &&
        (Math.abs(dHorizontal) == BLOCK_SIZE * 2 ||
            Math.abs(dHorizontal) == BLOCK_SIZE)
    ) {
        vertical = true;

        // Se a colisão anterior foi na horizontal ela deve ser desconsiderada
        if (previousCollision.horizontal === true) {
            horizontal = false;
            previousBlockThatCollided = null;

            // Se a colisão atual foi na vertical, então ela é válida
            if (vertical) {
                return true;
            } else {
                return false;
            }
        } else {
            /**
             * Se a colisão anterior foi na horizontal, mas a atual for na vertical,
             * então a colisão atual é válida
             */
            if (vertical) {
                return true;
            } else {
                return false;
            }
        }
    }

    // se os blocos não são vizinhos então a colisão é válida
    return true;
}

// Método que define em quais direções serão impedidas de movimentar
function _calculateSlideDirectionBasedOnMultiplesBlocks(walls, player) {
    // Se forem detectados 3 muros, o projétil será refletido
    if (walls.length === 3) {
        horizontal = true;
        vertical = true;
    } else if (walls.length === 2) {
        // Se forem detectadas 2 blocos colidindo com player
        const dHorizontal =
            walls[0].model.position.z - walls[1].model.position.z;
        const dVertical = walls[0].model.position.x - walls[1].model.position.x;

        //se ambos os os blocos estiverem na horizontal, restringir o movimento na vertical
        if (dHorizontal === 0) {
            vertical = true;
        } else if (dVertical === 0) {
            // Se ambos os blocos estiverem na vertical, restringir o movimento na horizontal
            horizontal = true;
        } else {
            // Caso em que os 2 blocos não são vizinhos
            horizontal = true;
            vertical = true;
        }
    } else if (walls.length === 1) {
        // 1 muro só
        const impactOrientation = _theCollisionWasInTheHorizontal(
            walls[0].model.position,
            player._tank.position
        );
        // const wallPosition = walls[0].model.position;
        // const playerPosition = player._tank.model.position;
        // let dHorizontal = wallPosition.x - playerPosition.x;
        // let dVertical = wallPosition.z - playerPosition.z;

        if (
            /*Math.abs(x_distance) >= walls[0].BLOCK_SIZE/2*/ impactOrientation
        ) {
            horizontal = true;
        } /* if (Math.abs(x_distance) < Math.abs(z_distance))*/ else {
            vertical = true;
        }
    }
}
