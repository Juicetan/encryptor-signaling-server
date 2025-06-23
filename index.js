import ServerManager from "./app/controllers/serverManager.mjs";

const server = new ServerManager();
server.connect();

// Handle process termination
process.on('SIGINT', async () => {
  console.log('Caught interrupt signal (SIGINT), closing DB connection...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Caught termination signal (SIGTERM), closing DB connection...');
  process.exit(0);
});