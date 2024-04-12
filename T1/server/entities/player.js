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
  constructor(name = "", spawnPoint = [0, 0], amogColor = "", tankColor = "") {
    let playerConfig = getConfig().playerConfig;

    if (name === "") {
      name = `Player_${Player.playerNumber}`;
    }
    if (amogColor === "") {
      amogColor = playerConfig.defaultPlayerAmogusColors[Player.playerNumber];
    }
    if (tankColor === "") {
      tankColor = playerConfig.defaultPlayerTankColors[Player.playerNumber];
    }

    super(name, spawnPoint, null, null);

    this._tank = new CommonTank(tankColor, amogColor);
    
    this._controller = new PlayerController(this._tank);
    
    console.info("creating player " + this._name);
    Player.playerNumber++;
  }
}
