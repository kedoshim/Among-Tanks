import { Entity } from "./entity.js";
import { CommonTank } from "./tanks/common_tank.js";
import { PlayerController } from "./controllers/player_controller.js";

import { getConfig } from "../config.js";
import { EnemyCommonTank } from "./tanks/enemy_common_tank.js";
import { BotController } from "./controllers/bot_controller.js";

/**
 * Represents the players
 */
export class Enemy extends Entity {
  /**
   * The total number of create Player objects
   *
   * @static
   * @type {number}
   */
  static enemyNumber = 0;

  /**
   * Creates an instance of Player.
   *
   * @constructor
   * @param {string} [name=""]
   * @param {Array.<number>} [spawnPoint=[0, 0]] [x,z] coordinates
   * @param {string} [amogColor=""]
   * @param {string} [tankColor=""]
   */
  constructor(name = "", spawnPoint = [0, 0], amogColor = "", tankColor = "", config = null) {
    let playerConfig = config ? config.playerConfig : getConfig().playerConfig;

    if (name === "") {
      name = `Enemy_${Enemy.enemyNumber + 1}`;
    }
    if (amogColor === "") {
      amogColor = playerConfig.defaultPlayerAmogusColors[Entity.entityNumber];
    }
    if (tankColor === "") {
      tankColor = playerConfig.defaultPlayerTankColors[Entity.entityNumber];
    }

    super(name, spawnPoint, null, null);

    this.index = Enemy.enemyNumber + 1;

    this._tank = new EnemyCommonTank(tankColor, amogColor);
    
    this._controller = new BotController(this._tank, this.index);
    
    // console.info("creating player " + this._name);
    Enemy.enemyNumber++;
  }
}
