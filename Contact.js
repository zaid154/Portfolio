let email = document.querySelector('#email_img');
let link = document.querySelector('#link');
let git = document.querySelector('#git');
let enter_email = document.querySelector('#enter_email');
let message = document.querySelector('#message');
let mobile = document.querySelector('#mobile');

const form = document.getElementById("contactForm");
const successMsg = document.getElementById("successMsg");


email.addEventListener('click', () => {
    window.open("mailto:zaidm1323@gmail.com");
});

link.addEventListener('click', () => {
    window.open("https://www.linkedin.com/in/mohd-zaid-794090231", "_blank");
});

git.addEventListener('click', () => {
    window.open("https://github.com/zaid-bca", "_blank");
});


mobile.addEventListener("input", () => {
    mobile.value = mobile.value.replace(/[^0-9]/g, "");
});

form.addEventListener("submit", async function (e) {
    e.preventDefault();

    if (enter_email.value === "" || mobile.value === "") {
        alert("Email and Mobile are compulsory");
        return;
    }

    const formData = new FormData(form);

    try {
        const response = await fetch(form.action, {
            method: "POST",
            body: formData,
            headers: {
                "Accept": "application/json"
            }
        });

if (response.ok) {
    form.reset();

    successMsg.classList.add("show");
    
    setTimeout(() => {
        successMsg.classList.remove("show");
    }, 10000);
}

        else {
            alert("Something went wrong. Please try again.");
        }
    } catch (error) {
        alert("Network error. Please check your internet connection.");
    }
});
