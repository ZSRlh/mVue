let id = 0;

class Dep {
  constructor () {
    this.id = id++;
    this.subs = [];
  }

  depend () {
    Dep.target.addDep(this);
  }

  addSub (sub) {
    this.subs.push(sub);
  }

  notify () {
    const subs = this.subs.slice();
    for (let i = 0; i < subs.length; i++) {
      subs[i].update();
    }
  }
}

Dep.target = null;

export default Dep;