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

  /* ---------------- Ngôn Linh / Tĩnh Mặc ---------------- */
  // Tĩnh Mặc: điểm im lặng 0..100. Thổ nạp và thời gian sống im lặng tích lũy nó;
  // cất tiếng ra chiêu thì tiêu hao — lời càng dồn lâu càng nặng (sáng tác bổ sung
  // của đội theo móc truyện, xem docs/story-bible.md phần C).
  var SILENCE_MAX = 100;
  var SILENCE_RATES = {
    meditate: 6,   // thổ nạp tích nhanh nhất (điểm/giây)
    walk: 0.6,     // sống im lặng tích chậm
    idle: 0.2
  };
  var WORD_SKILLS = [
    { id: 'pha', word: 'PHÁ', cost: 30, basePower: 10, unlock: 'voice' },
    { id: 'chan', word: 'CHẤN', cost: 50, basePower: 26, unlock: 'luyenkhi1' }
  ];
  function silenceGain(mode, seconds, cur) {
    var rate = SILENCE_RATES[mode] || 0;
    return Math.min(SILENCE_MAX, Math.max(0, cur + rate * seconds));
  }
  // Uy lực một lời nói: gốc của chiêu + toàn bộ Tĩnh Mặc dồn nén quy đổi.
  function wordPower(skill, silence) {
    return Math.round(skill.basePower + silence * 1.5);
  }
  function castWord(state, skillId) {
    var skill = null;
    for (var i = 0; i < WORD_SKILLS.length; i++) if (WORD_SKILLS[i].id === skillId) skill = WORD_SKILLS[i];
    if (!skill) return { ok: false, reason: 'Không có chiêu này.' };
    if (!state.unlocked || state.unlocked.indexOf(skill.unlock) < 0) return { ok: false, reason: 'Chưa mở khóa chiêu này.' };
    if (state.silence < skill.cost) return { ok: false, reason: 'Tĩnh Mặc chưa đủ — hãy im lặng tích lũy thêm.' };
    var power = wordPower(skill, state.silence);
    if (state.gear && state.gear.indexOf('kiem_phong') >= 0) power += 10; // Thanh Phong Kiếm trợ uy Ngôn Linh
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
    { id: 'tuu_diem', type: 'inn', x: 44, y: 18, w: 6, h: 4, fx: 6, fy: 1, name: 'Vọng Tiên Tửu Điếm' },
    { id: 'nha_tay', type: 'house', x: 5, y: 20, w: 4, h: 3, fx: 4, fy: 1, name: 'Nhà dân thôn' },
    { id: 'nha_tay_nam', type: 'house_c', x: 8, y: 34, w: 4, h: 3, fx: 4, fy: 1, name: 'Nhà dân thôn' },
    { id: 'nha_nam', type: 'house_b', x: 41, y: 34, w: 5, h: 3, fx: 5, fy: 1, name: 'Nhà dân thôn' },
    { id: 'nha_dong_nam', type: 'house', x: 51, y: 33, w: 4, h: 3, fx: 4, fy: 1, name: 'Nhà dân thôn' },
    { id: 'bia_trac_linh', type: 'stele', x: 29, y: 16, w: 2, h: 2, fx: 2, fy: 1, name: 'Bia đá trắc linh', interact: true },
    { id: 'gieng', type: 'well', x: 51, y: 19, w: 2, h: 2, fx: 2, fy: 1, name: 'Giếng nước đầu trấn', interact: true },
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
  function propAt(tx, ty) {
    var props = MAPS[ACTIVE_MAP].props;
    for (var i = 0; i < props.length; i++) {
      var p = props[i];
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
  // BFS tìm đường đi (cho di chuyển bằng chuột): cùng luật đi được với
  // reachable()/isWalkable(). Trả về mảng các ô {x, y} từ ô kề điểm đầu tới
  // ô đích (không gồm ô đầu, gồm ô đích), [] nếu đã đứng ở đích, hoặc null
  // nếu đích không đi được / không tới được.
  function findPath(from, to, npcs) {
    if (!from || !to) return null;
    if (!isWalkable(to.x, to.y, npcs)) return null;
    if (from.x === to.x && from.y === to.y) return [];
    var key = function (x, y) { return x + ',' + y; };
    var prev = {}, queue = [[from.x, from.y]];
    prev[key(from.x, from.y)] = null;
    while (queue.length) {
      var cur = queue.shift(), x = cur[0], y = cur[1];
      var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      for (var i = 0; i < 4; i++) {
        var nx = x + dirs[i][0], ny = y + dirs[i][1], k = key(nx, ny);
        if (k in prev) continue;
        if (!isWalkable(nx, ny, npcs)) continue;
        prev[k] = [x, y];
        if (nx === to.x && ny === to.y) {
          var path = [], cx = nx, cy = ny;
          while (cx !== from.x || cy !== from.y) {
            path.push({ x: cx, y: cy });
            var p = prev[key(cx, cy)]; cx = p[0]; cy = p[1];
          }
          path.reverse();
          return path;
        }
        queue.push([nx, ny]);
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
      { id: 'tram_nghi', type: 'stall', x: roadCX(20) + 1, y: 18, w: 4, h: 2, fx: 4, fy: 1, name: 'Trạm nghỉ giữa đường' },
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
    { id: 'hoa_huong_than', name: 'Hoa Hướng Thần', look: 'player_nam', x: 62, y: 55, dir: 'down' }
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
  function propRects(props) { return props.map(function (p) { return { x: p.x, y: p.y, w: p.w, h: p.h, pad: 1 }; }); }
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
    return gridStrings(g);
  }
  var CITY_GRID = buildCityGrid();
  var CITY_SIGNS = [
    { x: 48, y: 73, text: 'Cô Châu Thành' }, { x: 8, y: 31, text: 'Phủ Hứa Gia' },
    { x: 84, y: 13, text: 'Trần Gia' }, { x: 48, y: 7, text: 'Kiểm Trắc Tháp' },
    { x: 74, y: 29, text: 'Chợ Cô Châu' }, { x: 57, y: 61, text: 'Thiên Cơ Các' }
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
    { id: 'dan_thanh_b', name: 'Dân thành', look: 'villager_f', x: 60, y: 50, dir: 'left' }
  ];
  var CITY_PROPS = (function () {
    var props = [
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
    ];
    var pts = [{ x: 51, y: 74, r: 3 }, { x: 51, y: 6, r: 3 }, { x: 94, y: 8, r: 3 }, { x: 11, y: 59, r: 3 },
      { x: 51, y: 0, r: 2 }, { x: 97, y: 0, r: 2 }, { x: 51, y: 77, r: 2 }]
      .concat(npcPoints(CITY_NPCS)).concat(signPoints(CITY_SIGNS));
    return props.concat(scatterTrees(CITY_GRID, CITY_W, CITY_H, 'cay_c', 37, null, 1, makeAvoid(pts, propRects(props))));
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
    return props.concat(scatterTrees(TOWER_GRID, TOWER_W, TOWER_H, 'cay_t', 37, null, 1, makeAvoid(pts, propRects(props))));
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
    { id: 'den_noi_d', type: 'lantern', x: 32, y: 24, w: 1, h: 2, fx: 1, fy: 1 }
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
    return gridStrings(g);
  }
  var SECT_GRID = buildSectGrid();
  var SECT_SIGNS = [
    { x: 58, y: 87, text: 'Thanh Vân Tông' }, { x: 95, y: 64, text: 'Khu Tạp Dịch' },
    { x: 20, y: 14, text: 'Thăng Long Đạo' }, { x: 57, y: 10, text: 'Đài Trúc Cơ' },
    { x: 50, y: 55, text: 'Quảng Trường' }
  ];
  var SECT_NPCS = [
    { id: 'truong_lao_tong', name: 'Trưởng Lão Thanh Vân Tông', look: 'elder', x: 60, y: 26, dir: 'down' },
    { id: 'lieu_khuynh_tien', name: 'Liễu Khuynh Tiên', look: 'di_ninh', x: 17, y: 11, dir: 'down' },
    { id: 'tap_dich_truong', name: 'Quản Sự Tạp Dịch', look: 'villager_old', x: 97, y: 68, dir: 'down' },
    { id: 'de_tu_a', name: 'Đệ tử Thanh Vân', look: 'villager_m', x: 57, y: 62, dir: 'right' },
    { id: 'de_tu_b', name: 'Đệ tử Thanh Vân', look: 'player_nam', x: 67, y: 60, dir: 'left' },
    { id: 'hoa_huong_than', name: 'Hoa Hướng Thần', look: 'player_nam', x: 62, y: 55, dir: 'down' }
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
    ];
    var pts = [{ x: 61, y: 88, r: 3 }, { x: 31, y: 61, r: 3 }, { x: 61, y: 91, r: 2 }]
      .concat(npcPoints(SECT_NPCS)).concat(signPoints(SECT_SIGNS));
    var rects = propRects(props).concat([{ x: 95, y: 8, w: 12, h: 12, pad: 0 }]); // hành lang vào bãi trống sau núi
    var forest = { x0: 84, y0: 3, x1: 119, y1: 30 };
    return props.concat(scatterTrees(SECT_GRID, SECT_W, SECT_H, 'cay_s', 37, forest, 6, makeAvoid(pts, rects)));
  })();

  /* ---------------- Đăng ký bản đồ + cổng ---------------- */
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
        { x: 46, y: 0, w: 4, h: 1, to: 'tran', toX: 29, toY: 43, label: 'Về Hứa Gia Trấn' },
        { x: 46, y: 73, w: 4, h: 1, to: 'co_chau', toX: 51, toY: 74, label: 'Vào Cô Châu Thành', cond: 'quest:q2_cong_thanh', lockMsg: 'Hãy tới quảng trường cổng thành trước đã.' }
      ]
    },
    co_chau: {
      name: 'Cô Châu Thành', w: 104, h: 78, grid: CITY_GRID, props: CITY_PROPS, npcs: CITY_NPCS,
      meditate: { x: 11, y: 59 },
      signs: [{ x: 48, y: 73, text: 'Cô Châu Thành' }, { x: 8, y: 31, text: 'Phủ Hứa Gia' }, { x: 84, y: 13, text: 'Trần Gia' }, { x: 48, y: 7, text: 'Kiểm Trắc Tháp' }, { x: 74, y: 29, text: 'Chợ Cô Châu' }, { x: 57, y: 61, text: 'Thiên Cơ Các' }],
      portals: [
        { x: 50, y: 77, w: 4, h: 1, to: 'duong_mon', toX: 47, toY: 70, label: 'Về Đường Mòn Xuyên Rừng' },
        { x: 48, y: 0, w: 8, h: 1, to: 'kiem_trac_thap', toX: 35, toY: 52, label: 'Vào Kiểm Trắc Tháp', cond: 'quest:q3_hang_cho', lockMsg: 'Kỳ kiểm trắc chưa tới — cổng tháp còn đóng.' },
        { x: 96, y: 0, w: 4, h: 1, to: 'thanh_van_tong', toX: 61, toY: 88, label: 'Đường Lên Thanh Vân Tông', cond: 'flag:invited', lockMsg: 'Đường lên Thanh Vân Tông chỉ mở cho người mang thư mời của tông môn.' }
      ]
    },
    kiem_trac_thap: {
      name: 'Kiểm Trắc Tháp', w: 72, h: 56, grid: TOWER_GRID, props: TOWER_PROPS, npcs: TOWER_NPCS,
      meditate: { x: 8, y: 48 },
      signs: [{ x: 32, y: 52, text: 'Kiểm Trắc Tháp' }, { x: 30, y: 11, text: 'Đài Thước Pha Lê' }],
      portals: [
        { x: 34, y: 55, w: 4, h: 1, to: 'co_chau', toX: 51, toY: 6, label: 'Về Cô Châu Thành' },
        { x: 34, y: 0, w: 4, h: 1, to: 'thap_noi', toX: 19, toY: 27, label: 'Vào Sảnh Tháp', cond: 'quest:q3_thuoc_do', lockMsg: 'Chưa tới lượt vào sảnh — hãy chờ ở sân theo thứ tự danh sách.' }
      ]
    },
    thap_noi: {
      name: 'Sảnh Kiểm Trắc Tháp', w: 40, h: 30, grid: HALL_GRID, props: HALL_PROPS, npcs: HALL_NPCS,
      meditate: null,
      signs: [],
      portals: [
        { x: 18, y: 29, w: 4, h: 1, to: 'kiem_trac_thap', toX: 35, toY: 13, label: 'Ra Sân Tháp' }
      ]
    },
    thanh_van_tong: {
      name: 'Thanh Vân Tông', w: 124, h: 92, grid: SECT_GRID, props: SECT_PROPS, npcs: SECT_NPCS,
      meditate: { x: 31, y: 61 },
      signs: [{ x: 58, y: 87, text: 'Thanh Vân Tông' }, { x: 95, y: 64, text: 'Khu Tạp Dịch' }, { x: 20, y: 14, text: 'Thăng Long Đạo' }, { x: 57, y: 10, text: 'Đài Trúc Cơ' }, { x: 50, y: 55, text: 'Quảng Trường' }],
      portals: [
        { x: 59, y: 91, w: 6, h: 1, to: 'co_chau', toX: 94, toY: 8, label: 'Xuống Cô Châu Thành' }
      ]
    }
  };
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
    { id: 'q_dummy', name: 'Một lời phá cọc', desc: 'Dùng Ngôn Linh "PHÁ" (phím 1, cần 30 Tĩnh Mặc) phá cọc gỗ luyện công ở phía nam sân.', hint: { x: 36, y: 32 } },
    { id: 'q_done', name: 'Chương sau: Kiểm Trắc Tháp', desc: 'Bản v1 kết thúc tại đây. Con đường tới Kiểm Trắc Tháp sẽ mở ở chương tiếp theo.', hint: null },
    /* Chương 2 — lên đường (docs/part2-design.md mục 4) */
    { id: 'q2_len_duong', name: 'Lên đường tới Cô Châu Thành', desc: 'Ra cổng nam Hứa Gia Trấn, theo đường mòn xuyên rừng đi về phía nam.', hint: { map: 'tran', x: 29, y: 43 } },
    { id: 'q2_vet_tich', name: 'Dấu vết dọc đường', desc: 'Dừng ở trạm nghỉ giữa đường, xem dấu vết người đi trước để lại (phím E).', hint: { map: 'duong_mon', x: 53, y: 24 } },
    { id: 'q2_phuc_kich', name: 'Bóng người trong rừng', desc: 'Đi tiếp về phía nam. Rừng càng lúc càng rậm — cẩn thận.', hint: { map: 'duong_mon', x: 43, y: 54 } },
    { id: 'q2_cong_thanh', name: 'Tới cổng Cô Châu Thành', desc: 'Cổng thành ở cuối đường. Tiến vào quảng trường cổng thành.', hint: { map: 'duong_mon', x: 48, y: 69 } },
    { id: 'q2_done', name: 'Chương 3: Kiểm Trắc Tháp', desc: 'Đã tới cổng Cô Châu Thành. Kỳ kiểm trắc tại Kiểm Trắc Tháp sẽ mở ở chương tiếp theo.', hint: null },
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
    { id: 'q6_done', name: 'Chương 7: Nhập Thanh Vân Tông', desc: 'Thư mời đã trong tay. Cổng lên Thanh Vân Tông ở đông bắc thành đã mở cho ngươi.', hint: null },
    /* Chương 7 — Vào Thanh Vân Tông với thân phận vô linh căn */
    { id: 'q7_nhap_tong', name: 'Vào tông với thân phận vô linh căn', desc: 'Tới gặp trưởng lão tông ở Thanh Vân Đại Điện, trình thư mời nhập môn.', hint: { map: 'thanh_van_tong', x: 60, y: 27 } },
    { id: 'q7_tap_dich', name: 'Việc tạp dịch', desc: 'Làm ba việc ở khu tạp dịch đông nam: bổ củi, gánh nước, chuyển bao dược, xong về gặp quản sự tạp dịch.', hint: { map: 'thanh_van_tong', x: 97, y: 69 } },
    { id: 'q7_thang_long', name: 'Thăng Long Đạo', desc: 'Lên đài Thăng Long ở tây bắc tông, thắng hình chiếu bằng đúng ba chiêu kiếm, không dùng tiếng nói.', hint: { map: 'thanh_van_tong', x: 15, y: 9 } },
    { id: 'q7_hoa_huong_than', name: 'Hoa Hướng Thần', desc: 'Gặp đại đệ tử Hoa Hướng Thần ở quảng trường tông.', hint: { map: 'thanh_van_tong', x: 62, y: 56 } },
    { id: 'q7_done', name: 'Chương 8: Chuẩn bị Trúc Cơ', desc: 'Vị thế trong tông đã đổi. Kỳ Trúc Cơ của tông đang tới gần.', hint: null },
    /* Chương 8 — Trúc Cơ: lời nói đầu tiên ở tầm cao mới */
    { id: 'q8_chuan_bi', name: 'Chuẩn bị Trúc Cơ', desc: 'Gặp trưởng lão tông nhận điều kiện lên đài: mang về Linh Chi Sau Núi làm thuốc dẫn cho Trúc Cơ Đan.', hint: { map: 'thanh_van_tong', x: 60, y: 27 } },
    { id: 'q8_ho_phap', name: 'Hộ pháp trong im lặng', desc: 'Lên Đài Trúc Cơ ở phía bắc tông bắt đầu vận công; trong lúc đột phá, tuyệt đối không được cất tiếng.', hint: { map: 'thanh_van_tong', x: 60, y: 6 } },
    { id: 'q8_truc_co', name: 'Trúc Cơ', desc: 'Vận công đã tới điểm cuối. Nuốt Trúc Cơ Đan và đột phá tại Đài Trúc Cơ.', hint: { map: 'thanh_van_tong', x: 60, y: 6 } },
    { id: 'q8_thu_tieng', name: 'Gạch bỏ hai chữ vô linh căn', desc: 'Về đại điện gặp trưởng lão tông.', hint: { map: 'thanh_van_tong', x: 60, y: 27 } },
    { id: 'q8_done', name: 'Kết thúc phần hai: Trúc Cơ', desc: 'Phần hai khép lại ở Trúc Cơ Sơ Kỳ. Các tuyến Huyết Bạc Cung, Hồn Sư, Thiên Cơ Các và Liễu Khuynh Tiên còn để ngỏ cho phần sau.', hint: null }
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
      spokeLedger: [],           // sổ lời đã nói: {ch, ctx, witnesses} — nền cơ chế giá của lời nói
      linhThach: 0,              // ví Linh Thạch — KHÓA cho tới khi bắt đầu tu tiên
      linhUnlocked: false,       // mở tại tryBreakthrough khi đạt Luyện Khí tầng 1
      sectMerit: 0,              // điểm cống hiến tông môn — trục tích lũy thứ ba, tách khỏi Linh Thạch (chương 7)
      items: { dan: 0 },         // GƯƠNG đọc của túi: số Hồi Khí Đan (syncBagMirrors ghi)
      gear: [],                  // GƯƠNG đọc của túi: pháp khí đang có (syncBagMirrors ghi)
      bag: { tier: 1, items: {} }, // Túi Trữ Vật — nguồn sự thật của vật phẩm (mở khóa ở chương 3)
      soulRank: 0,               // phẩm Hồn Sư — TRỤC THỨ HAI, giấu kín (mở ở chương 5 khi chữa hồn)
      soulPower: 0,              // hồn lực tích lũy — không hiển thị công khai trong cốt truyện
      flags: { tested: false, voiced: false, dummyBroken: false, metUNhan: false, ltGift: false, wroteFirst: false, evidence: false, ltLetter: false, innWork: 0, thuocReward: false, invited: false, queueSeen: false, measured: false, thienCoSeen: false, clueKho: false, clueWitness: false, usedChanCh4: false, daoNoticedVoice: false, thienCoPaid: false, soulSecret: false, soulPaidFor: 0, uNhanSupported: false, duelSeen: false, dowrySeen: false, atkWave: 0, atkFallback: false, hbcPaid: false, bagUnlocked: false, sectSeen: false, choreGo: false, choreNuoc: false, choreBao: false, choresPaid: false, tlRound: 0, tlHits: 0, hhtHits: 0, chuanBiSeen: false, chiGathered: false, pillGranted: false, guardWave: 0, guardBroken: 0, sectReward: false },
      hp: 100, hpMax: 100
    };
  }
  // Thổ nạp một giây: tăng tu vi (chưa mở khóa tu luyện thì không tăng).
  // Tốc độ gốc 10/giây; Thanh Phong Chân Kinh (chương 3) +2/giây và pháp bảo
  // Tụ Linh Ngọc +5/giây — cộng dồn, chỉ tính khi đã sở hữu thật.
  function meditateRate(state) {
    var r = 10;
    if (state.unlocked && state.unlocked.indexOf('thanh_phong') >= 0) r += 2;
    if (state.gear && state.gear.indexOf('ngoc_tu_linh') >= 0) r += 5;
    return r;
  }
  function meditateTick(state, seconds) {
    if (state.unlocked.indexOf('voice') < 0) return state;
    var cap = REALMS[state.realm] && REALMS[state.realm].tuviNext;
    if (cap) state.tuvi = Math.min(cap, state.tuvi + meditateRate(state) * seconds);
    state.silence = silenceGain('meditate', seconds, state.silence);
    return state;
  }
  /* ---------------- Kiếm quyết (chương 3) ---------------- */
  // Thất Tinh Kiếm Quyết: đòn vật lý KHÔNG dùng tiếng nói — không tốn Tĩnh
  // Mặc, không ghi sổ lời đã nói. Đây là đường sức mạnh thứ hai buộc người
  // chơi mạnh cả khi không cất lời (đất dùng lớn ở Thăng Long Đạo chương 7).
  function swordPower(state) {
    var base = 18 + (state.stage || 0) * 3 + (state.realm || 0) * 10;
    if (state.gear && state.gear.indexOf('kiem_phong') >= 0) base += 8;
    return base;
  }
  function castSword(state) {
    if (!state.unlocked || state.unlocked.indexOf('that_tinh') < 0) return { ok: false, reason: 'Chưa học Thất Tinh Kiếm Quyết.' };
    return { ok: true, power: swordPower(state) };
  }
  /* ---------------- Hồn Sư — trục thứ hai, giấu kín (chương 5) ----------------
     Giang Phàm là Hồn Sư nhị phẩm nhưng giấu kín thân phận (theo truyện).
     Hồn lực không hiển thị như tài nguyên công khai; dịch vụ luyện hồn kín
     đáo qua Trần Tư Linh cho một nguồn Linh Thạch đều: 25 viên, tối đa MỘT
     lần mỗi chương truyện (theo số chương rút từ id nhiệm vụ hiện tại). */
  function chapterOfQuest(state) {
    var m = /^q(\d)/.exec(state.quest || '');
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
     xây (thổ nạp, kiếm quyết, Ngôn Linh) — syncBagMirrors là nơi duy nhất
     ghi chúng, từ dữ liệu túi. */
  var ITEM_DEFS = {
    hoi_khi_dan: { name: 'Hồi Khí Đan', type: 'dan', stack: true, glyph: 'Đan' },
    kiem_phong: { name: 'Thanh Phong Kiếm', type: 'phap_khi', stack: false, glyph: 'Kiếm' },
    ngoc_tu_linh: { name: 'Tụ Linh Ngọc', type: 'phap_khi', stack: false, glyph: 'Ngọc' },
    linh_chi: { name: 'Linh Chi Sau Núi', type: 'nguyen_lieu', stack: true, glyph: 'Chi' },
    truc_co_dan: { name: 'Trúc Cơ Đan', type: 'dan', stack: true, glyph: 'Cơ' },
    thanh_phong_chan_kinh: { name: 'Thanh Phong Chân Kinh', type: 'nhiem_vu', stack: false, storySlot: true, glyph: 'Kinh' },
    that_tinh_kiem_quyet: { name: 'Thất Tinh Kiếm Quyết', type: 'nhiem_vu', stack: false, storySlot: true, glyph: 'Quyết' }
  };
  // Sức chứa theo tầng — giá nâng cấp là số [ĐỀ XUẤT] chờ parent duyệt (docs/part2-design.md).
  var BAG_TIERS = [null,
    { tier: 1, cap: 10, price: 0 },
    { tier: 2, cap: 20, price: 120 },
    { tier: 3, cap: 35, price: 300 },
    { tier: 4, cap: 55, price: 650 }
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
  function syncBagMirrors(state) {
    if (!state.items || typeof state.items !== 'object') state.items = { dan: 0 };
    state.items.dan = bagCount(state, 'hoi_khi_dan');
    var gear = [];
    if (bagHas(state, 'kiem_phong')) gear.push('kiem_phong');
    if (bagHas(state, 'ngoc_tu_linh')) gear.push('ngoc_tu_linh');
    state.gear = gear;
  }
  function soulServiceDue(state) {
    return !!(state.flags && state.flags.soulSecret) && (state.flags.soulPaidFor || 0) < chapterOfQuest(state);
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
    // Đạt Luyện Khí tầng 1 = bắt đầu tu tiên chính thức: mở ví Linh Thạch —
    // tiền tệ của giới tu tiên (phàm nhân chỉ dùng lượng bạc trong lời thoại).
    if (state.realm === 1 && state.stage === 0) state.linhUnlocked = true;
    return { ok: true, label: realmName(state.realm, state.stage) };
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
    state.dayMinutes = normalizeDayMinutes(state.dayMinutes); // save cũ chưa có đồng hồ -> 08:00 mặc định, không lỗi
    if (!state.flags || typeof state.flags !== 'object') state.flags = { tested: false, voiced: false, dummyBroken: false, metUNhan: false, ltGift: false, wroteFirst: false, evidence: false, ltLetter: false };
    if (typeof state.flags.ltGift !== 'boolean') state.flags.ltGift = false;
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
    if (!state.items || typeof state.items !== 'object') state.items = { dan: 0 };
    if (typeof state.items.dan !== 'number' || !(state.items.dan >= 0)) state.items.dan = 0;
    if (!Array.isArray(state.gear)) state.gear = [];
    // Túi Trữ Vật: save cũ chưa có túi -> dựng túi từ đan/pháp khí cũ (giữ
    // nguyên số lượng đã mua), rồi đồng bộ ngược lại hai trường gương.
    if (!state.bag || typeof state.bag !== 'object' || !state.bag.items || typeof state.bag.items !== 'object') {
      var legacyBag = { tier: 1, items: {} };
      if (state.items.dan > 0) legacyBag.items.hoi_khi_dan = state.items.dan;
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
  // Ghi một lần cất lời vào sổ: dữ kiện truyện (nhân chứng, bối cảnh), tách
  // khỏi dữ liệu hiển thị — nền cho "giá của lời nói" ở các chương sau.
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
  var DIR8_HYSTERESIS_DEG = 32.5; // nửa cung 22,5° + biên 10°
  var JOY_DEAD = 0.18;            // vùng chết = 18% bán kính cần
  var JOY_MIN_SPEED = 0.45;       // tốc độ tối thiểu khi vừa ra khỏi vùng chết
  var JOY_STICK_DIST = 12;        // kéo lệch quá 12px => chế độ cần
  var JOY_STICK_MS = 250;         // giữ quá 250ms => chế độ cần
  // Góc của vector đo từ trục xuống (a = atan2(dx, dy), dương về phía phải).
  // Trễ chuyển hướng: còn lệch khỏi tâm cung của hướng cũ không quá 32,5°
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

  var VSLC = {
    REALMS: REALMS, realmName: realmName,
    SILENCE_MAX: SILENCE_MAX, SILENCE_RATES: SILENCE_RATES, WORD_SKILLS: WORD_SKILLS,
    silenceGain: silenceGain, wordPower: wordPower, castWord: castWord,
    MAP_W: MAP_W, MAP_H: MAP_H, MAP_GRID: MAP_GRID, PROPS: PROPS, NPCS: NPCS,
    SPAWN: SPAWN, WELL_MEDITATE: WELL_MEDITATE,
    tileAt: tileAt, propAt: propAt, tapTargetAt: tapTargetAt, standTilesFor: standTilesFor, isWalkable: isWalkable, reachable: reachable, findPath: findPath,
    QUESTS: QUESTS, questById: questById, nextQuest: nextQuest,
    newCharacter: newCharacter, meditateTick: meditateTick, meditateRate: meditateRate, tryBreakthrough: tryBreakthrough,
    swordPower: swordPower, castSword: castSword,
    chapterOfQuest: chapterOfQuest, soulServiceDue: soulServiceDue, healSoul: healSoul,
    ITEM_DEFS: ITEM_DEFS, BAG_TIERS: BAG_TIERS, bagOf: bagOf, bagCount: bagCount, bagHas: bagHas,
    bagCap: bagCap, bagUsed: bagUsed, bagCanAdd: bagCanAdd, bagAdd: bagAdd, bagRemove: bagRemove, syncBagMirrors: syncBagMirrors,
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
