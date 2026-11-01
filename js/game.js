/* Bộ máy game Vô Sắc Linh Căn: màn hình tài khoản, tạo nhân vật, vòng lặp chơi,
   vẽ canvas, thoại, sự kiện trắc linh / mở miệng, thổ nạp, Ngôn Linh. */
(function () {
  'use strict';
  var L = window.VSLC, S = window.VSLC_SPRITES, ST = window.VSLC_STORY, sha256 = window.VSLC_SHA256;
  var TILE = 32;
  var viewW = 960, viewH = 720, viewDpr = 1;
  /* VIEWFN-BEGIN */
  function computeView(w, h) {
    var vw = Math.floor(Number(w) || 0);
    var vh = Math.floor(Number(h) || 0);
    if (vw < 240) vw = 240;
    if (vh < 180) vh = 180;
    return { w: vw, h: vh };
  }
  function clampCam(cx, cy, vw, vh, worldW, worldH) {
    var maxX = Math.max(0, (worldW || 0) - (vw || 0));
    var maxY = Math.max(0, (worldH || 0) - (vh || 0));
    var x = Math.max(0, Math.min(maxX, Number(cx) || 0));
    var y = Math.max(0, Math.min(maxY, Number(cy) || 0));
    return { x: x, y: y };
  }
  /* VIEWFN-END */

  /* ---------- Tiện ích DOM ---------- */
  function $(id) { return document.getElementById(id); }
  function show(id) {
    ['screen-auth', 'screen-create', 'screen-game'].forEach(function (s) { $(s).classList.toggle('hidden', s !== id); });
  }
  var toastMinimized = false, toastUnread = 0, lastToastMsg = '', lastToastMs = 3200;
  try { toastMinimized = localStorage.getItem('vslc_toast_min') === '1'; } catch (e) { toastMinimized = false; }
  var questMinimized = false;
  try { questMinimized = localStorage.getItem('vslc_quest_min') === '1'; } catch (e) { questMinimized = false; }
  var seenQuestIds = {}, lastQuestId = null;
  function updateToastTab() {
    var tab = $('toast-tab'), cnt = $('toast-count');
    if (cnt) cnt.textContent = String(toastUnread);
    if (tab) tab.classList.toggle('hidden', !(toastMinimized && toastUnread > 0));
  }
  function applyQuestMin() {
    var panel = $('hud-quest'), tab = $('quest-tab');
    if (panel) panel.classList.toggle('hidden', questMinimized);
    if (tab) tab.classList.toggle('hidden', !questMinimized);
    try { localStorage.setItem('vslc_quest_min', questMinimized ? '1' : '0'); } catch (e) {}
  }
  function toast(msg, ms) {
    lastToastMsg = msg; lastToastMs = ms || 3200;
    var t = $('toast'), txt = $('toast-text');
    if (toastMinimized) {
      toastUnread += 1;
      if (t) t.classList.add('hidden');
      clearTimeout(toast._h);
      updateToastTab();
      return;
    }
    if (txt) txt.textContent = msg; else if (t) t.textContent = msg;
    if (t) t.classList.remove('hidden');
    updateToastTab();
    clearTimeout(toast._h); toast._h = setTimeout(function () { t.classList.add('hidden'); }, ms || 3200);
  }

  /* ---------- Âm thanh tối giản (WebAudio, lỗi thì bỏ qua) ---------- */
  var AC = null;
  function beep(freq, dur, type, gain) {
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)();
      var o = AC.createOscillator(), g = AC.createGain();
      o.type = type || 'sine'; o.frequency.value = freq;
      g.gain.setValueAtTime(gain || 0.05, AC.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, AC.currentTime + dur);
      o.connect(g); g.connect(AC.destination); o.start(); o.stop(AC.currentTime + dur);
    } catch (e) { /* im lặng */ }
  }
  function rumble() { beep(52, 1.1, 'sawtooth', 0.12); beep(38, 1.4, 'triangle', 0.1); }

  /* ---------- Tài khoản ---------- */
  var currentUser = null;
  function authError(msg) { $('auth-error').textContent = msg || ''; }
  $('btn-register').addEventListener('click', function () {
    var u = $('auth-user').value, p = $('auth-pass').value;
    var r = L.register(localStorage, sha256, u, p);
    if (!r.ok) return authError(r.reason);
    authError(''); toast('Đăng kí thành công. Hãy đăng nhập để bắt đầu.');
  });
  $('btn-login').addEventListener('click', function () {
    var u = $('auth-user').value.trim(), p = $('auth-pass').value;
    var r = L.login(localStorage, sha256, u, p);
    if (!r.ok) return authError(r.reason);
    currentUser = u; authError('');
    var saved = L.loadGame(localStorage, u);
    if (saved) { startGame(saved); }
    else { show('screen-create'); }
  });
  $('btn-create').addEventListener('click', function () {
    var name = $('char-name').value.trim() || 'Giang Phàm';
    var gender = document.querySelector('input[name="gender"]:checked').value;
    var st = L.newCharacter(name, gender);
    L.saveGame(localStorage, currentUser, st);
    startGame(st);
  });
  $('btn-logout').addEventListener('click', function () {
    saveNow(); currentUser = null; state = null; show('screen-auth');
  });

  /* ---------- Trạng thái phiên chơi ---------- */
  var state = null, px = 0, py = 0, facing = 'up', moving = false, walkFrame = 0, walkTimer = 0;
  var keys = {}, npcsLive = [], floats = [], rings = [], shakeT = 0, dlg = null, dlgQueue = [], dlgCb = null;
  var meditating = false, saveTimer = 0, startedAt = 0;
  /* ---------- Đợt 2: asset ảnh thật + camera + di chuyển bằng chuột ---------- */
  var camX = 0, camY = 0;                 // camera bám mượt (trạng thái toàn cục)
  var clickPath = null, clickTarget = null; // đường đi khi bấm chuột
  var medLatch = false;                    // chốt thổ nạp từ nút kỹ năng
  var CHAR_LOOKS = ['player_nam', 'player_nu', 'u_nhan', 'di_ninh', 'luc_tranh', 'anh_phung', 'chinh_ngon', 'elder', 'villager_m', 'villager_f', 'villager_old'];
  var PROP_TYPES = ['house_big', 'house', 'house_b', 'house_c', 'inn', 'stele', 'well', 'lantern', 'tree', 'pine', 'dummy', 'dummy_broken', 'stall', 'gate', 'jars', 'woodpile', 'rack', 'sacks'];
  var ASSETS = { bg: null, chars: {}, props: {} };
  function loadImg(src) { var im = new Image(); im.src = src; return im; }
  ASSETS.bg = loadImg('assets/bg.png');
  CHAR_LOOKS.forEach(function (id) { ASSETS.chars[id] = loadImg('assets/chars/' + id + '.png'); });
  PROP_TYPES.forEach(function (t) { ASSETS.props[t] = loadImg('assets/props/' + t + '.png'); });
  function imgReady(im) { return !!(im && im.complete && im.naturalWidth > 0); }
  var DIR_ROW = { down: 0, up: 1, right: 2, left: 3 }; // hàng trong sheet nhân vật
  /* ---------- Đợt 8 hướng + cần cảm ứng (docs/char-sheet-8dir.md, docs/touch-joystick.md) ---------- */
  // Nhân vật đã chuyển sang sheet 8 hướng 480x960 (ô 96x120, hàng = dir8, cột = khung).
  // Nhân vật chưa có trong bảng này vẫn dùng sheet cũ 128x320 (ô 64x80, DIR_ROW).
  var CHAR8 = { player_nam: true };
  var DIR8_ROW4 = { down: 0, right: 2, up: 4, left: 6 }; // hướng 4 chính -> hàng chẵn của sheet 8 hướng
  var DIR8_EVEN_DIR = { 0: 'down', 2: 'right', 4: 'up', 6: 'left' }; // hàng chẵn -> tên hướng 4 chính
  var dir8 = 0;          // hướng HIỂN THỊ riêng của người chơi (0..7); `facing` 4 hướng vẫn là hướng logic
  var stepPhase = 0;     // pha bước của sheet mới: 0 đứng yên, 1..4 chu kỳ bước (mỗi khung ~0,11s)
  var stepTimer = 0;
  function isChar8(look, im) {
    return !!(CHAR8[look] && im && im.naturalWidth === 480 && im.naturalHeight === 960);
  }
  // Hình chữ nhật nguồn trong sheet: sheet mới -> ô 96x120 (hàng dir8, cột frame8);
  // sheet cũ -> ô 64x80 (hàng DIR_ROW theo hướng 4 chính, cột frame01).
  function charSrc(look, im, dirName, d8, frame8, frame01) {
    if (isChar8(look, im)) return { x: frame8 * 96, y: d8 * 120, w: 96, h: 120 };
    return { x: frame01 * 64, y: (DIR_ROW[dirName] || 0) * 80, w: 64, h: 80 };
  }
  // Hướng 4 chính gần nhất của một dir8 (làm tròn về hàng chẵn) — cho sprite lưới dự phòng.
  function dir8NearDir(d8) {
    return DIR8_EVEN_DIR[(Math.round(d8 / 2) * 2) % 8] || 'down';
  }
  /* ---------- Cần điều khiển cảm ứng (floating joystick) ---------- */
  var JOY_R = 56; // bán kính vòng cần (px, hệ tọa độ màn hình)
  var joy = { state: 'idle', id: null, sx: 0, sy: 0, cx: 0, cy: 0, t0: 0, active: false, ux: 0, uy: 0, speed: 0 };
  var suppressTapUntil = 0; // sau một lần kéo cần, chặn 1 lần chạm nối tiếp (click chuột tổng hợp) trong cửa sổ ngắn
  function resetJoy() {
    joy.state = 'idle'; joy.id = null; joy.active = false; joy.ux = 0; joy.uy = 0; joy.speed = 0;
  }
  var BIG_SHADOW = { house: 1, house_big: 1, house_b: 1, house_c: 1, inn: 1, stele: 1, well: 1, stall: 1, gate: 1, tree: 1, pine: 1 };
  // Vật thể trang trí thị giác: CHỈ vẽ, không vào logic, không chặn đường.
  // PHẢI GIỮ ĐỒNG BỘ với VISUAL_DECOR trong tools/dump-scene.js.
  var VISUAL_DECOR = [
    { type: 'gate', cx: 960, bottom: 1440, depth: 1427 },
    { type: 'jars', cx: 415, bottom: 245, depth: 245 },
    { type: 'woodpile', cx: 225, bottom: 1170, depth: 1170 },
    { type: 'rack', cx: 1500, bottom: 1175, depth: 1175 },
    { type: 'sacks', cx: 1560, bottom: 218, depth: 218 }
  ];
  // Bảng tên trên cổng trong gate.png (224x150): đo bằng PIL — dải gỗ nâu sẫm
  // phẳng RGB ~(92,50,31) tại x 52..172, y 68..72 → tâm bảng tại (112, 70).
  var GATE_SIGN = { cxOff: 112, cy: 70 };
  var TITLES = {
    u_nhan: 'Đại tiểu thư Hứa gia', di_ninh: 'Nhị tiểu thư Hứa gia',
    chinh_ngon: 'Gia chủ Hứa gia', anh_phung: 'Chủ mẫu Hứa gia',
    luc_tranh: 'Thiếu gia Lục gia', truong_lao: 'Trưởng lão trắc linh',
    dan_a: 'Dân thôn', dan_b: 'Dân thôn', dan_c: 'Dân thôn'
  };


  function startGame(saved) {
    state = saved;
    resizeCanvas();
    applyQuestMin();
    updateToastTab();
    px = state.x * TILE; py = state.y * TILE; facing = state.dir || 'up';
    dir8 = DIR8_ROW4[facing] || 0; stepPhase = 0; stepTimer = 0; resetJoy();
    npcsLive = L.NPCS.map(function (n) { return { id: n.id, name: n.name, look: n.look, x: n.x, y: n.y, dir: n.dir }; });
    show('screen-game');
    $('hud-name').textContent = state.name;
    var pt = $('portrait');
    if (pt) {
      var pLook = saved.gender === 'nu' ? 'player_nu' : 'player_nam';
      pt.style.backgroundImage = 'url(assets/chars/' + pLook + '.png)';
      // Ô down/đứng yên phải lấp đúng khung chân dung 40x50 ở cả hai định dạng sheet.
      if (CHAR8[pLook]) { pt.style.backgroundSize = '200px 400px'; pt.style.backgroundPosition = '0 0'; }
      else { pt.style.backgroundSize = '80px 200px'; pt.style.backgroundPosition = '0 0'; }
    }
    var dc0 = desiredCam();
    camX = dc0.x; camY = dc0.y;
    clickPath = null; clickTarget = null; medLatch = false;
    startedAt = Date.now();
    refreshHUD();
    toast('Hứa Gia Trấn — ngày trắc linh căn. Hãy tới bia đá ở sân nhà họ Hứa.', 4200);
    requestAnimationFrame(loop);
  }
  function saveNow() {
    if (!state || !currentUser) return;
    state.x = Math.round(px / TILE); state.y = Math.round(py / TILE); state.dir = facing;
    L.saveGame(localStorage, currentUser, state);
  }
  window.addEventListener('beforeunload', saveNow);

  /* ---------- Vẽ sprite ---------- */
  var cv = $('game-canvas'), ctx = cv.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  function resizeCanvas() {
    if (!cv) return;
    var w = cv.clientWidth || window.innerWidth || viewW;
    var h = cv.clientHeight || window.innerHeight || viewH;
    var v = computeView(w, h);
    viewW = v.w; viewH = v.h;
    viewDpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(viewW * viewDpr);
    cv.height = Math.round(viewH * viewDpr);
  }
  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('orientationchange', resizeCanvas);
  function drawSprite(spr, dx, dy, scale) {
    var pal = spr.pal;
    for (var y = 0; y < spr.h; y++) {
      var row = spr.rows[y];
      for (var x = 0; x < spr.w; x++) {
        var ch = row.charAt(x);
        if (ch === '.') continue;
        ctx.fillStyle = pal[ch] || '#f0f';
        ctx.fillRect(dx + x * scale, dy + y * scale, scale, scale);
      }
    }
  }
  function hash2(x, y) { var n = (x * 374761393 + y * 668265263) | 0; n = (n ^ (n >> 13)) | 0; return ((n * 1274126177) | 0) >>> 0; }

  function drawTile(tx, ty, sx, sy, t) {
    var h = hash2(tx, ty) % 100;
    var hb = hash2(tx + 101, ty + 57) % 100;
    var hc = hash2(tx + 211, ty + 137) % 100;
    var i, j, k, m, q;
    if (t === '.' || t === ',') {
      // Cỏ: nền hai tông xen kẽ, có mảng sáng/tối lớn, cụm lá hai tông.
      ctx.fillStyle = (tx + ty) % 2 ? '#69a354' : '#639c4f';
      if (hb < 16) ctx.fillStyle = '#74ac5c';
      else if (hb > 86) ctx.fillStyle = '#5b9046';
      ctx.fillRect(sx, sy, TILE, TILE);
      for (i = 0; i < 3; i++) {
        ctx.fillStyle = i === 1 ? '#86bc6c' : '#4f7f3e';
        ctx.fillRect(sx + ((h + i * 13) % 24) + 2, sy + ((hb + i * 7) % 20) + 4, 2, i < 2 ? 5 : 4);
      }
      if (t === ',') {
        var fcols = ['#f0ead8', '#e5a8c0', '#f3d98a'];
        var fp = [[(h % 18) + 4, (hb % 14) + 6], [(hc % 16) + 8, (h % 12) + 14], [(hb % 20) + 2, (hc % 18) + 4]];
        for (j = 0; j < 3; j++) { ctx.fillStyle = fcols[(h + j) % 3]; ctx.fillRect(sx + fp[j][0], sy + fp[j][1], 3, 3); }
      }
    } else if (t === 'D') {
      // Đường đất: nền ấm có đốm sỏi; mép mềm — cỏ lấn vào phía giáp ô cỏ,
      // vệt đất sẫm phía giáp sân đá (xét theo ô kề thật).
      ctx.fillStyle = (tx + ty) % 2 ? '#b99a68' : '#b08f5e';
      if (hb < 20) ctx.fillStyle = '#c3a573';
      ctx.fillRect(sx, sy, TILE, TILE);
      ctx.fillStyle = '#9a7c4e'; ctx.fillRect(sx + (h % 22) + 3, sy + (hb % 22) + 4, 4, 3);
      ctx.fillStyle = '#cbb083'; ctx.fillRect(sx + (hc % 20) + 6, sy + (h % 18) + 10, 3, 2);
      var nbd = [[0, -1], [0, 1], [-1, 0], [1, 0]];
      for (k = 0; k < 4; k++) {
        var ntd = L.tileAt(tx + nbd[k][0], ty + nbd[k][1]);
        var isGrass = ntd === '.' || ntd === ',';
        var isStone = ntd === 'S' || ntd === 'P';
        if (!isGrass && !isStone) continue;
        ctx.fillStyle = isGrass ? '#69a354' : '#8a6c42';
        for (m = 0; m < 5; m++) {
          var offd = (hc + m * 6) % 26 + 2;
          if (nbd[k][1] === -1) ctx.fillRect(sx + offd, sy + 1, 3, 2);
          else if (nbd[k][1] === 1) ctx.fillRect(sx + offd, sy + 29, 3, 2);
          else if (nbd[k][0] === -1) ctx.fillRect(sx + 1, sy + offd, 2, 3);
          else ctx.fillRect(sx + 29, sy + offd, 2, 3);
        }
      }
    } else if (t === 'S' || t === 'P') {
      // Sân đá: phiến đá có vát sáng trên/trái và tối dưới/phải.
      ctx.fillStyle = (tx + ty) % 2 ? '#9aa0a3' : '#92989b';
      ctx.fillRect(sx, sy, TILE, TILE);
      ctx.fillStyle = '#b0b6ba'; ctx.fillRect(sx, sy, TILE, 2); ctx.fillRect(sx, sy, 2, TILE);
      ctx.fillStyle = '#7c8287'; ctx.fillRect(sx, sy + TILE - 2, TILE, 2); ctx.fillRect(sx + TILE - 2, sy, 2, TILE);
      if (t === 'P') {
        // Ô hoa văn giữa sân trắc linh: vòng tròn khắc bao quanh thoi đá.
        ctx.strokeStyle = '#868d91'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(sx + 16, sy + 16, 10, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#aeb4b8';
        ctx.beginPath(); ctx.moveTo(sx + 16, sy + 10); ctx.lineTo(sx + 22, sy + 16); ctx.lineTo(sx + 16, sy + 22); ctx.lineTo(sx + 10, sy + 16); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#7c8287'; ctx.fillRect(sx + 14, sy + 14, 4, 4);
      } else {
        if (h % 5 === 0) { ctx.fillStyle = '#6f757a'; ctx.fillRect(sx + (h % 10) + 8, sy + 6, 2, 8); ctx.fillRect(sx + (h % 10) + 10, sy + 12, 2, 5); }
        if (hb % 6 === 0) { ctx.fillStyle = '#6f9a58'; ctx.fillRect(sx + (hc % 20) + 4, sy + (h % 20) + 4, 4, 3); }
      }
    } else if (t === 'W') {
      ctx.fillStyle = h % 3 === 0 ? '#356188' : '#3f6f9e';
      ctx.fillRect(sx, sy, TILE, TILE);
      ctx.fillStyle = '#6fa3cc';
      var off = Math.floor(tNow / 600 + tx) % 2;
      ctx.fillRect(sx + 4 + ((h + off * 7) % 14), sy + 7 + (h % 14), 9, 2);
      ctx.fillRect(sx + 6 + ((hc + off * 5) % 12), sy + 18 + (hb % 8), 7, 2);
      if (hb % 9 === 0) { ctx.fillStyle = '#cfe6f5'; ctx.fillRect(sx + (hc % 22) + 4, sy + (h % 20) + 6, 3, 2); }
    } else if (t === 'w') {
      // Bờ nước: cát có đốm; phía giáp nước có vệt ướt và vệt bọt.
      ctx.fillStyle = '#cbb083'; ctx.fillRect(sx, sy, TILE, TILE);
      ctx.fillStyle = '#b99a68'; ctx.fillRect(sx + (h % 20) + 4, sy + (hb % 18) + 6, 3, 2);
      var nbw = [[0, -1], [0, 1], [-1, 0], [1, 0]];
      for (q = 0; q < 4; q++) {
        if (L.tileAt(tx + nbw[q][0], ty + nbw[q][1]) !== 'W') continue;
        ctx.fillStyle = '#a8895c';
        if (nbw[q][1] === -1) ctx.fillRect(sx, sy, TILE, 5);
        else if (nbw[q][1] === 1) ctx.fillRect(sx, sy + TILE - 5, TILE, 5);
        else if (nbw[q][0] === -1) ctx.fillRect(sx, sy, 5, TILE);
        else ctx.fillRect(sx + TILE - 5, sy, 5, TILE);
        if (hb % 2 === 0) {
          ctx.fillStyle = '#e8dcc0';
          if (nbw[q][1] === -1) ctx.fillRect(sx, sy + 5, TILE, 2);
          else if (nbw[q][1] === 1) ctx.fillRect(sx, sy + TILE - 7, TILE, 2);
          else if (nbw[q][0] === -1) ctx.fillRect(sx + 5, sy, 2, TILE);
          else ctx.fillRect(sx + TILE - 7, sy, 2, TILE);
        }
      }
    } else if (t === 'X') {
      // Tường bao trấn: gạch đá có đường mạch ngang/dọc, nóc sáng, chân tối.
      ctx.fillStyle = '#77736b'; ctx.fillRect(sx, sy, TILE, TILE);
      ctx.fillStyle = '#8a877f'; ctx.fillRect(sx, sy, TILE, 6);
      ctx.fillStyle = '#9d9a92'; ctx.fillRect(sx, sy, TILE, 2);
      ctx.fillStyle = '#57544e'; ctx.fillRect(sx, sy + TILE - 5, TILE, 5);
      ctx.fillStyle = '#5d594f';
      ctx.fillRect(sx, sy + 13, TILE, 2); ctx.fillRect(sx, sy + 21, TILE, 2);
      ctx.fillRect(sx + (h % 14) + 2, sy + 6, 2, 7);
      ctx.fillRect(sx + (hb % 12) + 12, sy + 15, 2, 6);
      ctx.fillRect(sx + (hc % 14) + 4, sy + 23, 2, 6);
      if (hc % 8 === 0) { ctx.fillStyle = '#8f8c84'; ctx.fillRect(sx + (h % 20) + 4, sy + 16, 5, 3); }
    } else {
      ctx.fillStyle = '#69a354'; ctx.fillRect(sx, sy, TILE, TILE);
    }
  }

  var PROP_SCALE = { tree: 2, pine: 2, stele: 2, lantern: 2, well: 2, dummy: 2, house: 2, house_big: 2, house_b: 2, house_c: 2, inn: 2 };
  function propSprite(p) {
    if (p.type === 'dummy' && state && state.flags.dummyBroken) return S.PROP_SPRITES.dummy_broken;
    return S.PROP_SPRITES[p.type];
  }
  // Biển tên nơi (vật trang trí của engine, đặt cạnh điểm xuất phát).
  var SIGNS = [{ x: 27, y: 40, text: 'Hứa Gia Trấn' }, { x: 49, y: 21, text: 'Giếng đầu trấn' }];

  function desiredCam() {
    var v = computeView(viewW, viewH);
    return clampCam(px + 16 - v.w / 2, py + 16 - v.h / 2, v.w, v.h, L.MAP_W * TILE, L.MAP_H * TILE);
  }
  function contactShadow(cx, cy, w) {
    ctx.fillStyle = 'rgba(24,34,18,0.18)';
    ctx.beginPath(); ctx.ellipse(cx, cy, w * 0.35, Math.max(3, w * 0.07), 0, 0, Math.PI * 2); ctx.fill();
  }
  function rrPath(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  // Lớp nhãn riêng: tên 11px + danh hiệu 9px, chống chồng bằng cách dịch lên.
  function drawLabels(labels) {
    var placed = [];
    var sorted = labels.slice().sort(function (a, b) { return (a.wantY - b.wantY) || (a.cx - b.cx); });
    sorted.forEach(function (lb) {
      ctx.font = '11px sans-serif';
      var wName = ctx.measureText(lb.name).width;
      ctx.font = '9px sans-serif';
      var wTitle = lb.title ? ctx.measureText(lb.title).width : 0;
      // Danh hiệu trùng hệt tên (Trưởng lão trắc linh) thì chỉ vẽ 1 dòng.
      if (lb.title && lb.title === lb.name) lb.title = '';
      lb.w = Math.max(wName, wTitle) + 6; lb.h = lb.title ? 24 : 13;
      lb.y = lb.wantY + (24 - lb.h);
      var tries = 0;
      function hits() {
        for (var i = 0; i < placed.length; i++) {
          var p = placed[i];
          var hov = Math.abs(lb.cx - p.cx) * 2 < (lb.w + p.w) + 4;
          var vov = lb.y < p.y + p.h + 2 && p.y < lb.y + lb.h + 2;
          if (hov && vov) return true;
        }
        return false;
      }
      while (tries < 5 && hits()) { lb.y -= 14; tries++; }
      placed.push(lb);
    });
    placed.forEach(function (lb) {
      var nameY = lb.y + 11;
      ctx.textAlign = 'center';
      ctx.font = '11px sans-serif';
      ctx.fillStyle = 'rgba(20,16,8,0.85)'; ctx.fillText(lb.name, lb.cx + 1, nameY + 1);
      ctx.fillStyle = lb.color; ctx.fillText(lb.name, lb.cx, nameY);
      if (lb.title) {
        ctx.font = '9px sans-serif';
        ctx.fillStyle = 'rgba(20,16,8,0.85)'; ctx.fillText(lb.title, lb.cx + 1, nameY + 13);
        ctx.fillStyle = '#bfe3c8'; ctx.fillText(lb.title, lb.cx, nameY + 12);
      }
    });
    return placed;
  }
  // Bong bóng thoại trên đầu người nói (NPC hoặc người chơi khi mode say/write).
  function drawBubble(placed) {
    if (!dlg) return;
    if (dlg.who === 'narrate' || dlg.who === 'choice') return;
    var key = dlg.who === 'hero' ? '__player' : dlg.who;
    var lb = null;
    placed.forEach(function (p) { if (p.key === key) lb = p; });
    if (!lb) return;
    var text = dlg.text || '';
    var disp = text.length > 22 ? text.slice(0, 22) + '…' : text;
    ctx.font = '10px sans-serif';
    var bw = ctx.measureText(disp).width + 14, bh = 20;
    var bx = lb.cx - bw / 2, by = lb.y - bh - 7;
    rrPath(bx, by, bw, bh, 6);
    ctx.fillStyle = 'rgba(255,255,255,0.92)'; ctx.fill();
    ctx.beginPath();
    ctx.moveTo(lb.cx - 5, by + bh - 1); ctx.lineTo(lb.cx + 5, by + bh - 1); ctx.lineTo(lb.cx, by + bh + 6);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#2c2620'; ctx.textAlign = 'center';
    ctx.fillText(disp, lb.cx, by + 14);
  }
  var mmCtx = null;
  var TILE_COLORS = { '.': '#5b9046', ',': '#7fae56', 'D': '#b08f5e', 'S': '#9aa0a3', 'P': '#aeb4b8', 'W': '#3f6f9e', 'w': '#cbb083', 'X': '#57544e', 'G': '#b08f5e' };
  function drawMinimap() {
    var mm = $('minimap');
    if (!mm || !state) return;
    if (!mmCtx) mmCtx = mm.getContext('2d');
    var ms = mm.width / L.MAP_W;
    var tx, ty;
    for (ty = 0; ty < L.MAP_H; ty++) for (tx = 0; tx < L.MAP_W; tx++) {
      mmCtx.fillStyle = TILE_COLORS[L.tileAt(tx, ty)] || '#5b9046';
      mmCtx.fillRect(tx * ms, ty * ms, ms, ms);
    }
    mmCtx.fillStyle = 'rgba(30,24,16,0.85)';
    L.PROPS.forEach(function (p) { mmCtx.fillRect(Math.round((p.x + p.w / 2) * ms) - 1, Math.round((p.y + p.h / 2) * ms) - 1, 2, 2); });
    mmCtx.fillStyle = '#ffd94e';
    npcsLive.forEach(function (n) { mmCtx.fillRect(n.x * ms + ms / 4, n.y * ms + ms / 4, 2, 2); });
    var pcx = Math.floor((px + 16) / TILE) * ms + ms / 2, pcy = Math.floor((py + 16) / TILE) * ms + ms / 2;
    mmCtx.fillStyle = '#ffffff';
    mmCtx.beginPath(); mmCtx.arc(pcx, pcy, 0.6 * ms, 0, Math.PI * 2); mmCtx.fill();
    mmCtx.strokeStyle = Math.floor(tNow / 400) % 2 ? '#e04a3a' : '#7a1f16';
    mmCtx.lineWidth = 0.35 * ms;
    mmCtx.beginPath(); mmCtx.arc(pcx, pcy, 0.85 * ms, 0, Math.PI * 2); mmCtx.stroke();
  }

  function render() {
    ctx.setTransform(viewDpr, 0, 0, viewDpr, 0, 0);
    var dc = desiredCam();
    camX += (dc.x - camX) * 0.18; camY += (dc.y - camY) * 0.18;
    if (Math.abs(dc.x - camX) < 0.5) camX = dc.x;
    if (Math.abs(dc.y - camY) < 0.5) camY = dc.y;
    var shX = 0, shY = 0;
    if (shakeT > 0) { var m = Math.min(10, shakeT * 9); shX = (Math.random() - 0.5) * m; shY = (Math.random() - 0.5) * m; }
    ctx.fillStyle = '#2c3527'; ctx.fillRect(0, 0, viewW, viewH);
    ctx.save(); ctx.translate(-camX + shX, -camY + shY);
    // Nền: ảnh toàn bản đồ nếu đã tải; chưa xong thì vẽ lưới ô như cũ (dự phòng).
    if (imgReady(ASSETS.bg)) {
      ctx.drawImage(ASSETS.bg, 0, 0);
    } else {
      var x0 = Math.max(0, Math.floor(camX / TILE)), x1 = Math.min(L.MAP_W - 1, x0 + viewW / TILE + 1);
      var y0 = Math.max(0, Math.floor(camY / TILE)), y1 = Math.min(L.MAP_H - 1, y0 + viewH / TILE + 1);
      for (var ty = y0; ty <= y1; ty++) for (var tx = x0; tx <= x1; tx++) drawTile(tx, ty, tx * TILE, ty * TILE, L.tileAt(tx, ty));
    }
    // Vòng đánh dấu đích bấm chuột (lớp đất: sau nền, trước vật thể).
    if (clickTarget) {
      var pulse = 0.55 + 0.35 * Math.sin(tNow / 180);
      ctx.strokeStyle = 'rgba(255,217,78,' + pulse + ')'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(clickTarget.x * TILE + 16, clickTarget.y * TILE + 26, 12, 5, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = 'rgba(255,217,78,' + (pulse * 0.8) + ')';
      ctx.beginPath(); ctx.ellipse(clickTarget.x * TILE + 16, clickTarget.y * TILE + 26, 4.5, 2, 0, 0, Math.PI * 2); ctx.fill();
    }
    // hào quang bia đá sau khi trắc linh (vô sắc — vòng trong suốt phát sáng trắng)
    if (state.flags.tested) {
      var bia = null;
      for (var bi = 0; bi < L.PROPS.length; bi++) if (L.PROPS[bi].id === 'bia_trac_linh') { bia = L.PROPS[bi]; break; }
      if (bia) {
        ctx.strokeStyle = 'rgba(240,246,255,' + (0.35 + 0.2 * Math.sin(tNow / 300)) + ')';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc((bia.x + bia.w / 2) * TILE, (bia.y + bia.h - bia.fy) * TILE, 26 + 4 * Math.sin(tNow / 300), 0, Math.PI * 2); ctx.stroke();
      }
    }
    // điểm thổ nạp cạnh giếng: vòng linh khí
    if (state.unlocked.indexOf('voice') >= 0) {
      ctx.strokeStyle = 'rgba(150,220,255,0.5)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(L.WELL_MEDITATE.x * TILE + 16, L.WELL_MEDITATE.y * TILE + 16, 20 + 5 * Math.sin(tNow / 400), 0, Math.PI * 2); ctx.stroke();
    }
    // danh sách vẽ theo chiều sâu (vật thể thật + trang trí thị giác + NPC + biển + người chơi)
    var draws = [];
    L.PROPS.forEach(function (p) { draws.push({ depth: (p.y + p.h) * TILE, kind: 'prop', p: p }); });
    VISUAL_DECOR.forEach(function (d2) { draws.push({ depth: d2.depth, kind: 'decor', dc: d2 }); });
    npcsLive.forEach(function (n) { draws.push({ depth: (n.y + 1) * TILE, kind: 'npc', n: n }); });
    SIGNS.forEach(function (s) { draws.push({ depth: (s.y + 1) * TILE, kind: 'sign', s: s }); });
    draws.push({ depth: py + TILE, kind: 'player' });
    draws.sort(function (a, b) { return a.depth - b.depth; });
    var labels = [];
    draws.forEach(function (d) {
      if (d.kind === 'prop') {
        var p = d.p;
        var imgType = (p.type === 'dummy' && state && state.flags.dummyBroken) ? 'dummy_broken' : p.type;
        var pim = ASSETS.props[imgType];
        if (imgReady(pim)) {
          var iw = pim.naturalWidth, ih = pim.naturalHeight;
          var idx = (p.x + p.w / 2) * TILE - iw / 2, idy = (p.y + p.h) * TILE - ih;
          if (BIG_SHADOW[p.type]) contactShadow((p.x + p.w / 2) * TILE, (p.y + p.h) * TILE - 3, iw);
          ctx.drawImage(pim, idx, idy);
        } else {
          var spr = propSprite(p), sc = PROP_SCALE[p.type] || 2;
          var dw = spr.w * sc, dx = (p.x + p.w / 2) * TILE - dw / 2, dy = (p.y + p.h) * TILE - spr.h * sc;
          drawSprite(spr, dx, dy, sc);
        }
        if (p.id === 'bia_trac_linh' && !state.flags.tested) drawMarker(p.x * TILE + TILE, p.y * TILE - 14);
      } else if (d.kind === 'decor') {
        var dcm = ASSETS.props[d.dc.type];
        if (imgReady(dcm)) {
          var dw2 = dcm.naturalWidth, dh2 = dcm.naturalHeight;
          var ddx = d.dc.cx - dw2 / 2, ddy = d.dc.bottom - dh2;
          if (BIG_SHADOW[d.dc.type]) contactShadow(d.dc.cx, d.dc.bottom - 3, dw2);
          ctx.drawImage(dcm, ddx, ddy);
          if (d.dc.type === 'gate') {
            // Chữ trên bảng gỗ giữa cổng — vị trí bảng đã đo trong sprite (GATE_SIGN).
            ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center';
            var gtx = ddx + GATE_SIGN.cxOff, gty = ddy + GATE_SIGN.cy;
            ctx.fillStyle = 'rgba(30,18,8,0.9)'; ctx.fillText('HỨA GIA TRẤN', gtx + 1, gty + 6);
            ctx.fillStyle = '#f7ead0'; ctx.fillText('HỨA GIA TRẤN', gtx, gty + 5);
          }
        }
      } else if (d.kind === 'npc') {
        var n = d.n;
        ctx.fillStyle = 'rgba(24,34,18,0.28)';
        ctx.beginPath(); ctx.ellipse(n.x * TILE + 16, (n.y + 1) * TILE - 2, 13, 4.5, 0, 0, Math.PI * 2); ctx.fill();
        var nim = ASSETS.chars[n.look], nTop;
        if (imgReady(nim)) {
          // NPC đứng yên: khung 0; sheet mới dùng hàng chẵn theo hướng 4 chính của NPC.
          var nsrc = charSrc(n.look, nim, n.dir, DIR8_ROW4[n.dir] || 0, 0, 0);
          ctx.drawImage(nim, nsrc.x, nsrc.y, nsrc.w, nsrc.h, n.x * TILE + 16 - 32, (n.y + 1) * TILE - 80, 64, 80);
          nTop = (n.y + 1) * TILE - 80;
        } else {
          drawSprite(S.charSprite(n.look, n.dir, 0), n.x * TILE, n.y * TILE - 8, 2);
          nTop = n.y * TILE - 8;
        }
        labels.push({ key: n.id, name: n.name, title: TITLES[n.id] || '', cx: n.x * TILE + 16, wantY: nTop - 6 - 24, color: '#ffffff' });
      } else if (d.kind === 'sign') {
        // Biển tên nơi: hai cột gỗ, mái ngói nhỏ che trên, bảng gỗ có viền.
        var gx = d.s.x * TILE, gy = d.s.y * TILE;
        ctx.fillStyle = '#4a3520'; ctx.fillRect(gx + 6, gy + 10, 4, 20); ctx.fillRect(gx + 22, gy + 10, 4, 20);
        ctx.fillStyle = '#54606e';
        ctx.beginPath(); ctx.moveTo(gx - 4, gy); ctx.lineTo(gx + 36, gy); ctx.lineTo(gx + 30, gy - 7); ctx.lineTo(gx + 2, gy - 7); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#424c58'; ctx.fillRect(gx - 4, gy - 2, 40, 2);
        ctx.fillStyle = '#8a6a42'; ctx.fillRect(gx, gy, 32, 13);
        ctx.strokeStyle = '#5d422a'; ctx.strokeRect(gx + 0.5, gy + 0.5, 31, 12);
        ctx.fillStyle = '#f7ead0'; ctx.font = 'bold 8px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(d.s.text, gx + 16, gy + 9.5);
      } else if (d.kind === 'player') {
        var look = state.gender === 'nu' ? 'player_nu' : 'player_nam';
        ctx.fillStyle = 'rgba(24,34,18,0.28)';
        ctx.beginPath(); ctx.ellipse(px + 16, py + TILE - 2, 13, 4.5, 0, 0, Math.PI * 2); ctx.fill();
        var plim = ASSETS.chars[look], pTop;
        if (imgReady(plim)) {
          // Sheet mới: hàng dir8, cột = pha bước 1..4 (đứng yên cột 0).
          // Sheet cũ: hàng DIR_ROW theo facing, cột = pha%2 khi đi, 0 khi đứng.
          var psrc = charSrc(look, plim, facing, dir8, moving ? stepPhase : 0, moving ? stepPhase % 2 : 0);
          ctx.drawImage(plim, psrc.x, psrc.y, psrc.w, psrc.h, px + 16 - 32, py + 32 - 80, 64, 80);
          pTop = py + 32 - 80;
        } else {
          // Ảnh chưa tải: sprite lưới theo hướng chính gần nhất của dir8, khung 1 khi đi / 0 khi đứng.
          drawSprite(S.charSprite(look, dir8NearDir(dir8), moving ? 1 : 0), px, py - 8, 2);
          pTop = py - 8;
        }
        labels.push({ key: '__player', name: state.name, title: L.realmName(state.realm, state.stage), cx: px + 16, wantY: pTop - 6 - 24, color: '#ffe9a8' });
      }
    });
    // Lớp nhãn riêng (sau mọi vật thể) + bong bóng thoại trên đầu người nói.
    var placedLabels = drawLabels(labels);
    drawBubble(placedLabels);
    // chỉ đường nhiệm vụ
    var q = L.questById(state.quest);
    if (q && q.hint && !dlg) {
      var hx = q.hint.x * TILE + 16, hy = q.hint.y * TILE - 18 + Math.sin(tNow / 250) * 4;
      ctx.fillStyle = '#ffd94e';
      ctx.beginPath(); ctx.moveTo(hx, hy + 12); ctx.lineTo(hx - 8, hy); ctx.lineTo(hx + 8, hy); ctx.closePath(); ctx.fill();
    }
    // vòng sóng âm Ngôn Linh
    rings = rings.filter(function (r) { return r.a > 0; });
    rings.forEach(function (r) {
      ctx.strokeStyle = 'rgba(255,240,190,' + r.a + ')'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2); ctx.stroke();
    });
    // chữ bay (sát thương, thông báo nhỏ)
    floats = floats.filter(function (f) { return f.a > 0; });
    floats.forEach(function (f) {
      ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(20,16,8,' + f.a + ')'; ctx.fillText(f.text, f.x + 1, f.y + 1);
      ctx.fillStyle = 'rgba(' + f.color + ',' + f.a + ')'; ctx.fillText(f.text, f.x, f.y);
    });
    ctx.restore();
    if (meditating) {
      ctx.fillStyle = 'rgba(160,220,255,0.10)'; ctx.fillRect(0, 0, viewW, viewH);
    }
    if (flashA > 0) { ctx.fillStyle = 'rgba(255,250,230,' + flashA + ')'; ctx.fillRect(0, 0, viewW, viewH); }
    // Cần điều khiển cảm ứng: vẽ ở hệ tọa độ màn hình (transform DPR còn hiệu lực sau restore),
    // chỉ hiện khi đang chạm giữ ở chế độ cần.
    if (joy.state === 'stick') {
      var jdx = joy.cx - joy.sx, jdy = joy.cy - joy.sy;
      var jdist = Math.sqrt(jdx * jdx + jdy * jdy);
      var jclamp = Math.min(jdist, JOY_R);
      var jux = jdist > 0 ? jdx / jdist : 0, juy = jdist > 0 ? jdy / jdist : 0;
      ctx.beginPath(); ctx.arc(joy.sx, joy.sy, JOY_R, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(18,24,18,0.38)'; ctx.fill();
      ctx.strokeStyle = 'rgba(255,246,220,0.85)'; ctx.lineWidth = 2; ctx.stroke();
      ctx.beginPath(); ctx.arc(joy.sx + jux * jclamp, joy.sy + juy * jclamp, 26, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,246,220,0.55)'; ctx.fill();
      ctx.strokeStyle = 'rgba(40,32,20,0.6)'; ctx.lineWidth = 1.5; ctx.stroke();
    }
    drawMinimap();
  }

  var flashA = 0;
  function drawMarker(x, y) {
    var bob = Math.sin(tNow / 250) * 4;
    ctx.fillStyle = '#ffd94e';
    ctx.beginPath(); ctx.moveTo(x, y + 12 + bob); ctx.lineTo(x - 8, y + bob); ctx.lineTo(x + 8, y + bob); ctx.closePath(); ctx.fill();
  }
  function drawName(name, cx, y, color) {
    ctx.font = '11px sans-serif'; ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(20,16,8,0.85)'; ctx.fillText(name, cx + 1, y + 1);
    ctx.fillStyle = color; ctx.fillText(name, cx, y);
  }
  function addFloat(x, y, text, color) { floats.push({ x: x, y: y, text: text, color: color || '255,235,170', a: 1 }); }

  /* ---------- Thoại ---------- */
  function say(lines, cb) { clickPath = null; clickTarget = null; resetJoy(); dlgQueue = lines.slice(); dlgCb = cb || null; nextLine(); }
  function nextLine() {
    if (!dlgQueue.length) { dlg = null; $('dialogue').classList.add('hidden'); if (dlgCb) { var cb = dlgCb; dlgCb = null; cb(); } return; }
    dlg = dlgQueue.shift();
    $('dialogue').classList.remove('hidden');
    $('dlg-choices').innerHTML = '';
    var nameEl = $('dlg-name'), textEl = $('dlg-text'), box = $('dialogue');
    box.classList.toggle('dlg-write', dlg.mode === 'write');
    box.classList.toggle('dlg-say', dlg.mode === 'say');
    if (dlg.who === 'narrate') { nameEl.textContent = ''; textEl.textContent = dlg.text; }
    else if (dlg.who === 'hero') { nameEl.textContent = state.name + (dlg.mode === 'write' ? ' (viết)' : ''); textEl.textContent = dlg.text; }
    else if (dlg.who === 'choice') { nameEl.textContent = state.name; textEl.textContent = dlg.text; renderChoices(dlg); }
    else {
      var n = npcsLive.filter(function (x) { return x.id === dlg.who; })[0];
      nameEl.textContent = n ? n.name : dlg.who; textEl.textContent = dlg.text;
    }
  }
  function renderChoices(line) {
    var wrap = $('dlg-choices');
    line.options.forEach(function (opt, idx) {
      var b = document.createElement('button');
      b.textContent = (idx + 1) + '. ' + opt.label;
      b.addEventListener('click', function () { chooseOption(opt.action); });
      wrap.appendChild(b);
    });
  }
  function chooseOption(action) {
    if (action === 'write') {
      say(ST.SCENE_WRITE_BRANCH, function () { refreshHUD(); });
    } else if (action === 'voice') {
      doVoiceMoment();
    }
  }
  function doVoiceMoment() {
    shakeT = 1.6; flashA = 0.55; rumble();
    rings.push({ x: px + 16, y: py + 16, r: 10, a: 0.9 });
    rings.push({ x: px + 16, y: py + 16, r: 2, a: 0.7 });
    say(ST.SCENE_VOICE, function () {
      state.flags.voiced = true;
      if (state.unlocked.indexOf('voice') < 0) state.unlocked.push('voice');
      state.silence = 20; // mười tám năm dồn nén đã xả trong một lời — tích lại từ đây
      state.quest = 'q_meditate';
      refreshHUD(); saveNow();
      toast('Đã mở khóa: Thổ nạp (phím T cạnh giếng) và Ngôn Linh "PHÁ" (phím 1).');
    });
  }

  /* ---------- Tương tác ---------- */
  // Ô nhân vật đang đứng, tính theo HỘP CHÂN (hộp va chạm của tryMove:
  // x px+6..px+26, y py+22..py+31) chứ KHÔNG theo tâm sprite (px+16, py+16).
  // Khi đi từ phía nam tới áp sát vật/NPC, hộp chân vẫn còn ở ô phía nam nhưng
  // tâm sprite đã lọt sang ô của vật (py+16 < py+22) — suy ô từ tâm sẽ lệch 1
  // hàng lên trên, khiến frontTile trượt khỏi vật/NPC ngay trước mặt và nhánh
  // dự phòng (khoảng cách tới ô người chơi === 1) cũng trượt theo (lỗi E chết
  // khi áp sát bia đá/trưởng lão từ phía nam). Điểm mẫu y lấy giữa hộp chân.
  function playerTile() {
    return { x: Math.floor((px + 16) / TILE), y: Math.floor((py + 27) / TILE) };
  }
  function frontTile() {
    var pt = playerTile();
    if (facing === 'up') return { x: pt.x, y: pt.y - 1 };
    if (facing === 'down') return { x: pt.x, y: pt.y + 1 };
    if (facing === 'left') return { x: pt.x - 1, y: pt.y };
    return { x: pt.x + 1, y: pt.y };
  }
  function interact() {
    if (dlg) { if (dlg.who !== 'choice') nextLine(); return; }
    var ft = frontTile();
    var pt = playerTile();
    var npc = npcsLive.filter(function (n) { return n.x === ft.x && n.y === ft.y; })[0];
    if (!npc) { // cho phép tương tác NPC kề bên khi quay chưa khớp
      npc = npcsLive.filter(function (n) { return Math.abs(n.x - ft.x) + Math.abs(n.y - ft.y) <= 1 && Math.abs(n.x - pt.x) + Math.abs(n.y - pt.y) === 1; })[0];
    }
    if (npc) return talkTo(npc);
    var p = L.propAt(ft.x, ft.y) || L.propAt(pt.x, pt.y + 1);
    if (p && p.id === 'bia_trac_linh') return touchStele();
    if (p && p.id === 'coc_go') {
      if (state.flags.dummyBroken) return say([{ who: 'narrate', text: 'Cọc gỗ đã gãy. Tiếng nói đầu tiên của ngươi làm nó nứt từ trong lõi.' }]);
      return say([{ who: 'narrate', text: 'Cọc gỗ luyện công. ' + (state.unlocked.indexOf('voice') >= 0 ? 'Đứng gần và nhấn phím 1 để dùng Ngôn Linh "PHÁ" (cần 30 Tĩnh Mặc).' : 'Gỗ chắc thế này, tay không không làm gì được.') }]);
    }
    if (p && p.id === 'gieng') return say([{ who: 'narrate', text: 'Giếng nước đầu trấn. Nước trong, hơi mát bốc lên — linh khí quanh đây đậm hơn hẳn nơi khác.' }]);
  }
  function talkTo(npc) {
    var pool = (state.flags.voiced ? ST.IDLE_AFTER : ST.IDLE_BEFORE)[npc.id];
    if (pool) say(pool.map(function (ln) { return { who: ln.who === 'hero' ? 'hero' : npc.id, mode: ln.mode, text: ln.text }; }));
  }
  function touchStele() {
    if (!state.flags.tested) {
      state.flags.tested = true;
      say(ST.SCENE_TEST, function () { refreshHUD(); saveNow(); });
    } else if (!state.flags.voiced && state.quest === 'q_voice') {
      say(ST.SCENE_VOICE_RETRY);
    } else if (!state.flags.voiced) {
      state.quest = 'q_voice';
      say(ST.SCENE_VOICE_RETRY);
    } else {
      say([{ who: 'narrate', text: 'Bia đá im lìm. Chín màu của nó không đo được ngươi — như trưởng lão nói, phải tới Kiểm Trắc Tháp.' }]);
    }
    if (state.quest === 'q_trac') { state.quest = 'q_voice'; }
    refreshHUD();
  }

  /* ---------- Hành động ---------- */
  function castPha() {
    if (dlg) return;
    var before = state.silence;
    var r = L.castWord(state, 'pha');
    if (!r.ok) { toast(r.reason); return; }
    beep(180, 0.35, 'square', 0.06);
    rings.push({ x: px + 16, y: py + 16, r: 8, a: 0.95 });
    addFloat(px + 16, py - 20, 'PHÁ!', '255,120,90');
    // cọc gỗ trong tầm 2 ô thì chịu đòn
    var cx = Math.floor((px + 16) / TILE), cy = Math.floor((py + 16) / TILE);
    var d = L.PROPS.filter(function (p) { return p.id === 'coc_go'; })[0];
    var dist = Math.abs(d.x - cx) + Math.abs(d.y - cy);
    if (!state.flags.dummyBroken && dist <= 3) {
      state._dummyHp = (state._dummyHp == null ? 40 : state._dummyHp) - r.power;
      addFloat(d.x * TILE + 16, d.y * TILE - 10, '-' + r.power, '255,90,70');
      if (state._dummyHp <= 0) {
        state.flags.dummyBroken = true; shakeT = 0.7;
        if (state.quest === 'q_dummy') state.quest = 'q_done';
        say(ST.SCENE_DUMMY_DONE, function () { refreshHUD(); saveNow(); });
      } else {
        toast('Cọc gỗ nứt ra! Còn chịu được khoảng ' + state._dummyHp + ' uy lực. Tĩnh Mặc đã dùng: ' + before + ' → ' + state.silence + '.');
      }
    }
    refreshHUD(); saveNow();
  }
  function castChan() {
    if (dlg) return;
    var r = L.castWord(state, 'chan');
    if (!r.ok) { toast(r.reason); return; }
    beep(120, 0.45, 'square', 0.06);
    rings.push({ x: px + 16, y: py + 16, r: 10, a: 0.95 });
    rings.push({ x: px + 16, y: py + 16, r: 3, a: 0.8 });
    addFloat(px + 16, py - 20, 'CHẤN!', '150,200,255');
    shakeT = Math.max(shakeT, 0.35); // rung nhẹ — chỉ hiệu ứng trình diễn
    refreshHUD(); saveNow();
  }
  function doBreakthrough() {
    if (dlg) return;
    var r = L.tryBreakthrough(state);
    if (!r.ok) { toast(r.reason); return; }
    beep(523, 0.4, 'sine', 0.07); beep(784, 0.6, 'sine', 0.06);
    rings.push({ x: px + 16, y: py + 16, r: 6, a: 0.9 });
    if (state.quest === 'q_break') state.quest = 'q_dummy';
    say(ST.SCENE_BREAKTHROUGH, function () { refreshHUD(); saveNow(); });
    refreshHUD();
  }

  /* ---------- HUD ---------- */
  function setSkillLock(id, locked, why) {
    var el = $(id); if (!el) return;
    el.classList.toggle('locked', locked);
    el.title = locked ? why : '';
  }
  function refreshHUD() {
    if (!state) return;
    $('hud-realm').textContent = L.realmName(state.realm, state.stage);
    $('hud-hp').textContent = Math.floor(state.hp) + ' / ' + state.hpMax;
    $('hud-hp-bar').style.width = Math.max(0, Math.min(100, state.hp / state.hpMax * 100)) + '%';
    var cap = L.REALMS[state.realm].tuviNext;
    $('hud-tuvi').textContent = cap ? Math.floor(state.tuvi) + ' / ' + cap : Math.floor(state.tuvi) + '';
    $('hud-tuvi-bar').style.width = cap ? Math.min(100, state.tuvi / cap * 100) + '%' : '100%';
    $('hud-silence').textContent = Math.floor(state.silence) + ' / ' + L.SILENCE_MAX;
    $('hud-silence-bar').style.width = state.silence + '%';
    var q = L.questById(state.quest);
    $('hud-quest-name').textContent = q ? q.name : '';
    $('hud-quest-desc').textContent = q ? q.desc : '';
    var qid = q ? q.id : state.quest;
    if (qid && qid !== lastQuestId) {
      var isUnseen = !seenQuestIds[qid];
      lastQuestId = qid;
      if (questMinimized && isUnseen) {
        var qtab = $('quest-tab'); if (qtab) qtab.classList.add('pulse');
      } else if (!questMinimized) {
        seenQuestIds[qid] = true;
      }
    }
    setSkillLock('sk-pha', state.unlocked.indexOf('voice') < 0, 'Mở khóa sau sự kiện mở miệng trước bia đá');
    setSkillLock('sk-chan', state.unlocked.indexOf('luyenkhi1') < 0, 'Mở khóa khi đạt Luyện Khí tầng 1');
    var medBtn = $('sk-med');
    if (medBtn) medBtn.classList.toggle('active', medLatch);
  }

  /* ---------- Vòng lặp ---------- */
  var tNow = 0, lastTs = 0;
  function loop(ts) {
    if (!state) return;
    requestAnimationFrame(loop);
    var dt = Math.min(0.05, (ts - lastTs) / 1000 || 0.016); lastTs = ts; tNow = ts;
    if (shakeT > 0) shakeT = Math.max(0, shakeT - dt);
    if (flashA > 0) flashA = Math.max(0, flashA - dt * 0.7);
    rings.forEach(function (r) { r.r += dt * 260; r.a -= dt * 0.8; });
    floats.forEach(function (f) { f.y -= dt * 26; f.a -= dt * 0.8; });
    meditating = false;
    if (!dlg) {
      // Giữ chạm quá ngưỡng thời gian (kể cả không kéo) cũng vào chế độ cần.
      if (joy.state === 'pending' && Date.now() - joy.t0 > L.JOY_STICK_MS) {
        joy.state = 'stick';
        clickPath = null; clickTarget = null; medLatch = false;
        var n0 = L.joyNormalize(joy.cx - joy.sx, joy.cy - joy.sy, JOY_R);
        joy.active = n0.active; joy.ux = n0.ux; joy.uy = n0.uy; joy.speed = n0.speed;
      }
      var sp = 132, dx = 0, dy = 0;
      var manual = false;
      if (keys['arrowleft'] || keys['a']) { dx = -sp; facing = 'left'; manual = true; }
      else if (keys['arrowright'] || keys['d']) { dx = sp; facing = 'right'; manual = true; }
      if (keys['arrowup'] || keys['w']) { dy = -sp; facing = 'up'; manual = true; }
      else if (keys['arrowdown'] || keys['s']) { dy = sp; facing = 'down'; manual = true; }
      if (manual) {
        clickPath = null; clickTarget = null; medLatch = false;
        resetJoy(); // phím di chuyển hủy trạng thái cần ngay
        dir8 = L.dir8FromVector(dx, dy, dir8);
      }
      // Cần cảm ứng: ghi đè đường bấm chuột (đường đã bị hủy ngay khi vào chế độ cần);
      // phím tay vẫn ưu tiên cao nhất. Cùng một đường chọn hướng dir8FromVector.
      if (!manual && joy.state === 'stick') {
        var jn = L.joyNormalize(joy.cx - joy.sx, joy.cy - joy.sy, JOY_R);
        joy.active = jn.active; joy.ux = jn.ux; joy.uy = jn.uy; joy.speed = jn.speed;
        if (jn.active) {
          dx = jn.ux * sp * jn.speed; dy = jn.uy * sp * jn.speed;
          dir8 = L.dir8FromVector(dx, dy, dir8);
          if (Math.abs(jn.ux) >= Math.abs(jn.uy)) facing = jn.ux > 0 ? 'right' : 'left';
          else facing = jn.uy > 0 ? 'down' : 'up';
        }
      }
      // Di chuyển bằng chuột: đi theo các ô của clickPath tới tâm ô kế tiếp.
      if (!manual && joy.state !== 'stick' && clickPath && clickPath.length) {
        var wp = clickPath[0];
        var mdx = (wp.x * TILE + 16) - (px + 16), mdy = (wp.y * TILE + 16) - (py + 16);
        if (Math.abs(mdx) < 3 && Math.abs(mdy) < 3) {
          clickPath.shift();
          if (!clickPath.length) { clickPath = null; clickTarget = null; }
        } else {
          // Hướng hiển thị tính từ vector thật tới điểm đường đi kế tiếp (có thể chéo).
          dir8 = L.dir8FromVector(mdx, mdy, dir8);
          if (Math.abs(mdx) >= Math.abs(mdy) && mdx !== 0) {
            dx = mdx > 0 ? sp : -sp; facing = mdx > 0 ? 'right' : 'left';
          } else if (mdy !== 0) {
            dy = mdy > 0 ? sp : -sp; facing = mdy > 0 ? 'down' : 'up';
          } else if (mdx !== 0) {
            dx = mdx > 0 ? sp : -sp; facing = mdx > 0 ? 'right' : 'left';
          }
        }
      }
      moving = !!(dx || dy);
      if (moving) {
        walkTimer += dt; if (walkTimer > 0.16) { walkFrame = 1 - walkFrame; walkTimer = 0; }
        // Pha bước cho sheet 8 hướng: chạy 1->2->3->4 lặp, mỗi khung ~0,11s.
        if (stepPhase === 0) { stepPhase = 1; stepTimer = 0; }
        else {
          stepTimer += dt;
          while (stepTimer >= 0.11) { stepTimer -= 0.11; stepPhase = stepPhase % 4 + 1; }
        }
        var prevPx = px, prevPy = py;
        tryMove(dx * dt, 0); tryMove(0, dy * dt);
        if (clickPath && px === prevPx && py === prevPy) { clickPath = null; clickTarget = null; } // bị chặn hẳn thì bỏ đường
        state.silence = L.silenceGain('walk', dt, state.silence);
      } else {
        walkFrame = 0; stepPhase = 0; stepTimer = 0;
        state.silence = L.silenceGain('idle', dt, state.silence);
      }
      // thổ nạp cạnh giếng (phím T giữ, hoặc chốt thổ nạp từ thanh kỹ năng)
      var cx = Math.floor((px + 16) / TILE), cy = Math.floor((py + 16) / TILE);
      var nearWell = Math.abs(cx - L.WELL_MEDITATE.x) + Math.abs(cy - L.WELL_MEDITATE.y) <= 2;
      if ((keys['t'] || medLatch) && nearWell && state.unlocked.indexOf('voice') >= 0) {
        meditating = true;
        var beforeTuvi = state.tuvi;
        L.meditateTick(state, dt);
        if (state.tuvi !== beforeTuvi && state.quest === 'q_meditate' && state.tuvi >= 100) {
          state.quest = 'q_break'; toast('Tu vi đã đầy! Nhấn phím B để đột phá Luyện Khí tầng 1.');
        }
        refreshHUD();
      }
    } else {
      // Mở thoại thì hủy đường đi bằng chuột và hủy cần cảm ứng.
      clickPath = null; clickTarget = null; resetJoy();
    }
    render();
    saveTimer += dt;
    if (saveTimer > 5) { saveTimer = 0; saveNow(); refreshHUD(); }
  }
  function tryMove(mx, my) {
    var nx = px + mx, ny = py + my;
    // hộp chân: rộng 20px, cao 10px ở đáy ô nhân vật
    var box = { x0: nx + 6, x1: nx + 26, y0: ny + 22, y1: ny + 31 };
    var tiles = [[Math.floor(box.x0 / TILE), Math.floor(box.y0 / TILE)], [Math.floor(box.x1 / TILE), Math.floor(box.y0 / TILE)], [Math.floor(box.x0 / TILE), Math.floor(box.y1 / TILE)], [Math.floor(box.x1 / TILE), Math.floor(box.y1 / TILE)]];
    for (var i = 0; i < 4; i++) if (!L.isWalkable(tiles[i][0], tiles[i][1], npcsLive)) return;
    px = nx; py = ny;
  }

  /* ---------- Phím ---------- */
  document.addEventListener('keydown', function (e) {
    var k = e.key.toLowerCase();
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].indexOf(k) >= 0 && state && !$('screen-game').classList.contains('hidden')) e.preventDefault();
    keys[k] = true;
    if (!state || $('screen-game').classList.contains('hidden')) return;
    if (k === 'e' || k === ' ') interact();
    else if (dlg && dlg.who === 'choice' && (k === '1' || k === '2')) {
      var idx = parseInt(k, 10) - 1;
      if (dlg.options[idx]) chooseOption(dlg.options[idx].action);
    }
    else if (k === '1') castPha();
    else if (k === '2') castChan();
    else if (k === 'b') doBreakthrough();
  });
  document.addEventListener('keyup', function (e) { keys[e.key.toLowerCase()] = false; });
  $('dialogue').addEventListener('click', function () { if (dlg && dlg.who !== 'choice') nextLine(); });
  $('btn-save').addEventListener('click', function () { saveNow(); toast('Đã lưu tiến trình.'); });
  var questToggleEl = $('quest-toggle');
  if (questToggleEl) questToggleEl.addEventListener('click', function () { questMinimized = true; applyQuestMin(); });
  var questTabEl = $('quest-tab');
  if (questTabEl) questTabEl.addEventListener('click', function () {
    questMinimized = false; applyQuestMin();
    questTabEl.classList.remove('pulse');
    if (lastQuestId) seenQuestIds[lastQuestId] = true;
    if (state && state.quest) seenQuestIds[state.quest] = true;
  });
  var toastMinEl = $('toast-min');
  if (toastMinEl) toastMinEl.addEventListener('click', function () {
    toastMinimized = true;
    try { localStorage.setItem('vslc_toast_min', '1'); } catch (e) {}
    var t = $('toast'); if (t) t.classList.add('hidden');
    clearTimeout(toast._h);
    if (lastToastMsg) { toastUnread += 1; }
    updateToastTab();
  });
  var toastTabEl = $('toast-tab');
  if (toastTabEl) toastTabEl.addEventListener('click', function () {
    toastMinimized = false;
    try { localStorage.setItem('vslc_toast_min', '0'); } catch (e) {}
    toastUnread = 0;
    updateToastTab();
    if (lastToastMsg) {
      var t2 = $('toast'), txt2 = $('toast-text');
      if (txt2) txt2.textContent = lastToastMsg;
      if (t2) t2.classList.remove('hidden');
      clearTimeout(toast._h); toast._h = setTimeout(function () { if (t2) t2.classList.add('hidden'); }, lastToastMs || 3200);
    }
  });


  /* ---------- Bấm chuột để di chuyển + nút thanh kỹ năng ---------- */
  function handleCanvasPoint(clientX, clientY) {
    if (!state || dlg) return;
    var rect = cv.getBoundingClientRect();
    var wx = (clientX - rect.left) + camX;
    var wy = (clientY - rect.top) + camY;
    var tx = Math.floor(wx / TILE), ty = Math.floor(wy / TILE);
    var dest = null;
    if (L.isWalkable(tx, ty, npcsLive)) {
      dest = { x: tx, y: ty };
    } else {
      // Ô đi được gần nhất trong vòng Chebyshev bán kính tới 3.
      for (var r = 1; r <= 3 && !dest; r++) {
        for (var oy = -r; oy <= r && !dest; oy++) {
          for (var ox = -r; ox <= r; ox++) {
            if (Math.max(Math.abs(ox), Math.abs(oy)) !== r) continue;
            if (L.isWalkable(tx + ox, ty + oy, npcsLive)) { dest = { x: tx + ox, y: ty + oy }; break; }
          }
        }
      }
    }
    if (!dest) return;
    var from = { x: Math.floor((px + 16) / TILE), y: Math.floor((py + 16) / TILE) };
    var path = L.findPath(from, dest, npcsLive);
    if (path && path.length) { clickPath = path; clickTarget = dest; medLatch = false; }
    else { clickPath = null; clickTarget = null; }
  }
  // Sau một lần kéo cần, trình duyệt có thể phát thêm 1 sự kiện chuột tổng hợp nối tiếp:
  // chặn đúng lần đó (trong cửa sổ ngắn), các lần chạm thật sau vẫn bình thường.
  function tapSuppressed() {
    if (!suppressTapUntil) return false;
    var within = Date.now() <= suppressTapUntil;
    suppressTapUntil = 0;
    return within;
  }
  cv.addEventListener('mousedown', function (e) {
    if (e.button !== 0) return;
    if (tapSuppressed()) return;
    handleCanvasPoint(e.clientX, e.clientY);
  });
  cv.addEventListener('touchstart', function (e) {
    if (!e.touches || !e.touches[0]) return;
    e.preventDefault();
    if (tapSuppressed()) return;
    handleCanvasPoint(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: false });
  /* Cần điều khiển cảm ứng: chỉ nhận sự kiện pointer type 'touch' trên chính canvas
     (các nút giao diện là phần tử DOM nổi phía trên nên tự nhận chạm trước).
     Chạm nhanh rồi thả = tap-to-move do handler touchstart ở trên xử lý như cũ;
     kéo lệch quá ngưỡng hoặc giữ quá ngưỡng thời gian = chế độ cần (vòng lặp sẽ
     tự nâng 'pending' thành 'stick' khi giữ lâu mà không kéo). */
  function joyPoint(e) { var rect = cv.getBoundingClientRect(); return { x: e.clientX - rect.left, y: e.clientY - rect.top }; }
  cv.addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'touch' || !state || dlg) return;
    var p = joyPoint(e);
    joy.state = 'pending'; joy.id = e.pointerId;
    joy.sx = p.x; joy.sy = p.y; joy.cx = p.x; joy.cy = p.y;
    joy.t0 = Date.now(); joy.active = false; joy.ux = 0; joy.uy = 0; joy.speed = 0;
  });
  cv.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'touch' || joy.id !== e.pointerId) return;
    if (joy.state !== 'pending' && joy.state !== 'stick') return;
    var p = joyPoint(e); joy.cx = p.x; joy.cy = p.y;
    var ddx = joy.cx - joy.sx, ddy = joy.cy - joy.sy;
    var dist = Math.sqrt(ddx * ddx + ddy * ddy);
    if (joy.state === 'pending' && dist > L.JOY_STICK_DIST) {
      joy.state = 'stick';
      clickPath = null; clickTarget = null; medLatch = false; // vào chế độ cần: hủy lệnh tap-to-move đang chạy
    }
    if (joy.state === 'stick') {
      var n2 = L.joyNormalize(ddx, ddy, JOY_R);
      joy.active = n2.active; joy.ux = n2.ux; joy.uy = n2.uy; joy.speed = n2.speed;
    }
  });
  function joyEnd(e) {
    if (e.pointerType !== 'touch' || joy.id !== e.pointerId) return;
    var endStick = joy.state === 'stick';
    if (joy.state === 'pending') {
      var ddx = joy.cx - joy.sx, ddy = joy.cy - joy.sy;
      var dist = Math.sqrt(ddx * ddx + ddy * ddy);
      // 'tap' => giữ nguyên tap-to-move cho handler touchstart hiện tại; 'stick' => coi như vừa dùng cần.
      if (L.joyClassify(Date.now() - joy.t0, dist) === 'stick') endStick = true;
    }
    if (endStick) suppressTapUntil = Date.now() + 700;
    resetJoy(); // nhấc ngón tay: cần tắt, nhân vật dừng
  }
  cv.addEventListener('pointerup', joyEnd);
  cv.addEventListener('pointercancel', joyEnd);
  $('sk-pha').addEventListener('click', function () { castPha(); });
  $('sk-chan').addEventListener('click', function () { castChan(); });
  $('sk-med').addEventListener('click', function () { medLatch = !medLatch; refreshHUD(); });
  $('sk-break').addEventListener('click', function () { doBreakthrough(); });
  $('sk-interact').addEventListener('click', function () { interact(); });

  show('screen-auth');
})();
