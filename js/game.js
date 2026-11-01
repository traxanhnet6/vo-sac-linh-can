/* Bộ máy game Vô Sắc Linh Căn: màn hình tài khoản, tạo nhân vật, vòng lặp chơi,
   vẽ canvas, thoại, sự kiện trắc linh / mở miệng, thổ nạp, Ngôn Linh. */
(function () {
  'use strict';
  var L = window.VSLC, S = window.VSLC_SPRITES, ST = window.VSLC_STORY, sha256 = window.VSLC_SHA256;
  // Cài đặt theo tài khoản (js/settings.js). Mọi điểm hiệu ứng đọc SET.current
  // qua guard `SET && ...` — module vắng mặt thì engine chạy đúng mặc định cũ.
  var SET = window.VSLC_SETTINGS || null;
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
  /* ---------- Phóng to / thu nhỏ khung nhìn thế giới (Luồng C, đợt
     "Bản đồ mượt + Ngày đêm", lệnh Bui 13:46 ngày 2026-11-01) ----------
     Zoom là lớp HIỂN THỊ thuần túy: không đổi tọa độ logic / dữ liệu bản đồ.
     Mọi phép biến đổi màn hình <-> thế giới trong engine PHẢI đi qua
     screenToWorld / worldToScreen ở đây (một hàm dùng chung cho chạm-để-đi,
     chạm-tương-tác, neo chụm hai ngón và neo lăn chuột). */
  var ZOOM_MIN = 0.6;        // hệ số nhỏ nhất (thấy rộng nhất)
  var ZOOM_MAX = 2.0;        // hệ số lớn nhất (phóng to nhất)
  var ZOOM_DEFAULT = 1;      // mức phóng mặc định mỗi phiên chơi
  var ZOOM_LERP = 0.22;      // hệ số nội suy mỗi khung hình: hiển thị tiến dần về đích, không nhảy bậc
  var ZOOM_SNAP_EPS = 0.002; // đủ gần đích thì chốt hẳn (tránh rung đuôi nội suy)
  var ZOOM_WHEEL_EXP = 0.0016; // độ nhạy lăn chuột: đích *= exp(-deltaY * hằng số này)
  function clampZoom(z) {
    var n = Number(z);
    if (!isFinite(n)) return ZOOM_DEFAULT;
    return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, n));
  }
  // Một bước nội suy từ cur về target: tiến THEO HƯỚNG đích, không bao giờ vượt đích.
  function zoomLerpStep(cur, target, factor) {
    var c = Number(cur), t = clampZoom(target);
    if (!isFinite(c)) c = ZOOM_DEFAULT;
    var f = (factor == null ? ZOOM_LERP : Number(factor));
    if (!isFinite(f) || f <= 0) f = ZOOM_LERP;
    if (f > 1) f = 1;
    var nxt = c + (t - c) * f;
    if ((t > c && nxt > t) || (t < c && nxt < t)) nxt = t;
    if (Math.abs(t - nxt) < ZOOM_SNAP_EPS) nxt = t;
    return nxt;
  }
  function pinchDistance(ax, ay, bx, by) {
    var dx = (Number(bx) || 0) - (Number(ax) || 0), dy = (Number(by) || 0) - (Number(ay) || 0);
    return Math.sqrt(dx * dx + dy * dy);
  }
  function pinchMidpoint(ax, ay, bx, by) {
    return { x: ((Number(ax) || 0) + (Number(bx) || 0)) / 2, y: ((Number(ay) || 0) + (Number(by) || 0)) / 2 };
  }
  // Tỉ lệ khoảng cách hai ngón so với lúc bắt đầu cử chỉ -> hệ số phóng đích (kẹp hai đầu).
  function pinchTargetZoom(startZoom, startDist, curDist) {
    var sd = Number(startDist), cd = Number(curDist);
    if (!isFinite(sd) || sd <= 0 || !isFinite(cd) || cd < 0) return clampZoom(startZoom);
    return clampZoom((Number(startZoom) || ZOOM_DEFAULT) * (cd / sd));
  }
  function wheelTargetZoom(curTarget, deltaY) {
    var t = Number(curTarget); if (!isFinite(t)) t = ZOOM_DEFAULT;
    var dy = Number(deltaY); if (!isFinite(dy)) dy = 0;
    return clampZoom(t * Math.exp(-dy * ZOOM_WHEEL_EXP));
  }
  // Khung thế giới NHÌN THẤY được ở một mức zoom: càng thu nhỏ càng thấy nhiều đất.
  function effectiveView(vw, vh, zoom) {
    var z = clampZoom(zoom);
    return { w: (Number(vw) || 0) / z, h: (Number(vh) || 0) / z, zoom: z };
  }
  function worldToScreen(wx, wy, camX, camY, zoom) {
    var z = clampZoom(zoom);
    return { x: ((Number(wx) || 0) - (Number(camX) || 0)) * z, y: ((Number(wy) || 0) - (Number(camY) || 0)) * z };
  }
  function screenToWorld(sx, sy, camX, camY, zoom) {
    var z = clampZoom(zoom);
    return { x: (Number(camX) || 0) + (Number(sx) || 0) / z, y: (Number(camY) || 0) + (Number(sy) || 0) / z };
  }
  // Camera mà tại đó điểm thế giới (wx,wy) nằm đúng tại điểm màn hình (sx,sy) ở mức zoom cho trước — hàm neo dùng chung.
  function camForAnchor(wx, wy, sx, sy, zoom) {
    var z = clampZoom(zoom);
    return { x: (Number(wx) || 0) - (Number(sx) || 0) / z, y: (Number(wy) || 0) - (Number(sy) || 0) / z };
  }
  // Kẹp camera theo biên bản đồ Ở MỨI ZOOM hiện tại. Khi khung nhìn hiệu dụng
  // lớn hơn bản đồ (zoom nhỏ + bản đồ nhỏ) thì CĂN GIỮA bản đồ trong khung
  // (camera âm) thay vì dính góc 0,0 như clampCam cũ.
  function clampCamZoom(cx, cy, vw, vh, zoom, worldW, worldH) {
    var eff = effectiveView(vw, vh, zoom);
    var ww = Number(worldW) || 0, wh = Number(worldH) || 0;
    var x, y;
    if (ww <= eff.w) x = (ww - eff.w) / 2;
    else x = Math.max(0, Math.min(ww - eff.w, Number(cx) || 0));
    if (wh <= eff.h) y = (wh - eff.h) / 2;
    else y = Math.max(0, Math.min(wh - eff.h, Number(cy) || 0));
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
  function beep(freq, dur, type, gain, cat) {
    // Cài đặt âm thanh qua cổng thuần của settings.js: 'skill' (chiêu thức/sự
    // kiện) tắt riêng được, 'ui' (giao diện) chỉ chịu tiếng tổng; âm lượng
    // tổng nhân vào mọi tiếng. Không có module cài đặt thì phát như cũ.
    if (SET && SET.sfxAllowed && !SET.sfxAllowed(cat)) return;
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)();
      var o = AC.createOscillator(), g = AC.createGain();
      o.type = type || 'sine'; o.frequency.value = freq;
      g.gain.setValueAtTime((gain || 0.05) * (SET && SET.gainScale ? SET.gainScale() : 1), AC.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, AC.currentTime + dur);
      o.connect(g); g.connect(AC.destination); o.start(); o.stop(AC.currentTime + dur);
    } catch (e) { /* im lặng */ }
  }
  function rumble() { beep(52, 1.1, 'sawtooth', 0.12, 'skill'); beep(38, 1.4, 'triangle', 0.1, 'skill'); }
  /* ---------- Bộ âm thanh sự kiện (docs/effects-catalog.md) ---------- */
  // PHÁ: trầm, nặng, dư chấn dài. CHẤN: cao hơn, vang, dứt khoát — phân biệt rõ.
  function sfxPha() { beep(70, 0.55, 'sawtooth', 0.11, 'skill'); beep(140, 0.3, 'square', 0.07, 'skill'); beep(52, 0.8, 'triangle', 0.1, 'skill'); }
  function sfxChan() { beep(196, 0.4, 'square', 0.07, 'skill'); beep(392, 0.55, 'sine', 0.05, 'skill'); beep(98, 0.65, 'triangle', 0.09, 'skill'); }
  function sfxBell() { beep(1046, 0.9, 'sine', 0.055, 'skill'); beep(1568, 1.2, 'sine', 0.035, 'skill'); beep(784, 0.7, 'sine', 0.045, 'skill'); }
  function sfxQuest() {
    beep(523, 0.12, 'sine', 0.05, 'skill');
    setTimeout(function () { beep(659, 0.12, 'sine', 0.05, 'skill'); }, 90);
    setTimeout(function () { beep(784, 0.22, 'sine', 0.055, 'skill'); }, 180);
  }
  function sfxCrack(heavy) {
    beep(150 + Math.random() * 70, 0.07, 'square', 0.06, 'skill');
    if (heavy) { beep(75, 0.5, 'sawtooth', 0.1, 'skill'); beep(48, 0.8, 'triangle', 0.09, 'skill'); }
  }
  function sfxUi() { beep(660, 0.05, 'triangle', 0.028, 'ui'); }
  function sfxPage() { beep(320, 0.045, 'sine', 0.016, 'ui'); }
  // Thước pha lê leo phẩm (chương 3): chín nốt leo thang theo chín phẩm rồi chuông kết.
  function sfxThuoc() {
    var notes = [392, 440, 494, 587, 659, 784, 988, 1175, 1568];
    notes.forEach(function (f, i) { setTimeout(function () { beep(f, 0.3, 'sine', 0.04, 'skill'); }, i * 140); });
    setTimeout(function () { sfxBell(); }, notes.length * 140 + 60);
  }
  // Kiếm quyết: tiếng xé gió hai nhịp, sắc và ngắn — khác hẳn tiếng lời nói.
  function sfxSword() { beep(1180, 0.08, 'sawtooth', 0.03, 'skill'); setTimeout(function () { beep(760, 0.12, 'sawtooth', 0.035, 'skill'); }, 45); }
  // Hồn lực (chương 5): âm trầm lạnh hai lớp, trầm và dài — không giống bất kỳ âm nào khác.
  function sfxSoul() { beep(196, 0.7, 'sine', 0.05, 'skill'); setTimeout(function () { beep(147, 0.9, 'sine', 0.045, 'skill'); }, 160); setTimeout(function () { beep(294, 0.5, 'sine', 0.025, 'skill'); }, 320); }
  // Gió xé qua đài cao (chương 7-8): hai nốt sine TRƯỢT XUỐNG 800->300 và
  // 600->240 Hz, gain thấp — beep() không trượt tần được nên đi thẳng WebAudio
  // qua cùng cổng cài đặt 'skill' như mọi âm sự kiện khác.
  function sfxWind() {
    if (SET && SET.sfxAllowed && !SET.sfxAllowed('skill')) return;
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)();
      var scale = SET && SET.gainScale ? SET.gainScale() : 1;
      [[800, 300], [600, 240]].forEach(function (pair, i) {
        var o = AC.createOscillator(), g = AC.createGain();
        var t0 = AC.currentTime + i * 0.09;
        o.type = 'sine';
        o.frequency.setValueAtTime(pair[0], t0);
        o.frequency.exponentialRampToValueAtTime(pair[1], t0 + 0.45);
        g.gain.setValueAtTime(0.035 * scale, t0);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.5);
        o.connect(g); g.connect(AC.destination); o.start(t0); o.stop(t0 + 0.5);
      });
    } catch (e) { /* im lặng */ }
  }
  // Chuông lớn Trúc Cơ (chương 8): chuông trầm 523/784 Hz ngân dài + tiếng
  // rền trầm dưới đáy (rumble) — nặng hơn hẳn sfxBell của đột phá thường.
  function sfxBigBell() {
    beep(523, 1.5, 'sine', 0.07, 'skill'); beep(784, 1.7, 'sine', 0.05, 'skill');
    beep(65, 1.9, 'triangle', 0.1, 'skill'); beep(98, 1.5, 'sawtooth', 0.045, 'skill');
  }

  /* ---------- Lồng tiếng thoại (assets/voice/ + js/voice-manifest.js) ---------- */
  var VOICE = window.VSLC_VOICE || null, voiceAudio = null;
  function voiceKey(who, text) { return sha256(who + '|' + text).slice(0, 12); }
  function stopVoice() {
    if (voiceAudio) { try { voiceAudio.pause(); } catch (e) {} voiceAudio = null; }
  }
  function playVoiceFor(line) {
    stopVoice();
    if (!VOICE || !line || line.who === 'choice' || line.mode === 'write') return;
    if (SET && SET.voiceAllowed && !SET.voiceAllowed()) return;
    var e = VOICE.lines[voiceKey(line.who, line.text)];
    if (!e) return; // câu chưa có tiếng: rơi về tiếng chữ chạy như cũ, không lỗi
    try {
      voiceAudio = new Audio('assets/voice/' + e.f);
      voiceAudio.volume = SET && SET.voiceScale ? SET.voiceScale(e.k) : (e.k === 'inner' ? 0.5 : 0.9);
      var pr = voiceAudio.play();
      if (pr && pr.catch) pr.catch(function () {});
    } catch (err) { voiceAudio = null; }
  }

  /* ---------- Hiệu ứng hạt + cột sáng + chuyển cảnh (docs/effects-catalog.md) ---------- */
  var parts = [], MAX_PARTS = 90; // trần hạt đồng thời — giữ hiệu năng điện thoại
  var pillarT = 0;                // cột sáng đột phá (giây còn lại)
  var fade = { t: 0, phase: 'idle', cb: null }; // mờ chuyển cảnh — cơ chế sẵn cho cổng phần 2
  function fxOn() { return !SET || SET.current.fxParticles; }
  function spawnParts(x, y, n, col, spd, up) {
    if (!fxOn()) return;
    for (var i = 0; i < n && parts.length < MAX_PARTS; i++) {
      var a = Math.random() * Math.PI * 2, s = (0.3 + Math.random() * 0.7) * (spd || 26);
      parts.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s * 0.6 - (up ? 16 : 0), life: 0.9 + Math.random() * 0.7, t: 0, col: col, r: 1.4 + Math.random() * 1.8 });
    }
  }
  function fadeTransition(cb) {
    if (fade.phase !== 'idle') { if (cb) cb(); return; }
    fade.phase = 'out'; fade.t = 0; fade.cb = cb || null;
  }

  /* ---------- Tài khoản ---------- */
  var currentUser = null;
  // Số thứ tự bản lưu mà phiên này đã nạp (hoặc đã ghi gần nhất). Mọi lần
  // ghi đều tăng số này; một phiên khác ghi trước sẽ đẩy số trong kho lên
  // cao hơn mốc của phiên này — dấu hiệu phiên này đã CŨ (xem saveNow).
  var sessionSaveSeq = 0, saveStaleWarned = false;
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
    st.saveSeq = 1; // bản lưu đầu tiên của tài khoản (chỉ tạo khi chưa có bản lưu nào)
    L.saveGame(localStorage, currentUser, st);
    startGame(st);
  });
  function exitToAuth() {
    hideConfirm();
    if (window.VSLC_MUSIC) VSLC_MUSIC.stop();
    stopVoice(); currentUser = null; state = null; show('screen-auth');
  }
  /* ---------- Nhạc nền + tiếng động môi trường (module nhạc) ----------
     Nối dây mỏng theo hợp đồng VSLC_MUSIC: mở khóa ở tương tác đầu tiên
     của người chơi (chính sách trình duyệt); mỗi khung hình áp cài đặt
     khi có đổi, cập nhật cảnh theo bản đồ + pha ngày đêm thật, giảm nền
     khi thoại đang mở, tiếng suối theo khoảng cách tới ô nước gần nhất.
     Mọi lời gọi đều có guard: thiếu module nhạc thì game chạy như cũ. */
  var musCache = { mOn: null, mVol: null, aOn: null, aVol: null, sceneKey: null, sceneAt: 0, duck: null, prox: -1 };
  function musicProximity() {
    var def = (L.MAPS || {})[state.map]; if (!def || !def.grid) return 0;
    var pt = playerTile(), best = 99;
    for (var dy = -7; dy <= 7; dy++) for (var dx = -7; dx <= 7; dx++) {
      var row = def.grid[pt.y + dy]; if (!row) continue;
      if (row.charAt(pt.x + dx) === 'W') { var d = Math.max(Math.abs(dx), Math.abs(dy)); if (d < best) best = d; }
    }
    return best > 7 ? 0 : Math.max(0, 1 - best / 8);
  }
  function musicApplyFrame() {
    var M = window.VSLC_MUSIC;
    if (!M || !state) return;
    var c = SET ? SET.current : null;
    var mOn = !c || c.musicOn !== false, mVol = (c && typeof c.musicVol === 'number') ? c.musicVol : 0.7;
    var aOn = !c || c.ambienceOn !== false, aVol = (c && typeof c.ambienceVol === 'number') ? c.ambienceVol : 0.6;
    if (musCache.mOn !== mOn || musCache.mVol !== mVol) { M.setMusic(mOn, mVol); musCache.mOn = mOn; musCache.mVol = mVol; }
    if (musCache.aOn !== aOn || musCache.aVol !== aVol) { M.setAmbience(aOn, aVol); musCache.aOn = aOn; musCache.aVol = aVol; }
    var dk = !!dlg;
    if (musCache.duck !== dk) { M.setDuck(dk); musCache.duck = dk; }
    var ph = L.dayPhaseFor ? L.dayPhaseFor(state, c ? c.dayMode : 'cycle') : null;
    var key = state.map + '|' + (ph ? (ph.isNight ? 'n' : 'd') : '');
    var nowMs = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    if (key !== musCache.sceneKey || nowMs - musCache.sceneAt > 2000) {
      M.setScene(state.map, ph || 'day');
      musCache.sceneKey = key; musCache.sceneAt = nowMs;
    }
    var prox = musicProximity();
    if (Math.abs(prox - musCache.prox) > 0.05) { M.setProximity(prox); musCache.prox = prox; }
  }
  if (window.VSLC_MUSIC) {
    var musUnlock = function () {
      VSLC_MUSIC.unlock();
      window.removeEventListener('pointerdown', musUnlock);
      window.removeEventListener('keydown', musUnlock);
    };
    window.addEventListener('pointerdown', musUnlock);
    window.addEventListener('keydown', musUnlock);
  }
  /* Hộp thoại xác nhận TRONG GAME (DOM) — thay cho hộp thoại gốc của trình duyệt.
     Nguyên nhân gốc của lỗi "cả hai nút Thoát đều chết" trên bản live 1.1.0:
     requestLogout cũ treo toàn bộ đường thoát trên hộp thoại gốc; khi môi
     trường chặn hộp thoại gốc (iframe nhúng không có quyền hộp thoại,
     webview, trình duyệt tự động bác hộp thoại), hộp thoại bị bác NGAY mà
     không hiện gì và trả về "không đồng ý" — handler âm thầm return, không
     lỗi, không phản hồi, cả hai nút (dùng chung một hàm) chết cùng lúc.
     Hộp thoại DOM tự vẽ thì không môi trường nào bác được và kiểm thử được
     bằng harness DOM giả lập (tools/dom-harness.js). */
  var confirmCb = null;
  function askConfirm(text, cb) {
    var box = $('confirm-dialog'), tx = $('confirm-text');
    if (!box || !tx) { cb(true); return; } // thiếu phần tử hộp thoại: thực hiện luôn, không chặn tính năng
    tx.textContent = text;
    box.classList.remove('hidden');
    confirmCb = cb;
  }
  function hideConfirm() {
    var box = $('confirm-dialog');
    if (box) box.classList.add('hidden');
    confirmCb = null;
  }
  $('confirm-yes').addEventListener('click', function () {
    var cb = confirmCb;
    hideConfirm();
    if (cb) cb(true);
  });
  $('confirm-no').addEventListener('click', function () { hideConfirm(); });
  function requestLogout() {
    if (SET && SET.current.confirmLogout) {
      askConfirm('Thoát về màn hình đăng nhập? Tiến trình sẽ được lưu trước khi thoát.', function (yes) {
        if (yes) { saveNow(); exitToAuth(); }
      });
      return;
    }
    saveNow(); exitToAuth();
  }
  $('btn-logout').addEventListener('click', requestLogout);
  // Cầu nối cho panel cài đặt (js/settings.js): nút Lưu/Thoát TRONG panel gọi
  // đúng các hàm này — cùng một đường xử lý với nút ở hàng chức năng phía trên.
  // exitToAuth tách riêng (không lưu) để luồng xóa tài khoản dùng: dữ liệu vừa
  // xóa không được ghi lại bởi một lần lưu cuối.
  window.VSLC_BRIDGE = {
    saveNow: saveNow, requestLogout: requestLogout, exitToAuth: exitToAuth,
    resetZoom: resetZoom,
    getUser: function () { return currentUser; }
  };

  /* ---------- Trạng thái phiên chơi ---------- */
  var state = null, px = 0, py = 0, facing = 'up', moving = false, walkFrame = 0, walkTimer = 0;
  var velX = 0, velY = 0; // vận tốc thật (px/giây) — quán tính tăng/giảm tốc của đợt nóng 2
  var pathStuckT = 0;     // đồng hồ kẹt đường của chạm-để-đi (giây đứng im hẳn)
  var keys = {}, npcsLive = [], floats = [], rings = [], shakeT = 0, dlg = null, dlgQueue = [], dlgCb = null;
  var meditating = false, saveTimer = 0, startedAt = 0;
  var medSfxT = 0, medNoteIdx = 0, MED_NOTES = [523, 587, 659, 784]; // vòng nốt thổ nạp
  var dlgTypeTimer = null, dlgTypeFull = null; // chữ thoại chạy dần (cài đặt dlgSpeed = 'normal')
  /* ---------- Đợt 2: asset ảnh thật + camera + di chuyển bằng chuột ---------- */
  var camX = 0, camY = 0;                 // camera bám mượt (trạng thái toàn cục)
  /* ---------- Trạng thái phóng/thu (Luồng C) — chỉ giữ trong PHIÊN chơi:
     vào phiên mới luôn bắt đầu ở ZOOM_DEFAULT; KHÔNG lưu vào save/cài đặt. */
  var zoom = ZOOM_DEFAULT, zoomTarget = ZOOM_DEFAULT;
  // Cử chỉ chụm hai ngón: pointers = pointerId -> {x,y} (tọa độ màn hình);
  // anchorWorld = điểm thế giới nằm dưới tâm chụm lúc bắt đầu, giữ nguyên
  // trên màn hình suốt cử chỉ (desiredCam tính lại theo neo mỗi khung).
  var pinch = { active: false, pointers: {}, startDist: 0, startZoom: ZOOM_DEFAULT, anchorWorld: null, midX: 0, midY: 0, joyCancelled: false };
  var zoomAnchor = null; // neo lăn chuột {wx, wy, sx, sy} — sống cho tới khi zoom hiển thị bắt kịp đích
  var pinchSuppressUntil = 0; // cửa sổ nuốt sự kiện chạm/chuột tổng hợp phát sinh ngay sau khi chụm kết thúc
  function zoomEnabled() { return !SET || SET.current.zoomEnabled !== false; }
  function resetZoom() {
    zoom = ZOOM_DEFAULT; zoomTarget = ZOOM_DEFAULT; zoomAnchor = null;
  }
  function cancelPinch() {
    pinch.active = false; pinch.pointers = {}; pinch.anchorWorld = null; pinch.joyCancelled = false;
  }
  /* Dọn TOÀN BỘ trạng thái nhập khi cửa sổ mất tiêu điểm hoặc trang bị ẩn:
     không một trạng thái nhập nào được sống sót qua mất focus. Thiếu khâu
     này, một keyup thất lạc (alt-tab, cuộc gọi tới, vuốt thanh thông báo)
     để keys[] kẹt true vĩnh viễn và nhân vật tự đi mãi về một hướng; cần
     điều khiển và sổ con trỏ chụm cũng kẹt tương tự nếu pointerup /
     pointercancel lạc mất. Lệnh đi đang chạy cũng hủy: quay lại game là
     đứng yên, người chơi ra lệnh mới. */
  function resetAllInput() {
    for (var kk in keys) keys[kk] = false;
    resetJoy();
    cancelPinch();
    clickPath = null; clickTarget = null; pendingInteract = null;
    velX = 0; velY = 0;
  }
  window.addEventListener('blur', resetAllInput);
  document.addEventListener('visibilitychange', function () {
    if (document.hidden || document.visibilityState === 'hidden') resetAllInput();
  });
  var clickPath = null, clickTarget = null; // đường đi khi bấm chuột
  var clickPathRaw = false;   // true khi đang đi theo đường ô THÔ (đường cứu hộ sau khi đường vuốt kẹt)
  var clickSegAnchor = null;  // gốc sprite tại điểm bắt đầu nhịp vuốt hiện tại (cho bám đuổi thuần túy)
  var pendingInteract = null; // chạm-để-tương-tác: mục tiêu đang hẹn mở tương tác khi tới nơi
  var medLatch = false;                    // chốt thổ nạp từ nút kỹ năng
  var CHAR_LOOKS = ['player_nam', 'player_nu', 'u_nhan', 'di_ninh', 'luc_tranh', 'anh_phung', 'chinh_ngon', 'elder', 'villager_m', 'villager_f', 'villager_old'];
  var PROP_TYPES = ['house_big', 'house', 'house_b', 'house_c', 'inn', 'stele', 'well', 'lantern', 'tree', 'pine', 'dummy', 'dummy_broken', 'stall', 'gate', 'jars', 'woodpile', 'rack', 'sacks'];
  var ASSETS = { bgByMap: {}, chars: {}, props: {} };
  function loadImg(src) { var im = new Image(); im.src = src; return im; }
  ASSETS.bgByMap.tran = loadImg('assets/bg.png'); // bản đồ chưa có tranh nền thì engine vẽ lưới ô (dự phòng)
  // Tranh nền mượt 5 bản đồ còn lại (đợt "Bản đồ mượt + Ngày đêm", Luồng A):
  // sinh từ dữ liệu grid thật bằng tools/gen-bg-smooth.py, kiểm chứng khớp
  // dữ liệu bằng tools/verify-bgs.py — lớp đất/nền thuần, prop vẫn vẽ đè lên.
  ASSETS.bgByMap.duong_mon = loadImg('assets/bg-duong_mon.png');
  ASSETS.bgByMap.co_chau = loadImg('assets/bg-co_chau.png');
  ASSETS.bgByMap.kiem_trac_thap = loadImg('assets/bg-kiem_trac_thap.png');
  ASSETS.bgByMap.thap_noi = loadImg('assets/bg-thap_noi.png');
  ASSETS.bgByMap.thanh_van_tong = loadImg('assets/bg-thanh_van_tong.png');
  CHAR_LOOKS.forEach(function (id) { ASSETS.chars[id] = loadImg('assets/chars/' + id + '.png'); });
  PROP_TYPES.forEach(function (t) { ASSETS.props[t] = loadImg('assets/props/' + t + '.png'); });
  function imgReady(im) { return !!(im && im.complete && im.naturalWidth > 0); }
  var DIR_ROW = { down: 0, up: 1, right: 2, left: 3 }; // hàng trong sheet nhân vật
  /* ---------- Đợt 8 hướng + cần cảm ứng (docs/char-sheet-8dir.md, docs/touch-joystick.md) ---------- */
  // Nhân vật đã chuyển sang sheet 8 hướng 480x960 (ô 96x120, hàng = dir8, cột = khung).
  // Nhân vật chưa có trong bảng này vẫn dùng sheet cũ 128x320 (ô 64x80, DIR_ROW).
  var CHAR8 = { player_nam: true, player_nu: true, u_nhan: true, di_ninh: true, luc_tranh: true, anh_phung: true, chinh_ngon: true, elder: true, villager_m: true, villager_f: true, villager_old: true };
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
  var JOY_BASE_MARGIN = 26; // lề vùng an toàn của đế cố định (px) ở chế độ Luôn hiện sẵn
  // Chế độ hiển thị cần (cài đặt joyMode): 'on' = Luôn hiện sẵn — có đế cố
  // định ở góc dưới trái; kéo bắt đầu từ đế thì neo tại đế, kéo ở chỗ khác
  // vẫn là cần nổi như thường. 'auto' = chỉ cần nổi. 'off' = ẩn hẳn (cổng
  // joyPointerOk chặn từ đầu).
  function joyFixedMode() { return !!(SET && SET.current.joyMode === 'on'); }
  function joyBasePos() {
    return { x: JOY_R + JOY_BASE_MARGIN, y: (cv ? cv.clientHeight : viewH) - JOY_R - JOY_BASE_MARGIN };
  }
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
    dan_a: 'Dân thôn', dan_b: 'Dân thôn', dan_c: 'Dân thôn',
    xa_phu: 'Người đánh xe đường dài',
    tran_tu_linh: 'Tiểu thư Trần gia', tran_chinh_dao: 'Phó các chủ Thiên Cơ Các',
    chu_kien_tham: 'Công tử Chu gia ở Cô Châu Thành',
    chu_quan: 'Chủ quán khách điếm', cho_a: 'Người bán hàng rong', cho_b: 'Người bán hàng rong',
    duoc_su: 'Dược sư hiệu thuốc', phap_khi_chu: 'Chủ các pháp khí',
    dan_thanh_a: 'Dân thành', dan_thanh_b: 'Dân thành',
    thap_chu: 'Chủ trì Kiểm Trắc Tháp', thi_sinh_a: 'Thí sinh kiểm trắc', thi_sinh_b: 'Thí sinh kiểm trắc',
    tap_dich_truong: 'Quản sự tạp dịch', truong_lao_tong: 'Trưởng lão Thanh Vân Tông',
    lieu_khuynh_tien: 'Con gái tông chủ Thanh Vân Tông', hoa_huong_than: 'Đại đệ tử Thanh Vân Tông',
    de_tu_a: 'Đệ tử Thanh Vân Tông', de_tu_b: 'Đệ tử Thanh Vân Tông'
  };


  function isTouchDevice() {
    try { return !!((window.matchMedia && window.matchMedia('(pointer: coarse)').matches) || ('ontouchstart' in window)); }
    catch (e) { return false; }
  }
  function startGame(saved) {
    state = L.normalizeSave(saved); // save cũ: bổ sung ví Linh Thạch + cờ mở khóa theo mốc đã qua
    sessionSaveSeq = (typeof state.saveSeq === 'number' && state.saveSeq > 0) ? Math.floor(state.saveSeq) : 0;
    saveStaleWarned = false;
    if (SET) {
      SET.loadFor(currentUser, localStorage, isTouchDevice());
      questMinimized = SET.current.questStart === 'min'; // cài đặt "ô nhiệm vụ khi vào game"
    }
    L.setActiveMap(state.map || 'tran');
    resizeCanvas();
    applyQuestMin();
    updateToastTab();
    px = state.x * TILE; py = state.y * TILE; facing = state.dir || 'up';
    dir8 = DIR8_ROW4[facing] || 0; stepPhase = 0; stepTimer = 0; resetJoy(); velX = 0; velY = 0;
    resetZoom(); cancelPinch(); // phiên chơi mới luôn bắt đầu ở mức phóng mặc định 1,0×
    npcsLive = L.activeMap().npcs.map(function (n) { return { id: n.id, name: n.name, look: n.look, x: n.x, y: n.y, dir: n.dir }; });
    setMinimapLabel();
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
    // Khoản bù lộ phí cho save cũ đã được cộng ngay trong L.normalizeSave
    // (trước lần vẽ giao diện đầu tiên); ở đây chỉ hiện thông báo một lần.
    if (state.ltGiftJustGranted) {
      delete state.ltGiftJustGranted;
      toast('Nhận bù lộ phí của trưởng lão: +' + L.fmtNum(L.LINH_GIFT_AMOUNT) + ' Linh Thạch (số dư: ' + L.fmtNum(L.linhBalance(state)) + ').', 4600);
      saveNow();
    }
    requestAnimationFrame(loop);
  }
  // Khoản Linh Thạch đầu tiên của người chơi: trưởng lão tặng lộ phí lên đường
  // tới Kiểm Trắc Tháp khi hoàn tất bản v1 (phá vỡ cọc gỗ — mốc này nằm SAU đột
  // phá Luyện Khí tầng 1 nên ví đã mở). Cờ flags.ltGift chống nhận trùng.
  function grantLinhGift(retro) {
    if (!state || !state.flags || state.flags.ltGift) return;
    var r = L.addLinhThach(state, L.LINH_GIFT_AMOUNT);
    if (!r.ok) return;
    state.flags.ltGift = true;
    refreshHUD(); saveNow();
    toast((retro ? 'Nhận bù lộ phí của trưởng lão: +' : 'Trưởng lão tặng lộ phí: +') + L.fmtNum(L.LINH_GIFT_AMOUNT) + ' Linh Thạch (số dư: ' + L.fmtNum(r.balance) + ').', 4600);
  }
  // Ghi tiến trình — có CHỐNG GHI ĐÈ NGƯỢC (lỗi chặn chơi ở chơi thử live
  // chương 3): trước đây mọi phiên đang mở đều ghi vô điều kiện, nên một
  // cửa sổ còn giữ trạng thái cũ (tự lưu mỗi vài giây, lưu khi thoát, lưu
  // trước khi tải lại) lặng lẽ ghi đè bản lưu mới hơn của phiên khác, làm
  // tiến trình "quay ngược" về một mốc cũ dù các lần lưu đều báo thành
  // công. Nay: nếu bản lưu trong kho đã mang số thứ tự cao hơn mốc phiên
  // này biết, phiên này đã cũ — KHÔNG ghi, trả false để nơi gọi báo thật.
  function saveNow() {
    if (!state || !currentUser) return false;
    state.x = Math.round(px / TILE); state.y = Math.round(py / TILE); state.dir = facing;
    var stored = L.loadGame(localStorage, currentUser);
    if (stored && (stored.saveSeq || 0) > sessionSaveSeq) {
      if (!saveStaleWarned) {
        saveStaleWarned = true;
        toast('Cảnh báo: tiến trình mới hơn đang nằm ở một phiên chơi khác. Phiên này không ghi đè lên — hãy tải lại trang để chơi tiếp từ tiến trình mới nhất.', 5600);
      }
      return false;
    }
    state.saveSeq = sessionSaveSeq + 1;
    L.saveGame(localStorage, currentUser, state);
    sessionSaveSeq = state.saveSeq;
    return true;
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

  function setMinimapLabel() {
    var mml = document.querySelector('.minimap-label');
    if (mml) mml.textContent = L.activeMap().name;
  }
  function desiredCam() {
    var def = L.activeMap();
    var worldW = def.w * TILE, worldH = def.h * TILE;
    // Đang chụm: camera neo tại điểm thế giới dưới tâm hai ngón — điểm đó
    // giữ nguyên vị trí màn hình trong suốt cử chỉ (theo zoom HIỂN THỊ).
    if (pinch.active && pinch.anchorWorld) {
      var pc = camForAnchor(pinch.anchorWorld.x, pinch.anchorWorld.y, pinch.midX, pinch.midY, zoom);
      return clampCamZoom(pc.x, pc.y, viewW, viewH, zoom, worldW, worldH);
    }
    // Lăn chuột chưa bắt kịp đích: camera neo tại điểm thế giới dưới con trỏ.
    if (zoomAnchor) {
      var ac = camForAnchor(zoomAnchor.wx, zoomAnchor.wy, zoomAnchor.sx, zoomAnchor.sy, zoom);
      return clampCamZoom(ac.x, ac.y, viewW, viewH, zoom, worldW, worldH);
    }
    var eff = effectiveView(viewW, viewH, zoom);
    return clampCamZoom(px + 16 - eff.w / 2, py + 16 - eff.h / 2, viewW, viewH, zoom, worldW, worldH);
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
    var def = L.activeMap();
    var ms = mm.width / def.w, msY = mm.height / def.h;
    var tx, ty;
    for (ty = 0; ty < def.h; ty++) for (tx = 0; tx < def.w; tx++) {
      mmCtx.fillStyle = TILE_COLORS[L.tileAt(tx, ty)] || '#5b9046';
      mmCtx.fillRect(tx * ms, ty * msY, Math.ceil(ms), Math.ceil(msY));
    }
    mmCtx.fillStyle = 'rgba(30,24,16,0.85)';
    def.props.forEach(function (p) { mmCtx.fillRect(Math.round((p.x + p.w / 2) * ms) - 1, Math.round((p.y + p.h / 2) * msY) - 1, 2, 2); });
    mmCtx.fillStyle = '#ffd94e';
    npcsLive.forEach(function (n) { mmCtx.fillRect(n.x * ms + ms / 4, n.y * msY + msY / 4, 2, 2); });
    var pcx = Math.floor((px + 16) / TILE) * ms + ms / 2, pcy = Math.floor((py + 16) / TILE) * msY + msY / 2;
    mmCtx.fillStyle = '#ffffff';
    mmCtx.beginPath(); mmCtx.arc(pcx, pcy, 0.6 * ms, 0, Math.PI * 2); mmCtx.fill();
    mmCtx.strokeStyle = Math.floor(tNow / 400) % 2 ? '#e04a3a' : '#7a1f16';
    mmCtx.lineWidth = 0.35 * ms;
    mmCtx.beginPath(); mmCtx.arc(pcx, pcy, 0.85 * ms, 0, Math.PI * 2); mmCtx.stroke();
  }

  function render() {
    ctx.setTransform(viewDpr, 0, 0, viewDpr, 0, 0);
    // Nội suy mức phóng: hiển thị tiến dần về đích mỗi khung (không nhảy bậc);
    // neo lăn chuột hết vai trò ngay khi hiển thị đã bắt kịp đích.
    zoom = zoomLerpStep(zoom, zoomTarget);
    if (zoomAnchor && zoom === zoomTarget) zoomAnchor = null;
    var effW = viewW / zoom, effH = viewH / zoom; // khung thế giới nhìn thấy ở mức zoom hiện tại
    var dc = desiredCam();
    // Nội suy mũ theo thời gian thật (hằng số ~0,085s, tương đương hệ số
    // 0,18/khung ở 60fps như trước) — độ mượt không còn phụ thuộc nhịp khung.
    var camK = 1 - Math.exp(-frameDt / 0.085);
    camX += (dc.x - camX) * camK; camY += (dc.y - camY) * camK;
    if (Math.abs(dc.x - camX) < 0.5) camX = dc.x;
    if (Math.abs(dc.y - camY) < 0.5) camY = dc.y;
    var shX = 0, shY = 0;
    if (shakeT > 0 && (!SET || SET.current.fxShake)) { var m = Math.min(10, shakeT * 9); shX = (Math.random() - 0.5) * m; shY = (Math.random() - 0.5) * m; }
    ctx.fillStyle = '#2c3527'; ctx.fillRect(0, 0, viewW, viewH);
    // Ở mức phóng khác 1 thì bật làm mượt ảnh khi co/giãn (vẽ điểm ảnh gốc vẫn
    // giữ nguyên ở đúng 1,0× như trước); rung màn hình là độ lệch MÀN HÌNH nên
    // áp trước phép tỉ lệ thế giới.
    ctx.imageSmoothingEnabled = zoom !== ZOOM_DEFAULT;
    ctx.save(); ctx.translate(shX, shY); ctx.scale(zoom, zoom); ctx.translate(-camX, -camY);
    // Nền: ảnh toàn bản đồ nếu bản đồ đó có và đã tải; chưa có thì vẽ lưới ô (dự phòng).
    var defR = L.activeMap();
    // Pha ngày đêm của khung hình này (logic thuần ở js/logic.js; module
    // logic cũ không có hàm pha thì dnPhase = null và cảnh vẽ như trước).
    var dnPhase = (L.dayPhaseFor && state) ? L.dayPhaseFor(state, SET ? SET.current.dayMode : 'cycle') : null;
    var bgIm = ASSETS.bgByMap[state.map];
    if (imgReady(bgIm)) {
      ctx.drawImage(bgIm, 0, 0);
    } else {
      var x0 = Math.max(0, Math.floor(camX / TILE)), x1 = Math.min(defR.w - 1, x0 + effW / TILE + 1);
      var y0 = Math.max(0, Math.floor(camY / TILE)), y1 = Math.min(defR.h - 1, y0 + effH / TILE + 1);
      for (var ty = y0; ty <= y1; ty++) for (var tx = x0; tx <= x1; tx++) drawTile(tx, ty, tx * TILE, ty * TILE, L.tileAt(tx, ty));
    }
    // Hạt linh khí lơ lửng trong không gian trấn: thưa, nhẹ, trôi theo gió —
    // xác định theo ô lưới lớn (không lưu trạng thái), tắt theo fxParticles.
    if (fxOn()) {
      var cell = 150;
      var gx0 = Math.floor(camX / cell) - 1, gx1 = Math.floor((camX + effW) / cell) + 1;
      var gy0 = Math.floor(camY / cell) - 1, gy1 = Math.floor((camY + effH) / cell) + 1;
      for (var mgx = gx0; mgx <= gx1; mgx++) for (var mgy = gy0; mgy <= gy1; mgy++) {
        var mh = hash2(mgx, mgy);
        if (mh % 3 !== 0) continue;
        var mx = mgx * cell + (mh % 90) + Math.sin(tNow / 1500 + mh) * 9;
        var my = mgy * cell + (mh % 80) + Math.cos(tNow / 1900 + mh * 2) * 7;
        ctx.fillStyle = 'rgba(190,235,255,' + (0.13 + 0.1 * Math.sin(tNow / 700 + mh)) + ')';
        ctx.beginPath(); ctx.arc(mx, my, 1.7, 0, Math.PI * 2); ctx.fill();
      }
    }
    // Vòng đánh dấu đích bấm chuột (lớp đất: sau nền, trước vật thể).
    if (clickTarget) {
      var pulse = 0.55 + 0.35 * Math.sin(tNow / 180);
      ctx.strokeStyle = 'rgba(255,217,78,' + pulse + ')'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(clickTarget.x * TILE + 16, clickTarget.y * TILE + 26, 12, 5, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = 'rgba(255,217,78,' + (pulse * 0.8) + ')';
      ctx.beginPath(); ctx.ellipse(clickTarget.x * TILE + 16, clickTarget.y * TILE + 26, 4.5, 2, 0, 0, Math.PI * 2); ctx.fill();
    }
    // Mục tiêu chạm-để-tương-tác đang hẹn: vòng sáng rõ hơn dưới chân đối
    // tượng (phân biệt với điểm đến di chuyển ở trên) để người chơi biết
    // mình đã chọn đúng người/vật.
    if (pendingInteract) {
      var pPulse = 0.65 + 0.3 * Math.sin(tNow / 150);
      ctx.strokeStyle = 'rgba(140,235,170,' + pPulse + ')'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.ellipse(pendingInteract.focusX * TILE + 16, pendingInteract.focusY * TILE + 27, 15, 6, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(pendingInteract.focusX * TILE + 16, pendingInteract.focusY * TILE + 27, 8, 3.4, 0, 0, Math.PI * 2); ctx.stroke();
    }
    // hào quang bia đá sau khi trắc linh (vô sắc — vòng trong suốt phát sáng trắng)
    if (state.flags.tested) {
      var bia = null;
      for (var bi = 0; bi < defR.props.length; bi++) if (defR.props[bi].id === 'bia_trac_linh') { bia = defR.props[bi]; break; }
      if (bia) {
        ctx.strokeStyle = 'rgba(240,246,255,' + (0.35 + 0.2 * Math.sin(tNow / 300)) + ')';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc((bia.x + bia.w / 2) * TILE, (bia.y + bia.h - bia.fy) * TILE, 26 + 4 * Math.sin(tNow / 300), 0, Math.PI * 2); ctx.stroke();
      }
    }
    // điểm thổ nạp của bản đồ hiện tại: vòng linh khí
    if (state.unlocked.indexOf('voice') >= 0 && defR.meditate) {
      ctx.strokeStyle = 'rgba(150,220,255,0.5)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(defR.meditate.x * TILE + 16, defR.meditate.y * TILE + 16, 20 + 5 * Math.sin(tNow / 400), 0, Math.PI * 2); ctx.stroke();
    }
    // danh sách vẽ theo chiều sâu (vật thể thật + trang trí thị giác + NPC + biển + người chơi)
    var draws = [];
    defR.props.forEach(function (p) { draws.push({ depth: (p.y + p.h) * TILE, kind: 'prop', p: p }); });
    if (state.map === 'tran') VISUAL_DECOR.forEach(function (d2) { draws.push({ depth: d2.depth, kind: 'decor', dc: d2 }); });
    npcsLive.forEach(function (n) { draws.push({ depth: (n.y + 1) * TILE, kind: 'npc', n: n }); });
    (defR.signs || SIGNS).forEach(function (s) { draws.push({ depth: (s.y + 1) * TILE, kind: 'sign', s: s }); });
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
        if (p.type === 'lantern' && fxOn()) {
          // Ánh đèn lồng nhấp nháy rất nhẹ (dao động nhỏ quanh mức nền).
          var fl = 0.1 + 0.045 * Math.sin(tNow / 110 + (p.x * 7 + p.y * 13)) + 0.02 * Math.sin(tNow / 47 + p.x);
          ctx.fillStyle = 'rgba(255,202,122,' + Math.max(0.04, fl) + ')';
          ctx.beginPath(); ctx.arc((p.x + p.w / 2) * TILE, (p.y + 1) * TILE, 21, 0, Math.PI * 2); ctx.fill();
        }
        if (p.type === 'dummy' && !state.flags.dummyBroken && state._dummyHp != null) {
          // Cọc gỗ nứt theo nấc chịu đòn: >26 chưa nứt, 14..26 nứt nhẹ, 1..13 nứt nặng.
          var dstage = state._dummyHp > 26 ? 0 : (state._dummyHp > 13 ? 1 : 2);
          if (dstage > 0) {
            var dcx = (p.x + p.w / 2) * TILE, dby = (p.y + p.h) * TILE;
            ctx.strokeStyle = 'rgba(38,24,12,0.85)'; ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.moveTo(dcx - 2, dby - 58); ctx.lineTo(dcx + 2, dby - 44); ctx.lineTo(dcx - 2, dby - 30);
            if (dstage > 1) { ctx.moveTo(dcx + 2, dby - 44); ctx.lineTo(dcx + 8, dby - 34); ctx.moveTo(dcx - 2, dby - 30); ctx.lineTo(dcx - 3, dby - 14); ctx.lineTo(dcx + 3, dby - 4); }
            ctx.stroke();
          }
        }
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
    // Cài đặt showNames tắt nhãn tên + danh hiệu thì bong bóng cũng không có neo để bám.
    var placedLabels = (!SET || SET.current.showNames) ? drawLabels(labels) : [];
    drawBubble(placedLabels);
    // chỉ đường nhiệm vụ (chỉ khi điểm gợi ý ở cùng bản đồ hiện tại)
    var q = L.questById(state.quest);
    if (q && q.hint && (q.hint.map || 'tran') === state.map && !dlg) {
      var hx = q.hint.x * TILE + 16, hy = q.hint.y * TILE - 18 + Math.sin(tNow / 250) * 4;
      ctx.fillStyle = '#ffd94e';
      ctx.beginPath(); ctx.moveTo(hx, hy + 12); ctx.lineTo(hx - 8, hy); ctx.lineTo(hx + 8, hy); ctx.closePath(); ctx.fill();
    }
    // vòng sóng âm Ngôn Linh (cài đặt fxRings chỉ tắt phần VẼ, vòng đời vòng vẫn chạy như cũ)
    rings = rings.filter(function (r) { return r.a > 0; });
    if (!SET || SET.current.fxRings) rings.forEach(function (r) {
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
    // Cột sáng đột phá: chùm sáng dựng đứng + quầng ở chân, mờ dần theo pillarT.
    if (pillarT > 0) {
      var pa = Math.min(1, pillarT / 1.6);
      var pg = ctx.createLinearGradient(px + 16, py - 240, px + 16, py + 34);
      pg.addColorStop(0, 'rgba(255,244,200,0)');
      pg.addColorStop(0.75, 'rgba(255,240,190,' + (0.4 * pa) + ')');
      pg.addColorStop(1, 'rgba(255,250,225,' + (0.65 * pa) + ')');
      ctx.fillStyle = pg;
      ctx.fillRect(px + 16 - 23, py - 240, 46, 274);
      ctx.strokeStyle = 'rgba(255,240,190,' + (0.55 * pa) + ')'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.ellipse(px + 16, py + 30, 30 + (1 - pa) * 22, 9 + (1 - pa) * 6, 0, 0, Math.PI * 2); ctx.stroke();
    }
    // Hào quang thổ nạp: hai vòng cung xoay ngược chiều quanh người khi đang nạp.
    // Ban đêm hào quang rõ hơn một chút (chỉ hình ảnh, không đổi số cân bằng).
    if (meditating && fxOn()) {
      var ma = tNow / 620;
      var medAlpha = 0.55 + (dnPhase ? dnPhase.night * 0.3 : 0);
      ctx.strokeStyle = 'rgba(150,220,255,' + medAlpha.toFixed(3) + ')'; ctx.lineWidth = dnPhase && dnPhase.night > 0.5 ? 2.6 : 2;
      ctx.beginPath(); ctx.arc(px + 16, py + 18, 25, ma, ma + Math.PI * 1.25); ctx.stroke();
      ctx.beginPath(); ctx.arc(px + 16, py + 18, 31, -ma * 0.8, -ma * 0.8 + Math.PI * 0.9); ctx.stroke();
    }
    // Hạt linh khí (đột phá, phá cọc, mở miệng, thổ nạp).
    parts.forEach(function (p) {
      var al = Math.max(0, 1 - p.t / p.life) * 0.85;
      ctx.fillStyle = 'rgba(' + p.col + ',' + al + ')';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    });
    // Lớp phủ ngày đêm: SAU toàn bộ thế giới, TRƯỚC giao diện (vẽ trong hệ
    // tọa độ thế giới ngay trước restore). Độ tối là hàm liên tục theo giờ
    // (js/logic.js dayPhaseAt) và bị chặn ở trần NIGHT_DARK_MAX nên đêm vẫn
    // nhìn rõ. Quầng sáng đèn lồng/cửa sổ nhà vẽ bằng composite 'lighter'
    // chồng lên lớp phủ — sáng xuyên qua màn đêm mà không xóa thế giới.
    if (dnPhase && dnPhase.dark > 0.004) {
      var dvx = camX - 40, dvy = camY - 40, dvw = effW + 80, dvh = effH + 80;
      ctx.fillStyle = 'rgba(' + dnPhase.r + ',' + dnPhase.g + ',' + dnPhase.b + ',' + dnPhase.dark.toFixed(3) + ')';
      ctx.fillRect(dvx, dvy, dvw, dvh);
      // Sao li ti nhấp nháy (lớp không khí): xác định theo ô lưới lớn như hạt
      // linh khí, chỉ hiện khi đêm đã sâu; điểm rất nhỏ và thưa.
      if (dnPhase.night > 0.55) {
        var sCell = 110;
        var sgx0 = Math.floor(camX / sCell) - 1, sgx1 = Math.floor((camX + effW) / sCell) + 1;
        var sgy0 = Math.floor(camY / sCell) - 1, sgy1 = Math.floor((camY + effH) / sCell) + 1;
        for (var sgx = sgx0; sgx <= sgx1; sgx++) for (var sgy = sgy0; sgy <= sgy1; sgy++) {
          var sh = hash2(sgx, sgy);
          if (sh % 4 !== 0) continue;
          var sx2 = sgx * sCell + (sh % 80) + 12, sy2 = sgy * sCell + (sh % 70) + 10;
          var tw = 0.5 + 0.5 * Math.sin(tNow / 900 + sh);
          ctx.fillStyle = 'rgba(235,242,255,' + ((0.05 + 0.16 * tw) * dnPhase.night).toFixed(3) + ')';
          ctx.fillRect(sx2, sy2, 1.6, 1.6);
        }
      }
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      defR.props.forEach(function (p) {
        var pcx = (p.x + p.w / 2) * TILE;
        if (pcx < camX - 90 || pcx > camX + effW + 90) return;
        if (p.type === 'lantern') {
          var lcy = (p.y + 1) * TILE;
          if (lcy < camY - 90 || lcy > camY + effH + 90) return;
          // Quầng xuyên tâm quanh đèn lồng, nhấp nháy cùng nhịp quầng nền sẵn có.
          var lfl = 0.92 + 0.08 * Math.sin(tNow / 110 + (p.x * 7 + p.y * 13));
          var lg = null;
          try { lg = ctx.createRadialGradient(pcx, lcy, 2, pcx, lcy, 58); } catch (e) { lg = null; }
          if (lg) {
            lg.addColorStop(0, 'rgba(255,196,110,' + (0.36 * dnPhase.night * lfl).toFixed(3) + ')');
            lg.addColorStop(0.45, 'rgba(255,170,80,' + (0.16 * dnPhase.night * lfl).toFixed(3) + ')');
            lg.addColorStop(1, 'rgba(255,160,70,0)');
            ctx.fillStyle = lg;
          } else ctx.fillStyle = 'rgba(255,180,90,' + (0.10 * dnPhase.night * lfl).toFixed(3) + ')'; // ctx tối giản (harness cũ): quầng phẳng mờ thay gradient
          ctx.beginPath(); ctx.arc(pcx, lcy, 58, 0, Math.PI * 2); ctx.fill();
        } else if (p.type === 'house' || p.type === 'house_b' || p.type === 'house_c' || p.type === 'house_big' || p.type === 'inn') {
          // Ánh đèn cửa sổ nhà: XẤP XI theo neo prop (dữ liệu bản đồ không có
          // tọa độ cửa sổ riêng) — quầng ấm mềm ở thân nhà phía trên chân nhà.
          var wcy = (p.y + p.h - p.fy) * TILE - 20;
          if (wcy < camY - 80 || wcy > camY + effH + 80) return;
          var wg = null;
          try { wg = ctx.createRadialGradient(pcx, wcy, 2, pcx, wcy, 46); } catch (e) { wg = null; }
          if (wg) {
            wg.addColorStop(0, 'rgba(255,186,96,' + (0.20 * dnPhase.night).toFixed(3) + ')');
            wg.addColorStop(1, 'rgba(255,170,80,0)');
            ctx.fillStyle = wg;
          } else ctx.fillStyle = 'rgba(255,180,90,' + (0.07 * dnPhase.night).toFixed(3) + ')';
          ctx.beginPath(); ctx.arc(pcx, wcy, 46, 0, Math.PI * 2); ctx.fill();
        }
      });
      ctx.restore();
    }
    ctx.restore();
    ctx.imageSmoothingEnabled = false; // trả lại mặc định vẽ điểm ảnh cho các lớp màn hình về sau
    if (meditating) {
      ctx.fillStyle = 'rgba(160,220,255,0.10)'; ctx.fillRect(0, 0, viewW, viewH);
    }
    if (flashA > 0) { ctx.fillStyle = 'rgba(255,250,230,' + flashA + ')'; ctx.fillRect(0, 0, viewW, viewH); }
    // Đế cố định của chế độ Luôn hiện sẵn (joyMode 'on'): luôn vẽ ở góc dưới
    // trái — bán trong suốt khi không chạm; khi kéo từ đế, khối vẽ cần ở
    // dưới vẽ đè lên với độ rõ đầy đủ.
    if (joyFixedMode() && state) {
      var bp = joyBasePos();
      var baseActive = joy.state === 'stick' && Math.abs(joy.sx - bp.x) < 1 && Math.abs(joy.sy - bp.y) < 1;
      if (!baseActive) {
        ctx.beginPath(); ctx.arc(bp.x, bp.y, JOY_R, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(18,24,18,0.22)'; ctx.fill();
        ctx.strokeStyle = 'rgba(255,246,220,0.38)'; ctx.lineWidth = 2; ctx.stroke();
        ctx.beginPath(); ctx.arc(bp.x, bp.y, 26, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,246,220,0.28)'; ctx.fill();
        ctx.strokeStyle = 'rgba(40,32,20,0.35)'; ctx.lineWidth = 1.5; ctx.stroke();
      }
    }
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
    // Lớp mờ chuyển cảnh (trên cùng, hệ tọa độ màn hình) — dùng khi qua cổng ở phần 2.
    if (fade.t > 0) { ctx.fillStyle = 'rgba(8,10,8,' + fade.t + ')'; ctx.fillRect(0, 0, viewW, viewH); }
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
  function say(lines, cb) { clickPath = null; clickTarget = null; pendingInteract = null; resetJoy(); dlgQueue = lines.slice(); dlgCb = cb || null; nextLine(); }
  function nextLine() {
    if (dlgTypeTimer) { clearInterval(dlgTypeTimer); dlgTypeTimer = null; dlgTypeFull = null; }
    if (!dlgQueue.length) { stopVoice(); dlg = null; $('dialogue').classList.add('hidden'); if (dlgCb) { var cb = dlgCb; dlgCb = null; cb(); } return; }
    dlg = dlgQueue.shift();
    sfxPage();
    playVoiceFor(dlg); // tiếng bắt đầu cùng lúc chữ hiện; qua câu thì playVoiceFor dừng tiếng câu cũ
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
    startDlgTyper(textEl);
  }
  // Tốc độ chữ thoại 'Bình thường': hiện chữ dần (2 ký tự mỗi 18ms); bấm tiếp
  // khi chữ đang chạy thì hiện trọn câu trước (dlgTypeFinish), bấm nữa mới qua câu.
  function startDlgTyper(textEl) {
    if (!SET || SET.current.dlgSpeed !== 'normal' || !dlg || dlg.who === 'choice') return;
    var full = textEl.textContent;
    if (!full || full.length < 2) return;
    dlgTypeFull = full;
    textEl.textContent = '';
    var ti = 0;
    dlgTypeTimer = setInterval(function () {
      ti = Math.min(full.length, ti + 2);
      if (ti % 8 === 0) beep(1150, 0.012, 'sine', 0.006, 'ui'); // tiếng chữ chạy rất khẽ
      textEl.textContent = full.slice(0, ti);
      if (ti >= full.length) { clearInterval(dlgTypeTimer); dlgTypeTimer = null; dlgTypeFull = null; }
    }, 18);
  }
  function dlgTypeFinish() {
    if (!dlgTypeTimer) return false;
    clearInterval(dlgTypeTimer); dlgTypeTimer = null;
    var el = $('dlg-text');
    if (el && dlgTypeFull != null) el.textContent = dlgTypeFull;
    dlgTypeFull = null;
    return true;
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
      state.flags.wroteFirst = true; // nhánh [Viết chữ]: mở nhiệm vụ ẩn chứng cứ ở chương 2-4
      say(ST.SCENE_WRITE_BRANCH, function () { refreshHUD(); saveNow(); });
    } else if (action === 'voice') {
      doVoiceMoment();
    } else if (action === 'inn_work') {
      var rw = L.addLinhThach(state, 15);
      if (rw.ok) { state.flags.innWork = (state.flags.innWork || 0) + 1; toast('Làm xong một ca ở khách điếm: +15 Linh Thạch (số dư: ' + L.fmtNum(rw.balance) + ').', 3600); }
      else toast(rw.reason);
      say([{ who: 'chu_quan', text: 'Xong ca rồi đấy. Tiền của cậu đây — làm ăn với lão Chu này thì cứ yên tâm, một đồng cũng không thiếu.' }], function () { refreshHUD(); saveNow(); });
    } else if (action === 'inn_leave' || action === 'shop_leave') {
      say([{ who: 'narrate', text: 'Ngươi gật đầu chào rồi rời đi.' }], function () { refreshHUD(); saveNow(); });
    } else if (action === 'buy_dan') {
      // Vật phẩm mua vào phải qua Túi Trữ Vật: kiểm sức chứa TRƯỚC khi trừ tiền.
      var chkD = L.bagCanAdd(state, 'hoi_khi_dan', 1);
      if (!chkD.ok) { toast(chkD.reason); say(ST.SCENE_PHARMACY); return; }
      var rb = L.spendLinhThach(state, 12);
      if (rb.ok) { L.bagAdd(state, 'hoi_khi_dan', 1); sfxUi(); toast('Đã mua một viên Hồi Khí Đan (−12 Linh Thạch). Trong túi: ' + L.bagCount(state, 'hoi_khi_dan') + ' viên.', 3200); }
      else toast(rb.reason);
      refreshHUD(); saveNow();
      say(ST.SCENE_PHARMACY);
    } else if (action === 'use_dan') {
      var ru = L.bagRemove(state, 'hoi_khi_dan', 1);
      if (ru.ok) {
        state.silence = Math.min(L.SILENCE_MAX, state.silence + 25);
        toast('Đã dùng Hồi Khí Đan: hồi 25 Tĩnh Mặc (còn ' + L.bagCount(state, 'hoi_khi_dan') + ' viên).', 3200);
      } else toast('Không còn viên Hồi Khí Đan nào trong túi.');
      refreshHUD(); saveNow();
      say(ST.SCENE_PHARMACY);
    } else if (action === 'buy_kiem' || action === 'buy_ngoc') {
      var gid = action === 'buy_kiem' ? 'kiem_phong' : 'ngoc_tu_linh';
      var price = action === 'buy_kiem' ? 150 : 260;
      var gname = action === 'buy_kiem' ? 'Thanh Phong Kiếm' : 'Tụ Linh Ngọc';
      if (L.bagHas(state, gid)) { toast('Ngươi đã có ' + gname + ' trong túi rồi.'); }
      else {
        var chkG = L.bagCanAdd(state, gid, 1);
        if (!chkG.ok) { toast(chkG.reason); say(ST.SCENE_FASHOP); return; }
        var rg = L.spendLinhThach(state, price);
        if (rg.ok) { L.bagAdd(state, gid, 1); sfxQuest(); toast('Đã mua ' + gname + ' (−' + price + ' Linh Thạch) và cất vào Túi Trữ Vật. Hiệu quả có tác dụng ngay.', 3800); }
        else toast(rg.reason);
      }
      refreshHUD(); saveNow();
      say(ST.SCENE_FASHOP);
    } else if (action === 'ch4_evidence') {
      state.quest = 'q4_dieu_tra';
      say([{ who: 'narrate', text: 'Ngươi không cãi một câu. Ngươi quay lưng đi về phía kho Hứa gia ở rìa đông sân phủ — sự thật nằm ở đó, không nằm ở miệng người. (Đường im lặng: hãy kiểm tra kho và tìm nhân chứng.)' }], function () { refreshHUD(); saveNow(); });
    } else if (action === 'ch4_chan') {
      var rc = L.castWord(state, 'chan');
      if (!rc.ok) {
        // Tĩnh Mặc chưa đủ cho CHẤN: không khóa cứng — tự rơi về đường bằng chứng.
        toast(rc.reason + ' Đi đường bằng chứng vậy.');
        state.quest = 'q4_dieu_tra';
        say([{ who: 'narrate', text: 'Ngươi định cất tiếng, nhưng Tĩnh Mặc trong ngực chưa đủ nặng cho một tiếng CHẤN. Ngươi nuốt lời nói xuống, quay đi tìm bằng chứng — đường chậm hơn, nhưng chắc hơn.' }], function () { refreshHUD(); saveNow(); });
      } else {
        state.flags.usedChanCh4 = true;
        state.flags.daoNoticedVoice = true; // Trần Chính Đạo đã để ý tiếng nói bất thường
        L.recordSpeech(state, 4, 'chan-dep-vu-cao', 'thien-co-cac');
        sfxChan(); shakeT = Math.max(shakeT, 0.8);
        rings.push({ x: px + 16, y: py + 16, r: 10, a: 0.95 });
        say(ST.SCENE_CHAN_QUELL, function () { state.quest = 'q4_doi_chat'; refreshHUD(); saveNow(); });
      }
    } else if (action === 'ch5_heal') {
      var hs = L.healSoul(state);
      sfxSoul();
      rings.push({ x: px + 16, y: py + 16, r: 6, a: 0.9 });
      spawnParts(px + 16, py + 16, 16, '170,200,255', 34, true); // hào quang lạnh của hồn lực
      say(ST.SCENE_SOUL_HEAL, function () {
        var cap = L.REALMS[state.realm].tuviNext;
        if (cap) state.tuvi = cap;
        state.quest = 'q5_tiep_suc'; refreshHUD(); saveNow();
        if (hs.first) toast('Thân phận giấu kín đã thức tỉnh: Hồn Sư nhị phẩm (chỉ mình ngươi biết).', 4200);
      });
    } else if (action === 'ch5_wait' || action === 'soul_leave') {
      say([{ who: 'narrate', text: 'Ngươi gật đầu chào rồi rời đi. Chuyện này vẫn còn đó, chờ ngươi quay lại.' }], function () { refreshHUD(); saveNow(); });
    } else if (action === 'soul_work') {
      state.flags.soulPaidFor = L.chapterOfQuest(state);
      state.soulPower = (state.soulPower || 0) + 10;
      var rsw = L.addLinhThach(state, 25);
      say([{ who: 'narrate', text: 'Đêm đó, vị "Hồn Sư thần bí" lại tới và đi như một cái bóng. Sáng ra, Trần gia chuyển tới tay ngươi một túi nhỏ — tiền công của một người mà họ không hề biết chính là ngươi. (+25 Linh Thạch.)' }], function () { refreshHUD(); saveNow(); if (rsw.ok) toast('Số dư Linh Thạch: ' + L.fmtNum(rsw.balance) + '.', 3600); });
    } else if (action === 'ch5_support' || action === 'ch5_nosupport') {
      var supported = false;
      if (action === 'ch5_support') {
        var rsp = L.spendLinhThach(state, 60);
        if (rsp.ok) { supported = true; toast('Đã chi 60 Linh Thạch tiếp sức cho U Nhàn (số dư: ' + L.fmtNum(rsp.balance) + ').', 3600); }
        else toast(rsp.reason + ' — đành động viên nàng bằng lời vậy.');
      }
      state.flags.uNhanSupported = supported;
      state.quest = 'q5_u_nhan_thang';
      say([{ who: 'u_nhan', text: supported
        ? 'Cậu… cảm ơn. Có chỗ dựa thế này, trận ngày mai em không có lý do gì để thua.'
        : 'Cậu viết hay lắm. "Đi đi, ta ở phía sau nàng." — Chỉ một dòng vậy thôi mà em thấy đủ rồi. Xem em thắng đây.' }], function () { refreshHUD(); saveNow(); });
    } else if (action === 'atk_pha' || action === 'atk_chan' || action === 'atk_sword' || action === 'atk_fallback') {
      resolveAtkWave(action);
    } else if (action.indexOf('tl_') === 0) {
      resolveThangLong(action);
    } else if (action.indexOf('hht_') === 0) {
      resolveDuelHht(action);
    } else if (action.indexOf('chi_') === 0) {
      resolveChiAmbush(action);
    } else if (action.indexOf('guard_') === 0) {
      resolveGuardWave(action);
    } else if (action === 'ambush_silent') {
      say(ST.SCENE_AMBUSH_SILENT, function () { state.quest = 'q2_cong_thanh'; refreshHUD(); saveNow(); });
    } else if (action === 'ambush_chan') {
      var r = L.castWord(state, 'chan');
      if (r.ok) {
        sfxChan(); shakeT = Math.max(shakeT, 0.35);
        rings.push({ x: px + 16, y: py + 16, r: 10, a: 0.95 });
        addFloat(px + 16, py - 20, 'CHẤN!', '150,200,255');
        L.recordSpeech(state, 2, 'chan-ke-theo-doi-o-bai-phuc-kich', 'ke-theo-doi-huyet-bac-cung');
        say(ST.SCENE_AMBUSH_CHAN, function () { state.quest = 'q2_cong_thanh'; refreshHUD(); saveNow(); });
      } else {
        toast(r.reason + ' Đành lặng lẽ lùi đi.');
        say(ST.SCENE_AMBUSH_SILENT, function () { state.quest = 'q2_cong_thanh'; refreshHUD(); saveNow(); });
      }
    }
  }
  function doVoiceMoment() {
    shakeT = 1.6; flashA = 0.55; rumble();
    beep(196, 0.9, 'sine', 0.045, 'skill'); beep(392, 1.1, 'sine', 0.03, 'skill'); // dư âm chấn động dâng lên
    spawnParts(px + 16, py + 16, 16, '255,240,190', 44, false);
    rings.push({ x: px + 16, y: py + 16, r: 10, a: 0.9 });
    rings.push({ x: px + 16, y: py + 16, r: 2, a: 0.7 });
    say(ST.SCENE_VOICE, function () {
      state.flags.voiced = true;
      L.recordSpeech(state, 1, 'mo-mieng-truoc-bia-da', 'ca-tran');
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
    if (dlg) { if (dlgTypeFinish()) return; if (dlg.who !== 'choice') nextLine(); return; }
    var ft = frontTile();
    var pt = playerTile();
    var npc = npcsLive.filter(function (n) { return n.x === ft.x && n.y === ft.y; })[0];
    if (!npc) {
      // NPC đứng kề ở BẤT KỲ hướng nào cũng bắt được, không chỉ hướng đang
      // quay mặt: người chơi đi bằng chạm thường dừng lại với hướng mặt bất
      // kỳ, và một lần ấn E im lặng hoàn toàn là đúng lỗi chặn chơi đã gặp
      // ở chơi thử live 1.1.0. Bắt được thì tự quay mặt về phía NPC.
      npc = npcsLive.filter(function (n) { return Math.abs(n.x - pt.x) + Math.abs(n.y - pt.y) === 1; })[0];
      if (npc) faceTowardTile(npc.x, npc.y);
    }
    if (npc) return talkTo(npc);
    // Cổng bản đồ cũng đáp lại phím E khi đứng kề và quay mặt vào ô cổng:
    // trước đây cổng chỉ kích hoạt khi bước đúng lên hàng ô cổng, đứng sát
    // cổng ấn E là im lặng hoàn toàn (cũng là lỗi chặn chơi ở live 1.1.0).
    var defI = L.activeMap();
    for (var pi = 0; pi < defI.portals.length; pi++) {
      var poI = defI.portals[pi];
      if (ft.x >= poI.x && ft.x < poI.x + poI.w && ft.y >= poI.y && ft.y < poI.y + poI.h) {
        if (!L.portalUnlocked(state, poI)) { toast(poI.cond === 'dummy' ? 'Hãy hoàn thành chương 1 (phá cọc gỗ) trước khi rời trấn.' : (poI.lockMsg || 'Chưa thể qua cổng này lúc này.')); return; }
        switchMap(poI);
        return;
      }
    }
    var p = L.propAt(ft.x, ft.y) || L.propAt(pt.x, pt.y + 1);
    if (p && p.id === 'bia_trac_linh') return touchStele();
    if (p && p.id === 'coc_go') {
      if (state.flags.dummyBroken) return say([{ who: 'narrate', text: 'Cọc gỗ đã gãy. Tiếng nói đầu tiên của ngươi làm nó nứt từ trong lõi.' }]);
      return say([{ who: 'narrate', text: 'Cọc gỗ luyện công. ' + (state.unlocked.indexOf('voice') >= 0 ? 'Đứng gần và nhấn phím 1 để dùng Ngôn Linh "PHÁ" (cần 30 Tĩnh Mặc).' : 'Gỗ chắc thế này, tay không không làm gì được.') }]);
    }
    if (p && p.id === 'gieng') return say([{ who: 'narrate', text: 'Giếng nước đầu trấn. Nước trong, hơi mát bốc lên — linh khí quanh đây đậm hơn hẳn nơi khác.' }]);
    if (p && p.id === 'vet_tich') return touchTracks();
    if (p && p.id === 'thuoc_lon') return towerMeasure();
    if (p && p.id === 'kho_hua') {
      if (state.quest === 'q4_dieu_tra' && !state.flags.clueKho) {
        return say(ST.SCENE_KHO_CLUE, function () { state.flags.clueKho = true; refreshHUD(); saveNow(); toast('Đã có manh mối: sổ kho Hứa gia.', 3200); });
      }
      if (state.quest === 'q4_dieu_tra' && state.flags.clueKho) return say([{ who: 'narrate', text: 'Sổ kho đã nằm trong tay ngươi. Thêm lời của một nhân chứng nữa, vụ việc sẽ không còn đường chối.' }]);
      return say([{ who: 'narrate', text: 'Kho Hứa gia: gạo, vải, và mấy rương linh thảo khô khóa kín. Mọi thứ ngăn nắp — ngăn nắp tới mức bất thường.' }]);
    }
    if (p && (p.id === 'viec_go' || p.id === 'viec_nuoc' || p.id === 'viec_bao')) return doChore(p);
    if (p && p.id === 'thang_long_dai') return touchThangLong();
    if (p && p.id === 'linh_chi') return touchLinhChi();
    if (p && p.id === 'dai_truc_co') return touchDaiTrucCo();
    // Vật thể có cờ tương tác nhưng chưa có nhánh riêng ở các chương đã xây
    // (việc tạp dịch, hai đài và linh chi của chương 7-8 đều đã có nhánh
    // riêng ở ngay trên): vẫn đáp lại bằng một câu xem xét để chạm/E không
    // bao giờ "chết lặng".
    if (p && p.interact) return say([{ who: 'narrate', text: 'Ngươi xem xét ' + (p.name || 'vật này') + ' — lúc này chưa có việc gì với nó.' }]);
  }
  /* Quay mặt (4 hướng) về phía một ô — dùng cho chạm-để-tương-tác. */
  function faceTowardTile(tx, ty) {
    var pt = playerTile();
    var dx = tx - pt.x, dy = ty - pt.y;
    if (Math.abs(dx) >= Math.abs(dy) && dx !== 0) facing = dx > 0 ? 'right' : 'left';
    else if (dy !== 0) facing = dy > 0 ? 'down' : 'up';
    dir8 = L.dir8FromVector(dx, dy, dir8);
  }
  /* Ô tiêu điểm của mục tiêu khi đứng ở ô kề: ô của NPC, hoặc ô footprint
     của vật thể kề trực tiếp với ô đứng. */
  function targetFocusTile(target, stand) {
    if (target.kind === 'npc') return { x: target.x, y: target.y };
    var def = L.activeMap();
    for (var i = 0; i < def.props.length; i++) {
      var p = def.props[i];
      if (p.id !== target.id) continue;
      var footY = p.y + p.h - p.fy;
      var best = null, bestD = 1e9;
      for (var a = 0; a < p.fx; a++) for (var b = 0; b < p.fy; b++) {
        var cx = p.x + a, cy = footY + b;
        var d = Math.abs(cx - stand.x) + Math.abs(cy - stand.y);
        if (d < bestD) { bestD = d; best = { x: cx, y: cy }; }
      }
      return best || { x: p.x, y: p.y + p.h - 1 };
    }
    return { x: target.x, y: target.y };
  }
  /* Chạm/bấm thẳng vào đối tượng (lệnh Bui 12:00 ngày 2026-11-01): đang ở
     ô kề hợp lệ thì mở ngay như phím E; ở xa thì tự tìm đường tới ô kề gần
     nhất và hẹn mở khi tới nơi (pendingInteract). */
  function tapInteract(target) {
    var pt = playerTile();
    var stands = L.standTilesFor(target, npcsLive);
    var i;
    for (i = 0; i < stands.length; i++) {
      if (stands[i].x === pt.x && stands[i].y === pt.y) {
        var f0 = targetFocusTile(target, pt);
        faceTowardTile(f0.x, f0.y);
        pendingInteract = null;
        interact();
        return;
      }
    }
    var from = { x: Math.floor((px + 16) / TILE), y: Math.floor((py + 16) / TILE) };
    var best = null, bestPath = null;
    for (i = 0; i < stands.length; i++) {
      var path = L.findPath(from, stands[i], npcsLive);
      if (path && (!bestPath || path.length < bestPath.length)) { best = stands[i]; bestPath = path; }
    }
    if (!best || !bestPath) { toast('Không tìm được đường tới ' + (target.name || 'đối tượng') + '.'); return; }
    var f1 = targetFocusTile(target, best);
    clickPath = smoothPath(bestPath); clickTarget = best; medLatch = false; clickPathRaw = false; clickSegAnchor = { x: px, y: py };
    pendingInteract = { kind: target.kind, id: target.id, name: target.name || target.id, standX: best.x, standY: best.y, focusX: f1.x, focusY: f1.y };
  }
  function talkTo(npc) {
    // Điểm chạm theo nhiệm vụ/cửa hàng của chương 3 (ưu tiên hơn thoại thường).
    if (npc.id === 'thap_chu' && state.map === 'thap_noi' && state.quest === 'q3_cong_phap') return receiveManuals();
    if (npc.id === 'chu_quan' && (state.flags.innWork || 0) < 2 && L.walletOpen(state)) return say(ST.SCENE_INN);
    if (npc.id === 'duoc_su') return say(ST.SCENE_PHARMACY);
    if (npc.id === 'phap_khi_chu') return say(ST.SCENE_FASHOP);
    // Chương 4: các điểm chạm trong sân phủ Hứa và Thiên Cơ Các phân đà.
    if (npc.id === 'luc_tranh' && state.map === 'co_chau' && state.quest === 'q4_vu_cao') return say(ST.SCENE_ACCUSE);
    if (npc.id === 'luc_tranh' && state.map === 'co_chau' && state.quest === 'q4_dieu_tra') return confrontLucTranh();
    if (npc.id === 'dan_thanh_a' && state.map === 'co_chau' && state.quest === 'q4_dieu_tra' && !state.flags.clueWitness) {
      return say([
        { who: 'dan_thanh_a', text: 'Cậu Giang? Lão nghe chuyện vu cáo rồi — oan cho cậu quá. Lão nói thật nhé: ba tháng nay, cứ khuya là lão thấy cậu Lục sai người khuân bao từ kho Hứa gia ra xe ngựa.' },
        { who: 'dan_thanh_a', text: 'Cần lão ra mặt làm chứng thì lão đi. Người lặng im như cậu mà bị đổ tội, lão già này nhìn không đặng. (Đã có nhân chứng: Lão Ngô.)' }
      ], function () { state.flags.clueWitness = true; refreshHUD(); saveNow(); });
    }
    // Chương 5: Trần gia (chuyện hồn sư + dịch vụ luyện hồn kín) và trận tỉ thí.
    if (npc.id === 'tran_tu_linh' && state.map === 'co_chau' && state.quest === 'q5_hon_su' && !state.flags.soulSecret) return say(ST.SCENE_SOUL_INTRO);
    if (npc.id === 'tran_tu_linh' && state.map === 'co_chau' && L.soulServiceDue(state)) return say(ST.SCENE_SOUL_SERVICE);
    if (npc.id === 'u_nhan' && state.map === 'co_chau' && state.quest === 'q5_tiep_suc') return say(ST.SCENE_SUPPORT);
    if (npc.id === 'luc_tranh' && state.map === 'co_chau' && state.quest === 'q5_u_nhan_thang' && !state.flags.duelSeen) {
      state.flags.duelSeen = true;
      return say(state.flags.uNhanSupported ? ST.SCENE_DUEL : ST.SCENE_DUEL_HARD, function () {
        var cap = L.REALMS[state.realm].tuviNext;
        if (cap) state.tuvi = cap;
        state.quest = 'q6_sinh_le'; refreshHUD(); saveNow(); // nối thẳng sang chương 6 ngay trong phiên
        toast('Hoàn thành chương 5: Trần gia và Hồn Sư thần bí.', 4200);
      });
    }
    // Chương 6: đêm tấn công bắt đầu từ lời cảnh báo của Chính Ngôn; thư mời sau trận.
    if (npc.id === 'chinh_ngon' && state.map === 'co_chau' && state.quest === 'q6_phong_thu') {
      state.flags.atkWave = 1;
      return say(ST.SCENE_ATK_INTRO, function () { say(ST.SCENE_ATK1); });
    }
    if (npc.id === 'chinh_ngon' && state.map === 'co_chau' && state.quest === 'q6_thu_moi') {
      return say(ST.SCENE_INVITE, function () {
        state.flags.invited = true;
        state.quest = 'q6_done'; refreshHUD(); saveNow();
        toast('Hoàn thành chương 6: Năm mươi mốt vạn lượng. Cổng lên Thanh Vân Tông đã mở.', 4400);
      });
    }
    if (npc.id === 'tran_chinh_dao' && state.map === 'co_chau' && state.quest === 'q4_doi_chat') {
      return say(state.flags.usedChanCh4 ? ST.SCENE_FAREWELL4_CHAN : ST.SCENE_FAREWELL4, function () {
        state.quest = 'q5_hon_su'; refreshHUD(); saveNow(); // nối thẳng sang chương 5 ngay trong phiên
        toast('Hoàn thành chương 4: Thiên Cơ Các tới nhà.', 4200);
      });
    }
    // Chương 7: nhập tông, ghi công tạp dịch; chương 8: điều kiện Trúc Cơ,
    // cấp đan và gạch hồ sơ — mọi điểm chạm đều qua trưởng lão / quản sự /
    // Hoa Hướng Thần ở Thanh Vân Tông.
    if (npc.id === 'truong_lao_tong' && state.quest === 'q7_nhap_tong') {
      return say(ST.SCENE_NHAP_TONG, function () {
        state.flags.sectSeen = true;
        state.quest = 'q7_tap_dich'; refreshHUD(); saveNow();
      });
    }
    if (npc.id === 'tap_dich_truong' && state.quest === 'q7_tap_dich') {
      if (state.flags.choreGo && state.flags.choreNuoc && state.flags.choreBao) {
        return say(ST.SCENE_CHORES_DONE, function () {
          if (!state.flags.choresPaid) {
            var rc = L.addLinhThach(state, 45);
            if (rc.ok) { state.flags.choresPaid = true; toast('Quản sự trả công tạp dịch: +45 Linh Thạch (số dư: ' + L.fmtNum(rc.balance) + ').', 4000); }
          }
          var mt = L.addSectMerit(state, 10);
          toast('Quản sự ghi thêm điểm cống hiến tông môn: tổng ' + L.fmtNum(mt) + ' điểm.', 3600);
          state.quest = 'q7_thang_long'; refreshHUD(); saveNow();
        });
      }
      var miss = [];
      if (!state.flags.choreGo) miss.push('bổ củi ở đống củi phía nam sân');
      if (!state.flags.choreNuoc) miss.push('gánh nước ở giếng sau bếp');
      if (!state.flags.choreBao) miss.push('chuyển bao dược ở phía tây sân');
      return say([{ who: 'tap_dich_truong', text: 'Việc của ngươi chưa xong đâu. Còn thiếu: ' + miss.join('; ') + '. Làm xong cả ba rồi quay lại đây, ta ghi công điểm và trả công một thể.' }]);
    }
    if (npc.id === 'truong_lao_tong' && (state.quest === 'q7_done' || state.quest === 'q8_chuan_bi') && !state.flags.chiGathered) {
      if (state.flags.chuanBiSeen) {
        return say([{ who: 'truong_lao_tong', text: 'Linh Chi Sau Núi mọc trong rừng phía đông bắc tông, qua đường núi sau Đài Trúc Cơ. Hái mang về đây, ta mới luyện Trúc Cơ Đan cho ngươi được.' }]);
      }
      if (state.quest === 'q7_done') state.quest = 'q8_chuan_bi';
      return say(ST.SCENE_CHUAN_BI_1, function () { state.flags.chuanBiSeen = true; refreshHUD(); saveNow(); });
    }
    if (npc.id === 'truong_lao_tong' && state.quest === 'q8_chuan_bi' && state.flags.chiGathered && !state.flags.pillGranted) {
      return say(ST.SCENE_CHUAN_BI_2, function () {
        var rb = L.bagAdd(state, 'truc_co_dan', 1);
        if (!rb.ok) { toast(rb.reason + ' Hãy dọn túi rồi quay lại gặp trưởng lão.', 4200); refreshHUD(); return; }
        state.flags.pillGranted = true;
        state.quest = 'q8_ho_phap'; refreshHUD(); saveNow();
        toast('Đã nhận Trúc Cơ Đan từ trưởng lão tông. Lên Đài Trúc Cơ ở phía bắc tông để bắt đầu vận công.', 4000);
      });
    }
    if (npc.id === 'hoa_huong_than' && state.quest === 'q7_hoa_huong_than') {
      state.flags.hhtHits = 0;
      return say(ST.SCENE_HHT_INTRO, function () { say(ST.SCENE_HHT1); });
    }
    if (npc.id === 'truong_lao_tong' && state.quest === 'q8_thu_tieng') {
      return say(ST.SCENE_THU_TIENG, function () {
        if (!state.flags.sectReward) {
          var rt = L.addLinhThach(state, 30);
          if (rt.ok) { state.flags.sectReward = true; toast('Thưởng của tông môn mừng tân Trúc Cơ: +30 Linh Thạch (số dư: ' + L.fmtNum(rt.balance) + ').', 4000); }
        }
        sfxQuest();
        say(ST.SCENE_END_P2, function () {
          state.quest = 'q8_done'; refreshHUD(); saveNow();
          toast('Hoàn thành chương 8 — phần hai khép lại ở Trúc Cơ Sơ Kỳ.', 4600);
        });
      });
    }
    var pool = (state.flags.voiced ? ST.IDLE_AFTER : ST.IDLE_BEFORE)[npc.id] || ST.IDLE_AFTER[npc.id] || ST.IDLE_BEFORE[npc.id];
    if (pool) { say(pool.map(function (ln) { return { who: ln.who === 'hero' ? 'hero' : npc.id, mode: ln.mode, text: ln.text }; })); return; }
    // Chốt chặn cuối: NPC chưa có thoại riêng vẫn phải đáp lại — ấn E mà im
    // lặng hoàn toàn là lỗi chặn chơi, không phải trạng thái hợp lệ.
    say([{ who: 'narrate', text: npc.name + ' nhìn ngươi một lúc, khẽ gật đầu. Lúc này chưa có chuyện gì cần nói.' }]);
  }
  /* Sự kiện trung tâm chương 3: đặt tay lên thước pha lê lớn trong sảnh tháp. */
  function towerMeasure() {
    if (state.quest !== 'q3_thuoc_do') {
      return say([{ who: 'narrate', text: state.flags.measured
        ? 'Thước pha lê lớn đứng im lìm giữa sảnh. Chín vạch màu khắc trên thân thước — và khoảng trống phía trên vạch cao nhất, nơi gợn sáng của ngươi từng vượt qua.'
        : 'Thước pha lê lớn đứng im lìm giữa sảnh, chín vạch màu khắc dọc thân thước. Chưa tới lượt của ngươi.' }]);
    }
    sfxThuoc();
    rings.push({ x: px + 16, y: py - 10, r: 8, a: 0.9 });
    spawnParts(px + 16, py - 20, 20, '200,240,255', 36, true);
    var finishMeasure = function () {
      say(ST.SCENE_MEASURE, function () {
        state.flags.measured = true;
        var cap = L.REALMS[state.realm].tuviNext;
        if (cap) state.tuvi = cap; // chấn động thông kinh mạch: tu vi đầy tầng
        if (!state.flags.thuocReward) {
          var r = L.addLinhThach(state, 30);
          if (r.ok) { state.flags.thuocReward = true; toast('Tháp thưởng lệ phá kỷ lục: +30 Linh Thạch (số dư: ' + L.fmtNum(r.balance) + ').', 4200); }
        }
        state.quest = 'q3_cong_phap';
        refreshHUD(); saveNow();
      });
    };
    if (!state.flags.voiced) {
      // Điểm ép mở miệng muộn: người chơi đi nhánh im lặng tới tận tháp —
      // chấn động mạnh hơn vì Tĩnh Mặc dồn nén lâu hơn (giữ nguyên 100).
      say(ST.SCENE_TOWER_FORCED, function () {
        state.flags.voiced = true;
        L.recordSpeech(state, 3, 'ep-mo-mieng-tai-thap', 'ca-thap');
        if (state.unlocked.indexOf('voice') < 0) state.unlocked.push('voice');
        shakeT = 1.6; flashA = 0.5; rumble();
        finishMeasure();
      });
    } else finishMeasure();
  }
  /* Đối chất Lục Tranh (chương 4): đủ bằng chứng thì lật vụ việc tại chỗ.
     Bằng chứng chương 2 (cờ evidence) cho bản đối chất mạnh, khép kín hơn. */
  function confrontLucTranh() {
    var strong = !!state.flags.evidence;
    var standard = state.flags.clueKho && state.flags.clueWitness;
    if (!strong && !standard) {
      var missing = !state.flags.clueKho ? 'sổ kho Hứa gia ở rìa đông sân phủ' : 'lời của nhân chứng Lão Ngô ở phố chính';
      return say([{ who: 'luc_tranh', text: 'Sao, tới cãi tay đôi với ta à? Không có bằng chứng thì đừng hòng ai tin ngươi. Ta chờ đấy.' },
        { who: 'narrate', text: 'Lời của hắn chưa đủ ngã ngũ. Ngươi còn thiếu: ' + missing + '.' }]);
    }
    sfxBell();
    say(strong ? ST.SCENE_CONFRONT_STRONG : ST.SCENE_CONFRONT, function () {
      var cap = L.REALMS[state.realm].tuviNext;
      if (cap) state.tuvi = cap; // tâm cảnh thông suốt sau khi rửa oan: tu vi đầy tầng
      if (!state.flags.thienCoPaid) {
        var r = L.addLinhThach(state, 40);
        if (r.ok) { state.flags.thienCoPaid = true; toast('Thiên Cơ Các trả công điều tra: +40 Linh Thạch (số dư: ' + L.fmtNum(r.balance) + ').', 4200); }
      }
      state.quest = 'q4_doi_chat';
      refreshHUD(); saveNow();
    });
  }
  /* Phòng thủ phủ Hứa (chương 6): ba đợt tấn công, mỗi đợt người chơi tự
     chọn cách đánh qua cơ chế thật (Ngôn Linh tốn Tĩnh Mặc thật, kiếm quyết,
     hoặc lùi gọi người). Tĩnh Mặc cạn thì vẫn còn đường kiếm và đường lùi —
     tuyệt đối không khóa cứng. */
  function resolveAtkWave(action) {
    var wave = state.flags.atkWave || 1;
    var resolved = false, line = null;
    if (action === 'atk_pha' || action === 'atk_chan') {
      var word = action === 'atk_pha' ? 'pha' : 'chan';
      var rw = L.castWord(state, word);
      if (!rw.ok) {
        toast(rw.reason + ' Hãy chọn cách khác cho đợt này.');
        say(ST['SCENE_ATK' + wave]); // hiện lại đợt hiện tại để chọn lại
        return;
      }
      if (word === 'pha') { sfxPha(); rings.push({ x: px + 16, y: py + 16, r: 8, a: 0.95 }); }
      else { sfxChan(); shakeT = Math.max(shakeT, 0.6); rings.push({ x: px + 16, y: py + 16, r: 10, a: 0.95 }); }
      L.recordSpeech(state, 6, word + '-phong-thu-dot-' + wave, 'phu-hua');
      spawnParts(px + 16, py + 16, 10, '200,200,210', 30, false); // bụi đá của sân phủ
      resolved = true;
      line = { who: 'narrate', text: word === 'pha'
        ? 'Một tiếng PHÁ nổ giữa sân — đợt địch bị hất văng khỏi thềm, đao kiếm rơi loảng xoảng.'
        : 'Tiếng CHẤN rung chuyển cả phủ — đợt địch ôm tai ngã khuỵu, đội hình tan nát.' };
    } else if (action === 'atk_sword') {
      var rs = L.castSword(state);
      if (!rs.ok) { toast(rs.reason); say(ST['SCENE_ATK' + wave]); return; }
      sfxSword();
      spawnParts(px + 16, py + 16, 8, '190,235,200', 26, false);
      resolved = true;
      line = { who: 'narrate', text: 'Thất Tinh Kiếm Quyết lóe lên bảy đường sáng — đợt địch bị chém lui, không tên nào qua được thềm chính đường.' };
    } else if (action === 'atk_fallback') {
      state.flags.atkFallback = true;
      sfxBell(); // chuông báo động của phủ
      resolved = true;
      line = { who: 'narrate', text: 'Ngươi lùi vào trong, chuông báo động rung lên — gia nhân cầm đuốc kéo ra, U Nhàn xách kiếm lao tới. Đợt địch bị đẩy lui trong hỗn loạn, nhưng thế trận của phủ đã rối.' };
    }
    if (!resolved) return;
    if (wave < 3) {
      state.flags.atkWave = wave + 1;
      say([line].concat(ST['SCENE_ATK' + (wave + 1)]), function () { refreshHUD(); saveNow(); });
    } else {
      say([line].concat(ST.SCENE_ATK_END), function () {
        var cap = L.REALMS[state.realm].tuviNext;
        if (cap) state.tuvi = cap;
        if (!state.flags.hbcPaid) {
          var r = L.addLinhThach(state, 35);
          if (r.ok) { state.flags.hbcPaid = true; toast('Hứa gia tạ ơn: +35 Linh Thạch (số dư: ' + L.fmtNum(r.balance) + ').', 4000); }
        }
        state.flags.atkWave = 0;
        state.quest = 'q6_thu_moi';
        refreshHUD(); saveNow();
      });
    }
  }
  /* ---------- Chương 7-8: tạp dịch, Thăng Long Đạo, tỉ thí, hộ pháp, Trúc Cơ ---------- */
  var CHORE_DEFS = {
    viec_go: { flag: 'choreGo', scene: 'SCENE_CHORE_GO', done: 'Đống củi đã bổ xong, xếp ngay ngắn bên bếp. Việc này không cần làm lại.', idle: 'Đống củi cần bổ ở khu tạp dịch. Củi khô chất cao, chiếc rìu dựng sẵn bên cạnh — việc này thuộc phần tạp dịch của đệ tử mới.' },
    viec_nuoc: { flag: 'choreNuoc', scene: 'SCENE_CHORE_NUOC', done: 'Mấy thùng nước đã gánh đầy, để ngay ngắn sau bếp. Việc này không cần làm lại.', idle: 'Giếng nước sau bếp của khu tạp dịch. Thùng và đòn gánh dựng sẵn bên thành giếng — việc này thuộc phần tạp dịch của đệ tử mới.' },
    viec_bao: { flag: 'choreBao', scene: 'SCENE_CHORE_BAO', done: 'Các bao dược đã chuyển vào kho, xếp theo hàng. Việc này không cần làm lại.', idle: 'Mấy bao dược chất ở phía tây sân tạp dịch, chờ người chuyển vào kho — việc này thuộc phần tạp dịch của đệ tử mới.' }
  };
  function doChore(p) {
    var def = CHORE_DEFS[p.id];
    if (!def) return;
    if (state.map === 'thanh_van_tong' && state.quest === 'q7_tap_dich' && !state.flags[def.flag]) {
      return say(ST[def.scene], function () {
        state.flags[def.flag] = true;
        var total = L.addSectMerit(state, 5);
        toast('+5 điểm cống hiến tông môn (tổng: ' + L.fmtNum(total) + ').', 3200);
        if (state.flags.choreGo && state.flags.choreNuoc && state.flags.choreBao) toast('Đã xong cả ba việc tạp dịch — về gặp quản sự tạp dịch ở sân đông nam để ghi công và nhận công.', 4400);
        refreshHUD(); saveNow();
      });
    }
    if (state.flags[def.flag]) return say([{ who: 'narrate', text: def.done }]);
    return say([{ who: 'narrate', text: def.idle }]);
  }
  /* Thăng Long Đạo (chương 7): hình chiếu chỉ chịu đúng ba chiêu kiếm theo
     đúng bài — đáp án từng vòng khớp gợi ý trong cảnh của đội biên kịch.
     Cất tiếng là dừng thử thách ngay (không khóa cứng: tương tác lại đài
     là làm lại từ vòng đầu). */
  function startThangLong() {
    state.flags.tlRound = 1; state.flags.tlHits = 0;
    sfxWind(); sfxBell();
    spawnParts(px + 16, py - 10, 14, '200,235,255', 30, true); // hạt sáng bốc lên quanh đài
    say(ST.SCENE_TL_INTRO, function () { say(ST.SCENE_TL1); });
  }
  function touchThangLong() {
    if (state.quest === 'q7_thang_long') return startThangLong();
    return say([{ who: 'narrate', text: 'Đài Thăng Long ở đầu tây bắc tông môn: nền đá khắc đầy vết kiếm cũ, gió núi quất qua không ngớt. Tương truyền hình chiếu của Liễu Khuynh Tiên — con gái tông chủ — vẫn chờ người thách đấu ở đây, và chỉ nhận đúng ba chiêu kiếm.' }]);
  }
  var TL_ANSWERS = { 1: 'tl_thiem', 2: 'tl_phong', 3: 'tl_dao' };
  var TL_LINES = {
    1: { hit: 'Ngươi lách người né trọn đường chém từ trên cao — hình chiếu khựng lại giữa không trung. Chiêu đầu: trúng bài.', miss: 'Đòn đáp không trúng bài — hình chiếu lướt qua kiếm của ngươi như nước qua đá. Chiêu đầu coi như hỏng.' },
    2: { hit: 'Kiếm của ngươi dựng thành một màn phong ngự kín không kẽ hở — kiếm vũ của hình chiếu đập vào rồi tan. Chiêu hai: trúng bài.', miss: 'Màn ngự hở một nhịp — một vệt kiếm vũ xuyên qua, vai áo ngươi rách một đường. Chiêu hai coi như hỏng.' },
    3: { hit: 'Hai thanh kiếm chạm nhau đúng một điểm toàn lực — tiếng kim loại vang khắp đài, hình chiếu lùi nửa bước rồi gật đầu. Chiêu ba: trúng bài.', miss: 'Nhát đối chém lệch nửa tấc — kiếm của ngươi bị gạt sang bên, hình chiếu thu kiếm đứng yên. Chiêu ba coi như hỏng.' }
  };
  function resolveThangLong(action) {
    if (action === 'tl_voice') {
      say(ST.SCENE_TL_VOICE, function () {
        state.flags.tlRound = 0; state.flags.tlHits = 0;
        refreshHUD(); saveNow();
      });
      return;
    }
    var round = state.flags.tlRound || 1;
    var rs = L.castSword(state);
    if (!rs.ok) { toast(rs.reason); say(ST['SCENE_TL' + round]); return; }
    sfxSword();
    spawnParts(px + 16, py - 12, 10, '190,235,200', 30, true);
    addFloat(px + 16, py - 24, 'KIẾM ' + rs.power, '190,235,200');
    var hit = action === TL_ANSWERS[round];
    if (hit) state.flags.tlHits = (state.flags.tlHits || 0) + 1;
    var line = { who: 'narrate', text: TL_LINES[round][hit ? 'hit' : 'miss'] };
    if (round < 3) {
      state.flags.tlRound = round + 1;
      say([line].concat(ST['SCENE_TL' + (round + 1)]), function () { refreshHUD(); saveNow(); });
    } else {
      state.flags.tlRound = 0;
      var winScene = (state.flags.tlHits || 0) >= 3 ? ST.SCENE_TL_WIN : ST.SCENE_TL_WIN_HARD;
      say([line].concat(winScene), function () {
        say(ST.SCENE_TL_LIEU, function () {
          var cap = L.REALMS[state.realm].tuviNext;
          if (cap) state.tuvi = cap; // thắng hình chiếu: kinh mạch thông suốt, tu vi đầy tầng
          state.soulPower = (state.soulPower || 0) + 30; // hồn lực tiến một nấc sau trận đấu bằng kiếm thuần túy
          var mt = L.addSectMerit(state, 20);
          state.quest = 'q7_hoa_huong_than';
          refreshHUD(); saveNow();
          toast('Thăng Long Đạo: đã thắng hình chiếu. +20 điểm cống hiến tông môn (tổng: ' + L.fmtNum(mt) + ').', 4200);
        });
      });
    }
  }
  /* Tỉ thí Hoa Hướng Thần (chương 7): ba đợt, mẫu resolveAtkWave — Ngôn
     Linh qua castWord thật (thiếu Tĩnh Mặc thì chọn lại, không khóa cứng),
     kiếm quyết qua castSword, giữ thế thì tích Tĩnh Mặc bằng im lặng. */
  function resolveDuelHht(action) {
    var round = (state.flags.hhtHits || 0) + 1;
    if (round > 3) round = 3;
    var line = null;
    if (action === 'hht_pha' || action === 'hht_chan') {
      var word = action === 'hht_pha' ? 'pha' : 'chan';
      var rw = L.castWord(state, word);
      if (!rw.ok) { toast(rw.reason + ' Hãy chọn cách khác cho đợt này.'); say(ST['SCENE_HHT' + round]); return; }
      if (word === 'pha') { sfxPha(); rings.push({ x: px + 16, y: py + 16, r: 8, a: 0.95 }); addFloat(px + 16, py - 20, 'PHÁ!', '255,120,90'); }
      else { sfxChan(); shakeT = Math.max(shakeT, 0.5); rings.push({ x: px + 16, y: py + 16, r: 10, a: 0.95 }); addFloat(px + 16, py - 20, 'CHẤN!', '150,200,255'); }
      L.recordSpeech(state, 7, word + '-ti-thi-hoa-huong-than-dot-' + round, 'thanh-van-tong');
      line = { who: 'narrate', text: word === 'pha'
        ? 'Một tiếng PHÁ nổ giữa quảng trường — Hoa Hướng Thần trượt lui hai bước, mũi kiếm của hắn chúc xuống đất.'
        : 'Tiếng CHẤN rung cả quảng trường tông — Hoa Hướng Thần ôm ngực lùi lại, sắc mặt lần đầu biến đổi.' };
    } else if (action === 'hht_sword') {
      var rs = L.castSword(state);
      if (!rs.ok) { toast(rs.reason); say(ST['SCENE_HHT' + round]); return; }
      sfxSword();
      spawnParts(px + 16, py + 16, 8, '190,235,200', 26, false);
      addFloat(px + 16, py - 20, 'KIẾM!', '190,235,200');
      line = { who: 'narrate', text: 'Thất Tinh Kiếm Quyết lóe bảy đường sáng — Hoa Hướng Thần phải dồn toàn lực mới đỡ trọn, bước chân đã loạn.' };
    } else if (action === 'hht_hold') {
      state.silence = L.silenceGain('meditate', 2, state.silence);
      line = { who: 'narrate', text: 'Ngươi lùi nửa bước, thu kiếm giữ thế, hơi thở chìm xuống — Tĩnh Mặc trong ngực lại đầy thêm một nấc. Hoa Hướng Thần không dám khinh suất áp sát.' };
    }
    if (!line) return;
    state.flags.hhtHits = round;
    if (round < 3) {
      say([line].concat(ST['SCENE_HHT' + (round + 1)]), function () { refreshHUD(); saveNow(); });
    } else {
      say([line].concat(ST.SCENE_HHT_END), function () {
        var cap = L.REALMS[state.realm].tuviNext;
        if (cap) state.tuvi = cap;
        var mt = L.addSectMerit(state, 30);
        state.quest = 'q7_done';
        refreshHUD(); saveNow();
        toast('Hoàn thành chương 7: Vào Thanh Vân Tông với thân phận vô linh căn. +30 điểm cống hiến tông môn (tổng: ' + L.fmtNum(mt) + ').', 4600);
      });
    }
  }
  /* Linh Chi Sau Núi (chương 8): phục kích của Huyết Bạc Cung ngay sau khi
     hái. Cả ba đường đều qua được — đường CHẤN thiếu Tĩnh Mặc thì rơi về
     ẩn nấp, không khóa cứng; hái thành công mới đặt cờ chiGathered. */
  function touchLinhChi() {
    if (state.flags.chiGathered) {
      return say([{ who: 'narrate', text: 'Cụm Linh Chi Sau Núi đã được hái. Gốc rễ còn nằm trong khe đá ẩm — vài năm nữa mới lại có một cụm mới.' }]);
    }
    if (state.quest === 'q8_chuan_bi' && state.flags.chuanBiSeen) {
      return say(ST.SCENE_CHI_GATHER, function () { say(ST.SCENE_CHI_AMBUSH); });
    }
    return say([{ who: 'narrate', text: 'Trong khe đá ẩm sau núi, một cụm nấm đỏ sẫm tỏa linh khí nhè nhẹ — Linh Chi quý của Thanh Vân Tông. Đừng hái bừa: hãy gặp trưởng lão tông ở Thanh Vân Đại Điện nhận điều kiện Trúc Cơ trước đã.' }]);
  }
  function resolveChiAmbush(action) {
    var line = null;
    if (action === 'chi_sword') {
      var rs = L.castSword(state);
      if (!rs.ok) { toast(rs.reason); say(ST.SCENE_CHI_AMBUSH); return; }
      sfxSword();
      spawnParts(px + 16, py + 16, 8, '190,235,200', 26, false);
      addFloat(px + 16, py - 20, 'KIẾM!', '190,235,200');
      line = { who: 'narrate', text: 'Thất Tinh Kiếm Quyết chém đứt đường lao của bóng đen — hắn ôm vai lùi vào rừng, vệt đỏ thẫm trên tay áo lóe lên rồi mất hút.' };
    } else if (action === 'chi_chan') {
      var rw = L.castWord(state, 'chan');
      if (rw.ok) {
        sfxChan(); shakeT = Math.max(shakeT, 0.5);
        rings.push({ x: px + 16, y: py + 16, r: 10, a: 0.95 });
        addFloat(px + 16, py - 20, 'CHẤN!', '150,200,255');
        L.recordSpeech(state, 8, 'chan-sau-nui', 'huyet-bac-cung');
        line = { who: 'narrate', text: 'Một tiếng CHẤN nổ giữa rừng sau núi — bóng đen ôm tai loạng choạng, quay đầu bỏ chạy vào sâu trong rừng.' };
      } else {
        line = { who: 'narrate', text: 'Ngươi định cất tiếng, nhưng Tĩnh Mặc trong ngực chưa đủ nặng cho một tiếng CHẤN. Ngươi nuốt lời nói xuống, lăn người vào bóng cây — bóng đen vồ hụt vào khoảng trống, chém phải thân cây rồi biến mất.' };
      }
    } else if (action === 'chi_hide') {
      line = { who: 'narrate', text: 'Ngươi nín thở, ép mình vào sau thân cây lớn. Mười tám năm im lặng dạy ngươi cách biến mất giỏi hơn bất kỳ ai — bóng đen lùng sục một vòng rồi tan vào rừng.' };
    }
    if (!line) return;
    say([line].concat(ST.SCENE_CHI_END), function () {
      var rb = L.bagAdd(state, 'linh_chi', 2);
      if (rb.ok) {
        state.flags.chiGathered = true;
        toast('Đã hái Linh Chi Sau Núi ×2 — mang về Thanh Vân Đại Điện cho trưởng lão tông.', 3800);
      } else {
        toast(rb.reason + ' Linh chi vẫn còn ở sau núi — hãy dọn túi rồi quay lại hái.', 4400);
      }
      refreshHUD(); saveNow();
    });
  }
  /* Hộ pháp trong im lặng (chương 8): ba đợt quấy phá quanh đài trong lúc
     vận công. Cất tiếng là vận công vỡ — làm lại từ đầu, Trúc Cơ Đan chưa
     nuốt nên không mất gì. Đã vỡ một lần thì vào thẳng đợt đầu, bỏ intro. */
  function startGuard() {
    sfxWind();
    if ((state.flags.guardBroken || 0) > 0) {
      state.flags.guardWave = 1;
      say(ST.SCENE_GUARD1);
      return;
    }
    sfxBell(); // chuông báo động của tông khi bắt đầu vận công
    say(ST.SCENE_GUARD_INTRO, function () {
      state.flags.guardWave = 1;
      say(ST.SCENE_GUARD1);
      refreshHUD(); saveNow();
    });
  }
  function touchDaiTrucCo() {
    if (state.quest === 'q8_ho_phap') return startGuard();
    if (state.quest === 'q8_truc_co') return doTrucCo();
    return say([{ who: 'narrate', text: 'Đài Trúc Cơ ở phía bắc tông môn: nền đá tròn khắc vòng trận văn cổ, linh khí quanh đài đậm đặc tới mức nhìn thấy được bằng mắt thường. Đây là nơi đệ tử Thanh Vân Tông bước qua mốc tu vi lớn đầu tiên của đời mình.' }]);
  }
  function resolveGuardWave(action) {
    if (action === 'guard_voice') {
      say(ST.SCENE_GUARD_VOICE, function () {
        state.flags.guardBroken = (state.flags.guardBroken || 0) + 1;
        state.flags.guardWave = 0;
        refreshHUD(); saveNow();
        toast('Vận công đã vỡ vì một tiếng nói. Hãy tương tác lại Đài Trúc Cơ để vận công lại từ đầu — Trúc Cơ Đan vẫn còn nguyên.', 4600);
      });
      return;
    }
    var wave = state.flags.guardWave || 1;
    var line = null;
    if (action === 'guard_dong') {
      spawnParts(px + 52, py + 16, 10, '255,210,140', 30, false); // đuốc và người ứng cứu ở phía đông đài
      line = { who: 'narrate', text: 'Phía đông đài, Hứa U Nhàn dẫn gia nhân Hứa gia giương đuốc chặn đường — bóng đen bị ánh lửa ép lui khỏi thềm đá.' };
    } else if (action === 'guard_hoa') {
      sfxSword();
      spawnParts(px + 16, py + 16, 8, '190,235,200', 26, false);
      line = { who: 'narrate', text: 'Hoa Hướng Thần rút kiếm đứng chắn trước đài — kiếm quang của đại đệ tử quét một vòng, đợt quấy phá bị chém lui không còn một bóng.' };
    } else if (action === 'guard_tam') {
      rings.push({ x: px + 16, y: py + 16, r: 6, a: 0.9 }); // vòng hào quang giữ tâm, như lúc thổ nạp
      line = { who: 'narrate', text: 'Liễu Khuynh Tiên ngồi xuống phía sau đài, tiếng đàn trầm giữ nhịp hơi thở cho ngươi — tâm cảnh vững như mặt hồ, đợt quấy phá tan dần trong tiếng đàn.' };
    }
    if (!line) return;
    if (wave < 3) {
      state.flags.guardWave = wave + 1;
      say([line].concat(ST['SCENE_GUARD' + (wave + 1)]), function () { refreshHUD(); saveNow(); });
    } else {
      state.flags.guardWave = 0;
      say([line].concat(ST.SCENE_GUARD_END), function () {
        var cap = L.REALMS[state.realm].tuviNext;
        if (cap) state.tuvi = cap; // vận công trọn ba đợt: tu vi đầy tầng, sẵn sàng nuốt đan
        state.quest = 'q8_truc_co';
        refreshHUD(); saveNow();
        toast('Hộ pháp đã xong ba đợt trong im lặng tuyệt đối. Giờ là lúc nuốt Trúc Cơ Đan.', 4200);
      });
    }
  }
  /* Đột phá Trúc Cơ (chương 8): qua tryBreakthrough sẵn có — điều kiện lần
     lượt nói rõ thiếu gì, đan chỉ bị trừ khi mọi điều kiện đã đủ. */
  function doTrucCo() {
    if (state.realm >= 2) {
      // Lưới cứu save đã lỡ lên Trúc Cơ bằng nút đột phá thường trước khi
      // có lớp chặn ở doBreakthrough: cảnh giới đã qua mốc nhưng nhiệm vụ
      // q8_truc_co còn dở dang — cho hoàn tất nghi lễ ngay tại đài (phát
      // lại cảnh Trúc Cơ và câu cất lời của mốc này, ghi sổ lời nói nếu
      // chưa từng ghi) để chuỗi chương 8 vẫn khép được tới q8_thu_tieng.
      // Không trừ đan, không cấp thưởng ở bước này: khoản thưởng tông 30
      // Linh Thạch vẫn nằm ở cảnh thu tiếng với trưởng lão, chống trùng
      // bằng cờ sectReward như luồng chính thống.
      if (state.quest === 'q8_truc_co') {
        sfxBigBell();
        pillarT = 2.8; // cột sáng lớn của mốc Trúc Cơ
        spawnParts(px + 16, py + 24, 40, '255,232,160', 34, true);
        rings.push({ x: px + 16, y: py + 16, r: 8, a: 0.95 }); // vòng sóng vàng lớn — Thiên Đạo Ấn của mốc mới
        rings.push({ x: px + 16, y: py + 16, r: 3, a: 0.85 });
        shakeT = Math.max(shakeT, 0.8);
        var daGhiSoTrucCo = (state.spokeLedger || []).some(function (e) { return e && e.ctx === 'loi-dau-o-truc-co'; });
        if (!daGhiSoTrucCo) L.recordSpeech(state, 8, 'loi-dau-o-truc-co', 'thanh-van-tong');
        say(ST.SCENE_TRUC_CO, function () {
          state.quest = 'q8_thu_tieng';
          refreshHUD(); saveNow();
          toast('Nghi lễ Trúc Cơ đã hoàn tất tại đài. Về đại điện gặp trưởng lão tông.', 4600);
        });
        refreshHUD();
        return;
      }
      return say([{ who: 'narrate', text: 'Ngươi đã là tu sĩ Trúc Cơ. Đài đá dưới chân vẫn còn ấm dư âm của lần đột phá ấy.' }]);
    }
    if (!(state.realm === 1 && state.stage === 8)) return say([{ who: 'narrate', text: 'Tu vi của ngươi chưa tới Luyện Khí tầng chín viên mãn — chưa thể nghĩ tới Trúc Cơ. Hãy tu luyện tiếp cho tới khi tầng chín đầy hẳn.' }]);
    var cap = L.REALMS[state.realm].tuviNext;
    if (cap && state.tuvi < cap) {
      toast('Tu vi hiện tại: ' + Math.floor(state.tuvi) + '/' + cap + '.', 3600);
      return say([{ who: 'narrate', text: 'Tu vi chưa đầy. Hãy thổ nạp ở điểm linh khí của tông — sân tông phía tây nam quảng trường (điểm linh khí ở phía tây sân luyện) — cho đầy hẳn rồi quay lại đài.' }]);
    }
    if (!L.bagHas(state, 'truc_co_dan')) return say([{ who: 'narrate', text: 'Ngươi chưa có Trúc Cơ Đan trong túi. Về Thanh Vân Đại Điện gặp trưởng lão tông — đan của ngươi đang chờ ở đó.' }]);
    var rm = L.bagRemove(state, 'truc_co_dan', 1);
    if (!rm.ok) { toast(rm.reason); return; }
    var r = L.tryBreakthrough(state);
    if (!r.ok) {
      L.bagAdd(state, 'truc_co_dan', 1); // hoàn lại đan: không mất vật phẩm vì một lần đột phá hụt
      toast(r.reason);
      refreshHUD(); saveNow();
      return;
    }
    sfxBigBell();
    pillarT = 2.8; // cột sáng lớn của mốc Trúc Cơ
    spawnParts(px + 16, py + 24, 40, '255,232,160', 34, true);
    rings.push({ x: px + 16, y: py + 16, r: 8, a: 0.95 }); // vòng sóng vàng lớn — Thiên Đạo Ấn của mốc mới
    rings.push({ x: px + 16, y: py + 16, r: 3, a: 0.85 });
    shakeT = Math.max(shakeT, 0.8);
    L.recordSpeech(state, 8, 'loi-dau-o-truc-co', 'thanh-van-tong');
    say(ST.SCENE_TRUC_CO, function () {
      state.quest = 'q8_thu_tieng';
      refreshHUD(); saveNow();
      toast('Đột phá thành công: ' + r.label + '! Về đại điện gặp trưởng lão tông.', 4600);
    });
    refreshHUD();
  }

  /* Nhận Thanh Phong Chân Kinh + Thất Tinh Kiếm Quyết từ chủ trì tháp. */
  function receiveManuals() {
    sfxQuest();
    say(ST.SCENE_MANUALS, function () {
      if (state.unlocked.indexOf('thanh_phong') < 0) state.unlocked.push('thanh_phong');
      if (state.unlocked.indexOf('that_tinh') < 0) state.unlocked.push('that_tinh');
      var cap = L.REALMS[state.realm].tuviNext;
      if (cap) state.tuvi = cap; // lĩnh hội công pháp: tu vi đầy tầng
      state.quest = 'q4_thien_co'; // nối thẳng sang chương 4 ngay trong phiên (không chờ nạp lại save)
      // Mốc mở khóa Túi Trữ Vật (chương 3 — xem docs/part2-design.md): tháp
      // tặng kèm hai quyển công pháp; từ đây nút Túi mới xuất hiện.
      var bagNew = !state.flags.bagUnlocked;
      state.flags.bagUnlocked = true;
      spawnParts(px + 16, py + 16, 18, '190,235,200', 30, true);
      refreshHUD(); saveNow();
      toast('Hoàn thành chương 3: Thước pha lê vượt cửu phẩm.', 4200);
      if (bagNew) setTimeout(function () { toast('Đã mở khóa Túi Trữ Vật — bấm nút Túi hoặc phím I để xem vật phẩm.', 4600); }, 4300);
    });
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
    sfxPha();
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
        sfxCrack(true);
        spawnParts(d.x * TILE + 16, d.y * TILE + 16, 14, '210,180,130', 40, false); // mảnh gỗ văng
        state.flags.dummyBroken = true; shakeT = 0.7;
        if (state.quest === 'q_dummy') state.quest = 'q2_len_duong'; // nối thẳng sang chương 2
        say(ST.SCENE_DUMMY_DONE, function () {
          refreshHUD(); saveNow();
          // Dòng thoại lộ phí của trưởng lão, rồi mới cộng Linh Thạch vào ví.
          say([{ who: 'narrate', text: 'Trưởng lão trắc linh lặng lẽ dúi vào tay ngươi một túi nhỏ: "Năm mươi viên Linh Thạch — lộ phí lên đường tới Kiểm Trắc Tháp. Ngươi đã bước vào đường tu tiên; từ nay, tiền của giới tu tiên mới là tiền của ngươi. Đi đi, đừng lỡ kỳ kiểm trắc."' }], function () { grantLinhGift(false); });
        });
      } else {
        sfxCrack(false);
        spawnParts(d.x * TILE + 16, d.y * TILE + 16, 5, '210,180,130', 26, false);
        toast('Cọc gỗ nứt ra! Còn chịu được khoảng ' + state._dummyHp + ' uy lực. Tĩnh Mặc đã dùng: ' + before + ' → ' + state.silence + '.');
      }
    }
    refreshHUD(); saveNow();
  }
  function castChan() {
    if (dlg) return;
    var r = L.castWord(state, 'chan');
    if (!r.ok) { toast(r.reason); return; }
    sfxChan();
    rings.push({ x: px + 16, y: py + 16, r: 10, a: 0.95 });
    rings.push({ x: px + 16, y: py + 16, r: 3, a: 0.8 });
    addFloat(px + 16, py - 20, 'CHẤN!', '150,200,255');
    shakeT = Math.max(shakeT, 0.35); // rung nhẹ — chỉ hiệu ứng trình diễn
    refreshHUD(); saveNow();
  }
  /* Kiếm quyết (chương 3): đòn vật lý không tốn Tĩnh Mặc, không ghi sổ lời
     nói. Đánh vào cọc gỗ thì nứt như mọi đòn nhưng không làm cọc đổ hẳn —
     cọc gỗ của trấn vẫn là việc của một lời PHÁ. */
  function castSword() {
    if (dlg) return;
    var r = L.castSword(state);
    if (!r.ok) { toast(r.reason); return; }
    sfxSword();
    addFloat(px + 16, py - 20, 'KIẾM!', '190,235,200');
    var cx = Math.floor((px + 16) / TILE), cy = Math.floor((py + 16) / TILE);
    var def = L.activeMap();
    for (var i = 0; i < def.props.length; i++) {
      var p = def.props[i];
      if (p.type !== 'dummy') continue;
      if (Math.abs(p.x - cx) + Math.abs(p.y - cy) > 3) continue;
      addFloat(p.x * TILE + 16, p.y * TILE - 10, '-' + r.power, '190,235,200');
      sfxCrack(false);
      spawnParts(p.x * TILE + 16, p.y * TILE + 16, 4, '210,180,130', 24, false);
      if (p.id === 'coc_go' && !state.flags.dummyBroken) {
        state._dummyHp = Math.max(1, (state._dummyHp == null ? 40 : state._dummyHp) - r.power);
        toast('Cọc gỗ nứt nặng nhưng chưa đổ (còn 1). Nhát cuối của cọc này vẫn phải là một lời PHÁ.');
      }
    }
    refreshHUD(); saveNow();
  }
  function doBreakthrough() {
    if (dlg) return;
    // Chặn ở nguồn tại biên đại cảnh giới Luyện Khí tầng 9 -> Trúc Cơ: nâng
    // đại cảnh giới là sự kiện truyện tại Đài Trúc Cơ (docs/realm-prep/),
    // không phải nút bấm thường. Chuỗi chương 8 chưa khép (chưa tới
    // q8_done) thì nút Đột phá/phím B không được qua mặt Trúc Cơ Đan và
    // vòng hộ pháp ở đài — nếu không, nhiệm vụ q8_truc_co kẹt vĩnh viễn
    // vì nó chỉ hoàn tất trong luồng doTrucCo tại đài. Mọi tầng nhỏ và
    // biên đại cảnh giới khác giữ nguyên hành vi.
    if (state.realm === 1 && state.stage === L.REALMS[1].stages.length - 1 &&
        state.tuvi >= L.REALMS[1].tuviNext && state.quest !== 'q8_done') {
      toast('Đột phá Trúc Cơ là bước qua đại cảnh giới — phải thực hiện tại Đài Trúc Cơ ở phía bắc Thanh Vân Tông cùng Trúc Cơ Đan, theo nhiệm vụ chương 8. Hãy tới đài và tương tác với đài để bắt đầu.', 5600);
      return;
    }
    var r = L.tryBreakthrough(state);
    if (!r.ok) { toast(r.reason); return; }
    sfxBell();
    pillarT = 1.6; // cột sáng đột phá
    spawnParts(px + 16, py + 24, 24, '255,232,160', 30, true); // hạt linh khí bay lên
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
    // Ví Linh Thạch: chỉ hiện SAU khi bắt đầu tu tiên (đột phá Luyện Khí tầng 1);
    // giai đoạn phàm nhân không hiện ô đếm, không nhắc tới trong giao diện.
    var linhRow = $('hud-linh');
    if (linhRow) {
      var wOpen = L.walletOpen(state);
      linhRow.classList.toggle('hidden', !wOpen);
      if (wOpen) $('hud-linh-val').textContent = L.fmtNum(state.linhThach || 0);
    }
    var q = L.questById(state.quest);
    $('hud-quest-name').textContent = q ? q.name : '';
    $('hud-quest-desc').textContent = q ? q.desc : '';
    var qid = q ? q.id : state.quest;
    if (qid && qid !== lastQuestId) {
      var isUnseen = !seenQuestIds[qid];
      if (lastQuestId) sfxQuest(); // nhạc hiệu hoàn thành nhiệm vụ (ngắn) khi thật sự chuyển nhiệm vụ
      lastQuestId = qid;
      if (questMinimized && isUnseen) {
        var qtab = $('quest-tab'); if (qtab) qtab.classList.add('pulse');
      } else if (!questMinimized) {
        seenQuestIds[qid] = true;
      }
    }
    setSkillLock('sk-pha', state.unlocked.indexOf('voice') < 0, 'Mở khóa sau sự kiện mở miệng trước bia đá');
    setSkillLock('sk-chan', state.unlocked.indexOf('luyenkhi1') < 0, 'Mở khóa khi đạt Luyện Khí tầng 1');
    setSkillLock('sk-sword', state.unlocked.indexOf('that_tinh') < 0, 'Mở khóa khi nhận Thất Tinh Kiếm Quyết ở Kiểm Trắc Tháp');
    var bagBtn = $('btn-bag');
    if (bagBtn) bagBtn.classList.toggle('hidden', !state.flags.bagUnlocked); // nút Túi chỉ hiện sau mốc mở khóa chương 3
    var medBtn = $('sk-med');
    if (medBtn) medBtn.classList.toggle('active', medLatch);
  }

  /* ---------- Chỉ thị giờ thế giới (chu kỳ ngày đêm) ---------- */
  // Biểu tượng mặt trời/mặt trăng vẽ bằng mã trên canvas 16x16 (#clock-icon),
  // chữ giờ HH:MM từ logic thuần. Chỉ vẽ lại khi phút hiển thị đổi.
  var clockShown = '';
  function dayPhaseName(dm, mode) {
    if (mode === 'day') return 'Ghim ban ngày';
    if (mode === 'night') return 'Ghim ban đêm';
    var h = dm / 60;
    if (h < 5) return 'Đêm khuya';
    if (h < 6.5) return 'Bình minh';
    if (h < 11) return 'Sáng';
    if (h < 14) return 'Trưa';
    if (h < 17.5) return 'Chiều';
    if (h < 19.5) return 'Hoàng hôn';
    if (h < 22) return 'Tối';
    return 'Đêm khuya';
  }
  function drawClockIcon(dm) {
    var c = $('clock-icon');
    if (!c || !c.getContext) return;
    var g = c.getContext('2d');
    g.clearRect(0, 0, 16, 16);
    var ph = L.dayPhaseAt ? L.dayPhaseAt(dm) : { night: 0 };
    if (ph.night < 0.5) {
      // Mặt trời: đĩa vàng + 8 tia ngắn.
      g.strokeStyle = '#f3d94e'; g.fillStyle = '#f3d94e'; g.lineWidth = 1.4;
      g.beginPath(); g.arc(8, 8, 3.4, 0, Math.PI * 2); g.fill();
      for (var i = 0; i < 8; i++) {
        var a = i * Math.PI / 4;
        g.beginPath();
        g.moveTo(8 + Math.cos(a) * 5.2, 8 + Math.sin(a) * 5.2);
        g.lineTo(8 + Math.cos(a) * 7.2, 8 + Math.sin(a) * 7.2);
        g.stroke();
      }
    } else {
      // Mặt trăng khuyết: đĩa sáng bị đĩa nền khoét lệch (destination-out).
      g.fillStyle = '#e8ecf5';
      g.beginPath(); g.arc(8, 8, 5.6, 0, Math.PI * 2); g.fill();
      g.globalCompositeOperation = 'destination-out';
      g.beginPath(); g.arc(11, 6, 4.8, 0, Math.PI * 2); g.fill();
      g.globalCompositeOperation = 'source-over';
    }
  }
  function updateClockHud() {
    if (!state || !L.displayDayMinutes || !L.formatDayTime) return;
    var mode = SET ? SET.current.dayMode : 'cycle';
    var dm = L.displayDayMinutes(state, mode);
    var txt = L.formatDayTime(dm) + '|' + mode;
    if (txt === clockShown) return;
    clockShown = txt;
    var el = $('clock-text'); if (el) el.textContent = L.formatDayTime(dm);
    var phEl = $('clock-phase'); if (phEl) phEl.textContent = dayPhaseName(dm, mode);
    drawClockIcon(dm);
  }

  /* ---------- Vòng lặp ---------- */
  var tNow = 0, lastTs = 0, frameDt = 0.016;
  function loop(ts) {
    if (!state) return;
    requestAnimationFrame(loop);
    var dt = Math.min(0.05, Math.max(0, (ts - lastTs) / 1000 || 0.016)); lastTs = ts; tNow = ts; frameDt = dt;
    if (shakeT > 0) shakeT = Math.max(0, shakeT - dt);
    if (flashA > 0) flashA = Math.max(0, flashA - dt * 0.7);
    if (pillarT > 0) pillarT = Math.max(0, pillarT - dt);
    // Hạt linh khí: cập nhật vị trí, bay lên dần, hết đời thì loại.
    parts = parts.filter(function (p) { return p.t < p.life; });
    parts.forEach(function (p) { p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy -= 8 * dt; });
    // Mờ chuyển cảnh: out -> chạy callback ở điểm tối nhất -> in.
    if (fade.phase === 'out') {
      fade.t = Math.min(1, fade.t + dt / 0.3);
      if (fade.t >= 1) { fade.phase = 'in'; if (fade.cb) { var fcb = fade.cb; fade.cb = null; fcb(); } }
    } else if (fade.phase === 'in') {
      fade.t = Math.max(0, fade.t - dt / 0.3);
      if (fade.t <= 0) fade.phase = 'idle';
    }
    rings.forEach(function (r) { r.r += dt * 260; r.a -= dt * 0.8; });
    floats.forEach(function (f) { f.y -= dt * 26; f.a -= dt * 0.8; });
    meditating = false;
    if (!dlg) {
      // Giữ chạm quá ngưỡng thời gian (kể cả không kéo) cũng vào chế độ cần.
      if (joy.state === 'pending' && Date.now() - joy.t0 > L.JOY_STICK_MS) {
        joy.state = 'stick';
        clickPath = null; clickTarget = null; pendingInteract = null; medLatch = false;
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
        clickPath = null; clickTarget = null; pendingInteract = null; medLatch = false;
        resetJoy(); // phím di chuyển hủy trạng thái cần ngay
        dir8 = L.dir8FromVector(dx, dy, dir8);
      }
      // Cần cảm ứng: ghi đè đường bấm chuột (đường đã bị hủy ngay khi vào chế độ cần);
      // phím tay vẫn ưu tiên cao nhất. Cùng một đường chọn hướng dir8FromVector.
      if (!manual && joy.state === 'stick') {
        var jn = L.joyNormalize(joy.cx - joy.sx, joy.cy - joy.sy, JOY_R);
        if (SET) jn.speed = Math.min(1.5, jn.speed * SET.current.joySens); // độ nhạy cần (cài đặt)
        joy.active = jn.active; joy.ux = jn.ux; joy.uy = jn.uy; joy.speed = jn.speed;
        if (jn.active) {
          dx = jn.ux * sp * jn.speed; dy = jn.uy * sp * jn.speed;
          dir8 = L.dir8FromVector(dx, dy, dir8);
          if (Math.abs(jn.ux) >= Math.abs(jn.uy)) facing = jn.ux > 0 ? 'right' : 'left';
          else facing = jn.uy > 0 ? 'down' : 'up';
        }
      }
      // Di chuyển bằng chạm, hai chế độ:
      // - Đường VUỐT (mặc định): bám đuổi thuần túy (pure pursuit) theo
      //   từng nhịp thẳng đã kiểm thông suốt — chiếu vị trí lên đoạn, nhắm
      //   điểm cách hình chiếu 12px về phía đích nên nhân vật BÁM đoạn
      //   thẳng thay vì nhắm thẳng vào điểm đích (nhắm điểm đích từng làm
      //   nhân vật cọ góc vật thể rồi kẹt túi góc ở chương 5). Bo góc bằng
      //   quán tính; ô đích CUỐI vẫn khớp cứng về gốc ô khi vào cửa sổ một
      //   khung (giữ ngữ nghĩa ô đích cho cổng và tương tác); ô trung
      //   gian lướt qua trong 7px là tính đã qua.
      // - Đường THÔ (cứu hộ): nếu đường vuốt kẹt hẳn, vòng lặp tự tìm lại
      //   đường ô nguyên bản và đi theo logic tâm-ô trục-chính-trước của
      //   bản cũ (đã kiểm chứng qua toàn bộ suite) cho tới đích.
      if (!manual && joy.state !== 'stick' && clickPath && clickPath.length) {
        var wp = clickPath[0];
        var mdx = wp.x * TILE - px, mdy = wp.y * TILE - py;
        var distWp = Math.hypot(mdx, mdy);
        var isFinalWp = clickPath.length === 1;
        var stepW = sp * dt + 0.6;
        if (isFinalWp && Math.abs(mdx) <= stepW && Math.abs(mdy) <= stepW) {
          px = wp.x * TILE; py = wp.y * TILE; velX = 0; velY = 0;
          clickPath.shift();
          clickPath = null; clickTarget = null;
        } else if (!clickPathRaw && !isFinalWp && distWp <= 7) {
          clickSegAnchor = { x: wp.x * TILE, y: wp.y * TILE };
          clickPath.shift();
        } else if (clickPathRaw) {
          // Logic bản cũ: trục chính trước, khớp tâm từng ô, kẹt một khung
          // thì thử trục phụ (xem thêm khối cứu kẹt sau bước di chuyển).
          dir8 = L.dir8FromVector(mdx, mdy, dir8);
          if (Math.abs(mdx) <= stepW && Math.abs(mdy) <= stepW) {
            px = wp.x * TILE; py = wp.y * TILE;
            clickPath.shift();
            if (!clickPath.length) { clickPath = null; clickTarget = null; }
          } else if (Math.abs(mdx) >= Math.abs(mdy) && mdx !== 0) {
            dx = mdx > 0 ? sp : -sp; facing = mdx > 0 ? 'right' : 'left';
          } else if (mdy !== 0) {
            dy = mdy > 0 ? sp : -sp; facing = mdy > 0 ? 'down' : 'up';
          } else if (mdx !== 0) {
            dx = mdx > 0 ? sp : -sp; facing = mdx > 0 ? 'right' : 'left';
          }
        } else {
          var axS = clickSegAnchor ? clickSegAnchor.x : px, ayS = clickSegAnchor ? clickSegAnchor.y : py;
          var abx = wp.x * TILE - axS, aby = wp.y * TILE - ayS;
          var abLen = Math.hypot(abx, aby);
          var tAim = 1;
          if (abLen > 0.01) {
            var tProj = ((px - axS) * abx + (py - ayS) * aby) / (abLen * abLen);
            tProj = Math.max(0, Math.min(1, tProj));
            tAim = Math.min(1, (tProj * abLen + 12) / abLen);
          }
          var aimX = axS + abx * tAim - px, aimY = ayS + aby * tAim - py;
          var aimLen = Math.hypot(aimX, aimY);
          if (aimLen > 0.01) {
            dir8 = L.dir8FromVector(aimX, aimY, dir8);
            var spdWp = sp;
            if (isFinalWp && distWp < 30) spdWp = Math.max(30, sp * distWp / 30); // giảm tốc êm khi vào ô đích cuối
            dx = aimX / aimLen * spdWp; dy = aimY / aimLen * spdWp;
            if (Math.abs(aimX) >= Math.abs(aimY)) facing = aimX > 0 ? 'right' : 'left';
            else facing = aimY > 0 ? 'down' : 'up';
          }
        }
      }
      // Chạm-để-tương-tác: đường đi kết thúc ngay tại ô đứng hẹn -> quay mặt
      // về phía mục tiêu và tự mở tương tác như phím E.
      if (!manual && joy.state !== 'stick' && pendingInteract && !clickPath) {
        var ptA = playerTile();
        if (ptA.x === pendingInteract.standX && ptA.y === pendingInteract.standY) {
          var tgtA = pendingInteract; pendingInteract = null;
          faceTowardTile(tgtA.focusX, tgtA.focusY);
          interact();
        }
      }
      // Quán tính (đợt nóng 2): vận tốc thật tiến về vận tốc mong muốn
      // (dx/dy) với gia tốc hữu hạn — bắt đầu và dừng bước đều có độ dốc
      // ngắn thay vì bật/tắt tức thì. Trục bị tường chặn thì vận tốc trục
      // đó về 0 ngay, trục còn lại vẫn trượt tự do dọc tường. Tốc độ tối
      // đa giữ nguyên như trước (132 px/giây, cần cảm ứng theo độ nhạy).
      var ACCEL = 1500, DECEL = 1200;
      velX = approachVel(velX, dx, dx !== 0 ? ACCEL : DECEL, dt);
      velY = approachVel(velY, dy, dy !== 0 ? ACCEL : DECEL, dt);
      var prevPx = px, prevPy = py;
      if (velX !== 0) { var wantX = velX * dt, gotX = tryMove(wantX, 0); if (Math.abs(gotX) < Math.abs(wantX) - 0.001) velX = 0; }
      if (velY !== 0) { var wantY = velY * dt, gotY = tryMove(0, wantY); if (Math.abs(gotY) < Math.abs(wantY) - 0.001) velY = 0; }
      var speedNow = Math.hypot(velX, velY);
      moving = !!(dx || dy) || speedNow > 6;
      // Đường THÔ kẹt một khung vì hộp chân còn vương sang ô kề chéo
      // (thường gặp ngay sau khi rẽ hướng): thử bước theo trục phụ về phía
      // điểm đường đi — cơ chế cứu kẹt của bản cũ, giữ nguyên.
      if (clickPath && clickPathRaw && px === prevPx && py === prevPy && (dx || dy)) {
        var wpB = clickPath[0];
        var mdxB = (wpB.x * TILE + 16) - (px + 16), mdyB = (wpB.y * TILE + 16) - (py + 16);
        if (dx !== 0 && mdyB !== 0) tryMove(0, (mdyB > 0 ? sp : -sp) * dt);
        else if (dy !== 0 && mdxB !== 0) tryMove((mdxB > 0 ? sp : -sp) * dt, 0);
      }
      // Đồng hồ kẹt cho chạm-để-đi: còn nhích được thì giữ đường. Đường
      // VUỐT đứng im hẳn quá 0,45 giây thì TỰ TÌM LẠI đường ô thô về đúng
      // đích cũ và đi tiếp bằng logic tâm-ô (cứu hộ — đường vuốt có thể
      // kẹt túi góc dù từng nhịp đã kiểm thông suốt); cả hai chế độ đứng
      // im quá 0,9 giây mới kết luận bị chặn hẳn và bỏ đường. (Bản cũ bỏ
      // đường ngay khi kẹt một khung — quán tính lúc mới xuất phát đi rất
      // chậm nên một khung không nói lên gì nữa.)
      if (clickPath && clickPath.length) {
        if (Math.abs(px - prevPx) > 0.2 || Math.abs(py - prevPy) > 0.2) pathStuckT = 0;
        else {
          pathStuckT += dt;
          if (pathStuckT > 0.45 && !clickPathRaw && clickTarget) {
            var rp = L.findPath(playerTile(), clickTarget, npcsLive);
            if (rp && rp.length) { clickPath = rp; clickPathRaw = true; pathStuckT = 0; }
          }
          if (pathStuckT > 0.9) { clickPath = null; clickTarget = null; pendingInteract = null; pathStuckT = 0; velX = 0; velY = 0; }
        }
      } else pathStuckT = 0;
      if (moving) {
        // Nhịp khung bước tỉ lệ theo tốc độ THẬT: đi chậm bước chậm, đủ
        // tốc độ thì đúng nhịp cũ (pha bước ~0,11s, đổi khung đi 0,16s).
        var sf = Math.min(1.6, speedNow / sp);
        walkTimer += dt * sf; if (walkTimer > 0.16) { walkFrame = 1 - walkFrame; walkTimer = 0; }
        // Pha bước cho sheet 8 hướng: chạy 1->2->3->4 lặp theo nhịp tỉ lệ tốc độ.
        if (stepPhase === 0) { stepPhase = 1; stepTimer = 0; }
        else {
          stepTimer += dt * sf;
          while (stepTimer >= 0.11) { stepTimer -= 0.11; stepPhase = stepPhase % 4 + 1; }
        }
        state.silence = L.silenceGain('walk', dt, state.silence);
      } else {
        walkFrame = 0; stepPhase = 0; stepTimer = 0;
        state.silence = L.silenceGain('idle', dt, state.silence);
      }
      // thổ nạp tại điểm linh khí của bản đồ hiện tại (phím T giữ, hoặc chốt từ thanh kỹ năng)
      var cx = Math.floor((px + 16) / TILE), cy = Math.floor((py + 16) / TILE);
      var medPt = L.activeMap().meditate;
      var nearWell = !!medPt && Math.abs(cx - medPt.x) + Math.abs(cy - medPt.y) <= 2;
      if ((keys['t'] || medLatch) && nearWell && state.unlocked.indexOf('voice') >= 0) {
        meditating = true;
        // Âm linh khí xoay khi thổ nạp: nốt êm luân phiên mỗi ~0,9 giây + hạt tụ về người.
        medSfxT += dt;
        if (medSfxT > 0.9) { medSfxT = 0; beep(MED_NOTES[medNoteIdx % MED_NOTES.length], 0.5, 'sine', 0.014, 'skill'); medNoteIdx++; }
        if (fxOn() && Math.random() < dt * 6) spawnParts(px + 16 + (Math.random() - 0.5) * 56, py + 20 + (Math.random() - 0.5) * 30, 1, '170,225,255', 8, true);
        var beforeTuvi = state.tuvi;
        L.meditateTick(state, dt);
        if (state.tuvi !== beforeTuvi && state.quest === 'q_meditate' && state.tuvi >= 100) {
          state.quest = 'q_break'; toast('Tu vi đã đầy! Nhấn phím B để đột phá Luyện Khí tầng 1.');
        }
        refreshHUD();
      }
      checkPortalsAndZones();
    } else {
      // Mở thoại thì hủy đường đi bằng chuột và hủy cần cảm ứng.
      clickPath = null; clickTarget = null; resetJoy();
    }
    // Đồng hồ thế giới: chỉ chạy trong phiên chơi (vòng lặp này), theo tốc
    // độ cài đặt. Chế độ ghim ngày/đêm thì đồng hồ nền TẠM DỪNG (giờ hiển
    // thị bị ghim ở 12:00/00:00) — quay về "Theo chu kỳ" là chạy tiếp từ
    // đúng giờ đã dừng, không nhảy vọt.
    if (L.advanceDayClock && (!SET || SET.current.dayMode === 'cycle')) {
      L.advanceDayClock(state, dt, SET ? SET.current.daySpeed : 'normal');
    }
    musicApplyFrame();
    updateClockHud();
    render();
    saveTimer += dt;
    // Tự động lưu theo cài đặt (tắt, hoặc khoảng 5/15/30/60 giây); không có
    // module cài đặt thì giữ nhịp cũ 5 giây.
    var autoSaveOn = !SET || SET.current.autoSave;
    if (autoSaveOn && saveTimer > (SET ? SET.current.autoSaveSec : 5)) { saveTimer = 0; saveNow(); refreshHUD(); }
  }
  /* ---------- Cổng bản đồ + vùng sự kiện chương 2 ---------- */
  var portalToastAt = 0;
  function switchMap(po) {
    fadeTransition(function () {
      state.map = po.to; state.x = po.toX; state.y = po.toY;
      // Vừa đặt chân lên tông mà save còn dừng ở cuối chương 6 thì nâng
      // nhiệm vụ ngay trong cùng phiên (di trú lúc nạp vẫn giữ cho save cũ).
      if (po.to === 'thanh_van_tong' && state.quest === 'q6_done') state.quest = 'q7_nhap_tong';
      state.dir = po.to === 'tran' ? 'up' : 'down';
      L.setActiveMap(po.to);
      px = po.toX * TILE; py = po.toY * TILE; facing = state.dir;
      dir8 = DIR8_ROW4[facing] || 0; stepPhase = 0; stepTimer = 0;
      npcsLive = L.activeMap().npcs.map(function (n) { return { id: n.id, name: n.name, look: n.look, x: n.x, y: n.y, dir: n.dir }; });
      setMinimapLabel();
      clickPath = null; clickTarget = null; pendingInteract = null; medLatch = false; resetJoy(); cancelPinch(); zoomAnchor = null; velX = 0; velY = 0;
      var dcS = desiredCam(); camX = dcS.x; camY = dcS.y;
      saveNow(); refreshHUD();
      toast('Đã tới: ' + L.activeMap().name + '.', 2600);
      if (po.to === 'duong_mon' && state.quest === 'q2_len_duong') {
        say(ST.SCENE_DEPART, function () {
          if (!state.flags.ltLetter) {
            var r = L.addLinhThach(state, 20);
            if (r.ok) { state.flags.ltLetter = true; toast('U Nhàn gửi thêm lộ phí: +20 Linh Thạch (số dư: ' + L.fmtNum(r.balance) + ').', 4200); }
          }
          state.quest = 'q2_vet_tich'; refreshHUD(); saveNow();
        });
      }
    });
  }
  function checkPortalsAndZones() {
    if (!state || dlg || fade.phase !== 'idle') return; // đang mờ chuyển cảnh thì không kích lại
    var pt = playerTile();
    var def = L.activeMap();
    for (var i = 0; i < def.portals.length; i++) {
      var po = def.portals[i];
      if (pt.x >= po.x && pt.x < po.x + po.w && pt.y >= po.y && pt.y < po.y + po.h) {
        if (!L.portalUnlocked(state, po)) {
          if (Date.now() - portalToastAt > 3000) { portalToastAt = Date.now(); toast(po.cond === 'dummy' ? 'Hãy hoàn thành chương 1 (phá cọc gỗ) trước khi rời trấn.' : (po.lockMsg || 'Chưa thể qua cổng này lúc này.')); }
          return;
        }
        switchMap(po);
        return;
      }
    }
    if (state.map === 'co_chau' && state.quest === 'q6_sinh_le' && !state.flags.dowrySeen && pt.x >= 4 && pt.x <= 30 && pt.y >= 29 && pt.y <= 42) {
      state.flags.dowrySeen = true; // đoàn sính lễ của Chu Kiến Thâm vào sân phủ Hứa
      say(ST.SCENE_DOWRY, function () {
        var cap = L.REALMS[state.realm].tuviNext;
        if (cap) state.tuvi = cap;
        state.quest = 'q6_phong_thu'; refreshHUD(); saveNow();
      });
      return;
    }
    if (state.map === 'co_chau' && state.quest === 'q4_thien_co' && !state.flags.thienCoSeen && pt.x >= 4 && pt.x <= 30 && pt.y >= 29 && pt.y <= 42) {
      state.flags.thienCoSeen = true; // sứ giả Thiên Cơ Các tới sân phủ Hứa
      say(ST.SCENE_THIENCO, function () {
        var cap = L.REALMS[state.realm].tuviNext;
        if (cap) state.tuvi = cap;
        state.quest = 'q4_vu_cao'; refreshHUD(); saveNow();
      });
      return;
    }
    if (state.map === 'kiem_trac_thap' && state.quest === 'q3_hang_cho' && !state.flags.queueSeen) {
      state.flags.queueSeen = true; // sự kiện xếp hàng nổ ngay khi bước vào khuôn viên tháp
      say(ST.SCENE_QUEUE, function () { state.quest = 'q3_thuoc_do'; refreshHUD(); saveNow(); });
      return;
    }
    if (state.map !== 'duong_mon') return;
    // Bãi phục kích: bước vào vùng khi nhiệm vụ đang chờ thì sự kiện nổ ra.
    if (state.quest === 'q2_phuc_kich' && pt.x >= 39 && pt.x <= 48 && pt.y >= 49 && pt.y <= 55) {
      say(ST.SCENE_AMBUSH);
    } else if (state.quest === 'q2_cong_thanh' && pt.y >= 67 && Math.abs(pt.x - 48) <= 6) {
      say(ST.SCENE_GATE, function () {
        // Nối THẲNG sang chương 3 ngay trong phiên (trước đây chỉ đặt
        // q2_done và nhờ khâu chuẩn hóa lúc nạp sau chuyển tiếp — người
        // chơi không tải lại trang thì cổng tháp không bao giờ mở).
        state.quest = 'q3_hang_cho'; refreshHUD(); saveNow();
        toast('Hoàn thành chương 2: Tới cổng Cô Châu Thành.', 4200);
      });
    }
  }
  function touchTracks() {
    if (state.quest === 'q2_vet_tich') {
      var lines = ST.SCENE_TRACK.slice();
      if (state.flags.wroteFirst) lines = lines.concat(ST.SCENE_TRACK_HIDDEN);
      say(lines, function () {
        if (state.flags.wroteFirst) state.flags.evidence = true;
        state.quest = 'q2_phuc_kich'; refreshHUD(); saveNow();
      });
    } else {
      say([{ who: 'narrate', text: 'Dấu vết bên đường: vải rách, dấu chân ngựa, và một bãi đất bị giẫm nát. Người đi trước đã qua đây từ sáng sớm.' }]);
    }
  }

  // Hộp chân (rộng 20px, cao 10px ở đáy ô nhân vật) có hoàn toàn tự do ở
  // vị trí gốc sprite (nx, ny) không — đúng bốn ô góc như luật va chạm gốc.
  // Đưa vận tốc hiện tại về phía vận tốc mong muốn, tối đa rate*dt mỗi khung.
  function approachVel(cur, des, rate, dt) {
    var d = des - cur, m = rate * dt;
    return Math.abs(d) <= m ? des : cur + (d > 0 ? m : -m);
  }
  function footBoxFree(nx, ny) { return footBoxFreePad(nx, ny, 0); }
  function footBoxFreePad(nx, ny, pad) {
    var box = { x0: nx + 6 - pad, x1: nx + 26 + pad, y0: ny + 22 - pad, y1: ny + 31 + pad };
    var tiles = [[Math.floor(box.x0 / TILE), Math.floor(box.y0 / TILE)], [Math.floor(box.x1 / TILE), Math.floor(box.y0 / TILE)], [Math.floor(box.x0 / TILE), Math.floor(box.y1 / TILE)], [Math.floor(box.x1 / TILE), Math.floor(box.y1 / TILE)]];
    for (var i = 0; i < 4; i++) if (!L.isWalkable(tiles[i][0], tiles[i][1], npcsLive)) return false;
    return true;
  }
  // Di chuyển MỘT trục (người gọi luôn truyền đúng một trục khác 0) theo
  // từng bước con tối đa 4px: đi được tới đâu hay tới đó, dừng sít mép vật
  // cản thay vì dội cả bước khung như trước — trục còn lại vẫn trượt tự do
  // nên nhân vật lướt dọc tường/cổng thay vì chết đứng. Trả về quãng đường
  // thật đã đi (có dấu) để vòng lặp biết trục nào vừa bị chặn.
  function tryMove(mx, my) {
    var total = mx !== 0 ? mx : my;
    if (!total) return 0;
    var done = 0, remaining = total;
    while (remaining !== 0) {
      var chunk = Math.abs(remaining) > 4 ? (remaining > 0 ? 4 : -4) : remaining;
      var nx = px + (mx !== 0 ? done + chunk : 0), ny = py + (my !== 0 ? done + chunk : 0);
      if (!footBoxFree(nx, ny)) break;
      done += chunk; remaining -= chunk;
    }
    if (mx !== 0) px += done; else py += done;
    return done;
  }
  // Đoạn thẳng giữa hai gốc sprite có thông suốt cho hộp chân không (lấy
  // mẫu mỗi 8px) — dùng để vuốt đường chạm-để-đi. Kiểm bằng hộp chân NỞ
  // thêm 3px mỗi phía: nhịp vuốt chỉ được nhận khi còn dư khoảng hở, để
  // lúc bám đoạn (bám đuổi thuần túy, luôn có sai lệch vài px) nhân vật
  // không cọ vào góc vật thể rồi kẹt trong túi góc như ca cổng Thiên Cơ
  // Các ở chương 5 (đứng chết một chỗ dù đích còn xa).
  function segmentFree(x0, y0, x1, y1) {
    var dist = Math.hypot(x1 - x0, y1 - y0);
    var steps = Math.max(1, Math.ceil(dist / 8));
    for (var i = 1; i <= steps; i++) {
      var t = i / steps;
      if (!footBoxFreePad(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, 3)) return false;
    }
    return true;
  }
  // Vuốt đường ô của findPath: từ mỗi neo, nhảy thẳng tới ô xa nhất còn
  // nhìn thông suốt (tầm nhìn tối đa 12 ô mỗi nhịp) — bỏ các điểm ngoặt
  // thừa trên đoạn thẳng và các khúc leo bậc thang theo tâm ô; điểm đích
  // cuối luôn được giữ nguyên để ngữ nghĩa ô đích không đổi.
  function smoothPath(path) {
    if (!path || path.length < 3) return path;
    var out = [], ax = px, ay = py, i = 0;
    while (i < path.length) {
      var last = Math.min(path.length - 1, i + 11), pick = i;
      for (var j = last; j > i; j--) {
        if (segmentFree(ax, ay, path[j].x * TILE, path[j].y * TILE)) { pick = j; break; }
      }
      out.push(path[pick]);
      ax = path[pick].x * TILE; ay = path[pick].y * TILE;
      i = pick + 1;
    }
    return out;
  }

  /* ---------- Phím ---------- */
  document.addEventListener('keydown', function (e) {
    var k = e.key.toLowerCase();
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].indexOf(k) >= 0 && state && !$('screen-game').classList.contains('hidden')) e.preventDefault();
    keys[k] = true;
    if (!state || $('screen-game').classList.contains('hidden')) return;
    if (k === 'e' || k === ' ') interact();
    else if (dlg && dlg.who === 'choice' && (k === '1' || k === '2' || k === '3')) {
      var idx = parseInt(k, 10) - 1;
      if (dlg.options[idx]) chooseOption(dlg.options[idx].action);
    }
    else if (k === '1') castPha();
    else if (k === '2') castChan();
    else if (k === '3') castSword();
    else if (k === 'b') doBreakthrough();
    else if (k === 'i') { var bp2 = $('bag-panel'); if (bp2 && !bp2.classList.contains('hidden')) closeBag(); else openBag(); }
  });
  document.addEventListener('keyup', function (e) { keys[e.key.toLowerCase()] = false; });
  $('dialogue').addEventListener('click', function () { if (dlgTypeFinish()) return; if (dlg && dlg.who !== 'choice') nextLine(); });
  $('btn-save').addEventListener('click', function () {
    if (saveNow()) toast('Đã lưu tiến trình.');
    else toast('Chưa lưu được: tiến trình mới hơn đang ở một phiên chơi khác — hãy tải lại trang để chơi tiếp từ bản mới nhất.', 4600);
  });
  var settingsBtnEl = $('btn-settings');
  if (settingsBtnEl && SET && SET.openPanel) settingsBtnEl.addEventListener('click', function () { SET.openPanel(); });
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
    if (pinch.active) return; // đang chụm hai ngón: không sinh lệnh đi/tương tác nào
    // Cần đang cầm quyền điều khiển thì chạm này THUỘC VỀ hệ cần, tuyệt đối
    // không sinh lệnh đi/tương tác. Đây là cửa sự kiện thứ hai chạy SAU
    // pointerdown cho cùng một chạm thật (trình duyệt bắn pointerdown rồi
    // mới touchstart): ở chế độ đế cố định, pointerdown đã vào thẳng 'stick'
    // và xóa lệnh cũ, nhưng touchstart tới sau vẫn đẻ ra một lệnh đi ma tới
    // điểm thế giới dưới vị trí đế (góc dưới màn hình) — thả cần ra là nhân
    // vật tự đi theo lệnh ma đó (lỗi "tự di chuyển xuống cuối map"). Chặn
    // ngay tại hàm dùng chung này để mọi đường gọi đều được bảo vệ; chạm
    // nhanh thật không bị ảnh hưởng vì lúc touchstart của nó cần chỉ đang
    // 'pending' (cần nổi) hoặc 'idle', chưa bao giờ là 'stick'.
    if (joy.state === 'stick') return;
    if (SET && !SET.current.clickMove) return; // cài đặt tắt di chuyển bằng bấm chuột/chạm đất
    var rect = cv.getBoundingClientRect();
    // MÀN HÌNH -> THẾ GIỚI qua đúng một hàm dùng chung (screenToWorld), đã
    // gồm cả hệ số phóng: chạm ở mọi mức zoom vẫn trúng đúng ô thế giới.
    var wpt = screenToWorld(clientX - rect.left, clientY - rect.top, camX, camY, zoom);
    var tx = Math.floor(wpt.x / TILE), ty = Math.floor(wpt.y / TILE);
    // Chạm thẳng vào đối tượng có tương tác -> đi tới và tự mở (tapInteract);
    // chạm đất trống -> chỉ di chuyển như cũ và hủy hành động chờ trước đó.
    // (Cổng clickMove ở đầu hàm đã chặn cả hai khi cài đặt tắt; thoại đang mở
    // cũng đã bị chặn ở đầu hàm nên chạm lúc thoại giữ nguyên tiến thoại.)
    var tapTgt = L.tapTargetAt(tx, ty, npcsLive);
    if (tapTgt) { tapInteract(tapTgt); return; }
    pendingInteract = null;
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
    if (path && path.length) { clickPath = smoothPath(path); clickTarget = dest; medLatch = false; clickPathRaw = false; clickSegAnchor = { x: px, y: py }; }
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
  // Sự kiện tổng hợp (chuột giả lập sau chạm) phát sinh ngay sau cử chỉ chụm
  // phải bị NUỐT: trong cửa sổ ngắn sau khi chụm kết thúc, một lần chạm/chuột
  // nối tiếp bị bỏ qua; các lần chạm thật sau đó hoạt động như cũ.
  function pinchTapBlocked() {
    if (!pinchSuppressUntil) return false;
    var within = Date.now() <= pinchSuppressUntil;
    pinchSuppressUntil = 0;
    return within;
  }
  cv.addEventListener('mousedown', function (e) {
    if (e.button !== 0) return;
    if (pinch.active) return;
    if (joy.state === 'pending' || joy.state === 'stick') return; // đang kéo cần bằng chuột (chế độ Luôn bật)
    // Cả hai cửa sổ nuốt đều được TIÊU THỤ trong cùng lần sự kiện này, để
    // lần chạm thật ngay sau đó không bị nuốt oan bởi cửa sổ còn sót.
    var supJoy = tapSuppressed(), supPinch = pinchTapBlocked();
    if (supJoy || supPinch) return;
    handleCanvasPoint(e.clientX, e.clientY);
  });
  cv.addEventListener('touchstart', function (e) {
    if (!e.touches || !e.touches[0]) return;
    e.preventDefault();
    // Ngón thứ hai chạm xuống / đang trong cử chỉ chụm: TUYỆT ĐỐI không diễn
    // giải thành chạm-để-đi hay chạm-tương-tác (cử chỉ do pointer events lo).
    if (pinch.active || e.touches.length >= 2) return;
    if (tapSuppressed()) return;
    handleCanvasPoint(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: false });
  /* ---------- Phóng/thu bằng lăn chuột: neo tại con trỏ ---------- */
  cv.addEventListener('wheel', function (e) {
    if (!state || dlg) return;
    if (!zoomEnabled()) return; // công tắc cài đặt tắt: lăn chuột không tác dụng
    if (e.preventDefault) e.preventDefault();
    var rect = cv.getBoundingClientRect();
    var sx = e.clientX - rect.left, sy = e.clientY - rect.top;
    var wp = screenToWorld(sx, sy, camX, camY, zoom);
    zoomAnchor = { wx: wp.x, wy: wp.y, sx: sx, sy: sy };
    zoomTarget = wheelTargetZoom(zoomTarget, e.deltaY);
  }, { passive: false });
  /* Cần điều khiển cảm ứng: chỉ nhận sự kiện pointer type 'touch' trên chính canvas
     (các nút giao diện là phần tử DOM nổi phía trên nên tự nhận chạm trước).
     Chạm nhanh rồi thả = tap-to-move do handler touchstart ở trên xử lý như cũ;
     kéo lệch quá ngưỡng hoặc giữ quá ngưỡng thời gian = chế độ cần (vòng lặp sẽ
     tự nâng 'pending' thành 'stick' khi giữ lâu mà không kéo). */
  function joyPoint(e) { var rect = cv.getBoundingClientRect(); return { x: e.clientX - rect.left, y: e.clientY - rect.top }; }
  // Cổng sự kiện cần theo chế độ cài đặt: cảm ứng luôn nhận; chuột chỉ nhận khi
  // chế độ cần là 'Luôn bật' (để thử cần trên máy tính); 'Tắt' chặn cả hai.
  function joyPointerOk(e) {
    if (SET && SET.current.joyMode === 'off') return false;
    if (e.pointerType === 'touch') return true;
    return !!(SET && SET.current.joyMode === 'on' && e.pointerType === 'mouse');
  }
  /* ---------- Cử chỉ chụm hai ngón (Luồng C) ----------
     Theo dõi MỌI pointer cảm ứng trên canvas (không qua cổng joyPointerOk —
     phóng/thu là tính năng riêng, kể cả khi cần đang tắt). Ngón thứ hai chạm
     xuống thì cử chỉ chụm TIẾP QUẢN ngay: cần điều khiển bị hủy tức thì,
     đường tap-to-move / hẹn tương tác đang chạy bị hủy, và từ đây cho tới
     khi nhấc hết ngón không một lệnh đi/tương-tác nào được sinh ra. */
  function pinchPointerPos(e) { var rect = cv.getBoundingClientRect(); return { x: e.clientX - rect.left, y: e.clientY - rect.top }; }
  function pinchStartIfReady() {
    var ids = Object.keys(pinch.pointers);
    if (ids.length !== 2 || pinch.active) return;
    var a = pinch.pointers[ids[0]], b = pinch.pointers[ids[1]];
    var mid = pinchMidpoint(a.x, a.y, b.x, b.y);
    pinch.active = true;
    pinch.startDist = pinchDistance(a.x, a.y, b.x, b.y);
    pinch.startZoom = zoomTarget;
    pinch.midX = mid.x; pinch.midY = mid.y;
    pinch.anchorWorld = screenToWorld(mid.x, mid.y, camX, camY, zoom);
    pinch.joyCancelled = joy.state !== 'idle';
    resetJoy(); // HỦY cần ngay khi ngón thứ hai xuống — nhân vật dừng nhận hướng từ cần
    clickPath = null; clickTarget = null; pendingInteract = null; medLatch = false;
    zoomAnchor = null;
  }
  function pinchMoveUpdate(e) {
    var p = pinchPointerPos(e);
    pinch.pointers[e.pointerId] = p;
    if (!pinch.active) return;
    var ids = Object.keys(pinch.pointers);
    if (ids.length !== 2) return;
    var a = pinch.pointers[ids[0]], b = pinch.pointers[ids[1]];
    var mid = pinchMidpoint(a.x, a.y, b.x, b.y);
    pinch.midX = mid.x; pinch.midY = mid.y;
    if (zoomEnabled()) zoomTarget = pinchTargetZoom(pinch.startZoom, pinch.startDist, pinchDistance(a.x, a.y, b.x, b.y));
    // Khi công tắc phóng/thu tắt: cử chỉ vẫn tiếp quản để không rò lệnh
    // đi/tương-tác, nhưng hệ số phóng KHÔNG đổi.
  }
  function pinchPointerEnd(e) {
    if (e.pointerType !== 'touch') return;
    if (!pinch.pointers[e.pointerId]) return;
    delete pinch.pointers[e.pointerId];
    if (pinch.active && Object.keys(pinch.pointers).length < 2) {
      pinch.active = false; pinch.anchorWorld = null;
      // Nuốt sự kiện nhả/tổng hợp nối tiếp sau chụm (cả đường cần lẫn đường chạm).
      pinchSuppressUntil = Date.now() + 700;
      suppressTapUntil = Date.now() + 700;
      resetJoy();
    }
    // Ngón còn lại (nếu có) KHÔNG trở thành cần hay chạm mới: pointer của nó
    // đã qua giai đoạn down; nhấc hết ngón thì trạng thái trở lại bình thường.
  }
  cv.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'touch' && state && !dlg) {
      pinch.pointers[e.pointerId] = pinchPointerPos(e);
      if (Object.keys(pinch.pointers).length >= 2) { pinchStartIfReady(); return; }
      if (pinch.active) return;
    }
    if (!joyPointerOk(e) || !state || dlg) return;
    var p = joyPoint(e);
    // Chế độ Luôn hiện sẵn: chạm bắt đầu ngay trên đế cố định -> vào thẳng
    // chế độ cần với neo TẠI ĐẾ (không chờ ngưỡng kéo như cần nổi).
    if (joyFixedMode()) {
      var base = joyBasePos();
      var bd = Math.sqrt((p.x - base.x) * (p.x - base.x) + (p.y - base.y) * (p.y - base.y));
      if (bd <= JOY_R + 16) {
        joy.state = 'stick'; joy.id = e.pointerId;
        joy.sx = base.x; joy.sy = base.y; joy.cx = p.x; joy.cy = p.y;
        joy.t0 = Date.now();
        var nb = L.joyNormalize(p.x - base.x, p.y - base.y, JOY_R);
        joy.active = nb.active; joy.ux = nb.ux; joy.uy = nb.uy; joy.speed = nb.speed;
        clickPath = null; clickTarget = null; pendingInteract = null; medLatch = false;
        return;
      }
    }
    joy.state = 'pending'; joy.id = e.pointerId;
    joy.sx = p.x; joy.sy = p.y; joy.cx = p.x; joy.cy = p.y;
    joy.t0 = Date.now(); joy.active = false; joy.ux = 0; joy.uy = 0; joy.speed = 0;
  });
  cv.addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch' && pinch.pointers[e.pointerId]) { pinchMoveUpdate(e); if (pinch.active) return; }
    if (!joyPointerOk(e) || joy.id !== e.pointerId) return;
    if (joy.state !== 'pending' && joy.state !== 'stick') return;
    var p = joyPoint(e); joy.cx = p.x; joy.cy = p.y;
    var ddx = joy.cx - joy.sx, ddy = joy.cy - joy.sy;
    var dist = Math.sqrt(ddx * ddx + ddy * ddy);
    if (joy.state === 'pending' && dist > L.JOY_STICK_DIST) {
      joy.state = 'stick';
      clickPath = null; clickTarget = null; pendingInteract = null; medLatch = false; // vào chế độ cần: hủy lệnh tap-to-move đang chạy
    }
    if (joy.state === 'stick') {
      var n2 = L.joyNormalize(ddx, ddy, JOY_R);
      joy.active = n2.active; joy.ux = n2.ux; joy.uy = n2.uy; joy.speed = n2.speed;
    }
  });
  function joyEnd(e) {
    if (!joyPointerOk(e) || joy.id !== e.pointerId) return;
    var endStick = joy.state === 'stick';
    if (joy.state === 'pending') {
      var ddx = joy.cx - joy.sx, ddy = joy.cy - joy.sy;
      var dist = Math.sqrt(ddx * ddx + ddy * ddy);
      // 'tap' => giữ nguyên tap-to-move cho handler touchstart hiện tại; 'stick' => coi như vừa dùng cần.
      if (L.joyClassify(Date.now() - joy.t0, dist) === 'stick') endStick = true;
    }
    if (endStick) {
      suppressTapUntil = Date.now() + 700;
      // Thả cần là DỪNG HẲN: không lệnh đi / chờ tương tác nào được phép
      // sống sót qua một lần dùng cần, kể cả lệnh lọt vào giữa lúc đang
      // giữ cần từ bất kỳ đường sự kiện nào.
      clickPath = null; clickTarget = null; pendingInteract = null; medLatch = false;
    }
    resetJoy(); // nhấc ngón tay: cần tắt, nhân vật dừng
  }
  cv.addEventListener('pointerup', joyEnd);
  cv.addEventListener('pointercancel', joyEnd);
  cv.addEventListener('pointerup', pinchPointerEnd);
  cv.addEventListener('pointercancel', pinchPointerEnd);
  $('sk-pha').addEventListener('click', function () { castPha(); });
  $('sk-chan').addEventListener('click', function () { castChan(); });
  $('sk-sword').addEventListener('click', function () { castSword(); });
  $('sk-med').addEventListener('click', function () { sfxUi(); medLatch = !medLatch; refreshHUD(); });
  $('sk-break').addEventListener('click', function () { doBreakthrough(); });
  $('sk-interact').addEventListener('click', function () { sfxUi(); interact(); });

  /* ---------- Túi Trữ Vật (mở khóa ở chương 3) ---------- */
  function renderBag() {
    var info = $('bag-info'), grid = $('bag-grid'), up = $('bag-upgrade');
    if (!info || !grid || !state) return;
    var bag = L.bagOf(state);
    info.textContent = 'Tầng ' + bag.tier + ' — đã dùng ' + L.bagUsed(state) + '/' + L.bagCap(state) + ' ô chứa.';
    grid.innerHTML = '';
    var ids = Object.keys(L.ITEM_DEFS).filter(function (id) { return !L.ITEM_DEFS[id].storySlot && L.bagCount(state, id) > 0; });
    if (!ids.length) {
      var empty = document.createElement('div');
      empty.className = 'bag-cell empty';
      empty.innerHTML = '<span class="bag-name">Túi đang trống</span>';
      grid.appendChild(empty);
    }
    ids.forEach(function (id) {
      var def = L.ITEM_DEFS[id];
      var cell = document.createElement('div');
      cell.className = 'bag-cell';
      cell.innerHTML = '<span class="bag-glyph">' + def.glyph + '</span><span class="bag-name">' + def.name + '</span>' +
        (def.stack ? '<span class="bag-count">× ' + L.bagCount(state, id) + '</span>' : '<span class="bag-count">Pháp khí</span>');
      grid.appendChild(cell);
    });
    if (up) {
      var next = L.BAG_TIERS[bag.tier + 1];
      up.classList.toggle('hidden', !next);
      if (next) up.textContent = 'Nâng cấp túi lên tầng ' + next.tier + ' (' + next.cap + ' ô) — ' + next.price + ' Linh Thạch';
    }
  }
  function openBag() {
    if (!state || !state.flags.bagUnlocked) return; // chưa tới mốc mở khóa: không có giao diện túi
    sfxUi();
    renderBag();
    var p = $('bag-panel'); if (p) p.classList.remove('hidden');
  }
  function closeBag() { var p = $('bag-panel'); if (p) p.classList.add('hidden'); }
  $('btn-bag').addEventListener('click', openBag);
  $('bag-close').addEventListener('click', closeBag);
  $('bag-upgrade').addEventListener('click', function () {
    if (!state) return;
    var bag = L.bagOf(state);
    var next = L.BAG_TIERS[bag.tier + 1];
    if (!next) return;
    var r = L.spendLinhThach(state, next.price);
    if (!r.ok) { toast(r.reason); return; }
    state.bag.tier = next.tier;
    sfxQuest();
    toast('Đã nâng cấp Túi Trữ Vật lên tầng ' + next.tier + ' (' + next.cap + ' ô chứa).');
    renderBag(); refreshHUD(); saveNow();
  });

  /* Tay nắm kiểm chứng cho phóng/thu (harness + nút đặt lại trong panel qua
     VSLC_BRIDGE.resetZoom): đọc trạng thái hiển thị thuần túy, không phải
     đường lưu dữ liệu — mức phóng không bao giờ đi vào save. */
  window.VSLC_ZOOM = {
    ZOOM_MIN: ZOOM_MIN, ZOOM_MAX: ZOOM_MAX, ZOOM_DEFAULT: ZOOM_DEFAULT, ZOOM_LERP: ZOOM_LERP,
    clampZoom: clampZoom, zoomLerpStep: zoomLerpStep,
    pinchDistance: pinchDistance, pinchMidpoint: pinchMidpoint, pinchTargetZoom: pinchTargetZoom,
    wheelTargetZoom: wheelTargetZoom, effectiveView: effectiveView,
    worldToScreen: worldToScreen, screenToWorld: screenToWorld,
    camForAnchor: camForAnchor, clampCamZoom: clampCamZoom,
    getZoom: function () { return zoom; },
    getTarget: function () { return zoomTarget; },
    isPinching: function () { return pinch.active; },
    pinchJoyCancelled: function () { return pinch.joyCancelled; },
    joyState: function () { return joy.state; },
    cam: function () { return { x: camX, y: camY }; },
    getClickTarget: function () { return clickTarget ? { x: clickTarget.x, y: clickTarget.y } : null; },
    hasClickPath: function () { return !!(clickPath && clickPath.length); },
    reset: resetZoom,
    snap: function (z) {
      zoom = clampZoom(z); zoomTarget = zoom; zoomAnchor = null;
      var dc = desiredCam(); camX = dc.x; camY = dc.y;
    },
    screenToWorldNow: function (sx, sy) { return screenToWorld(sx, sy, camX, camY, zoom); },
    worldToScreenNow: function (wx, wy) { return worldToScreen(wx, wy, camX, camY, zoom); }
  };

  show('screen-auth');
})();
