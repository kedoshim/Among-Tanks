import pygame
import pygame_gui

class UITriangleButton(pygame_gui.elements.UIImage):
    def __init__(self, relative_rect, manager, triangle_color=(255, 0, 0), container=None):
        # Cria uma superfície vazia
        surface = pygame.Surface((relative_rect.width, relative_rect.height), pygame.SRCALPHA)
        super().__init__(relative_rect=relative_rect, manager=manager, container=container, image_surface=surface)
        self.triangle_color = triangle_color
        self._draw_triangle()

    def _draw_triangle(self):
        self.image_surface.fill((0, 0, 0, 0))  # Limpa a superfície
        rect = self.relative_rect
        triangle_points = [
            (rect.left + rect.width // 2, rect.top),
            (rect.left, rect.bottom),
            (rect.right, rect.bottom)
        ]
        pygame.draw.polygon(self.image_surface, self.triangle_color, triangle_points)

    def process_event(self, event):
        if event.type == pygame.MOUSEBUTTONDOWN:
            mouse_pos = pygame.mouse.get_pos()
            if self._is_point_inside_triangle(mouse_pos):
                self.on_click()
        return super().process_event(event)

    def _is_point_inside_triangle(self, point):
        rect = self.relative_rect
        triangle_points = [
            (rect.left + rect.width // 2, rect.top),
            (rect.left, rect.bottom),
            (rect.right, rect.bottom)
        ]
        x, y = point
        def sign(p1, p2, p3):
            return (p1[0] - p3[0]) * (p2[1] - p3[1]) - (p2[0] - p3[0]) * (p1[1] - p3[1])

        b1 = sign(point, triangle_points[0], triangle_points[1]) < 0.0
        b2 = sign(point, triangle_points[1], triangle_points[2]) < 0.0
        b3 = sign(point, triangle_points[2], triangle_points[0]) < 0.0

        return (b1 == b2) and (b2 == b3)

    def on_click(self):
        print("Triangle button clicked!")

# Inicialização do Pygame
pygame.init()
pygame.display.set_caption('Custom Triangle Button')
window_surface = pygame.display.set_mode((800, 600))

# Inicialização do Pygame GUI
manager = pygame_gui.UIManager((800, 600))

# Criar o botão triangular
triangle_button = UITriangleButton(
    relative_rect=pygame.Rect((300, 250), (200, 200)),
    manager=manager,
    triangle_color=(0, 255, 0)
)

clock = pygame.time.Clock()
is_running = True
while is_running:
    time_delta = clock.tick(60) / 1000.0

    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            is_running = False
        manager.process_events(event)
        triangle_button.process_event(event)

    manager.update(time_delta)

    window_surface.fill((0, 0, 0))
    manager.draw_ui(window_surface)

    pygame.display.update()

pygame.quit()
