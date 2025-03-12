const express= require('express')
const router= express.Router()
const Common= require('../controllers/common.controller')



router.post("/create-order", Common.handleRazorpayCreateOrder)

router.post("/verify-payment", Common.handleVerifyPayments)



module.exports= router