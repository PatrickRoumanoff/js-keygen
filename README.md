Generate a ssh keypair using the webcrypto API
==

See the live demo at https://js-keygen.surge.sh

There is no way to generate a ssh keypair on the chrome book, but we have access to chrome and the webcrypto API. I had to do all sorts of gymnastics to convert the generated keypair to something that can be consummed by SSH.

* I had to learn about the WebCrypto API - which was the initial goal
* I had to learn about JWK
* I had to learn about ASN.1 to encode the private key for open SSH
* I had to lean about the open SSH public format to encode the public key for open SSH
* 

The end result is a usable single page app that will locally generate a keypair you can save to local drive. Allowing you to do that straight from chrome on a chrome book.

Everywhere else, you should have access to ssh-keygen which is the recommended way to generate keypair for SSH.

