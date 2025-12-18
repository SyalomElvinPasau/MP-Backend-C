
import http from "node:http";

const proxy = new http.Server();

proxy.on("request", (request, response) => {
    const method = request.method;
    const path = request.url;

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
