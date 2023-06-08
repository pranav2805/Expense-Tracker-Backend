const User = require('../models/user');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

function isStringInvalid(string) {
    if(string == undefined || string.length === 0)
        return true;
    else
        return false;
}

function generateToken(id, name, isPremiumUser){
    return jwt.sign({userId: id, name: name, isPremiumUser}, process.env.SECRET_TOKEN);
}

exports.signup = async (req, res, next) => {
    try{
        const{username, email, password} = req.body;
        if(isStringInvalid(username) || isStringInvalid(email) || isStringInvalid(password)){
            return res.status(400).json({err: 'Bad parameter. Something is missing!'});
        }

        const saltRounds = 10;
        bcrypt.hash(password, saltRounds, async (err, hash) => {
            if(err)
                console.log(err);
            try{
            const user = await User.create({username: username, email: email, password: hash});
            res.status(200).json({success: true, message: 'User has been created successfully!'});
            } catch(err) {
                if(err.message === 'Validation error')
                    res.status(500).json({success: false, message: 'Email id already exists!'});
            }
        })
    } catch(err) {
        res.status(500).json({error: err.message});
        // return res.status(500).json().then(body => {
        //     throw new Error(body.error)
        // })
    }
}

exports.login = async (req, res, next) => {
    try{
        const{email, password} = req.body;
        if(isStringInvalid(email) || isStringInvalid(password)){
            return res.status(400).json({err: 'Bad parameter. Something is missing!'});
        }

        const users = await User.findAll({where: {email: email}});
        const user = users[0];
        //console.log(user);
        if(user){
            bcrypt.compare(password, user.password, (err, result) => {
                if(err)
                    throw new Error('Something went wrong!');
                if(result === true){
                    res.status(200).json({success: true, message: 'User logged in successfully!', token: generateToken(user.id, user.username, user.isPremiumUser)});
                }
                else
                    res.status(401).json({success: false, message: 'User not authorized!'});
            })
        } else{
            res.status(404).json({success: false, message: 'User not found!'});
        }
    } catch(err) {
        res.status(500).json({success: false, message: err});
    }
}