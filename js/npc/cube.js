
import * as THREE from '../libs/threejs/three.min.js';
import GameParams from '../config/params.js';
import Random from '../core/random.js';

export default class Cude {

  constructor(dir, lastcube) {
    this.dir = dir;
    this.cube = lastcube || null;
    this.random = new Random();
    this.lastcube = this.cube == null ? null : this.cube.mesh;
    this.geometry = new THREE.CubeGeometry(GameParams.cubeX, GameParams.cubeY, GameParams.cubeZ);
    this.color =  GameParams.cubeColor;
    let metal_texture = new THREE.TextureLoader().load(GameParams.cubeImage);
    this.material = new THREE.MeshLambertMaterial({ map: metal_texture });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
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
        this.mesh.position.set(  // 方体 -> 方体
          this.lastcube.position.x, 
          this.lastcube.position.y, 
          this.lastcube.position.z - dis - GameParams.cubeZ
        );
      } else {
        this.mesh.position.set(  // 圆柱体 -> 方体
          this.lastcube.position.x, 
          this.lastcube.position.y, 
          this.lastcube.position.z - dis - GameParams.cylinderRadius - GameParams.cubeZ / 2
        );
      }
    } else {
      // x 方向
      if (this.lastcube.geometry instanceof THREE.CubeGeometry) {
        this.mesh.position.set(  // 方体 -> 方体
          this.lastcube.position.x + dis + GameParams.cubeX, 
          this.lastcube.position.y, 
          this.lastcube.position.z
        );
        
      } else {
        this.mesh.position.set(  // 圆柱体 -> 方体
          this.lastcube.position.x + dis + GameParams.cylinderRadius + GameParams.cubeX / 2, 
          this.lastcube.position.y, 
          this.lastcube.position.z
        );
      
      }
    }
  }
}