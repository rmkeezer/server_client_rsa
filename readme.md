The public/private keys in this repo are uploaded for convienence, DO NOT USE!

The server stores a single user password for authentication.
An authorized user can store a public key from a pem file.
An authorized user can sign a message using his private key which is stored on the server.
Anyone can use client.js to check if a message has been signed.

The pem files were created using:
~~~~
openssl genrsa -out rsa_1024_priv.pem 1024
openssl rsa -in rsa_1024_priv.pem -out rsa_1024_pub.pem -outform PEM
~~~~

Usage:  
~~~~
node server.js [userpassword]
node client.js <command> [userpassword] [message] [keyfilename]
~~~~
Example:
~~~~
Terminal 1:
node server.js pass

Terminal 2:
node client.js --storepub pass msg rsa_1024_pub.pem
node client.js --signmessage pass msg rsa_1024_priv.pem
node client.js --checkmessage pass msg
node client.js --checkmessage wrongpass msg