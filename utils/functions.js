function checkAuth(req, res, next) {  
  if (!req.session.username) {
    return res.redirect('/auth/login');
  }
  next();
}

function checkLoggedIn(req, res, next) {
  if (req.session.username) {
    return res.redirect('/dashboard');
  }
  next();
}

function generateOTP() {
  const digits = '0123456789';
  let OTP = '';
  for (let i = 0; i < 6; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
}

function generateRandomByte(length) {
  //const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
  let randomByte = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    randomByte += chars.charAt(randomIndex);
  }
  return randomByte;
}

function formatDateToString(dateString) {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Adding 1 because months are zero-based
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  return `${day}-${month}-${year}-${hours}:${minutes}:${seconds}`;
}

module.exports = {
  checkAuth,
  checkLoggedIn,
  generateOTP,
  generateRandomByte,
  formatDateToString
};