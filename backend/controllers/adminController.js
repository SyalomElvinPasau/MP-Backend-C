import { readFile } from "fs/promises";
import { getUserFromCookies } from "../utils/cookies.js";

//TODO
//Implement data rendering logic
export async function renderUserListPage(request, response) {
    const user = await getUserFromCookies(request);

    //checking permission
    if (!user || user.role !== "admin") {
        response.writeHead(302, { Location: "/" });
        return response.end();
    }

    let html;

    try {
        html = await readFile("../../frontend/user-list.html", "utf8")
    } catch (error) {
        response.writeHead(500, { "Content-Type": "text/plain" });
        return response.end("Error Loading Page")

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
// Parse the POST body for userId
// Load users.json
// Remove the user
// Save the file
// Redirect back to /user-list
export async function deleteAccount(request, response) {

}