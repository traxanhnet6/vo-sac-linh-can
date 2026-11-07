# BÁO CÁO ĐỢT "THÊM BÃI QUÁI DÃ NGOẠI" — cây game-vo-sac-monsterfields

Lệnh của Bui 19:56 ngày 2026-11-06: *"Thêm các bãi quái để tăng tu vi đạo hạnh"*.
Đợt do điều phối viên Muse Game Studio thực hiện, **KHÔNG tự gộp/deploy** — chờ parent gộp (§99 là số tạm, parent đổi khi gộp).

## 1. Thay đổi duy nhất trong mã sản xuất

`js/logic.js`: thêm **13 mục vào `HUNT_LAIRS`** (tổng 35 → **48**), kèm khối chú thích trích lệnh của Bui ở đầu đoạn (logic.js ~5907). Không sửa tệp sản xuất nào khác:

- `js/game.js` md5 `8df8214b623553b638226cc0729fdc52` — bằng cây chính, không đổi.
- `js/story.js` md5 `0b299821c6022421bfed0377c0a2d791` — không đổi, không thêm thoại, không phát sinh lồng tiếng.
- `index.html` md5 `4ab33b4a0c571c9c0d79e2b2f374c594` — không đổi.
- `test-smoke.js`: chỉ thêm khối §99 mới (12780–13060), không sửa khẳng định cũ nào.
- `tools/render-monster-fields-capture.js`: script bằng chứng mới của đợt (không thuộc mã game).

Không mở rộng `HUNT_ZONES` và không thêm vùng con: cả 13 ô neo đều nằm sẵn trong một vùng săn đã đăng ký của đúng bản đồ (khóa bằng kiểm §99a: bản sao `zoneAtTile` tại neo phải trả đúng `zoneId` của ổ).

## 2. Luật đặt bãi (áp cho cả 13 ổ, khóa bằng kiểm §99)

1. **Chỉ loài đã có** trong `MONSTER_DEFS` và có hình thật (sheet trực tiếp hoặc bí danh họ trong game.js: `huyen_bang_lang → gia_dinh:băng_lang`, `thach_tuong_co → gia_dinh:tran_son_quan`). Không loài mới, không hình mới, không sửa `MONSTER_DEFS`.
2. **Không loài người**: `song_tac` và `linh_dao_dat` bị cấm khỏi ổ quái (§99b khóa). Chú thích trong logic.js giải thích: chúng vào thế giới qua trận lặp tại điểm tương tác ở làn game.js, không sinh qua ổ.
3. **Chỉ quái thường / tinh anh** — loài có nhãn boss trong `BOSS_LABELS99` bị cấm làm ổ (§99b).
4. **Dải sức khóa theo bản đồ** (§99b, bảng CAPS99): trần hp/atk của loài ổ trên bản đồ phải nằm trong dải của các ổ vô điều kiện sẵn có trên chính bản đồ đó + tiền lệ phiếu treo thưởng của bản đồ. Số cụ thể ở mục 4.
5. **Vị trí**: ô neo đi được, flood-fill tới được từ mọi điểm vào của bản đồ, có ít nhất 14 ô di chuyển bị giới hạn trong vùng của ổ; khoảng cách Chebyshev: **≥3** tới NPC / cổng / điểm hạ cánh / điểm tài nguyên / ổ boss; **≥7** tới ổ quái khác; **≥5** tới mọi dấu chân vật thể tương tác (kiểm phụ `def99props` — bổ sung sau lần rà soát của chính đợt, xem mục 6).
6. **Mật độ**: mỗi ổ đúng 1 quái (máy game sinh 1 quái cho mỗi mục `HUNT_LAIRS` trong `spawnMonstersForMap`) — tổng quái đồng thời mỗi bản đồ tăng đúng bằng số ổ mới của bản đồ đó (tối đa +2), không nhồi.

## 3. Bảng phủ TRƯỚC / SAU (ổ vô điều kiện theo bản đồ dã ngoại)

