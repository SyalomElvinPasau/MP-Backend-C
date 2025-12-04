import { readFile } from "fs/promises";
import { getUserFromCookies } from "../utils/cookies.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readJSON, writeJSON } from "../utils/json.js";
import formidable from "formidable";
import fs from "fs";
import { generateSessionId } from "../utils/helpers.js";



const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const COMMENT_HTML = join(__dirname, "../../frontend/compose-comment.html");
const POSTS_JSON = join(__dirname, "../../data/posts.json");
const USERS_JSON = join(__dirname, "../../data/users.json");

const uploadDir = join(__dirname, "../../frontend/uploads");

//TODO
//Implement data rendering logic
export async function renderCommentPage(request, response, postId) {
    const user = await getUserFromCookies(request);
    if (!user) {
        response.writeHead(302, { Location: "/login" });
        return response.end();
    }

    let html;
    try {
        html = await readFile(COMMENT_HTML, "utf8");
    } catch (error) {
        response.writeHead(500, { "Content-Type": "text/plain" });
        return response.end("Error Loading Comments");
    }

    const posts = await readJSON(POSTS_JSON);
    const users = await readJSON(USERS_JSON);


    const post = posts.find(p => p.id === postId);
    if (!post) {
        response.writeHead(404, { "Content-Type": "text/plain" });
        return response.end("Post not found");
    }


    //post.likes.find(u => u.id === u)

    const postUser = users.find(u => u.id === post.userId);

    // Render all comments
    const commentsHTML = post.comments.map(comment => {
        const commentUser = users.find(u => u.id === comment.userId);


        return `
            <div class="comment-item">
                <div class="comment-user">
                    <img class="comment-profile" src="/icon/profile.png">
                    <p class="comment-username">${commentUser?.username || "Unknown User"}</p>
                </div>
                <p class="comment-content">${comment.content}</p>
                ${comment.imgUrl ? `<img src="${comment.imgUrl}">` : ""}
            </div>
        `;
    }).join("");

    const liked = post.likes.some(u => u.id === user.id);
    // sections
    const postsHTML = `
            <article class="post">
                <div class="username">
                    <img class="profile-pic" src="icon/profile.png">
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
                </div>
            </article>
        `;

    const allCommentsHTML = `
            <section class="comments-section">
                <h3>Comments</h3>
                ${commentsHTML || "<p>No comments yet.</p>"}
            </section>
        `;

    const commentFormHTML = `
            <form id="commentForm"
                class="comment-form"
                method="POST"
                enctype="multipart/form-data"
                action="/submit-comment?postId=${postId}">

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
    html = html.replace("{{POST}}", postsHTML);
    html = html.replace("{{COMMENTS}}", allCommentsHTML);
    html = html.replace("{{FORM}}", commentFormHTML);

    if (user.role === "admin") {
        html = html.replace("{{ADMIN_BUTTON}}", `



        <a href="/user-list" class="menu-item user-list">


        <img class="menu-logo" src="/icon/user-list.png" alt="User-List">


        <p>User List</p>


    </a>`)

    } else {
        html = html.replace("{{ADMIN_BUTTON}}", "");
    }

    response.writeHead(200, { "Content-Type": "text/html" });
    response.end(html);
}


export async function createNewPost(request, response) {
    const form = formidable({
        multiples: false,
        uploadDir: uploadDir,
        keepExtensions: true,
        allowEmptyFiles: true,   // optional upload
        minFileSize: 0
    });

    form.parse(request, async (err, fields, files) => {

        if (err) {
            response.writeHead(400);
            return response.end("Error parsing form");
        }

        let rawText = fields.text;
        let text = "";

        if (Array.isArray(rawText)) {
            text = rawText[0]?.trim() || "";
        } else if (typeof rawText === "string") {
            text = rawText.trim();
        } else {
            text = "";
        }

        let imgFile = null;

        if (files.image) {
            let f = Array.isArray(files.image) ? files.image[0] : files.image;

            // If size > 0, it's a real file
            if (f.size > 0) {
                imgFile = f;
            } else {
                // delete empty auto-created file
                try { fs.unlinkSync(f.filepath); } catch { }
            }
        }

        const imgUrl = imgFile ? `/uploads/${imgFile.newFilename}` : null;


        // Read DB
        const posts = await readJSON(POSTS_JSON);

        // Logged in user
        const user = await getUserFromCookies(request);
        if (!user) {
            response.writeHead(401);
            return response.end("Unauthorized");
        }


        const postId = generateSessionId();
        const newPost = {
            id: "p" + postId,   // string
            userId: user.id,           // string
            content: text,             // string
            imgUrl: imgUrl,             // string | null
            likes: [],
            comments: []
        };

        // Insert new post
        posts.push(newPost);

        // Save JSON
        await writeJSON(POSTS_JSON, posts);

        // Redirect back to comment page
        response.writeHead(302, {
            Location: `/`
        });
        return response.end();
    })
}


export async function createNewComment(request, response, postId) {
    const form = formidable({
        multiples: false,
        uploadDir: uploadDir,
        keepExtensions: true,
        allowEmptyFiles: true,   // optional upload
        minFileSize: 0
    });

    form.parse(request, async (err, fields, files) => {

        if (err) {
            response.writeHead(400);
            return response.end("Error parsing form");
        }

        if (!postId) {
            response.writeHead(400);
            return response.end("Missing postId");
        }

        let rawText = fields.text;
        let text = "";

        if (Array.isArray(rawText)) {
            text = rawText[0]?.trim() || "";
        } else if (typeof rawText === "string") {
            text = rawText.trim();
        } else {
            text = "";
        }

        // Image file handling
        let imgFile = null;


        if (files.image) {
            let f = Array.isArray(files.image) ? files.image[0] : files.image;

            // If size > 0, it's a real file
            if (f.size > 0) {
                imgFile = f;
            } else {
                try { fs.unlinkSync(f.filepath); } catch { }
            }
        }

        const imgUrl = imgFile ? `/uploads/${imgFile.newFilename}` : null;


        // Read DB
        const posts = await readJSON(POSTS_JSON);

        const post = posts.find(p => p.id === postId);
        if (!post) {
            response.writeHead(404);
            return response.end("Post not found");
        }

        // Logged in user
        const user = await getUserFromCookies(request);
        if (!user) {
            response.writeHead(401);
            return response.end("Unauthorized");
        }

        // FINAL comment shape (matches JSON)
        const newComment = {
            id: "c" + (post.comments.length + 1),   // string
            userId: user.id,           // string
            content: text,             // string
            imgUrl: imgUrl             // string | null
        };

        // Insert new comment
        post.comments.push(newComment);

        // Save JSON
        await writeJSON(POSTS_JSON, posts);

        // Redirect back to comment page
        response.writeHead(302, {
            Location: `/compose-comment?postId=${postId}`
        });
        return response.end();
    });
}

export async function likePost(request, response) {
    const user = await getUserFromCookies(request);
    if (!user) {
        response.writeHead(302, { Location: "/login" });
        return response.end();
    }

    const url = new URL(request.url, `http://${request.headers.host}`);
    const postId = url.searchParams.get('postId');

    const posts = await readJSON(POSTS_JSON);
    const post = posts.find(p => p.id === postId);

    if (!post) {
        response.writeHead(404, { "Content-Type": "text/plain" });
        return response.end("Post not found");
    }

    const likedIndex = post.likes.findIndex(u => u.id === user.id);

    let liked;
    if (likedIndex !== -1) {

        post.likes.splice(likedIndex, 1);
        liked = false;
    } else {

        post.likes.push({ id: user.id, name: user.name });
        liked = true;
    }

    await writeJSON(POSTS_JSON, posts);
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify({ likes: post.likes.length, liked }));
}

export async function deletePost(request, response) {
    const url = new URL(request.url, `http://${request.headers.host}`);
    const postId = url.searchParams.get("id");

    if (!postId) {
        response.writeHead(400);
        return response.end("Missing ID");
    }

    const user = await getUserFromCookies(request);
    if (!user) {
        response.writeHead(403);
        return response.end("Not authorized");
    }

    const posts = await readJSON(POSTS_JSON);
    const post = posts.find(p => p.id === postId);

    if (!post) {
        response.writeHead(404);
        return response.end("Post not found");
    }

    //Only poster or admin
    if (user.role !== "admin" && user.id !== post.userId) {
        response.writeHead(403);
        return response.end("Not allowed");
    }

    //posts.splice(postId, 1);
    const updated = posts.filter(p => p.id !== postId);
    await writeJSON(POSTS_JSON, updated);

    response.writeHead(200)
    response.end("Deleted");
}