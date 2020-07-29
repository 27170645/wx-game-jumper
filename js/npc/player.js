import * as THREE from '../libs/threejs/three.min.js';
import GameParams from '../config/params.js';

export default class Player {
  constructor() {
    let geometry = new THREE.CylinderGeometry(GameParams.playerTopRadius, GameParams.playerBottomRadius, GameParams.playerHeight, 100);
    let metal_texture = new THREE.TextureLoader().load(GameParams.playerImage);
    let material = new THREE.MeshLambertMaterial({ map: metal_texture });
    this.mesh = new THREE.Mesh(geometry, material);
    geometry.translate(0, GameParams.playerHeight / 2, 0);
    this.mesh.position.set(0, GameParams.playerHeight / 2, 0);
  }
}