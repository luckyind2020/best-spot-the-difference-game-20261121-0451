// Milo's Garden — screenshot mode.
//
// The judge screenshots are taken from the page URL: ?shot=start|play|end
// with a numeric &seed. Each mode freezes the game in the exact state the
// spec asks for, with the clock stopped so the capture is deterministic.
//
//   start — title overlay over round 1, timer 1:30, score 0, found 0 / 7
//   play  — mid-round 1, first three differences already found (green rings
//           with check marks on both panels), timer 0:47, score 300,
//           two hints left, four differences still unfound
//   end   — round-clear overlay for round 1, all seven found, timer 0:23,
//           score 815, time bonus 115

import { SCENES } from './scenes.js';

export function applyShotMode(game) {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  if (!shot) return false;

  const { state } = game;
  const roundOne = SCENES[0];
  state.frozen = true;
  state.round = 0;

  if (shot === 'start') {
    state.screen = 'title';
    state.score = 0;
    state.found = new Set();
    state.hintsLeft = 3;
    state.timeLeft = 90;
  } else if (shot === 'play') {
    state.screen = 'play';
    state.score = 300;
    state.found = new Set(roundOne.diffs.slice(0, 3).map((d) => d.id));
    state.hintsLeft = 2;
    state.timeLeft = 47;
  } else if (shot === 'end') {
    state.screen = 'roundclear';
    state.score = 815;
    state.bonus = 115;
    state.found = new Set(roundOne.diffs.map((d) => d.id));
    state.hintsLeft = 3;
    state.timeLeft = 23;
  } else {
    return false;
  }

  game.syncHud();
  game.syncOverlay();
  return true;
}
