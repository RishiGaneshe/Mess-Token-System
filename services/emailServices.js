const sgMail= require('@sendgrid/mail')

sgMail.setApiKey(process.env.SendGrid)


exports.sendSignUpOTP= async (email, otp) =>{
    const msg= {
        to: email,
        from: 'info.dakshifoundation@gmail.com',
        subject: 'Your OTP code for Creating account',
        text: `Dear User,\n\nYour One-Time Password (OTP) is: ${otp}.\n\nPlease do not share this OTP with anyone. It is valid for only 2 minutes.\n\nRegards,\nMTS`
    }

    try{
        await sgMail.send(msg)
    }catch(err){
        console.error("Error in the Sign-up otp sending function "+err.message)
        throw err
    }
}


exports.sendForgetPassOTP= async(email, otp)=>{
    const msg = {
        to: email,
        from: 'info.dakshifoundation@gmail.com',
        subject: 'OTP for Password Reset',
        text: `Dear User,\n\nYour One-Time Password (OTP) for Password Reset at MTS is: ${otp}.\n\nPlease do not share this OTP with anyone. It is valid for 2 minutes only.\n\nBest regards,\nMTS`
    }    

    try{
        await sgMail.send(msg)
    }catch(err){
        console.error("Error in the Sign-up otp sending function "+err.message)
        throw err
    }
}
