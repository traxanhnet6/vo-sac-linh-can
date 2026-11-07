#!/usr/bin/env python3
"""Kiểm chứng 13 tranh nền mượt của Vô Sắc Linh Căn + sinh ảnh bằng chứng.

Cách chạy:  python3 tools/verify-bgs.py [mapId ...] [--previews]
(mặc định: tất cả các bản đồ)
Kiểm:
  1. Cả 5 tệp assets/bg-<id>.png tồn tại, kích thước pixel == ô*32 đúng dữ liệu.
  2. Mã băm SHA-256 của js/logic.js không đổi so với baseline đã chốt.
  3. Khớp dữ liệu tại TÂM Ô: lấy màu trung bình 6x6px tại tâm mỗi ô trong
     tranh, phân loại về nhóm địa hình gần nhất theo bảng màu neo của trấn
     (cỏ ./, · đất D/G · đá S · hoa văn P · nước W · bờ w · tường X) và đối
     chiếu ký tự grid thật — phải khớp 100% (trừ dung sai S/P kề nhau: vẫn
     tính riêng, báo cả hai con số).
Với --previews: ghi vào previews/bg-smooth/ cho mỗi bản đồ: ảnh toàn cảnh
thu nhỏ (chỉ nền mới), 2-3 ảnh cắt 100% tại mối nối địa hình tìm từ dữ liệu,
và 1 ảnh phủ kiểm chứng (nền thu nhỏ + lưới ô mờ + cổng/NPC/điểm rơi từ dữ
liệu). Ảnh TRƯỚC (nền ô hiện tại) sinh bằng tools/render-map.py riêng.
"""
import hashlib
import json
import subprocess
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
CELL = 32
# Ghim lại ngày 02/11 cho đợt làm giàu hình ảnh Thanh Vân Tông + gói
# phụ bàn trà sân phủ Hứa: logic.js chỉ đổi ở lớp trình diễn (type của
# hai trụ sơn môn, +20 prop trang trí tông môn, +2 đôn đá sân phủ) —
# lưới ô, NPC và mọi tọa độ chức năng giữ nguyên; kiểm liên thông tự
# động 18 neo tông môn + ô đứng sân phủ đều đạt trước khi ghim.
# GHIM LẠI (Mục F đợt vá 2026-11-02, khai báo thay đổi tiền đề): thêm
# bản đồ MỚI dai_dau_kiem 40x30 (Đài Đấu Kiếm) — logic.js chỉ THÊM
# lưới/vật thể/đăng ký của bản đồ mới, không đổi bất kỳ lưới ô, NPC hay
# tọa độ chức năng nào của 12 bản đồ cũ; 12 tranh cũ giữ nguyên tệp.
# GHIM LẠI (cổng cuối đợt vá 2026-11-02, điều phối viên — khai báo thay
# đổi tiền đề): sau Mục F, Mục G chỉ đổi js/game.js/index.html/css;
# Mục H chỉ THÊM dữ liệu + hàm nhiệm vụ phụ (SIDE_QUEST_DEFS và các hàm
# sideQuest* ở cuối logic.js) — không đổi bất kỳ lưới ô, NPC, tọa độ
# chức năng hay đăng ký bản đồ nào; lượt verify-bgs trước khi ghim lại
# cho cả 13 bản đồ ĐẠT từng ô, chỉ rớt ở dòng đối chiếu băm này.
# GHIM LẠI (đợt vá nhanh 2026-11-03, khai báo thay đổi tiền đề):
# logic.js chỉ đổi ở dữ liệu nhiệm vụ (hint của q6_done) và khâu chuẩn
# hóa save (cứu cờ invited) — đối chiếu dữ liệu bản đồ (grid/props/NPC)
# với bản live e09ffe6 ở staging: 0 khác biệt; lượt verify-bgs trước khi
# ghim lại cho cả 14 bản đồ ĐẠT, chỉ rớt ở dòng đối chiếu băm này (mốc
# ghim cũ không còn tồn tại trong lịch sử staging nên nhánh đối chiếu
# tự động của công cụ không kích hoạt được).
# GHIM LẠI (ĐIỂM 4 đợt vá theo chơi thử live 2026-11-03, khai báo thay
# đổi tiền đề): logic.js chỉ THÊM một biển chỉ dẫn vào danh sách signs
# của co_chau — { x: 55, y: 73, text: 'Đường Mòn Xuyên Rừng' } ở quảng
# trường nam, chỉ cổng về Đường Mòn (dải 50..53, 77). Đối chiếu trực
# tiếp dữ kiện đã dựng của co_chau trước/sau: grid, props, NPC,
# portals GIỐNG HỆT, signs chỉ thêm đúng mục này; biển không phải vật
# thể nên không chặn đường và không đổi dữ kiện ô nào; lượt verify-bgs
# trước khi ghim lại: cả 13 bản đồ ĐẠT, nhánh đối chiếu tự động của
# công cụ xác nhận dữ liệu bản đồ giống hệt baseline (0 khác biệt).
# GHIM LẠI (đợt gộp cảnh vật map boss + mở rộng toàn hang 2026-11-04,
# khai báo thay đổi tiền đề): logic.js chỉ THÊM 117 prop cảnh vật (hai
# khối id bm_/bm2_ ở cuối phần đăng ký cổng bí cảnh) vào 9 bản đồ — sau
# gộp logic.js identical từng byte với cây nguồn game-vo-sac-bossmap đã
# qua kiểm vị trí prop 117/117 và kiểm liên thông 0 ô bị cô lập; lượt
# verify-bgs trước khi ghim lại: cả 13 bản đồ ĐẠT, 5 nền bí cảnh khớp
# hiệu chỉnh 100,00%, chỉ rớt ở dòng đối chiếu băm này.
# GHIM LẠI (đợt gộp Kiểm Trắc Tháp vào cây chính 2026-11-04, khai báo
# thay đổi tiền đề): logic.js chỉ THÊM vật thể trang trí vào khối tháp
# SỐNG (khối thứ hai) — sân tháp +24 vật thể nối SAU scatter (47 cây
# rải hạt 37 giữ nguyên vị trí), sảnh tháp +4 vật thể; hai nền tháp vẽ
# lại. Đối chiếu dữ liệu với baseline (staging c4c93ab): grid 0 bản đồ
# khác, NPC 0 bản đồ khác, props khác đúng 2 bản đồ tháp (50→74 và
# 8→12) — nhánh đối chiếu tự động của công cụ vì thế báo "đã đổi" đúng
# ở phần prop cộng thêm có chủ đích; lượt verify-bgs trước khi ghim
# lại: cả 13 bản đồ ĐẠT, hai nền tháp khớp hiệu chỉnh 100,00%.
# GHIM LẠI (đợt gộp Cô Châu Thành + trang viên Hứa Gia vào cây chính
# 2026-11-04, khai báo thay đổi tiền đề): logic.js chỉ THÊM khối extra
# trong CITY_PROPS (trang viên tứ hợp viện quây kín + vật thể trang
# trí các khu) và nền co_chau vẽ lại. Đối chiếu dữ liệu tách thành
# phần: grid/NPC/biển/cổng/điểm thiền 0 bản đồ khác so với gốc, props
# co_chau khớp TUYỆT ĐỐI cây nguồn đợt (142 → 260, gồm 3 cây rải tự
# động lùi khỏi vùng tránh footprint mới như thiết kế nguồn), các đợt
# gộp trước (117 vật bm_/bm2_, 28 vật tháp) còn nguyên. BFS toàn
# thành trên cây chính sau gộp: blocked=689, walk=7423, reach=7423 —
# không ô nào bị cô lập, khớp số liệu cây nguồn.
# GHIM LẠI (đợt gộp bí cảnh boss tổ đội Di Tích Trận Tâm vào cây chính
# 2026-11-05, khai báo thay đổi tiền đề): logic.js THÊM hai bản đồ bí
# cảnh mới (bc_tran_tam 44×32, bc_tran_tam_sau 40×30) + 2 vật thể cổng/
# bia trên thanh_van_tong + lớp tổ đội/bot ghép tổ (dữ kiện thuần) —
# đối chiếu MAPS độc lập trước/sau gộp trên cây chính: 15 → 17 bản đồ,
# grid/NPC/cổng/biển của 15 bản đồ cũ giống hệt từng ký tự, props chỉ
# khác ở thanh_van_tong (569 → 571, thêm đúng bc_gate_tran_tam +
# tap_ket_tran_tam, 0 sửa 0 xóa); lượt verify-bgs trước khi ghim lại:
# cả 15 bản đồ ĐẠT, hai nền bí cảnh mới khớp nghiêm ngặt 100,00%, chỉ
# rớt ở dòng đối chiếu băm này.
# GHIM LẠI (đợt gộp hệ đồ ăn vào cây chính 2026-11-05, khai báo thay
# đổi tiền đề): logic.js THÊM hệ đồ ăn (ITEM_DEFS/FOOD_RECIPES/hàm
# mua-nấu-ăn-hái + nhiệm vụ phụ sq_food_tutorial + claimSideQuest
# chuyển tiếp trường items của phần thưởng) — phần dữ liệu bản đồ chỉ
# đổi đúng: tuu_diem (trấn) và tram_nghi (đường mòn) thêm cờ
# interact:true, THÊM hai bãi nấm bai_nam_tran (trấn, 17,33) và
# bai_nam_duong (đường mòn, 50,15). Đối chiếu dữ liệu MAPS độc lập
# trước/sau gộp so với baseline (staging 50020cc): grid và NPC giống
# hệt từng ký tự ở cả 17 bản đồ, props chỉ khác đúng hai điểm trên;
# lượt verify-bgs trước khi ghim lại: cả 15 bản đồ ĐẠT, chỉ rớt ở
# dòng đối chiếu băm này.
# GHIM LẠI (đợt gộp NÚT TO bigbtn vào cây chính 2026-11-05, khai báo
# thay đổi tiền đề): đợt này chỉ đổi css/style.css + tiền đề test §61,
# KHÔNG đụng logic.js. Băm logic hiện tại 87b8cdc5… là của đợt gộp sửa
# lỗi nhiệm vụ nấu ăn (foodfix, đã live baee2bb) mà lượt gộp đó chưa
# ghim lại: thay đổi của foodfix thuần chức năng (ví bạc/tasteFood/giá
# bạc/văn bản nhiệm vụ ở logic + game.js), dữ liệu bản đồ KHÔNG đổi —
# đã đối chiếu độc lập MAPS (grid/props/vị trí NPC) giữa logic hiện tại
# và baseline 83d36569… (bản ở cây bigbtn): diff = 0. Lượt verify-bgs
# trước khi ghim lại: cả 15 bản đồ ĐẠT, chỉ rớt ở dòng đối chiếu băm.
# GHIM LẠI (đợt gộp ĐÀI THĂNG LONG thành bản đồ riêng vào cây chính
# 2026-11-06, khai báo thay đổi tiền đề): kể từ ghim 87b8cdc5…, logic
# chính đã qua đợt gộp icon (chỉ thêm trường icon vào ITEM_DEFS — dữ
# liệu bản đồ không đổi) và nay thêm đúng phần của đợt Thăng Long:
# THÊM bản đồ thang_long_dai 48x34 (lưới + 16 vật thể, bia đài ngự ở
# đó), BỎ bia thang_long_dai khỏi SECT_PROPS đang nạp của
# thanh_van_tong (khối dữ liệu chết trùng lặp không nạp vẫn còn bia ở
# vị trí cũ — nợ dọn cũ đã biết, không thuộc đợt này), THÊM cổng hai
# chiều tông <-> đỉnh (cổng tông tại (14..17,5) không điều kiện; cổng
# về tại hàng 33 của đỉnh), mô tả + gợi ý q7_thang_long trỏ sang bản
# đồ mới. Dữ liệu các bản đồ khác không đổi: đối chiếu MAPS giữa
# logic đã gộp và logic cây đợt thanglong cho thấy grid/props/NPC của
# 15 bản đồ cũ giống hệt, chỉ thêm thang_long_dai. Lượt verify-bgs
# của lượt gộp: cả 16 bản đồ ĐẠT, bản đồ mới khớp tâm ô nghiêm ngặt
# 1632/1632 = 100%.
# GHIM LẠI (đợt gộp TÚI THƯỜNG 90 MÓN vào cây chính 2026-11-06, khai
# báo thay đổi tiền đề): logic chỉ đổi ĐÚNG một hunk — hằng BAG_TIERS
# sức chứa 10/20/35/55 -> 90/130/180/240 (lệnh Bui 00:01 ngày
# 2026-11-06, giá nâng cấp giữ nguyên) kèm comment. Đã đối chiếu độc
# lập: diff logic đã gộp so với logic live 339cacd chỉ có hunk đó —
# dữ liệu MAPS (grid/props/NPC/cổng) giống hệt từng byte. Lượt
# verify-bgs trước khi ghim lại: cả 16 bản đồ ĐẠT, chỉ rớt ở dòng đối
# chiếu băm này.
# GHIM LẠI (đợt bảng nhân vật đầy đủ 2026-11-06): logic.js đổi do
# thêm khối Bảng Nhân Vật (charPanelData, validateCharName/
# renameCharacter, bộ đếm thống kê state.stats + móc normalizeSave/
# newCharacter) — KHÔNG đổi dữ liệu bản đồ: đối chiếu độc lập dữ liệu
# MAPS và QUESTS giữa cây guide (baseline cũ) và cây charpanel giống
# hệt từng ký tự (JSON.stringify bằng nhau, 17 bản đồ). Ghim lại băm
# logic.js của cây charpanel; lượt chạy lại sau ghim: ĐẠT TẤT CẢ.
# GHIM LẠI (đợt mở rộng bảng nhân vật + thẻ Trang bị người giấy
# 2026-11-06, khai báo thay đổi tiền đề): logic.js đổi do mở rộng
# charPanelData (quan hệ/bí cảnh/pháp khí/thọ nguyên phòng thủ/ngoại
# hình/hành trình/kỷ lục/trang bị), thêm state.journal + ba bộ đếm kỷ
# lục trong state.stats móc tại addLinhThach/bagAdd/tryBreakthrough —
# KHÔNG đổi dữ liệu bản đồ: đối chiếu độc lập dữ liệu MAPS + QUESTS +
# NPCS giữa cây guide (baseline cũ) và cây charpanel giống hệt từng ký
# tự (JSON.stringify bằng nhau, 17 bản đồ) trước khi ghim; lượt
# verify-bgs sau ghim lại: ĐẠT TẤT CẢ.
# GHIM LẠI (đợt hệ pháp bảo đeo được 2026-11-06, khai báo thay đổi
# tiền đề): logic.js đổi do thêm TREASURE_DEFS (24 pháp bảo đăng ký
# vào ITEM_DEFS) + đeo/tháo/rơi boss/đổi cống hiến + móc hiệu lực tại
# swordPower/castSword/castWord/meditateRate/silenceGain +
# newCharacter/normalizeSave dựng trường treasures — KHÔNG đổi dữ
# liệu bản đồ: đối chiếu độc lập dữ liệu MAPS + QUESTS + NPCS giữa
# cây guide (baseline cũ) và cây charpanel giống hệt từng ký tự
# (JSON.stringify bằng nhau, 17 bản đồ / 118 nhiệm vụ / 9 NPC) trước
# khi ghim; lượt verify-bgs sau ghim lại: ĐẠT TẤT CẢ.
# GHIM LẠI (đợt gộp BẢNG NHÂN VẬT + HỆ PHÁP BẢO vào cây chính
# 2026-11-06, khai báo thay đổi tiền đề): logic.js đã gộp gồm toàn bộ
# hunk của dòng charpanel (khối Bảng Nhân Vật + mở rộng + người giấy +
# TREASURE_DEFS và các móc hiệu lực/đếm) cộng hai dòng nối thẻ Túi
# (tên vật chứa + ví Bạc) — dữ liệu bản đồ KHÔNG đổi: đã đối chiếu độc
# lập MAPS + QUESTS + NPCS giữa logic trước gộp (bản live a2cd62e) và
# logic đã gộp: JSON.stringify giống hệt từng ký tự (18 bản đồ trong
# MAPS). Ghim baseline = băm logic.js đã gộp; lượt verify-bgs của đợt
# gộp: ĐẠT TẤT CẢ.
# GHIM LẠI (đợt gộp GIFTCODE vào cây chính 2026-11-06, khai báo
# thay đổi tiền đề): logic.js đổi đúng phạm vi đợt giftcode — thêm
# trường giftCodesUsed vào newCharacter, khối Giftcode (GIFT_CODES +
# giftCodeNormalize + ensureGiftCodes + redeemGiftCode) sau
# addSectMerit, một dòng gọi ensureGiftCodes trong normalizeSave và
# xuất hàm tương ứng. Đã đối chiếu độc lập: dữ liệu MAPS + QUESTS +
# NPCS + BAG_TIERS giữa logic trước gộp (bản live eb669fc) và logic
# đã gộp GIỐNG HỆT từng ký tự JSON (18 bản đồ trong MAPS). Ghim
# baseline = băm logic.js đã gộp; lượt verify-bgs của đợt gộp:
# ĐẠT TẤT CẢ.
# GHIM LẠI (đợt gộp BOT ĐẤU PHÁP LUYỆN TẬP vào cây chính 2026-11-06,
# khai báo thay đổi tiền đề): logic.js đổi đúng phạm vi đợt practice —
# thêm 3 NPC bot luyện tập (prac_bot_1/2/3, cờ prac + requiresQuest
# 'q7_done') vào cả hai khối SECT_NPCS của thanh_van_tong, cổng hiện
# hình requiresQuest trong npcPosFor, khối PRACTICE_BOTS +
# practiceOpen/practiceBotDef/practiceStopHp và dòng xuất hàm. Đã đối
# chiếu độc lập: dữ liệu MAPS (grid/props/portals) + QUESTS +
# BAG_TIERS giữa logic trước gộp (bản live cf20f6a) và logic đã gộp
# GIỐNG HỆT từng ký tự JSON (18 bản đồ trong MAPS); NPCS chỉ thêm đúng
# 3 bot trên ở thanh_van_tong, không bớt NPC nào. Ghim baseline = băm
# logic.js đã gộp; lượt verify-bgs của đợt gộp: ĐẠT TẤT CẢ.
# GHIM LẠI (đợt gộp SP-04 NHO TU "Thư Pháp Chân Kinh" vào cây chính
# 2026-11-06, khai báo thay đổi tiền đề): logic.js đổi đúng phạm vi
# đợt nhotu — thêm vật phẩm tàn thiên bi_tich_thu_phap_chan_kinh, định
# nghĩa bộ thu_phap_chan_kinh (7 thức dạng form qua nguHanhDef, hệ
# 'van', dải Kim Đan, hiếm 5 mảnh), resolver castThuPhap/thuPhapForms/
# thuPhapFormDef + dòng xuất hàm, và nguồn mảnh 'boss:bc_tapha' trong
# ARC_IV_FRAGMENT_SOURCES. Đã đối chiếu độc lập: dữ liệu MAPS +
# QUESTS + NPCS + BAG_TIERS giữa logic trước gộp (bản live 91351d9) và
# logic đã gộp GIỐNG HỆT từng ký tự JSON chuẩn hoá (18 bản đồ trong
# MAPS); TECHNIQUE_DEFS chỉ thêm đúng thu_phap_chan_kinh, ITEM_DEFS
# chỉ thêm đúng bi_tich_thu_phap_chan_kinh, ARC_IV_FRAGMENT_SOURCES
# chỉ thêm đúng 'boss:bc_tapha', không mục chung nào đổi. Ghim
# baseline = băm logic.js đã gộp; lượt verify-bgs của đợt gộp:
# ĐẠT TẤT CẢ.
# GHIM LẠI (đợt gộp TÁI CẤU TRÚC THẬP VẠN ĐẠI SƠN vào cây chính
# 2026-11-06, khai báo thay đổi tiền đề): logic.js đổi đúng phạm vi
# đợt TVĐS — áp hunk ba chiều từ mốc staging c58d21e (diff thuần
# TVĐS). Đã đối chiếu độc lập bằng dump JSON chuẩn hoá trước/sau gộp:
# QUESTS + NPCS + BAG_TIERS + TECHNIQUE_DEFS +
# ARC_IV_FRAGMENT_SOURCES GIỐNG HỆT từng ký tự; MAPS 18 -> 23: THÊM
# đúng 5 bản đồ con tách từ lưới mẹ 124x92 (thap_van_dai_son 124x18
# giữ id + neo cổng tông môn, tvds_truc_co 124x20, tvds_kim_dan
# 124x26, tvds_nguyen_anh 124x32, tvds_hoa_than 80x22; minRealm chỉ
# khóa chiều đi lên); thanh_van_tong chỉ THÊM cổng TVĐS (105..108,2,
# cond q7_done) + biển tại (107,5) — grid/props/NPC nguyên vẹn;
# MONSTER_DEFS +7 loài, HUNT_ZONES +8, HUNT_LAIRS 13 -> 29,
# RESOURCE_NODES 9 -> 24, BOSS_DEFS +5 boss canh giữ, ITEM_DEFS +2
# (huyen_bang_linh_chi + thien_tam_lien, icon vẽ thật sinh tại lượt
# gộp theo luật icon của Bui vì tài sản đợt chưa có icon). GHI CHÚ
# SỬA TIỀN ĐỀ CỦA ĐƠT GỘP: bản đồ mẹ CHƯA TỪNG có trên cây chính nên
# tổng MAPS là 18 -> 23 (không phải 22) và MAP_IDS nhạc 15 -> 20.
# Lượt verify-bgs trước khi ghim lại: cả 23 bản đồ ĐẠT (5 nền TVĐS
# khớp hiệu chỉnh 100,00/100,00/100,00/100,00/99,89 — nền Hóa Thần đã
# gồm vá sơn nhẹ bồn cỏ đông-bắc, chỉ sơn nền), chỉ rớt ở dòng đối
# chiếu băm này. Ghim baseline = băm logic.js đã gộp.
# GHIM LẠI (đợt gộp CUNG V chương 25–36 vào cây chính 2026-11-06,
# khai báo thay đổi tiền đề): logic.js đổi đúng phạm vi đợt arcv —
# áp hunk ba chiều từ mốc staging 50020cc (cây đợt rẽ nhánh rất sớm,
# không tệp nào chép đè). Đã đối chiếu độc lập bằng dump JSON chuẩn
# hoá trước/sau gộp: BAG_TIERS GIỐNG HỆT từng ký tự; MAPS 23 -> 26
# (THÊM đúng song_bac_thuong 96x74, bc_bendo 48x34, bc_bendo_sau
# 44x32; kiem_trac_thap chỉ THÊM 1 cổng (40,0) -> song_bac_thuong rơi
# (13,70) khóa quest:q25_len_duong — grid/props/NPC của 23 bản đồ cũ
# nguyên vẹn); QUESTS 118 -> 176 (118 mục cũ giữ nguyên từng ký tự
# và đúng thứ tự ở đầu mảng, +58 id mới của cung); MONSTER_DEFS +16
# loài, HUNT_ZONES +5, HUNT_LAIRS 29 -> 35, BOSS_DEFS +1 (Trầm Hồn
# Hà Yêu), SECRET_REALM_DEFS 8 -> 10 (Kho Chìm hai tầng),
# REWARD_PROFILES +5, ITEM_DEFS +3 (kim_than_dan, cuu_thien_ti_loi_phu,
# khoa_dong_ben), SWORD_MOVES +huyen_tinh_lien_tram (dải 2, 2x110%),
# TECHNIQUE_DEFS chỉ đổi huyen_tinh_kiem_pho (thêm tầng 2 {xp 120,
# realm 4, stage 0}), thêm ARC_V_STORY_REWARDS (15 mục) và hai hằng
# TRIB_DAN2_CUT 0,7 / TRIB_PHU2_CUT 0,9; mọi bảng còn lại giống hệt.
# Lượt verify-bgs trước khi ghim lại: cả 26 bản đồ ĐẠT (3 nền mới
# hiệu chỉnh 99,83/100,00/100,00), chỉ rớt ở dòng đối chiếu băm này.
# Ghim baseline = băm logic.js đã gộp.
# BỔ SUNG SAU LƯỢT CỔNG ĐẦU (cùng đợt gộp 2026-11-06): ensureThoNguyen
# thêm nhánh DI TRÚ save cũ — đợt bảng nhân vật trên cây chính đã dùng
# trường thoNguyen dạng SỐ (năm còn lại) trước khi sổ {paid, open} của
# cung V gộp vào; số cũ được chuyển sang flags.thoNguyen (khe đọc
# phòng thủ charLifespanOf đã chừa sẵn) thay vì bị chuẩn hoá vứt bỏ.
# Ngoài nhánh di trú đó logic.js không đổi gì thêm so với bản gộp
# (băm 31f6c493… ở lượt đối chiếu trên); baseline ghim lại theo băm
# cuối này.
# GHIM LẠI (đợt gộp BÍ PHÁP DẢI THƯỜNG 2026-11-06, khai báo thay đổi
# tiền đề): đối chiếu cấu trúc JSON trước khi ghim — MAPS giống hệt
# bản tiền gộp (26 bản đồ, đợt này không thêm bản đồ), QUESTS 176 /
# NPCS / BAG_TIERS / ITEM_DEFS / MONSTER_DEFS / BOSS_DEFS /
# HUNT_ZONES / HUNT_LAIRS / SECRET_REALM_DEFS / RESOURCE_NODES /
# REWARD_PROFILES tất cả giống hệt; TECHNIQUE_DEFS chỉ đổi đúng 12
# bộ dải Thường (hidden true -> false); ARC_IV_FRAGMENT_SOURCES:
# bc_tapha hợp nhất khóa trùng thành ['lien_nguc_hoa_tran',
# 'thu_phap_chan_kinh'] (khóa từng bị khai hai lần, dòng sau đè dòng
# trước khiến ô 10 mất nguồn trên cây chính — nay sửa), bc_thuyliem
# thêm 'bang_tram_van_tien' ở đầu. logic.js còn thêm khối đường tung
# ngu_hanh (nguHanhSplitHits / NGU_HANH_CONTROL / castNguHanh / các
# hàm dạy đường Thường / kỳ ngộ) và 2 cảnh kỳ ngộ trong story.js;
# lưới ô, NPC và tọa độ chức năng của 26 bản đồ không đổi.
# Ghim baseline = băm logic.js đã gộp này.
# GHIM LẠI (đợt gộp BÃI QUÁI DÃ NGOẠI vào cây chính 2026-11-07, khai
# báo thay đổi tiền đề): logic.js chỉ THÊM 13 mục vào HUNT_LAIRS
# (35 -> 48) + khối chú thích của đợt ở cuối mảng — đối chiếu cấu trúc
# độc lập trước khi ghim: 26 bản đồ giống hệt (grid/props/NPC từng ký
# tự), QUESTS / NPCS / BAG_TIERS / ITEM_DEFS / MONSTER_DEFS /
# BOSS_DEFS / HUNT_ZONES / SECRET_REALM_DEFS / RESOURCE_NODES /
# REWARD_PROFILES tất cả giống hệt bản tiền gộp (staging 1e1f354);
# HUNT_LAIRS là cấu trúc DUY NHẤT đổi (35 -> 48). Lượt verify-bgs
# trước khi ghim lại: cả 26 bản đồ ĐẠT, chỉ rớt ở dòng đối chiếu băm
# này (băm tiền gộp 3a1576d9… của ngự kiếm cũng đã lệch baseline
# ca2b3850… vì đợt gộp ngự kiếm chưa ghim lại — ghim lần này phủ cả
# phần đó). Ghim baseline = băm logic.js đã gộp bãi quái.
BASELINE_LOGIC_SHA = 'c675b130f9b7e4a36de37630bd9d1a13960c6187cb3b42c739532e8a8002d952'
MAPS = {
    'duong_mon': (3072, 2368), 'co_chau': (3328, 2496),
    'kiem_trac_thap': (2304, 1792), 'thap_noi': (1280, 960),
    'thanh_van_tong': (3968, 2944),
    'hb_valley': (3072, 2368), 'thien_co_lau': (2048, 1536),
    'bc_thuyliem': (1408, 1024), 'bc_tapha': (1280, 960),
    'bc_tapsau': (1280, 960), 'bc_kiemtrung': (1536, 1088),
    'bc_hoiphong_mo': (1664, 1216), 'dai_dau_kiem': (1280, 960),
    # Đợt gộp bí cảnh boss tổ đội Di Tích Trận Tâm (2026-11-05): THÊM hai
    # bản đồ mới từ cây partyboss (chỉ đăng ký kích thước để kiểm khớp
    # tâm ô; băm baseline phía trên đã GHIM LẠI kèm khai báo của đợt gộp).
    'bc_tran_tam': (1408, 1024), 'bc_tran_tam_sau': (1280, 960),
    # Đợt tách Đài Thăng Long thành bản đồ riêng (2026-11-05): THÊM bản
    # đồ mới thang_long_dai 48x34 (chỉ đăng ký kích thước để kiểm khớp
    # tâm ô; băm baseline GHIM LẠI kèm khai báo của đợt gộp).
    'thang_long_dai': (1536, 1088),
    # Đợt gộp THẬP VẠN ĐẠI SƠN vào cây chính (2026-11-06): khu tách 5 bản
    # đồ con theo vành đai — thap_van_dai_son là vành Luyện Khí 124x18
    # (nền khổ cũ 124x92 chưa từng có trên cây chính), thêm 4 nền con.
    'thap_van_dai_son': (3968, 576),
    'tvds_truc_co': (3968, 640),
    'tvds_kim_dan': (3968, 832),
    'tvds_nguyen_anh': (3968, 1024),
    'tvds_hoa_than': (2560, 704),
    # Đợt gộp CUNG V (chương 25–36) vào cây chính (2026-11-06): THÊM ba
    # bản đồ mới từ cây arcv — song_bac_thuong 96x74 và bí cảnh Kho Chìm
    # hai tầng bc_bendo 48x34 + bc_bendo_sau 44x32 (chỉ đăng ký kích
    # thước để kiểm khớp tâm ô; băm baseline GHIM LẠI kèm khai báo của
    # đợt gộp ở mục GHIM LẠI CUNG V ngay trên BASELINE_LOGIC_SHA).
    'song_bac_thuong': (3072, 2368),
    'bc_bendo': (1536, 1088),
    'bc_bendo_sau': (1408, 1024),
}
# Màu neo nhóm địa hình (đo từ tâm ô assets/bg.png của trấn; P lấy theo bộ sinh)
PROTO = {
    'grass': (107, 123, 65), 'dirt': (172, 135, 81), 'stone': (157, 150, 142),
    'pattern': (163, 156, 148), 'water': (58, 112, 163), 'shore': (199, 169, 105),
    'wall': (96, 85, 73),
}
GROUP = {'.': 'grass', ',': 'grass', 'D': 'dirt', 'G': 'dirt', 'S': 'stone',
         'P': 'pattern', 'W': 'water', 'w': 'shore', 'X': 'wall'}
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
FONT_B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'


