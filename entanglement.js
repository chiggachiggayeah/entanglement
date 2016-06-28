// TODO
// [] implement demo puzzle
// [] refactor and cleanup commented code

// SCENE VARS
var scene, camera, fieldOfView, aspectRatio, nearPlane, farPlane, HEIGHT, WIDTH, renderer, container;
var Colors = {
  red: 0xf25346,
  white: 0xd8d0d1,
  brown: 0x59332e,
  pink: 0xF5986E,
  brownDark: 0x23190f,
  blue: 0x68c3c0,
};

// CUBE VARS
var amount = 9;
var Player, playerPivot;

window.addEventListener("load", init, false);

function init() {

  createScene();

  createCubes();

  drawLines();

  loop();
}

function createScene() {
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;

  scene = new THREE.Scene();

  // scene.fog = new THREE.Fog(0xf7d9aa, 950);

  // create the camera
  aspectRatio = WIDTH / HEIGHT;
  fieldOfView = 60;
  nearPlane = 1;
  farPlane = 10000;

  // camera = new THREE.PerspectiveCamera(
  //   fieldOfView,
  //   aspectRatio,
  //   nearPlane,
  //   farPlane
  // );

  camera = new THREE.OrthographicCamera(  WIDTH / -2, WIDTH / 2, HEIGHT / 2, HEIGHT / -2, 1, 10000 );

  // set the camera position
  camera.position.x = 0;
  camera.position.y = 100;
  camera.position.z = 500;

  // create the renderer
  renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true
  });

  // define the size of the renderer
  renderer.setSize(WIDTH, HEIGHT);

  // Enable shadow rendering
  renderer.shadowMap.enabled = true;

  container = document.getElementById('world');
  container.appendChild(renderer.domElement);

  window.addEventListener('resize', handleWindowResize, false);

  document.addEventListener("mousemove", handleMouseMove, false);

  document.addEventListener("mousedown", detectClick, false);

  document.addEventListener("mouseup", grabCoordsAndShoot, false);

}

function render(){
  renderer.render(scene, camera);
}

function handleWindowResize(){
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;
  renderer.setSize(WIDTH, HEIGHT);
  camera.aspect = WIDTH / HEIGHT;
  camera.updateProjectionMatrix();
}

var cubes;

var uniforms = {
					time:       { value: 1.0 },
					resolution: { value: new THREE.Vector2() }
				};


// this function needs to be a create scene function or something
function createCubes() {
  var mat = new THREE.MeshPhongMaterial({
    color: Colors.blue,
    transparent: true,
    opacity: .6,
    shading: THREE.FlatShading
  });

  var s_mat = new THREE.ShaderMaterial({
    uniforms: {
      "uDirLightPos":     { type: "v3", value: new THREE.Vector3() },
    "uDirLightColor": { type: "c", value: new THREE.Color( 0xeeeeee ) },

    "uAmbientLightColor": { type: "c", value: new THREE.Color( 0x050505 ) },

    "uBaseColor":  { type: "c", value: new THREE.Color( Colors.blue ) },
    "uLineColor1": { type: "c", value: new THREE.Color( Colors.blue ) },
    "uLineColor2": { type: "c", value: new THREE.Color( Colors.blue ) },
    "uLineColor3": { type: "c", value: new THREE.Color( Colors.blue ) },
    "uLineColor4": { type: "c", value: new THREE.Color( 0x00ffff ) }
    },
    fragmentShader: document.getElementById('fragmentShader').textContent,
    vertexShader: document.getElementById('vertexShader').textContent
  });

  s_mat.side = THREE.DoubleSide;

  var geo = new THREE.BoxGeometry(10, 10, 10);

  player = [];
  playerShot = [];
  var mCubeDim = 10;

  var yoffset;
  var xoffset;
  var zoffset = 0;

  // should save the offsets in the player construct

  Player = {
    cubes: new THREE.Object3D(),
    offsets: {},
    lines: [],
    cubeInds: [],
    shootMode: false,
    shotTracker: new THREE.Vector3(),
    lastClick: ""
  };


  for(var i = 0; i < 27; i++){

    player.push(new THREE.Mesh(geo, s_mat));

    if(i < 9){
      yoffset = 0;
    } else if (i < 18) {
      yoffset = 1;
    } else {
      yoffset = 2;
    }

    xoffset = i % 3;

    zoffset = i % 3 == 0 && [0, 9, 18].indexOf(i) == -1 ? zoffset + 1 : zoffset;

    if([0, 9, 18].indexOf(i) != -1) zoffset = 0;

    Player.offsets[player[i].id] = new THREE.Vector3(xoffset, yoffset, zoffset);
    player[i].position.set(xoffset * mCubeDim, yoffset * mCubeDim, zoffset * mCubeDim);

    // scene.add(player[i]);
  }

  player.forEach(function(m){
    Player.cubes.add(m);
  });

  // Player.cubes.translateY(100);

  var box = new THREE.Box3().setFromObject(Player.cubes);
  box.center(Player.cubes.position);
  Player.cubes.position.multiplyScalar(-1);

  scene.add(Player.cubes);

  // drawLines();
}

