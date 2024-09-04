import json
from Block import Block
import copy
import time

class LevelBuilder:
    def __init__(self, x, y) -> None:
        f = open("blocks.json")
        self.blocks = json.load(f)
        self.representation = self.create_array(x, y)
        self.size = (x, y)
        self.lighting = [[{} for _ in range(y)] for _ in range(x)]
        self.turret = []


    def create_array(self, x, y) -> list[Block]:
        """
        Cria uma matriz de dimensões x por y, onde cada elemento é inicializado com valor_inicial.

        :param x: Número de linhas da matriz.
        :param y: Número de colunas da matriz.
        :param valor_inicial: Valor inicial para cada elemento da matriz (default é 0).
        :return: Matriz x por y com todos os elementos inicializados com valor_inicial.
        """
        return [[Block() for _ in range(y)] for _ in range(x)]
    
    
    def remove_empty_borders(self, json_data):
        first_in_z = 0
        first_in_x = 0
        last_in_z = len(json_data) - 1
        last_in_x = len(json_data[0]) - 1

        # Analyze z
        for i in range(len(json_data)):
            has_non_empty_block = False
            for j in range(len(json_data[i])):
                if json_data[i][j]['type'] != "EmptyBlock":
                    has_non_empty_block = True
                    break
            if has_non_empty_block:
                first_in_z = i
                break

        # Analyze x
        for i in range(len(json_data[0])):
            has_non_empty_block = False
            for j in range(len(json_data)):
                if json_data[j][i]['type'] != "EmptyBlock":
                    has_non_empty_block = True
                    break
            if has_non_empty_block:
                first_in_x = i
                break

        # Analyze last z
        for i in range(len(json_data) - 1, -1, -1):
            has_non_empty_block = False
            for j in range(len(json_data[i])):
                if json_data[i][j]['type'] != "EmptyBlock":
                    has_non_empty_block = True
                    break
            if has_non_empty_block:
                last_in_z = i
                break

        # Analyze last x
        for i in range(len(json_data[0]) - 1, -1, -1):
            has_non_empty_block = False
            for j in range(len(json_data)):
                if json_data[j][i]['type'] != "EmptyBlock":
                    has_non_empty_block = True
                    break
            if has_non_empty_block:
                last_in_x = i
                break

        # Remove empty rows and columns
        json_data = json_data[first_in_z:last_in_z + 1]
        for i in range(len(json_data)):
            json_data[i] = json_data[i][first_in_x:last_in_x + 1]

        return json_data, first_in_x, first_in_z

    
    def save_json(self):
        level_rep = self.representation
        x, y = self.size
        original_level_arr = [[{} for _ in range(y)] for _ in range(x)]
        
        for i in range(len(level_rep)):
            
            for j in range(len(level_rep[i])):
                block_d = level_rep[i][j].serialize_as_json()
                original_level_arr[i][j] = block_d

        level_arr, first_in_x, first_in_z = self.remove_empty_borders(original_level_arr)

        lighting_reduced = []
        turret_reduced = copy.deepcopy(self.turret)

        for i in range(len(self.lighting)):
            for j in range(len(self.lighting[0])):
                if 'angle' in self.lighting[i][j]:
                    lighting_reduced.append({
                        'x': i - first_in_z,
                        'y': j - first_in_x,
                        "angle": self.lighting[i][j]["angle"],
                        "color": self.lighting[i][j]["color"]
                    })

        for i in range(len(self.turret)):
            turret_reduced[i]["x"] -= first_in_z
            turret_reduced[i]["y"] -= first_in_x

       

        with open(f"{time.time()}_level.json", 'w+') as f:
            json.dump({"blocks": level_arr, "lighting": lighting_reduced, "turrets": turret_reduced}, f, indent=4)
        
        with open(f"{time.time()}_to_import.json", 'w+') as f:
            json.dump({"blocks": original_level_arr, "lighting": self.lighting, "turrets": self.turret}, f, indent=4)

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
        self.lighting = decoded["lighting"]
        self.turret = decoded["turrets"]

    def erase(self, tile_x, tile_y):
        if "color" in self.lighting[tile_x][tile_y]:
            self.lighting[tile_x][tile_y] = {}
        else:
            self.representation[tile_x][tile_y] = Block()
        