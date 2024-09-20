import { Entity } from "./entity.js";
import { CommonTank } from "./tanks/common_tank.js";
import { PlayerController } from "./controllers/player_controller.js";

import { getConfig } from "../config.js";

/**
 * Represents the players
 */
export class Player extends Entity {
    /**
     * The total number of created Player objects
     *
     * @static
     * @type {number}
     */
    static playerNumber = 0;

    /**
     * Creates an instance of Player.
     *
     * @constructor
     * @param {string} [name=""]
     * @param {Array.<number>} [spawnPoint=[0, 0]] [x,z] coordinates
     * @param {string} [amogColor=""]
     * @param {string} [tankColor=""]
     */
    constructor(
        name = "",
        spawnPoint = [0, 0],
        amogColor = "",
        tankColor = ""
    ) {
        let playerConfig = getConfig().playerConfig;

        if (name === "") {
            name = `Player_${Player.playerNumber}`;
        }
        if (tankColor === "" && amogColor === "") {
            const hue = Math.random() * 359;
            const complementaryHue = ((hue + 181) % 360) - 1;
            const saturation = 80 + (Math.random() - 0.6) * 50;
            const light = 55 + (Math.random() - 0.5) * 50;
            const saturation2 = 80 + (Math.random() - 0.6) * 50;
            const light2 = 45 + (Math.random() - 0.5) * 50;

            amogColor = `hsl(${hue},${saturation}%,${light}%)`;
            tankColor = `hsl(${complementaryHue},${saturation2}%,${light2}%)`;
        }

        super(name, spawnPoint, null, null);

        this._tank = new CommonTank(tankColor, amogColor);
        
        console.log(this._spawnPoint);
        this._tank.position.x = this._spawnPoint[0];
        this._tank.position.z = this._spawnPoint[1];
        this._tank.setHitbox();

        this._controller = new PlayerController(this._tank);

        // console.info("> Creating player " + this._name);
        Player.playerNumber++;
    }
}
