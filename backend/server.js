import http from "node:http";
import { handle } from "./router.js";

const server = new http.Server();

server.on("request", handle);

server.listen({
    host: "127.0.0.1",
    port: 8000,
});