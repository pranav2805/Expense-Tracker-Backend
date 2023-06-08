const User = require('../models/user');
const Expense = require('../models/expense');
const sequelize = require('../util/database');

exports.getLeaderboard = async (req, res) => {
    try{

        const leaderboardOfUsers = await User.findAll({
            attributes: ['username', 'totalExpenses'],
            order: [['totalExpenses', 'DESC']]
        })

        res.status(200).json(leaderboardOfUsers);
        // const users = await User.findAll({
        //     attributes: ['id', 'username']
        // });

        // const leaderboardOfUsers = await User.findAll({
        //     attributes: ['id', 'username', [sequelize.fn('sum', sequelize.col('expenses.amount')), 'total_expenses']],
        //     include: [
        //         {
        //             model: Expense,
        //             attributes: []
        //         }
        //     ],
        //     group: ['user.id'],
        //     order: [['total_expenses', 'DESC']]
        // });
        // console.log(leaderboardOfUsers);

        // res.status(200).json(leaderboardOfUsers);
        
        // const userAggregatedExpense = {};
        // expenses.forEach(expense => {
        //     if(userAggregatedExpense[expense.userId]){
        //         userAggregatedExpense[expense.userId] += expense.amount;
        //     } else{
        //         userAggregatedExpense[expense.userId] = expense.amount;
        //     }
        // })
        // console.log(userAggregatedExpense);
        // const userLeaderboard = [];
        // users.forEach(user => {
        //     userLeaderboard.push({name: user.username, totalExpenses: userAggregatedExpense[user.id] || 0})
        // })
        // userLeaderboard.sort((a, b) => b.totalExpenses - a.totalExpenses);
        
    } catch(err) {
        console.log(err);
        res.status(403).json({message: 'Something went wrong!!'})
    }
}