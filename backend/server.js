import zlib from "zlib";
import http from "node:http";
import { handle } from "./router.js";

const server = http.createServer((req, res) => {
    
    const brotli = zlib.createBrotliCompress();

    res.setHeader("Content-Encoding", "br");
    res.setHeader("Transfer-Encoding", "chunked");

    const originalWrite = res.write;
    const originalEnd = res.end;

    //Pipe compressed output into original write()
    brotli.on("data", chunk => originalWrite.call(res, chunk));
    brotli.on("end", () => originalEnd.call(res));

    res.write = (chunk) => brotli.write(chunk);
    res.end = (chunk) => {
        if (chunk) {
            brotli.write(chunk);
        }
        brotli.end();
    };

    //Pass to router
    handle(req, res);
});

server.listen({
    host: "127.0.0.1",
    port: 8000,
});
