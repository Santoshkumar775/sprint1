const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const authMiddleware = async(req,res,next)=>{
    
    try{
        // const token = req.headers['authorization']?.split(' ')[1];

        // if(!token){
        //     return res.status(400).json({msg:'provide a valid token...'})
        // }

        // const decoded = jwt.verify(token, supersecret);
        // req.user = decoded;
        // return next();

        // console.log('authmiddleware triggerd');
        
        const authHeaders = req.headers.authorization;

        if((!authHeaders) || (!authHeaders.startsWith('Bearer'))){
            return res.status(400).json({msg:'provide a valid token...'})
        }

        const token = authHeaders.split(' ')[1];
        const decoded = jwt.verify(token, 'supersecret');
        req.user = decoded;

        // console.log(token);
        // console.log(decoded);
         return next();
    }
    catch(error){
        return res.status(500).json({msg:'verification failed...', error:error.message})
    }

}

module.exports = authMiddleware;