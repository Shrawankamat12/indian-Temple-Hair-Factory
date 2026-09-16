function generateOrderNumber() {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `ITR${Date.now().toString().slice(-6)}${rand}`;
}

module.exports = generateOrderNumber;
