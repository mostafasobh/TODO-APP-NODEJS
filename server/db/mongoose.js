// const url = 'mongodb://localhost:27017/'
const pass = process.env.DB_PASSWORD
const dbName = process.env.DB_NAME
const username = process.env.DB_USERNAME
const mongoose = require('mongoose');
const db = mongoose.connection
const url = `mongodb+srv://${username}:${pass}@cluster0.6b2nn.mongodb.net/${dbName}?retryWrites=true&w=majority`
// mongoose.Promise = global.Promise
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, });


db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log("we're connected!")
});

module.exports = { mongoose };

