import 'dotenv/config';
import app from './app.js';
import './config/redisClient.js';
import * as userService from './services/userService.js';
import { initWebSocketServer } from './services/notificationService.js';

const users = [
  { id: 1, name: 'Admin User', email: 'admin@example.com', password: 'password', role: 'Admin' },
  { id: 2, name: 'Manager User', email: 'manager@example.com', password: 'password', role: 'Manager' },
  { id: 3, name: 'Staff User', email: 'staff@example.com', password: 'password', role: 'Staff' }
];

const seedUsers = async () => {
  const existingUsers = await userService.getAllUsers();
  if (existingUsers.length === 0) {
    console.log('Seeding users...');
    for (const user of users) {
      await userService.createUser(user);
    }
    console.log('Users seeded.');
  }
};

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  if (process.env.NODE_ENV !== 'test') {
    seedUsers();
  }
});

initWebSocketServer(server);

export default server;
