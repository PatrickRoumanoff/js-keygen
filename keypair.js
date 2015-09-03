var extractable = true;

function wrap(text, len) {
  var length = len || 72, i, result = "";
  for(i=0; i < text.length; i += length) {
    result += text.slice(i, i + length) + "\n";
  }
  return result;
}

function rsaPrivateKey(key) {
  return "-----BEGIN RSA PRIVATE KEY-----\n" + key + "-----END RSA PRIVATE KEY-----";
}

function arrayBufferToBase64( buffer ) {
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return window.btoa( binary );
}

function generateKeyPair(alg, size, name) {
  return  window.crypto.subtle.generateKey({
          name: "RSASSA-PKCS1-v1_5",
          modulusLength: 2048, //can be 1024, 2048, or 4096
          publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
          hash: {name: "SHA-1"}, //can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
      },
      extractable,
      ["sign", "verify"]
  ).then(function(key){
    
    var private = window.crypto.subtle.exportKey(
        "jwk",
        key.privateKey
    ).then(encodePrivateKey).then(wrap).then(rsaPrivateKey);

    var public = window.crypto.subtle.exportKey(
        "jwk",
        key.publicKey
    ).then(function(jwk){
        return encodePublicKey(jwk, name);
    });
    
    return Promise.all([private, public]);
  });
}

function buildHref(data) {
  return "data:application/octet-stream;charset=utf-8;base64," + window.btoa(data);
}

document.addEventListener("DOMContentLoaded", function(event) {
  document.querySelector('#generate').addEventListener('click', function(event) {
    var name = document.querySelector('#name').value || "name";
    var alg = document.querySelector('#alg').value || "RSASSA-PKCS1-v1_5";
    var size = parseInt(document.querySelector('#size').value || "2048");
    generateKeyPair(alg, size, name).then(function (keys) {
      document.querySelector('#private').setAttribute("href", buildHref(keys[0]));
      document.querySelector('#public').setAttribute("href", buildHref(keys[1]));
      document.querySelector('#privateKey').textContent = keys[0];
      document.querySelector('#publicKey').textContent = keys[1];
    }).catch(function(err){
      console.error(err);
    });
  });
});