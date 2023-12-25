import * as THREE from 'three';
// import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import { gsap } from 'gsap';
import {CSS2DRenderer, CSS2DObject} from 'three/examples/jsm/renderers/CSS2DRenderer.js';



import starsTexture from '../img/stars.jpg';
import sunTexture from '../img/sun.jpg';
import mercuryTexture from '../img/mercury.jpg';
import venusTexture from '../img/venus.jpg';
import earthTexture from '../img/earth.jpg';
import marsTexture from '../img/mars.jpg';
import jupiterTexture from '../img/jupiter.jpg';
import saturnTexture from '../img/saturn.jpg';
import saturnRingTexture from '../img/saturn ring.png';
import uranusTexture from '../img/uranus.jpg';
import uranusRingTexture from '../img/uranus ring.png';
import neptuneTexture from '../img/neptune.jpg';


const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.set(0, 50, 500); // move up to 150 on the y-axis
// loading page - wieg
const loadingManager = new THREE.LoadingManager();
// loadingManager.onStart = function(url, item, total){
//     console.log(`Started loading: ${url}`)
// }

const progressBar = document.getElementById('progress-bar');
loadingManager.onProgress = function(url, loaded, total){
       progressBar.value = (loaded / total) *100;
    }
loadingManager.onError = function(url, loaded, total){
        console.error(`Error on loading: ${url}`);
    }

const progressBarContainer = document.querySelector('.progress-bar-container')
loadingManager.onLoad = function(){
        progressBarContainer.style.display = 'none';
    }


// const gltfLoader = new GLTFLoader(loadingManager);

// const rgbeLoader = new RGBELoader(loadingManager)

// const orbit = new OrbitControls(camera, renderer.domElement);

// orbit.update();


const cubeTextureLoader = new THREE.CubeTextureLoader(loadingManager);
scene.background = cubeTextureLoader.load([
    starsTexture,
    starsTexture,
    starsTexture,
    starsTexture,
    starsTexture,
    starsTexture
]);

const textureLoader = new THREE.TextureLoader();


const sunGeo = new THREE.SphereGeometry(16, 30, 30);
const sunMat = new THREE.MeshBasicMaterial({
    map: textureLoader.load(sunTexture)
});
const sun = new THREE.Mesh(sunGeo, sunMat);
scene.add(sun);

