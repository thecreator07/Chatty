// models/Message.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface Message extends Document {
    chat: mongoose.Types.ObjectId;
    sender: mongoose.Types.ObjectId;
    content: string;
    messageType: 'text' | 'image' | 'video' | 'file';
    mediaUrl?: string;
    isRead: boolean;
    readBy: mongoose.Types.ObjectId[];
}

const MessageSchema: Schema<Message> = new Schema(
    {
        chat: {
            type: Schema.Types.ObjectId,
            ref: 'Chat',
            required: true,
        },
        sender: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        content: {
            type: String,
            required: function () {
                return this.messageType === 'text';
            },
        },
        messageType: {
            type: String,
            enum: ['text', 'image', 'video', 'file'],
            default: 'text',
        },
        mediaUrl: {
            type: String,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        readBy: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
    },
    { timestamps: true }
);
// MessageSchema.index({ chat: 1 });

const MessageModel =
    (mongoose.models.Message as mongoose.Model<Message>) ||
    mongoose.model<Message>('Message', MessageSchema);

export default MessageModel;
