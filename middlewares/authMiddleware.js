const { verifyToken }= require('../services/jwtToken.js')
const secret= process.env.Secret
const { redisClient }= require('../services/redisConnection.js')



exports.tokenAuthentication = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization']
        
        let token
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.slice(7)
        }

        if (!token) {
            return res.status(401).json({ success: false, message: 'Authentication token is missing.' })
        }

        let blacklisted
        try{
            blacklisted= await redisClient.get(token)
        }catch(err){
            console.error("Error in the redis", err.message)
            return res.status(500).json({ success: false, message: "Internal Server Error."})
        }
        
        if(blacklisted){
            return res.status(401).json({ success: false, message: 'Token is blacklisted.' })
        }
        
        let user
        try {
            user = await verifyToken(token, secret)
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ success: false, message: 'Token has expired.' })
            }
            return res.status(401).json({ success: false, message: 'Invalid token.' })
        }

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid token.' })
        }

        req.user= user
        if (req.requiredRole) {
            const userRole = req.user.role
            if (!req.requiredRole.includes(userRole)) {
                return res.status(403).json({ success: false, message: 'Access denied. You do not have permission.' });
            }
        }
        next()

    } catch (err) {
        console.error("Error in the Token-authentication Middleware: " + err.message);
        return res.status(500).json({ success: false, message: "Internal Server Error." });
    }
}
