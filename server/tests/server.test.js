const expect = require('chai').expect
const{ObjectID} = require('mongodb')
const request = require('supertest')
const {app} = require('../server')
const {Todo} = require('../models/Todo')
const {User} = require('../models/User')
const {todos,populateTodos,users,populateUsers} = require('./seed/seed')

beforeEach(populateUsers)
beforeEach(populateTodos)

describe('POST /todos',()=>{

    it('should create new todo',(done)=>{
        const text= 'test todo text'
        request(app)
        .post('/todos')
        .send({text})
        .set('x-auth',users[0].tokens[0].token)
        .expect(200)
        .expect((res)=>{
            expect(res.body.text).to.equal(text)
        })
        .end((err,res)=>{
            if(err) return done(err)
            Todo.find().then((todos)=>{
                expect(todos).to.have.lengthOf(4)
                expect(todos[3].text).to.equal(text)
                done()
            }).catch(e=>done(e))
        })
    })

    it('should not create todo with invalid body data',(done)=>{
        request(app)
        .post('/todos')
        .send({})
        .expect(401)
        .end((err,res)=>{
            if(err) return done(err)
            Todo.find().then((todos)=>{
                expect(todos).to.have.lengthOf(3)
                done()
            }).catch(e=>done(e))
        })
    })
})

describe('GET /todos',()=>{
    it('should get all todos',(done)=>{
        request(app)
        .get('/todos')
        .set('x-auth',users[0].tokens[0].token)
        .expect(200)
        .expect((res)=>{
            //number of todos created by each user ▼▼
            expect(res.body.todos).to.have.lengthOf(1)
        })
        .end(done)
    })
})

describe('GET /todos/:id',()=>{
    
    it('should return todo doc',(done)=>{
        request(app)
        .get(`/todos/${todos[0]._id.toHexString()}`)
        .set('x-auth',users[0].tokens[0].token)
        .expect(200)
        .expect(res=>{
            expect(res.body.todo.text).to.equal(todos[0].text)
        }).end(done)
    })
    
    it('shouldn\'t  return todo doc created by other user',(done)=>{
        request(app)
        .get(`/todos/${todos[1]._id.toHexString()}`)
        .set('x-auth',users[0].tokens[0].token)
        .expect(404)
        .end(done)
    })
    it('should return 404 if todo not found',(done)=>{
        let hexId = new ObjectID().toHexString()
        request(app)
        .get(`/todos/${hexId}`)
        .set('x-auth',users[0].tokens[0].token)
        .expect(404)
        .end(done)
    })
    
    it('should return 404 for non-object ids',(done)=>{
        request(app)
        .get('/todos/123')
        .set('x-auth',users[0].tokens[0].token)
        .expect(404)
        .end(done)
    })
})

 
describe('PATCH /todos/:id',()=>{
    
    it('should update a todo',(done)=>{
        let hexId =todos[0]._id.toHexString()
        let body = {text:'some data modification',completed:true}
        request(app)
        .patch(`/todos/${hexId}`)
        .send(body)
        .expect(200)
        .expect(res=>{
            expect(res.body.todo.text).to.equal(body.text)
            expect(res.body.todo.completed).to.equal(body.completed)
            expect(res.body.todo.completedAt).to.be.an('number')
        })
        .end(done)
    })
    
    it('clear completedAt when todo is not completed',(done)=>{
        let hexId =todos[1]._id.toHexString()
        let body = {text:'some data modification',completed:false}
        request(app)
        .patch(`/todos/${hexId}`)
        .send(body)
        .expect(200)
        .expect(res=>{
            expect(res.body.todo.text).to.equal(body.text)
            expect(res.body.todo.completed).to.equal(body.completed)
            expect(res.body.todo.completedAt).to.be.null
        })
        .end(done)
    })
})

describe('GET /users/me', () => {
    it('should return user if authenticated', (done) => {
      request(app)
        .get('/users/me')
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect((res) => {
          expect(res.body._id).to.equal(users[0]._id.toHexString());
          expect(res.body.email).to.equal(users[0].email);
        })
        .end(done);
    });
    // it('should return 401 if not authenticated', (done) => {
    //     request(app)
    //       .get('/users/me')
    //       .expect(401)
    //       .expect((res) => {
    //         expect(res.body).to.equal({});
    //       })
    //       .end(done);
    //   })
})

describe('POST /users',()=>{
    it('should create users',(done)=>{
        let user = {email:'mostafa11@yahoo.com',password:'123adff'}
        request(app)
        .post('/users')
        .send(user)
        .expect(200)
        .expect((res)=>{
            expect(res.headers['x-auth']).to.exist
            expect(res.body._id).to.exist
            expect(res.body.email).to.equal(user.email)
        })
        .end((err)=>{
            if(err){
                return done(err)
            }
            User.findOne({email:user.email}).then((doc)=>{
                expect(doc.password).to.not.equal(user.password)
                done()
            }).catch(e=>done(e))
        })
    })


    it('should return validation errors if request is invalid',(done)=>{
        request(app)
        .post('/users')
        .send({email:'moasff@ffkgkg.com',password:'123ss'})
        .expect(400)
        .end(done)
    })
    
    it('should not create user if email  in use',(done)=>{
        request(app)
        .post('/users')
        .send({email:'hotwheels22@hot.com',password:'123ssdd'})
        .expect(400)
        .end(done)

    })
})


describe('POST /users/login',()=>{
    it('should login user and return auth token', (done) => {
        request(app)
          .post('/users/login')
          .send({
            email: users[1].email,
            password: users[1].password
          })
          .expect(200)
          .expect((res) => {
            expect(res.headers['x-auth']).to.exist;
          })
          .end((err, res) => {
            if (err) {
              return done(err);
            }
    
            User.findById(users[1]._id).then((user) => {
        
              expect(user.tokens[0]).to.include({
                access: 'auth',
                token: res.headers['x-auth']
              });
              done();
            }).catch((e) => done(e));
          });
      });
    it('should reject invalid login',(done)=>{
        request(app)
        .post('/users/login')
        .send({email:users[1].email,password:users[1].password+'1'})
        .expect(400)
        .expect((res)=>{
            expect(res.headers['x-auth']).to.not.exist
        })
        .end((err,res)=>{
            if(err){
                return done()
            }
            User.findById(users[1]._id).then((user)=>{
                expect(user.tokens).to.have.lengthOf(1)
                done()
            }).catch(e=>done(e))

        })
    })
})

describe('DELETE /users/me/token',()=>{
    it('it should remove auth token on logout',(done)=>{
            request(app)
            .delete('/users/me/token')
            .send({email:users[0].email,password:users[0].password})
            .set('x-auth',users[0].tokens[0].token)
            .expect(200)
            .end((err,res)=>{
                if (err) return done()
                User.findById(users[0]._id).then(user=>{
                    expect(user.tokens).to.have.lengthOf(0)
                    done()
                }).catch(e=>done(e))
            })
    })
})