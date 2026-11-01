/* Cài đặt theo tài khoản của game Vô Sắc Linh Căn (mini-đợt "Phần cài đặt
   thêm nhiều chức năng", lệnh Bui 11:05 ngày 2026-11-01).
   - Phần lõi (mặc định, chuẩn hóa, đọc/ghi localStorage, đổi mật khẩu, xóa
     tài khoản) là hàm thuần không chạm DOM — dùng chung cho trình duyệt
     (window.VSLC_SETTINGS) và kiểm tra khói bằng Node, cùng mẫu với logic.js.
   - Phần cuối tệp (chỉ chạy khi có document) lo panel cài đặt trong
     index.html và các hiệu ứng phía DOM (bản đồ nhỏ, thanh trạng thái,
     cỡ chữ thoại). Các hiệu ứng phía engine (tiếng, rung, sóng âm, cần
     cảm ứng, tự lưu...) do js/game.js đọc trực tiếp từ SET.current tại
     từng điểm hiệu ứng qua guard — module vắng mặt thì engine chạy mặc định.
   Khóa lưu: 'vslc_settings_<tài khoản>' — theo tài khoản như bản lưu game. */
(function (global) {
  'use strict';

  var SETTINGS_PREFIX = 'vslc_settings_';
  // Khóa tài khoản/bản lưu — PHẢI khớp logic.js (test khóa điều này).
  var ACC_KEY = 'vslc_accounts', SAVE_PREFIX = 'vslc_save_';
  var BUILD_VERSION = '1.1.0';
  var BUILD_NOTE = 'Bản dựng 2026-11-01: trấn 60×45, sửa lỗi tương tác, engine 8 hướng + cần cảm ứng, panel cài đặt đầy đủ.';

  var AUTOSAVE_SECS = [5, 15, 30, 60];

  var DEFAULTS = {
    /* Âm thanh */
    soundOn: true,        // bật/tắt tiếng tổng
    volume: 0.8,          // âm lượng tổng (hiệu ứng) 0..1
    sfxSkill: true,       // hiệu ứng âm thanh chiêu thức/sự kiện (PHÁ, CHẤN, đột phá, mở miệng)
    voiceOn: true,        // lồng tiếng lời thoại cốt truyện
    voiceVol: 0.9,        // âm lượng giọng nói riêng 0..1 (tách khỏi âm lượng hiệu ứng)
    /* Hình ảnh */
    fxShake: true,        // rung màn hình khi dùng Ngôn Linh
    fxRings: true,        // vòng sóng âm / hiệu ứng lan tỏa
    fxParticles: true,    // hạt linh khí + hào quang (đột phá, thổ nạp, hạt lơ lửng, ánh đèn lồng)
    showNames: true,      // tên + danh hiệu trên đầu nhân vật và NPC
    showBars: true,       // thanh HP / Tu vi / Tĩnh Mặc trong khung nhân vật
    /* Điều khiển */
    // Hiển thị cần điều khiển (lệnh Bui 11:59 ngày 2026-11-01):
    // 'on' = Luôn hiện sẵn (đế cố định góc dưới trái, nhận cả chuột kéo);
    // 'auto' = Hiện khi chạm kéo (cần nổi tại điểm chạm, chỉ cảm ứng thật);
    // 'off' = Ẩn hẳn. Mặc định theo thiết bị khi tài khoản chưa từng lưu
    // cài đặt: cảm ứng -> 'on', máy tính -> 'auto' (xem deviceJoyDefault).
    joyMode: 'auto',
    joySens: 1,           // độ nhạy cần 0.5..1.5 (hệ số tốc độ)
    clickMove: true,      // di chuyển bằng bấm chuột / chạm đất
    /* Giao diện */
    dlgFont: 'normal',    // cỡ chữ thoại: 'normal' | 'large'
    dlgSpeed: 'instant',  // tốc độ chữ thoại: 'instant' hiện ngay | 'normal' chữ chạy dần
    minimapOn: true,      // hiện bản đồ nhỏ mặc định
    questStart: 'open',   // ô nhiệm vụ khi vào game: 'open' mở sẵn | 'min' thu nhỏ
    /* Trò chơi */
    autoSave: true,       // tự động lưu
    autoSaveSec: 5,       // khoảng tự lưu (giây): 5 | 15 | 30 | 60
    confirmLogout: true,  // xác nhận trước khi Thoát về màn hình đăng nhập
    /* Ngày đêm (đợt "Bản đồ mượt + Ngày đêm"): tốc độ + chế độ đồng hồ thế
       giới; logic pha/tốc độ nằm ở js/logic.js (DAYNIGHT_MIN_PER_SEC). */
    daySpeed: 'normal',   // tốc độ ngày đêm: 'slow' 20 phút | 'normal' 10 phút | 'fast' 5 phút thật mỗi ngày game
    dayMode: 'cycle',     // chế độ ngày đêm: 'cycle' theo chu kỳ | 'day' luôn ban ngày | 'night' luôn ban đêm
    /* Phóng to / thu nhỏ bản đồ (Luồng C): chỉ là công tắc bật/tắt tính
       năng; MỨC phóng tự nó chỉ giữ trong phiên chơi, không lưu ở đây. */
    zoomEnabled: true,    // cho phép chụm hai ngón / lăn chuột để phóng-thu khung nhìn thế giới
    /* Nhạc nền + tiếng động môi trường: khóa theo hợp đồng trong
       VSLC_MUSIC.SETTINGS_SPEC của module nhạc; nối dây ở tích hợp. */
    musicOn: true,        // nhạc nền tổng hợp theo bản đồ + pha ngày đêm
    musicVol: 0.7,        // âm lượng nhạc nền 0..1
    ambienceOn: true,     // tiếng động môi trường (chim/dế/suối/gió/chợ)
    ambienceVol: 0.6      // âm lượng môi trường 0..1
  };

  function clone(o) { var r = {}; for (var k in o) r[k] = o[k]; return r; }
  function isBool(v) { return v === true || v === false; }
  function clampNum(v, lo, hi, dflt) {
    var n = Number(v);
    if (!isFinite(n)) return dflt;
    return Math.min(hi, Math.max(lo, n));
  }
  function pickEnum(v, list, dflt) { return list.indexOf(v) >= 0 ? v : dflt; }

  /* Chuẩn hóa một đối tượng cài đặt thô (từ storage hoặc từ panel):
     mọi khóa lạ bị bỏ, mọi giá trị sai loại/khoảng quay về mặc định. */
  function sanitize(raw) {
    var s = clone(DEFAULTS);
    if (!raw || typeof raw !== 'object') return s;
    if (isBool(raw.soundOn)) s.soundOn = raw.soundOn;
    s.volume = clampNum(raw.volume, 0, 1, DEFAULTS.volume);
    if (isBool(raw.sfxSkill)) s.sfxSkill = raw.sfxSkill;
    if (isBool(raw.voiceOn)) s.voiceOn = raw.voiceOn;
    s.voiceVol = clampNum(raw.voiceVol, 0, 1, DEFAULTS.voiceVol);
    if (isBool(raw.fxShake)) s.fxShake = raw.fxShake;
    if (isBool(raw.fxRings)) s.fxRings = raw.fxRings;
    if (isBool(raw.fxParticles)) s.fxParticles = raw.fxParticles;
    if (isBool(raw.showNames)) s.showNames = raw.showNames;
    if (isBool(raw.showBars)) s.showBars = raw.showBars;
    s.joyMode = pickEnum(raw.joyMode, ['auto', 'on', 'off'], DEFAULTS.joyMode);
    s.joySens = clampNum(raw.joySens, 0.5, 1.5, DEFAULTS.joySens);
    if (isBool(raw.clickMove)) s.clickMove = raw.clickMove;
    s.dlgFont = pickEnum(raw.dlgFont, ['normal', 'large'], DEFAULTS.dlgFont);
    s.dlgSpeed = pickEnum(raw.dlgSpeed, ['instant', 'normal'], DEFAULTS.dlgSpeed);
    if (isBool(raw.minimapOn)) s.minimapOn = raw.minimapOn;
    s.questStart = pickEnum(raw.questStart, ['open', 'min'], DEFAULTS.questStart);
    if (isBool(raw.autoSave)) s.autoSave = raw.autoSave;
    if (AUTOSAVE_SECS.indexOf(Number(raw.autoSaveSec)) >= 0) s.autoSaveSec = Number(raw.autoSaveSec);
    if (isBool(raw.confirmLogout)) s.confirmLogout = raw.confirmLogout;
    s.daySpeed = pickEnum(raw.daySpeed, ['slow', 'normal', 'fast'], DEFAULTS.daySpeed);
    s.dayMode = pickEnum(raw.dayMode, ['cycle', 'day', 'night'], DEFAULTS.dayMode);
    if (isBool(raw.zoomEnabled)) s.zoomEnabled = raw.zoomEnabled;
    if (isBool(raw.musicOn)) s.musicOn = raw.musicOn;
    s.musicVol = clampNum(raw.musicVol, 0, 1, DEFAULTS.musicVol);
    if (isBool(raw.ambienceOn)) s.ambienceOn = raw.ambienceOn;
    s.ambienceVol = clampNum(raw.ambienceVol, 0, 1, DEFAULTS.ambienceVol);
    return s;
  }

  function keyFor(username) { return SETTINGS_PREFIX + (username || ''); }

  /* Mặc định hiển thị cần theo loại thiết bị — chỉ áp khi tài khoản CHƯA
     từng lưu cài đặt (người chơi đã chọn tay thì tôn trọng lựa chọn đã lưu):
     thiết bị cảm ứng hiện sẵn đế cố định để thấy cần ngay khi vào game;
     máy tính giữ cần nổi như trước. */
  function deviceJoyDefault(isTouch) { return isTouch ? 'on' : 'auto'; }

  function load(storage, username) {
    if (!username) return clone(DEFAULTS);
    try {
      var raw = storage.getItem(keyFor(username));
      return sanitize(raw ? JSON.parse(raw) : null);
    } catch (e) { return clone(DEFAULTS); }
  }
  function save(storage, username, settings) {
    if (!username) return false;
    try {
      storage.setItem(keyFor(username), JSON.stringify(sanitize(settings)));
      return true;
    } catch (e) { return false; }
  }

  /* Trạng thái sống: game.js đọc SET.current tại từng điểm hiệu ứng,
     settings.js là nơi duy nhất ghi. `current` giữ nguyên tham chiếu —
     loadFor/update chỉ thay giá trị từng khóa để engine không phải nạp lại. */
  var current = clone(DEFAULTS);
  var currentUser = null;
  var boundStorage = null;
  function assignAll(target, src) { for (var k in target) target[k] = src[k]; }
  // Móc hiệu ứng DOM: phần trình duyệt gán SET.applyDom/SET.syncControls;
  // trong môi trường kiểm thử (Node, không có DOM) hai móc này trống — bỏ qua.
  function applyDomSafe() { if (typeof SET !== 'undefined' && SET && SET.applyDom) SET.applyDom(); }
  function loadFor(username, storage, isTouch) {
    currentUser = username || null;
    boundStorage = storage || null;
    assignAll(current, load(storage, username));
    var hadStored = false;
    try { hadStored = !!(storage && username && storage.getItem(keyFor(username))); } catch (e) { hadStored = false; }
    if (!hadStored) current.joyMode = deviceJoyDefault(!!isTouch);
    applyDomSafe();
    return current;
  }
  function update(patch) {
    var merged = clone(current);
    if (patch) for (var k in patch) merged[k] = patch[k];
    assignAll(current, sanitize(merged));
    if (boundStorage && currentUser) save(boundStorage, currentUser, current);
    applyDomSafe();
    return current;
  }
  function resetAll() {
    assignAll(current, clone(DEFAULTS));
    if (boundStorage && currentUser) save(boundStorage, currentUser, current);
    applyDomSafe();
    if (typeof SET !== 'undefined' && SET && SET.syncControls) SET.syncControls();
    return current;
  }

  /* ---------- Tài khoản: đổi mật khẩu / xóa dữ liệu ---------- */
  // Cùng công thức băm với logic.js register/login: sha256(muối + '|' + mật khẩu).
  function makeSalt() {
    var salt = '';
    for (var i = 0; i < 12; i++) salt += 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'.charAt(Math.floor(Math.random() * 31));
    return salt;
  }
  function loadAccounts(storage) {
    try { return JSON.parse(storage.getItem(ACC_KEY) || '{}'); } catch (e) { return {}; }
  }
  function changePassword(storage, sha256, username, oldPass, newPass) {
    if (!username) return { ok: false, reason: 'Chưa đăng nhập.' };
    if (!newPass || newPass.length < 4) return { ok: false, reason: 'Mật khẩu mới cần ít nhất 4 ký tự.' };
    var accs = loadAccounts(storage), a = accs[username];
    if (!a) return { ok: false, reason: 'Không tìm thấy tài khoản.' };
    if (a.hash !== sha256(a.salt + '|' + (oldPass || ''))) return { ok: false, reason: 'Mật khẩu cũ không đúng.' };
    a.salt = makeSalt();
    a.hash = sha256(a.salt + '|' + newPass);
    accs[username] = a;
    try { storage.setItem(ACC_KEY, JSON.stringify(accs)); } catch (e) { return { ok: false, reason: 'Không ghi được dữ liệu.' }; }
    return { ok: true };
  }
  // Xóa tài khoản + bản lưu game + cài đặt của tài khoản. Không khôi phục được.
  function deleteAccount(storage, username) {
    if (!username) return false;
    var accs = loadAccounts(storage);
    var existed = !!accs[username];
    if (existed) {
      delete accs[username];
      try { storage.setItem(ACC_KEY, JSON.stringify(accs)); } catch (e) {}
    }
    try { storage.removeItem(SAVE_PREFIX + username); } catch (e) {}
    try { storage.removeItem('vslc_save_backup_' + username); } catch (e) {}
    try { storage.removeItem(keyFor(username)); } catch (e) {}
    return existed;
  }

  /* Cổng âm thanh thuần cho engine (js/game.js beep + phát lồng tiếng):
     'skill' = âm chiêu thức/sự kiện — tắt được riêng; 'ui' = tiếng giao diện —
     chỉ chịu tiếng tổng + âm lượng. Lồng tiếng có công tắc + âm lượng riêng. */
  function sfxAllowed(cat) {
    if (!current.soundOn) return false;
    if (cat === 'skill' && !current.sfxSkill) return false;
    return true;
  }
  function gainScale() { return current.soundOn ? current.volume : 0; }
  function voiceAllowed() { return current.voiceOn; }
  function voiceScale(kind) {
    var v = current.voiceOn ? current.voiceVol : 0;
    return kind === 'inner' ? v * 0.55 : v; // tiếng lòng đọc khẽ, gần như thì thầm
  }

  var SET = {
    SETTINGS_PREFIX: SETTINGS_PREFIX, ACC_KEY: ACC_KEY, SAVE_PREFIX: SAVE_PREFIX,
    sfxAllowed: sfxAllowed, gainScale: gainScale, voiceAllowed: voiceAllowed, voiceScale: voiceScale,
    BUILD_VERSION: BUILD_VERSION, BUILD_NOTE: BUILD_NOTE,
    AUTOSAVE_SECS: AUTOSAVE_SECS, DEFAULTS: DEFAULTS,
    sanitize: sanitize, keyFor: keyFor, load: load, save: save, deviceJoyDefault: deviceJoyDefault,
    current: current, loadFor: loadFor, update: update, resetAll: resetAll,
    changePassword: changePassword, deleteAccount: deleteAccount,
    applyDom: null, openPanel: null, closePanel: null, syncControls: null
  };
  global.VSLC_SETTINGS = SET;
  if (typeof module !== 'undefined' && module.exports) module.exports = SET;

  /* ================= Phần trình duyệt: panel + hiệu ứng DOM ================= */
  if (typeof document === 'undefined' || !document.getElementById) return;
  function $(id) { return document.getElementById(id); }

  /* Hiệu ứng phía DOM — gọi mỗi lần cài đặt đổi và khi vào game. */
  function applyDom() {
    var mm = $('minimap-wrap');
    if (mm) mm.classList.toggle('hidden', !current.minimapOn);
    var cf = $('char-frame');
    if (cf) cf.classList.toggle('set-hide-bars', !current.showBars);
    var dlg = $('dialogue');
    if (dlg) dlg.classList.toggle('dlg-font-large', current.dlgFont === 'large');
  }
  SET.applyDom = applyDom;

  function panelEl() { return $('settings-panel'); }
  function openPanel() {
    var p = panelEl(); if (!p) return;
    p.classList.remove('hidden');
    var tab = $('settings-tab'); if (tab) tab.classList.add('hidden');
    syncControls();
    var ver = $('set-version');
    if (ver) ver.textContent = 'Phiên bản bản dựng: ' + BUILD_VERSION + ' — ' + BUILD_NOTE;
  }
  function closePanel() {
    var p = panelEl(); if (p) p.classList.add('hidden');
    var tab = $('settings-tab'); if (tab) tab.classList.add('hidden');
  }
  function minPanel() {
    var p = panelEl(); if (p) p.classList.add('hidden');
    var tab = $('settings-tab'); if (tab) tab.classList.remove('hidden');
  }
  SET.openPanel = openPanel; SET.closePanel = closePanel;

  /* Đồng bộ mọi control trong panel theo `current`. */
  function setVal(id, v) { var el = $(id); if (el) el.checked = !!v; }
  function syncControls() {
    setVal('set-sound', current.soundOn);
    var vol = $('set-volume'); if (vol) vol.value = String(Math.round(current.volume * 100));
    setVal('set-sfx', current.sfxSkill);
    setVal('set-voice', current.voiceOn);
    var vv = $('set-voicevol'); if (vv) vv.value = String(Math.round(current.voiceVol * 100));
    setVal('set-shake', current.fxShake);
    setVal('set-rings', current.fxRings);
    setVal('set-particles', current.fxParticles);
    setVal('set-names', current.showNames);
    setVal('set-bars', current.showBars);
    var jm = $('set-joymode'); if (jm) jm.value = current.joyMode;
    var js = $('set-joysens'); if (js) js.value = String(Math.round(current.joySens * 100));
    setVal('set-clickmove', current.clickMove);
    var df = $('set-dlgfont'); if (df) df.value = current.dlgFont;
    var ds = $('set-dlgspeed'); if (ds) ds.value = current.dlgSpeed;
    setVal('set-minimap', current.minimapOn);
    var qs = $('set-queststart'); if (qs) qs.value = current.questStart;
    setVal('set-autosave', current.autoSave);
    var as = $('set-autosave-sec'); if (as) as.value = String(current.autoSaveSec);
    setVal('set-confirmlogout', current.confirmLogout);
    var dsp = $('set-dayspeed'); if (dsp) dsp.value = current.daySpeed;
    var dmo = $('set-daymode'); if (dmo) dmo.value = current.dayMode;
    setVal('set-zoom', current.zoomEnabled);
    setVal('set-music', current.musicOn);
    var mv = $('set-musicvol'); if (mv) mv.value = String(Math.round(current.musicVol * 100));
    setVal('set-ambience', current.ambienceOn);
    var av2 = $('set-ambiencevol'); if (av2) av2.value = String(Math.round(current.ambienceVol * 100));
  }
  SET.syncControls = syncControls;

  function on(id, ev, fn) { var el = $(id); if (el) el.addEventListener(ev, fn); }
  function bindCheck(id, key) { on(id, 'change', function () { var el = $(id); var p = {}; p[key] = !!(el && el.checked); update(p); }); }
  function bindPanel() {
    bindCheck('set-sound', 'soundOn');
    on('set-volume', 'input', function () { var el = $('set-volume'); update({ volume: (Number(el && el.value) || 0) / 100 }); });
    bindCheck('set-sfx', 'sfxSkill');
    bindCheck('set-voice', 'voiceOn');
    on('set-voicevol', 'input', function () { var el = $('set-voicevol'); update({ voiceVol: (Number(el && el.value) || 0) / 100 }); });
    bindCheck('set-shake', 'fxShake');
    bindCheck('set-rings', 'fxRings');
    bindCheck('set-particles', 'fxParticles');
    bindCheck('set-names', 'showNames');
    bindCheck('set-bars', 'showBars');
    on('set-joymode', 'change', function () { var el = $('set-joymode'); update({ joyMode: el ? el.value : 'auto' }); });
    on('set-joysens', 'input', function () { var el = $('set-joysens'); update({ joySens: (Number(el && el.value) || 100) / 100 }); });
    bindCheck('set-clickmove', 'clickMove');
    on('set-dlgfont', 'change', function () { var el = $('set-dlgfont'); update({ dlgFont: el ? el.value : 'normal' }); });
    on('set-dlgspeed', 'change', function () { var el = $('set-dlgspeed'); update({ dlgSpeed: el ? el.value : 'instant' }); });
    bindCheck('set-minimap', 'minimapOn');
    on('set-queststart', 'change', function () { var el = $('set-queststart'); update({ questStart: el ? el.value : 'open' }); });
    bindCheck('set-autosave', 'autoSave');
    on('set-autosave-sec', 'change', function () { var el = $('set-autosave-sec'); update({ autoSaveSec: Number(el && el.value) || 5 }); });
    bindCheck('set-confirmlogout', 'confirmLogout');
    on('set-dayspeed', 'change', function () { var el = $('set-dayspeed'); update({ daySpeed: el ? el.value : 'normal' }); });
    on('set-daymode', 'change', function () { var el = $('set-daymode'); update({ dayMode: el ? el.value : 'cycle' }); });
    bindCheck('set-zoom', 'zoomEnabled');
    bindCheck('set-music', 'musicOn');
    on('set-musicvol', 'input', function () { var el = $('set-musicvol'); update({ musicVol: (Number(el && el.value) || 0) / 100 }); });
    bindCheck('set-ambience', 'ambienceOn');
    on('set-ambiencevol', 'input', function () { var el = $('set-ambiencevol'); update({ ambienceVol: (Number(el && el.value) || 0) / 100 }); });
    /* Đặt lại mức phóng: qua cầu VSLC_BRIDGE về đúng hàm của engine — nút
       này LUÔN hoạt động, kể cả khi công tắc phóng/thu đang tắt (đưa hệ số
       hiển thị về 1,0× ngay, không qua nội suy). */
    on('set-zoom-reset', 'click', function () {
      var B = global.VSLC_BRIDGE;
      if (B && B.resetZoom) { B.resetZoom(); flashMsg('set-zoom-msg', 'Đã đặt lại mức phóng về 1,0×.'); }
    });

    on('set-close', 'click', closePanel);
    on('set-min', 'click', minPanel);
    on('settings-tab', 'click', openPanel);
    on('set-reset-btn', 'click', function () { resetAll(); syncControls(); flashMsg('set-info-msg', 'Đã đặt lại toàn bộ cài đặt về mặc định.'); });

    /* Phiên chơi: CÙNG hàm với nút Lưu/Thoát ở hàng chức năng (qua cầu VSLC_BRIDGE).
       Hai cặp nút (trong mục Tài khoản của thân panel và ở HÀNG CỐ ĐỊNH
       dính đáy panel) dùng chung hai hàm này — một đường xử lý duy nhất,
       thông báo hiện ở dòng trạng thái của đúng nút vừa bấm. */
    function doPanelSave(msgId) {
      var B = global.VSLC_BRIDGE;
      if (B && B.saveNow) {
        // saveNow trả false khi phiên này đã cũ so với một phiên khác —
        // báo thật cho người chơi thay vì khẳng định đã lưu như trước.
        if (B.saveNow()) flashMsg(msgId, 'Đã lưu tiến trình.');
        else flashMsg(msgId, 'Chưa lưu được: tiến trình mới hơn đang ở một phiên chơi khác — hãy tải lại trang.');
      }
    }
    function doPanelLogout() {
      var B = global.VSLC_BRIDGE;
      if (B && B.requestLogout) { closePanel(); B.requestLogout(); }
    }
    on('set-save-btn', 'click', function () { doPanelSave('set-save-msg'); });
    on('set-logout-btn', 'click', doPanelLogout);
    on('set-save-btn-foot', 'click', function () { doPanelSave('set-save-msg-foot'); });
    on('set-logout-btn-foot', 'click', doPanelLogout);

    /* Đổi mật khẩu */
    on('set-pw-btn', 'click', function () {
      var user = global.VSLC_BRIDGE && global.VSLC_BRIDGE.getUser ? global.VSLC_BRIDGE.getUser() : currentUser;
      var oldEl = $('set-pw-old'), newEl = $('set-pw-new');
      var r = changePassword(global.localStorage, global.VSLC_SHA256, user, oldEl ? oldEl.value : '', newEl ? newEl.value : '');
      flashMsg('set-pw-msg', r.ok ? 'Đổi mật khẩu thành công.' : r.reason, !r.ok);
      if (r.ok) { if (oldEl) oldEl.value = ''; if (newEl) newEl.value = ''; }
    });

    /* Xóa dữ liệu tài khoản — hai lớp xác nhận */
    on('set-delete-btn', 'click', function () {
      var g = $('set-del-confirm'); if (g) g.classList.remove('hidden');
      var b = $('set-delete-btn'); if (b) b.classList.add('hidden');
    });
    on('set-del-no', 'click', function () {
      var g = $('set-del-confirm'); if (g) g.classList.add('hidden');
      var b = $('set-delete-btn'); if (b) b.classList.remove('hidden');
    });
    on('set-del-yes', 'click', function () {
      var user = global.VSLC_BRIDGE && global.VSLC_BRIDGE.getUser ? global.VSLC_BRIDGE.getUser() : currentUser;
      deleteAccount(global.localStorage, user);
      closePanel();
      var B = global.VSLC_BRIDGE;
      if (B && B.exitToAuth) B.exitToAuth(); // thoát KHÔNG lưu lại — dữ liệu vừa xóa phải biến mất hẳn
    });
  }
  function flashMsg(id, text, isErr) {
    var el = $(id); if (!el) return;
    el.textContent = text;
    el.classList.toggle('error', !!isErr);
    clearTimeout(flashMsg._t);
    flashMsg._t = setTimeout(function () { if (el) el.textContent = ''; }, 3600);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bindPanel);
  else bindPanel();
})(typeof window !== 'undefined' ? window : globalThis);
