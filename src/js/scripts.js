import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import { gsap } from 'gsap';
import {CSS2DRenderer, CSS2DObject} from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {RGBELoader} from 'three/examples/jsm/loaders/RGBELoader.js';


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
import plutoTexture from '../img/pluto.jpg';

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


const gltfLoader = new GLTFLoader(loadingManager);

const rgbeLoader = new RGBELoader(loadingManager)

const orbit = new OrbitControls(camera, renderer.domElement);
camera.position.set(-90, 140, 140);
orbit.update();

const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

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


const mercury = createPlanete(3.2, mercuryTexture, 28);
const venus = createPlanete(5.8, venusTexture, 44);
const earth = createPlanete(6, earthTexture, 62);
const mars = createPlanete(4, marsTexture, 78);
const jupiter = createPlanete(12, jupiterTexture, 100);
const saturn = createPlanete(10, saturnTexture, 138, {
    innerRadius: 10,
    outerRadius: 20,
    texture: saturnRingTexture
});
const uranus = createPlanete(7, uranusTexture, 176, {
    innerRadius: 7,
    outerRadius: 12,
    texture: uranusRingTexture
});
const neptune = createPlanete(7, neptuneTexture, 200);
const pluto = createPlanete(2.8, plutoTexture, 216);

const pointLight = new THREE.PointLight(0xFFFFFF, 30000, 3000);
scene.add(pointLight);

// followtext
// const followTextMercury = document.getElementById('follow-text-mercury');
// const canvas = document.querySelector('canvas');
// const boxPosition = new THREE.Vector3();
// let boxPositionOffset = new THREE.Vector3();
// mixer = new THREE.AnimationMixer(mercury);
// followtext

// try
// let gameloop = () =>{
//     if(mercury){
//         boxPosition.setFromMatrixPosition(mercury.matrixWorld);
//         boxPosition.project(camera);
//     }
//     if (mixer) mixer.updat(eclock.getDelta());
//     orbitControls.update()
//     labelRenderer.render(scene,camera);
//     requestAnimationFrame(gameloop)
// }
// gameloop();
// try
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
    pluto.mesh.rotateY(0.008);
    labelRenderer.render(scene,camera);

    //Around-sun-rotation
//    mercury.obj.rotateY(0.04);
//     venus.obj.rotateY(0.015);
//     earth.obj.rotateY(0.01);
//     mars.obj.rotateY(0.008);
//     jupiter.obj.rotateY(0.002);
//     saturn.obj.rotateY(0.0009);
//     uranus.obj.rotateY(0.0004);
//     neptune.obj.rotateY(0.0001);
//     pluto.obj.rotateY(0.00007);

    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);


//Tween function to zoom kada planet
document.getElementById('mercuryButton').addEventListener('click', function() {
    gsap.to(camera.position, {
        duration: 2,
        x: mercury.mesh.position.x,
        y: mercury.mesh.position.y,
        z: mercury.mesh.position.z + 20,
        onUpdate: () => camera.lookAt(mercury.mesh.position)
    });

    
});

document.getElementById('venusButton').addEventListener('click', function() {
    gsap.to(camera.position, {
        duration: 2,
        delay: 0.1,
        x: venus.mesh.position.x,
        y: venus.mesh.position.y,
        z: venus.mesh.position.z + 20,
        onUpdate: () => camera.lookAt(venus.mesh.position)
    });
});

document.getElementById('earthButton').addEventListener('click', function() {
    gsap.to(camera.position, {
        duration: 2,
        x: earth.mesh.position.x,
        y: earth.mesh.position.y,
        z: earth.mesh.position.z + 20,
        onUpdate: () => camera.lookAt(earth.mesh.position)
    });
});

document.getElementById('marsButton').addEventListener('click', function() {
    gsap.to(camera.position, {
        duration: 2,
        x: mars.mesh.position.x,
        y: mars.mesh.position.y,
        z: mars.mesh.position.z + 20,
        onUpdate: () => camera.lookAt(mars.mesh.position)
    });
});

document.getElementById('jupiterButton').addEventListener('click', function() {
    gsap.to(camera.position, {
        duration: 2,
        x: jupiter.mesh.position.x,
        y: jupiter.mesh.position.y + 20,
        z: jupiter.mesh.position.z + 40,
        onUpdate: () => camera.lookAt(jupiter.mesh.position)
    });
});

document.getElementById('saturnButton').addEventListener('click', function() {
    gsap.to(camera.position, {
        duration: 2,
        x: saturn.mesh.position.x,
        y: saturn.mesh.position.y + 20,
        z: saturn.mesh.position.z + 40,
        onUpdate: () => camera.lookAt(saturn.mesh.position)
    });
});


document.getElementById('uranusButton').addEventListener('click', function() {
    gsap.to(camera.position, {
        duration: 2,
        x: uranus.mesh.position.x,
        y: uranus.mesh.position.y + 20,
        z: uranus.mesh.position.z + 40,
        onUpdate: () => camera.lookAt(uranus.mesh.position)
    });
});

document.getElementById('neptuneButton').addEventListener('click', function() {
    gsap.to(camera.position, {
        duration: 2,
        x: neptune.mesh.position.x,
        y: neptune.mesh.position.y,
        z: neptune.mesh.position.z + 40,
        onUpdate: () => camera.lookAt(neptune.mesh.position)
    });
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
    // labelRenderer.domElement.style.position = 'absolute';
    // labelRenderer.domElement.style.top = '0px';
    // labelRenderer,domElement.style.pointerEvents = 'none';
    // document.body.appendChild(labelRenderer.domElement);


// button test
// const p = document.createElement('p');
// p.textContent = 'Hello';
// // const cPointLabel = new CSS2DObject(p);
// // scene.add(cPointLabel);
// // cPointLabel.position.set(-6, 0.8, 4);

// const div = document.createElement('div');
// div.appendChild(p);
// const divContainer = new CSS2DObject(div);
// scene.add(divContainer);

//to hold ang mga points

function createCpointMesh(name, x, y, z){
    const geo = new THREE.SphereBufferGeometry(0.1);
    const mat = new THREE.MeshBasicMaterial({color: 0xFF0000});
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.name = name;
    return mesh;
} 

