require('dotenv').config();
const WEAK = ['change_this_secret', 'changeme', 'secret', 'jwt_secret', 'your_jwt_secret'];
const jwtSecret = process.env.JWT_SECRET || '';
if (!jwtSecret || WEAK.includes(jwtSecret.toLowerCase()) || jwtSecret.length < 32) {
  const msg = 'JWT_SECRET is missing, a known placeholder, or shorter than 32 characters. Generate one with: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"';
  if (process.env.NODE_ENV === 'production') { console.error(msg); process.exit(1); }
  console.warn('WARNING: ' + msg);
}
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  require('./src/services/orderSweeper').start();
});
