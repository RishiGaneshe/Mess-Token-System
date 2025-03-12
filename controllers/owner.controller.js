const { verifyToken }= require('../services/jwtToken.js')
const secret= process.env.Secret
const { redisClient } = require("../services/redisConnection")



exports.handleHelloOwner= async(req,res)=>{
    try{
        console.log(req.user.role)
        return res.status(200).json({ success: true, message: `All The Best ${req.user.role}`})

    }catch(err){
        console.error("Error in Hello Owner API "+ err.message)
        return res.status(500).json({ success: false, message: "Internal Server Error" })
    }
}


exports.handleOwnerLogout= async(req,res)=>{
    try{
        const authHeader= req.headers['authorization']
        let token

        if( authHeader && authHeader.startsWith('Bearer ') && authHeader.length > 7){
            token= authHeader.slice(7).trim()
        }

        if(!token){
            return res.status(401).json({ success: false, message: 'Authentication token is missing.' })
        }

        let user
        try{
            user= await verifyToken(token, secret)
        }catch(err){
            console.error("Token verification failed:", err.message)
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ success: false, message: 'Token has already expired.' })
            }
            return res.status(401).json({ success: false, message: 'Invalid token.' })
        }

        try{
            const expirationTime= user.exp - Math.floor( Date.now() / 1000 )
            if( expirationTime > 0){
                await redisClient.set(token, 'blacklisted', 'EX', expirationTime)
            }
        }catch(err){
            console.error("Error storing token in Redis blacklist:", err.message)
            return res.status(500).json({ success: false, message: "Internal Server Error." })
        }

        console.log("Logged out successfully")
        return res.status(200).json({ success: true, message: `${req.user.role} Logged out successfully.` })

    }catch(err){
        console.error("Error in Owner logout function:", err.message);
        return res.status(500).json({ success: false, message: "Internal Server Error." });
    }
}