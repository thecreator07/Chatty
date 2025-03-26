// models/User.ts
import mongoose, { Schema, Document, ObjectId } from 'mongoose';


export interface User extends Document {
  _id:ObjectId
  username: string;
  mobile: string;
  password: string;
  avatar?: string;
  status: 'online' | 'offline';
  lastSeen: Date;
  contacts: mongoose.Types.ObjectId[];
}

const UserSchema: Schema<User> = new Schema(
  {
    username: {
      type: String,
      unique: true,
      required: [true, 'Username is required'],
      minlength: 3,
      maxlength: 20
    },
    mobile: {
      type: String,
      required: [true, 'mobile number is required'],
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6
    },
    avatar: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['online', 'offline'],
      default: 'offline'
    },
    lastSeen: {
      type: Date,
      default: Date.now
    },
    contacts: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  { timestamps: true }
);

const UserModel =
  (mongoose.models.User as mongoose.Model<User>) ||
  mongoose.model<User>('User', UserSchema);

export default UserModel;