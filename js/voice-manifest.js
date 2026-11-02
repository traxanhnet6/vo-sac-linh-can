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
  "be32c4ab8476": {
   "f": "vbe32c4ab8476.mp3",
   "k": "say",
   "s": "truong_lao"
  },
  "8c63780375ae": {
   "f": "v8c63780375ae.mp3",
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
  "9bf320b3fd52": {
   "f": "v9bf320b3fd52.mp3",
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
  "b91a45365d57": {
   "f": "vb91a45365d57.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "09afd671c9ea": {
   "f": "v09afd671c9ea.mp3",
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
  "42d8f20dadab": {
   "f": "v42d8f20dadab.mp3",
   "k": "say",
   "s": "thap_chu"
  },
  "4438ef189e92": {
   "f": "v4438ef189e92.mp3",
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
  "28278984b75f": {
   "f": "v28278984b75f.mp3",
   "k": "say",
   "s": "duoc_su"
  },
  "114c77f77a04": {
   "f": "v114c77f77a04.mp3",
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
  "2e10965e96bb": {
   "f": "v2e10965e96bb.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "0a2bf1df52e2": {
   "f": "v0a2bf1df52e2.mp3",
   "k": "say",
   "s": "tran_chinh_dao"
  },
  "8cca6c31d362": {
   "f": "v8cca6c31d362.mp3",
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
  "74d9c2314ebe": {
   "f": "v74d9c2314ebe.mp3",
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
  "5c297aaaaf8f": {
   "f": "v5c297aaaaf8f.mp3",
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
  "25fb2aae6511": {
   "f": "v25fb2aae6511.mp3",
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
  "3b22ddce7c77": {
   "f": "v3b22ddce7c77.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "8fea4b15f171": {
   "f": "v8fea4b15f171.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "8febd2f00f4a": {
   "f": "v8febd2f00f4a.mp3",
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
  "d56f2296886e": {
   "f": "vd56f2296886e.mp3",
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
  "5ac9d92bba02": {
   "f": "v5ac9d92bba02.mp3",
   "k": "say",
   "s": "u_nhan"
  },
  "3fdeefdf8d9a": {
   "f": "v3fdeefdf8d9a.mp3",
   "k": "say",
   "s": "mo_cuu_u"
  },
  "259e4643dc2a": {
   "f": "v259e4643dc2a.mp3",
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
  "1d7f1ec06875": {
   "f": "v1d7f1ec06875.mp3",
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
  "c3053d38e3da": {
   "f": "vc3053d38e3da.mp3",
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
  "c32a1c8ffc32": {
   "f": "vc32a1c8ffc32.mp3",
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
  "eefa3b30ad54": {
   "f": "veefa3b30ad54.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "246b5027e291": {
   "f": "v246b5027e291.mp3",
   "k": "say",
   "s": "hero"
  },
  "902f82b498aa": {
   "f": "v902f82b498aa.mp3",
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
  "7c9c5f03a8d7": {
   "f": "v7c9c5f03a8d7.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "39328a2a225c": {
   "f": "v39328a2a225c.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "b63a7a7916f2": {
   "f": "vb63a7a7916f2.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "ed10aed4f699": {
   "f": "ved10aed4f699.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "6928dd9f168f": {
   "f": "v6928dd9f168f.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "ee75af80076b": {
   "f": "vee75af80076b.mp3",
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
  "94b6b996aee1": {
   "f": "v94b6b996aee1.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "5a752a5ff9b0": {
   "f": "v5a752a5ff9b0.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "bd1beb7dad70": {
   "f": "vbd1beb7dad70.mp3",
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
  "bb1f9dcb89bf": {
   "f": "vbb1f9dcb89bf.mp3",
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
  "df52e86ffe29": {
   "f": "vdf52e86ffe29.mp3",
   "k": "say",
   "s": "de_tu_ho_tong"
  },
  "d1018b245c71": {
   "f": "vd1018b245c71.mp3",
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
  "c47aa7de2337": {
   "f": "vc47aa7de2337.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "ff221bb7be43": {
   "f": "vff221bb7be43.mp3",
   "k": "say",
   "s": "oan_hon"
  },
  "b4136f24d0e4": {
   "f": "vb4136f24d0e4.mp3",
   "k": "say",
   "s": "oan_hon"
  },
  "c0ece9d747e7": {
   "f": "vc0ece9d747e7.mp3",
   "k": "say",
   "s": "oan_hon"
  },
  "a8f996d74754": {
   "f": "va8f996d74754.mp3",
   "k": "say",
   "s": "oan_hon"
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
  "2a2a51595a16": {
   "f": "v2a2a51595a16.mp3",
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
  "f6d18446bbab": {
   "f": "vf6d18446bbab.mp3",
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
  "0abd3b68ef53": {
   "f": "v0abd3b68ef53.mp3",
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
  "c9eb95376b4a": {
   "f": "vc9eb95376b4a.mp3",
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
  "ad88a84c1858": {
   "f": "vad88a84c1858.mp3",
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
  "28dbf8924401": {
   "f": "v28dbf8924401.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "dcbc164e1968": {
   "f": "vdcbc164e1968.mp3",
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
  "0b2ad888a20c": {
   "f": "v0b2ad888a20c.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "e15cb907ef98": {
   "f": "ve15cb907ef98.mp3",
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
  "f25c1e45d695": {
   "f": "vf25c1e45d695.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "2a5f972f0470": {
   "f": "v2a5f972f0470.mp3",
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
  "18ffca5be451": {
   "f": "v18ffca5be451.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "7e0245f582df": {
   "f": "v7e0245f582df.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "b7a286f1a530": {
   "f": "vb7a286f1a530.mp3",
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
  "45425357e251": {
   "f": "v45425357e251.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "3bade46efc18": {
   "f": "v3bade46efc18.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "b642b2070c6e": {
   "f": "vb642b2070c6e.mp3",
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
  "46b199edd3dc": {
   "f": "v46b199edd3dc.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "c74b338fdb03": {
   "f": "vc74b338fdb03.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "6cfb6d04d140": {
   "f": "v6cfb6d04d140.mp3",
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
  "18dca1211849": {
   "f": "v18dca1211849.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "52ac4f36eea8": {
   "f": "v52ac4f36eea8.mp3",
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
  }
 }
};
