exports.setRoleStudent= async( req, res, next)=>{
    try{
        req.requiredRole = ['student']
        next()

    }catch(err){
        console.error("Error in Set Role Student Middleware "+ err.message)
        return res.status(500).json({ success: false, message: "Internal Server Error."})
    }
}


exports.setRoleOwner= async( req, res, next)=>{
    try{
        req.requiredRole = ['owner']
        next()

    }catch(err){
        console.error("Error in Set Role Owner Middleware "+ err.message)
        return res.status(500).json({ success: false, message: "Internal Server Error."})
    }
}


exports.setRoleCommon= async( req, res, next)=>{
    try{
        req.requiredRole = ['owner', 'student']
        next()

    }catch(err){
        console.error("Error in Set Role Common Middleware "+ err.message)
        return res.status(500).json({ success: false, message: "Internal Server Error."})
    }
}