import { readFile } from "fs/promises";
import { getUserFromCookies, parseCookies } from "../utils/cookies.js";
import { generateSessionId, parseForm } from "../utils/helpers.js";
import { readJSON, writeJSON } from "../utils/json.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { createSession, getSession, deleteSession } from "./sessionController.js";
import bcrypt from "bcrypt";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const LOGIN_HTML = join(__dirname, "../../frontend/login.html");
const USERS_JSON = join(__dirname, "../../data/users.json");
const SESSION = join(__dirname, "../../data/session.json");

export async function renderLoginPage(request, response) {
    const user = await getUserFromCookies(request);

    if (user !== null) {

        response.writeHead(302, { "Location": "/" });
        return response.end();

    }

    let html;

    try {
        html = await readFile(LOGIN_HTML, "utf8")
    } catch (error) {
        response.writeHead(500, { "Content-Type": "text/plain" });
        return response.end("Error Loading Login Page")

    }

    response.writeHead(200, {
        "Content-Type": "text/html",
    })
    response.end(html);
}


export function login(request, response) {
    let body = "";

    request.on("data", chunk => {
        body += chunk.toString();
    });

    request.on("end", async () => {
        const form = parseForm(body);
        const { username, password } = form

        const users = await readJSON(USERS_JSON);

        const user = users.find(
            u => u.username === username
        );

        //if invalid login, keep user on login then maybe add error text or something too
        if (!user) {
            response.writeHead(302, { "Location": "/login" });
            return response.end();
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            response.writeHead(302, { "Location": "/login" });
            return response.end();
        }

        const sessionId = generateSessionId();
        await createSession(sessionId, user.id);

        response.writeHead(302, {
            "Set-Cookie": `sessionId=${sessionId}; HttpOnly; Path=/; SameSite=Strict; Max-Age=1800`,
            "Location": "/"
        })
        return response.end();

    });
}

export async function logout(request, response) {
    const cookies = parseCookies(request);
    const sessionId = cookies.sessionId;

    if (sessionId) {
        await deleteSession(sessionId);
        console.log("Session deleted:", sessionId);
    }

    response.writeHead(302, {
        "Set-Cookie": "sessionId=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0",
        "Location": "/login"
    });

    response.end();
}
