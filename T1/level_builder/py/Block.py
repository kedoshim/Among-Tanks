class Block:
    def __init__(self) -> None:
        self.color = (255, 255, 255)
        self.type = "EmptyBlock"
        self.collision = True
        

    def rgb_to_hexadecimal(self, r, g, b):
        return (r << 16) + (g << 8) + b
    
    def serialize_as_json(self):
        d = {}
        r,g,b = self.color
        d['color'] = self.rgb_to_hexadecimal(r,g,b)
        d['type'] = self.type
        d['blockSize'] = 4
        d['colision'] = True
        return d

        