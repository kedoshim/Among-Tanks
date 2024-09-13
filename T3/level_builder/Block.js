class Block {
    constructor() {
        this.blockSize = 4.0
        this.color = 0xffffff
    }

    parseJson() {
        return {
            "collision": this.collision,
            "type": this.type
        }
    }

    convertColors(r,g,b){
        this.color = this.rgbToHex(r,g,b)
    }

    rgbToHex(r, g, b) {
        // Garante que os valores estejam no intervalo de 0 a 255
        r = Math.max(0, Math.min(255, r));
        g = Math.max(0, Math.min(255, g));
        b = Math.max(0, Math.min(255, b));
    
        // Converte cada componente para hexadecimal e os concatena
        return ((r << 16) | (g << 8) | b);
    }
}