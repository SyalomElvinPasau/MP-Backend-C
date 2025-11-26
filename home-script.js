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
