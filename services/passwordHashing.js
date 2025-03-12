const argon2= require('argon2');


exports.hashPassword= async(password)=>{
    try{
        const hash= await argon2.hash(password);
        return hash;
    }catch(err){
        console.error("Error in Password Hashing: "+ err.message)
        throw err
    }
}


exports.verifyPassword= async (hash, password)=>{
    try{
        const isMatch= await argon2.verify(hash, password)
        return isMatch;
    }catch(err){
        console.error("Error in Password hash maching function: "+ err.message)
        throw err
    }
}