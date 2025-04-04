import React from 'react';

export const TestComponent: React.FC = () => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Test Component</h2>
      <p className="mb-4">This is a test component to verify routing works correctly.</p>
      <ul className="list-disc pl-6 mb-4">
        <li>Item 1</li>
        <li>Item 2</li>
        <li>Item 3</li>
      </ul>
    </div>
  );
};

export default TestComponent;