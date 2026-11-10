const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mess_management';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(` MongoDB Connected: ${conn.connection.host} / Database: ${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.error(`! MongoDB Connection Error: ${err.message}`);
    console.error('---------------------------------------------------------');
    console.error(' Please verify that MongoDB is running locally:');
    console.error('   e.g. net start MongoDB   OR   mongod');
    console.error(' Or provide a cloud MongoDB Atlas connection URI in backend/.env:');
    console.error('   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/mess_management');
    console.error('---------------------------------------------------------');
    // If running in development without local mongo, log notice
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Backend server is continuing to run so HTTP endpoints and static frontend are served.');
    } else {
      process.exit(1);
    }
  }
};

module.exports = { connectDB };
