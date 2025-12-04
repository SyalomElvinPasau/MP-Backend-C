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

    const postFormHTML = `
            <form id="commentForm"
                class="comment-form"
                method="POST"
                enctype="multipart/form-data"
                action="/create-post">
                

                <div class="form-header">
                    <p class="caption">Compose Comment:</p>
                </div>

                <!-- text -->
                <textarea id="text" name="text" placeholder="Write a comment..." maxlength="1000"></textarea>

                <!-- img preview -->
                <img id="preview" class="image-preview" style="display:none;">

                <!-- img upload -->
                <input id="image" name="image" type="file" accept="image/*">

                <div class="actions">
                    <button id="submitBtn" type="submit" class="btn pill">
                        Publish Comment
                    </button>

                    <button id="clearBtn" type="button" class="btn pill ghost">
                        Clear Form
                    </button>
                </div>
            </form>
        `;

    const postsHTML = posts.map(post => {
        const postUser = users.find(u => u.id === post.userId);

        const canDelete = (user.role === "admin" || user.id === post.userId);
        const liked = post.likes.some(u => u.id === user.id);

        return `
            <article class="post">
                <div class="username">
                    <img class="profile-pic" src="/icon/profile.png">
                    <p>${postUser?.username || "Unknown User"}</p>
                </div>

                <div class="posted-content">
                    <p class="caption">${post.content}</p>
                    ${post.imgUrl ? `<img src="${post.imgUrl}">` : ""}
                </div>

                <div class="activity">
                    <div class="like">
                    <img src="${liked ? '/icon/heart-filled.png' : '/icon/heart.png'}" class="like-btn" data-post-id="${post.id}">
                    
                        <p>${post.likes.length}</p>
                    </div>

                    <div class="comment">
                        <a href="/compose-comment?postId=${post.id}">
                            <img src="/icon/comment.png" class="comment-button">
                        </a>
                        <p>${post.comments.length}</p>
                    </div>


                    ${canDelete ? `
                    <div class="delete">
                        <img src="/icon/delete.png" class="delete-btn" data-id="${post.id}">
                    </div>
                ` : ""}

                </div>
            </article>
        `;
    }).join("");


    html = html.replace("{{POSTS}}", postsHTML);
    html = html.replace("{{FORM}}", postFormHTML);

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
        "Cache-Control": "no-store"
    });
    response.end(html);
}
