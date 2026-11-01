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
  }
 }
};
