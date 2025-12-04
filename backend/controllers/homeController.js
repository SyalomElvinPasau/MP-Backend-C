import { readFile } from "fs/promises";
import { getUserFromCookies } from "../utils/cookies.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readJSON } from "../utils/json.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const HOME_HTML = join(__dirname, "../../frontend/home.html");
const POSTS_JSON = join(__dirname, "../../data/posts.json");
const USERS_JSON = join(__dirname, "../../data/users.json");

export async function renderHomePage(request, response) {
    const user = await getUserFromCookies(request);
    if (!user) {
        response.writeHead(302, { Location: "/login" });
        return response.end();
    }

    let html;
    try {
        html = await readFile(HOME_HTML, "utf8");
    } catch (error) {
        response.writeHead(500, { "Content-Type": "text/plain" });
        return response.end("Error Loading Homepage");
    }

    const posts = await readJSON(POSTS_JSON);

    const users = await readJSON(USERS_JSON);

    const postsHTML = posts.map(post => {
        const postUser = users.find(u => u.id === post.userId);

        return `
            <article class="post">
                <div class="username">
                    <img class="profile-pic" src="${postUser?.profilePicture || "/icon/profile.png"}">
                    <p>${postUser?.username || "Unknown User"}</p>
                </div>

                <div class="posted-content">
                    <p class="caption">${post.content}</p>
                    ${post.imgUrl ? `<img src="${post.imgUrl}">` : ""}
                </div>

                <div class="activity">
                    <div class="like">
                        <img src="/icon/heart.png">
                        <p>${post.likes.length}</p>
                    </div>

                    <div class="comment">
                        <img src="/icon/comment.png">
                        <p>${post.comments.length}</p>
                    </div>
                </div>
            </article>
        `;
    }).join("");

    html = html.replace("{{POSTS}}", postsHTML);

    if (user.role === "admin") {
        html = html.replace("{{ADMIN_BUTTON}}", `
        <a href="/user-list" class="menu-item user-list">
        <img class="menu-logo" src="/icon/user-list.png" alt="User-List">
        <p>User List</p>
    </a>
        `);
    } else {
        html = html.replace("{{ADMIN_BUTTON}}", "");
    }

    response.writeHead(200, {
        "Content-Type": "text/html",
        "Cache-Control": "no-store"

    });
    response.end(html);
}
