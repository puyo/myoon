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

class Game {
  constructor() {
    this.moon = null;
    this.initPhases();
    this.players = new Map();
  }

  initPhases() {
    this.phases = {
      create: {
        update(game) {
        }
      },
      orders: {
        update(game) {
          if (game.areAllOrdersCollected()) {
            game.processOrders();
            game.setPhase('move');
          }
        }
      },
      move: {
        update(game) {
          game.projectiles.forEach(b => b.update());
          game.checkCollisions();
          if (game.finishedMoving()) {
            game.startOrdersPhase();
          }
        }
      },
    };
    this.setPhase('create');
  }

  setPhase(phaseName) {
    this.phase = this.phases[phaseName];
  }

  get projectiles() {
    return [];
  }

  initDemo() {
    this.moon = this.createMoon({width: 100, height: 100});
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

  finishedMoving() {
    return true;
  }

  createMoon(opts) {
    this.moon = new Moon(opts);
  }

  createPlayer(opts) {
    let player = new Player(opts);
    this.players.set(opts.name, player);
    return player;
  }

  update() {
    this.phase.update();
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
  }
}

export { Game };
