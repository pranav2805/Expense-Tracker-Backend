const AWS = require('aws-sdk');

exports.uploadToS3 = (data, filename) => {
    let s3Bucket = new AWS.S3({
        accessKeyId: process.env.IAM_USER_KEY,
        secretAccessKey: process.env.IAM_USER_SECRET,
    })

    var params = {
        Bucket: process.env.BUCKET_NAME,
        Key: filename,
        Body: data,
        ACL: 'public-read'
    }

    return new Promise((resolve, reject) => {
        s3Bucket.upload(params, (err, response) => {
            if(err){
                console.log('Something went wrong ',err);
                reject(err);
            } else{
                // console.log('success', response);
                resolve(response.Location);
            }
        })
    })

}