import {Projectile} from '../classes/projectile.js';
import * as THREE from 'three';


class SceneMap {
    constructor(walls, blockSize) {
        this.blockSize = blockSize;
        this.walls = walls;

        // Determine the size of the grid
        this.minX = Math.min(...walls.map(wall => wall.model.position.x));
        this.minZ = Math.min(...walls.map(wall => wall.model.position.z));
        this.maxX = Math.max(...walls.map(wall => wall.model.position.x));
        this.maxZ = Math.max(...walls.map(wall => wall.model.position.z));

        this.rows = Math.round((this.maxZ - this.minZ) / blockSize) + 1;
        this.cols = Math.round((this.maxX - this.minX) / blockSize) + 1;

        // Create and fill the grid
        this.sceneMap = Array.from({ length: this.rows }, () => Array(this.cols).fill(1)); // Fill with 1s
        this.fillSceneMap();
    }

    fillSceneMap() {
        this.walls.forEach(wall => {
            let x = Math.round((wall.model.position.x - this.minX) / this.blockSize);
            let z = Math.round((wall.model.position.z - this.minZ) / this.blockSize);
            this.sceneMap[z][x] = 0; // 0 represents a wall
        });
    }

    spatialToIndex(position) {
        let x = Math.round((position.x - this.minX) / this.blockSize);
        let z = Math.round((position.z - this.minZ) / this.blockSize);
        return { row: z, col: x };
    }

    indexToSpatial(row, col) {
        let x = col * this.blockSize + this.minX;
        let z = row * this.blockSize + this.minZ;
        return { x: x, z: z };
    }
}

class Node {
    constructor(position, startNodeDistance, heuristicDistanceToEndNode, parentNode=null) {
        this.position = position;
        this.startNodeDistance = startNodeDistance;
        this.heuristicDistanceToEndNode = heuristicDistanceToEndNode;
        this.cost = startNodeDistance + heuristicDistanceToEndNode;

        this.parentNode = parentNode;
    }
}

class AStar {
    constructor(sceneMap) {
        this.sceneMap = sceneMap;
    }

    findPath(botPosition, playerPosition) {
        let startNode = this.sceneMap.spatialToIndex(botPosition);
        let endNode = this.sceneMap.spatialToIndex(playerPosition);

        let openList = [];
        let closedList = [];

        openList.push(new Node(startNode, 0, this.heuristic(startNode, endNode)));

        //console.log("=================== NEW ===================")
        while (openList.length > 0) {
            let currentNode = openList.reduce((lowest,node) => (node.cost < lowest.cost ? node : lowest));

            //console.log(openList)

            if (currentNode.position.row === endNode.row && currentNode.position.col === endNode.col) {
                // Path found
                let path = [];
                while (currentNode) {
                    path.push(currentNode.position);
                    currentNode = currentNode.parentNode;
                }

                return path.reverse();
            }
            
            // Remove currentNode from openList and add to closedList
            openList = openList.filter(node => node !== currentNode);
            closedList.push(currentNode);

            // Get neighbors
            let neighbors = this.getNeighbors(currentNode.position);

            neighbors.forEach(neighbor => {
                if (this.sceneMap.sceneMap[neighbor.row][neighbor.col] === 0 || closedList.find(node => node.position.row === neighbor.row && node.position.col === neighbor.col)) {
                    return; // Ignore walls and already evaluated nodes
                }

                let g = currentNode.startNodeDistance + 1;
                let h = this.heuristic(neighbor, endNode);
                let neighborNode = new Node(neighbor, g, h, currentNode);

                if (!openList.find(node => node.position.row === neighbor.row && node.position.col === neighbor.col && node.startNodeDistance <= g)) {
                    openList.push(neighborNode);
                }
            });
        }

        return [];
    }

    heuristic(nodeA, nodeB) {
        return Math.abs(nodeA.row - nodeB.row) + Math.abs(nodeA.col - nodeB.col);
    }

