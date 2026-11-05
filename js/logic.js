/* Logic lõi thuần (không chạm DOM) của game Vô Sắc Linh Căn.
   Dùng chung cho trình duyệt (window.VSLC) và kiểm tra khói bằng Node. */
(function (global) {
  'use strict';

  /* ---------------- Cảnh giới ---------------- */
  // Luyện Khí và Trúc Cơ đã xác minh trong truyện gốc; các cảnh giới phía trên
  // là bổ sung theo chuẩn thể loại (ghi rõ trong docs/story-bible.md phần B/C).
  var REALMS = [
    { id: 'pham', name: 'Phàm Nhân', stages: ['—'], tuviNext: 100 },
    { id: 'luyenkhi', name: 'Luyện Khí', stages: ['Tầng 1', 'Tầng 2', 'Tầng 3', 'Tầng 4', 'Tầng 5', 'Tầng 6', 'Tầng 7', 'Tầng 8', 'Tầng 9'], tuviNext: 100 },
    { id: 'trucco', name: 'Trúc Cơ', stages: ['Sơ Kỳ', 'Trung Kỳ', 'Hậu Kỳ', 'Viên Mãn'], tuviNext: 400 },
    { id: 'kimdan', name: 'Kim Đan', stages: ['Sơ Kỳ', 'Trung Kỳ', 'Hậu Kỳ', 'Viên Mãn'], tuviNext: 1200 },
    { id: 'nguyenanh', name: 'Nguyên Anh', stages: ['Sơ Kỳ', 'Trung Kỳ', 'Hậu Kỳ', 'Viên Mãn'], tuviNext: 3600 },
    { id: 'hoathan', name: 'Hóa Thần', stages: ['Sơ Kỳ', 'Trung Kỳ', 'Hậu Kỳ', 'Viên Mãn'], tuviNext: 9000 },
    { id: 'dokiep', name: 'Độ Kiếp', stages: ['Đạo 1', 'Đạo 2', 'Đạo 3', 'Đạo 4', 'Đạo 5', 'Đạo 6', 'Đạo 7', 'Đạo 8', 'Đạo 9'], tuviNext: null }
  ];
  function realmName(realmIdx, stageIdx) {
    var r = REALMS[realmIdx];
    if (!r) return 'Phàm Nhân';
    if (realmIdx === 0) return 'Phàm Nhân';
    return r.name + ' ' + r.stages[Math.min(stageIdx, r.stages.length - 1)];
  }

  /* ---------------- Vạn Âm Cộng Hưởng / Tĩnh Âm ---------------- */
  // Tĩnh Âm: độ lắng âm 0..100. Thổ nạp và thời gian sống lặng tích lũy nó;
  // gõ đòn cộng hưởng ra thì tiêu hao — nghe càng lâu càng trong, đòn gõ càng
  // nặng (sáng tác bổ sung của đội, xem tài liệu thiết kế Vạn Âm Cộng Hưởng).
  var SILENCE_MAX = 100;
  var SILENCE_RATES = {
    meditate: 6,   // thổ nạp tích nhanh nhất (điểm/giây)
    walk: 0.6,     // sống im lặng tích chậm
    idle: 0.2
  };
  var WORD_SKILLS = [
    { id: 'pha', word: 'PHÁ', cost: 30, basePower: 10, unlock: 'voice' },
    { id: 'chan', word: 'CHẤN', cost: 50, basePower: 26, unlock: 'luyenkhi1' },
    /* bậc Hưởng — bậc cao của Vạn Âm Cộng Hưởng, chỉ mở khi Kết Đan (phần 3, chương 12):
       Định Âm định thân giữ địch một nhịp, Phong Âm phong ấn hai nhịp. Khóa mở
       'kimdan' chỉ được cấp tại MỘT điểm duy nhất: tryBreakthrough khi đạt
       Kim Đan Sơ Kỳ (và hồi tố trong normalizeSave cho save đã qua mốc). */
    { id: 'dinh', word: 'ĐỊNH', cost: 60, basePower: 20, unlock: 'kimdan' },
    { id: 'phong', word: 'PHONG', cost: 80, basePower: 34, unlock: 'kimdan' }
  ];
  function silenceGain(mode, seconds, cur) {
    var rate = SILENCE_RATES[mode] || 0;
    return Math.min(SILENCE_MAX, Math.max(0, cur + rate * seconds));
  }
  // Uy lực một đòn cộng hưởng: gốc của chiêu + toàn bộ Tĩnh Âm lắng được quy đổi.
  function wordPower(skill, silence) {
    return Math.round(skill.basePower + silence * 1.5);
  }
  function castWord(state, skillId) {
    var skill = null;
    for (var i = 0; i < WORD_SKILLS.length; i++) if (WORD_SKILLS[i].id === skillId) skill = WORD_SKILLS[i];
    if (!skill) return { ok: false, reason: 'Không có chiêu này.' };
    if (!state.unlocked || state.unlocked.indexOf(skill.unlock) < 0) return { ok: false, reason: 'Chưa mở khóa chiêu này.' };
    if (state.silence < skill.cost) return { ok: false, reason: 'Tĩnh Âm chưa đủ — hãy lắng nghe thêm.' };
    var power = wordPower(skill, state.silence);
    power += weaponBonus(state).word; // vũ khí đang đeo kiếm ngân trợ hưởng (Thanh Phong Kiếm +10, Thiết Kiếm Hứa Gia +3)
    state.silence = Math.max(0, state.silence - skill.cost);
    state.timesSpoken = (state.timesSpoken || 0) + 1;
    return { ok: true, power: power, skill: skill };
  }

  /* ---------------- Bản đồ Hứa Gia Trấn ---------------- */
  // Ô 32px. Ký tự: '.' cỏ, ',' cỏ hoa, 'D' đường đất, 'S' sân đá, 'P' sân đá hoa văn,
  // 'W' nước (chặn), 'w' bờ nước, 'G' cổng trấn (đi được), 'X' tường bao (chặn).
  var MAP_W = 60, MAP_H = 45;
  var MAP_GRID = [
    'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    'X..........................................................X',
    'X..........................................................X',
    'X...................................................wwwww..X',
    'X...................................................wWWWw..X',
    'X...................................................wWWWw..X',
    'X...........D.......................................wwWww..X',
    'X...........D........................................www...X',
    'X...........DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD............X',
    'X.......................D......................,,,,........X',
    'X.......................D......................,,,,........X',
    'X............,,,,.......D......................,,,,........X',
    'X............,,,,.......D..................................X',
    'X............,,,,.......D..................................X',
    'X..,,,,.................D.........................DDDD.....X',
    'X..,,,,.................D............................D.....X',
    'X..,,,,.................D............................D.....X',
    'X...................SSSSSSSSSSSSSSSSSSSS.............D.....X',
    'X...................SPPPPPPPPPPPPPPPPPPS.............D.....X',
    'X...................SPPPPPPPPPPPPPPPPPPS.............D.....X',
    'X...................SPPPPPPPPPPPPPPPPPPS..........D........X',
    'X...................SPPPPPPPPPPPPPPPPPPS..........D........X',
    'X........DDDDDDDDDDDSPPPPPPPPPPPPPPPPPPSDDDDDDDDDDD........X',
    'X...................SPPPPPPPPPPPPPPPPPPS...................X',
    'X...................SPPPPPPPPPPPPPPPPPPS..............,,,,.X',
    'X...................SPPPPPPPPPPPPPPPPPPS..............,,,,.X',
    'X...................SSSSSSSSSSSSSSSSSSSS..............,,,,.X',
    'X............................SS............................X',
    'X............................SS............................X',
    'X............................SS............................X',
    'X...............D............SS............................X',
    'X...............D............SS............................X',
    'X...............D............SS............................X',
    'X...............D............SS...................D........X',
    'X...............D............SS...................D........X',
    'X...............D............SS...................D........X',
    'X...........DDDDDDDDDDDDDDDDDSSDDDDDDDDDDDDDDDDDDDD........X',
    'X............................SS............................X',
    'X............................SS............................X',
    'X............................SS............................X',
    'X.................,,,,.......SS.............,,,,,,.........X',
    'X.................,,,,.......SS.............,,,,,,.........X',
    'X.................,,,,.......SS.............,,,,,,.........X',
    'X............................SS............................X',
    'XXXXXXXXXXXXXXXXXXXXXXXXXXXXGGGGXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
  ];
  // Vật thể đứng: nhà, cây, bia đá trắc linh, đèn lồng, giếng, cọc gỗ.
  // fx/fy = bề rộng bề sâu phần chân chặn (tính theo ô).
  var PROPS = [
    { id: 'nha_hua', type: 'house_big', x: 4, y: 3, w: 8, h: 5, fx: 8, fy: 2, name: 'Hứa Gia Đại Trạch' },
    { id: 'nha_bac', type: 'house_b', x: 18, y: 4, w: 5, h: 3, fx: 5, fy: 1, name: 'Nhà dân thôn' },
    { id: 'nha_kho', type: 'house', x: 44, y: 4, w: 4, h: 3, fx: 4, fy: 1, name: 'Nhà kho Hứa gia' },
    { id: 'nha_dong_bac', type: 'house_c', x: 52, y: 11, w: 4, h: 3, fx: 4, fy: 1, name: 'Nhà dân thôn' },
    { id: 'tuu_diem', type: 'inn', x: 44, y: 18, w: 6, h: 4, fx: 6, fy: 1, name: 'Vọng Tiên Tửu Điếm', interact: true },
    { id: 'nha_tay', type: 'house', x: 5, y: 20, w: 4, h: 3, fx: 4, fy: 1, name: 'Nhà dân thôn' },
    { id: 'nha_tay_nam', type: 'house_c', x: 8, y: 34, w: 4, h: 3, fx: 4, fy: 1, name: 'Nhà dân thôn' },
    { id: 'nha_nam', type: 'house_b', x: 41, y: 34, w: 5, h: 3, fx: 5, fy: 1, name: 'Nhà dân thôn' },
    { id: 'nha_dong_nam', type: 'house', x: 51, y: 33, w: 4, h: 3, fx: 4, fy: 1, name: 'Nhà dân thôn' },
    { id: 'bia_trac_linh', type: 'stele', x: 29, y: 16, w: 2, h: 2, fx: 2, fy: 1, name: 'Bia đá trắc linh', interact: true },
    /* Bộ bàn trà sân Hứa Gia Trấn (gói phụ 5, rà cùng họ lệch hình–chữ):
       lời dẫn cảnh cất lời đầu tiên SCENE_VOICE viết "chén trà trên bàn
       nảy khỏi mặt bàn" ngay tại sân này nhưng sân chưa từng có bàn —
       bày hai bàn đá liền nhau phía nam nhóm gia đình (hàng 19–20). */
    { id: 'ban_tra_tran_a', type: 'table_stone', x: 27, y: 22, w: 1, h: 1, fx: 1, fy: 1, name: 'Bàn trà sân Hứa gia' },
    { id: 'ban_tra_tran_b', type: 'table_stone', x: 28, y: 22, w: 1, h: 1, fx: 1, fy: 1, name: 'Bàn trà sân Hứa gia' },
    { id: 'gieng', type: 'well', x: 51, y: 19, w: 2, h: 2, fx: 2, fy: 1, name: 'Giếng nước đầu trấn', interact: true },
    /* Bãi nấm của hệ đồ ăn (đợt 2026-11-04): bụi cây phía tây trấn,
       hái được 1 Nấm Rừng mỗi ngày game qua L.gatherFoodPatch('tran').
       Ô (17,33) là cỏ trống, bốn ô kề đều đứng được và tới được từ
       điểm xuất phát (đã kiểm bằng propAt/isWalkable/reachable). */
    { id: 'bai_nam_tran', type: 'bush1', x: 17, y: 33, w: 1, h: 1, fx: 1, fy: 1, name: 'Bãi Nấm Rừng', interact: true },
    { id: 'coc_go', type: 'dummy', x: 36, y: 30, w: 1, h: 2, fx: 1, fy: 1, name: 'Cọc gỗ luyện công', interact: true },
    { id: 'sap_cho_1', type: 'stall', x: 22, y: 38, w: 4, h: 2, fx: 4, fy: 1, name: 'Sạp hàng' },
    { id: 'sap_cho_2', type: 'stall', x: 35, y: 38, w: 4, h: 2, fx: 4, fy: 1, name: 'Sạp hàng' },
    { id: 'den1', type: 'lantern', x: 19, y: 16, w: 1, h: 2, fx: 1, fy: 1 },
    { id: 'den2', type: 'lantern', x: 40, y: 16, w: 1, h: 2, fx: 1, fy: 1 },
    { id: 'den3', type: 'lantern', x: 19, y: 27, w: 1, h: 2, fx: 1, fy: 1 },
    { id: 'den4', type: 'lantern', x: 40, y: 27, w: 1, h: 2, fx: 1, fy: 1 },
    { id: 'cay1', type: 'tree', x: 2, y: 10, w: 1, h: 2, fx: 1, fy: 1 },
    { id: 'cay2', type: 'pine', x: 15, y: 12, w: 1, h: 2, fx: 1, fy: 1 },
    { id: 'cay3', type: 'tree', x: 26, y: 5, w: 1, h: 2, fx: 1, fy: 1 },
    { id: 'cay4', type: 'pine', x: 37, y: 9, w: 1, h: 2, fx: 1, fy: 1 },
    { id: 'cay5', type: 'tree', x: 57, y: 17, w: 1, h: 2, fx: 1, fy: 1 },
    { id: 'cay6', type: 'tree', x: 33, y: 12, w: 1, h: 2, fx: 1, fy: 1 },
    { id: 'cay7', type: 'pine', x: 16, y: 26, w: 1, h: 2, fx: 1, fy: 1 },
    { id: 'cay8', type: 'tree', x: 6, y: 28, w: 1, h: 2, fx: 1, fy: 1 },
    { id: 'cay9', type: 'pine', x: 47, y: 27, w: 1, h: 2, fx: 1, fy: 1 },
    { id: 'cay10', type: 'tree', x: 21, y: 41, w: 1, h: 2, fx: 1, fy: 1 },
    { id: 'cay11', type: 'pine', x: 39, y: 41, w: 1, h: 2, fx: 1, fy: 1 },
    { id: 'cay12', type: 'tree', x: 56, y: 39, w: 1, h: 2, fx: 1, fy: 1 },
    { id: 'cay13', type: 'pine', x: 11, y: 41, w: 1, h: 2, fx: 1, fy: 1 }
  ];
  // NPC: vị trí ô, loại hình, tên hiển thị.
  var NPCS = [
    { id: 'u_nhan', name: 'Hứa U Nhàn', look: 'u_nhan', x: 28, y: 28, dir: 'down' },
    { id: 'di_ninh', name: 'Hứa Di Ninh', look: 'di_ninh', x: 34, y: 19, dir: 'left' },
    { id: 'luc_tranh', name: 'Lục Tranh', look: 'luc_tranh', x: 32, y: 20, dir: 'down' },
    { id: 'anh_phung', name: 'Vương Ánh Phụng', look: 'anh_phung', x: 22, y: 19, dir: 'right' },
    { id: 'chinh_ngon', name: 'Hứa Chính Ngôn', look: 'chinh_ngon', x: 24, y: 20, dir: 'right' },
    { id: 'truong_lao', name: 'Trưởng lão trắc linh', look: 'elder', x: 30, y: 19, dir: 'up' },
    { id: 'dan_a', name: 'Dân thôn A Quý', look: 'villager_m', x: 14, y: 23, dir: 'right' },
    { id: 'dan_b', name: 'Dân thôn Thúy Nương', look: 'villager_f', x: 42, y: 22, dir: 'left' },
    { id: 'dan_c', name: 'Dân thôn Lão Tôn', look: 'villager_old', x: 53, y: 22, dir: 'down' }
  ];
  var SPAWN = { x: 29, y: 31 };
  var WELL_MEDITATE = { x: 50, y: 20 }; // điểm thổ nạp cạnh giếng (linh khí tụ)

  function tileAt(tx, ty) {
    var def = MAPS[ACTIVE_MAP];
    if (tx < 0 || ty < 0 || tx >= def.w || ty >= def.h) return 'X';
    return def.grid[ty].charAt(tx);
  }
  /* ---------- Vật thể ẩn theo phiên (đợt bí cảnh + hệ cày) ----------
     Registry CHỈ sống trong bộ nhớ phiên (biến module, không ghi save):
     mapId -> { propId: true } với các vật thể đã mở trong phiên này.
     propAt bỏ qua vật thể đã ẩn nên nó không còn chặn đường; làn game.js
     gọi hideSessionProp khi người chơi mở cửa/vách, và
     clearSessionHiddenProps khi đổi bản đồ. Các vật thể đặc biệt
     (vach_nut, cua_phe_thuoc, tinh_mac_tran, cua_mo_that) chặn đường bằng
     footprint của chúng khi chưa mở — đúng hành vi propAt mặc định. */
  var SESSION_HIDDEN_PROPS = {};
  function isSessionHidden(mapId, propId) {
    var m = SESSION_HIDDEN_PROPS[mapId];
    return !!(m && m[propId]);
  }
  function hideSessionProp(mapId, propId) {
    if (!SESSION_HIDDEN_PROPS[mapId]) SESSION_HIDDEN_PROPS[mapId] = {};
    SESSION_HIDDEN_PROPS[mapId][propId] = true;
    return true;
  }
  function showSessionProp(mapId, propId) {
    var m = SESSION_HIDDEN_PROPS[mapId];
    if (m) delete m[propId];
    return true;
  }
  function clearSessionHiddenProps(mapId) {
    if (mapId) delete SESSION_HIDDEN_PROPS[mapId];
    else for (var k in SESSION_HIDDEN_PROPS) delete SESSION_HIDDEN_PROPS[k];
    return true;
  }
  function propAt(tx, ty) {
    var props = MAPS[ACTIVE_MAP].props;
    for (var i = 0; i < props.length; i++) {
      var p = props[i];
      if (isSessionHidden(ACTIVE_MAP, p.id)) continue;
      var footY = p.y + p.h - p.fy;
      if (tx >= p.x && tx < p.x + p.fx && ty >= footY && ty < p.y + p.h) return p;
    }
    return null;
  }
  /* ---------- Chạm-để-tương-tác (lệnh Bui 12:00 ngày 2026-11-01) ----------
     Người chơi chạm/bấm thẳng vào đối tượng: hàm này phân giải ô chạm thành
     mục tiêu tương tác (NPC đứng ở ô đó — kể cả chạm vào phần đầu/thân phía
     trên ô đứng vì sprite cao hơn một ô — hoặc vật thể có cờ interact trong
     toàn bộ khung hình vẽ của nó, không chỉ footprint ở chân). */
  function tapTargetAt(tx, ty, npcs) {
    var list = npcs || MAPS[ACTIVE_MAP].npcs;
    var i, n;
    for (i = 0; i < list.length; i++) {
      n = list[i];
      if (n.x === tx && n.y === ty) return { kind: 'npc', id: n.id, name: n.name, x: n.x, y: n.y };
    }
    // Thân trên của NPC (1 ô phía trên ô đứng) ưu tiên trước vật thể: NPC
    // đứng sát vật thể (trưởng lão ngay dưới bia đá) thì vùng thân trên và
    // vùng vẽ của vật thể chồng nhau, lấy NPC trước mới đúng ý người chạm.
    for (i = 0; i < list.length; i++) {
      n = list[i];
      if (n.x === tx && n.y === ty + 1) return { kind: 'npc', id: n.id, name: n.name, x: n.x, y: n.y };
    }
    var props = MAPS[ACTIVE_MAP].props;
    for (i = 0; i < props.length; i++) {
      var p = props[i];
      if (isSessionHidden(ACTIVE_MAP, p.id)) continue;
      if (!p.interact) continue;
      if (tx >= p.x && tx < p.x + p.w && ty >= p.y && ty < p.y + p.h)
        return { kind: 'prop', id: p.id, name: p.name || p.id, x: p.x, y: p.y };
    }
    // Phần đầu NPC (2 ô phía trên) xét sau vật thể: vùng này có thể chồng
    // lên vật thể đứng ngay phía trên NPC.
    for (i = 0; i < list.length; i++) {
      n = list[i];
      if (n.x === tx && n.y === ty + 2) return { kind: 'npc', id: n.id, name: n.name, x: n.x, y: n.y };
    }
    return null;
  }
  /* Các ô đứng kề hợp lệ để tương tác với mục tiêu: đi được, kề bốn hướng
     với ô của NPC hoặc với một ô footprint của vật thể. Ô trước mặt chuẩn
     (giữa–nam của vật thể) được xếp đầu tiên. */
  function standTilesFor(target, npcs) {
    var out = [];
    function push(x, y) {
      if (!isWalkable(x, y, npcs)) return;
      for (var i = 0; i < out.length; i++) if (out[i].x === x && out[i].y === y) return;
      out.push({ x: x, y: y });
    }
    if (target.kind === 'npc') {
      push(target.x, target.y - 1); push(target.x - 1, target.y);
      push(target.x + 1, target.y); push(target.x, target.y + 1);
      return out;
    }
    var props = MAPS[ACTIVE_MAP].props, p = null;
    for (var i = 0; i < props.length; i++) if (props[i].id === target.id) { p = props[i]; break; }
    if (!p) return out;
    var footY = p.y + p.h - p.fy;
    push(p.x + Math.floor(p.fx / 2), p.y + p.h); // ô trước mặt chuẩn
    for (var fxI = 0; fxI < p.fx; fxI++) {
      for (var fyI = 0; fyI < p.fy; fyI++) {
        var cx = p.x + fxI, cy = footY + fyI;
        push(cx, cy - 1); push(cx - 1, cy); push(cx + 1, cy); push(cx, cy + 1);
      }
    }
    return out;
  }
  function npcAt(tx, ty, npcs) {
    for (var i = 0; i < npcs.length; i++) if (npcs[i].x === tx && npcs[i].y === ty) return npcs[i];
    return null;
  }
  function isWalkable(tx, ty, npcs) {
    var t = tileAt(tx, ty);
    if (t === 'X' || t === 'W') return false;
    if (propAt(tx, ty)) return false;
    if (npcs && npcAt(tx, ty, npcs)) return false;
    return true;
  }
  // BFS kiểm tra tới được (dùng trong test và chỉ đường nhiệm vụ).
  function reachable(from, to, npcs) {
    var key = function (x, y) { return x + ',' + y; };
    var seen = {}, queue = [[from.x, from.y]];
    seen[key(from.x, from.y)] = true;
    while (queue.length) {
      var cur = queue.shift(), x = cur[0], y = cur[1];
      if (x === to.x && y === to.y) return true;
      var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      for (var i = 0; i < 4; i++) {
        var nx = x + dirs[i][0], ny = y + dirs[i][1], k = key(nx, ny);
        if (!seen[k] && (isWalkable(nx, ny, npcs) || (nx === to.x && ny === to.y))) {
          seen[k] = true; queue.push([nx, ny]);
        }
      }
    }
    return false;
  }
  // A* tìm đường đi (cho di chuyển bằng chuột): cùng luật đi được với
  // reachable()/isWalkable(). Trả về mảng các ô {x, y} từ ô kề điểm đầu tới
  // ô đích (không gồm ô đầu, gồm ô đích), [] nếu đã đứng ở đích, hoặc null
  // nếu đích không đi được / không tới được.
  // ĐỢT LÀM LẠI DI CHUYỂN 2026-11-03 (mục A): 8 HƯỚNG với chi phí Euclid
  // (trục chính 1, chéo sqrt(2)) thay cho BFS 4 hướng cũ — đường ô thôi đã
  // chéo thật thay vì bậc thang ngang/dọc thuần, để khâu vuốt đường phía
  // game.js có chất liệu chéo mà bám. CHẶN CẮT GÓC: bước chéo (dx,dy) chỉ
  // được phép khi CẢ HAI ô trục chính kề (x+dx,y) và (x,y+dy) đều đi được
  // — không bao giờ lách qua góc của ô chặn/vật thể/NPC. Hệ quả: tập ô tới
  // được không đổi so với 4 hướng (mọi cạnh 4 hướng vẫn còn nguyên, cạnh
  // chéo chỉ thêm), nên reachable() và mọi khẳng định neo/cổng giữ nguyên
  // ngữ nghĩa; chỉ hình dáng + độ dài (theo chi phí Euclid) của đường đổi.
  function findPath(from, to, npcs) {
    if (!from || !to) return null;
    if (!isWalkable(to.x, to.y, npcs)) return null;
    if (from.x === to.x && from.y === to.y) return [];
    var key = function (x, y) { return x + ',' + y; };
    var SQ2 = Math.SQRT2;
    // Ước lượng octile: admissible + nhất quán cho lưới 8 hướng chi phí trên.
    function heur(x, y) {
      var dx = Math.abs(x - to.x), dy = Math.abs(y - to.y);
      return dx + dy + (SQ2 - 2) * Math.min(dx, dy);
    }
    var gScore = {}, prev = {}, closed = {};
    // Heap nhị phân theo f = g + h (phần tử: [f, x, y]).
    var heap = [];
    function hPush(f, x, y) {
      heap.push([f, x, y]);
      var i = heap.length - 1;
      while (i > 0) {
        var par = (i - 1) >> 1;
        if (heap[par][0] <= heap[i][0]) break;
        var t = heap[par]; heap[par] = heap[i]; heap[i] = t; i = par;
      }
    }
    function hPop() {
      var top = heap[0], last = heap.pop();
      if (heap.length) {
        heap[0] = last;
        var i = 0;
        for (;;) {
          var l = i * 2 + 1, r = l + 1, m = i;
          if (l < heap.length && heap[l][0] < heap[m][0]) m = l;
          if (r < heap.length && heap[r][0] < heap[m][0]) m = r;
          if (m === i) break;
          var t = heap[m]; heap[m] = heap[i]; heap[i] = t; i = m;
        }
      }
      return top;
    }
    var dirs = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1],
                [1, 1, SQ2], [1, -1, SQ2], [-1, 1, SQ2], [-1, -1, SQ2]];
    gScore[key(from.x, from.y)] = 0;
    prev[key(from.x, from.y)] = null;
    hPush(heur(from.x, from.y), from.x, from.y);
    while (heap.length) {
      var cur = hPop(), x = cur[1], y = cur[2], ck = key(x, y);
      if (closed[ck]) continue;
      closed[ck] = true;
      if (x === to.x && y === to.y) {
        var path = [], cx = x, cy = y;
        while (cx !== from.x || cy !== from.y) {
          path.push({ x: cx, y: cy });
          var p = prev[key(cx, cy)]; cx = p[0]; cy = p[1];
        }
        path.reverse();
        return path;
      }
      var gCur = gScore[ck];
      for (var i = 0; i < 8; i++) {
        var dx = dirs[i][0], dy = dirs[i][1], nx = x + dx, ny = y + dy, k = key(nx, ny);
        if (closed[k]) continue;
        if (!isWalkable(nx, ny, npcs)) continue;
        if (dx !== 0 && dy !== 0) {
          // Chặn cắt góc: cả hai ô trục chính kề phải đi được.
          if (!isWalkable(x + dx, y, npcs) || !isWalkable(x, y + dy, npcs)) continue;
        }
        var gNew = gCur + dirs[i][2];
        if (gScore[k] !== undefined && gNew >= gScore[k]) continue;
        gScore[k] = gNew;
        prev[k] = [x, y];
        hPush(gNew + heur(nx, ny), nx, ny);
      }
    }
    return null;
  }

  /* ---------------- Bản đồ đường mòn xuyên rừng (chương 2) ---------------- */
  // 96 x 74 ô (mốc cứng của Bui: đường/rừng >= 90x70). Sinh xác định bằng hàm
  // thuần: đường đất uốn theo trục bắc-nam, suối + cầu ở hàng 36-37, trạm nghỉ
  // ở hàng 20, bãi phục kích ở hàng 52, quảng trường cổng thành ở cuối nam.
  var ROAD_W = 96, ROAD_H = 74;
  function roadCX(y) { return 48 + Math.round(10 * Math.sin(y / 9)); }
  function hashRoad(x, y) { var n = (x * 374761393 + y * 668265263) | 0; n = (n ^ (n >> 13)) | 0; return ((n * 1274126177) | 0) >>> 0; }
  function buildRoadGrid() {
    var rows = [], x, y;
    for (y = 0; y < ROAD_H; y++) {
      var row = '';
      for (x = 0; x < ROAD_W; x++) {
        var c = (hashRoad(x, y) % 23 === 0) ? ',' : '.';
        if (x === 0 || y === 0 || x === ROAD_W - 1 || y === ROAD_H - 1) c = 'X';
        var cx = roadCX(y);
        if (Math.abs(x - cx) <= 1 && y >= 1 && y <= 67) c = 'D';                 // đường mòn
        if ((y === 36 || y === 37) && Math.abs(x - roadCX(36)) > 1) c = 'W';    // suối (trừ cầu)
        if ((y === 35 || y === 38) && Math.abs(x - cx) > 1 && hashRoad(x, y) % 2 === 0) c = 'w'; // bờ suối
        if (Math.abs(x - roadCX(20)) <= 3 && Math.abs(y - 20) <= 2) c = 'S';    // sân trạm nghỉ
        if (Math.abs(x - roadCX(52)) <= 3 && Math.abs(y - 52) <= 2) c = 'D';    // bãi trống phục kích
        if (y >= 66 && Math.abs(x - 48) <= 9) c = 'S';                          // quảng trường cổng thành
        if (y === 0 && x >= 46 && x <= 49) c = 'G';                             // cổng bắc (về trấn)
        if (y === ROAD_H - 1 && x >= 46 && x <= 49) c = 'G';                    // cổng thành (chưa mở ở chương 2)
        row += c;
      }
      rows.push(row);
    }
    return rows;
  }
  var ROAD_GRID = buildRoadGrid();
  var ROAD_PROPS = (function () {
    var props = [
      { id: 'tram_nghi', type: 'stall', x: roadCX(20) + 1, y: 18, w: 4, h: 2, fx: 4, fy: 1, name: 'Trạm nghỉ giữa đường', interact: true },
      /* Bãi nấm ven đường của hệ đồ ăn (đợt 2026-11-04): bụi cây phía
         tây trạm nghỉ ở (50,15) — ô cỏ trống, không trùng cây rải theo
         hàm băm (đã kiểm propAt), đứng hái từ các ô kề, tới được từ
         sân trạm nghỉ và từ quảng trường cổng thành. */
      { id: 'bai_nam_duong', type: 'bush1', x: 50, y: 15, w: 1, h: 1, fx: 1, fy: 1, name: 'Bãi Nấm Rừng', interact: true },
      { id: 'vet_tich', type: 'sacks', x: roadCX(20) - 3, y: 22, w: 2, h: 2, fx: 2, fy: 1, name: 'Dấu vết bên đường', interact: true }
    ];
    for (var y = 3; y < ROAD_H - 3; y++) for (var x = 3; x < ROAD_W - 3; x++) {
      if (ROAD_GRID[y].charAt(x) !== '.' && ROAD_GRID[y].charAt(x) !== ',') continue;
      if (Math.abs(x - roadCX(y)) <= 3) continue;                              // không mọc lên đường/sân
      if (Math.abs(y - 20) <= 3 && Math.abs(x - roadCX(20)) <= 5) continue;    // giữ trống trạm nghỉ
      if (Math.abs(y - 52) <= 3 && Math.abs(x - roadCX(52)) <= 5) continue;    // giữ trống bãi phục kích
      if (y >= 64) continue;                                                  // giữ trống quảng trường
      var h = hashRoad(x, y);
      if (h % 37 !== 0) continue;
      props.push({ id: 'cay_r' + x + '_' + y, type: h % 2 ? 'tree' : 'pine', x: x, y: y, w: 1, h: 2, fx: 1, fy: 1 });
    }
    // Lớp phủ mặt đất vùng săn đường mòn (chỉ đạo 08:42 ngày 02/11):
    // bụi cỏ/bụi cây/hoa/đá rải trong rừng; giữ trống đường mòn (2 ô mỗi
    // bên), quảng trường nam, bãi phục kích, trạm nghỉ và quanh 3 ổ quái.
    var avoidDecorR = makeAvoid(
      [{ x: 20, y: 20, r: 3 }, { x: 74, y: 58, r: 3 }, { x: 68, y: 14, r: 3 }, { x: roadCX(20) + 2, y: 21, r: 2 }],
      propRects(props).concat([
        { x: 38, y: 48, w: 12, h: 9, pad: 1 },
        { x: roadCX(20) - 6, y: 16, w: 13, h: 9, pad: 1 }
      ]));
    var avoidRoadDecor = function (x, y) {
      if (Math.abs(x - roadCX(y)) <= 2) return true;
      if (y >= 64) return true;
      return avoidDecorR(x, y);
    };
    props = props.concat(scatterGroundDecor(ROAD_GRID, ROAD_W, ROAD_H, 'phu_r', 19, { x0: 2, y0: 2, x1: ROAD_W - 3, y1: 71 }, avoidRoadDecor));
    // Cây điểm nhấn mẫu video (08:48): lớn/vừa/nhỏ + tối đa 2 anh đào.
    props = props.concat(scatterAccentTrees(ROAD_GRID, ROAD_W, ROAD_H, 'cayv_r', { x0: 2, y0: 2, x1: ROAD_W - 3, y1: 71 }, avoidRoadDecor, footTilesOf(props),
      { bigMod: 380, sakuraMod: 800, sakuraMax: 2, midMod: 120, smallMod: 80 }));
    return props;
  })();
  var ROAD_NPCS = [
    { id: 'xa_phu', name: 'Xa phu Lão Mã', look: 'villager_old', x: roadCX(20) + 2, y: 21, dir: 'left' }
  ];


  /* ---------------- Bản đồ phần 2 (chương 3–8) — sinh xác định bằng hàm thuần ---------------- */
  // Cùng mẫu buildRoadGrid: lưới sinh bằng hàm, vật thể theo tọa độ thiết kế
  // (docs/part2-design.md mục 2–3), cây rải bằng hàm băm tránh phố/sân/điểm rơi.
  function blankRows(w, h, fill) {
    var rows = [], x, y;
    for (y = 0; y < h; y++) {
      var row = '';
      for (x = 0; x < w; x++) {
        var c = (x === 0 || y === 0 || x === w - 1 || y === h - 1) ? 'X' : fill;
        if (c === '.' && hashRoad(x + w * 3, y + h * 7) % 23 === 0) c = ',';
        row += c;
      }
      rows.push(row);
    }
    return rows;
  }
  function setC(rows, x, y, c) {
    if (y >= 0 && y < rows.length && x >= 0 && x < rows[y].length) rows[y] = rows[y].substring(0, x) + c + rows[y].substring(x + 1);
  }
  function rectC(rows, x0, y0, x1, y1, c) {
    for (var y = y0; y <= y1; y++) for (var x = x0; x <= x1; x++) setC(rows, x, y, c);
  }
  // Rải cây trên ô cỏ trong một vùng; excl là danh sách [x0,y0,x1,y1] giữ trống.
  function scatterTrees(rows, x0, y0, x1, y1, density, excl, tag) {
    var props = [];
    for (var y = Math.max(3, y0); y <= Math.min(rows.length - 4, y1); y++) {
      for (var x = Math.max(3, x0); x <= Math.min(rows[0].length - 4, x1); x++) {
        var c = rows[y].charAt(x);
        if (c !== '.' && c !== ',') continue;
        var skip = false;
        for (var i = 0; i < excl.length; i++) { var e = excl[i]; if (x >= e[0] && x <= e[2] && y >= e[1] && y <= e[3]) { skip = true; break; } }
        if (skip) continue;
        var hh = hashRoad(x * 3 + 11, y * 5 + 7);
        if (hh % density !== 0) continue;
        props.push({ id: tag + x + '_' + y, type: hh % 2 ? 'tree' : 'pine', x: x, y: y, w: 1, h: 2, fx: 1, fy: 1 });
      }
    }
    return props;
  }

  /* ----- Cô Châu Thành 104 × 78 ----- */
  function buildCityGrid() {
    var rows = blankRows(104, 78, '.');
    rectC(rows, 50, 1, 53, 76, 'D');            // phố chính dọc
    rectC(rows, 1, 20, 102, 21, 'D');          // phố ngang bắc
    rectC(rows, 1, 44, 102, 45, 'D');          // phố ngang nam
    rectC(rows, 54, 4, 99, 5, 'D');            // đường lên cổng đông bắc
    rectC(rows, 42, 68, 61, 76, 'S');          // quảng trường cổng nam
    rectC(rows, 40, 1, 63, 8, 'S');            // quảng trường tháp
    rectC(rows, 64, 24, 86, 41, 'S');          // quảng trường chợ
    rectC(rows, 5, 30, 29, 41, 'S');           // sân phủ Hứa
    rectC(rows, 77, 12, 96, 16, 'S');          // sân Trần gia
    rectC(rows, 90, 6, 99, 10, 'S');           // bãi đáp cổng đông bắc
    for (var gy = 53; gy <= 65; gy++) for (var gx = 5; gx <= 17; gx++) if (hashRoad(gx, gy) % 3 === 0) setC(rows, gx, gy, ','); // vườn tĩnh tâm
    rectC(rows, 50, 77, 53, 77, 'G');          // cổng nam
    rectC(rows, 50, 0, 53, 0, 'G');            // cổng tháp
    rectC(rows, 96, 0, 99, 0, 'G');            // cổng lên tông
    return rows;
  }
  var CITY_GRID = buildCityGrid();
  var CITY_PROPS = [
    { id: 'phu_hua_chinh', type: 'house_big', x: 6, y: 25, w: 8, h: 5, fx: 8, fy: 2, name: 'Hứa Phủ Chính Đường' },
    { id: 'phu_hua_dong', type: 'house_b', x: 18, y: 25, w: 5, h: 3, fx: 5, fy: 1, name: 'Đông Sương Hứa Phủ' },
    { id: 'kho_hua', type: 'house', x: 25, y: 36, w: 4, h: 3, fx: 4, fy: 1, name: 'Kho Hứa Gia', interact: true },
    { id: 'phu_tran', type: 'house_big', x: 80, y: 7, w: 8, h: 5, fx: 8, fy: 2, name: 'Trần Gia Đại Trạch' },
    { id: 'thien_co', type: 'inn', x: 58, y: 62, w: 6, h: 4, fx: 6, fy: 1, name: 'Thiên Cơ Các Phân Đà' },
    { id: 'khach_diem', type: 'inn', x: 67, y: 23, w: 6, h: 4, fx: 6, fy: 1, name: 'Vọng Châu Khách Điếm' },
    { id: 'sap_cho_c1', type: 'stall', x: 72, y: 31, w: 4, h: 2, fx: 4, fy: 1, name: 'Sạp hàng' },
    { id: 'sap_cho_c2', type: 'stall', x: 79, y: 31, w: 4, h: 2, fx: 4, fy: 1, name: 'Sạp hàng' },
    { id: 'sap_cho_c3', type: 'stall', x: 72, y: 37, w: 4, h: 2, fx: 4, fy: 1, name: 'Sạp hàng' },
    { id: 'sap_cho_c4', type: 'stall', x: 80, y: 37, w: 4, h: 2, fx: 4, fy: 1, name: 'Sạp hàng' },
    { id: 'hieu_thuoc', type: 'house', x: 44, y: 47, w: 4, h: 3, fx: 4, fy: 1, name: 'Hồi Xuân Hiệu Thuốc' },
    { id: 'phap_khi', type: 'house_b', x: 56, y: 47, w: 5, h: 3, fx: 5, fy: 1, name: 'Tụ Bảo Pháp Khí Các' },
    { id: 'thap_bia', type: 'stele', x: 48, y: 3, w: 2, h: 2, fx: 2, fy: 1, name: 'Bia Kiểm Trắc' },
    { id: 'den_thap_a', type: 'lantern', x: 46, y: 6, w: 1, h: 2, fx: 1, fy: 1 },
    { id: 'den_thap_b', type: 'lantern', x: 56, y: 6, w: 1, h: 2, fx: 1, fy: 1 },
    { id: 'den_tinh_a', type: 'lantern', x: 10, y: 57, w: 1, h: 2, fx: 1, fy: 1 },
    { id: 'den_tinh_b', type: 'lantern', x: 13, y: 57, w: 1, h: 2, fx: 1, fy: 1 }
  ].concat(scatterTrees(CITY_GRID, 1, 1, 102, 76, 37, [[3, 22, 32, 44], [74, 5, 99, 19], [54, 59, 70, 70], [40, 45, 65, 53], [3, 51, 19, 67]], 'cay_c_'));
  var CITY_NPCS = [
    { id: 'chinh_ngon', name: 'Hứa Chính Ngôn', look: 'chinh_ngon', x: 13, y: 34, dir: 'down' },
    { id: 'anh_phung', name: 'Vương Ánh Phụng', look: 'anh_phung', x: 11, y: 34, dir: 'right' },
    { id: 'u_nhan', name: 'Hứa U Nhàn', look: 'u_nhan', x: 16, y: 35, dir: 'down' },
    { id: 'di_ninh', name: 'Hứa Di Ninh', look: 'di_ninh', x: 19, y: 34, dir: 'left' },
    { id: 'luc_tranh', name: 'Lục Tranh', look: 'luc_tranh', x: 23, y: 35, dir: 'down' },
    { id: 'tran_tu_linh', name: 'Trần Tư Linh', look: 'di_ninh', x: 86, y: 14, dir: 'down' },
    { id: 'tran_chinh_dao', name: 'Trần Chính Đạo', look: 'elder', x: 56, y: 66, dir: 'down' },
    { id: 'chu_quan', name: 'Chủ Quán Lão Chu', look: 'villager_old', x: 69, y: 28, dir: 'down' },
    { id: 'cho_a', name: 'Hàng Rong A Phúc', look: 'villager_m', x: 75, y: 34, dir: 'right' },
    { id: 'cho_b', name: 'Hàng Rong Xuân Nương', look: 'villager_f', x: 83, y: 34, dir: 'left' },
    { id: 'duoc_su', name: 'Dược Sư Tôn Nương', look: 'villager_f', x: 45, y: 51, dir: 'down' },
    { id: 'phap_khi_chu', name: 'Chủ Các Tụ Bảo', look: 'villager_m', x: 58, y: 51, dir: 'down' },
    { id: 'dan_thanh_a', name: 'Dân Thành Lão Ngô', look: 'villager_m', x: 49, y: 28, dir: 'down' },
    { id: 'dan_thanh_b', name: 'Dân Thành A Đào', look: 'villager_f', x: 60, y: 50, dir: 'left' }
  ];

  /* ----- Khuôn viên Kiểm Trắc Tháp 72 × 56 ----- */
  function buildTowerYardGrid() {
    var rows = blankRows(72, 56, '.');
    rectC(rows, 14, 14, 57, 50, 'S');          // sân chờ
    rectC(rows, 27, 5, 44, 12, 'P');           // đài thước
    rectC(rows, 34, 13, 37, 54, 'D');          // đường trục
    rectC(rows, 24, 24, 47, 24, 'P');          // hàng chờ
    rectC(rows, 24, 28, 47, 28, 'P');
    rectC(rows, 24, 32, 47, 32, 'P');
    rectC(rows, 34, 55, 37, 55, 'G');          // cổng nam
    rectC(rows, 34, 0, 37, 0, 'G');            // cửa sảnh
    return rows;
  }
  var TOWER_GRID = buildTowerYardGrid();
  var TOWER_PROPS = [
    { id: 'thuoc_san', type: 'thuoc', x: 34, y: 4, w: 4, h: 4, fx: 4, fy: 2, name: 'Thước Pha Lê' },
    { id: 'den_dai_a', type: 'lantern', x: 28, y: 7, w: 1, h: 2, fx: 1, fy: 1 },
    { id: 'den_dai_b', type: 'lantern', x: 43, y: 7, w: 1, h: 2, fx: 1, fy: 1 }
  ].concat(scatterTrees(TOWER_GRID, 1, 1, 70, 54, 37, [[2, 42, 14, 54]], 'cay_t_'));
  var TOWER_NPCS = [
    { id: 'thap_chu', name: 'Chủ Trì Kiểm Trắc Tháp', look: 'elder', x: 38, y: 13, dir: 'down' },
    { id: 'luc_tranh', name: 'Lục Tranh', look: 'luc_tranh', x: 33, y: 25, dir: 'down' },
    { id: 'thi_sinh_a', name: 'Thí Sinh Vương Hổ', look: 'villager_m', x: 39, y: 27, dir: 'left' },
    { id: 'thi_sinh_b', name: 'Thí Sinh Lý Anh', look: 'villager_f', x: 30, y: 31, dir: 'right' }
  ];

  /* ----- Nội thất tháp 40 × 30 ----- */
  function buildTowerHallGrid() {
    var rows = blankRows(40, 30, 'S');
    rectC(rows, 16, 8, 23, 28, 'P');           // lối đứng kiểm trắc
    rectC(rows, 18, 29, 21, 29, 'G');          // cửa nam
    return rows;
  }
  var HALL_GRID = buildTowerHallGrid();
  var HALL_PROPS = [
    { id: 'thuoc_lon', type: 'thuoc', x: 18, y: 2, w: 4, h: 5, fx: 4, fy: 2, name: 'Thước Pha Lê Lớn', interact: true },
    { id: 'bia_thap_a', type: 'stele', x: 7, y: 7, w: 2, h: 2, fx: 2, fy: 1, name: 'Bia Khắc Phẩm Cấp' },
    { id: 'bia_thap_b', type: 'stele', x: 30, y: 7, w: 2, h: 2, fx: 2, fy: 1, name: 'Bia Khắc Phẩm Cấp' },
    { id: 'den_noi_a', type: 'lantern', x: 6, y: 4, w: 1, h: 2, fx: 1, fy: 1 },
    { id: 'den_noi_b', type: 'lantern', x: 32, y: 4, w: 1, h: 2, fx: 1, fy: 1 },
    { id: 'den_noi_c', type: 'lantern', x: 6, y: 24, w: 1, h: 2, fx: 1, fy: 1 },
    { id: 'den_noi_d', type: 'lantern', x: 32, y: 24, w: 1, h: 2, fx: 1, fy: 1 }
  ];
  var HALL_NPCS = [
    { id: 'thap_chu', name: 'Chủ Trì Kiểm Trắc Tháp', look: 'elder', x: 23, y: 9, dir: 'left' },
    { id: 'luc_tranh', name: 'Lục Tranh', look: 'luc_tranh', x: 15, y: 12, dir: 'right' }
  ];

  /* ----- Thanh Vân Tông 124 × 92 ----- */
  function buildSectGrid() {
    var rows = blankRows(124, 92, '.');
    rectC(rows, 46, 79, 77, 90, 'S');          // quảng trường sơn môn
    rectC(rows, 60, 12, 63, 78, 'D');          // trục chính
    rectC(rows, 1, 44, 122, 45, 'D');          // phố ngang giữa
    rectC(rows, 30, 72, 112, 73, 'D');         // đường tạp dịch
    rectC(rows, 42, 52, 81, 71, 'S');          // quảng trường tông
    rectC(rows, 56, 58, 67, 65, 'P');          // tâm quảng trường
    rectC(rows, 30, 53, 46, 62, 'S');          // sân luyện công
    rectC(rows, 88, 66, 112, 82, 'S');         // sân tạp dịch
    rectC(rows, 6, 5, 24, 15, 'P');            // đài Thăng Long
    rectC(rows, 51, 3, 72, 11, 'P');           // đài Trúc Cơ
    for (var i = 0; i <= 34; i++) {            // bậc Thăng Long Đạo (dải chéo)
      var cx = 26 - Math.round(i * 0.55), cy = 50 - i;
      rectC(rows, cx - 1, cy, cx + 1, cy, 'S');
    }
    rectC(rows, 24, 46, 28, 51, 'D');          // đường nối phố ngang lên chân bậc
    rectC(rows, 72, 8, 99, 9, 'D');            // đường ra rừng sau núi
    rectC(rows, 96, 12, 106, 18, 'D');         // bãi trống trong rừng
    rectC(rows, 59, 91, 64, 91, 'G');          // sơn môn
    return rows;
  }
  var SECT_GRID = buildSectGrid();
  var SECT_PROPS = [
    { id: 'dai_dien', type: 'house_big', x: 56, y: 19, w: 8, h: 5, fx: 8, fy: 2, name: 'Thanh Vân Đại Điện' },
    { id: 'de_tu_a_xa', type: 'house', x: 32, y: 32, w: 4, h: 3, fx: 4, fy: 1, name: 'Đệ Tử Xá' },
    { id: 'de_tu_b_xa', type: 'house_b', x: 40, y: 30, w: 5, h: 3, fx: 5, fy: 1, name: 'Đệ Tử Xá' },
    { id: 'de_tu_c_xa', type: 'house_c', x: 70, y: 32, w: 4, h: 3, fx: 4, fy: 1, name: 'Đệ Tử Xá' },
    { id: 'de_tu_d_xa', type: 'house', x: 76, y: 38, w: 4, h: 3, fx: 4, fy: 1, name: 'Đệ Tử Xá' },
    { id: 'coc_tong_1', type: 'dummy', x: 33, y: 55, w: 1, h: 2, fx: 1, fy: 1, name: 'Cọc gỗ luyện công' },
    { id: 'coc_tong_2', type: 'dummy', x: 38, y: 55, w: 1, h: 2, fx: 1, fy: 1, name: 'Cọc gỗ luyện công' },
    { id: 'coc_tong_3', type: 'dummy', x: 43, y: 55, w: 1, h: 2, fx: 1, fy: 1, name: 'Cọc gỗ luyện công' },
    { id: 'thang_long_dai', type: 'stele', x: 14, y: 7, w: 2, h: 2, fx: 2, fy: 1, name: 'Đài Thăng Long', interact: true },
    { id: 'dai_truc_co', type: 'stele', x: 60, y: 4, w: 2, h: 2, fx: 2, fy: 1, name: 'Đài Trúc Cơ', interact: true },
    { id: 'den_dai_tc_a', type: 'lantern', x: 53, y: 5, w: 1, h: 2, fx: 1, fy: 1 },
    { id: 'den_dai_tc_b', type: 'lantern', x: 69, y: 5, w: 1, h: 2, fx: 1, fy: 1 },
    { id: 'linh_chi', type: 'sacks', x: 100, y: 13, w: 2, h: 2, fx: 2, fy: 1, name: 'Cụm Linh Chi Sau Núi', interact: true },
    { id: 'tap_dich_a', type: 'house', x: 90, y: 60, w: 4, h: 3, fx: 4, fy: 1, name: 'Nhà Tạp Dịch' },
    { id: 'tap_dich_b', type: 'house_b', x: 102, y: 60, w: 5, h: 3, fx: 5, fy: 1, name: 'Nhà Tạp Dịch' },
    { id: 'viec_go', type: 'woodpile', x: 95, y: 70, w: 2, h: 2, fx: 2, fy: 1, name: 'Đống Củi Cần Bổ', interact: true },
    { id: 'viec_nuoc', type: 'well', x: 104, y: 68, w: 2, h: 2, fx: 2, fy: 1, name: 'Giếng Nước Sau Bếp', interact: true },
    { id: 'viec_bao', type: 'sacks', x: 90, y: 76, w: 2, h: 2, fx: 2, fy: 1, name: 'Bao Gạo Cần Chuyển', interact: true }
  ].concat(scatterTrees(SECT_GRID, 1, 1, 122, 90, 37, [[4, 3, 28, 52], [49, 1, 74, 13], [84, 58, 116, 84], [28, 28, 84, 51], [82, 1, 121, 32]], 'cay_s_')
  ).concat(scatterTrees(SECT_GRID, 84, 3, 119, 30, 6, [], 'cay_r_'));
  var SECT_NPCS = [
    { id: 'truong_lao_tong', name: 'Trưởng Lão Thanh Vân Tông', look: 'elder', x: 60, y: 26, dir: 'down' },
    { id: 'lieu_khuynh_tien', name: 'Liễu Khuynh Tiên', look: 'di_ninh', x: 17, y: 11, dir: 'down' },
    { id: 'tap_dich_truong', name: 'Quản Sự Tạp Dịch', look: 'villager_old', x: 97, y: 68, dir: 'down' },
    { id: 'de_tu_a', name: 'Đệ Tử Trần Văn', look: 'villager_m', x: 57, y: 62, dir: 'right' },
    { id: 'de_tu_b', name: 'Đệ Tử Triệu Minh', look: 'player_nam', x: 67, y: 60, dir: 'left' },
    { id: 'hoa_huong_than', name: 'Hoa Hướng Thần', look: 'player_nam', x: 62, y: 55, dir: 'down' },
    { id: 'tin_su', name: 'Người Đưa Tin Hứa Gia', look: 'villager_m', x: 64, y: 29, dir: 'left' }
  ];

  /* ---------------- Bản đồ phần 2 (docs/part2-design.md mục 2) ---------------- */
  // Sinh lưới xác định bằng hàm thuần như buildRoadGrid(): nền cỏ/cỏ hoa theo
  // băm, rồi tô trục đường/quảng trường/sân theo tọa độ chốt; vật thể, NPC,
  // biển, cổng là dữ liệu khai báo. Cây rải bằng băm trên ô cỏ trống, tránh
  // phố/quảng trường/sân, vùng quanh điểm rơi, điểm thổ nạp, NPC và vật thể.
  function blankGrid(w, h) {
    var g = [], x, y;
    for (y = 0; y < h; y++) {
      var row = [];
      for (x = 0; x < w; x++) {
        var c = (hashRoad(x, y) % 23 === 0) ? ',' : '.';
        if (x === 0 || y === 0 || x === w - 1 || y === h - 1) c = 'X';
        row.push(c);
      }
      g.push(row);
    }
    return g;
  }
  function rectCh(g, x0, y0, x1, y1, ch) {
    for (var y = y0; y <= y1; y++) for (var x = x0; x <= x1; x++) if (g[y] && x >= 0 && x < g[y].length) g[y][x] = ch;
  }
  function gridStrings(g) { return g.map(function (r) { return r.join(''); }); }
  // Vùng tránh khi rải cây: điểm kèm bán kính Chebyshev + hình chữ nhật kèm đệm.
  function makeAvoid(points, rects) {
    return function (x, y) {
      var i;
      for (i = 0; i < points.length; i++) {
        if (Math.max(Math.abs(x - points[i].x), Math.abs(y - points[i].y)) <= points[i].r) return true;
      }
      for (i = 0; i < rects.length; i++) {
        var R = rects[i], pad = R.pad || 0;
        if (x >= R.x - pad && x < R.x + R.w + pad && y >= R.y - pad && y < R.y + R.h + pad) return true;
      }
      return false;
    };
  }
  // Rải cây: ô ngọn và ô chân đều phải là cỏ trống và ngoài vùng tránh.
  // forestRect (nếu có): vùng rừng dày dùng mật độ riêng (mod nhỏ hơn).
  function scatterTrees(grid, w, h, prefix, normalMod, forestRect, forestMod, avoid) {
    var props = [];
    for (var y = 2; y < h - 2; y++) for (var x = 2; x < w - 2; x++) {
      var top = grid[y].charAt(x), foot = grid[y + 1].charAt(x);
      if ((top !== '.' && top !== ',') || (foot !== '.' && foot !== ',')) continue;
      if (avoid && (avoid(x, y) || avoid(x, y + 1))) continue;
      var inForest = forestRect && x >= forestRect.x0 && x <= forestRect.x1 && y >= forestRect.y0 && y <= forestRect.y1;
      var hh = hashRoad(x, y);
      if (hh % (inForest ? forestMod : normalMod) !== 0) continue;
      props.push({ id: prefix + x + '_' + y, type: hh % 2 ? 'tree' : 'pine', x: x, y: y, w: 1, h: 2, fx: 1, fy: 1 });
    }
    return props;
  }
  // Rải lớp phủ mặt đất cho vùng săn (chỉ đạo Bui 08:42 ngày 02/11 theo
  // video Nhân Du Giang Hồ): bụi cỏ, bụi cây, hoa và đá nhỏ cỡ 1x1 nằm
  // rải xác định theo hàm băm trên ô cỏ trong vùng, tôn trọng vùng tránh
  // (ổ quái, điểm thổ nạp, cổng, điểm truyện, đường đi) để đồng cỏ sống
  // động mà quái và người chơi vẫn cơ động thoải mái. Mảng loại khai báo
  // ngay trong thân hàm vì các builder bản đồ chạy trước điểm này.
  function scatterGroundDecor(grid, w, h, prefix, mod, region, avoid) {
    var types = ['grass_clump', 'grass_clump', 'grass_clump', 'bush1', 'bush2', 'flower_bush', 'rock_s', 'grass_clump'];
    var props = [];
    for (var y = 2; y < h - 2; y++) for (var x = 2; x < w - 2; x++) {
      if (region && (x < region.x0 || x > region.x1 || y < region.y0 || y > region.y1)) continue;
      var c = grid[y].charAt(x);
      if (c !== '.' && c !== ',') continue;
      if (avoid && avoid(x, y)) continue;
      var hh = hashRoad(x * 7 + 31, y * 3 + 17);
      if (hh % mod !== 0) continue;
      // Loại vật thể chọn bằng hàm băm RIÊNG lấy BIT CAO: bit thấp của
      // hashRoad tương quan mạnh với cổng mật độ (đo thực tế: 344/346 vật
      // rơi vào cùng một loại), bit cao phân bố đều.
      var ht = hashRoad(x * 13 + 7, y * 11 + 3) >>> 16;
      props.push({ id: prefix + x + '_' + y, type: types[ht % types.length], x: x, y: y, w: 1, h: 1, fx: 1, fy: 1 });
    }
    return props;
  }
  // Tập ô chân đế đã có vật (khớp propAt) — cây điểm nhấn không trồng
  // chồng lên vật khác.
  function footTilesOf(props) {
    var set = {};
    props.forEach(function (p) {
      var fy = p.y + p.h - p.fy;
      for (var yy = fy; yy < fy + p.fy; yy++) for (var xx = p.x; xx < p.x + p.fx; xx++) set[xx + ',' + yy] = true;
    });
    return set;
  }
  // Rải cây điểm nhấn mẫu video (chỉ đạo Bui 08:48 ngày 02/11): cây lớn
  // tán tròn nhiều thùy và anh đào lớn (chân đế 2 ô), cây vừa/nhỏ (chân
  // đế 1 ô) — đặt xác định theo hàm băm trên ô cỏ trống, tôn trọng vùng
  // tránh (ổ quái/cổng/đường/điểm truyện) truyền vào.
  function scatterAccentTrees(grid, w, h, prefix, region, avoid, occupied, cfg) {
    var props = [], sakura = 0;
    function grassFree(x, y) {
      if (x < 2 || y < 2 || x >= w - 2 || y >= h - 2) return false;
      if (region && (x < region.x0 || x > region.x1 || y < region.y0 || y > region.y1)) return false;
      var c = grid[y].charAt(x);
      if (c !== '.' && c !== ',') return false;
      if (occupied[x + ',' + y]) return false;
      if (avoid && avoid(x, y)) return false;
      return true;
    }
    for (var y = 2; y < h - 3; y++) for (var x = 2; x < w - 3; x++) {
      var hh = hashRoad(x * 19 + 5, y * 23 + 11) >>> 16;
      var kind = null, pw = 1, ph = 2;
      if (hh % cfg.bigMod === 0) { kind = 'tree_big'; pw = 2; ph = 3; }
      else if (cfg.sakuraMax > 0 && hh % cfg.sakuraMod === 0 && sakura < cfg.sakuraMax) { kind = 'sakura_big'; pw = 2; ph = 3; }
      else if (hh % cfg.midMod === 0) kind = 'tree_mid';
      else if (hh % cfg.smallMod === 0) kind = 'tree_small';
      if (!kind) continue;
      var okA = true;
      for (var fxi = 0; fxi < pw; fxi++) if (!grassFree(x + fxi, y + ph - 1)) { okA = false; break; }
      if (!okA) continue;
      if (pw === 2 && !grassFree(x + 1, y + ph - 2)) continue; // ô thân trên của cây lớn cũng phải là cỏ trống
      props.push({ id: prefix + kind + '_' + x + '_' + y, type: kind, x: x, y: y, w: pw, h: ph, fx: pw, fy: 1 });
      if (kind === 'sakura_big') sakura++;
      for (var fxj = 0; fxj < pw; fxj++) occupied[(x + fxj) + ',' + (y + ph - 1)] = true;
    }
    return props;
  }
  function propRects(props) { return props.map(function (p) { return { x: p.x, y: p.y, w: p.w, h: p.h, pad: 1 }; }); }
  // Vùng chân đế THẬT của vật thể (khớp propAt) — dùng khi vùng tránh
  // không được phình ra (rừng tông dày: đệm 1 ô quanh mỗi cây sẽ khóa
  // gần hết mặt đất, lớp phủ không còn chỗ mọc).
  function footRects(props) { return props.map(function (p) { return { x: p.x, y: p.y + p.h - p.fy, w: p.fx, h: p.fy, pad: 0 }; }); }
  function npcPoints(npcs) { return npcs.map(function (n) { return { x: n.x, y: n.y, r: 2 }; }); }
  function signPoints(signs) { return (signs || []).map(function (s) { return { x: s.x, y: s.y, r: 1 }; }); }

  /* ---- Cô Châu Thành 104x78 ---- */
  var CITY_W = 104, CITY_H = 78;
  function buildCityGrid() {
    var g = blankGrid(CITY_W, CITY_H);
    rectCh(g, 50, 1, 53, 76, 'D');          // phố dọc
    rectCh(g, 1, 20, 102, 21, 'D');         // phố ngang bắc
    rectCh(g, 1, 44, 102, 45, 'D');         // phố ngang nam
    rectCh(g, 54, 4, 99, 5, 'D');           // đường đông bắc (lên tông)
    rectCh(g, 42, 68, 61, 76, 'S');         // quảng trường cổng nam
    rectCh(g, 40, 1, 63, 8, 'S');           // quảng trường tháp
    rectCh(g, 64, 24, 86, 41, 'S');         // quảng trường chợ
    rectCh(g, 5, 30, 29, 41, 'S');          // sân phủ Hứa
    rectCh(g, 77, 12, 96, 16, 'S');         // sân Trần gia
    rectCh(g, 90, 6, 99, 10, 'S');          // bãi đáp đông bắc (điểm rơi từ tông)
    rectCh(g, 50, 77, 53, 77, 'G');         // cổng nam (về đường mòn)
    rectCh(g, 48, 0, 55, 0, 'G');           // cổng tháp (bắc): mở rộng 8 ô khớp dải cổng dữ liệu — khe qua thật nằm giữa biển tháp (48,7) và bia (48,3), người chơi đi lệch trục theo các mốc thị giác vẫn bước lên được hàng 0
    rectCh(g, 96, 0, 99, 0, 'G');           // đường lên tông (đông bắc)
    rectCh(g, 95, 1, 100, 3, 'S');          // sân đá cổng lên tông (gói phụ 9): dải cổng vô hình trước đây — nay lát đá từ đường ngang hàng 4 lên tận miệng cổng hàng 0, khớp dải kích hoạt x95–100 hàng 0–3
    return gridStrings(g);
  }
  var CITY_GRID = buildCityGrid();
  var CITY_SIGNS = [
    { x: 48, y: 73, text: 'Cô Châu Thành' }, { x: 8, y: 31, text: 'Phủ Hứa Gia' },
    { x: 84, y: 13, text: 'Trần Gia' }, { x: 48, y: 7, text: 'Kiểm Trắc Tháp' },
    { x: 74, y: 29, text: 'Chợ Cô Châu' }, { x: 57, y: 61, text: 'Thiên Cơ Các' },
    { x: 98, y: 4, text: 'Thanh Vân Tông' }
  ];
  var CITY_NPCS = [
    { id: 'chinh_ngon', name: 'Hứa Chính Ngôn', look: 'chinh_ngon', x: 13, y: 34, dir: 'down' },
    { id: 'anh_phung', name: 'Vương Ánh Phụng', look: 'anh_phung', x: 11, y: 34, dir: 'right' },
    { id: 'u_nhan', name: 'Hứa U Nhàn', look: 'u_nhan', x: 16, y: 35, dir: 'down' },
    { id: 'di_ninh', name: 'Hứa Di Ninh', look: 'di_ninh', x: 19, y: 34, dir: 'left' },
    { id: 'luc_tranh', name: 'Lục Tranh', look: 'luc_tranh', x: 23, y: 35, dir: 'down' },
    { id: 'chu_kien_tham', name: 'Chu Kiến Thâm', look: 'player_nam', x: 21, y: 37, dir: 'left' },
    { id: 'tran_tu_linh', name: 'Trần Tư Linh', look: 'di_ninh', x: 86, y: 14, dir: 'down' },
    { id: 'tran_chinh_dao', name: 'Trần Chính Đạo', look: 'elder', x: 56, y: 66, dir: 'down' },
    { id: 'chu_quan', name: 'Chủ Quán Vọng Châu', look: 'villager_old', x: 69, y: 28, dir: 'down' },
    { id: 'cho_a', name: 'Chủ sạp chợ', look: 'villager_m', x: 75, y: 34, dir: 'right' },
    { id: 'cho_b', name: 'Chủ sạp chợ', look: 'villager_f', x: 83, y: 34, dir: 'left' },
    { id: 'duoc_su', name: 'Dược Sư Hồi Xuân', look: 'villager_f', x: 45, y: 51, dir: 'down' },
    { id: 'phap_khi_chu', name: 'Chủ Tụ Bảo Các', look: 'villager_m', x: 58, y: 51, dir: 'down' },
    { id: 'dan_thanh_a', name: 'Dân thành', look: 'villager_m', x: 49, y: 28, dir: 'down' },
    { id: 'dan_thanh_b', name: 'Dân thành', look: 'villager_f', x: 60, y: 50, dir: 'left' },
    { id: 'gia_nhan', name: 'Gia Nhân Hứa Gia', look: 'villager_m', x: 18, y: 38, dir: 'down' }
  ];
  var CITY_PROPS = (function () {
    var props = [
      { id: 'phu_hua_chinh', type: 'house_big', x: 6, y: 25, w: 8, h: 5, fx: 8, fy: 2, name: 'Hứa Phủ Chính Đường' },
      { id: 'phu_hua_dong', type: 'house_b', x: 18, y: 25, w: 5, h: 3, fx: 5, fy: 1, name: 'Đông Sương Hứa Phủ' },
      { id: 'kho_hua', type: 'house', x: 25, y: 36, w: 4, h: 3, fx: 4, fy: 1, name: 'Kho Hứa Gia', interact: true },
      /* Bộ bàn trà sân phủ Hứa (gói phụ 5): lời dẫn chương 4 viết "chén
         trà trên bàn" (SCENE_CHAN_QUELL) và Lục Tranh mời "vào trong
         uống chén trà" (SCENE_THIENCO) nhưng sân chưa từng có bàn — bày
         hai bàn đá liền nhau ở phía bắc hàng đứng của gia đình (hàng 34),
         trên sân đá hàng 32, không đè ô NPC/cổng/vùng kích hoạt cảnh. */
      { id: 'ban_tra_phu_a', type: 'table_stone', x: 18, y: 32, w: 1, h: 1, fx: 1, fy: 1, name: 'Bàn trà sân phủ' },
      { id: 'ban_tra_phu_b', type: 'table_stone', x: 19, y: 32, w: 1, h: 1, fx: 1, fy: 1, name: 'Bàn trà sân phủ' },
      { id: 'don_tra_phu_a', type: 'tea_stool', x: 18, y: 33, w: 1, h: 1, fx: 1, fy: 1, name: 'Đôn đá bàn trà' },
      { id: 'don_tra_phu_b', type: 'tea_stool', x: 19, y: 33, w: 1, h: 1, fx: 1, fy: 1, name: 'Đôn đá bàn trà' },
      { id: 'phu_tran', type: 'house_big', x: 80, y: 7, w: 8, h: 5, fx: 8, fy: 2, name: 'Trần Gia Đại Trạch' },
      { id: 'thien_co', type: 'inn', x: 58, y: 62, w: 6, h: 4, fx: 6, fy: 1, name: 'Thiên Cơ Các Phân Đà' },
      { id: 'khach_diem', type: 'inn', x: 67, y: 23, w: 6, h: 4, fx: 6, fy: 1, name: 'Vọng Châu Khách Điếm' },
      { id: 'sap_cho_c1', type: 'stall', x: 72, y: 31, w: 4, h: 2, fx: 4, fy: 1, name: 'Sạp hàng' },
      { id: 'sap_cho_c2', type: 'stall', x: 79, y: 31, w: 4, h: 2, fx: 4, fy: 1, name: 'Sạp hàng' },
      { id: 'sap_cho_c3', type: 'stall', x: 72, y: 37, w: 4, h: 2, fx: 4, fy: 1, name: 'Sạp hàng' },
      { id: 'sap_cho_c4', type: 'stall', x: 80, y: 37, w: 4, h: 2, fx: 4, fy: 1, name: 'Sạp hàng' },
      { id: 'hieu_thuoc', type: 'house', x: 44, y: 47, w: 4, h: 3, fx: 4, fy: 1, name: 'Hồi Xuân Hiệu Thuốc' },
      { id: 'phap_khi', type: 'house_b', x: 56, y: 47, w: 5, h: 3, fx: 5, fy: 1, name: 'Tụ Bảo Pháp Khí Các' },
      { id: 'thap_bia', type: 'stele', x: 48, y: 3, w: 2, h: 2, fx: 2, fy: 1, name: 'Bia Kiểm Trắc' },
      { id: 'den_thap_a', type: 'lantern', x: 46, y: 6, w: 1, h: 2, fx: 1, fy: 1 },
      { id: 'den_thap_b', type: 'lantern', x: 56, y: 6, w: 1, h: 2, fx: 1, fy: 1 },
      /* Cổng lên Thanh Vân Tông (gói phụ 9 — Bui báo "không có cổng"):
         bộ dấu hiệu theo đúng khuôn cổng tháp (bia + đèn đá hai bên +
         biển trong danh sách biển + sân đá trong buildCityGrid). Mọi
         footprint nằm NGOÀI dải cổng x95–100 hàng 0–3 và ngoài trục
         tiếp cận cột 97–98: bia ở sườn tây (92,1), hai đèn đá ôm hai
         sườn miệng sân (94,2) và (101,2). */
      { id: 'bia_tong', type: 'stele', x: 92, y: 1, w: 2, h: 2, fx: 2, fy: 1, name: 'Bia Đường Lên Tông' },
      { id: 'den_tong_a', type: 'lantern', x: 94, y: 2, w: 1, h: 2, fx: 1, fy: 1 },
      { id: 'den_tong_b', type: 'lantern', x: 101, y: 2, w: 1, h: 2, fx: 1, fy: 1 },
      { id: 'den_tinh_a', type: 'lantern', x: 10, y: 57, w: 1, h: 2, fx: 1, fy: 1 },
      { id: 'den_tinh_b', type: 'lantern', x: 13, y: 57, w: 1, h: 2, fx: 1, fy: 1 }
    ];
    /* ---- Đợt làm lại Cô Châu Thành (04/11): trang viên Hứa Gia quây
       tứ hợp viện + vật thể trang trí các khu. Mọi vật thể dưới đây đều
       là lớp trình diễn: footprint khai thật theo quy ước chung; cổng
       trang viên chỉ là khoảng mở trong tuyến tường (KHÔNG phải cổng
       chuyển bản đồ, không đổi portal nào). Cổng phụ phía đông để mở
       đúng hàng 33–34: đó là đường ba đợt đánh đêm chương 5 xông vào
       sân (điểm xuất hiện (29,31)/(30,34)/(29,35) và các điểm đứng
       đích đều đã kiểm BFS — xem docs/co-chau-scenery-report.md). */
    var extra = [];
    function huaWall(x, y) {
      var t = ((x * 7 + y * 13) % 5 === 0) ? 'hua_wall_b' : 'hua_wall';
      extra.push({ id: 'hua_tuong_' + x + '_' + y, type: t, x: x, y: y, w: 1, h: 1, fx: 1, fy: 1 });
    }
    function huaWallV(x, y) {
      // tuyến dọc dùng mặt vôi liền (hua_wall_v): đoạn xếp chồng theo
      // chiều sâu chỉ lộ phần trên, giữ dải ngói sẽ thành cột sọc
      extra.push({ id: 'hua_tuong_' + x + '_' + y, type: 'hua_wall_v', x: x, y: y, w: 1, h: 1, fx: 1, fy: 1 });
    }
    var wx, wy;
    for (wx = 5; wx <= 29; wx++) huaWall(wx, 23);        // tường bắc, sau dãy nhà chính
    for (wy = 24; wy <= 40; wy++) huaWallV(4, wy);       // tường tây
    for (wy = 24; wy <= 32; wy++) huaWallV(30, wy);      // tường đông, đoạn bắc
    for (wy = 35; wy <= 40; wy++) huaWallV(30, wy);      // tường đông, đoạn nam (giữa là cổng phụ)
    for (wx = 5; wx <= 15; wx++) huaWall(wx, 41);        // tường nam, đoạn tây
    for (wx = 20; wx <= 29; wx++) huaWall(wx, 41);       // tường nam, đoạn đông
    extra.push(
      /* Bốn trụ góc trang viên (footprint = đúng ô góc). */
      { id: 'hua_tru_tb', type: 'hua_pillar', x: 4, y: 22, w: 1, h: 2, fx: 1, fy: 1 },
      { id: 'hua_tru_db', type: 'hua_pillar', x: 30, y: 22, w: 1, h: 2, fx: 1, fy: 1 },
      { id: 'hua_tru_tn', type: 'hua_pillar', x: 4, y: 40, w: 1, h: 2, fx: 1, fy: 1 },
      { id: 'hua_tru_dn', type: 'hua_pillar', x: 30, y: 40, w: 1, h: 2, fx: 1, fy: 1 },
      /* Cổng chính phía nam: hai trụ chặn hai bên, môn lâu phủ qua với
         fx: 0 (không chặn — người đi dưới mái như xà cổng sơn môn);
         lối qua là hai ô (17,41) và (18,41) khớp lối vào hiện hữu. */
      { id: 'hua_tru_cong_a', type: 'hua_pillar', x: 16, y: 40, w: 1, h: 2, fx: 1, fy: 1 },
      { id: 'hua_tru_cong_b', type: 'hua_pillar', x: 19, y: 40, w: 1, h: 2, fx: 1, fy: 1 },
      { id: 'hua_mon_lau', type: 'hua_gate', x: 16, y: 39, w: 4, h: 3, fx: 0, fy: 1, name: 'Cổng Hứa Phủ' },
      /* Chiếu bích ngay trong cổng: chặn trục giữa, vào sân vòng hai bên. */
      { id: 'hua_chieu_bich', type: 'hua_screen', x: 16, y: 40, w: 3, h: 1, fx: 3, fy: 1, name: 'Chiếu Bích Hứa Phủ' },
      /* Xà cổng phụ phía đông (fx: 0 — không chặn lối qua hàng 33–34). */
      { id: 'hua_xa_cong_phu', type: 'hua_beam', x: 29, y: 31, w: 3, h: 2, fx: 0, fy: 1 },
      /* Sương phòng tây và bắc-đông (nhà chính + đông sương đã có sẵn). */
      { id: 'phu_hua_tay', type: 'house_b', x: 5, y: 32, w: 5, h: 3, fx: 5, fy: 1, name: 'Tây Sương Hứa Phủ' },
      { id: 'phu_hua_bac_dong', type: 'house', x: 24, y: 25, w: 4, h: 3, fx: 4, fy: 1, name: 'Bắc Sương Hứa Phủ' },
      /* Cây cổ thụ góc tây-bắc sân, hồ sen + ghế đá + bụi hoa góc tây-nam. */
      { id: 'hua_cay_co', type: 'tree_big', x: 6, y: 29, w: 2, h: 3, fx: 2, fy: 1 },
      { id: 'hua_ho', type: 'hua_pond', x: 6, y: 37, w: 3, h: 2, fx: 3, fy: 1, name: 'Hồ Sen Nhỏ' },
      { id: 'hua_ghe_da', type: 'bench_stone', x: 10, y: 38, w: 2, h: 1, fx: 2, fy: 1 },
      { id: 'hua_hoa_a', type: 'flower_bush', x: 10, y: 36, w: 1, h: 1, fx: 1, fy: 1 },
      { id: 'hua_den_a', type: 'lantern', x: 14, y: 30, w: 1, h: 2, fx: 1, fy: 1 },
      { id: 'hua_den_b', type: 'lantern', x: 27, y: 38, w: 1, h: 2, fx: 1, fy: 1 },
      /* Đèn đá ngoài cổng chính, hai bên lối vào từ phố nam. */
      { id: 'hua_den_cong_a', type: 'lantern', x: 15, y: 42, w: 1, h: 2, fx: 1, fy: 1 },
      { id: 'hua_den_cong_b', type: 'lantern', x: 20, y: 42, w: 1, h: 2, fx: 1, fy: 1 },
      /* --- Trang trí các khu còn lại (loại vật thể sẵn có) --- */
      /* Chợ: bốn đèn đá ở bốn góc quảng trường + bao/chum/rổ cạnh sạp + đống củi sau khách điếm. */
      { id: 'cho_den_a', type: 'lantern', x: 65, y: 25, w: 1, h: 2, fx: 1, fy: 1 },
      { id: 'cho_den_b', type: 'lantern', x: 85, y: 25, w: 1, h: 2, fx: 1, fy: 1 },
      { id: 'cho_den_c', type: 'lantern', x: 65, y: 39, w: 1, h: 2, fx: 1, fy: 1 },
      { id: 'cho_den_d', type: 'lantern', x: 85, y: 39, w: 1, h: 2, fx: 1, fy: 1 },
      { id: 'cho_bao', type: 'sacks', x: 71, y: 33, w: 2, h: 2, fx: 2, fy: 1 },
      { id: 'cho_chum', type: 'jar_big', x: 85, y: 33, w: 1, h: 1, fx: 1, fy: 1 },
      { id: 'cho_ro', type: 'basket', x: 77, y: 36, w: 1, h: 1, fx: 1, fy: 1 },
      { id: 'cho_cui', type: 'woodpile', x: 74, y: 27, w: 2, h: 2, fx: 2, fy: 1 },
      /* Quảng trường tháp: hai đèn đá ôm hai sườn tây/đông. */
      { id: 'thap_den_c', type: 'lantern', x: 41, y: 5, w: 1, h: 2, fx: 1, fy: 1 },
      { id: 'thap_den_d', type: 'lantern', x: 61, y: 5, w: 1, h: 2, fx: 1, fy: 1 },
      /* Quảng trường cổng nam: đèn đá hai sườn + bia nhỏ + ghế đá. */
      { id: 'nam_den_a', type: 'lantern', x: 43, y: 69, w: 1, h: 2, fx: 1, fy: 1 },
      { id: 'nam_den_b', type: 'lantern', x: 59, y: 69, w: 1, h: 2, fx: 1, fy: 1 },
      { id: 'nam_bia_nho', type: 'stele_small', x: 47, y: 68, w: 1, h: 1, fx: 1, fy: 1 },
      { id: 'nam_ghe_da', type: 'bench_stone', x: 56, y: 71, w: 2, h: 1, fx: 2, fy: 1 },
      /* Khu Thiên Cơ Các: đèn đá thấp trước phân đà + bia nhỏ phía đông (tông trầm, kín đáo). */
      { id: 'tc_den_a', type: 'lantern_low', x: 60, y: 67, w: 1, h: 1, fx: 1, fy: 1 },
      { id: 'tc_den_b', type: 'lantern_low', x: 64, y: 67, w: 1, h: 1, fx: 1, fy: 1 },
      { id: 'tc_bia_nho', type: 'stele_small', x: 66, y: 63, w: 1, h: 1, fx: 1, fy: 1 },
      /* Góc đông bắc lên tông: ghế đá ở bãi đáp + đèn thấp mép đông. */
      { id: 'tb_ghe_da', type: 'bench_stone', x: 91, y: 8, w: 2, h: 1, fx: 2, fy: 1 },
      { id: 'tb_den', type: 'lantern_low', x: 99, y: 6, w: 1, h: 1, fx: 1, fy: 1 },
      /* Phố nam giữa thành: chậu hoa trước hiệu thuốc, ghế đá, cột biển ở góc phố. */
      { id: 'pn_chau_hoa', type: 'flower_pot', x: 43, y: 49, w: 1, h: 1, fx: 1, fy: 1 },
      { id: 'pn_ghe_da', type: 'bench_stone', x: 53, y: 52, w: 2, h: 1, fx: 2, fy: 1 },
      { id: 'pn_cot_bien', type: 'signpost', x: 54, y: 46, w: 1, h: 1, fx: 1, fy: 1 },
      /* Góc thiền (11,59): ghế đá + bụi hoa (hai đèn đá đã có sẵn). */
      { id: 'thien_ghe_da', type: 'bench_stone', x: 9, y: 60, w: 2, h: 1, fx: 2, fy: 1 },
      { id: 'thien_hoa', type: 'flower_bush', x: 13, y: 60, w: 1, h: 1, fx: 1, fy: 1 }
    );
    var pts = [{ x: 51, y: 74, r: 3 }, { x: 51, y: 6, r: 3 }, { x: 94, y: 8, r: 3 }, { x: 11, y: 59, r: 3 },
      { x: 51, y: 0, r: 2 }, { x: 97, y: 0, r: 2 }, { x: 51, y: 77, r: 2 }]
      .concat(npcPoints(CITY_NPCS)).concat(signPoints(CITY_SIGNS));
    var allBase = props.concat(extra);
    return allBase.concat(scatterTrees(CITY_GRID, CITY_W, CITY_H, 'cay_c', 37, null, 1, makeAvoid(pts, propRects(allBase))));
  })();

  /* ---- Khuôn viên Kiểm Trắc Tháp 72x56 ---- */
  var TOWER_W = 72, TOWER_H = 56;
  function buildTowerGrid() {
    var g = blankGrid(TOWER_W, TOWER_H);
    rectCh(g, 14, 14, 57, 50, 'S');         // sân chờ
    rectCh(g, 27, 5, 44, 12, 'P');          // đài thước pha lê
    rectCh(g, 34, 13, 37, 54, 'D');         // đường trục
    rectCh(g, 24, 24, 47, 24, 'P');         // hàng chờ
    rectCh(g, 24, 28, 47, 28, 'P');
    rectCh(g, 24, 32, 47, 32, 'P');
    rectCh(g, 34, 55, 37, 55, 'G');         // cổng nam (về thành)
    rectCh(g, 34, 0, 37, 0, 'G');           // cửa sảnh (bắc)
    return gridStrings(g);
  }
  var TOWER_GRID = buildTowerGrid();
  var TOWER_SIGNS = [{ x: 32, y: 52, text: 'Kiểm Trắc Tháp' }, { x: 30, y: 11, text: 'Đài Thước Pha Lê' }];
  var TOWER_NPCS = [
    { id: 'thap_chu', name: 'Chủ Trì Kiểm Trắc Tháp', look: 'elder', x: 38, y: 13, dir: 'down' },
    { id: 'luc_tranh', name: 'Lục Tranh', look: 'luc_tranh', x: 33, y: 25, dir: 'down' },
    { id: 'thi_sinh_a', name: 'Thí sinh kiểm trắc', look: 'villager_m', x: 39, y: 27, dir: 'left' },
    { id: 'thi_sinh_b', name: 'Thí sinh kiểm trắc', look: 'villager_f', x: 30, y: 31, dir: 'right' }
  ];
  var TOWER_PROPS = (function () {
    var props = [
      { id: 'thuoc_san', type: 'thuoc', x: 34, y: 4, w: 4, h: 4, fx: 4, fy: 2, name: 'Thước Pha Lê' },
      { id: 'den_dai_a', type: 'lantern', x: 28, y: 7, w: 1, h: 2, fx: 1, fy: 1 },
      { id: 'den_dai_b', type: 'lantern', x: 43, y: 7, w: 1, h: 2, fx: 1, fy: 1 }
    ];
    var pts = [{ x: 35, y: 52, r: 3 }, { x: 35, y: 13, r: 3 }, { x: 8, y: 48, r: 3 },
      { x: 35, y: 0, r: 2 }, { x: 35, y: 55, r: 2 }]
      .concat(npcPoints(TOWER_NPCS)).concat(signPoints(TOWER_SIGNS));
    return props.concat(scatterTrees(TOWER_GRID, TOWER_W, TOWER_H, 'cay_t', 37, null, 1, makeAvoid(pts, propRects(props)))).concat([
      /* Đợt làm giàu hình ảnh tháp 2026-11-04: vật thể trang trí bố cục
         lại sân tháp (trụ cổng bắc, lư hương đài, đèn đá dọc trục, bia
         cổng nam, anh đào hai góc bắc, góc thiền tây nam, bồn hoa bốn
         góc sân). Nối SAU scatter để 47 cây rải hạt 37 giữ nguyên vị
         trí; mọi footprint khai thật, không đè neo nhiệm vụ/cổng/NPC. */
      { id: 'tru_cua_bac_a', type: 'gate_pillar', x: 31, y: 1, w: 2, h: 3, fx: 2, fy: 1, name: 'Trụ Cổng Tháp' },
      { id: 'tru_cua_bac_b', type: 'gate_pillar', x: 39, y: 1, w: 2, h: 3, fx: 2, fy: 1, name: 'Trụ Cổng Tháp' },
      { id: 'lu_huong_dai_a', type: 'lu_huong', x: 32, y: 6, w: 1, h: 1, fx: 1, fy: 1, name: 'Lư Hương Đài Thước' },
      { id: 'lu_huong_dai_b', type: 'lu_huong', x: 39, y: 6, w: 1, h: 1, fx: 1, fy: 1, name: 'Lư Hương Đài Thước' },
      { id: 'den_truc_a', type: 'lantern2', x: 33, y: 19, w: 1, h: 1, fx: 1, fy: 1, name: 'Đèn Đá Ven Đường' },
      { id: 'den_truc_b', type: 'lantern2', x: 38, y: 19, w: 1, h: 1, fx: 1, fy: 1, name: 'Đèn Đá Ven Đường' },
      { id: 'den_truc_c', type: 'lantern2', x: 33, y: 35, w: 1, h: 1, fx: 1, fy: 1, name: 'Đèn Đá Ven Đường' },
      { id: 'den_truc_d', type: 'lantern2', x: 38, y: 35, w: 1, h: 1, fx: 1, fy: 1, name: 'Đèn Đá Ven Đường' },
      { id: 'den_truc_e', type: 'lantern2', x: 33, y: 47, w: 1, h: 1, fx: 1, fy: 1, name: 'Đèn Đá Ven Đường' },
      { id: 'den_truc_f', type: 'lantern2', x: 38, y: 47, w: 1, h: 1, fx: 1, fy: 1, name: 'Đèn Đá Ven Đường' },
      { id: 'bia_cong_nam_a', type: 'stele_small', x: 31, y: 50, w: 1, h: 1, fx: 1, fy: 1, name: 'Bia Nhỏ Cổng Nam' },
      { id: 'bia_cong_nam_b', type: 'stele_small', x: 40, y: 50, w: 1, h: 1, fx: 1, fy: 1, name: 'Bia Nhỏ Cổng Nam' },
      { id: 'dao_tay_bac', type: 'sakura_big', x: 17, y: 2, w: 2, h: 3, fx: 2, fy: 1 },
      { id: 'dao_dong_bac', type: 'sakura_big', x: 54, y: 2, w: 2, h: 3, fx: 2, fy: 1 },
      { id: 'thong_thien_a', type: 'pine2', x: 4, y: 43, w: 1, h: 2, fx: 1, fy: 1 },
      { id: 'den_thien_a', type: 'lantern_low', x: 6, y: 46, w: 1, h: 1, fx: 1, fy: 1 },
      { id: 'den_thien_b', type: 'lantern_low', x: 11, y: 46, w: 1, h: 1, fx: 1, fy: 1 },
      { id: 'ghe_thien', type: 'bench_stone', x: 11, y: 49, w: 1, h: 1, fx: 1, fy: 1 },
      { id: 'hoa_thien_a', type: 'flower_bush', x: 5, y: 51, w: 1, h: 1, fx: 1, fy: 1 },
      { id: 'hoa_thien_b', type: 'flower_bush', x: 12, y: 50, w: 1, h: 1, fx: 1, fy: 1 },
      { id: 'hoa_san_a', type: 'flower_bush', x: 15, y: 15, w: 1, h: 1, fx: 1, fy: 1 },
      { id: 'hoa_san_b', type: 'flower_bush', x: 56, y: 15, w: 1, h: 1, fx: 1, fy: 1 },
      { id: 'hoa_san_c', type: 'flower_bush', x: 15, y: 49, w: 1, h: 1, fx: 1, fy: 1 },
      { id: 'hoa_san_d', type: 'flower_bush', x: 56, y: 49, w: 1, h: 1, fx: 1, fy: 1 }
    ]);
  })();

  /* ---- Nội thất tháp 40x30 ---- */
  var HALL_W = 40, HALL_H = 30;
  function buildHallGrid() {
    var g = blankGrid(HALL_W, HALL_H);
    rectCh(g, 1, 1, 38, 28, 'S');           // sàn sảnh
    rectCh(g, 16, 8, 23, 28, 'P');          // lối giữa
    rectCh(g, 18, 29, 21, 29, 'G');         // cửa nam (ra sân)
    return gridStrings(g);
  }
  var HALL_GRID = buildHallGrid();
  var HALL_NPCS = [
    { id: 'thap_chu', name: 'Chủ Trì Kiểm Trắc Tháp', look: 'elder', x: 23, y: 9, dir: 'left' },
    { id: 'luc_tranh', name: 'Lục Tranh', look: 'luc_tranh', x: 15, y: 12, dir: 'right' }
  ];
  var HALL_PROPS = [
    { id: 'thuoc_lon', type: 'thuoc', x: 18, y: 2, w: 4, h: 5, fx: 4, fy: 2, name: 'Thước Pha Lê Lớn', interact: true },
    { id: 'bia_thap_a', type: 'stele', x: 7, y: 7, w: 2, h: 2, fx: 2, fy: 1, name: 'Bia Khắc Phẩm Cấp' },
    { id: 'bia_thap_b', type: 'stele', x: 30, y: 7, w: 2, h: 2, fx: 2, fy: 1, name: 'Bia Khắc Phẩm Cấp' },
    { id: 'den_noi_a', type: 'lantern', x: 6, y: 4, w: 1, h: 2, fx: 1, fy: 1 },
    { id: 'den_noi_b', type: 'lantern', x: 32, y: 4, w: 1, h: 2, fx: 1, fy: 1 },
    { id: 'den_noi_c', type: 'lantern', x: 6, y: 24, w: 1, h: 2, fx: 1, fy: 1 },
    { id: 'den_noi_d', type: 'lantern', x: 32, y: 24, w: 1, h: 2, fx: 1, fy: 1 },
    /* Đợt làm giàu hình ảnh tháp 2026-11-04: lư hương hai bên thước
       lớn + ghế đá chờ hai phía sảnh (footprint khai thật). */
    { id: 'lu_huong_sanh_a', type: 'lu_huong', x: 16, y: 5, w: 1, h: 1, fx: 1, fy: 1, name: 'Lư Hương Sảnh Tháp' },
    { id: 'lu_huong_sanh_b', type: 'lu_huong', x: 23, y: 5, w: 1, h: 1, fx: 1, fy: 1, name: 'Lư Hương Sảnh Tháp' },
    { id: 'ghe_sanh_a', type: 'bench_stone', x: 8, y: 20, w: 1, h: 1, fx: 1, fy: 1 },
    { id: 'ghe_sanh_b', type: 'bench_stone', x: 31, y: 20, w: 1, h: 1, fx: 1, fy: 1 }
  ];

  /* ---- Thanh Vân Tông 124x92 ---- */
  var SECT_W = 124, SECT_H = 92;
  function buildSectGrid() {
    var g = blankGrid(SECT_W, SECT_H);
    rectCh(g, 46, 79, 77, 90, 'S');         // quảng trường vào (sơn môn)
    rectCh(g, 60, 12, 63, 78, 'D');         // trục chính (kéo lên tới đài Trúc Cơ)
    rectCh(g, 1, 44, 122, 45, 'D');         // phố ngang giữa
    rectCh(g, 30, 72, 112, 73, 'D');        // phố ngang nam
    rectCh(g, 42, 52, 81, 71, 'S');         // quảng trường tông
    rectCh(g, 56, 58, 67, 65, 'P');         // tâm quảng trường
    rectCh(g, 30, 53, 46, 62, 'S');         // sân luyện
    rectCh(g, 6, 5, 24, 15, 'P');           // đài Thăng Long (tây bắc)
    for (var i = 0; i <= 34; i++) {         // bậc thang chéo rộng 3 từ (26,50) lên đài
      var cx = 26 - Math.round(i * 0.55), cy = 50 - i;
      rectCh(g, cx - 1, cy, cx + 1, cy, 'S');
    }
    rectCh(g, 51, 3, 72, 11, 'P');          // nền đài Trúc Cơ (bắc giữa)
    rectCh(g, 72, 8, 99, 9, 'D');           // đường đài Trúc Cơ -> bãi trống sau núi
    rectCh(g, 96, 12, 106, 18, 'D');        // bãi trống rừng sau núi
    rectCh(g, 88, 66, 112, 82, 'S');        // sân khu tạp dịch (đông nam)
    rectCh(g, 59, 91, 64, 91, 'G');         // sơn môn (nam)
    rectCh(g, 100, 2, 103, 2, 'G');         // miệng đường vào thung lũng (đông bắc) — cùng họ cổng vô hình với cổng lên tông ở thành (gói phụ 9): trước đây là bãi cỏ trơ
    rectCh(g, 101, 3, 102, 9, 'D');         // đường mòn từ miệng thung lũng xuống đường đài Trúc Cơ (gói phụ 9)
    // === GÓI PHỤ 12: địa hình núi theo logic cao độ (sơn SAU MỌI lớp
    // chức năng ở trên, CHỈ sơn vùng không chức năng; kiểm liên thông ở
    // mục kiểm 47) — thấp nam → cao bắc, thềm giữa, ba đỉnh riêng. ===
    rectCh(g, 1, 1, 44, 4, 'X');            // vành vực bắc của đỉnh Thăng Long
    rectCh(g, 1, 5, 3, 43, 'X');            // vành vực tây (chừa phố ngang 44–45)
    rectCh(g, 1, 46, 3, 50, 'X');
    rectCh(g, 52, 16, 68, 27, 'P');         // thềm ĐỈNH CHÍNH: đại điện trên thềm đá cao nhất (trục qua thềm thành bậc đá)
    rectCh(g, 44, 14, 50, 30, 'X');         // vai vách tây của đỉnh chính
    rectCh(g, 70, 14, 82, 30, 'X');         // vai vách đông của đỉnh chính
    rectCh(g, 31, 29, 81, 41, 'S');         // thềm đệ tử xá ở sườn giữa (trục thành bậc đá qua thềm)
    rectCh(g, 60, 46, 63, 51, 'S');         // CẦU ĐÁ trên trục bắc–nam, bắc qua hõm mây giữa quảng trường và thềm giữa
    rectCh(g, 54, 46, 59, 51, 'X');         // sườn vực tây của cầu đá
    rectCh(g, 64, 46, 69, 51, 'X');         // sườn vực đông của cầu đá
    rectCh(g, 60, 12, 63, 15, 'S');         // bậc đá trục lên Đài Trúc Cơ
    rectCh(g, 52, 12, 59, 15, 'X');         // sườn vực tây bậc Trúc Cơ
    rectCh(g, 64, 12, 71, 15, 'X');         // sườn vực đông bậc Trúc Cơ
    rectCh(g, 26, 16, 29, 17, 'W');         // THÁC sườn tây: nguồn trên mỏm đá cao
    rectCh(g, 27, 18, 28, 29, 'W');         // thân thác đổ thẳng xuống
    rectCh(g, 25, 30, 31, 33, 'W');         // hồ thác ở sườn thấp
    rectCh(g, 25, 29, 31, 29, 'w');         // bờ hồ đi lại được
    rectCh(g, 20, 79, 44, 90, 'X');         // vách chân núi nam, tây quảng trường vào
    rectCh(g, 79, 79, 86, 90, 'X');         // vách chân núi nam, đông quảng trường vào
    rectCh(g, 4, 52, 22, 54, 'X');          // vách tây dưới quảng trường
    rectCh(g, 4, 55, 26, 76, 'X');          // vách tây sườn nam (chừa chân bậc thang chéo)
    rectCh(g, 84, 34, 110, 43, 'X');        // hõm vực đông trên phố ngang giữa
    rectCh(g, 84, 46, 110, 50, 'X');        // hõm vực đông dưới phố ngang giữa
    rectCh(g, 44, 1, 50, 11, 'X');          // vai vách tây đỉnh Trúc Cơ
    rectCh(g, 73, 1, 82, 11, 'X');          // vai vách đông đỉnh Trúc Cơ
    rectCh(g, 51, 1, 72, 2, 'X');           // môi vách bắc đỉnh Trúc Cơ
    rectCh(g, 84, 1, 99, 1, 'X');           // vành sau núi phía bắc (chừa miệng thung lũng 100–103)
    rectCh(g, 104, 1, 119, 1, 'X');
    rectCh(g, 121, 1, 122, 30, 'X');        // vành đông sau núi
    return gridStrings(g);
  }
  var SECT_GRID = buildSectGrid();
  var SECT_SIGNS = [
    { x: 95, y: 64, text: 'Khu Tạp Dịch' },
    { x: 20, y: 14, text: 'Thăng Long Đạo' }, { x: 57, y: 10, text: 'Đài Trúc Cơ' },
    { x: 50, y: 55, text: 'Quảng Trường' }, { x: 101, y: 4, text: 'Thung Lũng Hồi Phong' }
  ];
  var SECT_NPCS = [
    { id: 'truong_lao_tong', name: 'Trưởng Lão Thanh Vân Tông', look: 'elder', x: 60, y: 26, dir: 'down' },
    { id: 'lieu_khuynh_tien', name: 'Liễu Khuynh Tiên', look: 'di_ninh', x: 17, y: 11, dir: 'down' },
    { id: 'tap_dich_truong', name: 'Quản Sự Tạp Dịch', look: 'villager_old', x: 97, y: 68, dir: 'down' },
    { id: 'de_tu_a', name: 'Đệ tử Thanh Vân', look: 'villager_m', x: 57, y: 62, dir: 'right' },
    { id: 'de_tu_b', name: 'Đệ tử Thanh Vân', look: 'player_nam', x: 67, y: 60, dir: 'left' },
    { id: 'hoa_huong_than', name: 'Hoa Hướng Thần', look: 'player_nam', x: 62, y: 55, dir: 'down' },
    { id: 'tin_su', name: 'Người Đưa Tin Hứa Gia', look: 'villager_m', x: 64, y: 29, dir: 'left' },
    { id: 'u_nhan', name: 'Hứa U Nhàn', look: 'u_nhan', x: 57, y: 29, dir: 'right' }
  ];
  var SECT_PROPS = (function () {
    var props = [
      { id: 'dai_dien', type: 'house_big', x: 56, y: 19, w: 8, h: 5, fx: 8, fy: 2, name: 'Thanh Vân Đại Điện' },
      { id: 'de_tu_a_xa', type: 'house', x: 32, y: 32, w: 4, h: 3, fx: 4, fy: 1, name: 'Đệ Tử Xá' },
      { id: 'de_tu_b_xa', type: 'house_b', x: 40, y: 30, w: 5, h: 3, fx: 5, fy: 1, name: 'Đệ Tử Xá' },
      { id: 'de_tu_c_xa', type: 'house_c', x: 70, y: 32, w: 4, h: 3, fx: 4, fy: 1, name: 'Đệ Tử Xá' },
      { id: 'de_tu_d_xa', type: 'house', x: 76, y: 38, w: 4, h: 3, fx: 4, fy: 1, name: 'Đệ Tử Xá' },
      { id: 'coc_tong_1', type: 'dummy', x: 33, y: 55, w: 1, h: 2, fx: 1, fy: 1, name: 'Cọc gỗ luyện công' },
      { id: 'coc_tong_2', type: 'dummy', x: 38, y: 55, w: 1, h: 2, fx: 1, fy: 1, name: 'Cọc gỗ luyện công' },
      { id: 'coc_tong_3', type: 'dummy', x: 43, y: 55, w: 1, h: 2, fx: 1, fy: 1, name: 'Cọc gỗ luyện công' },
      { id: 'dai_truc_co', type: 'stele', x: 60, y: 4, w: 2, h: 2, fx: 2, fy: 1, name: 'Đài Trúc Cơ', interact: true },
      { id: 'den_dai_tc_a', type: 'lantern', x: 53, y: 5, w: 1, h: 2, fx: 1, fy: 1 },
      { id: 'den_dai_tc_b', type: 'lantern', x: 69, y: 5, w: 1, h: 2, fx: 1, fy: 1 },
      { id: 'den_hb_tong', type: 'lantern', x: 99, y: 1, w: 1, h: 2, fx: 1, fy: 1, name: 'Đèn đá miệng thung lũng' },
      // Gói phụ 12: sơn môn ở chân núi nam — hai bia đá ôm điểm rơi vào
      // (61,88), hai đèn đá ôm dải cổng về thành (59–64,91); đèn đá hai
      // đầu Đài Thăng Long; thông tay trên mỏm đá khô cao.
      { id: 'son_mon_bia_a', type: 'gate_pillar', x: 56, y: 87, w: 2, h: 2, fx: 2, fy: 1, name: 'Trụ Sơn Môn Thanh Vân' },
      { id: 'son_mon_bia_b', type: 'gate_pillar', x: 65, y: 87, w: 2, h: 2, fx: 2, fy: 1, name: 'Trụ Sơn Môn Thanh Vân' },
      { id: 'den_son_mon_a', type: 'lantern', x: 58, y: 89, w: 1, h: 2, fx: 1, fy: 1 },
      { id: 'den_son_mon_b', type: 'lantern', x: 64, y: 89, w: 1, h: 2, fx: 1, fy: 1 },
      { id: 'den_thang_long_a', type: 'lantern', x: 11, y: 5, w: 1, h: 2, fx: 1, fy: 1 },
      { id: 'den_thang_long_b', type: 'lantern', x: 19, y: 5, w: 1, h: 2, fx: 1, fy: 1 },
      { id: 'thong_dai_dien', type: 'pine', x: 85, y: 32, w: 1, h: 2, fx: 1, fy: 1, name: 'Thông trên mỏm đá' },
      { id: 'thong_ho_thac', type: 'pine', x: 34, y: 34, w: 1, h: 2, fx: 1, fy: 1, name: 'Thông bờ hồ thác' },
      { id: 'linh_chi', type: 'sacks', x: 100, y: 13, w: 2, h: 2, fx: 2, fy: 1, name: 'Cụm Linh Chi Sau Núi', interact: true },
      { id: 'vuon_duoc', type: 'sacks', x: 104, y: 16, w: 2, h: 2, fx: 2, fy: 1, name: 'Vườn Dược Sau Núi', interact: true },
      { id: 'tap_dich_a', type: 'house', x: 90, y: 60, w: 4, h: 3, fx: 4, fy: 1, name: 'Nhà Tạp Dịch' },
      { id: 'tap_dich_b', type: 'house_b', x: 102, y: 60, w: 5, h: 3, fx: 5, fy: 1, name: 'Nhà Tạp Dịch' },
      { id: 'viec_go', type: 'woodpile', x: 95, y: 70, w: 2, h: 2, fx: 2, fy: 1, name: 'Đống Củi Cần Bổ', interact: true },
      { id: 'viec_nuoc', type: 'well', x: 104, y: 68, w: 2, h: 2, fx: 2, fy: 1, name: 'Giếng Nước Sau Bếp', interact: true },
      { id: 'viec_bao', type: 'sacks', x: 90, y: 76, w: 2, h: 2, fx: 2, fy: 1, name: 'Bao Gạo Cần Chuyển', interact: true }
    ];
    var pts = [{ x: 61, y: 88, r: 3 }, { x: 31, y: 61, r: 3 }, { x: 61, y: 91, r: 2 }]
      .concat(npcPoints(SECT_NPCS)).concat(signPoints(SECT_SIGNS));
    var rects = propRects(props).concat([{ x: 95, y: 8, w: 12, h: 12, pad: 0 }]); // hành lang vào bãi trống sau núi
    var forest = { x0: 84, y0: 3, x1: 119, y1: 30 };
    var treesS = scatterTrees(SECT_GRID, SECT_W, SECT_H, 'cay_s', 37, forest, 6, makeAvoid(pts, rects));
    // Lớp phủ mặt đất vùng săn sau núi (chỉ đạo 08:42 ngày 02/11): giữ
    // trống quanh 3 ổ quái và trên mọi vật thể/cây đã có.
    var avoidS = makeAvoid(pts.concat([{ x: 90, y: 8, r: 3 }, { x: 112, y: 24, r: 3 }, { x: 104, y: 6, r: 3 }]),
      rects.concat(footRects(treesS)));
    var decorS = scatterGroundDecor(SECT_GRID, SECT_W, SECT_H, 'phu_s', 12, forest, avoidS);
    // Cây điểm nhấn mẫu video (08:48): rừng tông dày cây sẵn nên mật độ
    // thưa hơn, anh đào tối đa 1 cây làm điểm nhấn.
    var allS = props.concat(treesS).concat(decorS);
    var accentS = scatterAccentTrees(SECT_GRID, SECT_W, SECT_H, 'cayv_s', forest, avoidS, footTilesOf(allS),
      { bigMod: 60, sakuraMod: 250, sakuraMax: 1, midMod: 45, smallMod: 35 });
    // Rừng tông quá dày cây cũ (436 cây) nên cổng băm không lọt được cây
    // lớn nào — đặt tay 4 cây neo tại các cặp ô trống đã kiểm chứng
    // (xa ổ quái, ngoài hành lang Linh Chi, chân đế không chồng vật nào):
    // 3 cây lớn ở đông-bắc, đông và nam rừng; 1 anh đào ở phía tây.
    var anchorS = [
      { id: 'cayv_s_lon_113_4', type: 'tree_big', x: 113, y: 4, w: 2, h: 3, fx: 2, fy: 1 },
      { id: 'cayv_s_lon_112_11', type: 'tree_big', x: 112, y: 11, w: 2, h: 3, fx: 2, fy: 1 },
      { id: 'cayv_s_lon_90_27', type: 'tree_big', x: 90, y: 27, w: 2, h: 3, fx: 2, fy: 1 },
      { id: 'cayv_s_dao_88_20', type: 'sakura_big', x: 88, y: 20, w: 2, h: 3, fx: 2, fy: 1 }
    ];
    // Đợt làm giàu hình ảnh tông môn (02/11): lớp TRÌNH DIỄN đặt tay —
    // chỉ thêm vật trang trí, không đổi bất kỳ tọa độ chức năng nào.
    // Xà cổng sơn môn bắc qua hai trụ tại (56,87)/(65,87) (không chặn
    // đường trong engine: fx 0); lư hương + đèn đá + thông cổ thụ làm
    // trang nghiêm thềm đại điện; thông mỏm đá ôm hai đài cao; đèn đá
    // và cây tán lớn cho quảng trường, sân đáp và khu tạp dịch.
    var visualS = [
      { id: 'cong_son_mon_xa', type: 'gate_beam', x: 60, y: 85, w: 3, h: 3, fx: 0, fy: 1, name: 'Xà Cổng Sơn Môn Thanh Vân' },
      { id: 'lu_huong_dai_dien_a', type: 'lu_huong', x: 57, y: 25, w: 1, h: 1, fx: 1, fy: 1, name: 'Lư Hương Đại Điện' },
      { id: 'lu_huong_dai_dien_b', type: 'lu_huong', x: 64, y: 25, w: 1, h: 1, fx: 1, fy: 1, name: 'Lư Hương Đại Điện' },
      { id: 'den_truc_dai_dien_a', type: 'lantern', x: 58, y: 28, w: 1, h: 2, fx: 1, fy: 1 },
      { id: 'den_truc_dai_dien_b', type: 'lantern', x: 65, y: 28, w: 1, h: 2, fx: 1, fy: 1 },
      { id: 'thong_co_dai_dien_a', type: 'pine2', x: 53, y: 20, w: 1, h: 2, fx: 1, fy: 1, name: 'Thông Cổ Thụ Đại Điện' },
      { id: 'thong_co_dai_dien_b', type: 'pine2', x: 67, y: 20, w: 1, h: 2, fx: 1, fy: 1, name: 'Thông Cổ Thụ Đại Điện' },
      { id: 'thong_mom_thang_long_a', type: 'pine', x: 4, y: 9, w: 1, h: 2, fx: 1, fy: 1, name: 'Thông Mỏm Đá' },
      { id: 'thong_mom_thang_long_b', type: 'pine', x: 26, y: 9, w: 1, h: 2, fx: 1, fy: 1, name: 'Thông Mỏm Đá' },
      { id: 'da_chan_bac_thang_long', type: 'rock_l_a', x: 5, y: 16, w: 1, h: 1, fx: 1, fy: 1 },
      { id: 'da_nguon_thac', type: 'rock_l_b', x: 25, y: 17, w: 1, h: 1, fx: 1, fy: 1 },
      { id: 'thong_co_dai_tc_a', type: 'pine2', x: 52, y: 10, w: 1, h: 2, fx: 1, fy: 1, name: 'Thông Cổ Thụ Đài Trúc Cơ' },
      { id: 'thong_co_dai_tc_b', type: 'pine2', x: 70, y: 10, w: 1, h: 2, fx: 1, fy: 1, name: 'Thông Cổ Thụ Đài Trúc Cơ' },
      { id: 'den_quang_truong_a', type: 'lantern', x: 57, y: 57, w: 1, h: 2, fx: 1, fy: 1 },
      { id: 'den_quang_truong_b', type: 'lantern', x: 66, y: 57, w: 1, h: 2, fx: 1, fy: 1 },
      { id: 'cay_lon_quang_truong_a', type: 'tree_big', x: 45, y: 66, w: 2, h: 3, fx: 2, fy: 1 },
      { id: 'cay_lon_quang_truong_b', type: 'tree_big', x: 78, y: 66, w: 2, h: 3, fx: 2, fy: 1 },
      { id: 'cay_lon_san_vao', type: 'tree_big', x: 47, y: 81, w: 2, h: 3, fx: 2, fy: 1 },
      { id: 'dao_san_vao', type: 'sakura_big', x: 75, y: 81, w: 2, h: 3, fx: 2, fy: 1 },
      { id: 'dao_tap_dich', type: 'sakura_big', x: 111, y: 66, w: 2, h: 3, fx: 2, fy: 1 }
    ];
    return allS.concat(accentS).concat(anchorS).concat(visualS);
  })();

  /* ---- Thung Lũng Hồi Phong 96x74 (phần 3, chương 9 + 11) ----
     Trục nam -> bắc một tuyến: cổng nam về tông -> bãi đáp (anh đào cổ thụ
     là điểm đặt chân) -> đồng hoa dọc suối -> một điểm qua suối -> miệng
     hẻm -> hành lang hẻm giữa hai vách đá -> bãi trống bắc (điểm hái dược
     dẫn Kết Đan của chương 11 ở rìa đông bãi). */
  var VALLEY_W = 96, VALLEY_H = 74;
  function buildValleyGrid() {
    var g = blankGrid(VALLEY_W, VALLEY_H);
    rectCh(g, 40, 64, 57, 72, 'S');         // bãi đáp đầu thung lũng
    rectCh(g, 46, 73, 49, 73, 'G');         // cổng nam (về Thanh Vân Tông)
    rectCh(g, 6, 40, 90, 43, ',');          // đồng hoa bờ nam suối
    rectCh(g, 6, 46, 90, 49, ',');          // đồng hoa bờ bắc suối
    rectCh(g, 1, 44, 94, 45, 'W');          // suối cắt ngang nửa nam
    rectCh(g, 47, 43, 50, 43, 'w'); rectCh(g, 47, 46, 50, 46, 'w'); // bờ cát quanh điểm qua
    rectCh(g, 48, 43, 49, 46, 'D');         // điểm qua suối (đoạn cạn) — điểm qua DUY NHẤT
    rectCh(g, 48, 47, 49, 72, 'D');         // đường bãi đáp -> điểm qua suối
    rectCh(g, 48, 22, 49, 42, 'D');         // đường bờ bắc suối -> miệng hẻm
    rectCh(g, 46, 18, 53, 41, 'S');         // hành lang hẻm (sàn đá)
    rectCh(g, 44, 39, 55, 41, 'S');         // miệng hẻm loe rộng
    rectCh(g, 40, 18, 45, 41, 'X');         // vách đá tây
    rectCh(g, 54, 18, 59, 41, 'X');         // vách đá đông
    rectCh(g, 34, 4, 65, 19, 'S');          // vành bãi trống bắc
    rectCh(g, 36, 6, 62, 17, 'P');          // bãi trống bắc
    return gridStrings(g);
  }
  var VALLEY_GRID = buildValleyGrid();
  var VALLEY_SIGNS = [
    { x: 44, y: 69, text: 'Thung Lũng Hồi Phong' }, { x: 51, y: 21, text: 'Hẻm Hồi Phong' }
  ];
  var VALLEY_NPCS = [
    { id: 'de_tu_ho_tong', name: 'Đệ Tử Hộ Tống', look: 'villager_m', x: 52, y: 66, dir: 'down' },
    { id: 'tin_su', name: 'Người Đưa Tin Hứa Gia', look: 'villager_m', x: 54, y: 63, dir: 'left' },
    { id: 'u_nhan', name: 'Hứa U Nhàn', look: 'u_nhan', x: 43, y: 60, dir: 'right' },
    { id: 'chinh_ngon', name: 'Hứa Chính Ngôn', look: 'chinh_ngon', x: 52, y: 59, dir: 'down' },
    { id: 'gia_nhan', name: 'Gia Nhân Hứa Gia', look: 'villager_m', x: 49, y: 62, dir: 'down' },
    { id: 'huyet_de', name: 'Đệ Tử Huyết Bạc Bị Trói', look: 'villager_m', x: 41, y: 66, dir: 'down' },
    { id: 'mo_cuu_u', name: 'Người Lạ Dưới Gốc Anh Đào', look: 'luc_tranh', x: 43, y: 55, dir: 'down' },
    { id: 'tran_tu_linh', name: 'Trần Tư Linh', look: 'tu_linh', x: 56, y: 60, dir: 'left' }
  ];
  // Rải cây cho thung lũng: dùng thêm hai loại cây mới của thư viện vật thể
  // (tree2, pine2) bên cạnh cây cũ; bụi cây đặt tay ở phần vật thể tĩnh.
  function scatterValleyTrees(grid, w, h, avoid) {
    var props = [], types = ['tree', 'pine', 'tree2', 'pine2'];
    for (var y = 2; y < h - 2; y++) for (var x = 2; x < w - 2; x++) {
      var top = grid[y].charAt(x), foot = grid[y + 1].charAt(x);
      if ((top !== '.' && top !== ',') || (foot !== '.' && foot !== ',')) continue;
      if (avoid && (avoid(x, y) || avoid(x, y + 1))) continue;
      var hh = hashRoad(x, y);
      var inMeadow = (y >= 38 && y <= 51);
      if (hh % (inMeadow ? 61 : 13) !== 0) continue;
      props.push({ id: 'cay_v' + x + '_' + y, type: types[hh % 4], x: x, y: y, w: 1, h: 2, fx: 1, fy: 1 });
    }
    return props;
  }
  var VALLEY_PROPS = (function () {
    var props = [
      { id: 'cong_hb', type: 'gate', x: 44, y: 70, w: 3, h: 2, fx: 3, fy: 1, name: 'Cổng Vào Thung Lũng' },
      { id: 'bia_hb', type: 'stele', x: 52, y: 68, w: 2, h: 2, fx: 2, fy: 1, name: 'Bia Tên Thung Lũng' },
      { id: 'bia_hb_nho', type: 'stele_small', x: 55, y: 69, w: 1, h: 1, fx: 1, fy: 1, name: 'Bia Nhỏ Khắc Năm Tháng' },
      { id: 'anh_dao_co', type: 'tree_sakura', x: 45, y: 55, w: 1, h: 2, fx: 1, fy: 1, name: 'Anh Đào Cổ Thụ' },
      { id: 'vet_tich_hb', type: 'sacks', x: 47, y: 57, w: 2, h: 2, fx: 2, fy: 1, name: 'Dấu Vết Dưới Gốc Anh Đào', interact: true },
      { id: 'duoc_dan_diem', type: 'sacks', x: 59, y: 9, w: 2, h: 2, fx: 2, fy: 1, name: 'Cụm Dược Dẫn Kết Đan', interact: true },
      { id: 'den_hem_a', type: 'lantern2', x: 46, y: 36, w: 1, h: 1, fx: 1, fy: 1, name: 'Đèn Đá Bên Hẻm' },
      { id: 'den_hem_b', type: 'lantern2', x: 53, y: 30, w: 1, h: 1, fx: 1, fy: 1, name: 'Đèn Đá Bên Hẻm' },
      { id: 'den_hem_c', type: 'lantern2', x: 46, y: 24, w: 1, h: 1, fx: 1, fy: 1, name: 'Đèn Đá Bên Hẻm' },
      { id: 'lau_say_a', type: 'reeds', x: 40, y: 43, w: 1, h: 1, fx: 1, fy: 1 },
      { id: 'lau_say_b', type: 'reeds', x: 58, y: 46, w: 1, h: 1, fx: 1, fy: 1 },
      { id: 'lau_say_c', type: 'reeds', x: 44, y: 46, w: 1, h: 1, fx: 1, fy: 1 },
      { id: 'da_chan_a', type: 'rock_l_a', x: 37, y: 30, w: 1, h: 1, fx: 1, fy: 1 },
      { id: 'da_chan_b', type: 'rock_l_b', x: 61, y: 34, w: 1, h: 1, fx: 1, fy: 1 },
      { id: 'da_chan_c', type: 'rock_m', x: 42, y: 20, w: 1, h: 1, fx: 1, fy: 1 },
      { id: 'da_chan_d', type: 'rock_m', x: 57, y: 40, w: 1, h: 1, fx: 1, fy: 1 },
      { id: 'xuong_hem', type: 'bones', x: 50, y: 28, w: 1, h: 1, fx: 1, fy: 1 },
      { id: 'xuong_bac', type: 'bones', x: 44, y: 10, w: 1, h: 1, fx: 1, fy: 1 },
      { id: 'coc_can', type: 'stake_cluster', x: 53, y: 12, w: 1, h: 1, fx: 1, fy: 1 },
      { id: 'hang_rao_a', type: 'fence_post', x: 41, y: 65, w: 1, h: 1, fx: 1, fy: 1 },
      { id: 'hang_rao_b', type: 'fence_post', x: 56, y: 65, w: 1, h: 1, fx: 1, fy: 1 },
      { id: 'ghe_da_hb', type: 'bench_stone', x: 42, y: 63, w: 1, h: 1, fx: 1, fy: 1 },
      { id: 'bien_chi_hb', type: 'signpost', x: 51, y: 63, w: 1, h: 1, fx: 1, fy: 1 },
      { id: 'hoa_buoi_a', type: 'flower_bush', x: 30, y: 42, w: 1, h: 1, fx: 1, fy: 1 },
      { id: 'hoa_buoi_b', type: 'flower_bush', x: 66, y: 47, w: 1, h: 1, fx: 1, fy: 1 },
      { id: 'co_cum_a', type: 'grass_clump', x: 24, y: 48, w: 1, h: 1, fx: 1, fy: 1 },
      { id: 'co_cum_b', type: 'grass_clump', x: 72, y: 41, w: 1, h: 1, fx: 1, fy: 1 },
      { id: 'bui_hb_a', type: 'bush1', x: 36, y: 60, w: 1, h: 1, fx: 1, fy: 1 },
      { id: 'bui_hb_b', type: 'bush2', x: 60, y: 58, w: 1, h: 1, fx: 1, fy: 1 }
    ];
    var pts = [{ x: 49, y: 71, r: 3 }, { x: 49, y: 42, r: 3 }, { x: 49, y: 45, r: 3 }]
      .concat(npcPoints(VALLEY_NPCS)).concat(signPoints(VALLEY_SIGNS));
    var rects = propRects(props).concat([
      { x: 44, y: 16, w: 14, h: 58, pad: 1 },   // hành lang hẻm + đường trục + bãi bắc: không mọc cây
      { x: 38, y: 62, w: 22, h: 11, pad: 1 }    // bãi đáp: không mọc cây
    ]);
    var treesV = scatterValleyTrees(VALLEY_GRID, VALLEY_W, VALLEY_H, makeAvoid(pts, rects));
    // Lớp phủ mặt đất cho thung lũng (chỉ đạo 08:42 ngày 02/11): đồng cỏ
    // và bãi bắc thêm bụi cỏ/bụi cây/hoa/đá; giữ trống quanh 4 ổ quái,
    // hành lang hẻm, bãi đáp và trên mọi vật thể/cây đã có.
    var avoidV = makeAvoid(pts.concat([{ x: 25, y: 40, r: 3 }, { x: 70, y: 50, r: 3 }, { x: 30, y: 25, r: 3 }, { x: 52, y: 17, r: 3 }]),
      rects.concat(footRects(treesV)));
    var decorV = scatterGroundDecor(VALLEY_GRID, VALLEY_W, VALLEY_H, 'phu_v', 17, null, avoidV);
    // Cây điểm nhấn mẫu video (08:48): lớn/vừa/nhỏ + tối đa 2 anh đào
    // (cộng cây anh đào cổ thụ đặt tay sẵn ở bãi đáp).
    var allV = props.concat(treesV).concat(decorV);
    var accentV = scatterAccentTrees(VALLEY_GRID, VALLEY_W, VALLEY_H, 'cayv_v', null, avoidV, footTilesOf(allV),
      { bigMod: 380, sakuraMod: 800, sakuraMax: 2, midMod: 120, smallMod: 85 });
    return allV.concat(accentV);
  })();

  /* ---- Tĩnh Quan Lâu 64x48 (phần 3, chương 10) ----
     Nội thất lớn của Thiên Cơ Các: phòng kín phía bắc (nơi thẩm vấn), sảnh
     chính ở giữa, phòng kho phía tây, hành lang phía nam và sân sau là vùng
     cỏ duy nhất của bản đồ. */
  var LOU_W = 64, LOU_H = 48;
  function buildLouGrid() {
    var g = blankGrid(LOU_W, LOU_H);
    rectCh(g, 1, 1, 62, 46, 'S');           // sàn toàn lầu
    rectCh(g, 1, 1, 23, 11, 'X');           // khối kín tây bắc (phòng không vào được)
    rectCh(g, 40, 1, 62, 11, 'X');          // khối kín đông bắc
    rectCh(g, 24, 2, 39, 11, 'S');          // phòng kín phía bắc
    rectCh(g, 29, 5, 34, 9, 'P');           // vùng đứng thẩm vấn trong phòng kín
    rectCh(g, 1, 12, 62, 12, 'X');          // vách ngang dưới phòng kín
    rectCh(g, 30, 12, 33, 12, 'S');         // cửa phòng kín
    rectCh(g, 22, 13, 41, 33, 'P');         // sảnh chính
    rectCh(g, 20, 13, 21, 33, 'X');         // vách tây sảnh
    rectCh(g, 20, 22, 21, 23, 'S');         // cửa phòng kho
    rectCh(g, 42, 13, 43, 33, 'X');         // vách đông sảnh
    rectCh(g, 42, 22, 43, 23, 'S');         // cửa phòng khách chờ
    rectCh(g, 1, 40, 62, 40, 'X');          // vách ngang trên sân sau
    rectCh(g, 30, 40, 33, 47, 'D');         // lối ra sân sau + cổng về thành
    rectCh(g, 1, 41, 29, 46, '.');          // sân sau phía tây
    rectCh(g, 34, 41, 62, 46, '.');         // sân sau phía đông
    rectCh(g, 14, 42, 22, 45, ',');         // thảm hoa sân sau tây
    rectCh(g, 42, 42, 50, 45, ',');         // thảm hoa sân sau đông
    rectCh(g, 30, 47, 33, 47, 'G');         // cổng nam (về Cô Châu Thành)
    return gridStrings(g);
  }
  var LOU_GRID = buildLouGrid();
  var LOU_SIGNS = [{ x: 35, y: 38, text: 'Tĩnh Quan Lâu' }, { x: 31, y: 45, text: 'Về Cô Châu Thành' }];
  var LOU_NPCS = [
    { id: 'tiep_khach', name: 'Người Tiếp Khách Phân Đà', look: 'villager_f', x: 28, y: 30, dir: 'down' },
    { id: 'bach_kinh_duong', name: 'Bạch Kính Đường', look: 'elder', x: 32, y: 7, dir: 'down' },
    { id: 'ky_luc_quan', name: 'Ký Lục Quan', look: 'villager_f', x: 36, y: 8, dir: 'left' },
    { id: 'gac_kho', name: 'Người Gác Kho', look: 'villager_m', x: 10, y: 20, dir: 'down' },
    { id: 'tran_chinh_dao', name: 'Trần Chính Đạo', look: 'elder', x: 26, y: 16, dir: 'down' }
  ];
  var LOU_PROPS = [
    { id: 'den_lau_a', type: 'lantern', x: 24, y: 15, w: 1, h: 2, fx: 1, fy: 1 },
    { id: 'den_lau_b', type: 'lantern', x: 39, y: 15, w: 1, h: 2, fx: 1, fy: 1 },
    { id: 'den_lau_thap_a', type: 'lantern_low', x: 27, y: 31, w: 1, h: 1, fx: 1, fy: 1 },
    { id: 'den_lau_thap_b', type: 'lantern_low', x: 36, y: 31, w: 1, h: 1, fx: 1, fy: 1 },
    { id: 'gia_kho', type: 'rack', x: 4, y: 15, w: 3, h: 2, fx: 3, fy: 1, name: 'Giá Để Hồ Sơ' },
    { id: 'bao_kho', type: 'sacks', x: 8, y: 17, w: 2, h: 2, fx: 2, fy: 1, name: 'Bao Tài Liệu' },
    { id: 'chum_kho', type: 'jars', x: 14, y: 15, w: 2, h: 2, fx: 2, fy: 1, name: 'Chum Đựng Cuộn Giấy' },
    { id: 'chum_lon_kho', type: 'jar_big', x: 17, y: 18, w: 1, h: 1, fx: 1, fy: 1 },
    { id: 'gio_kho', type: 'basket', x: 6, y: 24, w: 1, h: 1, fx: 1, fy: 1 },
    { id: 'ghe_lau_a', type: 'bench_stone', x: 24, y: 28, w: 1, h: 1, fx: 1, fy: 1 },
    { id: 'ghe_lau_b', type: 'bench_stone', x: 39, y: 28, w: 1, h: 1, fx: 1, fy: 1 },
    { id: 'ban_lau', type: 'table_stone', x: 32, y: 30, w: 1, h: 1, fx: 1, fy: 1 },
    { id: 'chau_hoa_a', type: 'flower_pot', x: 23, y: 14, w: 1, h: 1, fx: 1, fy: 1 },
    { id: 'chau_hoa_b', type: 'flower_pot', x: 40, y: 14, w: 1, h: 1, fx: 1, fy: 1 },
    { id: 'chau_hoa_c', type: 'flower_pot', x: 31, y: 4, w: 1, h: 1, fx: 1, fy: 1 },
    { id: 'bia_lau', type: 'stele_small', x: 30, y: 36, w: 1, h: 1, fx: 1, fy: 1, name: 'Bia Nhỏ Giữa Hành Lang' },
    { id: 'nen_da_san', type: 'stone_platform', x: 37, y: 41, w: 2, h: 1, fx: 2, fy: 1 },
    { id: 'bui_lau_a', type: 'bush1', x: 20, y: 43, w: 1, h: 1, fx: 1, fy: 1 },
    { id: 'bui_lau_b', type: 'bush2', x: 44, y: 44, w: 1, h: 1, fx: 1, fy: 1 },
    { id: 'hoa_lau', type: 'flower_bush', x: 26, y: 44, w: 1, h: 1, fx: 1, fy: 1 },
    { id: 'co_lau_a', type: 'grass_clump', x: 48, y: 42, w: 1, h: 1, fx: 1, fy: 1 },
    { id: 'co_lau_b', type: 'grass_clump', x: 16, y: 45, w: 1, h: 1, fx: 1, fy: 1 }
  ];

  /* ---------------- Đăng ký bản đồ + cổng ---------------- */
  /* ----- Bản đồ bí cảnh (đợt bí cảnh + hệ cày, docs/bicanh-prep) -----
     Nội thất, chỉ dùng ký tự ô S/P (sàn đá), X (vách), W/w (nước/bờ) và
     cỏ/đất ngoài hành lang. blankRows đã đóng viền X; mỗi bản đồ mở một
     khe cổng ra ở viền nam (ô S) khớp rect portal trong MAPS. Hành lang
     chính luôn là dải S dọc giữa; vách ngăn khoang là hàng X có khe đúng
     dải hành lang. Vật thể đặc biệt chặn khe bằng footprint của chúng
     (xem registry ẩn theo phiên ở propAt). */
  function buildThuyLiemGrid() {
    var rows = blankRows(44, 32, 'S');
    rectC(rows, 1, 11, 42, 11, 'X');           // vách khoang cửa / khoang suối
    rectC(rows, 1, 21, 42, 21, 'X');           // vách khoang suối / khoang boss (chú ý: y21 là vách dưới khoang suối)
    rectC(rows, 20, 2, 22, 30, 'S');           // hành lang chính giữa
    rectC(rows, 36, 2, 38, 30, 'S');           // lối tắt phía đông (bị vach_nut chắn ở y20)
    rectC(rows, 1, 16, 42, 16, 'W');           // suối ngầm cắt ngang khoang giữa
    rectC(rows, 20, 16, 22, 16, 'S');          // cầu đá chính qua suối
    rectC(rows, 36, 16, 38, 16, 'S');          // cầu đá lối tắt qua suối
    rectC(rows, 1, 15, 42, 15, 'w');           // bờ suối bắc
    rectC(rows, 20, 15, 22, 15, 'S');
    rectC(rows, 36, 15, 38, 15, 'S');
    rectC(rows, 1, 17, 42, 17, 'w');           // bờ suối nam
    rectC(rows, 20, 17, 22, 17, 'S');
    rectC(rows, 36, 17, 38, 17, 'S');
    rectC(rows, 5, 24, 12, 27, 'P');           // mảng đá hoa văn khoang cửa
    rectC(rows, 28, 13, 34, 14, 'P');          // mảng đá khoang suối
    rectC(rows, 19, 31, 22, 31, 'S');          // khe cổng ra viền nam
    return rows;
  }
  var BC_THUYLIEM_GRID = buildThuyLiemGrid();
  var BC_THUYLIEM_PROPS = [
    { id: 'vach_nut', type: 'rock_l_a', x: 36, y: 19, w: 3, h: 2, fx: 3, fy: 1, name: 'Vách Đá Nứt', interact: true },
    { id: 'reeds_cua', type: 'reeds', x: 5, y: 28, w: 2, h: 2, fx: 2, fy: 1, name: 'Lau Sậy Cửa Động' },
    { id: 'bia_thuyliem', type: 'stele_small', x: 30, y: 26, w: 2, h: 2, fx: 2, fy: 1, name: 'Bia Đá Khắc Dở' },
    { id: 'xuong_thuyliem', type: 'bones', x: 10, y: 24, w: 2, h: 1, fx: 2, fy: 1, name: 'Tàn Cốt Trong Động' },
    { id: 'da_suoi_a', type: 'rock_s', x: 8, y: 13, w: 1, h: 1, fx: 1, fy: 1, name: 'Đá Suối Ngầm' },
    { id: 'da_suoi_b', type: 'rock_s', x: 33, y: 19, w: 1, h: 1, fx: 1, fy: 1, name: 'Đá Suối Ngầm' }
  ];
  function buildTaphaGrid() {
    var rows = blankRows(40, 30, 'S');
    rectC(rows, 1, 19, 38, 19, 'X');           // vách sảnh bia / hành lang phế tích
    rectC(rows, 1, 10, 38, 10, 'X');           // vách hành lang / phòng boss
    rectC(rows, 18, 2, 21, 28, 'S');           // hành lang chính giữa
    rectC(rows, 5, 22, 12, 25, 'P');           // mảng đá hoa văn sảnh bia
    rectC(rows, 26, 13, 33, 16, 'P');          // mảng đá phế tích
    rectC(rows, 17, 29, 20, 29, 'S');          // khe cổng ra viền nam
    return rows;
  }
  var BC_TAPHA_GRID = buildTaphaGrid();
  var BC_TAPHA_PROPS = [
    { id: 'bia_tapha_a', type: 'stele_small', x: 6, y: 23, w: 2, h: 2, fx: 2, fy: 1, name: 'Bia Ghi Chép Tàn Tích' },
    { id: 'bia_tapha_b', type: 'stele_small', x: 30, y: 23, w: 2, h: 2, fx: 2, fy: 1, name: 'Bia Ghi Chép Tàn Tích' },
    { id: 'da_tapha', type: 'stone_platform', x: 26, y: 13, w: 3, h: 2, fx: 3, fy: 1, name: 'Bệ Đá Phế Tích' },
    { id: 'da_vun_tapha', type: 'rock_s', x: 9, y: 14, w: 1, h: 1, fx: 1, fy: 1, name: 'Đá Vụn Phế Tích' }
  ];
  function buildTapsauGrid() {
    var rows = blankRows(40, 30, 'S');
    rectC(rows, 1, 19, 38, 19, 'X');           // vách khoang 1 / khoang 2
    rectC(rows, 1, 10, 38, 10, 'X');           // vách khoang 2 / phòng boss (khe bị cua_phe_thuoc chắn)
    rectC(rows, 18, 2, 21, 28, 'S');           // hành lang chính giữa
    rectC(rows, 5, 22, 12, 25, 'P');           // mảng đá hoa văn khoang 1
    rectC(rows, 26, 13, 33, 16, 'P');          // mảng đá khoang 2
    rectC(rows, 17, 29, 20, 29, 'S');          // khe cổng ra viền nam
    return rows;
  }
  var BC_TAPSAU_GRID = buildTapsauGrid();
  var BC_TAPSAU_PROPS = [
    { id: 'cua_phe_thuoc', type: 'stele_small', x: 18, y: 9, w: 4, h: 2, fx: 4, fy: 1, name: 'Cửa Phế Thước', interact: true },
    { id: 'bia_tapsau_a', type: 'stele_small', x: 6, y: 23, w: 2, h: 2, fx: 2, fy: 1, name: 'Bia Tàn Tích Tầng Sâu' },
    { id: 'bia_tapsau_b', type: 'stele_small', x: 30, y: 23, w: 2, h: 2, fx: 2, fy: 1, name: 'Bia Tàn Tích Tầng Sâu' },
    { id: 'da_tapsau', type: 'stone_platform', x: 27, y: 13, w: 3, h: 2, fx: 3, fy: 1, name: 'Bệ Đá Tầng Sâu' }
  ];
  function buildKiemTrungGrid() {
    var rows = blankRows(48, 34, 'S');
    rectC(rows, 1, 25, 46, 25, 'X');           // vách sảnh kiếm gỉ / hành lang kiếm trận
    rectC(rows, 1, 16, 46, 16, 'X');           // vách hành lang / khoang bia
    rectC(rows, 1, 9, 46, 9, 'X');             // vách khoang bia / tiền mộ (khe bị tinh_mac_tran chắn)
    rectC(rows, 1, 7, 46, 7, 'X');             // vách tiền mộ / mộ thất (khe bị cua_mo_that chắn)
    rectC(rows, 22, 2, 25, 32, 'S');           // hành lang chính giữa
    rectC(rows, 10, 20, 36, 20, 'P');          // dải kiếm khí hành lang (đánh dấu sàn)
    rectC(rows, 10, 22, 36, 22, 'P');
    rectC(rows, 5, 28, 12, 30, 'P');           // mảng đá sảnh kiếm gỉ
    rectC(rows, 21, 33, 24, 33, 'S');          // khe cổng ra viền nam
    return rows;
  }
  var BC_KIEMTRUNG_GRID = buildKiemTrungGrid();
  var BC_KIEMTRUNG_PROPS = [
    { id: 'tinh_mac_tran', type: 'stele_small', x: 22, y: 8, w: 4, h: 2, fx: 4, fy: 1, name: 'Tĩnh Mặc Trấn', interact: true },
    { id: 'cua_mo_that', type: 'stele_small', x: 22, y: 6, w: 4, h: 2, fx: 4, fy: 1, name: 'Cửa Mộ Thất', interact: true },
    { id: 'kiem_cam_a', type: 'kiem_cum', x: 8, y: 28, w: 2, h: 2, fx: 2, fy: 1, name: 'Kiếm Gỉ Cắm Đất' },
    { id: 'kiem_cam_b', type: 'kiem_cum', x: 36, y: 28, w: 2, h: 2, fx: 2, fy: 1, name: 'Kiếm Gỉ Cắm Đất' },
    { id: 'bia_kiemtrung', type: 'stele_small', x: 34, y: 12, w: 2, h: 2, fx: 2, fy: 1, name: 'Bia Kiếm Trủng' },
    { id: 'xuong_kiemtrung', type: 'bones', x: 10, y: 12, w: 2, h: 1, fx: 2, fy: 1, name: 'Tàn Cốt Kiếm Tu' }
  ];
  /* Tầng sâu Kiếm Trủng bc_kiemtrung_sau 44x32 (cung IV, chương 16):
     lưới NGUYÊN VĂN từ bố cục đã chốt ở tiền sản xuất
     (tools/work/arc-iv-prep/art/bc_kiemtrung_sau/layout.json — S sàn đá,
     P sàn hoa văn, X tường; spawn (21,29); cổng nam (20..23,31) về tầng
     trên; phòng boss bắc–trung (14..29, 2..9), tâm trận (22,5); hai hốc
     mắt trận phụ tây (6,14) / đông (37,14)). Không sinh lại bằng hàm để
     khớp 100% tâm ô với tranh nền bg-bc_kiemtrung_sau.png. */
  var BC_KIEMTRUNG_SAU_GRID = [
    'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXSSSSSSSSSSSSSSSSXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXSSSSPPPPPPPPSSSSSSSSXXXXXXXXXX',
    'XXXXXXXXXXXXXXSSSSPPPPPPPPSSSSSSSSXXXXXXXXXX',
    'XXXXXXXXXXXXXXSSSSPPPPPPPPSSSSSSSSXXXXXXXXXX',
    'XXXXXXXXXXXXXXSSSSPPPPPPPPSSSSXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXSSSSPPPPPPPPSSSSXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXSSSSPPPPPPPPSSSSXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXSSSSSSSSSSSSSSSSXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXSSSSXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXSSSSXXXXXXXXXXXXXXXXXXXX',
    'XXXSSSSSSXXXXXXXXXXSPPPPSXXXXXXXXXXSSSSSSXXX',
    'XXXSPPPPSSSSSSSSSSSSPPPPSSSSSSSSSSSSPPPPSXXX',
    'XXXSPPPPSSSSSSSSSSSSSSSSSSSSSSSSSSSSPPPPSXXX',
    'XXXSPPPPSSSSSSSSSSSSSSSSSSSSSSSSSSSSPPPPSXXX',
    'XXXSPPPPSSSSSXXXXXXXXXXXXXXXXXXXXXXSPPPPSXXX',
    'XXXSSSSSSSPPSSSSSSXXXXXXXXXXXXXXXXXSSSSSSXXX',
    'XXXXXXXXXSPPSSSSSSXXXXXXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXSSSSSSSSSXXXXXXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXSSSSSSSSSSSSSSSXXXXXXXXXXXXXXXXXXXX',
    'XXXXXSSSSSSSSSSSSSSSSSSSXXXXXXXXXXXXXXXXXXXX',
    'XXXXXSSSSSSSSSSSSSSSSSSSXXXXXXXXXXXXXXXXXXXX',
    'XXXXXSSSSSXXXXXXXXXXSSSSXXXXXXXXXXXXXXXXXXXX',
    'XXXXXSSSSSXXXXXXXXXXSSSSXXXXXXXXXXXXXXXXXXXX',
    'XXXXXSSSSSXXXXXXXXXXSSSSXXXSSSSXXXXXXXXXXXXX',
    'XXXXXXXXXXXXSSSSSSSSSSSSSSSSSSSXXXXXXXXXXXXX',
    'XXXXXXXXXXXXSSSSSSSPPPPPPSSSSSSXXXXXXXXXXXXX',
    'XXXXXXXXXXXXSSSSSSSPPPPPPSSXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXSSPPPPPPSSXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXSSSSSSSSSSXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXSSSSXXXXXXXXXXXXXXXXXXXX'
  ];
  var BC_KIEMTRUNG_SAU_PROPS = [
    { id: 'mat_tran_tay', type: 'stele_small', x: 6, y: 14, w: 1, h: 1, fx: 1, fy: 1, name: 'Mắt Trận Phụ Phía Tây', interact: true },
    { id: 'mat_tran_dong', type: 'stele_small', x: 37, y: 14, w: 1, h: 1, fx: 1, fy: 1, name: 'Mắt Trận Phụ Phía Đông', interact: true },
    { id: 'kiem_gay_sau_a', type: 'kiem_cum', x: 31, y: 3, w: 2, h: 2, fx: 2, fy: 1, name: 'Kiếm Gãy Tàn Tích' },
    { id: 'kiem_gay_sau_b', type: 'kiem_cum', x: 6, y: 22, w: 2, h: 2, fx: 2, fy: 1, name: 'Kiếm Gãy Tàn Tích' },
    { id: 'xuong_kiemtrung_sau', type: 'bones', x: 14, y: 18, w: 2, h: 1, fx: 2, fy: 1, name: 'Tàn Cốt Kiếm Tu' }
  ];
  /* Di Tích Trận Tâm — Tầng Ngoài bc_tran_tam 44x32 (đợt bí cảnh boss
     tổ đội, hậu cung IV): lưới NGUYÊN VĂN phỏng theo hàng của
     BC_KIEMTRUNG_SAU_GRID rồi chỉnh hình phòng cho khác (phòng boss bắc
     x 14..29, y 2..9 sàn hoa văn P rộng x 17..26; spawn (21,29); hai hốc
     đợt quái giữa tầng quanh y 14 — đợt 1 tây (6,14)/(8,14), đợt 2 đông
     (37,13)/(38,14)/(36,15); cổng ra hàng 31 x 20..23 về điểm đáp kề
     cổng ngoài ở Thanh Vân Tông). Boss Hộ Tâm Thạch Tướng tại (22,5). */
  var BC_TRAN_TAM_GRID = [
    'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXSSSSSSSSSSSSSSSSXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXSSSPPPPPPPPPPSSSSSSSXXXXXXXXXX',
    'XXXXXXXXXXXXXXSSSPPPPPPPPPPSSSSSSSXXXXXXXXXX',
    'XXXXXXXXXXXXXXSSSPPPPPPPPPPSSSSSSSXXXXXXXXXX',
    'XXXXXXXXXXXXXXSSSPPPPPPPPPPSSSXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXSSSPPPPPPPPPPSSSXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXSSSPPPPPPPPPPSSSXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXSSSSSSSSSSSSSSSSXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXSSSSXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXSSSSXXXXXXXXXXXXXXXXXXXX',
    'XXXSSSSSSXXXXXXXXXXSPPPPSXXXXXXXXXXSSSSSSXXX',
    'XXXSPPPPPSSSSSSSSSSSPPPPSSSSSSSSSSSPPPPPSXXX',
    'XXXSPPPPPSSSSSSSSSSSSSSSSSSSSSSSSSSPPPPPSXXX',
    'XXXSPPPPPSSSSSSSSSSSSSSSSSSSSSSSSSSPPPPPSXXX',
    'XXXSPPPPSSSSSXXXXXXXXXXXXXXXXXXXXXXSPPPPSXXX',
    'XXXSSSSSSSPPSSSSSSXXXXXXXXXXXXXXXXXSSSSSSXXX',
    'XXXXXXXXXSPPSSSSSSXXXXXXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXSSSSSSSSSXXXXXXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXSSSSSSSSSSSSSSSXXXXXXXXXXXXXXXXXXXX',
    'XXXXXSSSSSSSSSSSSSSSSSSSXXXXXXXXXXXXXXXXXXXX',
    'XXXXXSSSSSSSSSSSSSSSSSSSXXXXXXXXXXXXXXXXXXXX',
    'XXXXXSSSSSSSXXXXXXXXSSSSXXXXXXXXXXXXXXXXXXXX',
    'XXXXXSSSSSSSXXXXXXXXSSSSXXXXXXXXXXXXXXXXXXXX',
    'XXXXXSSSSSSSXXXXXXXXSSSSXXXSSSSXXXXXXXXXXXXX',
    'XXXXXXXXXXSSSSSSSSSSSSSSSSSSSSSXXXXXXXXXXXXX',
    'XXXXXXXXXXXXSSSSSSPPPPPPPSSSSSSXXXXXXXXXXXXX',
    'XXXXXXXXXXXXSSSSSSSPPPPPPSSXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXSSPPPPPPSSXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXSSSSSSSSSSXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXSSSSXXXXXXXXXXXXXXXXXXXX'
  ];
  var BC_TRAN_TAM_PROPS = [
    { id: 'bia_tran_tam_a', type: 'stele_small', x: 15, y: 3, w: 2, h: 2, fx: 2, fy: 1, name: 'Bia Tàn Trận' },
    { id: 'bia_tran_tam_b', type: 'stele_small', x: 34, y: 13, w: 2, h: 2, fx: 2, fy: 1, name: 'Bia Tàn Trận' },
    { id: 'kiem_gay_tran_a', type: 'kiem_cum', x: 31, y: 4, w: 2, h: 2, fx: 2, fy: 1, name: 'Kiếm Gãy Tàn Tích' },
    { id: 'kiem_gay_tran_b', type: 'kiem_cum', x: 18, y: 27, w: 2, h: 2, fx: 2, fy: 1, name: 'Kiếm Gãy Tàn Tích' },
    { id: 'xuong_tran_tam', type: 'bones', x: 10, y: 21, w: 2, h: 1, fx: 2, fy: 1, name: 'Tàn Cốt Kiếm Tu' },
    { id: 'den_tran_tam_a', type: 'lantern_low', x: 3, y: 13, w: 1, h: 2, fx: 1, fy: 1, name: 'Đèn Đá Thấp' },
    { id: 'den_tran_tam_b', type: 'lantern_low', x: 40, y: 13, w: 1, h: 2, fx: 1, fy: 1, name: 'Đèn Đá Thấp' }
  ];
  /* Di Tích Trận Tâm — Tâm Trận bc_tran_tam_sau 40x30: MỘT đại sảnh mở;
     spawn (19,26) phía nam; bệ boss hoa văn P phía bắc x 14..25, y 3..8
     (boss Trận Tâm Ma Ảnh tại (19,6)); HAI ĐIỂM TRẬN (điểm giữ) là hai
     mảng P 3x3 tại (5,14) tây và (34,14) đông, mỗi điểm có bia phong ấn
     ở tâm; cổng ra hàng 29 x 17..20 về tầng ngoài. Không đợt quái. */
  var BC_TRAN_TAM_SAU_GRID = [
    'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    'XSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSX',
    'XSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSX',
    'XSSSSSSSSSSSSSPPPPPPPPPPPPSSSSSSSSSSSSSX',
    'XSSSSSSSSSSSSSPPPPPPPPPPPPSSSSSSSSSSSSSX',
    'XSSSSSSSSSSSSSPPPPPPPPPPPPSSSSSSSSSSSSSX',
    'XSSSSSSSSSSSSSPPPPPPPPPPPPSSSSSSSSSSSSSX',
    'XSSSSSSSSSSSSSPPPPPPPPPPPPSSSSSSSSSSSSSX',
    'XSSSSSSSSSSSSSPPPPPPPPPPPPSSSSSSSSSSSSSX',
    'XSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSX',
    'XSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSX',
    'XSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSX',
    'XSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSX',
    'XSSSPPPSSSSSSSSSSSSSSSSSSSSSSSSSSPPPSSSX',
    'XSSSPPPSSSSSSSSSSSSSSSSSSSSSSSSSSPPPSSSX',
    'XSSSPPPSSSSSSSSSSSSSSSSSSSSSSSSSSPPPSSSX',
    'XSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSX',
    'XSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSX',
    'XSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSX',
    'XSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSX',
    'XSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSX',
    'XSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSX',
    'XSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSX',
    'XSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSX',
    'XSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSX',
    'XSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSX',
    'XSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSX',
    'XSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSX',
    'XSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSX',
    'XXXXXXXXXXXXXXXXXSSSSXXXXXXXXXXXXXXXXXXX'
  ];
  var BC_TRAN_TAM_SAU_PROPS = [
    { id: 'diem_tran_tay', type: 'stele_small', x: 5, y: 14, w: 1, h: 1, fx: 1, fy: 1, name: 'Bia Phong Ấn Điểm Trận Tây', interact: false },
    { id: 'diem_tran_dong', type: 'stele_small', x: 34, y: 14, w: 1, h: 1, fx: 1, fy: 1, name: 'Bia Phong Ấn Điểm Trận Đông', interact: false },
    { id: 'den_tam_tran_a', type: 'lantern_low', x: 2, y: 2, w: 1, h: 2, fx: 1, fy: 1, name: 'Đèn Đá Thấp' },
    { id: 'den_tam_tran_b', type: 'lantern_low', x: 37, y: 2, w: 1, h: 2, fx: 1, fy: 1, name: 'Đèn Đá Thấp' },
    { id: 'den_tam_tran_c', type: 'lantern_low', x: 2, y: 27, w: 1, h: 2, fx: 1, fy: 1, name: 'Đèn Đá Thấp' },
    { id: 'den_tam_tran_d', type: 'lantern_low', x: 37, y: 27, w: 1, h: 2, fx: 1, fy: 1, name: 'Đèn Đá Thấp' },
    { id: 'kiem_gay_tam_a', type: 'kiem_cum', x: 12, y: 4, w: 2, h: 2, fx: 2, fy: 1, name: 'Kiếm Gãy Tàn Tích' },
    { id: 'kiem_gay_tam_b', type: 'kiem_cum', x: 26, y: 4, w: 2, h: 2, fx: 2, fy: 1, name: 'Kiếm Gãy Tàn Tích' },
    { id: 'xuong_tam_tran', type: 'bones', x: 30, y: 24, w: 2, h: 1, fx: 2, fy: 1, name: 'Tàn Cốt Kiếm Tu' }
  ];
  /* Sóng + vị trí boss của hai tầng Trận Tâm cho engine chép vào
     BC_WAVES / BC_BOSS_POS của game.js (mẫu BC_KIEMTRUNG_SAU_*). Đợt
     quái tầng ngoài là Kiếm Ý Tàn Hồn tầng sâu (kháng cộng hưởng 50%)
     như thiết kế; tâm trận KHÔNG có đợt quái — chỉ boss tổ đội. */
  var BC_TRAN_TAM_WAVES = [['tan_hon_kiem_y_sau', 2], ['tan_hon_kiem_y_sau', 3]];
  var BC_TRAN_TAM_WAVE_POS = [[{ x: 6, y: 14 }, { x: 8, y: 14 }], [{ x: 37, y: 13 }, { x: 38, y: 14 }, { x: 36, y: 15 }]];
  var BC_TRAN_TAM_BOSS_POS = { x: 22, y: 5 };
  var BC_TRAN_TAM_SAU_BOSS_POS = { x: 19, y: 6 };
  var BC_TRAN_TAM_SAU_PADS = { A: { x: 5, y: 14 }, B: { x: 34, y: 14 } };
  function buildHoiphongGrid() {
    var rows = blankRows(52, 38, 'S');
    rectC(rows, 1, 28, 50, 28, 'X');           // vách tiền thất / hành lang cơ quan
    rectC(rows, 1, 19, 50, 19, 'X');           // vách hành lang / hậu thất
    rectC(rows, 1, 10, 50, 10, 'X');           // vách hậu thất / mộ thất
    rectC(rows, 24, 2, 27, 36, 'S');           // hành lang chính giữa
    rectC(rows, 6, 31, 14, 34, 'P');           // mảng đá tiền thất
    rectC(rows, 34, 22, 42, 25, 'P');          // mảng đá hành lang
    rectC(rows, 23, 37, 26, 37, 'S');          // khe cổng ra viền nam
    return rows;
  }
  var BC_HOIPHONG_GRID = buildHoiphongGrid();
  var BC_HOIPHONG_PROPS = [
    { id: 'thu_trong_mo', type: 'stele_small', x: 24, y: 11, w: 2, h: 2, fx: 2, fy: 1, name: 'Thư Chưa Gửi Trong Mộ', interact: true },
    { id: 'bia_mo_a', type: 'stele_small', x: 8, y: 32, w: 2, h: 2, fx: 2, fy: 1, name: 'Bia Mộ Không Tên' },
    { id: 'den_mo_a', type: 'lantern_low', x: 36, y: 32, w: 1, h: 2, fx: 1, fy: 1, name: 'Đèn Đá Thấp' },
    { id: 'den_mo_b', type: 'lantern_low', x: 40, y: 14, w: 1, h: 2, fx: 1, fy: 1, name: 'Đèn Đá Thấp' },
    { id: 'xuong_mo', type: 'bones', x: 12, y: 14, w: 2, h: 1, fx: 2, fy: 1, name: 'Tàn Cốt Cổ Mộ' },
    { id: 'da_mo', type: 'stone_platform', x: 36, y: 22, w: 3, h: 2, fx: 3, fy: 1, name: 'Bệ Đá Cổ Mộ' }
  ];

  /* ---- Đài Đấu Kiếm Thanh Vân 40x30 (Mục F đợt vá 2026-11-02) ----
     Bản đồ chuyên dụng RIÊNG cho trận tỉ thí chương 7 với Hoa Hướng
     Thần: nền đá liền mạch (S) với bệ đấu hoa văn (P) ở giữa, kiếm bia
     ở đầu bắc, đèn đá bốn góc và cụm kiếm cắm trang trí — đúng ngôn
     ngữ hình ảnh của Thanh Vân Tông. Vào đài bằng LUỒNG TỈ THÍ có kịch
     bản (gặp Hoa Hướng Thần ở quảng trường rồi được đưa lên đài, như
     đường vào bí cảnh bằng vật thể cổng), KHÔNG có cổng đi bộ trỏ vào;
     cổng ra ở viền nam đưa về quảng trường. Hoa và khán giả đệ tử là
     thực thể TRÌNH DIỄN của trận trong game.js (như hình chiếu Thăng
     Long), không phải NPC của bản đồ — nên npcs rỗng là có chủ đích. */
  function buildArenaGrid() {
    var rows = blankRows(40, 30, 'S');
    rectC(rows, 10, 7, 29, 22, 'P');          // bệ đấu hoa văn giữa đài
    rectC(rows, 18, 29, 21, 29, 'G');         // khe cổng ra viền nam (về quảng trường)
    return rows;
  }
  var ARENA_GRID = buildArenaGrid();
  var ARENA_PROPS = [
    { id: 'kiem_bia_dai', type: 'stele', x: 18, y: 2, w: 2, h: 2, fx: 2, fy: 1, name: 'Kiếm Bia Đài Đấu Kiếm', interact: true },
    { id: 'den_dai_a', type: 'lantern', x: 4, y: 3, w: 1, h: 2, fx: 1, fy: 1 },
    { id: 'den_dai_b', type: 'lantern', x: 34, y: 3, w: 1, h: 2, fx: 1, fy: 1 },
    { id: 'den_dai_c', type: 'lantern', x: 4, y: 24, w: 1, h: 2, fx: 1, fy: 1 },
    { id: 'den_dai_d', type: 'lantern', x: 34, y: 24, w: 1, h: 2, fx: 1, fy: 1 },
    { id: 'kiem_cum_dai_a', type: 'kiem_cum', x: 6, y: 6, w: 2, h: 2, fx: 2, fy: 1, name: 'Cụm Kiếm Cắm Ven Đài' },
    { id: 'kiem_cum_dai_b', type: 'kiem_cum', x: 32, y: 6, w: 2, h: 2, fx: 2, fy: 1, name: 'Cụm Kiếm Cắm Ven Đài' },
    { id: 'lu_huong_dai_a', type: 'lu_huong', x: 15, y: 4, w: 1, h: 1, fx: 1, fy: 1, name: 'Lư Hương Đầu Đài' },
    { id: 'lu_huong_dai_b', type: 'lu_huong', x: 24, y: 4, w: 1, h: 1, fx: 1, fy: 1, name: 'Lư Hương Đầu Đài' }
  ];

  /* ---- Đài Thăng Long 48x34 (đợt tách đài thành BẢN ĐỒ RIÊNG
     2026-11-05, lệnh Bui 07:24 + bổ sung 07:29) ----
     BỐ CỤC MỘT ĐỈNH DUY NHẤT: toàn bộ Thăng Long nằm trên đúng một chỏm
     núi — ĐÀI ĐẤU KIẾM (nền hoa văn P) ngự trên chỏm đỉnh ở nửa bắc,
     MỘT trục thang đá men theo sườn nam của chính đỉnh đó đi xuống
     thềm vào ở mép nam (điểm rơi cổng), hai vai cỏ là thềm phụ của
     cùng một khối núi chứ không phải đỉnh khác; ngoài khối đỉnh là
     vách vực X bao quanh (biển mây và dãy núi phụ chỉ là lớp nền vẽ
     ở tầng thấp trong tranh nền). Vào đài bằng CỔNG ĐI BỘ hai chiều
     từ thềm thang tây bắc Thanh Vân Tông (khác Đài Đấu Kiếm vào bằng
     luồng tỉ thí). Hình học của đài giữ ĐÚNG khung đài cũ trong tông
     để luật trận ở game.js không đổi một chữ: bia đài tại (14,7) như
     cũ, nhà hình chiếu (20,10), biên rời đài x 4..30 / y 3..17 ôm
     trọn mặt đài và thềm quanh. Hình chiếu và cảnh truyện là thực thể
     trình diễn của game.js nên npcs rỗng là có chủ đích. */
  function buildThangLongGrid() {
    var g = blankGrid(48, 34);
    rectCh(g, 0, 0, 47, 33, 'X');           // toàn khối là vách vực — khắc dần thềm đỉnh vào
    rectCh(g, 5, 2, 42, 17, 'S');           // thềm chỏm đỉnh (sân bắc + hai vai thềm quanh đài)
    rectCh(g, 8, 5, 29, 16, 'P');           // ĐÀI ĐẤU KIẾM trên chỏm đỉnh
    rectCh(g, 19, 18, 28, 27, 'S');         // TRỤC THANG ĐÁ men sườn nam của đỉnh
    rectCh(g, 15, 21, 32, 22, 'P');         // chiếu nghỉ hoa văn giữa thang (cùng trục thang)
    rectCh(g, 6, 20, 14, 25, '.');          // vai cỏ tây của đỉnh (thềm phụ cùng khối núi)
    rectCh(g, 33, 20, 41, 25, '.');         // vai cỏ đông của đỉnh
    rectCh(g, 12, 26, 14, 27, 'S');         // lối vai tây vòng xuống thềm vào
    rectCh(g, 33, 26, 35, 27, 'S');         // lối vai đông vòng xuống thềm vào
    rectCh(g, 12, 28, 35, 32, 'S');         // thềm vào ở chân thang (điểm rơi cổng)
    rectCh(g, 21, 33, 26, 33, 'S');         // dải cổng về ở mép nam
    return gridStrings(g);
  }
  var THANGLONG_GRID = buildThangLongGrid();
  var THANGLONG_PROPS = [
    { id: 'thang_long_dai', type: 'stele', x: 14, y: 7, w: 2, h: 2, fx: 2, fy: 1, name: 'Đài Thăng Long', interact: true },
    { id: 'kiem_bia_dinh', type: 'stele', x: 24, y: 2, w: 2, h: 2, fx: 2, fy: 1, name: 'Kiếm Bia Đỉnh Thăng Long' },
    { id: 'co_dinh_a', type: 'cot_co', x: 9, y: 2, w: 1, h: 2, fx: 1, fy: 1 },
    { id: 'co_dinh_b', type: 'cot_co', x: 38, y: 2, w: 1, h: 2, fx: 1, fy: 1 },
    { id: 'kiem_cum_dinh_a', type: 'kiem_cum', x: 19, y: 2, w: 2, h: 2, fx: 2, fy: 1, name: 'Cụm Kiếm Cắm Đầu Đài' },
    { id: 'kiem_cum_dinh_b', type: 'kiem_cum', x: 30, y: 3, w: 2, h: 2, fx: 2, fy: 1, name: 'Cụm Kiếm Cắm Ven Đài' },
    { id: 'den_dinh_a', type: 'lantern', x: 6, y: 3, w: 1, h: 2, fx: 1, fy: 1 },
    { id: 'den_dinh_b', type: 'lantern', x: 41, y: 3, w: 1, h: 2, fx: 1, fy: 1 },
    { id: 'den_thang_a', type: 'lantern', x: 18, y: 18, w: 1, h: 2, fx: 1, fy: 1 },
    { id: 'den_thang_b', type: 'lantern', x: 29, y: 18, w: 1, h: 2, fx: 1, fy: 1 },
    { id: 'den_them_a', type: 'lantern', x: 13, y: 29, w: 1, h: 2, fx: 1, fy: 1 },
    { id: 'den_them_b', type: 'lantern', x: 34, y: 29, w: 1, h: 2, fx: 1, fy: 1 },
    { id: 'thong_vai_tay', type: 'pine', x: 7, y: 21, w: 1, h: 2, fx: 1, fy: 1, name: 'Thông Vai Núi' },
    { id: 'thong_vai_tay_b', type: 'pine', x: 12, y: 23, w: 1, h: 2, fx: 1, fy: 1, name: 'Thông Vai Núi' },
    { id: 'dao_vai_dong', type: 'sakura_big', x: 37, y: 20, w: 2, h: 3, fx: 2, fy: 1, name: 'Anh Đào Vai Núi' },
    { id: 'thong_vai_dong', type: 'pine', x: 34, y: 23, w: 1, h: 2, fx: 1, fy: 1, name: 'Thông Vai Núi' }
  ];

  var MAPS = {
    tran: {
      name: 'Hứa Gia Trấn', w: MAP_W, h: MAP_H, grid: MAP_GRID, props: PROPS, npcs: NPCS,
      meditate: WELL_MEDITATE,
      signs: [{ x: 27, y: 40, text: 'Hứa Gia Trấn' }, { x: 49, y: 21, text: 'Giếng đầu trấn' }],
      portals: [{ x: 28, y: 44, w: 4, h: 1, to: 'duong_mon', toX: 47, toY: 2, label: 'Đường tới Cô Châu Thành', cond: 'dummy' }]
    },
    duong_mon: {
      name: 'Đường Mòn Xuyên Rừng', w: ROAD_W, h: ROAD_H, grid: ROAD_GRID, props: ROAD_PROPS, npcs: ROAD_NPCS,
      meditate: { x: roadCX(20) - 1, y: 21 },
      signs: [{ x: 47, y: 4, text: 'Đường đi Cô Châu' }, { x: 44, y: 65, text: 'Cổng Cô Châu Thành' }],
      portals: [
        /* Dải cổng mép bắc mở sâu hơn 1 hàng (đợt nóng 3, gói F): người chơi
           chạm-để-đi tới Ô MỐC nhiệm vụ hoặc tới HÌNH vật thể trước cổng
           (bia đá/thước sân) thì dừng ở hàng 1–3, không bao giờ bước lên
           hàng 0 — dải chỉ có hàng 0 khiến cổng "chết" với người thật dù
           bài kiểm tra chạm thẳng ô dải vẫn xanh. Độ sâu từng cổng đã đối
           chiếu điểm rơi phía bên kia để không nảy ngược: cổng về trấn ở
           đây giữ h:2 vì điểm rơi vào đường mòn từ trấn là hàng 2. */
        { x: 46, y: 0, w: 4, h: 2, to: 'tran', toX: 29, toY: 43, label: 'Về Hứa Gia Trấn' },
        { x: 46, y: 73, w: 4, h: 1, to: 'co_chau', toX: 51, toY: 74, label: 'Vào Cô Châu Thành', cond: 'quest:q2_cong_thanh', lockMsg: 'Hãy tới quảng trường cổng thành trước đã.' }
      ]
    },
    co_chau: {
      name: 'Cô Châu Thành', w: 104, h: 78, grid: CITY_GRID, props: CITY_PROPS, npcs: CITY_NPCS,
      meditate: { x: 11, y: 59 },
      // ĐIỂM 4 (vá live 2026-11-03): biển 'Đường Mòn Xuyên Rừng' ở (55,73)
      // — phía đông quảng trường nam, cùng hàng với biển tên thành
      // (48,73) ở phía tây, kẹp trục đường xuống dải cổng nam (50..53,
      // 77) về Đường Mòn. Trước đây phía trong thành không có biển nào
      // chỉ cổng này (chỉ có nhãn nổi khi đã bước lên dải cổng).
      signs: [{ x: 48, y: 73, text: 'Cô Châu Thành' }, { x: 8, y: 31, text: 'Phủ Hứa Gia' }, { x: 84, y: 13, text: 'Trần Gia' }, { x: 48, y: 7, text: 'Kiểm Trắc Tháp' }, { x: 74, y: 29, text: 'Chợ Cô Châu' }, { x: 57, y: 61, text: 'Thiên Cơ Các' }, { x: 98, y: 4, text: 'Thanh Vân Tông' }, { x: 55, y: 73, text: 'Đường Mòn Xuyên Rừng' }],
      portals: [
        { x: 50, y: 77, w: 4, h: 1, to: 'duong_mon', toX: 47, toY: 70, label: 'Về Đường Mòn Xuyên Rừng' },
        { x: 48, y: 0, w: 8, h: 4, to: 'kiem_trac_thap', toX: 35, toY: 52, label: 'Vào Kiểm Trắc Tháp', cond: 'quest:q3_hang_cho', lockMsg: 'Kỳ kiểm trắc chưa tới — cổng tháp còn đóng.' },
        { x: 95, y: 0, w: 6, h: 4, to: 'thanh_van_tong', toX: 61, toY: 88, label: 'Đường Lên Thanh Vân Tông', cond: 'flag:invited', lockMsg: 'Đường lên Thanh Vân Tông chỉ mở cho người mang thư mời của tông môn.' },
        { x: 57, y: 66, w: 3, h: 1, to: 'thien_co_lau', toX: 32, toY: 45, label: 'Vào Tĩnh Quan Lâu', cond: 'quest:q10_loi_moi', lockMsg: 'Phân đà chỉ tiếp người có thiệp mời.' }
      ]
    },
    kiem_trac_thap: {
      name: 'Kiểm Trắc Tháp', w: 72, h: 56, grid: TOWER_GRID, props: TOWER_PROPS, npcs: TOWER_NPCS,
      meditate: { x: 8, y: 48 },
      signs: [{ x: 32, y: 52, text: 'Kiểm Trắc Tháp' }, { x: 30, y: 11, text: 'Đài Thước Pha Lê' }],
      portals: [
        { x: 34, y: 55, w: 4, h: 1, to: 'co_chau', toX: 51, toY: 6, label: 'Về Cô Châu Thành' },
        { x: 34, y: 0, w: 4, h: 4, to: 'thap_noi', toX: 19, toY: 27, label: 'Vào Sảnh Tháp', cond: 'quest:q3_thuoc_do', lockMsg: 'Chưa tới lượt vào sảnh — hãy chờ ở sân theo thứ tự danh sách.' }
      ]
    },
    thap_noi: {
      name: 'Sảnh Kiểm Trắc Tháp', w: 40, h: 30, grid: HALL_GRID, props: HALL_PROPS, npcs: HALL_NPCS,
      meditate: null,
      signs: [{ x: 19, y: 27, text: 'Ra Sân Tháp' }],
      portals: [
        { x: 18, y: 29, w: 4, h: 1, to: 'kiem_trac_thap', toX: 35, toY: 13, label: 'Ra Sân Tháp' }
      ]
    },
    dai_dau_kiem: {
      name: 'Đài Đấu Kiếm Thanh Vân', w: 40, h: 30, grid: ARENA_GRID, props: ARENA_PROPS, npcs: [],
      meditate: null, spawn: { x: 19, y: 26 },
      signs: [{ x: 19, y: 27, text: 'Đài Đấu Kiếm' }],
      portals: [
        { x: 18, y: 29, w: 4, h: 1, to: 'thanh_van_tong', toX: 62, toY: 57, label: 'Về Quảng Trường Tông' }
      ]
    },
    thang_long_dai: {
      name: 'Đài Thăng Long', w: 48, h: 34, grid: THANGLONG_GRID, props: THANGLONG_PROPS, npcs: [],
      meditate: null, spawn: { x: 23, y: 31 },
      signs: [{ x: 23, y: 30, text: 'Thăng Long Đài' }],
      portals: [
        { x: 21, y: 33, w: 6, h: 1, to: 'thanh_van_tong', toX: 15, toY: 7, label: 'Xuống Thềm Thăng Long Tông' }
      ]
    },
    thanh_van_tong: {
      name: 'Thanh Vân Tông', w: 124, h: 92, grid: SECT_GRID, props: SECT_PROPS, npcs: SECT_NPCS,
      meditate: { x: 31, y: 61 },
      // Biển tên tại (58,87) đã gỡ ở đợt làm giàu hình ảnh tông môn:
      // trụ cổng sơn môn mới che khuất nó, và tên tông môn nay nằm trên
      // bảng chữ của xà cổng (prop gate_beam) — giữ một nguồn tên duy nhất.
      signs: [{ x: 95, y: 64, text: 'Khu Tạp Dịch' }, { x: 20, y: 14, text: 'Thăng Long Đạo' }, { x: 57, y: 10, text: 'Đài Trúc Cơ' }, { x: 50, y: 55, text: 'Quảng Trường' }, { x: 101, y: 4, text: 'Thung Lũng Hồi Phong' }],
      portals: [
        { x: 59, y: 91, w: 6, h: 1, to: 'co_chau', toX: 94, toY: 8, label: 'Xuống Cô Châu Thành' },
        { x: 100, y: 2, w: 4, h: 1, to: 'hb_valley', toX: 49, toY: 71, label: 'Vào Thung Lũng Hồi Phong', cond: 'quest:q9_tin_du', lockMsg: 'Chưa có tin dữ nào từ sau núi — đường vào thung lũng chưa mở.' },
        /* Đợt tách Đài Thăng Long thành bản đồ riêng (2026-11-05): dải
           cổng ở mép bắc của thềm đài cũ (hàng 5, ngay dưới vành vực)
           — bước lên là lên thẳng thềm vào của đỉnh Thăng Long; thềm
           đài cũ từ nay là thềm thang cổng, bia đài đã dời lên đỉnh. */
        { x: 14, y: 5, w: 4, h: 1, to: 'thang_long_dai', toX: 23, toY: 31, label: 'Lên Đài Thăng Long' }
      ]
    },
    hb_valley: {
      name: 'Thung Lũng Hồi Phong', w: VALLEY_W, h: VALLEY_H, grid: VALLEY_GRID, props: VALLEY_PROPS, npcs: VALLEY_NPCS,
      meditate: { x: 49, y: 42 },
      signs: VALLEY_SIGNS,
      portals: [
        { x: 46, y: 73, w: 4, h: 1, to: 'thanh_van_tong', toX: 101, toY: 4, label: 'Về Thanh Vân Tông' }
      ]
    },
    thien_co_lau: {
      name: 'Tĩnh Quan Lâu', w: LOU_W, h: LOU_H, grid: LOU_GRID, props: LOU_PROPS, npcs: LOU_NPCS,
      meditate: { x: 35, y: 43 },
      signs: LOU_SIGNS,
      portals: [
        { x: 30, y: 47, w: 4, h: 1, to: 'co_chau', toX: 57, toY: 68, label: 'Về Cô Châu Thành' }
      ]
    },
    /* ----- Bí cảnh (đợt bí cảnh + hệ cày) — id bản đồ trùng id bí cảnh.
       spawn = điểm rơi ở khoang cửa; cổng ra về đúng bản đồ ngoài của
       cổng vào (điểm đáp kề vật thể cổng, đã kiểm BFS). Vào bí cảnh đi
       qua vật thể cổng (làn game.js), không qua portal rect từ ngoài. */
    bc_thuyliem: {
      name: 'Thủy Liêm Động', w: 44, h: 32, grid: BC_THUYLIEM_GRID, props: BC_THUYLIEM_PROPS, npcs: [],
      meditate: null, spawn: { x: 21, y: 27 },
      signs: [{ x: 21, y: 30, text: 'Thủy Liêm Động' }],
      portals: [
        { x: 19, y: 31, w: 4, h: 1, to: 'duong_mon', toX: 22, toY: 34, label: 'Ra Bờ Suối Đường Mòn' }
      ]
    },
    bc_tapha: {
      name: 'Tàn Tích Dưới Tháp — Tầng Ngoài', w: 40, h: 30, grid: BC_TAPHA_GRID, props: BC_TAPHA_PROPS, npcs: [],
      meditate: null, spawn: { x: 19, y: 25 },
      signs: [{ x: 19, y: 28, text: 'Tàn Tích Dưới Tháp' }],
      portals: [
        { x: 17, y: 29, w: 4, h: 1, to: 'thap_noi', toX: 5, toY: 27, label: 'Ra Sảnh Tháp' }
      ]
    },
    bc_tapsau: {
      name: 'Tàn Tích Dưới Tháp — Tầng Sâu', w: 40, h: 30, grid: BC_TAPSAU_GRID, props: BC_TAPSAU_PROPS, npcs: [],
      meditate: null, spawn: { x: 19, y: 25 },
      signs: [{ x: 19, y: 28, text: 'Tàn Tích Tầng Sâu' }],
      portals: [
        { x: 17, y: 29, w: 4, h: 1, to: 'thap_noi', toX: 5, toY: 27, label: 'Ra Sảnh Tháp' }
      ]
    },
    bc_kiemtrung: {
      name: 'Kiếm Trủng Sau Núi', w: 48, h: 34, grid: BC_KIEMTRUNG_GRID, props: BC_KIEMTRUNG_PROPS, npcs: [],
      meditate: null, spawn: { x: 23, y: 29 },
      signs: [{ x: 23, y: 32, text: 'Kiếm Trủng Sau Núi' }],
      portals: [
        { x: 21, y: 33, w: 4, h: 1, to: 'thanh_van_tong', toX: 99, toY: 15, label: 'Ra Rừng Sau Núi' }
      ]
    },
    bc_kiemtrung_sau: {
      name: 'Kiếm Trủng — Tầng Sâu', w: 44, h: 32, grid: BC_KIEMTRUNG_SAU_GRID, props: BC_KIEMTRUNG_SAU_PROPS, npcs: [],
      meditate: null, spawn: { x: 21, y: 29 },
      signs: [{ x: 21, y: 30, text: 'Kiếm Trủng — Tầng Sâu' }],
      portals: [
        { x: 20, y: 31, w: 4, h: 1, to: 'bc_kiemtrung', toX: 23, toY: 29, label: 'Về Kiếm Trủng (tầng trên)' }
      ]
    },
    bc_tran_tam: {
      name: 'Di Tích Trận Tâm — Tầng Ngoài', w: 44, h: 32, grid: BC_TRAN_TAM_GRID, props: BC_TRAN_TAM_PROPS, npcs: [],
      meditate: null, spawn: { x: 21, y: 29 },
      signs: [{ x: 21, y: 30, text: 'Di Tích Trận Tâm — Tầng Ngoài' }],
      portals: [
        { x: 20, y: 31, w: 4, h: 1, to: 'thanh_van_tong', toX: 100, toY: 17, label: 'Ra Sau Núi Thanh Vân Tông' }
      ]
    },
    bc_tran_tam_sau: {
      name: 'Di Tích Trận Tâm — Tâm Trận', w: 40, h: 30, grid: BC_TRAN_TAM_SAU_GRID, props: BC_TRAN_TAM_SAU_PROPS, npcs: [],
      meditate: null, spawn: { x: 19, y: 26 },
      signs: [{ x: 19, y: 28, text: 'Di Tích Trận Tâm — Tâm Trận' }],
      portals: [
        { x: 17, y: 29, w: 4, h: 1, to: 'bc_tran_tam', toX: 21, toY: 29, label: 'Về Tầng Ngoài Trận Tâm' }
      ]
    },
    bc_hoiphong_mo: {
      name: 'Hồi Phong Cổ Mộ', w: 52, h: 38, grid: BC_HOIPHONG_GRID, props: BC_HOIPHONG_PROPS, npcs: [],
      meditate: null, spawn: { x: 25, y: 33 },
      signs: [{ x: 25, y: 36, text: 'Hồi Phong Cổ Mộ' }],
      portals: [
        { x: 23, y: 37, w: 4, h: 1, to: 'hb_valley', toX: 53, toY: 16, label: 'Ra Bãi Bắc Thung Lũng' }
      ]
    }
  };
  /* Vật thể cổng vào bí cảnh trên bản đồ CŨ (chỉ thêm, không đổi tọa độ
     chức năng cũ). Tọa độ chọn từ lưới thật, tránh ô cổng/đường chính/ô
     tương tác cũ, đã kiểm BFS tới được từ điểm vào bản đồ:
     - bc_gate_thuyliem: duong_mon, chân đế trên bờ suối bắc (y35), kề
       cầu suối về phía tây; - cua_tan_tich: thap_noi, góc tây nam sảnh,
       một vật thể phục vụ cả tầng ngoài và tầng sâu (lựa chọn tầng khi
       cả hai đã mở do làn game.js xử lý);
     - bc_gate_kiemtrung: thanh_van_tong sau núi, kề cụm Linh Chi
       (100,13), loại kiem_cum (cụm kiếm cắm chắn động);
     - bc_gate_hoiphong: hb_valley bãi bắc, kề bãi trống (49,14), tránh
       ổ boss Sơn Chủ (49,14) — đặt lệch đông-nam, không trùng ô ổ. */
  MAPS.duong_mon.props.push({ id: 'bc_gate_thuyliem', type: 'bc_gate', x: 20, y: 34, w: 2, h: 2, fx: 2, fy: 1, name: 'Cổng Thủy Liêm Động', interact: true });
  MAPS.thap_noi.props.push({ id: 'cua_tan_tich', type: 'cua_tan_tich', x: 3, y: 26, w: 2, h: 2, fx: 2, fy: 1, name: 'Cửa Tàn Tích Dưới Tháp', interact: true });
  MAPS.thanh_van_tong.props.push({ id: 'bc_gate_kiemtrung', type: 'kiem_cum', x: 97, y: 15, w: 2, h: 2, fx: 2, fy: 1, name: 'Cụm Kiếm Cắm Chắn Động', interact: true });
  /* Di Tích Trận Tâm (đợt bí cảnh boss tổ đội): cổng cụm kiếm phong ấn
     2x2 tại (99,15) — ngay phía đông cụm kiếm Kiếm Trủng trên cùng dải
     đường đá sau núi — và bia tập kết ghép tổ 1x1 tại (98,17) kề phía
     tây-nam cổng (cách cổng <= 4 ô). Cả hai ô đều trống (không trùng
     prop/NPC hiện hữu, không chặn điểm tuần tra (101,15) hay cụm Linh
     Chi (100,13)) và tới được bằng BFS từ điểm vào tông (61,88); điểm
     đáp khi ra khỏi tầng ngoài là ô đứng trước cổng (100,17). Tọa độ
     khóa tại docs/party-boss-coords.json. */
  MAPS.thanh_van_tong.props.push({ id: 'bc_gate_tran_tam', type: 'kiem_cum', x: 99, y: 15, w: 2, h: 2, fx: 2, fy: 1, name: 'Cụm Kiếm Phong Ấn Trận Tâm', interact: true });
  MAPS.thanh_van_tong.props.push({ id: 'tap_ket_tran_tam', type: 'stele_small', x: 98, y: 17, w: 1, h: 1, fx: 1, fy: 1, name: 'Bia Tập Kết Trận Tâm', interact: true });
  MAPS.hb_valley.props.push({ id: 'bc_gate_hoiphong', type: 'bc_gate', x: 54, y: 16, w: 2, h: 2, fx: 2, fy: 1, name: 'Cửa Hồi Phong Cổ Mộ', interact: true });
  /* Đợt cảnh vật map boss (lệnh Bui 03:56 ngày 2026-11-04 "Map boss thêm
     cảnh vật để sinh động hơn"): trang trí theo bản sắc từng không gian
     đánh boss — chỉ THÊM prop, không đổi tọa độ neo truyện/trận, không
     đổi lưới. Mọi footprint đã qua kiểm vị trí trên lưới thật (ô chân đi
     được, không đè prop/cổng/điểm sinh/ô đứng tương tác, ngoài vùng cấm
     quanh boss + ô đợt quái + vùng phục kích): xem
     docs/boss-map-scenery-report.md. Bốn loại prop mới của đợt:
     mang_da (măng đá hang ướt), cot_co (cột cờ tông môn),
     quan_tai_da (quan tài đá cổ mộ), cay_gay (thân cây cổ gãy). */
  MAPS.bc_thuyliem.props.push(
    { id: 'bm_tl_mang1', type: 'mang_da', x: 3, y: 3, w: 2, h: 2, fx: 2, fy: 1 },
    { id: 'bm_tl_mang2', type: 'mang_da', x: 39, y: 3, w: 2, h: 2, fx: 2, fy: 1 },
    { id: 'bm_tl_mang3', type: 'mang_da', x: 13, y: 7, w: 2, h: 2, fx: 2, fy: 1 },
    { id: 'bm_tl_mang4', type: 'mang_da', x: 28, y: 8, w: 2, h: 2, fx: 2, fy: 1 },
    { id: 'bm_tl_rock1', type: 'rock_m', x: 6, y: 9, w: 1, h: 1, fx: 1, fy: 1 },
    { id: 'bm_tl_rock2', type: 'rock_s', x: 34, y: 5, w: 1, h: 1, fx: 1, fy: 1 },
    { id: 'bm_tl_reeds1', type: 'reeds', x: 6, y: 13, w: 2, h: 2, fx: 2, fy: 1 },
    { id: 'bm_tl_reeds2', type: 'reeds', x: 28, y: 18, w: 2, h: 2, fx: 2, fy: 1 },
    { id: 'bm_tl_mang5', type: 'mang_da', x: 34, y: 25, w: 2, h: 2, fx: 2, fy: 1 },
    { id: 'bm_tl_rock3', type: 'rock_s', x: 15, y: 24, w: 1, h: 1, fx: 1, fy: 1 });
  MAPS.bc_tapha.props.push(
    { id: 'bm_th_stele1', type: 'stele_small', x: 13, y: 4, w: 2, h: 2, fx: 2, fy: 1 },
    { id: 'bm_th_stele2', type: 'stele_small', x: 24, y: 4, w: 2, h: 2, fx: 2, fy: 1 },
    { id: 'bm_th_plat', type: 'stone_platform', x: 14, y: 7, w: 3, h: 2, fx: 3, fy: 1 },
    { id: 'bm_th_rock1', type: 'rock_s', x: 28, y: 7, w: 1, h: 1, fx: 1, fy: 1 },
    { id: 'bm_th_bones', type: 'bones', x: 31, y: 3, w: 2, h: 1, fx: 2, fy: 1 },
    { id: 'bm_th_rock2', type: 'rock_m', x: 6, y: 17, w: 1, h: 1, fx: 1, fy: 1 },
    { id: 'bm_th_stele3', type: 'stele_small', x: 33, y: 11, w: 2, h: 2, fx: 2, fy: 1 },
    { id: 'bm_th_rock3', type: 'rock_s', x: 24, y: 17, w: 1, h: 1, fx: 1, fy: 1 },
    { id: 'bm_th_bones2', type: 'bones', x: 34, y: 25, w: 2, h: 1, fx: 2, fy: 1 });
  MAPS.bc_tapsau.props.push(
    { id: 'bm_ts_lant1', type: 'lantern_low', x: 13, y: 5, w: 1, h: 2, fx: 1, fy: 1 },
    { id: 'bm_ts_lant2', type: 'lantern_low', x: 25, y: 5, w: 1, h: 2, fx: 1, fy: 1 },
    { id: 'bm_ts_stele1', type: 'stele_small', x: 12, y: 7, w: 2, h: 2, fx: 2, fy: 1 },
    { id: 'bm_ts_stele2', type: 'stele_small', x: 26, y: 7, w: 2, h: 2, fx: 2, fy: 1 },
    { id: 'bm_ts_bones', type: 'bones', x: 8, y: 3, w: 2, h: 1, fx: 2, fy: 1 },
    { id: 'bm_ts_rock1', type: 'rock_m', x: 32, y: 8, w: 1, h: 1, fx: 1, fy: 1 },
    { id: 'bm_ts_lant3', type: 'lantern_low', x: 34, y: 16, w: 1, h: 2, fx: 1, fy: 1 },
    { id: 'bm_ts_rock2', type: 'rock_s', x: 7, y: 13, w: 1, h: 1, fx: 1, fy: 1 });
  MAPS.bc_kiemtrung.props.push(
    { id: 'bm_kt_kiem1', type: 'kiem_cum', x: 8, y: 3, w: 2, h: 2, fx: 2, fy: 1 },
    { id: 'bm_kt_kiem2', type: 'kiem_cum', x: 36, y: 3, w: 2, h: 2, fx: 2, fy: 1 },
    { id: 'bm_kt_kiem3', type: 'kiem_cum', x: 13, y: 4, w: 2, h: 2, fx: 2, fy: 1 },
    { id: 'bm_kt_kiem4', type: 'kiem_cum', x: 31, y: 4, w: 2, h: 2, fx: 2, fy: 1 },
    { id: 'bm_kt_stele', type: 'stele', x: 16, y: 2, w: 2, h: 2, fx: 2, fy: 1 },
    { id: 'bm_kt_bones', type: 'bones', x: 39, y: 5, w: 2, h: 1, fx: 2, fy: 1 },
    { id: 'bm_kt_kiem5', type: 'kiem_cum', x: 19, y: 13, w: 2, h: 2, fx: 2, fy: 1 },
    { id: 'bm_kt_rock1', type: 'rock_s', x: 40, y: 14, w: 1, h: 1, fx: 1, fy: 1 },
    { id: 'bm_kt_kiem6', type: 'kiem_cum', x: 6, y: 20, w: 2, h: 2, fx: 2, fy: 1 },
    { id: 'bm_kt_kiem7', type: 'kiem_cum', x: 40, y: 22, w: 2, h: 2, fx: 2, fy: 1 },
    { id: 'bm_kt_bones2', type: 'bones', x: 15, y: 31, w: 2, h: 1, fx: 2, fy: 1 });
  MAPS.bc_kiemtrung_sau.props.push(
    { id: 'bm_kts_kiem1', type: 'kiem_cum', x: 15, y: 3, w: 2, h: 2, fx: 2, fy: 1 },
    { id: 'bm_kts_kiem2', type: 'kiem_cum', x: 27, y: 3, w: 2, h: 2, fx: 2, fy: 1 },
    { id: 'bm_kts_stele1', type: 'stele_small', x: 15, y: 8, w: 2, h: 2, fx: 2, fy: 1 },
    { id: 'bm_kts_stele2', type: 'stele_small', x: 27, y: 8, w: 2, h: 2, fx: 2, fy: 1 },
    { id: 'bm_kts_rock1', type: 'rock_s', x: 10, y: 20, w: 1, h: 1, fx: 1, fy: 1 },
    { id: 'bm_kts_kiem3', type: 'kiem_cum', x: 13, y: 27, w: 2, h: 2, fx: 2, fy: 1 },
    { id: 'bm_kts_kiem4', type: 'kiem_cum', x: 28, y: 26, w: 2, h: 2, fx: 2, fy: 1 });
  MAPS.bc_hoiphong_mo.props.push(
    { id: 'bm_hp_coffin1', type: 'quan_tai_da', x: 17, y: 4, w: 3, h: 2, fx: 3, fy: 1 },
    { id: 'bm_hp_coffin2', type: 'quan_tai_da', x: 30, y: 4, w: 3, h: 2, fx: 3, fy: 1 },
    { id: 'bm_hp_stele', type: 'stele', x: 44, y: 3, w: 2, h: 2, fx: 2, fy: 1 },
    { id: 'bm_hp_lant1', type: 'lantern_low', x: 14, y: 8, w: 1, h: 2, fx: 1, fy: 1 },
    { id: 'bm_hp_lant2', type: 'lantern_low', x: 36, y: 7, w: 1, h: 2, fx: 1, fy: 1 },
    { id: 'bm_hp_bones', type: 'bones', x: 45, y: 6, w: 2, h: 1, fx: 2, fy: 1 },
    { id: 'bm_hp_coffin3', type: 'quan_tai_da', x: 8, y: 15, w: 3, h: 2, fx: 3, fy: 1 },
    { id: 'bm_hp_rock1', type: 'rock_s', x: 45, y: 17, w: 1, h: 1, fx: 1, fy: 1 },
    { id: 'bm_hp_lant3', type: 'lantern_low', x: 15, y: 24, w: 1, h: 2, fx: 1, fy: 1 },
    { id: 'bm_hp_bones2', type: 'bones', x: 19, y: 26, w: 2, h: 1, fx: 2, fy: 1 },
    { id: 'bm_hp_stele2', type: 'stele_small', x: 44, y: 32, w: 2, h: 2, fx: 2, fy: 1 });
  MAPS.dai_dau_kiem.props.push(
    { id: 'bm_dd_cot1', type: 'cot_co', x: 8, y: 3, w: 1, h: 2, fx: 1, fy: 1 },
    { id: 'bm_dd_cot2', type: 'cot_co', x: 30, y: 3, w: 1, h: 2, fx: 1, fy: 1 },
    { id: 'bm_dd_cot3', type: 'cot_co', x: 8, y: 24, w: 1, h: 2, fx: 1, fy: 1 },
    { id: 'bm_dd_cot4', type: 'cot_co', x: 30, y: 24, w: 1, h: 2, fx: 1, fy: 1 },
    { id: 'bm_dd_bench1', type: 'bench_stone', x: 11, y: 5, w: 1, h: 1, fx: 1, fy: 1 },
    { id: 'bm_dd_bench2', type: 'bench_stone', x: 12, y: 5, w: 1, h: 1, fx: 1, fy: 1 },
    { id: 'bm_dd_bench3', type: 'bench_stone', x: 26, y: 5, w: 1, h: 1, fx: 1, fy: 1 },
    { id: 'bm_dd_bench4', type: 'bench_stone', x: 27, y: 5, w: 1, h: 1, fx: 1, fy: 1 },
    { id: 'bm_dd_fence1', type: 'fence_post', x: 2, y: 10, w: 1, h: 1, fx: 1, fy: 1 },
    { id: 'bm_dd_fence2', type: 'fence_post', x: 2, y: 14, w: 1, h: 1, fx: 1, fy: 1 },
    { id: 'bm_dd_fence3', type: 'fence_post', x: 2, y: 18, w: 1, h: 1, fx: 1, fy: 1 },
    { id: 'bm_dd_fence4', type: 'fence_post', x: 37, y: 10, w: 1, h: 1, fx: 1, fy: 1 },
    { id: 'bm_dd_fence5', type: 'fence_post', x: 37, y: 14, w: 1, h: 1, fx: 1, fy: 1 },
    { id: 'bm_dd_fence6', type: 'fence_post', x: 37, y: 18, w: 1, h: 1, fx: 1, fy: 1 },
    { id: 'bm_dd_plat', type: 'stone_platform', x: 18, y: 24, w: 3, h: 2, fx: 3, fy: 1 },
    { id: 'bm_dd_pot1', type: 'flower_pot', x: 13, y: 3, w: 1, h: 1, fx: 1, fy: 1 },
    { id: 'bm_dd_pot2', type: 'flower_pot', x: 26, y: 3, w: 1, h: 1, fx: 1, fy: 1 });
  MAPS.duong_mon.props.push(
    { id: 'bm_dm_cay', type: 'cay_gay', x: 38, y: 48, w: 1, h: 2, fx: 1, fy: 1 },
    { id: 'bm_dm_bones', type: 'bones', x: 48, y: 48, w: 2, h: 1, fx: 2, fy: 1 },
    { id: 'bm_dm_stake', type: 'stake_cluster', x: 37, y: 53, w: 1, h: 1, fx: 1, fy: 1 },
    { id: 'bm_dm_rock', type: 'rock_m', x: 48, y: 55, w: 1, h: 1, fx: 1, fy: 1 },
    { id: 'bm_dm_bush', type: 'bush2', x: 39, y: 56, w: 1, h: 1, fx: 1, fy: 1 },
    { id: 'bm_dm_bones2', type: 'bones', x: 42, y: 57, w: 2, h: 1, fx: 2, fy: 1 });
  MAPS.hb_valley.props.push(
    { id: 'bm_hb_rock1', type: 'rock_l_b', x: 41, y: 12, w: 1, h: 1, fx: 1, fy: 1 },
    { id: 'bm_hb_kiem1', type: 'kiem_cum', x: 44, y: 6, w: 2, h: 2, fx: 2, fy: 1 },
    { id: 'bm_hb_kiem2', type: 'kiem_cum', x: 49, y: 6, w: 2, h: 2, fx: 2, fy: 1 },
    { id: 'bm_hb_stele', type: 'stele_small', x: 57, y: 12, w: 2, h: 2, fx: 2, fy: 1 },
    { id: 'bm_hb_rock2', type: 'rock_m', x: 42, y: 18, w: 1, h: 1, fx: 1, fy: 1 },
    { id: 'bm_hb_bones', type: 'bones', x: 57, y: 16, w: 2, h: 1, fx: 2, fy: 1 },
    { id: 'bm_hb_rock3', type: 'rock_l_a', x: 47, y: 21, w: 1, h: 1, fx: 1, fy: 1 });
  /* Đợt cảnh vật hang — vòng 2 (mở rộng 04/11 theo lệnh Bui "cả cảnh
     trong hang cũng sinh động hơn"): cảnh vật dọc đường đi và các phòng
     thường của mọi bí cảnh, không dồn vào phòng boss — măng đá, tinh thể
     phát sáng (loại mới tinh_the), nấm phát sáng (loại mới
     nam_phat_sang), lau bờ suối, đèn đá, bia vụn, xương, đá vụn. Cùng
     kỷ luật footprint và kiểm vị trí như vòng 1. */
  MAPS.bc_thuyliem.props.push(
    { id: 'bm2_tl_mang6', type: 'mang_da', x: 16, y: 23, w: 2, h: 2, fx: 2, fy: 1 },
    { id: 'bm2_tl_rock4', type: 'rock_m', x: 26, y: 23, w: 1, h: 1, fx: 1, fy: 1 },
    { id: 'bm2_tl_bones', type: 'bones', x: 7, y: 29, w: 2, h: 1, fx: 2, fy: 1 },
    { id: 'bm2_tl_nam1', type: 'nam_phat_sang', x: 18, y: 30, w: 1, h: 1, fx: 1, fy: 1 },
    { id: 'bm2_tl_tinh1', type: 'tinh_the', x: 30, y: 22, w: 2, h: 2, fx: 2, fy: 1 },
    { id: 'bm2_tl_reeds3', type: 'reeds', x: 14, y: 13, w: 2, h: 2, fx: 2, fy: 1 },
    { id: 'bm2_tl_reeds4', type: 'reeds', x: 12, y: 18, w: 2, h: 2, fx: 2, fy: 1 },
    { id: 'bm2_tl_tinh2', type: 'tinh_the', x: 37, y: 8, w: 2, h: 2, fx: 2, fy: 1 },
    { id: 'bm2_tl_nam2', type: 'nam_phat_sang', x: 17, y: 3, w: 1, h: 1, fx: 1, fy: 1 });
  MAPS.bc_tapha.props.push(
    { id: 'bm2_th_bones3', type: 'bones', x: 12, y: 28, w: 2, h: 1, fx: 2, fy: 1 },
    { id: 'bm2_th_rock4', type: 'rock_s', x: 26, y: 27, w: 1, h: 1, fx: 1, fy: 1 },
    { id: 'bm2_th_lant1', type: 'lantern_low', x: 16, y: 25, w: 1, h: 2, fx: 1, fy: 1 },
    { id: 'bm2_th_lant2', type: 'lantern_low', x: 23, y: 25, w: 1, h: 2, fx: 1, fy: 1 },
    { id: 'bm2_th_stele4', type: 'stele_small', x: 5, y: 12, w: 2, h: 2, fx: 2, fy: 1 });
  MAPS.bc_tapsau.props.push(
    { id: 'bm2_ts_nam1', type: 'nam_phat_sang', x: 16, y: 24, w: 1, h: 1, fx: 1, fy: 1 },
    { id: 'bm2_ts_nam2', type: 'nam_phat_sang', x: 24, y: 24, w: 1, h: 1, fx: 1, fy: 1 },
    { id: 'bm2_ts_tinh1', type: 'tinh_the', x: 6, y: 2, w: 2, h: 2, fx: 2, fy: 1 },
    { id: 'bm2_ts_tinh2', type: 'tinh_the', x: 33, y: 3, w: 2, h: 2, fx: 2, fy: 1 },
    { id: 'bm2_ts_rock3', type: 'rock_m', x: 34, y: 24, w: 1, h: 1, fx: 1, fy: 1 });
  MAPS.bc_kiemtrung.props.push(
    { id: 'bm2_kt_kiem8', type: 'kiem_cum', x: 16, y: 18, w: 2, h: 2, fx: 2, fy: 1 },
    { id: 'bm2_kt_kiem9', type: 'kiem_cum', x: 30, y: 19, w: 2, h: 2, fx: 2, fy: 1 },
    { id: 'bm2_kt_rock2', type: 'rock_s', x: 12, y: 24, w: 1, h: 1, fx: 1, fy: 1 },
    { id: 'bm2_kt_rock3', type: 'rock_s', x: 34, y: 23, w: 1, h: 1, fx: 1, fy: 1 });
  MAPS.bc_kiemtrung_sau.props.push(
    { id: 'bm2_kts_kiem5', type: 'kiem_cum', x: 10, y: 16, w: 2, h: 2, fx: 2, fy: 1 },
    { id: 'bm2_kts_bones', type: 'bones', x: 36, y: 17, w: 2, h: 1, fx: 2, fy: 1 },
    { id: 'bm2_kts_rock2', type: 'rock_m', x: 20, y: 20, w: 1, h: 1, fx: 1, fy: 1 });
  MAPS.bc_hoiphong_mo.props.push(
    { id: 'bm2_hp_bones3', type: 'bones', x: 12, y: 35, w: 2, h: 1, fx: 2, fy: 1 },
    { id: 'bm2_hp_lant4', type: 'lantern_low', x: 44, y: 29, w: 1, h: 2, fx: 1, fy: 1 },
    { id: 'bm2_hp_stele3', type: 'stele_small', x: 12, y: 21, w: 2, h: 2, fx: 2, fy: 1 },
    { id: 'bm2_hp_nam1', type: 'nam_phat_sang', x: 6, y: 8, w: 1, h: 1, fx: 1, fy: 1 },
    { id: 'bm2_hp_nam2', type: 'nam_phat_sang', x: 45, y: 2, w: 1, h: 1, fx: 1, fy: 1 });
  // Điều kiện mở cổng — dữ kiện khai báo, không phải logic hiển thị:
  // không cond -> mở; 'dummy' -> đã phá cọc gỗ; 'flag:<tên>' -> cờ trong
  // state.flags; 'quest:<id>' -> nhiệm vụ hiện tại đã tới hoặc qua <id>
  // trong chuỗi QUESTS. Đây là điểm né online: điều kiện là dữ kiện thuần.
  function portalUnlocked(state, po) {
    if (!po || !po.cond) return true;
    if (!state) return false;
    if (po.cond === 'dummy') return !!(state.flags && state.flags.dummyBroken);
    if (po.cond.indexOf('flag:') === 0) return !!(state.flags && state.flags[po.cond.slice(5)]);
    if (po.cond.indexOf('quest:') === 0) {
      var want = po.cond.slice(6), ci = -1, wi = -1, i;
      for (i = 0; i < QUESTS.length; i++) {
        if (QUESTS[i].id === state.quest) ci = i;
        if (QUESTS[i].id === want) wi = i;
      }
      if (wi < 0) return true;
      if (ci < 0) return false;
      return ci >= wi;
    }
    return true;
  }
  var ACTIVE_MAP = 'tran';
  function activeMap() { return MAPS[ACTIVE_MAP]; }
  function activeMapId() { return ACTIVE_MAP; }
  function setActiveMap(id) { if (MAPS[id]) ACTIVE_MAP = id; return ACTIVE_MAP; }

  /* ---------------- Nhiệm vụ chính ---------------- */
  // Chuỗi bản v1: trắc linh → mở miệng → thổ nạp → đột phá → phá cọc gỗ.
  var QUESTS = [
    { id: 'q_trac', name: 'Ngày trắc linh căn', desc: 'Tới bia đá trắc linh ở sân Hứa gia, đặt tay lên bia (phím E).', hint: { x: 29, y: 18 } },
    { id: 'q_voice', name: 'Mười tám năm, một lời', desc: 'Đứng trước cả trấn, hãy cất tiếng lần đầu tiên.', hint: { x: 29, y: 18 } },
    { id: 'q_meditate', name: 'Thổ nạp đầu tiên', desc: 'Tới cạnh giếng nước đầu trấn, giữ phím T để thổ nạp, tích đủ 100 tu vi.', hint: { x: 50, y: 20 } },
    { id: 'q_break', name: 'Đột phá Luyện Khí tầng 1', desc: 'Tu vi đã đầy. Nhấn phím B để đột phá.', hint: null },
    { id: 'q_dummy', name: 'Một lời phá cọc', desc: 'Dùng Vạn Âm Cộng Hưởng "Phá Âm" (phím 1, cần 30 Tĩnh Âm) phá cọc gỗ luyện công ở phía nam sân.', hint: { x: 36, y: 32 } },
    { id: 'q_done', name: 'Lên đường dự kiểm trắc', desc: 'Cọc gỗ đã phá, lộ phí trưởng lão đã trao. Lên đường tới Cô Châu Thành dự kỳ kiểm trắc tại Kiểm Trắc Tháp.', hint: null },
    /* Chương 2 — lên đường (docs/part2-design.md mục 4) */
    { id: 'q2_len_duong', name: 'Lên đường tới Cô Châu Thành', desc: 'Ra cổng nam Hứa Gia Trấn, theo đường mòn xuyên rừng đi về phía nam.', hint: { map: 'tran', x: 29, y: 43 } },
    { id: 'q2_vet_tich', name: 'Dấu vết dọc đường', desc: 'Dừng ở trạm nghỉ giữa đường, đứng kề bao tải bên đường và xem dấu vết người đi trước để lại (phím E hoặc nút Tương tác).', hint: { map: 'duong_mon', x: 53, y: 24 } },
    { id: 'q2_phuc_kich', name: 'Bóng người trong rừng', desc: 'Đi tiếp về phía nam. Rừng càng lúc càng rậm — cẩn thận.', hint: { map: 'duong_mon', x: 43, y: 54 } },
    { id: 'q2_cong_thanh', name: 'Tới cổng Cô Châu Thành', desc: 'Cổng thành ở cuối đường. Tiến vào quảng trường cổng thành.', hint: { map: 'duong_mon', x: 48, y: 69 } },
    { id: 'q2_done', name: 'Chương 3: Kiểm Trắc Tháp', desc: 'Đã tới cổng Cô Châu Thành. Vào thành, đi thẳng phố chính lên phía bắc là tới Kiểm Trắc Tháp — kỳ kiểm trắc đang chờ ngươi.', hint: null },
    /* Chương 3 — Kiểm Trắc Tháp: thước pha lê vượt cửu phẩm */
    { id: 'q3_hang_cho', name: 'Hàng chờ trăm người', desc: 'Vào Cô Châu Thành, đi thẳng phố chính lên phía bắc, qua cổng tháp vào khuôn viên Kiểm Trắc Tháp.', hint: { map: 'co_chau', x: 51, y: 1 } },
    { id: 'q3_thuoc_do', name: 'Thước pha lê vượt cửu phẩm', desc: 'Vào sảnh tháp ở phía bắc khuôn viên, tới trước thước pha lê lớn và đặt tay lên thước (phím E).', hint: { map: 'thap_noi', x: 19, y: 7 } },
    { id: 'q3_cong_phap', name: 'Thanh Phong Chân Kinh', desc: 'Nói chuyện với chủ trì tháp trong sảnh để nhận phần thưởng của thước: tâm pháp và kiếm quyết.', hint: { map: 'thap_noi', x: 22, y: 9 } },
    { id: 'q3_done', name: 'Chương 4: Thiên Cơ Các tới nhà', desc: 'Thước pha lê đã tuyên Vô Cực Linh Căn. Tin tức sẽ lan nhanh — Thiên Cơ Các đang trên đường tới Hứa gia.', hint: null },
    /* Chương 4 — Thiên Cơ Các tới nhà: vụ vu cáo và hai đường giải quyết */
    { id: 'q4_thien_co', name: 'Thiên Cơ Các tới nhà', desc: 'Tới sân phủ Hứa gia trong thành (góc tây nam thành) — sứ giả Thiên Cơ Các đang chờ ở đó.', hint: { map: 'co_chau', x: 16, y: 37 } },
    { id: 'q4_vu_cao', name: 'Lời vu cáo', desc: 'Tới gặp Lục Tranh trong sân phủ Hứa — hắn đang chờ ngươi với một nụ cười không lành.', hint: { map: 'co_chau', x: 23, y: 36 } },
    { id: 'q4_dieu_tra', name: 'Tự tìm bằng chứng', desc: 'Kiểm tra kho Hứa gia ở rìa đông sân phủ và hỏi nhân chứng Lão Ngô ở phố chính để lật lại lời vu cáo.', hint: { map: 'co_chau', x: 26, y: 39 } },
    { id: 'q4_doi_chat', name: 'Lời của Thiên Cơ Các', desc: 'Tới trước Thiên Cơ Các phân đà ở phía nam thành, gặp Trần Chính Đạo nghe kết luận vụ việc.', hint: { map: 'co_chau', x: 56, y: 67 } },
    { id: 'q4_done', name: 'Chương 5: Trần gia và Hồn Sư', desc: 'Vụ vu cáo đã khép lại. Ở phía đông bắc thành, Trần gia đang gặp một chuyện liên quan tới thần hồn.', hint: null },
    /* Chương 5 — Trần gia và Hồn Sư thần bí */
    { id: 'q5_hon_su', name: 'Chuyện lạ ở Trần gia', desc: 'Tới sân Trần gia ở đông bắc thành, gặp Trần Tư Linh — nhà nàng đang gặp chuyện về thần hồn.', hint: { map: 'co_chau', x: 86, y: 15 } },
    { id: 'q5_tiep_suc', name: 'Tiếp sức cho U Nhàn', desc: 'Về sân phủ Hứa gặp Hứa U Nhàn: nàng sắp tỉ thí với Lục Tranh để phân định lại danh dự hai nhà.', hint: { map: 'co_chau', x: 16, y: 36 } },
    { id: 'q5_u_nhan_thang', name: 'Một trận tỉ thí đáng xem', desc: 'Tới chỗ Lục Tranh trong sân phủ Hứa để xem trận tỉ thí giữa U Nhàn và hắn.', hint: { map: 'co_chau', x: 23, y: 36 } },
    { id: 'q5_done', name: 'Chương 6: Năm mươi mốt vạn lượng', desc: 'Danh dự của U Nhàn đã được lấy lại. Nhưng một đám hỏi lớn đang trên đường tới Hứa gia.', hint: null },
    /* Chương 6 — Sính lễ 51 vạn lượng và đêm Huyết Bạc Cung tấn công */
    { id: 'q6_sinh_le', name: 'Sính lễ năm mươi vạn lượng', desc: 'Tới sân phủ Hứa: Chu Kiến Thâm đang mang sính lễ tới cầu hôn U Nhàn.', hint: { map: 'co_chau', x: 17, y: 37 } },
    { id: 'q6_phong_thu', name: 'Đêm phủ Hứa bị tấn công', desc: 'Gặp Hứa Chính Ngôn trong sân phủ: có tin kẻ lạ đang dò la quanh phủ Hứa sau vụ sính lễ.', hint: { map: 'co_chau', x: 13, y: 35 } },
    { id: 'q6_thu_moi', name: 'Thư mời lên Thanh Vân Tông', desc: 'Nhận thư mời nhập môn từ Hứa Chính Ngôn — cánh cửa Thanh Vân Tông đang mở.', hint: { map: 'co_chau', x: 13, y: 35 } },
    { id: 'q6_done', name: 'Chương 7: Nhập Thanh Vân Tông', desc: 'Thư mời đã trong tay. Cổng lên Thanh Vân Tông ở đông bắc thành đã mở cho ngươi.', hint: { map: 'thanh_van_tong', x: 60, y: 27 } },
    /* Chương 7 — Vào Thanh Vân Tông với thân phận vô linh căn */
    { id: 'q7_nhap_tong', name: 'Vào tông với thân phận vô linh căn', desc: 'Tới gặp trưởng lão tông ở Thanh Vân Đại Điện, trình thư mời nhập môn.', hint: { map: 'thanh_van_tong', x: 60, y: 27 } },
    { id: 'q7_tap_dich', name: 'Việc tạp dịch', desc: 'Làm ba việc ở khu tạp dịch đông nam: bổ củi, gánh nước, chuyển bao dược, xong về gặp quản sự tạp dịch.', hint: { map: 'thanh_van_tong', x: 97, y: 69 } },
    { id: 'q7_thang_long', name: 'Thăng Long Đạo', desc: 'Từ thềm thang của tông môn, lên Đài Thăng Long trên đỉnh núi, thắng hình chiếu bằng đúng ba chiêu kiếm, không dùng cộng hưởng.', hint: { map: 'thang_long_dai', x: 15, y: 9 } },
    { id: 'q7_hoa_huong_than', name: 'Hoa Hướng Thần', desc: 'Gặp đại đệ tử Hoa Hướng Thần ở quảng trường tông.', hint: { map: 'thanh_van_tong', x: 62, y: 56 } },
    { id: 'q7_done', name: 'Chương 8: Chuẩn bị Trúc Cơ', desc: 'Vị thế trong tông đã đổi. Kỳ Trúc Cơ của tông đang tới gần.', hint: null },
    /* Chương 8 — Trúc Cơ: lời nói đầu tiên ở tầm cao mới */
    { id: 'q8_chuan_bi', name: 'Chuẩn bị Trúc Cơ', desc: 'Gặp trưởng lão tông nhận công thức Trúc Cơ Đan: Linh Chi Sau Núi một cây, Yêu Đan cấp 1 một viên, Thanh Tâm Thảo ba cây và 30 Linh Thạch — trưởng lão sẽ luyện đan cho ngươi.', hint: { map: 'thanh_van_tong', x: 60, y: 27 } },
    { id: 'q8_ho_phap', name: 'Hộ pháp trong im lặng', desc: 'Lên Đài Trúc Cơ ở phía bắc tông bắt đầu vận công; trong lúc đột phá, tuyệt đối không được cất tiếng.', hint: { map: 'thanh_van_tong', x: 60, y: 6 } },
    { id: 'q8_truc_co', name: 'Trúc Cơ', desc: 'Vận công đã tới điểm cuối. Nuốt Trúc Cơ Đan và đột phá tại Đài Trúc Cơ.', hint: { map: 'thanh_van_tong', x: 60, y: 6 } },
    { id: 'q8_thu_tieng', name: 'Gạch bỏ hai chữ vô linh căn', desc: 'Về đại điện gặp trưởng lão tông.', hint: { map: 'thanh_van_tong', x: 60, y: 27 } },
    { id: 'q8_done', name: 'Trúc Cơ Sơ Kỳ', desc: 'Ngươi đã đứng ở Trúc Cơ Sơ Kỳ. Những món nợ cũ vẫn còn đó: Huyết Bạc Cung chưa dứt, thân phận Hồn Sư còn giấu kín, Thiên Cơ Các còn theo dõi, và Liễu Khuynh Tiên vẫn là một ẩn số.', hint: null },
    /* Chương 9 — Tin dữ từ Thung Lũng Hồi Phong: đoàn xe Hứa gia bị phục kích */
    { id: 'q9_tin_du', name: 'Tin dữ từ sau núi', desc: 'Người đưa tin của Hứa gia đang chờ ở Thanh Vân Đại Điện — đoàn xe thuốc của nhà họ Hứa gặp nạn ở Thung Lũng Hồi Phong, sau núi tông môn.', hint: { map: 'thanh_van_tong', x: 60, y: 27 } },
    { id: 'q9_truy_vet', name: 'Truy vết ở thung lũng', desc: 'Qua cổng sau núi vào Thung Lũng Hồi Phong, tới gốc anh đào cổ thụ ở bãi đáp đầu thung lũng, xem xét dấu vết đoàn xe để lại.', hint: { map: 'hb_valley', x: 47, y: 59 } },
    { id: 'q9_phuc_kich', name: 'Phục kích trong hẻm núi', desc: 'Lần theo dấu vết vào hẻm núi giữa thung lũng — Huyết Bạc Cung đang chờ sẵn trong đó.', hint: { map: 'hb_valley', x: 49, y: 36 } },
    { id: 'q9_doi_dau', name: 'Đối đầu dưới gốc anh đào', desc: 'Đoàn xe đã an toàn. Trở lại gốc anh đào cổ thụ ở bãi đáp — người của Huyết Bạc Cung còn điều muốn nói với ngươi.', hint: { map: 'hb_valley', x: 47, y: 59 } },
    { id: 'q9_done', name: 'Trúc Cơ Trung Kỳ', desc: 'Ngươi đã đứng ở Trúc Cơ Trung Kỳ. Cái tên Giang Trường Không và vụ bến đò năm xưa vừa được gieo xuống như hai hạt giống — chúng sẽ nảy mầm ở nơi ngươi không ngờ nhất.', hint: null },
    /* Chương 10 — Tĩnh Quan Lâu: Thiên Cơ Các siết bí mật */
    { id: 'q10_loi_moi', name: 'Lời mời của Thiên Cơ Các', desc: 'Thư mời của Trần Chính Đạo đã tới: phân đà Thiên Cơ Các ở phía nam Cô Châu Thành chờ ngươi tại Tĩnh Quan Lâu.', hint: { map: 'co_chau', x: 56, y: 67 } },
    { id: 'q10_vao_lau', name: 'Vào Tĩnh Quan Lâu', desc: 'Vào Tĩnh Quan Lâu, lên phòng kín phía bắc gặp người của Thiên Cơ Các.', hint: { map: 'thien_co_lau', x: 32, y: 8 } },
    { id: 'q10_siet_bi_mat', name: 'Hồ sơ xếp theo năm tháng', desc: 'Người của Thiên Cơ Các đã bày sẵn hồ sơ về ngươi. Nghe họ nói hết — và liệu mà giữ mình.', hint: { map: 'thien_co_lau', x: 32, y: 12 } },
    { id: 'q10_lo_than_phan', name: 'Điều không thể giấu mãi', desc: 'Bí mật về thần hồn không thể giấu thêm được nữa. Dù bằng cách nào, nó cũng sẽ lộ ra trong hôm nay.', hint: null },
    { id: 'q10_done', name: 'Trúc Cơ Hậu Kỳ', desc: 'Ngươi đã đứng ở Trúc Cơ Hậu Kỳ. Thân phận Hồn Sư không còn là bí mật tuyệt đối — từ nay, sống cùng nó thế nào là lựa chọn của ngươi.', hint: null },
    /* Chương 11 — Hệ quả và lựa chọn của Hứa U Nhàn */
    { id: 'q11_he_qua', name: 'Sống cùng sự thật', desc: 'Về Thanh Vân Đại Điện gặp trưởng lão tông: tông môn cần biết ngươi đứng ở đâu sau khi thân phận Hồn Sư lộ ra.', hint: { map: 'thanh_van_tong', x: 60, y: 27 } },
    { id: 'q11_u_nhan', name: 'Người tới từ Hứa gia', desc: 'Hứa U Nhàn đang ở sân phủ Hứa tại Cô Châu Thành — nàng có chuyện của riêng nàng muốn nói.', hint: { map: 'co_chau', x: 16, y: 36 } },
    { id: 'q11_chuan_bi_ket_dan', name: 'Chuẩn bị Kết Đan', desc: 'Trưởng lão tông giao việc chuẩn bị Kết Đan: hái dược dẫn ở bãi bắc Thung Lũng Hồi Phong và tích đủ tu vi Trúc Cơ Viên Mãn.', hint: { map: 'thanh_van_tong', x: 60, y: 27 } },
    { id: 'q11_vat_dan', name: 'Luyện vật dẫn Kết Đan', desc: 'Mang dược dẫn và Yêu Đan cấp 2 về đại điện: trưởng lão sẽ luyện vật dẫn Kết Đan cho ngươi.', hint: { map: 'thanh_van_tong', x: 60, y: 27 } },
    { id: 'q11_done', name: 'Sẵn sàng Kết Đan', desc: 'Vật dẫn đã trong tay, tu vi đã đầy. Chỉ còn chờ ngày lên đài.', hint: null },
    /* Chương 12 — Kết Đan: Vạn Âm Cộng Hưởng thành bậc Hưởng */
    { id: 'q12_len_dai', name: 'Lên Đài Trúc Cơ lần nữa', desc: 'Lên Đài Trúc Cơ ở phía bắc tông — lần này là để Kết Đan.', hint: { map: 'thanh_van_tong', x: 60, y: 6 } },
    { id: 'q12_ho_phap', name: 'Hộ pháp lúc Kết Đan', desc: 'Địch sẽ tới đúng thời khắc quyết định. Những người hộ pháp cho ngươi đang giữ các hướng quanh đài.', hint: { map: 'thanh_van_tong', x: 60, y: 6 } },
    { id: 'q12_ket_dan', name: 'Kết Đan', desc: 'Vận công đã chín. Nuốt vật dẫn và Kết Đan tại đài.', hint: { map: 'thanh_van_tong', x: 60, y: 6 } },
    { id: 'q12_lenh_dau_tien', name: 'Dạy cách nghe', desc: 'Kim Đan đã thành, tai nghe của ngươi đã sâu tới bậc Hưởng. Học cách nghe sóng đứng và độ lệch tần ngay tại đài — thử Định Âm và Phong Âm như trưởng lão dạy.', hint: { map: 'thanh_van_tong', x: 60, y: 6 } },
    { id: 'q12_done', name: 'Kim Đan Sơ Kỳ', desc: 'Ngươi đã đứng ở Kim Đan Sơ Kỳ. Tai nghe của ngươi từ nay chạm tới bậc Hưởng — và món nợ mười hai năm bắt đầu được tính từ đây.', hint: null },
    /* Cung IV — Chương 13: Vị thế mới ở sơn môn (docs/arc-iv-detail/13.md) */
    { id: 'q13_tro_lai_tong', name: 'Trở lại sơn môn', desc: 'Về Thanh Vân Đại Điện gặp trưởng lão tông: tông môn sắp xếp lại vị thế cho ngươi sau Kết Đan.', hint: { map: 'thanh_van_tong', x: 60, y: 27 } },
    { id: 'q13_de_nghi', name: 'Đề nghị danh phận', desc: 'Nghe trưởng lão đề nghị vị trí có danh phận trong tông; trả lời bằng chữ viết.', hint: { map: 'thanh_van_tong', x: 60, y: 27 } },
    { id: 'q13_thinh_cau_dau', name: 'Thỉnh cầu đầu tiên', desc: 'Một nhà thế lực ngoài tông gửi thỉnh cầu "mượn lệnh" qua người đưa tin ở sơn môn.', hint: { map: 'thanh_van_tong', x: 61, y: 88 } },
    { id: 'q13_ve_thanh', name: 'Xuống thành gặp U Nhàn', desc: 'Tới sân phủ Hứa ở Cô Châu Thành: U Nhàn đang tiếp quản việc đối ngoại của Hứa gia.', hint: { map: 'co_chau', x: 16, y: 36 } },
    { id: 'q13_done', name: 'Chương 14: Những lời thỉnh cầu', desc: 'Vị thế mới đã định, thỉnh cầu đầu tiên đã tới.', hint: null },
    /* Cung IV — Chương 14: Hai thỉnh cầu cùng một ngày (docs/arc-iv-detail/14.md) */
    { id: 'q14_hai_thinh_cau', name: 'Hai thỉnh cầu', desc: 'Hai nhà thế lực cùng gửi thỉnh cầu mượn lệnh (tranh đất linh; tranh hôn sự).', hint: { map: 'thanh_van_tong', x: 60, y: 27 } },
    { id: 'q14_dieu_tra', name: 'Đi đường chứng cứ', desc: 'Xuống thành điều tra vụ tranh đất linh bằng sổ sách và người làm chứng (đường chữ viết).', hint: { map: 'co_chau', x: 26, y: 39 } },
    { id: 'q14_tu_choi', name: 'Từ chối cả hai', desc: 'Trả lời cả hai nhà bằng chữ viết, kèm cách giải quyết không cần lệnh.', hint: { map: 'thanh_van_tong', x: 60, y: 27 } },
    { id: 'q14_bao_lanh', name: 'Đoàn thương của Hứa gia', desc: 'U Nhàn bảo lãnh một đoàn thương nhân bị ép giá; hỗ trợ nàng ở phủ thành.', hint: { map: 'co_chau', x: 75, y: 35 } },
    { id: 'q14_done', name: 'Chương 15: Trận loạn sóng', desc: 'Hai thỉnh cầu đã khép; tin về một trận pháp lạ nhắm vào đoàn đệ tử tông.', hint: null },
    /* Cung IV — Chương 15: Trận loạn sóng (docs/arc-iv-detail/15.md) */
    { id: 'q15_bao_dong', name: 'Tin báo động', desc: 'Tới điểm hẹn của đoàn đệ tử tông đang bị vây thử trận loạn sóng.', hint: { map: 'duong_mon', x: 47, y: 38 } },
    { id: 'q15_cuu_doan', name: 'Phá trận không dùng cộng hưởng', desc: 'Giải vây bằng kiếm quyết và công pháp — điều kiện truyện: không dùng Vạn Âm Cộng Hưởng trong trận này.', hint: null },
    { id: 'q15_truy_duoi', name: 'Truy kẻ chỉ huy', desc: 'Truy theo kẻ chỉ huy đợt thử trận vừa rút.', hint: { map: 'duong_mon', x: 43, y: 54 } },
    { id: 'q15_bao_cao', name: 'Báo cáo sơn môn', desc: 'Về đại điện báo cáo; tông quyết định đối sách với pháp khí loạn sóng.', hint: { map: 'thanh_van_tong', x: 60, y: 27 } },
    { id: 'q15_done', name: 'Chương 16: Tĩnh tu', desc: 'Trận loạn sóng đã lui; sơn môn cho ngươi một đợt tĩnh tu.', hint: null },
    /* Cung IV — Chương 16: Tĩnh tu và lĩnh ngộ (docs/arc-iv-detail/16.md) */
    { id: 'q16_tinh_tu', name: 'Tĩnh tu ở điểm linh khí', desc: 'Thổ nạp tại điểm linh khí tông tới đầy giai đoạn Sơ Kỳ.', hint: { map: 'thanh_van_tong', x: 31, y: 61 } },
    { id: 'q16_linh_ngo', name: 'Lĩnh ngộ khung Huyền', desc: 'Trong tĩnh tu, tâm pháp chạm ngưỡng lĩnh ngộ mới.', hint: null },
    { id: 'q16_benh_vuc', name: 'Người đứng ra nói thay', desc: 'Liễu Khuynh Tiên công khai bênh vực cách tông môn đang dùng người, trước mặt các trưởng lão.', hint: { map: 'thanh_van_tong', x: 60, y: 27 } },
    { id: 'q16_dot_pha', name: 'Đột phá Kim Đan Trung Kỳ', desc: 'Đột phá tại đài tông khi tu vi đã đầy.', hint: { map: 'thanh_van_tong', x: 60, y: 6 } },
    { id: 'q16_done', name: 'Chương 17: Tin từ tháp', desc: 'Trung Kỳ đã thành; một tin từ Kiểm Trắc Tháp ở thành làm ngươi phải xuống núi.', hint: null },
    /* Cung IV — Chương 17: Vết nứt ở tháp (docs/arc-iv-detail/17.md) */
    { id: 'q17_tin_tu_thap', name: 'Tin từ Kiểm Trắc Tháp', desc: 'Trần Tư Linh báo tin: ở Kiểm Trắc Tháp, một người dân thường bị xử ép vì thước không hiện màu cho con ông ta — và Hứa Di Ninh đã đứng ra cãi ngay tại sảnh. Tới khuôn viên tháp xem đầu đuôi.', hint: { map: 'kiem_trac_thap', x: 32, y: 13 } },
    { id: 'q17_do_lai', name: 'Việc đo lại', desc: 'Vào sảnh tháp: buổi đo lại cho cậu bé bị phán vô căn được tổ chức trước chứng kiến. Giữ trật tự buổi đo — và để mắt tới thước pha lê.', hint: { map: 'thap_noi', x: 19, y: 7 } },
    { id: 'q17_chat_van', name: 'Người của tháp chất vấn', desc: 'Buổi đo lại vừa xong, chấp sự tháp quay sang chất vấn tư cách can thiệp của Hứa Di Ninh. Ở lại sảnh nghe cho hết.', hint: { map: 'thap_noi', x: 22, y: 9 } },
    { id: 'q17_di_ninh', name: 'Nói chuyện với Di Ninh', desc: 'Di Ninh đang chờ ở khuôn viên tháp. Có những lời nàng chưa từng nói với ai — hôm nay nàng muốn nói với ngươi.', hint: { map: 'kiem_trac_thap', x: 32, y: 13 } },
    { id: 'q17_done', name: 'Chương 18: Cả vùng chờ một lệnh', desc: 'Thước đã đứng yên, một đứa trẻ đã có lại cơ hội của nó, và trong lòng Hứa Di Ninh, một vết nứt nhỏ vừa mở ra trên thứ nàng tin mười mấy năm.', hint: null },
    /* Cung IV — Chương 18: Cả vùng chờ một lệnh (docs/arc-iv-detail/18.md) */
    { id: 'q18_tranh_chap', name: 'Vụ tranh chấp hai nhà', desc: 'Tạ gia và Đỗ gia tranh quyền khai thác một mạch linh tuyền ở rìa thành, việc đã tới phủ thành mà quan phủ không xử nổi. Hai nhà đều đang chờ ngươi tới.', hint: { map: 'co_chau', x: 51, y: 30 } },
    { id: 'q18_ap_luc', name: 'Áp lực mượn lệnh', desc: 'Một phía muốn gặp riêng ngươi với một lời hứa rất nặng. Phía còn lại muốn thử sức ngươi bằng một trận đấu công khai trước dân thành. Cả hai việc đều nằm trong nhiệm vụ này.', hint: { map: 'co_chau', x: 51, y: 30 } },
    { id: 'q18_chung_cu', name: 'Gom chứng cứ', desc: 'Trước phiên phân xử, tự tay gom chứng cứ: sổ sách của nhà ghi chép mạch tuyền, lời của người giữ đập, sổ thuế của phủ. Đừng mong một đáp án sạch — việc này khó chính vì thế.', hint: { map: 'co_chau', x: 75, y: 35 } }, // ô đứng cạnh người bán chợ cho_a (75,34): hint không được trùng ô NPC tĩnh (ghim hint reachable tính NPC là vật cản) — phân xử điều phối đợt 2
    { id: 'q18_cho_phien', name: 'Tới phiên phân xử', desc: 'Hai nhà đã cam kết giữ hòa và ngồi vào phiên phân xử. Tới phủ thành, có mặt trước khi phiên mở.', hint: { map: 'co_chau', x: 51, y: 30 } },
    { id: 'q18_done', name: 'Chương 19: Lệnh không cho mượn', desc: 'Ngươi thắng một trận công khai mà không cất một lời nào — và cả vùng càng chờ lệnh của ngươi hơn trước. Phiên phân xử ở ngay trước mặt.', hint: null },
    /* Cung IV — Chương 19: Lệnh không cho mượn (docs/arc-iv-detail/19.md) */
    { id: 'q19_phan_xu', name: 'Phân xử bằng chữ viết', desc: 'Phiên phân xử mở tại phủ thành. Cả vùng chờ ngươi cất một lệnh — ngươi sẽ trình một bản án bằng chữ viết, dựng trên chứng cứ đã gom.', hint: { map: 'co_chau', x: 51, y: 30 } },
    { id: 'q19_phan_ung', name: 'Phía thua quay lưng', desc: 'Án đã tuyên. Phía thua không phục — và đoàn nhân chứng đang rời phủ qua phố nam về phía cổng thành. Đi theo họ. Ngay bây giờ.', hint: { map: 'co_chau', x: 51, y: 73 } },
    { id: 'q19_vet_ran', name: 'Dấu hiệu đáng ngờ', desc: 'Đưa nhân chứng về tới cổng thành an toàn. Nhưng ở ngoài cổng, có một cuộc gặp không nên xảy ra đang diễn ra — xem cho rõ rồi hãy đi.', hint: { map: 'co_chau', x: 51, y: 74 } },
    { id: 'q19_an_dinh', name: 'Ấn định hậu quả', desc: 'Về đại điện Thanh Vân Tông báo cáo lại toàn bộ vụ việc: tông môn cần ấn định cách ứng xử với phía thù địch từ nay.', hint: { map: 'thanh_van_tong', x: 60, y: 27 } },
    { id: 'q19_done', name: 'Chương 20: Rạn nứt trong các', desc: 'Quy tắc đã tuyên trước mặt tất cả: lệnh của ngươi không cho mượn. Và ở ngoài cổng thành, một vết rạn mới vừa mở về phía Huyết Bạc Cung.', hint: null },
    /* Cung IV — Chương 20: Rạn nứt trong các (docs/arc-iv-detail/20.md) */
    { id: 'q20_ran_nut', name: 'Tin rạn nứt', desc: 'Bên trong Thiên Cơ Các có rạn nứt — và hồ sơ của ngươi là một trong những vết rạn ấy. Tới Tĩnh Quan Lâu nghe cho rõ đầu đuôi.', hint: { map: 'thien_co_lau', x: 32, y: 8 } },
    { id: 'q20_bao_tin', name: 'Người báo tin', desc: 'Có người đang chờ báo cho ngươi một tin không viết được vào thư: đề xuất "quản thúc mềm" của Bạch Kính Đường. Điểm hẹn ở khách điếm Vọng Châu trong thành.', hint: { map: 'co_chau', x: 69, y: 27 } },
    { id: 'q20_giam_sat', name: 'Quản thúc mềm', desc: 'Người của Bạch Kính Đường đã xuất hiện công khai quanh thành và tông: ghi chép đoàn ra vào, đứng xem ở những chỗ ai cũng thấy. Đi một vòng qua cổng thành và để ý cho kỹ.', hint: { map: 'co_chau', x: 51, y: 73 } },
    { id: 'q20_doi_sach', name: 'Đối sách của ngươi', desc: 'Về Tĩnh Quan Lâu đưa lời đáp của ngươi cho Thiên Cơ Các. Nhưng trước đó, ở tông môn, một ca chữa hồn công khai đang chờ — và ca này sẽ không yên ổn như mọi ca trước.', hint: { map: 'thien_co_lau', x: 32, y: 8 } },
    { id: 'q20_done', name: 'Chương 21: Mở đầu chương 21', desc: 'Tư cách Hồn Sư của ngươi đã được ghi nhận chính thức — phẩm hồn 4, dịch vụ hồn cấp tông môn mở. Và lời đáp của ngươi đã tới Thiên Cơ Các: nguyên tắc không cho mượn, áp cả với các.', hint: null },
    /* Cung IV — Chương 21: Người thay mặt nhà họ Hứa (docs/arc-iv-detail/21.md) */
    { id: 'q21_doan_thuong', name: 'Đoàn thương bị ép giá', desc: 'Đoàn thương nhân được Hứa U Nhàn bảo lãnh đang bị các nhà buôn trong thành ép giá đồng loạt ở chợ Cô Châu. Nàng đã có mặt ở đó từ trước — nàng đang làm việc, không chờ ai tới cứu.', hint: { map: 'co_chau', x: 76, y: 35 } }, // ô đứng phía nam của điểm neo chợ (76,34): hint không được trùng ô NPC đích đứng (ghim hint reachable tính NPC là vật cản) — tự kiểm đợt 3
    { id: 'q21_so_sach', name: 'Sổ sách và luật thành', desc: 'Cùng U Nhàn đối chiếu sổ sách ở phủ Hứa: giá niêm yết của phủ và sổ thuế ba năm là thứ vũ khí của nàng. Phần của ngươi là việc chân tay — lấy sổ, mời người làm chứng giá, giữ hồ sơ.', hint: { map: 'co_chau', x: 16, y: 36 } },
    { id: 'q21_doi_chat', name: 'Đối chất ở phủ thành', desc: 'U Nhàn trình hồ sơ đối chất ở phủ thành. Còn ngươi — theo lời nàng dặn — ra cổng thành đứng giữ đoàn hàng: nếu phía ép giá thua lý, chúng sẽ đánh vào hàng thật.', hint: { map: 'co_chau', x: 51, y: 74 } },
    { id: 'q21_danh_gia', name: 'Lời nhìn nhận', desc: 'Về sân phủ Hứa. Sau trận đối chất, Hứa Chính Ngôn có một lời phải nói trước mặt người nhà và đoàn thương.', hint: { map: 'co_chau', x: 16, y: 36 } },
    { id: 'q21_done', name: 'Chương 22: Đột phá trước chuyến đi', desc: 'Hứa U Nhàn đã thắng bằng chính nghề của nàng, và Hứa gia đã công khai nhìn nhận nàng. +150 tu vi sự kiện. Việc tông đợt 3 (dải Kim Đan) mở từ đây.', hint: null },
    /* Cung IV — Chương 22: Đột phá trước chuyến đi (docs/arc-iv-detail/22.md) */
    { id: 'q22_tham_bao', name: 'Thám báo trận loạn sóng', desc: 'Thám báo của tông về tới đại điện với một tin nặng: Huyết Bạc Cung đã dựng xong một trận loạn sóng hoàn chỉnh quanh tuyến hộ tống sắp tới. Nghe trình bày ở đại điện, rồi tự ra vành tuyến xác minh bằng mắt của ngươi.', hint: { map: 'thanh_van_tong', x: 60, y: 27 } },
    { id: 'q22_tich_luy', name: 'Tích lũy cuối chặng', desc: 'Trước chuyến đi lớn đầu tiên của thời Kim Đan: thổ nạp tại điểm linh khí tông và làm nốt việc tông còn thiếu, cho đầy giai đoạn Kim Đan Trung Kỳ.', hint: { map: 'thanh_van_tong', x: 60, y: 27 } },
    { id: 'q22_nhan_viec', name: 'Nhận việc hộ tống', desc: 'Tới điểm rơi cổng tông nhận đoàn hộ tống — người và vật tư của tông đi việc lớn ở thành — và tự tay phân công các hướng giữ đoàn cho chuyến đi.', hint: { map: 'thanh_van_tong', x: 61, y: 88 } },
    { id: 'q22_dot_pha', name: 'Đột phá Kim Đan Hậu Kỳ', desc: 'Tu vi đã đầy giai đoạn Trung Kỳ. Lên đài tông đột phá Kim Đan Hậu Kỳ (3,2) — giai đoạn trong đại cảnh giới: không thiên kiếp, không tuyên cáo.', hint: { map: 'thanh_van_tong', x: 60, y: 6 } },
    { id: 'q22_done', name: 'Chương 23: Vòng vây loạn sóng', desc: 'Kim Đan Hậu Kỳ đã thành, đoàn hộ tống đã nhận, các hướng giữ đoàn đã phân công xong. +250 tu vi sự kiện của chương đã trả trước mốc đột phá. Chỉ còn chờ ngày đoàn lên đường.', hint: null },
    /* Cung IV — Chương 23: Vòng vây loạn sóng (docs/arc-iv-detail/23.md) */
    { id: 'q23_ho_tong', name: 'Đoàn lên đường', desc: 'Đoàn hộ tống lên đường từ cổng tông, qua đường mòn tới trạm nghỉ. Đội hình giữ đúng phân công ngươi đã chốt ở chương 22 — và lần đầu ngươi thấy rõ mặt từng người sẽ đi cùng ngươi vào đoạn đường ấy.', hint: { map: 'duong_mon', x: 53, y: 24 } },
    { id: 'q23_vong_vay', name: 'Trận khép vòng', desc: 'Đoạn đường giữa hai vách đá. Vòng trận loạn sóng hoàn chỉnh khép lại quanh đoàn: trong vùng trận, cộng hưởng bị nhiễu tới mức khóa sóng không tới — thắng bằng kiếm và công pháp. Phá các mắt trận ven đường để giữ vùng nhiễu không phủ kín đoàn.', hint: { map: 'duong_mon', x: 44, y: 45 } }, // ô (44,44) của prep bị gốc thông cay_r44_43 chiếm footprint — dời 1 ô xuống (44,45), vẫn trong vùng trận 41..47 — tự kiểm đợt 3
    { id: 'q23_huong_sup', name: 'Một hướng sụp', desc: 'Địch dồn quân số áp đảo vào hướng mỏng nhất của đoàn — chính hướng ngươi đã phân công người giữ ở chương 22. Người giữ hướng ấy đang bị thương nặng. Đoàn phải co cụm về mỏm đá ở rìa vùng trận.', hint: { map: 'duong_mon', x: 44, y: 45 } }, // dời khỏi (44,44) như q23_vong_vay — tự kiểm đợt 3
    { id: 'q23_lua_chon', name: 'Lựa chọn ở mỏm đá', desc: 'Ở mỏm đá ngoài vùng trận, sóng khóa được trở lại. Người bị thương nặng cần được giữ mạng ngay — và một đòn bậc Hưởng từ đây sẽ phá thế vây cho cả hướng đã sụp, trước hàng trăm nhân chứng.', hint: null },
    { id: 'q23_done', name: 'Chương 24: Manh mối cứng đầu tiên', desc: 'Lựa chọn đã định. Chương 24 mở ngay tại chỗ, không về hub. +200 tu vi sự kiện.', hint: null },
    /* Cung IV — Chương 24: Manh mối cứng đầu tiên (docs/arc-iv-detail/24.md) */
    { id: 'q24_lenh_cuu_nguoi', name: 'Đòn bậc Hưởng cứu người', desc: 'Vòng vây sắp vỡ. Theo lựa chọn của ngươi ở mỏm đá: hoặc phát đòn bậc Hưởng cứu người giữ hướng trước hàng trăm nhân chứng, hoặc dẫn đoàn đánh xuyên ra bằng kiếm trong thế yếu.', hint: { map: 'duong_mon', x: 44, y: 45 } }, // dời khỏi (44,44) như q23_vong_vay — tự kiểm đợt 3
    { id: 'q24_tha_mang', name: 'Kẻ bị bỏ lại', desc: 'Sau trận, ở mép đoạn đường: Mạc Cửu U — người điều trận của Huyết Bạc Cung — trọng thương và bị chính người của hắn bỏ lại khi rút. Hắn đang chờ một lời kết liễu.', hint: { map: 'duong_mon', x: 44, y: 45 } }, // ô đứng kề đông của Mạc Cửu U tiêm ở (43,45); dời khỏi (44,44) như q23_vong_vay — tự kiểm đợt 3
    { id: 'q24_manh_moi', name: 'Cái tên trong hồ sơ', desc: 'Kẻ bị bỏ rơi ấy vừa thốt ra một điều về vụ bến đò năm xưa. Nghe cho hết — đây là manh mối cứng đầu tiên sau mười hai năm.', hint: { map: 'duong_mon', x: 44, y: 45 } }, // ô đứng kề Mạc Cửu U như q24_tha_mang — tự kiểm đợt 3
    { id: 'q24_len_duong', name: 'Chuẩn bị lên đường', desc: 'Về đại điện tông báo cáo vụ việc và sắp xếp hành trình sông Bạc, rồi xuống thành từ biệt Hứa U Nhàn — nàng giờ đã là người thay mặt Hứa gia.', hint: { map: 'thanh_van_tong', x: 60, y: 27 } },
    { id: 'q24_done', name: 'Kết thúc cung IV', desc: 'Cung IV khép lại ở Kim Đan Hậu Kỳ, tu vi giai đoạn 450/1.200. +250 tu vi sự kiện của chương. Cổng cung V mở từ mốc này: hành trình sông Bạc và cái tên trong hồ sơ của Thiên Cơ Các.', hint: null }
  ];
  function questById(id) {
    for (var i = 0; i < QUESTS.length; i++) if (QUESTS[i].id === id) return QUESTS[i];
    return null;
  }
  function nextQuest(id) {
    for (var i = 0; i < QUESTS.length - 1; i++) if (QUESTS[i].id === id) return QUESTS[i + 1].id;
    return id;
  }

  /* ---------------- Trạng thái nhân vật ---------------- */
  function newCharacter(name, gender) {
    return {
      name: name || 'Giang Phàm',
      gender: gender === 'nu' ? 'nu' : 'nam',
      x: SPAWN.x, y: SPAWN.y, dir: 'up',
      realm: 0, stage: 0, tuvi: 0,
      silence: 100,              // mười tám năm im lặng dồn nén — chỉ lần đầu là đầy
      timesSpoken: 0,
      unlocked: [],              // 'voice' sau sự kiện mở miệng, 'luyenkhi1' sau đột phá
      quest: 'q_trac',
      map: 'tran',               // bản đồ hiện tại (đa bản đồ từ chương 2)
      dayMinutes: DAY_DEFAULT_MINUTES, // đồng hồ thế giới: phút-trong-ngày, bắt đầu 08:00 sáng
      dayCount: 0,               // số ngày game đã trôi (hệ cày: trần mềm ngày, chu kỳ boss — docs/grind-prep)
      techniques: {},            // lớp công pháp theo tầng (docs/congphap-prep): chỉ có mục khi đã học theo truyện
      activeMethod: null,        // tâm pháp đang vận hành ('thanh_phong' sau khi nhận ở tháp)
      grind: defaultGrind(),     // trạng thái hệ cày: hồ trần ngày, khóa chống trùng, sổ trả thưởng
      sideQuests: defaultSideQuests(), // Mục H: chuỗi phụ quanh Trúc Cơ — { claimed, selected, socialMet } dữ kiện thuần, online-ready
      secretRealms: defaultSecretRealms(), // trạng thái bí cảnh: kho lượt ngày chung + từng bí cảnh
      party: defaultParty(),           // Lớp tổ đội (đợt boss tổ đội): { bots: [...] } dữ kiện thuần, online-ready
      spokeLedger: [],           // Sổ Dư Âm: {ch, ctx, witnesses} — nền cơ chế giá của dư âm
      announceLog: [],           // Sổ Thiên Đạo thông cáo (docs/realm-prep/ mục 9.1): tối đa 20 dòng gần nhất
      linhThach: 0,              // ví Linh Thạch — KHÓA cho tới khi bắt đầu tu tiên
      silver: SILVER_START,      // ví BẠC phàm tục (đợt sửa lỗi nhiệm vụ nấu ăn 2026-11-05): tiền mang theo người, chỉ mua được đồ ăn phàm tục rẻ
      linhUnlocked: false,       // mở tại tryBreakthrough khi đạt Luyện Khí tầng 1
      sectMerit: 0,              // điểm cống hiến tông môn — trục tích lũy thứ ba, tách khỏi Linh Thạch (chương 7)
      items: { dan: 0 },         // GƯƠNG đọc của túi: số Hồi Khí Đan (syncBagMirrors ghi)
      gear: ['kiem_hua_gia'],    // GƯƠNG đọc của túi: pháp khí đang có (syncBagMirrors ghi) — tân thủ đeo sẵn Thiết Kiếm Hứa Gia
      bag: { tier: 1, items: { kiem_hua_gia: 1 } }, // Túi Trữ Vật — nguồn sự thật của vật phẩm (mở khóa ở chương 3); kiếm khởi đầu ghi ở đây nhưng đeo trên người (worn) nên không chiếm ô
      soulRank: 0,               // phẩm Hồn Sư — TRỤC THỨ HAI, giấu kín (mở ở chương 5 khi chữa hồn)
      soulPower: 0,              // hồn lực tích lũy — không hiển thị công khai trong cốt truyện

      flags: { tested: false, voiced: false, dummyBroken: false, metUNhan: false, ltGift: false, starterWeaponGift: true, wroteFirst: false, evidence: false, ltLetter: false, innWork: 0, thuocReward: false, invited: false, queueSeen: false, measured: false, thienCoSeen: false, clueKho: false, clueWitness: false, usedChanCh4: false, daoNoticedVoice: false, thienCoPaid: false, soulSecret: false, soulPaidFor: 0, uNhanSupported: false, duelSeen: false, dowrySeen: false, atkWave: 0, atkFallback: false, hbcPaid: false, bagUnlocked: false, sectSeen: false, choreGo: false, choreNuoc: false, choreBao: false, choresPaid: false, tlRound: 0, tlHits: 0, hhtHits: 0, chuanBiSeen: false, chiGathered: false, pillGranted: false, guardWave: 0, guardBroken: 0, sectReward: false, herbGathered: false, pillMeritPaid: false, ch9TinDu: false, ch9SayRescue: false, ch9SilentRoute: false, ch9DoiDau: false, ch9HonDau: false, ch9BreakReady: false, ch9Reward: false, hbDone: false, soulRevealed: false, soulPublic: false, soulExposed: false, soulClinicPaidFor: 0, soulSectPaidFor: 0, sectJobPaidFor: 0, thienCoFeePaid: false, ch11HeQua: false, uNhanChoice: false, uNhanGift2: false, ketDanHerb: false, ketDanCoreGot: false, ketDanCoreExtra: 0, ketDanRefined: false, ketDanGuardWave: 0, ketDanGuardBroken: 0, ketDanGuardDone: false, ketDanSpokeSave: false, lenDinhHold: 0, lenPhongSeal: 0, lenUsedDinh: 0, lenUsedPhong: 0, kimDanReward: false, sectJobRound: 0, ch10BreakReady: false, ch10RumorPending: false, uNhanCityMet: false, giaNhanHealed: false, lenDinhDone: false, lenPhongDone: false, benhSeen: false, ch9PlanSeen: false, kdBeastWave: 0, ch13Reward: false, ch14Reward: false, ch15Reward: false, ch16Reward: false, ch15ResonanceLock: false, thanhLongPending: false, challengeWinsNoiMon: 0, challengeWinsTinhAnh: 0, bcSauFirstPaid: false, ch17Reward: false, ch18Reward: false, ch19Reward: false, ch20Reward: false, ch21Reward: false, ch22Reward: false, ch23Reward: false, ch24Reward: false, ch18Insight: false, ch19Insight: false, ch20SoulRecognized: false, challengeWinsVoDich: 0, soulGrandPaidFor: 0, thienDaoMark: 0, trongThuong: false, ttPillCount: 0, hoTheDanGifted: false, ttElderSeen: false, foodBought: false, foodGathered: false, foodCooked: false, foodEaten: false, foodGiftInn: false, foodHintSeen: false, foodPatchDayTran: -1, foodPatchDayDuongMon: -1 },

      hp: 100, hpMax: 100
    };
  }
  // Thổ nạp một giây: tăng tu vi (chưa mở khóa tu luyện thì không tăng).
  // Tốc độ gốc 10/giây; Thanh Phong Chân Kinh (chương 3) +2/giây và pháp bảo
  // Tụ Linh Ngọc +5/giây — cộng dồn, chỉ tính khi đã sở hữu thật.
  function meditateRate(state) {
    var r = 10 + techniqueMethodBonus(state);
    if (state.gear && state.gear.indexOf('ngoc_tu_linh') >= 0) r += 5;
    // Trọng thương sau một lần độ kiếp hỏng (docs/realm-prep/ mục 6.1):
    // tốc độ thổ nạp giảm một nửa cho tới khi thương thế khép lại.
    if (state.flags && state.flags.trongThuong) r = Math.max(1, Math.floor(r / 2));
    return r;
  }
  // Cộng tốc độ thổ nạp của tâm pháp Thanh Phong theo TẦNG (lớp techniques
  // của đợt công pháp): tầng 1 cho đúng +2 như bản live trước khi có lớp
  // tầng; save chưa di trú (chưa có mục techniques) thì đọc khóa unlocked
  // như cũ. Tầng cao hơn: +4/+6/+8 (docs/congphap-prep mục 14.2).
  function techniqueMethodBonus(state) {
    if (!state) return 0;
    var t = techniqueOf(state, 'thanh_phong');
    if (t) return TECHNIQUE_DEFS.thanh_phong.rateBonus[t.tier] || 0;
    if (state.unlocked && state.unlocked.indexOf('thanh_phong') >= 0) return 2;
    return 0;
  }
  function meditateTick(state, seconds) {
    if (state.unlocked.indexOf('voice') < 0) return state;
    var cap = REALMS[state.realm] && REALMS[state.realm].tuviNext;
    if (cap) state.tuvi = Math.min(cap, state.tuvi + meditateRate(state) * seconds);
    state.silence = silenceGain('meditate', seconds, state.silence);
    // Ba trục độc lập (luật ranh giới của đợt công pháp): thổ nạp đồng
    // thời nuôi điểm tu luyện của tâm pháp đang vận hành, +2 điểm/giây —
    // điểm chỉ sinh từ hành động lặp, đầy trục này không chặn hai trục kia.
    if (state.activeMethod) techniqueGain(state, state.activeMethod, 2 * seconds);
    return state;
  }
  /* ---------------- Kiếm quyết (chương 3) ---------------- */
  // Thất Tinh Kiếm Quyết: đòn vật lý KHÔNG dùng cộng hưởng — không tốn Tĩnh
  // Âm, không ghi Sổ Dư Âm. Đây là đường sức mạnh thứ hai buộc người
  // chơi mạnh cả khi không gõ đòn cộng hưởng (đất dùng lớn ở Thăng Long Đạo chương 7).
  /* ---------------- Vũ khí đang đeo (mục B đợt vá 2026-11-02) ----------------
     Người chơi chỉ ĐEO MỘT vũ khí: trong số vũ khí đang sở hữu (đọc qua
     gương state.gear như mọi hệ cũ), cây có swordBonus cao nhất là cây
     đang đeo và CHỈ cây đó cộng uy lực — vũ khí tốt hơn THAY THẾ vũ khí
     yếu hơn, không cộng dồn. Trước đợt này game chỉ có một vũ khí
     (kiem_phong +8 kiếm / +10 hưởng) nên mọi số cũ giữ nguyên 100% khi chỉ
     sở hữu Thanh Phong Kiếm. Chỉ số nằm ngay trong ITEM_DEFS
     (swordBonus/wordBonus) để vũ khí về sau chỉ cần khai báo thêm. */
  function equippedWeaponId(state) {
    if (!state || !Array.isArray(state.gear)) return null;
    var best = null, bestSword = -1, bestWord = -1;
    for (var i = 0; i < state.gear.length; i++) {
      var def = ITEM_DEFS[state.gear[i]];
      if (!def || (typeof def.swordBonus !== 'number' && typeof def.wordBonus !== 'number')) continue;
      var sw = def.swordBonus || 0, wd = def.wordBonus || 0;
      if (sw > bestSword || (sw === bestSword && wd > bestWord)) { best = state.gear[i]; bestSword = sw; bestWord = wd; }
    }
    return best;
  }
  function weaponBonus(state) {
    var id = equippedWeaponId(state), def = id ? ITEM_DEFS[id] : null;
    return { id: id, sword: def ? (def.swordBonus || 0) : 0, word: def ? (def.wordBonus || 0) : 0 };
  }
  function swordPower(state) {
    var base = 18 + (state.stage || 0) * 3 + (state.realm || 0) * 10;
    base += weaponBonus(state).sword;
    return base;
  }
  /* Chiêu kiếm theo tầng kiếm quyết (docs/congphap-prep mục 4/14.3):
     Trảm gốc (tầng 1) -> Liên Hoàn 2 đòn x 60% (tầng 2) -> Phá Quân 170%
     (tầng 3) -> Quy Nhất 250% (tầng 4). castSword KHÔNG truyền chiêu thì
     luôn là chiêu gốc với đúng uy lực cũ — mọi resolver kịch bản đã cài
     giữ nguyên hành vi, và bộ đếm chiêu của chúng đếm LẦN GỌI, không đếm
     số đòn (Liên Hoàn vẫn là một lần gọi). */
  var SWORD_MOVES = [
    { id: 'tram', name: 'Thất Tinh Trảm', tier: 1, mult: 1, hits: 1, techId: 'that_tinh' },
    { id: 'lien_hoan', name: 'Thất Tinh Liên Hoàn', tier: 2, mult: 0.6, hits: 2, techId: 'that_tinh' },
    { id: 'pha_quan', name: 'Thất Tinh Phá Quân', tier: 3, mult: 1.7, hits: 1, techId: 'that_tinh' },
    { id: 'quy_nhat', name: 'Thất Tinh Quy Nhất', tier: 4, mult: 2.5, hits: 1, techId: 'that_tinh' },
    /* Cung IV: chiêu của Huyền Tinh Kiếm Phổ — dòng kiếm quyết THỨ HAI.
       techId riêng: tầng kiểm theo chính bộ phổ, fxId là id trình diễn
       engine dùng ('huyen_tinh_tram'). Hệ số 1,9 nằm giữa Phá Quân 1,7
       và Quy Nhất 2,5 theo khóa thiết kế; không đổi số nào đã duyệt. */
    { id: 'huyen_tinh_tram', name: 'Huyền Tinh Trảm', tier: 1, mult: 1.9, hits: 1, techId: 'huyen_tinh_kiem_pho', fxId: 'huyen_tinh_tram' }
  ];
  function swordMoveById(id) {
    for (var i = 0; i < SWORD_MOVES.length; i++) if (SWORD_MOVES[i].id === id) return SWORD_MOVES[i];
    return null;
  }
  function castSword(state, moveId) {
    var move = SWORD_MOVES[0];
    if (moveId) {
      move = swordMoveById(moveId);
      if (!move) return { ok: false, reason: 'Chiêu kiếm không tồn tại.' };
      var tid = move.techId || 'that_tinh';
      if (tid === 'that_tinh' && (!state.unlocked || state.unlocked.indexOf('that_tinh') < 0)) return { ok: false, reason: 'Chưa học Thất Tinh Kiếm Quyết.' };
      var tech = techniqueOf(state, tid);
      if (tid !== 'that_tinh' && !tech) return { ok: false, reason: 'Chưa học ' + (TECHNIQUE_DEFS[tid] ? TECHNIQUE_DEFS[tid].name : tid) + '.' };
      var tier = tech ? tech.tier : 1; // save chưa di trú: coi như tầng 1 (chỉ chiêu gốc chắc chắn mở)
      if (tier < move.tier) return { ok: false, reason: 'Kiếm quyết mới tầng ' + tier + ' — chưa lĩnh ngộ được ' + move.name + '.' };
    } else if (!state.unlocked || state.unlocked.indexOf('that_tinh') < 0) {
      return { ok: false, reason: 'Chưa học Thất Tinh Kiếm Quyết.' };
    }
    return { ok: true, power: Math.round(swordPower(state) * move.mult), hits: move.hits, move: move.id, moveName: move.name, techId: move.techId || 'that_tinh', fxId: move.fxId || null };
  }
  /* ---------------- Hồn Sư — trục thứ hai, giấu kín (chương 5) ----------------
     Giang Phàm là Hồn Sư nhị phẩm nhưng giấu kín thân phận (theo truyện).
     Hồn lực không hiển thị như tài nguyên công khai; dịch vụ luyện hồn kín
     đáo qua Trần Tư Linh cho một nguồn Linh Thạch đều: 25 viên, tối đa MỘT
     lần mỗi chương truyện (theo số chương rút từ id nhiệm vụ hiện tại). */
  function chapterOfQuest(state) {
    var m = /^q(\d+)/.exec(state.quest || '');
    return m ? parseInt(m[1], 10) : 1;
  }
  /* ---------------- Túi Trữ Vật — nền dữ liệu vật phẩm dùng chung ----------------
     Lệnh lộ trình của Bui 12:05 ngày 2026-11-01 + docs/part2-design.md mục
     Túi Trữ Vật: MỌI chương dùng chung một mô hình vật phẩm này, không tự
     chế kiểu lưu riêng. Túi mở khóa ở chương 3 (Kiểm Trắc Tháp tặng sau kết
     quả vượt cửu phẩm — chương đầu tiên phát sinh vật phẩm thật: đan dược
     và pháp khí mua bằng Linh Thạch). Vật phẩm cốt truyện (kinh thư, kiếm
     quyết) có ngăn riêng (storySlot) — không vào túi thường, không tính
     sức chứa; chúng được ghi nhận qua state.unlocked như trước.
     Hai trường cũ items.dan và gear được giữ làm GƯƠNG đọc cho các hệ đã
     xây (thổ nạp, kiếm quyết, Vạn Âm Cộng Hưởng) — syncBagMirrors là nơi duy nhất
     ghi chúng, từ dữ liệu túi. */
  var ITEM_DEFS = {
    hoi_khi_dan: { name: 'Hồi Khí Đan', type: 'dan', stack: true, glyph: 'Đan' },
    /* Vật phẩm chuẩn bị thiên kiếp (docs/realm-prep/ mục 5.1 — số đã
       duyệt ở parent-decisions): Hộ Thể Đan giảm 60% một đạo lôi (trưởng
       lão tặng đúng 1 viên làm quà làm quen ở khâu chuẩn bị chương 8);
       Dẫn Lôi Pháp bị động giảm 25% mọi đạo khi nằm trong túi. */
    ho_the_dan: { name: 'Hộ Thể Đan', type: 'dan', stack: true, glyph: 'Thể' },
    dan_loi_phap: { name: 'Dẫn Lôi Pháp', type: 'phap_khi', stack: false, glyph: 'Pháp' },
    kiem_phong: { name: 'Thanh Phong Kiếm', type: 'phap_khi', stack: false, glyph: 'Kiếm', swordBonus: 8, wordBonus: 10 },
    /* Vũ khí khởi đầu của tân thủ (lệnh Bui 18:40 ngày 2026-11-02 "Thiếu
       vũ khí cho tân thủ"): thanh kiếm sắt Hứa gia phát cho con em trong
       nhà mang theo ngày đi trắc linh — lưỡi khắc một phù văn dẫn khí thô
       sơ của thợ rèn trong trấn nên dù chưa nhập phẩm pháp khí vẫn kiếm ngân trợ hưởng
       được chút ít (+3 kiếm / +3 hưởng, nhỏ hơn hẳn Thanh Phong Kiếm
       +8/+10; Thanh Phong về sau THAY THẾ nó theo luật vũ khí đang đeo).
       worn: kiếm đeo bên hông người, không cất vào Túi Trữ Vật nên không
       chiếm ô chứa (bagUsed bỏ qua như ngăn cốt truyện) — nhưng vẫn ghi
       trong bag.items để panel túi liệt kê và gương gear đồng bộ. */
    kiem_hua_gia: { name: 'Thiết Kiếm Hứa Gia', type: 'phap_khi', stack: false, glyph: 'Kiếm', worn: true, swordBonus: 3, wordBonus: 3 },
    ngoc_tu_linh: { name: 'Tụ Linh Ngọc', type: 'phap_khi', stack: false, glyph: 'Ngọc' },
    linh_chi: { name: 'Linh Chi Sau Núi', type: 'nguyen_lieu', stack: true, glyph: 'Chi' },
    truc_co_dan: { name: 'Trúc Cơ Đan', type: 'dan', stack: true, glyph: 'Cơ' },
    /* Yêu Đan — nguyên liệu theo cấp quái (lệnh của Bui 15:28 ngày
       2026-11-01). Cấp 1 dùng cho công thức Trúc Cơ Đan (chương 8), cấp 2
       là thành phần vật chất bắt buộc của vật dẫn Kết Đan (chương 11). */
    yeu_dan_1: { name: 'Yêu Đan Cấp 1', type: 'nguyen_lieu', stack: true, glyph: 'Yêu' },
    yeu_dan_2: { name: 'Yêu Đan Cấp 2', type: 'nguyen_lieu', stack: true, glyph: 'Yêu' },
    yeu_dan_3: { name: 'Yêu Đan Cấp 3', type: 'nguyen_lieu', stack: true, glyph: 'Yêu' },
    yeu_dan_4: { name: 'Yêu Đan Cấp 4', type: 'nguyen_lieu', stack: true, glyph: 'Yêu' },
    thanh_tam_thao: { name: 'Thanh Tâm Thảo', type: 'nguyen_lieu', stack: true, glyph: 'Thảo' },
    tu_linh_dan: { name: 'Tụ Linh Đan', type: 'dan', stack: true, glyph: 'Tụ' },
    ket_dan_duoc: { name: 'Dược Dẫn Kết Đan', type: 'nguyen_lieu', stack: true, glyph: 'Dẫn' },
    ket_dan_dan: { name: 'Vật Dẫn Kết Đan', type: 'dan', stack: true, glyph: 'Dẫn' },
    /* Đan thưởng của hệ cày (docs/grind-prep/grind-design.md mục 8): đan
       theo dải cảnh giới — Hồi Xuân Đan cho dải Luyện Khí, Phục Linh Đan
       cho dải Trúc Cơ. Tên ở mức [ĐỀ XUẤT] đã duyệt trong tài liệu cày. */
    hoi_xuan_dan: { name: 'Hồi Xuân Đan', type: 'dan', stack: true, glyph: 'Xuân' },
    /* Tị Lôi Phù — vật phẩm thưởng LẦN ĐẦU đã duyệt của bí cảnh Tàn Tích
       (Ngoài + Sâu) và Hồi Phong Cổ Mộ (docs/bicanh-prep). Đây KHÔNG phải
       Dẫn Lôi Pháp: Dẫn Lôi Pháp vẫn cấm phát miễn phí trong mọi bí cảnh
       và giữ nguyên điểm tiêu 240 Linh Thạch / 150 merit của đợt thiên kiếp.
       ĐỢT THIÊN KIẾP (docs/realm-prep/ mục 5.1): vật phẩm này CHÍNH LÀ lá
       Tị Lôi Phù của hệ thiên kiếp (thiết kế gọi tên loi_phu — hợp nhất
       một id duy nhất, không tạo vật phẩm trùng tên): giảm 85% một đạo
       lôi, nguồn bền vững là mua 40 Linh Thạch / đổi 30 điểm cống hiến,
       và type chuyển từ 'dan' sang 'phu' — loại vật phẩm mới đã duyệt. */
    ti_loi_phu: { name: 'Tị Lôi Phù', type: 'phu', stack: true, glyph: 'Phù' },
    phuc_linh_dan: { name: 'Phục Linh Đan', type: 'dan', stack: true, glyph: 'Linh' },
    /* ĐỒ ĂN hồi máu + Tĩnh Âm (lệnh của Bui 06:11 ngày 2026-11-04):
       vật phẩm tiêu hao dân dã dùng được từ chương 1–2 — "linh lực"
       diễn giải là thanh Tĩnh Âm. Số hồi neo bể đầu game (Luyện Khí
       tầng 1: máu tối đa 120, Tĩnh Âm tối đa 100); đan dược giữ vị thế
       cao cấp (Hồi Khí Đan hồi 25 Tĩnh Âm giá 12 Linh Thạch, không hồi
       máu) nên đồ ăn rẻ hơn hẳn và hồi máu là chính. Nguồn: mua ở quán
       trọ trấn + chợ Cô Châu (priceLt), nấu từ nguyên liệu hái/săn
       (FOOD_RECIPES ở khối đồ ăn). */
    com_nam: { name: 'Cơm Nắm Lá Sen', type: 'do_an', stack: true, glyph: 'Cơm', icon: 'assets/items/com_nam.png', hp: 30, ta: 10, priceLt: 3, priceBac: 5 },
    banh_hap: { name: 'Bánh Hấp Nhân Thịt', type: 'do_an', stack: true, glyph: 'Bánh', icon: 'assets/items/banh_hap.png', hp: 45, ta: 15, priceLt: 5, priceBac: 8 },
    canh_nam_thao: { name: 'Canh Nấm Thảo Dược', type: 'do_an', stack: true, glyph: 'Canh', icon: 'assets/items/canh_nam_thao.png', hp: 35, ta: 25 },
    thit_nuong: { name: 'Thịt Thú Nướng Que', type: 'do_an', stack: true, glyph: 'Thịt', icon: 'assets/items/thit_nuong.png', hp: 60, ta: 10 },
    canh_bo_khi: { name: 'Canh Bổ Khí', type: 'do_an', stack: true, glyph: 'Bổ', icon: 'assets/items/canh_bo_khi.png', hp: 90, ta: 40 },
    /* Nguyên liệu nấu ăn: nấm hái ở bãi nấm (mọc lại theo ngày game),
       thịt rơi từ quái thú dã ngoại lúc hạ (làn game.js phát rơi). */
    nam_rung: { name: 'Nấm Rừng', type: 'nguyen_lieu', stack: true, glyph: 'Nấm', icon: 'assets/items/nam_rung.png' },
    thit_thu: { name: 'Thịt Thú Rừng', type: 'nguyen_lieu', stack: true, glyph: 'Thú', icon: 'assets/items/thit_thu.png' },
    /* Nguyên liệu thu thập của hệ cày (docs/grind-prep/systems-data.md
       mục 4.3): cùng khuôn nguyen_lieu + stack:true như linh_chi. */
    xich_tam_hoa: { name: 'Xích Tâm Hoa', type: 'nguyen_lieu', stack: true, glyph: 'Hoa' },
    thuy_lau: { name: 'Thủy Lau', type: 'nguyen_lieu', stack: true, glyph: 'Lau' },
    son_kim_sa: { name: 'Sơn Kim Sa', type: 'nguyen_lieu', stack: true, glyph: 'Sa' },
    /* Vật chứng truyện của Hồi Phong Cổ Mộ (docs/bicanh-prep): ngăn
       storySlot, không tính sức chứa, sở hữu qua unlockKey — làn game.js
       cấp khi người chơi đọc thư / nhặt ngọc trong mộ thất. Không thêm
       vật phẩm chuẩn bị thiên kiếp nào ở đây. */
    thu_trong_mo: { name: 'Thư Chưa Gửi Trong Mộ', type: 'nhiem_vu', stack: false, storySlot: true, glyph: 'Thư', unlockKey: 'thu_trong_mo' },
    ngoc_boi_nua: { name: 'Nửa Miếng Ngọc Bội', type: 'nhiem_vu', stack: false, storySlot: true, glyph: 'Ngọc', unlockKey: 'ngoc_boi_nua' },
    /* Bí tịch (lệnh Bui 22:21 ngày 2026-11-01): sách tàn thiên — vật phẩm
       túi THƯỜNG, chỉ cho ĐIỂM tu luyện của công pháp ĐÃ học theo truyện
       (trường teaches), không mở công pháp mới, không cho tầng trực tiếp,
       không có giá — xem useBiTich và hai luật khóa ở khối công pháp. */
    bi_tich_that_tinh: { name: 'Bí Tịch Thất Tinh (Tàn Thiên)', type: 'bi_tich', stack: true, glyph: 'Tịch', teaches: 'that_tinh' },
    bi_tich_thanh_phong: { name: 'Bí Tịch Thanh Phong (Tàn Thiên)', type: 'bi_tich', stack: true, glyph: 'Tịch', teaches: 'thanh_phong' },
    // Tàn thiên của dòng ngu_hanh (khung ẩn giai đoạn 2 — bản đồ mục
    // 4.5): mỗi bộ một quyển, teaches = id của bộ; cơ chế đọc là
    // useBiTich sẵn có (+100 điểm, chỉ khi đã học). Chưa nguồn nào
    // rơi các quyển này — điểm rơi gắn ở các đợt cài theo sheet.
    bi_tich_phi_diep_phong_nhan: { name: 'Bí Tịch Phi Diệp Phong Nhận (Tàn Thiên)', type: 'bi_tich', stack: true, glyph: 'Tịch', teaches: 'phi_diep_phong_nhan' },
    bi_tich_huyen_thuy_xoay_luu: { name: 'Bí Tịch Huyền Thủy Xoáy Lưu (Tàn Thiên)', type: 'bi_tich', stack: true, glyph: 'Tịch', teaches: 'huyen_thuy_xoay_luu' },
    bi_tich_huyen_moc_dang_giao: { name: 'Bí Tịch Huyền Mộc Đằng Giao (Tàn Thiên)', type: 'bi_tich', stack: true, glyph: 'Tịch', teaches: 'huyen_moc_dang_giao' },
    bi_tich_liet_diem_trao_kich: { name: 'Bí Tịch Liệt Diễm Trảo Kích (Tàn Thiên)', type: 'bi_tich', stack: true, glyph: 'Tịch', teaches: 'liet_diem_trao_kich' },
    bi_tich_bich_ngoc_cu_kiem: { name: 'Bí Tịch Bích Ngọc Cự Kiếm (Tàn Thiên)', type: 'bi_tich', stack: true, glyph: 'Tịch', teaches: 'bich_ngoc_cu_kiem' },
    bi_tich_cuong_phong_loc_xoay: { name: 'Bí Tịch Cuồng Phong Lốc Xoáy (Tàn Thiên)', type: 'bi_tich', stack: true, glyph: 'Tịch', teaches: 'cuong_phong_loc_xoay' },
    bi_tich_viem_long_tho_tuc: { name: 'Bí Tịch Viêm Long Thổ Tức (Tàn Thiên)', type: 'bi_tich', stack: true, glyph: 'Tịch', teaches: 'viem_long_tho_tuc' },
    bi_tich_lien_nguc_hoa_tran: { name: 'Bí Tịch Liên Ngục Hỏa Trận (Tàn Thiên)', type: 'bi_tich', stack: true, glyph: 'Tịch', teaches: 'lien_nguc_hoa_tran' },
    bi_tich_bang_tram_van_tien: { name: 'Bí Tịch Băng Trâm Vạn Tiễn (Tàn Thiên)', type: 'bi_tich', stack: true, glyph: 'Tịch', teaches: 'bang_tram_van_tien' },
    bi_tich_han_bang_xieng_xich: { name: 'Bí Tịch Hàn Băng Xiềng Xích (Tàn Thiên)', type: 'bi_tich', stack: true, glyph: 'Tịch', teaches: 'han_bang_xieng_xich' },
    bi_tich_hoa_van_man_thien: { name: 'Bí Tịch Hỏa Vân Man Thiên (Tàn Thiên)', type: 'bi_tich', stack: true, glyph: 'Tịch', teaches: 'hoa_van_man_thien' },
    bi_tich_diet_son_dia_chan: { name: 'Bí Tịch Điệt Sơn Địa Chấn (Tàn Thiên)', type: 'bi_tich', stack: true, glyph: 'Tịch', teaches: 'diet_son_dia_chan' },
    bi_tich_tu_dien_kich: { name: 'Bí Tịch Tử Điện Kích (Tàn Thiên)', type: 'bi_tich', stack: true, glyph: 'Tịch', teaches: 'tu_dien_kich' },
    bi_tich_thanh_loan_pha_hu: { name: 'Bí Tịch Thanh Loan Phá Hư (Tàn Thiên)', type: 'bi_tich', stack: true, glyph: 'Tịch', teaches: 'thanh_loan_pha_hu' },
    bi_tich_hoa_phuong_lieu_nguyen: { name: 'Bí Tịch Hỏa Phượng Liêu Nguyên (Tàn Thiên)', type: 'bi_tich', stack: true, glyph: 'Tịch', teaches: 'hoa_phuong_lieu_nguyen' },
    bi_tich_dai_nhat_hoa_cau: { name: 'Bí Tịch Đại Nhật Hỏa Cầu (Tàn Thiên)', type: 'bi_tich', stack: true, glyph: 'Tịch', teaches: 'dai_nhat_hoa_cau' },
    bi_tich_thanh_long_xuat_the: { name: 'Bí Tịch Thanh Long Xuất Thế (Tàn Thiên)', type: 'bi_tich', stack: true, glyph: 'Tịch', teaches: 'thanh_long_xuat_the' },
    bi_tich_tuyet_hoa_cu_kiem: { name: 'Bí Tịch Tuyết Hoa Cự Kiếm (Tàn Thiên)', type: 'bi_tich', stack: true, glyph: 'Tịch', teaches: 'tuyet_hoa_cu_kiem' },
    bi_tich_han_bang_bao_lien: { name: 'Bí Tịch Hàn Băng Bảo Liên (Tàn Thiên)', type: 'bi_tich', stack: true, glyph: 'Tịch', teaches: 'han_bang_bao_lien' },
    bi_tich_thuong_hai_cuong_dao: { name: 'Bí Tịch Thương Hải Cuồng Đào (Tàn Thiên)', type: 'bi_tich', stack: true, glyph: 'Tịch', teaches: 'thuong_hai_cuong_dao' },
    bi_tich_loi_quang_than_kiem: { name: 'Bí Tịch Lôi Quang Thần Kiếm (Tàn Thiên)', type: 'bi_tich', stack: true, glyph: 'Tịch', teaches: 'loi_quang_than_kiem' },
    bi_tich_thai_bach_kim_kiem: { name: 'Bí Tịch Thái Bạch Kim Kiếm (Tàn Thiên)', type: 'bi_tich', stack: true, glyph: 'Tịch', teaches: 'thai_bach_kim_kiem' },
    bi_tich_bon_loi_thiem_kich: { name: 'Bí Tịch Bôn Lôi Thiểm Kích (Tàn Thiên)', type: 'bi_tich', stack: true, glyph: 'Tịch', teaches: 'bon_loi_thiem_kich' },
    bi_tich_tu_loi_than_long: { name: 'Bí Tịch Tử Lôi Thần Long (Tàn Thiên)', type: 'bi_tich', stack: true, glyph: 'Tịch', teaches: 'tu_loi_than_long' },
    bi_tich_cuu_thien_loi_phat: { name: 'Bí Tịch Cửu Thiên Lôi Phạt (Tàn Thiên)', type: 'bi_tich', stack: true, glyph: 'Tịch', teaches: 'cuu_thien_loi_phat' },
    bi_tich_tu_loi_than_phu: { name: 'Bí Tịch Tử Lôi Thần Phù (Tàn Thiên)', type: 'bi_tich', stack: true, glyph: 'Tịch', teaches: 'tu_loi_than_phu' },
    bi_tich_bat_diet_kim_than: { name: 'Bí Tịch Bất Diệt Kim Thân (Tàn Thiên)', type: 'bi_tich', stack: true, glyph: 'Tịch', teaches: 'bat_diet_kim_than' },
    bi_tich_huyet_anh_ma_hon: { name: 'Bí Tịch Huyết Ảnh Ma Hồn (Tàn Thiên)', type: 'bi_tich', stack: true, glyph: 'Tịch', teaches: 'huyet_anh_ma_hon' },
    bi_tich_hu_khong_hac_dong: { name: 'Bí Tịch Hư Không Hắc Động (Tàn Thiên)', type: 'bi_tich', stack: true, glyph: 'Tịch', teaches: 'hu_khong_hac_dong' },
    bi_tich_hon_don_phap_luan: { name: 'Bí Tịch Hỗn Độn Pháp Luân (Tàn Thiên)', type: 'bi_tich', stack: true, glyph: 'Tịch', teaches: 'hon_don_phap_luan' },
    bi_tich_thanh_hoa_lien_tran: { name: 'Bí Tịch Thanh Hoa Liên Trận Kinh (Tàn Thiên)', type: 'bi_tich', stack: true, glyph: 'Tịch', teaches: 'thanh_hoa_lien_tran' },
    bi_tich_tu_da_anh_kiem: { name: 'Bí Tịch Tử Dạ Ảnh Kiếm Quyết (Tàn Thiên)', type: 'bi_tich', stack: true, glyph: 'Tịch', teaches: 'tu_da_anh_kiem' },
    song_ngu_ngoc_boi: { name: 'Song Ngư Ngọc Bội', type: 'nhiem_vu', stack: false, storySlot: true, glyph: 'Ngọc', unlockKey: 'song_ngu' },
    thien_co_ngoc_gian: { name: 'Thiên Cơ Ngọc Giản', type: 'nhiem_vu', stack: false, storySlot: true, glyph: 'Giản', unlockKey: 'thien_co_gian' },
    thanh_phong_chan_kinh: { name: 'Thanh Phong Chân Kinh', type: 'nhiem_vu', stack: false, storySlot: true, glyph: 'Kinh', unlockKey: 'thanh_phong' },
    that_tinh_kiem_quyet: { name: 'Thất Tinh Kiếm Quyết', type: 'nhiem_vu', stack: false, storySlot: true, glyph: 'Quyết', unlockKey: 'that_tinh' },
    huyen_tinh_kiem_pho_sach: { name: 'Huyền Tinh Kiếm Phổ', type: 'nhiem_vu', stack: false, storySlot: true, glyph: 'Phổ', unlockKey: 'huyen_tinh_kiem_pho' }
  };
  // Sức chứa theo tầng — giá nâng cấp là số [ĐỀ XUẤT] cũ (docs/part2-design.md), GIỮ NGUYÊN.
  // Sức chứa: lệnh Bui 00:01 ngày 2026-11-06 "Túi trữ vật nâng cấp túi thường đựng 90 món"
  // — tầng 1 (túi thường) = 90; các tầng trên tăng dần từ mốc 90 (số parent đề xuất theo
  // lệnh, chỉ nằm ở hằng này). Sức chứa chỉ TĂNG so với bản cũ (10/20/35/55) nên tệp lưu
  // cũ không mất vật phẩm; tầng của người chơi giữ nguyên.
  var BAG_TIERS = [null,
    { tier: 1, cap: 90, price: 0 },
    { tier: 2, cap: 130, price: 120 },
    { tier: 3, cap: 180, price: 300 },
    { tier: 4, cap: 240, price: 650 }
  ];
  function bagOf(state) {
    if (!state.bag || typeof state.bag !== 'object') state.bag = { tier: 1, items: {} };
    if (!state.bag.items || typeof state.bag.items !== 'object') state.bag.items = {};
    if (!BAG_TIERS[state.bag.tier]) state.bag.tier = 1;
    return state.bag;
  }
  function bagCount(state, id) { var b = bagOf(state); return Math.max(0, b.items[id] || 0); }
  function bagHas(state, id) { return bagCount(state, id) > 0; }
  function bagCap(state) { return BAG_TIERS[bagOf(state).tier].cap; }
  function bagUsed(state) {
    var b = bagOf(state), used = 0;
    for (var id in b.items) {
      var def = ITEM_DEFS[id];
      if (!def || def.storySlot) continue; // ngăn riêng cốt truyện không tính sức chứa
      if (def.worn) continue; // vũ khí đeo trên người (Thiết Kiếm Hứa Gia) không chiếm ô chứa
      used += Math.max(0, b.items[id] || 0);
    }
    return used;
  }
  function bagCanAdd(state, id, n) {
    var def = ITEM_DEFS[id];
    if (!def) return { ok: false, reason: 'Vật phẩm không xác định.' };
    if (def.storySlot) return { ok: false, reason: 'Vật phẩm cốt truyện nằm ở ngăn riêng, không để vào túi thường.' };
    n = n || 1;
    if (!def.stack && bagHas(state, id)) return { ok: false, reason: 'Đã có ' + def.name + ' trong túi rồi.' };
    if (!def.stack && n > 1) return { ok: false, reason: def.name + ' không xếp chồng được.' };
    if (bagUsed(state) + n > bagCap(state)) return { ok: false, reason: 'Túi trữ vật đã đầy (' + bagUsed(state) + '/' + bagCap(state) + '). Hãy nâng cấp túi hoặc dùng bớt vật phẩm.' };
    return { ok: true };
  }
  function bagAdd(state, id, n) {
    var chk = bagCanAdd(state, id, n);
    if (!chk.ok) return chk;
    var b = bagOf(state);
    b.items[id] = bagCount(state, id) + (n || 1);
    syncBagMirrors(state);
    return { ok: true, count: b.items[id] };
  }
  function bagRemove(state, id, n) {
    var have = bagCount(state, id);
    n = n || 1;
    if (have < n) return { ok: false, reason: 'Không đủ số lượng trong túi.' };
    var b = bagOf(state);
    b.items[id] = have - n;
    if (b.items[id] <= 0) delete b.items[id];
    syncBagMirrors(state);
    return { ok: true, count: Math.max(0, have - n) };
  }
  // Vật phẩm ngăn riêng cốt truyện MÀ NGƯỜI CHƠI ĐÃ SỞ HỮU: chúng không
  // nằm trong túi thường (bagAdd từ chối theo thiết kế) mà được ghi nhận
  // qua state.unlocked — mỗi định nghĩa mang unlockKey trỏ vào khóa mở
  // khóa tương ứng. Panel túi dùng hàm này để LIỆT KÊ ngăn cốt truyện;
  // thiếu bước liệt kê này là lỗi đợt nóng 3B (nhận công pháp ở tháp xong
  // mở túi ra trống, hai quyển sách vô hình dù đã sở hữu thật).
  function storyItemsOwned(state) {
    var owned = [];
    if (!state || !Array.isArray(state.unlocked)) return owned;
    for (var id in ITEM_DEFS) {
      var def = ITEM_DEFS[id];
      if (def.storySlot && def.unlockKey && state.unlocked.indexOf(def.unlockKey) >= 0) owned.push(id);
    }
    return owned;
  }
  function syncBagMirrors(state) {
    if (!state.items || typeof state.items !== 'object') state.items = { dan: 0 };
    state.items.dan = bagCount(state, 'hoi_khi_dan');
    var gear = [];
    if (bagHas(state, 'kiem_hua_gia')) gear.push('kiem_hua_gia');
    if (bagHas(state, 'kiem_phong')) gear.push('kiem_phong');
    if (bagHas(state, 'ngoc_tu_linh')) gear.push('ngoc_tu_linh');
    state.gear = gear;
  }
  function soulServiceDue(state) {
    // Dịch vụ luyện hồn KÍN đóng hẳn từ chương 10 (q10_loi_moi): khi thân
    // phận Hồn Sư sắp lộ, đường kín không còn an toàn nữa (phần 3, chương 10).
    return !!(state.flags && state.flags.soulSecret) && chapterOfQuest(state) < 10 && (state.flags.soulPaidFor || 0) < chapterOfQuest(state);
  }
  function healSoul(state) {
    // Lần chữa hồn đầu tiên ở Trần gia: thân phận Hồn Sư nhị phẩm thức tỉnh.
    if (!state.flags.soulSecret) {
      state.flags.soulSecret = true;
      state.soulRank = 2;
      state.soulPower = (state.soulPower || 0) + 40;
      return { first: true };
    }
    state.soulPower = (state.soulPower || 0) + 10;
    return { first: false };
  }
  // Đột phá: cần tu vi đầy tầng. Bản v1 tầng đầu chắc chắn thành công nhờ dư âm
  // chấn động thiên địa (các tầng sau sẽ có tỉ lệ — ghi trong design.md).
  function tryBreakthrough(state) {
    var r = REALMS[state.realm];
    if (!r || !r.tuviNext) return { ok: false, reason: 'Chưa có đường đột phá.' };
    if (state.tuvi < r.tuviNext) return { ok: false, reason: 'Tu vi chưa đầy (' + state.tuvi + '/' + r.tuviNext + ').' };
    if (state.realm === 0) {
      state.realm = 1; state.stage = 0;
    } else if (state.stage < r.stages.length - 1) {
      state.stage += 1;
    } else {
      state.realm += 1; state.stage = 0;
    }
    state.tuvi = 0;
    state.hpMax += 20; state.hp = state.hpMax;
    if (state.realm === 1 && state.stage === 0 && state.unlocked.indexOf('luyenkhi1') < 0) state.unlocked.push('luyenkhi1');
    // Đạt Kim Đan Sơ Kỳ: Vạn Âm Cộng Hưởng thành bậc Hưởng — mở khóa Định Âm và Phong Âm.
    // Đây là điểm cấp khóa 'kimdan' DUY NHẤT trong luồng chơi thường.
    if (state.realm === 3 && state.stage === 0 && state.unlocked.indexOf('kimdan') < 0) state.unlocked.push('kimdan');
    // Đạt Luyện Khí tầng 1 = bắt đầu tu tiên chính thức: mở ví Linh Thạch —
    // tiền tệ của giới tu tiên (phàm nhân chỉ dùng lượng bạc trong lời thoại).
    if (state.realm === 1 && state.stage === 0) state.linhUnlocked = true;
    return { ok: true, label: realmName(state.realm, state.stage) };
  }

  /* ---------------- Thiên kiếp + điều kiện đột phá (docs/realm-prep/) ----
     Toàn bộ tầng số của hệ nằm ở đây dưới dạng hàm thuần để kiểm thử
     được: hồ sơ đạo lôi theo cảnh giới đích, toán sát thương một đạo,
     ước tính điểm chuẩn bị công khai, giá thất bại, đối hưởng thiên lôi,
     tuyên cáo Thiên Đạo và ma trận điều kiện đột phá. Sự kiện tương tác
     (lựa chọn từng đạo) nằm ở js/game.js theo khuôn resolveGuardWave. */
  // Hồ sơ theo CẢNH GIỚI ĐÍCH (khóa của TRIBULATION_PROFILES là realm
  // đích): Trúc Cơ 3 đạo tổng 66% và Kim Đan 5 đạo tổng 106% là SỐ ĐÃ
  // DUYỆT (thiết kế mục 4.1/4.2). Nguyên Anh/Hóa Thần là KHUNG ở mục
  // 4.3: mảng phần trăm và ngưỡng đạo cuối là số duyệt trong khung, các
  // ngưỡng giữa nội suy đều — hai mốc này chưa có nội dung độ kiếp
  // riêng; breakthroughInfo đánh dấu tribulationOpen = false cho chúng.
  var TRIBULATION_PROFILES = {
    2: { bolts: [{ pct: 18, uy: 90 }, { pct: 22, uy: 110 }, { pct: 26, uy: 130 }] },
    3: { bolts: [{ pct: 16, uy: 130 }, { pct: 18, uy: 140 }, { pct: 20, uy: 150 }, { pct: 24, uy: 165 }, { pct: 28, uy: 180 }] },
    4: { bolts: [{ pct: 16, uy: 150 }, { pct: 18, uy: 165 }, { pct: 20, uy: 180 }, { pct: 22, uy: 195 }, { pct: 24, uy: 205 }, { pct: 26, uy: 212 }, { pct: 30, uy: 220 }] },
    5: { bolts: [{ pct: 16, uy: 190 }, { pct: 18, uy: 200 }, { pct: 20, uy: 212 }, { pct: 22, uy: 224 }, { pct: 24, uy: 236 }, { pct: 26, uy: 248 }, { pct: 28, uy: 258 }, { pct: 30, uy: 268 }, { pct: 34, uy: 280 }] }
  };
  var TRIB_REDUCTION_CAP = 0.90;    // trần tổng giảm trừ một đạo (trừ đối hưởng thiên lôi)
  var TRIB_DAN_CUT = 0.60;          // Hộ Thể Đan: giảm 60% sát thương một đạo
  var TRIB_PHU_CUT = 0.85;          // Tị Lôi Phù: giảm 85% sát thương một đạo
  var TRIB_PHAP_CUT = 0.25;         // Dẫn Lôi Pháp trong túi: bị động giảm 25% mọi đạo
  var TRIB_GUARD_CUT_FULL = 0.20;   // hộ pháp trọn vẹn, chưa từng vỡ: giảm 20% mọi đạo
  var TRIB_GUARD_CUT_BROKEN = 0.10; // hộ pháp xong nhưng từng vỡ ít nhất một lần: giảm 10%
  var TRIB_SPEAK_BOOST = 0.15;      // mỗi lần đối hưởng: mọi đạo còn lại +15% sát thương
  var TRIB_SPEAK_MAX = 2;           // trần số lần đối hưởng trong một lần độ kiếp
  var ANNOUNCE_LOG_MAX = 20;        // sổ thông cáo giữ tối đa 20 dòng gần nhất
  // Loại tuyên cáo đăng ký đợt này chỉ có 'tribulation_success'; các
  // loại giữ chỗ của thiết kế ('boss_down', 'sect_event', 'world_event')
  // chưa đăng ký — publishAnnounce từ chối mọi loại ngoài danh sách này.
  var ANNOUNCE_TYPES = ['tribulation_success'];

  function tribProfileFor(targetRealm) { return TRIBULATION_PROFILES[targetRealm] || null; }
  // Mức giảm hộ pháp suy từ số lần vỡ vòng hộ pháp của mốc tương ứng
  // (chương 8: flags.guardBroken; chương 12: flags.ketDanGuardBroken).
  function tribGuardCut(brokenCount) { return (brokenCount || 0) > 0 ? TRIB_GUARD_CUT_BROKEN : TRIB_GUARD_CUT_FULL; }
  /* Sát thương một đạo lôi (thiết kế mục 3.2–3.3): gốc = phần trăm
     hpMax -> nhân hệ số trời nghe (mỗi lần đối hưởng trước đó +15%) ->
     nhân giảm trừ bị động (Dẫn Lôi Pháp, hộ pháp) -> nhân giảm trừ chủ
     động của đạo đó ('dan' | 'phu') -> tổng giảm trừ chặn ở 90% so với
     sát thương đã nhân hệ số trời nghe -> làm tròn xuống, tối thiểu 1. */
  function tribBoltDamage(state, targetRealm, boltIdx, opts) {
    var prof = tribProfileFor(targetRealm); if (!prof) return 0;
    var bolt = prof.bolts[boltIdx]; if (!bolt) return 0;
    opts = opts || {};
    var base = (state.hpMax || 100) * bolt.pct / 100;
    var boosted = 1 + TRIB_SPEAK_BOOST * (opts.spokenBefore || 0);
    var mult = boosted;
    if (bagHas(state, 'dan_loi_phap')) mult *= (1 - TRIB_PHAP_CUT);
    mult *= (1 - (opts.guardCut || 0));
    if (opts.active === 'dan') mult *= (1 - TRIB_DAN_CUT);
    else if (opts.active === 'phu') mult *= (1 - TRIB_PHU_CUT);
    var minMult = boosted * (1 - TRIB_REDUCTION_CAP);
    if (mult < minMult) mult = minMult;
    return Math.max(1, Math.floor(base * mult));
  }
  /* Đòn cộng hưởng mạnh nhất đang dùng được, KHÔNG tiêu Tĩnh Âm — cho
     bảng chuẩn bị và cho lựa chọn đối hưởng. Uy lực tính đúng công thức
     của castWord: gốc chiêu + Tĩnh Âm x 1,5 + kiếm ngân trợ hưởng của
     vũ khí đang đeo. Trả null khi: đã đối hưởng đủ 2 lần, chưa mở chiêu
     cộng hưởng nào, hoặc Tĩnh Âm không đủ bất kỳ chiêu nào. */
  function tribBestResonance(state, spokenCount) {
    if (!state || !state.unlocked) return null;
    if ((spokenCount || 0) >= TRIB_SPEAK_MAX) return null;
    var best = null;
    for (var i = 0; i < WORD_SKILLS.length; i++) {
      var sk = WORD_SKILLS[i];
      if (state.unlocked.indexOf(sk.unlock) < 0) continue;
      if ((state.silence || 0) < sk.cost) continue;
      var p = wordPower(sk, state.silence) + weaponBonus(state).word;
      if (!best || p > best.power) best = { skillId: sk.id, word: sk.word, power: p, cost: sk.cost };
    }
    return best;
  }
  /* Ước tính điểm chuẩn bị — công khai trước khi bước vào (thiết kế
     mục 3.4): phương án tiết kiệm nhất với đồ đang trong túi (phù mạnh
     hơn nên dành cho các đạo nặng nhất), KHÔNG tính đối hưởng thiên
     lôi. Nhận định ba mức: còn lại trên 25% máu tối đa = đủ sức; còn
     lại dương nhưng mỏng = căng; không dương = nguy hiểm. */
  function tribEstimate(state, targetRealm, guardCut) {
    var prof = tribProfileFor(targetRealm); if (!prof) return null;
    var phuLeft = bagCount(state, 'ti_loi_phu'), danLeft = bagCount(state, 'ho_the_dan');
    var order = prof.bolts.map(function (b, i) { return i; }).sort(function (a, b) { return prof.bolts[b].pct - prof.bolts[a].pct; });
    var assign = {};
    for (var k = 0; k < order.length; k++) {
      if (phuLeft > 0) { assign[order[k]] = 'phu'; phuLeft--; }
      else if (danLeft > 0) { assign[order[k]] = 'dan'; danLeft--; }
    }
    var total = 0, perBolt = [];
    for (var i = 0; i < prof.bolts.length; i++) {
      var d = tribBoltDamage(state, targetRealm, i, { guardCut: guardCut || 0, active: assign[i] || 'none', spokenBefore: 0 });
      perBolt.push(d); total += d;
    }
    var remain = (state.hp || 0) - total;
    var verdict = remain > (state.hpMax || 100) * 0.25 ? 'safe' : (remain > 0 ? 'tight' : 'danger');
    return {
      bolts: prof.bolts.length, totalDamage: total, remain: remain, perBolt: perBolt, verdict: verdict,
      verdictText: verdict === 'safe' ? 'Đủ sức vượt qua' : (verdict === 'tight' ? 'Căng — nên chuẩn bị thêm' : 'Nguy hiểm — chắc chắn trọng thương')
    };
  }
  /* Cái giá của một lần độ kiếp thất bại (thiết kế mục 6.1): tu vi về
     50% trần của tầng đang đầy, máu về 1, đặt cờ trọng thương. Cảnh
     giới, giai đoạn, nhiệm vụ, kết quả hộ pháp và Tĩnh Âm KHÔNG đổi —
     việc mất vật dẫn do tầng sự kiện ở game.js chịu (đan đã nuốt). */
  function applyTribFailure(state) {
    var r = REALMS[state.realm];
    var cap = r && r.tuviNext ? r.tuviNext : 0;
    if (cap) state.tuvi = Math.floor(cap / 2);
    state.hp = 1;
    if (!state.flags) state.flags = {};
    state.flags.trongThuong = true;
    state.flags.ttPillCount = 0;
    state.flags.ttElderSeen = false; // trưởng lão sẽ nhắc về trọng thương ở lần gặp kế
    return { tuvi: state.tuvi, hp: state.hp };
  }
  /* Đường hồi phục trọng thương thứ hai (mục 6.1): mỗi viên Hồi Khí
     Đan dùng trong lúc mang thương tính một nấc; đủ 2 viên thì thương
     thế khép lại. Đường thứ nhất (nghỉ tại điểm linh khí tới khi máu
     đầy) gọi thẳng clearTrongThuong ở game.js. */
  function noteHoiKhiDanUsed(state) {
    if (!state || !state.flags || !state.flags.trongThuong) return { cleared: false };
    state.flags.ttPillCount = (state.flags.ttPillCount || 0) + 1;
    if (state.flags.ttPillCount >= 2) { state.flags.trongThuong = false; state.flags.ttPillCount = 0; return { cleared: true }; }
    return { cleared: false, count: state.flags.ttPillCount };
  }
  function clearTrongThuong(state) {
    if (!state || !state.flags) return false;
    var was = !!state.flags.trongThuong;
    state.flags.trongThuong = false; state.flags.ttPillCount = 0;
    return was;
  }
  /* Tuyên cáo Thiên Đạo — hàm cửa duy nhất publishAnnounce (thiết kế
     mục 9.1). Chỉ lần nâng ĐẠI cảnh giới thành công mới đủ tư cách
     (realmTo >= 2); khóa chống trùng theo cặp (tên nhân vật, cảnh
     giới đích); sổ giữ tối đa 20 dòng. Trả mục vừa ghi, hoặc null khi
     không đủ tư cách / trùng / loại chưa đăng ký. */
  function publishAnnounce(state, evt) {
    if (!state || !evt) return null;
    if (ANNOUNCE_TYPES.indexOf(evt.type) < 0) return null;
    if (evt.type === 'tribulation_success' && !(evt.realmTo >= 2)) return null;
    if (!Array.isArray(state.announceLog)) state.announceLog = [];
    for (var i = 0; i < state.announceLog.length; i++) {
      var e0 = state.announceLog[i];
      if (e0 && e0.type === evt.type && e0.name === state.name && e0.realmTo === evt.realmTo) return null;
    }
    var label = realmName(evt.realmTo, 0);
    var entry = {
      type: evt.type, name: state.name, realmTo: evt.realmTo, realmLabel: label,
      text: 'Thiên Đạo chứng giám — ' + state.name + ' độ kiếp thành công, bước vào ' + label + '.',
      day: state.dayCount || 0,
      minutes: (typeof state.dayMinutes === 'number' ? state.dayMinutes : DAY_DEFAULT_MINUTES)
    };
    state.announceLog.push(entry);
    while (state.announceLog.length > ANNOUNCE_LOG_MAX) state.announceLog.shift();
    return entry;
  }
  /* Ma trận điều kiện đột phá (thiết kế mục 2): giai đoạn Trúc Cơ chỉ
     đột phá trong sự kiện đóng chương tương ứng — điều kiện phụ của
     chúng là mốc truyện đó, hiển thị rõ còn thiếu gì. Tiểu tầng Luyện
     Khí và giai đoạn Kim Đan không thêm cổng phụ (mục 2.2/2.5). */
  var TRIB_STAGE_MILESTONES = {
    '2:0': { quest: 'q9_done', label: 'Hoàn thành sự kiện đóng chương 9 tại Thung Lũng Hồi Phong', hint: 'Đột phá Trúc Cơ Trung Kỳ diễn ra trong cảnh đóng chương 9.' },
    '2:1': { quest: 'q10_done', label: 'Hoàn thành sự kiện đóng chương 10 tại Thiên Cơ Các', hint: 'Đột phá Trúc Cơ Hậu Kỳ diễn ra trong cảnh đóng chương 10.' },
    '2:2': { quest: 'q11_vat_dan', label: 'Hoàn thành mốc Viên Mãn của chương 11 (gặp trưởng lão khi tu vi đầy)', hint: 'Đột phá Trúc Cơ Viên Mãn diễn ra trong cảnh chương 11 tại đại điện.' }
  };
  /* Điều kiện của mốc đột phá KẾ TIẾP — nguồn sự thật duy nhất cho
     hiển thị (panel đột phá ở game.js) và cho lớp chặn ở nút Đột phá.
     kind: 'none' (chưa có đường), 'minor' (tiểu tầng / mốc thức tỉnh),
     'stage' (giai đoạn trong cùng đại cảnh giới), 'great' (qua đại
     cảnh giới — có thiên kiếp; tribulationOpen = false khi mốc chưa
     có nội dung độ kiếp riêng: Nguyên Anh, Hóa Thần). */
  function breakthroughInfo(state) {
    if (!state) return null;
    var r = REALMS[state.realm]; if (!r) return null;
    var info = {
      realm: state.realm, stage: state.stage,
      tuviCur: Math.floor(state.tuvi || 0), tuviNeed: r.tuviNext || 0,
      tuviOk: !!r.tuviNext && (state.tuvi || 0) >= r.tuviNext,
      kind: 'minor', targetLabel: '', conditions: [], tribulation: null, tribulationOpen: false
    };
    if (!r.tuviNext) { info.kind = 'none'; return info; }
    if (state.stage < r.stages.length - 1) {
      info.targetLabel = realmName(state.realm, state.stage + 1);
      var ms = state.realm === 2 ? TRIB_STAGE_MILESTONES['2:' + state.stage] : null;
      if (ms) {
        info.kind = 'stage';
        info.conditions.push({ id: 'milestone', label: ms.label, ok: questReached(state, ms.quest), hint: ms.hint });
      }
      return info;
    }
    info.targetLabel = realmName(state.realm + 1, 0);
    if (state.realm === 0) return info; // Phàm Nhân -> Luyện Khí tầng 1: mốc thức tỉnh, không thiên kiếp (mục 2.1)
    info.kind = 'great';
    info.tribulation = tribProfileFor(state.realm + 1);
    info.tribulationOpen = state.realm + 1 === 2 || state.realm + 1 === 3;
    return info;
  }
  /* Lớp chặn cho nút Đột phá thường: null = cứ để tryBreakthrough xử
     như cũ; {reason} = chặn kèm lý do hiển thị; {reason:'great_border'}
     = biên đại cảnh giới (game.js tự có câu chữ riêng cho từng biên đã
     mở và cho các biên chưa mở nội dung độ kiếp). Chưa đầy tu vi thì
     không chặn ở đây — tryBreakthrough báo lý do như cũ. */
  function stageGateBlocked(state) {
    var info = breakthroughInfo(state);
    if (!info || !info.tuviOk) return null;
    if (info.kind === 'stage') {
      for (var i = 0; i < info.conditions.length; i++) {
        if (!info.conditions[i].ok) return { reason: 'Chưa đủ điều kiện đột phá: ' + info.conditions[i].label + '. ' + (info.conditions[i].hint || '') };
      }
      return null;
    }
    if (info.kind === 'great') return { reason: 'great_border', info: info };
    return null;
  }

  /* ---------------- Chu kỳ ngày đêm (đợt "Bản đồ mượt + Ngày đêm") ----------------
     Đồng hồ thế giới: phút-trong-ngày (0..1440, cho phép lẻ) nằm trong save
     của nhân vật (state.dayMinutes). Pha sáng là hàm LIÊN TỤC theo giờ: nội
     suy tuyến tính giữa các mốc neo dưới đây — không nhảy bậc. Độ tối hiệu
     dụng bị chặn bởi sàn sáng ban đêm NIGHT_DARK_MAX: đêm vẫn nhìn rõ đường
     đi và NPC. Giờ giấc KHÔNG khóa nhiệm vụ/cổng/NPC nào — chỉ ánh sáng và
     không khí (điểm móc cho NPC sinh hoạt theo giờ: docs/part2-design.md
     mục "Ngày đêm"). Mọi số nằm ở hằng số có tên tại đây. */
  var DAY_MINUTES = 1440;                 // phút trong một ngày game
  var DAY_DEFAULT_MINUTES = 480;          // 08:00 — giờ mặc định cho save cũ/nhân vật mới
  var NIGHT_DARK_MAX = 0.45;              // trần độ phủ tối ban đêm (sàn sáng)
  // Tốc độ đồng hồ theo cài đặt: số PHÚT THẬT cho một ngày game, và tốc độ
  // quy đổi phút-game/giây-thật tương ứng (1440 / (phút thật * 60)).
  var DAYNIGHT_REAL_MIN_PER_DAY = { slow: 20, normal: 10, fast: 5 };
  var DAYNIGHT_MIN_PER_SEC = { slow: 1.2, normal: 2.4, fast: 4.8 };
  // Mốc neo pha sáng: m = phút trong ngày, dark = độ tối chuẩn hóa 0..1
  // (nhân NIGHT_DARK_MAX ra độ phủ thật), warm = độ ấm tông màu 0..1
  // (chạng vạng/bình minh ấm lên, trưa và đêm khuya về 0).
  var DAY_PHASE_KEYS = [
    { m: 0, dark: 1, warm: 0 },        // 00:00 đêm khuya
    { m: 300, dark: 1, warm: 0 },      // 05:00 vẫn đêm
    { m: 360, dark: 0.72, warm: 0.35 },// 06:00 bình minh bắt đầu
    { m: 450, dark: 0.12, warm: 0.85 },// 07:30 mặt trời lên, tông ấm
    { m: 540, dark: 0, warm: 0.25 },   // 09:00 sáng trong
    { m: 720, dark: 0, warm: 0 },      // 12:00 trưa
    { m: 960, dark: 0, warm: 0.15 },   // 16:00 chiều
    { m: 1050, dark: 0.12, warm: 0.7 },// 17:30 chiều tà
    { m: 1140, dark: 0.68, warm: 0.95 },// 19:00 hoàng hôn
    { m: 1200, dark: 1, warm: 0.3 },   // 20:00 đêm xuống
    { m: 1290, dark: 1, warm: 0 },     // 21:30 đêm khuya
    { m: 1440, dark: 1, warm: 0 }      // 24:00 = 00:00
  ];
  function normalizeDayMinutes(v) {
    var n = Number(v);
    if (!isFinite(n)) return DAY_DEFAULT_MINUTES;
    n = n % DAY_MINUTES;
    if (n < 0) n += DAY_MINUTES;
    return n;
  }
  // Pha sáng tại một phút-trong-ngày bất kỳ: nội suy tuyến tính giữa hai mốc
  // neo kề nhau. Trả: dark = độ phủ tối HIỆU DỤNG (đã nhân trần 0,45),
  // night = hệ số đêm 0..1 (cho quầng đèn/sao/hào quang), warm = tông ấm,
  // r/g/b = màu lớp phủ (đêm lạnh ngả ấm theo warm).
  function dayPhaseAt(minutes) {
    var m = normalizeDayMinutes(minutes);
    var a = DAY_PHASE_KEYS[0], b = DAY_PHASE_KEYS[DAY_PHASE_KEYS.length - 1];
    for (var i = 0; i < DAY_PHASE_KEYS.length - 1; i++) {
      if (m >= DAY_PHASE_KEYS[i].m && m <= DAY_PHASE_KEYS[i + 1].m) { a = DAY_PHASE_KEYS[i]; b = DAY_PHASE_KEYS[i + 1]; break; }
    }
    var span = b.m - a.m, t = span > 0 ? (m - a.m) / span : 0;
    var darkN = a.dark + (b.dark - a.dark) * t;
    var warm = a.warm + (b.warm - a.warm) * t;
    return {
      minutes: m,
      dark: darkN * NIGHT_DARK_MAX,
      night: darkN,
      warm: warm,
      r: Math.round(10 + (122 - 10) * warm),
      g: Math.round(16 + (54 - 16) * warm),
      b: Math.round(44 + (18 - 44) * warm),
      isNight: darkN >= 0.5
    };
  }
  // Tiến đồng hồ dt giây thật theo tốc độ cài đặt ('slow'|'normal'|'fast';
  // giá trị lạ rơi về 'normal'). Vòng qua 24h nhờ normalizeDayMinutes.
  function advanceDayClock(state, dtSec, speedKey) {
    if (!state) return 0;
    var cur = (typeof state.dayMinutes === 'number' && isFinite(state.dayMinutes)) ? state.dayMinutes : DAY_DEFAULT_MINUTES;
    var rate = DAYNIGHT_MIN_PER_SEC[speedKey] || DAYNIGHT_MIN_PER_SEC.normal;
    var dt = Number(dtSec);
    if (!isFinite(dt) || dt < 0) dt = 0;
    state.dayMinutes = normalizeDayMinutes(cur + rate * dt);
    return state.dayMinutes;
  }
  // Phút HIỂN THỊ theo chế độ cài đặt: 'day' ghim 12:00, 'night' ghim 00:00,
  // còn lại ('cycle' hoặc lạ) dùng giờ thật trong save.
  function displayDayMinutes(state, mode) {
    if (mode === 'day') return 720;
    if (mode === 'night') return 0;
    return normalizeDayMinutes(state ? state.dayMinutes : undefined);
  }
  function dayPhaseFor(state, mode) { return dayPhaseAt(displayDayMinutes(state, mode)); }
  function formatDayTime(minutes) {
    var m = Math.floor(normalizeDayMinutes(minutes));
    var hh = Math.floor(m / 60), mm = m % 60;
    return (hh < 10 ? '0' : '') + hh + ':' + (mm < 10 ? '0' : '') + mm;
  }

  /* ---------------- Ví Linh Thạch ---------------- */
  // Linh Thạch bị khóa ở giai đoạn phàm nhân: không hiện ví, không cộng được.
  // Mốc mở: đột phá Luyện Khí tầng 1 (xem tryBreakthrough ở trên).
  var LINH_GIFT_AMOUNT = 50; // lộ phí trưởng lão tặng khi hoàn tất bản v1 — bảng kinh tế: docs/part2-design.md
  function walletOpen(state) { return !!state && state.linhUnlocked === true; }
  // Định dạng số có dấu phân cách nghìn kiểu Việt Nam: 1234567 -> "1.234.567".
  function fmtNum(n) {
    var neg = Number(n) < 0;
    var s = String(Math.floor(Math.abs(Number(n) || 0)));
    var out = '';
    while (s.length > 3) { out = '.' + s.slice(-3) + out; s = s.slice(0, -3); }
    return (neg ? '-' : '') + s + out;
  }
  function linhBalance(state) {
    if (!state || typeof state.linhThach !== 'number' || !isFinite(state.linhThach) || state.linhThach < 0) return 0;
    return Math.floor(state.linhThach);
  }
  function addLinhThach(state, n) {
    n = Math.floor(Number(n) || 0);
    if (!state) return { ok: false, reason: 'Chưa có nhân vật.' };
    if (!(n > 0)) return { ok: false, reason: 'Số Linh Thạch cộng vào phải lớn hơn 0.' };
    if (!walletOpen(state)) return { ok: false, reason: 'Chưa bắt đầu tu tiên — Linh Thạch là tiền của giới tu tiên, phàm nhân chưa dùng được.' };
    state.linhThach = linhBalance(state) + n;
    return { ok: true, balance: state.linhThach };
  }
  function spendLinhThach(state, n) {
    n = Math.floor(Number(n) || 0);
    if (!state) return { ok: false, reason: 'Chưa có nhân vật.' };
    if (!(n > 0)) return { ok: false, reason: 'Số Linh Thạch chi ra phải lớn hơn 0.' };
    if (!walletOpen(state)) return { ok: false, reason: 'Chưa bắt đầu tu tiên — ví Linh Thạch chưa mở.' };
    var bal = linhBalance(state);
    if (bal < n) return { ok: false, reason: 'Không đủ Linh Thạch (đang có ' + fmtNum(bal) + ', cần ' + fmtNum(n) + ').', balance: bal };
    state.linhThach = bal - n;
    return { ok: true, balance: state.linhThach };
  }
  /* ---------------- Điểm cống hiến tông môn (chương 7) ----------------
     Trục tích lũy thứ ba, tách hẳn khỏi Linh Thạch: việc tạp dịch và các
     mốc trong tông ghi điểm vào đây; Linh Thạch vẫn là tiền tệ duy nhất. */
  function addSectMerit(state, n) {
    if (!state) return 0;
    var cur = (typeof state.sectMerit === 'number' && isFinite(state.sectMerit) && state.sectMerit > 0) ? Math.floor(state.sectMerit) : 0;
    var add = Math.floor(Number(n) || 0);
    state.sectMerit = cur + Math.max(0, add);
    return state.sectMerit;
  }
  // Nạp save cũ (trước khi có ví): bổ sung trường còn thiếu, không lỗi.
  // Save đã qua mốc đột phá Luyện Khí tầng 1 (realm >= 1 hoặc đã ghi mốc
  // 'luyenkhi1') thì ví mở sẵn; chưa tới mốc thì ví vẫn khóa.
  function normalizeSave(state) {
    if (!state || typeof state !== 'object') return state;
    state.linhThach = linhBalance(state);
    // Ví bạc phàm tục (đợt sửa lỗi nhiệm vụ nấu ăn 2026-11-05): save cũ
    // chưa có trường này -> mang theo vốn khởi đầu SILVER_START một lần
    // (vốn liếng của nhân vật, không phải thưởng nhiệm vụ).
    if (typeof state.silver !== 'number' || !isFinite(state.silver) || state.silver < 0) state.silver = SILVER_START;
    else state.silver = Math.floor(state.silver);
    state.dayMinutes = normalizeDayMinutes(state.dayMinutes); // save cũ chưa có đồng hồ -> 08:00 mặc định, không lỗi
    // Hệ cày + lớp công pháp (làn chạm trán): save cũ không có các trường
    // này -> dựng mặc định an toàn, suy công pháp đã học từ unlocked như
    // thiết kế di trú của docs/congphap-prep mục 2.3; không mất dữ kiện cũ.
    if (typeof state.dayCount !== 'number' || !isFinite(state.dayCount) || state.dayCount < 0) state.dayCount = 0;
    else state.dayCount = Math.floor(state.dayCount);
    ensureGrind(state);
    ensureSecretRealms(state);
    ensureParty(state);
    ensureSideQuests(state);
    ensureTechniques(state);
    ensureNguHanh(state);
    if (!state.flags || typeof state.flags !== 'object') state.flags = { tested: false, voiced: false, dummyBroken: false, metUNhan: false, ltGift: false, starterWeaponGift: false, wroteFirst: false, evidence: false, ltLetter: false };
    if (typeof state.flags.ltGift !== 'boolean') state.flags.ltGift = false;
    if (typeof state.flags.starterWeaponGift !== 'boolean') state.flags.starterWeaponGift = false;
    if (typeof state.flags.dummyBroken !== 'boolean') state.flags.dummyBroken = false;
    if (typeof state.flags.wroteFirst !== 'boolean') state.flags.wroteFirst = false;
    if (typeof state.flags.evidence !== 'boolean') state.flags.evidence = false;
    if (typeof state.flags.ltLetter !== 'boolean') state.flags.ltLetter = false;
    if (typeof state.flags.innWork !== 'number') state.flags.innWork = 0;
    if (typeof state.flags.thuocReward !== 'boolean') state.flags.thuocReward = false;
    if (typeof state.flags.invited !== 'boolean') state.flags.invited = false;
    if (typeof state.flags.queueSeen !== 'boolean') state.flags.queueSeen = false;
    if (typeof state.flags.measured !== 'boolean') state.flags.measured = false;
    if (typeof state.flags.thienCoSeen !== 'boolean') state.flags.thienCoSeen = false;
    if (typeof state.flags.clueKho !== 'boolean') state.flags.clueKho = false;
    if (typeof state.flags.clueWitness !== 'boolean') state.flags.clueWitness = false;
    if (typeof state.flags.usedChanCh4 !== 'boolean') state.flags.usedChanCh4 = false;
    if (typeof state.flags.daoNoticedVoice !== 'boolean') state.flags.daoNoticedVoice = false;
    if (typeof state.flags.thienCoPaid !== 'boolean') state.flags.thienCoPaid = false;
    if (typeof state.soulRank !== 'number' || !(state.soulRank >= 0)) state.soulRank = 0;
    if (typeof state.soulPower !== 'number' || !(state.soulPower >= 0)) state.soulPower = 0;
    if (typeof state.flags.soulSecret !== 'boolean') state.flags.soulSecret = false;
    if (typeof state.flags.soulPaidFor !== 'number') state.flags.soulPaidFor = 0;
    if (typeof state.flags.uNhanSupported !== 'boolean') state.flags.uNhanSupported = false;
    if (typeof state.flags.duelSeen !== 'boolean') state.flags.duelSeen = false;
    if (typeof state.flags.dowrySeen !== 'boolean') state.flags.dowrySeen = false;
    if (typeof state.flags.atkWave !== 'number') state.flags.atkWave = 0;
    if (typeof state.flags.atkFallback !== 'boolean') state.flags.atkFallback = false;
    if (typeof state.flags.hbcPaid !== 'boolean') state.flags.hbcPaid = false;
    if (typeof state.flags.bagUnlocked !== 'boolean') state.flags.bagUnlocked = false;
    // Đợt đồ ăn (2026-11-04): cờ vòng đời đồ ăn + ngày hái của hai bãi nấm — save cũ thiếu thì dựng mặc định an toàn.
    if (typeof state.flags.foodBought !== 'boolean') state.flags.foodBought = false;
    if (typeof state.flags.foodGathered !== 'boolean') state.flags.foodGathered = false;
    if (typeof state.flags.foodCooked !== 'boolean') state.flags.foodCooked = false;
    if (typeof state.flags.foodEaten !== 'boolean') state.flags.foodEaten = false;
    if (typeof state.flags.foodGiftInn !== 'boolean') state.flags.foodGiftInn = false;
    if (typeof state.flags.foodHintSeen !== 'boolean') state.flags.foodHintSeen = false;
    if (typeof state.flags.foodPatchDayTran !== 'number') state.flags.foodPatchDayTran = -1;
    if (typeof state.flags.foodPatchDayDuongMon !== 'number') state.flags.foodPatchDayDuongMon = -1;
    if (typeof state.sectMerit !== 'number' || !isFinite(state.sectMerit) || state.sectMerit < 0) state.sectMerit = 0;
    else state.sectMerit = Math.floor(state.sectMerit);
    if (typeof state.flags.sectSeen !== 'boolean') state.flags.sectSeen = false;
    if (typeof state.flags.choreGo !== 'boolean') state.flags.choreGo = false;
    if (typeof state.flags.choreNuoc !== 'boolean') state.flags.choreNuoc = false;
    if (typeof state.flags.choreBao !== 'boolean') state.flags.choreBao = false;
    if (typeof state.flags.choresPaid !== 'boolean') state.flags.choresPaid = false;
    if (typeof state.flags.tlRound !== 'number') state.flags.tlRound = 0;
    if (typeof state.flags.tlHits !== 'number') state.flags.tlHits = 0;
    if (typeof state.flags.hhtHits !== 'number') state.flags.hhtHits = 0;
    if (typeof state.flags.chuanBiSeen !== 'boolean') state.flags.chuanBiSeen = false;
    if (typeof state.flags.chiGathered !== 'boolean') state.flags.chiGathered = false;
    if (typeof state.flags.pillGranted !== 'boolean') state.flags.pillGranted = false;
    if (typeof state.flags.guardWave !== 'number') state.flags.guardWave = 0;
    if (typeof state.flags.guardBroken !== 'number') state.flags.guardBroken = 0;
    if (typeof state.flags.sectReward !== 'boolean') state.flags.sectReward = false;
    // Phần 3 (chương 9–12): cờ mới — save cũ thiếu thì dựng mặc định an toàn.
    if (typeof state.flags.herbGathered !== 'boolean') state.flags.herbGathered = false;
    if (typeof state.flags.pillMeritPaid !== 'boolean') state.flags.pillMeritPaid = false;
    if (typeof state.flags.ch9TinDu !== 'boolean') state.flags.ch9TinDu = false;
    if (typeof state.flags.ch9SayRescue !== 'boolean') state.flags.ch9SayRescue = false;
    if (typeof state.flags.ch9SilentRoute !== 'boolean') state.flags.ch9SilentRoute = false;
    if (typeof state.flags.ch9DoiDau !== 'boolean') state.flags.ch9DoiDau = false;
    if (typeof state.flags.ch9HonDau !== 'boolean') state.flags.ch9HonDau = false;
    if (typeof state.flags.ch9BreakReady !== 'boolean') state.flags.ch9BreakReady = false;
    if (typeof state.flags.ch9Reward !== 'boolean') state.flags.ch9Reward = false;
    if (typeof state.flags.hbDone !== 'boolean') state.flags.hbDone = false;
    if (typeof state.flags.soulRevealed !== 'boolean') state.flags.soulRevealed = false;
    if (typeof state.flags.soulPublic !== 'boolean') state.flags.soulPublic = false;
    if (typeof state.flags.soulExposed !== 'boolean') state.flags.soulExposed = false;
    // Bất biến phần 3: không bao giờ cả hai đường lộ thân phận cùng đúng.
    if (state.flags.soulPublic && state.flags.soulExposed) state.flags.soulExposed = false;
    if (typeof state.flags.soulClinicPaidFor !== 'number') state.flags.soulClinicPaidFor = 0;
    if (typeof state.flags.soulSectPaidFor !== 'number') state.flags.soulSectPaidFor = 0;
    if (typeof state.flags.sectJobPaidFor !== 'number') state.flags.sectJobPaidFor = 0;
    if (typeof state.flags.thienCoFeePaid !== 'boolean') state.flags.thienCoFeePaid = false;
    if (typeof state.flags.ch11HeQua !== 'boolean') state.flags.ch11HeQua = false;
    if (typeof state.flags.uNhanChoice !== 'boolean') state.flags.uNhanChoice = false;
    if (typeof state.flags.uNhanGift2 !== 'boolean') state.flags.uNhanGift2 = false;
    if (typeof state.flags.ketDanHerb !== 'boolean') state.flags.ketDanHerb = false;
    if (typeof state.flags.ketDanCoreGot !== 'boolean') state.flags.ketDanCoreGot = false;
    if (typeof state.flags.ketDanCoreExtra !== 'number') state.flags.ketDanCoreExtra = 0;
    if (typeof state.flags.ketDanRefined !== 'boolean') state.flags.ketDanRefined = false;
    if (typeof state.flags.ketDanGuardWave !== 'number') state.flags.ketDanGuardWave = 0;
    if (typeof state.flags.ketDanGuardBroken !== 'number') state.flags.ketDanGuardBroken = 0;
    if (typeof state.flags.ketDanGuardDone !== 'boolean') state.flags.ketDanGuardDone = false;
    if (typeof state.flags.ketDanSpokeSave !== 'boolean') state.flags.ketDanSpokeSave = false;
    if (typeof state.flags.lenDinhHold !== 'number') state.flags.lenDinhHold = 0;
    if (typeof state.flags.lenPhongSeal !== 'number') state.flags.lenPhongSeal = 0;
    if (typeof state.flags.lenUsedDinh !== 'number') state.flags.lenUsedDinh = 0;
    if (typeof state.flags.lenUsedPhong !== 'number') state.flags.lenUsedPhong = 0;
    if (typeof state.flags.kimDanReward !== 'boolean') state.flags.kimDanReward = false;
    if (typeof state.flags.sectJobRound !== 'number') state.flags.sectJobRound = 0;
    if (typeof state.flags.ch10BreakReady !== 'boolean') state.flags.ch10BreakReady = false;
    if (typeof state.flags.ch10RumorPending !== 'boolean') state.flags.ch10RumorPending = false;
    if (typeof state.flags.uNhanCityMet !== 'boolean') state.flags.uNhanCityMet = false;
    if (typeof state.flags.giaNhanHealed !== 'boolean') state.flags.giaNhanHealed = false;
    if (typeof state.flags.lenDinhDone !== 'boolean') state.flags.lenDinhDone = false;
    if (typeof state.flags.lenPhongDone !== 'boolean') state.flags.lenPhongDone = false;
    if (typeof state.flags.benhSeen !== 'boolean') state.flags.benhSeen = false;
    if (typeof state.flags.ch9PlanSeen !== 'boolean') state.flags.ch9PlanSeen = false;
    if (typeof state.flags.kdBeastWave !== 'number') state.flags.kdBeastWave = 0;

    // Thiên kiếp (docs/realm-prep/ mục 6.1, 9.1): ấn Thiên Đạo, trọng
    // thương sau độ kiếp hỏng, bộ đếm Hồi Khí Đan dưỡng thương, cờ quà
    // làm quen Hộ Thể Đan; sổ thông cáo là trường cấp state.
    if (typeof state.flags.thienDaoMark !== 'number') state.flags.thienDaoMark = 0;
    if (typeof state.flags.trongThuong !== 'boolean') state.flags.trongThuong = false;
    if (typeof state.flags.ttPillCount !== 'number') state.flags.ttPillCount = 0;
    if (typeof state.flags.hoTheDanGifted !== 'boolean') state.flags.hoTheDanGifted = false;
    if (typeof state.flags.ttElderSeen !== 'boolean') state.flags.ttElderSeen = false;
    if (!Array.isArray(state.announceLog)) state.announceLog = [];
    if (state.announceLog.length > 20) state.announceLog = state.announceLog.slice(state.announceLog.length - 20);

    // Cung IV (chương 13–16): cờ thưởng sự kiện chống trùng + cờ khóa
    // cộng hưởng chương 15 + bậc thang đài thách đấu — save cũ dựng mặc định.
    if (typeof state.flags.ch13Reward !== 'boolean') state.flags.ch13Reward = false;
    if (typeof state.flags.ch14Reward !== 'boolean') state.flags.ch14Reward = false;
    if (typeof state.flags.ch15Reward !== 'boolean') state.flags.ch15Reward = false;
    if (typeof state.flags.ch16Reward !== 'boolean') state.flags.ch16Reward = false;
    if (typeof state.flags.ch15ResonanceLock !== 'boolean') state.flags.ch15ResonanceLock = false;
    if (typeof state.flags.thanhLongPending !== 'boolean') state.flags.thanhLongPending = false;
    if (typeof state.flags.challengeWinsNoiMon !== 'number') state.flags.challengeWinsNoiMon = 0;
    if (typeof state.flags.challengeWinsTinhAnh !== 'number') state.flags.challengeWinsTinhAnh = 0;
    if (typeof state.flags.bcSauFirstPaid !== 'boolean') state.flags.bcSauFirstPaid = false;
    // Cung IV đợt 2 (chương 17–20): cờ thưởng sự kiện + lĩnh ngộ + công
    // nhận phẩm hồn 4 + bậc thang hạng vô địch + sổ dịch vụ hồn cấp tông.
    if (typeof state.flags.ch17Reward !== 'boolean') state.flags.ch17Reward = false;
    if (typeof state.flags.ch18Reward !== 'boolean') state.flags.ch18Reward = false;
    if (typeof state.flags.ch19Reward !== 'boolean') state.flags.ch19Reward = false;
    if (typeof state.flags.ch20Reward !== 'boolean') state.flags.ch20Reward = false;
    // Cung IV đợt 3 (chương 21–24): cờ thưởng sự kiện chống trùng.
    if (typeof state.flags.ch21Reward !== 'boolean') state.flags.ch21Reward = false;
    if (typeof state.flags.ch22Reward !== 'boolean') state.flags.ch22Reward = false;
    if (typeof state.flags.ch23Reward !== 'boolean') state.flags.ch23Reward = false;
    if (typeof state.flags.ch24Reward !== 'boolean') state.flags.ch24Reward = false;
    if (typeof state.flags.ch18Insight !== 'boolean') state.flags.ch18Insight = false;
    if (typeof state.flags.ch19Insight !== 'boolean') state.flags.ch19Insight = false;
    if (typeof state.flags.ch20SoulRecognized !== 'boolean') state.flags.ch20SoulRecognized = false;
    if (typeof state.flags.challengeWinsVoDich !== 'number') state.flags.challengeWinsVoDich = 0;
    if (typeof state.flags.soulGrandPaidFor !== 'number') state.flags.soulGrandPaidFor = 0;

    // Hồi tố bậc Hưởng: save đã qua mốc Kết Đan mà thiếu khóa 'kimdan' thì cấp lại.
    if (state.unlocked && state.realm >= 3 && state.unlocked.indexOf('kimdan') < 0) state.unlocked.push('kimdan');
    if (!state.items || typeof state.items !== 'object') state.items = { dan: 0 };
    if (typeof state.items.dan !== 'number' || !(state.items.dan >= 0)) state.items.dan = 0;
    if (!Array.isArray(state.gear)) state.gear = [];
    // Túi Trữ Vật: save cũ chưa có túi -> dựng túi từ đan/pháp khí cũ (giữ
    // nguyên số lượng đã mua), rồi đồng bộ ngược lại hai trường gương.
    if (!state.bag || typeof state.bag !== 'object' || !state.bag.items || typeof state.bag.items !== 'object') {
      var legacyBag = { tier: 1, items: {} };
      if (state.items.dan > 0) legacyBag.items.hoi_khi_dan = state.items.dan;
      if (state.gear.indexOf('kiem_hua_gia') >= 0) legacyBag.items.kiem_hua_gia = 1;
      if (state.gear.indexOf('kiem_phong') >= 0) legacyBag.items.kiem_phong = 1;
      if (state.gear.indexOf('ngoc_tu_linh') >= 0) legacyBag.items.ngoc_tu_linh = 1;
      state.bag = legacyBag;
    }
    bagOf(state); // chuẩn hóa tầng túi về khoảng hợp lệ
    syncBagMirrors(state);
    // Mở khóa hồi tố: ai đã nhận công pháp ở tháp (mốc mở túi của chương 3)
    // thì túi coi như đã được tặng rồi.
    if (state.unlocked && state.unlocked.indexOf('thanh_phong') >= 0) state.flags.bagUnlocked = true;
    var past = (typeof state.realm === 'number' && state.realm >= 1) ||
      !!(state.unlocked && state.unlocked.indexOf('luyenkhi1') >= 0);
    state.linhUnlocked = past ? true : state.linhUnlocked === true;
    if (!MAPS[state.map]) state.map = 'tran';
    if (!Array.isArray(state.spokeLedger)) state.spokeLedger = [];
    // Save cũ dừng ở mốc cuối bản v1: nối thẳng sang chương 2.
    if (state.quest === 'q_done') state.quest = 'q2_len_duong';
    // Save cũ dừng ở mốc cuối chương 2: nối thẳng sang chương 3.
    if (state.quest === 'q2_done') state.quest = 'q3_hang_cho';
    // Save cũ dừng ở mốc cuối chương 3: nối thẳng sang chương 4.
    if (state.quest === 'q3_done') state.quest = 'q4_thien_co';
    // Save cũ dừng ở mốc cuối chương 4: nối thẳng sang chương 5.
    if (state.quest === 'q4_done') state.quest = 'q5_hon_su';
    // Save cũ dừng ở mốc cuối chương 5: nối thẳng sang chương 6.
    if (state.quest === 'q5_done') state.quest = 'q6_sinh_le';
    // Save cũ dừng ở mốc cuối chương 6: nối thẳng sang chương 7.
    if (state.quest === 'q6_done') state.quest = 'q7_nhap_tong';
    // Save cũ dừng ở mốc cuối chương 7: nối thẳng sang chương 8.
    if (state.quest === 'q7_done') state.quest = 'q8_chuan_bi';
    // Save cũ dừng ở mốc cuối chương 8: nối thẳng sang chương 9 (phần 3).
    if (state.quest === 'q8_done') state.quest = 'q9_tin_du';
    // Save dừng ở mốc cuối chương 12 (cuối phần 3): nối thẳng sang cung IV.
    if (state.quest === 'q12_done') state.quest = 'q13_tro_lai_tong';
    // Save dừng ở mốc cuối chương 16 (đợt 1 cung IV): nối thẳng sang đợt 2.
    if (state.quest === 'q16_done') state.quest = 'q17_tin_tu_thap';
    // Save dừng ở mốc cuối chương 20 (đợt 2 cung IV): nối thẳng sang đợt 3.
    if (state.quest === 'q20_done') state.quest = 'q21_doan_thuong';
    // Cứu cờ THƯ MỜI lên Thanh Vân Tông (vá nhanh 2026-11-03): cổng lên
    // tông khóa bằng flags.invited, mà cờ này chỉ đặt ở đúng một chỗ —
    // callback của cảnh nhận thư mời cuối chương 6, cùng lúc quest thành
    // q6_done (rồi chuẩn hóa ở trên nối tiếp thành q7_nhap_tong). Vậy hễ
    // nhiệm vụ hiện tại đã ở q7_nhap_tong hoặc xa hơn theo thứ tự QUESTS
    // thì cảnh nhận thư mời CHẮC CHẮN đã chạy; save cũ đi đường khác mà
    // cờ bị mất/không kịp ghi không được kẹt cổng vĩnh viễn. Ngược lại,
    // save còn ở q6_thu_moi hoặc trước đó: giữ nguyên khóa như thiết kế.
    var qiInv = -1, wiInv = -1;
    for (var invI = 0; invI < QUESTS.length; invI++) {
      if (QUESTS[invI].id === state.quest) qiInv = invI;
      if (QUESTS[invI].id === 'q7_nhap_tong') wiInv = invI;
    }
    if (qiInv >= 0 && wiInv >= 0 && qiInv >= wiInv && !state.flags.invited) state.flags.invited = true;
    // Cấp bù VŨ KHÍ KHỞI ĐẦU đúng một lần cho save cũ (tạo trước đợt vá
    // 2026-11-02 mục B): nhân vật mới đã đeo sẵn Thiết Kiếm Hứa Gia từ
    // newCharacter; save cũ chưa từng có vũ khí thì cấp bù tại đây — theo
    // đúng tiền lệ ltGift ngay bên dưới (cờ starterWeaponGift chống cấp
    // trùng qua mọi lần nạp lại; trường starterWeaponJustGranted chỉ là
    // tín hiệu để lớp giao diện báo một lần). Ghi TRỰC TIẾP vào bag.items,
    // không qua bagAdd/bagCanAdd: khoản bù bắt buộc không được phép bị
    // sức chứa túi chặn (kiếm worn vốn không chiếm ô chứa), và túi khóa
    // tới chương 3 cũng không chặn — kiếm đeo trên người từ đầu game.
    if (!state.flags.starterWeaponGift) {
      if (!bagHas(state, 'kiem_hua_gia')) {
        bagOf(state).items.kiem_hua_gia = 1;
        state.starterWeaponJustGranted = true;
      }
      state.flags.starterWeaponGift = true;
      syncBagMirrors(state);
    }
    // Bù lộ phí trưởng lão NGAY trong khâu chuẩn hóa (đặt ở cuối hàm, sau
    // khi cờ mở ví linhUnlocked đã được suy ra): save đã hoàn tất bản v1
    // (đã phá cọc gỗ, ví đã mở) mà chưa nhận 50 Linh Thạch thì cộng luôn
    // tại đây — trước mọi lần vẽ giao diện — để ô ví không bao giờ hiện số
    // cũ rồi mới nhảy số (lỗi đã gặp ở chơi thử live 1.1.0). Cờ ltGift chống
    // nhận trùng; trường ltGiftJustGranted chỉ là tín hiệu để lớp giao diện
    // hiện thông báo một lần ngay sau khi nạp.
    if (state.flags.dummyBroken && !state.flags.ltGift && walletOpen(state)) {
      state.linhThach = linhBalance(state) + LINH_GIFT_AMOUNT;
      state.flags.ltGift = true;
      state.ltGiftJustGranted = true;
    }
    return state;
  }
  // Ghi một sự kiện âm thanh vào Sổ Dư Âm: dữ kiện truyện (nhân chứng, bối cảnh), tách
  // khỏi dữ liệu hiển thị — nền cho "giá của dư âm" ở các chương sau.
  function recordSpeech(state, ch, ctx, witnesses) {
    if (!state) return 0;
    if (!Array.isArray(state.spokeLedger)) state.spokeLedger = [];
    state.spokeLedger.push({ ch: ch, ctx: ctx, witnesses: witnesses });
    return state.spokeLedger.length;
  }

  /* ---------------- Chọn hướng 8 chiều + cần điều khiển cảm ứng ---------------- */
  // Chuẩn: docs/char-sheet-8dir.md mục 4 và docs/touch-joystick.md mục 3.
  // Hàng sheet theo chiều kim đồng hồ từ hướng xuống: 0 down, 1 down-right,
  // 2 right, 3 up-right, 4 up, 5 up-left, 6 left, 7 down-left.
  var DIR8_HYSTERESIS_DEG = 26.5; // nửa cung 22,5° + biên 4° (đợt làm lại di chuyển 2026-11-03 mục C: giảm từ 32,5° — dáng lệch hướng đi thật tối đa ~26,5° thay vì ~32,5°; biên 4° còn lại đủ chống nhấp nháy ở biên cung vì đổi qua lại đòi vector dao động > 8° quanh biên)
  var JOY_DEAD = 0.18;            // vùng chết = 18% bán kính cần
  var JOY_MIN_SPEED = 0.45;       // tốc độ tối thiểu khi vừa ra khỏi vùng chết
  var JOY_STICK_DIST = 12;        // kéo lệch quá 12px => chế độ cần
  var JOY_STICK_MS = 250;         // giữ quá 250ms => chế độ cần
  // Góc của vector đo từ trục xuống (a = atan2(dx, dy), dương về phía phải).
  // Trễ chuyển hướng: còn lệch khỏi tâm cung của hướng cũ không quá 26,5°
  // thì giữ hướng cũ, tránh rung hình khi vector đi gần biên cung.
  function dir8FromVector(dx, dy, prevDir8) {
    var prevOk = typeof prevDir8 === 'number' && isFinite(prevDir8) &&
      Math.floor(prevDir8) === prevDir8 && prevDir8 >= 0 && prevDir8 <= 7;
    var prev = prevOk ? prevDir8 : 0;
    if (!dx && !dy) return prev;
    var a = Math.atan2(dx, dy);
    var k = Math.round(a / (Math.PI / 4)) % 8;
    if (k < 0) k += 8;
    if (prevOk) {
      var center = (prev <= 4 ? prev * 45 : (prev - 8) * 45) * Math.PI / 180;
      var diff = Math.abs(Math.atan2(Math.sin(a - center), Math.cos(a - center)));
      if (diff <= DIR8_HYSTERESIS_DEG * Math.PI / 180 + 1e-9) return prev;
    }
    return k;
  }
  // Chuẩn hóa vector kéo của cần: áp vùng chết, tốc độ tỉ lệ từ JOY_MIN_SPEED
  // (ở mép vùng chết) tới 1 (ở mép vòng và quá mép), (ux, uy) là vector đơn vị.
  function joyNormalize(dxPx, dyPx, radius) {
    var r = Number(radius) || 0;
    var dist = Math.sqrt(dxPx * dxPx + dyPx * dyPx);
    var dead = JOY_DEAD * r;
    if (!(r > 0) || dist === 0 || dist <= dead) return { active: false, ux: 0, uy: 0, speed: 0 };
    var t = (dist - dead) / (r - dead);
    if (t < 0) t = 0; else if (t > 1) t = 1;
    return { active: true, ux: dxPx / dist, uy: dyPx / dist, speed: JOY_MIN_SPEED + (1 - JOY_MIN_SPEED) * t };
  }
  // Phân loại một lần chạm: kéo xa hoặc giữ lâu là 'stick', còn lại là 'tap'.
  function joyClassify(durationMs, distPx) {
    return (distPx > JOY_STICK_DIST || durationMs > JOY_STICK_MS) ? 'stick' : 'tap';
  }

  /* ---------------- Tài khoản local ---------------- */
  // storage: đối tượng có getItem/setItem/removeItem (localStorage hoặc bản giả lập trong test).
  var ACC_KEY = 'vslc_accounts', SAVE_PREFIX = 'vslc_save_', SAVE_BACKUP_PREFIX = 'vslc_save_backup_';
  function loadAccounts(storage) {
    try { return JSON.parse(storage.getItem(ACC_KEY) || '{}'); } catch (e) { return {}; }
  }
  function register(storage, sha256, username, password) {
    username = (username || '').trim();
    if (username.length < 3) return { ok: false, reason: 'Tên tài khoản cần ít nhất 3 ký tự.' };
    if (!password || password.length < 4) return { ok: false, reason: 'Mật khẩu cần ít nhất 4 ký tự.' };
    var accs = loadAccounts(storage);
    if (accs[username]) return { ok: false, reason: 'Tài khoản đã tồn tại.' };
    var salt = '';
    for (var i = 0; i < 12; i++) salt += 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'.charAt(Math.floor(Math.random() * 31));
    accs[username] = { salt: salt, hash: sha256(salt + '|' + password) };
    storage.setItem(ACC_KEY, JSON.stringify(accs));
    return { ok: true };
  }
  function login(storage, sha256, username, password) {
    var accs = loadAccounts(storage), a = accs[(username || '').trim()];
    if (!a) return { ok: false, reason: 'Không tìm thấy tài khoản.' };
    if (a.hash !== sha256(a.salt + '|' + password)) return { ok: false, reason: 'Sai mật khẩu.' };
    return { ok: true };
  }
  function saveGame(storage, username, state) {
    var raw = JSON.stringify(state);
    storage.setItem(SAVE_PREFIX + username, raw);
    // Bản dự phòng chống ghi đè bởi PHIÊN BẢN CŨ còn mở: giao thức số thứ
    // tự chỉ ràng buộc được các phiên chạy bản mới; một cửa sổ còn chạy bản
    // cũ (trước giao thức) vẫn ghi vô điều kiện đè lên khóa chính, xóa mất
    // saveSeq và dayMinutes (hiện tượng live 2026-11-01: vị trí + giờ quay
    // về điểm xuất phát/08:02 dù các trường khác khớp). Mọi lần ghi của bản
    // mới (luôn có saveSeq) được soi gương sang khóa dự phòng mà bản cũ
    // không hề biết tới; nạp mà thấy khóa chính thiếu saveSeq thì khôi
    // phục từ bản dự phòng. Ghi dự phòng lỗi thì bỏ qua — khóa chính vẫn
    // là nguồn sự thật.
    if (state && typeof state.saveSeq === 'number') {
      try { storage.setItem(SAVE_BACKUP_PREFIX + username, raw); } catch (e) {}
    }
  }
  function loadGame(storage, username) {
    var main = null;
    try {
      var raw = storage.getItem(SAVE_PREFIX + username);
      main = raw ? JSON.parse(raw) : null;
    } catch (e) { main = null; }
    if (main && typeof main.saveSeq === 'number') return main;
    // Khóa chính trống hoặc KHÔNG có saveSeq: hoặc là save di trú từ bản
    // rất cũ (hợp lệ, không có bản dự phòng đi kèm), hoặc đã bị một phiên
    // bản cũ ghi đè. Có bản dự phòng mang saveSeq thì bản dự phòng mới là
    // trạng thái đúng gần nhất của tài khoản này.
    try {
      var rawB = storage.getItem(SAVE_BACKUP_PREFIX + username);
      var bak = rawB ? JSON.parse(rawB) : null;
      if (bak && typeof bak.saveSeq === 'number') return bak;
    } catch (e) {}
    return main;
  }

  /* ================= HỆ CÀY — NỀN THUẦN (docs/grind-prep) =================
     Cửa trả thưởng duy nhất cho MỌI khoản lặp là grantReward. Số lấy đúng
     economy-math (trần mềm ba hồ riêng, tách bậc, sàn boss) và systems-data
     (khóa chống trùng, sổ ledger, nguyên tử túi). Thưởng cốt truyện KHÔNG
     qua cửa này và không vào hồ nào. Không hồ sơ nào được chứa soul. */
  var GRIND_LEDGER_MAX = 100;
  var GRIND_INSTANCE_KEEP_DAYS = 7;
  function defaultGrind() {
    return { v: 1, seq: 0, boards: {}, instances: {}, claimed: {}, ledger: [], nodes: {}, boss: {},
             pools: { day: 0, lt: 0, tuvi: 0, merit: 0 }, frac: { lt: 0, merit: 0 } };
  }
  function ensureGrind(state) {
    if (!state || typeof state !== 'object') return defaultGrind();
    if (!state.grind || typeof state.grind !== 'object') state.grind = defaultGrind();
    var g = state.grind;
    if (typeof g.seq !== 'number' || !isFinite(g.seq) || g.seq < 0) g.seq = 0; else g.seq = Math.floor(g.seq);
    ['boards', 'instances', 'claimed', 'nodes', 'boss'].forEach(function (k) { if (!g[k] || typeof g[k] !== 'object') g[k] = {}; });
    if (!Array.isArray(g.ledger)) g.ledger = [];
    if (!g.pools || typeof g.pools !== 'object') g.pools = { day: 0, lt: 0, tuvi: 0, merit: 0 };
    ['day', 'lt', 'tuvi', 'merit'].forEach(function (k) { if (typeof g.pools[k] !== 'number' || !isFinite(g.pools[k]) || g.pools[k] < 0) g.pools[k] = 0; });
    if (!g.frac || typeof g.frac !== 'object') g.frac = { lt: 0, merit: 0 };
    ['lt', 'merit'].forEach(function (k) { if (typeof g.frac[k] !== 'number' || !isFinite(g.frac[k]) || g.frac[k] < 0) g.frac[k] = 0; });
    g.v = 1;
    return g;
  }
  // Thứ hạng tuyến tính của cảnh giới: realm*100 + stage (Luyện Khí tầng 1
  // = 100, Trúc Cơ Sơ Kỳ = 200...). Save hỏng (realm không phải số) -> 0.
  function realmOrdinal(state) {
    if (!state || typeof state.realm !== 'number' || typeof state.stage !== 'number' || !isFinite(state.realm) || !isFinite(state.stage)) return 0;
    return Math.floor(state.realm) * 100 + Math.floor(state.stage);
  }
  function questIndexOf(id) {
    for (var i = 0; i < QUESTS.length; i++) if (QUESTS[i].id === id) return i;
    return -1;
  }
  /* Vị trí NPC theo PHA NHIỆM VỤ (gói phụ 5 — lỗi hình–cảnh chương 4):
     Trần Chính Đạo nói suốt các cảnh sân phủ Hứa (SCENE_THIENCO /
     SCENE_ACCUSE / SCENE_CHAN_QUELL) nhưng vị trí cố định của ông là
     (56,66) cạnh phân đà Thiên Cơ Các. Trong hai pha sân phủ
     (q4_thien_co, q4_vu_cao) ông đứng TẠI sân, ở đầu bộ bàn trà phía
     bắc nhóm gia đình, quay mặt về phía gia đình; từ q4_doi_chat trở
     đi ông trở lại (56,66) — nhiệm vụ đối chất và chương 10 dùng đúng
     vị trí đó. npcPosFor trả vị trí HIỆU LỰC (pha nếu khớp, mặc định
     nếu không) để mọi điểm dựng NPC sống đều dùng chung một nguồn. */
  var NPC_PHASE_POS = {
    tran_chinh_dao: [
      { quests: ['q4_thien_co', 'q4_vu_cao'], x: 17, y: 33, dir: 'down' }
    ]
  };
  function npcPosFor(state, npc) {
    var list = npc && NPC_PHASE_POS[npc.id];
    if (list && state && state.quest) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].quests.indexOf(state.quest) >= 0) return list[i];
      }
    }
    return { x: npc.x, y: npc.y, dir: npc.dir };
  }
  function questReached(state, id) {
    if (!state || !state.quest) return false;
    var cur = questIndexOf(state.quest), tgt = questIndexOf(id);
    if (cur < 0 || tgt < 0) return false;
    return cur >= tgt;
  }
  // FNV-1a 32-bit trên byte UTF-8 (vectơ khóa ở systems-data mục 2.4).
  function grindHash32(s) {
    var h = 2166136261;
    s = String(s);
    for (var i = 0; i < s.length; i++) {
      var c = s.charCodeAt(i);
      if (c < 0x80) h = Math.imul(h ^ c, 16777619);
      else if (c < 0x800) { h = Math.imul(h ^ (0xC0 | (c >> 6)), 16777619); h = Math.imul(h ^ (0x80 | (c & 0x3F)), 16777619); }
      else { h = Math.imul(h ^ (0xE0 | (c >> 12)), 16777619); h = Math.imul(h ^ (0x80 | ((c >> 6) & 0x3F)), 16777619); h = Math.imul(h ^ (0x80 | (c & 0x3F)), 16777619); }
    }
    return h >>> 0;
  }
  // mulberry32 — dòng ngẫu nhiên XÁC ĐỊNH theo hạt giống (nạp lại không
  // quay lại được kết quả khác: cùng hạt giống -> cùng dòng).
  function grindRng(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  // Ngân sách đầy-tốc B của từng hồ (economy-math mục 4.2): LT/merit theo
  // dải cảnh giới (chỉ số 0/1/2 = Luyện Khí/Trúc Cơ/Kim Đan), tu vi = 40%
  // trần thanh hiện tại.
  var GRIND_POOL_BASE = { lt: [6, 10, 16], merit: [8, 12, 16] };
  function grindPoolBase(state, kind) {
    if (kind === 'tuvi') {
      var cap = REALMS[state.realm] && REALMS[state.realm].tuviNext;
      return cap ? cap * 0.4 : 0;
    }
    var table = GRIND_POOL_BASE[kind];
    if (!table) return 0;
    var idx = Math.min(2, Math.max(0, (typeof state.realm === 'number' ? state.realm : 1) - 1));
    return table[idx];
  }
  // Số một khoản CƠ SỐ được trả sau trần mềm: tách theo bậc dựa trên tích
  // lũy cơ số TRƯỚC khoản này trong hồ của ngày (0->B: x1, B->2B: x0,5,
  // trên 2B: x0,25); khoản boss có sàn hệ số 0,5 cho từng phần. Hàm thuần
  // theo hồ hiện tại — KHÔNG tự cộng hồ; grantReward cộng cơ số vào hồ
  // chỉ sau khi khoản đã áp thành công.
  function grindSoftCapAmount(state, kind, base, opts) {
    opts = opts || {};
    if (!(base > 0)) return 0;
    var g = ensureGrind(state);
    var B = grindPoolBase(state, kind);
    if (!(B > 0)) return base;
    var pool = (g.pools.day === state.dayCount) ? (g.pools[kind] || 0) : 0;
    var remain = base, out = 0, pos = pool, guard = 0;
    while (remain > 0 && guard++ < 8) {
      var edge = pos < B ? B : (pos < 2 * B ? 2 * B : Infinity);
      var take = Math.min(remain, edge - pos);
      var f = pos < B ? 1 : (pos < 2 * B ? 0.5 : 0.25);
      if (opts.boss && f < 0.5) f = 0.5;
      out += take * f; pos += take; remain -= take;
    }
    return out;
  }
  var REWARD_PROFILES = {
    // Hồ sơ boss dã ngoại (grind-design mục 8): đan theo dải + yêu đan
    // bắt buộc đúng guaranteedYeuDan của boss — "chắc chắn rơi" nằm ở chỗ
    // hồ sơ luôn có mục này và cửa trả là nguyên tử.
    'profile:boss_dm_lang_vuong': { lt: 12, tuviPct: 30, merit: 5, items: { hoi_xuan_dan: 1, yeu_dan_1: 1 } },
    'profile:boss_hb_son_chu': { lt: 20, tuviPct: 30, merit: 8, items: { phuc_linh_dan: 1, yeu_dan_2: 1 } },
    /* Hồ sơ cày lặp đợt bí cảnh + hệ cày (grind-design mục 8,
       bicanh-design mục 4.3 — dạng phẳng, KHÔNG trường soul):
       - săn: khóa theo dải tại lúc NHẬN (resolvedProfileId), không theo
         dải lúc trả; - thu thập: tuvi hoặc đan theo dải lúc nộp;
       - việc tông: theo TẦNG việc, không theo từng mẫu;
       - boss bí cảnh: thấp hơn boss dã ngoại cùng dải (bí cảnh vào
         được mỗi ngày, boss dã ngoại theo chu kỳ 3–4 ngày).
       Yêu đan lặp của boss bí cảnh (25%, bicanh-design 4.4) KHÔNG nằm
       trong hồ sơ phẳng này: nó là tỉ lệ rơi xác suất, làn game.js rút
       bằng yeuDanDropFor như rơi yêu đan dã ngoại. */
    'profile:hunt:lk': { lt: 4, tuviPct: 20 },
    'profile:hunt:tc': { lt: 7, tuviPct: 20 },
    'profile:hunt:kd': { lt: 11, tuviPct: 20 },
    /* Tu vi theo mạng hạ quái DÃ NGOẠI (quyết định của Bui 16:36 ngày
       2026-11-02, THAY luật cũ "diệt quái ngoài phiếu trả 0 tu vi"):
       thường 2% tuviNext, tinh anh 5% tuviNext, trả qua grantReward nên
       chảy qua bể trần mềm tu vi/ngày như mọi nguồn cày khác. Căn cứ
       khung số đã duyệt: phiếu săn trả 20% cho 3–5 mạng (tương đương
       4–6,7%/mạng) nên mạng tự do 2% nằm dưới tỉ lệ quy về của phiếu;
       đợt quái bí cảnh trả 5% cho 2 con (2,5%/con) nên 2%/con dã ngoại
       nằm ngay dưới; tinh anh 5% bằng đúng một hồ sơ đợt. Chống trùng:
       boss KHÔNG qua hồ sơ này (hồ sơ boss riêng), quái BÍ CẢNH không
       qua hồ sơ này (đã có thưởng đợt 5%/đợt), Linh Thạch vẫn 0. */
    'profile:kill:normal': { tuviPct: 2 },
    'profile:kill:elite': { tuviPct: 5 },
    'profile:gat:tuvi': { tuviPct: 15 },
    'profile:gat:dan_lk': { items: { hoi_xuan_dan: 1 } },
    'profile:gat:dan_tc': { items: { phuc_linh_dan: 1 } },
    'profile:sect:tap_dich': { lt: 2, merit: 5 },
    'profile:sect:truc_co': { lt: 3, merit: 6 },
    'profile:sect:kim_dan': { lt: 5, merit: 8 },
    'profile:bc_thuyliem_boss': { lt: 8, tuviPct: 20, merit: 3, items: { hoi_xuan_dan: 1 } },
    'profile:bc_tapha_boss': { lt: 8, tuviPct: 20, merit: 3, items: { hoi_xuan_dan: 1 } },
    'profile:bc_tapsau_boss': { lt: 15, tuviPct: 20, merit: 6, items: { phuc_linh_dan: 1 } },
    'profile:bc_kiemtrung_boss': { lt: 15, tuviPct: 20, merit: 6, items: { phuc_linh_dan: 1 } },
    'profile:bc_hoiphong_boss': { lt: 15, tuviPct: 20, merit: 6, items: { phuc_linh_dan: 1 } },
    /* Cung IV (dải Kim Đan, trần 1200): hồ sơ lặp của tầng sâu theo
       thang hồ sơ bí cảnh hiện hành leo dải (Trúc Cơ 15 lt/công trạng 6
       -> Kim Đan 24/9); hồ sơ boss dã ngoại Kim Đan đúng khung đã
       duyệt của bản đồ giữ chân: 32 lt + 30% tu vi + 10 công trạng +
       Yêu Đan cấp 3 x1 chắc chắn (qua grantReward với boss:true thì
       sàn hệ số x0,5 như các boss hiện hành). */
    'profile:bc_kiemtrung_sau_boss': { lt: 24, tuviPct: 20, merit: 9, items: { phuc_linh_dan: 1 } },
    /* Di Tích Trận Tâm (đợt bí cảnh boss tổ đội, dải Kim Đan): boss
       giữa tầng ngoài đúng hồ sơ tầng sâu Kiếm Trủng (24/20%/9 + Phục
       Linh Đan); boss cuối tâm trận đúng khung boss dã ngoại Kim Đan
       (32/30%/10, không vật phẩm trong hồ sơ lặp — Yêu Đan cấp 3 x1 +
       Phục Linh Đan x1 nằm ở thưởng LẦN ĐẦU ngoài hồ sơ, như mọi bí
       cảnh). Đợt quái 5% tu vi như mọi bí cảnh. */
    'profile:bc_tran_tam_boss': { lt: 24, tuviPct: 20, merit: 9, items: { phuc_linh_dan: 1 } },
    'profile:bc_tran_tam_sau_boss': { lt: 32, tuviPct: 30, merit: 10, items: {} },
    'profile:boss_hb_ho_tran': { lt: 32, tuviPct: 30, merit: 10, items: { yeu_dan_3: 1 } },
    /* Đài thách đấu (trần mềm, điểm nhỏ): chỉ tu vi — đệ tử đấu giao
       lưu không rơi tài nguyên; hạng tinh anh thêm chút công trạng. */
    'profile:challenge:noi_mon': { tuviPct: 5 },
    'profile:challenge:tinh_anh': { tuviPct: 8, merit: 2 },
    /* Hạng vô địch (đợt 2, chương 18): [ĐỀ XUẤT SỐ] tuviPct 12, merit 4
       — bậc trên tinh anh 8/2 theo hợp đồng đợt 2 mục A.4. */
    'profile:challenge:vo_dich': { tuviPct: 12, merit: 4 },
    'profile:bc:bc_thuyliem:wave': { tuviPct: 5 },
    'profile:bc:bc_tapha:wave': { tuviPct: 5 },
    'profile:bc:bc_tapsau:wave': { tuviPct: 5 },
    'profile:bc:bc_kiemtrung:wave': { tuviPct: 5 },
    'profile:bc:bc_hoiphong_mo:wave': { tuviPct: 5 },
    'profile:bc:bc_kiemtrung_sau:wave': { tuviPct: 5 },
    'profile:bc:bc_tran_tam:wave': { tuviPct: 5 },
    'profile:bc:bc_tran_tam_sau:wave': { tuviPct: 5 }
  };
  /* grantReward(state, spec, opts) — spec: id hồ sơ trong REWARD_PROFILES
     hoặc đối tượng hồ sơ phẳng { lt?, tuvi?, tuviPct?, merit?, items? }.
     opts: { claimKey, sourceId, boss, factorFn } — factorFn là điểm móc
     kiểm thử của systems-data mục 2.5 (mặc định dùng trần mềm thật).
     Thứ tự chốt: khóa trùng -> hồ sơ -> trần mềm -> ví -> túi nguyên tử
     -> áp thật -> ghi khóa + sổ. Mọi đường thất bại đều không đổi gì. */
  function grantReward(state, spec, opts) {
    opts = opts || {};
    if (!state || typeof state !== 'object') return { ok: false, reason: 'invalid_state' };
    var g = ensureGrind(state);
    if (g.pools.day !== state.dayCount) { g.pools.day = state.dayCount; g.pools.lt = 0; g.pools.tuvi = 0; g.pools.merit = 0; }
    var profile = null, profileId = null;
    if (typeof spec === 'string') { profileId = spec; profile = REWARD_PROFILES[spec] || null; }
    else if (spec && typeof spec === 'object') { profile = spec; profileId = spec.profileId || 'inline'; }
    if (!profile) return { ok: false, reason: 'profile_missing' };
    if (profile.soul) return { ok: false, reason: 'profile_soul_forbidden' }; // trục hồn không bao giờ đi qua cửa cày
    var claimKey = opts.claimKey || null;
    if (claimKey && g.claimed[claimKey] != null) return { ok: false, reason: 'duplicate', duplicate: true };
    var cap = REALMS[state.realm] && REALMS[state.realm].tuviNext;
    var baseTuvi = 0;
    if (typeof profile.tuviPct === 'number') baseTuvi = cap ? profile.tuviPct / 100 * cap : 0;
    else if (typeof profile.tuvi === 'number') baseTuvi = profile.tuvi;
    var base = { lt: profile.lt || 0, tuvi: baseTuvi, merit: profile.merit || 0 };
    var amt = { lt: 0, tuvi: 0, merit: 0 };
    ['lt', 'tuvi', 'merit'].forEach(function (kind) {
      if (!(base[kind] > 0)) return;
      if (opts.factorFn) amt[kind] = Math.floor(base[kind] * opts.factorFn(state, kind, { profileId: profileId, sourceId: opts.sourceId || null }));
      else amt[kind] = grindSoftCapAmount(state, kind, base[kind], { boss: !!opts.boss });
    });
    if (amt.lt > 0 && !walletOpen(state)) return { ok: false, reason: 'wallet_locked' };
    // Vật phẩm của hồ sơ chấp nhận CẢ HAI dạng: dạng mảng [{id, n}] là
    // dạng chuẩn trong systems-data (mục mô tả grantReward), dạng bản đồ
    // {id: n} là dạng các hồ sơ boss đang dùng — chuẩn hóa về bản đồ
    // trước khi kiểm túi để hai dạng cho cùng một kết quả.
    var items = {};
    if (Array.isArray(profile.items)) {
      profile.items.forEach(function (it) { if (it && it.id) items[it.id] = (items[it.id] || 0) + (it.n || 1); });
    } else if (profile.items) {
      for (var ik in profile.items) items[ik] = profile.items[ik];
    }
    for (var id in items) {
      if (!bagCanAdd(state, id, items[id]).ok) return { ok: false, reason: 'bag_full' };
    }
    var granted = { lt: 0, tuvi: 0, merit: 0, items: {} };
    for (var id2 in items) { if (bagAdd(state, id2, items[id2]).ok) granted.items[id2] = items[id2]; }
    if (amt.tuvi > 0) {
      var applied = cap ? Math.min(amt.tuvi, Math.max(0, cap - state.tuvi)) : amt.tuvi;
      state.tuvi += applied; granted.tuvi = applied;
    }
    // LT/merit vào ví qua HỒ PHÂN SỐ: ví chỉ nhận phần nguyên của lũy kế
    // (addLinhThach/addSectMerit vốn làm tròn xuống), phần lẻ giữ ở
    // grind.frac cộng dồn sang khoản sau trong ngày — nhờ vậy tổng ngày
    // khớp đúng các ví dụ khóa của economy-math (10 LT / 9 merit ở ví dụ
    // 2; 16 LT + 0,5 lẻ giữ lại / 14 merit ở ví dụ 3) trong khi granted
    // báo đúng số trần mềm đã duyệt cho từng khoản.
    if (amt.merit > 0) {
      var mTot = g.frac.merit + amt.merit, mInt = Math.floor(mTot);
      g.frac.merit = mTot - mInt;
      if (mInt > 0) addSectMerit(state, mInt);
      granted.merit = amt.merit;
    }
    if (amt.lt > 0) {
      var lTot = g.frac.lt + amt.lt, lInt = Math.floor(lTot);
      g.frac.lt = lTot - lInt;
      if (lInt > 0) addLinhThach(state, lInt);
      granted.lt = amt.lt;
    }
    g.pools.lt += base.lt; g.pools.tuvi += base.tuvi; g.pools.merit += base.merit;
    g.seq += 1;
    if (claimKey) g.claimed[claimKey] = state.dayCount;
    g.ledger.push({ seq: g.seq, day: state.dayCount, sourceId: opts.sourceId || null, claimKey: claimKey, profileId: profileId,
                    granted: { lt: granted.lt, tuvi: granted.tuvi, merit: granted.merit, items: granted.items } });
    while (g.ledger.length > GRIND_LEDGER_MAX) g.ledger.shift();
    return { ok: true, granted: granted };
  }
  // Qua nửa đêm game: chạy đúng MỘT lần theo ngày đích (kể cả nhảy nhiều
  // ngày) — instance active cũ hết hạn, dọn instance đã kết thúc quá hạn
  // giữ, khóa boss chỉ giữ chu kỳ hiện tại + liền trước, hồ trần về 0.
  function grindDayRollover(state) {
    var g = ensureGrind(state);
    var day = state.dayCount, id;
    for (id in g.instances) {
      var ins = g.instances[id];
      if (ins && typeof ins === 'object' && ins.status === 'active' && typeof ins.day === 'number' && ins.day < day) ins.status = 'expired';
    }
    for (id in g.instances) {
      var ins2 = g.instances[id];
      if (ins2 && typeof ins2 === 'object' && (ins2.status === 'claimed' || ins2.status === 'expired' || ins2.status === 'abandoned') &&
          typeof ins2.day === 'number' && ins2.day < day - GRIND_INSTANCE_KEEP_DAYS) delete g.instances[id];
    }
    for (var key in g.claimed) {
      var m = /^gr:boss:(.+):c(\d+)$/.exec(key);
      if (m && BOSS_DEFS[m[1]]) {
        var cur = Math.floor(day / BOSS_DEFS[m[1]].cycleDays);
        if (parseInt(m[2], 10) < cur - 1) delete g.claimed[key];
      }
    }
    g.pools.day = day; g.pools.lt = 0; g.pools.tuvi = 0; g.pools.merit = 0;
    return state;
  }
  // Hàm bọc quanh advanceDayClock tại điểm vòng lặp game vẫn gọi: đếm số
  // vòng qua 0:00 rồi tăng dayCount + rollover đúng một lần cho ngày đích.
  // Chế độ ghim ngày/đêm thì vòng lặp không gọi hàm tiến đồng hồ nào cả —
  // dayCount đứng yên và mọi chu kỳ đứng theo (hành vi đã chốt).
  function advanceGrindClock(state, dtSec, speedKey) {
    if (!state) return 0;
    if (typeof state.dayCount !== 'number' || !isFinite(state.dayCount) || state.dayCount < 0) state.dayCount = 0;
    if (typeof state.dayMinutes !== 'number' || !isFinite(state.dayMinutes)) state.dayMinutes = normalizeDayMinutes(state.dayMinutes);
    var rate = DAYNIGHT_MIN_PER_SEC[speedKey] || DAYNIGHT_MIN_PER_SEC.normal;
    var dt = (typeof dtSec === 'number' && isFinite(dtSec) && dtSec > 0) ? dtSec : 0;
    var wraps = Math.floor((state.dayMinutes + rate * dt) / 1440);
    advanceDayClock(state, dtSec, speedKey);
    if (wraps > 0) { state.dayCount += wraps; grindDayRollover(state); }
    return state.dayCount;
  }
  /* ================= CÔNG PHÁP — LỚP TẦNG (docs/congphap-prep) =================
     Lớp techniques nằm TRÊN lớp unlocked: unlocked vẫn quyết mọi hành vi
     cũ (thổ nạp, xuất kiếm, ngăn cốt truyện); techniques chỉ ghi TẦNG và
     ĐIỂM của công pháp đã học theo truyện. Lên tầng cần đủ ba thành phần:
     điểm lũy kế + sàn cảnh giới + mốc lĩnh ngộ (ở tầng có chỉ định).
     HAI LUẬT KHÓA VĨNH VIỄN: (1) tầng công pháp không bao giờ là điều
     kiện đột phá hay cổng truyện — không hàm cổng nào đọc techniques;
     (2) công pháp/chiêu không có giá — điểm chỉ sinh từ hành động lặp
     (thổ nạp +2/giây, xuất kiếm trong trận +2/lần gọi, bí tịch tàn thiên),
     không đường nào đổi Linh Thạch/cống hiến lấy điểm hay tầng. */
  /* ===== KHUNG ẨN DÒNG ngu_hanh — GIAI ĐOẠN 2 TÍCH HỢP BÍ PHÁP =====
     Nguồn thiết kế: docs/bi-phap-integration/00-ban-do-lay-bi-tich.md
     (parent đã duyệt) + docs/cong-phap-30-khung-chuan.md mục B. Ba
     mươi bộ của danh mục + ba bộ đặc biệt đăng ký ở cuối
     TECHNIQUE_DEFS dưới đây theo mô hình số của bản đồ mục 2: cơ số
     swordPower, bốn hồ sơ hệ số, điểm tu luyện +2 mỗi lần xuất chiêu
     của chính bộ (qua techniqueGain như kiếm quyết), tàn thiên +100
     (qua useBiTich như hai quyển gốc). MỌI BỘ ĐANG ẨN (hidden: true):
     không một điểm neo nào ở game.js/story.js gọi học hay gắn nguồn
     trong đợt khung này; học chỉ qua nguHanhLearn do các đợt cài sau
     gọi khi sheet của bộ đã qua cổng khắt khe. Hai luật cứng giữ
     nguyên: tầng công pháp không làm cổng (không hàm cổng nào đọc
     các mục này); chiêu không có giá, không tốn Tĩnh Âm — giới hạn
     duy nhất là hồi chiêu trong bảng hồ sơ. */
  // Bốn hồ sơ hệ số (bản đồ mục 2.2): theo tầng 1..4 là [tổng %
  // swordPower, hồi chiêu giây, mảng đòn con]; T3/T4 là TỔNG của
  // nhiều đòn nhỏ, đòn con không đòn nào vượt 60% (T3 hồ sơ Đơn và
  // Triệu hồi = 6 đòn x 30%; đòn con của các T3/T4 còn lại chia tại
  // resolver khi cài, hits để null).
  var NGU_HANH_PROFILES = {
    don: [[90, 2.5, [90]], [130, 5, [130]], [180, 9, [30, 30, 30, 30, 30, 30]], [220, 20, null]],
    dien: [[80, 3, [80]], [115, 5.5, [115]], [165, 10, null], [200, 22, null]],
    khong: [[75, 3, [75]], [110, 6, [110]], [150, 10, null], [190, 22, null]],
    trieu_hoi: [[90, 2.5, [90]], [130, 5, [130]], [180, 9, [30, 30, 30, 30, 30, 30]], [220, 24, null]]
  };
  // Sàn cảnh giới theo tầng, lệch theo dải mở của bộ (bản đồ mục
  // 2.1): tầng 2 sàn cuối dải mở, tầng 3 sàn dải kế tiếp, tầng 4 sàn
  // Kim Đan (bộ mở ở Kim Đan thì tầng 4 sàn Nguyên Anh; dải Nguyên
  // Anh và Hóa Thần dịch cùng khuôn — tọa độ khóa lại khi cung
  // tương ứng vào sản xuất). Cặp số là [realm, stage] như tiers của
  // hai quyển gốc.
  var NGU_HANH_BAND_FLOORS = {
    luyen_khi: [[1, 8], [2, 0], [3, 0]],
    truc_co: [[2, 3], [3, 0], [3, 0]],
    kim_dan: [[3, 3], [4, 0], [4, 0]],
    nguyen_anh: [[4, 3], [5, 0], [5, 0]],
    hoa_than: [[5, 3], [6, 0], [6, 0]]
  };
  // Điểm lên tầng [ĐỀ XUẤT SỐ — theo thang Thất Tinh Kiếm Quyết
  // 200/600/1500, cùng nhịp +2 điểm mỗi lần xuất chiêu].
  var NGU_HANH_TIER_XP = [200, 600, 1500];
  function nguHanhDef(cfg) {
    var floors = NGU_HANH_BAND_FLOORS[cfg.band];
    var def = { name: cfg.name, kind: cfg.kind || 'ngu_hanh', line: cfg.line || 'ngu_hanh',
      nguHanh: true, hidden: cfg.hidden === false ? false : true, element: cfg.element, band: cfg.band, rarity: cfg.rarity,
      profile: cfg.profile || null, source: cfg.source,
      tiers: [null, { xp: 0 },
        { xp: NGU_HANH_TIER_XP[0], realm: floors[0][0], stage: floors[0][1] },
        { xp: NGU_HANH_TIER_XP[1], realm: floors[1][0], stage: floors[1][1] },
        { xp: NGU_HANH_TIER_XP[2], realm: floors[2][0], stage: floors[2][1] }] };
    if (cfg.role) def.role = cfg.role;
    if (cfg.requires) def.requires = cfg.requires;
    if (cfg.requiresAny) def.requiresAny = cfg.requiresAny;
    if (cfg.requiresExternal) def.requiresExternal = cfg.requiresExternal;
    if (cfg.fragments) { def.fragmentsNeeded = cfg.fragments; def.fragmentSource = cfg.fragmentSource; def.fullBookChance = 0.10; }
    if (cfg.fragmentKind) def.fragmentKind = cfg.fragmentKind;
    if (cfg.kyNgo) def.kyNgo = cfg.kyNgo;
    if (cfg.dropGuarantee) def.dropGuarantee = cfg.dropGuarantee;
    if (cfg.effect) def.effect = cfg.effect;
    if (cfg.ultimate) def.ultimate = cfg.ultimate;
    if (cfg.moves) def.moves = cfg.moves;
    else if (cfg.profile) def.moves = NGU_HANH_PROFILES[cfg.profile].map(function (m, i) {
      return { tier: i + 1, sheetRow: 4 + i, totalPct: m[0], cd: m[1], hits: m[2] };
    });
    return def;
  }
  var TECHNIQUE_DEFS = {
    thanh_phong: { name: 'Thanh Phong Chân Kinh', kind: 'tam_phap', unlockKey: 'thanh_phong',
      rateBonus: [0, 2, 4, 6, 8], // cộng tốc độ thổ nạp theo tầng 0..4 (tầng 1 = +2 như bản live cũ)
      tiers: [null,
        { xp: 0 },
        { xp: 240, realm: 1, stage: 4 },                                   // Luyện Khí tầng 5
        { xp: 720, realm: 2, stage: 0, insightQuest: 'q8_ho_phap' },       // Trúc Cơ + đã qua hộ pháp chương 8
        { xp: 1800, realm: 3, stage: 0 }] },                               // Kim Đan
    that_tinh: { name: 'Thất Tinh Kiếm Quyết', kind: 'kiem_quyet', unlockKey: 'that_tinh',
      tiers: [null,
        { xp: 0 },
        { xp: 200, realm: 1, stage: 6, insightQuest: 'q7_thang_long' },    // Luyện Khí tầng 7 + đã thắng Thăng Long Đạo
        { xp: 600, realm: 2, stage: 0 },                                   // Trúc Cơ
        { xp: 1500, realm: 3, stage: 0 }] },                               // Kim Đan
    // Hai dòng chỉ ĐĂNG KÝ để ánh xạ, không có mục trong state.techniques:
    // luyện hồn tiến theo phẩm soulRank sẵn có; ngự kiếm theo cờ bay của
    // đợt ngự kiếm. Không bịa kinh thư luyện hồn (truyện không có).
    /* Cung IV: Huyền Tinh Kiếm Phổ — kiếm quyết dòng Huyền, truyền tại
       tầng sâu Kiếm Trủng. Cung IV chỉ có TẦNG 1 (chiêu Huyền Tinh
       Trảm); tầng cao hơn để dành cung V. Học DUY NHẤT qua thưởng
       thông lần đầu bc_kiemtrung_sau (learnHuyenTinhKiemPho) — điều
       kiện vào tầng sâu đã là q16_linh_ngo + Kim Đan; không cổng tầng
       công pháp nào khác (luật cứng). */
    huyen_tinh_kiem_pho: { name: 'Huyền Tinh Kiếm Phổ', kind: 'kiem_quyet', unlockKey: 'huyen_tinh_kiem_pho', grade: 'Huyen',
      tiers: [null,
        { xp: 0 }] },
    luyen_hon: { name: 'Luyện Hồn', kind: 'luyen_hon', tiersBy: 'soulRank' },
    ngu_kiem: { name: 'Ngự Kiếm', kind: 'than_phap', tiersBy: 'flags.fly' },
    // ===== 33 mục của chương trình bí pháp (khung ẩn — cơ chế tích
    // lũy ở khối sau useBiTich; nguồn theo bản đồ mục 4) =====
    // --- Dải Luyện Khí ---
    phi_diep_phong_nhan: nguHanhDef({ name: 'Phi Diệp Phong Nhận', element: 'phong', band: 'luyen_khi', rarity: 'thuong', profile: 'don',
      source: 'Chủ trì Kiểm Trắc Tháp trao tàn quyển Phong hệ nhập môn sau q3_cong_phap' }),
    huyen_thuy_xoay_luu: nguHanhDef({ name: 'Huyền Thủy Xoáy Lưu', element: 'thuy', band: 'luyen_khi', rarity: 'thuong', profile: 'don',
      source: 'Thông quan lần đầu Thủy Liêm Động (bc_thuyliem) — truyền thừa Thủy hệ khắc trong động' }),
    huyen_moc_dang_giao: nguHanhDef({ name: 'Huyền Mộc Đằng Giao', element: 'moc', band: 'luyen_khi', rarity: 'thuong', profile: 'khong',
      source: 'Kỳ ngộ khi thu thập — tiền bối hái thuốc vô danh ở điểm hái',
      kyNgo: { activities: ['gather'], weight: 3 }, effect: 'T3/T4 trói chân 1,5 giây' }),
    liet_diem_trao_kich: nguHanhDef({ name: 'Liệt Diễm Trảo Kích', element: 'hoa', band: 'luyen_khi', rarity: 'thuong', profile: 'don',
      source: 'Chủ trì tháp trao sau khi hoàn thành 3 phiếu săn ở bảng treo thưởng', effect: 'Tầm gần; đốt gộp trong hệ số' }),
    bich_ngoc_cu_kiem: nguHanhDef({ name: 'Bích Ngọc Cự Kiếm', element: 'moc', band: 'luyen_khi', rarity: 'thuong', profile: 'don',
      source: 'Thông quan lần đầu Tàn Tích Dưới Tháp — Tầng Ngoài (bc_tapha). Học độc lập: điều kiện có ô 05 chỉ áp ở ô 06 (bản đồ mục 4.1)',
      effect: 'T4 đâm xuyên hàng thẳng' }),
    // --- Dải Trúc Cơ ---
    cuong_phong_loc_xoay: nguHanhDef({ name: 'Cuồng Phong Lốc Xoáy', element: 'phong', band: 'truc_co', rarity: 'thuong', profile: 'khong',
      source: 'Quản Sự Tạp Dịch truyền sau 6 lượt việc tông hoàn thành', requires: ['phi_diep_phong_nhan'],
      effect: 'Cột lốc hút nhẹ về tâm' }),
    viem_long_tho_tuc: nguHanhDef({ name: 'Viêm Long Thổ Tức', element: 'hoa', band: 'truc_co', rarity: 'thuong', profile: 'dien',
      source: 'Trưởng lão tông trao khi đạt Trúc Cơ (sau q8_done)', requires: ['liet_diem_trao_kich'],
      effect: 'Chùm thẳng, đốt gộp trong hệ số' }),
    lien_nguc_hoa_tran: nguHanhDef({ name: 'Liên Ngục Hỏa Trận', element: 'hoa', band: 'truc_co', rarity: 'thuong', profile: 'dien',
      source: 'Mảnh từ boss Thạch Tượng Thủ Vệ (bc_tapha), ghép tại chủ trì tháp', requires: ['liet_diem_trao_kich'],
      fragments: 3, fragmentSource: 'boss:bc_tapha', effect: 'Trận tồn 5 giây, tổng chia theo nhịp' }),
    bang_tram_van_tien: nguHanhDef({ name: 'Băng Trâm Vạn Tiễn', element: 'bang', band: 'truc_co', rarity: 'thuong', profile: 'dien',
      source: 'Mảnh từ boss Thủy Xà Tinh (bc_thuyliem), ghép tại chủ trì tháp', requires: ['huyen_thuy_xoay_luu'],
      fragments: 3, fragmentSource: 'boss:bc_thuyliem', effect: 'Làm chậm 20% trong 3 giây' }),
    han_bang_xieng_xich: nguHanhDef({ name: 'Hàn Băng Xiềng Xích', element: 'bang', band: 'truc_co', rarity: 'thuong', profile: 'khong',
      source: 'Thông quan lần đầu một trong hai bí cảnh Trúc Cơ (bc_tapsau hoặc bc_kiemtrung)', requires: ['huyen_thuy_xoay_luu'],
      effect: 'T2 khóa 1,5 giây; T4 khóa 2 giây (boss giảm nửa)' }),
    hoa_van_man_thien: nguHanhDef({ name: 'Hỏa Vân Man Thiên', element: 'hoa', band: 'truc_co', rarity: 'thuong', profile: 'dien',
      source: 'Kỳ ngộ khi săn/thu thập ở Thung Lũng Hồi Phong', requires: ['liet_diem_trao_kich'],
      kyNgo: { activities: ['hunt', 'gather'], weight: 3 }, effect: 'Khói làm địch chậm 15% trong vùng' }),
    diet_son_dia_chan: nguHanhDef({ name: 'Điệt Sơn Địa Chấn', element: 'tho', band: 'truc_co', rarity: 'thuong', profile: 'dien',
      source: 'Thông quan lần đầu Tàn Tích Tầng Sâu (bc_tapsau)', effect: 'Mỏm đá trồi theo hàng' }),
    // --- Dải Kim Đan (đợt cài đi cùng cung IV — ở khung này chỉ đăng ký) ---
    tu_dien_kich: nguHanhDef({ hidden: false, name: 'Tử Điện Kích', element: 'loi', band: 'kim_dan', rarity: 'hiem', profile: 'don',
      source: 'Trưởng lão truyền thừa Lôi hệ sau Kết Đan (q12_done) + đã thắng 1 boss dã ngoại dải Kim Đan',
      effect: 'Sét phân nhánh sang 1 địch kề (đã gộp trong hệ số)' }),
    thanh_loan_pha_hu: nguHanhDef({ hidden: false, name: 'Thanh Loan Phá Hư', element: 'phong', band: 'kim_dan', rarity: 'hiem', profile: 'trieu_hoi',
      source: 'Mảnh từ đài thách đấu tông môn hạng tinh anh (cung IV), ghép tại tàng kinh', requires: ['cuong_phong_loc_xoay'],
      fragments: 5, fragmentSource: 'dai_thach_dau:tinh_anh', effect: 'T4 Thanh Loan lao qua diện' }),
    hoa_phuong_lieu_nguyen: nguHanhDef({ hidden: false, name: 'Hỏa Phượng Liêu Nguyên', element: 'hoa', band: 'kim_dan', rarity: 'hiem', profile: 'trieu_hoi',
      source: 'Mảnh từ đài thách đấu hạng vô địch (cung IV), ghép tại tàng kinh', requires: ['viem_long_tho_tuc'],
      fragments: 5, fragmentSource: 'dai_thach_dau:vo_dich', effect: 'Đốt gộp trong hệ số' }),
    dai_nhat_hoa_cau: nguHanhDef({ hidden: false, name: 'Đại Nhật Hỏa Cầu', element: 'hoa', band: 'kim_dan', rarity: 'hiem', profile: 'dien',
      source: 'Tàng kinh trao sau khi hoàn thành 10 phiếu săn dải Kim Đan', requires: ['viem_long_tho_tuc'],
      effect: 'Nổ diện, đốt gộp trong hệ số' }),
    thanh_long_xuat_the: nguHanhDef({ hidden: false, name: 'Thanh Long Xuất Thế', element: 'moc', band: 'kim_dan', rarity: 'hiem', profile: 'trieu_hoi',
      source: 'Thông quan lần đầu tầng sâu Kiếm Trủng (bc_kiemtrung_sau, cung IV)',
      requires: ['bich_ngoc_cu_kiem', 'huyen_moc_dang_giao'], effect: 'T4 Thanh Long cắn diện trước' }),
    tuyet_hoa_cu_kiem: nguHanhDef({ hidden: false, name: 'Tuyết Hoa Cự Kiếm', element: 'bang', band: 'kim_dan', rarity: 'hiem', profile: 'don',
      source: 'Mảnh từ boss Trận Nhãn Kiếm Linh (bc_kiemtrung_sau, cung IV), ghép tại tàng kinh', requires: ['han_bang_xieng_xich'],
      fragments: 5, fragmentSource: 'boss:bc_kiemtrung_sau', effect: 'T4 đóng băng 1 giây (boss chỉ chậm 30%)' }),
    han_bang_bao_lien: nguHanhDef({ hidden: false, name: 'Hàn Băng Bảo Liên', element: 'bang', band: 'kim_dan', rarity: 'hiem', profile: 'dien',
      source: 'Mảnh từ boss Kiếm Ý Tàn Hồn (bc_kiemtrung), ghép tại tàng kinh', requiresAny: ['bang_tram_van_tien', 'han_bang_xieng_xich'],
      fragments: 5, fragmentSource: 'boss:bc_kiemtrung', effect: 'Nổ pha lê, làm chậm 20%' }),
    thuong_hai_cuong_dao: nguHanhDef({ hidden: false, name: 'Thương Hải Cuồng Đào', element: 'thuy', band: 'kim_dan', rarity: 'hiem', profile: 'dien',
      source: 'Mảnh từ boss Thủy Xà Tinh (bc_thuyliem), ghép tại tàng kinh', requires: ['huyen_thuy_xoay_luu'],
      fragments: 5, fragmentSource: 'boss:bc_thuyliem', effect: 'Đẩy lùi nhẹ' }),
    loi_quang_than_kiem: nguHanhDef({ hidden: false, name: 'Lôi Quang Thần Kiếm', element: 'loi', band: 'kim_dan', rarity: 'hiem', profile: 'don',
      source: 'Mảnh từ boss Kiếm Ý Tàn Hồn (bc_kiemtrung), ghép tại tàng kinh', requires: ['tu_dien_kich'],
      fragments: 3, fragmentSource: 'boss:bc_kiemtrung', effect: 'Hồ quang gộp trong hệ số' }),
    thai_bach_kim_kiem: nguHanhDef({ hidden: false, name: 'Thái Bạch Kim Kiếm', element: 'kim', band: 'kim_dan', rarity: 'hiem', profile: 'don',
      source: 'Mảnh từ boss Hộ Trận Kiếm Linh (cung IV, chu kỳ 5 ngày) hoặc boss Trận Tâm Ma Ảnh (Di Tích Trận Tâm — Tâm Trận, bc_tran_tam_sau, boss tổ đội), ghép tại tàng kinh', requires: ['diet_son_dia_chan'],
      fragments: 5, fragmentSource: 'boss:ho_tran_kiem_linh', effect: 'Tia quạt ở T3 (đã gộp trong hệ số)' }),
    bon_loi_thiem_kich: nguHanhDef({ hidden: false, name: 'Bôn Lôi Thiểm Kích', element: 'loi', band: 'kim_dan', rarity: 'hiem', profile: 'don',
      source: 'Kỳ ngộ bậc hiếm khi đi đường/săn ở đường mòn', requires: ['tu_dien_kich'],
      kyNgo: { activities: ['travel', 'hunt'], weight: 1 }, effect: 'Lướt tới mục tiêu khi xuất chiêu' }),
    // --- Dải Nguyên Anh (khung giữ chỗ — tọa độ khóa khi cung sản xuất) ---
    tu_loi_than_long: nguHanhDef({ name: 'Tử Lôi Thần Long', element: 'loi', band: 'nguyen_anh', rarity: 'cuc_hiem', profile: 'trieu_hoi',
      source: 'Mảnh từ boss Lôi hệ của bí cảnh cung Nguyên Anh (tọa độ khóa khi cung vào sản xuất)', requires: ['tu_dien_kich'],
      fragments: 12, fragmentSource: 'boss:nguyen_anh_loi', effect: 'T4 rồng sét lao thẳng' }),
    cuu_thien_loi_phat: nguHanhDef({ name: 'Cửu Thiên Lôi Phạt', element: 'loi', band: 'nguyen_anh', rarity: 'cuc_hiem', profile: 'dien',
      source: 'Truyền thừa Lôi hệ cung Nguyên Anh tại tàng kinh cấp cao (cuối chuỗi Lôi)', requires: ['tu_dien_kich', 'loi_quang_than_kiem'],
      effect: 'Cột sét diện nhỏ, choáng nhẹ' }),
    tu_loi_than_phu: nguHanhDef({ name: 'Tử Lôi Thần Phù', element: 'loi', band: 'nguyen_anh', rarity: 'cuc_hiem', profile: 'trieu_hoi',
      source: 'Mảnh từ boss bí cảnh cung Nguyên Anh (tọa độ khóa khi cung vào sản xuất)', requires: ['tu_dien_kich'],
      fragments: 8, fragmentSource: 'boss:nguyen_anh',
      effect: 'Phù lơ lửng tự phóng 3 tia (đã gộp) rồi nổ. 8 mảnh = nấc trung gian có chủ đích (quyết định hòa giải ô 24, bản đồ mục 3.3)' }),
    bat_diet_kim_than: nguHanhDef({ name: 'Bất Diệt Kim Thân', element: 'kim', band: 'nguyen_anh', rarity: 'cuc_hiem', profile: null, role: 'phong_ngu',
      source: 'Truyền thừa Kim hệ cung Nguyên Anh', requires: ['thai_bach_kim_kiem'],
      moves: [
        { tier: 1, sheetRow: 4, kind: 'shield', absorbPct: 60, durSec: 6, cd: 25 },
        { tier: 2, sheetRow: 5, kind: 'reflect_on_break', totalPct: 40, cd: null },
        { tier: 3, sheetRow: 6, kind: 'stance', reducePct: 16, durSec: 6, cd: 30, immuneControl: true },
        { tier: 4, sheetRow: 7, kind: 'avatar', reducePct: 20, reflectTotalCapPct: 150, cd: 45 }
      ],
      effect: 'Bộ phòng ngự duy nhất — chiêu theo ghi chú riêng ở bản đồ mục 2.3, không theo thang sát thương' }),
    huyet_anh_ma_hon: nguHanhDef({ name: 'Huyết Ảnh Ma Hồn', element: 'ma', band: 'nguyen_anh', rarity: 'cuc_hiem', profile: 'trieu_hoi',
      source: 'Rơi tỉ lệ từ boss hệ Ma cung Nguyên Anh, đếm bảo đảm lần hạ thứ 15',
      dropGuarantee: { chance: 0.08, tries: 15, source: 'boss:ma_nguyen_anh' }, effect: 'Ma ảnh cắn diện; mang tiếng cấm thuật' }),
    // --- Dải Hóa Thần (khung giữ chỗ) ---
    hu_khong_hac_dong: nguHanhDef({ name: 'Hư Không Hắc Động', element: 'hon_don', band: 'hoa_than', rarity: 'cuc_hiem', profile: 'khong',
      source: 'Mảnh từ tầng sâu bí cảnh cung Hóa Thần (tọa độ khóa khi cung vào sản xuất)',
      fragments: 12, fragmentSource: 'boss:hoa_than_sau', effect: 'Hút mạnh về tâm, bẻ sáng (trình diễn)' }),
    hon_don_phap_luan: nguHanhDef({ name: 'Hỗn Độn Pháp Luân', element: 'hon_don', band: 'hoa_than', rarity: 'cuc_hiem', profile: 'dien',
      source: 'Truyền thừa cuối cung Hóa Thần: ít nhất một bộ của mỗi hàng trong 5 hàng đã lên Viên Mãn',
      effect: 'T4 pháp luân ngũ sắc — tối thượng ở trình diễn và phạm vi, số vẫn trong khung' }),
    // --- Bộ đặc biệt ---
    thanh_hoa_lien_tran: nguHanhDef({ name: 'Thanh Hoa Liên Trận Kinh', element: 'thuy', band: 'kim_dan', rarity: 'hiem', profile: null, role: 'tran_phap',
      source: 'Kỳ ngộ ở bờ nước sau q16_linh_ngo, hoặc Mảnh Sứ Thanh Hoa từ boss Thủy Xà Tinh ghép tại tàng kinh (hai đường độc lập)',
      requires: ['huyen_thuy_xoay_luu'], fragments: 5, fragmentSource: 'boss:bc_thuyliem', fragmentKind: 'su_thanh_hoa',
      kyNgo: { activities: ['gather', 'dungeon'], weight: 1, afterQuest: 'q16_linh_ngo' },
      moves: [
        { tier: 1, sheetRow: 4, totalPct: 90, cd: 3, hits: [90] },
        { tier: 2, sheetRow: 5, totalPct: 130, cd: 5.5, hits: [130] },
        { tier: 3, sheetRow: 6, totalPct: 170, cd: 10, hits: null },
        { tier: 4, sheetRow: 7, totalPct: 220, cd: 22, hits: null }
      ],
      effect: 'Trận pháp tấn công nhóm: hệ số là tổng mỗi mục tiêu trong trận, trận tồn theo nhịp sen nở; hồi chiêu theo hồ sơ Diện [ĐỀ XUẤT SỐ — bản đồ không cho số hồi riêng]' }),
    tu_da_anh_kiem: nguHanhDef({ name: 'Tử Dạ Ảnh Kiếm Quyết', element: 'am', band: 'nguyen_anh', rarity: 'cuc_hiem', profile: null,
      kind: 'kiem_quyet', line: 'kiem_quyet',
      source: 'Mảnh từ boss di tích kiếm tu hệ Ám cung Nguyên Anh; đòi đã sở hữu Huyền Tinh Kiếm Phổ (cung IV)',
      requiresExternal: 'huyen_tinh_kiem_pho', fragments: 12, fragmentSource: 'boss:di_tich_am',
      moves: [
        { tier: 1, sheetRow: 4, totalPct: 40, cd: null, hits: [40] },
        { tier: 2, sheetRow: 5, totalPct: 50, cd: null, hits: [50] },
        { tier: 3, sheetRow: 6, totalPct: 65, cd: null, hits: [65] },
        { tier: 4, sheetRow: 7, totalPct: 75, cd: null, hits: [75] }
      ],
      ultimate: { totalPct: 240, steps: 5 },
      effect: 'Kiếm quyết liên kích: tứ thức tổng 230 khi nối cả chuỗi, tuyệt kỹ năm bước tổng 240; hồi chiêu theo nhịp kiếm quyết khi cài' }),
    // SP-03 Kinh Lan: KHÔNG phải công pháp (khung chuẩn mục B.3) —
    // chỉ đăng ký để ánh xạ như luyen_hon/ngu_kiem: không tiers,
    // không mục trong state.techniques, không đường lấy ở bản đồ bí
    // tịch (thuộc phía pháp bảo — giao điểm mục 8 của bản đồ, chờ
    // Bui quyết; đợt này không tự xử lí).
    kinh_lan: { name: 'Kinh Lan Phi Kiếm', kind: 'phap_bao', line: 'phap_bao', registrationOnly: true, hidden: true,
      element: 'thuy', source: 'Phi kiếm/trình diễn — nhóm A của danh mục kiếm pháp bảo và lớp trình diễn ngự kiếm' }
  };
  function techniqueOf(state, id) {
    if (!state || !state.techniques || typeof state.techniques !== 'object') return null;
    var t = state.techniques[id];
    return (t && typeof t === 'object') ? t : null;
  }
  function techniqueTier(state, id) { var t = techniqueOf(state, id); return t ? t.tier : 0; }
  function techniqueTierUpReady(state, id) {
    var def = TECHNIQUE_DEFS[id];
    if (!def || !def.tiers) return false;
    var t = techniqueOf(state, id);
    if (!t || t.tier >= 4) return false;
    var next = def.tiers[t.tier + 1];
    if (!next) return false;
    if ((typeof t.xp === 'number' ? t.xp : 0) < next.xp) return false;
    if (realmOrdinal(state) < next.realm * 100 + next.stage) return false;
    // Mốc lĩnh ngộ = đã QUA nhiệm vụ đó (chỉ số nhiệm vụ hiện tại lớn hơn hẳn).
    if (next.insightQuest && !(questIndexOf(state.quest) > questIndexOf(next.insightQuest))) return false;
    return true;
  }
  function techniqueGain(state, id, pts) {
    var t = techniqueOf(state, id);
    if (!t || !(pts > 0)) return { ok: false, tierUps: [] };
    t.xp = (typeof t.xp === 'number' && isFinite(t.xp) ? t.xp : 0) + pts;
    var ups = [];
    while (techniqueTierUpReady(state, id)) { t.tier += 1; ups.push(t.tier); }
    return { ok: true, xp: t.xp, tier: t.tier, tierUps: ups };
  }
  // Di trú lớp công pháp (congphap-prep mục 2.3): suy từ unlocked, giữ
  // bất biến hai lớp không lệch — unlocked có khóa khi và chỉ khi
  // techniques có mục tương ứng. Tự vệ khi unlocked thiếu/không phải mảng.
  function ensureTechniques(state) {
    if (!state || typeof state !== 'object') return {};
    if (!state.techniques || typeof state.techniques !== 'object') state.techniques = {};
    var unlocked = Array.isArray(state.unlocked) ? state.unlocked : [];
    ['thanh_phong', 'that_tinh', 'huyen_tinh_kiem_pho'].forEach(function (id) {
      var has = unlocked.indexOf(id) >= 0, t = state.techniques[id];
      var maxTier = (TECHNIQUE_DEFS[id] && TECHNIQUE_DEFS[id].tiers) ? TECHNIQUE_DEFS[id].tiers.length - 1 : 4;
      if (has && !t) state.techniques[id] = { tier: 1, xp: 0 };
      else if (!has && t) delete state.techniques[id];
      else if (t) {
        if (typeof t.tier !== 'number' || !isFinite(t.tier)) t.tier = 1;
        t.tier = Math.min(maxTier, Math.max(1, Math.floor(t.tier)));
        if (typeof t.xp !== 'number' || !isFinite(t.xp) || t.xp < 0) t.xp = 0;
      }
    });
    if (state.activeMethod !== 'thanh_phong') state.activeMethod = state.techniques.thanh_phong ? 'thanh_phong' : null;
    return state.techniques;
  }
  /* Bí tịch tàn thiên: +100 điểm tu luyện [ĐỀ XUẤT SỐ của làn chạm trán —
     ngang một mốc lĩnh ngộ lớn] cho công pháp ĐÃ học. Sách KHÔNG mở công
     pháp mới (chưa học theo truyện thì từ chối sạch, sách còn nguyên) và
     KHÔNG cho tầng trực tiếp: điểm vẫn phải qua sàn cảnh giới + mốc lĩnh
     ngộ mới thành tầng, đúng hai luật khóa. */
  var BI_TICH_POINTS = 100;
  function useBiTich(state, itemId) {
    var def = ITEM_DEFS[itemId];
    if (!def || !def.teaches) return { ok: false, reason: 'not_bi_tich' };
    if (!techniqueOf(state, def.teaches)) return { ok: false, reason: 'not_learned' };
    if (bagCount(state, itemId) < 1) return { ok: false, reason: 'no_item' };
    bagRemove(state, itemId, 1);
    var r = techniqueGain(state, def.teaches, BI_TICH_POINTS);
    return { ok: true, technique: def.teaches, points: BI_TICH_POINTS, tier: r.tier, tierUps: r.tierUps };
  }

  /* ================= ĐỒ ĂN HỒI MÁU + TĨNH ÂM (lệnh của Bui 06:11 + 06:15 ngày 2026-11-04) =================
     Hệ tiêu hao dân dã dùng từ chương 1–2: ăn hồi máu (trường hp) và
     Tĩnh Âm (trường ta) theo số khai trong ITEM_DEFS. Toàn bộ hàm THUẦN
     trên state — lớp game.js chỉ gắn điểm bán (quán trọ trấn, sạp chợ
     Cô Châu), điểm nấu (bếp quán trọ + bếp trạm nghỉ đường mòn), bãi
     hái nấm, rơi thịt thú và nút dùng nhanh. Hai luật cứng: (1) đồ ăn
     KHÔNG phải điều kiện của bất kỳ cổng truyện/đột phá nào — save
     sạch không có đồ ăn vẫn qua mọi cổng như cũ (khẳng định §66);
     (2) tiền tệ có nguồn: mua bằng Linh Thạch qua spendLinhThach như mọi
     mua bán tu tiên khác; riêng hai món phàm tục rẻ (Cơm Nắm, Bánh Hấp)
     còn mua được bằng BẠC — tiền phàm tục của nguyên tác — qua
     buyFoodSilver ở giai đoạn ví Linh Thạch còn khóa (đợt sửa lỗi nhiệm
     vụ nấu ăn 2026-11-05; bạc không mua được vật phẩm tu tiên nào). */
  var FOOD_CD_SEC = 6; // nhịp chờ ăn liên tục TRONG TRẬN (giây) — lớp game áp theo đồng hồ phiên; ngoài trận ăn tự do, không chờ
  var SILVER_START = 15; // [SỐ MỚI 2026-11-05] lượng bạc mang theo người lúc bắt đầu — đủ mua 3 phần Cơm Nắm, hoặc Cơm Nắm + Bánh Hấp còn dư 2 lượng
  function foodDef(id) { var d = ITEM_DEFS[id]; return (d && d.type === 'do_an') ? d : null; }
  function foodIds() { return Object.keys(ITEM_DEFS).filter(function (id) { return ITEM_DEFS[id].type === 'do_an'; }); }
  function foodCount(state) { return foodIds().reduce(function (n, id) { return n + bagCount(state, id); }, 0); }
  /* Món "hợp nhất" cho nút dùng nhanh: phủ được nhiều phần máu + Tĩnh
     Âm đang thiếu nhất; hòa điểm thì món khai trước (yếu/rẻ hơn) thắng
     để giữ món mạnh cho lúc nguy cấp. */
  function bestFoodId(state) {
    var missHp = Math.max(0, (state.hpMax || 0) - (state.hp || 0));
    var missTa = Math.max(0, SILENCE_MAX - (state.silence || 0));
    var best = null, bestScore = -1;
    foodIds().forEach(function (id) {
      if (bagCount(state, id) < 1) return;
      var d = ITEM_DEFS[id];
      var score = Math.min(d.hp || 0, missHp) + Math.min(d.ta || 0, missTa);
      if (score > bestScore) { bestScore = score; best = id; }
    });
    return best;
  }
  function eatFood(state, id) {
    var def = foodDef(id);
    if (!def) return { ok: false, reason: 'not_food' };
    if (bagCount(state, id) < 1) return { ok: false, reason: 'no_item' };
    var hpFull = (state.hp || 0) >= (state.hpMax || 0);
    var taFull = (state.silence || 0) >= SILENCE_MAX;
    if (hpFull && taFull) return { ok: false, reason: 'full' }; // cả hai cùng đầy: không ăn, không trừ đồ
    var hpGain = Math.min(def.hp || 0, Math.max(0, (state.hpMax || 0) - (state.hp || 0)));
    var taGain = Math.min(def.ta || 0, Math.max(0, SILENCE_MAX - (state.silence || 0)));
    bagRemove(state, id, 1);
    state.hp = (state.hp || 0) + hpGain;
    state.silence = (state.silence || 0) + taGain;
    if (state.flags && !state.flags.foodEaten) state.flags.foodEaten = true; // bước ĂN của nhiệm vụ hướng dẫn đồ ăn
    return { ok: true, def: def, hpGain: hpGain, taGain: taGain, left: bagCount(state, id) };
  }
  function buyFood(state, id) {
    var def = foodDef(id);
    if (!def || typeof def.priceLt !== 'number') return { ok: false, reason: 'not_for_sale' };
    var chk = bagCanAdd(state, id, 1);
    if (!chk.ok) return { ok: false, reason: 'bag_full', text: chk.reason };
    var rs = spendLinhThach(state, def.priceLt);
    if (!rs.ok) return { ok: false, reason: 'no_lt', text: rs.reason };
    var ra = bagAdd(state, id, 1);
    if (!ra.ok) return { ok: false, reason: 'bag_full', text: ra.reason };
    if (state.flags && !state.flags.foodBought) state.flags.foodBought = true; // bước MUA của nhiệm vụ hướng dẫn đồ ăn
    return { ok: true, def: def, price: def.priceLt, count: ra.count };
  }
  /* Mua đồ ăn phàm tục bằng BẠC (đợt sửa lỗi nhiệm vụ nấu ăn 2026-11-05):
     tái hiện trên cây thật cho thấy bước MUA của nhiệm vụ hướng dẫn chỉ
     có đường Linh Thạch — ví khóa thì bị chặn hẳn, hết Linh Thạch thì
     không còn đường nào. Bạc là tiền phàm tục của nguyên tác: chỉ hai
     món rẻ có priceBac (Cơm Nắm 5 lượng, Bánh Hấp 8 lượng — [SỐ MỚI])
     mua được bằng bạc ở quán trọ/sạp chợ; món không có priceBac và MỌI
     vật phẩm tu tiên đều bị từ chối ở đây. Hàm này không đụng vào ví
     Linh Thạch: giai đoạn phàm nhân ví vẫn khóa nguyên như luật. */
  function silverBalance(state) { return Math.max(0, Math.floor((state && state.silver) || 0)); }
  function buyFoodSilver(state, id) {
    var def = foodDef(id);
    if (!def || typeof def.priceBac !== 'number') return { ok: false, reason: 'not_silver_food', id: id, text: 'Món này không bán bằng bạc — bạc là tiền phàm tục, chỉ mua được Cơm Nắm và Bánh Hấp ở quán trọ/sạp chợ.' };
    var chk = bagCanAdd(state, id, 1);
    if (!chk.ok) return { ok: false, reason: 'bag_full', text: chk.reason };
    if (silverBalance(state) < def.priceBac) return { ok: false, reason: 'no_silver', id: id, price: def.priceBac, text: 'Không đủ bạc (đang có ' + silverBalance(state) + ' lượng, cần ' + def.priceBac + ' lượng).' };
    state.silver = silverBalance(state) - def.priceBac;
    var ra = bagAdd(state, id, 1);
    if (!ra.ok) { state.silver += def.priceBac; return { ok: false, reason: 'bag_full', text: ra.reason }; }
    if (state.flags && !state.flags.foodBought) state.flags.foodBought = true; // bước MUA của nhiệm vụ hướng dẫn đồ ăn — đường bạc tính như đường Linh Thạch
    return { ok: true, def: def, price: def.priceBac, balance: state.silver, count: ra.count };
  }
  /* Ăn thử cho bước ĂN của nhiệm vụ hướng dẫn (đợt sửa lỗi 2026-11-05):
     tái hiện cho thấy người chơi mới làm đúng hướng dẫn thường đang ĐẦY
     máu lẫn Tĩnh Âm — eatFood chặn 'full', món không bị trừ, cờ
     foodEaten không bao giờ được set, nhiệm vụ kẹt 3/4 vĩnh viễn và
     không bao giờ hiện nút Nhận thưởng (đúng lỗi Bui báo). Hàm này là
     đường ăn thử có ngữ cảnh nhiệm vụ: bị chặn CHỈ vì 'full' thì vẫn
     trừ món, hồi 0, set cờ foodEaten và khai rõ taste:true. Chưa đầy
     thì ăn thật qua eatFood như thường. Luật chặn ăn khi đầy của
     eatFood cho chơi thường KHÔNG đổi — game.js chỉ gọi hàm này khi
     bước ăn của sq_food_tutorial còn đang dở. */
  function tasteFood(state, id) {
    var r = eatFood(state, id);
    if (r.ok) return r;
    if (r.reason !== 'full') return r;
    var rm = bagRemove(state, id, 1);
    if (!rm.ok) return { ok: false, reason: 'no_item', id: id };
    if (state.flags) state.flags.foodEaten = true;
    return { ok: true, taste: true, def: foodDef(id), hpGain: 0, taGain: 0, left: bagCount(state, id) };
  }
  /* Công thức nấu: needs = nguyên liệu trừ lúc nấu; needLinh = món
     dải Luyện Khí (ví Linh Thạch còn khóa ở giai đoạn phàm nhân thì
     chưa nấu được — nhịp nâng cấp của hệ đồ ăn, mở cùng đột phá). */
  var FOOD_RECIPES = {
    canh_nam_thao: { needs: { nam_rung: 1 } },
    thit_nuong: { needs: { thit_thu: 1 } },
    canh_bo_khi: { needs: { nam_rung: 1, thit_thu: 1 }, needLinh: true }
  };
  function cookFood(state, recipeId) {
    var rec = FOOD_RECIPES[recipeId], def = foodDef(recipeId);
    if (!rec || !def) return { ok: false, reason: 'no_recipe' };
    if (rec.needLinh && !walletOpen(state)) return { ok: false, reason: 'need_linh' };
    var needN = 0;
    for (var ing in rec.needs) { needN += rec.needs[ing]; if (bagCount(state, ing) < rec.needs[ing]) return { ok: false, reason: 'no_ingredient', missing: ing }; }
    // Nấu là biến đổi tại chỗ: trừ nguyên liệu rồi thêm thành phẩm nên
    // sức chứa sau nấu không bao giờ vượt quá trước nấu (needs >= 1).
    if (bagUsed(state) - needN + 1 > bagCap(state)) return { ok: false, reason: 'bag_full', text: 'Túi trữ vật đã đầy.' };
    for (var ing2 in rec.needs) bagRemove(state, ing2, rec.needs[ing2]);
    bagAdd(state, recipeId, 1);
    if (state.flags && !state.flags.foodCooked) state.flags.foodCooked = true; // bước NẤU của nhiệm vụ hướng dẫn đồ ăn
    return { ok: true, def: def, count: bagCount(state, recipeId) };
  }
  /* Bãi nấm: mỗi bãi cho 1 Nấm Rừng mỗi ngày game (mọc lại theo ngày).
     Hai bãi: bãi trấn (patchId 'tran') và bãi ven đường mòn gần trạm
     nghỉ (patchId 'duong_mon'). Không qua cổng Túi Trữ Vật như dược
     liệu hệ cày — đây là đồ ăn dân dã của chương 1–2, mang theo người
     như hành lý lên đường (sức chứa túi vẫn áp như thường qua bagAdd). */
  function gatherFoodPatch(state, patchId) {
    if (!state || !state.flags) return { ok: false, reason: 'no_state' };
    var key = patchId === 'duong_mon' ? 'foodPatchDayDuongMon' : 'foodPatchDayTran';
    if (state.flags[key] === state.dayCount) return { ok: false, reason: 'picked' };
    var chk = bagCanAdd(state, 'nam_rung', 1);
    if (!chk.ok) return { ok: false, reason: 'bag_full', text: chk.reason };
    state.flags[key] = state.dayCount;
    bagAdd(state, 'nam_rung', 1);
    if (!state.flags.foodGathered) state.flags.foodGathered = true; // bước NGUYÊN LIỆU của nhiệm vụ hướng dẫn đồ ăn
    return { ok: true, count: bagCount(state, 'nam_rung') };
  }

  /* ===== CƠ CHẾ TÍCH LŨY DÒNG ngu_hanh (khung ẩn — bản đồ mục 3.3 + 5) =====
     Dữ kiện nằm ở state.nguHanh, dựng/sửa qua ensureNguHanh (gọi trong
     normalizeSave ngay sau ensureTechniques): fragments = số mảnh đang
     giữ theo bộ; tries = bộ đếm lần thử cho các nguồn rơi tỉ lệ;
     kyNgo = { n: hành động đủ điều kiện kể từ kỳ ngộ gần nhất, lock:
     số hành động khóa sau một kỳ ngộ, total: tổng số kỳ ngộ đã nảy }.
     Toàn bộ là hàm thuần trên dữ kiện — lớp game gắn điểm rơi/điểm
     ghép/cảnh ở các đợt cài sau. */
  var KY_NGO_BASE = 0.004, KY_NGO_STEP = 0.0015, KY_NGO_CAP = 0.06, KY_NGO_HARD = 300, KY_NGO_LOCK = 60;
  var NGU_HANH_TAN_THIEN_GUARANTEE = 12; // đếm bảo đảm tàn thiên: lần hạ thứ 12 rơi chắc (bản đồ mục 3.3b)
  function defaultNguHanh() { return { fragments: {}, tries: {}, kyNgo: { n: 0, lock: 0, total: 0 } }; }
  function ensureNguHanh(state) {
    if (!state || typeof state !== 'object') return defaultNguHanh();
    var g = state.nguHanh;
    if (!g || typeof g !== 'object') { state.nguHanh = defaultNguHanh(); return state.nguHanh; }
    if (!g.fragments || typeof g.fragments !== 'object') g.fragments = {};
    if (!g.tries || typeof g.tries !== 'object') g.tries = {};
    if (!g.kyNgo || typeof g.kyNgo !== 'object') g.kyNgo = { n: 0, lock: 0, total: 0 };
    ['n', 'lock', 'total'].forEach(function (k) {
      if (typeof g.kyNgo[k] !== 'number' || !isFinite(g.kyNgo[k]) || g.kyNgo[k] < 0) g.kyNgo[k] = 0;
      else g.kyNgo[k] = Math.floor(g.kyNgo[k]);
    });
    [g.fragments, g.tries].forEach(function (bag) {
      Object.keys(bag).forEach(function (key) {
        if (typeof bag[key] !== 'number' || !isFinite(bag[key]) || bag[key] < 0) bag[key] = 0;
        else bag[key] = Math.floor(bag[key]);
      });
    });
    // Chuẩn hóa mục techniques của các bộ ngu_hanh (kẹp tầng/điểm như
    // ensureTechniques làm cho hai quyển gốc; không tự tạo, không tự xóa).
    if (state.techniques && typeof state.techniques === 'object') {
      Object.keys(state.techniques).forEach(function (id) {
        var def = TECHNIQUE_DEFS[id], t = state.techniques[id];
        if (!def || !def.nguHanh || !t || typeof t !== 'object') return;
        if (typeof t.tier !== 'number' || !isFinite(t.tier)) t.tier = 1;
        t.tier = Math.min(4, Math.max(1, Math.floor(t.tier)));
        if (typeof t.xp !== 'number' || !isFinite(t.xp) || t.xp < 0) t.xp = 0;
      });
    }
    return state.nguHanh;
  }
  function nguHanhIds() {
    return Object.keys(TECHNIQUE_DEFS).filter(function (id) {
      var d = TECHNIQUE_DEFS[id];
      return !!(d && (d.nguHanh || d.registrationOnly));
    });
  }
  function nguHanhLearned(state) {
    return nguHanhIds().filter(function (id) { return !!techniqueOf(state, id); });
  }
  // Học một bộ — các đợt cài gọi tại điểm nguồn của bộ; đợt khung này
  // chỉ kiểm thử gọi. Chuỗi hệ (requires/requiresAny) là thứ tự học
  // trong chính danh mục tùy chọn, không phải cổng truyện: bỏ qua cả
  // danh mục vẫn qua mọi cổng bằng hai quyển gốc + Vạn Âm (luật 2).
  function nguHanhLearn(state, id) {
    var def = TECHNIQUE_DEFS[id];
    if (!def) return { ok: false, reason: 'unknown' };
    if (def.registrationOnly) return { ok: false, reason: 'registration_only' };
    if (!def.nguHanh) return { ok: false, reason: 'not_ngu_hanh' };
    if (techniqueOf(state, id)) return { ok: false, reason: 'already' };
    // Vá cung IV: requiresExternal chỉ chặn khi CHƯA sở hữu bí tịch
    // ngoài danh mục (SP-02 đòi Huyền Tinh Kiếm Phổ — trước đây nhánh
    // này từ chối VÔ ĐIỀU KIỆN nên bộ không bao giờ học được).
    if (def.requiresExternal && !techniqueOf(state, def.requiresExternal)) return { ok: false, reason: 'external_missing', external: def.requiresExternal };
    var missing = (def.requires || []).filter(function (r) { return !techniqueOf(state, r); });
    if (missing.length) return { ok: false, reason: 'chain', missing: missing };
    if (def.requiresAny && !def.requiresAny.some(function (r) { return !!techniqueOf(state, r); })) {
      return { ok: false, reason: 'chain', missing: def.requiresAny.slice() };
    }
    if (!state.techniques || typeof state.techniques !== 'object') state.techniques = {};
    state.techniques[id] = { tier: 1, xp: 0 };
    return { ok: true, technique: id };
  }
  /* Mảnh bí tịch (bản đồ mục 3.3a): boss nguồn rơi chắc 1 mảnh mỗi
     lần hạ ở các đợt cài; đủ fragmentsNeeded thì ghép tại điểm ghép
     (nguHanhCraft). Đã học rồi mà vẫn nhận mảnh: mảnh tự chuyển thành
     tàn thiên của bộ đó — hàm này chỉ báo converted, lớp cài phát
     vật phẩm, nên không tồn tại mảnh rác. */
  function nguHanhFragments(state, id) {
    var g = ensureNguHanh(state);
    var v = g.fragments[id];
    return (typeof v === 'number' && isFinite(v) && v > 0) ? Math.floor(v) : 0;
  }
  function nguHanhAddFragment(state, id) {
    var def = TECHNIQUE_DEFS[id];
    if (!def || !def.fragmentsNeeded) return { ok: false, reason: 'no_fragments' };
    if (techniqueOf(state, id)) return { ok: true, converted: true, count: nguHanhFragments(state, id), needed: def.fragmentsNeeded };
    var g = ensureNguHanh(state);
    g.fragments[id] = nguHanhFragments(state, id) + 1;
    return { ok: true, converted: false, count: g.fragments[id], needed: def.fragmentsNeeded, complete: g.fragments[id] >= def.fragmentsNeeded };
  }
  function nguHanhCanCraft(state, id) {
    var def = TECHNIQUE_DEFS[id];
    return !!(def && def.fragmentsNeeded && !techniqueOf(state, id) && nguHanhFragments(state, id) >= def.fragmentsNeeded);
  }
  function nguHanhCraft(state, id) {
    if (!nguHanhCanCraft(state, id)) return { ok: false, reason: 'not_ready' };
    var r = nguHanhLearn(state, id);
    if (!r.ok) return r;
    var g = ensureNguHanh(state);
    g.fragments[id] = nguHanhFragments(state, id) - TECHNIQUE_DEFS[id].fragmentsNeeded;
    return { ok: true, technique: id, fragmentsLeft: g.fragments[id] };
  }
  /* Đếm lần thử (bản đồ mục 3.3b): bộ đếm thuần cho nguồn rơi tỉ lệ —
     lớp cài gọi nguHanhRecordTry sau mỗi lần hạ không rơi, đọc cờ
     guaranteed để rơi chắc ở lần chạm ngưỡng, và nguHanhResetTries
     khi đã rơi. Ngưỡng: tàn thiên 12 (NGU_HANH_TAN_THIEN_GUARANTEE),
     bộ 29 là 15 (def.dropGuarantee.tries). */
  function nguHanhTries(state, key) {
    var g = ensureNguHanh(state);
    var v = g.tries[key];
    return (typeof v === 'number' && isFinite(v) && v > 0) ? Math.floor(v) : 0;
  }
  function nguHanhRecordTry(state, key, guarantee) {
    var g = ensureNguHanh(state);
    var n = nguHanhTries(state, key) + 1;
    g.tries[key] = n;
    return { tries: n, guaranteed: (typeof guarantee === 'number' && guarantee > 0) ? n >= guarantee : false };
  }
  function nguHanhResetTries(state, key) {
    var g = ensureNguHanh(state);
    g.tries[key] = 0;
  }
  /* Kỳ ngộ (bản đồ mục 5): bảo đảm mềm p(n) = min(6%, 0,4% + 0,15%
     nhân n) trên bộ đếm hành động đủ điều kiện; bảo đảm cứng ở n =
     300; sau mỗi kỳ ngộ bộ đếm về 0 và khóa 60 hành động. Người chơi
     không thấy bộ đếm — mặt truyện là vận may, mặt hệ thống là bảo
     đảm. Hàm này THUẦN theo hai số roll do lớp gọi đưa vào (roll cho
     xác suất, pickRoll cho chọn bộ theo trọng số) để kiểm thử tất
     định; lớp game đưa roll từ hạt giống phiên như mọi lần rút khác. */
  function kyNgoChance(n) {
    n = (typeof n === 'number' && isFinite(n) && n > 0) ? Math.floor(n) : 0;
    return Math.min(KY_NGO_CAP, KY_NGO_BASE + KY_NGO_STEP * n);
  }
  // Tập bộ kỳ ngộ người chơi đủ điều kiện lúc này: đúng dải cảnh
  // giới của bộ, chưa học, đủ chuỗi hệ, đủ mốc truyện riêng (SP-01
  // cần q16_linh_ngo), và — khi lớp gọi nêu hoạt động — đúng hoạt
  // động dễ nảy của bộ.
  function kyNgoPool(state, activity) {
    var ord = realmOrdinal(state);
    var bandRealm = { luyen_khi: 1, truc_co: 2, kim_dan: 3, nguyen_anh: 4, hoa_than: 5 };
    return nguHanhIds().filter(function (id) {
      var def = TECHNIQUE_DEFS[id];
      if (!def || !def.kyNgo || techniqueOf(state, id)) return false;
      if (ord < bandRealm[def.band] * 100) return false;
      if (activity && def.kyNgo.activities && def.kyNgo.activities.indexOf(activity) < 0) return false;
      if (def.kyNgo.afterQuest && !questReached(state, def.kyNgo.afterQuest)) return false;
      if (def.requires && !def.requires.every(function (r) { return !!techniqueOf(state, r); })) return false;
      if (def.requiresAny && !def.requiresAny.some(function (r) { return !!techniqueOf(state, r); })) return false;
      return true;
    });
  }
  function kyNgoOnAction(state, roll, pickRoll, activity) {
    var g = ensureNguHanh(state);
    if (g.kyNgo.lock > 0) { g.kyNgo.lock -= 1; return { triggered: false, locked: true, n: g.kyNgo.n }; }
    var n = g.kyNgo.n;
    var chance = n >= KY_NGO_HARD ? 1 : kyNgoChance(n);
    if (!(roll < chance)) { g.kyNgo.n = n + 1; return { triggered: false, n: g.kyNgo.n, chance: chance }; }
    g.kyNgo.n = 0; g.kyNgo.lock = KY_NGO_LOCK; g.kyNgo.total += 1;
    var pool = kyNgoPool(state, activity);
    if (!pool.length) {
      // Tập rỗng: kỳ ngộ vẫn diễn, cho tàn thiên của một bộ ngu_hanh
      // đã học — sự kiện không bao giờ rỗng (bản đồ mục 5.2).
      var learned = nguHanhLearned(state);
      if (!learned.length) return { triggered: true, setId: null, fallback: null, fallbackSet: null, n: 0 };
      var pr = (typeof pickRoll === 'number' && isFinite(pickRoll)) ? Math.min(0.999999, Math.max(0, pickRoll)) : 0;
      return { triggered: true, setId: null, fallback: 'tan_thien', fallbackSet: learned[Math.floor(pr * learned.length)], n: 0 };
    }
    var totalW = 0;
    pool.forEach(function (id) { totalW += TECHNIQUE_DEFS[id].kyNgo.weight || 1; });
    var pick = ((typeof pickRoll === 'number' && isFinite(pickRoll)) ? Math.min(0.999999, Math.max(0, pickRoll)) : 0) * totalW;
    var chosen = pool[pool.length - 1];
    for (var i = 0; i < pool.length; i++) {
      pick -= TECHNIQUE_DEFS[pool[i]].kyNgo.weight || 1;
      if (pick < 0) { chosen = pool[i]; break; }
    }
    return { triggered: true, setId: chosen, fallback: null, n: 0 };
  }

  /* ================= QUÁI / VÙNG SĂN / BOSS DÃ NGOẠI =================
     Đăng ký loài theo docs/grind-prep (quyết định P-4 của đợt cày). Số
     máu/tấn công/tốc độ của quái là [ĐỀ XUẤT SỐ] của làn chạm trán (tài
     liệu cày chỉ khóa kinh tế, không khóa số chiến đấu): neo vào uy lực
     kiếm hiện có (Luyện Khí ~31-55/nhát) để quái thường ngã trong 2-4
     nhát, tinh anh 6-10 nhát, boss là trận dài có bốn đợt máu. Cấp yêu
     đan rơi tính theo VÙNG, không theo loài (cùng một loài ở vùng Trúc
     Cơ cho yêu đan cấp 2). */
  var MONSTER_DEFS = {
    son_lang: { name: 'Sơn Lang', rank: 'normal', hp: 90, atk: 7, atkInterval: 1.6, speed: 46, cry: 420 },
    doc_vu_xa: { name: 'Độc Vũ Xà', rank: 'normal', hp: 70, atk: 9, atkInterval: 1.4, speed: 40, cry: 640 },
    thiet_giap_tru: { name: 'Thiết Giáp Trư', rank: 'elite', hp: 300, atk: 13, atkInterval: 1.5, speed: 38, cry: 300, biTich: 'bi_tich_thanh_phong', biTichChance: 0.18 },
    phong_ung: { name: 'Phong Ưng', rank: 'elite', hp: 220, atk: 15, atkInterval: 1.3, speed: 62, cry: 700, biTich: 'bi_tich_that_tinh', biTichChance: 0.18 },
    lang_vuong: { name: 'Lang Vương', rank: 'boss', hp: 560, atk: 16, atkInterval: 1.3, speed: 52, cry: 340 },
    son_chu: { name: 'Sơn Chủ', rank: 'boss', hp: 1500, atk: 20, atkInterval: 1.4, speed: 40, cry: 280 },
    /* Quái bí cảnh (đợt bí cảnh + hệ cày): số [ĐỀ XUẤT] neo uy lực kiếm
       hiện có như quái dã ngoại. wordResist của Kiếm Ý Tàn Hồn = kháng
       cộng hưởng 50% (bicanh-design S-9) — làn game.js áp khi tính sóng
       âm lên boss này; các quái khác không có trường này (= không kháng). */
    dong_xa: { name: 'Động Xà', rank: 'normal', hp: 80, atk: 8, atkInterval: 1.6, speed: 44, cry: 520 },
    thuy_xa_tinh: { name: 'Thủy Xà Tinh', rank: 'boss', hp: 430, atk: 11, atkInterval: 1.4, speed: 42, cry: 380 },
    thach_tuong: { name: 'Thạch Tượng', rank: 'normal', hp: 140, atk: 10, atkInterval: 1.7, speed: 34, cry: 220 },
    thach_tuong_thu_ve: { name: 'Thạch Tượng Thủ Vệ', rank: 'boss', hp: 520, atk: 12, atkInterval: 1.5, speed: 36, cry: 200 },
    tan_anh_vo_cuc: { name: 'Tàn Ảnh Vô Cực', rank: 'boss', hp: 1500, atk: 17, atkInterval: 1.4, speed: 46, cry: 300 },
    kiem_linh: { name: 'Kiếm Linh', rank: 'normal', hp: 115, atk: 13, atkInterval: 1.4, speed: 48, cry: 600 },
    kiem_y_tan_hon: { name: 'Kiếm Ý Tàn Hồn', rank: 'boss', hp: 1450, atk: 18, atkInterval: 1.3, speed: 50, cry: 580, wordResist: 0.5 },
    oan_binh: { name: 'Oán Binh', rank: 'normal', hp: 160, atk: 14, atkInterval: 1.5, speed: 40, cry: 260 },
    oan_hon_chien_truong: { name: 'Oán Hồn Chiến Trường', rank: 'boss', hp: 1650, atk: 18, atkInterval: 1.4, speed: 42, cry: 240 },
    /* Cung IV — tầng sâu Kiếm Trủng + boss dã ngoại Kim Đan + tinh anh
       đường mòn. Số [ĐỀ XUẤT theo thang hiện hành]: boss Trúc Cơ
       1450–1650 hp ở uy lực kiếm ~47 (Phá Quân); Kim Đan Sơ Kỳ kiếm
       nền 56 (Huyền Tinh Trảm ~106 / Phá Quân ~95), boss dải này đặt
       2400–2600 để trận dài ~25 nhát như tiền lệ. Âm gốc của Trận Nhãn
       ỔN ĐỊNH nên không khai wordResist — cộng hưởng tác dụng đầy đủ, cửa sổ
       Định Âm nằm ở chu kỳ chiêu chứ không ở kháng; lính giữ cửa giữ
       kháng 0,5 như Kiếm Ý Tàn Hồn tầng trên (đúng nhiệm vụ giao). */
    tan_hon_kiem_y_sau: { name: 'Kiếm Ý Tàn Hồn (Tầng Sâu)', rank: 'normal', hp: 700, atk: 20, atkInterval: 1.3, speed: 50, cry: 580, wordResist: 0.5 },
    tran_nhan_kiem_linh: { name: 'Trận Nhãn Kiếm Linh', rank: 'boss', hp: 2600, atk: 24, atkInterval: 1.3, speed: 44, cry: 300,
      skills: [
        { id: 'quat_kiem', name: 'Quạt Kiếm Phóng', swords: 7, telegraphSec: 0.6 },
        { id: 'chu_ky_kiem_tran', name: 'Chu Kỳ Kiếm Trận', swords: 7, note: '7 kiếm luân phiên; quạt cuộn theo chu kỳ — đứng lâu một chỗ sẽ bị quét lặp' },
        { id: 'van_kiem_quy_tong', name: 'Vạn Kiếm Quy Tông', telegraphSec: 1.2, dinhAmWindow: true, note: 'chiêu lớn cuối chu trình: báo trước dài, cửa sổ dùng Định Âm đóng băng chu kỳ' }
      ],
      eyes: { count: 2, phongAmSlowsCycle: true, note: 'hai mắt trận phụ ở (6,14) và (37,14): mỗi mắt bị Phong Âm phong ấn làm chu kỳ quay chậm lại' } },
    ho_tran_kiem_linh: { name: 'Hộ Trận Kiếm Linh', rank: 'boss', hp: 2400, atk: 23, atkInterval: 1.3, speed: 44, cry: 300,
      skills: [
        { id: 'quat_kiem_tran', name: 'Quạt Kiếm Trận', swords: 7, telegraphSec: 0.6 },
        { id: 'van_chu_ky', name: 'Vận Chu Kỳ', dinhAmWindow: true, note: 'cửa sổ Định Âm như Trận Nhãn — cùng một họ kiếm linh' }
      ] },
    /* Di Tích Trận Tâm (đợt bí cảnh boss tổ đội): boss giữa tầng ngoài
       đánh đơn như boss bí cảnh thường (thang boss Kim Đan 2400/23 như
       Hộ Trận Kiếm Linh); boss cuối tâm trận là BOSS TỔ ĐỘI đầu tiên
       (partyBoss: true — cổng tổ đội partyMin 2 ở SECRET_REALM_DEFS,
       cơ chế Phong Ấn Hai Điểm cần hai người giữ hai điểm trận). */
    ho_tam_thach_tuong: { name: 'Hộ Tâm Thạch Tướng', rank: 'boss', hp: 2400, atk: 23, atkInterval: 1.35, speed: 40, cry: 320 },
    tran_tam_ma_anh: { name: 'Trận Tâm Ma Ảnh', rank: 'boss', hp: 5200, atk: 27, atkInterval: 1.3, speed: 46, cry: 300, partyBoss: true },
    /* Tinh anh Kim Đan ở đường mòn (bảng spawn mới — hình dùng chung
       họ Sơn Lang, tông nhiễu sóng do engine vẽ phân biệt). */
    lang_nhiem_song: { name: 'Sơn Lang Nhiễm Sóng', rank: 'elite', hp: 1500, atk: 22, atkInterval: 1.3, speed: 50, cry: 420 }
  };
  var HUNT_ZONES = {
    zone_duong_mon_rung: { map: 'duong_mon', x0: 2, y0: 2, x1: 93, y1: 71, grassOnly: true, yeuDanLevel: 1 },
    zone_duong_mon_phuc_kich: { map: 'duong_mon', x0: 40, y0: 50, x1: 46, y1: 54, yeuDanLevel: 1 },
    zone_tong_sau_nui: { map: 'thanh_van_tong', x0: 84, y0: 3, x1: 119, y1: 30, yeuDanLevel: 1 },
    zone_hb_rung: { map: 'hb_valley', x0: 10, y0: 18, x1: 86, y1: 66, yeuDanLevel: 2 },
    zone_hb_bac: { map: 'hb_valley', x0: 43, y0: 8, x1: 55, y1: 20, yeuDanLevel: 2 },
    /* Vùng bí cảnh: một vùng mỗi bản đồ, bao toàn bộ nội thất (trừ viền
       vách). Cấp yêu đan theo dải bí cảnh (Luật Không Tường): dải Luyện
       Khí -> cấp 1, dải Trúc Cơ -> cấp 2. */
    zone_bc_thuyliem: { map: 'bc_thuyliem', x0: 1, y0: 1, x1: 42, y1: 30, yeuDanLevel: 1 },
    zone_bc_tapha: { map: 'bc_tapha', x0: 1, y0: 1, x1: 38, y1: 28, yeuDanLevel: 1 },
    zone_bc_tapsau: { map: 'bc_tapsau', x0: 1, y0: 1, x1: 38, y1: 28, yeuDanLevel: 2 },
    zone_bc_kiemtrung: { map: 'bc_kiemtrung', x0: 1, y0: 1, x1: 46, y1: 32, yeuDanLevel: 2 },
    zone_bc_hoiphong_mo: { map: 'bc_hoiphong_mo', x0: 1, y0: 1, x1: 50, y1: 36, yeuDanLevel: 2 },
    zone_bc_kiemtrung_sau: { map: 'bc_kiemtrung_sau', x0: 1, y0: 1, x1: 42, y1: 30, yeuDanLevel: 3 },
    zone_bc_tran_tam: { map: 'bc_tran_tam', x0: 1, y0: 1, x1: 42, y1: 30, yeuDanLevel: 3 },
    zone_bc_tran_tam_sau: { map: 'bc_tran_tam_sau', x0: 1, y0: 1, x1: 38, y1: 28, yeuDanLevel: 3 }
  };
  // Ổ (lair) của từng vùng: điểm sinh xác định, xa điểm cốt truyện/đường
  // chính — quái chỉ đi lại quanh ổ trong vùng của mình.
  var HUNT_LAIRS = [
    { zoneId: 'zone_duong_mon_rung', species: 'son_lang', x: 20, y: 20 },
    { zoneId: 'zone_duong_mon_rung', species: 'doc_vu_xa', x: 74, y: 58 },
    { zoneId: 'zone_duong_mon_rung', species: 'son_lang', x: 68, y: 14 },
    { zoneId: 'zone_tong_sau_nui', species: 'thiet_giap_tru', x: 90, y: 8 },
    { zoneId: 'zone_tong_sau_nui', species: 'phong_ung', x: 112, y: 24 },
    { zoneId: 'zone_tong_sau_nui', species: 'son_lang', x: 104, y: 6 },
    { zoneId: 'zone_hb_rung', species: 'son_lang', x: 25, y: 40 },
    { zoneId: 'zone_hb_rung', species: 'doc_vu_xa', x: 70, y: 50 },
    { zoneId: 'zone_hb_rung', species: 'thiet_giap_tru', x: 30, y: 25 },
    { zoneId: 'zone_hb_bac', species: 'phong_ung', x: 52, y: 17 },
    /* Cung IV: ổ tinh anh dải Kim Đan ở đường mòn — mở sau q14_done.
       Trường requiresQuest là MỚI ở bảng lairs: engine sinh quái PHẢI
       lọc theo questReached(state, requiresQuest) (xem hợp đồng A.3). */
    { zoneId: 'zone_duong_mon_rung', species: 'lang_nhiem_song', x: 56, y: 40, requiresQuest: 'q14_done' },
    /* Cung IV đợt 3: tinh anh quanh tuyến hộ tống — hiện diện từ
       q22_done theo 22.md mục 5 (R-1), và chính là các điểm "tàn trận"
       ở lại vĩnh viễn sau cung theo 23.md/24.md mục 5 (cùng một cổng
       q22_done — sau q24_done cổng vẫn đạt nên trạng thái thế giới tự
       duy trì). Loài kiếm linh xỉn chưa có sheet riêng: dùng
       lang_nhiem_song (loài nhiễm sóng sẵn có, đúng tông). */
    { zoneId: 'zone_duong_mon_rung', species: 'lang_nhiem_song', x: 44, y: 40, requiresQuest: 'q22_done' },
    { zoneId: 'zone_duong_mon_rung', species: 'phong_ung', x: 38, y: 50, requiresQuest: 'q22_done' }
  ];
  var BOSS_DEFS = {
    boss_dm_lang_vuong: { name: 'Lang Vương Bãi Phục Kích', title: 'Chúa tể bãi phục kích', species: 'lang_vuong',
      zoneId: 'zone_duong_mon_phuc_kich', map: 'duong_mon', lair: { x: 43, y: 52 }, cycleDays: 3,
      profileId: 'profile:boss_dm_lang_vuong', guaranteedYeuDan: 'yeu_dan_1',
      requiresQuest: 'q2_cong_thanh', minOrdinal: 100, biTich: 'bi_tich_that_tinh' },
    boss_hb_son_chu: { name: 'Sơn Chủ Hồi Phong', title: 'Chúa tể Hồi Phong', species: 'son_chu',
      zoneId: 'zone_hb_bac', map: 'hb_valley', lair: { x: 49, y: 14 }, cycleDays: 4,
      profileId: 'profile:boss_hb_son_chu', guaranteedYeuDan: 'yeu_dan_2',
      requiresQuest: 'q9_tin_du', minOrdinal: 200, biTich: 'bi_tich_thanh_phong' },
    /* Cung IV: boss dã ngoại dải Kim Đan — chu kỳ 5 ngày, requiresQuest
       q15_done theo nhiệm vụ giao; hồ sơ ở profileId (32 lt + 30% tu vi
       + 10 công trạng + Yêu Đan cấp 3 chắc chắn, sàn boss x0,5 áp trong
       grantReward như các boss hiện hành). Ổ (46,10) tránh ổ Sơn Chủ
       (49,14) và ổ Phong Ưng (52,17) trong cùng vùng hb_bac. */
    boss_hb_ho_tran_kiem_linh: { name: 'Hộ Trận Kiếm Linh', title: 'Kiếm linh giữ trận Hồi Phong', species: 'ho_tran_kiem_linh',
      zoneId: 'zone_hb_bac', map: 'hb_valley', lair: { x: 46, y: 10 }, cycleDays: 5,
      profileId: 'profile:boss_hb_ho_tran', guaranteedYeuDan: 'yeu_dan_3',
      requiresQuest: 'q15_done', minOrdinal: 300, biTich: null }
  };
  function bossClaimKey(bossId, cycleId) { return 'gr:boss:' + bossId + ':c' + cycleId; }
  // Trạng thái boss là HÀM THUẦN DUY NHẤT của dayCount + khóa chu kỳ +
  // cổng (systems-data mục 6.2) — lớp hiển thị cấm tự tính ngày.
  function bossStatus(state, bossId) {
    var def = BOSS_DEFS[bossId];
    if (!def) return { state: 'locked', cycleId: 0, daysLeft: 0 };
    var day = (state && typeof state.dayCount === 'number' && isFinite(state.dayCount) && state.dayCount > 0) ? Math.floor(state.dayCount) : 0;
    var cycleId = Math.floor(day / def.cycleDays);
    var out = { state: 'locked', cycleId: cycleId, daysLeft: (cycleId + 1) * def.cycleDays - day };
    if (!questReached(state, def.requiresQuest) || realmOrdinal(state) < def.minOrdinal) return out;
    var g = ensureGrind(state);
    out.state = (g.claimed[bossClaimKey(bossId, cycleId)] != null) ? 'claimed' : 'alive';
    return out;
  }
  // Rút xác định theo id phiên: giá trị rút đầu tiên của dòng hạt giống
  // phiên — nạp lại giữa phiên cho cùng kết quả (khẳng định G-YD-02).
  var YEU_DAN_DROP_NORMAL = 0.02, YEU_DAN_DROP_ELITE = 0.25;
  function rollSessionValue(sessionId, salt) {
    var rng = grindRng(grindHash32(String(sessionId) + (salt || '')));
    return rng();
  }
  function yeuDanDropFor(sessionId, chance) { return rollSessionValue(sessionId) < chance; }
  function newEncounterSessionId(state) {
    var g = ensureGrind(state);
    g.seq += 1;
    return 'gr:enc:d' + state.dayCount + ':n' + g.seq;
  }
  /* Đổi yêu đan -> tu vi: van xả DUY NHẤT của yêu đan (30% thanh/viên,
     qua cửa grantReward để trần mềm ngày áp như mọi khoản cày). Kênh yêu
     đan -> Linh Thạch CẤM vĩnh viễn: không hồ sơ nào, không đường nào
     trong hệ đổi yêu đan ra Linh Thạch. */
  var YEU_DAN_EXCHANGE_PCT = 30;
  function exchangeYeuDan(state, level) {
    var id = 'yeu_dan_' + level;
    if (!ITEM_DEFS[id]) return { ok: false, reason: 'unknown_item' };
    var cap = REALMS[state.realm] && REALMS[state.realm].tuviNext;
    if (!cap) return { ok: false, reason: 'tuvi_cap_none' };
    if (bagCount(state, id) < 1) return { ok: false, reason: 'no_item' };
    var g = ensureGrind(state);
    g.seq += 1;
    var r = grantReward(state, { tuviPct: YEU_DAN_EXCHANGE_PCT }, { claimKey: 'gr:exc:d' + state.dayCount + ':n' + g.seq, sourceId: 'yeuDanExchange:' + level });
    if (!r.ok) return r;
    bagRemove(state, id, 1);
    return { ok: true, granted: r.granted, item: id };
  }

  /* ================= BẢNG CÀY — ĐỢT BÍ CẢNH + HỆ CÀY =================
     Mô hình hợp nhất của grind-design mục 0 (H-1/H-2): MỘT bảng logic cho
     mỗi hệ (kích thước 3), mọi điểm phát vật lý cùng đọc một bảng.
     Thuật toán sinh bảng đúng systems-data mục 2.4: lọc boardIds, dải
     cảnh giới kín, requiresQuest, scope 'repeat', loại trừ; sắp xếp theo
     templateId; hạt giống '<seedKey>|<dayCount>|v1'; chọn không lặp rồi
     rút target. Vectơ khóa: grindHash32('hunt_co_chau|12|v1') = 128188457,
     grindHash32('sect_daily|12|v1') = 662077024 (bảng ngày 12 sinh lại
     cho bảng 3 ô theo H-2). */
  var GRIND_SEED_VERSION = 'v1';
  var BOARD_DEFS = {
    board_hunt_daily: { name: 'Bảng Treo Thưởng Săn Quái', seedKey: 'hunt_co_chau', size: 3,
      lockedHint: 'Bảng treo thưởng mở khi tới Cô Châu Thành (sau q2_cong_thanh) và đã mở ví Linh Thạch.' },
    board_gather_daily: { name: 'Danh Sách Thu Thập', seedKey: 'gather_daily', size: 3,
      lockedHint: 'Danh sách thu thập mở khi đã có Túi Trữ Vật (chương 3).' },
    board_sect_daily: { name: 'Bảng Việc Tông Luân Phiên', seedKey: 'sect_daily', size: 3,
      lockedHint: 'Việc tông luân phiên mở sau khi xong việc tạp dịch chương 7 (q7_done).' }
  };
  /* Mẫu phiếu săn (systems-data mục 3.2; boardIds quy về bảng logic duy
     nhất board_hunt_daily). profileId là hồ sơ mặc định theo dải dưới
     của mẫu; hồ sơ THẬT khóa tại lúc nhận (resolvedProfileId) theo dải
     của người chơi lúc nhận — xem huntProfileForOrdinal. */
  var HUNT_TEMPLATES = [
    { templateId: 'hunt_son_lang_rung', scope: 'repeat', speciesId: 'son_lang', zoneId: 'zone_duong_mon_rung', boardIds: ['board_hunt_daily'], realmMin: 100, realmMax: 108, targetMin: 3, targetMax: 5, profileId: 'profile:hunt:lk' },
    { templateId: 'hunt_doc_vu_xa_rung', scope: 'repeat', speciesId: 'doc_vu_xa', zoneId: 'zone_duong_mon_rung', boardIds: ['board_hunt_daily'], realmMin: 101, realmMax: 108, targetMin: 3, targetMax: 4, profileId: 'profile:hunt:lk' },
    { templateId: 'hunt_son_lang_valley', scope: 'repeat', speciesId: 'son_lang', zoneId: 'zone_hb_rung', boardIds: ['board_hunt_daily'], realmMin: 200, realmMax: 203, requiresQuest: 'q9_tin_du', targetMin: 3, targetMax: 5, profileId: 'profile:hunt:tc' },
    { templateId: 'hunt_doc_vu_xa_valley', scope: 'repeat', speciesId: 'doc_vu_xa', zoneId: 'zone_hb_rung', boardIds: ['board_hunt_daily'], realmMin: 200, realmMax: 203, requiresQuest: 'q9_tin_du', targetMin: 3, targetMax: 4, profileId: 'profile:hunt:tc' },
    { templateId: 'hunt_thiet_giap_tru_tong', scope: 'repeat', speciesId: 'thiet_giap_tru', zoneId: 'zone_tong_sau_nui', boardIds: ['board_hunt_daily'], realmMin: 105, realmMax: 203, targetMin: 2, targetMax: 4, profileId: 'profile:hunt:lk' },
    { templateId: 'hunt_thiet_giap_tru_valley', scope: 'repeat', speciesId: 'thiet_giap_tru', zoneId: 'zone_hb_rung', boardIds: ['board_hunt_daily'], realmMin: 200, realmMax: 203, requiresQuest: 'q9_tin_du', targetMin: 2, targetMax: 4, profileId: 'profile:hunt:tc' },
    { templateId: 'hunt_phong_ung_tong', scope: 'repeat', speciesId: 'phong_ung', zoneId: 'zone_tong_sau_nui', boardIds: ['board_hunt_daily'], realmMin: 200, realmMax: 203, targetMin: 2, targetMax: 3, profileId: 'profile:hunt:tc' },
    { templateId: 'hunt_phong_ung_valley', scope: 'repeat', speciesId: 'phong_ung', zoneId: 'zone_hb_bac', boardIds: ['board_hunt_daily'], realmMin: 200, realmMax: 203, requiresQuest: 'q9_tin_du', targetMin: 2, targetMax: 3, profileId: 'profile:hunt:tc' },
    /* Cung IV: mẫu dải Kim Đan (ordinal >= 300). Khi chưa có các mẫu
       này, tập mẫu hợp lệ của người chơi Kim Đan RỖNG (mọi mẫu cũ
       realmMax <= 203) — bảng săn không sinh nổi phiếu. profileId ghi
       sẵn hunt:kd nhưng resolvedProfileId vẫn đóng băng theo dải LÚC
       NHẬN qua huntProfileForOrdinal như mọi mẫu (hai bảng cùng cơ
       chế định giá theo dải). realmMax null: phiếu dải này còn dùng
       được ở các đại cảnh giới sau (R-4 vòng đời dài). */
    { templateId: 'hunt_son_lang_kd', scope: 'repeat', speciesId: 'son_lang', zoneId: 'zone_duong_mon_rung', boardIds: ['board_hunt_daily'], realmMin: 300, realmMax: null, targetMin: 3, targetMax: 5, profileId: 'profile:hunt:kd' },
    { templateId: 'hunt_doc_vu_xa_kd', scope: 'repeat', speciesId: 'doc_vu_xa', zoneId: 'zone_duong_mon_rung', boardIds: ['board_hunt_daily'], realmMin: 300, realmMax: null, targetMin: 3, targetMax: 4, profileId: 'profile:hunt:kd' },
    { templateId: 'hunt_lang_nhiem_song_kd', scope: 'repeat', speciesId: 'lang_nhiem_song', zoneId: 'zone_duong_mon_rung', boardIds: ['board_hunt_daily'], realmMin: 300, realmMax: null, requiresQuest: 'q14_done', targetMin: 2, targetMax: 3, profileId: 'profile:hunt:kd' },
    { templateId: 'hunt_thiet_giap_tru_kd', scope: 'repeat', speciesId: 'thiet_giap_tru', zoneId: 'zone_tong_sau_nui', boardIds: ['board_hunt_daily'], realmMin: 300, realmMax: null, targetMin: 2, targetMax: 4, profileId: 'profile:hunt:kd' },
    { templateId: 'hunt_phong_ung_kd', scope: 'repeat', speciesId: 'phong_ung', zoneId: 'zone_hb_bac', boardIds: ['board_hunt_daily'], realmMin: 300, realmMax: null, requiresQuest: 'q9_tin_du', targetMin: 2, targetMax: 3, profileId: 'profile:hunt:kd' },
    /* Cung IV đợt 2 (chương 17): phiếu săn thành phố làm mới đợt 2 —
       bầy lang nhiễm sóng kéo về gần tháp sau vụ thước rung; đúng 3 con,
       mở từ q17_done (khác mẫu hunt_lang_nhiem_song_kd mở từ q14_done). */
    { templateId: 'hunt_lang_nhiem_song_thap_kd', scope: 'repeat', speciesId: 'lang_nhiem_song', zoneId: 'zone_duong_mon_rung', boardIds: ['board_hunt_daily'], realmMin: 300, realmMax: null, requiresQuest: 'q17_done', targetMin: 3, targetMax: 3, profileId: 'profile:hunt:kd' }
  ];
  /* Mẫu phiếu thu thập (systems-data mục 4.1; boardIds quy về
     board_gather_daily). profileId là hồ sơ lựa chọn tu vi; nếu người
     chơi chọn đan thì hồ sơ đan resolve theo dải lúc nộp — xem
     gatherDanProfileForOrdinal. zoneHint chỉ là gợi ý vùng hái. */
  var GATHER_TEMPLATES = [
    { templateId: 'gat_thanh_tam_thao', scope: 'repeat', itemId: 'thanh_tam_thao', zoneHint: 'duong_mon/thanh_van_tong', boardIds: ['board_gather_daily'], realmMin: 100, realmMax: 203, targetMin: 3, targetMax: 5, profileId: 'profile:gat:tuvi' },
    { templateId: 'gat_xich_tam_hoa', scope: 'repeat', itemId: 'xich_tam_hoa', zoneHint: 'duong_mon', boardIds: ['board_gather_daily'], realmMin: 101, realmMax: 203, targetMin: 2, targetMax: 4, profileId: 'profile:gat:tuvi' },
    { templateId: 'gat_thuy_lau', scope: 'repeat', itemId: 'thuy_lau', zoneHint: 'duong_mon', boardIds: ['board_gather_daily'], realmMin: 100, realmMax: 203, targetMin: 3, targetMax: 5, profileId: 'profile:gat:tuvi' },
    { templateId: 'gat_linh_chi', scope: 'repeat', itemId: 'linh_chi', zoneHint: 'thanh_van_tong', boardIds: ['board_gather_daily'], realmMin: 105, realmMax: 203, targetMin: 1, targetMax: 2, profileId: 'profile:gat:tuvi' },
    { templateId: 'gat_son_kim_sa', scope: 'repeat', itemId: 'son_kim_sa', zoneHint: 'thanh_van_tong/hb_valley', boardIds: ['board_gather_daily'], realmMin: 200, realmMax: 203, targetMin: 2, targetMax: 3, profileId: 'profile:gat:tuvi' },
    /* Cung IV: bản sao dải Kim Đan của các mẫu thu thập (bảng thu thập
       cũng phải làm mới theo dải như bảng săn). */
    { templateId: 'gat_thanh_tam_thao_kd', scope: 'repeat', itemId: 'thanh_tam_thao', zoneHint: 'duong_mon/thanh_van_tong', boardIds: ['board_gather_daily'], realmMin: 300, realmMax: null, targetMin: 3, targetMax: 5, profileId: 'profile:gat:tuvi' },
    { templateId: 'gat_linh_chi_kd', scope: 'repeat', itemId: 'linh_chi', zoneHint: 'thanh_van_tong', boardIds: ['board_gather_daily'], realmMin: 300, realmMax: null, targetMin: 1, targetMax: 2, profileId: 'profile:gat:tuvi' },
    { templateId: 'gat_son_kim_sa_kd', scope: 'repeat', itemId: 'son_kim_sa', zoneHint: 'thanh_van_tong/hb_valley', boardIds: ['board_gather_daily'], realmMin: 300, realmMax: null, targetMin: 2, targetMax: 3, profileId: 'profile:gat:tuvi' }
  ];
  /* Mẫu việc tông (systems-data mục 5.2). targetMin = targetMax = 1:
     việc tính theo lượt hoàn thành. profileId theo TẦNG việc (không
     theo từng mẫu); resolvedProfileId đóng băng theo tầng lúc nhận.
     Tầng tạp dịch: ordinal 105–203; tầng Trúc Cơ: ordinal >= 200. */
  var SECT_JOB_TEMPLATES = [
    { templateId: 'sect_chop_rot', scope: 'repeat', jobType: 'cleanup', tier: 'tap_dich', boardIds: ['board_sect_daily'], realmMin: 105, realmMax: 203, requiresQuest: 'q7_done', targetMin: 1, targetMax: 1, profileId: 'profile:sect:tap_dich', interactProp: 'viec_go', interactAt: { map: 'thanh_van_tong', x: 95, y: 70 } },
    { templateId: 'sect_water_rot', scope: 'repeat', jobType: 'cleanup', tier: 'tap_dich', boardIds: ['board_sect_daily'], realmMin: 105, realmMax: 203, requiresQuest: 'q7_done', targetMin: 1, targetMax: 1, profileId: 'profile:sect:tap_dich', interactProp: 'viec_nuoc', interactAt: { map: 'thanh_van_tong', x: 104, y: 68 } },
    { templateId: 'sect_carry_rot', scope: 'repeat', jobType: 'cleanup', tier: 'tap_dich', boardIds: ['board_sect_daily'], realmMin: 105, realmMax: 203, requiresQuest: 'q7_done', targetMin: 1, targetMax: 1, profileId: 'profile:sect:tap_dich', interactProp: 'viec_bao', interactAt: { map: 'thanh_van_tong', x: 90, y: 76 } },
    { templateId: 'sect_delivery_city', scope: 'repeat', jobType: 'delivery', tier: 'tap_dich', boardIds: ['board_sect_daily'], realmMin: 105, realmMax: 203, requiresQuest: 'q7_done', targetMin: 1, targetMax: 1, profileId: 'profile:sect:tap_dich', deliverNpc: 'duoc_su', deliverMap: 'co_chau' },
    { templateId: 'sect_patrol_rot', scope: 'repeat', jobType: 'patrol', tier: 'tap_dich', boardIds: ['board_sect_daily'], realmMin: 105, realmMax: 203, requiresQuest: 'q7_done', targetMin: 1, targetMax: 1, profileId: 'profile:sect:tap_dich', checkpoints: [{ map: 'thanh_van_tong', x: 61, y: 88 }, { map: 'thanh_van_tong', x: 38, y: 58 }, { map: 'thanh_van_tong', x: 101, y: 15 }] },
    { templateId: 'sect_escort_rot', scope: 'repeat', jobType: 'escort', tier: 'tap_dich', boardIds: ['board_sect_daily'], realmMin: 105, realmMax: 203, requiresQuest: 'q7_done', targetMin: 1, targetMax: 1, profileId: 'profile:sect:tap_dich', escortFrom: { map: 'thanh_van_tong', x: 97, y: 68 }, escortTo: { map: 'thanh_van_tong', x: 61, y: 60 } },
    { templateId: 'sect_patrol_valley', scope: 'repeat', jobType: 'patrol', tier: 'truc_co', boardIds: ['board_sect_daily'], realmMin: 200, realmMax: null, requiresQuest: 'q9_tin_du', targetMin: 1, targetMax: 1, profileId: 'profile:sect:truc_co', checkpoints: [{ map: 'hb_valley', x: 49, y: 60 }, { map: 'hb_valley', x: 49, y: 36 }, { map: 'hb_valley', x: 49, y: 14 }] },
    { templateId: 'sect_delivery_elder', scope: 'repeat', jobType: 'delivery', tier: 'truc_co', boardIds: ['board_sect_daily'], realmMin: 200, realmMax: null, requiresQuest: 'q7_done', targetMin: 1, targetMax: 1, profileId: 'profile:sect:truc_co', deliverNpc: 'truong_lao_tong', deliverMap: 'thanh_van_tong' },
    /* Cung IV: tầng việc Kim Đan — hồ sơ đóng băng theo tầng lúc nhận
       qua sectProfileForTier('kim_dan') -> profile:sect:kim_dan. */
    { templateId: 'sect_patrol_kim_dan', scope: 'repeat', jobType: 'patrol', tier: 'kim_dan', boardIds: ['board_sect_daily'], realmMin: 300, realmMax: null, requiresQuest: 'q14_done', targetMin: 1, targetMax: 1, profileId: 'profile:sect:kim_dan', checkpoints: [{ map: 'duong_mon', x: 47, y: 38 }, { map: 'duong_mon', x: 43, y: 54 }, { map: 'thanh_van_tong', x: 97, y: 15 }] },
    { templateId: 'sect_delivery_kim_dan', scope: 'repeat', jobType: 'delivery', tier: 'kim_dan', boardIds: ['board_sect_daily'], realmMin: 300, realmMax: null, requiresQuest: 'q14_done', targetMin: 1, targetMax: 1, profileId: 'profile:sect:kim_dan', deliverNpc: 'truong_lao_tong', deliverMap: 'thanh_van_tong' },
    /* Cung IV đợt 2 (chương 17/19): việc tông quanh Kiểm Trắc Tháp và
       áp tải hậu phiên phân xử — hồ sơ đóng băng profile:sect:kim_dan
       theo tier như mọi mẫu Kim Đan. Mẫu escort mang escortFrom/
       escortName/escortLook của chính mẫu (engine tổng quát ở mục B.9
       của hợp đồng đợt 2); các mẫu cũ không đổi hành vi. */
    { templateId: 'sect_patrol_thap_do', scope: 'repeat', jobType: 'patrol', tier: 'kim_dan', name: 'Tuần tra giữ trật tự ngày đo', boardIds: ['board_sect_daily'], realmMin: 300, realmMax: null, requiresQuest: 'q17_done', targetMin: 1, targetMax: 1, profileId: 'profile:sect:kim_dan', checkpoints: [{ map: 'kiem_trac_thap', x: 32, y: 14 }, { map: 'thap_noi', x: 19, y: 8 }, { map: 'co_chau', x: 51, y: 31 }] },
    { templateId: 'sect_escort_do_lai', scope: 'repeat', jobType: 'escort', tier: 'kim_dan', name: 'Hộ tống người đo lại', boardIds: ['board_sect_daily'], realmMin: 300, realmMax: null, requiresQuest: 'q17_done', targetMin: 1, targetMax: 1, profileId: 'profile:sect:kim_dan', escortFrom: { map: 'kiem_trac_thap', x: 36, y: 42 }, escortTo: { map: 'kiem_trac_thap', x: 32, y: 14 }, escortName: 'Người đo lại', escortLook: 'villager_m' },
    { templateId: 'sect_escort_ap_tai', scope: 'repeat', jobType: 'escort', tier: 'kim_dan', name: 'Áp tải văn thư nhân chứng về tông', boardIds: ['board_sect_daily'], realmMin: 300, realmMax: null, requiresQuest: 'q19_done', targetMin: 1, targetMax: 1, profileId: 'profile:sect:kim_dan', escortFrom: { map: 'co_chau', x: 52, y: 71 }, escortTo: { map: 'thanh_van_tong', x: 61, y: 87 }, escortName: 'Người giữ văn thư', escortLook: 'villager_old' },
    /* Cung IV đợt 3 (chương 21/22): việc tông quanh tuyến hộ tống —
       hộ tống thương đoàn mở từ q21_done, tuần tra tuyến mở từ
       q22_done (00-tong-quan mục 4.3.7); cùng khuôn đợt 2. */
    { templateId: 'sect_escort_thuong_doan', scope: 'repeat', jobType: 'escort', tier: 'kim_dan', name: 'Hộ tống thương đoàn về tông', boardIds: ['board_sect_daily'], realmMin: 300, realmMax: null, requiresQuest: 'q21_done', targetMin: 1, targetMax: 1, profileId: 'profile:sect:kim_dan', escortFrom: { map: 'co_chau', x: 51, y: 73 }, escortTo: { map: 'thanh_van_tong', x: 61, y: 87 }, escortName: 'Trưởng đoàn thương', escortLook: 'villager_old' },
    { templateId: 'sect_patrol_tuyen', scope: 'repeat', jobType: 'patrol', tier: 'kim_dan', name: 'Tuần tra tuyến hộ tống', boardIds: ['board_sect_daily'], realmMin: 300, realmMax: null, requiresQuest: 'q22_done', targetMin: 1, targetMax: 1, profileId: 'profile:sect:kim_dan', checkpoints: [{ map: 'duong_mon', x: 53, y: 24 }, { map: 'duong_mon', x: 44, y: 44 }, { map: 'thanh_van_tong', x: 61, y: 87 }] }
  ];
  /* Mẫu cốt truyện KHÔNG BAO GIỜ lọt vào bảng cày (systems-data 5.4):
     ba việc tạp dịch chương 7 (id vật thể dùng chung với việc luân
     phiên). Mẫu việc tông theo chương của phần 3 chưa có id mẫu riêng
     (chạy bằng cờ sectJobRound) nên khi đội phần 3 đăng ký mẫu cho
     chúng thì thêm id vào danh sách này. */
  var STORY_TEMPLATE_EXCLUSION = ['viec_go', 'viec_nuoc', 'viec_bao'];
  function templatesForBoard(boardId) {
    if (boardId === 'board_hunt_daily') return HUNT_TEMPLATES;
    if (boardId === 'board_gather_daily') return GATHER_TEMPLATES;
    if (boardId === 'board_sect_daily') return SECT_JOB_TEMPLATES;
    return [];
  }
  function generateBoard(state, boardId) {
    var def = BOARD_DEFS[boardId];
    if (!def) return { day: state.dayCount, slots: [] };
    var g = ensureGrind(state);
    if (g.boards[boardId] && g.boards[boardId].day === state.dayCount) return g.boards[boardId];
    var ord = realmOrdinal(state);
    var pool = [];
    templatesForBoard(boardId).forEach(function (t) {
      if (t.boardIds.indexOf(boardId) < 0) return;
      if (t.scope !== 'repeat') return;
      if (STORY_TEMPLATE_EXCLUSION.indexOf(t.templateId) >= 0) return;
      if (typeof t.realmMin === 'number' && ord < t.realmMin) return;
      if (typeof t.realmMax === 'number' && ord > t.realmMax) return;
      if (t.requiresQuest && !questReached(state, t.requiresQuest)) return;
      pool.push(t);
    });
    pool.sort(function (a, b) { return a.templateId < b.templateId ? -1 : (a.templateId > b.templateId ? 1 : 0); });
    var rng = grindRng(grindHash32(def.seedKey + '|' + state.dayCount + '|' + GRIND_SEED_VERSION));
    var slots = [], rest = pool.slice(), i, idx, t;
    var n = Math.min(def.size, rest.length);
    for (i = 0; i < n; i++) {
      idx = Math.floor(rng() * rest.length);
      t = rest.splice(idx, 1)[0];
      slots.push({ templateId: t.templateId, target: 0, _t: t });
    }
    for (i = 0; i < slots.length; i++) {
      t = slots[i]._t;
      slots[i].target = t.targetMin + Math.floor(rng() * (t.targetMax - t.targetMin + 1));
      delete slots[i]._t;
    }
    g.boards[boardId] = { day: state.dayCount, slots: slots };
    return g.boards[boardId];
  }
  /* Hồ sơ thưởng resolve theo dải/tầng — nguồn duy nhất cho
     resolvedProfileId đóng băng lúc nhận lượt. */
  function huntProfileForOrdinal(ord) {
    if (ord >= 300) return 'profile:hunt:kd';
    if (ord >= 200) return 'profile:hunt:tc';
    return 'profile:hunt:lk';
  }
  function gatherDanProfileForOrdinal(ord) {
    return ord >= 200 ? 'profile:gat:dan_tc' : 'profile:gat:dan_lk';
  }
  function sectProfileForTier(tier) {
    if (tier === 'truc_co') return 'profile:sect:truc_co';
    if (tier === 'kim_dan') return 'profile:sect:kim_dan';
    return 'profile:sect:tap_dich';
  }
  /* Định danh lượt suy được (systems-data mục 2.1). */
  function grindInstanceId(kind, boardId, day, slot) {
    if (kind === 'sect') return 'gr:sect:d' + day + ':s' + slot;
    if (kind === 'gather') return 'gr:gat:' + boardId + ':d' + day + ':s' + slot;
    return 'gr:hunt:' + boardId + ':d' + day + ':s' + slot;
  }
  var GRIND_ACTIVE_MAX = { hunt: 2, gather: 2, sect: 1 };
  function countHeldGrind(state, kind) {
    var g = ensureGrind(state), n = 0;
    for (var id in g.instances) {
      var ins = g.instances[id];
      if (ins && ins.kind === kind && (ins.status === 'active' || ins.status === 'ready')) n++;
    }
    return n;
  }
  /* Nhận một lượt từ bảng ngày: kiểm slot, giới hạn đang giữ (tính cả
     ready), chống nhận lại cùng ô trong ngày (kể cả sau khi hủy).
     Trả { ok, instance } hoặc { ok:false, reason }. */
  function acceptBoardInstance(state, kind, boardId, slot) {
    var g = ensureGrind(state);
    var board = generateBoard(state, boardId);
    var s = board.slots[slot];
    if (!s) return { ok: false, reason: 'no_slot' };
    var id = grindInstanceId(kind, boardId, state.dayCount, slot);
    if (g.instances[id]) return { ok: false, reason: 'already_taken' };
    if (countHeldGrind(state, kind) >= (GRIND_ACTIVE_MAX[kind] || 2)) return { ok: false, reason: 'held_limit' };
    var t = null, list = templatesForBoard(boardId);
    for (var i = 0; i < list.length; i++) if (list[i].templateId === s.templateId) { t = list[i]; break; }
    if (!t) return { ok: false, reason: 'template_missing' };
    var resolved = null;
    if (kind === 'hunt') resolved = huntProfileForOrdinal(realmOrdinal(state));
    else if (kind === 'sect') resolved = sectProfileForTier(t.tier);
    g.seq += 1;
    var ins = { instanceId: id, kind: kind, templateId: s.templateId, boardId: boardId, day: state.dayCount, slot: slot,
      status: 'active', progress: 0, target: s.target, acceptedSeq: g.seq, resolvedProfileId: resolved, cpIndex: 0 };
    g.instances[id] = ins;
    return { ok: true, instance: ins };
  }
  /* ================= ĐIỂM HÁI — HỆ THU THẬP =================
     9 điểm theo systems-data mục 4.2 (tọa độ ứng viên của tài liệu).
     Điểm hái cốt truyện Linh Chi chương 8 tại (100,13) KHÔNG phải điểm
     cày — không có trong danh sách này. yield = sản lượng mỗi lần hái
     (thảo 2, hoa 2, lau 2, linh chi 1, kim sa 1). */
  var RESOURCE_NODES = [
    { nodeId: 'n_thao_dm_01', itemId: 'thanh_tam_thao', mapId: 'duong_mon', x: 40, y: 30, anchorProp: 'grass_clump', respawnDays: 1, yieldProfile: 'yield:thanh_tam_thao', yield: 2 },
    { nodeId: 'n_thao_dm_02', itemId: 'thanh_tam_thao', mapId: 'duong_mon', x: 44, y: 44, anchorProp: 'flower_bush', respawnDays: 1, yieldProfile: 'yield:thanh_tam_thao', yield: 2 },
    { nodeId: 'n_hoa_dm_01', itemId: 'xich_tam_hoa', mapId: 'duong_mon', x: 38, y: 55, anchorProp: 'flower_bush', respawnDays: 2, yieldProfile: 'yield:xich_tam_hoa', yield: 2 },
    { nodeId: 'n_lau_dm_01', itemId: 'thuy_lau', mapId: 'duong_mon', x: 34, y: 35, anchorProp: 'reeds', respawnDays: 1, yieldProfile: 'yield:thuy_lau', yield: 2 },
    { nodeId: 'n_chi_tong_01', itemId: 'linh_chi', mapId: 'thanh_van_tong', x: 108, y: 20, anchorProp: 'rock_m', respawnDays: 2, yieldProfile: 'yield:linh_chi', yield: 1 },
    { nodeId: 'n_sa_tong_01', itemId: 'son_kim_sa', mapId: 'thanh_van_tong', x: 90, y: 8, anchorProp: 'rock_l_a', respawnDays: 3, yieldProfile: 'yield:son_kim_sa', yield: 1 },
    { nodeId: 'n_thao_hb_01', itemId: 'thanh_tam_thao', mapId: 'hb_valley', x: 30, y: 58, anchorProp: 'grass_clump', respawnDays: 1, yieldProfile: 'yield:thanh_tam_thao', yield: 2 },
    { nodeId: 'n_hoa_hb_01', itemId: 'xich_tam_hoa', mapId: 'hb_valley', x: 68, y: 30, anchorProp: 'flower_bush', respawnDays: 2, yieldProfile: 'yield:xich_tam_hoa', yield: 2 },
    { nodeId: 'n_sa_hb_01', itemId: 'son_kim_sa', mapId: 'hb_valley', x: 56, y: 12, anchorProp: 'rock_l_b', respawnDays: 3, yieldProfile: 'yield:son_kim_sa', yield: 1 }
  ];
  function nodeDef(nodeId) {
    for (var i = 0; i < RESOURCE_NODES.length; i++) if (RESOURCE_NODES[i].nodeId === nodeId) return RESOURCE_NODES[i];
    return null;
  }
  function nodeStatus(state, nodeId) {
    var def = nodeDef(nodeId);
    if (!def) return { ready: false, daysLeft: 0 };
    var g = ensureGrind(state);
    var rec = g.nodes[nodeId];
    if (!rec || typeof rec.lastDay !== 'number') return { ready: true, daysLeft: 0 };
    var diff = state.dayCount - rec.lastDay;
    if (diff >= def.respawnDays) return { ready: true, daysLeft: 0 };
    return { ready: false, daysLeft: def.respawnDays - diff };
  }
  /* ================= BÍ CẢNH — ĐỊNH NGHĨA & KHO LƯỢT =================
     5 tầng (4 bí cảnh vật lý; tháp có tầng ngoài + tầng sâu). Mở khóa
     suy từ questReached theo unlockQuest (di trú trong normalizeSave
     qua ensureSecretRealms — save đã qua mốc tự mở đúng bí cảnh).
     Kho lượt CHUNG tối đa 2 lượt/ngày game trên TẤT CẢ bí cảnh
     (parent-decisions bicanh, đòn bẩy (b)); lượt lần-đầu-tiên của từng
     bí cảnh KHÔNG tính vào kho. Vào rồi thoát ngay vẫn tính đã dùng
     lượt (bcConsumeEntry ghi ngay khi vào). */
  var SECRET_REALM_DEFS = {
    bc_thuyliem: { name: 'Thủy Liêm Động', band: 'luyenkhi', unlockQuest: 'q2_cong_thanh', map: 'bc_thuyliem', boss: 'thuy_xa_tinh', bossProfileId: 'profile:bc_thuyliem_boss', waveProfileId: 'profile:bc:bc_thuyliem:wave', yeuDanLevel: 1 },
    bc_tapha: { name: 'Tàn Tích Dưới Tháp — Tầng Ngoài', band: 'luyenkhi', unlockQuest: 'q3_thuoc_do', map: 'bc_tapha', boss: 'thach_tuong_thu_ve', bossProfileId: 'profile:bc_tapha_boss', waveProfileId: 'profile:bc:bc_tapha:wave', yeuDanLevel: 1 },
    bc_tapsau: { name: 'Tàn Tích Dưới Tháp — Tầng Sâu', band: 'trucco', unlockQuest: 'q8_done', map: 'bc_tapsau', boss: 'tan_anh_vo_cuc', bossProfileId: 'profile:bc_tapsau_boss', waveProfileId: 'profile:bc:bc_tapsau:wave', yeuDanLevel: 2 },
    bc_kiemtrung: { name: 'Kiếm Trủng Sau Núi', band: 'trucco', unlockQuest: 'q8_done', map: 'bc_kiemtrung', boss: 'kiem_y_tan_hon', bossProfileId: 'profile:bc_kiemtrung_boss', waveProfileId: 'profile:bc:bc_kiemtrung:wave', yeuDanLevel: 2 },
    bc_hoiphong_mo: { name: 'Hồi Phong Cổ Mộ', band: 'trucco', unlockQuest: 'q9_tin_du', map: 'bc_hoiphong_mo', boss: 'oan_hon_chien_truong', bossProfileId: 'profile:bc_hoiphong_boss', waveProfileId: 'profile:bc:bc_hoiphong_mo:wave', yeuDanLevel: 2 },
    /* Tầng sâu Kiếm Trủng (cung IV): unlockQuest chỉ là MỘT nửa điều
       kiện — ensureSecretRealms ép thêm cảnh giới Kim Đan (ordinal
       >= 300) cho riêng bí cảnh này. TUYỆT ĐỐI không điều kiện tầng
       công pháp (luật cứng). Boss: Trận Nhãn Kiếm Linh; lính giữ cửa
       kháng cộng hưởng 50% như tầng trên. */
    bc_kiemtrung_sau: { name: 'Kiếm Trủng — Tầng Sâu', band: 'kimdan', unlockQuest: 'q16_linh_ngo', repeatQuest: 'q17_done', map: 'bc_kiemtrung_sau', boss: 'tran_nhan_kiem_linh', bossProfileId: 'profile:bc_kiemtrung_sau_boss', waveProfileId: 'profile:bc:bc_kiemtrung_sau:wave', yeuDanLevel: 3 },
    /* Di Tích Trận Tâm (đợt bí cảnh boss tổ đội — docs/party-boss-
       dungeon-design.md): hai tầng hậu cung IV, mở tại q24_done. Tâm
       trận là BOSS TỔ ĐỘI: partyMin 2 + partyRoles ['dps','tank'] cho
       partyMatchmake lấp bot; điều kiện mở THẬT của tâm trận còn thêm
       firstClear tầng ngoài — xem bcTranTamSauOpen (cổng vào ở làn
       game.js phải gọi hàm đó, không chỉ secretRealmUnlocked). */
    bc_tran_tam: { name: 'Di Tích Trận Tâm — Tầng Ngoài', band: 'kimdan', unlockQuest: 'q24_done', map: 'bc_tran_tam', boss: 'ho_tam_thach_tuong', bossProfileId: 'profile:bc_tran_tam_boss', waveProfileId: 'profile:bc:bc_tran_tam:wave', yeuDanLevel: 3 },
    bc_tran_tam_sau: { name: 'Di Tích Trận Tâm — Tâm Trận', band: 'kimdan', unlockQuest: 'q24_done', map: 'bc_tran_tam_sau', boss: 'tran_tam_ma_anh', bossProfileId: 'profile:bc_tran_tam_sau_boss', waveProfileId: 'profile:bc:bc_tran_tam_sau:wave', yeuDanLevel: 3, partyMin: 2, partyRoles: ['dps', 'tank'] }
  };
  function defaultSecretRealms() {
    return { pool: { day: 0, used: 0 }, realms: {} };
  }
  function ensureSecretRealms(state) {
    if (!state || typeof state !== 'object') return defaultSecretRealms();
    if (!state.secretRealms || typeof state.secretRealms !== 'object') state.secretRealms = defaultSecretRealms();
    var sr = state.secretRealms;
    if (!sr.pool || typeof sr.pool !== 'object') sr.pool = { day: 0, used: 0 };
    if (typeof sr.pool.day !== 'number' || !isFinite(sr.pool.day) || sr.pool.day < 0) sr.pool.day = 0;
    if (typeof sr.pool.used !== 'number' || !isFinite(sr.pool.used) || sr.pool.used < 0) sr.pool.used = 0;
    if (!sr.realms || typeof sr.realms !== 'object') sr.realms = {};
    for (var id in SECRET_REALM_DEFS) {
      var e = sr.realms[id];
      if (!e || typeof e !== 'object') e = sr.realms[id] = {};
      var wasUnlocked = e.unlocked === true;
      e.unlocked = wasUnlocked || questReached(state, SECRET_REALM_DEFS[id].unlockQuest);
      if (id === 'bc_kiemtrung_sau' && realmOrdinal(state) < 300) e.unlocked = false; // cổng tầng sâu: mốc truyện + Kim Đan, không phải tầng công pháp
      if (e.firstClear !== true) e.firstClear = false;
      if (typeof e.deepest !== 'number' || !isFinite(e.deepest) || e.deepest < 0) e.deepest = 0;
      if (typeof e.entriesDay !== 'number' || !isFinite(e.entriesDay) || e.entriesDay < 0) e.entriesDay = 0;
      if (typeof e.entriesUsed !== 'number' || !isFinite(e.entriesUsed) || e.entriesUsed < 0) e.entriesUsed = 0;
      if (typeof e.totalClears !== 'number' || !isFinite(e.totalClears) || e.totalClears < 0) e.totalClears = 0;
      if (e.entered !== true) e.entered = false;
    }
    return sr;
  }
  function secretRealmUnlocked(state, realmId) {
    if (!SECRET_REALM_DEFS[realmId]) return false;
    return ensureSecretRealms(state).realms[realmId].unlocked === true;
  }
  /* Kho lượt chung: tối đa BC_POOL_MAX lượt/ngày game trên tất cả bí
     cảnh (hằng đặt tên để Sổ Chỉ Dẫn và mọi lớp hiển thị đọc cùng một số
     với bcPoolLeft — trước đây số 2 chép tay ngay trong hàm). */
  var BC_POOL_MAX = 2;
  /* Lượt còn lại trong kho chung ngày hôm nay (lượt lần đầu không tính,
     nên kho chỉ vơi khi đã có lượt lặp trong ngày). */
  function bcPoolLeft(state) {
    var sr = ensureSecretRealms(state);
    if (sr.pool.day !== state.dayCount) return BC_POOL_MAX;
    return Math.max(0, BC_POOL_MAX - sr.pool.used);
  }
  /* Ghi một lượt vào: kiểm khóa mở, trừ kho (trừ lượt lần đầu tiên của
     từng bí cảnh). Gọi NGAY khi người chơi vào bí cảnh — thoát ngay
     vẫn tính đã dùng lượt. */
  function bcConsumeEntry(state, realmId) {
    if (!SECRET_REALM_DEFS[realmId]) return { ok: false, reason: 'unknown_realm', poolLeft: bcPoolLeft(state) };
    var sr = ensureSecretRealms(state);
    var e = sr.realms[realmId];
    if (!e.unlocked) return { ok: false, reason: 'locked', poolLeft: bcPoolLeft(state) };
    /* Cổng lượt LẶP theo mốc truyện (đợt 2): bí cảnh có repeatQuest thì
       lượt sau lần thông quan đầu tiên (firstClear đã có) chỉ mở khi đã
       đạt mốc ấy — tầng sâu Kiếm Trủng lặp mở từ q17_done (thiết kế
       chương 17 mục 5). Lượt đầu (chưa firstClear) giữ nguyên. */
    var bcDef = SECRET_REALM_DEFS[realmId];
    if (bcDef.repeatQuest && e.firstClear && !questReached(state, bcDef.repeatQuest)) return { ok: false, reason: 'repeat_locked', poolLeft: bcPoolLeft(state) };
    if (sr.pool.day !== state.dayCount) { sr.pool.day = state.dayCount; sr.pool.used = 0; }
    var first = !e.entered;
    if (!first && sr.pool.used >= 2) return { ok: false, reason: 'pool_empty', poolLeft: 0 };
    e.entered = true;
    e.entriesDay = state.dayCount;
    e.entriesUsed += 1;
    if (!first) sr.pool.used += 1;
    return { ok: true, first: first, poolLeft: Math.max(0, 2 - sr.pool.used) };
  }
  /* Ghi một lượt qua ải: firstClear chống nhận trùng thưởng lần đầu
     (thưởng lần đầu nằm ngoài hồ trần — làn game.js kiểm cờ này trước
     khi phát, không phát qua grantReward). */
  function bcRecordClear(state, realmId) {
    if (!SECRET_REALM_DEFS[realmId]) return { ok: false, reason: 'unknown_realm' };
    var e = ensureSecretRealms(state).realms[realmId];
    var wasFirst = !e.firstClear;
    e.firstClear = true;
    e.totalClears += 1;
    if (e.deepest < 1) e.deepest = 1;
    return { ok: true, firstClear: wasFirst, totalClears: e.totalClears };
  }
  /* Thứ tự chín mảnh sắc cửa phế thước (lấy từ SCENE_MEASURE chương 3:
     thước leo đỏ → cam → vàng → lục → lam → chàm → tím → đen rồi vượt
     cửu phẩm thành Vô Sắc). Làn kiểm thử đối chiếu tĩnh hằng số này. */
  /* Điều kiện mở THẬT của Tâm Trận: đã mở khóa theo mốc truyện
     (q24_done) VÀ đã thông quan lần đầu tầng ngoài. Cổng vào ở làn
     game.js phải dùng hàm này cho tầng sâu (secretRealmUnlocked một
     mình là chưa đủ). */
  function bcTranTamSauOpen(state) {
    if (!secretRealmUnlocked(state, 'bc_tran_tam_sau')) return false;
    var sr = ensureSecretRealms(state);
    return !!(sr.realms.bc_tran_tam && sr.realms.bc_tran_tam.firstClear);
  }

  /* ================= LỚP TỔ ĐỘI + BOT GHÉP TỔ (đợt boss tổ đội) =================
     state.party là DỮ KIỆN THUẦN trong save — điểm nối online duy nhất
     của hệ tổ đội (docs/party-boss-dungeon-design.md mục 2.1). Ba
     nguồn lấp vị trí theo thứ tự: 'online' (người chơi thật — khi nền
     online mở, thành viên người thật ghi vào ĐÚNG danh sách này; chưa
     xây ở bản này), 'bot' (bot AI ghép tổ của bản offline), 'npc'
     (NPC truyện — CHỈ cho cảnh hộ tống kịch bản, KHÔNG lấp tổ boss).
     Người chơi là đội trưởng: thành viên ngầm định, không ghi record
     riêng trong save; partyMembers() luôn trả người chơi đầu tiên.
     Bot tồn tại trong state.party.bots cho tới khi người chơi giải
     tán tại bia tập kết hoặc rời bí cảnh ra bản đồ ngoài
     (partyClearBots). Sinh bot TẤT ĐỊNH theo hạt giống (ngày game x
     7919 + seq của hệ cày + số bot đã có) qua mulberry32 (grindRng) —
     cùng điều kiện thì cùng tổ, kiểm chứng được, nạp lại không quay
     ra tổ khác. */
  var PARTY_MAX = 3;
  var PARTY_ROLE_LABEL = { dps: 'Sát thương', tank: 'Chịu đòn', support: 'Hỗ trợ' };
  var PARTY_BOT_HO = ['Trần', 'Lý', 'Vương', 'Lưu', 'Dương', 'Hoàng', 'Triệu', 'Ngô', 'Chu', 'Từ', 'Tôn', 'Hồ', 'Lâm', 'Quách'];
  var PARTY_BOT_TEN = ['Minh Kiếm', 'Thanh Phong', 'Ngọc Lâu', 'Tử Hiên', 'Văn Đức', 'Hạo Nhiên', 'Tuyết Nhi', 'Linh San', 'Trường Không', 'Huyền Vũ', 'Phi Vân', 'Đông Hải', 'Tịnh Tâm', 'Quang Minh', 'Yến Thanh', 'Bạch Thạch'];
  var PARTY_BOT_SECTS = ['Thanh Vân Tông', 'Thiên Cơ Các', 'Lạc Hà Phái', 'Bích Thủy Môn', 'Phong Lôi Các'];
  /* Công thức chỉ số bot theo dải người chơi (thiết kế mục 2.2):
     máu theo bội số máu tối đa của người chơi, lực mỗi đòn theo bội
     số swordPower, nhịp đòn theo vai; support thêm hồi máu cho đồng
     đội thấp máu nhất (healPct % máu tối đa của mục tiêu mỗi
     healCdMs). Hình đại diện theo vai dùng sheet sẵn có. */
  var PARTY_ROLE_DEFS = {
    dps: { hpMul: 0.9, atkMul: 0.75, atkIntervalMs: 1100, sprite: 'player_nam' },
    tank: { hpMul: 1.7, atkMul: 0.45, atkIntervalMs: 1300, sprite: 'villager_m' },
    support: { hpMul: 1.0, atkMul: 0.5, atkIntervalMs: 1200, sprite: 'player_nu', healPct: 6, healCdMs: 6000 }
  };
  function defaultParty() { return { bots: [] }; }
  function ensureParty(state) {
    if (!state || typeof state !== 'object') return defaultParty();
    if (!state.party || typeof state.party !== 'object') state.party = defaultParty();
    if (!Array.isArray(state.party.bots)) state.party.bots = [];
    state.party.bots = state.party.bots.filter(function (b) { return !!b && typeof b === 'object'; });
    return state.party;
  }
  /* Danh sách thành viên HIỆU LỰC: người chơi (đội trưởng) + bot ghép
     tổ. Lớp 'online': khi nền online mở, thành viên người thật
     (source: 'online') sẽ được nối vào đây sau người chơi và trước
     bot — partySize/partyGateCheck đọc qua hàm này nên không phải
     sửa khi lớp online tới. */
  function partyMembers(state) {
    var party = ensureParty(state);
    var out = [{ source: 'player', id: 'player', name: (state && state.name) || 'Giang Phàm', role: 'leader' }];
    party.bots.forEach(function (b) { out.push(b); });
    return out;
  }
  function partySize(state) { return partyMembers(state).length; }
  function partyPlayerMaxHp(state) {
    if (state && typeof state.maxHp === 'number' && state.maxHp > 0) return state.maxHp;
    if (state && typeof state.hpMax === 'number' && state.hpMax > 0) return state.hpMax;
    return 100;
  }
  /* Ghép tổ bằng AI: lấp các vị trí trống tới PARTY_MAX bằng bot sinh
     tự động. Vai trò theo partyRoles của bí cảnh đích (mặc định
     ['dps','tank'] khi bí cảnh không khai). Gọi lại khi tổ đã đủ thì
     không sinh thêm (idempotent). */
  function partyMatchmake(state, realmId) {
    if (!state || typeof state !== 'object') return { ok: false, reason: 'invalid_state', added: [], size: 0 };
    var party = ensureParty(state);
    var def = realmId ? SECRET_REALM_DEFS[realmId] : null;
    var roles = (def && Array.isArray(def.partyRoles) && def.partyRoles.length) ? def.partyRoles : ['dps', 'tank'];
    var existing = party.bots.length;
    var need = PARTY_MAX - 1 - existing;
    if (need <= 0) return { ok: true, added: [], size: partySize(state) };
    var g = ensureGrind(state);
    var seed = (typeof state.dayCount === 'number' ? state.dayCount : 0) * 7919 + g.seq + existing;
    var rng = grindRng(seed);
    var baseHp = partyPlayerMaxHp(state);
    var power = swordPower(state);
    var usedNames = {};
    party.bots.forEach(function (b) { if (b && b.name) usedNames[b.name] = true; });
    var added = [];
    for (var i = 0; i < need; i++) {
      var role = roles[(existing + i) % roles.length];
      var rd = PARTY_ROLE_DEFS[role] || PARTY_ROLE_DEFS.dps;
      var name = null;
      for (var t = 0; t < 24 && !name; t++) {
        var cand = PARTY_BOT_HO[Math.floor(rng() * PARTY_BOT_HO.length)] + ' ' + PARTY_BOT_TEN[Math.floor(rng() * PARTY_BOT_TEN.length)];
        if (!usedNames[cand]) name = cand;
      }
      if (!name) name = PARTY_BOT_HO[0] + ' ' + PARTY_BOT_TEN[(existing + i) % PARTY_BOT_TEN.length];
      usedNames[name] = true;
      var hp = Math.max(1, Math.round(rd.hpMul * baseHp));
      var bot = {
        source: 'bot',
        id: 'bot_' + seed + '_' + (existing + i),
        name: name,
        sect: PARTY_BOT_SECTS[Math.floor(rng() * PARTY_BOT_SECTS.length)],
        role: role,
        roleLabel: PARTY_ROLE_LABEL[role] || role,
        sprite: rd.sprite,
        hp: hp, hpMax: hp, maxHp: hp,
        atk: Math.max(1, Math.round(rd.atkMul * power)),
        atkIntervalMs: rd.atkIntervalMs,
        atkInterval: rd.atkIntervalMs / 1000
      };
      if (typeof rd.healPct === 'number') bot.healPct = rd.healPct;
      if (typeof rd.healCdMs === 'number') bot.healCdMs = rd.healCdMs;
      party.bots.push(bot);
      added.push(bot);
    }
    return { ok: true, added: added, size: partySize(state) };
  }
  /* Giải tán bot ghép tổ (tại bia tập kết hoặc khi rời bí cảnh ra bản
     đồ ngoài): tổ trở về chỉ còn người chơi. */
  function partyClearBots(state) {
    var party = ensureParty(state);
    party.bots = [];
    return { ok: true, size: partySize(state) };
  }
  /* Cổng tổ đội: bí cảnh khai partyMin thì tổ (gồm người chơi) phải
     đủ partyMin thành viên mới vào được. Bí cảnh không khai partyMin
     thì luôn qua. Làn game.js kiểm cổng này TRƯỚC bcConsumeEntry để
     chặn solo không tốn lượt kho chung. */
  function partyGateCheck(state, realmId) {
    var def = SECRET_REALM_DEFS[realmId];
    if (!def) return { ok: false, reason: 'unknown_realm', have: partySize(state), need: 0 };
    if (!def.partyMin) return { ok: true, size: partySize(state) };
    var have = partySize(state);
    if (have >= def.partyMin) return { ok: true, size: have, need: def.partyMin };
    return { ok: false, reason: 'party_required', have: have, need: def.partyMin };
  }
  /* Phong Ấn Hai Điểm (cơ chế boss tổ đội): tiến độ giữ chỉ chạy khi
     CẢ HAI điểm trận đều có người giữ ĐỒNG THỜI và hai người giữ là
     hai nhân vật KHÁC NHAU. holders = { padA: <id người giữ điểm tây
     hoặc null>, padB: <id người giữ điểm đông hoặc null> } (cũng nhận
     dạng mảng [idA, idB]). Hàm thuần — một người không bao giờ tự giữ
     được cả hai điểm. */
  function partyHoldSatisfied(holders) {
    if (!holders) return false;
    var a = Array.isArray(holders) ? holders[0] : holders.padA;
    var b = Array.isArray(holders) ? holders[1] : holders.padB;
    return a != null && b != null && a !== b;
  }

  var PHE_THUOC_COLOR_ORDER = ['Đỏ', 'Cam', 'Vàng', 'Lục', 'Lam', 'Chàm', 'Tím', 'Đen', 'Vô Sắc'];

  /* ================= NHIỆM VỤ PHỤ QUANH TRÚC CƠ (Mục H, đợt vá 2026-11-02) =================
     Chuỗi phụ LÀ ĐIỂM KHỞI HÀNH ONLINE: mọi nhiệm vụ là DỮ KIỆN THUẦN
     trong save (claimed/selected/socialMet) + tiến độ SUY TỪ trạng thái
     thật đã có (bí cảnh firstClear, túi, ví, lượt cày đã trả) — không
     khóa giả định chỉ-chơi-đơn nào, về sau nhiều người chơi vẫn đọc cùng
     dữ kiện này. Hai phân đoạn:
       - 'pre' (trước đột phá): mở tại q8_chuan_bi cho người cuối Luyện
         Khí — H1 chạy HAI bí cảnh dải Luyện Khí đã live (lượt đầu mỗi bí
         cảnh KHÔNG tính vào kho chung nên xong trong đúng 2 lượt vào),
         H2 kiểm đủ NGUYÊN LIỆU THẬT của công thức Trúc Cơ Đan (chỉ kiểm,
         KHÔNG tiêu — nguyên liệu vẫn để trưởng lão luyện đan). Tài
         khoản đã qua Trúc Cơ mà chưa nhận thưởng phân đoạn này: trạng
         thái 'skipped' (đã qua mốc — bỏ qua), không kẹt, không thưởng.
       - 'post' (sau đột phá): mở tại q8_done (hồi tố qua questReached
         cho mọi save đã qua mốc), mỗi nhiệm vụ trỏ tới MỘT hệ lặp đã có.
     Thưởng MỘT LẦN qua grantReward (trần mềm ngày như mọi khoản cày),
     hồ sơ nội tuyến nhỏ — chủ yếu mở đường/chỉ hướng, không tạo nguồn
     tu vi/Linh Thạch ngoài khung. KHÔNG bịa nguồn rơi: bảng đối chiếu
     nguồn nằm trong báo cáo đợt (mucH) và trong desc từng nhiệm vụ. */
  var SIDE_QUEST_DEFS = [
    /* Nhiệm vụ PHỤ HƯỚNG DẪN ĐỒ ĂN (lệnh của Bui 06:15 ngày 2026-11-04):
       mở ngay sau đột phá Luyện Khí tầng 1 (mốc q_dummy) và TRƯỚC giai
       đoạn săn đầu tiên quanh q2_cong_thanh. (Đợt sửa lỗi 2026-11-05:
       bước MUA không còn phụ thuộc duy nhất vào ví Linh Thạch — hai món
       rẻ mua được bằng BẠC phàm tục qua buyFoodSilver kể cả khi ví khóa
       hoặc đã tiêu hết lộ phí; bước ĂN có đường ăn thử tasteFood khi bị
       chặn chỉ vì đầy sức.) Người giao: Hứa U Nhàn — nàng dặn dò trong
       desc, nhận/trả qua bảng nhiệm vụ phụ như mọi nhiệm vụ Mục H.
       Bốn bước đi trọn vòng đời đồ ăn bằng đúng hệ thống của đợt đồ
       ăn: MUA ở quán trọ trấn -> HÁI nấm ở bãi ven đường mòn -> NẤU ở
       bếp trạm nghỉ (hoặc bếp quán trọ) -> ĂN thử. Không một cổng
       truyện chính nào đọc các cờ food* — bỏ qua nhiệm vụ này vẫn đi
       trọn cốt truyện (khẳng định §66). */
    { id: 'sq_food_tutorial', phase: 'pre', unlockQuest: 'q_dummy',
      name: 'Bữa Ăn Đường Xa',
      desc: 'Hứa U Nhàn dặn: lên đường xa phải tự lo được bữa ăn hồi sức. Món đầu tiên hãy mua CƠM NẮM LÁ SEN — hồi 30 máu + 10 Tĩnh Âm: mua ở Vọng Tiên Tửu Điếm tại Hứa Gia Trấn hoặc sạp chợ Cô Châu Thành; còn là phàm nhân thì trả 5 lượng BẠC, đã đột phá tu tiên thì trả 3 Linh Thạch (Bánh Hấp Nhân Thịt hồi 45 máu + 15 Tĩnh Âm: 8 lượng bạc hoặc 5 Linh Thạch). (1) MUA một món ăn ở một trong hai nơi ấy. (2) HÁI một cây Nấm Rừng ở bãi nấm ven đường mòn xuyên rừng, phía tây trạm nghỉ (bãi nấm mọc lại mỗi ngày; bãi sau trấn cũng có). (3) NẤU một món từ nguyên liệu ở bếp trạm nghỉ giữa đường hoặc bếp quán trọ trấn — Canh Nấm Thảo Dược hồi 35 máu + 25 Tĩnh Âm, Thịt Thú Nướng Que hồi 60 máu + 10 Tĩnh Âm. (4) ĂN thử một món bằng nút Đồ Ăn (phím R) và xem máu cùng Tĩnh Âm hồi lại theo số ghi trên món; đang đầy cả máu lẫn Tĩnh Âm vẫn ăn thử được để xong bước này. Chọn "Chọn dẫn đường" để mũi tên chỉ tới từng bước. Sau này cứ theo đúng những nơi ấy mà tự làm lại: quán trọ và chợ bán sẵn, bãi nấm và thú rừng cho nguyên liệu, hai bếp để nấu.',
      system: 'đồ ăn (mua/nấu/ăn)', reward: { items: { com_nam: 2, banh_hap: 1 } },
      guide: { map: 'tran', x: 47, y: 22 } },
    { id: 'sq_pre_bicanh', phase: 'pre', unlockQuest: 'q8_chuan_bi',
      name: 'Luyện tay trong bí cảnh Luyện Khí',
      desc: 'Qua ải lần đầu Thủy Liêm Động (cổng ở đường mòn) và Tàn Tích Dưới Tháp tầng ngoài (cửa trong sảnh Kiểm Trắc Tháp). Boss Thủy Liêm rơi chắc Yêu Đan Cấp 1 ở thưởng lần đầu; mỗi đợt quái và boss đều cho tu vi qua hệ cày — đường cày cấp chính trước Trúc Cơ.',
      system: 'bí cảnh bc_thuyliem + bc_tapha', reward: { tuviPct: 5 },
      guide: { map: 'duong_mon', x: 20, y: 36 } },
    { id: 'sq_pre_nguyen_lieu', phase: 'pre', unlockQuest: 'q8_chuan_bi',
      name: 'Đủ nguyên liệu Trúc Cơ Đan',
      desc: 'Có đủ trong túi và ví: Linh Chi Sau Núi ×1 (cụm sau núi tông — toán phục kích mang theo Yêu Đan), Yêu Đan Cấp 1 ×1 (phục kích sau núi hoặc thưởng lần đầu Thủy Liêm Động), Thanh Tâm Thảo ×3 (vườn dược sau núi cạnh cụm Linh Chi), 30 Linh Thạch (việc tông, phiếu săn/thu thập, thưởng bí cảnh). Nhiệm vụ chỉ kiểm đủ — không tiêu nguyên liệu.',
      system: 'công thức Trúc Cơ Đan chương 8', reward: { lt: 2, merit: 3 },
      guide: { map: 'thanh_van_tong', x: 60, y: 27 } },
    { id: 'sq_post_truy_na', phase: 'post', unlockQuest: 'q8_done',
      name: 'Phiếu truy nã đầu tiên sau Trúc Cơ',
      desc: 'Nhận một phiếu ở Bảng Treo Thưởng Săn Quái (qua chủ sạp chợ Cô Châu hoặc Quản Sự Tạp Dịch), săn đủ số rồi quay lại bảng trả thưởng một lần.',
      system: 'bảng truy nã (board_hunt_daily)', reward: { tuviPct: 5 },
      guide: { map: 'co_chau', x: 75, y: 35 } },
    { id: 'sq_post_bicanh_tc', phase: 'post', unlockQuest: 'q8_done',
      name: 'Bí cảnh dải Trúc Cơ',
      desc: 'Qua ải lần đầu một bí cảnh dải Trúc Cơ: Tàn Tích Tầng Sâu (cửa Tàn Tích trong sảnh tháp) hoặc Kiếm Trủng Sau Núi (cụm kiếm cắm sau núi tông, cạnh cụm Linh Chi).',
      system: 'bí cảnh bc_tapsau / bc_kiemtrung', reward: { tuviPct: 5, merit: 3 },
      guide: { map: 'thap_noi', x: 3, y: 28 } },
    { id: 'sq_post_thu_thap', phase: 'post', unlockQuest: 'q8_done',
      name: 'Nộp một lượt thu thập',
      desc: 'Nhận một phiếu ở Danh Sách Thu Thập (qua Dược Sư Hồi Xuân hoặc Quản Sự Tạp Dịch), hái đủ nguyên liệu ở các điểm hái rồi nộp trả một lần.',
      system: 'thu thập/nộp vật (board_gather_daily)', reward: { lt: 2, tuviPct: 5 },
      guide: { map: 'co_chau', x: 45, y: 52 } },
    { id: 'sq_post_dong_mon', phase: 'post', unlockQuest: 'q8_done',
      name: 'Đồng môn ở quảng trường',
      desc: 'Tới quảng trường Thanh Vân Tông chào hỏi một đồng môn (Hoa Hướng Thần hoặc đệ tử ở quảng trường), rồi nhận và trả một Việc Tông Môn luân phiên ở Quản Sự Tạp Dịch. — nhịp gặp gỡ xã hội ở điểm tụ họp tông môn, đúng hình dáng việc chung khi mở online.',
      system: 'việc tông môn (board_sect_daily) + gặp gỡ quảng trường tông', reward: { lt: 3, merit: 5 },
      guide: { map: 'thanh_van_tong', x: 62, y: 56 } },
    { id: 'sq_post_tran_tam', phase: 'post', unlockQuest: 'q24_done',
      name: 'Di Tích Trận Tâm',
      desc: 'Cổng cụm kiếm phong ấn ở sau núi Thanh Vân Tông dẫn xuống Di Tích Trận Tâm: dọn sạch tầng ngoài trước (boss Hộ Tâm Thạch Tướng), rồi xuống tâm trận — nơi Trận Tâm Ma Ảnh chỉ mở cho TỔ ĐỘI. Tới bia tập kết ngay cạnh cổng ghép bot AI cho đủ tổ đội rồi mới xuống tâm trận được.',
      system: 'bí cảnh bc_tran_tam + bc_tran_tam_sau (boss tổ đội)', reward: { tuviPct: 5, merit: 5 },
      guide: { map: 'thanh_van_tong', x: 99, y: 17 } }
  ];
  function sideQuestDef(id) {
    for (var i = 0; i < SIDE_QUEST_DEFS.length; i++) if (SIDE_QUEST_DEFS[i].id === id) return SIDE_QUEST_DEFS[i];
    return null;
  }
  function defaultSideQuests() { return { claimed: {}, selected: null, socialMet: false }; }
  function ensureSideQuests(state) {
    if (!state || typeof state !== 'object') return defaultSideQuests();
    if (!state.sideQuests || typeof state.sideQuests !== 'object') state.sideQuests = defaultSideQuests();
    var sq = state.sideQuests;
    if (!sq.claimed || typeof sq.claimed !== 'object') sq.claimed = {};
    if (sq.selected != null && !sideQuestDef(sq.selected)) sq.selected = null;
    if (typeof sq.socialMet !== 'boolean') sq.socialMet = false;
    return sq;
  }
  function sideGrindClaimedCount(state, kind) {
    var g = ensureGrind(state), n = 0;
    for (var id in g.instances) {
      var ins = g.instances[id];
      if (ins && ins.kind === kind && ins.status === 'claimed') n++;
    }
    return n;
  }
  function sideRealmFirstClear(state, realmId) {
    var sr = ensureSecretRealms(state);
    return !!(sr.realms[realmId] && sr.realms[realmId].firstClear);
  }
  /* Tiến độ thuần từ trạng thái thật: { cur, target, text, done } */
  function sideQuestProgress(state, def) {
    if (!def) return { cur: 0, target: 1, text: '', done: false };
    if (def.id === 'sq_food_tutorial') {
      var ff = state.flags || {};
      var f1 = ff.foodBought ? 1 : 0, f2 = ff.foodGathered ? 1 : 0, f3 = ff.foodCooked ? 1 : 0, f4 = ff.foodEaten ? 1 : 0;
      var fcur = f1 + f2 + f3 + f4;
      return { cur: fcur, target: 4, text: 'Mua Cơm Nắm (30 máu + 10 Tĩnh Âm; 5 lượng bạc / 3 Linh Thạch) ' + f1 + '/1 · Hái nấm ' + f2 + '/1 · Nấu món ' + f3 + '/1 · Ăn thử ' + f4 + '/1', done: fcur >= 4 };
    }
    if (def.id === 'sq_pre_bicanh') {
      var c1 = (sideRealmFirstClear(state, 'bc_thuyliem') ? 1 : 0) + (sideRealmFirstClear(state, 'bc_tapha') ? 1 : 0);
      return { cur: c1, target: 2, text: 'Đã qua ải lần đầu: ' + c1 + '/2 bí cảnh', done: c1 >= 2 };
    }
    if (def.id === 'sq_pre_nguyen_lieu') {
      var parts = [
        { label: 'Linh Chi ' + Math.min(1, bagCount(state, 'linh_chi')) + '/1', ok: bagCount(state, 'linh_chi') >= 1 },
        { label: 'Yêu Đan Cấp 1 ' + Math.min(1, bagCount(state, 'yeu_dan_1')) + '/1', ok: bagCount(state, 'yeu_dan_1') >= 1 },
        { label: 'Thanh Tâm Thảo ' + Math.min(3, bagCount(state, 'thanh_tam_thao')) + '/3', ok: bagCount(state, 'thanh_tam_thao') >= 3 },
        { label: 'Linh Thạch ' + Math.min(30, linhBalance(state)) + '/30', ok: linhBalance(state) >= 30 }
      ];
      var doneN = parts.filter(function (p) { return p.ok; }).length;
      return { cur: doneN, target: 4, text: parts.map(function (p) { return p.label; }).join(' · '), done: doneN >= 4 };
    }
    if (def.id === 'sq_post_truy_na') {
      var nh = Math.min(1, sideGrindClaimedCount(state, 'hunt'));
      return { cur: nh, target: 1, text: 'Đã trả phiếu săn: ' + nh + '/1', done: nh >= 1 };
    }
    if (def.id === 'sq_post_bicanh_tc') {
      var nr = (sideRealmFirstClear(state, 'bc_tapsau') || sideRealmFirstClear(state, 'bc_kiemtrung')) ? 1 : 0;
      return { cur: nr, target: 1, text: 'Đã qua ải Trúc Cơ: ' + nr + '/1', done: nr >= 1 };
    }
    if (def.id === 'sq_post_thu_thap') {
      var ng = Math.min(1, sideGrindClaimedCount(state, 'gather'));
      return { cur: ng, target: 1, text: 'Đã nộp lượt thu thập: ' + ng + '/1', done: ng >= 1 };
    }
    if (def.id === 'sq_post_dong_mon') {
      var sq = ensureSideQuests(state);
      var ns = Math.min(1, sideGrindClaimedCount(state, 'sect'));
      var steps = (sq.socialMet ? 1 : 0) + ns;
      return { cur: steps, target: 2, text: 'Gặp đồng môn: ' + (sq.socialMet ? 1 : 0) + '/1 · Đã trả việc tông: ' + ns + '/1', done: steps >= 2 };
    }
    if (def.id === 'sq_post_tran_tam') {
      var ntt = sideRealmFirstClear(state, 'bc_tran_tam_sau') ? 1 : 0;
      return { cur: ntt, target: 1, text: 'Đã qua ải tâm trận (boss tổ đội): ' + ntt + '/1', done: ntt >= 1 };
    }
    return { cur: 0, target: 1, text: '', done: false };
  }
  /* Trạng thái: locked | available | ready | claimed | skipped */
  function sideQuestStatus(state, def) {
    if (!def || !state) return 'locked';
    var sq = ensureSideQuests(state);
    if (sq.claimed[def.id] != null) return 'claimed';
    if (!questReached(state, def.unlockQuest)) return 'locked';
    if (def.phase === 'pre' && realmOrdinal(state) >= 200) return 'skipped';
    return sideQuestProgress(state, def).done ? 'ready' : 'available';
  }
  function sideQuestList(state) {
    return SIDE_QUEST_DEFS.map(function (def) {
      return { def: def, status: sideQuestStatus(state, def), progress: sideQuestProgress(state, def) };
    });
  }
  /* Mốc dẫn đường động theo TIẾN ĐỘ (không bịa tọa độ — mọi điểm đều là
     vật/NPC/bản đồ thật đã có): H1 chỉ cổng bí cảnh chưa qua; H2 chỉ
     nguồn của nguyên liệu đang thiếu đầu tiên; H4 chỉ cổng chưa qua;
     H6 chưa gặp đồng môn thì chỉ quảng trường, gặp rồi thì chỉ quản sự. */
  function sideQuestGuideHint(state, def) {
    if (!def) return null;
    if (def.id === 'sq_food_tutorial') {
      var fg = state.flags || {};
      if (!fg.foodBought) return { map: 'tran', x: 47, y: 22 };       // đứng trước cửa Vọng Tiên Tửu Điếm — điểm MUA
      if (!fg.foodGathered) return { map: 'duong_mon', x: 50, y: 16 }; // ô đứng phía nam bãi nấm (bãi ở 50,15) — bước HÁI
      if (!fg.foodCooked) return { map: 'duong_mon', x: 58, y: 20 };   // sân trạm nghỉ — bếp NẤU tại trạm
      if (!fg.foodEaten) return { map: 'duong_mon', x: 58, y: 20 };    // ĂN thử ngay tại trạm nghỉ sau khi nấu
      return { map: 'tran', x: 28, y: 29 };                             // xong bốn bước: về sân Hứa gia chỗ Hứa U Nhàn (người giao)
    }
    if (def.id === 'sq_pre_bicanh') {
      if (!sideRealmFirstClear(state, 'bc_thuyliem')) return { map: 'duong_mon', x: 20, y: 36 };
      if (!sideRealmFirstClear(state, 'bc_tapha')) return { map: 'thap_noi', x: 3, y: 28 };
      return { map: 'thanh_van_tong', x: 60, y: 27 };
    }
    if (def.id === 'sq_pre_nguyen_lieu') {
      if (bagCount(state, 'linh_chi') < 1) return { map: 'thanh_van_tong', x: 100, y: 15 };
      if (bagCount(state, 'yeu_dan_1') < 1) return { map: 'thanh_van_tong', x: 100, y: 15 };
      if (bagCount(state, 'thanh_tam_thao') < 3) return { map: 'thanh_van_tong', x: 104, y: 18 };
      if (linhBalance(state) < 30) return { map: 'thanh_van_tong', x: 97, y: 69 };
      return { map: 'thanh_van_tong', x: 60, y: 27 };
    }
    if (def.id === 'sq_post_bicanh_tc') {
      if (!sideRealmFirstClear(state, 'bc_tapsau') && !sideRealmFirstClear(state, 'bc_kiemtrung')) return { map: 'thap_noi', x: 3, y: 28 };
      return def.guide;
    }
    if (def.id === 'sq_post_tran_tam') {
      if (!sideRealmFirstClear(state, 'bc_tran_tam_sau')) return { map: 'thanh_van_tong', x: 99, y: 17 };
      return def.guide;
    }
    if (def.id === 'sq_post_dong_mon') {
      var sq = ensureSideQuests(state);
      if (!sq.socialMet) return { map: 'thanh_van_tong', x: 62, y: 56 };
      return { map: 'thanh_van_tong', x: 97, y: 69 };
    }
    return def.guide;
  }
  function sideMarkSocial(state) {
    var sq = ensureSideQuests(state);
    if (sq.socialMet) return false;
    sq.socialMet = true;
    return true;
  }
  function claimSideQuest(state, id) {
    var def = sideQuestDef(id);
    if (!def) return { ok: false, reason: 'unknown_side_quest' };
    var st = sideQuestStatus(state, def);
    if (st === 'claimed') return { ok: false, reason: 'duplicate', duplicate: true };
    if (st !== 'ready') return { ok: false, reason: 'not_ready', status: st };
    var spec = { tuviPct: def.reward.tuviPct || 0, lt: def.reward.lt || 0, merit: def.reward.merit || 0, items: def.reward.items || undefined, profileId: 'side:' + id };
    var r = grantReward(state, spec, { claimKey: 'side:' + id, sourceId: 'sideQuest:' + id });
    if (!r.ok) return r;
    var sq = ensureSideQuests(state);
    sq.claimed[id] = state.dayCount;
    if (sq.selected === id) sq.selected = null;
    return { ok: true, granted: r.granted, def: def };
  }
  function selectSideQuest(state, id) {
    var sq = ensureSideQuests(state);
    if (id == null) { sq.selected = null; return { ok: true, selected: null }; }
    var def = sideQuestDef(id);
    if (!def) return { ok: false, reason: 'unknown_side_quest' };
    var st = sideQuestStatus(state, def);
    if (st !== 'available' && st !== 'ready') return { ok: false, reason: 'not_selectable', status: st };
    sq.selected = id;
    return { ok: true, selected: id };
  }


  /* ================= SỔ CHỈ DẪN CHO GAME THỦ (lệnh của Bui 07:25 ngày
     2026-11-05: "Tạo chỉ dẫn cho game thủ") =================
     Nội dung sổ là CHỮ GIAO DIỆN thuần (không lồng tiếng, không nằm
     trong story.js) và được DỰNG TỪ DỮ KIỆN THẬT của các hệ thống:
     công thức Trúc Cơ Đan đọc từ TRUC_CO_FORMULA (cùng các con số mà
     pillMissing của lớp game và tiến độ sq_pre_nguyen_lieu đang kiểm),
     trần tu vi đọc từ REALMS, danh sách bí cảnh đọc từ
     SECRET_REALM_DEFS + QUESTS, món ăn/công thức đọc từ ITEM_DEFS +
     FOOD_RECIPES, tỉ lệ tu vi đọc từ REWARD_PROFILES. Cân bằng đổi ở
     các bảng gốc thì sổ tự đổi theo — tuyệt đối không chép tay con số
     rời rạc ở đây. Hàm thuần trên state, lớp game chỉ lo hiển thị. */
  var TRUC_CO_FORMULA = { linh_chi: 1, yeu_dan_1: 1, thanh_tam_thao: 3, linhThach: 30 };
  var GUIDE_TRUC_CO_UNLOCK_QUEST = 'q7_done';
  function guideTrucCoOpen(state) { return !!state && questReached(state, GUIDE_TRUC_CO_UNLOCK_QUEST); }
  /* Danh sách kiểm sống cho chương Trúc Cơ: bốn thành phần công thức +
     tu vi, đọc thẳng từ túi (bagCount), ví (linhBalance) và cảnh giới
     hiện tại. Mỗi phần: { id, name, cur, need, ok, note? }. */
  function trucCoChecklist(state) {
    if (!state) return null;
    var f = TRUC_CO_FORMULA;
    function itemPart(id) {
      return { id: id, name: ITEM_DEFS[id].name, cur: Math.min(f[id], bagCount(state, id)), need: f[id], ok: bagCount(state, id) >= f[id] };
    }
    var parts = [itemPart('linh_chi'), itemPart('yeu_dan_1'), itemPart('thanh_tam_thao'),
      { id: 'linh_thach', name: 'Linh Thạch', cur: Math.min(f.linhThach, linhBalance(state)), need: f.linhThach, ok: linhBalance(state) >= f.linhThach }];
    var lk = REALMS[1], lastStage = lk.stages.length - 1, tuviNeed = lk.tuviNext;
    var atTop = state.realm === 1 && state.stage >= lastStage;
    var tuviOk = state.realm > 1 || (atTop && (state.tuvi || 0) >= tuviNeed);
    var tuviNote;
    if (state.realm > 1) tuviNote = 'Đã ở ' + realmName(state.realm, state.stage) + ' — mốc này đã qua.';
    else if (atTop) tuviNote = 'Đang ở ' + realmName(1, lastStage) + ': tích tu vi tới đầy trần là đủ.';
    else tuviNote = 'Đang ở ' + realmName(state.realm, state.stage) + ': cần lên ' + realmName(1, lastStage) + ' rồi tích đầy tu vi.';
    parts.push({ id: 'tuvi', name: 'Tu vi đầy trần ' + lk.name + ' ' + lk.stages[lastStage],
      cur: state.realm > 1 ? tuviNeed : (atTop ? Math.min(tuviNeed, Math.floor(state.tuvi || 0)) : 0),
      need: tuviNeed, ok: tuviOk, note: tuviNote });
    return { parts: parts, done: parts.every(function (p) { return p.ok; }), formula: f };
  }
  function guideQuestName(id) { var d = questById(id); return d ? d.name : id; }
  function guideSideStatusLabel(st) {
    return { locked: 'chưa mở', available: 'đang làm', ready: 'sẵn sàng nhận thưởng', claimed: 'đã nhận thưởng', skipped: 'đã qua mốc Trúc Cơ' }[st] || st;
  }
  function guideTrucCoChapter(state) {
    var open = guideTrucCoOpen(state);
    var ch = { id: 'trucco', title: 'Đường tới Trúc Cơ', locked: !open,
      lockText: 'Hoàn thành chương 7 để mở chỉ dẫn Trúc Cơ.', sections: [] };
    if (!open || !state) return ch;
    var f = TRUC_CO_FORMULA, lk = REALMS[1];
    var chiNode = null;
    for (var ni = 0; ni < RESOURCE_NODES.length; ni++) {
      if (RESOURCE_NODES[ni].itemId === 'linh_chi' && RESOURCE_NODES[ni].mapId === 'thanh_van_tong') chiNode = RESOURCE_NODES[ni];
    }
    ch.sections.push({ h: 'Điều kiện tiên quyết', lines: [
      'Hoàn thành chương 7 — nhập Thanh Vân Tông và đứng vững trong tông; chỉ dẫn này mở ngay khi mạch truyện chạm mốc trước nhiệm vụ "' + guideQuestName('q8_chuan_bi') + '".',
      'Tu vi đầy trần ' + lk.name + ' ' + lk.stages[lk.stages.length - 1] + ' (' + lk.tuviNext + ' điểm). Thiếu tu vi thì cứ theo hai nhiệm vụ phụ chỉ đường ở dưới mà cày bí cảnh và săn quái.'
    ] });
    ch.sections.push({ h: 'Công thức Trúc Cơ Đan', lines: [
      'Trưởng lão tông luyện Trúc Cơ Đan theo đúng công thức: ' + ITEM_DEFS.linh_chi.name + ' ×' + f.linh_chi + ', ' + ITEM_DEFS.yeu_dan_1.name + ' ×' + f.yeu_dan_1 + ', ' + ITEM_DEFS.thanh_tam_thao.name + ' ×' + f.thanh_tam_thao + ' và ' + f.linhThach + ' Linh Thạch. Danh sách kiểm dưới đây đọc thẳng từ túi, ví và tu vi hiện tại của ngươi:'
    ], checklist: trucCoChecklist(state).parts });
    ch.sections.push({ h: 'Trình tự đột phá', lines: [
      '1. "' + guideQuestName('q8_chuan_bi') + '" — tới Thanh Vân Đại Điện gặp trưởng lão tông, nhận công thức Trúc Cơ Đan.',
      '2. Gom đủ bốn thành phần trong danh sách kiểm rồi quay lại gặp trưởng lão: trưởng lão trừ đúng nguyên liệu và ' + f.linhThach + ' Linh Thạch, luyện thành Trúc Cơ Đan trao cho ngươi — kèm một viên Hộ Thể Đan duy nhất để chắn một đạo lôi giữa kiếp.',
      '3. "' + guideQuestName('q8_ho_phap') + '" — lên Đài Trúc Cơ ở phía bắc tông bắt đầu vận công. Trên đài có ba đạo lôi giáng xuống, đạo sau nặng hơn đạo trước; trong lúc đột phá, tuyệt đối không được cất tiếng.',
      '4. "' + guideQuestName('q8_truc_co') + '" — nuốt Trúc Cơ Đan và đột phá ngay tại Đài Trúc Cơ. Đột phá hụt KHÔNG mất đan: viên đan được hoàn lại nguyên vẹn, và đan có thể luyện lại theo đúng công thức cũ hoặc bằng 60 điểm cống hiến tông môn.',
      '5. "' + guideQuestName('q8_thu_tieng') + '" — đột phá xong, về Thanh Vân Đại Điện gặp trưởng lão tông. Từ đây ngươi đứng ở ' + realmName(2, 0) + '.'
    ] });
    ch.sections.push({ h: 'Nguồn từng nguyên liệu', lines: [
      ITEM_DEFS.linh_chi.name + ': cụm Linh Chi ở sau núi phía đông bắc Thanh Vân Tông — hái một cây mang về' + (chiNode ? ' (điểm hái làm mới sau ' + chiNode.respawnDays + ' ngày game)' : '') + '.',
      ITEM_DEFS.yeu_dan_1.name + ': toán phục kích của Huyết Bạc Cung chờ sẵn ở sau núi trong chuyến hái Linh Chi — hạ chúng là viên đan rơi vào túi ngươi. Cách khác: qua ải lần đầu ' + SECRET_REALM_DEFS.bc_thuyliem.name + ', phần thưởng lần đầu có sẵn một viên ' + ITEM_DEFS.yeu_dan_1.name + '.',
      ITEM_DEFS.thanh_tam_thao.name + ': vườn dược sau núi nằm ngay cạnh cụm Linh Chi, ở phía đông bãi hái — hái đủ ba cây. Các điểm thu thập trên đường mòn và trong thung lũng Hồi Phong cũng có loại thảo này.',
      'Linh Thạch: làm việc tông môn (gặp quản sự tạp dịch ở khu đông nam tông), nhận phiếu treo thưởng săn quái và phiếu thu thập ở các bảng nhiệm vụ, thưởng qua ải bí cảnh và boss dã ngoại.'
    ] });
    var sqLines = ['Mở khung nhiệm vụ bên trái, trong mục nhiệm vụ phụ chọn một nhiệm vụ rồi bấm "Chọn dẫn đường" — mũi tên trên màn hình và dấu "!" tại mục tiêu sẽ bám theo bước hiện tại của nhiệm vụ đó.'];
    [['sq_pre_bicanh', 'Đường cày tu vi chính trước Trúc Cơ: qua ải lần đầu hai bí cảnh dải Luyện Khí.'],
     ['sq_pre_nguyen_lieu', 'Danh sách kiểm bốn thành phần của công thức — chỉ kiểm đủ, không tiêu nguyên liệu.']].forEach(function (pair) {
      var def = sideQuestDef(pair[0]);
      if (def) sqLines.push('"' + def.name + '" — ' + pair[1] + ' (Trạng thái của ngươi: ' + guideSideStatusLabel(sideQuestStatus(state, def)) + '.)');
    });
    ch.sections.push({ h: 'Hai nhiệm vụ phụ chỉ đường', lines: sqLines });
    var postNames = [];
    ['sq_post_truy_na', 'sq_post_bicanh_tc', 'sq_post_thu_thap', 'sq_post_dong_mon'].forEach(function (id) {
      var d = sideQuestDef(id); if (d) postNames.push('"' + d.name + '"');
    });
    ch.sections.push({ h: 'Sau khi Trúc Cơ', lines: [
      'Qua mốc ' + realmName(2, 0) + ', phân đoạn nhiệm vụ phụ hậu Trúc Cơ mở ra trong cùng mục nhiệm vụ phụ: ' + postNames.join(', ') + ' — điểm khởi hành của giai đoạn cày cấp dài lâu: phiếu săn, bí cảnh dải Trúc Cơ, thu thập và việc đồng môn.'
    ] });
    return ch;
  }
  function guideFoodChapter(state) {
    var buyLines = ['Vọng Tiên Tửu Điếm ở Hứa Gia Trấn và sạp chợ ở Cô Châu Thành đều bán đồ ăn mang theo. Mua bằng Linh Thạch — ví Linh Thạch chỉ mở khi đã bắt đầu tu tiên (đột phá ' + realmName(1, 0) + '); lần đầu ghé quán trọ, chủ quán còn tặng sẵn một phần ăn cho người mới lên đường.'];
    foodIds().forEach(function (id) {
      var d = foodDef(id);
      if (d && typeof d.priceLt === 'number') buyLines.push(d.name + ' — hồi ' + d.hp + ' máu + ' + d.ta + ' Tĩnh Âm — giá ' + d.priceLt + ' Linh Thạch.');
    });
    var cookLines = ['Hai bếp dùng được: bếp của quán trọ ở trấn và bếp ở trạm nghỉ giữa đường mòn. Có nguyên liệu là nấu được ngay tại bếp:'];
    for (var rid in FOOD_RECIPES) {
      var rec = FOOD_RECIPES[rid], rd = foodDef(rid);
      if (!rd) continue;
      var needs = [];
      for (var ing in rec.needs) needs.push(ITEM_DEFS[ing].name + ' ×' + rec.needs[ing]);
      cookLines.push(rd.name + ' — hồi ' + rd.hp + ' máu + ' + rd.ta + ' Tĩnh Âm — cần ' + needs.join(' + ') + (rec.needLinh ? ' (món dải Luyện Khí: phải đã nhập đạo mới nấu được)' : '') + '.');
    }
    return { id: 'food', title: 'Ăn uống hồi sức', locked: false, lockText: '', sections: [
      { h: 'Mua sẵn', lines: buyLines },
      { h: 'Tự kiếm nguyên liệu', lines: [
        'Nấm Rừng: hai bãi nấm — một bãi sau trấn, một bãi ven đường mòn phía tây trạm nghỉ. Mỗi bãi cho một cây mỗi ngày game, sang ngày game mới lại mọc.',
        'Thịt Thú Rừng: hạ quái thú dã ngoại (sói, lợn rừng...) thì có tỉ lệ rơi thịt mang về nấu.'
      ] },
      { h: 'Nấu tại bếp', lines: cookLines },
      { h: 'Ăn và nhịp chờ', lines: [
        'Bấm nút Đồ Ăn (phím R) ở cụm nút dưới phải để ăn nhanh: trò chơi tự chọn món hợp nhất với phần máu và Tĩnh Âm đang thiếu — thiếu ít thì dùng món yếu trước, giữ món mạnh cho lúc nguy cấp.',
        'Đang đầy cả máu lẫn Tĩnh Âm thì không ăn được, và món ăn không bị trừ.',
        'Trong trận, mỗi lần ăn xong phải chờ ' + FOOD_CD_SEC + ' giây mới ăn tiếp được; ngoài trận thì ăn tự do, không phải chờ.'
      ] }
    ] };
  }
  function guideBiCanhChapter(state) {
    var bandName = function (band) {
      for (var i = 0; i < REALMS.length; i++) if (REALMS[i].id === band) return REALMS[i].name;
      return band;
    };
    var bcLines = [];
    for (var id in SECRET_REALM_DEFS) {
      var def = SECRET_REALM_DEFS[id];
      var line = def.name + ' — dải ' + bandName(def.band) + '; boss rơi Yêu Đan cấp ' + def.yeuDanLevel + '; mở khi hoàn thành nhiệm vụ "' + guideQuestName(def.unlockQuest) + '"';
      if (id === 'bc_kiemtrung_sau') line += '; riêng bí cảnh này còn cần đạt ' + realmName(3, 0);
      if (id === 'bc_tran_tam_sau') line += '; cần qua ải lần đầu tầng ngoài trước và vào theo tổ đội từ ' + (def.partyMin || 2) + ' người — thiếu người, hệ thống sẽ lấp đồng đội máy';
      if (state && secretRealmUnlocked(state, id)) line += ' — ngươi ĐÃ mở';
      bcLines.push(line + '.');
    }
    var wavePct = (REWARD_PROFILES['profile:bc:bc_thuyliem:wave'] || {}).tuviPct;
    return { id: 'bicanh', title: 'Bí cảnh và cày cấp', locked: false, lockText: '', sections: [
      { h: 'Các bí cảnh đang có', lines: bcLines },
      { h: 'Lượt vào và thưởng trong bí cảnh', lines: [
        'Mọi bí cảnh dùng CHUNG một kho lượt: mỗi ngày game có ' + BC_POOL_MAX + ' lượt vào, tính gộp cho tất cả bí cảnh. Lượt qua ải LẦN ĐẦU TIÊN của từng bí cảnh không trừ vào kho; đã vào rồi thoát ngay vẫn tính là đã dùng lượt.' + (state ? ' Lượt còn lại hôm nay của ngươi: ' + bcPoolLeft(state) + '/' + BC_POOL_MAX + '.' : ''),
        'Trong bí cảnh, mỗi đợt quái trả ' + wavePct + '% tu vi của trần tầng hiện tại; boss cuối có thưởng riêng (Linh Thạch, tu vi, điểm cống hiến, đan dược), và phần thưởng qua ải lần đầu nằm ngoài trần cày của ngày.'
      ] },
      { h: 'Cày cấp ngoài bí cảnh', lines: [
        'Hạ quái thường dã ngoại được +' + REWARD_PROFILES['profile:kill:normal'].tuviPct + '% tu vi trần tầng cho mỗi mạng, quái tinh anh được +' + REWARD_PROFILES['profile:kill:elite'].tuviPct + '%. Boss dã ngoại có hồ sơ thưởng riêng và hồi sinh theo chu kỳ vài ngày.',
        'Mọi nguồn tu vi do cày đều chảy qua một trần mềm mỗi ngày: cày càng nhiều trong một ngày, phần vượt trần cho càng ít — sang ngày game mới, trần lại đầy.',
        'Phiếu treo thưởng săn quái, phiếu thu thập và việc tông môn ở các bảng nhiệm vụ là nguồn Linh Thạch, tu vi và điểm cống hiến ổn định mỗi ngày.'
      ] }
    ] };
  }
  /* Toàn bộ sổ: [{ id, title, locked, lockText, sections: [{ h, lines,
     checklist? }] }] — lớp game dựng mục lục + thân chương từ đây. */
  function guideChapters(state) {
    return [guideTrucCoChapter(state), guideFoodChapter(state), guideBiCanhChapter(state)];
  }


  /* ================= CUNG IV — KHỐI DỮ LIỆU + HÀM (chương 13–16) =================
     Toàn bộ điểm neo dữ liệu của đợt 1 cung IV nằm ở đây + các đăng ký
     rải trong tệp (QUESTS, MAPS.bc_kiemtrung_sau, SECRET_REALM_DEFS,
     MONSTER_DEFS, BOSS_DEFS, hồ sơ thưởng, mẫu bảng dải Kim Đan).
     Hợp đồng với worker engine: arciv-work/CONTRACT-wave1.md. */

  /* ---- Thưởng tu vi sự kiện có cờ chống trùng (mẫu flags.kimDanReward
     của chương 12 ở game.js, chuyển về logic để engine gọi một dòng).
     Tu vi cộng CÓ TRẦN tuviNext như addTuvi của game.js (trả sự kiện
     truyện không qua grantReward/trần mềm — tiền lệ chương 12).
     q15_done kèm +120 điểm lĩnh ngộ that_tinh: tiền lệ trong mã là
     BC_FIRST_REWARDS.bc_kiemtrung.tech {id:'that_tinh', pts:120} của
     game.js (trong mã KHÔNG có ký hiệu lingNgoAward riêng).
     'q16_pre_break' = khoản +300 của chương 16, engine gọi TRƯỚC khi
     cho đột phá q16_dot_pha. ---- */
  var ARC_IV_STORY_REWARDS = {
    q13_done: { tuvi: 150, flag: 'ch13Reward' },
    q14_done: { tuvi: 200, flag: 'ch14Reward' },
    q15_done: { tuvi: 250, flag: 'ch15Reward', swordInsight: 120 },
    q16_pre_break: { tuvi: 300, flag: 'ch16Reward' },
    /* Đợt 2 (chương 17–20): tu vi sự kiện theo thiết kế từng chương;
       q18_champion / q19_an_dinh là khoản lĩnh ngộ kiếm +60 [ĐỀ XUẤT SỐ
       đã duyệt ở thiết kế chương 18 mục 4.1 / chương 19 mục 5] trả qua
       cùng cơ chế swordInsight của claimArcIvStoryReward, tuvi 0. */
    q17_done: { tuvi: 150, flag: 'ch17Reward' },
    q18_done: { tuvi: 150, flag: 'ch18Reward' },
    q19_done: { tuvi: 150, flag: 'ch19Reward' },
    q20_done: { tuvi: 200, flag: 'ch20Reward' },
    q18_champion: { tuvi: 0, flag: 'ch18Insight', swordInsight: 60 },
    q19_an_dinh: { tuvi: 0, flag: 'ch19Insight', swordInsight: 60 },
    /* Đợt 3 (chương 21–24): tu vi sự kiện theo thiết kế từng chương.
       KHÔNG có mục q22_done — khoản 250 của chương 22 nằm ở
       q22_pre_break, engine gọi TRƯỚC mốc đột phá q22_dot_pha
       (khuôn q16_pre_break của đợt 1). */
    q21_done: { tuvi: 150, flag: 'ch21Reward' },
    q22_pre_break: { tuvi: 250, flag: 'ch22Reward' },
    q23_done: { tuvi: 200, flag: 'ch23Reward' },
    q24_done: { tuvi: 250, flag: 'ch24Reward' }
  };
  function claimArcIvStoryReward(state, key) {
    var spec = ARC_IV_STORY_REWARDS[key];
    if (!spec) return { ok: false, reason: 'unknown_reward' };
    if (!state.flags || typeof state.flags !== 'object') state.flags = {};
    if (state.flags[spec.flag]) return { ok: false, reason: 'duplicate' };
    var cap = REALMS[state.realm] && REALMS[state.realm].tuviNext;
    var gained = 0;
    if (cap) { gained = Math.max(0, Math.min(spec.tuvi, cap - (state.tuvi || 0))); state.tuvi = (state.tuvi || 0) + gained; }
    var tierUps = [];
    if (spec.swordInsight) { var tg = techniqueGain(state, 'that_tinh', spec.swordInsight); if (tg && tg.tierUps) tierUps = tg.tierUps; }
    state.flags[spec.flag] = true;
    return { ok: true, tuvi: gained, swordInsight: spec.swordInsight || 0, tierUps: tierUps };
  }

  /* ---- Đợt 2, chương 20: công nhận phẩm hồn 4 + dịch vụ hồn cấp tông ----
     arcIvRecognizeSoulRank4: CÔNG NHẬN phẩm — nâng soulRank lên 4 nếu
     đang thấp hơn và đặt cờ ch20SoulRecognized; hàm này KHÔNG cộng hồn
     lực (hồn lực cộng ở tầng engine theo biến thể kết trận, hợp đồng
     đợt 2 mục A.7). arcIvSectSoulServiceDue: dịch vụ hồn cấp tông đến
     hạn khi đã đóng chương 20, phẩm hồn >= 4, và chương hiện tại chưa
     trả khoản dịch vụ cấp tông (soulGrandPaidFor < chương hiện tại —
     cùng khuôn soulServiceDue/soulPaidFor của dịch vụ kín chương 5). */
  function arcIvRecognizeSoulRank4(state) {
    if (!state || typeof state !== 'object') return { ok: false, reason: 'no_state' };
    if (!state.flags || typeof state.flags !== 'object') state.flags = {};
    var before = typeof state.soulRank === 'number' ? state.soulRank : 0;
    if (before < 4) state.soulRank = 4;
    state.flags.ch20SoulRecognized = true;
    return { ok: true, before: before, soulRank: state.soulRank };
  }
  function arcIvSectSoulServiceDue(state) {
    if (!state || typeof state !== 'object') return false;
    return questReached(state, 'q20_done') && (state.soulRank || 0) >= 4 &&
      ((state.flags && state.flags.soulGrandPaidFor) || 0) < chapterOfQuest(state);
  }

  /* ---- Cờ khóa cộng hưởng chương 15 (tên cờ giao cho engine) ---- */
  var ARC_IV_CH15_LOCK_FLAG = 'ch15ResonanceLock';
  function arcIvCh15ResonanceLocked(state) { return !!(state && state.flags && state.flags[ARC_IV_CH15_LOCK_FLAG]); }

  /* ---- Cổng tầng sâu: điểm tương tác là vật thể CỤM KIẾM CHẮN HANG
     sẵn có ở thanh_van_tong (97,15) — tầng do điều kiện quyết, đúng
     tiền lệ cua_tan_tich một vật thể hai tầng. Điều kiện: mốc truyện
     q16_linh_ngo + Kim Đan. TUYỆT ĐỐI không đọc tầng công pháp. ---- */
  var BC_SAU_GATE = { map: 'thanh_van_tong', propId: 'bc_gate_kiemtrung', x: 97, y: 15, condQuest: 'q16_linh_ngo', minOrdinal: 300 };
  function bcSauGateOpen(state) {
    return questReached(state, BC_SAU_GATE.condQuest) && realmOrdinal(state) >= BC_SAU_GATE.minOrdinal;
  }

  /* ---- Sóng + vị trí boss tầng sâu cho engine chép vào BC_WAVES /
     BC_BOSS_POS của game.js (mẫu sóng bc_kiemtrung: [[loài x n]...]).
     Lính giữ cửa là loài MỚI tan_hon_kiem_y_sau (kháng cộng hưởng 50%). ---- */
  var BC_KIEMTRUNG_SAU_WAVES = [['tan_hon_kiem_y_sau', 2], ['tan_hon_kiem_y_sau', 3]];
  var BC_KIEMTRUNG_SAU_BOSS_POS = { x: 22, y: 5 };
  var BC_KIEMTRUNG_SAU_EYES = [{ x: 6, y: 14 }, { x: 37, y: 14 }];

  /* ---- Huyền Tinh Kiếm Phổ: học + vòng xuất chiêu ----
     learnHuyenTinhKiemPho là đường học DUY NHẤT (gọi từ thưởng lần
     đầu tầng sâu). availableSwordMoves/bestSwordMoveFor: vòng tự chọn
     lấy hệ số nhân CAO NHẤT trong các chiêu đã mở của cả hai dòng —
     Huyền Tinh Trảm 1,9 thắng Phá Quân 1,7 ở tầng 3, Quy Nhất 2,5 vẫn
     thắng ở tầng 4 (không hồi quy đòn của người chơi tầng cao). */
  function learnHuyenTinhKiemPho(state) {
    if (!state || typeof state !== 'object') return { ok: false, reason: 'no_state' };
    if (!Array.isArray(state.unlocked)) state.unlocked = [];
    var already = state.unlocked.indexOf('huyen_tinh_kiem_pho') >= 0;
    if (!already) state.unlocked.push('huyen_tinh_kiem_pho');
    ensureTechniques(state);
    return { ok: true, already: already, technique: techniqueOf(state, 'huyen_tinh_kiem_pho') };
  }
  function availableSwordMoves(state) {
    var out = [];
    SWORD_MOVES.forEach(function (mv) {
      var tid = mv.techId || 'that_tinh';
      if (tid === 'that_tinh') {
        if (!state.unlocked || state.unlocked.indexOf('that_tinh') < 0) return;
        var t = techniqueOf(state, 'that_tinh'); var tier = t ? t.tier : 1;
        if (tier >= mv.tier) out.push(mv);
      } else {
        var t2 = techniqueOf(state, tid);
        if (t2 && t2.tier >= mv.tier) out.push(mv);
      }
    });
    return out;
  }
  function bestSwordMoveFor(state) {
    var list = availableSwordMoves(state);
    if (!list.length) return SWORD_MOVES[0];
    var best = list[0];
    list.forEach(function (mv) { if (mv.mult * mv.hits > best.mult * best.hits) best = mv; });
    return best;
  }

  /* ---- Thưởng thông LẦN ĐẦU tầng sâu — NGOÀI trần mềm (engine gọi
     đúng một lần khi bcRecordClear báo firstClear; bản thân cờ
     firstClear là khóa chống trùng, hàm còn tự kiểm lại). Gồm: bí
     tịch Huyền Tinh Kiếm Phổ + Yêu Đan cấp 3 x1 + tu vi 240 (20% trần
     Kim Đan 1200, cộng có trần) + thử học ô 06 Thanh Long Xuất Thế
     (cần ô 02 + ô 05; thiếu chuỗi thì chờ ở cờ thanhLongPending, học
     bù bằng arcIvResolvePendingSets khi chuỗi đủ). ---- */
  var BC_SAU_FIRST_TUVI = 240;
  function bcSauFirstClearRewards(state) {
    var sr = ensureSecretRealms(state);
    var e = sr.realms.bc_kiemtrung_sau;
    if (!e || !e.firstClear) return { ok: false, reason: 'not_first_clear' };
    if (state.flags && state.flags.bcSauFirstPaid) return { ok: false, reason: 'duplicate' };
    var learned = learnHuyenTinhKiemPho(state);
    bagAdd(state, 'yeu_dan_3', 1);
    var cap = REALMS[state.realm] && REALMS[state.realm].tuviNext;
    var gained = 0;
    if (cap) { gained = Math.max(0, Math.min(BC_SAU_FIRST_TUVI, cap - (state.tuvi || 0))); state.tuvi = (state.tuvi || 0) + gained; }
    var set06 = nguHanhLearn(state, 'thanh_long_xuat_the');
    if (!set06.ok && set06.reason === 'chain') { if (state.flags) state.flags.thanhLongPending = true; }
    if (!state.flags) state.flags = {};
    state.flags.bcSauFirstPaid = true;
    return { ok: true, huyenTinh: learned, items: { yeu_dan_3: 1 }, tuvi: gained, set06: set06 };
  }
  function arcIvResolvePendingSets(state) {
    var out = [];
    if (state && state.flags && state.flags.thanhLongPending && !techniqueOf(state, 'thanh_long_xuat_the')) {
      var r = nguHanhLearn(state, 'thanh_long_xuat_the');
      if (r.ok) { state.flags.thanhLongPending = false; out.push('thanh_long_xuat_the'); }
    }
    return out;
  }

  /* ---- Đài thách đấu tông môn (mở khi qua q13_de_nghi) ----
     Điểm kiếm trong trận chảy theo mô hình hiện hành: resolver trận
     của engine gọi techniqueGain(state,'that_tinh',2) mỗi lần xuất
     kiếm (đúng encCastSword/hhtCastSword ở game.js) — hàm ghi thắng
     KHÔNG cộng điểm kiếm. Bậc vo_dich: giữ chỗ ở đợt 1, MỞ ở đợt 2
     (chương 18) thành hạng trong ranks với mốc openQuest riêng; đối
     tượng champion bên dưới là tombstone cũ, giữ nguyên như hợp đồng. */
  var DAI_THACH_DAU_DEFS = {
    unlockQuest: 'q13_de_nghi',
    swordPtsPerCast: 2,
    ranks: [
      { id: 'noi_mon', name: 'Đệ tử nội môn', profileId: 'profile:challenge:noi_mon', flag: 'challengeWinsNoiMon' },
      { id: 'tinh_anh', name: 'Tinh anh nội môn', profileId: 'profile:challenge:tinh_anh', flag: 'challengeWinsTinhAnh', fragmentSet: 'thanh_loan_pha_hu' },
      /* Đợt 2 (chương 18): hạng vô địch mở sau trận đấu công khai ở phủ
         thành (mốc q18_chung_cu); mảnh ô 07 Hỏa Phượng Liêu Nguyên. */
      { id: 'vo_dich', name: 'Vô địch đài', profileId: 'profile:challenge:vo_dich', flag: 'challengeWinsVoDich', fragmentSet: 'hoa_phuong_lieu_nguyen', openQuest: 'q18_chung_cu' }
    ],
    champion: { id: 'vo_dich', name: 'Quán quân đài', open: false, reservedFor: 'chuong_18' }
  };
  function challengeOpen(state) { return questReached(state, 'q13_thinh_cau_dau'); }
  function daiThachDauRank(rankId) {
    for (var i = 0; i < DAI_THACH_DAU_DEFS.ranks.length; i++) if (DAI_THACH_DAU_DEFS.ranks[i].id === rankId) return DAI_THACH_DAU_DEFS.ranks[i];
    return null;
  }
  function daiThachDauRecordWin(state, rankId) {
    var rank = daiThachDauRank(rankId);
    if (!rank) return { ok: false, reason: 'unknown_rank' };
    if (!challengeOpen(state)) return { ok: false, reason: 'locked' };
    // Hạng có mốc mở riêng (openQuest): chưa đạt mốc thì khóa, dù đài đã mở.
    if (rank.openQuest && !questReached(state, rank.openQuest)) return { ok: false, reason: 'locked' };
    var g = ensureGrind(state);
    g.seq += 1;
    var r = grantReward(state, rank.profileId, { claimKey: 'gr:challenge:' + rankId + ':d' + state.dayCount + ':n' + g.seq, sourceId: 'daiThachDau:' + rankId });
    if (!r.ok) return r;
    if (!state.flags) state.flags = {};
    state.flags[rank.flag] = (state.flags[rank.flag] || 0) + 1;
    var frag = null;
    if (rank.fragmentSet) frag = nguHanhAddFragment(state, rank.fragmentSet);
    return { ok: true, reward: r, wins: state.flags[rank.flag], fragment: frag };
  }

  /* ---- Nguồn mảnh bí pháp dải Kim Đan (bản đồ mục 4.3) ----
     Luật boss CHUNG NGUỒN: mỗi lần hạ chỉ rơi mảnh cho bộ GẦN HOÀN
     THÀNH NHẤT trong các bộ đủ điều kiện của nguồn đó (đủ điều kiện =
     chưa học + đủ chuỗi hệ requires/requiresAny + đủ mốc riêng). Tỉ
     lệ hoàn thành = mảnh đã có / mảnh cần; hòa thì bộ cần ít mảnh hơn
     thắng. Mỗi lần hạ rơi ĐÚNG 1 mảnh (cần 5 lần hạ cho bộ 5 mảnh —
     đúng nhịp hồ sơ mảnh của giai đoạn 2). */
  var ARC_IV_FRAGMENT_SOURCES = {
    'dai_thach_dau:tinh_anh': ['thanh_loan_pha_hu'],
    'boss:bc_kiemtrung_sau': ['tuyet_hoa_cu_kiem'],
    'boss:ho_tran_kiem_linh': ['thai_bach_kim_kiem'],
    'boss:bc_tran_tam_sau': ['thai_bach_kim_kiem'],
    'boss:bc_kiemtrung': ['han_bang_bao_lien', 'loi_quang_than_kiem'],
    'boss:bc_thuyliem': ['thuong_hai_cuong_dao', 'thanh_hoa_lien_tran']
  };
  function arcIvFragmentEligible(state, setId, sourceId) {
    var def = TECHNIQUE_DEFS[setId];
    if (!def || !def.nguHanh) return false;
    if (techniqueOf(state, setId)) return false;
    if (def.requiresExternal && !techniqueOf(state, def.requiresExternal)) return false;
    var missing = (def.requires || []).filter(function (r) { return !techniqueOf(state, r); });
    if (missing.length) return false;
    if (def.requiresAny && !def.requiresAny.some(function (r) { return !!techniqueOf(state, r); })) return false;
    // Mốc riêng: Mảnh Sứ của SP-01 chỉ rơi SAU q16_linh_ngo (nhiệm vụ giao).
    if (setId === 'thanh_hoa_lien_tran' && !questReached(state, 'q16_linh_ngo')) return false;
    var cur = nguHanhFragments(state, setId);
    return cur < (def.fragmentsNeeded || 0);
  }
  function arcIvFragmentDropFor(state, sourceId) {
    var sets = ARC_IV_FRAGMENT_SOURCES[sourceId];
    if (!sets) return null;
    var best = null, bestRatio = -1, bestNeed = Infinity;
    sets.forEach(function (setId) {
      if (!arcIvFragmentEligible(state, setId, sourceId)) return;
      var def = TECHNIQUE_DEFS[setId];
      var need = def.fragmentsNeeded || 1;
      var ratio = nguHanhFragments(state, setId) / need;
      if (ratio > bestRatio || (ratio === bestRatio && need < bestNeed)) { best = setId; bestRatio = ratio; bestNeed = need; }
    });
    if (!best) return null;
    var r = nguHanhAddFragment(state, best);
    if (!r || !r.ok) return null;
    return { setId: best, count: r.count, needed: r.needed, complete: !!r.complete, converted: !!r.converted };
  }

  /* ---- Ô 19 (trưởng lão dạy): sau q12_done + thắng ÍT NHẤT 1 boss
     dã ngoại dải Kim Đan. Số lần thắng rút từ sổ nhận thưởng của hệ
     cày (khóa claim của boss Hộ Trận) — không cần cờ riêng. ---- */
  function kimDanWildBossWins(state) {
    var g = ensureGrind(state);
    var keys = Object.keys(g.claimed || {});
    var n = 0;
    keys.forEach(function (k) { if (/^gr:boss:boss_hb_ho_tran_kiem_linh:c\d+$/.test(k)) n += 1; });
    return n;
  }
  function arcIvTryTeachTuDien(state) {
    if (!questReached(state, 'q12_done')) return { ok: false, reason: 'quest' };
    if (kimDanWildBossWins(state) < 1) return { ok: false, reason: 'wild_boss' };
    return nguHanhLearn(state, 'tu_dien_kich');
  }
  /* ---- Ô 09 (tàng kinh): 10 phiếu săn ĐÃ TRẢ với hồ sơ dải Kim Đan
     (resolvedProfileId đóng băng lúc nhận) + đã có ô 08. ---- */
  function arcIvHuntTicketsKimDan(state) {
    var g = ensureGrind(state);
    var n = 0;
    Object.keys(g.instances || {}).forEach(function (k) {
      var inst = g.instances[k];
      if (inst && inst.kind === 'hunt' && inst.status === 'claimed' && inst.resolvedProfileId === 'profile:hunt:kd') n += 1;
    });
    return n;
  }
  function arcIvTryTeachDaiNhat(state) {
    if (!techniqueOf(state, 'viem_long_tho_tuc')) return { ok: false, reason: 'chain', missing: ['viem_long_tho_tuc'] };
    if (arcIvHuntTicketsKimDan(state) < 10) return { ok: false, reason: 'tickets', tickets: arcIvHuntTicketsKimDan(state) };
    return nguHanhLearn(state, 'dai_nhat_hoa_cau');
  }
  /* ---- Điểm ghép dải Kim Đan: tàng kinh, sau q16_linh_ngo ---- */
  function arcIvCraftAtTangKinh(state, id) {
    if (!questReached(state, 'q16_linh_ngo')) return { ok: false, reason: 'locked' };
    return nguHanhCraft(state, id);
  }

  var VSLC = {
    REALMS: REALMS, realmName: realmName,
    SILENCE_MAX: SILENCE_MAX, SILENCE_RATES: SILENCE_RATES, WORD_SKILLS: WORD_SKILLS,
    silenceGain: silenceGain, wordPower: wordPower, castWord: castWord,
    MAP_W: MAP_W, MAP_H: MAP_H, MAP_GRID: MAP_GRID, PROPS: PROPS, NPCS: NPCS,
    SPAWN: SPAWN, WELL_MEDITATE: WELL_MEDITATE,
    tileAt: tileAt, propAt: propAt, tapTargetAt: tapTargetAt, standTilesFor: standTilesFor, isWalkable: isWalkable, reachable: reachable, findPath: findPath,
    QUESTS: QUESTS, questById: questById, nextQuest: nextQuest,
    newCharacter: newCharacter, meditateTick: meditateTick, meditateRate: meditateRate, tryBreakthrough: tryBreakthrough,
    swordPower: swordPower, castSword: castSword, SWORD_MOVES: SWORD_MOVES, swordMoveById: swordMoveById,
    equippedWeaponId: equippedWeaponId, weaponBonus: weaponBonus,
    TECHNIQUE_DEFS: TECHNIQUE_DEFS, techniqueOf: techniqueOf, techniqueTier: techniqueTier,
    techniqueTierUpReady: techniqueTierUpReady, techniqueGain: techniqueGain, ensureTechniques: ensureTechniques,
    BI_TICH_POINTS: BI_TICH_POINTS, useBiTich: useBiTich,
    NGU_HANH_PROFILES: NGU_HANH_PROFILES, defaultNguHanh: defaultNguHanh, ensureNguHanh: ensureNguHanh,
    nguHanhIds: nguHanhIds, nguHanhLearned: nguHanhLearned, nguHanhLearn: nguHanhLearn,
    nguHanhFragments: nguHanhFragments, nguHanhAddFragment: nguHanhAddFragment,
    nguHanhCanCraft: nguHanhCanCraft, nguHanhCraft: nguHanhCraft,
    nguHanhTries: nguHanhTries, nguHanhRecordTry: nguHanhRecordTry, nguHanhResetTries: nguHanhResetTries,
    NGU_HANH_TAN_THIEN_GUARANTEE: NGU_HANH_TAN_THIEN_GUARANTEE,
    KY_NGO_BASE: KY_NGO_BASE, KY_NGO_STEP: KY_NGO_STEP, KY_NGO_CAP: KY_NGO_CAP, KY_NGO_HARD: KY_NGO_HARD, KY_NGO_LOCK: KY_NGO_LOCK,
    kyNgoChance: kyNgoChance, kyNgoPool: kyNgoPool, kyNgoOnAction: kyNgoOnAction,
    GRIND_LEDGER_MAX: GRIND_LEDGER_MAX, defaultGrind: defaultGrind, ensureGrind: ensureGrind,
    realmOrdinal: realmOrdinal, questIndexOf: questIndexOf, questReached: questReached, npcPosFor: npcPosFor,
    grindHash32: grindHash32, grindRng: grindRng, grindPoolBase: grindPoolBase, grindSoftCapAmount: grindSoftCapAmount,
    REWARD_PROFILES: REWARD_PROFILES, grantReward: grantReward, grindDayRollover: grindDayRollover, advanceGrindClock: advanceGrindClock,
    GRIND_SEED_VERSION: GRIND_SEED_VERSION, BOARD_DEFS: BOARD_DEFS,
    HUNT_TEMPLATES: HUNT_TEMPLATES, GATHER_TEMPLATES: GATHER_TEMPLATES, SECT_JOB_TEMPLATES: SECT_JOB_TEMPLATES,
    STORY_TEMPLATE_EXCLUSION: STORY_TEMPLATE_EXCLUSION, templatesForBoard: templatesForBoard, generateBoard: generateBoard,
    huntProfileForOrdinal: huntProfileForOrdinal, gatherDanProfileForOrdinal: gatherDanProfileForOrdinal, sectProfileForTier: sectProfileForTier,
    grindInstanceId: grindInstanceId, GRIND_ACTIVE_MAX: GRIND_ACTIVE_MAX, countHeldGrind: countHeldGrind, acceptBoardInstance: acceptBoardInstance,
    RESOURCE_NODES: RESOURCE_NODES, nodeDef: nodeDef, nodeStatus: nodeStatus,
    SECRET_REALM_DEFS: SECRET_REALM_DEFS, defaultSecretRealms: defaultSecretRealms, ensureSecretRealms: ensureSecretRealms,
    BC_POOL_MAX: BC_POOL_MAX,
    secretRealmUnlocked: secretRealmUnlocked, bcPoolLeft: bcPoolLeft, bcConsumeEntry: bcConsumeEntry, bcRecordClear: bcRecordClear,
    bcTranTamSauOpen: bcTranTamSauOpen,
    PARTY_MAX: PARTY_MAX, PARTY_ROLE_LABEL: PARTY_ROLE_LABEL, PARTY_ROLE_DEFS: PARTY_ROLE_DEFS,
    PARTY_BOT_HO: PARTY_BOT_HO, PARTY_BOT_TEN: PARTY_BOT_TEN, PARTY_BOT_SECTS: PARTY_BOT_SECTS,
    defaultParty: defaultParty, ensureParty: ensureParty, partyMembers: partyMembers, partySize: partySize,
    partyMatchmake: partyMatchmake, partyClearBots: partyClearBots, partyGateCheck: partyGateCheck, partyHoldSatisfied: partyHoldSatisfied,
    SIDE_QUEST_DEFS: SIDE_QUEST_DEFS, sideQuestDef: sideQuestDef, defaultSideQuests: defaultSideQuests, ensureSideQuests: ensureSideQuests,
    sideQuestProgress: sideQuestProgress, sideQuestStatus: sideQuestStatus, sideQuestList: sideQuestList,
    sideQuestGuideHint: sideQuestGuideHint, sideMarkSocial: sideMarkSocial, claimSideQuest: claimSideQuest, selectSideQuest: selectSideQuest,
    TRUC_CO_FORMULA: TRUC_CO_FORMULA, GUIDE_TRUC_CO_UNLOCK_QUEST: GUIDE_TRUC_CO_UNLOCK_QUEST,
    guideTrucCoOpen: guideTrucCoOpen, trucCoChecklist: trucCoChecklist, guideChapters: guideChapters,
    FOOD_CD_SEC: FOOD_CD_SEC, FOOD_RECIPES: FOOD_RECIPES, foodDef: foodDef, foodIds: foodIds, foodCount: foodCount, bestFoodId: bestFoodId, eatFood: eatFood, buyFood: buyFood, cookFood: cookFood, gatherFoodPatch: gatherFoodPatch,
    SILVER_START: SILVER_START, silverBalance: silverBalance, buyFoodSilver: buyFoodSilver, tasteFood: tasteFood,
    sideGrindClaimedCount: sideGrindClaimedCount,
    PHE_THUOC_COLOR_ORDER: PHE_THUOC_COLOR_ORDER,
    isSessionHidden: isSessionHidden, hideSessionProp: hideSessionProp, showSessionProp: showSessionProp, clearSessionHiddenProps: clearSessionHiddenProps,
    MONSTER_DEFS: MONSTER_DEFS, HUNT_ZONES: HUNT_ZONES, HUNT_LAIRS: HUNT_LAIRS, BOSS_DEFS: BOSS_DEFS,
    /* Cung IV (đợt 1): dữ kiện + hàm chương 13–16 cho worker engine. */
    ARC_IV_STORY_REWARDS: ARC_IV_STORY_REWARDS, claimArcIvStoryReward: claimArcIvStoryReward,
    arcIvRecognizeSoulRank4: arcIvRecognizeSoulRank4, arcIvSectSoulServiceDue: arcIvSectSoulServiceDue,
    ARC_IV_CH15_LOCK_FLAG: ARC_IV_CH15_LOCK_FLAG, arcIvCh15ResonanceLocked: arcIvCh15ResonanceLocked,
    BC_SAU_GATE: BC_SAU_GATE, bcSauGateOpen: bcSauGateOpen,
    BC_KIEMTRUNG_SAU_GRID: BC_KIEMTRUNG_SAU_GRID, BC_KIEMTRUNG_SAU_WAVES: BC_KIEMTRUNG_SAU_WAVES,
    BC_TRAN_TAM_GRID: BC_TRAN_TAM_GRID, BC_TRAN_TAM_PROPS: BC_TRAN_TAM_PROPS,
    BC_TRAN_TAM_WAVES: BC_TRAN_TAM_WAVES, BC_TRAN_TAM_WAVE_POS: BC_TRAN_TAM_WAVE_POS, BC_TRAN_TAM_BOSS_POS: BC_TRAN_TAM_BOSS_POS,
    BC_TRAN_TAM_SAU_GRID: BC_TRAN_TAM_SAU_GRID, BC_TRAN_TAM_SAU_PROPS: BC_TRAN_TAM_SAU_PROPS,
    BC_TRAN_TAM_SAU_BOSS_POS: BC_TRAN_TAM_SAU_BOSS_POS, BC_TRAN_TAM_SAU_PADS: BC_TRAN_TAM_SAU_PADS,
    BC_KIEMTRUNG_SAU_BOSS_POS: BC_KIEMTRUNG_SAU_BOSS_POS, BC_KIEMTRUNG_SAU_EYES: BC_KIEMTRUNG_SAU_EYES,
    learnHuyenTinhKiemPho: learnHuyenTinhKiemPho, availableSwordMoves: availableSwordMoves, bestSwordMoveFor: bestSwordMoveFor,
    bcSauFirstClearRewards: bcSauFirstClearRewards, arcIvResolvePendingSets: arcIvResolvePendingSets,
    DAI_THACH_DAU_DEFS: DAI_THACH_DAU_DEFS, challengeOpen: challengeOpen, daiThachDauRank: daiThachDauRank, daiThachDauRecordWin: daiThachDauRecordWin,
    ARC_IV_FRAGMENT_SOURCES: ARC_IV_FRAGMENT_SOURCES, arcIvFragmentEligible: arcIvFragmentEligible, arcIvFragmentDropFor: arcIvFragmentDropFor,
    kimDanWildBossWins: kimDanWildBossWins, arcIvTryTeachTuDien: arcIvTryTeachTuDien,
    arcIvHuntTicketsKimDan: arcIvHuntTicketsKimDan, arcIvTryTeachDaiNhat: arcIvTryTeachDaiNhat,
    arcIvCraftAtTangKinh: arcIvCraftAtTangKinh,
    bossClaimKey: bossClaimKey, bossStatus: bossStatus,
    YEU_DAN_DROP_NORMAL: YEU_DAN_DROP_NORMAL, YEU_DAN_DROP_ELITE: YEU_DAN_DROP_ELITE,
    rollSessionValue: rollSessionValue, yeuDanDropFor: yeuDanDropFor, newEncounterSessionId: newEncounterSessionId,
    YEU_DAN_EXCHANGE_PCT: YEU_DAN_EXCHANGE_PCT, exchangeYeuDan: exchangeYeuDan,
    chapterOfQuest: chapterOfQuest, soulServiceDue: soulServiceDue, healSoul: healSoul,
    TRIBULATION_PROFILES: TRIBULATION_PROFILES, TRIB_REDUCTION_CAP: TRIB_REDUCTION_CAP,
    TRIB_DAN_CUT: TRIB_DAN_CUT, TRIB_PHU_CUT: TRIB_PHU_CUT, TRIB_PHAP_CUT: TRIB_PHAP_CUT,
    TRIB_GUARD_CUT_FULL: TRIB_GUARD_CUT_FULL, TRIB_GUARD_CUT_BROKEN: TRIB_GUARD_CUT_BROKEN,
    TRIB_SPEAK_BOOST: TRIB_SPEAK_BOOST, TRIB_SPEAK_MAX: TRIB_SPEAK_MAX, ANNOUNCE_LOG_MAX: ANNOUNCE_LOG_MAX,
    tribProfileFor: tribProfileFor, tribGuardCut: tribGuardCut, tribBoltDamage: tribBoltDamage,
    tribBestResonance: tribBestResonance, tribEstimate: tribEstimate,
    applyTribFailure: applyTribFailure, noteHoiKhiDanUsed: noteHoiKhiDanUsed, clearTrongThuong: clearTrongThuong,
    publishAnnounce: publishAnnounce, breakthroughInfo: breakthroughInfo, stageGateBlocked: stageGateBlocked,
    ITEM_DEFS: ITEM_DEFS, BAG_TIERS: BAG_TIERS, bagOf: bagOf, bagCount: bagCount, bagHas: bagHas,
    bagCap: bagCap, bagUsed: bagUsed, bagCanAdd: bagCanAdd, bagAdd: bagAdd, bagRemove: bagRemove, syncBagMirrors: syncBagMirrors, storyItemsOwned: storyItemsOwned,
    DAY_MINUTES: DAY_MINUTES, DAY_DEFAULT_MINUTES: DAY_DEFAULT_MINUTES, NIGHT_DARK_MAX: NIGHT_DARK_MAX,
    DAYNIGHT_REAL_MIN_PER_DAY: DAYNIGHT_REAL_MIN_PER_DAY, DAYNIGHT_MIN_PER_SEC: DAYNIGHT_MIN_PER_SEC, DAY_PHASE_KEYS: DAY_PHASE_KEYS,
    normalizeDayMinutes: normalizeDayMinutes, advanceDayClock: advanceDayClock,
    dayPhaseAt: dayPhaseAt, displayDayMinutes: displayDayMinutes, dayPhaseFor: dayPhaseFor, formatDayTime: formatDayTime,
    LINH_GIFT_AMOUNT: LINH_GIFT_AMOUNT, walletOpen: walletOpen, fmtNum: fmtNum,
    linhBalance: linhBalance, addLinhThach: addLinhThach, spendLinhThach: spendLinhThach, addSectMerit: addSectMerit, normalizeSave: normalizeSave,
    MAPS: MAPS, activeMap: activeMap, activeMapId: activeMapId, setActiveMap: setActiveMap,
    portalUnlocked: portalUnlocked,
    recordSpeech: recordSpeech,
    register: register, login: login, saveGame: saveGame, loadGame: loadGame,
    ACC_KEY: ACC_KEY, SAVE_PREFIX: SAVE_PREFIX, SAVE_BACKUP_PREFIX: SAVE_BACKUP_PREFIX,
    dir8FromVector: dir8FromVector, joyNormalize: joyNormalize, joyClassify: joyClassify,
    JOY_DEAD: JOY_DEAD, JOY_MIN_SPEED: JOY_MIN_SPEED, JOY_STICK_DIST: JOY_STICK_DIST, JOY_STICK_MS: JOY_STICK_MS
  };
  global.VSLC = VSLC;
  if (typeof module !== 'undefined' && module.exports) module.exports = VSLC;
})(typeof window !== 'undefined' ? window : globalThis);
