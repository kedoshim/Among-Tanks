import * as THREE from "three";

export class CollisionSystem {
    constructor(players, walls) {
        this.players = players;
        this.walls = walls;
    }

    // verifica se há colisão entre as Bounding Boxes
    checkCollisionBetwennCollisionShapes(collisionShape1, collisionShape2) {
        if (collisionShape2)
            return collisionShape1.intersectsBox(collisionShape2);
    }
}

export class ProjectileCollisionSystem extends CollisionSystem {
    constructor(players, walls, projectiles) {
        super(players, walls);
        this.projectiles = projectiles;
    }

    // Função responsável por reunir todos os projéteis da cena em um único vetor
    // _getAllProjectilesInScene() {
    //     let players = this.players;
    //     let player = null;
    //     let projectiles = [];

    //     // itera sobre todos os players e adiciona todos os projéteis na lista projectiles
    //     for (const player in this.players) {
    //         
    //         for (
    //             let projectileIndex = 0;
    //             projectileIndex < player._tank.projectiles.length;
    //             projectileIndex++
    //         ) {
    //             projectiles.push(player._tank.projectiles[projectileIndex]);
    //         }
    //     }
    //     this._projectiles = [];
    //     this._projectiles = projectiles;
    // }

    // Checa se houve colisão de algum projétil com algum tanque
    checkIfThereHasBeenCollisionWithTanks() {
        let players = this.players;
        let player = null;
        let hitTank = false;

        // identifica todos os projéteis na cena
        // this._getAllProjectilesInScene();
        let projectiles = this.projectiles;

        // itera sobre todos os jogadores
        for (const player of this.players) {
            

            // itera sobre todos os projéteis da cena
            for (
                let projectileIndex = 0;
                projectileIndex < projectiles.length;
                projectileIndex++
            ) {
                if (!player._tank.collisionShape) return;
                hitTank = this.checkCollisionBetwennCollisionShapes(
                    // Verifica se o projétil selecionado atual colidiu com o tanque atual
                    player._tank.collisionShape,
                    projectiles[projectileIndex].collisionShape
                );

                /**
                 * Marcar no projétil que ele acertou um jogador
                 * Se o projétil colidiu com o tanque, então diminuir a vida do jogador
                 * Se a vida for zerada, o jogador é declarado morto
                 */
                if (hitTank && !player._tank.died) {
                    projectiles[projectileIndex].hitTank();
                    player.health -= projectiles[projectileIndex].damage;
                    // console.log(player.health + " " + projectiles[projectileIndex].damage)
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
    checkCollisionWithWalls() {
        let walls = this.walls;
        let wall = null;
        let hitWall;
        let wallsThatCollided = [];

        // this._getAllProjectilesInScene();
        let projectiles = this.projectiles; // pegar todos os projéteis da cena.

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
                hitWall = this.checkCollisionBetwennCollisionShapes(
                    wall.collisionShape,
                    projectile.collisionShape
                );

                // se foi detectada alguma colisão do projétil com algum muro, adicionar o muro na lista de muros atingidos
                if (hitWall) {
                    if (!(wall.isTurretWall && projectile.isTurretProjectile))
                        wallsThatCollided.push(wall);
                    if (wall.isTurretWall && !projectile.isTurretProjectile)
                        projectile.hitTurretWall();
                }
            }

            // Se colidiu apenas com um muro, calcular a reflexão na parede e dizer ao projétil que ele acertou um muro (diminuir um ricochete)
            if (wallsThatCollided.length === 1) {
                this._calculateReflectionDirection(
                    wallsThatCollided[0].model.position,
                    projectile
                );
                projectile.hitWall();
            } else if (wallsThatCollided.length > 1) {
                /**
                 * Se o projétil atingiu mais de um muro ao mesmo tempo é necessário tratar todas essas colisões com cuidado
                 */
                this._calculateReflectionDirectionBasedOnMultiplesBlocks(
                    wallsThatCollided,
                    projectile
                );
                projectile.hitWall();
            }
        }
    }

    // calcula que tipo de reflexão deverá ser aplicada dependendo da quantidade de muros atingidos
    _calculateReflectionDirectionBasedOnMultiplesBlocks(walls, projectile) {
        // Se forem 3 muros, simplesmente fazer o projétil "dar meia volta"
        if (walls.length === 3) {
            projectile.direction.multiplyScalar(-1);
            projectile.projectile.position.set(
                projectile.lastPosition.x,
                projectile.lastPosition.y,
                projectile.lastPosition.z
            );
        }

        // Para 2 muros detectados nas colisões, verificar se eles são vizinhos na horizontal ou na vertical
        const dHorizontal =
            walls[0].model.position.z - walls[1].model.position.z;
        const dVertical = walls[0].model.position.x - walls[1].model.position.x;
        let reflectionDirection;

        // Se ambos estão na horizontal verificar em qual lado o projétil atingiu
        if (dHorizontal === 0) {
            // detecta em qual lado o projétil colidiu nos muros
            if (projectile.projectile.position.z < walls[0].model.position.z) {
                reflectionDirection = new THREE.Vector3(0, 0, -1);
            } else {
                reflectionDirection = new THREE.Vector3(0, 0, 1);
            }
            projectile.reflection(reflectionDirection);
        }
        // Se ambos estão na vertical, verificar em qual lado o projétil colidiu
        if (dVertical === 0) {
            // verificar se colidiu na frente ou atrás dos muros
            if (projectile.projectile.position.x < walls[0].model.position.x) {
                reflectionDirection = new THREE.Vector3(-1, 0, 0);
            } else {
                reflectionDirection = new THREE.Vector3(1, 0, 0);
            }
            projectile.reflection(reflectionDirection);
        }
    }

    _calculateReflectionDirection(wallPosition, projectile) {
        // calculate the difference betwenn positions
        const x_distance = wallPosition.x - projectile.projectile.position.x;
        const z_distance = wallPosition.z - projectile.projectile.position.z;
        let reflectionDirection = null;

        // verifica em qual lado o projétil acertou
        if (Math.abs(x_distance) > Math.abs(z_distance)) {
            reflectionDirection = new THREE.Vector3(
                x_distance > 0 ? 1 : -1,
                0,
                0
            );
        } else {
            reflectionDirection = new THREE.Vector3(
                0,
                0,
                z_distance > 0 ? -1 : 1
            );
        }
        // Apply the reflection
        projectile.reflection(reflectionDirection);
    }
}

export class TankCollisionSystem extends CollisionSystem {
    constructor(players, walls) {
        super(players, walls);
        this.previousCollision = { collided: false, horizontal: false };
        this.previousBlockThatCollided = null;
        this.actualPlayer = null;
        this.vertical = false;
        this.horizontal = false;
        this.slideVector = null;
    }

    /**
     * Método responsável por detectar a colisão entre os tanques e os muros
     */
    checkCollisionWithWalls() {
        let walls = this.walls; // lista de todos os muros
        let players = this.players; // lista de todos os jogadores
        let wall,
            wallHorizontalIndexAux = 0,
            wallVerticalIndexAux = 0; // variáveis auxiliares
        let player;
        let hitWall;
        let theImpactWasInThehorizontal;
        let slideVector;
        let dotProduct;

        // itera sobre todos os players
        for (const player of this.players) {
            
            this.actualPlayer = player;
            this.horizontal = false;
            this.vertical = false;
            slideVector = new THREE.Vector3(0, 0, 1);
            slideVector.applyQuaternion(player._tank.model.quaternion);
            player._tank.collidedWithWalls = false;
            if (!player._tank._positiveMovement) {
                slideVector.multiplyScalar(-1);
            }

            // itera sobre todos os muros
            for (let wallIndex = 0; wallIndex < walls.length; wallIndex++) {
                wall = walls[wallIndex];
                hitWall = this.checkCollisionBetwennCollisionShapes(
                    wall.collisionShape,
                    player._tank.collisionShape
                );
                dotProduct =
                    this._dotProductBetweenTankDirectionAndVectorPosition(
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
                        this._theCollisionWasInTheHorizontal(
                            wall.model.position,
                            player._tank.model.position
                        );

                    // verifica se a colisão atual é válida se já houveram outras colisões
                    let collisionIsValid = this._checkIfTheCollisionIsVallid(
                        wall,
                        theImpactWasInThehorizontal
                    );

                    // Se a colisão foi válida atualizar o sistema de colisão
                    if (collisionIsValid) {
                        /**
                         * Se o impacto foi na horizontal e ainda não houve colisão na horizontal
                         * adicionar o muro atual na memória e marcar que houve colisão na horizontal
                         */
                        if (theImpactWasInThehorizontal && !this.horizontal) {
                            this.horizontal = true;
                            this.previousBlockThatCollided = wall;
                            this.previousCollision.collided = true;
                            this.previousCollision.horizontal =
                                theImpactWasInThehorizontal;
                        } else if (
                            /**
                             * Do contrário, verificar se o impacto foi na vertical e se já houve impacto na vertical. Se não houve
                             * impacto na vertical, adicionar o bloco atual na memória e marcar que houve impacto na vertical
                             */
                            !theImpactWasInThehorizontal &&
                            !this.vertical
                        ) {
                            this.vertical = true;
                            this.previousBlockThatCollided = wall;
                            this.previousCollision.collided = true;
                            this.previousCollision.horizontal =
                                theImpactWasInThehorizontal;
                        }
                    }

                    // marca que o jogador colidiu com algum muro
                    player._tank.collidedWithWalls = true;
                }
            }

            // Se houve impacto na horizontal, zerar o movimento na horizontal
            if (this.horizontal || Math.abs(slideVector.x) < 0.24)
                slideVector.x = 0;
            // Se houve impacto na vertical, zerar o movimento na vertical
            if (this.vertical || Math.abs(slideVector.z) < 0.24)
                slideVector.z = 0;

            // Aplicar o movimento de deslizar nas paredes no tanque
            player._tank.slideVector = slideVector;
            this.previousBlockThatCollided = null;
            this.previousCollision = { collided: false, horizontal: false };
        }
    }

    // verifica se a colisão foi na horizontal e, se sim, retorna true, senão false
    _theCollisionWasInTheHorizontal(wallPosition, tankPosition) {
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
    _dotProductBetweenTankDirectionAndVectorPosition(
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
    _checkIfTheCollisionIsVallid(wall, horizontal) {
        // Se não nenhuma colisão foi detectada, então a colisao atual é válida
        if (this.previousBlockThatCollided === null) {
            return true;
        }

        let BLOCK_SIZE = this.previousBlockThatCollided.BLOCK_SIZE;

        let vertical = !horizontal;

        // dHorizontal e dVertical := se for 0, estão no mesmo eixo
        let dHorizontal =
            wall.model.position.x -
            this.previousBlockThatCollided.model.position.x; // 0 => possuem a mesma coordenada em x
        let dVertical =
            wall.model.position.z -
            this.previousBlockThatCollided.model.position.z; // 0 => possuem a mesma coordenada em z

        // Se ambos os blocos estão na horizontal e são vizinhos

        if (
            dHorizontal === 0 &&
            (Math.abs(dVertical) == BLOCK_SIZE * 2 ||
                Math.abs(dVertical) == BLOCK_SIZE)
        ) {
            this.horizontal = true;

            // Se a colisão anterior foi na vertical ela deve ser desconsiderada
            if (this.previousCollision.horizontal !== true) {
                this.vertical = false;
                this.previousBlockThatCollided = null;

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
            this.vertical = true;

            // Se a colisão anterior foi na horizontal ela deve ser desconsiderada
            if (this.previousCollision.horizontal === true) {
                this.horizontal = false;
                this.previousBlockThatCollided = null;

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

    // Função extra para verificar a colisão com os blocos do jogo
    /**
     * Ela, ao contrário da outra, verifica todos os blocos os quais os jogadores colidiram e, a depender da quantidade,
     * realizará tratamentos diferentes de colisão diferentes
     */
    checkCollisionWithWalls2() {
        let walls = this.walls; // lista de todos os muros
        let players = this.players; // lista de todos os jogadores
        let player; // Instância de jogador da lista
        let wall; // instância de muro da lista
        let wallsThatCollided = [];
        let dotProduct; // produto interno entre a direção do movimento e o vetor que vai da posição do tanque até o muro
        let hitWall; // se o tanque colidiu com o n-ésimo muro

        // Itera sobre todos os jogadores
        for (const player of this.players) {
            
            wallsThatCollided = [];
            this.actualPlayer = player;
            this.horizontal = false;
            this.vertical = false;
            this.slideVector = new THREE.Vector3(0, 0, 1);
            this.slideVector.applyQuaternion(player._tank.model.quaternion);
            player._tank.collidedWithWalls = false;
            if (!player._tank._positiveMovement) {
                this.slideVector.multiplyScalar(-1);
            }

            // Verifica quais blocos o jogador dessa iteração colidiu
            for (let wallIndex = 0; wallIndex < walls.length; wallIndex++) {
                wall = walls[wallIndex];
                hitWall = this.checkCollisionBetwennCollisionShapes(
                    wall.collisionShape,
                    player._tank.collisionShape
                );
                dotProduct =
                    this._dotProductBetweenTankDirectionAndVectorPosition(
                        this.slideVector,
                        wall.model.position,
                        player._tank.model.position
                    );

                if (hitWall && dotProduct > 0) {
                    wallsThatCollided.push(wall);
                    player._tank.collidedWithWalls = true;
                }
            }

            this._calculateSlideDirectionBasedOnMultiplesBlocks(
                wallsThatCollided,
                player
            );

            // Limita o movimento se houver colisão horizontal ou vertical
            if (this.horizontal || Math.abs(this.slideVector.x) < 0.24)
                this.slideVector.x = 0;
            if (this.vertical || Math.abs(this.slideVector.z) < 0.24)
                this.slideVector.z = 0;

            player._tank.slideVector = this.slideVector; // Aplica o vetor de slide ao movimento
        }
    }

    // Método que define em quais direções serão impedidas de movimentar
    _calculateSlideDirectionBasedOnMultiplesBlocks(walls, player) {
        // Se forem detectados 3 muros, o projétil será refletido
        if (walls.length === 3) {
            this.horizontal = true;
            this.vertical = true;
        } else if (walls.length === 2) {
            // Se forem detectadas 2 blocos colidindo com player
            const dHorizontal =
                walls[0].model.position.z - walls[1].model.position.z;
            const dVertical =
                walls[0].model.position.x - walls[1].model.position.x;

            //se ambos os os blocos estiverem na horizontal, restringir o movimento na vertical
            if (dHorizontal === 0) {
                this.vertical = true;
            } else if (dVertical === 0) {
                // Se ambos os blocos estiverem na vertical, restringir o movimento na horizontal
                this.horizontal = true;
            } else {
                // Caso em que os 2 blocos não são vizinhos
                this.horizontal = true;
                this.vertical = true;
            }
        } else if (walls.length === 1) {
            // 1 muro só
            const impactOrientation = this._theCollisionWasInTheHorizontal(
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
                this.horizontal = true;
            } /* if (Math.abs(x_distance) < Math.abs(z_distance))*/ else {
                this.vertical = true;
            }
        }
    }
}
