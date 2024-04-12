const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
const START_SCROLL_X_PERCENTAGE = 0.05
document.addEventListener('contextmenu', function(event) {
    // Previna o comportamento padrão do navegador
    event.preventDefault();
});

class LevelBuilder extends Phaser.Scene {



    preload ()
    {
        this.mousePos = {"x": 0, "y": 0}
        this.cameraRefVertical = 0;
        this.currentScrollX = 0;
        this.currentScrollY = 0;
        this.selectedColor = 0x0000ff;
        this.gameWidth = window.innerWidth;
        this.rightButtonIsPressed = false;
        this.gameHeight = window.innerHeight;
        this.blocksArray = []
        this.gridMouseIndex = {}
        this.mouseIsPressed = false;
        this.colorsData = {}
        this.fetchConfig()
        console.log(this.colorsData)
        this.blocksSelection = []
        this.tiles = []
        this.selectedBlock = new EmptyBlock()
        this.availableBlocks = {
            "empty_block": () => {
                const block = new EmptyBlock()
                return block
            },
            "ground_block": () => {
                const block = new GroundBlock()
                block.convertColors(this.colorsData["ground_block"].r, this.colorsData["ground_block"].g, this.colorsData["ground_block"].b)
                return block
            },
            "collisor": () => {
                const block = new WallBlock()
                block.convertColors(this.colorsData["collisor"].r, this.colorsData["collisor"].g, this.colorsData["collisor"].b)
                return block
            },
            "spawn": () => {
                const block = new SpawnBlock()
                block.convertColors(this.colorsData["spawn"].r, this.colorsData["spawn"].g, this.colorsData["spawn"].b)
                return block
            }
        }
    }

    calculateGridIndex(mouseX, mouseY, tileSize) {
        const i = Math.floor(mouseX / tileSize);
        const j = Math.floor(mouseY / tileSize);
        return { i, j };
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
                    let original_color = tile.fillColor
                    if(this.blocksArray[i][j].type === "EmptyBlock") {
                        tile.setFillStyle(0xffffff);
                    }
                    else {
                        if(this.selectedBlock.type !== this.blocksArray[i][j].type) {
                            
                            tile.setFillStyle(this.blocksArray[i][j].color)
                        }
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

    clearNotSelectedBlocks(jumpIndex) {
        this.blocksSelection.forEach((block, index) => {
            if(jumpIndex !== index) block.setStrokeStyle(1, 0x000000);
            index++;
        })
    }

    async fetchConfig() {
        const block = await fetch("blocks.json")
        const data = await block.json();
        const keys = Object.keys(data)
        for(let i = 0; i < keys.length; i++) {
            this.colorsData[keys[i]] = data[keys[i]].color
        }
    }
    

    async createBlocksSelector() {
        let rectangle = this.add.rectangle(window.innerWidth*0.90, 350, 300, 600, 0xcccccc, 0.5);
    
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
        let offset_y = 0;
        let offset_x = 0;
        keys.forEach((key, index) => {
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
                this.clearNotSelectedBlocks(index)            
            });

        
            const blockDescription = this.add.text(rectangle.x - 10 - rect.width / 2 + offset_x, rect.y + rect.height / 2 - 20, blockInfo["description"], {
                fontSize: '22px',
                fill: '#000000',
                align: 'center',
            });
        
            // Center the text vertically in the middle of the rectangle
            blockDescription.setOrigin(0.5);
            this.blocksSelection.push(rect)
        
            if(index % 2 === 1) offset_y += 160;
            offset_x = offset_x === 0 ? 120 : 0;
        });
    }

    findFirstNotEmpty() {
        let block = null;
        for(let i = 0; i < this.blocksArray.length; i++) {
            for(let j = 0; j < this.blocksArray[i].length; j++) {
                if(!(this.blocksArray[i][j] instanceof EmptyBlock)) {
                    block = this.blocksArray[i][j]
                }
            }
        }
        return block;
    }

    downloadJSON(jsonData, filename) {
        // Converta o objeto JSON em uma string JSON
        var jsonString = JSON.stringify(jsonData);
    
        // Crie um novo Blob com o conteúdo JSON
        var blob = new Blob([jsonString], { type: "application/json" });
    
        // Crie um URL para o Blob
        var url = URL.createObjectURL(blob);
    
        // Crie um elemento de link para fazer o download
        var link = document.createElement("a");
        link.href = url;
        link.download = filename; // Nome do arquivo que será baixado
        link.click();
    
        // Limpe o URL criado para o Blob
        URL.revokeObjectURL(url);
    }

    createGenerateJsonButton() {
        let rectangle = this.add.rectangle(window.innerWidth*0.90,750, 300, 120, 0xffffff);
        rectangle.setStrokeStyle(1,0x000000)
        const text = this.add.text(rectangle.x, 750, 'Gerar JSON', {
            fontSize: '22px',
            fill: '#000000',
            align: 'center',
        });
    
        // Center the text in the middle of the rectangle
        text.setOrigin(0.5);

        rectangle.setInteractive();

        rectangle.on('pointerover', function () {
            rectangle.setFillStyle(0xcccccc); // Define a cor do retângulo para cinza
        });

        rectangle.on('pointerout', function () {
            // Este código será executado quando o mouse sair do retângulo
            
            rectangle.setFillStyle(0xffffff);
        });

        rectangle.on('pointerdown', () => {
            // Este código será executado quando o retângulo for clicado
            let jsonData = []
            for(let i = 0; i < this.blocksArray.length; i++) {
                jsonData.push([])
                for(let j = 0; j < this.blocksArray[i].length; j++) {
                    let block = this.blocksArray[i][j]
                    jsonData[i].push(block)
                }
            }       
            this.downloadJSON(jsonData)
        });
    }
    

    create ()
    {
        this.gameWidth = window.innerWidth;
        this.gameHeight = window.innerHeight;
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
        this.createGenerateJsonButton()
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

            if(this.rightButtonIsPressed) {
                let calculated = this.calculateGridIndex(this.mousePos.x, this.mousePos.y, 32)
                this.gridMouseIndex = calculated
                this.blocksArray[calculated.i][calculated.j] = this.selectedBlock
                this.tiles[calculated.i][calculated.j].setFillStyle(this.selectedColor)
            }
        });
        this.input.on('wheel', this.onScroll.bind(this));

        this.cameras.main.setSize(this.gameWidth, this.gameHeight);
        this.cameras.main.setZoom(1);

        // Recalcular o número de linhas e colunas do grid
        const numRows = Math.ceil(this.gameHeight / this.tileSize);
        const numCols = Math.ceil(this.gameWidth / this.tileSize);

        this.input.on('pointerdown', (pointer, gameObjects) => {
            // Verifique se o botão direito do mouse foi pressionado
            if (pointer.rightButtonDown()) {
                // Evite o comportamento padrão do menu de contexto
                event.preventDefault();

                this.rightButtonIsPressed = !this.rightButtonIsPressed;
            }
        });
    }

    update() {
        if(this.mouseIsPressed) {
            const tileSize = 32; // Tamanho do tile, ajuste conforme necessário
            const { i, j } = this.calculateGridIndex(this.mousePos.x, this.mousePos.y, tileSize);
            this.tiles[i][j].setFillStyle(this.selectedColor);
        }
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