| Bản đồ | Trước | Sau | Ghi chú |
|---|---|---|---|
| duong_mon (Đường Mòn) | 3 | **5** | +2 ổ mới (mục 5). Ngoài ra có 3 ổ khóa theo nhiệm vụ (q10/q14/q14) không đổi. |
| thanh_van_tong (Sau Núi tông môn) | 3 | **4** | +1. |
| hb_valley (Thung Lũng Hồi Phong) | 4 | **6** | +2. |
| thap_van_dai_son (vành Luyện Khí) | 2 | **3** | +1. |
| tvds_truc_co (vành Trúc Cơ) | 3 | **4** | +1. |
| tvds_kim_dan (vành Kim Đan) | 4 | **5** | +1. |
| tvds_nguyen_anh (vành Nguyên Anh, gồm vùng tây + Vân An) | 4 | **6** | +2. Vùng `zone_tvds_van_an` trước **0 ổ** → nay 1. |
| tvds_hoa_than (vành Hóa Thần) | 3 | **4** | +1. |
| song_bac_thuong (Thượng Nguồn Sông Bạc) | 3 | **5** | +2. Vùng `zone_song_bac_vung` và `zone_song_bac_thung` trước **0 ổ thường** → mỗi vùng nay 1. Ngoài ra 2 ổ khóa nhiệm vụ (q26/q27) không đổi. |
| **Tổng ổ vô điều kiện trên bản đồ dã ngoại** | **29** | **42** | Tổng `HUNT_LAIRS` 35 → 48 (còn 6 ổ khóa nhiệm vụ/bí cảnh không đổi). |

Sau đợt, **mọi bản đồ dã ngoại đều có ít nhất 3 ổ vô điều kiện** (§99e khóa), không còn vùng săn dã ngoại nào đã đăng ký mà trống ổ thường. Mỗi dải cảnh giới (Luyện Khí / Trúc Cơ / Kim Đan / Nguyên Anh / Hóa Thần) đều có bãi ở nhiều bản đồ khác nhau.

## 4. Bảng dải sức khóa (CAPS99 trong kiểm §99b)

| Bản đồ | Trần hp | Trần atk | Cơ sở dải |
|---|---|---|---|
| duong_mon | 300 | 15 | Ổ sẵn có: lang_dau_dan 300/11 là trần; phiếu săn Đường Mòn cũng dùng dải này. |
| thanh_van_tong | 300 | 15 | Ổ sẵn có tối đa 260/15 (son_lang). |
| hb_valley | 300 | 15 | Ổ sẵn có tối đa 260/15; oán binh 160/14 nằm trong dải. |
| thap_van_dai_son (LK) | 300 | 15 | Ổ sẵn có 160/14 – 260/12. |
| tvds_truc_co | 300 | 15 | Ổ sẵn có tối đa 260/15. |
| tvds_kim_dan | 1500 | 22 | Ổ sẵn có 720/20 – 1450/22 (huyen_bang_lang). |
| tvds_nguyen_anh | 2050 | 33 | Ổ sẵn có tới 2000/33 (thach_tuong_co). |
| tvds_hoa_than | 2350 | 37 | Ổ sẵn có tới 2300/37 (kim_dieu). |
| song_bac_thuong | 1750 | 23 | Ổ sẵn có giang_thu 650/18, hồn nước 1700/23. |

Luật Không Tường giữ nguyên: loài của ổ mới không mạnh hơn loài mạnh nhất người chơi đã phải đánh được khi bản đồ đó mở.

## 5. Danh sách 13 ổ mới

| # | Bản đồ / vùng | Loài (tên hiển thị) | Neo | hp/atk | Ghi chú địa hình |
|---|---|---|---|---|---|
| 1 | duong_mon / zone_duong_mon_rung | thiet_giap_tru (Thiết Giáp Trư) | 12,55 | 260/12 | Bãi cỏ tây nam — trước đây phía tây nam không có bãi nào. |
| 2 | duong_mon / zone_duong_mon_rung | lang_dau_dan (Lang Đầu Đàn) | 30,44 | 300/11 | Trảng giữa; loài đầu đàn lần đầu có ổ riêng. |
| 3 | thanh_van_tong / zone_tong_sau_nui | doc_vu_xa (Độc Vũ Xà) | 102,24 | 90/9 | Loài thứ tư của bãi sau núi; **đã dời 3 lần** — xem mục 6. |
| 4 | hb_valley / zone_hb_rung | oan_binh (Oán Binh) | 16,42 | 160/14 | Bãi cỏ nam ven sông. |
| 5 | hb_valley / zone_hb_bac | lang_dau_dan | 50,8 | 300/11 | Cao nguyên bắc — vùng bắc trước chỉ có 1 ổ. |
| 6 | thap_van_dai_son / zone_tvds_luyenkhi | lang_dau_dan | 70,12 | 300/11 | Trảng đông vành Luyện Khí. |
| 7 | tvds_truc_co / zone_tvds_trucco | oan_binh | 88,15 | 160/14 | Ổ oán binh thứ hai ở phía đông vành Trúc Cơ. |
| 8 | tvds_kim_dan / zone_tvds_kimdan | tan_hon_kiem_y_sau (Tàn Hồn Kiếm Ý) | 88,21 | 880/21 | Bãi nam đông vành Kim Đan. |
| 9 | tvds_nguyen_anh / zone_tvds_nguyenanh_tay | huyen_bang_lang (Huyền Băng Lang) | 8,17 | 1450/22 | Sườn tây — trước chỉ 1 ổ. |
| 10 | tvds_nguyen_anh / zone_tvds_van_an | thach_tuong_co (Thạch Tượng Cổ) | 97,14 | 2000/33 | Bồn Vân An — vùng đã đăng ký từ đợt bản đồ nhưng chưa từng có ổ. |
| 11 | tvds_hoa_than / zone_tvds_hoathan | kim_dieu (Kim Điêu) | 20,8 | 2300/37 | Cao nguyên phía tây vành Hóa Thần — trước chỉ 1 ổ. |
| 12 | song_bac_thuong / zone_song_bac_vung | giang_thu (Giang Thú) | 80,67 | 650/18 | Bãi bồi bờ nam vũng sâu — vùng vũng trước chỉ có boss chu kỳ. |
| 13 | song_bac_thuong / zone_song_bac_thung | hon_nuoc (Hồn Nước) | 79,14 | 1700/23 | Thung thượng nguồn — vùng thung trước không có ổ nào. |

