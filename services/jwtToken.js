const jwt= require('jsonwebtoken')


exports.createJwtToken= async (username, id, role, mess_id, secret)=>{
  try{
      return jwt.sign( {username, id, role, mess_id }, secret, {expiresIn: '3h'})
  }catch(err){
    console.error(`Error In creating Token.`,err.message)
    throw err
  }
}


exports.verifyToken= async (token,secret)=>{
  try{
      return jwt.verify(token,secret)
  }catch(err){
    console.error(`Error In varifying Token.`,err.message)
    throw err
  }
}


exports.decodeToken= async (token)=>{
  try{
      return jwt.decode(token)
  }catch(err){
    console.error(`Error In Decoding Token.`,err.message)
    throw err
  }
}