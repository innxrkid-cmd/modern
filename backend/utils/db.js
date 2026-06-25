import dns from 'dns';
import mongoose from 'mongoose';

const connectDB = async () => {
  const dnsServers = process.env.MONGODB_DNS_SERVERS
    ? process.env.MONGODB_DNS_SERVERS.split(',').map((server) => server.trim()).filter(Boolean)
    : [];

  if (dnsServers.length > 0) {
    dns.setServers(dnsServers);
    console.log('🔧 Using forced DNS servers for MongoDB SRV lookup:', dns.getServers());
  } else if (dns.getServers().length === 1 && dns.getServers()[0] === '127.0.0.1') {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
    console.log('🔧 Local DNS stub resolver detected, forcing public DNS servers:', dns.getServers());
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Missing MONGODB_URI in environment');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, { dbName: process.env.MONGODB_DB || 'modern_hrms' });
    console.log('✅ Connected to MongoDB Atlas');
  } catch (error) {
    console.error('❌ MongoDB connection failed', error);
    process.exit(1);
  }
};

export default connectDB;
