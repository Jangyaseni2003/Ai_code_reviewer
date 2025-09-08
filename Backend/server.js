require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // Bind to all network interfaces

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📡 Local: http://localhost:${PORT}`);
  console.log(`🌐 Network: http://${HOST}:${PORT}`);
  console.log(`🔗 API endpoint: http://localhost:${PORT}/ai/get-review`);
}).on('error', (err) => {
  console.error('❌ Server failed to start:', err.message);
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use!`);
    console.error(`💡 Try these solutions:`);
    console.error(`   1. Kill the process using port ${PORT}: netstat -ano | findstr :${PORT}`);
    console.error(`   2. Use a different port: set PORT=5001 in .env file`);
    console.error(`   3. Restart your computer`);
    process.exit(1);
  } else if (err.code === 'EACCES') {
    console.error(`❌ Permission denied to bind to port ${PORT}`);
    console.error(`💡 Try using a port above 1024 or run as administrator`);
    process.exit(1);
  } else {
    console.error(`❌ Unexpected error:`, err);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Server terminated');
  process.exit(0);
});