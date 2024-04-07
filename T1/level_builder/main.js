const WIDTH = 2000;
const HEIGHT = 1080;
const START_SCROLL_X_PERCENTAGE = 0.05


class LevelBuilder extends Phaser.Scene {



    preload ()
    {
        this.mousePos = {"x": 0, "y": 0}
        this.cameraRefVertical = 0;
        this.currentScrollX = 0;
        this.currentScrollY = 0;
        this.selectedColor = 0x0000ff;
        this.blocksArray = []
        this.tiles = []
        this.selectedBlock = new EmptyBlock()
        this.availableBlocks = {
            "empty_block": () => {
                return new EmptyBlock()
            },
            "ground_block": () => {
                return new GroundBlock()
            }
        }
    }

    createGrid(tileSize) {
        const numRows = Math.ceil(4000 / tileSize); // Número de linhas baseado na altura do jogo
        const numCols = Math.ceil(3240 / tileSize); // Número de colunas baseado na largura do jogo

        // Criar um grupo para os tiles do grid
        this.gridGroup = this.add.group();

        // Loop para criar o grid
        for (let i = 0; i < numCols; i++) {
            this.blocksArray.push([])
            this.tiles.push([])
            for (let j = 0; j < numRows; j++) {
                // Calcular as coordenadas x e y do tile atual
                const x = i * tileSize;
                const y = j * tileSize;

                // Criar um retângulo para representar o tile
                const tile = this.add.rectangle(x, y, tileSize, tileSize, 0xffffff);
                tile.setStrokeStyle(1, 0xaaaaaa); // Adicionar uma borda branca ao tile

                // Adicionar o tile ao grupo do grid
                this.gridGroup.add(tile);
                this.tiles[i].push(tile)
                this.blocksArray[i].push(new EmptyBlock())

                tile.setInteractive(); // Habilitar interatividade com o tile
                tile.on('pointerover', () => {
                    tile.setFillStyle(this.selectedColor); // Definir a cor do tile para azul quando o mouse passar sobre ele
                });
                tile.on('pointerout', () => {
                    if(this.blocksArray[i][j].type === "EmptyBlock") {
                        tile.setFillStyle(0xffffff);
                    }
                });
                tile.on('pointerdown', () => {
                    // Este código será executado quando o retângulo for clicado
                    this.blocksArray[i][j] = this.selectedBlock
                    tile.setFillStyle(this.selectedColor)
                });

                
            }
        }
    }

    onScroll(pointer, gameObjects, deltaX, deltaY, deltaZ) {
        if(deltaY < 0 && this.cameras.main.scrollY > 0) {
            this.cameraRef.y -= 10
        }
        else if(deltaY > 0 && this.cameras.main.scrollY < 4000) {
            this.cameraRef.y += 10
        }
    }

    rgbToHex(r, g, b) {
        // Garante que os valores estejam no intervalo de 0 a 255
        r = Math.max(0, Math.min(255, r));
        g = Math.max(0, Math.min(255, g));
        b = Math.max(0, Math.min(255, b));
    
        // Converte cada componente para hexadecimal e os concatena
        return ((r << 16) | (g << 8) | b);
    }

    setSelectedBlock(color, key) {
        this.selectedColor = color;
        this.selectedBlock = this.availableBlocks[key]()
        console.log(this.selectedBlock)
    }
    