**Treo thưởng**: `HUNT_TEMPLATES` không đổi một chữ. Hai ổ mới tình cờ nằm trong vùng của phiếu cũ (oan_binh ở zone_hb_rung và lang_dau_dan ở zone_hb_bac đều là vùng/loài của phiếu Hồi Phong sẵn có) — hệ quả tự nhiên: phiếu cũ nay dễ gặp quái hơn, số lượng yêu cầu của phiếu không đổi. Các ổ còn lại chỉ phục vụ săn tự do.

## 6. Lần rà soát của chính đợt: ổ rắn sau núi dời 3 lần

Điểm đặt đầu tiên cho rắn độc vũ sau núi là (104,19) — chỉ cách dấu chân vật thể vườn dược (104,17) **2 ô**. Cụm tương tác chương 8 (linh chi 100,14 / vườn dược 104,17 / hai cổng bí cảnh ở hàng 16) theo thiết kế gốc là vùng trống quái: một con rắn đi lang thang ở đó có thể lao vào người chơi giữa lúc hái Linh Chi / hái Thanh Tâm Thảo cho công thức Trúc Cơ Đan. Danh sách nguy hiểm ban đầu của §99 chưa gồm vật thể tương tác nhiệm vụ — đó là điểm mù của chính đợt. Đã sửa bằng hai việc:

- Bổ sung vào §99c khóa **≥5 ô tới mọi dấu chân vật thể tương tác** (hàm `def99props`), áp cho cả 13 ổ.
- Dời ổ: (90,28) bị §99a bắt vì nằm trong hõm vách không tới được bằng flood-fill; (117,5) bị §99a bắt vì chỉ có 11 ô đi lại quanh neo (dưới ngưỡng 14). Điểm chốt **(102,24)**: 291 ô đi lại trong vùng, cách vật thể tương tác gần nhất 7 ô, cách ổ Phong Ưng 10 ô, cách nút tài nguyên Linh Chi 6 ô.

## 7. Chứng minh kinh tế không đổi (luật cứng của lệnh)

- Không một con số kinh tế nào thay đổi: `MONSTER_DEFS`, tỉ lệ rơi, tỉ lệ tinh anh/boss chu kỳ, điều kiện mở bản đồ, `HUNT_TEMPLATES` — tất cả giữ nguyên (chỉ thêm mục vào `HUNT_LAIRS`).
- Mọi tu vi săn được đều chảy qua **cùng một đường duy nhất**: hạ quái ở máy game gọi `normalKillDrops` → `L.grantReward(state, 'profile:kill:normal' | 'profile:kill:elite')` (game.js ~14191) với hồ sơ tu vi **2% trần tầng cho quái thường, 5% cho tinh anh** (logic.js ~4815), và `grantReward` ghi vào **hồ trần mềm ngày dùng chung** `grind.pools` (logic.js ~4871–4932). Thêm ổ chỉ thêm *chỗ* dòng chảy đó xuất phát; hồ trần mềm giới hạn tổng tu vi săn mỗi ngày như cũ — **tổng kiếm được mỗi ngày không tăng**.
- Kiểm §99d khẳng định đường đi ở hai tầng: tầng logic (grantReward với hồ sơ kill cộng đúng 2%/5% và ghi vào `pools.tuvi`) và tầng máy game thật (boot harness trên song_bac_thuong: cả hai ổ mới đều sinh quái, đi tới giao chiến hồn nước, hạ nó, `session.tuvi > 0` và hồ đã lưu `pools.tuvi > 0`).

