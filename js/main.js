import * as THREE from './libs/threejs/three.min.js';
import GameParams from 'config/params.js';
import Scene from 'scenes/scene.js';
import UI from './ui/ui.js';

let ctx = canvas.getContext('webgl');


export default class Main {

  constructor() {
    this.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    this.renderer.shadowMap.enabled = true;
    this.renderer.setSize(GameParams.width, GameParams.height);     // 窗口大小
    this.renderer.setClearColor(0xFFFFFF, 1);     // 清除颜色
    this.renderer.setPixelRatio(GameParams.ratio);     // 设置像素
    this.renderer.autoClear = false;     // 关闭自动清除
    this.scene = new Scene(this.renderer);    // 场景

    this.start();     // 游戏开始
  }

  start(){
    this.loop();      // 开始循环游戏
  }

  update() {
    this.scene.update();
  }

  render() {
    this.scene.render();
  }

  loop() {
    this.renderer.clear();  // 关闭了渲染器的自动清除 这里需要手动清除
    this.update();    // 生命周期，UPDATE -> RENDER
    this.render();
    window.requestAnimationFrame(this.loop.bind(this), canvas); // 请求动画帧
  }
}
