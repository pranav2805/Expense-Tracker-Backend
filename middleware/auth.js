const User = require('../models/user');
const jwt = require('jsonwebtoken');

exports.authenticate = async (req, res, next) => {
    try{
        const token = req.header('Authorization');
        console.log(token);
        const user = jwt.verify(token, process.env.SECRET_TOKEN);
        console.log(user);
        User.findByPk(user.userId).then(user => {
            if(user){
                req.user = user;
                next();
            }
            else
                return res.status(404).json({message: 'User not found!!'});

        }).catch(err => {throw new Error(err)})
    } catch(err){
        console.log('Error:' +err);
        return res.status(401).json({success: false});
    }
}