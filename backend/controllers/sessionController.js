import { readJSON, writeJSON } from "../utils/json.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SESSION = join(__dirname, "../../data/session.json");
const DURASI_SESSION = 1 * 60 * 1000;

export async function createSession(sessionId, userId) {
    const session = await readJSON(SESSION);

    session[sessionId] = {
        userId: userId,
        createdAt: Date.now(),
    }

    await writeJSON(SESSION, session);
}

export async function getSession(sessionId) {
    const sessions = await readJSON(SESSION);
    const session = sessions[sessionId];

    if (!session) return null;

    if (Date.now() - session.createdAt > DURASI_SESSION) {
        delete sessions[sessionId];
        await writeJSON(SESSION, sessions);
        return null;
    }

    session.createdAt = Date.now();
    sessions[sessionId] = session;
    await writeJSON(SESSION, sessions);

    return session;
}

export async function deleteSession(sessionId) {
    const session = await readJSON(SESSION);
    delete session[sessionId];
    await writeJSON(SESSION, session);
}

