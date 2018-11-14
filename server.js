const http = require('http'),
    url = require('url'),
    bcrypt = require('bcrypt'),
    crypto = require('crypto');

var pass = process.argv[2];
if (pass == null) {throw "Please use: node server.js <userpassword>"}

// bcrypt is more time consuming than crypto but is much safer for user passwords since these are more important than messages
var hashedpass = '';
bcrypt.hash(pass, 5, (err, pass) => hashedpass = pass);
var signedmsg, publicKey;

// Create server to respond to post requests
server = http.createServer((req,res) => {
    // Use path to decide what command to run
    var path = url.parse(req.url).pathname;
    let body = [];
    req.on('error', (err) => {
        console.error(err);
    }).on('data', (chunk) => {
        body.push(chunk);
    }).on('end', () => {
        body = JSON.parse(Buffer.concat(body).toString());
        bcrypt.compare(body.password, hashedpass, (err, doesMatch) => {
            if (doesMatch) {
                res.write("User authenticated");
                // Allow user to store a public key
                if (path == '/storepub') {
                    publicKey = body.publicKey;
                    res.write("Public Key added");
                // Allow user to store a signed message
                } else if (path == '/signmessage') {
                    signedmsg = body.signedmsg;
                    res.write("Message signed");
                }
            } else {
                res.write("Invalid user password");
            }
            // Anyone can check a signed message
            if (path == '/checkmessage') {
                var verifier = crypto.createVerify('sha256');
                verifier.update(body.message);
                if (signedmsg != null && verifier.verify(publicKey, signedmsg, 'base64')) {
                    res.write("Message is verified by user");
                } else {
                    res.write("Message is not verified");
                }
            }
            res.end();
        });
    });
});

server.listen(3000, () => {
    console.log('Node server created at port 3000');
});