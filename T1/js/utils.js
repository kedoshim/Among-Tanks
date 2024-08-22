import * as THREE from "three";

export function degrees_to_radians(degrees) {
    return THREE.MathUtils.degToRad(degrees);
}

export function normalizeDegrees(degress) {
    if (degress > 180) {
        return degress - 180;
    }
    return degress;
}

export function darkenColor(rgbString, factor) {
    // Parse the RGB string into a Three.js color object
    const color = new THREE.Color(rgbString);

    // Darken the color by multiplying its components by the factor
    color.r *= 1 - factor;
    color.g *= 1 - factor;
    color.b *= 1 - factor;

    // Return the darkened color as an RGB string
    return color.getStyle();
}
