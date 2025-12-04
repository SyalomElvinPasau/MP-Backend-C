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

// pindah page comment
const items = document.querySelectorAll(".comment");

items.forEach(el => {
    el.addEventListener("click", () => {
        window.location.href = "compose-comment.html";
    });
})


document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("delete-btn")) {
        const postId = e.target.dataset.id;

        await fetch(`/delete-post?id=${postId}`, { method: "DELETE" });

        location.reload();
    }
});
