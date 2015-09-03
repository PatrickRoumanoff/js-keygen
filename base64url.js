//adapted from https://tools.ietf.org/html/draft-ietf-jose-json-web-signature-08#appendix-C

function base64urlEncode(s) {
  var s = window.btoa(arg); // Regular base64 encoder
  s = s.split('=')[0]; // Remove any trailing '='s
  s = s.replace(/+/g,  '-'); // 62nd char of encoding
  s = s.replace(/\//g, '_'); // 63rd char of encoding
  return s;
}

function  base64urlDecode(s) {
  s = s.replace(/-/g, '+'); // 62nd char of encoding
  s = s.replace(/_/g, '/'); // 63rd char of encoding
  switch (s.length % 4) { // Pad with trailing '='s
    case 0: break; // No pad chars in this case
    case 2: s += "=="; break; // Two pad chars
    case 3: s += "="; break; // One pad char
    default: throw "Illegal base64url string!";
  }
  return window.atob(s); // Standard base64 decoder
}