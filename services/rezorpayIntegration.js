const razorpay= require('razorpay')


exports.createRazorpayInstance= async ()=>{
    try{
        const RazorpayInstance= new razorpay({
            key_id: process.env.RazorPay_key,
            key_secret: process.env.RazorPay_Secret
        })
        return RazorpayInstance
    }catch(err){
        console.error("Error in creating Razorpay Instance.",err.message)
        throw err
    }
}