    getNeighbors(position) {
        let neighbors = [];
        let directions = [
            { row: -1, col: 0 },
            { row: 1, col: 0 },
            { row: 0, col: -1 },
            { row: 0, col: 1 }
        ];
        
        directions.forEach(direction => {
            let newRow = position.row + direction.row;
            let newCol = position.col + direction.col;

            if (newRow >= 0 && newRow < this.sceneMap.rows && newCol >= 0 && newCol < this.sceneMap.cols) {
                neighbors.push({ row: newRow, col: newCol });
            }
        });

        return neighbors;
    }
}


export class AISystem {
    constructor(player, walls, bots, turrets=null) {
        this.player = player;
        this.walls = walls;
        this.bots = bots
        this.turrets = turrets;

        this.sceneMap = new SceneMap(walls, walls[0].BLOCK_SIZE);
        this.sceneMap.fillSceneMap();

        this.aStar = new AStar(this.sceneMap);

        this.lastPosition = null;
        this.lastNextPosition = null;

    }

    nextAction(botIndex) {
        let test = this.thereIsObjectsBetweenPlayerAndBot(botIndex);
        if (test) {
            this.moveTank(botIndex);
        }
        else if (this.isPlayerInFrontOfBot(botIndex)) {
            if (this.bots[botIndex].player_tank._tank.model.position.distanceTo(this.player._tank.model.position) >= 5 * this.walls[0].BLOCK_SIZE) {
                this.shoot(botIndex);
            }
            else {
                this.bots[botIndex]._nextMove.movement = -1;
                this.shoot(botIndex);
            }
        }
        else {
            this.trackPlayer(botIndex);
        }
    }

    //-------------- States --------------

    thereIsObjectsBetweenPlayerAndBot(botIndex) {
        let bot = this.bots[botIndex].player_tank;
        let player = this.player;
        let walls = this.walls;

        if (player._tank.health <= 0) {
            return true;
        }

        let playerPosition = player._tank._model.position.clone();
        let botPosition = bot._tank._model.position.clone();

        // Create a Raycaster
        let direction = new THREE.Vector3().subVectors(botPosition, playerPosition).normalize();
        let raycaster = new THREE.Raycaster(playerPosition, direction);

        // Verify intersections with walls
        let intersects = raycaster.intersectObjects(walls.map(wall => wall.model), true);

        // Verify if some intersections is betwenn the player and the bot
        for (let i = 0; i < intersects.length; i++) {
            let intersect = intersects[i];
            if (intersect.distance <= playerPosition.distanceTo(botPosition)) {
                return true;
            }
        }

        return false;
    }
    

    isPlayerInFrontOfBot(botIndex) {
        let bot = this.bots[botIndex].player_tank;
        let player = this.player;

        let playerPosition = player._tank._model.position.clone();
        let botPosition = bot._tank._model.position.clone();
        let dif = playerPosition.sub(botPosition);
        let direction = new THREE.Vector3(0,0,1);
        direction.applyQuaternion(bot.tank._model.quaternion);

        if (direction.angleTo(dif) <= 0.05) {
            return true;
        }

        return false;
    }

    // Check the turret state for 
    checkTurretState(botIndex) {
        
    }

    // -------------- Complex Actions --------------

    trackPlayer(botIndex) {
        let bot = this.bots[botIndex].player_tank;
        let player = this.player;
        let nextMove = {
            isDirectional: false,
            rotation: 0,
            movement: 0,
            moveX: 0,
            movez: 0
        };

        let playerPosition = player._tank._model.position.clone();
        let botPosition = bot._tank._model.position.clone();
        let dif = playerPosition.sub(botPosition);
        let direction = new THREE.Vector3(0,0,1);
        direction.applyQuaternion(bot._tank._model.quaternion);

        let y_axis = new THREE.Vector3(0,1,0);
        let actualAngle = direction.angleTo(dif);

        // rotate right
        let rotationAngle = Math.PI / 32;
        let imaginary_vector_rotation = direction.clone();

        imaginary_vector_rotation.applyAxisAngle(y_axis, rotationAngle);

        let new_angle = imaginary_vector_rotation.angleTo(dif);

        if (new_angle < actualAngle) {
            nextMove["rotation"] = 1;
        }
        else {
            nextMove["rotation"] = -1;
        }

        this.bots[botIndex].setNextMove(nextMove);
    }