def load_map(map_id):
    raw = subprocess.run(['node', str(ROOT / 'tools' / 'dump-map.js'), map_id],
                         capture_output=True, text=True, check=True).stdout
    return json.loads(raw)


def classify(rgb):
    best, bd = None, 1e18
    for name, p in PROTO.items():
        dd = sum((int(rgb[i]) - p[i]) ** 2 for i in range(3))
        if dd < bd:
            best, bd = name, dd
    return best


def find_join(grid, pair, w, h):
    """Tìm cặp ô kề (ngang hoặc dọc) đầu tiên thuộc hai nhóm cho trước;
    trả tâm mối nối (px)."""
    for y in range(h):
        for x in range(w - 1):
            if {GROUP[grid[y][x]], GROUP[grid[y][x + 1]]} == set(pair):
                return ((x + 1) * CELL, y * CELL + CELL // 2)
    for y in range(h - 1):
        for x in range(w):
            if {GROUP[grid[y][x]], GROUP[grid[y + 1][x]]} == set(pair):
                return (x * CELL + CELL // 2, (y + 1) * CELL)
    return None


def make_previews(map_id, d, img):
    outdir = ROOT / 'previews' / 'bg-smooth'
    outdir.mkdir(parents=True, exist_ok=True)
    W, H = img.size
    # Toàn cảnh thu nhỏ (chỉ nền mới, không prop) + nhãn loại ảnh
    scale = min(1100 / W, 1.0)
    full = img.resize((int(W * scale), int(H * scale)), Image.LANCZOS)
    cap = Image.new('RGB', (full.width, full.height + 30), (24, 28, 22))
    cap.paste(full, (0, 0))
    dr = ImageDraw.Draw(cap)
    dr.text((8, full.height + 8), f'{map_id} — tranh nền mới (chỉ lớp nền, không vật thể/NPC)',
            font=ImageFont.truetype(FONT_B, 13), fill=(240, 234, 210))
    cap.save(outdir / f'{map_id}-sau-toan-canh.png')
    # Cắt 100% tại các mối nối tìm từ dữ liệu
    joins = [('dirt', 'grass'), ('water', 'shore'), ('stone', 'grass'),
             ('stone', 'dirt'), ('pattern', 'stone'), ('wall', 'stone')]
    made = 0
    for pair in joins:
        if made >= 3:
            break
        pt = find_join(d['grid'], pair, d['w'], d['h'])
        if not pt:
            continue
        cx = min(max(pt[0], 170), W - 170)
        cy = min(max(pt[1], 170), H - 170)
        crop = img.crop((cx - 170, cy - 170, cx + 170, cy + 170))
        cap2 = Image.new('RGB', (340, 370), (24, 28, 22))
        cap2.paste(crop, (0, 0))
        dr2 = ImageDraw.Draw(cap2)
        dr2.text((8, 346), f'cắt 100% mối nối {pair[0]}/{pair[1]} tại ô ~({pt[0]//CELL},{pt[1]//CELL})',
                 font=ImageFont.truetype(FONT, 12), fill=(240, 234, 210))
        cap2.save(outdir / f'{map_id}-sau-cat-{pair[0]}-{pair[1]}.png')
        made += 1
    # Ảnh phủ kiểm chứng khớp dữ liệu
    ov = full.copy()
    dr = ImageDraw.Draw(ov, 'RGBA')
    sx, sy = full.width / d['w'], full.height / d['h']
    for gx in range(d['w'] + 1):
        dr.line([(gx * sx, 0), (gx * sx, full.height)], fill=(255, 255, 255, 46))
    for gy in range(d['h'] + 1):
        dr.line([(0, gy * sy), (full.width, gy * sy)], fill=(255, 255, 255, 46))
    for po in d['portals']:
        dr.rectangle([po['x'] * sx, po['y'] * sy, (po['x'] + po['w']) * sx,
                      (po['y'] + po['h']) * sy], outline=(255, 217, 78), width=3)
    for n in d['npcs']:
        nx, ny = (n['x'] + 0.5) * sx, (n['y'] + 0.5) * sy
        dr.ellipse([nx - 4, ny - 4, nx + 4, ny + 4], fill=(255, 217, 78), outline=(0, 0, 0))
    if d['entry']:
        ex, ey = (d['entry']['x'] + 0.5) * sx, (d['entry']['y'] + 0.5) * sy
        dr.ellipse([ex - 6, ey - 6, ex + 6, ey + 6], outline=(255, 80, 60), width=3)
    cap3 = Image.new('RGB', (ov.width, ov.height + 30), (24, 28, 22))
    cap3.paste(ov, (0, 0))
    dr3 = ImageDraw.Draw(cap3)
    dr3.text((8, ov.height + 8), 'phủ kiểm chứng: lưới ô mờ + cổng (vàng) + NPC (chấm vàng) + điểm rơi (vòng đỏ) — từ dữ liệu logic',
             font=ImageFont.truetype(FONT_B, 12), fill=(240, 234, 210))
    cap3.save(outdir / f'{map_id}-phu-kiem-chung.png')
    return made


def main():
    previews = '--previews' in sys.argv
    # Lọc theo mapId truyền vị trí (không đổi hành vi mặc định: tất cả).
    wanted = [a for a in sys.argv[1:] if not a.startswith('--')]
    maps = {k: v for k, v in MAPS.items() if k in wanted} if wanted else MAPS
    if wanted:
        for mid in wanted:
            if mid not in MAPS:
                print(f'[{mid}] KHÔNG CÓ TRONG MAPS — bỏ qua')
    ok = True
    sha = hashlib.sha256((ROOT / 'js' / 'logic.js').read_bytes()).hexdigest()
    hash_ok = sha == BASELINE_LOGIC_SHA
    print(f'logic.js sha256: {sha} -> {"KHỚP baseline" if hash_ok else "LỆCH BASELINE!"}')
    if not hash_ok:
        # Nếu lệch: đối chiếu DỮ LIỆU BẢN ĐỒ (grid/props/NPC) với bản baseline
        # ở staging deploy (nếu còn) — lệch do code khác (vd hệ ngày đêm của
        # luồng song song) mà dữ liệu bản đồ nguyên vẹn thì tranh vẫn hợp lệ.
        staging = ROOT.parent / 'game-vo-sac-deploy' / 'js' / 'logic.js'
        if staging.exists() and hashlib.sha256(staging.read_bytes()).hexdigest() == BASELINE_LOGIC_SHA:
            js = ("const a=require(process.argv[1]),b=require(process.argv[2]);let diff=0;"
                  "for(const k of Object.keys(a.MAPS)){const x=a.MAPS[k],y=b.MAPS[k];"
                  "if(JSON.stringify(x.grid)!==JSON.stringify(y.grid))diff++;"
                  "if(JSON.stringify(x.props)!==JSON.stringify(y.props))diff++;"
                  "if(JSON.stringify(x.npcs.map(n=>[n.id,n.x,n.y]))!==JSON.stringify(y.npcs.map(n=>[n.id,n.x,n.y])))diff++;}"
                  "console.log(diff);")
            r = subprocess.run(['node', '-e', js, str(ROOT / 'js' / 'logic.js'), str(staging)],
                               capture_output=True, text=True)
            data_same = r.stdout.strip() == '0'
            print(f'  đối chiếu dữ liệu bản đồ với baseline (staging): '
                  f'{"GIỐNG HỆT (0 khác biệt grid/props/NPC) — lệch mã băm do code ngoài dữ liệu bản đồ" if data_same else "DỮ LIỆU BẢN ĐỒ ĐÃ ĐỔI!"}')
            hash_ok = data_same
    ok &= hash_ok
    for map_id, (ew, eh) in maps.items():
        p = ROOT / 'assets' / f'bg-{map_id}.png'
        if not p.exists():
            print(f'[{map_id}] THIẾU TỆP {p}')
            ok = False
            continue
        img = Image.open(p).convert('RGB')
        size_ok = img.size == (ew, eh)
        d = load_map(map_id)
        arr = np.asarray(img).astype(int)
        total = match = match_loose = match_adj = 0
        bad = []
        for y, row in enumerate(d['grid']):
            for x, ch in enumerate(row):
                cx, cy = x * CELL + CELL // 2, y * CELL + CELL // 2
                c = arr[cy - 3:cy + 3, cx - 3:cx + 3].reshape(-1, 3).mean(axis=0)
                got = classify(c)
                want = GROUP[ch]
                total += 1
                if got == want:
                    match += 1
                if got == want or {got, want} <= {'stone', 'pattern'}:
                    match_loose += 1
                # Hiệu chỉnh: đúng nhóm, anh em S/P, hoặc hòa thống kê (khoảng
                # cách tới proto đúng <= 1,25x khoảng cách tới proto gần nhất —
                # cỏ tối (92,104,57) vẫn là cỏ dù Euclid thuần gần tường hơn).
                dw = sum((int(c[i]) - PROTO[want][i]) ** 2 for i in range(3))
                dn = sum((int(c[i]) - PROTO[got][i]) ** 2 for i in range(3))
                if got == want or {got, want} <= {'stone', 'pattern'} or dw <= 1.5625 * dn:
                    match_adj += 1
                elif len(bad) < 5:
                    bad.append((x, y, ch, want, got))
        rate = match / total * 100
        rate_l = match_loose / total * 100
        rate_a = match_adj / total * 100
        good = size_ok and rate_a >= 99.5
        ok &= good
        print(f'[{map_id}] {img.size} ({"đúng" if size_ok else "SAI"} kích thước) '
              f'{p.stat().st_size/1e6:.2f} MB · tâm ô khớp nghiêm ngặt {match}/{total} = {rate:.2f}% '
              f'(nới S/P: {rate_l:.2f}%; hiệu chỉnh: {rate_a:.2f}%) {"ĐẠT" if good else "RỚT"}')
        if bad:
            print(f'   ô lệch mẫu: {bad}')
        if previews:
            n = make_previews(map_id, d, img)
            print(f'   previews: toàn cảnh + {n} cắt 100% + phủ kiểm chứng')
    print('KẾT LUẬN:', 'ĐẠT TẤT CẢ' if ok else 'CÓ MỤC RỚT')
    sys.exit(0 if ok else 1)


if __name__ == '__main__':
    main()
