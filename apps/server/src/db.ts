import mongoose from 'mongoose';

export async function connectDb(): Promise<void> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn('[db] MONGODB_URI not set — skipping database connection. Content/contact routes that need it will fail.');
    return;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      // Bounds how long an individual socket operation (e.g. the contact
      // form's create() call) can hang if the connection drops mid-session
      // (Atlas free-tier cold-resume, transient network blip) rather than
      // only bounding the initial connection attempt above.
      socketTimeoutMS: 10000,
    });
    console.log('[db] Connected to MongoDB');
  } catch (err) {
    console.error('[db] Failed to connect to MongoDB:', err);
    // Don't crash the whole process on boot for a portfolio site — log and
    // let health checks reflect degraded state instead of hard-exiting.
  }
}
