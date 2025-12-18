import { readFile } from "fs/promises";
import { getUserFromCookies } from "../utils/cookies.js";
import { fileURLToPath } from "url";
import path, { dirname, join } from "path";
import { readJSON, writeJSON } from "../utils/json.js";
import { generateId } from "../utils/helpers.js";
import { optimizeUserImage } from "../utils/imageOptimizer.js";
import formidable from "formidable";
import fs from "fs";
import { generateSessionId } from "../utils/helpers.js";



const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const COMMENT_HTML = join(__dirname, "../../frontend/compose-comment.html");
const POSTS_JSON = join(__dirname, "../../data/posts.json");
const USERS_JSON = join(__dirname, "../../data/users.json");

const uploadDir = join(__dirname, "../../frontend/uploads");

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


//TODO
//Implement data rendering logic
// export async function renderCommentPage(request, response, postId) {
//     const user = await getUserFromCookies(request);
//     if (!user) {
//         response.writeHead(302, { Location: "/login" });
//         return response.end();
//     }

//     let html;
//     try {
//         html = await readFile(COMMENT_HTML, "utf8");
//     } catch (error) {
//         response.writeHead(500, { "Content-Type": "text/plain" });
//         return response.end("Error Loading Comments");
//     }

//     const posts = await readJSON(POSTS_JSON);
//     const users = await readJSON(USERS_JSON);


//     const post = posts.find(p => p.id === postId);
//     if (!post) {
//         response.writeHead(404, { "Content-Type": "text/plain" });
//         return response.end("Post not found");
//     }


//     //post.likes.find(u => u.id === u)

//     const postUser = users.find(u => u.id === post.userId);

//     // Render all comments
//     const commentsHTML = post.comments.map(comment => {
//         const commentUser = users.find(u => u.id === comment.userId);


//         return `
//             <div class="comment-item">
//                 <div class="comment-user">
//                     <img class="comment-profile" src="/icon/profile.png">
//                     <p class="comment-username">${commentUser?.username || "Unknown User"}</p>
//                 </div>
//                 <p class="comment-content">${comment.content}</p>
//                 ${comment.imgUrl ? `<img src="${comment.imgUrl}">` : ""}
//             </div>
//         `;
//     }).join("");

//     const liked = post.likes.some(u => u.id === user.id);
//     // sections
//     const postsHTML = `
//             <article class="post">
//                 <div class="username">
//                     <img class="profile-pic" src="icon/profile.png">
//                     <p>${postUser?.username || "Unknown User"}</p>
//                 </div>

//                 <div class="posted-content">
//                     <p class="caption">${post.content}</p>
//                     ${post.imgUrl ? `<img src="${post.imgUrl}">` : ""}
//                 </div>

//                 <div class="activity">
//                     <div class="like">
//                         <img src="${liked ? '/icon/heart-filled.png' : '/icon/heart.png'}" class="like-btn" data-post-id="${post.id}">
//                         <p>${post.likes.length}</p>
//                     </div>
//                 </div>
//             </article>
//         `;

//     const allCommentsHTML = `
//             <section class="comments-section">
//                 <h3>Comments</h3>
//                 ${commentsHTML || "<p>No comments yet.</p>"}
//             </section>
//         `;

//     const commentFormHTML = `
//             <form id="commentForm"
//                 class="comment-form"
//                 method="POST"
//                 enctype="multipart/form-data"
//                 action="/submit-comment?postId=${postId}">

//                 <div class="form-header">
//                     <p class="caption">Compose Comment:</p>
//                 </div>

//                 <!-- text -->
//                 <textarea id="text" name="text" placeholder="Write a comment..." maxlength="1000"></textarea>

//                 <!-- img preview -->
//                 <img id="preview" class="image-preview" style="display:none;">

//                 <!-- img upload -->
//                 <input id="image" name="image" type="file" accept="image/*">

//                 <div class="actions">
//                     <button id="submitBtn" type="submit" class="btn pill">
//                         Publish Comment
//                     </button>

