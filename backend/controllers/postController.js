import { readFile } from "fs/promises";
import { getUserFromCookies } from "../utils/cookies.js";
import formidable from "formidable";
import { readJSON, writeJSON } from "../utils/json.js";
import { generateId } from "../utils/helpers.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

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

    const form = formidable({
        multiples: false,
        uploadDir: uploadDir,
        keepExtensions: true,
        allowEmptyFiles: true,
        minFileSize: 0,
        filename: (name, ext, part, form) => {
            return `${Date.now()}-${part.originalFilename}`; 
        }
    });

    form.parse(request, async (err, fields, files) => {
        if (err) {
            console.error("Form parsing error:", err);
            response.writeHead(400, { "Content-Type": "application/json" });
            return response.end(JSON.stringify({ message: "Error parsing form data" }));
        }

        try {
            let rawContent = fields.content; 
            let content = "";

            if (Array.isArray(rawContent)) {
                content = rawContent[0]?.trim() || "";
            } else if (typeof rawContent === "string") {
                content = rawContent.trim();
            }

            let imgFile = null;
            if (files.image) {
                let f = Array.isArray(files.image) ? files.image[0] : files.image;
                
                if (f.size > 0) {
                    imgFile = f;
                } else {
                    try { fs.unlinkSync(f.filepath); } catch (e) { }
                }
            }

            const imgUrl = imgFile ? `/uploads/${imgFile.newFilename}` : "";

            if (!content && !imgUrl) {
                response.writeHead(400, { "Content-Type": "application/json" });
                return response.end(JSON.stringify({ message: "Post content or image is required" }));
            }

            // --- D. UPDATE DATABASE ---
            const jsonData = await readJSON("../data/posts.json");
            const newId = generateId(jsonData);

            const newData = {
                id: newId,
                userId: user.id,
                content: content,
                imgUrl: imgUrl, 
                likes: [],
                comments: []    
            }

            console.log("Creating new post:", newData);

            jsonData.unshift(newData);
            await writeJSON("../data/posts.json", jsonData);

            response.writeHead(201, { "Content-Type": "application/json" });
            return response.end(JSON.stringify({ 
                message: "Post created successfully",
                data: newData
            }));

        } catch (error) {
            console.error("Error inside createNewPost:", error);
            response.writeHead(500, { "Content-Type": "application/json" });
            return response.end(JSON.stringify({ message: "Error creating post" }));
        }
    });

}

//TODO
//implement function
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

        // if (files.image) {
        //     if (Array.isArray(files.image) && files.image.length > 0) {
        //         imgFile = files.image[0];
        //     } else if (files.image.filepath) {
        //         imgFile = files.image;
        //     }
        // }

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

//TODO
//implement liking a post logics
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