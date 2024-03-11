import mongoose from 'mongoose';

const chatSchema = mongoose.Schema(
    {
        photo: {
            type: String,
            //По умолчанию с начала
            default: 'https://cdn.icon-icons.com/icons2/249/PNG/256/User_Group_27014.png',
        },
        chatName: {
            type: String,
        },
        isGroup: {
            type: Boolean,
            default: false,
        },
        users: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        latestMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message',
        },
        groupAdmin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);
const chatModel = mongoose.model('Chat', chatSchema);
export default chatModel;
