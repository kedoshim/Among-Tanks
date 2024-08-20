import {GLTFLoader} from '../build/jsm/loaders/GLTFLoader.js';
import {
    
    getMaxSize
} from "../libs/util/util.js";

export function loadGLBFile(asset, file, desiredScale, scene, position = { x: 0, y: 0, z: 0 })
{
  let loader = new GLTFLoader( );
  loader.load( file, function ( gltf ) {
    let obj = gltf.scene;
    obj.traverse( function ( child ) {
      if ( child.isMesh ) {
          child.castShadow = false;
      }
    });
    obj = normalizeAndRescale(obj, desiredScale);
    //obj = fixPosition(obj);
    obj.updateMatrixWorld( true )
    obj.position.set(position.x, position.y, position.z);
    scene.add ( obj );

    // Store loaded gltf in our js object
    asset.object = gltf.scene;
    }, null, null);
}

// Normalize scale and multiple by the newScale
function normalizeAndRescale(obj, newScale)
{
  var scale = getMaxSize(obj); // Available in 'utils.js'
  obj.scale.set(newScale * (1.0/scale),
                newScale * (1.0/scale),
                newScale * (1.0/scale));
  return obj;
}