function rotateCubes() {
  for(var i = 0; i < cubes.length; i++){
    cubes[i].rotation.x += 0.01;
    cubes[i].rotation.y += 0.01;
  }
}

function rotatePlayer() {
  for(var i = 0; i < player.length; i++){
    player[i].rotation.x += 0.01 * Math.random() * 10;
    player[i].rotation.y += 0.01 * Math.random() * 10;
  }
}

var constant1 = 1;
var constant2 = -1;
var constant3 = 1;
var constant4 = -1;

function expandPlayer() {
  for(var i = 0; i < player.length; i++){
    // Y
    if(i < 9){
      // player[i].position.y = player[i].position.y > -20 ? player[i].position.y - 0.1 : player[i].position.y + 0.1;
      // console.log(player[i].position);
      player[i].position.y += (0.01 * constant1);
      if(player[i].position.y <= -30 || player[i].position.y >= 0) constant1 *= -1;
    } else if(i < 18) {

    } else {
      // player[i].position.y = player[i].position.y < 10 ? player[i].position.y + 0.1 : player[i].position.y - 0.1;
      player[i].position.y += (0.01 * constant2);
      if(player[i].position.y <= 20 || player[i].position.y >= 50) constant2 *= -1;
    }

    // X
    if(i % 3 == 0){
      player[i].position.x += (0.1 * constant2);
      if(player[i].position.x <= 20 || player[i].position.x >= 50) constant2 *= -1;
    } else if(i % 3 == 1) {

    } else {
      player[i].position.x += (0.1 * constant2);
      if(player[i].position.x <= 20 || player[i].position.x >= 50) constant2 *= -1;
    }

    var zlist = [0, 1, 2, 9, 10, 11, 18, 19, 20];
    // Z
    if(zlist.indexOf(i + 0) != -1){
      // decrease z
      player[i].position.z += (0.1 * constant3);
      if(player[i].position.z <= 20 || player[i].position.z >= 50) constant3 *= -1;
    } else if(zlist.indexOf(i + 3) != -1){

    } else {
      // increase z
      player[i].position.z += (0.1 * constant3);
      if(player[i].position.z <= 20 || player[i].position.z >= 50) constant3 *= -1;
    }

  } // end of for
}

// CONTROLS
var mousePos = {x: 0, y: 0};
var pos;

// get the initial gather working
// implement coroutines via setInterval
function gather(event) {
  // regather the cubes in the whole cube and stop the rotation

  var yoffset;
  var xoffset;
  var zoffset = 0;
  var mCubeDim = 10;

  for(var i = 0; i < 27; i++){

    // player.push(new THREE.Mesh(geo, s_mat));

    if(i < 9){
      yoffset = 0;
    } else if (i < 18) {
      yoffset = 1;
    } else {
      yoffset = 2;
    }

    xoffset = i % 3;

    zoffset = i % 3 == 0 && [0, 9, 18].indexOf(i) == -1 ? zoffset + 1 : zoffset;

    if([0, 9, 18].indexOf(i) != -1) zoffset = 0;

    player[i].position.lerp(new THREE.Vector3(xoffset * mCubeDim, yoffset * mCubeDim, zoffset * mCubeDim), 2);

  }
}

var testLine;
function drawLines(){
  var lineMat = new THREE.LineBasicMaterial({
    color: 0x000fff
  });
  var endVertex;
  var curGeo;
  var curLine;
  for(var i = 0; i < Math.ceil(player.length / 2); i++){
    endVertex = i === 0 ? 1 : player.length - i;
    curGeo = new THREE.Geometry();
    curGeo.vertices.push(
      player[i].position,
      player[endVertex].position
    );
    curLine = new THREE.Line(curGeo, lineMat);
    Player.lines.push(curLine);
    Player.cubeInds.push([i, endVertex]);
    scene.add(curLine);
  }

}

// click and drag to shoot

// the shot should accelerate

// entering "shoot" mode
function detectClick(event) {
  // grab the click location
  if(!Player.shootMode){
    // console.log("clicked!");
    Player.lastClick = [event.clientX, event.clientY];
    Player.shootMode = true;
    // document.addEventListener("mousemove", detectDrag, false);
  }
}

// TODO
// within this I guess that you start listening for mouseup
// just move the mouse on mouse drag
// would be a double tap on mobile

// drag random cube around via this function
function grabCoordsAndShoot(event) {
  var coords = [];
  coords.push({
    x: Player.shotTracker.x,
    y: Player.shotTracker.y
  });
  coords.push({
    x: -1 + (event.clientX / WIDTH) * 2,
    y: 1 - (event.clientY / HEIGHT) * 2
  });
  if(Player.shootMode) {
    var randomIndex = Math.floor(Math.random() * player.length);
    shoot(coords, randomIndex);
  }
}

