

let instance;

export default class Random {

  constructor() {
    if (instance) {
      return instance;
    }
    instance = this;
  }

  bool() {
    return Math.random() > 0.5;
  }

  value(max, min) {
    return Math.floor(Math.random() * (max - min)) + min;
  }
}