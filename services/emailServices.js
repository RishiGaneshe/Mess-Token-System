const sgMail= require('@sendgrid/mail')

sgMail.setApiKey(process.env.SendGrid)


exports.sendSignUpOTP= async (email, otp) =>{
    const msg= {
        to: email,
        from: 'info.dakshifoundation@gmail.com',
        subject: 'Your OTP code for Creating account',
        text: `Your OTP is: ${otp}. Do not share this OTP. OTP will be valid for 2 minutes only.`
    }

    try{
        await sgMail.send(msg)
    }catch(err){
        console.error("Error in the Sign-up otp sending function "+err.message)
        throw err
    }
}
