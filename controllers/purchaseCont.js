const Razorpay = require('razorpay');
const Order = require('../models/order');
const jwt = require('jsonwebtoken');

function generateToken(id, name, isPremiumUser){
    return jwt.sign({userId: id, name: name, isPremiumUser}, process.env.SECRET_TOKEN);
}

exports.purchasePremium = async (req, res, next) => {
    try{
        //console.log(process.env.RAZORPAY_KEY_ID);
        var rzp = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        })

        const amount = 2500;

        rzp.orders.create({amount, currency: "INR"}, (err, order) => {
            if(err)
                throw new Error(JSON.stringify(err));
            
                req.user.createOrder({orderId: order.id, status: 'PENDING'}).then(() => {
                    return res.status(201).json({ order, key_id: rzp.key_id});
                }).catch(err => {
                    throw new Error(err);
                })
        })
    } catch(err){
        console.log(err);
        res.status(403).json({message: 'Something went wrong!!', error: err});
    }
}

exports.updateTransactionStatus = async (req, res, next) => {
    try{
        console.log(req.body);
        const {order_id, payment_id, success} = req.body;
        const order = await Order.findOne({where: {orderId: order_id}});
        //console.log(typeof(success));
        if(success === true){
            const promise1 = order.update({paymentId: payment_id, status: 'SUCCESSFUL'})
            const promise2 = req.user.update({isPremiumUser: true});

            Promise.all([promise1, promise2]).then(() => {
                res.status(202).json({success: true, message: 'Transaction successful!!', token: generateToken(req.user.id, undefined, true)});
            }).catch(err => {
                throw new Error(err);
            })
        } else{
            order.update({status: 'FAILED'}).then(() => {
                return res.status(403).json({message: 'Something went wrong!!', error: 'Payment was unsuccessful!!'});
            }).catch(err => {
                console.log(err);
            })
        }
    } catch(err) {
        console.log(err);
        res.status(403).json({message: 'Something went wrong!!', error: err});
    }
}