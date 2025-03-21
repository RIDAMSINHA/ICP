import React from 'react';

function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full bg-white shadow-lg rounded-lg p-8 md:p-12">
        <h1 className="text-4xl font-bold text-green-700 mb-6 text-center">Privacy Policy</h1>
        
        <p className="text-gray-700 text-lg leading-relaxed mb-6 text-center">
          Your privacy is important to us. This policy outlines how we collect, use, and safeguard your information.
        </p>
        
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-green-800">Information Collection</h2>
            <p className="text-gray-600 leading-relaxed">
              We collect personal information when you use our services, such as your name, email address, and usage data.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-green-800">Use of Information</h2>
            <p className="text-gray-600 leading-relaxed">
              The information collected is used to improve our services, personalize user experience, and communicate important updates.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-green-800">Data Security</h2>
            <p className="text-gray-600 leading-relaxed">
              We use industry-standard measures to protect your data from unauthorized access.
            </p>
          </div>

          <p className="text-gray-600 leading-relaxed mt-8">
            For more details, please contact us at <a href="mailto:privacy@abc-electric.com" className="text-blue-500 hover:underline">privacy@abc-electric.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
