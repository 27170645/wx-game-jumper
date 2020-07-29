import * as THREE from '../libs/threejs/three.min.js';
import GameParams from '../config/params.js';
import Cube from '../npc/cube.js';
import Cylinder from '../npc/cylinder.js';
import Random from '../core/random.js';
import Player from '../npc/player.js';

let instance;

export default class Scene {

  constructor(renderer, failCallback) {
    if (instance) {
      return instance;
    }
    instance = this;
    this.config = GameParams;
    // 渲染器
    this.renderer = renderer;

    // 游戏场景 
    this.scene = new THREE.Scene();

    //添加灯光
    this.pointLight = new THREE.PointLight(0x8A8A8A);
    this.ambientLight = new THREE.AmbientLight(0xFFFFFF);
    this.scene.add(this.pointLight);
    this.scene.add(this.ambientLight);


    // 使用透视相机绘制3D
    this.camera = new THREE.OrthographicCamera(
      this.config.width / -60,
      this.config.width / 60,
      this.config.height / 60,
      this.config.height / -60,
      0.1, 5000
    );
    this.camera.position.set(100, 100, 100);
    this.cameraPos = {
      current: new THREE.Vector3(0, 0, 0), // 摄像机当前的坐标
      next: new THREE.Vector3() // 摄像机即将要移到的位置
    };
    this.random = new Random();
    this.cubes = [];
    this.player = null;
    this.mouseState = 0;
    this.xspeed = 0;
    this.yspeed = 0;
    this.score = 0;
    this.isSky = false;
    this.gameover = false;
    this.failCallback = failCallback || function() {
      if (this.gameover == true) {
        this.restart();
      }
    }
    this.start();
  }

  start() {
    this.createCube();
    this.createCube();
    this.createPlayer();
    this.registerEvent();
    this.updateScore();
  }

  restart() {
    for (var i = 0, len = this.cubes.length; i < len; i++) {
      this.scene.remove(this.cubes[i].mesh);
    }
    if (this.player != null) {
      this.scene.remove(this.player.mesh);
    }
    this.cameraPos = {
      current: new THREE.Vector3(0, 0, 0), // 摄像机当前的坐标
      next: new THREE.Vector3() // 摄像机即将要移到的位置
    };

    this.cubes = [];
    this.player = null;
    this.mouseState = 0;
    this.xspeed = 0;
    this.yspeed = 0;
    this.score = 0;
    this.gameover = false;
    this.isSky = false;
    this.createCube();
    this.createCube();
    this.createPlayer();
    this.updateScore();
  }

  createCube() {
    let relativePos = this.random.bool() ? this.config.xDir : this.config.zDir; // 生成形状的方向
    let cubeType = this.random.bool()  ? this.config.cube : this.config.cylinder; // 生成的形状
    let lastCube = this.cubes.length > 0 ? this.cubes[this.cubes.length - 1] : null;  // 最后一个形状
    let cube = cubeType === this.config.cube ? new Cube(relativePos, lastCube) : new Cylinder(relativePos, lastCube);
    this.cubes.push(cube);
    this.scene.add(cube.mesh);
    // 如果缓存图形数大于最大缓存数，去掉一个
    if (this.cubes.length > this.config.cubeMaxLen) {
      this.scene.remove(this.cubes.shift());
    }
  } 

  createPlayer() {
    this.player = new Player();
    this.scene.add(this.player.mesh);

  }

  registerEvent() {
    this.renderer.domElement.addEventListener('touchstart', this.onMouseDown.bind(this));
    this.renderer.domElement.addEventListener('touchend', this.onMouseUp.bind(this));
  }

  destoryEvent() {
    this.renderer.domElement.removeEventListener('touchstart', this.onMouseDown.bind(this));
    this.renderer.domElement.removeEventListener('touchend', this.onMouseUp.bind(this));
  }

  onMouseDown() {
    if (!this.isSky) {  // 防止空中第二按着，可以连续跳
      this.mouseState = -1;
      var dir = this.getDirection();
      if (this.player.mesh.scale.y > 0.02) { // 控制一个域值，防止缩放时底面也进行缩放
        this.player.mesh.scale.y -= 0.01;
        this.xspeed += 0.004; // 水平方向运动加速度
        this.yspeed += 0.008; // 垂直方向运动加速度
      }
    }
  }

