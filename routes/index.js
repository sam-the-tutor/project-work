const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { check, validationResult } = require("express-validator")
const bcrypt = require("bcrypt")
const Nexmo = require('nexmo')

const fs = require("fs")



const nexmo = new Nexmo({
  apiKey: process.env.NEXMO_KEY || 'f22d8216',
  apiSecret: process.env.NEXMO_SECRET || 'G1NQdz6yXdMJbi1j',
})



router.get('/', (req, res, next) => {
	return res.render('index.ejs');
});



router.get('/two', (req, res) => {


  res.render('index2', { message: 'Hello, world!' })



})


router.get('/verify', (req, res) => {


  res.render('check')



})


router.post('/verify', (req, res) => {
	console.log(req.body.number)
  nexmo.verify.request({
    number: req.body.number,
    brand: 'Unizon'
  }, (error, result) => {
    if(result.status != 0 && result.status != 10) {
    	console.log("result:",error)
      res.render('index2', { message: result.error_text })
    } else {
      res.render('check', { requestId: result.request_id })
    }
  })
})

router.post('/check', (req, res) => {
  nexmo.verify.check({
    request_id: req.body.requestId,
    code: req.body.code
  }, (error, result) => {
    if(result.status != 0) {
      res.render('index2', { message: result.error_text })
    } else {
      res.render('success')
    }
  })
})


router.get('/success',(req,res) =>{



res.render("success")

})

router.post('/success', (req,res) =>{
	const path = req.body.text
	console.log(path)

fs.unlink(path, (err) =>{
	if(err && err.code =="ENOENT"){
		console.info("Error! File doesnt exist")
res.render('final',{message:`Error! File doesnt exist`})
	} else if(err){
		console.error("Something went wrong")
	}else{
		console.info(`SUccess, we removed aa file with the path ${path}`)
		res.render('final',{message:`Success, we removed aa file with the path ${path}`})
	}

})



})




router.post('/', [
		check('username',"Username doesnt qualify")
			.isLength({min:8}),

		check('password',"password is not up to standards")
			.isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, 
			minNumbers: 1, minSymbols: 1, returnScore: false, pointsPerUnique: 1, 
			pointsPerRepeat: 0.5, pointsForContainingLower: 10, pointsForContainingUpper: 10, 
			pointsForContainingNumber: 10, pointsForContainingSymbol: 10 }),




	],


	async (req, res, next) => {

		const errors = validationResult(req)
		

         console.log("errordss:",errors)
         const err = errors.array()
         console.log("err:",err)

		if(err.length >0){
			console.log(err.length)
			console.log("there are errors")
			
			res.send({ "Success": "error"})
			
			

		}else{


			console.log("no errors",req.body)
		



	let personInfo = req.body;

	if (!personInfo.secret || !personInfo.username || !personInfo.password || !personInfo.passwordConf) {
	} else {
		console.log("here we are")
		if (personInfo.password == personInfo.passwordConf) {
		const Epassword = await bcrypt.hash(personInfo.password, 10);
		
		    		console.log("hash",Epassword)


			User.findOne({ username: personInfo.username }, async (err, data) => {
				if (!data) {

					//const Eusername= await bcrypt.hash(personInfo.username, 10);

					let c;
					User.findOne({}, (err, data) => {

						if (data) {
							c = data.unique_id + 1;
						} else {
							c = 1;
						}



						let newPerson = new User({
							unique_id: c,
							username: personInfo.username ,
							password: Epassword,
							secretKey: personInfo.secret
							
						});

						newPerson.save((err, Person) => {
							if (err)
								console.log(err);
							else{
								console.log('Success');
							
							  //  res.redirect("/login")
						}
						});

					}).sort({ _id: -1 }).limit(1);
					res.send({ "Success": "You are regestered,You can login now." });
					
			    } else {
					console.log('watagwan');
					res.send({ "Success": "Username is already used." });
				}

			});
		} else {
			console.log('bizibu');
			res.send({ "Success": "password is not matched" });
		}
	}
	}
		
});

//router get login




router.get('/login', (req, res, next) => {
	return res.render('login.ejs');
});





// router post login


router.post('/login', async (req, res, next) => {
	
	User.findOne({ username: req.body.username }, (err, data) => {
		if (data) {
			//calculate the duration of the password

			//check whether the password has not yet expired and if it matches.
			bcrypt.compare(req.body.password, data.password, function(err, result) {
				    if (result) {
				    req.session.userId = 7 //data.unique_id;
				      
				  //password is valid
				res.send({ "Success": "Success!" });
			} else {
				
				res.send({ "Success": "Check your password!" });
			}
			});
		} else {
			res.send({ "Success": "Check your username!" });
		}
	});
});








//fetching the profile

router.get('/profile', (req, res, next) => {
	User.findOne({ unique_id: req.session.userId }, (err, data) => {
		if (!data) {
			console.log("not found please")
			//res.redirect('/');
		} else {
			return res.render('data.ejs', { "name": data.username, "email": data.email });
		}
	});
});

router.get('/logout', (req, res, next) => {
	if (req.session) {
		// delete session object
		req.session.destroy((err) => {
			if (err) {
				return next(err);
			} else {
				return res.redirect('/');
			}
		});
	}
});



//router forget password render 
router.get('/forgetpass', (req, res, next) => {
	res.render("forget.ejs");

});



//router forget password post


router.post('/forgetpass', async (req, res, next) => {

	const Eusername = await bcrypt.hash(req.body.username, 10); 


	User.findOne({ username: Eusername }, (err, data) => {
		if (!data) {
			res.send({ "Success": "This Username Is not registered!" });
		} else {

			if (req.body.password == req.body.passwordConf) {
				data.password = req.body.password;
				data.passwordConf = req.body.passwordConf;

				data.save((err, Person) => {
					if (err)
						console.log(err);
					else
						console.log('Success');
					res.send({ "Success": "Password changed!" });
				});
			} else {
				res.send({ "Success": "Password does not match! Both Password should be same." });
			}
		}
	});

});

module.exports = router;