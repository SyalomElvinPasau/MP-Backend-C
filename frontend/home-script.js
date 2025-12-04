const profileIcon = document.getElementById("profile");
const profileMenu = document.getElementById("profileMenu");
const closeProfileMenu = document.getElementById("closeProfileMenu");

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
