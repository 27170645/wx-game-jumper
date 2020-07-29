import * as THREE from './three.min.js'


export default class Text2D {

  constructor(str, params) {
    this.str = str;
    params.str = str;
    this.params = params || {};
    this.texture = {};
    this.sprite = {};
    let canvas2d = document.createElement('canvas');
    this.init(canvas2d, params);
  }

  init(canvas, params) {
    this.texture = this.createTexture(canvas, params);
    this.texture.needsUpdate = true
    this.texture.minFilter = THREE.LinearFilter
    let material = new THREE.SpriteMaterial({ map: this.texture, transparent: true })
    this.sprite = new THREE.Sprite(material);
    this.sprite.scale.set(200, 30, 100)
  }

  createTexture(canvas, params) {
    let ctx = canvas.getContext('2d')
    let ratio = window.devicePixelRatio
    ctx.font = params.font
    ctx.lineWidth = params.lineWidth
    canvas.width = Math.max(2, ctx.measureText(params.str).width * ratio)
    canvas.height = Math.ceil((parseFloat(params.font) + 4) * ratio)
    ctx.clearRect(0, 0, canvas.width, canvas.height) // 清除画布
    ctx.save()
    ctx.scale(ratio, ratio)
    // 背景
    if (params.bgColor) {
      ctx.fillStyle = params.bgColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
    ctx.fillStyle = params.fillStyle
    ctx.font = params.font
    ctx.lineWidth = params.lineWidth
    ctx.textAlign = params.textAlign
    ctx.textBaseline = params.textBaseline || 'top'
    ctx.fillText(params.str, 0, 0)
    ctx.restore()
    return new THREE.CanvasTexture(canvas)
  }
}
