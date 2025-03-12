const { createRazorpayInstance }= require('../services/rezorpayIntegration')


let RazorpayInstance
const RzInstance= async()=>{
    try{
        RazorpayInstance= await createRazorpayInstance()
    }catch(err){
        console.error("Error in creating Rz Instance"+ err.message)
    }
}
RzInstance()


exports.getPaymentDetails = async (paymentId) => {
    try {
        const payment = await RazorpayInstance.payments.fetch(paymentId)
        
        if (payment.status === 'captured') {
            console.log('Payment successful!')
            console.log('Amount paid:', payment.amount / 100)
            return payment.amount / 100
        } else {
            console.log('Payment failed or pending.')
            return null
        }
    } catch (err) {
        console.error('Error fetching payment details:', err.message)
        throw err
    }
}


exports.handleGetPaymentInfo= async(paymentId, keyId, keySecret)=>{
    try{
        const URL= `https://api.razorpay.com/v1/payments/${paymentId}`
        const credentials = btoa(`${keyId}:${keySecret}`)

        const response= await fetch(URL, {
            method: "GET",
            headers: {
                "Authorization": `Basic ${credentials}`,
                "Content-Type": "application/json"
            }
        })

        if(!response.ok){
            throw new Error(`Error: ${response.status} ${response.statusText}`)
        }

        const paymentData= await response.json()
        return paymentData

    }catch(err){
        console.error("Failed to fetch payment details:", err.message)
        return null
    }
}