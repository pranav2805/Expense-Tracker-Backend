const lbList = document.getElementById('leaderboardList');

window.addEventListener('DOMContentLoaded', () => {
    axios.get('http://35.173.198.167:3000/premium/showLeaderboard')
        .then(response => {
            for(let i=0;i<response.data.length;i++){
                showUserOnLeaderboard(response.data[i]);
            }
        }).catch(err => {
            console.log(err);
        })
})

function showUserOnLeaderboard(obj) {
    const childHTML = `<li id=${obj.id}>
                        <div class="row">
                            <div class="col-lg-3">${obj.username}</div>
                            <div class="col-lg-3">${obj.totalExpenses}</div>
                        <div>
                       </li>`
    
    lbList.innerHTML = lbList.innerHTML + childHTML;
}