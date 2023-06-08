const Sib = require('sib-api-v3-sdk');

const client = Sib.ApiClient.instance;

const apiKey = client.authentications['api-key'];
apiKey.apiKey = process.env.SIB_API_KEY;

const tranEmailApi = new Sib.TransactionalEmailsApi();

const uuid = require('uuid');
const bcrypt = require('bcrypt');

const User = require('../models/user');
const Forgotpassword = require('../models/forgotpassword');

exports.postSendEmail = async (req, res) => {
    try{
        const sender = {
            email: 'pranavpradeep095@gmail.com'
        }
        
        const { email } = req.body;

        const user = await User.findOne({where: {email: email}});
        if(user){
            const id = uuid.v4();
            await user.createForgotpassword({id, isActive: true});
            console.log(email);
            await tranEmailApi.sendTransacEmail({
                sender,
                to: email,
                subject: 'Reset Password Link',
                htmlContent: `<a href="http://35.173.198.167:3000/password/resetpassword/${id}">Reset Password</a>`
            })
    
            res.status(200).json({success: true, message: 'Link to reset password sent to your mail'});
        } else{
            throw new Error('User email id not registered!!')
        }

        
    } catch(err){
        console.log(err);
        res.status(500).json({success: false, message:err});
    }
}


exports.resetPassword = async (req, res) => {
    try{
    const id = req.params.id;
    const forgotpasswordRequest = await Forgotpassword.findOne({where: {id: id, isActive: true}});
    await Forgotpassword.update(
        {isActive: false},
        {where: {id: id}})

    if(forgotpasswordRequest){
        res.status(200).send(`<html>
                                    <script>
                                        function formsubmitted(e){
                                            e.preventDefault();
                                            console.log('called')
                                        }
                                    </script>

                                    <form action="/password/updatepassword/${id}" method="get">
                                        <label for="newpassword">Enter New password</label>
                                        <input name="newpassword" type="password" required></input>
                                        <button>reset password</button>
                                    </form>
                                </html>`
                                )
        res.end();
    } else{
        throw new Error('Reset password link not found or expired!!');
    }

    } catch(err){
        console.log(err);
        res.status(500).json({success: false, message:err});
    }
}

exports.updatePassword = async (req, res) => {
    try{
        const { newpassword } = req.query;
        const { resetpasswordid } = req.params;
        const forgotpasswordRequest = await Forgotpassword.findOne({ where : { id: resetpasswordid }})
        if(forgotpasswordRequest){
            const user = await User.findOne({where: {id: forgotpasswordRequest.userId}});
            if(user){
                const saltRounds = 10;
                bcrypt.hash(newpassword, saltRounds, async (err, hash) => {
                if(err){
                    console.log(err);
                    res.status(500).json({success: false, message:err});
                } else{
                    await user.update({password: hash});
                    //res.status(200).json({message: 'Successfully updated with new password!!'});
                    res.status(200).send(`<html>
                                            window.alert('Successfully updated with new password!!')
                                          </html>`
                                        );
                    res.end();
                }

                })
            }
        }
    } catch(err) {
        console.log(err);
        res.status(500).json({success: false, message:err});
    }
}
