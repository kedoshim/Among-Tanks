class Block {
    constructor() {
        this.blockSize = 4.0
    }

    parseJson() {
        return {
            "collision": this.collision,
            "type": this.type
        }
    }
}