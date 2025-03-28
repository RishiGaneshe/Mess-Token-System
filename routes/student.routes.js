const express= require('express')
const router= express.Router()
const Student= require('../controllers/student.controller')


router.get("/tokens", Student.handleGetFunctionalTokens)

router.get("/token-data", Student.handleGetTokenData)

router.get("/profile-data", Student.handleGetProfileData)

router.get("/token-history", Student.handleGetTokenHistory)

router.get("/payment-history", Student.handleGetPaymentHistory)

router.get("/submitted-tokens", Student.handleGetTokenSubmissionData)



router.post("/student-dashboard", Student.handleHelloStudent )

router.post("/token-submission", Student.handlePostTokenSubmission)

router.post("/logout", Student.handlePostStudentLogout)



router.patch("/profile-update", Student.handlePatchStudentProfile)


module.exports= router
