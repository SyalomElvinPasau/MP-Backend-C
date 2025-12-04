import { readFile } from "fs/promises";
import { getUserFromCookies } from "../utils/cookies.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readJSON, writeJSON } from "../utils/json.js";
import { parseForm } from "../utils/helpers.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const USER_LIST_HTML = join(__dirname, "../../frontend/user_list.html");
const USERS_JSON = join(__dirname,"../../data/users.json" )

//TODO
//Implement data rendering logic
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
    `).join(""); //tombol admin dinonaktifkan untuk user lain dengan role admin

    let html;

    try {
        html = await readFile(USER_LIST_HTML, "utf8")
    } catch (error) {
        response.writeHead(500, { "Content-Type": "text/plain" });
        return response.end("Error Loading Page")

    }

    //changes the user pfp to match the current user
    html = html.replace("{{PROFILE_PIC_URL}}", user.profilePicture);
    html = html.replace("{{usercard}}", userCards);

    response.writeHead(200, {
        "Content-Type": "text/html",
        // "Transfer-Encoding": "chunked"
    })
    response.end(html);
}



//TODO
// Parse the POST body for userId
// Load users.json
// Remove the user
// Save the file
// Redirect back to /user-list
export async function deleteAccount(request, response) {
    const user = await getUserFromCookies(request);

    // checking permission (Admin-only)
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

        // Pastikan admin tidak menghapus akun mereka sendiri
        if (userIdToDelete === user.id) {
            console.log("Admin attempted to delete own account.");
            response.writeHead(302, { Location: "/user-list" });
            return response.end();
        }

        const users = await readJSON(USERS_JSON);

        // Filter pengguna yang akan dihapus (buat array baru tanpa pengguna tersebut)
        const updatedUsers = users.filter(u => u.id !== userIdToDelete);

        // Simpan file yang diperbarui
        await writeJSON(USERS_JSON, updatedUsers);

        // Redirect kembali ke /user-list
        response.writeHead(302, { Location: "/user-list" });
        response.end();
    });
}