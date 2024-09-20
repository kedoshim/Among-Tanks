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

export function joinObjectsIntoList(obj1, obj2) {
    // Get all the values from both objects and join them in a list
    const values1 = Object.values(obj1);
    const values2 = Object.values(obj2);

    // Combine both lists into a single list
    return [...values1, ...values2];
}

export function isOnMobileEnviroment() {
    if (navigator.userAgent.match(/iPhone/i)   || navigator.userAgent.match(/iPad/i)  || navigator.userAgent.match(/Android/i)) { 
        return true
    } 
    return false
}