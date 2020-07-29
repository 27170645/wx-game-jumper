import * as THREE from '../libs/threejs/three.min.js'

let instance

export default class UI {
  constructor(renderer) {
    if (instance) return instance
    instance = this
    let w = window.innerWidth
    let h = window.innerHeight
    this.renderer = renderer
    this.scene = new THREE.Scene()
    this.camera = new THREE.OrthographicCamera(w / -2, w / 2, h / 2, h / -2, 0, 10000)
    this.camera.position.z = 10000
  }

  add(obj) {
    console.log(obj);
    return this.scene.add(obj)
  }

  render(renderer) {
    this.renderer.clearDepth()
    console.log(this.renderer);
    console.log(this.scene);
    console.log(this.camera);
    this.renderer.render(this.scene, this.camera)
  }
}