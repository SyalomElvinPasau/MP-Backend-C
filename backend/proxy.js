import http from "node:http"
import https from "node:https";
import fs from "node:fs";

// client to proxy (https)
const proxy = https.createServer({
    key: fs.readFileSync("./private-key.pem"),
    cert: fs.readFileSync("./certificate.pem"),
});
// command to get key and cert:
// openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj "/CN=localhost" -keyout private-key.pem -out certificate.pem


proxy.on("request", (request, response) => {
    const method = request.method;
    const path = request.url;

    // proxy to backend (http)
    const server = http.request({
        host: "127.0.0.1",
        port: "8000",
        method: method,
        path: path,
        headers: request.headers,
    });

    request.pipe(server);

    server.on("response", (serverResponse) => {
        const statusCode = serverResponse.statusCode;
        const headers = serverResponse.headers;
        response.writeHead(statusCode, headers);
        serverResponse.pipe(response);
    });
});

proxy.listen(8080);
