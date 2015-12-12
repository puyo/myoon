import test from 'tape';
import * as myoon from '../src/myoon';

test('Hi', t => {
  let game = new myoon.Game();
  game.initDemo();
  game.start();
  t.end();
});
