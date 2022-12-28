
class Vue {
  value = 9;
  constructor (options) {
    this.opt = options;
    this.speak = function () {
      console.log(this.opt, this.value)
    }
  };
  static vm = 1;
  static say() {
    console.log('zsr', this.vm);
  }
}

export default Vue;