import json
from Block import Block

class LevelBuilder:
    def __init__(self, x, y) -> None:
        f = open("blocks.json")
        self.blocks = json.load(f)
        self.representation = self.create_array(x, y)


    def create_array(self, x, y) -> list[Block]:
        """
        Cria uma matriz de dimensões x por y, onde cada elemento é inicializado com valor_inicial.

        :param x: Número de linhas da matriz.
        :param y: Número de colunas da matriz.
        :param valor_inicial: Valor inicial para cada elemento da matriz (default é 0).
        :return: Matriz x por y com todos os elementos inicializados com valor_inicial.
        """
        return [[Block() for _ in range(y)] for _ in range(x)]
        