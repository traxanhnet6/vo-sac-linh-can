/* Nhạc nền + tiếng động môi trường của game Vô Sắc Linh Căn — đợt
   "Bản đồ mượt + Ngày đêm" (lệnh Bui 13:48 ngày 2026-11-01: thêm nhạc nền
   theo bản đồ, biến thể đêm dịu hơn, crossfade khi chuyển cảnh/pha; tiếng
   động môi trường: chim ngày / dế đêm, suối theo khoảng cách, gió, chợ).
   Các lớp tiếng động và giai điệu theo bản đồ tổng hợp bằng WebAudio
   trong mã, đúng kiến trúc âm hiệu ứng hiện tại của dự án (js/game.js
   beep/sfx*). NGOẠI LỆ DUY NHẤT, có khai báo: lớp NHẠC NỀN có thêm
   "khe nhạc tệp" từ đợt tích hợp nhạc nền đã chọn (Bui chốt bản
   "tiên khí hùng vĩ" 16:51 ngày 2026-11-04) — một tệp OGG phát vòng
   qua AudioBufferSourceNode làm nhạc nền chính, giai điệu thủ tục
   theo bản đồ chỉ còn là dự phòng khi tệp nạp lỗi; xem hằng số
   FILE_MUSIC_* và docs/music-integration-report.md.
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
  /* Gói phụ 6 (Bui báo chơi thật 10:12 ngày 2026-11-02: "sau khi nói
     chuyện xong, tiếng suối chảy rất ồn"; bản ghi của Bui đo được lớp
     ồn nước LIÊN TỤC RMS khoảng −29,5 dB không ngắt, không nghe thấy
     nhạc): các lớp ồn liên tục (suối/gió/chợ) vốn đặt trần 0,55/0,30/
     0,35 nhân âm lượng môi trường 0,6 = 0,33/0,18/0,21 tuyệt đối PHÁT
     KHÔNG NGẮT, trong khi nốt nhạc chỉ ở mức 0,055–0,075 trước bus và
     có khoảng lặng — ồn nền nuốt hẳn nhạc, và cú thả nén sau thoại
     (×0,45 -> ×1) làm nó nổi lên đột ngột. Hạ cả ba lớp xuống vai trò
     nền êm dưới nhạc: suối 0,55 -> 0,20 (tuyệt đối tối đa 0,12 ở mức
     mặc định), chợ 0,35 -> 0,16, gió 0,30 -> 0,15. */
  var STREAM_MAX = 0.20;          // trần lớp suối (x âm lượng môi trường x khoảng cách)
  var WIND_MAX = 0.15;            // trần lớp gió
  var MARKET_MAX = 0.16;          // trần lớp chợ lao xao
  /* Đợt sửa TIẾNG ỒN MÔI TRƯỜNG (Bui chơi thật trên bản live, 11:49
     ngày 2026-11-04: "Ở Cô Châu Thành, Thanh Vân Tông các tiếng ồn
     quá nhiều"). Đo bằng chính module (mặc định ambVol 0,6): ở thành,
     lớp chợ chạy KHÔNG NGẮT ở mức tuyệt đối 0,096 TRÊN MỌI Ô của bản
     đồ 104x78 (không hề giảm theo khoảng cách tới chợ), cả ngày lẫn
     chạng vạng; ở tông, gió 0,09 phủ toàn bản đồ 124x92 cộng suối
     tiệm cận tối đa 0,12 thành tổng 0,21 tại mép nước. Cả hai đều CAO
     HƠN đỉnh nốt giai điệu của chính nhạc nền (0,075 x musicVol 0,7 =
     0,0525) — nền ồn ngồi trên nhạc nên nghe thành "ồn", và hai bản
     đồ này không có lấy một ô yên tĩnh vào ban ngày (đối chiếu trấn:
     giữa trấn tổng liên tục = 0, chỉ chim rời rạc đỉnh 0,03). Cả hai
     bản đồ đều KHÔNG có lớp rời rạc nào (hồ sơ AMBIENCE_DEFS chỉ có
     chợ, resp. suối+gió) nên phần "ồn" là 100% ở các lớp liên tục.
     Cách sửa của đợt này (chỉ hai bản đồ bị phàn nàn):
     - AMB_MAP_SCALE: hệ số riêng theo bản đồ nhân vào cả ba lớp liên
       tục: hai bản đồ này x 0,5 (thành còn 0,048; tông gió còn 0,045,
       suối tối đa còn 0,06, tổng tại mép nước còn 0,105).
     - MARKET_DUSK_FACTOR: chợ chạng vạng x 0,6 thêm nữa (thành về
       chiều lắng xuống): thành chạng vạng còn 0,0288.
     - AMB_CONT_SUM_MAX: trần CỨNG cho TỔNG ba lớp liên tục (đơn vị
       tương đối trước khi nhân bus): vượt trần thì co đều tỉ lệ.
       Giá trị 0,35 bằng đúng tổng tối đa hiện hữu (suối 0,20 + gió
       0,15 ở đường mòn/tông trước đợt này) — hôm nay nó không tự ý
       đổi mức của bất kỳ bản đồ nào ngoài hai bản đồ trên, nhưng từ
       nay không một thay đổi hồ sơ/hằng số nào đẩy được nền ồn liên
       tục của một bản đồ qua mức đó. */
  var AMB_MAP_SCALE = { co_chau: 0.5, thanh_van_tong: 0.5 };
  var MARKET_DUSK_FACTOR = 0.6;   // chợ ở chạng vạng lắng còn x 0,6
  var AMB_CONT_SUM_MAX = 0.35;    // trần tổng ba lớp ồn liên tục (tương đối, trước bus)
  /* KHE NHẠC TỆP (đợt tích hợp nhạc nền đã chọn, 2026-11-04): Bui
     chốt bản "tiên khí hùng vĩ" (~/workspace/game-music/BAO-CAO-TIEN-
     KHI.md) là NHẠC NỀN CHÍNH của game. Tệp OGG (vòng lặp đã khâu
     liền ở mức mẫu, dùng OGG thay MP3 vì MP3 có đệm mã hoá ở đầu tệp
     làm lệch vòng) phát qua AudioBufferSourceNode loop = true, qua
     một gain bao riêng (FILE_MUSIC_GAIN) rồi vào ĐÚNG bus nhạc hiện
     có — nên mọi hành vi bus giữ nguyên: âm lượng/công tắc nhạc trong
     cài đặt, duck khi thoại (DUCK_MUSIC), hạ nhạc trận boss
     (BOSS_MUSIC_FACTOR). Giai điệu thủ tục theo bản đồ (hệ deck) chỉ
     còn là DỰ PHÒNG: chạy trong lúc tệp đang nạp và chạy hẳn khi tệp
     nạp lỗi/không giải mã được; tệp sẵn sàng thì crossfade
     CROSSFADE_SEC sang tệp (deck mờ xuống, tệp mờ lên) và bộ lập lịch
     ngừng lên nốt cho deck. Gain khe: hồ sơ cả hai bản nhạc đều dặn
     đặt thấp hơn lớp tổng hợp khoảng 3 dB ở lần gắn đầu vì RMS của
     tệp cao hơn hẳn nốt thủ tục (đoạn đầy khoảng −16 dBFS, đỉnh
     −1 dBFS); FILE_MUSIC_GAIN_DB = −3 là giá trị KHỞI ĐẦU theo ghi
     chú đó, chốt lại bằng tai khi nghe thử trong game thật.
     Bản nhạc là MỘT bản cho mọi bản đồ: ở chế độ tệp, setScene chỉ
     còn đổi lớp môi trường theo bản đồ/pha — nhạc không crossfade,
     không có biến thể đêm riêng (khai báo trong báo cáo đợt). */
  var FILE_MUSIC_URL = 'assets/music/nhac-tien-khi.ogg';
  var FILE_MUSIC_GAIN_DB = -3;              // gain khởi đầu của khe nhạc tệp (dB)
  var FILE_MUSIC_GAIN = 0.7079457843841379; // = 10^(FILE_MUSIC_GAIN_DB/20)
  var PAD_LEVEL = 0.055;          // gain mỗi nốt đệm hợp âm (trước deck x bus)
  var MOTIF_LEVEL = 0.075;        // gain nốt giai điệu
  var BASS_LEVEL = 0.06;          // gain nốt trầm đầu nhịp
  var TICK_LEVEL = 0.012;         // gain nhịp nền — rất nhẹ
  var CHIRP_LEVEL = 0.05;         // gain tiếng chim/dế rời rạc
  /* Đợt bí cảnh: các lớp rời rạc mới — giọt nước, tiếng đá, tiếng hú,
     vệt kiếm khí — đều là oscillator rời rạc qua bus môi trường/nhạc
     (không phải lớp ồn vòng lặp), gain rất khẽ như họ chim/dế. */
  var DRIP_LEVEL = 0.04;         // gain một giọt nước (Thủy Liêm Động)
  var STONE_LEVEL = 0.035;       // gain một tiếng đá gõ (Tàn Tích Dưới Tháp)
  var HOWL_LEVEL = 0.03;         // gain một tiếng gió hú (Hồi Phong Cổ Mộ)
  var SWORDQI_LEVEL = 0.03;      // gain một vệt kiếm khí đầu nhịp (Kiếm Trủng)
  var NIGHT_TEMPO_FACTOR = 0.88;  // biến thể đêm: chậm lại
  var NIGHT_PAD_FACTOR = 0.7;     // biến thể đêm: đệm mềm hơn
  var NIGHT_MOTIF_FACTOR = 0.8;   // biến thể đêm: giai điệu khẽ hơn
  var CLIMAX_EVERY_CYCLES = 4;    // thanh_van_tong: mỗi 4 vòng, vòng cuối có cao trào nhẹ
  var STEPS_PER_BAR = 8;          // 8 bước восьмым mỗi nhịp (ô nhịp = 4 phách)
  var MOTIF_STEPS = 16;           // mô-típ dài 2 nhịp, lặp theo vòng 4 nhịp hợp âm

  /* Đợt tích hợp BÍ CẢNH + HỆ CÀY (làn F): 5 bản đồ bí cảnh nối sau 8 bản
     đồ cũ — thứ tự theo docs/bicanh-prep/bicanh-design.md mục 2 (tầng sâu
     của tháp tính riêng một map). Lưu ý: các map này chờ làn A đăng ký
     vào MAPS của js/logic.js; cho tới lúc đó test-music.js sẽ đỏ ở các
     khẳng định đối chiếu MAPS (MAP_IDS khớp tuyệt đối + cờ stream khớp
     ô nước) — đó là điểm chờ làn A, không phải lỗi module này. */
  /* Đợt gộp THẬP VẠN ĐẠI SƠN vào cây chính (2026-11-06): khu tách 5 bản
     đồ con theo vành đai cảnh giới — MAP_IDS 15 -> 20, thêm ở CUỐI danh
     sách thap_van_dai_son (vành Luyện Khí, giữ id + neo cổng tông môn)
     và 4 bản đồ con tvds_truc_co / tvds_kim_dan / tvds_nguyen_anh /
     tvds_hoa_than. Đăng ký lấy HỢP NHẤT từ cây đợt vào music.js hiện
     tại của cây chính: giữ nguyên cơ chế nhạc nền tệp (FILE_MUSIC_URL)
     và mọi đăng ký đã live; 5 TRACK + 5 AMBIENCE_DEFS của khu ở dưới. */
  var MAP_IDS = ['tran', 'duong_mon', 'co_chau', 'kiem_trac_thap', 'thap_noi', 'thanh_van_tong', 'hb_valley', 'thien_co_lau', 'bc_thuyliem', 'bc_tapha', 'bc_tapsau', 'bc_kiemtrung', 'bc_hoiphong_mo', 'dai_dau_kiem', 'thang_long_dai', 'thap_van_dai_son', 'tvds_truc_co', 'tvds_kim_dan', 'tvds_nguyen_anh', 'tvds_hoa_than'];
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
    },
    hb_valley: { /* Thung Lũng Hồi Phong — thung lũng có suối: thứ ngũ cung trầm, đệm 3 nốt */
      root: 57, scale: SCALE_MIN_PENT, bpm: 76, density: 0.26,
      padWave: 'triangle', motifWave: 'sine',
      chords: [[33, 45, 52], [31, 43, 50], [36, 48, 55], [29, 41, 48]],
      motif: [2, -1, -1, 4, -1, -1, 1, -1, 0, -1, -1, -1, 2, -1, -1, -1]
    },
    thien_co_lau: { /* Tĩnh Quan Lâu — lầu kín: thấp, thưa và trầm nhất, đệm thấp 3 nốt */
      root: 50, scale: SCALE_MIN_PENT, bpm: 46, density: 0.04,
      padWave: 'sine', motifWave: 'sine',
      chords: [[26, 38, 45], [24, 36, 43], [29, 41, 48], [27, 39, 46]],
      motif: [2, -1, -1, -1, -1, -1, -1, -1, 1, -1, -1, -1, -1, -1, -1, -1]
    },
    /* ---- 5 bí cảnh (đợt tích hợp BÍ CẢNH + HỆ CÀY, theo
       docs/bicanh-prep/bicanh-design.md mục 3 + mục 5) ---- */
    bc_thuyliem: { /* Thủy Liêm Động — biến thể DỊU của duong_mon: cùng
      thang Dor + vòng hợp âm đường mòn để nhận ra gốc, nhưng chậm hơn
      (82 -> 72 bpm), nhịp nền thưa hơn (0,22 -> 0,16), mô-típ thưa hơn
      (6 -> 5 nốt, bỏ nốt ở bước 5). Tiếng nước riêng xem AMBIENCE_DEFS
      (giọt rời rạc + suối tiệm cận), không gộp vào một lớp ồn. */
      root: 62, scale: SCALE_DOR_PENT, bpm: 72, density: 0.16,
      padWave: 'triangle', motifWave: 'sine',
      chords: [[50, 53, 57], [46, 50, 53], [53, 57, 60], [48, 52, 55]],
      motif: [7, -1, -1, 5, -1, -1, -1, -1, 5, -1, 7, -1, -1, -1, 2, -1]
    },
    bc_tapha: { /* Tàn Tích Dưới Tháp, Tầng Ngoài — biến thể TRẦM của
      thap_noi: gốc hạ 2 nửa cung (52 -> 50), vòng hợp âm tháp hạ theo,
      nhịp chậm hơn (50 -> 48 bpm), mô-típ 3 nốt (thêm nốt chốt thấp ở
      bước 12 so với 2 nốt của tháp) để tầng sâu còn chỗ thưa hơn nữa. */
      root: 50, scale: SCALE_MIN_PENT, bpm: 48, density: 0.05,
      padWave: 'sine', motifWave: 'sine',
      chords: [[38, 41, 45], [34, 38, 41], [39, 43, 46], [36, 40, 43]],
      motif: [2, -1, -1, -1, -1, -1, -1, -1, 1, -1, -1, -1, 0, -1, -1, -1]
    },
    bc_tapsau: { /* Tàn Tích Dưới Tháp, Tầng Sâu — cùng biến thể trầm của
      thap_noi nhưng THƯA NỐT HƠN tầng ngoài: gốc hạ thêm (50 -> 48),
      chậm hơn (48 -> 46 bpm), nhịp nền thưa hơn (0,05 -> 0,03), mô-típ
      chỉ còn 2 nốt và nốt thứ hai lùi tới bước 12 (tầng ngoài: 3 nốt,
      nốt thứ hai ở bước 8). */
      root: 48, scale: SCALE_MIN_PENT, bpm: 46, density: 0.03,
      padWave: 'sine', motifWave: 'sine',
      chords: [[36, 39, 43], [32, 36, 39], [37, 41, 44], [34, 38, 41]],
      motif: [2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 1, -1, -1, -1]
    },
    bc_kiemtrung: { /* Kiếm Trủng Sau Núi — biến thể NHỊP CHẬM của
      thanh_van_tong: giữ đệm rộng 5 nốt + mô-típ đi lên của tông để
      nhận ra gốc, nhưng chậm hẳn (86 -> 68 bpm), nhịp nền thưa hơn
      (0,40 -> 0,28). Kiếm khí theo nhịp: mỗi đầu nhịp (inBar === 0)
      scheduleDeckStep() gọi scheduleSwordQi() — xem dưới. */
      root: 60, scale: SCALE_MAJ_PENT, bpm: 68, density: 0.28,
      padWave: 'triangle', motifWave: 'triangle',
      chords: [[36, 48, 52, 55, 64], [33, 45, 48, 52, 60], [29, 41, 45, 48, 57], [31, 43, 47, 50, 59]],
      motif: [0, -1, 2, -1, 4, -1, 5, 7, -1, 5, 4, -1, 2, -1, 1, -1]
    },
    dai_dau_kiem: { /* Đài Đấu Kiếm Thanh Vân (Mục F đợt vá 2026-11-02)
      — biến thể CĂNG của thanh_van_tong: giữ đệm rộng 5 nốt + mô-típ đi
      lên của tông để nhận ra gốc, nhưng nhanh hơn (86 -> 96 bpm) và
      nhịp nền dày hơn (0,40 -> 0,52) cho không khí tỉ thí. */
      root: 60, scale: SCALE_MAJ_PENT, bpm: 96, density: 0.52,
      padWave: 'triangle', motifWave: 'triangle',
      chords: [[36, 48, 52, 55, 64], [33, 45, 48, 52, 60], [29, 41, 45, 48, 57], [31, 43, 47, 50, 59]],
      motif: [0, -1, 2, -1, 4, -1, 5, 7, -1, 5, 4, -1, 2, -1, 1, -1]
    },
    thang_long_dai: { /* Đài Thăng Long trên đỉnh núi (đợt tách bản đồ
      riêng 2026-11-05) — biến thể HÙNG VĨ của thanh_van_tong: giữ đệm
      rộng 5 nốt + mô-típ đi lên của tông, nhưng CHẬM và THƯA hơn hẳn
      (86 -> 72 bpm, 0,40 -> 0,30) cho không khí đỉnh cao chạm mây,
      trang nghiêm trước trận thử kiếm. */
      root: 60, scale: SCALE_MAJ_PENT, bpm: 72, density: 0.30,
      padWave: 'triangle', motifWave: 'triangle',
      chords: [[36, 48, 52, 55, 64], [33, 45, 48, 52, 60], [29, 41, 45, 48, 57], [31, 43, 47, 50, 59]],
      motif: [0, -1, 2, -1, 4, -1, 5, 7, -1, 5, 4, -1, 2, -1, 1, -1]
    },
    bc_hoiphong_mo: { /* Hồi Phong Cổ Mộ — biến thể TRẦM của hb_valley:
      gốc hạ 4 nửa cung (57 -> 53), vòng hợp âm thung lũng hạ theo,
      chậm hơn (76 -> 62 bpm), nhịp nền thưa hơn (0,26 -> 0,18), mô-típ
      thưa hơn (5 -> 3 nốt). Gió hú + hạt oán khí tối xem AMBIENCE_DEFS
      và docs/effects-catalog.md mục 9 (hạt là lớp hình của game.js). */
      root: 53, scale: SCALE_MIN_PENT, bpm: 62, density: 0.18,
      padWave: 'triangle', motifWave: 'sine',
      chords: [[29, 41, 48], [27, 39, 46], [32, 44, 51], [25, 37, 44]],
      motif: [2, -1, -1, -1, -1, -1, 1, -1, 0, -1, -1, -1, -1, -1, -1, -1]
    },
    thap_van_dai_son: { /* Thập Vạn Đại Sơn (đợt bản đồ 2026-11-05) —
      dãy núi hoang dã cấp cao: cùng họ ngũ cung thứ trầm của Hồi Phong
      nhưng chậm và thưa hơn (76 -> 64 bpm, 0,26 -> 0,18) cho cảm giác
      cao + rộng + lạnh; đệm 3 nốt trầm, mô-típ leo dốc thưa 4 nốt. */
      root: 55, scale: SCALE_MIN_PENT, bpm: 64, density: 0.18,
      padWave: 'triangle', motifWave: 'sine',
      chords: [[31, 43, 50], [29, 41, 48], [34, 46, 53], [36, 48, 55]],
      motif: [0, -1, -1, 2, -1, -1, 4, -1, -1, -1, 5, -1, -1, 4, -1, -1]
    },
    /* Tái cấu trúc 2026-11-05: bốn bản đồ con của khu dùng ĐÚNG track
       của bản đồ mẹ ở trên (cùng dãy núi, một tiếng nói âm nhạc). */
    tvds_truc_co: {
      root: 55, scale: SCALE_MIN_PENT, bpm: 64, density: 0.18,
      padWave: 'triangle', motifWave: 'sine',
      chords: [[31, 43, 50], [29, 41, 48], [34, 46, 53], [36, 48, 55]],
      motif: [0, -1, -1, 2, -1, -1, 4, -1, -1, -1, 5, -1, -1, 4, -1, -1]
    },
    tvds_kim_dan: {
      root: 55, scale: SCALE_MIN_PENT, bpm: 64, density: 0.18,
      padWave: 'triangle', motifWave: 'sine',
      chords: [[31, 43, 50], [29, 41, 48], [34, 46, 53], [36, 48, 55]],
      motif: [0, -1, -1, 2, -1, -1, 4, -1, -1, -1, 5, -1, -1, 4, -1, -1]
    },
    tvds_nguyen_anh: {
      root: 55, scale: SCALE_MIN_PENT, bpm: 64, density: 0.18,
      padWave: 'triangle', motifWave: 'sine',
      chords: [[31, 43, 50], [29, 41, 48], [34, 46, 53], [36, 48, 55]],
      motif: [0, -1, -1, 2, -1, -1, 4, -1, -1, -1, 5, -1, -1, 4, -1, -1]
    },
    tvds_hoa_than: {
      root: 55, scale: SCALE_MIN_PENT, bpm: 64, density: 0.18,
      padWave: 'triangle', motifWave: 'sine',
      chords: [[31, 43, 50], [29, 41, 48], [34, 46, 53], [36, 48, 55]],
      motif: [0, -1, -1, 2, -1, -1, 4, -1, -1, -1, 5, -1, -1, 4, -1, -1]
    }
  };
  /* Lớp môi trường theo bản đồ — tra dữ kiện bản đồ trong js/logic.js:
     ô nước 'W' chỉ có ở tran (ao đông bắc, 7 ô) và duong_mon (suối hàng
     36–37 + cầu, 186 ô); chợ chỉ ở co_chau (quảng trường chợ); rừng ở
     duong_mon, tông môn ở trên cao — hai nơi có gió. Tháp/sảnh: tĩnh lặng
     trang nghiêm, không lớp môi trường (chỉ nhạc).
     Đợt bí cảnh: ba cờ rời rạc mới — drips (giọt nước), stone (tiếng
     đá), howl (tiếng hú) — KHÔNG phải lớp ồn vòng lặp: chúng được lập
     lịch rời rạc như chim/dế trong schedulerTick(), qua bus môi trường.
     LỰA CHỌN CHO THỦY LIÊM (ghi rõ theo giao việc): KHÔNG dùng lại cờ
     stream một cách máy móc cho tiếng nhỏ giọt. Thiết kế đòi cả hai:
     "nước nhỏ giọt + suối gần" (mục 5) — nên động có CẢ giọt rời rạc
     luôn bật trong hang (drips) VÀ lớp suối tiệm cận theo setProximity
     cho suối ngầm (stream, chờ làn A đặt ô 'W' cho suối ngầm trong
     lưới bc_thuyliem thì cờ stream mới khớp quy tắc stream-khớp-nước
     của test-music). Các hang/mộ/tháp khác không có chim/dế/chợ:
     trong hang kín, ngoài trời không lọt tiếng vào. Cổ Mộ: lớp gió
     (wind, nền ồn thấp) + tiếng hú rời rạc (howl) quét qua khe mộ —
     gió hú không thay thế lớp gió, nó nổi trên nền gió. */
  var AMBIENCE_DEFS = {
    tran: { birds: true, crickets: true, stream: true, wind: false, market: false, drips: false, stone: false, howl: false },
    duong_mon: { birds: true, crickets: true, stream: true, wind: true, market: false, drips: false, stone: false, howl: false },
    co_chau: { birds: false, crickets: false, stream: false, wind: false, market: true, drips: false, stone: false, howl: false },
    kiem_trac_thap: { birds: false, crickets: false, stream: false, wind: false, market: false, drips: false, stone: false, howl: false },
    thap_noi: { birds: false, crickets: false, stream: false, wind: false, market: false, drips: false, stone: false, howl: false },
    thanh_van_tong: { birds: false, crickets: false, stream: true, wind: true, market: false, drips: false, stone: false, howl: false }, // gói phụ 12: tông có thác + hồ thật ở sườn tây — tiếng nước chỉ nổi trong bán kính tiệm cận 7 ô quanh ô nước
    hb_valley: { birds: true, crickets: true, stream: true, wind: true, market: false, drips: false, stone: false, howl: false },
    thien_co_lau: { birds: false, crickets: false, stream: false, wind: false, market: false, drips: false, stone: false, howl: false },
    bc_thuyliem: { birds: false, crickets: false, stream: true, wind: false, market: false, drips: true, stone: false, howl: false },
    bc_tapha: { birds: false, crickets: false, stream: false, wind: false, market: false, drips: false, stone: true, howl: false },
    bc_tapsau: { birds: false, crickets: false, stream: false, wind: false, market: false, drips: false, stone: true, howl: false },
    bc_kiemtrung: { birds: false, crickets: false, stream: false, wind: false, market: false, drips: false, stone: false, howl: false },
    bc_hoiphong_mo: { birds: false, crickets: false, stream: false, wind: true, market: false, drips: false, stone: false, howl: true },
    dai_dau_kiem: { birds: false, crickets: false, stream: false, wind: true, market: false, drips: false, stone: false, howl: false }, // đài trên cao của tông: chỉ lớp gió như tông môn, không suối (đài không có ô nước)
    thang_long_dai: { birds: false, crickets: false, stream: false, wind: true, market: false, drips: false, stone: false, howl: false }, // đỉnh núi chạm mây: chỉ lớp gió cao sơn như đài đấu kiếm, không suối (đỉnh không có ô nước)
    thap_van_dai_son: { birds: true, crickets: true, stream: true, wind: true, market: false, drips: false, stone: false, howl: true }, // dãy núi hoang dã (đợt bản đồ 2026-11-05): chim + dế + suối Trường Khê thật trên lưới + gió núi + tiếng hú của bầy Sơn Lang
    // Tái cấu trúc 2026-11-05: ba vành giữa giữ nguyên bộ lớp của bản đồ mẹ (đều có suối thật trên lưới);
    // lõi Hóa Thần không ô nước, không chim/dế — chỉ gió núi + tiếng hú vọng từ xa.
    tvds_truc_co: { birds: true, crickets: true, stream: true, wind: true, market: false, drips: false, stone: false, howl: true },
    tvds_kim_dan: { birds: true, crickets: true, stream: true, wind: true, market: false, drips: false, stone: false, howl: true },
    tvds_nguyen_anh: { birds: true, crickets: true, stream: true, wind: true, market: false, drips: false, stone: false, howl: true },
    tvds_hoa_than: { birds: false, crickets: false, stream: false, wind: true, market: false, drips: false, stone: false, howl: true }
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
      market: def.market && (ph.bucket === 'day' || ph.bucket === 'dusk'),
      drips: !!def.drips,
      stone: !!def.stone,
      howl: !!def.howl
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
    boss: false, nextDrumAt: 0, scheduledDrums: 0, // chế độ trận boss (làn chạm trán): hạ nhạc + trống trận
    decks: [],            // [{variant, gainNode, gain, ramp, step, nextTime, active, seed}]
    lastCrossfade: null,  // {fromVariant, toVariant, durationSec, kind}
    timer: null,
    /* Khe nhạc tệp: status idle -> loading -> ready | error |
       unavailable (không có fetch/decodeAudioData thì unavailable
       ngay, xác định — môi trường kiểm thử Node rơi vào nhánh này
       nên hành vi thủ tục không đổi). buffer giữ qua stop() để khởi
       động lại không tải lại; gain/ramp là bao crossfade riêng của
       khe, cùng khuôn ramp của deck. fileLoader: bộ nạp tiêm từ
       kiểm thử (unlock(factory, loader)); mặc định null -> dùng
       defaultFileLoader (fetch + decodeAudioData của trình duyệt). */
    file: { status: 'idle', buffer: null, source: null, gainNode: null, gain: 0, ramp: null, active: false },
    fileLoader: null,
    noiseBuf: null, layers: null,   // {stream:{gain}, wind:{gain}, market:{gain}}
    nextBirdAt: 0, nextCricketAt: 0, rngState: 123456789,
    nextDripAt: 0, nextStoneAt: 0, nextHowlAt: 0,
    scheduledNotes: 0, scheduledChirps: 0,
    scheduledDrips: 0, scheduledStones: 0, scheduledHowls: 0, scheduledSwordQi: 0
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
  var BOSS_MUSIC_FACTOR = 0.5;   // nhạc nền trong trận boss hạ còn một nửa (thiết kế cảm giác cày, mục boss)
  function musicBusLevel() {
    if (!S.unlocked || !S.running || S.suspended) return 0;
    return (S.musicOn ? S.musicVol : 0) * (S.duck ? DUCK_MUSIC : 1) * (S.boss ? BOSS_MUSIC_FACTOR : 1);
  }
  function ambBusLevel() {
    if (!S.unlocked || !S.running || S.suspended) return 0;
    return (S.ambOn ? S.ambVol : 0) * (S.duck ? DUCK_AMBIENCE : 1);
  }
  function ambFlags() { return resolveAmbience(S.mapId, S.phase); }
  /* Hệ số môi trường riêng của bản đồ hiện tại (đợt tiếng ồn
     2026-11-04): bản đồ không có trong AMB_MAP_SCALE dùng 1. */
  function ambMapScale() {
    var s = AMB_MAP_SCALE[S.mapId];
    return (typeof s === 'number' && isFinite(s) && s > 0) ? Math.min(1, s) : 1;
  }
  /* Mức thuần của BA lớp ồn liên tục — nguồn sự thật duy nhất cho cả
     ba hàm *Level() bên dưới và cho applyGains(): mức tương đối của
     từng lớp (suối theo khoảng cách, chợ lắng ở chạng vạng) nhân hệ
     số riêng của bản đồ, rồi co đều tỉ lệ nếu TỔNG vượt trần cứng
     AMB_CONT_SUM_MAX, cuối cùng nhân mức bus môi trường. Suối lấy
     khoảng cách tới ô nước GẦN NHẤT (tích hợp musicProximity quét
     min) và clamp01 giữ trong trần — theo cấu trúc không thể cộng
     dồn nhiều nguồn nước qua trần. */
  function contLevels() {
    var f = ambFlags(), bus = ambBusLevel(), scale = ambMapScale();
    var s = f.stream ? clamp01(S.proximity, 0) * STREAM_MAX : 0;
    var w = f.wind ? WIND_MAX : 0;
    var m = f.market ? MARKET_MAX * (S.phase.bucket === 'dusk' ? MARKET_DUSK_FACTOR : 1) : 0;
    s *= scale; w *= scale; m *= scale;
    var sum = s + w + m;
    var k = sum > AMB_CONT_SUM_MAX ? AMB_CONT_SUM_MAX / sum : 1;
    return { stream: bus * s * k, wind: bus * w * k, market: bus * m * k };
  }
  function streamLevel() { return contLevels().stream; }
  function windLevel() { return contLevels().wind; }
  function marketLevel() { return contLevels().market; }

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
      if (d.gain <= 0.0001 && !d.ramp && (d.variant.id !== S.variantId || d.superseded)) {
        // Deck của biến thể cũ đã mờ hết -> dọn khỏi danh sách.
        // d.superseded: deck bị khe nhạc tệp thay thế (đợt tích hợp
        // nhạc tệp) — mờ hết thì dọn kể cả deck của biến thể hiện tại.
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
    if (fileActive()) return; // chế độ tệp: một bản nhạc cho mọi cảnh — trạng thái biến thể vẫn ghi ở trên, nhưng không dựng deck và không crossfade nhạc (chỉ lớp môi trường đổi theo cảnh qua applyGains)
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

  /* ================= Khe nhạc tệp (đợt tích hợp 2026-11-04) =================
     Máy trạng thái: idle -> loading -> ready (phát tệp, hệ deck im)
     hoặc -> error / unavailable (hệ deck thủ tục gánh hẳn, không thử
     lại trong phiên). Nạp bắt đầu ở unlock()/restartEngine(); trong
     lúc nạp, nhạc thủ tục phát bình thường nên không có khoảng lặng. */
  function fileActive() { return S.file.active && S.file.status === 'ready'; }
  /* Bộ nạp mặc định của trình duyệt: fetch -> decodeAudioData.
     Môi trường không có một trong hai (kiểm thử Node với ngữ cảnh
     giả) -> onErr('unavailable') NGAY, xác định, không chạm mạng. */
  function defaultFileLoader(url, ctx, onOk, onErr) {
    if (!ctx || typeof ctx.decodeAudioData !== 'function' || typeof fetch !== 'function') { onErr('unavailable'); return; }
    var done = false;
    function ok(buf) { if (!done) { done = true; onOk(buf); } }
    function bad(e) { if (!done) { done = true; onErr(e); } }
    fetch(url).then(function (r) {
      if (!r || !r.ok) throw new Error('http ' + (r && r.status));
      return r.arrayBuffer();
    }).then(function (ab) {
      var p = null;
      try { p = ctx.decodeAudioData(ab, ok, bad); } catch (e) { bad(e); return; }
      if (p && typeof p.then === 'function') p.then(ok, bad);
    }).then(null, bad);
  }
  function startFileLoad() {
    if (!S.ctx) return;
    if (S.file.status !== 'idle') return; // loading/ready: đang/đã có; error/unavailable: phiên này không thử lại
    S.file.status = 'loading';
    var loader = S.fileLoader || defaultFileLoader;
    try {
      loader(FILE_MUSIC_URL, S.ctx, function (buf) {
        if (!buf) { S.file.status = 'error'; return; }
        S.file.buffer = buf;
        S.file.status = 'ready';
        activateFileMusic();
      }, function (err) {
        S.file.status = (err === 'unavailable') ? 'unavailable' : 'error';
      });
    } catch (e) { S.file.status = 'error'; }
  }
  function startFileSource() {
    if (!S.ctx || !S.file.buffer || typeof S.ctx.createBufferSource !== 'function') return;
    stopFileSource();
    if (!S.file.gainNode) { S.file.gainNode = makeGain(); S.file.gainNode.connect(S.musicBus); }
    var src = S.ctx.createBufferSource();
    src.buffer = S.file.buffer;
    src.loop = true; // buffer đã khâu vòng liền ở mức mẫu — lặp nguyên buffer
    src.connect(S.file.gainNode);
    try { src.start(); } catch (e) {}
    S.file.source = src;
  }
  function stopFileSource() {
    if (S.file.source && typeof S.file.source.stop === 'function') { try { S.file.source.stop(); } catch (e) {} }
    S.file.source = null;
  }
  function startFileRamp(to, dur) {
    var t = nowSec();
    S.file.ramp = { from: S.file.gain, to: to, t0: t, dur: Math.max(0.01, dur) };
    if (S.file.gainNode) rampParam(S.file.gainNode.gain, to, t, dur);
  }
  /* Tiến bao gain của khe theo thời gian — cùng công thức nội suy
     tuyến tính của updateDeckGains, gọi từ schedulerTick. */
  function advanceFileGain() {
    if (!S.file.ramp) return;
    var p = (nowSec() - S.file.ramp.t0) / S.file.ramp.dur;
    if (p >= 1) { S.file.gain = S.file.ramp.to; S.file.ramp = null; }
    else S.file.gain = S.file.ramp.from + (S.file.ramp.to - S.file.ramp.from) * Math.max(0, p);
  }
  /* Tệp sẵn sàng (hoặc khởi động lại khi buffer còn): bật nguồn lặp,
     crossfade CROSSFADE_SEC — deck mờ xuống và bị đánh dấu thay thế,
     khe mờ lên FILE_MUSIC_GAIN — ghi vào lastCrossfade như một lần
     chuyển tuyến nhạc (kind 'fileMusic'). Máy đang dừng thì chỉ ghi
     trạng thái ready; lần restartEngine tới sẽ tự kích hoạt. */
  function activateFileMusic() {
    if (!S.ctx || !S.file.buffer || !S.running || S.file.active) return;
    S.file.active = true;
    startFileSource();
    for (var i = 0; i < S.decks.length; i++) { S.decks[i].superseded = true; startDeckRamp(S.decks[i], 0, CROSSFADE_SEC); }
    startFileRamp(FILE_MUSIC_GAIN, CROSSFADE_SEC);
    S.lastCrossfade = { fromVariant: S.variantId, toVariant: 'file', durationSec: CROSSFADE_SEC, kind: 'fileMusic' };
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
      // Kiếm Trủng: mỗi đầu nhịp thêm một vệt kiếm khí (âm quét cao
      // qua tuyến nhạc của deck, không qua bus môi trường).
      if (v.mapId === 'bc_kiemtrung') scheduleSwordQi(t, dest);
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
  /* Đợt bí cảnh — bốn tiếng rời rạc mới, cùng khuôn scheduleChirp
     (oscillator rời rạc, gain rất khẽ, lịch xác định qua rng()):
     giọt nước rơi, tiếng đá gõ, gió hú qua khe, vệt kiếm khí đầu nhịp.
     Giọt/đá/hú đi qua bus môi trường (chịu công tắc + âm lượng môi
     trường + duck như chim/dế); kiếm khí đi qua tuyến nhạc của deck
     (chịu nhạc nền) vì nó gắn với nhịp của vòng nhạc Kiếm Trủng. */
  function scheduleDrip(t) {
    if (!S.ctx) return;
    var o = S.ctx.createOscillator(), g = S.ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(1400 + rng() * 400, t);
    if (typeof o.frequency.exponentialRampToValueAtTime === 'function') o.frequency.exponentialRampToValueAtTime(650, t + 0.10);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(DRIP_LEVEL, t + 0.015);
    g.gain.linearRampToValueAtTime(0.0001, t + 0.14);
    o.connect(g); g.connect(S.ambBus);
    o.start(t); o.stop(t + 0.17);
    S.scheduledDrips++;
  }
  function scheduleStone(t) {
    if (!S.ctx) return;
    var o = S.ctx.createOscillator(), g = S.ctx.createGain();
    o.type = 'sine'; o.frequency.value = 170;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(STONE_LEVEL, t + 0.01);
    g.gain.linearRampToValueAtTime(0.0001, t + 0.09);
    o.connect(g); g.connect(S.ambBus);
    o.start(t); o.stop(t + 0.12);
    S.scheduledStones++;
  }
  function scheduleHowl(t) {
    if (!S.ctx) return;
    var o = S.ctx.createOscillator(), g = S.ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(300, t);
    if (typeof o.frequency.exponentialRampToValueAtTime === 'function') {
      o.frequency.exponentialRampToValueAtTime(520, t + 0.6);
      o.frequency.exponentialRampToValueAtTime(300, t + 1.2);
    }
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(HOWL_LEVEL, t + 0.35);
    g.gain.linearRampToValueAtTime(0.0001, t + 1.2);
    o.connect(g); g.connect(S.ambBus);
    o.start(t); o.stop(t + 1.25);
    S.scheduledHowls++;
  }
  function scheduleSwordQi(t, dest) {
    if (!S.ctx) return;
    var o = S.ctx.createOscillator(), g = S.ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(1900, t);
    if (typeof o.frequency.exponentialRampToValueAtTime === 'function') o.frequency.exponentialRampToValueAtTime(2800, t + 0.18);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(SWORDQI_LEVEL, t + 0.02);
    g.gain.linearRampToValueAtTime(0.0001, t + 0.25);
    o.connect(g); g.connect(dest || S.musicBus);
    o.start(t); o.stop(t + 0.3);
    S.scheduledSwordQi++;
  }
  /* Trống trận boss: một tiếng trống trầm mỗi giây (60 nhịp/phút) vào
     tuyến nhạc — sine rơi 64 -> 40 Hz, biên độ vừa phải để nằm DƯỚI nhạc
     đã hạ một nửa. Chỉ chạy khi chế độ boss bật và nhạc đang bật. */
  function scheduleDrum(t) {
    if (!S.ctx || !S.musicBus) return;
    var o = S.ctx.createOscillator(), g = S.ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(64, t);
    o.frequency.exponentialRampToValueAtTime(40, t + 0.28);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.22, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.34);
    o.connect(g); g.connect(S.musicBus);
    o.start(t); o.stop(t + 0.4);
    S.scheduledDrums++;
  }
  function schedulerTick() {
    if (!S.ctx || !S.running || S.suspended) return;
    updateDeckGains();
    advanceFileGain();
    var horizon = nowSec() + SCHED_LOOKAHEAD_SEC;
    // Chế độ tệp: bộ lập lịch KHÔNG lên nốt cho deck nữa (nguồn lặp
    // của khe tự phát qua bus nhạc). Trống trận boss ở dưới vẫn chạy
    // — nó là tuyến riêng qua bus, không thuộc hệ deck.
    if (!fileActive()) {
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
    }
    // Trống trận boss 60 nhịp/phút khi chế độ boss đang bật.
    if (S.boss && S.musicOn) {
      var td = nowSec();
      if (S.nextDrumAt <= 0) S.nextDrumAt = td + 0.05;
      while (S.nextDrumAt < horizon) { scheduleDrum(S.nextDrumAt); S.nextDrumAt += 1.0; }
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
    // Môi trường rời rạc của bí cảnh: giọt nước (Thủy Liêm), tiếng đá
    // (Tàn Tích hai tầng), gió hú (Cổ Mộ) — cùng khuôn lịch chim/dế,
    // chỉ khác chu kỳ: giọt mau, đá thưa, hú thưa hơn nữa.
    if (f.drips && S.ambOn) {
      if (S.nextDripAt <= 0) S.nextDripAt = t + 0.5;
      if (t >= S.nextDripAt) { scheduleDrip(t + 0.02); S.nextDripAt = t + 0.9 + rng() * 1.3; }
    }
    if (f.stone && S.ambOn) {
      if (S.nextStoneAt <= 0) S.nextStoneAt = t + 1.0;
      if (t >= S.nextStoneAt) { scheduleStone(t + 0.02); S.nextStoneAt = t + 3.5 + rng() * 4.0; }
    }
    if (f.howl && S.ambOn) {
      if (S.nextHowlAt <= 0) S.nextHowlAt = t + 1.0;
      if (t >= S.nextHowlAt) { scheduleHowl(t + 0.02); S.nextHowlAt = t + 4.0 + rng() * 3.0; }
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
    // Khe nhạc tệp: buffer còn từ phiên trước thì phát lại ngay
    // (không tải lại); chưa từng nạp thì bắt đầu nạp — trong lúc nạp
    // deck vừa dựng ở trên gánh nhạc như thường.
    if (S.file.status === 'ready') activateFileMusic(); else startFileLoad();
    startTimer();
    schedulerTick();
  }
  function unlock(factory, fileLoader) {
    // fileLoader (tuỳ chọn, chỉ kiểm thử dùng): bộ nạp tệp nhạc tiêm
    // vào thay defaultFileLoader; trình duyệt gọi unlock() không
    // đối số như cũ.
    if (typeof fileLoader === 'function' && !S.fileLoader) S.fileLoader = fileLoader;
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
    // Bắt đầu nạp tệp nhạc nền: trong lúc nạp deck thủ tục phát như
    // thường; nạp xong activateFileMusic() tự crossfade sang tệp;
    // nạp lỗi thì hệ deck gánh hẳn (dự phòng theo thiết kế khe).
    startFileLoad();
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
    S.boss = false; S.nextDrumAt = 0; // dừng máy là thoát hẳn chế độ boss — phiên sau không dính trống trận cũ
    S.decks = [];
    // Khe nhạc tệp dừng theo máy: tắt nguồn lặp và đưa bao gain về 0,
    // nhưng GIỮ buffer + trạng thái ready — khởi động lại phát tiếp
    // ngay, không tải lại tệp.
    S.file.active = false; S.file.gain = 0; S.file.ramp = null;
    if (S.file.gainNode) rampParam(S.file.gainNode.gain, 0, nowSec(), STOP_FADE_SEC);
    stopFileSource();
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
  /* setBoss(on): trận boss dã ngoại — nhạc nền hạ x0,5 (musicBusLevel)
     và trống trầm 60 nhịp/phút chạy trong bộ lập lịch. Tắt thì nhạc về
     mức thường theo ramp sẵn có (crossfade mềm, không cắt đột ngột). */
  function setBoss(on) {
    S.boss = !!on;
    if (S.boss) S.nextDrumAt = 0; // trống đầu tiên gõ ngay khi vào trận
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
      proximity: S.proximity, duck: S.duck, boss: S.boss, scheduledDrums: S.scheduledDrums,
      effectiveMusicGain: musicBusLevel(),
      effectiveAmbienceGain: ambBusLevel(),
      streamGain: streamLevel(), windGain: windLevel(), marketGain: marketLevel(),
      ambience: ambFlags(),
      decks: S.decks.map(function (d) { return { variantId: d.variant.id, gain: d.gain, active: d.active, hasRamp: !!d.ramp }; }),
      /* Khe nhạc tệp: musicSource là tuyến nhạc ĐANG gánh ('file'
         khi tệp đã kích hoạt, còn lại 'procedural' — gồm cả lúc tệp
         đang nạp và lúc nạp lỗi). */
      musicSource: fileActive() ? 'file' : 'procedural',
      fileMusic: {
        status: S.file.status, url: FILE_MUSIC_URL,
        gain: S.file.gain, active: S.file.active,
        playing: !!S.file.source, hasRamp: !!S.file.ramp
      },
      crossfadeActive: S.decks.some(function (d) { return !!d.ramp; }),
      lastCrossfade: S.lastCrossfade,
      scheduledNotes: S.scheduledNotes, scheduledChirps: S.scheduledChirps,
      scheduledDrips: S.scheduledDrips, scheduledStones: S.scheduledStones,
      scheduledHowls: S.scheduledHowls, scheduledSwordQi: S.scheduledSwordQi
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
    DUCK_MUSIC: DUCK_MUSIC, DUCK_AMBIENCE: DUCK_AMBIENCE, BOSS_MUSIC_FACTOR: BOSS_MUSIC_FACTOR,
    STREAM_MAX: STREAM_MAX, WIND_MAX: WIND_MAX, MARKET_MAX: MARKET_MAX,
    AMB_MAP_SCALE: AMB_MAP_SCALE, MARKET_DUSK_FACTOR: MARKET_DUSK_FACTOR, AMB_CONT_SUM_MAX: AMB_CONT_SUM_MAX,
    FILE_MUSIC_URL: FILE_MUSIC_URL, FILE_MUSIC_GAIN_DB: FILE_MUSIC_GAIN_DB, FILE_MUSIC_GAIN: FILE_MUSIC_GAIN,
    DRIP_LEVEL: DRIP_LEVEL, STONE_LEVEL: STONE_LEVEL, HOWL_LEVEL: HOWL_LEVEL, SWORDQI_LEVEL: SWORDQI_LEVEL,
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
    setProximity: setProximity, setDuck: setDuck, setBoss: setBoss,
    getState: getState,
    _tick: schedulerTick /* móc kiểm thử: chạy một vòng lập lịch bằng tay */
  };
  global.VSLC_MUSIC = M;
  if (typeof module !== 'undefined' && module.exports) module.exports = M;
})(typeof window !== 'undefined' ? window : globalThis);
