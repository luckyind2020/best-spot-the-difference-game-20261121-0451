// Milo's Garden — scene painters.
//
// Every scene is drawn twice from one recipe: paint(ctx, false) is the left
// picture, paint(ctx, true) is the right picture with its seven alterations
// applied. Nothing here loads an image or a font; every shape is canvas
// primitives, so the game plays fully offline. All coordinates live in the
// scene's own 600 x 600 space; the engine translates each panel into place.

function circle(ctx, x, y, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

function puffCloud(ctx, x, y, scale, puffs, fill) {
  // A cloud is a row of overlapping circles; `puffs` lists [dx, dy, r].
  ctx.fillStyle = fill;
  for (const [dx, dy, r] of puffs) {
    ctx.beginPath();
    ctx.arc(x + dx * scale, y + dy * scale, r * scale, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillRect(x - 34 * scale, y - 2 * scale, 68 * scale, 14 * scale);
}

function drawSun(ctx, x, y, r, body, rayLen) {
  ctx.strokeStyle = body;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a) * (r + 6), y + Math.sin(a) * (r + 6));
    ctx.lineTo(x + Math.cos(a) * (r + rayLen), y + Math.sin(a) * (r + rayLen));
    ctx.stroke();
  }
  circle(ctx, x, y, r, body);
}

// Sitting orange cat, facing left. `tailDown` flips the tail from a happy
// curl-up to a drooping curl-down — one of the garden differences.
function sittingCat(ctx, x, y, tailDown) {
  ctx.fillStyle = '#f08a2e';
  // body
  ellipse(ctx, x, y, 42, 34, '#f08a2e');
  // tail
  ctx.strokeStyle = '#f08a2e';
  ctx.lineWidth = 11;
  ctx.lineCap = 'round';
  ctx.beginPath();
  if (tailDown) {
    ctx.moveTo(x + 38, y + 8);
    ctx.quadraticCurveTo(x + 62, y + 22, x + 52, y + 44);
  } else {
    ctx.moveTo(x + 38, y + 8);
    ctx.quadraticCurveTo(x + 64, y - 6, x + 56, y - 34);
  }
  ctx.stroke();
  // head
  circle(ctx, x - 26, y - 34, 26, '#f08a2e');
  // ears
  ctx.beginPath();
  ctx.moveTo(x - 46, y - 52); ctx.lineTo(x - 40, y - 68); ctx.lineTo(x - 30, y - 54);
  ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - 14, y - 54); ctx.lineTo(x - 8, y - 70); ctx.lineTo(x + 2, y - 52);
  ctx.closePath(); ctx.fill();
  // face
  circle(ctx, x - 34, y - 38, 2.6, '#5a3d24');
  circle(ctx, x - 16, y - 38, 2.6, '#5a3d24');
  ctx.strokeStyle = '#5a3d24';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x - 25, y - 28, 5, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  // whiskers
  ctx.lineWidth = 1.4;
  for (const wy of [-30, -24]) {
    ctx.beginPath(); ctx.moveTo(x - 48, y + wy); ctx.lineTo(x - 64, y + wy - 3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - 4, y + wy); ctx.lineTo(x + 12, y + wy - 3); ctx.stroke();
  }
}

// Sleeping cat curled on a cushion, for the kitchen round.
function sleepingCat(ctx, x, y) {
  ellipse(ctx, x, y, 52, 22, '#f08a2e');
  circle(ctx, x - 44, y - 10, 20, '#f08a2e');
  ctx.beginPath();
  ctx.moveTo(x - 60, y - 24); ctx.lineTo(x - 56, y - 38); ctx.lineTo(x - 44, y - 26);
  ctx.closePath(); ctx.fillStyle = '#f08a2e'; ctx.fill();
  ctx.strokeStyle = '#5a3d24';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(x - 48, y - 10, 5, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke();
  ctx.strokeStyle = '#d96f1e';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(x + 8, y - 2, 16, -0.6, 1.2); ctx.stroke();
  ctx.beginPath(); ctx.arc(x + 30, y + 2, 12, -0.6, 1.2); ctx.stroke();
}

function tulip(ctx, x, y, petal) {
  ctx.strokeStyle = '#3f7a34';
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 34); ctx.stroke();
  ellipse(ctx, x - 8, y - 18, 9, 4, '#5da24a');
  ctx.fillStyle = petal;
  ctx.beginPath();
  ctx.moveTo(x - 11, y - 32);
  ctx.quadraticCurveTo(x - 13, y - 52, x, y - 46);
  ctx.quadraticCurveTo(x + 13, y - 52, x + 11, y - 32);
  ctx.closePath();
  ctx.fill();
}

