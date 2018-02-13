var base64urlDecode;

function arrayToString(a) {
  return String.fromCharCode.apply(null, a);
}

function stringToArray(s) {
  return s.split("").map(function(c) {
    return c.charCodeAt();
  });
}

function base64urlToArray(s) {
  return stringToArray(base64urlDecode(s));
}

function pemToArray(pem) {
  return stringToArray(window.atob(pem));
}

function arrayToPem(a) {
  return window.btoa(
    a
      .map(function(c) {
        return String.fromCharCode(c);
      })
      .join("")
  );
}

function arrayToLen(a) {
  var result = 0,
    i;
  for (i = 0; i < a.length; i += 1) {
    result = result * 256 + a[i];
  }
  return result;
}

function integerToOctet(n) {
  var result = [];
  for (true; n > 0; n = n >> 8) {
    result.push(n & 0xff);
  }
  return result.reverse();
}

function lenToArray(n) {
  var oct = integerToOctet(n),
    i;
  for (i = oct.length; i < 4; i += 1) {
    oct.unshift(0);
  }
  return oct;
}

function decodePublicKey(s) {
  var split = s.split(" ");
  var prefix = split[0];
  if (prefix !== "ssh-rsa") {
    throw "Unknown prefix:" + prefix;
  }
  var buffer = pemToArray(split[1]);
  var nameLen = arrayToLen(buffer.splice(0, 4));
  var type = arrayToString(buffer.splice(0, nameLen));
  if (type !== "ssh-rsa") {
    throw "Unknown key type:" + type;
  }
  var exponentLen = arrayToLen(buffer.splice(0, 4));
  var exponent = buffer.splice(0, exponentLen);
  var keyLen = arrayToLen(buffer.splice(0, 4));
  var key = buffer.splice(0, keyLen);
  return { type: type, exponent: exponent, key: key, name: split[2] };
}

function checkHighestBit(v) {
  if (v[0] >> 7 === 1) {
    // add leading zero if first bit is set
    v.unshift(0);
  }
  return v;
}

function jwkToInternal(jwk) {
  return {
    type: "ssh-rsa",
    exponent: checkHighestBit(stringToArray(base64urlDecode(jwk.e))),
    name: "name",
    key: checkHighestBit(stringToArray(base64urlDecode(jwk.n))),
  };
}

function encodePublicKey(jwk, name) {
  var k = jwkToInternal(jwk);
  k.name = name;
  var keyLenA = lenToArray(k.key.length);
  var exponentLenA = lenToArray(k.exponent.length);
  var typeLenA = lenToArray(k.type.length);
  var array = [].concat(typeLenA, stringToArray(k.type), exponentLenA, k.exponent, keyLenA, k.key);
  var encoding = arrayToPem(array);
  return k.type + " " + encoding + " " + k.name;
}

function asnEncodeLen(n) {
  var result = [];
  if (n >> 7) {
    result = integerToOctet(n);
    result.unshift(0x80 + result.length);
  } else {
    result.push(n);
  }
  return result;
}

function encodePrivateKey(jwk) {
  var order = ["n", "e", "d", "p", "q", "dp", "dq", "qi"];
  var list = order.map(function(prop) {
    var v = checkHighestBit(stringToArray(base64urlDecode(jwk[prop])));
    var len = asnEncodeLen(v.length);
    return [0x02].concat(len, v); // int tag is 0x02
  });
  var seq = [0x02, 0x01, 0x00]; // extra seq for SSH
  seq = seq.concat.apply(seq, list);
  var len = asnEncodeLen(seq.length);
  var a = [0x30].concat(len, seq); // seq is 0x30
  return arrayToPem(a);
}

module.exports = { base64urlToArray, decodePublicKey, encodePublicKey, encodePrivateKey };
