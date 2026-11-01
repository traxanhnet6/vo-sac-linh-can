/* Sprite lưới pixel của game Vô Sắc Linh Căn — dữ liệu thuần, không emoji.
   Nhân vật: mẫu thân chung 16x20, 4 hướng (trái = lật gương của phải), 2 khung bước.
   Vật thể: dựng bằng hàm thành lưới ký tự + bảng màu riêng cho từng sprite.
   Đợt nâng cấp hình ảnh: thêm lớp chi tiết trong đúng khung lưới cũ —
   tóc có búi và bóng tóc, áo giao lĩnh có cổ trắng chéo, thắt lưng có khóa vàng,
   nhà có ngói xếp hàng và khung gỗ, bia đá có thước pha lê khắc chín màu. */
(function (global) {
  'use strict';

  /* Mẫu nhân vật. Ký tự: H tóc, h bóng tóc, S da, E mắt, C áo, D áo tối, W cổ áo trắng,
     R điểm nhấn, B thắt lưng/giày, g khóa vàng, j trâm ngọc. '.' trong suốt. */
  var BODY_DOWN_0 = [
    '.......HH.......',
    '.....HHHHHH.....',
    '....HHHHHHHh....',
    '....HHSSSShh....',
    '....HSSSSSSh....',
    '....HSESSESh....',
    '.....SSSSSS.....',
    '......SSSS......',
    '....CCCCCCCC....',
    '...CCCCCCCCCC...',
    '...DCCCWWCCCD...',
    '...DCCCCWCCCD...',
    '...SBBBggBBBS...',
    '....CCCCCCCC....',
    '....CCCWWCCC....',
    '....CCC..CCC....',
    '....DDD..DDD....',
    '....DDD..DDD....',
    '...BBBB..BBBB...',
    '...BBBB..BBBB...'
  ];
  var BODY_DOWN_1 = [
    '.......HH.......',
    '.....HHHHHH.....',
    '....HHHHHHHh....',
    '....HHSSSShh....',
    '....HSSSSSSh....',
    '....HSESSESh....',
    '.....SSSSSS.....',
    '......SSSS......',
    '....CCCCCCCC....',
    '...CCCCCCCCCC...',
    '...DCCCWWCCCD...',
    '...DCCCCWCCCD...',
    '...SBBBggBBBS...',
    '....CCCCCCCC....',
    '.....CCC.CCC....',
    '....CCC...CCC...',
    '....DDD....DDD..',
    '...DDD......DDD.',
    '...BBB.......BBB',
    '..BBBB.......BBB'
  ];
  var BODY_UP_0 = [
    '.......HH.......',
    '.....HHHHHH.....',
    '....HHHHHHHH....',
    '....HHHHHHHH....',
    '....HHHHHHHh....',
    '....HHHHHHHh....',
    '.....HHHHHh.....',
    '......SSSS......',
    '....CCCCCCCC....',
    '...CCCCCCCCCC...',
    '...DCCCCCCCCD...',
    '...DCCCCDCCCD...',
    '...SBBBggBBBS...',
    '....CCCCCCCC....',
    '....CCCCDCCC....',
    '....CCC..CCC....',
    '....DDD..DDD....',
    '....DDD..DDD....',
    '...BBBB..BBBB...',
    '...BBBB..BBBB...'
  ];
  var BODY_UP_1 = [
    '.......HH.......',
    '.....HHHHHH.....',
    '....HHHHHHHH....',
    '....HHHHHHHH....',
    '....HHHHHHHh....',
    '....HHHHHHHh....',
    '.....HHHHHh.....',
    '......SSSS......',
    '....CCCCCCCC....',
    '...CCCCCCCCCC...',
    '...DCCCCCCCCD...',
    '...DCCCCDCCCD...',
    '...SBBBggBBBS...',
    '....CCCCCCCC....',
    '.....CCC.CCC....',
    '....CCC...CCC...',
    '....DDD....DDD..',
    '...DDD......DDD.',
    '...BBB.......BBB',
    '..BBBB.......BBB'
  ];
  var BODY_RIGHT_0 = [
    '.......HH.......',
    '.....HHHHHH.....',
    '....HHHHHHHH....',
    '....HHHHSSS.....',
    '....HHhSSSS.....',
    '....HHhSES......',
    '.....HSSSS......',
    '......SSS.......',
    '....CCCCCCC.....',
    '...CCCCCCCCC....',
    '...DCCCWCCC.....',
    '...DCCCWCCC.....',
    '....BBBggBS.....',
    '....CCCCCC......',
    '....CCC.CCC.....',
    '....CCC..CCC....',
    '....DDD...DDD...',
    '....DDD...DDD...',
    '...BBBB....BBBB.',
    '...BBBB....BBBB.'
  ];
  var BODY_RIGHT_1 = [
    '.......HH.......',
    '.....HHHHHH.....',
    '....HHHHHHHH....',
    '....HHHHSSS.....',
    '....HHhSSSS.....',
    '....HHhSES......',
    '.....HSSSS......',
    '......SSS.......',
    '....CCCCCCC.....',
    '...CCCCCCCCC....',
    '...DCCCWCCC.....',
    '...DCCCWCCC.....',
    '....BBBggBS.....',
    '....CCCCCC......',
    '.....CCCCC......',
    '....CCC..CCC....',
    '...DDD.....DDD..',
    '..DDD.......DDD.',
    '..BBB........BBB',
    '.BBBB.........BB'
  ];
  function mirror(rows) {
    return rows.map(function (r) { return r.split('').reverse().join(''); });
  }
  var BODY = {
    down: [BODY_DOWN_0, BODY_DOWN_1],
    up: [BODY_UP_0, BODY_UP_1],
    right: [BODY_RIGHT_0, BODY_RIGHT_1],
    left: [mirror(BODY_RIGHT_0), mirror(BODY_RIGHT_1)]
  };
  // Búi tóc (nữ, trưởng lão): búi lớn hơn trên đỉnh đầu, có trâm ngọc xuyên ngang.
  function addBun(rows) {
    var out = rows.slice();
    out[0] = '......jHHj......';
    out[1] = '....HHHHHHHH....';
    return out;
  }
  // Râu dài (trưởng lão): râu trắng phủ xuống ngực, chỉ hướng xuống và ngang.
  function addBeard(rows) {
    var out = rows.slice();
    out[6] = '.....WWWWWW.....';
    out[7] = '......WWWW......';
    out[8] = '....CCCCWWCC....';
    return out;
  }

  /* Bảng màu từng tạo hình: [H,h,S,E,C,D,W,R,B,g,j] */
  var LOOKS = {
    player_nam:   { H: '#23242c', h: '#14151a', S: '#f0c8a0', E: '#20222a', C: '#5b7a99', D: '#47617c', W: '#e8e2d0', R: '#8a2f2a', B: '#4a3520', g: '#c9a227', j: '#79bfa0', bun: false },
    player_nu:    { H: '#2c1e18', h: '#1c130e', S: '#f4cfa8', E: '#20222a', C: '#7a9a6d', D: '#5f7d55', W: '#f2ead8', R: '#b0483e', B: '#4a3520', g: '#d9b84a', j: '#79bfa0', bun: true },
    u_nhan:       { H: '#33241c', h: '#211710', S: '#f6d2ac', E: '#20222a', C: '#a8bf97', D: '#87a176', W: '#f6efdd', R: '#c9a227', B: '#54402a', g: '#c9a227', j: '#8fd0b2', bun: true },
    di_ninh:      { H: '#1f1a24', h: '#120e16', S: '#f6d2ac', E: '#20222a', C: '#8d6bb5', D: '#6f4f92', W: '#efe6f7', R: '#d9b84a', B: '#3c2c1c', g: '#d9b84a', j: '#8fd0b2', bun: true },
    luc_tranh:    { H: '#191b20', h: '#0e0f12', S: '#eec39c', E: '#20222a', C: '#b03a30', D: '#8c2b23', W: '#f3e3c2', R: '#e3b83c', B: '#33241a', g: '#e3b83c', j: '#79bfa0', bun: false },
    anh_phung:    { H: '#241d16', h: '#171209', S: '#eec39c', E: '#20222a', C: '#6e4a7d', D: '#573a66', W: '#e9ddf0', R: '#c9a227', B: '#33241a', g: '#c9a227', j: '#8fd0b2', bun: true },
    chinh_ngon:   { H: '#3a3a40', h: '#26262b', S: '#e8bd94', E: '#20222a', C: '#54606e', D: '#424c58', W: '#ddd6c4', R: '#77683c', B: '#2e2118', g: '#a8893a', j: '#79bfa0', bun: false },
    elder:        { H: '#cfd2d6', h: '#a8adb3', S: '#e8bd94', E: '#20222a', C: '#707a72', D: '#59635c', W: '#f0ead6', R: '#77683c', B: '#2e2118', g: '#c9a227', j: '#8fd0b2', bun: true, beard: true },
    villager_m:   { H: '#2a2018', h: '#1a130c', S: '#e0aa7e', E: '#20222a', C: '#7d6a4f', D: '#63543d', W: '#d9cfb4', R: '#5d4a30', B: '#3a2a18', g: '#97783c', j: '#8a6a42', bun: false },
    villager_f:   { H: '#33241c', h: '#211710', S: '#f0c8a0', E: '#20222a', C: '#9a7b52', D: '#7c6240', W: '#e8dfc8', R: '#a03c34', B: '#3a2a18', g: '#97783c', j: '#8a6a42', bun: true },
    villager_old: { H: '#b9bcc0', h: '#92969b', S: '#e0aa7e', E: '#20222a', C: '#66707c', D: '#4f5862', W: '#d9d2bc', R: '#5d4a30', B: '#2e2118', g: '#97783c', j: '#8a6a42', bun: false, beard: true }
  };
  function charSprite(lookId, dir, frame) {
    var look = LOOKS[lookId] || LOOKS.villager_m;
    var rows = BODY[dir][frame % 2];
    if (look.bun) rows = addBun(rows);
    if (look.beard && dir !== 'up') rows = addBeard(rows);
    // Gộp bảng màu với giá trị dự phòng để không ký tự nào thiếu màu.
    var pal = { h: look.H, g: '#c9a227', j: '#79bfa0' };
    for (var k in look) if (k !== 'bun' && k !== 'beard') pal[k] = look[k];
    return { w: 16, h: 20, rows: rows, pal: pal };
  }

  /* ---------- Vật thể: lưới ký tự + bảng màu riêng ---------- */
  function grid(w, h, fill) {
    var rows = [];
    for (var y = 0; y < h; y++) { var r = ''; for (var x = 0; x < w; x++) r += fill; rows.push(r); }
    return rows;
  }
  function setPx(rows, x, y, ch) {
    if (y < 0 || y >= rows.length || x < 0 || x >= rows[y].length) return;
    rows[y] = rows[y].substring(0, x) + ch + rows[y].substring(x + 1);
  }
  function rect(rows, x0, y0, w, h, ch) {
    for (var y = y0; y < y0 + h; y++) for (var x = x0; x < x0 + w; x++) setPx(rows, x, y, ch);
  }
  // Hàm băm xác định riêng cho chi tiết lốm đốm trong sprite (không dùng số ngẫu nhiên).
  function hashN(x, y, salt) {
    var n = ((x * 73856093) ^ (y * 19349663) ^ (salt * 83492791)) >>> 0;
    n = (n ^ (n >> 13)) >>> 0;
    return ((n * 1274126177) >>> 0) % 100;
  }
  // Cây lá tròn 32x44: tán lá ba lớp sáng/tối, có cành, thân có bóng và gốc rễ.
  function makeTree() {
    var rows = grid(32, 44, '.');
    for (var y = 2; y < 30; y++) for (var x = 0; x < 32; x++) {
      var dx = (x - 15.5) / 15, dy = (y - 15) / 13;
      var d2 = dx * dx + dy * dy;
      if (d2 <= 1) {
        var ch = 'L';
        if (dy > 0.45) ch = 'd';                              // mặt dưới tán tối
        else if (dy < -0.3 && hashN(x, y, 3) < 45) ch = 'l';  // mặt trên đón nắng
        if (hashN(x, y, 7) < 10) ch = 'l';
        if (hashN(x, y, 11) < 8) ch = 'd';
        if (d2 > 0.86 && hashN(x, y, 5) < 50) ch = 'd';       // viền tán tối
        setPx(rows, x, y, ch);
      }
    }
    rect(rows, 14, 24, 4, 18, 'T'); rect(rows, 17, 24, 1, 18, 't');
    setPx(rows, 13, 25, 'T'); setPx(rows, 12, 23, 'T'); setPx(rows, 11, 21, 'T');
    setPx(rows, 18, 25, 'T'); setPx(rows, 19, 23, 'T');
    rect(rows, 12, 41, 9, 2, 'T'); rect(rows, 18, 41, 3, 2, 't');
    return { w: 32, h: 44, rows: rows, pal: { L: '#3e6b34', l: '#679c4e', d: '#2a4c24', T: '#5d422a', t: '#48331f' } };
  }
  // Thông 32x44: ba tầng tán xếp lớp, mỗi tầng có mép dưới tối và đốm sáng.
  function makePine() {
    var rows = grid(32, 44, '.');
    var tiers = [[2, 12, 6], [10, 22, 10], [19, 32, 14]];
    tiers.forEach(function (t) {
      for (var y = t[0]; y <= t[1]; y++) {
        var half = 1 + Math.floor((y - t[0]) / (t[1] - t[0]) * t[2]);
        for (var x = 16 - half; x < 16 + half; x++) {
          var ch = 'L';
          if (y >= t[1] - 1) ch = 'd';
          else if (hashN(x, y, 13) < 14) ch = 'l';
          if (hashN(x, y, 17) < 7) ch = 'd';
          setPx(rows, x, y, ch);
        }
      }
    });
    rect(rows, 14, 30, 4, 12, 'T'); rect(rows, 17, 30, 1, 12, 't');
    rect(rows, 12, 41, 9, 2, 'T'); rect(rows, 18, 41, 3, 2, 't');
    return { w: 32, h: 44, rows: rows, pal: { L: '#2f5d3a', l: '#4c8260', d: '#1e3d27', T: '#54402a', t: '#41311f' } };
  }
  // Bia đá trắc linh 32x52: đầu bia khắc mây, thân hai lớp đá, bệ hai bậc có rêu,
  // giữa bia là thước pha lê trong suốt và chín vạch màu của chín cấp linh căn.
  function makeStele() {
    var rows = grid(32, 52, '.');
    rect(rows, 2, 44, 28, 3, 'S'); rect(rows, 0, 47, 32, 5, 'D'); rect(rows, 0, 50, 32, 2, 'd');
    rect(rows, 6, 8, 20, 36, 'S'); rect(rows, 8, 10, 16, 32, 's');
    rect(rows, 10, 1, 12, 2, 'S'); rect(rows, 8, 3, 16, 2, 'S'); rect(rows, 6, 5, 20, 3, 'S');
    setPx(rows, 15, 0, 'g'); setPx(rows, 16, 0, 'g');
    [[9, 4], [12, 4], [20, 4], [22, 6], [9, 6]].forEach(function (p) { setPx(rows, p[0], p[1], 'D'); });
    // Thước pha lê: thân trong, một mặt bắt sáng trắng, một mặt tối lam.
    rect(rows, 14, 13, 4, 21, 'K');
    rect(rows, 15, 14, 1, 19, 'W'); rect(rows, 17, 14, 1, 19, 'k');
    setPx(rows, 15, 12, 'K'); setPx(rows, 16, 12, 'K'); setPx(rows, 15, 34, 'K'); setPx(rows, 16, 34, 'K');
    // Chín vạch chín màu (cấp 1 ở dưới cùng, cấp 9 ở trên cùng).
    var gradeChars = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o'];
    for (var i = 0; i < 9; i++) { setPx(rows, 11, 33 - i * 2, 'D'); setPx(rows, 12, 33 - i * 2, gradeChars[i]); }
    // Nét chữ khắc trừu tượng bên phải thước.
    [[19, 16, 3], [19, 20, 2], [20, 24, 3], [19, 28, 2]].forEach(function (b) { rect(rows, b[0], b[1], b[2], 1, 'D'); });
    var x;
    for (x = 2; x < 30; x++) if (hashN(x, 3, 19) < 22) setPx(rows, x, 45, 'm');
    for (x = 0; x < 32; x++) if (hashN(x, 9, 23) < 14) setPx(rows, x, 48, 'm');
    return {
      w: 32, h: 52, rows: rows, pal: {
        S: '#969ca4', s: '#7e848d', D: '#5d6266', d: '#484c50', g: '#c9a227',
        K: '#e2f0f4', k: '#a9c9d6', W: '#ffffff', m: '#5c8a48',
        q: '#eceae2', w: '#c3cad1', e: '#8fd07a', r: '#57a7e8', t: '#4a6fd4',
        y: '#8a5fc0', u: '#d46aa8', i: '#e04a3a', o: '#f0b429'
      }
    };
  }
  // Đèn lồng 16x48: đế và trụ đá, cổ đá, lồng đỏ có gân, tim đèn vàng và tua vàng.
  function makeLantern() {
    var rows = grid(16, 48, '.');
    rect(rows, 3, 44, 10, 4, 'D'); rect(rows, 3, 44, 10, 1, 'S');
    rect(rows, 6, 24, 4, 20, 'S'); rect(rows, 9, 24, 1, 20, 'd');
    rect(rows, 4, 21, 8, 3, 'D');
    rect(rows, 3, 3, 10, 2, 'D'); rect(rows, 5, 1, 6, 2, 'S');
    setPx(rows, 7, 0, 'g'); setPx(rows, 8, 0, 'g');
    rect(rows, 4, 5, 8, 15, 'R');
    rect(rows, 4, 5, 8, 1, 'r'); rect(rows, 4, 19, 8, 1, 'r');
    rect(rows, 4, 5, 1, 15, 'r'); rect(rows, 11, 5, 1, 15, 'r');
    rect(rows, 6, 8, 4, 9, 'Y');
    setPx(rows, 7, 20, 'g'); setPx(rows, 8, 20, 'g');
    return { w: 16, h: 48, rows: rows, pal: { S: '#969ca4', D: '#5d6266', d: '#787e86', R: '#c03a30', r: '#8c2b23', Y: '#ffd970', g: '#c9a227' } };
  }
  // Giếng 32x30: mái ngói nhỏ có rãnh, hai cột gỗ, dây thừng và gầu nước,
  // thành giếng bằng đá có đường vữa và miệng nước tối.
  function makeWell() {
    var rows = grid(32, 30, '.');
    rect(rows, 10, 0, 12, 1, 'D');
    rect(rows, 7, 1, 18, 1, 'R'); rect(rows, 5, 2, 22, 1, 'R');
    rect(rows, 3, 3, 26, 1, 'R'); rect(rows, 3, 4, 26, 1, 'r');
    for (var x = 4; x < 29; x += 4) { setPx(rows, x, 2, 'r'); setPx(rows, x, 3, 'r'); }
    rect(rows, 4, 5, 3, 13, 'T'); rect(rows, 6, 5, 1, 13, 't');
    rect(rows, 25, 5, 3, 13, 'T'); rect(rows, 27, 5, 1, 13, 't');
    rect(rows, 5, 9, 22, 2, 'T');
    rect(rows, 15, 11, 2, 5, 'H');
    rect(rows, 13, 15, 6, 4, 'T'); rect(rows, 14, 15, 4, 1, 'K'); rect(rows, 18, 15, 1, 4, 't');
    rect(rows, 3, 19, 26, 9, 's');
    rect(rows, 3, 19, 26, 1, 'S'); rect(rows, 3, 27, 26, 1, 'D');
    rect(rows, 8, 20, 16, 2, 'K');
    rect(rows, 3, 23, 26, 1, 'D');
    [8, 15, 22].forEach(function (vx) {
      setPx(rows, vx, 21, 'D'); setPx(rows, vx, 22, 'D');
      setPx(rows, vx + 4, 25, 'D'); setPx(rows, vx + 4, 26, 'D');
    });
    return { w: 32, h: 30, rows: rows, pal: { S: '#9aa0a3', s: '#82898e', D: '#5d6266', K: '#2e4256', T: '#6e5136', t: '#543e28', R: '#6a7f96', r: '#526a82', H: '#c9a959' } };
  }
  // Cọc gỗ luyện công 16x36: đầu rơm có dải vải đỏ, thanh ngang tay, dây buộc;
  // bản gãy: gốc lởm chởm, đầu rơm và thanh ngang rơi xuống đất.
  function makeDummy(broken) {
    var pal = { T: '#6e5136', t: '#543e28', H: '#d9b968', h: '#b28f42', R: '#a03c34', D: '#5d6266' };
    var rows = grid(16, 36, '.');
    if (broken) {
      rect(rows, 6, 24, 4, 10, 'T'); rect(rows, 9, 24, 1, 10, 't');
      setPx(rows, 6, 23, 'H'); setPx(rows, 8, 22, 'H'); setPx(rows, 9, 23, 'T'); setPx(rows, 7, 23, 't');
      rect(rows, 3, 33, 10, 2, 'T');
      rect(rows, 10, 28, 5, 4, 'H'); rect(rows, 11, 27, 3, 1, 'H');
      rect(rows, 10, 30, 5, 1, 'h'); setPx(rows, 12, 29, 'R');
      rect(rows, 1, 31, 5, 2, 'T'); setPx(rows, 1, 30, 'T');
      return { w: 16, h: 36, rows: rows, pal: pal };
    }
    rect(rows, 4, 1, 8, 9, 'H'); rect(rows, 5, 0, 6, 1, 'H');
    rect(rows, 4, 8, 8, 2, 'h'); rect(rows, 4, 5, 8, 1, 'R');
    rect(rows, 6, 10, 4, 24, 'T'); rect(rows, 9, 10, 1, 24, 't');
    rect(rows, 2, 12, 12, 3, 'T'); rect(rows, 2, 14, 12, 1, 't');
    rect(rows, 6, 19, 4, 1, 'H'); rect(rows, 6, 27, 4, 1, 'H');
    rect(rows, 3, 33, 10, 2, 'T'); setPx(rows, 4, 34, 'D'); setPx(rows, 11, 34, 'D');
    return { w: 16, h: 36, rows: rows, pal: pal };
  }
  // Nhà: mái ngói có gờ nóc sáng, hàng ngói tối và hai đầu vểnh; tường có khung gỗ,
  // cửa có tay nắm vòng vàng, cửa sổ song gỗ sáng đèn, chân tường là bệ đá.
  function makeHouse(w, h, roof, wall) {
    var rows = grid(w, h, '.');
    var roofH = Math.floor(h * 0.44);
    var y, x;
    for (y = 0; y < roofH; y++) {
      var inset = Math.max(0, Math.floor((roofH - y) * 0.32) - 2);
      for (x = inset; x < w - inset; x++) {
        var ch = 'R';
        if (y < 2) ch = 'L';                    // gờ nóc
        else if (y % 3 === 2) ch = 'r';         // hàng ngói
        else if ((x + y) % 5 === 0) ch = 'r';   // rãnh ngói
        setPx(rows, x, y, ch);
      }
    }
    // Đầu mái vểnh: hai góc mái dưới cùng sáng lên một nấc.
    setPx(rows, 0, roofH - 2, 'R'); setPx(rows, w - 1, roofH - 2, 'R');
    setPx(rows, 0, roofH - 1, 'R'); setPx(rows, w - 1, roofH - 1, 'R');
    // Tường và bệ đá
    rect(rows, 4, roofH, w - 8, h - roofH - 3, 'W');
    rect(rows, 4, roofH, w - 8, 2, 'w');                       // bóng dưới mái hiên
    rect(rows, 3, h - 3, w - 6, 3, 'S');
    for (x = 4; x < w - 4; x++) if (hashN(x, 1, 29) < 30) setPx(rows, x, h - 2, 's');
    // Khung gỗ: hai cột biên và xà ngang
    rect(rows, 4, roofH, 1, h - roofH - 3, 'T'); rect(rows, w - 5, roofH, 1, h - roofH - 3, 'T');
    rect(rows, 4, roofH + 3, w - 8, 1, 'T');
    // Cửa chính giữa: hai cánh, khe giữa, tay nắm vòng vàng, ngưỡng cửa đá
    var doorW = 7, doorH = 12, doorX = Math.floor(w / 2) - 3, doorY = h - 3 - doorH;
    rect(rows, doorX - 1, doorY - 1, doorW + 2, 1, 'T');
    rect(rows, doorX, doorY, doorW, doorH, 'D');
    rect(rows, doorX + 3, doorY, 1, doorH, 'd');
    rect(rows, doorX + 1, doorY + 2, 2, 4, 'd'); rect(rows, doorX + 4, doorY + 2, 2, 4, 'd');
    setPx(rows, doorX + 2, doorY + 7, 'g'); setPx(rows, doorX + 4, doorY + 7, 'g');
    // Hai cửa sổ song gỗ sáng đèn
    [[8, roofH + 5], [w - 14, roofH + 5]].forEach(function (wp) {
      rect(rows, wp[0], wp[1], 6, 6, 'T');
      rect(rows, wp[0] + 1, wp[1] + 1, 4, 4, 'Y');
      rect(rows, wp[0] + 2, wp[1] + 1, 1, 4, 'y'); rect(rows, wp[0] + 1, wp[1] + 2, 4, 1, 'y');
    });
    return {
      w: w, h: h, rows: rows, pal: {
        R: roof, r: shade(roof), L: lighten(roof), W: wall, w: shade(wall),
        T: '#5d422a', D: '#4a3520', d: '#382818', Y: '#f6cf6a', y: '#7a5a36',
        S: '#8d9299', s: '#6f747a', g: '#c9a227'
      }
    };
  }
  function shade(hex) {
    var n = parseInt(hex.slice(1), 16);
    var r = Math.max(0, (n >> 16) - 28), g = Math.max(0, ((n >> 8) & 255) - 28), b = Math.max(0, (n & 255) - 28);
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
  }
  function lighten(hex) {
    var n = parseInt(hex.slice(1), 16);
    var r = Math.min(255, (n >> 16) + 30), g = Math.min(255, ((n >> 8) & 255) + 30), b = Math.min(255, (n & 255) + 30);
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
  }

  function cloneWithPal(src, pal) { return { w: src.w, h: src.h, rows: src.rows, pal: pal }; }
  var houseBase = makeHouse(64, 62, '#54606e', '#e6dcc4');
  var houseBigBase = makeHouse(86, 76, '#6e3f36', '#eadfc6');
  var PROP_SPRITES = {
    tree: makeTree(),
    pine: makePine(),
    stele: makeStele(),
    lantern: makeLantern(),
    well: makeWell(),
    dummy: makeDummy(false),
    dummy_broken: makeDummy(true),
    house: houseBase,
    house_big: houseBigBase,
    house_b: cloneWithPal(houseBase, {
      R: '#8b6239', r: '#6f4c2c', L: '#a67c4a', W: '#d9c096', w: '#bfa77e',
      T: '#4a3018', D: '#5d3d20', d: '#452c14', Y: '#ffd97a', y: '#8a6238',
      S: '#8a7a68', s: '#6e5f4f', g: '#d9a441'
    }),
    house_c: cloneWithPal(houseBase, {
      R: '#6b6f75', r: '#54575c', L: '#858a91', W: '#c9c9c4', w: '#a9a9a2',
      T: '#4a4a4a', D: '#5a5a5a', d: '#3f3f3f', Y: '#f6cf6a', y: '#6e6e6e',
      S: '#7d7f82', s: '#5f6163', g: '#b8b0a0'
    }),
    inn: cloneWithPal(houseBigBase, {
      R: '#4a6741', r: '#37502f', L: '#5f8554', W: '#d8d0b0', w: '#bab090',
      T: '#3d2f1a', D: '#4a3520', d: '#332414', Y: '#ffe98a', y: '#7a8a4a',
      S: '#8d9299', s: '#6f747a', g: '#e8c84a'
    })
  };

  var SPR = { BODY: BODY, LOOKS: LOOKS, charSprite: charSprite, PROP_SPRITES: PROP_SPRITES, mirror: mirror };
  global.VSLC_SPRITES = SPR;
  if (typeof module !== 'undefined' && module.exports) module.exports = SPR;
})(typeof window !== 'undefined' ? window : globalThis);