    moveTank(botIndex) {
        let bot = this.bots[botIndex];
        bot.resetMove();

        let block_size = this.walls[0].BLOCK_SIZE;

        let botPosition = bot.player_tank._tank._model.position.clone();
        let player = this.player;

        
        if (botIndex % 2 == 0) {
            let path = this.aStar.findPath(bot.player_tank._tank._model.position, player._tank._model.position);

            if (path.length > 1) {
                
                let actualPosition = this.sceneMap.indexToSpatial(path[0].row, path[0].col);

                if (this.lastPosition && this.lastNextPosition && path.length > 2) {
                    this.lastPosition = path[0];
                    this.lastNextPosition = path[1];
                }

                actualPosition = new THREE.Vector3(actualPosition.x, botPosition.y, actualPosition.z);

                let nextPosition = this.sceneMap.indexToSpatial(path[1].row, path[1].col);
                nextPosition = new THREE.Vector3(nextPosition.x, botPosition.y, nextPosition.z);

                let direction = new THREE.Vector3(0, 0, 1);
                direction.applyQuaternion(bot.player_tank._tank._model.quaternion);

                // rotate right
                let rotationAngle = Math.PI / 32;
                let imaginary_vector_rotation = direction.clone();
                let y_axis = new THREE.Vector3(0,1,0);

                imaginary_vector_rotation.applyAxisAngle(y_axis, rotationAngle);

                let chosenDirection = nextPosition.sub(botPosition);
                let actualDirection = actualPosition.sub(botPosition);
                
                if (direction.angleTo(actualDirection) < 0.03 && botPosition.distanceTo(actualPosition) > block_size / 100) {
                    this.bots[botIndex]._nextMove.movement = 1;
                    this.bots[botIndex].isMoving = true;
                }
                else {
                    if (imaginary_vector_rotation.angleTo(chosenDirection) < direction.angleTo(chosenDirection)) {
                        this.bots[botIndex]._nextMove.rotation = 1;
                    }
                    else {
                        this.bots[botIndex]._nextMove.rotation = -1;
                    }
        
                    if (direction.angleTo(chosenDirection) < 0.09) {
                        this.bots[botIndex]._nextMove.movement = 1;
                        this.bots[botIndex].isMoving = true;
                    }
                }
            }
        }
        else {
            let direction = new THREE.Vector3(0, 0, 1);
            direction.applyQuaternion(bot.player_tank._tank._model.quaternion);
    
            let botPosition = bot.player_tank._tank._model.position.clone();
    
            // rotate right
            let rotationAngle = Math.PI / 32;
            let imaginary_vector_rotation = direction.clone();
            let y_axis = new THREE.Vector3(0,1,0);
    
            imaginary_vector_rotation.applyAxisAngle(y_axis, rotationAngle);
    
            let chosenDirection = this.decideTankMovement(botPosition, direction);
            
            if (direction.angleTo(chosenDirection) < 0.03) {
                this.bots[botIndex]._nextMove.movement = 1;
            }
            else {
                if (imaginary_vector_rotation.angleTo(chosenDirection) < direction.angleTo(chosenDirection)) {
                    this.bots[botIndex]._nextMove.rotation = 1;
                }
                else {
                    this.bots[botIndex]._nextMove.rotation = -1;
                }
    
                if (direction.angleTo(chosenDirection) < 0.09) {
                    this.bots[botIndex]._nextMove.movement = 1;
                }
            }
        }

    }

