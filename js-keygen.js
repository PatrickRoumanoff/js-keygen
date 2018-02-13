var extractable = true;
var encodePrivateKey, encodePublicKey;

function wrap(text, len) {
  var length = len || 72,
    i,
    result = "";
  for (i = 0; i < text.length; i += length) {
    result += text.slice(i, i + length) + "\n";
  }
  return result;
}

function rsaPrivateKey(key) {
  return "-----BEGIN RSA PRIVATE KEY-----\n" + key + "-----END RSA PRIVATE KEY-----";
}

function arrayBufferToBase64(buffer) {
  var binary = "",
    i;
  var bytes = new Uint8Array(buffer);
  var len = bytes.byteLength;
  for (i = 0; i < len; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function generateKeyPair(alg, size, name) {
  return window.crypto.subtle
    .generateKey(
      {
        name: "RSASSA-PKCS1-v1_5",
        modulusLength: 2048, //can be 1024, 2048, or 4096
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: { name: "SHA-1" }, //can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
      },
      extractable,
      ["sign", "verify"]
    )
    .then(function(key) {
      var privateKey = window.crypto.subtle
        .exportKey("jwk", key.privateKey)
        .then(encodePrivateKey)
        .then(wrap)
        .then(rsaPrivateKey);

      var publicKey = window.crypto.subtle.exportKey("jwk", key.publicKey).then(function(jwk) {
        return encodePublicKey(jwk, name);
      });

      return Promise.all([privateKey, publicKey]);
    });
}

module.exportKey = { arrayBufferToBase64, generateKeyPair };
