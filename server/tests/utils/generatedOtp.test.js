import generatedOtp from "../../utils/generatedOtp.js";

describe("generatedOtp", () => {
  it("should generate a 6 digit number", () => {
    const otp = generatedOtp();
    expect(otp).toBeGreaterThanOrEqual(100000);
    expect(otp).toBeLessThanOrEqual(999999);
  });

  it("should be a number", () => {
    const otp = generatedOtp();
    expect(typeof otp).toBe("number");
  });
});
