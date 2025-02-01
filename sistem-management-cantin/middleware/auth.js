const jwt = require('jsonwebtoken');  
require('dotenv').config();  

const JWT_SECRET = process.env.JWT_SECRET;  

const verifyToken = (req, res, next) => {  
    const token = req.headers['authorization']?.split(' ')[1]; 
    if (!token) {  
        return res.status(403).json({ message: 'Token is required' });  
    }  

    jwt.verify(token, JWT_SECRET, (err, decoded) => {  
        if (err) {  
            return res.status(401).json({ message: 'Unauthorized: Invalid token' });  
        }  
        req.user = decoded; // Simpan informasi pengguna di request  
        next();  
    });  
};  

//middleware untuk verifikasi user
const authorizeRoles=(...roles)=>{
    return(req,res,next)=>{
        const userRole=req.user.role;
        if(!roles.includes(userRole)){
            return res.status(403).json({message:"Forbidden: Access denied"});
        }
        next();
    };
};

module.exports={verifyToken,authorizeRoles};