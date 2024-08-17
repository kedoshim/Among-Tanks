import pygame
import pygame_gui
import LevelBuilder
import constraints
import utils
from TriangularButton import TriangularButton

class ResizableScreen:
    def __init__(self, grid_size=32):

        
        # Inicialize o pygame
        pygame.init()



        # Configurações da tela
        self.WINDOW_SIZE = (constraints.SCREEN_WIDTH, constraints.SCREEN_HEIGHT)
        self.level = LevelBuilder.LevelBuilder(constraints.SCREEN_WIDTH//grid_size, constraints.SCREEN_HEIGHT//grid_size)
        self.screen = pygame.display.set_mode(self.WINDOW_SIZE)
        pygame.display.set_caption('Level Builder')

        self.button_ids = {}

        self.selected_block = None
        self.draw_tile_angle = 0
        

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
        
        
        self.selected_block_display = pygame_gui.elements.UIButton(
            relative_rect=pygame.Rect((constraints.BLOCK_SELECTOR_WIDTH//2 - constraints.SELECTED_BLOCK_WEIGHT//2, 15), 
                                    (constraints.SELECTED_BLOCK_WEIGHT,constraints.SELECTED_BLOCK_WEIGHT)),
            manager=self.manager,
            text='',
            container=self.selected_block_container,
            object_id="selected_block"
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
    
    def draw_square_on_tile(self):
        key = self.selected_block
        if key != None:
            if "render_type" in self.level.blocks[key]:
                pass
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
                        if self.selected_block != None:
                            tile_x, tile_y = self.get_tile_mouse_position((x,y))
                            key = self.selected_block
                            self.level.representation[tile_x][tile_y].color = (self.level.blocks[key]["color"]["r"], self.level.blocks[key]["color"]["g"], self.level.blocks[key]["color"]["b"])


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
            self.draw_grid()
            self.draw_square_on_tile()

            # Desenhe todos os elementos da interface
            self.manager.draw_ui(self.screen)
            
            

            # Atualize a tela
            pygame.display.update()

        # Finalize o pygame
        pygame.quit()