## 8. Kết quả cổng (đọc từ log trong `~/workspace/.verify-logs/monsterfields/`)

| Cổng | Kết quả | Log |
|---|---|---|
| §99 độc lập (khối mới, chạy trích xuất) | **PASS 194/194, EXIT=0** | `sec99.log` |
| Lồng tiếng (test-voice) | **PASS 9281/9281** — bằng nền cây chính | `voice.log` |
| Nhạc (test-music) | **PASS 482/482** — bằng nền | `music.log` |
| Nền bản đồ (verify-bgs) | **ĐẠT — "KẾT LUẬN: ĐẠT TẤT CẢ"**; 24/25 tệp nền có bản đồ trong MAPS đều ĐẠT (tệp `bg-bc_kiemtrung_sau.png` không có bản đồ tương ứng nên công cụ bỏ qua — giống hệt cây chính, đợt này không sinh lại nền nào) | `bgs.log` |
| Smoke toàn phần | **CHƯA HOÀN TẤT — khai rõ ở mục 9** | `smoke.log` (lượt 1, dở dang) |
| Ảnh bằng chứng cỡ cảnh thật | **RENDER_OK, EXIT=0** — 3 cảnh × 2 khung | `capture.log` + `previews/monster-fields/` |

## 9. KHAI ĐIỂM YẾU — smoke toàn phần chưa xong, cần parent chạy lại trên máy yên

Đây là cổng duy nhất chưa khép:

- **Lượt 1** chạy trên cây đợt bị **SIGTERM sau ~67 phút** (4.035.689 ms) trong lúc máy ảo đang chạy đồng thời 6–11 suite của các đợt khác (bountyguide, tierfix, flystreak, charlines, tribfx và cả lượt gộp ngự kiếm trên cây chính) — máy 4 nhân bão hòa liên tục, không có cửa sổ yên nào trong suốt thời gian đợt chạy.
- Log dở dang của lượt 1 (`smoke.log`, dừng ở đầu §29) chứa **13 FAIL, tất cả trong §26-continuous** (lượt chơi lưu v1 → q8_done), **dồn từ một gốc**: bước "đã hái đủ Thanh Tâm Thảo ×3 cho công thức (got undefined, want 3)" → nhiệm vụ kẹt ở `q8_chuan_bi` → các khẳng định Trúc Cơ Đan / độ kiếp / cảnh giới phía sau đổ theo dây chuyền. Mọi bước trước đó (kể cả hái Linh Chi) đều qua trong phần log đã kịp ghi.
- **Chưa phân định được** FAIL này là họ tải (harness bơm khung hình lệch đồng hồ treo tường khi CPU bị đói — họ lỗi đã biết của các đợt khác) hay lỗi thật. Hai lần thử trích xuất §26 chạy riêng đều cho kết quả giả do trạng thái tổng hợp (kiểm may vá "got q2_len_duong, want q7_nhap_tong"; thiền định "walk=stuck") — không dùng để kết luận được, đã bỏ hướng này.
- Một yếu tố đợt này đã tự loại: vị trí rắn sau núi ban đầu (104,19) nằm sát cụm vườn dược chương 8 có thể quấy đúng bước hái thảo — đã dời về (102,24) và khóa bằng kiểm ≥5 ô (mục 6). Nhưng log lượt 1 là từ **trước** lần dời cuối cùng hay sau thì không còn truy được chắc chắn, nên không thể dùng nó để tuyên bố §26 đã sạch.
- **Việc cần parent làm trước khi gộp**: chạy lại smoke toàn phần trên cây đợt (hoặc trên cây gộp) khi máy yên, một suite một lúc, và xem §26 là mục theo dõi chính. §99 độc lập trên trạng thái mã cuối cùng đã xanh 194/194; voice/music/nền đều bằng nền cây chính.

## 10. Bằng chứng hình ảnh (cỡ cảnh thật 800×500, máy game thật)

Thư mục `previews/monster-fields/` — mỗi cảnh 2 khung cách nhau ~3 giây game để thấy quái đi lại:

1. `song-bac-thung-hon-nuoc-a/b.png` — Hồn Nước ở ổ mới (79,14) vùng thung thượng nguồn sông Bạc: khung b cho thấy Hồn Nước (tên + thanh máu hiện trên đầu) đứng ngay cạnh nhân vật trong thung, sau khi đã giao chiến ở kiểm §99d.
2. `hb-oan-binh-a/b.png` — Oán Binh ở ổ mới (16,42) bãi cỏ nam Hồi Phong: hình vong hồn xám bạc hiện rõ trên bờ sông nam, nhân vật ở bờ đối diện.
3. `tvds-van-an-thach-tuong-co-a/b.png` — Thạch Tượng Cổ ở ổ mới (97,14) bồn Vân An: tượng đá canh cổng đá hiện rõ phía trên nhân vật, biển tên vùng "Thung Lũng Vân An: Trận Sơn Thạch Tượng canh giữ Huyền Băng Linh Chi" ở góc trái.

