import { renderLoginPage, login, logout } from "./controllers/authController.js"
import { renderUserListPage, deleteAccount } from "./controllers/adminController.js"
import { renderCommentPage, createNewPost, createNewComment, likePost, deletePost } from "./controllers/postController.js"
import { renderHomePage } from "./controllers/homeController.js"
import { readFile } from "fs/promises";
import { join, extname } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MIME_TYPES = {
    ".css": "text/css",
    ".js": "application/javascript",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml"
};


export async function handle(request, response) {
    const method = request.method;
    // const path = request.url;

    //debugging
    // console.log("Request URL:", request.url, " and Method: ", method);

    const fullUrl = new URL(request.url, `http://${request.headers.host}`);
    const path = fullUrl.pathname;
    const searchParams = fullUrl.searchParams;

    const ext = extname(path);
    if (MIME_TYPES[ext]) {
        try {
            const filePath = join(__dirname, "../frontend", path);
            const content = await readFile(filePath);
            response.writeHead(200, { "Content-Type": MIME_TYPES[ext] });
            return response.end(content);
        } catch (err) {
            response.writeHead(404, { "Content-Type": "text/plain" });
            return response.end("File Not Found");
        }
    }

    if (method === "GET" && path === "/") {              //User going to homepage
        return renderHomePage(request, response);

    } else if (method === "GET" && path === "/compose-comment") {   //User going to compose comment page
        const postId = searchParams.get("postId");

        return renderCommentPage(request, response, postId);

    } else if (method === "GET" && path === "/login") {      //User going to login page
        return renderLoginPage(request, response);

    } else if (method === "GET" && path === "/user-list") {  //Admin going to user-list page
        return renderUserListPage(request, response);

    } else if (method === "POST" && path === "/login") {            //User Logging in
        return login(request, response);

    } else if (method === "GET" && path === "/logout") {             //User logging out
        return logout(request, response);

    } else if (method === "POST" && path === "/create-post") {      //user Creates a new post
        return createNewPost(request, response);

    } else if (method === "POST" && path === "/submit-comment") {  //user creates a new comment on a post
        const postId = searchParams.get("postId");

        return createNewComment(request, response, postId);

    } else if (method === "POST" && path === "/delete-user") {      //admin deletes a user's account
        return deleteAccount(request, response);

    } else if (method === "POST" && path === "/delete-post") {       //admin deletes another user's post || user delete their own post
        return deletePost(request, response);

    } else if (method === "POST" && path === "/like-post") {         //User likes a post
        return likePost(request, response);
    }

    // 404 if no route found
    response.writeHead(404, { "Content-Type": "text/plain" });
    return response.end("404 Not Found");
}