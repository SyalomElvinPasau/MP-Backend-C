import { readFile } from "fs/promises";
import { getUserFromCookies } from "../utils/cookies.js";
import { generateSessionId, parseForm } from "../utils/helpers.js";
import { readJSON, writeJSON } from "../utils/json.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const LOGIN_HTML = join(__dirname, "../../frontend/login.html");
const USERS_JSON = join(__dirname, "../../data/users.json");

export async function renderLoginPage(request, response) {
    const user = await getUserFromCookies(request);

    if (user !== null) {
        //redirect to home?
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
        // "Transfer-Encoding": "chunked"
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
            u => u.username === username && u.password === password
        );

        //if invalid login, keep user on login then maybe add error text or something too
        if (!user) {
            response.writeHead(302, { "Location": "/login" });
            return response.end();
        }

        const sessionId = generateSessionId();

        user.sessionId = sessionId;

        await writeJSON(USERS_JSON, users);

        console.log("Setting cookie:", sessionId);

        response.writeHead(302, {
            "Set-Cookie": `sessionId=${sessionId}; HttpOnly; Path=/`,
            "Location": "/"
        })
        return response.end();

    });
}

//TODO implement function
//deletes sessionID from user in users.json
//Set cookie to expired
//redirect to homepage
export function logout(request, response) {
    
}
