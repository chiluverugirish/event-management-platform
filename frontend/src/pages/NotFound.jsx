import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';

/**
 * 404 Not Found Page
 */
const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center px-4">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary-600">404</h1>
          <h2 className="text-3xl font-semibold text-gray-900 mt-4 mb-2">Page Not Found</h2>
          <p className="text-xl text-gray-600">
            Oops! The page you're looking for doesn't exist.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <Button variant="primary" size="lg">
              Go Home
            </Button>
          </Link>
          <Link to="/events">
            <Button variant="secondary" size="lg">
              Browse Events
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
