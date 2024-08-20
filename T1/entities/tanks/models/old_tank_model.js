import * as THREE from "three";
import { setDefaultMaterial } from "../../../../libs/util/util.js";

export function createOldTank(tankColor, amogColor) {
    let tank = createAmogus(0, 0, amogColor);
    addTank(tank, tankColor);
    addBlowgun(tank, tankColor);
    addHelmet(tank, tankColor);

    return tank;
}

function darkenColor(rgbString, factor) {
    // Parse the RGB string into a Three.js color object
    const color = new THREE.Color(rgbString);

    // Darken the color by multiplying its components by the factor
    color.r *= 1 - factor;
    color.g *= 1 - factor;
    color.b *= 1 - factor;

    // Return the darkened color as an RGB string
    return color.getStyle();
}

function createAmogus(x, y, color) {
    const levelHeight = 5;
    const bodyModel = new THREE.CapsuleGeometry(3.5, 3, 5, 20);
    let body = new THREE.Mesh(bodyModel, setDefaultMaterial(color));
    // position the amog
    body.position.set(x + 0, 6.4 + levelHeight, y + 0.0);

    const legModel = new THREE.CylinderGeometry(2, 0.8, 5);
    let left_leg = new THREE.Mesh(legModel, setDefaultMaterial(color));
    let right_leg = new THREE.Mesh(legModel, setDefaultMaterial(color));
    left_leg.position.set(1.4, -4, 0);
    right_leg.position.set(-1.4, -4, 0);
    body.add(left_leg);
    body.add(right_leg);

    const backpackModel = new THREE.BoxGeometry(5, 6, 2);
    let backpack = new THREE.Mesh(backpackModel, setDefaultMaterial(color));
    backpack.position.set(0, -0.8, -3.5);
    body.add(backpack);

    const windowModel = new THREE.CapsuleGeometry(1.5, 1.5, 3);
    let window = new THREE.Mesh(windowModel, setDefaultMaterial("aliceblue"));
    window.rotateZ(Math.PI / 2);
    window.position.set(0, 1.5, 2.5);
    body.add(window);

    body.rotateY(Math.PI);
    return body;
}

function addTank(amogFather, tankColorRGB = "rgb(54, 64, 35)") {
    const groundLevel = -amogFather.position.y;
    const tank = createTankModel(tankColorRGB, groundLevel);

    addWheels(tank, groundLevel);

    amogFather.add(tank);

    tank.position.set(0, -5.5, 1);
    amogFather.position.y += 3.5;
}

function createTankModel(tankColorRGB, groundLevel) {
    const tankHeight = 7;
    const heighAboveGround = 1;
    const tankDepth = 6;
    const tankWidth = 10;
    const heighAdjustment = groundLevel + tankHeight / 2 + heighAboveGround;
    const tankCenterModel = new THREE.BoxGeometry(
        tankWidth,
        tankHeight,
        tankDepth
    );
    let tankCenter = new THREE.Mesh(
        tankCenterModel,
        setDefaultMaterial(tankColorRGB)
    );
    tankCenter.position.set(0, heighAdjustment, 0);

    const tankFrontModel = new THREE.BoxGeometry(
        tankWidth,
        tankHeight / 2,
        tankDepth
    );
    let tankFront = new THREE.Mesh(
        tankFrontModel,
        setDefaultMaterial(tankColorRGB)
    );
    tankFront.position.set(0, -tankHeight / 4, 3);
    const tankFrontRampModel = new THREE.BoxGeometry(
        tankWidth,
        3,
        (tankHeight / 2) * 1.4
    );

    let tankFrontRamp = new THREE.Mesh(
        tankFrontRampModel,
        setDefaultMaterial(tankColorRGB)
    );
    tankFront.add(tankFrontRamp);
    tankFrontRamp.rotateX(THREE.MathUtils.degToRad(53));
    tankFrontRamp.position.set(0, 2.46, 0.2);

    const tankBackModel = new THREE.BoxGeometry(
        tankWidth,
        tankHeight / 2,
        tankDepth
    );
    let tankBack = new THREE.Mesh(
        tankBackModel,
        setDefaultMaterial(tankColorRGB)
    );
    tankBack.position.set(0, -tankHeight / 4, -5.3);
    const tankBackRampModel = new THREE.BoxGeometry(
        tankWidth,
        3,
        (tankHeight / 2) * 1.8
    );

    let tankBackRamp = new THREE.Mesh(
        tankBackRampModel,
        setDefaultMaterial(tankColorRGB)
    );
    tankBack.add(tankBackRamp);
    tankBackRamp.rotateX(THREE.MathUtils.degToRad(-35));
    tankBackRamp.position.set(0, 2.1, 0.6);

    const detailModel = new THREE.BoxGeometry(1, 3, 5);
    let detailLeft = new THREE.Mesh(
        detailModel,
        setDefaultMaterial(darkenColor(tankColorRGB, 0.5))
    );
    let detailRight = new THREE.Mesh(
        detailModel,
        setDefaultMaterial(darkenColor(tankColorRGB, 0.5))
    );
    detailLeft.position.set(5, 1, 0);
    detailRight.position.set(-5, 1, 0);

    tankCenter.add(tankFront);
    tankCenter.add(tankBack);
    tankCenter.add(detailLeft);
    tankCenter.add(detailRight);

    return tankCenter;
}