  onMouseUp() {
    var self = this;
    this.mouseState = 1;
    this.isSky = true;  
    if (this.player.mesh.position.y >= this.config.playerHeight / 2) {
      // player还在空中运动
      var dir = this.getDirection();
      if (dir === 'x') {
        this.player.mesh.position.x += this.xspeed;
        this.player.mesh.position.y += this.yspeed;
      } else {
        this.player.mesh.position.z -= this.xspeed;
        this.player.mesh.position.y += this.yspeed;
      }
      // 垂直方向先上升后下降
      this.yspeed -= 0.01;
      // player要恢复
      if (this.player.mesh.scale.y < 1) {
        this.player.mesh.scale.y += 0.02;
      }
    } else {
      // player降落了
      var type = this.getPlayerState();
      this.isSky = false;
      if (type === 1) {
        // 落在当前块上
        this.xspeed = 0;
        this.yspeed = 0;
        this.player.mesh.scale.y = 1;
        this.player.mesh.position.y = this.config.playerHeight / 2;
      } else if (type === 2 || type === 3) {
        // 成功降落
        this.score += 1;
        this.xspeed = 0;
        this.yspeed = 0;
        this.player.mesh.scale.y = 1;
        this.player.mesh.position.y = this.config.playerHeight / 2;
        this.updateScore();
        this.createCube();
      } else if (type === -2) {
        // 落到大地上动画
        if (self.player.mesh.position.y >= - self.config.playerHeight / 2) {
          self.player.mesh.position.y -= 0.06;
        }
        this.gameover = true;
      } else {
        // 落到边缘处
        this.failingAnimation(type);
        this.gameover = true;
      }
    }
  }


  failingAnimation (state){
    var rotateAxis = this.getDirection() === 'z' ? 'x' : 'z';
    var rotateAdd, rotateTo;
    if (state === -1) {
      rotateAdd = this.player.mesh.rotation[rotateAxis] - 0.1;
      rotateTo = this.player.mesh.rotation[rotateAxis] > -Math.PI / 2;
    } else {
      rotateAdd = this.player.mesh.rotation[rotateAxis] + 0.1;
      rotateTo = this.player.mesh.rotation[rotateAxis] < Math.PI / 2;
    }
    if (rotateTo) {
      this.player.mesh.rotation[rotateAxis] = rotateAdd;
    } else {
      var self = this;
      if (self.player.mesh.position.y >= -self.config.playerHeight / 2) {
        self.player.mesh.position.y -= 0.06;
      }
    }
  }

  getDirection (){
    var direction;
    if (this.cubes.length > 1) {
      var f = this.cubes[this.cubes.length - 2];
      var to = this.cubes[this.cubes.length - 1];

      if (f.mesh.position.z === to.mesh.position.z) direction = 'x';
      if (f.mesh.position.x === to.mesh.position.x) direction = 'z';
    }
    return direction;
  }
  
  getPlayerState (){
    var playerR = this.config.playerBottomRadius;
    var vard = this.getd();
    var d = vard.d;
    var d1 = vard.d1;
    var d2 = vard.d2;
    var d3 = vard.d3;
    var d4 = vard.d4;
    if (d <= d1) {
      return 1;
    } else if (d > d1 && Math.abs(d - d1) <= playerR) {
      return -1;
    } else if (Math.abs(d - d1) > playerR && d < d2 && Math.abs(d - d2) >= playerR) {
      return -2;
    } else if (d < d2 && Math.abs(d - d2) < playerR) {
      return -3;
    } else if (d > d2 && d <= d4) {
      return 2;
    } else if (d > d4 && Math.abs(d - d4) < playerR) {
      return -1;
    } else {
      return -2;
    }
  }