    decideTankMovement(botPosition, botDirection) {
        const wallsDirections = this.checkClosestsWalls(botPosition);
    
        // Vetores de direção possíveis
        const directions = {
            up: new THREE.Vector3(0, 0, -1),
            right: new THREE.Vector3(1, 0, 0),
            down: new THREE.Vector3(0, 0, 1),
            left: new THREE.Vector3(-1, 0, 0)
        };
    
        // Filtra direções viáveis (sem paredes)
        const viableDirections = Object.keys(wallsDirections).filter(direction => !wallsDirections[direction]);
    
        // Calcula o menor ângulo de rotação
        let minAngle = Infinity;
        let chosenDirection = null;
    
        viableDirections.forEach(direction => {
            const targetDirection = directions[direction];
            const angle = botDirection.angleTo(targetDirection);
    
            if (angle < minAngle) {
                minAngle = angle;
                chosenDirection = direction;
            }
        });
    
        return directions[chosenDirection];
    }

    checkClosestsWalls(botPosition) {
        let wallsDirections = {
            up: false,
            right: false,
            down: false,
            left: false
        };

        let walls = this.walls;
        const BLOCK_SIZE = walls[0].BLOCK_SIZE;
        const margin = BLOCK_SIZE;

        walls.forEach(wall => {
            let dx = wall.model.position.x - botPosition.x;
            let dz = wall.model.position.z - botPosition.z;

            // Verifica se a parede está diretamente acima (cima) do bot
            if (Math.abs(dx) <= margin && Math.abs(dz + BLOCK_SIZE) <= margin) {
                wallsDirections.up = true;
            }
            // Verifica se a parede está diretamente à direita do bot
            if (Math.abs(dx - BLOCK_SIZE) <= margin && Math.abs(dz) <= margin) {
                wallsDirections.right = true;
            }
            // Verifica se a parede está diretamente abaixo (baixo) do bot
            if (Math.abs(dx) <= margin && Math.abs(dz - BLOCK_SIZE) <= margin) {
                wallsDirections.down = true;
            }
            // Verifica se a parede está diretamente à esquerda do bot
            if (Math.abs(dx + BLOCK_SIZE) <= margin && Math.abs(dz) <= margin) {
                wallsDirections.left = true;
            }
        });

        // console.log(wallsDirections);

        return wallsDirections;
    }

    // -------------- Actions --------------
    rotateLeft(botIndex) {
        this.bots[botIndex].rotateLeft();
    }

    rotateRight(botIndex) {
        this.bots[botIndex].rotateRight();
    }

    forward(botIndex) {
        this.bots[botIndex].forward();
    }

    reverse(botIndex) {
        this.bots[botIndex].reverse();
    }

    shoot(botIndex) {
        this.bots[botIndex].shoot();
    }
}




export class Bot {
    /**
     * @param {THREE.js Object} model 
     * @param {list} plazers 
     * @param {list} bots 
     * @param {list} walls
     * @param {Object} shootParams 
     */
    constructor(player_tank, shootParams=null) {
        this.player_tank = player_tank;

        if (!shootParams) {
            shootParams = {
                bulletSpeed: 2,
                damage: 1,
                shootCooldown: 3000
            }
        }

        self.shootParams = shootParams;
        this._lastShootTime = 0;
        this._projectiles = [];

        this._nextMove = {
            isDirectional: false,
            rotation: 0,
            movement: 0,
            moveX: 0,
            moveZ: 0
        };

        this.isMoving = false;
    }

    setNextMove(nextMove) {
        this._nextMove = nextMove;
    }

    move() {
        if (this.player_tank.health == 0) {
            return;
        }
        if (this._nextMove.isDirectional) {
            this.player_tank._tank.moveDirectional(this._nextMove.moveX, this._nextMove.moveZ);
        }
        else {
            this.player_tank._tank.moveRotating(this._nextMove.movement, this._nextMove.rotation, this.isMoving);
        }
        
        this.resetMove();
    }

    resetMove() {
        this._nextMove = {
            isDirectional: false,
            rotation: 0,
            movement: 0,
            moveX: 0,
            movez: 0
        };
    }

    rotateLeft() {
        this._nextMove.rotation -= 1;
    }

