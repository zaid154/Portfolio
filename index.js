let email = document.querySelector('#email_img');
let link  = document.querySelector('#link');
let git   = document.querySelector('#git');

email.addEventListener('click', () => {
    window.open("mailto:zaidm1323@gmail.com")
});

link.addEventListener('click', () => {
    window.open("https://www.linkedin.com/in/mohd-zaid-794090231")
});

git.addEventListener('click', () => {
    window.open("https://github.com/zaid-bca","_blank")
});
