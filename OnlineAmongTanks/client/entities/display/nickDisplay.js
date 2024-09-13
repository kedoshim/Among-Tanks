import * as THREE from "../../public/three/build/three.module.js";
import { CSS2DObject } from "../../public/three/examples/jsm/renderers/CSS2DRenderer.js";

export class NickDisplay {
    constructor(nickname, color = "#ffffff") {
        this.div = document.createElement("div");
        this.nickname = nickname;
        this._model = this.createModel(nickname, this.div,color);
    }

    createModel(nick, div,color) {
        div.innerHTML = nick;
        div.style.color = color;
        div.style.fontSize = "2vw";
        div.style.font = "bold 1vw arial,serif";
        div.id = "#" + nick;
        const model = new CSS2DObject(div);

        return model;
    }

    get model() {
        return this._model;
    }
}
