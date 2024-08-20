import json
from Block import Block

class LevelBuilder:
    def __init__(self, x, y) -> None:
        f = open("blocks.json")
        self.blocks = json.load(f)
        self.representation = self.create_array(x, y)
        self.size = (x, y)
        self.lightning = [[{} for _ in range(y)] for _ in range(x)]


    def create_array(self, x, y) -> list[Block]:
        """
        Cria uma matriz de dimensões x por y, onde cada elemento é inicializado com valor_inicial.

        :param x: Número de linhas da matriz.
        :param y: Número de colunas da matriz.
        :param valor_inicial: Valor inicial para cada elemento da matriz (default é 0).
        :return: Matriz x por y com todos os elementos inicializados com valor_inicial.
        """
        return [[Block() for _ in range(y)] for _ in range(x)]
    
    def save_json(self):
        level_rep = self.representation
        x, y = self.size
        level_arr = [[{} for _ in range(y)] for _ in range(x)]
        
        for i in range(len(level_rep)):
            
            for j in range(len(level_rep[i])):
                block_d = level_rep[i][j].serialize_as_json()
                level_arr[i][j] = block_d

        with open('level.json', 'w+') as f:
            json.dump({"blocks": level_arr, "lightning": self.lightning}, f, indent=4)

    def hex_to_rgb(self, hex_value):
        # Converte o valor inteiro em uma string hexadecimal, removendo o prefixo '0x'
        hex_value = f'{hex_value:06x}'
        
        # Divide o valor hexadecimal em componentes RGB
        r = int(hex_value[0:2], 16)
        g = int(hex_value[2:4], 16)
        b = int(hex_value[4:6], 16)
        
        return (r, g, b)


    def load_from(self):
        f = open("import.json")
        decoded = json.load(f)
        blocks = decoded["blocks"]
        for i in range(len(blocks)):
            for j in range(len(blocks[i])):
                b = Block()
                b.color = self.hex_to_rgb(blocks[i][j]["color"])
                b.type = blocks[i][j]["type"]
                self.representation[i][j] = b
        # self.representation = decoded["blocks"]
        self.lightning = decoded["lightning"]

    def erase(self, tile_x, tile_y):
        if "color" in self.lightning[tile_x][tile_y]:
            self.lightning[tile_x][tile_y] = {}
        else:
            self.representation[tile_x][tile_y] = Block()
        