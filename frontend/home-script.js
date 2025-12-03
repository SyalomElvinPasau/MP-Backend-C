const profileIcon = document.getElementById("profile");
const profileMenu = document.getElementById("profileMenu");
const closeProfileMenu = document.getElementById("closeProfileMenu");
const divPost = document.getElementById("divPost");
const postButton = document.getElementById("postButton");
const postContent = document.getElementById("newPostContent");

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

postButton.addEventListener("click", () => {
    const captionText = postContent.value;

    if (!captionText) {
        alert("Silakan masukkan konten postingan!");
        return;
    }

    const newArticle = document.createElement("article");
    const usernameDiv = document.createElement("div");
    const profilePic = document.createElement("img");
    const usernameP = document.createElement("p");
    const postedContentDiv = document.createElement("div");
    const newCaption = document.createElement("p");
    const activityDiv = document.createElement("div");
    const likeDiv = document.createElement("div");
    const likeImg = document.createElement("img");
    const likeCount = document.createElement("p");
    const commentDiv = document.createElement("div");
    const commentImg = document.createElement("img");
    const commentCount = document.createElement("p");

    newArticle.className = "post";
    usernameDiv.className = "username";
    profilePic.className = "profile-pic";
    usernameP.textContent = "User New"; 
    postedContentDiv.className = "posted-content";
    newCaption.className = "caption";
    activityDiv.className = "activity";
    likeDiv.className = "like";
    commentDiv.className = "comment";

    profilePic.src = "/icon/profile.png";
    profilePic.alt = "User New";
    newCaption.textContent = captionText;

    likeImg.src = "/icon/heart.png";
    likeCount.textContent = "0";
    commentImg.src = "/icon/comment.png";
    commentCount.textContent = "0";

    usernameDiv.appendChild(profilePic);
    usernameDiv.appendChild(usernameP);

    postedContentDiv.appendChild(newCaption);

    likeDiv.appendChild(likeImg);
    likeDiv.appendChild(likeCount);
    commentDiv.appendChild(commentImg);
    commentDiv.appendChild(commentCount);
    activityDiv.appendChild(likeDiv);
    activityDiv.appendChild(commentDiv);

    newArticle.appendChild(usernameDiv);
    newArticle.appendChild(postedContentDiv);
    newArticle.appendChild(activityDiv);

    divPost.prepend(newArticle);

    postContent.value = "";
});


