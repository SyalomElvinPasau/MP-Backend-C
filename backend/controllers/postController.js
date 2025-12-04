import { readFile } from "fs/promises";
import { getUserFromCookies } from "../utils/cookies.js";
import { readJSON, writeJSON } from "../utils/json.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const POSTS_JSON = join(__dirname, "../../data/posts.json");


//TODO
//Implement data rendering logic
export async function renderCommentPage(request, response) {
    const user = await getUserFromCookies(request);

    let html;

    try {
        html = await readFile("../../frontend/compose-comment.html", "utf8")
    } catch (error) {
        response.writeHead(500, { "Content-Type": "text/plain" });
        return response.end("Error Loading Homepage")

    }

    //changes the user pfp to match the current user
    html = html.replace("{{PROFILE_PIC_URL}}", user.profilePicture);

    response.writeHead(200, {
        "Content-Type": "text/html",
        // "Transfer-Encoding": "chunked"
    })
    response.end(html);
}

//TODO
//implement function
export async function createNewPost(request, response) {

}

//TODO
//implement function
export async function createNewComment(request, response) {

}

//TODO
//implement liking a post logics
export async function likePost(request, response) {

}

//TODO
//implement delete post logics
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

    // Security: Only owner or admin
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

// export async function deletePost(request, response) {
//     console.log("DELETE request received:", request.url);

//     const url = new URL(request.url, `http://${request.headers.host}`);
//     const postId = url.searchParams.get("id");

//     console.log("postId from URL:", postId);

//     if (!postId) {
//         response.writeHead(400);
//         return response.end("Missing ID");
//     }

//     const posts = await readJSON(POSTS_JSON);
//     console.log("Available post IDs:", posts.map(p => p.id));

//     const post = posts.find(p => p.id === postId);

//     if (!post) {
//         response.writeHead(404);
//         return response.end("Post not found");
//     }

//     response.writeHead(200);
//     response.end("Found post");
// }
