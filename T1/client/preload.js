import { FontLoader } from "./public/three/examples/jsm/loaders/FontLoader.js";

let cachedFont = null;
let fontLoadingPromise = null;

export function loadFont() {
    if (cachedFont) {
        return Promise.resolve(cachedFont);
    }
    if (fontLoadingPromise) {
        return fontLoadingPromise;
    }

    const loader = new FontLoader();
    fontLoadingPromise = new Promise((resolve, reject) => {
        loader.load(
            "../../public/three/examples/fonts/optimer_regular.typeface.json",
            (font) => {
                cachedFont = font;
                resolve(font);
            },
            undefined,
            (error) => {
                reject(error);
            }
        );
    });

    return fontLoadingPromise;
}

export function getCachedFont() {
    return cachedFont;
}
