const {Todo} = require('../../models/Todo')
const {User} = require('../../models/User')
const{ObjectID} = require('mongodb')
const jwt = require('jsonwebtoken')

const userOneId =new ObjectID()
const userTwoId =new ObjectID()
const userThreeId =new ObjectID()

const users=[{
    _id:userOneId,
    email:'hotwheels22@hot.com',
    password:'123asda',
    tokens:[{
        access:'auth',
        token:jwt.sign({_id:userOneId,access:'auth'},'secret').toString()
    }]
},
{
    _id:userTwoId,
    email:'whitewheels22@hot.com',
    password:'123asda',
    tokens:[{
        access:'auth',
        token:jwt.sign({_id:userTwoId,access:'auth'},'secret').toString()
    }]
}]

const todos=[{
    _id:new ObjectID(),
    text:'stop copying please',
    _creator:userOneId
},{
    _id:new ObjectID(),
    text:'be creative',
    completed:true,
    completedAt:333,
    _creator:userTwoId
},
{
    _id:new ObjectID(),
    text:'last dummy data added',
    _creator:userThreeId
}]

const populateTodos= (done)=>{
    Todo.deleteMany().then(()=>{
        return Todo.insertMany(todos)
    }).then(()=>done())
}

const populateUsers= (done)=>{
    User.deleteMany({}).then(()=>{
        const userOne = new User(users[0]).save()
        const userTwo = new User(users[1]).save()
        
        return Promise.all([userOne,userTwo])
    }).then(()=> done())
}


module.exports ={todos,populateTodos,users,populateUsers}