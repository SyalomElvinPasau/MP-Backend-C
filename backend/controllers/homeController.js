import { readFile } from "fs/promises";
import { getUserFromCookies } from "../utils/cookies.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";



const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const HOME_HTML = join(__dirname, "../../frontend/home.html");

//TODO
//add logic to display posts that exist
export async function renderHomePage(request, response) {

    const user = await getUserFromCookies(request);

    if (!user) {
        // redirect to login if not logged in
        response.writeHead(302, { Location: "/login" });
        return response.end();
    }

    let html;

    try {
        html = await readFile(HOME_HTML, "utf8")
    } catch (error) {
        response.writeHead(500, { "Content-Type": "text/plain" });
        return response.end("Error Loading Homepage")

    }

    //changes the user pfp to match the current user
    html = html.replace("{{PROFILE_PIC_URL}}", user.profilePicture);

    //TODO
    //change this logic with the logic used to reveal/hide button yang admin only
    if (user.role === "admin") {
        html = html.replace("{{ADMIN_BUTTON}}", "<button>Manage Users</button>")
    } else {
        html = html.replace("{{ADMIN_BUTTON}}", "")
    }

    response.writeHead(200, {
        "Content-Type": "text/html",
        // "Transfer-Encoding": "chunked"
    })
    response.end(html);
}
