const form = document.getElementById('signupForm');
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const errorMsg = document.querySelector('.error-msg');

form.addEventListener('submit', addUser);

function addUser(e) {
    e.preventDefault();
    if(usernameInput.value==='' || emailInput.value==='' || passwordInput.value===''){
        //msg.classList.add('error');
        showErrorOnScreen('Please enter all fields!')
        console.log('Please enter all fields');
    } 
    else {
        let userDetails = {
            username: usernameInput.value,
            email: emailInput.value,
            password: password.value
        }

        axios.post('http://35.173.198.167:3000/signup', userDetails)
            .then(response => {
                alert(response.data.message);
            })
            .catch(err => {
                //alert(err.response.data.message);
                showErrorOnScreen(err.response.data.message);
            })

        usernameInput.value = '';
        emailInput.value = '';
        passwordInput.value = '';
    }
}

function showErrorOnScreen(msg) {
    //console.log(msg);
    errorMsg.innerHTML = `<p> ${msg} </p>`
    setTimeout(() => errorMsg.remove(), 3000);
}