// ---------------------------------------------------------------- garden ---
function paintGarden(ctx, alt) {
  // sky
  const sky = ctx.createLinearGradient(0, 0, 0, 380);
  sky.addColorStop(0, '#8ec9ee');
  sky.addColorStop(1, '#cfeefb');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 600, 380);
  // sun: yellow in A, orange in B
  drawSun(ctx, 85, 78, 32, alt ? '#ff8c2e' : '#ffd94a', 16);
  // clouds
  puffCloud(ctx, 300, 66, 1, [[-26, 0, 18], [0, -10, 22], [26, 0, 18]], '#ffffff');
  puffCloud(ctx, 462, 108, 0.8, [[-22, 0, 15], [0, -8, 18], [22, 0, 15]], '#ffffff');
  // bird: present in A, gone in B
  if (!alt) {
    ctx.strokeStyle = '#4a4a4a';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(205, 118, 10, Math.PI, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(225, 118, 10, Math.PI, Math.PI * 2); ctx.stroke();
  }
  // butterfly: present in A, gone in B
  if (!alt) {
    ellipse(ctx, 468, 168, 14, 10, '#c86dd7');
    ellipse(ctx, 492, 168, 14, 10, '#c86dd7');
    ellipse(ctx, 470, 184, 10, 7, '#9b4fc0');
    ellipse(ctx, 490, 184, 10, 7, '#9b4fc0');
    ctx.strokeStyle = '#5a3d24';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(480, 158); ctx.lineTo(480, 190); ctx.stroke();
  }
  // hills + grass
  ctx.fillStyle = '#7cc46a';
  ctx.beginPath(); ctx.ellipse(140, 430, 260, 90, 0, Math.PI, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#69b455';
  ctx.beginPath(); ctx.ellipse(480, 440, 280, 100, 0, Math.PI, Math.PI * 2); ctx.fill();
  rect(ctx, 0, 400, 600, 200, '#69b455');
  // tree
  rect(ctx, 512, 300, 18, 110, '#8a5a2e');
  circle(ctx, 521, 268, 46, '#4e9e44');
  circle(ctx, 486, 296, 32, '#5cb04e');
  circle(ctx, 556, 296, 32, '#57a848');
  // mushroom: present in A, gone in B
  if (!alt) {
    rect(ctx, 540, 498, 10, 18, '#fff3d6');
    ctx.fillStyle = '#e05252';
    ctx.beginPath(); ctx.arc(545, 500, 18, Math.PI, 0); ctx.fill();
    circle(ctx, 538, 492, 3, '#ffffff');
    circle(ctx, 550, 496, 3, '#ffffff');
  }
  // wooden fence: one picket missing in B
  ctx.fillStyle = '#a9743f';
  ctx.fillRect(16, 392, 280, 10);
  ctx.fillRect(16, 424, 280, 10);
  for (let i = 0; i < 8; i++) {
    const px = 24 + i * 36;
    if (alt && i === 3) continue; // the missing picket
    ctx.fillRect(px, 378, 14, 66);
    ctx.beginPath();
    ctx.moveTo(px, 378); ctx.lineTo(px + 7, 368); ctx.lineTo(px + 14, 378);
    ctx.closePath(); ctx.fill();
  }
  // Milo the cat, sitting on the grass
  sittingCat(ctx, 400, 472, alt);
  // six tulips along the bottom; the third changes colour in B
  const petals = ['#e05252', '#ffd94a', '#e05252', '#ff9ecf', '#ff8c2e', '#ffffff'];
  const tulipX = [52, 118, 184, 250, 316, 522];
  tulipX.forEach((tx, i) => {
    const petal = alt && i === 2 ? '#3f6fd8' : petals[i];
    tulip(ctx, tx, 566, petal);
  });
}

const GARDEN_DIFFS = [
  { id: 'sun', label: 'the sun turned orange', x: 85, y: 78, r: 38 },
  { id: 'bird', label: 'the bird flew away', x: 215, y: 118, r: 26 },
  { id: 'butterfly', label: 'the butterfly flew away', x: 480, y: 172, r: 28 },
  { id: 'picket', label: 'a fence picket is missing', x: 132, y: 410, r: 28 },
  { id: 'tail', label: "Milo's tail droops down", x: 456, y: 442, r: 30 },
  { id: 'mushroom', label: 'the mushroom is gone', x: 545, y: 502, r: 26 },
  { id: 'tulip', label: 'a tulip turned blue', x: 184, y: 548, r: 28 },
];

// ------------------------------------------------------------------ beach ---
function paintBeach(ctx, alt) {
  // dusk sky
  const sky = ctx.createLinearGradient(0, 0, 0, 320);
  sky.addColorStop(0, '#ff9e57');
  sky.addColorStop(1, '#ffd27d');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 600, 320);
  // low sun: pale yellow in A, deep red in B
  drawSun(ctx, 480, 150, 38, alt ? '#e8483f' : '#ffe08a', 12);
  // clouds
  puffCloud(ctx, 140, 80, 1, [[-26, 0, 18], [0, -10, 22], [26, 0, 18]], '#ffd9c2');
  puffCloud(ctx, 330, 120, 0.8, [[-22, 0, 15], [0, -8, 18], [22, 0, 15]], '#ffd9c2');
  // sea
  rect(ctx, 0, 300, 600, 130, '#3d9db5');
  ctx.strokeStyle = 'rgba(255,255,255,.55)';
  ctx.lineWidth = 3;
  for (const wy of [322, 352, 384]) {
    ctx.beginPath();
    for (let x = 0; x <= 600; x += 30) ctx.lineTo(x, wy + Math.sin(x / 60) * 4);
    ctx.stroke();
  }
  // sand
  rect(ctx, 0, 430, 600, 170, '#f2d8a0');
  // sailboat: white sail in A, coral sail in B
  ctx.fillStyle = '#7a4a21';
  ctx.beginPath();
  ctx.moveTo(110, 330); ctx.lineTo(190, 330); ctx.lineTo(172, 352); ctx.lineTo(128, 352);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#7a4a21';
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(150, 330); ctx.lineTo(150, 268); ctx.stroke();
  ctx.fillStyle = alt ? '#ff6f61' : '#ffffff';
  ctx.beginPath();
  ctx.moveTo(150, 272); ctx.lineTo(150, 326); ctx.lineTo(186, 326);
  ctx.closePath(); ctx.fill();
  // footprints in the sand (decoration, same in both pictures)
  ctx.fillStyle = '#d9b878';
  for (const [fx, fy] of [[180, 560], [196, 574], [212, 560], [228, 574], [244, 560]]) {
    ellipse(ctx, fx, fy, 7, 10, '#d9b878');
  }
  // sandcastle with a flag: the flag is gone in B
  ctx.fillStyle = '#eec887';
  ctx.fillRect(96, 470, 52, 40);
  ctx.beginPath();
  ctx.moveTo(96, 470); ctx.lineTo(122, 442); ctx.lineTo(148, 470);
  ctx.closePath(); ctx.fill();
  ctx.fillRect(108, 486, 10, 12);
  ctx.fillRect(126, 486, 10, 12);
  if (!alt) {
    ctx.strokeStyle = '#7a4a21';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(122, 442); ctx.lineTo(122, 414); ctx.stroke();
    ctx.fillStyle = '#e05252';
    ctx.beginPath();
    ctx.moveTo(122, 414); ctx.lineTo(146, 421); ctx.lineTo(122, 428);
    ctx.closePath(); ctx.fill();
  }
  // umbrella: upright in A, tilted in B
  ctx.save();
  ctx.translate(430, 452);
  ctx.rotate(alt ? 0.28 : 0);
  ctx.strokeStyle = '#8a5a2e';
  ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -72); ctx.stroke();
  ctx.fillStyle = '#e05252';
  ctx.beginPath(); ctx.arc(0, -72, 52, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#fff3d6';
  ctx.beginPath(); ctx.arc(0, -72, 52, Math.PI * 1.25, Math.PI * 1.5); ctx.fill();
  ctx.beginPath(); ctx.arc(0, -72, 52, Math.PI * 1.75, Math.PI * 2); ctx.fill();
  ctx.restore();
  // beach ball: red/white/blue in A, green/yellow in B
  const ballCols = alt ? ['#58a05c', '#ffd94a', '#58a05c'] : ['#e05252', '#ffffff', '#3f6fd8'];
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = ballCols[i];
    ctx.beginPath();
    ctx.moveTo(300, 520);
    ctx.arc(300, 520, 30, -Math.PI / 2 + (i * 2 * Math.PI) / 3, -Math.PI / 2 + ((i + 1) * 2 * Math.PI) / 3);
    ctx.closePath(); ctx.fill();
  }
  circle(ctx, 300, 520, 8, '#ffffff');
  // starfish: present in A, gone in B
  if (!alt) {
    ctx.fillStyle = '#ff8c2e';
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
      const a2 = a + Math.PI / 5;
      ctx.lineTo(520 + Math.cos(a) * 22, 540 + Math.sin(a) * 22);
      ctx.lineTo(520 + Math.cos(a2) * 9, 540 + Math.sin(a2) * 9);
    }
    ctx.closePath(); ctx.fill();
  }
  // shell: appears only in B
  if (alt) {
    ctx.fillStyle = '#ffb3d1';
    ctx.beginPath(); ctx.arc(250, 470, 16, Math.PI, 0); ctx.fill();
    ctx.strokeStyle = '#d96f9e';
    ctx.lineWidth = 2;
    for (const a of [-0.9, -0.45, 0, 0.45, 0.9]) {
      ctx.beginPath();
      ctx.moveTo(250, 470);
      ctx.lineTo(250 + Math.sin(a) * 15, 470 - Math.cos(a) * 15);
      ctx.stroke();
    }
  }
  // Milo, sitting on the sand
  sittingCat(ctx, 360, 500, false);
}

