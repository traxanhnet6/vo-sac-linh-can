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
    { id: 'gieng', type: 'well', x: 51, y: 19, w: 2, h: 2, fx: 2, fy: 1, name: 'Giếng nước đầu trấn' },
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
      portals: [{ x: 46, y: 0, w: 4, h: 1, to: 'tran', toX: 29, toY: 43, label: 'Về Hứa Gia Trấn' }]
    }
  };
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
    { id: 'q2_done', name: 'Chương 3: Kiểm Trắc Tháp', desc: 'Đã tới cổng Cô Châu Thành. Kỳ kiểm trắc tại Kiểm Trắc Tháp sẽ mở ở chương tiếp theo.', hint: null }
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
      spokeLedger: [],           // sổ lời đã nói: {ch, ctx, witnesses} — nền cơ chế giá của lời nói
      linhThach: 0,              // ví Linh Thạch — KHÓA cho tới khi bắt đầu tu tiên
      linhUnlocked: false,       // mở tại tryBreakthrough khi đạt Luyện Khí tầng 1
      flags: { tested: false, voiced: false, dummyBroken: false, metUNhan: false, ltGift: false, wroteFirst: false, evidence: false, ltLetter: false },
      hp: 100, hpMax: 100
    };
  }
  // Thổ nạp một giây: tăng tu vi (chưa mở khóa tu luyện thì không tăng).
  function meditateTick(state, seconds) {
    if (state.unlocked.indexOf('voice') < 0) return state;
    var cap = REALMS[state.realm] && REALMS[state.realm].tuviNext;
    if (cap) state.tuvi = Math.min(cap, state.tuvi + 10 * seconds);
    state.silence = silenceGain('meditate', seconds, state.silence);
    return state;
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
  // Nạp save cũ (trước khi có ví): bổ sung trường còn thiếu, không lỗi.
  // Save đã qua mốc đột phá Luyện Khí tầng 1 (realm >= 1 hoặc đã ghi mốc
  // 'luyenkhi1') thì ví mở sẵn; chưa tới mốc thì ví vẫn khóa.
  function normalizeSave(state) {
    if (!state || typeof state !== 'object') return state;
    state.linhThach = linhBalance(state);
    if (!state.flags || typeof state.flags !== 'object') state.flags = { tested: false, voiced: false, dummyBroken: false, metUNhan: false, ltGift: false, wroteFirst: false, evidence: false, ltLetter: false };
    if (typeof state.flags.ltGift !== 'boolean') state.flags.ltGift = false;
    if (typeof state.flags.wroteFirst !== 'boolean') state.flags.wroteFirst = false;
    if (typeof state.flags.evidence !== 'boolean') state.flags.evidence = false;
    if (typeof state.flags.ltLetter !== 'boolean') state.flags.ltLetter = false;
    var past = (typeof state.realm === 'number' && state.realm >= 1) ||
      !!(state.unlocked && state.unlocked.indexOf('luyenkhi1') >= 0);
    state.linhUnlocked = past ? true : state.linhUnlocked === true;
    if (!MAPS[state.map]) state.map = 'tran';
    if (!Array.isArray(state.spokeLedger)) state.spokeLedger = [];
    // Save cũ dừng ở mốc cuối bản v1: nối thẳng sang chương 2.
    if (state.quest === 'q_done') state.quest = 'q2_len_duong';
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
  var ACC_KEY = 'vslc_accounts', SAVE_PREFIX = 'vslc_save_';
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
    storage.setItem(SAVE_PREFIX + username, JSON.stringify(state));
  }
  function loadGame(storage, username) {
    try {
      var raw = storage.getItem(SAVE_PREFIX + username);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  var VSLC = {
    REALMS: REALMS, realmName: realmName,
    SILENCE_MAX: SILENCE_MAX, SILENCE_RATES: SILENCE_RATES, WORD_SKILLS: WORD_SKILLS,
    silenceGain: silenceGain, wordPower: wordPower, castWord: castWord,
    MAP_W: MAP_W, MAP_H: MAP_H, MAP_GRID: MAP_GRID, PROPS: PROPS, NPCS: NPCS,
    SPAWN: SPAWN, WELL_MEDITATE: WELL_MEDITATE,
    tileAt: tileAt, propAt: propAt, isWalkable: isWalkable, reachable: reachable, findPath: findPath,
    QUESTS: QUESTS, questById: questById, nextQuest: nextQuest,
    newCharacter: newCharacter, meditateTick: meditateTick, tryBreakthrough: tryBreakthrough,
    LINH_GIFT_AMOUNT: LINH_GIFT_AMOUNT, walletOpen: walletOpen, fmtNum: fmtNum,
    addLinhThach: addLinhThach, spendLinhThach: spendLinhThach, normalizeSave: normalizeSave,
    MAPS: MAPS, activeMap: activeMap, activeMapId: activeMapId, setActiveMap: setActiveMap,
    recordSpeech: recordSpeech,
    register: register, login: login, saveGame: saveGame, loadGame: loadGame,
    ACC_KEY: ACC_KEY, SAVE_PREFIX: SAVE_PREFIX,
    dir8FromVector: dir8FromVector, joyNormalize: joyNormalize, joyClassify: joyClassify,
    JOY_DEAD: JOY_DEAD, JOY_MIN_SPEED: JOY_MIN_SPEED, JOY_STICK_DIST: JOY_STICK_DIST, JOY_STICK_MS: JOY_STICK_MS
  };
  global.VSLC = VSLC;
  if (typeof module !== 'undefined' && module.exports) module.exports = VSLC;
})(typeof window !== 'undefined' ? window : globalThis);
