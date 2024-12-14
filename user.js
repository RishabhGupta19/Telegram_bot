import mongoose from 'mongoose'


const userSchema = mongoose.Schema({

    tgid: {
            type:String,
            required: true,
            unique: true,
    },
    firstName: {
        type:String,
        required: true,
    },
    lastName: {
        type:String,
        required: true,
    },
    isBot: {
        type:Boolean,
        required: true,
    },
    username: {
        type:String,
        required: true,
        unique: true,
},
    promptTokens: {
        type:String,
        required: false,
    },
    CompletionTokens: {
        type:String,
        required: false,
    },

},
    {timestamps: true}

);

export default mongoose.model('User', userSchema);