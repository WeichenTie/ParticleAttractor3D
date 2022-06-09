import React, { useEffect, useRef } from 'react';
import logo from './logo.svg';
import './App.css';
import Engine from './Engine/Core/Engine';

function App() {

  const engineRef = useRef(null);
  useEffect(()=>{
    engineRef.current = new Engine('gl-canvas');
    engineRef.current.run();
  },[]);

  return (
    <canvas id='gl-canvas'>

    </canvas>
  );
}

export default App;
