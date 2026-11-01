/* Nhạc nền + tiếng động môi trường của game Vô Sắc Linh Căn — đợt
   "Bản đồ mượt + Ngày đêm" (lệnh Bui 13:48 ngày 2026-11-01: thêm nhạc nền
   theo bản đồ, biến thể đêm dịu hơn, crossfade khi chuyển cảnh/pha; tiếng
   động môi trường: chim ngày / dế đêm, suối theo khoảng cách, gió, chợ).
   TOÀN BỘ tổng hợp bằng WebAudio trong mã — KHÔNG tệp âm thanh ngoài,
   đúng kiến trúc âm hiệu ứng hiện tại của dự án (js/game.js beep/sfx*).
   Module độc lập phơi MỘT đối tượng toàn cục VSLC_MUSIC, không phụ thuộc
   module nào khác: đầu vào pha ngày đêm / bản đồ / khoảng cách suối /
   thoại đang phát đều nhận qua hàm (hợp đồng nối dây ở cuối tệp và trong
   docs/effects-catalog.md mục 5). Mọi hằng số có tên, không rải số trong
   logic. Kiểm thử riêng: test-music.js (Node, giả lập WebAudio tối thiểu,
   kiểm ở mức máy trạng thái + lịch trình — không cần phát tiếng thật).

   GIỚI HẠN nói thẳng: nhạc là vòng giai điệu THỦ TỤC tổng hợp bằng mã
   (đệm hợp âm + mô-típ ngũ cung + nhịp nền nhẹ), không phải bản thu dàn
   nhạc; cảm giác nghe thật chỉ nghiệm thu được bằng tai người. */
