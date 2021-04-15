const { mongoose } = require('../db/mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const _ = require('lodash')
const bcrypt = require('bcryptjs')
let UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        trim: true,
        minLength: 1,
        // required: true,
    },
    lastName: {
        type: String,
        trim: true,
        minLength: 1,
        // required: true,
    },
    email: {
        type: String,
        trim: true,
        minLength: 1,
        required: true,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: `${'value'} is not valid email`
        }
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
})
UserSchema.methods.toJSON = function () {
    let user = this
    let userObject = user.toObject()
    return _.pick(userObject, ['_id', 'email', 'firstName', 'lastName'])
}
UserSchema.methods.generateAuthToken = function () {
    let user = this
    let access = 'auth'
    let token = jwt.sign({ _id: user._id.toHexString(), access }, 'secret').toString()
    user.tokens = { access, token }
    return user.save().then(() => {
        return token
    })
}

UserSchema.methods.removeToken = function (token) {
    let user = this
    return user.update({
        $pull: {
            tokens: {
                token
            }
        }
    })
}
UserSchema.statics.findByToken = function (token) {
    let User = this
    let decoded;
    try {
        decoded = jwt.verify(token, 'secret')
    } catch (e) {
        // return new Promise((resolve,reject)=>{
        //     reject()
        // })
        return Promise.reject()
    }
    return User.findOne({
        '_id': decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    })
}

UserSchema.statics.findByCredentials = function (email, password) {
    let User = this

    return User.findOne({ email }).then((user) => {
        if (!user) {
            console.log('not user')
            return Promise.reject()
        }
        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (err, res) => {
                if (user) {
                    resolve(user)
                } else {
                    console.log('compare issue')
                    reject()
                }
            })
        })
    })
}

UserSchema.pre('save', function (next) {
    let user = this

    if (user.isModified('password')) {
        bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(user.password, salt, function (err, hash) {
                user.password = hash
                next()
            });
        });

    } else {
        next()
    }
})

let User = mongoose.model('Users', UserSchema)
// User.validate((e) => console.log(e))
module.exports = { User }