function createPlanete(size, texture, position, ring) {
    const geo = new THREE.SphereGeometry(size, 30, 30);
    const mat = new THREE.MeshStandardMaterial({
        map: textureLoader.load(texture),
        emissiveIntensity: 1 // Increase this value to make the planet brighter
    });
    const mesh = new THREE.Mesh(geo, mat);
    const obj = new THREE.Object3D();
    obj.add(mesh);
    if(ring) {
        const ringGeo = new THREE.RingGeometry(
            ring.innerRadius,
            ring.outerRadius,
            32);
        const ringMat = new THREE.MeshBasicMaterial({
            map: textureLoader.load(ring.texture),
            side: THREE.DoubleSide
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        obj.add(ringMesh);
        ringMesh.position.x = position;
        ringMesh.rotation.x = -0.5 * Math.PI;
    }
    scene.add(obj);
    mesh.position.x = position;
    return {mesh, obj}
}
let divText = document.createElement('div') //wieg
let divDescription = document.createElement('div')

const mercury = createPlanete(3.2, mercuryTexture, 48);
const venus = createPlanete(5.5, venusTexture, 75);
const earth = createPlanete(6.8, earthTexture, 108);
const mars = createPlanete(4.6, marsTexture, 130);
const jupiter = createPlanete(14, jupiterTexture, 165);
const saturn = createPlanete(12.5, saturnTexture, 215, {
    innerRadius: 16,
    outerRadius: 24,
    texture: saturnRingTexture
});
const uranus = createPlanete(8.5, uranusTexture, 257, {
    innerRadius: 10,
    outerRadius: 12,
    texture: uranusRingTexture
});
const neptune = createPlanete(9, neptuneTexture, 280);


const pointLight = new THREE.PointLight(0xFFFFFF, 30000, 3000);
scene.add(pointLight);

//NOTE - ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.06);
scene.add(ambientLight);

function animate() {
    //Self-rotation
    sun.rotateY(0.004);
    mercury.mesh.rotateY(0.004);
    venus.mesh.rotateY(0.002);
    earth.mesh.rotateY(0.02);
    mars.mesh.rotateY(0.018);
    jupiter.mesh.rotateY(0.04);
    saturn.mesh.rotateY(0.038);
    uranus.mesh.rotateY(0.03);
    neptune.mesh.rotateY(0.032);
    labelRenderer.render(scene,camera);

    //Around-sun-rotation
   mercury.obj.rotateY(0.04);
    venus.obj.rotateY(0.015);
    earth.obj.rotateY(0.01);
    mars.obj.rotateY(0.008);
    jupiter.obj.rotateY(0.002);
    saturn.obj.rotateY(0.0009);
    uranus.obj.rotateY(0.0004);
    neptune.obj.rotateY(0.0001);

    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);



//button to show text - wieg

function disableUserControl() {
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('mousedown', handleMouseDown);
}

function handleKeyDown(event) {
    event.preventDefault();
}

function handleMouseDown(event) {
    event.preventDefault();
}

disableUserControl();

let zoomedIn = false; //  track of the zoom state
let zoomedInPlanet = null; // store the currently zoomed-in planet


function toggleZoom(planet, xOffset, yOffset, zOffset, extraHeight = 5) {
    return function () {
      if (zoomedInPlanet !== planet) {
        gsap.to(camera.position, {
          duration: 2,
          x: planet.mesh.position.x,
          y: planet.mesh.position.y + yOffset,
          z: planet.mesh.position.z + zOffset,
          onUpdate: () => {
            updateCameraPosition(planet, xOffset, yOffset, zOffset, extraHeight);
          },
        });
        if (zoomedInPlanet) {
          zoomedInPlanet.obj.remove(camera);
        }
        zoomedInPlanet = planet;
        planet.obj.add(camera);
      }
    };
  }
  
  



// Function to update the camera's position and ensure the planet is centered
function updateCameraPosition(planet, xOffset, yOffset, zOffset, extraHeight = 0) {
    const orbitingPlanetPosition = new THREE.Vector3().copy(planet.mesh.position);
    orbitingPlanetPosition.add(new THREE.Vector3(0, yOffset, zOffset + extraHeight));
  
    const distanceToPlanet = camera.position.distanceTo(orbitingPlanetPosition);
  
    // Center the camera on the planet's position
    const desiredCameraPosition = orbitingPlanetPosition.clone().sub(
      camera.getWorldDirection().multiplyScalar(distanceToPlanet)
    );
  
    camera.position.lerp(desiredCameraPosition, 0.1);
    camera.lookAt(planet.mesh.position);
    requestAnimationFrame(() => updateCameraPosition(planet, xOffset, yOffset, zOffset, extraHeight));
  }

// Store the initial camera position for reference
const initialCameraPosition = camera.position.clone();

// Function to handle back button zoom out (with precise restoration)
function zoomOut() {
    if (zoomedInPlanet) {
      gsap.to(camera.position, {
        duration: 2,
        x: initialCameraPosition.x,
        y: initialCameraPosition.y,  // Ensure exact y-position match
        z: initialCameraPosition.z,
        onUpdate: () => {
          updateCameraPosition(null, 0, 0, 0, 0);
        },
      });
      zoomedInPlanet.obj.remove(camera);
      scene.add(camera); // Re-add camera to the scene
      zoomedInPlanet = null;
      divText.textContent = "";
      divDescription.textContent = "";
    }
  }
  
  // Event listener for back button
document.getElementById('back').addEventListener('click', zoomOut);

document.getElementById('mercuryButton').addEventListener('click', function() {
    if (!zoomedIn) {
        toggleZoom(mercury, 15, 0, 30)();
      }
  
     // titlechange -wieg
    divText.textContent = 'MERCURY';
    divText.setAttribute('id', 'title');
    divText.setAttribute('class', 'title');
    title.append(divText);
});

document.getElementById('mercuryButton').addEventListener('click', function(){ //wieg
    divDescription
    divDescription.textContent = 'Mercury, the nearest planet to the sun and the smallest in our solar system, lacks moons and races around the sun faster than any other planet. Romans named it after their swift-footed messenger god due to its rapid orbit. Its surface is marked by tens of thousands of impact craters.'
    divDescription.setAttribute('id', 'description')
    divDescription.setAttribute('class', 'description')
    description.append(divDescription)
});  
// });



document.getElementById('venusButton').addEventListener('click', () => {
    if (!zoomedIn) {
      toggleZoom(venus, 15, 0, 30)();
    }
  });
document.getElementById('venusButton').addEventListener('click', function(){ // wieg
    divText.textContent = 'VENUS'
    divText.style.marginTop ='10px'
    divText.setAttribute('id', 'title')
    divText.setAttribute('class', 'title')
    title.append(divText);
});
document.getElementById('venusButton').addEventListener('click', function(){ //wieg
    divDescription.textContent = "Venus, shrouded in clouds and named after a goddess of love, is frequently referred to as Earth's counterpart. However, upon closer examination, Venus reveals its infernal nature. Positioned as our closest planetary neighbor, it's the second planet from the Sun and possesses a surface so scorching that it could liquefy lead. Ranking as the second planet from the Sun and sixth in size and mass within our solar system."
    description.append(divDescription)

});  
document.getElementById('earthButton').addEventListener('click', () => {
    if (!zoomedIn) {
      toggleZoom(earth, 15, 0, 30)();
    }
  });

document.getElementById('earthButton').addEventListener('click', function(){ //weig
    divText.textContent = 'EARTH'
    divText.style.marginTop ='10px'
    divText.setAttribute('id', 'title')
    divText.setAttribute('class', 'title')
    title.append(divText);
});

document.getElementById('earthButton').addEventListener('click', function(){ //wieg
    divDescription.textContent = "Earth, named uniquely from Old English and Germanic origins, means 'the ground' and is the third planet from the Sun. It's called by diverse names in various languages, serving as our home and the singular known habitat for life in the solar system, distinguished by its possession of surface water."
    description.append(divDescription)
});
document.getElementById('marsButton').addEventListener('click', function() {
    if (!zoomedIn) {
        toggleZoom(mars, 15, 0, 30)();
      }
document.getElementById('marsButton').addEventListener('click', function(){ //wieg
        divDescription.textContent = "Mars, a barren, rocky, and frigid world, orbits as the fourth planet from the Sun and stands as one of Earth's adjacent neighbors alongside Venus. Easily visible in the night sky, it appears as a vibrant red dot, earning its moniker, the Red Planet. Throughout history, Mars has been linked to conflict and violence due to its association with warfare and slaughter."
        description.append(divDescription)
        
});
});
document.getElementById('marsButton').addEventListener('click', function(){ //weig
    divText.textContent = 'MARS'
    divText.style.marginTop ='10px'
    divText.setAttribute('id', 'title')
    divText.setAttribute('class', 'title')
    title.append(divText);
});

document.getElementById('jupiterButton').addEventListener('click', function() {
    if (!zoomedIn) {
        toggleZoom(jupiter, 15, 0, 70)();
      }
});
document.getElementById('jupiterButton').addEventListener('click', function(){ //weig
    divText.textContent = 'JUPITER'
    divText.style.marginTop ='10px'
    divText.setAttribute('id', 'title')
    divText.setAttribute('class', 'title')
    title.append(divText);
});

document.getElementById('jupiterButton').addEventListener('click', function(){ //wieg
    divDescription.textContent = 'Jupiter, positioned as the fifth planet from the Sun, reigns as the largest planet in our solar system, surpassing the combined mass of all other planets twofold. Its distinctive bands and whirling patterns consist of chilly, windy clouds comprising ammonia and water, suspended within an atmosphere primarily composed of hydrogen and helium.'
    description.append(divDescription)
});

document.getElementById('saturnButton').addEventListener('click', function() {
    if (!zoomedIn) {
        toggleZoom(saturn, 15, 2, 55)();
      }
});


document.getElementById('saturnButton').addEventListener('click', function(){ //weig
    divText.textContent = 'SATURN'
    divText.style.marginTop ='10px'
    divText.setAttribute('id', 'title')
    divText.setAttribute('class', 'title')
    title.append(divText);
});

document.getElementById('saturnButton').addEventListener('click', function(){ //wieg
    divDescription.textContent = 'Saturn, the sixth planet from the Sun and second-largest in our system, shares similarities with Jupiter as a massive gas sphere rich in hydrogen and helium. Distinguished by its unparalleled ring system, Saturn possesses a collection of moons, setting it apart from other planets in our solar system.'
    description.append(divDescription)
});


document.getElementById('uranusButton').addEventListener('click', function() {
    if (!zoomedIn) {
        toggleZoom(uranus, 15, 2, 40)();
      }
});

document.getElementById('uranusButton').addEventListener('click', function(){ //wieg
    divDescription.textContent = "Neptune, the solar system's third most massive and farthest planet from the Sun, can't be seen without aid due to its extreme distance. Through a small telescope, it appears as a faint, tiny blue-green disk, showcasing its icy, windy, and remote nature, positioned significantly beyond Earth's distance from the Sun. As the sole unobservable planet without visual assistance, Neptune remains over 30 times farther from the Sun than our planet"
    description.append(divDescription)
});

document.getElementById('uranusButton').addEventListener('click', function(){ //weig
    divText.textContent = 'URANUS'
    divText.style.marginTop ='10px'
    divText.setAttribute('id', 'title')
    divText.setAttribute('class', 'title')
    title.append(divText);
});

document.getElementById('neptuneButton').addEventListener('click', function() {
    if (!zoomedIn) {
        toggleZoom(neptune, 15, 0, 50)();
      }
});

document.getElementById('neptuneButton').addEventListener('click', function(){ //wieg
    divDescription.textContent = 'Uranus, an ice giant akin to Neptune, is composed mainly of hot, dense icy substances such as water, methane, and ammonia, surrounding a small rocky core. Its freezing, windy climate hosts faint rings and more than two dozen moons, while its unique nearly 90-degree tilt gives it an appearance of rotating on its side.'
    description.append(divDescription)
});

document.getElementById('neptuneButton').addEventListener('click', function(){ //weig
    divText.textContent = 'NEPTUNE'
    divText.style.marginTop ='10px'
    divText.setAttribute('id', 'title')
    divText.setAttribute('class', 'title')
    title.append(divText);
});
//resize
window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(this.window.innerWidth, this.window.innerHeight);

});


const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);


// function createCpointMesh(name, x, y, z){
//     const geo = new THREE.SphereBufferGeometry(0.1);
//     const mat = new THREE.MeshBasicMaterial({color: 0xFF0000});
//     const mesh = new THREE.Mesh(geo, mat);
//     mesh.position.set(x, y, z);
//     mesh.name = name;
//     return mesh;
// }