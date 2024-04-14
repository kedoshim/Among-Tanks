export class JsonDecoder {
    static decode(json) {
        let firstNotEmpty = JsonDecoder.findFirstNotEmpty(json)
        let newJson = {
            "offset": firstNotEmpty,
            "blocks": json
        }

        return newJson
    }

    static findFirstNotEmpty(blocksArray) {
        let block = {};
        for(let i = 0; i < blocksArray.length; i++) {
            for(let j = 0; j < blocksArray[i].length; j++) {
                if(blocksArray[i][j].type === "EmptyBlock") return {x:i, y:j}
            }
        }
    }

    static getSpawnPoints() {
        let spawnPoints = []
        for(let i = 0; i < blocksArray.length; i++) {
            for(let j = 0; j < blocksArray[i].length; j++) {
                if(blocksArray[i][j].type === "Spawn") spawnPoints.push([i, j])
            }
        }
    }
}