import { readFile } from "fs/promises";
import { getUserFromCookies } from "../utils/cookies.js";
import { parseForm } from "../utils/helpers.js";
import { readJSON, writeJSON } from "../utils/json.js";
import { generateId } from "../utils/helpers.js";

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
    const user = await getUserFromCookies(request);
    if (!user) {
        response.writeHead(302, { Location: "/login" });
        return response.end();
    }

    let body = "";
    request.on("data", (chunk) => {
        body += chunk;
    });

    request.on("end", async () => {
        try {
            const postData = JSON.parse(body);
            console.log("New Post Data:", postData);
            const jsonData = await readJSON("../data/posts.json");

            console.log("Current Posts Data:", jsonData);

            const newId = generateId(jsonData);

            if(postData.content === ""){
                throw new Error("Post content is required");
            }

            const newData = {
                id: newId,
                userId: user.id,
                content: postData.content || "",
                imgUrl: "/uploads/"+postData.imgUrl || null,
                likes: [],
                comments: []    
            }

            jsonData.unshift(newData);
            await writeJSON("../data/posts.json", jsonData);

            response.writeHead(201, { "Content-Type": "application/json" });
            response.end(JSON.stringify({ message: "Post created successfully" }));
        } catch (error) {
            console.error("Error creating post:", error);
            response.writeHead(500, { "Content-Type": "application/json" });
            response.end(JSON.stringify({ message: "Error creating post" }));
        }
        
    });

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