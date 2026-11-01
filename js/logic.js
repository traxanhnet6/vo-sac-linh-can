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
    if (tx < 0 || ty < 0 || tx >= MAP_W || ty >= MAP_H) return 'X';
    return MAP_GRID[ty].charAt(tx);
  }
  function propAt(tx, ty) {
    for (var i = 0; i < PROPS.length; i++) {
      var p = PROPS[i];
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

  /* ---------------- Nhiệm vụ chính ---------------- */
  // Chuỗi bản v1: trắc linh → mở miệng → thổ nạp → đột phá → phá cọc gỗ.
  var QUESTS = [
    { id: 'q_trac', name: 'Ngày trắc linh căn', desc: 'Tới bia đá trắc linh ở sân Hứa gia, đặt tay lên bia (phím E).', hint: { x: 29, y: 18 } },
    { id: 'q_voice', name: 'Mười tám năm, một lời', desc: 'Đứng trước cả trấn, hãy cất tiếng lần đầu tiên.', hint: { x: 29, y: 18 } },
    { id: 'q_meditate', name: 'Thổ nạp đầu tiên', desc: 'Tới cạnh giếng nước đầu trấn, giữ phím T để thổ nạp, tích đủ 100 tu vi.', hint: { x: 50, y: 20 } },
    { id: 'q_break', name: 'Đột phá Luyện Khí tầng 1', desc: 'Tu vi đã đầy. Nhấn phím B để đột phá.', hint: null },
    { id: 'q_dummy', name: 'Một lời phá cọc', desc: 'Dùng Ngôn Linh "PHÁ" (phím 1, cần 30 Tĩnh Mặc) phá cọc gỗ luyện công ở phía nam sân.', hint: { x: 36, y: 32 } },
    { id: 'q_done', name: 'Chương sau: Kiểm Trắc Tháp', desc: 'Bản v1 kết thúc tại đây. Con đường tới Kiểm Trắc Tháp sẽ mở ở chương tiếp theo.', hint: null }
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
      flags: { tested: false, voiced: false, dummyBroken: false, metUNhan: false },
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
    return { ok: true, label: realmName(state.realm, state.stage) };
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
    register: register, login: login, saveGame: saveGame, loadGame: loadGame,
    ACC_KEY: ACC_KEY, SAVE_PREFIX: SAVE_PREFIX
  };
  global.VSLC = VSLC;
  if (typeof module !== 'undefined' && module.exports) module.exports = VSLC;
})(typeof window !== 'undefined' ? window : globalThis);
