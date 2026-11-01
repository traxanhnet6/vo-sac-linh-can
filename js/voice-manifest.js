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
  "f05c82e52cf9": {
   "f": "vf05c82e52cf9.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "7a5741f272cf": {
   "f": "v7a5741f272cf.mp3",
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
  "9ff2135a56f2": {
   "f": "v9ff2135a56f2.mp3",
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
  "360758cd2b87": {
   "f": "v360758cd2b87.mp3",
   "k": "say",
   "s": "truong_lao"
  },
  "724319cd027e": {
   "f": "v724319cd027e.mp3",
   "k": "narrate",
   "s": "narrate"
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
  "3369299fa92a": {
   "f": "v3369299fa92a.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "12a4ed7c82bd": {
   "f": "v12a4ed7c82bd.mp3",
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
  "a9d6c24e491e": {
   "f": "va9d6c24e491e.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "df442ac5a547": {
   "f": "vdf442ac5a547.mp3",
   "k": "narrate",
   "s": "narrate"
  },
  "2b7b31f90677": {
   "f": "v2b7b31f90677.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "fa507e0725fd": {
   "f": "vfa507e0725fd.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "184c4573f09f": {
   "f": "v184c4573f09f.mp3",
   "k": "say",
   "s": "truong_lao_tong"
  },
  "33655e52aa47": {
   "f": "v33655e52aa47.mp3",
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
  "990357064b49": {
   "f": "v990357064b49.mp3",
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
  }
 }
};
