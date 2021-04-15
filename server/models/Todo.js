const { mongoose } = require('../db/mongoose')

let Todo = mongoose.model('Todo', {
    text: {
        type: String,
        required: true

    },
    completed: {
        type: Boolean,
        default: false
    },
    id: {
        type: Number
    },
    completedAt: {
        type: Number
    },
    _creator: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    }
})

module.exports = { Todo }