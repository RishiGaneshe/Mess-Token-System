const express= require('express')
const router= express.Router()
const Owner= require('../controllers/owner.controller')


router.post("/owner-dashboard", Owner.handleHelloOwner)

router.post("/logout", Owner.handleOwnerLogout)


module.exports= router