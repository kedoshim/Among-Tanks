import pygame
import pygame_gui
import LevelBuilder
import constraints
import utils
from TriangularButton import TriangularButton
import math
import Block

class ResizableScreen:
    def __init__(self, grid_size=32):
        
        # Inicialize o pygame
        pygame.init()

        # Configurações da tela
        self.WINDOW_SIZE = (constraints.SCREEN_WIDTH, constraints.SCREEN_HEIGHT)
        self.level = LevelBuilder.LevelBuilder(constraints.SCREEN_WIDTH//grid_size, constraints.SCREEN_HEIGHT//grid_size)
        self.level.load_from()
        self.screen = pygame.display.set_mode(self.WINDOW_SIZE)
        pygame.display.set_caption('Level Builder')

        self.button_ids = {}

        self.selected_block = None
        self.draw_tile_angle = 0
        self.angle = 0
        

        # Inicialize o gerenciador de interface do pygame_gui
        self.manager = pygame_gui.UIManager(self.WINDOW_SIZE)

        # Crie uma janela (UIWindow) que atuará como contêiner
        self.container = pygame_gui.elements.UIWindow(
            pygame.Rect((constraints.SCREEN_WIDTH-constraints.BLOCK_SELECTOR_WIDTH, 0), (constraints.BLOCK_SELECTOR_WIDTH, constraints.BLOCK_SELECTOR_HEIGHT)),
            manager=self.manager,
            window_display_title="Block selector"
            
        )
        self.selected_block_container = pygame_gui.elements.UIWindow(
            pygame.Rect((constraints.SCREEN_WIDTH-constraints.BLOCK_SELECTOR_WIDTH, constraints.BLOCK_SELECTOR_HEIGHT), 
                        (constraints.BLOCK_SELECTOR_WIDTH, constraints.SELECTED_BLOCK_CONTAINER_HEIGHT)),
            manager=self.manager,
            window_display_title="Selected Block"
            
        )

        self.generate_json_container = pygame_gui.elements.UIWindow(
            pygame.Rect((constraints.SCREEN_WIDTH-constraints.BLOCK_SELECTOR_WIDTH, constraints.BLOCK_SELECTOR_HEIGHT+constraints.SELECTED_BLOCK_CONTAINER_HEIGHT), 
                        (constraints.BLOCK_SELECTOR_WIDTH, constraints.SELECTED_BLOCK_CONTAINER_HEIGHT)),
            manager=self.manager,
            window_display_title="Generate JSON"
            
        )

        self.generate_json_button = pygame_gui.elements.UIButton(
            relative_rect=pygame.Rect((constraints.BLOCK_SELECTOR_WIDTH//2 - 40, 15), 
                                    (80,40)),
            manager=self.manager,
            text='Gerar JSON',
            container=self.generate_json_container,
            object_id="generate_json"
        )
        
        
        self.selected_block_display = pygame_gui.elements.UIButton(
            relative_rect=pygame.Rect((constraints.BLOCK_SELECTOR_WIDTH//2 - constraints.SELECTED_BLOCK_WEIGHT//2, 15), 
                                    (constraints.SELECTED_BLOCK_WEIGHT,constraints.SELECTED_BLOCK_WEIGHT)),
            manager=self.manager,
            text='',
            container=self.selected_block_container,
            object_id="selected_block"
        )

        self.properties_container = pygame_gui.elements.UIWindow(
            pygame.Rect((constraints.SCREEN_WIDTH-constraints.BLOCK_SELECTOR_WIDTH, constraints.BLOCK_SELECTOR_HEIGHT+constraints.SELECTED_BLOCK_CONTAINER_HEIGHT+constraints.SELECTED_BLOCK_CONTAINER_HEIGHT), 
                        (constraints.BLOCK_SELECTOR_WIDTH, constraints.SELECTED_BLOCK_CONTAINER_HEIGHT*2)),
            manager=self.manager,
            window_display_title="Change properties"
            
        )

        self.set_properties_button = pygame_gui.elements.UIButton(
            relative_rect=pygame.Rect((constraints.BLOCK_SELECTOR_WIDTH//2 - constraints.SELECTED_BLOCK_WEIGHT//2*2, constraints.SELECTED_BLOCK_CONTAINER_HEIGHT*2 - 70), 
                                    (constraints.SELECTED_BLOCK_WEIGHT*2,30)),
            manager=self.manager,
            text='Submeter',
            container=self.properties_container,
            object_id="set_properties"
        )

        self.block_buttons = []
        self.draw_block_selector()

        self.drawable_area = constraints.SCREEN_WIDTH-constraints.BLOCK_SELECTOR_WIDTH

        # Crie um botão dentro da janela
        # self.button = pygame_gui.elements.UIButton(
        #     relative_rect=pygame.Rect((150, 100), (100, 50)),
        #     text='Clique-me',
        #     manager=self.manager,
        #     container=self.container
        # )

        

        # Configura o relógio para controlar a taxa de quadros
        self.clock = pygame.time.Clock()

        # Tamanho do grid
        self.grid_size = grid_size
        self.create_wall_properties()
        self.create_ground_properties()
        self.create_light_properties()
        

    def create_wall_properties(self):
        self.wall_r_color = pygame_gui.elements.UITextEntryLine(
            relative_rect=pygame.Rect((constraints.BLOCK_SELECTOR_WIDTH/2 - 50, 5), (100, 20)),
            manager=self.manager,
            container=self.properties_container
        )
        self.wall_r_label = pygame_gui.elements.UILabel(
            relative_rect=pygame.Rect((constraints.BLOCK_SELECTOR_WIDTH/2 - 70, 5), (20, 20)),
            text="R:",
            manager=self.manager,
            container=self.properties_container
        )

        # Entrada e rótulo para a cor G
        self.wall_g_color = pygame_gui.elements.UITextEntryLine(
            relative_rect=pygame.Rect((constraints.BLOCK_SELECTOR_WIDTH/2 - 50, 30), (100, 20)),  # Ajuste no y para 30
            manager=self.manager,
            container=self.properties_container
        )
        self.wall_g_label = pygame_gui.elements.UILabel(
            relative_rect=pygame.Rect((constraints.BLOCK_SELECTOR_WIDTH/2 - 70, 30), (20, 20)),  # Ajuste no y para 30
            text="G:",
            manager=self.manager,
            container=self.properties_container
        )

        # Entrada e rótulo para a cor B
        self.wall_b_color = pygame_gui.elements.UITextEntryLine(
            relative_rect=pygame.Rect((constraints.BLOCK_SELECTOR_WIDTH/2 - 50, 55), (100, 20)),  # Ajuste no y para 55
            manager=self.manager,
            container=self.properties_container
        )
        self.wall_b_label = pygame_gui.elements.UILabel(
            relative_rect=pygame.Rect((constraints.BLOCK_SELECTOR_WIDTH/2 - 70, 55), (20, 20)),  # Ajuste no y para 55
            text="B:",
            manager=self.manager,
            container=self.properties_container
        )

        self.wall_r_color.hide()
        self.wall_g_color.hide()
        self.wall_b_color.hide()
        self.wall_r_label.hide()
        self.wall_g_label.hide()
        self.wall_b_label.hide()

        self.wall_properties = {
            "r": {
                "value": self.wall_r_color, "label": self.wall_r_label
            },
            "g": {
                "value": self.wall_g_color, "label": self.wall_g_label
            },
            "b": {
                "value": self.wall_b_color, "label": self.wall_b_label
            }
        }

    def create_ground_properties(self):
        self.ground_r_color = pygame_gui.elements.UITextEntryLine(
            relative_rect=pygame.Rect((constraints.BLOCK_SELECTOR_WIDTH/2 - 50, 5), (100, 20)),
            manager=self.manager,
            container=self.properties_container
        )
        self.ground_r_label = pygame_gui.elements.UILabel(
            relative_rect=pygame.Rect((constraints.BLOCK_SELECTOR_WIDTH/2 - 70, 5), (20, 20)),
            text="R:",
            manager=self.manager,
            container=self.properties_container
        )

        # Entrada e rótulo para a cor G
        self.ground_g_color = pygame_gui.elements.UITextEntryLine(
            relative_rect=pygame.Rect((constraints.BLOCK_SELECTOR_WIDTH/2 - 50, 30), (100, 20)),  # Ajuste no y para 30
            manager=self.manager,
            container=self.properties_container
        )
        self.ground_g_label = pygame_gui.elements.UILabel(
            relative_rect=pygame.Rect((constraints.BLOCK_SELECTOR_WIDTH/2 - 70, 30), (20, 20)),  # Ajuste no y para 30
            text="G:",
            manager=self.manager,
            container=self.properties_container
        )

        # Entrada e rótulo para a cor B
        self.ground_b_color = pygame_gui.elements.UITextEntryLine(
            relative_rect=pygame.Rect((constraints.BLOCK_SELECTOR_WIDTH/2 - 50, 55), (100, 20)),  # Ajuste no y para 55
            manager=self.manager,
            container=self.properties_container
        )
        self.ground_b_label = pygame_gui.elements.UILabel(
            relative_rect=pygame.Rect((constraints.BLOCK_SELECTOR_WIDTH/2 - 70, 55), (20, 20)),  # Ajuste no y para 55
            text="B:",
            manager=self.manager,
            container=self.properties_container
        )

        self.ground_r_color.hide()
        self.ground_g_color.hide()
        self.ground_b_color.hide()
        self.ground_r_label.hide()
        self.ground_g_label.hide()
        self.ground_b_label.hide()

        self.ground_properties = {
            "r": {
                "value": self.ground_r_color, "label": self.ground_r_label
            },
            "g": {
                "value": self.ground_g_color, "label": self.ground_g_label
            },
            "b": {
                "value": self.ground_b_color, "label": self.ground_b_label
            }
        }

    def create_light_properties(self):
        self.light_r_color = pygame_gui.elements.UITextEntryLine(
            relative_rect=pygame.Rect((constraints.BLOCK_SELECTOR_WIDTH/2 - 50, 5), (100, 20)),
            manager=self.manager,
            container=self.properties_container
        )
        self.light_r_label = pygame_gui.elements.UILabel(
            relative_rect=pygame.Rect((constraints.BLOCK_SELECTOR_WIDTH/2 - 70, 5), (20, 20)),
            text="R:",
            manager=self.manager,
            container=self.properties_container
        )

        # Entrada e rótulo para a cor G
        self.light_g_color = pygame_gui.elements.UITextEntryLine(
            relative_rect=pygame.Rect((constraints.BLOCK_SELECTOR_WIDTH/2 - 50, 30), (100, 20)),  # Ajuste no y para 30
            manager=self.manager,
            container=self.properties_container
        )
        self.light_g_label = pygame_gui.elements.UILabel(
            relative_rect=pygame.Rect((constraints.BLOCK_SELECTOR_WIDTH/2 - 70, 30), (20, 20)),  # Ajuste no y para 30
            text="G:",
            manager=self.manager,
            container=self.properties_container
        )

        # Entrada e rótulo para a cor B
        self.light_b_color = pygame_gui.elements.UITextEntryLine(
            relative_rect=pygame.Rect((constraints.BLOCK_SELECTOR_WIDTH/2 - 50, 55), (100, 20)),  # Ajuste no y para 55
            manager=self.manager,
            container=self.properties_container
        )
        self.light_b_label = pygame_gui.elements.UILabel(
            relative_rect=pygame.Rect((constraints.BLOCK_SELECTOR_WIDTH/2 - 70, 55), (20, 20)),  # Ajuste no y para 55
            text="B:",
            manager=self.manager,
            container=self.properties_container
        )

        self.light_r_color.hide()
        self.light_g_color.hide()
        self.light_b_color.hide()
        self.light_r_label.hide()
        self.light_g_label.hide()
        self.light_b_label.hide()

        self.light_properties = {
            "r": {
                "value": self.light_r_color, "label": self.light_r_label
            },
            "g": {
                "value": self.light_g_color, "label": self.light_g_label
            },
            "b": {
                "value": self.light_b_color, "label": self.light_b_label
            }
        }


    def propagate_color(self, color, block_type):
        if block_type == "lighting":
            for i in range(len(self.level.lighting)):
                for j in range(len(self.level.lighting[i])):
                    if "color" in self.level.lighting[i][j]:
                        self.level.lighting[i][j]["color"] = color
        else:
            for i in range(len(self.level.representation)):
                for j in range(len(self.level.representation[i])):
                    if self.level.representation[i][j].type == block_type:
                        self.level.representation[i][j].color = color

    def set_properties(self):
        if self.properties_type == "lighting":
            r = int(self.light_properties["r"]["value"].get_text())
            g = int(self.light_properties["g"]["value"].get_text())
            b = int(self.light_properties["b"]["value"].get_text())
            self.propagate_color((r,g,b), self.properties_type)
        if self.properties_type == "WallBlock":
            r = int(self.wall_properties["r"]["value"].get_text())
            g = int(self.wall_properties["g"]["value"].get_text())
            b = int(self.wall_properties["b"]["value"].get_text())
            self.propagate_color((r,g,b), self.properties_type)
        
        if self.properties_type == "GroundBlock":
            r = int(self.ground_properties["r"]["value"].get_text())
            g = int(self.ground_properties["g"]["value"].get_text())
            b = int(self.ground_properties["b"]["value"].get_text())
            self.propagate_color((r,g,b), self.properties_type)

    def create_triangular_button(self, manager, position, size, color, hover_color=None, text=''):
    # Cria uma superfície triangular
        def draw_triangle(surface, color):
            surface.fill((0, 0, 0, 0))  # Transparente
            width, height = size
            points = [(width // 2, 0), (width, height), (0, height)]
            pygame.draw.polygon(surface, color, points)

        surface_normal = pygame.Surface(size, pygame.SRCALPHA)
        draw_triangle(surface_normal, color)

        # Surface para quando o botão está com o mouse em cima
        if hover_color:
            surface_hover = pygame.Surface(size, pygame.SRCALPHA)
            draw_triangle(surface_hover, hover_color)
        else:
            surface_hover = surface_normal

        # Cria o botão com a surface normal
        button = pygame_gui.elements.UIButton(
            relative_rect=pygame.Rect(position, size),
            text=text,
            manager=manager,
            container=self.container,
            object_id='#triangular_button'
        )
        button.set_image(surface_normal)

        # Altera a imagem conforme o estado do botão
        def update_button_image():
            if button.is_focused:
                button.set_image(surface_hover)
            else:
                button.set_image(surface_normal)

        button.update_button_image = update_button_image

        return button
    
    def hide_all(self):
        print("Hide all")
        for key in self.wall_properties:
                keys = self.wall_properties[key]
                for k in keys:
                    self.wall_properties[key][k].hide()

        for key in self.ground_properties:
                    keys = self.ground_properties[key]
                    for k in keys:
                        self.ground_properties[key][k].hide()

    def open_properties_window(self, pos):
        x, y = pos
        if not self.level.representation[x][y].type == "EmptyBlock" or "color" in self.level.lighting[x][y]:
            self.hide_all()

        if "color" in self.level.lighting[x][y]:
            self.properties_type = "lighting"
            for key in self.light_properties:
                keys = self.light_properties[key]
                for k in keys:
                    self.light_properties[key][k].show()
        elif self.level.representation[x][y].type == "WallBlock":
            self.properties_type = "WallBlock"
            for key in self.wall_properties:
                keys = self.wall_properties[key]
                for k in keys:
                    self.wall_properties[key][k].show()
            
        elif self.level.representation[x][y].type == "GroundBlock":
            self.properties_type = "GroundBlock"
            for key in self.ground_properties:
                keys = self.ground_properties[key]
                for k in keys:
                    self.ground_properties[key][k].show()

    def draw_block_selector(self):
        i = False
        index = 0
        for key in self.level.blocks:
            block = self.level.blocks[key]
            color = block["color"]
            
            button = pygame_gui.elements.UIButton(
                relative_rect=pygame.Rect((40 if i == False else constraints.BLOCK_SELECTOR_WIDTH-40-constraints.BLOCK_SIZE, 
                                        (int(index // 2) + 1) * constraints.BLOCK_SELECTOR_GAP_Y), 
                                        (constraints.BLOCK_SIZE, constraints.BLOCK_SIZE)),
                manager=self.manager,
                text='',
                container=self.container,
                object_id=key
            )

            pygame_gui.elements.UILabel(
                relative_rect=pygame.Rect((30 if i == False else constraints.BLOCK_SELECTOR_WIDTH-50-constraints.BLOCK_SIZE, 
                                        (int(index // 2) + 1) * constraints.BLOCK_SELECTOR_GAP_Y + 42), (60, 15)),  # Ajuste no y para 55
                text=block["description"],
                manager=self.manager,
                container=self.container
            )
            
            utils.change_button_color(
                button,
                pygame.Color(utils.rgb_to_hex(color["r"], color["g"], color["b"])),  # Cor normal (vermelho)
                pygame.Color(utils.rgb_to_hex(color["r"], color["g"], color["b"])),  # Cor ao passar o mouse (verde)
                pygame.Color(utils.rgb_to_hex(color["r"], color["g"], color["b"]))   # Cor ao clicar (azul)
            )

            self.block_buttons.append(button)
            self.button_ids[button] = key
                # Alterna entre True e False para a próxima iteração
            i = not i
            index += 1
            


    def draw_grid(self):
        # Desenha linhas verticais
        for x in range(0, self.WINDOW_SIZE[0], self.grid_size):
            pygame.draw.line(self.screen, (200, 200, 200), (x, 0), (x, self.WINDOW_SIZE[1]), 1)
        
        # Desenha linhas horizontais
        for y in range(0, self.WINDOW_SIZE[1], self.grid_size):
            pygame.draw.line(self.screen, (200, 200, 200), (0, y), (self.WINDOW_SIZE[0], y), 1)

    
    def get_tile_mouse_position(self, mouse_pos):
        x, y = mouse_pos
        pos_x = x // self.grid_size
        pos_y = y // self.grid_size
        return pos_x, pos_y
    
    def draw_square_on_center(self, screen, color, center, size):
        """
        Desenha um quadrado com o centro em uma posição específica.
       
        Parâmetros:
        - screen: a superfície onde o quadrado será desenhado
        - color: cor do quadrado (RGB)
        - center: tupla (x, y) indicando a posição do centro do quadrado
        - size: tamanho do lado do quadrado
        """
        # Calcula a posição do canto superior esquerdo
        half_size = size // 2
        top_left_x = center[0] - half_size
        top_left_y = center[1] - half_size
       
        # Desenha o quadrado
        pygame.draw.rect(screen, color, (top_left_x, top_left_y, size, size))
    
    def get_triangle_points(self, pos, angle=0):
        _x, _y = pos
        x = _x * self.grid_size
        y = _y * self.grid_size
        first_vertex = (x, y + self.grid_size)
        second_vertex = (x + self.grid_size//2, y)
        third_vertex = (x + self.grid_size, y + self.grid_size)

        center_x = x + self.grid_size // 2
        center_y = y + self.grid_size // 2

        def rotate_point(px, py, cx, cy, angle):
            # Converte o ângulo para radianos
            rad = math.radians(angle)
            # Translaciona o ponto para a origem
            translated_x = px - cx
            translated_y = py - cy
            # Aplica a rotação
            rotated_x = translated_x * math.cos(rad) - translated_y * math.sin(rad)
            rotated_y = translated_x * math.sin(rad) + translated_y * math.cos(rad)
            # Translaciona de volta para a posição original
            final_x = rotated_x + cx
            final_y = rotated_y + cy
            return final_x, final_y

        first_vertex = rotate_point(*first_vertex, center_x, center_y, angle)
        second_vertex = rotate_point(*second_vertex, center_x, center_y, angle)
        third_vertex = rotate_point(*third_vertex, center_x, center_y, angle)

        return first_vertex, second_vertex, third_vertex


    def add_turret(self, x, y):
        (_x, _y) = pygame.mouse.get_pos()
        self.level.turret.append({
            "x": _x / self.grid_size,
            "y": _y / self.grid_size,
        })

    def get_correct_half(self, pos):
        x, y = self.get_tile_mouse_position(pos)
        _x, _y = pos
        output_x = 0
        output_y = 0
        if y == len(self.level.representation[0]) - 1:
            output_y = float(y - 0.5) * self.grid_size

        elif y == 0:
            output_y = 0.5 * self.grid_size

        else:
            real_y = (_y - y*self.grid_size) / self.grid_size
            target_y = -0.5 if real_y < 0.5 else 0.5
            output_y = (y + target_y) * self.grid_size
        if x == len(self.level.representation) - 1:
            output_x = float(x - 0.5) * self.grid_size

        elif x == 0:
            output_x = 0.5 * self.grid_size

        else:
            real_x = (_x - x*self.grid_size) / self.grid_size
            target_x = -0.5 if real_x < 0.5 else 0.5
            output_x = (x + target_x) * self.grid_size

    def draw_turret_block(self, pos, color=(255, 128, 0)):
            #real_pos = self.get_correct_half(pos)
        self.draw_square_on_center(self.screen, color, pos, self.grid_size*2)
    
    def draw_square_on_tile(self):
        key = self.selected_block
        if key != None:
            if "render_type" in self.level.blocks[key]:
                if self.level.blocks[key]["render_type"] == "triangle":
                    color = (self.level.blocks[self.selected_block]["color"]["r"], self.level.blocks[self.selected_block]["color"]["g"], 
                            self.level.blocks[self.selected_block]["color"]["b"])
                
                    mouse_pos = pygame.mouse.get_pos()
                    _x, _y = self.get_tile_mouse_position(mouse_pos)
                    pygame.draw.polygon(self.screen, color, self.get_triangle_points((_x, _y), self.angle))
                if self.level.blocks[key]["render_type"] == "eraser" or self.level.blocks[key]["render_type"] == "selector":
                    temp_surface = pygame.Surface((self.grid_size, self.grid_size), pygame.SRCALPHA)
                    # Initializing Color
                    color = (255,0,0)
                    mouse_pos = pygame.mouse.get_pos()
                    x, y = self.get_tile_mouse_position(mouse_pos)
                    if self.selected_block == None:
                        temp_surface.set_alpha(48)
                    else:
                        color = (self.level.blocks[self.selected_block]["color"]["r"], self.level.blocks[self.selected_block]["color"]["g"], 
                                self.level.blocks[self.selected_block]["color"]["b"])
                        temp_surface.set_alpha(255)
                    # Drawing Rectangle
                    pygame.draw.rect(temp_surface, color, pygame.Rect(0, 0, self.grid_size, self.grid_size))

                    # Blite a superfície temporária na tela
                    self.screen.blit(temp_surface, (x*self.grid_size, y*self.grid_size))

                if self.level.blocks[key]["render_type"] == "eraser" or self.level.blocks[key]["render_type"] == "selector":
                    temp_surface = pygame.Surface((self.grid_size, self.grid_size), pygame.SRCALPHA)
                    # Initializing Color
                    color = (255,0,0)
                    mouse_pos = pygame.mouse.get_pos()
                    x, y = self.get_tile_mouse_position(mouse_pos)
                    if self.selected_block == None:
                        temp_surface.set_alpha(48)
                    else:
                        color = (self.level.blocks[self.selected_block]["color"]["r"], self.level.blocks[self.selected_block]["color"]["g"], 
                                self.level.blocks[self.selected_block]["color"]["b"])
                        temp_surface.set_alpha(255)
                    # Drawing Rectangle
                    pygame.draw.rect(temp_surface, color, pygame.Rect(0, 0, self.grid_size, self.grid_size))

                    # Blite a superfície temporária na tela
                    self.screen.blit(temp_surface, (x*self.grid_size, y*self.grid_size))

                if self.level.blocks[key]["render_type"] == "turret":
                    color = (self.level.blocks[self.selected_block]["color"]["r"], self.level.blocks[self.selected_block]["color"]["g"],
                                self.level.blocks[self.selected_block]["color"]["b"])
                    self.draw_turret_block(pygame.mouse.get_pos(), color)
            else:
                temp_surface = pygame.Surface((self.grid_size, self.grid_size), pygame.SRCALPHA)
                # Initializing Color
                color = (255,0,0)
                mouse_pos = pygame.mouse.get_pos()
                x, y = self.get_tile_mouse_position(mouse_pos)
                if self.selected_block == None:
                    temp_surface.set_alpha(48)
                else:
                    color = (self.level.blocks[self.selected_block]["color"]["r"], self.level.blocks[self.selected_block]["color"]["g"], 
                            self.level.blocks[self.selected_block]["color"]["b"])
                    temp_surface.set_alpha(255)
                # Drawing Rectangle
                pygame.draw.rect(temp_surface, color, pygame.Rect(0, 0, self.grid_size, self.grid_size))

                # Blite a superfície temporária na tela
                self.screen.blit(temp_surface, (x*self.grid_size, y*self.grid_size))


    def run(self):
        # Loop principal
        running = True
        while running:
            time_delta = self.clock.tick(60) / 1000.0

            # Eventos
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    running = False
                
                self.manager.process_events(event)

                if event.type == pygame.MOUSEBUTTONDOWN:
                    if event.button == 1:  # Botão esquerdo do mouse
                        x, y = event.pos
                        mouse_pos = (x,y)
                        if self.container.rect.collidepoint(mouse_pos):
                            print("Clique no Block Selector container")
                        elif self.selected_block_container.rect.collidepoint(mouse_pos):
                            print("Clique no Selected Block container")
                        elif self.generate_json_container.rect.collidepoint(mouse_pos):
                            print("Clique no Generate JSON container")
                        elif self.properties_container.rect.collidepoint(mouse_pos):
                            print("Clique no Properties container")
                        elif self.selected_block != None:
                            tile_x, tile_y = self.get_tile_mouse_position((x,y))
                            key = self.selected_block
                            if not "render_type" in self.level.blocks[key]:
                                self.level.representation[tile_x][tile_y].color = (self.level.blocks[key]["color"]["r"], self.level.blocks[key]["color"]["g"], self.level.blocks[key]["color"]["b"])
                                self.level.representation[tile_x][tile_y].type = self.level.blocks[key]["description"]
                            elif self.level.blocks[key]["render_type"] == "triangle":
                                self.level.lighting[tile_x][tile_y]["angle"] = self.angle
                                self.level.lighting[tile_x][tile_y]['color'] = (self.level.blocks[key]["color"]["r"], self.level.blocks[key]["color"]["g"], self.level.blocks[key]["color"]["b"])
                            elif self.level.blocks[key]["render_type"] == "eraser":
                                self.level.erase(tile_x, tile_y)
                            elif self.level.blocks[key]["render_type"] == "selector":
                                self.open_properties_window((tile_x, tile_y))
                            elif self.level.blocks[key]["render_type"] == "turret":
                                self.add_turret(x, y)

                if event.type == pygame.MOUSEWHEEL:
                    if event.y > 0:
                        if self.angle > 0:
                            self.angle -= 5
                    elif event.y < 0:
                        if self.angle < 360:
                            self.angle += 5



                # Verifique o tipo de evento e o ID
                if event.type == pygame_gui.UI_BUTTON_PRESSED:
                    
                    clicked_button = event.ui_element
                    if clicked_button in self.button_ids:
                        key = self.button_ids[clicked_button]
                        self.selected_block = key
                        color = self.level.blocks[key]["color"]
                        utils.change_button_color(
                            self.selected_block_display,
                            pygame.Color(utils.rgb_to_hex(color["r"], color["g"], color["b"])),  # Cor normal (vermelho)
                            pygame.Color(utils.rgb_to_hex(color["r"], color["g"], color["b"])),  # Cor ao passar o mouse (verde)
                            pygame.Color(utils.rgb_to_hex(color["r"], color["g"], color["b"]))   # Cor ao clicar (azul)
                        )

                    if clicked_button == self.generate_json_button:
                        print("Gerando json")
                        self.level.save_json()

                    if clicked_button == self.set_properties_button:
                        print("MADDOG")
                        self.set_properties()

            # Atualize o gerenciador de interface
            self.manager.update(time_delta)

            # Preencha a tela com uma cor
            self.screen.fill((255, 255, 255))

            # Desenhe o grid
            
            #print(self.level.representation)
            for i in range(len(self.level.representation)):
                for j in range(len(self.level.representation[i])):
                    block = self.level.representation[i][j]
                    temp_surface = pygame.Surface((self.grid_size, self.grid_size), pygame.SRCALPHA)
                    # Initializing Color
                    color = block.color
                    temp_surface.set_alpha(255)
                    # Drawing Rectangle
                    pygame.draw.rect(temp_surface, color, pygame.Rect(0, 0, self.grid_size, self.grid_size))

                    # Blite a superfície temporária na tela
                    self.screen.blit(temp_surface, (i*self.grid_size, j*self.grid_size))

            for i in range(len(self.level.lighting)):
                for j in range(len(self.level.lighting[i])):
                    if "color" in self.level.lighting[i][j]:
                        
                        color = self.level.lighting[i][j]["color"]
                        pygame.draw.polygon(self.screen, color, self.get_triangle_points((i, j), self.level.lighting[i][j]["angle"]))

            for i in range(len(self.level.turret)):
                turret = self.level.turret[i]
                x = turret["x"]
                y = turret["y"]
                temp_surface = pygame.Surface((self.grid_size, self.grid_size), pygame.SRCALPHA)
                # Initializing Color
                color = self.level.blocks["turret"]["color"]
                _color = (color["r"], color["g"], color["b"])
                temp_surface.set_alpha(255)
                # Drawing Rectangle
                pygame.draw.rect(temp_surface, _color, pygame.Rect(0, 0, self.grid_size, self.grid_size))

                # Blite a superfície temporária na tela
                self.screen.blit(temp_surface, (x*self.grid_size, y*self.grid_size))

            self.draw_grid()
            self.draw_square_on_tile()

            # Desenhe todos os elementos da interface
            self.manager.draw_ui(self.screen)
            
            

            # Atualize a tela
            pygame.display.update()

        # Finalize o pygame
        pygame.quit()

