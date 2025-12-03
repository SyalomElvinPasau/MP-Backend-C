import { readJSON } from "./json.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const USERS_PATH = join(__dirname, "../../data/users.json");

function parseCookies(request) {
    const cookieHeader = request.headers?.cookie;

    if (!cookieHeader) return {};

    const cookies = {};

    const pairs = cookieHeader.split("; ")

    for (const pair of pairs) {
        const [key, value] = pair.split("=");
        cookies[key] = value;
    }

    return cookies;

}

export async function getUserFromCookies(request) {
    const cookies = parseCookies(request);
    const sessionId = cookies.sessionId;

    const users = await readJSON(USERS_PATH);
    const user = users.find(u => u.sessionId == sessionId);

    return user || null; //null if not logged in
}