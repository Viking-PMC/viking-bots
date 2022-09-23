import 'dotenv/config';
import { DataSource } from 'typeorm';
export const AppDataSource = new DataSource({
  useUnifiedTopology: true, // if you add this option the problem will solved
  useNewUrlParser: true,
  type: 'mongodb',
  url: process.env.MONGO_URI,
  synchronize: true,
  entities: [__dirname + '/entities/*.{ts,js}'],
});
