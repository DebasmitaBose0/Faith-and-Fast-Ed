import crypto from "crypto";

const generatedOtp = () => {
  // Use crypto for a cryptographically secure random number
  const buffer = crypto.randomBytes(4);
  const number = buffer.readUInt32BE(0);
  // Get a 6 digit number
  return (number % 900000) + 100000;
};

export default generatedOtp;
