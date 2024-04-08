import { Entity } from "./entity.js";
import { CommonTank } from "./models/common_tank.js";
import { PlayerController } from "./controllers/player_controller.js";

export class Player extends Entity {
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
      shoot: ["Space", "Q", "LeftShift"],
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
      shoot: ["Enter"],
    },
  ];

  constructor(name = "", spawnPoint = [0, 0], amogColor = "", tankColor = "") {
    if (name === "") {
      name = `Player_${Player.playerNumber}`;
    }
    if (amogColor === "") {
      amogColor = Player.defaultPlayerAmogusColors[Player.playerNumber];
    }
    if (tankColor === "") {
      tankColor = Player.defaultPlayerTankColors[Player.playerNumber];
    }

    console.info("creating player " + (Player.playerNumber + 1));

    let tank = new CommonTank(tankColor, amogColor);
    super(name, spawnPoint, tank, null);

    let controllerKeys = Player.defaultPlayerControls[Player.playerNumber];
    this._controller = new PlayerController(this._tank, controllerKeys);

    Player.playerNumber++;
  }
}