Log `capture.log` còn liệt kê quái sống theo từng cảnh: cả ba ổ mới đều có mặt trong danh sách quái sống của bản đồ tương ứng.

## 11. Điểm yếu còn lại (khai thẳng)

- **Smoke toàn phần chưa xanh trên cây đợt** — mục 9. Đây là điều kiện parent phải khép trước khi gộp.
- **Loài dùng lại ở nhiều bản đồ** (hệ quả của luật cấm loài mới): lang_dau_dan xuất hiện ở 3 ổ mới (duong_mon, hb_valley, vành Luyện Khí TVĐS); oán binh ở 2 ổ mới (hb_valley, vành Trúc Cơ). Đều là loài hợp dải của từng bản đồ, nhưng người chơi đi nhiều bản đồ sẽ gặp lại cùng loài.
- **Địa hình còn gượng nhẹ**: ổ hồn nước (79,14) nằm trong khu dân cư thung thượng (gần nhà kho và NPC Trưởng Đoàn Tị Nạn trong khung hình) — ô neo hợp lệ, đi được, đúng khoảng cách khóa, nhưng cảm giác "bãi quái dã ngoại" yếu hơn các ổ khác; nếu Bui chê thì dời ra bãi cỏ phía tây thung. Ổ thạch tượng cổ Vân An đứng gần cổng đá và tượng canh sẵn có — hợp bối cảnh (tượng canh) nhưng mật độ hình tượng đá ở một khung hình hơi dày.
- Mỗi ổ chỉ sinh 1 quái như mọi ổ sẵn có: bãi mới tăng *độ phủ địa lý*, không tăng mật độ quái tại một điểm — đúng khuôn hệ hiện hành và trần hiệu năng.

## 12. Trạng thái bàn giao

- Cây đợt: `~/workspace/game-vo-sac-monsterfields/` — md5 cuối: logic.js `265f023a4d4d7138df0a825716037d7f`, test-smoke.js `3a63ce522dc411221765c866dcdd4418`, game.js / story.js / index.html giữ nguyên như cây chính (ghi ở `~/workspace/.verify-logs/monsterfields/tree-final.md5`).
- **Không gộp, không deploy, không đụng cây chính.**

---

## Phụ lục gộp vào cây chính (2026-11-07, điều phối viên gộp)

- Khối tạm §99 trên cây đợt -> khối chính thức **§93** trên cây chính
  (sau §92 ngự kiếm; định danh/nhãn 99 -> 93, `pointerId: 99` của cú
  chạm mô phỏng giữ nguyên kèm ghi chú tại khối).
- `js/logic.js` gộp bằng chèn điểm tại cuối mảng `HUNT_LAIRS`: chỉ
  lấy đúng khối chú thích + 13 ổ của đợt; 5 hunk còn lại trong diff
  hai cây đều thuộc đợt ngự kiếm mà cây chính đã có (FLY_LOW_TYPES,
  cờ indoor thap_noi, trường fly* trong flags/normalizeSave, xuất
  khẩu isFlyable) — KHÔNG mang ngược. logic.js sau gộp md5
  `99d9e49a44d30e0bafd711c3eed3d94d`.
- `tools/verify-bgs.py`: ghim lại baseline kèm khai báo (đối chiếu
  cấu trúc độc lập: 26 bản đồ + mọi bảng dữ kiện giống hệt tiền gộp,
  HUNT_LAIRS là cấu trúc duy nhất đổi 35 -> 48).
- Cổng trên cây chính (log `~/workspace/.verify-logs/monsterfields-merge/`):
  §93 độc lập 194/194; giọng 9406/9406; nhạc 482/482;
  verify-bgs ĐẠT TẤT CẢ 26 bản đồ, băm KHỚP baseline;
  smoke toàn phần **PASS 14118/14118, 0 FAIL** (nền ngự kiếm 13918
  + 194 §93 + 6 khẳng định vòng kiểm đếm dữ kiện sinh thêm từ 13 ổ —
  §93e tự tăng theo số bản đồ/vùng có ổ; chạy trong lúc máy còn hai
  lượt suite của đợt khác, §26 sạch tuyệt đối, không đỏ họ tải).