const BEACH_DIFFS = [
  { id: 'sun', label: 'the sun turned deep red', x: 480, y: 150, r: 40 },
  { id: 'sail', label: 'the sail turned coral', x: 162, y: 300, r: 30 },
  { id: 'flag', label: 'the sandcastle flag is gone', x: 130, y: 422, r: 26 },
  { id: 'umbrella', label: 'the umbrella tilted over', x: 430, y: 424, r: 34 },
  { id: 'ball', label: 'the beach ball changed colour', x: 300, y: 520, r: 30 },
  { id: 'starfish', label: 'the starfish is gone', x: 520, y: 540, r: 26 },
  { id: 'shell', label: 'a shell appeared', x: 250, y: 470, r: 26 },
];

// ---------------------------------------------------------------- kitchen ---
function paintKitchen(ctx, alt) {
  // wall + floor
  rect(ctx, 0, 0, 600, 470, '#f7e3c2');
  rect(ctx, 0, 470, 600, 130, '#c98f5f');
  ctx.strokeStyle = 'rgba(122,74,33,.35)';
  ctx.lineWidth = 2;
  for (let y = 500; y < 600; y += 26) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(600, y); ctx.stroke();
  }
  // window with curtains: red in A, teal in B
  rect(ctx, 84, 56, 172, 150, '#bfe3f2');
  circle(ctx, 130, 96, 26, '#fff3b0');
  puffCloud(ctx, 200, 84, 0.7, [[-18, 0, 12], [0, -7, 15], [18, 0, 12]], '#ffffff');
  ctx.strokeStyle = '#8a5a2e';
  ctx.lineWidth = 5;
  ctx.strokeRect(84, 56, 172, 150);
  ctx.beginPath(); ctx.moveTo(170, 56); ctx.lineTo(170, 206); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(84, 131); ctx.lineTo(256, 131); ctx.stroke();
  const curtain = alt ? '#3d9db5' : '#e05252';
  ctx.fillStyle = curtain;
  ctx.fillRect(66, 44, 34, 178);
  ctx.fillRect(240, 44, 34, 178);
  ctx.fillStyle = 'rgba(0,0,0,.12)';
  ctx.fillRect(74, 44, 6, 178);
  ctx.fillRect(248, 44, 6, 178);
  // clock: hands at 10:10 in A, at 4:40 in B
  circle(ctx, 420, 92, 38, '#fffdf5');
  ctx.strokeStyle = '#8a5a2e';
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(420, 92, 38, 0, Math.PI * 2); ctx.stroke();
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    circle(ctx, 420 + Math.cos(a) * 30, 92 + Math.sin(a) * 30, 2, '#5a3d24');
  }
  const hands = alt ? [[-2.1, 20], [2.4, 28]] : [[-2.4, 20], [0.5, 28]];
  ctx.strokeStyle = '#5a3d24';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  for (const [a, len] of hands) {
    ctx.beginPath();
    ctx.moveTo(420, 92);
    ctx.lineTo(420 + Math.cos(a) * len, 92 + Math.sin(a) * len);
    ctx.stroke();
  }
  // shelf with three jars; the middle jar changes colour in B
  rect(ctx, 296, 196, 208, 12, '#a9743f');
  const jarCols = ['#f2b544', alt ? '#58a05c' : '#e08a3c', '#c86dd7'];
  const jarX = [316, 372, 428];
  jarX.forEach((jx, i) => {
    ctx.fillStyle = jarCols[i];
    ctx.fillRect(jx, 158, 34, 38);
    ctx.fillStyle = '#8a5a2e';
    ctx.fillRect(jx + 4, 150, 26, 9);
    ctx.fillStyle = 'rgba(255,255,255,.4)';
    ctx.fillRect(jx + 6, 164, 6, 26);
  });
  // hanging lamp: yellow shade in A, blue shade in B
  ctx.strokeStyle = '#5a3d24';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(492, 0); ctx.lineTo(492, 96); ctx.stroke();
  ctx.fillStyle = alt ? '#3f6fd8' : '#ffd94a';
  ctx.beginPath();
  ctx.moveTo(462, 96); ctx.lineTo(522, 96); ctx.lineTo(510, 128); ctx.lineTo(474, 128);
  ctx.closePath(); ctx.fill();
  circle(ctx, 492, 134, 7, '#fff3b0');
  // rug
  ellipse(ctx, 320, 548, 150, 30, '#e05252');
  ellipse(ctx, 320, 548, 110, 20, '#f2b544');
  ellipse(ctx, 320, 548, 66, 11, '#e05252');
  // table
  rect(ctx, 56, 408, 488, 16, '#a9743f');
  rect(ctx, 76, 424, 16, 62, '#8a5a2e');
  rect(ctx, 508, 424, 16, 62, '#8a5a2e');
  // plate + fork
  circle(ctx, 300, 398, 26, '#fffdf5');
  circle(ctx, 300, 398, 17, '#e8d9b8');
  ctx.strokeStyle = '#8a8a8a';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(348, 384); ctx.lineTo(348, 412); ctx.stroke();
  for (const ty of [384, 390, 396]) {
    ctx.beginPath(); ctx.moveTo(342, ty); ctx.lineTo(354, ty); ctx.stroke();
  }
  // teapot
  ctx.fillStyle = '#3d9db5';
  ellipse(ctx, 220, 392, 30, 20, '#3d9db5');
  ctx.beginPath();
  ctx.moveTo(246, 384); ctx.quadraticCurveTo(268, 384, 264, 402);
  ctx.quadraticCurveTo(254, 402, 248, 396);
  ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.arc(192, 388, 10, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#3d9db5';
  circle(ctx, 220, 368, 7, '#3d9db5');
  // cake on the table; a cherry appears on it in B
  ctx.fillStyle = '#f2b544';
  ctx.fillRect(392, 388, 56, 20);
  ctx.fillStyle = '#ff9ecf';
  ctx.fillRect(392, 380, 56, 9);
  ctx.fillStyle = '#fff3d6';
  ctx.fillRect(392, 380, 56, 3);
  if (alt) {
    circle(ctx, 420, 374, 7, '#e05252');
    ctx.strokeStyle = '#3f7a34';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(420, 368); ctx.quadraticCurveTo(426, 360, 430, 362); ctx.stroke();
  }
  // potted plant on the floor: present in A, gone in B
  if (!alt) {
    ctx.fillStyle = '#e05252';
    ctx.beginPath();
    ctx.moveTo(524, 500); ctx.lineTo(556, 500); ctx.lineTo(550, 528); ctx.lineTo(530, 528);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#3f7a34';
    ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(540, 500); ctx.lineTo(540, 462); ctx.stroke();
    ellipse(ctx, 524, 458, 16, 10, '#5da24a');
    ellipse(ctx, 556, 462, 16, 10, '#5da24a');
    ellipse(ctx, 540, 446, 14, 12, '#69b455');
  }
  // Milo asleep on a cushion; the cushion changes colour in B
  ellipse(ctx, 150, 536, 78, 22, alt ? '#7fc8a9' : '#ff9ecf');
  sleepingCat(ctx, 150, 522);
}

const KITCHEN_DIFFS = [
  { id: 'curtains', label: 'the curtains turned teal', x: 83, y: 130, r: 34 },
  { id: 'clock', label: 'the clock hands moved', x: 420, y: 92, r: 40 },
  { id: 'jar', label: 'a jar turned green', x: 389, y: 177, r: 26 },
  { id: 'lamp', label: 'the lamp shade turned blue', x: 492, y: 112, r: 28 },
  { id: 'cherry', label: 'a cherry appeared on the cake', x: 420, y: 374, r: 26 },
  { id: 'plant', label: 'the potted plant is gone', x: 540, y: 490, r: 30 },
  { id: 'cushion', label: "Milo's cushion changed colour", x: 150, y: 536, r: 30 },
];

export const SCENES = [
  { name: 'Garden Morning', paint: paintGarden, diffs: GARDEN_DIFFS },
  { name: 'Beach Sunset', paint: paintBeach, diffs: BEACH_DIFFS },
  { name: 'Cozy Kitchen', paint: paintKitchen, diffs: KITCHEN_DIFFS },
];
