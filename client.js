const http = require('http'),
    crypto = require('crypto'),
    fs = require("fs");

function usage() {
    console.log("Please use correct arguments:")
    console.log("node client.js <command> [password] [message] [pub/privkey]");
    console.log("example:");
    console.log("node client.js --signmessage pass msg key.pem");
}

// setup HTTP headers
function createOptions(path, body) { 
    return {
        hostname: "localhost",
        port: 3000,
        path: path,
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(body)
        }
    }
}

// send HTTP request at path with body
function sendRequest(path, body) {
    var options = createOptions(path, body);
    var request = http.request(options, (res) => {
        res.on('data', function (chunk) {
            console.log('Response: ' + chunk);
        });
    });
    request.write(body);
    request.end();
}

// Only signmessage performs client-side message signing since we do not want to send private keys ever
// Execute request based on cmd arguments
function main(cmd, pass, msg, key) {
    if (cmd == '--storepub') {
        var body = JSON.stringify({password: pass, publicKey: key});
        sendRequest("/storepub", body);
    } else if (cmd == '--signmessage') {
        var signer = crypto.createSign('sha256');
        signer.update(msg);
        var signedmessage = signer.sign(key, 'base64');
        var body = JSON.stringify({password: pass, signedmsg: signedmessage});
        sendRequest("/signmessage", body);
    } else if (cmd == '--checkmessage') {
        var body = JSON.stringify({password: pass, message: msg});
        sendRequest("/checkmessage", body);
    } else {
        usage();
    }
}

// Simple arguments with no flags were used for simplicity
// Parse arguments
var cmd = process.argv[2];
var pass = process.argv[3];
var msg = process.argv[4];
var keyfn = process.argv[5];
if (cmd == null || pass == null || msg == null) {
    usage();
} else {
    if (cmd == '--storepub' || cmd == '--signmessage') {
        fs.readFile(keyfn, (err, data) => {
            if (err) throw err;
            main(cmd, pass, msg, data.toString());
        })
    } else {
        main(cmd, pass, msg, '');
    }
}

