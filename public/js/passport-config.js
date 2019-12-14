var LocalStrategy = require("passport-local").Strategy;
var bcryptjs = require('bcryptjs')
function initialize(passport, getUserByEmail){
    var authenticateUser = async (email, password, done) => {
        var user = getUserByEmail(email)
        if(user==null){
            // console.log("No user with that email")
            return done(null, false, { message: "No user with that email"})
        }
        try{
            if (await bcryptjs.compare(password, user.password)){
                return done(null, user)
            }else{
                // console.log("Password incorrect")
                return done(null, false, {message: "Password incorrect"})
            }
        }
        catch(e){
          
            return done(e)
        }

    }
    passport.use(new LocalStrategy({ usernameField: "email"},
    authenticateUser))
    passport.serializeUser((user, done) => {})
    passport.deserializeUser((id, done) => {})
}

module.exports = initialize