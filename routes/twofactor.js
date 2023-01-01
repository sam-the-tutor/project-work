const express = require('express');
const router = express.Router();


const Vonage = require('@vonage/server-sdk')

const vonage = new Vonage({
  apiKey: "f22d8216",
  apiSecret: "G1NQdz6yXdMJbi1j"
})



router.get('/', (req, res, next) => {
    return res.render('setup.ejs');
});

//send the message to the phone number
router.post('/', (req, res, next) => {



  
});








module.exports = router




































module.exports = router