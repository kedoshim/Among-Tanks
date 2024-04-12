class JsonDecoder {
    static decode(json) {
        let firstNotEmpty = JsonDecoder.findFirstNotEmpty(json)
        let newJson = {
            "offset": firstNotEmpty
        }

        return newJson
    }

    static findFirstNotEmpty(blocksArray) {
        let block = {};
        for(let i = 0; i < blocksArray.length; i++) {
            for(let j = 0; j < blocksArray[i].length; j++) {
                console.log(i)
                console.log(j)
            }
        }
        return block;
    }
}