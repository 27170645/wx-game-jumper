import * as THREE from '../libs/threejs/three.min';
import GameParams from '../config/params.js';
import UI from './ui.js';
import Text2D from '../libs/threejs/text2d.js';

export default class Load {

  constructor(renderer) {
    this.renderer = renderer;
    this.scene = new THREE.Scene(); // UI场景
    this.camera = new THREE.OrthographicCamera(GameParams.width / -2, GameParams.width / 2, GameParams.height / 2, GameParams.height / -2, 0, 10000);     // 使用正交相机绘制2D
    this.open = wx.getOpenDataContext(); // 开放域
    this.sharedCanvas = this.open.canvas; // 开放域canvas
    this.sharedCanvas.width = GameParams.width * GameParams.ratio // 缩放到像素比 使之高清
    this.sharedCanvas.height = GameParams.height * GameParams.ratio
    this.ui = new UI(renderer);
    this.text = new Text2D("Loading...", {
      font: '30px Arial',
      fillStyle: "#000000"
    });
  }

  show() {
    this.scene.add(this.text.sprite);
  }

  update() {
    this.text.texture.needsUpdate = true
  }

  hide() {
    this.scene.remove(this.text.sprite);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

}