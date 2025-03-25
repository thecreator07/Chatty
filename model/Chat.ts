// models/Chat.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface Chat extends Document {
    participants: mongoose.Types.ObjectId[];
    lastMessage?: mongoose.Types.ObjectId; 
}

const ChatSchema: Schema<Chat> = new Schema(
    {
        participants: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
        ],
        lastMessage: {
            type: Schema.Types.ObjectId,
            ref: 'Message',
        },
    },
    { timestamps: true }
);
// ChatSchema.index({ participants: 1 });

const ChatModel =
    (mongoose.models.Chat as mongoose.Model<Chat>) ||
    mongoose.model<Chat>('Chat', ChatSchema);

export default ChatModel;
