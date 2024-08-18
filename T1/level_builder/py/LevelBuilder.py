import json
from Block import Block

class LevelBuilder:
    def __init__(self, x, y) -> None:
        f = open("blocks.json")
        self.blocks = json.load(f)
        self.representation = self.create_array(x, y)
        self.size = (x, y)


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
            json.dump(level_arr, f, indent=4)
        