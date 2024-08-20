import * as THREE from "three";

const loadedTextures = {};

export function loadTexture(path, name) {
    // Create a texture loader
    const textureLoader = new THREE.TextureLoader();

    // Load the texture
    const texture = textureLoader.load(path);

    if (texture)
        console.log(texture);

    loadedTextures[name] = texture;
}

export function getTexture(name) {
    if (loadedTextures[name])
        return loadedTextures[name]
    console.log(`Texture ${name} not loaded`);
    return null;
}