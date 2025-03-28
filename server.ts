import http from 'http';
import next from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { parse } from 'url';
import jwt from 'jsonwebtoken';
import UserModel from './model/User';
import MessageModel from './model/Message';
import ChatModel from './model/Chat';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = http.createServer(async (req, res) => {
    const parsedUrl = parse(req.url!, true);
    await handle(req, res, parsedUrl);
  });

  const io = new SocketIOServer(httpServer, {
    path: '/api/socketio',
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    },
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Authentication error"));

    try {
      const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { _id: string };
      // console.log(decoded)
      const user = await UserModel.findById(decoded._id);
      if (!user) return next(new Error("User not found"));
console.log(user)
      socket.data.user = user;
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on('connection', async (socket) => {
    const user = socket.data.user;

    // Update user status
    await UserModel.findByIdAndUpdate(user._id, {
      status: 'online',
      lastSeen: new Date()
    });

    // Join user to their personal room
    socket.join(user._id.toString());

    // Handle message events
    socket.on('sendMessage', async ({ chatId, content, messageType, mediaUrl }) => {
      try {
        // Create message
        const message = new MessageModel({
          chat: chatId,
          sender: user._id,
          content,
          messageType,
          mediaUrl
        });

        // Save message
        await message.save();

        // Update chat's last message
        await ChatModel.findByIdAndUpdate(chatId, { lastMessage: message._id });

        // Populate message with sender info
        const populatedMessage = await message.populate('sender', 'username avatar');

        // Emit to all participants
        const chat = await ChatModel.findById(chatId).select('participants');
        chat?.participants.forEach(participant => {
          io.to(participant.toString()).emit('receiveMessage', populatedMessage);
        });
      } catch (err) {
        console.error(err);
      }
    });

    // Handle read receipts
    socket.on('markAsRead', async (messageId) => {
      try {
        const message = await MessageModel.findByIdAndUpdate(
          messageId,
          {
            $addToSet: { readBy: user._id },
            isRead: true
          },
          { new: true }
        ).populate('sender', 'username avatar');

        io.to(message?.sender._id.toString() || '').emit('messageRead', message);
      } catch (err) {
        console.error(err);
      }
    });

    // Handle typing indicator
    socket.on('typing', (chatId) => {
      socket.to(chatId).emit('typing', {
        chatId,
        userId: user._id
      });
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      await UserModel.findByIdAndUpdate(user._id, {
        status: 'offline',
        lastSeen: new Date()
      });
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});