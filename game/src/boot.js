// Milo's Garden — boot.
//
// Wires the canvas and the engine together, then applies screenshot mode
// when the page URL asks for it (?shot=start|play|end&seed=1).

import { createGame } from './engine.js';
import { applyShotMode } from './shots.js';

const canvas = document.getElementById('game');
const game = createGame(canvas);
applyShotMode(game);
