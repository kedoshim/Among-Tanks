import { createClient } from 'redis';





class Rooms {

    

    constructor(port) {
        this.run()
        
    }

    async run() {
        try {
            this.client = createClient();

            this.client.on('error', err => console.log('Redis Client Error', err));
            await this.client.connect();
            console.log("Redis connected successfully")
        }
        catch(e) {
            
        }
    }

    async create(id, user_id) {
        const exists = Object.keys(await this.client.hGetAll(id)).length !== 0 ? true : false;
        if(!exists) {
            console.log("Não existe")
            await this.client.hSet(id, {
                creation_date: Date.now().toLocaleString(),
                creation_user: user_id,
                players_connected: 1
            })
            let avaliableRooms = Object.keys(await this.client.hGetAll("rooms")).length !== 0 ? true : false;
            if(avaliableRooms === null) {
                let ob = {}
                ob[id] = 1
                await this.client.hSet("rooms", ob)
            }
            else {
                let rooms = await this.client.hGetAll("rooms")
                rooms[id] = 1
                await this.client.hSet("rooms", rooms)
            }
            console.log(JSON.stringify(await this.client.hGetAll("rooms")))
            
        }
        else {
            console.log("Já existe")
        }
    }

    async avaliableRooms() {
        const avaliableRooms = Object.keys(await this.client.hGetAll('rooms'))
        console.log(avaliableRooms)
        let rooms = []
        for(let i = 0; i < avaliableRooms.length; i++) {
            let roomId = avaliableRooms[i]
            let room = await this.client.hGetAll(roomId)
            rooms.push(room)
        }
        
        return rooms;
    }

    async join(id) {
        // '0dcfdfcc-16af-4cd5-89d4-25985c865952'
        const room = await this.client.hGetAll(id);
        await this.client.hSet(id, {
            ...room, players_connected: parseFloat(room.players_connected) + 1
        })
    }

    
}

export default Rooms