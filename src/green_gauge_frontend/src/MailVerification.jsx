import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import backend from './backendActor'; // Import the ICP actor for backend calls

const MailVerification = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Handle OTP input with validation (4 digits max)
  const handleOtpChange = (e) => {
    const { value } = e.target;
    if (/^\d*$/.test(value) && value.length <= 4) {
      setOtp(value);
    }
  };

  // Handle email input
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  // Send OTP to email using the backend actor
  const handleSendOtp = async (e) => {
    e.preventDefault();
    try {
      // Call the canister's send_otp function
      const response = await backend.send_otp(email);
      console.log('OTP sent successfully:', response);
      setSuccess(response.message);
      setError('');
    } catch (err) {
      console.error('Error sending OTP:', err);
      setError(err.message || 'Failed to send OTP');
      setSuccess('');
    }
  };

  // Verify OTP using the backend actor
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await backend.verify_otp(email, otp);
      console.log('OTP verification successful:', response);
      setSuccess(response.message);
      setError('');
      navigate('/login'); // Redirect to login on successful verification
    } catch (err) {
      console.error('Error verifying OTP:', err);
      setError(err.message || 'Verification failed');
      setOtp(''); // Clear the OTP field if there's an error
      setSuccess('');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-bl from-green-500 to-yellow-50">
      <form className="max-w-md mx-auto bg-white shadow-lg rounded-lg p-8" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Email Verification</h2>
        <p className="text-gray-600 text-center mb-6">
          We will send a verification code to your email address
        </p>

        {/* Email Input Field */}
        <div className="mb-4">
          <input
            required
            type="email"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-green-500"
            placeholder="Email"
            value={email}
            onChange={handleEmailChange}
          />
        </div>

        {/* Send OTP Button */}
        <button
          type="button"
          className="w-full bg-green-600 text-white py-2 rounded-md mb-4 font-semibold hover:bg-green-700 transition"
          onClick={handleSendOtp}
        >
          Send OTP
        </button>

        {/* OTP Input Field */}
        <div className="mb-4 flex justify-center">
          <input
            className="w-20 text-center py-2 border-b-2 border-gray-300 focus:outline-none focus:border-green-500 text-xl tracking-widest"
            placeholder="_ _ _ _"
            maxLength="4"
            type="text"
            value={otp}
            onChange={handleOtpChange}
          />
        </div>

        {/* Verify OTP Button */}
        <button
          className="w-full bg-green-600 text-white py-2 rounded-md font-semibold hover:bg-green-700 transition"
          type="submit"
        >
          Verify
        </button>

        {/* Resend Code Section */}
        <p className="text-gray-600 text-center mt-4">
          Didn't receive the code?{' '}
          <button
            type="button"
            className="text-indigo-600 hover:underline"
            onClick={handleSendOtp}
          >
            Resend Code
          </button>
        </p>

        {/* Success/Error Messages */}
        {success && <p className="text-green-600 text-center mt-4">{success}</p>}
        {error && <p className="text-red-600 text-center mt-4">{error}</p>}
      </form>
    </div>
  );
};

export default MailVerification;