    async createBlocksSelector() {
        let rectangle = this.add.rectangle(1800, 350, 300, 600, 0xcccccc, 0.5);
    
        // Add text in the center of the rectangle
        const text = this.add.text(rectangle.x, 100, 'Seletor de blocos', {
            fontSize: '22px',
            fill: '#000000',
            align: 'center',
        });
    
        // Center the text in the middle of the rectangle
        text.setOrigin(0.5);
        const block = await fetch("blocks.json")
        const data = await block.json();
        const keys = Object.keys(data)
        let index = 1;
        let offset_y = 0;
        let offset_x = 0;
        keys.forEach(key => {
            const blockInfo = data[key];
            const r = blockInfo["color"]["r"];
            const g = blockInfo["color"]["g"];
            const b = blockInfo["color"]["b"];
            let rect = this.add.rectangle(rectangle.x - 10 + offset_x, 220 + offset_y, 100, 100, this.rgbToHex(r, g, b), 1);
            rect.setOrigin(1.0);
            rect.setStrokeStyle(1, 0x000000);

            rect.setInteractive();

            // Adicionar ouvintes de eventos para o retângulo
            rect.on('pointerover', function () {
                // Este código será executado quando o mouse estiver sobre o retângulo
                rect.setStrokeStyle(1, 0x77EC65);
            });

            rect.on('pointerout', function () {
                // Este código será executado quando o mouse sair do retângulo
                
                const strokeColor = rect.strokeColor;
                if(strokeColor !== 0xEC8065) rect.setStrokeStyle(1, 0x000000);
            });
            
            let selected = false

            rect.on('pointerdown', () => {
                // Este código será executado quando o retângulo for clicado
                selected = true
                rect.setStrokeStyle(1, 0xEC8065)  
                this.setSelectedBlock(this.rgbToHex(r, g, b), key)          
            });
        
            const blockDescription = this.add.text(rectangle.x - 10 - rect.width / 2 + offset_x, rect.y + rect.height / 2 - 20, blockInfo["description"], {
                fontSize: '22px',
                fill: '#000000',
                align: 'center',
            });
        
            // Center the text vertically in the middle of the rectangle
            blockDescription.setOrigin(0.5);
        
            if(index % 2 === 0) offset_y += 12;
            offset_x = offset_x === 0 ? 120 : 0;
        });
    }
    

    create ()
    {
        this.cursorKeys = this.input.keyboard.createCursorKeys();
        this.createGrid(32)
        this.cameras.main.setBackgroundColor(0xcccccc);
        this.circle = this.add.circle(this.mousePos.x, this.mousePos.y, 4, 0xAA4A44, 0.5);
        this.cameraRef = this.add.rectangle(900, 490, 200, 200, 0xAA4A44, 0.0);
        this.posX = this.add.text(50, 50, `X: ${this.currentScrollX}`, { fontSize: '24px', fill: '#000000' });
        this.posY = this.add.text(50, 80, `Y: ${this.currentScrollX}`, { fontSize: '24px', fill: '#000000' });
        this.posX.setScrollFactor(0);
        this.posY.setScrollFactor(0);
        this.physics.world.setBounds(0, 0, 4000, 3240); // Define os limites do mundo de física para o tamanho total do seu cenário
        // Isso colocaria seu personagem na posição x=1200, y=0, que está fora dos limites do canvas visível
        this.createBlocksSelector()
        // Configurar a câmera
        this.cameras.main.setBounds(0, 0, 4000, 3240); // Define os limites da câmera para o tamanho total do seu cenário
        this.cameras.main.startFollow(this.cameraRef);
        this.input.on('pointermove', (pointer) => {
            const mouseX = pointer.x;
            const mouseY = pointer.y;

            // Calcula a posição do mouse em relação ao mundo considerando o deslocamento da câmera
            const worldMouseX = mouseX + this.cameras.main.scrollX;
            const worldMouseY = mouseY + this.cameras.main.scrollY;

            this.mousePos.x = worldMouseX
            this.mousePos.y = worldMouseY
        });
        this.input.on('wheel', this.onScroll.bind(this));

        
    }

    update() {
        this.cameraRef.y += this.cameraRefVertical;
        this.circle.x = this.mousePos.x;
        if (this.cursorKeys.left.isDown) {
            if(this.cameras.main.scrollX > 0) {
                this.cameraRef.x -= 10
            }
        } else if (this.cursorKeys.right.isDown) {
            if(this.cameras.main.scrollX < WIDTH * 2) {
                this.cameraRef.x += 10
            }
        }
        this.circle.y = this.mousePos.y;
        this.posY.setText(`Y: ${this.cameras.main.scrollY}`)
        this.posX.setText(`X: ${this.cameras.main.scrollX}`)
    }
}

const config = {
    type: Phaser.AUTO,
    width: WIDTH,
    height: HEIGHT,
    scene: LevelBuilder,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 200 }
        }
    }
};

const game = new Phaser.Game(config);

setTimeout(() => {
    const canvas = document.querySelector('canvas');
    canvas.style.position = 'absolute';
    canvas.style.left = '50%'; // Define a posição horizontal no centro da tela
    canvas.style.top = '50%'; // Define a posição vertical no centro da tela
    canvas.style.transform = 'translate(-50%, -50%)'; // Para centralizar corretamente

    // Também é uma boa prática definir o tamanho do canvas para corresponder à largura e altura do jogo
    canvas.width = config.width;
    canvas.height = config.height;
}, 200)