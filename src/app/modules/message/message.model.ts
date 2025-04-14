import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;

const messageSchema = new Schema(
  {
    text: {
      type: String,
      default: null,
    },
    image: {
      type: String,
      default: null,
    },

    seen: {
      type: Boolean,
      default: false,
    },
    sender: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    receiver: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },

    chat: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Chat',
    },
    taskId: {
      type: Schema.Types.ObjectId,
      required: false,
      ref: 'TaskPost',
    },
    taskStatus: {
      type: String,
      enum: ['pending', 'accept', 'cencel'],
      required: false,
    },
    offerPrice: {
      type: Number,
      required: false,
    },
    reason:{
      type: String,
      required: false
    }
  },
  {
    timestamps: true,
  },
);
const Message =  model('Message', messageSchema);

export default Message;
