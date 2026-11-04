/* Thoại và kịch bản sự kiện của game Vô Sắc Linh Căn.
   mode: 'say' lời nói miệng, 'write' chữ viết của Giang Phàm (cậu giao tiếp bằng bút
   như trong truyện), 'narrate' lời dẫn, 'choice' điểm lựa chọn.
   Thoại dân thôn là sáng tác theo không khí truyện, không trích nguyên văn truyện. */
(function (global) {
  'use strict';

  var IDLE_BEFORE = {
    u_nhan: [
      { who: 'npc', text: 'Phàm ca, hôm nay là ngày trắc linh. Dù kết quả thế nào, muội vẫn ở đây.' },
      { who: 'hero', mode: 'write', text: '(viết) Ta biết. Cảm ơn muội.' },
      { who: 'npc', text: 'Mười năm rồi, muội chưa từng thấy huynh thua ai ở chữ "nhẫn".' }
    ],
    di_ninh: [
      { who: 'npc', text: 'Hôm nay trắc linh xong, hôn ước kia cũng nên có một kết cục rõ ràng.' },
      { who: 'npc', text: 'Ta, Hứa Di Ninh, chỉ gả cho người xứng đáng. Ngươi tự hiểu lấy.' }
    ],
    luc_tranh: [
      { who: 'npc', text: 'Giang Phàm, lát nữa đừng để cấp độ của ta làm ngươi sợ quá mà ngất.' },
      { who: 'npc', text: 'Ăn nhờ ở đậu mười năm, cũng nên biết thân biết phận.' }
    ],
    anh_phung: [
      { who: 'npc', text: 'Câm thì cũng thôi đi, hôm nay mà trắc ra phế căn nữa, Hứa gia ta mất hết mặt mũi.' },
      { who: 'npc', text: 'U Nhàn, con còn bênh nó, ta từ con luôn đấy.' }
    ],
    chinh_ngon: [
      { who: 'npc', text: 'Phàm nhi, cha của con từng cứu mạng ta. Hứa gia này, con cứ coi như nhà mình.' },
      { who: 'npc', text: 'Linh căn là trời cho, phẩm hạnh mới là của mình. Đừng để tâm lời người ngoài.' }
    ],
    truong_lao: [
      { who: 'npc', text: 'Bia đá này khắc chín màu, tương ứng chín phẩm linh căn. Có căn hay không, đặt tay là rõ.' },
      { who: 'npc', text: 'Theo thứ tự danh sách. Đừng chen lấn.' }
    ],
    dan_a: [
      { who: 'npc', text: 'Nghe nói hôm nay thiếu gia họ Lục trắc linh, cả trấn tới xem.' },
      { who: 'npc', text: 'Còn cái cậu câm ở rể kia à? Ha, trắc cho vui thôi, phế vật vẫn hoàn phế vật.' }
    ],
    dan_b: [
      { who: 'npc', text: 'Cậu Giang câm mười tám năm rồi, tội nghiệp. Nhưng câm thì tu tiên kiểu gì?' },
      { who: 'npc', text: 'Người ta nói, không có linh căn thì cả đời làm phàm nhân thôi.' }
    ],
    dan_c: [
      { who: 'npc', text: 'Lão sống ở trấn này sáu mươi năm, chưa thấy bia đá này sáng tới cửu phẩm bao giờ.' },
      { who: 'npc', text: 'Hôm nay mà có cửu phẩm, trấn ta nở mày nở mặt với cả Cô Châu Thành.' }
    ],
    xa_phu: [
      { who: 'npc', text: 'Đường này lão chạy xe ba mươi năm. Sáng nay có vị công tử trẻ phi ngựa qua như ma đuổi — nghe nói là cửu phẩm gì đó của trấn các cậu.' },
      { who: 'npc', text: 'Qua cầu suối phía trước thì đường dễ đi. Đừng rẽ vào rừng sâu, dạo này có bóng người lạ lảng vảng.' }
    ]
  };

  var IDLE_AFTER = {
    u_nhan: [
      { who: 'npc', text: 'Phàm ca… vừa rồi, huynh NÓI. Muội nghe rõ ràng, cả trấn đều nghe rõ ràng!' },
      { who: 'npc', text: 'Đi đi, tới giếng đầu trấn thổ nạp như trưởng lão dặn. Muội canh ở đây, không ai dám nói gì nữa đâu.' },
      { who: 'npc', text: 'Chờ huynh thành tu sĩ rồi, muội sẽ nói với cả thiên hạ: người họ cười nhạo năm xưa, là người thế nào.' }
    ],
    di_ninh: [
      { who: 'npc', text: 'Ngươi… ngươi không câm? Mười tám năm qua, ngươi lừa tất cả mọi người?' },
      { who: 'npc', text: 'Đừng tưởng làm ra chút động tĩnh là ta thay đổi ý kiến. Hừ… nhưng mà, vừa rồi mặt đất thật sự đã rung.' }
    ],
    luc_tranh: [
      { who: 'npc', text: 'Trò… trò hề! Chắc chắn là yêu pháp! Ngươi lấy tư cách gì so với cửu phẩm linh căn của ta!' },
      { who: 'npc', text: 'Cứ đợi đấy, Giang Phàm. Vào Kiểm Trắc Tháp, thước pha lê sẽ vạch trần ngươi!' }
    ],
    anh_phung: [
      { who: 'npc', text: 'Ngươi… ngươi dám…! Chuyện hôn sự, ta, ta chưa nói là hủy hẳn…' },
      { who: 'npc', text: '(lẩm bẩm) Không câm, lại còn làm rung cả sân… rốt cuộc nó là thứ gì?' }
    ],
    chinh_ngon: [
      { who: 'npc', text: 'Tốt… tốt! Phàm nhi, cha con trên trời chắc cũng nghe thấy tiếng của con rồi.' },
      { who: 'npc', text: 'Đi tu luyện đi. Hứa gia từ nay, không ai được phép coi thường con nữa.' }
    ],
    truong_lao: [
      { who: 'npc', text: 'Lão phu trắc linh bốn mươi năm, chưa từng gặp chuyện này. Bia không hiện màu… mà một tiếng nói lại làm cả sân cùng rung theo — như đất trời tự cộng hưởng với nó.' },
      { who: 'npc', text: 'Cậu Giang, linh căn của cậu, e rằng không nằm trong chín màu của bia đá này. Hãy tới Kiểm Trắc Tháp, thước pha lê ở đó mới đo được tận cùng.' },
      { who: 'npc', text: 'Trước mắt, hãy tới giếng đầu trấn — nơi linh khí tụ — mà thổ nạp. Cậu đã mở miệng, kinh mạch cũng đã thông rồi.' }
    ],
    dan_a: [
      { who: 'npc', text: 'Vừa… vừa rồi là cậu ta nói à? Ta nghe mà ù cả tai, chân đứng không vững!' },
      { who: 'npc', text: 'Ta, ta lúc nãy có nói gì không phải, cậu Giang đừng để bụng…' }
    ],
    dan_b: [
      { who: 'npc', text: 'Trời ơi, đèn lồng nhà ta chao như sắp đổ. Một câu nói mà như sấm!' },
      { who: 'npc', text: 'Ai còn dám gọi cậu ấy là phế vật nữa? Ta thì không dám.' }
    ],
    dan_c: [
      { who: 'npc', text: 'Sáu mươi năm sống ở trấn này, lão chưa từng thấy chuyện lạ như hôm nay.' },
      { who: 'npc', text: 'Không màu… Biết đâu không màu, mới là màu của trời đất?' }
    ],
    xa_phu: [
      { who: 'npc', text: 'Cậu chính là cậu Giang nói một câu rung cả sân đấy à? Lão nghe kể mà nổi da gà. Đi thành thì cứ đường lớn mà đi, đừng ngại.' },
      { who: 'npc', text: 'Qua cầu suối phía trước thì đường dễ đi. Đừng rẽ vào rừng sâu, dạo này có bóng người lạ lảng vảng.' }
    ],
    chu_quan: [
      { who: 'npc', text: 'Khách điếm của lão từng tiếp cả tu sĩ về hưu. Cậu cần Linh Thạch thì cứ qua phụ việc — lão trả sòng phẳng, không nợ ai bao giờ.' },
      { who: 'npc', text: 'Đợt này khách tới kỳ kiểm trắc đông, việc lúc nào cũng có. Nhưng lão chỉ thuê người đáng tin thôi.' }
    ],
    duoc_su: [
      { who: 'npc', text: 'Hồi Khí Đan của hiệu ta luyện từ linh thảo sau núi, hồi phục tinh thần rất nhanh. Tu sĩ đi đường xa ai cũng mang theo vài viên.' },
      { who: 'npc', text: 'Đan dược không phải vạn năng, nhưng lúc cạn kiệt tinh thần mà có một viên, khác hẳn đấy.' }
    ],
    phap_khi_chu: [
      { who: 'npc', text: 'Tụ Bảo Các chỉ bán hai món, nhưng món nào cũng là hàng thật: Thanh Phong Kiếm trợ uy cho kiếm quyết, lại thêm kiếm ngân trợ hưởng cho đòn cộng hưởng, Tụ Linh Ngọc giúp thổ nạp nhanh hơn hẳn.' },
      { who: 'npc', text: 'Pháp khí tốt không rẻ. Nhưng tu sĩ khôn ngoan thà chậm một bước còn hơn cầm đồ dởm vào lúc sinh tử.' }
    ],
    tran_chinh_dao: [
      { who: 'npc', text: 'Thiên Cơ Các ghi lại mọi linh căn đáng chú ý của thiên hạ. Cửu phẩm ở một trấn nhỏ — chuyện như vậy, các này không thể không tới xem.' },
      { who: 'npc', text: 'Người trẻ, linh căn chỉ là điểm bắt đầu. Cách ngươi đi tiếp mới là thứ các này quan tâm.' }
    ],
    tran_tu_linh: [
      { who: 'npc', text: 'Ta là Trần Tư Linh. U Nhàn là bạn thân của ta — chuyện của Hứa gia, ta nghe nàng kể nhiều rồi.' },
      { who: 'npc', text: 'Cả thành này đồn về một vị Hồn Sư thần bí, ra tay cứu người rồi biến mất. Ta tìm vị ấy đã lâu mà chưa thấy bóng dáng.' }
    ],
    thap_chu: [
      { who: 'npc', text: 'Thước pha lê của tháp này chưa từng nói dối trong ba trăm năm. Nó đo được tận cùng của linh căn — kể cả thứ linh căn không nằm trong chín màu.' },
      { who: 'npc', text: 'Theo thứ tự danh sách. Kỳ kiểm trắc này đông khác thường, vì tin cửu phẩm đã lan khắp thành.' }
    ],
    thi_sinh_a: [
      { who: 'npc', text: 'Ta xếp hàng từ tờ mờ sáng. Nghe nói hôm nay có cửu phẩm của trấn dưới lên đo lại — cả sân đang chờ xem.' },
      { who: 'npc', text: 'Chỉ cần thước cho ta tam phẩm, đời ta đã đổi khác rồi.' }
    ],
    thi_sinh_b: [
      { who: 'npc', text: 'Lần trước ta đo được ngũ phẩm, nhà mừng ba ngày. Lần này hồi hộp hơn cả lần đầu.' },
      { who: 'npc', text: 'Cái cậu đứng trước kia… nghe nói ở trấn bị phán phế căn. Sao cậu ta cũng tới đây được nhỉ?' }
    ],
    cho_a: [
      { who: 'npc', text: 'Kỳ kiểm trắc nào chợ cũng đông gấp ba. Bán hết sạp này là ta đủ tiền cho con đi học chữ rồi.' },
      { who: 'npc', text: 'Nghe đâu hôm nay tháp có chuyện lớn. Dân buôn như ta chỉ mong thành thái bình để làm ăn.' }
    ],
    cho_b: [
      { who: 'npc', text: 'Vải nhà ta nhuộm bền màu nhất chợ này. Cô nương Trần gia còn đặt riêng hai tấm đấy.' },
      { who: 'npc', text: 'Cậu trai kia trông quen quen… hình như là người ở rể nhà họ Hứa dưới trấn?' }
    ],
    dan_thanh_a: [
      { who: 'npc', text: 'Sống ở Cô Châu Thành bốn mươi năm, ta chưa thấy kỳ kiểm trắc nào náo nhiệt thế này.' },
      { who: 'npc', text: 'Thành chủ Diệp Kế Phong là cường giả số một thành này. Công pháp cao nhất trong thành cũng chỉ tới Hoàng cấp trung đẳng thôi.' }
    ],
    dan_thanh_b: [
      { who: 'npc', text: 'Nghe nói cậu thiếu gia cửu phẩm ở trấn dưới đẹp trai lắm. Hôm nay mà gặp ở tháp thì may quá.' },
      { who: 'npc', text: 'Chợ đông thế này, cẩn thận túi tiền của cậu đấy.' }
    ],
    chu_kien_tham: [
      { who: 'npc', text: 'Năm mươi vạn lượng của Chu gia ta không mua nổi một cái gật đầu — chuyện này, ta ghi nhớ. Hứa U Nhàn, nàng sẽ phải hối hận.' },
      { who: 'npc', text: 'Một kẻ ở rể dám ra giá hơn ta một vạn lượng… Hắn lấy tiền ở đâu ra? Chuyện này không đơn giản.' }
    ],
    truong_lao_tong: [
      { who: 'npc', text: 'Hồ sơ của ngươi ghi hai chữ "vô linh căn". Ba mươi năm coi tháp, ta chưa từng thấy thước pha lê nào leo khỏi vạch cửu phẩm — trừ một lần.' },
      { who: 'npc', text: 'Ừm. Cứ làm việc của ngươi cho tốt. Núi này nhìn người lâu hơn người nhìn núi.' }
    ],
    lieu_khuynh_tien: [
      { who: 'npc', text: 'Kiếm của ngươi có sát khí rất lạ — không phải sát khí của người từng giết người, mà của người từng đứng trước cái chết nhiều lần.' },
      { who: 'npc', text: 'Đạo của Thanh Vân Tông không nằm ở miệng. Có những thứ, chỉ cần kiếm hiểu là đủ.' }
    ],
    hoa_huong_than: [
      { who: 'npc', text: 'Ngươi là người mới mà trưởng lão dặn ta để mắt tới? Yên tâm, ở đây ai cũng bắt đầu từ việc nhỏ nhất.' },
      { who: 'npc', text: 'Kiếm quyết của ngươi… thôi, khi nào lên Thăng Long Đài rồi hãy nói.' }
    ],
    tap_dich_truong: [
      { who: 'npc', text: 'Việc tạp dịch không thiếu, chỉ thiếu người chịu khó. Gỗ, nước, dược thảo — việc nào xong cũng có công điểm ghi vào sổ.' },
      { who: 'npc', text: 'Đừng coi thường việc nhỏ. Nền móng của tu hành cũng từ những việc nhỏ mà ra.' }
    ],
    de_tu_a: [
      { who: 'npc', text: 'Nghe nói kỳ này tháp kiểm trắc có người làm thước pha lê leo khỏi vạch cửu phẩm. Thật hay đùa vậy?' },
      { who: 'npc', text: 'Ta luyện kiếm ba năm mới đứng vững một chiêu. Đừng cười — ở tông môn này, chậm mà chắc mới đi xa.' }
    ],
    de_tu_b: [
      { who: 'npc', text: 'Khu tạp dịch ở phía đông nam, qua quảng trường là tới. Người mới nào cũng phải qua đó một thời gian.' },
      { who: 'npc', text: 'Chị Khuynh Tiên mà đã để mắt tới ai thì người đó không tầm thường đâu.' }
    ]
  };

  /* Kịch bản trắc linh căn (chạy khi tương tác bia đá lần đầu). */
  var SCENE_TEST = [
    { who: 'narrate', text: 'Sân nhà họ Hứa, ngày trắc linh căn. Dân cả trấn vây quanh bia đá khắc chín màu.' },
    { who: 'truong_lao', text: 'Lục Tranh, lên trước. Đặt tay lên bia.', spot: 'luc_tranh', spotAt: { x: 29, y: 18 } },
    { who: 'narrate', text: 'Lục Tranh đặt tay lên bia. Bia đá bừng sáng — một màu, hai màu… rồi chín màu cùng rực lên như cầu vồng úp xuống sân.', spot: 'luc_tranh' },
    { who: 'truong_lao', text: 'Lục Tranh — cửu… CỬU PHẨM LINH CĂN! Trấn ta trăm năm chưa từng có!', spot: 'luc_tranh', result: { name: 'Lục Tranh', grade: 'Cửu phẩm linh căn', tone: 'gold' } },
    { who: 'luc_tranh', text: 'Ha ha! Thấy chưa, Giang Phàm? Đây mới là chân long. Còn ngươi, lát nữa đừng khóc.', spot: 'luc_tranh' },
    { who: 'dan_a', text: 'Cửu phẩm! Lục công tử là chân long chuyển thế rồi!' },
    { who: 'anh_phung', text: 'Tốt, tốt lắm! U Nhàn, thấy chưa? Đó mới là người xứng với nhà họ Hứa.' },
    { who: 'truong_lao', text: 'Tiếp theo — Giang Phàm. Đặt tay lên bia.', spot: 'hero' },
    { who: 'narrate', text: 'Ngươi đặt tay lên mặt đá lạnh. Một hơi thở. Hai hơi thở. Mười hơi thở… Bia đá tối om. Không một tia sáng. Không một màu nào đáp lại.', spot: 'hero' },
    { who: 'truong_lao', text: 'Giang Phàm — không màu… không hệ nào đáp lại… Vô Sắc — PHẾ CĂN. Cả đời này, không tu tiên được.', spot: 'hero', result: { name: 'Giang Phàm', grade: 'Vô sắc — Phế căn', tone: 'dim' } },
    { who: 'dan_b', text: 'Quả nhiên! Câm đã đành, lại còn phế căn. Đúng là phế vật trọn gói.' },
    { who: 'dan_a', text: 'Ở rể mười năm ăn cơm Hứa gia, trắc ra cái kết cục này, ha ha!' },
    { who: 'di_ninh', text: 'Thấy rồi chứ? Đây là lý do ta thà chết cũng không gả cho ngươi.' },
    { who: 'luc_tranh', text: 'Phế vật, lui xuống đi. Đừng làm bẩn bia đá của trấn.' },
    { who: 'u_nhan', text: 'ĐỦ RỒI! Câm không phải tội! Không có linh căn cũng không phải tội! Các người dựa vào đâu mà chà đạp huynh ấy mười năm nay?!' },
    { who: 'anh_phung', text: 'U Nhàn, im ngay! Hôn sự này, Hứa gia ta không gả nữa! Một tên câm phế căn, đừng hòng bước qua cửa nhà ta!' },
    { who: 'narrate', text: 'Mười tám năm. Mười tám năm ngươi chưa từng cất tiếng. Trong ngực, có thứ gì đó tích lũy mười tám năm đang sôi lên — chỉ chờ một lời.' },
    {
      // commitTest: tới dòng này là phần ĐO đã khép (cả hai kết quả đã
      // công bố) — engine ghi cờ tested + tiến nhiệm vụ ngay khi dòng
      // lựa chọn HIỆN, vì lựa chọn thuộc nhịp nhiệm vụ kế tiếp (q_voice)
      // và nhánh được chọn sẽ thay hàng đợi thoại bằng cảnh riêng. Thoát
      // TRƯỚC dòng này (giữa phần đo) thì cảnh chưa tính là xong.
      who: 'choice', text: 'Ngươi sẽ…', commitTest: true,
      options: [
        { label: 'Viết chữ đáp lại (tiếp tục im lặng)', action: 'write' },
        { label: '[Mở miệng] "…Đủ rồi."', action: 'voice' }
      ]
    }
  ];

  var SCENE_WRITE_BRANCH = [
    { who: 'hero', mode: 'write', text: '(viết, giơ lên cho cả sân thấy) "Phế hay không, chưa tới lượt các người phán."' },
    { who: 'luc_tranh', text: 'Hừ, chữ viết thì ai mà chẳng viết được. Câm vẫn hoàn câm.' },
    { who: 'narrate', text: 'Đám đông tản đi, tiếng cười nhạo vẫn còn sau lưng. Nhưng trong ngực ngươi, mười tám năm im lặng vẫn đang sôi — và ngươi biết, nó sẽ không sôi mãi được. Khi sẵn sàng, hãy quay lại bia đá và cất tiếng.' }
  ];

  var SCENE_VOICE = [
    { who: 'hero', mode: 'say', text: '…Đủ rồi.' },
    { who: 'narrate', text: 'Hai chữ. Chỉ hai chữ. Mặt đất dưới chân cả sân RUNG LÊN. Sóng âm lan ra từng vòng, đèn lồng chao đảo, chén trà trên bàn nảy khỏi mặt bàn, đàn chim trên mái nhà tung cánh bay tán loạn.' },
    { who: 'dan_a', text: 'Đất… đất rung! Là cậu ta nói?! Một câu nói mà như sấm nổ giữa sân!' },
    { who: 'dan_b', text: 'Tai ta ù hết rồi! Cậu ta… cậu ta không câm?!' },
    { who: 'luc_tranh', text: 'Không… không thể nào! Yêu pháp! Chắc chắn là yêu pháp!' },
    { who: 'di_ninh', text: 'Ngươi… mười tám năm… ngươi lừa tất cả chúng ta?!' },
    { who: 'anh_phung', text: 'Ngươi… ngươi dám…! Hôn sự… chuyện hôn sự, để, để bàn lại…' },
    { who: 'u_nhan', text: 'Phàm ca! Huynh nói được! Muội biết mà… muội biết huynh không phải phế vật!' },
    { who: 'truong_lao', text: 'Lão phu trắc linh bốn mươi năm… Bia đá không đo được cậu, vì linh căn của cậu KHÔNG NẰM TRONG CHÍN MÀU. Một tiếng nói mà làm đất, đèn lồng và bia đá cùng rung lên — phát và hưởng trùng nhau trong một khoảnh khắc: đây là điềm của linh căn ngoài cửu phẩm!' },
    { who: 'narrate', text: 'Mười tám năm im lặng đã mở khóa. Từ nay: thổ nạp tu luyện được mở, và Vạn Âm Cộng Hưởng đã thức tỉnh — tai ngươi nghe được âm gốc của vạn vật, gõ sóng không cần cất lời. Nhưng nhớ lấy: càng lắng nghe lâu, Tĩnh Âm càng trong, đòn cộng hưởng càng nặng.' }
  ];

  var SCENE_VOICE_RETRY = [
    { who: 'narrate', text: 'Ngươi đứng trước bia đá. Trong ngực, mười tám năm im lặng đang sôi lên tới đỉnh.' },
    {
      who: 'choice', text: 'Ngươi sẽ…',
      options: [
        { label: 'Viết chữ đáp lại (tiếp tục im lặng)', action: 'write' },
        { label: '[Mở miệng] "…Đủ rồi."', action: 'voice' }
      ]
    }
  ];

  var SCENE_BREAKTHROUGH = [
    { who: 'narrate', text: 'Tu vi tràn đầy. Linh khí từ bốn phương hội về, kinh mạch mười tám năm bế tắc lần lượt thông suốt.' },
    { who: 'hero', mode: 'say', text: 'Luyện Khí… tầng một.' },
    { who: 'narrate', text: 'Đột phá thành công! Ngươi chính thức bước lên con đường tu tiên — và Vạn Âm Cộng Hưởng "Chấn Âm" cùng chiêu "Phá Âm" đã sẵn sàng. Hãy phá cọc gỗ luyện công ở phía nam sân để thử đòn cộng hưởng của mình.' }
  ];

  var SCENE_DUMMY_DONE = [
    { who: 'narrate', text: 'Cọc gỗ nứt toác rồi đổ sụp. Cả sân im phăng phắc — lần này, không ai cười.' },
    { who: 'u_nhan', text: 'Phàm ca, huynh làm được rồi! Từ phế căn bị cả trấn cười… tới tu sĩ Luyện Khí, chỉ trong một ngày!' },
    { who: 'truong_lao', text: 'Chặng tiếp theo là Kiểm Trắc Tháp ở Cô Châu Thành — thước pha lê chín màu ở đó sẽ cho cậu biết linh căn của mình thật sự ở đâu.' }
  ];

  /* ---------- Chương 2: lên đường tới Cô Châu Thành ---------- */
  var SCENE_DEPART = [
    { who: 'narrate', text: 'Cổng nam Hứa Gia Trấn mở ra con đường đất xuyên rừng. Ngươi bước ra khỏi trấn lần đầu tiên trong đời — một mình.' },
    { who: 'u_nhan', text: 'Phàm ca! Đợi muội! …Huynh đi đường cẩn thận. Tới Cô Châu Thành, việc đầu tiên là vào Kiểm Trắc Tháp, đừng nghe ai dụ dỗ dọc đường.' },
    { who: 'narrate', text: 'Nàng dúi vào tay ngươi một gói nhỏ bọc vải, rồi quay đi thật nhanh. Trong gói là hai mươi viên Linh Thạch — phần lộ phí nàng dành dụm gửi theo.' }
  ];

  var SCENE_TRACK = [
    { who: 'narrate', text: 'Trạm nghỉ giữa đường. Bên vệ đường có một mảnh vải rách mắc trên cành khô, loang vết sẫm đã khô — và dấu chân ngựa còn mới hằn trên đất mềm.' },
    { who: 'narrate', text: 'Vết cắt trên vải rất ngọt, là kiếm khí. Người đi trước là Lục Tranh — hắn đi rất vội, như sợ có kẻ đuổi kịp và đoạt mất cơ duyên cửu phẩm.' }
  ];

  /* Chỉ mở cho người chơi đi nhánh [Viết chữ] ở chương 1 (nhiệm vụ ẩn q_an_dau). */
  var SCENE_TRACK_HIDDEN = [
    { who: 'narrate', text: 'Dưới tảng đá cạnh trạm, có người giấu một mảnh lụa. Trên lụa là chữ viết tay run rẩy: "Tần Trường Sinh từng hứa, cửu phẩm sẽ thuộc về Lục gia — đổi lại, Lục gia phải giao ra một thứ."' },
    { who: 'narrate', text: '(Ngươi cất mảnh lụa vào ngực áo. Đây là chứng cứ — có ngày sẽ cần tới. Đã ghi: chứng cứ Tần Trường Sinh.)' }
  ];

  var SCENE_AMBUSH = [
    { who: 'narrate', text: 'Rừng bỗng im bặt. Không tiếng chim. Sau thân cây lớn phía trước, một bóng người áo xám đứng bất động — mặt che kín, tay đặt hờ lên chuôi kiếm. Hắn không giống cướp đường thường.' },
    { who: 'narrate', text: 'Hắn nhìn ngươi rất lâu, như đang cân nhắc một cái tên trong danh sách. Rồi hắn khẽ nghiêng đầu — dấu hiệu của kẻ đang chờ lệnh từ xa.' },
    {
      who: 'choice', text: 'Ngươi sẽ…',
      options: [
        { label: 'Lặng lẽ lùi vào bóng cây, tránh đối đầu', action: 'ambush_silent' },
        { label: '[Phát hưởng] "Chấn Âm" — dằn mặt kẻ theo dõi', action: 'ambush_chan' }
      ]
    }
  ];

  var SCENE_AMBUSH_SILENT = [
    { who: 'narrate', text: 'Ngươi nín thở, lùi từng bước vào bóng râm. Mười tám năm im lặng dạy ngươi cách biến mất giỏi hơn bất kỳ ai. Bóng áo xám chờ một lúc, rồi tan vào rừng như chưa từng xuất hiện.' },
    { who: 'narrate', text: '(Ngươi nhớ kỹ dấu hiệu trên tay áo hắn: một vệt đỏ thẫm như máu khô. Huyết Bạc Cung — cái tên trưởng lão từng nhắc trong lời đồn.)' }
  ];

  var SCENE_AMBUSH_CHAN = [
    { who: 'narrate', text: 'Một đòn Chấn Âm nổ ra giữa rừng — sóng ngược pha dập thẳng vào kẻ theo dõi. Lá khô tung lên, chim bay tán loạn. Bóng áo xám loạng choạng lùi ba bước, ôm tai, rồi quay đầu bỏ chạy vào sâu trong rừng.' },
    { who: 'narrate', text: '(Đòn cộng hưởng của ngươi đã có nhân chứng không mong muốn. Từ giờ, có kẻ biết kẻ "phế căn" kia để lại được thứ dư âm ấy. Đã ghi vào Sổ Dư Âm.)' }
  ];

  var SCENE_GATE = [
    { who: 'narrate', text: 'Cuối đường, tường thành Cô Châu Thành hiện ra — cao gấp ba tường trấn, cổng thành khắc ba chữ lớn, người ra vào như nước chảy. So với nơi này, Hứa Gia Trấn chỉ là một thôn nhỏ.' },
    { who: 'narrate', text: 'Ngươi đứng ở quảng trường cổng thành, ngẩng nhìn. Kỳ kiểm trắc ở Kiểm Trắc Tháp sắp mở. Giang Phàm — kẻ bị phán phế căn — sắp bước vào nơi thước pha lê không nói dối.' }
  ];

  /* ---------- Chương 3: Kiểm Trắc Tháp ---------- */
  var SCENE_QUEUE = [
    { who: 'narrate', text: 'Khuôn viên Kiểm Trắc Tháp. Hàng người chờ kiểm trắc dài tới tận cổng — cả thành đổ về đây vì tin cửu phẩm linh căn ở Hứa Gia Trấn đã lan khắp nơi.' },
    { who: 'thi_sinh_a', text: 'Kia kìa, cửu phẩm tới rồi! Người đứng đầu hàng kia chính là Lục Tranh của Hứa Gia Trấn đấy!' },
    { who: 'luc_tranh', text: 'Hừ. Thước ở trấn là đồ quê mùa, đo sai là chuyện thường. Hôm nay thước pha lê của tháp sẽ cho cả thành thấy cửu phẩm thật sự là thế nào.' },
    { who: 'luc_tranh', text: 'Còn ngươi — Giang Phàm. Phế căn mà cũng dám mò tới đây? Đứng cho xa, đừng làm bẩn hàng của ta.' },
    { who: 'thap_chu', text: 'Im lặng! Kỳ kiểm trắc bắt đầu. Theo thứ tự danh sách: Lục Tranh vào sảnh trước, Giang Phàm theo sau. Những người còn lại chờ ở sân, không được chen lấn.' },
    { who: 'narrate', text: 'Lục Tranh hất cằm bước vào sảnh tháp. Tới lượt ngươi — cánh cửa sảnh đang mở, và thước pha lê lớn ở trong đó đã chờ ngươi ba lần trong đời. Ba lần trước, nó phán ngươi vô linh căn.' }
  ];

  var SCENE_MEASURE = [
    { who: 'narrate', text: 'Sảnh tháp lặng như tờ. Lục Tranh đặt tay lên thước pha lê. Gợn sáng leo nhanh: một phẩm, ba phẩm, ngũ phẩm… rồi bùng lên ở vạch cao nhất của chín màu.', spot: 'luc_tranh', spotAt: { x: 20, y: 7 } },
    { who: 'thap_chu', text: 'Cửu phẩm! Thước pha lê xác nhận — Lục Tranh, cửu phẩm linh căn, không sai một ly!', spot: 'luc_tranh', result: { name: 'Lục Tranh', grade: 'Cửu phẩm linh căn', tone: 'gold' } },
    { who: 'luc_tranh', text: 'Ha ha ha! Thấy chưa, cả thành thấy chưa! Cửu phẩm là cửu phẩm, ở đâu cũng là cửu phẩm! Giang Phàm, giờ tới lượt ngươi — để thước cho thiên hạ thấy phế căn thật sự trông thế nào!', spot: 'luc_tranh' },
    { who: 'narrate', text: 'Ngươi bước tới, đặt tay lên mặt pha lê lạnh. Một gợn sáng mảnh nhú lên từ đáy thước — đỏ… cam… vàng… Nó không dừng. Xanh lá — tứ phẩm. Nó vẫn leo. Xanh lam — lục phẩm, ngang Hứa Di Ninh. Tím — thất phẩm. Đen — bát phẩm…', spot: 'hero' },
    { who: 'thi_sinh_b', text: 'Nó… nó qua bát phẩm rồi! Trời ơi, nó vẫn đang leo!', spot: 'hero' },
    { who: 'narrate', text: 'Gợn sáng chạm vạch cửu phẩm — rồi VƯỢT QUA. Cả cây thước pha lê rung lên, phát ra tiếng ngân như chuông cổ. Ánh sáng trong suốt tràn khỏi đỉnh thước, soi khắp sảnh như nước — không màu nào, mà chứa tất cả các màu.', spot: 'hero' },
    { who: 'thap_chu', text: 'Vô… VÔ CỰC LINH CĂN! Chỉ có trong truyền thuyết! Mạnh hơn cửu phẩm mười lần, trăm lần! Lão phu chủ trì tháp bốn mươi năm — hôm nay mới được thấy tận mắt!', spot: 'hero', result: { name: 'Giang Phàm', grade: 'Vô Cực Linh Căn', tone: 'gold' } },
    { who: 'luc_tranh', text: 'Không… không thể nào! Thước hỏng rồi! Chắc chắn thước hỏng rồi! Hắn là phế căn, cả trấn đều biết hắn là phế căn!' },
    { who: 'thap_chu', text: 'Thước pha lê của tháp này ba trăm năm chưa từng nói dối. Cậu Lục, lời của cậu đang xúc phạm tháp — và xúc phạm cả thành này. Còn cậu Giang — bia đá ở trấn không đo được cậu, vì linh căn của cậu KHÔNG NẰM TRONG CHÍN MÀU. Từ hôm nay, hồ sơ của Cô Châu Thành ghi: Giang Phàm — Vô Cực Linh Căn.' },
    { who: 'narrate', text: 'Tin vượt cửu phẩm sẽ lan khỏi thành trước khi trời tối. Còn Lục Tranh — kẻ vừa đạt đỉnh danh vọng của đời mình — đang nhìn ngươi bằng ánh mắt của một kẻ vừa mất tất cả. (Tu vi chấn động thông suốt kinh mạch: tu vi đã đầy.)' }
  ];

  /* Chỉ chạy nếu người chơi tới tháp mà chưa từng cất tiếng (nhánh ép mở
     miệng muộn — docs/part2-design.md mục 5). */
  var SCENE_TOWER_FORCED = [
    { who: 'narrate', text: 'Trong sảnh tháp, Lục Tranh vừa đo xong cửu phẩm. Hắn quay lại, nhìn ngươi cười khẩy trước mặt chủ trì và cả hàng thí sinh.' },
    { who: 'luc_tranh', text: 'Còn thằng câm phế căn này nữa. Chủ trì, loại này để hắn đặt tay lên thước là phí một kỳ kiểm trắc. Đuổi hắn ra cho đỡ chật sảnh.' },
    { who: 'narrate', text: 'Mười tám năm im lặng. Rồi thêm những ngày đường tới tháp. Tất cả dồn nén trong ngực ngươi đã vượt qua giới hạn từ lâu — và nơi này, trước cây thước cao nhất của thiên hạ, là nơi nó chọn để vỡ ra.' },
    { who: 'hero', mode: 'say', text: '…Đủ rồi.' },
    { who: 'narrate', text: 'Hai chữ vang khắp sảnh tháp. Thước pha lê rung bần bật chưa cần ai chạm vào, đèn đồng trên tường chao đảo, cả hàng người ngoài sân đồng loạt im bặt. Chủ trì tháp nhìn ngươi như nhìn một hiện tượng ngoài mọi sách vở của tháp.' },
    { who: 'thap_chu', text: 'Tiếng nói… chấn động cả thước pha lê. Cậu trai, cậu không phải người câm. Và lão phu dám chắc — cậu cũng không phải phế căn. Đặt tay lên thước đi. Ngay bây giờ.' }
  ];

  var SCENE_MANUALS = [
    { who: 'thap_chu', text: 'Theo lệ ba trăm năm của tháp: người có linh căn vượt ngoài chín phẩm sẽ được cây thước ban thưởng công pháp. Cậu Giang, hãy nhận lấy.' },
    { who: 'narrate', text: 'Từ thân thước pha lê, hai luồng sáng tách ra, hóa thành hai quyển sách cổ rơi vào tay ngươi: "Thanh Phong Chân Kinh" — tâm pháp Hoàng cấp cao cấp; và "Thất Tinh Kiếm Quyết" — kiếm quyết Hoàng cấp cao cấp.' },
    { who: 'thap_chu', text: 'Linh căn của cậu trong suốt — không thuộc hệ nào, nên học được MỌI hệ. Tâm pháp này giúp cậu thổ nạp nhanh hơn; kiếm quyết này cho cậu một đường sức mạnh không phụ thuộc vào cách nghe của cậu. Nhớ lấy: người có hai đường đi, đừng bao giờ để lộ cả hai cùng lúc.' },
    { who: 'narrate', text: 'Đã mở khóa: Thanh Phong Chân Kinh (thổ nạp nhanh hơn) và Thất Tinh Kiếm Quyết (nút "Kiếm quyết", phím 3 — đòn kiếm không tốn Tĩnh Âm). Lĩnh hội công pháp khiến tu vi dâng đầy — hãy đột phá khi sẵn sàng.' },
    { who: 'thap_chu', text: 'Còn một vật nữa, theo lệ dành cho người có linh căn ngoài chín phẩm: Túi Trữ Vật của tháp. Từ nay đan dược, pháp khí và nguyên liệu ngươi kiếm được đều cất vào đây. Người ngoài chín phẩm — phải có chỗ đứng riêng, và một cái túi riêng.' },
    { who: 'narrate', text: 'Đã mở khóa Túi Trữ Vật (nút "Túi" ở hàng nút phía trên, hoặc phím I). Hai quyển công pháp được ghi vào ngăn riêng của người tu hành — không chiếm chỗ trong túi.' },
    { who: 'thap_chu', text: 'Đi đi. Nhưng cẩn thận: tin hôm nay lan ra, sẽ có những thế lực lớn tìm tới nhà cậu — không phải ai tới cũng mang ý tốt.' }
  ];

  var SCENE_INN = [
    { who: 'chu_quan', text: 'Cậu Giang phải không? Khách điếm đang thiếu người phụ dọn kho và bưng bê cho khách kiểm trắc. Làm một ca, lão trả mười lăm viên Linh Thạch, tiền trao tay ngay.' },
    {
      who: 'choice', text: 'Ngươi sẽ…',
      options: [
        { label: 'Làm một ca phụ việc (nhận 15 Linh Thạch)', action: 'inn_work' },
        { label: 'Để khi khác', action: 'inn_leave' }
      ]
    }
  ];

  var SCENE_PHARMACY = [
    { who: 'duoc_su', text: 'Chào cậu. Hồi Khí Đan của hiệu ta — mười hai viên Linh Thạch một viên, uống vào hồi ngay hai mươi lăm điểm Tĩnh Âm. Cậu đang có bao nhiêu đan, dùng thử là biết. Hiệu ta còn có Hộ Thể Đan — hai mươi lăm Linh Thạch một viên, tu sĩ sắp độ kiếp hay mua lắm: nuốt vào giữa kiếp, một đạo lôi đánh xuống nhẹ đi sáu phần.' },
    {
      who: 'choice', text: 'Hiệu thuốc Hồi Xuân',
      options: [
        { label: 'Mua một viên Hồi Khí Đan — 12 Linh Thạch', action: 'buy_dan' },
        { label: 'Dùng một viên Hồi Khí Đan (hồi 25 Tĩnh Âm)', action: 'use_dan' },
        { label: 'Mua một viên Hộ Thể Đan — 25 Linh Thạch', action: 'buy_ho_the_dan' },
        { label: 'Rời hiệu thuốc', action: 'shop_leave' }
      ]
    }
  ];

  var SCENE_FASHOP = [
    { who: 'phap_khi_chu', text: 'Mời cậu xem. Thanh Phong Kiếm — một trăm năm mươi Linh Thạch: trợ thêm uy lực cho cả kiếm quyết lẫn Vạn Âm Cộng Hưởng — kiếm ngân trợ hưởng. Tụ Linh Ngọc — hai trăm sáu mươi Linh Thạch: đeo vào, thổ nạp nhanh hơn hẳn. Hàng thật, không mặc cả.' },
    {
      who: 'choice', text: 'Tụ Bảo Pháp Khí Các',
      options: [
        { label: 'Mua Thanh Phong Kiếm — 150 Linh Thạch', action: 'buy_kiem' },
        { label: 'Mua Tụ Linh Ngọc — 260 Linh Thạch', action: 'buy_ngoc' },
        { label: 'Rời các', action: 'shop_leave' }
      ]
    }
  ];

  /* ---------- Chương 4: Thiên Cơ Các tới nhà ----------
     Lời vu cáo "ăn cắp tài nguyên tu luyện của Hứa gia" là tình tiết
     [ĐỀ XUẤT] trong phác thảo đã duyệt; câu nhìn nhận cuối chương của Trần
     Chính Đạo là [GAME SÁNG TÁC]. */
  var SCENE_THIENCO = [
    { who: 'narrate', text: 'Sân phủ Hứa gia trong thành. Một cỗ xe không bảng hiệu vừa dừng trước cổng — người bước xuống mặc áo của Thiên Cơ Các, tổ chức ghi chép mọi chuyện tu tiên trong thiên hạ.' },
    { who: 'tran_chinh_dao', text: 'Trần Chính Đạo, Thiên Cơ Các. Các này tới Cô Châu Thành vì một kỳ kiểm trắc có tới hai chuyện lạ: một cửu phẩm… và một linh căn vượt ngoài chín phẩm.' },
    { who: 'tran_chinh_dao', text: 'Cậu Lục Tranh, cửu phẩm của cậu đã được ghi vào sổ của các. Còn cậu Giang Phàm — linh căn trong suốt, thước pha lê cũng không xếp nổi phẩm. Các này muốn tận mắt xem người thanh niên ấy.' },
    { who: 'chinh_ngon', text: 'Trần sứ giả quá khen. Giang Phàm là người ở rể của Hứa gia ta — nhà ta… cũng không ngờ nó có ngày này.' },
    { who: 'luc_tranh', text: 'Sứ giả đường xa mệt mỏi, chi bằng vào trong uống chén trà. Chuyện của kẻ ở rể… e rằng không đơn giản như sứ giả tưởng đâu.' },
    { who: 'narrate', text: 'Lục Tranh cười rất tươi. Nhưng ngươi nhận ra nụ cười ấy — giống hệt nụ cười của hắn ở sân tháp, ngay trước khi thước pha lê vượt qua cửu phẩm.' }
  ];

  var SCENE_ACCUSE = [
    { who: 'luc_tranh', text: 'Giang Phàm. Trước mặt sứ giả Thiên Cơ Các, ta hỏi ngươi một câu: ba tháng qua, linh thảo và đan dược trong kho Hứa gia vơi đi một rương — ngươi có biết vì sao không?' },
    { who: 'hero', mode: 'write', text: '(Ngươi viết: "Ta chưa từng vào kho Hứa gia.")' },
    { who: 'luc_tranh', text: 'Chưa từng vào? Ha! Một kẻ "vô linh căn" mười tám năm, đùng một cái thổ nạp được, đột phá được, còn đo vượt cả cửu phẩm. Không có tài nguyên chống lưng, phế vật thành thiên tài từ bao giờ?' },
    { who: 'anh_phung', text: 'Đúng đấy! Nhà này nuôi nó ăn ở mười tám năm, nó không những không biết ơn, còn ăn cắp đồ trong nhà để tu luyện. Loại vong ân bội nghĩa!' },
    { who: 'u_nhan', text: 'Mẹ. Con không đồng ý. Giang Phàm có vào kho hay không, phải có bằng chứng. Vu khống người nhà trước mặt khách quý không phải phép tắc của Hứa gia.' },
    { who: 'di_ninh', text: 'Chị bênh nó quen rồi. Em chỉ hỏi một câu: nếu không ăn cắp, hắn lấy gì mà tu luyện nhanh thế?' },
    { who: 'chinh_ngon', text: 'Giang Phàm… chuyện này, ngươi phải cho nhà ta một lời giải thích.' },
    { who: 'tran_chinh_dao', text: 'Khoan. Thiên Cơ Các chỉ ghi chép, không phán thay. Cậu Giang — cậu định giải thích thế nào, tùy cậu. Nhưng nhớ: lời nói ra ở sân này, các này đều ghi lại.' },
    {
      who: 'choice', text: 'Trước lời vu cáo, ngươi sẽ…',
      options: [
        { label: 'Im lặng — tự đi tìm bằng chứng lật lại vụ việc', action: 'ch4_evidence' },
        { label: 'Dùng một đòn Chấn Âm dẹp tan màn vu cáo ngay tại chỗ', action: 'ch4_chan' }
      ]
    }
  ];

  var SCENE_KHO_CLUE = [
    { who: 'narrate', text: 'Kho Hứa gia. Ngươi lần theo sổ xuất nhập treo cạnh cửa: rương linh thảo "vơi đi" kia được xuất làm bốn đợt trong ba tháng — và cả bốn đợt đều có cùng một chữ ký nhận hàng nguệch ngoạc mà quen thuộc: tay chân thân tín của Lục Tranh, nhận theo lệnh miệng của chính Lục Tranh.' },
    { who: 'narrate', text: 'Kho không mất trộm. Người ký nhận vẫn còn nguyên trong sổ. (Đã có manh mối: sổ kho Hứa gia.)' }
  ];

  var SCENE_CONFRONT = [
    { who: 'hero', mode: 'write', text: '(Ngươi đặt cuốn sổ kho lên bàn, mở đúng trang xuất hàng, rồi chỉ vào bốn chữ ký nhận.)' },
    { who: 'luc_tranh', text: 'Sổ… sổ kho thì nói lên cái gì? Ai biết có phải ngươi giả chữ ký không…' },
    { who: 'dan_thanh_a', text: 'Cho lão nói một câu. Ba tháng nay, cứ đêm khuya là lão thấy cậu Lục sai người khuân bao từ kho Hứa gia ra xe. Lão tưởng việc nhà nên không nói — giờ nghe vu cáo cậu Giang, lão không nhịn được nữa.' },
    { who: 'luc_tranh', text: 'Ta… ta lấy tài nguyên của nhà để tu luyện thì có gì sai! Ta là cửu phẩm! Còn hắn — hắn chỉ là thằng ở rể ăn bám, dựa vào đâu mà vượt qua ta?!' },
    { who: 'narrate', text: 'Câu nói vừa thốt ra, cả sân im phăng phắc. Kẻ "ăn cắp tài nguyên" đã tự nhận trước mặt sứ giả Thiên Cơ Các — vì ghen tị, hắn dựng chuyện để hủy danh dự của ngươi.' },
    { who: 'chinh_ngon', text: 'Lục Tranh! Ngươi… Hứa gia ta không dạy ra loại người như ngươi! Giang Phàm — chuyện này, nhà ta nợ ngươi một lời xin lỗi.' },
    { who: 'u_nhan', text: 'Em đã nói rồi: phải có bằng chứng. May mà cậu không nóng giận — nóng giận thì dù có lý cũng thành vô lý.' },
    { who: 'tran_chinh_dao', text: 'Vụ việc đã rõ, Thiên Cơ Các ghi vào sổ: lời vu cáo xuất phát từ tư tâm, không thành. Cậu Giang — các này thuê người điều tra vụ này mà chưa kịp, cậu đã tự làm xong. Bốn mươi viên Linh Thạch tiền công, các này trả thay Hứa gia.' }
  ];

  var SCENE_CONFRONT_STRONG = [
    { who: 'hero', mode: 'write', text: '(Ngươi không nói một lời. Ngươi đặt lên bàn cuốn sổ kho — cùng một phong thư cũ ngươi vẫn giữ từ dạo ở trấn: bằng chứng về những chuyến hàng đêm của Lục Tranh, khớp từng ngày với sổ xuất kho.)' },
    { who: 'luc_tranh', text: 'Ngươi… ngươi điều tra ta từ bao giờ? Từ ở trấn ngươi đã…' },
    { who: 'dan_thanh_a', text: 'Khớp hết! Ngày giờ trong thư khớp từng chuyến xe lão thấy ban đêm. Cậu Giang này, lặng im mà làm việc thấu đáo thật.' },
    { who: 'luc_tranh', text: 'Được… ta nhận. Là ta ghen. Cửu phẩm cả đời của ta bị một thằng ở rể "phế căn" đè lên đầu — ta chịu không nổi!' },
    { who: 'chinh_ngon', text: 'Hứa gia ta không dạy ra loại người như ngươi, Lục Tranh. Giang Phàm — nhà ta nợ ngươi một lời xin lỗi.' },
    { who: 'tran_chinh_dao', text: 'Bằng chứng khép kín như thế này, Thiên Cơ Các không còn gì để ghi thêm ngoài kết luận: vu cáo vì tư tâm, không thành. Bốn mươi viên Linh Thạch tiền điều tra, các này trả cho cậu Giang.' }
  ];

  var SCENE_CHAN_QUELL = [
    { who: 'hero', mode: 'say', text: 'CHẤN!' },
    { who: 'narrate', text: 'Một tiếng nổ tung giữa sân phủ. Chén trà trên bàn vỡ tung, mái ngói rung lên rào rào, cả nhà họ Hứa chết lặng. Lục Tranh lùi ba bước, mặt cắt không còn giọt máu — lời vu cáo của hắn tan theo tiếng chấn ấy, không ai còn dám nhắc lại.' },
    { who: 'u_nhan', text: 'Giang Phàm… cậu lại ra đòn ấy rồi. Vì chuyện này mà phải dùng tới nó, có đáng không…' },
    { who: 'tran_chinh_dao', text: '(khẽ, chỉ đủ mình nghe) Dư âm ấy… không thuộc về ai trong sân, cũng không phải công pháp nào ta biết. Thiên hạ này, chưa từng có ghi chép nào về thứ sức mạnh như vậy.' },
    { who: 'narrate', text: 'Vụ việc khép lại trong im lặng. Nhưng ánh mắt Trần Chính Đạo nhìn theo ngươi đã khác — Thiên Cơ Các vừa ghi thêm một dòng về ngươi, ở một cuốn sổ khác: dòng về thứ dư âm lạ không thuộc về ai trong sân ấy.' }
  ];

  var SCENE_FAREWELL4 = [
    { who: 'tran_chinh_dao', text: 'Vụ vu cáo đã vào sổ của các: Lục Tranh ghen tị dựng chuyện, Hứa gia đã nhận lỗi. Từ nay ai nhắc lại chuyện này là chống lại ghi chép của Thiên Cơ Các.' },
    { who: 'tran_chinh_dao', text: 'Cậu Giang, ta nói riêng một câu — câu này là ý của cá nhân ta, không phải của các: linh căn là thứ trời cho, nhưng cách cậu xử sự hôm nay mới là thứ khiến người ta phải nhìn lại. Thiên Cơ Các ghi tên cậu vào sổ quan sát. Không phải sổ tội — là sổ của những người sẽ đi rất xa.' },
    { who: 'tran_chinh_dao', text: 'À, trước khi đi, ta để lại một tin: Trần gia ở đông bắc thành đang gặp chuyện lạ về thần hồn, tìm khắp nơi một vị Hồn Sư thần bí mà không thấy. Nếu cậu có nghe ngóng được gì… Trần gia sẽ biết ơn lắm.' }
  ];

  var SCENE_FAREWELL4_CHAN = [
    { who: 'tran_chinh_dao', text: 'Vụ vu cáo đã khép lại — theo cách ồn ào nhất có thể. Sổ của các ghi: không thành, và sẽ không ai dám dựng lại.' },
    { who: 'tran_chinh_dao', text: 'Cậu Giang, ta phải hỏi thẳng: dư âm trong sân hôm ấy là của thứ công pháp gì? Ta tra sổ ba mươi năm, không một dòng nào giống nó — một dư âm lạ, không thuộc về ai trong sân. …Không muốn nói cũng được. Thiên Cơ Các tôn trọng bí mật của người khác — nhưng các này sẽ ghi nhớ nó.' },
    { who: 'tran_chinh_dao', text: 'Một tin để lại: Trần gia ở đông bắc thành đang gặp chuyện lạ về thần hồn, tìm khắp nơi một vị Hồn Sư thần bí. Nếu cậu nghe ngóng được gì, Trần gia sẽ biết ơn lắm. Và biết đâu… chuyện ấy hợp với cậu hơn cậu tưởng.' }
  ];

  /* ---------- Chương 5: Trần gia và Hồn Sư thần bí ----------
     Thân phận Hồn Sư của Giang Phàm và dư nghiệt Huyết Bạc Cung là dữ kiện
     truyện; tình tiết chữa bệnh ở Trần gia là [GAME SÁNG TÁC]. */
  var SCENE_SOUL_INTRO = [
    { who: 'tran_tu_linh', text: 'Giang công tử? Sao công tử lại tới Trần gia… À, chắc công tử nghe chuyện rồi. Ông nội ta ba hôm trước tiếp một vị khách lạ mặt, sau đó thần hồn bất ổn, lúc mê lúc tỉnh, danh y trong thành đều lắc đầu.' },
    { who: 'tran_tu_linh', text: 'Người ta nói bệnh này chỉ Hồn Sư mới chữa được. Mấy năm trước ở Cô Châu Thành từng xuất hiện một vị Hồn Sư thần bí — ra tay cứu người trong đêm rồi biến mất, không ai thấy mặt. Nhà ta tìm vị ấy khắp nơi mà không có tin tức.' },
    { who: 'tran_tu_linh', text: 'Công tử là bạn của U Nhàn, ta không giấu: nếu công tử quen biết vị Hồn Sư ấy, xin nhắn giúp một câu — Trần gia trả bất cứ giá nào.' },
    { who: 'narrate', text: 'Nàng không biết vị Hồn Sư thần bí ấy đang đứng trước mặt mình. Bí mật này, ngươi đã giữ nhiều năm — giữ từ trước cả khi tới Hứa gia. Nhưng một người đang nằm mê man trong kia, và ngươi chữa được.' },
    {
      who: 'choice', text: 'Ngươi sẽ…',
      options: [
        { label: 'Đêm nay tới chữa cho lão gia — giấu mặt, không để ai biết', action: 'ch5_heal' },
        { label: 'Để ta suy nghĩ thêm', action: 'ch5_wait' }
      ]
    }
  ];

  var SCENE_SOUL_HEAL = [
    { who: 'narrate', text: 'Đêm đó. Ngươi vào Trần phủ bằng lối sau, áo choàng che kín mặt. Trong phòng bệnh, hồn lực của ngươi tỏa ra như một làn sương lạnh — lần đầu tiên sau nhiều năm, ngươi để nó hiện hình trọn vẹn.' },
    { who: 'narrate', text: 'Thần hồn của lão gia bị một sợi tơ đen quấn chặt — trong tai nghe bằng hồn của ngươi, hồn ông lệch nhịp như một bản nhạc sai dây. Thủ pháp này lạnh và quen: nó không thuộc về Cô Châu Thành. Ngươi gỡ từng sợi một, chậm rãi, chỉnh lại từng nhịp lệch, không để lại một dấu vết nào của người đã tới.' },
    { who: 'tran_tu_linh', text: '(từ ngoài cửa, khẽ) Có… có ai trong đó không? Ông nội? Ông nội tỉnh rồi sao?' },
    { who: 'narrate', text: 'Trước khi ngươi rời đi, lão gia hé mắt, môi mấp máy trong cơn mê tỉnh: "Huyết… Bạc… Cung…" — rồi chìm vào giấc ngủ yên. Cái tên ấy, ngươi nghe lần đầu. Nhưng sợi tơ đen kia thì không lạ: kẻ đã hại lão gia cũng là kẻ săn lùng tin tức về Hồn Sư.' },
    { who: 'narrate', text: 'Sáng hôm sau, cả thành xôn xao: vị Hồn Sư thần bí lại xuất hiện, chữa khỏi cho Trần lão gia trong một đêm, chỉ để lại một tờ giấy viết bốn chữ: "Đã ổn. Đừng tìm." Thân phận Hồn Sư nhị phẩm của ngươi — vẫn là bí mật của riêng ngươi. (Hồn lực thức tỉnh: Hồn Sư nhị phẩm.)' }
  ];

  var SCENE_SOUL_SERVICE = [
    { who: 'tran_tu_linh', text: 'Giang công tử, lại có việc này: một thương nhân quen của Trần gia bị chứng mất ngủ triền miên sau chuyến buôn xa — thầy thuốc nói là thần hồn bị chấn động nhẹ. Nhà ta đã nhắn cho vị Hồn Sư thần bí kia qua đường dây cũ; vị ấy bảo sẽ tới trong đêm, tiền công hai mươi lăm viên Linh Thạch sẽ chuyển qua Trần gia.' },
    { who: 'tran_tu_linh', text: 'Công tử quen rộng, nếu gặp vị ấy thì nhắn giúp ta một tiếng nhé. Lạ thật — mỗi lần có việc, ta đều có cảm giác vị ấy ở rất gần.' },
    {
      who: 'choice', text: 'Việc luyện hồn kín đáo này…',
      options: [
        { label: 'Đêm nay lặng lẽ làm việc đó (nhận 25 Linh Thạch qua Trần gia)', action: 'soul_work' },
        { label: 'Để khi khác', action: 'soul_leave' }
      ]
    }
  ];

  var SCENE_SUPPORT = [
    { who: 'u_nhan', text: 'Giang Phàm, cậu nghe rồi phải không? Sau vụ vu cáo, Lục Tranh đòi tỉ thí với em để "phân định lại thể diện". Hắn tưởng em sợ. Em không sợ — nhưng thú thật, đan dược và linh thạch của em sau mấy tháng giúp cậu đã mỏng lắm rồi.' },
    { who: 'u_nhan', text: 'Em không xin cậu đâu. Em chỉ nói để cậu biết: trận này em sẽ đánh bằng tất cả những gì em có.' },
    {
      who: 'choice', text: 'Trước trận tỉ thí của U Nhàn…',
      options: [
        { label: 'Chi 60 Linh Thạch tiếp sức cho U Nhàn (mua đan dược và linh tài cho nàng)', action: 'ch5_support' },
        { label: 'Không chi tiền — viết mấy dòng động viên nàng trước trận', action: 'ch5_nosupport' }
      ]
    }
  ];

  var SCENE_DUEL = [
    { who: 'narrate', text: 'Sân phủ Hứa. Cả nhà có mặt đông đủ — và cả Trần Chính Đạo được mời tới làm chứng, để sau trận này không còn lời ra tiếng vào.' },
    { who: 'luc_tranh', text: 'U Nhàn, ngươi bênh thằng ở rể đó mãi không chán à? Hôm nay ta cho cả nhà thấy: cửu phẩm vẫn là cửu phẩm!' },
    { who: 'u_nhan', text: 'Ít lời thôi. Ngươi thua ta không phải vì linh căn của ngươi kém — mà vì tâm của ngươi hỏng từ lâu rồi.' },
    { who: 'narrate', text: 'Trận đấu ngắn hơn mọi người tưởng. U Nhàn — Luyện Khí tầng năm, tài nguyên đầy đủ, tâm cảnh không vướng — ra đòn gọn và dứt khoát. Ba mươi chiêu, kiếm của Lục Tranh văng khỏi tay hắn, cắm xuống sân đá rung bần bật.' },
    { who: 'anh_phung', text: 'U Nhàn… con…' },
    { who: 'u_nhan', text: 'Mẹ, con thắng không phải để làm nhục ai. Con chỉ muốn nhà này nhớ một điều: từ nay, ai muốn động tới người của con, phải qua con trước.' },
    { who: 'chinh_ngon', text: 'Đủ rồi. Kết quả đã rõ. Từ nay chuyện tỉ thí, chuyện vu cáo, khép lại hết ở sân này. U Nhàn — cha tự hào về con. Còn Giang Phàm… nhà này mang ơn cậu nhiều hơn ta từng nghĩ.' },
    { who: 'narrate', text: 'Lục Tranh đứng chết lặng giữa sân, nhìn thanh kiếm của mình. Cửu phẩm linh căn, danh vọng cả thành — và hai lần liên tiếp, hắn thua không phải vì linh căn.' }
  ];

  var SCENE_DUEL_HARD = [
    { who: 'narrate', text: 'Sân phủ Hứa. Cả nhà có mặt đông đủ — và cả Trần Chính Đạo được mời tới làm chứng, để sau trận này không còn lời ra tiếng vào.' },
    { who: 'luc_tranh', text: 'U Nhàn, ngươi bênh thằng ở rể đó mãi không chán à? Hôm nay ta cho cả nhà thấy: cửu phẩm vẫn là cửu phẩm!' },
    { who: 'u_nhan', text: 'Ít lời thôi. Ngươi thua ta không phải vì linh căn của ngươi kém — mà vì tâm của ngươi hỏng từ lâu rồi.' },
    { who: 'narrate', text: 'Trận đấu giằng co hơn mọi người tưởng: tài nguyên của U Nhàn đã mỏng, nàng phải đánh bằng kinh nghiệm và sự liều lĩnh. Bảy mươi chiêu — nàng trúng một đòn sượt vai, máu thấm áo — nhưng kiếm của nàng tới cổ họng Lục Tranh trước nửa nhịp.' },
    { who: 'u_nhan', text: 'Nhận thua đi. Đừng để ta phải làm thật trước mặt cha mẹ.' },
    { who: 'luc_tranh', text: 'Ta… ta nhận thua.' },
    { who: 'chinh_ngon', text: 'Khép lại hết. Từ nay chuyện tỉ thí, chuyện vu cáo, không ai nhắc lại nữa. U Nhàn — về xử lý vết thương ngay. Giang Phàm… cậu cũng thấy rồi đấy, con bé vì cậu mà đánh tới mức này.' },
    { who: 'narrate', text: 'Nàng thắng — nhưng cái giá là một vết thương đáng ra không cần có. Ngươi ghi nhớ điều đó.' }
  ];

  /* ---------- Chương 6: 51 vạn lượng và đêm tấn công ----------
     Mốc sính lễ 50 vạn / đáp 51 vạn lượng là dữ kiện truyện; hợp lý hoá
     nguồn tiền từ tuyến Hồn Sư và trận tấn công của Huyết Bạc Cung là
     [GAME SÁNG TÁC]. Số tiền phàm tục chỉ ở trong lời thoại, không qua ví. */
  var SCENE_DOWRY = [
    { who: 'narrate', text: 'Sân phủ Hứa hôm nay chật kín người: Chu Kiến Thâm — công tử Chu gia giàu nhất Cô Châu Thành — dẫn theo đoàn rước sính lễ tới cầu hôn Hứa U Nhàn. Rương nối rương, đỏ rực cả sân.' },
    { who: 'chu_kien_tham', text: 'Hứa gia chủ, Chu gia ta thành tâm cầu hôn đại tiểu thư. Sính lễ: năm mươi vạn lượng bạc, ba cửa hiệu mặt phố, hai kho hàng. Khắp Cô Châu Thành này, không nhà nào ra giá cao hơn được.' },
    { who: 'anh_phung', text: 'Năm mươi vạn lượng… Chu công tử quả là người có thành ý. U Nhàn à, con xem…' },
    { who: 'u_nhan', text: 'Mẹ! Con đã nói rồi, con không… Thâm công tử, cảm ơn ý tốt của Chu gia, nhưng hôn sự này, ta từ chối.' },
    { who: 'chu_kien_tham', text: 'Từ chối? Hay là… đã có người ra giá cao hơn? Ha ha, nói thử xem, khắp thành này ai dám ra hơn Chu gia?' },
    { who: 'hero', mode: 'write', text: '(Ngươi bước lên một bước, cầm bút viết chậm rãi lên tờ giấy đặt giữa sân, giơ lên cho tất cả cùng thấy: "Năm mươi mốt vạn lượng. Ta cưới nàng.")' },
    { who: 'narrate', text: 'Cả sân nín thở. Năm mươi mốt vạn lượng — hơn Chu gia đúng một vạn, và người viết ra con số ấy là kẻ "ở rể ăn bám, phế căn câm điếc" của Hứa gia. Không ai biết những năm tháng lặng im qua, tiền công của một vị Hồn Sư thần bí đã tích thành bao nhiêu — chỉ mình ngươi biết.' },
    { who: 'chu_kien_tham', text: 'Ngươi… một thằng ở rể, lấy đâu ra năm mươi mốt vạn lượng?! Hứa gia chủ, nhà này định để một kẻ câm lừa gạt cả thành sao?!' },
    { who: 'chinh_ngon', text: 'Chu công tử, xin bình tĩnh. Số tiền ấy thật hay không, Hứa gia ta sẽ tự kiểm chứng. Còn hôn sự của U Nhàn — nó đã từ chối, ta là cha, ta nghe theo nó. Mời công tử về cho.' },
    { who: 'chu_kien_tham', text: 'Được. Được lắm. Hứa gia — và cả ngươi nữa, Giang Phàm — chuyện hôm nay, Chu Kiến Thâm ta ghi nhớ từng chữ!' },
    { who: 'u_nhan', text: '(khẽ, chỉ đủ ngươi nghe) Năm mươi mốt vạn… Cậu điên rồi. Nhưng… cảm ơn cậu. Lần đầu tiên có người đứng ra vì em như thế.' }
  ];

  var SCENE_ATK_INTRO = [
    { who: 'chinh_ngon', text: 'Giang Phàm, ở lại một chút. Sau vụ sính lễ, quanh phủ có nhiều bóng lạ dò la. Ta đã tăng người gác, nhưng đêm nay… ta có linh cảm không lành.' },
    { who: 'narrate', text: 'Linh cảm ấy ứng nghiệm ngay trong đêm. Canh hai, tiếng gỗ vỡ khô khốc vang lên từ cổng phủ — rồi tiếng chân người dồn dập trên sân đá.' }
  ];

  var ATK_CHOICE = {
    who: 'choice', text: 'Kẻ địch đã vào sân. Ngươi sẽ…',
    options: [
      { label: 'Phát một đòn Phá Âm', action: 'atk_pha' },
      { label: 'Phát một đòn Chấn Âm', action: 'atk_chan' },
      { label: 'Xuất Thất Tinh Kiếm Quyết nghênh địch', action: 'atk_sword' },
      { label: 'Lùi vào trong, gọi gia nhân và U Nhàn ứng cứu', action: 'atk_fallback' }
    ]
  };
  var SCENE_ATK1 = [
    { who: 'narrate', text: 'Đợt một: ba bóng đen bịt mặt phá cổng xông vào sân phủ, đao tuốt trần, lao thẳng về phía chính đường. Gia nhân gác cổng đã bị đánh ngã.' },
    ATK_CHOICE
  ];
  var SCENE_ATK2 = [
    { who: 'narrate', text: 'Đợt hai: bốn tên nữa từ mái đông sương nhảy xuống, chia hai hướng — mục tiêu của chúng rõ ràng là phòng của U Nhàn và chính đường. Chúng được huấn luyện, không hề lên tiếng.' },
    ATK_CHOICE
  ];
  var SCENE_ATK3 = [
    { who: 'narrate', text: 'Đợt ba: tên cầm đầu bước ra từ bóng tối cổng phủ. Giữa các ngón tay hắn, một sợi tơ đen quen thuộc đang uốn lượn — đúng thủ pháp đã hại Trần lão gia. Huyết Bạc Cung. Hắn nhìn thẳng vào ngươi, cười lạnh: "Hồn Sư thần bí… quả nhiên ở đây."' },
    ATK_CHOICE
  ];

  var SCENE_ATK_END = [
    { who: 'narrate', text: 'Tên cầm đầu thấy tình thế không xong, huýt một tiếng dài rồi cùng tàn quân rút qua tường sau, biến vào đêm. Sân phủ ngổn ngang, nhưng người trong nhà không ai mất mạng — mấy gia nhân bị thương đã được đỡ dậy.' },
    { who: 'u_nhan', text: 'Huyết Bạc Cung… chúng tới vì cậu, phải không? Vì vị "Hồn Sư thần bí" kia. Giang Phàm, từ nay chuyện của cậu cũng là chuyện của em — đừng giấu em nữa.' },
    { who: 'chinh_ngon', text: 'Đêm nay nếu không có cậu, Hứa gia ta không biết ra sao. Ba mươi lăm viên Linh Thạch này là của kho nhà — cậu nhận lấy, coi như tạ ơn. Còn một chuyện nữa: ta có một vật muốn trao cho cậu, mai hãy tới gặp ta.' },
    { who: 'narrate', text: 'Trời sáng dần trên sân phủ ngổn ngang. Kẻ địch giấu mặt nhiều năm cuối cùng đã lộ tên — và chúng biết ngươi ở đâu.' }
  ];

  var SCENE_INVITE = [
    { who: 'chinh_ngon', text: 'Giang Phàm, vật ta muốn trao là thứ này: thư tiến cử nhập môn của Thanh Vân Tông. Tông môn mở kỳ tuyển chọn, hồ sơ Vô Cực Linh Căn của cậu ở Kiểm Trắc Tháp đã được gửi lên — đây là thư mời chính thức.' },
    { who: 'chinh_ngon', text: 'Năm xưa Hứa gia ta nhận cậu vào ở rể là vì một tờ hôn ước cũ… Ta là người làm cha, làm gia chủ, ta nợ cậu nhiều lời xin lỗi. Lên tông môn rồi, đi cho thật xa vào.' },
    { who: 'u_nhan', text: 'Em sẽ chờ tin của cậu. Khi nào cậu đứng vững trên Thanh Vân Tông… em sẽ lên đó tìm cậu. Cổng lên tông ở đông bắc thành — đi đường cẩn thận.' },
    { who: 'narrate', text: 'Thư mời Thanh Vân Tông đã trong tay. Cổng lên tông ở phía đông bắc thành, qua Trần gia — từ hôm nay, nó mở cho ngươi. (Đã mở cổng: Cô Châu Thành đi Thanh Vân Tông.)' }
  ];

  /* ---------- Chương 7: Vào Thanh Vân Tông với thân phận vô linh căn ----------
     Thân phận vô linh căn, thắng hình chiếu Liễu Khuynh Tiên ở Thăng Long Đạo
     bằng đúng ba chiêu không dùng Vạn Âm Cộng Hưởng và thắng Hoa Hướng Thần là
     [TRUYỆN GỐC]; việc tạp dịch là sáng tác của game. */
  var SCENE_NHAP_TONG = [
    { who: 'narrate', text: 'Đại điện Thanh Vân Tông cao và lạnh, cột đá chạm mây, tiếng chuông sớm còn ngân ngoài sân. Ngươi bước vào giữa hàng đệ tử đang đứng chầu, thư mời trong tay, và cảm thấy mọi ánh mắt đều dừng lại ở cuốn hồ sơ mà trưởng lão đang mở trên án.' },
    { who: 'truong_lao_tong', text: 'Giang Phàm, Hứa Gia Trấn. Thư mời nhập môn ghi rõ: Kiểm Trắc Tháp tiến cử, cho vào tông với thân phận đệ tử chờ thẩm tra. Nhưng hồ sơ nhập môn của ngươi… trang đầu chỉ có ba chữ: vô linh căn.' },
    { who: 'truong_lao_tong', text: 'Lạ ở chỗ, tin từ Kiểm Trắc Tháp gửi lên lại nói thước pha lê leo vượt cửu phẩm, phán là Vô Cực Linh Căn trong truyền thuyết. Một hồ sơ, hai kết luận trái ngược nhau. Tông môn chưa từng gặp trường hợp này.' },
    { who: 'de_tu_a', text: '(xì xào) Vô linh căn mà cũng được thư mời lên tông? Ta tu luyện ba năm mới qua được kỳ tuyển chọn, còn hắn thì đi cửa sau à?' },
    { who: 'de_tu_b', text: '(khẽ) Lại còn là người câm nữa. Không linh căn, không nói được — vào tông thì làm được gì, hay chỉ để người ta cười cho vui?' },
    { who: 'truong_lao_tong', text: 'Im lặng. Giang Phàm, trong lúc chờ tông thẩm tra lại hồ sơ, ngươi tạm xếp vào khu tạp dịch ở phía đông nam. Ở Thanh Vân Tông, người ta nhìn việc trước, nhìn căn sau. Làm tốt việc của mình, hồ sơ tự khắc có người phải đọc lại.' },
    { who: 'hero', mode: 'write', text: '(viết) "Đệ tử nhận việc. Việc gì giao tới tay, đệ tử làm cho xong."' },
    { who: 'narrate', text: 'Trưởng lão nhìn dòng chữ một lúc lâu, rồi khẽ gật đầu. Ngươi theo quản sự tạp dịch rời đại điện — sau lưng, tiếng xì xào vẫn chưa dứt, nhưng bậc thang đầu tiên của ngươi ở ngọn núi này đã bắt đầu từ khu tạp dịch.' }
  ];

  var SCENE_CHORE_GO = [
    { who: 'narrate', text: 'Sau bếp của tông môn, củi chất cao như một bức tường nhỏ. Ngươi vung rìu từ lúc trời còn mờ sương — nhát nào cũng đúng thớ gỗ, củi bổ đôi đều tăm tắp, không một khúc nào phải bổ lại lần hai.' },
    { who: 'narrate', text: 'Mấy đệ tử tạp dịch đứng xem, ban đầu còn cười, sau im dần. Người làm bếp lâu năm nhất lẩm bẩm rằng đống củi này bằng cả buổi sáng của hai người cộng lại — mà ngươi làm một mình, mồ hôi chưa thấm hết áo.' },
    { who: 'narrate', text: '(Việc bổ củi sau bếp đã xong. Tay ngươi vững hơn người ta tưởng — và điều đó bắt đầu có người để ý.)' }
  ];

  var SCENE_CHORE_NUOC = [
    { who: 'narrate', text: 'Giếng sau bếp sâu và trơn, đường gánh nước lên bếp phải qua một đoạn dốc đá. Ngươi gánh đôi thùng đầy, bước chân đều và chậm, nước trong thùng không sánh ra ngoài một giọt nào suốt cả quãng đường.' },
    { who: 'narrate', text: 'Bà bếp trưởng đứng ở cửa bếp nhìn theo, gật gù: người gánh nước giữ được thùng không sánh là người giữ được tâm không động — câu ấy bà chỉ nói với những đệ tử bà thật sự coi trọng.' },
    { who: 'narrate', text: '(Việc gánh nước giếng sau bếp đã xong. Chum nước của bếp đầy trước giờ cơm, sớm hơn mọi ngày.)' }
  ];

  var SCENE_CHORE_BAO = [
    { who: 'narrate', text: 'Sân tạp dịch, mấy chục bao dược thảo vừa chuyển từ chân núi lên, cần đưa hết vào kho trước khi trời mưa. Ngươi buộc lại từng miệng bao lỏng, xếp bao nặng xuống dưới, bao nhẹ lên trên, lối đi trong kho vẫn thoáng.' },
    { who: 'narrate', text: 'Một đệ tử tạp dịch lớn tuổi hơn ghé tai bạn mình: xếp kho như thế này thì lúc lấy dược không bao giờ phải bới tung cả đống — thằng mới tới này, làm việc như người đã ở tông nhiều năm.' },
    { who: 'narrate', text: '(Việc chuyển bao dược ở sân tạp dịch đã xong. Mưa vừa đổ xuống thì bao cuối cùng cũng đã yên vị trong kho, khô ráo nguyên vẹn.)' }
  ];

  var SCENE_CHORES_DONE = [
    { who: 'narrate', text: 'Cuối kỳ tạp dịch, quản sự tạp dịch gọi ngươi tới, lật cuốn sổ công việc ra kiểm từng mục: bổ củi, gánh nước, chuyển bao dược — ba việc, ba dấu xong, không một lời phàn nàn nào ghi bên cạnh.' },
    { who: 'tap_dich_truong', text: 'Ba việc xong gọn, không thiếu một việc, không hỏng một việc. Ở khu tạp dịch này, người làm được như ngươi trong kỳ đầu không nhiều đâu.' },
    { who: 'tap_dich_truong', text: 'Đây là bốn mươi lăm viên Linh Thạch tiền công kỳ tạp dịch của ngươi. Tông trả công bằng Linh Thạch, sòng phẳng như trả cho mọi đệ tử khác — việc nhỏ cũng là việc của tông.' },
    { who: 'tap_dich_truong', text: 'Công điểm của ngươi ta đã ghi vào sổ rồi, không sót một điểm. Sau này xét chuyển lên hàng đệ tử chính thức, cuốn sổ này sẽ là thứ đầu tiên người ta mở ra.' },
    { who: 'tap_dich_truong', text: 'Còn một việc nữa: trưởng lão có lệnh — ngày mai, ngươi lên Thăng Long Đạo ở phía tây bắc tông. Lên đó để làm gì, tới nơi ngươi sẽ rõ. Đừng tới trễ.' }
  ];

  var SCENE_TL_INTRO = [
    { who: 'narrate', text: 'Đài Thăng Long ở phía tây bắc tông môn, bậc đá dài hun hút dẫn lên một đài cao chạm mây. Gió trên đài mạnh tới mức áo bào của hàng đệ tử đứng xem phần phật không ngừng. Trưởng lão đã chờ sẵn ở cuối bậc thang.' },
    { who: 'truong_lao_tong', text: 'Thăng Long Đạo là thước đo kiếm của Thanh Vân Tông. Trấn đài này là hình chiếu của Liễu Khuynh Tiên — con gái tông chủ, Luyện Khí tầng tám viên mãn — lưu lại từ ngày nàng qua đài.' },
    { who: 'truong_lao_tong', text: 'Luật của đài rất rõ: ngươi phải thắng hình chiếu bằng đúng ba chiêu kiếm. Thiếu một chiêu chưa thắng thì chưa xong, thừa một chiêu thì tính là kiếm chưa thuần. Ba chiêu — không hơn, không kém.' },
    { who: 'truong_lao_tong', text: 'Và nghe cho kỹ điều này: tuyệt đối không dùng cộng hưởng. Đài này đo kiếm, không đo cách nghe — ai phát hưởng, thử thách dừng ngay, kết quả hủy bỏ. Bí mật gì của ngươi, giữ lấy mà dùng ở chỗ khác.' },
    { who: 'lieu_khuynh_tien', text: 'Hình chiếu chỉ là cái bóng của ta năm ấy. Nhưng cái bóng ấy cũng chưa từng thua kẻ nào dưới ba chiêu — ngươi liệu mà giữ kiếm cho vững.' },
    { who: 'narrate', text: 'Giữa đài, hình chiếu nâng kiếm. Ánh sáng quanh thân nàng tụ lại thành một đường kiếm quang chói mắt — chiêu đầu tiên đã thành hình, và cả đài nín thở chờ nó chém xuống.' }
  ];

  var TL_CHOICE = {
    who: 'choice', text: 'Ngươi sẽ đáp chiêu này bằng…',
    options: [
      { label: 'Thất Tinh Bộ — lách mình tránh kiếm quang', action: 'tl_thiem' },
      { label: 'Hoành kiếm phong ngự — đỡ thẳng mũi kiếm', action: 'tl_phong' },
      { label: 'Đối chém — một kiếm nghênh thẳng', action: 'tl_dao' },
      { label: 'Phát Chấn Âm phá hình chiếu', action: 'tl_voice' }
    ]
  };
  var SCENE_TL1 = [
    { who: 'narrate', text: 'Chiêu thứ nhất: kiếm quang từ trên cao chém xuống như thác đổ, uy thế dồn cả vào một đường thẳng, mặt đá của đài rung lên trước khi kiếm kịp tới. Một đòn như vậy, thứ nó để hở chính là hai bên sườn — nơi thác nước không chảy tới.' },
    { who: 'narrate', text: 'Cả đài im phăng phắc. Mũi kiếm còn cách đỉnh đầu ngươi đúng một khoảng ngắn ngủi — quyết định phải tới trong một nhịp thở này.' },
    TL_CHOICE
  ];
  var SCENE_TL2 = [
    { who: 'narrate', text: 'Chiêu thứ hai: hình chiếu xoay kiếm, kiếm vũ liên hoàn trút xuống như mưa rào, kiếm ảnh phủ kín ba phía trước, trái và phải, chừa lại duy nhất khoảng trống ngay trước mũi kiếm của chính ngươi.' },
    { who: 'narrate', text: 'Mưa kiếm dày tới mức không còn kẽ hở nào để lách qua. Muốn qua được chiêu này, hoặc có một bức tường đủ vững, hoặc phải trả giá đắt hơn thế nhiều.' },
    TL_CHOICE
  ];
  var SCENE_TL3 = [
    { who: 'narrate', text: 'Chiêu thứ ba: hình chiếu thu hết kiếm vũ, hai tay nắm chuôi, dốc toàn lực vào một kiếm thẳng chém tới — không hoa mỹ, không biến chiêu, không đường lui cho cả người ra chiêu lẫn người đỡ chiêu.' },
    { who: 'narrate', text: 'Một kiếm như thế chỉ tôn trọng một cách đáp duy nhất: ai lùi, người đó thua; ai tránh, kiếm thế sẽ đuổi theo tới cùng. Cả đài, kể cả trưởng lão, đều đã đứng thẳng dậy.' },
    TL_CHOICE
  ];

  var SCENE_TL_VOICE = [
    { who: 'narrate', text: 'Sóng cộng hưởng vừa chớm tụ quanh ngươi — chưa thành đòn — thì trên đài cao, trưởng lão đã phất mạnh tay áo. Chuông của đài Thăng Long vang lên một tiếng dài, hình chiếu của Liễu Khuynh Tiên tan ra như khói gặp gió.' },
    { who: 'truong_lao_tong', text: 'Thử thách dừng tại đây. Ta đã nói rõ luật từ đầu: đài này đo kiếm, không đo cộng hưởng.' },
    { who: 'truong_lao_tong', text: 'Nghe đây, Giang Phàm. Cách nghe của ngươi là bí mật — một lần phát hưởng ở đây là phơi nó ra trước cả tông môn, và người tinh ý sẽ lần ra ngươi nghe bằng hồn, không phải bằng tai thường. Đừng phơi nó ra ở chỗ không cần thiết, trước mắt những người không cần biết.' },
    { who: 'narrate', text: 'Hình chiếu tụ lại giữa đài như chưa từng tan. Trưởng lão ra hiệu bắt đầu lại từ đầu — lần này, ngươi chỉ được dùng thanh kiếm trong tay mình.' }
  ];

  var SCENE_TL_WIN = [
    { who: 'narrate', text: 'Chiêu thứ ba khép lại. Kiếm quang tắt, hình chiếu của Liễu Khuynh Tiên đứng yên một thoáng giữa đài, rồi tan dần thành những hạt sáng nhỏ, bay lên theo gió cao. Ba chiêu — vừa đúng ba chiêu.' },
    { who: 'truong_lao_tong', text: 'Ba chiêu. Không thừa một chiêu. …Ba mươi năm coi đài này, ta mới lại được thấy một người qua Thăng Long Đạo gọn như vậy.' },
    { who: 'de_tu_a', text: 'Thắng… thắng thật rồi! Hình chiếu của sư tỷ Khuynh Tiên, bị một đệ tử tạp dịch thắng trong ba chiêu! Ta có nhìn lầm không?' },
    { who: 'de_tu_b', text: 'Không lầm đâu. Ta đếm rõ ràng: ba chiêu. Từ hôm nay, ai còn dám nói hai chữ "vô linh căn" kia, phải nói nhỏ hơn một chút đấy.' },
    { who: 'narrate', text: 'Tên của ngươi lan khỏi đài Thăng Long trước khi trời ngả chiều. Lần này, thứ lan đi không phải tin đồn — mà là kết quả do chính thước đo của tông môn ghi nhận.' }
  ];

  var SCENE_TL_WIN_HARD = [
    { who: 'narrate', text: 'Chiêu cuối cùng chạm nhau, kiếm của ngươi chệch đi nửa tấc rồi mới cắn được vào kiếm thế của hình chiếu. Ánh sáng vỡ ra — hình chiếu tan, nhưng tay cầm kiếm của ngươi cũng run lên hồi lâu mới dừng lại được.' },
    { who: 'truong_lao_tong', text: 'Thắng là thắng. Đài này chỉ ghi thắng và thua, không ghi thắng đẹp hay thắng xấu. Hình chiếu đã tan — kết quả của ngươi được công nhận.' },
    { who: 'truong_lao_tong', text: 'Nhưng nhớ lấy: ở chiêu cuối, kiếm của ngươi đã do dự. Do dự một nhịp trước kiếm của kẻ yếu hơn thì còn cứu được; trước kiếm của kẻ mạnh thật, một nhịp ấy là một mạng. Nhớ lấy cảm giác này.' },
    { who: 'narrate', text: 'Ngươi cúi đầu nhận lấy lời dặn ấy. Qua đài là thật — và khoảng cách tới hai chữ "không do dự" cũng là thật, ngươi nhìn thấy nó rõ hơn bất kỳ ai.' }
  ];

  var SCENE_TL_LIEU = [
    { who: 'narrate', text: 'Đám đệ tử chưa kịp tản thì cuối bậc thang bỗng im bặt. Liễu Khuynh Tiên thật đang bước lên đài — không phải hình chiếu mờ sáng, mà là người thật bằng xương bằng thịt, áo trắng giữa gió cao, ánh mắt dừng thẳng trên người ngươi.' },
    { who: 'lieu_khuynh_tien', text: 'Hình chiếu của ta thua trong ba chiêu. Ta vừa nghe rõ từng lời trưởng lão nói. Nhưng hình chiếu suy cho cùng vẫn chỉ là cái bóng của ta năm ấy…' },
    { who: 'lieu_khuynh_tien', text: '…còn ta thật thì sao? Câu này, ta không hỏi để ngươi đáp hôm nay. Ta chỉ muốn ngươi biết là ta đã tự hỏi nó, từ lúc đứng dưới bậc thang này.' },
    { who: 'lieu_khuynh_tien', text: 'Và còn một điều nữa. Kiếm của ngươi có một thứ không giống kiếm của Thanh Vân Tông — không giống bất kỳ đường kiếm nào ta từng thấy ở tông này. Ngươi học nó ở đâu, ta chưa hỏi. Nhưng ta đã nhìn thấy.' },
    { who: 'hero', mode: 'write', text: '(viết) "Kiếm của đệ tử, là kiếm của đệ tử. Sư tỷ muốn biết, ngày khác trên đài sẽ rõ."' },
    { who: 'lieu_khuynh_tien', text: 'Ngày khác trên đài. Được. Ta nhớ câu này của ngươi.' },
    { who: 'narrate', text: 'Nàng quay đi, tà áo trắng khuất dần sau bậc thang đá. Nàng tới rồi đi, không khen, không chê, không hứa hẹn điều gì — và chính sự để ngỏ ấy khiến cả đài bàn tán còn lâu hơn cả trận đấu vừa rồi.' }
  ];

  var SCENE_HHT_INTRO = [
    { who: 'narrate', text: 'Quảng trường tông môn, giờ luyện kiếm buổi sớm. Tin Thăng Long Đạo đã lan khắp các khu đệ tử — và người bước ra giữa quảng trường lúc này chính là người mà cả tông đều đang chờ xem sẽ lên tiếng thế nào.' },
    { who: 'hoa_huong_than', text: 'Giang Phàm. Ta là Hoa Hướng Thần, đại đệ tử của Thanh Vân Tông. Hình chiếu của sư muội Khuynh Tiên trấn Thăng Long Đạo nhiều năm chưa thua ai trong ba chiêu — hôm nay ta tới không phải để trách ngươi thắng nó.' },
    { who: 'hoa_huong_than', text: 'Ta tới để tự mình kiểm chứng. Tông môn này sắp xếp thứ bậc bằng kiếm, không bằng hồ sơ, cũng không bằng tin đồn. Ngươi thắng hình chiếu — vậy hãy cho ta thấy, kiếm của ngươi trước người thật thì được mấy phần.' },
    { who: 'truong_lao_tong', text: 'Ta đứng xem, và ta không ngăn. Đấu bằng kiếm quyết của tông, điểm tới là dừng, không ai được ra tay ngoài luật. Hai ngươi — vào thế đi.' },
    { who: 'de_tu_a', text: '(xôn xao) Đại sư huynh tự mình thách đấu một đệ tử mới vào tông… Mười năm nay, ta chưa từng thấy chuyện này ở quảng trường.' },
    { who: 'narrate', text: 'Vòng người dạt ra thành một khoảng trống lớn giữa quảng trường. Hoa Hướng Thần rút kiếm, mũi kiếm hạ thấp, lễ chào đối thủ đầy đủ từng li — rồi kiếm thế của đại đệ tử Thanh Vân Tông bắt đầu dâng lên như thủy triều.' }
  ];

  var HHT_CHOICE = {
    who: 'choice', text: 'Giữa trận đấu, ngươi sẽ…',
    options: [
      { label: 'Phát một đòn Phá Âm', action: 'hht_pha' },
      { label: 'Phát một đòn Chấn Âm', action: 'hht_chan' },
      { label: 'Xuất Thất Tinh Kiếm Quyết', action: 'hht_sword' },
      { label: 'Thu kiếm giữ thế, thổ nạp lấy lại Tĩnh Âm', action: 'hht_hold' }
    ]
  };
  var SCENE_HHT1 = [
    { who: 'narrate', text: 'Đợt thứ nhất: Hoa Hướng Thần ra kiếm thăm dò — ba chiêu đầu nhanh mà nhẹ, chạm vào kiếm của ngươi rồi rút ngay, như người gõ từng nhịp lên một cánh cửa để nghe tiếng bên trong. Hắn đang đo chiều sâu của ngươi.' },
    { who: 'narrate', text: 'Ánh mắt hắn sau ba chiêu đã khác hẳn lúc bước vào sân: sự thong thả của kẻ bề trên biến mất, thay bằng sự tập trung của một kiếm thủ gặp đúng đối thủ.' },
    HHT_CHOICE
  ];
  var SCENE_HHT2 = [
    { who: 'narrate', text: 'Đợt thứ hai: Hoa Hướng Thần dồn ép thật lực. Kiếm thế của đại đệ tử phủ xuống liên miên không kẽ nghỉ, quảng trường chỉ còn nghe tiếng kiếm chạm nhau dày như mưa đá — hắn muốn ép ngươi phải lộ ra con bài mạnh nhất của mình.' },
    { who: 'narrate', text: 'Mấy đệ tử đứng gần nhất đã phải lùi thêm hai bước. Ai cũng hiểu: từ đợt này trở đi, đây không còn là một trận kiểm chứng nữa, mà là một trận đấu thật sự.' },
    HHT_CHOICE
  ];
  var SCENE_HHT3 = [
    { who: 'narrate', text: 'Đợt thứ ba: Hoa Hướng Thần thu kiếm về ngang ngực, cả quảng trường lặng đi trong một nhịp thở — rồi hắn xuất chiêu mạnh nhất của đại đệ tử Thanh Vân Tông, kiếm quang tụ thành một điểm sáng duy nhất, lao thẳng tới không một tiếng động thừa.' },
    { who: 'narrate', text: 'Đây là chiêu phân thắng bại. Sau chiêu này, dù kết quả thế nào, trận đấu ở quảng trường cũng sẽ khép lại — và cả tông môn sẽ biết phải xếp ngươi vào hàng nào.' },
    HHT_CHOICE
  ];

  var SCENE_HHT_END = [
    { who: 'narrate', text: 'Kiếm quang tắt. Hoa Hướng Thần đứng yên giữa quảng trường một lúc lâu, rồi chậm rãi tra kiếm vào vỏ — động tác của một người thu kiếm vì tâm phục, không phải vì kiệt sức.' },
    { who: 'hoa_huong_than', text: 'Ta thua. Ba chữ này, Hoa Hướng Thần ta cả đời chưa nói với ai cùng lứa. Hôm nay nói trước cả quảng trường, ta không thấy mất mặt — thua một thanh kiếm như thế này, không có gì phải giấu.' },
    { who: 'hoa_huong_than', text: 'Nghe rõ đây: từ hôm nay, trong Thanh Vân Tông, không ai được gọi Giang Phàm là phế căn trước mặt ta. Ai không phục kiếm của hắn — cứ tới tìm ta mà hỏi trước.' },
    { who: 'de_tu_b', text: '(khẽ) Đại sư huynh đã nói vậy rồi… Hồ sơ kia, e là sắp có người phải viết lại thật.' },
    { who: 'truong_lao_tong', text: 'Trận hôm nay, tông môn đã thấy đủ. Giang Phàm — về chuẩn bị đi. Kỳ Trúc Cơ của tông sắp mở, và với cảnh giới hiện tại của ngươi, đó là cánh cửa ngươi phải bước qua tiếp theo.' },
    { who: 'narrate', text: 'Ngươi rời quảng trường giữa những ánh mắt đã hoàn toàn khác với ngày đầu bước vào đại điện. Vị thế ở ngọn núi này, ngươi không xin ai cho — ngươi tự kiếm lấy, từng việc nhỏ, từng chiêu kiếm một.' }
  ];

  /* ---------- Chương 8: Trúc Cơ — lời nói đầu tiên ở tầm cao mới ----------
     Toàn bộ diễn biến chương là [GAME SÁNG TÁC] trên các tuyến đã mở:
     Huyết Bạc Cung tấn công đúng lúc đột phá khi Giang Phàm không thể cất
     tiếng, được những người mình từng bảo vệ hộ pháp lại; việc gạch bỏ hai
     chữ "vô linh căn" trong hồ sơ tông là mục parent đã duyệt đưa vào game. */
  var SCENE_CHUAN_BI_1 = [
    { who: 'narrate', text: 'Đại điện Thanh Vân Tông. Sau trận ở quảng trường, trưởng lão gọi riêng ngươi lên, trên án là danh sách đệ tử được phép dự kỳ đột phá của tông kỳ này — và tên ngươi nằm trong đó.' },
    { who: 'truong_lao_tong', text: 'Giang Phàm, tông cho phép ngươi lên Đài Trúc Cơ ở phía bắc tông trong kỳ này. Luyện Khí tầng chín viên mãn, thắng Thăng Long Đạo, thắng cả đại đệ tử — điều kiện về thực lực, ngươi đã đủ.' },
    { who: 'truong_lao_tong', text: 'Nhưng lên đài cần một viên Trúc Cơ Đan, và đan ấy không phát không: lệ của tông là đệ tử tự gom đủ nguyên liệu, ta luyện cho. Công thức kỳ này gồm bốn thứ: Linh Chi Sau Núi một cây làm thuốc dẫn, Yêu Đan cấp 1 một viên, Thanh Tâm Thảo ba cây, và 30 Linh Thạch công luyện.' },
    { who: 'truong_lao_tong', text: 'Linh chi hái ở bãi trống sau núi, phía đông bắc tông — thuốc dẫn phải tươi nguyên mới giữ được linh khí lúc xung kích cảnh giới. Thanh Tâm Thảo mọc ở vườn dược ngay cạnh bãi trống ấy, hái đủ ba cây trong cùng chuyến đi. Còn Yêu Đan cấp 1 nằm trong người yêu thú — sau núi có biến thì rất có thể chính kẻ tới gây sự mang nó theo người.' },
    { who: 'truong_lao_tong', text: 'Và nghe kỹ lời dặn này: sau núi mấy hôm nay có dấu vết người lạ qua lại. Huyết Bạc Cung chưa dứt — dư nghiệt của chúng vẫn dò la tin tức về một vị Hồn Sư thần bí. Đi nhanh, về nhanh, đừng nán lại.' },
    { who: 'hero', mode: 'write', text: '(viết) "Đệ tử đi ngay. Linh chi sẽ về tới đại điện nguyên vẹn."' },
    { who: 'narrate', text: 'Ngươi rời đại điện, men theo đường núi hướng về phía đông bắc. Sau lưng là tông môn vừa mới công nhận ngươi — trước mặt là rừng sau núi, nơi không ai dám chắc có gì đang chờ.' }
  ];

  var SCENE_CHI_GATHER = [
    { who: 'narrate', text: 'Bãi trống sau núi phía đông bắc yên tĩnh lạ thường, sương sớm còn đọng trên cỏ. Dưới gốc cây cổ thụ ở giữa bãi, một cụm Linh Chi Sau Núi mọc thành vòng — tai nấm đỏ sẫm, viền còn óng ánh linh quang của thuốc tươi.' },
    { who: 'narrate', text: 'Ngươi quỳ xuống, dùng dao nhỏ cắt sát gốc từng tai một như cách dược sư đã dạy, đặt vào hộp ngọc mang theo. Cụm linh chi tươi nguyên, không dập, không mất một mảnh — vị thuốc dẫn đã đủ.' },
    { who: 'narrate', text: 'Đúng lúc ngươi đứng dậy, khu rừng quanh bãi bỗng im bặt. Không tiếng chim, không tiếng côn trùng — thứ im lặng mà ngươi đã từng nghe một lần, trên đường tới Cô Châu Thành.' },
    { who: 'narrate', text: 'Rồi từ hai phía của bãi trống, lá khô khẽ động. Không phải gió. Có người đang khép vòng vây quanh ngươi — chậm rãi và rất chuyên nghiệp.' }
  ];

  var CHI_CHOICE = {
    who: 'choice', text: 'Vòng vây đang khép lại. Ngươi sẽ…',
    options: [
      { label: 'Xuất kiếm nghênh địch', action: 'chi_sword' },
      { label: 'Phát một đòn Chấn Âm', action: 'chi_chan' },
      { label: 'Lăn vào bụi linh chi, ẩn mình chờ chúng qua', action: 'chi_hide' }
    ]
  };
  var SCENE_CHI_AMBUSH = [
    { who: 'narrate', text: 'Hai bóng đen bịt mặt bước ra khỏi rừng từ hai phía, tay áo đều có một vệt đỏ thẫm như máu khô — dấu hiệu của Huyết Bạc Cung. Tên đi trước dừng lại cách ngươi mười bước, giọng khàn và lạnh: "Thuốc dẫn Trúc Cơ… hái giúp bọn ta rồi đấy à, cậu Giang?"' },
    { who: 'narrate', text: 'Tên còn lại vòng ra sau lưng ngươi, nói tiếp như đã thuộc lòng một danh sách: "Cung chủ có lệnh: vị Hồn Sư thần bí kia, sống phải thấy người, chết phải thấy hồn. Ngươi ở tông môn này gần tin tức về hắn nhất — đi theo bọn ta một chuyến."' },
    CHI_CHOICE
  ];

  var SCENE_CHI_END = [
    { who: 'narrate', text: 'Màn đối đầu ở bãi trống khép lại. Kẻ địch không đạt được điều chúng muốn — chúng rút vào rừng sâu nhanh như lúc xuất hiện, để lại trên cỏ mấy vệt chân và một mùi khét lạ của tơ đen cháy dở.' },
    { who: 'narrate', text: 'Ngươi mở hộp ngọc kiểm lại: cụm Linh Chi Sau Núi vẫn nguyên vẹn, linh quang chưa tan một chút nào. Cái giá của chuyến đi này chỉ là thêm một lần nữa, Huyết Bạc Cung xác nhận được ngươi đang ở đâu.' },
    { who: 'narrate', text: 'Không nán lại thêm một khắc nào, ngươi theo đường núi quay về tông. Từ xa, mái đại điện đã hiện ra sau rặng cây — mang linh chi về đại điện, đúng như lời trưởng lão dặn.' },
    { who: 'narrate', text: '(Đã mang Linh Chi Sau Núi về hướng đại điện. Trong túi còn có Yêu Đan cấp 1 rơi ra từ toán phục kích ở sau núi — mang cả về cho trưởng lão xem.)' }
  ];

  /* Cảnh trưởng lão kiểm công thức Trúc Cơ Đan — bản CHƯA ĐỦ nguyên liệu:
     trưởng lão nói rõ còn thiếu gì; câu chỉ đích danh từng thứ còn thiếu do
     lớp điều khiển nối thêm ngay sau cảnh này (theo đúng túi của người chơi). */
  var SCENE_CHUAN_BI_2 = [
    { who: 'narrate', text: 'Đại điện. Trưởng lão mở hộp ngọc của ngươi ra xem, thấy linh chi còn nguyên linh quang thì gật đầu — rồi ông đặt tay lên mặt án, nhìn ngươi chậm rãi.' },
    { who: 'truong_lao_tong', text: 'Linh chi đã có. Nhưng Trúc Cơ Đan không luyện bằng một mình linh chi được. Ta đã nói công thức ngay từ đầu: Linh Chi Sau Núi một cây, Yêu Đan cấp 1 một viên, Thanh Tâm Thảo ba cây, 30 Linh Thạch. Ngươi còn thiếu vài thứ — nghe cho rõ mà đi gom cho đủ.' }
  ];
  /* Cảnh trưởng lão luyện Trúc Cơ Đan — bản ĐÃ ĐỦ nguyên liệu theo công thức
     đã được duyệt: Linh Chi Sau Núi ×1 + Yêu Đan cấp 1 ×1 + Thanh Tâm Thảo
     ×3 + 30 Linh Thạch, trưởng lão luyện tại tông. */
  var SCENE_CHUAN_BI_2_OK = [
    { who: 'narrate', text: 'Đại điện. Trưởng lão bày những thứ ngươi mang về lên mặt án: linh chi còn nguyên linh quang, viên Yêu Đan cấp 1 đỏ sẫm, ba cây Thanh Tâm Thảo còn đọng sương, và 30 Linh Thạch đếm đủ không thiếu một viên.' },
    { who: 'truong_lao_tong', text: 'Đủ cả. Ngồi xuống đây chờ ta một tuần trà — luyện Trúc Cơ Đan phải làm ngay lúc thuốc còn tươi.' },
    { who: 'narrate', text: 'Lửa lò trong đại điện cháy xanh suốt một tuần trà. Khi nắp lò mở ra, một viên đan tròn trịa nằm giữa làn khói thuốc, mặt đan có một vân mây rất mảnh — dấu của một lò đan thành công trọn vẹn.' },
    { who: 'truong_lao_tong', text: 'Đây — Trúc Cơ Đan của ngươi. Cầm lấy. Việc chuẩn bị đã xong; còn lại là lên đài, giữ miệng, giữ tâm, đi hết chu thiên.' },
    { who: 'truong_lao_tong', text: 'Nhớ điều ta chỉ nói một lần: khi vận công đột phá, dù chuyện gì xảy ra quanh đài, ngươi cũng tuyệt đối KHÔNG được cất tiếng. Tiếng nói lúc đang vận công là tự phá kinh mạch của chính mình — nhẹ thì chu thiên vỡ, phải làm lại từ đầu; nặng thì tu vi tán hết.' },
    { who: 'truong_lao_tong', text: 'Ngươi không phải lên đài một mình. Hứa U Nhàn đã lên tông theo đúng lời hứa của nàng, và Hoa Hướng Thần đã tự xin đứng hộ pháp. Hai người ấy cùng đệ tử gác đài sẽ giữ quanh Đài Trúc Cơ — việc quanh đài, để họ lo.' },
    { who: 'hero', mode: 'write', text: '(viết) "Đệ tử ghi nhớ. Lên đài rồi, dù trời có sập, đệ tử cũng không mở miệng."' }
  ];

  var SCENE_GUARD_INTRO = [
    { who: 'narrate', text: 'Đài Trúc Cơ ở phía bắc tông môn. Ngươi ngồi giữa đài, viên Trúc Cơ Đan nắm trong tay chờ thời khắc cuối cùng — khi chu thiên vận hành tới vòng chót, ngươi sẽ nuốt đan và xung kích. Linh khí quanh đài đã bắt đầu tụ về, chậm rãi xoay quanh người ngươi.' },
    { who: 'narrate', text: 'Đúng lúc chu thiên bước vào vòng quyết định, chuông báo động của tông môn vang lên dồn dập từ sơn môn. Từ bậc thang phía đông của đài, khói và tiếng la hét vọng tới: Huyết Bạc Cung đã chọn đúng khoảnh khắc này để tấn công — khoảnh khắc ngươi không thể cất tiếng, cũng không thể đứng dậy.' },
    { who: 'u_nhan', text: 'Phàm ca, ngồi yên! Muội ở đây rồi — bậc thang phía đông để muội giữ. Huynh đã giữ miệng mười tám năm vì người khác; hôm nay, để người khác giữ im lặng quanh huynh!' },
    { who: 'hoa_huong_than', text: 'Giang Phàm, cứ vận công của ngươi. Kẻ nào muốn lên đài này, phải bước qua kiếm của Hoa Hướng Thần ta trước. Món nợ kiểm chứng ở quảng trường — hôm nay ta trả bằng cách này.' },
    { who: 'narrate', text: 'Ở bậc thang cao nhất, một bóng áo trắng vừa xuất hiện — Liễu Khuynh Tiên đã tới, không nói một lời, chỉ đứng vào vị trí còn trống của vòng hộ pháp. Dưới đài, tên cầm đầu của địch ngẩng lên nhìn ngươi, cười gằn: "Hét lên đi, Hồn Sư! Hét một tiếng là đồng bọn của ngươi được cứu — hay ngươi quý cái mạng tu luyện của mình hơn?"' }
  ];

  var GUARD_CHOICE = {
    who: 'choice', text: 'Vận công không thể dừng. Ngươi sẽ…',
    options: [
      { label: 'Ra hiệu cho U Nhàn giữ phía đông', action: 'guard_dong' },
      { label: 'Để Hoa Hướng Thần đón đầu kẻ mạnh nhất', action: 'guard_hoa' },
      { label: 'Ngồi yên giữ vững tâm thần, mặc kệ khiêu khích', action: 'guard_tam' },
      { label: 'Cất tiếng phá vây — dù phải vỡ vận công', action: 'guard_voice' }
    ]
  };
  var SCENE_GUARD1 = [
    { who: 'narrate', text: 'Đợt thứ nhất: địch đánh thẳng vào bậc thang phía đông của đài — hướng chúng cho là mỏng nhất. Tiếng kiếm chạm nhau và tiếng hò hét dội xuống mặt đá; phía đông mà sụp, vòng hộ pháp sẽ hở ra ngay trước mặt ngươi.' },
    { who: 'narrate', text: 'Chu thiên của ngươi đang ở vòng thứ hai, linh khí chạy qua kinh mạch như nước xiết. Chỉ một cái liếc mắt, một cái ra hiệu đúng lúc — đó là tất cả những gì ngươi được phép làm lúc này.' },
    GUARD_CHOICE
  ];
  var SCENE_GUARD2 = [
    { who: 'narrate', text: 'Đợt thứ hai: địch đổi hướng, bỏ bậc thang, dồn toàn lực đánh thẳng lên mặt đài theo lối giữa. Tên chỉ huy vừa đánh vừa gào lớn, cố ý cho cả đài nghe rõ từng chữ: "Hét lên đi, Hồn Sư! Một tiếng thôi — hét lên là xong hết!"' },
    { who: 'narrate', text: 'Lời khiêu khích ấy nhắm đúng vào chỗ hiểm nhất của ngươi: hắn không cần thắng kiếm của người hộ pháp — hắn chỉ cần ngươi tự phá vận công của chính mình. Chu thiên đã tới vòng thứ ba.' },
    GUARD_CHOICE
  ];
  var SCENE_GUARD3 = [
    { who: 'narrate', text: 'Đợt thứ ba: ở chu thiên cuối cùng, tên cầm đầu tự mình xông lên đài. Giữa các ngón tay hắn, sợi tơ đen của Huyết Bạc Cung uốn lượn quen thuộc — hắn bỏ qua tất cả người hộ pháp, lao thẳng về phía ngươi đang ngồi bất động.' },
    { who: 'narrate', text: 'Đây là khoảnh khắc mỏng nhất của cả kỳ đột phá: linh khí toàn thân ngươi đang dồn về một điểm, không một tấc nào chừa cho việc tự vệ. Mọi thứ còn lại, nằm ở những người đang đứng quanh đài này.' },
    GUARD_CHOICE
  ];

  var SCENE_GUARD_VOICE = [
    { who: 'narrate', text: 'Tiếng nói bật ra khỏi miệng ngươi — vòng vây quanh đài vỡ tung trong chớp mắt, kẻ địch bị chấn văng khỏi bậc thang. Nhưng cùng lúc đó, chu thiên đang vận hành trong người ngươi vỡ theo: linh khí tán loạn ra bốn phía như nước vỡ bờ không người dẫn, kinh mạch đau buốt như bị xé.' },
    { who: 'u_nhan', text: 'Phàm ca! Nằm yên, đừng cố ngồi dậy nữa! Muội đỡ huynh đây rồi — vòng vây vỡ rồi, người của mình không ai sao cả. Huynh nghe muội: một lần này thôi, đừng tự trách mình nữa.' },
    { who: 'hoa_huong_than', text: 'Đài đã sạch địch. Giang Phàm, nhìn cho rõ: viên Trúc Cơ Đan vẫn còn nguyên trong tay ngươi. Đan còn, người còn — vận công vỡ thì vận lại từ đầu, có gì mà không làm lại được.' },
    { who: 'truong_lao_tong', text: 'Nghe ta nói: giữ miệng lại. Lần này, dù kẻ nào gào vào tai ngươi điều gì, cũng để người trên đài này gánh thay. Ngươi chỉ việc làm lại chu thiên — chậm rãi, từ vòng đầu tiên.' },
    { who: 'narrate', text: 'Ngươi hít một hơi dài, nén cơn đau trong kinh mạch xuống, và bắt đầu vận hành chu thiên lại từ đầu. Quanh đài, những người hộ pháp lặng lẽ quay về vị trí — không một ai trách ngươi lấy một lời.' }
  ];

  var SCENE_GUARD_END = [
    { who: 'narrate', text: 'Đợt đánh cuối cùng bị đẩy lui hoàn toàn khỏi bậc thang. Kiếm của Hoa Hướng Thần và bóng áo trắng của Liễu Khuynh Tiên khép lại khoảng trống cuối cùng, còn phía đông, U Nhàn vẫn đứng vững ở vị trí của nàng từ đầu tới cuối.' },
    { who: 'narrate', text: 'Tên cầm đầu Huyết Bạc Cung trúng một kiếm trọng thương, được tàn quân kéo đi, rút chạy vào rừng sau núi trong khói và tiếng chiêng thu quân vội vã. Hắn thoát — nhưng lần này, kẻ phải bỏ chạy là hắn.' },
    { who: 'u_nhan', text: '(khẽ, như chỉ nói với chính mình) Xong rồi… Phàm ca, quanh huynh yên rồi. Phần còn lại là của huynh — muội tin huynh làm được.' },
    { who: 'narrate', text: 'Đài Trúc Cơ yên tĩnh trở lại. Gió bắc thổi qua mặt đá, chuông báo động của tông đã ngừng, chỉ còn tiếng linh khí xoay quanh người ngươi, mỗi lúc một dày, mỗi lúc một sáng.' },
    { who: 'narrate', text: 'Chu thiên của ngươi đã đi tới điểm cuối cùng. Linh khí toàn thân dồn về đan điền như trăm sông về biển — chỉ còn một bước nữa thôi: nuốt viên đan trong tay, và bước qua cánh cửa mà mười tám năm trước cả thiên hạ nói ngươi không bao giờ bước tới.' }
  ];

  var SCENE_TRUC_CO = [
    { who: 'narrate', text: 'Ngươi đưa viên Trúc Cơ Đan lên miệng và nuốt xuống. Dược lực bùng ra ấm và mạnh, gặp vị thuốc dẫn linh chi tươi đang giữ dòng — linh khí không tán, không loạn, mà quy thẳng về đan điền như đã chờ ngày này từ rất lâu.' },
    { who: 'narrate', text: 'Linh khí từ bốn phương hội tụ về đài như thủy triều vỡ bờ: cây trên núi nghiêng theo một hướng, mây trên đầu đài xoáy thành vòng, mặt đá dưới chân ngươi sáng lên từng đường linh quang chạy về một tâm duy nhất.' },
    { who: 'narrate', text: 'Rồi một cột sáng dựng thẳng lên giữa đài, xuyên qua tầng mây, đứng yên như một chiếc cột chống trời. Cả Thanh Vân Tông — từ sơn môn tới khu tạp dịch — đều ngẩng đầu nhìn thấy cột sáng ấy.' },
    { who: 'hero', mode: 'say', text: 'Trúc Cơ… thành rồi.' },
    { who: 'truong_lao_tong', text: 'Thành… thật sự thành rồi! Nền móng vững như bàn thạch, cột sáng dựng thẳng không nghiêng — lão phu coi kỳ Trúc Cơ của tông ba mươi năm, chưa thấy nền nào chắc như nền này!' },
    { who: 'u_nhan', text: 'Phàm ca! Huynh nghe thấy không — đó là tiếng của huynh đấy, ở cảnh giới Trúc Cơ! Từ nay không ai, không ai được nói huynh là phế vật nữa!' },
    { who: 'narrate', text: 'Từ một phàm nhân bị cả trấn phán là phế căn câm điếc, tới tu sĩ Trúc Cơ đứng giữa cột sáng của Thanh Vân Tông — quãng đường ấy đúng một năm, mà nhìn lại dài như một đời người. Và ngươi biết, đây mới chỉ là bậc thềm thứ hai của con đường dài phía trước.' }
  ];

  var SCENE_THU_TIENG = [
    { who: 'narrate', text: 'Đại điện Thanh Vân Tông, ba ngày sau kỳ đột phá. Trưởng lão cho gọi ngươi lên, và trước mặt các đệ tử đang đứng chầu, ông tự tay mở cuốn hồ sơ nhập môn của ngươi — trang đầu vẫn còn ba chữ viết ngay ngắn từ ngày ngươi mới tới: vô linh căn.' },
    { who: 'truong_lao_tong', text: 'Hôm nay, trước mặt cả điện, ta sửa lại cuốn hồ sơ này. (Ông cầm bút, gạch một nét thẳng qua hai chữ "vô linh căn", rồi viết lại bên dưới, từng chữ rõ ràng:) "Vô Cực Linh Căn — đệ tử Trúc Cơ." Từ nay, hồ sơ của Thanh Vân Tông ghi về ngươi như thế.' },
    { who: 'truong_lao_tong', text: 'Và đây là tông thưởng cho đệ tử đột phá Trúc Cơ thành công trong kỳ: ba mươi viên Linh Thạch. Nhận lấy. Khoản này không phải bố thí — là thứ ngươi tự kiếm được, như mọi khoản khác trên đường ngươi đã đi.' },
    { who: 'hoa_huong_than', text: 'Từ nay trong tông, ai muốn tìm Giang Phàm, cứ hỏi tới hàng đệ tử Trúc Cơ. Ta nói trước để khỏi ai tìm nhầm xuống khu tạp dịch.' },
    { who: 'lieu_khuynh_tien', text: 'Hồ sơ sửa được bằng một nét bút. Còn con người thì không cần sửa gì cả — từ ngày đầu lên đài của ta, ngươi đã không phải thứ mà ba chữ kia nói. Ta chỉ chờ xem, ngươi còn đi tới đâu nữa.' },
    { who: 'hero', mode: 'write', text: '(viết) "Ba chữ cũ đã gạch. Đường sau này, đệ tử tự viết tiếp."' }
  ];

  var SCENE_END_P2 = [
    { who: 'narrate', text: 'Chiều xuống. Ngươi đứng một mình ở sơn môn Thanh Vân Tông, nhìn xuống con đường dài dẫn về phía Cô Châu Thành mờ trong khói lam — nơi có Hứa Gia Trấn nhỏ bé ở cuối tầm mắt, nơi mọi chuyện bắt đầu bằng một bia đá không sáng.' },
    { who: 'narrate', text: 'Nhưng những sợi dây của quãng đường đã qua vẫn chưa sợi nào đứt hẳn: Huyết Bạc Cung chưa dứt, tên cầm đầu trọng thương rút vào rừng sau núi vẫn còn sống; thân phận Hồn Sư thần bí của ngươi vẫn là bí mật chưa một lần lộ ra ánh sáng.' },
    { who: 'narrate', text: 'Thiên Cơ Các vẫn đang theo dõi từng bước đi của ngươi trong những cuốn sổ không ai được xem. Và Liễu Khuynh Tiên — người con gái mà hình chiếu của nàng ngươi đã thắng, còn con người thật của nàng thì chưa — vẫn là một ẩn số đứng giữa gió cao của ngọn núi này.' },
    { who: 'u_nhan', text: 'Phàm ca, gió trên sơn môn lạnh lắm. Về thôi — chặng đường tới, dù huynh đi tới đâu, muội vẫn sẽ tìm được đường lên đứng cạnh huynh như hôm nay.' },
    { who: 'narrate', text: 'Gió trên sơn môn vẫn thổi, mây vẫn trôi qua bậc đá. Câu chuyện của chàng trai từng bị cả trấn phán là phế căn — vẫn đang được viết tiếp, từng ngày, bằng chính đôi chân của chàng.' }
  ];

  /* ================= PHẦN 3 — CHƯƠNG 9: TIN DỮ TỪ THUNG LŨNG HỒI PHONG ====
     Toàn bộ chương là [GAME SÁNG TÁC] trên phác thảo đã duyệt. Kỷ luật
     thoại: cả chương tối đa MỘT câu cất lời trong một lượt chơi — hoặc câu
     cứu người ở điểm lựa chọn, hoặc câu ở cảnh đối đầu của nhánh im lặng. */
  var SCENE_CH9_TIN_DU = [
    { who: 'narrate', text: 'Ba ngày sau khi hồ sơ của ngươi được sửa lại, sơn môn Thanh Vân Tông đón một người khách không ai ngờ tới: một gia nhân Hứa gia, áo còn nguyên bụi đường, ngựa ngã quỵ ngay dưới bậc đá.' },
    { who: 'tin_su', text: 'Giang… Giang công tử! Tiểu nhân chạy chết hai con ngựa mới lên được tới đây. Đoàn xe của Hứa gia… bị đánh úp rồi!' },
    { who: 'truong_lao_tong', text: 'Nói cho rõ. Đoàn xe nào, đi đâu, bị đánh ở đâu?' },
    { who: 'tin_su', text: 'Đoàn đưa gia chủ về Hứa Gia Trấn thăm mộ phần tổ tiên, mang theo thuốc và đồ tiếp tế cho trấn. Tới Thung Lũng Hồi Phong thì hai đầu thung lũng bị chặn cùng một lúc — đá lăn bịt cửa trước, người áo xám bịt cửa sau. Không phải cướp đường. Chúng làm việc như quân đội.' },
    { who: 'tin_su', text: 'Đại tiểu thư U Nhàn đi cùng đoàn. Gia chủ… gia chủ bị thương ở vai, người của đoàn chạy thoát được có mỗi tiểu nhân, theo lệnh của đại tiểu thư.' },
    { who: 'lieu_khuynh_tien', text: 'Bịt cả hai đầu thung lũng cùng một khắc, lại chọn đúng đoàn của Hứa gia, đúng lúc ngươi vừa Trúc Cơ và tiếng tăm đang lan. Đây không phải đánh cướp. Đây là một nước cờ có người bày sẵn.' },
    { who: 'hoa_huong_than', text: 'Giang Phàm, ta đi cùng ngươi. Lần này không phải hộ pháp trên đài — lần này là xuống núi cứu người thật.' },
    { who: 'hero', mode: 'write', text: '(viết) "Đi ngay. Trên đường, kể hết những gì ngươi nhớ: số người, hướng rút, dấu hiệu trên áo chúng."' },
    { who: 'narrate', text: 'Trưởng lão không ngăn. Ông chỉ nhìn theo đoàn người xuống núi, rồi quay sang đệ tử trực điện, nói một câu rất khẽ: "Ghi lại giờ này. Và báo cho Thiên Cơ Các phân đà — không, khoan. Để xem chúng tự tìm tới hay không."' }
  ];
  var SCENE_CH9_UNHAN_PLAN = [
    { who: 'narrate', text: 'Cùng lúc ấy, trong Thung Lũng Hồi Phong. Đoàn xe bị dồn vào một bãi trống giữa thung lũng, xe nối xe thành vòng, người bị thương nằm ở giữa.' },
    { who: 'u_nhan', text: 'Nghe ta nói, và không ai được hoảng. Cha bị thương ở vai, mất máu thì nguy, nhưng đoàn này chưa thua. Chúng chặn hai đầu là muốn ta ngồi yên chờ chết dần — ta sẽ không ngồi yên.' },
    { who: 'gia_nhan', text: 'Đại tiểu thư, chúng đông gấp ba ta, lại giữ cả hai cửa thung lũng…' },
    { who: 'u_nhan', text: 'Đông thì phải ăn, phải ngủ, phải đổi gác. Ta cần ba việc. Một: cử người khỏe nhất trèo vách đá phía tây lúc chạng vạng, mang tin ra ngoài — đi một mình, không mang kiếm, chỉ mang giày vải.' },
    { who: 'u_nhan', text: 'Hai: tháo hết đèn lồng trên xe, đổ dầu ra riêng. Đêm nay nếu chúng tràn vào, ta đốt một vòng lửa quanh vòng xe — chúng muốn bắt sống người, sẽ không dám xông qua lửa ngay.' },
    { who: 'u_nhan', text: 'Ba: phần thuốc trong xe chia làm hai. Một nửa giữ ở xe giữa cho người bị thương. Một nửa… ta mang theo người. Nếu vòng xe vỡ, ta là người chúng muốn bắt nhất — ta sẽ chạy về phía cửa đông, kéo chúng đuổi theo ta, để cha và mọi người rút theo vách tây.' },
    { who: 'chinh_ngon', text: 'U Nhàn. Con định lấy chính mình làm mồi.' },
    { who: 'u_nhan', text: 'Không phải làm mồi, cha. Là làm người quyết định. Mười năm nay con nhìn người khác quyết thay con đủ rồi. Lần này, con tự quyết — và con sẽ tự chịu phần nguy hiểm nhất của quyết định ấy.' },
    { who: 'narrate', text: 'Nàng nói xong thì tự tay xé vạt áo, băng lại vai cho cha, rồi đứng lên nóc xe giữa bãi, nhìn về phía cửa thung lũng đang bị bịt kín. Không một chút run sợ nào trong dáng đứng ấy.' }
  ];
  var SCENE_CH9_TRUY_VET = [
    { who: 'narrate', text: 'Cửa tây Thung Lũng Hồi Phong. Một cây anh đào cổ thụ đứng ngay bên đường vào thung lũng, gốc to ba người ôm, hoa nở trái mùa rụng đầy trên những tảng đá lăn vừa bị đẩy xuống bịt kín lối đi.' },
    { who: 'hoa_huong_than', text: 'Đá này không phải đá lở. Vết đục còn mới, đòn bẩy gác sẵn bên vách. Chúng chuẩn bị chỗ này từ nhiều ngày trước — có khi từ trước cả kỳ Trúc Cơ của ngươi.' },
    { who: 'narrate', text: 'Dưới gốc anh đào, ngươi tìm thấy ba thứ: một vệt máu đã khô trên đá, một đoạn dây thừng bị cắt ngọt bằng kiếm, và một mũi tên gãy cắm trên thân cây — trên thân tên khắc một vệt đỏ thẫm như máu khô.' },
    { who: 'hero', mode: 'write', text: '(viết) "Huyết Bạc Cung. Nhưng lần này khác hai lần trước: chúng không đánh rồi rút. Chúng dựng cả một cái bẫy và ngồi chờ bên trong."' },
    { who: 'lieu_khuynh_tien', text: 'Ta đi vòng lên sườn đông xem cửa bên kia. Nếu cả hai cửa đều bị bịt bằng đá đục sẵn, thì trong thung lũng phải có một lối thứ ba mà chỉ chúng biết — lối chúng dùng để ra vào. Tìm được lối ấy là tìm được đường cứu người.' },
    { who: 'narrate', text: 'Từ sâu trong thung lũng, một tiếng tù và ngắn vang lên — rồi im bặt. Không phải tiếng tấn công. Là tiếng điểm danh đổi gác. Kẻ địch của ngươi có kỷ luật, có ca kíp, có người chỉ huy đang ngồi đâu đó giữa thung lũng này.' }
  ];
  var CH9_CHOICE = {
    who: 'choice', text: 'Vòng vây còn hai mươi bước. Ngươi sẽ…',
    options: [
      { label: '[Cất lời] Hét xuống bãi trống — phá vòng vây ngay, cứu người ngay', action: 'ch9_say' },
      { label: 'Im lặng — men vách đá phía tây, đi đường vòng vào sau lưng vòng xe', action: 'ch9_silent' }
    ]
  };
  var SCENE_CH9_PHUC_KICH = [
    { who: 'narrate', text: 'Ngươi theo lối mòn ven suối lách vào giữa thung lũng. Từ trên mỏm đá, bãi trống hiện ra phía dưới: vòng xe của Hứa gia, vòng lửa đã tắt từ lúc nào, và người của Huyết Bạc Cung đang khép vòng vây cuối cùng.' },
    { who: 'narrate', text: 'Rồi ngươi thấy U Nhàn. Nàng đứng một mình ở khoảng trống phía đông vòng xe, kiếm trong tay, cố ý tách khỏi đoàn — đúng như kế của nàng: kéo toàn bộ sự chú ý về phía mình. Tên chỉ huy của địch đã mắc câu, nhưng theo cách tệ nhất: hắn ra lệnh bắt đầu siết vòng, và mũi nhọn của vòng vây đang chĩa thẳng vào nàng.' },
    { who: 'mo_cuu_u', text: 'Hứa U Nhàn. Ngươi tự tách ra thì đừng trách bọn ta không khách khí. Bắt sống cô ta. Còn gia chủ của các ngươi — để ông ta xem con gái mình bị đưa đi, ông ta sẽ tự biết phải giao ra thứ gì.' },
    { who: 'narrate', text: 'Vòng vây còn cách U Nhàn hai mươi bước. Ngươi đang ở trên mỏm đá, Tĩnh Âm đầy sau nhiều ngày lắng nghe — một tiếng hét từ đây sẽ dội xuống cả bãi trống, và sóng âm thô của nó có thể khóa đúng cộng hưởng của cả bãi mà phá vòng vây ngay lập tức, nhưng cũng sẽ tuyên bố cho mọi kẻ có mặt ở đây biết: Giang Phàm đang ở trong thung lũng này, và hắn không hề câm điếc như lời đồn.' },
    { who: 'narrate', text: 'Đường vòng cũng có: men theo vách đá phía tây, lặng lẽ tới sau lưng vòng xe, nhập vào đoàn của U Nhàn mà không một tiếng động — chậm hơn, và trong lúc ngươi đi vòng, vòng vây vẫn đang siết lại quanh nàng.' },
    CH9_CHOICE
  ];
  var SCENE_CH9_SAY_RESCUE = [
    { who: 'hero', mode: 'say', text: 'TRÁNH RA.' },
    { who: 'narrate', text: 'Hai chữ từ mỏm đá dội xuống, sóng âm quét qua bãi trống như một bức tường vô hình. Hàng đầu của vòng vây bị hất ngã ngồi xuống đất, mấy tên ôm tai quỵ gối, vòng vây đang khép kín vỡ ra một khoảng trống lớn ngay trước mặt U Nhàn.' },
    { who: 'u_nhan', text: 'Phàm ca! Muội biết huynh sẽ tới — nhưng huynh lại cất tiếng thật rồi… Thôi, người an toàn trước đã. Đoàn xe, theo ta! Rút về phía mỏm đá, nhanh!' },
    { who: 'mo_cuu_u', text: '(từ xa, lau máu ở khóe miệng) Tốt. Rất tốt. Cung chủ đoán không sai một chữ: chỉ cần động tới người của Hứa gia, con cá sẽ tự nhảy lên khỏi mặt nước. Giang Phàm — tiếng nói của ngươi, bọn ta đã nghe tận tai rồi.' },
    { who: 'narrate', text: 'Người của đoàn Hứa gia thoát qua khoảng trống ấy, không ai mất mạng. Nhưng ngươi hiểu cái giá ngay khi nhìn thấy nụ cười của tên chỉ huy lúc rút lui: từ hôm nay, Huyết Bạc Cung không còn phải đoán nữa. Chúng biết chắc ngươi cất được tiếng — và dư âm của tiếng hét ấy còn rung lại trong thung lũng cho kẻ biết nghe lần theo.' }
  ];
  var SCENE_CH9_SILENT_ROUTE = [
    { who: 'narrate', text: 'Ngươi quay lưng khỏi mỏm đá, ép mình vào vách đá phía tây và đi xuống từng tấc một. Mỗi bước là một lần nghe tiếng vòng vây siết lại gần U Nhàn hơn. Mười tám năm im lặng dạy ngươi đi không một tiếng động — nhưng chưa bao giờ việc im lặng lại nặng như lúc này.' },
    { who: 'narrate', text: 'Ngươi vào tới sau lưng vòng xe khi vòng vây chỉ còn cách U Nhàn mười bước. Không ai hay biết ngươi đã tới — kể cả nàng. Ngươi chạm nhẹ vào vai gia nhân gác cuối đoàn, giơ ngón tay lên môi, rồi chỉ về phía khe đá phía tây mà Liễu Khuynh Tiên vừa tìm ra.' },
    { who: 'gia_nhan', text: '(thì thầm) Giang… Giang công tử?! Người vào bằng đường nào… Vâng, vâng, tiểu nhân hiểu rồi. Đoàn xe rút theo khe tây, từng người một, không gây tiếng động.' },
    { who: 'u_nhan', text: '(khi thấy ngươi xuất hiện ngay bên cạnh, khẽ tới mức chỉ hai người nghe) Huynh vào được tới đây mà không một tiếng động nào… Được. Vậy thì kế của muội đổi: muội ở lại sau cùng với huynh. Người của đoàn rút trước. Lần này, không ai phải làm mồi một mình nữa.' },
    { who: 'narrate', text: 'Đoàn người thoát qua khe đá trong im lặng. Nhưng đường vòng tốn thời gian: tên gia nhân trẻ nhất của đoàn bị một mũi tên lạc sượt qua cánh tay lúc rút, và phần thuốc mang theo người của U Nhàn phải bỏ lại trên xe để đoàn đi cho nhẹ. Không ai mất mạng — nhưng không phải không ai phải trả giá cho những khắc ngươi chọn im lặng.' }
  ];
  var SCENE_CH9_UNHAN_ACT = [
    { who: 'narrate', text: 'Đoàn người vừa rút khỏi bãi trống thì từ phía cửa đông, một toán Huyết Bạc Cung khác cắt ngang đường rút — toán dự phòng mà tên chỉ huy đã giấu sẵn từ đầu. Đường về khe đá bị chặn. Cả đoàn dồn lại dưới gốc anh đào cổ thụ ở cửa thung lũng.' },
    { who: 'u_nhan', text: 'Đứng hết sau lưng ta. Nghe rõ đây: toán này ít người, chúng chỉ dám chặn vì tưởng ta đã kiệt sức sau một đêm. Chúng tính sai một việc — đêm qua ta không ngủ, nhưng ta cũng không ngồi không. Ta đã xem hết địa hình quanh gốc cây này rồi.' },
    { who: 'narrate', text: 'Nàng lùi một bước, gót chân đạp đúng vào sợi dây thừng giấu trong lớp hoa rụng — sợi dây nàng tự tay giăng từ lúc đoàn mới bị dồn vào thung lũng, nối với chồng đá nhỏ và thùng dầu đèn treo trên cành thấp. Đá đổ, dầu tung, một bức tường lửa và khói dựng lên giữa đoàn người và toán chặn đường.' },
    { who: 'u_nhan', text: 'Cái bẫy này ta giăng cho chính ta dùng, không chờ ai tới cứu mới có đất diễn. Phàm ca — phần còn lại, huynh lo phía sau. Phía trước, để muội mở đường.' },
    { who: 'narrate', text: 'U Nhàn xông qua khoảng khói đầu tiên, kiếm đi gọn và dứt khoát. Nàng không chờ được cứu. Nàng đang tự mở đường cho cả đoàn — và cho cả ngươi.' }
  ];
  var SCENE_CH9_DOI_DAU = [
    { who: 'narrate', text: 'Khói tan dần ở cửa thung lũng. Toán chặn đường đã bị đẩy lui — và từ sau gốc anh đào cổ thụ, tên chỉ huy bước ra một mình, áo xám không một vết bụi, tay không cầm kiếm. Hắn đứng cách ngươi mười bước, đúng khoảng cách của một người tới để nói chuyện, không phải để đánh.' },
    { who: 'mo_cuu_u', text: 'Mạc Cửu U, tả sứ của Huyết Bạc Cung. Hôm nay ta không tới để thắng ngươi, Giang Phàm. Ta tới để nhìn tận mắt: đứa con của Giang Trường Không, lớn lên thành thứ gì rồi.' },
    { who: 'hero', mode: 'write', text: '(viết) "Ngươi vừa nói tên ai?"' },
    { who: 'mo_cuu_u', text: 'Phụ thân ngươi. Cái tên ấy, thiên hạ quên gần hết rồi — nhưng Huyết Bạc Cung thì không quên một chữ. Mười hai năm trước, ở bến đò ngang trên sông Bạc, có một vụ án mà mọi sổ sách của Cô Châu Thành đều ghi là tai nạn. Bọn ta gọi nó bằng tên khác.' },
    { who: 'mo_cuu_u', text: 'Ta sẽ không kể hết hôm nay. Kể hết thì ngươi lại không mất ngủ. Ta chỉ để lại một thứ — thứ này vốn là của phụ thân ngươi, cung của ta giữ mười hai năm nay, chờ ngày trả cho đúng người.' },
    { who: 'narrate', text: 'Hắn đặt xuống tảng đá dưới gốc anh đào một miếng ngọc bội hình hai con cá quấn nhau — Song Ngư Ngọc Bội. Một mặt ngọc khắc chữ "Giang" đã mòn, mặt còn lại là một vết nứt chạy dọc, như từng bị một lực rất mạnh đánh trúng.' },
    { who: 'hero', mode: 'write', text: '(viết) "Ngọc bội này từ đâu tới? Ai đưa cho ngươi? Vụ án bến đò là vụ án gì?"' },
    { who: 'mo_cuu_u', text: 'Ba câu hỏi. Ta trả lời một câu thôi: ngọc bội này nhặt được ở bến đò, trong đêm nước sông dâng đỏ. Hai câu còn lại — muốn biết, thì sống cho lâu, tu cho cao, rồi tự tới mà hỏi cung chủ của ta. Bà ấy chờ ngươi còn lâu hơn ta tưởng đấy.' },
    { who: 'narrate', text: 'Hắn quay lưng đi thẳng, không hề đề phòng, như chắc chắn ngươi sẽ không ra tay với một người vừa trả lại di vật của cha mình. Dưới gốc anh đào, hoa rụng xuống mặt ngọc bội từng cánh một. Lần đầu tiên trong đời, ngươi cầm trên tay một thứ thuộc về phụ thân mình — và nó đến từ tay kẻ thù.' }
  ];
  /* Biến thể câu cất lời duy nhất ở cảnh đối đầu — chỉ chạy ở nhánh im lặng:
     chèn giữa thân cảnh đối đầu, trước dòng hắn quay lưng rời đi. */
  var SCENE_CH9_DOI_DAU_SAY = [
    { who: 'hero', mode: 'say', text: 'Đủ rồi.' },
    { who: 'narrate', text: 'Hai chữ ở cự ly mười bước. Mạc Cửu U khựng lại giữa bước chân, mặt đất dưới chân hắn nứt một đường mảnh, hoa anh đào trên cao rung xuống như mưa. Hắn đứng yên một lúc lâu, rồi bật cười — tiếng cười của một kẻ vừa xác nhận được điều mình lặn lội tới đây để xác nhận.' },
    { who: 'mo_cuu_u', text: 'Đúng là con của ông ấy. Đến cả cách nói cũng giống: ít chữ, và không hề có ý định nói câu thứ hai. Được. Hôm nay ta đi. Nhưng Giang Phàm — từ giờ, mỗi lần ngươi cất tiếng, sẽ có người của bọn ta ở đâu đó lắng nghe và ghi lại. Nhớ lấy.' }
  ];
  var SCENE_CH9_HON_DAU = [
    { who: 'narrate', text: 'Đêm đó, khi đoàn người đã an toàn về tới trạm nghỉ dưới chân núi, ngươi quay lại bãi trống một mình để kiểm tra lần cuối. Và ngươi thấy thứ khiến ngươi đứng yên rất lâu.' },
    { who: 'narrate', text: 'Giữa bãi trống, ngay chỗ vòng vây bị phá tan, có một vệt sáng mờ hình sợi tơ còn sót lại trên mặt đá — hồn lực. Không phải của địch: là của chính ngươi. Trong khoảnh khắc hỗn loạn nhất của trận đánh, một tia hồn lực của ngươi đã tự thoát ra ngoài theo bản năng của một Hồn Sư — và chính ngươi cũng không kịp nhận ra.' },
    { who: 'hero', mode: 'write', text: '(viết, tự ghi cho chính mình trong sổ tay) "Hồn lực đã lộ một tia. Trong thung lũng lúc ấy có bao nhiêu đôi mắt? Của địch — và còn của ai nữa?"' },
    { who: 'narrate', text: 'Câu trả lời tới ngay trong đêm. Ở trạm nghỉ, một con chim ưng xám đáp xuống tay người gác trạm — chân buộc một ống thư nhỏ không đề tên người gửi, chỉ đóng một dấu triện mà ngươi đã từng thấy một lần: dấu của Thiên Cơ Các.' },
    { who: 'tran_chinh_dao', text: '(trong thư) "Cậu Giang. Ở Thung Lũng Hồi Phong hôm nay, các này ghi được một vệt hồn lực không có trong bất kỳ danh sách Hồn Sư nào của thiên hạ. Ta không hỏi cậu là ai trong thư này. Ta chỉ báo trước một câu, vì kính trọng cách cậu xử sự ở Hứa gia ngày trước: ngày mai, người của các sẽ tới gặp cậu — và lần này, họ tới không phải vì Lục Tranh." — Trần Chính Đạo.' },
    { who: 'narrate', text: 'Ngươi gấp thư lại. Bí mật ngươi giữ từ trước cả khi tới Hứa gia — bí mật mà cả Cô Châu Thành không một ai biết — vừa rò ra ánh sáng lần đầu tiên. Và nơi đang cầm đầu mối của nó, là nơi nắm mọi bí mật của thiên hạ.' }
  ];
  var SCENE_CH9_END = [
    { who: 'narrate', text: 'Sáng hôm sau, đoàn Hứa gia lên đường về trấn trong sự hộ tống của đệ tử Thanh Vân Tông. Hứa Chính Ngôn, vai còn băng bó, nắm tay ngươi rất lâu trước khi lên xe.' },
    { who: 'chinh_ngon', text: 'Phàm nhi. Cha con ngày xưa cứu ta một mạng ở nơi còn nguy hiểm hơn thung lũng này. Ta chưa từng kể cho con nghe chuyện ấy — vì có những phần, chính ta cũng chỉ biết một nửa. Ngọc bội kia… giữ cho kỹ. Đến ngày con biết hết, có lẽ nhà này nợ nhà con không chỉ một mạng.' },
    { who: 'u_nhan', text: 'Phàm ca, muội về trấn lo cho cha và trấn an người trong nhà. Chuyện Thiên Cơ Các — huynh đừng đối mặt một mình. Khi nào huynh cần một người đứng cạnh, dù là đứng cạnh để im lặng cùng huynh, muội sẽ có mặt. Lần này muội nói trước, để huynh khỏi phải đoán.' },
    { who: 'narrate', text: 'Huyết Bạc Cung đã từ bóng ma trong rừng thành một thế lực bày trận có tên, có người, có món nợ mười hai năm. Và ở phía chân trời, Thiên Cơ Các đang đi tới — vì bí mật thứ hai của ngươi.' }
  ];
  /* Cảnh gặp riêng ở thung lũng (bể theo bản đồ, không gộp vào bể chung). */
  var SCENE_UNHAN_HOI_PHONG = [
    { who: 'u_nhan', text: 'Phàm ca, đoàn đã an toàn. Phần còn lại trong thung lũng này — vết tích, người của chúng còn sót, và cả gốc anh đào kia — huynh xem cho kỹ rồi hãy đi. Muội chờ ở trạm nghỉ.' }
  ];
  var SCENE_TULINH_HOI_PHONG = [
    { who: 'tran_tu_linh', text: 'Ta nghe tin đoàn Hứa gia bị vây là chạy tới ngay, nhưng tới nơi thì mọi chuyện đã xong. Giang công tử — có một việc lạ: dọc đường ta gặp một người của Thiên Cơ Các đi ngược chiều. Hắn không tới cứu ai cả. Hắn tới để ghi chép.' }
  ];

  /* ================= PHẦN 3 — CHƯƠNG 10: TĨNH QUAN LÂU =================
     Phân nhánh trung tâm của phần: tự mình nói ra (đường A) hoặc giữ im
     lặng để sự thật bị kẻ khác tung ra (đường B). Hai đường hội tụ ở cùng
     mốc cảnh giới nhưng dư âm khác nhau sống tiếp sang chương 11. */
  var SCENE_CH10_MOI = [
    { who: 'narrate', text: 'Trước cửa phân đà Thiên Cơ Các, Trần Chính Đạo đã đứng chờ sẵn — như thể ông biết chính xác ngươi sẽ tới vào khắc này.' },
    { who: 'tran_chinh_dao', text: 'Cậu Giang, thư của ta tới tay cậu rồi chứ. Hôm nay các mời cậu vào lầu, không phải để hỏi tội. Là để nói một chuyện mà nói ở ngoài đường thì nguy cho cả cậu lẫn các.' },
    { who: 'tran_chinh_dao', text: 'Người tiếp cậu bên trong là Bạch Kính Đường, giám sát sứ của các — người giữ hồ sơ về mọi Hồn Sư trong thiên hạ suốt hai mươi năm. Ông ấy đã bay từ tổng đà tới chỉ vì một vệt hồn lực ở Thung Lũng Hồi Phong.' },
    { who: 'hero', mode: 'write', text: '(viết) "Ông biết trước ta sẽ không từ chối."' },
    { who: 'tran_chinh_dao', text: 'Ta biết cậu không có đường lui nào tốt hơn. Vào đi — cửa lầu hôm nay chỉ mở cho một mình cậu.' }
  ];
  var SCENE_CH10_VAO_LAU = [
    { who: 'narrate', text: 'Phòng kín phía bắc Tĩnh Quan Lâu không có cửa sổ. Trên án dài, hồ sơ được xếp thành từng chồng theo năm tháng — và chồng trên cùng mang tên của ngươi.' },
    { who: 'bach_kinh_duong', text: 'Ngồi đi, cậu Giang. Ta là Bạch Kính Đường. Hai mươi năm nay ta làm một việc duy nhất: ghi lại mọi Hồn Sư xuất hiện trong thiên hạ. Danh sách của ta có một trăm mười bảy cái tên. Cho tới tháng trước, tên của cậu không nằm trong đó.' },
    { who: 'bach_kinh_duong', text: 'Đừng vội căng thẳng. Người của Thiên Cơ Các ngồi trong phòng này không mang theo kiếm. Ta chỉ mang theo giấy — và trí nhớ của một ông già đã xem quá nhiều hồ sơ bị người ta sửa.' },
    { who: 'hero', mode: 'write', text: '(viết) "Ông muốn gì ở ta?"' },
    { who: 'bach_kinh_duong', text: 'Muốn nghe cậu nói. Theo cách của cậu. — Ký lục quan, mở hồ sơ Hồi Phong. Ta sẽ đọc lại những gì các đã ghi được, và cậu sẽ thấy: có chỗ chúng ta biết chắc, có chỗ chúng ta chỉ đoán, và có một chỗ… chúng ta cố ý ghi sai, để xem cậu có sửa hay không.' }
  ];
  var SCENE_CH10_SIET = [
    { who: 'bach_kinh_duong', text: 'Vòng thứ nhất trong hồ sơ: một đêm ở Trần gia, một người bệnh thần hồn nguy kịch được cứu mà không thầy thuốc nào vào phòng. Các ghi: có Hồn Sư ra tay, không rõ phẩm cấp. Chỗ này — chúng ta đoán.' },
    { who: 'bach_kinh_duong', text: 'Vòng thứ hai: đêm phủ Hứa bị tấn công. Ba tên Huyết Bạc Cung chết không một vết thương ngoài, thần hồn tán loạn như bị ai rút ra khỏi xác. Các ghi: Hồn Sư nhị phẩm trở lên. Chỗ này — chúng ta gần như chắc.' },
    { who: 'bach_kinh_duong', text: 'Vòng thứ ba: Thung Lũng Hồi Phong. Vệt hồn lực trên mặt đá, đo được, so được, không chối được. Và hồ sơ của ta ghi một câu thế này: "Giang Phàm chữa hồn cho Trần gia vào tháng ba, trước mặt mười hai nhân chứng."' },
    { who: 'hero', mode: 'write', text: '(viết) "Sai hai chỗ. Không phải tháng ba. Và không có nhân chứng nào — đêm ấy trong phòng chỉ có người bệnh và ta."' },
    { who: 'bach_kinh_duong', text: '(cười khẽ) Tốt. Cậu vừa tự sửa hồ sơ của chính mình — và vừa tự xác nhận hai vòng đầu đều là thật, chỉ sai chi tiết ta cố ý đặt. Cậu Giang, cậu thành thật hơn nhiều kẻ biết nói.' },
    { who: 'narrate', text: 'Ký lục quan lặng lẽ gạch hai dòng trong hồ sơ, viết lại theo lời sửa của ngươi. Trong phòng kín bỗng yên tĩnh hẳn — phần đọc hồ sơ đã xong. Phần khó hơn bắt đầu bây giờ.' }
  ];
  var CH10_CHOICE = {
    who: 'choice', text: 'Bạch Kính Đường chờ câu trả lời của ngươi.',
    options: [
      { label: 'Tự mình nói ra — viết rõ thân phận, rồi cất một lời làm chứng', action: 'ch10_tu_lo' },
      { label: 'Giữ im lặng — không nhận, không chối, rời khỏi phòng này', action: 'ch10_im_lang' }
    ]
  };
  var SCENE_CH10_LO_CHOICE = [
    { who: 'bach_kinh_duong', text: 'Giờ ta hỏi thẳng, và cậu chỉ cần trả lời một lần. Thiên Cơ Các có hai cách xử lý một Hồn Sư không có trong danh sách. Cách một: ghi tên cậu vào, đóng dấu hợp tác — từ nay cậu là Hồn Sư được các công nhận, đổi lại các được biết cậu là ai, ở đâu, mạnh tới đâu.' },
    { who: 'bach_kinh_duong', text: 'Cách hai: cậu không nhận gì cả. Vậy thì theo lệ, hồ sơ của cậu sẽ là "Hồn Sư lai lịch bất minh, chưa rõ thiện ác" — và cái tiếng ấy sẽ đi theo cậu tới mọi nơi có tai của Thiên Cơ Các. Cậu chọn cách nào — tự mình nói ra, hay để thiên hạ nói thay?' },
    CH10_CHOICE
  ];
  var SCENE_CH10_TU_LO = [
    { who: 'hero', mode: 'write', text: '(viết) "Ta là Giang Phàm. Hồn Sư nhị phẩm. Ta chữa hồn, không hại hồn. Viết vào hồ sơ của ông như thế — nguyên văn."' },
    { who: 'hero', mode: 'say', text: 'Ta là Hồn Sư.' },
    { who: 'narrate', text: 'Bốn chữ nói ra giữa phòng kín, không lớn, nhưng ký lục quan ngẩng phắt lên: bút của nàng dừng giữa trang giấy. Bạch Kính Đường nhìn ngươi rất lâu, rồi tự tay cầm bút, viết vào hồ sơ bốn chữ ấy, đóng triện của giám sát sứ ngay bên dưới.' },
    { who: 'bach_kinh_duong', text: 'Hai mươi năm giữ hồ sơ, đây là lần đầu một Hồn Sư tự đọc cho ta ghi. Cậu Giang — Thiên Cơ Các nhận lời của cậu. Ngọc giản này là tín vật hợp tác: từ nay, tin tức của các về Huyết Bạc Cung, cậu được xem phần liên quan tới mình.' },
    { who: 'bach_kinh_duong', text: 'Và một thứ nữa, ngoài lệ: trong hồ sơ cũ có một mảnh về vụ bến đò trên sông Bạc năm xưa. Cậu chưa nên xem hết hôm nay — nhưng hãy biết: các giữ nó, và nó chưa từng bị đốt.' }
  ];
  var SCENE_CH10_BI_LO_1 = [
    { who: 'narrate', text: 'Ngươi đứng dậy, khẽ lắc đầu, và bước ra khỏi phòng kín mà không viết một chữ nào. Sau lưng, Bạch Kính Đường thở dài rất khẽ — tiếng thở của một người già vừa nhìn thấy một việc sắp hỏng mà không được phép ngăn.' },
    { who: 'bach_kinh_duong', text: 'Vậy thì theo lệ. Ký lục quan — đóng hồ sơ này lại, ghi đúng một dòng: lai lịch bất minh. Và chuẩn bị tinh thần: dư âm không biết nói dối — khi các không nói, kẻ khác sẽ lần theo nó mà tìm ra cậu, bằng cách xấu nhất mà chúng tìm được.' }
  ];
  var SCENE_CH10_BI_LO_2 = [
    { who: 'narrate', text: 'Ba ngày sau, chợ Cô Châu Thành. Tin đồn chạy nhanh hơn ngựa: "đệ tử Thanh Vân Tông họ Giang là Hồn Sư giấu mặt", "chữa hồn là vỏ, rút hồn người sống mới là thật" — mỗi người kể lại thêm một chút ác ý.' },
    { who: 'narrate', text: 'Người kể to nhất ở giữa chợ là một kẻ lạ mặt mà ai tinh mắt cũng nhận ra vệt đỏ thẫm trên tay áo. Huyết Bạc Cung đã tung tin này ra — chúng biết chuyện ở Tĩnh Quan Lâu sớm tới mức chỉ có thể là có tai trong hàng ngũ nào đó của các, hoặc của tông.' },
    { who: 'narrate', text: 'Ở sân phủ Hứa, Hứa U Nhàn nghe hết câu chuyện từ miệng một người bán hàng rong — trước khi ngươi kịp nói với nàng một lời nào. Nàng đứng rất lâu bên giếng, rồi chỉ nói với gia nhân một câu: "Khi nào chàng về, bảo chàng ta chờ ở sân sau."' }
  ];
  var SCENE_CH10_END_A = [
    { who: 'narrate', text: 'Tối ấy, ở sân sau Tĩnh Quan Lâu, linh khí tụ về như sương xuống. Ngươi ngồi trên nền đá nhỏ, chu thiên vận hành trọn vẹn một vòng lớn — Trúc Cơ Hậu Kỳ, lặng lẽ như cách ngươi vẫn bước qua mọi ngưỡng của đời mình.' },
    { who: 'tran_tu_linh', text: '(đứng ở cổng sân sau, nói rất khẽ) Ta không vào đâu. Chỉ đứng đây để nếu có ai hỏi, ta nói được rằng: đêm ấy cậu ấy đột phá đường hoàng, không giấu ai điều gì nữa.' }
  ];
  var SCENE_CH10_END_B = [
    { who: 'narrate', text: 'Đêm ấy, ở sân sau Tĩnh Quan Lâu, ngươi ngồi thổ nạp một mình với đầy ngực những lời đồn chưa kịp dẹp. Chu thiên vẫn vận hành trọn vẹn — Trúc Cơ Hậu Kỳ. Sự thật có thể bị nói thay, nhưng cảnh giới thì không ai đột phá thay ngươi được.' }
  ];

  /* ================= PHẦN 3 — CHƯƠNG 11: HỆ QUẢ VÀ LỰA CHỌN ============= */
  var SCENE_CH11_HE_QUA_A = [
    { who: 'truong_lao_tong', text: 'Giang Phàm. Tin từ Thiên Cơ Các đã về tới tông trước cả ngươi: Hồn Sư nhị phẩm, hợp tác có đóng triện. Có đệ tử xì xào sau lưng ngươi hai hôm nay — ta đã phạt kẻ xì xào ấy đi quét sân, không phải vì ngươi, mà vì tông này không nuôi thói đồn nhảm.' },
    { who: 'truong_lao_tong', text: 'Đứng thẳng mà đi. Từ nay ai hỏi, ngươi là đệ tử Thanh Vân Tông kiêm Hồn Sư được Thiên Cơ Các công nhận. Tông không giấu ngươi, ngươi cũng đừng tự giấu mình nữa.' },
    { who: 'narrate', text: 'Cùng ngày, ủy thác đầu tiên của Thiên Cơ Các tới: một thương nhân ở Cô Châu Thành bị tổn thương thần hồn sau chuyến buôn qua sông Bạc. Người ta mời đích danh "Hồn Sư Giang Phàm" — lần đầu tiên trong đời, cái tên ấy được gọi công khai kèm hai chữ Hồn Sư.' }
  ];
  var SCENE_CH11_HE_QUA_B = [
    { who: 'truong_lao_tong', text: 'Giang Phàm, ta nghe hết rồi — cả phần thật lẫn phần đồn thổi thêm. Ngồi xuống. Ta hỏi một câu thôi: chuyện Hồn Sư, là thật chứ?' },
    { who: 'hero', mode: 'write', text: '(viết) "Thật. Đệ tử là Hồn Sư nhị phẩm. Giấu vì chưa tới lúc nói, không phải vì việc ấy xấu."' },
    { who: 'truong_lao_tong', text: 'Đủ rồi. Giấu một việc không xấu vì chưa tới lúc — tông này chứa được. Nhưng từ nay, trong sân tông này, ngươi luyện hồn công khai cho ta xem một lần. Để tin đồn hết đất mà sống.' },
    { who: 'narrate', text: 'Chiều ấy, ngươi chữa thần hồn cho một đệ tử bị thương khi luyện công, ngay giữa sân luyện, trước mặt bao nhiêu đồng môn. Không một ai quay đi. Tin đồn ngoài chợ vẫn còn — nhưng trong tông, nó chết từ chiều hôm đó.' }
  ];
  var SCENE_CH11_CLINIC_A = [
    { who: 'tran_tu_linh', text: 'Ủy thác của Thiên Cơ Các lại tới, Giang công tử. Lần này người bệnh ở ngay Cô Châu Thành — họ chỉ đích danh cậu, và trả công khai theo giá của các: 40 Linh Thạch.' },
    { who: 'narrate', text: 'Ngươi chữa xong trong một buổi. Lần đầu tiên, việc chữa hồn của ngươi diễn ra giữa ban ngày, có người ghi chép, có người trả công đàng hoàng — không còn là một bí mật phải giấu trong đêm nữa.' }
  ];
  var SCENE_CH11_SECT_SOUL_B = [
    { who: 'hoa_huong_than', text: 'Giang Phàm, có một đệ tử luyện công bị tổn thương thần hồn nhẹ. Trưởng lão nói: để ngươi chữa, công khai, ở sân luyện — việc của tông, ghi công 20 Linh Thạch. Hắn còn nói thêm: chữa trước mặt mọi người một lần nữa, cho tin đồn hết đường quay lại.' },
    { who: 'narrate', text: 'Ngươi chữa ngay tại sân luyện. Đệ tử kia tỉnh lại, việc xong trong nửa buổi — và không một đồng môn nào còn nhắc tới hai chữ "lai lịch bất minh" nữa.' }
  ];
  var SCENE_CH11_BENH = [
    { who: 'cho_a', text: 'Cậu Giang! Lại có kẻ ở chợ này vừa kể chuyện "Hồn Sư rút hồn" đấy — ta đuổi nó đi rồi. Người đưa tin của Hứa gia hôm ở thung lũng kể khắp xóm ta nghe: hôm ấy chính mắt cậu ta thấy cậu cứu cả đoàn xe. Chợ này còn ai tin lời đồn, ta không bán hàng cho kẻ ấy nữa!' },
    { who: 'narrate', text: 'Lời bênh vực đầu tiên ngươi nhận được sau khi thân phận lộ ra không đến từ tông môn hay Thiên Cơ Các — nó đến từ một người bán hàng rong ở chợ, và một người đưa tin chạy chết hai con ngựa.' }
  ];
  var SCENE_CH11_CHUA_GIA_NHAN = [
    { who: 'gia_nhan', text: 'Giang công tử… cánh tay tiểu nhân từ hôm ở thung lũng cứ tê đi từng cơn, đêm về là mơ thấy tên bay. Đại tiểu thư bảo đó không phải vết thương ngoài da — bảo tiểu nhân chờ công tử về.' },
    { who: 'narrate', text: 'Ngươi đặt tay lên trán cậu gia nhân trẻ. Vết tên sượt ngoài da đã lành từ lâu — thứ chưa lành là thần hồn bị chấn động trong khoảnh khắc sinh tử ấy, và phần thuốc đáng lẽ chữa được nó đã bị bỏ lại trên xe trong thung lũng, vì ngươi chọn im lặng. Ngươi chữa cho cậu ta trọn một buổi, chậm rãi và cẩn thận hơn mọi lần — như trả một món nợ mà chỉ mình ngươi biết.' },
    { who: 'gia_nhan', text: 'Hết tê rồi! Đầu cũng nhẹ hẳn. Công tử — hôm ấy nếu không có công tử đi đường vòng vào, cả đoàn đã không ai về được. Vết này có ở lại suốt đời, tiểu nhân cũng không oán một lời.' }
  ];
  var SCENE_CH11_U_NHAN = [
    { who: 'u_nhan', text: 'Phàm ca. Muội tới không phải để hỏi chuyện Hồn Sư — chuyện ấy, thiên hạ nói gì kệ thiên hạ. Muội tới để nói chuyện của muội, và muội cần huynh nghe hết, không chen vào — như mọi lần huynh vẫn nghe.' },
    { who: 'u_nhan', text: 'Tờ hôn thư giữa hai nhà viết từ mười năm trước, khi cả hai ta còn chưa biết chữ "không" viết thế nào. Mười năm nay, nó nằm trong hòm của nhà muội như một tờ giấy nợ: nợ danh phận, nợ lời hứa của người lớn, nợ cả những năm huynh bị người ta chê cười vì nó.' },
    { who: 'u_nhan', text: 'Ngày mai muội lên Thanh Vân Tông. Muội sẽ trao lại tờ hôn thư ấy trước mặt trưởng lão của huynh — và đặt cạnh nó một tờ khác, do chính tay muội viết. Không phải từ hôn. Là tự thư: từ nay, việc của Hứa U Nhàn và Giang Phàm, không do một tờ giấy mười năm quyết nữa. Do hai người tự quyết, mỗi ngày một lần, như người trưởng thành.' },
    { who: 'hero', mode: 'write', text: '(viết) "Việc ấy sẽ làm khó nàng ở Hứa gia. Phu nhân sẽ không để yên."' },
    { who: 'u_nhan', text: 'Muội biết cái giá rồi, Phàm ca. Mẫu thân đã nói trước: nếu muội tự ý việc này, phần thừa kế trưởng nữ của muội sẽ bị cắt. Muội tính hết rồi — và muội vẫn đi. Huynh đừng cứu muội khỏi cái giá của chính lựa chọn của muội. Huynh chỉ cần có mặt ở đó, đứng cạnh muội. Thế là đủ.' }
  ];
  var SCENE_CH11_TU_THU = [
    { who: 'narrate', text: 'Thanh Vân Đại Điện. Hứa U Nhàn bước vào giữa điện trong bộ áo giản dị nhất của nàng, tay cầm hai tờ giấy. Nàng không quỳ, chỉ cúi đầu chào trưởng lão đúng lễ của khách.' },
    { who: 'u_nhan', text: 'Trưởng lão, đệ tử không phải người của tông, xin phép được nói một việc nhà trước điện. Tờ này là hôn thư mười năm của Hứa gia và Giang gia. Hôm nay, trước mặt tông môn của chàng, ta trao lại — không phải để cắt đứt, mà để trả nó về đúng chỗ: một kỷ vật, không phải một xiềng xích.' },
    { who: 'u_nhan', text: 'Tờ này là tự thư của ta, viết đêm qua, chữ của ta, ý của ta. Từ nay đường của ta và Giang Phàm do hai chúng ta tự đi. Ai hỏi, cứ đọc tờ này.' },
    { who: 'truong_lao_tong', text: 'Cô nương. Cô có biết đặt hai tờ giấy này xuống giữa điện của ta nghĩa là gì không? Nghĩa là từ nay, tông môn này là nhân chứng của cô. Hứa gia có đổi ý, cũng phải bước qua cửa điện này mà nói.' },
    { who: 'u_nhan', text: '(quay sang ngươi, mỉm cười lần đầu trong ngày) Xong rồi, Phàm ca. Từ hôm nay, không ai trong hai ta nợ ai một tờ giấy nào nữa.' },
    { who: 'narrate', text: 'Tin về tới Hứa gia ngay chiều ấy. Vương Ánh Phụng nổi giận đúng như dự đoán: phần thừa kế trưởng nữ của U Nhàn bị cắt ngay trong đêm. Nhưng Hứa Chính Ngôn chỉ giữ lại được cho con gái một câu, nhờ người nhắn lên núi: "Nhà này vẫn là nhà của con, khi nào con quay về."' },
    { who: 'narrate', text: 'Trước khi xuống núi, gia nhân của Hứa gia trao cho ngươi một túi nhỏ: 35 Linh Thạch, kèm lời nhắn của gia chủ — "Không phải tiền mua sự im lặng, cũng không phải tiền mua lòng người. Là tiền tạ ơn của một người cha."' }
  ];
  var SCENE_CH11_CHUAN_BI = [
    { who: 'truong_lao_tong', text: 'Trúc Cơ Viên Mãn đang tới gần, và Kết Đan không giống Trúc Cơ: ngươi cần một vật dẫn kết đan — thứ dẫn lối cho kim đan thành hình. Việc chuẩn bị này, ta giao ngươi tự lo một nửa.' },
    { who: 'truong_lao_tong', text: 'Ở bãi bắc Thung Lũng Hồi Phong có một cụm dược dẫn mọc quanh vòng đá cũ — hái một phần về đây. Nhưng nghe kỹ: vật dẫn còn cần Yêu Đan cấp 2 làm tim đan; dược dẫn không tim thì chỉ là cỏ khô. Quanh cụm dược ấy gần đây có một con yêu thú lớn về giữ — cấp của nó vừa tầm ngươi bây giờ.' },
    { who: 'truong_lao_tong', text: 'Việc thứ hai: tu vi phải đầy Trúc Cơ Viên Mãn mới tính chuyện luyện vật dẫn. Điểm thổ nạp của tông hay bờ suối Hồi Phong đều được. Đầy rồi, mang đủ đồ về đây — ta luyện vật dẫn cho ngươi ngay.' }
  ];
  var SCENE_CH11_VIEN_MAN = [
    { who: 'narrate', text: 'Trưởng lão nhìn ngươi một lúc, rồi bỗng gật đầu: "Tu vi của ngươi đã đầy rồi đấy." Ông cho đóng cửa đại điện, tự tay thắp ba nén hương trầm.' },
    { who: 'truong_lao_tong', text: 'Ngồi xuống, ngay tại điện này. Trúc Cơ Viên Mãn không cần đài cao, chỉ cần một người giữ cửa và một cái tâm yên. Ta giữ cửa cho ngươi.' },
    { who: 'narrate', text: 'Chu thiên cuối cùng của Trúc Cơ khép lại êm như mặt nước. Khi ngươi mở mắt, linh khí quanh người đã đổi khác: dày hơn, trầm hơn — Trúc Cơ Viên Mãn. Ngưỡng tiếp theo là một cánh cửa mà cả đời tu sĩ chỉ gõ được một lần: Kết Đan.' }
  ];
  var SCENE_CH11_DUOC = [
    { who: 'narrate', text: 'Bãi bắc Thung Lũng Hồi Phong. Quanh vòng đá cũ phủ rêu, cụm dược dẫn mọc thành vòng tròn kỳ lạ — lá tím sẫm, mặt lá có vân vàng chạy như mạch máu. Ngươi vừa hái được phần đầu tiên thì mặt đất dưới chân rung lên từng nhịp nặng nề.' },
    { who: 'narrate', text: 'Từ sau vòng đá, một con yêu thú lớn bước ra: vai cao hơn người, bờm đá xám dựng đứng, hai mắt đỏ như than hồng. Nó giữ cụm dược này từ lâu — và nó không có ý định nhường cho ai, kể cả một đệ tử Trúc Cơ sắp Kết Đan.' }
  ];
  var KD_CHOICE = {
    who: 'choice', text: 'Yêu thú gầm lên và lao tới. Ngươi sẽ…',
    options: [
      { label: 'Xuất kiếm nghênh địch', action: 'kd_sword' },
      { label: 'Phát một đòn Chấn Âm', action: 'kd_chan' },
      { label: 'Lùi lại giữ thế, tích Tĩnh Âm', action: 'kd_hold' }
    ]
  };
  var SCENE_CH11_DUOC_FIGHT = [
    { who: 'narrate', text: 'Con thú không đánh bừa: nó vòng quanh vòng đá, giữ khoảng cách, chờ ngươi bước vào giữa vòng mới lao tới — như thể nó cũng biết cụm dược sau lưng nó đáng giá nhường nào.' },
    KD_CHOICE
  ];
  var SCENE_CH11_DUOC_END = [
    { who: 'narrate', text: 'Con yêu thú gục xuống bên vòng đá, hơi thở cuối cùng phả vào mặt lá dược dẫn. Ngươi mổ lấy viên Yêu Đan cấp 2 còn ấm trong ngực nó, rồi hái nốt phần dược dẫn cần thiết, gói lại cẩn thận.' },
    { who: 'narrate', text: 'Dược dẫn đã có, tim đan cũng đã có. Việc còn lại là mang cả về đại điện, để trưởng lão luyện thành vật dẫn Kết Đan.' }
  ];
  var KD_FEE_CHOICE = {
    who: 'choice', text: 'Ngươi sẽ trả công luyện thế nào?',
    options: [
      { label: 'Trả 120 Linh Thạch công luyện', action: 'kd_pay' },
      { label: 'Hái thêm hai phần dược dẫn ở thung lũng để thay công luyện', action: 'kd_herb_fee' }
    ]
  };
  var SCENE_CH11_VAT_DAN = [
    { who: 'truong_lao_tong', text: 'Dược dẫn còn tươi, Yêu Đan cấp 2 còn ấm — đủ tim, đủ dẫn. Ta luyện được. Nhưng nghe cho rõ: công luyện vật dẫn kết đan của tông là 120 Linh Thạch. Lò của tông không cháy bằng lời cảm ơn được.' },
    { who: 'truong_lao_tong', text: 'Không muốn trả bằng Linh Thạch cũng có đường: hái thêm hai phần dược dẫn nữa ở thung lũng mang về cho đan phòng — dược ấy hiếm, tông đang cần. Chọn đi.' },
    KD_FEE_CHOICE
  ];
  var SCENE_CH11_VAT_DAN_DONE = [
    { who: 'narrate', text: 'Lửa lò đại điện cháy suốt ba canh giờ. Khi nắp lò mở, một vật tròn nhỏ bằng đầu ngón tay nằm giữa tro thuốc — bề mặt có vân xoáy chậm rãi như mây tụ. Vật dẫn Kết Đan.' },
    { who: 'truong_lao_tong', text: 'Cầm cho chắc. Ngày lên đài, ta sẽ cho người báo. Từ giờ tới lúc đó, giữ tâm yên như mặt nước — và nhớ: địch của ngươi cũng đang đếm ngày giống ngươi đấy.' }
  ];

  /* ================= PHẦN 3 — CHƯƠNG 12: KẾT ĐAN ======================== */
  var SCENE_CH12_LEN_DAI = [
    { who: 'narrate', text: 'Đài Trúc Cơ, một buổi sớm trong veo. Lần này ngươi lên đài không phải để Trúc Cơ — mà để Kết Đan. Quanh đài, những người hộ pháp đã vào vị trí từ trước khi trời sáng.' },
    { who: 'u_nhan', text: 'Phía đông để muội. Lần trước muội giữ phía đông cho huynh ở đài này — lần này cũng vậy. Có một thứ muội muốn nói trước khi huynh vận công: dù hôm nay có chuyện gì, đừng vì người ở dưới đài mà phá vận công của huynh. Bọn muội ở đây chính là để huynh không phải chọn.' },
    { who: 'hoa_huong_than', text: 'Phía tây và bậc thang là của ta. Giang Phàm — sau hôm nay, có khi ta phải gọi ngươi là tiền bối rồi. Kết Đan cho đẹp vào.' },
    { who: 'lieu_khuynh_tien', text: 'Phía bắc ta giữ. Còn một việc ngươi nên biết: tin ngươi Kết Đan hôm nay đã lọt ra ngoài từ hôm qua. Địch nếu tới, sẽ tới đúng lúc ngươi không thể dừng — như lần trước. Nhưng lần này, cả đài đều biết trước.' }
  ];
  var SCENE_CH12_HP_TCL = [
    { who: 'tran_tu_linh', text: 'Phía nam, Thiên Cơ Các cử người giữ — là ta, theo lời dặn của cha ta. Giang công tử, hôm nay các đứng về phía cậu, công khai.' }
  ];
  var SCENE_CH12_HP_TONG = [
    { who: 'de_tu_a', text: 'Phía nam do đệ tử gác đài của tông giữ, sư huynh yên tâm. Người ngoài không bước qua được vòng này đâu.' }
  ];
  var SCENE_CH12_GUARD_INTRO = [
    { who: 'narrate', text: 'Chu thiên vừa vào vòng thứ hai thì từ bậc thang phía đông, tiếng hò hét vọng lên: dư nghiệt Huyết Bạc Cung đánh thẳng vào đài, dẫn đầu là một bóng áo xám quen thuộc — Mạc Cửu U. Hắn không hô giết. Hắn hô một câu rất lạ: "Đừng giết nó! Cứ để nó Kết Đan!"' },
    { who: 'narrate', text: 'Lời ấy làm cả vòng hộ pháp khựng lại một nhịp. Nhưng địch vẫn đang leo lên đài — và ngươi, như lần Trúc Cơ, tuyệt đối không được phát hưởng — không đòn cộng hưởng nào, cũng không cất lời thật — cho tới khi vận công xong.' }
  ];
  var KDGUARD_CHOICE = {
    who: 'choice', text: 'Vận công không thể dừng. Ngươi sẽ…',
    options: [
      { label: 'Ra hiệu cho U Nhàn giữ phía đông', action: 'kdguard_dong' },
      { label: 'Để Hoa Hướng Thần đón đầu kẻ mạnh nhất', action: 'kdguard_hoa' },
      { label: 'Ngồi yên giữ vững tâm thần, mặc kệ khiêu khích', action: 'kdguard_tam' },
      { label: 'Phát hưởng phá vây — dù phải vỡ vận công', action: 'kdguard_voice' }
    ]
  };
  var SCENE_KDGUARD1 = [
    { who: 'narrate', text: 'Đợt thứ nhất: địch đánh thẳng vào bậc thang phía đông. Tiếng kiếm chạm nhau dội xuống mặt đá — phía đông mà sụp, vòng hộ pháp sẽ hở ra ngay trước mặt ngươi.' },
    KDGUARD_CHOICE
  ];
  var SCENE_KDGUARD2 = [
    { who: 'narrate', text: 'Đợt thứ hai: chúng đổi hướng, đánh vào phía tây nơi Hoa Hướng Thần đang đứng một mình, đồng thời phóng ám khí lên đài để ép ngươi phải mở mắt.' },
    KDGUARD_CHOICE
  ];
  var SCENE_KDGUARD3 = [
    { who: 'narrate', text: 'Đợt cuối: Mạc Cửu U tự mình bước lên ba bậc thang, dừng lại ở đúng tầm một đòn cộng hưởng có thể chạm tới, và nói vọng lên đài: "Ra đòn đi chứ, Hồn Sư. Hay là lần này, cái giá của một lần phát hưởng đã đắt hơn lần trước?"' },
    KDGUARD_CHOICE
  ];
  var SCENE_KDGUARD_END = [
    { who: 'narrate', text: 'Đợt cuối cùng bị đẩy xuống khỏi bậc thang. Mạc Cửu U đứng ở bậc dưới cùng, nhìn lên đài, bỗng thu kiếm. Hắn nói vọng lên, đủ cho mọi người quanh đài nghe: "Cung chủ có lời: cứ để nó Kết Đan. Đan thành rồi — món nợ mới tính được."' },
    { who: 'narrate', text: 'Địch rút như nước rút. Vòng hộ pháp không ai bị thương nặng. Chu thiên của ngươi, sau ba đợt sóng gió, vẫn nguyên vẹn một vòng — vật dẫn trong tay đã ấm lên như có nhịp đập riêng.' }
  ];
  var SCENE_CH12_TAM_MA = [
    { who: 'narrate', text: 'Vận công tới vòng cuối cùng. Trong tâm thần, kim đan đang thành hình — và đúng lúc ấy, tâm ma tới, mang hình dạng quen thuộc nhất: một thung lũng đầy hoa anh đào, một vòng vây đang siết lại, và tiếng của chính ngươi vang lên từ khắp nơi: "Nói đi. Một lời thôi là cứu được người. Ngươi đã im lặng mười tám năm — còn định im lặng tới bao giờ?"' },
    { who: 'narrate', text: 'Ngoài đài, cùng lúc ấy, bậc thang phía nam bỗng nứt một mảng đá lớn — trận văn hộ đài đang rạn, và người giữ phía nam đang ở ngay dưới mảng đá ấy. Một đòn phát hưởng của ngươi lúc này có thể giữ mảng đá lại. Nhưng vận công đang ở khắc cuối: phát hưởng, đan sẽ thành nhưng mang một vết. Giữ yên, đan trọn vẹn — và người ở phía nam sẽ chịu mảng đá ấy.' }
  ];
  var KD_TAMMA_CHOICE = {
    who: 'choice', text: 'Mảng đá đang rơi. Ngươi sẽ…',
    options: [
      { label: 'Phát hưởng — giữ mảng đá lại, cứu người giữ đài', action: 'ketdan_say' },
      { label: 'Không phát hưởng tới cùng — để đan trọn vẹn', action: 'ketdan_silent' }
    ]
  };
  var SCENE_CH12_TAMMA_SAY = [
    { who: 'hero', mode: 'say', text: 'LÙI LẠI!' },
    { who: 'narrate', text: 'Đòn phát hưởng phá vỡ chu thiên ở vòng cuối. Sóng cộng hưởng hất mảng đá lệch đi nửa trượng — người giữ phía nam thoát trong gang tấc. Kim đan trong đan điền vẫn thành hình, nhưng trên mặt đan còn lại một vệt nứt mảnh như tóc — cái giá của một lần phát hưởng đúng lúc.' }
  ];
  var SCENE_CH12_TAMMA_SILENT = [
    { who: 'narrate', text: 'Ngươi không mở miệng. Mảng đá rơi xuống phía nam đài trong tiếng rầm khô khốc — và từ trong bụi đá, người giữ đài bò ra được, vai đẫm máu nhưng còn sống, còn cười được một cái về phía đài: "Đan của sư huynh… đừng vì ta mà hỏng."' },
    { who: 'narrate', text: 'Chu thiên khép lại trọn vẹn. Kim đan trong đan điền tròn trịa, sáng như một mặt trời nhỏ vừa được thắp lên — không một vết nứt.' }
  ];
  var SCENE_CH12_KET_DAN = [
    { who: 'narrate', text: 'Bầu trời trên Thanh Vân Tông bỗng tối đi một khắc giữa ban ngày. Một cột sáng từ đài phóng thẳng lên, mây tụ thành vòng xoay chậm, và từng tiếng chuông không ai gõ tự vang lên khắp núi.' },
    { who: 'narrate', text: 'Kim Đan Sơ Kỳ. Ngươi mở mắt ra — thế giới nghe rõ hơn, nhìn xa hơn, và tai nghe của ngươi sâu hơn trước gấp bội: từ hôm nay, ngươi nghe được cả sóng đứng và độ lệch tần của vạn vật. Vạn Âm Cộng Hưởng của ngươi đã thành bậc Hưởng.' }
  ];
  var SCENE_CH12_LENH_1 = [
    { who: 'narrate', text: 'Trưởng lão cho dựng một tấm bia đá mới ở chân đài. Ông nói: "Kim Đan thành rồi, cách nghe của ngươi đã đổi bậc. Thử đi — không phải gõ mạnh hơn. Nghe sâu hơn: nghe cho ra sóng đứng của chính thiên địa quanh ngươi."' },
    { who: 'truong_lao_tong', text: 'Gõ một đòn Định Âm vào tấm bia kia. Nếu bia đứng yên tuyệt đối, không rung một hạt bụi, trong khi mặt đất quanh nó nứt ra — là ngươi đã chạm được vào bậc Hưởng: sóng đứng khóa mọi rung động tại chỗ. Dùng phím 4, như ngươi vẫn dùng các đòn cộng hưởng.' }
  ];
  var SCENE_CH12_LENH_2 = [
    { who: 'truong_lao_tong', text: 'Bia đứng yên như bị đóng băng giữa trời — tốt. Giờ khó hơn: trận văn quanh đài này đang rạn từ trận đánh lúc nãy. Gõ một đòn Phong Âm — làm lệch tần của vết rạn ấy để phong ấn nó lại. Phong Âm không phải phá, cũng không phải giữ: là làm một thứ đang chuyển động mất nhịp vận hành của chính nó mà đứng yên. Dùng phím 5.' }
  ];
  var SCENE_CH12_LENH_DONE = [
    { who: 'narrate', text: 'Vết rạn trên trận văn khép lại dưới một vòng ấn vàng, rồi đứng yên như chưa từng nứt. Cả đài im phăng phắc. Lần dùng bậc Hưởng đầu tiên của ngươi không nhắm vào kẻ thù nào — nó giữ yên một góc đài cho những người vừa giữ đài cho ngươi.' },
    { who: 'truong_lao_tong', text: 'Định Âm giữ một nhịp. Phong Âm khóa hai nhịp. Nhớ lấy giới hạn của chúng — và nhớ cả cái giá: thiên hạ từ nay sẽ để ý dư âm của ngươi, và cũng sẽ sợ nó. Dùng bậc Hưởng như ngươi đã dùng sự lắng nghe mười tám năm: chỉ khi thật cần.' },
    { who: 'u_nhan', text: 'Phàm ca. Muội hỏi huynh một câu cuối của ngày hôm nay — huynh có hối hận lần nào đã mở miệng, hay lần nào đã im lặng không?' },
    { who: 'hero', mode: 'write', text: '(viết) "Không. Lời nói không nặng vì nó hiếm. Nó nặng vì nói ra rồi, mình phải chịu trách nhiệm với nó mãi. Ta chỉ hối hận nếu một ngày ta nói mà không chịu trách nhiệm nữa."' },
    { who: 'narrate', text: 'Nàng đọc xong, gấp tờ giấy lại rất cẩn thận và cất vào ngực áo — như cất một tờ tự thư khác. Trên đài, chuông tông ngân dài. Một phần đường đã khép lại bằng chữ viết, đúng như nó đã bắt đầu bằng chữ viết.' }
  ];

  /* ================= CUNG IV — CHƯƠNG 13: VỊ THẾ MỚI Ở SƠN MÔN =================
     Cài nguyên văn từ bản thảo khóa tools/work/arc-iv-prep/scripts/ch13.js.
     Điểm ngắt engine (thay chú thích neo trong bản thảo):
     - SCENE_CH13_DAI_THACH kết thúc ở lời khiêu chiến của tinh anh: engine
       chạy 2 trận đệ tử nội môn NGAY TRƯỚC đoạn cuối của cảnh này — xem
       SCENE_CH13_DAI_THACH_2; hợp đồng arciv-work/CONTRACT-wave1.md mục A. */
  var SCENE_CH13_TRO_LAI = [
    { who: 'narrate', text: 'Thanh Vân Đại Điện, ba ngày sau khi Kết Đan. Ngươi bước qua cửa điện, hai hàng đệ tử chấp sự tự động dạt ra nhường lối — không ai bảo ai. Mấy tháng trước, cũng lối đi này, ngươi từng phải đứng chờ ở bậc thềm dưới cùng.' },
    { who: 'truong_lao_tong', text: 'Giang Phàm. Ngồi đi. Hôm nay ta gọi ngươi tới không phải để giao việc — là để tông môn tự sắp xếp lại một việc: từ nay, trong sổ sách của Thanh Vân Tông, ngươi đứng ở hàng nào.' },
    { who: 'truong_lao_tong', text: 'Có trưởng lão nói: Kim Đan là Kim Đan, cứ theo lệ cũ mà xếp. Cũng có người nói: hồ sơ của ngươi bắt đầu bằng bốn chữ "vô linh căn", xếp vội e rằng sau này khó sửa. Ta nghe cả hai phía. Giờ ta muốn nghe phía ngươi — bằng cách của ngươi.' },
    { who: 'hero', mode: 'write', text: '(viết) "Hồ sơ viết gì, đệ tử không tranh. Đệ tử chỉ xin một điều: việc gì tông giao, cứ giao như giao cho một đệ tử Kim Đan. Làm được hay không, để việc trả lời."' },
    { who: 'lieu_khuynh_tien', text: 'Lời ấy đủ rồi. Trưởng lão, con từng đứng trên Thăng Long Đạo nhìn chàng đánh hình chiếu của chính mình. Tông này nếu còn phân vân về một người như thế, thì phân vân không nằm ở chàng.' },
    { who: 'de_tu_a', text: '(thì thầm ở hàng dưới) Sư tỷ Liễu nói thay cho hắn… Từ ngày Kết Đan tới giờ, cả tông chưa ai nghe hắn nói một câu nào nữa. Không biết bậc Hưởng kia, rốt cuộc là phúc hay là họa.' },
    { who: 'truong_lao_tong', text: 'Đủ. Lời đồn để ngoài cửa điện. Giang Phàm, tông đã có cách định vị thế cho ngươi — một cách không cần ai ban, cũng không ai tranh được. Nghe ta nói hết đã.' },
    { who: 'narrate', text: 'Trưởng lão đứng dậy, đi tới bên cửa điện, nhìn xuống quảng trường và đài đấu kiếm phía xa. Giọng ông chậm lại, như thể việc sắp nói ông đã cân nhắc suốt ba ngày.' }
  ];
  var SCENE_CH13_DE_NGHI = [
    { who: 'truong_lao_tong', text: 'Tông muốn ngươi nhận một việc có danh phận: đứng lớp kiếm pháp cho đệ tử mới ở đài đấu kiếm. Không phải việc tạp dịch, không phải việc sai vặt — là việc của một người mà tông tin vào kiếm của hắn.' },
    { who: 'truong_lao_tong', text: 'Nhưng ta biết tính ngươi, và ta cũng biết tính đám đệ tử trong tông. Danh phận ta ban hôm nay, ngày mai sẽ có kẻ nói là ban vì nể, vì sợ, vì cái đan trong bụng ngươi. Cho nên tông đổi cách: mở đài thách đấu.' },
    { who: 'truong_lao_tong', text: 'Ba ngày tới, đài đấu kiếm mở cho mọi đệ tử nội môn. Ai không phục vị thế của ngươi, cứ lên đài, nói rõ trước mặt mọi người rồi xuất kiếm. Ngươi thắng, vị thế ấy do chính kiếm của ngươi đứng lấy — không ai còn đường nói khác.' },
    { who: 'hero', mode: 'write', text: '(viết) "Đệ tử nhận. Nhưng có một điều xin nói trước: lên đài là tỉ thí của tông môn. Đệ tử ra kiếm có chừng mực — mong các sư huynh đệ cũng vậy."' },
    { who: 'hoa_huong_than', text: 'Câu ấy để ta nói lại với bọn họ, nguyên văn. Giang Phàm, ta giữ sổ thách đấu ba ngày này. Ai ghi tên, ta ghi cả lý do không phục của họ vào sổ — để sau này thắng thua gì cũng còn chữ mà đối chiếu.' },
    { who: 'truong_lao_tong', text: 'Tốt. Còn một việc nữa, nói riêng ở đây: từ hôm nay, mỗi lần ngươi lên tầng công pháp, tông sẽ cho gióng chuông nghi thức ở đài — không phải để khoe. Là để đám đệ tử mới hiểu: tầng kiếm không ai cho không ai cả, nó đến từ từng trận đánh thật.' },
    { who: 'narrate', text: 'Tin mở đài lan khắp tông ngay trong buổi sáng. Đến trưa, sổ thách đấu của Hoa Hướng Thần đã có hai cái tên ghi đầu tiên — hai đệ tử nội môn trẻ, kiếm pháp thuộc hàng khá nhất trong lớp mới lên.' },
    { who: 'de_tu_b', text: 'Ta ghi tên không phải vì ghét ai. Ta chỉ muốn tận mắt xem: người mà cả tông đang xôn xao ấy, kiếm thật sự đi tới đâu. Thua cũng đáng — miễn là được thấy.' },
    { who: 'narrate', text: 'Đài thách đấu tông môn chính thức mở từ hôm nay.' }
  ];
  var SCENE_CH13_DAI_THACH = [
    { who: 'narrate', text: 'Đài Đấu Kiếm. Khán giả đệ tử đứng kín ba mặt đài — có người tới xem kiếm, có người tới xem người, cũng có người tới để chờ xem ngươi thua. Hoa Hướng Thần cầm sổ đứng ở bậc đài, giọng rõ ràng như đọc chiếu.' },
    { who: 'hoa_huong_than', text: 'Thách đấu vị thế, trận thứ nhất. Đệ tử nội môn ghi tên đầu tiên — lên đài. Quy củ như tỉ thí Thăng Long: ra kiếm có chừng mực, thắng thua ghi sổ, không ai được mang oán xuống đài.' },
    { who: 'de_tu_a', text: 'Giang sư huynh. Đệ không nói lời khách sáo. Đệ luyện Thất Tinh ba năm, hôm nay chỉ xin huynh cho đệ thấy: cùng một quyển kiếm quyết, người đã Kết Đan đánh khác người chưa Kết Đan ở chỗ nào.' }
  ];
  /* Điểm ngắt engine: HAI trận đệ tử nội môn (đài thách đấu) chạy giữa
     SCENE_CH13_DAI_THACH và cảnh dưới đây; sau đó là lời khiêu chiến của
     tinh anh nội môn — trận tinh anh chạy ngay sau cảnh này, rồi mở
     SCENE_CH13_TINH_ANH_END. */
  var SCENE_CH13_DAI_THACH_2 = [
    { who: 'hoa_huong_than', text: 'Hai trận đầu ghi sổ xong. Còn ai ghi tên nữa không — hay là cả lớp nội môn hôm nay chỉ cử được hai người trẻ nhất lên xem kiếm?' },
    { who: 'de_tu_a', text: 'Để ta. Ta không ghi tên trong sổ của ngươi, Hoa sư huynh — ta chờ đúng lúc này mới lên tiếng, để mọi người nghe rõ: ta không phục. Không phải không phục cái đan của hắn. Ta không phục chuyện tông xếp một người chưa từng dạy ai một ngày, lên đứng lớp kiếm pháp.' },
    { who: 'de_tu_a', text: 'Giang Phàm. Ta là người mạnh nhất trong lớp nội môn khóa này — câu ấy cả đài đều biết. Ngươi thắng ta trước mặt mọi người, chức đứng lớp ấy ta tự tay ghi tên ngươi vào sổ. Ngươi thua, thì tự mình xuống đài, nói với trưởng lão hai chữ: chưa xứng. Lên kiếm đi.' }
  ];
  var SCENE_CH13_TINH_ANH_END = [
    { who: 'narrate', text: 'Đòn kết liễu vừa dứt, cả đài im một khắc dài. Năm điểm sao khép thành một đường thẳng dọc hướng chém, thanh kiếm lớn bay dọc tuyến sao ấy — những đệ tử từng học Thất Tinh đều nhận ra chiêu ấy tên gì, và đều hiểu nó vừa được đánh ở tầng nào.' },
    { who: 'de_tu_a', text: '…Ta thua. Thua ở chiêu Phá Quân cuối cùng — thua tâm phục. Giang sư huynh, cái tên trong sổ đứng lớp, để ta tự tay ghi. Từ nay ai trong lớp nội môn còn nói một câu không phục, cứ qua kiếm của ta trước.' },
    { who: 'hoa_huong_than', text: 'Ghi sổ: thách đấu vị thế, ba trận, Giang Phàm thắng cả ba. Ta đọc lại cho cả đài nghe — từ giờ, vị thế của Giang sư huynh trong tông không còn là việc để bàn ra tán vào nữa. Nó là việc đã ghi sổ.' },
    { who: 'lieu_khuynh_tien', text: 'Ngươi thấy không — danh phận không ai ban cho ngươi cả. Ngươi tự đứng lấy nó, ngay tại đài này, trước mặt đúng những người từng nghi ngờ ngươi nhất. Đó mới là cách của Thanh Vân Tông.' },
    { who: 'narrate', text: 'Đám đông tan dần xuống núi. Nhưng ở bậc thềm cuối cùng của đài, một người không mặc áo đệ tử tông đang đứng chờ — áo lữ hành phủ bụi đường, tay cầm một phong thư niêm triện đỏ của một nhà thế lực ngoài tông.' },
    { who: 'tin_su', text: 'Giang công tử… tiểu nhân chờ công tử từ lúc đài còn chưa mở. Chủ nhân của tiểu nhân dặn: thư này nhất định phải trao tận tay công tử, ngay trong ngày công tử định xong vị thế ở sơn môn. Xin công tử đọc cho.' }
  ];
  var SCENE_CH13_THINH_CAU = [
    { who: 'narrate', text: 'Điểm rơi cổng tông. Phong thư niêm triện đỏ, giấy tốt, chữ viết tay người khác — nhưng từng câu trong thư đều nói về ngươi như thể ngươi là một món đồ có thể mượn được: "mượn một lệnh của Giang công tử, dùng xong xin hoàn trả nguyên vẹn, hậu tạ tùy công tử định".' },
    { who: 'tin_su', text: 'Chủ nhân của tiểu nhân nói: nhà họ sắp có một việc lớn, đối thủ là người không nể mặt ai — chỉ nể đúng một thứ: một lời của Giang công tử. Chỉ cần công tử gật đầu cho mượn danh một lần, việc của nhà họ yên, mà công tử cũng không mất gì.' },
    { who: 'tin_su', text: 'Tiểu nhân chỉ là người đưa thư, công tử đừng khó xử với tiểu nhân. Chủ nhân còn dặn thêm một câu: nếu công tử chưa tiện trả lời, cứ giữ thư lại. Nhà họ chờ được. Nhà họ… rất kiên nhẫn.' },
    { who: 'hero', mode: 'write', text: '(viết) "Thư ta nhận. Đáp, ta chưa đáp. Ngươi về nói với chủ nhân của ngươi đúng một câu này: lệnh của ta không phải vật cho mượn — nhưng thư thì ta đã đọc, và ta nhớ ai là người gửi."' },
    { who: 'tin_su', text: 'Tiểu nhân… ghi nhớ từng chữ. Tiểu nhân xin cáo lui. Chỉ mong công tử biết: nhà họ gửi thư này không phải nhà đầu tiên nghĩ tới việc ấy đâu. Chẳng qua họ nhanh chân nhất thôi.' },
    { who: 'narrate', text: 'Người đưa tin xuống núi, bóng khuất dần sau cổng sơn môn. Ngươi đứng lại một lúc với phong thư trong tay. "Mượn một lệnh" — bốn chữ nghe như mượn một món đồ, mà thứ bị mượn thật ra là cả cái giá của một lần cất lời.' },
    { who: 'narrate', text: 'Dưới thành, có một người cũng đang bị thiên hạ hỏi mượn một thứ tương tự: uy tín của Hứa gia. Và người đang gánh việc ấy ở Hứa gia lúc này, không phải Hứa Chính Ngôn.' }
  ];
  var SCENE_CH13_VE_THANH = [
    { who: 'narrate', text: 'Sân phủ Hứa, Cô Châu Thành. Bàn làm việc của U Nhàn đặt ngay gian ngoài: sổ sách xếp theo từng nhà, một chồng thư chưa trả lời, và một danh sách dài những người đang chờ gặp nàng — cảnh tượng của một người đang thật sự điều hành việc đối ngoại của một gia tộc.' },
    { who: 'u_nhan', text: 'Phàm ca tới đúng lúc muội vừa tiễn đoàn người thứ ba trong ngày. Toàn là người tới "thăm hỏi" — mà thăm hỏi nào cũng vòng về một câu: Hứa gia bây giờ, còn ai đứng sau lưng nữa không. Muội trả lời từng đoàn một, bằng sổ sách, không bằng lời hứa.' },
    { who: 'u_nhan', text: 'Muội nghe tin trên núi rồi. Mở đài thách đấu, thắng ba trận, tự đứng lấy vị thế — đúng là cách của huynh. Cha muội cười suốt buổi trưa vì chuyện ấy đấy.' },
    { who: 'hero', mode: 'write', text: '(viết) "Trên núi vừa có người gửi thư, xin mượn một lệnh của ta để dẹp việc nhà họ. Ta chưa đáp. Nhưng ta có cảm giác: thư như thế sẽ không dừng ở một phong."' },
    { who: 'u_nhan', text: 'Huynh cảm giác đúng đấy. Dưới thành này, từ ngày huynh Kết Đan, đã có ba nhà dò hỏi qua trung gian: một lệnh của Giang Phàm đáng giá bao nhiêu. Muội chặn hết ở cửa Hứa gia — không phải vì muội quyết thay huynh, mà vì những lời hỏi ấy chưa xứng được đưa tới trước mặt huynh.' },
    { who: 'u_nhan', text: 'Nhưng chặn mãi không phải cách. Sớm muộn cũng có nhà đưa thỉnh cầu tới tận sơn môn, đường hoàng, trước mặt trưởng lão — lúc ấy huynh phải tự mình trả lời. Và muội tin huynh đã biết mình sẽ trả lời thế nào rồi.' },
    { who: 'narrate', text: 'Nàng nói đúng. Ngay sáng hôm sau, khi ngươi vừa trở lại sơn môn, quản sự đại điện đã chờ sẵn ở cửa: hai phong thư thỉnh cầu nữa vừa tới — từ hai nhà khác nhau, về hai việc khác nhau, và cả hai đều xin cùng một thứ.' }
  ];

  /* ================= CUNG IV — CHƯƠNG 14: HAI THỈNH CẦU CÙNG MỘT NGÀY =================
     Nguyên văn từ ch14.js. Điểm ngắt engine: trận giữ đất + phong ấn mắt
     trận chạy giữa SCENE_CH14_HIEN_TRUONG và SCENE_CH14_HIEN_TRUONG_END. */
  var SCENE_CH14_HAI_THINH_CAU = [
    { who: 'narrate', text: 'Thanh Vân Đại Điện. Hai người đưa tin đứng cách nhau đúng một khoảng sân hẹp, không ai chịu nhìn ai: một người mang triện của nhà đang giữ dải đất linh ven đường mòn, một người mang thư của nhà còn lại — chính nhà đang tranh dải đất ấy, và đang bị ép một mối hôn sự.' },
    { who: 'tin_su', text: 'Giang công tử, thư của chủ nhân tiểu nhân: dải đất linh ven đường mòn vốn của nhà họ từ ba đời, nay bị nhà bên lấn dần. Chỉ cần công tử cho mượn một lệnh, nói rõ đất ấy thuộc về ai — việc ba đời sẽ yên trong một ngày. Hậu tạ, chủ nhân không dám để công tử thiệt.' },
    { who: 'tin_su_b', text: 'Công tử đừng nghe một phía. Thư của chủ nhân tiểu nhân đây: nhà họ mới là người bị lấn. Và còn một việc riêng nữa — tiểu thư nhà họ bị ép gả cho một mối hôn sự chỉ vì nhà bên muốn nuốt đất qua đường hôn nhân. Một lệnh của công tử hủy được mối hôn ấy, là cứu cả một đời người.' },
    { who: 'tin_su', text: 'Ngươi nói ai ép ai? Đất có sổ, hôn có ước — nhà ngươi mang cả hai thứ tới cùng một người, tưởng người ta không nhìn ra à?' },
    { who: 'tin_su_b', text: 'Sổ của nhà ngươi là sổ mới viết lại năm ngoái, cả thành này ai mà không biết. Ta tới trước hay ngươi tới trước, hôm nay để công tử phân xử.' },
    { who: 'truong_lao_tong', text: 'Đủ rồi. Hai nhà cãi nhau, đừng cãi ở điện của ta. Giang Phàm — hai phong thư, hai việc, cùng một lời xin: mượn lệnh của ngươi. Ngươi đáp thế nào, tông không cản. Nhưng ta nhắc một câu: đáp vội một phía ở đây, là ngươi vừa cho mượn thứ mà họ xin đấy.' },
    { who: 'hero', mode: 'write', text: '(viết) "Hai thư ta đều nhận. Nhưng lệnh chưa cho mượn vội. Việc đất, ta xem bằng sổ sách trước — sổ của cả hai nhà, và cả người giữ đất lâu năm. Việc hôn sự, ta xem sau, nhưng cũng xem bằng chứng, không xem bằng lời."' },
    { who: 'tin_su_b', text: 'Công tử… xem sổ? Việc này xưa nay ai cũng tưởng chỉ cần công tử gật đầu…' },
    { who: 'truong_lao_tong', text: 'Nghe rõ chưa. Người ta không từ chối các ngươi — người ta từ chối cách các ngươi xin. Về nói lại với chủ nhân hai nhà: muốn một lời của Giang Phàm, thì mang sự thật ra mà đổi. Xuống thành thôi, Giang Phàm. Sổ đất của hai nhà đều lưu ở phủ thành.' },
    { who: 'narrate', text: 'Hai người đưa tin cúi đầu lui ra, mỗi người một hướng, không ai còn dám cãi thêm câu nào. Lần đầu tiên, một lời thỉnh cầu mượn lệnh bị chặn lại không phải bằng im lặng — mà bằng một yêu cầu rất cụ thể: chứng cứ.' }
  ];
  var SCENE_CH14_SO_DAT = [
    { who: 'narrate', text: 'Phòng lưu sổ của phủ thành. Hai cuốn sổ đất được mang ra đặt cạnh nhau: một cuốn bìa cũ sờn, giấy ngả vàng, nét mực nhiều đời; một cuốn bìa mới cứng, chữ viết đều tăm tắp như chép lại trong một đêm.' },
    { who: 'dan_thanh_a', text: 'Cậu Giang xem đây. Sổ cũ này ghi từ đời ông cố của cả hai nhà: dải đất ven đường mòn là đất chung giữ đường nước — hai nhà cùng dùng, không nhà nào được rào, được bán, được dựng gì lên đó. Chữ của quan phủ đời trước, triện còn nguyên.' },
    { who: 'dan_thanh_a', text: 'Còn cuốn mới này… năm ngoái có người mang tới xin đối chiếu, nói là sổ nhà họ "chép lại cho rõ". Lão giữ sổ ba mươi năm, lão phân biệt được giấy cũ thật với giấy làm cũ. Cuốn này, là làm cũ.' },
    { who: 'hero', mode: 'write', text: '(viết) "Sổ cũ ghi đất chung giữ đường nước. Vậy dải đất ấy mà hỏng, cả hai nhà cùng mất nước. Người làm giả sổ này, hắn không chỉ muốn lấy đất — hắn muốn nhà bên phải tự bỏ đất trước."' },
    { who: 'dan_thanh_a', text: 'Cậu nói đúng ý lão. Mấy tháng nay linh khí ở dải đất ấy nhiễu lạ lắm, cỏ chết từng mảng, nước giếng hai nhà đều vẩn. Nhà bên tưởng đất hỏng thật, đã tính chuyện bỏ đất mà đi. Cậu muốn rõ hơn nữa, thì hỏi lão giữ đất — lão ấy ở ngay ven đường mòn, giữ đường nước ấy còn lâu hơn lão giữ sổ.' },
    { who: 'narrate', text: 'Sổ giả đã rõ một nửa. Nhưng sổ giả không tự làm linh khí nhiễu được — muốn biết đất "hỏng" bằng cách nào, phải nghe người sống ngay trên dải đất ấy, và phải tận mắt tới hiện trường.' }
  ];
  var SCENE_CH14_NHAN_CHUNG = [
    { who: 'dan_c', text: 'Cậu là Giang công tử trên núi xuống à? Lão giữ đường nước này bốn mươi năm. Bốn mươi năm, nước chưa từng vẩn một ngày — cho tới ba tháng trước, khi có người lạ tới dựng mấy cột đá khắc chữ quanh dải đất, nói là "trấn đất cho linh khí tụ lại".' },
    { who: 'dan_c', text: 'Từ ngày có mấy cột đá ấy, đêm nào lão cũng nghe tiếng ong ong rất khẽ trong đất, như có ai gõ lệch nhịp vào tai. Cỏ chết bắt đầu từ quanh mấy cột đá ấy mà lan ra. Lão nói với người của hai nhà, không ai tin một lão già giữ đất.' },
    { who: 'hero', mode: 'write', text: '(viết) "Tiếng ong ong lệch nhịp trong đất — cháu nghe ông tả, đã rõ nó là gì rồi. Ông không hoa tai, cũng không nói sai. Việc còn lại để cháu tận mắt xem mấy cột đá ấy."' },
    { who: 'dan_c', text: 'Cậu là người đầu tiên tin lời lão. Nhưng cậu cẩn thận: quanh dải đất bây giờ có mấy tay thanh niên lạ mặt canh giữ, nói là người của nhà bên thuê "giữ đất khỏi bị phá". Lão thấy chúng nó còn sợ mấy cột đá hơn cả lão — đứng canh mà cứ đứng xa xa.' },
    { who: 'narrate', text: 'Cột đá khắc chữ, tiếng lệch tần trong đất, linh khí nhiễu lan từ một điểm — mọi dấu hiệu đều chỉ về cùng một thứ ngươi đã từng thấy ở chương trước: trận văn loạn sóng. Lần này là một mắt trận cỡ nhỏ, dựng lén trên đất chung, để ép một nhà phải tự bỏ đất của chính mình.' },
    { who: 'narrate', text: 'Hiện trường ở ngay phía trước, trên dải đất ven đường mòn. Và đúng như lời lão giữ đất: có người đang canh ở đó.' }
  ];
  var SCENE_CH14_HIEN_TRUONG = [
    { who: 'narrate', text: 'Dải đất linh ven đường mòn. Cỏ chết loang thành một vòng xám quanh bốn cột đá khắc đầy trận văn lạ — và ngay giữa vòng xám ấy, không khí rung lên từng đợt lệch tần quen thuộc: một mắt trận loạn sóng cỡ nhỏ, vẫn đang chạy, vẫn đang gặm dần dải đất này từng ngày.' },
    { who: 'dan_a', text: 'Đứng lại! Đất này đang có tranh chấp, người ngoài không được vào. Bọn ta được thuê giữ đất — thuê đàng hoàng, có tiền có giấy. Cậu là ai mà dám tới gần mấy cột đá ấy?' },
    { who: 'hero', mode: 'write', text: '(viết, giơ lên) "Ta là người hai nhà cùng mời tới xem đất. Giấy thuê của các ngươi ghi giữ đất — không ghi giữ một cái trận đang phá đất. Nhìn quanh chân các ngươi đi: cỏ chết, nước vẩn. Thứ các ngươi đang canh, chính là thứ làm đất này hỏng."' },
    { who: 'dan_a', text: 'Nó… nó nói cái trận kia làm hỏng đất? Nhưng người thuê nói mấy cột đá ấy là để trấn đất… Thôi mặc kệ! Tiền đã nhận, đất phải giữ. Anh em, cản nó lại — đừng để nó chạm vào cột đá!' },
    { who: 'narrate', text: 'Nhóm tay chân thuê rút vũ khí, dàn ra quanh mắt trận. Vòng nhiễu xám quanh các cột đá bỗng dày lên — mắt trận đang nạp nhịp cho chúng. Nhưng ngươi nghe rõ hơn chúng: trong tiếng lệch tần của mắt trận, có một nhịp đứng yên rất rõ. Phong Âm của ngươi, lần đầu tiên, có một việc để làm ngoài chiến trường.' },
    { who: 'narrate', text: 'Đứng vào tầm của mắt trận, kết ấn — hoặc đánh gục nhóm giữ đất trước rồi phong ấn sau. Cả hai đường đều mở. Đất này yên lại được hay không, nằm ở trận này.' }
  ];
  var SCENE_CH14_HIEN_TRUONG_END = [
    { who: 'narrate', text: 'Ấn vàng của Phong Âm khép lại trên mắt trận. Tiếng lệch tần tắt dần như một sợi dây đàn bị tháo ra — và lần đầu tiên sau ba tháng, dải đất ven đường mòn yên tĩnh hẳn: hạt linh khí quanh hiện trường chuyển từ nhiễu xám sang trôi đều, cỏ ở rìa vòng chết như vừa được thở lại.' },
    { who: 'dan_a', text: 'Tắt… tắt thật rồi. Đất yên rồi… Bọn ta khai hết: người thuê là quản sự của nhà giữ sổ mới. Hắn dặn chỉ canh, không được hỏi mấy cột đá là gì, tiền trả gấp ba giá thường. Bọn ta giữ đất ba tháng, hóa ra là giữ một cái bẫy cho chính hai nhà.' },
    { who: 'dan_a', text: 'Mảnh trận văn này cậu cầm lấy — nó rơi ra từ cột đá khi cái ấn của cậu khép lại. Bọn ta xin làm chứng trước phủ thành: ai dựng trận, ai trả tiền, bọn ta nói hết. Chỉ xin cậu nói giúp một câu: bọn ta bị thuê, không phải chủ mưu.' },
    { who: 'hero', mode: 'write', text: '(viết) "Làm chứng thật, tội nhẹ đi. Ta ghi đúng một câu cho các ngươi: người giữ bẫy không phải người đặt bẫy. Nhưng từ nay, tiền gấp ba mà không cho hỏi — thì đừng nhận."' },
    { who: 'narrate', text: 'Mảnh trận văn vỡ nằm gọn trong tay ngươi, còn vương hơi nhiễu lạnh — vật chứng mà không một cuốn sổ giả nào cãi lại được. Đường về đại điện đã rõ: hai lời từ chối của ngươi giờ đứng trên chứng cứ vừa giành được ở hiện trường này, chứ không đứng trên miệng lưỡi của bất cứ nhà nào.' },
    { who: 'narrate', text: 'Ở lại sau cùng, ngươi ngoái nhìn dải đất một lần nữa. Nơi này từ nay là một điểm đất yên: linh thảo sẽ mọc lại quanh vòng đá cũ. Người đi đường mòn về sau hái thuốc ở đây, ít ai biết nó từng suýt bị đánh cắp bằng một cái trận câm lặng.' }
  ];
  var SCENE_CH14_TU_CHOI = [
    { who: 'narrate', text: 'Thanh Vân Đại Điện. Hai người đưa tin lại có mặt — lần này đứng cạnh nhau, và giữa điện, trên bàn của trưởng lão, là ba thứ: cuốn sổ đất cũ, cuốn sổ làm giả, và mảnh trận văn vỡ mang về từ hiện trường.' },
    { who: 'truong_lao_tong', text: 'Giang Phàm đã xem việc đất xong. Hai nhà nghe cho rõ: hôm nay người ta trả lời — bằng chữ viết, trước mặt tông môn, và từng câu đều có chứng cứ đặt ngay trên bàn này. Đọc đi, Giang Phàm.' },
    { who: 'hero', mode: 'write', text: '(viết, giơ lên) "Việc đất: dải đất ven đường mòn là đất chung giữ đường nước của hai nhà từ đời trước, sổ cũ của phủ thành ghi rõ. Một phía đã làm giả sổ và dựng trận loạn sóng lên đất để ép phía kia tự bỏ đất. Trận đã bị phong ấn, người dựng đã có kẻ làm chứng. Việc này không cần lệnh của ta — nó cần phủ thành xử theo sổ cũ, và hai nhà cùng dỡ bỏ những gì đã dựng trên đất chung."' },
    { who: 'tin_su', text: 'Chủ nhân của tiểu nhân… nếu biết việc dựng trận bị phơi ra thế này… Tiểu nhân không dám cãi một chữ. Sổ giả đặt ngay kia, mảnh trận đặt ngay kia. Tiểu nhân chỉ xin công tử ghi nhận: người đưa thư không biết gì hết.' },
    { who: 'hero', mode: 'write', text: '(viết, giơ lên) "Việc hôn sự: hôn ước dựng trên một vụ tranh đất và một cuốn sổ giả thì không đứng được. Nhưng hủy hôn cũng không cần lệnh của ta — luật thành có đường của luật thành: mang sổ cũ và lời chứng này tới phủ thành, mối hôn ép buộc tự nó tan. Ta không cho mượn lệnh cho việc mà luật đã có sẵn đường giải quyết."' },
    { who: 'tin_su_b', text: 'Tiểu thư nhà tiểu nhân… được cứu bằng một tờ giấy viết tay và một cuốn sổ cũ, không cần ai phải nợ ai một lệnh nào. Tiểu nhân về sẽ nói đúng như thế: Giang công tử không từ chối cứu người — công tử từ chối để người ta biến việc cứu người thành một món nợ.' },
    { who: 'truong_lao_tong', text: 'Hai nhà nghe rõ cả chưa. Từ nay, ai còn muốn "mượn lệnh" của đệ tử tông ta, cứ theo đúng lệ hôm nay: mang sự thật tới trước, việc xong xuôi rồi, lệnh có khi chẳng cần dùng nữa. Đó không phải lời của Giang Phàm nữa — đó là lệ của Thanh Vân Tông.' },
    { who: 'narrate', text: 'Hai phong thư thỉnh cầu được trả lại nguyên triện, kèm theo hai tờ giấy viết tay của ngươi. Không nhà nào được thứ chúng xin — mà cả hai nhà đều nhận được thứ chúng thật sự cần: một lối ra.' },
    { who: 'narrate', text: 'Tin về buổi trả lời lan xuống thành ngay trong ngày. Và ở chợ Cô Châu, có một đoàn thương nhân đang bị ép giá chỉ vì một tin đồn ngược hẳn: rằng Hứa gia sắp mất chỗ dựa. Người đứng ra chặn tin đồn ấy, không phải ngươi.' }
  ];
  var SCENE_CH14_BAO_LANH = [
    { who: 'narrate', text: 'Chợ Cô Châu. Một đoàn thương nhân ngồi lặng quanh mấy xe hàng không bán được: ba hôm nay, các sạp lớn quanh chợ đồng loạt ép giá họ xuống một nửa, chỉ vì một câu đồn — "Hứa gia sắp mất chỗ dựa, hàng bảo lãnh bởi Hứa gia nay mai thành hàng vô chủ".' },
    { who: 'cho_a', text: 'Cô nương U Nhàn, lão buôn bán ba mươi năm chưa từng van ai. Nhưng giá ép thế này, đoàn của lão về tới nhà là mất trắng. Người ta nói Hứa gia không còn ai chống lưng… lão tin cô nương, nhưng lão không chống nổi cả cái chợ này một mình.' },
    { who: 'u_nhan', text: 'Bác không phải chống một mình. Đây là sổ bảo lãnh của Hứa gia cho đoàn này, ký từ đầu vụ, triện còn nguyên. Ai ép giá, cứ mang sổ này ra đối chiếu: hàng của đoàn là hàng Hứa gia bảo lãnh, giá theo lệ chợ ba năm nay, không theo tin đồn ba ngày.' },
    { who: 'u_nhan', text: 'Còn chuyện "Hứa gia mất chỗ dựa" — Hứa gia chưa từng buôn bán bằng chỗ dựa. Hứa gia buôn bằng sổ sách sạch và trả tiền đúng hẹn. Ai muốn kiểm, gian hàng của ta mở sổ cho kiểm ngay tại chợ này, hôm nay.' },
    { who: 'hero', mode: 'write', text: '(viết) "Ta có mặt ở đây chỉ để làm chứng một việc: sổ này là sổ thật, chữ này là chữ của nàng, và nàng nói câu nào, Hứa gia giữ câu ấy. Ngoài ra, việc ở chợ là việc của nàng — ta không chen vào."' },
    { who: 'cho_a', text: 'Có cậu Giang đứng đây làm chứng bằng chữ viết, lại có sổ sách mở ra giữa chợ… Lão đi nói với các sạp ngay: giá trở lại lệ cũ, ai còn ép giá là tự mình chống lại cả Hứa gia lẫn Thanh Vân Tông. Cô nương, đoàn này nợ cô nương một ơn lớn.' },
    { who: 'u_nhan', text: 'Không ai nợ ai, bác ạ. Cháu chỉ làm đúng phần việc của cháu. (quay sang ngươi, khẽ hơn) Phàm ca thấy không — huynh từ chối cho mượn lệnh ở trên núi, muội chặn tin đồn ở dưới chợ này. Hai việc, hóa ra là cùng một việc: không để cái tên của huynh bị người ta đem ra mua bán.' }
  ];

  /* ================= CUNG IV — CHƯƠNG 15: TRẬN LOẠN SÓNG =================
     Nguyên văn từ ch15.js. Điểm ngắt engine: trận phá vòng vây 3 đợt chạy
     giữa SCENE_CH15_CUU_DOAN và _END (cờ khóa cộng hưởng ch15ResonanceLock
     bật suốt trận); hai chốt chặn chạy giữa SCENE_CH15_TRUY_DUOI và
     SCENE_CH15_TRUY_DUOI_2. */
  var SCENE_CH15_BAO_DONG = [
    { who: 'narrate', text: 'Thanh Vân Đại Điện, giờ mùi. Một đệ tử hộ tống lao qua cửa điện, áo rách một mảng vai, hơi thở chưa kịp đều — cậu là người duy nhất trong đoàn việc tông hôm nay thoát ra được khỏi đường mòn.' },
    { who: 'de_tu_ho_tong', text: 'Trưởng lão! Đoàn của đệ tử bị vây ở khoảng trống giữa đường mòn. Nhưng lạ lắm: chúng không đánh vào. Chúng dựng vòng, giữ khoảng cách, cứ như… đang chờ xem đoàn của đệ tử sẽ làm gì. Đệ tử chui qua khe vòng lúc trời chạng vạng mới thoát được.' },
    { who: 'truong_lao_tong', text: 'Giữ vòng mà không giết, lại chọn đúng đoàn đệ tử đi việc tông — đó không phải cướp đường. Đó là thử trận. Chúng dựng một cái trận quanh đoàn của ngươi để đo thứ gì đó. Giang Phàm, ngươi nghe ra chúng muốn đo cái gì chưa?' },
    { who: 'hero', mode: 'write', text: '(viết) "Đo đệ tử. Nhưng đoàn chỉ là mồi. Thứ chúng thật sự muốn đo là người sẽ tới cứu — và cách người ấy phá trận. Đệ tử đi ngay. Xin trưởng lão dặn đoàn ở trong vòng: đừng ai phá vòng ra ngoài trước khi đệ tử tới."' },
    { who: 'de_tu_ho_tong', text: 'Đệ tử dẫn đường cho sư huynh. Đường tắt qua bờ suối, đệ tử còn nhớ rõ. Chỉ mong… lúc tới nơi, vòng vây vẫn còn nguyên như lúc đệ tử thoát ra.' },
    { who: 'truong_lao_tong', text: 'Đi đi. Và Giang Phàm — nhớ lấy: nếu đó đúng là một đợt thử trận nhắm vào ngươi, thì mọi đòn ngươi tung ra ở đó đều bị ghi lại. Đánh thế nào cho đáng, là việc của ngươi.' },
    { who: 'narrate', text: 'Hai người rời tông ngay trong chiều, đi tắt xuống đường mòn. Từ xa, khoảng trống bị vây đã hiện ra qua kẽ lá: một vòng người áo xám đứng im đều tăm tắp quanh đoàn đệ tử — im lặng một cách không giống bất cứ toán cướp đường nào.' },
    { who: 'narrate', text: 'Càng tới gần, tai ngươi càng nghe rõ: quanh khoảng trống ấy là một lớp sóng nhiễu dày, đều, có chủ ý — thứ sóng ngươi mới gặp ở quy mô nhỏ trên dải đất linh chương trước. Lần này, nó được dựng để chờ đúng một người.' }
  ];
  var SCENE_CH15_CUU_DOAN = [
    { who: 'narrate', text: 'Ngươi bước vào khoảng trống. Ngay khắc chân ngươi chạm đất trong vòng, lớp sóng nhiễu quanh sân khép lại như một cái nắp: Tĩnh Âm trong ngực ngươi vẫn đầy, mà sóng khóa không đi ra được nửa bước — các nút chiêu cộng hưởng xám đi trong một vòng nhiễu xám quanh người.' },
    { who: 'de_tu_b', text: 'Giang sư huynh! Huynh tới thật rồi! Bọn muội giữ trong vòng này nửa ngày, chúng không cho ra, cũng không đánh vào. Sư huynh — tai của huynh… ở đây nghe có gì không? Sao mặt huynh lại bình tĩnh thế?' },
    { who: 'hero', mode: 'write', text: '(viết, giơ cho cả đoàn thấy) "Cộng hưởng ở đây bị khóa. Đừng chờ ta phát đòn nào. Hôm nay phá vòng bằng kiếm. Các ngươi giữ lưng cho nhau, nhìn theo kiếm của ta mà đánh — đoàn không thiếu một người nào được."' },
    { who: 'chi_huy_tran', text: 'Tới rồi. Ghi lại hết: vòng nhiễu khóa được sóng của hắn — tốt. Giờ xem cho kỹ: một Giang Phàm không có cộng hưởng, còn lại bao nhiêu phần đáng sợ? Đợt một — vào.' },
    { who: 'narrate', text: 'Vòng ngoài chuyển động: tay chân mang pháp khí loạn sóng cá nhân, vòng nhiễu nhỏ rung quanh từng tên. Phía sau chúng, hai tên cầm trận giữ hai mắt trận di động — còn mắt trận nào còn đứng, đợt địch còn được nạp lại nhịp.' },
    { who: 'narrate', text: 'Không có vòng cộng hưởng nào che sân hôm nay. Sân khấu chỉ còn thân người và thanh kiếm sáng: Liên Hoàn cho cụm đông, Phá Quân cho mắt trận, Trảm giữ nhịp giữa các đợt.' },
    { who: 'de_tu_b', text: 'Sư huynh cứ đánh phía trước! Sau lưng huynh để bọn muội giữ — hôm nay đoàn này không làm gánh nặng của huynh đâu!' }
  ];
  var SCENE_CH15_CUU_DOAN_END = [
    { who: 'narrate', text: 'Mắt trận di động cuối cùng vỡ thành một đám hạt xám. Vòng nhiễu quanh khoảng trống hụt đi từng mảng rồi tan hẳn — và cùng lúc ấy, vòng người áo xám quanh đoàn đệ tử vỡ ra như một đội hình vừa nhận lệnh rút: gọn, nhanh, không một tiếng hô hoán thừa.' },
    { who: 'de_tu_b', text: 'T… tan rồi. Sư huynh, huynh không dùng một đòn cộng hưởng nào thật… Bọn chúng khóa sóng của huynh suốt cả trận, mà huynh đánh như thể… như thể kiếm mới là thứ huynh quen tay nhất từ đầu vậy.' },
    { who: 'hero', mode: 'write', text: '(viết) "Cộng hưởng là một đường. Kiếm là đường khác. Chúng khóa được một đường, không khóa được người. Về kiểm lại đoàn: ai bị thương, xử lý trước. Việc còn lại để ta."' },
    { who: 'chi_huy_tran', text: '(đứng ở rìa khoảng trống, nói vọng lại trước khi rút) Số liệu đủ rồi. Kiếm quyết của hắn: Liên Hoàn xử cụm, Phá Quân phá mắt, nhịp Trảm không hở một khắc. Báo về cho cung chủ: muốn bịt tai hắn thì dễ — muốn bịt kiếm của hắn, phải tính cách khác.' },
    { who: 'narrate', text: 'Hắn nói câu ấy không hề hạ giọng. Chúng thử trận là để đo ngươi — và hắn muốn ngươi biết điều đó.' },
    { who: 'de_tu_ho_tong', text: 'Sư huynh, kẻ chỉ huy rút về hướng nam đường mòn — chính là tên vừa nói. Đoàn đã an toàn, đệ tử ở lại lo cho người bị thương. Sư huynh đuổi theo hắn đi — đừng để hắn mang hết số liệu về cho Huyết Bạc Cung!' },
    { who: 'narrate', text: 'Dấu rút còn mới trên mặt đường mòn: vết chân đều, không hoảng loạn — một cuộc rút lui đã được chuẩn bị từ trước, kể cả đường rút. Kẻ chỉ huy này không định chạy thoát trong hỗn loạn. Hắn định được đuổi theo.' }
  ];
  var SCENE_CH15_TRUY_DUOI = [
    { who: 'narrate', text: 'Đường mòn phía nam. Ngươi đuổi theo dấu rút chưa đầy một dặm thì chốt chặn thứ nhất hiện ra: hai tên áo xám đứng chắn ngang đường, pháp khí loạn sóng đã lên tay — không phải để thắng, chỉ để câu giờ cho kẻ đi trước.' },
    { who: 'huyet_de', text: 'Chỉ huy dặn: giữ chân ngươi ở đây đủ lâu là xong việc. Bọn ta biết không thắng nổi ngươi — nhưng ngươi cũng đừng hòng qua nhanh. Mỗi khắc ngươi đứng đây, là một khắc hắn đi xa thêm một đoạn.' },
    { who: 'narrate', text: 'Chúng đánh đúng như lời nói: giữ khoảng cách, né đòn chính, chỉ chực làm chậm bước chân ngươi. Nhưng Liên Hoàn ở thế đuổi theo là một thứ khác hẳn — kiếm thứ hai chạm đích ngay khi mục tiêu đang lùi.' }
  ];
  /* Điểm ngắt engine: HAI chốt chặn trên đường truy đuổi chạy giữa hai
     nửa cảnh này (mỗi chốt một trận ngắn qua ống chạm trán). */
  var SCENE_CH15_TRUY_DUOI_2 = [
    { who: 'huyet_de', text: 'Qua… qua được cả chốt hai rồi à?! Chỉ huy tính thiếu rồi — hắn tính ngươi chậm lại vì trận vừa rồi. Hắn không tính ngươi càng đuổi càng nhanh…' },
    { who: 'narrate', text: 'Cuối chặng đường mòn, bóng áo của kẻ chỉ huy đã hiện rõ phía trước — hắn đứng lại, quay người, tay cầm một pháp khí tròn nhỏ đang rung lên từng đợt sóng nhiễu dày đặc. Hắn không chạy nữa. Hắn chờ ngươi tới đúng tầm.' },
    { who: 'chi_huy_tran', text: 'Đuổi kịp nhanh hơn ta tính nửa khắc. Tốt — số liệu cuối cùng tự nó tìm tới. Giang Phàm, trận hôm nay ngươi thắng. Nhưng nhớ kỹ cảm giác này: một ngày nào đó, vòng nhiễu sẽ không chỉ có một khoảng trống trên đường mòn đâu.' }
  ];
  var SCENE_CH15_TRUY_DUOI_END = [
    { who: 'narrate', text: 'Pháp khí trong tay hắn vỡ tung thành một màn sóng nhiễu đặc quánh — không gây thương tích, chỉ che mắt và bịt mọi âm thanh trong mười nhịp thở. Khi màn nhiễu tan, khoảng đường trước mặt đã trống không: kẻ chỉ huy biến mất vào rừng như chưa từng đứng đó.' },
    { who: 'narrate', text: 'Nhưng hắn để lại một thứ không kịp mang theo: một mảnh pháp khí loạn sóng vỡ, rơi ngay chỗ hắn vừa đứng, các đường trận văn trên mặt mảnh còn đang nguội dần. Đây không phải mảnh vụn của mắt trận ngoài sân — đây là lõi điều khiển của cả đợt thử trận.' },
    { who: 'hero', mode: 'write', text: '(viết, tự ghi vào sổ tay) "Không bắt được người. Nhưng mảnh lõi này đáng giá hơn người: trận văn trên nó là chữ ký của kẻ chế tạo. Mang về đại điện — tông cần xem thứ này hơn cần nghe ta kể."' },
    { who: 'de_tu_ho_tong', text: '(đuổi kịp tới nơi, thở dốc) Sư huynh! Đoàn đã rút về hướng tông an toàn cả rồi. Còn tên chỉ huy… (nhìn mảnh vỡ trên tay ngươi) hắn thoát, nhưng sư huynh cầm được cái đó — đệ tử thấy bọn chúng lúc rút, mặt tên nào cũng như vừa mất một thứ rất đắt.' },
    { who: 'narrate', text: 'Trời sập tối trên đường mòn. Đợt thử trận đầu tiên của Huyết Bạc Cung khép lại: đoàn đệ tử nguyên vẹn, trận bị phá bằng kiếm thuần, và lõi điều khiển của chúng nằm trong tay tông môn.' },
    { who: 'narrate', text: 'Chỉ còn một việc: mang mảnh lõi này về đại điện, và nghe tông định đối sách. Vì cả ngươi lẫn trưởng lão đều hiểu — chúng sẽ còn quay lại, ở quy mô không còn là "thử" nữa.' }
  ];
  var SCENE_CH15_BAO_CAO = [
    { who: 'narrate', text: 'Thanh Vân Đại Điện, đêm. Mảnh lõi pháp khí vỡ đặt trên bàn, trận văn trên mặt nó vẫn le lói một thứ sáng xám yếu ớt khi có linh khí đi qua gần — như một con mắt chưa nhắm hẳn.' },
    { who: 'truong_lao_tong', text: 'Đoàn về đủ, không thiếu một người. Trận phá bằng kiếm, không một đòn cộng hưởng. Và ngươi mang về được cả lõi điều khiển của chúng. Giang Phàm — ngồi xuống, kể lại từ đầu, bằng cách của ngươi. Ta đọc chậm cũng được.' },
    { who: 'hero', mode: 'write', text: '(viết) "Chúng dựng vòng nhiễu quanh một khoảng trống, khóa sóng của đệ tử, rồi đo cách đệ tử phá trận. Kẻ chỉ huy nói thẳng: muốn bịt tai đệ tử thì dễ, bịt kiếm của đệ tử phải tính cách khác. Đệ tử đuổi theo, hắn thoát bằng pháp khí dùng một lần — mảnh lõi này rơi lại."' },
    { who: 'truong_lao_tong', text: 'Ta xem mảnh này rồi. Trận văn khắc tay, không phải hàng đúc sẵn: Huyết Bạc Cung đã có người chế được pháp khí loạn sóng theo đơn đặt — và đang thử nghiệm nó lên chính đệ tử của ta. Đây không còn là chuyện một hai toán cướp nữa.' },
    { who: 'lieu_khuynh_tien', text: 'Trưởng lão, ý của con: từ nay các đoàn ra ngoài không đi lẻ nữa. Mỗi đoàn phải có ít nhất một người phá được trận bằng vật lý — kiếm, phá mắt trận, đánh vào người cầm trận — không trông chờ vào một mình Giang Phàm và tai nghe của chàng.' },
    { who: 'truong_lao_tong', text: 'Theo ý ấy mà làm. Tông sẽ lập lệ mới cho đoàn ra ngoài ngay trong tháng này. Còn một việc ghi vào hồ sơ của tông, đọc cho ngươi nghe: "Huyết Bạc Cung học cách bịt tai Giang Phàm nhanh hơn ta tưởng. Nhưng hôm nay chúng cũng học thêm một điều — bịt được tai hắn, không bịt được kiếm của hắn."' },
    { who: 'hero', mode: 'write', text: '(viết) "Đệ tử ghi nhớ. Chúng đo đệ tử một lần, đệ tử cũng đo lại chúng một lần: vòng nhiễu của chúng khóa được sóng, nhưng phải dựng trước và phải có người cầm trận. Lần sau gặp lại, đệ tử sẽ tìm người cầm trận trước tiên."' },
    { who: 'narrate', text: 'Trưởng lão gật đầu, cho cất mảnh lõi vào kho vật chứng của tông. Trước khi ngươi lui ra, ông nói thêm một câu — giọng nhẹ hơn hẳn lúc bàn việc: sau chuỗi ngày toàn trận và thỉnh cầu, sơn môn cho ngươi một đợt tĩnh tu.' },
    { who: 'narrate', text: 'Ngoài núi, có một hệ quả không ai trong điện nhắc tới: mấy đợt thử trận liên tiếp những ngày qua đã làm kinh động một thứ ngủ rất lâu trong Thung Lũng Hồi Phong. Các đệ tử gác cổng sau núi bắt đầu đồn nhau rằng đêm xuống, trong thung lũng có tiếng kiếm ngân không người gảy.' },
    { who: 'narrate', text: 'Nhưng chuyện ấy để sau. Trước mắt ngươi là điểm linh khí của tông, và một giai đoạn tu vi sắp đầy.' }
  ];

  /* ================= CUNG IV — CHƯƠNG 16: TĨNH TU VÀ LĨNH NGỘ =================
     Nguyên văn từ ch16.js. Điểm ngắt engine: lần xuống bc_kiemtrung_sau
     chạy sau SCENE_CH16_LINH_NGO; trận boss Trận Nhãn Kiếm Linh chạy sau
     SCENE_CH16_KIEMTRUNG; đột phá q16_dot_pha qua tryBreakthrough sau
     SCENE_CH16_DOT_PHA (không thiên kiếp, không thông cáo). */
  var SCENE_CH16_TINH_TU = [
    { who: 'truong_lao_tong', text: 'Ngồi xuống một lát đã. Sau trận loạn sóng, tai ngươi nghe cái gì cũng còn vương một lớp nhiễu — ta nhìn sắc mặt là biết. Sơn môn cho ngươi một đợt tĩnh tu: không việc tông, không thỉnh cầu, không ai được làm phiền ngươi ở điểm linh khí.' },
    { who: 'truong_lao_tong', text: 'Tĩnh tu lần này không chỉ để hồi phục. Tu vi của ngươi đã gần đầy giai đoạn Sơ Kỳ — thổ nạp cho đầy hẳn đi. Nghe cho sạch lại trước, rồi hãy nghe cho sâu hơn. Hai việc ấy trông giống nhau mà khác nhau một trời.' },
    { who: 'hero', mode: 'write', text: '(viết) "Đệ tử hiểu. Mấy ngày nay trong tiếng nào cũng có một sợi lệch tần rất mảnh — như cát trong nước. Đệ tử sẽ ngồi tới khi nước trong lại."' },
    { who: 'narrate', text: 'Điểm linh khí của tông nằm ở sườn tây, nơi linh khí tụ thành một lớp sương mỏng quanh năm không tan. Ngươi ngồi xuống giữa lớp sương ấy, và Thanh Phong Chân Kinh bắt đầu vận hành: dải gió cuốn quanh người, lá ngọc theo gió mà lên — theo đúng tầng tâm pháp ngươi đang có, không nhanh hơn, không chậm hơn.' },
    { who: 'narrate', text: 'Ngày thứ nhất, sợi lệch tần còn đó. Ngày thứ hai, mỏng đi. Sang ngày thứ ba, trong lúc chu thiên đi qua vòng cuối của buổi sớm, ngươi bỗng nghe thấy một thứ chưa từng nghe: không phải tiếng của một vật — mà là tiếng của chính hai quyển công pháp trong người ngươi, vận hành cùng nhau như hai nhạc cụ trong cùng một dàn.' },
    { who: 'narrate', text: 'Và ở khoảng lặng giữa hai nhạc cụ ấy, có một khoảng trống. Rộng. Sâu. Như một giá sách còn thiếu nguyên một tầng trên cùng — chờ những quyển sách nặng hơn hai quyển ngươi đang cầm.' }
  ];
  var SCENE_CH16_LINH_NGO = [
    { who: 'narrate', text: 'Ngươi mang điều vừa nghe được lên đại điện. Trưởng lão nghe ngươi viết xong, im lặng một lúc lâu — rồi đứng dậy, tự tay mở cánh cửa tàng kinh phía sau điện, cánh cửa mà đệ tử nội môn đi qua mỗi ngày nhưng ít ai được bước vào.' },
    { who: 'truong_lao_tong', text: 'Thứ ngươi nghe thấy, các đời trưởng lão gọi là ngưỡng lĩnh ngộ. Từ Kim Đan trở đi, tai và tâm của người tu chạm được tới lớp của công pháp: hai quyển Hoàng cấp ngươi đang giữ chỉ là tầng dưới của giá sách ấy. Phía trên chúng là Huyền cấp.' },
    { who: 'truong_lao_tong', text: 'Luật của tông, ta nói rõ một lần: từ Kim Đan, đệ tử được đọc tới Huyền cấp. Sách Huyền cấp nằm ở tàng kinh này — và nằm ở những nơi sâu hơn nữa, trong các bí cảnh mà tông chỉ giữ cửa chứ không giữ sách thay người tu. Ai đủ sức lấy, sách thuộc về người ấy.' },
    { who: 'hero', mode: 'write', text: '(viết) "Đệ tử nghe thấy tầng trống ấy rồi. Nhưng sáng nay, khi chu thiên đi qua, đệ tử còn nghe một thứ khác nữa — ở rất sâu dưới Kiếm Trủng sau núi: một chu kỳ. Kiếm bay theo vòng, đều như hơi thở của một cái trận còn đang sống."' },
    { who: 'truong_lao_tong', text: 'Ngươi nghe được tới đó rồi sao… Kiếm Ý Tàn Hồn ngươi thắng năm Trúc Cơ, hóa ra chỉ là kẻ giữ cửa. Dưới Kiếm Trủng còn một tầng sâu: lõi của một kiếm trận cổ, ngủ mà không chết. Tông phong cửa ấy nhiều đời vì không ai nghe được chu kỳ của nó — không nghe được, vào là chết trong trận của chính nó.' },
    { who: 'truong_lao_tong', text: 'Nay thì khác. Tông cho phép ngươi xuống xác minh ngay trong đợt tĩnh tu này — với một điều kiện của ta: nghe không rõ thì rút, đừng cố. Khung Huyền của ngươi vừa mở ở tàng kinh này; nếu dưới ấy thật có thứ của Huyền cấp, nó là của người nghe được nó.' },
    { who: 'narrate', text: 'Cụm kiếm cắm chắn động sau núi được dời ra. Phía sau là một cầu thang đá đi xuống bóng tối, và từ dưới ấy, chu kỳ kiếm trận vọng lên từng nhịp đều đặn — như một trái tim bằng sắt đang ngủ.' },
    { who: 'narrate', text: 'Ngươi bước xuống. Đèn đá hai bên vách tự sáng lên theo bước chân, và nhịp chu kỳ dưới sâu nghe rõ dần: bảy thanh kiếm bay theo một vòng trận không đổi — một vũ điệu đã lặp lại không biết bao nhiêu năm, chờ một người nghe được nó.' }
  ];
  var SCENE_CH16_KIEMTRUNG = [
    { who: 'narrate', text: 'Tầng sâu Kiếm Trủng. Hang dưới rộng và tối hơn tầng trên một nấc; tàn hồn kiếm ý giữ cửa vẫn mang luật cũ của Kiếm Trủng — âm gốc không ổn định, cộng hưởng chỉ chạm được một nửa. Nhưng thứ ở cuối hang thì khác hẳn.' },
    { who: 'narrate', text: 'Cuối hang, một cột kiếm sáng xỉn xoay quanh một mắt trận đang phát sáng: Trận Nhãn Kiếm Linh — lõi điều khiển của cả kiếm trận cổ. Bảy thanh kiếm bay theo vòng quanh nó, đổi hướng sau mỗi chu kỳ, đường bay đều tới mức ngươi đọc trước được bằng tai.' },
    { who: 'hero', mode: 'write', text: '(viết, tự ghi vào sổ tay) "Tàn hồn giữ cửa không có âm gốc ổn định. Nhưng cái này thì có — ổn định tới mức đáng sợ. Nó là một cái trận đang vận hành theo chu kỳ. Mà thứ vận hành theo chu kỳ… thì có thể bị đóng băng đúng chu kỳ."' },
    { who: 'narrate', text: 'Như nghe được ý nghĩ ấy, cột kiếm bỗng gom toàn bộ kiếm của trận về một điểm phía trên mắt trận — chu kỳ tăng tốc nghe rõ bằng tai: chiêu lớn của nó đang nạp, và cửa sổ để ngắt nó chính là nhịp gom này. Định Âm giữ chu kỳ. Phong Âm khóa từng mắt trận phụ. Kiếm quyết kết liễu ở cửa sổ đứng yên.' },
    { who: 'narrate', text: 'Không có chiêu nào trong ba chiêu ấy là điều kiện bắt buộc của trận này: né quạt kiếm, chờ nó tự hở một nhịp sau khi xả, rồi dồn đòn — đường chậm hơn vẫn là đường thắng. Nhưng hôm nay, lần đầu tiên, bậc Hưởng của ngươi là công cụ phá thế trận chứ không chỉ là đòn đánh.' }
  ];
  var SCENE_CH16_BENH_VUC = [
    { who: 'narrate', text: 'Ngươi trở lên từ tầng sâu, tay cầm một vật gói trong vải thô: tàn quyển nhặt được bên cột kiếm đã gục của Trận Nhãn — bìa cháy dở, chỉ còn đọc được ba chữ ở gáy sách. Tin ngươi xuống tầng sâu và sống sót trở lên lan khắp tông trước cả khi ngươi về tới đại điện.' },
    { who: 'narrate', text: 'Thanh Vân Đại Điện, chiều cùng ngày. Một vị trưởng lão giữ việc tàng kinh đứng ra giữa điện, giọng không cao nhưng từng chữ đều nặng — ông chất vấn chính sách của tông với ngươi, ngay trước mặt các trưởng lão khác.' },
    { who: 'truong_lao_tong', text: 'Ta phải nói một câu khó nghe. Đệ tử này vào tông với hồ sơ vô linh căn, thân phận Hồn Sư từng giấu cả tông, nay lại được mở tàng kinh, mở cả tầng sâu Kiếm Trủng mà các đời trưởng lão còn phải cân nhắc. Tông dùng người thế này — xin hỏi các vị: là trọng dụng, hay là đang liều?' },
    { who: 'lieu_khuynh_tien', text: 'Trưởng lão hỏi "tông dùng người thế này là trọng dụng hay là liều" — con xin đáp bằng một việc có thật. Ở Thăng Long Đạo, con đã thua chàng. Không phải thua vì chàng giấu nghề: con thua vì kiếm của chàng sạch hơn kiếm của con, ngay trước mặt cả đài.' },
    { who: 'lieu_khuynh_tien', text: 'Từ ngày vào tông tới nay, chàng làm tạp dịch không thiếu một việc, giữ đài cho người khác Kết Đan mà không đòi một lời cảm ơn, phá trận cứu đoàn đệ tử bằng kiếm khi tai nghe bị khóa. Tông không "liều" khi mở tàng kinh cho một người như thế. Tông chỉ đang làm một việc rất muộn: đối xử với chàng đúng như chàng đã đối xử với tông.' },
    { who: 'lieu_khuynh_tien', text: 'Còn hai chữ "vô linh căn" trong hồ sơ — con là con gái tông chủ, con nói câu này và chịu trách nhiệm về nó: hồ sơ ấy sai từ ngày đầu tiên. Sai ở cái thước, không sai ở con người. Ai còn muốn giữ hai chữ ấy để làm khó chàng, thì làm khó luôn cả con.' },
    { who: 'truong_lao_tong', text: '…Liễu nha đầu nói tới mức này rồi. Ta giữ việc tàng kinh ba mươi năm, ta hỏi khó là bổn phận của ta — nhưng đáp án hôm nay, ta nghe rõ. Việc mở tàng kinh và tầng sâu cho Giang Phàm: ghi vào sổ của tông, từ nay là lệ, không phải ngoại lệ. Ai hỏi nữa, đọc sổ.' },
    { who: 'hero', mode: 'write', text: '(viết) "Đệ tử không biết nói lời cảm ơn cho đủ. Chỉ ghi một câu: tàng kinh mở cho đệ tử, đệ tử sẽ dùng nó cho việc của tông. Tầng sâu mở cho đệ tử, những gì lấy được từ đó, tông có phần trong ấy trước tiên."' },
    { who: 'narrate', text: 'Cả điện im lặng một khắc. Mười mấy năm, ngươi toàn tự mình đứng trước những lời chất vấn — bằng chữ viết, bằng kiếm, bằng sự im lặng. Hôm nay là lần đầu tiên có một người khác đứng ra, dùng tiếng nói của chính họ, nói thay cho ngươi — và nói trước khi ngươi kịp viết một chữ nào.' },
    { who: 'lieu_khuynh_tien', text: '(lúc lui ra cửa điện, nói khẽ, chỉ đủ cho ngươi nghe) Đừng quen với việc có người nói thay, Giang Phàm. Ta nói thay ngươi được ở điện này — nhưng những nơi ngươi sắp đi, tiếng của ta không tới được. Tới lúc ấy, nhớ lấy ngày hôm nay: có người tin là tiếng của ngươi, dù phát ra bằng cách nào, cũng đáng được nghe.' },
    { who: 'narrate', text: 'Tu vi của ngươi đã đầy giai đoạn từ đợt tĩnh tu. Chỉ còn một việc cuối của chương: lên đài, và bước qua ngưỡng Kim Đan Trung Kỳ — lặng lẽ, như mọi mốc lớn của đời ngươi từ trước tới nay.' }
  ];
  var SCENE_CH16_DOT_PHA = [
    { who: 'narrate', text: 'Đài tông, buổi sớm. Không chuông lớn, không khán giả, không một lời tuyên cáo nào vang lên trời đất — đột phá một giai đoạn trong cùng đại cảnh giới không cần những thứ ấy. Chỉ có trưởng lão đứng giữ đài, như ông vẫn đứng cho mọi đệ tử tới lượt mình.' },
    { who: 'truong_lao_tong', text: 'Vận công đi. Giai đoạn này không có kiếp nào chờ ngươi cả — thứ chờ ngươi là chính chu thiên của ngươi, đầy và chín từ đợt tĩnh tu. Ta giữ cửa. Ngươi cứ nghe cho sâu như ngươi vẫn nghe.' },
    { who: 'narrate', text: 'Chu thiên khép lại vòng cuối trong tĩnh lặng gần như tuyệt đối — và ở khoảng lặng ấy, kim đan trong đan điền trầm xuống, đặc lại, sáng theo một cách khác hẳn: Kim Đan Trung Kỳ. Không cột sáng nào phóng lên trời. Chỉ có lớp sương ở điểm linh khí phía xa, cùng lúc ấy, tan ra một vòng tròn đều quanh hướng đài.' },
    { who: 'truong_lao_tong', text: 'Xong rồi. Trung Kỳ. (ông nhìn ngươi một lúc rồi khẽ cười) Người ngoài nhìn vào sẽ nói mốc này của ngươi yên tĩnh quá. Chỉ ngươi và ta biết: để có được cái yên tĩnh này, ngươi vừa đi qua một trận loạn sóng, một tầng sâu không ai dám xuống, và một buổi chất vấn ở đại điện. Yên tĩnh, là phần thưởng của ngươi đấy.' },
    { who: 'narrate', text: 'Tàn quyển trong tay ngươi — ba chữ ở gáy sách đọc rõ hơn dưới nắng sớm. Hành trình của nó và của ngươi, ở tầng sâu Kiếm Trủng, mới chỉ bắt đầu: tầng sâu ấy từ nay mở cho ngươi quay lại mỗi ngày.' }
  ];

  /* ---------- Thoại thường trú của các nhân vật mới (phần 3) ---------- */
  IDLE_AFTER.tin_su = [
    { who: 'npc', text: 'Tiểu nhân chạy hai ngày một đêm không dám ngủ. Đại tiểu thư dặn: tin phải tới tay Giang công tử trước khi trời tối, trễ một khắc là mất một mạng.' },
    { who: 'npc', text: 'Đoàn xe vẫn còn người sống trong thung lũng ấy. Công tử đi nhanh lên — tiểu nhân lạy công tử đấy.' }
  ];
  IDLE_AFTER.gia_nhan = [
    { who: 'npc', text: 'Qua được cửa thung lũng rồi… Tiểu nhân tưởng đêm nay là đêm cuối của cả đoàn. Đại tiểu thư giữ mọi người bình tĩnh suốt từ lúc bị vây tới giờ.' },
    { who: 'npc', text: 'Cậu gia nhân trẻ bị thương ở tay đã qua cơn nguy rồi. Nghe nói lúc nguy nhất, có một luồng sáng lạ giữ cho cậu ấy không mê đi… chắc tiểu nhân hoa mắt thôi.' }
  ];
  IDLE_AFTER.mo_cuu_u = [
    { who: 'npc', text: 'Đứng ngắm hoa anh đào à? Cây này ở cửa thung lũng lâu hơn cả Huyết Bạc Cung của ta. Ngắm cho kỹ — lát nữa có khi không còn lúc nào thong thả thế này đâu.' },
    { who: 'npc', text: 'Ta không thích giết người thừa. Việc của ta hôm nay chỉ có một: đưa người của Hứa gia đi, và xem ngươi sẽ làm gì.' }
  ];
  IDLE_AFTER.huyet_de = [
    { who: 'npc', text: 'Đừng… đừng tới gần. Tả sứ dặn rồi: nhiệm vụ là bắt sống người Hứa gia, không phải giết ngươi. Bọn ta chỉ làm theo lệnh thôi…' },
    { who: 'npc', text: 'Trong cung, người ta gọi ngươi là "đứa con của người ở bến đò". Bọn ta cũng chỉ biết có thế. Thật đấy.' }
  ];
  IDLE_AFTER.de_tu_ho_tong = [
    { who: 'npc', text: 'Sư huynh, đệ được lệnh hộ tống đoàn Hứa gia về tới tận trấn. Đường về đệ thuộc từng ổ gà — huynh cứ yên tâm lo việc trong thung lũng.' },
    { who: 'npc', text: 'Đệ gác ở bãi đáp này từ lúc vào thung lũng. Có động tĩnh gì lạ, đệ sẽ huýt sáo báo ngay.' }
  ];
  IDLE_AFTER.bach_kinh_duong = [
    { who: 'npc', text: 'Hồ sơ không biết nói dối, cậu Giang. Chỉ có người ghi hồ sơ mới nói dối — vì thế ta mới tự tay ghi mọi dòng quan trọng suốt hai mươi năm.' },
    { who: 'npc', text: 'Ngồi xuống uống chén trà đã. Người mang bí mật đi qua cửa lầu này, ra về nhẹ hơn lúc vào — hoặc không ra về được nữa. Cậu thuộc loại nào, lát nữa sẽ rõ.' }
  ];
  IDLE_AFTER.ky_luc_quan = [
    { who: 'npc', text: 'Tiểu nhân chỉ ghi chép. Giám sát sứ đọc gì, tiểu nhân ghi nấy — không thêm một chữ, không bớt một chữ.' },
    { who: 'npc', text: 'Hồ sơ của cậu là chồng giấy dày nhất phòng này tháng này đấy. Tiểu nhân phải thay bút hai lần rồi.' }
  ];
  IDLE_AFTER.tiep_khach = [
    { who: 'npc', text: 'Khách có thiệp mời thì mời vào sảnh. Không có thiệp — lầu này không có gì để xem cả, thật đấy.' },
    { who: 'npc', text: 'Trà trong lầu lúc nào cũng nóng. Việc của tiểu nhân là rót trà và nhớ mặt khách — mặt nào vào lầu, tiểu nhân nhớ hết.' }
  ];
  IDLE_AFTER.gac_kho = [
    { who: 'npc', text: 'Kho này toàn hồ sơ và cuộn giấy của các, xếp theo năm. Cậu đừng chạm vào — giấy cũ hơn cả tuổi cậu đấy.' },
    { who: 'npc', text: 'Người ngoài hay tưởng Thiên Cơ Các giấu vàng trong kho. Sai rồi: thứ các giấu là chuyện của thiên hạ — nặng hơn vàng nhiều.' }
  ];

  /* ================= BÍ CẢNH + HỆ CÀY — LÀN D (thoại + giọng) =============
     Các cảnh lần đầu của hệ bí cảnh (docs/bicanh-prep/bicanh-design.md) và
     khung dẫn lượt lặp luyện hồn C-10 (docs/retention-prep/parent-decisions.md).
     Giang Phàm không cất lời ở đây: chỉ lời dẫn, tiếng lòng và lời NPC.
     SCENE_BC_HOIPHONG_THU chỉ hé tên người chết (Thạch Vạn Quân) — nội dung
     thư để đội chương 11 quyết, không viết ở đây. */
  var SCENE_BC_THUYLIEM_INTRO = [
    { who: 'narrate', text: 'Trạm nghỉ sau trận phục kích đã vắng người. Trên phiến đá gần bờ suối, một vệt máu khô kéo dài về phía thác nước — kẻ trinh sát bị thương của Huyết Bạc Cung đã rút theo đường này.' },
    { who: 'narrate', text: 'Ngươi lần theo vệt máu qua bãi sỏi, tới một thác nước giữa đường mòn. Sau màn thác, khe đá tối mở ra một lối vào mà mắt thường nhìn qua sẽ bỏ sót.' },
    { who: 'narrate', text: 'Một lối vào giấu sau nước — kẻ rút chạy không chọn đường này vì tiện. Hắn chọn vì có người chờ bên trong.' },
    { who: 'narrate', text: 'Trong động, hơi nước lạnh phả vào mặt. Trên vách đá, một dấu ấn bạc mờ khắc vội — ấn ký của Huyết Bạc Cung, giống hệt dấu trên tay áo kẻ phục kích.' },
    { who: 'narrate', text: 'Bên cạnh ấn ký, một dòng chữ khắc dở dang, nét chữ run vì mất máu: "Sau núi… còn một đường…" — câu chữ đứt ngang ở đó, như người viết đã gục xuống giữa chừng.' },
    { who: 'narrate', text: 'Sâu trong động, tiếng nước nhỏ giọt đều đặn, và xen giữa tiếng nước là một tiếng trườn khẽ qua mặt đá ướt — có thứ gì đó đang giữ cửa động này.' },
    { who: 'narrate', text: 'Ngươi khẽ lùi ra cửa động, ghi nhớ mọi dấu vết: ấn ký, dòng chữ dở, tiếng trườn trong tối. Chuyện đường mòn chưa khép — nó chỉ đổi chỗ, từ mặt đất xuống lòng hang.' },
    { who: 'narrate', text: 'Màn thác buông xuống sau lưng ngươi, che kín lối vào như chưa từng có ai qua. Động này sẽ còn ở đây — và những kẻ dùng nó làm điểm chôn tang vật cũng sẽ còn quay lại.' },
    { who: 'narrate', text: 'Ngươi quay lại trạm nghỉ, lòng đã có quyết: khi nào sẵn sàng, sẽ trở lại đây, đi hết hang động tới khoang cuối cùng.' },
    { who: 'narrate', text: 'Gió từ trong động thổi ra, mang theo hơi nước lạnh và mùi tanh thoang thoảng của loài bò sát. Thủy Liêm Động đang chờ — như một câu hỏi chưa ai trả lời.' }
  ];
  var SCENE_BC_TAPHA_INTRO = [
    { who: 'thap_chu', text: 'Cậu Giang. Từ ngày cậu đo vượt cửu phẩm, phế tích dưới sảnh tháp bắt đầu có phản ứng — bia đá cũ rung khẽ mỗi khi cậu bước qua sảnh.' },
    { who: 'thap_chu', text: 'Dưới sảnh này có một tầng hầm, nơi tháp lưu giữ tàn tích của những lần đo dị thường ba trăm năm qua: bia ghi chép và phế thước của những người từng làm thước "lệch vạch".' },
    { who: 'thap_chu', text: 'Theo lệ, tầng ngoài chỉ mở cho người đã đo xong thước của mình. Cậu đã đo xong — ta mở cho cậu vào xem, không phải để khoe, mà để cậu biết mình không phải người đầu tiên làm thước lệch.' },
    { who: 'narrate', text: 'Người giữ tháp đặt tay lên một phiến đá ở góc sảnh. Đá trượt sang bên, lộ cầu thang dẫn xuống tầng hầm, hơi lạnh và mùi giấy cũ bốc lên.' },
    { who: 'thap_chu', text: 'Xuống đây thì đừng hỏi, hỏi thì đừng xuống sâu. Tầng ngoài chỉ có bia và tượng đá giữ cửa — xem xong thì lên, đừng nấn ná. Còn tầng sâu hơn, hôm nay chưa tới lúc nói.' },
    { who: 'narrate', text: 'Ngươi bước xuống cầu thang đá. Sau lưng, phiến đá khép lại, tiếng bước chân của ngươi vang vọng giữa hàng bia cũ — và ở đâu đó dưới này, một phế thước khẽ rung lên như nhận ra khí tức của ngươi.' },
    { who: 'thap_chu', text: 'Một lời cuối, cậu Giang: những gì cậu thấy dưới này, ra khỏi tháp thì giữ trong lòng. Tháp giữ bí mật cho người đo dị thường — và người đo dị thường cũng giữ bí mật cho tháp.' },
    { who: 'narrate', text: 'Ánh đèn đồng trên tường hầm cháy leo lét, soi rõ hàng bia đầu tiên: những cái tên đã mờ, những vạch đo lệch khỏi chín màu — và một chỗ trống cuối hàng, như đang chờ thêm một cái tên.' }
  ];
  var SCENE_BC_TAPSAU_INVITE = [
    { who: 'narrate', text: 'Vừa bước vào khuôn viên tháp, người giữ tháp đã chờ sẵn ở cổng, tay cầm một phong thư mỏng niêm bằng sáp tháp.' },
    { who: 'thap_chu', text: 'Cậu Giang, thư này của tháp gửi cậu — không phải của ta viết, mà là lệ tháp tự mở khi có người đo dị thường quay lại với tu vi Trúc Cơ.' },
    { who: 'narrate', text: 'Ngươi mở thư. Nét chữ cứng cáp, chỉ vài dòng: "Người đã đo vượt cửu phẩm, nay đã đứng ở Trúc Cơ — phế tích dưới tháp xin mời xuống tầng sâu. Nơi đó giữ tàn ảnh của lần đo dị thường lớn nhất trong sử sách tháp."' },
    { who: 'thap_chu', text: 'Tầng sâu không giống tầng ngoài đâu. Tàn ảnh ở dưới đó không nói tiếng người, nhưng nó "nhận ra" khí tức — và cái nó nhận ra, có khi chính là thứ cậu chưa dám gọi tên.' },
    { who: 'narrate', text: 'Ngươi gấp thư lại. Lệ tháp đã mở lời mời — từ nay, cầu thang dưới sảnh tháp dẫn thêm một tầng nữa, xuống nơi mà ba trăm năm nay tháp chỉ dám ghi là "phế tích không gọi được tên".' },
    { who: 'thap_chu', text: 'Đi hay không, cậu tự quyết. Nhưng nếu xuống, nhớ lời cũ: xuống đây thì đừng hỏi — và ở tầng sâu, đừng hỏi cả tàn ảnh, vì nó không trả lời bằng lời.' }
  ];
  var SCENE_BC_TAPSAU_INTRO = [
    { who: 'narrate', text: 'Cầu thang đá dẫn xuống sâu hơn tầng ngoài, tới một sảnh hầm rộng mà ánh đèn không soi tới hết. Giữa sảnh, một phế thước bằng đá đứng im, trên thân khắc chín vạch màu đã mờ.' },
    { who: 'narrate', text: 'Ngươi bước tới gần. Phế thước khẽ rung — rồi một vạch sáng thứ mười, trong suốt như nước, chậm rãi hiện lên phía trên vạch cửu phẩm, đúng chỗ thước của ngươi từng vượt qua.' },
    { who: 'narrate', text: 'Nó không đo ta. Nó nhận ra ta — như gặp lại một người từng đi qua nơi này, từ rất lâu trước khi ta ra đời.' },
    { who: 'narrate', text: 'Cuối sảnh, một tàn ảnh không mặt đứng lặng trước phế thước: hình bóng mờ như khói, không nói, không cử động, chỉ hướng về phía ngươi như đang chờ.' },
    { who: 'narrate', text: 'Không khí trong hầm nặng dần. Tàn ảnh giơ một tay về phía phế thước — chín vạch màu trên thân thước sáng lên lần lượt, rồi tắt dần, như một câu hỏi không lời: ngươi có xếp lại được trật tự của chúng không?' },
    { who: 'narrate', text: 'Ngươi hiểu ra: cửa vào phòng tàn ảnh nằm sau cửa phế thước kia. Xếp chín mảnh sắc đúng thứ tự thước đã leo — hoặc dùng một đòn Chấn Âm phá cửa, nếu ngươi chấp nhận cái giá của dư âm trong nơi này.' },
    { who: 'narrate', text: 'Phía trên, người giữ tháp vẫn ở tầng ngoài. Ông sẽ nghe thấy tiếng động nếu cửa bị phá — và dư âm của đòn ấy sẽ còn rung lại trong hầm. Một nhân chứng gián tiếp, nhẹ nhất mà vẫn là nhân chứng.' },
    { who: 'narrate', text: 'Ngươi hít sâu, để Tĩnh Âm lắng xuống. Tầng sâu này không đòi ngươi mạnh hơn — nó đòi ngươi nhớ rõ mình đã đi qua những vạch nào, và dám đi tiếp khi không còn vạch nào để bám.' },
    { who: 'narrate', text: 'Tàn ảnh khẽ nghiêng đầu, như gật. Vạch sáng thứ mười trên phế thước vẫn còn đó, lặng lẽ — dữ kiện chỉ mình ngươi biết, và từ nay cũng là dấu hiệu rằng tầng sâu đã mở mắt với ngươi.' },
    { who: 'narrate', text: 'Từ đây, Tàn Tích tầng sâu là nơi ngươi có thể quay lại mỗi ngày: luyện hồn, đối mặt tàn ảnh, và giữ lấy bí mật mà Thiên Cơ Các đang muốn biết — bí mật về một linh căn không nằm trong chín màu.' }
  ];
  var SCENE_BC_KIEMTRUNG_INTRO = [
    { who: 'truong_lao_tong', text: 'Giang Phàm, ngươi còn nhớ cửa động bị kiếm cắm chắn ở rừng sau núi chứ? Hôm hái dược, ngươi thấy nó mà chưa vào được — vì kiếm ý ở đó nặng hơn tu vi Luyện Khí chịu nổi.' },
    { who: 'truong_lao_tong', text: 'Nay ngươi đã Trúc Cơ, ta nói rõ cho ngươi biết: đó là Kiếm Trủng — mộ kiếm của một tiền bối kiếm tu vô danh của tông, người xưa kia cũng bị tông ghi hồ sơ là "tư chất không đo được", rồi mất tích sau một đêm.' },
    { who: 'narrate', text: 'Trưởng lão im lặng một lúc, mắt nhìn về phía sau núi. Trong giọng ông có thứ gì đó không giống lệnh tông môn — giống một món nợ cũ hơn.' },
    { who: 'truong_lao_tong', text: 'Tông ghi người ấy là niềm xấu hổ bị giấu. Ta không nói thế. Một kiếm tu bị thước đo bỏ sót mà vẫn luyện tới mức kiếm ý còn lại sau khi chết — người như thế, tông nợ họ một dòng sửa trong tàng thư.' },
    { who: 'truong_lao_tong', text: 'Vào được Kiếm Trủng, đi tới mộ thất, thì tông sẽ lặng lẽ sửa lại một dòng trong tàng thư cho tiền bối ấy. Không phải vì ngươi xin — vì có người cuối cùng đã tới được nơi mà hồ sơ nói là không ai tới được.' },
    { who: 'narrate', text: 'Ông đưa ngươi một tấm lệnh bài gỗ đã mòn: "Cầm lấy. Kiếm cắm ở cửa động nhận lệnh bài này thì dạt sang hai bên. Còn kiếm trận trong hành lang — cái đó không nhận lệnh bài, chỉ nhận bước chân vững."' },
    { who: 'truong_lao_tong', text: 'Nghe kỹ: mộ thất bị tĩnh mặc trấn phong. Muốn mở, hoặc đứng yên trong vòng tròn trước cửa mà thổ nạp đủ lâu — lắng nghe cho thấu như tiền bối đã lắng nghe; hoặc gõ một đòn đối hưởng phá trấn, và chấp nhận rằng kiếm ý trong động sẽ nhớ lấy dư âm ấy.' },
    { who: 'narrate', text: 'Ngươi nắm chặt lệnh bài. Sau núi, nơi từng chỉ có phục kích và dược thảo, nay có thêm một nấm mộ kiếm đang chờ người đo được bằng thước khác — thước của chính mình.' },
    { who: 'truong_lao_tong', text: 'Đi đi. Và nhớ: tiền bối ấy không phải họ hàng của ngươi, cũng không phải sư phụ nào đó chờ nhận đồ đệ. Đừng tự thêu thêm thân phận cho người đã khuất — chỉ cần tới nơi, và đi hết con đường của họ.' },
    { who: 'narrate', text: 'Cửa Kiếm Trủng sau núi đã mở với ngươi. Mỗi ngày, ngươi có thể vào một lượt — qua sảnh kiếm gỉ, hành lang kiếm trận, khoang bia, tới mộ thất nơi kiếm ý tàn hồn đang chờ.' }
  ];
  var SCENE_BC_HOIPHONG_INTRO = [
    { who: 'narrate', text: 'Bãi bắc Thung Lũng Hồi Phong sau trận đối đầu vẫn còn ngổn ngang đá lở. Một trận sạt đất do trận đánh gây ra đã xé toạc sườn đồi — và dưới lớp đất mới lở, nền một ngôi mộ cổ lộ ra, không bia, không tên.' },
    { who: 'de_tu_ho_tong', text: 'Giang sư huynh, nhìn kìa — đá lở để lộ cả một lối xuống! Mộ này không có bia… mà oán khí từ dưới bốc lên đặc như sương, đứng đây đã thấy lạnh sống lưng.' },
    { who: 'narrate', text: 'Ngươi bước tới mép nền mộ. Dưới ánh đuốc, bậc đá dẫn xuống tối dần, hai bên là đèn đá thấp đã tắt từ lâu, và một phiến đá khắc mờ ký hiệu mà ngươi từng thấy trên nửa miếng ngọc bội của phụ thân.' },
    { who: 'de_tu_ho_tong', text: 'Sư huynh định xuống thật sao? Huyết Bạc Cung bịt hai đầu thung lũng, một phần chính vì không muốn ai tới gần mộ này — dưới đó có thể là vật chứng của mối thù năm xưa, cũng có thể là cạm bẫy chúng bày sẵn.' },
    { who: 'narrate', text: 'Ngươi gật đầu, không viết, không nói — chỉ siết chặt chuôi kiếm. Đệ tử đi cùng hiểu ý, giương đuốc đi trước một bước, soi từng bậc đá.' },
    { who: 'de_tu_ho_tong', text: 'Được, ta đi cùng huynh. Một mình huynh xuống mộ của người chết trận, lỡ oán khí tụ lại thì ai kéo huynh ra? Hai người vẫn hơn một — và chuyện này, ta cũng muốn biết tới cùng.' },
    { who: 'narrate', text: 'Trong tiền thất, bụi và đá vụn phủ kín sàn. Giữa thất, một bệ đá thấp đặt một bức thư chưa gửi và nửa miếng ngọc bội — vật chứng nằm đó như đã chờ ai đó tới nhận, từ nhiều năm trước.' },
    { who: 'narrate', text: 'Ngươi cầm bức thư lên. Giấy đã ố vàng, nét chữ run run của người viết trong đêm trước trận đánh — nhưng ngươi chưa mở đọc vội, vì oán khí trong mộ đang cuộn lại phía mộ thất.' },
    { who: 'narrate', text: 'Thư chưa gửi, ngọc bội vỡ nửa — người chết trong mộ này mang theo một câu chuyện chưa kịp nói ra, và chính câu chuyện ấy giữ hồn người lại.' },
    { who: 'de_tu_ho_tong', text: 'Sư huynh, nghe kìa… từ mộ thất vọng ra tiếng gì đó như tiếng thở dài, không phải gió. Ta đi trước soi đường — huynh đi sau, giữ khoảng cách với oán khí, đừng để nó chạm vào thần hồn.' },
    { who: 'narrate', text: 'Hành lang cơ quan nhẹ: đá rơi theo nhịp, từng đợt một, đủ để người cẩn thận đi qua mà không sứt mẻ — và đủ để kẻ vội vàng phải trả giá.' },
    { who: 'narrate', text: 'Qua hậu thất, một tinh anh mộ giữ cửa cuối cùng gục xuống dưới kiếm của ngươi. Trước mặt chỉ còn mộ thất — nơi oán hồn của người chết trận năm xưa đang chờ, chưa yên.' },
    { who: 'de_tu_ho_tong', text: 'Tới đây thì ta không đi trước nữa đâu, sư huynh. Oán hồn trong kia chỉ đáp lại âm gốc của chính nó — hoặc cảm được hồn lực của người biết trấn an. Huynh chọn đường nào, ta đứng sau lưng huynh mà chứng kiến.' },
    { who: 'narrate', text: 'Cổ Mộ Hồi Phong đã mở. Từ nay, mỗi ngày ngươi có thể xuống đây một lượt — đọc thư, đi qua ba khoang, và đối mặt với oán hồn bằng đáp âm, bằng luyện hồn, hoặc bằng kiếm.' }
  ];
  var SCENE_BC_HOIPHONG_THU = [
    { who: 'narrate', text: 'Ngươi mở bức thư chưa gửi trên bệ đá. Giấy ố vàng, nét chữ run run — nhưng những dòng trong thư thuộc về một câu chuyện mà người viết chưa kịp gửi đi, nên ngươi không đọc thành lời ở đây.' },
    { who: 'narrate', text: 'Một điều ngươi ghi nhớ chắc chắn, không thể nhầm: tên người chết trong mộ này là Thạch Vạn Quân.' },
    { who: 'narrate', text: 'Ngươi gấp thư lại, đặt về bệ đá. Cái tên ấy — Thạch Vạn Quân — cho ngươi biết phải nghe tìm âm gốc của ai trong đám oán khí, nếu ngươi chọn đường đáp âm. Còn nội dung thư, hãy để tới khi câu chuyện cần tới nó.' }
  ];
  var SCENE_BC_HOIPHONG_TRANTOI = [
    { who: 'oan_hon', text: 'Thạch Vạn Quân… Đã bao nhiêu năm rồi, mới có người gõ trả đúng âm gốc của ta — như gọi đúng tên ta vậy.' },
    { who: 'oan_hon', text: 'Ta chết trận năm ấy, oán khí giữ ta lại nơi này — không phải vì hận, mà vì chưa có ai đáp lại đúng âm của ta để gọi ta về.' },
    { who: 'oan_hon', text: 'Người trẻ, cảm ơn ngươi đã đọc bức thư chưa gửi và đáp đúng âm của ta. Một người chết trận, chỉ cần có thế là đủ để buông kiếm xuống.' },
    { who: 'oan_hon', text: 'Ta yên nghỉ đây… Gió trong mộ từ nay sẽ nhẹ hơn. Đi đi, và sống thay cả phần của những kẻ đã nằm xuống…' }
  ];
  /* Cảnh mở đầu lần đầu vào Tầng Ngoài Di Tích Trận Tâm (đợt bí cảnh
     boss tổ đội): lời dẫn + MỘT dòng chữ viết của Giang Phàm (chữ viết
     không tiếng như luật nhân vật). Tâm trận (tầng sâu) không có cảnh
     mở đầu — tiền lệ tầng sâu Kiếm Trủng. */
  var SCENE_BC_TRANTAM_INTRO = [
    { who: 'narrate', text: 'Sau núi Thanh Vân Tông, dưới cụm kiếm phong ấn mà ít đệ tử dám tới gần, là miệng hang của Di Tích Trận Tâm — lõi trận ba động năm xưa chìm xuống đất sâu khi trận sụp.' },
    { who: 'narrate', text: 'Trận đã phá, khe đã bịt, nhưng tâm trận chưa tắt. Trưởng lão nói: thứ còn chạy dưới này không còn là trận của người nữa — nó tự chạy, tự giữ, và tự ghét kẻ sống bước vào.' },
    { who: 'hero', mode: 'write', text: '(viết) "Tâm chưa tắt thì họa chưa dứt. Vào dọn cho sạch."' },
    { who: 'narrate', text: 'Ngươi siết chặt chuôi kiếm, bước xuống hành lang đá lạnh. Sau lưng, trận văn trên vách lần lượt sáng lên như mắt mở.' }
  ];
  var SCENE_C10_SOUL_A = [
    { who: 'narrate', text: 'Tàn Tích tầng sâu sau một thời gian im ắng lại mở cửa với ngươi. Lần này ngươi tới không phải để khám phá — mà để luyện hồn, công khai, như một Hồn Sư đã tự mình nói ra thân phận.' },
    { who: 'narrate', text: 'Phế thước vẫn đứng đó, vạch sáng thứ mười lặng lẽ hiện lên khi ngươi tới gần. Tàn ảnh không mặt nghiêng đầu, như nhận ra người quen.' },
    { who: 'narrate', text: 'Tự mình nói ra — từ nay không còn đêm nào phải luyện trong bóng tối nữa. Hồn lực này là của ta, và ta không giấu nó.' },
    { who: 'narrate', text: 'Ngươi ngồi xuống trước phế thước, vận hồn lực chậm rãi. Ngươi nghe hồn khí còn sót trong hầm như nghe một bản nhạc lệch nhịp, rồi chỉnh lại từng dây một. Oán khí tan dần dưới hồn lực ấm — không một tiếng động, không một lời nói, chỉ có ánh sáng trong suốt lan ra từ lòng bàn tay.' },
    { who: 'narrate', text: 'Một lượt luyện hồn khép lại. Thần hồn vững thêm một phần, và phế thước ghi nhận thêm một vạch sáng mờ — dấu vết của một Hồn Sư luyện hồn ngay giữa nơi từng chỉ dành cho người đo dị thường.' },
    { who: 'narrate', text: 'Ngươi đứng dậy, phủi bụi trên áo. Tầng sâu vẫn im lặng như cũ — nhưng sự im lặng này khác: nó là im lặng của người đã chọn nói ra, rồi chọn trở lại với im lặng của riêng mình.' }
  ];
  var SCENE_C10_SOUL_B = [
    { who: 'narrate', text: 'Tàn Tích tầng sâu mở cửa với ngươi trong một tâm trạng khác: thân phận Hồn Sư đã bị lộ ra ngoài chợ, bằng cái miệng xấu nhất mà kẻ khác tìm được.' },
    { who: 'narrate', text: 'Phế thước vẫn đứng đó, nhưng vạch sáng thứ mười hiện lên chậm hơn, như dè chừng. Tàn ảnh không mặt quay về phía ngươi, lặng lẽ — nơi này không đồn nhảm, và cũng không hỏi ngươi điều gì.' },
    { who: 'narrate', text: 'Thiên hạ nói thay ta — nhưng hồn lực này vẫn là của ta. Bị lộ không làm nó bẩn đi, cũng không làm nó yếu đi.' },
    { who: 'narrate', text: 'Ngươi ngồi xuống trước phế thước, vận hồn lực chậm rãi. Ngươi nghe oán khí trong hầm lệch nhịp như một bản nhạc sai dây, rồi để hồn lực chỉnh nó lắng lại từng chút. Oán khí cuộn lên một nhịp rồi lắng xuống — như chính những lời đồn ngoài kia, ầm ĩ một lúc rồi cũng phải tan khi gặp thứ thật.' },
    { who: 'narrate', text: 'Một lượt luyện hồn khép lại trong im lặng. Thần hồn vững thêm một phần, và điều quan trọng hơn: ngươi vừa luyện hồn mà không cần xin phép ai, không cần thanh minh với ai.' },
    { who: 'narrate', text: 'Ngươi đứng dậy, bước lên cầu thang về phía ánh sáng. Ngoài kia, lời đồn vẫn còn — nhưng trong này, ngươi đã có một nơi để trở về, mỗi ngày một lượt, cho tới khi sự thật tự nó đứng vững.' }
  ];

  /* ================= CUNG IV — CHƯƠNG 17: VẾT NỨT Ở THÁP =================
     Cài NGUYÊN VĂN từng dòng từ bản thảo khóa tools/work/arc-iv-prep/scripts/ch17.js
     (thiết kế: docs/arc-iv-detail/17.md; hợp đồng arciv-work/CONTRACT-wave2.md mục A.9). */
  var SCENE_CH17_TIN_TU_THAP = [
    { who: 'narrate', text: 'Tin tới từ Trần Tư Linh, theo đường tin của Trần gia với Kiểm Trắc Tháp — và lần này, tin không nằm yên trên giấy được lâu.' },
    { who: 'tran_tu_linh', text: 'Giang công tử, phải đi ngay. Sáng nay ở tháp có một người cha quê đưa con tới đo lần đầu. Thước không hiện một màu nào. Người của tháp tuyên thằng bé vô căn — rồi đòi nhà ông ta nộp lệ phí đo lại gấp năm lần, nói là "luật của tháp xưa nay".' },
    { who: 'tran_tu_linh', text: 'Luật ấy không có trong quy củ nào ta từng đọc. Nhưng nhà quê thì biết đường nào mà cãi. Họ đã móc tới đồng bạc cuối cùng trong tay áo rồi đấy.' },
    { who: 'tran_tu_linh', text: 'May mà Di Ninh có mặt ở sảnh hôm nay. Nàng chặn tay chấp sự lại ngay trước mặt mọi người, nói một câu mà cả sảnh nín thở: "Khoan thu. Đo lại trước chứng kiến — đó là quyền ghi trong quy củ của chính tháp này."' },
    { who: 'tran_tu_linh', text: 'Chấp sự không dám trái mặt nàng — cửu phẩm… à, phẩm cấp của nàng vẫn còn nặng ký ở tháp lắm. Buổi đo lại được hẹn ngay chiều nay. Nhưng ta sợ người của tháp sẽ tìm cách khác để giữ phần thắng.' },
    { who: 'tran_tu_linh', text: 'Công tử tới đó, không cần làm gì ầm ĩ đâu. Có mặt của công tử ở sảnh, nhiều việc tự nó phải đi cho ngay ngắn. Ta đi trước lo giấy tờ buổi đo — gặp nhau ở khuôn viên tháp.' },
    { who: 'tran_tu_linh', text: 'À, còn một câu Di Ninh nhờ ta nhắn, nguyên văn: "Chàng không cần nói giúp ta câu nào. Chàng chỉ cần ở đó." — Nghe như nàng ấy đã liệu trước cả buổi chiều nay rồi đấy.' },
    { who: 'narrate', text: 'Một người cha quê, một đứa trẻ chưa biết chữ "căn" viết thế nào, và một khoản lệ phí không có trong luật. Ngươi lên đường tới Kiểm Trắc Tháp.' }
  ];
  var SCENE_CH17_DO_LAI = [
    { who: 'narrate', text: 'Sảnh tháp chiều nay đông hơn thường lệ: người cha quê ôm con đứng nép bên cột, Di Ninh đứng phía trước hai cha con như một bức tường mỏng, và chấp sự tháp ngồi sau án, mặt không biểu cảm.' },
    { who: 'chap_su_thap', text: 'Theo lời yêu cầu của Hứa tiểu thư, tháp mở buổi đo lại, có chứng kiến. Nhưng ta nói trước: thước pha lê không nói dối. Đo lại bao nhiêu lần, kết quả vẫn là kết quả ấy thôi.' },
    { who: 'di_ninh', text: 'Thước nói gì, đo xong sẽ biết. Còn lệ phí gấp năm lần — chấp sự cứ giữ nguyên ý định thu, để mọi người ở đây cùng nghe, cùng ghi lại.' },
    { who: 'dan_thanh_a', text: 'Các vị đại nhân… tiểu nhân chỉ xin một điều: cho thằng bé đặt tay lên thước một lần nữa, trước mặt mọi người. Nó có căn hay không, tiểu nhân nhận hết. Chỉ xin đừng bắt nó nhận… bằng một cái giá nhà tiểu nhân không gánh nổi.' },
    { who: 'thap_chu', text: 'Được. Đưa cậu bé lên trước thước. Mọi người lùi ra sau vạch. Buổi đo lại bắt đầu — theo đúng nghi thức của tháp, không thiếu một bước.' },
    { who: 'narrate', text: 'Cậu bé rụt rè đặt bàn tay nhỏ lên mặt thước. Một hơi thở. Hai hơi thở. Rồi — thước pha lê rung lên. Không phải ánh sáng trỗi dậy: là cơn rung. Mặt pha lê chao đảo như mặt nước bị ném đá liên hồi, tiếng rung lệch đi thành một thứ âm thanh chói tai, và các vạch khắc trên thân thước nhảy loạn không theo một trật tự nào.' },
    { who: 'chap_su_thap', text: 'Lùi lại! Lùi hết lại! Thước… thước chưa từng rung như thế này bao giờ — giữ tay ra khỏi nó, mau!' },
    { who: 'narrate', text: 'Ngươi nghe rõ hơn mọi người trong sảnh: dưới tiếng rung loạn ấy là một nhịp trận văn đã lệch — một mắt văn của tháp chệch khỏi vị trí của nó sau nhiều năm không ai kiểm lại. Nếu cứ để rung tiếp, buổi đo này sẽ cho ra một kết quả sai nữa — và lần này, sai có chứng kiến. Trong tay ngươi có một chiêu sinh ra để giữ cho sự vật đứng yên đúng nhịp của nó.' }
  ];
  var SCENE_CH17_DO_LAI_XONG = [
    { who: 'narrate', text: 'Vòng sáng lam trắng khép quanh thước pha lê — và cơn rung chết lặng giữa chừng, như một tiếng chuông bị giữ lại trong lòng bàn tay. Bụi đá quanh thước dừng giữa không trung. Sảnh tháp im tới mức nghe được tiếng thở của cậu bé.' },
    { who: 'thap_chu', text: 'Trận văn… một mắt văn đã lệch. Bao nhiêu năm nay, không ai trong tháp nghĩ tới chuyện kiểm lại mắt văn của chính thước đo. Chấp sự — chỉnh lại mắt văn, ngay bây giờ, trước mặt mọi người.' },
    { who: 'narrate', text: 'Mắt văn về đúng vị trí. Cậu bé đặt tay lên thước lần nữa — và lần này, một vạch sáng mỏng, yếu ớt nhưng rõ ràng, chầm chậm hiện lên trên mặt pha lê: nhất phẩm. Không cao. Nhưng là có. Là một con đường.' },
    { who: 'dan_thanh_a', text: 'Có… có rồi! Con tôi có căn! Các vị thấy không — nó có căn! (ông quỳ sụp xuống ôm con, khóc không thành tiếng) Cảm ơn… cảm ơn các vị…' },
    { who: 'hero', mode: 'write', text: '(viết) "Về đi. Cho nó ăn một bữa thật no. Từ hôm nay, nó là người có căn."' },
    { who: 'di_ninh', text: '(nhìn vạch sáng nhất phẩm rất lâu, nói khẽ) Nhất phẩm. Sáng nay, cũng bàn tay này, cũng mặt thước này — phán là vô căn. Chỉ cách nhau một mắt văn lệch… và một khoản lệ phí gấp năm lần.' },
    { who: 'chap_su_thap', text: 'Việc lệ phí… tháp sẽ hoàn lại cho nhà ông. Còn chuyện hôm nay — (hắn nhìn quanh sảnh đông người, hạ giọng) — Hứa tiểu thư, Giang công tử, xin nán lại một lát. Có vài câu, tháp cần nói cho rõ.' }
  ];
  var SCENE_CH17_CHAT_VAN = [
    { who: 'chap_su_thap', text: 'Hứa Di Ninh. Ta hỏi thẳng: nàng lấy tư cách gì để chặn tay người của tháp giữa sảnh? Nàng được đo cao phẩm — nhưng nàng không phải người của tháp. Việc đo, việc thu, việc tuyên kết quả, xưa nay là việc của tháp.' },
    { who: 'di_ninh', text: 'Tư cách của ta ghi ở quyển quy củ đặt trong chính sảnh này, điều thứ chín: người được đo, nếu không phục kết quả, có quyền xin đo lại trước chứng kiến, lệ phí theo giá niêm yết. Ta không chặn tay tháp. Ta đọc luật của tháp — to hơn một chút, để người cha quê kia cũng nghe thấy.' },
    { who: 'chap_su_thap', text: 'Quy củ viết cho những trường hợp thước đọc chưa rõ. Còn trường hợp thước không hiện màu — xưa nay…' },
    { who: 'di_ninh', text: 'Xưa nay sao? Xưa nay không ai kiểm lại mắt văn của thước — hôm nay cả sảnh này vừa chứng kiến điều đó. Chấp sự, ta không cãi với ông. Ta chỉ muốn hỏi một câu, và ông trả lời cho chính ông nghe là đủ: nếu mắt văn không lệch, và ta không có mặt sáng nay — thì đứa trẻ nhất phẩm kia, giờ này là gì?' },
    { who: 'narrate', text: 'Chấp sự tháp im lặng rất lâu. Hắn nhìn về phía thước pha lê đang đứng yên lặng giữa sảnh — thứ thước mà cả đời hắn tin là không bao giờ sai.' },
    { who: 'chap_su_thap', text: '…Là một đứa trẻ bị phán vô căn oan. (hắn thở dài) Tháp sẽ cho kiểm lại toàn bộ mắt văn, và treo lại bảng lệ phí cho dân thấy. Việc hôm nay, tháp ghi nhận — có công của Hứa tiểu thư.' },
    { who: 'di_ninh', text: 'Ghi nhận cho đúng người, chấp sự. Người giữ thước đứng yên hôm nay không phải ta. (nàng quay sang ngươi, ánh mắt dừng lại một nhịp) Ta chỉ là người… đứng ra nói một câu. Còn lại, là của chàng.' },
    { who: 'thap_chu', text: 'Đủ rồi. Chuyện của tháp, tháp tự sửa. Hứa tiểu thư — chủ trì ta nói một câu riêng: nàng hôm nay không chỉ cứu một đứa trẻ. Nàng vừa làm một việc mà người của tháp bao năm không ai dám làm: nghi ngờ chính cái thước của mình.' }
  ];
  var SCENE_CH17_DI_NINH = [
    { who: 'narrate', text: 'Khuôn viên tháp, nắng cuối ngày. Di Ninh đứng dưới đài thước rất lâu, không đi. Nàng chờ mọi người về hết mới mở lời — và lời đầu tiên không phải về đứa trẻ.' },
    { who: 'di_ninh', text: 'Giang Phàm. Hôm nay ta thắng. Ta thắng bằng luật của tháp, trước mặt người của tháp, không ai cãi lại được câu nào. Lẽ ra ta phải thấy vững lòng mới phải.' },
    { who: 'di_ninh', text: 'Nhưng ta không vững. Ta cứ nghĩ mãi về mắt văn lệch kia. Một mắt văn — lệch đi có một chút — là đủ biến một đứa trẻ có căn thành phế nhân cả đời, và không một ai trong bao nhiêu năm thấy có gì lạ.' },
    { who: 'di_ninh', text: 'Nếu thước có thể sai với đứa trẻ ấy… thì những gì thước từng nói về mọi người, có còn chắc nữa không? Về ta — cửu phẩm, lục phẩm, người ta vẫn gọi ta bằng những chữ ấy trước cả tên ta. Và về…' },
    { who: 'narrate', text: 'Nàng dừng lại. Câu nói dở dang hướng về một buổi chiều rất xa, ở một cái sân khác — nơi một thiếu niên đặt tay lên đá, không hiện một màu nào, và cả sân quay đi. Nàng là người đứng gần nhất hôm ấy. Và là người quay đi đầu tiên.' },
    { who: 'di_ninh', text: '…về một người từng bị phán vô căn, ngay trong sân nhà ta. Ta đã tin cái phán quyết ấy dễ dàng tới mức nào, chàng biết không? Ta tin ngay lập tức. Không một lần tự hỏi. Mười mấy năm qua, ta chưa từng tự hỏi lấy một lần.' },
    { who: 'di_ninh', text: 'Ta chưa nói điều này với ai. Cũng chưa biết nói ra để làm gì — thước không đo lại được những năm đã qua. Nhưng hôm nay, đứng ở đây, ta muốn chàng là người đầu tiên nghe thấy: ta không còn chắc nữa. Ta không còn chắc vào thứ đã chia cả thiên hạ này ra làm hai nửa.' },
    { who: 'di_ninh', text: 'Chàng đừng vội an ủi ta — ta biết chàng sẽ không viết thế, nhưng ta cứ nói trước. Ta không cần được tha thứ cho một việc ta còn chưa dám gọi tên. Ta chỉ cần… từ nay, mỗi lần đứng trước cái thước ấy, ta sẽ tự hỏi thêm một câu. Thế thôi. Bắt đầu từ hôm nay.' },
    { who: 'narrate', text: 'Ngươi không viết gì cả. Ngươi chỉ lấy từ trong áo ra một tờ giấy đã cũ, gấp tư, mép giấy mềm đi vì được giữ quá lâu — tờ giấy nàng từng viết trong một ngày rất khác, với những chữ rất khác. Ngươi đặt nó vào tay nàng, nhẹ như trả lại một món đồ vốn chưa từng thuộc về mình.' },
    { who: 'di_ninh', text: '(nàng nhìn tờ giấy trong tay mình rất lâu; khi ngẩng lên, mắt nàng đỏ, nhưng giọng lại bình tĩnh lạ thường) …Chàng giữ nó suốt bấy lâu nay à. Thôi. Từ nay, những gì ta viết cho chàng — ta sẽ viết những chữ khác. Chàng chờ xem.' }
  ];
  var SCENE_CH17_DONE = [
    { who: 'narrate', text: 'Buổi chiều ở Kiểm Trắc Tháp khép lại: một đứa trẻ nhất phẩm ôm tay cha ra về, bảng lệ phí mới được treo lại giữa sảnh, và toàn bộ mắt văn của thước được niêm phong chờ kiểm lại.' },
    { who: 'narrate', text: 'Còn một việc nữa không ai treo lên bảng: từ hôm nay, lượt lặp của tầng sâu Kiếm Trủng chính thức mở cho ngươi quay lại mỗi ngày, và phiếu treo thưởng ở thành làm mới đợt hai theo dải Kim Đan — những việc của một người đã đi xa hơn cái sân đo năm xưa rất nhiều.' },
    { who: 'narrate', text: 'Trên đường về, ngươi ngoái nhìn tháp một lần. Thước pha lê đứng yên trong nắng tắt. Nó chưa từng nói dối — nó chỉ bị lệch, và chờ mãi một người chịu nghi ngờ nó.' },
    { who: 'narrate', text: 'Chương 17 khép lại. Tu vi sự kiện +150 đã ghi nhận. Nhưng có những thứ không đo bằng tu vi: một vạch sáng nhất phẩm, và một vết nứt vừa mở ra trong lòng người con gái từng tin vào thước đo hơn cả tin vào mắt mình.' }
  ];
  /* ================= CUNG IV — CHƯƠNG 18: CẢ VÙNG CHỜ MỘT LỆNH =================
     Cài NGUYÊN VĂN từng dòng từ bản thảo khóa tools/work/arc-iv-prep/scripts/ch18.js
     (thiết kế: docs/arc-iv-detail/18.md; hợp đồng arciv-work/CONTRACT-wave2.md mục A.9). */
  var SCENE_CH18_TRANH_CHAP = [
    { who: 'narrate', text: 'Sân phủ thành hôm nay không giống một nơi xét việc: hai nhà Tạ — Đỗ ngồi hai phía án của quan phủ, người làm của hai nhà đứng chật cả sân, và dân thành chen nhau ngoài cổng chỉ để xem mặt người mà cả vùng đang chờ.' },
    { who: 'quan_phu', text: 'Việc thế này: ở rìa đông thành có một mạch linh tuyền, nước của nó tưới được ruộng linh của cả hai nhà. Tạ gia giữ đầu nguồn từ đời ông cha. Đỗ gia dựng đập ở hạ lưu từ ba mươi năm nay. Năm nay nước ít — và hai nhà cùng nói một câu: phần nước kia là của nhà mình.' },
    { who: 'gia_chu_ta', text: 'Quan phủ nghe cho rõ: nguồn là gốc. Không có nguồn, đập của Đỗ gia chỉ là một đống đá chắn ngang dòng cạn. Tạ gia ta giữ nguồn, giữ rừng đầu nguồn, tốn công tốn của — nước chảy xuống, nhà ta phải được phần trước.' },
    { who: 'gia_chu_do', text: 'Nói thế thì ngược đời! Nước chảy qua đập nhà ta mới thành ruộng tốt được. Ba mươi năm nay ai giữ đập sau mỗi trận lũ? Ai vét bùn, ai chôn người chết đuối vì giữ đập? Giờ nước ít, Tạ gia lại đòi chặn ở trên — thế là muốn ruộng hạ lưu chết khát cả sao?' },
    { who: 'quan_phu', text: 'Hai vị nghe ta nói hết đã… Phủ này tra sổ ba lượt rồi. Sổ nói: cả hai nhà đều có phần đúng, và cả hai nhà đều có chỗ lấn. Xử theo sổ, nhà nào cũng thua một nửa — mà nhà nào thua một nửa cũng sẽ không phục. Việc này… (ông nhìn về phía cổng, nơi ngươi vừa bước vào, và chợt thở phào như trút được gánh nặng) — Giang công tử tới rồi.' },
    { who: 'narrate', text: 'Cả sân quay lại. Không ai hỏi ngươi tới làm gì. Việc ấy đã rõ từ trước khi ngươi bước qua cổng: cả vùng này đang chờ một người ra một lệnh — để khỏi ai phải tự mình xét đúng sai.' },
    { who: 'gia_chu_ta', text: '(đứng dậy, chắp tay, giọng mềm hẳn đi) Giang công tử. Tạ gia ta không dám làm phiền công tử lâu. Chỉ xin công tử… nán lại sau buổi này một lát. Có một việc, ta chỉ dám nói khi không có tai của Đỗ gia.' },
    { who: 'gia_chu_do', text: '(cười lạnh) Tạ gia khéo thật — chưa phân xử đã lo đi cửa sau. Đỗ gia ta không có cửa sau. Đỗ gia chỉ có một câu nói giữa sân này: người sắp phân xử cho cả vùng, thiên hạ chưa biết sức tới đâu. Vô địch của nhà ta đang ở ngoài sân — dám hay không dám, thử một trận cho mọi người cùng xem?' },
    { who: 'dan_thanh_a', text: '(trong đám dân chen ở cổng, nói với người bên cạnh) Ủa, việc nước nôi của hai nhà lớn, sao cuối cùng lại đổ hết lên vai một mình cậu Giang thế? Cậu ấy có họ hàng gì với cái mạch tuyền kia đâu.' },
    { who: 'dan_thanh_b', text: 'Thì thế mới là cái khó của cậu ấy. Hai nhà không ai chịu thua ai — chỉ chịu thua một người mà cả hai cùng phục. Mà người như thế, cả vùng này đếm được mấy ai? Thôi, cứ xem đi. Hôm nay sân phủ này còn nhiều chuyện hơn cả vụ nước.' }
  ];
  var SCENE_CH18_AP_LUC_HUA = [
    { who: 'narrate', text: 'Sau buổi trình bày, Tạ gia chủ chờ ngươi ở hành lang vắng sau phủ. Ông ta không mang theo người làm, không mang theo quà — chỉ mang theo một câu nói đã chuẩn bị rất kỹ.' },
    { who: 'gia_chu_ta', text: 'Giang công tử, ta nói thẳng, vì vòng vo với công tử là tự khinh mình. Vụ tuyền này, Tạ gia đang yếu thế: sổ sách nghiêng về Đỗ gia ở hai điểm. Nếu phiên xử theo sổ, nhà ta mất phần nước — mà mất nước một năm, ruộng linh của Tạ gia chết ba năm.' },
    { who: 'gia_chu_ta', text: 'Ta biết công tử không thiếu tiền, không thiếu danh. Nhưng có một thứ công tử thiếu — và cả thành này đều biết: Hứa gia. Nhà vợ chưa cưới của công tử ở ngay trong thành này, mà thế lực thì mỏng. Một cơn sóng gió như vụ thung lũng năm xưa nữa thôi, Hứa gia chống được mấy lần?' },
    { who: 'gia_chu_ta', text: 'Tạ gia ta hứa, bằng văn tự đóng triện đàng hoàng: từ nay, Hứa gia có việc, Tạ gia đứng ra trước. Người của ta gác đường cho đoàn xe Hứa gia. Kẻ nào động tới một người làm của Hứa gia, kẻ đó là địch của Tạ gia. Lâu dài. Không thời hạn.' },
    { who: 'gia_chu_ta', text: 'Giá của nó — công tử nghe cho hết rồi hẵng giận — chỉ là một lệnh. Tại phiên phân xử, công tử chỉ cần cất đúng một lệnh: nước tuyền thuộc về nhà giữ nguồn. Một lệnh thôi. Công tử nói một câu, Hứa gia yên ổn cả đời. Công tử… nghĩ kỹ cho ta.' },
    { who: 'gia_chu_ta', text: 'Ta biết công tử đang nghĩ gì: một lệnh của công tử nặng lắm, không nói bừa được. Đúng — vì nó nặng, nó mới đáng giá tới mức Tạ gia dám đổi cả sự bảo hộ lâu dài. Công tử càng ít nói, lệnh của công tử càng đắt. Ta là người buôn bán, ta tính không sai đâu.' },
    { who: 'gia_chu_ta', text: 'Và ta nói thêm một câu thật lòng, ngoài sổ sách: nếu hôm nay công tử từ chối, Tạ gia cũng không trách. Nhà ta chỉ sợ một điều — sợ tới ngày Hứa gia gặp nạn thật, công tử nhìn lại buổi chiều hôm nay mà hối. Lúc ấy, lời hứa của ta chưa chắc còn đặt được lên bàn nữa.' },
    { who: 'narrate', text: 'Lời hứa được viết rất "tốt": nó không chạm vào tiền, không chạm vào danh — nó chạm đúng vào sự an toàn của những người ngươi quý nhất. Và cái giá của nó cũng được tính rất khéo: một lệnh. Chỉ một lệnh. Như thể một lệnh là thứ rẻ nhất trên đời.' },
    { who: 'choice', text: 'Trước lời hứa của Tạ gia chủ, ngươi sẽ…',
      options: [
        { label: 'Nghe hết, không hứa gì — gật đầu cho ông ta nói tiếp', action: 'ch18_hua_nghe' },
        { label: 'Đặt bút xuống ngay tại chỗ — viết rõ: việc phân xử, xét bằng chứng cứ', action: 'ch18_hua_viet' }
      ]
    }
  ];
  var SCENE_CH18_AP_LUC_NGHE = [
    { who: 'gia_chu_ta', text: '(mắt sáng lên) Công tử chịu nghe hết, thế là Tạ gia còn hy vọng. Ta không ép công tử hứa hôm nay. Lời hứa của ta để nguyên trên bàn — tới ngày phiên xử, nó vẫn còn nguyên giá trị.' },
    { who: 'narrate', text: 'Ngươi không hứa, cũng không từ chối. Một lời hứa chưa được nhận — và cũng chưa bị khép lại. Nó sẽ còn lơ lửng trên đầu phiên phân xử, đúng như người đặt ra nó mong muốn.' }
  ];
  var SCENE_CH18_AP_LUC_VIET = [
    { who: 'hero', mode: 'write', text: '(viết) "Việc phân xử, ta xét bằng chứng cứ. Hứa gia cảm ơn thịnh tình của Tạ gia — nhưng sự an toàn mua bằng một lệnh, ta không mua."' },
    { who: 'gia_chu_ta', text: '(đọc xong, im lặng một lúc lâu, rồi cười gượng) …Ta buôn bán cả đời, chưa từng bị từ chối một món hàng nào mà trong lòng lại phục người từ chối tới thế. Thôi được. Lời hứa kia, ta vẫn để trên bàn — không phải để mua nữa. Là để Tạ gia nhớ hôm nay.' },
    { who: 'narrate', text: 'Ngươi đã nói rõ — bằng chữ viết, trước khi phiên xử mở. Nhưng nói rõ với một nhà là một chuyện; cả vùng này vẫn chưa thôi chờ lệnh của ngươi.' }
  ];
  var SCENE_CH18_DAU_MO = [
    { who: 'narrate', text: 'Giữa sân phủ, Đỗ gia đã cho dọn một khoảnh đất trống. Vô địch của nhà họ bước ra: thân hình như một bức tường, hai tay không cầm binh khí — thứ vũ khí của hắn là chính đôi tay và mặt đất dưới chân.' },
    { who: 'vo_dich_doi_thu', text: 'Giang công tử. Ta là người giữ đài của Đỗ gia mười hai năm, chưa từng thua ở đất thành này. Hôm nay ta không đánh vì thù. Ta đánh để cả thành này nhìn cho rõ: người mà họ chờ ra lệnh, có thật xứng để ra lệnh hay không.' },
    { who: 'gia_chu_do', text: 'Luật đấu nói trước mặt quan phủ: đấu tới điểm dừng, không lấy mạng. Thắng — Đỗ gia ta ngồi vào phiên phân xử, giữ hòa tới ngày xử, không một lời phàn nàn. Thua — cũng thế. Đỗ gia chỉ cần một điều: trận này phải đánh trước mặt thiên hạ.' },
    { who: 'quan_phu', text: 'Phủ chứng kiến. Dân thành làm chứng. Hai bên vào vị trí — trận đấu bắt đầu khi trống nổi lên.' },
    { who: 'dan_thanh_b', text: '(ngoài vòng người xem, níu tay áo người bên cạnh) Đánh thật đấy à? Trước mặt quan phủ luôn à? Trời ơi, tôi ở thành này bốn mươi năm, chưa thấy phủ mở sân cho ai đấu bao giờ… Hôm nay mà cậu Giang thắng, cái lệnh người ta chờ — nó còn nặng nữa.' },
    { who: 'narrate', text: 'Trống nổi. Mặt đất dưới chân vô địch rung lên theo từng bước hắn tiến — một trường phái nặng và chậm, đối nghịch hẳn với kiếm của ngươi: trọng kích nện đất có báo trước dài, quét ngang hai nhịp nối nhau, và lớp hộ thể dựng theo chu kỳ mà kiếm thường chém không thủng. Muốn thắng hắn, phải đọc được nhịp của hắn — và chờ đúng cửa sổ khi hộ thể vừa hạ.' }
  ];
  var SCENE_CH18_DAU_XONG = [
    { who: 'narrate', text: 'Đòn kết liễu tới đúng khoảnh khắc lớp hộ thể của vô địch vừa tan: hai vung kiếm nối tiếp không về thế đứng, rồi Phá Quân khép lại trận đấu. Vô địch của Đỗ gia lùi ba bước, chống tay xuống đất — và bật cười.' },
    { who: 'vo_dich_doi_thu', text: 'Ha… ha ha! Mười hai năm giữ đài, hôm nay thua một người từ đầu tới cuối không nói một chữ nào. Ta thua tâm phục. Công tử — người như công tử mà chịu ra lệnh cho ai, kẻ đó phải là người thật sự đáng.' },
    { who: 'gia_chu_do', text: '(đứng dậy, chắp tay, giọng khàn đi) Đỗ gia giữ lời. Ngồi vào phiên. Giữ hòa. — Và nói thêm một câu ngoài luật đấu: hôm nay ta mới hiểu vì sao cả vùng chờ lệnh của công tử. Vì công tử thắng mà không cần tới nó.' },
    { who: 'narrate', text: 'Dư luận sau trận chạy khắp thành trước cả khi sân phủ dẹp xong: Giang Phàm thắng vô địch của Đỗ gia giữa ban ngày, trước hàng trăm con mắt — không cất một lời, không ra một lệnh. Từ hôm nay, vô địch của Đỗ gia vào danh sách đấu lại ở đài thách đấu của Thanh Vân Tông: hạng vô địch chính thức mở.' },
    { who: 'dan_thanh_a', text: '(trong đám đông vừa tan, lắc đầu lia lịa) Thấy chưa, thấy chưa! Từ đầu tới cuối, cậu ấy không mở miệng một lần. Người ta chờ lệnh của cậu ấy đến thế — mà cậu ấy thắng bằng kiếm, không phải bằng miệng. Cái thành này từ nay nói chuyện phải lựa lời trước mặt cậu ấy đấy.' },
    { who: 'quan_phu', text: '(gõ án, tuyên bố giữa sân) Phủ ghi lại: hai nhà cam kết ngồi vào phiên phân xử, giữ hòa cho tới ngày xử, không bên nào được động thủ trước. Ai trái cam kết này, phủ xử theo luật thành — và cả sân hôm nay làm chứng. Giải tán!' },
    { who: 'narrate', text: 'Điểm lĩnh ngộ kiếm +60 — trận đấu dạy ngươi một thứ mà đấu với đệ tử tông không dạy được: đọc nhịp chờ của một đối thủ biết dựng tường. Việc còn lại trước phiên: gom chứng cứ. Lần này, ngươi tự tay đi.' }
  ];
  var SCENE_CH18_CHUNG_CU = [
    { who: 'narrate', text: 'Ba điểm đến, ba thứ chứng cứ. Thứ nhất: nhà ghi chép mạch tuyền ở gần chợ — nơi giữ bản đồ dòng chảy của mạch tuyền qua từng năm hạn.' },
    { who: 'cho_b', text: 'Công tử xem, đây là sổ chép nước của cha tôi để lại, tôi giữ tiếp mười năm nay. Năm nào hạn, dòng tuyền nhỏ đi — nhưng chưa năm nào nó đổi dòng. Nước vẫn chảy qua đất Tạ gia trước, rồi mới tới đập Đỗ gia. Chuyện ấy, sổ này nói rõ lắm.' },
    { who: 'cho_a', text: '(người bán hàng rong ở chợ ghé tai) Công tử đi hỏi chuyện mạch tuyền à? Cả chợ này đều biết một điều mà hai nhà không nói ra: năm hạn nhất cách đây chín năm, chính Tạ gia đã mở nguồn cho nước xuống trước khi tới lượt nhà mình — cứu cả vụ mùa hạ lưu. Giờ hai nhà cãi nhau, không ai nhắc chuyện ấy nữa. Công tử hỏi sổ chép nước khắc rõ.' },
    { who: 'narrate', text: 'Thứ hai: người giữ đập — một ông lão đã vét bùn ở đập Đỗ gia từ khi còn trẻ, tay chai tới mức không còn cảm giác ở đầu ngón.' },
    { who: 'dan_thanh_a', text: 'Công tử hỏi thì tôi nói thật, dù là nói cho nhà khác nghe: đập này mà vỡ một lần, ruộng dưới chết không phải một nhà — chết cả mấy trăm hộ dân thường không họ Tạ cũng không họ Đỗ. Ba mươi năm cái đập đứng được, là nhờ người Đỗ gia bỏ tiền, bỏ người. Phần ấy, sổ nào cũng không ghi đâu, công tử ạ.' },
    { who: 'narrate', text: 'Thứ ba: sổ thuế của phủ thành, quan phủ tự tay mở cho ngươi xem — khoản thuế nước mà hai nhà đã đóng, năm chẵn năm lẻ, không năm nào giống năm nào.' },
    { who: 'quan_phu', text: 'Công tử thấy rồi đấy. Ba thứ chứng cứ, ba sự thật — và cả ba đều đúng. Tạ gia đúng ở nguồn. Đỗ gia đúng ở đập. Dân thường đúng ở chỗ: họ chỉ cần nước chảy, nhà nào giữ cũng được. Phiên này mà xử cho một nhà thắng hết… thì kẻ thua không phải một nhà đâu, công tử.' },
    { who: 'hero', mode: 'write', text: '(viết, tự ghi vào sổ tay của mình) "Không có kẻ sai để vạch mặt. Chỉ có một dòng nước phải chia sao cho cả vùng còn sống được với nhau."' },
    { who: 'dan_thanh_a', text: '(trước khi ngươi đi, ông lão giữ chặt tay áo ngươi) Công tử… tôi là người của Đỗ gia, mà tôi nói câu này với công tử: xử thế nào thì xử, đừng để cái đập bị bỏ không. Đập mà không có người giữ, mùa lũ tới, kẻ chết không phải người của hai nhà đâu. Là dân thường chúng tôi trước nhất.' },
    { who: 'narrate', text: 'Ngươi gấp sổ lại. Chương này sẽ không thắng bằng cách vạch mặt kẻ sai như những lần trước — vì lần này, không có kẻ sai. Chỉ có một án lệ phải dựng lên bằng chứng cứ, thay cho một lệnh mà cả vùng đang chờ.' }
  ];
  var SCENE_CH18_CHO_PHIEN = [
    { who: 'narrate', text: 'Ngày phiên phân xử. Dân thành tới phủ từ khi trời còn chưa sáng hẳn — không phải vì vụ nước, mà vì ai cũng muốn tận mắt xem Giang Phàm sẽ cất lệnh thế nào.' },
    { who: 'u_nhan', text: 'Phàm ca. Muội tới với tư cách người của Hứa gia — nhà muội ngồi ở hàng ghế nhân chứng, không phải hàng ghế chờ được bảo vệ. (nàng nói khẽ, chỉ đủ hai người nghe) Lời hứa của Tạ gia, muội có nghe phong thanh rồi. Huynh xử thế nào, Hứa gia đứng cùng huynh thế ấy. Đừng vì nhà muội mà bán thứ không nên bán.' },
    { who: 'gia_chu_ta', text: '(gặp ngươi ở cổng phủ, chắp tay, không nhắc nửa chữ về lời hứa) Giang công tử. Tạ gia ngồi vào phiên, nghe công tử xử — dù kết quả thế nào.' },
    { who: 'gia_chu_do', text: 'Đỗ gia cũng thế. Sau trận hôm ấy, nhà ta không còn gì phải giấu nữa. Cứ xử theo chứng cứ — Đỗ gia nghe.' },
    { who: 'quan_phu', text: 'Hai nhà đã có mặt. Nhân chứng đã có mặt. Dân thành… (ông nhìn ra sân chật kín người, lắc đầu mà cười) — cũng đã có mặt đông hơn cả ngày hội. Mời Giang công tử vào trong. Phiên phân xử bắt đầu.' },
    { who: 'narrate', text: 'Ngươi bước vào giữa sân phủ, trong tay không có gì ngoài bút và giấy. Cả vùng nín thở chờ một lệnh. Thứ họ sắp nhận được — không phải là một lệnh.' }
  ];
  var SCENE_CH18_DONE = [
    { who: 'narrate', text: 'Đêm trước phiên phân xử, tin về trận đấu ở sân phủ đã đi khắp thành và bắt đầu leo lên đường núi về phía Thanh Vân Tông — mỗi người kể lại, trận đấu dài thêm một đoạn, và sự im lặng của ngươi nặng thêm một phần.' },
    { who: 'narrate', text: 'Tu vi sự kiện +150 của chương đã ghi nhận. Nhưng thứ chương này để lại trong tay ngươi không phải tu vi: là ba thứ chứng cứ đều đúng, một lời hứa chưa khép lại hẳn — và một phiên phân xử mà cả vùng đang đếm từng ngày.' }
  ];
  /* ================= CUNG IV — CHƯƠNG 19: LỆNH KHÔNG CHO MƯỢN =================
     Cài NGUYÊN VĂN từng dòng từ bản thảo khóa tools/work/arc-iv-prep/scripts/ch19.js
     (thiết kế: docs/arc-iv-detail/19.md; hợp đồng arciv-work/CONTRACT-wave2.md mục A.9). */
  var SCENE_CH19_PHAN_XU = [
    { who: 'narrate', text: 'Phiên phân xử mở. Giữa sân phủ, một án thư dài được đặt lên bàn của quan phủ — không phải một lệnh, mà là một bản án viết tay, từng điều một, mỗi điều đều ghi rõ dựa trên chứng cứ nào.' },
    { who: 'quan_phu', text: '(đọc to, chậm rãi) "Điều một: đầu nguồn mạch tuyền thuộc quyền giữ của Tạ gia, như sổ chép nước mười năm đã ghi. Điều hai: đập hạ lưu thuộc quyền giữ của Đỗ gia — ba mươi năm công giữ đập không ai được xóa. Điều ba: nước chia theo mùa — mùa hạn, hạ lưu được phần trước để ruộng dân không chết; mùa lũ, đầu nguồn giữ quyền xả theo hiệu lệnh của người giữ đập."' },
    { who: 'quan_phu', text: '"Điều bốn: phần chung — khúc tuyền giữa hai nhà — do cả hai nhà cùng canh, thuế nước đóng theo phần nước mỗi nhà dùng, sổ thuế của phủ làm chứng. Điều năm: án này không phải lệnh của một người. Nó là chứng cứ tự nói. Ai không phục, cứ mang chứng cứ khác tới."' },
    { who: 'narrate', text: 'Cả sân im phăng phắc. Người ta đã chờ một lệnh — ngắn, nặng, và có thể mượn được. Thứ họ nhận được là năm điều phải đọc, phải nghĩ, và không mượn đi đâu được cả. Sự thất vọng lướt qua sân một nhịp… rồi những cái gật đầu bắt đầu từ hàng ghế dân thường: vì bản án này, nhà nào cũng phải làm việc, và ruộng của ai cũng có nước.' },
    { who: 'dan_thanh_b', text: '(hàng ghế dân thường, nói khẽ với chồng mình) Ông nghe kỹ chưa — mùa hạn, ruộng hạ lưu được nước trước. Là ruộng của nhà mình đấy. Mười mấy năm đi xem xử, tôi chưa từng nghe một bản án nào nhắc tới ruộng của dân thường trước cả ruộng của hai nhà lớn…' },
    { who: 'dan_thanh_a', text: 'Tôi giữ đập cho Đỗ gia mà tôi phải gật đầu với cái án này. Nó không cho nhà nào thắng hết — nó bắt cả hai nhà phải làm việc như đã từng làm ba mươi năm nay. Thế là công bằng. Ai không phục cái này, là người ấy chỉ muốn thắng, không muốn yên.' },
    { who: 'chinh_ngon', text: '(từ hàng ghế nhân chứng, chậm rãi) Lão phu là người ngoài hai nhà, chỉ xin nói một câu với tư cách người làm chứng lâu năm ở thành này: bản án này là văn bản phân xử đầu tiên mà lão phu đọc xong không thấy ai bị ép phải thua cả người lẫn việc. Hai nhà cứ theo đó mà làm — thành này sẽ yên được nhiều năm.' },
    { who: 'gia_chu_ta', text: '(đứng dậy, chắp tay) Tạ gia… nhận án. Phần nguồn là của nhà ta, phần việc cũng là của nhà ta — công bằng. (ông liếc sang phía đối diện, hạ giọng) Chỉ không biết có nhà nào quen thắng hết, nay phải chia, có nuốt nổi không.' },
    { who: 'gia_chu_do', text: '(mặt sầm xuống, đứng phắt dậy) Hay. Hay cho một bản án "chứng cứ tự nói". Đỗ gia ta giữ đập ba mươi năm, chôn hai người vì cái đập ấy — nay quyền thu phí qua đập bị cắt, chia cho cả vùng "cùng canh". Giang Phàm! Ngươi không cất lệnh — vì ngươi không dám đứng về phía nào hết, đúng không?!' },
    { who: 'u_nhan', text: '(từ hàng ghế Hứa gia, đứng lên, giọng rõ ràng) Đỗ gia chủ. Chàng không đứng về phía nào — chàng đứng về phía chứng cứ. Nếu Đỗ gia có chứng cứ khác, cứ mang ra giữa sân này. Còn nếu chỉ có giọng to… thì sân này hôm nay đã nghe đủ giọng to rồi.' },
    { who: 'gia_chu_do', text: '(cười gằn, phất áo) Được. Được lắm. Án đã tuyên thì cứ tuyên. Nhưng nhớ lấy: có những việc không xử được bằng giấy. Đoàn nhân chứng của phiên này — (hắn nhìn lướt qua hàng ghế nhân chứng, dừng lại đúng một nhịp) — đường về hôm nay, mong là yên ổn.' },
    { who: 'narrate', text: 'Câu nói ấy không phải lời đe dọa thành tiếng — nó là một dấu hiệu. Đoàn nhân chứng đang lục tục rời phủ theo phố nam về phía cổng thành: người giữ đập già, người ghi chép sổ nước, những người thường đã dám đứng ra nói sự thật. Ngươi đứng dậy, đi theo họ. Ngay bây giờ.' }
  ];
  var SCENE_CH19_PHUC_KICH_MO = [
    { who: 'narrate', text: 'Phố nam, đoạn đường vắng giữa hai dãy kho. Đoàn nhân chứng vừa đi qua khúc quanh thì hai đầu phố cùng lúc bị chặn: người của phía thua và tay chân thuê, mặt che kín, tay cầm binh khí không giấu giếm.' },
    { who: 'dan_c', text: '(giọng run, nhưng vẫn đứng chắn trước xe chứng cứ) Các ngươi… các ngươi muốn gì? Sổ sách đã nộp hết cho phủ rồi, đánh chúng tôi thì án cũng không đổi được đâu!' },
    { who: 'dan_thanh_a', text: 'Tôi giữ đập ba mươi năm, chưa từng cầm dao chĩa vào ai! Hôm nay các ngươi đánh người làm chứng giữa ban ngày — cả thành này sẽ nhớ mặt các ngươi, dù các ngươi che kín tới đâu!' },
    { who: 'narrate', text: 'Từ trên lầu các kho hai bên phố, vài cánh cửa sổ hé mở rồi đóng sập lại. Không ai dám xuống. Đoàn nhân chứng chỉ có một mình ngươi đứng giữa họ và hai đầu phố.' },
    { who: 'narrate', text: 'Tên đi đầu không đáp. Hắn chỉ giơ tay — và đợt người đầu tiên lao vào đoàn nhân chứng. Chúng không tới để đổi án. Chúng tới để từ nay, không ai trong thành này dám đứng ra làm chứng nữa.' },
    { who: 'dan_thanh_b', text: '(người đàn bà đi cùng đoàn, ôm chặt bọc sổ sách vào ngực, hét lên với lũ người bịt mặt) Sổ này là công sức mười năm của chồng tôi! Các ngươi muốn đốt nó thì bước qua xác tôi trước! — Giang công tử, chúng tôi đứng sau lưng công tử, không chạy đâu!' },
    { who: 'narrate', text: 'Ngươi rút kiếm. Đợt một là tay chân thuê đánh vào hai bên sườn đoàn. Đợt hai sẽ nhắm thẳng vào xe chứng cứ và kiệu của nhân chứng già. Và ở đợt cuối, tên đầu lĩnh sẽ tự ra mặt — quanh hông hắn, một pháp khí lạ đang tỏa ra vòng nhiễu mỏng: đòn cộng hưởng vào gần hắn sẽ lệch đi. Nhưng kiếm — kiếm thì không lệch.' }
  ];
  var SCENE_CH19_PHUC_KICH_XONG_A = [
    { who: 'narrate', text: 'Đợt cuối tan. Tên đầu lĩnh bị đánh bật khỏi phố, vòng nhiễu quanh hông hắn vỡ theo từng mảnh khi hắn tháo chạy về phía cổng. Đoàn nhân chứng — không một người bị thương. Xe chứng cứ còn nguyên. Kiệu của ông lão còn nguyên.' },
    { who: 'dan_c', text: '(ngồi bệt xuống vệ đường, cười mà như khóc) Tôi làm chứng ba mươi năm cho cái thành này… chưa lần nào được ai đưa về tận cổng như hôm nay. Công tử — kiếm của công tử vừa giữ không phải mấy cái mạng già này đâu. Nó giữ cái việc "dám nói thật" cho cả thành này đấy.' },
    { who: 'dan_thanh_b', text: 'Dân ở hai dãy phố đều thấy hết rồi, công tử. Thấy ai phục kích ai, và thấy ai đứng ra chắn. Chuyện này, từ mai, cả thành sẽ tự kể cho nhau nghe — không cần ai tuyên bố gì thêm nữa.' },
    { who: 'dan_thanh_a', text: 'Tôi về đập ngay đêm nay, công tử. Không phải trốn — là về nói với người của Đỗ gia ở đập rằng: ai ra lệnh đánh nhân chứng thì tự chịu, còn cái đập này, người giữ đập không bỏ. Nước của cả vùng không thể trả giá cho cơn giận của một nhà.' }
  ];
  var SCENE_CH19_PHUC_KICH_XONG_B = [
    { who: 'narrate', text: 'Đợt cuối tan — nhưng chậm một nhịp. Tên đầu lĩnh tháo chạy về phía cổng, để lại sau lưng một phố xáo trộn: xe chứng cứ lật nghiêng, sổ sách văng ra được nhặt lại gần đủ, và ông lão giữ đập bị thương ở vai khi kiệu đổ, máu thấm qua áo.' },
    { who: 'dan_c', text: '(giữ chặt vết thương, lắc đầu khi ngươi định đỡ) Không sao… không sao. Xương già này còn chịu được. (ông cười gượng) Tôi chỉ tiếc — suýt nữa thì cái việc "dám nói thật" ở thành này đã phải trả giá đắt hơn thế này nhiều. Công tử tới chậm một chút nữa thôi…' },
    { who: 'dan_thanh_b', text: '(dìu ông lão, quay lại nói với ngươi, mắt đỏ hoe) Công tử… ông nhà tôi làm chứng xong rồi. Dù có thế này, ông ấy vừa bảo tôi: phiên sau có cần người giữ đập ra nói, ông ấy vẫn ra. Công tử nghe xem — người ta dám thế là vì hôm nay có người đứng chắn cho họ.' },
    { who: 'narrate', text: 'Bản án đã tuyên vẫn đứng — không một trang sổ nào mất. Nhưng từ hôm nay, ngươi biết rõ một điều: giữ cho người ta dám nói thật, là một việc phải trả bằng kiếm, không phải bằng giấy.' }
  ];
  var SCENE_CH19_TUYEN_QUY_TAC = [
    { who: 'narrate', text: 'Trước cổng thành, giữa đám đông vừa chứng kiến cả phiên xử lẫn vụ phục kích, ngươi dừng lại. Ngươi lấy ra một tờ giấy trắng, đặt lên mặt án lưu động của phủ mà quan phủ cho người khiêng theo — và viết, chậm rãi, từng chữ một, trước mặt tất cả.' },
    { who: 'hero', mode: 'write', text: '(viết) "Lệnh của ta không cho mượn. Việc của ai, người đó xét bằng chứng cứ. Ai muốn mượn lệnh của ta để khỏi phải tự xét — người đó, từ nay, đừng tìm tới ta nữa."' },
    { who: 'narrate', text: 'Không ai đọc to tờ giấy ấy lên. Từng người trong đám đông tự đọc — và sự im lặng sau đó khác hẳn sự im lặng chờ lệnh ở đầu phiên: đó là im lặng của những người vừa hiểu ra rằng thứ họ chờ bấy lâu nay sẽ không bao giờ tới, và rằng có lẽ như thế mới là đúng.' },
    { who: 'u_nhan', text: '(đứng trong đám đông phía Hứa gia, nói vừa đủ cho những người quanh nghe, mắt không rời tờ giấy) Nghe cho kỹ đấy. Có người từng ngỏ ý đổi cả sự bảo hộ lâu dài cho Hứa gia lấy một lệnh của chàng. Hôm nay cả thành đã thấy câu trả lời rồi. Từ nay, ai muốn qua Hứa gia ta — cứ đi bằng chứng cứ như mọi người.' },
    { who: 'quan_phu', text: '(cầm tờ giấy lên bằng hai tay) Tờ này, phủ sẽ cho chép lại, đóng triện của phủ, treo ở cổng thành. Không phải như một lệnh — (ông nhìn ngươi) — như một án lệ. Để từ nay, ai tới phủ xin "một lệnh cho xong", người ta chỉ vào tờ này mà đáp.' },
    { who: 'gia_chu_ta', text: '(chắp tay, nói đủ để ngươi nghe) Công tử… lời hứa của Tạ gia hôm trước, ta xin rút lại cách nói của nó. Hứa gia có việc, Tạ gia vẫn đứng ra — không phải để mua gì nữa. Là vì hôm nay, nhà ta học được một điều từ công tử.' },
    { who: 'dan_thanh_a', text: '(trong đám đông, nói với người bên cạnh, không hề nhỏ tiếng) Từ nay ai hỏi ta vụ tuyền xử thế nào, ta chỉ nói một câu: không có lệnh nào cả. Chỉ có chứng cứ — và một tờ giấy treo ở cổng thành.' }
  ];
  var SCENE_CH19_VET_RAN = [
    { who: 'narrate', text: 'Đưa đoàn nhân chứng qua cổng xong, ngươi quay lại lấy đồ bỏ quên ở quán nước ngoài cổng — và dừng bước sau hàng cây. Cách đó không xa, gia chủ Đỗ gia đang đứng nói chuyện với một người lạ mặt quay lưng về phía thành.' },
    { who: 'narrate', text: 'Ngươi không nghe rõ lời. Nhưng tai ngươi nghe được thứ khác: quanh người lạ ấy có một tần số rất khẽ, rất quen — thứ sóng lệch của pháp khí loạn sóng, cùng họ với vòng nhiễu quanh hông tên đầu lĩnh phục kích ban chiều. Và khi người lạ quay nửa mặt, ngươi thấy bên hông hắn đeo một pháp khí nhỏ, mặt khắc vệt đỏ thẫm như máu khô.' },
    { who: 'narrate', text: 'Huyết Bạc Cung. Chúng không cần ra mặt nữa — chúng chỉ cần một nhà thế lực vừa thua án, vừa mất mặt, đang khát một chỗ dựa. Đỗ gia chủ nhận từ tay người lạ một vật nhỏ, gật đầu rất nhanh. Người lạ quay đi, lẫn vào đường mòn ngoài thành trước khi ngươi kịp lại gần.' },
    { who: 'hero', mode: 'write', text: '(viết, tự ghi vào sổ tay) "Đỗ gia — pháp khí loạn sóng — Huyết Bạc Cung. Vết rạn đã mở. Ghi lại ngày hôm nay."' },
    { who: 'narrate', text: 'Một chi tiết nữa mà chỉ người nghe được tần số mới nhận ra: sóng lệch quanh người lạ kia mạnh và đều hơn hẳn vòng nhiễu của tên đầu lĩnh ban chiều. Đó không phải pháp khí của một tên tay chân. Đó là đồ của kẻ cầm đầu một đường dây — kẻ đã đứng ngoài cổng thành này, giữa ban ngày, như thể chẳng sợ ai nhìn thấy.' },
    { who: 'narrate', text: 'Ngươi không đuổi theo. Một mình, ngoài cổng thành, đuổi theo lúc này chỉ đánh động cả đường dây. Việc này phải về tới đại điện Thanh Vân Tông trước đã.' }
  ];
  var SCENE_CH19_AN_DINH = [
    { who: 'narrate', text: 'Đại điện Thanh Vân Tông. Ngươi trình lại toàn bộ vụ việc bằng văn bản: bản án năm điều, vụ phục kích đoàn nhân chứng, tờ quy tắc treo ở cổng thành — và cuộc gặp ngoài cổng mà chỉ mình ngươi chứng kiến.' },
    { who: 'truong_lao_tong', text: 'Ta đọc hết rồi, cả phần ngươi ghi thêm ở cuối: "kẻ lạ mang pháp khí loạn sóng, sóng đều và mạnh hơn đồ của tay chân". Chi tiết ấy là quý nhất trong cả bản trình này. Nó nói rằng kẻ đứng sau không còn giấu mình kỹ như trước nữa — chúng đang cần đồng minh gấp, tới mức để lộ cả người cầm đầu đường dây.' },
    { who: 'truong_lao_tong', text: 'Xử một vụ tranh chấp mà không cho ai mượn lệnh, lại còn giữ được người làm chứng sống sót — việc này, tông ghi nhận cho ngươi. Còn tờ quy tắc kia… (ông gật đầu chậm rãi) Nó sẽ đi xa hơn vụ tuyền này nhiều. Từ nay, kẻ nào muốn mượn tiếng của Thanh Vân Tông qua ngươi, đều phải đọc nó trước.' },
    { who: 'truong_lao_tong', text: 'Riêng việc Đỗ gia tiếp xúc kẻ lạ: từ hôm nay, tông ấn định thế này — ngoài mặt giữ lễ với Đỗ gia như thường, không đánh động. Trong ngầm, mọi đoàn của tông và của các nhà liên quan ra khỏi thành đều tăng cảnh giác gấp đôi. Kẻ địch đã chọn cách đánh vào đoàn người đi đường — thì đoàn người đi đường là nơi ta phải giữ chắc nhất.' },
    { who: 'hero', mode: 'write', text: '(viết) "Đệ tử ghi nhớ. Các đoàn hộ tống từ nay — đệ tử xin nhận phần để mắt tới đường mòn ngoài thành."' },
    { who: 'truong_lao_tong', text: 'Ngồi xuống một lát đã. (ông rót trà, chậm rãi) Giữ một bản án cho yên, và giữ một cái tâm cho yên — là cùng một việc. Án không lệch vì người xử không nghiêng. Tâm không nghiêng vì người giữ không tham phần thắng của ai. Hôm nay ngươi làm được cả hai. Ghi nhớ cái cảm giác ấy — nó là tâm pháp, không nằm trong sách nào của tông đâu.' },
    { who: 'truong_lao_tong', text: 'Được. Nghỉ đi. Nhưng nhớ lấy câu này của ta: ngươi vừa đặt ra một quy tắc cho cả vùng. Sống với một quy tắc mình đặt ra — khó hơn đặt ra nó nhiều. Những ngày tới sẽ thử ngươi ở đúng chỗ ấy.' },
    { who: 'narrate', text: 'Chương 19 khép lại. Quy tắc "lệnh không cho mượn" từ hôm nay là luật sống của ngươi tới cuối chặng đường — và ngoài kia, trên đường mòn, những đoàn người sắp lên đường mà chưa biết mình sẽ cần tới nó.' }
  ];
  var SCENE_CH19_DONE = [
    { who: 'narrate', text: 'Tờ quy tắc ở cổng thành được chép thành ba bản trong đêm đầu tiên: một bản treo ở cổng, một bản giữ ở phủ, và một bản — không ai biết bằng cách nào — đã tới tay các nhà thế lực trong vùng trước cả khi trời sáng.' },
    { who: 'narrate', text: 'Từ hôm nay, lượt lặp hộ vệ áp tải vào bảng việc tông và treo thưởng: áp tải nhân chứng, văn thư và người làm chứng giữa thành và tông — trận hộ vệ của chương này từ nay là một việc làm được lặp lại, với phần thưởng theo dải Kim Đan.' },
    { who: 'narrate', text: 'Tu vi sự kiện +150 đã ghi nhận. Nhưng thứ chương này để lại không nằm trong sổ tu vi: nó là một câu viết tay treo ở cổng thành, và một vết rạn ngoài cổng thành đang mở dần về phía bóng tối.' },
    { who: 'narrate', text: 'Và ở một nơi khác trong thành, có một thế lực vừa nhận ra: người thanh niên không bao giờ cất lời ấy vừa tự tay đóng cánh cửa mà mọi kẻ muốn mượn lệnh đang xếp hàng chờ. Từ nay, muốn đối phó với hắn, chúng phải tìm một cánh cửa khác — chẳng hạn, cánh cửa của chính cơ quan nắm mọi hồ sơ thiên hạ.' }
  ];
  /* ================= CUNG IV — CHƯƠNG 20: RẠN NỨT TRONG CÁC =================
     Cài NGUYÊN VĂN từng dòng từ bản thảo khóa tools/work/arc-iv-prep/scripts/ch20.js
     (thiết kế: docs/arc-iv-detail/20.md; hợp đồng arciv-work/CONTRACT-wave2.md mục A.9). */
  var SCENE_CH20_RAN_NUT_A = [
    { who: 'narrate', text: 'Tĩnh Quan Lâu, phòng kín phía bắc — căn phòng của lần đầu ngươi tự mình nói ra thân phận. Trần Chính Đạo cho người đóng cửa, tự tay rót trà, và không để ký lục quan vào ghi chép. Lần này, ông tới với tư cách một người báo ơn, không phải người của các.' },
    { who: 'tran_chinh_dao', text: 'Cậu Giang, ta báo trước cho cậu một việc mà lẽ ra người của các không được báo: ta đang bị chất vấn trong nội bộ. Câu hỏi đặt trên bàn của các là thế này — "Hồ sơ Giang Phàm: vì sao chỉ ghi, mà không xử lý?"' },
    { who: 'tran_chinh_dao', text: 'Người chất vấn là Bạch Kính Đường. Ông ấy không ác. Ông ấy chỉ tin một điều suốt hai mươi năm: mọi Hồn Sư trong thiên hạ đều phải nằm trong một danh sách có người trông coi. Cậu thì nằm trong danh sách — nhưng là do chính cậu tự đọc cho ghi, hôm ấy, ngay tại phòng này.' },
    { who: 'tran_chinh_dao', text: 'Ta đã đáp thay cậu một câu trong buổi chất vấn: "Người tự mình nói ra sự thật về mình, không phải là một hồ sơ cần xử lý. Đó là một đối tác." Câu ấy giữ được ta tới hôm nay — nhưng không giữ được mãi. Họ muốn một hình thức trông coi nào đó đặt lên cậu, cho "đúng lệ".' },
    { who: 'hero', mode: 'write', text: '(viết) "Ông báo trước cho ta — các mà biết, ông sẽ bị tội. Vì sao?"' },
    { who: 'tran_chinh_dao', text: '(cười khẽ) Vì ngày cậu nói "ta là Hồn Sư" ở phòng này, cậu đã tin ta trước. Nợ niềm tin, trả bằng niềm tin — đó là lệ của riêng ta, không phải lệ của các. Cậu nghe tiếp đây: người của ta sẽ gặp cậu ở Vọng Châu khách điếm, nói rõ cái mà họ gọi là "quản thúc mềm". Nghe cho hết, rồi hãy đáp.' },
    { who: 'tran_chinh_dao', text: 'Thêm một việc nữa, để cậu liệu đường: người của Bạch Kính Đường đã bắt đầu đứng ở những nơi cậu hay qua lại. Không theo dõi lén — đứng công khai, ghi chép công khai. Họ muốn cậu tự thấy, tự khó chịu, rồi tự tới lầu mà thương lượng. Đó là cách các ép người ta nhận "bảo hộ" từ bao đời nay.' },
    { who: 'narrate', text: 'Ngươi đứng dậy ra về. Ở cửa lầu, người tiếp khách cúi chào ngươi bằng lễ của một đối tác được các công nhận — thứ lễ mà không một hồ sơ "theo dõi" nào nhận được. Cùng một tòa lầu, hai cách đối đãi, và ngươi vừa thấy cả hai trong một buổi sáng.' },
    { who: 'narrate', text: 'Đường tự nói ra năm xưa đang trả lãi theo cách không ai tính trước: khi hậu quả tới, ngươi là người được biết TRƯỚC — từ chính miệng người đứng giữa cơn rạn nứt.' }
  ];
  var SCENE_CH20_RAN_NUT_B = [
    { who: 'narrate', text: 'Tin đồn tới tai ngươi ở chợ Cô Châu Thành trước, như mọi tin xấu khác kể từ ngày thân phận của ngươi bị tung ra ở chính cái chợ này: "Thiên Cơ Các sắp đặt người trông coi Hồn Sư họ Giang", "nghe đâu ông già giữ hồ sơ bị hỏi tội vì nó". Mỗi người kể một kiểu. Không kiểu nào tử tế.' },
    { who: 'cho_a', text: 'Cậu Giang! Cậu nghe gì chưa — người ta nói các sắp cử người đi theo cậu như đi theo tù nhân ấy! Cái bọn tung tin về cậu dạo trước, giờ lại có cớ mới để nói rồi. Cậu… cậu lên lầu mà hỏi cho ra nhẽ đi, đừng để chúng nó nói thay cậu mãi thế!' },
    { who: 'narrate', text: 'Tĩnh Quan Lâu tiếp ngươi bằng một người tiếp khách lạ mặt, một ấm trà đã nguội, và một câu trả lời tập sẵn: "Việc nội bộ của các, không tiện bàn với người ngoài." Người ngoài. Sau tất cả những gì đã xảy ra ở tòa lầu này, ngươi vẫn chỉ là người ngoài khi họ muốn thế.' },
    { who: 'tiep_khach', text: 'Giang công tử, giám sát sứ có lời nhắn duy nhất cho công tử hôm nay: hồ sơ của công tử đang được "xem xét lại theo lệ". Khi nào có kết quả, các sẽ báo. Ngoài ra… xin công tử đừng nghe tin đồn ở chợ. Tin đồn ở chợ, công tử biết rõ hơn ai hết là nó đáng tin tới đâu.' },
    { who: 'narrate', text: 'Chỉ khi ngươi đã ra tới cửa, ký lục quan năm xưa — người từng gạch sửa hồ sơ theo lời ngươi — mới đuổi theo, dúi vào tay ngươi một mảnh giấy nhỏ, không triện, không chữ ký: "Họp kín. Trần Chính Đạo bị chất vấn vì hồ sơ của cậu. Bạch Kính Đường chủ trương quản thúc mềm. Cẩn thận."' },
    { who: 'ky_luc_quan', text: '(nói rất nhanh, rất khẽ) Tôi chỉ làm được thế này thôi. Lần trước cậu sửa hồ sơ bằng sự thật — lần này, họ định sửa cậu bằng lệ. Người của Trần Chính Đạo sẽ tìm cậu ở Vọng Châu khách điếm. Tới đó mà nghe phần còn lại.' },
    { who: 'narrate', text: 'Mảnh giấy không triện kia nặng hơn mọi văn bản ngươi từng cầm ở lầu này. Nó nói một điều mà không dòng nào trong đó viết ra: trong tòa lầu nắm mọi bí mật thiên hạ, vẫn có người sẵn sàng mạo hiểm vì một kẻ bị chính lầu ấy đẩy ra ngoài danh sách tử tế.' },
    { who: 'dan_thanh_b', text: '(một người đàn bà bán vải ở chợ kéo tay áo ngươi lại, hạ giọng) Cậu Giang, tôi nói câu này cậu đừng giận: người ta đồn cậu sắp bị các "trông coi" — mà tôi thì thấy, từ ngày cậu chữa hồn công khai, chợ này yên hơn hẳn. Ai trông coi ai, thiên hạ tự biết cả. Cậu cứ đi đứng cho đàng hoàng như bấy lâu nay là được.' },
    { who: 'narrate', text: 'Đường bị lộ năm xưa cũng trả lãi theo cách của nó: khi hậu quả tới, ngươi là người biết SAU CÙNG — qua tin đồn, qua một cánh cửa khép hờ, và qua một mảnh giấy không ai dám ký tên.' }
  ];
  var SCENE_CH20_BAO_TIN_A = [
    { who: 'narrate', text: 'Vọng Châu khách điếm, gian phòng cuối hành lang. Người chờ ngươi là một thuộc hạ cũ của Trần Chính Đạo — người đã từng đứng gác kho hồ sơ của các, nay nói năng như người nhà.' },
    { who: 'gac_kho', text: 'Giang công tử, ông chủ dặn tôi nói nguyên văn, không thêm bớt: Bạch Kính Đường đã trình lên các một đề xuất tên là "quản thúc mềm". Mọi đoàn có công tử đi cùng phải khai báo lộ trình với các trước khi đi. Đổi lại, các "bảo hộ" công tử: thế lực nào muốn mượn danh, mượn lệnh của công tử, các đứng ra chặn.' },
    { who: 'gac_kho', text: 'Ông chủ nói thêm một câu không có trong đề xuất: quản thúc mềm và mượn lệnh — là cùng một ý đồ ở hai quy mô. Kẻ muốn mượn lệnh của công tử thì mượn một câu. Các muốn "bảo hộ" công tử thì mượn cả đường đi của công tử. Mượn nhỏ, mượn lớn — vẫn là mượn.' },
    { who: 'hero', mode: 'write', text: '(viết) "Nói lại với ông chủ của ngươi: ta nghe rõ rồi. Lời đáp của ta sẽ tới lầu bằng văn bản, như mọi lần."' },
    { who: 'gac_kho', text: 'Tôi sẽ chuyển nguyên văn. (hắn đứng dậy, rồi dừng lại ở cửa) Công tử… trong các bây giờ chia hai nửa thật rồi. Nửa theo ông Bạch, nửa theo ông chủ tôi. Công tử đáp thế nào, là một nửa trong các sẽ dùng đáp án ấy làm vũ khí đánh nửa kia. Cân nhắc cho kỹ.' },
    { who: 'gac_kho', text: 'Một việc cuối, ông chủ dặn riêng: ca chữa hồn công khai ở tông của công tử vẫn theo lịch như thường — đừng hủy vì chuyện này. Ông chủ nói: "Cứ để hắn làm việc của hắn trước mặt thiên hạ. Thiên hạ chứng kiến càng nhiều, hồ sơ càng khó bị ai sửa." Tôi chuyển hết lời rồi, công tử.' },
    { who: 'narrate', text: 'Ngươi ngồi lại một mình với ấm trà. Hồ sơ của ngươi — thứ bắt đầu từ một vệt hồn lực ở thung lũng — giờ đã thành vũ khí trong một cuộc đấu mà ngươi không hề chọn tham gia. Và lời khuyên khôn ngoan nhất ngươi nhận được hôm nay lại là: cứ tiếp tục làm việc của mình, giữa ban ngày, trước mặt mọi người.' }
  ];
  var SCENE_CH20_BAO_TIN_B = [
    { who: 'narrate', text: 'Vọng Châu khách điếm, gian phòng cuối hành lang. Người chờ ngươi không phải người của các — là Trần Tư Linh, và nàng tới bằng đường vòng qua chợ, như một người biết mình đang bị để ý.' },
    { who: 'tran_tu_linh', text: 'Giang công tử, nghe ta nói cho nhanh, việc này không viết vào thư được. Bạch Kính Đường đã trình lên Thiên Cơ Các một đề xuất: "quản thúc mềm". Mọi đoàn có công tử đi cùng phải khai báo với các trước. Đổi lại, các đứng ra "bảo hộ" công tử — chặn các thế lực muốn mượn danh, mượn lệnh của công tử.' },
    { who: 'tran_tu_linh', text: 'Nghe thì tử tế, đúng không? Nhưng công tử ngẫm mà xem: quản thúc mềm và mượn lệnh là cùng một ý đồ, chỉ khác quy mô. Kẻ mượn lệnh thì mượn một câu nói. Các mà "bảo hộ" — là mượn cả đường đi nước bước của công tử, mượn vô thời hạn, lại còn được mang tiếng là ơn.' },
    { who: 'tran_tu_linh', text: 'Còn một việc nữa, ta chỉ nghe được qua người quen trong các: Trần Chính Đạo đang bị chất vấn vì sao hồ sơ của công tử "chỉ ghi mà không xử lý". Ông ấy cãi cho công tử trong buổi họp kín — một mình. Bị lộ hay tự lộ, tới hồi hậu quả thì ai cũng phải trả giá thay phần của mình, công tử ạ.' },
    { who: 'hero', mode: 'write', text: '(viết) "Cảm ơn nàng. Lời đáp của ta sẽ tới lầu bằng văn bản — lần này, ta muốn nó tới tay cả hai phía trong các."' },
    { who: 'tran_tu_linh', text: 'Vậy thì viết cho khéo vào. Trong các giờ chia hai nửa rồi — đáp án của công tử sẽ thành vũ khí cho một nửa đánh nửa kia, dù công tử có muốn hay không. (nàng đứng dậy, kéo khăn che mặt) Ta đi đường chợ về. Công tử đi đường sau. Từ nay gặp nhau… cũng phải lựa chỗ như thế này đấy.' },
    { who: 'narrate', text: 'Ngươi ra khỏi khách điếm bằng cửa sau, theo đúng lời nàng dặn — và nhận ra, không cần ai tuyên bố, quản thúc mềm thực ra đã bắt đầu rồi: bắt đầu từ việc những người quý ngươi phải lựa đường mà đi.' }
  ];
  var SCENE_CH20_GIAM_SAT = [
    { who: 'narrate', text: 'Không cần ai báo nữa — từ hôm nay, ngươi tự thấy. Ở cổng nam thành, hai người mặc áo của Thiên Cơ Các đứng ghi chép từng đoàn xe ra vào, không giấu giếm: đoàn nào có ngươi đi cùng, bút của họ dừng lại lâu hơn một nhịp.' },
    { who: 'ky_luc_quan', text: '(người ký lục trẻ đứng ở cổng, thấy ngươi thì cúi đầu rất thấp, giọng lí nhí) Giang công tử… tôi chỉ làm theo lệnh trên. Ghi chép đoàn ra vào thành — đoàn nào cũng ghi, không phải riêng… (nàng không nói hết câu, vì chính nàng cũng không tin câu ấy)' },
    { who: 'dan_thanh_a', text: '(người giữ đập đi qua cổng, nói to cốt để mọi người cùng nghe) Ối chà, từ ngày có người của các đứng cổng, trộm cướp ở thành này chắc sợ lắm nhỉ? Hay là chúng chỉ sợ mỗi một người — người không hề trộm cướp gì của ai?' },
    { who: 'narrate', text: 'Ở đài tông cũng thế: một người của các đứng xem các buổi luyện công từ xa, phép tắc, im lặng, và ghi chép. Đệ tử trong tông bắt đầu tránh nhắc tới tên ngươi khi có mặt họ — không phải vì sợ ngươi. Vì sợ cho ngươi. Sự hiện diện ấy không đánh ai, không cấm ai. Nó chỉ làm mọi thứ xung quanh ngươi chậm lại một nhịp, như nước chảy qua một con đập vô hình.' },
    { who: 'de_tu_a', text: '(một đệ tử trẻ ở đài tông ghé lại, nói khẽ) Giang sư huynh… người của các đứng xem buổi luyện sáng nay, đệ và mấy người nữa cố ý luyện dở đi, sợ họ ghi chép gì về tông. Trưởng lão biết chuyện, phạt cả bọn chép quy củ: "Tông này không có gì phải giấu. Luyện dở trước mặt khách — mới là điều đáng ghi." Đệ kể để sư huynh biết: trong tông, mọi người đứng về phía sư huynh cả.' },
    { who: 'narrate', text: 'Quản thúc mềm là như thế đó: không xiềng, không khóa — chỉ là một con mắt không bao giờ chớp, đặt ở mọi nơi ngươi đi qua. Ngươi thu hết vào mắt, rồi quay về tông. Ở đó, một ca chữa hồn công khai đang chờ — ca cuối cùng trước khi ngươi đưa lời đáp tới lầu.' }
  ];
  var SCENE_CH20_HON_LOAN_MO = [
    { who: 'narrate', text: 'Sân luyện của Thanh Vân Tông, một buổi chữa hồn công khai như nhiều buổi từ ngày dịch vụ hồn mở ra. Người bệnh hôm nay là một đệ tử trẻ bị tổn thương thần hồn trong chuyến đi đường mòn — chuyến đi mà đoàn của cậu ta bị dư chấn loạn sóng quét qua.' },
    { who: 'de_tu_b', text: 'Giang sư huynh, đệ đi cùng đoàn áp tải hôm ấy. Lúc sóng loạn quét qua, đệ chỉ thấy tai ù đi một lúc rồi thôi. Nhưng từ hôm đó, đêm nào đệ cũng nghe trong đầu có tiếng gì đó… gõ. Gõ không theo nhịp nào cả. Đệ không ngủ được nữa, sư huynh.' },
    { who: 'truong_lao_tong', text: 'Ca này, ngươi chữa trước mặt mọi người như thường lệ. (ông hạ giọng) Nhưng ta nói trước: hồn của đứa trẻ này không giống các ca trước. Ta đứng đây không phải để xem — là để phòng. Bắt đầu đi.' },
    { who: 'de_tu_a', text: '(đồng môn đi cùng đoàn hôm ấy, đứng trong vòng người xem, giọng nghẹn lại) Giang sư huynh, hôm sóng loạn quét qua, chính đệ kéo cậu ấy ra khỏi vùng nhiễu. Cậu ấy mê đi một lúc rồi tỉnh, còn cười nói được — ai cũng tưởng không sao. Tới đêm thứ hai cậu ấy mới bắt đầu đập đầu vào gối mà khóc vì tiếng gõ. Sư huynh… cứu cậu ấy với. Cả đoàn nợ cậu ấy một mạng ở chỗ kéo xe hôm ấy đấy.' },
    { who: 'narrate', text: 'Ngươi đặt tay, vận hồn lực, và nghe. Thoạt đầu là nhịp quen thuộc của một thần hồn bị chấn động. Rồi — dưới nhịp ấy — một thứ khác trồi lên: một tần số lệch, méo, gõ loạn không theo bất cứ trật tự nào, hệt như tiếng gõ trong đầu cậu đệ tử. Nó không nằm yên cho ngươi chỉnh. Nó vùng lên.' },
    { who: 'oan_hon', text: 'Đau… đau… thả… ra… nhịp… vỡ… hết… rồi…' },
    { who: 'narrate', text: 'Đệ tử trẻ bật dậy, mắt mở trừng mà không thấy gì, hai tay ôm đầu. Hồn của cậu ta đang loạn — không phải oán hồn từ ngoài vào, mà là chính thần hồn bị dư chấn loạn sóng xô lệch tới mức tự nó thành một thực thể lệch tần, đang đau và đang vùng vẫy trong chính thân xác của mình. Muốn cứu cậu ta, trước hết phải giữ cho nhịp loạn ấy đứng yên: Định Âm — giữ nhịp, đủ lâu, giữa lúc nó quấy phá mạnh nhất.' }
  ];
  var SCENE_CH20_HON_LOAN_XONG_A = [
    { who: 'narrate', text: 'Nhịp cuối cùng được giữ đứng yên — và đường sóng méo trong tai ngươi duỗi thẳng ra, chậm rãi, như một sợi dây đàn được nới về đúng âm. Tiếng gõ loạn im bặt. Đệ tử trẻ ngã xuống, ngủ thiếp đi ngay giữa sân — giấc ngủ đầu tiên của cậu ta sau nhiều đêm, sâu và yên.' },
    { who: 'oan_hon', text: 'Hết… đau… rồi… cảm… ơn…' },
    { who: 'de_tu_b', text: '(tỉnh lại sau một lúc, giọng còn mơ màng) Im rồi… trong đầu đệ im hẳn rồi. Sư huynh — đệ nghe được tiếng gió ngoài sân. Chỉ tiếng gió thôi. Đẹp quá…' },
    { who: 'truong_lao_tong', text: 'Ngươi vừa làm một việc mà ta chưa từng thấy Hồn Sư nào làm: không trấn, không phá — ngươi chữa cho một cái hồn đang loạn bằng cách giữ nhịp cho nó tự đứng dậy. Việc này… (ông nhìn quanh sân chật kín đệ tử) đã có hàng trăm người chứng kiến. Tốt. Rất tốt cho việc sắp tới.' },
    { who: 'narrate', text: 'Tin về ca chữa chạy khỏi sân tông nhanh hơn mọi tin đồn từng chạy khỏi cái chợ dưới thành — vì lần này, người kể là hàng trăm đệ tử tận mắt chứng kiến, và câu chuyện không cần thêm một chút ác ý nào vẫn đủ khiến người nghe phải im lặng. Hồn lực của ngươi sau ca này cũng dày thêm một phần rõ rệt: giữ nhịp cho một hồn loạn tới cùng là một lượt rèn mà không bí cảnh nào cho được.' }
  ];
  var SCENE_CH20_HON_LOAN_XONG_B = [
    { who: 'narrate', text: 'Ngươi không giữ nổi nhịp tới cùng — và chọn cách nhanh hơn: dồn hồn lực phá tan tần số lệch ngay tại đỉnh loạn của nó. Tiếng gõ trong đầu đệ tử trẻ vỡ ra như mặt băng nứt. Cậu ta ngã xuống, mê đi, nhưng hơi thở đã đều: thần hồn bị phá mất một phần mảnh lệch, lành lại sẽ chậm hơn, và yếu hơn trước một chút.' },
    { who: 'de_tu_b', text: '(tỉnh lại, sờ lên trán, giọng khàn) Hết gõ rồi, sư huynh… Đầu đệ nhẹ, mà trống. Như vừa mất một cái gì đó không gọi tên được. Nhưng hết đau — hết đau là được rồi, sư huynh đừng tự trách.' },
    { who: 'truong_lao_tong', text: 'Phá cũng là một cách cứu — người còn sống, hồn còn lành được, chỉ là chậm hơn. (ông nhìn quanh sân chật kín đệ tử) Và việc ngươi vừa làm, dù theo cách nào, cũng đã có hàng trăm người chứng kiến. Điều đó, lúc này, quan trọng hơn cả cách ngươi chọn.' },
    { who: 'de_tu_a', text: '(dìu bạn mình xuống sân, quay lại chắp tay với ngươi, nói to cho cả vòng người nghe) Dù là cách nào — cậu ấy còn sống, còn là người của đoàn. Giang sư huynh, ơn này đoàn áp tải chúng tôi ghi. Ai hỏi chuyện hôm nay, chúng tôi kể đúng như mắt thấy: một Hồn Sư cứu người giữa ban ngày, trước mặt cả tông.' },
    { who: 'narrate', text: 'Tin về ca chữa chạy khỏi sân tông nhanh hơn mọi tin đồn từng chạy khỏi cái chợ dưới thành — vì lần này, người kể là hàng trăm đệ tử và cả một đoàn áp tải tận mắt chứng kiến. Hồn lực của ngươi sau ca này cũng dày thêm, dù không trọn vẹn như khi giữ được nhịp tới cùng.' }
  ];
  var SCENE_CH20_GHI_NHAN_A = [
    { who: 'narrate', text: 'Chưa đầy một ngày sau ca chữa hồn ở sân tông, người của Thiên Cơ Các tới — nhưng lần này không phải người giám sát. Trần Chính Đạo đích thân mang theo một văn bản đóng triện của các, đọc to ngay giữa đại điện, trước mặt trưởng lão và các đệ tử có mặt.' },
    { who: 'tran_chinh_dao', text: '"Thiên Cơ Các ghi nhận: Giang Phàm, đệ tử Thanh Vân Tông — Hồn Sư, phẩm bốn. Tư cách hành nghề hồn sư của người này được các bảo chứng trước thiên hạ. Mọi hồ sơ cũ về người này, từ nay xếp vào loại: hồ sơ của một người hành nghề hợp lệ — không phải hồ sơ theo dõi."' },
    { who: 'tran_chinh_dao', text: '(gấp văn bản lại, nói riêng với ngươi) Đây là cách ta dùng cậu làm khiên cho chính cậu, cậu Giang: cãi nhau trong các là việc của ta, nhưng một khi tư cách của cậu đã thành văn bản có triện, Bạch Kính Đường muốn "xử lý" cậu thì phải xử lý cả uy tín của các trước. Phẩm hồn bốn — cậu xứng đáng từ lâu. Chỉ là hôm nay, nó mới được nói ra đúng lúc cần nhất.' },
    { who: 'truong_lao_tong', text: 'Thanh Vân Tông nhận văn bản này, và ghi vào sổ của tông một dòng tương ứng. Từ nay, các ca hồn khó của cả vùng — người bệnh từ các nhà thế lực đưa tới — sẽ qua sân của tông này, qua tay đệ tử của ta. Dịch vụ hồn cấp tông môn: mở từ hôm nay.' },
    { who: 'ky_luc_quan', text: '(người ký lục đi theo đoàn của các, ghé lại lúc ra về, nói nhanh) Giang công tử — tôi là người ghi biên bản ca chữa hôm qua ở sân tông cho các. Tôi ghi đúng từng chữ những gì mắt thấy, không bớt một chữ nào. Lần này, không ai sửa được hồ sơ của công tử nữa đâu. Vì nó không còn là hồ sơ nữa — nó là chuyện cả vùng đều biết.' },
    { who: 'narrate', text: 'Phẩm hồn 3 → 4. Không phải ngươi chọn khoảnh khắc này — khoảnh khắc này chọn ngươi, giữa một cuộc đấu nội bộ mà ngươi không khởi xướng. Nhưng cái tên được ghi vào văn bản, lần này, được ghi đúng: một Hồn Sư. Không phải một vệt lạ trong hồ sơ của ai.' }
  ];
  var SCENE_CH20_GHI_NHAN_B = [
    { who: 'narrate', text: 'Chưa đầy một ngày sau ca chữa hồn ở sân tông, tin về ca chữa ấy đã chạy khắp thành — và Thiên Cơ Các im lặng. Không văn bản, không người tới. Sự im lặng ấy chính là câu trả lời của họ: hồ sơ của ngươi vẫn là "theo dõi", và sẽ còn là theo dõi tới khi nào họ muốn.' },
    { who: 'truong_lao_tong', text: 'Vậy thì tông lên tiếng thay. (trưởng lão đứng dậy giữa đại điện, giọng vang khắp sân) Nghe cho rõ đây, các đệ tử: từ hôm nay, Thanh Vân Tông ghi nhận trước thiên hạ — Giang Phàm, đệ tử của tông này, là Hồn Sư phẩm bốn. Tông bảo chứng cho tư cách hành nghề của hắn. Kẻ nào — dù là thế lực nào — muốn gọi hắn là "lai lịch bất minh", kẻ đó phải bước qua cửa điện này mà nói.' },
    { who: 'truong_lao_tong', text: '(quay sang ngươi, hạ giọng) Thiên Cơ Các ghi nhận hay không, là việc của các. Tông ghi nhận, là việc của nhà mình. Phẩm hồn bốn của ngươi không do triện của ai cấp — nó do chính tay ngươi chữa từng ca một mà thành. Triện chỉ là thứ đuổi theo sau, sớm hay muộn.' },
    { who: 'hoa_huong_than', text: 'Trưởng lão, đệ tử xin ghi lời tuyên bố này vào sổ đại điện, và cho người chép gửi tới các nhà trong vùng ngay hôm nay. Từ nay các ca hồn khó của cả vùng sẽ đưa tới tông — dịch vụ hồn cấp tông môn, đệ tử xin nhận phần sắp xếp.' },
    { who: 'de_tu_b', text: '(đệ tử vừa được chữa, được đồng môn dìu tới trước điện, quỳ xuống dù vai còn run) Đệ tử không biết nói gì cho phải. Chỉ xin ghi một câu vào sổ của tông: mạng này, thần hồn này — là Giang sư huynh giữ lại cho đệ tử, giữa sân, trước mặt mọi người. Sau này ai hỏi đệ tử về Hồn Sư họ Giang, đệ tử chỉ kể lại ngày hôm nay.' },
    { who: 'narrate', text: 'Phẩm hồn 3 → 4 — lần này không bằng triện của các, mà bằng tiếng nói của chính tông môn ngươi thuộc về. Không phải ngươi chọn khoảnh khắc này. Nhưng phía đứng ra ghi nhận cho ngươi, lần này, là phía chưa từng để kẻ khác nói thay ngươi một lần nào.' }
  ];
  var SCENE_CH20_LOI_DAP = [
    { who: 'narrate', text: 'Tĩnh Quan Lâu. Lời đáp của ngươi được đặt lên án dài trong phòng kín — một tờ văn bản viết tay, ngắn, và được gửi tới cả hai phía trong các cùng một lúc, đúng như ngươi đã định.' },
    { who: 'hero', mode: 'write', text: '(viết) "Ta từ chối quản thúc mềm. Nguyên tắc của ta đã treo ở cổng Cô Châu Thành: lệnh của ta không cho mượn — và đường đi của ta cũng thế. Các muốn biết gì về các đoàn có ta đi cùng, cứ hỏi thẳng Thanh Vân Tông, như hai thế lực ngang hàng hỏi nhau. Ta chữa hồn cho người bệnh của mọi nhà, không trừ nhà nào. Ngoài ra, không còn gì để ghi."' },
    { who: 'tran_chinh_dao', text: '(đọc xong, gật đầu rất chậm) Ngắn. Và không chừa một kẽ nào cho ai mượn. Cậu Giang — cậu vừa áp cái quy tắc ở cổng thành lên chính Thiên Cơ Các. Có người trong các sẽ nổi giận. Cũng có người — như ta — sẽ dùng tờ này làm khiên cho cậu trong mọi buổi họp từ nay.' },
    { who: 'bach_kinh_duong', text: '(lão giám sát sứ cầm tờ văn bản lên, đọc lại lần thứ hai, rồi đặt xuống rất nhẹ) Hai mươi năm giữ hồ sơ, ta chưa từng bị một Hồn Sư từ chối mà… không tìm được một chữ nào để trách. (ông đứng dậy) Lời đáp này, ta ghi vào hồ sơ của cậu — nguyên văn. Đề xuất quản thúc mềm: rút lại. Không phải vì ta đổi ý — mà vì một người đã tự đặt luật cho mình và sống đúng luật ấy, thì không cần ai trông coi nữa.' },
    { who: 'narrate', text: 'Ngoài cửa lầu, người giám sát từng đứng ghi chép ở cổng thành sáng nay đã không còn ở vị trí của hắn. Không ai tuyên bố gì về việc ấy. Có những thắng lợi không cần ai tuyên bố: chỉ là một buổi sáng, một vị trí trống, và những đoàn xe lại ra vào cổng thành như chưa từng bị ai đếm.' },
    { who: 'narrate', text: 'Rạn nứt trong các chưa lành — nó sẽ còn đi theo ngươi sang những chặng sau. Nhưng từ hôm nay, vị thế của ngươi trong vết rạn ấy đã khác: không còn là một hồ sơ chờ xử lý, mà là một Hồn Sư phẩm bốn, có tông môn đứng sau, và một quy tắc mà ngay cả Thiên Cơ Các cũng vừa phải ghi lại nguyên văn.' }
  ];
  var SCENE_CH20_DONE = [
    { who: 'narrate', text: 'Tin cuối ngày: dịch vụ hồn cấp tông môn nhận ca đầu tiên ngay trong tuần — người bệnh từ một nhà thế lực ở tận phía tây vùng, đưa tới bằng xe ngựa, trả công theo dải Kim Đan. Lượt lặp luyện hồn ở Tàn Tích tầng sâu cũng có thêm hồ sơ ca "hồn loạn" cho những ai muốn thử giữ nhịp như ngươi đã làm.' },
    { who: 'narrate', text: 'Ở Cô Châu Thành đêm ấy, tờ quy tắc ở cổng thành có thêm một tờ giấy nhỏ được ai đó dán ngay bên dưới — không triện, không ký tên, chỉ một dòng chữ của dân thành: "Người này chữa hồn cho con tôi. Ai trông coi người này, là trông coi cả nhà tôi."' },
    { who: 'narrate', text: 'Chương 20 khép lại. Tu vi sự kiện +200 đã ghi nhận — khoản lớn nhất của chặng. Ngươi đứng giữa sân tông lúc trời tối, nghe tiếng gió chạy qua mái điện: một âm thanh thẳng, đều, không lệch một nhịp nào. Sau lưng ngươi, trong các, một vết rạn vẫn còn đó. Trước mặt ngươi, những đoàn người sắp lên đường — và lần này, có cả những con mắt đang chờ xem ngươi sẽ đi cùng họ thế nào.' }
  ];
  /* SCENE_CH20_SOUL_SERVICE — cảnh dịch vụ lặp, sản xuất đợt 2,
     KHÔNG thuộc kịch bản khóa prep (hợp đồng đợt 2 mục A.9/B.3):
     ca hồn nặng đưa tới tông, Giang Phàm trấn bằng Định Âm, tông ghi công. */
  var SCENE_CH20_SOUL_SERVICE = [
    { who: 'narrate', text: 'Một ca hồn nặng nữa được đưa tới tông — người bệnh là khách của một nhà thế lực, hồn lệch nhịp không ngừng từ sau những đợt loạn sóng gần đây.' },
    { who: 'hoa_huong_than', text: 'Ca này để ta ghi sổ dịch vụ cấp tông. Sư đệ giữ nhịp cho người ta như đã giữ ở ca trước — chậm thôi, hồn người này yếu, không chịu được sóng mạnh.' },
    { who: 'de_tu_b', text: 'Đệ đứng ngoài cửa mà còn nghe tiếng hồn lệch ấy rít qua tai. Trong phòng mà sư huynh vẫn đứng yên được như thế…' },
    { who: 'hoa_huong_than', text: 'Nhịp đã thẳng lại rồi. Tốt — Định Âm của sư đệ bây giờ là tay nghề của tông, không còn là việc phải giấu nữa. Khoản công của ca này ta ghi vào sổ cho sư đệ.' },
    { who: 'narrate', text: 'Ca hồn khép lại trong yên lặng. Trên sổ dịch vụ cấp tông của Thanh Vân Tông, thêm một dòng ghi công — và cái tên Giang Phàm, lần này, được viết thẳng ở cột người chữa.' }
  ];
  /* ================= CUNG IV — CHƯƠNG 21: NGƯỜI THAY MẶT NHÀ HỌ HỨA =================
     Cài NGUYÊN VĂN từng dòng từ bản thảo khóa tools/work/arc-iv-prep/scripts/ch21.js
     (thiết kế: docs/arc-iv-detail/21.md; hợp đồng arciv-work/CONTRACT-wave3.md mục A.4). */
  var SCENE_CH21_DOAN_THUONG = [
    { who: 'narrate', text: 'Chợ Cô Châu, giờ Tỵ. Đoàn thương nhân phương nam mà Hứa U Nhàn bảo lãnh từ dạo trước bị vây giữa chợ: ba nhà buôn lớn của thành cùng một sáng đồng loạt hạ giá mua xuống còn sáu phần, lại nâng giá nguyên liệu đoàn cần lên gấp rưỡi — và tin đồn "đoàn sắp vỡ nợ" đã chạy khắp các sạp hàng trước cả khi đoàn kịp mở kiện hàng đầu tiên.' },
    { who: 'truong_doan', text: 'Cô nương Hứa, lão phu buôn bán ba mươi năm chưa gặp cảnh này. Cùng một buổi sáng, nhà nào cũng nói một giá như đã hẹn nhau từ đêm qua. Đoàn của lão mà bán theo giá này, về tới nhà là trắng tay.' },
    { who: 'ep_gia', text: 'Giá chợ là giá chợ, ai ép ai bao giờ. Hàng của đoàn các người chất đống thế kia, để thêm một ngày là hao một ngày. Bán thì bán, không bán thì cứ để đấy — bọn ta không thiếu hàng để mua.' },
    { who: 'u_nhan', text: 'Ông nói đúng một nửa: giá chợ là giá chợ. Nhưng giá chợ không hẹn nhau qua đêm. Ba nhà, một giá, lệch nhau không tới một hào — sổ của các ông sẽ tự nói thay các ông, khỏi cần ta nói.' },
    { who: 'u_nhan', text: 'Trưởng đoàn, ông cứ cho người giữ nguyên kiện hàng, một món cũng không bán dưới giá niêm yết của phủ. Phần còn lại để ta. Chuyện này thắng bằng sổ, không thắng bằng tiếng cãi nhau giữa chợ.' },
    { who: 'hero', mode: 'write', text: '(viết) "Cần ta làm gì?"' },
    { who: 'u_nhan', text: 'Việc chân tay, và là việc quan trọng nhất: về phủ lấy cuốn sổ thuế ba năm của phủ thành mà cha ta giữ, rồi mời lão chủ sạp vải đầu chợ — người bán giá thật ở chợ này lâu nhất — tới làm chứng giá. Hồ sơ đủ ba thứ ấy, ta mới dựng được án.' },
    { who: 'u_nhan', text: 'Đi đi, Phàm ca. Ở đây cứ để muội. Mấy ông này quen ép người bằng tiếng nói to — tiếc là hôm nay người họ gặp lại là người quen nghe sổ hơn nghe tiếng.' },
    { who: 'narrate', text: 'Nàng đã làm việc từ trước khi ngươi tới, và nàng không hề chờ được cứu. Ngươi quay về phủ Hứa lấy sổ — vai của ngươi trong trận này là vai phụ, và là vai phụ có chủ đích.' }
  ];
  var SCENE_CH21_SO_SACH = [
    { who: 'narrate', text: 'Sân sau phủ Hứa. Ba cuốn sổ trải trên bàn đá: sổ thuế ba năm của phủ thành, bảng giá niêm yết năm nay, và sổ hàng của đoàn thương. U Nhàn chấm bút, đối chiếu từng trang — tay nàng nhanh và chắc như tay một người đã làm việc này mười năm.' },
    { who: 'u_nhan', text: 'Đây. Giá niêm yết của phủ cho tơ sống là mười hai lượng một cân. Ba nhà kia đang mua vào giá bảy lượng hai — dưới niêm yết bốn phần. Một nhà làm thế là gian thương. Ba nhà cùng làm một ngày, luật thành gọi bằng tên khác.' },
    { who: 'u_nhan', text: 'Sổ thuế ba năm còn rõ hơn: cứ năm nào đoàn này vào thành, giá mua của ba nhà ấy cũng tụt đúng một nhịp như hôm nay — rồi tháng sau lại nhích lên. Ép có mùa, có lệ, có hẹn nhau. Sổ thuế không biết nói dối giùm ai cả.' },
    { who: 'dan_thanh_a', text: 'Lão bán ở chợ này hai mươi sáu năm, giá thật thế nào lão thuộc như thuộc giá nhà mình. Cô nương cần lão ra phủ thành nói một câu, lão đi. Ép giá kiểu này, mai mốt tới lượt sạp của lão thôi.' },
    { who: 'u_nhan', text: 'Cảm ơn lão trượng. Một câu của người bán giá thật lâu năm, nặng hơn mười tờ đơn của Hứa gia — vì Hứa gia có phần trong đoàn này, lời của ta người ta còn ngờ được, lời của lão thì không.' },
    { who: 'hero', mode: 'write', text: '(Ngươi đặt lên bàn bản chép tay đối chiếu ba cuốn sổ mà ngươi vừa chép xong, trang nào khớp trang nào đều ghi rõ ở mép giấy.)' },
    { who: 'u_nhan', text: 'Khớp hết. Tốt — hồ sơ thế này đem ra phủ thành, người đuối lý không phải là ta. Phàm ca chép sổ nhanh hơn cả thư lại của phủ đấy.' },
    { who: 'u_nhan', text: 'Nhưng nghe muội dặn trước một câu, câu này quan trọng hơn cả hồ sơ: nếu chúng thua lý ở phủ thành, chúng sẽ đánh vào hàng thật. Đòn ấy chúng đã dùng với một đoàn khác ba năm trước — thua án, nhưng đoàn kia mất trắng hai xe hàng ngoài cổng.' },
    { who: 'u_nhan', text: 'Cho nên khi muội vào phủ thành đối chất, huynh đừng vào theo. Huynh ra cổng thành, đứng với đoàn hàng từ đầu buổi. Mặt trận của muội là sổ sách. Mặt trận của huynh là hai xe hàng ấy — mỗi người thắng phần của mình, Hứa gia mới thắng cả hai.' },
    { who: 'narrate', text: 'Nàng chia việc như một người tướng chia quân: rõ ràng, không thừa một lời, và tuyệt đối không để ngươi đứng vào phần việc của nàng. Ngươi gói hồ sơ, rồi đi về phía cổng thành.' }
  ];
  var SCENE_CH21_DOI_CHAT_PHU = [
    { who: 'narrate', text: '(Tiếng chuông nhỏ ngân lên — mặt trận bên kia.) Phủ thành. Quan phủ ngồi giữa, ba nhà buôn ngồi một bên, Hứa U Nhàn đứng một mình bên còn lại, trước mặt là ba cuốn sổ và bản đối chiếu. Nàng không mang theo một hộ vệ nào.' },
    { who: 'ep_gia', text: 'Bẩm quan, giá cả là việc của chợ, thuận mua vừa bán. Hứa gia đem sổ sách ra đây, chẳng qua là thua lỗ rồi muốn đổ tội cho người buôn bán lương thiện.' },
    { who: 'u_nhan', text: 'Lương thiện thì không sợ sổ. Trang mười hai, sổ thuế năm ngoái: ba nhà các ông mua tơ của đoàn này giá mười một lượng tám. Trang mười hai năm nay, cùng một ngày: bảy lượng hai. Quan phủ cứ hỏi các ông ấy xem, tơ năm nay kém hơn tơ năm ngoái ở chỗ nào mà mất bốn phần giá.' },
    { who: 'u_nhan', text: 'Và đây là lời chứng giá của người bán lâu năm nhất chợ này, có điểm chỉ. Ép giá đồng loạt để bóp chết một đoàn thương có bảo lãnh — điều thứ chín trong luật thành viết rõ lắm. Ta không xin quan xử nhẹ hay nặng. Ta chỉ xin quan đọc sổ.' },
    { who: 'narrate', text: 'Quan phủ không nói gì. Ông chỉ lật sổ — từ trang thuế năm nay ngược về ba năm trước, chậm rãi, trước mặt cả sảnh. Mỗi trang ông lật qua, sắc mặt của ba nhà buôn lại xám thêm một phần. Sổ sách, khi được đọc đúng cách, tự nó là một bản án.' },
    { who: 'ep_gia', text: 'Cô… cô nương Hứa, việc giá cả trong nhà buôn với nhau, có khi là hiểu lầm trong lúc truyền lời… để bọn ta về bàn lại với nhau, chưa chắc đã phải phiền tới luật thành…' },
    { who: 'narrate', text: 'Trong sảnh phủ, thế cờ đã nghiêng hẳn. Nhưng tin đuối lý chạy ra khỏi phủ thành nhanh hơn cả người đưa tin — và ở ngoài cổng thành, có những kẻ vừa nghe tin ấy vừa rút đao ra khỏi vỏ.' }
  ];
  var SCENE_CH21_PHU_CAT = [
    { who: 'narrate', text: '(Tiếng chuông nhỏ.) Phủ thành, cùng khắc ấy. Quan phủ đã cầm tới cuốn sổ thuế thứ hai. Ba nhà buôn không còn ai ngồi thẳng lưng được nữa.' },
    { who: 'u_nhan', text: 'Các ông còn một đường lui tử tế: rút lại giá ép trước khi quan đọc tới trang cuối, bồi thường ba ngày neo hàng cho đoàn, và từ nay giá mua của đoàn này theo đúng niêm yết. Ta không cần các ông mất mặt. Ta cần đoàn của ta đi tiếp được.' },
    { who: 'ep_gia', text: '…Bọn ta nghe theo cô nương. Giá ép rút lại hết, bồi thường theo lệ. Chỉ xin cô nương nói với quan một tiếng, đừng ghi án vào sổ thành…' },
    { who: 'narrate', text: 'Ở phủ, nàng đã thắng gần xong. Ngoài cổng thành, đợt phá đoàn thứ hai vừa ập tới — đợt này có kẻ tu vi Kim Đan dẫn đầu.' }
  ];
  var SCENE_CH21_KHOP_CUA = [
    { who: 'narrate', text: 'Xe hàng cuối cùng lăn qua cổng thành, kiện linh dược trên xe còn nguyên niêm phong, sáng nhẹ trong nắng chiều. Đúng khắc ấy, Hứa U Nhàn từ phủ thành đi ra, tay cầm tờ phán quyết đã đóng triện đỏ.' },
    { who: 'truong_doan', text: 'Cô nương! Hàng còn nguyên, người còn đủ — lão phu đi buôn ba mươi năm, hôm nay mới thấy một đoàn hàng được giữ bằng cả sổ sách lẫn kiếm như thế này.' },
    { who: 'truong_doan', text: 'Lão nói thật một câu: lúc đao kiếm rút ra ngoài cổng, lão tưởng chuyến này mất trắng rồi. Ai ngờ hàng về được tới kho, mà tờ phán quyết của phủ thành còn về trước cả hàng. Đoàn này từ nay chỉ nhận một nhà bảo lãnh — nhà họ Hứa.' },
    { who: 'hero', mode: 'write', text: '(viết) "Bên ta xong. Còn nàng?"' },
    { who: 'u_nhan', text: 'Thắng. Giá ép rút hết, bồi thường đủ, và quan phủ ghi vào biên bản: từ nay đoàn này vào thành, giá theo niêm yết, ai ép nữa là phạm luật thành chứ không còn là chuyện chợ. Chúng đánh vào hàng là đòn cuối cùng của kẻ đã biết mình thua lý.' },
    { who: 'u_nhan', text: 'Huynh giữ được hàng, muội giữ được án. Thiếu một trong hai, hôm nay Hứa gia đều mất — mất hàng thì mất của, mất án thì từ nay đoàn nào cũng bị ép như thế. May là mỗi người đều thắng đúng phần của mình.' },
    { who: 'narrate', text: 'Đoàn thương nhân cúi chào hai người rồi cho xe vào kho. Tin về buổi đối chất theo chân đoàn hàng lan ra khắp chợ trước cả bữa cơm chiều.' }
  ];
  var SCENE_CH21_DANH_GIA = [
    { who: 'narrate', text: 'Sân phủ Hứa, trước bữa tối. Hứa Chính Ngôn cho gọi cả nhà ra sân, và mời trưởng đoàn thương ở lại. Ông đứng giữa sân, nhìn con gái mình một lúc lâu — cái nhìn của một người cha vừa nhận ra con mình đã lớn tới mức nào.' },
    { who: 'chinh_ngon', text: 'Hôm nay, trước mặt người nhà và khách của Hứa gia, ta nói một lời cho rõ: từ nay, việc làm ăn của Hứa gia ở thành này, Hứa U Nhàn thay mặt ta mà quyết. Lời của nó ở chợ, ở phủ thành, là lời của Hứa gia.' },
    { who: 'chinh_ngon', text: 'Bao năm nay ta cứ nghĩ nhà này phải có người gánh thay ta khi ta già đi, mà mắt ta cứ nhìn đi đâu xa. Người gánh được, nó ở ngay trong nhà này, thắng án bằng sổ sách ngay giữa phủ thành cho cả thành nhìn thấy.' },
    { who: 'u_nhan', text: 'Cha… con chỉ làm phần việc con vẫn làm bấy lâu. Có điều từ nay, con làm với danh phận rõ ràng — thế thì càng phải cẩn thận hơn, không được để mất mặt nhà mình.' },
    { who: 'chinh_ngon', text: 'Ừ. Cứ cẩn thận như hôm nay là được. Thắng mà không dồn người ta tới đường cùng, chừa cho người ta một đường lui tử tế — ấy mới là cách làm ăn bền của nhà này.' },
    { who: 'chinh_ngon', text: 'Còn con, Phàm nhi. Ta cảm ơn con một điều hơi lạ: cảm ơn vì con đã không làm thay nó. Con thừa sức dẹp cả chợ ấy trong một buổi, nhưng nếu con làm thế, hôm nay nó vẫn chỉ là "con bé được người ta cứu". Con đứng đúng chỗ của con, nên nó mới đứng được vào chỗ của nó.' },
    { who: 'hero', mode: 'write', text: '(viết) "Việc của nàng, nàng tự thắng. Ta chỉ giữ phần của ta — như nàng đã chia từ đầu."' },
    { who: 'u_nhan', text: 'Nghe thấy chưa, cha? Người ngoài cứ bảo chàng câm là thiệt. Thật ra người biết mình nên đứng ở đâu và nên im lặng lúc nào, hiếm lắm.' },
    { who: 'narrate', text: 'Bữa tối hôm ấy, chỗ ngồi của U Nhàn ở bàn chính được dời lên một bậc. Không ai trong nhà nói gì về sự thay đổi ấy — mọi người chỉ lặng lẽ ngồi vào chỗ mới của mình, như thể nó vẫn luôn ở đó.' }
  ];
  /* ================= CUNG IV — CHƯƠNG 22: ĐỘT PHÁ TRƯỚC CHUYẾN ĐI =================
     Cài NGUYÊN VĂN từng dòng từ bản thảo khóa tools/work/arc-iv-prep/scripts/ch22.js
     (thiết kế: docs/arc-iv-detail/22.md; hợp đồng arciv-work/CONTRACT-wave3.md mục A.4).
     PHAN_CONG_CHOICE nằm giữa mảng SCENE_CH22_NHAN_VIEC — giữ nguyên vị trí như prep. */
  var PHAN_CONG_CHOICE = {
    who: 'choice', text: 'Bốn hướng của đoàn đều đã có người. Chỉ còn sườn trái — hướng mỏng nhất, kề vách đá — là chưa chốt người giữ. Ngươi phân công…',
    options: [
      { label: 'Đệ tử kỳ cựu giữ sườn trái, lớp trẻ ở giữa đoàn', action: 'phancong_ky_cuu' },
      { label: 'Hai đệ tử trẻ giữ sườn trái, kỳ cựu đoạn hậu', action: 'phancong_tre' },
      { label: 'Chia đều kỳ cựu và trẻ cho mọi hướng', action: 'phancong_deu' }
    ]
  };
  var SCENE_CH22_THAM_BAO = [
    { who: 'narrate', text: 'Đại điện Thanh Vân Tông. Thám báo của tông quỳ giữa điện, áo còn nguyên bụi đường và một vết rách dài ở tay áo. Trước mặt trưởng lão, hắn trải lên bàn một tấm trận đồ vẽ tay — nét bút run, nhưng từng mắt trận đều có ghi chú.' },
    { who: 'tham_bao', text: 'Bẩm trưởng lão, đệ tử theo tuyến hộ tống đi trước ba ngày, về tới nơi chỉ dám nói một câu: chúng không còn thử nữa. Quanh đoạn đường mòn giữa hai vách đá, Huyết Bạc Cung đã dựng xong một vòng trận loạn sóng hoàn chỉnh — mắt trận nối nhau thành vòng kín, không còn là mấy mắt đơn lẻ như dạo trước.' },
    { who: 'tham_bao', text: 'Đoàn hộ tống của tông đi việc ở thành, về là phải qua đúng đoạn đường ấy. Không có đường vòng — hai bên là vách và rừng già, xe và vật tư không qua được. Chúng chọn chỗ này là đã tính sẵn từ lâu.' },
    { who: 'tham_bao', text: 'Đệ tử đếm được mười hai mắt trận đã lộ mặt, chưa kể những mắt còn giấu trong vách đá. Mắt nào cũng có người của chúng canh theo ca — đây không phải trận dựng vội để hù dọa, đây là trận dựng để giữ lâu dài, chờ đúng đoàn của ta.' },
    { who: 'truong_lao_tong', text: 'Nói rõ ba điều ta cần nghe: trận này khác trận thử nghiệm ở chương trước thế nào?' },
    { who: 'tham_bao', text: 'Khác ở ba chỗ, đệ tử ghi cả vào trận đồ. Một: trận thử là để đo sức ta; trận này dựng để giết — mắt trận đặt dày ở hai đầu đoạn đường, khép vào là không còn lối ra. Hai: nó có người điều trận ngồi ở trung tâm, trận sống theo tay người ấy, không phải trận chết chạy theo khuôn.' },
    { who: 'tham_bao', text: 'Ba: trận đóng mở theo nhịp. Có những khắc vòng nhiễu mỏng đi rõ rệt — như người điều trận phải nghỉ tay, hoặc các mắt trận lệch nhịp nhau một thoáng. Cửa sổ ấy ngắn, nhưng có thật. Đệ tử nấp ngoài vành hai đêm mới dám chắc điều này.' },
    { who: 'tham_bao', text: 'Đệ tử xin nói thêm một câu ngoài trận đồ: trên đường rút về, đệ tử thấy người của chúng khiêng thêm mắt trận mới ra vành. Chúng vẫn đang gia cố. Trận này mỗi ngày một dày hơn — đoàn đi càng sớm, nó càng mỏng được một phần.' },
    { who: 'truong_lao_tong', text: 'Ngươi làm tốt. Lui xuống chữa thương đi. — Còn ngươi, Giang Phàm: lời nói là một chuyện, mắt thấy là chuyện khác. Ra vành tuyến, tự xác minh một mắt trận cho ta. Đừng vào sâu. Thấy đủ rồi thì về.' },
    { who: 'narrate', text: 'Ngươi xuống núi, đi dọc tuyến hộ tống tới vành đoạn đường giữa hai vách. Từ xa, tai ngươi đã nghe thấy nó trước cả mắt: một nhịp chu kỳ rất quen — cùng họ tiếng với kiếm trận cổ dưới Kiếm Trủng, chỉ khác là thứ này đang thức, và đang chờ.' },
    { who: 'narrate', text: 'Rồi bụi cây hai bên đường động đậy. Đội thám báo của Huyết Bạc Cung cũng đang ở vành trận này — và chúng đã thấy ngươi cùng lúc ngươi thấy chúng.' }
  ];
  var SCENE_CH22_VANH_TRAN = [
    { who: 'narrate', text: 'Mắt trận vành gãy nhịp rồi tắt hẳn dưới một đòn Định Âm khóa đúng chu kỳ của nó — hệt như cách ngươi từng đóng băng chu kỳ của Trận Nhãn dưới Kiếm Trủng, chỉ khác là lần này ở giữa rừng, và kẻ địch là người thật đang nhìn ngươi làm điều đó.' },
    { who: 'huyet_de', text: 'Ngươi… ngươi nghe được cả nhịp của mắt trận à? Tên nghe tiếng của bọn ta nói rồi — bảo sao tả sứ dặn không được để ngươi tới gần vành trận…' },
    { who: 'huyet_de', text: 'Rút! Mắt vành mất rồi, ở lại là chết vô ích! Về báo với người điều trận: con cá ấy nó phá mắt bằng cái tai của nó!' },
    { who: 'hero', mode: 'write', text: '(Ngươi nhặt mảnh trận đồ vành vừa rơi từ tay tên thám báo địch, gói lại cẩn thận. Trên mảnh giấy, nhịp đóng mở của vòng trận được ghi bằng những ký hiệu mà giờ ngươi đã nghe hiểu được một nửa.)' },
    { who: 'narrate', text: 'Đội thám báo địch rút vào rừng. Có một tên trong chúng, lúc giao đấu, né được nhịp đầu của Liên Hoàn của ngươi một cách khác thường — như thể hắn nghe được chiêu của ngươi trước khi nó tới. Ngươi ghi nhớ điều ấy, như ghi nhớ một hạt giống lạ trong đất quen.' },
    { who: 'narrate', text: 'Xác minh đã xong: thám báo nói thật từng chữ. Trận hoàn chỉnh, có người điều, có cửa sổ mỏng nhịp. Ngươi quay về tông với mảnh trận đồ vành trong tay áo.' }
  ];
  var SCENE_CH22_TICH_LUY = [
    { who: 'narrate', text: 'Những ngày cuối chặng, sơn môn bận rộn khác thường: vật tư được đóng kiện ở kho, xe được kiểm lại từng chiếc nan, và đệ tử nào cũng biết chuyến hộ tống sắp tới không phải chuyến đi thường. Ngươi thổ nạp ở điểm linh khí tông, làm nốt những việc tông còn dang dở, để tu vi đầy dần tới bờ giai đoạn Trung Kỳ.' },
    { who: 'truong_lao_tong', text: 'Chuyến đi này là chuyến lớn đầu tiên của tông từ khi ngươi Kết Đan. Người ta nhìn vào đoàn, là nhìn vào bộ mặt của Thanh Vân Tông. Làm cho trọn — nhưng nhớ: mạng người trong đoàn nặng hơn mặt mũi của tông. Gặp thế phải bỏ hàng cứu người, cứ bỏ, về ta chịu trách nhiệm lời ăn tiếng nói.' },
    { who: 'hero', mode: 'write', text: '(viết) "Đệ tử nhớ. Hàng mất còn làm lại được. Người mất thì không."' },
    { who: 'de_tu_a', text: 'Sư huynh, mấy đứa nhỏ bọn đệ lần đầu được đi hộ tống xa thế này, đứa nào cũng mong được phân vào hướng của huynh giữ. Ở gần huynh, nghe nói là… yên tâm lạ lắm, dù huynh chẳng nói câu nào.' },
    { who: 'narrate', text: 'Ngươi gật đầu với chúng, rồi quay lại điểm linh khí. Chu thiên chạy đều trong tiếng ồn ào xa dần của một sơn môn đang chuẩn bị cho chiến trận.' }
  ];
  var SCENE_CH22_NHAN_VIEC = [
    { who: 'narrate', text: 'Điểm rơi cổng tông. Đoàn hộ tống đã xếp hàng chờ sẵn: người và vật tư của tông đi việc lớn ở thành, xe nối xe, đệ tử đứng theo đội hình. Trưởng lão trao cho ngươi thẻ lệnh hộ tống ngay trước mặt cả đoàn.' },
    { who: 'truong_lao_tong', text: 'Đoàn này giao cho ngươi. Trên đường, lời của ngươi — bằng cách nào ngươi nói ra cũng được — là lệnh của đoàn. Giờ ngươi hãy phân công các hướng giữ đoàn, theo đúng mảnh trận đồ vành ngươi mang về: địch sẽ đánh vào đâu, ngươi là người biết rõ nhất trong chúng ta.' },
    { who: 'de_tu_ho_tong', text: 'Bẩm sư huynh, đội hình đoàn thế này: hướng trước có đội tiên phong, hướng sau có đội đoạn hậu, sườn phải kề rừng có hai đệ tử kỳ cựu. Chỉ còn sườn trái kề vách đá là mỏng nhất — đường hẹp, đứng được ít người. Xin sư huynh chốt người giữ hướng ấy.' },
    { who: 'de_tu_ho_tong', text: 'Sườn trái khó ở chỗ: chỗ đứng chỉ vừa hai người chen nhau, sau lưng là vách, trước mặt là bụi rậm — địch từ trong bụi đánh ra thì người giữ hướng ấy gần như không có đường lùi. Ai giữ hướng ấy là giữ ở chỗ thiệt nhất của đoàn.' },
    { who: 'hero', mode: 'write', text: '(viết) "Các hướng khác giữ nguyên. Riêng sườn trái — để ta quyết."' },
    { who: 'truong_lao_tong', text: 'Chốt đi, Giang Phàm. Đừng chọn theo cảm tình, cũng đừng chọn theo ý muốn làm đẹp lòng ai. Cứ theo trận đồ trong tay ngươi mà chọn — và nhớ lấy mình đã chọn gì, vì trên đường, chính ngươi là người phải sống cùng lựa chọn ấy.' },
    PHAN_CONG_CHOICE,
    { who: 'truong_lao_tong', text: 'Ngươi đã chốt thì cứ thế mà đi. Ta chỉ nói thêm một điều, không phải để ngươi đổi ý: không có cách phân công nào là không có giá. Quân có hạn, hướng nào dày lên thì hướng khác mỏng đi. Người làm tướng là người dám chịu cái giá của chính phân công của mình.' },
    { who: 'truong_lao_tong', text: 'Và nhớ lấy câu này cho chuyến đi: trong vùng trận loạn sóng, tai của ngươi sẽ là thứ vô dụng nhất trên đường — sóng loạn, khóa không tới, nghe gì cũng nhiễu. Nhưng cũng chính vì thế, nó có thể thành thứ quý nhất. Ngươi sẽ tự hiểu khi ở trong đó.' },
    { who: 'narrate', text: 'Phân công đã ghi vào sổ đoàn. Những người được giao giữ sườn trái đứng thẳng người hơn một chút khi nghe tên mình — họ chưa biết, và ngươi cũng chưa biết, cái giá của tờ phân công này sẽ hiện hình ở đâu.' }
  ];
  var SCENE_CH22_DOT_PHA = [
    { who: 'narrate', text: 'Đài tông, tảng sáng. Tu vi giai đoạn Trung Kỳ đã đầy. Lần đột phá này không có mây tụ, không có chuông tự ngân — chỉ có kim đan trong đan điền sáng lên một nấc, chu thiên chạy qua một vòng rộng hơn, và tai nghe của ngươi sâu thêm một lớp nữa: từ nay, giữa tiếng nhiễu loạn của vạn vật, ngươi bắt đầu phân được nhịp nào là nhịp thật, nhịp nào là nhịp giả do người ta dựng lên.' },
    { who: 'truong_lao_tong', text: 'Kim Đan Hậu Kỳ. Tốt. Giai đoạn trong đại cảnh giới thì không cần thiên kiếp, cũng chẳng cần ai tuyên cáo — đan của ngươi tự biết nó đã đi tới đâu. Ngươi thấy mình khác gì không?' },
    { who: 'hero', mode: 'write', text: '(viết) "Nghe rõ hơn. Giữa nhiều tiếng lẫn nhau, đệ tử bắt đầu tách được từng tiếng một."' },
    { who: 'de_tu_b', text: 'Chúc mừng sư huynh! Cả quảng trường nghe tin từ lúc chuông điểm canh — bọn đệ cược nhau xem huynh đột phá trước chuyến đi hay sau, ai cũng mong là trước. Giờ thì đoàn đi chuyến này, ai cũng yên tâm hơn một bậc.' },
    { who: 'truong_lao_tong', text: 'Đi chuẩn bị đi. Đoàn lên đường là vào việc lớn ngay — ngươi giờ là người mạnh nhất trong đoàn, và cũng là người mà kẻ điều trận bên kia muốn đo sức nhất. Đừng để hắn được như ý quá sớm.' },
    { who: 'narrate', text: 'Ngươi xuống đài. Dưới chân núi, đoàn hộ tống đã sẵn sàng — và ở rất xa phía trước, trên đoạn đường giữa hai vách đá, một vòng trận hoàn chỉnh đang vận hành theo nhịp, chờ đoàn đi vào.' }
  ];
  /* ================= CUNG IV — CHƯƠNG 23: VÒNG VÂY LOẠN SÓNG =================
     Cài NGUYÊN VĂN từng dòng từ bản thảo khóa tools/work/arc-iv-prep/scripts/ch23.js
     (thiết kế: docs/arc-iv-detail/23.md; hợp đồng arciv-work/CONTRACT-wave3.md mục A.4).
     LUA_CHON_CHOICE nằm ở cuối mảng SCENE_CH23_LUA_CHON, trước dòng narrate chốt — giữ nguyên vị trí như prep. */
  var LUA_CHON_CHOICE = {
    who: 'choice', text: 'Người bị thương cần được giữ mạng ngay. Từ mỏm đá ngoài vùng trận này, một đòn bậc Hưởng của ngươi sẽ khóa được sóng, giữ người và phá thế vây cho cả hướng đã sụp — nhưng đoàn hộ tống và cả đội địch, hàng trăm nhân chứng, sẽ thấy và nghe hết. Ngươi sẽ…',
    options: [
      { label: 'Phát đòn bậc Hưởng — cứu người, dù cả trăm người sẽ nghe thấy', action: 'ch23_phat_huong' },
      { label: 'Giữ bí mật — đánh tiếp bằng kiếm trong thế yếu', action: 'ch23_giu_bi_mat' }
    ]
  };
  var SCENE_CH23_HO_TONG = [
    { who: 'narrate', text: 'Đoàn hộ tống rời cổng tông lúc trời vừa sáng. Đội hình đi đúng tờ phân công ngươi đã chốt: tiên phong phía trước, đoạn hậu phía sau, sườn phải kề rừng, sườn trái kề vách — và ngươi đi giữa đoàn, nơi nhìn được cả bốn hướng. Đường mòn buổi sớm yên tĩnh, chim rừng kêu như mọi ngày.' },
    { who: 'de_tu_ho_tong', text: 'Sư huynh, đoàn đã vào đội hình. Tới trạm nghỉ giữa đường là nghỉ một khắc, kiểm lại xe và người rồi đi tiếp đoạn hai vách. Đệ đi đầu đoàn — có gì lạ, đệ báo trước tiên.' },
    { who: 'de_tu_a', text: 'Lần đầu đệ đi hộ tống xa thế này đấy, sư huynh. Ở nhà đệ còn một ruộng linh thảo mới gieo, em gái đệ bảo chờ đệ về gặt cùng. Về chuyến này, đệ tính xin sư phụ cho xuống núi thăm nhà một chuyến.' },
    { who: 'de_tu_b', text: 'Ngươi thì lúc nào cũng tính chuyện về nhà. Nhưng mà… ừ, đi chuyến này về, ta cũng muốn thăm nhà. Mẹ ta gửi thư lên núi ba lần rồi, thư nào cũng hỏi một câu: bao giờ con về ăn cơm.' },
    { who: 'de_tu_a', text: 'Thì về chứ sao. Đi chuyến này xong là về. Sư huynh đi giữa đoàn thế kia, ai mà làm gì được đoàn mình — đúng không, sư huynh?' },
    { who: 'hero', mode: 'write', text: '(viết) "Giữ đội hình. Thấy gì lạ, báo ngay — đừng tự xử lý một mình."' },
    { who: 'narrate', text: 'Đoàn tới trạm nghỉ giữa đường. Nước suối trong, nắng lên cao, mọi người uống nước, kiểm lại dây xe, cười nói như một chuyến đi thường. Yên bình tới mức chính sự yên bình ấy làm ngươi nghe kỹ hơn: ở rất xa phía trước, giữa tiếng chim và tiếng suối, có một khoảng lặng không thuộc về rừng.' },
    { who: 'de_tu_ho_tong', text: 'Đoàn đủ người, xe đủ hàng, ngựa còn khỏe. Nghỉ xong là đi đoạn cuối — qua hai vách đá là thấy đồng bằng, tới đó coi như thoát đoạn khó nhất. Lên đường thôi, sư huynh.' },
    { who: 'narrate', text: 'Đoàn rời trạm nghỉ, đi vào đoạn đường hẹp giữa hai vách đá. Bóng vách che mất nắng. Và khoảng lặng mà ngươi nghe thấy lúc nãy — nó đang khép lại quanh đoàn, từ cả hai đầu.' }
  ];
  var SCENE_CH23_VONG_VAY_MO = [
    { who: 'narrate', text: 'Mắt trận đầu tiên bật sáng trong vách đá bên trái. Rồi mắt thứ hai ở đầu đường phía trước. Rồi phía sau. Từng mắt một, theo một thứ tự lạnh lùng và chính xác, vòng trận loạn sóng hoàn chỉnh khép lại quanh đoàn hộ tống — đúng như tấm trận đồ thám báo đã vẽ.' },
    { who: 'huyet_de', text: 'Khép vòng rồi! Hai đầu đường đã khóa! Người điều trận có lệnh: không cần bắt sống ai hết — đoàn này, hôm nay không ai ra khỏi đoạn đường này!' },
    { who: 'mo_cuu_u', text: '(tiếng lệnh vọng qua trận, trầm và đều, không thấy người) Đừng vội. Cứ để chúng nếm vùng nhiễu trước. Kẻ cầm đoàn ấy — tai của hắn trong này chỉ là một cái tai điếc. Đánh từ hai đầu, dồn dần vào giữa.' },
    { who: 'narrate', text: 'Ngươi thử khóa sóng: Tĩnh Âm dâng lên rồi vỡ vụn giữa chừng — sóng trong vùng trận loạn tới mức không một tần số nào đứng yên đủ lâu để khóa. Cộng hưởng đã bị vô hiệu, đúng như trưởng lão dặn. Từ giờ, trong tay ngươi chỉ còn kiếm và công pháp.' },
    { who: 'hero', mode: 'write', text: '(Ngươi rút thẻ lệnh, viết vội mấy chữ giơ cao cho cả đoàn thấy: "Bỏ cộng hưởng. Kiếm và công pháp. Phá mắt trận ven đường trước — đừng để nhiễu phủ kín đoàn.")' },
    { who: 'de_tu_ho_tong', text: 'Rõ! Tất cả nghe lệnh sư huynh: giữ đội hình, tựa vào xe, không ai tự ý xông ra! Đợt đầu chúng đánh từ hai đầu — giữ cho đoàn không đứt đôi là thắng nửa trận rồi!' },
    { who: 'narrate', text: 'Đợt khép vòng ập tới từ cả hai đầu đoạn đường cùng một lúc. Các mắt trận ven đường vẫn đang bật thêm — phá được mắt nào, vùng nhiễu mỏng đi ở chỗ ấy một phần.' }
  ];
  var SCENE_CH23_DOI_TRAN = [
    { who: 'narrate', text: 'Đợt thứ hai không đánh đều nữa. Địch rút bớt ở hai đầu, dồn quân vào giữa đoàn — vào đúng hướng mỏng nhất. Đồng đội ở các hướng khác bị ghìm chặt tại chỗ, không ai sang cứu được ai: người điều trận đang dùng quân số để ép đoàn tự xé mình ra.' },
    { who: 'de_tu_a', text: 'Sư huynh! Hướng giữa chúng đông quá — chúng không đánh qua được xe đâu, nhưng chúng đang trèo qua xe! Đệ giữ được, đệ còn giữ được… một lúc nữa thôi!' },
    { who: 'narrate', text: 'Ngươi vận Quy Nhất. Trên nền nhiễu xám phủ kín đoạn đường, bảy điểm sao Bắc Đẩu hiện lên — sáng, rõ, và hoàn toàn không bị nhiễu: đồ sao dẫn kiếm đi theo linh khí của chính ngươi, thứ không đi qua tầng sóng mà trận này làm loạn. Cả đoạn đường, địch lẫn ta, đều ngẩng lên nhìn bảy điểm sao ấy một khắc.' },
    { who: 'mo_cuu_u', text: '(tiếng lệnh vọng qua trận, lần đầu mất đi vẻ đều đặn) Đợt ba — xả sóng kiếm theo nhịp đóng của trận. Đừng cho hắn đứng yên vận chiêu lần thứ hai. Dồn thêm người vào hướng mỏng nhất của chúng. Ngay bây giờ.' },
    { who: 'narrate', text: 'Từ trung tâm trận, những đợt kiếm xỉn bay tới theo nhịp đóng mở của vòng nhiễu — và đúng như thám báo đã nói: mỗi khi trận mở một cửa sổ, nhiễu quanh các mắt trận mỏng đi một thoáng. Ấy là lúc áp sát phá mắt.' },
    { who: 'hero', mode: 'write', text: '(Thẻ lệnh giơ lên giữa trận: "Cửa sổ mở — theo ta phá mắt. Ai ở hướng nào giữ nguyên hướng ấy.")' },
    { who: 'narrate', text: 'Ngươi thắng mọi đợt mình trực tiếp đối mặt. Nhưng trận này không đánh với một người — nó đánh với cả đoàn cùng một lúc. Và ở đầu kia của đoàn, nơi ngươi không có mặt, quân số áp đảo của địch vừa chạm tới giới hạn của hướng mỏng nhất.' }
  ];
  var SCENE_CH23_HUONG_SUP = [
    { who: 'narrate', text: 'Tiếng hét từ sườn trái vọng lại không giống tiếng hét trong trận nữa. Địch đã giấu một đội thứ ba trong bụi rậm kề vách — đội ấy không tham gia hai đợt đầu, chỉ chờ tới khi đoàn dồn hết sức vào giữa mới đánh thẳng vào sườn trái, hướng mỏng nhất của đoàn.' },
    { who: 'de_tu_ho_tong', text: 'Sư huynh! Sườn trái bị xuyên rồi! Người giữ hướng ấy ngã xuống rồi — còn thở, nhưng máu ra nhiều lắm! Đoàn co về mỏm đá ở rìa trận đi, ở đó còn giữ được một mặt!' },
    { who: 'narrate', text: 'Đoàn co cụm về mỏm đá nhô ra ở rìa vùng trận, kéo theo người bị thương. Ngươi là người cuối cùng rút về, kiếm chắn ngang lối hẹp. Sau lưng ngươi, vòng nhiễu của trận vẫn phủ kín đoạn đường — nhưng mỏm đá này nằm ngoài mép của nó một chút. Rất ít. Vừa đủ.' }
  ];
  var SCENE_CH23_HUONG_SUP_A = [
    { who: 'narrate', text: 'Người ngã xuống ở sườn trái là đệ tử kỳ cựu mà chính ngươi đã phân công giữ hướng ấy ở cổng tông. Anh ta đã đứng một mình ở chỗ hẹp nhất lâu hơn bất kỳ ai khác có thể đứng — khi được kéo về mỏm đá, tay anh ta vẫn còn nắm chặt kiếm, và câu đầu tiên anh ta thều thào được là: "Đoàn… còn đủ không?"' },
    { who: 'de_tu_b', text: 'Sư huynh kỳ cựu bị thương nặng nhất ở sườn trái — đòn ấy mà trúng đệ thì đệ không còn nằm đây thở được đâu. Anh ấy che cho cả đoạn xe phía sau. Sư huynh… phải cứu anh ấy.' }
  ];
  var SCENE_CH23_HUONG_SUP_B = [
    { who: 'narrate', text: 'Người ngã xuống ở sườn trái là một trong hai đệ tử trẻ mà chính ngươi đã phân công giữ hướng ấy ở cổng tông — cậu trai mới buổi sáng còn nói chuyện ruộng linh thảo và chuyến về thăm nhà. Cậu giữ được hướng ấy tới khi người bạn cùng giữ bị thương nhẹ phải rút vào trong, rồi đứng một mình thêm một quãng dài nữa mới ngã.' },
    { who: 'de_tu_b', text: 'Là nó đấy, sư huynh — sáng nay nó còn hỏi huynh "ai mà làm gì được đoàn mình". Nó còn thở, nhưng yếu lắm rồi. Đệ xin huynh… bằng cách nào cũng được, cứu nó.' }
  ];
  var SCENE_CH23_HUONG_SUP_C = [
    { who: 'narrate', text: 'Người ngã xuống ở sườn trái là đệ tử trẻ trong cặp mà ngươi đã chia đều cho hướng ấy. Khi đội giấu trong bụi ập ra, đệ tử kỳ cựu cùng giữ hướng đã kéo cậu ra sau lưng mình — nhưng quân số quá đông, một đòn xuyên qua cả hai lớp người: kỳ cựu bị thương ở vai, còn cậu trẻ hứng phần nặng nhất.' },
    { who: 'de_tu_b', text: 'Chia đều mà vẫn không đều được với quân số của chúng, sư huynh. Hai người giữ một hướng, chúng đánh bằng sáu người. Cậu ấy còn thở — nhưng cứ thế này thì không lâu nữa đâu.' }
  ];
  var SCENE_CH23_LUA_CHON = [
    { who: 'narrate', text: 'Mỏm đá. Người bị thương nằm giữa vòng người của đoàn, hơi thở thưa dần — ngự y đi theo đoàn lắc đầu: trong vùng nhiễu này, đan dược và chân khí đều chậm lại, giữ được tới khi phá vây thì may rủi. Sau lưng đoàn là vách đá. Trước mặt là vòng trận vẫn đang khép thêm từng mắt.' },
    { who: 'de_tu_ho_tong', text: 'Sư huynh, đệ nói thật tình hình: đánh bằng kiếm, ta phá được vây — đệ tin huynh. Nhưng phá xong vòng vây thì người này… đệ không dám nói chắc. Còn nếu huynh dùng thứ tiếng ấy — đệ từng nghe ở đài Kết Đan rồi — thì người này sống. Đệ chỉ không biết cái giá cho huynh là bao nhiêu.' },
    { who: 'de_tu_b', text: 'Sư huynh, cả đoàn này ai cũng biết huynh là người thế nào rồi, giấu hay không giấu… Nhưng thôi, đệ không nói thay huynh được. Mạng người nằm đây, và bí mật mười hai năm của huynh — huynh chọn đi, chọn xong bọn đệ theo tới cùng.' },
    { who: 'narrate', text: 'Từ mỏm đá này — điểm duy nhất ngoài vùng nhiễu mà ngươi đang đứng — sóng của ngươi sẽ đi thẳng, không bị loạn, tới đúng mảng vách đang nứt phía trên người bị thương và tới mắt trận cuối đang ép hướng đã sụp. Một đòn bậc Hưởng ở đây cứu được người. Và cũng ở đây, số người chứng kiến sẽ đông hơn mọi lần ngươi từng cất tiếng cộng lại.' },
    { who: 'de_tu_ho_tong', text: 'Đệ cho người dọn trống quanh người bị thương rồi, sư huynh. Huynh quyết thế nào, đoàn cũng đã sẵn sàng: hoặc là cùng nghe một tiếng mà cả đời này không quên được, hoặc là cùng xông ra theo kiếm của huynh một lần nữa.' },
    { who: 'narrate', text: 'Ngươi nghe, bằng cái tai đã nghe suốt mười hai năm sóng gió của đời mình: nhịp thở của người bị thương đang mỏng đi từng nhịp một — và ngoài kia, nhịp của vòng trận vẫn đều đặn, lạnh lùng, không hề vội. Thời gian để cân nhắc, tự nó đang cạn.' },
    LUA_CHON_CHOICE,
    { who: 'narrate', text: 'Ngươi nhìn người đang nằm thở thưa dần giữa vòng người, rồi nhìn ra vòng trận đang khép. Mười hai năm im lặng — và một mạng người. Lựa chọn này, không ai làm thay ngươi được.' }
  ];
  var SCENE_CH23_KHEP = [
    { who: 'narrate', text: 'Quyết định đã định. Đoàn nín thở quanh mỏm đá — người thì nhìn ngươi, người thì nhìn ra vòng trận. Trận vây vẫn chưa vỡ, người bị thương vẫn đang chờ, và khắc tiếp theo thuộc về chương cuối của cung này.' },
    { who: 'narrate', text: 'Ở đâu đó giữa trung tâm vòng trận, người điều trận cũng đang chờ. Hắn chưa biết ngươi sắp làm gì. Thật ra — đến lúc này, chính ngươi cũng chỉ vừa mới biết.' }
  ];
  /* ================= CUNG IV — CHƯƠNG 24: MANH MỐI CỨNG ĐẦU TIÊN =================
     Cài NGUYÊN VĂN từng dòng từ bản thảo khóa tools/work/arc-iv-prep/scripts/ch24.js
     (thiết kế: docs/arc-iv-detail/24.md; hợp đồng arciv-work/CONTRACT-wave3.md mục A.4).
     SCENE_CH24_PHAT_HUONG chứa dòng mode:'say' DUY NHẤT của toàn cung IV. */
  var SCENE_CH24_PHAT_HUONG = [
    { who: 'narrate', text: 'Ngươi rời vị trí an toàn của đoàn. Một mình, ngươi đi dọc mép vùng nhiễu tới điểm ngoài trận ở hướng đã sụp — nơi mảng vách đá bị trận làm nứt đang treo ngay phía trên người giữ hướng bị thương. Mỗi bước chân của ngươi, cả đoàn lẫn đội địch đều nhìn theo. Không ai hiểu ngươi định làm gì. Trừ một người ở rất xa, giữa trung tâm trận, vừa đứng thẳng dậy.' },
    { who: 'de_tu_ho_tong', text: 'Sư huynh đi đâu vậy?! Hướng ấy còn một mắt trận đang ép, vách đá trên đầu người bị thương nứt toác ra rồi — đá mà đổ xuống thì không đan dược nào kịp nữa đâu!' },
    { who: 'narrate', text: 'Mảng vách kêu răng rắc. Người bị thương nằm bất động trong vùng đổ, hơi thở chỉ còn là một sợi chỉ. Ngươi đứng vào đúng điểm sóng ngoài trận khóa được, hít một hơi — và cả mười hai năm im lặng của ngươi dồn về một khoảnh khắc. Lần này, ngươi không viết. Ngươi nói.' },
    /* ★ CÂU CẤT LỜI DUY NHẤT CỦA CUNG IV — Sổ Dư Âm ctx ch24_lenh_cuu_nguoi ★ */
    { who: 'hero', mode: 'say', text: 'KÉO NGƯỜI RA!' },
    { who: 'narrate', text: 'Tiếng nói ấy không lớn. Nhưng nó đi cùng sóng đứng của Định Âm: mảng vách đang đổ khựng lại giữa đà rơi như bị một bàn tay vô hình giữ chặt, bụi đá treo lơ lửng giữa trời — và cùng một động tác giữ ấy, nhịp thở của người trọng thương được sóng đứng nâng đỡ, đều trở lại, không tắt. Định Âm giữ đá. Định Âm giữ người. Cả chiến trường im đi một nhịp dài.' },
    { who: 'huyet_de', text: 'Tiếng… tiếng gì vậy? Vách đá đứng yên giữa trời kìa! Hắn giữ được cả đá lẫn người cùng một lúc — người điều trận ơi, trận của ta… trận của ta không nhiễu được tiếng ấy!' },
    { who: 'narrate', text: 'Đoàn chớp lấy khoảnh khắc: người bị thương được kéo ra khỏi vùng đổ đúng lúc mảng vách rơi xuống khoảng đất trống, ầm một tiếng như núi lở. Đợt địch cuối cố lao vào phá thế cứu người giữa các nhịp giữ — và kiếm của ngươi xử lý từng đợt áp sát ở những khoảng nghỉ, không rời vị trí một bước.' },
    { who: 'narrate', text: 'Khi người bị thương đã an toàn, ngươi quay lại mắt trận cuối cùng của vòng vây. Phong Âm: một ấn vàng lớn khép xuống miệng vỡ của trận — vòng nhiễu của cả đoạn đường tan theo từng mảng từ điểm phong ấn lan ra ngoài, như băng vỡ trên mặt sông đầu xuân. Tiếng nhiễu mười hai mắt trận tắt dần. Đoạn đường yên tĩnh trở lại.' },
    { who: 'narrate', text: 'Ở trung tâm trận — nơi vừa tan đi mắt trận cuối — có một bóng người áo xám đứng lặng giữa khói bụi, nhìn về phía ngươi rất lâu. Người điều trận đã thấy và nghe tất cả. Hắn không ra lệnh thêm một lời nào nữa. Hắn chỉ đứng đó, như một người vừa nghe được thứ mình đã tìm suốt mười hai năm.' },
    { who: 'de_tu_ho_tong', text: 'Sống rồi! Người giữ hướng sống rồi — thở đều rồi! Sư huynh… cả đoàn vừa nghe thấy huynh nói. Một câu thôi. Mà đệ thề, cả đời này đệ không quên được tiếng ấy đứng ở đâu, lúc nào.' },
    { who: 'narrate', text: 'Hàng trăm con người — đoàn hộ tống của tông, và cả tàn quân của Huyết Bạc Cung đang rút chạy — đều đã nghe. Tin về một câu nói ở đoạn đường giữa hai vách đá này sẽ đi nhanh hơn bất kỳ đoàn người nào. Sổ Dư Âm của ngươi vừa ghi thêm trang nặng nhất từ trước tới nay.' }
  ];
  var SCENE_CH24_GIU_BI_MAT = [
    { who: 'narrate', text: 'Ngươi không rời mỏm đá. Bí mật mười hai năm ở lại trong ngực ngươi, nguyên vẹn — và cái giá của nó được trả ngay bằng máu: muốn ra khỏi vòng vây này, đoàn chỉ còn một cách là đánh xuyên ra bằng kiếm, trong thế yếu, qua đúng hướng quân địch đông nhất.' },
    { who: 'de_tu_ho_tong', text: 'Rõ lệnh sư huynh! Nhóm còn khỏe nhất theo huynh đánh xuyên ra trước, nhóm sau cõng người bị thương theo sau! Ai còn cầm được kiếm thì cầm — đoạn đường này, hôm nay ta tự mở bằng tay mình!' },
    { who: 'narrate', text: 'Đợt xuyên phá đầu tiên mở được nửa đoạn đường. Người bị thương được cõng đi giữa đội hình — mỗi bước xóc là một lần hơi thở của cậu yếu đi trông thấy. Trong vùng nhiễu, không có gì giữ cậu lại ngoài bàn tay của đồng đội và ý chí của chính cậu.' },
    { who: 'de_tu_ho_tong', text: 'Đợt hai chúng tăng cường thêm người ở đầu ra! Sư huynh, đoàn không dừng lại được — dừng là bị khép vòng lần nữa. Cứ tiến, đệ lo phía sau cho!' },
    { who: 'narrate', text: 'Đoàn tiến như một mũi kiếm duy nhất: người khỏe che người yếu, người cõng thương binh đi giữa, kiếm của ngươi mở đường ở mũi nhọn. Mắt trận hai bên đường vẫn xả nhiễu xuống — nhưng một đoàn đã quyết không dừng lại thì nhiễu loạn chỉ còn là tiếng ồn.' },
    { who: 'huyet_de', text: 'Tên cầm trận của chúng xuống sân rồi kìa! Hắn nói: kẻ cầm đoàn của tông không dám dùng tiếng thật của mình, thì để hắn dạy cho cả đoàn biết thế nào là trận loạn sóng!' },
    { who: 'narrate', text: 'Tên cầm trận xuống sân với bộ kiếm xỉn theo họ loạn sóng và một chiêu quạt kiếm trận thu nhỏ. Đợt cuối cùng của trận vây dồn cả vào một điểm — và ngươi dồn cả mười hai năm luyện kiếm của mình vào một đòn: Quy Nhất. Bảy điểm sao hiện trên nền nhiễu, kiếm lớn nhất của Thất Tinh chém tan thế trận cuối cùng như chém qua một tấm màn ướt.' },
    { who: 'de_tu_b', text: 'Vỡ rồi! Đường mở rồi! Đưa người bị thương ra trước — nhanh lên, cậu ấy lạnh tay rồi! Sư huynh, ra được rồi… nhưng cậu ấy nặng hơn lúc ở mỏm đá nhiều lắm.' },
    { who: 'narrate', text: 'Đoàn thoát ra khỏi đoạn đường giữa hai vách. Người giữ hướng còn sống — nhưng thương nặng hơn hẳn, hồi phục sẽ chậm, và dấu vết của ngày hôm nay sẽ đi theo cậu một quãng dài. Không một nhân chứng nào nghe thấy gì ngoài tiếng kiếm. Bí mật giữ được. Cái giá là máu — đúng như bản chất của lựa chọn này từ đầu.' }
  ];
  var SCENE_CH24_THA_MANG = [
    { who: 'narrate', text: 'Mép đoạn đường, dưới gốc cây bị kiếm khí chém cụt nửa tán. Mạc Cửu U nằm tựa vào thân cây, áo xám đẫm máu — người điều trận của vòng vây, kẻ mà tàn quân của chính hắn đã bỏ lại khi rút qua đường rừng. Trận đã tan. Tiếng chim rừng quay lại như chưa từng có gì xảy ra.' },
    { who: 'mo_cuu_u', text: 'Tới rồi à. Ta nghe tiếng chân ngươi từ lúc ngươi còn cách mười bước — nghề của ta là nghe, ngươi quên sao. Đứng xa thế làm gì. Kiếm của ngươi hôm nay phá được cả trận của ta, chẳng lẽ lại ngại một kẻ sắp chết.' },
    { who: 'mo_cuu_u', text: 'Làm đi cho gọn. Cung chủ thua một trận, mất một tả sứ — sổ sách của bà ấy tự khắc cân bằng được. Ta chỉ xin một điều: đừng có thương hại. Ta ghét nhất là chết dưới tay một kẻ đang thương hại mình.' },
    { who: 'narrate', text: 'Ngươi bước tới. Ngươi rút — không phải kiếm. Ngươi rút băng vải và thuốc trị thương trong túi đoàn, quỳ xuống, băng lại vết thương đang rỉ máu ở sườn hắn, cầm máu bằng đúng áp lực cần thiết. Rồi ngươi đặt xuống cạnh tay hắn một bình đan dược của tông, đứng dậy, và quay lưng đi. Không một lời. Không một chữ viết.' },
    { who: 'mo_cuu_u', text: '…Ngươi làm cái gì thế này. Ta dựng trận giết cả đoàn của ngươi. Ta là kẻ ở bến đò năm ấy cười nhìn nhà ngươi tan nát — ngươi biết rõ điều đó từ chương trước cơ mà. Băng bó cho ta? Để đan lại cho ta? Ngươi điên rồi à, Giang Phàm?' },
    { who: 'mo_cuu_u', text: 'Hay là… ngươi cũng giống phụ thân ngươi. Năm ấy ở bến đò, ông ta cũng từng làm một việc ngu ngốc y hệt thế này, với một người còn không đáng được làm thế hơn ta. Ta tưởng mười hai năm thù hận phải mài ngươi thành thứ khác rồi chứ.' },
    { who: 'narrate', text: 'Ngươi không quay lại. Tiếng của hắn đuổi theo lưng ngươi thêm mấy bước đường — lần đầu tiên kể từ khi ngươi biết hắn, trong giọng nói khói trà trầm lạnh ấy có một thứ không còn lạnh nữa. Hắn gọi với theo, gấp gáp như sợ ngươi đi khuất khỏi tầm tiếng.' },
    { who: 'mo_cuu_u', text: 'Đứng lại! Giang Phàm — đứng lại. Ngươi muốn biết về bến đò, đúng không? Mười hai năm nay ngươi tu, ngươi luyện, ngươi im lặng — một nửa là vì đêm ấy. Vậy thì nghe đây. Ta trả ngươi một thứ, không phải vì ta tốt. Vì kẻ bị bỏ lại thì không còn nợ cung của mình nữa.' }
  ];
  var SCENE_CH24_MANH_MOI = [
    { who: 'mo_cuu_u', text: 'Đêm ấy ở bến đò ngang trên sông Bạc, đoàn của phụ thân ngươi không đi lặng lẽ như sổ sách của Cô Châu Thành ghi đâu. Đi theo đoàn có một người của quan phủ đi kèm — một người ghi chép chính thức, nhiệm vụ của hắn là ghi lại từng việc xảy ra trên chuyến đi ấy, từng giờ, từng người, từng câu nói.' },
    /* [ĐỀ XUẤT] Tên người ghi chép chính thức của vụ bến đò: THẨM MẶC SINH — tên mới do đội soạn cảnh đặt, chờ Bui duyệt. */
    { who: 'mo_cuu_u', text: 'Tên hắn là Thẩm Mặc Sinh. Ghi nhớ lấy — mười hai năm nay cái tên ấy không xuất hiện trong bất kỳ cuốn sổ nào ngươi có thể chạm tới, vì người ta đã gạch hắn khỏi mọi sổ sách của thành này còn kỹ hơn gạch tên phụ thân ngươi.' },
    { who: 'mo_cuu_u', text: 'Và nghe cho rõ câu này, vì ta chỉ nói một lần: cuốn hồ sơ gốc mà Thẩm Mặc Sinh ghi đêm ấy không bị hủy. Nó không cháy, không chìm xuống sông Bạc. Nó nằm trong tay Thiên Cơ Các — nằm trong kho hồ sơ mà các ngươi có đi qua cửa của chúng cả trăm lần cũng không thấy được.' },
    { who: 'mo_cuu_u', text: 'Ta không biết hắn còn sống hay đã chết, cũng không biết hồ sơ ấy bị khóa ở tầng nào của các. Ta chỉ biết có thế — và biết rằng cung chủ của ta giữ kín điều này còn kỹ hơn cả tung tích của ngươi. Giờ thì đi đi. Món nợ tha mạng này… ta chưa biết sẽ trả ngươi thế nào. Nhưng ta không quên nợ bao giờ.' },
    { who: 'narrate', text: 'Hắn không nói thêm nữa. Mười hai năm, vô số manh mối mềm — một ngọc bội, một cái tên bị quên, những lời nửa chừng — và hôm nay, lần đầu tiên: một cái tên cụ thể, một cuốn hồ sơ cụ thể, một nơi cất giữ cụ thể. Tuyến phụ thân của ngươi vừa chuyển từ hạt giống sang một đường truy vết có đích.' },
    { who: 'hero', mode: 'write', text: '(viết) "Đưa hắn về trạm nghỉ. Chữa cho hắn tử tế. Món nợ này — để ta tự tính sau."' },
    { who: 'de_tu_ho_tong', text: 'Sư huynh… đưa cả tả sứ của chúng về trạm của ta ạ? …Vâng. Đệ hiểu rồi. Huynh đã quyết thì đoàn làm theo. Hai người, khiêng cáng — nhẹ tay thôi, người ta còn là người bệnh của đoàn này từ giờ.' },
    { who: 'narrate', text: 'Đoàn lên đường về tông, thêm một chiếc cáng không ai ngờ tới. Trên cáng, kẻ điều trận của địch nhắm mắt — không rõ là ngủ, là mê, hay là lần đầu tiên sau mười hai năm, không phải nghe ngóng bất cứ điều gì.' }
  ];
  var SCENE_CH24_LEN_DUONG = [
    { who: 'narrate', text: 'Đại điện Thanh Vân Tông. Ngươi trình lại toàn bộ vụ việc: trận loạn sóng hoàn chỉnh, người điều trận bị bỏ lại, đoàn an toàn về tới nơi, và cái tên vừa nghe được ở mép đoạn đường. Trưởng lão nghe hết, không ngắt lời một lần nào.' },
    { who: 'truong_lao_tong', text: 'Trận hoàn chỉnh có người điều, dựng để giết đoàn của tông ta giữa đường — đây không còn là chuyện thử sức nữa. Tông sẽ ghi việc này vào sổ đối ngoại với Huyết Bạc Cung, từng chữ. Còn người ngươi tha… tha đúng. Một kẻ bị chính chủ của mình bỏ lại, đôi khi nói thật hơn mọi thám báo.' },
    { who: 'truong_lao_tong', text: 'Hành trình sông Bạc của ngươi, ta chuẩn y. Nhưng đi có chuẩn bị: hồ sơ nằm trong tay Thiên Cơ Các thì chuyến đi ấy không chỉ là đường sông. Ngươi xuống thành từ biệt người nhà họ Hứa đi — chuyến này đi, không hẹn ngày về sớm đâu.' },
    { who: 'hero', mode: 'write', text: '(viết) "Đệ tử đi sông Bạc. Cái tên nghe được hôm nay, đệ tử sẽ lần tới tận cùng — hồ sơ ở đâu, đệ tử tới đó."' },
    { who: 'narrate', text: 'Cùng lúc ấy, ở Cô Châu Thành — tin từ đoạn đường giữa hai vách đá đã về tới chợ trước cả đoàn người. Tin đi nhanh hơn người, và như mọi tin đồn, nó lớn lên một chút sau mỗi miệng người kể lại.' },
    { who: 'dan_thanh_a', text: 'Lão nghe người trong đoàn nói tận tai: giữa trận, cái cậu câm của tông ấy mở miệng nói đúng một câu — thế là vách đá đứng yên giữa trời, người trọng thương đang thoi thóp tự nhiên thở đều trở lại! Lão bán ở chợ này ba chục năm, chuyện lạ nghe nhiều, mà chuyện này…' },
    { who: 'dan_thanh_b', text: 'Thôi đi ông, đá nào đứng yên giữa trời được. Nhưng mà người sống thì đúng là sống thật — cả đoàn về đủ người, cái ấy thì không đồn sai được. Còn tiếng nói hay tiếng gió, ai ở đó mới biết. Có điều từ nay, chắc không còn ai dám gọi cậu ấy là "câm" nữa đâu.' },
    { who: 'narrate', text: 'Ở thành, người ta bắt đầu kể về "một câu nói giữ được cả đá lẫn người". Ở tông, sổ sách ghi lại một trận vây và một cái tên. Còn ngươi — ngươi còn một việc cuối cùng ở thành này trước khi lên đường.' }
  ];
  var SCENE_CH24_TU_BIET = [
    { who: 'narrate', text: 'Sân phủ Hứa, chiều muộn. Hứa U Nhàn tiếp ngươi ở chiếc bàn đá nơi nàng vẫn đối chiếu sổ sách — nhưng lần này, con dấu việc nhà của Hứa gia đặt ngay ngắn trên bàn, bên cạnh sổ của nàng. Người thay mặt nhà tiễn khách của nhà: một cảnh tượng mà vài năm trước, không ai trong phủ này tưởng tượng nổi.' },
    { who: 'u_nhan', text: 'Muội nghe tin về chuyến sông Bạc rồi. Lần này huynh đi, không phải đi làm việc cho ai, cũng không phải trốn ai — huynh đi tìm sự thật của chính nhà mình. Tới lượt muội ở lại giữ nhà, như huynh từng giữ cho muội cái sân này bao nhiêu năm.' },
    { who: 'hero', mode: 'write', text: '(viết) "Nhà này giờ có nàng thay mặt. Ta đi, lòng yên hơn mọi chuyến trước."' },
    { who: 'u_nhan', text: 'Yên thì cứ yên, nhưng đừng yên quá mà quên đường về. Việc ở thành này muội gánh được — đoàn thương, sổ sách, cả mấy nhà buôn gian kia nữa, muội xử lý được hết. Phần của huynh là đi cho tới nơi, rồi về kể muội nghe bằng… cách nào của huynh cũng được.' },
    { who: 'hero', mode: 'write', text: '(viết) "Khi hồ sơ ấy mở ra, người đầu tiên ta muốn cho biết — là nàng."' },
    { who: 'u_nhan', text: 'Vậy thì hẹn thế. Đi đi, Phàm ca. Sông Bạc mười hai năm trước lấy của huynh nhiều thứ lắm. Lần này đi, lấy lại cho đủ — muội ở đây chờ tin, không chờ ai thay huynh về đâu.' },
    { who: 'narrate', text: 'Hai người đứng dậy. Không ai nói thêm lời nào thừa. Nàng tiễn ngươi tới cổng phủ — cổng của một nhà mà giờ nàng là người thay mặt, tiễn một người đi tìm quá khứ của chính nhà mình. Thế ngang hàng mới của hai người, đứng vững trong im lặng chiều hôm ấy.' }
  ];
  var SCENE_CH24_DONE = [
    { who: 'narrate', text: 'Cung IV khép lại ở đây: ngươi đứng ở Kim Đan Hậu Kỳ, tu vi giai đoạn 450 trên 1.200 — con đường tới Viên Mãn còn dài, và từ nay nó đi qua những vùng đất mà mười hai năm trước phụ thân ngươi đã đi qua.' },
    { who: 'hero', mode: 'write', text: '(viết, tự ghi vào trang cuối của sổ tay) "Sông Bạc. Một người ghi chép. Một cuốn hồ sơ chưa từng bị hủy. Mười hai năm — đủ lâu rồi."' },
    { who: 'narrate', text: 'Ở Thanh Vân Tông, đoàn hộ tống đã về, người bị thương đang hồi phục, và việc cày cuốc của dải Kim Đan mở ra trước mặt: đài thách đấu hạng vô địch, tầng sâu Kiếm Trủng, những mắt trận vỡ còn lại trên tuyến hộ tống. Ở Cô Châu Thành, một tin đồn về một câu nói vẫn đang lớn lên từng ngày.' },
    { who: 'narrate', text: 'Còn ở một nơi rất xa, trong kho hồ sơ của Thiên Cơ Các, một cuốn sổ cũ nằm yên trong bóng tối — chưa biết rằng sau mười hai năm, cuối cùng đã có người lên đường đi tìm nó.' }
  ];
  /* SCENE_CH24_LEN_DUONG_TIN_B — cảnh sản xuất đợt 3,
     KHÔNG thuộc kịch bản khóa prep (hợp đồng đợt 3 mục A.4a):
     2 dòng thay thế cho đoạn tin lan ở SCENE_CH24_LEN_DUONG khi người
     chơi đi đường giữ bí mật — tin chỉ kể trận phá vây bằng kiếm và
     Quy Nhất chém tan thế trận cuối (đã khóa ở SCENE_CH24_GIU_BI_MAT),
     không thêm tình tiết cốt truyện nào khác. */
  var SCENE_CH24_LEN_DUONG_TIN_B = [
    { who: 'dan_thanh_a', text: 'Lão nghe người trong đoàn kể lại tận tai: đoàn bị vây kín giữa hai vách đá, thế mà đánh xuyên ra được bằng kiếm hẳn hoi — đòn cuối là một chiêu kiếm lớn, bảy điểm sáng như sao hiện trên nền trời, chém tan cả thế trận cuối cùng của chúng nó! Không có phép màu nào đâu, toàn là kiếm thật người thật đấy.' },
    { who: 'dan_thanh_b', text: 'Ừ, lão cũng hỏi kỹ rồi: không một ai nghe thấy một tiếng nói nào lạ cả. Chỉ có người sống trở về là thật — cả đoàn về đủ, người bị thương nặng nhất cũng còn thở. Kiếm mà giữ được người như thế, thì cần gì tới tiếng nói.' }
  ];
  /* SCENE_KY_NGO_BON_LOI — cảnh sản xuất đợt 3,
     KHÔNG thuộc kịch bản khóa prep (hợp đồng đợt 3 mục A.4b):
     cảnh kỳ ngộ của ô 23 Bôn Lôi Thiểm Kích theo khung bản đồ tích hợp
     mục 5.3 — giông bất chợt ở đường mòn, sét đánh cây cổ thụ, trang
     tàn quyển trong hốc cháy còn ấm điện quang, đệ tử đồng hành chứng
     kiến. Cả hai lựa chọn ở cuối cảnh đều dẫn tới học bộ (xử lý ở mục B). */
  var SCENE_KY_NGO_BON_LOI = [
    { who: 'narrate', text: 'Đường mòn đang nắng chang chang thì mây đen kéo tới không một dấu báo trước. Gió quật nghiêng cả hàng cây, mưa chưa kịp rơi mà tóc gáy đã dựng lên — trong không khí có một thứ mùi khét rất nhẹ, như mùi của một nhịp điện đang chờ được gõ xuống.' },
    { who: 'de_tu_ho_tong', text: 'Sư huynh, giông này lạ lắm — mây chỉ tụ đúng trên đầu đoạn đường này thôi. Ta nép vào phía vách đá đi, kẻo…' },
    { who: 'narrate', text: 'Một tiếng nổ xé trời. Tia sét đánh thẳng xuống cây cổ thụ ven đường, ngay trước mặt hai người — thân cây tách ra một hốc đen ngòm, khói bốc lên cuồn cuộn, mà ngọn lửa bén vào vỏ khô lại tắt ngấm ngay trong cơn gió, chỉ để lại những đường điện quang mỏng chạy ngoằn ngoèo quanh miệng hốc như chưa tan hết.' },
    { who: 'narrate', text: 'Trong hốc cây cháy, có một vật gì đó không cháy. Một trang tàn quyển — giấy đã vàng, mép đã sém — nằm ép vào thớ gỗ còn ấm, và từng chữ trên trang giấy đang sáng lên theo đúng nhịp điện quang còn sót lại, như thể chính tia sét vừa rồi đã viết chúng ở đó từ rất lâu, chỉ chờ một người tới đọc.' },
    { who: 'de_tu_ho_tong', text: 'Sư huynh… huynh thấy không? Chữ trên trang ấy — nó chạy theo hình tia sét. Đệ đi đường mòn này bao nhiêu năm, chưa từng nghe ai kể chuyện sét đánh mà để lại sách trong cây bao giờ…' },
    { who: 'hero', mode: 'write', text: '(viết) "Lùi lại hai bước. Điện quang chưa tan hết — đừng chạm tay vào vội."' },
    { who: 'narrate', text: 'Ngươi nghe trang tàn quyển trước khi chạm vào nó: nhịp điện còn ấm trong từng nét chữ gõ rất khẽ, đều, và quen — cùng một họ nhịp với thứ ngươi từng nghe trong chu kỳ của những vật cổ xưa. Đây không phải sách của người thường để lại. Đây là một đòn lôi đang ngủ trong một trang giấy.' },
    { who: 'choice', text: 'Trang tàn quyển trong hốc cây cháy vẫn còn ấm điện quang. Ngươi…', options: [ { label: 'Nhận trang tàn quyển, ghi nhớ nhịp sét vào lòng', action: 'kyngo_bon_loi_nhan' }, { label: 'Đọc kỹ tại chỗ cho tới khi điện quang tắt hẳn', action: 'kyngo_bon_loi_doc' } ] }
  ];
  var STORY = {
    IDLE_BEFORE: IDLE_BEFORE, IDLE_AFTER: IDLE_AFTER,
    SCENE_TEST: SCENE_TEST, SCENE_WRITE_BRANCH: SCENE_WRITE_BRANCH,
    SCENE_VOICE: SCENE_VOICE, SCENE_VOICE_RETRY: SCENE_VOICE_RETRY,
    SCENE_BREAKTHROUGH: SCENE_BREAKTHROUGH, SCENE_DUMMY_DONE: SCENE_DUMMY_DONE,
    SCENE_DEPART: SCENE_DEPART, SCENE_TRACK: SCENE_TRACK, SCENE_TRACK_HIDDEN: SCENE_TRACK_HIDDEN,
    SCENE_AMBUSH: SCENE_AMBUSH, SCENE_AMBUSH_SILENT: SCENE_AMBUSH_SILENT,
    SCENE_AMBUSH_CHAN: SCENE_AMBUSH_CHAN, SCENE_GATE: SCENE_GATE,
    SCENE_QUEUE: SCENE_QUEUE, SCENE_MEASURE: SCENE_MEASURE,
    SCENE_TOWER_FORCED: SCENE_TOWER_FORCED, SCENE_MANUALS: SCENE_MANUALS,
    SCENE_INN: SCENE_INN, SCENE_PHARMACY: SCENE_PHARMACY, SCENE_FASHOP: SCENE_FASHOP,
    SCENE_THIENCO: SCENE_THIENCO, SCENE_ACCUSE: SCENE_ACCUSE, SCENE_KHO_CLUE: SCENE_KHO_CLUE,
    SCENE_CONFRONT: SCENE_CONFRONT, SCENE_CONFRONT_STRONG: SCENE_CONFRONT_STRONG,
    SCENE_CHAN_QUELL: SCENE_CHAN_QUELL, SCENE_FAREWELL4: SCENE_FAREWELL4, SCENE_FAREWELL4_CHAN: SCENE_FAREWELL4_CHAN,
    SCENE_SOUL_INTRO: SCENE_SOUL_INTRO, SCENE_SOUL_HEAL: SCENE_SOUL_HEAL, SCENE_SOUL_SERVICE: SCENE_SOUL_SERVICE,
    SCENE_SUPPORT: SCENE_SUPPORT, SCENE_DUEL: SCENE_DUEL, SCENE_DUEL_HARD: SCENE_DUEL_HARD,
    SCENE_DOWRY: SCENE_DOWRY, SCENE_ATK_INTRO: SCENE_ATK_INTRO,
    SCENE_ATK1: SCENE_ATK1, SCENE_ATK2: SCENE_ATK2, SCENE_ATK3: SCENE_ATK3,
    SCENE_ATK_END: SCENE_ATK_END, SCENE_INVITE: SCENE_INVITE,
    SCENE_NHAP_TONG: SCENE_NHAP_TONG,
    SCENE_CHORE_GO: SCENE_CHORE_GO, SCENE_CHORE_NUOC: SCENE_CHORE_NUOC, SCENE_CHORE_BAO: SCENE_CHORE_BAO,
    SCENE_CHORES_DONE: SCENE_CHORES_DONE,
    SCENE_TL_INTRO: SCENE_TL_INTRO, SCENE_TL1: SCENE_TL1, SCENE_TL2: SCENE_TL2, SCENE_TL3: SCENE_TL3,
    SCENE_TL_VOICE: SCENE_TL_VOICE, SCENE_TL_WIN: SCENE_TL_WIN, SCENE_TL_WIN_HARD: SCENE_TL_WIN_HARD,
    SCENE_TL_LIEU: SCENE_TL_LIEU,
    SCENE_HHT_INTRO: SCENE_HHT_INTRO, SCENE_HHT1: SCENE_HHT1, SCENE_HHT2: SCENE_HHT2, SCENE_HHT3: SCENE_HHT3,
    SCENE_HHT_END: SCENE_HHT_END,
    SCENE_CHUAN_BI_1: SCENE_CHUAN_BI_1, SCENE_CHI_GATHER: SCENE_CHI_GATHER,
    SCENE_CHI_AMBUSH: SCENE_CHI_AMBUSH, SCENE_CHI_END: SCENE_CHI_END, SCENE_CHUAN_BI_2: SCENE_CHUAN_BI_2,
    SCENE_GUARD_INTRO: SCENE_GUARD_INTRO, SCENE_GUARD1: SCENE_GUARD1, SCENE_GUARD2: SCENE_GUARD2, SCENE_GUARD3: SCENE_GUARD3,
    SCENE_GUARD_VOICE: SCENE_GUARD_VOICE, SCENE_GUARD_END: SCENE_GUARD_END,
    SCENE_TRUC_CO: SCENE_TRUC_CO, SCENE_THU_TIENG: SCENE_THU_TIENG, SCENE_END_P2: SCENE_END_P2,
    SCENE_CHUAN_BI_2_OK: SCENE_CHUAN_BI_2_OK,
    SCENE_CH9_TIN_DU: SCENE_CH9_TIN_DU, SCENE_CH9_UNHAN_PLAN: SCENE_CH9_UNHAN_PLAN,
    SCENE_CH9_TRUY_VET: SCENE_CH9_TRUY_VET, SCENE_CH9_PHUC_KICH: SCENE_CH9_PHUC_KICH,
    SCENE_CH9_SAY_RESCUE: SCENE_CH9_SAY_RESCUE, SCENE_CH9_SILENT_ROUTE: SCENE_CH9_SILENT_ROUTE,
    SCENE_CH9_UNHAN_ACT: SCENE_CH9_UNHAN_ACT, SCENE_CH9_DOI_DAU: SCENE_CH9_DOI_DAU,
    SCENE_CH9_DOI_DAU_SAY: SCENE_CH9_DOI_DAU_SAY, SCENE_CH9_HON_DAU: SCENE_CH9_HON_DAU,
    SCENE_CH9_END: SCENE_CH9_END, SCENE_UNHAN_HOI_PHONG: SCENE_UNHAN_HOI_PHONG,
    SCENE_TULINH_HOI_PHONG: SCENE_TULINH_HOI_PHONG,
    SCENE_CH10_MOI: SCENE_CH10_MOI, SCENE_CH10_VAO_LAU: SCENE_CH10_VAO_LAU,
    SCENE_CH10_SIET: SCENE_CH10_SIET, SCENE_CH10_LO_CHOICE: SCENE_CH10_LO_CHOICE,
    SCENE_CH10_TU_LO: SCENE_CH10_TU_LO, SCENE_CH10_BI_LO_1: SCENE_CH10_BI_LO_1,
    SCENE_CH10_BI_LO_2: SCENE_CH10_BI_LO_2, SCENE_CH10_END_A: SCENE_CH10_END_A,
    SCENE_CH10_END_B: SCENE_CH10_END_B,
    SCENE_CH11_HE_QUA_A: SCENE_CH11_HE_QUA_A, SCENE_CH11_HE_QUA_B: SCENE_CH11_HE_QUA_B,
    SCENE_CH11_CLINIC_A: SCENE_CH11_CLINIC_A, SCENE_CH11_SECT_SOUL_B: SCENE_CH11_SECT_SOUL_B,
    SCENE_CH11_BENH: SCENE_CH11_BENH, SCENE_CH11_CHUA_GIA_NHAN: SCENE_CH11_CHUA_GIA_NHAN,
    SCENE_CH11_U_NHAN: SCENE_CH11_U_NHAN, SCENE_CH11_TU_THU: SCENE_CH11_TU_THU,
    SCENE_CH11_CHUAN_BI: SCENE_CH11_CHUAN_BI, SCENE_CH11_VIEN_MAN: SCENE_CH11_VIEN_MAN,
    SCENE_CH11_DUOC: SCENE_CH11_DUOC, SCENE_CH11_DUOC_FIGHT: SCENE_CH11_DUOC_FIGHT,
    SCENE_CH11_DUOC_END: SCENE_CH11_DUOC_END, SCENE_CH11_VAT_DAN: SCENE_CH11_VAT_DAN,
    SCENE_CH11_VAT_DAN_DONE: SCENE_CH11_VAT_DAN_DONE,
    SCENE_CH12_LEN_DAI: SCENE_CH12_LEN_DAI, SCENE_CH12_HP_TCL: SCENE_CH12_HP_TCL,
    SCENE_CH12_HP_TONG: SCENE_CH12_HP_TONG, SCENE_CH12_GUARD_INTRO: SCENE_CH12_GUARD_INTRO,
    SCENE_KDGUARD1: SCENE_KDGUARD1, SCENE_KDGUARD2: SCENE_KDGUARD2, SCENE_KDGUARD3: SCENE_KDGUARD3,
    SCENE_KDGUARD_END: SCENE_KDGUARD_END, SCENE_CH12_TAM_MA: SCENE_CH12_TAM_MA,
    SCENE_CH12_TAMMA_SAY: SCENE_CH12_TAMMA_SAY, SCENE_CH12_TAMMA_SILENT: SCENE_CH12_TAMMA_SILENT,
    SCENE_CH12_KET_DAN: SCENE_CH12_KET_DAN, SCENE_CH12_LENH_1: SCENE_CH12_LENH_1,
    SCENE_CH12_LENH_2: SCENE_CH12_LENH_2, SCENE_CH12_LENH_DONE: SCENE_CH12_LENH_DONE,
    SCENE_BC_THUYLIEM_INTRO: SCENE_BC_THUYLIEM_INTRO, SCENE_BC_TAPHA_INTRO: SCENE_BC_TAPHA_INTRO,
    SCENE_BC_TAPSAU_INVITE: SCENE_BC_TAPSAU_INVITE, SCENE_BC_TAPSAU_INTRO: SCENE_BC_TAPSAU_INTRO,
    SCENE_BC_KIEMTRUNG_INTRO: SCENE_BC_KIEMTRUNG_INTRO, SCENE_BC_HOIPHONG_INTRO: SCENE_BC_HOIPHONG_INTRO,
    SCENE_BC_HOIPHONG_THU: SCENE_BC_HOIPHONG_THU, SCENE_BC_HOIPHONG_TRANTOI: SCENE_BC_HOIPHONG_TRANTOI,
    SCENE_BC_TRANTAM_INTRO: SCENE_BC_TRANTAM_INTRO,
    SCENE_C10_SOUL_A: SCENE_C10_SOUL_A, SCENE_C10_SOUL_B: SCENE_C10_SOUL_B,
    SCENE_CH13_TRO_LAI: SCENE_CH13_TRO_LAI, SCENE_CH13_DE_NGHI: SCENE_CH13_DE_NGHI,
    SCENE_CH13_DAI_THACH: SCENE_CH13_DAI_THACH, SCENE_CH13_DAI_THACH_2: SCENE_CH13_DAI_THACH_2,
    SCENE_CH13_TINH_ANH_END: SCENE_CH13_TINH_ANH_END, SCENE_CH13_THINH_CAU: SCENE_CH13_THINH_CAU,
    SCENE_CH13_VE_THANH: SCENE_CH13_VE_THANH,
    SCENE_CH14_HAI_THINH_CAU: SCENE_CH14_HAI_THINH_CAU, SCENE_CH14_SO_DAT: SCENE_CH14_SO_DAT,
    SCENE_CH14_NHAN_CHUNG: SCENE_CH14_NHAN_CHUNG, SCENE_CH14_HIEN_TRUONG: SCENE_CH14_HIEN_TRUONG,
    SCENE_CH14_HIEN_TRUONG_END: SCENE_CH14_HIEN_TRUONG_END, SCENE_CH14_TU_CHOI: SCENE_CH14_TU_CHOI,
    SCENE_CH14_BAO_LANH: SCENE_CH14_BAO_LANH,
    SCENE_CH15_BAO_DONG: SCENE_CH15_BAO_DONG, SCENE_CH15_CUU_DOAN: SCENE_CH15_CUU_DOAN,
    SCENE_CH15_CUU_DOAN_END: SCENE_CH15_CUU_DOAN_END, SCENE_CH15_TRUY_DUOI: SCENE_CH15_TRUY_DUOI,
    SCENE_CH15_TRUY_DUOI_2: SCENE_CH15_TRUY_DUOI_2, SCENE_CH15_TRUY_DUOI_END: SCENE_CH15_TRUY_DUOI_END,
    SCENE_CH15_BAO_CAO: SCENE_CH15_BAO_CAO,
    SCENE_CH16_TINH_TU: SCENE_CH16_TINH_TU, SCENE_CH16_LINH_NGO: SCENE_CH16_LINH_NGO,
    SCENE_CH16_KIEMTRUNG: SCENE_CH16_KIEMTRUNG, SCENE_CH16_BENH_VUC: SCENE_CH16_BENH_VUC,
    SCENE_CH16_DOT_PHA: SCENE_CH16_DOT_PHA,
    SCENE_CH17_TIN_TU_THAP: SCENE_CH17_TIN_TU_THAP, SCENE_CH17_DO_LAI: SCENE_CH17_DO_LAI,
    SCENE_CH17_DO_LAI_XONG: SCENE_CH17_DO_LAI_XONG, SCENE_CH17_CHAT_VAN: SCENE_CH17_CHAT_VAN,
    SCENE_CH17_DI_NINH: SCENE_CH17_DI_NINH, SCENE_CH17_DONE: SCENE_CH17_DONE,
    SCENE_CH18_TRANH_CHAP: SCENE_CH18_TRANH_CHAP, SCENE_CH18_AP_LUC_HUA: SCENE_CH18_AP_LUC_HUA,
    SCENE_CH18_AP_LUC_NGHE: SCENE_CH18_AP_LUC_NGHE, SCENE_CH18_AP_LUC_VIET: SCENE_CH18_AP_LUC_VIET,
    SCENE_CH18_DAU_MO: SCENE_CH18_DAU_MO, SCENE_CH18_DAU_XONG: SCENE_CH18_DAU_XONG,
    SCENE_CH18_CHUNG_CU: SCENE_CH18_CHUNG_CU, SCENE_CH18_CHO_PHIEN: SCENE_CH18_CHO_PHIEN,
    SCENE_CH18_DONE: SCENE_CH18_DONE, SCENE_CH19_PHAN_XU: SCENE_CH19_PHAN_XU,
    SCENE_CH19_PHUC_KICH_MO: SCENE_CH19_PHUC_KICH_MO, SCENE_CH19_PHUC_KICH_XONG_A: SCENE_CH19_PHUC_KICH_XONG_A,
    SCENE_CH19_PHUC_KICH_XONG_B: SCENE_CH19_PHUC_KICH_XONG_B, SCENE_CH19_TUYEN_QUY_TAC: SCENE_CH19_TUYEN_QUY_TAC,
    SCENE_CH19_VET_RAN: SCENE_CH19_VET_RAN, SCENE_CH19_AN_DINH: SCENE_CH19_AN_DINH,
    SCENE_CH19_DONE: SCENE_CH19_DONE, SCENE_CH20_RAN_NUT_A: SCENE_CH20_RAN_NUT_A,
    SCENE_CH20_RAN_NUT_B: SCENE_CH20_RAN_NUT_B, SCENE_CH20_BAO_TIN_A: SCENE_CH20_BAO_TIN_A,
    SCENE_CH20_BAO_TIN_B: SCENE_CH20_BAO_TIN_B, SCENE_CH20_GIAM_SAT: SCENE_CH20_GIAM_SAT,
    SCENE_CH20_HON_LOAN_MO: SCENE_CH20_HON_LOAN_MO, SCENE_CH20_HON_LOAN_XONG_A: SCENE_CH20_HON_LOAN_XONG_A,
    SCENE_CH20_HON_LOAN_XONG_B: SCENE_CH20_HON_LOAN_XONG_B, SCENE_CH20_GHI_NHAN_A: SCENE_CH20_GHI_NHAN_A,
    SCENE_CH20_GHI_NHAN_B: SCENE_CH20_GHI_NHAN_B, SCENE_CH20_LOI_DAP: SCENE_CH20_LOI_DAP,
    SCENE_CH20_DONE: SCENE_CH20_DONE, SCENE_CH20_SOUL_SERVICE: SCENE_CH20_SOUL_SERVICE,
    SCENE_CH21_DOAN_THUONG: SCENE_CH21_DOAN_THUONG, SCENE_CH21_SO_SACH: SCENE_CH21_SO_SACH,
    SCENE_CH21_DOI_CHAT_PHU: SCENE_CH21_DOI_CHAT_PHU, SCENE_CH21_PHU_CAT: SCENE_CH21_PHU_CAT,
    SCENE_CH21_KHOP_CUA: SCENE_CH21_KHOP_CUA, SCENE_CH21_DANH_GIA: SCENE_CH21_DANH_GIA,
    PHAN_CONG_CHOICE: PHAN_CONG_CHOICE,
    SCENE_CH22_THAM_BAO: SCENE_CH22_THAM_BAO, SCENE_CH22_VANH_TRAN: SCENE_CH22_VANH_TRAN,
    SCENE_CH22_TICH_LUY: SCENE_CH22_TICH_LUY, SCENE_CH22_NHAN_VIEC: SCENE_CH22_NHAN_VIEC,
    SCENE_CH22_DOT_PHA: SCENE_CH22_DOT_PHA, LUA_CHON_CHOICE: LUA_CHON_CHOICE,
    SCENE_CH23_HO_TONG: SCENE_CH23_HO_TONG, SCENE_CH23_VONG_VAY_MO: SCENE_CH23_VONG_VAY_MO,
    SCENE_CH23_DOI_TRAN: SCENE_CH23_DOI_TRAN, SCENE_CH23_HUONG_SUP: SCENE_CH23_HUONG_SUP,
    SCENE_CH23_HUONG_SUP_A: SCENE_CH23_HUONG_SUP_A, SCENE_CH23_HUONG_SUP_B: SCENE_CH23_HUONG_SUP_B,
    SCENE_CH23_HUONG_SUP_C: SCENE_CH23_HUONG_SUP_C, SCENE_CH23_LUA_CHON: SCENE_CH23_LUA_CHON,
    SCENE_CH23_KHEP: SCENE_CH23_KHEP, SCENE_CH24_PHAT_HUONG: SCENE_CH24_PHAT_HUONG,
    SCENE_CH24_GIU_BI_MAT: SCENE_CH24_GIU_BI_MAT, SCENE_CH24_THA_MANG: SCENE_CH24_THA_MANG,
    SCENE_CH24_MANH_MOI: SCENE_CH24_MANH_MOI, SCENE_CH24_LEN_DUONG: SCENE_CH24_LEN_DUONG,
    SCENE_CH24_TU_BIET: SCENE_CH24_TU_BIET, SCENE_CH24_DONE: SCENE_CH24_DONE,
    SCENE_CH24_LEN_DUONG_TIN_B: SCENE_CH24_LEN_DUONG_TIN_B, SCENE_KY_NGO_BON_LOI: SCENE_KY_NGO_BON_LOI
  };
  global.VSLC_STORY = STORY;
  if (typeof module !== 'undefined' && module.exports) module.exports = STORY;
})(typeof window !== 'undefined' ? window : globalThis);