  getd () {
    var d, d1, d2, d3, d4;
    var fromObj = this.cubes[this.cubes.length - 2];
    var fromPosition = fromObj.mesh.position;
    var fromType = fromObj.mesh.geometry instanceof THREE.CubeGeometry ? 'cube' : 'cylinder';
    var toObj = this.cubes[this.cubes.length - 1];
    var toPosition = toObj.mesh.position;
    var toType = toObj.mesh.geometry instanceof THREE.CubeGeometry ? 'cube' : 'cylinder';
    var playerRObj = this.player.mesh;
    var position = playerRObj.position;

    if (fromType === 'cube') {
      if (toType === 'cube') {
        if (fromPosition.x === toPosition.x) {
          // -z 方向
          d = Math.abs(position.z);
          d1 = Math.abs(fromPosition.z - this.config.cubeZ / 2);
          d2 = Math.abs(toPosition.z + this.config.cubeZ / 2);
          d3 = Math.abs(toPosition.z);
          d4 = Math.abs(toPosition.z - this.config.cubeZ / 2);
        } else {
          // x 方向
          d = Math.abs(position.x);
          d1 = Math.abs(fromPosition.x + this.config.cubeX / 2);
          d2 = Math.abs(toPosition.x - this.config.cubeX / 2);
          d3 = Math.abs(toPosition.x);
          d4 = Math.abs(toPosition.x + this.config.cubeX / 2);
        }
      } else {
        if (fromPosition.x === toPosition.x) {
          // -z 方向
          d = Math.abs(position.z);
          d1 = Math.abs(fromPosition.z - this.config.cubeZ / 2);
          d2 = Math.abs(toPosition.z + this.config.cylinderRadius);
          d3 = Math.abs(toPosition.z);
          d4 = Math.abs(toPosition.z - this.config.cylinderRadius);
        } else {
          // x 方向
          d = Math.abs(position.x);
          d1 = Math.abs(fromPosition.x + this.config.cubeX / 2);
          d2 = Math.abs(toPosition.x - this.config.cylinderRadius);
          d3 = Math.abs(toPosition.x);
          d4 = Math.abs(toPosition.x + this.config.cylinderRadius);
        }
      }
    } else {
      if (toType === 'cube') {
        if (fromPosition.x === toPosition.x) {
          // -z 方向
          d = Math.abs(position.z);
          d1 = Math.abs(fromPosition.z - this.config.cylinderRadius);
          d2 = Math.abs(toPosition.z + this.config.cubeZ / 2);
          d3 = Math.abs(toPosition.z);
          d4 = Math.abs(toPosition.z - this.config.cubeZ / 2);
        } else {
          // x 方向
          d = Math.abs(position.x);
          d1 = Math.abs(fromPosition.x + this.config.cylinderRadius);
          d2 = Math.abs(toPosition.x - this.config.cubeX / 2);
          d3 = Math.abs(toPosition.x);
          d4 = Math.abs(toPosition.x + this.config.cubeX / 2);
        }
      } else {
        if (fromPosition.x === toPosition.x) {
          // -z 方向
          d = Math.abs(position.z);
          d1 = Math.abs(fromPosition.z - this.config.cylinderRadius);
          d2 = Math.abs(toPosition.z + this.config.cylinderRadius);
          d3 = Math.abs(toPosition.z);
          d4 = Math.abs(toPosition.z - this.config.cylinderRadius);
        } else {
          // x 方向
          d = Math.abs(position.x);
          d1 = Math.abs(fromPosition.x + this.config.cylinderRadius);
          d2 = Math.abs(toPosition.x - this.config.cylinderRadius);
          d3 = Math.abs(toPosition.x);
          d4 = Math.abs(toPosition.x + this.config.cylinderRadius);
        }
      }
    }

    return { d: d, d1: d1, d2: d2, d3: d3, d4: d4 };
  }


  updateCameraPos() {
    if (this.cubes.length > 1) {
      var a = this.cubes[this.cubes.length - 2];
      var b = this.cubes[this.cubes.length - 1];
      var toPos = {
        x: (a.mesh.position.x + b.mesh.position.x) / 2,
        y: 0,
        z: (a.mesh.position.z + b.mesh.position.z) / 2
      };
      this.cameraPos.next = new THREE.Vector3(toPos.x, toPos.y, toPos.z);
      this.updateCamera();
    } else {
      this.camera.lookAt(this.cameraPos.current);
    }
  }

  updateCamera() {
    var self = this;
    var c = {
      x: self.cameraPos.current.x,
      y: self.cameraPos.current.y,
      z: self.cameraPos.current.z
    };
    var n = {
      x: self.cameraPos.next.x,
      y: self.cameraPos.next.y,
      z: self.cameraPos.next.z
    };

    if (c.x < n.x || c.z > n.z) {
      if (c.x < n.x) self.cameraPos.current.x += 0.1;
      if (c.z > n.z) self.cameraPos.current.z -= 0.1;
      if (Math.abs(self.cameraPos.current.x - self.cameraPos.next.x) < 0.05) {
        self.cameraPos.current.x = self.cameraPos.next.x;
      }
      if (Math.abs(self.cameraPos.current.z - self.cameraPos.next.z) < 0.05) {
        self.cameraPos.current.z = self.cameraPos.next.z;
      }
      self.camera.lookAt(new THREE.Vector3(c.x, 0, c.z));
    }
  }

  updateScore() {
    console.log(this.score)
  }

  add(entity) {
    this.scene.add(entity);
  }

  update() {
    this.updateGameState();
  }

  updateGameState(){
    // 更新相机位置
    this.updateCameraPos();
    if (this.mouseState === 1) {
      //  松开，player 跳起
      this.onMouseUp();
    }
    if (this.mouseState === -1) {
      // 正在长按屏幕, 缩小高度 player 动画
      this.onMouseDown();
    }
    if (this.failCallback && this.gameover) {
      setTimeout(() => {
        this.failCallback(self.score);
      }, 2000);
    }
  }

  render() {
    this.renderer.render(this.scene, this.camera)
  }
}