var point = "";
var shootInterval = "";
function shoot(coords, index) {
  console.log("shooting!");

  // var randInd = Math.floor(Math.random() * player.length);
  playerShot.push(player[index]);
  // document.removeEventListener("mouseup", grabCoordsAndShoot, false);
  Player.shootMode = false;

  // var dir = new THREE.Vector3(coords[1].x - coords[0].x, coords[1].y - coords[0].y, coords[1].z - coords[0].z);
  // dir = dir.normalize();

  // if(shootInterval != ""){
  //   clearInterval(shootInterval);
  //   point = "";
  // };
  // function updateCube(ind, direction){
  //   console.log(direction);
  //   player[ind].position = player[ind].position.add(direction);
  // };
  // var shootInterval = setInterval(updateCube.bind(null, index, dir), 100);

  // var tx = -1 + (event.clientX / WIDTH) * 2;
  // var ty = 1 - (event.clientY / HEIGHT) * 2;
  //
  // var targetPos = new THREE.Vector3(tx + 100, ty, player[randInd].position.z);
  //
  // window.setInterval(function(){
  //   player[randInd].position.lerp(targetPos, 0.01);
  // }, 10);
}

// move cubes to point in a delayed manner
// should check if a cube is within some epsilon of destination and then eliminate it from the list

var epsilon = 1; // use this for arrival behavior
function lerpCubes(posX, posY) {
  var i = -1;
  var offset;
  var mCubeDim = 10;
  var cubeList = player.slice();
  if(!Player.shootMode) {
    var lerpInterval = setInterval(function(){
      i = Math.floor(Math.random() * cubeList.length);
      if(playerShot.indexOf(player[i]) === -1){
        offset = Player.offsets[player[i].id];
        // if(i === player.length - 1) clearInterval(lerpInterval);
        player[i].position.lerp(new THREE.Vector3(posX + offset.x * mCubeDim, posY + offset.y * mCubeDim, player[i].position.z), 0.1);

        cubeList.splice(i, 1);
        if(cubeList.length === 0) clearInterval(lerpInterval);
      }
    }, 100);
  }
}

function shield(event) {

}

function updateLines() {
  for(var i = 0; i < Player.lines.length; i++){
    Player.lines[i].geometry.vertices[0].position = player[Player.cubeInds[i][0]].geometry.vertices[0].position;
    Player.lines[i].geometry.vertices[1].position = player[Player.cubeInds[i][1]].geometry.vertices[0].position;
    Player.lines[i].geometry.verticesNeedUpdate = true;
  }
}

function handleMouseMove(event) {
  event.preventDefault();

  var tx = -1 + (event.clientX / WIDTH) * 2;
  var ty = 1 - (event.clientY / HEIGHT) * 2;

  mousePos.x = tx;
  mousePos.y = ty;

  if(camera != undefined)
  {
    var vector = new THREE.Vector3( mousePos.x, mousePos.y, -1 ).unproject( camera );
    pos = vector;
  }


}
// ---

function normalize(v,vmin,vmax,tmin, tmax){

	var nv = Math.max(Math.min(v,vmax), vmin);
	var dv = vmax-vmin;
	var pc = (nv-vmin)/dv;
	var dt = tmax-tmin;
	var tv = tmin + (pc*dt);
	return tv;

}


function updatePlayer() {
  rotatePlayer();
  // expandPlayer();

  updateLines();

  var targetX = normalize(mousePos.x, -1, 1, -500, 500);
  var targetY = normalize(mousePos.y, -1, 1, -1000, 1000);

  var ty = pos.y;
  var tx = pos.x - 10;

  // POSITION
  lerpCubes(tx, ty);
  // Player.cubes.position = new THREE.Vector3(tx, ty, pos.z);
  // Player.cubes.position.lerp(new THREE.Vector3(tx, pos.y, 250), .2);

  // ROTATION
  // Player.cubes.rotation.x += 0.01;
  // Player.cubes.rotation.y += 0.01;


  // SHOT TRACKER
  Player.shotTracker.setX(tx);
  Player.shotTracker.setY(ty);
}

function loop(){
  requestAnimationFrame(loop);
  updatePlayer();

  // DRAW LOOP

  // (function(){
  //   if(point === ""){
  //     console.log("drawing point");
  //     var pointGeo = new THREE.CircleGeometry();
  //     point = new THREE.Mesh(pointGeo);
  //     scene.add(point);
  //   } else {
  //     // just move
  //     // console.log("moving point");
  //     point.position.copy(Player.cubes.position);
  //   }
  // })();
  // ---

  uniforms.time.value += 0.05;
  renderer.render(scene, camera);

}
