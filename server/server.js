let env = require('dotenv').config()
const port = process.env.PORT || 3000;
const { ObjectID } = require('mongodb')
const _ = require('lodash')
// let env = process.env.NODE_ENV
const { authenticate } = require('./middleware/authenticate')
const path = require('path')
var fs = require('fs');

//db
const { mongoose } = require('./db/mongoose')

//models
const { Todo } = require('./models/Todo')
const { User } = require('./models/User')

//server
const express = require('express')
const { first } = require('lodash')
const app = express()

let publicPath = path.join(__dirname, '../public')

const options = {
    dotfiles: 'ignore',
    extensions: ['html']
}
//middleware
app.use(express.json())
app.use(express.static(publicPath, options))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/todo/index.html'))
})
//====================================================================//
app.get('/todos', authenticate, (req, res) => {
    Todo.find({ _creator: req.user._id }).then(todos => {
        res.send({ todos })
    }, e => res.status(400).send(e))
})
//====================================================================//

app.get('/todos/:id', authenticate, (req, res) => {
    let id = req.params.id

    if (!ObjectID.isValid(id)) {
        return res.status(404).send()
    }

    Todo.findOne({
        _id: id, _creator: req.user._id
    }).then(todo => {
        if (!todo) return res.status(404).send()
        res.send({ todo })
    }).catch(e => res.status(404).send())
})
//====================================================================//
app.delete('/todos/:id', authenticate, (req, res) => {
    let id = req.params.id
    if (!ObjectID.isValid(id)) {
        return res.status(404).send()
    }
    Todo.findOneAndRemove({
        _id: id,
        _creator: req.user._id
    }).then(todo => {
        if (!todo) return res.status(404).send()
        res.send({ todo })
    }).catch(e => res.status(404).send())
})
//====================================================================//
app.patch('/todos/:id', (req, res) => {
    let id = req.params.id
    let body = _.pick(req.body, ['text', 'completed'])
    if (!ObjectID.isValid(id)) {
        return res.status(404).send()
    }

    if (_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime()
    } else {
        body.completed = false
        body.completedAt = null
    }

    Todo.findByIdAndUpdate(id, { $set: body }, { new: true }).then(todo => {
        if (!todo) return res.status(404).send()
        res.send({ todo })
    }).catch(e => res.status(404).send())
})

//====================================================================//
app.post('/todos', authenticate, async (req, res) => {
    const todo = new Todo({
        text: req.body.text,
        _creator: req.user._id,
        id: new Date().getTime()
    })
    todo.save().then((doc) => {
        res.send(doc);
    }, e => res.status(400).send(e))
})
//====================================================================//
app.post('/users', (req, res) => {
    let body = _.pick(req.body, ['email', 'password'])
    let user = new User(body)
    user.save().then(() => {
        return user.generateAuthToken()
    }).then((token) => {
        res.header('x-auth', token).send(user)
    }).catch(e => res.status(400).send(e))
})
//====================================================================//

app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user)
})
//====================================================================//

app.post('/users/login', (req, res) => {
    const body = _.pick(req.body, ['email', 'password'])

    User.findByCredentials(body.email, body.password).then((user) => {
        return user.generateAuthToken().then((token) => {
            res.header('x-auth', token).send(user)
        })
    }).catch((e) => {
        res.status(400).send()
    })

})
//====================================================================//

app.delete('/users/me/token', authenticate, (req, res) => {
    req.user.removeToken(req.token).then(() => {
        res.status(200).send()
    }, () => {
        res.status(400).send()
    })
})
//====================================================================//


//================================================================//
app.listen(port, () => {
    console.log(`app is listening on port ${port}`)
})

module.exports = { app }