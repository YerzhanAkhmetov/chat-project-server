import mongoose from "mongoose";

const messageSchema = mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        message: {
            type: String,
            trim: true,
        },
        chatId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Chat",
        },
        // image: {
        //     type: String, // Изображение хранится в виде строки (base64)
        // },
    },
    {
        timestamps: true,
    }
);
const messageModel = mongoose.model("Message", messageSchema);
export default messageModel;