    rotateRight() {
        this._nextMove.rotation += 1;
    }

    forward() {
        this._nextMove.movement += 1;
    }

    reverse() {
        this._nextMove.movement -= 1;
    }

    shoot() {
        if (this.player_tank.health > 0) {
            this.player_tank._tank.shoot();
        }
    }
}

export class TurretSystem {
    constructor(turrets) {
        this.turrets = turrets;
    }

    nextAction() {
        let turrets = this.turrets;

        turrets.forEach(turret => {
            turret.trackNearestTank();
            turret.shoot();
        })
    }
}

export class Turret {
    constructor(model, players, bots, shootParams=null) {
        this.model = model;
        this.players = players;
        this.bots = bots;

        if (!shootParams) {
            shootParams = {
                bulletSpeed: 1.5,
                damage: 1,
                shootCooldown: 3000,
                ricochetsAmount: 0,
                rotationSpeed: 0.15
            }
        }

        this.shootParams = shootParams;
        this._bulletSpeed = this.shootParams.bulletSpeed;
        TouchList._damage = this.shootParams.damage;

        this._shootCooldown = this.shootParams.shootCooldown;
        this._lastShootTime = Date.now();
        this._projectiles = []
    }

    trackNearestTank() {
        
        let playerPosition = this.players._tank.model.position.clone();
        let bots = this.bots;
        let turretPosition = this.model.position.clone();

        let positions = [];

        if (!this.players._tank.died)
            positions.push(playerPosition);
        bots.forEach(bot => {
            if (!bot.player_tank._tank.died) {
                positions.push(bot.player_tank._tank.model.position.clone());
            }
        });


        let shortestDistance = Infinity;
        let nearestPosition;

        positions.forEach(pos => {
            const actualDistance = pos.distanceTo(turretPosition.clone());
            if (actualDistance < shortestDistance) {
                shortestDistance = actualDistance;
                nearestPosition = pos;
            }
        });

        let turretDirection = new THREE.Vector3(0, 0, 1);
        turretDirection.applyQuaternion(this.model.quaternion);

        let target = nearestPosition.sub(turretPosition.clone());

        // rotate right
        let rotationAngle = Math.PI / 32;
        let imaginary_vector_rotation = turretDirection.clone();
        let y_axis = new THREE.Vector3(0,1,0);

        imaginary_vector_rotation.applyAxisAngle(y_axis, rotationAngle);

        let rotationDirection;

        if (imaginary_vector_rotation.angleTo(target) < turretDirection.angleTo(target)) {
            rotationDirection = 1;
        }
        else {
            rotationDirection = -1;
        }
        
        this.model.rotateY(this.shootParams.rotationSpeed * 0.25 * rotationDirection * 0.75);
    }

    shoot() {
        const currentTime = Date.now();
        if (currentTime - this._lastShootTime < this.shootParams.shootCooldown) {
            return;
        }
        this._lastShootTime = currentTime;

        const length = 12.5;
        let projectilePosition = this.model.position.clone(); // Posição inicial do projétil é a mesma do bot
        projectilePosition.y = projectilePosition.y + 6;

        const turretForwardVector = new THREE.Vector3(0, 0, 1); // Vetor de avanço do bot na direção Z positiva
        turretForwardVector.applyQuaternion(this.model.quaternion); // Aplicar rotação do bot ao vetor de avanço

        // Calcular a direção do projétil com base no vetor de avanço do bot
        const originalDirection = turretForwardVector.normalize();

        // Adicionar a direção ao vetor posição para obter a posição final do projétil
        projectilePosition.addScaledVector(originalDirection, length);

        // Criar o projétil na posição calculada e com a direção correta
        let projectile = new Projectile(
            projectilePosition,
            originalDirection.clone(),
            this._bulletSpeed,
            this._damage,
            0, 
            true,
        );
        this._projectiles.push(projectile);

        var audio = new Audio("./assets/audio/shot.mp3"); // Áudio do tiro
        audio.play();
    }
}