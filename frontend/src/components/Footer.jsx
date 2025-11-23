import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Footer Component
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">E</span>
              </div>
              <span className="text-xl font-bold text-gray-900">EventHub</span>
            </div>
            <p className="text-sm text-gray-600">
              Your ultimate platform for discovering and managing amazing events.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
            <div className="flex flex-col gap-2">
              <Link to="/events" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                Browse Events
              </Link>
              <Link to="/dashboard" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                Dashboard
              </Link>
              <Link to="/my-tickets" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                My Tickets
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Contact</h3>
            <div className="flex flex-col gap-2 text-sm text-gray-600">
              <p>Email: support@eventhub.com</p>
              <p>Phone: +1 (555) 123-4567</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 mt-8 pt-6 text-center">
          <p className="text-sm text-gray-500">
            © {currentYear} EventHub. All rights reserved. Built by Yashwant Reddy
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
