import { readJSON } from "./json.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { getSession } from "../controllers/sessionController.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const USERS_PATH = join(__dirname, "../../data/users.json");
const SESSION = join(__dirname, "../../data/session.json");

export function parseCookies(request) {
    const cookieHeader = request.headers?.cookie;

    if (!cookieHeader) return {};

    const cookies = {};

    cookieHeader.split(";").forEach(cookie => {
        const [key, ...rest] = cookie.trim().split("=");
        cookies[key] = rest.join("=");
    });

    return cookies;
}

export async function getUserFromCookies(request) {
    const cookies = parseCookies(request);
    // console.log("Cookie: ", cookies);
    const sessionId = cookies.sessionId;
    if(!sessionId) return null;

    const session = await getSession(sessionId);
    if (!session) return null;

    const users = await readJSON(USERS_PATH);
    const user = users.find(u => u.id === session.userId);

    return user || null; //null if not logged in
}