export class JsonDecoder {
    static decode(json) {
        let firstNotEmpty = JsonDecoder.findFirstNotEmpty(json)
        let spawns = JsonDecoder.getSpawnPoints(json, firstNotEmpty)
        
        let newJson = {
            "offset": firstNotEmpty,
            "blocks": json,
            "spawn": spawns
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

    static getSpawnPoints(blocksArray, offset) {
        console.log(offset)
        let spawnPoints = []
        for(let i = 0; i < blocksArray.length; i++) {
            for(let j = 0; j < blocksArray[i].length; j++) {
                if(blocksArray[i][j].type === "Spawn") spawnPoints.push([i, j])
            }
        }

        return spawnPoints
    }
}