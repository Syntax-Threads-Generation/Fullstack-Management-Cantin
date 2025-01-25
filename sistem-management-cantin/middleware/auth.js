const jwt=require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET=process.env.JWT_SECRET;

//middleware untuk verifikasi token
const verifyToken=(req,res,next)=>{
    const token=req.headers['authorization'];
    if(!token){
        return res.status(403).json({message:"Token is required"});
    }
    jwt.verify(token,JWT_SECRET,(err,decoded)=>{
        if(err){
            return res.status(401).json({message:"Unauthorized"});
        }
        req.user=decoded;
        next();
    });
};
//middleware untuk verifikasi admin
const authorizeRoles=(...roles)=>{
    return(req,res,next)=>{
        if(!roles.includes(req.user.role)){
            return res.status(403).json({message:"Forbidden: Access denied"});
        }
        next();
    };
};

module.exports={verifyToken,authorizeRoles};