import { readFile } from "fs/promises";
import { getUserFromCookies } from "../utils/cookies.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readJSON, writeJSON } from "../utils/json.js";
import { parseForm } from "../utils/helpers.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const USER_LIST_HTML = join(__dirname, "../../frontend/user_list.html");
const USERS_JSON = join(__dirname, "../../data/users.json")


export async function renderUserListPage(request, response) {
    const user = await getUserFromCookies(request);

    //checking permission
    if (!user || user.role !== "admin") {
        response.writeHead(302, { Location: "/" });
        return response.end();
    }

    //baca daftar users
    const users = await readJSON(USERS_JSON);

    //buat html untuk masing masing user
    const userCards = users.map(u => `
        <div class="user-card">
            <img src="icon/user.png" class="profile-pic">
            <p class="name">${u.username}</p>
            <form method="POST" action="/delete-user">
                <input type="hidden" name="userId" value="${u.id}">
                <button type="submit" class="view-btn" ${u.role === 'admin' ? 'disabled' : ''}>
                    <img src="/icon/delete.png" alt=" " style="width: 20px; height: 20px; vertical-align: middle;">
                </button>
            </form>
        </div>
    `).join(""); 

    let html;

    try {
        html = await readFile(USER_LIST_HTML, "utf8")
    } catch (error) {
        response.writeHead(500, { "Content-Type": "text/plain" });
        return response.end("Error Loading Page")

    }

    html = html.replace("{{usercard}}", userCards);

    if (user.role === "admin") {
        html = html.replace("{{ADMIN_BUTTON}}", `



        <a href="/user-list" class="menu-item user-list">


        <img class="menu-logo" src="/icon/user-list.png" alt="User-List">


        <p>User List</p>


    </a>`)

    } else {
        html = html.replace("{{ADMIN_BUTTON}}", "");
    }

    response.writeHead(200, {
        "Content-Type": "text/html",
       
    })
    response.end(html);
}



export async function deleteAccount(request, response) {
    const user = await getUserFromCookies(request);

    // check permission
    if (!user || user.role !== "admin") {
        response.writeHead(302, { Location: "/" });
        return response.end();
    }

    let body = "";

    request.on("data", chunk => {
        body += chunk.toString();
    });

    request.on("end", async () => {
        const form = parseForm(body);
        const userIdToDelete = form.userId;

        // Make sure admin can't delete their own account
        if (userIdToDelete === user.id) {
            console.log("Admin attempted to delete own account.");
            response.writeHead(302, { Location: "/user-list" });
            return response.end();
        }

        const users = await readJSON(USERS_JSON);

        
        const updatedUsers = users.filter(u => u.id !== userIdToDelete);

        await writeJSON(USERS_JSON, updatedUsers);

        response.writeHead(302, { Location: "/user-list" });
        response.end();
    });
}