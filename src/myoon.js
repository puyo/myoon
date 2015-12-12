"use strict";

const Config = {
  gravity: 0.9,
  friction: 0.5,
  energy: {
    initial: 11,
    perTurn: 7
  }
};

const V3 = {
  null: () => [0, 0, 0],
  add: (x, y, z) => [x[0] + y[0], x[1] + y[1], z[0] + z[1]],
  mult: (x, y, z) => [x[0] * y[0], x[1] * y[1], z[0] * z[1]]
};

class Phase {
  constructor(game) {
    this.game = game;
  }

  static new(name, game) {
    let cls = {
      create: CreatePhase,
      orders: OrdersPhase,
      move: MovePhase
    }[name];
    return new cls(game);
  }
}

class CreatePhase extends Phase {
  update() {
  }
}

class OrdersPhase extends Phase {
  constructor(game) {
    super(game);
    this.orders = [];
  }

  update() {
    if (!this.isFinished()) {
      this.game.processOrders(this.orders);
      this.game.setPhase('move');
    }
  }

  isFinished() {
    return this.orders.length < this.game.players.length;
  }
}

class MovePhase extends Phase {
  update() {
    this.game.projectiles.forEach(b => b.update());
    this.game.checkCollisions();
    if (this.game.finishedMoving()) {
      this.game.setPhase('orders');
    }
  }

  isFinished() {
  }
}

class Game {

  constructor() {
    this.moon = null;
    this.initPhases();
    this.players = [];
  }

  get projectiles() {
    return this.players.map(x => x.projectiles).reduce((x, y) => x.concat(y));
  }

  get bombs() {
    return this.players.map(x => x.bombs).reduce((x, y) => x.concat(y));
  }

  get orders() {
    return this.players.map(x => x.order).filter(x => x !== undefined);
  }

  initPhases() {
    this.setPhase('create');
  }

  setPhase(phaseName) {
    this.phase = new Phase.new(phaseName, this);
  }

  initDemo() {
    this.createMoon({width: 100, height: 100});
    this.createPlayer({name: 'P1', color: [127, 200, 255]});
    this.createPlayer({name: 'P2', color: [255, 64, 0]});
  }

  start() {
    this.startTurn();
  }

  startTurn() {
    this.setPhase('orders');
  }

  checkCollisions() {
    this.projectiles.forEach((p) => {
      if (p.position.z < this.moon.heightAt(p.position.x, p.position.y)) {
        this.projectileMoonCollision(p);
      };
    });
  }

  projectileMoonCollision(projectile) {
    console.log('projectile collided with map');
  }

  processOrders(orders) {
    orders.forEach(o => o.process());
  }

  createMoon(opts) {
    this.moon = new Moon(opts);
    return this.moon;
  }

  createPlayer(opts) {
    let player = new Player(opts);
    this.players.push(player);
    return player;
  }

  update() {
    this.phase.update(this);
  }
}

class Moon {
  constructor({width, height}) {
    this.width = width;
    this.height = height;
  }

  heightAt(x, y) {
    return 0;
  }
}

class Projectile {

  constructor({velocity, position}) {
    this.velocity = velocity || V3.null();
    this.position = position || V3.null();
  }

  update() {
    this.position = V3.add(this.position, this.deltaPosition());
    this.velocity.z -= Config.gravity;
  }

  deltaPosition() {
    return V3.mult(this.velocity, Config.friction);
  }
}

class Bomb extends Projectile {}

class Building {}
class Hub extends Building {}

class Order {
  constructor({player}) {
    this.player = player;
  }
}

class ShootOrder extends Order {
  constructor({player, projectile}) {
    super({player: player});
    this.projectile = opts.projectile;
  }

  process(game) {
    game.addProjectile(this.projectile);
  }
}

class SkipOrder extends Order {}

class QuitOrder extends Order {
  process(game) {
    game.removePlayer(this.player);
  }
}

class Player {
  constructor({name, color, initialEnergy, baseEnergyPerTurn}) {
    this.name = name;
    this.color = color;
    this.energy = initialEnergy || Config.energy.initial;
    this.baseEnergyPerTurn = baseEnergyPerTurn || Config.energy.perTurn;
    this.projectiles = [];
  }

  get bombs() { return this.projectiles.filter(x => x.constructor === Bomb); }
}

export { Game };
