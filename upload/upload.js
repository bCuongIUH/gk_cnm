const multer = require('multer')
const AWS = require('aws-sdk')
const path = require('path')

const storage = multer.memoryStorage({
    distination(req, file, callback){
        callback(null,'')
    }
})
const upload = multer({
    storage,
    limits:{ fileSize : 200000},
    fileFilter(req,file,cb){
        checkFileType(file, cb)
    }
})
const checkFileType = (file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = fileTypes.test(file.mimetype)
    if ( extname && mimetype){
        return cb(null,true)
    }
    return cb("Upload Only jpeg|jpg|png|gif")
}
process.env.AWS_SDK_JS_SUPPRESS_MAINTENANCE_MODE_MESSAGE ="1";
AWS.config.update({
    region : process.env.REGION,
    accessKeyId :process.env.ACCESSKEY,
    secretAccessKey : process.env.SECRETKEY
})
module.exports = upload

