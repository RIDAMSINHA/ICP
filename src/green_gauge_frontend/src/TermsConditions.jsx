import React from 'react';

function TermsConditions() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full bg-white shadow-lg rounded-lg p-8 md:p-12">
        <h1 className="text-4xl font-bold text-green-700 mb-6 text-center">Terms & Conditions</h1>
        
        <p className="text-gray-700 text-lg leading-relaxed mb-6">
          By accessing and using our platform, you agree to the following terms and conditions:
        </p>
        
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-green-800 mb-2">1. Acceptance of Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              By accessing our website, you agree to comply with these terms.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-green-800 mb-2">2. Use of Services</h2>
            <p className="text-gray-600 leading-relaxed">
              Our platform is designed for renewable energy tracking and is not liable for any business or environmental decisions.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-green-800 mb-2">3. Limitation of Liability</h2>
            <p className="text-gray-600 leading-relaxed">
              We are not liable for any direct, indirect, or consequential damages arising from the use of our services.
            </p>
          </div>

          <p className="text-gray-600 leading-relaxed text-center mt-8">
            For further information, contact us at <a href="mailto:terms@abc-electric.com" className="text-blue-500 hover:underline">terms@abc-electric.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default TermsConditions;
