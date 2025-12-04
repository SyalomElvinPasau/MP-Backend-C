
// // image preview
// document.getElementById('image').addEventListener('change', function () {
//     const file = this.files[0];
//     const img = document.getElementById('preview');

//     if (file) {
//         img.src = URL.createObjectURL(file);
//         img.style.display = 'block';
//     } else {
//         img.style.display = 'none';
//     }
// });

// // clear form: remove text + image + file input
// document.getElementById('clearBtn').addEventListener('click', function () {
//     // clear text field
//     document.getElementById('text').value = "";

//     // clear file input
//     const fileInput = document.getElementById('image');
//     fileInput.value = ""; // resets selected picture

//     // hide preview
//     const img = document.getElementById('preview');
//     img.style.display = 'none';
//     img.src = "";
// });

// // submit if there's a text OR image submit
// document.getElementById('commentForm').addEventListener('submit', function (e) {
//     const text = document.getElementById('text').value.trim();
//     const image = document.getElementById('image').files[0];

//     // If BOTH are empty → block submit
//     if (!text && !image) {
//         e.preventDefault();
//         alert("Please enter a comment or upload an image.");
//         return;
//     }

//     // otherwise allow submit
//     // fake-temporary submit redirection for ui prototuype only
//     e.preventDefault();
//     alert("Comment successfully posted.");
//     window.location.href = "home.html";
// });


// // comment box auto expand vertically
// const textarea = document.getElementById("text");

// textarea.addEventListener("input", function () {
//     this.style.height = "auto";          // reset height
//     this.style.height = this.scrollHeight + "px"; // adjust to content
// });

// // gk jadi post comment
// const post = document.querySelector('.post');
// // redirect to home
// post.addEventListener('click', () => {
//     window.location.href = 'home.html'; // change your URL here
// });

document.addEventListener("DOMContentLoaded", () => {

    // img preview
    const imageInput = document.getElementById('image');
    const previewImg = document.getElementById('preview');

    if (imageInput) {
        imageInput.addEventListener('change', () => {
            const file = imageInput.files[0];

            if (file) {
                previewImg.src = URL.createObjectURL(file);
                previewImg.style.display = 'block';
            } else {
                previewImg.style.display = 'none';
                previewImg.src = "";
            }
        });
    }

    // clear form
    const clearBtn = document.getElementById('clearBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            document.getElementById('text').value = "";

            imageInput.value = "";
            previewImg.style.display = "none";
            previewImg.src = "";
        });
    }

    // submit form
    const form = document.getElementById('commentForm');

    if (form) {
        form.addEventListener('submit', (e) => {
            const text = document.getElementById('text').value.trim();
            const imageFile = imageInput.files[0];

            if (!text && !imageFile) {
                e.preventDefault();
                alert("Please enter a comment or upload an image.");
                return;
            }
        });
    }

    // auto expand text
    const textarea = document.getElementById("text");

    if (textarea) {
        textarea.addEventListener("input", function () {
            this.style.height = "auto";
            this.style.height = this.scrollHeight + "px";
        });
    }


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
