import { readJSON } from "./json.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { getSession } from "../controllers/sessionController.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const USERS_PATH = join(__dirname, "../../data/users.json");
const SESSION = join(__dirname, "../../data/session.json");

const COOKIE_CONFIG = {
    httpOnly: true,
    secure,
    sameSite: 'Strict',
    maxAge: 24 * 60 * 60,
    path: '/'
};

export function createCookie(name, value, options = {}) {
    const config = { ...COOKIE_CONFIG, ...options };
    
    let cookieString = `${name}=${value}`;
    
    if (config.httpOnly) {
        cookieString += '; HttpOnly';
    }
    
    if (config.secure) {
        cookieString += '; Secure';
    }
    
    if (config.sameSite) {
        cookieString += `; SameSite=${config.sameSite}`;
    }
    
    if (config.maxAge !== undefined) {
        cookieString += `; Max-Age=${config.maxAge}`;
    }
    
    if (config.path) {
        cookieString += `; Path=${config.path}`;
    }
    
    return cookieString;
}

export function deleteCookie(name) {
    return createCookie(name, '', { maxAge: 0 });
}

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