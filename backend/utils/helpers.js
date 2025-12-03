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
