import React from 'react';
import { Link } from 'react-router-dom';
import TestComponent from '../components/TestComponent';
import { TestHealthEvents } from '../components/TestHealthEvents';

export default function TestPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-blue-600 dark:bg-blue-800 text-white p-4">
        <h1 className="text-xl font-bold">Test Page</h1>
      </header>
      
      {/* Main content */}
      <main className="flex-grow p-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 gap-6">
            {/* Health Events Testing Section */}
            <section>
              <h2 className="text-lg font-semibold mb-3 dark:text-gray-100">Health Events Testing</h2>
              <TestHealthEvents />
            </section>
            
            {/* Original Test Component */}
            <section>
              <h2 className="text-lg font-semibold mb-3 dark:text-gray-100">General Testing</h2>
              <TestComponent />
            </section>
          </div>
          
          <div className="mt-8 space-y-4">
            <h2 className="text-lg font-semibold dark:text-gray-100">Navigation Test</h2>
            <div className="flex flex-wrap gap-4">
              <Link to="/" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Dashboard
              </Link>
              <Link to="/investments" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                Investments
              </Link>
              <Link to="/properties" className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">
                Properties
              </Link>
              <Link to="/lifestyle" className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">
                Lifestyle
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white p-4 text-center">
        <p>Test Footer</p>
      </footer>
    </div>
  );
}