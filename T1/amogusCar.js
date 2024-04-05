  import * as THREE from  'three';
  import { OrbitControls } from '../build/jsm/controls/OrbitControls.js';
  import KeyboardState from '../libs/util/KeyboardState.js';
  import {initRenderer, 
          initCamera,
          initDefaultBasicLight,
          setDefaultMaterial,
          InfoBox,
          SecondaryBox,        
          onWindowResize, 
          createGroundPlaneXZ} from "../libs/util/util.js";

  let scene, renderer, camera, material, light, orbit;; // Initial variables
  scene = new THREE.Scene();    // Create main scene
  renderer = initRenderer();    // Init a basic renderer
  camera = initCamera(new THREE.Vector3(0, 30, 30)); // Init camera in this position
  material = setDefaultMaterial(); // create a basic material
  light = initDefaultBasicLight(scene); // Create a basic light to illuminate the scene
  orbit = new OrbitControls( camera, renderer.domElement ); // Enable mouse rotation, pan, zoom etc.

  // Listen window size changes
  window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );

  // Use to scale the amog
  var scale = 1.0;

  // Show text information onscreen
  showInformation();

  // To use the keyboard
  var keyboard = new KeyboardState();

  // Show axes (parameter is size of each axis)
  var axesHelper = new THREE.AxesHelper( 12 );
  scene.add( axesHelper );

  // create the ground plane
  let plane = createGroundPlaneXZ(100, 100)
  scene.add(plane);

  function amogus(x,z,y,scene,color){
    let body = new THREE.CapsuleGeometry(3.5, 3, 3);
    let amog = new THREE.Mesh(body, setDefaultMaterial(color));
    // position the amog
    amog.position.set(x+0, z+6.0, y+0.0);
    // add the amog to the scene
    scene.add(amog);

    let leg1 = new THREE.CylinderGeometry(1.5, 1.5, 3);
    let cube1 = new THREE.Mesh(leg1, setDefaultMaterial(color));
    // position the amog
    cube1.position.set(1.5, -4, 0);
    // add the amog to the scene
    amog.add(cube1);
    // create a amog

    let leg2 = new THREE.CylinderGeometry(1.5, 1.5, 3);
    let cube2 = new THREE.Mesh(leg2, setDefaultMaterial(color));
    // position the amog
    cube2.position.set(-1.5, -4, 0);
    // add the amog to the scene
    amog.add(cube2);
    // create a amog

    let face = new THREE.CapsuleGeometry(1.5, 1.5, 3);
    let cube4 = new THREE.Mesh(face, setDefaultMaterial('white'));
    cube4.rotateZ(Math.PI / 2);
    // position the amog
    cube4.position.set(0, 1.5, 2.5);
    // add the amog to the scene
    amog.add(cube4);

    return amog
  }

  function tank(x, z, y, scene, tankColor, amog){
    let wheel = new THREE.CylinderGeometry(3.5, 3.5, 3);
    wheel.rotateZ(Math.PI / 2);
    let wheel_color = "rgb(30, 23, 7)";
    tankColor = "rgb(54, 64, 35)";
    let ofleft = new THREE.Mesh(wheel, setDefaultMaterial(wheel_color));
    // position the amog
    ofleft.position.set(4.5, -4, 4);
    // add the amog to the amog
    amog.add(ofleft);

    let obleft = new THREE.Mesh(wheel, setDefaultMaterial(wheel_color));
    // position the amog
    obleft.position.set(-4.5, -4, 4);
    // add the amog to the amog
    amog.add(obleft);

    let ofright = new THREE.Mesh(wheel, setDefaultMaterial(wheel_color));
    // position the amog
    ofright.position.set(4.5, -4, -4);
    // add the amog to the amog
    amog.add(ofright);

    let obright = new THREE.Mesh(wheel, setDefaultMaterial(wheel_color));
    // position the amog
    obright.position.set(-4.5, -4, -4);
    // add the amog to the amog
    amog.add(obright);

    let chapeuModel = new THREE.CylinderGeometry(3, 3, 5)
    let chapeu = new THREE.Mesh(chapeuModel, setDefaultMaterial("rgb(80,58,11)"));
    chapeu.position.set(0, 3, 0);
    // amog.add(chapeu)

    let zarabatanaModel = new THREE.CylinderGeometry(0.6, 0.6, 8)
    let holeModel = new THREE.CylinderGeometry(0.4, 0.4, 8)
    let zarabatana = new THREE.Mesh(zarabatanaModel, setDefaultMaterial("green"));
    let hole = new THREE.Mesh(holeModel, setDefaultMaterial("black"));
    zarabatana.rotateX(THREE.MathUtils.degToRad(90))
    zarabatana.position.set(0, -0.8, 4);
    zarabatana.add(hole)
    hole.position.set(0, 0.1, 0 );
    amog.add(zarabatana)
    
    let mouthBallModel = new THREE.SphereGeometry(1.2)
    let lball = new THREE.Mesh(mouthBallModel, setDefaultMaterial(amog.color));
    lball.position.set(1.5, -0.8, 2);
    let rball = new THREE.Mesh(mouthBallModel, setDefaultMaterial(amog.color));
    lball.position.set(1.5, -0.8, 2);
    rball.position.set(-1.5, -0.8, 2);
    amog.add(lball)
    amog.add(rball)
    
    const chapeuSoldadoModel = new THREE.SphereGeometry(
      3.5,
      100,
      50,
      0,
      Math.PI*2,
      0,
      Math.PI/2
    );
    let chapeuSoldado = new THREE.Mesh(chapeuSoldadoModel, setDefaultMaterial("darkgreen"));
    chapeuSoldado.position.set(0,2.6,0)
    amog.add(chapeuSoldado); 
    
    const tankModel = new THREE.SphereGeometry(
      5.5,
      100,
      50,
      0,
      Math.PI*2,
      0,
      Math.PI/2
    );
    let tank = new THREE.Mesh(tankModel, setDefaultMaterial(tankColor));
    tank.position.set(0,-7,0)
    amog.add(tank);
    
    

  }

  function car(x,z,y,scene,color,amog){
    let front = new THREE.BoxGeometry(8, 3.5 , 7);
    let ofront = new THREE.Mesh(front, setDefaultMaterial(color));
    // position the amog
    ofront.position.set(0, -4, 6.0);
    // add the amog to the scene
    amog.add(ofront);

    let window = new THREE.BoxGeometry(1, 2 , 7);
    window.rotateY(Math.PI/2)
    window.rotateX(-Math.PI/5)
    let mat = setDefaultMaterial("cyan")
    mat.opacity = 0.3
    let owindow = new THREE.Mesh(window, mat);
    // position the amog
    owindow.position.set(0, -1.5, 4.0);
    // add the amog to the scene
    amog.add(owindow);

    let back = new THREE.BoxGeometry(8, 3.5 , 7 , 10 , 5, 5);
    let oback = new THREE.Mesh(back, setDefaultMaterial(color));
    // position the amog
    oback.position.set(0, -4, -6.0);
    // add the amog to the amog
    amog.add(oback);

    let right = new THREE.BoxGeometry(1, 4 , 5);
    let oright = new THREE.Mesh(right, setDefaultMaterial(color));
    // position the amog
    oright.position.set(-3, -4, 0);
    // add the amog to the amog
    amog.add(oright);
    
    let left = new THREE.BoxGeometry(1, 4 , 5);
    let oleft = new THREE.Mesh(left, setDefaultMaterial(color));
    // position the amog
    oleft.position.set(3, -4, 0);
    // add the amog to the amog
    amog.add(oleft);

    let wheel = new THREE.CylinderGeometry(2.3, 2.3 , 1);
    wheel.rotateZ(Math.PI/2)
    let ofleft = new THREE.Mesh(wheel, setDefaultMaterial("black"));
    // position the amog
    ofleft.position.set(4.5, -3.8, 6);
    // add the amog to the amog
    amog.add(ofleft);

    let obleft = new THREE.Mesh(wheel, setDefaultMaterial("black"));
    // position the amog
    obleft.position.set(-4.5, -3.8, 6); 
    // add the amog to the amog
    amog.add(obleft);

    let ofright = new THREE.Mesh(wheel, setDefaultMaterial("black"));
    // position the amog
    ofright.position.set(4.5, -3.8, -6);
    // add the amog to the amog
    amog.add(ofright);
    
    let obright = new THREE.Mesh(wheel, setDefaultMaterial("black"));
    // position the amog
    obright.position.set(-4.5, -3.8, -6);
    // add the amog to the amog
    amog.add(obright);
  }


  let amog = amogus(10,1.4,0,scene,"red")

  // car(0,0,0,scene,"gray",amog)
  tank(0, 0, 0, scene, "gray", amog);

  var cubeAxesHelper = new THREE.AxesHelper(9);
  amog.add(cubeAxesHelper);

  var positionMessage = new SecondaryBox("");
  positionMessage.changeStyle("rgba(0,0,0,0)", "lightgray", "16px", "ubuntu")


  render();

  function keyboardUpdate() 
  {
    keyboard.update();
    if ( keyboard.pressed("S") )     amog.translateZ( -1 );
    if ( keyboard.pressed("W") )    amog.translateZ(  1 );
    if ( keyboard.pressed("up") )       amog.translateY(  1 );
    if ( keyboard.pressed("down") )     amog.translateY( -1 );
    if ( keyboard.pressed("pageup") )   amog.translateZ(  1 );
    if ( keyboard.pressed("pagedown") ) amog.translateZ( -1 );

    let angle = THREE.MathUtils.degToRad(5); 
    if ( keyboard.pressed("A") )  amog.rotateY(  angle );
    if ( keyboard.pressed("D") )  amog.rotateY( -angle );
    updatePositionMessage();
  }

  function updatePositionMessage()
  {
    var str =  "POS {" + amog.position.x.toFixed(1) + ", " + amog.position.y.toFixed(1) + ", " + amog.position.z.toFixed(1) + "} " + 
              "| SCL {" + amog.scale.x.toFixed(1) + ", " + amog.scale.y.toFixed(1) + ", " + amog.scale.z.toFixed(1) + "} " + 
              "| ROT {" + amog.rotation.x.toFixed(1) +  ", " + amog.rotation.y.toFixed(1) + ", " + amog.rotation.z.toFixed(1) + "}";              
    positionMessage.changeMessage(str);
  }


  function showInformation()
  {
    // Use this to show information onscreen
    var controls = new InfoBox();
      controls.add("Geometric Transformation");
      controls.addParagraph();
      controls.add("Use keyboard arrows to move the amog in XY.");
      controls.add("Press Page Up or Page down to move the amog over the Z axis");
      controls.add("Press 'A' and 'D' to rotate.");
      controls.add("Press 'W' and 'S' to change scale");
      controls.show();
  }

  function render()
  {
    keyboardUpdate();
    requestAnimationFrame(render); // Show events
    renderer.render(scene, camera) // Render scene
  }
