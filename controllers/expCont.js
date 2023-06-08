const { response } = require('express');
const Expense = require('../models/expense');
const User = require('../models/user');
const downloadedFile = require('../models/downloadedfile');
const sequelize = require('../util/database');
const UserServices = require('../services/userservices');
const S3Services = require('../services/s3services');

// const ITEMS_PER_PAGE = 3;

// function uploadToS3(data, filename) {
//     let s3Bucket = new AWS.S3({
//         accessKeyId: process.env.IAM_USER_KEY,
//         secretAccessKey: process.env.IAM_USER_SECRET,
//     })

//     var params = {
//         Bucket: process.env.BUCKET_NAME,
//         Key: filename,
//         Body: data,
//         ACL: 'public-read'
//     }

//     return new Promise((resolve, reject) => {
//         s3Bucket.upload(params, (err, response) => {
//             if(err){
//                 console.log('Something went wrong ',err);
//                 reject(err);
//             } else{
//                 // console.log('success', response);
//                 resolve(response.Location);
//             }
//         })
//     })

// }

exports.downloadExpense = async (req, res) => {
    try{
        const expenses = await UserServices.getExpenses(req);
        const stringifiedExpenses = JSON.stringify(expenses);
        const filename = `Expense${req.user.id}/${new Date()}.txt`;

        const fileURL = await S3Services.uploadToS3(stringifiedExpenses, filename);
        await req.user.createDownloadedFile({URL: fileURL});
        res.status(200).json({fileURL, success: true});
    } catch(err){
        console.log(err);
        res.status(500).json({success: false, err: err})
    }
}

exports.getDownloadedFiles = async (req, res) => {
    try{
        const userFiles = await req.user.getDownloadedFiles();
        res.status(200).json({success: true, userFiles: userFiles});
    } catch(err){
        console.log(err);
        res.status(500).json({success: false, err: err});
    }
}

exports.getExpenses = async (req, res, next) => {
    try {
        const page = +req.query.page || 1;
        const ITEMS_PER_PAGE = Number(req.query.pageSize);
        //console.log(typeof(ITEMS_PER_PAGE));
        const totalItems = await Expense.count({where: {userId: req.user.id}});
        const expenses = await req.user.getExpenses({
            offset: (page - 1) * ITEMS_PER_PAGE,
            limit: ITEMS_PER_PAGE
        });
        res.status(200).json({
            expenses: expenses,
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < totalItems,
            nextPage: page + 1,
            hasPreviousPage: page > 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

exports.postExpense = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const amount = req.body.amount;
        const description = req.body.description;
        const category = req.body.category;
        //const expense = await Expense.create({amount: amount, description: description, category: category});
        const expense = await req.user.createExpense({amount, description, category}, {transaction: t});

        const newTotalExpense = Number(req.user.totalExpenses) + Number(amount);
        
        await User.update(
            {totalExpenses: newTotalExpense},
            {
                where: {id: req.user.id},
                transaction: t
            }
        )

        await t.commit();
        res.status(201).json(expense);

    } catch(err) {
        await t.rollback();
        res.status(500).json({error: err.message});
    }
}

exports.deleteExpense = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const expenseAmount = await Expense.findOne(
            {
                attributes: ['amount'],
                where: {id: req.params.id, userId: req.user.id}, 
                transaction: t
            },
        )
        console.log('Deleted amount:' ,expenseAmount.amount);

        const expense = await Expense.destroy({where: {id: req.params.id, userId: req.user.id}, transaction: t});
        if(expense === 0){
            return res.status(404).json({error: 'Expense does not belong to the user!'});
        }

        const newTotalExpense = Number(req.user.totalExpenses) - Number(expenseAmount.amount);

        await User.update(
            {totalExpenses: newTotalExpense},
            {
                where: {id: req.user.id},
                transaction: t
            }
        )

        await t.commit();
        res.status(200).json(expense);
    } catch(err) {
        await t.rollback();
        res.status(500).json({error: err.message});
    }
}

exports.editExpense = async (req, res, next) => {
    try {
        const expense = await Expense.update(req.body, {where: {id: req.params.id, userId: req.user.id}});
        console.log(expense);
        if(expense === 0){
            return res.status(404).json({error: 'Expense does not belong to the user!'});
        }
        res.status(200).json(expense);
    } catch(err) {
        res.status(500).json({error: err.message});
    }
}