function addWheels(tank, groundLevel, wheelColor = "rgb(30, 23, 7)") {
    const wheelThickness = 3;
    const wheelRadius = 2.5;
    const beltThickness = 1;
    const wheelHeight = groundLevel - tank.position.y + wheelRadius;

    // const wheelHeight = wheelRadius - 0.5 + groundLevel
    const createWheel = (position) => {
        const wheelModel = new THREE.CylinderGeometry(
            wheelRadius,
            wheelRadius,
            wheelThickness
        );
        wheelModel.rotateZ(Math.PI / 2);
        const wheel = new THREE.Mesh(
            wheelModel,
            setDefaultMaterial(wheelColor)
        );
        wheel.position.copy(position);
        return wheel;
    };
    const createBelt = (position) => {
        const beltModel = new THREE.BoxGeometry(
            wheelRadius + 0.5,
            beltThickness,
            12
        );
        const belt = new THREE.Mesh(beltModel, setDefaultMaterial(wheelColor));
        belt.position.copy(position);
        return belt;
    };
    const wheelXPosition = 4.5;
    const wheelBeltLength = 6;
    const wheelBeltCenter = -1;

    const wheelPositions = [
        new THREE.Vector3(
            wheelXPosition,
            wheelHeight,
            wheelBeltCenter + wheelBeltLength
        ),
        new THREE.Vector3(
            -wheelXPosition,
            wheelHeight,
            wheelBeltCenter + wheelBeltLength
        ),
        new THREE.Vector3(wheelXPosition, wheelHeight, wheelBeltCenter),
        new THREE.Vector3(-wheelXPosition, wheelHeight, wheelBeltCenter),
        new THREE.Vector3(
            wheelXPosition,
            wheelHeight,
            wheelBeltCenter - wheelBeltLength
        ),
        new THREE.Vector3(
            -wheelXPosition,
            wheelHeight,
            wheelBeltCenter - wheelBeltLength
        ),
    ];
    const beltPositions = [
        new THREE.Vector3(
            wheelXPosition,
            wheelHeight + wheelRadius - beltThickness / 2,
            wheelBeltCenter
        ),
        new THREE.Vector3(
            wheelXPosition,
            wheelHeight - wheelRadius + beltThickness / 2,
            wheelBeltCenter
        ),
        new THREE.Vector3(
            -wheelXPosition,
            wheelHeight + wheelRadius - beltThickness / 2,
            wheelBeltCenter
        ),
        new THREE.Vector3(
            -wheelXPosition,
            wheelHeight - wheelRadius + beltThickness / 2,
            wheelBeltCenter
        ),
    ];
    const wheels = wheelPositions.map((position) => createWheel(position));
    const belts = beltPositions.map((position) => createBelt(position));

    belts.forEach((belt) => tank.add(belt));
    wheels.forEach((wheel) => tank.add(wheel));
}

function addHelmet(amogFather, color = "darkgreen") {
    const helmetModel = new THREE.SphereGeometry(
        3.7,
        100,
        50,
        0,
        Math.PI * 2,
        0,
        Math.PI / 2 //sets it to be a half sphere
    );
    helmetModel.rotateX(THREE.MathUtils.degToRad(-7));
    let helmet = new THREE.Mesh(
        helmetModel,
        setDefaultMaterial(darkenColor(color, 0.5))
    );
    helmet.position.set(0, 2.6, 0);
    amogFather.add(helmet);
}

function addBlowgun(amogFather, color = "green") {
    const blowgunModel = new THREE.CylinderGeometry(0.6, 0.6, 8);
    let blowgun = new THREE.Mesh(blowgunModel, setDefaultMaterial(color));
    blowgun.rotateX(THREE.MathUtils.degToRad(90));
    blowgun.position.set(0, -0.8, 4);

    const blowgunHoleModel = new THREE.CylinderGeometry(0.4, 0.4, 8);
    let blowgunHole = new THREE.Mesh(
        blowgunHoleModel,
        setDefaultMaterial("black")
    );
    blowgunHole.position.set(0, 0.1, 0);

    blowgun.add(blowgunHole);
    amogFather.add(blowgun);

    const mouthBallModel = new THREE.SphereGeometry(1.5);
    let leftCheek = new THREE.Mesh(
        mouthBallModel,
        setDefaultMaterial(amogFather.material.color)
    );
    leftCheek.position.set(1.5, -0.8, 2);
    let rightCheek = new THREE.Mesh(
        mouthBallModel,
        setDefaultMaterial(amogFather.material.color)
    );
    leftCheek.position.set(1.5, -0.8, 2);
    rightCheek.position.set(-1.5, -0.8, 2);
    amogFather.add(leftCheek);
    amogFather.add(rightCheek);
}

function addHat(amogFather, color = "black") {
    const hatModel = new THREE.CylinderGeometry(3, 3, 5);
    let hat = new THREE.Mesh(hatModel, setDefaultMaterial("rgb(80,58,11)"));
    hat.position.set(0, 3, 0);
    amogFather.add(chapeu);
}
