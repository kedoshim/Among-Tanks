import { Entity } from "./entity.js";
import { CommonTank } from "./tanks/common_tank.js";
import { PlayerController } from "./controllers/player_controller.js";

import { getConfig } from "../config.js";

/**
 * Represents the players
 */
export class Player extends Entity {
    /**
     * The total number of create Player objects
     *
     * @static
     * @type {number}
     */
    static playerNumber = 0;

    static defaultPlayerAmogusColors = [
        "dimgray",
        "antiquewhite",
        "purple",
        "pink",
    ];

    static defaultPlayerTankColors = ["darkblue", "red", "goldenrod", "green"];

    static defaultPlayerControls = [
        {
            up: "W",
            down: "S",
            right: "D",
            left: "A",
            shoot: ["space", "Q", "shift"],
        },
        {
            up: "up",
            down: "down",
            right: "right",
            left: "left",
            shoot: ["/", ","],
        },
        {
            up: "I",
            down: "K",
            right: "L",
            left: "J",
            shoot: ["H"],
        },
        {
            up: "h", //NumPad8
            down: "e", //NumPad5
            right: "f", //NumPad6
            left: "d", //NumPad4
            shoot: ["enter"],
        },
    ];

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
            name = `Player_${Player.playerNumber + 1}`;
        }
        if (amogColor === "") {
            amogColor =
                playerConfig.defaultPlayerAmogusColors[Player.playerNumber];
        }
        if (tankColor === "") {
            tankColor =
                playerConfig.defaultPlayerTankColors[Player.playerNumber];
        }

        super(name, spawnPoint, null, null);

        this._tank = new CommonTank(tankColor, amogColor);

        let controllerKeys =
            playerConfig.defaultPlayerControls[Player.playerNumber];
        this._controller = new PlayerController(this._tank, controllerKeys, "");

        // console.info("creating player " + this._name);
        Player.playerNumber++;
    }
}
