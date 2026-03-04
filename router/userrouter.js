const express = require('express');
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require('../utilss/wrapAsync.js');
const passport = require("passport");   
const { saveRedirectUrl } = require('../middleware.js');


const userController = require("../controllers/userCon.js");    


// ================== SIGNUP Route ==================

router.route("/signup")
    .get(userController.renderSignup)
    .post(wrapAsync( userController.signup) ); // ====== create a new user and log them in immediately after registration =


// ================= Login Route ==============
router.route("/login")
    .get(userController.renderLogin)
    .post(saveRedirectUrl, passport.authenticate("local", 
        {
            failureFlash: true,     
            failureRedirect: "/login"   
        }), userController.login); // ====== authenticate the user and log them in =    



// ============== Logout Route ==============
router.get("/logout",userController.logout);

module.exports = router;
