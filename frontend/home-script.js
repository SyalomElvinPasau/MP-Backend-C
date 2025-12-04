const profileIcon = document.getElementById("profile");
const profileMenu = document.getElementById("profileMenu");
const closeProfileMenu = document.getElementById("closeProfileMenu");
const postButton = document.getElementById("postButton");

postButton.addEventListener("click", () => {
    const textArea = document.getElementById("textArea");
    const addPhoto = document.getElementById("addPhoto");
    const postContent = {
        content: textArea.value,
        imgUrl: addPhoto.files[0] ? addPhoto.files[0].name : null
    };
    fetch("/create-post", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(postContent)
    }).then(response => response.json())
    .then(data => {
        console.log("Post created successfully:", data);
        window.location.reload();
    })
    .catch(error => {
        console.error("Error creating post:", error);
    });
});

profileIcon.addEventListener("click", () => {
    profileMenu.classList.remove("closed");
    console.log("clicked")
});

closeProfileMenu.addEventListener("click", () => {
    profileMenu.classList.add("closed");
});

const items = document.querySelectorAll(".comment");

items.forEach(el => {
    el.addEventListener("click", () => {
        window.location.href = "compose-comment.html";
    });
})

document.addEventListener("click", async (e) => {
    // Look for delete-btn, even if clicked on child img
    const btn = e.target.closest(".delete-btn");
    if (!btn) return;

    const postId = btn.dataset.id;
    if (!postId) return console.log("No postId found on button");

    try {
        const res = await fetch(`/delete-post?id=${postId}`, { method: "DELETE" });
        if (res.ok) {
            // Remove post element from DOM
            const postEl = btn.closest(".post");
            if (postEl) postEl.remove();
        } else {
            const text = await res.text();
            alert(`Failed to delete post: ${text}`);
        }
    } catch (err) {
        console.error(err);
        alert("Error deleting post");
    }


});


document.addEventListener('DOMContentLoaded', () => {

    document.querySelectorAll('.like-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const postId = e.target.dataset.postId;
            const response = await fetch(`/like-post?postId=${postId}`, { method: 'POST' });
            const data = await response.json();

            // Toggle heart image
            e.target.src = data.liked ? '/icon/heart-filled.png' : '/icon/heart.png';

            // Update like count
            e.target.nextElementSibling.textContent = data.likes;
        });
    });

});
