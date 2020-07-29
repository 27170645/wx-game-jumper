
import * as THREE from '../libs/threejs/three.min.js';
import GameParams from '../config/params.js';
import Random from '../core/random.js';

export default class Cylinder {
  constructor(dir, lastcube) {
    this.dir = dir;
    this.cube = lastcube || null;
    this.lastcube = this.cube == null ? null : this.cube.mesh;
    this.geometry = new THREE.CylinderGeometry(GameParams.cylinderRadius, GameParams.cylinderRadius, GameParams.cylinderHeight, 100);
    let metal_texture = new THREE.TextureLoader().load(GameParams.cylinderImage);
    this.material = new THREE.MeshLambertMaterial({ map: metal_texture });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.random = new Random();
    this.init(); 
  }  

  init() {
    if (this.lastcube == null)
      this.mesh.position.set(0, 0, 0);
    else
      this.position();
  }
  
  position() {
    let dis = this.random.value(GameParams.cubeMinDis, GameParams.cubeMaxDis);
    let position = null;
    if (this.dir === GameParams.zDir) {
      // z 方向
      if (this.lastcube.geometry instanceof THREE.CubeGeometry) {
        // 方体 -> 圆柱体
        this.mesh.position.set(
          this.lastcube.position.x, 
          this.lastcube.position.y, 
          this.lastcube.position.z - dis - GameParams.cylinderRadius - GameParams.cubeZ / 2
        );
      } else {
         // 圆柱体 -> 圆柱体
        this.mesh.position.set(
          this.lastcube.position.x, 
          this.lastcube.position.y, 
          this.lastcube.position.z - dis - GameParams.cylinderRadius * 2
        );
      }
    } else {
      // x 方向
      if (this.lastcube.geometry instanceof THREE.CubeGeometry) {
        // 方体 -> 圆柱体
        this.mesh.position.set(
          this.lastcube.position.x + dis + GameParams.cubeX / 2 + GameParams.cylinderRadius, 
          this.lastcube.position.y, 
          this.lastcube.position.z
        );

      } else {
        // 圆柱体 -> 圆柱体
        this.mesh.position.set(
          this.lastcube.position.x + dis + GameParams.cylinderRadius * 2, 
          this.lastcube.position.y, 
          this.lastcube.position.z
        );
      }
    }
  }
}