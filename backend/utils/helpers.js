import { randomBytes } from "crypto";

export function parseForm(body) {
    const form = {};

    //if no input then return empty
    if (!body) return form;

    const pairs = body.split("&")

    for (const pair of pairs) {
        const [key, value] = pair.split("=");
        form[key] = decodeURIComponent(value || "");
    }

    return form;
}

export function generateSessionId() {
    return "session_" + randomBytes(16).toString("hex");
}

export function generateId(database) {
    if (database.length === 0) {
        return "p1";
    }

    const allIds = database.map(item => {
        const number = parseInt(item.id.substring(1)    );
        return number;
    })

    const maxId = Math.max(...allIds);
    return "p" + (maxId + 1);
}
