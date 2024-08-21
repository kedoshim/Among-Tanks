def change_button_color(button, normal_color, hovered_color, active_color):
        button.colours['normal_bg'] = normal_color
        button.colours['hovered_bg'] = hovered_color
        button.colours['active_bg'] = active_color
        button.rebuild()

def rgb_to_hex(r, g, b):
    return '#{:02x}{:02x}{:02x}'.format(r, g, b)

def create_virtual_grid(x, y):
    return [[0 for _ in range(y)] for _ in range(x)]