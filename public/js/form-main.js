const emailInput = document.getElementById('email');
const submitbtn = document.getElementById('submit');

submitbtn.onclick = (e) => {
    e.preventDefault();
    let obj = {
        email: emailInput.value
    }
    console.log(obj.email);
    axios.post('http://35.173.198.167:3000/password/forgotPassword', obj)
        .then((response) => {
            alert(response.data.message);
        }).catch(err => {
            console.log(err);
            alert(err.response.data.message);
        })
}
