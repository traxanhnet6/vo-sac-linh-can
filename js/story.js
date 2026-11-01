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

  var STORY = {
    IDLE_BEFORE: IDLE_BEFORE, IDLE_AFTER: IDLE_AFTER,
    SCENE_TEST: SCENE_TEST, SCENE_WRITE_BRANCH: SCENE_WRITE_BRANCH,
    SCENE_VOICE: SCENE_VOICE, SCENE_VOICE_RETRY: SCENE_VOICE_RETRY,
    SCENE_BREAKTHROUGH: SCENE_BREAKTHROUGH, SCENE_DUMMY_DONE: SCENE_DUMMY_DONE
  };
  global.VSLC_STORY = STORY;
  if (typeof module !== 'undefined' && module.exports) module.exports = STORY;
})(typeof window !== 'undefined' ? window : globalThis);
