import React from 'react';

function ContactUs() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full bg-white shadow-lg rounded-lg p-8 md:p-12">
        <h1 className="text-4xl font-bold text-green-700 mb-6 text-center">Contact Us</h1>
        
        <p className="text-gray-700 text-lg leading-relaxed mb-6 text-center">
          If you have any questions, feel free to reach out to us:
        </p>
        
        <div className="space-y-6 text-center">
          <div>
            <h2 className="text-xl font-semibold text-green-800">Email</h2>
            <p className="text-gray-600 leading-relaxed">
              <a href="mailto:support@abc-electric.com" className="text-blue-500 hover:underline">support@abc-electric.com</a>
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-green-800">Phone</h2>
            <p className="text-gray-600 leading-relaxed">+1 (123) 456-7890</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-green-800">Address</h2>
            <p className="text-gray-600 leading-relaxed">
              123 Renewable Way, Green City, EcoLand
            </p>
          </div>

          <p className="text-gray-600 leading-relaxed mt-8">
            Our team is available from Monday to Friday, 9 AM - 5 PM.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ContactUs;
