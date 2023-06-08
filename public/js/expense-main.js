//const Razorpay = require('razorpay');

const form = document.getElementById('addForm');
const amountInput = document.getElementById('amount');
const descInput = document.getElementById('description');
const categoryInput = document.getElementById('category');
const expenseList = document.getElementById('expenses');
const pagination = document.getElementById('pagination');

let editFlag = false;
let tempId;

const token = localStorage.getItem('token');

form.addEventListener('submit', addExpense);

function savePageSize(){
    const pageSize = document.getElementById('pageSize');
    localStorage.setItem('rows', pageSize.value);
}

function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

function showPremiumFeatures(isPremiumUser) {
    const premiumDiv = document.getElementById('premiumDiv');
    if(isPremiumUser === true){
        premiumDiv.innerHTML = `<p><b>You're a premium user</b></p>
                                <a href="leaderboard.html"><button class="btn btn-primary float-right ml-2">Show Leaderboard</button></a>
                                <button onclick="downloadExpense()" class="btn btn-primary float-right ml-2">Download</button>
                                <button onclick="getDownloadedFiles()" class="btn btn-primary float-right">Downloaded files</button>`
    } else{
        premiumDiv.innerHTML = `<button onclick="buyPremium()" class="btn btn-primary float-right ">Buy Premium</button>`
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const decodedToken = parseJwt(token);
    console.log(decodedToken);
    showPremiumFeatures(decodedToken.isPremiumUser);
    const page = 1;
    const pageSize = localStorage.getItem('rows');
    expenseList.innerHTML = '';
    pagination.innerHTML = '';

    axios.get(`http://35.173.198.167:3000/expenses?page=${page}&pageSize=${pageSize}`, {headers: {"Authorization": token} })
        .then(response => {
            //console.log(response.data.expenses);
            
            for(let i=0;i<response.data.expenses.length;i++){
                showExpenseOnScreen(response.data.expenses[i]);
            }
            // response.data.expenses.forEach(expense => {
            //     showExpenseOnScreen(expense);
            // })
            showPagination(response.data);
        })
        .catch(err => {
            console.log(err);
        })
})

//document.getElementById('rzp-button').onclick = async function (e) {
async function buyPremium(){
    //e.preventDefault;
    const token = localStorage.getItem('token');
    const response = await axios.get('http://35.173.198.167:3000/purchase/premiumMembership', {headers: {"Authorization": token} });
    console.log("response from premiummembership route >>>"+response);
    var options = 
    {
        "key": response.data.key_id,
        "order_id": response.data.order.id,
        //his handler function will handle the success payment
        "handler": async function (response) {
            const result = await axios.post('http://35.173.198.167:3000/purchase/updateTransactionStatus',{
                order_id: options.order_id,
                payment_id: response.razorpay_payment_id,
                success: true
            }, {headers: {"Authorization": token} })

            alert('You are a Premium User Now!')
            // showPremiumFeatures(true);
            localStorage.setItem('token', result.data.token);
            showPremiumFeatures(true);
        },
    };
    const rzp1 = new Razorpay(options);
    rzp1.open();
    //e.preventDefault();

    rzp1.on('payment.failed', async function (response){
        console.log(response);
        const result = await axios.post('http://35.173.198.167:3000/purchase/updateTransactionStatus',{
            order_id: options.order_id,
            success: false
        }, {headers: {"Authorization": token} })
        alert('Something went wrong!!');
        alert(result.data.error);
    });
}

function addExpense(e){
    e.preventDefault();
    const token = localStorage.getItem('token');
    let expenseDetails = {
        amount: amountInput.value,
        description: descInput.value,
        category: categoryInput.value
    }
    if(editFlag === true){
        axios.put('http://35.173.198.167:3000/expenses/edit-expense/'+tempId, expenseDetails, {headers: {"Authorization": token} })
            .then(response => {
                showExpenseOnScreen({...expenseDetails, id: tempId});
                editFlag = false;
            })
            .catch(err => console.log(err))
    } else{
        axios.post('http://35.173.198.167:3000/expenses', expenseDetails, {headers: {"Authorization": token} })
            .then(response => {
                showExpenseOnScreen(response.data);
            })
            .catch(err => console.log(err))
    }

    amountInput.value = '';
    descInput.value = '';
    categoryInput.value = '';
}

