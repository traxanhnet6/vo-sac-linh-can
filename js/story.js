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
      { who: 'npc', text: 'Lão phu trắc linh bốn mươi năm, chưa từng gặp chuyện này. Bia không hiện màu… mà tiếng nói lại chấn động đất trời.' },
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
      { who: 'npc', text: 'Tụ Bảo Các chỉ bán hai món, nhưng món nào cũng là hàng thật: Thanh Phong Kiếm trợ uy cho cả kiếm quyết lẫn lời nói, Tụ Linh Ngọc giúp thổ nạp nhanh hơn hẳn.' },
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
      who: 'choice', text: 'Ngươi sẽ…',
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
    { who: 'truong_lao', text: 'Lão phu trắc linh bốn mươi năm… Bia đá không đo được cậu, vì linh căn của cậu KHÔNG NẰM TRONG CHÍN MÀU. Tiếng nói chấn động thiên địa — đây là điềm của linh căn ngoài cửu phẩm!' },
    { who: 'narrate', text: 'Mười tám năm im lặng đã mở khóa. Từ nay: thổ nạp tu luyện được mở, và lời nói của ngươi là chiêu thức — hệ thống Ngôn Linh đã thức tỉnh. Nhưng nhớ lấy: lời càng ít, tiếng càng nặng.' }
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
    { who: 'narrate', text: 'Đột phá thành công! Ngươi chính thức bước lên con đường tu tiên — và Ngôn Linh "CHẤN" cùng chiêu "PHÁ" đã sẵn sàng. Hãy phá cọc gỗ luyện công ở phía nam sân để thử tiếng nói của mình.' }
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
        { label: '[Cất lời] "CHẤN" — dằn mặt kẻ theo dõi', action: 'ambush_chan' }
      ]
    }
  ];

  var SCENE_AMBUSH_SILENT = [
    { who: 'narrate', text: 'Ngươi nín thở, lùi từng bước vào bóng râm. Mười tám năm im lặng dạy ngươi cách biến mất giỏi hơn bất kỳ ai. Bóng áo xám chờ một lúc, rồi tan vào rừng như chưa từng xuất hiện.' },
    { who: 'narrate', text: '(Ngươi nhớ kỹ dấu hiệu trên tay áo hắn: một vệt đỏ thẫm như máu khô. Huyết Bạc Cung — cái tên trưởng lão từng nhắc trong lời đồn.)' }
  ];

  var SCENE_AMBUSH_CHAN = [
    { who: 'narrate', text: 'Một chữ "CHẤN" nổ ra giữa rừng. Lá khô tung lên, chim bay tán loạn. Bóng áo xám loạng choạng lùi ba bước, ôm tai, rồi quay đầu bỏ chạy vào sâu trong rừng.' },
    { who: 'narrate', text: '(Lời của ngươi đã có nhân chứng không mong muốn. Từ giờ, có kẻ biết kẻ "phế căn" kia biết nói — và nói rất nặng. Đã ghi vào sổ lời đã nói.)' }
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
    { who: 'thap_chu', text: 'Linh căn của cậu trong suốt — không thuộc hệ nào, nên học được MỌI hệ. Tâm pháp này giúp cậu thổ nạp nhanh hơn; kiếm quyết này cho cậu một đường sức mạnh không cần tới tiếng nói. Nhớ lấy: người có hai đường đi, đừng bao giờ để lộ cả hai cùng lúc.' },
    { who: 'narrate', text: 'Đã mở khóa: Thanh Phong Chân Kinh (thổ nạp nhanh hơn) và Thất Tinh Kiếm Quyết (nút "Kiếm quyết", phím 3 — đòn kiếm không tốn Tĩnh Mặc). Lĩnh hội công pháp khiến tu vi dâng đầy — hãy đột phá khi sẵn sàng.' },
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
    { who: 'duoc_su', text: 'Chào cậu. Hồi Khí Đan của hiệu ta — mười hai viên Linh Thạch một viên, uống vào hồi ngay hai mươi lăm điểm Tĩnh Mặc. Cậu đang có bao nhiêu đan, dùng thử là biết.' },
    {
      who: 'choice', text: 'Hiệu thuốc Hồi Xuân',
      options: [
        { label: 'Mua một viên Hồi Khí Đan — 12 Linh Thạch', action: 'buy_dan' },
        { label: 'Dùng một viên Hồi Khí Đan (hồi 25 Tĩnh Mặc)', action: 'use_dan' },
        { label: 'Rời hiệu thuốc', action: 'shop_leave' }
      ]
    }
  ];

  var SCENE_FASHOP = [
    { who: 'phap_khi_chu', text: 'Mời cậu xem. Thanh Phong Kiếm — một trăm năm mươi Linh Thạch: trợ thêm uy lực cho cả kiếm quyết lẫn Ngôn Linh. Tụ Linh Ngọc — hai trăm sáu mươi Linh Thạch: đeo vào, thổ nạp nhanh hơn hẳn. Hàng thật, không mặc cả.' },
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
        { label: 'Dùng một tiếng CHẤN dẹp tan màn vu cáo ngay tại chỗ', action: 'ch4_chan' }
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
    { who: 'u_nhan', text: 'Giang Phàm… cậu lại cất tiếng rồi. Vì chuyện này mà phải dùng tới nó, có đáng không…' },
    { who: 'tran_chinh_dao', text: '(khẽ, chỉ đủ mình nghe) Tiếng nói ấy… không phải công pháp. Thiên hạ này, chưa từng có ghi chép nào về thứ sức mạnh như vậy.' },
    { who: 'narrate', text: 'Vụ việc khép lại trong im lặng. Nhưng ánh mắt Trần Chính Đạo nhìn theo ngươi đã khác — Thiên Cơ Các vừa ghi thêm một dòng về ngươi, ở một cuốn sổ khác.' }
  ];

  var SCENE_FAREWELL4 = [
    { who: 'tran_chinh_dao', text: 'Vụ vu cáo đã vào sổ của các: Lục Tranh ghen tị dựng chuyện, Hứa gia đã nhận lỗi. Từ nay ai nhắc lại chuyện này là chống lại ghi chép của Thiên Cơ Các.' },
    { who: 'tran_chinh_dao', text: 'Cậu Giang, ta nói riêng một câu — câu này là ý của cá nhân ta, không phải của các: linh căn là thứ trời cho, nhưng cách cậu xử sự hôm nay mới là thứ khiến người ta phải nhìn lại. Thiên Cơ Các ghi tên cậu vào sổ quan sát. Không phải sổ tội — là sổ của những người sẽ đi rất xa.' },
    { who: 'tran_chinh_dao', text: 'À, trước khi đi, ta để lại một tin: Trần gia ở đông bắc thành đang gặp chuyện lạ về thần hồn, tìm khắp nơi một vị Hồn Sư thần bí mà không thấy. Nếu cậu có nghe ngóng được gì… Trần gia sẽ biết ơn lắm.' }
  ];

  var SCENE_FAREWELL4_CHAN = [
    { who: 'tran_chinh_dao', text: 'Vụ vu cáo đã khép lại — theo cách ồn ào nhất có thể. Sổ của các ghi: không thành, và sẽ không ai dám dựng lại.' },
    { who: 'tran_chinh_dao', text: 'Cậu Giang, ta phải hỏi thẳng: tiếng nói của cậu là công pháp gì? Ta tra sổ ba mươi năm, không một dòng nào giống nó. …Không muốn nói cũng được. Thiên Cơ Các tôn trọng bí mật của người khác — nhưng các này sẽ ghi nhớ nó.' },
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
    { who: 'narrate', text: 'Thần hồn của lão gia bị một sợi tơ đen quấn chặt — thủ pháp này lạnh và quen: nó không thuộc về Cô Châu Thành. Ngươi gỡ từng sợi một, chậm rãi, không để lại một dấu vết nào của người đã tới.' },
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
      { label: 'Hét một tiếng PHÁ', action: 'atk_pha' },
      { label: 'Hét một tiếng CHẤN', action: 'atk_chan' },
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
     bằng đúng ba chiêu không dùng Ngôn Linh và thắng Hoa Hướng Thần là
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
    { who: 'truong_lao_tong', text: 'Và nghe cho kỹ điều này: tuyệt đối không dùng tiếng nói. Đài này đo kiếm, không đo miệng — ai cất tiếng, thử thách dừng ngay, kết quả hủy bỏ. Bí mật gì của ngươi, giữ lấy mà dùng ở chỗ khác.' },
    { who: 'lieu_khuynh_tien', text: 'Hình chiếu chỉ là cái bóng của ta năm ấy. Nhưng cái bóng ấy cũng chưa từng thua kẻ nào dưới ba chiêu — ngươi liệu mà giữ kiếm cho vững.' },
    { who: 'narrate', text: 'Giữa đài, hình chiếu nâng kiếm. Ánh sáng quanh thân nàng tụ lại thành một đường kiếm quang chói mắt — chiêu đầu tiên đã thành hình, và cả đài nín thở chờ nó chém xuống.' }
  ];

  var TL_CHOICE = {
    who: 'choice', text: 'Ngươi sẽ đáp chiêu này bằng…',
    options: [
      { label: 'Thất Tinh Bộ — lách mình tránh kiếm quang', action: 'tl_thiem' },
      { label: 'Hoành kiếm phong ngự — đỡ thẳng mũi kiếm', action: 'tl_phong' },
      { label: 'Đối chém — một kiếm nghênh thẳng', action: 'tl_dao' },
      { label: 'Cất tiếng CHẤN phá hình chiếu', action: 'tl_voice' }
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
    { who: 'narrate', text: 'Tiếng nói vừa chớm dâng lên trong cổ họng ngươi — chưa thành chữ — thì trên đài cao, trưởng lão đã phất mạnh tay áo. Chuông của đài Thăng Long vang lên một tiếng dài, hình chiếu của Liễu Khuynh Tiên tan ra như khói gặp gió.' },
    { who: 'truong_lao_tong', text: 'Thử thách dừng tại đây. Ta đã nói rõ luật từ đầu: đài này đo kiếm, không đo miệng.' },
    { who: 'truong_lao_tong', text: 'Nghe đây, Giang Phàm. Tiếng nói của ngươi quý — quý vì nó ít, và vì chưa ai ở nơi này biết nó nặng tới đâu. Đừng phơi nó ra ở chỗ không cần thiết, trước mắt những người không cần biết.' },
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
      { label: 'Hét một tiếng PHÁ', action: 'hht_pha' },
      { label: 'Hét một tiếng CHẤN', action: 'hht_chan' },
      { label: 'Xuất Thất Tinh Kiếm Quyết', action: 'hht_sword' },
      { label: 'Thu kiếm giữ thế, thổ nạp lấy lại Tĩnh Mặc', action: 'hht_hold' }
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
      { label: 'Hét một tiếng CHẤN', action: 'chi_chan' },
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
    { who: 'narrate', text: 'Vòng vây còn cách U Nhàn hai mươi bước. Ngươi đang ở trên mỏm đá, Tĩnh Mặc đầy ngực sau nhiều ngày im lặng — một lời từ đây sẽ dội xuống cả bãi trống như sấm, phá vòng vây ngay lập tức, nhưng cũng sẽ tuyên bố cho mọi kẻ có mặt ở đây biết: Giang Phàm đang ở trong thung lũng này, và lời nói của hắn là thứ vũ khí đó.' },
    { who: 'narrate', text: 'Đường vòng cũng có: men theo vách đá phía tây, lặng lẽ tới sau lưng vòng xe, nhập vào đoàn của U Nhàn mà không một tiếng động — chậm hơn, và trong lúc ngươi đi vòng, vòng vây vẫn đang siết lại quanh nàng.' },
    CH9_CHOICE
  ];
  var SCENE_CH9_SAY_RESCUE = [
    { who: 'hero', mode: 'say', text: 'TRÁNH RA.' },
    { who: 'narrate', text: 'Hai chữ từ mỏm đá dội xuống, sóng âm quét qua bãi trống như một bức tường vô hình. Hàng đầu của vòng vây bị hất ngã ngồi xuống đất, mấy tên ôm tai quỵ gối, vòng vây đang khép kín vỡ ra một khoảng trống lớn ngay trước mặt U Nhàn.' },
    { who: 'u_nhan', text: 'Phàm ca! Muội biết huynh sẽ tới — nhưng huynh lại dùng tiếng nói rồi… Thôi, người an toàn trước đã. Đoàn xe, theo ta! Rút về phía mỏm đá, nhanh!' },
    { who: 'mo_cuu_u', text: '(từ xa, lau máu ở khóe miệng) Tốt. Rất tốt. Cung chủ đoán không sai một chữ: chỉ cần động tới người của Hứa gia, con cá sẽ tự nhảy lên khỏi mặt nước. Giang Phàm — tiếng nói của ngươi, bọn ta đã nghe tận tai rồi.' },
    { who: 'narrate', text: 'Người của đoàn Hứa gia thoát qua khoảng trống ấy, không ai mất mạng. Nhưng ngươi hiểu cái giá ngay khi nhìn thấy nụ cười của tên chỉ huy lúc rút lui: từ hôm nay, Huyết Bạc Cung không còn phải đoán nữa. Chúng biết chắc vũ khí của ngươi là gì — và chúng sẽ chuẩn bị cho nó.' }
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
    { who: 'bach_kinh_duong', text: 'Vậy thì theo lệ. Ký lục quan — đóng hồ sơ này lại, ghi đúng một dòng: lai lịch bất minh. Và chuẩn bị tinh thần: khi các không nói, sẽ có kẻ khác nói thay, bằng cái miệng xấu nhất mà chúng tìm được.' }
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
      { label: 'Hét một tiếng CHẤN', action: 'kd_chan' },
      { label: 'Lùi lại giữ thế, tích Tĩnh Mặc', action: 'kd_hold' }
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
    { who: 'narrate', text: 'Lời ấy làm cả vòng hộ pháp khựng lại một nhịp. Nhưng địch vẫn đang leo lên đài — và ngươi, như lần Trúc Cơ, tuyệt đối không được cất tiếng cho tới khi vận công xong.' }
  ];
  var KDGUARD_CHOICE = {
    who: 'choice', text: 'Vận công không thể dừng. Ngươi sẽ…',
    options: [
      { label: 'Ra hiệu cho U Nhàn giữ phía đông', action: 'kdguard_dong' },
      { label: 'Để Hoa Hướng Thần đón đầu kẻ mạnh nhất', action: 'kdguard_hoa' },
      { label: 'Ngồi yên giữ vững tâm thần, mặc kệ khiêu khích', action: 'kdguard_tam' },
      { label: 'Cất tiếng phá vây — dù phải vỡ vận công', action: 'kdguard_voice' }
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
    { who: 'narrate', text: 'Đợt cuối: Mạc Cửu U tự mình bước lên ba bậc thang, dừng lại ở đúng tầm tiếng nói có thể chạm tới, và nói vọng lên đài: "Hét đi chứ, Hồn Sư. Hay là lần này, cái giá của một tiếng hét đã đắt hơn lần trước?"' },
    KDGUARD_CHOICE
  ];
  var SCENE_KDGUARD_END = [
    { who: 'narrate', text: 'Đợt cuối cùng bị đẩy xuống khỏi bậc thang. Mạc Cửu U đứng ở bậc dưới cùng, nhìn lên đài, bỗng thu kiếm. Hắn nói vọng lên, đủ cho mọi người quanh đài nghe: "Cung chủ có lời: cứ để nó Kết Đan. Đan thành rồi — món nợ mới tính được."' },
    { who: 'narrate', text: 'Địch rút như nước rút. Vòng hộ pháp không ai bị thương nặng. Chu thiên của ngươi, sau ba đợt sóng gió, vẫn nguyên vẹn một vòng — vật dẫn trong tay đã ấm lên như có nhịp đập riêng.' }
  ];
  var SCENE_CH12_TAM_MA = [
    { who: 'narrate', text: 'Vận công tới vòng cuối cùng. Trong tâm thần, kim đan đang thành hình — và đúng lúc ấy, tâm ma tới, mang hình dạng quen thuộc nhất: một thung lũng đầy hoa anh đào, một vòng vây đang siết lại, và tiếng của chính ngươi vang lên từ khắp nơi: "Nói đi. Một lời thôi là cứu được người. Ngươi đã im lặng mười tám năm — còn định im lặng tới bao giờ?"' },
    { who: 'narrate', text: 'Ngoài đài, cùng lúc ấy, bậc thang phía nam bỗng nứt một mảng đá lớn — trận văn hộ đài đang rạn, và người giữ phía nam đang ở ngay dưới mảng đá ấy. Một lời của ngươi lúc này có thể giữ mảng đá lại. Nhưng vận công đang ở khắc cuối: cất lời, đan sẽ thành nhưng mang một vết. Im lặng, đan trọn vẹn — và người ở phía nam sẽ chịu mảng đá ấy.' }
  ];
  var KD_TAMMA_CHOICE = {
    who: 'choice', text: 'Mảng đá đang rơi. Ngươi sẽ…',
    options: [
      { label: 'Cất lời — giữ mảng đá lại, cứu người giữ đài', action: 'ketdan_say' },
      { label: 'Giữ im lặng tới cùng — để đan trọn vẹn', action: 'ketdan_silent' }
    ]
  };
  var SCENE_CH12_TAMMA_SAY = [
    { who: 'hero', mode: 'say', text: 'LÙI LẠI!' },
    { who: 'narrate', text: 'Tiếng hét phá vỡ chu thiên ở vòng cuối. Sóng âm hất mảng đá lệch đi nửa trượng — người giữ phía nam thoát trong gang tấc. Kim đan trong đan điền vẫn thành hình, nhưng trên mặt đan còn lại một vệt nứt mảnh như tóc — cái giá của một lời nói đúng lúc.' }
  ];
  var SCENE_CH12_TAMMA_SILENT = [
    { who: 'narrate', text: 'Ngươi không mở miệng. Mảng đá rơi xuống phía nam đài trong tiếng rầm khô khốc — và từ trong bụi đá, người giữ đài bò ra được, vai đẫm máu nhưng còn sống, còn cười được một cái về phía đài: "Đan của sư huynh… đừng vì ta mà hỏng."' },
    { who: 'narrate', text: 'Chu thiên khép lại trọn vẹn. Kim đan trong đan điền tròn trịa, sáng như một mặt trời nhỏ vừa được thắp lên — không một vết nứt.' }
  ];
  var SCENE_CH12_KET_DAN = [
    { who: 'narrate', text: 'Bầu trời trên Thanh Vân Tông bỗng tối đi một khắc giữa ban ngày. Một cột sáng từ đài phóng thẳng lên, mây tụ thành vòng xoay chậm, và từng tiếng chuông không ai gõ tự vang lên khắp núi.' },
    { who: 'narrate', text: 'Kim Đan Sơ Kỳ. Ngươi mở mắt ra — thế giới nghe rõ hơn, nhìn xa hơn, và tiếng nói trong ngực ngươi nặng hơn trước gấp bội: từ hôm nay, lời của ngươi không chỉ là tiếng. Nó là LỆNH.' }
  ];
  var SCENE_CH12_LENH_1 = [
    { who: 'narrate', text: 'Trưởng lão cho dựng một tấm bia đá mới ở chân đài. Ông nói: "Kim Đan thành rồi, tiếng nói của ngươi đã đổi bậc. Thử đi — không phải hét. Ra lệnh, như ra lệnh cho chính thiên địa quanh ngươi."' },
    { who: 'truong_lao_tong', text: 'Nói một chữ ĐỊNH vào tấm bia kia. Nếu bia đứng yên tuyệt đối, không rung một hạt bụi, trong khi mặt đất quanh nó nứt ra — là ngươi đã chạm được vào bậc lệnh. Dùng phím 4, như ngươi vẫn dùng các chiêu tiếng nói.' }
  ];
  var SCENE_CH12_LENH_2 = [
    { who: 'truong_lao_tong', text: 'Bia đứng yên như bị đóng băng giữa trời — tốt. Giờ khó hơn: trận văn quanh đài này đang rạn từ trận đánh lúc nãy. Nói một chữ PHONG — phong ấn vết rạn ấy lại. Phong không phải phá, cũng không phải giữ: là khóa chặt một thứ đang chuyển động thành vĩnh viễn đứng yên. Dùng phím 5.' }
  ];
  var SCENE_CH12_LENH_DONE = [
    { who: 'narrate', text: 'Vết rạn trên trận văn khép lại dưới một vòng ấn vàng, rồi đứng yên như chưa từng nứt. Cả đài im phăng phắc. Lần dùng lệnh đầu tiên của ngươi không nhắm vào kẻ thù nào — nó giữ yên một góc đài cho những người vừa giữ đài cho ngươi.' },
    { who: 'truong_lao_tong', text: 'ĐỊNH giữ một nhịp. PHONG khóa hai nhịp. Nhớ lấy giới hạn của chúng — và nhớ cả cái giá: thiên hạ từ nay sẽ nghe lệnh của ngươi, và cũng sẽ sợ lệnh của ngươi. Dùng nó như ngươi đã dùng sự im lặng mười tám năm: chỉ khi thật cần.' },
    { who: 'u_nhan', text: 'Phàm ca. Muội hỏi huynh một câu cuối của ngày hôm nay — huynh có hối hận lần nào đã mở miệng, hay lần nào đã im lặng không?' },
    { who: 'hero', mode: 'write', text: '(viết) "Không. Lời nói không nặng vì nó hiếm. Nó nặng vì nói ra rồi, mình phải chịu trách nhiệm với nó mãi. Ta chỉ hối hận nếu một ngày ta nói mà không chịu trách nhiệm nữa."' },
    { who: 'narrate', text: 'Nàng đọc xong, gấp tờ giấy lại rất cẩn thận và cất vào ngực áo — như cất một tờ tự thư khác. Trên đài, chuông tông ngân dài. Một phần đường đã khép lại bằng chữ viết, đúng như nó đã bắt đầu bằng chữ viết.' }
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
    SCENE_CH12_LENH_2: SCENE_CH12_LENH_2, SCENE_CH12_LENH_DONE: SCENE_CH12_LENH_DONE
  };
  global.VSLC_STORY = STORY;
  if (typeof module !== 'undefined' && module.exports) module.exports = STORY;
})(typeof window !== 'undefined' ? window : globalThis);
