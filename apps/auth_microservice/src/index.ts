import app from './main';
import dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(__dirname, '..', '..', '..', '.env') });

app.listen(process.env.AUTH_SERVICE_PORT, () => {
  console.log(`Server is running on port: ${process.env.AUTH_SERVICE_PORT}`);
});
