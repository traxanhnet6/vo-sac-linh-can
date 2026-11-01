/* SHA-256 thuần JavaScript (bản gọn, chạy cả trên file:// lẫn Node).
   Chỉ dùng để băm mật khẩu tài khoản local kèm muối — không lưu văn bản thuần. */
(function (global) {
  'use strict';
  var K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];
  function rotr(x, n) { return (x >>> n) | (x << (32 - n)); }
  function sha256(ascii) {
    var mathPow = Math.pow, maxWord = mathPow(2, 32), i, j, result = '';
    var words = [], asciiBitLength = ascii.length * 8;
    var hash = sha256.h = sha256.h || [], cache = sha256.k = sha256.k || [];
    var isPrime = function (num) {
      for (var i = 2, sqrt = Math.sqrt(num); i <= sqrt; i++) if (num % i === 0) return false;
      return true;
    };
    var frac = function (num) { return (num - Math.floor(num)) * maxWord | 0; };
    if (!cache.length) {
      var primes = [], primeCounter = 0;
      for (var candidate = 2; primeCounter < 64; candidate++) {
        if (isPrime(candidate)) {
          primes.push(candidate);
          if (primeCounter < 8) hash[primeCounter] = frac(mathPow(candidate, 1 / 2));
          cache[primeCounter] = frac(mathPow(candidate, 1 / 3));
          primeCounter++;
        }
      }
    }
    // dùng bảng hằng số cố định K đã khai ở trên thay cho cache tính động của khối chính
    var H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    ascii += '\x80';
    while (ascii.length % 64 - 56) ascii += '\x00';
    for (i = 0; i < ascii.length; i++) {
      j = ascii.charCodeAt(i);
      if (j >> 8) return sha256(unescape(encodeURIComponent(arguments[0])));
      words[i >> 2] |= j << ((3 - i) % 4) * 8;
    }
    words[words.length] = (asciiBitLength / maxWord | 0);
    words[words.length] = asciiBitLength;
    for (j = 0; j < words.length;) {
      var w = words.slice(j, j += 16), oldHash = H.slice(0);
      for (i = 0; i < 64; i++) {
        var w15 = w[i - 15], w2 = w[i - 2];
        var a = H[0], e = H[4];
        var temp1 = H[7]
          + (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25))
          + ((e & H[5]) ^ (~e & H[6]))
          + cache[i]
          + (w[i] = i < 16 ? w[i] : (
              w[i - 16]
              + (rotr(w15, 7) ^ rotr(w15, 18) ^ (w15 >>> 3))
              + w[i - 7]
              + (rotr(w2, 17) ^ rotr(w2, 19) ^ (w2 >>> 10))
            ) | 0);
        var temp2 = (rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22))
          + ((a & H[1]) ^ (a & H[2]) ^ (H[1] & H[2]));
        H = [(temp1 + temp2) | 0].concat(H);
        H[4] = (H[4] + temp1) | 0;
        H.length = 8;
      }
      for (i = 0; i < 8; i++) H[i] = (H[i] + oldHash[i]) | 0;
    }
    for (i = 0; i < 8; i++) {
      for (j = 3; j + 1; j--) {
        var b = (H[i] >> (j * 8)) & 255;
        result += (b < 16 ? '0' : '') + b.toString(16);
      }
    }
    return result;
  }
  global.VSLC_SHA256 = sha256;
  if (typeof module !== 'undefined' && module.exports) module.exports = sha256;
})(typeof window !== 'undefined' ? window : globalThis);
