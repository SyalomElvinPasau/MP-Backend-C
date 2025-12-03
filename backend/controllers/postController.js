import { readFile } from "fs/promises";
import { getUserFromCookies } from "../utils/cookies.js";


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

}