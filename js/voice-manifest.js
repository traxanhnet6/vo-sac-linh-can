/* Bản kê lồng tiếng — SINH TỰ ĐỘNG bởi tools/build-voice.js, không sửa tay.
   Khóa câu = sha256(người nói + '|' + nguyên văn) lấy 12 ký tự đầu (khớp tools/build-voice.js).
   Câu không có trong bản kê: game rơi về tiếng chữ chạy, không lỗi. */
window.VSLC_VOICE = {
 "cast": {
  "narrate": {
   "voice": "avocado_v2:vd2_r8_rep5k_3491_v068_28k_g5k",
   "speed": 100,
   "label": "Người dẫn truyện — nam trầm, điềm tĩnh (Kindhearted Jetty)"
  },
  "truong_lao": {
   "voice": "avocado_v2:vd2_r8_rep5k_3497_v068_28k_g5k",
   "speed": 86,
   "label": "Trưởng lão trắc linh — nam rất trầm, dứt khoát (Tenacious Mooring)"
  },
  "luc_tranh": {
   "voice": "avocado_v2:vd2_smoky_teacup",
   "speed": 106,
   "label": "Lục Tranh — nam trầm, ngạo (Questioning Satchel)"
  },
  "hero": {
   "voice": "avocado_v2:vd2_r8_rep5k_3494_v068_28k_g5k",
   "speed": 80,
   "label": "Giang Phàm cất lời — nam trầm vang, chậm nặng (Zealous Harbor)"
  },
  "hero_inner": {
   "voice": "avocado_v2:vd2_r8_rep5k_3494_v068_28k_g5k",
   "speed": 74,
   "label": "Giang Phàm tiếng lòng — cùng giọng, chậm hơn + phát khẽ (x0,55) trong game"
  },
  "chinh_ngon": {
   "voice": "avocado_v2:vd2_smoky_teacup",
   "speed": 92,
   "label": "Hứa Chính Ngôn — trung niên (chung giọng Lục Tranh, chậm hơn)"
  },
  "u_nhan": {
   "voice": "avocado_v2:vd2_r8_rep1k_a131_v068_28k_g5k",
   "speed": 96,
   "label": "Hứa U Nhàn — nữ trẻ, nhẹ dịu (Breathless Rosette)"
  },
  "di_ninh": {
   "voice": "avocado_v2:vd2_r8_rep5k_3492_v068_28k_g5k",
   "speed": 104,
   "label": "Hứa Di Ninh — nữ trẻ, sắc nhanh (Sparkling Whistle)"
  },
  "anh_phung": {
   "voice": "avocado_v2:vd3_vd2_r8_rep5k_3492_v068_28k_g5k",
   "speed": 90,
   "label": "Vương Ánh Phụng — nữ đứng tuổi (Glad Kite, chậm hơn Di Ninh)"
  },
  "dan_a": {
   "voice": "avocado_v2:vd2_r8_rep5k_3491_v068_28k_g5k",
   "speed": 108,
   "label": "Dân thôn A Quý — nam phụ (chung giọng người dẫn, nhanh hơn)"
  },
  "dan_b": {
   "voice": "avocado_v2:vd2_r8_rep5k_3492_v068_28k_g5k",
   "speed": 92,
   "label": "Dân thôn Thúy Nương — nữ phụ (chung giọng Di Ninh, chậm hơn)"
  },
  "dan_c": {
   "voice": "avocado_v2:vd2_r8_rep5k_3497_v068_28k_g5k",
   "speed": 94,
   "label": "Dân thôn Lão Tôn — lão nam phụ (chung giọng trưởng lão, nhanh hơn)"
  },
  "xa_phu": {
   "voice": "avocado_v2:vd2_r8_rep5k_3491_v068_28k_g5k",
   "speed": 100,
   "label": "Xa phu Lão Mã — nam phụ đường dài (chung giọng người dẫn)"
  },
  "thap_chu": {
   "voice": "avocado_v2:vd2_r8_rep5k_3497_v068_28k_g5k",
   "speed": 80,
   "label": "Chủ trì Kiểm Trắc Tháp — lão nam trầm (chung giọng trưởng lão, chậm hơn)"
  },
  "chu_quan": {
   "voice": "avocado_v2:vd2_r8_rep5k_3491_v068_28k_g5k",
   "speed": 94,
   "label": "Chủ quán Chu — nam trung niên niềm nở (chung giọng người dẫn, chậm hơn)"
  },
  "duoc_su": {
   "voice": "avocado_v2:vd2_r8_rep1k_a131_v068_28k_g5k",
   "speed": 88,
   "label": "Dược sư hiệu thuốc — nữ đứng tuổi điềm đạm (chung giọng U Nhàn, chậm hơn)"
  },
  "phap_khi_chu": {
   "voice": "avocado_v2:vd2_smoky_teacup",
   "speed": 88,
   "label": "Chủ Tụ Bảo Các — nam trung niên rành giá (chung giọng Lục Tranh, chậm hơn nhiều)"
  },
  "tran_chinh_dao": {
   "voice": "avocado_v2:vd2_smoky_teacup",
   "speed": 80,
   "label": "Trần Chính Đạo, Thiên Cơ Các — nam uy nghiêm (chung giọng Lục Tranh, chậm nhất)"
  },
  "tran_tu_linh": {
   "voice": "avocado_v2:vd2_r8_rep1k_a131_v068_28k_g5k",
   "speed": 104,
   "label": "Trần Tư Linh — nữ trẻ nhanh nhẹn (chung giọng U Nhàn, nhanh hơn)"
  },
  "thi_sinh_a": {
   "voice": "avocado_v2:vd2_r8_rep5k_3491_v068_28k_g5k",
   "speed": 110,
   "label": "Thí sinh A — nam trẻ háo hức (chung giọng người dẫn, nhanh hơn)"
  },
  "thi_sinh_b": {
   "voice": "avocado_v2:vd2_r8_rep5k_3492_v068_28k_g5k",
   "speed": 98,
   "label": "Thí sinh B — nữ trẻ (chung giọng Di Ninh, chậm hơn)"
  },
  "cho_a": {
   "voice": "avocado_v2:vd2_r8_rep5k_3491_v068_28k_g5k",
   "speed": 104,
   "label": "Người bán hàng rong ở chợ — nam phụ (chung giọng người dẫn)"
  },
  "cho_b": {
   "voice": "avocado_v2:vd2_r8_rep5k_3492_v068_28k_g5k",
   "speed": 100,
   "label": "Người bán vải ở chợ — nữ phụ (chung giọng Di Ninh)"
  },
  "dan_thanh_a": {
   "voice": "avocado_v2:vd2_r8_rep5k_3491_v068_28k_g5k",
   "speed": 96,
   "label": "Dân thành A — nam đứng tuổi (chung giọng người dẫn, chậm hơn)"
  },
  "dan_thanh_b": {
   "voice": "avocado_v2:vd2_r8_rep5k_3492_v068_28k_g5k",
   "speed": 94,
   "label": "Dân thành B — nữ phụ (chung giọng Di Ninh, chậm hơn)"
  },
  "chu_kien_tham": {
   "voice": "avocado_v2:vd2_r8_rep5k_3491_v068_28k_g5k",
   "speed": 98,
   "label": "Chu Kiến Thâm — công tử Chu gia, ngạo mạn (chung giọng người dẫn, chậm hơn một chút)"
  },
  "truong_lao_tong": {
   "voice": "avocado_v2:vd2_r8_rep5k_3497_v068_28k_g5k",
   "speed": 78,
   "label": "Trưởng lão Thanh Vân Tông — lão thành trầm nhất (chung giọng trưởng lão, chậm hơn)"
  },
  "thien_dao": {
   "voice": "avocado_v2:vd2_r8_rep5k_3497_v068_28k_g5k",
   "speed": 68,
   "label": "Thiên Đạo — không phải người: trầm nhất, chậm nhất. CÔNG THỨC KHÓA (Bui duyệt ứng viên 2, 2026-11-03): tốc độ 68 + ngắt nhịp bằng dấu câu trong bản tổng hợp (chữ không đổi) + vang sâu 4 tầng 90/180/320/480ms và lọc trầm 5000Hz NUNG SẴN trong tệp tuyên đọc; fx tầng phát chỉ điểm nhẹ (wet 0,10, hồi tiếp 0,12). Tuyên đọc theo công thức cảnh giới và ĐỌC TÊN người độ kiếp (lệnh Bui 23:07 ngày 2026-11-03, thay điểm thiết kế cũ không đọc tên)",
   "fx": "thiendao"
  },
  "lieu_khuynh_tien": {
   "voice": "avocado_v2:vd2_r8_rep5k_3492_v068_28k_g5k",
   "speed": 88,
   "label": "Liễu Khuynh Tiên — con gái tông chủ, thanh lãnh (chung giọng Di Ninh, chậm rãi)"
  },
  "hoa_huong_than": {
   "voice": "avocado_v2:vd2_r8_rep5k_3494_v068_28k_g5k",
   "speed": 96,
   "label": "Hoa Hướng Thần — đại đệ tử, điềm đạm (giọng riêng)"
  },
  "tap_dich_truong": {
   "voice": "avocado_v2:vd2_r8_rep5k_3497_v068_28k_g5k",
   "speed": 96,
   "label": "Quản sự tạp dịch — đứng tuổi thực tế (chung giọng trưởng lão, nhanh hơn)"
  },
  "de_tu_a": {
   "voice": "avocado_v2:vd2_r8_rep5k_3491_v068_28k_g5k",
   "speed": 106,
   "label": "Đệ tử A — nam trẻ tò mò (chung giọng người dẫn, nhanh hơn)"
  },
  "de_tu_b": {
   "voice": "avocado_v2:vd2_r8_rep5k_3494_v068_28k_g5k",
   "speed": 102,
   "label": "Đệ tử B — nữ trẻ (chung giọng Hoa Hướng Thần, nhanh hơn)"
  },
  "tin_su": {
   "voice": "avocado_v2:vd2_r8_rep5k_3491_v068_28k_g5k",
   "speed": 112,
   "label": "Người đưa tin Hứa gia — nam phụ hớt hải (chung giọng người dẫn, nhanh)"
  },
  "tin_su_b": {
   "voice": "avocado_v2:vd2_smoky_teacup",
   "speed": 102,
   "label": "Tín sứ B — nam trẻ rành rọt"
  },
  "chi_huy_tran": {
   "voice": "avocado_v2:vd2_smoky_teacup",
   "speed": 96,
   "label": "Chỉ huy trận — nam gọn sắc (chung giọng Lục Tranh, chậm hơn)"
  },
  "gia_nhan": {
   "voice": "avocado_v2:vd2_r8_rep5k_3491_v068_28k_g5k",
   "speed": 102,
   "label": "Gia nhân Hứa gia — nam phụ (chung giọng người dẫn)"
  },
  "mo_cuu_u": {
   "voice": "avocado_v2:vd2_smoky_teacup",
   "speed": 84,
   "label": "Mạc Cửu U — tả sứ Huyết Bạc Cung, trầm lạnh (giọng khói trà, chậm)"
  },
  "oan_hon": {
   "voice": "avocado_v2:vd2_smoky_teacup",
   "speed": 72,
   "label": "Oán hồn Thạch Vạn Quân — giọng khói trà, chậm nhất, trầm lạnh như tàn hơi (chung giọng Mạc Cửu U, chậm hơn)"
  },
  "huyet_de": {
   "voice": "avocado_v2:vd2_r8_rep5k_3491_v068_28k_g5k",
   "speed": 106,
   "label": "Đệ tử Huyết Bạc Cung — nam phụ run sợ (chung giọng người dẫn, nhanh hơn)"
  },
  "bach_kinh_duong": {
   "voice": "avocado_v2:vd2_r8_rep5k_3497_v068_28k_g5k",
   "speed": 82,
   "label": "Bạch Kính Đường — giám sát sứ Thiên Cơ Các, lão thành (chung giọng trưởng lão, chậm)"
  },
  "ky_luc_quan": {
   "voice": "avocado_v2:vd2_r8_rep5k_3492_v068_28k_g5k",
   "speed": 100,
   "label": "Ký lục quan — nữ trẻ cẩn thận (chung giọng Di Ninh)"
  },
  "tiep_khach": {
   "voice": "avocado_v2:vd2_r8_rep1k_a131_v068_28k_g5k",
   "speed": 92,
   "label": "Người tiếp khách phân đà — nữ điềm đạm (chung giọng U Nhàn, chậm hơn)"
  },
  "gac_kho": {
   "voice": "avocado_v2:vd2_r8_rep5k_3491_v068_28k_g5k",
   "speed": 94,
   "label": "Người gác kho phân đà — nam phụ (chung giọng người dẫn, chậm hơn)"
  },
  "de_tu_ho_tong": {
   "voice": "avocado_v2:vd2_r8_rep5k_3491_v068_28k_g5k",
   "speed": 100,
   "label": "Đệ tử hộ tống — nam trẻ (chung giọng người dẫn)"
  },
  "chap_su_thap": {
   "voice": "avocado_v2:vd2_r8_rep5k_3497_v068_28k_g5k",
   "speed": 92,
   "label": "Chấp sự Kiểm Trắc Tháp — nam đứng tuổi (chung giọng trưởng lão, nhanh hơn)"
  },
  "quan_phu": {
   "voice": "avocado_v2:vd2_r8_rep5k_3491_v068_28k_g5k",
   "speed": 88,
   "label": "Quan phủ Cô Châu Thành — nam trung niên uy nghiêm (chung giọng người dẫn, chậm hơn)"
  },
  "gia_chu_ta": {
   "voice": "avocado_v2:vd2_smoky_teacup",
   "speed": 90,
   "label": "Gia chủ Tạ gia — nam trung niên rành rọt (giọng khói trà)"
  },
  "gia_chu_do": {
   "voice": "avocado_v2:vd2_r8_rep5k_3497_v068_28k_g5k",
   "speed": 90,
   "label": "Gia chủ Đỗ gia — nam đứng tuổi (chung giọng trưởng lão, nhanh hơn)"
  },
  "vo_dich_doi_thu": {
   "voice": "avocado_v2:vd2_r8_rep5k_3494_v068_28k_g5k",
   "speed": 92,
   "label": "Vô địch Đỗ gia — đối thủ đài thách đấu (chung giọng Hoa Hướng Thần, chậm hơn)"
  },
  "truong_doan": {
   "voice": "avocado_v2:vd2_smoky_teacup",
   "speed": 88,
   "label": "Trưởng Đoàn Thương — nam đứng tuổi trầm (giọng khói trà, như gia_chu_ta, chậm hơn)"
  },
  "ep_gia": {
   "voice": "avocado_v2:vd2_r8_rep5k_3491_v068_28k_g5k",
   "speed": 100,
   "label": "Đại Diện Nhà Buôn — nam trung niên (chung giọng de_tu_ho_tong)"
  },
  "tham_bao": {
   "voice": "avocado_v2:vd2_r8_rep5k_3494_v068_28k_g5k",
   "speed": 104,
   "label": "Thám Báo Tông — giọng phụ trẻ (chung giọng vo_dich_doi_thu, nhanh hơn)"
  },
  "nguoi_lai_do": {
   "voice": "avocado_v2:vd2_r8_rep5k_3497_v068_28k_g5k",
   "speed": 90,
   "label": "Người lái đò sông Bạc — lão nam kiệm lời (chung giọng trưởng lão, nhanh hơn)"
  },
  "tram_truong": {
   "voice": "avocado_v2:vd2_r8_rep5k_3491_v068_28k_g5k",
   "speed": 96,
   "label": "Trưởng trạm lưu trữ — nam đứng tuổi cẩn trọng (chung giọng người dẫn, chậm hơn)"
  },
  "nguoi_giu_truoc": {
   "voice": "avocado_v2:vd2_r8_rep5k_3497_v068_28k_g5k",
   "speed": 94,
   "label": "Người giữ trạm trước — lão nam nhớ dai (chung giọng trưởng lão, nhanh hơn)"
  },
  "truong_thon_ven_song": {
   "voice": "avocado_v2:vd2_r8_rep5k_3497_v068_28k_g5k",
   "speed": 88,
   "label": "Trưởng thôn ven sông — lão nam điềm đạm (chung giọng trưởng lão)"
  },
  "nhan_chung": {
   "voice": "avocado_v2:vd2_r8_rep5k_3491_v068_28k_g5k",
   "speed": 92,
   "label": "Nhân chứng đoàn cửu phẩm — lão phu khuân vác (chung giọng người dẫn, chậm hơn)"
  },
  "dan_nan_truong": {
   "voice": "avocado_v2:vd2_smoky_teacup",
   "speed": 90,
   "label": "Trưởng đoàn tị nạn — nam đứng tuổi gan lì (giọng khói trà)"
  },
  "chu_do": {
   "voice": "avocado_v2:vd2_r8_rep5k_3492_v068_28k_g5k",
   "speed": 96,
   "label": "Chủ đò — nữ đứng tuổi rành sông nước (chung giọng Di Ninh, chậm hơn)"
  },
  "dan_lang_a": {
   "voice": "avocado_v2:vd2_r8_rep5k_3491_v068_28k_g5k",
   "speed": 104,
   "label": "Dân làng A — nam phụ (chung giọng người dẫn, nhanh hơn)"
  },
  "dan_lang_c": {
   "voice": "avocado_v2:vd2_r8_rep5k_3497_v068_28k_g5k",
   "speed": 98,
   "label": "Dân làng C — lão nam đầu làng (chung giọng trưởng lão, nhanh hơn)"
  },
  "dan_lang_b": {
   "voice": "avocado_v2:vd2_r8_rep1k_a131_v068_28k_g5k",
   "speed": 94,
   "label": "Dân làng B — nữ phụ (chung giọng U Nhàn, chậm hơn)"
  },
  "tin_su_lang": {
   "voice": "avocado_v2:vd2_r8_rep5k_3491_v068_28k_g5k",
   "speed": 110,
   "label": "Tín sứ làng — nam trẻ hớt hải (chung giọng người dẫn, nhanh)"
  },
  "sat_thu_truong": {
   "voice": "avocado_v2:vd2_smoky_teacup",
   "speed": 88,
   "label": "Đầu lĩnh cánh khói — sát thủ trầm lặng (giọng khói trà)"
  },
  "ke_dot_giay": {
   "voice": "avocado_v2:vd2_smoky_teacup",
   "speed": 94,
   "label": "Kẻ Đốt Giấy — đầu lĩnh đội đốt hồ sơ (giọng khói trà, nhanh hơn)"
  },
  "cuop_truong": {
   "voice": "avocado_v2:vd2_r8_rep5k_3494_v068_28k_g5k",
   "speed": 98,
   "label": "Đoạn Lưu Phỉ Thủ — đầu lĩnh toán cướp đường (chung giọng Hoa Hướng Thần)"
  }
 ,
  "lao_tieu": {
   "voice": "avocado_v2:vd2_r8_rep5k_3497_v068_28k_g5k",
   "speed": 94,
   "label": "Lão tiều vô danh (cảnh kỳ ngộ ô 05) — lão nam phụ (chung giọng trưởng lão, nhanh hơn như dan_c)"
  },
  "nguoi_chan_de": {
   "voice": "avocado_v2:vd2_r8_rep5k_3491_v068_28k_g5k",
   "speed": 100,
   "label": "Người chăn dê (cảnh kỳ ngộ ô 12) — nam phụ (chung giọng người dẫn)"
  }
 },
 "lines": {
  "434a6bbd9e63": {
   "f": "v434a6bbd9e63.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "04de09281300": {
   "f": "v04de09281300.mp3",
   "k": "say",
   "s": "truong_lao"
  },
  "64fb9ccac3a4": {
   "f": "v64fb9ccac3a4.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "1fc26cc36a88": {
   "f": "v1fc26cc36a88.mp3",
   "k": "say",
   "s": "truong_lao"
  },
  "1b7a04d5fded": {
   "f": "v1b7a04d5fded.mp3",
   "k": "say",
   "s": "luc_tranh"
  },
  "472fb9f5ba3f": {
   "f": "v472fb9f5ba3f.mp3",
   "k": "say",
   "s": "dan_a"
  },
  "34997a5e576f": {
   "f": "v34997a5e576f.mp3",
   "k": "say",
   "s": "anh_phung"
  },
  "dc363123da4d": {
   "f": "vdc363123da4d.mp3",
   "k": "say",
   "s": "truong_lao"
  },
  "a53ef884e416": {
   "f": "va53ef884e416.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "41b36e5d6620": {
   "f": "v41b36e5d6620.mp3",
   "k": "say",
   "s": "truong_lao"
  },
  "e6f580f10581": {
   "f": "ve6f580f10581.mp3",
   "k": "say",
   "s": "dan_b"
  },
  "27bd1eda3340": {
   "f": "v27bd1eda3340.mp3",
   "k": "say",
   "s": "dan_a"
  },
  "62d6a5532412": {
   "f": "v62d6a5532412.mp3",
   "k": "say",
   "s": "di_ninh"
  },
  "7c8c93fef3a8": {
   "f": "v7c8c93fef3a8.mp3",
   "k": "say",
   "s": "luc_tranh"
  },
  "d49dbc0a1714": {
   "f": "vd49dbc0a1714.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "4f1782c8f394": {
   "f": "v4f1782c8f394.mp3",
   "k": "say",
   "s": "anh_phung"
  },
  "48b21a7da23f": {
   "f": "v48b21a7da23f.mp3",
   "k": "inner",
   "s": "narrate"
  },
  "46f3452b5686": {
   "f": "v46f3452b5686.mp3",
   "k": "say",
   "s": "luc_tranh"
  },
  "7d32e8788a12": {
   "f": "v7d32e8788a12.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "3b4cff82f97e": {
   "f": "v3b4cff82f97e.mp3",
   "k": "say",
   "s": "hero"
  },
  "23cf979b286c": {
   "f": "v23cf979b286c.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "98d918b45eb5": {
   "f": "v98d918b45eb5.mp3",
   "k": "say",
   "s": "dan_a"
  },
  "89195eb92103": {
   "f": "v89195eb92103.mp3",
   "k": "say",
   "s": "dan_b"
  },
  "3a1062cc779b": {
   "f": "v3a1062cc779b.mp3",
   "k": "say",
   "s": "luc_tranh"
  },
  "6b91180c12dc": {
   "f": "v6b91180c12dc.mp3",
   "k": "say",
   "s": "di_ninh"
  },
  "24585377e8cf": {
   "f": "v24585377e8cf.mp3",
   "k": "say",
   "s": "anh_phung"
  },
  "e9b5a374aa57": {
   "f": "ve9b5a374aa57.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "28b30cd026cb": {
   "f": "v28b30cd026cb.mp3",
   "k": "say",
   "s": "truong_lao"
  },
  "0b68d63dab9f": {
   "f": "v0b68d63dab9f.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "313b7983af57": {
   "f": "v313b7983af57.mp3",
   "k": "inner",
   "s": "narrate"
  },
  "faccfa113d85": {
   "f": "vfaccfa113d85.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "46c73f52e531": {
   "f": "v46c73f52e531.mp3",
   "k": "say",
   "s": "hero"
  },
  "b5bb3b2648ed": {
   "f": "vb5bb3b2648ed.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "32e49d6a0c8e": {
   "f": "v32e49d6a0c8e.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "3ac7ebaed1cc": {
   "f": "v3ac7ebaed1cc.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "73470c07110f": {
   "f": "v73470c07110f.mp3",
   "k": "say",
   "s": "truong_lao"
  },
  "9028508d7b07": {
   "f": "v9028508d7b07.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "faac7ce88aff": {
   "f": "vfaac7ce88aff.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "abe0f871f145": {
   "f": "vabe0f871f145.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "c8e3bd39ff1d": {
   "f": "vc8e3bd39ff1d.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "83e5d4482570": {
   "f": "v83e5d4482570.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "6ce2b578c145": {
   "f": "v6ce2b578c145.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "74a97a13b66f": {
   "f": "v74a97a13b66f.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "19d582407e3c": {
   "f": "v19d582407e3c.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "730514960722": {
   "f": "v730514960722.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "85be8306792f": {
   "f": "v85be8306792f.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "7276acc63700": {
   "f": "v7276acc63700.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "8b526da00856": {
   "f": "v8b526da00856.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "b98a196ec1b6": {
   "f": "vb98a196ec1b6.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "fba3e3699c28": {
   "f": "vfba3e3699c28.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "33b20cbea0cd": {
   "f": "v33b20cbea0cd.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "bf090579596d": {
   "f": "vbf090579596d.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "37d10c65ca7e": {
   "f": "v37d10c65ca7e.mp3",
   "k": "say",
   "s": "thi_sinh_a"
  },
  "f3d0a8c18e96": {
   "f": "vf3d0a8c18e96.mp3",
   "k": "say",
   "s": "luc_tranh"
  },
  "be91c4a5079c": {
   "f": "vbe91c4a5079c.mp3",
   "k": "say",
   "s": "luc_tranh"
  },
  "aa04b765f8cd": {
   "f": "vaa04b765f8cd.mp3",
   "k": "say",
   "s": "thap_chu"
  },
  "df2aa4712a3e": {
   "f": "vdf2aa4712a3e.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "8184bb6856fc": {
   "f": "v8184bb6856fc.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "56927e37e5b1": {
   "f": "v56927e37e5b1.mp3",
   "k": "say",
   "s": "thap_chu"
  },
  "add079207ebe": {
   "f": "vadd079207ebe.mp3",
   "k": "say",
   "s": "luc_tranh"
  },
  "7fc59b6b660c": {
   "f": "v7fc59b6b660c.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "03a7bd084d9c": {
   "f": "v03a7bd084d9c.mp3",
   "k": "say",
   "s": "thi_sinh_b"
  },
  "a649a7a5d507": {
   "f": "va649a7a5d507.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "6b4d1aa86709": {
   "f": "v6b4d1aa86709.mp3",
   "k": "say",
   "s": "thap_chu"
  },
  "e27e85cfbf82": {
   "f": "ve27e85cfbf82.mp3",
   "k": "say",
   "s": "luc_tranh"
  },
  "9a0eff528891": {
   "f": "v9a0eff528891.mp3",
   "k": "say",
   "s": "thap_chu"
  },
  "00f3b39e5553": {
   "f": "v00f3b39e5553.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "b0f30495896b": {
   "f": "vb0f30495896b.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "8eeab520ac0f": {
   "f": "v8eeab520ac0f.mp3",
   "k": "say",
   "s": "luc_tranh"
  },
  "57a2efe673bc": {
   "f": "v57a2efe673bc.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "1484f5088c18": {
   "f": "v1484f5088c18.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "00bc2b320f97": {
   "f": "v00bc2b320f97.mp3",
   "k": "say",
   "s": "thap_chu"
  },
  "1eb4ee663921": {
   "f": "v1eb4ee663921.mp3",
   "k": "say",
   "s": "thap_chu"
  },
  "267468b09a01": {
   "f": "v267468b09a01.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "e44376fffc0a": {
   "f": "ve44376fffc0a.mp3",
   "k": "say",
   "s": "thap_chu"
  },
  "010f0df418a0": {
   "f": "v010f0df418a0.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "38e2b95a4a8c": {
   "f": "v38e2b95a4a8c.mp3",
   "k": "say",
   "s": "thap_chu"
  },
  "2de9af46380f": {
   "f": "v2de9af46380f.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "b588fd29bd77": {
   "f": "vb588fd29bd77.mp3",
   "k": "say",
   "s": "thap_chu"
  },
  "644b62396166": {
   "f": "v644b62396166.mp3",
   "k": "say",
   "s": "chu_quan"
  },
  "5e475c4d569e": {
   "f": "v5e475c4d569e.mp3",
   "k": "say",
   "s": "duoc_su"
  },
  "63db287955d5": {
   "f": "v63db287955d5.mp3",
   "k": "say",
   "s": "phap_khi_chu"
  },
  "0aa1524cce71": {
   "f": "v0aa1524cce71.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "25ed651666c9": {
   "f": "v25ed651666c9.mp3",
   "k": "say",
   "s": "tran_chinh_dao"
  },
  "0e9b9b2ad0b1": {
   "f": "v0e9b9b2ad0b1.mp3",
   "k": "say",
   "s": "tran_chinh_dao"
  },
  "8a9741d81a3f": {
   "f": "v8a9741d81a3f.mp3",
   "k": "say",
   "s": "chinh_ngon"
  },
  "fe3cd1cd94eb": {
   "f": "vfe3cd1cd94eb.mp3",
   "k": "say",
   "s": "luc_tranh"
  },
  "ff3ac05dc319": {
   "f": "vff3ac05dc319.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "fc52bf16abda": {
   "f": "vfc52bf16abda.mp3",
   "k": "say",
   "s": "luc_tranh"
  },
  "067b56e31033": {
   "f": "v067b56e31033.mp3",
   "k": "say",
   "s": "luc_tranh"
  },
  "969be97722b9": {
   "f": "v969be97722b9.mp3",
   "k": "say",
   "s": "anh_phung"
  },
  "8dc5f0f0df7a": {
   "f": "v8dc5f0f0df7a.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "f7a4843bfd22": {
   "f": "vf7a4843bfd22.mp3",
   "k": "say",
   "s": "di_ninh"
  },
  "c01756040c58": {
   "f": "vc01756040c58.mp3",
   "k": "say",
   "s": "chinh_ngon"
  },
  "8094fa03289f": {
   "f": "v8094fa03289f.mp3",
   "k": "say",
   "s": "tran_chinh_dao"
  },
  "baddb77c5ec9": {
   "f": "vbaddb77c5ec9.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "6c49266aa7c4": {
   "f": "v6c49266aa7c4.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "c26f5fd487e7": {
   "f": "vc26f5fd487e7.mp3",
   "k": "say",
   "s": "luc_tranh"
  },
  "8283e6bc60b9": {
   "f": "v8283e6bc60b9.mp3",
   "k": "say",
   "s": "dan_thanh_a"
  },
  "446747ebe5df": {
   "f": "v446747ebe5df.mp3",
   "k": "say",
   "s": "luc_tranh"
  },
  "f74ba472fcd6": {
   "f": "vf74ba472fcd6.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "e2ccb673aeed": {
   "f": "ve2ccb673aeed.mp3",
   "k": "say",
   "s": "chinh_ngon"
  },
  "344513869beb": {
   "f": "v344513869beb.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "9f82c5f362fd": {
   "f": "v9f82c5f362fd.mp3",
   "k": "say",
   "s": "tran_chinh_dao"
  },
  "497545325554": {
   "f": "v497545325554.mp3",
   "k": "say",
   "s": "luc_tranh"
  },
  "25ceb6a07bb5": {
   "f": "v25ceb6a07bb5.mp3",
   "k": "say",
   "s": "dan_thanh_a"
  },
  "df0a81a79de5": {
   "f": "vdf0a81a79de5.mp3",
   "k": "say",
   "s": "luc_tranh"
  },
  "7f4034d56c36": {
   "f": "v7f4034d56c36.mp3",
   "k": "say",
   "s": "chinh_ngon"
  },
  "d17dc03b860d": {
   "f": "vd17dc03b860d.mp3",
   "k": "say",
   "s": "tran_chinh_dao"
  },
  "cdfa729fedbc": {
   "f": "vcdfa729fedbc.mp3",
   "k": "say",
   "s": "hero"
  },
  "9b50e97432b8": {
   "f": "v9b50e97432b8.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "8a1e0fccb711": {
   "f": "v8a1e0fccb711.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "53a9fee24b8f": {
   "f": "v53a9fee24b8f.mp3",
   "k": "say",
   "s": "tran_chinh_dao"
  },
  "16c62f850396": {
   "f": "v16c62f850396.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "761c84cd69c3": {
   "f": "v761c84cd69c3.mp3",
   "k": "say",
   "s": "tran_chinh_dao"
  },
  "b69641127c88": {
   "f": "vb69641127c88.mp3",
   "k": "say",
   "s": "tran_chinh_dao"
  },
  "f69f20a35059": {
   "f": "vf69f20a35059.mp3",
   "k": "say",
   "s": "tran_chinh_dao"
  },
  "5ffcc23b72a4": {
   "f": "v5ffcc23b72a4.mp3",
   "k": "say",
   "s": "tran_chinh_dao"
  },
  "db3b458922bc": {
   "f": "vdb3b458922bc.mp3",
   "k": "say",
   "s": "tran_chinh_dao"
  },
  "0d98c6ae7983": {
   "f": "v0d98c6ae7983.mp3",
   "k": "say",
   "s": "tran_chinh_dao"
  },
  "07d5398fec01": {
   "f": "v07d5398fec01.mp3",
   "k": "say",
   "s": "tran_tu_linh"
  },
  "21e7a2791ed0": {
   "f": "v21e7a2791ed0.mp3",
   "k": "say",
   "s": "tran_tu_linh"
  },
  "990ff2665f51": {
   "f": "v990ff2665f51.mp3",
   "k": "say",
   "s": "tran_tu_linh"
  },
  "52708cf38f5c": {
   "f": "v52708cf38f5c.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "a6e3a3281ee3": {
   "f": "va6e3a3281ee3.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "8c7a69aac71e": {
   "f": "v8c7a69aac71e.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "3cfa27b7651c": {
   "f": "v3cfa27b7651c.mp3",
   "k": "say",
   "s": "tran_tu_linh"
  },
  "fa89c2aa58b3": {
   "f": "vfa89c2aa58b3.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "afc65abcbf95": {
   "f": "vafc65abcbf95.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "e0a88052571f": {
   "f": "ve0a88052571f.mp3",
   "k": "say",
   "s": "tran_tu_linh"
  },
  "eb92879a573e": {
   "f": "veb92879a573e.mp3",
   "k": "say",
   "s": "tran_tu_linh"
  },
  "bbab0e9baa5e": {
   "f": "vbbab0e9baa5e.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "d6443c015bb4": {
   "f": "vd6443c015bb4.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "d61bc3540198": {
   "f": "vd61bc3540198.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "b3c3cc4d28a8": {
   "f": "vb3c3cc4d28a8.mp3",
   "k": "say",
   "s": "luc_tranh"
  },
  "8338064908ee": {
   "f": "v8338064908ee.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "5d0817a21038": {
   "f": "v5d0817a21038.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "f015ec941238": {
   "f": "vf015ec941238.mp3",
   "k": "say",
   "s": "anh_phung"
  },
  "6657f6973c77": {
   "f": "v6657f6973c77.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "e38745bfa22b": {
   "f": "ve38745bfa22b.mp3",
   "k": "say",
   "s": "chinh_ngon"
  },
  "78d410cf2359": {
   "f": "v78d410cf2359.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "ff2a5f0a289f": {
   "f": "vff2a5f0a289f.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "d619ea1b4e57": {
   "f": "vd619ea1b4e57.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "d1c5e92fb7fc": {
   "f": "vd1c5e92fb7fc.mp3",
   "k": "say",
   "s": "luc_tranh"
  },
  "4efee56bdb82": {
   "f": "v4efee56bdb82.mp3",
   "k": "say",
   "s": "chinh_ngon"
  },
  "39bb31736e89": {
   "f": "v39bb31736e89.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "dbbef442fc0e": {
   "f": "vdbbef442fc0e.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "0a04b142b0e1": {
   "f": "v0a04b142b0e1.mp3",
   "k": "say",
   "s": "chu_kien_tham"
  },
  "c7132ed24fd2": {
   "f": "vc7132ed24fd2.mp3",
   "k": "say",
   "s": "anh_phung"
  },
  "4f9ca2cc45f6": {
   "f": "v4f9ca2cc45f6.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "64c5576a182a": {
   "f": "v64c5576a182a.mp3",
   "k": "say",
   "s": "chu_kien_tham"
  },
  "4b639abe6c9d": {
   "f": "v4b639abe6c9d.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "a1124f3dabed": {
   "f": "va1124f3dabed.mp3",
   "k": "say",
   "s": "chu_kien_tham"
  },
  "79b76db6765d": {
   "f": "v79b76db6765d.mp3",
   "k": "say",
   "s": "chinh_ngon"
  },
  "d1e97d8b0fcf": {
   "f": "vd1e97d8b0fcf.mp3",
   "k": "say",
   "s": "chu_kien_tham"
  },
  "05ca873e64f3": {
   "f": "v05ca873e64f3.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "94908de13c06": {
   "f": "v94908de13c06.mp3",
   "k": "say",
   "s": "chinh_ngon"
  },
  "855d8179fd02": {
   "f": "v855d8179fd02.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "92faaeb02ffc": {
   "f": "v92faaeb02ffc.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "b01992fd5e65": {
   "f": "vb01992fd5e65.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "8b739a47fe0e": {
   "f": "v8b739a47fe0e.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "9a38369ccd3e": {
   "f": "v9a38369ccd3e.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "9caa082de466": {
   "f": "v9caa082de466.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "921c6f8e57af": {
   "f": "v921c6f8e57af.mp3",
   "k": "say",
   "s": "chinh_ngon"
  },
  "a355e78bb39e": {
   "f": "va355e78bb39e.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "d6d05e003775": {
   "f": "vd6d05e003775.mp3",
   "k": "say",
   "s": "chinh_ngon"
  },
  "86628182b63a": {
   "f": "v86628182b63a.mp3",
   "k": "say",
   "s": "chinh_ngon"
  },
  "8c96e54290ff": {
   "f": "v8c96e54290ff.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "9c8c9687afc3": {
   "f": "v9c8c9687afc3.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "feeb18b84586": {
   "f": "vfeeb18b84586.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "57f88133d122": {
   "f": "v57f88133d122.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "b369ce7d201c": {
   "f": "vb369ce7d201c.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "f1c17c141d21": {
   "f": "vf1c17c141d21.mp3",
   "k": "say",
   "s": "de_tu_a"
  },
  "b3088c63971b": {
   "f": "vb3088c63971b.mp3",
   "k": "say",
   "s": "de_tu_b"
  },
  "5be9a210a01b": {
   "f": "v5be9a210a01b.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "2f8740e06646": {
   "f": "v2f8740e06646.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "24a4adca6b7d": {
   "f": "v24a4adca6b7d.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "f956813d1439": {
   "f": "vf956813d1439.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "9ccd3b755174": {
   "f": "v9ccd3b755174.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "aed22c5abb9f": {
   "f": "vaed22c5abb9f.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "efe05ebab0fa": {
   "f": "vefe05ebab0fa.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "9003615888fd": {
   "f": "v9003615888fd.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "dc074b907b62": {
   "f": "vdc074b907b62.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "9f9bfe026d8b": {
   "f": "v9f9bfe026d8b.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "3f42f71c46f7": {
   "f": "v3f42f71c46f7.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "c33bc47fb1fe": {
   "f": "vc33bc47fb1fe.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "c144bbb55eec": {
   "f": "vc144bbb55eec.mp3",
   "k": "say",
   "s": "tap_dich_truong"
  },
  "bdb03da4f272": {
   "f": "vbdb03da4f272.mp3",
   "k": "say",
   "s": "tap_dich_truong"
  },
  "0785253cb25c": {
   "f": "v0785253cb25c.mp3",
   "k": "say",
   "s": "tap_dich_truong"
  },
  "ce53d4d1725b": {
   "f": "vce53d4d1725b.mp3",
   "k": "say",
   "s": "tap_dich_truong"
  },
  "cce9b2d01372": {
   "f": "vcce9b2d01372.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "a851a3934750": {
   "f": "va851a3934750.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "3115959e7b37": {
   "f": "v3115959e7b37.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "b29fa494e860": {
   "f": "vb29fa494e860.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "d640ca9d46cb": {
   "f": "vd640ca9d46cb.mp3",
   "k": "say",
   "s": "lieu_khuynh_tien"
  },
  "a8b97ca9da3f": {
   "f": "va8b97ca9da3f.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "fab0d220eaf5": {
   "f": "vfab0d220eaf5.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "7512331d0c7b": {
   "f": "v7512331d0c7b.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "e5c1d5f38b65": {
   "f": "ve5c1d5f38b65.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "1439dc90bc12": {
   "f": "v1439dc90bc12.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "4aed6df559f7": {
   "f": "v4aed6df559f7.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "37032de88c70": {
   "f": "v37032de88c70.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "70176665e2d8": {
   "f": "v70176665e2d8.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "292e50a2f907": {
   "f": "v292e50a2f907.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "3958c4f1f6bc": {
   "f": "v3958c4f1f6bc.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "340518dba0b5": {
   "f": "v340518dba0b5.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "ce5246e3c46a": {
   "f": "vce5246e3c46a.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "99106ddd1461": {
   "f": "v99106ddd1461.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "0e2cef2752cf": {
   "f": "v0e2cef2752cf.mp3",
   "k": "say",
   "s": "de_tu_a"
  },
  "19430e5205c7": {
   "f": "v19430e5205c7.mp3",
   "k": "say",
   "s": "de_tu_b"
  },
  "d2ec1c3b56b8": {
   "f": "vd2ec1c3b56b8.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "90a180bc5ad4": {
   "f": "v90a180bc5ad4.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "a6df15fee12b": {
   "f": "va6df15fee12b.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "13e550225f1e": {
   "f": "v13e550225f1e.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "04972aabcddd": {
   "f": "v04972aabcddd.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "acb2a0bb016c": {
   "f": "vacb2a0bb016c.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "001b7d52980e": {
   "f": "v001b7d52980e.mp3",
   "k": "say",
   "s": "lieu_khuynh_tien"
  },
  "d16753bb6b92": {
   "f": "vd16753bb6b92.mp3",
   "k": "say",
   "s": "lieu_khuynh_tien"
  },
  "5f2d17f4d5cf": {
   "f": "v5f2d17f4d5cf.mp3",
   "k": "say",
   "s": "lieu_khuynh_tien"
  },
  "c281e396fe4b": {
   "f": "vc281e396fe4b.mp3",
   "k": "say",
   "s": "lieu_khuynh_tien"
  },
  "fb1dec27a34a": {
   "f": "vfb1dec27a34a.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "a661b5e811c4": {
   "f": "va661b5e811c4.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "b99956c7c0f7": {
   "f": "vb99956c7c0f7.mp3",
   "k": "say",
   "s": "hoa_huong_than"
  },
  "99b1997164a8": {
   "f": "v99b1997164a8.mp3",
   "k": "say",
   "s": "hoa_huong_than"
  },
  "f891554afc16": {
   "f": "vf891554afc16.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "3e0cfb46c9b8": {
   "f": "v3e0cfb46c9b8.mp3",
   "k": "say",
   "s": "de_tu_a"
  },
  "7280628e6899": {
   "f": "v7280628e6899.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "c75941ee7735": {
   "f": "vc75941ee7735.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "18a2c0866796": {
   "f": "v18a2c0866796.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "099ab200ac34": {
   "f": "v099ab200ac34.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "831e18ef6cdc": {
   "f": "v831e18ef6cdc.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "31e135b8dea4": {
   "f": "v31e135b8dea4.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "34763bc45045": {
   "f": "v34763bc45045.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "fb7fdd39d7b7": {
   "f": "vfb7fdd39d7b7.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "fc9a9243f002": {
   "f": "vfc9a9243f002.mp3",
   "k": "say",
   "s": "hoa_huong_than"
  },
  "736bab231c48": {
   "f": "v736bab231c48.mp3",
   "k": "say",
   "s": "hoa_huong_than"
  },
  "3a5802f1c17b": {
   "f": "v3a5802f1c17b.mp3",
   "k": "say",
   "s": "de_tu_b"
  },
  "cd14d01b9eda": {
   "f": "vcd14d01b9eda.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "c4f9a31055b0": {
   "f": "vc4f9a31055b0.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "7a9687ec79ff": {
   "f": "v7a9687ec79ff.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "65fa92db8301": {
   "f": "v65fa92db8301.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "e24184ad8164": {
   "f": "ve24184ad8164.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "32b410138715": {
   "f": "v32b410138715.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "208115c05c6c": {
   "f": "v208115c05c6c.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "e3a4fae84176": {
   "f": "ve3a4fae84176.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "41a21b97c1b7": {
   "f": "v41a21b97c1b7.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "e38906a3c665": {
   "f": "ve38906a3c665.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "2297568ce48d": {
   "f": "v2297568ce48d.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "fb66bc91df60": {
   "f": "vfb66bc91df60.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "201463b3c52e": {
   "f": "v201463b3c52e.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "b757af39c026": {
   "f": "vb757af39c026.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "786fd418831a": {
   "f": "v786fd418831a.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "db375c4d4306": {
   "f": "vdb375c4d4306.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "95ac1ad75daf": {
   "f": "v95ac1ad75daf.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "9d295d97c848": {
   "f": "v9d295d97c848.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "cfca340bf31a": {
   "f": "vcfca340bf31a.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "8e9f1321acbd": {
   "f": "v8e9f1321acbd.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "851962b2ee44": {
   "f": "v851962b2ee44.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "a7039eb7be3f": {
   "f": "va7039eb7be3f.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "b21be6df147d": {
   "f": "vb21be6df147d.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "143ebb21088a": {
   "f": "v143ebb21088a.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "38dfea121159": {
   "f": "v38dfea121159.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "5efb3251490e": {
   "f": "v5efb3251490e.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "e7db7295aafc": {
   "f": "ve7db7295aafc.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "0c440889e0d4": {
   "f": "v0c440889e0d4.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "ec8b534890b2": {
   "f": "vec8b534890b2.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "a5f9efe9708a": {
   "f": "va5f9efe9708a.mp3",
   "k": "say",
   "s": "hoa_huong_than"
  },
  "c5326a189b8d": {
   "f": "vc5326a189b8d.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "83afca2408bb": {
   "f": "v83afca2408bb.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "9d3b185b66ef": {
   "f": "v9d3b185b66ef.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "014c7f0aa079": {
   "f": "v014c7f0aa079.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "1897b364c867": {
   "f": "v1897b364c867.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "1bb96c3a2402": {
   "f": "v1bb96c3a2402.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "355368191fb1": {
   "f": "v355368191fb1.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "f261d205a4d9": {
   "f": "vf261d205a4d9.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "a7d52dd5274d": {
   "f": "va7d52dd5274d.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "90b712cad327": {
   "f": "v90b712cad327.mp3",
   "k": "say",
   "s": "hoa_huong_than"
  },
  "4f7728b2db22": {
   "f": "v4f7728b2db22.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "2a881e27aceb": {
   "f": "v2a881e27aceb.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "7dbf3a65cb21": {
   "f": "v7dbf3a65cb21.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "5f51852ff9a8": {
   "f": "v5f51852ff9a8.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "6d886dbc9892": {
   "f": "v6d886dbc9892.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "0759fd112296": {
   "f": "v0759fd112296.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "92adfe36d531": {
   "f": "v92adfe36d531.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "a2fa34042a32": {
   "f": "va2fa34042a32.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "74cdc9eca2a4": {
   "f": "v74cdc9eca2a4.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "066c8fe659e6": {
   "f": "v066c8fe659e6.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "694989cdc181": {
   "f": "v694989cdc181.mp3",
   "k": "say",
   "s": "hero"
  },
  "816c0fbd761d": {
   "f": "v816c0fbd761d.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "eadf8fa3bcda": {
   "f": "veadf8fa3bcda.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "a9de182ac73a": {
   "f": "va9de182ac73a.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "73826caf5bcb": {
   "f": "v73826caf5bcb.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "6733b9554e5d": {
   "f": "v6733b9554e5d.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "337fd6daf111": {
   "f": "v337fd6daf111.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "5e75fbf9e697": {
   "f": "v5e75fbf9e697.mp3",
   "k": "say",
   "s": "hoa_huong_than"
  },
  "1b28fe499fad": {
   "f": "v1b28fe499fad.mp3",
   "k": "say",
   "s": "lieu_khuynh_tien"
  },
  "c6a06c0d9bff": {
   "f": "vc6a06c0d9bff.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "b2beb23723da": {
   "f": "vb2beb23723da.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "6beef8aee76c": {
   "f": "v6beef8aee76c.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "dad187fc92c3": {
   "f": "vdad187fc92c3.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "ee92ddeb49bd": {
   "f": "vee92ddeb49bd.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "785098ac5a2b": {
   "f": "v785098ac5a2b.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "59f7606bb770": {
   "f": "v59f7606bb770.mp3",
   "k": "say",
   "s": "tin_su"
  },
  "492fa4569472": {
   "f": "v492fa4569472.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "95b2b4371969": {
   "f": "v95b2b4371969.mp3",
   "k": "say",
   "s": "tin_su"
  },
  "adcd6532d87e": {
   "f": "vadcd6532d87e.mp3",
   "k": "say",
   "s": "tin_su"
  },
  "ad07d9629110": {
   "f": "vad07d9629110.mp3",
   "k": "say",
   "s": "lieu_khuynh_tien"
  },
  "02182a347e5b": {
   "f": "v02182a347e5b.mp3",
   "k": "say",
   "s": "hoa_huong_than"
  },
  "afb9f207d30c": {
   "f": "vafb9f207d30c.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "5b921b2d4843": {
   "f": "v5b921b2d4843.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "ac578abe7efc": {
   "f": "vac578abe7efc.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "94b3385a3ff8": {
   "f": "v94b3385a3ff8.mp3",
   "k": "say",
   "s": "gia_nhan"
  },
  "793683d36115": {
   "f": "v793683d36115.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "f46f41322c47": {
   "f": "vf46f41322c47.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "ed8cf2679d74": {
   "f": "ved8cf2679d74.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "bd0844ff7d3b": {
   "f": "vbd0844ff7d3b.mp3",
   "k": "say",
   "s": "chinh_ngon"
  },
  "7b83f44b9a48": {
   "f": "v7b83f44b9a48.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "12eeb5510e22": {
   "f": "v12eeb5510e22.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "fc7468c94a23": {
   "f": "vfc7468c94a23.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "316a7d680467": {
   "f": "v316a7d680467.mp3",
   "k": "say",
   "s": "hoa_huong_than"
  },
  "da1f5a6eb16b": {
   "f": "vda1f5a6eb16b.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "1f421e5b88d2": {
   "f": "v1f421e5b88d2.mp3",
   "k": "say",
   "s": "lieu_khuynh_tien"
  },
  "7d1d055ba2f5": {
   "f": "v7d1d055ba2f5.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "27f371d93611": {
   "f": "v27f371d93611.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "8662a906c4fc": {
   "f": "v8662a906c4fc.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "f1d2968addae": {
   "f": "vf1d2968addae.mp3",
   "k": "say",
   "s": "mo_cuu_u"
  },
  "82bb08b218e7": {
   "f": "v82bb08b218e7.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "5494a6470ba8": {
   "f": "v5494a6470ba8.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "b598acab0dc5": {
   "f": "vb598acab0dc5.mp3",
   "k": "say",
   "s": "hero"
  },
  "9c2398b9345e": {
   "f": "v9c2398b9345e.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "1819fceff0a8": {
   "f": "v1819fceff0a8.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "3fdeefdf8d9a": {
   "f": "v3fdeefdf8d9a.mp3",
   "k": "say",
   "s": "mo_cuu_u"
  },
  "af1eb7e2e07f": {
   "f": "vaf1eb7e2e07f.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "8415f05cb19b": {
   "f": "v8415f05cb19b.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "f65b385b0fbb": {
   "f": "vf65b385b0fbb.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "76e09d69efdb": {
   "f": "v76e09d69efdb.mp3",
   "k": "say",
   "s": "gia_nhan"
  },
  "a3b20bb811c3": {
   "f": "va3b20bb811c3.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "4375e0b236bc": {
   "f": "v4375e0b236bc.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "887a8f419733": {
   "f": "v887a8f419733.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "32bb99ce4fd8": {
   "f": "v32bb99ce4fd8.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "dad9dc844fef": {
   "f": "vdad9dc844fef.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "9c7c7c80a11e": {
   "f": "v9c7c7c80a11e.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "a6fa0d63b2d8": {
   "f": "va6fa0d63b2d8.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "85faaf088cd9": {
   "f": "v85faaf088cd9.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "a40660363229": {
   "f": "va40660363229.mp3",
   "k": "say",
   "s": "mo_cuu_u"
  },
  "cdb57dc2bb53": {
   "f": "vcdb57dc2bb53.mp3",
   "k": "say",
   "s": "mo_cuu_u"
  },
  "d5f11dba3e6c": {
   "f": "vd5f11dba3e6c.mp3",
   "k": "say",
   "s": "mo_cuu_u"
  },
  "1af1b572cdc0": {
   "f": "v1af1b572cdc0.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "330dc355fecf": {
   "f": "v330dc355fecf.mp3",
   "k": "say",
   "s": "mo_cuu_u"
  },
  "12ae8c4122c3": {
   "f": "v12ae8c4122c3.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "d7e5ffcb81a0": {
   "f": "vd7e5ffcb81a0.mp3",
   "k": "say",
   "s": "hero"
  },
  "539b44d9cb59": {
   "f": "v539b44d9cb59.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "fe8c1ece357c": {
   "f": "vfe8c1ece357c.mp3",
   "k": "say",
   "s": "mo_cuu_u"
  },
  "ba9a25b981cd": {
   "f": "vba9a25b981cd.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "86f392ba812c": {
   "f": "v86f392ba812c.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "cdbfca07ce59": {
   "f": "vcdbfca07ce59.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "3f25bd76a537": {
   "f": "v3f25bd76a537.mp3",
   "k": "say",
   "s": "tran_chinh_dao"
  },
  "afa9a3946500": {
   "f": "vafa9a3946500.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "b4e28e0e56f8": {
   "f": "vb4e28e0e56f8.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "169dec902d62": {
   "f": "v169dec902d62.mp3",
   "k": "say",
   "s": "chinh_ngon"
  },
  "3b2bf9e23744": {
   "f": "v3b2bf9e23744.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "1ae2b625fae4": {
   "f": "v1ae2b625fae4.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "9614f5cfeede": {
   "f": "v9614f5cfeede.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "7a07fba633ae": {
   "f": "v7a07fba633ae.mp3",
   "k": "say",
   "s": "tran_tu_linh"
  },
  "cdfb958731ca": {
   "f": "vcdfb958731ca.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "0b936bef0b2b": {
   "f": "v0b936bef0b2b.mp3",
   "k": "say",
   "s": "tran_chinh_dao"
  },
  "91511c63ae76": {
   "f": "v91511c63ae76.mp3",
   "k": "say",
   "s": "tran_chinh_dao"
  },
  "a009b197b314": {
   "f": "va009b197b314.mp3",
   "k": "say",
   "s": "tran_chinh_dao"
  },
  "3f7113a59857": {
   "f": "v3f7113a59857.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "3965b982d131": {
   "f": "v3965b982d131.mp3",
   "k": "say",
   "s": "bach_kinh_duong"
  },
  "55cef21f28fc": {
   "f": "v55cef21f28fc.mp3",
   "k": "say",
   "s": "bach_kinh_duong"
  },
  "0510533d9e1c": {
   "f": "v0510533d9e1c.mp3",
   "k": "say",
   "s": "bach_kinh_duong"
  },
  "f156901b0743": {
   "f": "vf156901b0743.mp3",
   "k": "say",
   "s": "bach_kinh_duong"
  },
  "494decf45696": {
   "f": "v494decf45696.mp3",
   "k": "say",
   "s": "bach_kinh_duong"
  },
  "f5e3fbdb9a4c": {
   "f": "vf5e3fbdb9a4c.mp3",
   "k": "say",
   "s": "bach_kinh_duong"
  },
  "74e5d38a7209": {
   "f": "v74e5d38a7209.mp3",
   "k": "say",
   "s": "bach_kinh_duong"
  },
  "e33dc33cf9a4": {
   "f": "ve33dc33cf9a4.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "e14ffe35a991": {
   "f": "ve14ffe35a991.mp3",
   "k": "say",
   "s": "bach_kinh_duong"
  },
  "2f9e0ff4df73": {
   "f": "v2f9e0ff4df73.mp3",
   "k": "say",
   "s": "bach_kinh_duong"
  },
  "863eff1dab27": {
   "f": "v863eff1dab27.mp3",
   "k": "say",
   "s": "hero"
  },
  "9bf999107865": {
   "f": "v9bf999107865.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "e2f2fcc1ce92": {
   "f": "ve2f2fcc1ce92.mp3",
   "k": "say",
   "s": "bach_kinh_duong"
  },
  "704fcdd84841": {
   "f": "v704fcdd84841.mp3",
   "k": "say",
   "s": "bach_kinh_duong"
  },
  "8a69bc0d325a": {
   "f": "v8a69bc0d325a.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "760b2e540725": {
   "f": "v760b2e540725.mp3",
   "k": "say",
   "s": "bach_kinh_duong"
  },
  "49f6bc6717b3": {
   "f": "v49f6bc6717b3.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "2e417108a75e": {
   "f": "v2e417108a75e.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "b9f05fe38e81": {
   "f": "vb9f05fe38e81.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "71b7708e4fe1": {
   "f": "v71b7708e4fe1.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "e92b89b85d76": {
   "f": "ve92b89b85d76.mp3",
   "k": "say",
   "s": "tran_tu_linh"
  },
  "a67464be228d": {
   "f": "va67464be228d.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "36dc0f7bac2b": {
   "f": "v36dc0f7bac2b.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "9dfccc6bd23c": {
   "f": "v9dfccc6bd23c.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "a7f331c003dd": {
   "f": "va7f331c003dd.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "4661f0bec0ce": {
   "f": "v4661f0bec0ce.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "bec689c4eea1": {
   "f": "vbec689c4eea1.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "2e33d80bf84d": {
   "f": "v2e33d80bf84d.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "84fbf888fffd": {
   "f": "v84fbf888fffd.mp3",
   "k": "say",
   "s": "tran_tu_linh"
  },
  "22ea37d2c453": {
   "f": "v22ea37d2c453.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "9817bb7dc7d7": {
   "f": "v9817bb7dc7d7.mp3",
   "k": "say",
   "s": "hoa_huong_than"
  },
  "7077ee6977db": {
   "f": "v7077ee6977db.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "ccc9b07a6590": {
   "f": "vccc9b07a6590.mp3",
   "k": "say",
   "s": "cho_a"
  },
  "4b241e6f74d2": {
   "f": "v4b241e6f74d2.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "c6a67465ee01": {
   "f": "vc6a67465ee01.mp3",
   "k": "say",
   "s": "gia_nhan"
  },
  "fe7be0fb6ded": {
   "f": "vfe7be0fb6ded.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "cdc5349a872f": {
   "f": "vcdc5349a872f.mp3",
   "k": "say",
   "s": "gia_nhan"
  },
  "5464c1ecc3f3": {
   "f": "v5464c1ecc3f3.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "b2c2734b47a9": {
   "f": "vb2c2734b47a9.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "8318777ad9d7": {
   "f": "v8318777ad9d7.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "0b7c8aa28a65": {
   "f": "v0b7c8aa28a65.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "0b45f46acd1c": {
   "f": "v0b45f46acd1c.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "9c592a331fec": {
   "f": "v9c592a331fec.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "43a55e07b6a5": {
   "f": "v43a55e07b6a5.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "8dfdef7ef2ed": {
   "f": "v8dfdef7ef2ed.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "3019c0a0dff0": {
   "f": "v3019c0a0dff0.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "9d6a0471f5d6": {
   "f": "v9d6a0471f5d6.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "2ebfd95eb616": {
   "f": "v2ebfd95eb616.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "6284dfc7313a": {
   "f": "v6284dfc7313a.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "378f0017825d": {
   "f": "v378f0017825d.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "5858ad9d32be": {
   "f": "v5858ad9d32be.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "9a31d334f5e8": {
   "f": "v9a31d334f5e8.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "67831a528f2f": {
   "f": "v67831a528f2f.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "895272f0544c": {
   "f": "v895272f0544c.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "1842ca58b94a": {
   "f": "v1842ca58b94a.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "870239127518": {
   "f": "v870239127518.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "f02f0bd87ab0": {
   "f": "vf02f0bd87ab0.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "729343be5310": {
   "f": "v729343be5310.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "5b6b5de84f54": {
   "f": "v5b6b5de84f54.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "0144c4e4711e": {
   "f": "v0144c4e4711e.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "1758463c61a8": {
   "f": "v1758463c61a8.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "131965044653": {
   "f": "v131965044653.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "08198d2b67f5": {
   "f": "v08198d2b67f5.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "505eca3bdae7": {
   "f": "v505eca3bdae7.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "ce5deaad48d1": {
   "f": "vce5deaad48d1.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "7236d61362aa": {
   "f": "v7236d61362aa.mp3",
   "k": "say",
   "s": "hoa_huong_than"
  },
  "ca02d50d5b44": {
   "f": "vca02d50d5b44.mp3",
   "k": "say",
   "s": "lieu_khuynh_tien"
  },
  "cfd1f83020d1": {
   "f": "vcfd1f83020d1.mp3",
   "k": "say",
   "s": "tran_tu_linh"
  },
  "71b6fd9ec3ff": {
   "f": "v71b6fd9ec3ff.mp3",
   "k": "say",
   "s": "de_tu_a"
  },
  "c995da41f4fd": {
   "f": "vc995da41f4fd.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "d7d2e6f6b339": {
   "f": "vd7d2e6f6b339.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "805c4cee0e60": {
   "f": "v805c4cee0e60.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "843b9df13d74": {
   "f": "v843b9df13d74.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "ab7b1d2efdc1": {
   "f": "vab7b1d2efdc1.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "6c56d2644c47": {
   "f": "v6c56d2644c47.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "44d3a752a65b": {
   "f": "v44d3a752a65b.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "ce8c50f5aaf5": {
   "f": "vce8c50f5aaf5.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "cfe18a915df0": {
   "f": "vcfe18a915df0.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "246b5027e291": {
   "f": "v246b5027e291.mp3",
   "k": "say",
   "s": "hero"
  },
  "485a5b80c1ce": {
   "f": "v485a5b80c1ce.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "16476c09c34c": {
   "f": "v16476c09c34c.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "49c203e5874f": {
   "f": "v49c203e5874f.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "4b0d1e906c9b": {
   "f": "v4b0d1e906c9b.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "e4244c9285ba": {
   "f": "ve4244c9285ba.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "a01dd1af5074": {
   "f": "va01dd1af5074.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "bcc3be7ac37d": {
   "f": "vbcc3be7ac37d.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "936479d9f10c": {
   "f": "v936479d9f10c.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "92f7175ddf8b": {
   "f": "v92f7175ddf8b.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "47a0ee124deb": {
   "f": "v47a0ee124deb.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "6fc193b74c0c": {
   "f": "v6fc193b74c0c.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "f97e5eafb4e8": {
   "f": "vf97e5eafb4e8.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "5834fc920592": {
   "f": "v5834fc920592.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "930e6069dc42": {
   "f": "v930e6069dc42.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "8ec74bb6ad88": {
   "f": "v8ec74bb6ad88.mp3",
   "k": "inner",
   "s": "narrate"
  },
  "cc9f39f41039": {
   "f": "vcc9f39f41039.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "d10a2d177749": {
   "f": "vd10a2d177749.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "1c305ecfe601": {
   "f": "v1c305ecfe601.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "fcedcc801f9c": {
   "f": "vfcedcc801f9c.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "8cf698215760": {
   "f": "v8cf698215760.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "f04e1f98e196": {
   "f": "vf04e1f98e196.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "4e86a1036e7d": {
   "f": "v4e86a1036e7d.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "0b04cda01224": {
   "f": "v0b04cda01224.mp3",
   "k": "say",
   "s": "thap_chu"
  },
  "d00df80a0526": {
   "f": "vd00df80a0526.mp3",
   "k": "say",
   "s": "thap_chu"
  },
  "3eaa2dd5b871": {
   "f": "v3eaa2dd5b871.mp3",
   "k": "say",
   "s": "thap_chu"
  },
  "3718b05443e7": {
   "f": "v3718b05443e7.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "f4cfdf92ee7f": {
   "f": "vf4cfdf92ee7f.mp3",
   "k": "say",
   "s": "thap_chu"
  },
  "80dd495c2e12": {
   "f": "v80dd495c2e12.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "70c913db6209": {
   "f": "v70c913db6209.mp3",
   "k": "say",
   "s": "thap_chu"
  },
  "234cb1707b9c": {
   "f": "v234cb1707b9c.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "dbbc8a9200ea": {
   "f": "vdbbc8a9200ea.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "ffe186e5e22c": {
   "f": "vffe186e5e22c.mp3",
   "k": "say",
   "s": "thap_chu"
  },
  "71c0cdc16e21": {
   "f": "v71c0cdc16e21.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "5621cd0fd86b": {
   "f": "v5621cd0fd86b.mp3",
   "k": "say",
   "s": "thap_chu"
  },
  "ef0137479515": {
   "f": "vef0137479515.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "c73aeb33a139": {
   "f": "vc73aeb33a139.mp3",
   "k": "say",
   "s": "thap_chu"
  },
  "4d23782b5a2a": {
   "f": "v4d23782b5a2a.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "b29a7ff90d03": {
   "f": "vb29a7ff90d03.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "f2b39ef359a0": {
   "f": "vf2b39ef359a0.mp3",
   "k": "inner",
   "s": "narrate"
  },
  "3baa45e8a435": {
   "f": "v3baa45e8a435.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "b9bb9ba64668": {
   "f": "vb9bb9ba64668.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "fe3bac90e438": {
   "f": "vfe3bac90e438.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "d2f2f34620b6": {
   "f": "vd2f2f34620b6.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "9be6377a8032": {
   "f": "v9be6377a8032.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "ce36807696c4": {
   "f": "vce36807696c4.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "92d203ca998e": {
   "f": "v92d203ca998e.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "caf54d44f56e": {
   "f": "vcaf54d44f56e.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "455c79b8cef6": {
   "f": "v455c79b8cef6.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "b769d4b0eaa4": {
   "f": "vb769d4b0eaa4.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "871b4f3d5bce": {
   "f": "v871b4f3d5bce.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "45d944a1c75e": {
   "f": "v45d944a1c75e.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "9eeb1341827d": {
   "f": "v9eeb1341827d.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "fe800f20a684": {
   "f": "vfe800f20a684.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "1e29bc5d32be": {
   "f": "v1e29bc5d32be.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "2b3d2af4f48a": {
   "f": "v2b3d2af4f48a.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "43e0a81ea059": {
   "f": "v43e0a81ea059.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "2123b98a9f5c": {
   "f": "v2123b98a9f5c.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "16cfb0af8524": {
   "f": "v16cfb0af8524.mp3",
   "k": "say",
   "s": "de_tu_ho_tong"
  },
  "5374fe7e9b42": {
   "f": "v5374fe7e9b42.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "04ce546040bb": {
   "f": "v04ce546040bb.mp3",
   "k": "say",
   "s": "de_tu_ho_tong"
  },
  "eb8b9ac91ae9": {
   "f": "veb8b9ac91ae9.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "ff169ab17c61": {
   "f": "vff169ab17c61.mp3",
   "k": "say",
   "s": "de_tu_ho_tong"
  },
  "7ec8997b7c3a": {
   "f": "v7ec8997b7c3a.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "4a2b3e9e5a01": {
   "f": "v4a2b3e9e5a01.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "e4b109e5c5b0": {
   "f": "ve4b109e5c5b0.mp3",
   "k": "inner",
   "s": "narrate"
  },
  "565db3d47d93": {
   "f": "v565db3d47d93.mp3",
   "k": "say",
   "s": "de_tu_ho_tong"
  },
  "097554529738": {
   "f": "v097554529738.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "8ba7d1e09d07": {
   "f": "v8ba7d1e09d07.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "b8f608f44ec3": {
   "f": "vb8f608f44ec3.mp3",
   "k": "say",
   "s": "de_tu_ho_tong"
  },
  "01d61d37f092": {
   "f": "v01d61d37f092.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "561a6d7ed1a1": {
   "f": "v561a6d7ed1a1.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "c80f53afdc24": {
   "f": "vc80f53afdc24.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "ac12b92f2332": {
   "f": "vac12b92f2332.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "d4b3080ea5f4": {
   "f": "vd4b3080ea5f4.mp3",
   "k": "say",
   "s": "oan_hon"
  },
  "5a032fd964ce": {
   "f": "v5a032fd964ce.mp3",
   "k": "say",
   "s": "oan_hon"
  },
  "d29ea2517cc8": {
   "f": "vd29ea2517cc8.mp3",
   "k": "say",
   "s": "oan_hon"
  },
  "a8f996d74754": {
   "f": "va8f996d74754.mp3",
   "k": "say",
   "s": "oan_hon"
  },
  "6f00efa6b2c3": {
   "f": "v6f00efa6b2c3.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "92c24e938b03": {
   "f": "v92c24e938b03.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "0692d645b823": {
   "f": "v0692d645b823.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "ac7d05d0710f": {
   "f": "vac7d05d0710f.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "73b489b35dd1": {
   "f": "v73b489b35dd1.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "27ba5be2236d": {
   "f": "v27ba5be2236d.mp3",
   "k": "inner",
   "s": "narrate"
  },
  "93f8965cd6b0": {
   "f": "v93f8965cd6b0.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "8392e0ea76d2": {
   "f": "v8392e0ea76d2.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "e6b2d136244a": {
   "f": "ve6b2d136244a.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "7eba72603bef": {
   "f": "v7eba72603bef.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "f031c01f3f61": {
   "f": "vf031c01f3f61.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "3c36517fc071": {
   "f": "v3c36517fc071.mp3",
   "k": "inner",
   "s": "narrate"
  },
  "8037efe94830": {
   "f": "v8037efe94830.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "ed0d4bb8230b": {
   "f": "ved0d4bb8230b.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "f6a153cb7dcc": {
   "f": "vf6a153cb7dcc.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "8b48290422cd": {
   "f": "v8b48290422cd.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "3e516d3b8ace": {
   "f": "v3e516d3b8ace.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "0d00421cc4f3": {
   "f": "v0d00421cc4f3.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "fb4ce08f7f92": {
   "f": "vfb4ce08f7f92.mp3",
   "k": "say",
   "s": "lieu_khuynh_tien"
  },
  "7c8bc629c968": {
   "f": "v7c8bc629c968.mp3",
   "k": "say",
   "s": "de_tu_a"
  },
  "f4f6c46dab25": {
   "f": "vf4f6c46dab25.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "2a61a8b40c0f": {
   "f": "v2a61a8b40c0f.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "49a8f5920aca": {
   "f": "v49a8f5920aca.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "f8d41b12692d": {
   "f": "vf8d41b12692d.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "82a9599b5fbc": {
   "f": "v82a9599b5fbc.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "3195d1bbb5d6": {
   "f": "v3195d1bbb5d6.mp3",
   "k": "say",
   "s": "hoa_huong_than"
  },
  "7fd8b345da2b": {
   "f": "v7fd8b345da2b.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "305c6083bd74": {
   "f": "v305c6083bd74.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "d792cf93d788": {
   "f": "vd792cf93d788.mp3",
   "k": "say",
   "s": "de_tu_b"
  },
  "7c8c04c75784": {
   "f": "v7c8c04c75784.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "68016c9f031b": {
   "f": "v68016c9f031b.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "380d72f1b9ed": {
   "f": "v380d72f1b9ed.mp3",
   "k": "say",
   "s": "hoa_huong_than"
  },
  "da8f77e7e9a9": {
   "f": "vda8f77e7e9a9.mp3",
   "k": "say",
   "s": "de_tu_a"
  },
  "78467ca79730": {
   "f": "v78467ca79730.mp3",
   "k": "say",
   "s": "hoa_huong_than"
  },
  "85799cf76c92": {
   "f": "v85799cf76c92.mp3",
   "k": "say",
   "s": "de_tu_a"
  },
  "4658ca28b49d": {
   "f": "v4658ca28b49d.mp3",
   "k": "say",
   "s": "de_tu_a"
  },
  "adca4ea36aa8": {
   "f": "vadca4ea36aa8.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "61fb7d8e7034": {
   "f": "v61fb7d8e7034.mp3",
   "k": "say",
   "s": "de_tu_a"
  },
  "9e473b83363e": {
   "f": "v9e473b83363e.mp3",
   "k": "say",
   "s": "hoa_huong_than"
  },
  "396fb278bc0d": {
   "f": "v396fb278bc0d.mp3",
   "k": "say",
   "s": "lieu_khuynh_tien"
  },
  "026f42d5bca4": {
   "f": "v026f42d5bca4.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "fb6c6e11fc18": {
   "f": "vfb6c6e11fc18.mp3",
   "k": "say",
   "s": "tin_su"
  },
  "6a20b10790f8": {
   "f": "v6a20b10790f8.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "194cf4aef817": {
   "f": "v194cf4aef817.mp3",
   "k": "say",
   "s": "tin_su"
  },
  "8e08dcc50bd1": {
   "f": "v8e08dcc50bd1.mp3",
   "k": "say",
   "s": "tin_su"
  },
  "872f99dd406c": {
   "f": "v872f99dd406c.mp3",
   "k": "say",
   "s": "tin_su"
  },
  "b53997508e25": {
   "f": "vb53997508e25.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "178990f9b3d5": {
   "f": "v178990f9b3d5.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "78ccac4d0174": {
   "f": "v78ccac4d0174.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "3770a51e9629": {
   "f": "v3770a51e9629.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "d7bc93db0075": {
   "f": "vd7bc93db0075.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "22a1d72ff4a1": {
   "f": "v22a1d72ff4a1.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "80c12a6f8fe8": {
   "f": "v80c12a6f8fe8.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "9ed4c9399d99": {
   "f": "v9ed4c9399d99.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "7dc8f30639fe": {
   "f": "v7dc8f30639fe.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "7f5722bb7b06": {
   "f": "v7f5722bb7b06.mp3",
   "k": "say",
   "s": "tin_su"
  },
  "0b97cf4d4064": {
   "f": "v0b97cf4d4064.mp3",
   "k": "say",
   "s": "tin_su_b"
  },
  "6fdbdcdf4a49": {
   "f": "v6fdbdcdf4a49.mp3",
   "k": "say",
   "s": "tin_su"
  },
  "00feeb001092": {
   "f": "v00feeb001092.mp3",
   "k": "say",
   "s": "tin_su_b"
  },
  "d589b0c7d386": {
   "f": "vd589b0c7d386.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "0030d6d7272b": {
   "f": "v0030d6d7272b.mp3",
   "k": "say",
   "s": "tin_su_b"
  },
  "bfaf2a4ac8c3": {
   "f": "vbfaf2a4ac8c3.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "504b2c115247": {
   "f": "v504b2c115247.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "69b6978f2e5d": {
   "f": "v69b6978f2e5d.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "3a88f59814ae": {
   "f": "v3a88f59814ae.mp3",
   "k": "say",
   "s": "dan_thanh_a"
  },
  "9e2071c673fb": {
   "f": "v9e2071c673fb.mp3",
   "k": "say",
   "s": "dan_thanh_a"
  },
  "2385b5882d17": {
   "f": "v2385b5882d17.mp3",
   "k": "say",
   "s": "dan_thanh_a"
  },
  "36debd59fca7": {
   "f": "v36debd59fca7.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "a7cc0f29b747": {
   "f": "va7cc0f29b747.mp3",
   "k": "say",
   "s": "dan_c"
  },
  "19437d6295e2": {
   "f": "v19437d6295e2.mp3",
   "k": "say",
   "s": "dan_c"
  },
  "5c09c19b9662": {
   "f": "v5c09c19b9662.mp3",
   "k": "say",
   "s": "dan_c"
  },
  "f1a8df7c5008": {
   "f": "vf1a8df7c5008.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "b38f5cb90c6b": {
   "f": "vb38f5cb90c6b.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "f4caead0d69f": {
   "f": "vf4caead0d69f.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "354b08ab65ab": {
   "f": "v354b08ab65ab.mp3",
   "k": "say",
   "s": "dan_a"
  },
  "68bae078edf6": {
   "f": "v68bae078edf6.mp3",
   "k": "say",
   "s": "dan_a"
  },
  "74f4f7b73b9f": {
   "f": "v74f4f7b73b9f.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "45e1fdf95d6c": {
   "f": "v45e1fdf95d6c.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "d32cabdd2333": {
   "f": "vd32cabdd2333.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "95651625f3c2": {
   "f": "v95651625f3c2.mp3",
   "k": "say",
   "s": "dan_a"
  },
  "cdb3d349d537": {
   "f": "vcdb3d349d537.mp3",
   "k": "say",
   "s": "dan_a"
  },
  "05326422c2f1": {
   "f": "v05326422c2f1.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "7c66ffb75beb": {
   "f": "v7c66ffb75beb.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "54400255e436": {
   "f": "v54400255e436.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "05ecae1ea032": {
   "f": "v05ecae1ea032.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "896599fcdde3": {
   "f": "v896599fcdde3.mp3",
   "k": "say",
   "s": "tin_su"
  },
  "1632fe54e462": {
   "f": "v1632fe54e462.mp3",
   "k": "say",
   "s": "tin_su_b"
  },
  "ff7756c0803e": {
   "f": "vff7756c0803e.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "d21849c09174": {
   "f": "vd21849c09174.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "d90c9a257d3f": {
   "f": "vd90c9a257d3f.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "b90ade6d80eb": {
   "f": "vb90ade6d80eb.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "16419ce5a54e": {
   "f": "v16419ce5a54e.mp3",
   "k": "say",
   "s": "cho_a"
  },
  "6cd3f2012859": {
   "f": "v6cd3f2012859.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "4fbda1e2c553": {
   "f": "v4fbda1e2c553.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "72251c267273": {
   "f": "v72251c267273.mp3",
   "k": "say",
   "s": "cho_a"
  },
  "2aadc1c6be2f": {
   "f": "v2aadc1c6be2f.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "fedfb7ef4d1e": {
   "f": "vfedfb7ef4d1e.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "2bf19508749c": {
   "f": "v2bf19508749c.mp3",
   "k": "say",
   "s": "de_tu_ho_tong"
  },
  "60c48069fb02": {
   "f": "v60c48069fb02.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "2ffa774c7926": {
   "f": "v2ffa774c7926.mp3",
   "k": "say",
   "s": "de_tu_ho_tong"
  },
  "cb10a4ea8726": {
   "f": "vcb10a4ea8726.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "3324b286b600": {
   "f": "v3324b286b600.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "0aefcd65a449": {
   "f": "v0aefcd65a449.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "a5465239bd3e": {
   "f": "va5465239bd3e.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "68dee3579be7": {
   "f": "v68dee3579be7.mp3",
   "k": "say",
   "s": "de_tu_b"
  },
  "af5c0f91b803": {
   "f": "vaf5c0f91b803.mp3",
   "k": "say",
   "s": "chi_huy_tran"
  },
  "946fa218554e": {
   "f": "v946fa218554e.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "3b6f589b2ce4": {
   "f": "v3b6f589b2ce4.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "fdf975fe3be0": {
   "f": "vfdf975fe3be0.mp3",
   "k": "say",
   "s": "de_tu_b"
  },
  "3c095ba724e3": {
   "f": "v3c095ba724e3.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "35c9d8f5e370": {
   "f": "v35c9d8f5e370.mp3",
   "k": "say",
   "s": "de_tu_b"
  },
  "661af0054b7b": {
   "f": "v661af0054b7b.mp3",
   "k": "say",
   "s": "chi_huy_tran"
  },
  "e4173468f542": {
   "f": "ve4173468f542.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "28a8cbe9d958": {
   "f": "v28a8cbe9d958.mp3",
   "k": "say",
   "s": "de_tu_ho_tong"
  },
  "b8564a92a7c5": {
   "f": "vb8564a92a7c5.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "2b757c700a3a": {
   "f": "v2b757c700a3a.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "f5ffa4dd8cf6": {
   "f": "vf5ffa4dd8cf6.mp3",
   "k": "say",
   "s": "huyet_de"
  },
  "7123d372cb1b": {
   "f": "v7123d372cb1b.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "e19697593302": {
   "f": "ve19697593302.mp3",
   "k": "say",
   "s": "huyet_de"
  },
  "64d2e03a260e": {
   "f": "v64d2e03a260e.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "4ba3f3b55ce5": {
   "f": "v4ba3f3b55ce5.mp3",
   "k": "say",
   "s": "chi_huy_tran"
  },
  "de61f1fd9e5a": {
   "f": "vde61f1fd9e5a.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "80f841f94654": {
   "f": "v80f841f94654.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "471acfca838a": {
   "f": "v471acfca838a.mp3",
   "k": "say",
   "s": "de_tu_ho_tong"
  },
  "c5c33dc4b449": {
   "f": "vc5c33dc4b449.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "714dfcb059ab": {
   "f": "v714dfcb059ab.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "b2969cc065ed": {
   "f": "vb2969cc065ed.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "61b17ba4715f": {
   "f": "v61b17ba4715f.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "e49f5063fb12": {
   "f": "ve49f5063fb12.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "0651c3bfd9bc": {
   "f": "v0651c3bfd9bc.mp3",
   "k": "say",
   "s": "lieu_khuynh_tien"
  },
  "40f627bcbd94": {
   "f": "v40f627bcbd94.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "8c293edca6d6": {
   "f": "v8c293edca6d6.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "cb288dab1e5c": {
   "f": "vcb288dab1e5c.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "8598ef65a96d": {
   "f": "v8598ef65a96d.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "ad37abbc8d9e": {
   "f": "vad37abbc8d9e.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "60c9f7a20fc8": {
   "f": "v60c9f7a20fc8.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "790aa35034bf": {
   "f": "v790aa35034bf.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "af539162d31e": {
   "f": "vaf539162d31e.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "034c8b4cc6b4": {
   "f": "v034c8b4cc6b4.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "878468d2c6fa": {
   "f": "v878468d2c6fa.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "2a64e167c5a4": {
   "f": "v2a64e167c5a4.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "071f371a356e": {
   "f": "v071f371a356e.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "dfc5ccb992de": {
   "f": "vdfc5ccb992de.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "8a95f9ff2f72": {
   "f": "v8a95f9ff2f72.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "c43f8ff9de8a": {
   "f": "vc43f8ff9de8a.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "14b23b971cc8": {
   "f": "v14b23b971cc8.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "1ac97f998949": {
   "f": "v1ac97f998949.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "28464f667088": {
   "f": "v28464f667088.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "9d4991b337f1": {
   "f": "v9d4991b337f1.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "f3bcb08600c3": {
   "f": "vf3bcb08600c3.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "25aff50c0dad": {
   "f": "v25aff50c0dad.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "61859eea0448": {
   "f": "v61859eea0448.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "fbda0078866c": {
   "f": "vfbda0078866c.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "b4dbd5486233": {
   "f": "vb4dbd5486233.mp3",
   "k": "say",
   "s": "lieu_khuynh_tien"
  },
  "dc164d5cec0f": {
   "f": "vdc164d5cec0f.mp3",
   "k": "say",
   "s": "lieu_khuynh_tien"
  },
  "7966548e4888": {
   "f": "v7966548e4888.mp3",
   "k": "say",
   "s": "lieu_khuynh_tien"
  },
  "43ea005c1c51": {
   "f": "v43ea005c1c51.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "f02592364238": {
   "f": "vf02592364238.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "99e29a2294bc": {
   "f": "v99e29a2294bc.mp3",
   "k": "say",
   "s": "lieu_khuynh_tien"
  },
  "45407aa35557": {
   "f": "v45407aa35557.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "a1d626259f93": {
   "f": "va1d626259f93.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "59fed13f70d9": {
   "f": "v59fed13f70d9.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "54f28f71e9ee": {
   "f": "v54f28f71e9ee.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "9c4ae969215e": {
   "f": "v9c4ae969215e.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "db181f176b5e": {
   "f": "vdb181f176b5e.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "65a006190c7d": {
   "f": "v65a006190c7d.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "b30cbb8ceb29": {
   "f": "vb30cbb8ceb29.mp3",
   "k": "say",
   "s": "tran_tu_linh"
  },
  "23924df8ca5f": {
   "f": "v23924df8ca5f.mp3",
   "k": "say",
   "s": "tran_tu_linh"
  },
  "d1e338de7af6": {
   "f": "vd1e338de7af6.mp3",
   "k": "say",
   "s": "tran_tu_linh"
  },
  "013b50a19b14": {
   "f": "v013b50a19b14.mp3",
   "k": "say",
   "s": "tran_tu_linh"
  },
  "c9ca2c670cdc": {
   "f": "vc9ca2c670cdc.mp3",
   "k": "say",
   "s": "tran_tu_linh"
  },
  "a41dbdc509a0": {
   "f": "va41dbdc509a0.mp3",
   "k": "say",
   "s": "tran_tu_linh"
  },
  "f0bfdddf81c7": {
   "f": "vf0bfdddf81c7.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "ef759fe3eab4": {
   "f": "vef759fe3eab4.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "ef3b5abc45ff": {
   "f": "vef3b5abc45ff.mp3",
   "k": "say",
   "s": "chap_su_thap"
  },
  "ebf907759f4b": {
   "f": "vebf907759f4b.mp3",
   "k": "say",
   "s": "di_ninh"
  },
  "638dbc2858cb": {
   "f": "v638dbc2858cb.mp3",
   "k": "say",
   "s": "dan_thanh_a"
  },
  "eac3d5b03830": {
   "f": "veac3d5b03830.mp3",
   "k": "say",
   "s": "thap_chu"
  },
  "070dbcf44085": {
   "f": "v070dbcf44085.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "483ec225e681": {
   "f": "v483ec225e681.mp3",
   "k": "say",
   "s": "chap_su_thap"
  },
  "836795181360": {
   "f": "v836795181360.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "0c1bef9470c5": {
   "f": "v0c1bef9470c5.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "eff50a8addc7": {
   "f": "veff50a8addc7.mp3",
   "k": "say",
   "s": "thap_chu"
  },
  "0f118101c403": {
   "f": "v0f118101c403.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "19bb37d510a0": {
   "f": "v19bb37d510a0.mp3",
   "k": "say",
   "s": "dan_thanh_a"
  },
  "682d169bcd33": {
   "f": "v682d169bcd33.mp3",
   "k": "say",
   "s": "di_ninh"
  },
  "ce677c6ac071": {
   "f": "vce677c6ac071.mp3",
   "k": "say",
   "s": "chap_su_thap"
  },
  "64aef6a786bc": {
   "f": "v64aef6a786bc.mp3",
   "k": "say",
   "s": "chap_su_thap"
  },
  "7beb9585cd87": {
   "f": "v7beb9585cd87.mp3",
   "k": "say",
   "s": "di_ninh"
  },
  "5bbaade7339b": {
   "f": "v5bbaade7339b.mp3",
   "k": "say",
   "s": "chap_su_thap"
  },
  "89236ca9925b": {
   "f": "v89236ca9925b.mp3",
   "k": "say",
   "s": "di_ninh"
  },
  "1328576b3636": {
   "f": "v1328576b3636.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "1cd3c357c133": {
   "f": "v1cd3c357c133.mp3",
   "k": "say",
   "s": "chap_su_thap"
  },
  "5fe5742ab35c": {
   "f": "v5fe5742ab35c.mp3",
   "k": "say",
   "s": "di_ninh"
  },
  "9d88e874c4fa": {
   "f": "v9d88e874c4fa.mp3",
   "k": "say",
   "s": "thap_chu"
  },
  "bf4a3b288909": {
   "f": "vbf4a3b288909.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "bf9c0178ca51": {
   "f": "vbf9c0178ca51.mp3",
   "k": "say",
   "s": "di_ninh"
  },
  "663baeb7f6d6": {
   "f": "v663baeb7f6d6.mp3",
   "k": "say",
   "s": "di_ninh"
  },
  "cd7601a0b638": {
   "f": "vcd7601a0b638.mp3",
   "k": "say",
   "s": "di_ninh"
  },
  "99fa01c9274e": {
   "f": "v99fa01c9274e.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "3f83c499cb69": {
   "f": "v3f83c499cb69.mp3",
   "k": "say",
   "s": "di_ninh"
  },
  "00e1bda96c1f": {
   "f": "v00e1bda96c1f.mp3",
   "k": "say",
   "s": "di_ninh"
  },
  "80a6c8d1efe0": {
   "f": "v80a6c8d1efe0.mp3",
   "k": "say",
   "s": "di_ninh"
  },
  "779d5922816a": {
   "f": "v779d5922816a.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "b6abf6f2d188": {
   "f": "vb6abf6f2d188.mp3",
   "k": "say",
   "s": "di_ninh"
  },
  "1514632158a7": {
   "f": "v1514632158a7.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "1844b9db5b06": {
   "f": "v1844b9db5b06.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "dfba5388fa08": {
   "f": "vdfba5388fa08.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "b887f2c15f17": {
   "f": "vb887f2c15f17.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "f66c2d647d0f": {
   "f": "vf66c2d647d0f.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "d4194df779f1": {
   "f": "vd4194df779f1.mp3",
   "k": "say",
   "s": "quan_phu"
  },
  "64d214b013cb": {
   "f": "v64d214b013cb.mp3",
   "k": "say",
   "s": "gia_chu_ta"
  },
  "e9988cadfc33": {
   "f": "ve9988cadfc33.mp3",
   "k": "say",
   "s": "gia_chu_do"
  },
  "522bcf7b88a1": {
   "f": "v522bcf7b88a1.mp3",
   "k": "say",
   "s": "quan_phu"
  },
  "e75369bee73a": {
   "f": "ve75369bee73a.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "7b125c0defd7": {
   "f": "v7b125c0defd7.mp3",
   "k": "say",
   "s": "gia_chu_ta"
  },
  "b27fa635eff6": {
   "f": "vb27fa635eff6.mp3",
   "k": "say",
   "s": "gia_chu_do"
  },
  "beb195d2edd2": {
   "f": "vbeb195d2edd2.mp3",
   "k": "say",
   "s": "dan_thanh_a"
  },
  "47163dd6fa80": {
   "f": "v47163dd6fa80.mp3",
   "k": "say",
   "s": "dan_thanh_b"
  },
  "2b196413b720": {
   "f": "v2b196413b720.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "c7d5fb4f1719": {
   "f": "vc7d5fb4f1719.mp3",
   "k": "say",
   "s": "gia_chu_ta"
  },
  "066380f1188a": {
   "f": "v066380f1188a.mp3",
   "k": "say",
   "s": "gia_chu_ta"
  },
  "f2cce3674f8d": {
   "f": "vf2cce3674f8d.mp3",
   "k": "say",
   "s": "gia_chu_ta"
  },
  "831b4e1f1421": {
   "f": "v831b4e1f1421.mp3",
   "k": "say",
   "s": "gia_chu_ta"
  },
  "e93805bfebb4": {
   "f": "ve93805bfebb4.mp3",
   "k": "say",
   "s": "gia_chu_ta"
  },
  "ab6a7240022b": {
   "f": "vab6a7240022b.mp3",
   "k": "say",
   "s": "gia_chu_ta"
  },
  "d458bf746349": {
   "f": "vd458bf746349.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "1a9e330b934c": {
   "f": "v1a9e330b934c.mp3",
   "k": "say",
   "s": "gia_chu_ta"
  },
  "b64880d42da4": {
   "f": "vb64880d42da4.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "2ceefcc35b3d": {
   "f": "v2ceefcc35b3d.mp3",
   "k": "say",
   "s": "gia_chu_ta"
  },
  "cd258a773cc0": {
   "f": "vcd258a773cc0.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "2834a9822fba": {
   "f": "v2834a9822fba.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "58991796dc76": {
   "f": "v58991796dc76.mp3",
   "k": "say",
   "s": "vo_dich_doi_thu"
  },
  "88efb448e6ef": {
   "f": "v88efb448e6ef.mp3",
   "k": "say",
   "s": "gia_chu_do"
  },
  "5b19309f8b1b": {
   "f": "v5b19309f8b1b.mp3",
   "k": "say",
   "s": "quan_phu"
  },
  "82d04079dbf1": {
   "f": "v82d04079dbf1.mp3",
   "k": "say",
   "s": "dan_thanh_b"
  },
  "6c45d93deb00": {
   "f": "v6c45d93deb00.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "aaa22684daad": {
   "f": "vaaa22684daad.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "827b75d5108d": {
   "f": "v827b75d5108d.mp3",
   "k": "say",
   "s": "vo_dich_doi_thu"
  },
  "c6b6a5ef0e7f": {
   "f": "vc6b6a5ef0e7f.mp3",
   "k": "say",
   "s": "gia_chu_do"
  },
  "22d5c95e2362": {
   "f": "v22d5c95e2362.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "02e7347d9e94": {
   "f": "v02e7347d9e94.mp3",
   "k": "say",
   "s": "dan_thanh_a"
  },
  "fe3943da4422": {
   "f": "vfe3943da4422.mp3",
   "k": "say",
   "s": "quan_phu"
  },
  "94cb3b1ef90a": {
   "f": "v94cb3b1ef90a.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "50b61e2a624b": {
   "f": "v50b61e2a624b.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "fa4411767a64": {
   "f": "vfa4411767a64.mp3",
   "k": "say",
   "s": "cho_b"
  },
  "3f8a14e91a3e": {
   "f": "v3f8a14e91a3e.mp3",
   "k": "say",
   "s": "cho_a"
  },
  "16eafb354b64": {
   "f": "v16eafb354b64.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "17434d39f407": {
   "f": "v17434d39f407.mp3",
   "k": "say",
   "s": "dan_thanh_a"
  },
  "7a18cc2c6f77": {
   "f": "v7a18cc2c6f77.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "d1e35178b461": {
   "f": "vd1e35178b461.mp3",
   "k": "say",
   "s": "quan_phu"
  },
  "c7239b207d4d": {
   "f": "vc7239b207d4d.mp3",
   "k": "say",
   "s": "dan_thanh_a"
  },
  "acd18ec935d7": {
   "f": "vacd18ec935d7.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "e92250ca53ca": {
   "f": "ve92250ca53ca.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "92bd35680333": {
   "f": "v92bd35680333.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "2dd2d27a64b2": {
   "f": "v2dd2d27a64b2.mp3",
   "k": "say",
   "s": "gia_chu_ta"
  },
  "1f3d5d931040": {
   "f": "v1f3d5d931040.mp3",
   "k": "say",
   "s": "gia_chu_do"
  },
  "25983f06bad2": {
   "f": "v25983f06bad2.mp3",
   "k": "say",
   "s": "quan_phu"
  },
  "9a34670b7982": {
   "f": "v9a34670b7982.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "516cfe88f6cd": {
   "f": "v516cfe88f6cd.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "e2cc89e86068": {
   "f": "ve2cc89e86068.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "270d4994aa01": {
   "f": "v270d4994aa01.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "c74d6f191532": {
   "f": "vc74d6f191532.mp3",
   "k": "say",
   "s": "quan_phu"
  },
  "50328e1dbf1b": {
   "f": "v50328e1dbf1b.mp3",
   "k": "say",
   "s": "quan_phu"
  },
  "c17b67eb105f": {
   "f": "vc17b67eb105f.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "16b489b44691": {
   "f": "v16b489b44691.mp3",
   "k": "say",
   "s": "dan_thanh_b"
  },
  "c407cfddd17d": {
   "f": "vc407cfddd17d.mp3",
   "k": "say",
   "s": "dan_thanh_a"
  },
  "f5e65cde4bef": {
   "f": "vf5e65cde4bef.mp3",
   "k": "say",
   "s": "chinh_ngon"
  },
  "7b3b4caf48bd": {
   "f": "v7b3b4caf48bd.mp3",
   "k": "say",
   "s": "gia_chu_ta"
  },
  "320010855dd6": {
   "f": "v320010855dd6.mp3",
   "k": "say",
   "s": "gia_chu_do"
  },
  "dc9a6787199b": {
   "f": "vdc9a6787199b.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "d85f20006e66": {
   "f": "vd85f20006e66.mp3",
   "k": "say",
   "s": "gia_chu_do"
  },
  "f03dfd73e210": {
   "f": "vf03dfd73e210.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "fead64b86c33": {
   "f": "vfead64b86c33.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "aeaf8a80b740": {
   "f": "vaeaf8a80b740.mp3",
   "k": "say",
   "s": "dan_c"
  },
  "7d8bc2d1fc37": {
   "f": "v7d8bc2d1fc37.mp3",
   "k": "say",
   "s": "dan_thanh_a"
  },
  "fee95320c9fd": {
   "f": "vfee95320c9fd.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "7044dc07d749": {
   "f": "v7044dc07d749.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "25d7c857e239": {
   "f": "v25d7c857e239.mp3",
   "k": "say",
   "s": "dan_thanh_b"
  },
  "1f2627442615": {
   "f": "v1f2627442615.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "ebf0ed024e8b": {
   "f": "vebf0ed024e8b.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "788f71c78a7d": {
   "f": "v788f71c78a7d.mp3",
   "k": "say",
   "s": "dan_c"
  },
  "fcf054aee630": {
   "f": "vfcf054aee630.mp3",
   "k": "say",
   "s": "dan_thanh_b"
  },
  "a931753e99ac": {
   "f": "va931753e99ac.mp3",
   "k": "say",
   "s": "dan_thanh_a"
  },
  "5cee57beec93": {
   "f": "v5cee57beec93.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "7ba11c0f5c17": {
   "f": "v7ba11c0f5c17.mp3",
   "k": "say",
   "s": "dan_c"
  },
  "841317f4d4d8": {
   "f": "v841317f4d4d8.mp3",
   "k": "say",
   "s": "dan_thanh_b"
  },
  "7fe41b2af2bc": {
   "f": "v7fe41b2af2bc.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "e3847efc7a11": {
   "f": "ve3847efc7a11.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "66973791450f": {
   "f": "v66973791450f.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "0b5a8b23875b": {
   "f": "v0b5a8b23875b.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "5e2bc2525c4f": {
   "f": "v5e2bc2525c4f.mp3",
   "k": "say",
   "s": "quan_phu"
  },
  "72d5b846d9a6": {
   "f": "v72d5b846d9a6.mp3",
   "k": "say",
   "s": "gia_chu_ta"
  },
  "fb51203a2499": {
   "f": "vfb51203a2499.mp3",
   "k": "say",
   "s": "dan_thanh_a"
  },
  "b0aaafe923a9": {
   "f": "vb0aaafe923a9.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "bab67ad9877f": {
   "f": "vbab67ad9877f.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "3092953c540b": {
   "f": "v3092953c540b.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "61c254ca9486": {
   "f": "v61c254ca9486.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "41221ee90bca": {
   "f": "v41221ee90bca.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "d938d9ff0b7d": {
   "f": "vd938d9ff0b7d.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "df366dfcea59": {
   "f": "vdf366dfcea59.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "41498aed1219": {
   "f": "v41498aed1219.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "2e6cef7b90c4": {
   "f": "v2e6cef7b90c4.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "470a09acc558": {
   "f": "v470a09acc558.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "0a1baa4f9098": {
   "f": "v0a1baa4f9098.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "18d6696d6109": {
   "f": "v18d6696d6109.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "0a11f22b418c": {
   "f": "v0a11f22b418c.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "a0d5f41915ef": {
   "f": "va0d5f41915ef.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "35d1dfc5b366": {
   "f": "v35d1dfc5b366.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "8c2a76f38a42": {
   "f": "v8c2a76f38a42.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "d400626a02a9": {
   "f": "vd400626a02a9.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "ef79cbd23e25": {
   "f": "vef79cbd23e25.mp3",
   "k": "say",
   "s": "tran_chinh_dao"
  },
  "6a9e0f73a9fe": {
   "f": "v6a9e0f73a9fe.mp3",
   "k": "say",
   "s": "tran_chinh_dao"
  },
  "5949396b7915": {
   "f": "v5949396b7915.mp3",
   "k": "say",
   "s": "tran_chinh_dao"
  },
  "041e7bad0158": {
   "f": "v041e7bad0158.mp3",
   "k": "say",
   "s": "tran_chinh_dao"
  },
  "548c79de6c1d": {
   "f": "v548c79de6c1d.mp3",
   "k": "say",
   "s": "tran_chinh_dao"
  },
  "55b2438c7fb1": {
   "f": "v55b2438c7fb1.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "ac182337e625": {
   "f": "vac182337e625.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "60e607b1b8f4": {
   "f": "v60e607b1b8f4.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "a074b5bcab53": {
   "f": "va074b5bcab53.mp3",
   "k": "say",
   "s": "cho_a"
  },
  "981c9acbd171": {
   "f": "v981c9acbd171.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "1f4a062939dc": {
   "f": "v1f4a062939dc.mp3",
   "k": "say",
   "s": "tiep_khach"
  },
  "876903ad9971": {
   "f": "v876903ad9971.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "c04e12548bc0": {
   "f": "vc04e12548bc0.mp3",
   "k": "say",
   "s": "ky_luc_quan"
  },
  "709d6d964117": {
   "f": "v709d6d964117.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "3082588caa1b": {
   "f": "v3082588caa1b.mp3",
   "k": "say",
   "s": "dan_thanh_b"
  },
  "c94939bafd45": {
   "f": "vc94939bafd45.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "fc799fb059d7": {
   "f": "vfc799fb059d7.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "ddba47d36b0b": {
   "f": "vddba47d36b0b.mp3",
   "k": "say",
   "s": "gac_kho"
  },
  "e4ae568f3f0b": {
   "f": "ve4ae568f3f0b.mp3",
   "k": "say",
   "s": "gac_kho"
  },
  "e95daad77668": {
   "f": "ve95daad77668.mp3",
   "k": "say",
   "s": "gac_kho"
  },
  "a68c91f530eb": {
   "f": "va68c91f530eb.mp3",
   "k": "say",
   "s": "gac_kho"
  },
  "2809d238613a": {
   "f": "v2809d238613a.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "745a2ac7355a": {
   "f": "v745a2ac7355a.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "07d337094da1": {
   "f": "v07d337094da1.mp3",
   "k": "say",
   "s": "tran_tu_linh"
  },
  "c608106c0446": {
   "f": "vc608106c0446.mp3",
   "k": "say",
   "s": "tran_tu_linh"
  },
  "1370ba3c685c": {
   "f": "v1370ba3c685c.mp3",
   "k": "say",
   "s": "tran_tu_linh"
  },
  "76838894224b": {
   "f": "v76838894224b.mp3",
   "k": "say",
   "s": "tran_tu_linh"
  },
  "98beca74d946": {
   "f": "v98beca74d946.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "3a64f89ed800": {
   "f": "v3a64f89ed800.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "903f7dcc92ce": {
   "f": "v903f7dcc92ce.mp3",
   "k": "say",
   "s": "ky_luc_quan"
  },
  "10bf1e5af442": {
   "f": "v10bf1e5af442.mp3",
   "k": "say",
   "s": "dan_thanh_a"
  },
  "7b3464fc1c33": {
   "f": "v7b3464fc1c33.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "adc8c500bad0": {
   "f": "vadc8c500bad0.mp3",
   "k": "say",
   "s": "de_tu_a"
  },
  "6887532ee9a5": {
   "f": "v6887532ee9a5.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "1a58b930db5a": {
   "f": "v1a58b930db5a.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "f0358fc245d9": {
   "f": "vf0358fc245d9.mp3",
   "k": "say",
   "s": "de_tu_b"
  },
  "fec9481fde31": {
   "f": "vfec9481fde31.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "36de34bef1ad": {
   "f": "v36de34bef1ad.mp3",
   "k": "say",
   "s": "de_tu_a"
  },
  "20fde706e032": {
   "f": "v20fde706e032.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "6386a9cad77b": {
   "f": "v6386a9cad77b.mp3",
   "k": "say",
   "s": "oan_hon"
  },
  "497073653fa8": {
   "f": "v497073653fa8.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "45fbed8053f1": {
   "f": "v45fbed8053f1.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "cae4f1b46305": {
   "f": "vcae4f1b46305.mp3",
   "k": "say",
   "s": "oan_hon"
  },
  "a5021f55bcf5": {
   "f": "va5021f55bcf5.mp3",
   "k": "say",
   "s": "de_tu_b"
  },
  "34c633452a06": {
   "f": "v34c633452a06.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "5d5074ea04c2": {
   "f": "v5d5074ea04c2.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "b38b7ce9cf71": {
   "f": "vb38b7ce9cf71.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "b13c4fe6aa1d": {
   "f": "vb13c4fe6aa1d.mp3",
   "k": "say",
   "s": "de_tu_b"
  },
  "736aa231d26e": {
   "f": "v736aa231d26e.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "2a4980ff058b": {
   "f": "v2a4980ff058b.mp3",
   "k": "say",
   "s": "de_tu_a"
  },
  "494eb59c4ad8": {
   "f": "v494eb59c4ad8.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "0acd9bbba238": {
   "f": "v0acd9bbba238.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "902467e7919c": {
   "f": "v902467e7919c.mp3",
   "k": "say",
   "s": "tran_chinh_dao"
  },
  "ebed51507039": {
   "f": "vebed51507039.mp3",
   "k": "say",
   "s": "tran_chinh_dao"
  },
  "e53fc3b76ce2": {
   "f": "ve53fc3b76ce2.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "92755c4e70fc": {
   "f": "v92755c4e70fc.mp3",
   "k": "say",
   "s": "ky_luc_quan"
  },
  "474d889d68b6": {
   "f": "v474d889d68b6.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "00d1fc336c84": {
   "f": "v00d1fc336c84.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "c5926af49f44": {
   "f": "vc5926af49f44.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "0969aa161646": {
   "f": "v0969aa161646.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "0f90ffef8ff8": {
   "f": "v0f90ffef8ff8.mp3",
   "k": "say",
   "s": "hoa_huong_than"
  },
  "15b80066f0d3": {
   "f": "v15b80066f0d3.mp3",
   "k": "say",
   "s": "de_tu_b"
  },
  "f4f73d2a79e0": {
   "f": "vf4f73d2a79e0.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "8e1b5869f307": {
   "f": "v8e1b5869f307.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "b819f301fe35": {
   "f": "vb819f301fe35.mp3",
   "k": "say",
   "s": "tran_chinh_dao"
  },
  "8c96c71f38eb": {
   "f": "v8c96c71f38eb.mp3",
   "k": "say",
   "s": "bach_kinh_duong"
  },
  "03cb1f5cd8ea": {
   "f": "v03cb1f5cd8ea.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "34cd8ad82a8b": {
   "f": "v34cd8ad82a8b.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "e76f60054f71": {
   "f": "ve76f60054f71.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "478fe668bee3": {
   "f": "v478fe668bee3.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "6a706008a60d": {
   "f": "v6a706008a60d.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "734464f69464": {
   "f": "v734464f69464.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "20a0458dea1d": {
   "f": "v20a0458dea1d.mp3",
   "k": "say",
   "s": "hoa_huong_than"
  },
  "490ccbf1961c": {
   "f": "v490ccbf1961c.mp3",
   "k": "say",
   "s": "de_tu_b"
  },
  "5626b9a8c79a": {
   "f": "v5626b9a8c79a.mp3",
   "k": "say",
   "s": "hoa_huong_than"
  },
  "baff61e6535a": {
   "f": "vbaff61e6535a.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "5998db194802": {
   "f": "v5998db194802.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "20fb2c2e5dff": {
   "f": "v20fb2c2e5dff.mp3",
   "k": "say",
   "s": "truong_doan"
  },
  "38237d5e9db2": {
   "f": "v38237d5e9db2.mp3",
   "k": "say",
   "s": "ep_gia"
  },
  "333820d09fef": {
   "f": "v333820d09fef.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "6359fccc4cba": {
   "f": "v6359fccc4cba.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "52270070be6a": {
   "f": "v52270070be6a.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "69253ff83d28": {
   "f": "v69253ff83d28.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "7c15537189e0": {
   "f": "v7c15537189e0.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "1db34386a0da": {
   "f": "v1db34386a0da.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "bce0734dcfca": {
   "f": "vbce0734dcfca.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "47f072ea0557": {
   "f": "v47f072ea0557.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "eaf0093b6cee": {
   "f": "veaf0093b6cee.mp3",
   "k": "say",
   "s": "dan_thanh_a"
  },
  "298ecae7e685": {
   "f": "v298ecae7e685.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "a2d90a61b6e1": {
   "f": "va2d90a61b6e1.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "6fbcd077a0aa": {
   "f": "v6fbcd077a0aa.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "aa349a45d639": {
   "f": "vaa349a45d639.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "c03cfd7967a8": {
   "f": "vc03cfd7967a8.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "d94210c42213": {
   "f": "vd94210c42213.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "e76e0f7c89db": {
   "f": "ve76e0f7c89db.mp3",
   "k": "say",
   "s": "ep_gia"
  },
  "2c4ad2c5e1d0": {
   "f": "v2c4ad2c5e1d0.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "ba941461eb9e": {
   "f": "vba941461eb9e.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "dda53f948290": {
   "f": "vdda53f948290.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "14d36af92d13": {
   "f": "v14d36af92d13.mp3",
   "k": "say",
   "s": "ep_gia"
  },
  "df01c1fdb161": {
   "f": "vdf01c1fdb161.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "7233c015a5aa": {
   "f": "v7233c015a5aa.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "6c2fca3d5b80": {
   "f": "v6c2fca3d5b80.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "9584d7268436": {
   "f": "v9584d7268436.mp3",
   "k": "say",
   "s": "ep_gia"
  },
  "2aae084ea270": {
   "f": "v2aae084ea270.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "5f673635ae9d": {
   "f": "v5f673635ae9d.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "bcc8338c0fae": {
   "f": "vbcc8338c0fae.mp3",
   "k": "say",
   "s": "truong_doan"
  },
  "7935312356fd": {
   "f": "v7935312356fd.mp3",
   "k": "say",
   "s": "truong_doan"
  },
  "ee57909506dd": {
   "f": "vee57909506dd.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "97fcee91a72d": {
   "f": "v97fcee91a72d.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "42c56329a087": {
   "f": "v42c56329a087.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "2dfa8823be64": {
   "f": "v2dfa8823be64.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "b5fa3db46979": {
   "f": "vb5fa3db46979.mp3",
   "k": "say",
   "s": "chinh_ngon"
  },
  "aaba9b4bd736": {
   "f": "vaaba9b4bd736.mp3",
   "k": "say",
   "s": "chinh_ngon"
  },
  "5438859f25a2": {
   "f": "v5438859f25a2.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "ba1085641230": {
   "f": "vba1085641230.mp3",
   "k": "say",
   "s": "chinh_ngon"
  },
  "cd56cdb6bf53": {
   "f": "vcd56cdb6bf53.mp3",
   "k": "say",
   "s": "chinh_ngon"
  },
  "9cff9752d819": {
   "f": "v9cff9752d819.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "4ec9018b3120": {
   "f": "v4ec9018b3120.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "dfb41f0d01c5": {
   "f": "vdfb41f0d01c5.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "3cceee0b4761": {
   "f": "v3cceee0b4761.mp3",
   "k": "say",
   "s": "tham_bao"
  },
  "58a7b0387ea9": {
   "f": "v58a7b0387ea9.mp3",
   "k": "say",
   "s": "tham_bao"
  },
  "63a80de7a512": {
   "f": "v63a80de7a512.mp3",
   "k": "say",
   "s": "tham_bao"
  },
  "d1ecb1088515": {
   "f": "vd1ecb1088515.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "4df810d1d2b0": {
   "f": "v4df810d1d2b0.mp3",
   "k": "say",
   "s": "tham_bao"
  },
  "6fbfcfaf1f85": {
   "f": "v6fbfcfaf1f85.mp3",
   "k": "say",
   "s": "tham_bao"
  },
  "876f66e59889": {
   "f": "v876f66e59889.mp3",
   "k": "say",
   "s": "tham_bao"
  },
  "bfe7c3d6b542": {
   "f": "vbfe7c3d6b542.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "634e5c029612": {
   "f": "v634e5c029612.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "d9cb73338a4e": {
   "f": "vd9cb73338a4e.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "8486194e88db": {
   "f": "v8486194e88db.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "acda5a18a08e": {
   "f": "vacda5a18a08e.mp3",
   "k": "say",
   "s": "huyet_de"
  },
  "214d1a6113c6": {
   "f": "v214d1a6113c6.mp3",
   "k": "say",
   "s": "huyet_de"
  },
  "431c9731aa0d": {
   "f": "v431c9731aa0d.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "a8108bb789a6": {
   "f": "va8108bb789a6.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "bea5782998de": {
   "f": "vbea5782998de.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "d6d5fd94ce4c": {
   "f": "vd6d5fd94ce4c.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "e649b1575000": {
   "f": "ve649b1575000.mp3",
   "k": "say",
   "s": "de_tu_a"
  },
  "3a5d38e00347": {
   "f": "v3a5d38e00347.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "b16931d70e8e": {
   "f": "vb16931d70e8e.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "4849082ab43d": {
   "f": "v4849082ab43d.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "6116b7671f18": {
   "f": "v6116b7671f18.mp3",
   "k": "say",
   "s": "de_tu_ho_tong"
  },
  "583422218b47": {
   "f": "v583422218b47.mp3",
   "k": "say",
   "s": "de_tu_ho_tong"
  },
  "b530542d138b": {
   "f": "vb530542d138b.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "131d39334a25": {
   "f": "v131d39334a25.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "909291d05aa0": {
   "f": "v909291d05aa0.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "3c7c61df5a13": {
   "f": "v3c7c61df5a13.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "1ca4c4a1277c": {
   "f": "v1ca4c4a1277c.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "c04e1ca29685": {
   "f": "vc04e1ca29685.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "b1346ce00350": {
   "f": "vb1346ce00350.mp3",
   "k": "say",
   "s": "de_tu_b"
  },
  "7b2ae25dec70": {
   "f": "v7b2ae25dec70.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "60be79c2a80c": {
   "f": "v60be79c2a80c.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "3a1b6b54608d": {
   "f": "v3a1b6b54608d.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "0d1ad5d13f1e": {
   "f": "v0d1ad5d13f1e.mp3",
   "k": "say",
   "s": "de_tu_ho_tong"
  },
  "445f45232d8b": {
   "f": "v445f45232d8b.mp3",
   "k": "say",
   "s": "de_tu_a"
  },
  "daec2c16a130": {
   "f": "vdaec2c16a130.mp3",
   "k": "say",
   "s": "de_tu_b"
  },
  "328bc666c884": {
   "f": "v328bc666c884.mp3",
   "k": "say",
   "s": "de_tu_a"
  },
  "0fa530f16343": {
   "f": "v0fa530f16343.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "8b54e982e947": {
   "f": "v8b54e982e947.mp3",
   "k": "say",
   "s": "de_tu_ho_tong"
  },
  "d4439521a17c": {
   "f": "vd4439521a17c.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "4356fa96496e": {
   "f": "v4356fa96496e.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "fd5deb6808a4": {
   "f": "vfd5deb6808a4.mp3",
   "k": "say",
   "s": "huyet_de"
  },
  "d9e23a65f9d5": {
   "f": "vd9e23a65f9d5.mp3",
   "k": "say",
   "s": "mo_cuu_u"
  },
  "63d96734450e": {
   "f": "v63d96734450e.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "178492575946": {
   "f": "v178492575946.mp3",
   "k": "say",
   "s": "de_tu_ho_tong"
  },
  "9fc264bfe88d": {
   "f": "v9fc264bfe88d.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "ca5022e6debf": {
   "f": "vca5022e6debf.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "a15d9e068da7": {
   "f": "va15d9e068da7.mp3",
   "k": "say",
   "s": "de_tu_a"
  },
  "30faa5346e7d": {
   "f": "v30faa5346e7d.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "81df3d8fda14": {
   "f": "v81df3d8fda14.mp3",
   "k": "say",
   "s": "mo_cuu_u"
  },
  "794fdab6355c": {
   "f": "v794fdab6355c.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "1b41d57fbd9c": {
   "f": "v1b41d57fbd9c.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "3edacf28fbd6": {
   "f": "v3edacf28fbd6.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "6d2523ebcba9": {
   "f": "v6d2523ebcba9.mp3",
   "k": "say",
   "s": "de_tu_ho_tong"
  },
  "b90c7af6f45c": {
   "f": "vb90c7af6f45c.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "23ff5facc652": {
   "f": "v23ff5facc652.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "2dab708bd6c6": {
   "f": "v2dab708bd6c6.mp3",
   "k": "say",
   "s": "de_tu_b"
  },
  "87a4d05ab111": {
   "f": "v87a4d05ab111.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "292e9626dfe4": {
   "f": "v292e9626dfe4.mp3",
   "k": "say",
   "s": "de_tu_b"
  },
  "04d35031a33f": {
   "f": "v04d35031a33f.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "c5bcf07aec15": {
   "f": "vc5bcf07aec15.mp3",
   "k": "say",
   "s": "de_tu_b"
  },
  "99a23de7e932": {
   "f": "v99a23de7e932.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "918430fa5480": {
   "f": "v918430fa5480.mp3",
   "k": "say",
   "s": "de_tu_ho_tong"
  },
  "b98b59a571c0": {
   "f": "vb98b59a571c0.mp3",
   "k": "say",
   "s": "de_tu_b"
  },
  "e65b7dc3901c": {
   "f": "ve65b7dc3901c.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "559ba400bbf8": {
   "f": "v559ba400bbf8.mp3",
   "k": "say",
   "s": "de_tu_ho_tong"
  },
  "d0c102f75c11": {
   "f": "vd0c102f75c11.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "a177711a2e65": {
   "f": "va177711a2e65.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "fa90ca0d63c1": {
   "f": "vfa90ca0d63c1.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "0d1809bc4690": {
   "f": "v0d1809bc4690.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "af66d361fa4e": {
   "f": "vaf66d361fa4e.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "5cf11e5fcc50": {
   "f": "v5cf11e5fcc50.mp3",
   "k": "say",
   "s": "de_tu_ho_tong"
  },
  "2f68eb60cd9d": {
   "f": "v2f68eb60cd9d.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "7e6f089221f4": {
   "f": "v7e6f089221f4.mp3",
   "k": "say",
   "s": "hero"
  },
  "637b64d91c89": {
   "f": "v637b64d91c89.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "a975021c61f0": {
   "f": "va975021c61f0.mp3",
   "k": "say",
   "s": "huyet_de"
  },
  "2ee075968224": {
   "f": "v2ee075968224.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "bae03b0a2513": {
   "f": "vbae03b0a2513.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "6ac6848be441": {
   "f": "v6ac6848be441.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "5650e7735608": {
   "f": "v5650e7735608.mp3",
   "k": "say",
   "s": "de_tu_ho_tong"
  },
  "b4df95732f6d": {
   "f": "vb4df95732f6d.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "e1e6fda0d56e": {
   "f": "ve1e6fda0d56e.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "923d759e1c65": {
   "f": "v923d759e1c65.mp3",
   "k": "say",
   "s": "de_tu_ho_tong"
  },
  "84800c3bcdb8": {
   "f": "v84800c3bcdb8.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "62ba6e87ebdb": {
   "f": "v62ba6e87ebdb.mp3",
   "k": "say",
   "s": "de_tu_ho_tong"
  },
  "30e55a3f12d4": {
   "f": "v30e55a3f12d4.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "ecdd3181c9fe": {
   "f": "vecdd3181c9fe.mp3",
   "k": "say",
   "s": "huyet_de"
  },
  "1a07cbef288f": {
   "f": "v1a07cbef288f.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "de16b495a472": {
   "f": "vde16b495a472.mp3",
   "k": "say",
   "s": "de_tu_b"
  },
  "262182e76da3": {
   "f": "v262182e76da3.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "18be31a252ff": {
   "f": "v18be31a252ff.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "f9e8a7a84a68": {
   "f": "vf9e8a7a84a68.mp3",
   "k": "say",
   "s": "mo_cuu_u"
  },
  "32848e4b42a2": {
   "f": "v32848e4b42a2.mp3",
   "k": "say",
   "s": "mo_cuu_u"
  },
  "aedb17b130ed": {
   "f": "vaedb17b130ed.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "9fb7f21756ad": {
   "f": "v9fb7f21756ad.mp3",
   "k": "say",
   "s": "mo_cuu_u"
  },
  "36f28bf651f7": {
   "f": "v36f28bf651f7.mp3",
   "k": "say",
   "s": "mo_cuu_u"
  },
  "d4094f649f24": {
   "f": "vd4094f649f24.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "3cd6dfe740c7": {
   "f": "v3cd6dfe740c7.mp3",
   "k": "say",
   "s": "mo_cuu_u"
  },
  "6d895420b8e3": {
   "f": "v6d895420b8e3.mp3",
   "k": "say",
   "s": "mo_cuu_u"
  },
  "53223296be9d": {
   "f": "v53223296be9d.mp3",
   "k": "say",
   "s": "mo_cuu_u"
  },
  "0d5623b07f68": {
   "f": "v0d5623b07f68.mp3",
   "k": "say",
   "s": "mo_cuu_u"
  },
  "2018c481a7b9": {
   "f": "v2018c481a7b9.mp3",
   "k": "say",
   "s": "mo_cuu_u"
  },
  "4687d4f703ff": {
   "f": "v4687d4f703ff.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "7296585646e9": {
   "f": "v7296585646e9.mp3",
   "k": "say",
   "s": "de_tu_ho_tong"
  },
  "cfb63fafde6d": {
   "f": "vcfb63fafde6d.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "88f7d39968bb": {
   "f": "v88f7d39968bb.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "078190625576": {
   "f": "v078190625576.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "9c69e39dad7d": {
   "f": "v9c69e39dad7d.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "3355b8f0580f": {
   "f": "v3355b8f0580f.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "d2ce48ad9758": {
   "f": "vd2ce48ad9758.mp3",
   "k": "say",
   "s": "dan_thanh_a"
  },
  "e1013d091eef": {
   "f": "ve1013d091eef.mp3",
   "k": "say",
   "s": "dan_thanh_b"
  },
  "24bc4032eec7": {
   "f": "v24bc4032eec7.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "0ad6697cf35c": {
   "f": "v0ad6697cf35c.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "22d6cc53de1b": {
   "f": "v22d6cc53de1b.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "8dcc80936b4d": {
   "f": "v8dcc80936b4d.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "45003924a456": {
   "f": "v45003924a456.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "85808261ec5e": {
   "f": "v85808261ec5e.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "2f75ed3d8c6b": {
   "f": "v2f75ed3d8c6b.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "0c24a29f2d8d": {
   "f": "v0c24a29f2d8d.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "f9940afe251d": {
   "f": "vf9940afe251d.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "a721c0407fe8": {
   "f": "va721c0407fe8.mp3",
   "k": "say",
   "s": "dan_thanh_a"
  },
  "1502c8b23fa1": {
   "f": "v1502c8b23fa1.mp3",
   "k": "say",
   "s": "dan_thanh_b"
  },
  "2fd3cdc0a4ed": {
   "f": "v2fd3cdc0a4ed.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "0250661e15da": {
   "f": "v0250661e15da.mp3",
   "k": "say",
   "s": "de_tu_ho_tong"
  },
  "336591532616": {
   "f": "v336591532616.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "21f55d5e9778": {
   "f": "v21f55d5e9778.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "72c4f6a20d40": {
   "f": "v72c4f6a20d40.mp3",
   "k": "say",
   "s": "de_tu_ho_tong"
  },
  "41cd6fd38f9a": {
   "f": "v41cd6fd38f9a.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "3812265b37a3": {
   "f": "v3812265b37a3.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "c374bbe400b6": {
   "f": "vc374bbe400b6.mp3",
   "k": "say",
   "s": "nguoi_lai_do"
  },
  "bf9484cd1349": {
   "f": "vbf9484cd1349.mp3",
   "k": "say",
   "s": "nguoi_lai_do"
  },
  "5371a7dae113": {
   "f": "v5371a7dae113.mp3",
   "k": "say",
   "s": "nguoi_lai_do"
  },
  "ce7a51fc7057": {
   "f": "vce7a51fc7057.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "b22ba6b90e6a": {
   "f": "vb22ba6b90e6a.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "c9719e72b425": {
   "f": "vc9719e72b425.mp3",
   "k": "say",
   "s": "tram_truong"
  },
  "1ae50da7ecc2": {
   "f": "v1ae50da7ecc2.mp3",
   "k": "say",
   "s": "tram_truong"
  },
  "45611b6a5c1d": {
   "f": "v45611b6a5c1d.mp3",
   "k": "say",
   "s": "tram_truong"
  },
  "67fb7742ada1": {
   "f": "v67fb7742ada1.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "7169017587b2": {
   "f": "v7169017587b2.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "1ab63150fb40": {
   "f": "v1ab63150fb40.mp3",
   "k": "say",
   "s": "chap_su_thap"
  },
  "eb26a844ccbf": {
   "f": "veb26a844ccbf.mp3",
   "k": "say",
   "s": "chap_su_thap"
  },
  "1e807ae2bb64": {
   "f": "v1e807ae2bb64.mp3",
   "k": "say",
   "s": "tran_tu_linh"
  },
  "e6b01b699f61": {
   "f": "ve6b01b699f61.mp3",
   "k": "say",
   "s": "tran_tu_linh"
  },
  "b604b4474a5f": {
   "f": "vb604b4474a5f.mp3",
   "k": "say",
   "s": "chap_su_thap"
  },
  "65c6250ab7c6": {
   "f": "v65c6250ab7c6.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "727d21c0e31f": {
   "f": "v727d21c0e31f.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "a5cde9bad0ca": {
   "f": "va5cde9bad0ca.mp3",
   "k": "say",
   "s": "nguoi_lai_do"
  },
  "33594d9bcf8d": {
   "f": "v33594d9bcf8d.mp3",
   "k": "say",
   "s": "nguoi_lai_do"
  },
  "754b02c80514": {
   "f": "v754b02c80514.mp3",
   "k": "say",
   "s": "nguoi_lai_do"
  },
  "4c268943f1be": {
   "f": "v4c268943f1be.mp3",
   "k": "say",
   "s": "nguoi_lai_do"
  },
  "e2221a3304eb": {
   "f": "ve2221a3304eb.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "653cfb64853f": {
   "f": "v653cfb64853f.mp3",
   "k": "say",
   "s": "nguoi_lai_do"
  },
  "e0b6b33d1d7d": {
   "f": "ve0b6b33d1d7d.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "2d07cb7ffebd": {
   "f": "v2d07cb7ffebd.mp3",
   "k": "say",
   "s": "nguoi_lai_do"
  },
  "25392f719808": {
   "f": "v25392f719808.mp3",
   "k": "say",
   "s": "nguoi_lai_do"
  },
  "c05f7617573e": {
   "f": "vc05f7617573e.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "7ac01d5a1eb7": {
   "f": "v7ac01d5a1eb7.mp3",
   "k": "say",
   "s": "tin_su_b"
  },
  "8ad7a07114a8": {
   "f": "v8ad7a07114a8.mp3",
   "k": "say",
   "s": "chap_su_thap"
  },
  "a6f152dccd4e": {
   "f": "va6f152dccd4e.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "e8bade637f2c": {
   "f": "ve8bade637f2c.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "c63fef601139": {
   "f": "vc63fef601139.mp3",
   "k": "say",
   "s": "sat_thu_truong"
  },
  "449676362ede": {
   "f": "v449676362ede.mp3",
   "k": "say",
   "s": "sat_thu_truong"
  },
  "aeaeb06741f9": {
   "f": "vaeaeb06741f9.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "de4742ade1d7": {
   "f": "vde4742ade1d7.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "f5297cbf8469": {
   "f": "vf5297cbf8469.mp3",
   "k": "say",
   "s": "sat_thu_truong"
  },
  "bc0320b784e0": {
   "f": "vbc0320b784e0.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "ba647d888d85": {
   "f": "vba647d888d85.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "786e0df49921": {
   "f": "v786e0df49921.mp3",
   "k": "say",
   "s": "nguoi_giu_truoc"
  },
  "368e5e95ec70": {
   "f": "v368e5e95ec70.mp3",
   "k": "say",
   "s": "nguoi_giu_truoc"
  },
  "c0f3ff5813ae": {
   "f": "vc0f3ff5813ae.mp3",
   "k": "say",
   "s": "nguoi_giu_truoc"
  },
  "640e30e431b4": {
   "f": "v640e30e431b4.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "354fa0b2b5cb": {
   "f": "v354fa0b2b5cb.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "9c1fc0155cfa": {
   "f": "v9c1fc0155cfa.mp3",
   "k": "say",
   "s": "nguoi_giu_truoc"
  },
  "b68779aa8699": {
   "f": "vb68779aa8699.mp3",
   "k": "say",
   "s": "nguoi_giu_truoc"
  },
  "4c6398c8b55a": {
   "f": "v4c6398c8b55a.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "217a92804d45": {
   "f": "v217a92804d45.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "602be1cc1682": {
   "f": "v602be1cc1682.mp3",
   "k": "say",
   "s": "chap_su_thap"
  },
  "cadb3a3a7da4": {
   "f": "vcadb3a3a7da4.mp3",
   "k": "say",
   "s": "tran_tu_linh"
  },
  "7c44d793c687": {
   "f": "v7c44d793c687.mp3",
   "k": "say",
   "s": "chap_su_thap"
  },
  "a9fe222eef7e": {
   "f": "va9fe222eef7e.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "78e20e472d14": {
   "f": "v78e20e472d14.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "36b94d2ff4ce": {
   "f": "v36b94d2ff4ce.mp3",
   "k": "say",
   "s": "tram_truong"
  },
  "cc0e66d9c5c2": {
   "f": "vcc0e66d9c5c2.mp3",
   "k": "say",
   "s": "tram_truong"
  },
  "ddaf7200b2e6": {
   "f": "vddaf7200b2e6.mp3",
   "k": "say",
   "s": "tram_truong"
  },
  "681ea85a97bf": {
   "f": "v681ea85a97bf.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "b75c4b9edf5c": {
   "f": "vb75c4b9edf5c.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "5dabb2ec1f1c": {
   "f": "v5dabb2ec1f1c.mp3",
   "k": "say",
   "s": "chu_do"
  },
  "96044b80787d": {
   "f": "v96044b80787d.mp3",
   "k": "say",
   "s": "nguoi_lai_do"
  },
  "a920c2001453": {
   "f": "va920c2001453.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "21a8afcd8d0a": {
   "f": "v21a8afcd8d0a.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "d380605a936a": {
   "f": "vd380605a936a.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "5980f3d6d2ef": {
   "f": "v5980f3d6d2ef.mp3",
   "k": "say",
   "s": "anh_phung"
  },
  "4ef311a3458e": {
   "f": "v4ef311a3458e.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "5526ee0697e7": {
   "f": "v5526ee0697e7.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "51bc94ade1ff": {
   "f": "v51bc94ade1ff.mp3",
   "k": "say",
   "s": "nguoi_lai_do"
  },
  "5ab96bad98b3": {
   "f": "v5ab96bad98b3.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "398ae32e414c": {
   "f": "v398ae32e414c.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "ede4be514987": {
   "f": "vede4be514987.mp3",
   "k": "say",
   "s": "dan_lang_b"
  },
  "918b25683efb": {
   "f": "v918b25683efb.mp3",
   "k": "say",
   "s": "nguoi_lai_do"
  },
  "042d16246efc": {
   "f": "v042d16246efc.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "f9d69d715fce": {
   "f": "vf9d69d715fce.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "6f976230b201": {
   "f": "v6f976230b201.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "b6904c3fb0a3": {
   "f": "vb6904c3fb0a3.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "9391c61d7b49": {
   "f": "v9391c61d7b49.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "465d9fa9415f": {
   "f": "v465d9fa9415f.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "5d9fa6104d2c": {
   "f": "v5d9fa6104d2c.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "0dce09b9515a": {
   "f": "v0dce09b9515a.mp3",
   "k": "say",
   "s": "chu_do"
  },
  "51b1ce826b2f": {
   "f": "v51b1ce826b2f.mp3",
   "k": "say",
   "s": "nguoi_lai_do"
  },
  "973e3310f3aa": {
   "f": "v973e3310f3aa.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "e845807f46c5": {
   "f": "ve845807f46c5.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "d22309e8b389": {
   "f": "vd22309e8b389.mp3",
   "k": "say",
   "s": "truong_thon_ven_song"
  },
  "fc5ae22b350a": {
   "f": "vfc5ae22b350a.mp3",
   "k": "say",
   "s": "truong_thon_ven_song"
  },
  "f9c59889d181": {
   "f": "vf9c59889d181.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "354535320271": {
   "f": "v354535320271.mp3",
   "k": "say",
   "s": "tran_tu_linh"
  },
  "f7d07d56b8f6": {
   "f": "vf7d07d56b8f6.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "163cd93b8796": {
   "f": "v163cd93b8796.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "226575151e20": {
   "f": "v226575151e20.mp3",
   "k": "say",
   "s": "truong_thon_ven_song"
  },
  "ca58e89d211d": {
   "f": "vca58e89d211d.mp3",
   "k": "say",
   "s": "truong_thon_ven_song"
  },
  "33ef2b9b983c": {
   "f": "v33ef2b9b983c.mp3",
   "k": "say",
   "s": "truong_thon_ven_song"
  },
  "6dd09fd2d9ca": {
   "f": "v6dd09fd2d9ca.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "f9e54b6141be": {
   "f": "vf9e54b6141be.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "169261de773a": {
   "f": "v169261de773a.mp3",
   "k": "say",
   "s": "truong_thon_ven_song"
  },
  "02b25c4bd359": {
   "f": "v02b25c4bd359.mp3",
   "k": "say",
   "s": "truong_thon_ven_song"
  },
  "058c749bd6ee": {
   "f": "v058c749bd6ee.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "63a3d5ec71e9": {
   "f": "v63a3d5ec71e9.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "f5a78b9fce9d": {
   "f": "vf5a78b9fce9d.mp3",
   "k": "say",
   "s": "truong_thon_ven_song"
  },
  "a4da015179c4": {
   "f": "va4da015179c4.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "943555670f4b": {
   "f": "v943555670f4b.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "cd126ec7fd93": {
   "f": "vcd126ec7fd93.mp3",
   "k": "say",
   "s": "ke_dot_giay"
  },
  "3e880dc45bb0": {
   "f": "v3e880dc45bb0.mp3",
   "k": "say",
   "s": "tram_truong"
  },
  "562afbafa6a3": {
   "f": "v562afbafa6a3.mp3",
   "k": "say",
   "s": "ke_dot_giay"
  },
  "218931efbf35": {
   "f": "v218931efbf35.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "b8c2ac8d1b60": {
   "f": "vb8c2ac8d1b60.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "52fe012d4334": {
   "f": "v52fe012d4334.mp3",
   "k": "say",
   "s": "nguoi_lai_do"
  },
  "101e19423893": {
   "f": "v101e19423893.mp3",
   "k": "say",
   "s": "nguoi_lai_do"
  },
  "b0f29faba309": {
   "f": "vb0f29faba309.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "865faf742cd8": {
   "f": "v865faf742cd8.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "b0742382e45e": {
   "f": "vb0742382e45e.mp3",
   "k": "say",
   "s": "tram_truong"
  },
  "05c42effc660": {
   "f": "v05c42effc660.mp3",
   "k": "say",
   "s": "gac_kho"
  },
  "8ae93c2e1564": {
   "f": "v8ae93c2e1564.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "705b3c2f43d3": {
   "f": "v705b3c2f43d3.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "d57cc3bdc020": {
   "f": "vd57cc3bdc020.mp3",
   "k": "say",
   "s": "tram_truong"
  },
  "1da45bd32904": {
   "f": "v1da45bd32904.mp3",
   "k": "say",
   "s": "gac_kho"
  },
  "027910454833": {
   "f": "v027910454833.mp3",
   "k": "say",
   "s": "tram_truong"
  },
  "d90bfbf410f1": {
   "f": "vd90bfbf410f1.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "68ba3d0f0a2d": {
   "f": "v68ba3d0f0a2d.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "62761eaa0164": {
   "f": "v62761eaa0164.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "35900481b712": {
   "f": "v35900481b712.mp3",
   "k": "say",
   "s": "thap_chu"
  },
  "335e826b75d7": {
   "f": "v335e826b75d7.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "87f2e4cfc088": {
   "f": "v87f2e4cfc088.mp3",
   "k": "say",
   "s": "oan_hon"
  },
  "a0c975a46217": {
   "f": "va0c975a46217.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "31fdbcfefd96": {
   "f": "v31fdbcfefd96.mp3",
   "k": "say",
   "s": "oan_hon"
  },
  "f33228374d1c": {
   "f": "vf33228374d1c.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "4985868f9ddb": {
   "f": "v4985868f9ddb.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "1b035ee8ab11": {
   "f": "v1b035ee8ab11.mp3",
   "k": "say",
   "s": "tran_tu_linh"
  },
  "4ebcbf317561": {
   "f": "v4ebcbf317561.mp3",
   "k": "say",
   "s": "chap_su_thap"
  },
  "0e223143348a": {
   "f": "v0e223143348a.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "a99f02863e12": {
   "f": "va99f02863e12.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "2b400698b67d": {
   "f": "v2b400698b67d.mp3",
   "k": "say",
   "s": "chap_su_thap"
  },
  "ad97b94b62cf": {
   "f": "vad97b94b62cf.mp3",
   "k": "say",
   "s": "tran_tu_linh"
  },
  "9e7e16517908": {
   "f": "v9e7e16517908.mp3",
   "k": "say",
   "s": "chap_su_thap"
  },
  "2ef7e4f9efcd": {
   "f": "v2ef7e4f9efcd.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "611ecb3fb78a": {
   "f": "v611ecb3fb78a.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "02a22e5fd20e": {
   "f": "v02a22e5fd20e.mp3",
   "k": "say",
   "s": "nhan_chung"
  },
  "8e3f28ef9fc0": {
   "f": "v8e3f28ef9fc0.mp3",
   "k": "say",
   "s": "nhan_chung"
  },
  "5bfefbd27973": {
   "f": "v5bfefbd27973.mp3",
   "k": "say",
   "s": "nhan_chung"
  },
  "a32d6ccef526": {
   "f": "va32d6ccef526.mp3",
   "k": "say",
   "s": "nhan_chung"
  },
  "d19e5bd821e3": {
   "f": "vd19e5bd821e3.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "006b61245285": {
   "f": "v006b61245285.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "a80d34228183": {
   "f": "va80d34228183.mp3",
   "k": "say",
   "s": "cuop_truong"
  },
  "b47f165cfa71": {
   "f": "vb47f165cfa71.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "c80a911c2a46": {
   "f": "vc80a911c2a46.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "8d17459d385e": {
   "f": "v8d17459d385e.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "fa21d9f536de": {
   "f": "vfa21d9f536de.mp3",
   "k": "say",
   "s": "nhan_chung"
  },
  "2e08bf7739f9": {
   "f": "v2e08bf7739f9.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "9f084d0943db": {
   "f": "v9f084d0943db.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "ac61809cb01c": {
   "f": "vac61809cb01c.mp3",
   "k": "say",
   "s": "dan_lang_a"
  },
  "4ac0c1509f4b": {
   "f": "v4ac0c1509f4b.mp3",
   "k": "say",
   "s": "dan_lang_b"
  },
  "874d61b74a22": {
   "f": "v874d61b74a22.mp3",
   "k": "say",
   "s": "nguoi_lai_do"
  },
  "f21b6603cf67": {
   "f": "vf21b6603cf67.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "697387bc1527": {
   "f": "v697387bc1527.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "4502428b32a6": {
   "f": "v4502428b32a6.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "5d8fbf14d539": {
   "f": "v5d8fbf14d539.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "0e1cfe46a793": {
   "f": "v0e1cfe46a793.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "e8ae03b2a99a": {
   "f": "ve8ae03b2a99a.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "7f36b4146e41": {
   "f": "v7f36b4146e41.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "40f4b0dbd18e": {
   "f": "v40f4b0dbd18e.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "3c9783fd78b1": {
   "f": "v3c9783fd78b1.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "da2e6aee6967": {
   "f": "vda2e6aee6967.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "df1d36fbe805": {
   "f": "vdf1d36fbe805.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "e14edc69fc79": {
   "f": "ve14edc69fc79.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "a304597b86be": {
   "f": "va304597b86be.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "e4fed5378e18": {
   "f": "ve4fed5378e18.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "4299387c6186": {
   "f": "v4299387c6186.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "799cbdfd86fc": {
   "f": "v799cbdfd86fc.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "ce1427f3e1d7": {
   "f": "vce1427f3e1d7.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "41c36fa3074d": {
   "f": "v41c36fa3074d.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "969bd8bc650b": {
   "f": "v969bd8bc650b.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "5731f7229d36": {
   "f": "v5731f7229d36.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "b23abf4c7fd6": {
   "f": "vb23abf4c7fd6.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "d17c2eed9200": {
   "f": "vd17c2eed9200.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "d2aea98a5587": {
   "f": "vd2aea98a5587.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "2d48cce6927a": {
   "f": "v2d48cce6927a.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "0059b89f6737": {
   "f": "v0059b89f6737.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "12fc46288493": {
   "f": "v12fc46288493.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "f7470273671c": {
   "f": "vf7470273671c.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "700ac514e549": {
   "f": "v700ac514e549.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "0d83ab81bfd1": {
   "f": "v0d83ab81bfd1.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "628db1cab48a": {
   "f": "v628db1cab48a.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "379f7a82f100": {
   "f": "v379f7a82f100.mp3",
   "k": "say",
   "s": "tap_dich_truong"
  },
  "338c7fa7ff56": {
   "f": "v338c7fa7ff56.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "e8d1b4222196": {
   "f": "ve8d1b4222196.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "0d8f32794333": {
   "f": "v0d8f32794333.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "c2aaac63974a": {
   "f": "vc2aaac63974a.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "5c577b4630fd": {
   "f": "v5c577b4630fd.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "a4a61a7b0d61": {
   "f": "va4a61a7b0d61.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "7011f02a3d22": {
   "f": "v7011f02a3d22.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "bfe3705de514": {
   "f": "vbfe3705de514.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "2c9d0d337b8e": {
   "f": "v2c9d0d337b8e.mp3",
   "k": "say",
   "s": "tham_bao"
  },
  "72449cf3e7ca": {
   "f": "v72449cf3e7ca.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "993e6d86464e": {
   "f": "v993e6d86464e.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "aa66bc542f4e": {
   "f": "vaa66bc542f4e.mp3",
   "k": "say",
   "s": "dan_nan_truong"
  },
  "f97f09e84252": {
   "f": "vf97f09e84252.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "30c3422769d1": {
   "f": "v30c3422769d1.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "45b3e4a96084": {
   "f": "v45b3e4a96084.mp3",
   "k": "say",
   "s": "dan_nan_truong"
  },
  "fbd1abb5d934": {
   "f": "vfbd1abb5d934.mp3",
   "k": "say",
   "s": "dan_nan_truong"
  },
  "c1843c81e069": {
   "f": "vc1843c81e069.mp3",
   "k": "say",
   "s": "dan_nan_truong"
  },
  "e7cccfe22711": {
   "f": "ve7cccfe22711.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "6dde36e670ac": {
   "f": "v6dde36e670ac.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "a4d0433acc31": {
   "f": "va4d0433acc31.mp3",
   "k": "say",
   "s": "tin_su_lang"
  },
  "f23deec4ddb7": {
   "f": "vf23deec4ddb7.mp3",
   "k": "say",
   "s": "nguoi_lai_do"
  },
  "acf2b9b005f3": {
   "f": "vacf2b9b005f3.mp3",
   "k": "say",
   "s": "tin_su_lang"
  },
  "33ac14a2d6c0": {
   "f": "v33ac14a2d6c0.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "2d582f430e8f": {
   "f": "v2d582f430e8f.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "fcc072b5a5b2": {
   "f": "vfcc072b5a5b2.mp3",
   "k": "say",
   "s": "dan_nan_truong"
  },
  "d6b30bcbaffb": {
   "f": "vd6b30bcbaffb.mp3",
   "k": "say",
   "s": "dan_nan_truong"
  },
  "c3004d82e51c": {
   "f": "vc3004d82e51c.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "19e5735b1c3a": {
   "f": "v19e5735b1c3a.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "ada0f340cf0e": {
   "f": "vada0f340cf0e.mp3",
   "k": "say",
   "s": "dan_nan_truong"
  },
  "41081015ae62": {
   "f": "v41081015ae62.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "54b7d3cf2ef4": {
   "f": "v54b7d3cf2ef4.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "c82ac53719b8": {
   "f": "vc82ac53719b8.mp3",
   "k": "say",
   "s": "dan_nan_truong"
  },
  "177d87b085bb": {
   "f": "v177d87b085bb.mp3",
   "k": "say",
   "s": "dan_nan_truong"
  },
  "b93efab5cb97": {
   "f": "vb93efab5cb97.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "ffb842d43409": {
   "f": "vffb842d43409.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "74af7a433649": {
   "f": "v74af7a433649.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "e0645311d340": {
   "f": "ve0645311d340.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "f78ffc4f20ee": {
   "f": "vf78ffc4f20ee.mp3",
   "k": "say",
   "s": "hero"
  },
  "7436dadd92f3": {
   "f": "v7436dadd92f3.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "613a91e37ae9": {
   "f": "v613a91e37ae9.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "e26a5a9e0903": {
   "f": "ve26a5a9e0903.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "154367873680": {
   "f": "v154367873680.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "77a3a3ab91de": {
   "f": "v77a3a3ab91de.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "e94239723b58": {
   "f": "ve94239723b58.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "a1b235eed1ec": {
   "f": "va1b235eed1ec.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "6747c2349974": {
   "f": "v6747c2349974.mp3",
   "k": "say",
   "s": "nguoi_lai_do"
  },
  "fe33858b727b": {
   "f": "vfe33858b727b.mp3",
   "k": "say",
   "s": "nguoi_lai_do"
  },
  "9d4290a45163": {
   "f": "v9d4290a45163.mp3",
   "k": "say",
   "s": "nguoi_lai_do"
  },
  "6397855621ca": {
   "f": "v6397855621ca.mp3",
   "k": "say",
   "s": "nguoi_lai_do"
  },
  "c5aea02f27a8": {
   "f": "vc5aea02f27a8.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "9754bb66ea18": {
   "f": "v9754bb66ea18.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "7acc0ad4e2e3": {
   "f": "v7acc0ad4e2e3.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "662cff6cecf0": {
   "f": "v662cff6cecf0.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "b48ff6b1d51e": {
   "f": "vb48ff6b1d51e.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "dee334c9a4a7": {
   "f": "vdee334c9a4a7.mp3",
   "k": "say",
   "s": "tin_su"
  },
  "f87bb92ff6eb": {
   "f": "vf87bb92ff6eb.mp3",
   "k": "say",
   "s": "chap_su_thap"
  },
  "dc7141e126bb": {
   "f": "vdc7141e126bb.mp3",
   "k": "say",
   "s": "dan_nan_truong"
  },
  "d6548bd60eac": {
   "f": "vd6548bd60eac.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "8c1724625ba9": {
   "f": "v8c1724625ba9.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "e9e43d902377": {
   "f": "ve9e43d902377.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "895737a82faf": {
   "f": "v895737a82faf.mp3",
   "k": "say",
   "s": "di_ninh"
  },
  "0fff40b4e678": {
   "f": "v0fff40b4e678.mp3",
   "k": "say",
   "s": "di_ninh"
  },
  "209fa37be659": {
   "f": "v209fa37be659.mp3",
   "k": "say",
   "s": "luc_tranh"
  },
  "4a9b9376acd6": {
   "f": "v4a9b9376acd6.mp3",
   "k": "say",
   "s": "luc_tranh"
  },
  "a5ea1641e080": {
   "f": "va5ea1641e080.mp3",
   "k": "say",
   "s": "anh_phung"
  },
  "7b36cb22be80": {
   "f": "v7b36cb22be80.mp3",
   "k": "say",
   "s": "anh_phung"
  },
  "6d2346471f86": {
   "f": "v6d2346471f86.mp3",
   "k": "say",
   "s": "chinh_ngon"
  },
  "afb3e846ab3d": {
   "f": "vafb3e846ab3d.mp3",
   "k": "say",
   "s": "chinh_ngon"
  },
  "e5ecd52a61ca": {
   "f": "ve5ecd52a61ca.mp3",
   "k": "say",
   "s": "truong_lao"
  },
  "b378ff36dd6f": {
   "f": "vb378ff36dd6f.mp3",
   "k": "say",
   "s": "truong_lao"
  },
  "c4931a1ad9dd": {
   "f": "vc4931a1ad9dd.mp3",
   "k": "say",
   "s": "dan_a"
  },
  "664406f53cbd": {
   "f": "v664406f53cbd.mp3",
   "k": "say",
   "s": "dan_a"
  },
  "e01ac0ac759e": {
   "f": "ve01ac0ac759e.mp3",
   "k": "say",
   "s": "dan_b"
  },
  "e91ff42aa212": {
   "f": "ve91ff42aa212.mp3",
   "k": "say",
   "s": "dan_b"
  },
  "bae1eafebf3e": {
   "f": "vbae1eafebf3e.mp3",
   "k": "say",
   "s": "dan_c"
  },
  "0ac5221346ba": {
   "f": "v0ac5221346ba.mp3",
   "k": "say",
   "s": "dan_c"
  },
  "c7b297684bde": {
   "f": "vc7b297684bde.mp3",
   "k": "say",
   "s": "xa_phu"
  },
  "7c4580a0524a": {
   "f": "v7c4580a0524a.mp3",
   "k": "say",
   "s": "xa_phu"
  },
  "944cfbe75ea8": {
   "f": "v944cfbe75ea8.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "5ad74b88a079": {
   "f": "v5ad74b88a079.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "3671c4f753b0": {
   "f": "v3671c4f753b0.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "5a438443abb2": {
   "f": "v5a438443abb2.mp3",
   "k": "say",
   "s": "di_ninh"
  },
  "d6b5d416fca3": {
   "f": "vd6b5d416fca3.mp3",
   "k": "say",
   "s": "di_ninh"
  },
  "26a06122df19": {
   "f": "v26a06122df19.mp3",
   "k": "say",
   "s": "luc_tranh"
  },
  "4f37a91402f7": {
   "f": "v4f37a91402f7.mp3",
   "k": "say",
   "s": "luc_tranh"
  },
  "14f864f8513f": {
   "f": "v14f864f8513f.mp3",
   "k": "say",
   "s": "anh_phung"
  },
  "61502d36c056": {
   "f": "v61502d36c056.mp3",
   "k": "say",
   "s": "anh_phung"
  },
  "0faf35b3e2ed": {
   "f": "v0faf35b3e2ed.mp3",
   "k": "say",
   "s": "chinh_ngon"
  },
  "a60ce2895ab6": {
   "f": "va60ce2895ab6.mp3",
   "k": "say",
   "s": "chinh_ngon"
  },
  "ca72f94e7b94": {
   "f": "vca72f94e7b94.mp3",
   "k": "say",
   "s": "truong_lao"
  },
  "f6b1e1146504": {
   "f": "vf6b1e1146504.mp3",
   "k": "say",
   "s": "truong_lao"
  },
  "f3478abaa9f3": {
   "f": "vf3478abaa9f3.mp3",
   "k": "say",
   "s": "truong_lao"
  },
  "075cb5fc4403": {
   "f": "v075cb5fc4403.mp3",
   "k": "say",
   "s": "dan_a"
  },
  "45dc0d26cd16": {
   "f": "v45dc0d26cd16.mp3",
   "k": "say",
   "s": "dan_a"
  },
  "939b21800915": {
   "f": "v939b21800915.mp3",
   "k": "say",
   "s": "dan_b"
  },
  "635edff7dccd": {
   "f": "v635edff7dccd.mp3",
   "k": "say",
   "s": "dan_b"
  },
  "2cd64a8b2919": {
   "f": "v2cd64a8b2919.mp3",
   "k": "say",
   "s": "dan_c"
  },
  "35be0ae2d680": {
   "f": "v35be0ae2d680.mp3",
   "k": "say",
   "s": "dan_c"
  },
  "4bc2068954d5": {
   "f": "v4bc2068954d5.mp3",
   "k": "say",
   "s": "xa_phu"
  },
  "c5e4facd328c": {
   "f": "vc5e4facd328c.mp3",
   "k": "say",
   "s": "chu_quan"
  },
  "8f0b7e9b7b82": {
   "f": "v8f0b7e9b7b82.mp3",
   "k": "say",
   "s": "chu_quan"
  },
  "a3eca5656bb3": {
   "f": "va3eca5656bb3.mp3",
   "k": "say",
   "s": "duoc_su"
  },
  "cb0712ae9cb4": {
   "f": "vcb0712ae9cb4.mp3",
   "k": "say",
   "s": "duoc_su"
  },
  "9f70bd9dec4a": {
   "f": "v9f70bd9dec4a.mp3",
   "k": "say",
   "s": "phap_khi_chu"
  },
  "53e2310f993f": {
   "f": "v53e2310f993f.mp3",
   "k": "say",
   "s": "phap_khi_chu"
  },
  "dac786f95e4e": {
   "f": "vdac786f95e4e.mp3",
   "k": "say",
   "s": "tran_chinh_dao"
  },
  "cd4609ecaba9": {
   "f": "vcd4609ecaba9.mp3",
   "k": "say",
   "s": "tran_chinh_dao"
  },
  "a4480040e1ba": {
   "f": "va4480040e1ba.mp3",
   "k": "say",
   "s": "tran_tu_linh"
  },
  "084bfa36eeda": {
   "f": "v084bfa36eeda.mp3",
   "k": "say",
   "s": "tran_tu_linh"
  },
  "7c41730f1e5b": {
   "f": "v7c41730f1e5b.mp3",
   "k": "say",
   "s": "thap_chu"
  },
  "6c41382a8008": {
   "f": "v6c41382a8008.mp3",
   "k": "say",
   "s": "thap_chu"
  },
  "707e4c0b0e42": {
   "f": "v707e4c0b0e42.mp3",
   "k": "say",
   "s": "thi_sinh_a"
  },
  "483b26adea94": {
   "f": "v483b26adea94.mp3",
   "k": "say",
   "s": "thi_sinh_a"
  },
  "c1128164c60c": {
   "f": "vc1128164c60c.mp3",
   "k": "say",
   "s": "thi_sinh_b"
  },
  "3927e6458e8c": {
   "f": "v3927e6458e8c.mp3",
   "k": "say",
   "s": "thi_sinh_b"
  },
  "936c595332b7": {
   "f": "v936c595332b7.mp3",
   "k": "say",
   "s": "cho_a"
  },
  "605d2e6ad443": {
   "f": "v605d2e6ad443.mp3",
   "k": "say",
   "s": "cho_a"
  },
  "b36c33acf185": {
   "f": "vb36c33acf185.mp3",
   "k": "say",
   "s": "cho_b"
  },
  "7bc30141f82d": {
   "f": "v7bc30141f82d.mp3",
   "k": "say",
   "s": "cho_b"
  },
  "f32195819529": {
   "f": "vf32195819529.mp3",
   "k": "say",
   "s": "dan_thanh_a"
  },
  "4486bf6eae1f": {
   "f": "v4486bf6eae1f.mp3",
   "k": "say",
   "s": "dan_thanh_a"
  },
  "934ab0106e7c": {
   "f": "v934ab0106e7c.mp3",
   "k": "say",
   "s": "dan_thanh_b"
  },
  "596db94cf7fa": {
   "f": "v596db94cf7fa.mp3",
   "k": "say",
   "s": "dan_thanh_b"
  },
  "ce93bd9fdfb9": {
   "f": "vce93bd9fdfb9.mp3",
   "k": "say",
   "s": "chu_kien_tham"
  },
  "2fbaaa629ab3": {
   "f": "v2fbaaa629ab3.mp3",
   "k": "say",
   "s": "chu_kien_tham"
  },
  "5e3e7f3685db": {
   "f": "v5e3e7f3685db.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "4b183b59f084": {
   "f": "v4b183b59f084.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "bb1df95f32da": {
   "f": "vbb1df95f32da.mp3",
   "k": "say",
   "s": "lieu_khuynh_tien"
  },
  "538f5c6e7159": {
   "f": "v538f5c6e7159.mp3",
   "k": "say",
   "s": "lieu_khuynh_tien"
  },
  "189ba466cb39": {
   "f": "v189ba466cb39.mp3",
   "k": "say",
   "s": "hoa_huong_than"
  },
  "108ff973d625": {
   "f": "v108ff973d625.mp3",
   "k": "say",
   "s": "hoa_huong_than"
  },
  "1dbfb979c941": {
   "f": "v1dbfb979c941.mp3",
   "k": "say",
   "s": "tap_dich_truong"
  },
  "1f0436ac9b9d": {
   "f": "v1f0436ac9b9d.mp3",
   "k": "say",
   "s": "tap_dich_truong"
  },
  "a965ff06725a": {
   "f": "va965ff06725a.mp3",
   "k": "say",
   "s": "de_tu_a"
  },
  "6aedee48ff88": {
   "f": "v6aedee48ff88.mp3",
   "k": "say",
   "s": "de_tu_a"
  },
  "28f0b29314a6": {
   "f": "v28f0b29314a6.mp3",
   "k": "say",
   "s": "de_tu_b"
  },
  "8c43f2d57599": {
   "f": "v8c43f2d57599.mp3",
   "k": "say",
   "s": "de_tu_b"
  },
  "8233948aa967": {
   "f": "v8233948aa967.mp3",
   "k": "say",
   "s": "tin_su"
  },
  "f3c3294733b1": {
   "f": "vf3c3294733b1.mp3",
   "k": "say",
   "s": "tin_su"
  },
  "446fb3f09b95": {
   "f": "v446fb3f09b95.mp3",
   "k": "say",
   "s": "gia_nhan"
  },
  "95bf9d215a4c": {
   "f": "v95bf9d215a4c.mp3",
   "k": "say",
   "s": "gia_nhan"
  },
  "f2a17db0940f": {
   "f": "vf2a17db0940f.mp3",
   "k": "say",
   "s": "mo_cuu_u"
  },
  "b76df9153ec7": {
   "f": "vb76df9153ec7.mp3",
   "k": "say",
   "s": "mo_cuu_u"
  },
  "601e6f2ab605": {
   "f": "v601e6f2ab605.mp3",
   "k": "say",
   "s": "huyet_de"
  },
  "0fd3dd9d7e6a": {
   "f": "v0fd3dd9d7e6a.mp3",
   "k": "say",
   "s": "huyet_de"
  },
  "0b8289265fd7": {
   "f": "v0b8289265fd7.mp3",
   "k": "say",
   "s": "de_tu_ho_tong"
  },
  "4db6047cd1c6": {
   "f": "v4db6047cd1c6.mp3",
   "k": "say",
   "s": "de_tu_ho_tong"
  },
  "f855ca3d9ad0": {
   "f": "vf855ca3d9ad0.mp3",
   "k": "say",
   "s": "bach_kinh_duong"
  },
  "adbe95cf6657": {
   "f": "vadbe95cf6657.mp3",
   "k": "say",
   "s": "bach_kinh_duong"
  },
  "780c5a5e28b8": {
   "f": "v780c5a5e28b8.mp3",
   "k": "say",
   "s": "nguoi_lai_do"
  },
  "c4f5509e8f3c": {
   "f": "vc4f5509e8f3c.mp3",
   "k": "say",
   "s": "tram_truong"
  },
  "151d5bfb01c0": {
   "f": "v151d5bfb01c0.mp3",
   "k": "say",
   "s": "truong_thon_ven_song"
  },
  "9f36781dcc2d": {
   "f": "v9f36781dcc2d.mp3",
   "k": "say",
   "s": "nguoi_giu_truoc"
  },
  "fe481f9220c4": {
   "f": "vfe481f9220c4.mp3",
   "k": "say",
   "s": "nhan_chung"
  },
  "ce4fdceb7a4e": {
   "f": "vce4fdceb7a4e.mp3",
   "k": "say",
   "s": "dan_nan_truong"
  },
  "ef7242a24822": {
   "f": "vef7242a24822.mp3",
   "k": "say",
   "s": "chu_do"
  },
  "b0abda8fe5e5": {
   "f": "vb0abda8fe5e5.mp3",
   "k": "say",
   "s": "dan_lang_a"
  },
  "e0fc109ffda7": {
   "f": "ve0fc109ffda7.mp3",
   "k": "say",
   "s": "dan_lang_b"
  },
  "42da81af1e98": {
   "f": "v42da81af1e98.mp3",
   "k": "say",
   "s": "dan_lang_c"
  },
  "9f84f00a3e44": {
   "f": "v9f84f00a3e44.mp3",
   "k": "say",
   "s": "tin_su_lang"
  },
  "6048456dcf52": {
   "f": "v6048456dcf52.mp3",
   "k": "say",
   "s": "ky_luc_quan"
  },
  "473b81a5376a": {
   "f": "v473b81a5376a.mp3",
   "k": "say",
   "s": "ky_luc_quan"
  },
  "c891b6d6262b": {
   "f": "vc891b6d6262b.mp3",
   "k": "say",
   "s": "tiep_khach"
  },
  "a10bad955602": {
   "f": "va10bad955602.mp3",
   "k": "say",
   "s": "tiep_khach"
  },
  "e8d5510a75ae": {
   "f": "ve8d5510a75ae.mp3",
   "k": "say",
   "s": "gac_kho"
  },
  "d31e910c31ee": {
   "f": "vd31e910c31ee.mp3",
   "k": "say",
   "s": "gac_kho"
  },
  "28e63f9907e0": {
   "f": "v28e63f9907e0.mp3",
   "k": "say",
   "s": "chu_quan"
  },
  "39b2ef9d4eac": {
   "f": "v39b2ef9d4eac.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "7683566d354d": {
   "f": "v7683566d354d.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "f916a3460132": {
   "f": "vf916a3460132.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "2c1d22ed6e26": {
   "f": "v2c1d22ed6e26.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "82cd613b70b8": {
   "f": "v82cd613b70b8.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "42d99c8f651e": {
   "f": "v42d99c8f651e.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "34fef967e5a1": {
   "f": "v34fef967e5a1.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "234a8af0391a": {
   "f": "v234a8af0391a.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "309113ebe7c2": {
   "f": "v309113ebe7c2.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "d021557bd156": {
   "f": "vd021557bd156.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "91d17b4efb6d": {
   "f": "v91d17b4efb6d.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "db5fd83ef424": {
   "f": "vdb5fd83ef424.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "e85ab201dddb": {
   "f": "ve85ab201dddb.mp3",
   "k": "say",
   "s": "dan_thanh_a"
  },
  "0902217bafa2": {
   "f": "v0902217bafa2.mp3",
   "k": "say",
   "s": "dan_thanh_a"
  },
  "2ea3b246ff87": {
   "f": "v2ea3b246ff87.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "0a5aa3a949ac": {
   "f": "v0a5aa3a949ac.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "2173b9753bd9": {
   "f": "v2173b9753bd9.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "daa687b58b3b": {
   "f": "vdaa687b58b3b.mp3",
   "k": "say",
   "s": "luc_tranh"
  },
  "361727b9d0d6": {
   "f": "v361727b9d0d6.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "24296caabc8e": {
   "f": "v24296caabc8e.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "91fc50ecdfd3": {
   "f": "v91fc50ecdfd3.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "5040867aafd8": {
   "f": "v5040867aafd8.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "e428af88dbb1": {
   "f": "ve428af88dbb1.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "255e941db6ed": {
   "f": "v255e941db6ed.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "a1f0ba1ffbae": {
   "f": "va1f0ba1ffbae.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "44cd2e9cecdd": {
   "f": "v44cd2e9cecdd.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "c9d0e1e396af": {
   "f": "vc9d0e1e396af.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "af80eb68d2c2": {
   "f": "vaf80eb68d2c2.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "5123651fb587": {
   "f": "v5123651fb587.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "20c796d1dc35": {
   "f": "v20c796d1dc35.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "24793a9ccda2": {
   "f": "v24793a9ccda2.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "31fa750c9502": {
   "f": "v31fa750c9502.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "b357e5e7c9db": {
   "f": "vb357e5e7c9db.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "43652959b4b4": {
   "f": "v43652959b4b4.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "8fe7427e24bf": {
   "f": "v8fe7427e24bf.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "2836a24999ec": {
   "f": "v2836a24999ec.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "a8fe52739f26": {
   "f": "va8fe52739f26.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "08aea097ef33": {
   "f": "v08aea097ef33.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "e72de232d4e7": {
   "f": "ve72de232d4e7.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "d8c0f7bfe753": {
   "f": "vd8c0f7bfe753.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "5dbdff05bb7e": {
   "f": "v5dbdff05bb7e.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "a519bb638f15": {
   "f": "va519bb638f15.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "958cbb0d2a7d": {
   "f": "v958cbb0d2a7d.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "983658d4b09b": {
   "f": "v983658d4b09b.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "6682760ac745": {
   "f": "v6682760ac745.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "8502cc805224": {
   "f": "v8502cc805224.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "a5e1298ba0c9": {
   "f": "va5e1298ba0c9.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "c184f47a7c23": {
   "f": "vc184f47a7c23.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "1991132836ee": {
   "f": "v1991132836ee.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "6b6acda85bcc": {
   "f": "v6b6acda85bcc.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "3d114b0c236d": {
   "f": "v3d114b0c236d.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "cd569855ce7d": {
   "f": "vcd569855ce7d.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "aa246a175fee": {
   "f": "vaa246a175fee.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "e7673596b12b": {
   "f": "ve7673596b12b.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "f12dbd2181a3": {
   "f": "vf12dbd2181a3.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "1bd175d148e7": {
   "f": "v1bd175d148e7.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "e42e7f8744ca": {
   "f": "ve42e7f8744ca.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "6ea47e7c1e38": {
   "f": "v6ea47e7c1e38.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "f485e4c1a75e": {
   "f": "vf485e4c1a75e.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "08f14bb2761e": {
   "f": "v08f14bb2761e.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "588dd591241a": {
   "f": "v588dd591241a.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "f80e1640f3da": {
   "f": "vf80e1640f3da.mp3",
   "k": "say",
   "s": "tap_dich_truong"
  },
  "1aabf336c041": {
   "f": "v1aabf336c041.mp3",
   "k": "say",
   "s": "tap_dich_truong"
  },
  "e13aa038fbdb": {
   "f": "ve13aa038fbdb.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "6f46ee788ea5": {
   "f": "v6f46ee788ea5.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "a6e9e7b5006d": {
   "f": "va6e9e7b5006d.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "e8c382d028e9": {
   "f": "ve8c382d028e9.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "014a71caa9ba": {
   "f": "v014a71caa9ba.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "5c6798b71fe5": {
   "f": "v5c6798b71fe5.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "2a09a2f9685a": {
   "f": "v2a09a2f9685a.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "30500ca50aab": {
   "f": "v30500ca50aab.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "529ec8a476eb": {
   "f": "v529ec8a476eb.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "4f44b58cdc93": {
   "f": "v4f44b58cdc93.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "171a618dd0ca": {
   "f": "v171a618dd0ca.mp3",
   "k": "say",
   "s": "bach_kinh_duong"
  },
  "f932df5134c4": {
   "f": "vf932df5134c4.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "04612225c9f4": {
   "f": "v04612225c9f4.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "d60bd12e5962": {
   "f": "vd60bd12e5962.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "c85d7223f904": {
   "f": "vc85d7223f904.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "2b31790b9416": {
   "f": "v2b31790b9416.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "fc4453ee03e4": {
   "f": "vfc4453ee03e4.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "5e081362877b": {
   "f": "v5e081362877b.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "2a34c4e2da46": {
   "f": "v2a34c4e2da46.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "1a600b8b08c2": {
   "f": "v1a600b8b08c2.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "e46cbf3b30ba": {
   "f": "ve46cbf3b30ba.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "77398473d9bf": {
   "f": "v77398473d9bf.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "8b58b516993c": {
   "f": "v8b58b516993c.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "fb8602ceee9e": {
   "f": "vfb8602ceee9e.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "2e4005f9b37a": {
   "f": "v2e4005f9b37a.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "eacdf699e345": {
   "f": "veacdf699e345.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "572af6494100": {
   "f": "v572af6494100.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "ee77b3d90a01": {
   "f": "vee77b3d90a01.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "29a899b2291d": {
   "f": "v29a899b2291d.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "04ec067f5778": {
   "f": "v04ec067f5778.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "ec0acd293aa9": {
   "f": "vec0acd293aa9.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "3bade46efc18": {
   "f": "v3bade46efc18.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "2d9aea4b7186": {
   "f": "v2d9aea4b7186.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "ec23a0f771a4": {
   "f": "vec23a0f771a4.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "b7e96c793519": {
   "f": "vb7e96c793519.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "23847624e8ff": {
   "f": "v23847624e8ff.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "e1aa6dadd7d6": {
   "f": "ve1aa6dadd7d6.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "d335fda819f2": {
   "f": "vd335fda819f2.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "9a24825a7793": {
   "f": "v9a24825a7793.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "52fa920a68db": {
   "f": "v52fa920a68db.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "e50c914b0872": {
   "f": "ve50c914b0872.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "412a433e93a0": {
   "f": "v412a433e93a0.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "869e3ff9afc9": {
   "f": "v869e3ff9afc9.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "523d5001f229": {
   "f": "v523d5001f229.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "02e3b21693c5": {
   "f": "v02e3b21693c5.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "300db06ad2bb": {
   "f": "v300db06ad2bb.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "fa299dd9a9f4": {
   "f": "vfa299dd9a9f4.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "66f126e1b41b": {
   "f": "v66f126e1b41b.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "bef7ac61b5ca": {
   "f": "vbef7ac61b5ca.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "50a8df51e5b4": {
   "f": "v50a8df51e5b4.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "2f615d8795b2": {
   "f": "v2f615d8795b2.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "0295ecaef3bf": {
   "f": "v0295ecaef3bf.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "4dfd3b5e3a24": {
   "f": "v4dfd3b5e3a24.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "c6f34428d383": {
   "f": "vc6f34428d383.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "7ad917ae36b1": {
   "f": "v7ad917ae36b1.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "5f81cbda0da5": {
   "f": "v5f81cbda0da5.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "630e55ce6c4d": {
   "f": "v630e55ce6c4d.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "63d3b3be7177": {
   "f": "v63d3b3be7177.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "1f969ea54d4d": {
   "f": "v1f969ea54d4d.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "ad7987df174c": {
   "f": "vad7987df174c.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "34cdbc5a7633": {
   "f": "v34cdbc5a7633.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "0a731567e14a": {
   "f": "v0a731567e14a.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "efa986ecc65b": {
   "f": "vefa986ecc65b.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "6b865e4d2d24": {
   "f": "v6b865e4d2d24.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "a51eb761e78f": {
   "f": "va51eb761e78f.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "81b9edd3afc7": {
   "f": "v81b9edd3afc7.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "e9032e06f993": {
   "f": "ve9032e06f993.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "3279b3d8e49e": {
   "f": "v3279b3d8e49e.mp3",
   "k": "say",
   "s": "tram_truong"
  },
  "defeeed59c2a": {
   "f": "vdefeeed59c2a.mp3",
   "k": "say",
   "s": "tram_truong"
  },
  "71acb537b806": {
   "f": "v71acb537b806.mp3",
   "k": "say",
   "s": "tram_truong"
  },
  "3ef2686e663b": {
   "f": "v3ef2686e663b.mp3",
   "k": "say",
   "s": "nguoi_giu_truoc"
  },
  "94501849948c": {
   "f": "v94501849948c.mp3",
   "k": "say",
   "s": "truong_thon_ven_song"
  },
  "bd3c4de608ed": {
   "f": "vbd3c4de608ed.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "84432a9b900b": {
   "f": "v84432a9b900b.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "38dbbeaa709a": {
   "f": "v38dbbeaa709a.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "995b9ccb1eae": {
   "f": "v995b9ccb1eae.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "59d33382270d": {
   "f": "v59d33382270d.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "4cfdde753936": {
   "f": "v4cfdde753936.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "ce70210fccea": {
   "f": "vce70210fccea.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "6bdea3039dca": {
   "f": "v6bdea3039dca.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "dc56ea348865": {
   "f": "vdc56ea348865.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "8412b6825911": {
   "f": "v8412b6825911.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "a1faad8f9a33": {
   "f": "va1faad8f9a33.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "ddd33a5655d0": {
   "f": "vddd33a5655d0.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "e8ce96d68f6c": {
   "f": "ve8ce96d68f6c.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "0f729683a948": {
   "f": "v0f729683a948.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "3e735937c35c": {
   "f": "v3e735937c35c.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "a3ad7440fdf7": {
   "f": "va3ad7440fdf7.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "a3d64217d693": {
   "f": "va3d64217d693.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "4b560fabdf08": {
   "f": "v4b560fabdf08.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "8f45beca97c3": {
   "f": "v8f45beca97c3.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "2d8c57abf856": {
   "f": "v2d8c57abf856.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "364186edaad0": {
   "f": "v364186edaad0.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "68f9068f659d": {
   "f": "v68f9068f659d.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "4c444928e224": {
   "f": "v4c444928e224.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "c86794455692": {
   "f": "vc86794455692.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "25e51acdf75c": {
   "f": "v25e51acdf75c.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "181061e0cc97": {
   "f": "v181061e0cc97.mp3",
   "k": "say",
   "s": "tap_dich_truong"
  },
  "c4f1f095150a": {
   "f": "vc4f1f095150a.mp3",
   "k": "say",
   "s": "tap_dich_truong"
  },
  "8cbf7c14868b": {
   "f": "v8cbf7c14868b.mp3",
   "k": "say",
   "s": "tap_dich_truong"
  },
  "297ab1d2f4dc": {
   "f": "v297ab1d2f4dc.mp3",
   "k": "say",
   "s": "tap_dich_truong"
  },
  "96381d6d26d8": {
   "f": "v96381d6d26d8.mp3",
   "k": "say",
   "s": "tap_dich_truong"
  },
  "cd32bdc41e62": {
   "f": "vcd32bdc41e62.mp3",
   "k": "say",
   "s": "tap_dich_truong"
  },
  "544a03992c99": {
   "f": "v544a03992c99.mp3",
   "k": "say",
   "s": "tap_dich_truong"
  },
  "f98ec00d1500": {
   "f": "vf98ec00d1500.mp3",
   "k": "say",
   "s": "tap_dich_truong"
  },
  "c06fa1660c89": {
   "f": "vc06fa1660c89.mp3",
   "k": "say",
   "s": "tap_dich_truong"
  },
  "23ed7c980f7a": {
   "f": "v23ed7c980f7a.mp3",
   "k": "say",
   "s": "tap_dich_truong"
  },
  "57185b312746": {
   "f": "v57185b312746.mp3",
   "k": "say",
   "s": "tap_dich_truong"
  },
  "2f9e7c46b814": {
   "f": "v2f9e7c46b814.mp3",
   "k": "say",
   "s": "tap_dich_truong"
  },
  "22c952afbbf4": {
   "f": "v22c952afbbf4.mp3",
   "k": "say",
   "s": "tap_dich_truong"
  },
  "d78f14e878be": {
   "f": "vd78f14e878be.mp3",
   "k": "say",
   "s": "tap_dich_truong"
  },
  "ae81e8ccb32c": {
   "f": "vae81e8ccb32c.mp3",
   "k": "say",
   "s": "thien_dao"
  },
  "6e17f56bc94f": {
   "f": "v6e17f56bc94f.mp3",
   "k": "say",
   "s": "thien_dao"
  },
  "8831e64a2c6c": {
   "f": "v8831e64a2c6c.mp3",
   "k": "say",
   "s": "thien_dao"
  },
  "885912e5e924": {
   "f": "v885912e5e924.mp3",
   "k": "say",
   "s": "thien_dao"
  }
 ,
  "cdc7dffb3726": {
   "f": "vcdc7dffb3726.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "1a1f96f20ccf": {
   "f": "v1a1f96f20ccf.mp3",
   "k": "say",
   "s": "lao_tieu"
  },
  "c6745d24eb40": {
   "f": "vc6745d24eb40.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "1660f2f9f98b": {
   "f": "v1660f2f9f98b.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "b0802527f9cb": {
   "f": "vb0802527f9cb.mp3",
   "k": "say",
   "s": "lao_tieu"
  },
  "e799609ad2af": {
   "f": "ve799609ad2af.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "d0e385bd6eae": {
   "f": "vd0e385bd6eae.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "e9e0174cacfb": {
   "f": "ve9e0174cacfb.mp3",
   "k": "say",
   "s": "nguoi_chan_de"
  },
  "7f13cb37c414": {
   "f": "v7f13cb37c414.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "b6fdffe5afe2": {
   "f": "vb6fdffe5afe2.mp3",
   "k": "narrate",
   "s": "narrate"
  }
 },
 "announce": {
  "truc_co": {
   "key": "ae81e8ccb32c",
   "f": "vae81e8ccb32c.mp3"
  },
  "kim_dan": {
   "key": "6e17f56bc94f",
   "f": "v6e17f56bc94f.mp3"
  },
  "fallback": {
   "key": "8831e64a2c6c",
   "f": "v8831e64a2c6c.mp3"
  },
  "nguyen_anh": {
   "key": "885912e5e924",
   "f": "v885912e5e924.mp3"
  }
 }
};