function showExpenseOnScreen(obj) {
    const parentElement = document.getElementById('expenses');
    const childHTML = `<li id=${obj.id} class="list-group-item"> 
                                <div class="row">
                                <div class="col-lg-3">
                                    ${obj.amount} 
                                </div>
                                <div class="col-lg-3">
                                    ${obj.description} 
                                </div>
                                <div class="col-lg-3">
                                    ${obj.category} 
                                </div>
                                </div>
                                <button class="btn btn-danger btn-sm float-right ml-2" onclick="deleteExpense('${obj.id}')">Delete</button>
                                <button class="btn btn-danger btn-sm float-right ml-2" onclick="editExpense('${obj.id}', '${obj.amount}', '${obj.category}', '${obj.description}')">Edit</button>
                        </li>`
                    //    ${obj.description} ${obj.price} ${obj.quantity}
    parentElement.innerHTML = parentElement.innerHTML + childHTML;
}

function showPagination({
    currentPage,
    hasNextPage,
    nextPage,
    hasPreviousPage,
    previousPage,
    lastPage,
}) {
    showPagination.innerHTML = '';

    if(hasPreviousPage) {
        const btn2 = document.createElement('button');
        btn2.innerHTML = previousPage;
        btn2.addEventListener("click", () => getExpenses(previousPage))
        pagination.appendChild(btn2);
    }

    const btn1 = document.createElement('button');
    btn1.innerHTML = `<h3>${currentPage}</h3>`;
    btn1.addEventListener("click", () => getExpenses(currentPage))
    pagination.appendChild(btn1);

    if(hasNextPage) {
        const btn3 = document.createElement('button');
        btn3.innerHTML = nextPage;
        btn3.addEventListener("click", () => getExpenses(nextPage))
        pagination.appendChild(btn3);
    }
}

function getExpenses(page) {
    const pageSize = localStorage.getItem('rows');
    expenseList.innerHTML = '';
    pagination.innerHTML = '';
    axios.get(`http://35.173.198.167:3000/expenses?page=${page}&pageSize=${pageSize}`, {headers: {"Authorization": token} })
    .then(response => {
        for(let i=0;i<response.data.expenses.length;i++){
            showExpenseOnScreen(response.data.expenses[i]);
        }
        showPagination(response.data);
    })
    .catch(err => {
        console.log(err);
    })
}

function deleteExpense(id) {
    const parentElement = document.getElementById('expenses');
    const childElement = document.getElementById(id);
    const token = localStorage.getItem('token');
    //console.log(id);
    axios.delete(`http://35.173.198.167:3000/expenses/${id}`, {headers: {"Authorization": token} })
        .then(response => {
            console.log('Deletion was successful!!');
            parentElement.removeChild(childElement);
        })
        .catch(err => console.log(err))
}

function editExpense(id, amount, category, description) {
    //console.log(id);
    //axios.put(`http://35.173.198.167:3000/expenses/`)
    const element = document.getElementById(id);
    expenseList.removeChild(element);
    amountInput.value = amount;
    categoryInput.value = category;
    descInput.value = description;
    editFlag = true;
    tempId = id;
}

async function downloadExpense() {
    try{
        const token = localStorage.getItem('token');
        const result = await axios.get('http://35.173.198.167:3000/expenses/download', {headers: {"Authorization": token} });
        if(result.status === 200) {
            var a = document.createElement('a');
            a.href = result.data.fileURL;
            a.download = 'myexpense.csv';
            a.click();
        } else{
            throw new Error(result.data.message);
        }
    } catch(err){
        console.log(err);
    }
}

async function getDownloadedFiles() {
    try{
        const parentElement = document.getElementById('downloaded');
        parentElement.innerHTML = '';
        const token = localStorage.getItem('token');
        const result = await axios.get('http://35.173.198.167:3000/expenses/downloadFiles', {headers: {"Authorization": token} });
        if(result.status === 200) {
            for(let i=0;i<result.data.userFiles.length;i++){
                console.log(result.data.userFiles[i]);
                showDownloadedFiles(result.data.userFiles[i], i+1);
            }
        } else{
            throw new Error(result.data.message);
        }
    } catch(err){
        console.log(err);
    }
}

function showDownloadedFiles (obj, num) {
    const parentElement = document.getElementById('downloaded');
    const childElement = `<li class="list-group-item"> 
                            <div class="row">
                                <div class="col-lg-3">
                                    <a href='${obj.URL}'> File ${num}</a>
                                </div>
                            </div>
                          </li>`
    parentElement.innerHTML = parentElement.innerHTML + childElement;
}