(function (global) {
  'use strict';

  /* ================= Hằng số có tên ================= */
  var CROSSFADE_SEC = 2.0;        // thời gian mờ qua lại khi đổi biến thể
  var STOP_FADE_SEC = 0.35;       // mờ tắt khi stop()/thoát về đăng nhập
  var FADE_IN_SEC = 1.2;          // mờ vào khi unlock lần đầu
  var SCHED_INTERVAL_MS = 30;     // chu kỳ bộ lập lịch (ms thật)
  var SCHED_LOOKAHEAD_SEC = 0.18; // lập lịch nhìn trước (giây) — vòng liền mạch
  var DUCK_MUSIC = 0.38;          // hệ số hạ nhạc nền khi thoại đang phát
  var DUCK_AMBIENCE = 0.45;       // hệ số hạ môi trường khi thoại đang phát
  var MUSIC_DEFAULT_VOL = 0.7;    // mặc định — khớp hợp đồng cài đặt đề xuất
  var AMB_DEFAULT_VOL = 0.6;
  var STREAM_MAX = 0.55;          // trần lớp suối (x âm lượng môi trường x khoảng cách)
  var WIND_MAX = 0.30;            // trần lớp gió
  var MARKET_MAX = 0.35;          // trần lớp chợ lao xao
  var PAD_LEVEL = 0.055;          // gain mỗi nốt đệm hợp âm (trước deck x bus)
  var MOTIF_LEVEL = 0.075;        // gain nốt giai điệu
  var BASS_LEVEL = 0.06;          // gain nốt trầm đầu nhịp
  var TICK_LEVEL = 0.012;         // gain nhịp nền — rất nhẹ
  var CHIRP_LEVEL = 0.05;         // gain tiếng chim/dế rời rạc
  var NIGHT_TEMPO_FACTOR = 0.88;  // biến thể đêm: chậm lại
  var NIGHT_PAD_FACTOR = 0.7;     // biến thể đêm: đệm mềm hơn
  var NIGHT_MOTIF_FACTOR = 0.8;   // biến thể đêm: giai điệu khẽ hơn
  var CLIMAX_EVERY_CYCLES = 4;    // thanh_van_tong: mỗi 4 vòng, vòng cuối có cao trào nhẹ
  var STEPS_PER_BAR = 8;          // 8 bước восьмым mỗi nhịp (ô nhịp = 4 phách)
  var MOTIF_STEPS = 16;           // mô-típ dài 2 nhịp, lặp theo vòng 4 nhịp hợp âm

  var MAP_IDS = ['tran', 'duong_mon', 'co_chau', 'kiem_trac_thap', 'thap_noi', 'thanh_van_tong'];
  var FALLBACK_MAP = 'tran';

  /* Pha đêm chuẩn hóa 0..1 theo phút-trong-ngày — CHÉP cột dark của
     DAY_PHASE_KEYS trong js/logic.js (nguồn sự thật của luồng ngày đêm);
     module này không phụ thuộc logic.js nên giữ bảng riêng có tên, và
     ngưỡng đêm dùng đúng logic: night >= 0.5 <=> dayPhaseAt().isNight. */
  var PHASE_NIGHT_KEYS = [
    [0, 1], [300, 1], [360, 0.72], [450, 0.12], [540, 0], [720, 0],
    [960, 0], [1050, 0.12], [1140, 0.68], [1200, 1], [1290, 1], [1440, 1]
  ];
  function nightAtMinutes(m) {
    m = ((Number(m) % 1440) + 1440) % 1440;
    for (var i = 0; i < PHASE_NIGHT_KEYS.length - 1; i++) {
      var a = PHASE_NIGHT_KEYS[i], b = PHASE_NIGHT_KEYS[i + 1];
      if (m >= a[0] && m <= b[0]) {
        var span = b[0] - a[0];
        return span > 0 ? a[1] + (b[1] - a[1]) * ((m - a[0]) / span) : a[1];
      }
    }
    return 0;
  }
  function bucketAtMinutes(m) {
    m = ((Number(m) % 1440) + 1440) % 1440;
    if (m < 300) return 'night';            // 00:00–05:00 đêm
    if (m < 450) return 'dawn';             // 05:00–07:30 bình minh
    if (m < 1020) return 'day';             // 07:30–17:00 ngày
    if (m < 1230) return 'dusk';            // 17:00–20:30 chạng vạng/tối sớm
    return 'night';                          // 20:30–24:00 đêm
  }
  var PHASE_WORDS = {
    day: 'day', sang: 'day', morning: 'day', trua: 'day', noon: 'day',
    chieu: 'day', afternoon: 'day',
    night: 'night', dem: 'night', midnight: 'night', khuya: 'night',
    dawn: 'dawn', binhminh: 'dawn', sunrise: 'dawn',
    dusk: 'dusk', hoanghon: 'dusk', changvang: 'dusk', twilight: 'dusk',
    evening: 'dusk', toi: 'dusk'
  };
  /* resolvePhase(phase) -> { bucket, night01, isNight, minutes|null }
     Chấp nhận mọi dạng đầu vào mà luồng ngày đêm / tích hợp có thể cấp:
     - chuỗi: 'day' | 'night' | 'dawn' | 'dusk' | ... (không dấu cũng được)
     - số: phút-trong-ngày 0..1439 (state.dayMinutes của logic.js)
     - đối tượng pha của logic.js dayPhaseAt/dayPhaseFor:
       { minutes, night, isNight, dark, warm } — dùng night/minutes thật.
     - null/undefined: mặc định ban ngày (an toàn, không lỗi). */
  function resolvePhase(phase) {
    if (phase == null) return { bucket: 'day', night01: 0, isNight: false, minutes: 720 };
    if (typeof phase === 'number' && isFinite(phase)) {
      var m = ((phase % 1440) + 1440) % 1440, n = nightAtMinutes(m);
      return { bucket: bucketAtMinutes(m), night01: n, isNight: n >= 0.5, minutes: m };
    }
    if (typeof phase === 'string') {
      var w = PHASE_WORDS[phase.toLowerCase().replace(/[\s_]+/g, '')];
      if (w === 'night') return { bucket: 'night', night01: 1, isNight: true, minutes: 0 };
      if (w === 'dawn') return { bucket: 'dawn', night01: 0.35, isNight: false, minutes: 390 };
      if (w === 'dusk') return { bucket: 'dusk', night01: 0.68, isNight: true, minutes: 1140 };
      return { bucket: 'day', night01: 0, isNight: false, minutes: 720 };
    }
    if (typeof phase === 'object') {
      var mins = (typeof phase.minutes === 'number' && isFinite(phase.minutes)) ? phase.minutes : null;
      var night = (typeof phase.night === 'number' && isFinite(phase.night)) ? Math.min(1, Math.max(0, phase.night)) : null;
      if (night == null && mins != null) night = nightAtMinutes(mins);
      if (night == null && typeof phase.dark === 'number' && isFinite(phase.dark)) night = Math.min(1, Math.max(0, phase.dark / 0.45)); // dark = night x NIGHT_DARK_MAX(0.45)
      if (night == null) night = phase.isNight ? 1 : 0;
      var bucket = mins != null ? bucketAtMinutes(mins) : (night >= 0.5 ? 'night' : 'day');
      return { bucket: bucket, night01: night, isNight: night >= 0.5, minutes: mins };
    }
    return { bucket: 'day', night01: 0, isNight: false, minutes: 720 };
  }

  /* ================= Dữ liệu nhạc theo bản đồ =================
     Ngũ cung (pentatonic) cho chất tu tiên. chords: vòng 4 hợp âm, mỗi
     hợp âm 1 nhịp, dạng mảng nốt MIDI của lớp đệm. motif: MOTIF_STEPS
     bước (2 nhịp), mỗi bước là bậc thang âm (số nguyên, bậc >= len thang
     tự quấn lên quãng tám) hoặc -1 = nghỉ. Biến thể đêm SUY RA xác định:
     nhịp chậm x0.88, mô-típ thưa (giữ nốt ở bước chẵn, bước lẻ thành
     nghỉ), đệm/giai điệu mềm hơn — xem buildVariant(). */
  var SCALE_MAJ_PENT = [0, 2, 4, 7, 9];
  var SCALE_MIN_PENT = [0, 3, 5, 7, 10];
  var SCALE_DOR_PENT = [0, 2, 3, 7, 9];
  var TRACKS = {
    tran: { /* Hứa Gia Trấn — yên bình */
      root: 60, scale: SCALE_MAJ_PENT, bpm: 72, density: 0.30,
      padWave: 'triangle', motifWave: 'sine',
      chords: [[48, 52, 55], [45, 48, 52], [41, 45, 48], [43, 47, 50]],
      motif: [4, -1, 3, -1, 2, -1, 3, 4, -1, 5, -1, 4, 3, -1, 2, -1]
    },
    duong_mon: { /* Đường Mòn Xuyên Rừng — thiên nhiên, tiếng chim lồng trong mô-típ cao */
      root: 62, scale: SCALE_DOR_PENT, bpm: 82, density: 0.22,
      padWave: 'triangle', motifWave: 'sine',
      chords: [[50, 53, 57], [46, 50, 53], [53, 57, 60], [48, 52, 55]],
      motif: [7, -1, -1, 5, -1, 4, -1, -1, 5, -1, 7, -1, 4, -1, 2, -1]
    },
    co_chau: { /* Cô Châu Thành — nhộn nhịp: nhịp nhanh, mô-típ dày */
      root: 67, scale: SCALE_MAJ_PENT, bpm: 98, density: 0.60,
      padWave: 'triangle', motifWave: 'triangle',
      chords: [[55, 59, 62], [48, 52, 55], [50, 54, 57], [52, 55, 59]],
      motif: [4, 3, 4, 5, 4, 3, 2, 3, 4, 5, 7, 5, 4, 3, 2, 1]
    },
    kiem_trac_thap: { /* Khuôn viên Kiểm Trắc Tháp — trang nghiêm: chậm, trầm, thưa */
      root: 57, scale: SCALE_MIN_PENT, bpm: 54, density: 0.08,
      padWave: 'sine', motifWave: 'sine',
      chords: [[45, 48, 52], [45, 48, 52], [41, 45, 48], [40, 44, 47]],
      motif: [2, -1, -1, -1, -1, -1, 1, -1, 0, -1, -1, -1, -1, -1, -1, -1]
    },
    thap_noi: { /* Sảnh tháp — trang nghiêm hơn nữa: thấp và thưa nhất */
      root: 52, scale: SCALE_MIN_PENT, bpm: 50, density: 0.05,
      padWave: 'sine', motifWave: 'sine',
      chords: [[40, 43, 47], [36, 40, 43], [41, 45, 48], [38, 42, 45]],
      motif: [2, -1, -1, -1, -1, -1, -1, -1, 1, -1, -1, -1, -1, -1, -1, -1]
    },
    thanh_van_tong: { /* Thanh Vân Tông — hùng tráng: đệm rộng 5 nốt, mô-típ đi lên */
      root: 60, scale: SCALE_MAJ_PENT, bpm: 86, density: 0.40,
      padWave: 'triangle', motifWave: 'triangle',
      chords: [[36, 48, 52, 55, 64], [33, 45, 48, 52, 60], [29, 41, 45, 48, 57], [31, 43, 47, 50, 59]],
      motif: [0, -1, 2, -1, 4, -1, 5, 7, -1, 5, 4, -1, 2, -1, 1, -1]
    }
  };
  /* Lớp môi trường theo bản đồ — tra dữ kiện bản đồ trong js/logic.js:
     ô nước 'W' chỉ có ở tran (ao đông bắc, 7 ô) và duong_mon (suối hàng
     36–37 + cầu, 186 ô); chợ chỉ ở co_chau (quảng trường chợ); rừng ở
     duong_mon, tông môn ở trên cao — hai nơi có gió. Tháp/sảnh: tĩnh lặng
     trang nghiêm, không lớp môi trường (chỉ nhạc). */
  var AMBIENCE_DEFS = {
    tran: { birds: true, crickets: true, stream: true, wind: false, market: false },
    duong_mon: { birds: true, crickets: true, stream: true, wind: true, market: false },
    co_chau: { birds: false, crickets: false, stream: false, wind: false, market: true },
    kiem_trac_thap: { birds: false, crickets: false, stream: false, wind: false, market: false },
    thap_noi: { birds: false, crickets: false, stream: false, wind: false, market: false },
    thanh_van_tong: { birds: false, crickets: false, stream: false, wind: true, market: false }
  };
  function normMap(mapId) { return TRACKS[mapId] ? mapId : FALLBACK_MAP; }
  function thinMotif(motif) {
    return motif.map(function (d, i) { return (i % 2 === 0) ? d : -1; });
  }
  function countNotes(motif) {
    var n = 0; for (var i = 0; i < motif.length; i++) if (motif[i] >= 0) n++;
    return n;
  }
  /* buildVariant(mapId, phaseInfo) -> biến thể nhạc đầy đủ của cặp
     (bản đồ x ngày/đêm). Thuần, không chạm WebAudio — kiểm thử được. */
  function buildVariant(mapId, ph) {
    var id = normMap(mapId), t = TRACKS[id], night = !!ph.isNight;
    return {
      id: id + ':' + (night ? 'night' : 'day'),
      mapId: id, isNight: night,
      root: t.root, scale: t.scale.slice(),
      bpm: night ? Math.round(t.bpm * NIGHT_TEMPO_FACTOR) : t.bpm,
      density: night ? t.density * 0.5 : t.density,
      chords: t.chords, padWave: t.padWave, motifWave: t.motifWave,
      motif: night ? thinMotif(t.motif) : t.motif.slice(),
      noteCount: countNotes(night ? thinMotif(t.motif) : t.motif),
      padLevel: PAD_LEVEL * (night ? NIGHT_PAD_FACTOR : 1),
      motifLevel: MOTIF_LEVEL * (night ? NIGHT_MOTIF_FACTOR : 1)
    };
  }
  function resolveVariant(mapId, phase) { return buildVariant(mapId, resolvePhase(phase)); }
  /* resolveAmbience(mapId, phaseInfo) -> cờ lớp môi trường ĐANG bật theo
     pha: chim chỉ khi chưa đêm (night01 < 0.5), dế chỉ khi đêm, chợ chỉ
     ban ngày và chạng vạng (bucket day/dusk), suối/gió không theo pha. */
  function resolveAmbience(mapId, ph) {
    var def = AMBIENCE_DEFS[normMap(mapId)];
    return {
      birds: def.birds && ph.night01 < 0.5,
      crickets: def.crickets && ph.night01 >= 0.5,
      stream: def.stream,
      wind: def.wind,
      market: def.market && (ph.bucket === 'day' || ph.bucket === 'dusk')
    };
  }

  /* ================= Trạng thái máy ================= */
  var S = {
    unlocked: false, running: false, suspended: false,
    contextsCreated: 0,
    ctx: null, musicBus: null, ambBus: null,
    mapId: FALLBACK_MAP, phase: resolvePhase('day'), variantId: null,
    musicOn: true, musicVol: MUSIC_DEFAULT_VOL,
    ambOn: true, ambVol: AMB_DEFAULT_VOL,
    proximity: 0, duck: false,
    decks: [],            // [{variant, gainNode, gain, ramp, step, nextTime, active, seed}]
    lastCrossfade: null,  // {fromVariant, toVariant, durationSec, kind}
    timer: null,
    noiseBuf: null, layers: null,   // {stream:{gain}, wind:{gain}, market:{gain}}
    nextBirdAt: 0, nextCricketAt: 0, rngState: 123456789,
    scheduledNotes: 0, scheduledChirps: 0
  };
  function clamp01(v, dflt) {
    var n = Number(v);
    if (!isFinite(n)) return dflt;
    return Math.min(1, Math.max(0, n));
  }
  function rng() { // LCG xác định — lịch chim/dế/tick không phụ thuộc Math.random
    S.rngState = (S.rngState * 1103515245 + 12345) & 0x7fffffff;
    return S.rngState / 0x7fffffff;
  }
  function midiHz(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  function degreeMidi(variant, deg) {
    var len = variant.scale.length;
    var idx = ((deg % len) + len) % len;
    var oct = Math.floor(deg / len);
    return variant.root + variant.scale[idx] + 12 * oct;
  }
  function nowSec() { return S.ctx ? S.ctx.currentTime : 0; }

  /* Mức ra THUẦN (không chạm WebAudio) — nguồn sự thật cho kiểm thử và
     cho applyGains(). Trước unlock hoặc sau stop: im lặng tuyệt đối. */
  function musicBusLevel() {
    if (!S.unlocked || !S.running || S.suspended) return 0;
    return (S.musicOn ? S.musicVol : 0) * (S.duck ? DUCK_MUSIC : 1);
  }
  function ambBusLevel() {
    if (!S.unlocked || !S.running || S.suspended) return 0;
    return (S.ambOn ? S.ambVol : 0) * (S.duck ? DUCK_AMBIENCE : 1);
  }
  function ambFlags() { return resolveAmbience(S.mapId, S.phase); }
  function streamLevel() {
    var f = ambFlags();
    return f.stream ? ambBusLevel() * clamp01(S.proximity, 0) * STREAM_MAX : 0;
  }
  function windLevel() { return ambFlags().wind ? ambBusLevel() * WIND_MAX : 0; }
  function marketLevel() { return ambFlags().market ? ambBusLevel() * MARKET_MAX : 0; }

  /* ================= WebAudio: xây graph ================= */
  function defaultContextFactory() {
    var AC = global.AudioContext || global.webkitAudioContext;
    return AC ? new AC() : null;
  }
  function makeGain() {
    var g = S.ctx.createGain();
    g.gain.value = 0;
    return g;
  }
  function rampParam(param, to, atTime, dur) {
    // Mọi thay đổi âm lượng đều qua ramp — KHÔNG gán cứng tức thời.
    if (!param) return;
    if (typeof param.setValueAtTime === 'function') param.setValueAtTime(param.value, atTime);
    if (typeof param.linearRampToValueAtTime === 'function') param.linearRampToValueAtTime(to, atTime + dur);
    else if (typeof param.setValueAtTime === 'function') param.setValueAtTime(to, atTime + dur);
  }
  function ensureNoiseBuffer() {
    if (S.noiseBuf || !S.ctx || typeof S.ctx.createBuffer !== 'function') return S.noiseBuf;
    var len = Math.floor(S.ctx.sampleRate ? S.ctx.sampleRate * 2 : 44100 * 2);
    var buf = S.ctx.createBuffer(1, len, S.ctx.sampleRate || 44100);
    var data = typeof buf.getChannelData === 'function' ? buf.getChannelData(0) : null;
    if (data) for (var i = 0; i < len; i++) data[i] = rng() * 2 - 1;
    S.noiseBuf = buf;
    return buf;
  }
  function startNoiseLayer(filterType, freq, q) {
    if (!S.ctx || typeof S.ctx.createBufferSource !== 'function') return null;
    var buf = ensureNoiseBuffer();
    if (!buf) return null;
    var src = S.ctx.createBufferSource();
    src.buffer = buf; src.loop = true;
    var flt = null;
    if (typeof S.ctx.createBiquadFilter === 'function') {
      flt = S.ctx.createBiquadFilter();
      flt.type = filterType; flt.frequency.value = freq; flt.Q.value = q;
    }
    var g = makeGain();
    if (flt) { src.connect(flt); flt.connect(g); } else src.connect(g);
    g.connect(S.ambBus);
    try { src.start(); } catch (e) {}
    return { src: src, gain: g, filter: flt };
  }
  function startLayers() {
    if (S.layers || !S.ctx) return;
    S.layers = {
      stream: startNoiseLayer('bandpass', 750, 0.8),
      wind: startNoiseLayer('lowpass', 380, 0.4),
      market: startNoiseLayer('bandpass', 480, 0.4)
    };
  }
  function stopLayers() {
    if (!S.layers) return;
    for (var k in S.layers) {
      var l = S.layers[k];
      if (l && l.src && typeof l.src.stop === 'function') { try { l.src.stop(); } catch (e) {} }
    }
    S.layers = null;
  }

  /* ================= Bộ máy deck + crossfade ================= */
  function newDeck(variant, atTime) {
    var deck = {
      variant: variant, gain: 0, ramp: null,
      step: 0, nextTime: atTime, active: true,
      seed: (variant.mapId.length * 131 + variant.noteCount * 17 + (variant.isNight ? 7 : 0)) >>> 0,
      cycle: 0
    };
    if (S.ctx) {
      deck.gainNode = makeGain();
      deck.gainNode.connect(S.musicBus);
    }
    return deck;
  }
  function startDeckRamp(deck, to, dur) {
    var t = nowSec();
    deck.ramp = { from: deck.gain, to: to, t0: t, dur: Math.max(0.01, dur) };
    if (deck.gainNode) rampParam(deck.gainNode.gain, to, t, dur);
  }
  function updateDeckGains() {
    var t = nowSec(), alive = [];
    for (var i = 0; i < S.decks.length; i++) {
      var d = S.decks[i];
      if (d.ramp) {
        var p = (t - d.ramp.t0) / d.ramp.dur;
        if (p >= 1) { d.gain = d.ramp.to; d.ramp = null; }
        else d.gain = d.ramp.from + (d.ramp.to - d.ramp.from) * Math.max(0, p);
      }
      if (d.gain <= 0.0001 && !d.ramp && d.variant.id !== S.variantId) {
        // Deck của biến thể cũ đã mờ hết -> dọn khỏi danh sách.
        d.active = false;
        if (d.gainNode && typeof d.gainNode.disconnect === 'function') { try { d.gainNode.disconnect(); } catch (e) {} }
        continue;
      }
      alive.push(d);
    }
    S.decks = alive;
  }
  function currentDeck() {
    for (var i = 0; i < S.decks.length; i++) if (S.decks[i].variant.id === S.variantId) return S.decks[i];
    return S.decks.length ? S.decks[S.decks.length - 1] : null;
  }
  function applySceneToDecks(fadeSec, kind) {
    var variant = buildVariant(S.mapId, S.phase);
    var prevId = S.variantId;
    S.variantId = variant.id;
    if (!S.unlocked || !S.ctx) return; // chưa unlock: chỉ ghi trạng thái, im lặng
    var t = nowSec();
    var existing = currentDeck();
    if (existing && prevId === variant.id) return; // cùng biến thể: không crossfade
    for (var i = 0; i < S.decks.length; i++) startDeckRamp(S.decks[i], 0, fadeSec);
    var deck = newDeck(variant, t);
    S.decks.push(deck);
    startDeckRamp(deck, 1, fadeSec);
    if (prevId && prevId !== variant.id) {
      S.lastCrossfade = { fromVariant: prevId, toVariant: variant.id, durationSec: fadeSec, kind: kind || 'linearRamp' };
    }
  }

  /* ================= Lập lịch nốt (lookahead) ================= */
  function scheduleOsc(wave, freq, t0, dur, peak, dest) {
    if (!S.ctx) return;
    var o = S.ctx.createOscillator(), g = S.ctx.createGain();
    o.type = wave; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(peak, t0 + Math.min(0.08, dur * 0.25));
    if (typeof g.gain.exponentialRampToValueAtTime === 'function') g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    else g.gain.linearRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(dest);
    o.start(t0); o.stop(t0 + dur + 0.05);
    S.scheduledNotes++;
  }
  function scheduleDeckStep(deck, stepIdx, t) {
    var v = deck.variant;
    var stepDur = 60 / v.bpm / 2; // bước = nửa phách
    var bar = Math.floor(stepIdx / STEPS_PER_BAR);
    var inBar = stepIdx % STEPS_PER_BAR;
    var inMotif = stepIdx % MOTIF_STEPS;
    var dest = deck.gainNode || S.musicBus;
    if (inBar === 0) {
      // Đệm hợp âm đầu nhịp + nốt trầm gốc.
      var chord = v.chords[bar % v.chords.length];
      var climax = v.mapId === 'thanh_van_tong' && (deck.cycle % CLIMAX_EVERY_CYCLES === CLIMAX_EVERY_CYCLES - 1);
      var padPeak = v.padLevel * (climax ? 1.25 : 1);
      for (var i = 0; i < chord.length; i++) {
        scheduleOsc(v.padWave, midiHz(chord[i] + (climax && i === chord.length - 1 ? 12 : 0)), t, stepDur * STEPS_PER_BAR * 1.05, padPeak, dest);
      }
      scheduleOsc('sine', midiHz(chord[0] - 12), t, stepDur * STEPS_PER_BAR * 0.9, BASS_LEVEL, dest);
      if (bar % (MOTIF_STEPS / STEPS_PER_BAR) === 0 && bar > 0) deck.cycle++;
    }
    var deg = v.motif[inMotif];
    if (deg >= 0) {
      var cycClimax = v.mapId === 'thanh_van_tong' && (deck.cycle % CLIMAX_EVERY_CYCLES === CLIMAX_EVERY_CYCLES - 1) && bar % 4 === 3;
      scheduleOsc(v.motifWave, midiHz(degreeMidi(v, deg) + (cycClimax ? 12 : 0)), t, stepDur * 1.8, v.motifLevel, dest);
    }
    // Nhịp nền rất nhẹ: xác định theo băm bước (không Math.random).
    var h = ((stepIdx * 2654435761 + deck.seed * 97) >>> 0) % 1000 / 1000;
    if (h < v.density) {
      scheduleOsc('sine', 1250, t, 0.05, TICK_LEVEL, dest);
    }
  }
  function scheduleChirp(kind, t) {
    if (!S.ctx) return;
    var i, o, g;
    if (kind === 'bird') {
      // Chim: hai tiếng hót ngắn trượt lên 2400 -> 3200 Hz.
      for (i = 0; i < 2; i++) {
        o = S.ctx.createOscillator(); g = S.ctx.createGain();
        var t0 = t + i * 0.16;
        o.type = 'sine';
        o.frequency.setValueAtTime(2400 + rng() * 300, t0);
        if (typeof o.frequency.exponentialRampToValueAtTime === 'function') o.frequency.exponentialRampToValueAtTime(3200, t0 + 0.09);
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.linearRampToValueAtTime(CHIRP_LEVEL, t0 + 0.02);
        g.gain.linearRampToValueAtTime(0.0001, t0 + 0.12);
        o.connect(g); g.connect(S.ambBus);
        o.start(t0); o.stop(t0 + 0.15);
      }
    } else {
      // Dế: chuỗi xung 4200 Hz rất khẽ.
      for (i = 0; i < 3; i++) {
        o = S.ctx.createOscillator(); g = S.ctx.createGain();
        var t1 = t + i * 0.09;
        o.type = 'sine'; o.frequency.value = 4200;
        g.gain.setValueAtTime(0.0001, t1);
        g.gain.linearRampToValueAtTime(CHIRP_LEVEL * 0.6, t1 + 0.01);
        g.gain.linearRampToValueAtTime(0.0001, t1 + 0.05);
        o.connect(g); g.connect(S.ambBus);
        o.start(t1); o.stop(t1 + 0.07);
      }
    }
    S.scheduledChirps++;
  }
  function schedulerTick() {
    if (!S.ctx || !S.running || S.suspended) return;
    updateDeckGains();
    var horizon = nowSec() + SCHED_LOOKAHEAD_SEC;
    for (var i = 0; i < S.decks.length; i++) {
      var d = S.decks[i];
      if (!d.active || d.gain <= 0.0001 && d.variant.id !== S.variantId) continue;
      var stepDur = 60 / d.variant.bpm / 2;
      if (d.nextTime < nowSec() - 0.05) d.nextTime = nowSec();
      while (d.nextTime < horizon) {
        scheduleDeckStep(d, d.step, d.nextTime);
        d.step++;
        d.nextTime += stepDur;
      }
    }
    // Môi trường rời rạc: chim ngày / dế đêm theo lịch riêng.
    var f = ambFlags(), t = nowSec();
    if (f.birds && S.ambOn) {
      if (S.nextBirdAt <= 0) S.nextBirdAt = t + 0.4;
      if (t >= S.nextBirdAt) { scheduleChirp('bird', t + 0.02); S.nextBirdAt = t + 2.5 + rng() * 3.5; }
    }
    if (f.crickets && S.ambOn) {
      if (S.nextCricketAt <= 0) S.nextCricketAt = t + 0.4;
      if (t >= S.nextCricketAt) { scheduleChirp('cricket', t + 0.02); S.nextCricketAt = t + 1.2 + rng() * 1.8; }
    }
    applyGains();
  }
  /* applyGains: đưa mức thuần xuống các nút thật bằng ramp ngắn — gọi ở
     mọi điểm đổi trạng thái và mỗi tick lập lịch. */
  function applyGains() {
    if (!S.ctx) return;
    var t = nowSec();
    if (S.musicBus) rampParam(S.musicBus.gain, musicBusLevel(), t, 0.12);
    if (S.ambBus) rampParam(S.ambBus.gain, ambBusLevel(), t, 0.12);
    if (S.layers) {
      // Lớp con nối QUA ambBus nên gain của nút lớp là tỉ lệ tương đối
      // (level tuyệt đối / mức bus) để khỏi nhân đôi âm lượng bus.
      var bus = ambBusLevel();
      if (S.layers.stream) rampParam(S.layers.stream.gain.gain, bus > 0 ? streamLevel() / bus : 0, t, 0.15);
      if (S.layers.wind) rampParam(S.layers.wind.gain.gain, bus > 0 ? windLevel() / bus : 0, t, 0.15);
      if (S.layers.market) rampParam(S.layers.market.gain.gain, bus > 0 ? marketLevel() / bus : 0, t, 0.15);
    }
  }

  /* ================= API công khai ================= */
  /* unlock(factory?): gọi SAU tương tác đầu tiên của người chơi (chính
     sách autoplay của trình duyệt). Trước unlock: im lặng tuyệt đối,
     không tạo AudioContext. Gọi hai lần: an toàn, không tạo ngữ cảnh
     thứ hai. factory chỉ dùng cho kiểm thử (tiêm ngữ cảnh giả); trình
     duyệt gọi unlock() không đối số. */
  function startTimer() {
    if (typeof setInterval === 'function' && !S.timer) {
      S.timer = setInterval(schedulerTick, SCHED_INTERVAL_MS);
      if (S.timer && typeof S.timer.unref === 'function') S.timer.unref();
    }
  }
  /* Dựng lại máy trên ngữ cảnh đã có (sau stop()): deck mới mờ vào,
     lớp môi trường + bộ lập lịch chạy lại, KHÔNG tạo ngữ cảnh thứ hai. */
  function restartEngine() {
    S.running = true; S.suspended = false;
    if (S.ctx.state === 'suspended' && typeof S.ctx.resume === 'function') { try { S.ctx.resume(); } catch (e) {} }
    startLayers();
    S.variantId = null;
    applySceneToDecks(FADE_IN_SEC, 'fadeIn');
    S.lastCrossfade = null;
    applyGains();
    startTimer();
    schedulerTick();
  }
  function unlock(factory) {
    if (S.ctx && !S.running) { restartEngine(); return getState(); }
    if (S.ctx && S.suspended) { resume(); return getState(); }
    if (S.unlocked && S.ctx) {
      if (S.ctx.state === 'suspended' && typeof S.ctx.resume === 'function') { try { S.ctx.resume(); } catch (e) {} }
      return getState();
    }
    var ctx = null;
    try { ctx = factory ? factory() : defaultContextFactory(); } catch (e) { ctx = null; }
    if (!ctx) return getState(); // không có WebAudio: giữ im lặng, không lỗi
    S.ctx = ctx;
    S.contextsCreated++;
    S.unlocked = true; S.running = true; S.suspended = false;
    S.musicBus = makeGain(); S.musicBus.connect(ctx.destination);
    S.ambBus = makeGain(); S.ambBus.connect(ctx.destination);
    if (ctx.state === 'suspended' && typeof ctx.resume === 'function') { try { ctx.resume(); } catch (e) {} }
    startLayers();
    S.variantId = null;
    applySceneToDecks(FADE_IN_SEC, 'fadeIn');
    // Deck đầu mờ vào từ 0: applySceneToDecks đã ramp deck mới lên 1.
    S.lastCrossfade = null;
    applyGains();
    startTimer();
    schedulerTick();
    return getState();
  }
  function resume() {
    if (!S.ctx) return unlock();
    S.suspended = false; S.running = true;
    if (typeof S.ctx.resume === 'function') { try { S.ctx.resume(); } catch (e) {} }
    applyGains();
    return getState();
  }
  /* suspend(): tạm treo khi ẩn tab / thoát tạm — giữ nguyên cảnh, mức
     ra về 0 qua trạng thái suspended (musicBusLevel/ambBusLevel = 0). */
  function suspend() {
    if (!S.ctx) return getState();
    S.suspended = true;
    applyGains();
    if (typeof S.ctx.suspend === 'function') { try { S.ctx.suspend(); } catch (e) {} }
    return getState();
  }
  /* stop(): dừng hẳn khi thoát về màn hình đăng nhập — mờ tắt nhanh,
     dừng lớp môi trường + bộ lập lịch, treo ngữ cảnh. Gọi lại unlock()
     sau đó khôi phục từ cảnh đã ghi. */
  function stop() {
    if (S.ctx && S.musicBus) rampParam(S.musicBus.gain, 0, nowSec(), STOP_FADE_SEC);
    if (S.ctx && S.ambBus) rampParam(S.ambBus.gain, 0, nowSec(), STOP_FADE_SEC);
    S.running = false;
    S.decks = [];
    stopLayers();
    if (S.timer) { clearInterval(S.timer); S.timer = null; }
    if (S.ctx && typeof S.ctx.suspend === 'function') { try { S.ctx.suspend(); } catch (e) {} }
    S.suspended = true;
    return getState();
  }
  /* setScene(mapId, phase): chọn biến thể theo bản đồ + pha ngày đêm.
     phase nhận mọi dạng của resolvePhase() — tích hợp cấp pha thật từ
     logic.js: L.dayPhaseFor(state, SET.current.dayMode) hoặc phút
     L.displayDayMinutes(...). Đổi biến thể -> crossfade CROSSFADE_SEC
     bằng ramp, không cắt đột ngột; chỉ đổi pha trong cùng biến thể
     (vd sáng -> chạng vạng chưa qua ngưỡng đêm) thì chỉ cập nhật lớp
     môi trường, không crossfade nhạc. */
  function setScene(mapId, phase) {
    S.mapId = normMap(mapId);
    S.phase = resolvePhase(phase);
    applySceneToDecks(CROSSFADE_SEC, 'linearRamp');
    applyGains();
    return getState();
  }
  function setMusic(on, volume01) {
    S.musicOn = on == null ? S.musicOn : !!on;
    if (volume01 != null) S.musicVol = clamp01(volume01, MUSIC_DEFAULT_VOL);
    applyGains();
    return getState();
  }
  function setAmbience(on, volume01) {
    S.ambOn = on == null ? S.ambOn : !!on;
    if (volume01 != null) S.ambVol = clamp01(volume01, AMB_DEFAULT_VOL);
    applyGains();
    return getState();
  }
  /* setProximity(stream01): 0..1 — mức gần suối/cầu do tích hợp cấp
     (1 = đứng sát bờ). 0 = tắt hẳn lớp suối. Không bao giờ được gọi
     cũng an toàn: mặc định 0, suối im lặng cho tới khi có tín hiệu. */
  function setProximity(stream01) {
    S.proximity = clamp01(stream01, 0);
    applyGains();
    return getState();
  }
  /* setDuck(on): bật khi thoại/lồng tiếng đang phát — hạ nhạc nền x
     DUCK_MUSIC và môi trường x DUCK_AMBIENCE để không lấn thoại. */
  function setDuck(on) {
    S.duck = !!on;
    applyGains();
    return getState();
  }
  function getState() {
    var variant = buildVariant(S.mapId, S.phase);
    return {
      unlocked: S.unlocked, running: S.running, suspended: S.suspended,
      hasContext: !!S.ctx, contextsCreated: S.contextsCreated,
      mapId: S.mapId,
      phase: { bucket: S.phase.bucket, night01: S.phase.night01, isNight: S.phase.isNight, minutes: S.phase.minutes },
      variantId: S.variantId || variant.id,
      variant: { id: variant.id, bpm: variant.bpm, noteCount: variant.noteCount, density: variant.density },
      musicOn: S.musicOn, musicVol: S.musicVol,
      ambienceOn: S.ambOn, ambienceVol: S.ambVol,
      proximity: S.proximity, duck: S.duck,
      effectiveMusicGain: musicBusLevel(),
      effectiveAmbienceGain: ambBusLevel(),
      streamGain: streamLevel(), windGain: windLevel(), marketGain: marketLevel(),
      ambience: ambFlags(),
      decks: S.decks.map(function (d) { return { variantId: d.variant.id, gain: d.gain, active: d.active, hasRamp: !!d.ramp }; }),
      crossfadeActive: S.decks.some(function (d) { return !!d.ramp; }),
      lastCrossfade: S.lastCrossfade,
      scheduledNotes: S.scheduledNotes, scheduledChirps: S.scheduledChirps
    };
  }

  /* Hợp đồng cài đặt ĐỀ XUẤT cho js/settings.js (khuôn VSLC_SETTINGS:
     DEFAULTS + sanitize bằng isBool/clampNum; panel id theo khuôn
     'set-...'). Module này KHÔNG tự đọc settings — tích hợp đẩy xuống
     qua setMusic/setAmbience. Điều phối viên cài đúng bảng này. */
  var SETTINGS_SPEC = {
    keys: {
      musicOn: { type: 'bool', def: true },
      musicVol: { type: 'num01', def: MUSIC_DEFAULT_VOL },
      ambienceOn: { type: 'bool', def: true },
      ambienceVol: { type: 'num01', def: AMB_DEFAULT_VOL }
    },
    panel: {
      musicOn: 'set-music', musicVol: 'set-musicvol',
      ambienceOn: 'set-ambience', ambienceVol: 'set-ambiencevol'
    },
    panelScale: 'slider 0..100 -> value/100 (như set-volume/set-voicevol)'
  };

  var M = {
    /* Hằng số */
    CROSSFADE_SEC: CROSSFADE_SEC, STOP_FADE_SEC: STOP_FADE_SEC, FADE_IN_SEC: FADE_IN_SEC,
    SCHED_LOOKAHEAD_SEC: SCHED_LOOKAHEAD_SEC, SCHED_INTERVAL_MS: SCHED_INTERVAL_MS,
    DUCK_MUSIC: DUCK_MUSIC, DUCK_AMBIENCE: DUCK_AMBIENCE,
    STREAM_MAX: STREAM_MAX, WIND_MAX: WIND_MAX, MARKET_MAX: MARKET_MAX,
    MUSIC_DEFAULT_VOL: MUSIC_DEFAULT_VOL, AMB_DEFAULT_VOL: AMB_DEFAULT_VOL,
    MAP_IDS: MAP_IDS, TRACKS: TRACKS, AMBIENCE_DEFS: AMBIENCE_DEFS,
    SETTINGS_SPEC: SETTINGS_SPEC,
    /* Hàm thuần (kiểm thử/tích hợp tra cứu) */
    resolvePhase: resolvePhase, resolveVariant: resolveVariant,
    resolveAmbience: function (mapId, phase) { return resolveAmbience(mapId, resolvePhase(phase)); },
    nightAtMinutes: nightAtMinutes,
    /* API máy */
    unlock: unlock, resume: resume, suspend: suspend, stop: stop,
    setScene: setScene, setMusic: setMusic, setAmbience: setAmbience,
    setProximity: setProximity, setDuck: setDuck,
    getState: getState,
    _tick: schedulerTick /* móc kiểm thử: chạy một vòng lập lịch bằng tay */
  };
  global.VSLC_MUSIC = M;
  if (typeof module !== 'undefined' && module.exports) module.exports = M;
})(typeof window !== 'undefined' ? window : globalThis);
