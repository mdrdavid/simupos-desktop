import crypto from "crypto";

export const generateOTP = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

export const sendOTP = async (phone: string, otp: string): Promise<void> => {
  // Implementation for sending OTP via SMS
  // This would integrate with SMS providers like Twilio, AWS SNS, etc.
  console.log(`Sending OTP ${otp} to ${phone}`);

  // For development, just log the OTP
  if (process.env.NODE_ENV === "development") {
    console.log(`OTP for ${phone}: ${otp}`);
  }

  // In production, implement actual SMS sending
  // Example with Twilio:
  // const client = twilio(accountSid, authToken);
  // await client.messages.create({
  //   body: `Your SimuPOS verification code is: ${otp}`,
  //   from: process.env.TWILIO_PHONE_NUMBER,
  //   to: phone
  // });
};
