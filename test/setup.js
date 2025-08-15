import app from '../src/app.js';
import redisClient from '../src/config/redisClient.js';
import * as userService from '../src/services/userService.js';

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

export default async () => {
  await redisClient.flushall();
  await seedUsers();

  await new Promise((resolve) => {
    global.server = app.listen(4000, () => {
      console.log('Test server running on port 4000');
      resolve();
    });
  });
};
