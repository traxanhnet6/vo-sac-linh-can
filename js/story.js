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
    { who: 'truong_lao', text: 'Lục Tranh, lên trước. Đặt tay lên bia.' },
    { who: 'narrate', text: 'Bia đá bừng sáng — một màu, hai màu… rồi chín màu cùng rực lên như cầu vồng úp xuống sân.' },
    { who: 'truong_lao', text: 'Cửu… CỬU PHẨM LINH CĂN! Trấn ta trăm năm chưa từng có!' },
    { who: 'luc_tranh', text: 'Ha ha! Thấy chưa, Giang Phàm? Đây mới là chân long. Còn ngươi, lát nữa đừng khóc.' },
    { who: 'dan_a', text: 'Cửu phẩm! Lục công tử là chân long chuyển thế rồi!' },
    { who: 'anh_phung', text: 'Tốt, tốt lắm! U Nhàn, thấy chưa? Đó mới là người xứng với nhà họ Hứa.' },
    { who: 'truong_lao', text: 'Tiếp theo — Giang Phàm. Đặt tay lên bia.' },
    { who: 'narrate', text: 'Ngươi đặt tay lên mặt đá lạnh. Một hơi thở. Hai hơi thở. Mười hơi thở… Bia đá tối om. Không một tia sáng. Không một màu nào đáp lại.' },
    { who: 'truong_lao', text: 'Không màu… không hệ nào đáp lại… Vô Sắc — PHẾ CĂN. Cả đời này, không tu tiên được.' },
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
    { who: 'truong_lao', text: 'Chặng tiếp theo là Kiểm Trắc Tháp ở Cô Châu Thành — thước pha lê chín màu ở đó sẽ cho cậu biết linh căn của mình thật sự ở đâu. Nhưng đó là chuyện của chương sau.' },
    { who: 'narrate', text: '— HẾT BẢN V1 — Cảm ơn bạn đã chơi. Chương "Kiểm Trắc Tháp" đang được xây dựng.' }
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
    { who: 'narrate', text: 'Sảnh tháp lặng như tờ. Lục Tranh đặt tay lên thước pha lê. Gợn sáng leo nhanh: một phẩm, ba phẩm, ngũ phẩm… rồi bùng lên ở vạch cao nhất của chín màu.' },
    { who: 'thap_chu', text: 'Cửu phẩm! Thước pha lê xác nhận — Lục Tranh, cửu phẩm linh căn, không sai một ly!' },
    { who: 'luc_tranh', text: 'Ha ha ha! Thấy chưa, cả thành thấy chưa! Cửu phẩm là cửu phẩm, ở đâu cũng là cửu phẩm! Giang Phàm, giờ tới lượt ngươi — để thước cho thiên hạ thấy phế căn thật sự trông thế nào!' },
    { who: 'narrate', text: 'Ngươi bước tới, đặt tay lên mặt pha lê lạnh. Một gợn sáng mảnh nhú lên từ đáy thước — đỏ… cam… vàng… Nó không dừng. Xanh lá — tứ phẩm. Nó vẫn leo. Xanh lam — lục phẩm, ngang Hứa Di Ninh. Tím — thất phẩm. Đen — bát phẩm…' },
    { who: 'thi_sinh_b', text: 'Nó… nó qua bát phẩm rồi! Trời ơi, nó vẫn đang leo!' },
    { who: 'narrate', text: 'Gợn sáng chạm vạch cửu phẩm — rồi VƯỢT QUA. Cả cây thước pha lê rung lên, phát ra tiếng ngân như chuông cổ. Ánh sáng trong suốt tràn khỏi đỉnh thước, soi khắp sảnh như nước — không màu nào, mà chứa tất cả các màu.' },
    { who: 'thap_chu', text: 'Vô… VÔ CỰC LINH CĂN! Chỉ có trong truyền thuyết! Mạnh hơn cửu phẩm mười lần, trăm lần! Lão phu chủ trì tháp bốn mươi năm — hôm nay mới được thấy tận mắt!' },
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
    SCENE_ATK_END: SCENE_ATK_END, SCENE_INVITE: SCENE_INVITE
  };
  global.VSLC_STORY = STORY;
  if (typeof module !== 'undefined' && module.exports) module.exports = STORY;
})(typeof window !== 'undefined' ? window : globalThis);
