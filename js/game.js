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
  var ZOOM_MIN = 0.35;       // hệ số nhỏ nhất (thấy rộng nhất) — mở từ 0,6 xuống 0,35 theo lệnh Bui 19:17 ngày 2026-11-01 ("không zoom được rộng hẳn")
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
  /* Họ tiếng VẠN ÂM CỘNG HƯỞNG (bước 2, thiết kế mục 3.6): mọi đòn mở
     bằng NỐT KHÓA SÓNG ở âm gốc của mục tiêu. toneWave là đường WebAudio
     trực tiếp (như sfxWind) vì beep() chỉ phát tần tĩnh — cộng hưởng cần
     quét tần, phách hai sóng gần tần và cắt đột ngột. Mọi lớp qua cổng
     'skill', gain từng lớp <= 0,11 theo kỷ luật tông trầm. Tên hàm cũ
     sfxPha/sfxChan/sfxNameCall/sfxSealBreak GIỮ NGUYÊN (bất biến kiểm
     thử + điểm gọi), chỉ thay thân tiếng. */
  function toneWave(o) {
    if (SET && SET.sfxAllowed && !SET.sfxAllowed('skill')) return;
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)();
      var scale = SET && SET.gainScale ? SET.gainScale() : 1;
      var t0 = AC.currentTime + (o.delay || 0);
      var osc = AC.createOscillator(), g = AC.createGain();
      osc.type = o.type || 'sine';
      osc.frequency.setValueAtTime(Math.max(24, o.f0 || 440), t0);
      if (o.f1) osc.frequency.exponentialRampToValueAtTime(Math.max(24, o.f1), t0 + (o.dur || 0.2));
      var gv = Math.min(0.11, o.gain || 0.05) * scale;
      g.gain.setValueAtTime(gv, t0);
      if (o.cut) g.gain.setValueAtTime(0.0001, t0 + (o.dur || 0.2));
      else g.gain.exponentialRampToValueAtTime(0.0001, t0 + (o.dur || 0.2));
      osc.connect(g); g.connect(AC.destination); osc.start(t0); osc.stop(t0 + (o.dur || 0.2) + 0.03);
    } catch (e) { /* im lặng */ }
  }
  function noiseBurst(dur, gain, delay) {
    if (SET && SET.sfxAllowed && !SET.sfxAllowed('skill')) return;
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)();
      if (!AC.createBuffer || !AC.createBufferSource) return;
      var scale = SET && SET.gainScale ? SET.gainScale() : 1;
      var len = Math.max(1, Math.floor(AC.sampleRate * dur));
      var buf = AC.createBuffer(1, len, AC.sampleRate), ch = buf.getChannelData(0);
      for (var i = 0; i < len; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / len);
      var src = AC.createBufferSource(); src.buffer = buf;
      var g = AC.createGain(); var t0 = AC.currentTime + (delay || 0);
      g.gain.setValueAtTime(Math.min(0.11, gain || 0.03) * scale, t0);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      src.connect(g); g.connect(AC.destination); src.start(t0);
    } catch (e) { /* im lặng */ }
  }
  /* WHOOSH — tiếng gió rít của lưỡi kiếm vung (đợt walk2, giai đoạn hai):
     nhiễu qua lọc thông dải quét tần — tiếng vung cũ là hai nốt răng cưa
     tĩnh (sfxSword bản trước) nghe như tiếng bíp, không phân biệt nổi
     chiêu. Cùng kỷ luật cổng 'skill' và trần gain từng lớp như toneWave. */
  function whoosh(dur, f0, f1, gain, delay, q) {
    if (SET && SET.sfxAllowed && !SET.sfxAllowed('skill')) return;
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)();
      if (!AC.createBuffer || !AC.createBufferSource || !AC.createBiquadFilter) return;
      var scale = SET && SET.gainScale ? SET.gainScale() : 1;
      var len = Math.max(1, Math.floor(AC.sampleRate * dur));
      var buf = AC.createBuffer(1, len, AC.sampleRate), ch = buf.getChannelData(0);
      for (var i = 0; i < len; i++) ch[i] = Math.random() * 2 - 1;
      var src = AC.createBufferSource(); src.buffer = buf;
      var flt = AC.createBiquadFilter(); flt.type = 'bandpass'; flt.Q.value = q || 1.1;
      var t0 = AC.currentTime + (delay || 0);
      flt.frequency.setValueAtTime(Math.max(40, f0), t0);
      flt.frequency.exponentialRampToValueAtTime(Math.max(40, f1), t0 + dur);
      var g = AC.createGain();
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(Math.min(0.14, gain || 0.08) * scale, t0 + dur * 0.35);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      src.connect(flt); flt.connect(g); g.connect(AC.destination);
      src.start(t0); src.stop(t0 + dur + 0.03);
    } catch (e) { /* im lặng */ }
  }
  function lockNote(freq, gain, dur, delay) { toneWave({ f0: freq || 420, dur: dur || 0.09, type: 'sine', gain: gain == null ? 0.05 : gain, delay: delay || 0 }); }
  function resBaseFreqForMonster(m) {
    if (!m) return 420;
    var def = m.def || L.MONSTER_DEFS[m.species] || {};
    var f = def.cry || 420;
    if (def.rank === 'elite' || m.rank === 'elite') f *= 0.8; // tinh anh thấp hơn 20% như quy ước sfxMonsterCry
    return f;
  }
  function resBaseFreqForSpecies(species) { var def = L.MONSTER_DEFS[species] || {}; var f = def.cry || 420; if (def.rank === 'elite') f *= 0.8; return f; }
  // PHÁ ÂM: nốt khóa -> sine quét xuống nửa âm gốc trong 0,28s + tam giác
  // 55 Hz 0,4s + nhiễu nứt nhẹ ở đỉnh; nấc 4 thêm nốt quãng năm (x1,5)
  // chớp 0,12s ngay trước tiếng vỡ.
  function sfxPha(freq, tier) {
    var f = freq || 420;
    lockNote(f, 0.05, 0.09, 0);
    if ((tier || 1) >= 4) toneWave({ f0: f * 1.5, dur: 0.12, type: 'sine', gain: 0.04, delay: 0.05 });
    toneWave({ f0: f, f1: f * 0.5, dur: 0.28, type: 'sine', gain: 0.075, delay: 0.07 });
    toneWave({ f0: 55, dur: 0.4, type: 'triangle', gain: 0.09, delay: 0.07 });
    noiseBurst(0.09, 0.028, 0.2);
  }
  // CHẤN ÂM: cặp sine âm gốc + x0,98 tạo tiếng phách 0,45s lụi dần +
  // square 98 Hz cụp ở cuối. Không tiếng nứt/vỡ — dao động bị DẬP.
  function sfxChan(freq) {
    var f = freq || 420;
    lockNote(f, 0.05, 0.09, 0);
    toneWave({ f0: f, dur: 0.45, type: 'sine', gain: 0.042, delay: 0.06 });
    toneWave({ f0: f * 0.98, dur: 0.45, type: 'sine', gain: 0.042, delay: 0.06 });
    toneWave({ f0: 98, dur: 0.1, type: 'square', gain: 0.035, delay: 0.42, cut: true });
  }
  // ĐỊNH ÂM: chuông đứng yên — sine âm gốc + hài bậc hai, 0,8s, KHÔNG
  // quét/không rung; lớp sfxBell khẽ hiện tại giữ làm nền phụ.
  function sfxResDinh(freq) {
    var f = freq || 420;
    lockNote(f, 0.05, 0.09, 0);
    toneWave({ f0: f, dur: 0.8, type: 'sine', gain: 0.045, delay: 0.05 });
    toneWave({ f0: f * 2, dur: 0.8, type: 'sine', gain: 0.02, delay: 0.05 });
    sfxBell();
  }
  // PHONG ÂM: nốt khóa LỆCH x1,06 trong 0,15s -> trượt về đúng âm gốc ->
  // CẮT ĐỘT NGỘT + chuông trầm biến thể; sau đó kênh chiêu im lặng 0,3s
  // (hàm không phát thêm lớp nào sau mốc cắt — im lặng là một phần đòn).
  function sfxResPhong(freq) {
    var f = freq || 420;
    toneWave({ f0: f * 1.06, dur: 0.15, type: 'sine', gain: 0.05, delay: 0 });
    toneWave({ f0: f * 1.06, f1: f, dur: 0.14, type: 'sine', gain: 0.05, delay: 0.15, cut: true });
    toneWave({ f0: 196, dur: 0.7, type: 'triangle', gain: 0.05, delay: 0.3 });
    toneWave({ f0: 98, dur: 0.85, type: 'sine', gain: 0.04, delay: 0.3 });
  }
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
  /* Tiếng VUNG KIẾM theo chiêu (đợt walk2 giai đoạn hai — lệnh Bui
     11:49 "tiếng đánh nhau rõ ràng"): mỗi chiêu một dải gió rít riêng
     nghe phân biệt được; bản cũ hai nốt răng cưa tĩnh cho mọi chiêu.
     Đòn chờ nhịp hai (Liên Hoàn) có tiếng vung hai trễ đúng 120ms khớp
     thời điểm áp sát thương nhịp hai. */
  function sfxSword(move) {
    if (move === 'lien_hoan') { whoosh(0.10, 1000, 2800, 0.095, 0, 1.2); whoosh(0.10, 900, 2400, 0.085, 0.12, 1.2); return; }
    if (move === 'pha_quan') { whoosh(0.26, 420, 1500, 0.13, 0, 0.9); toneWave({ f0: 160, f1: 60, dur: 0.2, type: 'triangle', gain: 0.06 }); return; }
    if (move === 'quy_nhat') { whoosh(0.34, 500, 3200, 0.10, 0, 1.4); toneWave({ f0: 880, f1: 1760, dur: 0.3, type: 'sine', gain: 0.03 }); return; }
    if (move === 'huyen_tinh_tram') { whoosh(0.22, 700, 2400, 0.10, 0, 1.2); toneWave({ f0: 1180, f1: 2360, dur: 0.18, type: 'sine', gain: 0.025 }); return; }
    whoosh(0.16, 800, 2600, 0.11, 0, 1.15); toneWave({ f0: 1400, f1: 2400, dur: 0.1, type: 'sine', gain: 0.018 });
  }
  // Hồn lực (chương 5): âm trầm lạnh hai lớp, trầm và dài — không giống bất kỳ âm nào khác.
  function sfxSoul() { beep(196, 0.7, 'sine', 0.05, 'skill'); setTimeout(function () { beep(147, 0.9, 'sine', 0.045, 'skill'); }, 160); setTimeout(function () { beep(294, 0.5, 'sine', 0.025, 'skill'); }, 320); }
  /* Tiếng BƯỚC CHÂN (đợt sửa walk2 tiếp — engine trước đây thiếu hẳn):
     tiếng chạm đất ngắn và nhẹ, hai chân lệch cao độ nhẹ để nghe ra nhịp
     trái/phải; mặt 'da' (sàn đá: trấn thành, tông môn, tháp, các bí
     cảnh...) thêm tiếng gõ trong và khô, mặt 'dat' (đất/cỏ ngoài trời)
     trầm và mềm hơn. Gain giữ ~0,02-0,03 — dưới xa tiếng vung kiếm
     (0,09-0,13) để không bao giờ át tiếng đánh. Kích hoạt tại đúng
     khung chạm đất trong khối cập nhật bước (xem lastStepPhaseSfx). */
  var stepSfxN = 0, stepAlt = false, lastStepPhaseSfx = 0;
  function stepSurface() {
    var m = (state && state.map) || '';
    if (m.indexOf('bc_') === 0) return 'da';
    return (m === 'co_chau' || m === 'thanh_van_tong' || m === 'kiem_trac_thap' ||
            m === 'thap_noi' || m === 'thien_co_lau' || m === 'dai_dau_kiem') ? 'da' : 'dat';
  }
  function sfxStep(surface, alt) {
    noiseBurst(0.05, surface === 'da' ? 0.020 : 0.027);
    toneWave({ f0: alt ? 99 : 88, f1: 54, dur: 0.06, type: 'triangle', gain: 0.020 });
    if (surface === 'da') toneWave({ f0: 1750, f1: 1150, dur: 0.022, type: 'sine', gain: 0.006 });
  }
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
  /* Âm thanh RIÊNG của hình chiếu Thăng Long (đợt vá 2026-11-02, Mục E):
     ba chiêu của hình chiếu có họ âm phân biệt hẳn nhau và khác mọi âm
     chiêu thức thường — chiêu 1 thác kiếm: nốt cao trượt xuống như thác
     đổ; chiêu 2 kiếm vũ: năm tíc sắc nối nhịp mưa; chiêu 3 toàn lực:
     chuông trầm + rền thấp dồn lực. Thêm tiếng hiện hình khi hình chiếu
     tụ lại ở đầu trận (tiếng ngân lạnh hai lớp, gần họ hồn nhưng sáng
     hơn). Mọi tiếng qua cổng 'skill' như mọi âm sự kiện khác. */
  function sfxTlManifest() { beep(1318, 0.5, 'sine', 0.035, 'skill'); setTimeout(function () { beep(1760, 0.7, 'sine', 0.028, 'skill'); }, 140); setTimeout(function () { beep(880, 0.6, 'sine', 0.02, 'skill'); }, 300); }
  function sfxTlSkill1() { beep(1568, 0.22, 'sine', 0.042, 'skill'); setTimeout(function () { beep(1175, 0.26, 'sine', 0.04, 'skill'); }, 90); setTimeout(function () { beep(784, 0.4, 'triangle', 0.045, 'skill'); sfxWind(); }, 190); }
  function sfxTlSkill2() { for (var ti = 0; ti < 5; ti++) setTimeout(function () { beep(1900, 0.05, 'square', 0.022, 'skill'); }, ti * 110); }
  function sfxTlSkill3() { beep(392, 0.7, 'triangle', 0.055, 'skill'); beep(98, 0.9, 'sawtooth', 0.04, 'skill'); setTimeout(function () { sfxBell(); }, 260); }
  /* Âm thanh RIÊNG của trận tỉ thí Hoa Hướng Thần (Mục F đợt vá
     2026-11-02): ba chiêu Thất Tinh của đại đệ tử có họ âm phân biệt —
     Thất Tinh Tụ (bảy tíc leo thang), Kiếm Vũ Tinh Hà (mưa tíc dày),
     Thất Tinh Quy Nhất (trầm dồn + chuông + gió xé). Thêm tiếng vào đài
     (chuông + gió) và tiếng khán giả trầm trồ ở cao trào (tiếng reo là
     NHIỀU nốt người khẽ chồng nhau, không phải lời thoại). Mọi tiếng
     qua cổng 'skill'/'ui' như mọi âm sự kiện khác. */
  function sfxHhtEnter() { sfxBell(); sfxWind(); }
  function sfxHhtStar1() { for (var hi = 0; hi < 7; hi++) setTimeout(function (k) { beep(1180 + k * 90, 0.06, 'square', 0.02, 'skill'); }, hi * 55); }
  function sfxHhtStar2() { for (var hj = 0; hj < 9; hj++) setTimeout(function () { beep(1750, 0.045, 'square', 0.02, 'skill'); }, hj * 70); setTimeout(function () { sfxWind(); }, 300); }
  function sfxHhtStar3() { beep(330, 0.8, 'triangle', 0.06, 'skill'); beep(82, 1.0, 'sawtooth', 0.045, 'skill'); setTimeout(function () { sfxBell(); sfxWind(); }, 320); }
  /* Âm thanh thiên kiếp (docs/realm-prep/ mục 10): sấm xa trầm ở pha
     tụ mây và khi kiếp tan; tiếng sét xé + nổ trầm cho mỗi đạo lôi. */
  function sfxThunderFar() { beep(64, 1.4, 'sawtooth', 0.05, 'skill'); beep(48, 1.8, 'triangle', 0.04, 'skill'); setTimeout(function () { beep(72, 0.9, 'sawtooth', 0.028, 'skill'); }, 320); }
  function sfxBolt(hard) { beep(2800, 0.07, 'square', 0.05, 'skill'); beep(140, 0.35, 'sawtooth', 0.06, 'skill'); beep(90, 0.5, 'triangle', 0.05, 'skill'); if (hard) setTimeout(function () { beep(118, 0.45, 'sawtooth', 0.045, 'skill'); }, 90); }
  function sfxCrowd(kind) {
    if (kind === 'win') { [523, 659, 784, 1046].forEach(function (f, i) { setTimeout(function () { beep(f, 0.22, 'sine', 0.03, 'ui'); }, i * 80); }); }
    else { beep(880, 0.16, 'sine', 0.022, 'ui'); setTimeout(function () { beep(1174, 0.2, 'sine', 0.02, 'ui'); }, 110); }
  }

  /* ---------- Lồng tiếng thoại (assets/voice/ + js/voice-manifest.js) ---------- */
  var VOICE = window.VSLC_VOICE || null, voiceAudio = null;
  function voiceKey(who, text) { return sha256(who + '|' + text).slice(0, 12); }
  function stopVoice() {
    voiceSeq++; // hủy mọi chuỗi GHÉP ĐOẠN TÊN đang dang dở (đợt thay tên trong thoại)
    if (window.speechSynthesis) { try { window.speechSynthesis.cancel(); } catch (e) {} }
    if (voiceAudio) { try { voiceAudio.pause(); } catch (e) {} voiceAudio = null; }
  }

  /* ---------- THAY TÊN TRONG LỜI THOẠI (đợt 2026-11-05, lệnh Bui:
     "Câu thoại lồng tiếng thay Giang Phàm bằng tên khi người chơi đặt —
     cả lời thoại") ----------
     Tên nhân vật chính sống trong state.name (mặc định 'Giang Phàm').
     Dữ kiện gốc (story.js / thoại nội tuyến) GIỮ NGUYÊN 'Giang Phàm' —
     thay tên chỉ ở LỚP TRÌNH DIỄN: substDlgName() thay mọi xuất hiện
     đúng chuỗi 'Giang Phàm' trong câu sắp hiện bằng tên người chơi.
     Khi tên đang là mặc định, hàm trả nguyên văn từng byte (hành vi cũ
     tuyệt đối, khóa giọng không đổi).
     Lồng tiếng: câu có tiếng chứa tên được GHÉP ĐOẠN theo bản kê
     js/voice-splice-manifest.js — các đoạn văn bản nướng sẵn bằng đúng
     giọng diễn viên + tốc độ của câu (tools/build-voice-splice.js),
     xen giữa là đoạn TÊN NGƯỜI CHƠI đọc bằng Web Speech API giọng
     vi-VN tại runtime. Đây là cơ chế tạm thời đã được duyệt về kiến
     trúc: khớp giọng diễn viên tuyệt đối cho đoạn tên sẽ do backend
     online sinh bằng chính đường ống avocado sau này, bản kê ghép này
     giữ nguyên để backend tái dùng. */
  var SPLICE = window.VSLC_VOICE_SPLICE || null;
  var HERO_DEFAULT_NAME = 'Giang Phàm';
  var voiceSeq = 0; // số hiệu phiên phát: stopVoice tăng -> chuỗi ghép cũ tự hủy
  function heroName() { return (state && state.name) || HERO_DEFAULT_NAME; }
  function substDlgName(text) {
    if (typeof text !== 'string') return text;
    var nm = heroName();
    if (!nm || nm === HERO_DEFAULT_NAME || text.indexOf(HERO_DEFAULT_NAME) < 0) return text;
    return text.split(HERO_DEFAULT_NAME).join(nm);
  }
  function spliceEntryFor(key) { return (SPLICE && SPLICE.lines && SPLICE.lines[key]) || null; }
  function nameSpliceOn(key) {
    var nm = heroName();
    return !!nm && nm !== HERO_DEFAULT_NAME && !!spliceEntryFor(key);
  }
  /* Dãy bước phát của một mục ghép: đoạn tệp (bỏ qua đoạn null) xen kẽ
     đoạn tên giữa MỌI cặp đoạn liên tiếp — kể cả khi đoạn kề là null
     (câu mở đầu/kết thúc bằng chính tên). */
  function spliceStepsFor(key) {
    var sp = spliceEntryFor(key);
    if (!sp) return null;
    var steps = [];
    for (var i = 0; i < sp.parts.length; i++) {
      if (sp.parts[i]) steps.push({ f: sp.parts[i] });
      if (i < sp.parts.length - 1) steps.push({ name: true });
    }
    return steps;
  }
  /* Kế hoạch phát tiếng cho một câu — hàm quyết định DUY NHẤT mà
     playVoiceFor dùng (cổng kiểm thử đối chiếu đúng hàm này):
     {mode:'file'} tệp gốc nguyên vẹn | {mode:'fxfile'} tệp gốc qua lớp
     vang Thiên Đạo | {mode:'splice'|'splicefx', steps} ghép đoạn tên. */
  function voicePlanFor(line) {
    if (!VOICE || !line || line.who === 'choice' || line.mode === 'write') return null;
    var key = voiceKey(line.who, line.text);
    var e = VOICE.lines[key];
    if (!e) return null;
    if (nameSpliceOn(key)) {
      return { mode: e.s === 'thien_dao' ? 'splicefx' : 'splice', steps: spliceStepsFor(key), k: e.k, s: e.s, key: key };
    }
    if (e.s === 'thien_dao') return { mode: 'fxfile', f: e.f, k: e.k, s: e.s, key: key };
    return { mode: 'file', f: e.f, k: e.k, s: e.s, key: key };
  }
  /* Đọc tên người chơi bằng Web Speech API (ưu tiên giọng vi-VN của
     trình duyệt) — đoạn tên của cơ chế ghép. Không có Web Speech thì bỏ
     qua đoạn tên, các đoạn nướng sẵn vẫn phát, không lỗi. Mốc dự phòng
     2,6 giây cho trình duyệt không bắn onend. */
  function speakHeroName(volume, rate, done) {
    var ss = window.speechSynthesis;
    if (!ss || typeof SpeechSynthesisUtterance === 'undefined') { done(); return; }
    var finished = false;
    function fin() { if (!finished) { finished = true; done(); } }
    try {
      var u = new SpeechSynthesisUtterance(heroName());
      u.lang = 'vi-VN';
      try {
        var vs = ss.getVoices() || [];
        for (var i = 0; i < vs.length; i++) {
          if (vs[i].lang && vs[i].lang.toLowerCase().indexOf('vi') === 0) { u.voice = vs[i]; break; }
        }
      } catch (e) {}
      u.volume = Math.max(0, Math.min(1, volume));
      u.rate = Math.max(0.5, Math.min(1.5, rate || 1));
      u.onend = fin; u.onerror = fin;
      ss.speak(u);
      setTimeout(fin, 2600);
    } catch (e) { fin(); }
  }
  /* Phát một tệp đoạn của chuỗi ghép; useFx = chạy qua cùng chuỗi vang
     vọng của playVoiceFileFx (chỉ dùng cho đoạn tuyên đọc Thiên Đạo). */
  function playSegmentFile(file, volume, useFx, onEnded) {
    var ended = false;
    function fin() { if (!ended) { ended = true; onEnded(); } }
    try {
      var el = new Audio('assets/voice/' + file);
      el.volume = volume;
      voiceAudio = el;
      if (useFx) {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) throw new Error('no audiocontext');
        if (!voiceCtx) voiceCtx = new AC();
        if (voiceCtx.state === 'suspended' && voiceCtx.resume) voiceCtx.resume();
        var src = voiceCtx.createMediaElementSource(el);
        var dry = voiceCtx.createGain(); dry.gain.value = 1;
        var lp = voiceCtx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1100;
        var delay = voiceCtx.createDelay(1); delay.delayTime.value = 0.18;
        var fb = voiceCtx.createGain(); fb.gain.value = 0.12;
        var wet = voiceCtx.createGain(); wet.gain.value = 0.10;
        src.connect(dry); dry.connect(voiceCtx.destination);
        src.connect(lp); lp.connect(delay); delay.connect(fb); fb.connect(delay);
        delay.connect(wet); wet.connect(voiceCtx.destination);
      }
      if (el.addEventListener) { el.addEventListener('ended', fin); el.addEventListener('error', fin); }
      var pr = el.play(); if (pr && pr.catch) pr.catch(fin);
    } catch (e) { fin(); }
  }
  /* Chạy chuỗi ghép đoạn trong CÙNG một lượt phát của câu: đoạn tệp /
     tên người chơi nối liền nhau. Chuỗi mang số hiệu phiên: bất kỳ
     stopVoice() nào (qua câu, đóng thoại) cũng tăng voiceSeq và chuỗi
     cũ dừng hẳn, không phát chèn sang câu mới. Âm lượng theo đúng luật
     của câu (voiceScale theo kind — tiếng lòng vẫn khẽ như bản gốc);
     tốc độ đọc tên lấy theo tốc độ gốc của vai trong bản kê cast. */
  function playSpliceSteps(plan, volume) {
    var mySeq = voiceSeq;
    var idx = 0;
    var cast = (VOICE && VOICE.cast && VOICE.cast[plan.s]) || null;
    var rate = cast ? cast.speed / 100 : 1;
    function step() {
      if (mySeq !== voiceSeq) return;
      if (SET && SET.voiceAllowed && !SET.voiceAllowed()) return;
      if (idx >= plan.steps.length) return;
      var st = plan.steps[idx++];
      if (st.name) speakHeroName(volume, rate, step);
      else playSegmentFile(st.f, volume, plan.mode === 'splicefx', step);
    }
    step();
  }
  function playVoiceFor(line) {
    stopVoice();
    if (!VOICE || !line || line.who === 'choice' || line.mode === 'write') return;
    if (SET && SET.voiceAllowed && !SET.voiceAllowed()) return;
    var plan = voicePlanFor(line);
    if (!plan) return; // câu chưa có tiếng: rơi về tiếng chữ chạy như cũ, không lỗi
    var vol = SET && SET.voiceScale ? SET.voiceScale(plan.k) : (plan.k === 'inner' ? 0.5 : 0.9);
    if (plan.mode === 'splice' || plan.mode === 'splicefx') { playSpliceSteps(plan, vol); return; }
    if (plan.mode === 'fxfile') { playVoiceFileFx(plan.f, plan.k); return; } // giọng Thiên Đạo: luôn qua lớp vang vọng
    try {
      voiceAudio = new Audio('assets/voice/' + plan.f);
      voiceAudio.volume = vol;
      var pr = voiceAudio.play();
      if (pr && pr.catch) pr.catch(function () {});
    } catch (err) { voiceAudio = null; }
  }
  /* Tiếng Thiên Đạo tuyên đọc (docs/realm-prep/ mục 9.3): phát qua
     chuỗi WebAudio có vang vọng RIÊNG — trễ 0,18 giây, hồi tiếp 0,12,
     tỉ lệ trộn 0,10, cộng lọc trầm nhẹ. Từ 2026-11-03 (Bui duyệt ứng
     viên 2): tệp tuyên đọc đã NUNG SẴN vang sâu 4 tầng + lọc trầm
     (giọng Tenacious Mooring, tốc độ thu 68, ngắt nhịp bằng dấu câu)
     nên lớp này chỉ điểm nhẹ, tránh vang chồng vang. Lớp xử lý này
     là thứ phân biệt Thiên Đạo với mọi vai người và CHỈ áp cho vai
     thien_dao / câu tuyên đọc. Lỗi WebAudio thì rơi về phát thường,
     không chặn tuyên cáo. */
  var voiceCtx = null;
  function playVoiceFileFx(file, kind) {
    if (SET && SET.voiceAllowed && !SET.voiceAllowed()) return;
    stopVoice();
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) throw new Error('no audiocontext');
      if (!voiceCtx) voiceCtx = new AC();
      if (voiceCtx.state === 'suspended' && voiceCtx.resume) voiceCtx.resume();
      var el = new Audio('assets/voice/' + file);
      el.volume = SET && SET.voiceScale ? SET.voiceScale(kind || 'narrate') : 0.9;
      var src = voiceCtx.createMediaElementSource(el);
      var dry = voiceCtx.createGain(); dry.gain.value = 1;
      var lp = voiceCtx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1100;
      var delay = voiceCtx.createDelay(1); delay.delayTime.value = 0.18;
      var fb = voiceCtx.createGain(); fb.gain.value = 0.12;
      var wet = voiceCtx.createGain(); wet.gain.value = 0.10;
      src.connect(dry); dry.connect(voiceCtx.destination);
      src.connect(lp); lp.connect(delay); delay.connect(fb); fb.connect(delay);
      delay.connect(wet); wet.connect(voiceCtx.destination);
      voiceAudio = el;
      var pr = el.play(); if (pr && pr.catch) pr.catch(function () {});
    } catch (e) {
      try {
        voiceAudio = new Audio('assets/voice/' + file);
        voiceAudio.volume = SET && SET.voiceScale ? SET.voiceScale(kind || 'narrate') : 0.9;
        var p2 = voiceAudio.play(); if (p2 && p2.catch) p2.catch(function () {});
      } catch (e2) { voiceAudio = null; }
    }
  }
  /* Câu tuyên đọc theo CÔNG THỨC CẢNH GIỚI — ĐỌC TÊN người độ kiếp
     (Giang Phàm) ở câu Trúc Cơ + Kim Đan theo lệnh Bui 23:07 ngày
     2026-11-03, thay thiết kế cũ không đọc tên; câu dự phòng giữ
     dạng chung. Tên cũng hiện bằng chữ trên biểu ngữ và trong sổ. */
  function playThienDaoVoice(realmTo) {
    if (!VOICE || !VOICE.announce) return;
    var id = realmTo === 2 ? 'truc_co' : (realmTo === 3 ? 'kim_dan' : 'fallback');
    var a = VOICE.announce[id];
    if (!a || !a.f) return;
    /* Đợt thay tên trong thoại: tên khác mặc định và mốc tuyên đọc có
       bản kê ghép -> phát GHÉP ĐOẠN qua lớp vang như bản gốc (đoạn tệp
       đã nung vang theo công thức khóa, xem tools/build-voice-splice.js),
       đoạn tên đọc bằng Web Speech. Tên mặc định: tệp gốc nguyên vẹn. */
    var spKey = (SPLICE && SPLICE.announce && SPLICE.announce[id]) || null;
    if (spKey && nameSpliceOn(spKey)) {
      stopVoice();
      if (SET && SET.voiceAllowed && !SET.voiceAllowed()) return;
      var vol = SET && SET.voiceScale ? SET.voiceScale('narrate') : 0.9;
      playSpliceSteps({ mode: 'splicefx', steps: spliceStepsFor(spKey), k: 'narrate', s: 'thien_dao', key: spKey }, vol);
      return;
    }
    playVoiceFileFx(a.f, 'narrate');
  }

  /* Cầu kiểm chứng cho cổng kiểm thử (cùng tiền lệ window.VSLC_GUIDE):
     phơi đúng các hàm thật của cơ chế thay tên để test đối chiếu hành vi
     qua đường thật, không dò chuỗi. */
  window.VSLC_NAME_SUB = {
    subst: substDlgName,
    plan: voicePlanFor,
    say: function (lines) { say(lines); },
    heroName: heroName
  };

  /* ---------- Hiệu ứng hạt + cột sáng + chuyển cảnh (docs/effects-catalog.md) ---------- */
  var parts = [], MAX_PARTS = 90; // trần hạt đồng thời — giữ hiệu năng điện thoại
  var pillarT = 0;                // cột sáng đột phá (giây còn lại)
  var fade = { t: 0, phase: 'idle', cb: null }; // mờ chuyển cảnh — cơ chế sẵn cho cổng phần 2
  function fxOn() { return !SET || SET.current.fxParticles; }
  // Ghi chú cảm giác cày: thiết kế có "mức đồ họa Thấp" (trần hạt 40, số
  // bay 12, dừng hình giảm nửa) nhưng panel cài đặt hiện hành chỉ có các
  // công tắc hiệu ứng riêng, chưa có khóa mức chất lượng — bản này giữ
  // trần hạt chung 90 và ánh xạ phần còn lại theo từng công tắc (hạt tắt
  // = mất hẳn hạt/quầng/viên bay, đúng mục ánh xạ cài đặt của thiết kế).
  function spawnParts(x, y, n, col, spd, up) {
    if (!fxOn()) return;
    for (var i = 0; i < n && parts.length < MAX_PARTS; i++) {
      var a = Math.random() * Math.PI * 2, s = (0.3 + Math.random() * 0.7) * (spd || 26);
      parts.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s * 0.6 - (up ? 16 : 0), life: 0.9 + Math.random() * 0.7, t: 0, col: col, r: 1.4 + Math.random() * 1.8 });
    }
  }
  /* Hạt cánh hoa anh đào (gói phụ 10 — mẫu hiệu ứng của Bui): rơi chậm,
     lắc lư theo nhịp riêng; dùng thưa cho chiêu của U Nhàn và khoảnh
     khắc ở thung lũng anh đào. Chung ngân sách hạt MAX_PARTS. */
  function spawnPetals(x, y, n) {
    if (!fxOn()) return;
    for (var i = 0; i < n && parts.length < MAX_PARTS; i++) {
      parts.push({ kind: 'petal', x: x + (Math.random() - 0.5) * 36, y: y + (Math.random() - 0.5) * 14,
        vx: -8 - Math.random() * 12, vy: 7 + Math.random() * 8, life: 1.5 + Math.random() * 0.9, t: 0,
        col: '244,170,196', r: 2.4 + Math.random() * 1.8, rot: Math.random() * 3.2, vr: (Math.random() - 0.5) * 3.4, sw: Math.random() * 6.3 });
    }
  }
  /* Hạt khói lam xám (gói phụ 10): cuộn chậm, nở dần và tan — họ Huyết
     Bạc Cung (kẻ địch xuất hiện trong khói) và các vụn vỡ lớn. */
  function spawnSmoke(x, y, n, col) {
    if (!fxOn()) return;
    for (var i = 0; i < n && parts.length < MAX_PARTS; i++) {
      parts.push({ kind: 'smoke', x: x + (Math.random() - 0.5) * 22, y: y + (Math.random() - 0.5) * 8,
        vx: (Math.random() - 0.5) * 9, vy: -6 - Math.random() * 7, life: 1.1 + Math.random() * 0.7, t: 0,
        col: col || '148,163,184', r: 4 + Math.random() * 5 });
    }
  }
  /* Đợt cảnh vật map boss (04/11): hạt môi trường theo bản đồ cho các
     không gian đánh boss — sương thác/hang, bụi đá, khói lạnh mộ, khói
     hương đài đấu, lá trôi bãi phục kích. Dùng ĐÚNG họ hạt sẵn có (khói
     của spawnSmoke, chấm/lá trong parts) và ngân sách chung MAX_PARTS,
     không hệ thống mới. Chỉ phát khi hiệu ứng bật và người chơi ở gần
     điểm neo (<= 40 ô ngang / 30 ô dọc); nhịp 0,25 giây/lượt rà, mỗi
     điểm neo tối đa ~1 hạt/giây nên tổng hạt sống đồng thời của lớp này
     luôn dưới ~15. */
  var AMB_SCENERY = {
    bc_thuyliem: [
      { x: 21, y: 3, kind: 'smoke', col: '190,220,255', rate: 0.9, spread: 5 },
      { x: 10, y: 16, kind: 'dot', col: '150,200,255', rate: 0.8, spread: 6 },
      { x: 32, y: 16, kind: 'dot', col: '150,200,255', rate: 0.8, spread: 6 },
      { x: 14, y: 12, kind: 'drip', period: 0.9, spread: 0 },
      { x: 30, y: 19, kind: 'drip', period: 1.3, spread: 0 },
      { x: 36, y: 10, kind: 'drip', period: 1.1, spread: 0 },
      { x: 20, y: 27, kind: 'mote', col: '235,242,255', rate: 1.1, spread: 2 },
      { x: 12, y: 26, kind: 'dot', col: '170,210,245', rate: 0.5, spread: 2 },
      { x: 24, y: 19, kind: 'dot', col: '170,210,245', rate: 0.5, spread: 2 }],
    bc_tapha: [
      { x: 19, y: 5, kind: 'dot', col: '210,205,190', rate: 0.7, spread: 6 },
      { x: 19, y: 24, kind: 'dot', col: '210,205,190', rate: 0.5, spread: 5 },
      { x: 24, y: 15, kind: 'dot', col: '200,205,210', rate: 0.45, spread: 2 }],
    bc_tapsau: [
      { x: 19, y: 5, kind: 'dot', col: '185,185,205', rate: 0.7, spread: 6 },
      { x: 20, y: 11, kind: 'smoke', col: '150,170,200', rate: 0.35, spread: 1 },
      { x: 20, y: 11, kind: 'drip', period: 1.4, spread: 0 }],
    bc_kiemtrung: [
      { x: 23, y: 4, kind: 'smoke', col: '170,190,220', rate: 0.55, spread: 6 },
      { x: 23, y: 20, kind: 'dot', col: '200,230,255', rate: 0.6, spread: 7 },
      { x: 23, y: 10, kind: 'drip', period: 1.6, spread: 0 }],
    bc_kiemtrung_sau: [
      { x: 22, y: 5, kind: 'smoke', col: '170,190,220', rate: 0.6, spread: 5 },
      { x: 22, y: 5, kind: 'dot', col: '170,150,255', rate: 0.55, spread: 3 },
      { x: 22, y: 10, kind: 'drip', period: 1.5, spread: 0 }],
    bc_hoiphong_mo: [
      { x: 25, y: 5, kind: 'smoke', col: '160,210,190', rate: 0.55, spread: 6 },
      { x: 25, y: 32, kind: 'dot', col: '205,200,185', rate: 0.5, spread: 5 },
      { x: 23, y: 10, kind: 'drip', period: 1.2, spread: 0 }],
    dai_dau_kiem: [
      { x: 16, y: 5, kind: 'smoke', col: null, rate: 0.55, spread: 1 },
      { x: 25, y: 5, kind: 'smoke', col: null, rate: 0.55, spread: 1 },
      { x: 20, y: 14, kind: 'dot', col: '215,210,200', rate: 0.55, spread: 8 }],
    duong_mon: [
      { x: 43, y: 52, kind: 'smoke', col: '180,190,180', rate: 0.35, spread: 5 },
      { x: 43, y: 52, kind: 'leaf', col: '120,160,80', rate: 0.5, spread: 6 }],
    hb_valley: [
      { x: 49, y: 13, kind: 'leaf', col: '120,160,80', rate: 0.6, spread: 6 },
      { x: 49, y: 14, kind: 'dot', col: '205,200,185', rate: 0.45, spread: 5 }]
  };
  var ambSceneryT = 0, ambClock = 0;
  function spawnAmb(e) {
    var wx = (e.x + (Math.random() * 2 - 1) * (e.spread || 3)) * TILE + 16;
    var wy = (e.y + (Math.random() * 2 - 1) * 1.5) * TILE + 16;
    if (e.kind === 'smoke') { spawnSmoke(wx, wy, 1, e.col || undefined); return; }
    if (parts.length >= MAX_PARTS) return;
    if (e.kind === 'leaf') parts.push({ kind: 'leaf', x: wx, y: wy, vx: 6 + Math.random() * 12, vy: 3 + Math.random() * 7, life: 2.4, t: 0, col: e.col, r: 2.4, rot: Math.random() * 6.28, vr: 2 });
    else if (e.kind === 'drip') parts.push({ x: e.x * TILE + 16, y: e.y * TILE + 4, vx: 0, vy: 55, life: 0.55, t: 0, col: '170,215,255', r: 1.8 });
    else if (e.kind === 'mote') parts.push({ kind: 'petal', x: wx, y: wy, vx: 2 + Math.random() * 3, vy: 4 + Math.random() * 4, life: 3, t: 0, col: e.col, r: 1.7, rot: Math.random() * 6.28, vr: 0.6, sw: Math.random() * 6.28 });
    else parts.push({ x: wx, y: wy, vx: (Math.random() - 0.5) * 6, vy: -4 - Math.random() * 6, life: 1.8, t: 0, col: e.col, r: 1.6 });
  }
  function updateAmbScenery(dt) {
    if (!state || !fxOn()) return;
    var list = AMB_SCENERY[state.map];
    if (!list) return;
    ambSceneryT -= dt;
    if (ambSceneryT > 0) return;
    ambSceneryT = 0.25;
    ambClock += 0.25;
    var pt = playerTile();
    for (var i = 0; i < list.length; i++) {
      var e = list[i];
      if (Math.abs(pt.x - e.x) > 40 || Math.abs(pt.y - e.y) > 30) continue;
      // 'drip' phát theo NHỊP cố định (period giây, ghi mốc riêng trên
      // từng điểm neo); các loại khác phát theo xác suất rate/giây.
      if (e.period) {
        if (ambClock >= (e._nx || 0)) { spawnAmb(e); e._nx = ambClock + e.period * (0.9 + Math.random() * 0.2); }
        continue;
      }
      if (Math.random() >= e.rate * 0.25) continue;
      spawnAmb(e);
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
  // Dấu ấn của PHIÊN này, đóng vào mọi bản lưu phiên ghi (trường
  // saveSession trong dữ kiện). Nó phân biệt "mốc cao hơn do CHÍNH phiên
  // này ghi" với "mốc cao hơn do PHIÊN KHÁC ghi": chỉ dấu vết của người
  // lạ mới là bằng chứng phiên này đã cũ (xem saveNow — đợt nóng 3B).
  var sessionToken = null;
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
    else { resetPresentationState(); show('screen-create'); }
  });
  $('btn-create').addEventListener('click', function () {
    var name = $('char-name').value.trim() || 'Giang Phàm';
    var gender = document.querySelector('input[name="gender"]:checked').value;
    var st = L.newCharacter(name, gender);
    st.saveSeq = 1; // bản lưu đầu tiên của tài khoản (chỉ tạo khi chưa có bản lưu nào)
    L.saveGame(localStorage, currentUser, st);
    startGame(st);
  });
  /* Đặt lại SẠCH trạng thái trình diễn khi đổi phiên (đăng xuất/đăng nhập).
     Hộp thoại cảnh là trạng thái của PHIÊN CHƠI, không phải dữ kiện của tài
     khoản: trước đây exitToAuth chỉ tắt nhạc/tiếng và bỏ state, còn dlg,
     hàng đợi thoại, hàm gọi lại của cảnh và chính phần tử hộp thoại vẫn
     sống — đăng nhập tài khoản khác trong cùng trang là hộp thoại cũ hiện
     chồng lên phiên mới và bấm tiếp được qua thoại của tài khoản trước
     (lỗi thật bắt ở chơi thử live sáng 02/11). Mọi đường đăng xuất đều dồn
     về exitToAuth, mọi đường đăng nhập đều dồn về startGame — cả hai cùng
     gọi hàm này. Chỉ dọn trình diễn; dữ kiện truyện và luồng cảnh không đổi. */
  function resetPresentationState() {
    if (dlgTypeTimer) { clearInterval(dlgTypeTimer); dlgTypeTimer = null; }
    dlgTypeFull = null;
    dlg = null; dlgQueue = []; dlgCb = null; // đóng hộp thoại + xóa hàng đợi + hủy hàm gọi lại treo của cảnh cũ
    stopVoice();                              // dừng tiếng thoại đang phát của phiên cũ
    restoreSceneSpot();                       // NPC đang bị ghim vào cảnh đo trở về chỗ cũ
    var dEl = $('dialogue');
    if (dEl) { dEl.classList.add('hidden'); dEl.classList.remove('dlg-write', 'dlg-say'); }
    var chEl = $('dlg-choices'); if (chEl) chEl.innerHTML = ''; // nút lựa chọn của cảnh cũ biến mất hẳn, không bấm lại được
    updateDlgPortrait(null);                  // chân dung người nói của phiên cũ cũng phải tắt (gói phụ 4)
    var txEl = $('dlg-text'); if (txEl) txEl.textContent = '';
    var nmEl = $('dlg-name'); if (nmEl) nmEl.textContent = '';
    updateDlgResult(null);                    // băng kết quả cảnh đo của phiên cũ cũng phải tắt
    // Hàm gọi lại treo của chuyển cảnh đang mờ dở không được phép nổ trong phiên mới.
    fade.t = 0; fade.phase = 'idle'; fade.cb = null;
    floats = []; rings = []; parts = [];      // chữ bay/vòng sóng/hạt của phiên cũ
    pillarT = 0; shakeT = 0; flashA = 0;
    clickPath = null; clickTarget = null; pendingInteract = null; questNav = null;
    medLatch = false; keys = {};              // phím đang giữ của phiên cũ không kéo sang phiên mới
    resetJoy(); cancelPinch();
    hideConfirm();
    clearTimeout(toast._h);
    var tEl = $('toast'); if (tEl) tEl.classList.add('hidden');
    toastUnread = 0; lastToastMsg = '';
    seenQuestIds = {}; lastQuestId = null;    // khung nhiệm vụ vẽ lại thuần túy từ save mới (refreshHUD ở startGame)
    sidePanelSig = '';                        // Mục H: panel phụ cũng vẽ lại thuần túy từ save mới
    updateToastTab();
    // Làn chạm trán: trận/ quái/ vật rơi/ tinh bay cũng là trạng thái
    // phiên — dọn cùng đợt để không rò sang tài khoản kế tiếp.
    enc = null; mons = []; drops = []; orbs = []; orbBatches = {}; huntSession = null;
    foodCdUntil = 0; // nhịp chờ ăn trong trận là trạng thái phiên (đợt đồ ăn 2026-11-04) — không rò qua tài khoản
    duel = null; // trận tỉ thí kịch bản cũng là trạng thái phiên — không rò qua tài khoản (gói phụ 7)
    tlFight = null; tlSwordHeld = false; tlSub(null); // ải Thăng Long thật (gói phụ 13) cũng là trạng thái phiên
    hhtFight = null; hhtLastSkills = []; hideBossBanner(); // trận tỉ thí Hoa Hướng Thần trên đài (Mục F) cũng là trạng thái phiên
    atkFigs = []; atkFx = null; atkPanelPending = false; atkPanelShown = false; hideAtkPanel(); // hình diễn đánh đêm + tranh phân cảnh (gói phụ 8)
    kdFig = null; // hình diễn yêu thú giữ dược chương 11 (boss-fx #21+#22) cũng là trạng thái phiên
    pillars = []; streaks = []; bossFx = []; // cột sáng + vệt kiếm quang + hiệu ứng boss là trạng thái phiên (gói phụ 10)
    resFields = []; resWaves = []; resPassiveT = 9; // sân cộng hưởng + sóng khóa + nhịp nghe thụ động cũng là trạng thái phiên (bước 2 Vạn Âm)
    comboN = 0; comboT = 0; hitStopT = 0; hurtT = 0; playerHurtT = 0; ghostHp = -1; ghostPctShown = -1;
    bossPillar = null; encStance = false; zoneDwell = 0;
    hideBossBanner(); hideHuntSummary(); updateComboBox();
    musicBoss(false);
    // Làn bí cảnh + hệ cày: phiên bí cảnh, trò xếp sắc, bạn hộ tống và
    // panel bảng đều là trạng thái phiên — dọn cùng đợt, không rò sang
    // tài khoản kế tiếp; vật thể ẩn theo phiên cũng xóa hết.
    bcSession = null; bcColorSort = null; escortT = 0;
    partyBotsLive = []; bcTelegraphs = []; // bot ghép tổ + vòng báo đòn boss tổ đội cũng là trạng thái phiên
    guideFrame = null; // gói phụ H: khung dẫn đường vừa vẽ là trạng thái phiên — dọn cùng đợt
    closeGrindBoard();
    if (L.clearSessionHiddenProps) L.clearSessionHiddenProps();
  }
  function exitToAuth() {
    resetPresentationState();
    if (window.VSLC_MUSIC) VSLC_MUSIC.stop();
    currentUser = null; state = null; show('screen-auth');
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
  // Hai nút của bảng chuẩn bị thiên kiếp: Bước vào kiếp khóa bảng và
  // mở đạo lôi đầu tiên; Rút lui hoàn vật dẫn (pha tụ mây, không mất).
  $('trib-enter').addEventListener('click', function () { if (trib) beginTribBolts(); });
  $('trib-retreat').addEventListener('click', function () { tribRetreat(); });
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
  var tapDesired = null; // vector mong muốn của khung trước (đường chạm) — để xoay rẽ cong (gói E)
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
  var pinch = { active: false, pointers: {}, startDist: 0, startZoom: ZOOM_DEFAULT, anchorWorld: null, midX: 0, midY: 0, joyCancelled: false, fallback: false };
  var zoomAnchor = null; // neo lăn chuột {wx, wy, sx, sy} — sống cho tới khi zoom hiển thị bắt kịp đích
  var pinchSuppressUntil = 0; // cửa sổ nuốt sự kiện chạm/chuột tổng hợp phát sinh ngay sau khi chụm kết thúc
  var pinchPtrSeenAt = 0; // mốc lần cuối thấy sự kiện con trỏ cảm ứng — đường chụm dự phòng qua sự kiện chạm chỉ mở khi đường con trỏ câm lặng hẳn
  function zoomEnabled() { return !SET || SET.current.zoomEnabled !== false; }
  function resetZoom() {
    zoom = ZOOM_DEFAULT; zoomTarget = ZOOM_DEFAULT; zoomAnchor = null;
  }
  function cancelPinch() {
    pinch.active = false; pinch.pointers = {}; pinch.anchorWorld = null; pinch.joyCancelled = false; pinch.fallback = false;
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
    clickPath = null; clickTarget = null; pendingInteract = null; questNav = null;
    velX = 0; velY = 0;
  }
  window.addEventListener('blur', resetAllInput);
  document.addEventListener('visibilitychange', function () {
    if (document.hidden || document.visibilityState === 'hidden') resetAllInput();
  });
  var clickPath = null, clickTarget = null; // đường đi khi bấm chuột
  var clickLegFrom = null; // gốc sprite tại thời điểm phát lệnh chặng hiện tại — neo HƯỚNG CẢ CHẶNG cho lái hiển thị (đợt vá lắc 2026-11-03)
  var clickPathRaw = false;   // true khi đang đi theo đường ô THÔ (đường cứu hộ sau khi đường vuốt kẹt)
  var clickSegAnchor = null;  // gốc sprite tại điểm bắt đầu nhịp vuốt hiện tại (cho bám đuổi thuần túy)
  var pendingInteract = null; // chạm-để-tương-tác: mục tiêu đang hẹn mở tương tác khi tới nơi
  var questNav = null; // tự tìm đường làm nhiệm vụ: { targetMap, hx, hy, leg, replans, lastMap, lockMsg }
  var medLatch = false;                    // chốt thổ nạp từ nút kỹ năng
  var CHAR_LOOKS = ['player_nam', 'player_nu', 'u_nhan', 'di_ninh', 'luc_tranh', 'anh_phung', 'chinh_ngon', 'elder', 'villager_m', 'villager_f', 'villager_old', 'mac_cuu_u']; // ARCIV A.3: mac_cuu_u (chỉ huy trận, sheet đã chép)
  var PROP_TYPES = ['house_big', 'house', 'house_b', 'house_c', 'inn', 'stele', 'well', 'lantern', 'tree', 'pine', 'dummy', 'dummy_broken', 'stall', 'gate', 'jars', 'woodpile', 'rack', 'sacks',
    /* Thư viện vật thể chi tiết (đợt chi tiết bản đồ + đợt cây cỏ phần 3):
       tranh có sẵn trong assets/props, vẽ theo kích thước thật neo đáy. */
    'tree2', 'pine2', 'tree_sakura', 'bush1', 'bush2', 'rock_s', 'rock_m', 'rock_l_a', 'rock_l_b',
    /* Cây mẫu video (chỉ đạo Bui 08:48 ngày 02/11): tán tròn nhiều thùy
       ba cỡ + anh đào lớn, sản xuất riêng cho đợt làm giàu vùng săn. */
    'tree_big', 'tree_mid', 'tree_small', 'sakura_big',
    'grass_clump', 'flower_bush', 'reeds', 'lantern2', 'lantern_low', 'stele_small', 'signpost',
    'fence_post', 'bench_stone', 'table_stone', 'stone_platform', 'flower_pot', 'jar_big', 'basket',
    'bones', 'stake_cluster',
    /* Đợt làm giàu hình ảnh tông môn + gói phụ bàn trà (02/11): trụ và
       xà cổng sơn môn, lư hương đại điện, đôn đá bàn trà. */
    'gate_pillar', 'gate_beam', 'lu_huong', 'tea_stool',
    /* Đợt bí cảnh (02/11): cổng hang (khối đá + vòm hang tối, ghép từ
       chính rock_l_a) và cửa đá tàn tích trong sảnh tháp (bia đá lớn) —
       trước đây hai loại này không có trong PROP_TYPES nên cổng vô hình
       dù vẫn tương tác được. */
    'bc_gate', 'cua_tan_tich', 'kiem_cum',
    /* Đợt cảnh vật map boss (04/11): măng đá hang ướt, cột cờ tông môn,
       quan tài đá cổ mộ, thân cây cổ gãy — sprite riêng trong
       assets/props, sản xuất bằng cùng đường ống khử nền magenta.
       Vòng 2 (mở rộng toàn hang): tinh thể phát sáng + nấm phát sáng. */
    'mang_da', 'cot_co', 'quan_tai_da', 'cay_gay', 'tinh_the', 'nam_phat_sang',
    /* Đợt làm lại Cô Châu Thành (04/11): vật thể trang viên Hứa Gia —
       tường bao, trụ cổng, môn lâu, xà cổng phụ, chiếu bích, hồ sen
       (sản xuất bằng tools/build-hua-props.py). */
    'hua_wall', 'hua_wall_b', 'hua_wall_v', 'hua_pillar', 'hua_gate', 'hua_beam', 'hua_screen', 'hua_pond'];
  var ASSETS = { bgByMap: {}, chars: {}, portraits: {}, props: {}, mons: {}, monsWhite: {}, monsBad: {} };
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
  ASSETS.bgByMap.hb_valley = loadImg('assets/bg-hb_valley.png');
  ASSETS.bgByMap.thien_co_lau = loadImg('assets/bg-thien_co_lau.png');
  // Tranh nền 5 bản đồ bí cảnh (làn C đăng ký đúng tên tệp của làn B:
  // bg-bc_thuyliem/bg-bc_tapha đã có; bg-bc_tapsau/bg-bc_kiemtrung/
  // bg-bc_hoiphong_mo chưa có lúc làn C kiểm — bản đồ chưa có tranh thì
  // engine vẽ lưới ô dự phòng như mọi bản đồ chưa có tranh nền).
  ASSETS.bgByMap.bc_thuyliem = loadImg('assets/bg-bc_thuyliem.png');
  ASSETS.bgByMap.bc_tapha = loadImg('assets/bg-bc_tapha.png');
  ASSETS.bgByMap.bc_tapsau = loadImg('assets/bg-bc_tapsau.png');
  ASSETS.bgByMap.bc_kiemtrung = loadImg('assets/bg-bc_kiemtrung.png');
  ASSETS.bgByMap.bc_hoiphong_mo = loadImg('assets/bg-bc_hoiphong_mo.png');
  ASSETS.bgByMap.dai_dau_kiem = loadImg('assets/bg-dai_dau_kiem.png'); // Đài Đấu Kiếm (Mục F 2026-11-02): nền đá liền mạch sinh từ lưới thật, kiểm chứng bằng verify-bgs
  ASSETS.bgByMap.thang_long_dai = loadImg('assets/bg-thang_long_dai.png'); // Đài Thăng Long (đợt tách bản đồ riêng 2026-11-05): đỉnh núi một chỏm + đài đấu kiếm, sinh bằng tools/paint-thang-long.py, kiểm chứng bằng verify-bgs
  CHAR_LOOKS.forEach(function (id) { ASSETS.chars[id] = loadImg('assets/chars/' + id + '.png'); });
  /* Cung IV đợt 1: sheet tấn công (gốc + biến thể kiếm chỉ) và sheet pháp
     quyết của người chơi — nạp cùng đợt, vẽ qua playerAnim (mục ARCIV_FX). */
  ASSETS.atk = { nam: loadImg('assets/chars/player_nam-atk.png'), nu: loadImg('assets/chars/player_nu-atk.png'),
    namKc: loadImg('assets/chars/player_nam-atk-kiemchi.png'), nuKc: loadImg('assets/chars/player_nu-atk-kiemchi.png'),
    namPq: loadImg('assets/chars/player_nam-pq.png'), nuPq: loadImg('assets/chars/player_nu-pq.png') };
  /* Lớp trình diễn kiếm + ngự kiếm (đợt sửa walk2 tiếp — lệnh Bui 16:13
     2026-11-04): sheet bay (đứng trên kiếm) và sprite kiếm rời cho hai
     trạng thái đeo sau lưng / bay lơ lửng bên cạnh; xem swordStateNow. */
  ASSETS.fly = { nam: loadImg('assets/chars/player_nam-fly.png'), nu: loadImg('assets/chars/player_nu-fly.png') };
  ASSETS.swordLoose = loadImg('assets/chars/sword-loose.png');
  /* Bản SẠCH (không có kiếm trên lưng) của sheet đi bộ + pháp quyết —
     đợt fix4: ở trạng thái bay lơ lửng ('hover') kiếm đã rời lưng bay
     bên cạnh nên thân phải vẽ bằng bản sạch, kẻo thành HAI kiếm cùng
     lúc; bản sạch là đúng sheet trước đợt nướng (cùng khổ, cùng bố cục
     ô). Bản sạch chưa nạp kịp thì tạm không vẽ kiếm bay (giữ nguyên bao
     kiếm trên lưng như trạng thái 'back'). Chỉ người chơi dùng; NPC
     dùng sheet thường vì họ không có trạng thái bay lơ lửng. */
  ASSETS.charsClean = { player_nam: loadImg('assets/chars/player_nam-clean.png'), player_nu: loadImg('assets/chars/player_nu-clean.png') };
  ASSETS.pqClean = { nam: loadImg('assets/chars/player_nam-pq-clean.png'), nu: loadImg('assets/chars/player_nu-pq-clean.png') };
  /* Sprite kiếm TRONG BAO (assets/chars/sword-sheathed.png — bao sơn mài
     sẫm, chi tiết đồng, dây đỏ; đợt fix3) từ đợt fix4 là NGUỒN NƯỚNG:
     bao kiếm đã được nướng vào từng khung của sheet đi bộ + pháp quyết
     kèm dây đeo chéo (tools-walk2/fix4/bake_sword.py) nên engine không
     nạp/vẽ nó như sprite rời nữa. */
  // Chân dung thoại (gói phụ 4): cắt từ khung mặt trước của chính tấm
  // hình từng look (assets/portraits) — nạp trước cùng đợt để đổi người
  // nói là ảnh hiện ngay, không nhấp nháy tải.
  CHAR_LOOKS.forEach(function (id) { ASSETS.portraits[id] = loadImg('assets/portraits/' + id + '.png'); });
  // Hình quái/boss của làn chạm trán (assets/monsters): sheet 6 cột x 4
  // hàng (chờ/di chuyển/tấn công/trúng đòn+chết). Loài nào chưa có hình
  // đạt chuẩn thì KHÔNG được sinh vào thế giới (xem spawnMonstersForMap).
  var MONSTER_LOOKS = ['son_lang', 'doc_vu_xa', 'thiet_giap_tru', 'phong_ung', 'lang_vuong', 'son_chu',
    // Quái bí cảnh (làn C): cùng quy tắc ASSETS.monsBad — loài nào nạp hỏng thì loại khỏi diện sinh.
    'dong_xa', 'thuy_xa_tinh', 'thach_tuong', 'thach_tuong_thu_ve', 'tan_anh_vo_cuc', 'kiem_linh', 'kiem_y_tan_hon', 'oan_binh', 'oan_hon_chien_truong',
    'tran_nhan_kiem_linh', 'ho_tran_kiem_linh']; // ARCIV A.2: hai boss cung IV có sheet riêng đã chép
  MONSTER_LOOKS.forEach(function (id) {
    var im = loadImg('assets/monsters/' + id + '.png');
    im.onerror = function () { ASSETS.monsBad[id] = true; }; // tệp hình lỗi/không có -> loài bị loại khỏi diện săn
    ASSETS.mons[id] = im;
  });
  // ARCIV A.2: loài dùng chung sheet loài gốc (chưa có sheet riêng — khai trong hợp đồng mục E)
  ASSETS.mons.tan_hon_kiem_y_sau = ASSETS.mons.kiem_y_tan_hon;
  ASSETS.mons.lang_nhiem_song = ASSETS.mons.son_lang;
  ASSETS.bgByMap.bc_kiemtrung_sau = loadImg('assets/bg-bc_kiemtrung_sau.png');
  ASSETS.bgByMap.bc_tran_tam = loadImg('assets/bg-bc_tran_tam.png');
  ASSETS.bgByMap.bc_tran_tam_sau = loadImg('assets/bg-bc_tran_tam_sau.png');
  PROP_TYPES.forEach(function (t) { ASSETS.props[t] = loadImg('assets/props/' + t + '.png'); });
  function imgReady(im) { return !!(im && im.complete && im.naturalWidth > 0); }
  var DIR_ROW = { down: 0, up: 1, right: 2, left: 3 }; // hàng trong sheet nhân vật
  /* ---------- Đợt 8 hướng + cần cảm ứng (docs/char-sheet-8dir.md, docs/touch-joystick.md) ---------- */
  // Nhân vật đã chuyển sang sheet 8 hướng (ô 96x120, hàng = dir8, cột = khung;
  // bề rộng = số cột x 96, cao 960 — xem isChar8).
  // Nhân vật chưa có trong bảng này vẫn dùng sheet cũ 128x320 (ô 64x80, DIR_ROW).
  var CHAR8 = { player_nam: true, player_nu: true, u_nhan: true, di_ninh: true, luc_tranh: true, anh_phung: true, chinh_ngon: true, elder: true, villager_m: true, villager_f: true, villager_old: true, mac_cuu_u: true };
  var DIR8_ROW4 = { down: 0, right: 2, up: 4, left: 6 }; // hướng 4 chính -> hàng chẵn của sheet 8 hướng
  var DIR8_EVEN_DIR = { 0: 'down', 2: 'right', 4: 'up', 6: 'left' }; // hàng chẵn -> tên hướng 4 chính
  var dir8 = 0;          // hướng HIỂN THỊ riêng của người chơi (0..7); `facing` 4 hướng vẫn là hướng logic
  var dir8PendD = -1, dir8PendT = 0; // ĐIỂM 1 (vá live 2026-11-03): khu vực hướng đang chờ bền để chuyển dir8 hiển thị + thời gian đã bền (giây)
  var stepPhase = 0;     // pha bước của sheet mới: 0 đứng yên, 1..N chu kỳ bước (N = số khung bước của sheet)
  var stepTimer = 0;
  var stepAcc = 0;       // bộ tích lũy quãng đường cho pha bước (điểm ảnh đã đi chưa đủ một khung bước)
  /* ---------- Đợt ĐỘNG TÁC ĐI BỘ ĐÚNG CHUẨN (lệnh Bui 22:10 ngày 2026-11-01:
     "Đi như lướt vậy, sửa đi như đi bộ đúng các hướng") ----------
     Ba nguồn lướt đã xử lý đồng thời:
     (1) SẢI RIÊNG THEO NHÓM HƯỚNG: sải vẽ đo thật từ sheet (tools/
         measure-stride.py + đọc tâm đế giày trên ảnh phóng to) KHÁC nhau
         theo hướng — ngang nam 33 / nữ 37px thế giới một bước, chéo nam
         17 / nữ 26 (góc nhìn 3/4 nén trục), trong khi hằng số 18px duy nhất
         của gói G bắt mọi hướng chạy cùng một nhịp. STRIDE_STEP dưới đây là
         quãng đường thế giới của MỘT BƯỚC (một lần chạm đất) theo từng
         nhóm; ngưỡng qua một KHUNG = sải bước / (số khung trong nửa chu
         kỳ). Riêng nhóm dọc: sải sâu vẽ đo được chỉ ~6–10px vì chân khuất
         dưới tà áo (không đọc được độ trượt trên màn hình), nên lấy 0,75
         sải ngang để giữ NHỊP BƯỚC nhất quán giữa các hướng thay vì quay
         chu kỳ tới ~15 bước/giây.
     (2) NHÚN THÂN theo pha: bản chuẩn hóa gói G ép mọi khung cao bằng
         nhau tuyệt đối nên thân trượt phẳng như lướt. walkBobY khôi phục
         nhịp nhún 2,6px (hạ tối đa ở khung tiếp đất, nâng tối đa ở khung
         qua giữa), suy từ PHA LIÊN TỤC của bước nên khóa cứng vào chân —
         đây là chuyển động VẼ, không đổi neo logic/ô chân.
     (3) Chu kỳ dài hơn khi sheet có thêm khung (xem walkCycleFrames). */
  /* ---------- Mục D đợt vá 2026-11-02: Bui báo lại "di chuyển như lướt
     vẫn chưa khắc phục" — ĐO LẠI TOÀN DIỆN bằng harness + measure-stride
     (nhật ký .verify-logs/fix-wave-1102/mucD/): hằng số đợt trên lệch xa
     sải vẽ thật (ngang nam 33 so với 25,7 đo được; ngang nữ 37 so với
     24,7 — chân đang trồng bị kéo trượt tới +12px/bước ở nữ), và gộp
     nhóm chéo che giấu lệch theo TỪNG hướng (nữ: xuống-trái +6,6px/bước
     trong khi lên-phải −2,0). Nay hiệu chỉnh theo TỪNG HƯỚNG: STRIDE_DIR
     [dir8] = độ tách hai chân tại khung tiếp đất rộng nhất của chu kỳ,
     đo từ sheet bằng tools/measure-stride.py (độ tách chiếu lên trục đi,
     đổi px thế giới ×64/96). Hai hướng dọc không đo được (mọi khung chỉ
     một chân chạm đất — chân khuất dưới tà áo) nên giữ nguyên tắc nhịp
     0,75 × sải ngang như đợt trước, tính trên số ngang đã hiệu chỉnh.
     Hàng trái của player_nu đồng thời được bổ sung 2 khung giữa chân
     thật (tools/fix-nu-left-walk.py) — trước đó là khung TRÙNG HỆT
     (giữ nguyên hình 2 nhịp trong chu kỳ). Nhún thân 1,3 -> 2,0px:
     biên độ cũ đo harness đúng ±1,3 nhưng quá nhẹ để đọc được trên
     thân hình 64×80 khi chơi thật. ---------- */
  var STRIDE_DIR = {
    // thứ tự dir8: [xuống, xuống-phải, phải, lên-phải, lên, lên-trái, trái, xuống-trái]
    // HƯỚNG DỌC (chỉ số 0 và 4) — bổ sung đợt làm lại di chuyển
    // 2026-11-03: KHÔNG còn theo nguyên tắc 0,75 x ngang. Đo riêng
    // (tools/work/measure-stride-vert.py) xác nhận mép đáy hàng dọc bị
    // neo phẳng tuyệt đối (đáy = hàng cuối ô ở mọi khung; độ tách trục
    // dọc ~0-2px) — sheet KHÔNG mã hóa độ dài bước dọc nào để khóa
    // pha, nên neo đúng đắn duy nhất là NHỊP BƯỚC NHẤT QUÁN: sải dọc
    // = sải ngang của chính nhân vật, để cadence (bước/giây ở cùng tốc
    // độ mặt đất 132) của hướng dọc bằng hướng ngang. Trước: 19,0/
    // 18,5 -> nhịp dọc 6,4-6,6 bước/giây so với ngang 4,8 — chân đảo
    // nhanh hơn thân đi ~35%, đúng cảm giác "lướt" Bui báo nặng nhất
    // ở hướng xuống. Sau: 25,7/24,7 -> nhịp dọc ~4,9-5,1, khóa với
    // ngang. Sáu hướng ngang/chéo giữ nguyên số Mục D 2026-11-02.
    // ĐỢT LÀM LẠI DI CHUYỂN walk2 (2026-11-04, lệnh Bui 11:46 "không bị
    // gò bó — làm di chuyển như video"): sheet MỚI 25 cột (chu kỳ 24
    // khung) dựng từ tư thế cha thật + mảnh chân cắt thật đặt theo quỹ
    // đạo bước có pha chống tuyến tính (khóa chân theo thiết kế).
    // STRIDE_DIR nay THỐNG NHẤT một giá trị cho cả 8 hướng của mỗi nhân
    // vật: quãng đường mặt đất của một bước là đại lượng theo mặt đất,
    // không phụ thuộc góc nhìn — các giá trị chéo cũ mã hóa độ tách
    // CHIẾU của giày nên nhịp chéo vọt tới ~8 bước/giây so với ~5 ở
    // hướng thẳng (một nguồn gây cảm giác giật). Giá trị suy từ sải vẽ
    // thật của chu kỳ mới: sải ngang vẽ S (nam 43,7px sheet, nữ 47,3px
    // sheet — đo từ mảnh chân của hàng ngang) / (2 bước × pha chống
    // 0,52 × 96/64) = S/1,56 -> nam 28,0, nữ 30,3 px thế giới/bước;
    // nhịp ở 132px/s: nam ~4,7, nữ ~4,4 bước/giây, khớp nhịp ~4
    // bước/giây đo từ clip mẫu mau-2 của Bui.
    player_nam: [28.0, 28.0, 28.0, 28.0, 28.0, 28.0, 28.0, 28.0],
    player_nu: [30.3, 30.3, 30.3, 30.3, 30.3, 30.3, 30.3, 30.3],
    _default: [28.0, 28.0, 28.0, 28.0, 28.0, 28.0, 28.0, 28.0]
  };
  var BOB_AMP = 2.0;     // biên độ nhún thân (px thế giới): thân hạ +2,0 ở tiếp đất, nâng -2,0 ở qua giữa
  var BOB_AMP_VERT = 3.2; // biên độ nhún RIÊNG cho hướng dọc (dir8 0/4): chân bị tà áo che nên nhịp nhún là tín hiệu bước chính của hướng dọc — tăng lên 3,2 để bước đọc được (bổ sung 2026-11-03)
  var walkBobY = 0;      // độ nhún thân của khung hình hiện tại (chỉ người chơi, chỉ khi đang đi)
  function strideGroupOf(d8) {
    if (d8 % 2 === 1) return 'diag';
    return (d8 === 2 || d8 === 6) ? 'side' : 'vert';
  }
  function playerLookId() { return state && state.gender === 'nu' ? 'player_nu' : 'player_nam'; }
  // Số khung bước trong một chu kỳ của một sheet nhân vật = số cột - 1
  // (cột 0 là đứng yên), suy thẳng từ bề rộng thật của ảnh: sheet 5 cột
  // -> 4 khung, 7 cột -> 6, 13 cột -> 12, 25 cột -> 24. Ảnh chưa tải
  // xong / không đúng khổ 8 hướng thì dùng 4 như bản cũ.
  function charCycleFrames(look) {
    var im = ASSETS.chars[look];
    if (imgReady(im)) {
      var cols = Math.round(im.naturalWidth / 96);
      if (cols >= 3 && im.naturalHeight === 960) return cols - 1;
    }
    return 4;
  }
  function walkCycleFrames() { return charCycleFrames(playerLookId()); }
  // Quãng đường thế giới ứng với MỘT KHUNG bước ở hướng hiện tại:
  // sải của CHÍNH hướng dir8 đang hiển thị (Mục D 2026-11-02 — trước
  // đây lấy theo nhóm hướng nên các hướng chéo lệch nhau bị gộp chung).
  function stridePerFrame() {
    var t = STRIDE_DIR[playerLookId()] || STRIDE_DIR._default;
    return t[dir8] / (walkCycleFrames() / 2);
  }
  function isChar8(look, im) {
    // Khổ sheet 8 hướng: MỌI bề rộng là bội của 96 với ít nhất 5 cột
    // (480px = 5 cột, 672px = 7 cột, 1248px = 13 cột, 2400px = 25 cột)
    // x 8 hàng (960px), ô 96x120. Bổ sung đợt làm lại di chuyển
    // 2026-11-03: sheet người chơi mới 25 cột (nam) / 13 cột (nữ) —
    // khóa cứng 480/672 cũ làm khâu vẽ rơi về ánh xạ sheet cũ trên
    // sheet mới. Số cột thật do charCycleFrames suy từ bề rộng.
    return !!(CHAR8[look] && im && im.naturalHeight === 960 &&
      im.naturalWidth % 96 === 0 && im.naturalWidth / 96 >= 5);
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
  /* ĐIỂM 1 (đợt vá theo chơi thử live 2026-11-03) — chọn hướng HIỂN THỊ
     cho người chơi. Lỗi live: trên các quãng bấm-đi chéo NÔNG (25–40° so
     với trục), nhân vật giữ dáng hướng chính suốt quãng trong khi thân
     trôi theo đường chéo. Hai gốc cộng dồn: (i) đường vuốt gồm các đoạn
     trục/chéo nối nhau (tìm đường vòng vật cản: đoạn đầu men theo hàng,
     đoạn sau mới chéo) nên vận tốc TỨC THỜI phần lớn quãng là hướng
     chính dù hướng cả chặng là chéo; (ii) độ trễ 26,5° của
     L.dir8FromVector chốt hướng chính tới 26,5° qua biên khu vực 22,5°.
     Cách sửa (chỉ ở điểm ghi đè CUỐI khung của người chơi — các điểm gọi
     dir8FromVector ở khâu ra lệnh và logic của quái/NPC giữ nguyên):
     lượng tử hoá vector lái sang khu vực 8 hướng không trễ lớn — vector
     nằm sâu trong khu vực mới (>= 3° trong biên 22,5°) thì chuyển ngay;
     vector chỉ sát biên khu vực thì phải bền >= 0,09 giây mới chuyển
     (vùng trễ hẹp, chống rung khi đi gần thẳng trục hoặc vector dao động
     quanh biên). Khi đang bấm-đi (clickPath), vector lái là hướng từ
     nhân vật tới ĐÍCH của chặng (clickTarget) nếu thân đang thật sự đi
     về phía đích (góc lệch vận tốc <-> hướng đích <= 67,5°); nếu thân
     đang đi vòng xa khỏi hướng đích thì quay về bám vận tốc như cũ. */
  function dir8RawSector(dx, dy) {
    var k = Math.round(Math.atan2(dx, dy) / (Math.PI / 4)) % 8;
    return k < 0 ? k + 8 : k;
  }
  function steerDir8Display(vx, vy, dt, spd) {
    var raw = dir8RawSector(vx, vy);
    if (raw === dir8) { dir8PendD = -1; dir8PendT = 0; return; }
    var a = Math.atan2(vx, vy);
    var center = (raw <= 4 ? raw * 45 : (raw - 8) * 45) * Math.PI / 180;
    var diff = Math.abs(Math.atan2(Math.sin(a - center), Math.cos(a - center)));
    /* ĐỢT ĐI NHƯ THẬT 2026-11-04 (chống nhấp nháy hàng ở cuối chặng
       bấm-đi): khi thân lết chậm áp sát đích (spd < 56 px/giây), hướng
       vận tốc dao động mạnh quanh biên khu vực — vector có thể nằm sâu
       trong khu vực kề ở cả hai phía biên nên luật "sâu thì chuyển
       ngay" lật hàng qua lại từng khung (tái hiện bằng harness: cuối
       chặng chéo nông, dir8 nhảy 1<->2 mười lần trong 0,5 giây). Ở dải
       tốc này MỌI lần chuyển hàng đều phải qua điểm chờ bền, và điểm
       chờ nới lên 0,14 giây; ở tốc độ đi thường (>= 56) giữ nguyên
       hành vi cũ. Chỉ đổi hướng HIỂN THỊ, không đụng số gameplay. */
    var lowSpd = (typeof spd === 'number' && spd < 56);
    if (!lowSpd && diff <= (22.5 - 3) * Math.PI / 180) { dir8 = raw; dir8PendD = -1; dir8PendT = 0; return; }
    if (dir8PendD !== raw) { dir8PendD = raw; dir8PendT = 0; }
    dir8PendT += dt;
    if (dir8PendT >= (lowSpd ? 0.14 : 0.09)) { dir8 = raw; dir8PendD = -1; dir8PendT = 0; }
  }
  /* ---------- Cần điều khiển cảm ứng (floating joystick) ---------- */
  var JOY_R = 37; // bán kính vòng cần (px, hệ tọa độ màn hình) — Mục G đợt vá 2026-11-02: giảm ~1/3 từ 56 theo lệnh Bui (joystick bé lại)
  var JOY_KNOB_R = 17; // bán kính núm cần (px) — Mục G: giảm ~1/3 từ 26, cùng tỉ lệ với đế
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
  var BIG_SHADOW = { house: 1, house_big: 1, house_b: 1, house_c: 1, inn: 1, stele: 1, well: 1, stall: 1, gate: 1, tree: 1, pine: 1, tree2: 1, pine2: 1, tree_sakura: 1, tree_big: 1, tree_mid: 1, tree_small: 1, sakura_big: 1, gate_pillar: 1, gate_beam: 1 };
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
    de_tu_a: 'Đệ tử Thanh Vân Tông', de_tu_b: 'Đệ tử Thanh Vân Tông',
    tin_su: 'Người đưa tin của Hứa gia', gia_nhan: 'Gia nhân Hứa gia',
    /* Cung IV đợt 1: tin_su_b = người đưa tin thứ hai (nhà thế lực còn lại trong vụ tranh đất/hôn sự, ch.14); chi_huy_tran = kẻ chỉ huy đợt thử trận của Huyết Bạc Cung (ch.15) — cả hai là vai phụ dùng diện mạo chung theo tiền lệ mã phụ. */
    tin_su_b: 'Người đưa tin của nhà thế lực thứ hai', chi_huy_tran: 'Chỉ huy đợt thử trận của Huyết Bạc Cung',
    /* Cung IV đợt 2 (ch.17–20): chấp sự tháp / quan phủ / hai gia chủ / vô địch Đỗ Gia. */
    chap_su_thap: 'Chấp sự Kiểm Trắc Tháp', quan_phu: 'Quan phủ Cô Châu Thành',
    gia_chu_ta: 'Gia chủ Tạ gia', gia_chu_do: 'Gia chủ Đỗ gia', vo_dich_doi_thu: 'Vô địch của Đỗ gia',
    /* Cung IV đợt 3 (ch.21–24): trưởng đoàn thương / đại diện nhà buôn / thám báo tông. */
    truong_doan: 'Trưởng Đoàn Thương', ep_gia: 'Đại Diện Nhà Buôn', tham_bao: 'Thám Báo Tông',
    mo_cuu_u: 'Tả sứ Huyết Bạc Cung', huyet_de: 'Đệ tử Huyết Bạc Cung',
    de_tu_ho_tong: 'Đệ tử Thanh Vân Tông', bach_kinh_duong: 'Giám sát sứ Thiên Cơ Các',
    ky_luc_quan: 'Ký lục quan Thiên Cơ Các', tiep_khach: 'Người của phân đà Thiên Cơ Các',
    gac_kho: 'Người của phân đà Thiên Cơ Các'
  };
  /* Ánh xạ người nói -> look, suy từ trường look của chính dữ kiện NPC
     trong logic.js (mọi bản đồ): chân dung thoại của một nhân vật là
     khung mặt trước của đúng tấm hình game dùng để vẽ nhân vật đó trên
     bản đồ, nên danh tính không thể lệch. */
  var SPEAKER_LOOKS = {
    u_nhan: 'u_nhan', di_ninh: 'di_ninh', luc_tranh: 'luc_tranh', anh_phung: 'anh_phung',
    chinh_ngon: 'chinh_ngon', truong_lao: 'elder', dan_a: 'villager_m', dan_b: 'villager_f',
    dan_c: 'villager_old', xa_phu: 'villager_old', chu_kien_tham: 'player_nam', tran_tu_linh: 'di_ninh',
    tran_chinh_dao: 'elder', chu_quan: 'villager_old', cho_a: 'villager_m', cho_b: 'villager_f',
    duoc_su: 'villager_f', phap_khi_chu: 'villager_m', dan_thanh_a: 'villager_m', dan_thanh_b: 'villager_f',
    gia_nhan: 'villager_m', thap_chu: 'elder', thi_sinh_a: 'villager_m', thi_sinh_b: 'villager_f',
    truong_lao_tong: 'elder', lieu_khuynh_tien: 'di_ninh', tap_dich_truong: 'villager_old',
    de_tu_a: 'villager_m', de_tu_b: 'player_nam', hoa_huong_than: 'player_nam', tin_su: 'villager_m', tin_su_b: 'villager_m', chi_huy_tran: 'luc_tranh',
    de_tu_ho_tong: 'villager_m', huyet_de: 'villager_m', mo_cuu_u: 'mac_cuu_u', tiep_khach: 'villager_f',
    chap_su_thap: 'elder', quan_phu: 'elder', gia_chu_ta: 'villager_m', gia_chu_do: 'elder', vo_dich_doi_thu: 'luc_tranh',
    truong_doan: 'villager_old', ep_gia: 'villager_m', tham_bao: 'villager_m',
    bach_kinh_duong: 'elder', ky_luc_quan: 'villager_f', gac_kho: 'villager_m'
  };
  /* Chân dung của một dòng thoại (gói phụ 4 — lệnh Bui 10:02 ngày
     2026-11-02 "Khi đọc thoại có hình ảnh của nhân vật trên câu thoại"):
     lời dẫn không người nói -> không chân dung; Giang Phàm (nói thành
     tiếng, tiếng lòng, chữ viết và cả dòng lựa chọn mang tên chàng) đều
     hiện chân dung của chính chàng — chỉ là hình ảnh, luật "chữ viết
     không có tiếng" không đổi. Người nói không có dữ kiện look thì ẩn
     ảnh, tuyệt đối không mượn ảnh người khác. */
  function dlgPortraitLook(line) {
    if (!line || !line.who || line.who === 'narrate') return null;
    if (line.who === 'hero' || line.who === 'choice') return playerLookId();
    if (SPEAKER_LOOKS[line.who]) return SPEAKER_LOOKS[line.who];
    var n = npcsLive.filter(function (x) { return x.id === line.who; })[0];
    return n ? n.look : null;
  }
  function updateDlgPortrait(line) {
    var pEl = $('dlg-portrait');
    if (!pEl) return;
    var look = dlgPortraitLook(line);
    if (!look) { pEl.classList.add('hidden'); if (pEl.removeAttribute) pEl.removeAttribute('src'); return; }
    pEl.src = 'assets/portraits/' + look + '.png';
    pEl.classList.remove('hidden');
  }

  /* Tên hiển thị dự phòng cho người nói KHÔNG đứng trên bản đồ hiện tại
     (cảnh cắt song song, thư từ, người ở nơi khác): tránh hiện nguyên khóa
     kỹ thuật trên khung thoại. */
  var SPEAKER_NAMES = {
    narrate: '', hero: '', choice: '',
    u_nhan: 'Hứa U Nhàn', di_ninh: 'Hứa Di Ninh', chinh_ngon: 'Hứa Chính Ngôn',
    anh_phung: 'Vương Ánh Phụng', luc_tranh: 'Lục Tranh', truong_lao: 'Trưởng Lão Trắc Linh',
    tran_tu_linh: 'Trần Tư Linh', tran_chinh_dao: 'Trần Chính Đạo',
    truong_lao_tong: 'Trưởng Lão Thanh Vân Tông', lieu_khuynh_tien: 'Liễu Khuynh Tiên',
    hoa_huong_than: 'Hoa Hướng Thần', tap_dich_truong: 'Quản Sự Tạp Dịch',
    thap_chu: 'Chủ Trì Kiểm Trắc Tháp', chu_kien_tham: 'Chu Kiến Thâm',
    tin_su: 'Người Đưa Tin Hứa Gia', gia_nhan: 'Gia Nhân Hứa Gia',
    tin_su_b: 'Người Đưa Tin Thứ Hai', chi_huy_tran: 'Kẻ Chỉ Huy Đợt Thử Trận',
    chap_su_thap: 'Chấp Sự Tháp', quan_phu: 'Quan Phủ', gia_chu_ta: 'Gia Chủ Tạ Gia', gia_chu_do: 'Gia Chủ Đỗ Gia', vo_dich_doi_thu: 'Vô Địch Đỗ Gia',
    truong_doan: 'Trưởng Đoàn Thương', ep_gia: 'Đại Diện Nhà Buôn', tham_bao: 'Thám Báo Tông',
    mo_cuu_u: 'Mạc Cửu U', huyet_de: 'Đệ Tử Huyết Bạc Cung',
    bach_kinh_duong: 'Bạch Kính Đường', ky_luc_quan: 'Ký Lục Quan',
    tiep_khach: 'Người Tiếp Khách Phân Đà', gac_kho: 'Người Gác Kho',
    de_tu_ho_tong: 'Đệ Tử Hộ Tống', de_tu_a: 'Đệ tử Thanh Vân', de_tu_b: 'Đệ tử Thanh Vân',
    cho_a: 'Chủ sạp chợ', cho_b: 'Chủ sạp chợ', duoc_su: 'Dược Sư Hồi Xuân',
    phap_khi_chu: 'Chủ Tụ Bảo Các', chu_quan: 'Chủ Quán Vọng Châu',
    dan_thanh_a: 'Lão Ngô', dan_thanh_b: 'Dân thành', xa_phu: 'Xa phu Lão Mã'
  };


  function isTouchDevice() {
    try { return !!((window.matchMedia && window.matchMedia('(pointer: coarse)').matches) || ('ontouchstart' in window)); }
    catch (e) { return false; }
  }
  function startGame(saved) {
    // Phiên mới luôn bắt đầu từ trình diễn sạch, dù phiên trước kết thúc
    // bằng đường nào (đăng xuất thường, xóa tài khoản, hay vào thẳng).
    resetPresentationState();
    state = L.normalizeSave(saved); // save cũ: bổ sung ví Linh Thạch + cờ mở khóa theo mốc đã qua
    sessionSaveSeq = (typeof state.saveSeq === 'number' && state.saveSeq > 0) ? Math.floor(state.saveSeq) : 0;
    sessionToken = 'p' + Date.now().toString(36) + Math.floor(Math.random() * 4294967296).toString(36);
    saveStaleWarned = false;
    if (SET) {
      SET.loadFor(currentUser, localStorage, isTouchDevice());
      questMinimized = SET.current.questStart === 'min'; // cài đặt "ô nhiệm vụ khi vào game"
    }
    // Tải lại giữa phiên bí cảnh: hủy phiên, đưa người chơi ra cổng ngoài.
    if (state.map && state.map.indexOf('bc_') === 0) {
      var bcPo = L.MAPS[state.map] && L.MAPS[state.map].portals[0];
      if (bcPo) { state.map = bcPo.to; state.x = bcPo.toX; state.y = bcPo.toY; state.dir = 'down'; }
    }
    L.setActiveMap(state.map || 'tran');
    resizeCanvas();
    applyQuestMin();
    updateToastTab();
    px = state.x * TILE; py = state.y * TILE; facing = state.dir || 'up';
    dir8 = DIR8_ROW4[facing] || 0; stepPhase = 0; stepTimer = 0; stepAcc = 0; resetJoy(); velX = 0; velY = 0;
    resetZoom(); cancelPinch(); questNav = null; // phiên chơi mới luôn bắt đầu ở mức phóng mặc định 1,0×
    npcsLive = L.activeMap().npcs.map(function (n) { var pp = L.npcPosFor(state, n); return { id: n.id, name: n.name, look: n.look, x: pp.x, y: pp.y, dir: pp.dir }; }); // vị trí theo pha nhiệm vụ (gói phụ 5)
    spawnMonstersForMap(); // làn chạm trán: sinh quái vùng săn của bản đồ vào game (chỉ khi đã mở khóa săn)
    ghostHp = state.hp; ghostPctShown = -1; setGhostBar();
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
    // Cấp bù vũ khí khởi đầu cho save cũ cũng đã xong ngay trong
    // L.normalizeSave; ở đây chỉ báo một lần (cùng khuôn ltGift ở trên).
    if (state.starterWeaponJustGranted) {
      delete state.starterWeaponJustGranted;
      toast('Hứa gia phát bù thanh Thiết Kiếm Hứa Gia — vũ khí khởi đầu của ngươi (+3 kiếm / +3 lời). Từ nay nó luôn đeo bên hông; kiếm tốt hơn về sau sẽ thay thế nó.', 5200);
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
      // Mốc trong kho cao hơn mốc phiên này biết. Nếu bản lưu đó mang
      // DẤU ẤN CỦA CHÍNH PHIÊN NÀY (saveSession khớp) thì đó là dấu vết
      // ghi của chính phiên — nhận lại mốc và ghi tiếp, TUYỆT ĐỐI không
      // tự khóa mình (lỗi đợt nóng 3B: phiên đơn cửa sổ bị chính cơ chế
      // của mình từ chối lưu). Chỉ khi dấu ấn là của PHIÊN KHÁC (hoặc
      // không có dấu ấn của phiên này) mới kết luận phiên này đã cũ.
      if (sessionToken && stored.saveSession === sessionToken) {
        sessionSaveSeq = Math.floor(stored.saveSeq);
      } else {
        if (!saveStaleWarned) {
          saveStaleWarned = true;
          toast('Cảnh báo: tiến trình mới hơn đang nằm ở một phiên chơi khác. Phiên này không ghi đè lên — hãy tải lại trang để chơi tiếp từ tiến trình mới nhất.', 5600);
        }
        return false;
      }
    }
    state.saveSeq = sessionSaveSeq + 1;
    if (sessionToken) state.saveSession = sessionToken;
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
    def.props.forEach(function (p) { if (L.isSessionHidden(state.map, p.id)) return; mmCtx.fillRect(Math.round((p.x + p.w / 2) * ms) - 1, Math.round((p.y + p.h / 2) * msY) - 1, 2, 2); });
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
    // Nội suy mũ theo thời gian thật (hằng số 0,10s — nới nhẹ từ 0,085s
    // ở vòng chỉnh cảm giác 2 để camera lướt êm hơn khi đổi hướng; độ
    // lệch bám ở tốc độ tối đa đo bằng harness ~10px) — độ mượt không
    // còn phụ thuộc nhịp khung.
    var camK = 1 - Math.exp(-frameDt / 0.10);
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
    // BIỂN MÂY tông môn (gói phụ 12): các hõm giữa các đỉnh của Thanh Vân
    // Tông phủ mây trôi chậm — vẽ ngay trên nền, dưới mọi thực thể; neo
    // tại các vùng vực 'X' mới sơn nên mây nằm đúng hõm, không phủ thềm.
    // Đợt tách Đài Thăng Long (2026-11-05): đỉnh Thăng Long dùng cùng lớp
    // mây với bảng neo riêng TL_CLOUD_SEA — mây quấn quanh vách của MỘT
    // đỉnh duy nhất ở tầng thấp, hoàn thiện phần mây trôi từng ghi nợ ở
    // thềm Thăng Long cũ.
    var cloudList = state.map === 'thanh_van_tong' ? CLOUD_SEA : (state.map === 'thang_long_dai' ? TL_CLOUD_SEA : null);
    if (cloudList && fxOn()) {
      ctx.save();
      for (var ci = 0; ci < cloudList.length; ci++) {
        var ca = cloudList[ci];
        var cxx = ca[0] * TILE + 16 + Math.sin(tNow / 9000 + ci * 1.7) * 14;
        var cyy = ca[1] * TILE + 16 + Math.cos(tNow / 11000 + ci * 2.3) * 6;
        // Lớp đệm mây rộng và mờ dưới các cụm chính (đợt làm giàu
        // hình tông môn 02/11): hõm mây đọc thành một biển liền mạch
        // thay vì ba vệt rời; alpha vẫn giữ thấp để không che lối đi.
        ctx.fillStyle = 'rgba(255,255,255,0.10)';
        ctx.beginPath();
        ctx.ellipse(cxx, cyy + 2, 84, 21, 0, 0, Math.PI * 2);
        ctx.fill();
        for (var cj = 0; cj < 3; cj++) {
          ctx.fillStyle = 'rgba(255,255,255,' + (0.15 + cj * 0.05) + ')';
          ctx.beginPath();
          ctx.ellipse(cxx + (cj - 1) * 26, cyy + (cj % 2) * 7 - 3, 44 - cj * 8, 13 - cj * 2, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }
    // DẤU HIỆU BÁO TRƯỚC của ải Thăng Long (gói phụ 13): đường chém dọc
    // hiệp 1 hiện thành dải sáng đứng nhấp nháy trên mặt đài; vòng kiếm
    // vũ hiệp 2 hiện thành vòng sáng khóa tại vị trí người chơi.
    if (tlFight && fxOn()) {
      if (tlFight.phase === 'sub2' && tlFight.round === 1 && tlFight.bandX) {
        var bw = 30 + Math.sin(tNow / 60) * 4;
        var bgd = ctx.createLinearGradient(tlFight.bandX - bw, 0, tlFight.bandX + bw, 0);
        bgd.addColorStop(0, 'rgba(255,120,80,0)');
        bgd.addColorStop(0.5, 'rgba(255,150,90,' + (0.28 + Math.sin(tNow / 60) * 0.08) + ')');
        bgd.addColorStop(1, 'rgba(255,120,80,0)');
        ctx.fillStyle = bgd;
        ctx.fillRect(tlFight.bandX - bw, 5 * TILE, bw * 2, 11 * TILE);
      }
      if (tlFight.phase === 'rain') {
        for (var twi = 0; twi < tlFight.waves.length; twi++) {
          var twv = tlFight.waves[twi];
          if (twv.locked && !twv.done) {
            ctx.strokeStyle = 'rgba(255,170,120,' + (0.5 + Math.sin(tNow / 50) * 0.2) + ')';
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.ellipse(twv.tx, twv.ty, 34, 15, 0, 0, Math.PI * 2); ctx.stroke();
          }
        }
      }
      // VÒNG TRẬN CỦA HÌNH CHIẾU (Mục E, ngôn ngữ mẫu Xianxia 19:52
      // ngày 02/11): vòng trận phát sáng XANH-TRẮNG NHIỀU LỚP có phù
      // văn dưới chân hình chiếu trong SUỐT trận — hai vòng đồng tâm +
      // 10 khối phù văn xoay chậm + vũng sáng trắng nóng ở tâm; khi
      // hình chiếu đang BÁO CHIÊU (sub2/rain/charge) vòng MỞ RỘNG và
      // sáng mạnh hơn, kèm BA KIẾM ÁNH SÁNG DỰNG ĐỨNG quanh trận.
      var tfa = tlFight.fig, tcx = tfa.x + 16, tgy = tfa.y + TILE - 2;
      var tele = tlFight.phase === 'sub2' || tlFight.phase === 'rain' || tlFight.phase === 'charge';
      var tR = (tele ? 40 : 27) + Math.sin(tNow / 300) * 2, tA = tele ? 0.95 : 0.6;
      ctx.fillStyle = 'rgba(255,252,238,' + (0.35 * tA) + ')';
      ctx.beginPath(); ctx.ellipse(tcx, tgy, tR * 0.4, tR * 0.14, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(127,232,224,' + (0.85 * tA) + ')'; ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.ellipse(tcx, tgy, tR, tR * 0.34, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = 'rgba(190,246,255,' + (0.55 * tA) + ')'; ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.ellipse(tcx, tgy, tR * 0.62, tR * 0.21, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.save();
      ctx.translate(tcx, tgy); ctx.scale(1, 0.34); ctx.rotate(tNow / 1800);
      ctx.fillStyle = 'rgba(190,246,255,' + (0.75 * tA) + ')';
      for (var tri = 0; tri < 10; tri++) {
        var tra = tri * Math.PI / 5;
        ctx.save(); ctx.translate(Math.cos(tra) * tR * 0.81, Math.sin(tra) * tR * 0.81); ctx.rotate(tra + Math.PI / 2);
        ctx.fillRect(-3.2, -1.9, 6.4, 3.8);
        ctx.restore();
      }
      ctx.restore();
      if (tele) {
        // Kiếm ánh sáng dựng đứng: thân trắng nóng + quầng lam + chuôi
        // sáng ngang, lơ lửng ba phía quanh vòng trận khi báo chiêu.
        for (var tsi = -1; tsi <= 1; tsi++) {
          var tsx = tcx + tsi * 26, tsy = tgy - 52 - Math.abs(tsi) * -6 + Math.sin(tNow / 240 + tsi) * 2;
          ctx.fillStyle = 'rgba(127,232,224,0.30)';
          ctx.beginPath(); ctx.ellipse(tsx, tsy, 7, 17, 0, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,0.92)';
          ctx.fillRect(tsx - 1.4, tsy - 15, 2.8, 26);
          ctx.fillStyle = 'rgba(190,246,255,0.9)';
          ctx.fillRect(tsx - 5, tsy + 11, 10, 2.2);
        }
      }
    }
    // VÒNG TRẬN + BÁO TRƯỚC của trận đài (Mục F, ngôn ngữ mẫu Xianxia
    // 19:52 ngày 02/11 như Mục E): vòng trận xanh-trắng nhiều lớp có phù
    // văn dưới chân Hoa Hướng Thần suốt trận; khi hắn BÁO CHIÊU vòng mở
    // rộng + ba kiếm ánh sáng dựng đứng; Kiếm Vũ Tinh Hà khóa từng đợt
    // bằng vòng sáng tại vị trí người chơi; Thất Tinh Tụ báo bằng vòng
    // nguy hiểm quanh người chơi.
    if (hhtFight && fxOn()) {
      var hb = hhtFight.boss, hcx = hb.x + 16, hgy = hb.y + TILE - 2;
      var hTele = hb.phase === 'tele' || hb.phase === 'lunge';
      var hR = (hTele ? 40 : 27) + Math.sin(tNow / 300) * 2, hA = hTele ? 0.95 : 0.6;
      ctx.fillStyle = 'rgba(255,252,238,' + (0.35 * hA) + ')';
      ctx.beginPath(); ctx.ellipse(hcx, hgy, hR * 0.4, hR * 0.14, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(127,232,224,' + (0.85 * hA) + ')'; ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.ellipse(hcx, hgy, hR, hR * 0.34, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = 'rgba(190,246,255,' + (0.55 * hA) + ')'; ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.ellipse(hcx, hgy, hR * 0.62, hR * 0.21, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.save();
      ctx.translate(hcx, hgy); ctx.scale(1, 0.34); ctx.rotate(tNow / 1800);
      ctx.fillStyle = 'rgba(190,246,255,' + (0.75 * hA) + ')';
      for (var hri = 0; hri < 10; hri++) {
        var hra = hri * Math.PI / 5;
        ctx.save(); ctx.translate(Math.cos(hra) * hR * 0.81, Math.sin(hra) * hR * 0.81); ctx.rotate(hra + Math.PI / 2);
        ctx.fillRect(-3.2, -1.9, 6.4, 3.8);
        ctx.restore();
      }
      ctx.restore();
      if (hTele) {
        for (var hsi = -1; hsi <= 1; hsi++) {
          var hsx = hcx + hsi * 26, hsy = hgy - 52 + Math.sin(tNow / 240 + hsi) * 2;
          ctx.fillStyle = 'rgba(127,232,224,0.30)';
          ctx.beginPath(); ctx.ellipse(hsx, hsy, 7, 17, 0, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,0.92)';
          ctx.fillRect(hsx - 1.4, hsy - 15, 2.8, 26);
          ctx.fillStyle = 'rgba(190,246,255,0.9)';
          ctx.fillRect(hsx - 5, hsy + 11, 10, 2.2);
        }
      }
      if (hb.phase === 'tele' && hb.skillId === 'star2') {
        for (var hwi = 0; hwi < hb.stars.length; hwi++) {
          var hwv = hb.stars[hwi];
          if (hwv.locked && !hwv.done) {
            ctx.strokeStyle = 'rgba(255,170,120,' + (0.5 + Math.sin(tNow / 50) * 0.2) + ')';
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.ellipse(hwv.tx, hwv.ty, 34, 15, 0, 0, Math.PI * 2); ctx.stroke();
          }
        }
      }
      if (hb.phase === 'tele' && hb.skillId === 'star1') {
        // Vòng báo nới KHỚP vùng trúng thật 120px (parent quyết khi gộp
        // đợt hiệu ứng boss: trước đây vẽ 52x30 trong khi điều kiện
        // trúng ở updateHhtFight là dist < 120 — chỉ đổi hình vẽ vòng
        // báo, vùng trúng và sát thương giữ nguyên; tỉ lệ nén dọc
        // 30/52 được giữ nguyên theo bán kính mới: 120 x 0,577 ~ 69).
        ctx.strokeStyle = 'rgba(255,150,90,' + (0.45 + Math.sin(tNow / 60) * 0.15) + ')';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(px + 16, py + 16, 120, 69, 0, 0, Math.PI * 2); ctx.stroke();
      }
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
    // Vật phẩm rơi đang nằm/chờ trên đất (vật đang bay về túi vẽ ở lớp
    // màn hình cuối khung).
    drops.forEach(function (dr) { if (dr.phase !== 'fly') drawGroundDrop(dr); });
    // danh sách vẽ theo chiều sâu (vật thể thật + trang trí thị giác + NPC + biển + người chơi)
    var draws = [];
    defR.props.forEach(function (p) { if (L.isSessionHidden(state.map, p.id)) return; draws.push({ depth: (p.y + p.h) * TILE, kind: 'prop', p: p }); });
    if (state.map === 'tran') VISUAL_DECOR.forEach(function (d2) { draws.push({ depth: d2.depth, kind: 'decor', dc: d2 }); });
    npcsLive.forEach(function (n) { draws.push({ depth: (n.y + 1) * TILE, kind: 'npc', n: n }); });
    mons.forEach(function (mn) { if (mn.state !== 'gone') draws.push({ depth: mn.y + TILE, kind: 'mon', m: mn }); });
    atkFigs.forEach(function (af) { draws.push({ depth: af.py + TILE, kind: 'atkfig', f: af }); }); // kẻ địch đánh đêm (gói phụ 8)
    if (kdFig) draws.push({ depth: kdFig.py + TILE, kind: 'kdbeast', f: kdFig }); // yêu thú giữ dược chương 11 — hình diễn đường A (boss-fx #21+#22)
    if (tlFight) draws.push({ depth: tlFight.fig.y + TILE, kind: 'tlfig', f: tlFight.fig }); // hình chiếu Thăng Long (gói phụ 13)
    if (hhtFight) { draws.push({ depth: hhtFight.boss.y + TILE, kind: 'hhtboss', f: hhtFight.boss }); HHT_AUDIENCE.forEach(function (au, aui) { draws.push({ depth: (au.y + 1) * TILE, kind: 'hhtaud', a: au, i: aui }); }); } // Mục F: Hoa Hướng Thần + vòng đệ tử đứng xem trên đài
    if (daiFight) { draws.push({ depth: daiFight.boss.y + TILE, kind: 'daiboss', f: daiFight.boss }); HHT_AUDIENCE.forEach(function (au, aui) { draws.push({ depth: (au.y + 1) * TILE, kind: 'hhtaud', a: au, i: aui }); }); } // ARCIV ch.13: đài thách đấu dùng chung vòng khán giả quanh đài
    if (arcFig) arcFig.figs.forEach(function (fg) { if (!fg.dead) draws.push({ depth: fg.y + TILE, kind: 'arcfig', f: fg }); }); // ARCIV ch.14/15: figure người của trận kịch bản dã ngoại
    if (arcFig && arcFig.escorts) arcFig.escorts.forEach(function (es) { draws.push({ depth: es.y + TILE, kind: 'arcfig', f: es }); }); // ARCIV đợt 2 ch.19: nhân chứng hộ tống vẽ qua cùng nhánh arcfig (thanh máu + nhãn tên)
    partyBotsLive.forEach(function (pb2) { draws.push({ depth: pb2.y + TILE, kind: 'partybot', b: pb2 }); }); // bot ghép tổ Trận Tâm: vẽ như figure người, nhánh riêng 'partybot'
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
          // Loại vật mới của đợt chi tiết bản đồ chỉ có ảnh thật, chưa có
          // sprite điểm dự phòng: ảnh chưa nạp thì BỎ QUA lần vẽ này (ẩn hẳn
          // cho tới khi ảnh sẵn sàng) thay vì sập vòng vẽ.
          if (spr) {
            var dw = spr.w * sc, dx = (p.x + p.w / 2) * TILE - dw / 2, dy = (p.y + p.h) * TILE - spr.h * sc;
            drawSprite(spr, dx, dy, sc);
          }
        }
        if (p.id === 'bia_trac_linh' && !state.flags.tested) drawMarker(p.x * TILE + TILE, p.y * TILE - 14);
        if ((p.type === 'lantern' || p.type === 'lantern2' || p.type === 'lantern_low') && fxOn()) {
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
          ctx.drawImage(nim, nsrc.x, nsrc.y, nsrc.w, nsrc.h, n.x * TILE + 16 - 32 + (n.ox || 0), (n.y + 1) * TILE - 80 + (n.oy || 0), 64, 80);
          nTop = (n.y + 1) * TILE - 80 + (n.oy || 0);
          // Thanh máu trận tỉ thí (gói phụ 7): chỉ hai đấu thủ, vẽ ngay trên đầu.
          if (duel && (n === duel.u || n === duel.l)) {
            var dhp = n === duel.u ? duel.uHp / DUEL_U_MAX : duel.lHp / DUEL_L_MAX;
            var dbx = n.x * TILE + 16 + (n.ox || 0) - 23, dby = nTop - 12;
            ctx.fillStyle = 'rgba(10,10,10,0.62)'; ctx.fillRect(dbx - 1, dby - 1, 48, 7);
            ctx.fillStyle = dhp > 0.35 ? '#7ec850' : '#e04c3c'; ctx.fillRect(dbx, dby, 46 * Math.max(0, dhp), 5);
          }
        } else {
          drawSprite(S.charSprite(n.look, n.dir, 0), n.x * TILE, n.y * TILE - 8, 2);
          nTop = n.y * TILE - 8;
        }
        labels.push({ key: n.id, name: n.name, title: TITLES[n.id] || '', cx: n.x * TILE + 16, wantY: nTop - 6 - 24, color: '#ffffff' });
      } else if (d.kind === 'tlfig') {
        // Hình chiếu Liễu Khuynh Tiên (gói phụ 13): bản sao phát sáng bán
        // trong suốt của một nữ kiếm tu — quầng sáng lam dưới chân, thân
        // hình mờ dần; khi lao đòn kéo vệt sáng dài sau lưng.
        var tf = d.f;
        ctx.save();
        ctx.fillStyle = 'rgba(140,220,255,0.30)';
        ctx.beginPath(); ctx.ellipse(tf.x + 16, tf.y + TILE - 2, 17, 6, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(180,240,255,0.65)'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.ellipse(tf.x + 16, tf.y + TILE - 2, 17 + Math.sin(tNow / 300) * 2, 6, 0, 0, Math.PI * 2); ctx.stroke();
        // Quầng hào quang ôm thân (Mục E): hai lớp elip sáng sau lưng —
        // lớp ngoài lam nhạt rộng, lớp trong trắng-lam sát thân — để mắt
        // đọc ngay "bóng chiếu phát sáng" trước cả khi thấy độ mờ.
        ctx.fillStyle = 'rgba(140,215,255,0.16)';
        ctx.beginPath(); ctx.ellipse(tf.x + 16, tf.y - 10, 30, 44, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(220,248,255,0.13)';
        ctx.beginPath(); ctx.ellipse(tf.x + 16, tf.y - 10, 21, 36, 0, 0, Math.PI * 2); ctx.fill();
        var tfim = ASSETS.chars['player_nu'];
        ctx.globalAlpha = tlProjectionAlpha(); // bán trong suốt CHỚP NHẸ 0,50–0,82 quanh 0,66 (Mục E) — thay mức tĩnh 0,78 cũ
        if (imgReady(tfim)) {
          var tsrc = charSrc('player_nu', tfim, tf.dir, DIR8_ROW4[tf.dir] || 0, tf.lunging ? (Math.floor(tf.walkT * 10) % charCycleFrames('player_nu')) : 0, 0);
          ctx.drawImage(tfim, tsrc.x, tsrc.y, tsrc.w, tsrc.h, tf.x - 16, tf.y - 48, 64, 80);
        } else {
          drawSprite(S.charSprite('player_nu', tf.dir, 0), tf.x, tf.y - 8, 2);
        }
        ctx.globalAlpha = 1;
        // Viền sáng quanh thân: nét elip mảnh bao khung hình, nhấp nháy
        // lệch pha với độ mờ thân — dấu hiệu "chiếu" thứ ba sau độ mờ và
        // hào quang (Mục E).
        ctx.strokeStyle = 'rgba(190,242,255,' + (0.35 + 0.25 * Math.sin(tNow / 170)) + ')'; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.ellipse(tf.x + 16, tf.y - 10, 25, 41, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
        labels.push({ key: 'tl_fig', name: 'Hình Chiếu Liễu Khuynh Tiên', title: 'Thăng Long Đạo', cx: tf.x + 16, wantY: tf.y - 48 - 30, color: '#bfeaff' });
      } else if (d.kind === 'atkfig') {
        // Kẻ bịt mặt đánh đêm (gói phụ 8): cùng ống vẽ nhân vật 8 hướng,
        // khung đi theo nhịp bước khi đang di chuyển, chao đảo khi trúng
        // đòn Ngôn Linh; tên cầm đầu có nhãn riêng và sợi tơ đen.
        var af = d.f;
        var ajx = af.mode === 'stagger' ? Math.sin(af.t * 42 + af.seed * 3) * 2.2 : 0;
        ctx.fillStyle = 'rgba(24,34,18,0.28)';
        ctx.beginPath(); ctx.ellipse(af.px + 16 + ajx, af.py + TILE - 2, 13, 4.5, 0, 0, Math.PI * 2); ctx.fill();
        var afim = ASSETS.chars[af.look];
        if (imgReady(afim)) {
          var afMoving = af.mode === 'enter' || af.mode === 'flee' || af.mode === 'advance' || af.mode === 'lunge' || af.mode === 'retreat' || af.mode === 'search';
          var afsrc = charSrc(af.look, afim, af.dir, DIR8_ROW4[af.dir] || 0, afMoving ? (Math.floor(af.walkT * 8) % charCycleFrames(af.look)) : 0, 0);
          ctx.drawImage(afim, afsrc.x, afsrc.y, afsrc.w, afsrc.h, af.px - 16 + ajx, af.py - 48, 64, 80);
        } else {
          drawSprite(S.charSprite(af.look, af.dir, 0), af.px, af.py - 8, 2);
        }
        if (af.leader) labels.push({ key: 'atk_leader', name: 'Tên Cầm Đầu', title: 'Huyết Bạc Cung', cx: af.px + 16, wantY: af.py - 48 - 30, color: '#ffb0a0' });
      } else if (d.kind === 'kdbeast') {
        // Yêu thú giữ dược (boss-fx #21+#22): sheet son_chu sẵn có — hàng 0 đứng / 1 đi / 2 lao / 3 gục (khung chết), cùng quy ước monSrc.
        var kf2 = d.f, ksize = MON_SHEET.son_chu || 136;
        var kfx = kf2.px + 16, kfy = kf2.py + 32;
        contactShadow(kfx, kfy - 2, ksize * 0.72);
        var kim = ASSETS.mons['son_chu'];
        if (imgReady(kim)) {
          var kcw = kim.naturalWidth / 6, kch = kim.naturalHeight / 4, krow = 0, kcol = 0;
          if (kf2.mode === 'collapse') { krow = 3; kcol = kf2.collapseT < 0.3 ? 1 : (kf2.collapseT < 0.65 ? 2 : 3); }
          else if (kf2.mode === 'lunge') { krow = 2; kcol = 1; }
          else if (kf2.mode === 'enter' || kf2.mode === 'retreat') { krow = 1; kcol = Math.floor(kf2.walkT * 8) % 4; }
          else { krow = 0; kcol = Math.floor(tNow / 600) % 2; }
          ctx.save();
          if (kf2.mode === 'collapse') ctx.globalAlpha = Math.max(0, 1 - kf2.collapseT / 1.5);
          ctx.drawImage(kim, kcol * kcw, krow * kch, kcw, kch, kfx - ksize / 2, kfy - ksize, ksize, ksize);
          ctx.restore();
          ctx.globalAlpha = 1;
          if (kf2.eyesGlow) {
            // Đợt 2: hai mắt đỏ phát sáng, nhấp nháy NHANH DẦN theo eyeT (chu kỳ co từ ~170ms xuống sàn 45ms).
            var eper = Math.max(45, 170 - kf2.eyeT * 18);
            var ea = 0.55 + 0.45 * Math.sin(tNow / eper);
            ctx.fillStyle = 'rgba(255,60,40,' + (ea * 0.35).toFixed(3) + ')';
            ctx.beginPath(); ctx.arc(kfx - 10, kfy - ksize * 0.78, 6, 0, Math.PI * 2); ctx.arc(kfx + 10, kfy - ksize * 0.78, 6, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = 'rgba(255,70,45,' + ea.toFixed(3) + ')';
            ctx.beginPath(); ctx.arc(kfx - 10, kfy - ksize * 0.78, 2.8, 0, Math.PI * 2); ctx.arc(kfx + 10, kfy - ksize * 0.78, 2.8, 0, Math.PI * 2); ctx.fill();
          }
        }
      } else if (d.kind === 'hhtboss') {
        // Hoa Hướng Thần trên đài (Mục F): thân hình ĐẶC như người thật
        // (khác hẳn hình chiếu bán trong suốt), chớp sáng khi trúng đòn,
        // thanh máu riêng trên đầu + nhãn đại đệ tử.
        var hf = d.f;
        var hvx = hf.resVibT > 0 ? Math.sin(tNow / 16) * 2.6 * Math.min(1, hf.resVibT / 0.2) : 0; // rung chấn khi trúng đòn cộng hưởng (thuần vẽ)
        ctx.fillStyle = 'rgba(24,34,18,0.28)';
        ctx.beginPath(); ctx.ellipse(hf.x + 16, hf.y + TILE - 2, 13, 4.5, 0, 0, Math.PI * 2); ctx.fill();
        var hfim = ASSETS.chars['player_nam'];
        if (imgReady(hfim)) {
          var hsrc = charSrc('player_nam', hfim, hf.dir, DIR8_ROW4[hf.dir] || 0, (hf.phase === 'chase' || hf.phase === 'lunge') && (Math.abs(hf.x - (hf._lx || hf.x)) > 0.1 || Math.abs(hf.y - (hf._ly || hf.y)) > 0.1) ? (Math.floor(hf.walkT * 8) % charCycleFrames('player_nam')) : 0, 0);
          ctx.drawImage(hfim, hsrc.x, hsrc.y, hsrc.w, hsrc.h, hf.x - 16 + hvx, hf.y - 48, 64, 80);
        } else {
          drawSprite(S.charSprite('player_nam', hf.dir, 0), hf.x + hvx, hf.y - 8, 2);
        }
        hf._lx = hf.x; hf._ly = hf.y;
        if (hf.flashT > 0) { ctx.fillStyle = 'rgba(255,80,60,' + (0.35 * hf.flashT / 0.18).toFixed(3) + ')'; ctx.fillRect(hf.x - 14 + hvx, hf.y - 46, 60, 78); }
        var hbx = hf.x + 16 - 23, hby = hf.y - 62;
        ctx.fillStyle = 'rgba(10,10,10,0.62)'; ctx.fillRect(hbx - 1, hby - 1, 48, 7);
        ctx.fillStyle = hf.hp / hf.hpMax > 0.35 ? '#7ec850' : '#e04c3c'; ctx.fillRect(hbx, hby, 46 * Math.max(0, hf.hp / hf.hpMax), 5);
        labels.push({ key: 'hht_boss', name: 'Hoa Hướng Thần', title: 'Đại đệ tử Thanh Vân Tông', cx: hf.x + 16, wantY: hf.y - 48 - 30, color: '#ffe9b0' });
      } else if (d.kind === 'daiboss' || d.kind === 'arcfig') {
        // ARCIV đợt 1b: đấu thủ đài thách đấu + figure người của trận
        // kịch bản dã ngoại — cùng ống vẽ nhân vật 8 hướng như hhtboss,
        // nhưng nhãn/thanh máu/diện mạo lấy từ chính figure (HHT khóa
        // cứng Hoa Hướng Thần). Dấu ĐỊNH (vòng tím) / PHONG (khung
        // vàng) vẽ như đường quái để người chơi đọc trạng thái.
        var df = d.f;
        if (df.monsterLook) {
          // ARCIV đợt 2 ch.20: entity hồn loạn dùng HÌNH QUÁI — vẽ theo
          // ống quái (khung đứng yên của loài + lớp flash của drawMonster)
          // rồi phủ thanh máu + nhãn như figure thường.
          var pseudo = { species: df.monsterLook, x: df.x, y: df.y, state: 'alive', hp: df.hp, hpMax: df.hpMax, flashT: df.flashT || 0, resVibT: df.resVibT || 0, holdT: df.holdT || 0, sealT: df.sealT || 0, kbT: 0, kbx: 0, kby: 0, shakeT: 0, atkAnimT: 0, face: 1, rank: 'boss', name: df.name, lairX: 0, lairY: 0, movingNow: false, deathT: 0 };
          drawMonster(pseudo, labels);
          var mbx = df.x + 16 - 23, mby = df.y - 30;
          ctx.fillStyle = 'rgba(10,10,10,0.62)'; ctx.fillRect(mbx - 1, mby - 1, 48, 7);
          ctx.fillStyle = df.hp / df.hpMax > 0.35 ? '#b48ce8' : '#e04c3c'; ctx.fillRect(mbx, mby, 46 * Math.max(0, df.hp / df.hpMax), 5);
          return;
        }
        var dvx = df.resVibT > 0 ? Math.sin(tNow / 16) * 2.6 * Math.min(1, df.resVibT / 0.2) : 0;
        ctx.fillStyle = 'rgba(24,34,18,0.28)';
        ctx.beginPath(); ctx.ellipse(df.x + 16, df.y + TILE - 2, 13, 4.5, 0, 0, Math.PI * 2); ctx.fill();
        var dfim = ASSETS.chars[df.look];
        if (imgReady(dfim)) {
          var dfMoving = Math.abs(df.x - (df._lx || df.x)) > 0.1 || Math.abs(df.y - (df._ly || df.y)) > 0.1;
          var dfsrc = charSrc(df.look, dfim, df.dir, DIR8_ROW4[df.dir] || 0, dfMoving ? (Math.floor(df.walkT * 8) % charCycleFrames(df.look)) : 0, 0);
          ctx.drawImage(dfim, dfsrc.x, dfsrc.y, dfsrc.w, dfsrc.h, df.x - 16 + dvx, df.y - 48, 64, 80);
        } else {
          drawSprite(S.charSprite(df.look, df.dir, 0), df.x + dvx, df.y - 8, 2);
        }
        df._lx = df.x; df._ly = df.y;
        if (df.flashT > 0) { ctx.fillStyle = 'rgba(255,80,60,' + (0.35 * df.flashT / 0.18).toFixed(3) + ')'; ctx.fillRect(df.x - 14 + dvx, df.y - 46, 60, 78); }
        if (df.holdT > 0) { ctx.strokeStyle = 'rgba(170,120,255,0.9)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(df.x + 16, df.y + 10, 24, 0, Math.PI * 2); ctx.stroke(); }
        if (df.sealT > 0) { ctx.strokeStyle = 'rgba(255,214,120,0.9)'; ctx.lineWidth = 2; ctx.strokeRect(df.x - 8, df.y - 34, 48, 62); }
        if (df.champ && df.shieldT > 0) { ctx.strokeStyle = 'rgba(255,214,150,' + (0.65 + 0.25 * Math.sin(tNow / 140)) + ')'; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.ellipse(df.x + 16, df.y + 8, 30, 40, 0, 0, Math.PI * 2); ctx.stroke(); } // đợt 2 ch.18: vòng khiên HỘ THỂ quanh quán quân
        if (df.injured) { ctx.fillStyle = 'rgba(190,40,30,0.30)'; ctx.fillRect(df.x - 12, df.y + 18, 56, 10); } // đợt 2 ch.19: nhân chứng bị thương nằm lại — dải đỏ ngang thân
        var dbx = df.x + 16 - 23, dby = df.y - 62;
        ctx.fillStyle = 'rgba(10,10,10,0.62)'; ctx.fillRect(dbx - 1, dby - 1, 48, 7);
        ctx.fillStyle = df.hp / df.hpMax > 0.35 ? '#7ec850' : '#e04c3c'; ctx.fillRect(dbx, dby, 46 * Math.max(0, df.hp / df.hpMax), 5);
        labels.push({ key: 'df_' + df.name, name: df.name, title: df.title || '', cx: df.x + 16, wantY: df.y - 48 - 30, color: '#ffe9b0' });
      } else if (d.kind === 'partybot') {
        // Bot ghép tổ Trận Tâm: sheet theo vai trò qua cùng ống nhân vật
        // 8 hướng; gục thì vẽ xám mờ + nhãn 'gục'; thanh máu hiện khi
        // đang trong trận hoặc khi đã mất máu.
        var bot = d.b, bDown = bot.state === 'down';
        ctx.save();
        if (bDown) ctx.globalAlpha = 0.45;
        ctx.fillStyle = 'rgba(24,34,18,0.28)';
        ctx.beginPath(); ctx.ellipse(bot.x + 16, bot.y + TILE - 2, 13, 4.5, 0, 0, Math.PI * 2); ctx.fill();
        var bim = ASSETS.chars[bot.sprite];
        if (imgReady(bim)) {
          var bsrc = charSrc(bot.sprite, bim, bot.dir, DIR8_ROW4[bot.dir] || 0, (!bDown && bot.movingNow) ? (Math.floor(bot.walkT * 8) % charCycleFrames(bot.sprite)) : 0, 0);
          if (bDown) ctx.filter = 'grayscale(1)';
          ctx.drawImage(bim, bsrc.x, bsrc.y, bsrc.w, bsrc.h, bot.x - 16, bot.y - 48, 64, 80);
          ctx.filter = 'none';
        } else if (!bDown) {
          drawSprite(S.charSprite(bot.sprite, bot.dir, 0), bot.x, bot.y - 8, 2);
        }
        ctx.restore();
        if (enc || bot.hp < bot.hpMax) {
          var bbx = bot.x + 16 - 23, bby = bot.y - 62;
          ctx.fillStyle = 'rgba(10,10,10,0.62)'; ctx.fillRect(bbx - 1, bby - 1, 48, 7);
          ctx.fillStyle = bot.hp / bot.hpMax > 0.35 ? '#7ec850' : '#e04c3c'; ctx.fillRect(bbx, bby, 46 * Math.max(0, bot.hp / bot.hpMax), 5);
        }
        labels.push({ key: 'bot_' + bot.botId, name: bot.name, title: bDown ? 'gục' : '', cx: bot.x + 16, wantY: bot.y - 48 - 30, color: bDown ? '#c9c9c9' : '#bfeaff' });
      } else if (d.kind === 'hhtaud') {
        // Đệ tử đứng xem (Mục F): đứng yên ngoài bệ đấu, nhúc nhích theo
        // nhịp thở (lệch dọc ±1,5px theo pha riêng), mặt hướng vào đài —
        // hướng đã chốt sẵn trong HHT_AUDIENCE theo vị trí vòng.
        var au2 = d.a;
        var sway = Math.sin(tNow / 900 + d.i * 1.3) * 1.5;
        ctx.fillStyle = 'rgba(24,34,18,0.22)';
        ctx.beginPath(); ctx.ellipse(au2.x * TILE + 16, (au2.y + 1) * TILE - 2, 12, 4, 0, 0, Math.PI * 2); ctx.fill();
        var auim = ASSETS.chars[au2.look];
        if (imgReady(auim)) {
          var asrc = charSrc(au2.look, auim, au2.dir, DIR8_ROW4[au2.dir] || 0, 0, 0);
          ctx.drawImage(auim, asrc.x, asrc.y, asrc.w, asrc.h, au2.x * TILE + 16 - 32, (au2.y + 1) * TILE - 80 + sway, 64, 80);
        } else {
          drawSprite(S.charSprite(au2.look, au2.dir, 0), au2.x * TILE, au2.y * TILE - 8 + sway, 2);
        }
      } else if (d.kind === 'mon') {
        drawMonster(d.m, labels);
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
        var bf = (typeof bodyFrameNow === 'function') ? bodyFrameNow() : null;
        var swState = (typeof swordStateNow === 'function') ? swordStateNow(bf) : 'back';
        // Bóng tiếp xúc: neo thị giác của điểm chạm đất — luôn ôm sát
        // chân và KHÔNG nhún theo thân (tiêu chí chạm đất, Bui 16:13
        // 2026-11-04). Khi cưỡi kiếm bay bóng nhỏ và nhạt đi nhưng vẫn
        // giữ đúng điểm đất dưới chân.
        if (swState === 'ride') {
          ctx.fillStyle = 'rgba(24,34,18,0.16)';
          ctx.beginPath(); ctx.ellipse(px + 16, py + TILE - 2, 11, 3.6, 0, 0, Math.PI * 2); ctx.fill();
        } else {
          ctx.fillStyle = 'rgba(24,34,18,0.28)';
          ctx.beginPath(); ctx.ellipse(px + 16, py + TILE - 2, 13, 4.5, 0, 0, Math.PI * 2); ctx.fill();
        }
        var plim = ASSETS.chars[look], pTop;
        var flyIm = ASSETS.fly && ASSETS.fly[state.gender === 'nu' ? 'nu' : 'nam'];
        if (swState === 'ride' && imgReady(flyIm)) {
          // Cưỡi kiếm: sheet bay riêng (kiếm dưới chân trong sheet),
          // thân nâng khỏi mặt đất, bóng đất giữ nguyên ở dưới.
          var flyCol = moving ? Math.floor(tNow / 110) % 5 : 0;
          ctx.drawImage(flyIm, flyCol * 96, dir8 * 120, 96, 120, px + 16 - 32, py + 32 - 80 - 20, 64, 80);
          pTop = py + 32 - 80 - 20;
          labels.push({ key: '__player', name: state.name, title: L.realmName(state.realm, state.stage), cx: px + 16, wantY: pTop - 6 - 24, color: '#ffe9a8' });
          return;
        }
        if (imgReady(plim)) {
          // Sheet mới: hàng dir8, cột = pha bước 1..4 (đứng yên cột 0).
          // Sheet cũ: hàng DIR_ROW theo facing, cột = pha%2 khi đi, 0 khi đứng.
          var psrc = charSrc(look, plim, facing, dir8, moving ? stepPhase : 0, moving ? stepPhase % 2 : 0);
          // Kiếm đeo sau lưng ĐÃ NƯỚNG vào từng khung của sheet đi bộ và
          // sheet pháp quyết (đợt fix4 — Bui 22:49 ngày 2026-11-04: kiếm
          // rời vẽ bằng một phép biến đổi cố định theo hàng không áp sát
          // lưng từng tư thế, đọc như dán nổi): engine không còn vẽ kiếm
          // rời cho trạng thái 'back'. Chỉ trạng thái bay lơ lửng
          // ('hover') còn vẽ kiếm trần rời, ở các điểm SAU thân dưới đây.
          var swCx = px + 16, swCy = py + 32 - 40 + walkBobY;
          var hoverOn = swState === 'hover';
          if (bf) {
            var bim = bf.im;
            if (hoverOn) {
              // Khung pháp quyết + kiếm bay bên cạnh: dùng sheet pq SẠCH.
              var cpq = ASSETS.pqClean && ASSETS.pqClean[state.gender === 'nu' ? 'nu' : 'nam'];
              if (imgReady(cpq)) bim = cpq; else hoverOn = false;
            }
            ctx.drawImage(bim, bf.x, bf.y, 96, 120, px + 16 - 32, py + 32 - 80 + walkBobY, 64, 80);
            if (hoverOn) drawLooseSword(swCx, swCy, dir8, 'hover');
            pTop = py + 32 - 80 + walkBobY; labels.push({ key: '__player', name: state.name, title: L.realmName(state.realm, state.stage), cx: px + 16, wantY: pTop - 6 - 24, color: '#ffe9a8' }); return;
          }
          // Nhún thân theo pha bước (walkBobY): chỉ dời HÌNH VẼ theo chiều
          // dọc, bóng chân và ô logic giữ nguyên trên mặt đất.
          var wim = plim;
          if (hoverOn) {
            // Đi/đứng + kiếm bay bên cạnh: dùng sheet đi bộ SẠCH.
            var cwk = ASSETS.charsClean && ASSETS.charsClean[look];
            if (imgReady(cwk)) wim = cwk; else hoverOn = false;
          }
          ctx.drawImage(wim, psrc.x, psrc.y, psrc.w, psrc.h, px + 16 - 32, py + 32 - 80 + walkBobY, 64, 80);
          if (hoverOn) drawLooseSword(swCx, swCy, dir8, 'hover');
          pTop = py + 32 - 80 + walkBobY;
        } else {
          // Ảnh chưa tải: sprite lưới theo hướng chính gần nhất của dir8, khung 1 khi đi / 0 khi đứng.
          drawSprite(S.charSprite(look, dir8NearDir(dir8), moving ? 1 : 0), px, py - 8 + walkBobY, 2);
          pTop = py - 8 + walkBobY;
        }
        if (playerHurtT > 0) {
          // Nhấp nháy đỏ nhẹ trên thân khi vừa trúng đòn (70ms).
          ctx.fillStyle = 'rgba(255,60,40,' + (0.32 * playerHurtT / 0.07).toFixed(3) + ')';
          ctx.fillRect(px + 16 - 30, pTop, 60, 80);
        }
        labels.push({ key: '__player', name: state.name, title: L.realmName(state.realm, state.stage), cx: px + 16, wantY: pTop - 6 - 24, color: '#ffe9a8' });
      }
    });
    // Lớp nhãn riêng (sau mọi vật thể) + bong bóng thoại trên đầu người nói.
    // Cài đặt showNames tắt nhãn tên + danh hiệu thì bong bóng cũng không có neo để bám.
    var placedLabels = (!SET || SET.current.showNames) ? drawLabels(labels) : [];
    drawBubble(placedLabels);
    // Dẫn đường nhiệm vụ (gói phụ H): dấu "!" trên vật/NPC/điểm đích của
    // bước hiện tại + mũi tên quanh nhân vật chỉ mục tiêu hiển thị (mục
    // tiêu khác bản đồ thì chỉ cổng đầu tiên trên đường cổng). Lớp này vẽ
    // SAU nhãn/bong bóng và TRƯỚC vòng sóng/chữ bay, thuần trình diễn —
    // không nhận thao tác, không che thao tác. Tam giác vàng tại ô hint
    // của bản cũ được thay bằng dấu "!" neo trên VẬT (xem
    // resolveQuestTarget): neo theo ô hint cũ khiến dấu chỉ ô đứng kề
    // chứ không chỉ vật phải tương tác.
    guideFrame = guideCompute();
    if (guideFrame.bang && guideFrame.display) drawGuideBang(guideFrame.display.ax, guideFrame.display.ay);
    if (guideFrame.arrow && guideFrame.display) drawGuideArrow(guideFrame.display);
    // vòng sóng âm Ngôn Linh (cài đặt fxRings chỉ tắt phần VẼ, vòng đời vòng vẫn chạy như cũ)
    rings = rings.filter(function (r) { return r.a > 0; });
    if (!SET || SET.current.fxRings) rings.forEach(function (r) {
      ctx.strokeStyle = 'rgba(' + (r.col || '255,240,190') + ',' + r.a + ')'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2); ctx.stroke();
    });
    bcDrawOverlays(); // lớp phủ bí cảnh: bẫy kiếm trận, vòng trấn, điểm hái
    drawBcTelegraphs(); // vòng báo đòn diện rộng của boss tổ đội (Trận Văn Phá)
    drawResWaves(); // đường sóng khóa Vạn Âm (bước 2 mục 3) — cổng fxRings bên trong hàm
    drawResFields(); // sân cộng hưởng Vạn Âm (bước 2 mục 1–2) — cổng fxRings/fxParticles bên trong hàm
    // chữ bay (sát thương, thông báo nhỏ): cỡ chữ theo hạng đòn; chí mạng
    // phóng 1,0 -> 1,3 trong 70ms rồi về trong 110ms (hiệu ứng "pop").
    floats = floats.filter(function (f) { return f.a > 0; });
    floats.forEach(function (f) {
      if (f.age <= f.delay) return; // số của Ngôn Linh chờ chữ chiêu 90ms mới hiện
      var fs = f.size || 15;
      if (f.pop) {
        var pa = f.age - f.delay;
        var sc = pa < 0.07 ? 1 + 0.3 * (pa / 0.07) : (pa < 0.18 ? 1.3 - 0.3 * ((pa - 0.07) / 0.11) : 1);
        fs = Math.round(fs * sc);
      }
      ctx.font = 'bold ' + fs + 'px sans-serif'; ctx.textAlign = 'center';
      // Độ đọc rõ (mục 8, ghi chú Bui sau chơi live): viền tối tương phản
      // 4 hướng quanh số sát thương trước khi đổ bóng + thân chữ — ở cỡ
      // điện thoại/mức zoom thường dùng số trừ máu vẫn tách khỏi nền cỏ/
      // đất sáng. Thuần trình bày, không đổi giá trị sát thương.
      ctx.fillStyle = 'rgba(12,9,4,' + f.a + ')';
      ctx.fillText(f.text, f.x - 1.6, f.y); ctx.fillText(f.text, f.x + 1.6, f.y);
      ctx.fillText(f.text, f.x, f.y - 1.6); ctx.fillText(f.text, f.x, f.y + 1.6);
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
    // Thiên kiếp (docs/realm-prep/ mục 10): mây kiếp xoáy tối tụ trên
    // đầu trong lúc phiên độ kiếp mở (lớp phủ cục bộ quanh đài, KHÔNG
    // dùng lớp tối ngày đêm), và tia lôi gấp khúc giáng xuống theo
    // nhịp tribBoltFx — tất cả vẽ bằng mã trên canvas, không asset.
    if (trib) {
      var tcw = 150 + 26 * Math.sin(tNow / 900);
      ctx.fillStyle = 'rgba(24,22,38,0.42)';
      ctx.beginPath(); ctx.ellipse(px + 16, py - 118, tcw, 30, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(15,13,29,0.52)';
      ctx.beginPath(); ctx.ellipse(px + 16 + 18 * Math.sin(tNow / 1300), py - 130, tcw * 0.62, 20, 0, 0, Math.PI * 2); ctx.fill();
    }
    if (tribBoltFx.t > 0) {
      var tba = Math.min(1, tribBoltFx.t / 0.35);
      ctx.fillStyle = 'rgba(225,242,255,' + (0.30 * tba) + ')';
      ctx.fillRect(px - 70, py - 165, 172, 205); // chớp sáng trắng một nhịp quanh điểm chạm
      ctx.strokeStyle = 'rgba(212,236,255,' + (0.92 * tba) + ')'; ctx.lineWidth = 3;
      ctx.beginPath();
      var bTop = py - 148, bBot = py + 6, bSegs = 6;
      ctx.moveTo(px + 16, bTop);
      for (var bs2 = 1; bs2 <= bSegs; bs2++) {
        var bty2 = bTop + (bBot - bTop) * bs2 / bSegs;
        var btx2 = px + 16 + (bs2 === bSegs ? 0 : Math.sin(bs2 * 37.7 + tribBoltFx.seed) * 13);
        ctx.lineTo(btx2, bty2);
      }
      ctx.stroke();
      ctx.strokeStyle = 'rgba(150,200,255,' + (0.55 * tba) + ')'; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.ellipse(px + 16, py + 28, 26 * (1.35 - tba * 0.35), 8, 0, 0, Math.PI * 2); ctx.stroke();
    }
    // Làm nổi bật người đang đo (gói I): cột sáng + vòng chân nhấp nháy tại
    // nhân vật mà dữ kiện cảnh đang ghim (dlg.spot) — người chơi nhìn là biết
    // lượt đo này của ai, khớp với băng kết quả trong hộp thoại.
    if (dlg && dlg.spot) {
      var spx = px + 16, spy = py + 30;
      if (dlg.spot !== 'hero') {
        var snp = npcsLive.filter(function (x) { return x.id === dlg.spot; })[0];
        if (snp) { spx = snp.x * TILE + 16; spy = snp.y * TILE + 30; }
      }
      var spl = 0.72 + 0.28 * Math.sin(tNow / 260);
      var sgr = ctx.createLinearGradient(spx, spy - 230, spx, spy);
      sgr.addColorStop(0, 'rgba(255,244,200,0)');
      sgr.addColorStop(1, 'rgba(255,240,190,' + (0.5 * spl) + ')');
      ctx.fillStyle = sgr;
      ctx.fillRect(spx - 20, spy - 230, 40, 230);
      ctx.strokeStyle = 'rgba(255,240,190,' + (0.85 * spl) + ')'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.ellipse(spx, spy, 26, 8, 0, 0, Math.PI * 2); ctx.stroke();
    }
    // Hào quang thổ nạp: hai vòng cung xoay ngược chiều quanh người khi đang nạp.
    // Ban đêm hào quang rõ hơn một chút (chỉ hình ảnh, không đổi số cân bằng).
    // Giữ thế giữa trận (đứng yên khi đang giao chiến) dùng cùng hào quang
    // này ở mức mờ hơn — dấu hiệu người chơi đang hồi Tĩnh Mặc bằng thế thủ.
    if ((meditating || encStance) && fxOn()) {
      // ARCIV 6.2: Thanh Phong theo tầng — T1 nhuốm ngọc, T2 +4 lá, T3 dải rộng+vòng đất, T4 xoắn kép 8 lá + vệt bốc
      var __tpTier = state ? ((L.techniqueOf(state, 'thanh_phong') || {}).tier || 0) : 0;
      if (__tpTier >= 2) {
        var __leafN = __tpTier >= 4 ? 8 : __tpTier >= 3 ? 6 : 4;
        for (var __li = 0; __li < __leafN; __li++) {
          var __la = tNow / 900 + __li * (Math.PI * 2 / __leafN) * (__tpTier >= 4 && __li % 2 ? -1 : 1);
          var __lx = px + 16 + Math.cos(__la) * 30, __ly = py + 18 + Math.sin(__la) * 12;
          ctx.save(); ctx.translate(__lx, __ly); ctx.rotate(__la + tNow / 300);
          ctx.fillStyle = 'rgba(140,220,160,0.75)'; ctx.beginPath(); ctx.ellipse(0, 0, 9, 4, 0, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = 'rgba(200,240,215,0.8)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(8, 0); ctx.stroke(); ctx.restore();
        }
        if (__tpTier >= 3) { ctx.strokeStyle = 'rgba(200,240,215,0.18)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(px + 16, py + 28, 38, 13, 0, 0, Math.PI * 2); ctx.stroke(); }
        if (__tpTier >= 4 && Math.floor(tNow / 3500) !== Math.floor((tNow - 16) / 3500)) spawnLeaves(px + 16, py + 16, 2, 34);
      }
      var ma = tNow / 620;
      var medAlpha = 0.55 + (dnPhase ? dnPhase.night * 0.3 : 0);
      ctx.strokeStyle = (__tpTier >= 1 ? 'rgba(200,240,215,' : 'rgba(150,220,255,') + medAlpha.toFixed(3) + ')'; ctx.lineWidth = __tpTier >= 3 ? 5 : (dnPhase && dnPhase.night > 0.5 ? 2.6 : 2);
      ctx.beginPath(); ctx.arc(px + 16, py + 18, 25, ma, ma + Math.PI * 1.25); ctx.stroke();
      ctx.beginPath(); ctx.arc(px + 16, py + 18, 31, -ma * 0.8, -ma * 0.8 + Math.PI * 0.9); ctx.stroke();
    }
    // Hạt linh khí (đột phá, phá cọc, mở miệng, thổ nạp).
    parts.forEach(function (p) {
      var al = Math.max(0, 1 - p.t / p.life) * 0.85;
      if (p.kind === 'petal') {
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot || 0);
        ctx.fillStyle = 'rgba(' + p.col + ',' + al + ')';
        ctx.beginPath(); ctx.ellipse(0, 0, p.r, p.r * 0.55, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      } else if (p.kind === 'smoke') {
        ctx.fillStyle = 'rgba(' + p.col + ',' + (al * 0.34) + ')';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      } else if (p.kind === 'leaf') {
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot || 0);
        ctx.fillStyle = 'rgba(' + p.col + ',' + al + ')';
        ctx.beginPath(); ctx.ellipse(0, 0, p.r * 2.2, p.r, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(200,240,215,' + al + ')'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(-p.r * 2, 0); ctx.lineTo(p.r * 2, 0); ctx.stroke();
        ctx.restore();
      } else if (p.kind === 'star') {
        drawStarShape(p.x, p.y, 0.8, p.col, p.core || '235,245,255', al);
      } else {
        ctx.fillStyle = 'rgba(' + p.col + ',' + al + ')';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
    });
    // Tinh tu vi bay về người (GF-07): quỹ đạo vòng cung 0,55 giây/viên,
    // các viên lệch nhau 60ms; đích bám theo vị trí người chơi hiện tại.
    orbs.forEach(function (o) {
      if (o.t < 0) return;
      var op = Math.min(1, o.t / 0.55);
      var gx = px + 16, gy = py + 12;
      var mxp = (o.sx + gx) / 2, myp = Math.min(o.sy, gy) - 56;
      var ix = (1 - op) * (1 - op) * o.sx + 2 * (1 - op) * op * mxp + op * op * gx;
      var iy = (1 - op) * (1 - op) * o.sy + 2 * (1 - op) * op * myp + op * op * gy;
      ctx.fillStyle = 'rgba(170,240,255,' + (0.35 + 0.4 * Math.sin(tNow / 90 + o.idx)) + ')';
      ctx.beginPath(); ctx.arc(ix, iy, 5.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(240,252,255,0.95)';
      ctx.beginPath(); ctx.arc(ix, iy, 2.6, 0, Math.PI * 2); ctx.fill();
    });
    // Cột sáng trận pháp (gói phụ 10): boss gục dùng chung một cột lớn;
    // mọi cột trong danh sách đều vẽ bằng drawPillar theo mẫu của Bui.
    if (bossPillar) pillars.push({ x: bossPillar.x, y: bossPillar.y, t: 0.9 - bossPillar.t, dur: 0.9, h: 120, top: null, big: true });
    bossPillar = null;
    pillars.forEach(drawPillar);
    drawStreaks();
    drawBossFx(); // lớp hiệu ứng riêng của đòn boss (nứt đất / tàn ảnh / kiếm dựng / gợn nước / điểm tụ) — đặt ngay sau drawStreaks như bản gốc đợt boss
    drawArcFx(); arcDrawEyes(); arcDrawCycle(); drawTechFx(); arcDrawWave2();
    // ARCIV ch.15 (điểm yếu F.6 đã khai, nay bổ sung): vòng nhiễu xám quanh
    // NHÂN VẬT khi cộng hưởng bị khóa bởi trạng thái cảnh.
    if (state && state.flags && (state.flags.ch15ResonanceLock || state.flags.arcResLocked)) drawResJammingRing();
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
    // Quầng đỏ mép màn hình khi người chơi mất máu (GF-05): hiện nhanh khi
    // mất >= 5% máu tối đa; máu <= 25% thì quầng thở đều theo nhịp 1,6s.
    var hurtAlpha = 0;
    if (hurtT > 0) hurtAlpha = 0.22 * Math.sin(Math.PI * (1 - hurtT / 0.33));
    else if (state && state.hp > 0 && state.hp <= state.hpMax * 0.25) hurtAlpha = 0.10 + 0.06 * (0.5 + 0.5 * Math.sin(tNow * Math.PI * 2 / 1600));
    if (hurtAlpha > 0.004) {
      var hg = null;
      try { hg = ctx.createRadialGradient(viewW / 2, viewH / 2, Math.min(viewW, viewH) * 0.36, viewW / 2, viewH / 2, Math.max(viewW, viewH) * 0.72); } catch (e) { hg = null; }
      if (hg) {
        hg.addColorStop(0, 'rgba(200,30,20,0)');
        hg.addColorStop(1, 'rgba(200,30,20,' + hurtAlpha.toFixed(3) + ')');
        ctx.fillStyle = hg;
      } else ctx.fillStyle = 'rgba(200,30,20,' + (hurtAlpha * 0.4).toFixed(3) + ')';
      ctx.fillRect(0, 0, viewW, viewH);
    }
    // Vật phẩm đang bay về nút Túi (lớp màn hình — đích là nút giao diện).
    drops.forEach(function (dr) { if (dr.phase === 'fly') drawFlyDrop(dr); });
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
        ctx.beginPath(); ctx.arc(bp.x, bp.y, JOY_KNOB_R, 0, Math.PI * 2);
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
      ctx.beginPath(); ctx.arc(joy.sx + jux * jclamp, joy.sy + juy * jclamp, JOY_KNOB_R, 0, Math.PI * 2);
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
  function addFloat(x, y, text, color) { floats.push(mkFloat(x, y, text, color, null)); trimFloats(); }
  // Chữ bay tổng quát: bản cũ (addFloat) giữ đúng hành vi — bay 26px/giây,
  // mờ hết trong 1,25 giây, cỡ 15. Lớp cảm giác cày mở rộng thêm cỡ chữ,
  // tốc độ bay, độ trễ hiện (số sát thương của Ngôn Linh hiện sau chữ
  // chiêu 90ms) và hiệu ứng phóng của chí mạng — qua addDmgFloat.
  function mkFloat(x, y, text, color, o) {
    o = o || {};
    return { x: x, y: y, text: text, color: color || '255,235,170', a: 1, age: 0,
             size: o.size || 15, rise: o.rise != null ? o.rise : 26, life: o.life || 1.25,
             delay: o.delay || 0, pop: !!o.pop, targetKey: o.targetKey || null };
  }
  var dmgStack = {}; // targetKey -> các số đang bay trên cùng mục tiêu (chống chồng: tối đa 3, lệch 14px/số)
  function addDmgFloat(x, y, text, color, o) {
    o = o || {};
    var key = o.targetKey || null, f;
    if (key) {
      var arr = (dmgStack[key] || []).filter(function (q) { return q.a > 0; });
      f = mkFloat(x, y - (arr.length % 3) * 14, text, color, o);
      arr.push(f); dmgStack[key] = arr;
    } else f = mkFloat(x, y, text, color, o);
    floats.push(f);
    trimFloats();
  }
  // Trần 24 số toàn màn: vượt thì bỏ số cũ nhất (chỉ là trình bày).
  function trimFloats() { while (floats.length > 24) floats.shift(); }

  /* ---------- Thoại ---------- */
  function say(lines, cb) { clickPath = null; clickTarget = null; pendingInteract = null; questNav = null; resetJoy(); dlgQueue = lines.slice(); dlgCb = cb || null; nextLine(); }
  /* Gói I (đợt nóng 3) — cảnh đo phải phân rõ AI ĐANG ĐO: dữ kiện cảnh
     (story.js) ghim trên từng dòng: spot = id nhân vật đang đứng tại đá
     đo/thước ('hero' = người chơi), spotAt = ô đứng trước đá đo cho NPC,
     result = {name, grade, tone} công bố kèm tên. Engine: NPC được ghim
     sẽ bước tới ô spotAt (về chỗ cũ khi lượt đổi), nhân vật đang đo được
     cột sáng + vòng chân làm nổi bật, và băng kết quả hiện tên + phẩm cấp
     ngay trong hộp thoại. Bộ ba (người tại đá, tên, phẩm cấp) lấy từ CÙNG
     một dòng dữ kiện nên không thể lệch nhau. */
  var sceneSpot = null; // { id, home:{x,y} } — NPC đang được đưa tới đá đo
  function restoreSceneSpot() {
    if (!sceneSpot) return;
    var n = npcsLive.filter(function (x) { return x.id === sceneSpot.id; })[0];
    if (n) { n.x = sceneSpot.home.x; n.y = sceneSpot.home.y; }
    sceneSpot = null;
  }
  function updateSceneSpot(line) {
    var want = line && line.spot ? line.spot : null;
    if (sceneSpot && want !== sceneSpot.id) restoreSceneSpot();
    if (!want || want === 'hero' || sceneSpot) return;
    var n = npcsLive.filter(function (x) { return x.id === want; })[0];
    if (!n) return;
    sceneSpot = { id: want, home: { x: n.x, y: n.y } };
    if (line.spotAt) {
      var pt = playerTile();
      var cands = [line.spotAt, { x: line.spotAt.x + 1, y: line.spotAt.y }, { x: line.spotAt.x - 1, y: line.spotAt.y }, { x: line.spotAt.x, y: line.spotAt.y + 1 }, { x: line.spotAt.x, y: line.spotAt.y - 1 }];
      for (var i = 0; i < cands.length; i++) {
        var c = cands[i];
        if (c.x === pt.x && c.y === pt.y) continue;
        if (npcsLive.some(function (o) { return o !== n && o.x === c.x && o.y === c.y; })) continue;
        if (!L.isWalkable(c.x, c.y, [])) continue;
        n.x = c.x; n.y = c.y; break;
      }
    }
  }
  function updateDlgResult(line) {
    var resEl = $('dlg-result');
    if (!resEl) return;
    if (line && line.result) {
      $('dlg-result-name').textContent = substDlgName(line.result.name);
      $('dlg-result-grade').textContent = line.result.grade;
      resEl.classList.remove('hidden', 'tone-gold', 'tone-dim');
      resEl.classList.add('tone-' + (line.result.tone || 'gold'));
    } else {
      resEl.classList.add('hidden');
      resEl.classList.remove('tone-gold', 'tone-dim');
    }
  }
  function nextLine() {
    if (dlgTypeTimer) { clearInterval(dlgTypeTimer); dlgTypeTimer = null; dlgTypeFull = null; }
    if (!dlgQueue.length) { stopVoice(); dlg = null; restoreSceneSpot(); updateDlgResult(null); hideAtkPanel(); atkPanelShown = false; $('dialogue').classList.add('hidden'); $('dlg-choices').innerHTML = ''; if (dlgCb) { var cb = dlgCb; dlgCb = null; cb(); } return; } // dọn luôn nút lựa chọn: nút của dòng lựa chọn cuối không được sống sót sau khi thoại đóng (bấm lại qua nút ma từng làm trận tỉ thí kẹt ở pha kết thúc)
    dlg = dlgQueue.shift();
    updateDlgPortrait(dlg); // gói phụ 4: chân dung đổi theo đúng người nói của dòng này
    // Tranh phân cảnh (gói phụ 8): hiện cùng dòng DẪN của đợt một chuỗi
    // đánh đêm (nhịp gia nhân gác cổng bị đánh ngã — xảy ra trước khi
    // người chơi tới nơi); sang dòng có người nói hoặc lựa chọn là thu.
    if (atkPanelPending && dlg.who === 'narrate') { showAtkPanel(); atkPanelPending = false; atkPanelShown = true; }
    else if (atkPanelShown && dlg.who !== 'narrate') { hideAtkPanel(); atkPanelShown = false; }
    // Điểm ghi nhận cảnh đo chương 1 (xem ghi chú commitTest ở story.js):
    // dòng lựa chọn cuối cảnh hiện ra = phần đo đã khép. Ghi tại đây thay
    // vì cuối hàng đợi, vì nhánh lựa chọn thay hàng đợi bằng cảnh riêng và
    // sẽ nuốt hàm gọi lại hoàn tất của touchStele.
    if (dlg.commitTest && state && !state.flags.tested) {
      state.flags.tested = true;
      if (state.quest === 'q_trac') state.quest = 'q_voice';
      refreshHUD();
    }
    updateSceneSpot(dlg);
    updateDlgResult(dlg);
    sfxPage();
    playVoiceFor(dlg); // tiếng bắt đầu cùng lúc chữ hiện; qua câu thì playVoiceFor dừng tiếng câu cũ
    $('dialogue').classList.remove('hidden');
    $('dlg-choices').innerHTML = '';
    var nameEl = $('dlg-name'), textEl = $('dlg-text'), box = $('dialogue');
    box.classList.toggle('dlg-write', dlg.mode === 'write');
    box.classList.toggle('dlg-say', dlg.mode === 'say');
    if (dlg.who === 'narrate') { nameEl.textContent = ''; textEl.textContent = substDlgName(dlg.text); }
    else if (dlg.who === 'hero') { nameEl.textContent = state.name + (dlg.mode === 'write' ? ' (viết)' : ''); textEl.textContent = substDlgName(dlg.text); }
    else if (dlg.who === 'choice') { nameEl.textContent = state.name; textEl.textContent = substDlgName(dlg.text); renderChoices(dlg); }
    else {
      var n = npcsLive.filter(function (x) { return x.id === dlg.who; })[0];
      nameEl.textContent = n ? n.name : (SPEAKER_NAMES[dlg.who] || dlg.who); textEl.textContent = substDlgName(dlg.text);
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
      b.textContent = (idx + 1) + '. ' + substDlgName(opt.label);
      b.addEventListener('click', function () { chooseOption(opt.action); });
      wrap.appendChild(b);
    });
  }
  /* Cảnh tiệm pháp khí DỰNG ĐỘNG (docs/realm-prep/ mục 5.1): cảnh gốc
     SCENE_FASHOP chỉ gồm Thoại + Lựa chọn; các mặt hàng chống lôi chỉ
     xuất hiện khi đúng điều kiện — Tị Lôi Phù từ khi Linh Thạch mở,
     Dẫn Lôi Pháp từ khâu chuẩn bị chương 8. Kiếm/Ngọc giữ nguyên
     nhãn và giá gốc. */
  function buildFaShopScene() {
    var opts = [
      { label: 'Mua {{item:kiem_phong}} — 150 Linh Thạch', action: 'buy_kiem', price: 150 },
      { label: 'Mua {{item:ngoc_tu_linh}} — 260 Linh Thạch', action: 'buy_ngoc', price: 260 }
    ];
    if (state.linhUnlocked) opts.push({ label: 'Mua một lá Tị Lôi Phù — 40 Linh Thạch (chống lôi kiếp, giảm 85% sát thương một đạo)', action: 'buy_ti_loi_phu', price: 40 });
    if (L.questReached(state, 'q8_chuan_bi') && !L.bagHas(state, 'dan_loi_phap')) opts.push({ label: 'Mua Dẫn Lôi Pháp — 240 Linh Thạch (giảm 25% sát thương mọi đạo lôi kiếp)', action: 'buy_dan_loi_phap', price: 240 });
    opts.push({ label: 'Rời tiệm', action: 'shop_leave' });
    return [ST.SCENE_FASHOP[0], { who: 'choice', text: 'Ngươi muốn mua gì?', options: opts }];
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
    } else if (action === 'food_leave') {
      // Rời quán/bếp đồ ăn: dùng lại đúng câu rời đi đã có sẵn trong
      // bản kê giọng (cùng câu của inn_leave/shop_leave).
      say([{ who: 'narrate', text: 'Ngươi gật đầu chào rồi rời đi.' }], function () { refreshHUD(); saveNow(); });
    } else if (action === 'food_open_buy') { say(foodBuyScene());
    } else if (action === 'food_open_cook') { say(foodCookScene('bep'));
    } else if (action === 'food_buy_com_nam') { doFoodBuy('com_nam');
    } else if (action === 'food_buy_banh_hap') { doFoodBuy('banh_hap');
    } else if (action === 'food_buy_com_nam_bac') { doFoodBuySilver('com_nam');
    } else if (action === 'food_buy_banh_hap_bac') { doFoodBuySilver('banh_hap');
    } else if (action === 'food_cook_canh_nam_thao') { doFoodCook('canh_nam_thao');
    } else if (action === 'food_cook_thit_nuong') { doFoodCook('thit_nuong');
    } else if (action === 'food_cook_canh_bo_khi') { doFoodCook('canh_bo_khi');
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
        // Trọng thương (độ kiếp hỏng): Hồi Khí Đan đồng thời là thuốc
        // dưỡng thương — đủ 2 viên thì thương thế khép lại (mục 6.1).
        var nt = L.noteHoiKhiDanUsed(state);
        if (nt.cleared) toast('Đã dùng Hồi Khí Đan: hồi 25 Tĩnh Âm. Hai viên dưỡng thương đã đủ — trọng thương khép lại, tốc độ thổ nạp trở lại bình thường.', 4200);
        else if (state.flags.trongThuong) toast('Đã dùng Hồi Khí Đan: hồi 25 Tĩnh Âm. Thương thế đã nhẹ đi một nấc — thêm một viên nữa, hoặc nghỉ ở điểm linh khí tới khi máu đầy, là khép hẳn.', 4200);
        else toast('Đã dùng Hồi Khí Đan: hồi 25 Tĩnh Âm (còn ' + L.bagCount(state, 'hoi_khi_dan') + ' viên).', 3200);
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
        if (!chkG.ok) { toast(chkG.reason); say(buildFaShopScene()); return; }
        var rg = L.spendLinhThach(state, price);
        if (rg.ok) { L.bagAdd(state, gid, 1); sfxQuest(); toast('Đã mua ' + gname + ' (−' + price + ' Linh Thạch) và cất vào Túi Trữ Vật. Hiệu quả có tác dụng ngay.', 3800); }
        else toast(rg.reason);
      }
      refreshHUD(); saveNow();
      say(buildFaShopScene());
    } else if (action === 'buy_ho_the_dan') {
      // Hộ Thể Đan ở hiệu thuốc thành (docs/realm-prep/ mục 5.1): 25 LT.
      var chkH = L.bagCanAdd(state, 'ho_the_dan', 1);
      if (!chkH.ok) { toast(chkH.reason); say(ST.SCENE_PHARMACY); return; }
      var rh2 = L.spendLinhThach(state, 25);
      if (rh2.ok) { L.bagAdd(state, 'ho_the_dan', 1); sfxUi(); toast('Đã mua một viên Hộ Thể Đan (−25 Linh Thạch). Trong túi: ' + L.bagCount(state, 'ho_the_dan') + ' viên.', 3200); }
      else toast(rh2.reason);
      refreshHUD(); saveNow();
      say(ST.SCENE_PHARMACY);
    } else if (action === 'buy_ti_loi_phu') {
      // Tị Lôi Phù bán bằng Linh Thạch: 40 LT/lá (mục 5.1).
      var chkP = L.bagCanAdd(state, 'ti_loi_phu', 1);
      if (!chkP.ok) { toast(chkP.reason); say(buildFaShopScene()); return; }
      var rp2 = L.spendLinhThach(state, 40);
      if (rp2.ok) { L.bagAdd(state, 'ti_loi_phu', 1); sfxUi(); toast('Đã mua một lá Tị Lôi Phù (−40 Linh Thạch). Trong túi: ' + L.bagCount(state, 'ti_loi_phu') + ' lá.', 3200); }
      else toast(rp2.reason);
      refreshHUD(); saveNow();
      say(buildFaShopScene());
    } else if (action === 'buy_dan_loi_phap') {
      // Dẫn Lôi Pháp ở hiệu pháp khí: 240 LT, mở bán từ khâu chuẩn bị
      // chương 8 (mục 5.1); pháp khí bền, một món là đủ.
      if (L.bagHas(state, 'dan_loi_phap')) { toast('Ngươi đã có Dẫn Lôi Pháp trong túi rồi — pháp khí này một món là đủ.'); }
      else {
        var chkF = L.bagCanAdd(state, 'dan_loi_phap', 1);
        if (!chkF.ok) { toast(chkF.reason); say(buildFaShopScene()); return; }
        var rf2 = L.spendLinhThach(state, 240);
        if (rf2.ok) { L.bagAdd(state, 'dan_loi_phap', 1); sfxQuest(); toast('Đã mua Dẫn Lôi Pháp (−240 Linh Thạch): từ nay mọi đạo lôi kiếp đều giảm 25% sát thương.', 4000); }
        else toast(rf2.reason);
      }
      refreshHUD(); saveNow();
      say(buildFaShopScene());
    } else if (action === 'merit_buy_phu' || action === 'merit_buy_phap') {
      // Đường công sức ở quản sự tông (mục 5.1/5.2): Tị Lôi Phù 30
      // điểm cống hiến, Dẫn Lôi Pháp 150 điểm — cùng khuôn đổi điểm
      // của đường luyện lại Trúc Cơ Đan (pill_again_merit).
      var mid = action === 'merit_buy_phu' ? 'ti_loi_phu' : 'dan_loi_phap';
      var mprice = action === 'merit_buy_phu' ? 30 : 150;
      var mname = action === 'merit_buy_phu' ? 'Tị Lôi Phù' : 'Dẫn Lôi Pháp';
      if (mid === 'dan_loi_phap' && L.bagHas(state, mid)) { toast('Ngươi đã có Dẫn Lôi Pháp trong túi rồi.'); }
      else {
        var chkM = L.bagCanAdd(state, mid, 1);
        if (!chkM.ok) toast(chkM.reason);
        else if ((state.sectMerit || 0) < mprice) toast('Chưa đủ điểm cống hiến (đang có ' + L.fmtNum(state.sectMerit || 0) + ', cần ' + mprice + '). Hãy làm việc tông môn để tích thêm.', 4600);
        else {
          state.sectMerit -= mprice;
          var rbk = L.bagAdd(state, mid, 1);
          if (rbk.ok) { sfxQuest(); toast('Đã ghi ' + mprice + ' điểm cống hiến, quản sự đổi cho ngươi ' + mname + '. Điểm cống hiến còn: ' + L.fmtNum(state.sectMerit) + '.', 4200); }
        }
      }
      refreshHUD(); saveNow();
    } else if (action === 'merit_buy_treasure_1' || action === 'merit_buy_treasure_2' || action === 'merit_buy_treasure_3') {
      // Đổi pháp bảo bằng điểm cống hiến (đợt pháp bảo 2026-11-06):
      // toàn bộ kiểm ví/chọn món/trừ điểm nằm ở L.treasureMeritExchange
      // (trừ đúng một lần, lỗi thì không trừ) — cùng khuôn merit_buy_phu.
      var pbGradeX = parseInt(action.charAt(action.length - 1), 10);
      var rxPb = L.treasureMeritExchange(state, pbGradeX);
      if (rxPb.ok) { sfxQuest(); toast('Đã ghi ' + rxPb.price + ' điểm cống hiến, quản sự đổi cho ngươi ' + L.ITEM_DEFS[rxPb.item].name + '. Điểm cống hiến còn: ' + L.fmtNum(state.sectMerit) + '.', 4200); }
      else toast(rxPb.reason, 4600);
      refreshHUD(); saveNow();
    } else if (action === 'ch4_evidence') {
      state.quest = 'q4_dieu_tra';
      say([{ who: 'narrate', text: 'Ngươi không cãi một câu. Ngươi quay lưng đi về phía kho Hứa gia ở rìa đông sân phủ — sự thật nằm ở đó, không nằm ở miệng người. (Đường im lặng: hãy kiểm tra kho và tìm nhân chứng.)' }], function () { refreshHUD(); saveNow(); });
    } else if (action === 'ch4_chan') {
      var rc = L.castWord(state, 'chan');
      if (!rc.ok) {
        // Tĩnh Mặc chưa đủ cho CHẤN: không khóa cứng — tự rơi về đường bằng chứng.
        toast(rc.reason + ' Đi đường bằng chứng vậy.');
        state.quest = 'q4_dieu_tra';
        say([{ who: 'narrate', text: 'Ngươi định phát một đòn Chấn Âm, nhưng Tĩnh Âm chưa đủ trong để khóa sóng cho một đòn như thế. Ngươi nén sóng lại, quay đi tìm bằng chứng — đường chậm hơn, nhưng chắc hơn.' }], function () { refreshHUD(); saveNow(); });
      } else {
        state.flags.usedChanCh4 = true;
        state.flags.daoNoticedVoice = true; // Trần Chính Đạo đã để ý dư âm bất thường
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
    } else if (action === 'duel_support') {
      duelSupportChoice(true); // gói phụ 7: truyền hồn lực tiếp sức giữa trận tỉ thí (im lặng — không ghi sổ lời)
    } else if (action === 'duel_watch') {
      duelSupportChoice(false); // gói phụ 7: đứng yên quan sát giữa trận tỉ thí
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
    } else if (action.indexOf('ch18_') === 0) {
      resolveCh18Choice(action); // ARCIV đợt 2: lựa chọn thái độ chương 18 (B.4)
    } else if (action.indexOf('phancong_') === 0) {
      resolvePhanCong(action); // ARCIV đợt 3: phân công giữ đoàn ch.22 (B.4) — vật thể choice nằm GIỮA mảng cảnh, resolver TUYỆT ĐỐI không say()
    } else if (action.indexOf('ch23_') === 0) {
      resolveCh23Choice(action); // ARCIV đợt 3: lựa chọn mỏm đá ch.23 (B.4) — choice nằm giữa mảng cảnh, không say()
    } else if (action.indexOf('kyngo_') === 0) {
      resolveKyNgoChoice(action); // ARCIV đợt 3: lựa chọn cuối cảnh kỳ ngộ ô 23 (B.9) — choice ở cuối mảng cảnh, không say()
    } else if (action.indexOf('arc_') === 0) {
      resolveArcChoice(action); // ARCIV đợt 1b: đài thách đấu lặp + ghép bí pháp tàng kinh
    } else if (action.indexOf('chi_') === 0) {
      resolveChiAmbush(action);
    } else if (action.indexOf('guard_') === 0) {
      resolveGuardWave(action);
    } else if (action.indexOf('ch9_') === 0) {
      resolveCh9Choice(action);
    } else if (action.indexOf('ch10_') === 0) {
      resolveCh10Choice(action);
    } else if (action.indexOf('kdguard_') === 0) {
      resolveKdGuard(action);
    } else if (action.indexOf('kd_') === 0) {
      if (action === 'kd_pay' || action === 'kd_herb_fee') resolveKdFee(action);
      else resolveKdBeast(action);
    } else if (action.indexOf('ketdan_') === 0) {
      resolveKetDanChoice(action);
    } else if (action === 'pill_again_formula') {
      refineTrucCoDan(true);
    } else if (action === 'pill_again_merit') {
      var canM = L.bagCanAdd(state, 'truc_co_dan', 1);
      if (!canM.ok) { toast(canM.reason, 4200); }
      else if ((state.sectMerit || 0) < 60) { toast('Chưa đủ điểm cống hiến (đang có ' + L.fmtNum(state.sectMerit || 0) + ', cần 60). Hãy làm việc tông môn để tích thêm, hoặc gom nguyên liệu theo công thức.', 4600); }
      else {
        state.sectMerit -= 60;
        if (!state.flags.pillMeritPaid) state.flags.pillMeritPaid = true;
        var rbM = L.bagAdd(state, 'truc_co_dan', 1);
        if (rbM.ok) { sfxQuest(); toast('Đã ghi 60 điểm cống hiến và luyện lại Trúc Cơ Đan. Lên Đài Trúc Cơ để vận công.', 4200); }
        refreshHUD(); saveNow();
      }
    } else if (action.indexOf('trib_') === 0) {
      resolveTribChoice(action);
    } else if (action.indexOf('grind_') === 0) {
      grindChoiceAction(action);
    } else if (action.indexOf('bc_') === 0) {
      bcChoiceAction(action);
    } else if (action.indexOf('party_') === 0) {
      partyChoiceAction(action);
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
      toast('Đã mở khóa: Thổ nạp (phím T cạnh giếng) và Vạn Âm Cộng Hưởng "Phá Âm" (phím 1).');
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
    if (tlFight) return; // gói phụ 13: đang trong ải Thăng Long — tương tác khóa, chỉ kiếm và thân pháp
    if (hhtFight) return; // Mục F: đang trong trận đài — tương tác khóa, chỉ đánh nhau
    if (dlg) { if (dlgTypeFinish()) return; if (dlg.who !== 'choice') nextLine(); return; }
    if (daiFight) return; // ARCIV ch.13: đang trong trận đài thách đấu — tương tác khóa (sau khối dlg để thoại giữa trận vẫn tiến bằng phím E)
    if (arcFig) return; // ARCIV ch.14/15: đang trong trận kịch bản dã ngoại — tương tác khóa
    var ft = frontTile();
    var pt = playerTile();
    // Chương 1 (gói phụ sau chơi thử live 02/11): khi chưa đo mà đang đứng
    // KỀ bất kỳ ô đế nào của bia đá trắc linh, phím tương tác thuộc về bia
    // đá — thắng cả NPC đứng kề (trưởng lão đứng ô kề nam của đế bia, U
    // Nhàn hay bất kỳ ai khác cũng vậy), tránh cảnh đứng sát bia mà chỉ mở
    // thoại thường trú. Đo xong thì tương tác trở lại bình thường.
    if (!state.flags.tested && (state.quest === 'q_trac' || state.quest === 'q_voice')) {
      var steleP = null;
      var defSP = L.activeMap();
      for (var spi = 0; spi < defSP.props.length; spi++) if (defSP.props[spi].id === 'bia_trac_linh') { steleP = defSP.props[spi]; break; }
      if (steleP) {
        var nearStele = false;
        for (var sfx = steleP.x; sfx < steleP.x + steleP.fx && !nearStele; sfx++) {
          for (var sfy = steleP.y + steleP.h - steleP.fy; sfy < steleP.y + steleP.h && !nearStele; sfy++) {
            if (Math.abs(sfx - pt.x) + Math.abs(sfy - pt.y) <= 1) nearStele = true;
          }
        }
        if (nearStele) { faceTowardTile(steleP.x, steleP.y + steleP.h - 1); return touchStele(); }
      }
    }
    var npc = npcsLive.filter(function (n) { return n.id !== 'de_tu_ho_tong' && n.x === ft.x && n.y === ft.y; })[0];
    if (!npc) {
      // NPC đứng kề ở BẤT KỲ hướng nào cũng bắt được, không chỉ hướng đang
      // quay mặt: người chơi đi bằng chạm thường dừng lại với hướng mặt bất
      // kỳ, và một lần ấn E im lặng hoàn toàn là đúng lỗi chặn chơi đã gặp
      // ở chơi thử live 1.1.0. Bắt được thì tự quay mặt về phía NPC.
      npc = npcsLive.filter(function (n) { return n.id !== 'de_tu_ho_tong' && Math.abs(n.x - pt.x) + Math.abs(n.y - pt.y) === 1; })[0];
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
    if (!p) {
      // Dự phòng kề bốn hướng cho VẬT THỂ — cùng lớp lỗi với dự phòng NPC ở
      // trên: hai đường tra cứu đầu chỉ trúng khi người chơi quay mặt đúng
      // vào footprint (hoặc đứng trên hàng vẽ trên của vật), nhưng hướng mặt
      // lúc dừng lại do hướng di chuyển cuối quyết định — đi bộ tới ô gợi ý
      // của nhiệm vụ "Dấu vết dọc đường" từ phía tây/bắc rồi bấm E/Tương tác
      // là im lặng hoàn toàn dù đang đứng sát bao tải, nhiệm vụ không sao
      // hoàn thành được (Bui báo trực tiếp 19:16 ngày 2026-11-01; chạm thẳng
      // vào vật thì được vì đường đó tự quay mặt về ô tiêu điểm trước). Đứng
      // kề bất kỳ phía nào của một vật có cờ tương tác cũng phải mở được:
      // tự quay mặt về ô footprint kề rồi đi tiếp đúng các nhánh dưới đây.
      // GÓI PHỤ KHẨN 3 (Bui báo chơi thật 09:53 ngày 2026-11-02: vẫn chết
      // lặng): vòng bốn hướng trên vẫn bỏ sót bốn ô CHÉO kề footprint —
      // (52,24), (55,24), (52,22), (55,22) quanh bao tải. Di chuyển theo
      // điểm ảnh nên ô dừng thật của người chơi là bất kỳ ô nào quanh vật;
      // bao tải lại vẽ 2×2 trong khi footprint chỉ là hàng đáy, nên đứng
      // "sát góc bao tải" theo con mắt rất thường là đứng chéo theo dữ
      // liệu. Nay quét MỌI vật có cờ tương tác: ô người chơi cách
      // footprint tối đa một ô theo từng trục (khoảng cách Chebyshev ≤ 1,
      // gồm cả bốn ô chéo) thì trúng, lấy vật gần nhất theo tổng khoảng
      // cách trục, tự quay mặt về ô footprint gần nhất. Đây là kỷ luật
      // neo tương tác chung cho mọi vật thể, không riêng bao tải.
      var bestP = null, bestFx = 0, bestFy = 0, bestScore = 1e9;
      var propsNear = L.activeMap().props;
      for (var pn = 0; pn < propsNear.length; pn++) {
        var cp = propsNear[pn];
        if (!cp.interact) continue;
        if (L.isSessionHidden(state.map, cp.id)) continue; // vật thể đã mở trong phiên bí cảnh: không còn tương tác
        var cfY0 = cp.y + cp.h - cp.fy, cfY1 = cp.y + cp.h - 1;
        var cnx = Math.max(cp.x, Math.min(pt.x, cp.x + cp.fx - 1));
        var cny = Math.max(cfY0, Math.min(pt.y, cfY1));
        var cgx = Math.abs(pt.x - cnx), cgy = Math.abs(pt.y - cny);
        if (Math.max(cgx, cgy) > 1) continue;
        if (cgx + cgy < bestScore) { bestScore = cgx + cgy; bestP = cp; bestFx = cnx; bestFy = cny; }
      }
      if (bestP) { p = bestP; faceTowardTile(bestFx, bestFy); }
    }
    if (p && p.id === 'bia_trac_linh') return touchStele();
    if (p && p.id === 'coc_go') {
      if (state.flags.dummyBroken) return say([{ who: 'narrate', text: 'Cọc gỗ đã gãy. Đòn cộng hưởng đầu tiên của ngươi làm nó nứt từ trong lõi.' }]);
      return say([{ who: 'narrate', text: 'Cọc gỗ luyện công. ' + (state.unlocked.indexOf('voice') >= 0 ? 'Đứng gần và nhấn phím 1 để dùng Vạn Âm Cộng Hưởng "Phá Âm" (cần 30 Tĩnh Âm).' : 'Gỗ chắc thế này, tay không không làm gì được.') }]);
    }
    if (p && p.id === 'gieng') return say([{ who: 'narrate', text: 'Giếng nước đầu trấn. Nước trong, hơi mát bốc lên — linh khí quanh đây đậm hơn hẳn nơi khác.' }]);
    // Hệ đồ ăn (đợt 2026-11-04): quán trọ trấn = điểm mua + bếp nấu +
    // quà cơm nắm lần đầu; trạm nghỉ giữa đường = bếp nấu; hai bãi nấm
    // = điểm hái nguyên liệu. Toàn bộ qua menu lựa chọn + thông báo,
    // KHÔNG có lời thoại lồng tiếng mới trong đợt này.
    if (p && p.id === 'tuu_diem') return openFoodInn();
    if (p && p.id === 'tram_nghi') return say(foodCookScene('tram'));
    if (p && p.id === 'bai_nam_tran') return gatherFoodHere('tran');
    if (p && p.id === 'bai_nam_duong') return gatherFoodHere('duong_mon');
    if (p && p.id === 'vet_tich') return touchTracks();
    if (p && p.id === 'thuoc_lon') return towerMeasure();
    if (p && p.id === 'kho_hua') {
      if (state.quest === 'q4_dieu_tra' && !state.flags.clueKho) {
        return say(ST.SCENE_KHO_CLUE, function () { state.flags.clueKho = true; refreshHUD(); saveNow(); toast('Đã có manh mối: sổ kho Hứa gia.', 3200); });
      }
      if (state.quest === 'q4_dieu_tra' && state.flags.clueKho) return say([{ who: 'narrate', text: 'Sổ kho đã nằm trong tay ngươi. Thêm lời của một nhân chứng nữa, vụ việc sẽ không còn đường chối.' }]);
      return say([{ who: 'narrate', text: 'Kho Hứa gia: gạo, vải, và mấy rương linh thảo khô khóa kín. Mọi thứ ngăn nắp — ngăn nắp tới mức bất thường.' }]);
    }
    if (p && (p.id === 'viec_go' || p.id === 'viec_nuoc' || p.id === 'viec_bao')) {
      // Việc tông dùng chung vật thể, theo thứ tự: (a) cốt truyện đang mở -> doChore,
      // (b) instance luân phiên active khớp vật thể -> grindSectStepDone, (c) doChore thường trú.
      var sectIns = grindSectActiveForProp(p.id);
      var storyOpen = state.quest === 'q7_tap_dich' || (state.flags.sectJobRound && state.flags.sectJobRound === L.chapterOfQuest(state));
      if (sectIns && !storyOpen) return grindSectStepDone(sectIns);
      return doChore(p);
    }
    if (p && p.id === 'kiem_bia_dai') {
      // Nhánh riêng của Mục F: bia kiếm chỉ hiện chữ qua toast (như biển
      // chỉ đường) — không mở thoại, không sinh câu nói mới ngoài đường
      // lồng tiếng (khai HANDLED_PROPS ở test-voice-coverage mục 5).
      // ARCIV ch.13: sau q13_de_nghi, bia kiếm là ĐIỂM VÀO thang thách
      // đấu lặp (bậc vo_dich giữ khóa cho chương 18) — lựa chọn qua
      // dòng choice (không lồng tiếng như mọi lựa chọn của người chơi).
      sfxUi();
      if (L.challengeOpen && L.challengeOpen(state)) {
        return say([{ who: 'choice', text: 'Kiếm Bia Đài Đấu Kiếm — mặt bia khắc tên các đời đại đệ tử từng thắng tỉ thí trên đài này. Thang thách đấu đã mở: ngươi sẽ thách đấu bậc nào?', options: [
          { label: 'Thách đấu: Đệ tử nội môn', action: 'arc_dai_open_noi_mon' },
          { label: 'Thách đấu: Tinh anh nội môn (thắng có mảnh bí pháp ô 03)', action: 'arc_dai_open_tinh_anh' },
          { label: (L.questReached && L.questReached(state, 'q18_chung_cu')) ? 'Thách đấu: Vô Địch Đỗ Gia — hạng quán quân (thắng có mảnh bí pháp ô 07)' : 'Thách đấu: Quán quân đài (chưa mở — mở sau trận đấu công khai ở Cô Châu)', action: 'arc_dai_open_vo_dich' },
          { label: 'Chỉ xem bia, chưa thách đấu', action: 'arc_dai_open_leave' }
        ] }]);
      }
      toast('Kiếm Bia Đài Đấu Kiếm — mặt bia khắc tên các đời đại đệ tử từng thắng tỉ thí trên đài này. Tên trên cùng là của chính Hoa Hướng Thần.', 4200);
      return;
    }
    if (p && p.id === 'thang_long_dai') return touchThangLong();
    if (p && p.id === 'linh_chi') return touchLinhChi();
    if (p && p.id === 'vuon_duoc') return touchVuonDuoc();
    if (p && p.id === 'vet_tich_hb') return touchVetTichHb();
    if (p && p.id === 'duoc_dan_diem') return touchDuocDan();
    if (p && p.id === 'dai_truc_co') return touchDaiTrucCo();
    // Vật thể có cờ tương tác nhưng chưa có nhánh riêng ở các chương đã xây
    // (việc tạp dịch, hai đài và linh chi của chương 7-8 đều đã có nhánh
    // riêng ở ngay trên): vẫn đáp lại bằng một câu xem xét để chạm/E không
    // bao giờ "chết lặng".
    // 9 prop bí cảnh: nhánh riêng trước nhánh fallback chung (cổng giọng).
    if (p && p.id === 'bc_gate_thuyliem') return bcGateInteract('bc_thuyliem');
    if (p && p.id === 'cua_tan_tich') return bcTanTichInteract();
    if (p && p.id === 'bc_gate_kiemtrung') return bcGateKiemTrungInteract();
    if (p && p.id === 'bc_gate_tran_tam') return bcGateTranTamInteract();
    if (p && p.id === 'tap_ket_tran_tam') return partyStagingInteract();
    if (p && p.id === 'bc_gate_hoiphong') return bcGateInteract('bc_hoiphong_mo');
    if (p && p.id === 'vach_nut') return bcVachInteract();
    if (p && p.id === 'cua_phe_thuoc') return bcPheInteract();
    if (p && p.id === 'tinh_mac_tran') return bcTranInteract();
    if (p && p.id === 'cua_mo_that') return bcMoThatInteract();
    if (p && p.id === 'thu_trong_mo') return bcLetterInteract();
    if (p && p.interact) return say([{ who: 'narrate', text: 'Ngươi xem xét ' + (p.name || 'vật này') + ' — lúc này chưa có việc gì với nó.' }]);
    // ARCIV ch.14: sau trận giữ đất, hiện trường (47,38) thành điểm hái
    // dược nhỏ VĨNH VIỄN (một lượt mỗi ngày game) — cài bằng điểm tương
    // tác engine tại chỗ vì RESOURCE_NODES là dữ kiện logic đã chốt.
    if (state.map === 'duong_mon' && state.flags.q14SiteDone && Math.max(Math.abs(pt.x - 47), Math.abs(pt.y - 38)) <= 1) return arcSiteHarvest();
    // Cuối interact(): điểm hái kề (Chebyshev <= 1, kể cả ô thân cây trang trí).
    var nd = grindNearestNode();
    if (nd) return grindHarvest(nd);
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
    clickPath = smoothPath(bestPath); clickTarget = best; clickLegFrom = { x: px, y: py }; medLatch = false; clickPathRaw = false; clickSegAnchor = { x: px, y: py };
    pendingInteract = { kind: target.kind, id: target.id, name: target.name || target.id, standX: best.x, standY: best.y, focusX: f1.x, focusY: f1.y };
  }
  /* ---------- Tự tìm đường làm nhiệm vụ (lệnh Bui 19:16 ngày 2026-11-01) ----------
     Bấm nút "Tự tìm đường" ở ô nhiệm vụ (hoặc bấm vào tên/mô tả nhiệm vụ):
     nhân vật tự ĐI BỘ tới mốc gợi ý (hint) của nhiệm vụ hiện tại. Cùng bản
     đồ thì tìm đường thẳng tới ô đích của mốc; khác bản đồ thì đi từng
     chặng qua đồ thị cổng — mỗi chặng chỉ tìm đường trên bản đồ đang đứng,
     bước lên dải cổng để cổng tự kích hoạt như đi tay. Điều kiện cổng được
     tôn trọng tuyệt đối: cổng chưa mở khóa thì chặng dừng ở ô kề dải cổng
     và báo đúng lý do khóa, không bao giờ đi xuyên điều kiện. Tới đích của
     mốc là DỪNG — không tự bấm tương tác thay người chơi (nhiệm vụ dạng
     tới-nơi-là-xong vốn kích hoạt bằng vùng khi bước vào). Mọi điều khiển
     tay (phím, cần, chạm mới, mở thoại) đều hủy tự tìm đường ngay. */
  function cancelQuestNav() { questNav = null; }
  function navRouteMaps(fromMap, toMap) {
    if (fromMap === toMap) return [fromMap];
    var prev = {}; prev[fromMap] = null;
    var queue = [fromMap];
    while (queue.length) {
      var cur = queue.shift();
      var def = L.MAPS[cur];
      if (!def) continue;
      for (var i = 0; i < def.portals.length; i++) {
        var nx = def.portals[i].to;
        if (nx in prev) continue;
        prev[nx] = cur;
        if (nx === toMap) {
          var route = [nx], c = cur;
          while (c) { route.unshift(c); c = prev[c]; }
          return route;
        }
        queue.push(nx);
      }
    }
    return null;
  }
  function navFromTile() { return { x: Math.floor((px + 16) / TILE), y: Math.floor((py + 16) / TILE) }; }
  // ĐIỂM 2 (đợt vá theo chơi thử live 2026-11-03): tập ô NPC dùng cho
  // khâu CHỐT ĐÍCH của dẫn đường nhiệm vụ = hợp nhất ảnh chụp npcsLive
  // với vị trí pha NPC tính từ logic theo ĐÚNG trạng thái hiện tại
  // (L.npcPosFor — cùng nguồn renderer dùng để đặt NPC lên bản đồ).
  // Chốt đích chỉ dựa vào ảnh chụp sống có một lỗ hổng thời điểm: ở
  // biên chuyển cảnh/bản đồ hoặc sau các cảnh dựng sẵn (nơi npcsLive bị
  // làm rỗng/xây lại), ảnh chụp có thể chưa có NPC đích trong khi NPC
  // đã đứng trên bản đồ — đích bấm sẽ rơi thẳng lên ô NPC. Từ nay đích
  // nhiệm vụ luôn được phân giải trên tập hợp nhất này: ô đích bị NPC
  // đứng hoặc không đứng được thì lệch sang ô kề đi được gần nhất (luật
  // cũ của navResolveDest, nay kín cả hai nguồn vị trí).
  function navBlockers() {
    var out = npcsLive.slice(), seen = {};
    out.forEach(function (n) { seen[n.x + ',' + n.y] = true; });
    if (state) {
      (L.activeMap().npcs || []).forEach(function (n) {
        var pp = L.npcPosFor(state, n), k = pp.x + ',' + pp.y;
        if (!seen[k]) { seen[k] = true; out.push({ id: n.id, x: pp.x, y: pp.y }); }
      });
    }
    return out;
  }
  // Ô đích đi được cho mốc gợi ý trên bản đồ hiện tại: mốc đứng được thì
  // dùng thẳng; mốc nằm trong dấu chân vật thể / ô NPC thì lấy ô đi được
  // kề gần nhất mà tìm đường tới được.
  function navResolveDest(hx, hy, npcs) {
    var blockers = npcs || navBlockers();
    if (L.isWalkable(hx, hy, blockers)) return { x: hx, y: hy };
    for (var r = 1; r <= 4; r++) {
      var best = null, bestPath = null;
      for (var oy = -r; oy <= r; oy++) for (var ox = -r; ox <= r; ox++) {
        if (Math.max(Math.abs(ox), Math.abs(oy)) !== r) continue;
        var cx = hx + ox, cy = hy + oy;
        if (!L.isWalkable(cx, cy, blockers)) continue;
        var p = L.findPath(navFromTile(), { x: cx, y: cy }, blockers);
        if (p && (!bestPath || p.length < bestPath.length)) { best = { x: cx, y: cy }; bestPath = p; }
      }
      if (best) return best;
    }
    return null;
  }
  function navIssuePath(dest, npcs) {
    var path = L.findPath(navFromTile(), dest, npcs || npcsLive);
    if (!path) return false;
    if (!path.length) return true; // đã đứng ngay đích
    clickPath = smoothPath(path); clickTarget = dest; clickLegFrom = { x: px, y: py }; medLatch = false; clickPathRaw = false; clickSegAnchor = { x: px, y: py };
    pathStuckT = 0;
    return true;
  }
  function startQuestNav() {
    if (!state || dlg) return;
    var side = selectedSideTargetQuest();
    var q = side || L.questById(state.quest);
    if (!q || !q.hint) { toast('Nhiệm vụ này chưa có điểm đến cố định — hãy làm theo phần mô tả của nhiệm vụ.'); return; }
    questNav = { targetMap: q.hint.map || 'tran', hx: q.hint.x, hy: q.hint.y, leg: null, replans: 0, lastMap: state.map, lockMsg: '' };
    pendingInteract = null;
    toast('Tự tìm đường tới: ' + q.name + '.', 2400);
  }
  function questNavTick() {
    if (!questNav || dlg || fade.phase !== 'idle') return;
    if (clickPath && clickPath.length) return; // còn đang đi chặng hiện tại
    if (questNav.lastMap !== state.map) { questNav.lastMap = state.map; questNav.replans = 0; questNav.leg = null; }
    var pt = playerTile();
    var leg = questNav.leg;
    if (leg && leg.map === state.map && pt.x === leg.dest.x && pt.y === leg.dest.y) {
      if (leg.kind === 'hint') { questNav = null; toast('Đã tới điểm nhiệm vụ.'); return; }
      var lm = questNav.lockMsg; questNav = null; toast(lm, 4200); return; // 'preportal' hoặc 'portal' không kích hoạt (khóa)
    }
    questNav.replans++;
    if (questNav.replans > 4) { questNav = null; toast('Tự tìm đường bị chặn — hãy đi tay tới điểm nhiệm vụ theo mốc vàng trên bản đồ.'); return; }
    if (state.map === questNav.targetMap) {
      var navNpcs = navBlockers(); // ĐIỂM 2: cùng một tập chặn cho cả chốt đích lẫn tìm đường chặng đích
      var dest = navResolveDest(questNav.hx, questNav.hy, navNpcs);
      if (!dest) { questNav = null; toast('Không tìm được ô đứng cạnh điểm nhiệm vụ.'); return; }
      if (dest.x === pt.x && dest.y === pt.y) { questNav = null; toast('Đã tới điểm nhiệm vụ.'); return; }
      questNav.leg = { kind: 'hint', dest: dest, map: state.map };
      if (!navIssuePath(dest, navNpcs)) { questNav = null; toast('Không tìm được đường tới điểm nhiệm vụ.'); }
      return;
    }
    var route = navRouteMaps(state.map, questNav.targetMap);
    if (!route || route.length < 2) { questNav = null; toast('Chưa có đường nối tới bản đồ của nhiệm vụ này.'); return; }
    var def = L.activeMap(), po = null, i;
    for (i = 0; i < def.portals.length; i++) if (def.portals[i].to === route[1]) { po = def.portals[i]; break; }
    if (!po) { questNav = null; toast('Chưa có đường nối tới bản đồ của nhiệm vụ này.'); return; }
    questNav.lockMsg = po.cond === 'dummy' ? 'Hãy hoàn thành chương 1 (phá cọc gỗ) trước khi rời trấn.' : (po.lockMsg || 'Chưa thể qua cổng này lúc này.');
    if (L.portalUnlocked(state, po)) {
      // Đích chặng = một ô trên dải cổng tới được; bước lên dải thì cổng
      // tự kích hoạt và vòng lặp lập chặng tiếp trên bản đồ mới.
      var stripDest = null;
      for (var sx = po.x; sx < po.x + po.w && !stripDest; sx++) for (var sy = po.y; sy < po.y + po.h; sy++) {
        if (L.isWalkable(sx, sy, npcsLive) && L.findPath(navFromTile(), { x: sx, y: sy }, npcsLive)) stripDest = { x: sx, y: sy };
      }
      if (!stripDest) { questNav = null; toast('Không tìm được đường tới cổng.'); return; }
      questNav.leg = { kind: 'portal', dest: stripDest, map: state.map };
      if (!navIssuePath(stripDest)) { questNav = null; toast('Không tìm được đường tới cổng.'); }
      return;
    }
    // Cổng chưa mở khóa: đi tới ô kề dải cổng phía trong bản đồ, dừng và
    // báo đúng lý do — tuyệt đối không bước lên dải cổng, không xuyên qua.
    var preDest = null;
    for (var ax = po.x - 1; ax <= po.x + po.w && !preDest; ax++) for (var ay = po.y - 1; ay <= po.y + po.h; ay++) {
      if (ax >= po.x && ax < po.x + po.w && ay >= po.y && ay < po.y + po.h) continue; // chính dải cổng
      if (!L.isWalkable(ax, ay, npcsLive)) continue;
      var adjStrip = false;
      for (var bx = po.x; bx < po.x + po.w; bx++) for (var by = po.y; by < po.y + po.h; by++)
        if (Math.abs(bx - ax) + Math.abs(by - ay) === 1) adjStrip = true;
      if (adjStrip && L.findPath(navFromTile(), { x: ax, y: ay }, npcsLive)) preDest = { x: ax, y: ay };
    }
    if (!preDest) { var lm2 = questNav.lockMsg; questNav = null; toast(lm2, 4200); return; }
    questNav.leg = { kind: 'preportal', dest: preDest, map: state.map };
    if (!navIssuePath(preDest)) { var lm3 = questNav.lockMsg; questNav = null; toast(lm3, 4200); }
  }

  /* ---------- Dẫn đường nhiệm vụ (gói phụ H — lệnh Bui 16:39 ngày 2026-11-02) ----------
     Mũi tên quanh nhân vật chỉ hướng tới mục tiêu của BƯỚC nhiệm vụ hiện
     tại + dấu "!" ngay trên vật/NPC mục tiêu. Đây là dẫn đường ĐI TAY, bổ
     sung cho nút "Tự tìm đường" ở trên (không đổi hành vi của nút đó, dùng
     chung đồ thị cổng navRouteMaps của nó).
     Nguồn mục tiêu — chỉ dữ kiện SẴN CÓ, không bịa tọa độ:
       (a) trường hint của QUESTS (js/logic.js): ô đứng gợi ý của bước;
       (b) vật tương tác / NPC của chính bước đó: hint luôn là ô đứng KỀ
           vật/NPC đích (khoảng cách 1 ô theo dữ kiện bản đồ), nên phân
           giải "bám" (snap) hint vào vật có cờ interact hoặc NPC có
           khoảng cách tới hint <= 1 ô trong ĐÚNG bản đồ của hint — dấu
           "!" neo trên VẬT, không neo trên ô gợi ý (tiền lệ q2_vet_tich:
           hint (53,24), bao tải vet_tich footprint hàng 23, thân vẽ từ
           hàng 22 — neo "!" theo rect vẽ của bao tải, không theo (53,24));
       (c) các bước nhiều pha đọc cờ/pha của chính bước (guidePhaseTarget).
     Bước có hint = null (q_break, q_done, các mốc *_done, q10_lo_than_phan)
     là bước không có đích không gian cụ thể -> phân giải trả null, ẩn cả
     mũi tên lẫn dấu "!".
     Quy ước trình diễn — theo ĐÚNG quy ước sẵn có của mốc nhiệm vụ trên
     canvas (khối "chỉ đường nhiệm vụ" cũ trong render) và của panel nhiệm
     vụ: panel #hud-quest (DOM) không bao giờ bị ẩn bởi thoại hay trận;
     mốc canvas cũ chỉ ẩn khi ĐANG THOẠI (!dlg) và vẫn vẽ khi đang trận
     (enc là giao chiến thời gian thực ngay trên bản đồ, người chơi vẫn
     phải di chuyển). Dẫn đường mới theo cùng quy ước: ẩn khi dlg mở,
     hiện khi đang trận. Lớp vẽ này thuần canvas, không nhận thao tác. */
  var GUIDE_HIDE_TILES = 3; // mục tiêu hiển thị đã trong khung hình VÀ cách nhân vật <= 3 ô (Chebyshev) thì ẩn mũi tên
  var guideFrame = null;    // khung dẫn đường vừa vẽ gần nhất (trạng thái phiên — resetPresentationState dọn)
  function guidePropById(mapId, propId) {
    var def = L.MAPS[mapId]; if (!def) return null;
    for (var i = 0; i < def.props.length; i++) if (def.props[i].id === propId) return def.props[i];
    return null;
  }
  function guideNpcDefById(mapId, npcId) {
    var def = L.MAPS[mapId]; if (!def) return null;
    for (var i = 0; i < def.npcs.length; i++) if (def.npcs[i].id === npcId) return def.npcs[i];
    return null;
  }
  // Vị trí hiệu lực của NPC trên bản đồ đích: bản đồ hiện tại thì lấy vị
  // trí SỐNG (npcsLive — NPC có thể bị cảnh ghim lệch), bản đồ khác thì
  // lấy vị trí theo pha nhiệm vụ từ dữ kiện tĩnh qua L.npcPosFor.
  function guideNpcPos(mapId, npcDef) {
    if (state && mapId === state.map) {
      for (var i = 0; i < npcsLive.length; i++) if (npcsLive[i].id === npcDef.id) return { x: npcsLive[i].x, y: npcsLive[i].y, name: npcsLive[i].name };
    }
    var pp = L.npcPosFor ? L.npcPosFor(state, npcDef) : npcDef;
    return { x: pp.x, y: pp.y, name: npcDef.name };
  }
  function guideMkNpcTarget(mapId, npcDef) {
    var pos = guideNpcPos(mapId, npcDef);
    return { map: mapId, x: pos.x, y: pos.y, kind: 'npc', targetId: npcDef.id, name: pos.name || npcDef.name || npcDef.id,
             ax: pos.x * TILE + 16, ay: (pos.y + 1) * TILE - 80 };
  }
  function guideMkPropTarget(mapId, p) {
    var footCx = p.x + Math.floor((p.fx - 1) / 2), footY = p.y + p.h - 1;
    return { map: mapId, x: footCx, y: footY, kind: 'prop', targetId: p.id, name: p.name || p.id,
             ax: (p.x + p.w / 2) * TILE, ay: p.y * TILE };
  }
  /* Pha con của các bước nhiều mục tiêu: mỗi nhánh lấy tọa độ từ ĐÚNG vật
     / NPC của pha đó trong dữ kiện bản đồ, không qua hint. Trả null khi
     bước không có pha con (đi tiếp đường hint chung ở dưới). */
  function guidePhaseTarget(q) {
    var f = state.flags || {}, p, n;
    if (q.id === 'q4_thien_co') {
      // Sứ giả Thiên Cơ Các (Trần Chính Đạo) đứng tại sân phủ theo pha —
      // vị trí pha (17,33) trong NPC_PHASE_POS, cách hint (16,37) tới 4 ô
      // nên đường bám <= 1 ô không với tới; lấy thẳng NPC của bước.
      n = guideNpcDefById('co_chau', 'tran_chinh_dao');
      return n ? guideMkNpcTarget('co_chau', n) : null;
    }
    if (q.id === 'q4_dieu_tra') {
      // Ba pha nối tiếp trong interact/talkTo: sổ kho -> nhân chứng Lão
      // Ngô -> đối chất Lục Tranh (thứ tự khóa bởi clueKho/clueWitness).
      if (!f.clueKho) { p = guidePropById('co_chau', 'kho_hua'); return p ? guideMkPropTarget('co_chau', p) : null; }
      if (!f.clueWitness) { n = guideNpcDefById('co_chau', 'dan_thanh_a'); return n ? guideMkNpcTarget('co_chau', n) : null; }
      n = guideNpcDefById('co_chau', 'luc_tranh');
      return n ? guideMkNpcTarget('co_chau', n) : null;
    }
    if (q.id === 'q7_tap_dich') {
      // Ba việc tạp dịch theo CHORE_DEFS (cờ choreGo/choreNuoc/choreBao),
      // xong cả ba thì về quản sự tạp dịch (đúng hint của bước).
      if (!f.choreGo) { p = guidePropById('thanh_van_tong', 'viec_go'); return p ? guideMkPropTarget('thanh_van_tong', p) : null; }
      if (!f.choreNuoc) { p = guidePropById('thanh_van_tong', 'viec_nuoc'); return p ? guideMkPropTarget('thanh_van_tong', p) : null; }
      if (!f.choreBao) { p = guidePropById('thanh_van_tong', 'viec_bao'); return p ? guideMkPropTarget('thanh_van_tong', p) : null; }
      return null;
    }
    if (q.id === 'q8_chuan_bi' && f.chuanBiSeen && !f.chiGathered) {
      // Đã nghe công thức ở đại điện: đích con tiếp theo là cụm Linh Chi
      // Sau Núi (touchLinhChi chỉ nhận hái ở đúng pha này).
      p = guidePropById('thanh_van_tong', 'linh_chi');
      return p ? guideMkPropTarget('thanh_van_tong', p) : null;
    }
    if (q.id === 'q11_u_nhan' && f.uNhanCityMet && !f.uNhanChoice) {
      // Đã gặp ở Cô Châu: U Nhàn lên Thanh Vân Tông chờ ở đại điện (chính
      // toast của pha đầu dặn vậy) — đích đổi BẢN ĐỒ theo cờ.
      n = guideNpcDefById('thanh_van_tong', 'u_nhan');
      return n ? guideMkNpcTarget('thanh_van_tong', n) : null;
    }
    if (q.id === 'q14_dieu_tra') {
      // ARCIV: ba pha nối tiếp — chưa xem sổ thì đích là điểm sổ đất ở
      // phủ thành (26,39); đã xem sổ thì đích là hiện trường đất linh
      // trên đường mòn (47,38), nơi nhân chứng + trận giữ đất chờ sẵn.
      if (!f.q14SoDat) return { map: 'co_chau', x: 26, y: 39, kind: 'point', targetId: null, name: 'Sổ đất ở phủ thành', ax: 26 * TILE + 16, ay: 39 * TILE, hx: 26, hy: 39 };
      return { map: 'duong_mon', x: 47, y: 38, kind: 'point', targetId: null, name: 'Hiện trường đất linh', ax: 47 * TILE + 16, ay: 38 * TILE, hx: 47, hy: 38 };
    }
    if (q.id === 'q17_do_lai') {
      // ARCIV đợt 2 B.12: thước chưa rung -> gặp chủ trì ở tháp nội (23,9);
      // thước đang rung -> đích là vùng giữ thước phía bắc sảnh (19,8).
      var rq = f.q17RulerShaking ? { x: 19, y: 8 } : { x: 23, y: 9 };
      return { map: 'thap_noi', x: rq.x, y: rq.y, kind: 'point', targetId: null, name: f.q17RulerShaking ? 'Thước pha lê lớn' : 'Chủ trì tháp', ax: rq.x * TILE + 16, ay: rq.y * TILE, hx: rq.x, hy: rq.y };
    }
    if (q.id === 'q19_phan_ung') {
      return { map: 'co_chau', x: 51, y: 64, kind: 'point', targetId: null, name: 'Đoàn nhân chứng ở phố nam', ax: 51 * TILE + 16, ay: 64 * TILE, hx: 51, hy: 64 };
    }
    if (q.id === 'q20_ran_nut') {
      // soulPublic: gặp Trần Chính Đạo (26,16); chưa công khai: gặp ký lục quan (36,8).
      var rn = f.soulPublic ? { x: 26, y: 16 } : { x: 36, y: 8 };
      return { map: 'thien_co_lau', x: rn.x, y: rn.y, kind: 'point', targetId: null, name: f.soulPublic ? 'Trần Chính Đạo' : 'Ký lục quan', ax: rn.x * TILE + 16, ay: rn.y * TILE, hx: rn.x, hy: rn.y };
    }
    if (q.id === 'q20_doi_sach') {
      if (f.ch20SoulDone) return { map: 'thien_co_lau', x: 27, y: 16, kind: 'point', targetId: null, name: 'Trần Chính Đạo', ax: 27 * TILE + 16, ay: 16 * TILE, hx: 27, hy: 16 };
      return { map: 'thanh_van_tong', x: 60, y: 27, kind: 'point', targetId: null, name: 'Đại điện Thanh Vân Tông', ax: 60 * TILE + 16, ay: 27 * TILE, hx: 60, hy: 27 };
    }
    if (q.id === 'q22_dot_pha') {
      // ARCIV đợt 3 B.8: đích là Đài Trúc Cơ phía bắc tông (60,6).
      return { map: 'thanh_van_tong', x: 60, y: 6, kind: 'point', targetId: null, name: 'Đài Trúc Cơ', ax: 60 * TILE + 16, ay: 6 * TILE, hx: 60, hy: 6 };
    }
    if (q.id === 'q24_lenh_cuu_nguoi') {
      // ARCIV đợt 3 B.8: đích là đệ tử hộ tống dth_tran ở đoạn hai vách (45,43).
      return { map: 'duong_mon', x: 45, y: 43, kind: 'point', targetId: null, name: 'Đệ Tử Hộ Tống', ax: 45 * TILE + 16, ay: 43 * TILE, hx: 45, hy: 43 };
    }
    if (q.id === 'q24_tha_mang' || q.id === 'q24_manh_moi') {
      // ARCIV đợt 3 B.8: đích là Mạc Cửu U (mcu_tran) ở mép đoạn đường (43,45).
      return { map: 'duong_mon', x: 43, y: 45, kind: 'point', targetId: null, name: 'Mạc Cửu U', ax: 43 * TILE + 16, ay: 45 * TILE, hx: 43, hy: 45 };
    }
    return null;
  }
  /* Phân giải mục tiêu của bước nhiệm vụ hiện tại:
     { map, x, y, kind, targetId, name, ax, ay, hx, hy } hoặc null.
     x/y = ô neo của VẬT/NPC đích (ô đứng của NPC; ô footprint giữa-đáy
     của vật) — với kind 'point' thì x/y chính là ô hint (điểm đến không
     có vật/NPC đi kèm: miệng cổng, vùng kích hoạt, quảng trường).
     hx/hy = ô hint gốc của bước (ô đứng tương tác), giữ để đối chiếu.
     ax/ay = điểm neo VẼ (pixel thế giới) của dấu "!": tâm-trên của rect
     vẽ vật, đỉnh đầu sprite NPC, tâm ô với điểm đến. */
  /* Mục H: nhiệm vụ phụ ĐANG CHỌN (panel phụ) — khi có, dẫn đường bám
     nhiệm vụ phụ này thay cho nhiệm vụ chính; bỏ chọn thì quay về chính.
     Hint lấy qua sideQuestGuideHint (động theo tiến độ, tọa độ thật). */
  function selectedSideTargetQuest() {
    if (!state || !L.ensureSideQuests || !L.sideQuestDef) return null;
    var sq = L.ensureSideQuests(state);
    if (!sq.selected) return null;
    var def = L.sideQuestDef(sq.selected);
    if (!def) return null;
    var st = L.sideQuestStatus(state, def);
    if (st !== 'available' && st !== 'ready') return null;
    var hint = L.sideQuestGuideHint(state, def);
    if (!hint) return null;
    return { id: def.id, name: def.name, hint: hint };
  }
  function resolveQuestTarget() {
    if (!state) return null;
    var side = selectedSideTargetQuest();
    if (side) return resolveHintTarget(side.id, side.name, side.hint, null);
    var q = L.questById(state.quest);
    if (!q || !q.hint) return null;
    return resolveHintTarget(q.id, q.name, q.hint, q);
  }
  function resolveHintTarget(qid, qname, hint, mainQ) {
    var q = { id: qid, name: qname, hint: hint };
    var phased = mainQ ? guidePhaseTarget(mainQ) : null;
    if (phased) { phased.quest = q.id; phased.hx = q.hint.x; phased.hy = q.hint.y; return phased; }
    var mapId = q.hint.map || 'tran';
    var def = L.MAPS[mapId];
    if (!def) return null;
    var hx = q.hint.x, hy = q.hint.y;
    // Bám vật tương tác: khoảng cách từ hint tới FOOTPRINT của vật (kề
    // footprint = 1) — chỉ vật có cờ interact mới là ứng viên.
    var bestProp = null, bestPropD = 1e9, i, p;
    for (i = 0; i < def.props.length; i++) {
      p = def.props[i];
      if (!p.interact) continue;
      if (L.isSessionHidden && L.isSessionHidden(mapId, p.id)) continue;
      var fx0 = p.x, fx1 = p.x + p.fx - 1, fy0 = p.y + p.h - p.fy, fy1 = p.y + p.h - 1;
      var pdx = Math.max(fx0 - hx, 0, hx - fx1), pdy = Math.max(fy0 - hy, 0, hy - fy1);
      var pd = pdx + pdy;
      if (pd < bestPropD) { bestPropD = pd; bestProp = p; }
    }
    // Bám NPC: khoảng cách Manhattan từ hint tới ô đứng hiệu lực của NPC.
    var npcDefs = (mapId === state.map && npcsLive.length)
      ? npcsLive.map(function (ln) { return { id: ln.id, name: ln.name, x: ln.x, y: ln.y, dir: ln.dir }; })
      : def.npcs;
    var bestNpc = null, bestNpcD = 1e9;
    for (i = 0; i < npcDefs.length; i++) {
      var nd = Math.abs(npcDefs[i].x - hx) + Math.abs(npcDefs[i].y - hy);
      if (nd < bestNpcD) { bestNpcD = nd; bestNpc = npcDefs[i]; }
    }
    var t = null;
    if (bestProp && bestPropD <= 1 && bestPropD <= bestNpcD) t = guideMkPropTarget(mapId, bestProp);
    else if (bestNpc && bestNpcD <= 1) t = guideMkNpcTarget(mapId, bestNpc);
    if (!t) t = { map: mapId, x: hx, y: hy, kind: 'point', targetId: null, name: q.name, ax: hx * TILE + 16, ay: hy * TILE };
    t.quest = q.id; t.hx = hx; t.hy = hy;
    return t;
  }
  /* Mục tiêu HIỂN THỊ trên bản đồ hiện tại: cùng bản đồ thì là chính mục
     tiêu nhiệm vụ; khác bản đồ thì là cổng đầu tiên trên đường BFS qua đồ
     thị cổng của nút Tự tìm đường (navRouteMaps) — mũi tên chỉ cổng đó,
     dấu "!" không hiện (việc của mũi tên). Không có đường cổng -> null. */
  function guideDisplayTarget(t) {
    if (!t || !state) return null;
    if (t.map === state.map) return t;
    var route = navRouteMaps(state.map, t.map);
    if (!route || route.length < 2) return null;
    var def = L.activeMap(), po = null, i;
    for (i = 0; i < def.portals.length; i++) if (def.portals[i].to === route[1]) { po = def.portals[i]; break; }
    if (!po) return null;
    return { map: state.map, x: po.x + Math.floor(po.w / 2), y: po.y + Math.floor(po.h / 2), kind: 'portal',
             targetId: null, name: po.label || po.to, portalTo: route[1], finalMap: t.map,
             ax: (po.x + po.w / 2) * TILE, ay: (po.y + po.h / 2) * TILE };
  }
  /* Trạng thái dẫn đường của khung hiện tại — hàm THUẦN duy nhất mà cả
     render() lẫn tay nắm VSLC_GUIDE cùng đọc, nên số kiểm chứng và hình
     vẽ không bao giờ lệch nhau. Không giữ trạng thái phiên nào khác
     ngoài guideFrame (bản sao của khung vừa vẽ, phục vụ đọc lại). */
  function guideCompute() {
    var out = { quest: state ? state.quest : null, target: null, display: null,
                arrow: false, bang: false, angle: null, distTiles: null, inView: false, dlgHidden: !!dlg };
    if (!state) return out;
    var t = resolveQuestTarget();
    out.target = t;
    if (!t) return out;
    var d = guideDisplayTarget(t);
    out.display = d;
    if (!d) return out;
    var pt = playerTile();
    out.distTiles = Math.max(Math.abs(d.x - pt.x), Math.abs(d.y - pt.y));
    var effW = viewW / zoom, effH = viewH / zoom;
    out.inView = d.ax >= camX - 4 && d.ax <= camX + effW + 4 && d.ay >= camY - 4 && d.ay <= camY + effH + 4;
    out.angle = Math.atan2(d.ay - (py + 16), d.ax - (px + 16));
    if (dlg) return out; // đang thoại: ẩn cả hai (quy ước mốc canvas cũ)
    out.bang = d === t; // dấu "!" chỉ khi mục tiêu hiển thị là chính vật/NPC/điểm của bước (cùng bản đồ)
    out.arrow = !(out.inView && out.distTiles <= GUIDE_HIDE_TILES);
    return out;
  }
  function drawGuideBang(ax, ay) {
    var bob = Math.sin(tNow / 250) * 4;
    var pulse = 0.5 + 0.5 * Math.sin(tNow / 300);
    ctx.fillStyle = 'rgba(255,217,78,' + (0.16 + 0.12 * pulse).toFixed(3) + ')';
    ctx.beginPath(); ctx.arc(ax, ay - 13 + bob, 15 + 2 * pulse, 0, Math.PI * 2); ctx.fill();
    ctx.font = 'bold 26px sans-serif'; ctx.textAlign = 'center';
    ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(32,22,4,0.92)';
    ctx.strokeText('!', ax, ay - 3 + bob);
    ctx.fillStyle = '#ffd94e';
    ctx.fillText('!', ax, ay - 3 + bob);
  }
  function drawGuideArrow(d) {
    var cx = px + 16, cy = py + 16;
    var ang = Math.atan2(d.ay - cy, d.ax - cx);
    var r = 46, axp = cx + Math.cos(ang) * r, ayp = cy + Math.sin(ang) * r;
    var pulse = 0.72 + 0.28 * Math.sin(tNow / 180);
    ctx.save();
    ctx.translate(axp, ayp); ctx.rotate(ang);
    ctx.fillStyle = 'rgba(255,217,78,' + pulse.toFixed(3) + ')';
    ctx.strokeStyle = 'rgba(32,22,4,0.9)'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(13, 0); ctx.lineTo(-8, -8.5); ctx.lineTo(-4.5, 0); ctx.lineTo(-8, 8.5); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  /* Tu vi sự kiện của phần 3: cộng dồn có trần theo đúng bảng phân bổ đã
     duyệt (không đặt thẳng lên trần như các mốc khóa cứng của phần 1-2). */
  function addTuvi(n) {
    var cap = L.REALMS[state.realm] && L.REALMS[state.realm].tuviNext;
    if (cap) state.tuvi = Math.min(cap, (state.tuvi || 0) + n);
    else state.tuvi = (state.tuvi || 0) + n;
  }
  function talkTo(npc) {
    // ARCIV đợt 2: NPC tiêm chỉ-đứng-nhìn (nhân chứng phố nam + người
    // theo dõi Thiên Cơ Các) — một câu lảng tránh qua toast (arcIvNpcLine).
    var arcLine2 = arcIvNpcLine(npc.id);
    if (arcLine2) { toast(arcLine2, 4200); return; }
    // Mục H — nhịp GẶP GỠ XÃ HỘI của nhiệm vụ phụ sq_post_dong_mon: chào
    // hỏi một đồng môn ở quảng trường tông (Hoa Hướng Thần / đệ tử A / đệ
    // tử B tại thanh_van_tong) sau mốc Trúc Cơ thì ghi nhận bước gặp gỡ.
    // Chỉ ghi cờ + toast (KHÔNG thêm thoại say() mới — giữ cổng lồng
    // tiếng xanh tuyệt đối), rồi luồng thoại gốc của NPC chạy tiếp nguyên vẹn.
    if (state && state.map === 'thanh_van_tong' && L.sideQuestDef && L.questReached(state, 'q8_done') &&
        (npc.id === 'hoa_huong_than' || npc.id === 'de_tu_a' || npc.id === 'de_tu_b')) {
      if (L.sideMarkSocial(state)) {
        toast('Đã chào hỏi đồng môn ở quảng trường — bước gặp gỡ của nhiệm vụ phụ đã ghi nhận. Tiếp theo: nhận và trả một Việc Tông Môn ở Quản Sự Tạp Dịch.', 4600);
        saveNow();
      }
    }
    // Chương 1 (gói phụ sau chơi thử live 02/11): trưởng lão trắc linh đứng
    // đúng ô kề nam của đế bia đá nên người chơi đứng phía nam chỉ gặp được
    // ông, không chạm được bia. Chưa đo (q_trac/q_voice, cờ tested chưa
    // đặt) thì nói chuyện với trưởng lão cũng dẫn thẳng vào cảnh đo ở bia;
    // đo xong rồi ông trở lại thoại thường trú như cũ.
    if (npc.id === 'truong_lao' && !state.flags.tested && (state.quest === 'q_trac' || state.quest === 'q_voice')) return touchStele();
    // Điểm chạm theo nhiệm vụ/cửa hàng của chương 3 (ưu tiên hơn thoại thường).
    if (npc.id === 'thap_chu' && state.map === 'thap_noi' && state.quest === 'q3_cong_phap') return receiveManuals();
    // ARCIV đợt 2 ch.20: chủ quán là người báo tin ở thành — nhánh này
    // phải đứng TRƯỚC nhánh làm ca khách điếm thường trú ở dưới, nếu
    // không nhánh thường trú sẽ nuốt mất điểm chạm cốt truyện.
    if (npc.id === 'chu_quan' && state.map === 'co_chau' && state.quest === 'q20_bao_tin') {
      return say(state.flags.soulPublic ? ST.SCENE_CH20_BAO_TIN_A : ST.SCENE_CH20_BAO_TIN_B, function () {
        state.quest = 'q20_giam_sat'; refreshHUD(); saveNow();
        toast('Tin đã rõ: người của Thiên Cơ Các đang theo dõi các đoàn ra vào thành. Đi xuống phố nam gần cổng thành mà xem.', 4600);
      });
    }
    if (npc.id === 'chu_quan' && (state.flags.innWork || 0) < 2 && L.walletOpen(state)) return say(ST.SCENE_INN);
    if (npc.id === 'duoc_su') {
      var delDuoc = grindDeliveryForNpc('duoc_su');
      if (delDuoc) return grindCompleteDelivery(npc, delDuoc);
      if (state.flags.bagUnlocked) return say([{ who: 'choice', text: 'Ngươi sẽ…', options: [
        { label: 'Xem danh sách thu thập', action: 'grind_open_gather' },
        { label: 'Vào hiệu thuốc', action: 'grind_pharmacy' }
      ] }]);
      return say(ST.SCENE_PHARMACY);
    }
    if (npc.id === 'phap_khi_chu') return say(buildFaShopScene());
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
      // Gói phụ 7: trận tỉ thí là MÀN ĐÁNH THẬT (xem khối duel) — mở đầu
      // bằng ba dòng gốc, đánh kịch bản tại sân, khép bằng đoạn kết của
      // đúng nhánh; cờ duelSeen nay đặt ở cuối trận trong finishDuelScene.
      return startDuelScene();
    }
    // Chương 6: đêm tấn công bắt đầu từ lời cảnh báo của Chính Ngôn; thư mời sau trận.
    if (npc.id === 'chinh_ngon' && state.map === 'co_chau' && state.quest === 'q6_phong_thu') {
      state.flags.atkWave = 1;
      return say(ST.SCENE_ATK_INTRO, function () { atkSpawnWave(1); say(ST.SCENE_ATK1); }); // đợt một kéo vào sân ngay khi lời dẫn bắt đầu (gói phụ 8)
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
    // Trọng thương sau độ kiếp hỏng (docs/realm-prep/ mục 6.1): trưởng
    // lão nhận ra thương thế ở lần gặp đầu tiên và chỉ rõ hai đường
    // dưỡng thương — chỉ nhắc một lần mỗi đợt thương.
    if (npc.id === 'truong_lao_tong' && state.flags.trongThuong && !state.flags.ttElderSeen) {
      state.flags.ttElderSeen = true;
      refreshHUD(); saveNow();
      return say([{ who: 'truong_lao_tong', text: 'Thương thế của ngươi là thương do lôi kiếp — kinh mạch còn ứ sét tàn, thổ nạp chậm đi một nửa là phải. Hai đường dưỡng thương: ngồi nghỉ ở điểm linh khí tới khi máu hồi đầy, hoặc dùng hai viên Hồi Khí Đan. Thương khép rồi, quay lại đài độ tiếp — đài không đi đâu cả.' }]);
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
      return refineTrucCoDan(false);
    }
    if (npc.id === 'truong_lao_tong' && (state.quest === 'q8_ho_phap' || state.quest === 'q8_truc_co') && state.flags.pillGranted && !L.bagHas(state, 'truc_co_dan') && state.realm < 2) {
      // Luyện lại Trúc Cơ Đan: cùng công thức, hoặc 60 điểm cống hiến thay
      // cho toàn bộ nguyên liệu (đường đã duyệt trong thiết kế thiên kiếp).
      return say([
        { who: 'truong_lao_tong', text: 'Viên Trúc Cơ Đan trước không còn nữa sao? Luyện lại không phải không được — nhưng nguyên liệu không tự mọc ra. Hoặc gom lại đúng công thức cũ: Linh Chi Sau Núi một cây, Yêu Đan cấp 1 một viên, Thanh Tâm Thảo ba cây, 30 Linh Thạch. Hoặc ghi 60 điểm cống hiến tông môn thay cho tất cả.' },
        { who: 'choice', text: 'Ngươi sẽ…', options: [
          { label: 'Luyện lại theo công thức — trừ nguyên liệu và 30 Linh Thạch', action: 'pill_again_formula' },
          { label: 'Luyện lại bằng 60 điểm cống hiến tông môn', action: 'pill_again_merit' }
        ] }
      ]);
    }
    if (npc.id === 'hoa_huong_than' && state.quest === 'q7_hoa_huong_than') {
      /* Mục F (đợt vá 2026-11-02, lệnh Bui 19:41-19:43): tỉ thí KHÔNG
         còn diễn ở quảng trường bằng menu chọn lệnh — sau lời thách đấu
         nguyên văn, cả hai được đưa lên ĐÀI ĐẤU KIẾM riêng và đánh trận
         THỜI GIAN THỰC tại đó (xem khối hhtFight bên dưới). */
      state.flags.hhtHits = 0;
      return say(ST.SCENE_HHT_INTRO, function () { enterHhtArena(); });
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
          toast('Hoàn thành chương 8 — ngươi đã đứng ở Trúc Cơ Sơ Kỳ.', 4600);
        });
      });
    }
    /* ---------- Phần 3 (chương 9-12): các điểm chạm truyện ---------- */
    if (npc.id === 'truong_lao_tong' && state.quest === 'q9_tin_du') {
      return say(ST.SCENE_CH9_TIN_DU, function () {
        state.flags.ch9TinDu = true;
        addTuvi(40);
        state.quest = 'q9_truy_vet'; refreshHUD(); saveNow();
        toast('Tin dữ đã rõ: vào Thung Lũng Hồi Phong qua cổng sau núi ở phía đông bắc tông (sau Đài Trúc Cơ), tới gốc anh đào cổ thụ ở bãi đáp.', 4600);
      });
    }
    if (npc.id === 'truong_lao_tong' && state.quest === 'q11_he_qua') {
      return say(state.flags.soulPublic ? ST.SCENE_CH11_HE_QUA_A : ST.SCENE_CH11_HE_QUA_B, function () {
        state.flags.ch11HeQua = true;
        addTuvi(100);
        state.quest = 'q11_u_nhan'; refreshHUD(); saveNow();
      });
    }
    if (npc.id === 'truong_lao_tong' && state.quest === 'q11_chuan_bi_ket_dan') {
      if (!state.flags.ketDanCoreGot) {
        return say(ST.SCENE_CH11_CHUAN_BI, function () {
          state.flags.ketDanCoreGot = true;
          addTuvi(150);
          refreshHUD(); saveNow();
          if (state.realm === 2 && state.stage === 2 && (L.REALMS[2].tuviNext || 0) > 0 && state.tuvi >= L.REALMS[2].tuviNext) return finishVienMan();
          toast('Đã rõ việc chuẩn bị Kết Đan: hái dược dẫn ở bãi bắc Thung Lũng Hồi Phong, và tích tu vi cho đầy Trúc Cơ Viên Mãn.', 4600);
        });
      }
      if (state.realm === 2 && state.stage === 2 && state.tuvi >= (L.REALMS[2].tuviNext || 0)) return finishVienMan();
      return say([{ who: 'truong_lao_tong', text: 'Việc chuẩn bị ta đã giao rồi: dược dẫn ở bãi bắc Thung Lũng Hồi Phong, Yêu Đan cấp 2 trong tay con thú giữ dược, và tu vi phải đầy Trúc Cơ Viên Mãn. Thiếu thứ nào, lo cho đủ thứ ấy trước.' }]);
    }
    if (npc.id === 'truong_lao_tong' && state.quest === 'q11_vat_dan') return refineKetDanDan();
    /* ---------- Cung IV (chương 13–16) — điểm chạm theo hợp đồng A.1 ---------- */
    if (npc.id === 'truong_lao_tong' && state.quest === 'q13_tro_lai_tong') {
      return say(ST.SCENE_CH13_TRO_LAI, function () { state.quest = 'q13_de_nghi'; refreshHUD(); saveNow(); });
    }
    if (npc.id === 'truong_lao_tong' && state.quest === 'q13_de_nghi') {
      return say(ST.SCENE_CH13_DE_NGHI, function () { arcEnterDaiStory(); });
    }
    if (npc.id === 'u_nhan' && state.map === 'co_chau' && state.quest === 'q13_ve_thanh') {
      return say(ST.SCENE_CH13_VE_THANH, function () {
        arcClaimToast('q13_done');
        state.quest = 'q14_hai_thinh_cau'; refreshHUD(); saveNow();
        toast('Hoàn thành chương 13. Về Thanh Vân Đại Điện — hai thư thỉnh cầu nữa đang chờ.', 4200);
      });
    }
    if (npc.id === 'truong_lao_tong' && state.quest === 'q14_hai_thinh_cau') {
      return say(ST.SCENE_CH14_HAI_THINH_CAU, function () { state.quest = 'q14_dieu_tra'; refreshHUD(); saveNow(); });
    }
    if (npc.id === 'dan_c' && state.map === 'duong_mon' && state.quest === 'q14_dieu_tra' && state.flags.q14SoDat && !state.flags.q14WitnessSeen) {
      // Nhân chứng giữ đất do engine tiêm vào npcsLive tại (45,38) cạnh
      // hiện trường (duong_mon không có NPC này trong dữ kiện bản đồ).
      return say(ST.SCENE_CH14_NHAN_CHUNG, function () {
        state.flags.q14WitnessSeen = true; refreshHUD(); saveNow();
        say(ST.SCENE_CH14_HIEN_TRUONG, function () { arcStartCh14SiteFight(); });
      });
    }
    if (npc.id === 'dan_c' && state.map === 'duong_mon' && state.quest === 'q14_dieu_tra' && state.flags.q14WitnessSeen && !state.flags.q14SiteDone) {
      // Đã nghe nhân chứng nhưng trận giữ đất chưa khép (thua/đang dở):
      // nói lại với lão là vào thẳng hiện trường đánh tiếp.
      return say(ST.SCENE_CH14_HIEN_TRUONG, function () { arcStartCh14SiteFight(); });
    }
    if (npc.id === 'hoa_huong_than' && state.map === 'thanh_van_tong' && state.quest !== 'q7_hoa_huong_than' && L.challengeOpen && L.challengeOpen(state) &&
        !(state.flags.soulExposed && (state.flags.soulSectPaidFor || 0) < L.chapterOfQuest(state)) &&
        !(L.arcIvSectSoulServiceDue && L.arcIvSectSoulServiceDue(state))) {
      // ARCIV ch.13: Hoa Hướng Thần GIỮ SỔ đài (theo cảnh DE_NGHI) —
      // điểm vào thang thách đấu lặp tại quảng trường tông. Bậc
      // vo_dich mở từ q18_chung_cu (đợt 2, B.8). Điều kiện loại trừ
      // cuối: khi dịch vụ hồn CẤP TÔNG đến hạn thì nhánh dịch vụ (ở
      // dưới, sau nhánh ch.11) phải thắng menu đài này. Dòng choice
      // không lồng tiếng.
      return say([{ who: 'choice', text: 'Hoa Hướng Thần đang giữ sổ Đài Thách Đấu, ngón tay lật trang ghi tên người thách đấu. Ngươi sẽ…', options: [
        { label: 'Thách đấu: Đệ tử nội môn', action: 'arc_dai_open_noi_mon' },
        { label: 'Thách đấu: Tinh anh nội môn (thắng có mảnh bí pháp ô 03)', action: 'arc_dai_open_tinh_anh' },
        { label: (L.questReached && L.questReached(state, 'q18_chung_cu')) ? 'Thách đấu: Vô Địch Đỗ Gia — hạng quán quân (thắng có mảnh bí pháp ô 07)' : 'Thách đấu: Quán quân đài (chưa mở)', action: 'arc_dai_open_vo_dich' },
        { label: 'Trò chuyện', action: 'arc_dai_open_leave' }
      ] }]);
    }
    if (npc.id === 'truong_lao_tong' && state.quest === 'q14_tu_choi') {
      return say(ST.SCENE_CH14_TU_CHOI, function () { state.quest = 'q14_bao_lanh'; refreshHUD(); saveNow(); });
    }
    if (npc.id === 'cho_a' && state.map === 'co_chau' && state.quest === 'q14_bao_lanh') {
      return say(ST.SCENE_CH14_BAO_LANH, function () {
        arcClaimToast('q14_done');
        state.quest = 'q15_bao_dong'; refreshHUD(); saveNow();
        toast('Hoàn thành chương 14. Tới điểm hẹn ở hiện trường đất linh trên đường mòn (47,38).', 4200);
      });
    }
    if (npc.id === 'truong_lao_tong' && state.quest === 'q15_bao_cao') {
      return say(ST.SCENE_CH15_BAO_CAO, function () {
        arcClaimToast('q15_done');
        state.quest = 'q16_tinh_tu'; refreshHUD(); saveNow();
        toast('Hoàn thành chương 15. Boss dã ngoại Hộ Trận Kiếm Linh đã mở ở Thung Lũng Hồi Phong (chu kỳ 5 ngày).', 4600);
      });
    }
    if (npc.id === 'truong_lao_tong' && state.quest === 'q16_tinh_tu') {
      return say(ST.SCENE_CH16_TINH_TU, function () {
        state.flags.ch16TinhTuSeen = true; refreshHUD(); saveNow();
        toast('Hãy thổ nạp (phím T) tại điểm linh khí sườn tây tông (31,61) cho tới khi tu vi đầy giai đoạn.', 4600);
      });
    }
    if (npc.id === 'truong_lao_tong' && state.quest === 'q16_linh_ngo') {
      return say(ST.SCENE_CH16_LINH_NGO, function () { refreshHUD(); saveNow(); });
    }
    if (npc.id === 'truong_lao_tong' && state.quest === 'q16_benh_vuc') {
      return say(ST.SCENE_CH16_BENH_VUC, function () {
        // KHÓA THỨ TỰ (A.1): khoản +300 của q16_pre_break PHẢI nhận
        // TRƯỚC khi thử đột phá ở q16_dot_pha.
        arcClaimToast('q16_pre_break');
        state.quest = 'q16_dot_pha'; refreshHUD(); saveNow();
        toast('Lên Đài Trúc Cơ ở phía bắc tông (60,6) để đột phá Kim Đan Trung Kỳ.', 4200);
      });
    }
    /* ---------- Cung IV đợt 2 (chương 17–20) — điểm chạm theo hợp đồng B.3 ---------- */
    if (npc.id === 'ttl_thap' && state.quest === 'q17_tin_tu_thap') {
      return say(ST.SCENE_CH17_TIN_TU_THAP, function () {
        state.quest = 'q17_do_lai'; refreshHUD(); saveNow();
        toast('Vào tháp nội gặp chủ trì tháp để bắt đầu buổi đo lại.', 4200);
      });
    }
    if (npc.id === 'thap_chu' && state.map === 'thap_noi' && state.quest === 'q17_do_lai' && !state.flags.q17RulerShaking) {
      return say(ST.SCENE_CH17_DO_LAI, function () {
        state.flags.q17RulerShaking = true; refreshHUD(); saveNow();
        toast('Thước pha lê đang rung loạn! Đứng gần thước lớn phía bắc sảnh (vùng x 16–23, y 6–10), tích Tĩnh Âm bằng cách đứng yên lắng nghe, rồi dùng Định Âm (phím 4) — uy lực cần 140.', 5600);
      });
    }
    if (npc.id === 'thap_chu' && state.map === 'thap_noi' && state.quest === 'q17_do_lai' && state.flags.q17RulerShaking) {
      toast('Thước vẫn đang rung loạn — đứng gần thước lớn phía bắc sảnh, tích Tĩnh Âm bằng đứng yên lắng nghe rồi dùng Định Âm (phím 4); uy lực cần 140.', 4600);
      return;
    }
    if ((npc.id === 'chap_su_thap' || npc.id === 'thap_chu') && state.quest === 'q17_chat_van') {
      return say(ST.SCENE_CH17_CHAT_VAN, function () {
        state.quest = 'q17_di_ninh'; refreshHUD(); saveNow();
        toast('Ra khuôn viên tháp gặp Hứa Di Ninh.', 4200);
      });
    }
    if (npc.id === 'dn_thap' && state.quest === 'q17_di_ninh') {
      return say(ST.SCENE_CH17_DI_NINH, function () {
        say(ST.SCENE_CH17_DONE, function () {
          arcClaimToast('q17_done');
          state.quest = 'q18_tranh_chap'; refreshHUD(); saveNow();
          toast('Hoàn thành chương 17. Tới sân phủ Cô Châu Thành — vụ tranh chấp hai nhà đang chờ phân xử.', 4600);
        });
      });
    }
    if (npc.id === 'quan_phu_phu' && state.quest === 'q18_tranh_chap') {
      return say(ST.SCENE_CH18_TRANH_CHAP, function () { state.quest = 'q18_ap_luc'; refreshHUD(); saveNow(); });
    }
    if (npc.id === 'gct_phu' && state.quest === 'q18_ap_luc') {
      if (!state.flags.ch18FightStarted) return say(ST.SCENE_CH18_AP_LUC_HUA); // điểm lựa chọn ch18_hua_nghe / ch18_hua_viet (B.4)
      return say(ST.SCENE_CH18_DAU_MO, function () { arcStartCh18ChampFight(); }); // đã thua một lần: mở lại trận quán quân luôn
    }
    if (npc.id === 'quan_phu_phu' && state.quest === 'q18_cho_phien') {
      return say(ST.SCENE_CH18_CHO_PHIEN, function () {
        say(ST.SCENE_CH18_DONE, function () {
          arcClaimToast('q18_done');
          state.quest = 'q19_phan_xu'; refreshHUD(); saveNow();
          toast('Hoàn thành chương 18. Phiên phân xử mở ngay tại sân phủ — nói chuyện với quan phủ.', 4600);
        });
      });
    }
    if (npc.id === 'quan_phu_phu' && state.quest === 'q19_phan_xu') {
      return say(ST.SCENE_CH19_PHAN_XU, function () {
        state.quest = 'q19_phan_ung'; refreshHUD(); saveNow();
        toast('Bản án đã tuyên. Hộ tống đoàn nhân chứng rời phủ xuống phố nam — đi theo họ xuống phía nam thành.', 4600);
      });
    }
    if (npc.id === 'truong_lao_tong' && state.quest === 'q19_an_dinh') {
      return say(ST.SCENE_CH19_AN_DINH, function () {
        arcClaimToast('q19_an_dinh');
        say(ST.SCENE_CH19_DONE, function () {
          arcClaimToast('q19_done');
          state.quest = 'q20_ran_nut'; refreshHUD(); saveNow();
          toast('Hoàn thành chương 19: Lệnh không cho mượn. Tới Thiên Cơ Lâu — có tin về vết rạn trong các.', 4600);
        });
      });
    }
    if (npc.id === 'truong_lao_tong' && state.quest === 'q20_doi_sach' && !state.flags.ch20SoulDone) {
      if (!state.flags.ch20SoulStarted) {
        return say(ST.SCENE_CH20_HON_LOAN_MO, function () { arcStartCh20SoulFight(); });
      }
      arcStartCh20SoulFight(); // đã bắt đầu mà chưa xong (thua thử lại): mở trận luôn
      return;
    }
    if (npc.id === 'tran_chinh_dao' && state.map === 'thien_co_lau' && state.quest === 'q20_ran_nut' && state.flags.soulPublic) {
      return say(ST.SCENE_CH20_RAN_NUT_A, function () {
        state.quest = 'q20_bao_tin'; refreshHUD(); saveNow();
        toast('Tới Cô Châu Thành gặp người báo tin ở khách điếm Vọng Châu (69,27).', 4200);
      });
    }
    if (npc.id === 'ky_luc_quan' && state.map === 'thien_co_lau' && state.quest === 'q20_ran_nut' && !state.flags.soulPublic) {
      return say(ST.SCENE_CH20_RAN_NUT_B, function () {
        state.quest = 'q20_bao_tin'; refreshHUD(); saveNow();
        toast('Tới Cô Châu Thành gặp người báo tin ở khách điếm Vọng Châu (69,27).', 4200);
      });
    }
    if (npc.id === 'tran_chinh_dao' && state.map === 'thien_co_lau' && state.quest === 'q20_doi_sach' && state.flags.ch20SoulDone) {
      return say(ST.SCENE_CH20_LOI_DAP, function () {
        state.flags.q20WatchersGone = true; refreshHUD();
        say(ST.SCENE_CH20_DONE, function () {
          arcClaimToast('q20_done');
          state.quest = 'q20_done'; refreshHUD(); saveNow();
          toast('Hoàn thành chương 20: Rạn nứt trong các. Phẩm hồn 4 đã được ghi nhận, dịch vụ hồn cấp tông đã mở ở quảng trường tông.', 4800);
        });
      });
    }
    /* ---------- Cung IV đợt 3 (chương 21–24) — điểm chạm theo hợp đồng B.3 ---------- */
    if (npc.id === 'un_cho' && state.quest === 'q21_doan_thuong') {
      return say(ST.SCENE_CH21_DOAN_THUONG, function () {
        state.quest = 'q21_so_sach'; refreshHUD(); saveNow();
        toast('Về phủ Hứa lấy sổ thuế ba năm — U Nhàn đang chờ ở sân phủ (16,36).', 4200);
      });
    }
    if (npc.id === 'un_phu' && state.quest === 'q21_so_sach') {
      return say(ST.SCENE_CH21_SO_SACH, function () {
        state.quest = 'q21_doi_chat'; refreshHUD(); saveNow();
        toast('Hồ sơ đã đủ ba thứ. Ra cổng nam thành (51,74) đứng với đoàn hàng — giữ xe hàng trong lúc U Nhàn đối chất ở phủ thành.', 4600);
      });
    }
    if (npc.id === 'chinh_ngon' && state.map === 'co_chau' && state.quest === 'q21_danh_gia') {
      return say(ST.SCENE_CH21_DANH_GIA, function () {
        arcClaimToast('q21_done');
        state.quest = 'q22_tham_bao'; refreshHUD(); saveNow();
        toast('Hoàn thành chương 21: Người thay mặt nhà họ Hứa. Về Thanh Vân Đại Điện — thám báo của tông vừa về tới nơi.', 4600);
      });
    }
    if (npc.id === 'truong_lao_tong' && state.quest === 'q22_tham_bao') {
      return say(ST.SCENE_CH22_THAM_BAO, function () {
        refreshHUD(); saveNow();
        toast('Ra vành tuyến trên đường mòn tự xác minh một mắt trận — đoạn hai vách quanh (44,44). Đừng vào sâu.', 4600);
      });
    }
    if (npc.id === 'truong_lao_tong' && state.quest === 'q22_tich_luy') {
      return say(ST.SCENE_CH22_TICH_LUY, function () {
        state.quest = 'q22_nhan_viec'; refreshHUD(); saveNow();
        toast('Tới điểm rơi cổng tông (61,87) nhận thẻ lệnh hộ tống và phân công các hướng giữ đoàn.', 4600);
      });
    }
    if (npc.id === 'dth_cong' && state.quest === 'q22_nhan_viec') {
      // Cảnh có PHAN_CONG_CHOICE nằm giữa mảng: lựa chọn chỉ ghi cờ qua
      // resolvePhanCong rồi nextLine() chạy nốt 3 dòng sau (B.4); claim
      // q22_pre_break (+250) nổ ở callback CUỐI cảnh này, trước mốc đột
      // phá ở q22_dot_pha đúng khóa thứ tự của chương 22.
      return say(ST.SCENE_CH22_NHAN_VIEC, function () {
        arcClaimToast('q22_pre_break');
        state.quest = 'q22_dot_pha'; refreshHUD(); saveNow();
        toast('Phân công đã ghi vào sổ đoàn. Lên Đài Trúc Cơ ở phía bắc tông (60,6) để đột phá Kim Đan Hậu Kỳ trước chuyến đi.', 4600);
      });
    }
    if (npc.id === 'truong_lao_tong' && state.quest === 'q24_len_duong' && !state.flags.q24Reported) {
      return say(arcCh24LenDuongLines(), function () {
        state.flags.q24Reported = true; refreshHUD(); saveNow();
        toast('Việc đã báo cáo xong. Xuống Cô Châu Thành từ biệt Hứa U Nhàn ở sân phủ Hứa trước khi lên đường sông Bạc.', 4600);
      });
    }
    if (npc.id === 'un_phu' && state.quest === 'q24_len_duong') {
      if (!state.flags.q24Reported) { toast('Hãy về Thanh Vân Đại Điện báo cáo trưởng lão trước, rồi mới xuống thành từ biệt U Nhàn.', 4200); return; }
      return say(ST.SCENE_CH24_TU_BIET, function () {
        say(ST.SCENE_CH24_DONE, function () {
          arcClaimToast('q24_done');
          state.quest = 'q24_done'; refreshHUD(); saveNow();
          toast('Hoàn thành chương 24: Manh mối cứng đầu tiên — cung IV khép lại ở Kim Đan Hậu Kỳ.', 5200);
        });
      });
    }
    if (npc.id === 'dth_tran' && state.quest === 'q24_lenh_cuu_nguoi') {
      return arcStartCh24Path(); // rẽ theo flags.ch24Path (B.7); thiếu cờ -> giữ bí mật, không ghi sổ
    }
    if (npc.id === 'mcu_tran' && state.quest === 'q24_tha_mang') {
      return say(ST.SCENE_CH24_THA_MANG, function () {
        state.quest = 'q24_manh_moi'; refreshHUD(); saveNow();
      });
    }
    if (npc.id === 'mcu_tran' && state.quest === 'q24_manh_moi') {
      return say(ST.SCENE_CH24_MANH_MOI, function () {
        state.quest = 'q24_len_duong'; refreshHUD(); saveNow();
        toast('Manh mối đã rõ: một cái tên, một cuốn hồ sơ, một nơi cất giữ. Về Thanh Vân Đại Điện báo cáo trưởng lão.', 4600);
      });
    }
    if (npc.id === 'tap_dich_truong' && state.map === 'thanh_van_tong') {
      var chNow = L.chapterOfQuest(state);
      if ((chNow === 9 || chNow === 11) && (state.flags.sectJobPaidFor || 0) < chNow) {
        if (state.flags.sectJobRound === chNow) {
          if (state.flags.choreGo && state.flags.choreNuoc && state.flags.choreBao) {
            return say([{ who: 'tap_dich_truong', text: 'Xong cả ba việc rồi à? Tay chân nhanh nhẹn hơn hẳn hồi mới vào tông. Đây — công của ngươi kỳ này.' }], function () {
              var rj = L.addLinhThach(state, 45);
              var mj = L.addSectMerit(state, 15);
              state.flags.sectJobPaidFor = chNow;
              state.flags.sectJobRound = 0;
              toast('Quản sự trả công việc tông: +45 Linh Thạch' + (rj.ok ? ' (số dư: ' + L.fmtNum(rj.balance) + ')' : '') + ' và +15 điểm cống hiến (tổng: ' + L.fmtNum(mj) + ').', 4400);
              refreshHUD(); saveNow();
            });
          }
          var missJ = [];
          if (!state.flags.choreGo) missJ.push('bổ củi ở đống củi phía nam sân');
          if (!state.flags.choreNuoc) missJ.push('gánh nước ở giếng sau bếp');
          if (!state.flags.choreBao) missJ.push('chuyển bao dược ở phía tây sân');
          return say([{ who: 'tap_dich_truong', text: 'Việc kỳ này chưa xong đâu. Còn thiếu: ' + missJ.join('; ') + '. Làm xong cả ba rồi quay lại đây, ta trả công một thể.' }]);
        }
        return say([{ who: 'tap_dich_truong', text: 'Lại có việc cho ngươi đây — việc của tông kỳ này: bổ củi, gánh nước, chuyển bao dược ở khu tạp dịch. Làm xong cả ba, quay lại ta ghi công: 45 Linh Thạch và 15 điểm cống hiến.' }], function () {
          state.flags.sectJobRound = chNow;
          state.flags.choreGo = false; state.flags.choreNuoc = false; state.flags.choreBao = false;
          refreshHUD(); saveNow();
          toast('Đã nhận việc tông kỳ này: bổ củi, gánh nước, chuyển bao dược ở khu tạp dịch đông nam.', 4200);
        });
      }
    }
    if (npc.id === 'tran_chinh_dao' && state.map === 'co_chau' && state.quest === 'q10_loi_moi') {
      return say(ST.SCENE_CH10_MOI, function () {
        addTuvi(40);
        state.quest = 'q10_vao_lau'; refreshHUD(); saveNow();
        toast('Vào Tĩnh Quan Lâu qua cửa phân đà ngay phía sau — lên phòng kín phía bắc lầu.', 4200);
      });
    }
    if (npc.id === 'bach_kinh_duong' && state.map === 'thien_co_lau') {
      if (state.quest === 'q10_vao_lau') {
        return say(ST.SCENE_CH10_VAO_LAU, function () { addTuvi(60); state.quest = 'q10_siet_bi_mat'; refreshHUD(); saveNow(); });
      }
      if (state.quest === 'q10_siet_bi_mat') {
        return say(ST.SCENE_CH10_SIET, function () { addTuvi(80); state.quest = 'q10_lo_than_phan'; refreshHUD(); saveNow(); });
      }
      if (state.quest === 'q10_lo_than_phan' && !state.flags.ch10BreakReady) return say(ST.SCENE_CH10_LO_CHOICE);
      if (state.flags.ch10BreakReady) return finishCh10Break();
    }
    if (npc.id === 'tran_tu_linh' && state.map === 'co_chau' && state.flags.soulPublic && L.chapterOfQuest(state) >= 11 && (state.flags.soulClinicPaidFor || 0) < L.chapterOfQuest(state)) {
      return say(ST.SCENE_CH11_CLINIC_A, function () {
        var rc2 = L.addLinhThach(state, 40);
        state.flags.soulClinicPaidFor = L.chapterOfQuest(state);
        state.soulPower = (state.soulPower || 0) + 10;
        if (rc2.ok) toast('Thiên Cơ Các trả công luyện hồn công khai: +40 Linh Thạch (số dư: ' + L.fmtNum(rc2.balance) + ').', 4000);
        refreshHUD(); saveNow();
      });
    }
    if (npc.id === 'tran_tu_linh' && state.map === 'hb_valley') return say(ST.SCENE_TULINH_HOI_PHONG);
    if (npc.id === 'hoa_huong_than' && state.map === 'thanh_van_tong' && state.flags.soulExposed && L.chapterOfQuest(state) >= 11 && (state.flags.soulSectPaidFor || 0) < L.chapterOfQuest(state)) {
      return say(ST.SCENE_CH11_SECT_SOUL_B, function () {
        var rs2 = L.addLinhThach(state, 20);
        state.flags.soulSectPaidFor = L.chapterOfQuest(state);
        state.soulPower = (state.soulPower || 0) + 10;
        if (rs2.ok) toast('Tông ghi công luyện hồn công khai: +20 Linh Thạch (số dư: ' + L.fmtNum(rs2.balance) + ').', 4000);
        refreshHUD(); saveNow();
      });
    }
    // ARCIV đợt 2 ch.20: dịch vụ hồn CẤP TÔNG (sau phẩm hồn 4) — đặt
    // ngay sau nhánh dịch vụ hồn chương 11 sẵn có của NPC này (B.3).
    // [ĐỀ XUẤT SỐ] +30 hồn lực, +50 Linh Thạch qua addLinhThach.
    if (npc.id === 'hoa_huong_than' && state.map === 'thanh_van_tong' && L.arcIvSectSoulServiceDue && L.arcIvSectSoulServiceDue(state)) {
      return say(ST.SCENE_CH20_SOUL_SERVICE, function () {
        state.soulPower = (state.soulPower || 0) + 30;
        var rsv = L.addLinhThach(state, 50);
        state.flags.soulGrandPaidFor = L.chapterOfQuest(state);
        if (rsv.ok) toast('Tông ghi công ca hồn cấp tông: +30 hồn lực, +50 Linh Thạch (số dư: ' + L.fmtNum(rsv.balance) + ').', 4600);
        else toast('Tông ghi công ca hồn cấp tông: +30 hồn lực.', 4000);
        refreshHUD(); saveNow();
      });
    }
    if (npc.id === 'u_nhan' && state.map === 'hb_valley') return say(ST.SCENE_UNHAN_HOI_PHONG);
    if (npc.id === 'u_nhan' && state.map === 'co_chau' && state.quest === 'q11_u_nhan' && !state.flags.uNhanCityMet) {
      return say(ST.SCENE_CH11_U_NHAN, function () {
        state.flags.uNhanCityMet = true;
        refreshHUD(); saveNow();
        toast('Hứa U Nhàn sẽ lên Thanh Vân Tông — tới Thanh Vân Đại Điện gặp nàng ở đó.', 4400);
      });
    }
    if (npc.id === 'u_nhan' && state.map === 'thanh_van_tong' && state.quest === 'q11_u_nhan' && state.flags.uNhanCityMet && !state.flags.uNhanChoice) {
      return say(ST.SCENE_CH11_TU_THU, function () {
        state.flags.uNhanChoice = true;
        addTuvi(150);
        if (!state.flags.uNhanGift2) {
          var rg = L.addLinhThach(state, 35);
          if (rg.ok) { state.flags.uNhanGift2 = true; toast('Hứa gia tạ ơn: +35 Linh Thạch (số dư: ' + L.fmtNum(rg.balance) + ').', 4000); }
        }
        state.quest = 'q11_chuan_bi_ket_dan'; refreshHUD(); saveNow();
      });
    }
    if (npc.id === 'gia_nhan' && state.map === 'co_chau' && state.flags.ch9SilentRoute && !state.flags.giaNhanHealed && L.chapterOfQuest(state) >= 11) {
      return say(ST.SCENE_CH11_CHUA_GIA_NHAN, function () {
        state.flags.giaNhanHealed = true;
        state.soulPower = (state.soulPower || 0) + 10;
        refreshHUD(); saveNow();
        toast('Đã chữa lành thần hồn cho gia nhân trẻ của Hứa gia.', 3600);
      });
    }
    if (npc.id === 'cho_a' && state.map === 'co_chau' && state.flags.ch9SayRescue && !state.flags.benhSeen && L.chapterOfQuest(state) >= 11) {
      return say(ST.SCENE_CH11_BENH, function () { state.flags.benhSeen = true; refreshHUD(); saveNow(); });
    }
    // ARCIV đợt 2 ch.18: điểm gom chứng cứ ở chợ — đặt SAU nhánh ch.11
    // sẵn có của cho_a và TRƯỚC nhánh bảng săn ở dưới (đúng hợp đồng B.3).
    if (npc.id === 'cho_a' && state.map === 'co_chau' && state.quest === 'q18_chung_cu') {
      return say(ST.SCENE_CH18_CHUNG_CU, function () {
        state.quest = 'q18_cho_phien'; refreshHUD(); saveNow();
        toast('Chứng cứ đã gom đủ — về sân phủ Cô Châu dự phiên phân xử.', 4200);
      });
    }
    // Hệ cày (sau mọi nhánh cốt truyện, trước thoại thường trú): giao
    // hàng việc tông qua NPC, rồi bảng qua NPC hiện có (không có vật
    // thể bảng vật lý — báo điều phối viên, không tự bịa vật thể).
    var delNpc = grindDeliveryForNpc(npc.id);
    if (delNpc) return grindCompleteDelivery(npc, delNpc);
    // Đợt sửa lỗi nhiệm vụ nấu ăn (2026-11-05): sạp chợ bán đồ ăn phàm
    // tục NGAY từ giai đoạn hướng dẫn — bạc khi ví Linh Thạch còn khóa,
    // Linh Thạch sau đột phá — không chờ mở khóa săn; bảng treo thưởng
    // vẫn chỉ mở theo luật săn ở nhánh dưới.
    if (npc.id === 'cho_a' && state.map === 'co_chau' && !huntUnlocked()) {
      grindTalkNpcId = npc.id; grindTalkNpcName = npc.name;
      return say([{ who: 'choice', text: 'Ngươi sẽ…', options: [
        { label: 'Mua đồ ăn', action: 'food_open_buy' },
        { label: 'Trò chuyện', action: 'grind_idle' }
      ] }]);
    }
    if (npc.id === 'cho_a' && state.map === 'co_chau' && huntUnlocked()) {
      grindTalkNpcId = npc.id; grindTalkNpcName = npc.name;
      return say([{ who: 'choice', text: 'Ngươi sẽ…', options: [
        { label: 'Xem bảng treo thưởng', action: 'grind_open_hunt' },
        { label: 'Mua đồ ăn', action: 'food_open_buy' },
        { label: 'Trò chuyện', action: 'grind_idle' }
      ] }]);
    }
    if (npc.id === 'tap_dich_truong' && state.map === 'thanh_van_tong') {
      grindTalkNpcId = npc.id; grindTalkNpcName = npc.name;
      var sectOpts = [];
      if (huntUnlocked()) sectOpts.push({ label: 'Bảng treo thưởng (săn)', action: 'grind_open_hunt' });
      if (state.flags.bagUnlocked) sectOpts.push({ label: 'Danh sách thu thập', action: 'grind_open_gather' });
      if (L.questReached(state, 'q7_done')) sectOpts.push({ label: 'Việc tông môn', action: 'grind_open_sect' });
      // Đường công sức đổi đồ chống lôi kiếp (docs/realm-prep/ mục
      // 5.1): quản sự tạp dịch giữ sổ đổi — chỉ khi túi đã mở.
      if (state.flags.bagUnlocked) {
        sectOpts.push({ label: 'Đổi 30 điểm cống hiến lấy một lá Tị Lôi Phù', action: 'merit_buy_phu' });
        if (!L.bagHas(state, 'dan_loi_phap')) sectOpts.push({ label: 'Đổi 150 điểm cống hiến lấy Dẫn Lôi Pháp', action: 'merit_buy_phap' });
        // Đổi pháp bảo đeo được (đợt pháp bảo 2026-11-06): quản sự giữ
        // thêm sổ đổi pháp bảo — giá theo phẩm, món rút ngẫu nhiên
        // trong phẩm; Cực phẩm không đổi, chỉ rơi từ boss tổ đội.
        sectOpts.push({ label: 'Đổi 60 điểm cống hiến lấy một pháp bảo Hạ phẩm', action: 'merit_buy_treasure_1' });
        sectOpts.push({ label: 'Đổi 150 điểm cống hiến lấy một pháp bảo Trung phẩm', action: 'merit_buy_treasure_2' });
        sectOpts.push({ label: 'Đổi 400 điểm cống hiến lấy một pháp bảo Thượng phẩm', action: 'merit_buy_treasure_3' });
      }
      sectOpts.push({ label: 'Trò chuyện', action: 'grind_idle' });
      return say([{ who: 'choice', text: 'Ngươi sẽ…', options: sectOpts }]);
    }
    // ARCIV: trưởng lão/tàng kinh — dạy ô 19 (đủ điều kiện thì tự dạy
    // khi thăm), ô 09 + điểm ghép dải Kim Đan sau q16_linh_ngo. Chỉ
    // toast/lựa chọn, không thêm dòng thoại người nói mới.
    if (npc.id === 'truong_lao_tong' && arcIvElderExtras()) return;
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
        ? 'Một đòn Phá Âm nổ giữa sân — đợt địch bị hất văng khỏi thềm, đao kiếm rơi loảng xoảng.'
        : 'Một đòn Chấn Âm rung chuyển cả phủ — đợt địch ôm tai ngã khuỵu, đội hình tan nát.' };
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
      // Gói phụ 8: diễn đáp trả tại sân trước, rồi đợt kế mới kéo vào
      // trong lúc dòng kết quả và dòng dẫn đợt kế đang hiện.
      atkStageResolve(action, function () {
        atkSpawnWave(wave + 1);
        say([line].concat(ST['SCENE_ATK' + (wave + 1)]), function () { refreshHUD(); saveNow(); });
      });
    } else {
      atkStageResolve(action, function () {
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
    // Việc tông theo đợt (phần 3): quản sự giao lại ba việc ở chương 9 và
    // chương 11 qua cờ sectJobRound — cùng ba vật thể, cùng cách làm.
    var jobRound = state.flags.sectJobRound && state.flags.sectJobRound === L.chapterOfQuest(state);
    if (state.map === 'thanh_van_tong' && (state.quest === 'q7_tap_dich' || jobRound) && !state.flags[def.flag]) {
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
    say(ST.SCENE_TL_INTRO, function () { startTlFight(); }); // gói phụ 13: sau lời mở đầu là TRẬN THẬT 3 hiệp
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
  /* Tỉ thí Hoa Hướng Thần (chương 7) — MỤC F đợt vá 2026-11-02 (lệnh
     Bui 19:41–19:43): mẫu chọn-lệnh-rồi-kể resolveAtkWave cũ BỊ THAY
     bằng TRẬN ĐÁNH THỜI GIAN THỰC trên bản đồ riêng dai_dau_kiem.
     Hàm này chỉ còn là CỬA TƯƠNG THÍCH cho các action hht_* lạc (menu
     cũ không còn được mở ở đâu nữa): nếu trận chưa chạy mà action lạc
     tới, nó đưa người chơi vào luồng đài đúng thay vì kể kết quả. */
  function resolveDuelHht(action) {
    if (action === 'hht_retry' || action === 'hht_leave') { hhtResolvePostLose(action); return; }
    if (hhtFight) return;
    if (state && state.map === 'thanh_van_tong' && state.quest === 'q7_hoa_huong_than') enterHhtArena();
  }
  /* ================= MỤC F: TRẬN TỈ THÍ HOA HƯỚNG THẦN TRÊN ĐÀI ĐẤU KIẾM =================
     Cấu trúc: gặp Hoa ở quảng trường (SCENE_HHT_INTRO nguyên văn) ->
     chuyển tới dai_dau_kiem -> trận thời gian thực hai chiều: người
     chơi dùng kiếm quyết (phím 3 / nút kiếm, qua đúng L.castSword +
     tầng chiêu tốt nhất như trận săn) và Ngôn Linh PHÁ/CHẤN (phím 1/2,
     qua đúng L.castWord + recordSpeech như luật cũ); Hoa là ĐỐI THỦ
     RIÊNG của đài — không nằm trong mons/enc, không qua
     applyHitToMonster/normalKillDrops/grindHuntCredit nên không rơi
     yêu đan, không tu vi theo mạng, không vào tổng kết phiên săn.
     Hoa tung ba kỹ năng Thất Tinh CÓ TÊN + BÁO TRƯỚC, độ nặng tăng dần
     theo ngưỡng máu (100/66/40%). Thắng (bắt buộc theo truyện gốc):
     về quảng trường đọc SCENE_HHT_END nguyên văn + thưởng gốc (tu vi
     đầy tầng, +30 cống hiến, quest q7_done). Thua: KHÔNG phạt — khôi
     phục đúng ảnh chụp trước trận (máu/Tĩnh Mặc/tu vi/Linh Thạch/túi/
     cống hiến) và đấu lại NGAY TẠI ĐÀI (lựa chọn ít ma sát hơn quay
     lại quảng trường: người chơi đang đứng sẵn trên đài, Hoa cũng ở
     đó; về quảng trường chỉ khi thắng hoặc khi người chơi tự rời đài
     sau khi nạp lại save). Khán giả: 32 đệ tử đứng vòng quanh bệ đấu,
     chỉ là lớp trình diễn của hhtFight (không NPC, không chặn đường),
     mặt luôn hướng vào tâm đài, nhúc nhích theo nhịp thở, có lời trầm
     trồ ambient ở cao trào (qua tl-sub, KHÔNG lồng tiếng). */
  var hhtFight = null; /* {boss:{x,y,hp,hpMax,dir,walkT,flashT,atkT,phase,...}, phase, t, pre, skillsUsed, skillName, skillTelegraph, stars, cheered, result} */
  var hhtLastSkills = [];
  var HHT_HP = 720, HHT_ATK = 11, HHT_ATK_INTERVAL = 1.5, HHT_SPEED = 62;
  var HHT_SKILLS = {
    star1: { name: 'Thất Tinh Tụ', telegraph: 0.9, dmgPct: 0.10, color: '255,214,150' },
    star2: { name: 'Kiếm Vũ Tinh Hà', telegraph: 0.6, dmgPct: 0.055, color: '170,220,255' },
    star3: { name: 'Thất Tinh Quy Nhất', telegraph: 1.4, dmgPct: 0.16, color: '255,190,120' }
  };
  var HHT_ARENA = { x0: 10, y0: 7, x1: 29, y1: 22 }; // bệ đấu hoa văn (ô) — vùng đánh nhau; khán giả đứng NGOÀI vùng này
  var HHT_AUDIENCE = (function () {
    var looks = ['villager_m', 'villager_f', 'player_nam', 'player_nu'];
    var out = [], i, x, y;
    for (i = 0; i < 9; i++) { x = 11 + i * 2; out.push({ x: x, y: 5, dir: 'down', look: looks[out.length % 4] }); }
    for (i = 0; i < 9; i++) { x = 11 + i * 2; out.push({ x: x, y: 24, dir: 'up', look: looks[out.length % 4] }); }
    for (i = 0; i < 7; i++) { y = 9 + i * 2; out.push({ x: 8, y: y, dir: 'right', look: looks[out.length % 4] }); }
    for (i = 0; i < 7; i++) { y = 9 + i * 2; out.push({ x: 31, y: y, dir: 'left', look: looks[out.length % 4] }); }
    return out;
  })();
  var HHT_CHEERS = {
    star3: 'Cả đài nín thở — đó là Thất Tinh Quy Nhất, chiêu mạnh nhất của đại sư huynh!',
    low: 'Đệ tử quanh đài xôn xao: đại sư huynh… đang bị ép lui rồi!',
    win: 'Tiếng trầm trồ vỡ òa quanh đài: một đệ tử mới thắng đại đệ tử Hoa Hướng Thần!',
    lose: 'Quanh đài lặng đi một nhịp — rồi có tiếng hô: đấu lại đi, trận này chưa xong!'
  };
  function hhtSub(text, dur) { tlSub(text, dur); }
  function hhtBossCenter() { var b = hhtFight.boss; return { x: b.x + 16, y: b.y + 16 }; }
  function hhtAnnounceSkill(id) {
    var f = hhtFight; if (!f) return;
    var sk = HHT_SKILLS[id]; if (!sk) return;
    f.skillName = sk.name; f.skillTelegraph = sk.telegraph; f.skillId = id;
    if (f.skillsUsed.indexOf(sk.name) < 0) f.skillsUsed.push(sk.name);
    hhtLastSkills = f.skillsUsed.slice();
    var bc = hhtBossCenter();
    addDmgFloat(bc.x, bc.y - 62, sk.name + '!', sk.color, { size: 18, life: 1.5, targetKey: 'hhtboss' });
    if (!SET || SET.current.fxRings) rings.push({ x: bc.x, y: bc.y, r: 8, a: 0.9 });
    spawnPillar(bc.x, bc.y + 20, { dur: Math.min(1.2, sk.telegraph), h: 104 });
    if (id === 'star1') sfxHhtStar1(); else if (id === 'star2') sfxHhtStar2(); else sfxHhtStar3();
    if (id === 'star3' && !f.cheered.star3) { f.cheered.star3 = true; hhtSub(HHT_CHEERS.star3, 2.4); sfxCrowd('gasp'); }
  }
  function hhtTeleport(mapId, tx, ty, dirName, cb) {
    fadeTransition(function () {
      state.map = mapId; state.x = tx; state.y = ty; state.dir = dirName;
      L.setActiveMap(mapId);
      px = tx * TILE; py = ty * TILE; facing = dirName;
      dir8 = DIR8_ROW4[facing] || 0; stepPhase = 0; stepTimer = 0; stepAcc = 0;
      npcsLive = L.activeMap().npcs.map(function (n) { var pp = L.npcPosFor(state, n); return { id: n.id, name: n.name, look: n.look, x: pp.x, y: pp.y, dir: pp.dir }; });
      spawnMonstersForMap();
      setMinimapLabel();
      clickPath = null; clickTarget = null; pendingInteract = null; medLatch = false; resetJoy(); cancelPinch(); zoomAnchor = null; velX = 0; velY = 0;
      var dcS = desiredCam(); camX = dcS.x; camY = dcS.y;
      refreshHUD(); saveNow();
      if (cb) cb();
    });
  }
  function enterHhtArena() {
    if (hhtFight || !state) return;
    if (state.map !== 'thanh_van_tong' || state.quest !== 'q7_hoa_huong_than') return;
    var pre = {
      hp: state.hp, silence: state.silence, tuvi: state.tuvi,
      linhThach: state.linhThach, sectMerit: state.sectMerit,
      bag: JSON.parse(JSON.stringify(state.bag || {})),
      x: state.x, y: state.y
    };
    state.flags.hhtPre = pre;
    sfxHhtEnter();
    hhtTeleport('dai_dau_kiem', 19, 19, 'up', function () { startHhtFight(); });
  }
  function startHhtFight() {
    if (!state || state.map !== 'dai_dau_kiem') return;
    hhtLastSkills = [];
    hhtFight = {
      phase: 'intro', t: 0, result: null, skillsUsed: [], skillName: '', skillTelegraph: 0, skillId: '',
      stars: [], pendingHits: [], cheered: {}, sub: '',
      boss: { x: 19 * TILE, y: 10 * TILE, hp: HHT_HP, hpMax: HHT_HP, dir: 'down', walkT: 0, flashT: 0, resVibT: 0, atkT: 1.2, atkAnimT: 0, phase: 'chase', t: 0, skillId: '', used1: false, used2: false, used3: false, stars: [] }
    };
    var bc = hhtBossCenter();
    if (!SET || SET.current.fxRings) rings.push({ x: bc.x, y: bc.y, r: 6, a: 0.9 });
    spawnParts(bc.x, bc.y, 10, '190,235,200', 26, true);
    var bb = $('boss-banner');
    if (bb) { bb.classList.remove('hidden', 'compact', 'fading'); $('boss-name').textContent = 'Hoa Hướng Thần'; $('boss-title').textContent = 'Đại đệ tử Thanh Vân Tông — Tỉ thí trên Đài Đấu Kiếm'; $('boss-phase').textContent = ''; updateHhtBossBar(); clearTimeout(showBossBanner._h); showBossBanner._h = setTimeout(function () { bb.classList.add('compact'); }, 2200); }
    musicBoss(true);
    hhtSub('Đài Đấu Kiếm — Hoa Hướng Thần đã vào thế. Điểm tới là dừng, nhưng kiếm của đại đệ tử không hề nương tay.', 3.0);
    refreshHUD(); saveNow();
  }
  function updateHhtBossBar() {
    if (!hhtFight) return;
    var f = $('boss-hp-fill');
    if (f) f.style.width = Math.max(0, hhtFight.boss.hp / hhtFight.boss.hpMax * 100) + '%';
  }
  function hhtHitPlayer(pct) {
    state.hp = Math.max(0, state.hp - Math.max(1, Math.round((state.hpMax || 100) * pct)));
    playerHurtT = 0.07; hurtT = 0.33; hitStop(0.07); shakeWorld(0.3);
    sfxHurt();
    spawnParts(px + 16, py + 6, 8, '255,90,70', 40, false);
    addDmgFloat(px + 16, py - 24, '-' + Math.max(1, Math.round((state.hpMax || 100) * pct)), '255,110,100', { size: 19, targetKey: '__player' });
    refreshHUD();
    if (state.hp <= 0 && hhtFight && !hhtFight.result) hhtLose();
  }
  function hhtBossStrike() {
    var f = hhtFight; if (!f) return;
    var b = f.boss;
    b.atkAnimT = 0.35;
    sfxSword(); sfxMonsterCry('lang_vuong', false);
    var bc = hhtBossCenter(), pcx = px + 16, pcy = py + 16;
    spawnStreak((bc.x + pcx) / 2, (bc.y + pcy) / 2, Math.atan2(pcy - bc.y, pcx - bc.x), '190,235,200', false);
    var dmg = Math.max(1, Math.round(HHT_ATK * (0.85 + Math.random() * 0.3)));
    state.hp = Math.max(0, state.hp - dmg);
    playerHurtT = 0.07; hurtT = 0.33; shakeWorld(0.12); sfxHurt();
    addDmgFloat(px + 16, py - 24, '-' + dmg, '255,110,100', { size: 19, targetKey: '__player' });
    spawnParts(px + 16, py + 6, 6, '255,90,70', 36, false);
    refreshHUD();
    if (state.hp <= 0 && !f.result) hhtLose();
  }
  function applyHitToHhtBoss(power, opts) {
    var f = hhtFight; if (!f || f.result) return;
    var b = f.boss;
    // Kiếm thế hộ thân lúc tụ chiêu: khi Hoa đang BÁO CHIÊU (tele) hoặc
    // đang lao (lunge), kiếm khí quanh thân gạt bớt 65% uy lực đòn vào —
    // cửa sổ báo trước là để né/định thân, không phải để dồn dập kết
    // liễu trùm chương trước khi chiêu của hắn kịp thành hình.
    if (b.phase === 'tele' || b.phase === 'lunge') power = Math.max(1, Math.round(power * 0.35));
    b.hp = Math.max(0, b.hp - power);
    if (state) L.recordPlayValue(state, 'maxHit', power); // kỷ lục đòn mạnh nhất (đợt mở rộng bảng nhân vật): làn đấu Hoa Hướng Thần
    b.flashT = 0.18;
    if (opts && opts.kind === 'word') b.resVibT = 0.2;
    var bc = hhtBossCenter();
    addDmgFloat(bc.x, bc.y - 26, '-' + power, (opts && opts.kind === 'word') ? '255,190,120' : '190,235,200', { size: 20, targetKey: 'hhtboss' });
    if (opts && opts.kind === 'sword') presentSwordHit(bc.x, bc.y + 12, Math.atan2((py + 16) - bc.y, (px + 16) - bc.x) + Math.PI, opts.move || 'tram', !!(opts && opts.crit), opts.hitIdx || 0);
    else spawnStreak(bc.x, bc.y - 4, Math.atan2((py + 16) - bc.y, (px + 16) - bc.x) + Math.PI, (opts && opts.crit) ? '255,226,150' : '170,230,255', !!(opts && opts.crit));
    spawnParts(bc.x, bc.y, 6, '190,235,200', 34, false);
    if (fxOn() && Math.random() < 0.5) spawnPetals(bc.x - 10, bc.y - 16, 2);
    sfxHitBlade();
    updateHhtBossBar();
    if (!f.cheered.low && b.hp > 0 && b.hp <= b.hpMax * 0.3) { f.cheered.low = true; hhtSub(HHT_CHEERS.low, 2.4); sfxCrowd('gasp'); }
    if (b.hp <= 0) hhtWin();
  }
  function hhtCastSword() {
    var f = hhtFight; if (!f || f.result) return;
    var b = f.boss;
    var d = Math.hypot((b.x + 16) - (px + 16), (b.y + 16) - (py + 16));
    if (d > 1.9 * TILE) { toast('Hoa Hướng Thần còn xa — lại gần thêm để xuất kiếm.'); return; }
    var mv = bestSwordMove();
    var r = L.castSword(state, mv.id);
    if (!r.ok) { toast(r.reason); return; }
    faceMonster(b);
    sfxSword();
    var gain = L.techniqueGain(state, 'that_tinh', 2);
    if (gain.tierUps && gain.tierUps.length) presentTechTierUp('that_tinh', gain.tier);
    startSwordBody(mv.id, tNow, r.hits > 1 ? tNow + 120 : null);
    for (var i = 0; i < r.hits; i++) {
      if (i === 0) applyHitToHhtBoss(r.power, { kind: 'sword', move: mv.id, hitIdx: 0 });
      else f.pendingHits.push({ at: tNow + i * 120, power: r.power, kind: 'sword', move: mv.id, hitIdx: i });
      if (!hhtFight || f.result) return;
    }
    refreshHUD();
  }
  function hhtCastWord(skill) {
    var f = hhtFight; if (!f || f.result) return;
    var b = f.boss;
    var d = Math.hypot((b.x + 16) - (px + 16), (b.y + 16) - (py + 16));
    if (d > 3.2 * TILE) {
      var pcFar2 = { x: px + 16, y: py + 16 };
      spawnResWave(pcFar2.x, pcFar2.y, b.x + 16, b.y + 16, 0.5, resTierFor(state.silence)); // sóng chạy nửa đường rồi tan (3.4)
      toast('Quái còn xa — sóng chưa khóa tới được.');
      return;
    }
    faceMonster(b);
    var silenceBefore = state.silence;
    var r = L.castWord(state, skill);
    if (!r.ok) { toast(r.reason); return; }
    L.recordSpeech(state, 7, skill + '-ti-thi-hoa-huong-than-dai-dau-kiem', 'dai-dau-kiem');
    var bc = hhtBossCenter();
    startResBody(false);
    var wf = WORD_FLOAT[skill] || ['!', '255,255,255'];
    // Hoa Hướng Thần không có dòng MONSTER_DEFS: âm gốc lấy 340 Hz —
    // đúng cao độ gầm boss mà hhtBossStrike đã dùng cho tiếng của hắn.
    var hhtF = 340;
    if (skill === 'pha') { castResonanceFx('pha', bc.x, bc.y + 14, { silenceBefore: silenceBefore, baseFreq: hhtF, target: b }); shakeWorld(0.35); }
    else if (skill === 'chan') { castResonanceFx('chan', bc.x, bc.y + 14, { silenceBefore: silenceBefore, baseFreq: hhtF, target: b }); shakeWorld(0.35); }
    else if (skill === 'dinh') { spawnPillar(bc.x, bc.y + 30, { top: 'purple', dur: 0.85, h: 105 }); castResonanceFx('dinh', bc.x, bc.y + 14, { silenceBefore: silenceBefore, baseFreq: hhtF, target: b }); b.holdT = (b.atkInterval || HHT_ATK_INTERVAL); }
    else if (skill === 'phong') { spawnPillar(bc.x, bc.y + 30, { dur: 0.9, h: 112 }); castResonanceFx('phong', bc.x, bc.y + 14, { silenceBefore: silenceBefore, baseFreq: hhtF, target: b }); shakeWorld(0.12); b.sealT = (HHT_ATK_INTERVAL * 2); }
    addDmgFloat(bc.x, bc.y - 40, wf[0], wf[1], { size: 22, life: 0.9 });
    if (skill === 'pha' || skill === 'chan' || skill === 'phong') applyHitToHhtBoss(r.power, { kind: 'word', skill: skill });
    refreshHUD();
  }
  function hhtWin() {
    var f = hhtFight; if (!f || f.result) return;
    f.result = 'win'; f.phase = 'done'; f.t = 0;
    var bc = hhtBossCenter();
    spawnPillar(bc.x, bc.y + 28, { dur: 1.1, h: 118 });
    spawnPetals(bc.x, bc.y - 10, 6);
    sfxCrowd('win');
    hhtSub(HHT_CHEERS.win, 2.6);
  }
  function hhtFinishWin() {
    hhtFight = null; tlSub(null); hideBossBanner(); musicBoss(false);
    delete state.flags.hhtPre;
    hhtTeleport('thanh_van_tong', 62, 57, 'up', function () {
      say(ST.SCENE_HHT_END, function () {
        var cap = L.REALMS[state.realm].tuviNext;
        if (cap) state.tuvi = cap;
        var mt = L.addSectMerit(state, 30);
        state.quest = 'q7_done';
        refreshHUD(); saveNow();
        toast('Hoàn thành chương 7: Vào Thanh Vân Tông với thân phận vô linh căn. +30 điểm cống hiến tông môn (tổng: ' + L.fmtNum(mt) + ').', 4600);
      });
    });
  }
  function hhtLose() {
    var f = hhtFight; if (!f || f.result) return;
    f.result = 'lose'; f.phase = 'done'; f.t = 0;
    hideBossBanner(); musicBoss(false);
    hhtSub(HHT_CHEERS.lose, 2.4); sfxCrowd('gasp');
  }
  function hhtFinishLose() {
    var pre = state.flags.hhtPre;
    hhtFight = null; tlSub(null);
    if (pre) {
      state.hp = pre.hp; state.silence = pre.silence; state.tuvi = pre.tuvi;
      state.linhThach = pre.linhThach; state.sectMerit = pre.sectMerit;
      state.bag = JSON.parse(JSON.stringify(pre.bag || {}));
    } else {
      state.hp = Math.max(1, Math.round(state.hpMax * 0.25));
    }
    if (state.hp <= 0) state.hp = Math.max(1, Math.round(state.hpMax * 0.25));
    px = 19 * TILE; py = 19 * TILE; state.x = 19; state.y = 19; state.dir = 'up'; facing = 'up';
    dir8 = DIR8_ROW4[facing] || 0;
    refreshHUD(); saveNow();
    // Không thêm câu NÓI mới ngoài đường lồng tiếng: nhịp sau thua gộp
    // vào dòng LỰA CHỌN có lời dẫn (đúng mẫu các cảnh tỉ thí
    // SCENE_HHT1-3: dòng choice không lồng tiếng — test-voice-coverage
    // nhóm b; nhãn lựa chọn của người chơi cũng không lồng).
    say([
      { who: 'choice', text: 'Hoa Hướng Thần thu kiếm đứng chờ giữa đài, không một lời mỉa mai — tông môn không phạt kẻ thua một trận tỉ thí, chỉ chờ ngươi đứng dậy. Ngươi sẽ…', options: [
        { label: 'Đấu lại ngay trên đài', action: 'hht_retry' },
        { label: 'Về quảng trường, gặp Hoa Hướng Thần để đấu lại sau', action: 'hht_leave' }
      ] }
    ]);
  }
  function hhtResolvePostLose(action) {
    say([]); // đóng hộp thoại lựa chọn trước khi trận mới mở / rời đài (như duelSupportChoice của gói phụ 7)
    if (action === 'hht_retry') { startHhtFight(); return; }
    if (action === 'hht_leave') {
      var pre = state.flags.hhtPre;
      var rx = pre ? pre.x : 62, ry = pre ? pre.y : 57;
      hhtTeleport('thanh_van_tong', rx, ry, 'up', null);
    }
  }
  function hhtBossStep(gx, gy, speed, dt) {
    var b = hhtFight.boss;
    var cx = b.x + 16, cy = b.y + 16;
    var dx = gx - cx, dy = gy - cy, d = Math.hypot(dx, dy);
    if (d < 2) return true;
    var step = Math.min(d, speed * dt);
    var nx = b.x + dx / d * step, ny = b.y + dy / d * step;
    nx = Math.max(HHT_ARENA.x0 * TILE, Math.min(HHT_ARENA.x1 * TILE, nx));
    ny = Math.max(HHT_ARENA.y0 * TILE, Math.min(HHT_ARENA.y1 * TILE, ny));
    b.walkT += dt * (Math.abs(nx - b.x) + Math.abs(ny - b.y) > 0 ? 1 : 0);
    b.x = nx; b.y = ny;
    b.dir = Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
    return false;
  }
  function updateHhtFight(dt) {
    var f = hhtFight; if (!f || dt <= 0) return;
    var b = f.boss;
    if (b.flashT > 0) b.flashT = Math.max(0, b.flashT - dt);
    if (b.resVibT > 0) b.resVibT = Math.max(0, b.resVibT - dt);
    if (b.atkAnimT > 0) b.atkAnimT = Math.max(0, b.atkAnimT - dt);
    if (b.holdT > 0) b.holdT = Math.max(0, b.holdT - dt);
    if (b.sealT > 0) b.sealT = Math.max(0, b.sealT - dt);
    for (var i = f.pendingHits.length - 1; i >= 0; i--) {
      if (tNow >= f.pendingHits[i].at) { var ph = f.pendingHits.splice(i, 1)[0]; applyHitToHhtBoss(ph.power, { kind: ph.kind, move: ph.move, hitIdx: ph.hitIdx || 0 }); if (!hhtFight || f.result) return; }
    }
    if (f.phase === 'done') {
      f.t += dt;
      if (f.t >= 1.4) { if (f.result === 'win') hhtFinishWin(); else hhtFinishLose(); }
      return;
    }
    if (f.phase === 'intro') { f.t += dt; if (f.t >= 0.8) { f.phase = 'fight'; f.t = 0; } return; }
    // Giữ thế hồi Tĩnh Mặc như mọi trận thật (đứng yên giữa trận).
    if (!moving) state.silence = L.silenceGain('meditate', dt, state.silence, state);
    var pcx = px + 16, pcy = py + 16, bcx = b.x + 16, bcy = b.y + 16;
    var dist = Math.hypot(bcx - pcx, bcy - pcy);
    var pct = b.hp / b.hpMax;
    // Ngưỡng kỹ năng theo máu: tung MỘT LẦN mỗi chiêu, độ nặng tăng dần.
    if (b.phase === 'chase') {
      var want = null;
      if (!b.used3 && pct <= 0.40) want = 'star3';
      else if (!b.used2 && pct <= 0.66) want = 'star2';
      else if (!b.used1 && pct <= 0.85) want = 'star1';
      if (want) {
        b.phase = 'tele'; b.t = 0; b.skillId = want;
        b['used' + want.slice(4)] = true;
        hhtAnnounceSkill(want);
        if (want === 'star2') {
          b.stars = [];
          for (var wi = 0; wi < 5; wi++) b.stars.push({ at: 0.6 + wi * 0.35, tx: 0, ty: 0, locked: false, done: false });
        }
        if (want === 'star3') b.stars = [{ tx: pcx, ty: pcy }];
        return;
      }
      if (dist > 40) hhtBossStep(pcx, pcy, HHT_SPEED, dt);
      else if (!(b.holdT > 0 || b.sealT > 0)) {
        b.atkT -= dt;
        if (b.atkT <= 0) { b.atkT = HHT_ATK_INTERVAL; hhtBossStrike(); }
      }
      b.dir = pcx < bcx ? 'left' : 'right';
    } else if (b.phase === 'tele') {
      b.t += dt;
      var sk = HHT_SKILLS[b.skillId];
      if (b.skillId === 'star2') {
        for (var wj = 0; wj < b.stars.length; wj++) {
          var wv = b.stars[wj];
          if (!wv.locked && b.t >= wv.at - HHT_SKILLS.star2.telegraph) { wv.locked = true; wv.tx = pcx; wv.ty = pcy; }
          if (!wv.done && b.t >= wv.at) {
            wv.done = true;
            spawnStreak(wv.tx, wv.ty - 14, Math.PI / 2, '170,220,255', false);
            spawnParts(wv.tx, wv.ty, 3, '255,190,90', 40, false);
            if (Math.hypot(pcx - wv.tx, pcy - wv.ty) < 36) hhtHitPlayer(HHT_SKILLS.star2.dmgPct);
            if (!hhtFight || f.result) return;
          }
        }
        if (b.t >= 2.6) { b.phase = 'chase'; b.t = 0; b.atkT = Math.max(b.atkT, 0.7); }
      } else if (b.t >= sk.telegraph) {
        if (b.skillId === 'star1') {
          // BẢY ĐƯỜNG SÁNG THẤT TINH: bảy vệt kiếm quang tỏa từ Hoa vào
          // vùng quanh người chơi — đứng trong bán kính 52px của tâm
          // chùm thì lãnh đòn 10% máu tối đa.
          sfxSword(); sfxChan();
          for (var si = 0; si < 7; si++) {
            var ang = -Math.PI / 2 + (si - 3) * 0.32;
            spawnStreak(pcx + Math.cos(ang) * 26, pcy + Math.sin(ang) * 26, ang, '255,244,200', si === 3);
            spawnParts(pcx + Math.cos(ang) * 30, pcy + Math.sin(ang) * 30, 2, '255,190,90', 40, false);
          }
          spawnPetals(pcx, pcy - 24, 3);
          shakeWorld(0.3); hitStop(0.07);
          if (dist < 120) hhtHitPlayer(HHT_SKILLS.star1.dmgPct);
          if (!hhtFight || f.result) return;
        } else if (b.skillId === 'star3') {
          b.phase = 'lunge'; b.t = 0;
          var dxL = pcx - bcx, dyL = pcy - bcy, dL = Math.hypot(dxL, dyL) || 1;
          b.vx = dxL / dL * 430; b.vy = dyL / dL * 430;
          b.tx = pcx + dxL / dL * 96; b.ty = pcy + dyL / dL * 96;
          sfxWind();
          if (!SET || SET.current.fxRings) rings.push({ x: bcx, y: bcy, r: 8, a: 0.85 });
          spawnParts(bcx, bcy, 6, '255,190,90', 44, false);
          return;
        }
        b.phase = 'chase'; b.t = 0; b.atkT = Math.max(b.atkT, 0.7);
      }
    } else if (b.phase === 'lunge') {
      b.x += b.vx * dt; b.y += b.vy * dt; b.walkT += dt * 2;
      b.x = Math.max(HHT_ARENA.x0 * TILE, Math.min(HHT_ARENA.x1 * TILE, b.x));
      b.y = Math.max(HHT_ARENA.y0 * TILE, Math.min(HHT_ARENA.y1 * TILE, b.y));
      spawnParts(b.x + 16, b.y + 16, 1, '200,235,255', 8, false);
      var bc2 = hhtBossCenter();
      var dc = Math.hypot(bc2.x - pcx, bc2.y - pcy);
      var passed = (b.vx > 0 && b.x + 16 >= b.tx) || (b.vx < 0 && b.x + 16 <= b.tx) || (b.vy > 0 && b.y + 16 >= b.ty) || (b.vy < 0 && b.y + 16 <= b.ty);
      if (dc < 22) { hhtHitPlayer(HHT_SKILLS.star3.dmgPct); if (!hhtFight || f.result) return; b.phase = 'chase'; b.t = 0; b.atkT = Math.max(b.atkT, 0.8); }
      else if (passed) { b.phase = 'chase'; b.t = 0; b.atkT = Math.max(b.atkT, 0.8); }
    }
    updateHhtBossBar();
  }
  window.VSLC_HHT = {
    active: function () { return !!hhtFight; },
    phase: function () { return hhtFight ? hhtFight.phase : ''; },
    result: function () { return hhtFight ? hhtFight.result : null; },
    boss: function () { return hhtFight ? { hp: hhtFight.boss.hp, hpMax: hhtFight.boss.hpMax, x: Math.round(hhtFight.boss.x), y: Math.round(hhtFight.boss.y), phase: hhtFight.boss.phase } : null; },
    skill: function () { return hhtFight && hhtFight.skillName ? { name: hhtFight.skillName, telegraph: hhtFight.skillTelegraph, id: hhtFight.skillId } : null; },
    skillsUsed: function () { return (hhtFight ? hhtFight.skillsUsed : hhtLastSkills).slice(); },
    skillDefs: function () { var o = {}; for (var k in HHT_SKILLS) o[k] = { name: HHT_SKILLS[k].name, telegraph: HHT_SKILLS[k].telegraph, dmgPct: HHT_SKILLS[k].dmgPct }; return o; },
    audience: function () { return HHT_AUDIENCE.map(function (a) { return { x: a.x, y: a.y, dir: a.dir, look: a.look }; }); },
    audienceCount: function () { return HHT_AUDIENCE.length; },
    arena: function () { return { x0: HHT_ARENA.x0, y0: HHT_ARENA.y0, x1: HHT_ARENA.x1, y1: HHT_ARENA.y1 }; }
  };

  /* ================= ARCIV ĐỢT 1b — CHUỖI TRẬN KỊCH BẢN CHƯƠNG 13–16 =================
     Cài toàn bộ neo mục A của arciv-work/CONTRACT-wave1.md vào game.js:
     đài thách đấu ch.13 (nhân bản ống HHT), trận figure người dã ngoại
     ch.14/15, đồng hồ chiêu cho boss Trận Nhãn (ch.16) + Hộ Trận (boss
     dã ngoại) chạy trên hệ chạm trán sẵn có, và các điểm gọi helper của
     worker dữ liệu. KHÔNG thêm dòng thoại người nói mới nào ngoài các
     cảnh đã chốt trong story.js (lựa chọn/toast không qua ống lồng
     tiếng theo tiền lệ dự án). */

  function arcFaceTo(x, y) {
    var dx = x - (px + 16), dy = y - (py + 16);
    if (Math.abs(dx) >= Math.abs(dy)) facing = dx >= 0 ? 'right' : 'left';
    else facing = dy >= 0 ? 'down' : 'up';
    dir8 = L.dir8FromVector(dx, dy, dir8);
  }
  // Trừ máu người chơi cho các hệ trận TỰ CHẾ (daiFight/arcFig) — không
  // dùng hurtPlayer vì hàm đó đòi enc của hệ chạm trán. Trả true khi
  // người chơi gục để bên gọi tự xử lý thua.
  function arcHurtPlayer(dmg) {
    if (!state || dmg <= 0 || state.hp <= 0) return state ? state.hp <= 0 : false;
    var before = state.hp;
    state.hp = Math.max(0, state.hp - dmg);
    addDmgFloat(px + 16, py - 24, '-' + dmg, '255,110,100', { size: 19, targetKey: '__player' });
    if (before - state.hp >= state.hpMax * 0.05) hurtT = 0.33;
    playerHurtT = 0.07; sfxHurt(); shakeWorld(0.12); refreshHUD();
    return state.hp <= 0;
  }
  // Thưởng sự kiện cung IV qua helper của logic + thông báo gọn.
  function arcClaimToast(key) {
    var r = L.claimArcIvStoryReward(state, key);
    if (!r || !r.ok) return r;
    var parts = [];
    if (r.tuvi > 0) parts.push('+' + fmtAmt(r.tuvi) + ' tu vi');
    if (r.swordInsight > 0) parts.push('+' + r.swordInsight + ' điểm lĩnh ngộ Thất Tinh');
    if (parts.length) toast('Thưởng sự kiện: ' + parts.join(' · ') + '.', 4200);
    if (r.tierUps && r.tierUps.length) presentTechTierUp('that_tinh', r.tierUps[r.tierUps.length - 1]);
    return r;
  }
  // Mảnh bí pháp theo nguồn hạ boss (luật gần hoàn thành nhất do logic quyết).
  function arcIvBossFragmentToast(sourceId) {
    var d = L.arcIvFragmentDropFor(state, sourceId);
    if (!d) return;
    var nm = (L.TECHNIQUE_DEFS[d.setId] || {}).name || d.setId;
    toast('Mảnh bí pháp rơi ra: ' + nm + ' (' + d.count + '/' + d.needed + ')' + (d.complete ? ' — đủ mảnh! Tới tàng kinh các ở đại điện để ghép bộ.' : '.'), 4600);
    refreshHUD(); saveNow();
  }
  function arcIvBcBossFragment(realmId) {
    var src = { bc_kiemtrung: 'boss:bc_kiemtrung', bc_thuyliem: 'boss:bc_thuyliem', bc_kiemtrung_sau: 'boss:bc_kiemtrung_sau', bc_tran_tam_sau: 'boss:bc_tran_tam_sau' }[realmId];
    if (src) arcIvBossFragmentToast(src);
  }
  // Kỳ ngộ (A.3): chỉ nối bộ đếm + tập bộ; cảnh kỳ ngộ để đợt sau.
  function arcKyNgo(activity) {
    if (!state || !L.kyNgoOnAction) return;
    var r = L.kyNgoOnAction(state, Math.random(), Math.random(), activity);
    if (!r || !r.triggered) return;
    if (r.setId) {
      /* ARCIV đợt 3 (B.9): kỳ ngộ ô 23 Bôn Lôi Thiểm Kích có CẢNH riêng —
         khi thoại đang rảnh, không trong trận nào và cảnh chưa chạy lần
         nào thì HOÃN học: chạy SCENE_KY_NGO_BON_LOI, lựa chọn cuối cảnh
         (resolveKyNgoChoice) mới học bộ. Mọi trường hợp còn lại giữ
         nguyên hành vi học ngay + toast ở dưới — học không bao giờ mất. */
      if (r.setId === 'bon_loi_thiem_kich' && !state.flags.kyNgoBonLoiSceneDone && !dlg && !arcFig && !enc && !daiFight && !hhtFight && !tlFight) {
        state.flags.kyNgoBonLoiSceneDone = true;
        refreshHUD(); saveNow();
        say(ST.SCENE_KY_NGO_BON_LOI);
        return;
      }
      var lr = L.nguHanhLearn(state, r.setId);
      if (lr && lr.ok) { sfxQuest(); toast('Kỳ ngộ! Một luồng linh cơ chợt tới — ngươi lĩnh ngộ được bí pháp ' + ((L.TECHNIQUE_DEFS[r.setId] || {}).name || r.setId) + '!', 5200); }
    } else if (r.fallbackSet) {
      var fr = L.nguHanhAddFragment(state, r.fallbackSet);
      if (fr && fr.ok) toast('Kỳ ngộ! Ngươi nhặt được một mảnh tàn thiên của ' + ((L.TECHNIQUE_DEFS[r.fallbackSet] || {}).name || r.fallbackSet) + ' (' + fr.count + '/' + fr.needed + ').', 4600);
    }
    refreshHUD(); saveNow();
  }
  // Nhân chứng giữ đất q14: duong_mon không có NPC dan_c trong dữ kiện
  // bản đồ — engine tiêm vào npcsLive theo pha nhiệm vụ tại (45,38).
  function arcIvMaybeInjectWitness() {
    if (!state || state.map !== 'duong_mon') return;
    if (state.quest !== 'q14_dieu_tra' || !state.flags.q14SoDat || state.flags.q14SiteDone) return;
    if (npcsLive.some(function (n) { return n.id === 'dan_c'; })) return;
    npcsLive.push({ id: 'dan_c', name: 'Lão Giữ Đất', look: 'villager_old', x: 45, y: 38, dir: 'right' });
  }
  /* ---------- ARCIV đợt 2 (ch.17–20): tiêm NPC theo quest/cờ (B.2) ----------
     Danh sách tiêm có quản lý vòng đời riêng: NPC nào điều kiện không còn
     đúng trên bản đồ hiện tại thì bị gỡ khỏi npcsLive (khác nhân chứng
     q14 ở trên — NPC đó do dữ kiện pha của bản đồ giữ tới hết hiện trường).
     Mọi ô tiêm đã dò walkable bằng logic.js (xem REPORT-wave2-B). */
  var ARCIV2_INJECTED = ['ttl_thap', 'chap_su_thap', 'dn_thap', 'quan_phu_phu', 'gct_phu', 'gcd_phu', 'nc_chung_a', 'nc_chung_b', 'gs_cac_a', 'gs_cac_b', 'gs_cac_c'];
  function arcIv2WantedNpcs() {
    if (!state) return [];
    var q = state.quest, f = state.flags || {}, out = [];
    function add(id, name, look, map, x, y, dir) { if (state.map === map) out.push({ id: id, name: name, look: look, x: x, y: y, dir: dir || 'down' }); }
    if (q === 'q17_tin_tu_thap') add('ttl_thap', 'Trần Tư Linh', 'di_ninh', 'kiem_trac_thap', 33, 13, 'left');
    if (q === 'q17_do_lai' || q === 'q17_chat_van') add('chap_su_thap', 'Chấp Sự Tháp', 'elder', 'thap_noi', 21, 10, 'down');
    if (q === 'q17_di_ninh') add('dn_thap', 'Hứa Di Ninh', 'di_ninh', 'kiem_trac_thap', 31, 14, 'right');
    if (q === 'q18_tranh_chap' || q === 'q18_ap_luc' || q === 'q18_cho_phien' || q === 'q19_phan_xu') {
      add('quan_phu_phu', 'Quan Phủ', 'elder', 'co_chau', 51, 29, 'down');
      if (q === 'q18_tranh_chap' || q === 'q18_ap_luc') {
        add('gct_phu', 'Gia Chủ Tạ Gia', 'villager_m', 'co_chau', 49, 30, 'right');
        add('gcd_phu', 'Gia Chủ Đỗ Gia', 'elder', 'co_chau', 53, 30, 'left');
      }
    }
    if (q === 'q19_phan_ung' && !f.ch19AmbushStarted) {
      add('nc_chung_a', 'Nhân Chứng', 'villager_old', 'co_chau', 50, 60, 'down');
      add('nc_chung_b', 'Nhân Chứng', 'villager_f', 'co_chau', 52, 60, 'down');
    }
    if (f.q20WatchersSeen && !f.q20WatchersGone) {
      add('gs_cac_a', 'Người Lạ', 'villager_m', 'co_chau', 50, 72, 'up');
      add('gs_cac_b', 'Người Lạ', 'villager_f', 'co_chau', 53, 72, 'up');
      add('gs_cac_c', 'Đệ Tử Lạ Mặt', 'villager_m', 'thanh_van_tong', 63, 57, 'up');
    }
    return out;
  }
  function arcIvMaybeInjectWave2() {
    if (!state) return;
    var want = arcIv2WantedNpcs();
    var wantIds = want.map(function (w) { return w.id; });
    for (var i = npcsLive.length - 1; i >= 0; i--) {
      if (ARCIV2_INJECTED.indexOf(npcsLive[i].id) >= 0 && wantIds.indexOf(npcsLive[i].id) < 0) npcsLive.splice(i, 1);
    }
    want.forEach(function (w) {
      if (!npcsLive.some(function (n) { return n.id === w.id; })) npcsLive.push(w);
    });
  }
  /* ---------- ARCIV đợt 3 (ch.21–24): tiêm NPC theo quest (B.2) ----------
     Cùng khuôn quản lý vòng đời của đợt 2. Mọi ô tiêm đã tự dò walkable
     bằng logic.js (xem REPORT-wave3-B): un_cho (76,34) đúng ô neo hợp
     đồng (hint người chơi là ô kề (76,35)); td_cho (77,34) kề đông của
     un_cho; un_phu (16,36) sân phủ; dth_cong (61,87) điểm rơi cổng tông;
     dth_tran (45,43); mcu_tran (43,45) — cả hai ô quanh đoạn hai vách
     đều đi được (ô (44,44) ở giữa bị footprint gốc thông chiếm nên
     KHÔNG dùng làm ô đứng). */
  var ARCIV3_INJECTED = ['un_cho', 'td_cho', 'un_phu', 'dth_cong', 'dth_tran', 'mcu_tran'];
  function arcIv3WantedNpcs() {
    if (!state) return [];
    var q = state.quest, out = [];
    function add(id, name, look, map, x, y, dir) { if (state.map === map) out.push({ id: id, name: name, look: look, x: x, y: y, dir: dir || 'down' }); }
    if (q === 'q21_doan_thuong') {
      add('un_cho', 'Hứa U Nhàn', 'u_nhan', 'co_chau', 76, 34, 'left');
      add('td_cho', 'Trưởng Đoàn Thương', 'villager_old', 'co_chau', 77, 34, 'left');
    }
    if (q === 'q21_so_sach' || q === 'q24_len_duong') add('un_phu', 'Hứa U Nhàn', 'u_nhan', 'co_chau', 16, 36, 'up');
    if (q === 'q22_nhan_viec') add('dth_cong', 'Đệ Tử Hộ Tống', 'villager_m', 'thanh_van_tong', 61, 87, 'down');
    if (q === 'q24_lenh_cuu_nguoi') add('dth_tran', 'Đệ Tử Hộ Tống', 'villager_m', 'duong_mon', 45, 43, 'left');
    if (q === 'q24_tha_mang' || q === 'q24_manh_moi') add('mcu_tran', 'Mạc Cửu U', 'mac_cuu_u', 'duong_mon', 43, 45, 'right');
    return out;
  }
  function arcIvMaybeInjectWave3() {
    if (!state) return;
    var want = arcIv3WantedNpcs();
    var wantIds = want.map(function (w) { return w.id; });
    for (var i = npcsLive.length - 1; i >= 0; i--) {
      if (ARCIV3_INJECTED.indexOf(npcsLive[i].id) >= 0 && wantIds.indexOf(npcsLive[i].id) < 0) npcsLive.splice(i, 1);
    }
    want.forEach(function (w) {
      if (!npcsLive.some(function (n) { return n.id === w.id; })) npcsLive.push(w);
    });
    // GỘP CUNG IV (2026-11-04): khi bản tiêm U Nhàn (un_cho / un_phu)
    // đang hoạt động trên co_chau thì ẩn hình U Nhàn TĨNH (16,35) của
    // bản đồ — bản tĩnh không có pha ẩn nên sẽ đứng kề bản tiêm thành
    // hai hình giống hệt nhau (un_phu neo (16,36) ngay dưới ô tĩnh).
    // Bản tiêm rút thì khôi phục hình tĩnh từ dữ kiện bản đồ. Chỉ áp
    // cho co_chau: hình tĩnh U Nhàn ở các bản đồ khác là lần xuất hiện
    // riêng theo truyện, không trùng bản tiêm nào.
    if (state.map === 'co_chau') {
      var injectedUNhan = wantIds.indexOf('un_cho') >= 0 || wantIds.indexOf('un_phu') >= 0;
      var si = -1;
      for (var k = 0; k < npcsLive.length; k++) if (npcsLive[k].id === 'u_nhan') { si = k; break; }
      if (injectedUNhan && si >= 0) npcsLive.splice(si, 1);
      if (!injectedUNhan && si < 0) {
        var udef = (L.activeMap().npcs || []).filter(function (n) { return n.id === 'u_nhan'; })[0];
        if (udef) { var upp = L.npcPosFor(state, udef); npcsLive.push({ id: udef.id, name: udef.name, look: udef.look, x: upp.x, y: upp.y, dir: upp.dir }); }
      }
    }
  }
  /* Câu đáp duy nhất của các NPC tiêm chỉ-đứng-nhìn (nhân chứng phố nam +
     người theo dõi Thiên Cơ Các): một câu lảng tránh, hiện qua toast —
     thoại mới chỉ qua cảnh story.js, ngoại lệ duy nhất là toast (đầu hợp
     đồng đợt 2), nên các câu này KHÔNG mở say() nội tuyến mới. */
  function arcIvNpcLine(id) {
    if (id === 'nc_chung_a' || id === 'nc_chung_b') return 'Nhân chứng phố nam chỉ lắc đầu: "Chuyện ở phủ, quan phủ đã ghi cả rồi… chúng tôi chỉ mong về nhà cho yên."';
    if (id === 'gs_cac_a' || id === 'gs_cac_b') return 'Người lạ lảng ánh mắt đi nơi khác, bước chân rảo nhanh hơn — rõ ràng không muốn bị hỏi chuyện.';
    if (id === 'gs_cac_c') return 'Người đệ tử lạ mặt quay lưng đi thẳng, thẻ bài bên hông khuất vào tay áo — không để lại một lời.';
    if (id === 'td_cho') return 'Trưởng đoàn thương nắm chặt tay áo, mắt không rời kiện hàng: "Hàng còn nguyên kiện nào, lão giữ nguyên kiện ấy — chỉ chờ cô nương Hứa phân xử cho đoàn một đường sống."';
    return null;
  }

  /* ---------- Đài thách đấu (chương 13 + thang lặp) ---------- */
  var daiFight = null, daiLastStage = 'nm1';
  var DAI_SKILLS = {
    star1: { name: 'Thất Tinh Tụ', telegraph: 0.6, dmgPct: 0.08, color: '255,214,150' },
    rain: { name: 'Kiếm Vũ', telegraph: 0.6, dmgPct: 0.05, color: '170,220,255' }
  };
  var DAI_FIGHTERS = {
    nm1: { name: 'Đệ tử nội môn — trận một', title: 'Đài Thách Đấu · trận nội môn thứ nhất', look: 'villager_m', hp: 380, atk: 9, interval: 1.5, speed: 60, skills: false },
    nm2: { name: 'Đệ tử nội môn — trận hai', title: 'Đài Thách Đấu · trận nội môn thứ hai', look: 'villager_f', hp: 460, atk: 10, interval: 1.5, speed: 62, skills: false },
    tinh_anh_story: { name: 'Tinh anh nội môn', title: 'Đài Thách Đấu · trận tinh anh (chương 13)', look: 'player_nam', hp: 900, atk: 13, interval: 1.4, speed: 64, skills: true },
    noi_mon: { name: 'Đệ tử nội môn', title: 'Đài Thách Đấu · bậc nội môn (thách đấu lặp)', look: 'villager_m', hp: 520, atk: 11, interval: 1.5, speed: 62, skills: false },
    tinh_anh: { name: 'Tinh anh nội môn', title: 'Đài Thách Đấu · bậc tinh anh (thách đấu lặp)', look: 'player_nam', hp: 980, atk: 14, interval: 1.4, speed: 64, skills: true },
    /* Đợt 2 B.8: hạng quán quân — [ĐỀ XUẤT SỐ] hp 1250 / atk 16 / speed 54. */
    vo_dich: { name: 'Vô Địch Đỗ Gia', title: 'Đài Thách Đấu · hạng quán quân (thách đấu lặp)', look: 'luc_tranh', hp: 1250, atk: 16, interval: 1.4, speed: 54, skills: true }
  };
  function daiCenter() { var b = daiFight.boss; return { x: b.x + 16, y: b.y + 16 }; }
  function daiSnapshot() {
    return { hp: state.hp, silence: state.silence, tuvi: state.tuvi, linhThach: state.linhThach, sectMerit: state.sectMerit,
             bag: JSON.parse(JSON.stringify(state.bag || {})), x: state.x, y: state.y };
  }
  function arcEnterDaiStory() {
    if (daiFight || !state) return;
    state.flags.daiPre = daiSnapshot();
    hhtTeleport('dai_dau_kiem', 19, 19, 'up', function () {
      say(ST.SCENE_CH13_DAI_THACH, function () { startDaiFight('nm1'); });
    });
  }
  function arcEnterDaiRepeat(rankId) {
    if (daiFight || !state) return;
    state.flags.daiPre = daiSnapshot();
    hhtTeleport('dai_dau_kiem', 19, 19, 'up', function () { startDaiFight(rankId); });
  }
  function startDaiFight(stage) {
    if (!state || state.map !== 'dai_dau_kiem') return;
    var def = DAI_FIGHTERS[stage]; if (!def) return;
    daiLastStage = stage;
    daiFight = { mode: (stage === 'noi_mon' || stage === 'tinh_anh' || stage === 'vo_dich') ? 'repeat' : 'story', stage: stage,
      phase: 'intro', t: 0, result: null, pendingHits: [],
      boss: { x: 19 * TILE, y: 10 * TILE, hp: def.hp, hpMax: def.hp, atk: def.atk, atkInterval: def.interval, speed: def.speed,
              look: def.look, name: def.name, title: def.title, skills: def.skills,
              dir: 'down', walkT: 0, flashT: 0, resVibT: 0, atkT: 1.2, atkAnimT: 0, holdT: 0, sealT: 0,
              phase: 'chase', t: 0, skillId: '', used1: false, used2: false, stars: [] } };
    var bc = daiCenter();
    if (!SET || SET.current.fxRings) rings.push({ x: bc.x, y: bc.y, r: 6, a: 0.9 });
    spawnParts(bc.x, bc.y, 10, '190,235,200', 26, true);
    var bb = $('boss-banner');
    if (bb) { bb.classList.remove('hidden', 'compact', 'fading'); $('boss-name').textContent = def.name; $('boss-title').textContent = def.title; $('boss-phase').textContent = ''; updateDaiBossBar(); clearTimeout(showBossBanner._h); showBossBanner._h = setTimeout(function () { bb.classList.add('compact'); }, 2200); }
    musicBoss(true);
    tlSub(def.name + ' đã vào thế trên Đài Đấu Kiếm.', 2.6);
    refreshHUD(); saveNow();
  }
  function updateDaiBossBar() {
    if (!daiFight) return;
    var f = $('boss-hp-fill');
    if (f) f.style.width = Math.max(0, daiFight.boss.hp / daiFight.boss.hpMax * 100) + '%';
  }
  function daiAnnounceSkill(id) {
    var f = daiFight; if (!f) return;
    var sk = DAI_SKILLS[id]; if (!sk) return;
    var bc = daiCenter();
    addDmgFloat(bc.x, bc.y - 62, sk.name + '!', sk.color, { size: 18, life: 1.5, targetKey: 'daiboss' });
    if (!SET || SET.current.fxRings) rings.push({ x: bc.x, y: bc.y, r: 8, a: 0.9 });
    spawnPillar(bc.x, bc.y + 20, { dur: Math.min(1.2, sk.telegraph), h: 104 });
    if (id === 'star1') sfxHhtStar1(); else sfxHhtStar2();
  }
  function daiHitPlayer(pct) {
    var dmg = Math.max(1, Math.round((state.hpMax || 100) * pct));
    state.hp = Math.max(0, state.hp - dmg);
    playerHurtT = 0.07; hurtT = 0.33; hitStop(0.07); shakeWorld(0.3); sfxHurt();
    spawnParts(px + 16, py + 6, 8, '255,90,70', 40, false);
    addDmgFloat(px + 16, py - 24, '-' + dmg, '255,110,100', { size: 19, targetKey: '__player' });
    refreshHUD();
    if (state.hp <= 0 && daiFight && !daiFight.result) daiLose();
  }
  function daiBossStrike() {
    var f = daiFight; if (!f) return;
    var b = f.boss;
    b.atkAnimT = 0.35;
    sfxSword();
    var bc = daiCenter(), pcx = px + 16, pcy = py + 16;
    spawnStreak((bc.x + pcx) / 2, (bc.y + pcy) / 2, Math.atan2(pcy - bc.y, pcx - bc.x), '190,235,200', false);
    if (arcHurtPlayer(Math.max(1, Math.round(b.atk * (0.85 + Math.random() * 0.3)))) && daiFight && !f.result) daiLose();
  }
  function applyHitToDaiBoss(power, opts) {
    var f = daiFight; if (!f || f.result) return;
    var b = f.boss;
    if (b.phase === 'tele') power = Math.max(1, Math.round(power * 0.35)); // đang báo chiêu: kiếm thế hộ thân gạt bớt (như HHT)
    b.hp = Math.max(0, b.hp - power);
    if (state) L.recordPlayValue(state, 'maxHit', power); // kỷ lục đòn mạnh nhất (đợt mở rộng bảng nhân vật): làn đài thách đấu
    b.flashT = 0.18;
    if (opts && opts.kind === 'word') b.resVibT = 0.2;
    var bc = daiCenter();
    addDmgFloat(bc.x, bc.y - 26, '-' + power, (opts && opts.kind === 'word') ? '255,190,120' : '190,235,200', { size: 20, targetKey: 'daiboss' });
    if (opts && opts.kind === 'sword') presentSwordHit(bc.x, bc.y + 12, Math.atan2((py + 16) - bc.y, (px + 16) - bc.x) + Math.PI, opts.move || 'tram', !!(opts && opts.crit), opts.hitIdx || 0);
    else spawnStreak(bc.x, bc.y - 4, Math.atan2((py + 16) - bc.y, (px + 16) - bc.x) + Math.PI, (opts && opts.crit) ? '255,226,150' : '170,230,255', !!(opts && opts.crit));
    spawnParts(bc.x, bc.y, 6, '190,235,200', 34, false);
    sfxHitBlade();
    updateDaiBossBar();
    if (b.hp <= 0) daiWin();
  }
  function daiCastSword() {
    var f = daiFight; if (!f || f.result) return;
    var b = f.boss;
    var d = Math.hypot((b.x + 16) - (px + 16), (b.y + 16) - (py + 16));
    if (d > 1.9 * TILE) { toast('Đối thủ còn xa — lại gần thêm để xuất kiếm.'); return; }
    var mv = bestSwordMove();
    var r = L.castSword(state, mv.id);
    if (!r.ok) { toast(r.reason); return; }
    arcFaceTo(b.x + 16, b.y + 16);
    sfxSword();
    var gain = L.techniqueGain(state, 'that_tinh', 2);
    if (gain.tierUps && gain.tierUps.length) presentTechTierUp('that_tinh', gain.tier);
    startSwordBody(mv.id, tNow, r.hits > 1 ? tNow + 120 : null);
    for (var i = 0; i < r.hits; i++) {
      if (i === 0) applyHitToDaiBoss(r.power, { kind: 'sword', move: mv.id, hitIdx: 0 });
      else f.pendingHits.push({ at: tNow + i * 120, power: r.power, kind: 'sword', move: mv.id, hitIdx: i });
      if (!daiFight || f.result) return;
    }
    refreshHUD();
  }
  function daiCastWord(skill) {
    var f = daiFight; if (!f || f.result) return;
    var b = f.boss;
    var d = Math.hypot((b.x + 16) - (px + 16), (b.y + 16) - (py + 16));
    if (d > 3.2 * TILE) { toast('Đối thủ còn xa — sóng chưa khóa tới được.'); return; }
    arcFaceTo(b.x + 16, b.y + 16);
    var silenceBefore = state.silence;
    var r = L.castWord(state, skill);
    if (!r.ok) { toast(r.reason); return; }
    L.recordSpeech(state, L.chapterOfQuest(state), skill + '-dai-thach-dau', 'dai-dau-kiem');
    var bc = daiCenter();
    startResBody(false);
    var wf = WORD_FLOAT[skill] || ['!', '255,255,255'];
    if (skill === 'pha') { castResonanceFx('pha', bc.x, bc.y + 14, { silenceBefore: silenceBefore, baseFreq: 340, target: b }); shakeWorld(0.35); }
    else if (skill === 'chan') { castResonanceFx('chan', bc.x, bc.y + 14, { silenceBefore: silenceBefore, baseFreq: 340, target: b }); shakeWorld(0.35); }
    else if (skill === 'dinh') { spawnPillar(bc.x, bc.y + 30, { top: 'purple', dur: 0.85, h: 105 }); castResonanceFx('dinh', bc.x, bc.y + 14, { silenceBefore: silenceBefore, baseFreq: 340, target: b }); b.holdT = b.atkInterval; }
    else if (skill === 'phong') { spawnPillar(bc.x, bc.y + 30, { dur: 0.9, h: 112 }); castResonanceFx('phong', bc.x, bc.y + 14, { silenceBefore: silenceBefore, baseFreq: 340, target: b }); shakeWorld(0.12); b.sealT = b.atkInterval * 2; }
    addDmgFloat(bc.x, bc.y - 40, wf[0], wf[1], { size: 22, life: 0.9 });
    if (skill === 'pha' || skill === 'chan' || skill === 'phong') applyHitToDaiBoss(r.power, { kind: 'word', skill: skill });
    refreshHUD();
  }
  function daiWin() {
    var f = daiFight; if (!f || f.result) return;
    f.result = 'win'; f.phase = 'done'; f.t = 0;
    var bc = daiCenter();
    spawnPillar(bc.x, bc.y + 28, { dur: 1.1, h: 118 });
    spawnPetals(bc.x, bc.y - 10, 6);
    sfxCrowd('win');
  }
  function daiLose() {
    var f = daiFight; if (!f || f.result) return;
    f.result = 'lose'; f.phase = 'done'; f.t = 0;
    hideBossBanner(); musicBoss(false);
    sfxCrowd('gasp');
  }
  function daiFinishWin() {
    var f = daiFight; if (!f) return;
    var stage = f.stage, bc = daiCenter();
    if (f.mode === 'story' && stage === 'nm1') { startDaiFight('nm2'); return; }
    if (f.mode === 'story' && stage === 'nm2') {
      f.phase = 'between'; f.result = null;
      say(ST.SCENE_CH13_DAI_THACH_2, function () { startDaiFight('tinh_anh_story'); });
      return;
    }
    daiFight = null; tlSub(null); hideBossBanner(); musicBoss(false);
    delete state.flags.daiPre;
    if (f.mode === 'story') {
      // Đòn kết liễu Phá Quân là TRÌNH DIỄN khép trận (không phải điều
      // kiện thắng — trận đã thắng bằng đường kiếm thường cũng tới đây).
      presentSwordHit(bc.x, bc.y + 12, -Math.PI / 2, 'pha_quan', false, 0);
      spawnPillar(bc.x, bc.y + 28, { dur: 1.2, h: 124 });
      hhtTeleport('thanh_van_tong', 62, 57, 'up', function () {
        say(ST.SCENE_CH13_TINH_ANH_END, function () {
          state.quest = 'q13_thinh_cau_dau'; refreshHUD(); saveNow();
          toast('Có thư thỉnh cầu đang chờ ở cổng tông phía nam. Thang thách đấu lặp đã mở — gặp Hoa Hướng Thần ở quảng trường để thách đấu lại.', 4600);
        });
      });
      return;
    }
    var r = L.daiThachDauRecordWin(state, stage);
    hhtTeleport('thanh_van_tong', 62, 57, 'up', function () {
      if (r && r.ok) {
        var msg = 'Thắng bậc ' + (stage === 'tinh_anh' ? 'tinh anh' : stage === 'vo_dich' ? 'quán quân' : 'nội môn') + ' tại Đài Thách Đấu (lần thắng thứ ' + r.wins + ').';
        if (r.fragment) msg += ' Nhận 1 mảnh bí pháp ' + (stage === 'vo_dich' ? 'ô 07' : 'ô 03') + ' (' + r.fragment.count + '/' + r.fragment.needed + ').';
        // LƯU Ý hợp đồng B.6: daiThachDauRecordWin ĐÃ tự cộng mảnh ô 03
        // qua nguHanhAddFragment cho bậc tinh anh — engine KHÔNG gọi
        // thêm arcIvFragmentDropFor('dai_thach_dau:tinh_anh') ở đây để
        // tránh cộng trùng hai mảnh cho một lần thắng.
        toast(msg, 4600);
      } else toast('Trận thắng chưa được ghi sổ đài: ' + ((r && r.reason) || 'lỗi không rõ') + '.', 4200);
      refreshHUD(); saveNow();
    });
  }
  function daiFinishLose() {
    var pre = state.flags.daiPre;
    daiFight = null; tlSub(null);
    if (pre) {
      state.hp = pre.hp; state.silence = pre.silence; state.tuvi = pre.tuvi;
      state.linhThach = pre.linhThach; state.sectMerit = pre.sectMerit;
      state.bag = JSON.parse(JSON.stringify(pre.bag || {}));
    } else state.hp = Math.max(1, Math.round(state.hpMax * 0.25));
    if (state.hp <= 0) state.hp = Math.max(1, Math.round(state.hpMax * 0.25));
    px = 19 * TILE; py = 19 * TILE; state.x = 19; state.y = 19; state.dir = 'up'; facing = 'up';
    dir8 = DIR8_ROW4[facing] || 0;
    refreshHUD(); saveNow();
    // Chỉ dòng LỰA CHỌN (không lồng tiếng — tiền lệ hhtFinishLose).
    say([{ who: 'choice', text: 'Đối thủ thu kiếm đứng chờ giữa đài. Tông môn không phạt kẻ thua một trận thách đấu — chỉ chờ ngươi đứng dậy. Ngươi sẽ…', options: [
      { label: 'Đấu lại ngay trên đài', action: 'arc_dai_retry' },
      { label: 'Về quảng trường tông, thách đấu lại sau', action: 'arc_dai_leave' }
    ] }]);
  }
  function daiBossStep(gx, gy, speed, dt) {
    var b = daiFight.boss;
    var cx = b.x + 16, cy = b.y + 16;
    var dx = gx - cx, dy = gy - cy, d = Math.hypot(dx, dy);
    if (d < 2) return true;
    var step = Math.min(d, speed * dt);
    var nx = b.x + dx / d * step, ny = b.y + dy / d * step;
    nx = Math.max(HHT_ARENA.x0 * TILE, Math.min(HHT_ARENA.x1 * TILE, nx));
    ny = Math.max(HHT_ARENA.y0 * TILE, Math.min(HHT_ARENA.y1 * TILE, ny));
    b.walkT += dt * (Math.abs(nx - b.x) + Math.abs(ny - b.y) > 0 ? 1 : 0);
    b.x = nx; b.y = ny;
    b.dir = Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
    return false;
  }
  function updateDaiFight(dt) {
    var f = daiFight; if (!f || dt <= 0) return;
    var b = f.boss;
    if (b.flashT > 0) b.flashT = Math.max(0, b.flashT - dt);
    if (b.resVibT > 0) b.resVibT = Math.max(0, b.resVibT - dt);
    if (b.atkAnimT > 0) b.atkAnimT = Math.max(0, b.atkAnimT - dt);
    if (b.holdT > 0) b.holdT = Math.max(0, b.holdT - dt);
    if (b.sealT > 0) b.sealT = Math.max(0, b.sealT - dt);
    for (var i = f.pendingHits.length - 1; i >= 0; i--) {
      if (tNow >= f.pendingHits[i].at) { var ph = f.pendingHits.splice(i, 1)[0]; applyHitToDaiBoss(ph.power, { kind: ph.kind, move: ph.move, hitIdx: ph.hitIdx || 0 }); if (!daiFight || f.result) return; }
    }
    if (f.phase === 'done') { f.t += dt; if (f.t >= 1.4) { if (f.result === 'win') daiFinishWin(); else daiFinishLose(); } return; }
    if (f.phase === 'between') return;
    if (f.phase === 'intro') { f.t += dt; if (f.t >= 0.8) { f.phase = 'fight'; f.t = 0; } return; }
    if (!moving) state.silence = L.silenceGain('meditate', dt, state.silence, state);
    var pcx = px + 16, pcy = py + 16, bcx = b.x + 16, bcy = b.y + 16;
    var dist = Math.hypot(bcx - pcx, bcy - pcy);
    var pct = b.hp / b.hpMax;
    if (b.phase === 'chase') {
      var want = null;
      if (b.skills && !b.used2 && pct <= 0.6) want = 'rain';
      else if (b.skills && !b.used1 && pct <= 0.85) want = 'star1';
      if (want) {
        b.phase = 'tele'; b.t = 0; b.skillId = want;
        if (want === 'star1') b.used1 = true; else b.used2 = true;
        daiAnnounceSkill(want);
        if (want === 'rain') { b.stars = []; for (var wi = 0; wi < 3; wi++) b.stars.push({ at: 0.6 + wi * 0.35, tx: 0, ty: 0, locked: false, done: false }); }
        return;
      }
      if (dist > 40) daiBossStep(pcx, pcy, b.speed, dt);
      else if (!(b.holdT > 0 || b.sealT > 0)) {
        b.atkT -= dt;
        if (b.atkT <= 0) { b.atkT = b.atkInterval; daiBossStrike(); if (!daiFight || f.result) return; }
      }
      b.dir = pcx < bcx ? 'left' : 'right';
    } else if (b.phase === 'tele') {
      b.t += dt;
      var sk = DAI_SKILLS[b.skillId];
      if (b.skillId === 'rain') {
        for (var wj = 0; wj < b.stars.length; wj++) {
          var wv = b.stars[wj];
          if (!wv.locked && b.t >= wv.at - sk.telegraph) { wv.locked = true; wv.tx = pcx; wv.ty = pcy; }
          if (!wv.done && b.t >= wv.at) {
            wv.done = true;
            spawnStreak(wv.tx, wv.ty - 14, Math.PI / 2, '170,220,255', false);
            spawnParts(wv.tx, wv.ty, 3, '255,190,90', 40, false);
            if (Math.hypot(pcx - wv.tx, pcy - wv.ty) < 36) { daiHitPlayer(sk.dmgPct); if (!daiFight || f.result) return; }
          }
        }
        if (b.t >= 1.9) { b.phase = 'chase'; b.t = 0; b.atkT = Math.max(b.atkT, 0.7); }
      } else if (b.t >= sk.telegraph) {
        // Thất Tinh Tụ của tinh anh: quạt 7 tia quanh người chơi, báo
        // trước NGẮN 0,6s (MONSTER_DEFS khai telegraphSec 0.6).
        sfxSword(); sfxChan();
        for (var si = 0; si < 7; si++) {
          var ang = -Math.PI / 2 + (si - 3) * 0.32;
          spawnStreak(pcx + Math.cos(ang) * 26, pcy + Math.sin(ang) * 26, ang, '255,244,200', si === 3);
          spawnParts(pcx + Math.cos(ang) * 30, pcy + Math.sin(ang) * 30, 2, '255,190,90', 40, false);
        }
        shakeWorld(0.3); hitStop(0.07);
        if (dist < 120) { daiHitPlayer(sk.dmgPct); if (!daiFight || f.result) return; }
        b.phase = 'chase'; b.t = 0; b.atkT = Math.max(b.atkT, 0.7);
      }
    }
    updateDaiBossBar();
  }

  /* ---------- Trận figure người dã ngoại (chương 14 + 15) ----------
     Đối thủ là NGƯỜI (côn đồ thuê, tay chân Huyết Bạc Cung, chỉ huy)
     nên không có loài trong MONSTER_DEFS đã chốt — figure vẽ bằng
     sheet nhân vật như hhtboss, đánh thời gian thực tại chỗ trên bản
     đồ dã ngoại. Mắt trận đi qua hệ arcEyes sẵn có; mắt của các trận
     này mang thêm trường hp (chỉ figure-trận dùng) để KIẾM phá được. */
  var arcFig = null;
  function arcFigMake(spec) {
    return { x: spec.tx * TILE, y: spec.ty * TILE, look: spec.look, name: spec.name, title: spec.title || '',
      hp: spec.hp, hpMax: spec.hp, atk: spec.atk, interval: spec.interval || 1.5, speed: spec.speed || 55,
      atkT: 1.0, holdT: 0, sealT: 0, flashT: 0, resVibT: 0, atkAnimT: 0, dir: 'down', walkT: 0,
      dead: false, fled: false, fleeing: false, fleeT: 0,
      noKill: !!spec.noKill, fleeAt: spec.fleeAt || 0.3,
      /* Đợt 2: champ (quán quân ch.18) / jam (đầu lĩnh nhiễu ch.19) /
         soulChaos (hồn loạn ch.20) / monsterLook (vẽ theo ống quái). */
      champ: !!spec.champ, jam: !!spec.jam, soulChaos: !!spec.soulChaos, monsterLook: spec.monsterLook || null,
      /* Đợt 3: listener (tên nghe tiếng ch.22 — né đòn kiếm ĐẦU TIÊN). */
      listener: !!spec.listener, listenerHeard: false,
      species: spec.monsterLook || null,
      homeX: spec.tx * TILE, homeY: spec.ty * TILE,
      shieldT: 0, shieldCd: 4, shieldFloatT: 0, zoneT: 3, sweep: null, waveT: 3 };
  }
  function arcFigStart(cfg) {
    arcFig = { id: cfg.id, waves: cfg.waves, wave: -1, figs: [], phase: 'fight', usedDinh: 0, usedPhong: 0,
               eyeBoost: cfg.eyeBoost || 0, eyesAtWave: cfg.eyesAtWave || {}, requireEyesDown: !!cfg.requireEyesDown,
               onWin: cfg.onWin, onLose: cfg.onLose || null, pendingHits: [],
               /* Đợt 2: vùng báo trước (trấn địa / sóng lệch), hộ tống +
                  xe văn thư (ch.19), hồn loạn (ch.20). */
               zones: [], jamFloatT: 0,
               escorts: (cfg.escorts || []).map(function (e) {
                 return { x: e.tx * TILE, y: e.ty * TILE, look: e.look, name: e.name, title: '', species: null,
                   hp: e.hp, hpMax: e.hp, injured: false, dir: 'down', walkT: 0, flashT: 0, resVibT: 0, holdT: 0, sealT: 0, atkAnimT: 0, dead: false,
                   anchorX: 51 * TILE, anchorY: 62 * TILE, safeX: 51 * TILE, safeY: 74 * TILE, seed: Math.random() * 6.3 };
               }),
               cartCfg: cfg.cart || null, cart: null, cartSpawned: false,
               soulChaos: cfg.soulChaos || null, soulHolds: 0,
               /* Đợt 3: xe hàng tổng quát (cfg.carts — điểm giữ xe đọc từ
                  cfg này; xe văn thư đợt 2 đi qua cfg.cart cũ, hành vi
                  giữ nguyên), mắt chịu Định Âm đóng băng (eyeDinhFreeze),
                  vùng sóng kiếm điều trận theo nhịp (cmdZones), điểm giữ
                  cứu người (rescueHold). Xe 'tilting' khai tilt:true thì
                  bắt đầu đếm 6 giây ngay khi trận mở. */
               eyeDinhFreeze: !!cfg.eyeDinhFreeze,
               cmdZones: cfg.cmdZones || null, cmdZoneT: cfg.cmdZones ? (cfg.cmdZones.every || 7) : 0,
               rescueHold: cfg.rescueHold || null, rescueHolds: 0,
               carts: (cfg.carts || []).map(function (c) {
                 return { x: c.tx * TILE + 16, y: c.ty * TILE + 16, hp: c.hp, hpMax: c.hp, state: c.tilt ? 'tilting' : 'intact', t: c.tilt ? 6 : 0, flashT: 0, targetable: c.targetable !== false };
               }) };
    arcFig.carts.forEach(function (ct) { if (ct.state === 'tilting') addFloat(ct.x, ct.y - 44, 'XE HÀNG ĐANG TRƯỢT!', '255,190,120'); });
    arcFigNextWave();
  }
  function arcFigNextWave() {
    var f = arcFig; if (!f) return;
    f.wave++;
    if (f.wave >= f.waves.length) {
      if (f.requireEyesDown && arcEyesStanding() > 0) { f.phase = 'eyes'; f.figs = []; return; }
      /* Đợt 3 ch.24 đường phát hưởng: hết đợt + mắt xuống mà điểm giữ
         cứu người chưa đủ số lần Định Âm -> pha 'holds' khép trận (không
         còn địch, người chơi Định Âm tại điểm giữ cho đủ). */
      if (f.rescueHold && f.rescueHolds < f.rescueHold.need) { f.phase = 'holds'; f.figs = []; addFloat(px + 16, py - 34, 'GIỮ ĐIỂM CỨU NGƯỜI CHO ĐỦ!', '170,220,255'); return; }
      arcFigWin(); return;
    }
    f.figs = f.waves[f.wave].map(arcFigMake);
    // Đợt 2 ch.19: xe văn thư xuất hiện ở đầu đợt 2, đồng hồ nghiêng 6 giây.
    if (f.cartCfg && f.wave === 1 && !f.cartSpawned) {
      f.cartSpawned = true;
      f.cart = { x: 51 * TILE + 16, y: 64 * TILE + 16, state: 'tilting', t: 6 };
      addFloat(f.cart.x, f.cart.y - 44, 'XE VĂN THƯ ĐANG NGHIÊNG!', '255,190,120');
    }
    var eyes = f.eyesAtWave[f.wave];
    if (eyes) eyes.forEach(function (e) { var eye = arcAddEye(e.tx * TILE + 16, e.ty * TILE + 16, { mobile: !!e.mobile, label: 'Mắt trận' }); eye.hp = 260; });
    if (f.wave > 0) addFloat(px + 16, py - 30, 'ĐỢT ' + (f.wave + 1) + '!', '255,190,120');
    f.phase = 'fight';
  }
  function arcFigWin() {
    var f = arcFig; if (!f) return;
    var cb = f.onWin;
    arcFig = null; arcEyes.length = 0;
    if (cb) cb(f); // đợt 2: onWin đọc được escorts/cart của trận vừa khép (biến thể kết A/B)
  }
  function arcFigLose() {
    var fLose = arcFig;
    arcFig = null; arcEyes.length = 0;
    if (state.flags.ch15ResonanceLock) { state.flags.ch15ResonanceLock = false; } // tắt cờ khóa ch.15 khi trận khép (kể cả thua)
    state.hp = Math.round(state.hpMax * 0.25);
    defeatGraceT = 3;
    var medPt = L.activeMap().meditate;
    if (medPt) fadeTransition(function () {
      px = medPt.x * TILE; py = medPt.y * TILE;
      state.x = medPt.x; state.y = medPt.y;
      refreshHUD(); saveNow();
    });
    toast('Ngươi gục xuống... Khi tỉnh lại, ngươi đã ở nơi an toàn gần nhất với 25% máu. Trận này chưa khép — quay lại điểm hẹn để đánh lại.', 5600);
    refreshHUD(); saveNow();
    if (fLose && fLose.onLose) fLose.onLose(); // đợt 2: móc thua riêng của trận (vd ch.19 mở lại kích hoạt phục kích)
  }
  function arcFigStep(fig, gx, gy, speed, dt) {
    var cx = fig.x + 16, cy = fig.y + 16;
    var dx = gx - cx, dy = gy - cy, d = Math.hypot(dx, dy);
    if (d < 2) return true;
    var step = Math.min(d, speed * dt);
    var nx = fig.x + dx / d * step, ny = fig.y + dy / d * step;
    var moved = false;
    if (L.isWalkable(Math.floor((nx + 16) / TILE), Math.floor((fig.y + 30) / TILE), npcsLive)) { fig.x = nx; moved = true; }
    if (L.isWalkable(Math.floor((fig.x + 16) / TILE), Math.floor((ny + 30) / TILE), npcsLive)) { fig.y = ny; moved = true; }
    if (moved) { fig.walkT += dt; fig.dir = Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'); }
    return false;
  }
  function arcFigStrike(fig) {
    fig.atkAnimT = 0.35;
    sfxSword();
    var fx = fig.x + 16, fy = fig.y + 16, pcx = px + 16, pcy = py + 16;
    spawnStreak((fx + pcx) / 2, (fy + pcy) / 2, Math.atan2(pcy - fy, pcx - fx), '200,210,220', false);
    if (arcHurtPlayer(Math.max(1, Math.round(fig.atk * (0.85 + Math.random() * 0.3))))) arcFigLose();
  }
  function arcFigEyeFactor() {
    var f = arcFig;
    if (!f || !f.eyeBoost) return 1;
    /* Đợt 3 (cfg.eyeDinhFreeze): mắt đang đóng băng KHÔNG nạp nhịp cho
       địch — hệ số chỉ áp khi còn mắt chưa phong ấn VÀ chưa đóng băng.
       Các trận cũ không có cờ này: giữ nguyên đường arcEyesStanding. */
    if (f.eyeDinhFreeze) return arcEyes.some(function (e) { return !e.sealed && !(e.frozenT > 0); }) ? f.eyeBoost : 1;
    return arcEyesStanding() > 0 ? f.eyeBoost : 1;
  }
  /* Đợt 3 ch.21: địch đánh XE HÀNG (cfg.carts) — xe mất máu như nhân
     chứng đợt 2 nhưng KHÔNG có trạng thái bị thương: hp về 0 là xe mất
     (state 'lost', vẽ vỡ/nghiêng + kiện hàng rơi ở khối vẽ xe đợt 3
     trong arcDrawWave2). */
  function arcFigCartStrike(fig, ct) {
    fig.atkAnimT = 0.35;
    sfxSword();
    var fx = fig.x + 16, fy = fig.y + 16;
    spawnStreak((fx + ct.x) / 2, (fy + ct.y) / 2, Math.atan2(ct.y - fy, ct.x - fx), '200,210,220', false);
    var dmg = Math.max(1, Math.round(fig.atk * (0.85 + Math.random() * 0.3)));
    ct.hp = Math.max(0, ct.hp - dmg);
    ct.flashT = 0.18;
    addDmgFloat(ct.x, ct.y - 26, '-' + dmg, '255,170,120', { size: 16, targetKey: 'arccart' });
    spawnParts(ct.x, ct.y, 4, '170,140,100', 26, false);
    if (ct.hp <= 0 && ct.state !== 'lost') {
      ct.state = 'lost';
      addFloat(ct.x, ct.y - 44, 'XE MẤT!', '255,120,100');
      spawnParts(ct.x, ct.y, 14, '170,140,100', 34, false);
      sfxHurt();
    }
  }
  function arcFigEscortStrike(fig, esc) {
    fig.atkAnimT = 0.35;
    sfxSword();
    var fx = fig.x + 16, fy = fig.y + 16, ex = esc.x + 16, ey = esc.y + 16;
    spawnStreak((fx + ex) / 2, (fy + ey) / 2, Math.atan2(ey - fy, ex - fx), '200,210,220', false);
    var dmg = Math.max(1, Math.round(fig.atk * (0.85 + Math.random() * 0.3)));
    esc.hp = Math.max(0, esc.hp - dmg);
    esc.flashT = 0.18;
    addDmgFloat(ex, ey - 26, '-' + dmg, '255,170,120', { size: 16, targetKey: 'arcfig' });
    spawnParts(ex, ey, 4, '190,200,210', 26, false);
    if (esc.hp <= 0 && !esc.injured) {
      esc.injured = true; esc.title = 'Bị thương';
      addFloat(ex, ey - 40, 'BỊ THƯƠNG!', '255,120,100');
      sfxHurt();
    }
  }
  function updateArcFig(dt) {
    var f = arcFig; if (!f || dt <= 0) return;
    var i, fig;
    for (i = f.pendingHits.length - 1; i >= 0; i--) {
      if (tNow >= f.pendingHits[i].at) { var ph = f.pendingHits.splice(i, 1)[0]; arcFigApplyHit(ph.tgt, ph.power, { kind: ph.kind, move: ph.move, hitIdx: ph.hitIdx || 0 }); if (!arcFig) return; }
    }
    // Đợt 3: mắt bị Định Âm đóng băng (cfg.eyeDinhFreeze) đếm ngược thời gian băng.
    arcEyes.forEach(function (e) { if (e.frozenT > 0) e.frozenT = Math.max(0, e.frozenT - dt); });
    if (f.phase === 'eyes') {
      if (arcEyesStanding() <= 0) {
        if (f.rescueHold && f.rescueHolds < f.rescueHold.need) { f.phase = 'holds'; addFloat(px + 16, py - 34, 'MẮT ĐÃ XUỐNG — GIỮ ĐIỂM CỨU NGƯỜI CHO ĐỦ!', '170,220,255'); }
        else arcFigWin();
      }
      return;
    }
    if (f.phase === 'holds') { if (f.rescueHold && f.rescueHolds >= f.rescueHold.need) arcFigWin(); return; }
    var pcx = px + 16, pcy = py + 16;
    if (f.jamFloatT > 0) f.jamFloatT = Math.max(0, f.jamFloatT - dt);
    /* Vùng báo trước (trấn địa của quán quân + sóng lệch của hồn loạn):
       đếm ngược, hết giờ thì nổ tại chỗ — người chơi còn trong vùng mới
       trúng đòn theo % máu tối đa (mọi đòn đều né được bằng rời vùng). */
    for (i = f.zones.length - 1; i >= 0; i--) {
      var zn = f.zones[i];
      zn.t -= dt;
      if (zn.t <= 0) {
        f.zones.splice(i, 1);
        rings.push({ x: zn.x, y: zn.y, r: 10, a: 0.9 });
        spawnParts(zn.x, zn.y, 10, zn.kind === 'soul' ? '150,190,255' : '220,120,80', 34, false);
        shakeWorld(0.22);
        if (Math.hypot(pcx - zn.x, pcy - zn.y) <= zn.r) {
          if (arcHurtPlayer(Math.max(1, Math.round((state.hpMax || 100) * zn.dmgPct)))) { arcFigLose(); return; }
        }
      }
    }
    /* Xe văn thư (ch.19, đợt 2): đồng hồ nghiêng 6 giây — Định Âm giữ
       được thì 'saved' (xem arcFigCastWord), hết giờ thì 'tipped'. */
    if (f.cart && f.cart.state === 'tilting') {
      f.cart.t -= dt;
      if (f.cart.t <= 0) {
        f.cart.state = 'tipped'; f.cart.t = 0;
        addFloat(f.cart.x, f.cart.y - 44, 'XE ĐỔ!', '255,120,100');
        spawnParts(f.cart.x, f.cart.y, 12, '170,140,100', 32, false);
        sfxHurt();
      }
    }
    /* Xe hàng tổng quát (đợt 3, cfg.carts): cùng đồng hồ trượt 6 giây
       như xe văn thư — Định Âm giữ được thì 'saved', hết giờ 'tipped'. */
    (f.carts || []).forEach(function (ct) {
      if (ct.flashT > 0) ct.flashT = Math.max(0, ct.flashT - dt);
      if (ct.state === 'tilting') {
        ct.t -= dt;
        if (ct.t <= 0) {
          ct.state = 'tipped'; ct.t = 0;
          addFloat(ct.x, ct.y - 44, 'XE ĐỔ!', '255,120,100');
          spawnParts(ct.x, ct.y, 12, '170,140,100', 32, false);
          sfxHurt();
        }
      }
    });
    /* Vùng sóng kiếm điều trận (đợt 3 ch.23 chặng 2, cfg.cmdZones): mỗi
       ~7 giây đặt một vùng báo trước tại ô người chơi — dùng lại mảng
       zones + đường sát thương/vẽ zones của đợt 2 (báo 0,9 giây, nổ
       10% hpMax). */
    if (f.cmdZones) {
      f.cmdZoneT -= dt;
      if (f.cmdZoneT <= 0) {
        f.cmdZoneT = f.cmdZones.every || 7;
        f.zones.push({ x: pcx, y: pcy, r: 2.2 * TILE, t: 0.9, dur: 0.9, dmgPct: 0.10, kind: 'cmd' });
        addFloat(pcx, pcy - 34, 'SÓNG KIẾM ĐIỀU TRẬN!', '255,150,110');
        // Gộp cung IV: chỉ huy trận không có thân riêng — nhịp phát lúc
        // ra chiêu bung tại các MẮT TRẬN chưa phong ấn (tay của hắn).
        arcEyes.forEach(function (e) { if (!e.sealed) arcBossCastFx(e.x, e.y, '216,180,255', false); });
      }
    }
    /* Nhân chứng hộ tống (ch.19): địch trong 3 ô thì chạy về điểm an
       toàn cổng nam (51,74); yên thì lảng vảng quanh đoàn (51,62). */
    f.escorts.forEach(function (esc) {
      if (esc.flashT > 0) esc.flashT = Math.max(0, esc.flashT - dt);
      if (esc.injured) return;
      var ex = esc.x + 16, ey = esc.y + 16, threat = false;
      f.figs.forEach(function (fg) { if (!fg.dead && !fg.fleeing && Math.hypot(fg.x + 16 - ex, fg.y + 16 - ey) <= 3 * TILE) threat = true; });
      if (threat) arcFigStep(esc, esc.safeX + 16, esc.safeY + 16, 62, dt);
      else {
        var wx = esc.anchorX + Math.sin(tNow / 2400 + esc.seed) * 26, wy = esc.anchorY + Math.cos(tNow / 2900 + esc.seed) * 18;
        if (Math.hypot(wx - ex, wy - ey) > 12) arcFigStep(esc, wx, wy, 26, dt);
      }
    });
    var anyAlive = false;
    for (i = 0; i < f.figs.length; i++) {
      fig = f.figs[i];
      if (fig.flashT > 0) fig.flashT = Math.max(0, fig.flashT - dt);
      if (fig.resVibT > 0) fig.resVibT = Math.max(0, fig.resVibT - dt);
      if (fig.atkAnimT > 0) fig.atkAnimT = Math.max(0, fig.atkAnimT - dt);
      if (fig.holdT > 0) fig.holdT = Math.max(0, fig.holdT - dt);
      if (fig.sealT > 0) fig.sealT = Math.max(0, fig.sealT - dt);
      if (fig.shieldT > 0) fig.shieldT = Math.max(0, fig.shieldT - dt);
      if (fig.shieldFloatT > 0) fig.shieldFloatT = Math.max(0, fig.shieldFloatT - dt);
      if (fig.dead) continue;
      if (fig.fleeing) {
        fig.fleeT += dt;
        arcFigStep(fig, fig.x + 16 + (fig.x + 16 - pcx) * 4, fig.y + 16 + (fig.y + 16 - pcy) * 4, fig.speed * 1.7, dt);
        if (fig.fleeT > 2.2 || Math.hypot(fig.x + 16 - pcx, fig.y + 16 - pcy) > 300) fig.dead = true;
        else anyAlive = true;
        continue;
      }
      anyAlive = true;
      var dist = Math.hypot(fig.x + 16 - pcx, fig.y + 16 - pcy);
      if (fig.holdT > 0 || fig.sealT > 0) continue;
      /* Hồn loạn (ch.20): không đuổi đánh người chơi — sạt chậm quanh
         sân và xả SÓNG LỆCH theo chu kỳ ~6 giây (vùng báo trước tại ô
         người chơi + người chơi nghe được sóng lệch nên Tĩnh Âm dâng). */
      if (fig.soulChaos) {
        fig.waveT -= dt;
        if (fig.waveT <= 0) {
          fig.waveT = 6;
          f.zones.push({ x: pcx, y: pcy, r: 2.2 * TILE, t: 0.9, dur: 0.9, dmgPct: 0.10, kind: 'soul' });
          arcBossCastFx(fig.x + 16, fig.y + 16, '150,190,255', false); // gộp cung IV: nhịp phát lúc thực thể hồn loạn xả SÓNG LỆCH
          state.silence = Math.min(L.SILENCE_MAX || 100, (state.silence || 0) + 30);
          addFloat(pcx, pcy - 34, 'NGHE SÓNG LỆCH — TĨNH ÂM DÂNG!', '150,200,255');
          refreshHUD();
        }
        var swx = fig.homeX + 16 + Math.sin(tNow / 3400) * 42, swy = fig.homeY + 16 + Math.cos(tNow / 4100) * 26;
        if (Math.hypot(swx - (fig.x + 16), swy - (fig.y + 16)) > 10) arcFigStep(fig, swx, swy, 20, dt);
        continue;
      }
      /* Quán quân (ch.18): chu kỳ HỘ THỂ + TRẤN ĐỊA + QUÉT ĐÔI. */
      if (fig.champ) {
        if (fig.shieldT <= 0) {
          fig.shieldCd -= dt;
          if (fig.shieldCd <= 0) {
            fig.shieldT = 3; fig.shieldCd = 9;
            addFloat(fig.x + 16, fig.y - 34, 'HỘ THỂ!', '255,214,150');
            rings.push({ x: fig.x + 16, y: fig.y + 16, r: 8, a: 0.9 });
            arcBossCastFx(fig.x + 16, fig.y + 16, '255,214,150', false); // gộp cung IV: nhịp phát lúc chiêu ra cho HỘ THỂ
          }
        }
        fig.zoneT -= dt;
        if (fig.zoneT <= 0) {
          fig.zoneT = 7;
          if (dist <= 6 * TILE) {
            f.zones.push({ x: pcx, y: pcy, r: 2.2 * TILE, t: 1.2, dur: 1.2, dmgPct: 0.12, kind: 'champ' });
            addFloat(pcx, pcy - 34, 'NÉ!', '255,150,110');
            arcBossCastFx(fig.x + 16, fig.y + 16, '255,214,150', false); // gộp cung IV: nhịp phát tại quán quân khi TRẤN ĐỊA ra chiêu
          }
        }
        if (fig.sweep) {
          var sw = fig.sweep;
          sw.t -= dt;
          if (sw.t <= 0) {
            if (Math.hypot(fig.x + 16 - pcx, fig.y + 16 - pcy) <= 48) { arcFigStrike(fig); if (!arcFig) return; }
            // Nhịp hai: sau nhịp một 0,4 giây là báo trước 0,3 giây (nhanh hơn nhịp một) rồi mới đánh.
            if (sw.phase === 1) { fig.sweep = { phase: 2, t: 0.4 + 0.3 }; arcBossCastFx(fig.x + 16, fig.y + 16, '255,214,150', false); } // gộp cung IV: nhịp phát QUÉT ĐÔI nhịp hai
            else fig.sweep = null;
          }
          continue;
        }
      }
      /* Chọn mục tiêu: nhân chứng chưa ngã trong 5,5 ô và gần hơn
         người chơi thì địch đánh nhân chứng, ngược lại đánh người chơi. */
      var tgtX = pcx, tgtY = pcy, tgtEsc = null, tgtCart = null;
      if (f.escorts.length) {
        var bestEsc = null, bestEscD = 5.5 * TILE;
        f.escorts.forEach(function (esc) {
          if (esc.injured) return;
          var ed = Math.hypot(esc.x + 16 - (fig.x + 16), esc.y + 16 - (fig.y + 16));
          if (ed < bestEscD) { bestEscD = ed; bestEsc = esc; }
        });
        if (bestEsc && bestEscD < dist) { tgtEsc = bestEsc; tgtX = bestEsc.x + 16; tgtY = bestEsc.y + 16; }
      }
      /* Đợt 3 ch.21: xe hàng (cfg.carts) là mục tiêu như nhân chứng đợt
         2 — địch trong 5,5 ô quanh xe và gần xe hơn người chơi thì đánh
         xe (đọc từ cfg.carts qua f.carts; xe đã mất/'saved' không còn
         là mục tiêu, xe đang trượt vẫn bị đánh). */
      if (f.carts && f.carts.length && !tgtEsc) {
        var bestCart = null, bestCartD = 5.5 * TILE;
        f.carts.forEach(function (ct) {
          if (!ct.targetable || ct.state === 'lost' || ct.state === 'saved') return;
          var cd = Math.hypot(ct.x - (fig.x + 16), ct.y - (fig.y + 16));
          if (cd < bestCartD) { bestCartD = cd; bestCart = ct; }
        });
        if (bestCart && bestCartD < dist) { tgtCart = bestCart; tgtX = bestCart.x; tgtY = bestCart.y; }
      }
      var tdist = Math.hypot(fig.x + 16 - tgtX, fig.y + 16 - tgtY);
      if (tdist > 40) arcFigStep(fig, tgtX, tgtY, fig.speed, dt);
      else {
        fig.atkT -= dt;
        if (fig.atkT <= 0) {
          fig.atkT = fig.interval * arcFigEyeFactor();
          if (fig.champ) { fig.sweep = { phase: 1, t: 0.45 }; arcBossCastFx(fig.x + 16, fig.y + 16, '255,214,150', false); } // gộp cung IV: nhịp phát lúc QUÉT ĐÔI ra chiêu
          else if (tgtCart) arcFigCartStrike(fig, tgtCart);
          else if (tgtEsc) arcFigEscortStrike(fig, tgtEsc);
          else { arcFigStrike(fig); if (!arcFig) return; }
        }
      }
    }
    if (!anyAlive && arcFig) arcFigNextWave();
  }
  function arcFigTargets() {
    var out = [];
    if (!arcFig) return out;
    arcFig.figs.forEach(function (fig) { if (!fig.dead && !fig.fleeing) out.push({ kind: 'fig', fig: fig, x: fig.x + 16, y: fig.y + 16 }); });
    arcEyes.forEach(function (e) { if (!e.sealed && e.hp != null) out.push({ kind: 'eye', eye: e, x: e.x, y: e.y }); });
    return out;
  }
  function arcFigNearest(rangeTiles, kinds) {
    var pcx = px + 16, pcy = py + 16, best = null, bd = rangeTiles * TILE;
    arcFigTargets().forEach(function (t) {
      if (kinds && kinds.indexOf(t.kind) < 0) return;
      var d = Math.hypot(t.x - pcx, t.y - pcy);
      if (d <= bd) { bd = d; best = t; }
    });
    return best;
  }
  function arcFigApplyHit(tgt, power, opts) {
    opts = opts || {};
    if (!tgt) return;
    var crit = Math.random() < 0.10;
    var dmg = crit ? Math.round(power * 1.6) : power;
    if (tgt.kind === 'eye') {
      var e = tgt.eye;
      // Đợt 3: mắt đang đóng băng chịu kiếm x1,5 (chỉ mắt có frozenT —
      // mắt của các trận cũ không bao giờ có trường này).
      if (e.frozenT > 0) dmg = Math.round(dmg * 1.5);
      e.hp -= dmg;
      if (state) L.recordPlayValue(state, 'maxHit', dmg); // kỷ lục đòn mạnh nhất (đợt mở rộng bảng nhân vật): làn trận kịch bản — nhánh mắt trận
      addDmgFloat(e.x, e.y - 26, '-' + dmg, '200,208,220', { size: 17, targetKey: 'arceye' });
      spawnParts(e.x, e.y, 4, '148,163,184', 22, false);
      sfxHitBlade();
      if (e.hp <= 0) {
        var ix = arcEyes.indexOf(e); if (ix >= 0) arcEyes.splice(ix, 1);
        rings.push({ x: e.x, y: e.y, r: 10, a: 0.95 });
        spawnParts(e.x, e.y, 14, '148,163,184', 34, false);
        addFloat(e.x, e.y - 34, 'MẮT VỠ!', '200,208,220');
        sfxSealBreak(170);
      }
      return;
    }
    var fig = tgt.fig;
    // Đợt 3 ch.22: tên NGHE TIẾNG (spec listener) — lần trúng kiếm ĐẦU
    // TIÊN vào hắn bị né hẳn (không sát thương, chỉ một lần mỗi trận).
    if (fig.listener && !fig.listenerHeard && opts.kind === 'sword') {
      fig.listenerHeard = true;
      addFloat(fig.x + 16, fig.y - 44, 'NGHE ĐƯỢC NHỊP!', '255,214,150');
      addDmgFloat(fig.x + 16, fig.y - 26, 'NÉ!', '255,214,150', { size: 17, targetKey: 'arcfig' });
      spawnParts(fig.x + 16, fig.y + 16, 4, '200,210,220', 26, false);
      sfxSword();
      return;
    }
    // Đợt 2 ch.18: HỘ THỂ của quán quân — kiếm đánh vào lúc khiên dựng
    // chỉ còn 25% uy lực (cộng hưởng không bị giảm: cửa sổ chờ khiên hạ
    // là bài nhịp của trận, không khóa cứng đường thắng).
    if (fig.champ && fig.shieldT > 0 && opts.kind === 'sword') {
      dmg = Math.max(1, Math.round(dmg * 0.25));
      if (fig.shieldFloatT <= 0) { fig.shieldFloatT = 0.8; addFloat(fig.x + 16, fig.y - 40, 'HỘ THỂ!', '255,214,150'); }
    }
    // Đợt 2 ch.19: quầng nhiễu của đầu lĩnh — đòn CỘNG HƯỞNG vào hắn
    // giảm 50% (kiếm không bị ảnh hưởng), chữ nổi giới hạn nhịp 1,5s.
    if (fig.jam && opts.kind === 'word') {
      dmg = Math.max(1, Math.round(dmg * 0.5));
      var fJam = arcFig;
      if (fJam && fJam.jamFloatT <= 0) { fJam.jamFloatT = 1.5; addFloat(fig.x + 16, fig.y - 40, 'SÓNG NHIỄU!', '190,170,255'); }
    }
    if (fig.noKill && fig.hp - dmg <= Math.round(fig.hpMax * fig.fleeAt)) {
      fig.hp = Math.round(fig.hpMax * fig.fleeAt);
      fig.fleeing = true; fig.fleeT = 0;
      addFloat(fig.x + 16, fig.y - 30, 'RÚT LUI!', '255,190,120');
      addDmgFloat(fig.x + 16, fig.y - 26, '-' + dmg, (opts.kind === 'word') ? '255,190,120' : '190,235,200', { size: 19, targetKey: 'arcfig' });
      return;
    }
    fig.hp = Math.max(0, fig.hp - dmg);
    if (state) L.recordPlayValue(state, 'maxHit', dmg); // kỷ lục đòn mạnh nhất (đợt mở rộng bảng nhân vật): làn trận kịch bản — nhánh hình nhân (nhánh kẹp noKill ở trên không tới đây vì số áp thật khác số hiện)
    fig.flashT = 0.18;
    if (opts.kind === 'word') fig.resVibT = 0.2;
    addDmgFloat(fig.x + 16, fig.y - 26, '-' + dmg, (opts.kind === 'word') ? '255,190,120' : '190,235,200', { size: 19, targetKey: 'arcfig' });
    if (opts.kind === 'sword') presentSwordHit(fig.x + 16, fig.y + 28, Math.atan2((py + 16) - (fig.y + 16), (px + 16) - (fig.x + 16)) + Math.PI, opts.move || 'tram', crit, opts.hitIdx || 0);
    spawnParts(fig.x + 16, fig.y + 16, 5, '190,200,210', 30, false);
    sfxHitBlade();
    if (fig.hp <= 0) {
      fig.dead = true;
      spawnParts(fig.x + 16, fig.y + 20, 12, '170,180,190', 32, false);
      spawnSmoke(fig.x + 16, fig.y + 12, 3);
    }
  }
  function arcFigCastSword() {
    var f = arcFig; if (!f) return;
    var tgt = arcFigNearest(1.9, null);
    if (!tgt) { toast('Chưa có mục tiêu trong tầm kiếm — lại gần đối thủ hoặc mắt trận.'); return; }
    var mv = bestSwordMove();
    var r = L.castSword(state, mv.id);
    if (!r.ok) { toast(r.reason); return; }
    arcFaceTo(tgt.x, tgt.y);
    sfxSword();
    var gain = L.techniqueGain(state, 'that_tinh', 2);
    if (gain.tierUps && gain.tierUps.length) presentTechTierUp('that_tinh', gain.tier);
    startSwordBody(mv.id, tNow, r.hits > 1 ? tNow + 120 : null);
    for (var i = 0; i < r.hits; i++) {
      if (i === 0) arcFigApplyHit(tgt, r.power, { kind: 'sword', move: mv.id, hitIdx: 0 });
      else f.pendingHits.push({ at: tNow + i * 120, power: r.power, kind: 'sword', move: mv.id, hitIdx: i, tgt: tgt });
      if (!arcFig) return;
    }
    refreshHUD();
  }
  function arcFigCastWord(skill) {
    var f = arcFig; if (!f) return;
    if (state.flags.ch15ResonanceLock || state.flags.arcResLocked) { toast('Vòng nhiễu loạn sóng khóa chặt cộng hưởng — sóng không tới được. Đã học bậc Hưởng cũng vô dụng ở đây; dùng kiếm quyết và công pháp!'); return; }
    if (skill === 'dinh' && f.usedDinh >= 2 && !f.soulChaos && !f.rescueHold) { toast('Trận này đã dùng Định Âm hai lần — uy lực hưởng cần khoảng lặng dài mới tụ lại được.'); return; }
    if (skill === 'phong' && f.usedPhong >= 1) { toast('Trận này đã dùng Phong Âm một lần — ấn hưởng không thể chồng thêm ấn.'); return; }
    // Đợt 2 ch.19: Định Âm giữ XE VĂN THƯ — điểm đặc biệt xử lý TRƯỚC
    // khi chọn figure: xe đang nghiêng và người chơi trong 3,2 ô quanh
    // xe thì đòn Định này thuộc về xe, không thuộc về địch gần đó.
    if (skill === 'dinh' && f.cart && f.cart.state === 'tilting' && Math.hypot(f.cart.x - (px + 16), f.cart.y - (py + 16)) <= 3.2 * TILE) {
      arcFaceTo(f.cart.x, f.cart.y);
      var cartSilenceBefore = state.silence;
      var rc = L.castWord(state, 'dinh');
      if (!rc.ok) { toast(rc.reason); return; }
      f.usedDinh++;
      startResBody(false);
      spawnPillar(f.cart.x, f.cart.y + 14, { top: 'purple', dur: 0.85, h: 105 });
      castResonanceFx('dinh', f.cart.x, f.cart.y, { silenceBefore: cartSilenceBefore, baseFreq: 300, target: null });
      f.cart.state = 'saved';
      addFloat(f.cart.x, f.cart.y - 44, 'GIỮ ĐƯỢC XE!', '255,224,150');
      addDmgFloat(f.cart.x, f.cart.y - 40, (WORD_FLOAT.dinh || ['ĐỊNH!', '170,220,255'])[0], '170,220,255', { size: 22, life: 0.9 });
      refreshHUD();
      return;
    }
    /* Đợt 3: Định Âm giữ XE HÀNG tổng quát (cfg.carts) — cùng khuôn xe
       văn thư đợt 2 nhưng điểm giữ đọc từ f.carts: xe nào đang 'tilting'
       và người chơi trong 3,2 ô quanh xe thì đòn Định thuộc về xe ấy. */
    if (skill === 'dinh' && f.carts && f.carts.length) {
      var tiltCart = null;
      f.carts.forEach(function (ct) { if (ct.state === 'tilting' && Math.hypot(ct.x - (px + 16), ct.y - (py + 16)) <= 3.2 * TILE) tiltCart = ct; });
      if (tiltCart) {
        arcFaceTo(tiltCart.x, tiltCart.y);
        var cartSilenceBefore3 = state.silence;
        var rc3 = L.castWord(state, 'dinh');
        if (!rc3.ok) { toast(rc3.reason); return; }
        f.usedDinh++;
        startResBody(false);
        spawnPillar(tiltCart.x, tiltCart.y + 14, { top: 'purple', dur: 0.85, h: 105 });
        castResonanceFx('dinh', tiltCart.x, tiltCart.y, { silenceBefore: cartSilenceBefore3, baseFreq: 300, target: null });
        tiltCart.state = 'saved';
        addFloat(tiltCart.x, tiltCart.y - 44, 'GIỮ ĐƯỢC XE!', '255,224,150');
        addDmgFloat(tiltCart.x, tiltCart.y - 40, (WORD_FLOAT.dinh || ['ĐỊNH!', '170,220,255'])[0], '170,220,255', { size: 22, life: 0.9 });
        refreshHUD();
        return;
      }
    }
    /* Đợt 3 ch.24 (cfg.rescueHold): Định Âm GIỮ ĐIỂM CỨU NGƯỜI — người
       chơi trong 3,2 ô quanh điểm giữ thì đòn Định tính một lần giữ
       (nới giới hạn usedDinh như khuôn soulChaos đợt 2 ở đầu hàm); đủ
       số lần giữ mà trận đã hết đợt/mắt thì pha 'holds' tự khép thắng
       ở updateArcFig, đang còn đợt thì giữ tích lũy sẵn. */
    if (skill === 'dinh' && f.rescueHold) {
      var rhX = f.rescueHold.tx * TILE + 16, rhY = f.rescueHold.ty * TILE + 16;
      if (Math.hypot(rhX - (px + 16), rhY - (py + 16)) <= 3.2 * TILE) {
        arcFaceTo(rhX, rhY);
        var rhSilenceBefore = state.silence;
        var rrh = L.castWord(state, 'dinh');
        if (!rrh.ok) { toast(rrh.reason); return; }
        f.usedDinh++;
        startResBody(false);
        spawnPillar(rhX, rhY + 14, { top: 'purple', dur: 0.85, h: 105 });
        castResonanceFx('dinh', rhX, rhY, { silenceBefore: rhSilenceBefore, baseFreq: 300, target: null });
        f.rescueHolds++;
        rings.push({ x: rhX, y: rhY, r: 10, a: 0.9 });
        addFloat(rhX, rhY - 52, 'GIỮ! (' + f.rescueHolds + '/' + (f.rescueHold.need || 2) + ')', '170,220,255');
        addDmgFloat(rhX, rhY - 40, (WORD_FLOAT.dinh || ['ĐỊNH!', '170,220,255'])[0], '170,220,255', { size: 22, life: 0.9 });
        refreshHUD();
        return;
      }
    }
    /* Đợt 3 (cfg.eyeDinhFreeze): Định Âm vào MẮT trận của cfg này KHÔNG
       đi đường "mắt không chịu Định" ở dưới — đòn Định tiêu hao như
       thường và đóng băng mắt 4 giây (hết eyeFactor, kiếm x1,5 lúc
       băng — xem arcFigEyeFactor/arcFigApplyHit). */
    if (skill === 'dinh' && f.eyeDinhFreeze) {
      var eyeFr = arcFigNearest(3.2, null);
      if (eyeFr && eyeFr.kind === 'eye') {
        arcFaceTo(eyeFr.x, eyeFr.y);
        var eyeSilenceBefore = state.silence;
        var rfe = L.castWord(state, 'dinh');
        if (!rfe.ok) { toast(rfe.reason); return; }
        f.usedDinh++;
        startResBody(false);
        spawnPillar(eyeFr.x, eyeFr.y + 14, { top: 'purple', dur: 0.85, h: 105 });
        castResonanceFx('dinh', eyeFr.x, eyeFr.y, { silenceBefore: eyeSilenceBefore, baseFreq: 300, target: null });
        eyeFr.eye.frozenT = 4;
        addFloat(eyeFr.x, eyeFr.y - 44, 'MẮT ĐÓNG BĂNG!', '170,220,255');
        addDmgFloat(eyeFr.x, eyeFr.y - 40, (WORD_FLOAT.dinh || ['ĐỊNH!', '170,220,255'])[0], '170,220,255', { size: 22, life: 0.9 });
        refreshHUD();
        return;
      }
    }
    // PHONG ưu tiên mắt trận trong tầm (đường thắng b của ch.14: phong
    // ấn NGAY GIỮA TRẬN) — đúng ngữ cảnh arcPhongContext đã dựng.
    var eyeTgt = null;
    if (skill === 'phong') eyeTgt = arcFigNearest(3.2, ['eye']);
    var tgt = eyeTgt || arcFigNearest(3.2, ['fig']);
    if (!tgt) { toast('Chưa có mục tiêu trong tầm sóng 3,2 ô.'); return; }
    // Mắt trận không có nhịp sóng để Phá/Chấn/Định — kiểm tra TRƯỚC khi
    // castWord tiêu Tĩnh Âm (kiếm phá mắt, Phong Âm phong ấn mắt).
    if (skill !== 'phong' && tgt.kind !== 'fig') { toast('Mắt trận không chịu Phá/Chấn/Định Âm — dùng kiếm phá nó, hoặc Phong Âm phong ấn.'); return; }
    arcFaceTo(tgt.x, tgt.y);
    var silenceBefore = state.silence;
    var r = L.castWord(state, skill);
    if (!r.ok) { toast(r.reason); return; }
    startResBody(false);
    var wf = WORD_FLOAT[skill] || ['!', '255,255,255'];
    if (skill === 'phong') {
      f.usedPhong++;
      arcEyes.forEach(function (e) { if (!e.sealed && Math.hypot(e.x - (px + 16), e.y - (py + 16)) <= 3.2 * TILE) arcSealEye(e); });
      if (tgt.kind === 'fig') { tgt.fig.sealT = tgt.fig.interval * 2; arcFigApplyHit(tgt, r.power, { kind: 'word', skill: 'phong' }); }
      spawnPillar(px + 16, py + 30, { dur: 0.9, h: 112 });
    } else if (skill === 'dinh') {
      f.usedDinh++;
      tgt.fig.holdT = tgt.fig.interval;
      spawnPillar(tgt.x, tgt.y + 14, { top: 'purple', dur: 0.85, h: 105 });
      castResonanceFx('dinh', tgt.x, tgt.y + 14, { silenceBefore: silenceBefore, baseFreq: 300, target: tgt.fig });
      // Đợt 2 ch.20: Định Âm GIỮ NHỊP hồn loạn — không giới hạn 2 lần
      // (đã nới ở đầu hàm); đủ số lần giữ thì trận khép theo đường A.
      if (f.soulChaos && tgt.fig.soulChaos) {
        f.soulHolds++;
        addFloat(tgt.x, tgt.y - 52, 'GIỮ! (' + f.soulHolds + '/' + (f.soulChaos.need || 3) + ')', '170,220,255');
        if (f.soulHolds >= (f.soulChaos.need || 3)) { refreshHUD(); arcFigSoulHoldWin(); return; }
      }
    } else {
      castResonanceFx(skill, tgt.x, tgt.y + 14, { silenceBefore: silenceBefore, baseFreq: 300, target: tgt.fig });
      shakeWorld(0.3);
      arcFigApplyHit(tgt, r.power, { kind: 'word', skill: skill });
    }
    addDmgFloat(tgt.x, tgt.y - 40, wf[0], wf[1], { size: 22, life: 0.9 });
    refreshHUD();
  }

  /* ---------- Kịch bản trận chương 14 + 15 ---------- */
  function arcStartCh14SiteFight() {
    if (arcFig || !state) return;
    arcEyes.length = 0;
    var eye = arcAddEye(47 * TILE + 16, 38 * TILE + 16, { label: 'Mắt trận loạn sóng' });
    eye.hp = 300;
    arcFigStart({ id: 'ch14_site', eyeBoost: 0.7, requireEyesDown: true,
      waves: [[
        { tx: 45, ty: 38, look: 'villager_m', name: 'Tay chân thuê', title: 'Nhóm giữ đất thuê', hp: 620, atk: 14, interval: 1.5, speed: 56 },
        { tx: 49, ty: 38, look: 'villager_m', name: 'Tay chân thuê', title: 'Nhóm giữ đất thuê', hp: 660, atk: 14, interval: 1.5, speed: 56 },
        { tx: 45, ty: 40, look: 'villager_f', name: 'Tay chân thuê', title: 'Nhóm giữ đất thuê', hp: 700, atk: 15, interval: 1.5, speed: 58 },
        { tx: 49, ty: 40, look: 'player_nam', name: 'Tên cầm đầu nhóm thuê', title: 'Nhóm giữ đất thuê', hp: 760, atk: 15, interval: 1.4, speed: 58 }
      ]],
      onWin: function () {
        state.flags.q14SiteDone = true;
        say(ST.SCENE_CH14_HIEN_TRUONG_END, function () {
          state.quest = 'q14_tu_choi'; refreshHUD(); saveNow();
          toast('Hiện trường đã yên vĩnh viễn — nơi đây thành điểm hái dược nhỏ (tương tác tại chỗ, một lượt mỗi ngày). Về đại điện báo lại trưởng lão.', 4800);
        });
      } });
    toast('Mắt trận loạn sóng đang chạy giữa hiện trường: còn nó đứng, nhịp đánh của nhóm thuê nhanh hơn hẳn. Hai đường thắng: hạ cả nhóm rồi phong ấn mắt — hoặc phong ấn mắt NGAY GIỮA TRẬN bằng Phong Âm khi đứng gần mắt.', 5600);
  }
  function arcStartCh15Rescue() {
    if (arcFig || !state) return;
    // Cờ khóa cộng hưởng ch.15 (A.4): BẬT khi vào trận, TẮT khi trận
    // khép (arcFigWin qua onWin / arcFigLose đều tắt).
    state.flags.ch15ResonanceLock = true; refreshHUD();
    arcEyes.length = 0;
    arcFigStart({ id: 'ch15_rescue', eyeBoost: 0.8,
      eyesAtWave: { 1: [{ tx: 44, ty: 35, mobile: true }, { tx: 50, ty: 41, mobile: true }] },
      waves: [
        [
          { tx: 44, ty: 34, look: 'villager_m', name: 'Tay chân Huyết Bạc Cung', title: 'Đợt thử trận', hp: 600, atk: 14, interval: 1.5, speed: 56 },
          { tx: 50, ty: 34, look: 'villager_m', name: 'Tay chân Huyết Bạc Cung', title: 'Đợt thử trận', hp: 600, atk: 14, interval: 1.5, speed: 56 },
          { tx: 47, ty: 44, look: 'villager_f', name: 'Tay chân Huyết Bạc Cung', title: 'Đợt thử trận', hp: 640, atk: 14, interval: 1.5, speed: 56 }
        ],
        [
          { tx: 43, ty: 38, look: 'villager_m', name: 'Tên cầm trận', title: 'Giữ mắt trận di động', hp: 700, atk: 15, interval: 1.5, speed: 58 },
          { tx: 51, ty: 38, look: 'villager_m', name: 'Tên cầm trận', title: 'Giữ mắt trận di động', hp: 700, atk: 15, interval: 1.5, speed: 58 }
        ],
        [
          { tx: 44, ty: 42, look: 'villager_m', name: 'Tay chân Huyết Bạc Cung', title: 'Đợt thử trận', hp: 720, atk: 15, interval: 1.4, speed: 58 },
          { tx: 50, ty: 42, look: 'villager_f', name: 'Tay chân Huyết Bạc Cung', title: 'Đợt thử trận', hp: 720, atk: 15, interval: 1.4, speed: 58 },
          { tx: 47, ty: 34, look: 'luc_tranh', name: 'Kẻ Chỉ Huy Đợt Thử Trận', title: 'Huyết Bạc Cung', hp: 1500, atk: 16, interval: 1.4, speed: 60, noKill: true, fleeAt: 0.35 }
        ]
      ],
      onWin: function () {
        state.flags.ch15ResonanceLock = false; refreshHUD();
        say(ST.SCENE_CH15_CUU_DOAN_END, function () {
          state.quest = 'q15_truy_duoi'; refreshHUD(); saveNow();
          toast('Chỉ huy đã rút về hướng nam đường mòn — đuổi theo tới điểm cuối chặng quanh (45,50)!', 4200);
        });
      } });
    toast('Vòng nhiễu loạn sóng đã khép: cộng hưởng bị KHÓA — chỉ kiếm quyết và công pháp dùng được. Hai mắt trận di động ở đợt hai: còn mắt đứng thì đợt địch nạp nhịp nhanh hơn; phá mắt bằng kiếm là đường tắt.', 5600);
  }
  function arcStartCh15Chase(n) {
    if (arcFig || !state) return;
    if (n === 1) {
      arcFigStart({ id: 'ch15_chase1', waves: [[
        { tx: 44, ty: 51, look: 'villager_m', name: 'Tay chân chốt chặn', title: 'Huyết Bạc Cung', hp: 480, atk: 12, interval: 1.5, speed: 58 },
        { tx: 47, ty: 52, look: 'villager_m', name: 'Tay chân chốt chặn', title: 'Huyết Bạc Cung', hp: 480, atk: 12, interval: 1.5, speed: 58 }
      ]], onWin: function () {
        say(ST.SCENE_CH15_TRUY_DUOI_2, function () { arcStartCh15Chase(2); });
      } });
    } else {
      arcFigStart({ id: 'ch15_chase2', waves: [[
        { tx: 42, ty: 53, look: 'villager_m', name: 'Tay chân chốt chặn', title: 'Huyết Bạc Cung', hp: 520, atk: 13, interval: 1.5, speed: 58 },
        { tx: 45, ty: 55, look: 'villager_f', name: 'Tay chân chốt chặn', title: 'Huyết Bạc Cung', hp: 520, atk: 13, interval: 1.5, speed: 58 }
      ]], onWin: function () {
        state.flags.ch15ChaseDone = true;
        // Chỉ huy thoát bằng BÙNG NHIỄU ở cuối chặng (43,54) — không
        // chết; mảnh lõi pháp khí vỡ rơi lại đã nằm trong cảnh END.
        var bx = 43 * TILE + 16, by = 54 * TILE + 16;
        rings.push({ x: bx, y: by, r: 10, a: 0.95 });
        spawnParts(bx, by, 18, '148,163,184', 42, false);
        sfxChan(); shakeWorld(0.3);
        say(ST.SCENE_CH15_TRUY_DUOI_END, function () {
          state.quest = 'q15_bao_cao'; refreshHUD(); saveNow();
          toast('Chỉ huy đã thoát bằng bùng nhiễu, để lại mảnh lõi pháp khí vỡ. Về đại điện báo cáo trưởng lão.', 4200);
        });
      } });
    }
  }

  /* ---------- Kịch bản trận chương 18–20 (đợt 2) ---------- */
  // Ch.18: trận đấu công khai với quán quân Đỗ gia tại sân phủ Cô Châu.
  // [ĐỀ XUẤT SỐ] hp 1300 / atk 15 / speed 52 theo hợp đồng B.6a.
  function arcStartCh18ChampFight() {
    if (arcFig || !state) return;
    arcEyes.length = 0;
    arcFigStart({ id: 'ch18_champ',
      waves: [[
        { tx: 51, ty: 27, look: 'luc_tranh', name: 'Vô Địch Đỗ Gia', title: 'Vô địch của Đỗ gia', hp: 1300, atk: 15, interval: 1.5, speed: 52, champ: true }
      ]],
      onWin: function () {
        say(ST.SCENE_CH18_DAU_XONG, function () {
          arcClaimToast('q18_champion');
          state.quest = 'q18_chung_cu'; refreshHUD(); saveNow();
          toast('Hai nhà đã cam kết giữ hòa tới phiên phân xử. Giờ gom chứng cứ khắp thành — hỏi chủ sạp chợ ở Cô Châu.', 4600);
        });
      } });
    toast('Trận đấu công khai bắt đầu: quán quân Đỗ gia có HỘ THỂ theo chu kỳ (kiếm chỉ còn 25% khi khiên dựng), TRẤN ĐỊA vẽ vùng báo trước trên đất — rời vùng trước khi nổ, và QUÉT ĐÔI hai nhịp khi áp sát.', 5600);
  }
  // Ch.19: phục kích đoàn nhân chứng ở phố nam. Đợt 2 có xe văn thư,
  // đợt 3 có đầu lĩnh quầng nhiễu. [ĐỀ XUẤT SỐ] hp các đợt theo B.6b.
  function arcStartCh19Ambush() {
    if (arcFig || !state) return;
    arcEyes.length = 0;
    arcFigStart({ id: 'ch19_ambush', cart: true,
      escorts: [
        { tx: 50, ty: 62, look: 'villager_old', name: 'Người Giữ Sổ', hp: 300 },
        { tx: 52, ty: 62, look: 'villager_m', name: 'Người Giữ Đập', hp: 300 },
        { tx: 51, ty: 60, look: 'villager_f', name: 'Người Ghi Chép', hp: 300 }
      ],
      waves: [
        [
          { tx: 48, ty: 59, look: 'villager_m', name: 'Tay đánh thuê', title: 'Phía thua thuê', hp: 620, atk: 13, interval: 1.5, speed: 56 },
          { tx: 54, ty: 59, look: 'villager_m', name: 'Tay đánh thuê', title: 'Phía thua thuê', hp: 620, atk: 13, interval: 1.5, speed: 56 },
          { tx: 48, ty: 65, look: 'villager_f', name: 'Tay đánh thuê', title: 'Phía thua thuê', hp: 620, atk: 13, interval: 1.5, speed: 58 }
        ],
        [
          { tx: 54, ty: 65, look: 'villager_m', name: 'Tay đánh thuê', title: 'Phía thua thuê', hp: 680, atk: 13, interval: 1.5, speed: 56 },
          { tx: 49, ty: 58, look: 'villager_m', name: 'Tay đánh thuê', title: 'Phía thua thuê', hp: 680, atk: 14, interval: 1.5, speed: 58 },
          { tx: 53, ty: 66, look: 'villager_f', name: 'Tay đánh thuê', title: 'Phía thua thuê', hp: 680, atk: 14, interval: 1.4, speed: 58 }
        ],
        [
          { tx: 48, ty: 60, look: 'villager_m', name: 'Tay đánh thuê', title: 'Phía thua thuê', hp: 680, atk: 14, interval: 1.5, speed: 58 },
          { tx: 54, ty: 60, look: 'villager_f', name: 'Tay đánh thuê', title: 'Phía thua thuê', hp: 680, atk: 14, interval: 1.5, speed: 58 },
          { tx: 51, ty: 58, look: 'luc_tranh', name: 'Đầu Lĩnh Phục Kích', title: 'Mang pháp khí loạn sóng', hp: 1500, atk: 15, interval: 1.4, speed: 58, jam: true, noKill: true, fleeAt: 0.25 }
        ]
      ],
      onWin: function (fDone) {
        var clean = fDone && !(fDone.escorts || []).some(function (e) { return e.injured; }) && !(fDone.cart && fDone.cart.state === 'tipped');
        say(clean ? ST.SCENE_CH19_PHUC_KICH_XONG_A : ST.SCENE_CH19_PHUC_KICH_XONG_B, function () {
          state.quest = 'q19_vet_ran'; refreshHUD(); saveNow();
          toast('Đoàn nhân chứng đã qua cơn nguy. Đưa họ về tới cổng nam thành — đi xuống dải cổng phía nam phố.', 4600);
        });
      },
      onLose: function () { state.flags.ch19AmbushStarted = false; refreshHUD(); saveNow(); } });
    toast('Phục kích! Giữ cho ba nhân chứng sống sót — họ sẽ chạy về cổng nam khi địch áp sát, và địch sẽ đổi mục tiêu sang họ. Đợt hai có xe văn thư: dùng Định Âm gần xe để giữ xe khỏi đổ.', 5600);
  }
  // Ch.20: đuôi chung của hai đường kết trận hồn loạn — cảnh ghi nhận
  // theo cờ soulPublic, công nhận phẩm hồn 4 qua logic, đặt cờ xong.
  function arcSoulRecognizeTail() {
    say(state.flags.soulPublic ? ST.SCENE_CH20_GHI_NHAN_A : ST.SCENE_CH20_GHI_NHAN_B, function () {
      if (L.arcIvRecognizeSoulRank4) L.arcIvRecognizeSoulRank4(state);
      state.flags.ch20SoulDone = true;
      refreshHUD(); saveNow();
      toast('Tư cách Hồn Sư đã được ghi nhận — phẩm hồn 4. Về Tĩnh Quan Lâu gặp Trần Chính Đạo để trao lời đáp.', 4800);
    });
  }
  function arcFigSoulHoldWin() {
    // Đường A: giữ nhịp đủ 3 lần bằng Định Âm — dọn trận trước, thưởng
    // hồn lực đầy đủ +30 [ĐỀ XUẤT SỐ theo B.6c], rồi cảnh kết + ghi nhận.
    if (!arcFig) return;
    arcFig = null; arcEyes.length = 0;
    state.soulPower = (state.soulPower || 0) + 30;
    say(ST.SCENE_CH20_HON_LOAN_XONG_A, function () { arcSoulRecognizeTail(); });
  }
  function arcStartCh20SoulFight() {
    if (arcFig || !state) return;
    state.flags.ch20SoulStarted = true;
    arcEyes.length = 0;
    arcFigStart({ id: 'ch20_soul', soulChaos: { need: 3 },
      waves: [[
        { tx: 62, ty: 60, look: 'villager_m', name: 'Hồn Loạn', title: 'Hồn lệch tần', hp: 1100, atk: 13, interval: 1.5, speed: 20, soulChaos: true, monsterLook: 'oan_hon_chien_truong' }
      ]],
      onWin: function () {
        // Đường B: hạ gục trước khi giữ đủ nhịp — hồn lực +15.
        state.soulPower = (state.soulPower || 0) + 15;
        say(ST.SCENE_CH20_HON_LOAN_XONG_B, function () { arcSoulRecognizeTail(); });
      } });
    toast('Hồn loạn đang vùng vẫy giữa sân tông: sóng lệch của nó làm Tĩnh Âm của ngươi dâng lên — dùng Định Âm giữ nhịp cho nó đủ 3 lần để trấn an trọn vẹn, hoặc đánh gục nó nếu không giữ nổi.', 5600);
  }

  /* ---------- Kịch bản trận chương 21–24 (đợt 3) ----------
     Mọi số [ĐỀ XUẤT SỐ] lấy đúng hợp đồng đợt 3 mục B.6/B.7 (thang đợt
     2). Ô spawn đều đã dò walkable bằng logic.js — riêng tâm vùng trận
     (44,44) bị footprint gốc thông chiếm nên figure đứng QUANH tâm,
     không đứng đúng tâm. */
  // Ch.21 chặng 1: giữ đoàn ở cổng nam — 3 tay phá đoàn + 3 xe hàng
  // (cfg.carts tổng quát; xe không trượt ở chặng này).
  function arcStartCh21GateA() {
    if (arcFig || !state) return;
    arcEyes.length = 0;
    arcFigStart({ id: 'ch21_gate_a',
      carts: [
        { tx: 50, ty: 72, hp: 400 },
        { tx: 52, ty: 72, hp: 400 },
        { tx: 51, ty: 70, hp: 400 }
      ],
      waves: [[
        { tx: 48, ty: 68, look: 'villager_m', name: 'Tay Phá Đoàn', title: 'Kẻ đánh vào hàng thật', hp: 620, atk: 13, interval: 1.5, speed: 56 },
        { tx: 54, ty: 68, look: 'villager_f', name: 'Tay Phá Đoàn', title: 'Kẻ đánh vào hàng thật', hp: 620, atk: 13, interval: 1.5, speed: 58 },
        { tx: 51, ty: 66, look: 'villager_m', name: 'Tay Phá Đoàn', title: 'Kẻ đánh vào hàng thật', hp: 620, atk: 13, interval: 1.4, speed: 58 }
      ]],
      onWin: function () {
        say(ST.SCENE_CH21_PHU_CAT, function () { arcStartCh21GateB(); });
      },
      onLose: function () { state.flags.ch21GateStarted = false; refreshHUD(); saveNow(); } });
    toast('Chúng đánh vào hàng thật! Giữ ba xe hàng ở cổng nam — địch gần xe hơn ngươi sẽ quay sang phá xe. Xe mất hết là đoàn mất trắng.', 5600);
  }
  // Ch.21 chặng 2: đợt phá đoàn thứ hai — tinh anh Kim Đan dẫn nhóm +
  // quái dã tinh anh nhiễm sóng nhập hỗn chiến; xe (51,70) đang trượt.
  function arcStartCh21GateB() {
    if (arcFig || !state) return;
    arcEyes.length = 0;
    arcFigStart({ id: 'ch21_gate_b',
      carts: [
        { tx: 50, ty: 72, hp: 400 },
        { tx: 52, ty: 72, hp: 400 },
        { tx: 51, ty: 70, hp: 400, tilt: true }
      ],
      waves: [[
        { tx: 48, ty: 68, look: 'villager_m', name: 'Tay Phá Đoàn', title: 'Kẻ đánh vào hàng thật', hp: 680, atk: 14, interval: 1.5, speed: 56 },
        { tx: 54, ty: 68, look: 'villager_f', name: 'Tay Phá Đoàn', title: 'Kẻ đánh vào hàng thật', hp: 680, atk: 14, interval: 1.5, speed: 58 },
        { tx: 51, ty: 66, look: 'luc_tranh', name: 'Tinh Anh Kim Đan Dẫn Nhóm', title: 'Kẻ đánh vào hàng thật', hp: 1250, atk: 16, interval: 1.4, speed: 58, champ: true },
        { tx: 55, ty: 71, look: 'villager_m', name: 'Sơn Lang Nhiễm Sóng', title: 'Quái dã tinh anh nhập hỗn chiến', hp: 1500, atk: 22, interval: 1.3, speed: 50, monsterLook: 'lang_nhiem_song' }
      ]],
      onWin: function (fDone) {
        var lost = (fDone && fDone.carts) ? fDone.carts.filter(function (ct) { return ct.state === 'lost' || ct.state === 'tipped'; }).length : 0;
        state.flags.q21HangNguyen = lost === 0;
        if (lost >= 2) state.flags.q21HangThietHai = lost;
        refreshHUD(); saveNow();
        say(ST.SCENE_CH21_KHOP_CUA, function () {
          state.quest = 'q21_danh_gia'; refreshHUD(); saveNow();
          toast(lost === 0 ? 'Hàng còn nguyên cả ba xe. Về phủ Hứa — Chính Ngôn đang chờ cả nhà ở sân phủ.' : 'Đoàn đã qua cổng, nhưng mất ' + lost + ' xe hàng. Về phủ Hứa gặp Chính Ngôn ở sân phủ.', 4600);
        });
      },
      onLose: function () { state.flags.ch21GateStarted = false; refreshHUD(); saveNow(); } });
    toast('Đợt hai ập tới — có tinh anh Kim Đan dẫn nhóm và một con quái nhiễm sóng nhập hỗn chiến, đánh cả người lẫn xe! Xe giữa đang TRƯỢT: dùng Định Âm trong 3,2 ô quanh xe để giữ nó lại!', 5600);
  }
  // Ch.22: trận thám báo ở vành tuyến — 4 đệ tử Huyết Bạc (một tên
  // listener) + 1 mắt trận vành chịu Định Âm đóng băng.
  function arcStartCh22Scout() {
    if (arcFig || !state) return;
    arcEyes.length = 0;
    arcFigStart({ id: 'ch22_scout', eyeBoost: 0.75, eyeDinhFreeze: true,
      eyesAtWave: { 0: [{ tx: 46, ty: 42 }] },
      waves: [[
        { tx: 42, ty: 44, look: 'villager_m', name: 'Đệ Tử Huyết Bạc', title: 'Đội thám báo', hp: 700, atk: 14, interval: 1.5, speed: 56 },
        { tx: 47, ty: 44, look: 'villager_f', name: 'Đệ Tử Huyết Bạc', title: 'Đội thám báo', hp: 700, atk: 14, interval: 1.5, speed: 58 },
        { tx: 44, ty: 41, look: 'villager_m', name: 'Đệ Tử Huyết Bạc', title: 'Đội thám báo', hp: 700, atk: 14, interval: 1.5, speed: 56, listener: true },
        { tx: 45, ty: 47, look: 'villager_m', name: 'Đệ Tử Huyết Bạc', title: 'Đội thám báo', hp: 700, atk: 14, interval: 1.4, speed: 58 }
      ]],
      onWin: function () {
        say(ST.SCENE_CH22_VANH_TRAN, function () {
          state.quest = 'q22_tich_luy'; refreshHUD(); saveNow();
          toast('Xác minh đã xong: trận hoàn chỉnh, có người điều, có cửa sổ mỏng nhịp. Về đại điện báo lại trưởng lão.', 4600);
        });
      },
      onLose: function () { state.flags.ch22ScoutStarted = false; refreshHUD(); saveNow(); } });
    toast('Đội thám báo của Huyết Bạc Cung! Một tên trong chúng NGHE được nhịp kiếm của ngươi. Mắt trận vành đang nạp nhịp cho chúng — dùng Định Âm khóa thẳng vào mắt để đóng băng nó, rồi phá bằng kiếm lúc băng chưa tan.', 5600);
  }
  // Ch.23 chặng 1: vòng vây khép — cộng hưởng bị khóa từ lúc cảnh
  // VONG_VAY_MO khép (cờ đặt ở trigger vùng, tắt ở mọi đường khép trận).
  function arcStartCh23EncircleA() {
    if (arcFig || !state) return;
    arcEyes.length = 0;
    arcFigStart({ id: 'ch23_encircle_a', requireEyesDown: true,
      eyesAtWave: { 0: [{ tx: 42, ty: 42 }], 1: [{ tx: 47, ty: 47 }] },
      waves: [
        [
          { tx: 42, ty: 44, look: 'villager_m', name: 'Đệ Tử Huyết Bạc', title: 'Vòng vây loạn sóng', hp: 750, atk: 15, interval: 1.5, speed: 56 },
          { tx: 48, ty: 44, look: 'villager_m', name: 'Đệ Tử Huyết Bạc', title: 'Vòng vây loạn sóng', hp: 750, atk: 15, interval: 1.5, speed: 56 },
          { tx: 44, ty: 48, look: 'villager_f', name: 'Đệ Tử Huyết Bạc', title: 'Vòng vây loạn sóng', hp: 750, atk: 15, interval: 1.5, speed: 58 }
        ],
        [
          { tx: 43, ty: 42, look: 'villager_m', name: 'Đệ Tử Huyết Bạc', title: 'Vòng vây loạn sóng', hp: 820, atk: 15, interval: 1.5, speed: 58 },
          { tx: 47, ty: 42, look: 'villager_f', name: 'Đệ Tử Huyết Bạc', title: 'Vòng vây loạn sóng', hp: 820, atk: 15, interval: 1.4, speed: 58 },
          { tx: 40, ty: 44, look: 'villager_m', name: 'Đệ Tử Huyết Bạc', title: 'Vòng vây loạn sóng', hp: 820, atk: 15, interval: 1.5, speed: 56 }
        ]
      ],
      onWin: function () {
        // Cờ riêng của chặng 2 đặt TRƯỚC khi chặng 2 mở: thua chặng 2
        // thì trigger vùng vào lại thẳng chặng 2 (không chơi lại chặng 1).
        state.flags.ch23FightBStarted = true; refreshHUD(); saveNow();
        say(ST.SCENE_CH23_DOI_TRAN, function () { arcStartCh23EncircleB(); });
      },
      onLose: function () {
        state.flags.arcResLocked = false;
        state.flags.ch23FightStarted = false;
        refreshHUD(); saveNow();
      } });
    toast('Vòng vây đã khép — cộng hưởng bị KHÓA, chỉ kiếm quyết và công pháp dùng được. Phá các mắt trận ven đường (kiếm phá hoặc Phong Âm phong ấn) rồi mới hạ được vòng vây.', 5600);
  }
  // Ch.23 chặng 2: đợt dồn giữa đoàn + sóng kiếm điều trận theo nhịp.
  function arcStartCh23EncircleB() {
    if (arcFig || !state) return;
    arcEyes.length = 0;
    arcFigStart({ id: 'ch23_encircle_b', requireEyesDown: true, cmdZones: { every: 7 },
      eyesAtWave: { 0: [{ tx: 45, ty: 40 }] },
      waves: [[
        { tx: 42, ty: 44, look: 'villager_m', name: 'Đệ Tử Huyết Bạc', title: 'Vòng vây loạn sóng', hp: 880, atk: 16, interval: 1.5, speed: 58 },
        { tx: 48, ty: 46, look: 'villager_f', name: 'Đệ Tử Huyết Bạc', title: 'Vòng vây loạn sóng', hp: 880, atk: 16, interval: 1.4, speed: 58 },
        { tx: 44, ty: 48, look: 'villager_m', name: 'Đệ Tử Huyết Bạc', title: 'Vòng vây loạn sóng', hp: 880, atk: 16, interval: 1.5, speed: 56 }
      ]],
      onWin: function () {
        // Cộng hưởng GIỮ khóa suốt chuỗi cảnh sau trận; chỉ mở lại khi
        // SCENE_CH23_LUA_CHON khép (mỏm đá nằm ngoài vùng trận).
        say(ST.SCENE_CH23_HUONG_SUP, function () {
          var variant = state.flags.guardAssign === 'ky_cuu' ? ST.SCENE_CH23_HUONG_SUP_A
            : state.flags.guardAssign === 'tre' ? ST.SCENE_CH23_HUONG_SUP_B : ST.SCENE_CH23_HUONG_SUP_C;
          say(variant, function () {
            state.quest = 'q23_lua_chon'; refreshHUD(); saveNow();
            say(ST.SCENE_CH23_LUA_CHON, function () {
              state.flags.arcResLocked = false; refreshHUD();
              say(ST.SCENE_CH23_KHEP, function () {
                arcClaimToast('q23_done');
                state.quest = 'q24_lenh_cuu_nguoi'; refreshHUD(); saveNow();
                toast('Vòng vây đã vỡ, đoàn co về mỏm đá an toàn. Tới chỗ đệ tử hộ tống ở đoạn hai vách (45,43) — khắc tiếp theo thuộc về lựa chọn của ngươi.', 4600);
              });
            });
          });
        });
      },
      onLose: function () {
        state.flags.arcResLocked = false;
        state.flags.ch23FightBRetry = true; // trigger vùng dùng cờ này để vào lại thẳng chặng 2
        refreshHUD(); saveNow();
      } });
    toast('Đợt dồn giữa đoàn! Người điều trận xả SÓNG KIẾM theo nhịp đóng của trận — thấy vùng báo trước thì rời khỏi ô đứng ngay. Cộng hưởng vẫn bị khóa.', 5600);
  }
  // Ch.24: rẽ hai đường theo lựa chọn mỏm đá của ch.23 (B.7). Thiếu cờ
  // ch24Path (lưu cũ/lệch pha) -> mặc định đường giữ bí mật, KHÔNG ghi sổ.
  function arcStartCh24Path() {
    if (arcFig || !state) return;
    if (state.flags.ch24Path === 'phat_huong') {
      if (!state.flags.ch24SpeechRecorded) {
        L.recordSpeech(state, 24, 'ch24_lenh_cuu_nguoi', 'doan_ho_tong_va_dich');
        state.flags.ch24SpeechRecorded = true;
      }
      refreshHUD(); saveNow();
      say(ST.SCENE_CH24_PHAT_HUONG, function () { arcStartCh24Rescue(); });
      return;
    }
    say(ST.SCENE_CH24_GIU_BI_MAT, function () { arcStartCh24Breakout(); });
  }
  // Ch.24 đường PHÁT HƯỞNG: trận cứu người — thắng đủ BA điều kiện:
  // hết đợt + mắt cuối xuống + Định Âm giữ điểm cứu người đủ 2 lần.
  function arcStartCh24Rescue() {
    if (arcFig || !state) return;
    arcEyes.length = 0;
    arcFigStart({ id: 'ch24_rescue', requireEyesDown: true, rescueHold: { need: 2, tx: 44, ty: 44 },
      eyesAtWave: { 1: [{ tx: 46, ty: 42 }] },
      waves: [
        [
          { tx: 42, ty: 44, look: 'villager_m', name: 'Đệ Tử Huyết Bạc', title: 'Đợt áp sát cuối', hp: 750, atk: 15, interval: 1.5, speed: 56 },
          { tx: 48, ty: 44, look: 'villager_f', name: 'Đệ Tử Huyết Bạc', title: 'Đợt áp sát cuối', hp: 750, atk: 15, interval: 1.5, speed: 58 }
        ],
        [
          { tx: 43, ty: 42, look: 'villager_m', name: 'Đệ Tử Huyết Bạc', title: 'Đợt áp sát cuối', hp: 820, atk: 15, interval: 1.5, speed: 58 },
          { tx: 47, ty: 47, look: 'villager_f', name: 'Đệ Tử Huyết Bạc', title: 'Đợt áp sát cuối', hp: 820, atk: 15, interval: 1.4, speed: 58 }
        ]
      ],
      onWin: function () {
        state.quest = 'q24_tha_mang'; refreshHUD(); saveNow();
        toast('Người bị thương đã an toàn. Tới mép đoạn đường (43,45) — người điều trận bị bỏ lại đang nằm dưới gốc cây bị chém cụt.', 4600);
      } });
    toast('Giữ người bị thương dưới mảng vách nứt: đứng trong vòng sóng quanh điểm giữ (44,44) và dùng Định Âm giữ đủ 2 lần, đồng thời phá mắt trận cuối và đẩy lui các đợt áp sát.', 5600);
  }
  // Ch.24 đường GIỮ BÍ MẬT: trận phá vây bằng kiếm — cộng hưởng bị khóa
  // LẠI trong trận này (tắt khi trận khép, thắng hay thua).
  function arcStartCh24Breakout() {
    if (arcFig || !state) return;
    state.flags.arcResLocked = true; refreshHUD();
    arcEyes.length = 0;
    arcFigStart({ id: 'ch24_breakout',
      waves: [
        [
          { tx: 42, ty: 44, look: 'villager_m', name: 'Đệ Tử Huyết Bạc', title: 'Vòng vây loạn sóng', hp: 800, atk: 15, interval: 1.5, speed: 56 },
          { tx: 48, ty: 44, look: 'villager_m', name: 'Đệ Tử Huyết Bạc', title: 'Vòng vây loạn sóng', hp: 800, atk: 15, interval: 1.5, speed: 58 },
          { tx: 44, ty: 48, look: 'villager_f', name: 'Đệ Tử Huyết Bạc', title: 'Vòng vây loạn sóng', hp: 800, atk: 15, interval: 1.4, speed: 58 }
        ],
        [
          { tx: 43, ty: 42, look: 'villager_m', name: 'Đệ Tử Huyết Bạc', title: 'Vòng vây loạn sóng', hp: 850, atk: 16, interval: 1.5, speed: 58 },
          { tx: 47, ty: 47, look: 'villager_f', name: 'Đệ Tử Huyết Bạc', title: 'Vòng vây loạn sóng', hp: 850, atk: 16, interval: 1.5, speed: 58 },
          { tx: 44, ty: 41, look: 'luc_tranh', name: 'Tên Cầm Trận', title: 'Quạt kiếm trận thu nhỏ', hp: 1400, atk: 17, interval: 1.4, speed: 56, champ: true }
        ]
      ],
      onWin: function () {
        state.flags.arcResLocked = false;
        state.quest = 'q24_tha_mang'; refreshHUD(); saveNow();
        toast('Đoàn đã phá vây thoát ra bằng kiếm. Tới mép đoạn đường (43,45) — người điều trận bị bỏ lại đang nằm dưới gốc cây bị chém cụt.', 4600);
      },
      onLose: function () {
        state.flags.arcResLocked = false;
        refreshHUD(); saveNow();
      } });
    toast('Phá vây bằng kiếm trong thế yếu: cộng hưởng bị khóa, không đòn bậc Hưởng — chỉ kiếm quyết và công pháp. Tên cầm trận ở đợt cuối có hộ thể, trấn địa và quét đôi.', 5600);
  }

  /* ---------- Đồng hồ chiêu boss trong hệ chạm trán (ch.16 + Hộ Trận) ---------- */
  /* GỘP CUNG IV (2026-11-04) — hai chuẩn trình diễn Bui chốt ngày
     2026-11-04 áp cho boss/trận chính của cung IV: (a) HIỆU ỨNG LÚC
     CHIÊU RA (00:00): khoảnh khắc boss xuất chiêu phải có nhịp phát
     tại điểm phát — vòng chấn động từ chân + cột sáng ngắn bùng lên +
     hạt nở ra, hiệu ứng chính nở theo sau; (b) HIỆU ỨNG SKILL CỦA
     BOSS (00:33): mọi skill của boss có lớp hiệu ứng riêng. Hàm này
     là nhịp phát dùng chung, chỉ trình diễn — không đổi sát thương,
     nhịp chiêu hay cửa sổ báo trước đã cân ở các đợt sản xuất. */
  function arcBossCastFx(x, y, color, big) {
    if (!SET || SET.current.fxRings) {
      rings.push({ x: x, y: y, r: big ? 12 : 8, a: 0.95 });
      rings.push({ x: x, y: y, r: big ? 5 : 3, a: 0.85 });
    }
    spawnParts(x, y - 6, big ? 26 : 14, color, big ? 46 : 34, true);
    spawnPillar(x, y + 20, { dur: 0.35, h: big ? 124 : 88 });
    if (big) shakeWorld(0.3);
  }
  function arcBossFanStrike(m, mcx, mcy, dist, dmg) {
    for (var si = 0; si < 7; si++) {
      var ang = -Math.PI / 2 + (si - 3) * 0.32;
      spawnStreak(mcx + Math.cos(ang) * 30, mcy + Math.sin(ang) * 30, ang, '150,160,170', false);
      spawnParts(mcx + Math.cos(ang) * 34, mcy + Math.sin(ang) * 34, 2, '150,160,170', 36, false);
    }
    shakeWorld(0.3);
    if (dist < 132) hurtPlayer(Math.max(1, dmg));
  }
  function arcBossTick(dt) {
    if (!enc || !enc.arcT || dt <= 0 || !state) return;
    var m = enc.mon, t = enc.arcT;
    if (m.state !== 'alive') return;
    var pcx = px + 16, pcy = py + 16, mcx = m.x + 16, mcy = m.y + 16;
    var dist = Math.hypot(mcx - pcx, mcy - pcy);
    if (m.species === 'tran_nhan_kiem_linh') {
      // Định Âm đóng băng chu kỳ: đồng bộ cờ frozen theo holdT của boss
      // (đúng ngữ nghĩa VSLC_ARCIV.setCycleFrozen — khi bắt đầu đóng
      // băng thì đặt lại nhịp tích tắc; arcUpdateCycle im tuyệt đối khi
      // frozen; monSrc khóa khung idle cột 0 theo cùng điều kiện này).
      if (arcCycle) { var fz = m.holdT > 0; if (fz && !arcCycle.frozen) arcCycle.tickI = -1; arcCycle.frozen = fz; }
      if (t.quatTele >= 0) {
        t.quatTele += dt;
        if (t.quatTele >= 0.6) { t.quatTele = -1; if (m.holdT <= 0) { arcBossCastFx(mcx, mcy, '170,220,255', false); arcBossFanStrike(m, mcx, mcy, dist, Math.round(m.atk * 1.2)); if (!enc) return; } }
      } else {
        t.quat -= dt;
        if (t.quat <= 0) { t.quat = 5.5; t.quatTele = 0; addFloat(mcx, mcy - 44, 'QUẠT KIẾM!', '200,208,220'); if (!SET || SET.current.fxRings) rings.push({ x: mcx, y: mcy, r: 8, a: 0.85 }); }
      }
      if (t.fanPend >= 0) {
        t.fanPend += dt;
        if (t.fanPend >= 1.1) {
          t.fanPend = -1;
          if (m.holdT > 0) addFloat(mcx, mcy - 48, 'CHU KỲ BỊ NGẮT!', '170,220,255'); // Định Âm ngắt đúng nhịp tụ của Vạn Kiếm
          else if (dist < 150) { arcBossCastFx(mcx, mcy, '170,220,255', true); hurtPlayer(Math.max(1, Math.round(state.hpMax * 0.07))); if (!enc) return; }
        }
      } else {
        t.van -= dt;
        if (t.van <= 0) { t.van = 13; arcCycleFan(); t.fanPend = 0; }
      }
      return;
    }
    if (m.bossId === 'boss_hb_ho_tran_kiem_linh') {
      // Quạt 7 tia XỈN, không sao dẫn (khác hẳn họ Sao Dẫn của người chơi).
      if (t.quatTele >= 0) {
        t.quatTele += dt;
        if (t.quatTele >= 0.6) { t.quatTele = -1; if (m.holdT <= 0) { arcBossCastFx(mcx, mcy, '150,160,170', false); arcBossFanStrike(m, mcx, mcy, dist, Math.round(m.atk * 1.15)); if (!enc) return; } }
      } else {
        t.quat -= dt;
        if (t.quat <= 0) { t.quat = 6; t.quatTele = 0; addFloat(mcx, mcy - 44, 'QUẠT KIẾM TRẬN!', '200,208,220'); if (!SET || SET.current.fxRings) rings.push({ x: mcx, y: mcy, r: 8, a: 0.85 }); }
      }
      // Chiêu chu kỳ: cửa sổ tụ 1,6s — CHỈ Định Âm (holdT) mới ngắt được.
      if (t.cycWin >= 0) {
        t.cycWin += dt;
        if (m.holdT > 0) { t.cycWin = -1; t.cyc = 12; addFloat(mcx, mcy - 48, 'NGẮT CHU KỲ!', '170,220,255'); }
        else if (t.cycWin >= 1.6) {
          t.cycWin = -1; t.cyc = 12;
          arcBossCastFx(mcx, mcy, '255,190,120', true);
          arcBossFanStrike(m, mcx, mcy, dist, Math.round(state.hpMax * 0.08));
          if (!enc) return;
        }
      } else {
        t.cyc -= dt;
        if (t.cyc <= 0) { t.cycWin = 0; addFloat(mcx, mcy - 44, 'CHU KỲ KIẾM TRẬN!', '255,190,120'); if (!SET || SET.current.fxRings) rings.push({ x: mcx, y: mcy, r: 8, a: 0.9 }); }
      }
    }
  }

  /* ---------- Cổng tầng sâu + thưởng boss tầng sâu ---------- */
  function bcGateKiemTrungInteract() {
    // Một vật thể hai tầng (tiền lệ cua_tan_tich): khi bcSauGateOpen
    // đúng thì cho CHỌN tầng sâu; chưa đủ điều kiện thì vào tầng thường
    // như cũ. Hai mắt phụ của tầng sâu KHÔNG có nhánh thoại riêng —
    // tương tác với chúng đi qua hệ mắt trận/chiến đấu (chỉ thị điều
    // phối 20:22 ngày 2026-11-03, giữ cổng lồng tiếng xanh tuyệt đối).
    if (L.bcSauGateOpen && L.bcSauGateOpen(state)) {
      if (enc) { toast('Đang giao chiến — thoát trận rồi hãy vào bí cảnh.'); return; }
      if (bcSession) return bcGateInteract('bc_kiemtrung');
      return say([{ who: 'choice', text: 'Cụm kiếm chắn hang rung lên khe khẽ: dưới Kiếm Trủng còn một tầng sâu cổ xưa hơn, chỉ mở cho người đã lĩnh ngộ khung Huyền và đứng ở Kim Đan. Ngươi sẽ…', options: [
        { label: 'Xuống tầng sâu Kiếm Trủng', action: 'bc_floor_kiemtrung_sau' },
        { label: 'Vào Kiếm Trủng (tầng thường)', action: 'bc_floor_kiemtrung' },
        { label: 'Chưa xuống — quay lại sau', action: 'bc_floor_later' }
      ] }]);
    }
    return bcGateInteract('bc_kiemtrung');
  }
  /* ---------- Cổng Di Tích Trận Tâm + bia tập kết tổ đội ---------- */
  function bcGateTranTamInteract() {
    if (enc) { toast('Đang giao chiến — thoát trận rồi hãy vào bí cảnh.'); return; }
    if (bcSession) return bcGateInteract('bc_tran_tam');
    if (!L.secretRealmUnlocked(state, 'bc_tran_tam')) return say([{ who: 'narrate', text: BC_LOCK_LINES.bc_tran_tam }]);
    if (L.bcTranTamSauOpen && L.bcTranTamSauOpen(state)) {
      return say([{ who: 'choice', text: 'Cụm kiếm phong ấn rung lên khe khẽ: tầng ngoài của di tích ở ngay sau cụm kiếm; sâu hơn nữa là tâm trận — nơi chỉ mở cho tổ đội đã dọn sạch tầng ngoài. Ngươi sẽ…', options: [
        { label: 'Xuống Tâm Trận (cần tổ đội)', action: 'bc_floor_tran_tam_sau' },
        { label: 'Vào Tầng Ngoài Di Tích', action: 'bc_floor_tran_tam' },
        { label: 'Chưa xuống — quay lại sau', action: 'bc_floor_later' }
      ] }]);
    }
    return bcGateInteract('bc_tran_tam');
  }
  function partyStagingInteract() {
    if (enc) { toast('Đang giao chiến — xong trận rồi hãy tới bia tập kết.'); return; }
    return say([{ who: 'choice', text: 'Bia tập kết của Di Tích Trận Tâm. Các tổ đội xuống tâm trận đều ghi tên tại đây trước khi qua cổng phong ấn. Ngươi sẽ…', options: [
      { label: 'Ghép tổ đội (AI tạo bot)', action: 'party_matchmake' },
      { label: 'Xem tổ đội hiện tại', action: 'party_view' },
      { label: 'Giải tán tổ đội', action: 'party_disband' },
      { label: 'Rời đi', action: 'party_close' }
    ] }]);
  }
  function partyChoiceAction(action) {
    if (action === 'party_matchmake') {
      grindCloseDlg();
      if (!L.partyMatchmake) { toast('Hệ ghép tổ chưa sẵn sàng.', 3600); return; }
      var r = L.partyMatchmake(state, 'bc_tran_tam_sau');
      var added = (r && r.added) || [];
      if (!added.length) toast('Tổ đội đã đủ 3 thành viên.', 3600);
      added.forEach(function (bot) {
        toast('Đã ghép tổ: ' + bot.name + ' — ' + bot.sect + ' · ' + ((L.PARTY_ROLE_LABEL || {})[bot.role] || bot.role) + ' (máu ' + bot.hpMax + ', lực ' + (bot.power != null ? bot.power : bot.atk) + ').', 4200);
      });
      toast('Tổ đội hiện có ' + (L.partySize ? L.partySize(state) : 1) + '/3 thành viên — đủ người xuống Tâm Trận.', 4200);
      saveNow(); refreshHUD();
      return;
    }
    if (action === 'party_view') {
      grindCloseDlg();
      var bots = (state.party && state.party.bots) || [];
      if (!bots.length) { toast('Tổ đội hiện chỉ có mình ngươi. Dùng Ghép tổ đội (AI) tại bia này để lấp đủ người.', 4200); return; }
      var lines = ['Đội trưởng: ' + state.name];
      bots.forEach(function (bot) { lines.push(bot.name + ' · ' + bot.sect + ' · ' + ((L.PARTY_ROLE_LABEL || {})[bot.role] || bot.role)); });
      toast(lines.join(' — '), 5200);
      return;
    }
    if (action === 'party_disband') {
      grindCloseDlg();
      if (L.partyClearBots) L.partyClearBots(state);
      partyBotsLive = [];
      toast('Đã giải tán tổ đội ghép. Các tu sĩ được ghép đã rời đi.', 3600);
      saveNow(); refreshHUD();
      return;
    }
    if (action === 'party_close') { grindCloseDlg(); return; }
  }
  function bcSauBossRewards(m, def, rec) {
    if (!rec.firstClear) {
      // Thưởng lần đầu nằm NGOÀI hồ sơ phẳng: qua bcSauFirstClearRewards
      // của logic (Huyền Tinh Kiếm Phổ + Yêu Đan cấp 3 + tu vi 240 + thử
      // học ô 06). Túi không đủ chỗ cho Yêu Đan thì boss gượng dậy như
      // mọi boss bí cảnh — firstClear chưa bị tính.
      var fits = L.bagUsed(state) + 1 <= L.bagCap(state) && L.bagCanAdd(state, 'yeu_dan_3', 1).ok;
      if (!fits) {
        toast('Túi đã đầy — Trận Nhãn Kiếm Linh chưa gục hẳn đã gượng dậy. Hãy dọn túi rồi quay lại đánh tiếp; lần đầu này chưa bị tính là đã qua.', 5200);
        return 'bag_full';
      }
      var ev = L.bcRecordClear(state, 'bc_kiemtrung_sau');
      var fr = L.bcSauFirstClearRewards(state);
      sfxFirstClear();
      var parts = ['bí tịch Huyền Tinh Kiếm Phổ', 'Yêu Đan cấp 3 ×1'];
      if (fr && fr.tuvi > 0) parts.push('+' + fmtAmt(fr.tuvi) + ' tu vi');
      if (fr && fr.set06 && fr.set06.ok) parts.push('lĩnh ngộ Thanh Long Xuất Thế');
      else if (fr && fr.set06 && !fr.set06.ok) parts.push('Thanh Long Xuất Thế còn chờ đủ chuỗi hệ');
      toast('Lần đầu hạ Trận Nhãn Kiếm Linh! Nhận: ' + parts.join(' · ') + '.', 5600);
      // Pháp bảo rơi lần đầu (đợt pháp bảo 2026-11-06): tầng sâu Kiếm
      // Trủng là dải Kim Đan — Thượng phẩm, hạt giống theo ngày + cõi.
      var pbSauFirst = L.rollTreasureDrop('pb:bc_kiemtrung_sau:first:d' + state.dayCount, 3);
      if (pbSauFirst) {
        spawnDrop(pbSauFirst, 1, m.x + 16, m.y + 16);
        toast('Pháp bảo rơi: ' + L.ITEM_DEFS[pbSauFirst].name + ' — hãy nhặt lấy!', 5200);
      }
      if (state.quest === 'q16_linh_ngo') {
        state.quest = 'q16_benh_vuc';
        toast('Kiếm ý tầng sâu đã lặng. Về đại điện gặp trưởng lão để khép việc lĩnh ngộ — và nhận khoản chuẩn bị đột phá.', 4600);
      }
      refreshHUD(); saveNow();
      return 'claimed';
    }
    var key = bcSession ? bcSession.key : ('gr:bc:bc_kiemtrung_sau:d' + state.dayCount);
    var r = L.grantReward(state, def.bossProfileId, { claimKey: key + ':boss', sourceId: 'bc_kiemtrung_sau', boss: true });
    if (!r.ok) {
      if (r.reason === 'bag_full') {
        toast('Túi đã đầy — Trận Nhãn Kiếm Linh chưa gục hẳn đã gượng dậy. Hãy dọn túi rồi quay lại đánh tiếp; lượt này chưa bị tính là đã hạ.', 5200);
        return 'bag_full';
      }
      if (r.duplicate) return 'claimed';
      toast('Thưởng boss tầng sâu chưa nhận được: ' + (r.reason || 'lỗi không rõ') + '.', 4200);
      return 'claimed';
    }
    if (huntSession) {
      huntSession.tuvi += r.granted.tuvi;
      for (var gid in r.granted.items) huntSession.items[gid] = (huntSession.items[gid] || 0) + r.granted.items[gid];
    }
    if (r.granted.tuvi > 0) spawnOrbs(9, m.x + 16, m.y + 16, r.granted.tuvi);
    var sid = (enc && enc.sessionId) || key;
    if (L.yeuDanDropFor(sid, 0.25)) spawnDrop('yeu_dan_' + def.yeuDanLevel, 1, m.x + 16, m.y + 16);
    // Pháp bảo rơi lượt lặp tầng sâu (đợt pháp bảo 2026-11-06): dải
    // Kim Đan — Thượng phẩm, hạt giống theo khóa claim của lượt.
    var pbSau = L.rollTreasureDrop(key + ':boss', 3);
    if (pbSau) {
      spawnDrop(pbSau, 1, m.x + 16, m.y + 16);
      toast('Pháp bảo rơi: ' + L.ITEM_DEFS[pbSau].name + ' — hãy nhặt lấy!', 5200);
    }
    toast('Hạ ' + m.name + '! ' + grindGrantedText(r) + '.', 5200);
    arcIvBcBossFragment('bc_kiemtrung_sau'); // ô 17 ở lượt lặp (A.2)
    refreshHUD(); saveNow();
    return 'claimed';
  }

  /* ---------- Đột phá Kim Đan Trung Kỳ tại đài (q16_dot_pha) ---------- */
  function arcDoKimDanBreak() {
    // KHÓA THỨ TỰ của hợp đồng A.1: khoản q16_pre_break (+300) phải
    // nhận TRỚC khi thử đột phá. Nhánh chính đã nhận ở cảnh BENH_VUC;
    // nếu vì bất kỳ lý do gì cờ chưa đặt, nhận ngay tại đây — vẫn
    // TRƯỚC tryBreakthrough.
    if (!state.flags.ch16Reward) arcClaimToast('q16_pre_break');
    return say(ST.SCENE_CH16_DOT_PHA, function () {
      // ĐIỂM MÓC ĐÃ NỐI khi gộp cung IV (2026-11-04): mốc lên kỳ trong
      // đại cảnh giới Kim Đan đi qua ĐÚNG cổng của hệ điều kiện đột phá
      // (L.stageGateBlocked — cùng cổng với nút Đột phá thường). Theo
      // realm-prep mục 2.5, kỳ Kim Đan không thêm cổng phụ và không có
      // thiên kiếp: cổng chỉ chặn khi điều kiện từng kỳ chưa đủ (tu vi
      // do tryBreakthrough báo riêng); nếu hệ điều kiện bổ sung điều
      // kiện cho kỳ Kim Đan về sau, mốc này tự áp theo.
      var gate = L.stageGateBlocked(state);
      if (gate && gate.reason && gate.reason !== 'great_border') { toast(gate.reason, 4600); refreshHUD(); saveNow(); return; }
      var r = L.tryBreakthrough(state);
      if (!r.ok) { toast(r.reason || 'Đột phá chưa thành — hãy kiểm tra lại tu vi.', 4200); refreshHUD(); saveNow(); return; }
      pillarT = 2.8;
      spawnParts(px + 16, py + 24, 40, '255,232,160', 34, true);
      rings.push({ x: px + 16, y: py + 16, r: 8, a: 0.95 });
      rings.push({ x: px + 16, y: py + 16, r: 3, a: 0.85 });
      shakeT = Math.max(shakeT, 0.8);
      if (state.realm === 3 && state.stage === 1) {
        state.quest = 'q16_done';
        toast('Đột phá thành công: ' + (r.label || 'Kim Đan Trung Kỳ') + '! Hoàn thành chương 16 — từ đây là kỷ nguyên online cày cuốc.', 5600);
      }
      refreshHUD(); saveNow();
    });
  }

  /* ---------- Đột phá Kim Đan Hậu Kỳ tại đài (q22_dot_pha, đợt 3 B.8) ----------
     Chép khuôn arcDoKimDanBreak: khoản q22_pre_break (+250) phải nhận
     TRƯỚC tryBreakthrough — nhánh chính đã nhận ở cuối cảnh NHAN_VIEC;
     cờ chưa đặt thì nhận ngay tại đây, vẫn TRƯỚC tryBreakthrough.
     ĐIỂM MÓC ĐÃ NỐI khi gộp cung IV (2026-11-04): mốc này là đột phá
     TRONG đại cảnh giới (3,1)->(3,2) nên theo thiết kế realm-prep
     mục 2.5 KHÔNG có thiên kiếp; điều kiện từng kỳ áp qua cổng chung
     L.stageGateBlocked ngay trước L.tryBreakthrough (cùng khuôn điểm
     móc q16 ở arcDoKimDanBreak phía trên). Chữ ký tryBreakthrough
     giữ nguyên như đợt thiên kiếp yêu cầu. */
  function arcDoHauKyBreak() {
    if (!state.flags.ch22Reward) arcClaimToast('q22_pre_break');
    return say(ST.SCENE_CH22_DOT_PHA, function () {
      var gate = L.stageGateBlocked(state);
      if (gate && gate.reason && gate.reason !== 'great_border') { toast(gate.reason, 4600); refreshHUD(); saveNow(); return; }
      var r = L.tryBreakthrough(state);
      if (!r.ok) { toast(r.reason || 'Đột phá chưa thành — hãy kiểm tra lại tu vi.', 4200); refreshHUD(); saveNow(); return; }
      pillarT = 2.8;
      spawnParts(px + 16, py + 24, 40, '255,232,160', 34, true);
      rings.push({ x: px + 16, y: py + 16, r: 8, a: 0.95 });
      rings.push({ x: px + 16, y: py + 16, r: 3, a: 0.85 });
      shakeT = Math.max(shakeT, 0.8);
      if (state.realm === 3 && state.stage === 2) {
        state.quest = 'q22_done';
        toast('Đột phá thành công: ' + (r.label || 'Kim Đan Hậu Kỳ') + '! Đoàn hộ tống sắp lên đường — tới trạm nghỉ trên đường mòn gặp đoàn.', 5600);
      }
      refreshHUD(); saveNow();
    });
  }

  /* ---------- Cảnh báo cáo ch.24: thay đoạn tin lan theo đường đi (B.3) ----------
     Đường GIỮ BÍ MẬT (ch24Path khác 'phat_huong', kể cả thiếu cờ theo
     mặc định B.7): hai dòng dan_thanh_a/b trong SCENE_CH24_LEN_DUONG
     được thay bằng SCENE_CH24_LEN_DUONG_TIN_B — thay theo MÃ NGƯỜI NÓI
     lúc dựng cảnh chạy, KHÔNG sửa mảng khóa trong story.js. */
  function arcCh24LenDuongLines() {
    if (state.flags.ch24Path === 'phat_huong') return ST.SCENE_CH24_LEN_DUONG;
    var out = [], swapped = false;
    ST.SCENE_CH24_LEN_DUONG.forEach(function (ln) {
      if (ln.who === 'dan_thanh_a' || ln.who === 'dan_thanh_b') {
        if (!swapped) { out = out.concat(ST.SCENE_CH24_LEN_DUONG_TIN_B); swapped = true; }
        return;
      }
      out.push(ln);
    });
    return out;
  }

  /* ---------- Điểm hái nhỏ tại hiện trường ch.14 (sau trận) ---------- */
  function arcSiteHarvest() {
    if (!state.flags.bagUnlocked) return toast('Cần mở Túi Trữ Vật trước mới hái được dược liệu.', 3600);
    if (state.flags.q14HerbDay === state.dayCount) return toast('Đám linh thảo ở hiện trường hôm nay đã hái rồi — chờ ngày game mới mọc lại.', 3600);
    var chk = L.bagCanAdd(state, 'thanh_tam_thao', 2);
    if (!chk.ok) return toast(chk.reason, 4200);
    state.flags.q14HerbDay = state.dayCount;
    L.bagAdd(state, 'thanh_tam_thao', 2);
    sfxHarvest();
    toast('Đã hái Thanh Tâm Thảo ×2 ở hiện trường đất linh đã yên bình.', 3200);
    refreshHUD(); saveNow();
  }

  /* ---------- Trưởng lão / tàng kinh: dạy ô 19 + ô 09 + ghép bộ ---------- */
  function arcIvElderExtras() {
    if (!state || !L.arcIvTryTeachTuDien) return false;
    var acted = false;
    if (!L.techniqueOf(state, 'tu_dien_kich')) {
      var rt = L.arcIvTryTeachTuDien(state);
      if (rt && rt.ok) { sfxQuest(); toast('Trưởng lão giữ tàng kinh truyền dạy Tử Điện Kích (bí pháp ô 19) — đã ghi vào sổ công pháp của ngươi.', 4600); acted = true; }
    }
    if (L.questReached(state, 'q16_linh_ngo')) {
      if (!L.techniqueOf(state, 'dai_nhat_hoa_cau')) {
        var rd = L.arcIvTryTeachDaiNhat(state);
        if (rd && rd.ok) { sfxQuest(); toast('Tàng kinh các truyền dạy Đại Nhật Hóa Cầu (bí pháp ô 09) — đã ghi vào sổ công pháp của ngươi.', 4600); acted = true; }
      }
      var craftable = L.nguHanhIds().filter(function (id) { return L.nguHanhCanCraft(state, id); });
      if (craftable.length) {
        if (acted) { refreshHUD(); saveNow(); }
        var opts = craftable.map(function (id) { return { label: 'Ghép bí pháp: ' + ((L.TECHNIQUE_DEFS[id] || {}).name || id), action: 'arc_craft:' + id }; });
        opts.push({ label: 'Để lúc khác', action: 'arc_craft_leave' });
        say([{ who: 'choice', text: 'Tàng kinh các còn giữ khung ghép bí pháp của dải Kim Đan — ngươi đã đủ mảnh cho ' + craftable.length + ' bộ. Ngươi sẽ…', options: opts }]);
        return true;
      }
    }
    if (acted) { refreshHUD(); saveNow(); }
    return false;
  }

  /* ---------- ARCIV đợt 2: lựa chọn thái độ chương 18 (B.4) ----------
     Cùng điểm dispatch với resolveArcChoice/resolveCh10Choice. Cả hai
     thái độ đều dẫn tới cùng trận quán quân: cảnh thái độ -> DAU_MO ->
     mở trận. Tên cảnh theo kịch bản prep khóa: SCENE_CH18_AP_LUC_NGHE /
     SCENE_CH18_AP_LUC_VIET (hợp đồng B.4 ghi lệch thành *_HUA_NGHE /
     *_HUA_VIET — worker dữ liệu đã đính chính, xem REPORT-wave2-B). */
  function arcOpenCh18Fight() {
    state.flags.ch18FightStarted = true;
    refreshHUD(); saveNow();
    say(ST.SCENE_CH18_DAU_MO, function () { arcStartCh18ChampFight(); });
  }
  function resolveCh18Choice(action) {
    if (action === 'ch18_hua_nghe') { say(ST.SCENE_CH18_AP_LUC_NGHE, function () { arcOpenCh18Fight(); }); return; }
    if (action === 'ch18_hua_viet') { say(ST.SCENE_CH18_AP_LUC_VIET, function () { arcOpenCh18Fight(); }); return; }
  }

  /* ---------- ARCIV đợt 3: lựa chọn GIỮA MẢNG CẢNH (B.4) ----------
     PHAN_CONG_CHOICE nằm giữa SCENE_CH22_NHAN_VIEC (còn 3 dòng sau) và
     LUA_CHON_CHOICE nằm trong SCENE_CH23_LUA_CHON (còn 1 dòng narrate
     chốt sau). say() THAY TOÀN BỘ hàng đợi thoại — gọi say() ở đây sẽ
     nuốt mất các dòng còn lại của cảnh và callback cuối cảnh. Cả hai
     resolver chỉ ghi cờ + saveNow() rồi gọi nextLine() để hàng đợi
     chạy tiếp như chưa từng có lựa chọn. */
  function resolvePhanCong(action) {
    state.flags.guardAssign = action === 'phancong_ky_cuu' ? 'ky_cuu' : action === 'phancong_tre' ? 'tre' : 'deu';
    refreshHUD(); saveNow();
    nextLine();
  }
  function resolveCh23Choice(action) {
    state.flags.ch24Path = action === 'ch23_phat_huong' ? 'phat_huong' : 'giu_bi_mat';
    refreshHUD(); saveNow();
    nextLine();
  }
  /* Lựa chọn cuối cảnh kỳ ngộ ô 23 (B.9): choice là dòng CUỐI của
     SCENE_KY_NGO_BON_LOI nên nextLine() khép thoại sạch; cả hai lựa
     chọn cùng dẫn tới học bộ qua nguHanhLearn + toast lĩnh ngộ. */
  function resolveKyNgoChoice(action) {
    if (action === 'kyngo_bon_loi_nhan' || action === 'kyngo_bon_loi_doc') {
      var lr = L.nguHanhLearn(state, 'bon_loi_thiem_kich');
      if (lr && lr.ok) { sfxQuest(); toast('Kỳ ngộ! Ngươi lĩnh ngộ được bí pháp ' + ((L.TECHNIQUE_DEFS.bon_loi_thiem_kich || {}).name || 'Bôn Lôi Thiểm Kích') + ' từ trang tàn quyển trong hốc cây cháy!', 5200); }
      refreshHUD(); saveNow();
    }
    nextLine();
  }

  /* ---------- Phân tuyến lựa chọn arc_ ---------- */
  function resolveArcChoice(action) {
    if (action === 'arc_dai_retry') { say([]); startDaiFight(daiLastStage || 'nm1'); return; }
    if (action === 'arc_dai_leave') {
      say([]);
      var pre = state.flags.daiPre;
      var rx = pre ? pre.x : 62, ry = pre ? pre.y : 57;
      delete state.flags.daiPre;
      hhtTeleport('thanh_van_tong', rx, ry, 'up', null);
      return;
    }
    if (action === 'arc_dai_open_noi_mon') { say([]); arcEnterDaiRepeat('noi_mon'); return; }
    if (action === 'arc_dai_open_tinh_anh') { say([]); arcEnterDaiRepeat('tinh_anh'); return; }
    if (action === 'arc_dai_open_vo_dich') {
      say([]);
      // Đợt 2 B.8: hạng quán quân mở sau q18_chung_cu; recordWin ở
      // logic cũng tự khóa bằng openQuest — engine chỉ mở đường vào.
      if (L.questReached && L.questReached(state, 'q18_chung_cu')) { arcEnterDaiRepeat('vo_dich'); return; }
      toast('Bậc Quán quân đài chưa mở — hạng này mở sau trận đấu công khai với vô địch Đỗ gia ở Cô Châu (chương 18).', 3600);
      return;
    }
    if (action === 'arc_dai_open_leave') { say([]); return; }
    if (action === 'arc_craft_leave') { say([]); return; }
    if (action.indexOf('arc_craft:') === 0) {
      var id = action.slice('arc_craft:'.length);
      say([]);
      var r = L.arcIvCraftAtTangKinh(state, id);
      if (r && r.ok) { sfxQuest(); toast('Đã ghép thành bí pháp: ' + ((L.TECHNIQUE_DEFS[id] || {}).name || id) + '!', 4600); }
      else toast('Chưa ghép được bộ này lúc này: ' + ((r && r.reason) || 'chưa đủ điều kiện') + '.', 3600);
      refreshHUD(); saveNow();
      return;
    }
  }

  /* ---------- Vòng nhiễu quanh NHÂN VẬT khi cộng hưởng bị khóa (F.6) ---------- */
  function drawResJammingRing() {
    var cxp = px + 16, cyp = py + 16;
    for (var ai = 0; ai < 3; ai++) {
      ctx.strokeStyle = 'rgba(148,163,184,' + (0.65 - ai * 0.16).toFixed(3) + ')';
      ctx.lineWidth = 2.2 - ai * 0.4;
      ctx.beginPath(); ctx.arc(cxp, cyp, 25 + ai * 6, -tNow / (260 + ai * 90) + ai * 1.7, -tNow / (260 + ai * 90) + ai * 1.7 + Math.PI * 1.3); ctx.stroke();
    }
    if (fxOn() && Math.random() < 0.3) spawnParts(cxp + (Math.random() - 0.5) * 44, cyp + (Math.random() - 0.5) * 30, 1, '148,163,184', 6, true);
  }
  /* Linh Chi Sau Núi (chương 8): phục kích của Huyết Bạc Cung ngay sau khi
     hái. Cả ba đường đều qua được — đường CHẤN thiếu Tĩnh Mặc thì rơi về
     ẩn nấp, không khóa cứng; hái thành công mới đặt cờ chiGathered. */
  function touchLinhChi() {
    if (state.flags.chiGathered) {
      return say([{ who: 'narrate', text: 'Cụm Linh Chi Sau Núi đã được hái. Gốc rễ còn nằm trong khe đá ẩm — vài năm nữa mới lại có một cụm mới.' }]);
    }
    if (state.quest === 'q8_chuan_bi' && state.flags.chuanBiSeen) {
      return say(ST.SCENE_CHI_GATHER, function () { chiSpawnAmbushFig(); say(ST.SCENE_CHI_AMBUSH); }); // #20: bóng đen HIỆN HÌNH ở mép rừng ngay khi cảnh phục kích bắt đầu
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
        line = { who: 'narrate', text: 'Một đòn Chấn Âm nổ giữa rừng sau núi — bóng đen ôm tai loạng choạng, quay đầu bỏ chạy vào sâu trong rừng.' };
      } else {
        line = { who: 'narrate', text: 'Ngươi định phát một đòn Chấn Âm, nhưng Tĩnh Âm chưa đủ trong để khóa sóng cho một đòn như thế. Ngươi nén sóng lại, lăn người vào bóng cây — bóng đen vồ hụt vào khoảng trống, chém phải thân cây rồi biến mất.' };
      }
    } else if (action === 'chi_hide') {
      line = { who: 'narrate', text: 'Ngươi nín thở, ép mình vào sau thân cây lớn. Mười tám năm im lặng dạy ngươi cách biến mất giỏi hơn bất kỳ ai — bóng đen lùng sục một vòng rồi tan vào rừng.' };
    }
    if (!line) return;
    // #20: diễn đáp trả theo đúng nhịp atkStageResolve (chao đảo 0,25s → tháo chạy + khói 0,62s) CHẠY SONG SONG lời thoại gốc — không chặn luồng, không đổi kết cục.
    if (action === 'chi_hide') chiStageHide();
    else atkStageResolve(action === 'chi_sword' ? 'atk_sword' : 'atk_chan', function () {});
    say([line].concat(ST.SCENE_CHI_END), function () {
      /* Công thức Trúc Cơ Đan (chuẩn đã chốt): toán phục kích mang theo
         Yêu Đan cấp 1 — rơi CHẮC CHẮN trong chuyến hái linh chi này, để
         nguyên liệu của công thức luôn kiếm được ở đúng sức mạnh trước
         mốc Trúc Cơ (luật không tường). Cả hai món vào túi được mới tính
         là hái thành công; túi đầy thì chưa đặt cờ, quay lại hái tiếp. */
      var rb = L.bagAdd(state, 'linh_chi', 2);
      if (rb.ok) {
        var ry = L.bagAdd(state, 'yeu_dan_1', 1);
        if (ry.ok) {
          state.flags.chiGathered = true;
          toast('Đã hái Linh Chi Sau Núi ×2 và nhặt được Yêu Đan cấp 1 từ toán phục kích — mang về Thanh Vân Đại Điện cho trưởng lão tông.', 4200);
        } else {
          L.bagRemove(state, 'linh_chi', 2);
          toast(ry.reason + ' Linh chi vẫn còn ở sau núi — hãy dọn túi rồi quay lại hái.', 4400);
        }
      } else {
        toast(rb.reason + ' Linh chi vẫn còn ở sau núi — hãy dọn túi rồi quay lại hái.', 4400);
      }
      refreshHUD(); saveNow();
    });
  }
  /* Vườn dược sau núi (chương 8): hái Thanh Tâm Thảo cho công thức Trúc Cơ
     Đan — đủ ba cây trong giai đoạn chuẩn bị, sau khi đã nghe điều kiện. */
  function touchVuonDuoc() {
    if (state.flags.herbGathered) {
      return say([{ who: 'narrate', text: 'Vườn dược sau núi: luống Thanh Tâm Thảo đã hái đủ phần của kỳ này. Mấy cây còn lại còn non — để chúng lớn, vườn dược của tông không hái tận gốc.' }]);
    }
    if (state.quest === 'q8_chuan_bi' && state.flags.chuanBiSeen) {
      var rb = L.bagAdd(state, 'thanh_tam_thao', 3);
      if (!rb.ok) { toast(rb.reason + ' Hãy dọn túi rồi quay lại vườn dược.', 4200); return; }
      state.flags.herbGathered = true;
      sfxPage();
      toast('Đã hái Thanh Tâm Thảo ×3 ở vườn dược sau núi — nguyên liệu của Trúc Cơ Đan.', 3800);
      return say([{ who: 'narrate', text: 'Luống Thanh Tâm Thảo xanh mướt sau bãi trống. Ngươi hái đúng ba cây đủ tuổi, lá còn đọng sương — vị thuốc thứ ba trong công thức của trưởng lão đã có.' }], function () { refreshHUD(); saveNow(); });
    }
    return say([{ who: 'narrate', text: 'Vườn dược của tông sau núi: từng luống thảo dược xếp ngay ngắn, thơm ngát. Đừng hái bừa khi chưa biết mình cần gì — dược liệu hái sai lúc là phí của trời.' }]);
  }
  /* Luyện Trúc Cơ Đan theo công thức đã chốt (Linh Chi Sau Núi ×1 + Yêu
     Đan cấp 1 ×1 + Thanh Tâm Thảo ×3 + 30 Linh Thạch) tại trưởng lão tông.
     Thiếu món nào, trưởng lão nói rõ món đó và nơi lấy. Luyện lại (đan
     trước đã nuốt hụt/mất) theo cùng công thức hoặc 60 điểm cống hiến —
     phần khung độ kiếp hỏng sẽ nối vào cùng đường luyện lại này. */
  var PILL_MISS_LINES = {
    linh_chi: { who: 'truong_lao_tong', text: 'Linh Chi Sau Núi còn thiếu. Bãi trống sau núi phía đông bắc tông — hái một cây tươi, nguyên linh quang, mang về đây.' },
    yeu_dan_1: { who: 'truong_lao_tong', text: 'Yêu Đan cấp 1 còn thiếu. Viên đan ấy rơi ra từ toán phục kích ở sau núi trong chuyến hái linh chi của ngươi — kiểm lại hành trang đi; nếu thật sự không còn, quay lại sau núi mà tìm cho ra.' },
    thanh_tam_thao: { who: 'truong_lao_tong', text: 'Thanh Tâm Thảo còn thiếu. Vườn dược sau núi nằm ngay cạnh bãi trống ngươi hái linh chi, ở phía đông bãi — quay lại đó, hái cho đủ ba cây rồi về.' },
    linh_thach: { who: 'truong_lao_tong', text: 'Công luyện 30 Linh Thạch còn thiếu. Linh Thạch kiếm được từ việc tông môn, thưởng của tông và những việc ngươi làm cho người ta — gom đủ rồi quay lại, ta luyện ngay.' }
  };
  function pillMissing() {
    var miss = [];
    if (!L.bagHas(state, 'linh_chi')) miss.push('linh_chi');
    if (!L.bagHas(state, 'yeu_dan_1')) miss.push('yeu_dan_1');
    if (L.bagCount(state, 'thanh_tam_thao') < 3) miss.push('thanh_tam_thao');
    if (L.linhBalance(state) < 30) miss.push('linh_thach');
    return miss;
  }
  function refineTrucCoDan(isAgain) {
    var miss = pillMissing();
    if (miss.length) {
      var lines = isAgain ? [{ who: 'truong_lao_tong', text: 'Luyện lại cũng theo đúng công thức cũ, không bớt một thứ. Ngươi còn thiếu — nghe cho rõ:' }] : ST.SCENE_CHUAN_BI_2.slice();
      miss.forEach(function (k) { lines.push(PILL_MISS_LINES[k]); });
      return say(lines);
    }
    var can = L.bagCanAdd(state, 'truc_co_dan', 1);
    if (!can.ok) { toast(can.reason + ' Hãy dọn túi rồi quay lại gặp trưởng lão.', 4200); return; }
    say(ST.SCENE_CHUAN_BI_2_OK, function () {
      L.bagRemove(state, 'linh_chi', 1);
      L.bagRemove(state, 'yeu_dan_1', 1);
      L.bagRemove(state, 'thanh_tam_thao', 3);
      var sp = L.spendLinhThach(state, 30);
      var rb = L.bagAdd(state, 'truc_co_dan', 1);
      if (!rb.ok || !sp.ok) { toast('Lò đan gặp trục trặc — nguyên liệu đã được hoàn lại, hãy thử lại.', 4200); refreshHUD(); saveNow(); return; }
      sfxQuest();
      // Trưởng lão tặng đúng 1 viên Hộ Thể Đan DUY NHẤT (docs/realm-
      // prep/ mục 5.1 + 7.2) tại thời khắc luyện đan Trúc Cơ thành
      // công — dù là lần luyện đầu hay một lần luyện lại khi người
      // chơi chưa từng nhận quà này. Lời nhắn đi kèm mở màn cho thiên
      // kiếp 3 đạo của mốc chương 8.
      var giftedNow = false;
      if (!state.flags.hoTheDanGifted && L.bagCanAdd(state, 'ho_the_dan', 1).ok) {
        var rg = L.bagAdd(state, 'ho_the_dan', 1);
        if (rg.ok) { state.flags.hoTheDanGifted = true; giftedNow = true; }
      }
      if (!isAgain) {
        state.flags.pillGranted = true;
        state.quest = 'q8_ho_phap';
        toast('Trưởng lão đã luyện xong Trúc Cơ Đan theo đúng công thức. Lên Đài Trúc Cơ ở phía bắc tông để bắt đầu vận công.', 4400);
      } else {
        toast('Đã luyện lại Trúc Cơ Đan theo công thức. Viên đan trước mất thế nào, viên này bù lại thế ấy.', 4200);
      }
      refreshHUD(); saveNow();
      if (giftedNow) say([{ who: 'truong_lao_tong', text: 'Khoan đã — cầm thêm viên Hộ Thể Đan này. Trúc Cơ không còn là chuyện nuốt đan rồi ngồi chờ: trên đài sẽ có ba đạo lôi giáng xuống, đạo sau nặng hơn đạo trước. Viên đan này nuốt vào giữa kiếp sẽ chắn cho ngươi sáu phần sát thương của một đạo. Ta chỉ tặng một viên duy nhất — thiếu thì xuống hiệu thuốc trong thành mà mua, hai mươi lăm Linh Thạch một viên.' }]);
    });
  }
  /* ---------- Phần 3, chương 9: Thung Lũng Hồi Phong ---------- */
  function touchVetTichHb() {
    if (state.quest === 'q9_truy_vet') {
      return say(ST.SCENE_CH9_TRUY_VET, function () {
        addTuvi(60);
        state.quest = 'q9_phuc_kich'; refreshHUD(); saveNow();
        toast('Dấu vết đã rõ: lần theo đường ven suối vào hẻm núi giữa thung lũng (điểm gợi ý ở giữa hẻm).', 4200);
      });
    }
    if (state.quest === 'q9_doi_dau') {
      if (state.flags.ch9BreakReady) {
        if (state.tuvi >= (L.REALMS[state.realm].tuviNext || 0)) return doCh9Breakthrough();
        return say([{ who: 'narrate', text: 'Việc ở thung lũng đã xong, nhưng tu vi của ngươi chưa đầy Trúc Cơ Trung Kỳ. Điểm thổ nạp ở bờ bắc suối — ngay phía bắc điểm qua suối — đang chờ. Đầy rồi, quay lại gốc anh đào này.' }]);
      }
      if (!state.flags.ch9DoiDau) return startDoiDau();
      return say([{ who: 'narrate', text: 'Dưới gốc anh đào, miếng Song Ngư Ngọc Bội vẫn nằm yên trong tay ngươi. Hoa rụng từng cánh xuống mặt ngọc đã nứt.' }]);
    }
    if (!state.flags.ch9TinDu) {
      return say([{ who: 'narrate', text: 'Một cây anh đào cổ thụ ở cửa Thung Lũng Hồi Phong, hoa nở trái mùa quanh năm. Người của thung lũng bảo cây này có trước cả Thanh Vân Tông.' }]);
    }
    return say([{ who: 'narrate', text: 'Dưới gốc anh đào còn vệt máu khô, đoạn dây bị cắt và mũi tên gãy khắc vệt đỏ — dấu vết của một trận phục kích được bày sẵn từ nhiều ngày.' }]);
  }
  /* Cảnh phục kích chương 9 nổ khi người chơi tới điểm giữa hẻm núi (vùng
     sự kiện trong checkPortalsAndZones) — hàm này chỉ mở cảnh + điểm chọn. */
  function startCh9Ambush() {
    var ph = L.dayPhaseAt ? L.dayPhaseAt(state.dayMinutes) : { night: 0 };
    var lead = ph && ph.night > 0.5
      ? { who: 'narrate', text: 'Trời đã tối hẳn. Đèn đá hai bên hẻm cháy leo lét — và chính trong ánh sáng leo lét ấy, bãi trống phía dưới hiện ra rõ hơn cả ban ngày.' }
      : { who: 'narrate', text: 'Nắng chiều xiên qua miệng hẻm, rọi thẳng xuống bãi trống phía dưới.' };
    say([lead].concat(ST.SCENE_CH9_PHUC_KICH));
  }
  function resolveCh9Choice(action) {
    if (action === 'ch9_say') {
      L.recordSpeech(state, 9, 'ch9_phuc_kich_cuu_nguoi', 'doan_hua_va_huyet_bac');
      state.flags.ch9SayRescue = true;
      sfxChan(); shakeT = Math.max(shakeT, 0.7);
      rings.push({ x: px + 16, y: py + 16, r: 10, a: 0.95 });
      spawnParts(px + 16, py + 16, 14, '200,200,210', 34, false);
      return say(ST.SCENE_CH9_SAY_RESCUE, function () { afterCh9Rescue(); });
    }
    if (action === 'ch9_silent') {
      state.flags.ch9SilentRoute = true;
      return say(ST.SCENE_CH9_SILENT_ROUTE, function () { afterCh9Rescue(); });
    }
  }
  function afterCh9Rescue() {
    addTuvi(80);
    say(ST.SCENE_CH9_UNHAN_ACT, function () {
      state.quest = 'q9_doi_dau'; refreshHUD(); saveNow();
      toast('Đoàn xe đã an toàn. Quay lại gốc anh đào cổ thụ ở bãi đáp — có người đang chờ ngươi ở đó.', 4400);
    });
  }
  function startDoiDau() {
    if (state.flags.ch9SilentRoute) {
      return say(ST.SCENE_CH9_DOI_DAU.slice(0, 8), function () {
        say(ST.SCENE_CH9_DOI_DAU_SAY, function () {
          L.recordSpeech(state, 9, 'ch9_doi_dau', 'mo_cuu_u_va_doan_hua');
          say(ST.SCENE_CH9_DOI_DAU.slice(8), function () { finishDoiDau(); });
        });
      });
    }
    return say(ST.SCENE_CH9_DOI_DAU, function () { finishDoiDau(); });
  }
  function finishDoiDau() {
    state.flags.ch9DoiDau = true;
    if (state.unlocked.indexOf('song_ngu') < 0) state.unlocked.push('song_ngu');
    addTuvi(120);
    toast('Đã nhận vật phẩm cốt truyện: Song Ngư Ngọc Bội — xem trong Túi Trữ Vật, ngăn vật phẩm cốt truyện.', 4400);
    say(ST.SCENE_CH9_HON_DAU, function () {
      state.flags.ch9HonDau = true;
      say(ST.SCENE_CH9_END, function () {
        if (state.tuvi >= (L.REALMS[state.realm].tuviNext || 0)) return doCh9Breakthrough();
        state.flags.ch9BreakReady = true;
        refreshHUD(); saveNow();
        toast('Mọi việc ở thung lũng đã xong. Chỉ còn tu vi chưa đầy Trúc Cơ Trung Kỳ — thổ nạp ở bờ bắc suối của thung lũng, rồi quay lại gốc anh đào.', 5000);
      });
    });
  }
  function doCh9Breakthrough() {
    var r = L.tryBreakthrough(state);
    if (!r.ok) { toast(r.reason); return; }
    sfxBigBell();
    pillarT = 2.2;
    spawnParts(px + 16, py + 24, 32, '255,232,160', 32, true);
    rings.push({ x: px + 16, y: py + 16, r: 8, a: 0.95 });
    state.flags.hbDone = true;
    state.flags.ch9BreakReady = false;
    if (!state.flags.ch9Reward) { state.flags.ch9Reward = true; L.addLinhThach(state, 30); setTimeout(function () { toast('Thưởng của tông cho chuyến đi thung lũng: +30 Linh Thạch.', 4200); }, 600); } // cộng qua addLinhThach — điểm cộng ví trung tâm (đợt mở rộng bảng nhân vật)
    say([{ who: 'narrate', text: 'Dưới gốc anh đào cổ thụ, chu thiên cuối cùng khép lại. Hoa rụng xuống vai ngươi từng cánh — Trúc Cơ Trung Kỳ. Từ thung lũng này nhìn về phía Cô Châu Thành, có một tòa lầu đang chờ ngươi tới.' }], function () {
      state.quest = 'q10_loi_moi'; refreshHUD(); saveNow();
      toast('Hoàn thành chương 9: Tin dữ từ Thung Lũng Hồi Phong. Đột phá thành công: ' + r.label + '!', 4800);
    });
    refreshHUD();
  }
  /* ---------- Phần 3, chương 10: lộ thân phận + đột phá Hậu Kỳ ---------- */
  function resolveCh10Choice(action) {
    if (action === 'ch10_tu_lo') {
      return say(ST.SCENE_CH10_TU_LO, function () {
        state.flags.soulPublic = true;
        state.flags.soulRevealed = true;
        state.soulRank = 3;
        state.soulPower = (state.soulPower || 0) + 30;
        if (state.unlocked.indexOf('thien_co_gian') < 0) state.unlocked.push('thien_co_gian');
        L.recordSpeech(state, 10, 'ch10_tu_noi_ra', 'thien_co_lau');
        addTuvi(120);
        state.flags.ch10BreakReady = true;
        refreshHUD(); saveNow();
        toast('Đã nhận vật phẩm cốt truyện: Thiên Cơ Ngọc Giản. Thân phận Hồn Sư từ nay công khai theo cách của chính ngươi. Tu vi còn thiếu một đoạn cuối — thổ nạp ở sân sau Tĩnh Quan Lâu, rồi gặp lại Bạch Kính Đường.', 5200);
      });
    }
    if (action === 'ch10_im_lang') {
      // Đường B: trong lầu chỉ giữ im lặng và rời đi (BI_LO_1). Việc bị lộ
      // xảy ra SAU, bằng tin đồn ở chợ Cô Châu Thành (BI_LO_2 — vùng sự
      // kiện trong checkPortalsAndZones), đúng thiết kế hai nhịp.
      return say(ST.SCENE_CH10_BI_LO_1, function () {
        state.flags.ch10RumorPending = true;
        refreshHUD(); saveNow();
      });
    }
  }
  function finishCh10Break() {
    var cap = L.REALMS[state.realm].tuviNext;
    if (cap && state.tuvi < cap) {
      return say([{ who: 'bach_kinh_duong', text: 'Cậu còn thiếu một đoạn tu vi cuối cho mốc Hậu Kỳ. Sân sau của lầu có một nền đá tụ linh khí — ra đó ngồi một lát. Đột phá ngay trong lầu này cũng được: ở đây, không ai ghi chép việc đột phá của cậu đâu.' }]);
    }
    var r = L.tryBreakthrough(state);
    if (!r.ok) { toast(r.reason); return; }
    state.flags.ch10BreakReady = false;
    sfxBigBell();
    pillarT = 2.2;
    spawnParts(px + 16, py + 24, 32, '255,232,160', 32, true);
    rings.push({ x: px + 16, y: py + 16, r: 8, a: 0.95 });
    say(state.flags.soulPublic ? ST.SCENE_CH10_END_A : ST.SCENE_CH10_END_B, function () {
      if (state.flags.soulPublic && !state.flags.thienCoFeePaid) {
        var rf = L.addLinhThach(state, 50);
        if (rf.ok) { state.flags.thienCoFeePaid = true; toast('Thiên Cơ Các trả phí hợp tác: +50 Linh Thạch (số dư: ' + L.fmtNum(rf.balance) + ').', 4200); }
      }
      state.quest = 'q11_he_qua'; refreshHUD(); saveNow();
      toast('Hoàn thành chương 10: Tĩnh Quan Lâu. Đột phá thành công: ' + r.label + '!', 4800);
    });
    refreshHUD();
  }
  /* ---------- Phần 3, chương 11: Viên Mãn + vật dẫn Kết Đan ---------- */
  function finishVienMan() {
    var r = L.tryBreakthrough(state);
    if (!r.ok) { toast(r.reason); return; }
    sfxBigBell();
    pillarT = 2.2;
    spawnParts(px + 16, py + 24, 32, '255,232,160', 32, true);
    rings.push({ x: px + 16, y: py + 16, r: 8, a: 0.95 });
    say(ST.SCENE_CH11_VIEN_MAN, function () {
      state.quest = 'q11_vat_dan'; refreshHUD(); saveNow();
      toast('Đột phá thành công: ' + r.label + '! Giờ mang dược dẫn và Yêu Đan cấp 2 về đại điện để luyện vật dẫn Kết Đan.', 4800);
    });
    refreshHUD();
  }
  var KD_MISS_LINES = {
    duoc: { who: 'truong_lao_tong', text: 'Vật dẫn chưa luyện được: ngươi còn thiếu dược dẫn. Qua cổng sau núi vào Thung Lũng Hồi Phong, tới bãi trống phía bắc thung lũng — cụm dược dẫn mọc quanh vòng đá cũ ở rìa đông bãi.' },
    yeu: { who: 'truong_lao_tong', text: 'Vật dẫn chưa luyện được: còn thiếu Yêu Đan cấp 2 làm tim đan. Con yêu thú giữ cụm dược dẫn ở bãi bắc thung lũng mang theo nó — muốn có đan, phải thắng con thú ấy.' }
  };
  function refineKetDanDan() {
    if (state.flags.ketDanRefined) {
      return say([{ who: 'truong_lao_tong', text: 'Vật dẫn đã luyện xong và đang nằm trong túi ngươi. Giữ cho kỹ — ngày lên đài, ta cho người báo.' }]);
    }
    var miss = [];
    if (!L.bagHas(state, 'ket_dan_duoc')) miss.push(KD_MISS_LINES.duoc);
    if (!L.bagHas(state, 'yeu_dan_2')) miss.push(KD_MISS_LINES.yeu);
    if (miss.length) return say(miss);
    var can = L.bagCanAdd(state, 'ket_dan_dan', 1);
    if (!can.ok) { toast(can.reason + ' Hãy dọn túi rồi quay lại gặp trưởng lão.', 4200); return; }
    return say(ST.SCENE_CH11_VAT_DAN);
  }
  function resolveKdFee(action) {
    if (action === 'kd_pay') {
      var sp = L.spendLinhThach(state, 120);
      if (!sp.ok) { toast(sp.reason + ' Hãy gom đủ Linh Thạch, hoặc chọn đường hái thêm dược dẫn.', 4400); say(ST.SCENE_CH11_VAT_DAN); return; }
      return finishRefineKetDan();
    }
    if (action === 'kd_herb_fee') {
      if (L.bagCount(state, 'ket_dan_duoc') < 3) {
        toast('Muốn thay công luyện bằng dược dẫn thì cần thêm hai phần dược nữa (hiện có ' + L.bagCount(state, 'ket_dan_duoc') + '/3 phần) — quay lại cụm dược ở bãi bắc thung lũng mà hái thêm.', 4800);
        say(ST.SCENE_CH11_VAT_DAN);
        return;
      }
      L.bagRemove(state, 'ket_dan_duoc', 2);
      return finishRefineKetDan();
    }
  }
  function finishRefineKetDan() {
    L.bagRemove(state, 'ket_dan_duoc', 1);
    L.bagRemove(state, 'yeu_dan_2', 1);
    var rb = L.bagAdd(state, 'ket_dan_dan', 1);
    if (!rb.ok) { toast(rb.reason); refreshHUD(); saveNow(); return; }
    state.flags.ketDanRefined = true;
    sfxQuest();
    addTuvi(100);
    say(ST.SCENE_CH11_VAT_DAN_DONE, function () {
      state.quest = 'q12_len_dai'; refreshHUD(); saveNow();
      toast('Đã luyện thành vật dẫn Kết Đan. Chương cuối của phần này bắt đầu: lên Đài Trúc Cơ.', 4600);
    });
  }
  function touchDuocDan() {
    if (!state.flags.ketDanCoreGot) {
      return say([{ who: 'narrate', text: 'Quanh vòng đá cũ là một cụm cây lá tím sẫm có vân vàng — dược liệu lạ của thung lũng. Chưa biết nó dùng vào việc gì, đừng hái bừa.' }]);
    }
    if (!state.flags.ketDanHerb) {
      var canD = L.bagCanAdd(state, 'ket_dan_duoc', 1);
      var canY = L.bagCanAdd(state, 'yeu_dan_2', 1);
      if (!canD.ok || !canY.ok) { toast('Túi trữ vật đã đầy — hãy dọn túi rồi quay lại cụm dược.', 4200); return; }
      state.flags.kdBeastWave = 1;
      kdSpawnBeast(); // #21 đợt 1: thú bước ra trong bụi đất + khói, gầm và lao 1 nhịp ngay khi dòng dẫn đợt 1 hiện
      return say(ST.SCENE_CH11_DUOC, function () { say(ST.SCENE_CH11_DUOC_FIGHT); });
    }
    if ((state.quest === 'q11_chuan_bi_ket_dan' || state.quest === 'q11_vat_dan') && (state.flags.ketDanCoreExtra || 0) < 2) {
      var rb2 = L.bagAdd(state, 'ket_dan_duoc', 1);
      if (!rb2.ok) { toast(rb2.reason, 3800); return; }
      state.flags.ketDanCoreExtra = (state.flags.ketDanCoreExtra || 0) + 1;
      sfxPage();
      return say([{ who: 'narrate', text: 'Ngươi hái thêm một phần dược dẫn nữa, gói riêng cẩn thận. Đan phòng của tông đang cần thứ này — hai phần thêm là đủ thay công luyện vật dẫn.' }], function () {
        toast('Đã hái thêm dược dẫn Kết Đan (' + (state.flags.ketDanCoreExtra + 1) + '/3 phần tính cả phần luyện).', 3800);
        refreshHUD(); saveNow();
      });
    }
    return say([{ who: 'narrate', text: 'Cụm dược dẫn đã hái đủ phần. Mấy cây còn lại còn non — để chúng lớn, thung lũng này không hái tận gốc.' }]);
  }
  var KD_BEAST_LINES = {
    1: { who: 'narrate', text: 'Đợt đầu: con thú lao thẳng vào, bờm đá quật nát một mảng cỏ. Ngươi lùi khỏi vòng đá, giữ khoảng cách — nó vẫn chưa tung hết sức.' },
    2: { who: 'narrate', text: 'Đợt hai: con thú gầm lên, mắt đỏ rực, lao tới nhanh gấp đôi. Đây là đợt cuối của nó — và cũng là đợt mạnh nhất.' }
  };
  function resolveKdBeast(action) {
    var wave = state.flags.kdBeastWave || 1;
    var line = null;
    if (action === 'kd_sword') {
      var rs = L.castSword(state);
      if (!rs.ok) { toast(rs.reason); say(ST.SCENE_CH11_DUOC_FIGHT); return; }
      sfxSword();
      spawnParts(px + 16, py + 16, 8, '190,235,200', 26, false);
      addFloat(px + 16, py - 20, 'KIẾM!', '190,235,200');
      line = { who: 'narrate', text: 'Thất Tinh Kiếm Quyết chém trúng bờm đá — tia lửa tóe ra, con thú loạng choạng lùi một bước.' };
    } else if (action === 'kd_chan') {
      var rw = L.castWord(state, 'chan');
      if (!rw.ok) { toast(rw.reason + ' Hãy chọn cách khác cho đợt này.'); say(ST.SCENE_CH11_DUOC_FIGHT); return; }
      sfxChan(); shakeT = Math.max(shakeT, 0.5);
      rings.push({ x: px + 16, y: py + 16, r: 10, a: 0.95 });
      addFloat(px + 16, py - 20, 'CHẤN!', '150,200,255');
      L.recordSpeech(state, 11, 'chan-giu-duoc-hoi-phong-dot-' + wave, 'hoi-phong');
      line = { who: 'narrate', text: 'Một đòn Chấn Âm nổ giữa bãi bắc — con thú ôm đầu gầm lên đau đớn, bước chân rối loạn.' };
    } else if (action === 'kd_hold') {
      state.silence = L.silenceGain('meditate', 2, state.silence, state);
      line = { who: 'narrate', text: 'Ngươi lùi về sau vòng đá, giữ thế và dồn Tĩnh Âm. Con thú gầm gừ vòng quanh, chưa dám lao vào lần nữa.' };
    }
    if (!line) return;
    if (wave < 2) {
      state.flags.kdBeastWave = wave + 1;
      kdBeastWave2Fx(); // #22 đợt 2: mắt đỏ nhấp nháy nhanh dần + gầm dài + lao hai nhịp gấp đôi + vệt quật đôi + shakeWorld(0,6)
      // KD_BEAST_LINES chỉ là câu dẫn đợt kế; điểm lựa chọn của đợt sau lấy
      // lại đúng đối tượng lựa chọn trong cảnh trận (phần tử thứ hai của
      // SCENE_CH11_DUOC_FIGHT) để người chơi chọn tiếp mà không lặp cảnh.
      say([line, KD_BEAST_LINES[wave], ST.SCENE_CH11_DUOC_FIGHT[1]], function () { refreshHUD(); saveNow(); });
      return;
    }
    state.flags.kdBeastWave = 0;
    kdBeastCollapse(); // #21+#22 kết: hình thú gục bằng khung chết + mờ dần + hạt đất lắng, chạy song song cảnh SCENE_CH11_DUOC_END gốc
    say([line].concat(ST.SCENE_CH11_DUOC_END), function () {
      var rb = L.bagAdd(state, 'ket_dan_duoc', 1);
      var ry = rb.ok ? L.bagAdd(state, 'yeu_dan_2', 1) : { ok: false };
      if (!rb.ok || !ry.ok) {
        if (rb.ok) L.bagRemove(state, 'ket_dan_duoc', 1);
        toast('Túi trữ vật đã đầy — con thú đã rút lui vào rừng sâu. Hãy dọn túi rồi quay lại cụm dược.', 4600);
        refreshHUD(); saveNow();
        return;
      }
      state.flags.ketDanHerb = true;
      addTuvi(100);
      toast('Đã hái dược dẫn Kết Đan và lấy được Yêu Đan cấp 2 từ con thú giữ dược.', 4400);
      refreshHUD(); saveNow();
    });
  }
  /* ---------- Phần 3, chương 12: hộ pháp Kết Đan + Kết Đan + LỆNH ---------- */
  function startKdGuard() {
    sfxWind();
    if ((state.flags.ketDanGuardBroken || 0) > 0) {
      state.flags.ketDanGuardWave = 1;
      say(ST.SCENE_KDGUARD1);
      return;
    }
    sfxBell();
    say(ST.SCENE_CH12_GUARD_INTRO, function () {
      state.flags.ketDanGuardWave = 1;
      say(ST.SCENE_KDGUARD1);
      refreshHUD(); saveNow();
    });
  }
  function resolveKdGuard(action) {
    if (action === 'kdguard_voice') {
      return say([{ who: 'narrate', text: 'Một lần phát hưởng xé toang chu thiên đang vận hành. Kim đan chưa thành hình đã rung lên dữ dội rồi lặng xuống — vận công vỡ giữa chừng. May là vật dẫn vẫn còn nguyên trong tay ngươi: chưa nuốt, chưa mất gì. Hít một hơi. Làm lại từ đầu.' }], function () {
        state.flags.ketDanGuardBroken = (state.flags.ketDanGuardBroken || 0) + 1;
        state.flags.ketDanGuardWave = 0;
        refreshHUD(); saveNow();
        toast('Vận công Kết Đan đã vỡ vì một lần phát hưởng. Hãy tương tác lại Đài Trúc Cơ để vận công lại từ đầu — vật dẫn Kết Đan vẫn còn nguyên.', 4600);
      });
    }
    var wave = state.flags.ketDanGuardWave || 1;
    var line = null;
    if (action === 'kdguard_dong') {
      spawnParts(px + 52, py + 16, 10, '255,210,140', 30, false);
      line = { who: 'narrate', text: 'Phía đông đài, Hứa U Nhàn dẫn người giương đuốc chặn đường — bóng địch bị ánh lửa ép lui khỏi thềm đá, như đúng vị trí nàng đã giữ ở kỳ Trúc Cơ.' };
    } else if (action === 'kdguard_hoa') {
      sfxSword();
      spawnParts(px + 16, py + 16, 8, '190,235,200', 26, false);
      line = { who: 'narrate', text: 'Hoa Hướng Thần rút kiếm đứng chắn trước đài — kiếm quang của đại đệ tử quét một vòng, đợt địch bị chém lui không còn một bóng.' };
    } else if (action === 'kdguard_tam') {
      rings.push({ x: px + 16, y: py + 16, r: 6, a: 0.9 });
      line = { who: 'narrate', text: 'Liễu Khuynh Tiên ngồi xuống phía sau đài, tiếng đàn trầm giữ nhịp hơi thở cho ngươi — tâm cảnh vững như mặt hồ, đợt địch tan dần trong tiếng đàn.' };
    }
    if (!line) return;
    if (wave < 3) {
      state.flags.ketDanGuardWave = wave + 1;
      say([line].concat(ST['SCENE_KDGUARD' + (wave + 1)]), function () { refreshHUD(); saveNow(); });
    } else {
      state.flags.ketDanGuardWave = 0;
      say([line].concat(ST.SCENE_KDGUARD_END), function () {
        state.flags.ketDanGuardDone = true;
        state.quest = 'q12_ket_dan';
        refreshHUD(); saveNow();
        toast('Hộ pháp Kết Đan đã xong ba đợt mà không một lần phát hưởng. Giờ là tâm ma — và khoảnh khắc quyết định.', 4200);
      });
    }
  }
  var KD_TAMMA_CHOICE = {
    who: 'choice', text: 'Mảng đá đang rơi. Ngươi sẽ…',
    options: [
      { label: 'Phát hưởng — giữ mảng đá lại, cứu người giữ đài', action: 'ketdan_say' },
      { label: 'Không phát hưởng tới cùng — để đan trọn vẹn', action: 'ketdan_silent' }
    ]
  };
  function resolveKetDanChoice(action) {
    if (action === 'ketdan_say') {
      state.flags.ketDanSpokeSave = true;
      L.recordSpeech(state, 12, 'ch12_ket_dan_cuu_nguoi', 'toan_bo_ho_phap');
      sfxChan(); shakeT = Math.max(shakeT, 0.6);
      return say(ST.SCENE_CH12_TAMMA_SAY, function () { doKetDan(); });
    }
    if (action === 'ketdan_silent') {
      return say(ST.SCENE_CH12_TAMMA_SILENT, function () { doKetDan(); });
    }
  }
  /* Kết Đan (chương 12): sao khuôn đột phá Trúc Cơ — kiểm điều kiện theo
     đúng thứ tự, vật dẫn chỉ bị trừ khi mọi điều kiện đã đủ và lần đột phá
     thành công; hụt thì hoàn lại vật dẫn. */
  function doKetDan() {
    if (state.realm >= 3) return say([{ who: 'narrate', text: 'Ngươi đã là tu sĩ Kim Đan. Đài đá dưới chân vẫn còn ấm dư âm của ngày Kết Đan.' }]);
    if (!(state.realm === 2 && state.stage === 3)) return say([{ who: 'narrate', text: 'Ngươi chưa tới Trúc Cơ Viên Mãn — chưa thể nghĩ tới Kết Đan. Hãy tu luyện tiếp cho tới khi viên mãn hẳn.' }]);
    var cap = L.REALMS[state.realm].tuviNext;
    if (cap && state.tuvi < cap) {
      toast('Tu vi hiện tại: ' + Math.floor(state.tuvi) + '/' + cap + '.', 3600);
      return say([{ who: 'narrate', text: 'Tu vi chưa đầy. Hãy thổ nạp ở điểm linh khí của tông, hoặc bờ suối Thung Lũng Hồi Phong, cho đầy hẳn rồi quay lại đài.' }]);
    }
    if (state.flags.ketDanGuardDone !== true) return say([{ who: 'narrate', text: 'Vòng hộ pháp quanh đài chưa qua đủ ba đợt sóng gió. Hãy vận công lại từ đầu — địch sẽ tới, và ngươi phải không phát hưởng cho tới khi chúng rút.' }]);
    if (!L.bagHas(state, 'ket_dan_dan')) return say([{ who: 'narrate', text: 'Ngươi chưa có vật dẫn Kết Đan trong túi. Về Thanh Vân Đại Điện gặp trưởng lão tông — vật dẫn phải được luyện ở đó.' }]);
    var rm = L.bagRemove(state, 'ket_dan_dan', 1);
    if (!rm.ok) { toast(rm.reason); return; }
    // THIÊN KIẾP KIM ĐAN 5 ĐẠO (docs/realm-prep/ mục 8, sửa đổi 4.5
    // cho part3-design): vật dẫn đã nuốt — vào sự kiện độ kiếp trước,
    // qua hết 5 đạo mới gọi tryBreakthrough. Mức giảm hộ pháp suy từ
    // flags.ketDanGuardBroken ở tribGuardCutNow (trọn vẹn −20%, từng
    // vỡ −10%). Bậc Hưởng mở BỞI lần đột phá này nên đối hưởng trong
    // sự kiện chỉ dùng được Phá Âm/Chấn Âm như thiết kế đã chốt.
    startTribulation({
      targetRealm: 3, catalystId: 'ket_dan_dan', chapter: 12,
      onSuccess: function (fireAnnounce) {
        var r = L.tryBreakthrough(state);
        if (!r.ok) {
          L.bagAdd(state, 'ket_dan_dan', 1);
          toast(r.reason);
          refreshHUD(); saveNow();
          return;
        }
        sfxBigBell();
        pillarT = 3.5;
        spawnParts(px + 16, py + 24, 48, '255,232,160', 36, true);
        rings.push({ x: px + 16, y: py + 16, r: 8, a: 0.95 });
        rings.push({ x: px + 16, y: py + 16, r: 3, a: 0.85 });
        shakeT = Math.max(shakeT, 0.9);
        L.recordSpeech(state, 12, 'loi-dau-o-kim-dan', 'thanh-van-tong');
        say(ST.SCENE_CH12_KET_DAN, function () {
          state.quest = 'q12_lenh_dau_tien';
          fireAnnounce(); // tuyên cáo Thiên Đạo (mục 9)
          refreshHUD(); saveNow();
          toast('Kết Đan thành công: ' + r.label + '! Vạn Âm Cộng Hưởng đã thành bậc Hưởng — thử chiêu Định Âm (phím 4) vào tấm bia mới ở chân đài.', 5200);
        });
        refreshHUD();
      }
    });
    refreshHUD();
  }
  /* LỆNH — bậc cao của Ngôn Linh (phần 3, chương 12): ĐỊNH giữ một nhịp,
     PHONG khóa hai nhịp trong các trận về sau; ở sự kiện dạy lệnh tại đài,
     uy lực phải đạt ngưỡng của trưởng lão mới tính là chạm được bậc lệnh. */
  /* ARCIV đợt 2 ch.17 (B.7): Định Âm giữ thước pha lê lớn ở thap_noi.
     Vùng gần thước: x 16..23, y 6..10. Ngưỡng uy lực 140 (khuôn chương
     12: không đạt thì tích Tĩnh Âm rồi thử lại, đòn vẫn trừ, không
     khóa cứng). Thành công: vòng tĩnh + bụi đứng yên quanh thước tại
     tâm (20,4), tiếng Định qua castResonanceFx, cảnh DO_LAI_XONG. */
  function arcRulerDinh() {
    var pt = playerTile();
    if (!(pt.x >= 16 && pt.x <= 23 && pt.y >= 6 && pt.y <= 10)) {
      toast('Thước pha lê ở phía bắc sảnh — hãy đứng gần thước (vùng x 16–23, y 6–10) rồi mới dùng Định Âm giữ nó.', 4200);
      return;
    }
    var beforeR = state.silence;
    var r = L.castWord(state, 'dinh');
    if (!r.ok) { toast(r.reason); return; }
    startResBody(false);
    var rx = 20 * TILE + 16, ry = 4 * TILE + 16;
    castResonanceFx('dinh', rx, ry, { silenceBefore: beforeR, baseFreq: 220, noWave: true });
    addFloat(px + 16, py - 20, 'ĐỊNH!', '170,220,255');
    if (r.power >= 140) {
      state.flags.q17RulerShaking = false;
      rings.push({ x: rx, y: ry, r: 10, a: 0.95 });
      rings.push({ x: rx, y: ry, r: 4, a: 0.8 });
      spawnParts(rx, ry, 16, '200,230,255', 20, true); // bụi quanh thước đứng yên giữa không trung
      refreshHUD(); saveNow();
      say(ST.SCENE_CH17_DO_LAI_XONG, function () {
        state.quest = 'q17_chat_van'; refreshHUD(); saveNow();
        toast('Thước đã đứng yên, buổi đo lại thành công. Người của tháp đang chờ chất vấn ở sảnh — nói chuyện với chấp sự tháp hoặc chủ trì.', 4600);
      });
      return;
    }
    toast('Uy lực Định Âm hiện tại ' + r.power + ' — cần 140 để giữ thước đứng yên. Hãy tích Tĩnh Âm thêm (đứng yên lắng nghe) rồi thử lại.', 4600);
    refreshHUD(); saveNow();
  }
  function castDinh() {
    if (tlFight) { tlVoiceReset(); return; } // gói phụ 13: Vạn Âm Cộng Hưởng bị khóa ở ải Thăng Long
    if (hhtFight) { if (!dlg) hhtCastWord('dinh'); return; } // Mục F: LỆNH dùng được trong trận đài
    if (daiFight) { if (!dlg) daiCastWord('dinh'); return; } // ARCIV
    if (arcFig) { if (!dlg) arcFigCastWord('dinh'); return; } // ARCIV
    // ARCIV đợt 2 ch.17 (B.7): Định Âm giữ thước pha lê — sau các đường
    // trận, trước đường tự do. Ngoài vùng gần thước thì chỉ nhắc, KHÔNG
    // trừ gì; trong vùng thì đòn vẫn trừ như khuôn giữ bia chương 12.
    if (state && state.map === 'thap_noi' && state.quest === 'q17_do_lai' && state.flags.q17RulerShaking) { arcRulerDinh(); return; }
    if (dlg) return;
    if (enc) { encCastWord('dinh'); return; }
    if (startEncounterNear(3.2)) { encCastWord('dinh'); return; }
    var beforeD = state.silence;
    var r = L.castWord(state, 'dinh');
    if (!r.ok) { toast(r.reason); return; }
    castResonanceFx('dinh', px + 16, py + 30, { silenceBefore: beforeD, baseFreq: 220, noWave: true }); // thử bia: âm gốc cơ quan/bia 220 Hz, sân ĐỨNG YÊN
    addFloat(px + 16, py - 20, 'ĐỊNH!', '170,220,255');
    if (state.quest === 'q12_lenh_dau_tien' && !state.flags.lenDinhDone) {
      if (r.power >= 160) {
        state.flags.lenDinhDone = true;
        L.recordSpeech(state, 12, 'dinh-thu-bia-dai', 'thanh-van-tong');
        refreshHUD(); saveNow();
        say(ST.SCENE_CH12_LENH_2, function () { refreshHUD(); saveNow(); });
        return;
      }
      toast('Uy lực Định Âm vừa rồi: ' + r.power + ' — chưa đủ 160 để bia đứng yên tuyệt đối. Hãy tích Tĩnh Âm thêm (thổ nạp hoặc lắng nghe) rồi thử lại.', 4600);
    }
    refreshHUD(); saveNow();
  }
  function castPhong() {
    if (tlFight) { tlVoiceReset(); return; } // gói phụ 13: Vạn Âm Cộng Hưởng bị khóa ở ải Thăng Long
    if (hhtFight) { if (!dlg) hhtCastWord('phong'); return; } // Mục F: LỆNH dùng được trong trận đài
    if (daiFight) { if (!dlg) daiCastWord('phong'); return; } // ARCIV
    if (arcFig) { if (!dlg) arcFigCastWord('phong'); return; } // ARCIV: Phong Âm phong ấn mắt trận ngay giữa trận
    if (dlg) return;
    if (enc) { encCastWord('phong'); return; }
    if (startEncounterNear(3.2)) { encCastWord('phong'); return; }
    var beforeP = state.silence;
    var r = L.castWord(state, 'phong');
    if (!r.ok) { toast(r.reason); return; }
    castResonanceFx('phong', px + 16, py + 30, { silenceBefore: beforeP, baseFreq: 220, noWave: true }); // thử trận văn: sân xoay ngược chiều
    addFloat(px + 16, py - 20, 'PHONG!', '255,214,120');
    if (state.quest === 'q12_lenh_dau_tien' && state.flags.lenDinhDone && !state.flags.lenPhongDone) {
      if (r.power >= 180) {
        state.flags.lenPhongDone = true;
        L.recordSpeech(state, 12, 'phong-thu-tran-van', 'thanh-van-tong');
        refreshHUD(); saveNow();
        say(ST.SCENE_CH12_LENH_DONE, function () {
          if (!state.flags.kimDanReward) {
            var rk = L.addLinhThach(state, 50);
            if (rk.ok) { state.flags.kimDanReward = true; toast('Thưởng của tông môn mừng tân Kim Đan: +50 Linh Thạch (số dư: ' + L.fmtNum(rk.balance) + ').', 4200); }
          }
          state.quest = 'q12_done'; refreshHUD(); saveNow();
          toast('Hoàn thành chương 12: Kết Đan — phần ba khép lại ở Kim Đan Sơ Kỳ. Vạn Âm Cộng Hưởng của ngươi từ nay là bậc Hưởng.', 5600);
        });
        return;
      }
      toast('Uy lực Phong Âm vừa rồi: ' + r.power + ' — chưa đủ 180 để khóa trọn vết rạn. Hãy tích Tĩnh Âm thêm rồi thử lại.', 4600);
    }
    refreshHUD(); saveNow();
  }

  /* ================= LÀN CHẠM TRÁN: SĂN QUÁI THẬT + CẢM GIÁC CÀY =================
     Hệ chạm trán thời gian thực đầu tiên của game (trước đây chỉ có cảnh
     truyện chọn chiêu): quái đi lại trong vùng săn thật, chạm trán mở
     trận số học — máu quái, máu người chơi trừ thật, quái đánh trả theo
     nhịp, Ngôn Linh đủ bốn chữ gồm cả LỆNH (cờ len* của phần 3 nay được
     trận thật tiêu thụ). Số kinh tế lấy đúng docs/grind-prep qua cửa
     grantReward của logic.js; cảm giác theo 15 điểm đã duyệt trong
     docs/grind-feel-prep (sổ: docs/effects-catalog.md mục 7).
     Chí mạng: parent chốt khung 8-12% / hệ số x1,5-1,75 — làn chốt
     10% / x1,6 (giữa khung: đủ thường để người chơi cảm được nhịp chí
     mạng trong một phiên săn ngắn, chưa đủ mạnh để lấn uy lực Ngôn Linh
     vốn là trục sức mạnh chính của nhân vật). */
  var CRIT_CHANCE = 0.10, CRIT_MULT = 1.6;
  var mons = [], enc = null, drops = [], orbs = [], orbBatches = {};
  var zoneDwell = 0, curZoneId = null, defeatGraceT = 0;
  var hitStopT = 0, hitStopLastAt = -9999, hurtT = 0, playerHurtT = 0, ghostHp = -1, ghostPctShown = -1, lowHpWarnT = 0;
  var comboN = 0, comboT = 0, huntSession = null;
  var summaryShownAt = 0, summaryMoveT = 0, bossPillar = null, encStance = false, lairToastAt = 0;
  var hitVariantIdx = 0, dropSeq = 0, orbBatchSeq = 0;
  /* ----- Trạng thái phiên của làn C (chỉ sống trong bộ nhớ) -----
     bcSession: phiên bí cảnh đang mở (vào qua cổng, thoát/chết/tải lại
     là hủy; chỉ kết quả — firstClear, lượt kho, thưởng — ghi vào save).
     bcColorSort: trò xếp chín mảnh sắc đang dở. escortT: nhịp bước của
     bạn hộ tống việc tông. grindBoardOpen: bảng cày đang mở (panel DOM). */
  var bcSession = null, bcColorSort = null, escortT = 0, grindBoardOpen = null;
  /* Bot ghép tổ SỐNG trong phiên bí cảnh Trận Tâm (trạng thái bộ nhớ
     thuần, KHÔNG ghi save — save chỉ giữ state.party.bots của logic):
     dựng khi vào hai tầng Trận Tâm, giữ qua lại giữa hai tầng, xóa ở
     mọi điểm bcSession bị hủy. bcTelegraphs: vòng báo đòn diện rộng
     của boss tổ đội (trình diễn + thời điểm nổ là số trận thật). */
  var partyBotsLive = [], bcTelegraphs = [];
  var PARTY_REALMS = { bc_tran_tam: 1, bc_tran_tam_sau: 1 };
  var PARTY_HOLD_PADS = [{ key: 'padA', x: 5, y: 14 }, { key: 'padB', x: 34, y: 14 }]; // điểm trận tâm trận (docs/party-boss-coords.json / thiết kế mục 1)
  var PARTY_ROLE_SPRITE = { dps: 'player_nam', tank: 'villager_m', support: 'player_nu' };
  var PARTY_ROLE_CD = { dps: 1.1, tank: 1.3, support: 1.2 };
  var HIT_VARIANTS = [0.94, 1.0, 1.06]; // biến thể cao độ tiếng chạm đích: xoay vòng xác định theo thứ tự đòn, không ngẫu nhiên
  var PENTA_NOTES = [523, 587, 659, 784, 880];
  var MON_SHEET = { son_lang: 76, doc_vu_xa: 72, thiet_giap_tru: 92, phong_ung: 88, lang_vuong: 124, son_chu: 136,
    dong_xa: 76, thuy_xa_tinh: 124, thach_tuong: 92, thach_tuong_thu_ve: 124, tan_anh_vo_cuc: 136, kiem_linh: 88, kiem_y_tan_hon: 136, oan_binh: 92, oan_hon_chien_truong: 136,
    tran_nhan_kiem_linh: 148, ho_tran_kiem_linh: 136, tan_hon_kiem_y_sau: 136, lang_nhiem_song: 92 }; // ARCIV A.2
  var MON_PARTS = { son_lang: '150,160,170', doc_vu_xa: '110,190,120', thiet_giap_tru: '120,110,105', phong_ung: '140,220,210', lang_vuong: '190,200,215', son_chu: '150,130,110',
    dong_xa: '90,160,140', thuy_xa_tinh: '80,170,190', thach_tuong: '150,150,150', thach_tuong_thu_ve: '160,155,140', tan_anh_vo_cuc: '200,210,255', kiem_linh: '170,220,255', kiem_y_tan_hon: '190,210,255', oan_binh: '120,140,160', oan_hon_chien_truong: '110,130,170', tran_nhan_kiem_linh: '170,220,255', ho_tran_kiem_linh: '150,160,170', tan_hon_kiem_y_sau: '190,210,255', lang_nhiem_song: '148,163,184' };
  var ZONE_IDS_SORTED = Object.keys(L.HUNT_ZONES).sort(function (a, b) {
    var za = L.HUNT_ZONES[a], zb = L.HUNT_ZONES[b];
    return (za.x1 - za.x0 + 1) * (za.y1 - za.y0 + 1) - (zb.x1 - zb.x0 + 1) * (zb.y1 - zb.y0 + 1);
  });

  /* ----- Âm thanh chạm đích / quái / rơi đồ (họ tiếng mới của đợt) ----- */
  /* Tiếng TRÚNG ĐÒN lên thân quái (đợt walk2 giai đoạn hai): "thụp"
     trầm ngắn + vỡ nhiễu — bản cũ hai nốt sine/răng cưa nhỏ (0,05/0,022)
     nghe như tiếng gõ mờ, lẫn vào nhạc nền. */
  function sfxHitBeast(v) { v = v || 1; noiseBurst(0.06, 0.045); toneWave({ f0: 150 * v, f1: 60, dur: 0.11, type: 'triangle', gain: 0.11 }); beep(90 * v, 0.07, 'sine', 0.05, 'skill'); }
  /* Tiếng LƯỠI KIẾM CHẠM ĐÍCH (đợt walk2 giai đoạn hai): tíc nhiễu sắc
     + thụp tam giác + leng keng kim loại mỏng — bản cũ square 2400Hz
     gain 0,02 gần như không nghe thấy. Phát ĐÚNG khung áp sát thương
     (điểm gọi đã bỏ trễ 30ms — xem applyHitToMonster). */
  function sfxHitBlade(v) { v = v || 1; noiseBurst(0.05, 0.05); toneWave({ f0: 210 * v, f1: 75, dur: 0.09, type: 'triangle', gain: 0.105 }); beep(2500 * v, 0.035, 'sine', 0.028, 'skill'); }
  function sfxCrit() { noiseBurst(0.08, 0.04); toneWave({ f0: 1560, f1: 2340, dur: 0.12, type: 'sine', gain: 0.05 }); beep(1320, 0.12, 'sine', 0.045, 'skill'); beep(1980, 0.1, 'sine', 0.028, 'skill'); beep(2600, 0.06, 'square', 0.02, 'skill'); }
  function sfxMonsterCry(species, death) {
    var def = L.MONSTER_DEFS[species] || {};
    var f = def.cry || 420;
    if (def.rank === 'elite') f *= 0.8;
    if (death) { beep(f * 0.6, 0.15, 'square', 0.03, 'skill'); }
    else beep(f, 0.07, 'square', 0.026, 'skill');
  }
  function sfxKill() { toneWave({ f0: 320, f1: 55, dur: 0.38, type: 'triangle', gain: 0.10 }); noiseBurst(0.18, 0.035, 0.02); beep(55, 0.25, 'sine', 0.06, 'skill'); }
  /* Tiếng ĂN và tiếng NẤU của hệ đồ ăn (đợt 2026-11-04): ăn = cắn nhẹ
     rồi hai nốt chuông ấm dâng; nấu = hai nhịp lửa lách tách rồi chuông
     khi món dọn ra. Định nghĩa đặt cạnh nhóm sfx chiến đấu như cây nguồn. */
  function sfxEat() { beep(392, 0.08, 'triangle', 0.032, 'ui'); setTimeout(function () { beep(587, 0.16, 'sine', 0.03, 'skill'); }, 70); setTimeout(function () { beep(880, 0.3, 'sine', 0.024, 'skill'); }, 150); }
  function sfxCook() { beep(220, 0.12, 'triangle', 0.026, 'ui'); setTimeout(function () { beep(330, 0.12, 'triangle', 0.024, 'ui'); }, 110); setTimeout(function () { beep(523, 0.24, 'sine', 0.026, 'skill'); }, 230); }
  function sfxDropRare() { [659, 784, 1046].forEach(function (f, i) { setTimeout(function () { beep(f, 0.16, 'sine', 0.032, 'skill'); }, i * 70); }); }
  function sfxRoar(short) {
    var d = short ? 0.3 : 0.7;
    beep(65, d, 'sawtooth', 0.06, 'skill'); beep(47, d, 'triangle', 0.05, 'skill');
    if (!short) setTimeout(function () { beep(46, 0.3, 'sawtooth', 0.04, 'skill'); }, 420);
  }
  function sfxHurt() { toneWave({ f0: 200, f1: 95, dur: 0.13, type: 'triangle', gain: 0.09 }); noiseBurst(0.05, 0.03); }
  /* ----- Âm thanh đợt bí cảnh + hệ cày (làn C, danh mục effects-catalog
     mục 9 — đúng 12 tên chốt, qua cổng beep như các họ tiếng hiện có) ----- */
  function sfxBoardAccept() { beep(520, 0.09, 'sine', 0.04, 'ui'); setTimeout(function () { beep(780, 0.12, 'sine', 0.04, 'ui'); }, 80); }
  function sfxClaimDone() { [523, 659, 784].forEach(function (f, i) { setTimeout(function () { beep(f, 0.14, 'sine', 0.04, 'ui'); }, i * 70); }); }
  function sfxHarvest() { beep(880, 0.08, 'triangle', 0.035, 'ui'); setTimeout(function () { beep(1174, 0.1, 'sine', 0.03, 'ui'); }, 70); }
  function sfxRealmEntry() { beep(130, 0.7, 'sine', 0.05, 'skill'); setTimeout(function () { beep(1046, 0.9, 'sine', 0.04, 'skill'); }, 250); }
  function sfxWaveClear() { [659, 784, 1046].forEach(function (f, i) { setTimeout(function () { beep(f, 0.12, 'sine', 0.035, 'skill'); }, i * 60); }); }
  function sfxFirstClear() { beep(392, 0.25, 'triangle', 0.05, 'skill'); setTimeout(function () { beep(523, 0.25, 'triangle', 0.05, 'skill'); }, 180); setTimeout(function () { beep(784, 0.5, 'sine', 0.05, 'skill'); }, 360); }
  function sfxChimeSmall() { beep(1568, 0.7, 'sine', 0.04, 'skill'); }
  // Phá trấn/vách/cửa (bước 2 mục 5): PHÁ ÂM RÚT GỌN ở âm gốc vật liệu
  // (đá 170 Hz / cơ quan-trận pháp 220 Hz) + tiếng đá vỡ. Tên hàm giữ
  // nguyên; điểm gọi truyền tần vật liệu. Đường nghe thấu ở Kiếm Trủng
  // KHÔNG dùng hàm này — trấn tan êm qua sfxTranFade, không tiếng vỡ.
  function sfxSealBreak(freq) { sfxPha(freq || 170, 1); sfxCrack(true); }
  function sfxTranFade() { beep(660, 0.5, 'sine', 0.03, 'skill'); setTimeout(function () { beep(520, 0.7, 'sine', 0.03, 'skill'); }, 300); setTimeout(function () { beep(392, 0.9, 'sine', 0.025, 'skill'); }, 600); }
  function sfxHazardHit() { beep(220, 0.12, 'square', 0.05, 'skill'); beep(160, 0.14, 'sawtooth', 0.04, 'skill'); }
  function sfxGhostWail() { beep(700, 0.4, 'sine', 0.03, 'skill'); setTimeout(function () { beep(520, 0.5, 'sine', 0.03, 'skill'); }, 300); setTimeout(function () { beep(340, 0.8, 'sine', 0.025, 'skill'); }, 650); }
  // ĐÁP ÂM (bước 2 mục 5): gọi tên ở Cổ Mộ không phải Giang Phàm "đọc
  // tên" nữa — một sine ĐƠN ĐỘC ở âm gốc của oán hồn (cry của
  // oan_hon_chien_truong = 240 Hz), 0,9s, gain 0,045: tiếng của chính
  // oán hồn đáp lại tần số của nó. Tên hàm giữ nguyên (bất biến).
  function sfxNameCall() { toneWave({ f0: resBaseFreqForSpecies('oan_hon_chien_truong'), dur: 0.9, type: 'sine', gain: 0.045 }); }
  function nextHitVariant() { var v = HIT_VARIANTS[hitVariantIdx % 3]; hitVariantIdx++; return v; }

  /* ----- Tiện ích ----- */
  function fmtAmt(n) { var r = Math.round((+n || 0) * 10) / 10; return r % 1 === 0 ? String(Math.round(r)) : String(r).replace('.', ','); }
  function huntUnlocked() { return !!(state && L.questReached(state, 'q2_cong_thanh') && L.walletOpen(state)); }
  function isHuntMap(mapId) { for (var i = 0; i < ZONE_IDS_SORTED.length; i++) if (L.HUNT_ZONES[ZONE_IDS_SORTED[i]].map === mapId) return true; return false; }
  function zoneAtTile(mapId, tx, ty) {
    for (var i = 0; i < ZONE_IDS_SORTED.length; i++) {
      var id = ZONE_IDS_SORTED[i], z = L.HUNT_ZONES[id];
      if (z.map !== mapId || tx < z.x0 || tx > z.x1 || ty < z.y0 || ty > z.y1) continue;
      if (z.grassOnly) { var ch = L.tileAt(tx, ty); if (ch !== ',' && ch !== '.') continue; }
      return id;
    }
    return null;
  }
  function shakeWorld(r) { shakeT = Math.max(shakeT, r); } // qua cổng fxShake sẵn có ở khâu vẽ
  function hitStop(sec) {
    if (tNow - hitStopLastAt < 300) return; // trần một lần dừng hình mỗi 300ms
    hitStopLastAt = tNow;
    hitStopT = Math.max(hitStopT, sec);
  }
  function faceMonster(m) {
    var dx = (m.x + 16) - (px + 16), dy = (m.y + 16) - (py + 16);
    dir8 = L.dir8FromVector(dx, dy, dir8);
    facing = Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
  }
  function musicBoss(on) { if (window.VSLC_MUSIC && VSLC_MUSIC.setBoss) VSLC_MUSIC.setBoss(on); }

  /* ----- Họ chuyển động của quái (đợt làm mượt cử động 2026-11-04) -----
     Phân họ theo loài để khóa nhịp bước (stridePx), tốc độ rẽ hướng và
     lớp cử động thân vẽ bổ trợ trong drawMonster. Băm ổ (monHash01) cho
     lệch pha XÁC ĐỊNH theo loài + tọa độ ổ: cùng một ổ luôn cho cùng
     một pha nên kiểm thử không chao đảo, mà mỗi cá thể vẫn lệch nhịp
     riêng — thay cho Math.random thuần lúc sinh. */
  function monHash01(txt) {
    var h = 2166136261;
    for (var i = 0; i < txt.length; i++) { h ^= txt.charCodeAt(i); h = Math.imul(h, 16777619); }
    return ((h >>> 0) % 100000) / 100000;
  }
  var MON_FAMILY = { doc_vu_xa: 'snake', dong_xa: 'snake', thuy_xa_tinh: 'snake',
    son_lang: 'quad', lang_vuong: 'quad', thiet_giap_tru: 'quad', son_chu: 'quad', lang_nhiem_song: 'quad',
    phong_ung: 'fly', thach_tuong: 'stone', thach_tuong_thu_ve: 'stone',
    oan_binh: 'ghost', oan_hon_chien_truong: 'ghost', tan_anh_vo_cuc: 'ghost',
    kiem_linh: 'sword', kiem_y_tan_hon: 'sword', tran_nhan_kiem_linh: 'sword', ho_tran_kiem_linh: 'sword', tan_hon_kiem_y_sau: 'sword' };
  var MON_STRIDE = { snake: 11, quad: 13, fly: 9, stone: 17, ghost: 12, sword: 12 }; // px tích lũy cho MỘT khung đi
  var MON_TURN = { snake: 8, quad: 7, fly: 9, stone: 6, ghost: 8.5, sword: 8.5 };   // rad/s: họ nặng rẽ chậm, họ nhẹ rẽ nhanh
  function monFamilyOf(sp) { return MON_FAMILY[sp] || ''; }
  function monStridePx(m) { var s = MON_STRIDE[monFamilyOf(m.species)] || 13; if (m.rank === 'boss') s *= 1.25; return s; } // boss lớn sải dài hơn 1,25 lần
  function monTurnRate(m) { return MON_TURN[monFamilyOf(m.species)] || 7.5; }

  /* ----- Sinh quái theo bản đồ ----- */
  function makeMonster(species, zoneId, tx, ty, bossId) {
    var def = L.MONSTER_DEFS[species], bd = bossId ? L.BOSS_DEFS[bossId] : null;
    // Lệch pha + nhịp quay mặt lúc chờ: băm theo loài + ổ (xác định, xem khối trên).
    var ph0 = monHash01(species + '@' + zoneId + '@' + tx + ',' + ty) * Math.PI * 2;
    return { species: species, def: def, bossId: bossId || null, name: bd ? bd.name : def.name, rank: def.rank,
      zoneId: zoneId, lairX: tx, lairY: ty, x: tx * TILE, y: ty * TILE, face: 1, mode: 'wander',
      hp: def.hp, hpMax: def.hp, atk: def.atk, atkInterval: def.atkInterval, speed: def.speed,
      wt: 1 + Math.random() * 2, tx: tx * TILE, ty: ty * TILE, movingNow: false,
      aggroT: 0, atkT: 0.6, atkAnimT: 0, flashT: 0, cryT: 0, kbx: 0, kby: 0, kbT: 0, shakeT: 0, resVibT: 0, resShatter: false,
      holdT: 0, sealT: 0, deathT: 0, state: 'alive', respawnT: 0, slideT: bossId ? 0.5 : 0, hitN: 0,
      // Trường chuyển động mượt (đợt 2026-11-04): vận tốc lái mềm vx/vy,
      // quãng đường tích lũy gait khóa pha khung đi, nhịp lên đòn windT,
      // nhịp dằn thân tượng đá và nhịp quay mặt lúc chờ của thú bốn chân.
      vx: 0, vy: 0, gait: 0, phase0: ph0, windT: 0, stoneSinkT: 0, stoneStepIdx: 0, orbitN: 0,
      idleTurnT: 2.5 + monHash01(species + ':idle:' + tx + ',' + ty) * 4, idleTurnN: 0 };
  }
  function monsterHasArt(species) {
    // Cổng mỹ thuật là điều kiện sinh: loài nào bị loại ở khâu sản xuất
    // hình (không nộp tệp / tệp lỗi) thì không bao giờ vào diện săn; ảnh
    // đang tải thì quái sinh bình thường và chỉ VẼ khi ảnh đã sẵn sàng
    // (drawMonster tự ẩn phần thân cho tới lúc đó — không hình tạm).
    return !ASSETS.monsBad[species];
  }
  function spawnMonstersForMap() {
    mons = []; enc = null; drops = []; orbs = []; orbBatches = {}; comboN = 0; comboT = 0; zoneDwell = 0; encStance = false;
    // ARCIV: đổi bản đồ giữa trận boss Trận Nhãn (đường spawnMonstersForMap
    // đặt enc=null trực tiếp, không qua endEncounterCleanup) — dừng chu
    // kỳ kiếm trận + dọn mắt phụ để không rò sang bản đồ khác.
    if (typeof arcStopCycle === 'function') arcStopCycle();
    if (typeof arcEyes !== 'undefined') arcEyes.length = 0;
    hideBossBanner(); musicBoss(false);
    if (!state || !huntUnlocked()) return;
    var mapId = state.map;
    L.HUNT_LAIRS.forEach(function (lair) {
      var z = L.HUNT_ZONES[lair.zoneId];
      if (!z || z.map !== mapId || !monsterHasArt(lair.species)) return;
      // ARCIV A.3: lair có mốc nhiệm vụ (lang_nhiem_song cần q14_done) —
      // chưa tới mốc thì ổ chưa sinh quái.
      if (lair.requiresQuest && !L.questReached(state, lair.requiresQuest)) return;
      mons.push(makeMonster(lair.species, lair.zoneId, lair.x, lair.y, null));
    });
    for (var bid in L.BOSS_DEFS) {
      var bd = L.BOSS_DEFS[bid];
      if (bd.map !== mapId || !monsterHasArt(bd.species)) continue;
      if (L.bossStatus(state, bid).state === 'alive') mons.push(makeMonster(bd.species, bd.zoneId, bd.lair.x, bd.lair.y, bid));
    }
  }
  // "Bản trắng" của quái (nhấp nháy khi trúng đòn): tiền tạo bằng canvas
  // từ chính tấm hình — giữ nguyên alpha, thay màu bằng trắng.
  function whiteVariant(species) {
    if (species in ASSETS.monsWhite) return ASSETS.monsWhite[species];
    var img = ASSETS.mons[species], out = null;
    if (imgReady(img)) {
      try {
        var c = document.createElement('canvas');
        c.width = img.naturalWidth; c.height = img.naturalHeight;
        var g = c.getContext('2d');
        g.drawImage(img, 0, 0);
        g.globalCompositeOperation = 'source-in';
        g.fillStyle = '#ffffff';
        g.fillRect(0, 0, c.width, c.height);
        out = c;
      } catch (e) { out = null; }
    }
    ASSETS.monsWhite[species] = out;
    return out;
  }

  /* ----- Cập nhật quái ----- */
  function monFootFree(m, nx, ny, battle) {
    var tx = Math.floor((nx + 16) / TILE), ty = Math.floor((ny + 30) / TILE);
    var z = L.HUNT_ZONES[m.zoneId];
    if (battle) {
      var inLeash = z && tx >= z.x0 - 3 && tx <= z.x1 + 3 && ty >= z.y0 - 3 && ty <= z.y1 + 3;
      if (!inLeash && zoneAtTile(state.map, tx, ty) !== m.zoneId) return false;
    } else if (zoneAtTile(state.map, tx, ty) !== m.zoneId) return false;
    return L.isWalkable(tx, ty, npcsLive);
  }
  /* ----- Tách đàn (đợt làm mượt cử động 2026-11-04) -----
     Sau mỗi bước: hai quái SỐNG chồng lấn (tâm cách < 26px) bị đẩy nhẹ
     ra hai phía theo trục nối tâm, mỗi phía một nửa phần chồng, và chỉ
     khi vị trí mới qua được monFootFree của chính con bị đẩy. Không đẩy
     quái đang trong trận (enc.mon), không đẩy người chơi (người chơi
     không nằm trong mons). Đẩy tách đàn KHÔNG tính vào gait — đó là xê
     dịch né nhau, không phải bước đi. */
  function monSeparate(m, battle) {
    if (enc && enc.mon === m) return;
    for (var i = 0; i < mons.length; i++) {
      var o = mons[i];
      if (o === m || o.state !== 'alive') continue;
      if (enc && enc.mon === o) continue;
      var dx = (m.x + 16) - (o.x + 16), dy = (m.y + 16) - (o.y + 16);
      var d = Math.hypot(dx, dy);
      if (d >= 26) continue;
      if (d < 0.01) { var pa = m.phase0 || 0; dx = Math.cos(pa); dy = Math.sin(pa); d = 1; } // trùng tâm hẳn: tách theo pha riêng của cá thể
      var push = (26 - d) / 2, ux = dx / d, uy = dy / d;
      var mx = m.x + ux * push, my = m.y + uy * push;
      if (monFootFree(m, mx, my, battle)) { m.x = mx; m.y = my; }
      var ox = o.x - ux * push, oy = o.y - uy * push;
      if (monFootFree(o, ox, oy, battle)) { o.x = ox; o.y = oy; }
    }
  }
  /* ----- Bước đi LÁI MỀM (đợt làm mượt cử động 2026-11-04) -----
     Viết lại ruột monStep, giữ nguyên chữ ký và ngữ nghĩa trả về "đã
     tới đích". Quái mang vận tốc vx/vy: hướng mong muốn RẼ DẦN với tốc
     độ rẽ hữu hạn theo họ (MON_TURN), tốc độ TĂNG DẦN từ 0 (gia tốc
     ~3,2 lần tốc độ tối đa mỗi giây) và GIẢM DẦN khi vào bán kính hãm
     26px quanh đích; tốc độ chạy ổn định vẫn đúng speed truyền vào
     (nơi gọi truyền def.speed làm trần — không đổi số gốc nào). Va
     chạm: thử vector đầy đủ trước, kẹt thì trượt dọc tường theo từng
     trục như trước, mọi đường đều qua monFootFree (cổng vùng/dây xích
     giữ nguyên). Quãng đường THẬT đi được cộng vào m.gait — pha khung
     đi khóa theo gait chứ không theo đồng hồ chung nữa. */
  function monStep(m, gx, gy, speed, dt, battle) {
    if (typeof m.vx !== 'number') { m.vx = 0; m.vy = 0; m.gait = 0; }
    var cx = m.x + 16, cy = m.y + 16;
    var dx = gx - cx, dy = gy - cy, d = Math.hypot(dx, dy);
    if (d < 2 || dt <= 0) {
      // Đã tới đích (hoặc khung hình đứng): hãm vận tốc về 0 cho bước sau không trượt.
      m.vx = 0; m.vy = 0;
      return d < 2;
    }
    // Tốc độ mong muốn: đầy speed ở xa, hãm tuyến tính trong bán kính 26px.
    var want = speed * Math.min(1, d / 26);
    var desA = Math.atan2(dy, dx);
    var curSp = Math.hypot(m.vx, m.vy);
    var curA = curSp > 0.5 ? Math.atan2(m.vy, m.vx) : desA;
    // Rẽ dần: chênh góc gói về [-π, π] rồi kẹp theo tốc độ rẽ của họ.
    var diff = desA - curA;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    var maxTurn = monTurnRate(m) * dt;
    var newA = curA + Math.max(-maxTurn, Math.min(maxTurn, diff));
    // Tăng/giảm tốc: tăng ~0,31s tới tốc độ tối đa; hãm nhanh hơn một chút.
    var newSp;
    if (want > curSp) newSp = Math.min(want, curSp + speed * 3.2 * dt);
    else newSp = Math.max(want, curSp - speed * 4.5 * dt);
    if (newSp * dt > d) newSp = d / dt; // không vọt qua đích trong khung này
    m.vx = Math.cos(newA) * newSp; m.vy = Math.sin(newA) * newSp;
    var sx = m.vx * dt, sy = m.vy * dt;
    var prevX = m.x, prevY = m.y;
    if (monFootFree(m, m.x + sx, m.y + sy, battle)) { m.x += sx; m.y += sy; }
    else {
      // Trượt dọc tường theo từng trục như bản gốc. Vận tốc trục kẹt
      // được GIỮ NGUYÊN, không tắt: bước đầu của ramp tăng tốc còn nhỏ
      // hơn độ dài cần để điểm chân qua biên ô (ổ sói (20,20) bị prop
      // chặn, chỉ thoát được khi một bước đủ dài đẩy điểm chân sang ô
      // kề) — tắt vận tốc ở đây làm quái kẹt vĩnh viễn trong ổ. Giữ
      // vận tốc thì bước thử lớn dần theo ramp và qua được biên ô,
      // đúng như bước hằng số của bản gốc.
      if (sx && monFootFree(m, m.x + sx, m.y, battle)) m.x += sx;
      if (sy && monFootFree(m, m.x, m.y + sy, battle)) m.y += sy;
    }
    var movedX = m.x - prevX, movedY = m.y - prevY;
    if (movedX) m.face = movedX > 0 ? 1 : -1;
    var walked = Math.hypot(movedX, movedY);
    if (walked > 0) {
      m.gait += walked;
      // Tượng đá: mỗi bước đủ một stride thì dằn thân xuống 90ms + một
      // hạt bụi dưới chân (spawnParts tự giữ trần hạt và cổng fxOn).
      if (monFamilyOf(m.species) === 'stone') {
        var sIdx = Math.floor(m.gait / monStridePx(m));
        if (sIdx !== m.stoneStepIdx) {
          m.stoneStepIdx = sIdx; m.stoneSinkT = 0.09;
          spawnParts(m.x + 16, m.y + 30, 1, '150,145,135', 10, false);
        }
      }
    }
    monSeparate(m, battle);
    return Math.hypot(gx - (m.x + 16), gy - (m.y + 16)) < 2;
  }
  function updateMonster(m, dt) {
    if (m.flashT > 0) m.flashT = Math.max(0, m.flashT - dt);
    if (m.resVibT > 0) m.resVibT = Math.max(0, m.resVibT - dt); // rung chấn trình diễn khi trúng đòn cộng hưởng (3.5)
    if (m.cryT > 0) m.cryT = Math.max(0, m.cryT - dt);
    if (m.shakeT > 0) m.shakeT = Math.max(0, m.shakeT - dt);
    if (m.kbT > 0) { m.kbT = Math.max(0, m.kbT - dt); if (m.kbT <= 0) { m.kbx = 0; m.kby = 0; } }
    if (m.slideT > 0) m.slideT = Math.max(0, m.slideT - dt);
    // Nhịp lên đòn windT đếm ngược CÙNG nhịp với atkT ở updateEncounter
    // (đặt bằng atkT khi vào cửa sổ lên đòn, trừ cùng dt ở đây — hàm này
    // chạy cho mọi quái trước updateEncounter trong huntUpdate).
    if (m.windT > 0) m.windT = Math.max(0, m.windT - dt);
    if (m.stoneSinkT > 0) m.stoneSinkT = Math.max(0, m.stoneSinkT - dt); // nhịp dằn thân của tượng đá
    if (m.state === 'dying') { m.deathT += dt; if (m.deathT > 1.1) m.state = 'gone'; return; }
    if (m.state === 'gone') {
      if (!m.bossId && !m.bcRealm) { m.respawnT -= dt; if (m.respawnT <= 0 && !enc) { var fresh = makeMonster(m.species, m.zoneId, m.lairX, m.lairY, null); for (var k in fresh) m[k] = fresh[k]; } } // quái bí cảnh không hồi sinh trong phiên
      return;
    }
    if (m.state !== 'alive' || dt <= 0) { m.movingNow = false; return; }
    var prevX = m.x, prevY = m.y;
    if (enc && enc.mon === m) { m.movingNow = false; return; } // quái đang trong trận do updateEncounter lái
    var pcx = px + 16, pcy = py + 16, mcx = m.x + 16, mcy = m.y + 16;
    var dist = Math.hypot(mcx - pcx, mcy - pcy);
    if (dist <= 70 && defeatGraceT <= 0) m.aggroT += dt; else m.aggroT = Math.max(0, m.aggroT - dt);
    // Chạm trán: người chơi đi bộ chạm vào quái (đã ở trong vùng săn đủ
    // lâu) hoặc quái đã phát hiện và đuổi theo đủ lâu — không dịch
    // chuyển tức thời, không phục kích giữa cảnh truyện (khối này chỉ
    // chạy khi không có thoại mở).
    if (!enc && dist < 20 && (zoneDwell >= 3 || m.aggroT >= 0.5)) { startEncounter(m); return; }
    var playerInZone = zoneAtTile(state.map, Math.floor(pcx / TILE), Math.floor(pcy / TILE)) === m.zoneId;
    if (m.aggroT > 0.15 && playerInZone && dist < 150) {
      monStep(m, pcx, pcy, m.speed, dt, false);
      m.mode = 'chase';
    } else if (Math.hypot(m.x - m.lairX * TILE, m.y - m.lairY * TILE) > 40 && m.mode === 'chase') {
      monStep(m, m.lairX * TILE + 16, m.lairY * TILE + 16, m.speed * 0.7, dt, false);
      m.mode = 'return';
    } else {
      m.mode = 'wander';
      m.wt -= dt;
      if (m.wt <= 0) {
        m.wt = 2 + Math.random() * 3;
        var picked = false;
        /* Họ bay LƯỢN VÒNG khi chờ (đợt làm mượt cử động 2026-11-04):
           đích wander của họ bay nằm trên vòng tròn bán kính 3 ô quanh
           ổ, góc tiến ~2,4 rad mỗi lần chọn — lái mềm nối các điểm cung
           thành đường lượn quanh ổ. Vẫn qua đúng cổng vùng + ô đi được
           như chọn ngẫu nhiên; điểm cung không hợp lệ thì rơi về chọn
           ngẫu nhiên như cũ. Chỉ đổi CÁCH CHỌN ĐÍCH của họ bay, không
           đổi vùng sống, dây xích hay tốc độ wander. */
        if (monFamilyOf(m.species) === 'fly') {
          m.orbitN = (m.orbitN || 0) + 1;
          var oa = (m.phase0 || 0) + m.orbitN * 2.4;
          var owx = m.lairX + Math.round(Math.cos(oa) * 3), owy = m.lairY + Math.round(Math.sin(oa) * 3);
          if (zoneAtTile(state.map, owx, owy) === m.zoneId && L.isWalkable(owx, owy, npcsLive)) { m.tx = owx * TILE; m.ty = owy * TILE; picked = true; }
        }
        if (!picked) for (var tries = 0; tries < 6; tries++) {
          var wx = m.lairX + Math.round((Math.random() * 2 - 1) * 4);
          var wy = m.lairY + Math.round((Math.random() * 2 - 1) * 4);
          if (zoneAtTile(state.map, wx, wy) === m.zoneId && L.isWalkable(wx, wy, npcsLive)) { m.tx = wx * TILE; m.ty = wy * TILE; break; }
        }
      }
      monStep(m, m.tx + 16, m.ty + 16, m.speed * 0.45, dt, false);
    }
    // Tinh anh: hạt vàng thưa quanh chân (qua trần hạt chung sẵn có).
    if (m.rank === 'elite' && fxOn() && Math.random() < dt * 2) spawnParts(m.x + 16 + (Math.random() - 0.5) * 30, m.y + 28, 1, '255,215,110', 7, true);
    m.movingNow = (m.x !== prevX || m.y !== prevY);
    /* Nhịp chờ sống (đợt làm mượt cử động 2026-11-04): thú bốn chân
       đứng wander lâu thỉnh thoảng QUAY MẶT — thuần trình diễn qua
       m.face, nhịp đếm xác định theo băm ổ + số lần đã quay, KHÔNG
       chạm hành vi wander/chase/aggro hay đích đi chút nào. */
    if (monFamilyOf(m.species) === 'quad' && m.mode === 'wander' && !m.movingNow) {
      m.idleTurnT -= dt;
      if (m.idleTurnT <= 0) {
        m.face = m.face < 0 ? 1 : -1;
        m.idleTurnN = (m.idleTurnN || 0) + 1;
        m.idleTurnT = 2.5 + monHash01(m.species + ':idle' + m.idleTurnN + ':' + m.lairX + ',' + m.lairY) * 4;
      }
    }
  }
  function huntUpdate(dt, dtW) {
    if (!state) return;
    if (defeatGraceT > 0) defeatGraceT = Math.max(0, defeatGraceT - dt);
    var pt = playerTile();
    curZoneId = zoneAtTile(state.map, pt.x, pt.y);
    if (curZoneId && huntUnlocked()) zoneDwell += dt; else zoneDwell = 0;
    for (var i = 0; i < mons.length; i++) updateMonster(mons[i], dtW);
    if (enc) updateEncounter(dtW);
    updatePartyBots(dtW); // bot ghép tổ Trận Tâm: bám theo / đánh / giữ điểm / né báo đòn
    updateDrops(dt);
    updateOrbs(dt);
  }
  /* ----- Vòng trận ----- */
  function startEncounterNear(maxTiles) {
    if (!state || enc) return false;
    var best = null, bd = maxTiles * TILE;
    for (var i = 0; i < mons.length; i++) {
      var m = mons[i];
      if (m.state !== 'alive') continue;
      var d = Math.hypot(m.x - px, m.y - py);
      if (d < bd) { bd = d; best = m; }
    }
    if (!best) return false;
    startEncounter(best);
    return true;
  }
  function startEncounter(m) {
    var sessionId = L.newEncounterSessionId(state);
    enc = { mon: m, sessionId: sessionId, usedDinh: 0, usedPhong: 0, hitN: 0, pendingHits: [],
            critRng: L.grindRng(L.grindHash32(sessionId + ':crit')), phase: m.bossId ? bossPhaseOf(m) : 0 };
    m.mode = 'battle';
    m.atkT = Math.max(0.5, m.atkInterval * 0.6);
    m.aggroT = 0;
    if (!huntSession) huntSession = { kills: { normal: 0, elite: 0, boss: 0 }, tuvi: 0, lt: 0, items: {} };
    if (m.bossId) { showBossBanner(m); sfxRoar(false); shakeWorld(0.35); musicBoss(true); }
    if (m.bcBoss) {
      var bb = $('boss-banner');
      if (bb) {
        $('boss-name').textContent = m.name;
        $('boss-title').textContent = 'Boss bí cảnh';
        $('boss-phase').textContent = 'Đợt ' + bossPhaseOf(m) + '/4';
        bb.classList.remove('hidden', 'compact', 'fading');
        updateBossBar(m);
      }
      sfxRoar(false); shakeWorld(0.35); musicBoss(true);
      if (bcSession && bcSession.realm === 'bc_kiemtrung' && bcSession.speechUsed) { m.bossFxOpening = true; monsterStrike(m); toast('Kiếm ý đã nhớ lấy tiếng người — nó ra đòn mở màn ngay khi trận bắt đầu!', 4200); }
    }
    if (bcSession && bcSession.realm === 'bc_kiemtrung') bcSession.tranT = 0; // bắt đầu trận: đặt lại bộ đếm tĩnh mặc trấn
    // ARCIV ch.16: boss Trận Nhãn mở trận -> dựng chu kỳ kiếm trận + hai
    // mắt trận phụ ở (6,14)/(37,14) của tầng sâu (tọa độ điểm ảnh).
    if (m.bcBoss && m.species === 'tran_nhan_kiem_linh') {
      enc.arcT = { quat: 3.2, quatTele: -1, van: 8.5, fanPend: -1 };
      arcStartCycle(function () { return { x: m.x + 16, y: m.y + 16 }; }, { period: 4.2 });
      arcEyes.length = 0;
      L.BC_KIEMTRUNG_SAU_EYES.forEach(function (ep) { arcAddEye(ep.x * TILE + 16, ep.y * TILE + 16, { label: 'Mắt trận phụ' }); });
    }
    // ARCIV: boss dã ngoại Hộ Trận Kiếm Linh — đồng hồ chiêu riêng.
    if (m.bossId === 'boss_hb_ho_tran_kiem_linh') {
      enc.arcT = { quat: 2.8, quatTele: -1, cyc: 7.5, cycWin: -1 };
    }
    // Boss TỔ ĐỘI Trận Tâm Ma Ảnh (chỉ ở tâm trận bc_tran_tam_sau):
    // trạng thái mẫu chạy trên đồng hồ trận tích lũy pb.t của chính nó.
    if (m.bcBoss && m.species === 'tran_tam_ma_anh' && m.bcRealm === 'bc_tran_tam_sau') {
      m.partyBoss = { phase: 'fight', t: 0, nextCast: 7, holdsDone: {}, holdT: 0, holdElapsed: 0, enraged: false, stunUntil: 0, holders: {}, sealFloatT: -9 };
      bcTelegraphs = [];
    }
  }
  function endEncounterCleanup() {
    // Trận khép (thắng / chạy / tan / thua): bot ghép tổ đang gục hồi
    // 50% máu tối đa và đứng dậy theo đội; bot còn sống GIỮ NGUYÊN máu.
    partyBotsLive.forEach(function (b) {
      if (b.state === 'down') { b.hp = Math.round(b.hpMax * 0.5); b.state = 'follow'; }
    });
    bcTelegraphs = [];
    if (enc && enc.mon && enc.mon.partyBoss) enc.mon.partyBoss = null;
    // ARCIV: trận boss Trận Nhãn khép (thắng/thua/tan trận) -> dừng chu
    // kỳ kiếm trận + dọn hai mắt phụ, im tuyệt đối từ đây.
    if (enc && enc.mon && enc.mon.species === 'tran_nhan_kiem_linh') { arcStopCycle(); arcEyes.length = 0; }
    if (enc && enc.mon && (enc.mon.bossId || enc.mon.bcBoss)) { hideBossBanner(); musicBoss(false); }
    if (state && state.flags) { state.flags.lenDinhHold = 0; state.flags.lenPhongSeal = 0; }
    enc = null; encStance = false;
  }
  function updateEncounter(dt) {
    var m = enc.mon;
    if (m.state !== 'alive' || dt <= 0) return;
    var i, ph;
    for (i = enc.pendingHits.length - 1; i >= 0; i--) {
      if (tNow >= enc.pendingHits[i].at) {
        ph = enc.pendingHits.splice(i, 1)[0];
        applyHitToMonster(m, ph.power, { kind: ph.kind, move: ph.move, hitIdx: ph.hitIdx || 0 });
        if (!enc || m.state !== 'alive') return;
      }
    }
    var pcx = px + 16, pcy = py + 16, mcx = m.x + 16, mcy = m.y + 16;
    var dist = Math.hypot(mcx - pcx, mcy - pcy);
    if (m.holdT > 0) { m.holdT = Math.max(0, m.holdT - dt); if (m.holdT <= 0) state.flags.lenDinhHold = 0; }
    if (m.sealT > 0) { m.sealT = Math.max(0, m.sealT - dt); state.flags.lenPhongSeal = m.sealT > 0 ? Math.ceil(m.sealT / m.atkInterval) : 0; }
    var frozen = m.holdT > 0 || m.sealT > 0;
    // Boss tổ đội: đồng hồ mẫu (Trận Văn Phá / Phong Ấn Hai Điểm) chạy
    // trên đồng hồ trận tích lũy của chính boss; đang hold/stun thì boss
    // đứng yên tại trận tâm, không đuổi theo người chơi.
    if (m.partyBoss) { updatePartyBoss(m, dt); if (!enc) return; }
    if (dist > 40 && !(m.partyBoss && m.partyBoss.phase !== 'fight')) monStep(m, pcx, pcy, m.speed, dt, true);
    else if (!frozen) {
      // Đứng áp sát đánh: tắt vận tốc lái để nhịp áp sát không trượt dư sang nhịp đứng.
      m.vx = 0; m.vy = 0;
      m.atkT -= dt;
      /* Đánh BA NHỊP (đợt làm mượt cử động 2026-11-04): khi atkT vào
         cửa sổ 0,30s cuối và quái chưa ở nhịp lên đòn, đặt windT = atkT
         để monSrc hiện khung LÊN ĐÒN (hàng 2 cột 0) — windT đếm ngược
         cùng atkT ở updateMonster. Thời điểm sát thương KHÔNG dời:
         monsterStrike vẫn chạy đúng khoảnh khắc atkT chạm 0 như cũ,
         và lớp tụ lực boss-fx đọc atkT không hề bị chạm. */
      if (m.atkT <= 0.30 && m.atkT > 0 && !(m.windT > 0)) m.windT = m.atkT;
      if (m.atkT <= 0) {
        m.atkT = m.atkInterval;
        m.windT = 0; // hết nhịp lên đòn đúng lúc đòn rơi
        m.atkAnimT = 0.35;
        monsterStrike(m);
        if (!enc) return; // người chơi đã gục trong đòn này
      }
    }
    if (m.atkAnimT > 0) m.atkAnimT = Math.max(0, m.atkAnimT - dt);
    // Giữ thế: đứng yên giữa trận thì Tĩnh Mặc hồi theo nhịp thổ nạp
    // (đường hồi Tĩnh Mặc duy nhất trong trận — muốn dùng lời phải giữ
    // thế, đúng cái giá của Ngôn Linh).
    encStance = !moving;
    if (encStance) state.silence = L.silenceGain('meditate', dt, state.silence, state);
    // Boss tổ đội lúc PHONG ẤN/CHOÁNG thì neo chết tại bệ (không đuổi
    // theo được): trận KHÔNG tan theo khoảng cách ở hai nhịp này, vì
    // cơ chế giữ hai điểm bắt cả tổ phải tản ra hai đầu phòng — hai
    // điểm trận cách bệ 16–17 ô, xa hơn hẳn tầm tan trận 208 này
    // (bản đầu không có ngoại lệ này: vừa đi tới điểm là trận tan,
    // cơ chế không thể hoàn thành — clip kiểm chứng lượt B5/B6 ngày
    // 2026-11-04 bắt được). Lật nhịp về 'fight' được nạp 6 giây ân
    // hạn (leashGraceT, nạp trong updatePartyBoss) để cả tổ chạy về.
    if (dist > 208 && !(m.partyBoss && (m.partyBoss.phase === 'hold' || m.partyBoss.phase === 'stun' || (m.partyBoss.leashGraceT || 0) > 0))) { // rút xa quá: trận tan, quái lùi về ổ, không thưởng phạt
      endEncounterCleanup();
      m.mode = 'return';
      toast('Quái đã lùi về ổ — trận tan, không thắng không thua.', 2600);
      return;
    }
    if (m.bossId || m.bcBoss) updateBossBar(m);
  }
  function monsterStrike(m) {
    // Boss tổ đội đang PHONG ẤN (hold) hoặc đang CHOÁNG (stun): ngừng đánh hẳn.
    if (m.partyBoss && (m.partyBoss.phase === 'hold' || m.partyBoss.phase === 'stun')) return;
    enc.hitN += 1;
    var v = 0.85 + 0.3 * L.rollSessionValue(enc.sessionId, ':matk' + enc.hitN);
    hurtPlayer(Math.max(1, Math.round(m.atk * v)));
    bossStrikeFx(m); // lớp trình diễn của đòn boss — chạy SAU khi số đã áp đúng khung gốc, không đụng enc/số nào
  }
  /* ===== HIỆU ỨNG ĐÒN THƯỜNG CỦA BOSS CHẠM TRÁN (đợt cài 2026-11-04,
     thiết kế docs/boss-skill-fx-report.md Mục 2.1 #1–#8) =====
     Khung chung cho 7 boss: vòng chấn động màu loài ở chân + tiếng ra
     đòn theo loài + một đường đòn SỐNG từ boss tới người chơi, phân
     nhánh theo species. RÀNG BUỘC CỨNG: hàm này chỉ VẼ và PHÁT TIẾNG —
     sát thương, hệ số, chu kỳ và thời điểm trừ máu nằm trọn ở
     monsterStrike/hurtPlayer phía trên và KHÔNG đổi một con số nào;
     dấu hiệu tụ lực (xem khối vẽ trong drawMonster) chỉ nằm BÊN TRONG
     chu kỳ atkT sẵn có, không thêm thời gian né nào. Ngân sách: mỗi
     đòn cộng thêm tối đa ~11 hạt, tự co khi parts đã cao (bossFxBudget),
     trần chung MAX_PARTS 90 do spawnParts/spawnSmoke tự giữ. */
  var BOSS_FX_SPECIES = { lang_vuong: 1, son_chu: 1, thuy_xa_tinh: 1, thach_tuong_thu_ve: 1, tan_anh_vo_cuc: 1, kiem_y_tan_hon: 1, oan_hon_chien_truong: 1, ho_tam_thach_tuong: 1 };
  function bossFxBudget(n) { // tự co ngân sách hạt khi parts.length đã cao (đúng thói quen của spawnResParts)
    if (parts.length >= MAX_PARTS) return 0;
    if (parts.length > MAX_PARTS - 24) return Math.min(n, 2);
    return n;
  }
  function bossStrikeFx(m) {
    var opening = !!m.bossFxOpening; m.bossFxOpening = false;
    if (!BOSS_FX_SPECIES[m.species]) return;
    var mcx = m.x + 16, mcy = m.y + 16, pcx = px + 16, pcy = py + 16;
    var ang = Math.atan2(pcy - mcy, pcx - mcx);
    var col = MON_PARTS[m.species] || '200,200,200';
    if (!SET || SET.current.fxRings) rings.push({ x: mcx, y: m.y + 30, r: 6, a: 0.65, col: col }); // vòng chấn động lúc chiêu ra tại chân boss
    if (m.species === 'lang_vuong') {
      // #1 Lang Vương: BA vệt trảo gió song song lệch ±0,18 rad quanh
      // hướng đòn + bụi gió cuốn theo; từ nửa máu (đợt 3 trở đi theo
      // mốc máu ≤ 50%) thêm vệt thứ tư và gió nhanh hơn — chỉ trình
      // diễn, số đòn không đổi.
      sfxMonsterCry(m.species, false);
      var enraged = m.hp <= m.hpMax * 0.5;
      spawnParts(mcx, mcy - 4, bossFxBudget(4), '190,200,215', enraged ? 58 : 40, false);
      var offs = enraged ? [-0.27, -0.09, 0.09, 0.27] : [-0.18, 0, 0.18];
      for (var li = 0; li < offs.length; li++) spawnStreak(mcx, mcy - 6, ang + offs[li], '190,200,215', false);
      if (m.hp <= m.hpMax * 0.25) spawnPetals(mcx, mcy - 24, bossFxBudget(2)); // chấn động rung cánh anh đào quanh ổ (thung lũng hoa)
    } else if (m.species === 'son_chu') {
      // #2 Sơn Chủ: đòn nặng — gầm trầm, bụi đất rơi, VỆT NỨT ĐẤT LAN
      // theo đoạn từ chân boss tới chân người chơi, rung cấp đòn nặng.
      sfxRoar(true);
      spawnParts(mcx, m.y + 28, bossFxBudget(6), '150,130,110', 26, false);
      var pts = [], jit = [0, 7, -6, 5, -4, 3, 0];
      for (var ci = 0; ci <= 6; ci++) {
        var cf = ci / 6;
        pts.push([mcx + (pcx - mcx) * cf, (m.y + 30) + ((py + 30) - (m.y + 30)) * cf + jit[ci]]);
      }
      bossFx.push({ kind: 'crack', pts: pts, t: 0, dur: 0.8 });
      shakeWorld(0.35);
      if (m.hp <= m.hpMax * 0.25) spawnPetals(mcx, mcy - 24, bossFxBudget(2)); // đợt cuối: chấn động rung hoa quanh ổ
    } else if (m.species === 'thuy_xa_tinh') {
      // #3 Thủy Xà Tinh: vệt SÓNG NƯỚC lệch sin theo thời gian (opts.wave
      // của spawnStreak) + giọt nước rơi ở đích + gợn elip ở đầu rắn.
      // LƯU Ý: 3 hạt xanh lục quanh đầu rắn chỉ là TRANG TRÍ màu độc —
      // boss này KHÔNG có cơ chế độc: không trạng thái, không số nào kèm.
      sfxMonsterCry(m.species, false);
      bossFx.push({ kind: 'ripple', x: mcx, y: m.y + 30, t: 0, dur: 0.5 });
      spawnStreak(mcx, mcy - 4, ang, '80,170,190', false, { wave: 10 });
      spawnParts(pcx, pcy - 6, bossFxBudget(5), '80,170,190', 30, false);
      spawnParts(mcx, mcy - 18, bossFxBudget(3), '110,190,120', 12, true); // hạt "độc" trang trí thuần (xem lưu ý trên)
    } else if (m.species === 'thach_tuong_thu_ve') {
      // #4 Thạch Tượng: đòn ĐẬP THẲNG XUỐNG — bụi đá BẬT ĐỨNG tại chân
      // người chơi + mảnh khói đá + nốt kim loại 2400 Hz lúc chạm +
      // rung cấp nặng + dừng hình 0,06s (trong trần khóa 300ms sẵn có).
      // Vòng tụ CO LẠI đọc ở nửa vận đòn nằm trong drawMonster.
      sfxRoar(true);
      spawnParts(pcx, py + 30, bossFxBudget(8), '160,155,140', 34, true);
      spawnSmoke(pcx, py + 24, Math.min(3, bossFxBudget(3)), '168,160,148');
      sfxHitBlade(); // tiếng kim loại của vỏ đá-kim lúc đòn chạm
      shakeWorld(0.35);
      hitStop(0.06);
    } else if (m.species === 'tan_anh_vo_cuc') {
      // #5 Tàn Ảnh Vô Cực: hai BÓNG TÀN ẢNH của chính sprite boss lệch
      // ngược hướng đòn (8px / 16px, mờ 0,35 / 0,18) + vệt trảo ảnh
      // NHẤP NHÁY mất-hiện trong lúc trượt (opts.flick của spawnStreak).
      sfxMonsterCry(m.species, false);
      sfxWind();
      if (imgReady(ASSETS.mons[m.species])) {
        var gs = monSrc(m), gsize = MON_SHEET[m.species] || 136;
        [8, 16].forEach(function (off, gi) {
          bossFx.push({ kind: 'ghost', species: m.species, src: gs, size: gsize, face: m.face,
            x: mcx - Math.cos(ang) * off, y: (m.y + 32) - Math.sin(ang) * off * 0.5,
            alpha: gi === 0 ? 0.35 : 0.18, t: 0, dur: 0.3 });
        });
      }
      spawnStreak(mcx, mcy - 6, ang, '200,210,255', false, { flick: true });
    } else if (m.species === 'kiem_y_tan_hon') {
      // #6 Kiếm Ý Tàn Hồn: kiếm khí TỰ BAY — kiếm ánh sáng DỰNG ĐỨNG
      // trên đầu boss trong 0,35s cuối của chu kỳ atkT (vẽ ở
      // drawMonster) rồi LAO THẬT bằng streak lớn + tia lửa lam bám đuôi.
      sfxSword();
      sfxMonsterCry(m.species, false);
      if (opening) {
        // #7 ĐÒN MỞ MÀN "kiếm ý nhớ tiếng người": 3 kiếm dựng quanh
        // boss + cột sáng mảnh + 3 kiếm LAO NỐI TIẾP cách nhau 0,12s
        // (hai kiếm đầu nhỏ/mờ tan giữa đường, kiếm cuối là streak lớn).
        // Số vẫn là ĐÚNG MỘT đòn monsterStrike như mã gốc — hai kiếm
        // đầu là lớp trình diễn, không thêm lần trừ máu nào. (Lệch
        // trình diễn đã ghi ở báo cáo bàn giao: khung trừ máu của đòn
        // mở màn vốn là NGAY khi trận bắt đầu theo mã gốc và ràng buộc
        // không đổi thời điểm trừ máu, nên nhịp lao nối tiếp chạy từ
        // khung mở màn đó thay vì kết thúc đúng vào nó.)
        spawnPillar(mcx, m.y + 30, { dur: 0.8, h: 100 });
        bossFx.push({ kind: 'swordStand', x: mcx, y: m.y + 30, t: 0, dur: 0.36 });
        spawnStreak(mcx, mcy - 10, ang - 0.15, '190,210,255', false, { alpha: 0.55 });
        spawnStreak(mcx, mcy - 10, ang + 0.15, '190,210,255', false, { alpha: 0.55, delay: 0.12 });
        spawnStreak(mcx, mcy - 10, ang, '190,210,255', true, { delay: 0.24 });
      } else {
        spawnStreak(mcx, mcy - 10, ang, '190,210,255', true);
      }
      spawnParts((mcx + pcx) / 2, (mcy + pcy) / 2 - 6, bossFxBudget(4), '170,220,255', 36, true);
    } else if (m.species === 'oan_hon_chien_truong') {
      // #8 Oán Hồn Chiến Trường: khói oán CUỘN quanh thân lúc vận đòn +
      // tiếng gào + vệt TRẢO KHÓI mờ kèm khói bám đường trảo tan chậm.
      sfxGhostWail();
      spawnSmoke(mcx, mcy - 10, bossFxBudget(5), '110,130,170');
      spawnStreak(mcx, mcy - 6, ang, '150,160,200', false, { alpha: 0.55 });
      spawnSmoke((mcx + pcx) / 2, (mcy + pcy) / 2, Math.min(3, bossFxBudget(3)), '110,130,170');
    } else if (m.species === 'ho_tam_thach_tuong') {
      // Hộ Tâm Thạch Tướng (boss giữa Di Tích Trận Tâm): ngôn ngữ ĐÁ /
      // TRẬN — vòng tụ NỨT ĐẤT lan từ chân boss về phía người chơi,
      // mảnh đá văng + bụi đá ở điểm chạm, gầm trầm của đá. Chỉ trình
      // diễn sau khi số đòn đã áp ở monsterStrike như mọi case trên.
      sfxRoar(true);
      if (!SET || SET.current.fxRings) rings.push({ x: mcx, y: m.y + 30, r: 10, a: 0.8, col: '190,170,120' });
      var cpts = [], cjit = [0, 6, -5, 4, -3, 2, 0];
      for (var cci = 0; cci <= 6; cci++) {
        var ccf = cci / 6;
        cpts.push([mcx + (pcx - mcx) * ccf, (m.y + 30) + ((py + 30) - (m.y + 30)) * ccf + cjit[cci]]);
      }
      bossFx.push({ kind: 'crack', pts: cpts, t: 0, dur: 0.8 });
      spawnParts(pcx, py + 28, bossFxBudget(8), '172,164,148', 36, true); // mảnh đá văng tại điểm chạm
      spawnParts(mcx, m.y + 28, bossFxBudget(5), '150,142,128', 24, false);
      spawnSmoke(mcx, m.y + 24, Math.min(3, bossFxBudget(3)), '168,160,148'); // bụi đá quanh chân boss
      shakeWorld(0.3);
    }
  }
  function hurtPlayer(dmg) {
    if (!state || dmg <= 0 || !enc) return;
    // Pháp bảo Hộ thể (Huyền Quang Kính): giảm sát thương chiến đấu
    // phải chịu — qua phễu hurtPlayer duy nhất của làn chạm trán/bí
    // cảnh, trần cứng 20% nằm ở L.treasureDmgCut. Độ kiếp KHÔNG qua
    // hàm này (đường lôi riêng, giảm lôi riêng) nên hai hệ không gộp.
    var pbCut = L.treasureDmgCut(state);
    if (pbCut > 0) dmg = Math.max(1, Math.round(dmg * (1 - pbCut)));
    var before = state.hp;
    state.hp = Math.max(0, state.hp - dmg);
    addDmgFloat(px + 16, py - 24, '-' + dmg, '255,110,100', { size: 19, targetKey: '__player' });
    if (before - state.hp >= state.hpMax * 0.05) hurtT = 0.33; // quầng đỏ mép màn khi mất >= 5% máu tối đa
    playerHurtT = 0.07;
    sfxHurt();
    shakeWorld(0.12);
    refreshHUD();
    if (state.hp <= 0) defeatInBattle();
  }
  /* Thua trận thường: mức phạt NHẸ nhất quán với luật thất bại độ kiếp
     của thiết kế cảnh giới — không tụt cảnh giới, không mất vật phẩm;
     người chơi tỉnh lại ở điểm an toàn gần nhất (điểm thổ nạp của bản
     đồ) với 25% máu, quái thắng trở về ổ với máu đầy. */
  function defeatInBattle() {
    if (state.map && state.map.indexOf('bc_') === 0) { bcDefeat(); return; }
    var m = enc ? enc.mon : null;
    endEncounterCleanup();
    if (m) { m.hp = m.hpMax; m.holdT = 0; m.sealT = 0; m.mode = 'return'; }
    state.hp = Math.round(state.hpMax * 0.25);
    defeatGraceT = 3;
    var medPt = L.activeMap().meditate;
    if (medPt) {
      fadeTransition(function () {
        px = medPt.x * TILE; py = medPt.y * TILE;
        state.x = medPt.x; state.y = medPt.y;
        refreshHUD(); saveNow();
      });
    }
    toast('Ngươi gục xuống... Khi tỉnh lại, ngươi đã ở nơi an toàn gần nhất với 25% máu. Cảnh giới không hề sụt — chỉ là một trận thua, dưỡng thương rồi quay lại.', 5600);
    maybeShowHuntSummary();
    refreshHUD(); saveNow();
  }

  /* ----- Đòn của người chơi ----- */
  function encTargetInRange(maxTiles) {
    var m = enc.mon;
    return Math.hypot((m.x + 16) - (px + 16), (m.y + 16) - (py + 16)) <= maxTiles * TILE;
  }
  function bestSwordMove() {
    if (L.bestSwordMoveFor) return L.bestSwordMoveFor(state); // hợp đồng mục 9: helper dữ liệu (gồm Huyền Tinh Trảm 1,9 < Quy Nhất 2,5)
    var t = L.techniqueOf(state, 'that_tinh'), tier = t ? t.tier : 1, mv = L.SWORD_MOVES[0];
    L.SWORD_MOVES.forEach(function (x) { if (x.tier <= tier) mv = x; });
    return mv;
  }
  function encCastSword() {
    var m = enc.mon;
    if (!encTargetInRange(1.9)) { toast('Quái còn xa — lại gần thêm để xuất kiếm.'); return; }
    var mv = bestSwordMove();
    var r = L.castSword(state, mv.id);
    if (!r.ok) { toast(r.reason); return; }
    faceMonster(m);
    sfxSword(mv.id);
    // Điểm kiếm quyết: +2 cho mỗi LẦN GỌI chiêu thành công trong trận
    // (Liên Hoàn hai đòn vẫn chỉ là một lần gọi — cùng luật đếm với
    // trận Thăng Long Đạo của cốt truyện).
    var gain = L.techniqueGain(state, 'that_tinh', 2);
    if (gain.tierUps && gain.tierUps.length) presentTechTierUp('that_tinh', gain.tier);
    startSwordBody(mv.id, tNow, r.hits > 1 ? tNow + 120 : null); // khung trúng đích khóa tại t=0 (và +120ms cho nhịp 2)
    for (var i = 0; i < r.hits; i++) {
      if (i === 0) applyHitToMonster(m, r.power, { kind: 'sword', move: mv.id, hitIdx: 0 });
      else enc.pendingHits.push({ at: tNow + i * 120, power: r.power, kind: 'sword', move: mv.id, hitIdx: i });
      if (!enc) return; // đòn đầu đã kết liễu
    }
    refreshHUD();
  }
  var WORD_FLOAT = { pha: ['PHÁ!', '255,90,70'], chan: ['CHẤN!', '150,200,255'], dinh: ['ĐỊNH!', '170,220,255'], phong: ['PHONG!', '255,214,120'] };
  /* ================= Ngôn ngữ hiệu ứng kỹ năng theo mẫu của Bui (gói phụ 10) =================
     Bui gửi video mẫu 10:38 ngày 2026-11-02: cột sáng VÀNG dựng từ vòng
     TRẬN PHÁP lam phát sáng ở mặt đất, VÒNG TÍM xoay trên đỉnh cột, hai
     LÁ BÙA VÀNG lơ lửng hai bên, CÁNH HOA anh đào bay, vệt KIẾM QUANG
     lam lướt ngang, KHÓI lam xám cuộn ở rìa. Ánh xạ vào game (toàn bộ
     vẽ bằng canvas trong engine, không nạp tài sản ngoài; hạt dùng
     chung ngân sách MAX_PARTS):
     - Cột sáng + trận pháp: khoảnh khắc lớn — ĐỊNH/PHONG khi xuất,
       đòn kết liễu tỉ thí, boss gục (nâng cấp cột Kết Đan sẵn có).
     - Vòng tím trên đỉnh cột + vòng tím lơ lửng quanh quái: bản sắc
       riêng của ĐỊNH (khép nợ phân biệt ĐỊNH/PHONG của phần 3).
     - Hai lá bùa vàng khép hai bên mục tiêu: bản sắc riêng của PHONG
       (ấn vuông vàng trên đầu giữ làm lớp thứ hai).
     - Vệt kiếm quang: mọi đòn kiếm quyết trúng đích (Liên Hoàn, Phá
       Quân, Quy Nhất), chiêu kiếm trong tỉ thí và đánh đêm.
     - Cánh hoa: chiêu của U Nhàn trong tỉ thí, boss thung lũng gục.
     - Khói lam xám: kẻ bịt mặt xuất hiện, quái gục. */
  var pillars = [], streaks = [];
  /* Lớp hiệu ứng RIÊNG của đòn boss (đợt cài hiệu ứng boss 2026-11-04,
     theo docs/boss-skill-fx-report.md Mục 2.1/2.2): các vật thể vẽ thuần
     trình diễn mà nguyên hàm sẵn có không biểu diễn được — vệt nứt đất
     lan theo đoạn (Sơn Chủ), bóng tàn ảnh sprite (Tàn Ảnh Vô Cực), ba
     kiếm dựng mở màn (Kiếm Ý Tàn Hồn), gợn nước elip (Thủy Xà Tinh),
     điểm sáng tụ (Cửu Phẩm Kiếm Khí của Lục Tranh). Cập nhật bằng dtW
     trong vòng lặp như pillars/streaks, dọn trong resetPresentationState.
     TUYỆT ĐỐI không mang số gameplay nào. */
  var bossFx = [];
  /* Sân cộng hưởng + đường sóng khóa Vạn Âm (bước 2, thiết kế 3.2–3.4):
     cấu trúc trình diễn thuần, dọn trong resetPresentationState, cập
     nhật bằng dtW nên tôn trọng dừng hình GF-03 như pillars/streaks. */
  var resFields = [], resWaves = [], resSeedSeq = 0, resPassiveT = 9;
  // Neo biển mây của Thanh Vân Tông (gói phụ 12): tâm các hõm vực giữa
  // các đỉnh — tây bắc (hõm thác), tây (dưới đài), hõm cầu đá, hõm đông,
  // sau núi, vành bắc và sườn nam.
  var CLOUD_SEA = [[36, 20], [40, 26], [8, 58], [14, 66], [61, 48], [97, 40], [90, 48],
                   [100, 26], [112, 10], [20, 2], [64, 1], [30, 84], [84, 84]];
  // Neo biển mây của đỉnh Thăng Long (đợt tách bản đồ riêng 2026-11-05):
  // mọi neo đều nằm trên ô vách vực 'X' quanh khối đỉnh duy nhất — sườn
  // tây, sườn đông, chân nam dưới thềm vào và vành bắc sau chỏm — mây
  // trôi ở tầng thấp bao quanh đỉnh, không phủ mặt đài hay trục thang.
  var TL_CLOUD_SEA = [[1, 12], [2, 26], [46, 14], [45, 27], [6, 33], [40, 33], [16, 33], [24, 0], [8, 0]];
  function spawnPillar(x, y, opts) {
    opts = opts || {};
    pillars.push({ x: x, y: y, t: 0, dur: opts.dur || 0.9, h: opts.h || 120, top: opts.top || null, big: !!opts.big });
    if (pillars.length > 4) pillars.shift();
  }
  /* Kiếm khí / kiếm quang — NÂNG ĐỘ RÕ theo phản hồi của Bui (13:42 ngày
     02/11: "Hình kiếm khí phải rõ ràng"). Thông số TRƯỚC: vệt 0,22 giây,
     dài 76px, thân dày tối đa ~9px mờ hai đầu, lõi chỉ là một vạch trắng
     1,6px — ở cỡ điện thoại không đọc được là kiếm. Thông số SAU: lưỡi
     liềm năng lượng có DÁNG (cong, nhọn hai đầu, dày ở giữa), lõi trắng
     nóng chạy dọc thân, quầng phát sáng màu đậm bọc ngoài, hai bóng liềm
     mờ bám đuôi để mắt theo kịp đường chém; tồn tại 0,45 giây (chiêu
     dấu ấn/chí mạng: 0,55 giây, dài 150px). Mọi điểm gọi (kiếm quyết,
     tỉ thí, đánh đêm, Thăng Long, hình chiếu) dùng chung hàm này. */
  function spawnStreak(x, y, ang, col, big, opts) {
    opts = opts || {};
    streaks.push({ x: x, y: y, ang: ang, t: 0, dur: big ? 0.55 : 0.45, col: col || '170,230,255', big: !!big,
      scale: opts.scale || 1, guard: opts.guard || null, core: opts.core || null, thick: opts.thick || 0, swordFx: true,
      // arc (đợt walk2 giai đoạn hai — lệnh Bui 11:48 bỏ "hình kiếm bay
      // ra" cho đòn kiếm NGƯỜI CHƠI): vệt được vẽ bằng drawArcSlash —
      // cung mỏng ôm quỹ đạo lưỡi đang vung, không chuôi/quai/tán kiếm,
      // không đọc thành thanh kiếm rời. Chỉ các điểm gọi của người chơi
      // trong presentSwordHit/presentHuyenTinh truyền arc:true; vệt của
      // boss/quái và cộng hưởng giữ nguyên renderer hình kiếm cũ.
      arc: !!opts.arc,
      // opts của lớp hiệu ứng boss (gộp đợt boss-fx): wave = biên độ lệch
      // sin vuông góc lúc trượt (vệt sóng nước Thủy Xà); flick = alpha
      // nhấp nháy mất-hiện (trảo ảnh Tàn Ảnh); alpha = hệ số mờ tổng
      // (vệt trảo khói Oán Hồn); delay = giây chờ trước khi vệt trượt
      // (kiếm lao nối tiếp của Kiếm Ý mở màn). Mọi điểm gọi cũ không đổi.
      wave: opts.wave || 0, flick: !!opts.flick, alpha: opts.alpha == null ? 1 : opts.alpha, delay: opts.delay || 0 });
    if (streaks.length > 12) streaks.shift();
    if (window.__VSLC_FX_COUNT) window.__VSLC_FX_COUNT.swordDraws++;
  }
  function streakBladePath(L, T) {
    ctx.beginPath();
    ctx.moveTo(-L / 2, 0);
    ctx.quadraticCurveTo(-L * 0.08, -T, L / 2, 0);
    ctx.quadraticCurveTo(-L * 0.08, T * 0.55, -L / 2, 0);
    ctx.closePath();
  }
  function drawPillar(pl) {
    var k = pl.t / pl.dur;                       // 0 -> 1
    var env = k < 0.18 ? k / 0.18 : (k > 0.72 ? Math.max(0, (1 - k) / 0.28) : 1); // mờ vào/ra
    var H = pl.h * (0.35 + 0.65 * env), W = pl.big ? 21 : 15;
    var grd = null;
    try { grd = ctx.createLinearGradient(pl.x, pl.y - H, pl.x, pl.y); } catch (e) { grd = null; }
    if (grd) {
      grd.addColorStop(0, 'rgba(255,244,200,0)');
      grd.addColorStop(0.75, 'rgba(255,238,180,' + (0.34 * env) + ')');
      grd.addColorStop(1, 'rgba(255,246,205,' + (0.62 * env) + ')');
      ctx.fillStyle = grd;
    } else ctx.fillStyle = 'rgba(255,240,190,' + (0.3 * env) + ')';
    ctx.fillRect(pl.x - W, pl.y - H, W * 2, H);
    // Lõi sáng + SỢI SÁNG DỌC dày như bó sợi quang trong video mẫu
    // (sao chép nguyên mẫu theo chuẩn Bui 11:37 ngày 02/11: cột hẹp, lõi
    // trắng nóng, nhiều vân sợi mảnh chạy dọc thân cột).
    ctx.fillStyle = 'rgba(255,252,235,' + (0.5 * env) + ')';
    ctx.fillRect(pl.x - 2.5, pl.y - H, 5, H);
    for (var fi = 0; fi < 6; fi++) {
      var fx = pl.x - W * 0.72 + fi * (W * 1.44 / 5);
      var fa = 0.13 + 0.13 * (0.5 + 0.5 * Math.sin(tNow / 260 + fi * 1.9));
      ctx.fillStyle = 'rgba(255,248,214,' + (fa * env) + ')';
      ctx.fillRect(fx, pl.y - H + ((fi * 7) % 9), 1.3, Math.max(6, H - ((fi * 7) % 9) - 6));
    }
    // Vòng trận pháp lam ở đế: LAN RỘNG DẦN theo đời cột như video mẫu
    // (khung đầu nhỏ quanh chân cột, mở hết cỡ ở ~62% đời), hai vòng
    // đồng tâm + 10 KHỐI CHỮ rune hướng tâm xoay chậm + vũng sáng trắng
    // nóng ở tâm nơi cột đáp xuống.
    var grow = Math.min(1, pl.t / (pl.dur * 0.62));
    var rr = (pl.big ? 44 : 34) * (0.36 + 0.64 * grow);
    ctx.fillStyle = 'rgba(255,252,238,' + (0.55 * env) + ')';
    ctx.beginPath(); ctx.ellipse(pl.x, pl.y, rr * 0.42, rr * 0.15, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(127,232,224,' + (0.9 * env) + ')'; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.ellipse(pl.x, pl.y, rr, rr * 0.34, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = 'rgba(127,232,224,' + (0.55 * env) + ')'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.ellipse(pl.x, pl.y, rr * 0.62, rr * 0.21, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.save();
    ctx.translate(pl.x, pl.y); ctx.scale(1, 0.34); ctx.rotate(tNow / 1600);
    ctx.fillStyle = 'rgba(190,246,255,' + (0.8 * env) + ')';
    for (var bi = 0; bi < 10; bi++) {
      var ba = bi * Math.PI / 5;
      ctx.save(); ctx.translate(Math.cos(ba) * rr * 0.81, Math.sin(ba) * rr * 0.81); ctx.rotate(ba + Math.PI / 2);
      ctx.fillRect(-3.4, -2, 6.8, 4);
      ctx.restore();
    }
    ctx.restore();
    // Quầng tím trên đỉnh cột — bản sắc ĐỊNH: elip tím-trắng đặc ruột
    // với hai đuôi xoắn thiên hà mở ra hai bên như video mẫu.
    if (pl.top === 'purple') {
      var ty = pl.y - H - 4, tw = W * 1.9;
      ctx.strokeStyle = 'rgba(150,90,230,' + (0.5 * env) + ')'; ctx.lineWidth = 3.2;
      for (var wi = 0; wi < 2; wi++) {
        var wdir = wi === 0 ? 1 : -1;
        ctx.beginPath();
        for (var ws = 0; ws <= 10; ws++) {
          var wa = ws / 10, wr = tw * (0.9 + wa * 1.15);
          var wx = pl.x + wdir * Math.cos(wa * 1.9) * wr, wy = ty + Math.sin(wa * 1.9) * wr * 0.3 - wa * 3;
          if (ws === 0) ctx.moveTo(wx, wy); else ctx.lineTo(wx, wy);
        }
        ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(216,180,255,' + (0.95 * env) + ')'; ctx.lineWidth = 2.8;
      ctx.beginPath(); ctx.ellipse(pl.x, ty, tw, tw * 0.3, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = 'rgba(255,246,255,' + (0.5 * env) + ')';
      ctx.beginPath(); ctx.ellipse(pl.x, ty, tw * 0.55, tw * 0.16, 0, 0, Math.PI * 2); ctx.fill();
    }
  }
  /* === ARCIV_FX: hình kiếm theo tỉ lệ KHÓA 3.6 (docs/bitich-effects-design.md) ===
     Lưỡi 68-72% L, ngang <=6,6% L; đốc >=2,8x ngang lưỡi va >=17% L, tông tối
     <=0,55x danh nghĩa; cán 24-28% L sẫm <=0,35x, quấn chỉ, núm >=2,2% L;
     hào quang <=2% L, alpha <=0,30. Thay renderer liềm cũ cho MỌI vệt kiếm. */
  function drawSwordShape(cx, cy, ang, L, body, core, guard, alpha, thickAdd) {
    var bladeL = L * 0.70, guardT = Math.max(2.2, L * 0.038), guardW = L * 0.19, gripL = L * 0.268;
    var halfW = Math.min(L * 0.033, L * 0.026 + (thickAdd || 0) * 0.4);
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(ang);
    // hào quang phụ (trần cứng)
    ctx.save(); ctx.globalAlpha = 0.30 * alpha; ctx.fillStyle = 'rgb(' + body + ')';
    ctx.beginPath(); ctx.ellipse(L * 0.18, 0, L * 0.52, halfW + L * 0.016, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    // lưỡi: silhouette có viền định hình sẫm, hai cạnh sáng, sống trắng giữa
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.moveTo(-bladeL * 0.02, -halfW); ctx.lineTo(bladeL * 0.55, -halfW * 0.92); ctx.lineTo(bladeL, 0); ctx.lineTo(bladeL * 0.55, halfW * 0.92); ctx.lineTo(-bladeL * 0.02, halfW); ctx.closePath();
    ctx.fillStyle = 'rgb(' + body + ')'; ctx.fill();
    ctx.strokeStyle = 'rgba(30,50,90,0.85)'; ctx.lineWidth = Math.max(0.8, L * 0.008); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(bladeL * 0.94, 0); ctx.strokeStyle = 'rgba(' + core + ',0.95)'; ctx.lineWidth = Math.max(0.8, halfW * 0.55); ctx.stroke();
    // đốc tối tương phản + núm hai đầu
    ctx.fillStyle = 'rgb(' + guard + ')';
    ctx.fillRect(-guardT / 2, -guardW / 2, guardT, guardW);
    ctx.beginPath(); ctx.arc(0, -guardW / 2, guardT * 0.62, 0, Math.PI * 2); ctx.arc(0, guardW / 2, guardT * 0.62, 0, Math.PI * 2); ctx.fill();
    // cán sẫm quấn chỉ chéo + núm có tâm sáng
    ctx.fillStyle = 'rgb(' + shadeCol(guard, 0.62) + ')';
    ctx.fillRect(-guardT / 2 - gripL, -halfW * 0.82, gripL, halfW * 1.64);
    ctx.strokeStyle = 'rgba(200,210,255,0.35)'; ctx.lineWidth = 1;
    for (var wi = 0; wi < 4; wi++) { ctx.beginPath(); ctx.moveTo(-guardT / 2 - gripL + wi * gripL / 4, halfW * 0.8); ctx.lineTo(-guardT / 2 - gripL + wi * gripL / 4 + gripL / 8, -halfW * 0.8); ctx.stroke(); }
    ctx.beginPath(); ctx.arc(-guardT / 2 - gripL, 0, Math.max(1.6, L * 0.023), 0, Math.PI * 2); ctx.fillStyle = 'rgb(' + guard + ')'; ctx.fill();
    ctx.beginPath(); ctx.arc(-guardT / 2 - gripL, 0, Math.max(0.7, L * 0.008), 0, Math.PI * 2); ctx.fillStyle = 'rgba(' + core + ',0.9)'; ctx.fill();
    ctx.restore(); ctx.globalAlpha = 1;
  }
  function shadeCol(col, k) { var a = String(col).split(','); return Math.round(+a[0] * k) + ',' + Math.round(+a[1] * k) + ',' + Math.round(+a[2] * k); }
  /* Cung chém mỏng cho đòn kiếm NGƯỜI CHƠI (đợt walk2 giai đoạn hai):
     chỉ lưỡi cong thon (dùng lại streakBladePath với bề dày ~4,5% dài)
     + một sợi lõi sáng — tuyệt đối không vẽ quai/chuôi/tán. */
  function drawArcSlash(cx, cy, ang, L, col, core, alpha) {
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(ang);
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha)) * 0.9;
    ctx.fillStyle = 'rgb(' + col + ')';
    streakBladePath(L, Math.max(2.2, L * 0.045)); ctx.fill();
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    ctx.strokeStyle = 'rgb(' + core + ')'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(-L / 2, 0); ctx.quadraticCurveTo(0, -L * 0.02, L / 2, 0); ctx.stroke();
    ctx.restore(); ctx.globalAlpha = 1;
  }
  function drawStreaks() {
    streaks.forEach(function (st) {
      if (st.delay > 0) return; // boss-fx: vệt đang chờ nhịp lao nối tiếp (Kiếm Ý mở màn) — chưa hiện
      if (st.arc) { // vệt cung của người chơi: ngắn (ôm lưỡi đang vung), trượt ít, một bóng mờ bám đuôi
        var ka = st.t / st.dur, aa = Math.sin(Math.min(1, ka) * Math.PI);
        if (st.alpha != null) aa *= st.alpha;
        var La = (st.big ? 92 : 64) * (st.scale || 1);
        var ha = (ka - 0.5) * La * 0.2;
        var cax = st.x + Math.cos(st.ang) * ha, cay = st.y + Math.sin(st.ang) * ha;
        var coreA = st.core || '235,245,255';
        drawArcSlash(cax - Math.cos(st.ang) * 9, cay - Math.sin(st.ang) * 9, st.ang, La * 0.94, st.col, coreA, aa * 0.16);
        drawArcSlash(cax, cay, st.ang, La, st.col, coreA, Math.max(0.2, aa));
        return;
      }
      var k = st.t / st.dur, a = Math.sin(Math.min(1, k) * Math.PI);
      if (st.alpha != null) a *= st.alpha; // boss-fx: mờ tổng (vệt trảo khói của Oán Hồn)
      if (st.flick) a *= (Math.sin(st.t * 46) > -0.25 ? 1 : 0.12); // boss-fx: trảo ảnh nhấp nháy mất-hiện hai lần trong lúc trượt
      var L = (st.big ? 170 : 120) * (st.scale || 1);
      var head = (k - 0.5) * L * 0.38;
      var cx = st.x + Math.cos(st.ang) * head, cy = st.y + Math.sin(st.ang) * head;
      if (st.wave) { // boss-fx: vệt sóng nước — đầu vệt lệch sin vuông góc, biên độ tắt dần hai đầu trượt
        var wOff = Math.sin(k * Math.PI) * Math.sin(k * Math.PI * 3) * st.wave;
        cx += Math.cos(st.ang + Math.PI / 2) * wOff; cy += Math.sin(st.ang + Math.PI / 2) * wOff;
      }
      var crit = st.col === '255,226,150';
      var guard = st.guard || (crit ? '150,110,40' : '45,70,110');
      var core = st.core || (crit ? '255,246,220' : '235,245,255');
      // hai bóng kiếm mờ bám đuôi (chuyển động liên tục, không phải ảnh tĩnh)
      for (var g = 2; g >= 1; g--) drawSwordShape(cx - Math.cos(st.ang) * g * 13, cy - Math.sin(st.ang) * g * 13, st.ang, L * (1 - g * 0.08), st.col, core, guard, a * 0.22, st.thick || 0);
      drawSwordShape(cx, cy, st.ang, L, st.col, core, guard, Math.max(0.25, a), st.thick || 0);
    });
  }


  /* ================= ARCIV_FX — trình diễn cung IV đợt 1 =================
     Sao dẫn kiếm + đồ sao + cử động thân theo chiêu + nghi thức lên tầng +
     Huyền Tinh Trảm + lá Thanh Phong. THUẦN TRÌNH DIỄN: không hàm nào ở
     đây đổi thời điểm/số sát thương — mọi điểm móc đều chạy TẠI hoặc SAU
     thời điểm pipe áp sát thương, khung trúng đích khóa đúng t=0 đó. */
  window.__VSLC_FX_COUNT = window.__VSLC_FX_COUNT || { swordDraws: 0, stars: 0, tierUps: {}, bodyAnims: 0, huyen: 0 };
  var FXC = window.__VSLC_FX_COUNT;
  var starFx = [], constFx = [], miniSwords = [], swordFxLog = [];
  var BEIDOU = [[2,6],[20,12],[36,19],[50,25],[52,43],[74,45],[76,27]];
  var BEIDOU_LINES = [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,3]];
  var HUYENCAU = [[10,8],[26,30],[48,50],[72,44],[86,18]];
  var HUYENCAU_LINES = [[0,1],[1,2],[2,3],[3,4]]; // tuyến MỞ 1->2->3->4, không khép
  function fxTier() { var t = L.techniqueOf(state, 'that_tinh'); return Math.max(1, Math.min(4, t ? t.tier : 1)); }
  var P_STARS = [0,1,3,5,7], P_SCALE = [0,0.85,1,1.15,1.3], P_BURST = [0,4,7,10,14];
  function spawnStar(x, y, col, core, size, delay, dur) {
    starFx.push({ x: x, y: y, t: -(delay || 0), dur: dur || 0.5, col: col || '150,200,255', core: core || '235,245,255', size: size || 1 });
    if (starFx.length > 60) starFx.shift(); FXC.stars++;
  }
  function drawStarShape(x, y, size, col, core, alpha) {
    var s1 = 11 * size, s2 = 3 * size;
    ctx.save(); ctx.translate(x, y); ctx.globalAlpha = alpha;
    ctx.fillStyle = 'rgb(' + col + ')';
    ctx.beginPath(); ctx.moveTo(0, -s1); ctx.lineTo(s2 * 0.4, -s2 * 0.4); ctx.lineTo(s1, 0); ctx.lineTo(s2 * 0.4, s2 * 0.4); ctx.lineTo(0, s1); ctx.lineTo(-s2 * 0.4, s2 * 0.4); ctx.lineTo(-s1, 0); ctx.lineTo(-s2 * 0.4, -s2 * 0.4); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgb(' + core + ')'; ctx.beginPath(); ctx.arc(0, 0, Math.max(1.2, s2 * 0.55), 0, Math.PI * 2); ctx.fill();
    ctx.restore(); ctx.globalAlpha = 1;
  }
  function spawnConstellation(cx, cy, w, pts, lines, col, lineCol, core, dur, spin) {
    constFx.push({ cx: cx, cy: cy, w: w, pts: pts, lines: lines, col: col, lineCol: lineCol, core: core, t: 0, dur: dur || 0.55, spin: spin || 0 });
    if (constFx.length > 6) constFx.shift();
    pts.forEach(function (pt, i) { spawnStar(cx + (pt[0] - 50) / 100 * w, cy + (pt[1] - 31) / 62 * w * 0.62, col, core, 0.9, i * 0.03, (dur || 0.55)); });
  }
  function spawnStarBurst(x, y, n, col, core) {
    if (!fxOn()) return;
    for (var i = 0; i < n && parts.length < MAX_PARTS; i++) {
      var a = (i / Math.max(1, n)) * Math.PI * 2 + 0.4, sp = 22 + (i % 4) * 9;
      parts.push({ kind: 'star', x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * 0.7, life: 0.4, t: 0, col: col, core: core, r: 2.6 });
    }
  }
  function spawnLeaves(x, y, n, rise) {
    if (!fxOn()) return;
    for (var i = 0; i < n && parts.length < MAX_PARTS; i++) {
      var a = (i / Math.max(1, n)) * Math.PI * 2;
      parts.push({ kind: 'leaf', x: x + Math.cos(a) * 22, y: y + 8, vx: -Math.sin(a) * 14, vy: -(rise || 26) - (i % 3) * 6, life: 0.95, t: 0, col: '140,220,160', r: 4.5, rot: a, vr: 2 + (i % 3) });
    }
  }
  /* --- Cử động thân theo chiêu: segments khóa khung trúng đích tại t=0 ---
     startBodySegment nhận hitAtAbs (ms, thang tNow): startAbs = hitAt -
     tổng dur các khung TRƯỚC khung trúng -> tại đúng hitAt, khung hiển thị
     là khung trúng đích. Đòn tức thời: hitAt = tNow (khung lấy đà nằm trong
     quá khứ trình diễn, bị nén — xem khai báo trong CONTRACT); đòn chờ
     (Liên Hoàn nhịp 2, +120ms) chạy đủ khung lấy đà thật. */
  var bodySegs = [];
  var ATK_SETS = {
    A: { cols: [0,1,2,3,4,5], durs: [90,70,80,60,90,150], hit: 3 },
    B1: { cols: [6,7,8], durs: [50,40,30], hit: 2 },
    B2: { cols: [9,10,11,12,13], durs: [60,60,30,80,140], hit: 2 },
    C: { cols: [14,15,16,17,18,19,20,21], durs: [90,90,110,90,70,120,110,140], hit: 4 },
    D: { cols: [22,23,24,25,26,27,28], durs: [90,120,150,150,70,130,160], hit: 4 },
    PHAP: { cols: [0,1,2,3,4,5,6,7,8], durs: [90,90,120,120,120,120,70,110,150], hit: 6 },
    MOT: { cols: [9,10,11,12,13,14], durs: [80,80,110,110,110,60], hit: 5 },
    E: { cols: [29,30,31,32,33,34], durs: [90,100,130,70,90,140], hit: 3 }
  };
  function startBodySegment(sheet, setName, hitAtAbs) {
    var set = ATK_SETS[setName]; if (!set || !ASSETS.atk) return;
    var pre = 0; for (var i = 0; i < set.hit; i++) pre += set.durs[i];
    var total = 0; set.durs.forEach(function (d) { total += d; });
    bodySegs.push({ sheet: sheet, cols: set.cols, durs: set.durs, start: hitAtAbs - pre, total: total, row: dir8 });
    if (bodySegs.length > 4) bodySegs.shift(); FXC.bodyAnims++;
  }
  function bodyFrameNow() {
    for (var i = bodySegs.length - 1; i >= 0; i--) {
      var sg = bodySegs[i], el = tNow - sg.start;
      if (el < 0 || el >= sg.total) continue;
      var acc = 0, col = sg.cols[sg.cols.length - 1];
      for (var j = 0; j < sg.cols.length; j++) { if (el < acc + sg.durs[j]) { col = sg.cols[j]; break; } acc += sg.durs[j]; }
      var im = ASSETS.atk[sg.sheet]; if (!imgReady(im)) return null;
      return { im: im, x: col * 96, y: sg.row * 120, sheet: sg.sheet };
    }
    return null;
  }
  /* Lớp trình diễn KIẾM của người chơi (đợt sửa walk2 tiếp — lệnh Bui
     16:13 2026-11-04): ba trạng thái chuyển sạch — không bao giờ hai
     kiếm cùng lúc, không bao giờ mất kiếm:
       'hand'  — khung thân kiếm chỉ/gốc đang chạy: kiếm nằm trong sheet
                 tấn công, không vẽ kiếm rời. Khung pháp quyết (pq) vẫn
                 tính là không cầm kiếm: kiếm đeo lưng nằm trong chính
                 sheet pq (đã nướng, đợt fix4).
       'ride'  — đã mở ngự kiếm VÀ đang bay (cờ flags.flyRiding): vẽ
                 sheet bay, kiếm ở dưới chân trong chính sheet đó.
       'hover' — đã mở ngự kiếm (flags.flyLearned hoặc flags.flyStage>=2,
                 theo hồ sơ docs/ngukiem-prep/ đã duyệt): kiếm lơ lửng
                 bay bên cạnh, nhún và nghiêng theo nhịp; thân vẽ bằng
                 BẢN SẠCH của sheet (không kiếm nướng trên lưng) kẻo
                 thành hai kiếm (đợt fix4).
       'back'  — mặc định: đeo chéo sau lưng, thấy ở đứng yên và đi bộ;
                 trình diễn ĐÃ NƯỚNG vào từng khung sheet đi bộ kèm dây
                 đeo (đợt fix4), engine không vẽ sprite rời cho trạng
                 thái này nữa.
     Chuỗi nhiệm vụ ngự kiếm tự thân thuộc đợt tích hợp riêng — lớp này
     chỉ ĐỌC cờ mở khóa hiện có, không tự đặt cờ. */
  function flyUnlocked() { return !!(state && state.flags && (state.flags.flyLearned || (state.flags.flyStage | 0) >= 2)); }
  function flyRiding() { return flyUnlocked() && !!(state.flags && state.flags.flyRiding); }
  function swordStateNow(bf) {
    if (bf && bf.sheet !== 'namPq' && bf.sheet !== 'nuPq') return 'hand';
    if (flyRiding()) return 'ride';
    if (flyUnlocked()) return 'hover';
    return 'back';
  }
  // Vẽ sprite kiếm TRẦN rời quanh điểm neo thân (cx, cy = tâm hình vẽ
  // nhân vật) — CHỈ còn dùng cho trạng thái bay lơ lửng bên cạnh (mode
  // 'hover'): kiếm dựng lơ lửng ở phía trái theo hướng nhìn, nhún sin
  // theo thời gian. Trạng thái đeo sau lưng ('back') KHÔNG vẽ ở đây
  // nữa: từ đợt fix4 bao kiếm đã nướng vào từng khung của sheet đi bộ
  // + pháp quyết kèm dây đeo (tools-walk2/fix4/bake_sword.py), bám
  // theo bề mặt lưng của chính khung đó.
  function drawLooseSword(cx, cy, row, mode) {
    var im = ASSETS.swordLoose;
    if (!imgReady(im)) return;
    var t = tNow / 1000;
    ctx.save();
    if (mode === 'hover') {
      var ang = [Math.PI / 2, Math.PI / 4, 0, -Math.PI / 4, -Math.PI / 2, -3 * Math.PI / 4, Math.PI, 3 * Math.PI / 4][row] || 0;
      var fx = Math.cos(ang), fy = Math.sin(ang);
      // phía trái của nhân vật theo hướng nhìn (tay trái nhất quán)
      var lx = Math.cos(ang - Math.PI / 2), ly = Math.sin(ang - Math.PI / 2);
      var bobH = Math.sin(t * 2.6) * 2.6;
      var gx, gy, dx, dy;
      if (row === 2 || row === 6) {
        // Hướng ngang thuần: trục "bên trái" chiếu thành phía trên màn
        // hình — công thức cũ dựng kiếm đứng ngay trên đầu như ngọn
        // nến (soi khung clip đợt sửa tiếp phát hiện). Đặt kiếm sau
        // vai, mũi chĩa về trước-xuống như thế sẵn sàng: đọc rõ là
        // kiếm bay BÊN CẠNH người.
        gx = cx - fx * 20; gy = cy - 14 + bobH;
        dx = fx; dy = 0.55;
      } else {
        gx = cx + lx * 24 - fx * 4; gy = cy - 12 + ly * 8 + bobH;
        dx = fx; dy = fy;
      }
      var nl = Math.hypot(dx, dy) || 1; dx /= nl; dy /= nl;
      ctx.translate(gx, gy);
      ctx.rotate(Math.atan2(dx, -dy) + Math.sin(t * 2.2) * 0.06);
    }
    // neo xoay tại chuôi kiếm trong sprite (48,76)/(96,120) -> (32,51)
    ctx.drawImage(im, -32, -51, 64, 80);
    ctx.restore();
  }
  function startSwordBody(move, hitAtAbs, secondHitAtAbs) {
    var kc = state && state.gender === 'nu' ? 'nuKc' : 'namKc';
    if (move === 'lien_hoan') { startBodySegment(kc, 'B1', hitAtAbs); if (secondHitAtAbs) startBodySegment(kc, 'B2', secondHitAtAbs); }
    else if (move === 'pha_quan') startBodySegment(kc, 'C', hitAtAbs);
    else if (move === 'quy_nhat') startBodySegment(kc, 'D', hitAtAbs);
    else startBodySegment(kc, 'A', hitAtAbs); // tram + huyen_tinh_tram (bộ A — xấp xỉ đã ghi hợp đồng)
  }
  function startResBody(fast) {
    var pq = state && state.gender === 'nu' ? 'nuPq' : 'namPq';
    startBodySegment(pq, fast ? 'MOT' : 'PHAP', tNow);
  }
  /* --- Nghi thức lên tầng dùng chung (thiết kế 6.3) --- */
  function presentTechTierUp(techId, tier) {
    if (!state || !tier) return;
    FXC.tierUps[techId + ':' + tier] = (FXC.tierUps[techId + ':' + tier] || 0) + 1;
    var def = L.TECHNIQUE_DEFS[techId]; if (!def) return;
    var tierName = (def.tiers && def.tiers[tier] && (def.tiers[tier].name || def.tiers[tier])) || ('Tầng ' + tier);
    if (typeof tierName !== 'string') tierName = 'Tầng ' + tier;
    var cx = px + 16, cy = py + 16;
    if (techId === 'that_tinh') spawnConstellation(cx, cy - 62, 76, BEIDOU, BEIDOU_LINES, '150,200,255', '90,140,220', '235,245,255', 1.0, 0);
    else if (techId === 'thanh_phong') spawnLeaves(cx, cy, 11, 30);
    addFloat(cx, py - 26, def.name + ' — ' + tierName, techId === 'thanh_phong' ? '200,240,215' : '150,200,255');
    if (tier >= 4) sfxBigBell(); else sfxBell();
  }
  /* --- Trình diễn từng chiêu kiếm tại điểm áp sát thương --- */
  var lienFirstHitPos = null;
  function presentSwordHit(tx, ty, ang, move, crit, hitIdx) {
    var P = fxTier(), colBody = crit ? '255,226,150' : '170,230,255';
    swordFxLog.push({ move: move || 'tram', P: P, t: tNow }); if (swordFxLog.length > 40) swordFxLog.shift();
    if (move === 'huyen_tinh_tram') { presentHuyenTinh(tx, ty, ang, crit); return; }
    if (move === 'pha_quan') {
      var n = P >= 4 ? 7 : 5, sang = ang;
      for (var i = 0; i < n; i++) { var off = (i - (n - 1) / 2) * 26; spawnStar(tx + Math.cos(sang) * off, ty + Math.sin(sang) * off - 6, '150,200,255', '235,245,255', 0.95, i * 0.02, 0.5); }
      spawnStreak(tx, ty - 12, sang, colBody, true, { scale: P_SCALE[P], arc: true });
      addFloat(tx, ty - 34, 'PHÁ QUÂN!', '150,200,255');
      shakeWorld(0.35); hitStop(0.06);
      beep(660, 0.1, 'sine', 0.03, 'skill'); setTimeout(function () { beep(98, 0.15, 'triangle', 0.07, 'skill'); }, 40);
      spawnStarBurst(tx, ty, P >= 4 ? 14 : 10, '150,200,255', '235,245,255');
      return;
    }
    if (move === 'quy_nhat') {
      spawnConstellation(tx, ty - 55, 100, BEIDOU, BEIDOU_LINES, '150,200,255', '90,140,220', '235,245,255', 0.65, 0);
      for (var q = 0; q < 7; q++) {
        miniSwords.push({ x0: tx + (BEIDOU[q][0] - 50), y0: ty - 55 + (BEIDOU[q][1] - 31) * 0.62, x1: tx, y1: ty - 8, t: -q * 0.012, dur: 0.15, L: 54, body: '150,200,255', core: '235,245,255', guard: '45,70,110' });
      }
      spawnStreak(tx, ty - 12, ang, colBody, true, { scale: 1.3, arc: true });
      addFloat(tx, ty - 40, 'QUY NHẤT!', '150,200,255');
      shakeWorld(crit ? 0.6 : 0.35);
      for (var qi = 0; qi < 7; qi++) setTimeout((function (k) { return function () { beep(Math.round(1318 * Math.pow(1.135, k)), 0.07, 'sine', 0.04, 'skill'); }; })(qi), qi * 15);
      spawnStarBurst(tx, ty, 14, '150,200,255', '235,245,255');
      return;
    }
    if (move === 'lien_hoan') {
      if (!hitIdx) {
        spawnStar(tx - 26, ty - 22, '150,200,255', '235,245,255', 0.9, 0, 0.45);
        spawnStar(tx + 26, ty - 22, '150,200,255', '235,245,255', 0.9, 0.03, 0.45);
        spawnStar(tx, ty + 26, '150,200,255', '235,245,255', 0.9, 0.06, 0.45);
        if (P >= 3) for (var e = 0; e < P_STARS[P] - 3; e++) spawnStar(tx - 18 + e * 18, ty - 40, '150,200,255', '235,245,255', 0.7, e * 0.03, 0.4);
        addFloat(tx, ty - 34, 'LIÊN HOÀN!', '150,200,255');
        lienFirstHitPos = { x: tx, y: ty };
        spawnStreak(tx, ty - 12, ang + 0.5, colBody, false, { scale: P_SCALE[P], arc: true });
      } else {
        spawnStreak(tx, ty - 12, Math.PI - (ang + 0.5), colBody, false, { scale: P_SCALE[P], arc: true }); // cung 2 phản gương, khép X
        if (lienFirstHitPos) constFx.push({ cx: (lienFirstHitPos.x + tx) / 2, cy: (lienFirstHitPos.y + ty) / 2 - 12, w: 2, pts: [], lines: [], col: '90,140,220', lineCol: '90,140,220', core: '235,245,255', t: 0, dur: 0.2, spin: 0, seg: [lienFirstHitPos.x, lienFirstHitPos.y - 12, tx, ty - 12] });
      }
      spawnStarBurst(tx, ty, Math.ceil(P_BURST[P] / 2), '150,200,255', '235,245,255');
      return;
    }
    // Trảm (đòn nền, không tên nổi): sao nhen trên vai kiếm + cung sao theo P
    spawnStar(px + 30, py - 14, '150,200,255', '235,245,255', 0.9, 0, 0.4);
    if (P >= 2) for (var a2 = 1; a2 < P_STARS[P]; a2++) spawnStar(px + 16 + (a2 - (P_STARS[P] - 1) / 2) * 13, py - 34 - Math.abs(a2 - (P_STARS[P] - 1) / 2) * -3, '150,200,255', '235,245,255', 0.7, a2 * 0.025, 0.4);
    if (P >= 4) spawnConstellation(tx, ty - 20, 46, BEIDOU, BEIDOU_LINES, '150,200,255', '90,140,220', '235,245,255', 0.3, 0);
    spawnStreak(tx, ty - 12, ang, colBody, crit, { scale: P_SCALE[P], arc: true });
    spawnStarBurst(tx, ty, P_BURST[P], '150,200,255', '235,245,255');
  }
  /* --- Huyền Tinh Trảm (đặc tả fx/huyen-tinh-tram-spec.md) --- */
  function presentHuyenTinh(tx, ty, ang, crit) {
    FXC.huyen++;
    // 5 sao Huyền Câu nhen nối tiếp -125ms->0 từng 25ms: sao dùng delay âm
    // tương đối theo thang giây của starFx (t đã chạy trước qua t âm) —
    // tại t=0 của pipe, sao cuối vừa nhen; đồ họa thấp vẫn đủ 5 điểm.
    HUYENCAU.forEach(function (pt, i) { spawnStar(tx + (pt[0] - 50) * 1.1, ty - 58 + (pt[1] - 31) * 0.68, '110,122,240', '216,222,255', 1.0, (4 - i) * -0.025, 0.55); });
    constFx.push({ cx: tx, cy: ty - 58, w: 110, pts: HUYENCAU, lines: HUYENCAU_LINES, col: '110,122,240', lineCol: '94,84,205', core: '216,222,255', t: 0, dur: 0.55, spin: 0 });
    // kiếm L=221px bay dọc xương sống chòm (đoạn 2->3->4): big 170 x 1,30
    spawnStreak(tx, ty - 12, ang, crit ? '255,226,150' : '110,122,240', true, { scale: 1.30, guard: '36,30,84', core: '216,222,255', arc: true });
    addFloat(tx, ty - 42, 'HUYỀN TINH TRẢM!', '168,176,255');
    shakeWorld(0.35);
    spawnStarBurst(tx, ty, 8, '110,122,240', '216,222,255'); // 8 sao bốn cánh chàm
    if (fxOn()) for (var d = 0; d < 4 && parts.length < MAX_PARTS; d++) parts.push({ x: tx + (d - 1.5) * 7, y: ty - 6 + (d % 2) * 5, vx: (d - 1.5) * 8, vy: -6, life: 0.35, t: 0, col: '62,52,148', r: 1.8 }); // 4 hạt chàm đậm
  }
  /* --- Cửu Phẩm của Lục Tranh: 9 kiếm con tỏa tại điểm trúng --- */
  function spawnNineSwords(x, y) {
    for (var i = 0; i < 9; i++) { var a = i / 9 * Math.PI * 2; miniSwords.push({ x0: x, y0: y, x1: x + Math.cos(a) * 30, y1: y + Math.sin(a) * 30, t: 0, dur: 0.25, L: 21, body: '255,246,220', core: '255,255,255', guard: '255,226,150', out: true }); }
  }
  /* --- Cập nhật + vẽ ARCIV_FX --- */
  function updateArcFx(dt) {
    starFx = starFx.filter(function (st) { st.t += dt; return st.t < st.dur; });
    constFx = constFx.filter(function (c) { c.t += dt; return c.t < c.dur; });
    miniSwords = miniSwords.filter(function (m2) { m2.t += dt; return m2.t < m2.dur; });
    bodySegs = bodySegs.filter(function (sg) { return tNow - sg.start < sg.total + 40; });
  }
  function drawArcFx() {
    constFx.forEach(function (c) {
      var fade = c.t < 0.1 ? c.t / 0.1 : Math.max(0, 1 - Math.max(0, c.t - c.dur * 0.6) / (c.dur * 0.4));
      ctx.save(); ctx.globalAlpha = 0.5 * fade; ctx.strokeStyle = 'rgb(' + c.lineCol + ')'; ctx.lineWidth = 1.3;
      if (ctx.setLineDash) ctx.setLineDash([3, 3]);
      ctx.beginPath();
      if (c.seg) { ctx.moveTo(c.seg[0], c.seg[1]); ctx.lineTo(c.seg[2], c.seg[3]); }
      else c.lines.forEach(function (ln) { var a = c.pts[ln[0]], b = c.pts[ln[1]]; ctx.moveTo(c.cx + (a[0] - 50) / 100 * c.w, c.cy + (a[1] - 31) / 62 * c.w * 0.62); ctx.lineTo(c.cx + (b[0] - 50) / 100 * c.w, c.cy + (b[1] - 31) / 62 * c.w * 0.62); });
      ctx.stroke(); if (ctx.setLineDash) ctx.setLineDash([]); ctx.restore(); ctx.globalAlpha = 1;
    });
    starFx.forEach(function (st) { if (st.t < 0) return; var k = st.t / st.dur; drawStarShape(st.x, st.y, st.size * (0.7 + 0.3 * Math.sin(Math.min(1, st.t / 0.04) * Math.PI * 0.5)), st.col, st.core, Math.sin(Math.min(1, k) * Math.PI)); });
    miniSwords.forEach(function (m2) {
      if (m2.t < 0) return; var p = Math.min(1, m2.t / m2.dur);
      var x = m2.x0 + (m2.x1 - m2.x0) * p, y = m2.y0 + (m2.y1 - m2.y0) * p;
      drawSwordShape(x, y, Math.atan2(m2.y1 - m2.y0, m2.x1 - m2.x0), m2.L, m2.body, m2.core, m2.guard, Math.sin(p * Math.PI), 0);
      // vệt đuôi: bóng mờ tại các vị trí trước trên quỹ đạo (chuyển động liên tục)
      drawSwordShape(m2.x0 + (m2.x1 - m2.x0) * Math.max(0, p - 0.3), m2.y0 + (m2.y1 - m2.y0) * Math.max(0, p - 0.3), Math.atan2(m2.y1 - m2.y0, m2.x1 - m2.x0), m2.L * 0.9, m2.body, m2.core, m2.guard, Math.sin(p * Math.PI) * 0.3, 0);
    });
  }


  /* ================= ARCIV đợt 1 — mắt trận, chu kỳ boss, bí pháp Kim Đan ================= */
  /* Mắt trận (ch.14 hiện trường + ch.15 hai mắt di động + ch.16 hai mắt phụ):
     vật thể trình diễn/cơ chế nhẹ do worker dữ liệu đặt qua cầu VSLC_ARCIV.
     Mắt còn đứng -> dữ liệu đọc eyesStanding() để nạp nhịp địch/chu kỳ boss;
     Phong Âm trong tầm phong ấn mắt (ấn vàng khép), mắt tắt vĩnh viễn tới
     khi dữ liệu tự dọn. Vòng nhiễu xám = ngôn ngữ thiết bị hỗn độn ch.11. */
  var arcEyes = [];
  function arcAddEye(x, y, opts) { opts = opts || {}; var e = { x: x, y: y, sealed: false, mobile: !!opts.mobile, ph: Math.random() * 6.3, label: opts.label || 'Mắt trận' }; arcEyes.push(e); return e; }
  function arcEyesStanding() { return arcEyes.filter(function (e) { return !e.sealed; }).length; }
  function arcPhongContext() { return arcEyes.some(function (e) { return !e.sealed && Math.hypot(e.x - (px + 16), e.y - (py + 16)) <= 3.2 * TILE; }); }
  function arcSealEye(e) {
    if (!e || e.sealed) return; e.sealed = true;
    rings.push({ x: e.x, y: e.y, r: 8, a: 0.95 });
    addFloat(e.x, e.y - 30, 'PHONG ẤN!', '255,214,120');
    spawnParts(e.x, e.y, 10, '255,214,120', 30, true); sfxBell();
  }
  /* ---------- ARCIV đợt 2: lớp vẽ vùng báo trước / xe văn thư / sóng hồn / thước rung ----------
     Gọi cùng điểm với arcDrawEyes trong render. Vùng báo trước: vòng
     ngoài mờ nâu đỏ (sóng lệch: lam) + vòng trong co dần theo thời gian
     còn lại + chữ cảnh báo. Xe văn thư vẽ bằng khối gỗ + bánh xe (hàm
     riêng của trận, không sửa dữ liệu MAPS). Sóng méo trên đầu hồn
     loạn: biên độ giảm theo số lần giữ — sóng THẲNG DẦN bằng mắt. */
  function arcDrawWave2() {
    if (arcFig) {
      (arcFig.zones || []).forEach(function (zn) {
        var k = Math.max(0, zn.t / (zn.dur || zn.t || 1));
        var col = zn.kind === 'soul' ? '120,170,255' : '205,90,60';
        ctx.fillStyle = 'rgba(' + col + ',' + (0.16 + 0.10 * Math.sin(tNow / 90)) + ')';
        ctx.beginPath(); ctx.ellipse(zn.x, zn.y, zn.r, zn.r * 0.45, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(' + col + ',0.85)'; ctx.lineWidth = 2.2;
        ctx.beginPath(); ctx.ellipse(zn.x, zn.y, zn.r, zn.r * 0.45, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,235,200,0.9)'; ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.ellipse(zn.x, zn.y, Math.max(4, zn.r * k), Math.max(2, zn.r * 0.45 * k), 0, 0, Math.PI * 2); ctx.stroke();
        ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(20,12,6,0.9)'; ctx.fillText(zn.kind === 'soul' ? 'SÓNG LỆCH!' : 'NÉ!', zn.x + 1, zn.y - zn.r * 0.45 - 5);
        ctx.fillStyle = '#ffd9a0'; ctx.fillText(zn.kind === 'soul' ? 'SÓNG LỆCH!' : 'NÉ!', zn.x, zn.y - zn.r * 0.45 - 6);
      });
      if (arcFig.cart) {
        var ct = arcFig.cart;
        var tilt = ct.state === 'tipped' ? 0.85 : ct.state === 'tilting' ? (1 - Math.max(0, ct.t) / 6) * 0.5 : 0;
        ctx.save(); ctx.translate(ct.x, ct.y); ctx.rotate(tilt);
        ctx.fillStyle = 'rgba(24,34,18,0.28)'; ctx.beginPath(); ctx.ellipse(0, 14, 30, 7, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#8a6a42'; ctx.fillRect(-26, -14, 52, 26);
        ctx.strokeStyle = '#5d422a'; ctx.lineWidth = 2; ctx.strokeRect(-26, -14, 52, 26);
        ctx.fillStyle = '#e8dcc0'; ctx.fillRect(-18, -9, 36, 7); ctx.fillRect(-18, 1, 30, 6); // chồng văn thư trắng buộc dây
        ctx.strokeStyle = '#a33b2e'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(0, 9); ctx.stroke();
        ctx.fillStyle = '#4a3520';
        ctx.beginPath(); ctx.arc(-16, 14, 7, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(16, 14, 7, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        if (ct.state === 'saved') {
          ctx.strokeStyle = 'rgba(255,214,120,' + (0.7 + 0.25 * Math.sin(tNow / 160)) + ')'; ctx.lineWidth = 2.4;
          ctx.beginPath(); ctx.ellipse(ct.x, ct.y, 38, 18, 0, 0, Math.PI * 2); ctx.stroke();
        } else if (ct.state === 'tilting') {
          ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center';
          ctx.fillStyle = '#ffd9a0'; ctx.fillText(Math.ceil(Math.max(0, ct.t)) + '', ct.x, ct.y - 30);
        }
      }
      /* Đợt 3: XE HÀNG (cfg.carts) — cùng ngôn ngữ vẽ với xe văn thư:
         khối gỗ + kiện hàng + bánh xe; 'tilting' nghiêng dần + đếm
         ngược, 'saved' vòng vàng, 'tipped' nghiêng hẳn, 'lost' vỡ
         (nghiêng mạnh + kiện hàng rơi vương ra đất) + thanh máu xe. */
      (arcFig.carts || []).forEach(function (ct) {
        var tilt3 = ct.state === 'lost' ? 1.05 : ct.state === 'tipped' ? 0.85 : ct.state === 'tilting' ? (1 - Math.max(0, ct.t) / 6) * 0.5 : 0;
        ctx.save(); ctx.translate(ct.x, ct.y); ctx.rotate(tilt3);
        ctx.fillStyle = 'rgba(24,34,18,0.28)'; ctx.beginPath(); ctx.ellipse(0, 14, 30, 7, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = ct.flashT > 0 ? '#c9a06a' : '#8a6a42'; ctx.fillRect(-26, -14, 52, 26);
        ctx.strokeStyle = '#5d422a'; ctx.lineWidth = 2; ctx.strokeRect(-26, -14, 52, 26);
        ctx.fillStyle = '#d8c9a3'; ctx.fillRect(-19, -10, 38, 8); ctx.fillRect(-19, 1, 32, 7); // kiện hàng buộc dây
        ctx.strokeStyle = '#7a5c33'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(0, -11); ctx.lineTo(0, 10); ctx.stroke();
        ctx.fillStyle = '#4a3520';
        ctx.beginPath(); ctx.arc(-16, 14, 7, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(16, 14, 7, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        if (ct.state === 'lost') {
          ctx.fillStyle = '#c9b184';
          ctx.fillRect(ct.x - 34, ct.y + 12, 12, 7); ctx.fillRect(ct.x + 24, ct.y + 16, 10, 6); ctx.fillRect(ct.x + 2, ct.y + 20, 9, 5); // kiện hàng rơi vương
        } else if (ct.state === 'saved') {
          ctx.strokeStyle = 'rgba(255,214,120,' + (0.7 + 0.25 * Math.sin(tNow / 160)) + ')'; ctx.lineWidth = 2.4;
          ctx.beginPath(); ctx.ellipse(ct.x, ct.y, 38, 18, 0, 0, Math.PI * 2); ctx.stroke();
        } else if (ct.state === 'tilting') {
          ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center';
          ctx.fillStyle = '#ffd9a0'; ctx.fillText(Math.ceil(Math.max(0, ct.t)) + '', ct.x, ct.y - 30);
        }
        if (ct.hpMax && ct.hp < ct.hpMax && ct.state !== 'lost') {
          ctx.fillStyle = 'rgba(10,10,10,0.55)'; ctx.fillRect(ct.x - 22, ct.y - 26, 44, 5);
          ctx.fillStyle = '#ffb060'; ctx.fillRect(ct.x - 21, ct.y - 25, 42 * Math.max(0, ct.hp / ct.hpMax), 3);
        }
      });
      /* Đợt 3 ch.24: điểm giữ cứu người (cfg.rescueHold) — vòng sóng
         đứng tại vị trí người bị thương dưới mảng vách + nhãn số lần
         giữ; đứng trong 3,2 ô quanh điểm này dùng Định Âm là giữ. */
      if (arcFig.rescueHold) {
        var rh = arcFig.rescueHold, rhX2 = rh.tx * TILE + 16, rhY2 = rh.ty * TILE + 16;
        var done2 = arcFig.rescueHolds >= (rh.need || 2);
        ctx.strokeStyle = done2 ? 'rgba(255,214,120,0.95)' : 'rgba(170,220,255,' + (0.65 + 0.25 * Math.sin(tNow / 170)) + ')'; ctx.lineWidth = 2.4;
        ctx.beginPath(); ctx.ellipse(rhX2, rhY2, 3.2 * TILE, 3.2 * TILE * 0.45, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(rhX2, rhY2, 14 + 3 * Math.sin(tNow / 200), 7 + 1.5 * Math.sin(tNow / 200), 0, 0, Math.PI * 2); ctx.stroke();
        ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(20,12,6,0.9)'; ctx.fillText('NGƯỜI BỊ THƯƠNG — GIỮ! (' + arcFig.rescueHolds + '/' + (rh.need || 2) + ')', rhX2 + 1, rhY2 - 3.2 * TILE * 0.45 - 5);
        ctx.fillStyle = '#bfe0ff'; ctx.fillText('NGƯỜI BỊ THƯƠNG — GIỮ! (' + arcFig.rescueHolds + '/' + (rh.need || 2) + ')', rhX2, rhY2 - 3.2 * TILE * 0.45 - 6);
      }
      if (arcFig.soulChaos) {
        arcFig.figs.forEach(function (fg) {
          if (!fg.soulChaos || fg.dead) return;
          var need = (arcFig.soulChaos && arcFig.soulChaos.need) || 3;
          var amp = 9 * (1 - 0.8 * Math.min(1, arcFig.soulHolds / need));
          var cxw = fg.x + 16, cyw = fg.y - 46;
          ctx.strokeStyle = 'rgba(170,205,255,0.9)'; ctx.lineWidth = 2;
          ctx.beginPath();
          for (var si2 = 0; si2 <= 16; si2++) {
            var u = si2 / 16;
            var wx = cxw - 34 + u * 68;
            var wy = cyw + Math.sin(u * Math.PI * 3 + tNow / 210) * amp * (0.6 + 0.4 * Math.sin(u * Math.PI * 7));
            if (si2 === 0) ctx.moveTo(wx, wy); else ctx.lineTo(wx, wy);
          }
          ctx.stroke();
        });
      }
    }
    arcDrawRulerShake();
  }
  /* Đợt 2 ch.17 (B.7): thước pha lê rung loạn ở thap_noi khi cờ
     q17RulerShaking bật — hạt bụi rơi quanh thước + vòng mờ rung tại
     tâm thước (20,4). Thuần trình diễn, gọi từ arcDrawWave2. */
  function arcDrawRulerShake() {
    if (!state || state.map !== 'thap_noi' || !state.flags || !state.flags.q17RulerShaking) return;
    var rx = 20 * TILE + 16, ry = 4 * TILE + 16;
    var jx = Math.sin(tNow / 37) * 2.2, jy = Math.cos(tNow / 43) * 1.6;
    ctx.strokeStyle = 'rgba(200,225,255,' + (0.4 + 0.2 * Math.sin(tNow / 80)) + ')'; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.ellipse(rx + jx, ry + jy, 30, 13, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.ellipse(rx - jx, ry - jy, 22, 9, 0, 0, Math.PI * 2); ctx.stroke();
    if (fxOn()) {
      for (var di = 0; di < 5; di++) {
        var dh = (di * 47 + Math.floor(tNow / 30)) % 60;
        ctx.fillStyle = 'rgba(210,220,235,' + (0.5 * (1 - dh / 60)) + ')';
        ctx.fillRect(rx - 26 + ((di * 29) % 52) + Math.sin(tNow / 60 + di) * 2, ry - 20 + dh, 2, 2);
      }
    }
  }
  function arcDrawEyes() {
    arcEyes.forEach(function (e) {
      var bobY = e.mobile ? Math.sin(tNow / 700 + e.ph) * 5 : 0, cy = e.y + bobY;
      if (!e.sealed) {
        for (var ai = 0; ai < 3; ai++) { ctx.strokeStyle = 'rgba(148,163,184,' + (0.75 - ai * 0.18) + ')'; ctx.lineWidth = 2.4 - ai * 0.5; ctx.beginPath(); ctx.arc(e.x, cy, 13 + ai * 6, tNow / (300 + ai * 120) + ai, tNow / (300 + ai * 120) + ai + Math.PI * 1.35); ctx.stroke(); }
        ctx.fillStyle = 'rgba(210,218,230,0.9)'; ctx.beginPath(); ctx.arc(e.x, cy, 4.5, 0, Math.PI * 2); ctx.fill();
        // Đợt 3: mắt đang ĐÓNG BĂNG (Định Âm, cfg.eyeDinhFreeze) — vành
        // băng lam quanh mắt + nhân băng đặc, khác hẳn vòng nhiễu xám.
        if (e.frozenT > 0) {
          ctx.strokeStyle = 'rgba(170,220,255,0.95)'; ctx.lineWidth = 2.6;
          ctx.beginPath(); ctx.arc(e.x, cy, 17, 0, Math.PI * 2); ctx.stroke();
          ctx.strokeStyle = 'rgba(230,245,255,0.8)'; ctx.lineWidth = 1.4;
          ctx.beginPath(); ctx.arc(e.x, cy, 21, 0, Math.PI * 2); ctx.stroke();
          ctx.fillStyle = 'rgba(200,235,255,0.95)'; ctx.beginPath(); ctx.arc(e.x, cy, 5.5, 0, Math.PI * 2); ctx.fill();
        }
      } else {
        ctx.save(); ctx.translate(e.x, cy); ctx.rotate(Math.PI / 4);
        ctx.strokeStyle = 'rgba(255,214,120,0.95)'; ctx.lineWidth = 3; ctx.strokeRect(-11, -11, 22, 22); ctx.restore();
        ctx.fillStyle = 'rgba(120,110,90,0.8)'; ctx.beginPath(); ctx.arc(e.x, cy, 4, 0, Math.PI * 2); ctx.fill();
      }
    });
  }
  /* Chu kỳ kiếm trận của boss (ch.16 Trận Nhãn + ch.15/5e biến thể): 7 kiếm
     xỉn bay quanh boss, đổi chiều mỗi chu kỳ, đường bay vẽ trước một nhịp;
     tích tắc cơ học theo số mắt còn đứng, im tuyệt đối khi bị Định Âm đóng
     băng (frozen). Vạn Kiếm Quy Tông: triggerFan() báo trước dài rồi xả quạt
     miniSwords từ boss ra ngoài. Đường thắng không cần Định/Phong nằm ở dữ
     liệu/sát thương — lớp này chỉ trình diễn + đồng hồ chu kỳ. */
  var arcCycle = null;
  function arcStartCycle(getPos, opts) { opts = opts || {}; arcCycle = { getPos: getPos, t: 0, dir: 1, period: opts.period || 4.2, frozen: false, tickI: -1, fanT: -1, dull: opts.dull || '150,160,170' }; }
  function arcStopCycle() { arcCycle = null; }
  function arcCycleFan() { if (arcCycle) arcCycle.fanT = 0; }
  function arcUpdateCycle(dt) {
    var c = arcCycle; if (!c) return;
    if (c.frozen) return; // Định Âm: chu kỳ đóng băng, im tuyệt đối, boss giữ thế tụ
    c.t += dt;
    if (c.t >= c.period) { c.t = 0; c.dir *= -1; }
    var standing = Math.max(0, arcEyesStanding());
    var tick = Math.floor(c.t / (c.period / 7) / (standing >= 2 ? 0.8 : standing === 1 ? 0.9 : 1));
    if (tick !== c.tickI) { c.tickI = tick; beep(1200 - standing * 120, 0.03, 'square', 0.012, 'skill'); }
    if (c.fanT >= 0) {
      c.fanT += dt;
      if (c.fanT >= 1.1) { // hết báo trước dài -> xả quạt 7 tia
        var bp = c.getPos();
        for (var fi = 0; fi < 7; fi++) { var fa = -Math.PI / 2 + (fi - 3) * 0.3; miniSwords.push({ x0: bp.x, y0: bp.y, x1: bp.x + Math.cos(fa) * 120, y1: bp.y + Math.sin(fa) * 120, t: 0, dur: 0.5, L: 60, body: c.dull, core: '220,228,240', guard: '60,64,72', out: true }); }
        shakeWorld(0.35); c.fanT = -1;
      }
    }
  }
  function arcDrawCycle() {
    var c = arcCycle; if (!c) return; var bp = c.getPos(); if (!bp) return;
    var speedK = Math.max(0, arcEyesStanding()) >= 2 ? 1.25 : Math.max(0, arcEyesStanding()) === 1 ? 1.12 : 1;
    for (var i = 0; i < 7; i++) {
      var a = (c.t / c.period) * Math.PI * 2 * c.dir * speedK + i * (Math.PI * 2 / 7);
      var ox = bp.x + Math.cos(a) * 54, oy = bp.y + Math.sin(a) * 30;
      drawSwordShape(ox, oy, a + Math.PI / 2 * c.dir, 44, c.dull, '220,228,240', '60,64,72', c.frozen ? 0.55 : 0.9, 0);
      // đường bay đọc trước một nhịp: chấm mờ tại vị trí kế tiếp
      var a2 = a + 0.5 * c.dir; ctx.fillStyle = 'rgba(200,208,220,0.25)'; ctx.beginPath(); ctx.arc(bp.x + Math.cos(a2) * 54, bp.y + Math.sin(a2) * 30, 2, 0, Math.PI * 2); ctx.fill();
    }
    if (c.fanT >= 0) { ctx.strokeStyle = 'rgba(255,190,120,' + (0.4 + 0.4 * Math.sin(tNow / 90)) + ')'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(bp.x, bp.y, 30 + c.fanT * 30, 0, Math.PI * 2); ctx.stroke(); addFloat(bp.x, bp.y - 52, 'VẠN KIẾM QUY TÔNG!', '255,190,120'); c.fanShown = true; }
  }
  /* --- Trình diễn 10 bộ bí pháp dải Kim Đan (ô 03/06/09/14/15/17/19/20/23/26) ---
     Hiệu ứng CHUYỂN ĐỘNG LIÊN TỤC dựng từ sprite cắt trực tiếp trong
     assets/vfx/cp<ô>/ của chính sheet từng bộ: đạn bay có tiến trình + vệt
     đuôi (hạt bám quỹ đạo), triệu hồi lướt theo quỹ đạo cong, mưa đạn trút
     theo nhịp, xoáy xoay thật, lưỡi liềm là MỘT vệt cong quét qua mục tiêu.
     castTechFx do đường xuất chiêu của worker dữ liệu gọi tại t=0 áp sát
     thương; SP-01 Thanh Hoa Liên Trận Kinh CHƯA có sheet -> không đăng ký
     ở đây (trình diễn tối thiểu chung ở phía dữ liệu, xem CONTRACT). */
  var TECH_FX_IMG = {};
  function techImg(cell, file) { var k = cell + '/' + file; if (!TECH_FX_IMG[k]) TECH_FX_IMG[k] = loadImg('assets/vfx/cp' + cell + '/' + file); return TECH_FX_IMG[k]; }
  var techProj = [];
  function spawnTechProj(img, x0, y0, x1, y1, dur, size, opts) {
    opts = opts || {};
    techProj.push({ img: img, x0: x0, y0: y0, x1: x1, y1: y1, t: -(opts.delay || 0), dur: dur, size: size, spin: opts.spin || 0, arc: opts.arc || 0, col: opts.col || '200,230,255', grow: opts.grow || 0 });
    if (techProj.length > 24) techProj.shift();
  }
  var TECH_FX_DEFS = {
    thanh_loan_pha_hu: { cell: '03', pattern: 'phoenix', col: '32,192,160', body: 'phap' },
    thanh_long_xuat_the: { cell: '06', pattern: 'dragon', col: '80,220,160', body: 'phap' },
    dai_nhat_hoa_cau: { cell: '09', pattern: 'fireball', col: '255,150,60', body: 'phap', img: 'g09_ball.png' },
    thuong_hai_cuong_dao: { cell: '14', pattern: 'wave', col: '80,170,255', body: 'phap', img: 'g14_wave.png' },
    han_bang_bao_lien: { cell: '15', pattern: 'lotus', col: '150,210,255', body: 'phap', img: 'g15_lotus_full.png' },
    tuyet_hoa_cu_kiem: { cell: '17', pattern: 'sword', col: '190,225,255', body: 'sword', img: 'g17_sword.png' },
    tu_dien_kich: { cell: '19', pattern: 'bolt', col: '180,140,255', body: 'mot', img: 'g19_bolt.png' },
    loi_quang_than_kiem: { cell: '20', pattern: 'sword', col: '200,170,255', body: 'sword', img: 'g20_sword.png' },
    bon_loi_thiem_kich: { cell: '23', pattern: 'bolt', col: '170,150,255', body: 'mot', img: 'l23_proj15.png' },
    thai_bach_kim_kiem: { cell: '26', pattern: 'sword', col: '255,220,150', body: 'sword', img: 'g26_sword.png' },
    hoa_phuong_lieu_nguyen: { cell: '07', pattern: 'firephoenix', col: '255,130,50', body: 'phap' }
  };
  function castTechFx(techId, tx, ty, opts) {
    opts = opts || {}; var def = TECH_FX_DEFS[techId]; if (!def) return false;
    var sx = px + 16, sy = py + 10, tier = opts.tier || 1;
    if (def.body === 'sword') startSwordBody('tram', tNow, null);
    else if (def.body === 'mot') startResBody(true);
    else startResBody(false);
    FXC['tech_' + techId] = (FXC['tech_' + techId] || 0) + 1;
    if (def.pattern === 'sword') { spawnTechProj(techImg(def.cell, def.img), sx, sy, tx, ty - 8, 0.34, 74 + tier * 8, { col: def.col, spin: 0.4 }); spawnStarBurst(tx, ty, 6 + tier * 2, def.col, '255,255,255'); }
    else if (def.pattern === 'bolt') { for (var b = 0; b < 3; b++) spawnTechProj(techImg(def.cell, def.img), tx + (b - 1) * 22, ty - 130, tx + (b - 1) * 22, ty - 10, 0.3, 54, { col: def.col, delay: b * 0.09 }); spawnStarBurst(tx, ty, 8, def.col, '255,255,255'); }
    else if (def.pattern === 'fireball') { spawnTechProj(techImg(def.cell, def.img), sx, sy, tx, ty - 10, 0.45, 40, { col: def.col, grow: 60 + tier * 10 }); spawnStarBurst(tx, ty, 12, def.col, '255,240,200'); }
    else if (def.pattern === 'wave') { spawnTechProj(techImg(def.cell, def.img), sx, ty - 6, tx, ty - 6, 0.5, 96, { col: def.col }); spawnParts(tx, ty, 10, def.col, 34, false); }
    else if (def.pattern === 'lotus') { spawnTechProj(techImg(def.cell, def.img), tx, ty + 6, tx, ty + 6, 0.85, 92 + tier * 8, { col: def.col, spin: 2.6 }); for (var c2 = 0; c2 < 5; c2++) spawnTechProj(techImg(def.cell, 'a15_crystal16.png'), tx + (c2 - 2) * 16, ty - 110, tx + (c2 - 2) * 13, ty - 6, 0.4, 30, { col: def.col, delay: 0.15 + c2 * 0.07 }); }
    else if (def.pattern === 'phoenix') {
      spawnTechProj(techImg('03', 'orbit.png'), sx, sy, sx, sy, 0.5, 74, { col: def.col, spin: 3 });
      for (var d = 0; d < 3; d++) spawnTechProj(techImg('03', 'dart_small_0' + (d + 1) + '.png'), sx, sy, tx, ty - 8, 0.3, 40, { col: def.col, delay: 0.1 + d * 0.08 });
      spawnTechProj(techImg('03', 'disc_01.png'), tx, ty - 8, tx, ty - 8, 0.5, 58, { col: def.col, spin: 5, delay: 0.3 });
      for (var r2 = 0; r2 < 6; r2++) spawnTechProj(techImg('03', 'dart_small_04.png'), tx + (r2 - 2.5) * 13, ty - 120, tx + (r2 - 2.5) * 10, ty - 8, 0.36, 34, { col: def.col, delay: 0.55 + r2 * 0.06 });
      spawnTechProj(techImg('03', 'phoenix_big.png'), sx - 30, sy - 44, tx, ty - 14, 0.62, 130, { col: def.col, arc: -46, delay: 0.5 });
    }
    else if (def.pattern === 'firephoenix') {
      // Ô 07 Hỏa Phượng Liêu Nguyên: bám vũ đạo 'phoenix' của ô 03 nhưng
      // bằng sprite lửa cắt trực tiếp từ bảng của Bui (assets/vfx/cp07/).
      // Mọi thành phần CHUYỂN ĐỘNG LIÊN TỤC: hào quang xoay tại thân, phi
      // tiêu bay có tiến trình, đĩa xoay tại đích, mưa phi tiêu trút theo
      // nhịp, phượng lửa LƯỚT theo quỹ đạo cong tới đích rồi nổ sao —
      // tuyệt đối không ảnh tĩnh hiện lên rồi biến mất.
      spawnTechProj(techImg('07', 'g07_aura.png'), sx, sy, sx, sy, 0.5, 74, { col: def.col, spin: 3 });
      var fpDarts = ['a07_proj13.png', 'a07_proj15.png', 'a07_proj16.png'];
      for (var fd = 0; fd < 3; fd++) spawnTechProj(techImg('07', fpDarts[fd]), sx, sy, tx, ty - 8, 0.3, 40, { col: def.col, delay: 0.1 + fd * 0.08 });
      spawnTechProj(techImg('07', 'f07_disc01.png'), tx, ty - 8, tx, ty - 8, 0.5, 58, { col: def.col, spin: 5, delay: 0.3 });
      var fpRain = ['a07_proj17.png', 'a07_proj18.png', 'a07_proj19.png'];
      for (var fr = 0; fr < 6; fr++) spawnTechProj(techImg('07', fpRain[fr % 3]), tx + (fr - 2.5) * 13, ty - 120, tx + (fr - 2.5) * 10, ty - 8, 0.36, 34, { col: def.col, delay: 0.55 + fr * 0.06 });
      spawnTechProj(techImg('07', 'g07_phoenix.png'), sx - 30, sy - 44, tx, ty - 14, 0.62, 130, { col: def.col, arc: -46, delay: 0.5 });
      spawnTechProj(techImg('07', 'f07_burst.png'), tx, ty - 10, tx, ty - 10, 0.45, 84, { col: def.col, spin: 1.2, delay: 0.95 });
      spawnStarBurst(tx, ty, 10 + tier * 2, def.col, '255,240,200');
    }
    else if (def.pattern === 'dragon') {
      spawnTechProj(techImg('06', 'dragon_full.png'), sx - 20, sy - 30, tx, ty - 12, 0.66, 138, { col: def.col, arc: -40 });
      spawnTechProj(techImg('06', 'crescent_jade.png'), sx, sy, tx + 26, ty - 8, 0.4, 66, { col: def.col, spin: 2.2, delay: 0.2 });
      spawnStarBurst(tx, ty, 10, def.col, '235,255,245');
    }
    return true;
  }
  function updateTechFx(dt) {
    techProj = techProj.filter(function (pr) { pr.t += dt; if (pr.t >= 0 && pr.t < pr.dur && fxOn() && Math.random() < 0.75) { var p = pr.t / pr.dur; parts.push({ x: pr.x0 + (pr.x1 - pr.x0) * p + (Math.random() - 0.5) * 6, y: pr.y0 + (pr.y1 - pr.y0) * p + Math.sin(p * Math.PI) * pr.arc + (Math.random() - 0.5) * 6, vx: 0, vy: -4, life: 0.3, t: 0, col: pr.col, r: 1.8 }); if (parts.length > MAX_PARTS) parts.shift(); } return pr.t < pr.dur; });
    arcEyes.forEach(function (e) { if (e.mobile && !e.sealed) { e.x += Math.sin(tNow / 900 + e.ph) * 6 * dt; } });
  }
  function drawTechFx() {
    techProj.forEach(function (pr) {
      if (pr.t < 0 || !imgReady(pr.img)) return;
      var p = Math.min(1, pr.t / pr.dur), ease = 1 - (1 - p) * (1 - p);
      var x = pr.x0 + (pr.x1 - pr.x0) * ease, y = pr.y0 + (pr.y1 - pr.y0) * ease + Math.sin(p * Math.PI) * pr.arc;
      var size = pr.size * (1 + (pr.grow || 0) / 100 * p);
      ctx.save(); ctx.translate(x, y); if (pr.spin) ctx.rotate(pr.spin * pr.t * 3);
      else if (pr.x1 !== pr.x0 || pr.y1 !== pr.y0) ctx.rotate(Math.atan2(pr.y1 - pr.y0, pr.x1 - pr.x0) + Math.PI / 2 * 0);
      ctx.globalAlpha = Math.sin(Math.min(1, p) * Math.PI * 0.5 + 0.5);
      ctx.drawImage(pr.img, -size / 2, -size / 2, size, size); ctx.restore(); ctx.globalAlpha = 1;
    });
  }

  /* ================= Lớp vẽ hiệu ứng riêng của đòn boss =================
     Mọi vật thể ở đây CHỈ sống theo t/dur của chính nó (chuyển động sống
     liên tục, không ảnh tĩnh hiện rồi biến mất) và không mang thông tin
     gameplay duy nhất nào: tắt fxParticles/fxRings chỉ mất lớp vẽ này. */
  function drawBossFx() {
    if (!fxOn()) return;
    bossFx.forEach(function (fx) {
      var k = Math.min(1, fx.t / fx.dur);
      if (fx.kind === 'crack') {
        // #2 Sơn Chủ: vệt NỨT ĐẤT LAN theo 3 đoạn nối tiếp trong 0,3s
        // đầu từ chân boss tới chân người chơi, sau đó giữ hình rồi mờ.
        var a = fx.t < 0.45 ? 0.92 : 0.92 * Math.max(0, 1 - (fx.t - 0.45) / Math.max(0.01, fx.dur - 0.45));
        var segs = Math.min(3, Math.floor(fx.t / 0.1) + 1);
        ctx.lineWidth = 2.2; ctx.lineJoin = 'round';
        for (var si = 0; si < segs; si++) {
          ctx.strokeStyle = 'rgba(120,92,58,' + a + ')';
          ctx.beginPath();
          for (var pi = 0; pi <= 2; pi++) {
            var idx = si * 2 + pi, pt = fx.pts[idx];
            if (!pt) break;
            if (pi === 0) ctx.moveTo(pt[0], pt[1]); else ctx.lineTo(pt[0], pt[1]);
          }
          ctx.stroke();
          ctx.strokeStyle = 'rgba(226,192,120,' + (a * 0.8) + ')'; ctx.lineWidth = 1.1;
          ctx.stroke(); ctx.lineWidth = 2.2;
        }
      } else if (fx.kind === 'ghost') {
        // #5 Tàn Ảnh Vô Cực: bóng tàn ảnh của CHÍNH sprite boss, lệch
        // ngược hướng đòn, mờ dần trong 0,3s (kỹ thuật bóng liềm của
        // drawStreaks áp lên thân quái).
        var gim = ASSETS.mons[fx.species];
        if (!imgReady(gim)) return;
        ctx.save();
        ctx.globalAlpha = fx.alpha * Math.max(0, 1 - k);
        ctx.translate(fx.x, fx.y);
        if (fx.face < 0) ctx.scale(-1, 1);
        ctx.drawImage(gim, fx.src.x, fx.src.y, fx.src.w, fx.src.h, -fx.size / 2, -fx.size, fx.size, fx.size);
        ctx.restore();
        ctx.globalAlpha = 1;
      } else if (fx.kind === 'swordStand') {
        // #7 Kiếm Ý mở màn: BA kiếm ánh sáng DỰNG ĐỨNG quanh boss (đúng
        // hình kiếm dựng của khối báo chiêu Thăng Long / Hoa: thân trắng
        // nóng + quầng lam + chuôi sáng ngang) trong nhịp dựng kiếm,
        // trước khi ba kiếm lao nối tiếp bằng streak trễ nhịp.
        var env = Math.sin(k * Math.PI);
        for (var wi = -1; wi <= 1; wi++) {
          var wx = fx.x + wi * 26, wy = fx.y - 52 - Math.abs(wi) * -6 + Math.sin(tNow / 240 + wi) * 2;
          ctx.fillStyle = 'rgba(127,232,224,' + (0.30 * env) + ')';
          ctx.beginPath(); ctx.ellipse(wx, wy, 7, 17, 0, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,' + (0.92 * env) + ')';
          ctx.fillRect(wx - 1.4, wy - 15, 2.8, 26);
          ctx.fillStyle = 'rgba(190,246,255,' + (0.9 * env) + ')';
          ctx.fillRect(wx - 5, wy + 11, 10, 2.2);
        }
      } else if (fx.kind === 'ripple') {
        // #3 Thủy Xà Tinh: gợn nước ELIP nén dọc 0,42 lan từ đầu rắn
        // (cùng tỉ lệ nén của vòng gợn Chấn Âm trong drawResFields).
        var rr = 8 + 24 * k;
        ctx.strokeStyle = 'rgba(80,170,190,' + (0.75 * (1 - k)) + ')'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(fx.x, fx.y, rr, rr * 0.42, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = 'rgba(190,235,250,' + (0.5 * (1 - k)) + ')'; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.ellipse(fx.x, fx.y, rr * 0.55, rr * 0.55 * 0.42, 0, 0, Math.PI * 2); ctx.stroke();
      } else if (fx.kind === 'converge') {
        // #18 Cửu Phẩm Kiếm Khí: 3 điểm sáng VÀNG tụ dần vào đầu kiếm
        // của Lục Tranh trong suốt windup 0,38s, kết bằng một chớp tụ.
        for (var ci = 0; ci < 3; ci++) {
          var ca = ci * 2.1 + fx.t * 3.2, cr = 17 * (1 - k) + 3;
          var cxp = fx.x + Math.cos(ca) * cr, cyp = fx.y + Math.sin(ca) * cr * 0.6;
          ctx.fillStyle = 'rgba(255,226,150,0.9)';
          ctx.beginPath(); ctx.arc(cxp, cyp, 2.2, 0, Math.PI * 2); ctx.fill();
        }
        if (k > 0.7) {
          ctx.fillStyle = 'rgba(255,244,200,' + ((k - 0.7) / 0.3 * 0.55) + ')';
          ctx.beginPath(); ctx.ellipse(fx.x, fx.y, 8, 5, 0, 0, Math.PI * 2); ctx.fill();
        }
      }
    });
  }

  /* ================= Sân cộng hưởng Vạn Âm (bước 2, thiết kế 3.2–3.5) ================= */
  // Thang trình diễn bốn nấc theo Tĩnh Âm TRƯỚC khi ra đòn (3.3).
  var RES_TIERS = [
    null,
    { R: 26, cols: 0, colH: 0, budget: 14 },
    { R: 34, cols: 3, colH: 60, budget: 14 },
    { R: 42, cols: 4, colH: 90, budget: 22 },
    { R: 50, cols: 5, colH: 110, budget: 22 }
  ];
  function resTierFor(silence) { var s = silence || 0; return s < 30 ? 1 : s < 60 ? 2 : s < 85 ? 3 : 4; }
  function spawnResParts(x, y, n, tier, skill) {
    if (!fxOn()) return;
    var budget = RES_TIERS[tier].budget;
    n = Math.min(n, budget);
    for (var i = 0; i < n; i++) {
      if (parts.length >= MAX_PARTS) break; // cạn ngân sách: sân + chữ nổi vẫn hiện (spawnResField không phụ thuộc hạt)
      var a = (i / Math.max(1, n)) * Math.PI * 2 + resSeedSeq * 0.7;
      var gold = tier >= 3 && i % 4 === 3;
      parts.push({
        x: x + Math.cos(a) * 6, y: y - 6 - (i % 3) * 4, vx: Math.cos(a) * (14 + (i % 5) * 5), vy: -18 - (i % 4) * 7,
        t: 0, life: 0.55 + (i % 3) * 0.12, col: gold ? '255,214,110' : (i % 3 === 0 ? '255,255,255' : '127,232,224'), size: gold ? 2.4 : 2
      });
    }
  }
  function spawnResWave(x0, y0, x1, y1, reach, tier) {
    if (SET && SET.current && !SET.current.fxRings) return; // 3.8: fxRings tắt -> mất đường sóng
    // ĐIỂM 3 (vá live 2026-11-03): dur = 0,12s vẫn là thời gian BAY tới
    // đích (pha sóng chạy hết trong 0,12s như cũ); life = 0,40s là tổng
    // thời gian NHÌN THẤY — sau khi sóng tới đích, đường sóng GIỮ NGUYÊN
    // hình và mờ dần trong phần còn lại (xem holdK ở drawResWaves).
    // Thuần trình diễn: thời điểm áp sát thương, cơ chế khóa và mọi con
    // số đấu không đổi (sát thương áp tại khoảnh khắc tung đòn như cũ).
    resWaves.push({ x0: x0, y0: y0, x1: x1, y1: y1, reach: reach == null ? 1 : reach, t: 0, dur: 0.12, life: 0.40, tier: tier || 1 });
    if (resWaves.length > 8) resWaves.shift();
  }
  function spawnResField(gx, gy, opts) {
    opts = opts || {};
    var tier = resTierFor(opts.silenceBefore);
    var spec = RES_TIERS[tier];
    var dur = opts.skill === 'pha' ? 0.7 : opts.skill === 'chan' ? 0.9 : opts.skill === 'phong' ? 0.95 : 0.85; // mở 0,18 + đỉnh 0,12–0,2 + tan 0,3–0,5
    var seed = (++resSeedSeq) * 1.618;
    var cols = [];
    for (var i = 0; i < spec.cols; i++) cols.push({ ph: seed * (i + 1) * 0.9, h: spec.colH * (0.86 + ((i * 37 + Math.floor(seed * 10)) % 10) / 34) });
    var f = { x: gx, y: gy, t: 0, dur: dur, skill: opts.skill || 'pha', tier: tier, R: spec.R, cols: cols, seed: seed, cracks: opts.skill === 'pha', target: opts.target || null };
    resFields.push(f);
    if (resFields.length > 6) resFields.shift();
    if (tier >= 4) { // vòng sóng phụ: vật lân cận rung/nhấp nháy rất nhẹ (trình bày thuần, không đổi trạng thái trận)
      mons.forEach(function (mm) { if (mm.hp > 0 && Math.abs(mm.x + 16 - gx) < 120 && Math.abs(mm.y + 16 - gy) < 120) mm.resVibT = Math.max(mm.resVibT || 0, 0.18); });
    }
    spawnResParts(gx, gy, tier === 1 ? 5 : tier === 2 ? 9 : tier === 3 ? 14 : 18, tier, f.skill);
    return tier;
  }
  // Điểm vào duy nhất của bốn đòn cộng hưởng khi có mục tiêu: đường sóng
  // khóa chạy trước, sân nở tại mục tiêu, tiếng theo âm gốc mục tiêu.
  function castResonanceFx(skill, gx, gy, opts) {
    opts = opts || {};
    var pc = { x: px + 16, y: py + 16 };
    var tier = resTierFor(opts.silenceBefore);
    if (!opts.noWave) spawnResWave(pc.x, pc.y, gx, gy - 14, 1, tier);
    spawnResField(gx, gy, { skill: skill, silenceBefore: opts.silenceBefore, target: opts.target || null });
    var f = opts.baseFreq || 420;
    if (skill === 'pha') sfxPha(f, tier);
    else if (skill === 'chan') sfxChan(f);
    else if (skill === 'dinh') sfxResDinh(f);
    else if (skill === 'phong') sfxResPhong(f);
    return tier;
  }
  function updateResFx(dt) {
    for (var i = resFields.length - 1; i >= 0; i--) { resFields[i].t += dt; if (resFields[i].t >= resFields[i].dur) resFields.splice(i, 1); }
    for (var j = resWaves.length - 1; j >= 0; j--) { resWaves[j].t += dt; if (resWaves[j].t >= (resWaves[j].life || resWaves[j].dur)) resWaves.splice(j, 1); }
  }
  function drawResWaves() {
    if (SET && SET.current && !SET.current.fxRings) return;
    resWaves.forEach(function (w) {
      var p = Math.min(1, w.t / w.dur);
      // ĐIỂM 3 (vá live 2026-11-03): hệ số giữ/mờ — 1,0 trong suốt pha
      // bay (0,12s) và nhịp giữ đầu (tới 0,20s), sau đó giảm tuyến tính
      // về 0 tại cuối vòng đời nhìn thấy (life 0,40s). Nhân SAU các sàn
      // độ mờ của vá nhanh (sàn vẫn giữ tác dụng trong pha bay/giữ);
      // hình sin đóng băng ở p = 1 sau khi sóng tới đích.
      var life = w.life || w.dur;
      var holdK = w.t <= 0.20 ? 1 : Math.max(0, 1 - (w.t - 0.20) / Math.max(0.01, life - 0.20));
      var ex = w.x0 + (w.x1 - w.x0) * w.reach, ey = w.y0 + (w.y1 - w.y0) * w.reach;
      var dx = ex - w.x0, dy = ey - w.y0, len = Math.max(1, Math.hypot(dx, dy));
      var nx = -dy / len, ny = dx / len;
      /* Vá nhanh 2026-11-03 (Điểm 4 — chơi thử live đợt Vạn Âm: đường
         sóng ở cự ly gần gần như không thấy trên nền cỏ sáng): thông số
         cũ là quầng cyan 5px độ mờ 0,32 + lõi trắng 2px — ở cỡ điện
         thoại đường sóng ngắn (quái đứng sát) chìm hẳn vào nền sáng.
         Nay thêm một lượt NỀN TƯƠNG PHẢN tối (cùng mẹo viền tối của số
         sát thương), đặt SÀN độ mờ/độ dày cho cả ba lượt và nút sáng ở
         hai đầu sóng để mắt neo được hai đầu nối. Thuần trình diễn:
         vòng đời 0,12s, hình sin, cơ chế khóa và mọi con số đấu giữ
         nguyên. */
      var passes = [
        { col: '7,42,48', a: Math.max(0.34, 0.5 * (1 - p * 0.35)) * holdK, lw: 9 },
        { col: '127,232,224', a: Math.max(0.38, 0.55 * (1 - p * 0.35)) * holdK, lw: 7 },
        { col: '255,255,255', a: Math.max(0.8, 0.95 * (1 - p * 0.25)) * holdK, lw: 3 }
      ];
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      for (var pass = 0; pass < passes.length; pass++) {
        ctx.strokeStyle = 'rgba(' + passes[pass].col + ',' + passes[pass].a + ')';
        ctx.lineWidth = passes[pass].lw;
        ctx.beginPath();
        for (var s = 0; s <= 12; s++) {
          var u = s / 12;
          var amp = 7 * (1 - u) * Math.sin(u * Math.PI); // biên độ thu nhỏ dần về phía mục tiêu
          var off = Math.sin(u * Math.PI * 3 - p * 6.3) * amp;
          var px2 = w.x0 + dx * u + nx * off, py2 = w.y0 + dy * u + ny * off;
          if (s === 0) ctx.moveTo(px2, py2); else ctx.lineTo(px2, py2);
        }
        ctx.stroke();
      }
      // Nút sáng hai đầu sóng: đầu người tung + đầu mục tiêu.
      ctx.fillStyle = 'rgba(127,232,224,' + (Math.max(0.35, 0.6 * (1 - p * 0.3)) * holdK) + ')';
      ctx.beginPath(); ctx.arc(w.x0, w.y0, 5.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(ex, ey, 5.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,' + (Math.max(0.8, 0.95 * (1 - p * 0.25)) * holdK) + ')';
      ctx.beginPath(); ctx.arc(w.x0, w.y0, 2.6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(ex, ey, 2.6, 0, Math.PI * 2); ctx.fill();
    });
  }
  function drawResFields() {
    if (SET && SET.current && !SET.current.fxRings) return; // 3.8: fxRings tắt -> mất sân, giữ chữ nổi/số/tiếng
    var showFx = fxOn(); // fxParticles tắt -> mất cột/quầng/hạt, giữ vòng tĩnh tối thiểu
    resFields.forEach(function (f) {
      var k = f.t / f.dur;
      var open = Math.min(1, f.t / 0.18), fade = k > 0.62 ? Math.max(0, 1 - (k - 0.62) / 0.38) : 1;
      var peak = k >= 0.2 && k <= 0.42 ? Math.sin((k - 0.2) / 0.22 * Math.PI) : 0;
      var env = open * fade;
      var dir = f.skill === 'phong' ? -1 : 1;
      var rot = f.skill === 'dinh' ? 0 : f.seed + f.t * 0.55 * dir; // Định: đứng yên tuyệt đối
      var R = f.R * (0.55 + 0.45 * open);
      if (f.skill === 'chan' && k > 0.72) R *= 1 - 0.15 * ((k - 0.72) / 0.28); // Chấn: vòng ngoài co ~15% ở nhịp cuối
      ctx.save(); ctx.translate(f.x, f.y);
      if (peak > 0) { ctx.fillStyle = 'rgba(4,8,12,' + (0.14 * peak) + ')'; ctx.beginPath(); ctx.ellipse(0, 0, R * 2.3, R * 2.3 * 0.42, 0, 0, Math.PI * 2); ctx.fill(); } // tối nền rất nhẹ tại khung đỉnh 0,2s
      // Lớp 1: vòng lõi trắng -> lam ngọc, nén elip ~0,42.
      ctx.save(); ctx.scale(1, 0.42);
      var grd = null; try { grd = ctx.createRadialGradient(0, 0, 2, 0, 0, R); } catch (e) { grd = null; }
      if (grd) { grd.addColorStop(0, 'rgba(255,255,255,' + (0.5 * env) + ')'); grd.addColorStop(0.55, 'rgba(127,232,224,' + (0.3 * env) + ')'); grd.addColorStop(1, 'rgba(127,232,224,0)'); ctx.fillStyle = grd; }
      else ctx.fillStyle = 'rgba(127,232,224,' + (0.3 * env) + ')';
      ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      if (f.skill === 'dinh' && showFx) { // quầng elip tím-trắng riêng của Định
        ctx.strokeStyle = 'rgba(216,180,255,' + (0.55 * env) + ')'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.ellipse(0, 0, R * 1.08, R * 1.08 * 0.42, 0, 0, Math.PI * 2); ctx.stroke();
      }
      if (f.skill === 'chan') { // gợn đất như mặt nước: ba vòng elip lệch nhịp
        for (var rip = 0; rip < 3; rip++) {
          var rk = ((f.t * 1.4 + rip / 3) % 1);
          ctx.strokeStyle = 'rgba(127,232,224,' + (0.3 * (1 - rk) * fade) + ')'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.ellipse(0, 2, R * (0.4 + rk * 0.75), R * (0.4 + rk * 0.75) * 0.42, 0, 0, Math.PI * 2); ctx.stroke();
        }
      }
      // Lớp 2: hai vòng sóng — một liền, một đứt đoạn xoay chậm.
      ctx.strokeStyle = 'rgba(190,250,244,' + (0.8 * env) + ')'; ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.ellipse(0, 0, R, R * 0.42, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.save();
      if (ctx.setLineDash) ctx.setLineDash([8, 7]);
      ctx.strokeStyle = 'rgba(127,232,224,' + (0.65 * env) + ')'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(0, 0, R * 1.14, R * 1.14 * 0.42, rot * 0.35, 0, Math.PI * 2); ctx.stroke();
      if (ctx.setLineDash) ctx.setLineDash([]);
      ctx.restore();
      if (f.skill === 'pha' && peak > 0) { // Phá: viền sân chớp đỏ cam đúng một lần ở đỉnh
        ctx.strokeStyle = 'rgba(255,96,44,' + (0.75 * peak) + ')'; ctx.lineWidth = 3.2;
        ctx.beginPath(); ctx.ellipse(0, 0, R * 1.2, R * 1.2 * 0.42, 0, 0, Math.PI * 2); ctx.stroke();
      }
      if (f.tier >= 4) { // vòng sóng phụ nấc 4
        ctx.strokeStyle = 'rgba(127,232,224,' + (0.2 * fade) + ')'; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.ellipse(0, 0, R * (1.35 + k * 1.15), R * (1.35 + k * 1.15) * 0.42, 0, 0, Math.PI * 2); ctx.stroke();
      }
      // Lớp 3: vòng phù văn — khối chữ nhật hướng tâm (ngôn ngữ vòng trận gói 10).
      for (var bi = 0; bi < 12; bi++) {
        var ba = rot * 0.5 + bi / 12 * Math.PI * 2;
        var bAlpha = 0.75 * env;
        if (f.skill === 'phong') { var th = 0.25 + (bi / 12) * 0.55; bAlpha *= (k < th ? 1 : 0.18); } // Phong: phù văn tắt dần từng mảng
        ctx.save(); ctx.rotate(ba); ctx.translate(R * 0.94, 0); ctx.scale(1, 0.42); ctx.rotate(Math.PI / 2);
        ctx.fillStyle = 'rgba(127,232,224,' + bAlpha + ')'; ctx.fillRect(-1.6, -5, 3.2, 10);
        ctx.fillStyle = 'rgba(255,255,255,' + (bAlpha * 0.8) + ')'; ctx.fillRect(-0.7, -2.6, 1.4, 5.2);
        ctx.restore();
      }
      // Lớp 4: cột sóng đứng (chỉ nấc >= 2; tắt theo fxParticles). Định:
      // cột TĨNH tuyệt đối — không nhấp nháy như luật đứng yên của đòn.
      if (showFx && f.cols.length) {
        f.cols.forEach(function (c, ci) {
          var flick = f.skill === 'dinh' ? 1 : 0.78 + 0.22 * Math.sin(f.t * 21 + c.ph);
          var ch = c.h * open * flick, cx2 = (ci - (f.cols.length - 1) / 2) * f.R * 0.36;
          ctx.fillStyle = 'rgba(127,232,224,' + (0.3 * env) + ')'; ctx.fillRect(cx2 - 4.5, -ch, 9, ch);
          ctx.fillStyle = 'rgba(255,255,255,' + (0.9 * env) + ')'; ctx.fillRect(cx2 - 1.4, -ch, 2.8, ch);
        });
      }
      // Phá: vết nứt sáng 2–3 đường trên mục tiêu ở đỉnh/tan.
      if (f.cracks && k > 0.18) {
        var ca = Math.min(1, (k - 0.18) / 0.2) * fade;
        ctx.lineWidth = 2;
        for (var ci2 = 0; ci2 < 3; ci2++) {
          var sx = -8 + ci2 * 8 + Math.sin(f.seed * (ci2 + 2)) * 3, sy = -34 - ci2 * 3;
          ctx.strokeStyle = 'rgba(255,120,60,' + (0.45 * ca) + ')'; ctx.lineWidth = 3.4;
          ctx.beginPath(); ctx.moveTo(sx, sy + 16); ctx.lineTo(sx + 4, sy + 6); ctx.lineTo(sx - 2, sy - 2); ctx.lineTo(sx + 5, sy - 11); ctx.stroke();
          ctx.strokeStyle = 'rgba(255,255,255,' + (0.9 * ca) + ')'; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.moveTo(sx, sy + 16); ctx.lineTo(sx + 4, sy + 6); ctx.lineTo(sx - 2, sy - 2); ctx.lineTo(sx + 5, sy - 11); ctx.stroke();
        }
      }
      ctx.restore();
    });
  }
  /* Lớp NGHE THỤ ĐỘNG (mục 6, parent duyệt — phụ, không chặn tiến độ):
     Tĩnh Âm >= 85 + đứng yên + ngoài trận: theo nhịp thưa xác định
     (11–17s, suy từ đồng hồ thế giới + ô đứng — không dùng Math.random)
     phát nốt khóa sóng cực khẽ (<=0,02) của sinh vật/vật thể gần nhất.
     Tắt cùng cổng tiếng chiêu 'skill'. */
  function updateResPassive(dt) {
    if (!state || enc || hhtFight || tlFight || dlg || moving) { resPassiveT = Math.max(resPassiveT, 4); return; }
    if ((state.silence || 0) < 85) return;
    resPassiveT -= dt;
    if (resPassiveT > 0) return;
    var hash = ((state.dayMinutes || 0) * 7 + Math.floor(px / TILE) * 13 + Math.floor(py / TILE) * 29) % 7;
    resPassiveT = 11 + hash;
    var pc = { x: px + 16, y: py + 16 }, best = null, bd = 4.2 * TILE;
    mons.forEach(function (mm) { if (mm.hp <= 0) return; var d = Math.hypot(mm.x + 16 - pc.x, mm.y + 16 - pc.y); if (d < bd) { bd = d; best = resBaseFreqForMonster(mm); } });
    if (best == null) {
      var amp = L.activeMap();
      var props = (amp && amp.props) || [];
      for (var i = 0; i < props.length; i++) {
        var pr = props[i]; if (state.hiddenProps && state.hiddenProps[pr.id]) continue;
        var d2 = Math.hypot(pr.x * TILE + 16 - pc.x, pr.y * TILE + 16 - pc.y);
        if (d2 < bd) { bd = d2; best = /coc|cot|bia|da_|thach|rock|stele/.test(pr.type || '') ? 170 : 220; }
      }
    }
    if (best != null) lockNote(best, 0.02, 0.09, 0);
  }

  /* ================= Đánh đêm phủ Hứa: diễn thật tại sân (gói phụ 8) =================
     Lệnh Bui 10:21 ngày 2026-11-02: sự kiện đánh nhau quanh chương 5
     không được chỉ kể bằng lời dẫn — chuỗi ba đợt người bịt mặt xông
     vào phủ Hứa nay DIỄN THẬT tại sân phủ bằng đúng hệ hiệu ứng của
     làn chạm trán: từng đợt kẻ địch xuất hiện, lao vào sân; đáp trả
     của Giang Phàm theo đúng bốn điểm lựa chọn gốc (PHÁ / CHẤN / kiếm
     quyết / dự phòng) diễn thành hình động quanh các lời thoại gốc.
     MỌI điểm quyết định, kết cục, cờ (atkWave / atkFallback) và số
     liệu của resolveAtkWave gốc GIỮ NGUYÊN — gói này chỉ thay lớp
     trình diễn: hàm gốc vẫn tính toàn bộ trạng thái như cũ.
     Tạo hình kẻ bịt mặt dùng đúng look mà game đã giao cho đệ tử
     Huyết Bạc Cung (huyet_de ở thung lũng: villager_m); tên cầm đầu
     nhận diện bằng sợi tơ đen lượn quanh tay như lời dẫn đợt ba.
     Nhịp duy nhất dùng TRANH PHÂN CẢNH: "gia nhân gác cổng đã bị
     đánh ngã" — việc xảy ra TRƯỚC khi người chơi tới nơi, ngoài tầm
     mắt nhân vật (assets/panels/atk_gate.png, ghép từ tài sản mỹ
     thuật của chính game), chiếu trong lúc dòng dẫn đợt một hiện. */
  var atkFigs = [], atkFx = null, atkPanelPending = false, atkPanelShown = false;
  var ATK_WAVES = {
    1: [{ sx: 29, sy: 31, tx: 20, ty: 32 }, { sx: 30, sy: 34, tx: 21, ty: 35 }, { sx: 29, sy: 37, tx: 20, ty: 38 }],
    2: [{ sx: 19, sy: 29, tx: 18, ty: 33 }, { sx: 22, sy: 29, tx: 21, ty: 34 }, { sx: 25, sy: 30, tx: 23, ty: 36 }, { sx: 27, sy: 32, tx: 19, ty: 37 }],
    3: [{ sx: 29, sy: 35, tx: 24, ty: 35, leader: true }]
  };
  function atkSpawnWave(n) {
    var defs = ATK_WAVES[n]; if (!defs) return;
    atkFigs = defs.map(function (d, i) {
      return { px: d.sx * TILE, py: d.sy * TILE, tx: d.tx * TILE, ty: d.ty * TILE,
        sx: d.sx * TILE, sy: d.sy * TILE, look: 'villager_m', dir: 'left',
        mode: 'enter', t: 0, walkT: i * 0.7, leader: !!d.leader, seed: i * 1.7, threadT: 0,
        standX: d.tx * TILE, standY: d.ty * TILE, swingDone: false, threadShotT: d.leader ? 1.1 : 0 };
    });
    atkFigs.forEach(function (f) { spawnSmoke(f.px + 16, f.py + 14, 3); }); // kẻ bịt mặt hiện ra trong khói lam xám (gói phụ 10)
    if (n === 1) atkPanelPending = true; // tranh phân cảnh cho nhịp gia nhân gác cổng (xảy ra trước khi người chơi tới)
  }
  function atkStageResolve(action, done) {
    if (!atkFigs.length) { done(); return; }
    var chEl = $('dlg-choices'); if (chEl) chEl.innerHTML = ''; // gỡ nút lựa chọn ngay: trong 1,15 giây diễn đáp trả, người chơi không bấm lại được lần hai
    atkFx = { action: action, t: 0, dur: 1.15, reacted: false, fled: false, done: done };
  }
  function showAtkPanel() { var el = $('atk-panel'); if (el) el.style.display = 'block'; }
  function hideAtkPanel() { var el = $('atk-panel'); if (el) el.style.display = 'none'; }
  function updateAtkFigs(dt) {
    // Hình diễn chạy cả khi hộp thoại đang mở: lời kể đi tới nhịp nào,
    // hình diễn đúng nhịp đó (kẻ địch tiến vào trong lúc dòng dẫn hiện).
    if (dt <= 0) return;
    for (var i = atkFigs.length - 1; i >= 0; i--) {
      var f = atkFigs[i]; f.t += dt;
      if (f.mode === 'enter' || f.mode === 'flee' || f.mode === 'advance' || f.mode === 'lunge' || f.mode === 'retreat' || f.mode === 'search') {
        var spd = f.mode === 'lunge' ? 170 : (f.mode === 'search' ? 120 : (f.leader ? 55 : 105));
        var dx = f.tx - f.px, dy = f.ty - f.py, dist = Math.hypot(dx, dy), step = spd * dt;
        if (dist <= step) {
          f.px = f.tx; f.py = f.ty;
          if (f.mode === 'flee') { if (f.smokeOnRemove && parts.length <= MAX_PARTS - 6) spawnSmoke(f.px + 16, f.py + 14, 3); atkFigs.splice(i, 1); continue; }
          if (f.mode === 'search') {
            // Nhánh ẩn nấp (#20): lùng sục qua vị trí người chơi rồi về điểm xuất phát ở mép rừng và tan trong khói.
            f.searchPts = (f.searchPts || []).slice(1);
            if (!f.searchPts.length) { if (parts.length <= MAX_PARTS - 6) spawnSmoke(f.px + 16, f.py + 14, 3); atkFigs.splice(i, 1); continue; }
            f.tx = f.searchPts[0].x; f.ty = f.searchPts[0].y;
          } else if (f.mode === 'lunge') {
            f.mode = 'retreat'; f.tx = f.standX; f.ty = f.standY; // vung đao xong lùi về đúng vị trí đứng
          } else if (f.mode === 'retreat') {
            f.mode = 'stand'; f.swingDone = true;
          } else if (f.mode === 'enter' && !f.swingDone) {
            // #19: vừa tới vị trí đứng — lao thêm 10px vung đao về phía người chơi/sân + 1 vệt xám thép + tiếng kiếm khẽ, rồi lùi về (chỉ trình diễn, không sát thương).
            f.standX = f.px; f.standY = f.py;
            var sdx = (px + 16) - (f.px + 16), sdy = (py + 16) - (f.py + 16), sd = Math.hypot(sdx, sdy) || 1;
            f.tx = f.standX + sdx / sd * 10; f.ty = f.standY + sdy / sd * 10; f.mode = 'lunge';
            if (fxOn()) spawnStreak(f.px + 16, f.py + 10, Math.atan2(sdy, sdx), '150,160,175', false);
            sfxSword();
          } else f.mode = 'stand';
        } else {
          f.px += dx / dist * step; f.py += dy / dist * step; f.walkT += dt;
          f.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
        }
      }
      if (f.leader && f.mode === 'stand') {
        f.threadT -= dt;
        if (f.threadT <= 0) { f.threadT = 0.45; spawnParts(f.px + 26, f.py + 34, 2, '46,44,58', 10, false); } // sợi tơ đen uốn lượn giữa các ngón tay hắn
        // #19 cầm đầu đợt 3: vệt tơ đen BẮN THỬ về phía người chơi mỗi ~2s — 2 hạt tối bay cong (trọng lực hạt bẻ cong quỹ đạo) rồi tan; chỉ trình diễn.
        f.threadShotT = (f.threadShotT == null ? 1.1 : f.threadShotT) - dt;
        if (f.threadShotT <= 0) {
          f.threadShotT = 2 + (f.seed % 0.7);
          if (fxOn() && parts.length <= MAX_PARTS - 12) {
            var tox = px + 16, toy = py + 16, tdx = tox - (f.px + 26), tdy = toy - (f.py + 34);
            for (var tk = 0; tk < 2; tk++) {
              parts.push({ x: f.px + 26 + (tk ? 5 : -5), y: f.py + 34, vx: tdx / 0.65, vy: tdy / 0.65 - tk * 14, life: 0.6 + tk * 0.08, t: 0, col: '40,38,52', r: 2 + tk * 0.6 });
            }
          }
        }
      }
    }
    if (atkFx) {
      atkFx.t += dt;
      if (!atkFx.reacted && atkFx.t >= 0.25) {
        atkFx.reacted = true;
        if (atkFx.action === 'chi_hide') {
          // #20 nhánh ẩn nấp: hình địch lùng sục 1 vòng qua vị trí người chơi rồi tan vào rừng (xem mode 'search' ở trên).
          atkFigs.forEach(function (f) { if (f.chi) { f.searchPts = [{ x: px, y: py }, { x: f.sx, y: f.sy }]; f.tx = px; f.ty = py; f.mode = 'search'; } });
        } else atkFigs.forEach(function (f, idx) {
          if (atkFx.action === 'atk_sword') {
            spawnStreak(f.px + 16, f.py + 4, 0.3 + idx * 0.22, '170,230,255'); // vệt kiếm quang qua từng tên (gói phụ 10)
            addDmgFloat(f.px + 16, f.py - 8, '-' + (14 + (idx * 7) % 13), '190,235,200', { size: 15, targetKey: 'atk' + idx });
            f.mode = 'stagger'; f.t = 0;
          } else if (atkFx.action === 'atk_fallback') {
            f.tx = Math.max(4 * TILE, f.tx - 2 * TILE); f.mode = 'advance'; // đợt địch thừa thế ép thêm vào sân trước khi bị đẩy lui
          } else { f.mode = 'stagger'; f.t = 0; } // PHÁ / CHẤN: cả đợt chao đảo
        });
      }
      var fleeAt = atkFx.action === 'atk_fallback' ? 0.78 : 0.62;
      if (atkFx.reacted && !atkFx.fled && atkFx.t >= fleeAt) {
        atkFx.fled = true;
        atkFigs.forEach(function (f) { f.tx = f.sx + 3 * TILE; f.ty = f.sy; f.mode = 'flee'; });
      }
      if (atkFx.t >= atkFx.dur) { var dn = atkFx.done; atkFx = null; dn(); }
    }
  }

  /* ================= #20 Bóng đen phục kích Linh Chi, chương 8 (boss-fx) =================
     Tái dùng NGUYÊN cơ chế hình diễn đánh đêm (atkFigs/atkSpawnWave/
     atkStageResolve): 1 hình địch look villager_m (đệ tử Huyết Bạc
     Cung) hiện trong khói ở mép rừng phía đông người chơi, tiến vào
     đứng cách 2 ô rồi TỰ diễn nhịp vung đao của #19 (lao 10px + vệt
     xám thép). Khi người chơi đáp trả, resolveChiAmbush gọi
     atkStageResolve('atk_sword'/'atk_chan', noop) CHẠY SONG SONG với
     lời thoại gốc — chao đảo ở 0,25s, tháo chạy về mép rừng + khói ở
     0,62s, khép ở 1,15s — không chặn/không thêm chờ cho luồng thoại,
     không đụng một chữ/cờ/kết cục nào của ba nhánh. Nhánh ẩn nấp dùng
     chiStageHide: hình địch lùng sục qua vị trí người chơi rồi tan. */
  function chiSpawnAmbushFig() {
    if (atkFigs.some(function (f) { return f.chi; })) return; // chọn hỏng rồi chọn lại: hình vẫn đứng nguyên, không sinh thêm
    var sx = px + 5 * TILE, sy = py, tx = px + 2 * TILE, ty = py;
    atkFigs = [{ px: sx, py: sy, tx: tx, ty: ty, sx: sx, sy: sy, look: 'villager_m', dir: 'left',
      mode: 'enter', t: 0, walkT: 0, leader: false, seed: 2.3, threadT: 0,
      standX: tx, standY: ty, swingDone: false, chi: true, smokeOnRemove: true }];
    if (parts.length <= MAX_PARTS - 6) spawnSmoke(sx + 16, sy + 14, 3); // hiện ra trong khói ở mép rừng
  }
  function chiStageHide() {
    if (!atkFigs.some(function (f) { return f.chi; })) return;
    var chEl = $('dlg-choices'); if (chEl) chEl.innerHTML = ''; // như atkStageResolve: gỡ nút ngay, tránh bấm lại trong lúc diễn
    atkFx = { action: 'chi_hide', t: 0, dur: 1.15, reacted: false, fled: true, done: function () {} }; // fled=true sẵn: bỏ qua khối tháo chạy chung, mode 'search' tự lo
  }

  /* ================= #21+#22 Yêu thú giữ dược chương 11 — ĐƯỜNG A (boss-fx) =================
     Hình diễn THUẦN TRÌNH DIỄN dựng bằng sheet son_chu sẵn có qua cơ
     chế hình diễn riêng kiểu atkFigs (kdFig): KHÔNG đăng ký loài mới,
     KHÔNG HP, KHÔNG sát thương — trận vẫn là 2 đợt lựa chọn qua
     resolveKdBeast nguyên trạng. Đợt 1: bước ra trong bụi đất + khói,
     gầm, lao 1 nhịp, vệt quật lớn + cỏ-đất văng + shakeWorld(0,35).
     Đợt 2: mắt đỏ nhấp nháy nhanh dần, gầm dài, lao HAI nhịp tốc độ
     hình diễn gấp đôi, vệt quật đôi, shakeWorld(0,6) ở nhịp cuối.
     Kết: gục bằng khung chết (hàng 3) + mờ dần + hạt đất lắng. */
  var kdFig = null;
  function kdBudget(n) { return parts.length > MAX_PARTS - 20 ? Math.max(1, Math.ceil(n / 2)) : n; } // tự co hạt khi ngân sách thấp (Mục 2.0.5)
  function kdSpawnBeast() {
    if (kdFig) return;
    var sx = px - 2 * TILE, sy = py - 3 * TILE, tx = px - 1 * TILE, ty = py - 2 * TILE;
    kdFig = { px: sx, py: sy, tx: tx, ty: ty, sx: sx, sy: sy, standX: tx, standY: ty,
      mode: 'enter', t: 0, walkT: 0, wave: 1, lungeQueue: 1, speedMul: 1,
      eyesGlow: false, eyeT: 0, collapseT: 0 };
    if (parts.length <= MAX_PARTS - 12) { spawnSmoke(sx + 16, sy + 20, 3); spawnParts(sx + 16, sy + 26, kdBudget(3), '150,130,110', 26, false); } // bụi đất + khói lúc bước ra
    sfxRoar(false);
  }
  function kdBeginLunge(kf) {
    var dx = (px + 16) - (kf.px + 16), dy = (py + 16) - (kf.py + 16), d = Math.hypot(dx, dy) || 1;
    kf.tx = kf.standX + dx / d * 14; kf.ty = kf.standY + dy / d * 14; kf.mode = 'lunge';
    if (fxOn()) spawnStreak(kf.px + 16, kf.py + 26, Math.PI / 2, '150,130,110', true); // vệt quật lớn hướng xuống mặt đất trước vòng đá
  }
  function kdLungeImpact(kf) {
    kf.lungeQueue = Math.max(0, kf.lungeQueue - 1);
    var cx = kf.px + 16, cy = kf.py + 28;
    if (kf.wave === 2 && kf.lungeQueue === 0) {
      if (fxOn()) { spawnStreak(cx - 12, cy, Math.PI / 2, '150,130,110', true); spawnStreak(cx + 12, cy, Math.PI / 2, '170,150,120', true); } // vệt quật ĐÔI ở nhịp cuối đợt 2
      shakeWorld(0.6);
      if (parts.length <= MAX_PARTS - 12) { spawnParts(cx, cy, kdBudget(3), '110,160,80', 34, false); spawnParts(cx, cy, kdBudget(3), '150,130,110', 34, false); }
    } else {
      shakeWorld(0.35);
      if (parts.length <= MAX_PARTS - 16) { spawnParts(cx, cy, kdBudget(4), '110,160,80', 34, false); spawnParts(cx, cy, kdBudget(4), '150,130,110', 34, false); } // 8 hạt cỏ-đất văng ở điểm quật đợt 1
    }
  }
  function kdBeastWave2Fx() {
    if (!kdFig) return;
    kdFig.wave = 2; kdFig.eyesGlow = true; kdFig.eyeT = 0; kdFig.lungeQueue = 2; kdFig.speedMul = 2; // lao nhanh gấp đôi = tốc độ HÌNH DIỄN, không phải thông số đấu
    sfxRoar(false); // gầm dài hơn đợt 1: bản dài 0,7s + lớp trầm nối tiếp sẵn trong sfxRoar, cộng thêm một lớp gầm trầm nối sau
    setTimeout(function () { sfxRoar(true); }, 380);
    if (kdFig.mode === 'stand') kdBeginLunge(kdFig); // đang lao dở đợt 1 thì hàng đợi 2 nhịp tự nối tiếp ở nhịp lùi về
  }
  function kdBeastCollapse() {
    if (!kdFig || kdFig.mode === 'collapse') return;
    kdFig.mode = 'collapse'; kdFig.collapseT = 0; kdFig.eyesGlow = false;
    if (parts.length <= MAX_PARTS - 10) spawnParts(kdFig.px + 16, kdFig.py + 28, kdBudget(6), '150,130,110', 12, false); // hạt đất lắng xuống quanh thân thú gục
  }
  function updateKdFig(dt) {
    if (dt <= 0 || !kdFig) return;
    var kf = kdFig; kf.t += dt;
    if (kf.eyesGlow) kf.eyeT += dt;
    if (kf.mode === 'collapse') {
      kf.collapseT += dt;
      if (kf.collapseT >= 1.5) kdFig = null;
      return;
    }
    if (kf.mode === 'enter' || kf.mode === 'lunge' || kf.mode === 'retreat') {
      var spd = kf.mode === 'lunge' ? 160 * (kf.speedMul || 1) : (kf.mode === 'retreat' ? 140 * (kf.speedMul || 1) : 105);
      var dx = kf.tx - kf.px, dy = kf.ty - kf.py, dist = Math.hypot(dx, dy), step = spd * dt;
      if (dist <= step) {
        kf.px = kf.tx; kf.py = kf.ty;
        if (kf.mode === 'enter') { if (kf.lungeQueue > 0) kdBeginLunge(kf); else kf.mode = 'stand'; }
        else if (kf.mode === 'lunge') { kdLungeImpact(kf); kf.mode = 'retreat'; kf.tx = kf.standX; kf.ty = kf.standY; }
        else if (kf.mode === 'retreat') { if (kf.lungeQueue > 0) kdBeginLunge(kf); else kf.mode = 'stand'; }
      } else {
        kf.px += dx / dist * step; kf.py += dy / dist * step; kf.walkT += dt;
      }
    }
  }

  /* ================= Trận tỉ thí U Nhàn — Lục Tranh (gói phụ 7) =================
     Lệnh Bui 10:16 ngày 2026-11-02: trận tỉ thí đầu chương 5 phải là MÀN
     ĐÁNH NHAU THẬT dùng hệ chiến đấu + hiệu ứng của làn chạm trán (số sát
     thương theo hạng của lớp cảm giác, dừng hình, rung màn qua cổng, tiếng
     chiêu kiếm, thanh máu trên đầu), không phải cảnh đọc thoại. Cấu trúc:
     ba dòng mở đầu của cảnh gốc -> trận đánh kịch bản tại sân -> đoạn kết
     của đúng nhánh (nguyên văn). Kết cục KHÓA theo truyện: U Nhàn thắng —
     gọn nếu đã tiếp sức (cờ tiếp sức chương 5 hoặc truyền hồn lực ngay
     trong trận ở một trong hai nhịp quyết định), bị thương nếu không.
     Giang Phàm tuyệt đối không cất lời trong trận: hai nhịp quyết định là
     dòng LỰA CHỌN (không lồng tiếng theo luật, không ghi sổ lời đã nói);
     phần tiếp sức là hồn lực IM LẶNG bay sang U Nhàn. Lục Tranh thua
     không chết: trận khép ở ngưỡng máu kịch bản — văng kiếm (nhánh sạch)
     hoặc kiếm kề cổ nhận thua (nhánh thương). */
  var duel = null;
  var DUEL_U_MAX = 260, DUEL_L_MAX = 300;
  function duelNpc(id) { return npcsLive.filter(function (n) { return n.id === id; })[0] || null; }
  function duelSt(who, dmg, o) { o = o || {}; return { type: 'strike', who: who, dmg: dmg, skill: o.skill || null, crit: !!o.crit, graze: !!o.graze }; }
  function duelMulti(who, skill, hits) { return hits.map(function (h, i) { return duelSt(who, h, { skill: i === 0 ? skill : null }); }); }
  function duelScriptCommon() {
    var S = [];
    // Đoạn A: Lục Tranh ép trước, U Nhàn đáp trả bằng khoái kiếm.
    S.push(duelSt('l', 12));
    S.push(duelSt('u', 24));
    S.push.apply(S, duelMulti('u', 'Thanh Phong Khoái Kiếm', [16, 16]));
    S.push(duelSt('l', 26, { skill: 'Trảm Phong Thức' }));
    S.push({ type: 'beat', idx: 1 });
    // Đoạn B: hai bên tung chiêu mạnh nhất của mình.
    S.push(duelSt('u', 22));
    S.push(duelSt('l', 14));
    S.push(duelSt('u', 38, { skill: 'Hồi Phong Phất Liễu' }));
    S.push(duelSt('l', 28, { skill: 'Cửu Phẩm Kiếm Khí' }));
    S.push({ type: 'beat', idx: 2 });
    return S;
  }
  function duelScriptTail(clean) {
    var S = [];
    if (clean) {
      // Thắng gọn: U Nhàn áp đảo tới cùng, đòn cuối đánh văng kiếm Lục Tranh.
      S.push(duelSt('u', 24));
      S.push(duelSt('l', 10));
      S.push.apply(S, duelMulti('u', 'Thanh Phong Khoái Kiếm', [18, 18]));
      S.push(duelSt('u', 54, { skill: 'Hồi Phong Phất Liễu', crit: true }));
    } else {
      // Thắng bị thương: Lục Tranh phản đòn, một đòn sượt vai U Nhàn (đòn
      // "graze" — máu thấm áo như lời dẫn gốc), nàng thắng ở nước cuối.
      S.push(duelSt('l', 30, { skill: 'Trảm Phong Thức' }));
      S.push(duelSt('u', 20));
      S.push(duelSt('l', 56, { graze: true, crit: true }));
      S.push(duelSt('u', 22));
      S.push(duelSt('l', 14));
      S.push.apply(S, duelMulti('u', 'Thanh Phong Khoái Kiếm', [16, 14]));
      S.push(duelSt('u', 34, { skill: 'Hồi Phong Phất Liễu' }));
    }
    return S;
  }
  var DUEL_BEAT_LINES = [
    { who: 'choice', text: 'U Nhàn lùi nửa bước sau đòn Trảm Phong. Hồn lực trong ngực ngươi khẽ động…', options: [
      { label: 'Truyền hồn lực tiếp sức cho U Nhàn (im lặng)', action: 'duel_support' },
      { label: 'Đứng yên quan sát', action: 'duel_watch' } ] },
    { who: 'choice', text: 'Kiếm khí cửu phẩm ép tới, thế trận nghiêng hẳn. Ngươi có thể đưa hồn lực sang — lặng lẽ, không ai hay biết.', options: [
      { label: 'Truyền hồn lực tiếp sức cho U Nhàn (im lặng)', action: 'duel_support' },
      { label: 'Đứng yên quan sát', action: 'duel_watch' } ] }
  ];
  function startDuelScene() {
    // Ba dòng mở đầu của hai nhánh giống hệt nhau — mở bằng chính chúng,
    // phần "trận đấu" ở dòng dẫn thứ tư được THAY bằng trận đánh thật, và
    // đoạn kết của nhánh đúng kết quả sẽ đọc nguyên văn sau trận.
    say(ST.SCENE_DUEL.slice(0, 3), function () { beginDuelFight(); });
  }
  function finishDuelScene(clean) {
    var scene = clean ? ST.SCENE_DUEL : ST.SCENE_DUEL_HARD;
    say(scene.slice(4), function () {
      state.flags.duelSeen = true; // đặt cờ đúng một lần, khi trận đã khép hẳn (thoát giữa trận thì chơi lại được)
      var cap = L.REALMS[state.realm].tuviNext;
      if (cap) state.tuvi = cap;
      state.quest = 'q6_sinh_le'; refreshHUD(); saveNow(); // nối thẳng sang chương 6 ngay trong phiên
      toast('Hoàn thành chương 5: Trần gia và Hồn Sư thần bí.', 4200);
    });
  }
  function beginDuelFight() {
    var u = duelNpc('u_nhan'), l = duelNpc('luc_tranh');
    if (!u || !l || !state) { finishDuelScene(!!(state && state.flags.uNhanSupported)); return; } // dữ kiện lạ: rơi về đường thoại cũ, không kẹt nhiệm vụ
    duel = {
      u: u, l: l, uHp: DUEL_U_MAX, lHp: DUEL_L_MAX, phase: 'walk', t: 0,
      script: duelScriptCommon(), si: -1, cur: null, curT: 0, impacted: false,
      supportedInDuel: false, clean: null, soulT: 0, fxT: 0,
      uHome: { x: u.x, y: u.y, dir: u.dir }, lHome: { x: l.x, y: l.y, dir: l.dir },
      uOx: (u.x - 17) * TILE, uOy: (u.y - 36) * TILE, lOx: (l.x - 21) * TILE, lOy: (l.y - 36) * TILE,
      uKb: 0, lKb: 0, uLunge: 0, lLunge: 0
    };
    u.x = 17; u.y = 36; u.dir = 'right';
    l.x = 21; l.y = 36; l.dir = 'left';
    u.ox = duel.uOx; u.oy = duel.uOy; l.ox = duel.lOx; l.oy = duel.lOy;
  }
  function duelSupportChoice(supported) {
    if (!duel || duel.phase !== 'await') return; // chỉ có hiệu lực đúng nhịp chờ lựa chọn của trận; bấm lại/bấm trễ từ nút cũ là vô hiệu (chống kẹt pha kết thúc)
    say([]); // đóng dòng lựa chọn (không có thoại nối tiếp — trận tự tiếp diễn)
    if (supported) {
      duel.supportedInDuel = true;
      duel.soulT = 0.9; // luồng hồn lực bay từ người chơi sang U Nhàn trong updateDuel
      sfxSoul();
      rings.push({ x: duel.u.x * TILE + 16 + (duel.u.ox || 0), y: duel.u.y * TILE + 20, r: 8, a: 0.9 });
    }
    duel.phase = 'fight';
    duelNextItem();
  }
  function duelNextItem() {
    if (!duel) return;
    duel.si++;
    if (duel.si >= duel.script.length) {
      if (duel.clean === null) {
        // Hết đoạn chung: chốt nhánh theo tiếp sức (cờ chương 5 hoặc hồn lực trong trận).
        duel.clean = !!(state.flags.uNhanSupported || duel.supportedInDuel);
        duel.script = duel.script.concat(duelScriptTail(duel.clean));
        duelNextItem();
        return;
      }
      duel.phase = 'finishFx'; duel.t = 0;
      spawnPillar(duel.l.x * TILE + 16, duel.l.y * TILE + 28, { dur: 1.1, h: 118 }); // cột sáng đòn kết liễu tỉ thí (gói phụ 10)
      if (duel.clean) spawnPetals(duel.u.x * TILE + 16, duel.u.y * TILE, 5);
      if (duel.clean) { // đòn cuối đã đánh văng kiếm: tia lửa + Lục Tranh lùi hẳn
        spawnParts(duel.l.x * TILE + 16 + (duel.l.ox || 0), duel.l.y * TILE + 24, 14, '255,230,150', 40, true);
        sfxCrit();
      }
      return;
    }
    var it = duel.script[duel.si];
    if (it.type === 'beat') {
      duel.phase = 'await';
      say([DUEL_BEAT_LINES[it.idx - 1]]);
      return;
    }
    duel.cur = it; duel.curT = 0; duel.impacted = false;
    if (it.skill) {
      var a = it.who === 'u' ? duel.u : duel.l;
      addDmgFloat(a.x * TILE + 16 + (a.ox || 0), a.y * TILE - 26, it.skill, it.who === 'u' ? '190,235,200' : '255,180,150', { size: 16, life: 1.05 });
    }
    if (it.who === 'l') duelLucWindupFx(it); // nửa VẬN CHIÊU của Lục Tranh (#16–#18) — chạy trọn trong windup sẵn có, không đổi nhịp đòn
  }
  /* ===== Nửa vận chiêu của LỤC TRANH (đợt cài hiệu ứng boss, thiết kế
     Mục 2.2 #16–#18) ===== Sinh đúng lúc duelNextItem gán duel.cur nên
     hiệu ứng chạy trọn trong windup sẵn có (0,38s chiêu có tên / 0,14s
     đòn thường) và kết thúc đúng khung chạm đòn. Chỉ vẽ + tiếng: nhịp
     0,38 / 0,14 / 0,5s và mọi số sát thương kịch bản giữ nguyên. */
  function duelLucWindupFx(it) {
    if (!duel) return;
    var l = duel.l;
    var lx = l.x * TILE + 16 + (duel.lOx || 0), lfy = l.y * TILE + 30, lcy = l.y * TILE + 8;
    if (!it.skill) {
      // #16 đòn thường: chớp sáng mờ ở vai kiếm lúc bắt đầu windup 0,14s
      // (vệt kiếm nhỏ ở điểm chạm nằm trong updateDuel). Ngân sách ≤ 2 hạt.
      spawnParts(lx - 12, l.y * TILE + 2, bossFxBudget(2), '210,230,255', 9, true);
      return;
    }
    if (it.skill === 'Trảm Phong Thức') {
      // #17 (phong): vòng GIÓ XOÁY TỤ quanh chân Lục Tranh — 6 hạt xoay
      // tròn thật (kind 'orbit' trong vòng lặp hạt) + tiếng gió rút gọn.
      if (fxOn()) {
        for (var wi = 0; wi < 6 && parts.length < MAX_PARTS; wi++) {
          var wa = wi * Math.PI / 3;
          parts.push({ kind: 'orbit', cx: lx, cy: lfy, r0: 15 + (wi % 2) * 4, ang: wa, va: 9.5,
            x: lx + Math.cos(wa) * 15, y: lfy + Math.sin(wa) * 15 * 0.42,
            t: 0, life: 0.38, col: '170,220,255', r: 1.6 + (wi % 3) * 0.5 });
        }
      }
      sfxWind();
    } else if (it.skill === 'Cửu Phẩm Kiếm Khí') {
      // #18: 3 điểm sáng VÀNG cửu phẩm tụ trên đầu kiếm trong windup
      // (vật thể 'converge' của drawBossFx); luồng kiếm khí bay thật ở
      // khung chạm nằm trong updateDuel.
      bossFx.push({ kind: 'converge', x: lx - 16, y: lcy - 6, t: 0, dur: 0.38 });
    }
  }
  function updateDuel(dt) {
    if (!duel || dt <= 0) return;
    var u = duel.u, l = duel.l;
    // Luồng hồn lực tiếp sức: hạt sáng bay dọc đường người chơi -> U Nhàn.
    if (duel.soulT > 0) {
      duel.soulT = Math.max(0, duel.soulT - dt);
      var sx = px + 16, sy = py + 20, tx2 = u.x * TILE + 16 + (u.ox || 0), ty2 = u.y * TILE + 20;
      for (var sp = 0; sp < 2; sp++) {
        var f = Math.random();
        spawnParts(sx + (tx2 - sx) * f + (Math.random() - 0.5) * 10, sy + (ty2 - sy) * f + (Math.random() - 0.5) * 10, 1, '170,200,255', 12, true);
      }
    }
    function stepTo(cur, tgt, spd) { var d = tgt - cur; var m = spd * dt; return Math.abs(d) <= m ? tgt : cur + (d > 0 ? m : -m); }
    if (duel.phase === 'walk' || duel.phase === 'walkback') {
      var back = duel.phase === 'walkback';
      var uTx = back ? (duel.uHome.x - 17) * TILE : 0, uTy = back ? (duel.uHome.y - 36) * TILE : 0;
      var lTx = back ? (duel.lHome.x - 21) * TILE : 0, lTy = back ? (duel.lHome.y - 36) * TILE : 0;
      duel.uOx = stepTo(duel.uOx, uTx, 150); duel.uOy = stepTo(duel.uOy, uTy, 150);
      duel.lOx = stepTo(duel.lOx, lTx, 150); duel.lOy = stepTo(duel.lOy, lTy, 150);
      u.ox = duel.uOx; u.oy = duel.uOy; l.ox = duel.lOx; l.oy = duel.lOy;
      if (duel.uOx === uTx && duel.uOy === uTy && duel.lOx === lTx && duel.lOy === lTy) {
        if (!back) { duel.phase = 'fight'; duelNextItem(); }
        else {
          u.x = duel.uHome.x; u.y = duel.uHome.y; u.dir = duel.uHome.dir; u.ox = 0; u.oy = 0;
          l.x = duel.lHome.x; l.y = duel.lHome.y; l.dir = duel.lHome.dir; l.ox = 0; l.oy = 0;
          var clean = duel.clean; duel = null;
          finishDuelScene(clean);
        }
      }
      return;
    }
    if (duel.phase === 'finishFx') {
      duel.t += dt;
      if (duel.clean) duel.lOx = Math.min(56, duel.lOx + 90 * dt); // Lục Tranh lùi sau đòn văng kiếm
      l.ox = duel.lOx;
      if (duel.t >= 0.7) duel.phase = 'walkback';
      return;
    }
    if (duel.phase !== 'fight' || !duel.cur) return;
    var it = duel.cur;
    var atk = it.who === 'u' ? u : l, def = it.who === 'u' ? l : u;
    var windup = it.skill ? 0.38 : 0.14;
    duel.curT += dt;
    // Lao tới trong lúc vận chiêu, chạm đòn ở cuối vận chiêu.
    var lunge = duel.curT < windup ? (duel.curT / windup) * 15 : Math.max(0, 15 - (duel.curT - windup) * 90);
    if (it.who === 'u') duel.uLunge = lunge; else duel.lLunge = -lunge; // U Nhàn ở trái lao sang phải, Lục Tranh ở phải lao sang trái
    if (!duel.impacted && duel.curT >= windup) {
      duel.impacted = true;
      if (it.who === 'u') duel.lHp = Math.max(1, duel.lHp - it.dmg); else duel.uHp = Math.max(1, duel.uHp - it.dmg);
      var dxp = def.x * TILE + 16 + (def.ox || 0), dyp = def.y * TILE - 10;
      var col = it.graze ? '255,110,100' : (it.who === 'u' ? '190,235,200' : '255,244,214');
      addDmgFloat(dxp, dyp, '-' + it.dmg + (it.crit ? '!' : ''), col, { size: it.crit ? 21 : (it.skill ? 17 : 15), targetKey: 'duel_' + (it.who === 'u' ? 'l' : 'u') });
      if (it.who === 'u') duel.lKb = 6; else duel.uKb = -6;
      sfxHitBlade();
      if (it.crit) { sfxCrit(); hitStop(it.graze ? 0.09 : 0.06); shakeWorld(it.graze ? 0.35 : 0.12); }
      if (it.graze) spawnParts(dxp, def.y * TILE + 26, 10, '200,60,50', 30, true); // máu thấm áo ở đòn sượt vai
      if (it.skill) { // ARCIV 8.1: bản sắc theo chiêu tỉ thí chương 5
        var dAng = it.who === 'u' ? 0.2 : Math.PI - 0.2, dCol = it.crit ? '255,226,150' : '170,230,255';
        if (it.skill === 'Cửu Phẩm Kiếm Khí') { spawnStreak(dxp, def.y * TILE + 6, dAng, '255,246,220', false, { guard: '255,226,150', core: '255,255,255' }); spawnNineSwords(dxp, def.y * TILE + 16); }
        else if (it.skill === 'Thanh Phong Khoái Kiếm') { spawnStreak(dxp, def.y * TILE + 6, dAng, '170,240,190', false); setTimeout(function () { spawnStreak(dxp, def.y * TILE + 6, dAng + 0.44, '170,240,190', false); }, 60); spawnPetals(dxp - 14, def.y * TILE, 4); }
        else if (it.skill === 'Hồi Phong Phất Liễu') { spawnStreak(dxp, def.y * TILE + 6, dAng, '140,220,160', true, { scale: 1.2 }); spawnPetals(dxp - 14, def.y * TILE, 6); }
        else if (it.skill === 'Trảm Phong Thức') { spawnStreak(dxp, def.y * TILE + 6, dAng, '230,200,140', false, { thick: 3 }); }
        else { spawnStreak(dxp, def.y * TILE + 6, dAng, dCol, it.crit); if (it.who === 'u') spawnPetals(dxp - 14, def.y * TILE, 3); }
      } else if (it.who === 'l') {
        // boss-fx #16 (gộp): đòn thường của Lục Tranh cũng có vệt kiếm
        // NHỎ tại điểm chạm (đồng bộ với đòn có tên, chỉ mờ hơn, không
        // chữ chiêu). Nhánh Cửu Phẩm của đợt boss-fx KHÔNG áp ở đây:
        // khối ARCIV 8.1 phía trên đã trình diễn chiêu đó bằng chín
        // kiếm tỏa (bản sắc mới hơn đã duyệt) — giữ nguyên, xem báo
        // cáo gộp trong docs/boss-skill-fx-report.md.
        spawnStreak(dxp, def.y * TILE + 6, Math.PI - 0.2, '190,220,255', false, { alpha: 0.8 });
      }
    }
    if (duel.uKb) { duel.uKb = Math.abs(duel.uKb) <= 90 * dt ? 0 : duel.uKb - Math.sign(duel.uKb) * 90 * dt; }
    if (duel.lKb) { duel.lKb = Math.abs(duel.lKb) <= 90 * dt ? 0 : duel.lKb - Math.sign(duel.lKb) * 90 * dt; }
    u.ox = duel.uOx + duel.uLunge + duel.uKb;
    l.ox = duel.lOx + duel.lLunge + duel.lKb;
    if (duel.curT >= windup + 0.5) { duel.uLunge = 0; duel.lLunge = 0; duelNextItem(); }
  }

  /* ===== GÓI PHỤ 13: Thăng Long Đạo — TRẬN ĐÁNH THẬT 3 hiệp =====
     Thay lớp trắc nghiệm chọn đáp án: hình chiếu Liễu Khuynh Tiên tung
     đúng 3 chiêu của lời dẫn gốc CÓ dấu hiệu báo trước; người chơi đáp
     bằng HÀNH ĐỘNG THẬT trong cửa sổ phản ứng — hiệp 1 Thất Tinh Bộ
     lách khỏi đường chém (di chuyển/lướt bằng phím cách), hiệp 2 giữ
     phím kiếm để phong ngự qua kiếm vũ, hiệp 3 đối chém bằng kiếm quyết
     (phím 3) đúng lúc hình chiếu lao tới. Đúng nhịp = tlHits +1 như
     luật gốc; hụt = lãnh đòn (mất máu theo lớp cảm giác, máu không
     xuống dưới 1 — đài chỉ đo kiếm, kết cục thắng/thắng khó giữ nguyên
     hai cảnh gốc). Vạn Âm Cộng Hưởng bị KHÓA: bấm bất kỳ phím/nút cộng hưởng nào
     = phát hưởng → ải đặt lại đúng nhánh tl_voice gốc. Lời dẫn từng hiệp
     hiện thành PHỤ ĐỀ giữa trận (vẫn phát tiếng qua playVoiceFor như
     dòng thoại thường), không mở hộp thoại dừng trận. */
  var tlFight = null; /* {round, phase, t, bandX, waves, blocked, lunges, roundHit, fig, skillsUsed, skillName, skillTelegraph} */
  var tlSwordHeld = false, tlSwordHeldUntil = 0, tlSubT = 0, tlDashCd = 0;
  var tlLastSkills = []; // tên chiêu hình chiếu đã tung trong trận gần nhất (giữ sau khi trận khép để kiểm chứng đọc được)
  /* KỸ NĂNG CỦA HÌNH CHIẾU (đợt vá 2026-11-02, Mục E — lệnh Bui 19:40:
     hình chiếu phải DÙNG KỸ NĂNG thật, có tên, có dấu báo trước né/đỡ
     được). Ba chiêu cũ của đài nay là ba kỹ năng có danh: mỗi chiêu có
     giai đoạn BÁO TRƯỚC đo được (telegraph, giây) trước khi đòn chạm —
     hiệp 1 báo bằng dải chém khóa vị trí (2,0s ở pha sub2), hiệp 2 báo
     bằng vòng khóa từng đợt mưa kiếm (0,55s khóa->chạm mỗi đợt, 5 đợt),
     hiệp 3 báo bằng cột tụ chiêu ở pha charge (1,6s). Độ nặng tăng dần:
     một đòn hiệp 1 = 12% máu tối đa, mỗi đợt hiệp 2 = 7% (cộng dồn tới
     35% nếu đứng yên hứng trọn), một đòn hiệp 3 = 15% — SỐ GIỮ NGUYÊN
     như luật đài đã duyệt, mục này chỉ đặt tên + báo chiêu + hiệu ứng.
     Hình chiếu là CẤU TRÚC THỬ THÁCH của đài, không phải quái: nó không
     nằm trong mons/enc, không qua applyHitToMonster/normalKillDrops/
     grindHuntCredit, nên không rơi yêu đan, không trả tu vi theo mạng
     và không vào tổng kết phiên săn ở bất kỳ đường nào. */
  var TL_SKILLS = {
    1: { name: 'Thác Thiên Kiếm Quang', telegraph: 2.0, dmgPct: 0.12, color: '255,214,150' },
    2: { name: 'Kiếm Vũ Thiên La', telegraph: 0.55, dmgPct: 0.07, color: '170,220,255' },
    3: { name: 'Thăng Long Toàn Lực Kiếm', telegraph: 1.6, dmgPct: 0.15, color: '216,180,255' }
  };
  function tlSkillSfx(round) { if (round === 1) sfxTlSkill1(); else if (round === 2) sfxTlSkill2(); else sfxTlSkill3(); }
  /* Độ mờ của hình chiếu: bán trong suốt CHỚP NHẸ quanh 0,66 (0,50–0,82)
     — thân hình không bao giờ đặc như người thật; hàm này là nguồn duy
     nhất cho cả lớp vẽ lẫn cầu kiểm chứng nên hai bên không lệch nhau. */
  function tlProjectionAlpha() {
    var a = 0.66 + 0.13 * Math.sin(tNow / 115) + 0.04 * Math.sin(tNow / 41);
    return Math.max(0.5, Math.min(0.82, a));
  }
  function tlAnnounceSkill(round) {
    var f = tlFight; if (!f) return;
    var sk = TL_SKILLS[round]; if (!sk) return;
    f.skillName = sk.name; f.skillTelegraph = sk.telegraph;
    if (f.skillsUsed.indexOf(sk.name) < 0) f.skillsUsed.push(sk.name);
    tlLastSkills = f.skillsUsed.slice();
    var fc = tlFigCenter();
    addDmgFloat(fc.x, fc.y - 62, sk.name + '!', sk.color, { size: 18, life: 1.5, targetKey: 'tlfig' });
    if (!SET || SET.current.fxRings) rings.push({ x: fc.x, y: fc.y, r: 8, a: 0.9 });
    tlSkillSfx(round);
  }
  var TL_FIG_HOME = { x: 20 * TILE, y: 10 * TILE };
  var TL_DIRV = { down: [0, 1], up: [0, -1], left: [-1, 0], right: [1, 0], 'down-left': [-1, 1], 'down-right': [1, 1], 'up-left': [-1, -1], 'up-right': [1, -1] };
  function tlSub(text, dur) {
    var el = $('tl-sub');
    if (el) {
      if (!text) el.classList.add('hidden');
      else { el.textContent = substDlgName(text); el.classList.remove('hidden'); }
    }
    tlSubT = text ? (dur || 2) : 0;
    if (text) playVoiceFor({ who: 'narrate', text: text });
  }
  function startTlFight() {
    state.flags.tlRound = 1; state.flags.tlHits = 0;
    tlLastSkills = [];
    tlFight = { round: 1, phase: 'sub1', t: 0, bandX: 0, waves: [], blocked: 0, lunges: 0, roundHit: false, judged: false,
      skillsUsed: [], skillName: '', skillTelegraph: 0,
      fig: { x: TL_FIG_HOME.x, y: TL_FIG_HOME.y, dir: 'left', vx: 0, vy: 0, tx: 0, ty: 0, lunging: false, walkT: 0, isProjection: true } };
    tlSwordHeld = false; tlDashCd = 0;
    // Hình chiếu TỤ LẠI giữa đài: cột sáng mảnh + vòng sáng + hạt sáng
    // lam và tiếng hiện hình riêng — người chơi thấy rõ đối thủ là bóng
    // chiếu phát sáng, không phải người thật đứng sẵn.
    var fcc = tlFigCenter();
    spawnPillar(fcc.x, fcc.y + 20, { dur: 1.1, h: 108 });
    if (!SET || SET.current.fxRings) rings.push({ x: fcc.x, y: fcc.y, r: 6, a: 0.9 });
    spawnParts(fcc.x, fcc.y, 10, '170,225,255', 26, true);
    sfxTlManifest();
    tlShowRoundLine(0);
  }
  function tlShowRoundLine(step) {
    var f = tlFight; if (!f) return;
    var lines = ST['SCENE_TL' + f.round];
    tlSub(lines[step].text, step === 0 ? 2.6 : 2.0);
  }
  function tlFigCenter() { var f = tlFight.fig; return { x: f.x + 16, y: f.y + 16 }; }
  function tlHitPlayer(pct) {
    state.hp = Math.max(1, state.hp - Math.max(1, Math.round((state.hpMax || 100) * pct)));
    playerHurtT = 0.07; hurtT = 0.33; hitStop(0.07); shakeWorld(0.35);
    sfxHurt();
    spawnParts(px + 16, py + 6, 8, '255,90,70', 40, false);
    refreshHUD();
  }
  function tlRoundResolve() {
    var f = tlFight; if (!f) return;
    if (f.roundHit) state.flags.tlHits = (state.flags.tlHits || 0) + 1;
    tlSub(TL_LINES[f.round][f.roundHit ? 'hit' : 'miss'], 2.2);
    f.phase = 'resolve'; f.t = 0;
    state.flags.tlRound = f.round + 1;
    refreshHUD();
  }
  function tlFinishFight() {
    var hits = state.flags.tlHits || 0;
    tlFight = null; tlSub(null); stopVoice();
    state.flags.tlRound = 0;
    var winScene = hits >= 3 ? ST.SCENE_TL_WIN : ST.SCENE_TL_WIN_HARD;
    say(winScene, function () {
      say(ST.SCENE_TL_LIEU, function () {
        var cap = L.REALMS[state.realm].tuviNext;
        if (cap) state.tuvi = cap;
        state.soulPower = (state.soulPower || 0) + 30;
        var mt = L.addSectMerit(state, 20);
        state.quest = 'q7_hoa_huong_than';
        refreshHUD(); saveNow();
        toast('Thăng Long Đạo: đã thắng hình chiếu. +20 điểm cống hiến tông môn (tổng: ' + L.fmtNum(mt) + ').', 4200);
      });
    });
  }
  function tlVoiceReset() {
    if (!tlFight) return;
    tlFight = null; tlSub(null); stopVoice();
    say(ST.SCENE_TL_VOICE, function () {
      state.flags.tlRound = 0; state.flags.tlHits = 0;
      refreshHUD(); saveNow();
    });
  }
  function tlDash() {
    if (!tlFight || tlDashCd > 0) return;
    var dx = 0, dy = 0;
    if (keys['arrowleft'] || keys['a']) dx = -1; else if (keys['arrowright'] || keys['d']) dx = 1;
    else if (keys['arrowup'] || keys['w']) dy = -1; else if (keys['arrowdown'] || keys['s']) dy = 1;
    else { var dv = TL_DIRV[player.dir] || [0, 1]; dx = dv[0]; dy = dv[1]; }
    if (dx) player.dir = dx < 0 ? 'left' : 'right'; else if (dy) player.dir = dy < 0 ? 'up' : 'down';
    var sx = dx * 8, sy = dy * 8, moved = false;
    for (var i = 0; i < 8; i++) {
      if (sx && canStandAt(px + sx, py)) { px += sx; moved = true; }
      if (sy && canStandAt(px, py + sy)) { py += sy; moved = true; }
    }
    if (moved) { tlDashCd = 1.1; sfxWind(); spawnParts(px + 16, py + 24, 6, '190,235,200', 26, false); }
  }
  function tlSwordPress() {
    var f = tlFight; if (!f) return;
    if (f.phase !== 'lunge' || f.judged) return;
    var fc = tlFigCenter(), pcx = px + 16, pcy = py + 16;
    var d = Math.sqrt((fc.x - pcx) * (fc.x - pcx) + (fc.y - pcy) * (fc.y - pcy));
    if (d > 62) return; // ngoài tầm đối chém: cái bấm chỉ là vung kiếm vào không khí, không tính một lần xuất chiêu
    var rs = L.castSword(state);
    if (!rs.ok) { toast(rs.reason); return; }
    if (d <= 62) {
      f.judged = true; f.roundHit = true;
      f.fig.lunging = false;
      sfxSword();
      spawnStreak((fc.x + pcx) / 2, (fc.y + pcy) / 2, Math.atan2(fc.y - pcy, fc.x - pcx), '255,240,180', true);
      spawnPillar(fc.x, fc.y + 20, { dur: 0.8, h: 100 });
      hitStop(0.12); shakeWorld(0.35);
      addFloat(fc.x, fc.y - 40, 'ĐỐI CHÉM!', '255,240,180');
      tlRoundResolve();
    }
  }
  function updateTlFight(dt) {
    var f = tlFight; if (!f) return;
    if (tlSubT > 0) { tlSubT -= dt; if (tlSubT <= 0) tlSub(null); }
    if (tlDashCd > 0) tlDashCd -= dt;
    if (tlSwordHeldUntil && tNow > tlSwordHeldUntil) { tlSwordHeld = false; tlSwordHeldUntil = 0; }
    // Rời đài giữa ải: dừng thử thách (chạm bia để bắt đầu lại, cờ do
    // startThangLong đặt lại như luật làm lại của đài).
    var ptl = playerTile();
    if (ptl.x < 4 || ptl.x > 30 || ptl.y < 3 || ptl.y > 17) {
      tlFight = null; tlSub(null);
      toast('Ngươi đã rời đài — thử thách dừng lại. Chạm bia Đài Thăng Long để bắt đầu lại.');
      return;
    }
    var fig = f.fig, fc = tlFigCenter(), pcx = px + 16, pcy = py + 16;
    if (!fig.lunging && f.phase !== 'charge') {
      var hx = TL_FIG_HOME.x - fig.x, hy = TL_FIG_HOME.y - fig.y, hd = Math.sqrt(hx * hx + hy * hy);
      if (hd > 3) { var hs = Math.min(hd, 95 * dt); fig.x += hx / hd * hs; fig.y += hy / hd * hs; fig.walkT += dt; }
      fig.dir = pcx < fc.x ? 'left' : 'right';
    }
    f.t += dt;
    if (f.phase === 'sub1' && f.t >= 2.6) {
      f.phase = 'sub2'; f.t = 0; tlShowRoundLine(1);
      if (f.round === 1) { f.bandX = pcx; tlAnnounceSkill(1); } // đường chém khóa theo vị trí người chơi lúc chiêu thành hình + BÁO TÊN CHIÊU (báo trước 2,0s)
      if (f.round === 3) spawnPillar(fc.x, fc.y + 20, { dur: 2.0, h: 118, top: 'purple' });
    } else if (f.phase === 'sub2' && f.t >= 2.0) {
      f.t = 0;
      if (f.round === 1) {
        // KIẾM QUANG CHÉM XUỐNG: xét theo khoảng cách tới đường chém.
        sfxSword(); sfxChan();
        spawnStreak(f.bandX, 8 * TILE, Math.PI / 2, '255,244,200', true);
        spawnParts(f.bandX, pcy, 12, '255,244,200', 60, false);
        spawnParts(f.bandX, pcy - 8, 5, '255,190,90', 52, false); // tia lửa vàng ở điểm chém đáp xuống (ngôn ngữ mẫu Xianxia, Mục E)
        spawnPetals(f.bandX, pcy - 24, 3); // cánh hoa bị kiếm phong cuốn lên (ngôn ngữ mẫu Xianxia, Mục E)
        shakeWorld(0.35); hitStop(0.08);
        if (Math.abs(pcx - f.bandX) < 30) { tlHitPlayer(0.12); f.roundHit = false; }
        else { f.roundHit = true; spawnParts(pcx, pcy - 10, 8, '190,235,200', 40, true); addFloat(pcx, pcy - 34, 'LÁCH SƯỜN!', '190,235,200'); }
        tlRoundResolve();
      } else if (f.round === 2) {
        f.phase = 'rain'; f.t = 0; f.waves = [];
        for (var wi = 0; wi < 5; wi++) f.waves.push({ at: 1.0 + wi * 0.9, tx: 0, ty: 0, locked: false, done: false });
        f.blocked = 0;
        tlAnnounceSkill(2); // BÁO TÊN CHIÊU khi mưa kiếm bắt đầu thành hình — mỗi đợt còn khóa trước 0,55s
      } else {
        f.phase = 'charge'; f.t = 0; sfxBell();
        tlAnnounceSkill(3); // BÁO TÊN CHIÊU ở đầu pha tụ lực — 1,6s trước khi hình chiếu lao tới
      }
    } else if (f.phase === 'rain') {
      for (var wj = 0; wj < f.waves.length; wj++) {
        var wv = f.waves[wj];
        if (!wv.locked && f.t >= wv.at - 0.55) { wv.locked = true; wv.tx = pcx; wv.ty = pcy; }
        if (!wv.done && f.t >= wv.at) {
          wv.done = true;
          // Mỗi đợt mưa kiếm là một ĐƯỜNG ĐẠN kiếm khí rơi thật xuống
          // vòng khóa (Mục E): vệt kiếm quang dọc + tia lửa tại điểm đáp.
          spawnStreak(wv.tx, wv.ty - 14, Math.PI / 2, '170,220,255', false);
          spawnParts(wv.tx, wv.ty, 3, '255,190,90', 40, false);
          var inside = Math.sqrt((pcx - wv.tx) * (pcx - wv.tx) + (pcy - wv.ty) * (pcy - wv.ty)) < 36;
          if (!inside) { spawnParts(wv.tx, wv.ty, 6, '200,220,255', 46, false); }
          else if (tlSwordHeld) {
            f.blocked++;
            sfxSword(); spawnParts(pcx, pcy - 8, 7, '255,240,180', 44, true); shakeWorld(0.08);
          } else { tlHitPlayer(0.07); }
        }
      }
      if (f.t >= 5.6) { f.roundHit = f.blocked >= 4; tlRoundResolve(); }
    } else if (f.phase === 'charge' && f.t >= 1.6) {
      // HÌNH CHIẾU LAO TỚI: một kiếm thẳng toàn lực xuyên qua vị trí
      // người chơi, vượt thêm ba ô rồi dừng.
      f.phase = 'lunge'; f.t = 0; f.judged = false;
      var dxL = pcx - fc.x, dyL = pcy - fc.y, dL = Math.sqrt(dxL * dxL + dyL * dyL) || 1;
      fig.vx = dxL / dL * 430; fig.vy = dyL / dL * 430;
      fig.tx = pcx + dxL / dL * 96; fig.ty = pcy + dyL / dL * 96;
      fig.lunging = true; sfxWind();
      if (!SET || SET.current.fxRings) rings.push({ x: fc.x, y: fc.y, r: 8, a: 0.85 }); // vòng sáng bùng ở điểm xuất phát cú lao toàn lực
      spawnParts(fc.x, fc.y, 6, '255,190,90', 44, false); // tia lửa vàng tung ở chân hình chiếu lúc lao (Mục E)
    } else if (f.phase === 'lunge') {
      fig.x += fig.vx * dt; fig.y += fig.vy * dt; fig.walkT += dt * 2;
      spawnParts(fig.x + 16, fig.y + 16, 1, '200,235,255', 8, false);
      var fc2 = tlFigCenter();
      var dc = Math.sqrt((fc2.x - pcx) * (fc2.x - pcx) + (fc2.y - pcy) * (fc2.y - pcy));
      var passed = (fig.vx > 0 && fig.x >= fig.tx) || (fig.vx < 0 && fig.x <= fig.tx) || (fig.vy > 0 && fig.y >= fig.ty) || (fig.vy < 0 && fig.y <= fig.ty);
      if (!f.judged && dc < 22) {
        f.judged = true; fig.lunging = false; f.roundHit = false;
        tlHitPlayer(0.15);
        tlRoundResolve();
      } else if (passed && !f.judged) {
        fig.lunging = false;
        f.lunges++;
        if (f.lunges < 2) { f.phase = 'charge'; f.t = 0; }
        else { f.judged = true; f.roundHit = false; tlRoundResolve(); }
      }
    } else if (f.phase === 'resolve' && f.t >= 2.2) {
      if (f.round >= 3) { tlFinishFight(); return; }
      f.round++; f.phase = 'sub1'; f.t = 0; f.roundHit = false; f.judged = false; f.blocked = 0;
      tlShowRoundLine(0);
    }
  }
  window.VSLC_TL = {
    active: function () { return !!tlFight; },
    round: function () { return tlFight ? tlFight.round : 0; },
    phase: function () { return tlFight ? tlFight.phase : ''; },
    bandX: function () { return tlFight ? tlFight.bandX : 0; },
    guarding: function () { return tlSwordHeld; },
    hits: function () { return state ? (state.flags.tlHits || 0) : 0; },
    /* Mục E (chỉ đọc): trạng thái hình chiếu + kỹ năng của hình chiếu. */
    isProjection: function () { return tlFight ? !!tlFight.fig.isProjection : false; },
    opacity: function () { return tlFight ? tlProjectionAlpha() : 0; },
    fig: function () { return tlFight ? { x: Math.round(tlFight.fig.x), y: Math.round(tlFight.fig.y), dir: tlFight.fig.dir, lunging: !!tlFight.fig.lunging } : null; },
    skill: function () { return tlFight && tlFight.skillName ? { name: tlFight.skillName, round: tlFight.round, telegraph: tlFight.skillTelegraph, phase: tlFight.phase } : null; },
    skillsUsed: function () { return (tlFight ? tlFight.skillsUsed : tlLastSkills).slice(); },
    skillDefs: function () { var o = {}; for (var k in TL_SKILLS) o[k] = { name: TL_SKILLS[k].name, telegraph: TL_SKILLS[k].telegraph, dmgPct: TL_SKILLS[k].dmgPct }; return o; }
  };

  function encCastWord(skill) {
    var m = enc.mon;
    if (state.flags && (state.flags.arcResLocked || state.flags.ch15ResonanceLock)) { toast('Vòng nhiễu loạn sóng khóa chặt cộng hưởng — sóng không tới được. Đã học bậc Hưởng cũng vô dụng ở đây; dùng kiếm quyết và công pháp!'); return; } // ARCIV ch.15/23: cộng hưởng bị khóa theo trạng thái cảnh (cờ do worker dữ liệu đặt)
    if (!encTargetInRange(3.2)) {
      // Ngoài tầm khóa 3,2 ô (3.4): sóng chạy nửa đường rồi tan + lời
      // nhắn mới. Thuần trình bày — điều kiện tầm không đổi.
      var pcFar = { x: px + 16, y: py + 16 };
      spawnResWave(pcFar.x, pcFar.y, m.x + 16, m.y + 16, 0.5, resTierFor(state.silence));
      toast('Quái còn xa — sóng chưa khóa tới được.');
      return;
    }
    // Trần mỗi trận của LỆNH (đúng thiết kế phần 3): ĐỊNH tối đa 2 lần,
    // PHONG tối đa 1 lần trong một trận.
    if (skill === 'dinh' && enc.usedDinh >= 2) { toast('Trận này đã dùng Định Âm hai lần — uy lực hưởng cần khoảng lặng dài mới tụ lại được.'); return; }
    if (skill === 'phong' && enc.usedPhong >= 1) { toast('Trận này đã dùng Phong Âm một lần — ấn hưởng không thể chồng thêm ấn.'); return; }
    faceMonster(m);
    var silenceBefore = state.silence; // nấc trình diễn tính theo Tĩnh Âm TRƯỚC khi ra đòn (3.3)
    var r = L.castWord(state, skill);
    if (!r.ok) { toast(r.reason); return; }
    startResBody(false); // bộ PHÁP: khung phóng quyết (cột 6) khóa tại thời điểm áp hiệu ứng dưới đây
    var wf = WORD_FLOAT[skill];
    var baseF = resBaseFreqForMonster(m); // âm gốc của mục tiêu cho nốt khóa sóng (3.6)
    if (skill === 'pha') {
      castResonanceFx('pha', m.x + 16, m.y + 30, { silenceBefore: silenceBefore, baseFreq: baseF, target: m });
      addDmgFloat(m.x + 16, m.y - 12, wf[0], wf[1], { size: 22, life: 0.8 });
      applyHitToMonster(m, r.power, { kind: 'word', skill: 'pha' });
    } else if (skill === 'chan') {
      castResonanceFx('chan', m.x + 16, m.y + 30, { silenceBefore: silenceBefore, baseFreq: baseF, target: m });
      addDmgFloat(m.x + 16, m.y - 12, wf[0], wf[1], { size: 22, life: 0.8 });
      applyHitToMonster(m, r.power, { kind: 'word', skill: 'chan' });
    } else if (skill === 'dinh') {
      // ĐỊNH: giữ nhịp — quái đứng yên trọn một chu kỳ tấn công của nó.
      enc.usedDinh++;
      state.flags.lenUsedDinh = (state.flags.lenUsedDinh || 0) + 1;
      m.holdT = m.atkInterval;
      state.flags.lenDinhHold = 1;
      spawnPillar(m.x + 16, m.y + 30, { top: 'purple', dur: 0.85, h: 105 }); // cột ĐỊNH: vòng tím trên đỉnh (gói phụ 10)
      castResonanceFx('dinh', m.x + 16, m.y + 30, { silenceBefore: silenceBefore, baseFreq: baseF, target: m }); // chuông đứng yên + lớp sfxBell khẽ bên trong sfxResDinh
      addDmgFloat(m.x + 16, m.y - 12, wf[0], wf[1], { size: 22, life: 0.9 });
    } else if (skill === 'phong') {
      // PHONG: phong ấn hai chu kỳ tấn công + uy lực lời đánh thẳng vào quái.
      // ARCIV: mắt trận trong tầm được phong ấn NGAY GIỮA TRẬN (ch.14 đường b / ch.15 / ch.16 mắt phụ).
      arcEyes.forEach(function (e) { if (!e.sealed && Math.hypot(e.x - (px + 16), e.y - (py + 16)) <= 3.2 * TILE) arcSealEye(e); });
      enc.usedPhong++;
      state.flags.lenUsedPhong = (state.flags.lenUsedPhong || 0) + 1;
      m.sealT = m.atkInterval * 2;
      m.sealDur = m.sealT; // mốc để ấn PHONG khép xuống khóa trong giây đầu ở khâu vẽ
      state.flags.lenPhongSeal = 2;
      spawnPillar(m.x + 16, m.y + 30, { dur: 0.9, h: 112 }); // cột PHONG: vàng, hai lá bùa khép hai bên quái (gói phụ 10)
      castResonanceFx('phong', m.x + 16, m.y + 30, { silenceBefore: silenceBefore, baseFreq: baseF, target: m });
      addDmgFloat(m.x + 16, m.y - 12, wf[0], wf[1], { size: 22, life: 0.9 });
      applyHitToMonster(m, r.power, { kind: 'word', skill: 'phong' });
    }
    // Móc Kiếm Trủng: đòn cộng hưởng thành công đầu tiên trong bí cảnh này, trước
    // khi cửa mở, thì cửa mở ngay theo đường đối hưởng.
    if (r.ok && bcSession && bcSession.realm === 'bc_kiemtrung' && !bcSession.speechUsed && !L.isSessionHidden('bc_kiemtrung', 'cua_mo_that')) {
      bcSession.speechUsed = true;
      L.recordSpeech(state, L.chapterOfQuest(state), 'bicanh_kiemtrung', []);
      L.hideSessionProp('bc_kiemtrung', 'cua_mo_that');
      /* SỬA LỖI do làn G phát hiện (mục 53-DEFECT-KIEMTRUNG): footprint
         của tinh_mac_tran (22–25, hàng y=9) lấp kín khe duy nhất của
         vách y=9, nên chỉ ẩn cửa thì phòng boss vẫn không vào được.
         Trấn tan thì cả trấn lẫn cửa đều phải mở. */
      L.hideSessionProp('bc_kiemtrung', 'tinh_mac_tran');
      sfxSealBreak(220);
      say([{ who: 'narrate', text: BC_SUCCESS_LINES.wordDoor }]);
    }
    refreshHUD(); saveNow();
  }
  function applyHitToMonster(m, power, opts) {
    opts = opts || {};
    if (!enc || m.state !== 'alive') return;
    // Boss tổ đội đang PHONG ẤN: bất tử — không trừ máu, chỉ báo trạng
    // thái (tối đa 1 lần/0,8s theo đồng hồ trận của boss).
    if (m.partyBoss && m.partyBoss.phase === 'hold') {
      if (m.partyBoss.t - (m.partyBoss.sealFloatT || -9) >= 0.8) {
        m.partyBoss.sealFloatT = m.partyBoss.t;
        addFloat(m.x + 16, m.y - 30, 'ĐANG PHONG ẤN', '216,180,255');
      }
      return;
    }
    var crit = enc.critRng() < CRIT_CHANCE;
    var dmg = crit ? Math.round(power * CRIT_MULT) : power;
    if (opts.kind === 'word' && m.def && m.def.wordResist) dmg = Math.max(1, Math.round(dmg * m.def.wordResist)); // kháng Ngôn Linh: chỉ kiem_y_tan_hon 0.5
    if (opts.kind === 'sword') { // ARCIV: trình diễn theo chiêu + thang P tại đúng t=0 áp sát thương
      var sang = Math.atan2((m.y + 16) - (py + 16), (m.x + 16) - (px + 16)) + (Math.random() - 0.5) * 0.7;
      presentSwordHit(m.x + 16, m.y + 20, sang, opts.move || 'tram', crit, opts.hitIdx || 0);
    }
    m.hp = Math.max(0, m.hp - dmg);
    if (state) L.recordPlayValue(state, 'maxHit', dmg); // kỷ lục đòn mạnh nhất (đợt mở rộng bảng nhân vật): applyHitToMonster là phễu áp sát thương trung tâm của làn chạm trán
    // Phản ứng của quái (GF-02): nhấp nháy trắng theo hạng, đẩy lùi thuần
    // trình bày (không đổi ô logic), boss không bị đẩy mà rung thân.
    m.flashT = crit ? (m.rank === 'normal' ? 0.11 : 0.14) : (m.rank === 'normal' ? 0.07 : 0.11);
    if (opts.kind === 'word') m.resVibT = crit ? 0.25 : 0.2; // rung chấn mục tiêu khi trúng đòn cộng hưởng: 0,15–0,25s (3.5)
    var dx = (m.x + 16) - (px + 16), dy = (m.y + 16) - (py + 16), len = Math.hypot(dx, dy) || 1;
    if (m.rank === 'boss') m.shakeT = opts.kind === 'word' ? 0.12 : 0.08;
    else {
      var kb = m.rank === 'elite' ? 3 : 6;
      if (crit) kb *= 1.7;
      if (opts.kind === 'word') kb = m.rank === 'elite' ? 7 : 14;
      m.kbx = dx / len * kb; m.kby = dy / len * kb; m.kbT = 0.12; // đàn hồi về trong 120ms ở khâu vẽ
    }
    if (crit) { hitStop(0.06); shakeWorld(0.12); }
    else if (opts.kind === 'word') {
      shakeWorld(opts.skill === 'phong' ? 0.12 : 0.35); // rung màn theo bảng khóa 3.5 qua cổng fxShake (Định không tới nhánh gây sát thương này)
      if (m.hp > 0) hitStop(0.08); // dừng hình cộng hưởng trúng chưa kết liễu (GF-03; hitStop tự khóa 1 lần/300ms)
    }
    // Số sát thương bốn hạng (GF-01, nâng đọc rõ ở bước 2 mục 8 theo ghi
    // chú Bui chơi live): kiếm lục nhạt 18px; chí mạng vàng ấm 24px kèm
    // "!" và hiệu ứng phóng; cộng hưởng 25px theo màu chiêu, số hiện sau
    // chữ chiêu 90ms; mọi số có viền tối tương phản ở khâu vẽ floats.
    var isWord = opts.kind === 'word';
    var col = isWord ? (WORD_FLOAT[opts.skill] || [])[1] || '255,235,170' : '190,235,200';
    if (crit) col = '255,205,84';
    addDmgFloat(m.x + 16, m.y - 6, '-' + dmg + (crit ? '!' : ''), col,
      { size: crit ? 24 : (isWord ? 25 : 18), pop: crit, delay: isWord ? 0.09 : 0, targetKey: 'mon:' + m.species + ':' + m.lairX + ':' + m.lairY });
    // Tiếng chạm đích phát ĐÚNG khung áp sát thương (đợt walk2 giai
    // đoạn hai — lệnh Bui 11:49: tiếng trúng khớp khung trúng, không
    // sớm không muộn; bản cũ trễ 30ms sau số sát thương). Biến thể cao
    // độ xoay vòng giữ nguyên.
    var variant = nextHitVariant();
    if (opts.kind === 'sword') sfxHitBlade(variant); else sfxHitBeast(variant);
    if (crit) sfxCrit();
    if (m.cryT <= 0) { m.cryT = 0.3; sfxMonsterCry(m.species, false); }
    if (m.bossId) updateBossBar(m);
    if (m.hp <= 0) killMonster(m, opts);
  }
  function killMonster(m, killOpts) {
    // Boss bí cảnh: nhánh TRƯỚC nhánh bossId (boss bí cảnh không có bossId).
    if (m.bcBoss) {
      var bcr = bcBossKillRewards(m);
      if (bcr === 'bag_full') {
        m.hp = Math.max(1, Math.round(m.hpMax * 0.05));
        updateBossBar(m);
        return;
      }
    }
    // Boss: phải qua cửa trả thưởng TRƯỚC khi tính là hạ — túi đầy thì
    // chu kỳ không bị tiêu, boss gượng dậy với 5% máu và trận còn tiếp.
    if (m.bossId) {
      var br = bossKillRewards(m);
      if (br === 'bag_full') {
        m.hp = Math.max(1, Math.round(m.hpMax * 0.05));
        if (m.bossId) updateBossBar(m);
        return;
      }
    }
    m.state = 'dying'; m.deathT = 0; m.holdT = 0; m.sealT = 0;
    // Bộ đếm thống kê chơi (đợt bảng nhân vật 2026-11-06): đếm tại đây —
    // SAU hai cửa túi-đầy ở trên nên boss gượng dậy chưa tính là đã hạ.
    // Mọi đường hạ quái (chạm trán, bí cảnh, boss dã ngoại) đều qua hàm này.
    if (state) {
      L.recordPlayStat(state, 'kills');
      if (m.rank === 'elite') L.recordPlayStat(state, 'elites');
      if (m.rank === 'boss' || m.bossId || m.bcBoss) L.recordPlayStat(state, 'bosses');
      // Sổ hành trình (đợt mở rộng bảng nhân vật): cùng điểm, cùng điều
      // kiện với bộ đếm boss ở trên — boss gượng dậy vì túi đầy chưa
      // tới được đây nên không ghi nhầm.
      if (m.rank === 'boss' || m.bossId || m.bcBoss) L.journalAdd(state, 'boss', 'Hạ boss ' + (m.name || m.species));
    }
    if (killOpts && killOpts.kind === 'word' && killOpts.skill === 'pha') {
      m.resShatter = true; // vỡ vụn cộng hưởng thay khung mờ dần (bước 2 mục 4) — drawMonster vẽ mảnh thay thân
      spawnResParts(m.x + 16, m.y + 16, 11, 3, 'pha'); // 8–12 mảnh hạt sóng cộng hưởng đi kèm
    }
    spawnSmoke(m.x + 16, m.y + 12, 3); // khói lam xám khi quái gục (gói phụ 10)
    if (m.rank === 'boss' && state.map === 'hb_valley') spawnPetals(m.x + 16, m.y, 8); // boss thung lũng anh đào (gói phụ 10)
    if (m.rank === 'boss') { hitStop(0.16); shakeWorld(0.6); bossPillar = { x: m.x + 16, y: m.y + 16, t: 0.9 }; }
    else if (m.rank === 'elite') { hitStop(0.12); shakeWorld(0.35); }
    else if (killOpts.kind === 'word' && killOpts.skill === 'pha') { hitStop(0.09); shakeWorld(0.6); }
    else hitStop(0.09);
    sfxMonsterCry(m.species, true);
    sfxKill();
    spawnParts(m.x + 16, m.y + 20, m.rank === 'normal' ? 10 : 16, MON_PARTS[m.species] || '200,200,200', 30, false);
    if (m.rank !== 'normal' && (!SET || SET.current.fxRings)) rings.push({ x: m.x + 16, y: m.y + 16, r: 6, a: 0.8 });
    comboN++; comboT = 6; updateComboBox();
    if (huntSession && !m.bcRealm) huntSession.kills[m.rank]++; // quái bí cảnh không tính vào phiên săn dã ngoại
    if (!m.bossId && !m.bcBoss) normalKillDrops(m); // boss bí cảnh không rơi qua đường thường (thưởng riêng trong bcBossKillRewards)
    grindHuntCredit(m);
    if (m.bcRealm) bcCheckWave(m);
    if (enc && enc.mon === m) endEncounterCleanup();
    m.respawnT = 20; // quái thường hồi ổ sau 20 giây (bộ nhớ phiên); boss hồi theo chu kỳ ngày
    refreshHUD(); saveNow();
  }
  /* Loài quái THÚ rơi Thịt Thú Rừng khi hạ ở dã ngoại (đợt đồ ăn
     2026-11-04) — khớp MONSTER_DEFS: sói/xà/trư/ưng dã ngoại + lang
     nhiễm sông ở thung lũng. Quái người, hồn, tượng đá, cơ quan: không. */
  var FOOD_BEAST_SPECIES = { son_lang: 1, doc_vu_xa: 1, thiet_giap_tru: 1, phong_ung: 1, lang_nhiem_song: 1 };
  function normalKillDrops(m) {
    var z = L.HUNT_ZONES[m.zoneId];
    var lvl = z ? z.yeuDanLevel : 1;
    /* Tu vi theo mạng cho quái DÃ NGOẠI (quyết định của Bui 16:36 ngày
       2026-11-02, thay luật cũ "ngoài phiếu trả 0 tu vi"): qua cửa trả
       thưởng duy nhất grantReward với hồ sơ profile:kill:normal (2%
       tuviNext) / profile:kill:elite (5%), chảy qua bể trần mềm tu
       vi/ngày. Quái bí cảnh (m.bcRealm) KHÔNG qua đây — đã có thưởng
       đợt 5%/đợt, tránh trả trùng; boss không chạy hàm này. Số trả
       thật (sau trần mềm + kẹp trần thanh) cộng vào tổng kết phiên. */
    if (!m.bcRealm && m.zoneId && (m.rank === 'normal' || m.rank === 'elite')) {
      var kr = L.grantReward(state, m.rank === 'elite' ? 'profile:kill:elite' : 'profile:kill:normal', { sourceId: 'kill:' + m.species });
      if (kr.ok && kr.granted.tuvi > 0) {
        if (huntSession) huntSession.tuvi += kr.granted.tuvi;
        /* Số tu vi nổi NGAY tại quái lúc hạ (vá đợt 2026-11-02, Mục A):
           trước đây khoản trả chỉ hiện qua tinh bay về người chơi ~0,55s
           sau, còn HUD vẽ Math.floor(state.tuvi) nên khoản lẻ sau trần
           mềm (vd +0,5 ở bậc trên 2B) vô hình hoàn toàn — người chơi
           thấy tu vi "đứng nguyên" dù grantReward đã cộng thật vào
           state. Nay hiện ngay số THẬT sau trần mềm bằng fmtAmt (giữ
           phần lẻ) tại vị trí quái, xếp chồng trên số sát thương theo
           cùng targetKey; khoản sau trần bằng 0 thì không hiện (nhánh
           này chỉ chạy khi granted.tuvi > 0). */
        addDmgFloat(m.x + 16, m.y - 6, '+' + fmtAmt(kr.granted.tuvi) + ' tu vi', '140,235,190',
          { size: 15, targetKey: 'mon:' + m.species + ':' + m.lairX + ':' + m.lairY });
        spawnOrbs(m.rank === 'elite' ? 5 : 3, m.x + 16, m.y + 16, kr.granted.tuvi);
      }
    }
    var chance = m.rank === 'elite' ? L.YEU_DAN_DROP_ELITE : L.YEU_DAN_DROP_NORMAL;
    // Rút theo id phiên: nạp lại giữa phiên không quay lại được kết quả khác.
    if (L.yeuDanDropFor(enc.sessionId, chance)) spawnDrop('yeu_dan_' + lvl, 1, m.x + 16, m.y + 16);
    if (m.def.biTich && L.rollSessionValue(enc.sessionId, ':bitich') < m.def.biTichChance) spawnDrop(m.def.biTich, 1, m.x + 16, m.y + 16);
    /* Thịt Thú Rừng (đợt đồ ăn 2026-11-04): quái THÚ dã ngoại rơi
       nguyên liệu nấu Thịt Thú Nướng Que và Canh Bổ Khí — tinh anh rơi
       chắc chắn, quái thường 40% theo rút phiên ':thit' (nạp lại giữa
       phiên không quay lại được). Quái người/hồn/cơ quan không rơi
       thịt. Cùng đường nhặt spawnDrop như yêu đan/bí tịch. */
    if (FOOD_BEAST_SPECIES[m.species] && (m.rank === 'elite' || L.rollSessionValue(enc.sessionId, ':thit') < 0.4)) {
      spawnDrop('thit_thu', 1, m.x + 16, m.y + 16);
    }
  }
  function bossKillRewards(m) {
    var bd = L.BOSS_DEFS[m.bossId];
    var st = L.bossStatus(state, m.bossId);
    var beforeLt = L.linhBalance(state);
    var r = L.grantReward(state, bd.profileId, { claimKey: L.bossClaimKey(m.bossId, st.cycleId), sourceId: m.bossId, boss: true });
    if (!r.ok) {
      if (r.reason === 'bag_full') {
        toast('Túi đã đầy — ' + bd.name + ' chưa gục hẳn đã gượng dậy. Hãy dọn túi rồi quay lại đánh tiếp; chu kỳ này chưa bị tính là đã hạ.', 5200);
        return 'bag_full';
      }
      return 'claimed'; // duplicate: khóa chu kỳ đã ghi — coi như đã hạ
    }
    if (state.grind.boss) state.grind.boss[m.bossId] = { lastClaimCycle: st.cycleId };
    if (huntSession) {
      huntSession.tuvi += r.granted.tuvi;
      huntSession.lt += L.linhBalance(state) - beforeLt;
      for (var id in r.granted.items) huntSession.items[id] = (huntSession.items[id] || 0) + r.granted.items[id];
    }
    if (r.granted.tuvi > 0) spawnOrbs(9, m.x + 16, m.y + 16, r.granted.tuvi);
    if (bd.biTich) spawnDrop(bd.biTich, 1, m.x + 16, m.y + 16);
    var parts = [];
    if (r.granted.lt > 0) parts.push('+' + fmtAmt(r.granted.lt) + ' Linh Thạch');
    if (r.granted.merit > 0) parts.push('+' + fmtAmt(r.granted.merit) + ' cống hiến');
    for (var id2 in r.granted.items) parts.push((L.ITEM_DEFS[id2] ? L.ITEM_DEFS[id2].name : id2) + ' ×' + r.granted.items[id2]);
    toast('Hạ ' + bd.name + '! ' + parts.join(' · '), 5200);
    // Pháp bảo rơi từ boss dã ngoại (đợt pháp bảo 2026-11-06): phẩm
    // theo dải cảnh giới của boss (minOrdinal), rút theo khóa claim
    // chu kỳ — cùng khóa luôn cùng kết quả; rơi xuống đất như bí tịch.
    var pbWild = L.rollTreasureDrop(L.bossClaimKey(m.bossId, st.cycleId), L.treasureGradeForOrdinal(bd.minOrdinal || 0));
    if (pbWild) {
      spawnDrop(pbWild, 1, m.x + 16, m.y + 16);
      toast('Pháp bảo rơi từ ' + bd.name + ': ' + L.ITEM_DEFS[pbWild].name + ' — hãy nhặt lấy!', 5200);
    }
    // ARCIV A.3: Hộ Trận Kiếm Linh — mảnh ô 26 + trưởng lão dạy ô 19
    // (số lần thắng boss Kim Đan đọc từ sổ claim trong logic).
    if (m.bossId === 'boss_hb_ho_tran_kiem_linh') arcIvBossFragmentToast('boss:ho_tran_kiem_linh');
    return 'claimed';
  }
  function bossPhaseOf(m) { return Math.max(1, Math.ceil(m.hp / m.hpMax * 4)); }

  /* ----- Băng rôn + thanh máu boss (phần tử ngoài canvas) ----- */
  function showBossBanner(m) {
    var bd = L.BOSS_DEFS[m.bossId], b = $('boss-banner');
    if (!bd || !b) return;
    $('boss-name').textContent = bd.name;
    $('boss-title').textContent = bd.title;
    $('boss-phase').textContent = 'Đợt ' + bossPhaseOf(m) + '/4';
    b.classList.remove('hidden', 'compact', 'fading');
    updateBossBar(m);
    clearTimeout(showBossBanner._h);
    showBossBanner._h = setTimeout(function () { b.classList.add('compact'); }, 2200);
  }
  function updateBossBar(m) {
    var f = $('boss-hp-fill');
    if (f) f.style.width = Math.max(0, m.hp / m.hpMax * 100) + '%';
    if (enc && enc.mon === m) {
      var ph = bossPhaseOf(m);
      if (enc.phase !== ph) {
        enc.phase = ph;
        var pe = $('boss-phase');
        if (pe) pe.textContent = 'Đợt ' + ph + '/4';
        if (f) { f.classList.add('phase-flash'); setTimeout(function () { f.classList.remove('phase-flash'); }, 220); }
        if (ph < 4) sfxRoar(true); // gầm ngắn khi chuyển đợt
      }
    }
  }
  function hideBossBanner() {
    var b = $('boss-banner');
    if (b) b.classList.add('hidden');
    clearTimeout(showBossBanner._h);
  }
  function setGhostBar() {
    var el = $('hud-hp-ghost');
    if (!el || !state) return;
    var pct = Math.round(Math.max(0, Math.min(100, ghostHp / state.hpMax * 100)));
    if (pct === ghostPctShown) return;
    ghostPctShown = pct;
    el.style.width = pct + '%';
  }
  function updateComboBox() {
    var el = $('combo-box');
    if (!el) return;
    if (comboN >= 3 && comboT > 0) {
      el.classList.remove('hidden');
      $('combo-n').textContent = String(comboN);
      el.classList.toggle('warn', comboT <= 2);
    } else el.classList.add('hidden');
  }

  /* ----- Vật phẩm rơi: nảy -> chờ -> bay về túi (GF-08) ----- */
  function isRareDrop(id) { var d = L.ITEM_DEFS[id]; return !!d && (id.indexOf('yeu_dan_') === 0 || id.indexOf('bi_tich_') === 0 || d.type === 'dan'); }
  function spawnDrop(itemId, n, wx, wy) {
    if (!L.ITEM_DEFS[itemId]) return;
    var waiting = drops.filter(function (d) { return d.phase !== 'fly'; });
    if (waiting.length >= 8) { waiting[0].phase = 'fly'; waiting[0].t = 0; } // quá 8 vật chờ: vật cũ nhất bay về ngay
    drops.push({ id: ++dropSeq, itemId: itemId, n: n, x: wx, y: wy, phase: 'bounce', t: 0, full: false });
    if (isRareDrop(itemId)) sfxDropRare();
  }
  function updateDrops(dt) {
    for (var i = drops.length - 1; i >= 0; i--) {
      var d = drops[i];
      d.t += dt;
      if (d.phase === 'bounce' && d.t >= 0.4) { d.phase = 'wait'; d.t = 0; }
      else if (d.phase === 'wait' && d.t >= 0.8) { d.phase = fxOn() ? 'fly' : 'arrive'; d.t = 0; }
      else if (d.phase === 'fly' && d.t >= 0.45) { arriveDrop(d); if (d.phase === 'done') drops.splice(i, 1); }
      else if (d.phase === 'arrive') { arriveDrop(d); if (d.phase === 'done') drops.splice(i, 1); }
      else if (d.phase === 'ground') {
        // Túi đã có chỗ + người chơi chạm vào vật: nhặt lại.
        if (Math.hypot(px + 16 - d.x, py + 16 - d.y) < 20 && L.bagCanAdd(state, d.itemId, d.n).ok) { d.phase = 'fly'; d.t = 0; d.full = false; }
      }
    }
  }
  function arriveDrop(d) {
    var r = L.bagAdd(state, d.itemId, d.n);
    if (r.ok) {
      d.phase = 'done';
      beep(880, 0.07, 'sine', 0.03, 'ui'); // tiếng "tích" khi vật về túi
      var bb = $('btn-bag');
      if (bb) { bb.classList.remove('bag-bounce'); void bb.offsetWidth; bb.classList.add('bag-bounce'); }
      var lb = $('drop-label');
      if (lb) {
        lb.textContent = (L.ITEM_DEFS[d.itemId] ? L.ITEM_DEFS[d.itemId].name : d.itemId) + (d.n > 1 ? ' ×' + d.n : '');
        lb.classList.remove('hidden');
        clearTimeout(arriveDrop._h);
        arriveDrop._h = setTimeout(function () { lb.classList.add('hidden'); }, 1200);
      }
      if (huntSession) huntSession.items[d.itemId] = (huntSession.items[d.itemId] || 0) + d.n;
      refreshHUD();
    } else {
      // Túi đầy: vật nằm lại trên đất với nhãn, không mất.
      d.phase = 'ground'; d.t = 0; d.full = true;
    }
  }

  /* ----- Tinh tu vi bay (GF-07) ----- */
  function spawnOrbs(count, wx, wy, tuviAmount) {
    if (!(tuviAmount > 0)) return;
    var batch = { id: ++orbBatchSeq, total: 0, arrived: 0, amount: tuviAmount, before: state.tuvi - tuviAmount };
    orbBatches[batch.id] = batch;
    if (!fxOn()) { // tắt hạt: bỏ quỹ đạo, giữ số "+N tu vi" + nốt cuối
      tuviArrival(batch);
      return;
    }
    for (var i = 0; i < count; i++) {
      if (orbs.length >= 12) break; // trần 12 viên đồng thời
      orbs.push({ batch: batch.id, idx: i, sx: wx, sy: wy, t: -i * 0.06 });
      batch.total++;
    }
    if (!batch.total) tuviArrival(batch);
  }
  function updateOrbs(dt) {
    for (var i = orbs.length - 1; i >= 0; i--) {
      var o = orbs[i];
      o.t += dt;
      if (o.t >= 0.55) {
        orbs.splice(i, 1);
        var b = orbBatches[o.batch];
        if (b) {
          beep(PENTA_NOTES[o.idx % PENTA_NOTES.length], 0.18, 'sine', 0.02, 'skill');
          b.arrived++;
          if (b.arrived >= b.total) { tuviArrival(b); delete orbBatches[o.batch]; }
        }
      }
    }
  }
  function tuviArrival(batch) {
    addDmgFloat(px + 16, py - 26, '+' + fmtAmt(batch.amount) + ' tu vi', '140,235,190', { size: 15, rise: 20 });
    var cap = L.REALMS[state.realm] && L.REALMS[state.realm].tuviNext;
    if (!cap) return;
    var fb = batch.before / cap, fa = state.tuvi / cap, flashed = false;
    [25, 50, 75].forEach(function (mk) { if (fb < mk / 100 && fa >= mk / 100) flashed = true; });
    if (fa >= 1 && fb < 1) {
      flashTuviBar();
      sfxBell();
      toast('Tu vi đã đầy tầng — khi sẵn sàng, hãy đột phá (phím B).', 3800);
    } else if (flashed) flashTuviBar();
  }
  function flashTuviBar() {
    var el = $('hud-tuvi-bar');
    if (!el || !el.parentNode) return;
    el.parentNode.classList.add('bar-flash');
    setTimeout(function () { el.parentNode.classList.remove('bar-flash'); }, 350);
  }

  /* ----- Tổng kết phiên săn (chỉ trong bộ nhớ, không ghi save) -----
     Cách ẩn (vá đợt 2026-11-02, Mục A): chạm vào bảng để đóng, hoặc tự
     ẩn sau 30 giây tuyệt đối trong vòng lặp chính — thời gian DI
     CHUYỂN không còn được tính (luật cũ 3 giây đi bộ / 12 giây tuyệt
     đối nuốt mất bảng trên đúng đường thoát phiên của người thật). */
  function maybeShowHuntSummary() {
    if (!huntSession) return;
    var k = huntSession.kills, s = huntSession;
    huntSession = null;
    if (!k.normal && !k.elite && !k.boss && !s.lt && !s.tuvi && !Object.keys(s.items).length) return;
    var el = $('hunt-summary');
    if (!el) return;
    var itemsTxt = Object.keys(s.items).map(function (id) { return (L.ITEM_DEFS[id] ? L.ITEM_DEFS[id].name : id) + ' ×' + s.items[id]; }).join(', ');
    el.innerHTML = '<span class="hs-title">Tổng kết phiên săn</span><br>' +
      'Quái hạ: ' + k.normal + ' thường · ' + k.elite + ' tinh anh · ' + k.boss + ' boss<br>' +
      'Tu vi +' + fmtAmt(s.tuvi) + ' · Linh Thạch +' + L.fmtNum(s.lt) +
      (itemsTxt ? '<br>Nhận: ' + itemsTxt : '');
    el.classList.remove('hidden');
    summaryShownAt = Date.now(); summaryMoveT = 0;
  }
  function hideHuntSummary() {
    var el = $('hunt-summary');
    if (el) el.classList.add('hidden');
    summaryShownAt = 0; summaryMoveT = 0;
  }

  /* ================= ĐỒ ĂN — LỚP TRÌNH DIỄN + ĐIỂM LẤY (đợt 2026-11-04) =================
     Số học nằm hết ở js/logic.js (buyFood/cookFood/eatFood/
     gatherFoodPatch); ở đây chỉ có điểm bán, điểm nấu, bãi hái, nút
     dùng nhanh và hiệu ứng. Nhịp chờ ăn TRONG TRẬN dùng đồng hồ phiên
     (foodCdUntil, mốc ms theo tNow) — ngoài trận không chờ. */
  var foodCdUntil = 0;
  function foodInCombat() {
    return !!(enc || duel || tlFight || hhtFight || arcFig || (atkFigs && atkFigs.length));
  }
  function foodBuyScene() {
    /* Hai món phàm tục rẻ luôn mua được bằng BẠC — tiền phàm tục của
       nguyên tác — kể cả khi ví Linh Thạch còn khóa (giai đoạn phàm
       nhân) hay đã mở mà Linh Thạch đã tiêu hết (đợt sửa lỗi nhiệm vụ
       nấu ăn 2026-11-05). Ví mở thì thêm hai lựa chọn giá Linh Thạch
       như trước; ví khóa thì TUYỆT ĐỐI không hiện giá Linh Thạch. */
    var opts = [];
    if (L.walletOpen(state)) {
      opts.push({ label: 'Cơm Nắm Lá Sen — 3 Linh Thạch (hồi 30 máu, 10 Tĩnh Âm)', action: 'food_buy_com_nam' });
      opts.push({ label: 'Bánh Hấp Nhân Thịt — 5 Linh Thạch (hồi 45 máu, 15 Tĩnh Âm)', action: 'food_buy_banh_hap' });
    }
    opts.push({ label: 'Cơm Nắm Lá Sen — 5 lượng bạc (hồi 30 máu, 10 Tĩnh Âm)', action: 'food_buy_com_nam_bac' });
    opts.push({ label: 'Bánh Hấp Nhân Thịt — 8 lượng bạc (hồi 45 máu, 15 Tĩnh Âm)', action: 'food_buy_banh_hap_bac' });
    opts.push({ label: 'Thôi, để khi khác', action: 'food_leave' });
    var head = L.walletOpen(state)
      ? 'Mua đồ ăn mang theo — ăn là hồi máu và Tĩnh Âm ngay (trả Linh Thạch hoặc bạc phàm tục, đang có ' + L.silverBalance(state) + ' lượng bạc):'
      : 'Mua đồ ăn mang theo — ăn là hồi máu và Tĩnh Âm ngay. Ngươi chưa tu tiên nên quán nhận bạc phàm tục (đang có ' + L.silverBalance(state) + ' lượng bạc):';
    return [{ who: 'choice', text: head, options: opts }];
  }
  function foodCookScene(where) {
    var head = where === 'tram'
      ? 'Bếp lửa của trạm nghỉ còn ấm. Nấu món gì bằng nguyên liệu mang theo?'
      : 'Bếp quán đang đỏ lửa. Nấu món gì?';
    return [{ who: 'choice', text: head, options: [
      { label: 'Nấu Canh Nấm Thảo Dược (cần Nấm Rừng ×1 — đang có ' + L.bagCount(state, 'nam_rung') + ')', action: 'food_cook_canh_nam_thao' },
      { label: 'Nấu Thịt Thú Nướng Que (cần Thịt Thú Rừng ×1 — đang có ' + L.bagCount(state, 'thit_thu') + ')', action: 'food_cook_thit_nuong' },
      { label: 'Nấu Canh Bổ Khí (cần Nấm Rừng ×1 + Thịt Thú Rừng ×1 — món dải Luyện Khí)', action: 'food_cook_canh_bo_khi' },
      { label: 'Rời bếp', action: 'food_leave' }
    ] }];
  }
  function foodInnScene() {
    return [{ who: 'choice', text: 'Vọng Tiên Tửu Điếm — quán bán đồ ăn mang theo, bếp quán cũng cho khách nấu món từ nguyên liệu sẵn có.', options: [
      { label: 'Mua đồ ăn', action: 'food_open_buy' },
      { label: 'Dùng bếp quán để nấu', action: 'food_open_cook' },
      { label: 'Rời quán', action: 'food_leave' }
    ] }];
  }
  function doFoodBuy(id) {
    var r = L.buyFood(state, id);
    if (!r.ok) toast(r.text || 'Không mua được món này.', 4000);
    else { sfxUi(); toast('Đã mua ' + r.def.name + ' (−' + r.price + ' Linh Thạch, trong túi: ' + L.bagCount(state, id) + ' phần). Ăn bằng nút Đồ Ăn (phím R) hoặc mở túi.', 4200); }
    refreshHUD(); saveNow();
    say(foodBuyScene());
  }
  /* Mua bằng BẠC ở giai đoạn ví Linh Thạch còn khóa (đợt sửa lỗi nhiệm
     vụ nấu ăn 2026-11-05): cùng khuôn với doFoodBuy, khác tiền tệ. */
  function doFoodBuySilver(id) {
    var r = L.buyFoodSilver(state, id);
    if (!r.ok) toast(r.text || 'Không mua được món này.', 4200);
    else { sfxUi(); toast('Đã mua ' + r.def.name + ' (−' + r.price + ' lượng bạc, còn ' + r.balance + ' lượng; trong túi: ' + L.bagCount(state, id) + ' phần). Ăn bằng nút Đồ Ăn (phím R).', 4400); }
    refreshHUD(); saveNow();
    say(foodBuyScene());
  }
  function doFoodCook(recipeId) {
    var r = L.cookFood(state, recipeId);
    if (!r.ok) {
      if (r.reason === 'need_linh') toast('Canh Bổ Khí là món cho người đã nhập đạo — hãy đột phá Luyện Khí rồi quay lại nấu.', 4400);
      else if (r.reason === 'no_ingredient') toast('Thiếu ' + (L.ITEM_DEFS[r.missing] ? L.ITEM_DEFS[r.missing].name : 'nguyên liệu') + ' — hái nấm ở bãi nấm ven đường mòn/trấn, hoặc săn thú rừng lấy thịt.', 4600);
      else toast(r.text || 'Chưa nấu được món này.', 3800);
    } else { sfxCook(); toast('Đã nấu xong ' + r.def.name + ' (trong túi: ' + r.count + ' phần). Ăn bằng nút Đồ Ăn (phím R) hoặc mở túi.', 4200); }
    refreshHUD(); saveNow();
    say(foodCookScene('bep'));
  }
  /* Mở quán trọ trấn: lần đầu vào quán, chủ quán bưng ra phần cơm nắm
     nhà Hứa gửi — món đồ ăn mở đầu của chương 1 (quà một lần, không
     phải điểm farm; mua/nấu lại mới là nguồn lặp). */
  function openFoodInn() {
    if (!state.flags.foodGiftInn) {
      state.flags.foodGiftInn = true;
      if (L.bagCanAdd(state, 'com_nam', 2).ok) {
        L.bagAdd(state, 'com_nam', 2);
        toast('Chủ quán bưng ra hai phần Cơm Nắm Lá Sen: "Phần ăn đường nhà Hứa gửi cho cậu Giang — đi xa nhớ ăn uống tử tế." Máu hoặc Tĩnh Âm xuống thấp thì bấm nút Đồ Ăn (phím R) để ăn.', 5600);
      }
    }
    say(foodInnScene());
  }
  /* Hái nấm ở bãi nấm (prop bai_nam_tran / bai_nam_duong): mỗi bãi một
     cây mỗi ngày game — cùng nhịp mọc lại theo ngày của bãi dược. */
  function gatherFoodHere(patchId) {
    var r = L.gatherFoodPatch(state, patchId);
    if (!r.ok) {
      if (r.reason === 'picked') return toast('Bãi nấm này hôm nay đã hái rồi — nấm mọc lại vào ngày game mai.', 3400);
      return toast(r.text || 'Chưa hái được.', 3600);
    }
    sfxHarvest();
    toast('Đã hái Nấm Rừng ×1 (trong túi: ' + r.count + '). Mang tới bếp Vọng Tiên Tửu Điếm ở trấn hoặc bếp trạm nghỉ giữa đường để nấu Canh Nấm Thảo Dược.', 4600);
    refreshHUD(); saveNow();
  }
  /* Trình diễn ăn: hạt sáng xanh (hồi máu) bay lên quanh người, thêm
     hạt lam nhạt khi có hồi Tĩnh Âm; số hồi bay trên đầu — đúng chuẩn
     hạt/số bay của các đợt hiệu ứng trước (spawnParts/addFloat). */
  function presentEat(r) {
    sfxEat();
    spawnParts(px + 16, py + 8, 10, '130,240,150', 20, true);
    if (r.taGain > 0) spawnParts(px + 16, py + 8, 6, '140,220,255', 16, true);
    if (r.hpGain > 0) addFloat(px + 16, py - 24, '+' + r.hpGain + ' máu', '130,240,150');
    if (r.taGain > 0) addFloat(px + 16, py - 38, '+' + r.taGain + ' Tĩnh Âm', '140,220,255');
  }
  /* Đường ăn DUY NHẤT cho cả nút dùng nhanh lẫn nút Ăn trong túi. */
  function eatFoodFlow(id) {
    if (!state || !id) return;
    if (dlg || dlgQueue.length) { toast('Đang trong hội thoại — dứt lời rồi hãy ăn.', 2600); return; }
    var inC = foodInCombat();
    if (inC && tNow < foodCdUntil) { toast('Vừa ăn xong — chờ ' + Math.max(1, Math.ceil((foodCdUntil - tNow) / 1000)) + ' giây nữa mới ăn tiếp được.', 2600); return; }
    var r = L.eatFood(state, id);
    if (!r.ok) {
      if (r.reason === 'full') {
        /* Ngữ cảnh nhiệm vụ hướng dẫn đồ ăn (đợt sửa lỗi 2026-11-05):
           bước ĂN còn dở mà bị chặn CHỈ vì đầy cả máu lẫn Tĩnh Âm thì
           cho ăn thử qua L.tasteFood (trừ món, hồi 0, hoàn thành bước)
           — người mới làm đúng hướng dẫn thường đang đầy sức, trước
           đây bước này kẹt vĩnh viễn và nhiệm vụ không bao giờ hiện
           nút Nhận thưởng. Ngoài ngữ cảnh nhiệm vụ, giữ nguyên luật
           chặn ăn khi đầy như cũ. */
        var sqItem = L.sideQuestList(state).filter(function (it) { return it.def.id === 'sq_food_tutorial'; })[0];
        var sqSt = sqItem ? sqItem.status : 'locked';
        if (sqSt === 'available' && state.flags && !state.flags.foodEaten) {
          var rt = L.tasteFood(state, id);
          if (rt && rt.ok && rt.taste) {
            presentEat(rt);
            toast('Đang đầy sức nên ' + rt.def.name + ' không hồi thêm được gì — nhưng ngươi đã nếm thử xong: bước Ăn thử của nhiệm vụ "Bữa Ăn Đường Xa" đã hoàn thành.', 4800);
            refreshHUD(); renderBag(); saveNow();
            return;
          }
        }
        toast('Máu và Tĩnh Âm đều đã đầy — ăn lúc này chỉ phí đồ ăn.', 3200);
      }
      else if (r.reason === 'no_item') toast('Không còn ' + (L.ITEM_DEFS[id] ? L.ITEM_DEFS[id].name : 'món này') + ' trong túi.', 3200);
      return;
    }
    if (inC) foodCdUntil = tNow + L.FOOD_CD_SEC * 1000; // nhịp chờ CHỈ trong trận; ngoài trận ăn tự do
    presentEat(r);
    toast('Đã ăn ' + r.def.name + ': hồi ' + r.hpGain + ' máu' + (r.taGain > 0 ? ', ' + r.taGain + ' Tĩnh Âm' : '') + ' (còn ' + r.left + ' phần trong túi).', 3400);
    refreshHUD(); renderBag(); saveNow();
  }
  function quickEatFood() {
    if (!state) return;
    var id = L.bestFoodId(state);
    if (!id) { toast('Không có đồ ăn trong túi — mua ở Vọng Tiên Tửu Điếm tại trấn hoặc sạp chợ Cô Châu Thành; hái Nấm Rừng về nấu canh, săn thú rừng lấy thịt nướng.', 5000); return; }
    eatFoodFlow(id);
  }

  /* ----- Dùng vật phẩm trong túi: đổi yêu đan / đọc bí tịch ----- */
  function useBagItem(id) {
    if (!state) return;
    var def = L.ITEM_DEFS[id];
    if (def && def.teaches) {
      var rb = L.useBiTich(state, id);
      if (!rb.ok) {
        toast(rb.reason === 'not_learned' ? 'Tàn thiên này là phần tiếp nối của một công pháp ngươi chưa được truyền — sách không tự mở được công pháp. Hãy theo truyền thừa của tông môn trước.' : 'Không đọc được bí tịch này.', 4200);
        return;
      }
      sfxBell();
      rings.push({ x: px + 16, y: py + 16, r: 8, a: 0.95 });
      // ARCIV mục 7: hạt motif theo quyển thay hạt vàng chung + nghi thức lên tầng nối tiếp
      if (rb.technique === 'thanh_phong') spawnLeaves(px + 16, py + 10, 10, 26);
      else spawnStarBurst(px + 16, py + 6, 10, '150,200,255', '235,245,255');
      if (rb.tierUps && rb.tierUps.length) presentTechTierUp(rb.technique, rb.tier);
      addFloat(px + 16, py - 24, '+' + rb.points + ' điểm tu luyện', '255,232,160');
      toast('Đọc xong ' + def.name + ': +' + rb.points + ' điểm tu luyện cho ' + L.TECHNIQUE_DEFS[rb.technique].name +
        (rb.tierUps.length ? ' — công pháp LÊN TẦNG ' + rb.tier + '!' : ' (đang tầng ' + rb.tier + ').'), 4600);
    } else if (def && def.type === 'do_an') {
      // Đồ ăn dùng ngay từ túi (đợt 2026-11-04): cùng đường ăn duy
      // nhất với nút dùng nhanh Đồ Ăn ở cụm nút chiến đấu.
      eatFoodFlow(id);
    } else if (id.indexOf('yeu_dan_') === 0) {
      var lvl = parseInt(id.slice('yeu_dan_'.length), 10);
      var re = L.exchangeYeuDan(state, lvl);
      if (!re.ok) {
        toast(re.reason === 'tuvi_cap_none' ? 'Tu vi đã chạm đỉnh cao nhất — yêu đan không còn nơi để hóa vào.' : 'Không đổi được yêu đan này.', 3600);
        return;
      }
      if (huntSession) huntSession.tuvi += re.granted.tuvi;
      spawnOrbs(3, px + 16, py + 16, re.granted.tuvi);
      toast('Hóa ' + def.name + ' vào tu vi: +' + fmtAmt(re.granted.tuvi) + ' tu vi.', 3200);
    }
    renderBag(); refreshHUD(); saveNow();
  }

  /* ----- Vẽ quái / vật rơi ----- */
  function monSrc(m) {
    var img = ASSETS.mons[m.species];
    var cw = img.naturalWidth / 6, ch = img.naturalHeight / 4, row = 0, col = 0;
    // Chết: ba khung chia ĐỀU trên 1,1s (0 / 0,37 / 0,74), khung cuối giữ tới hết mờ dần.
    if (m.state === 'dying') { row = 3; col = m.deathT < 0.37 ? 1 : (m.deathT < 0.74 ? 2 : 3); }
    else if (m.flashT > 0) { row = 3; col = 0; } // khung trúng đòn (khi không có bản trắng)
    // Đánh ba nhịp — nhịp 1 LÊN ĐÒN: windT còn trên 0,06 thì giữ hàng 2 cột 0.
    else if ((m.windT || 0) > 0.06) { row = 2; col = 0; }
    // Đánh ba nhịp — nhịp 2 LAO/VUNG (atkAnimT 0,35→0,24, cột 1, khung
    // trúng) rồi nhịp 3 THU VỀ (0,24→0, cột 2). atkAnimT vẫn do
    // updateEncounter đặt 0,35 đúng khoảnh khắc monsterStrike như cũ.
    else if (m.atkAnimT > 0) { row = 2; col = m.atkAnimT > 0.24 ? 1 : 2; }
    // ARCIV ch.16 (F.6 đã khai): boss Trận Nhãn bị Định Âm đóng băng
    // (holdT hoặc chu kỳ frozen) thì KHÓA khung đứng yên cột 0 của sheet.
    else if (m.species === 'tran_nhan_kiem_linh' && (m.holdT > 0 || (typeof arcCycle !== 'undefined' && arcCycle && arcCycle.frozen))) { row = 0; col = 0; }
    // Đi: pha KHÓA THEO QUÃNG ĐƯỜNG — cột = floor(gait / stridePx) % 4,
    // stride theo họ (boss lớn ×1,25). Đứng yên thì gait đứng yên, khung không trượt.
    else if (m.movingNow) { row = 1; col = Math.floor((m.gait || 0) / monStridePx(m)) % 4; }
    // Họ bay khi chờ: VỖ CÁNH LIÊN TỤC — dùng hàng bay (hàng 1, bốn
    // khung cánh thật của sheet) chạy theo thời gian ~170ms/khung lệch
    // phase0, thay hai khung đậu yên của hàng 0. Chỉ áp khi không ở
    // các trạng thái phía trên (chết/trúng đòn/lên đòn/vung đòn/đang đi).
    else if (monFamilyOf(m.species) === 'fly') { row = 1; col = Math.floor(tNow / 170 + (m.phase0 || 0)) % 4; }
    // Đứng: hai khung thở lệch theo phase0 của cá thể — không còn đồng loạt theo đồng hồ chung.
    else { row = 0; col = Math.floor(tNow / 600 + (m.phase0 || 0)) % 2; }
    return { x: col * cw, y: row * ch, w: cw, h: ch };
  }
  function drawMonster(mn, labels) {
    var size = MON_SHEET[mn.species] || 76;
    var kbS = mn.kbT > 0 ? mn.kbT / 0.12 : 0;
    var ox = mn.kbx * kbS + (mn.shakeT > 0 ? (Math.random() - 0.5) * (mn.rank === 'boss' ? 6 : 4) : 0)
      + (mn.resVibT > 0 ? Math.sin(tNow / 16 + mn.lairX * 3.1 + mn.lairY * 1.7) * 2.6 * Math.min(1, mn.resVibT / 0.2) : 0); // rung chấn cộng hưởng 2–3px trong 0,15–0,25s (thuần vẽ)
    var oy = mn.kby * kbS;
    if (mn.bossId && mn.slideT > 0) ox -= mn.face * 24 * (mn.slideT / 0.5); // boss trượt vào trận 24px trong 0,5 giây
    var feetX = mn.x + 16 + ox, feetY = mn.y + 32 + oy;
    if (mn.rank === 'elite' && mn.state === 'alive') {
      // Quầng vàng ấm dưới chân tinh anh (dấu hiệu hạng, luôn đọc được).
      ctx.fillStyle = 'rgba(255,205,84,' + (0.16 + 0.05 * Math.sin(tNow / 300)) + ')';
      ctx.beginPath(); ctx.ellipse(feetX, feetY - 2, size * 0.42, size * 0.15, 0, 0, Math.PI * 2); ctx.fill();
    }
    /* ----- Thân theo họ (đợt làm mượt cử động 2026-11-04) -----
       Lớp cử động thân dưới đây là BỔ TRỢ VẼ BẰNG CODE (lệch dải,
       nhún/nghiêng/bob/alpha quanh khung sheet sẵn có), KHÔNG phải
       khung hình mới và không đổi khung nào monSrc đã chọn. Mọi biên
       độ khóa theo gait/phase0 của cá thể và tắt hẳn khi fxOn tắt. */
    var fam = monFamilyOf(mn.species), famFx = fxOn(), ph0 = mn.phase0 || 0;
    var hoverBob = 0; // độ lơ lửng của họ bay/hồn/kiếm linh (px, dương = nhấc lên)
    if (famFx && mn.state === 'alive') {
      if (fam === 'fly') hoverBob = Math.sin(tNow * 0.0022 + ph0) * 3;        // Phong Ưng: lơ lửng kể cả khi đứng
      else if (fam === 'ghost') hoverBob = Math.sin(tNow * 0.0014 + ph0) * 3.5; // hồn ma: lướt nhấp nhô
      else if (fam === 'sword') hoverBob = Math.sin(tNow * 0.0014 + ph0) * 2;   // kiếm linh: lơ lửng cứng hơn, bob nhỏ hơn
    }
    // Bóng tiếp xúc của họ bay co giãn nhẹ theo bob (bay cao thì bóng nhỏ lại).
    contactShadow(feetX, feetY - 2, size * 0.72 * (fam === 'fly' && famFx ? 1 - hoverBob * 0.02 : 1));
    var mim = ASSETS.mons[mn.species];
    if (imgReady(mim)) {
      var ms = monSrc(mn);
      var white = mn.flashT > 0 ? whiteVariant(mn.species) : null;
      // Kiệt sức (máu <= 25%): thân khom xuống 2px, thở chậm theo nhịp 1,2 giây.
      var exh = (mn.state === 'alive' && mn.hp <= mn.hpMax * 0.25) ? 2 + Math.sin(tNow / 600) * 0.6 : 0;
      if (mn.state === 'dying' && mn.resShatter) {
        // Kết liễu bằng PHÁ ÂM: VỠ VỤN cộng hưởng thay khung mờ dần —
        // nứt sáng toàn thân rồi thân vỡ thành 10 mảnh sáng bay tản ra
        // kèm hạt sóng (hạt đã phát ở killMonster), trong đúng khung
        // thời gian gục hiện hữu 0,38s. Thuần trình diễn.
        var sk = Math.min(1, mn.deathT / 0.38);
        ctx.save(); ctx.translate(feetX, feetY - size * 0.5);
        ctx.strokeStyle = 'rgba(255,255,255,' + (0.9 * (1 - sk)) + ')'; ctx.lineWidth = 1.6;
        for (var cri = 0; cri < 3; cri++) {
          var cax = -8 + cri * 8 + Math.sin(mn.lairX * 7 + cri * 2.4) * 3;
          ctx.beginPath(); ctx.moveTo(cax, 14); ctx.lineTo(cax + 4, 2); ctx.lineTo(cax - 2, -8); ctx.lineTo(cax + 5, -18); ctx.stroke();
        }
        for (var shi = 0; shi < 10; shi++) {
          var sang2 = shi / 10 * Math.PI * 2 + mn.lairX * 1.3 + mn.lairY;
          var sdist = sk * (24 + (shi % 4) * 10);
          ctx.save();
          ctx.translate(Math.cos(sang2) * sdist, Math.sin(sang2) * sdist * 0.6 - sk * 8);
          ctx.rotate(sang2 + sk * 2.4);
          ctx.fillStyle = shi % 3 === 0 ? 'rgba(255,150,80,' + (0.9 * (1 - sk)) + ')' : 'rgba(127,232,224,' + (0.9 * (1 - sk)) + ')';
          ctx.fillRect(-3.4, -2, 6.8, 4);
          ctx.fillStyle = 'rgba(255,255,255,' + (0.85 * (1 - sk)) + ')'; ctx.fillRect(-1.2, -0.8, 2.4, 1.6);
          ctx.restore();
        }
        ctx.restore();
      } else {
        ctx.save();
        ctx.translate(feetX, feetY + exh - hoverBob);
        var alphaMul = 1;
        if (famFx && mn.state === 'alive') {
          // Nghiêng thân theo vận tốc ngang, tính trong khung thế giới
          // TRƯỚC khi lật mặt: bay bank ±0,06 rad, hồn lướt ±0,04, kiếm linh ±0,05.
          if (mn.movingNow && fam === 'fly') ctx.rotate(Math.max(-0.06, Math.min(0.06, (mn.vx || 0) * 0.001)));
          else if (mn.movingNow && fam === 'ghost') ctx.rotate(Math.max(-0.04, Math.min(0.04, (mn.vx || 0) * 0.0008)));
          else if (mn.movingNow && fam === 'sword') ctx.rotate(Math.max(-0.05, Math.min(0.05, (mn.vx || 0) * 0.001)));
          if (fam === 'ghost') alphaMul = 0.96 + 0.04 * Math.sin(tNow * 0.0014 + ph0); // hồn ma: alpha dao động 0,92–1,0
        }
        if (mn.face < 0) ctx.scale(-1, 1);
        if (mn.state === 'dying') ctx.globalAlpha = Math.max(0.3, 1 - mn.deathT / 1.1 * 0.55);
        else if (alphaMul !== 1) ctx.globalAlpha = alphaMul;
        var srcImg = white || mim;
        if (famFx && fam === 'snake' && mn.state !== 'dying') {
          // Rắn/thủy xà: UỐN SÓNG — thân vẽ làm 3 dải ngang, mỗi dải
          // lệch x theo sin(gait*0,11 + dải*1,1), biên độ đầu ít đuôi
          // nhiều (0 / 2,2 / 4,4px khi bò); đứng yên biên độ co còn 1/3
          // và pha chạy theo thời gian chậm lệch phase0.
          var sPhase = mn.movingNow ? (mn.gait || 0) * 0.11 : tNow * 0.0011 + ph0;
          // Biên độ TỈ LỆ TỐC ĐỘ THẬT: bò lừ đừ (wander) ~0,35, đuổi
          // mồi hết tốc 1,0; đứng yên co còn 1/3 chạy pha thời gian.
          var sSpd = Math.hypot(mn.vx || 0, mn.vy || 0) / Math.max(1, mn.speed || 60);
          var sAmp = mn.movingNow ? (0.35 + 0.65 * Math.min(1, sSpd)) : 1 / 3, sAmps = [0, 2.2, 4.4];
          for (var sb = 0; sb < 3; sb++) {
            var sOff = Math.sin(sPhase + sb * 1.1) * sAmps[sb] * sAmp;
            ctx.drawImage(srcImg, ms.x, ms.y + ms.h * sb / 3, ms.w, ms.h / 3 + 0.5,
              -size / 2 + sOff, -size + size * sb / 3, size, size / 3 + 0.5);
          }
        } else if (famFx && fam === 'quad' && mn.state === 'alive') {
          // Thú bốn chân: đi thì NHÚN thân theo nhịp bốn thì (2 chu kỳ
          // mỗi stride) + nghiêng nhẹ ±0,02 rad cùng pha; đứng thì THỞ
          // scaleY 1±0,008 chu kỳ ~2,4s lệch phase0.
          if (mn.movingNow) {
            var qPh = Math.sin((mn.gait || 0) / monStridePx(mn) * Math.PI * 4);
            ctx.translate(0, qPh * 1.6); ctx.rotate(qPh * 0.02);
          } else ctx.scale(1, 1 + Math.sin(tNow * (Math.PI * 2 / 2400) + ph0) * 0.008);
          ctx.drawImage(srcImg, ms.x, ms.y, ms.w, ms.h, -size / 2, -size, size, size);
        } else if (famFx && fam === 'stone' && mn.state === 'alive') {
          // Tượng đá: KHÔNG bob — mỗi bước đủ stride thì DẰN thân xuống
          // 1,5px trong 90ms (stoneSinkT đặt ở monStep, bụi ở đó nốt);
          // đứng yên bất động như đá, chỉ "thở" 0,3% gần như không thấy.
          if ((mn.stoneSinkT || 0) > 0) ctx.translate(0, 1.5 * (mn.stoneSinkT / 0.09));
          else if (!mn.movingNow) ctx.scale(1, 1 + Math.sin(tNow * 0.0009 + ph0) * 0.003);
          ctx.drawImage(srcImg, ms.x, ms.y, ms.w, ms.h, -size / 2, -size, size, size);
        } else {
          ctx.drawImage(srcImg, ms.x, ms.y, ms.w, ms.h, -size / 2, -size, size, size);
        }
        ctx.restore();
        ctx.globalAlpha = 1;
      }
    }
    // TỤ LỰC CỦA BOSS (đợt cài hiệu ứng boss, thiết kế 2.0.3/2.1): hào
    // quang dưới chân boss đậm dần trong 0,35s CUỐI của chu kỳ atkT
    // SẴN CÓ khi boss là quái của trận hiện tại — chỉ là dấu hiệu đọc
    // nhịp bên trong cửa sổ đòn đã tồn tại, KHÔNG thêm thời gian né,
    // KHÔNG đổi thời điểm đòn rơi một khung hình nào.
    if (mn.state === 'alive' && enc && enc.mon === mn && BOSS_FX_SPECIES[mn.species] && mn.atkT > 0 && mn.atkT <= 0.35 && fxOn()) {
      var ck = 1 - mn.atkT / 0.35; // 0 -> 1: càng sát đòn càng đậm
      var ccol = MON_PARTS[mn.species] || '200,200,200';
      ctx.fillStyle = 'rgba(' + ccol + ',' + (0.10 + 0.22 * ck).toFixed(3) + ')';
      ctx.beginPath(); ctx.ellipse(feetX, feetY - 2, size * 0.40 * (0.8 + 0.2 * ck), size * 0.13, 0, 0, Math.PI * 2); ctx.fill();
      if (mn.species === 'thach_tuong_thu_ve') {
        // #4: vòng sáng kim loại TỤ CO LẠI vào thân tượng theo tiến trình vận đòn.
        var shr = 36 - 22 * ck;
        ctx.strokeStyle = 'rgba(160,155,140,' + (0.30 + 0.60 * ck).toFixed(3) + ')'; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.ellipse(feetX, feetY - 2, shr, shr * 0.34, 0, 0, Math.PI * 2); ctx.stroke();
      } else if (mn.species === 'kiem_y_tan_hon') {
        // #6: kiếm ánh sáng DỰNG ĐỨNG trên đầu boss suốt nhịp vận đòn
        // (hình kiếm dựng của khối báo chiêu Thăng Long/Hoa) + vòng tụ
        // dưới chân theo cặp VÀNG-báo -> ĐỎ-đánh của bẫy Kiếm Trủng.
        var kcy = feetY - size - 12, kenv = 0.35 + 0.65 * ck;
        ctx.fillStyle = 'rgba(127,232,224,' + (0.30 * kenv) + ')';
        ctx.beginPath(); ctx.ellipse(feetX, kcy, 7, 17, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,' + (0.92 * kenv) + ')';
        ctx.fillRect(feetX - 1.4, kcy - 15, 2.8, 26);
        ctx.fillStyle = 'rgba(190,246,255,' + (0.9 * kenv) + ')';
        ctx.fillRect(feetX - 5, kcy + 11, 10, 2.2);
        ctx.strokeStyle = ck < 0.6 ? 'rgba(255,205,84,' + (0.35 + 0.5 * ck) + ')' : 'rgba(255,110,70,' + (0.35 + 0.5 * ck) + ')';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(feetX, feetY - 2, 22, 7.5, 0, 0, Math.PI * 2); ctx.stroke();
      } else if (mn.species === 'tan_anh_vo_cuc') {
        // #5: thân boss đã để lại một bóng mờ lệch sau lưng ngay từ nhịp vận đòn.
        if (imgReady(mim)) {
          var cms = monSrc(mn);
          ctx.save();
          ctx.globalAlpha = 0.05 + 0.15 * ck;
          ctx.translate(feetX - mn.face * 7, feetY);
          if (mn.face < 0) ctx.scale(-1, 1);
          ctx.drawImage(mim, cms.x, cms.y, cms.w, cms.h, -size / 2, -size, size, size);
          ctx.restore();
          ctx.globalAlpha = 1;
        }
      } else if (mn.species === 'oan_hon_chien_truong') {
        // #8: vòng oán khí tím-xám xoay quanh thân trong nhịp vận đòn.
        ctx.strokeStyle = 'rgba(150,160,200,' + (0.30 + 0.30 * ck).toFixed(3) + ')'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(feetX, feetY - size * 0.5, size * 0.34, size * 0.13, tNow / 300, tNow / 300 + Math.PI * 1.3); ctx.stroke();
      }
    }
    // #8 (ngoài trận): Oán Hồn XOÁY NHẸ LIÊN TỤC trong khoang boss khi
    // hộp lựa chọn hồi phong đang mở (bossChoiceShown) — khói oán thưa
    // 1 hạt / 0,4s quanh thân + hai vòng oán khí xoay chậm, để khoảnh
    // khắc chọn đánh/đáp âm/trấn an có sức nặng bằng mắt. Trình diễn
    // thuần: không trạng thái, không số, tôn trọng trần hạt.
    if (mn.species === 'oan_hon_chien_truong' && mn.state === 'alive' && bcSession && bcSession.realm === 'bc_hoiphong_mo' && bcSession.bossChoiceShown && !(enc && enc.mon === mn) && fxOn()) {
      ctx.strokeStyle = 'rgba(110,130,170,0.35)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(feetX, feetY - size * 0.5, size * 0.36, size * 0.14, tNow / 420, tNow / 420 + Math.PI * 1.25); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(feetX, feetY - size * 0.5, size * 0.27, size * 0.10, -tNow / 560, -tNow / 560 + Math.PI * 1.1); ctx.stroke();
      if (parts.length < MAX_PARTS - 10 && (!mn.bossFxSwirlT || tNow - mn.bossFxSwirlT >= 400)) {
        mn.bossFxSwirlT = tNow;
        spawnSmoke(feetX, feetY - size * 0.55, 1, '110,130,170');
      }
    }
    // Vòng ĐỊNH và ấn PHONG: hai dấu hiệu PHẢI phân biệt được bằng mắt —
    // ĐỊNH là vòng lam đứng yên ôm chân quái kèm hai cột sáng mảnh; PHONG
    // là ấn vuông vàng xoay chậm lơ lửng trên đầu quái (nợ hiệu ứng của
    // phần 3, khép ở đây).
    if (mn.state === 'alive' && mn.holdT > 0) {
      // ĐỊNH (gói phụ 10): vòng trận lam ở chân + VÒNG TÍM lơ lửng xoay
      // quanh thân — bản sắc riêng theo mẫu của Bui, khác hẳn PHONG.
      ctx.strokeStyle = 'rgba(140,200,255,0.9)'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.ellipse(feetX, feetY - 2, 20, 7, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = 'rgba(196,140,255,0.92)'; ctx.lineWidth = 2.4;
      ctx.setLineDash([9, 6]); ctx.lineDashOffset = -tNow / 8;
      ctx.beginPath(); ctx.ellipse(feetX, feetY - size * 0.52, 24, 8, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = 'rgba(140,200,255,0.4)'; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(feetX - 15, feetY - 4); ctx.lineTo(feetX - 15, feetY - 44);
      ctx.moveTo(feetX + 15, feetY - 4); ctx.lineTo(feetX + 15, feetY - 44);
      ctx.stroke();
    }
    if (mn.state === 'alive' && mn.sealT > 0) {
      // PHONG (gói phụ 10 + chuẩn sao chép nguyên mẫu 11:37 ngày 02/11):
      // hai LÁ BÙA VÀNG CAO lơ lửng hai bên thân quái như trong video
      // mẫu — thân bùa vàng sẫm dần xuống, một cột nét triện TỐI chạy
      // dọc giữa, dấu đỏ nhỏ ở đầu bùa; cuối thời gian phong ấn bùa
      // mờ cháy dần như mẫu (bùa biến mất trước khi ấn tan hẳn).
      var bobA = Math.sin(tNow / 300) * 2;
      var talA = Math.min(1, mn.sealT / 0.8);
      [-1, 1].forEach(function (sgn) {
        var bx = feetX + sgn * (size / 2 + 9), by = feetY - size * 0.52 + (sgn > 0 ? bobA : -bobA);
        ctx.save(); ctx.translate(bx, by); ctx.rotate(sgn * 0.08 * Math.sin(tNow / 340)); ctx.globalAlpha = talA;
        var tg = null;
        try { tg = ctx.createLinearGradient(0, -15, 0, 15); } catch (e) { tg = null; }
        if (tg) { tg.addColorStop(0, '#f8dc7e'); tg.addColorStop(1, '#dfae34'); ctx.fillStyle = tg; }
        else ctx.fillStyle = 'rgba(240,196,74,0.97)';
        ctx.fillRect(-5.5, -15, 11, 30);
        ctx.strokeStyle = 'rgba(146,102,26,0.9)'; ctx.lineWidth = 1; ctx.strokeRect(-5.5, -15, 11, 30);
        ctx.fillStyle = 'rgba(178,44,32,0.95)'; ctx.fillRect(-2.5, -13, 5, 3.4); // dấu đỏ đầu bùa
        ctx.strokeStyle = 'rgba(74,50,16,0.92)'; ctx.lineWidth = 1.3; // cột triện tối dọc thân bùa như mẫu
        ctx.beginPath();
        ctx.moveTo(0, -7); ctx.lineTo(0, 11);
        ctx.moveTo(-2.6, -3); ctx.lineTo(2.2, -3);
        ctx.moveTo(-2.2, 3); ctx.lineTo(2.6, 3);
        ctx.moveTo(-2.4, 8.5); ctx.lineTo(1.6, 8.5);
        ctx.stroke();
        ctx.restore();
      });
      var sa = tNow / 900, ss = 11;
      // Ấn PHONG khép xuống khóa trong giây đầu của phong ấn rồi đứng
      // yên giữ suốt thời gian còn lại (bước 2 mục 4); trước đây ấn xoay
      // liên tục suốt phong ấn.
      var sealElapsed = Math.max(0, (mn.sealDur || mn.sealT) - mn.sealT);
      var sealDrop = sealElapsed < 1 ? (1 - sealElapsed) * 24 : 0;
      ctx.save();
      ctx.translate(feetX, feetY - size - 14 + sealDrop);
      ctx.rotate(sealElapsed < 1 ? sa : 0.4);
      ctx.strokeStyle = 'rgba(255,205,84,0.95)'; ctx.lineWidth = 2.5;
      ctx.strokeRect(-ss, -ss, ss * 2, ss * 2);
      ctx.rotate(-2 * sa);
      ctx.strokeStyle = 'rgba(255,232,160,0.7)'; ctx.lineWidth = 1.5;
      ctx.strokeRect(-ss * 0.62, -ss * 0.62, ss * 1.24, ss * 1.24);
      ctx.restore();
    }
    if (mn.state === 'alive') {
      if (enc && enc.mon === mn) {
        // Thanh máu quái của trận hiện tại, ngay trên đầu quái.
        var bw = 54, bx = feetX - bw / 2, by = feetY - size - 16;
        ctx.fillStyle = 'rgba(10,8,4,0.75)'; ctx.fillRect(bx - 1, by - 1, bw + 2, 7);
        ctx.fillStyle = '#d8552f'; ctx.fillRect(bx, by, bw * Math.max(0, mn.hp / mn.hpMax), 5);
        labels.push({ key: 'mon:' + mn.species + ':' + mn.lairX + ':' + mn.lairY, name: mn.name, title: '', cx: feetX, wantY: by - 26, color: mn.rank === 'normal' ? '#ffffff' : '#ffd98a' });
      } else if (mn.rank !== 'normal') {
        labels.push({ key: 'mon:' + mn.species + ':' + mn.lairX + ':' + mn.lairY, name: mn.name, title: '', cx: feetX, wantY: feetY - size - 30, color: mn.rank === 'elite' ? '#ffd98a' : '#ffb27a' });
      }
    }
  }
  function drawGroundDrop(dr) {
    var def = L.ITEM_DEFS[dr.itemId];
    if (!def) return;
    var by = 0;
    if (dr.phase === 'bounce') {
      var p = Math.min(1, dr.t / 0.4);
      by = -Math.abs(Math.sin(p * Math.PI * 2)) * 12 * (1 - p * 0.45); // nảy hai nhịp trong 0,4 giây
    }
    var rare = isRareDrop(dr.itemId);
    if (rare) {
      // Vật mốc: quầng vàng thở + vòng sáng quay (yêu đan/bí tịch/đan).
      ctx.strokeStyle = 'rgba(255,205,84,' + (0.55 + 0.25 * Math.sin(tNow / 280)) + ')'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(dr.x, dr.y + by, 15, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,236,170,0.8)';
      ctx.beginPath(); ctx.arc(dr.x, dr.y + by, 19, tNow / 300, tNow / 300 + Math.PI * 0.9); ctx.stroke();
      ctx.beginPath(); ctx.arc(dr.x, dr.y + by, 19, tNow / 300 + Math.PI, tNow / 300 + Math.PI * 1.9); ctx.stroke();
    }
    ctx.fillStyle = 'rgba(28,22,12,0.88)';
    ctx.beginPath(); ctx.arc(dr.x, dr.y + by, 11, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = rare ? '#ffd94e' : '#77683c'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(dr.x, dr.y + by, 11, 0, Math.PI * 2); ctx.stroke();
    var gim = itemIconImage(dr.itemId);
    if (gim) {
      ctx.save();
      ctx.beginPath(); ctx.arc(dr.x, dr.y + by, 10.5, 0, Math.PI * 2); ctx.clip();
      ctx.drawImage(gim, dr.x - 10, dr.y + by - 10, 20, 20);
      ctx.restore();
    } else {
      ctx.fillStyle = '#ffe9a8'; ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(def.glyph, dr.x, dr.y + by + 3);
    }
    if (dr.full) {
      ctx.font = 'bold 9px sans-serif';
      ctx.fillStyle = 'rgba(20,16,8,0.9)'; ctx.fillText('Túi đầy', dr.x + 1, dr.y - 16 + 1);
      ctx.fillStyle = '#ff9d8a'; ctx.fillText('Túi đầy', dr.x, dr.y - 16);
    }
  }
  function drawFlyDrop(dr) {
    var def = L.ITEM_DEFS[dr.itemId];
    if (!def) return;
    var p = Math.min(1, dr.t / 0.45);
    var s0 = worldToScreen(dr.x, dr.y, camX, camY, zoom);
    var bagEl = $('btn-bag'), cvEl = $('game-canvas');
    var tx = viewW - 46, ty = 120;
    try {
      var br = bagEl.getBoundingClientRect(), cr = cvEl.getBoundingClientRect();
      tx = br.left - cr.left + br.width / 2; ty = br.top - cr.top + br.height / 2;
    } catch (e) {}
    var fx = s0.x + (tx - s0.x) * p, fy = s0.y + (ty - s0.y) * p - Math.sin(p * Math.PI) * 46;
    ctx.fillStyle = 'rgba(28,22,12,0.9)';
    ctx.beginPath(); ctx.arc(fx, fy, 10, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#ffd94e'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(fx, fy, 10, 0, Math.PI * 2); ctx.stroke();
    var fim = itemIconImage(dr.itemId);
    if (fim) {
      ctx.save();
      ctx.beginPath(); ctx.arc(fx, fy, 9.5, 0, Math.PI * 2); ctx.clip();
      ctx.drawImage(fim, fx - 9, fy - 9, 18, 18);
      ctx.restore();
    } else {
      ctx.fillStyle = '#ffe9a8'; ctx.font = 'bold 8px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(def.glyph, fx, fy + 3);
    }
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
    if (state.quest === 'q12_len_dai') {
      return say(ST.SCENE_CH12_LEN_DAI, function () {
        say(state.flags.soulPublic ? ST.SCENE_CH12_HP_TCL : ST.SCENE_CH12_HP_TONG, function () {
          state.quest = 'q12_ho_phap'; refreshHUD(); saveNow();
          toast('Hộ pháp đã vào vị trí. Tương tác lại với đài để bắt đầu vận công Kết Đan — địch sẽ tới, và ngươi tuyệt đối không được phát hưởng.', 4600);
        });
      });
    }
    if (state.quest === 'q12_ho_phap') return startKdGuard();
    if (state.quest === 'q12_ket_dan') {
      if (state.flags.ketDanGuardDone !== true) return startKdGuard();
      return say(ST.SCENE_CH12_TAM_MA.concat([KD_TAMMA_CHOICE]));
    }
    if (state.quest === 'q12_lenh_dau_tien') {
      if (!state.flags.lenDinhDone) return say(ST.SCENE_CH12_LENH_1);
      if (!state.flags.lenPhongDone) return say(ST.SCENE_CH12_LENH_2);
      return say([{ who: 'narrate', text: 'Tấm bia ở chân đài đứng yên tuyệt đối, vết rạn trên trận văn đã khép dưới vòng ấn vàng. Bậc Hưởng của ngươi bắt đầu từ đây.' }]);
    }
    if (state.quest === 'q16_dot_pha') return arcDoKimDanBreak();
    if (state.quest === 'q22_dot_pha') return arcDoHauKyBreak();
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
  /* ================= THIÊN KIẾP (docs/realm-prep/) =================
     Sự kiện độ kiếp bám khuôn resolveGuardWave: từng đạo lôi là một
     lựa chọn của người chơi, không xúc xắc giấu — toàn bộ tầng số ở
     logic.js (TRIBULATION_PROFILES, tribBoltDamage, tribEstimate).
     Phiên độ kiếp (trib) CHỈ sống trong bộ nhớ, không ghi vào save:
     đóng game giữa chừng được coi như rút lui ở pha tụ mây (vật dẫn
     chưa mất vì cổng chưa ghi save nào sau khi trừ đan; máu đã trừ
     bởi các đạo trước cũng chưa kịp ghi). Vật dẫn chỉ "đã nuốt" từ
     đạo lôi đầu tiên: rút lui ở bảng chuẩn bị thì hoàn lại nguyên vẹn. */
  var trib = null;           // phiên độ kiếp đang mở
  var tribBoltFx = { t: 0, seed: 0 }; // tia lôi đang vẽ (giây còn lại + hạt giống gấp khúc)
  var TRIB_BOLT_LINES = [
    'Đạo lôi thứ nhất xé mây giáng thẳng xuống đài.',
    'Đạo lôi thứ hai nặng hơn đạo trước — mây kiếp cuộn thấp hơn nữa, tiếng sấm dội vào lồng ngực.',
    'Đạo lôi thứ ba tụ lại lâu hơn, sáng trắng cả một góc trời phía bắc.',
    'Đạo lôi thứ tư giáng xuống kèm mưa đá nhỏ — trận văn quanh đài rung lên từng hồi.',
    'Đạo lôi cuối cùng của kiếp này: cả bầu trời như nín lại một nhịp trước khi sét xé xuống.'
  ];
  function tribGuardCutNow(targetRealm) {
    if (targetRealm === 2) return L.tribGuardCut(state.flags.guardBroken || 0);
    if (targetRealm === 3) return L.tribGuardCut(state.flags.ketDanGuardBroken || 0);
    return 0;
  }
  function startTribulation(opts) {
    if (trib) return;
    if (!L.tribProfileFor(opts.targetRealm)) { toast('Mốc này chưa có hồ sơ thiên kiếp.'); return; }
    trib = {
      targetRealm: opts.targetRealm, catalystId: opts.catalystId, chapter: opts.chapter || 0,
      guardCut: tribGuardCutNow(opts.targetRealm),
      idx: 0, spoken: 0, gapUsed: false, onSuccess: opts.onSuccess || null
    };
    showTribPanel();
  }
  /* Pha tụ mây — bảng chuẩn bị CÔNG KHAI (thiết kế mục 3.4): số đạo,
     sát thương từng đạo sau giảm trừ bị động, đồ chống lôi đang có,
     uy lực đối hưởng so với ngưỡng thiên uy, và ước tính máu còn lại
     theo phương án tiết kiệm nhất. Đây là cơ hội rút lui cuối cùng
     không mất gì. */
  function showTribPanel() {
    var panel = $('trib-panel');
    if (!panel) { beginTribBolts(); return; }
    var prof = L.tribProfileFor(trib.targetRealm);
    var est = L.tribEstimate(state, trib.targetRealm, trib.guardCut);
    var best = L.tribBestResonance(state, 0);
    var rows = prof.bolts.map(function (b, i) {
      var bare = L.tribBoltDamage(state, trib.targetRealm, i, { guardCut: trib.guardCut, active: 'none', spokenBefore: 0 });
      return '<div class="trib-row"><span>Đạo ' + (i + 1) + '</span><span>' + b.pct + '% máu tối đa (≈ ' + bare + ' sau giảm trừ bị động)</span><span>Ngưỡng thiên uy ' + b.uy + '</span></div>';
    }).join('');
    var passive = [];
    if (L.bagHas(state, 'dan_loi_phap')) passive.push('Dẫn Lôi Pháp −25% mọi đạo');
    passive.push(trib.guardCut >= 0.2 ? 'Hộ pháp trọn vẹn −20% mọi đạo' : (trib.guardCut > 0 ? 'Hộ pháp từng vỡ −10% mọi đạo' : 'Không có hộ pháp'));
    $('trib-realm').textContent = L.realmName(trib.targetRealm, 0).toUpperCase();
    $('trib-body').innerHTML =
      '<div class="trib-line">Số đạo lôi: <b>' + prof.bolts.length + '</b> · Máu hiện tại: <b>' + Math.floor(state.hp) + ' / ' + state.hpMax + '</b></div>'
      + rows
      + '<div class="trib-line">Giảm trừ bị động: ' + passive.join(' · ') + '</div>'
      + '<div class="trib-line">Đồ chống lôi trong túi: Hộ Thể Đan ×' + L.bagCount(state, 'ho_the_dan') + ' (−60% một đạo) · Tị Lôi Phù ×' + L.bagCount(state, 'ti_loi_phu') + ' (−85% một đạo) · Hồi Khí Đan ×' + L.bagCount(state, 'hoi_khi_dan') + ' (giữa hai đạo, hồi 25 Tĩnh Âm)</div>'
      + (best
        ? '<div class="trib-line">Đòn cộng hưởng mạnh nhất hiện có: <b>' + best.word + ' — uy lực ' + best.power + '</b>. Đối hưởng xóa được đạo nào có ngưỡng thiên uy dưới ' + best.power + '; mỗi lần đối hưởng, các đạo còn lại nặng thêm 15% (tối đa 2 lần mỗi lần độ kiếp).</div>'
        : '<div class="trib-line">Lúc này chưa có đòn cộng hưởng nào dùng được (thiếu Tĩnh Âm hoặc chưa mở chiêu) — đối hưởng thiên lôi không khả dụng.</div>')
      + '<div class="trib-line">Ước tính theo phương án tiết kiệm nhất với đồ đang có: tổng sát thương ≈ <b>' + est.totalDamage + '</b>, máu còn lại ≈ <b>' + est.remain + '</b> — <b>' + est.verdictText + '</b>.</div>'
      + '<div class="trib-warn">Vật dẫn đã nuốt. Rút lui ngay lúc này thì vật dẫn được hoàn lại nguyên vẹn. Từ đạo lôi đầu tiên giáng xuống, độ hỏng sẽ mất vật dẫn, tu vi về một nửa trần, thân mang trọng thương — nhưng không bao giờ tụt cảnh giới, và độ lại không giới hạn số lần.</div>';
    panel.classList.remove('hidden');
    sfxThunderFar();
  }
  function hideTribPanel() { var p = $('trib-panel'); if (p) p.classList.add('hidden'); }
  function tribRetreat() {
    if (!trib) return;
    var cat = trib.catalystId;
    trib = null; hideTribPanel();
    if (cat) L.bagAdd(state, cat, 1); // rút lui ở pha tụ mây: hoàn vật dẫn, không mất gì cả
    toast('Ngươi thu công, bước xuống đài. Vật dẫn đã hoàn lại túi — chuẩn bị thêm rồi quay lại độ kiếp.', 4200);
    refreshHUD(); saveNow();
  }
  function beginTribBolts() {
    hideTribPanel();
    say([{ who: 'narrate', text: 'Mây kiếp kéo tới trên đài, đen như mực tàu loang trong nước. Sấm rền ở rất xa — thiên kiếp của ngươi đã bắt đầu.' }], function () { tribShowBolt(); });
  }
  function tribBoltOptions() {
    var prof = L.tribProfileFor(trib.targetRealm);
    var bolt = prof.bolts[trib.idx];
    var opts = [{ label: 'Ngạnh kháng — chịu toàn bộ sát thương của đạo này', action: 'trib_tank' }];
    if (L.bagCount(state, 'ho_the_dan') > 0) opts.push({ label: 'Nuốt Hộ Thể Đan — đạo này giảm 60% sát thương (còn ' + L.bagCount(state, 'ho_the_dan') + ' viên)', action: 'trib_dan' });
    if (L.bagCount(state, 'ti_loi_phu') > 0) opts.push({ label: 'Kích Tị Lôi Phù — đạo này giảm 85% sát thương (còn ' + L.bagCount(state, 'ti_loi_phu') + ' lá)', action: 'trib_phu' });
    var best = L.tribBestResonance(state, trib.spoken);
    if (best) opts.push({ label: 'Đối hưởng thiên lôi bằng ' + best.word + ' (uy lực ' + best.power + ' / ngưỡng thiên uy ' + bolt.uy + ') — xóa đạo này nếu vượt ngưỡng; trời sẽ nghe được ngươi', action: 'trib_speak' });
    return opts;
  }
  function tribShowBolt() {
    if (!trib) return;
    var prof = L.tribProfileFor(trib.targetRealm);
    if (trib.idx >= prof.bolts.length) { tribSucceed(); return; }
    say([
      { who: 'narrate', text: TRIB_BOLT_LINES[Math.min(trib.idx, TRIB_BOLT_LINES.length - 1)] },
      { who: 'choice', text: 'Đạo lôi thứ ' + (trib.idx + 1) + ' — ngươi sẽ…', options: tribBoltOptions() }
    ]);
  }
  /* Giữa hai đạo: tối đa 1 viên Hồi Khí Đan mỗi khoảng nghỉ (theo đúng
     hiệu lực hiện có của đan: hồi 25 Tĩnh Âm — vốn quý cho đối hưởng). */
  function tribAfterBolt() {
    if (!trib) return;
    var prof = L.tribProfileFor(trib.targetRealm);
    if (trib.idx >= prof.bolts.length) { tribSucceed(); return; }
    if (!trib.gapUsed && L.bagCount(state, 'hoi_khi_dan') > 0) {
      say([
        { who: 'narrate', text: 'Giữa hai đạo lôi, mây kiếp chùng xuống một nhịp ngắn. Ngươi có đúng một hơi thở để chuẩn bị.' },
        { who: 'choice', text: 'Trước đạo kế tiếp, ngươi sẽ…', options: [
          { label: 'Dùng một viên Hồi Khí Đan (hồi 25 Tĩnh Âm) rồi đón đạo kế', action: 'trib_heal' },
          { label: 'Đón đạo kế ngay', action: 'trib_next' }
        ] }
      ]);
      return;
    }
    tribShowBolt();
  }
  function resolveTribChoice(action) {
    if (!trib) return;
    if (action === 'trib_next') { tribShowBolt(); return; }
    if (action === 'trib_heal') {
      var rh = L.bagRemove(state, 'hoi_khi_dan', 1);
      if (rh.ok) {
        state.silence = Math.min(L.SILENCE_MAX, state.silence + 25);
        trib.gapUsed = true;
        toast('Đã dùng Hồi Khí Đan: hồi 25 Tĩnh Âm (' + Math.floor(state.silence) + '/100).', 2600);
        refreshHUD();
      }
      tribShowBolt(); return;
    }
    if (action === 'trib_speak') { tribSpeakBolt(); return; }
    var active = action === 'trib_dan' ? 'dan' : (action === 'trib_phu' ? 'phu' : 'none');
    if (active === 'dan' && !L.bagRemove(state, 'ho_the_dan', 1).ok) { toast('Không còn Hộ Thể Đan trong túi.'); tribShowBolt(); return; }
    if (active === 'phu' && !L.bagRemove(state, 'ti_loi_phu', 1).ok) { toast('Không còn Tị Lôi Phù trong túi.'); tribShowBolt(); return; }
    tribStrikeBolt(active);
  }
  /* Đối hưởng thiên lôi (thiết kế mục 3.5): dùng đòn cộng hưởng mạnh
     nhất qua đúng cửa castWord (Tĩnh Âm tiêu như thường). Ba lớp giá —
     Tĩnh Âm đã tiêu, ấn Thiên Đạo +1 kèm một dòng Sổ Dư Âm ngữ cảnh
     'thien-kiep', và +15% cho mọi đạo còn lại — áp DÙ đạo có bị xóa
     hay không; chỉ việc đạo bị xóa là khác nhau. Đạo không bị xóa thì
     giáng xuống như một đạo ngạnh kháng (hệ số trời nghe của lần đối
     hưởng này chỉ tính từ đạo SAU). */
  function tribSpeakBolt() {
    var prof = L.tribProfileFor(trib.targetRealm);
    var bolt = prof.bolts[trib.idx];
    var best = L.tribBestResonance(state, trib.spoken);
    if (!best) { toast('Không còn đòn cộng hưởng nào dùng được lúc này.'); tribShowBolt(); return; }
    var before = state.silence;
    var r = L.castWord(state, best.skillId);
    if (!r.ok) { toast(r.reason); tribShowBolt(); return; }
    castResonanceFx(best.skillId, px + 16, py + 30, { silenceBefore: before, baseFreq: 200 });
    if (r.power > bolt.uy) {
      trib.spoken += 1;
      state.flags.thienDaoMark = (state.flags.thienDaoMark || 0) + 1;
      L.recordSpeech(state, trib.chapter || 0, 'thien-kiep', state.map);
      tribBoltFx.t = 0.35; tribBoltFx.seed = Math.random() * 10;
      rings.push({ x: px + 16, y: py + 16, r: 10, a: 0.95 }); // sân cộng hưởng nở xuyên qua mây
      addFloat(px + 16, py - 26, 'ĐỐI HƯỞNG!', '255,230,150');
      toast('Đòn đối hưởng đánh tan đạo lôi giữa trời! Nhưng trời đã nghe được ngươi — ấn Thiên Đạo +1, các đạo còn lại nặng thêm 15%.', 4600);
      trib.idx += 1; trib.gapUsed = false;
      refreshHUD();
      tribAfterBolt();
      return;
    }
    toast('Uy lực ' + r.power + ' chưa vượt ngưỡng thiên uy ' + bolt.uy + ' — đòn cộng hưởng tan giữa trời, đạo lôi vẫn giáng xuống. Trời cũng đã nghe được ngươi.', 4600);
    tribStrikeBolt('none');
    if (trib) { // phiên còn mở (chưa gục ở đạo này) thì mới ghi đủ ba lớp giá
      trib.spoken += 1;
      state.flags.thienDaoMark = (state.flags.thienDaoMark || 0) + 1;
      L.recordSpeech(state, trib.chapter || 0, 'thien-kiep', state.map);
    }
  }
  function tribStrikeBolt(active) {
    var prof = L.tribProfileFor(trib.targetRealm);
    var n = prof.bolts.length;
    var dmg = L.tribBoltDamage(state, trib.targetRealm, trib.idx, { guardCut: trib.guardCut, active: active, spokenBefore: trib.spoken });
    state.hp -= dmg;
    tribBoltFx.t = 0.35; tribBoltFx.seed = Math.random() * 10;
    sfxBolt(trib.idx >= n - 1);
    shakeT = Math.max(shakeT, 0.3 + 0.6 * (n > 1 ? trib.idx / (n - 1) : 0)); // đạo càng sau rung càng mạnh (mục 10)
    spawnParts(px + 16, py + 10, 14, '190,220,255', 40, false); // hạt điện tóe ở điểm chạm
    addFloat(px + 16, py - 22, '-' + dmg, '255,120,90');
    if (state.hp <= 0) { tribFail(); return; }
    toast('Đạo ' + (trib.idx + 1) + ' giáng xuống: −' + dmg + ' máu (còn ' + Math.floor(state.hp) + ').', 2400);
    trib.idx += 1; trib.gapUsed = false;
    refreshHUD();
    tribAfterBolt();
  }
  /* Thất bại: áp bảng giá ở logic (tu vi 50% trần, máu 1, trọng
     thương); vật dẫn đã nuốt thì mất hẳn — đường luyện lại có sẵn ở
     trưởng lão (Trúc Cơ) và đường dược dẫn (Kết Đan). KHÔNG tuyên
     cáo, KHÔNG tiếng Thiên Đạo: trời im lặng (thiết kế mục 9.2). */
  function tribFail() {
    trib = null; hideTribPanel();
    L.applyTribFailure(state);
    sfxThunderFar();
    shakeT = Math.max(shakeT, 0.9);
    say([
      { who: 'narrate', text: 'Đạo lôi đánh ngươi quỳ xuống nền đá. Mây kiếp tan chậm rãi — trời im lặng, không một lời ghi nhận.' },
      { who: 'truong_lao_tong', text: 'Đứng dậy được là tốt rồi. Vật dẫn đã hóa tro trong lò kiếp, tu vi hao mất một nửa, thân còn mang trọng thương. Về nghỉ cho thương khép lại, luyện lại vật dẫn theo đường cũ — đài này không đi đâu cả, độ lại bao nhiêu lần cũng được.' }
    ], function () { refreshHUD(); saveNow(); });
    refreshHUD();
  }
  function tribSucceed() {
    var t = trib; trib = null; hideTribPanel();
    if (state) L.recordPlayStat(state, 'tribulations'); // bộ đếm thống kê (đợt bảng nhân vật 2026-11-06): đúng điểm độ kiếp thành công duy nhất
    if (state) L.journalAdd(state, 'tribulation', 'Độ kiếp thành công — bước vào ' + L.realmName(t.targetRealm, 0)); // sổ hành trình (đợt mở rộng bảng nhân vật): cùng điểm thành công duy nhất
    var fired = false;
    var fireAnnounce = function () {
      if (fired) return; fired = true;
      var entry = L.publishAnnounce(state, { type: 'tribulation_success', realmTo: t.targetRealm });
      if (entry) presentAnnounce(entry);
    };
    if (t.onSuccess) t.onSuccess(fireAnnounce);
  }
  /* Tuyên cáo toàn "server" ở bản chơi đơn: biểu ngữ trang trọng 6
     giây + chuông lớn + tiếng Thiên Đạo tuyên đọc; dòng sổ đã được
     publishAnnounce ghi vào state.announceLog trước đó. */
  var announceTimer = 0;
  function presentAnnounce(entry) {
    var b = $('announce-banner'), tx = $('announce-text');
    if (tx) tx.textContent = entry.text;
    if (b) b.classList.remove('hidden');
    sfxBigBell();
    rings.push({ x: px + 16, y: py + 16, r: 10, a: 0.95 });
    playThienDaoVoice(entry.realmTo);
    if (announceTimer) clearTimeout(announceTimer);
    announceTimer = setTimeout(function () { if (b) b.classList.add('hidden'); }, 6000);
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
    // THIÊN KIẾP NHẸ 3 ĐẠO (docs/realm-prep/ mục 7 — điểm chèn duy
    // nhất): đan đã nuốt, sự kiện độ kiếp thay cho lời gọi
    // tryBreakthrough trực tiếp. Khối thành công bên dưới giữ nguyên
    // từng hiệu ứng/câu thoại của bản live; chỉ cộng thêm lớp tuyên
    // cáo Thiên Đạo chạy trong hàm gọi lại của cảnh. Tiền lệ hoàn đan
    // giữ nguyên cho hai trường hợp không mất: rút lui ở pha tụ mây
    // (tribRetreat) và tryBreakthrough hụt ở tầng kỹ thuật sau lôi.
    startTribulation({
      targetRealm: 2, catalystId: 'truc_co_dan', chapter: 8,
      onSuccess: function (fireAnnounce) {
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
          fireAnnounce(); // tuyên cáo Thiên Đạo: biểu ngữ + sổ + tiếng tuyên đọc (mục 9)
          refreshHUD(); saveNow();
          toast('Đột phá thành công: ' + r.label + '! Về đại điện gặp trưởng lão tông.', 4600);
        });
        refreshHUD();
      }
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
      // Cờ đã đo + bước nhiệm vụ chỉ ghi ở HÀM GỌI LẠI KHI CẢNH KHÉP — như
      // mọi cảnh khác của game (nhận công pháp, đột phá Trúc Cơ đều ghi
      // trạng thái trong hàm gọi lại). Trước đây hai ghi này chạy ngay khi
      // MỞ cảnh: người chơi thoát giữa cảnh đo thì save đã tính cảnh xong,
      // nhiệm vụ đã nhảy, vào lại không bao giờ xem lại được cảnh truyện
      // chương 1 — và khẳng định của gói phụ rò thoại (vào lại đúng nhiệm
      // vụ đã lưu, cảnh mở lại từ câu đầu) không thể đạt. Nội dung cảnh và
      // trạng thái CUỐI khi xem trọn cảnh không đổi.
      say(ST.SCENE_TEST, function () {
        state.flags.tested = true;
        if (state.quest === 'q_trac') state.quest = 'q_voice';
        refreshHUD(); saveNow();
      });
    } else if (!state.flags.voiced && state.quest === 'q_voice') {
      say(ST.SCENE_VOICE_RETRY);
    } else if (!state.flags.voiced) {
      state.quest = 'q_voice';
      say(ST.SCENE_VOICE_RETRY);
    } else {
      say([{ who: 'narrate', text: 'Bia đá im lìm. Chín màu của nó không đo được ngươi — như trưởng lão nói, phải tới Kiểm Trắc Tháp.' }]);
    }
    refreshHUD();
  }

  /* ---------- Hành động ---------- */
  function castPha() {
    if (tlFight) { tlVoiceReset(); return; } // gói phụ 13: Vạn Âm Cộng Hưởng bị khóa ở ải Thăng Long — bấm là phát hưởng, ải đặt lại
    if (hhtFight) { if (!dlg) hhtCastWord('pha'); return; } // Mục F: Ngôn Linh dùng được trong trận đài
    if (daiFight) { if (!dlg) daiCastWord('pha'); return; } // ARCIV: cộng hưởng trong trận đài thách đấu
    if (arcFig) { if (!dlg) arcFigCastWord('pha'); return; } // ARCIV: cộng hưởng trong trận kịch bản dã ngoại
    if (dlg) return;
    if (enc) { encCastWord('pha'); return; }
    if (startEncounterNear(3.2)) { encCastWord('pha'); return; }
    var before = state.silence;
    var r = L.castWord(state, 'pha');
    if (!r.ok) { toast(r.reason); return; }
    castResonanceFx('pha', px + 16, py + 30, { silenceBefore: before, baseFreq: 170, noWave: true }); // ngoài trận: sân nở tại chân người, âm gốc vật liệu đặc 170 Hz
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
        toast('Cọc gỗ nứt ra! Còn chịu được khoảng ' + state._dummyHp + ' uy lực. Tĩnh Âm đã dùng: ' + before + ' → ' + state.silence + '.');
      }
    }
    refreshHUD(); saveNow();
  }
  function castChan() {
    if (tlFight) { tlVoiceReset(); return; } // gói phụ 13: Vạn Âm Cộng Hưởng bị khóa ở ải Thăng Long
    if (hhtFight) { if (!dlg) hhtCastWord('chan'); return; } // Mục F: Ngôn Linh dùng được trong trận đài
    if (daiFight) { if (!dlg) daiCastWord('chan'); return; } // ARCIV
    if (arcFig) { if (!dlg) arcFigCastWord('chan'); return; } // ARCIV
    if (dlg) return;
    if (enc) { encCastWord('chan'); return; }
    if (startEncounterNear(3.2)) { encCastWord('chan'); return; }
    var beforeC = state.silence;
    var r = L.castWord(state, 'chan');
    if (!r.ok) { toast(r.reason); return; }
    castResonanceFx('chan', px + 16, py + 30, { silenceBefore: beforeC, baseFreq: 220, noWave: true });
    addFloat(px + 16, py - 20, 'CHẤN!', '150,200,255');
    shakeT = Math.max(shakeT, 0.35); // rung nhẹ — chỉ hiệu ứng trình diễn
    refreshHUD(); saveNow();
  }
  /* Kiếm quyết (chương 3): đòn vật lý không tốn Tĩnh Mặc, không ghi sổ lời
     nói. Đánh vào cọc gỗ thì nứt như mọi đòn nhưng không làm cọc đổ hẳn —
     cọc gỗ của trấn vẫn là việc của một đòn Phá Âm. */
  function castSword() {
    if (tlFight) { tlSwordHeld = true; tlSwordHeldUntil = tNow + 350; tlSwordPress(); return; } // gói phụ 13: nút kiếm cảm ứng trong ải
    if (hhtFight) { if (!dlg) hhtCastSword(); return; } // Mục F: kiếm quyết trong trận đài
    if (daiFight) { if (!dlg) daiCastSword(); return; } // ARCIV: kiếm quyết trong trận đài thách đấu
    if (arcFig) { if (!dlg) arcFigCastSword(); return; } // ARCIV: kiếm quyết trong trận kịch bản dã ngoại (gồm phá mắt trận)
    if (dlg) return;
    if (enc) { encCastSword(); return; }
    if (startEncounterNear(1.9)) { encCastSword(); return; }
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
        toast('Cọc gỗ nứt nặng nhưng chưa đổ (còn 1). Nhát cuối của cọc này vẫn phải là một đòn Phá Âm.');
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
    // Chặn tương tự ở biên Trúc Cơ Viên Mãn -> Kim Đan: Kết Đan là sự kiện
    // truyện tại đài cùng vật dẫn và vòng hộ pháp của chương 12.
    if (state.realm === 2 && state.stage === L.REALMS[2].stages.length - 1 &&
        state.tuvi >= L.REALMS[2].tuviNext && state.quest !== 'q12_done') {
      toast('Kết Đan là bước qua đại cảnh giới — phải thực hiện tại Đài Trúc Cơ ở phía bắc Thanh Vân Tông cùng vật dẫn Kết Đan, theo nhiệm vụ chương 12. Hãy tới đài và tương tác với đài để bắt đầu.', 5600);
      return;
    }
    // Lớp điều kiện đột phá chung (docs/realm-prep/ mục 2, tầng logic
    // stageGateBlocked): giai đoạn Trúc Cơ chỉ đột phá trong sự kiện
    // đóng chương tương ứng — nút bấm báo rõ còn thiếu mốc nào; biên
    // đại cảnh giới từ Kim Đan trở đi (Nguyên Anh, Hóa Thần) chưa có
    // lễ độ kiếp riêng nên nút bấm không được qua mặt thiên kiếp.
    var gate = L.stageGateBlocked(state);
    if (gate) {
      if (gate.reason === 'great_border') {
        toast('Bước qua đại cảnh giới phải qua thiên kiếp tại đài. Lễ độ kiếp cho mốc ' + gate.info.targetLabel + ' chưa được mở — hãy tu luyện tiếp, chờ ngày tông môn mở đài.', 5600);
      } else {
        toast(gate.reason, 5600);
      }
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
  /* Trạng thái .cant (không đủ Tĩnh Âm) — TRÌNH DIỄN THUẦN (bổ sung
     2026-11-03): chỉ đổi lớp hiển thị của đế icon, không chạm điều kiện
     ra chiêu; castWord và mọi handler giữ nguyên. */
  function setSkillCant(id, cant) {
    var el = $(id); if (!el) return;
    el.classList.toggle('cant', !!cant);
  }
  /* Áp lại vị trí theo pha nhiệm vụ cho NPC sống (gói phụ 5): NPC đang
     bị cảnh ghim (sceneSpot) thì giữ nguyên; còn lại theo npcPosFor. */
  function applyNpcPhasePositions() {
    if (!state || !npcsLive.length) return;
    var defs = L.activeMap().npcs;
    for (var i = 0; i < npcsLive.length; i++) {
      var n = npcsLive[i];
      if (sceneSpot && sceneSpot.id === n.id) continue;
      for (var j = 0; j < defs.length; j++) {
        if (defs[j].id === n.id) {
          var pp = L.npcPosFor(state, defs[j]);
          n.x = pp.x; n.y = pp.y; n.dir = pp.dir;
          break;
        }
      }
    }
  }
  /* Mục H — panel NHIỆM VỤ PHỤ riêng trong #hud-quest: liệt kê chuỗi phụ
     quanh Trúc Cơ đã mở (ẩn hẳn khi chưa nhiệm vụ nào mở), mỗi mục có
     tiến độ thuần từ logic + nút Chọn/Bỏ chọn dẫn đường + nút Nhận
     thưởng khi ready. Vẽ lại chỉ khi chữ ký trạng thái đổi (tránh dựng
     lại DOM mỗi khung hình qua refreshHUD). */
  /* Sổ Thiên Đạo thông cáo (docs/realm-prep/ mục 9.2): vẽ từ
     state.announceLog, dòng mới nhất ở trên; ký hiệu chữ ký để không
     dựng lại DOM khi không có gì thay đổi (cùng khuôn panel phụ). */
  var announceSig = '';
  function escHtml(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function renderAnnounceLog() {
    var box = $('announce-log-list');
    if (!box || !state) return;
    var log = state.announceLog || [];
    var sig = log.length + '|' + (log.length ? log[log.length - 1].ts : 0);
    if (sig === announceSig) return;
    announceSig = sig;
    if (!log.length) { box.innerHTML = '<div class="announce-empty">Chưa có thông cáo nào. Thiên Đạo chỉ lên tiếng khi một tu sĩ độ kiếp thành công bước qua đại cảnh giới.</div>'; return; }
    box.innerHTML = log.slice().reverse().map(function (e) {
      var hh = Math.floor((e.minutes || 0) / 60), mm = (e.minutes || 0) % 60;
      return '<div class="announce-row"><div class="announce-day">Ngày ' + (e.day || 1) + ' · ' + (hh < 10 ? '0' : '') + hh + ':' + (mm < 10 ? '0' : '') + mm + '</div><div>' + escHtml(e.text) + '</div></div>';
    }).join('');
  }
  var sidePanelSig = '';
  function renderSidePanel() {
    var list = $('hud-side-list');
    if (!list || !state || !L.sideQuestList) return;
    var items = L.sideQuestList(state).filter(function (it) { return it.status !== 'locked'; });
    var sq = L.ensureSideQuests(state);
    var sig = items.map(function (it) { return it.def.id + ':' + it.status + ':' + it.progress.cur + '/' + it.progress.target; }).join('|') + '#sel=' + (sq.selected || '');
    if (sig === sidePanelSig) return;
    sidePanelSig = sig;
    list.innerHTML = '';
    if (!items.length) {
      var d0 = document.createElement('div');
      d0.className = 'quest-desc'; d0.textContent = 'Chưa mở — nhiệm vụ phụ mở dần theo hành trình: nhiệm vụ hướng dẫn đồ ăn ngay ở chương đầu, chuỗi phụ quanh Trúc Cơ mở ở chương 8.';
      list.appendChild(d0);
      return;
    }
    items.forEach(function (it) {
      var box = document.createElement('div');
      box.className = 'side-item'; box.setAttribute('data-side-id', it.def.id);
      box.style.cssText = 'margin:6px 0;padding:6px 8px;border:1px solid #77683c;border-radius:8px;background:rgba(24,17,10,0.55)';
      var nm = document.createElement('div');
      nm.className = 'quest-name'; nm.style.fontSize = '13px';
      nm.textContent = it.def.name + (it.status === 'claimed' ? ' — đã xong' : (it.status === 'skipped' ? ' — đã qua mốc Trúc Cơ (bỏ qua)' : (it.status === 'ready' ? ' — sẵn sàng nhận thưởng' : '')));
      box.appendChild(nm);
      var pr = document.createElement('div');
      pr.className = 'quest-desc'; pr.textContent = it.progress.text + (sq.selected === it.def.id ? ' · Đang dẫn đường theo nhiệm vụ này' : '');
      box.appendChild(pr);
      if (it.status === 'available' || it.status === 'ready') {
        var bSel = document.createElement('button');
        bSel.type = 'button'; bSel.className = 'btn wood'; bSel.setAttribute('data-side-action', sq.selected === it.def.id ? 'unselect' : 'select'); bSel.setAttribute('data-side-id', it.def.id);
        bSel.textContent = sq.selected === it.def.id ? 'Bỏ chọn dẫn đường' : 'Chọn dẫn đường';
        bSel.addEventListener('click', (function (id, wasSel) { return function () { sideSelectToggle(id, wasSel); }; })(it.def.id, sq.selected === it.def.id));
        box.appendChild(bSel);
      }
      if (it.status === 'ready') {
        var bClaim = document.createElement('button');
        bClaim.type = 'button'; bClaim.className = 'btn wood'; bClaim.setAttribute('data-side-action', 'claim'); bClaim.setAttribute('data-side-id', it.def.id);
        bClaim.textContent = 'Nhận thưởng';
        bClaim.addEventListener('click', (function (id) { return function () { sideClaim(id); }; })(it.def.id));
        box.appendChild(bClaim);
      }
      list.appendChild(box);
    });
  }
  function sideSelectToggle(id, wasSel) {
    var r = wasSel ? L.selectSideQuest(state, null) : L.selectSideQuest(state, id);
    if (!r.ok) { toast('Chưa chọn được nhiệm vụ phụ này.', 3200); return; }
    sidePanelSig = '';
    toast(wasSel ? 'Đã bỏ chọn — dẫn đường quay về nhiệm vụ chính.' : 'Dẫn đường đang bám nhiệm vụ phụ đã chọn.', 3000);
    refreshHUD(); saveNow();
  }
  function sideClaim(id) {
    var r = L.claimSideQuest(state, id);
    if (!r.ok) {
      /* Nói ĐÚNG lý do và cách xử lý (đợt sửa lỗi nhiệm vụ nấu ăn
         2026-11-05): trước đây mọi lỗi đều bị nuốt thành một câu chung
         chung "Chưa nhận được thưởng nhiệm vụ phụ." — người chơi không
         biết túi đầy là phải bỏ bớt đồ rồi nhận lại; tiến độ nhiệm vụ
         vốn được giữ nguyên ở phía logic. */
      if (r.reason === 'duplicate') toast('Nhiệm vụ phụ này đã nhận thưởng rồi.', 3600);
      else if (r.reason === 'bag_full') toast('Túi đã đầy — không còn chỗ chứa phần thưởng. Hãy bỏ bớt đồ (hoặc ăn bớt đồ ăn) rồi bấm Nhận thưởng lại; tiến độ nhiệm vụ vẫn giữ nguyên.', 5600);
      else if (r.reason === 'not_ready' && r.status === 'locked') toast('Nhiệm vụ này chưa mở — hãy đi tiếp mạch truyện chính.', 4200);
      else if (r.reason === 'not_ready') toast('Chưa xong các bước của nhiệm vụ này — xem dòng tiến độ trong bảng nhiệm vụ phụ rồi làm nốt.', 4600);
      else toast('Chưa nhận được thưởng nhiệm vụ phụ.', 3600);
      return;
    }
    sidePanelSig = '';
    sfxQuest();
    toast('Đã nhận thưởng nhiệm vụ phụ: ' + grindGrantedText(r) + '.', 4600);
    refreshHUD(); saveNow();
  }
  function refreshHUD() {
    if (!state) return;
    renderSidePanel();
    $('hud-realm').textContent = L.realmName(state.realm, state.stage);
    $('hud-hp').textContent = Math.floor(state.hp) + ' / ' + state.hpMax;
    $('hud-hp-bar').style.width = Math.max(0, Math.min(100, state.hp / state.hpMax * 100)) + '%';
    // Dấu trọng thương cạnh thanh máu (docs/realm-prep/ mục 10): chỉ
    // hiện khi thân đang mang thương sau độ kiếp hỏng.
    var injEl = $('hud-injury');
    if (injEl) injEl.classList.toggle('hidden', !state.flags.trongThuong);
    renderAnnounceLog();
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
      var linhLbl = linhRow.querySelector ? linhRow.querySelector('.linh-label') : null;
      if (wOpen) {
        linhRow.classList.remove('hidden');
        if (linhLbl) linhLbl.textContent = 'Linh Thạch';
        $('hud-linh-val').textContent = L.fmtNum(state.linhThach || 0);
      } else {
        /* Giai đoạn phàm nhân: ví Linh Thạch vẫn khóa và không hiển thị
           (đúng luật khóa ví) — ô này chỉ hiện VÍ BẠC phàm tục (đợt sửa
           lỗi nhiệm vụ nấu ăn 2026-11-05) để người chơi biết mình còn
           bao nhiêu bạc mua đồ ăn ở quán trọ/sạp chợ. */
        linhRow.classList.remove('hidden');
        if (linhLbl) linhLbl.textContent = 'Bạc';
        $('hud-linh-val').textContent = L.fmtNum(L.silverBalance(state)) + ' lượng';
      }
    }
    // Vũ khí đang đeo (mục B đợt vá 2026-11-02): hiện ngay trong khung
    // nhân vật từ đầu game — đường hiển thị tối thiểu trước khi Túi Trữ
    // Vật mở ở chương 3, vì kiếm khởi đầu đeo trên người chứ không nằm
    // chờ trong túi khóa.
    var weapEl = $('hud-weapon-val');
    if (weapEl) {
      var wb = L.weaponBonus(state), wdef = wb.id ? L.ITEM_DEFS[wb.id] : null;
      weapEl.textContent = wdef ? (wdef.name + ' (+' + wb.sword + ' kiếm / +' + wb.word + ' lời)') : 'Tay không';
    }
    var q = L.questById(state.quest);
    $('hud-quest-name').textContent = q ? q.name : '';
    $('hud-quest-desc').textContent = q ? q.desc : '';
    var qid = q ? q.id : state.quest;
    if (qid && qid !== lastQuestId) {
      applyNpcPhasePositions(); // nhiệm vụ đổi pha: NPC có vị trí theo pha về đúng chỗ của pha mới ngay trong phiên (gói phụ 5)
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
    setSkillLock('sk-dinh', state.unlocked.indexOf('kimdan') < 0, 'bậc Hưởng chỉ mở khi Kết Đan — đạt Kim Đan Sơ Kỳ');
    setSkillLock('sk-phong', state.unlocked.indexOf('kimdan') < 0, 'bậc Hưởng chỉ mở khi Kết Đan — đạt Kim Đan Sơ Kỳ');
    // Đế icon mờ lạnh (.cant) khi chiêu ĐÃ mở khóa mà Tĩnh Âm chưa đủ chi
    // phí (chi phí đọc từ L.WORD_SKILLS như castWord vẫn đọc); đang khóa
    // thì không áp .cant — trạng thái khóa thắng.
    var wsCost = {};
    if (L.WORD_SKILLS) for (var wi = 0; wi < L.WORD_SKILLS.length; wi++) wsCost[L.WORD_SKILLS[wi].id] = L.WORD_SKILLS[wi].cost;
    setSkillCant('sk-pha', state.unlocked.indexOf('voice') >= 0 && state.silence < (wsCost.pha || 30));
    setSkillCant('sk-chan', state.unlocked.indexOf('luyenkhi1') >= 0 && state.silence < (wsCost.chan || 50));
    setSkillCant('sk-dinh', state.unlocked.indexOf('kimdan') >= 0 && state.silence < (wsCost.dinh || 60));
    setSkillCant('sk-phong', state.unlocked.indexOf('kimdan') >= 0 && state.silence < (wsCost.phong || 80));
    // ARCIV ch.15: cộng hưởng bị nhiễu khóa — nút xám theo ngữ cảnh; bậc Hưởng
    // hiện "đã biết nhưng bị nhiễu" (title riêng), KHÔNG hiện như chưa học.
    if (state.flags && (state.flags.arcResLocked || state.flags.ch15ResonanceLock)) {
      ['sk-pha', 'sk-chan', 'sk-dinh', 'sk-phong'].forEach(function (sid) { setSkillCant(sid, true); });
      if (state.unlocked.indexOf('kimdan') >= 0) { var sd = $('sk-dinh'), sp2 = $('sk-phong'); if (sd) sd.title = 'Đã học Định Âm — đang bị nhiễu loạn sóng khóa'; if (sp2) sp2.title = 'Đã học Phong Âm — đang bị nhiễu loạn sóng khóa'; }
      var sph = $('sk-phong'); if (sph) sph.classList.toggle('active', arcPhongContext());
    }
    var bagBtn = $('btn-bag');
    if (bagBtn) bagBtn.classList.toggle('hidden', !state.flags.bagUnlocked); // nút Túi chỉ hiện sau mốc mở khóa chương 3
    var medBtn = $('sk-med');
    if (medBtn) medBtn.classList.toggle('active', medLatch);
    /* Nút Đồ Ăn (đợt 2026-11-04): xám hẳn (.locked) khi túi không còn
       món nào; mờ lạnh (.cant) khi đang trong trận mà nhịp chờ ăn còn
       chạy hoặc máu + Tĩnh Âm đều đã đầy — trình diễn thuần, điều kiện
       ăn thật nằm ở eatFoodFlow/eatFood. */
    var foodBtn = $('sk-food');
    if (foodBtn) {
      var foodN = L.foodCount(state);
      foodBtn.classList.toggle('locked', foodN < 1);
      foodBtn.classList.toggle('cant', foodN > 0 && ((foodInCombat() && tNow < foodCdUntil) || (state.hp >= state.hpMax && state.silence >= 100)));
      foodBtn.title = foodN > 0 ? ('Đồ ăn (' + foodN + ' phần) — ăn món hợp nhất: hồi máu + Tĩnh Âm') : 'Đồ ăn — chưa có món nào trong túi';
    }
    /* Gợi ý đồ ăn lần đầu máu xuống thấp ở giai đoạn đầu (yêu cầu dạy
       người chơi của đợt 2026-11-04): một lần duy nhất, có cờ ghi save;
       có đồ ăn thì chỉ nút ăn, chưa có thì chỉ nơi mua/hái/nấu. */
    if (!state.flags.foodHintSeen && state.hp > 0 && state.hp <= state.hpMax * 0.35 && !L.questReached(state, 'q3_done')) {
      state.flags.foodHintSeen = true;
      toast(L.foodCount(state) > 0
        ? 'Máu đang thấp! Bấm nút Đồ Ăn (phím R) để ăn ngay một món — hồi cả máu lẫn Tĩnh Âm.'
        : 'Máu đang thấp! Ghé Vọng Tiên Tửu Điếm ở trấn mua đồ ăn mang theo, hoặc hái Nấm Rừng ven đường mòn về nấu canh — ăn là hồi máu và Tĩnh Âm.', 5400);
    }
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
    L.accruePlayTime(state, dt); // bộ đếm thời gian chơi (đợt bảng nhân vật 2026-11-06): tích theo đúng nhịp khung, trần 0,05 giây/khung như dt
    L.journalSyncQuest(state); // sổ hành trình (đợt mở rộng bảng nhân vật): phát hiện chuyển mốc nhiệm vụ chính q*_done — điểm chuyển nhiệm vụ rải khắp nơi nên đồng bộ theo thay đổi tại vòng lặp là đường trung tâm duy nhất
    if (shakeT > 0) shakeT = Math.max(0, shakeT - dt);
    if (flashA > 0) flashA = Math.max(0, flashA - dt * 0.7);
    if (pillarT > 0) pillarT = Math.max(0, pillarT - dt);
    if (tribBoltFx.t > 0) tribBoltFx.t = Math.max(0, tribBoltFx.t - dt);
    // Dừng hình (cảm giác cày GF-03): đóng băng LỚP THẾ GIỚI (quái, hạt,
    // vòng sóng, số bay) trong 60-160ms tùy hạng đòn; giao diện, thoại và
    // đáp ứng di chuyển của người chơi vẫn chạy theo thời gian thật.
    var worldFrozen = false;
    if (hitStopT > 0) { hitStopT = Math.max(0, hitStopT - dt); worldFrozen = hitStopT > 0; }
    var dtW = worldFrozen ? 0 : dt;
    // Hạt linh khí: cập nhật vị trí, bay lên dần, hết đời thì loại.
    parts = parts.filter(function (p) { return p.t < p.life; });
    parts.forEach(function (p) {
      p.t += dtW;
      if (p.kind === 'petal') { // cánh hoa: rơi lắc lư, trôi theo gió nhẹ
        p.x += (p.vx + Math.sin(p.t * 5 + p.sw) * 13) * dtW; p.y += p.vy * dtW; p.rot += p.vr * dtW;
      } else if (p.kind === 'smoke') { // khói: nở chậm và bốc lên
        p.x += p.vx * dtW; p.y += p.vy * dtW; p.r += 5.5 * dtW;
      } else if (p.kind === 'leaf') { // lá Thanh Phong: xoáy quanh trục bốc lên
        p.rot += (p.vr || 2) * dtW; p.x += (p.vx + Math.sin(p.t * 6 + p.rot) * 10) * dtW; p.y += p.vy * dtW;
      } else if (p.kind === 'star') {
        p.x += p.vx * dtW; p.y += p.vy * dtW;
      } else if (p.kind === 'orbit') { // hạt XOAY TRÒN quanh một tâm (gió tụ của Trảm Phong Thức, Lục Tranh): vận tốc tiếp tuyến, elip nén dọc như mọi vòng chân
        p.ang += p.va * dtW; p.x = p.cx + Math.cos(p.ang) * p.r0; p.y = p.cy + Math.sin(p.ang) * p.r0 * 0.42;
      } else { p.x += p.vx * dtW; p.y += p.vy * dtW; p.vy -= 8 * dtW; }
    });
    pillars = pillars.filter(function (pl) { pl.t += dtW; return pl.t < pl.dur; });
    streaks = streaks.filter(function (st) { if (st.delay > 0) { st.delay -= dtW; return true; } st.t += dtW; return st.t < st.dur; });
    bossFx = bossFx.filter(function (fx) { fx.t += dtW; return fx.t < fx.dur; });
    updateResFx(dtW); // sân cộng hưởng + sóng khóa đi theo dtW: tôn trọng dừng hình GF-03
    updateArcFx(dtW); updateTechFx(dtW); arcUpdateCycle(dtW);
    updateResPassive(dt); // nghe thụ động Vạn Âm (mục 6): chỉ ngoài trận, đứng yên, Tĩnh Âm >= 85
    updateAmbScenery(dtW); // đợt cảnh vật map boss: hạt môi trường theo bản đồ (tôn trọng dừng hình như mọi hạt)
    // Mờ chuyển cảnh: out -> chạy callback ở điểm tối nhất -> in.
    if (fade.phase === 'out') {
      fade.t = Math.min(1, fade.t + dt / 0.3);
      if (fade.t >= 1) { fade.phase = 'in'; if (fade.cb) { var fcb = fade.cb; fade.cb = null; fcb(); } }
    } else if (fade.phase === 'in') {
      fade.t = Math.max(0, fade.t - dt / 0.3);
      if (fade.t <= 0) fade.phase = 'idle';
    }
    rings.forEach(function (r) { r.r += dtW * 260; r.a -= dtW * 0.8; });
    floats.forEach(function (f) {
      f.age += dtW;
      if (f.age > f.delay) f.y -= f.rise * dtW;
      f.a = Math.max(0, 1 - Math.max(0, f.age - f.delay) / f.life);
    });
    meditating = false;
    if (!dlg) {
      // Giữ chạm quá ngưỡng thời gian (kể cả không kéo) cũng vào chế độ cần.
      if (joy.state === 'pending' && Date.now() - joy.t0 > L.JOY_STICK_MS) {
        joy.state = 'stick';
        clickPath = null; clickTarget = null; pendingInteract = null; medLatch = false;
        var n0 = L.joyNormalize(joy.cx - joy.sx, joy.cy - joy.sy, JOY_R);
        joy.active = n0.active; joy.ux = n0.ux; joy.uy = n0.uy; joy.speed = n0.speed;
      }
      var sp = 132, dx = 0, dy = 0, smoothDrive = false;
      var manual = false;
      if (keys['arrowleft'] || keys['a']) { dx = -sp; facing = 'left'; manual = true; }
      else if (keys['arrowright'] || keys['d']) { dx = sp; facing = 'right'; manual = true; }
      if (keys['arrowup'] || keys['w']) { dy = -sp; facing = 'up'; manual = true; }
      else if (keys['arrowdown'] || keys['s']) { dy = sp; facing = 'down'; manual = true; }
      if (manual) {
        clickPath = null; clickTarget = null; pendingInteract = null; medLatch = false; questNav = null;
        resetJoy(); // phím di chuyển hủy trạng thái cần ngay
        // ĐỢT LÀM LẠI DI CHUYỂN 2026-11-03 (mục D): chuẩn hóa tốc độ mặt
        // đất — hai trục cùng active thì co mỗi trục theo 1/sqrt(2) để
        // tốc độ chéo đúng 132 px/giây như bấm-đi và cần cảm ứng (bản cũ
        // hai trục độc lập 132 cho tốc độ chéo 179 px/giây, lệch sqrt(2)).
        if (dx !== 0 && dy !== 0) { dx *= Math.SQRT1_2; dy *= Math.SQRT1_2; }
        dir8 = L.dir8FromVector(dx, dy, dir8);
      }
      // Cần cảm ứng: ghi đè đường bấm chuột (đường đã bị hủy ngay khi vào chế độ cần);
      // phím tay vẫn ưu tiên cao nhất. Cùng một đường chọn hướng dir8FromVector.
      if (!manual && joy.state === 'stick') {
        var jn = L.joyNormalize(joy.cx - joy.sx, joy.cy - joy.sy, JOY_R);
        if (SET) jn.speed = Math.min(1.5, jn.speed * SET.current.joySens); // độ nhạy cần (cài đặt)
        joy.active = jn.active; joy.ux = jn.ux; joy.uy = jn.uy; joy.speed = jn.speed;
        if (jn.active) {
          questNav = null; // người chơi cầm cần là hủy tự tìm đường ngay
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
        // Cửa sổ khớp ô đích cuối tính theo tốc độ THẬT (vòng chỉnh cảm
        // giác 2): bản cũ luôn lấy tốc độ tối đa 132 nên ở khung chậm
        // nhân vật có thể "nhảy" tới ~7px vào ô đích ở nhịp cuối; khi đã
        // giảm tốc áp sát đích, cửa sổ thu về ~1-3px nên bước vào ô đích
        // êm như một bước đi thường. Đường thô cứu hộ giữ nguyên cửa sổ cũ.
        var stepSnap = Math.min(stepW, Math.max(1.2, Math.hypot(velX, velY) * dt + 0.6));
        if (isFinalWp && Math.abs(mdx) <= stepSnap && Math.abs(mdy) <= stepSnap) {
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
            /* ĐỢT ĐI NHƯ THẬT 2026-11-04: trong vùng hãm áp sát đích
               cuối (distWp < 78, cùng vùng giảm tốc ở dưới), vector nhắm
               rất ngắn và dao động góc mạnh quanh biên khu vực — ghi
               dir8 theo vector nhắm ở đây làm hàng hiển thị lật qua lại
               từng khung ở cuối chặng chéo nông. Trong vùng này KHÔNG
               ghi dir8 theo nhắm nữa; hướng hiển thị do
               steerDir8Display (bám vận tốc + chờ bền ở tốc chậm) sở
               hữu ở cuối khung. Ngoài vùng hãm giữ nguyên như cũ. */
            if (!(isFinalWp && distWp < 78)) dir8 = L.dir8FromVector(aimX, aimY, dir8);
            var spdWp = sp;
            // Giảm tốc áp sát đích (gói E tăng cường): vùng hãm nới từ
            // 30px lên 78px và sàn tốc hạ xuống 24px/giây — người chơi
            // thật báo "dừng đột ngột đúng điểm chạm" vì vùng hãm cũ chỉ
            // dài chưa tới một ô và bị cửa sổ khớp ô đích nuốt mất; nay
            // nhân vật lướt chậm dần suốt hơn hai ô cuối rồi mới dừng.
            if (isFinalWp && distWp < 78) spdWp = Math.max(24, sp * distWp / 78);
            smoothDrive = true;
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
      // Tự tìm đường làm nhiệm vụ: lập chặng khi không còn đường đi dở
      // (đầu phiên, vừa sang bản đồ mới, hoặc đường cũ vừa kết thúc).
      questNavTick();
      // Rẽ cong khi đi theo đường chạm (gói E tăng cường): vector vận
      // tốc mong muốn được XOAY về hướng mới với tốc độ góc hữu hạn
      // (~430 độ/giây) thay vì lật tức thì — ở góc cua, thân nhân vật đi
      // theo cung tròn ngắn thay vì gãy góc. Chỉ áp cho đường chạm vuốt;
      // phím/cần giữ đáp ứng trực tiếp như cũ.
      if (smoothDrive && clickPath && (dx || dy)) {
        if (tapDesired && (tapDesired.x || tapDesired.y)) {
          var a0 = Math.atan2(tapDesired.y, tapDesired.x), a1 = Math.atan2(dy, dx);
          var da = a1 - a0;
          while (da > Math.PI) da -= Math.PI * 2;
          while (da < -Math.PI) da += Math.PI * 2;
          var maxTurn = 7.5 * dt;
          if (Math.abs(da) > maxTurn) {
            var aN = a0 + (da > 0 ? maxTurn : -maxTurn);
            var magD = Math.hypot(dx, dy);
            dx = Math.cos(aN) * magD; dy = Math.sin(aN) * magD;
          }
        }
        tapDesired = { x: dx, y: dy };
      } else if (!clickPath) tapDesired = null;
      // Quán tính (đợt nóng 2): vận tốc thật tiến về vận tốc mong muốn
      // (dx/dy) với gia tốc hữu hạn — bắt đầu và dừng bước đều có độ dốc
      // ngắn thay vì bật/tắt tức thì. Trục bị tường chặn thì vận tốc trục
      // đó về 0 ngay, trục còn lại vẫn trượt tự do dọc tường. Tốc độ tối
      // đa giữ nguyên như trước (132 px/giây, cần cảm ứng theo độ nhạy).
      // Vòng chỉnh cảm giác 2 (Bui vẫn báo thô cứng sau vòng 1): hạ gia
      // tốc 1500 -> 1150 và giảm tốc 1200 -> 800 — đo harness trước/sau:
      // quãng đi 2 khung đầu 10,4px -> ~8,6px (khởi hành bớt giật), trượt
      // dừng 4,2px -> ~7,8px (dừng êm thay vì khựng), tốc độ tối đa và
      // trễ đổi hướng không đổi đáng kể.
      // Tăng cường gói E: gia tốc 1150 -> 1000, giảm tốc 800 -> 620 để
      // dốc khởi hành/dừng dài ra rõ rệt khi kết hợp vùng hãm đích 78px.
      if (duel) { dx = 0; dy = 0; clickPath = null; clickTarget = null; } // trận tỉ thí kịch bản (gói phụ 7): người chơi đứng xem và tiếp sức, không đi lại giữa trận
      var ACCEL = 1000, DECEL = 620;
      velX = approachVel(velX, dx, dx !== 0 ? ACCEL : DECEL, dt);
      velY = approachVel(velY, dy, dy !== 0 ? ACCEL : DECEL, dt);
      var prevPx = px, prevPy = py;
      if (velX !== 0) { var wantX = velX * dt, gotX = tryMove(wantX, 0); if (Math.abs(gotX) < Math.abs(wantX) - 0.001) velX = 0; }
      if (velY !== 0) { var wantY = velY * dt, gotY = tryMove(0, wantY); if (Math.abs(gotY) < Math.abs(wantY) - 0.001) velY = 0; }
      var speedNow = Math.hypot(velX, velY);
      // ĐỢT LÀM LẠI DI CHUYỂN 2026-11-03 (mục C): hướng HIỂN THỊ bám
      // VẬN TỐC THẬT, không bám vector mong muốn — khi trượt dọc tường
      // hay cắt cua, thân phải quay theo hướng thân đang THẬT SỰ đi,
      // không còn dáng hướng chính trong khi thân trôi chéo (gốc của lỗi
      // "lướt" Bui phán). Ngưỡng 24 px/giây: dưới đó giữ dir8 cũ (gần
      // đứng yên, vận tốc chưa có hướng đáng tin). Các điểm gọi
      // dir8FromVector(dx, dy, ...) ở khâu ra lệnh giữ nguyên để đáp ứng
      // tức thì trong cùng khung; giá trị CUỐI khung (cái được vẽ) là
      // giá trị lái bởi steerDir8Display mỗi khi đang thật sự di chuyển.
      // ĐIỂM 1 (vá live 2026-11-03): khi đang bấm-đi, nếu thân đang đi
      // về phía đích của chặng (lệch <= 67,5°) thì lái theo hướng tới
      // đích — đường vuốt vòng vật cản gồm nhiều đoạn trục/chéo nối
      // nhau, bám vận tốc tức thời làm dáng hướng chính chiếm phần lớn
      // các quãng chéo nông dù cả chặng là chéo; ngoài bấm-đi (phím,
      // cần, trượt tường) vẫn bám vận tốc thật như nguyên tắc cũ. Xem
      // steerDir8Display ở phía trên charSrc.
      if (speedNow > 24) {
        var stDx = velX, stDy = velY;
        if (clickPath && clickPath.length && clickTarget) {
          var tgX = clickTarget.x * TILE - px, tgY = clickTarget.y * TILE - py;
          var tgLen = Math.hypot(tgX, tgY);
          if (tgLen > 40 && (velX * tgX + velY * tgY) / (speedNow * tgLen) > Math.cos(67.5 * Math.PI / 180)) { stDx = tgX; stDy = tgY; }
          // Đợt VÁ LẮC 2026-11-03 (điểm chéo nông, bằng chứng live +
          // tái hiện trace): đường vuốt phải bẻ quanh vật cản/NPC nên
          // bị cắt thành các dây cung lệch hướng cả chặng tới ±10°;
          // ở chéo nông, dây cung bù ở nửa sau chặng vượt biên khu vực
          // 67,5° và vì điểm cuối dây là đích nên CẢ vận tốc lẫn
          // hướng-tới-đích đều nằm trong khu vực hướng chính — lái
          // theo đích vẫn ra dáng ngang. Neo thêm HƯỚNG CẢ CHẶNG
          // (từ gốc chặng clickLegFrom tới đích): khi thân đang thật
          // sự tiến về phía đích dọc theo chặng (vận tốc lệch hướng
          // chặng <= 67,5° và hướng đích hiện tại còn trong 45° quanh
          // hướng chặng) thì lái theo hướng chặng — dáng chéo giữ
          // suốt chặng bất kể dây cung; khi đường bẻ gắt quanh góc
          // (hai cổng đều trượt) thì rơi về lái theo đích/vận tốc
          // như cũ.
          if (clickLegFrom) {
            var lgX = clickTarget.x * TILE - clickLegFrom.x, lgY = clickTarget.y * TILE - clickLegFrom.y;
            var lgLen = Math.hypot(lgX, lgY);
            if (lgLen > 40 && tgLen > 12 &&
                (velX * lgX + velY * lgY) / (speedNow * lgLen) > Math.cos(67.5 * Math.PI / 180) &&
                (tgX * lgX + tgY * lgY) / (tgLen * lgLen) > Math.cos(45 * Math.PI / 180)) { stDx = lgX; stDy = lgY; }
          }
        }
        steerDir8Display(stDx, stDy, dt, speedNow);
      }
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
        // Pha bước theo QUÃNG ĐƯỜNG THẬT đã đi, KHÓA PHA CHÂN–ĐẤT: mỗi
        // khung bước ứng với đúng (sải vẽ của CHÍNH hướng hiện tại / số
        // khung trong một bước) điểm ảnh đã đi — trong thời gian một chân
        // chạm đất, thân đi đúng một sải vẽ nên chân đứng yên so với mặt
        // đất thay vì trượt theo thân. Đổi hướng giữa chừng: ngưỡng tính
        // lại theo hướng mới, bộ tích lũy giữ nguyên. Vì pha bám quãng
        // đường thật nên khóa này giữ nguyên ở mọi hệ số tốc độ (phím
        // 1×, cần cảm ứng tới 1,5×) và trong dốc tăng/giảm tốc.
        // Nhún thân: pha liên tục chạy 0..1 trong một chu kỳ (2 bước);
        // thân hạ tối đa ở hai điểm tiếp đất (pha 0 và 0,5), nâng tối đa ở
        // hai điểm qua giữa (0,25 và 0,75) — cos(4π·pha) cho đúng nhịp đó.
        var distFrame = Math.hypot(px - prevPx, py - prevPy);
        var cyc = walkCycleFrames();
        var thr = stridePerFrame();
        if (stepPhase === 0) { stepPhase = 1; stepAcc = 0; }
        else {
          stepAcc += distFrame;
          while (stepAcc >= thr) { stepAcc -= thr; stepPhase = stepPhase % cyc + 1; }
        }
        var contPhase = ((stepPhase - 1) + stepAcc / thr) / cyc;
        // [KHAI BÁO — đợt sửa walk2 tiếp, tiêu chí chạm đất của Bui 16:13
        // 2026-11-04] Sheet đi bộ hiện tại (2400px, 25 cột) đã NUNG nhún
        // thân vào riêng lớp THÂN trong builder (chân không rời mặt đất),
        // nên nhún engine phải TẮT với sheet này: cộng cả hai thì bàn
        // chân bị nhấc khỏi điểm tiếp đất/bóng chân mỗi nhịp = "lơ
        // lửng". Sheet cũ (khổ nhỏ hơn) vẫn dùng nhún engine như trước.
        // [KHAI BÁO — đợt walk2 sửa tiếp] Hằng số gắn với chính sheet
        // đang giao thay cho phép đo khổ ảnh (không đọc được khổ thật
        // trong harness kiểm thử): sheet đi bộ người chơi hiện tại đã
        // nung nhún nên nhún engine TẮT; đợt nào thay sheet không nung
        // nhún thì đổi hằng số này và khôi phục tiền đề §31B/§31E.
        var PLAYER_BOB_BAKED = true;
        walkBobY = PLAYER_BOB_BAKED ? 0 : ((dir8 === 0 || dir8 === 4) ? BOB_AMP_VERT : BOB_AMP) * Math.cos(4 * Math.PI * contPhase);
        // Tiếng bước chân (đợt sửa walk2 tiếp): phát đúng khung chạm đất
        // — pha 1 và pha 1+nửa chu kỳ, cùng điểm tiếp đất của khóa chân;
        // không phát khi đang bay (flyRiding) vì chân không chạm đất.
        if (stepPhase !== lastStepPhaseSfx) {
          if ((stepPhase - 1) % (cyc / 2) === 0 && !flyRiding()) { sfxStep(stepSurface(), stepAlt); stepAlt = !stepAlt; stepSfxN++; }
          lastStepPhaseSfx = stepPhase;
        }
        walkFrame = stepPhase % 2;
        state.silence = L.silenceGain('walk', dt, state.silence, state);
      } else {
        walkFrame = 0; stepPhase = 0; stepTimer = 0; stepAcc = 0; walkBobY = 0; lastStepPhaseSfx = 0;
        state.silence = L.silenceGain('idle', dt, state.silence, state);
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
        var __tpBefore = (L.techniqueOf(state, 'thanh_phong') || {}).tier;
        L.meditateTick(state, dt);
        var __tpAfter = (L.techniqueOf(state, 'thanh_phong') || {}).tier;
        if (__tpAfter && __tpBefore != null && __tpAfter > __tpBefore) presentTechTierUp('thanh_phong', __tpAfter);
        // Thổ nạp cũng là lúc dưỡng thương (làn chạm trán): ngồi nạp ở
        // điểm linh khí hồi 10% máu tối đa mỗi giây — đường hồi máu duy
        // nhất ngoài đột phá, để vòng săn quái không kẹt ở máu thấp.
        if (state.hp < state.hpMax) { state.hp = Math.min(state.hpMax, state.hp + state.hpMax * 0.10 * dt); }
        // Dưỡng thương bằng đường nghỉ (docs/realm-prep/ mục 6.1): máu
        // hồi ĐẦY ở điểm linh khí thì trọng thương khép lại, tốc độ
        // thổ nạp trở về bình thường.
        if (state.flags.trongThuong && state.hp >= state.hpMax && L.clearTrongThuong(state)) {
          toast('Thương thế do lôi kiếp đã khép hẳn sau khi nghỉ dưỡng — tốc độ thổ nạp trở lại bình thường.', 4200);
        }
        if (state.tuvi !== beforeTuvi && state.quest === 'q_meditate' && state.tuvi >= 100) {
          state.quest = 'q_break'; toast('Tu vi đã đầy! Nhấn phím B để đột phá Luyện Khí tầng 1.');
        }
        // ARCIV ch.16: tĩnh tu hoàn thành khi tu vi đầy giai đoạn TRONG
        // lúc thổ nạp tại điểm linh khí (sau khi đã nghe cảnh TINH_TU).
        if (state.quest === 'q16_tinh_tu' && state.flags.ch16TinhTuSeen && state.tuvi >= (L.REALMS[state.realm].tuviNext || Infinity)) {
          state.quest = 'q16_linh_ngo'; refreshHUD(); saveNow();
          toast('Tu vi đã đầy giai đoạn. Về đại điện gặp trưởng lão — tàng kinh các và tầng sâu Kiếm Trủng đang chờ.', 4600);
        }
        refreshHUD();
      }
      // Làn chạm trán: quái đi lại, trận thật, rơi đồ, tinh tu vi — chạy
      // cùng nhịp thế giới (đóng băng theo dừng hình qua dtW, đứng yên
      // khi thoại mở vì cả khối này nằm trong nhánh !dlg).
      huntUpdate(dt, dtW);
      grindSectTick(dtW); bcTick(dtW);
      updateDuel(dtW); // trận tỉ thí kịch bản (gói phụ 7) — cùng nhịp thế giới, đóng băng theo dừng hình
      if (tlFight) updateTlFight(dtW); // ải Thăng Long thật (gói phụ 13)
      if (hhtFight) updateHhtFight(dtW); // trận tỉ thí Hoa Hướng Thần trên đài (Mục F)
      if (hhtFight && state && state.map === 'dai_dau_kiem') { px = Math.max(HHT_ARENA.x0 * TILE, Math.min(HHT_ARENA.x1 * TILE, px)); py = Math.max(HHT_ARENA.y0 * TILE, Math.min(HHT_ARENA.y1 * TILE, py)); } // Mục F: người chơi không rời bệ đấu giữa trận (khán giả đứng ngoài bệ, không chặn đường)
      if (daiFight) updateDaiFight(dtW); // ARCIV ch.13: trận đài thách đấu
      if (daiFight && state && state.map === 'dai_dau_kiem') { px = Math.max(HHT_ARENA.x0 * TILE, Math.min(HHT_ARENA.x1 * TILE, px)); py = Math.max(HHT_ARENA.y0 * TILE, Math.min(HHT_ARENA.y1 * TILE, py)); } // ARCIV: kẹp bệ đấu như HHT
      if (arcFig) updateArcFig(dtW); // ARCIV ch.14/15: trận kịch bản dã ngoại
      arcBossTick(dtW); // ARCIV ch.16 + boss Hộ Trận: đồng hồ chiêu boss trong trận chạm trán
      checkPortalsAndZones();
    } else {
      // Mở thoại thì hủy đường đi bằng chuột và hủy cần cảm ứng.
      clickPath = null; clickTarget = null; resetJoy();
    }
    updateAtkFigs(dtW); // hình diễn đánh đêm (gói phụ 8): chạy cả khi thoại mở để khớp nhịp lời kể
    updateKdFig(dtW); // hình diễn yêu thú giữ dược chương 11 (boss-fx #21+#22): cùng nhịp, chạy cả khi thoại mở
    // Đồng hồ thế giới: chỉ chạy trong phiên chơi (vòng lặp này), theo tốc
    // độ cài đặt. Chế độ ghim ngày/đêm thì đồng hồ nền TẠM DỪNG (giờ hiển
    // thị bị ghim ở 12:00/00:00) — quay về "Theo chu kỳ" là chạy tiếp từ
    // đúng giờ đã dừng, không nhảy vọt.
    if (!SET || SET.current.dayMode === 'cycle') {
      // Qua hàm bọc của hệ cày: dayCount tăng + rollover ngày chạy cùng
      // lúc đồng hồ qua 0:00 (chu kỳ boss, hồ trần ngày bám vào đây).
      if (L.advanceGrindClock) L.advanceGrindClock(state, dt, SET ? SET.current.daySpeed : 'normal');
      else if (L.advanceDayClock) L.advanceDayClock(state, dt, SET ? SET.current.daySpeed : 'normal');
    }
    musicApplyFrame();
    updateClockHud();
    render();
    // Lớp cảm giác cày chạy theo thời gian thật (không đóng băng):
    if (comboT > 0) { comboT -= dt; if (comboT <= 0) { comboN = 0; } updateComboBox(); }
    if (hurtT > 0) hurtT = Math.max(0, hurtT - dt);
    if (playerHurtT > 0) playerHurtT = Math.max(0, playerHurtT - dt);
    if (bossPillar) { bossPillar.t -= dt; if (bossPillar.t <= 0) bossPillar = null; }
    // "Máu ma": vệt máu rút về mức thật trong 500ms sau mỗi lần mất máu.
    if (state) {
      if (ghostHp < 0) ghostHp = state.hp;
      if (ghostHp > state.hp) { ghostHp = Math.max(state.hp, ghostHp - state.hpMax * dt / 0.5); setGhostBar(); }
      else if (ghostHp < state.hp) { ghostHp = state.hp; setGhostBar(); }
      // Máu thấp (<= 25%): tiếng tích cảnh báo mỗi 2 giây (nhóm ui).
      if (state.hp > 0 && state.hp <= state.hpMax * 0.25 && !dlg) {
        lowHpWarnT -= dt;
        if (lowHpWarnT <= 0) { lowHpWarnT = 2; beep(1174, 0.05, 'sine', 0.015, 'ui'); }
      }
    }
    // Tổng kết phiên săn: KHÔNG còn tự đóng theo thời gian di chuyển
    // (vá đợt 2026-11-02, Mục A). Luật cũ ẩn bảng sau 3 giây đi bộ hoặc
    // 12 giây tuyệt đối — đúng đường người chơi thật vẫn làm (qua cổng
    // về thành rồi ĐI TIẾP) là bảng biến mất sau ~3 giây, trước cả khi
    // kịp đọc, nên trên live bảng "không xuất hiện". Nay bảng chỉ ẩn
    // khi người chơi chạm vào để đóng, hoặc sau 30 giây tuyệt đối;
    // di chuyển không còn tính vào thời gian ẩn.
    if (summaryShownAt > 0 && Date.now() - summaryShownAt > 30000) hideHuntSummary();
    saveTimer += dt;
    // Tự động lưu theo cài đặt (tắt, hoặc khoảng 5/15/30/60 giây); không có
    // module cài đặt thì giữ nhịp cũ 5 giây.
    var autoSaveOn = !SET || SET.current.autoSave;
    if (autoSaveOn && saveTimer > (SET ? SET.current.autoSaveSec : 5)) { saveTimer = 0; saveNow(); refreshHUD(); }
  }
  /* ---------- Cổng bản đồ + vùng sự kiện chương 2 ---------- */
  var portalToastAt = 0;
  function switchMap(po) {
    var prevMap = state ? state.map : null;
    fadeTransition(function () {
      if (prevMap && prevMap.indexOf('bc_') === 0) { if (bcSession && bcSession.realm === prevMap) { bcSession = null; if (!PARTY_REALMS[po.to]) { partyBotsLive = []; bcTelegraphs = []; } } bcColorSort = null; if (L.clearSessionHiddenProps) L.clearSessionHiddenProps(prevMap); } // rời bí cảnh: hủy phiên + xóa vật thể đã mở của bản đồ đó (bot Trận Tâm giữ qua lại hai tầng nên chỉ dọn khi đích không thuộc hai tầng)
      // Tổ ghép Trận Tâm: rời hẳn di tích (đích không thuộc hai tầng)
      // thì tổ tự giải tán; qua lại giữa hai tầng thì bot theo sang.
      if (prevMap && PARTY_REALMS[prevMap] && !PARTY_REALMS[po.to] && state.party && (state.party.bots || []).length) {
        if (L.partyClearBots) L.partyClearBots(state);
        partyBotsLive = []; bcTelegraphs = [];
        toast('Rời di tích — tổ đội ghép đã tự giải tán.', 3600);
      }
      state.map = po.to; state.x = po.toX; state.y = po.toY;
      // Vừa đặt chân lên tông mà save còn dừng ở cuối chương 6 thì nâng
      // nhiệm vụ ngay trong cùng phiên (di trú lúc nạp vẫn giữ cho save cũ).
      if (po.to === 'thanh_van_tong' && state.quest === 'q6_done') state.quest = 'q7_nhap_tong';
      // ARCIV đợt 3: vừa đặt chân lên đường mòn mà save còn dừng ở mốc
      // cuối chương 22 (marker q22_done do arcDoHauKyBreak đặt) thì nâng
      // nhiệm vụ sang bước hộ tống chương 23 ngay trong cùng phiên —
      // đúng tiền lệ q6_done ở trên (di trú lúc nạp vẫn là đường cho
      // save cũ ở các mốc cuối cung).
      if (po.to === 'duong_mon' && state.quest === 'q22_done') state.quest = 'q23_ho_tong';
      state.dir = po.to === 'tran' ? 'up' : 'down';
      L.setActiveMap(po.to);
      px = po.toX * TILE; py = po.toY * TILE; facing = state.dir;
      dir8 = DIR8_ROW4[facing] || 0; stepPhase = 0; stepTimer = 0; stepAcc = 0;
      npcsLive = L.activeMap().npcs.map(function (n) { var pp = L.npcPosFor(state, n); return { id: n.id, name: n.name, look: n.look, x: pp.x, y: pp.y, dir: pp.dir }; }); // vị trí theo pha nhiệm vụ (gói phụ 5)
      spawnMonstersForMap();
      if (prevMap && PARTY_REALMS[prevMap] && PARTY_REALMS[po.to] && partyBotsLive.length) partyPlaceBotsNearPlayer(); // bot giữ qua lại giữa hai tầng Trận Tâm
      if (!isHuntMap(po.to)) maybeShowHuntSummary(); // rời hẳn vùng săn: chốt phiên săn trong bộ nhớ
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
    if (hhtFight) return; // Mục F: đang tỉ thí trên đài — cổng ra khóa cho tới khi trận khép (thắng/thua đều có đường ra riêng)
    if (daiFight || arcFig) return; // ARCIV: đang trong trận kịch bản — cổng/vùng khóa cho tới khi trận khép
    arcIvMaybeInjectWitness(); // ARCIV q14: tiêm nhân chứng giữ đất theo pha (hàm tự kiểm điều kiện + chống trùng)
    arcIvMaybeInjectWave2(); // ARCIV đợt 2 (ch.17–20): tiêm NPC theo quest/cờ + gỡ khi điều kiện hết
    arcIvMaybeInjectWave3(); // ARCIV đợt 3 (ch.21–24): tiêm NPC theo quest + gỡ khi điều kiện hết
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
    // Điểm ổ boss dã ngoại (làn chạm trán): boss chưa hạ được/đã hạ rồi
    // thì đứng gần ổ sẽ nghe câu dẫn — số ngày đọc thẳng từ bossStatus,
    // lớp hiển thị không tự tính chu kỳ.
    for (var bidL in L.BOSS_DEFS) {
      var bdL = L.BOSS_DEFS[bidL];
      if (bdL.map !== state.map) continue;
      if (Math.abs(pt.x - bdL.lair.x) + Math.abs(pt.y - bdL.lair.y) <= 1 && Date.now() - lairToastAt > 5000) {
        var bstL = L.bossStatus(state, bidL);
        if (bstL.state === 'claimed') {
          lairToastAt = Date.now();
          toast('Dấu vết trận đấu còn mới — khí tức của ' + bdL.name + ' cần khoảng ' + bstL.daysLeft + ' ngày game nữa mới tụ lại thành hình.', 4600);
        } else if (bstL.state === 'locked') {
          lairToastAt = Date.now();
          toast('Nơi này vương khí tức của một con thú rất lớn — chưa phải lúc đối mặt với nó.', 4200);
        }
      }
    }
    if (state.map === 'co_chau' && state.quest === 'q6_sinh_le' && !state.flags.dowrySeen && pt.x >= 4 && pt.x <= 30 && pt.y >= 29 && pt.y <= 42) {
      // Cờ Seen chỉ đặt KHI CẢNH CHẠY XONG (trong callback bên dưới): đặt
      // trước khi cảnh chạy khiến thoát/tải lại giữa cảnh làm cờ đã lưu
      // mà nhiệm vụ chưa tiến — cảnh không bao giờ nổ lại, kẹt vĩnh viễn.
      say(ST.SCENE_DOWRY, function () {
        state.flags.dowrySeen = true; // đoàn sính lễ của Chu Kiến Thâm vào sân phủ Hứa
        var cap = L.REALMS[state.realm].tuviNext;
        if (cap) state.tuvi = cap;
        state.quest = 'q6_phong_thu'; refreshHUD(); saveNow();
      });
      return;
    }
    if (state.map === 'co_chau' && state.quest === 'q4_thien_co' && !state.flags.thienCoSeen && pt.x >= 4 && pt.x <= 30 && pt.y >= 29 && pt.y <= 42) {
      say(ST.SCENE_THIENCO, function () {
        state.flags.thienCoSeen = true; // sứ giả Thiên Cơ Các tới sân phủ Hứa
        var cap = L.REALMS[state.realm].tuviNext;
        if (cap) state.tuvi = cap;
        state.quest = 'q4_vu_cao'; refreshHUD(); saveNow();
      });
      return;
    }
    if (state.map === 'kiem_trac_thap' && state.quest === 'q3_hang_cho' && !state.flags.queueSeen) {
      // Sự kiện xếp hàng nổ ngay khi bước vào khuôn viên tháp; cờ Seen đặt
      // trong callback hoàn thành cảnh (xem ghi chú ở cảnh sính lễ phía trên).
      say(ST.SCENE_QUEUE, function () { state.flags.queueSeen = true; state.quest = 'q3_thuoc_do'; refreshHUD(); saveNow(); });
      return;
    }
    if (state.map === 'hb_valley' && state.quest === 'q9_truy_vet' && !state.flags.ch9PlanSeen) {
      // Cảnh cắt song song: U Nhàn tự bày thế trong thung lũng — chiếu khi
      // người chơi vừa đặt chân vào thung lũng (cờ Seen đặt trong callback).
      say(ST.SCENE_CH9_UNHAN_PLAN, function () { state.flags.ch9PlanSeen = true; refreshHUD(); saveNow(); });
      return;
    }
    if (state.map === 'hb_valley' && state.quest === 'q9_phuc_kich' && pt.x >= 46 && pt.x <= 53 && pt.y >= 33 && pt.y <= 39) {
      // Điểm phục kích giữa hẻm núi: bước vào vùng là sự kiện nổ ra (điểm
      // lựa chọn trung tâm của chương 9 nằm trong cảnh này).
      startCh9Ambush();
      return;
    }
    if (state.map === 'co_chau' && state.quest === 'q10_lo_than_phan' && state.flags.ch10RumorPending && !state.flags.ch10BreakReady) {
      // Chương 10, đường B (giữ im lặng ở lầu): tin đồn về Hồn Sư nổ ra ở
      // chợ khi người chơi quay lại thành — thân phận bị kẻ khác lộ thay.
      state.flags.ch10RumorPending = false;
      say(ST.SCENE_CH10_BI_LO_2, function () {
        state.flags.soulExposed = true;
        state.flags.soulRevealed = true;
        state.soulRank = 3;
        state.soulPower = (state.soulPower || 0) + 30;
        addTuvi(120);
        state.flags.ch10BreakReady = true;
        refreshHUD(); saveNow();
        toast('Sự thật đã bị kẻ khác tung ra theo cách xấu nhất. Tu vi còn thiếu một đoạn cuối — thổ nạp ở sân sau Tĩnh Quan Lâu, rồi gặp lại Bạch Kính Đường để khép việc ở lầu.', 5200);
      });
      return;
    }
    if (state.map === 'kiem_trac_thap' && !state.flags.bcTapsauInviteSeen && L.questReached(state, 'q8_done')) {
      // Thư mời tầng sâu: vào tháp lần đầu sau Trúc Cơ (cờ đặt trong callback).
      say(ST.SCENE_BC_TAPSAU_INVITE, function () { state.flags.bcTapsauInviteSeen = true; refreshHUD(); saveNow(); });
      return;
    }
    /* ---------- ARCIV đợt 1b: trigger vùng chương 13–16 (mục A.1) ---------- */
    if (state.map === 'thanh_van_tong' && state.quest === 'q13_thinh_cau_dau' && !state.flags.ch13GateSeen && Math.abs(pt.x - 61) <= 1 && Math.abs(pt.y - 88) <= 1) {
      // Người đưa tin đứng đợi ở cổng tông (61,88) — neo theo hợp đồng;
      // NPC tin_su thường trú ở đại điện nên điểm chạm là trigger vùng.
      say(ST.SCENE_CH13_THINH_CAU, function () {
        state.flags.ch13GateSeen = true;
        state.quest = 'q13_ve_thanh'; refreshHUD(); saveNow();
        toast('Thư từ chối đã viết xong. Về Cô Châu Thành gặp Hứa U Nhàn ở phủ Hứa.', 4200);
      });
      return;
    }
    if (state.map === 'co_chau' && state.quest === 'q14_dieu_tra' && !state.flags.q14SoDat && Math.abs(pt.x - 26) <= 1 && Math.abs(pt.y - 39) <= 1) {
      // Sổ đất: neo tại ô hint (26,39) — phòng lưu sổ của phủ thành
      // (NPC dan_thanh_a đứng ở (49,28), không phải điểm này).
      say(ST.SCENE_CH14_SO_DAT, function () {
        state.flags.q14SoDat = true; refreshHUD(); saveNow();
        toast('Sổ mới là giả. Ra đường mòn hỏi lão giữ đất ở hiện trường phía đông (gần điểm đất linh 47,38).', 4600);
      });
      return;
    }
    if (state.map === 'duong_mon' && state.quest === 'q15_bao_dong' && !state.flags.ch15BaoDongSeen && Math.abs(pt.x - 47) <= 1 && Math.abs(pt.y - 38) <= 1) {
      // Điểm hẹn (47,38): cảnh báo động chạy tại điểm hẹn rồi dẫn thẳng
      // vào trận cứu đoàn tại chỗ (xem ghi chú lệch neo ở hợp đồng mục G).
      say(ST.SCENE_CH15_BAO_DONG, function () {
        state.flags.ch15BaoDongSeen = true;
        state.quest = 'q15_cuu_doan'; refreshHUD(); saveNow();
        say(ST.SCENE_CH15_CUU_DOAN, function () { arcStartCh15Rescue(); });
      });
      return;
    }
    if (state.map === 'duong_mon' && state.quest === 'q15_truy_duoi' && !state.flags.ch15ChaseSeen && Math.abs(pt.x - 45) <= 2 && Math.abs(pt.y - 50) <= 2) {
      say(ST.SCENE_CH15_TRUY_DUOI, function () {
        state.flags.ch15ChaseSeen = true; refreshHUD(); saveNow();
        arcStartCh15Chase(1);
      });
      return;
    }
    if (state.map === 'duong_mon' && state.quest === 'q15_cuu_doan' && state.flags.ch15BaoDongSeen && !arcFig && Math.abs(pt.x - 47) <= 1 && Math.abs(pt.y - 38) <= 1) {
      // Vào lại trận cứu đoàn sau khi thua (arcFigLose giữ nguyên nhiệm
      // vụ): tới điểm vây là cảnh CUU_DOAN chạy lại rồi mở trận.
      say(ST.SCENE_CH15_CUU_DOAN, function () { arcStartCh15Rescue(); });
      return;
    }
    if (state.map === 'duong_mon' && state.quest === 'q15_truy_duoi' && state.flags.ch15ChaseSeen && !state.flags.ch15ChaseDone && !arcFig && Math.abs(pt.x - 45) <= 2 && Math.abs(pt.y - 50) <= 2) {
      // Vào lại truy đuổi sau khi thua ở một chốt chặn: đánh lại từ chốt 1.
      arcStartCh15Chase(1);
      return;
    }
    if (state.map === 'bc_kiemtrung_sau' && state.quest === 'q16_linh_ngo' && !state.flags.ch16KiemTrungSeen && pt.y <= 10 && pt.x >= 14 && pt.x <= 29) {
      // Lần đầu bước vào phòng boss tầng sâu trong mạch truyện ch.16.
      say(ST.SCENE_CH16_KIEMTRUNG, function () { state.flags.ch16KiemTrungSeen = true; refreshHUD(); saveNow(); });
      return;
    }
    /* ---------- ARCIV đợt 2: trigger vùng chương 19–20 (B.5) ---------- */
    if (state.map === 'co_chau' && state.quest === 'q19_phan_ung' && !state.flags.ch19AmbushStarted && pt.x >= 49 && pt.x <= 53 && pt.y >= 62 && pt.y <= 66) {
      // Phục kích phố nam: cờ đặt TRƯỚC khi cảnh mở (cảnh/trận không bị
      // kích lại giữa chừng); thua trận thì onLose của trận gỡ cờ này
      // để người chơi vào vùng là đánh lại được.
      state.flags.ch19AmbushStarted = true; refreshHUD(); saveNow();
      say(ST.SCENE_CH19_PHUC_KICH_MO, function () { arcStartCh19Ambush(); });
      return;
    }
    if (state.map === 'co_chau' && state.quest === 'q19_vet_ran' && !state.flags.ch19GateDone && pt.x >= 49 && pt.x <= 53 && pt.y >= 72 && pt.y <= 75) {
      // Cổng nam: lớp tuyên quy tắc (TUYEN_QUY_TAC) neo làm cảnh mở đầu
      // của q19_vet_ran theo ghi chú sản xuất chương 19 — rồi VET_RAN.
      state.flags.ch19GateDone = true; refreshHUD(); saveNow();
      say(ST.SCENE_CH19_TUYEN_QUY_TAC, function () {
        say(ST.SCENE_CH19_VET_RAN, function () {
          state.quest = 'q19_an_dinh'; refreshHUD(); saveNow();
          toast('Đã thấy dấu hiệu đáng ngờ ở cổng nam. Về Thanh Vân Đại Điện báo cáo trưởng lão tông.', 4600);
        });
      });
      return;
    }
    /* ---------- ARCIV đợt 3: trigger vùng chương 21–24 (B.5) ---------- */
    if (state.map === 'co_chau' && state.quest === 'q21_doi_chat' && !state.flags.ch21GateStarted && pt.x >= 49 && pt.x <= 53 && pt.y >= 72 && pt.y <= 75) {
      // Đối chất ở cổng nam: cờ đặt TRƯỚC cảnh (thua trận thì onLose của
      // trận gỡ cờ để kích hoạt lại); cảnh phủ là cảnh cắt song song —
      // người chơi không có mặt ở phủ, đúng kịch bản prep.
      state.flags.ch21GateStarted = true; refreshHUD(); saveNow();
      say(ST.SCENE_CH21_DOI_CHAT_PHU, function () { arcStartCh21GateA(); });
      return;
    }
    if (state.map === 'duong_mon' && state.quest === 'q22_tham_bao' && !state.flags.ch22ScoutStarted && pt.x >= 41 && pt.x <= 47 && pt.y >= 41 && pt.y <= 47) {
      // Thám báo ở vành tuyến: vào vùng là mở trận luôn, không cảnh mở
      // (SCENE_CH22_THAM_BAO đã chạy ở đại điện).
      state.flags.ch22ScoutStarted = true; refreshHUD(); saveNow();
      arcStartCh22Scout();
      return;
    }
    if (state.map === 'duong_mon' && state.quest === 'q23_ho_tong' && !state.flags.ch23MarchDone && pt.x >= 50 && pt.x <= 56 && pt.y >= 21 && pt.y <= 27) {
      state.flags.ch23MarchDone = true; refreshHUD(); saveNow();
      say(ST.SCENE_CH23_HO_TONG, function () {
        state.quest = 'q23_vong_vay'; refreshHUD(); saveNow();
        toast('Đoàn rời trạm nghỉ, đi vào đoạn hai vách — qua đoạn đường giữa hai vách đá quanh (44,44) là thoát đoạn khó nhất.', 4600);
      });
      return;
    }
    if (state.map === 'duong_mon' && state.quest === 'q23_vong_vay' && !state.flags.ch23FightStarted && pt.x >= 41 && pt.x <= 47 && pt.y >= 41 && pt.y <= 47) {
      // Vòng vây khép: cộng hưởng khóa TRƯỚC chặng 1, đặt cùng lúc cảnh
      // mở khép (B.6c); thua chặng nào onLose của chặng đó cũng tắt cờ.
      state.flags.ch23FightStarted = true;
      state.flags.arcResLocked = true;
      refreshHUD(); saveNow();
      say(ST.SCENE_CH23_VONG_VAY_MO, function () { arcStartCh23EncircleA(); });
      return;
    }
    if (state.map === 'duong_mon' && state.quest === 'q23_vong_vay' && state.flags.ch23FightBRetry && pt.x >= 41 && pt.x <= 47 && pt.y >= 41 && pt.y <= 47) {
      // Thua chặng 2: vào lại THẲNG chặng 2 qua cùng trigger vùng (cờ
      // riêng ch23FightBRetry do onLose của chặng 2 đặt) — không chạy
      // lại cảnh/chặng 1, khóa cộng hưởng bật lại như đầu chặng 2.
      state.flags.ch23FightBRetry = false;
      state.flags.arcResLocked = true;
      refreshHUD(); saveNow();
      toast('Vòng vây chưa vỡ — quay lại đoạn hai vách đánh tiếp đợt dồn giữa đoàn.', 4200);
      arcStartCh23EncircleB();
      return;
    }
    if (state.map === 'co_chau' && state.quest === 'q20_giam_sat' && !state.flags.q20WatchersSeen && pt.x >= 49 && pt.x <= 53 && pt.y >= 71 && pt.y <= 75) {
      // Bị theo dõi: cờ bật -> người theo dõi Thiên Cơ Các xuất hiện ở
      // thành + tông (tiêm B.2) cho tới khi lời đáp khép chương 20.
      state.flags.q20WatchersSeen = true; refreshHUD(); saveNow();
      say(ST.SCENE_CH20_GIAM_SAT, function () {
        state.quest = 'q20_doi_sach'; refreshHUD(); saveNow();
        toast('Người của các đã lộ diện theo dõi. Về Thanh Vân Tông — ở đại điện đang có một ca hồn cần ngươi, rồi mới tính lời đáp.', 4600);
      });
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
  // thêm SEG_FREE_PAD px mỗi phía: nhịp vuốt chỉ được nhận khi còn dư
  // khoảng hở, để lúc bám đoạn (bám đuổi thuần túy, luôn có sai lệch vài
  // px) nhân vật không cọ vào góc vật thể rồi kẹt trong túi góc như ca
  // cổng Thiên Cơ Các ở chương 5 (đứng chết một chỗ dù đích còn xa).
  // ĐỢT LÀM LẠI DI CHUYỂN 2026-11-03 (mục B): pad cũ 3px bị hiệu chỉnh
  // lại BẰNG DỮ LIỆU pin tuyến (tools/work/battery-move.js, quét
  // 0/1/2/3 trên cây ổn định; bảng đầy đủ ở ~/workspace/.verify-logs/
  // movement-rework/pad-sweep-stable.txt + báo cáo làn engine):
  // PAD CHỐT = 0 — pad LỚN NHẤT (và duy nhất) mà cả 4 quãng chéo trống
  // đều đạt >= 90% vận tốc chéo thật VÀ >= 90% hàng hình chéo (98/98,
  // 98/98, 100/100, 100/100), đồng thời mọi tuyến chật lịch sử (cổng
  // Thiên Cơ Các chương 5, các cổng bản đồ, cửa sảnh tháp) và tuyến
  // tương tác/tự tìm đường đều tới đúng ô, kẹt tối đa 0,00 giây. Pad
  // >= 1 làm quãng đông-bắc đường mòn rớt còn 88%/83% vì nhịp vuốt
  // thẳng qua góc cây (12,6) bị loại, đường vuốt phải giữ vòng trục
  // chính của findPath. Pad 0 = ĐÚNG mô hình va chạm thật lúc di
  // chuyển (tryMove cũng dùng hộp chân pad 0): segmentFree không còn
  // nghiêm hơn chính bước đi; kỷ luật góc vẫn do luật chặn cắt góc
  // của findPath + hộp chân khi trượt + cứu kẹt 0,45s/0,9s giữ.
  // Tay nắm VSLC_MOVE.segPad còn lại cho pin tuyến tái quét khi bản
  // đồ thay đổi.
  var SEG_FREE_PAD = 0;
  function segmentFree(x0, y0, x1, y1) {
    var dist = Math.hypot(x1 - x0, y1 - y0);
    var steps = Math.max(1, Math.ceil(dist / 8));
    for (var i = 1; i <= steps; i++) {
      var t = i / steps;
      if (!footBoxFreePad(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, SEG_FREE_PAD)) return false;
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
      // Đợt VÁ LẮC 2026-11-03 (điểm chéo nông live): cửa sổ ngắm vuốt
      // TRƯỚC ĐÂY capped 11 ô — điểm cầu thang ở ô thứ 11 lệch đường
      // thẳng cả chặng tới ±10° (đầu chặng nặng chéo, đuôi chặng nặng
      // trục), nên các chặng chéo nông ~27° bị cắt thành hai dây cung
      // 52° rồi 71,6°: dây 71,6° vượt biên khu vực 67,5° làm dáng hướng
      // chính chiếm nửa sau chặng dù đo harness sân trống từng đạt.
      // Nay ngắm tới điểm xa nhất THẬT SỰ nhìn thấy được trên toàn
      // đường (segmentFree vẫn gác từng nhịp như cũ): sân trống còn
      // đúng một dây cung thẳng tới đích, hướng dây = hướng cả chặng.
      var last = path.length - 1, pick = i;
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
    // Ải Thăng Long thật (gói phụ 13): phím được ánh xạ lại trong trận —
    // cách/E = Thất Tinh Bộ lướt; 3 = kiếm (giữ để phong ngự hiệp 2, bấm
    // để đối chém hiệp 3); mọi phím cộng hưởng (1/2/4/5) = phát hưởng → đặt
    // lại ải theo luật đài.
    if (tlFight && !dlg) {
      if (k === ' ' || k === 'e') { tlDash(); e.preventDefault(); return; }
      if (k === '3') { tlSwordHeld = true; tlSwordHeldUntil = 0; tlSwordPress(); return; }
      if (k === '1' || k === '2' || k === '4' || k === '5') { tlVoiceReset(); return; }
    }
    if (k === 'e' || k === ' ') { cancelQuestNav(); interact(); }
    else if (dlg && dlg.who === 'choice' && (k === '1' || k === '2' || k === '3' || k === '4')) {
      var idx = parseInt(k, 10) - 1;
      if (dlg.options[idx]) chooseOption(dlg.options[idx].action);
    }
    else if (k === '1') castPha();
    else if (k === '2') castChan();
    else if (k === '3' || k === 'j') castSword(); // Mục G: J là phím phụ của nút ĐÁNH (tâm vòng cung); phím 3 giữ nguyên
    else if (k === '4') castDinh();
    else if (k === '5') castPhong();
    else if (k === 'b') doBreakthrough();
    else if (k === 'r') quickEatFood(); // nút Đồ Ăn (đợt 2026-11-04): ăn nhanh món hợp nhất trong túi
    else if (k === 'i') { var bp2 = $('bag-panel'); if (bp2 && !bp2.classList.contains('hidden')) closeBag(); else openBag(); }
  });
  document.addEventListener('keyup', function (e) { keys[e.key.toLowerCase()] = false; if (e.key === '3') tlSwordHeld = false; });
  /* ===== ĐỢT CẢM ỨNG ĐIỆN THOẠI 2026-11-04 (lệnh Bui 06:28) =====
     Gốc lỗi "khi đánh phải ấn 2 cái": toàn bộ nút trên màn hình game chỉ
     nghe sự kiện 'click'. Trên trình duyệt di động, click bị giữ lại để
     chờ phân biệt chạm đúp (phóng to trang) nên nhịp chạm đầu tiên bị
     nuốt; ấn cái thứ hai mới ăn. onTap là hàm trợ giúp DÙNG CHUNG: gắn
     'pointerdown' để hành động chạy NGAY khi ngón chạm xuống, đồng thời
     giữ đường 'click' cho chuột máy tính, phím Enter/Space trên nút đang
     focus và harness kiểm thử. Khóa chống chạy hai lần: sau một
     pointerdown đã chạy, click nối tiếp của chính chạm đó (bắn ngay sau
     pointerup) bị bỏ qua trong cửa sổ 500ms kể từ pointerdown, được làm
     mới ở pointerup/pointercancel để cả chạm giữ lâu cũng không chạy
     hai lần; click đơn độc (không pointerdown đi trước) vẫn chạy đúng
     một lần. Chạm nhanh liên tiếp không bị khóa vì mỗi pointerdown đều
     chạy ngay. Chuột phải (button khác 0) không kích hoạt. */
  function onTap(el, fn) {
    if (!el) return;
    var suppressClickUntil = 0;
    el.addEventListener('pointerdown', function (e) {
      if (e && e.pointerType === 'mouse' && typeof e.button === 'number' && e.button !== 0) return;
      suppressClickUntil = Date.now() + 500;
      fn();
    });
    el.addEventListener('pointerup', function () { suppressClickUntil = Date.now() + 500; });
    el.addEventListener('pointercancel', function () { suppressClickUntil = Date.now() + 500; });
    el.addEventListener('click', function () {
      if (Date.now() < suppressClickUntil) return;
      fn();
    });
  }
  /* iOS Safari: chặn sự kiện cử chỉ riêng của iOS (gesturestart /
     gesturechange) để trang không phóng to bằng chụm hai ngón trên màn
     hình game. Chụm phóng to CAMERA bản đồ trong game đi qua pointer
     trên canvas (mục zoom riêng) — không phải sự kiện này, giữ nguyên. */
  document.addEventListener('gesturestart', function (e) { e.preventDefault(); });
  document.addEventListener('gesturechange', function (e) { e.preventDefault(); });
  onTap($('dialogue'), function () { if (dlgTypeFinish()) return; if (dlg && dlg.who !== 'choice') nextLine(); });
  onTap($('btn-save'), function () {
    if (saveNow()) toast('Đã lưu tiến trình.');
    else toast('Chưa lưu được: tiến trình mới hơn đang ở một phiên chơi khác — hãy tải lại trang để chơi tiếp từ bản mới nhất.', 4600);
  });
  var settingsBtnEl = $('btn-settings');
  if (settingsBtnEl && SET && SET.openPanel) onTap(settingsBtnEl, function () { SET.openPanel(); });
  var questToggleEl = $('quest-toggle');
  if (questToggleEl) onTap(questToggleEl, function () { questMinimized = true; applyQuestMin(); });
  var questTabEl = $('quest-tab');
  if (questTabEl) onTap(questTabEl, function () {
    questMinimized = false; applyQuestMin();
    questTabEl.classList.remove('pulse');
    if (lastQuestId) seenQuestIds[lastQuestId] = true;
    if (state && state.quest) seenQuestIds[state.quest] = true;
  });
  // Tự tìm đường làm nhiệm vụ: nút riêng trong ô nhiệm vụ, và bấm thẳng
  // vào tên/mô tả nhiệm vụ cũng bắt đầu (đúng hai cách Bui mô tả).
  var questNavBtn = $('quest-nav-btn');
  if (questNavBtn) onTap(questNavBtn, function () { startQuestNav(); });
  ['hud-quest-name', 'hud-quest-desc'].forEach(function (qid) {
    var qel = $(qid);
    if (qel) onTap(qel, function () { startQuestNav(); });
  });
  var toastMinEl = $('toast-min');
  if (toastMinEl) onTap(toastMinEl, function () {
    toastMinimized = true;
    try { localStorage.setItem('vslc_toast_min', '1'); } catch (e) {}
    var t = $('toast'); if (t) t.classList.add('hidden');
    clearTimeout(toast._h);
    if (lastToastMsg) { toastUnread += 1; }
    updateToastTab();
  });
  var toastTabEl = $('toast-tab');
  if (toastTabEl) onTap(toastTabEl, function () {
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
    cancelQuestNav(); // chạm mới là lệnh tay — hủy tự tìm đường
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
    if (path && path.length) { clickPath = smoothPath(path); clickTarget = dest; clickLegFrom = { x: px, y: py }; medLatch = false; clickPathRaw = false; clickSegAnchor = { x: px, y: py }; }
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
    if (pinch.active) return;
    if (e.touches.length >= 2) {
      // ĐƯỜNG DỰ PHÒNG cho môi trường không bắn sự kiện con trỏ cho cảm
      // ứng (một số webview nhúng): ở đó sổ con trỏ chụm không bao giờ có
      // dữ liệu nên cử chỉ chụm chết hẳn — đúng triệu chứng "chụm vẫn lỗi"
      // Bui báo 19:17 ngày 2026-11-01. Cổng mở rất hẹp: chỉ khi đường con
      // trỏ CÂM LẶNG hẳn (không một pointerdown cảm ứng nào trong 1,5
      // giây qua) mới cho đường chạm tiếp quản; trình duyệt có sự kiện
      // con trỏ luôn bắn pointerdown ngay trước touchstart nên cổng này
      // không bao giờ mở ở đó — hai đường không tranh chấp.
      if (Date.now() - pinchPtrSeenAt > 1500 && state && !dlg) {
        var rectF = cv.getBoundingClientRect();
        pinch.fallback = true;
        pinch.pointers = {};
        for (var ti = 0; ti < 2; ti++) {
          var tt0 = e.touches[ti];
          pinch.pointers['touch' + (tt0.identifier != null ? tt0.identifier : ti)] = { x: tt0.clientX - rectF.left, y: tt0.clientY - rectF.top };
        }
        pinchStartIfReady();
      }
      return;
    }
    if (tapSuppressed()) return;
    handleCanvasPoint(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: false });
  /* Đường chụm dự phòng (tiếp nối touchstart ở trên): kéo và nhấc ngón qua
     sự kiện chạm thuần khi đường con trỏ vắng mặt. Nhấc ngón KHÔNG sinh
     bất kỳ lệnh chạm nào — chỉ đóng cử chỉ và dựng cửa sổ nuốt sự kiện
     tổng hợp nối tiếp, đúng như đường con trỏ. */
  cv.addEventListener('touchmove', function (e) {
    if (!pinch.fallback || !pinch.active || !e.touches) return;
    e.preventDefault();
    var rectM = cv.getBoundingClientRect();
    for (var tm = 0; tm < e.touches.length; tm++) {
      var ttM = e.touches[tm];
      var idM = 'touch' + (ttM.identifier != null ? ttM.identifier : tm);
      if (pinch.pointers[idM]) pinch.pointers[idM] = { x: ttM.clientX - rectM.left, y: ttM.clientY - rectM.top };
    }
    var idsM = Object.keys(pinch.pointers);
    if (idsM.length !== 2) return;
    var aM = pinch.pointers[idsM[0]], bM = pinch.pointers[idsM[1]];
    var midM = pinchMidpoint(aM.x, aM.y, bM.x, bM.y);
    pinch.midX = midM.x; pinch.midY = midM.y;
    if (zoomEnabled()) zoomTarget = pinchTargetZoom(pinch.startZoom, pinch.startDist, pinchDistance(aM.x, aM.y, bM.x, bM.y));
  }, { passive: false });
  function pinchTouchEnd() {
    if (!pinch.fallback) return;
    pinch.fallback = false;
    pinch.pointers = {};
    if (pinch.active) {
      pinch.active = false; pinch.anchorWorld = null;
      pinchSuppressUntil = Date.now() + 700;
      suppressTapUntil = Date.now() + 700;
      resetJoy();
    }
  }
  cv.addEventListener('touchend', pinchTouchEnd);
  cv.addEventListener('touchcancel', pinchTouchEnd);
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
    // Khoảng cách bắt đầu có sàn 30px: hai ngón chạm gần như cùng một điểm
    // mà không có sàn thì tỉ lệ khoảng cách bùng nổ ngay nhịp kéo đầu và
    // hệ số phóng nhảy thẳng lên trần — cảm giác "chụm lỗi" dù toán đúng.
    pinch.startDist = Math.max(30, pinchDistance(a.x, a.y, b.x, b.y));
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
    if (e.pointerType === 'touch') pinchPtrSeenAt = Date.now();
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
  // ĐỢT CẢM ỨNG ĐIỆN THOẠI 2026-11-04: toàn bộ cụm chiến đấu nối qua
  // onTap — chiêu ra NGAY ở nhịp chạm đầu (pointerdown), không còn phải
  // ấn hai cái; thân handler giữ nguyên từng chữ, không số nào đổi.
  onTap($('sk-pha'), function () { castPha(); });
  onTap($('sk-chan'), function () { castChan(); });
  onTap($('sk-sword'), function () { castSword(); });
  onTap($('sk-dinh'), function () { castDinh(); });
  onTap($('sk-phong'), function () { castPhong(); });
  onTap($('sk-med'), function () { sfxUi(); medLatch = !medLatch; refreshHUD(); });
  onTap($('sk-break'), function () { doBreakthrough(); });
  onTap($('sk-food'), function () { quickEatFood(); }); // nút Đồ Ăn ở vòng cung trong (đợt đồ ăn 2026-11-04; nối qua onTap như mọi nút cụm chiến đấu theo đợt cảm ứng)
  onTap($('sk-interact'), function () { sfxUi(); interact(); });
  // Mục G: nút ĐÁNH ở tâm vòng cung — gọi đúng castSword (đường đánh
  // thường duy nhất của game: kiếm quyết vật lý, tự rẽ nhánh chạm trán /
  // trận đài / Thăng Long trong chính castSword như nút Kiếm quyết).
  onTap($('sk-attack'), function () { castSword(); });

  /* ================= LÀN C — HỆ CÀY + BÍ CẢNH =================
     Hợp đồng làn A (js/logic.js, qua VSLC) được dùng đúng tên; số đã
     duyệt không đổi; canon và tọa độ chức năng bản đồ cũ không đổi.
     Mọi trạng thái phiên (bcSession, bcColorSort, bạn hộ tống) chỉ sống
     trong bộ nhớ và bị xóa trong resetPresentationState. */
  var BC_LOCK_LINES = {
    bc_thuyliem: 'Sau màn thác là một hang tối phả hơi lạnh. Ngươi còn việc chưa xong ở cổng thành — hãy khép lại chuyện đường mòn rồi quay lại đây.',
    bc_tapha: 'Cầu thang đá dẫn xuống tối sâu dưới sảnh tháp. Người giữ tháp chưa cho phép — chỉ ai đã đo xong thước của mình mới được xuống xem tàn tích.',
    bc_tapsau: 'Tầng sâu hơn nữa vẫn im lìm sau lớp đá. Người giữ tháp từng nói: chỉ khi ngươi đã đứng ở Trúc Cơ, phế tích dưới này mới chịu mở mắt.',
    bc_kiemtrung: 'Cửa động bị kiếm cắm chắn kín, kiếm ý sắc đến mức đứng gần đã thấy da thịt rin rít. Với tu vi hiện tại, bước vào chỉ tổ làm mồi cho kiếm khí.',
    bc_hoiphong_mo: 'Nền mộ vừa lộ sau trận sạt đất, oán khí đặc quánh như sương. Nơi này chỉ mở khi chuyện thung lũng đã đi tới hồi đối đầu.',
    bc_tran_tam: 'Sau cụm kiếm phong ấn, hành lang đá lạnh ngắt còn in trận văn chưa tắt. Di tích này chỉ mở khi chuyện vòng vây ba động đã khép hẳn — người chưa xong việc ở đoạn hai vách không nên bước vào.',
    bc_tran_tam_sau: 'Tâm trận nằm sâu dưới tầng ngoài, ma khí đặc như mực. Cửa này chỉ mở cho người đã dọn sạch tầng ngoài và khép xong chuyện cung này.',
    party: 'Trận văn quanh cửa tâm trận quét qua người ngươi rồi lặng đi: nơi này không mở cho kẻ đi một mình. Tới bia tập kết cạnh cổng, ghép đủ tổ đội rồi hãy xuống.',
    pool: 'Linh khí trong các bí cảnh quanh vùng hôm nay đã bị ngươi khuấy động cạn kiệt. Hãy chờ sang ngày game mới — khí đất cần một đêm để lắng lại.'
  };
  var BC_HINT_LINES = {
    vach: 'Một vách đá nứt chéo chắn ngang lối tắt. Các vết nứt đã sâu — một đòn Phá Âm gõ đúng âm gốc của đá đủ làm nó sập, nhưng tiếng động trong hang này sẽ vọng rất xa.',
    phe: "Cửa phế thước khắc chín vạch màu và một dòng chữ: 'Xếp lại trật tự cửu phẩm, cửa tự mở.'",
    tran: "Tĩnh mặc trấn phong cửa mộ thất. Chữ khắc trên trấn viết: 'Người giữ được im lặng lâu như tiền bối thì là đồng đạo.' — và một dòng nhỏ hơn: 'Trấn này nhớ dư âm người.'"
  };
  var BC_SUCCESS_LINES = {
    phe: 'Chín mảnh sắc vào đúng thứ tự. Một tiếng chuông nhỏ ngân lên từ lòng đá — cửa phế thước lặng lẽ trượt mở.',
    tran: 'Hai mươi hơi thở đều đặn. Tĩnh mặc trấn cảm được sự lắng nghe ấy — ngươi đã nghe thấu nhịp sóng đứng của trấn, vòng sáng mờ dần, cửa mộ thất tự mở, không một tiếng động.',
    wordDoor: 'Đòn cộng hưởng vừa gõ xuống, tĩnh mặc trấn rung lên như ghi nhớ dư âm ấy. Cửa mộ thất mở ra — nhưng sâu trong động, kiếm ý cũng đã nhớ lấy dư âm ấy.',
    soothe: 'Ngươi không nói một lời. Ngươi nghe hồn của oán hồn như nghe một bản nhạc lệch nhịp, rồi dùng hồn lực chỉnh lại từng dây một. Hồn lực tỏa ra như làn khói ấm, phủ lấy oán khí đang cuộn xoáy. Oán hồn khựng lại… rồi tan dần vào lòng đất, yên nghỉ trong im lặng.',
    reread: 'Bức thư chưa gửi vẫn nằm trên bệ đá. Tên người chết — Thạch Vạn Quân — ngươi đã ghi nhớ.'
  };
  var BC_INTRO_SCENE = { bc_thuyliem: 'SCENE_BC_THUYLIEM_INTRO', bc_tapha: 'SCENE_BC_TAPHA_INTRO', bc_tapsau: 'SCENE_BC_TAPSAU_INTRO', bc_kiemtrung: 'SCENE_BC_KIEMTRUNG_INTRO', bc_hoiphong_mo: 'SCENE_BC_HOIPHONG_INTRO', bc_tran_tam: 'SCENE_BC_TRANTAM_INTRO' };
  // Đợt quái theo khoang (làn C): mỗi khoang một đợt quái thường đi lại
  // tự do trong khoang (tường X chặn di chuyển nên quái không tràn khoang);
  // boss ở khoang cuối, sinh cùng lượt vào nhưng bị tường/vách chặn lại.
  var BC_WAVES = {
    bc_thuyliem: { zone: 'zone_bc_thuyliem', waves: [
      [{ species: 'dong_xa', x: 14, y: 28 }, { species: 'dong_xa', x: 30, y: 28 }],
      /* (32,19) thay (33,19): ô cũ trùng đúng vật thể da_suoi_b nên quái
         đứng trên ô không đi được, người chơi không chạm trán được. */
      [{ species: 'dong_xa', x: 10, y: 18 }, { species: 'dong_xa', x: 32, y: 19 }] ] },
    bc_tapha: { zone: 'zone_bc_tapha', waves: [
      [{ species: 'thach_tuong', x: 14, y: 26 }, { species: 'thach_tuong', x: 30, y: 26 }],
      [{ species: 'thach_tuong', x: 10, y: 14 }, { species: 'thach_tuong', x: 28, y: 17 }] ] },
    bc_tapsau: { zone: 'zone_bc_tapsau', waves: [
      [{ species: 'thach_tuong', x: 14, y: 26 }, { species: 'thach_tuong', x: 30, y: 26 }],
      [{ species: 'thach_tuong', x: 10, y: 14 }, { species: 'thach_tuong', x: 28, y: 17 }] ] },
    bc_kiemtrung: { zone: 'zone_bc_kiemtrung', waves: [
      [{ species: 'kiem_linh', x: 14, y: 29 }, { species: 'kiem_linh', x: 32, y: 29 }],
      [{ species: 'kiem_linh', x: 14, y: 12 }, { species: 'kiem_linh', x: 30, y: 12 }] ] },
    bc_hoiphong_mo: { zone: 'zone_bc_hoiphong_mo', waves: [
      [{ species: 'oan_binh', x: 16, y: 33 }, { species: 'oan_binh', x: 38, y: 33 }],
      [{ species: 'oan_binh', x: 16, y: 14 }, { species: 'oan_binh', x: 38, y: 14 }] ] }
  };
  var BC_BOSS_POS = { bc_thuyliem: { x: 21, y: 5 }, bc_tapha: { x: 19, y: 5 }, bc_tapsau: { x: 19, y: 5 }, bc_kiemtrung: { x: 23, y: 4 }, bc_hoiphong_mo: { x: 25, y: 5 }, bc_kiemtrung_sau: { x: 22, y: 5 }, bc_tran_tam: { x: 22, y: 5 }, bc_tran_tam_sau: { x: 19, y: 6 } }; // ARCIV A.2 + Trận Tâm
  // ARCIV A.2: BC_KIEMTRUNG_SAU_WAVES của logic có dạng [[loài, số]...]
  // KHÁC định dạng bcSpawnMonsters ({species,x,y}) — chuyển đổi tại đây
  // thành tọa độ thật trên lưới đi được của tầng sâu, giữ đúng số lượng
  // 2 rồi 3 của dữ liệu (tầng giữa + phòng đáp phía nam).
  BC_WAVES.bc_kiemtrung_sau = { zone: 'zone_bc_kiemtrung_sau', waves: [
    [{ species: 'tan_hon_kiem_y_sau', x: 12, y: 14 }, { species: 'tan_hon_kiem_y_sau', x: 32, y: 14 }],
    [{ species: 'tan_hon_kiem_y_sau', x: 18, y: 14 }, { species: 'tan_hon_kiem_y_sau', x: 26, y: 14 }, { species: 'tan_hon_kiem_y_sau', x: 21, y: 24 }] ] };
  // Di Tích Trận Tâm (boss tổ đội): tầng ngoài hai đợt như Kiếm Trủng sâu;
  // tâm trận KHÔNG đợt quái — chỉ boss tổ đội (BC_WAVES rỗng, boss qua BC_BOSS_POS).
  BC_WAVES.bc_tran_tam = { zone: 'zone_bc_tran_tam', waves: [
    [{ species: 'tan_hon_kiem_y_sau', x: 6, y: 14 }, { species: 'tan_hon_kiem_y_sau', x: 8, y: 14 }],
    [{ species: 'tan_hon_kiem_y_sau', x: 37, y: 13 }, { species: 'tan_hon_kiem_y_sau', x: 38, y: 14 }, { species: 'tan_hon_kiem_y_sau', x: 36, y: 15 }] ] }; // tọa độ waves1 trong docs/party-boss-coords.json
  BC_WAVES.bc_tran_tam_sau = { zone: 'zone_bc_tran_tam_sau', waves: [] };
  // Thưởng LẦN ĐẦU (ngoài hồ trần, cờ firstClear chống trùng — đúng hồ sơ
  // đã duyệt; ti_loi_phu là thưởng lần đầu đã duyệt, KHÔNG phải Dẫn Lôi
  // Pháp và không bao giờ phát dan_loi_phap trong bí cảnh).
  var BC_FIRST_REWARDS = {
    bc_thuyliem: { lt: 15, items: { yeu_dan_1: 1, hoi_xuan_dan: 1 }, tech: null, story: [] },
    bc_tapha: { lt: 20, items: { ti_loi_phu: 1 }, tech: null, story: [] },
    bc_tapsau: { lt: 30, items: { ti_loi_phu: 1 }, tech: { id: 'that_tinh', pts: 60 }, story: [] },
    bc_kiemtrung: { lt: 25, items: { yeu_dan_2: 1 }, tech: { id: 'that_tinh', pts: 120 }, story: [] },
    bc_hoiphong_mo: { lt: 25, items: { ti_loi_phu: 1, yeu_dan_2: 1 }, tech: null, story: ['thu_trong_mo', 'ngoc_boi_nua'] },
    bc_tran_tam: { lt: 30, items: { yeu_dan_3: 1 }, tech: null, story: [] },
    bc_tran_tam_sau: { lt: 40, items: { yeu_dan_3: 1, phuc_linh_dan: 1 }, tech: null, story: [] }
  };
  var ZONE_SHORT = { zone_duong_mon_rung: 'rừng đường mòn', zone_duong_mon_phuc_kich: 'bãi phục kích', zone_tong_sau_nui: 'rừng sau núi tông', zone_hb_rung: 'rừng thung lũng', zone_hb_bac: 'bãi bắc thung lũng' };
  var SECT_JOB_LABEL = { cleanup: 'Dọn dẹp', delivery: 'Giao hàng', patrol: 'Tuần tra', escort: 'Hộ tống' };
  var grindTalkNpcId = null, grindTalkNpcName = '';
  function grindTemplateById(boardId, templateId) {
    var list = L.templatesForBoard(boardId), t = null;
    list.forEach(function (x) { if (x.templateId === templateId) t = x; });
    return t;
  }
  function grindHeldInstances(boardId, kind) {
    var g = L.ensureGrind(state), out = [];
    for (var id in g.instances) {
      var ins = g.instances[id];
      if (ins && ins.boardId === boardId && ins.kind === kind && (ins.status === 'active' || ins.status === 'ready')) out.push(ins);
    }
    out.sort(function (a, b) { return a.acceptedSeq - b.acceptedSeq; });
    return out;
  }
  function grindSlotText(kind, t, target) {
    if (!t) return 'Ô trống';
    if (kind === 'hunt') {
      var sp = L.MONSTER_DEFS[t.speciesId];
      return 'Săn ' + (sp ? sp.name : t.speciesId) + ' ×' + target + ' (' + (ZONE_SHORT[t.zoneId] || t.zoneId) + ')';
    }
    if (kind === 'gather') {
      var it = L.ITEM_DEFS[t.itemId];
      return 'Thu thập ' + (it ? it.name : t.itemId) + ' ×' + target;
    }
    return (SECT_JOB_LABEL[t.jobType] || t.jobType) + ' — tầng ' + (t.tier === 'truc_co' ? 'Trúc Cơ' : 'tạp dịch');
  }
  function grindInstanceText(kind, t, ins) {
    if (!t) return ins.instanceId;
    if (kind === 'hunt') {
      var sp = L.MONSTER_DEFS[t.speciesId];
      return 'Săn ' + (sp ? sp.name : t.speciesId) + ': ' + ins.progress + '/' + ins.target + (ins.status === 'ready' ? ' — đã xong, chờ trả' : '');
    }
    if (kind === 'gather') {
      var it = L.ITEM_DEFS[t.itemId];
      return 'Thu thập ' + (it ? it.name : t.itemId) + ': trong túi ' + L.bagCount(state, t.itemId) + '/' + ins.target;
    }
    var label = SECT_JOB_LABEL[t.jobType] || t.jobType;
    if (t.jobType === 'patrol') {
      var n = (t.checkpoints || []).length;
      return label + ': điểm kiểm ' + (ins.cpIndex || 0) + '/' + n + (ins.status === 'ready' ? ' — đã xong, chờ trả' : '');
    }
    if (t.jobType === 'escort') return label + (ins.status === 'ready' ? ' — đã tới nơi, chờ trả' : ': đang hộ tống');
    if (t.jobType === 'delivery') return label + (ins.status === 'ready' ? ' — đã giao, chờ trả' : ': chưa giao');
    return label + (ins.status === 'ready' ? ' — đã làm xong, chờ trả' : ': chưa làm');
  }
  function grindGrantedText(r) {
    if (!r || !r.granted) return '';
    var parts = [];
    if (r.granted.lt > 0) parts.push('+' + fmtAmt(r.granted.lt) + ' Linh Thạch');
    if (r.granted.tuvi > 0) parts.push('+' + fmtAmt(r.granted.tuvi) + ' tu vi');
    if (r.granted.merit > 0) parts.push('+' + fmtAmt(r.granted.merit) + ' cống hiến');
    for (var id in r.granted.items) parts.push((L.ITEM_DEFS[id] ? L.ITEM_DEFS[id].name : id) + ' ×' + r.granted.items[id]);
    return parts.join(' · ');
  }
  function grindBtn(label, fn) {
    var b = document.createElement('button');
    b.className = 'btn wood'; b.type = 'button'; b.textContent = label;
    b.style.marginRight = '6px'; b.style.marginBottom = '6px';
    b.addEventListener('click', fn);
    return b;
  }
  function openGrindBoard(boardId) {
    if (!state) return;
    grindBoardOpen = boardId;
    renderGrindBoard();
    var p = $('grind-panel'); if (p) p.classList.remove('hidden');
  }
  function closeGrindBoard() {
    grindBoardOpen = null;
    var p = $('grind-panel'); if (p) p.classList.add('hidden');
  }
  var grindCloseEl = $('grind-close');
  if (grindCloseEl) onTap(grindCloseEl, closeGrindBoard);
  function renderGrindBoard() {
    if (!state || !grindBoardOpen) return;
    var boardId = grindBoardOpen;
    var title = $('grind-title'), info = $('grind-info'), list = $('grind-list');
    var def = L.BOARD_DEFS[boardId];
    if (title) title.textContent = def ? def.name : 'Bảng nhiệm vụ cày';
    var kind = boardId === 'board_hunt_daily' ? 'hunt' : (boardId === 'board_gather_daily' ? 'gather' : 'sect');
    if (info) info.textContent = 'Ngày game ' + state.dayCount + ' — Bảng làm mới theo ngày game; ngày chỉ trôi khi đồng hồ chạy theo chu kỳ (ghim Luôn ngày/Luôn đêm thì hệ cày đứng yên theo ngày).';
    if (!list) return;
    list.innerHTML = '';
    var board = L.generateBoard(state, boardId);
    var g = L.ensureGrind(state);
    function row(text) {
      var d = document.createElement('div');
      d.style.margin = '8px 0'; d.style.padding = '8px 10px'; d.style.border = '1px solid #77683c';
      d.style.borderRadius = '8px'; d.style.background = 'rgba(24,17,10,0.55)';
      d.textContent = text;
      return d;
    }
    if (!board.slots.length) {
      var empty = document.createElement('div');
      empty.textContent = def ? def.lockedHint : 'Chưa mở.';
      list.appendChild(empty);
    }
    board.slots.forEach(function (s, idx) {
      var t = grindTemplateById(boardId, s.templateId);
      var iid = L.grindInstanceId(kind, boardId, state.dayCount, idx);
      var ins = g.instances[iid];
      var txt = 'Ô ' + (idx + 1) + ': ' + grindSlotText(kind, t, s.target);
      if (ins) txt += ins.status === 'active' ? ' — đang làm' : (ins.status === 'ready' ? ' — đã xong, chờ trả' : (ins.status === 'claimed' ? ' — đã trả' : ' — đã hết lượt'));
      else txt += ' — còn trống';
      var r = row(txt);
      if (!ins && L.countHeldGrind(state, kind) < (L.GRIND_ACTIVE_MAX[kind] || 2)) {
        r.appendChild(grindBtn('Nhận', (function (b, sl) { return function () { grindAcceptSlot(b, sl); }; })(boardId, idx)));
      }
      list.appendChild(r);
    });
    var held = grindHeldInstances(boardId, kind);
    if (held.length) {
      var hTitle = document.createElement('div');
      hTitle.textContent = 'Phiếu đang giữ (phiếu ready không hết hạn theo ngày):';
      hTitle.style.marginTop = '10px'; hTitle.style.color = '#ffe9a8';
      list.appendChild(hTitle);
      held.forEach(function (ins) {
        var t2 = grindTemplateById(boardId, ins.templateId);
        var r2 = row(grindInstanceText(kind, t2, ins));
        if (ins.status === 'ready' && kind !== 'gather') {
          r2.appendChild(grindBtn('Trả thưởng', (function (x) { return function () { grindClaimInstance(x); }; })(ins)));
        } else if (ins.status === 'active' && kind === 'gather') {
          if (L.bagCount(state, t2.itemId) >= ins.target) {
            r2.appendChild(grindBtn('Nộp lấy tu vi', (function (x) { return function () { grindClaimGather(x, false); }; })(ins)));
            r2.appendChild(grindBtn('Nộp lấy đan', (function (x) { return function () { grindClaimGather(x, true); }; })(ins)));
          }
        }
        if (ins.status === 'active' || ins.status === 'ready') {
          r2.appendChild(grindBtn('Hủy', (function (x) { return function () { grindAbandonInstance(x); }; })(ins)));
        }
        list.appendChild(r2);
      });
    }
  }
  function grindAcceptSlot(boardId, slot) {
    var kind = boardId === 'board_hunt_daily' ? 'hunt' : (boardId === 'board_gather_daily' ? 'gather' : 'sect');
    var r = L.acceptBoardInstance(state, kind, boardId, slot);
    if (!r.ok) {
      toast(r.reason === 'held_limit' ? 'Đang giữ tối đa phiếu/việc rồi — trả hoặc hủy bớt rồi nhận tiếp.' : (r.reason === 'already_taken' ? 'Ô này đã nhận rồi trong ngày.' : 'Không nhận được ô này.'), 3600);
      return;
    }
    sfxBoardAccept();
    toast('Đã nhận phiếu/việc mới.', 3000);
    refreshHUD(); saveNow(); renderGrindBoard();
  }
  function grindClaimInstance(ins) {
    var t = grindTemplateById(ins.boardId, ins.templateId);
    var profile = ins.resolvedProfileId || (t && t.profileId);
    var r = L.grantReward(state, profile, { claimKey: ins.instanceId, sourceId: ins.boardId });
    if (r.ok) {
      ins.status = 'claimed';
      if (ins.kind === 'sect') grindEscortClear();
      sfxClaimDone();
      toast('Đã trả thưởng: ' + grindGrantedText(r) + '.', 4600);
      refreshHUD(); saveNow(); renderGrindBoard();
      return;
    }
    if (r.duplicate) { ins.status = 'claimed'; refreshHUD(); saveNow(); renderGrindBoard(); return; }
    toast(r.reason === 'bag_full' ? 'Túi đã đầy — dọn túi rồi trả lại, công không mất.' : (r.reason || 'Chưa trả được.'), 4200);
  }
  // Nộp thu thập NGUYÊN TỬ: trừ nguyên liệu trước, trả thưởng sau; nếu
  // cửa thưởng lỗi giữa chừng thì hoàn nguyên liệu, lượt giữ nguyên.
  function grindClaimGather(ins, useDan) {
    var t = grindTemplateById(ins.boardId, ins.templateId);
    if (!t) return;
    if (L.bagCount(state, t.itemId) < ins.target) { toast('Chưa đủ nguyên liệu trong túi.', 3600); return; }
    var profile = useDan ? L.gatherDanProfileForOrdinal(L.realmOrdinal(state)) : 'profile:gat:tuvi';
    var rm = L.bagRemove(state, t.itemId, ins.target);
    if (!rm.ok) { toast(rm.reason, 3600); return; }
    var r = L.grantReward(state, profile, { claimKey: ins.instanceId, sourceId: ins.boardId });
    if (!r.ok) {
      L.bagAdd(state, t.itemId, ins.target); // hoàn nguyên liệu
      toast(r.reason === 'bag_full' ? 'Túi không đủ chỗ nhận đan — nguyên liệu đã hoàn lại.' : (r.reason || 'Chưa nộp được, nguyên liệu đã hoàn lại.'), 4200);
      refreshHUD(); saveNow(); renderGrindBoard();
      return;
    }
    ins.status = 'claimed';
    sfxClaimDone();
    toast('Đã nộp thu thập: ' + grindGrantedText(r) + '.', 4600);
    refreshHUD(); saveNow(); renderGrindBoard();
  }
  function grindAbandonInstance(ins) {
    ins.status = 'abandoned';
    if (ins.kind === 'sect') grindEscortClear();
    toast('Đã hủy phiếu/việc (ô này không nhận lại được trong ngày).', 3600);
    refreshHUD(); saveNow(); renderGrindBoard();
  }
  function grindCloseDlg() {
    dlg = null; dlgQueue = []; dlgCb = null;
    var dEl = $('dialogue'); if (dEl) dEl.classList.add('hidden');
    var chEl = $('dlg-choices'); if (chEl) chEl.innerHTML = '';
    updateDlgPortrait(null);
  }
  function grindIdleTalk() {
    var id = grindTalkNpcId;
    var pool = (state.flags.voiced ? ST.IDLE_AFTER : ST.IDLE_BEFORE)[id] || ST.IDLE_AFTER[id] || ST.IDLE_BEFORE[id];
    if (pool) { say(pool.map(function (ln) { return { who: ln.who === 'hero' ? 'hero' : id, mode: ln.mode, text: ln.text }; })); return; }
    say([{ who: 'narrate', text: grindTalkNpcName + ' nhìn ngươi một lúc, khẽ gật đầu. Lúc này chưa có chuyện gì cần nói.' }]);
  }
  function grindChoiceAction(action) {
    if (action === 'grind_open_hunt') { grindCloseDlg(); openGrindBoard('board_hunt_daily'); }
    else if (action === 'grind_open_gather') { grindCloseDlg(); openGrindBoard('board_gather_daily'); }
    else if (action === 'grind_open_sect') { grindCloseDlg(); openGrindBoard('board_sect_daily'); }
    else if (action === 'grind_pharmacy') { say(ST.SCENE_PHARMACY); }
    else if (action === 'grind_idle') { grindIdleTalk(); }
  }
  // Giao hàng việc tông qua NPC (ưu tiên sau nhánh cốt truyện trong talkTo).
  function grindDeliveryForNpc(npcId) {
    if (!state) return null;
    var g = L.ensureGrind(state);
    for (var id in g.instances) {
      var ins = g.instances[id];
      if (!ins || ins.kind !== 'sect' || ins.status !== 'active') continue;
      var t = null;
      L.SECT_JOB_TEMPLATES.forEach(function (x) { if (x.templateId === ins.templateId) t = x; });
      if (t && t.jobType === 'delivery' && t.deliverNpc === npcId && t.deliverMap === state.map) return ins;
    }
    return null;
  }
  function grindCompleteDelivery(npc, ins) {
    ins.progress = ins.target; ins.status = 'ready';
    toast('Đã giao hàng cho ' + npc.name + ' — về gặp Quản Sự Tạp Dịch để trả việc.', 4200);
    refreshHUD(); saveNow();
    return say([{ who: 'narrate', text: 'Ngươi giao xong hàng cho ' + npc.name + '. Việc đã xong bước giao — còn bước về tông trả việc.' }]);
  }
  function grindSectActiveForProp(propId) {
    if (!state) return null;
    var g = L.ensureGrind(state);
    for (var id in g.instances) {
      var ins = g.instances[id];
      if (!ins || ins.kind !== 'sect' || ins.status !== 'active') continue;
      var t = null;
      L.SECT_JOB_TEMPLATES.forEach(function (x) { if (x.templateId === ins.templateId) t = x; });
      if (t && t.interactProp === propId && t.interactAt && t.interactAt.map === state.map) return ins;
    }
    return null;
  }
  function grindSectStepDone(ins) {
    ins.progress = ins.target; ins.status = 'ready';
    toast('Đã làm xong việc tông luân phiên — về gặp Quản Sự Tạp Dịch để trả việc.', 4200);
    refreshHUD(); saveNow();
    return say([{ who: 'narrate', text: 'Ngươi làm xong việc này. Về gặp Quản Sự Tạp Dịch ở sân đông nam để trả việc.' }]);
  }
  function grindEscortClear() {
    for (var i = npcsLive.length - 1; i >= 0; i--) if (npcsLive[i].id === 'de_tu_ho_tong') npcsLive.splice(i, 1);
  }
  // Việc tông luân phiên chạy theo nhịp thế giới: tuần tra theo thứ tự
  // điểm kiểm (bán kính Chebyshev ≤ 1); hộ tống có bạn đi theo.
  // ĐỢT 2 (B.9): hộ tống TỔNG QUÁT cho MỌI mẫu escort (jobType/kind
  // 'escort') theo escortFrom/escortTo/escortName/escortLook của chính
  // mẫu. Mẫu cũ thiếu trường thì dùng mặc định đúng giá trị cũ: điểm
  // đến thanh_van_tong (61,87), tên 'Đệ tử đi cùng', look villager_m,
  // điểm đón = điểm người chơi đang đứng trên bản đồ tông. Hành vi
  // sect_escort_rot giữ y nguyên: mẫu này đã có sẵn escortFrom/
  // escortTo trong dữ kiện, follower xuất hiện ngay trên bản đồ tông
  // khi việc đang chạy, hoàn thành khi người chơi trong 1 ô Chebyshev
  // của điểm đến. Mẫu MỚI (có escortName): pha ĐÓN — follower chỉ xuất
  // hiện khi người chơi tới gần điểm escortFrom (≤2 ô) trên đúng bản
  // đồ đó, spawn tại điểm đón; pha GIAO — follower theo người chơi
  // trên bản đồ escortTo và hoàn thành tại điểm escortTo; giữa hai
  // bản đồ follower ẩn (npcsLive vốn được dựng lại khi đổi bản đồ).
  // Pha đón/giao lưu bằng ins.cpIndex sẵn có của instance (0/1) —
  // không đổi khuôn save.
  function grindSectTick(dt) {
    if (!state) return;
    var g = L.ensureGrind(state), ins = null, id;
    for (id in g.instances) {
      var o = g.instances[id];
      if (o && o.kind === 'sect' && o.status === 'active') { ins = o; break; }
    }
    if (!ins) { grindEscortClear(); return; }
    var t = null;
    L.SECT_JOB_TEMPLATES.forEach(function (x) { if (x.templateId === ins.templateId) t = x; });
    if (!t) { grindEscortClear(); return; }
    var isEscort = t.jobType === 'escort' || t.kind === 'escort';
    if (!isEscort) grindEscortClear();
    if (t.jobType === 'patrol') {
      var cps = t.checkpoints || [], cp = cps[ins.cpIndex || 0];
      if (!cp) { ins.status = 'ready'; refreshHUD(); saveNow(); return; }
      if (state.map === cp.map) {
        var pt = playerTile();
        if (Math.max(Math.abs(pt.x - cp.x), Math.abs(pt.y - cp.y)) <= 1) {
          ins.cpIndex = (ins.cpIndex || 0) + 1;
          if (ins.cpIndex >= cps.length) { ins.status = 'ready'; toast('Đã tuần tra xong mọi điểm kiểm — về gặp Quản Sự Tạp Dịch để trả việc.', 4200); }
          else toast('Đã qua điểm kiểm ' + ins.cpIndex + '/' + cps.length + ' của việc tuần tra.', 3000);
          refreshHUD(); saveNow();
        }
      }
      return;
    }
    if (isEscort) {
      var legacy = !t.escortName;
      var from = t.escortFrom || { map: 'thanh_van_tong', x: playerTile().x, y: playerTile().y };
      var to = t.escortTo || { map: 'thanh_van_tong', x: 61, y: 87 };
      var escName = t.escortName || 'Đệ tử đi cùng';
      var escLook = t.escortLook || 'villager_m';
      var pt2 = playerTile();
      var picked = legacy ? (state.map === from.map) : (ins.cpIndex || 0) >= 1;
      if (!picked) {
        // Pha đón (mẫu mới): chưa tới gần điểm đón thì follower ẩn.
        if (state.map !== from.map || Math.max(Math.abs(pt2.x - from.x), Math.abs(pt2.y - from.y)) > 2) { grindEscortClear(); return; }
        ins.cpIndex = 1; picked = true;
        toast('Đã đón ' + escName + ' — hộ tống tới ' + (to.map === state.map ? 'điểm hẹn' : 'nơi giao') + ' rồi về tông trả việc.', 4200);
        refreshHUD(); saveNow();
      }
      if (state.map !== from.map && state.map !== to.map) { grindEscortClear(); return; } // giữa hai bản đồ: follower ẩn
      var fol = null;
      npcsLive.forEach(function (n) { if (n.id === 'de_tu_ho_tong') fol = n; });
      if (!fol) {
        var spawnAt = (!legacy && state.map === from.map && (ins.cpIndex || 0) === 1 && Math.max(Math.abs(pt2.x - from.x), Math.abs(pt2.y - from.y)) <= 2 && fol === null)
          ? { x: from.x, y: from.y } : { x: pt2.x, y: pt2.y };
        fol = { id: 'de_tu_ho_tong', name: escName, look: escLook, x: spawnAt.x, y: spawnAt.y, dir: 'down' };
        npcsLive.push(fol);
      } else { fol.name = escName; fol.look = escLook; }
      escortT += dt;
      if (escortT >= 0.35) {
        escortT = 0;
        var dx = pt2.x - fol.x, dy = pt2.y - fol.y;
        if (Math.max(Math.abs(dx), Math.abs(dy)) > 1) {
          var sx = dx === 0 ? 0 : (dx > 0 ? 1 : -1), sy = dy === 0 ? 0 : (dy > 0 ? 1 : -1);
          var others = npcsLive.filter(function (n) { return n.id !== 'de_tu_ho_tong'; });
          if (L.isWalkable(fol.x + sx, fol.y + sy, others)) { fol.x += sx; fol.y += sy; }
          else if (L.isWalkable(fol.x + sx, fol.y, others)) fol.x += sx;
          else if (L.isWalkable(fol.x, fol.y + sy, others)) fol.y += sy;
        }
      }
      if (state.map === to.map && Math.max(Math.abs(pt2.x - to.x), Math.abs(pt2.y - to.y)) <= 1) {
        ins.status = 'ready'; ins.progress = ins.target || 1;
        grindEscortClear();
        toast(legacy ? 'Đã hộ tống đệ tử mới tới nơi — về gặp Quản Sự Tạp Dịch để trả việc.' : 'Đã hộ tống ' + escName + ' tới nơi — về gặp Quản Sự Tạp Dịch để trả việc.', 4200);
        refreshHUD(); saveNow();
      }
    }
  }
  // Ghi công hạ quái vào phiếu săn đang giữ: khớp loài + vùng, instance
  // có acceptedSeq nhỏ nhất, đủ target → ready. Quái ngoài vé KHÔNG đổi
  // hành vi normalKillDrops (chỉ yêu đan + bí tịch, không cộng tu vi).
  function grindHuntCredit(m) {
    if (!state) return;
    var g = L.ensureGrind(state), best = null;
    for (var id in g.instances) {
      var ins = g.instances[id];
      if (!ins || ins.kind !== 'hunt' || ins.status !== 'active') continue;
      var t = null;
      L.HUNT_TEMPLATES.forEach(function (x) { if (x.templateId === ins.templateId) t = x; });
      if (!t || t.speciesId !== m.species || t.zoneId !== m.zoneId) continue;
      if (!best || ins.acceptedSeq < best.acceptedSeq) best = ins;
    }
    if (!best) return;
    best.progress = Math.min(best.target, best.progress + 1);
    if (best.progress >= best.target) { best.status = 'ready'; toast('Phiếu săn đã đủ số — về đúng bảng treo thưởng để trả.', 4200); }
    refreshHUD(); saveNow();
    // ARCIV A.3: kỳ ngộ ô 23 — nối bộ đếm tại hành động săn ở đường mòn
    // (tập bộ do kyNgoPool của logic tự lọc điều kiện).
    if (state.map === 'duong_mon') arcKyNgo('hunt');
  }
  // Điểm hái: tương tác theo nodeStatus, ô đứng kề Chebyshev ≤ 1 (điểm
  // nằm trên ô thân cây trang trí vẫn hái được từ ô kề, không dời tọa
  // độ đăng ký); túi đầy thì điểm không tiêu.
  function grindNearestNode() {
    if (!state) return null;
    var pt = playerTile(), best = null, bestD = 99;
    L.RESOURCE_NODES.forEach(function (nd) {
      if (nd.mapId !== state.map) return;
      var d = Math.max(Math.abs(pt.x - nd.x), Math.abs(pt.y - nd.y));
      if (d <= 1 && d < bestD) { best = nd; bestD = d; }
    });
    return best;
  }
  function grindHarvest(nd) {
    if (!state.flags.bagUnlocked) return toast('Cần mở Túi Trữ Vật trước (chương 3) mới hái được dược liệu cày.', 3600);
    var st = L.nodeStatus(state, nd.nodeId);
    if (!st.ready) return toast('Điểm hái này cần ' + st.daysLeft + ' ngày game nữa mới hồi.', 3600);
    var chk = L.bagCanAdd(state, nd.itemId, nd.yield);
    if (!chk.ok) return toast(chk.reason, 4200);
    var g = L.ensureGrind(state);
    g.nodes[nd.nodeId] = { lastDay: state.dayCount };
    L.bagAdd(state, nd.itemId, nd.yield);
    sfxHarvest();
    toast('Đã hái ' + (L.ITEM_DEFS[nd.itemId] ? L.ITEM_DEFS[nd.itemId].name : nd.itemId) + ' ×' + nd.yield + '.', 3200);
    refreshHUD(); saveNow();
    // ARCIV A.3: kỳ ngộ cũng tích tại hành động thu thập trên đường mòn.
    if (nd.mapId === 'duong_mon') arcKyNgo('hunt');
  }

  /* ---------- Bí cảnh (phiên chỉ sống trong bộ nhớ) ----------
     Vào qua cổng -> kiểm mở khóa -> cảnh lần đầu (nếu chưa firstClear)
     hoặc tiêu lượt kho -> sinh đợt quái theo khoang + boss khoang cuối.
     Kết quả duy nhất ghi vào save: firstClear, lượt kho, thưởng, cờ
     soulLoopIntro (C-10), unlockKey vật chứng. Phiên bị hủy khi thoát
     qua cổng ra, chết trong bí cảnh, đổi bản đồ, hoặc tải lại giữa phiên. */
  function bcRealmRec(realmId) {
    var sr = L.ensureSecretRealms(state);
    return sr.realms[realmId] || null;
  }
  function bcGateInteract(realmId) {
    if (enc) { toast('Đang giao chiến — thoát trận rồi hãy vào bí cảnh.'); return; }
    if (bcSession) return;
    if (!L.secretRealmUnlocked(state, realmId)) return say([{ who: 'narrate', text: BC_LOCK_LINES[realmId] }]);
    bcEnterWithIntro(realmId);
  }
  function bcEnterWithIntro(realmId) {
    var rec = bcRealmRec(realmId);
    if (rec && !rec.firstClear) {
      var scene = ST[BC_INTRO_SCENE[realmId]];
      if (scene) return say(scene, function () { bcEnter(realmId); });
    }
    bcEnter(realmId);
  }
  function bcEnter(realmId) {
    if (enc || bcSession) return;
    // Cổng tổ đội: kiểm TRƯỚC bcConsumeEntry — chặn solo không tốn lượt bể.
    if (L.partyGateCheck) {
      var pg = L.partyGateCheck(state, realmId);
      if (pg && !pg.ok) return say([{ who: 'narrate', text: BC_LOCK_LINES.party }]);
    }
    var entry = L.bcConsumeEntry(state, realmId);
    if (!entry.ok) {
      if (entry.reason === 'pool_empty') return say([{ who: 'narrate', text: BC_LOCK_LINES.pool }]);
      if (entry.reason === 'repeat_locked') return toast('Lượt lặp tầng sâu Kiếm Trủng mở sau việc ở Kiểm Trắc Tháp (chương 17).', 4200);
      if (entry.reason === 'locked') return say([{ who: 'narrate', text: BC_LOCK_LINES[realmId] }]);
      return toast('Chưa vào được bí cảnh lúc này.', 3600);
    }
    var g = L.ensureGrind(state);
    var seq = g.seq; g.seq = seq + 1;
    bcSession = { realm: realmId, key: 'gr:bc:' + realmId + ':d' + state.dayCount + ':n' + seq,
      wavesCleared: {}, bossChoiceShown: false, letterRead: false, speechUsed: false,
      tranT: 0, hazardT: 0, hazardCd: 0 };
    bcColorSort = null;
    // Linh Thạch chờ ví của lần qua ải trước (ví khi đó chưa mở): trả
    // ngay ở lần vào sau, nếu ví vẫn khóa thì giữ lại cho lần sau nữa.
    var rec = bcRealmRec(realmId);
    if (rec && (rec.pendingLt || 0) > 0) {
      var pr = L.addLinhThach(state, rec.pendingLt);
      if (pr.ok) rec.pendingLt = 0;
    }
    grindCloseDlg();
    var dest = L.MAPS[realmId];
    fadeTransition(function () {
      state.map = realmId; state.x = dest.spawn.x; state.y = dest.spawn.y; state.dir = 'down';
      L.setActiveMap(realmId);
      px = dest.spawn.x * TILE; py = dest.spawn.y * TILE; facing = 'down';
      dir8 = DIR8_ROW4.down || 0; stepPhase = 0; stepTimer = 0; stepAcc = 0;
      npcsLive = [];
      spawnMonstersForMap();
      bcSpawnMonsters();
      partySpawnBotsLive(); // bot ghép tổ theo vào hai tầng Trận Tâm (hàm tự lọc realm + tổ)
      setMinimapLabel();
      clickPath = null; clickTarget = null; pendingInteract = null; medLatch = false; resetJoy();
      var dcS = desiredCam(); camX = dcS.x; camY = dcS.y;
      sfxRealmEntry();
      saveNow(); refreshHUD();
      toast('Đã vào: ' + dest.name + '. Lượt kho chung còn lại hôm nay: ' + L.bcPoolLeft(state) + '.', 4200);
    });
  }
  /* ================= BOT GHÉP TỔ SỐNG TRONG PHIÊN + BOSS TỔ ĐỘI ================= */
  function partyBotFootFree(nx, ny) {
    var tx = Math.floor((nx + 16) / TILE), ty = Math.floor((ny + 30) / TILE);
    return L.isWalkable(tx, ty, npcsLive);
  }
  function partyPlaceBotsNearPlayer() {
    var pt = playerTile();
    var offs = [[-1, 1], [1, 1], [0, 1], [-1, 0], [1, 0], [0, -1], [-1, -1], [1, -1]];
    partyBotsLive.forEach(function (b, i) {
      for (var k = 0; k < offs.length; k++) {
        var ox = offs[(i + k) % offs.length][0], oy = offs[(i + k) % offs.length][1];
        if (L.isWalkable(pt.x + ox, pt.y + oy, npcsLive)) { b.x = (pt.x + ox) * TILE; b.y = (pt.y + oy) * TILE; b.stuckT = 0; return; }
      }
      b.x = px; b.y = py;
    });
  }
  function partySpawnBotsLive() {
    partyBotsLive = []; bcTelegraphs = [];
    if (!state || !PARTY_REALMS[state.map]) return;
    var bots = (state.party && state.party.bots) || [];
    bots.forEach(function (bot, i) {
      partyBotsLive.push({
        botId: bot.id || bot.botId || ('bot' + i), name: bot.name || 'Tu sĩ', role: bot.role || 'dps', sect: bot.sect || '',
        sprite: bot.sprite || bot.look || PARTY_ROLE_SPRITE[bot.role] || 'villager_m',
        x: px, y: py, hp: (typeof bot.hp === 'number' ? bot.hp : bot.hpMax), hpMax: bot.hpMax || 1, power: (bot.power != null ? bot.power : (bot.atk || 1)),
        cdMs: bot.cdMs || bot.atkIntervalMs || (bot.atkInterval ? bot.atkInterval * 1000 : (PARTY_ROLE_CD[bot.role] || 1.2) * 1000),
        healPct: bot.healPct || 6, healCdMs: bot.healCdMs || 6000,
        cdT: 0.4 + i * 0.2, state: 'follow', healCdT: 3, dir: 'down', walkT: 0, movingNow: false, stuckT: 0
      });
    });
    if (partyBotsLive.length) partyPlaceBotsNearPlayer();
  }
  // Bước đi thẳng theo trục tách (như monStep): gx, gy là TÂM đích.
  function partyBotStep(b, gx, gy, speed, dt) {
    var cx = b.x + 16, cy = b.y + 16;
    var dx = gx - cx, dy = gy - cy, d = Math.hypot(dx, dy);
    if (d < 3) { b.stuckT = 0; return true; }
    var step = Math.min(d, speed * dt), ox = b.x, oy = b.y;
    if (dx) { var nx = b.x + dx / d * step; if (partyBotFootFree(nx, b.y)) b.x = nx; }
    if (dy) { var ny = b.y + dy / d * step; if (partyBotFootFree(b.x, ny)) b.y = ny; }
    if (b.x !== ox || b.y !== oy) {
      b.movingNow = true; b.walkT += dt; b.stuckT = 0;
      var mx = b.x - ox, my = b.y - oy;
      b.dir = Math.abs(mx) >= Math.abs(my) ? (mx > 0 ? 'right' : 'left') : (my > 0 ? 'down' : 'up');
    } else b.stuckT += dt;
    return false;
  }
  function partyHoldHolders() {
    var holders = { padA: null, padB: null }, R = 1.6 * TILE;
    var pcx = px + 16, pcy = py + 16;
    PARTY_HOLD_PADS.forEach(function (pad) {
      var cxp = pad.x * TILE + 16, cyp = pad.y * TILE + 16;
      if (Math.hypot(pcx - cxp, pcy - cyp) <= R) { holders[pad.key] = 'player'; return; }
      for (var i = 0; i < partyBotsLive.length; i++) {
        var b = partyBotsLive[i];
        if (b.state !== 'down' && Math.hypot(b.x + 16 - cxp, b.y + 16 - cyp) <= R) { holders[pad.key] = b.botId; break; }
      }
    });
    return holders;
  }
  function partyHoldTargetFor(b, bi) {
    var holders = partyHoldHolders(), R = 1.6 * TILE;
    for (var i = 0; i < PARTY_HOLD_PADS.length; i++) {
      var pad = PARTY_HOLD_PADS[i];
      if (holders[pad.key] === b.botId) return { x: pad.x * TILE + 16, y: pad.y * TILE + 16 };
    }
    // Phân điểm theo thứ tự bot (vá đợt tổ đội 2026-11-04, sau khi xem
    // clip ghi hình): mỗi bot ƯU TIÊN một điểm khác nhau ngay từ đầu —
    // trước đây cả hai bot cùng dồn vào điểm trống đầu tiên rồi bot thứ
    // hai mới vòng sang điểm còn lại, phí nửa cửa sổ giữ 25 giây.
    var pref = PARTY_HOLD_PADS[(bi || 0) % PARTY_HOLD_PADS.length];
    if (pref && !holders[pref.key]) return { x: pref.x * TILE + 16, y: pref.y * TILE + 16 };
    for (var j = 0; j < PARTY_HOLD_PADS.length; j++) {
      var p2 = PARTY_HOLD_PADS[j];
      if (!holders[p2.key]) return { x: p2.x * TILE + 16, y: p2.y * TILE + 16 };
    }
    return null;
  }
  function partyTelegraphThreat(b) {
    for (var i = 0; i < bcTelegraphs.length; i++) {
      var tg = bcTelegraphs[i], pb = tg.boss && tg.boss.partyBoss;
      if (!pb) continue;
      if (Math.hypot(b.x + 16 - tg.x, b.y + 16 - tg.y) <= tg.r && (tg.at - pb.t) > 0.35) return tg;
    }
    return null;
  }
  function partyBotDamage(b, dmg) {
    if (b.state === 'down' || dmg <= 0) return;
    b.hp = Math.max(0, b.hp - dmg);
    addDmgFloat(b.x + 16, b.y - 10, '-' + dmg, '255,110,100', { size: 16 });
    if (b.hp <= 0) { b.state = 'down'; addFloat(b.x + 16, b.y - 26, b.name + ' gục xuống!', '255,150,140'); }
  }
  function partySupportHeal(b) {
    var best = null, bestPct = 1, bestMax = 0, bx = 0, by = 0, isPlayer = false;
    if (state.hp > 0 && state.hp < state.hpMax) { bestPct = state.hp / state.hpMax; bestMax = state.hpMax; bx = px; by = py; isPlayer = true; best = 'player'; }
    partyBotsLive.forEach(function (ob) {
      if (ob.state === 'down' || ob.hp <= 0 || ob.hp >= ob.hpMax) return;
      var pct = ob.hp / ob.hpMax;
      if (pct < bestPct) { bestPct = pct; best = ob; bestMax = ob.hpMax; bx = ob.x; by = ob.y; isPlayer = false; }
    });
    if (!best) return false;
    var amt = Math.max(1, Math.round(bestMax * (b.healPct || 6) / 100));
    if (isPlayer) { state.hp = Math.min(state.hpMax, state.hp + amt); refreshHUD(); }
    else best.hp = Math.min(best.hpMax, best.hp + amt);
    addFloat(bx + 16, by - 14, '+' + amt, '120,255,140');
    return true;
  }
  function updatePartyBots(dt) {
    if (!state || !partyBotsLive.length || dt <= 0) return;
    var pcx = px + 16, pcy = py + 16;
    var backByFacing = { down: [0, -1], up: [0, 1], left: [1, 0], right: [-1, 0] }[facing] || [0, 1];
    partyBotsLive.forEach(function (b, bi) {
      if (b.cdT > 0) b.cdT -= dt;
      if (b.healCdT > 0) b.healCdT -= dt;
      b.movingNow = false;
      if (b.state === 'down') return;
      if (b.role === 'support' && b.healCdT <= 0) b.healCdT = partySupportHeal(b) ? (b.healCdMs / 1000) : 1;
      if (enc && enc.mon && enc.mon.state === 'alive') {
        var m = enc.mon;
        if (m.partyBoss && m.partyBoss.phase === 'hold') {
          var padT = partyHoldTargetFor(b, bi);
          if (padT) partyBotStep(b, padT.x, padT.y, 175, dt);
          return;
        }
        var tg = partyTelegraphThreat(b);
        if (tg) {
          var dxo = b.x + 16 - tg.x, dyo = b.y + 16 - tg.y, dl = Math.hypot(dxo, dyo) || 1;
          partyBotStep(b, tg.x + dxo / dl * (tg.r + 26), tg.y + dyo / dl * (tg.r + 26), 175, dt);
          return;
        }
        var mcx = m.x + 16, mcy = m.y + 16;
        var distM = Math.hypot(mcx - (b.x + 16), mcy - (b.y + 16));
        if (distM > 46) partyBotStep(b, mcx, mcy, 175, dt);
        else if (b.cdT <= 0) {
          b.cdT = b.cdMs / 1000;
          b.dir = Math.abs(mcx - (b.x + 16)) >= Math.abs(mcy - (b.y + 16)) ? (mcx > b.x + 16 ? 'right' : 'left') : (mcy > b.y + 16 ? 'down' : 'up');
          applyHitToMonster(m, b.power, { kind: 'sword' });
        }
        return;
      }
      // Không chạm trán: bám điểm lệch sau lưng người chơi; kẹt >1,5s
      // hoặc cách >6 ô thì dịch tới ô kề người chơi.
      var side = bi === 0 ? -24 : 24;
      var gx = pcx + backByFacing[0] * 38 - backByFacing[1] * side;
      var gy = pcy + backByFacing[1] * 38 + backByFacing[0] * side;
      var dP = Math.hypot(b.x + 16 - pcx, b.y + 16 - pcy);
      if (dP > 6 * TILE || b.stuckT > 1.5) { partyPlaceBotsNearPlayer(); return; }
      partyBotStep(b, gx, gy, 150, dt);
    });
  }
  /* ----- Boss tổ đội Trận Tâm Ma Ảnh ----- */
  function partyBossEnterHold(m, key) {
    var pb = m.partyBoss;
    pb.holdsDone[key] = true;
    pb.phase = 'hold'; pb.holdT = 0; pb.holdElapsed = 0; pb.holders = {};
    addFloat(m.x + 16, m.y - 48, 'TRẬN TÂM PHONG ẤN — GIỮ CẢ HAI ĐIỂM TRẬN!', '216,180,255');
    toast('TRẬN TÂM PHONG ẤN — GIỮ CẢ HAI ĐIỂM TRẬN!', 4600);
  }
  function partyTelegraphExplode(m, tg) {
    if (!SET || SET.current.fxRings) rings.push({ x: tg.x, y: tg.y, r: 10, a: 0.95, col: '216,180,255' });
    spawnParts(tg.x, tg.y, 18, '216,180,255', 52, false);
    shakeWorld(0.25);
    var dmg = Math.round(m.atk * 2.2);
    if (Math.hypot(px + 16 - tg.x, py + 16 - tg.y) <= tg.r) {
      hurtPlayer(Math.max(1, dmg));
      if (!enc) return;
    }
    partyBotsLive.slice().forEach(function (b) {
      if (b.state !== 'down' && Math.hypot(b.x + 16 - tg.x, b.y + 16 - tg.y) <= tg.r) partyBotDamage(b, dmg);
    });
  }
  function updatePartyBoss(m, dt) {
    var pb = m.partyBoss;
    if (!pb || dt <= 0) return;
    pb.t += dt;
    if ((pb.leashGraceT || 0) > 0) pb.leashGraceT = Math.max(0, pb.leashGraceT - dt);
    for (var i = bcTelegraphs.length - 1; i >= 0; i--) {
      var tg = bcTelegraphs[i];
      if (tg.boss !== m) continue;
      if (pb.t >= tg.at) { bcTelegraphs.splice(i, 1); partyTelegraphExplode(m, tg); if (!enc) return; }
    }
    var mcx = m.x + 16, mcy = m.y + 16;
    if (pb.phase === 'hold') {
      pb.holders = partyHoldHolders();
      var sat = L.partyHoldSatisfied ? L.partyHoldSatisfied(pb.holders)
        : !!(pb.holders.padA && pb.holders.padB && pb.holders.padA !== pb.holders.padB);
      if (sat) pb.holdT += dt;
      pb.holdElapsed += dt;
      if (pb.holdT >= 4) {
        pb.phase = 'stun'; pb.stunUntil = pb.t + 5;
        addFloat(mcx, mcy - 48, 'PHONG ẤN ĐÃ VỠ!', '255,214,120');
      } else if (pb.holdElapsed >= 25) {
        pb.phase = 'fight'; pb.nextCast = pb.t + 3; pb.leashGraceT = 6;
        if (!pb.enraged) { pb.enraged = true; m.atk = Math.round(m.atk * 1.1); }
        addFloat(mcx, mcy - 48, 'PHONG ẤN TỰ VỠ — MA ẢNH NỔI GIẬN!', '255,120,90');
      }
      return;
    }
    if (pb.phase === 'stun') {
      if (pb.t >= pb.stunUntil) { pb.phase = 'fight'; pb.nextCast = pb.t + 3; pb.leashGraceT = 6; }
      return;
    }
    var pct = m.hp / m.hpMax;
    if (!pb.holdsDone.t66 && pct <= 0.66) return partyBossEnterHold(m, 't66');
    if (!pb.holdsDone.t33 && pct <= 0.33) return partyBossEnterHold(m, 't33');
    if (pb.t >= pb.nextCast) {
      pb.nextCast = pb.t + 7;
      bcTelegraphs.push({ x: px + 16, y: py + 16, r: 78, at: pb.t + 0.9, t0: pb.t, boss: m });
      arcBossCastFx(mcx, mcy, '190,150,255', true);
      addFloat(mcx, mcy - 48, 'TRẬN VĂN PHÁ!', '216,180,255');
    }
  }
  function drawBcTelegraphs() {
    bcTelegraphs.forEach(function (tg) {
      var pb = tg.boss && tg.boss.partyBoss;
      var p = pb ? Math.max(0, Math.min(1, (pb.t - tg.t0) / 0.9)) : 0;
      ctx.save();
      ctx.fillStyle = 'rgba(150,80,220,' + (0.13 + 0.07 * Math.sin(tNow / 90)).toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(tg.x, tg.y, tg.r, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(216,180,255,0.85)'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(tg.x, tg.y, Math.max(2, tg.r * p), 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = 'rgba(240,200,255,0.95)'; ctx.lineWidth = 2;
      ctx.setLineDash([9, 7]); ctx.lineDashOffset = -tNow / 40;
      ctx.beginPath(); ctx.arc(tg.x, tg.y, tg.r, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    });
  }
  function bcSpawnMonsters() {
    if (!bcSession) return;
    var realmId = bcSession.realm, wdef = BC_WAVES[realmId];
    if (!wdef) return;
    wdef.waves.forEach(function (wave, wi) {
      wave.forEach(function (sp) {
        if (!monsterHasArt(sp.species)) return;
        var m = makeMonster(sp.species, wdef.zone, sp.x, sp.y, null);
        m.bcRealm = realmId; m.bcWave = wi; m.bcSession = bcSession.key;
        mons.push(m);
      });
    });
    var bossSpecies = L.SECRET_REALM_DEFS[realmId] ? L.SECRET_REALM_DEFS[realmId].boss : null;
    var bp = BC_BOSS_POS[realmId];
    if (bossSpecies && bp && monsterHasArt(bossSpecies)) {
      var boss = makeMonster(bossSpecies, wdef.zone, bp.x, bp.y, null);
      boss.bcRealm = realmId; boss.bcWave = -1; boss.bcBoss = true; boss.bcSession = bcSession.key;
      mons.push(boss);
    }
  }
  // Một đợt dọn xong (không còn quái sống của đợt đó) -> thưởng đợt qua
  // grantReward, khóa theo phiên + chỉ số đợt. Yêu đan đợt đã chạy qua
  // đường rơi hiện hữu normalKillDrops (2% thường / 25% tinh anh).
  function bcCheckWave(m) {
    if (!bcSession || !m || m.bcRealm !== bcSession.realm || m.bcWave == null || m.bcWave < 0) return;
    if (bcSession.wavesCleared[m.bcWave]) return;
    for (var i = 0; i < mons.length; i++) {
      var o = mons[i];
      if (o.bcRealm === bcSession.realm && o.bcWave === m.bcWave && o.state === 'alive') return;
    }
    bcSession.wavesCleared[m.bcWave] = true;
    var def = L.SECRET_REALM_DEFS[bcSession.realm];
    var r = L.grantReward(state, def.waveProfileId, { claimKey: bcSession.key + ':w' + m.bcWave, sourceId: bcSession.realm });
    if (r.ok) {
      sfxWaveClear();
      if (r.granted.tuvi > 0) spawnOrbs(9, m.x + 16, m.y + 16, r.granted.tuvi);
      toast('Đã dọn xong một đợt quái bí cảnh: +' + fmtAmt(r.granted.tuvi) + ' tu vi.', 4200);
    } else if (!r.duplicate) {
      toast('Thưởng đợt bí cảnh chưa nhận được: ' + (r.reason || 'lỗi không rõ') + '.', 4200);
    }
    refreshHUD(); saveNow();
    // ARCIV A.3: kỳ ngộ SP-01 — chạy Thủy Liêm sau q16_linh_ngo cũng
    // tích bộ đếm (kyNgoPool tự lọc mốc q16_linh_ngo của SP-01).
    if (bcSession.realm === 'bc_thuyliem' && L.questReached(state, 'q16_linh_ngo')) arcKyNgo(null);
  }
  // Thưởng boss bí cảnh. Lần đầu: ngoài hồ trần, kiểm túi nguyên tử
  // trước (không đủ chỗ -> 'bag_full', boss gượng dậy 5% máu, KHÔNG đặt
  // firstClear). Lặp: qua grantReward + yêu đan boss lặp rút 25% riêng
  // (không nằm trong hồ sơ phẳng).
  function bcBossKillRewards(m) {
    var realmId = bcSession ? bcSession.realm : m.bcRealm;
    var def = L.SECRET_REALM_DEFS[realmId];
    var rec = bcRealmRec(realmId);
    if (!def || !rec) return 'claimed';
    // ARCIV A.2: tầng sâu KHÔNG dùng bảng phẳng BC_FIRST_REWARDS (không
    // có mục cho realm này) — đường riêng qua bcSauFirstClearRewards.
    if (realmId === 'bc_kiemtrung_sau') return bcSauBossRewards(m, def, rec);
    if (!rec.firstClear) {
      var fw = BC_FIRST_REWARDS[realmId];
      var total = 0, id;
      for (id in fw.items) total += fw.items[id];
      var fits = L.bagUsed(state) + total <= L.bagCap(state);
      if (fits) for (id in fw.items) if (!L.bagCanAdd(state, id, fw.items[id]).ok) fits = false;
      if (!fits) {
        toast('Túi đã đầy — boss bí cảnh chưa gục hẳn đã gượng dậy. Hãy dọn túi rồi quay lại đánh tiếp; lần đầu này chưa bị tính là đã qua.', 5200);
        return 'bag_full';
      }
      for (id in fw.items) L.bagAdd(state, id, fw.items[id]);
      if (fw.tech) L.techniqueGain(state, fw.tech.id, fw.tech.pts);
      (fw.story || []).forEach(function (k) { if (state.unlocked.indexOf(k) < 0) state.unlocked.push(k); });
      if (fw.lt > 0) {
        var lr = L.addLinhThach(state, fw.lt);
        if (!lr.ok) rec.pendingLt = (rec.pendingLt || 0) + fw.lt; // ví khóa: trả ở lần vào sau
      }
      L.bcRecordClear(state, realmId);
      sfxFirstClear();
      var parts = [];
      if (fw.lt > 0) parts.push('+' + fmtAmt(fw.lt) + ' Linh Thạch');
      if (fw.tech) parts.push('+' + fw.tech.pts + ' điểm lĩnh ngộ ' + (L.TECHNIQUE_DEFS[fw.tech.id] ? L.TECHNIQUE_DEFS[fw.tech.id].name : fw.tech.id));
      for (id in fw.items) parts.push((L.ITEM_DEFS[id] ? L.ITEM_DEFS[id].name : id) + ' ×' + fw.items[id]);
      toast('Lần đầu qua ải ' + def.name + '! ' + parts.join(' · '), 5600);
      // Pháp bảo rơi lần đầu qua ải (đợt pháp bảo 2026-11-06): phẩm
      // theo dải bí cảnh; riêng tâm trận Trận Tâm là boss cuối tổ đội
      // nên rơi Cực phẩm. Hạt giống = khóa phiên bí cảnh.
      var pbFirst = L.rollTreasureDrop((bcSession ? bcSession.key : ('gr:bc:' + realmId + ':d' + state.dayCount)) + ':boss', realmId === 'bc_tran_tam_sau' ? 4 : L.treasureGradeForBand(def.band));
      if (pbFirst) {
        spawnDrop(pbFirst, 1, m.x + 16, m.y + 16);
        toast('Pháp bảo rơi: ' + L.ITEM_DEFS[pbFirst].name + ' — hãy nhặt lấy!', 5200);
      }
      arcIvBcBossFragment(realmId); // ARCIV A.3: mảnh ô 15/20 (Kiếm Trủng) / ô 14 + SP-01 (Thủy Liêm)
      refreshHUD(); saveNow();
      return 'claimed';
    }
    var r = L.grantReward(state, def.bossProfileId, { claimKey: bcSession.key + ':boss', sourceId: realmId, boss: true });
    if (!r.ok) {
      if (r.reason === 'bag_full') {
        toast('Túi đã đầy — boss bí cảnh chưa gục hẳn đã gượng dậy. Hãy dọn túi rồi quay lại đánh tiếp; lượt này chưa bị tính là đã hạ.', 5200);
        return 'bag_full';
      }
      if (r.duplicate) return 'claimed';
      toast('Thưởng boss bí cảnh chưa nhận được: ' + (r.reason || 'lỗi không rõ') + '.', 4200);
      return 'claimed';
    }
    if (huntSession) {
      huntSession.tuvi += r.granted.tuvi;
      for (var gid in r.granted.items) huntSession.items[gid] = (huntSession.items[gid] || 0) + r.granted.items[gid];
    }
    if (r.granted.tuvi > 0) spawnOrbs(9, m.x + 16, m.y + 16, r.granted.tuvi);
    var sid = (enc && enc.sessionId) || bcSession.key;
    if (L.yeuDanDropFor(sid, 0.25)) spawnDrop('yeu_dan_' + def.yeuDanLevel, 1, m.x + 16, m.y + 16);
    // Pháp bảo rơi từ boss bí cảnh (đợt pháp bảo 2026-11-06): phẩm
    // theo dải bí cảnh, tâm trận Trận Tâm rơi Cực phẩm; hạt giống là
    // khóa claim của lượt hạ (cùng khóa với hồ sơ thưởng).
    var pbBc = L.rollTreasureDrop(bcSession.key + ':boss', realmId === 'bc_tran_tam_sau' ? 4 : L.treasureGradeForBand(def.band));
    if (pbBc) {
      spawnDrop(pbBc, 1, m.x + 16, m.y + 16);
      toast('Pháp bảo rơi: ' + L.ITEM_DEFS[pbBc].name + ' — hãy nhặt lấy!', 5200);
    }
    toast('Hạ ' + m.name + '! ' + grindGrantedText(r) + '.', 5200);
    arcIvBcBossFragment(realmId); // ARCIV A.3: mảnh bí pháp theo nguồn boss bí cảnh
    refreshHUD(); saveNow();
    return 'claimed';
  }
  // Cửa Tàn Tích: một vật thể cho cả hai tầng + móc C-10 (luyện hồn).
  function bcTanTichInteract() {
    if (enc) { toast('Đang giao chiến — thoát trận rồi hãy vào tàn tích.'); return; }
    var rec = bcRealmRec('bc_tapsau');
    if (rec && L.questReached(state, 'q10_done') && rec.firstClear && !rec.soulLoopIntro) {
      var scene = ST[state.flags.soulPublic ? 'SCENE_C10_SOUL_A' : 'SCENE_C10_SOUL_B'];
      return say(scene, function () {
        rec.soulLoopIntro = true;
        refreshHUD(); saveNow();
        bcGateFloorChoice();
      });
    }
    bcGateFloorChoice();
  }
  function bcGateFloorChoice() {
    if (bcSession) return;
    var out = L.secretRealmUnlocked(state, 'bc_tapha');
    var deep = L.secretRealmUnlocked(state, 'bc_tapsau');
    if (out && deep) {
      return say([{ who: 'choice', text: 'Ngươi sẽ xuống tầng nào?', options: [
        { label: 'Tầng Ngoài — tàn tích dưới sảnh tháp', action: 'bc_floor_tapha' },
        { label: 'Tầng Sâu — phế tích dưới tầng ngoài', action: 'bc_floor_tapsau' }
      ] }]);
    }
    if (deep) return bcEnterWithIntro('bc_tapsau');
    if (out) return bcEnterWithIntro('bc_tapha');
    return say([{ who: 'narrate', text: BC_LOCK_LINES.bc_tapha }]);
  }
  // Các nhánh prop trong bí cảnh (đủ 9 prop cho cổng giọng).
  function bcVachInteract() {
    return say([{ who: 'narrate', text: BC_HINT_LINES.vach },
      { who: 'choice', text: 'Ngươi sẽ…', options: [
        { label: 'Dùng một đòn Phá Âm làm sập vách', action: 'bc_vach_pha' },
        { label: 'Đi đường vòng, tránh gây tiếng động', action: 'bc_vach_round' }
      ] }]);
  }
  function bcPheInteract() {
    return say([{ who: 'narrate', text: BC_HINT_LINES.phe },
      { who: 'choice', text: 'Ngươi sẽ…', options: [
        { label: 'Xếp lại chín mảnh sắc theo thứ tự cửu phẩm', action: 'bc_phe_sort' },
        { label: 'Dùng một đòn Chấn Âm mở cửa', action: 'bc_phe_chan' },
        { label: 'Để cửa này lại, quay lại sau', action: 'bc_phe_later' }
      ] }]);
  }
  function bcTranInteract() {
    if (L.isSessionHidden('bc_kiemtrung', 'cua_mo_that')) {
      return say([{ who: 'narrate', text: 'Tĩnh mặc trấn đã tan — cửa mộ thất phía bắc đã mở, không còn gì phong lại nữa.' }]);
    }
    return say([{ who: 'narrate', text: BC_HINT_LINES.tran }]);
  }
  function bcMoThatInteract() {
    return say([{ who: 'narrate', text: BC_HINT_LINES.tran }]);
  }
  function bcLetterInteract() {
    if (bcSession && bcSession.letterRead) {
      return say([{ who: 'narrate', text: BC_SUCCESS_LINES.reread }]);
    }
    return say(ST.SCENE_BC_HOIPHONG_THU, function () {
      if (bcSession) bcSession.letterRead = true;
      if (state.unlocked.indexOf('thu_trong_mo') < 0) state.unlocked.push('thu_trong_mo');
      refreshHUD(); saveNow();
    });
  }
  // Trò xếp sắc: chọn đúng mảnh kế tiếp theo PHE_THUOC_COLOR_ORDER; chọn
  // sai thì xếp lại từ đầu, không phạt. Nhãn lựa chọn chỉ là tên màu
  // (không lồng tiếng), gợi ý qua toast.
  function bcPresentColorChoice() {
    if (!bcColorSort) bcColorSort = { idx: 0 };
    var order = L.PHE_THUOC_COLOR_ORDER;
    var opts = order.map(function (c) { return { label: c, action: 'bc_phe_pick:' + c }; });
    toast('Xếp mảnh sắc thứ ' + (bcColorSort.idx + 1) + '/9 theo thứ tự cửu phẩm — chọn sai thì xếp lại từ đầu.', 3600);
    say([{ who: 'choice', text: '', options: opts }]);
  }
  function bcHoiphongBossAlive() {
    for (var i = 0; i < mons.length; i++) if (mons[i].bcBoss && mons[i].bcRealm === 'bc_hoiphong_mo' && mons[i].state === 'alive') return mons[i];
    return null;
  }
  function bcPresentHoiphongChoice() {
    if (!bcSession) return;
    bcSession.bossChoiceShown = true;
    say([{ who: 'narrate', text: 'Oán Hồn Chiến Trường cuộn xoáy giữa mộ thất, oán khí đặc quánh như sương. Ngươi sẽ đối mặt với nó bằng cách nào?' },
      { who: 'choice', text: 'Ngươi sẽ…', options: [
        { label: 'Đáp âm theo tên người chết trong thư', action: 'bc_hb_namecall' },
        { label: 'Trấn an oán hồn bằng hồn lực', action: 'bc_hb_soothe' },
        { label: 'Đánh thẳng — rút kiếm nghênh chiến', action: 'bc_hb_fight' },
        { label: 'Khoan đã — lùi lại suy tính', action: 'bc_hb_wait' }
      ] }]);
  }
  // Hai đường không-đánh của Cổ Mộ: qua ải qua cùng hồ sơ thưởng lần
  // đầu / lặp của bcBossKillRewards; túi đầy thì boss ở lại, lựa chọn
  // được trình lại khi người chơi quay lại khoang boss.
  function bcHoiphongClear() {
    var boss = bcHoiphongBossAlive();
    if (!boss) return;
    var r = bcBossKillRewards(boss);
    if (r === 'bag_full') { bcSession.bossChoiceShown = false; return; }
    boss.state = 'gone';
    refreshHUD(); saveNow();
  }
  function bcChoiceAction(action) {
    if (action === 'bc_floor_tapha') { grindCloseDlg(); return bcEnterWithIntro('bc_tapha'); }
    if (action === 'bc_floor_tapsau') { grindCloseDlg(); return bcEnterWithIntro('bc_tapsau'); }
    // ARCIV A.2: hai tầng của cụm kiếm Kiếm Trủng (tầng sâu qua bcSauGateOpen).
    if (action === 'bc_floor_kiemtrung_sau') { grindCloseDlg(); return bcEnterWithIntro('bc_kiemtrung_sau'); }
    if (action === 'bc_floor_kiemtrung') { grindCloseDlg(); return bcEnterWithIntro('bc_kiemtrung'); }
    if (action === 'bc_floor_tran_tam') { grindCloseDlg(); return bcEnterWithIntro('bc_tran_tam'); }
    if (action === 'bc_floor_tran_tam_sau') { grindCloseDlg(); return bcEnterWithIntro('bc_tran_tam_sau'); }
    if (action === 'bc_floor_later') { grindCloseDlg(); return toast('Ngươi để cụm kiếm đó lại, quay lại sau.', 3600); }
    if (action === 'bc_vach_pha') {
      var rv = L.castWord(state, 'pha');
      if (!rv.ok) return say([{ who: 'narrate', text: BC_HINT_LINES.vach }]); // thiếu Tĩnh Mặc: hiện lại gợi ý, không trừ gì
      L.recordSpeech(state, L.chapterOfQuest(state), 'bicanh_thuyliem', []);
      L.hideSessionProp('bc_thuyliem', 'vach_nut');
      sfxSealBreak(170);
      toast('Vách đá nứt sập xuống — lối tắt đã mở.', 3600);
      return refreshHUD(), saveNow();
    }
    if (action === 'bc_vach_round') {
      grindCloseDlg();
      return toast('Ngươi đi đường vòng, tránh gây tiếng động trong hang.', 3600);
    }
    if (action === 'bc_phe_sort') { bcColorSort = { idx: 0 }; return bcPresentColorChoice(); }
    if (action.indexOf('bc_phe_pick:') === 0) {
      var pick = action.slice('bc_phe_pick:'.length);
      var order = L.PHE_THUOC_COLOR_ORDER;
      if (!bcColorSort) bcColorSort = { idx: 0 };
      if (pick === order[bcColorSort.idx]) {
        bcColorSort.idx++;
        if (bcColorSort.idx >= order.length) {
          bcColorSort = null;
          L.hideSessionProp('bc_tapsau', 'cua_phe_thuoc');
          sfxChimeSmall();
          return say([{ who: 'narrate', text: BC_SUCCESS_LINES.phe }], function () { refreshHUD(); saveNow(); });
        }
        return bcPresentColorChoice();
      }
      bcColorSort.idx = 0;
      toast('Mảnh sắc này chưa đúng vị trí — xếp lại từ đầu.', 3600);
      return bcPresentColorChoice();
    }
    if (action === 'bc_phe_chan') {
      var rc = L.castWord(state, 'chan');
      if (!rc.ok) return say([{ who: 'narrate', text: BC_HINT_LINES.phe }]); // thiếu Tĩnh Mặc: hiện lại gợi ý, không trừ gì
      L.recordSpeech(state, L.chapterOfQuest(state), 'bicanh_tapsau', 'thap_chu');
      L.hideSessionProp('bc_tapsau', 'cua_phe_thuoc');
      sfxSealBreak(220);
      toast('Đòn Chấn Âm rung chuyển cửa phế thước — cửa đã mở.', 3600);
      return refreshHUD(), saveNow();
    }
    if (action === 'bc_phe_later') {
      grindCloseDlg();
      return toast('Ngươi để cửa phế thước đó lại, quay lại sau.', 3600);
    }
    if (action === 'bc_hb_namecall') {
      if (!bcSession || !bcSession.letterRead) {
        toast('Ngươi chưa đọc bức thư trong mộ — chưa biết phải nghe tìm âm gốc của ai. Hãy tìm bức thư trên đường vào mộ thất trước.', 4200);
        return bcPresentHoiphongChoice();
      }
      if (state.silence < 40) {
        toast('Tĩnh Âm chưa đủ 40 để đáp âm — hãy lắng nghe thêm rồi quay lại.', 4200);
        return bcPresentHoiphongChoice();
      }
      state.silence -= 40; // trừ trực tiếp, KHÔNG qua castWord (không vào WORD_SKILLS toàn cục)
      L.recordSpeech(state, L.chapterOfQuest(state), 'bicanh_hoiphong_mo', 'de_tu_ho_tong');
      sfxNameCall();
      refreshHUD(); saveNow();
      return say(ST.SCENE_BC_HOIPHONG_TRANTOI, function () {
        sfxGhostWail();
        bcHoiphongClear();
      });
    }
    if (action === 'bc_hb_soothe') {
      if ((state.soulRank || 0) < 2) {
        toast('Hồn lực của ngươi chưa đủ phẩm để trấn an oán hồn này.', 4200);
        return bcPresentHoiphongChoice();
      }
      if ((state.soulPower || 0) < 10) {
        toast('Hồn lực chưa đủ 10 để trấn an — hãy hồi phục rồi quay lại.', 4200);
        return bcPresentHoiphongChoice();
      }
      state.soulPower -= 10; // không ghi sổ, không sfxGhostWail — yên nghỉ lặng lẽ
      refreshHUD(); saveNow();
      return say([{ who: 'narrate', text: BC_SUCCESS_LINES.soothe }], function () { bcHoiphongClear(); });
    }
    if (action === 'bc_hb_fight') {
      grindCloseDlg();
      return toast('Ngươi rút kiếm, nghênh chiến với Oán Hồn Chiến Trường.', 3600);
    }
    if (action === 'bc_hb_wait') {
      grindCloseDlg();
      return toast('Ngươi chưa quyết — lựa chọn vẫn còn đó khi ngươi quay lại khoang boss.', 3600);
    }
  }
  // Nhịp phiên bí cảnh: bẫy hành lang Kiếm Trủng, tĩnh mặc trấn 20 giây,
  // và lựa chọn boss Cổ Mộ khi vào khoang boss lần đầu trong phiên.
  function bcTick(dt) {
    if (!bcSession || !state || dlg) return;
    var realmId = bcSession.realm;
    if (realmId === 'bc_kiemtrung' && !enc) {
      // Bẫy hành lang: ô P y=20 và y=22, x 10-36; chu kỳ 3 giây (1 giây
      // báo trước -> 1 giây kích hoạt -> 1 giây lặng), hồi bẫy 1,5 giây.
      bcSession.hazardT += dt;
      if (bcSession.hazardCd > 0) bcSession.hazardCd -= dt;
      var cycle = bcSession.hazardT % 3;
      var active = cycle >= 1 && cycle < 2;
      var pt = playerTile();
      if (active && bcSession.hazardCd <= 0 && (pt.y === 20 || pt.y === 22) && pt.x >= 10 && pt.x <= 36) {
        var dmg = Math.max(1, Math.floor(state.hpMax * 0.05));
        state.hp = Math.max(1, state.hp - dmg); // kẹp tối thiểu 1 — bẫy không giết được
        px = 23 * TILE; py = 24 * TILE; state.x = 23; state.y = 24; // đẩy về đầu hành lang
        bcSession.hazardCd = 1.5;
        sfxHazardHit();
        addDmgFloat(px + 16, py - 24, '-' + dmg, '255,110,100', { size: 19, targetKey: '__player' });
        toast('Kiếm khí quét qua hành lang — ngươi bị đẩy về đầu hành lang.', 3600);
        refreshHUD(); saveNow();
        return;
      }
      // Tĩnh mặc trấn: chỉ tích khi không có trận, đứng trong vòng bán
      // kính ~1,5 ô quanh trấn (tâm giữa footprint 22-25, hàng y=9); rời
      // vòng hoặc vào trận thì bộ đếm về 0. Đủ 20 giây liên tục -> tan.
      if (!L.isSessionHidden('bc_kiemtrung', 'cua_mo_that')) {
        var dx = pt.x - 23.5, dy = pt.y - 9;
        if (Math.hypot(dx, dy) <= 1.5) {
          bcSession.tranT += dt;
          if (bcSession.tranT >= 20) {
            bcSession.tranT = 0;
            L.hideSessionProp('bc_kiemtrung', 'cua_mo_that');
            /* Như đường đối hưởng: trấn tan phải dọn cả footprint trấn ở
               khe vách y=9, nếu không cửa mở mà đường vẫn bịt kín. */
            L.hideSessionProp('bc_kiemtrung', 'tinh_mac_tran');
            sfxTranFade();
            say([{ who: 'narrate', text: BC_SUCCESS_LINES.tran }], function () { refreshHUD(); saveNow(); });
            return;
          }
        } else bcSession.tranT = 0;
      }
    }
    if (realmId === 'bc_hoiphong_mo' && !enc && !bcSession.bossChoiceShown) {
      var pt2 = playerTile();
      if (pt2.y <= 9 && bcHoiphongBossAlive()) bcPresentHoiphongChoice();
    }
  }
  // Chết trong bí cảnh: hủy phiên, tỉnh ở cổng ngoài (điểm đến của
  // portal[0] của bản đồ bí cảnh) với 25% máu.
  function bcDefeat() {
    var oldMap = state.map;
    endEncounterCleanup();
    bcSession = null; bcColorSort = null;
    partyBotsLive = []; bcTelegraphs = [];
    if (L.clearSessionHiddenProps) L.clearSessionHiddenProps(oldMap);
    state.hp = Math.round(state.hpMax * 0.25);
    defeatGraceT = 3;
    var po = L.MAPS[oldMap] && L.MAPS[oldMap].portals[0];
    if (po) {
      fadeTransition(function () {
        state.map = po.to; state.x = po.toX; state.y = po.toY; state.dir = 'down';
        L.setActiveMap(po.to);
        px = po.toX * TILE; py = po.toY * TILE; facing = 'down';
        dir8 = DIR8_ROW4.down || 0;
        npcsLive = L.activeMap().npcs.map(function (n) { var pp = L.npcPosFor(state, n); return { id: n.id, name: n.name, look: n.look, x: pp.x, y: pp.y, dir: pp.dir }; });
        spawnMonstersForMap();
        setMinimapLabel();
        refreshHUD(); saveNow();
      });
    }
    toast('Ngươi gục trong bí cảnh... Khi tỉnh lại, ngươi đã ở cổng ngoài với 25% máu. Mọi thứ đã nhận trong chuyến này vẫn còn.', 5600);
    refreshHUD(); saveNow();
  }
  // Lớp phủ bí cảnh: ô bẫy kiếm trận theo pha, vòng trấn + cung tiến độ,
  // điểm hái (sẵn sáng / hết lượt mờ). Vẽ trong hệ tọa độ thế giới của render().
  function bcDrawOverlays() {
    if (!state) return;
    if (state.map === 'bc_kiemtrung' && bcSession) {
      var cycle = bcSession.hazardT % 3;
      var warn = cycle < 1, active = cycle >= 1 && cycle < 2;
      if (warn || active) {
        ctx.strokeStyle = active ? 'rgba(255,60,40,0.9)' : 'rgba(255,210,80,0.7)';
        ctx.fillStyle = active ? 'rgba(255,60,40,0.22)' : 'rgba(255,210,80,0.10)';
        ctx.lineWidth = 2;
        for (var hx = 10; hx <= 36; hx++) [20, 22].forEach(function (hy) {
          ctx.fillRect(hx * TILE, hy * TILE, TILE, TILE);
          ctx.strokeRect(hx * TILE + 1, hy * TILE + 1, TILE - 2, TILE - 2);
        });
      }
      if (!L.isSessionHidden('bc_kiemtrung', 'cua_mo_that')) {
        var cx = 24 * TILE, cy = 9 * TILE + 16, rr = Math.round(1.5 * TILE);
        ctx.strokeStyle = 'rgba(170,220,255,0.8)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(cx, cy, rr, 0, Math.PI * 2); ctx.stroke();
        if (bcSession.tranT > 0) {
          ctx.strokeStyle = 'rgba(255,240,190,0.95)'; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.arc(cx, cy, rr - 4, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, bcSession.tranT / 20)); ctx.stroke();
        }
      }
    }
    // Điểm trận Phong Ấn Hai Điểm của boss tổ đội: chỉ sáng khi boss
    // đang ở pha 'hold'; điểm đã có người giữ đổi màu xác nhận xanh.
    if (state.map === 'bc_tran_tam_sau' && enc && enc.mon && enc.mon.partyBoss && enc.mon.partyBoss.phase === 'hold') {
      var holdersNow = enc.mon.partyBoss.holders || {};
      PARTY_HOLD_PADS.forEach(function (pad) {
        var pcxp = pad.x * TILE + 16, pcyp = pad.y * TILE + 16, held = !!holdersNow[pad.key];
        var pulse = 0.6 + 0.3 * Math.sin(tNow / 260);
        var colP = held ? '140,255,170' : '216,180,255';
        var gradP = ctx.createLinearGradient(0, pcyp - 74, 0, pcyp);
        gradP.addColorStop(0, 'rgba(' + colP + ',0)');
        gradP.addColorStop(1, 'rgba(' + colP + ',' + (0.30 * pulse).toFixed(3) + ')');
        ctx.fillStyle = gradP; ctx.fillRect(pcxp - 10, pcyp - 74, 20, 74);
        ctx.strokeStyle = 'rgba(' + colP + ',' + pulse.toFixed(3) + ')'; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.ellipse(pcxp, pcyp, 1.6 * TILE, 1.6 * TILE * 0.42, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = 'rgba(' + colP + ',' + (0.16 + 0.10 * pulse).toFixed(3) + ')';
        ctx.beginPath(); ctx.ellipse(pcxp, pcyp, 1.6 * TILE, 1.6 * TILE * 0.42, 0, 0, Math.PI * 2); ctx.fill();
      });
    }
    // Điểm hái trên bản đồ hiện tại: sẵn thì sáng, hết lượt thì mờ.
    L.RESOURCE_NODES.forEach(function (nd) {
      if (nd.mapId !== state.map) return;
      var st = L.nodeStatus(state, nd.nodeId);
      var nx = nd.x * TILE + 16, ny = nd.y * TILE + 16;
      ctx.fillStyle = st.ready ? 'rgba(140,235,170,0.9)' : 'rgba(140,235,170,0.25)';
      ctx.beginPath();
      ctx.moveTo(nx, ny - 8); ctx.lineTo(nx + 8, ny); ctx.lineTo(nx, ny + 8); ctx.lineTo(nx - 8, ny);
      ctx.closePath(); ctx.fill();
    });
  }

  /* Tay nắm kiểm chứng cho hệ cày + bí cảnh (chỉ đọc, trừ board mở panel). */
  window.VSLC_GRIND = {
    session: function () { return bcSession ? { realm: bcSession.realm, key: bcSession.key, wavesCleared: JSON.parse(JSON.stringify(bcSession.wavesCleared)), tranT: bcSession.tranT, speechUsed: bcSession.speechUsed, letterRead: bcSession.letterRead, bossChoiceShown: bcSession.bossChoiceShown } : null; },
    poolLeft: function () { return state ? L.bcPoolLeft(state) : 0; },
    board: function (boardId) { return state ? L.generateBoard(state, boardId) : null; },
    instances: function () { if (!state) return {}; var g = L.ensureGrind(state); return JSON.parse(JSON.stringify(g.instances)); },
    colorSort: function () { return bcColorSort ? { idx: bcColorSort.idx } : null; },
    openBoard: openGrindBoard
  };

  /* ---------- Túi Trữ Vật (mở khóa ở chương 3) ---------- */
  /* Icon vật phẩm vẽ thật (đợt icon đồ ăn 2026-11-05): vật phẩm có
     trường icon trong ITEM_DEFS thì mọi bề mặt đang vẽ glyph ưu tiên vẽ
     ảnh icon; vật phẩm chưa có icon giữ glyph như cũ. Ảnh canvas nạp
     lười theo id, chưa nạp xong thì tạm vẽ glyph, xong tự thay. */
  function itemGlyphHtml(def) {
    return def.icon
      ? '<img class="bag-icon" src="' + def.icon + '" alt="">'
      : '<span class="bag-glyph">' + def.glyph + '</span>';
  }
  var ITEM_ICON_IMGS = {};
  function itemIconImage(id) {
    var def = L.ITEM_DEFS[id];
    if (!def || !def.icon) return null;
    var im = ITEM_ICON_IMGS[id];
    if (!im) { im = new Image(); im.src = def.icon; ITEM_ICON_IMGS[id] = im; }
    return (im.complete && im.naturalWidth > 0) ? im : null;
  }
  function renderBag() {
    var info = $('bag-info'), grid = $('bag-grid'), up = $('bag-upgrade');
    if (!info || !grid || !state) return;
    var bag = L.bagOf(state);
    var tdef = L.BAG_TIERS[bag.tier];
    // Đầu panel: icon vẽ thật + tên vật chứa hiện tại (túi/nhẫn trữ vật
    // theo tầng) — đợt trữ vật 2026-11-06. Tiêu đề panel cũng mang tên
    // vật chứa để người chơi thấy rõ mình đang dùng túi hay nhẫn.
    var title = $('bag-title');
    if (title && tdef) title.textContent = tdef.name;
    info.innerHTML = (tdef ? '<img class="bag-head-icon" src="' + tdef.icon + '" alt="">' : '') +
      '<span class="bag-container-name">' + (tdef ? tdef.name : 'Túi Trữ Vật') + '</span>' +
      '<span> — đã dùng ' + L.bagUsed(state) + '/' + L.bagCap(state) + ' ô chứa.</span>';
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
      cell.innerHTML = itemGlyphHtml(def) + '<span class="bag-name">' + def.name + '</span>' +
        (def.stack ? '<span class="bag-count">× ' + L.bagCount(state, id) + '</span>' : '<span class="bag-count">' + (def.worn ? 'Đang đeo' : 'Pháp khí') + '</span>');
      // Vật phẩm dùng được ngay trong túi (làn chạm trán): bí tịch thì
      // Đọc để lấy điểm tu luyện; yêu đan thì Đổi thành tu vi qua cửa cày.
      if (def.teaches || id.indexOf('yeu_dan_') === 0 || def.type === 'do_an') {
        var ub = document.createElement('button');
        ub.className = 'bag-use';
        ub.type = 'button';
        ub.textContent = def.type === 'do_an' ? 'Ăn' : (def.teaches ? 'Đọc' : 'Đổi tu vi');
        ub.addEventListener('click', function () { useBagItem(id); });
        cell.appendChild(ub);
      }
      grid.appendChild(cell);
    });
    // Ngăn riêng cốt truyện: liệt kê kinh thư/kiếm quyết ĐÃ SỞ HỮU (ghi
    // nhận qua state.unlocked, không tính sức chứa) — đợt nóng 3B sửa lỗi
    // nhận công pháp ở tháp xong mở túi vẫn trống vì panel không liệt kê
    // ngăn này. Chưa sở hữu món nào thì ẩn cả vùng.
    var storyBox = $('bag-story'), storyGrid = $('bag-story-grid');
    if (storyBox && storyGrid) {
      var owned = L.storyItemsOwned(state);
      storyGrid.innerHTML = '';
      owned.forEach(function (id) {
        var sdef = L.ITEM_DEFS[id];
        var scell = document.createElement('div');
        scell.className = 'bag-cell story';
        scell.innerHTML = itemGlyphHtml(sdef) + '<span class="bag-name">' + sdef.name + '</span>' +
          '<span class="bag-count">Cốt truyện</span>';
        storyGrid.appendChild(scell);
      });
      storyBox.classList.toggle('hidden', !owned.length);
    }
    if (up) {
      var next = L.BAG_TIERS[bag.tier + 1];
      up.classList.toggle('hidden', !next);
      if (next) up.textContent = 'Đổi sang ' + next.name + ' (' + next.cap + ' ô) — ' + next.price + ' Linh Thạch';
    }
  }
  function openBag() {
    if (!state || !state.flags.bagUnlocked) return; // chưa tới mốc mở khóa: không có giao diện túi
    sfxUi();
    renderBag();
    var p = $('bag-panel'); if (p) p.classList.remove('hidden');
  }
  function closeBag() { var p = $('bag-panel'); if (p) p.classList.add('hidden'); }
  onTap($('btn-bag'), openBag);
  onTap($('bag-close'), closeBag);

  /* ---------- Sổ Chỉ Dẫn cho game thủ (lệnh của Bui 07:25 ngày
     2026-11-05) ----------
     Nút mở nằm trong khung nhiệm vụ (bề mặt menu sẵn có — không đụng
     cụm 9 nút chiến đấu, không chồng vùng chơi). Nội dung lấy trọn từ
     L.guideChapters(state) — dữ kiện thật dựng trong logic.js; lớp này
     chỉ dựng DOM. Mở/đóng sổ KHÔNG đổi trạng thái nhân vật và KHÔNG
     gọi lưu: đóng sổ là quay lại đúng phiên chơi trước khi mở. */
  var guideChapterId = 'trucco';
  function renderGuide() {
    if (!state) return;
    var chapters = L.guideChapters(state);
    var toc = $('guide-toc'), body = $('guide-body');
    if (!toc || !body) return;
    toc.innerHTML = ''; body.innerHTML = '';
    var cur = null;
    chapters.forEach(function (c) { if (c.id === guideChapterId) cur = c; });
    if (!cur) { cur = chapters[0]; guideChapterId = cur.id; }
    chapters.forEach(function (c) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'guide-toc-btn' + (c.id === cur.id ? ' active' : '');
      b.textContent = c.title + (c.locked ? ' (khóa)' : '');
      b.setAttribute('data-guide-chapter', c.id);
      b.addEventListener('click', function () { guideChapterId = c.id; sfxUi(); renderGuide(); });
      toc.appendChild(b);
    });
    if (cur.locked) {
      var lock = document.createElement('p');
      lock.className = 'guide-lock';
      lock.textContent = cur.lockText;
      body.appendChild(lock);
      return;
    }
    cur.sections.forEach(function (sec) {
      var h = document.createElement('div');
      h.className = 'set-sec'; h.textContent = sec.h;
      body.appendChild(h);
      sec.lines.forEach(function (ln) {
        var p = document.createElement('p');
        p.className = 'guide-line'; p.textContent = ln;
        body.appendChild(p);
      });
      if (sec.checklist) {
        var box = document.createElement('div');
        box.className = 'guide-checks';
        sec.checklist.forEach(function (pt) {
          var row = document.createElement('div');
          row.className = 'guide-check' + (pt.ok ? ' ok' : '');
          row.setAttribute('data-guide-check', pt.id);
          var nm = document.createElement('span');
          nm.className = 'guide-check-name'; nm.textContent = pt.name;
          var val = document.createElement('span');
          val.className = 'guide-check-val';
          val.textContent = pt.cur + '/' + pt.need + (pt.ok ? ' — Đủ' : ' — Chưa đủ');
          row.appendChild(nm); row.appendChild(val);
          box.appendChild(row);
          if (pt.note) {
            var nt = document.createElement('div');
            nt.className = 'guide-check-note'; nt.textContent = pt.note;
            box.appendChild(nt);
          }
        });
        body.appendChild(box);
      }
    });
  }
  function openGuide() {
    if (!state) return;
    sfxUi();
    renderGuide();
    var p = $('guide-panel'); if (p) p.classList.remove('hidden');
  }
  function closeGuide() { var p = $('guide-panel'); if (p) p.classList.add('hidden'); }
  onTap($('btn-guide'), openGuide);
  onTap($('guide-close'), closeGuide);
  /* Tay nắm kiểm chứng Sổ Chỉ Dẫn: mở/đóng/chọn chương qua đúng đường
     panel dùng + đọc nội dung logic dựng, cho harness DOM lái thật.
     Tên cầu là VSLC_HANDBOOK — VSLC_GUIDE đã thuộc hệ dẫn đường nhiệm
     vụ (mũi tên chỉ mục tiêu), tuyệt đối không ghi đè. */
  window.VSLC_HANDBOOK = {
    open: openGuide, close: closeGuide,
    isOpen: function () { var p = $('guide-panel'); return !!p && !p.classList.contains('hidden'); },
    chapter: function () { return guideChapterId; },
    select: function (id) { guideChapterId = id; renderGuide(); },
    chapters: function () { return state ? L.guideChapters(state) : []; },
    checklist: function () { return state ? L.trucCoChecklist(state) : null; }
  };
  /* ---------- Bảng Nhân Vật đầy đủ (lệnh của Bui 00:47 ngày
     2026-11-06) ----------
     Chạm khung nhân vật góc trên trái (ô tên) để mở; các thẻ dựng từ
     L.charPanelData(state) — dữ kiện thật trong logic.js, lớp này chỉ
     dựng DOM. Đóng bằng nút ×, phím Esc hoặc chạm ra ngoài bảng.
     ĐỢT MỞ RỘNG (Bui duyệt cả hai nhóm + bố cục người giấy): thêm bốn
     thẻ Ngoại hình, Quan hệ, Bí cảnh và boss, Hành trình; mục Pháp
     khí độ kiếp + Thọ nguyên phòng thủ trong Tu luyện; mục Kỷ lục
     trong Tông môn; và thẻ TRANG BỊ kiểu người giấy làm thẻ mở đầu
     (mặc định khi mở bảng) — mười một thẻ tổng cộng.
     Nút Nâng cấp túi trong thẻ Túi gọi ĐÚNG cùng các bước của nút
     bag-upgrade của panel túi (spendLinhThach -> đổi tầng -> lưu),
     không đường tắt riêng: một lần bấm chỉ trừ tiền một lần.
     Nút Cài đặt ở chân bảng mở đúng panel cài đặt hiện hành qua
     VSLC_SETTINGS.openPanel. Đổi tên qua L.renameCharacter (kiểm hợp
     lệ như màn tạo nhân vật); chống trùng toàn hệ thống thuộc giai
     đoạn online, ghi chú ngay trong thẻ Tên. */
  var charTabId = 'trangbi';
  var charEquipCompare = false;
  var charTreasurePick = null; // ô pháp bảo đang mở khung chọn đeo (đợt pháp bảo 2026-11-06)
  var CHAR_TABS = [
    { id: 'trangbi', title: 'Trang bị' },
    { id: 'tuluyen', title: 'Tu luyện' },
    { id: 'chiso', title: 'Chỉ số' },
    { id: 'congphap', title: 'Công pháp' },
    { id: 'tui', title: 'Túi & trang bị' },
    { id: 'ten', title: 'Tên & danh hiệu' },
    { id: 'tongmon', title: 'Tông môn & TK' },
    { id: 'ngoa ihinh', title: 'Ngoại hình' },
    { id: 'quanhe', title: 'Quan hệ' },
    { id: 'bicanh', title: 'Bí cảnh & boss' },
    { id: 'hanhtrinh', title: 'Hành trình' }
  ];
  function charRow(body, k, v, cls) {
    var row = document.createElement('div'); row.className = 'char-row';
    var a = document.createElement('span'); a.className = 'char-k'; a.textContent = k;
    var b = document.createElement('span'); b.className = 'char-v' + (cls ? ' ' + cls : ''); b.textContent = v;
    row.appendChild(a); row.appendChild(b); body.appendChild(row); return row;
  }
  function charSec(body, h) {
    var el = document.createElement('div'); el.className = 'set-sec'; el.textContent = h; body.appendChild(el); return el;
  }
  function charNote(body, text) {
    var p = document.createElement('p'); p.className = 'char-note'; p.textContent = text; body.appendChild(p); return p;
  }
  function charBar(body, pct, color) {
    var bar = document.createElement('div'); bar.className = 'char-bar';
    var fill = document.createElement('div');
    fill.style.width = Math.max(0, Math.min(100, pct)) + '%';
    fill.style.background = color;
    bar.appendChild(fill); body.appendChild(bar); return bar;
  }
  function fmtPlayDuration(sec) {
    sec = Math.max(0, Math.floor(sec || 0));
    var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    if (h > 0) return h + ' giờ ' + m + ' phút';
    if (m > 0) return m + ' phút ' + s + ' giây';
    return s + ' giây';
  }
  function renderCharPanel() {
    if (!state) return;
    var d = L.charPanelData(state);
    if (!d) return;
    var tabs = $('char-tabs'), body = $('char-body');
    if (!tabs || !body) return;
    tabs.innerHTML = ''; body.innerHTML = '';
    CHAR_TABS.forEach(function (t) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'char-tab-btn' + (t.id === charTabId ? ' active' : '');
      b.textContent = t.title;
      b.setAttribute('data-char-tab', t.id);
      b.addEventListener('click', function () { charTabId = t.id; sfxUi(); renderCharPanel(); });
      tabs.appendChild(b);
    });
    if (charTabId === 'trangbi') {
      var eq = d.equip;
      var pw = document.createElement('div');
      pw.className = 'char-power';
      var pwL = document.createElement('div'); pwL.className = 'char-power-label'; pwL.textContent = 'Tổng lực chiến';
      var pwV = document.createElement('div'); pwV.className = 'char-power-value'; pwV.textContent = String(d.combatPower);
      pw.appendChild(pwL); pw.appendChild(pwV); body.appendChild(pw);
      function charSlot(label, title, sub, opts) {
        opts = opts || {};
        var sl = document.createElement('div');
        sl.className = 'char-slot' + (opts.empty ? ' empty' : '') + (opts.onClick ? ' clickable' : '');
        if (opts.domId) sl.id = opts.domId;
        var lb = document.createElement('div'); lb.className = 'char-slot-label'; lb.textContent = label;
        var nm = document.createElement('div'); nm.className = 'char-slot-name'; nm.textContent = title;
        sl.appendChild(lb);
        if (opts.icon) {
          var ic = document.createElement('img');
          ic.className = 'char-slot-icon'; ic.src = opts.icon; ic.alt = '';
          sl.appendChild(ic);
        }
        sl.appendChild(nm);
        if (sub) { var sb = document.createElement('div'); sb.className = 'char-slot-sub'; sb.textContent = sub; sl.appendChild(sb); }
        if (opts.onClick) sl.addEventListener('click', opts.onClick);
        return sl;
      }
      var doll = document.createElement('div'); doll.className = 'char-doll';
      var colL = document.createElement('div'); colL.className = 'char-doll-col';
      colL.appendChild(charSlot('Kiếm', eq.sword.equipped ? eq.sword.equipped.name : 'Chưa có vũ khí',
        eq.sword.equipped ? ('Kiếm +' + eq.sword.equipped.sword + ' · Hưởng +' + eq.sword.equipped.word + ' — bấm để so sánh vũ khí trong túi') : '',
        { domId: 'char-slot-sword', onClick: function () { charEquipCompare = !charEquipCompare; renderCharPanel(); } }));
      colL.appendChild(charSlot('Ngự kiếm', eq.fly.learned ? 'Đã học ngự kiếm' : 'Chưa học',
        eq.fly.learned ? (eq.fly.stage != null ? ('Giai đoạn ' + eq.fly.stage + ' — kiếm bay bên cạnh khi di chuyển') : 'Kiếm bay bên cạnh khi di chuyển') : 'Học tại Thanh Vân Tông sau Trúc Cơ',
        { empty: !eq.fly.learned }));
      var colR = document.createElement('div'); colR.className = 'char-doll-col';
      colR.appendChild(charSlot('Vật chứa', eq.storage.name ? eq.storage.name : ('Túi trữ vật — tầng ' + eq.storage.tier),
        eq.storage.unlocked ? ('Sức chứa ' + eq.storage.cap + ' món') : 'Chưa mở — mở ở chương 3', {}));
      // Ba ô pháp bảo (đợt pháp bảo 2026-11-06): bấm ô mở khung chọn
      // đeo từ túi / tháo về túi — toàn bộ luật ở L.equipTreasure /
      // L.unequipTreasure, lớp này chỉ lái giao diện.
      function treasureSlotEl(tr) {
        return charSlot(tr.label, tr.item ? tr.item.name : 'Trống',
          tr.item ? (tr.item.fxText + ' — bấm để đổi hoặc tháo') : 'Chưa có pháp bảo — bấm để xem trong túi',
          { empty: !tr.item, domId: 'char-slot-treasure-' + tr.key, icon: tr.item ? tr.item.icon : null,
            onClick: function () { charTreasurePick = (charTreasurePick === tr.key) ? null : tr.key; renderCharPanel(); } });
      }
      var trCong = eq.treasures.slots[0];
      colR.appendChild(treasureSlotEl(trCong));
      var center = document.createElement('div'); center.className = 'char-doll-center';
      // Hào quang theo phẩm cao nhất đang đeo (chỉ trong bảng).
      if (eq.aura && eq.aura.key && eq.aura.key !== 'none') {
        var au = document.createElement('div');
        au.className = 'char-aura char-aura-' + eq.aura.key;
        au.setAttribute('data-aura', eq.aura.key);
        au.style.background = 'radial-gradient(circle, rgba(' + eq.aura.color + ',0.6) 0%, rgba(' + eq.aura.color + ',0.3) 52%, rgba(' + eq.aura.color + ',0) 78%)';
        center.appendChild(au);
      }
      var fig = document.createElement('div'); fig.className = 'char-fig';
      var FIG_SCALE = 1.25;
      fig.style.width = (eq.figure.cellW * FIG_SCALE) + 'px';
      fig.style.height = (eq.figure.cellH * FIG_SCALE) + 'px';
      fig.style.backgroundImage = 'url(' + eq.figure.sheet + ')';
      fig.style.backgroundSize = (eq.figure.sheetW * FIG_SCALE) + 'px ' + (eq.figure.sheetH * FIG_SCALE) + 'px';
      fig.style.backgroundPosition = '0px 0px';
      center.appendChild(fig);
      if (eq.fly.learned) {
        var fs = document.createElement('div'); fs.className = 'char-flysword';
        fs.textContent = (eq.sword.equipped && eq.sword.equipped.glyph) || 'Kiếm';
        center.appendChild(fs);
      }
      var cap = document.createElement('div'); cap.className = 'char-doll-caption';
      cap.textContent = d.name + ' — ' + d.realmLabel + (eq.figure.silver ? ' · Tóc bạc' : '');
      center.appendChild(cap);
      doll.appendChild(colL); doll.appendChild(center); doll.appendChild(colR);
      body.appendChild(doll);
      var rowB = document.createElement('div'); rowB.className = 'char-doll-row';
      [1, 2].forEach(function (ix) {
        rowB.appendChild(treasureSlotEl(eq.treasures.slots[ix]));
      });
      body.appendChild(rowB);
      var src = document.createElement('div'); src.className = 'char-note';
      src.textContent = 'Pháp bảo rơi từ boss và bí cảnh, hoặc đổi bằng điểm cống hiến tông môn.';
      body.appendChild(src);
      var pin = document.createElement('div'); pin.className = 'char-tribpin';
      pin.textContent = 'Ghim pháp khí độ kiếp — Hộ Thể Đan: ' + d.tribItems.hoTheDan + ' viên · Tị Lôi Phù: ' + d.tribItems.tiLoiPhu + ' lá';
      body.appendChild(pin);
      if (charTreasurePick) {
        var pickSlot = null;
        eq.treasures.slots.forEach(function (tr) { if (tr.key === charTreasurePick) pickSlot = tr; });
        if (pickSlot) {
          charSec(body, 'Đeo pháp bảo — ' + pickSlot.label);
          if (pickSlot.item) {
            charRow(body, 'Đang đeo', pickSlot.item.name + ' (' + pickSlot.item.fxText + ')');
            var unWrap = document.createElement('div'); unWrap.className = 'char-actions';
            var unBtn = document.createElement('button');
            unBtn.type = 'button'; unBtn.className = 'btn wood'; unBtn.id = 'char-treasure-unequip';
            unBtn.textContent = 'Tháo ' + pickSlot.item.name + ' về túi';
            unBtn.addEventListener('click', function () {
              var ru = L.unequipTreasure(state, pickSlot.key);
              toast(ru.ok ? ('Đã tháo ' + L.ITEM_DEFS[ru.item].name + ' về Túi Trữ Vật.') : ru.reason, 3600);
              if (ru.ok) { sfxUi(); saveNow(); }
              renderCharPanel();
            });
            unWrap.appendChild(unBtn); body.appendChild(unWrap);
          }
          var cands = (eq.treasureBag && eq.treasureBag[pickSlot.key]) || [];
          if (!cands.length) charNote(body, 'Trong túi chưa có pháp bảo thuộc ô này. Pháp bảo rơi từ boss và bí cảnh, hoặc đổi bằng điểm cống hiến ở quản sự tông môn.');
          cands.forEach(function (c) {
            var cw = document.createElement('div'); cw.className = 'char-actions';
            var cb = document.createElement('button');
            cb.type = 'button'; cb.className = 'btn wood char-treasure-btn';
            cb.setAttribute('data-treasure-id', c.id);
            cb.textContent = 'Đeo ' + c.name + ' — ' + c.fxText;
            cb.addEventListener('click', function () {
              var re = L.equipTreasure(state, c.id);
              toast(re.ok ? ('Đã đeo ' + L.ITEM_DEFS[re.equipped].name + ' (' + L.treasureFxText(L.TREASURE_DEFS[re.equipped]) + ').') : re.reason, 3600);
              if (re.ok) { sfxQuest(); saveNow(); }
              renderCharPanel();
            });
            cw.appendChild(cb); body.appendChild(cw);
          });
        }
      }
      if (charEquipCompare) {
        charSec(body, 'So sánh vũ khí trong túi');
        if (!eq.sword.inBag.length) charNote(body, 'Túi chưa có vũ khí nào.');
        eq.sword.inBag.forEach(function (w) {
          charRow(body, w.name + (w.equipped ? ' (đang đeo)' : ''), 'Kiếm +' + w.sword + ' · Hưởng +' + w.word);
        });
        charNote(body, 'Luật trang bị của game không đổi: cây kiếm mạnh nhất trong túi tự là cây đang đeo.');
      }
    } else if (charTabId === 'tuluyen') {
      charRow(body, 'Nhân vật', d.name);
      charRow(body, 'Cảnh giới', d.realmLabel);
      charRow(body, 'Linh căn', d.linhCan);
      charSec(body, 'Tu vi');
      charRow(body, 'Tu vi hiện tại', d.tuviNeed ? (L.fmtNum(d.tuviCur) + ' / ' + L.fmtNum(d.tuviNeed)) : (L.fmtNum(d.tuviCur) + ' (không còn trần tầng)'));
      if (d.tuviNeed) charBar(body, d.tuviCur / d.tuviNeed * 100, 'linear-gradient(90deg,#4e7fa0,#7fb2d9)');
      charRow(body, 'Máu', L.fmtNum(d.hpCur) + ' / ' + L.fmtNum(d.hpMax));
      charBar(body, d.hpMax > 0 ? d.hpCur / d.hpMax * 100 : 0, 'linear-gradient(90deg,#a03a30,#e0704e)');
      charRow(body, 'Tĩnh Âm', d.silenceCur + ' / ' + d.silenceMax);
      charBar(body, d.silenceCur / d.silenceMax * 100, 'linear-gradient(90deg,#c9a227,#f3d94e)');
      charSec(body, 'Đột phá cấp tiếp theo');
      var bt = d.breakthrough;
      if (!bt || bt.kind === 'none' || !bt.targetLabel) {
        charNote(body, 'Hiện chưa có mốc đột phá tiếp theo trong lộ trình đã mở.');
      } else {
        charRow(body, 'Đích tới', bt.targetLabel);
        d.conditions.forEach(function (c) {
          var v = (typeof c.cur === 'number' && typeof c.need === 'number') ? (L.fmtNum(c.cur) + '/' + L.fmtNum(c.need) + ' — ') : '';
          charRow(body, c.label, v + (c.ok ? 'Đủ' : 'Chưa đủ'), c.ok ? 'good' : 'bad');
          if (c.hint && !c.ok) charNote(body, c.hint);
        });
        if (bt.tribulation) charNote(body, 'Đích là đại cảnh giới: phải qua thiên kiếp ' + bt.tribulation.bolts + ' đạo lôi tại đài độ kiếp.' + (bt.tribulation.open ? '' : ' Nội dung độ kiếp của mốc này chưa mở.'));
        if (d.trucCo) {
          charSec(body, 'Danh sách kiểm Trúc Cơ Đan (như Sổ Chỉ Dẫn)');
          d.trucCo.parts.forEach(function (p) {
            charRow(body, p.name, L.fmtNum(p.cur) + '/' + L.fmtNum(p.need) + ' — ' + (p.ok ? 'Đủ' : 'Chưa đủ'), p.ok ? 'good' : 'bad');
          });
        }
      }
      charSec(body, 'Pháp khí độ kiếp');
      charRow(body, 'Hộ Thể Đan (chắn ' + Math.round(L.TRIB_DAN_CUT * 100) + '% một đạo lôi)', L.fmtNum(d.tribItems.hoTheDan) + ' viên');
      charRow(body, 'Tị Lôi Phù (chắn ' + Math.round(L.TRIB_PHU_CUT * 100) + '% một đạo lôi)', L.fmtNum(d.tribItems.tiLoiPhu) + ' lá');
      charNote(body, 'Số đếm thẳng từ túi hiện tại — lo đủ hai món này trước khi lên đài độ kiếp.');
      if (d.lifespan) {
        charSec(body, 'Thọ nguyên');
        charRow(body, 'Thọ nguyên còn lại', L.fmtNum(d.lifespan.value) + ' năm');
      }
    } else if (charTabId === 'chiso') {
      charRow(body, 'Sức mạnh kiếm (công)', L.fmtNum(d.stats.swordPower));
      charRow(body, 'Cộng kiếm từ vũ khí đang đeo', '+' + d.stats.weaponSword);
      charRow(body, 'Cộng hưởng từ vũ khí đang đeo', '+' + d.stats.weaponWord);
      charRow(body, 'Máu tối đa', L.fmtNum(d.hpMax));
      charRow(body, 'Tĩnh Âm tối đa', String(d.silenceMax));
      var critRow = charRow(body, 'Tỉ lệ chí mạng', Math.round(CRIT_CHANCE * 100) + '%');
      critRow.setAttribute('data-char-crit', String(CRIT_CHANCE));
      charRow(body, 'Sát thương chí mạng', '×' + CRIT_MULT);
      charRow(body, 'Tốc độ thổ nạp', d.stats.meditateRate + ' tu vi/giây');
      charRow(body, 'Hồi Tĩnh Âm khi thổ nạp', d.stats.silenceRate + ' điểm/giây');
      charNote(body, 'Game không có một chỉ số thủ riêng: sát thương phải nhận được giảm qua hộ pháp, đan và phù trong độ kiếp cùng các bộ phòng ngự đã học — không có con số thủ cố định để hiện.');
    } else if (charTabId === 'congphap') {
      charSec(body, 'Công pháp đã học');
      if (!d.techniques.length) charNote(body, 'Chưa học công pháp nào. Thất Tinh Kiếm Quyết và Thanh Phong Chân Kinh sẽ tới theo mạch truyện chương 3.');
      d.techniques.forEach(function (t) {
        charRow(body, t.name + (t.active ? ' (đang vận hành)' : ''), 'Tầng ' + t.tier);
        charNote(body, 'Điểm tu luyện: ' + L.fmtNum(t.xp) + (t.nextXp ? ' / ' + L.fmtNum(t.nextXp) + ' để lên tầng ' + (t.tier + 1) : ' — đã tới tầng cao nhất của khung hiện tại') + '.');
      });
      if (d.swordMoves.length) {
        charSec(body, 'Chiêu kiếm dùng được');
        d.swordMoves.forEach(function (mv) {
          charRow(body, mv.name, '×' + String(Math.round(mv.mult * 100)) + '%' + (mv.hits > 1 ? ' × ' + mv.hits + ' đòn' : ''));
        });
      }
      charSec(body, 'Vạn Âm Cộng Hưởng');
      d.wordSkills.forEach(function (w) {
        charRow(body, w.word, w.unlocked ? ('Uy lực ' + w.power + ' ở Tĩnh Âm hiện tại · tốn ' + w.cost + ' Tĩnh Âm') : 'Chưa mở', w.unlocked ? '' : 'bad');
      });
      charRow(body, 'Sổ Dư Âm', d.ledgerCount + ' sự kiện đã ghi');
      charRow(body, 'Số lần đã cất tiếng', String(d.timesSpoken));
      if (d.soulRank > 0) charRow(body, 'Hồn Sư (thân phận giấu kín)', 'Phẩm ' + d.soulRank);
      if (d.flyLearned) charRow(body, 'Ngự kiếm', 'Đã học — bay 198 điểm ảnh/giây');
    } else if (charTabId === 'tui') {
      charSec(body, 'Túi Trữ Vật');
      if (!d.bag.unlocked) {
        charNote(body, 'Túi Trữ Vật chưa mở — túi mở theo mạch truyện ở chương 3. Trước mốc đó, kiếm khởi đầu vẫn đeo trên người.');
      } else {
        charRow(body, 'Sức chứa', d.bag.used + ' / ' + d.bag.cap + ' món (tầng ' + d.bag.tier + ')');
        if (d.bag.container) charRow(body, 'Vật chứa', d.bag.container);
        charBar(body, d.bag.cap > 0 ? d.bag.used / d.bag.cap * 100 : 0, 'linear-gradient(90deg,#7d623c,#c9a227)');
        if (d.bag.next) {
          var wrap = document.createElement('div'); wrap.className = 'char-actions';
          var up = document.createElement('button');
          up.type = 'button'; up.className = 'btn wood'; up.id = 'char-bag-upgrade';
          up.textContent = 'Nâng cấp túi lên tầng ' + d.bag.next.tier + ' (' + d.bag.next.cap + ' ô) — ' + d.bag.next.price + ' Linh Thạch';
          up.addEventListener('click', charBagUpgrade);
          wrap.appendChild(up); body.appendChild(wrap);
        } else charNote(body, 'Túi đã ở tầng cao nhất.');
      }
      charSec(body, 'Trang bị');
      charRow(body, 'Vũ khí đang đeo', d.weapon ? d.weapon.name : 'Không có');
      if (d.weapon) charNote(body, 'Chỉ số cộng thêm: +' + d.weapon.sword + ' sức mạnh kiếm, +' + d.weapon.word + ' uy lực cộng hưởng. Vũ khí mạnh nhất trong số đang sở hữu là cây đang đeo — vũ khí tốt hơn thay thế, không cộng dồn.');
      charSec(body, 'Tiền tệ');
      charRow(body, 'Linh Thạch', d.linhThach.open ? L.fmtNum(d.linhThach.balance) : 'Chưa mở — phàm nhân chưa dùng được, ví mở khi bắt đầu tu tiên');
      charRow(body, 'Bạc (tiền phàm tục)', L.fmtNum(d.bag.silver) + ' lượng');
    } else if (charTabId === 'ten') {
      charSec(body, 'Tên nhân vật');
      charRow(body, 'Tên hiện tại', d.name);
      var rw = document.createElement('div'); rw.className = 'char-rename';
      var inp = document.createElement('input');
      inp.type = 'text'; inp.id = 'char-rename-input'; inp.maxLength = L.CHAR_NAME_MAX;
      inp.value = d.name; inp.setAttribute('aria-label', 'Tên nhân vật mới');
      var btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'btn wood'; btn.id = 'char-rename-btn'; btn.textContent = 'Đổi tên';
      rw.appendChild(inp); rw.appendChild(btn); body.appendChild(rw);
      var msg = document.createElement('div'); msg.className = 'char-msg'; msg.id = 'char-rename-msg';
      body.appendChild(msg);
      btn.addEventListener('click', function () {
        if (!state) return;
        var r = L.renameCharacter(state, inp.value);
        if (!r.ok) { msg.textContent = r.reason; msg.classList.add('error'); return; }
        msg.classList.remove('error');
        msg.textContent = 'Đã đổi tên thành ' + r.name + '.';
        var hn = $('hud-name'); if (hn) hn.textContent = r.name; // khung nhân vật góc trái: tên do startGame ghi, refreshHUD không chạm — cập nhật thẳng tại đây
        sfxQuest(); refreshHUD(); saveNow(); renderCharPanel();
      });
      charNote(body, 'Tên mới hiện trong mọi lời thoại, nhãn người nói và tuyên cáo Thiên Đạo khi độ kiếp. Kiểm hợp lệ như màn tạo nhân vật: tối đa ' + L.CHAR_NAME_MAX + ' ký tự, không để trống. Chống trùng tên toàn hệ thống cần danh bạ phía máy chủ — thuộc giai đoạn online, bản chơi đơn này chưa áp.');
      charSec(body, 'Danh hiệu');
      charNote(body, 'Game hiện chưa có hệ danh hiệu cho người chơi (danh hiệu đang có chỉ là danh xưng của NPC và boss hiện trên đầu chúng). Mục này để trống có chủ đích — không hiện dữ kiện không có thật.');
    } else if (charTabId === 'tongmon') {
      charSec(body, 'Tông môn');
      charRow(body, 'Tông môn', d.sect.joined ? d.sect.name : 'Chưa nhập tông môn');
      charRow(body, 'Điểm cống hiến', L.fmtNum(d.sect.merit));
      charNote(body, 'Game chưa có trường chức vụ riêng cho người chơi; sau khi nhập Thanh Vân Tông (xong chương 7), thân phận trong tông được thể hiện qua mạch truyện và điểm cống hiến.');
      charSec(body, 'Thống kê chơi');
      charRow(body, 'Quái đã hạ', L.fmtNum(d.play.kills));
      charRow(body, 'Trong đó quái tinh anh', L.fmtNum(d.play.elites));
      charRow(body, 'Boss đã hạ', L.fmtNum(d.play.bosses));
      charRow(body, 'Lần độ kiếp thành công', L.fmtNum(d.play.tribulations));
      charRow(body, 'Ngày game đã qua', L.fmtNum(d.play.dayCount));
      charRow(body, 'Thời gian chơi', fmtPlayDuration(d.play.playSec));
      charNote(body, 'Bộ đếm thống kê bắt đầu tính từ bản cập nhật bảng nhân vật này — phần chơi trước đó không truy hồi được nên khởi đầu bằng 0.');
      charSec(body, 'Kỷ lục');
      charRow(body, 'Đòn đánh mạnh nhất từng tung', L.fmtNum(d.records.maxHit) + ' sát thương');
      charRow(body, 'Tổng Linh Thạch kiếm được', L.fmtNum(d.records.ltEarned));
      charRow(body, 'Tổng yêu đan thu được', L.fmtNum(d.records.yeuDan) + ' viên');
      charNote(body, 'Ba kỷ lục này đếm từ bản mở rộng bảng nhân vật: đòn mạnh nhất ghi tại các điểm áp sát thương của người chơi, Linh Thạch tại điểm cộng ví trung tâm, yêu đan tại điểm nhận vật phẩm trung tâm — không truy hồi phần chơi trước.');
    } else if (charTabId === 'ngoa ihinh') {
      var ap = d.appearance;
      var pw = document.createElement('div'); pw.className = 'char-portrait-wrap';
      var pimg = document.createElement('img');
      pimg.className = 'char-portrait'; pimg.src = ap.portrait; pimg.alt = 'Chân dung ' + d.name;
      pw.appendChild(pimg); body.appendChild(pw);
      charRow(body, 'Tên', d.name);
      charRow(body, 'Giới tính', ap.genderLabel);
      charRow(body, 'Tóc', ap.hairLabel);
      charRow(body, 'Vũ khí đang đeo', ap.weapon ? ap.weapon.name : 'Không có');
      if (ap.weapon) charNote(body, 'Cộng thêm: +' + ap.weapon.sword + ' sức mạnh kiếm, +' + ap.weapon.word + ' uy lực cộng hưởng.');
      charRow(body, 'Ngự kiếm', ap.fly.learned ? 'Đã học — có thể bay trên kiếm' : 'Chưa học');
      if (ap.fly.stage != null && ap.fly.stage > 0) charRow(body, 'Giai đoạn ngự kiếm', String(ap.fly.stage));
    } else if (charTabId === 'quanhe') {
      charSec(body, 'Hảo cảm');
      if (!d.relationships.recorded || !d.relationships.list.length) {
        charNote(body, 'Chưa ghi nhận hảo cảm với nhân vật nào. Hảo cảm được ghi khi ngươi tặng quà cho mọi người (thanh module hiện ra lúc chạm vào họ) — có dữ kiện là thẻ này tự liệt kê.');
      } else {
        d.relationships.list.forEach(function (r) {
          charRow(body, r.name, L.fmtNum(r.points) + ' điểm — ' + r.band);
        });
        charNote(body, 'Mốc danh xưng: 0–19 điểm Xa lạ · 20–49 Thân quen · 50–99 Thân thiết · từ 100 Tri kỷ.');
      }
    } else if (charTabId === 'bicanh') {
      charSec(body, 'Bí cảnh');
      charRow(body, 'Lượt vào còn lại hôm nay', d.realms.poolLeft + ' / ' + d.realms.poolMax + ' lượt');
      charNote(body, 'Kho lượt chung cho mọi bí cảnh; lượt vào lần đầu của từng bí cảnh không tính vào kho.');
      d.realms.list.forEach(function (r) {
        var rv = !r.unlocked ? 'Chưa mở khóa' : (r.firstClear ? 'Đã thông quan ' + L.fmtNum(r.totalClears) + ' lần' : 'Đã mở — chưa thông quan');
        charRow(body, r.name + ' (' + r.band + ')', rv, r.unlocked ? '' : 'bad');
        if (r.extraLocked) charNote(body, r.extraLocked + '.');
      });
      charSec(body, 'Boss dã ngoại');
      d.wildBosses.forEach(function (b) {
        var bv = b.state === 'alive' ? 'Đang sống — có thể săn' : (b.state === 'claimed' ? 'Đã hạ chu kỳ này — còn ' + b.daysLeft + ' ngày tới chu kỳ mới' : 'Chưa mở');
        charRow(body, b.name, bv, b.state === 'alive' ? 'good' : '');
        if (b.title) charNote(body, b.title + ' · hồi sinh theo chu kỳ ' + b.cycleDays + ' ngày.');
      });
    } else if (charTabId === 'hanhtrinh') {
      charSec(body, 'Sổ hành trình');
      if (!d.journal.entries.length) {
        charNote(body, 'Sổ hành trình bắt đầu ghi từ bản cập nhật này — từ nay mỗi mốc lớn (đột phá cảnh giới, độ kiếp thành công, hạ boss, hoàn thành chương truyện chính) sẽ được ghi vào đây kèm mốc thời gian chơi.');
      } else {
        d.journal.entries.slice().reverse().forEach(function (e) {
          charRow(body, fmtPlayDuration(e.at), e.text);
        });
        charNote(body, 'Sổ giữ tối đa ' + L.JOURNAL_MAX + ' mốc gần nhất, mốc mới nhất ở trên cùng; giờ ghi là thời gian chơi tích lũy lúc sự kiện xảy ra.');
      }
    }
  }
  /* Nâng cấp túi từ thẻ Túi: lặp đúng các bước của nút bag-upgrade
     trong panel túi (trừ Linh Thạch qua spendLinhThach -> đổi tầng ->
     thông báo -> lưu) để một lần bấm chỉ trừ tiền đúng một lần. */
  function charBagUpgrade() {
    if (!state) return;
    var bag = L.bagOf(state);
    var next = L.BAG_TIERS[bag.tier + 1];
    if (!next) return;
    var r = L.spendLinhThach(state, next.price);
    if (!r.ok) { toast(r.reason); return; }
    state.bag.tier = next.tier;
    sfxQuest();
    toast('Đã nâng cấp Túi Trữ Vật lên tầng ' + next.tier + ' (' + next.cap + ' ô chứa).');
    refreshHUD(); saveNow(); renderCharPanel();
  }
  function openCharPanel() {
    if (!state) return;
    sfxUi();
    renderCharPanel();
    var p = $('char-panel'); if (p) p.classList.remove('hidden');
  }
  function closeCharPanel() { var p = $('char-panel'); if (p) p.classList.add('hidden'); }
  onTap($('char-frame'), function () { if (state) openCharPanel(); });
  onTap($('char-close'), closeCharPanel);
  onTap($('char-settings-btn'), function () {
    closeCharPanel();
    if (window.VSLC_SETTINGS && window.VSLC_SETTINGS.openPanel) window.VSLC_SETTINGS.openPanel();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeCharPanel();
  });
  document.addEventListener('pointerdown', function (e) {
    var p = $('char-panel');
    if (!p || p.classList.contains('hidden')) return;
    var cf = $('char-frame');
    if (e.target && (p.contains(e.target) || (cf && cf.contains(e.target)))) return;
    closeCharPanel();
  }, true);
  /* Tay nắm kiểm chứng Bảng Nhân Vật: mở/đóng/chọn thẻ qua đúng đường
     panel dùng + đọc dữ kiện logic dựng, cho harness DOM lái thật. */
  window.VSLC_CHARPANEL = {
    open: openCharPanel, close: closeCharPanel,
    isOpen: function () { var p = $('char-panel'); return !!p && !p.classList.contains('hidden'); },
    tab: function () { return charTabId; },
    select: function (id) { charTabId = id; renderCharPanel(); },
    data: function () { return state ? L.charPanelData(state) : null; }
  };

  // Tổng kết phiên săn: chạm vào bảng là đóng (cơ chế ẩn chủ động duy
  // nhất ngoài mốc 30 giây tuyệt đối — xem maybeShowHuntSummary).
  var hsEl = $('hunt-summary');
  if (hsEl) onTap(hsEl, hideHuntSummary);
  onTap($('bag-upgrade'), function () {
    if (!state) return;
    var bag = L.bagOf(state);
    var prev = L.BAG_TIERS[bag.tier];
    var next = L.BAG_TIERS[bag.tier + 1];
    if (!next) return;
    var r = L.spendLinhThach(state, next.price);
    if (!r.ok) { toast(r.reason); return; }
    state.bag.tier = next.tier;
    sfxQuest();
    // Mốc túi -> nhẫn (tầng 2 lên 3): thông báo nêu rõ đã đổi sang nhẫn
    // trữ vật đeo tay; các mốc còn lại báo tên vật chứa mới.
    if (prev && prev.kind === 'tui' && next.kind === 'nhan') {
      toast('Đã đổi sang ' + next.name + ' — từ nay đeo nhẫn trữ vật trên tay (' + next.cap + ' ô chứa).');
    } else {
      toast('Đã đổi sang ' + next.name + ' (' + next.cap + ' ô chứa).');
    }
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
    isPinchFallback: function () { return pinch.fallback; },
    pinchJoyCancelled: function () { return pinch.joyCancelled; },
    joyState: function () { return joy.state; },
    joyR: function () { return JOY_R; },
    joyKnobR: function () { return JOY_KNOB_R; },
    joyVec: function () { return { active: joy.active, ux: joy.ux, uy: joy.uy, speed: joy.speed, sx: joy.sx, sy: joy.sy }; },
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

  /* Tay nắm đo lường chuyển động (harness + công cụ dựng clip cảm giác):
     vị trí/vận tốc/pha bước theo điểm ảnh của khung hiện tại. */
  window.VSLC_MOVE = {
    pos: function () { return { x: px, y: py }; },
    vel: function () { return { x: velX, y: velY }; },
    stepPhase: function () { return stepPhase; },
    dir8: function () { return dir8; },
    facing: function () { return facing; },
    moving: function () { return moving; },
    tile: function () { return playerTile(); },
    // Đợt động tác đi bộ: nhịp nhún thân hiện tại, ngưỡng quãng đường của
    // một khung bước ở hướng hiện tại, số khung trong chu kỳ, nhóm sải.
    // Tay nắm hiệu chỉnh pad vuốt đường (mục B đợt làm lại di chuyển):
    // segPad() đọc pad hiện tại, segPad(n) đặt pad mới — chỉ phục vụ pin
    // tuyến đo trên engine thật, không phải cài đặt người chơi.
    segPad: function (v) { if (typeof v === 'number' && isFinite(v)) SEG_FREE_PAD = v; return SEG_FREE_PAD; },
    // Tay nắm kiểm chứng khổ sheet (bổ sung đợt làm lại di chuyển):
    // giả lập một sheet có bề rộng/cao cho trước cho một look, trả về
    // engine có nhận là sheet 8 hướng không, chu kỳ bước suy ra, và ô nguồn của
    // khung bước CUỐI chu kỳ ở hàng xuống-trái (dir8 7) — đủ để khẳng
    // định ánh xạ không rơi về sheet cũ và khung cuối nằm trong sheet.
    probeSheet: function (look, w, h) {
      var stub = { naturalWidth: w, naturalHeight: h, complete: true };
      var old = ASSETS.chars[look];
      ASSETS.chars[look] = stub;
      var cyc = charCycleFrames(look);
      var src = charSrc(look, stub, 'down', 7, cyc, 0);
      var out = { is8: isChar8(look, stub), cycle: cyc, src: src };
      ASSETS.chars[look] = old;
      return out;
    },
    bobY: function () { return walkBobY; },
    stridePerFrame: function () { return stridePerFrame(); },
    cycleFrames: function () { return walkCycleFrames(); },
    strideGroup: function () { return strideGroupOf(dir8); },
    // Tay nắm kiểm chứng lớp kiếm + tiếng bước chân (đợt sửa walk2
    // tiếp): đọc trạng thái kiếm hiện tại, bật/tắt cờ ngự kiếm trong
    // harness (chuỗi nhiệm vụ thật thuộc đợt tích hợp riêng), đếm số
    // tiếng bước chân đã phát.
    swordState: function () { return swordStateNow((typeof bodyFrameNow === 'function') ? bodyFrameNow() : null); },
    setFlyLearned: function (on) { state.flags = state.flags || {}; state.flags.flyLearned = !!on; if (!on) state.flags.flyStage = 0; },
    setFlyRiding: function (on) { state.flags = state.flags || {}; state.flags.flyRiding = !!on; },
    stepSfxCount: function () { return stepSfxN; },
    stepSurface: function () { return stepSurface(); }
  };

  /* Tay nắm kiểm chứng cho cảnh đo (gói I): người đang được ghim tại đá
     đo, kết quả đang công bố, và vị trí sống của NPC — để bài kiểm tra
     khẳng định bộ ba (người tại đá, tên hiển thị, phẩm cấp) khớp nhau. */
  window.VSLC_SCENE = {
    spot: function () { return dlg ? (dlg.spot || null) : null; },
    result: function () { return dlg ? (dlg.result || null) : null; },
    line: function () { return dlg ? { who: dlg.who, text: dlg.text } : null; },
    npcPos: function (id) { var n = npcsLive.filter(function (x) { return x.id === id; })[0]; return n ? { x: n.x, y: n.y } : null; }
  };

  /* Tay nắm kiểm chứng cho tự tìm đường nhiệm vụ: trạng thái thuần túy
     của bộ máy chặng, không phải đường lưu dữ liệu. */
  window.VSLC_NAV = {
    start: startQuestNav, cancel: cancelQuestNav,
    isActive: function () { return !!questNav; },
    info: function () {
      return questNav ? { targetMap: questNav.targetMap, hx: questNav.hx, hy: questNav.hy, leg: questNav.leg ? questNav.leg.kind : null, legMap: questNav.leg ? questNav.leg.map : null } : null;
    },
    route: navRouteMaps
  };

  /* Tay nắm kiểm chứng cho dẫn đường nhiệm vụ (gói phụ H, chỉ đọc):
     target() = mục tiêu phân giải của bước hiện tại; display() = trạng
     thái hiển thị tính bằng CÙNG hàm guideCompute mà render() dùng
     (mục tiêu hiển thị sau khi đã chiếu qua đồ thị cổng, cờ hiện mũi
     tên / dấu "!", góc chỉ, khoảng cách ô); frame() = bản sao khung vừa
     vẽ thật gần nhất (null ngay sau resetPresentationState). */
  function guidePublicTarget(t) {
    return t ? { quest: t.quest || null, map: t.map, x: t.x, y: t.y, kind: t.kind, targetId: t.targetId || null,
                 name: t.name || null, hx: (t.hx != null ? t.hx : null), hy: (t.hy != null ? t.hy : null), ax: t.ax, ay: t.ay } : null;
  }
  function guidePublicDisplay(d) {
    return d ? { map: d.map, x: d.x, y: d.y, kind: d.kind, targetId: d.targetId || null, name: d.name || null,
                 portalTo: d.portalTo || null, finalMap: d.finalMap || null, ax: d.ax, ay: d.ay } : null;
  }
  function guidePublicFrame(g) {
    return g ? { quest: g.quest, target: guidePublicTarget(g.target), display: guidePublicDisplay(g.display),
                 arrow: g.arrow, bang: g.bang, angle: g.angle, distTiles: g.distTiles, inView: g.inView, dlgHidden: g.dlgHidden } : null;
  }
  window.VSLC_GUIDE = {
    HIDE_TILES: GUIDE_HIDE_TILES,
    target: function () { return guidePublicTarget(resolveQuestTarget()); },
    display: function () { return guidePublicFrame(guideCompute()); },
    frame: function () { return guidePublicFrame(guideFrame); },
    resolve: resolveQuestTarget
  };

  /* Tay nắm kiểm chứng Mục H (chuỗi phụ quanh Trúc Cơ): đọc trạng thái
     thuần + chọn/bỏ chọn + nhận thưởng qua ĐÚNG đường panel dùng. */
  window.VSLC_SIDE = {
    list: function () {
      if (!state) return [];
      return L.sideQuestList(state).map(function (it) {
        return { id: it.def.id, phase: it.def.phase, name: it.def.name, system: it.def.system,
                 status: it.status, cur: it.progress.cur, target: it.progress.target, text: it.progress.text,
                 guide: L.sideQuestGuideHint(state, it.def) };
      });
    },
    selected: function () { return state ? (L.ensureSideQuests(state).selected || null) : null; },
    select: function (id) { var r = L.selectSideQuest(state, id); sidePanelSig = ''; refreshHUD(); saveNow(); return r; },
    claim: function (id) { var r = L.claimSideQuest(state, id); sidePanelSig = ''; refreshHUD(); saveNow(); return r; },
    panelCount: function () { var l = $('hud-side-list'); return l ? l.children.length : -1; }
  };

  /* Tay nắm kiểm chứng hệ đồ ăn (đợt 2026-11-04): chạy ĐÚNG các đường
     người chơi dùng — mua/nấu/ăn/hái qua hàm thuần của logic trên
     state thật của phiên, ăn nhanh qua quickEatFood, cảnh menu qua
     đúng hàm dựng cảnh của điểm bán/bếp. Cầu nối chỉ để kiểm chứng,
     không mở thêm đường lấy đồ ăn nào khác. */
  window.VSLC_FOOD = {
    buy: function (id) { return state ? L.buyFood(state, id) : null; },
    buySilver: function (id) { return state ? L.buyFoodSilver(state, id) : null; },
    silver: function () { return state ? L.silverBalance(state) : 0; },
    taste: function (id) { return state ? L.tasteFood(state, id) : null; },
    cook: function (id) { return state ? L.cookFood(state, id) : null; },
    eat: function (id) { return state ? L.eatFood(state, id) : null; },
    gather: function (p) { return state ? L.gatherFoodPatch(state, p) : null; },
    quickEat: function () { quickEatFood(); },
    innScene: function () { return foodInnScene(); },
    buyScene: function () { return foodBuyScene(); },
    cookScene: function (w) { return foodCookScene(w || 'bep'); },
    inCombat: function () { return foodInCombat(); },
    cdLeftMs: function () { return Math.max(0, foodCdUntil - tNow); },
    count: function () { return state ? L.foodCount(state) : 0; }
  };

  /* Tay nắm kiểm chứng cho làn chạm trán: đọc trạng thái thuần túy của
     quái/trận/rơi đồ/phiên săn — bài kiểm tra lái trận bằng ĐI BỘ thật
     và phím kỹ năng thật, cầu nối chỉ để NHÌN kết quả, không mở trận hộ. */
  window.VSLC_HUNT = {
    monsters: function () {
      return mons.map(function (m) {
        return { species: m.species, rank: m.rank, bossId: m.bossId, state: m.state, hp: m.hp, hpMax: m.hpMax,
                 x: Math.round(m.x), y: Math.round(m.y), tileX: Math.floor((m.x + 16) / TILE), tileY: Math.floor((m.y + 16) / TILE),
                 zoneId: m.zoneId, holdT: m.holdT, sealT: m.sealT,
                 // Trường chuyển động mượt (đợt 2026-11-04, chỉ đọc thêm): pha cá thể, quãng đường tích lũy, vận tốc lái, nhịp lên đòn.
                 gait: Math.round((m.gait || 0) * 10) / 10, phase0: m.phase0, vx: Math.round(m.vx || 0), vy: Math.round(m.vy || 0), windT: m.windT || 0, movingNow: !!m.movingNow };
      });
    },
    encounter: function () {
      if (!enc) return null;
      return { species: enc.mon.species, bossId: enc.mon.bossId, sessionId: enc.sessionId, hp: enc.mon.hp,
               usedDinh: enc.usedDinh, usedPhong: enc.usedPhong, phase: enc.phase || 0 };
    },
    drops: function () { return drops.map(function (d) { return { itemId: d.itemId, n: d.n, phase: d.phase, full: d.full }; }); },
    floats: function () { return floats.map(function (f) { return { text: f.text, color: f.color, size: f.size, pop: f.pop }; }); },
    session: function () { return huntSession ? JSON.parse(JSON.stringify(huntSession)) : null; },
    zone: function () { return { id: curZoneId, dwell: zoneDwell }; },
    combo: function () { return { n: comboN, t: comboT }; }
  };

  /* Cầu kiểm chứng trận tỉ thí chương 5 (gói phụ 7, chỉ đọc): trạng thái
     trận kịch bản, máu hai đấu thủ và cờ tiếp sức trong trận. */
  /* Cầu kiểm chứng hiệu ứng kỹ năng (gói phụ 10, chỉ đọc). */
  window.VSLC_FX = {
    pillars: function () { return pillars.length; },
    cloudSea: function () { if (!state) return 0; if (state.map === 'thang_long_dai') return TL_CLOUD_SEA.length; return state.map === 'thanh_van_tong' ? CLOUD_SEA.length : 0; },
    streaks: function () { return streaks.length; },
    parts: function () { return parts.length; },
    kind: function (k) { return parts.filter(function (pp) { return pp.kind === k; }).length; },
    // Cầu cộng hưởng (bước 2 Vạn Âm, chỉ đọc, cộng thêm — không đổi cầu cũ):
    resFields: function () { return resFields.map(function (f) { return { skill: f.skill, tier: f.tier, R: f.R, cols: f.cols.length, t: +f.t.toFixed(3), dur: f.dur }; }); },
    resWaves: function () { return resWaves.length; },
    resTier: function (s) { return resTierFor(s); },
    resBaseFreq: function (species) { return resBaseFreqForSpecies(species); },
    // ARCIV đợt 1 (chỉ đọc + đếm): trình diễn bí tịch/cung IV
    swordLog: function () { return swordFxLog.slice(); },
    fxCount: function () { return FXC; },
    bodySegs: function () { return bodySegs.length; },
    techProj: function () { return techProj.length; },
    eyes: function () { return arcEyes.map(function (e) { return { x: Math.round(e.x), y: Math.round(e.y), sealed: e.sealed }; }); }
  };
  /* Cầu ARCIV cho worker dữ liệu (xem arciv-work/CONTRACT-wave1.md):
     dữ liệu/cảnh gọi các hàm trình diễn + cơ chế nhẹ này, engine KHÔNG
     tự đặt cờ truyện. */
  window.VSLC_ARCIV = {
    presentTechTierUp: presentTechTierUp,
    presentHuyenTinh: function (x, y, ang) { presentHuyenTinh(x, y, ang || 0, false); },
    castTechFx: castTechFx,
    techFxDefs: function () { return Object.keys(TECH_FX_DEFS); },
    addEye: arcAddEye, sealEye: arcSealEye, eyesStanding: arcEyesStanding, phongContext: arcPhongContext,
    startCycle: arcStartCycle, stopCycle: arcStopCycle, cycleFan: arcCycleFan,
    setCycleFrozen: function (v) { if (arcCycle) { arcCycle.frozen = !!v; if (v) arcCycle.tickI = -1; } },
    cycle: function () { return arcCycle ? { t: +arcCycle.t.toFixed(2), dir: arcCycle.dir, frozen: arcCycle.frozen, period: arcCycle.period } : null; },
    startSwordBody: startSwordBody, startResBody: startResBody,
    spawnNineSwords: spawnNineSwords
  };

  /* Cầu kiểm chứng chuỗi đánh đêm (gói phụ 8, chỉ đọc). */
  window.VSLC_ATK = {
    figs: function () { return atkFigs.length; },
    panel: function () { return atkPanelShown; },
    staging: function () { return !!atkFx; },
    beast: function () { return kdFig ? { mode: kdFig.mode, wave: kdFig.wave, eyesGlow: !!kdFig.eyesGlow } : null; } // #21+#22: hình diễn yêu thú giữ dược (chỉ đọc)
  };

  window.VSLC_DUEL = {
    active: function () { return !!duel; },
    hp: function () { return duel ? { u: duel.uHp, l: duel.lHp, uMax: DUEL_U_MAX, lMax: DUEL_L_MAX } : null; },
    supportedInDuel: function () { return duel ? duel.supportedInDuel : null; },
    clean: function () { return duel ? duel.clean : null; }
  };

  show('screen-auth');
})();
