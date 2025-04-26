import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// Basic component 
const DashboardBasic = () => {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <h1>Dashboard</h1>
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
    </div>
  );
};

export default DashboardBasic;