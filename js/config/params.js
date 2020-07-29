
let winWidth = window.innerWidth;
let winHeight = window.innerHeight;

export default {
  width: winWidth,
  height: winHeight,
  cameraAspect: winWidth / winHeight,
  ratio: window.devicePixelRatio,
  zDir: 'zDir',
  xDir: 'xDir',
  cube: 'cube',
  cylinder: 'cylinder',
  playerTopRadius: 0.3,   // 弹跳体参数设置
  playerBottomRadius: 0.5,
  playerHeight: 2,
  playerImage: 'images/player.jpg',
  // 立方体参数设置
  cubeX: 4,
  cubeY: 2,
  cubeZ: 4,
  cubeImage: 'images/cube.jpg',
  // 圆柱体参数设置
  cylinderRadius: 2,
  cylinderHeight: 2,
  cylinderImage: 'images/cylinder.jpg',
  // 设置缓存数组最大缓存多少个图形
  cubeMaxLen: 6,
  // 立方体内边缘之间的最小距离和最大距离
  cubeMinDis: 2.5,
  cubeMaxDis: 4
};