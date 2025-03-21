import React from 'react';

const About = () => {
  return (
    <div className="about-page flex flex-col items-center justify-center min-h-screen bg-gray-100 p-5">
      {/* Main container for About page */}
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl text-center">
        {/* Heading */}
        <h1 className="text-4xl font-bold text-[#1C767C] mb-4">About Us</h1>
        {/* Description */}
        <p className="text-gray-700 text-lg mb-6">
          Welcome to our platform! We are committed to helping you monitor, track, and manage your energy consumption and carbon footprint. Our mission is to provide efficient tools that help businesses stay sustainable and meet their energy goals, contributing to a greener future.
        </p>
        {/* Values */}
        <p className="text-gray-700 text-lg mb-6">
          Our platform ensures that you can take actions to minimize environmental impact, offering insights and real-time alerts on energy usage. We believe in empowering companies to make data-driven decisions for a sustainable tomorrow.
        </p>
        {/* Call to action */}
        <p className="text-gray-700 text-lg">
          Join us on this journey towards a more eco-friendly future!
        </p>
      </div>
    </div>
  );
};

export default About;
