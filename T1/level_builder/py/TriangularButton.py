from pygame_gui.elements import UIButton
import pygame
import pygame_gui

class TriangularButton(pygame_gui.elements.UIButton):
    def __init__(self, relative_rect, color, manager, container=None, **kwargs):
        super().__init__(relative_rect, '', manager, container=container, **kwargs)
        self.color = color
        self._triangle_surface = pygame.Surface((relative_rect.width, relative_rect.height), pygame.SRCALPHA)
        self._draw_triangle()

    def _draw_triangle(self):
        self._triangle_surface.fill((0, 0, 0, 0))  # Limpa a superfície com transparência
        rect = self._triangle_surface.get_rect()
        self.draw_triangle(self._triangle_surface, self.color, rect)

    def update(self, time_delta):
        super().update(time_delta)

    def draw(self, surface):
        # Desenha o botão normalmente
        surface.blit(self._triangle_surface, self.rect.topleft)
        super().draw(surface)
        # Desenha o texto no centro do triângulo
        if self.text:
            text_surface = self.font.render(self.text, True, pygame.Color('#FFFFFF'))
            text_rect = text_surface.get_rect(center=self.rect.center)
            surface.blit(text_surface, text_rect)
