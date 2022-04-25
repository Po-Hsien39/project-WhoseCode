import React from 'react';
import Lottie from 'react-lottie';
import animationData from '../../assets/note.json';

export default function App({ ...props }) {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

  return (
    <div style={{ position: 'fixed', right: 45, bottom: 0 }}>
      <Lottie options={defaultOptions} height={250} width={250} {...props} />
    </div>
  );
}
