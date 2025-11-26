
// image preview
document.getElementById('image').addEventListener('change', function () {
    const file = this.files[0];
    const img = document.getElementById('preview');

    if (file) {
        img.src = URL.createObjectURL(file);
        img.style.display = 'block';
    } else {
        img.style.display = 'none';
    }
});

// clear form: remove text + image + file input
document.getElementById('clearBtn').addEventListener('click', function () {
    // clear text field
    document.getElementById('text').value = "";

    // clear file input
    const fileInput = document.getElementById('image');
    fileInput.value = ""; // resets selected picture

    // hide preview
    const img = document.getElementById('preview');
    img.style.display = 'none';
    img.src = "";
});

// submit if there's a text OR image submit
document.getElementById('commentForm').addEventListener('submit', function (e) {
    const text = document.getElementById('text').value.trim();
    const image = document.getElementById('image').files[0];

    // If BOTH are empty → block submit
    if (!text && !image) {
        e.preventDefault();
        alert("Please enter a comment or upload an image.");
        return;
    }

    // otherwise allow submit
    // fake-temporary submit redirection for ui prototuype only
    e.preventDefault();
    alert("Comment successfully posted.");
    window.location.href = "home.html";
});


// comment box auto expand vertically
const textarea = document.getElementById("text");

textarea.addEventListener("input", function () {
    this.style.height = "auto";          // reset height
    this.style.height = this.scrollHeight + "px"; // adjust to content
});