//                     <button id="clearBtn" type="button" class="btn pill ghost">
//                         Clear Form
//                     </button>
//                 </div>
//             </form>
//         `;
//     html = html.replace("{{POST}}", postsHTML);
//     html = html.replace("{{COMMENTS}}", allCommentsHTML);
//     html = html.replace("{{FORM}}", commentFormHTML);

//     if (user.role === "admin") {
//         html = html.replace("{{ADMIN_BUTTON}}", `



//         <a href="/user-list" class="menu-item user-list">


//         <img class="menu-logo" src="/icon/user-list.png" alt="User-List">


//         <p>User List</p>


//     </a>`)

//     } else {
//         html = html.replace("{{ADMIN_BUTTON}}", "");
//     }

//     response.writeHead(200, { "Content-Type": "text/html" });
//     response.end(html);
// }
export async function renderCommentPage(request, response, postId) {
    const user = await getUserFromCookies(request);
    if (!user) {
        response.writeHead(302, { Location: "/login" });
        return response.end();
    }

    // Read HTML template
    let html;
    try {
        html = await readFile(COMMENT_HTML, "utf8");
    } catch (error) {
        response.writeHead(500, { "Content-Type": "text/plain" });
        return response.end("Error Loading Comments");
    }

    // Load data
    const posts = await readJSON(POSTS_JSON);
    const users = await readJSON(USERS_JSON);

    const post = posts.find(p => p.id === postId);
    if (!post) {
        response.writeHead(404, { "Content-Type": "text/plain" });
        return response.end("Post not found");
    }

    const postUser = users.find(u => u.id === post.userId);
    const liked = post.likes.some(u => u.id === user.id);

    const [beforeComments, afterComments] = html.split("{{COMMENTS}}");

    if (!afterComments) {
        throw new Error("Template missing {{COMMENTS}} placeholder");
    }


    // Render main post HTML
    const postHTML = `
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
                    <img src="${liked ? '/icon/heart-filled.png' : '/icon/heart.png'}"
                         class="like-btn"
                         data-post-id="${post.id}">
                    <p>${post.likes.length}</p>
                </div>
            </div>
        </article>
    `;

    // Comment form HTML
    const commentFormHTML = `
        <form id="commentForm"
            class="comment-form"
            method="POST"
            enctype="multipart/form-data"
            action="/submit-comment?postId=${postId}">

            <div class="form-header">
                <p class="caption">Compose Comment:</p>
            </div>

            <textarea id="text" name="text" placeholder="Write a comment..." maxlength="1000"></textarea>

            <img id="preview" class="image-preview" style="display:none;">

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

    // Insert main post and form into header section
    let headerHTML = beforeComments
        .replace("{{POST}}", postHTML)
        .replace("{{FORM}}", commentFormHTML);

    // Insert admin button
    if (user.role === "admin") {
        headerHTML = headerHTML.replace("{{ADMIN_BUTTON}}", `
            <a href="/user-list" class="menu-item user-list">
                <img class="menu-logo" src="/icon/user-list.png" alt="User-List">
                <p>User List</p>
            </a>
        `);
    } else {
        headerHTML = headerHTML.replace("{{ADMIN_BUTTON}}", "");
    }


    response.writeHead(200, { "Content-Type": "text/html" });

    // 1) Send header + post + opening of comments section
    response.write(headerHTML);

    response.write(`
        <section class="comments-section">
            <h3>Comments</h3>
    `);

    // 2) Stream each comment independently
    if (post.comments.length === 0) {
        response.write(`<p>No comments yet.</p>`);
    } else {
        for (const comment of post.comments) {
            const commentUser = users.find(u => u.id === comment.userId);

            const commentChunk = `
                <div class="comment-item">
                    <div class="comment-user">
                        <img class="comment-profile" src="/icon/profile.png">
                        <p class="comment-username">${commentUser?.username || "Unknown User"}</p>
                    </div>
                    <p class="comment-content">${comment.content}</p>
                    ${comment.imgUrl ? `<img src="${comment.imgUrl}">` : ""}
                </div>
            `;

            // Send chunk
            // await sleep(500);
            response.write(commentChunk);
        }
    }

    response.end(`
        </section>
        ${afterComments}
    `);
}

export async function createNewPost(request, response) {
    const user = await getUserFromCookies(request);
    if (!user) {
        response.writeHead(302, { Location: "/login" });
        return response.end();
    }

    const form = formidable({
        multiples: false,
        uploadDir: uploadDir,
        allowEmptyFiles: true,
        minFileSize: 0,
    });

    form.parse(request, async (err, fields, files) => {
        if (err) {
            response.writeHead(400);
            return response.end("Error parsing form");
        }

        const rawText = fields.text;
        const text = Array.isArray(rawText) ? rawText[0]?.trim() : (rawText?.trim() || "");

        const uploadedFile = files.image ? (Array.isArray(files.image) ? files.image[0] : files.image) : null;
        
        let imgUrl = null;

        if (uploadedFile && uploadedFile.size > 0) {
            try {
                const posts = await readJSON(POSTS_JSON);
                const uniqueID = generateId(posts); 
                const finalFileName = `post_${uniqueID}.webp`;

                const optimizedFileName = await optimizeUserImage(uploadedFile.filepath, finalFileName, uploadDir);

                if (optimizedFileName) {
                    imgUrl = `/uploads/${optimizedFileName}`;
                }
                
                if (fs.existsSync(uploadedFile.filepath)) {
                    fs.unlinkSync(uploadedFile.filepath);
                }
            } catch (optErr) {
                console.error("Gagal optimasi:", optErr);
            }
        } else if (uploadedFile) {
            if (fs.existsSync(uploadedFile.filepath)) fs.unlinkSync(uploadedFile.filepath);
        }

        const posts = await readJSON(POSTS_JSON);
        const postId = generateSessionId();
        const newPost = {
            id: "p" + postId,
            userId: user.id,
            content: text,
            imgUrl: imgUrl,
            likes: [],
            comments: []
        };

        posts.push(newPost);
        await writeJSON(POSTS_JSON, posts);

        response.writeHead(302, { Location: `/` });
        return response.end();
    });
}

export async function createNewComment(request, response, postId) {
    const form = formidable({
        multiples: false,
        uploadDir: uploadDir,
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
            if (f.size > 0) {
                imgFile = f;
            } else {
                try { fs.unlinkSync(f.filepath); } catch { }
            }
        }

        if (files.image) {
            let f = Array.isArray(files.image) ? files.image[0] : files.image;

            // If size > 0, it's a real file
            if (f.size > 0) {
                imgFile = f;
            } else {
                try { fs.unlinkSync(f.filepath); } catch { }
            }
        }

        let imgUrl = null;
        
        if (imgFile) {
            const posts = await readJSON(POSTS_JSON);
            const post = posts.find(p => p.id === postId);

            // Jika post ditemukan, gunakan jumlah komentar untuk ID unik
            const commentCount = post ? post.comments.length + 1 : Date.now(); 
            const finalFileName = `comment_${postId}_${commentCount}.webp`; // Simpan sebagai WEBP
            
            // Panggil fungsi optimasi
            const optimizedFileName = await optimizeUserImage(imgFile.filepath, finalFileName, uploadDir);

            if (optimizedFileName) {
                imgUrl = `/uploads/${optimizedFileName}`;
            } else {
                console.warn("Optimasi gambar komentar gagal, komentar dibuat tanpa gambar.");
                imgUrl = null;
            }
        }

        // Read DB
        const posts = await readJSON(POSTS_JSON);

        const post = posts.find(p => p.id === postId);
        if (!post) {
            if (imgUrl) {
                 try { fs.unlinkSync(path.join(uploadDir, imgUrl.replace('/uploads/', ''))); } catch (e) { }
            }

            response.writeHead(404);
            return response.end("Post not found");
        }

        // Logged in user
        const user = await getUserFromCookies(request);
        if (!user) {
            response.writeHead(401);
            return response.end("Unauthorized");
        }

        // Cek jika teks dan gambar kosong
        if (!text && !imgUrl) {
             response.writeHead(400);
             return response.end("Comment content or image is required");
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