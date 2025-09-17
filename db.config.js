import mongoose from 'mongoose';
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/ChatterUp';

export const connectDB = async () => {
	try {
		await mongoose.connect(MONGO_URL, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
		console.log('MongoDB connected with localhost:27017/ChatterUp');
	} catch (err) {
		console.error(err.message);
		process.exit(1);
	}
}
