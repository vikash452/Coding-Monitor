const passport=require('passport')
const GoogleStrategy=require('passport-google-oauth20').Strategy;
const jwtStrategy=require('passport-jwt').Strategy;
const extractStrategy=require('passport-jwt').ExtractJwt;
const User=require('../database models/userModel')
const jwt=require('jsonwebtoken')

var options={
    jwtFromRequest:extractStrategy.fromAuthHeaderAsBearerToken(),
    secretOrKey:"secret"
}

passport.use(new jwtStrategy(options,(jwt_payload,done)=>{
    User.findOne({email:jwt_payload.email})
    .then((foundUser)=>{
        return done(null,foundUser)
    })
    .catch((err)=>{
        return done(err,false)
    })
}))

passport.serializeUser((user,done)=>{
    return done(null,user.email)
})

passport.deserializeUser((emailID,done)=>{
    User.findOne({email:emailID})
    .then((foundUser)=>{
        return done(null,foundUser)
    })
    // User.findById(id).then((user)=>{
    //     done(null,user)
    // })
})

passport.use(new GoogleStrategy({
    clientID:'798277582035-r2sh8gl63k7o27mluss0esga9q5v8q65.apps.googleusercontent.com',
    clientSecret:'X3IisCWwr7VwferyElVKK9V-',
    callbackURL:'http://localhost:5000/auth/google/callback',
    proxy:true
},
function(accessToken, refreshToken, profile, done) {
    // User.findOrCreate({ googleId: profile.id }, function (err, user) {
    //   return cb(err, user);
    // });
    console.log(accessToken)
    console.log(refreshToken)
    console.log(profile)
    // console.log(cb)
    console.log('hello')
    var emailID=profile.emails[0].value;
    User.findOne({email:emailID})
    .then((foundUser)=>{
        if(foundUser)
        {
            return done(null,foundUser)
        }
        else
        {
            const newUser=new User({
                googleId:profile.id,
                email:emailID,
                name:profile.displayName,
                verified:true
            })
            newUser.save()
            .then((savedUser)=>{
                return done(null,savedUser)
            })
        }
    })
    .catch((err)=>{
        console.log(err)
    })
  }
))

// const token=jwt.sign({email:foundUser.email},'secret');
//             const userDetails={
//                 token:token,
//                 foundUser,
//             }