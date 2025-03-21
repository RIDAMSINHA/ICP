import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const HomePage = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleSignupClick = () => {
    navigate('/signup');
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-300 to-yellow-300 flex flex-col items-center justify-between">
      {/* Hero Section */}
      <section className="text-center py-20">
        <motion.h1
          className="text-6xl font-bold text-white mb-4"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Welcome to Our Green Energy Platform
        </motion.h1>
        <motion.p
          className="text-xl text-gray-100 mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          Reducing Carbon Footprints, One Step at a Time.
        </motion.p>

        <div className="flex justify-center space-x-4">
          <motion.button
            className="bg-indigo-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-indigo-700 transition duration-300 ease-in-out"
            onClick={handleLoginClick}
            whileHover={{ scale: 1.1 }}
          >
            Log In
          </motion.button>
          <motion.button
            className="bg-green-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-700 transition duration-300 ease-in-out"
            onClick={handleSignupClick}
            whileHover={{ scale: 1.1 }}
          >
            Sign Up
          </motion.button>
        </div>
      </section>

      {/* Image Carousel */}
      <section className="w-full max-w-7xl mx-auto py-10">
        <div className="flex overflow-x-scroll scrollbar-hide space-x-4">
          <motion.img
            src="https://img.freepik.com/premium-photo/paper-art-renewable-energy-with-green-energy-such-as-wind-turbines-renewable-energy-by-2050-carbon-neutral-energy-energy-consumption-co2-reduce-co2-emission-concept-generate-ai_572887-815.jpg"
            alt="Renewable Energy"
            className="h-60 w-full object-cover rounded-lg shadow-lg"
            whileHover={{ scale: 1.05 }}
          />
          <motion.img
            src="https://www.shutterstock.com/image-photo/co2-carbon-concept-icons-on-600nw-2489272589.jpg"
            alt="CO2 Reduction"
            className="h-60 w-full object-cover rounded-lg shadow-lg"
            whileHover={{ scale: 1.05 }}
          />

          <motion.img
            src="https://media.istockphoto.com/id/1388420740/photo/net-zero-and-carbon-neutral-concepts-net-zero-emissions-goals-a-climate-neutral-long-term.jpg?s=612x612&w=0&k=20&c=3ZsKkJHs8FnAk5dXdCOjd85DyKu3RissYxk161yFgBM="
            alt="Carbon Neutral"
            className="h-60 w-full object-cover rounded-lg shadow-lg"
            whileHover={{ scale: 1.05 }}
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 bg-gray-800 w-full text-center text-gray-300">
        <p>© 2024 Renewable Resources. All rights reserved.</p>
        <div className="mt-4 space-x-4">
          <a href="#" className="hover:text-white">Facebook</a>
          <a href="#" className="hover:text-white">Twitter</a>
          <a href="#" className="hover:text-white">LinkedIn</a>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
