import React, { useEffect, useState } from 'react';

const MarketClashSplash = ({ onComplete }) => {
  const [phase, setPhase] = useState('initial'); // initial, clash, fade

  useEffect(() => {
    // Stage 1: Entrance
    const timer1 = setTimeout(() => setPhase('clash'), 500);
    // Stage 2: Hold the clash
    const timer2 = setTimeout(() => setPhase('fade'), 2500);
    // Stage 3: Complete
    const timer3 = setTimeout(() => onComplete(), 3200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  return (
    <div style={styles.overlay}>
      <div style={{
        ...styles.container,
        opacity: phase === 'fade' ? 0 : 1,
        transform: phase === 'fade' ? 'scale(1.1)' : 'scale(1)',
      }}>
        <div style={styles.glow} />
        
        <div style={{
          ...styles.imageWrapper,
          animation: phase === 'clash' ? 'shake 0.5s infinite' : 'none'
        }}>
          <img 
            src="/clash.png" 
            alt="Bull vs Bear" 
            style={styles.image}
          />
        </div>

        <div style={styles.textWrapper}>
          <h1 style={styles.title}>MARKET ODYSSEY</h1>
          <p style={styles.subtitle}>Analyzing Market Forces...</p>
        </div>
      </div>

      <style>
        {`
          @keyframes shake {
            0% { transform: translate(1px, 1px) rotate(0deg); }
            10% { transform: translate(-1px, -2px) rotate(-1deg); }
            20% { transform: translate(-3px, 0px) rotate(1deg); }
            30% { transform: translate(3px, 2px) rotate(0deg); }
            40% { transform: translate(1px, -1px) rotate(1deg); }
            50% { transform: translate(-1px, 2px) rotate(-1deg); }
            60% { transform: translate(-3px, 1px) rotate(0deg); }
            70% { transform: translate(3px, 1px) rotate(-1deg); }
            80% { transform: translate(-1px, -1px) rotate(1deg); }
            90% { transform: translate(1px, 2px) rotate(0deg); }
            100% { transform: translate(1px, -2px) rotate(-1deg); }
          }
        `}
      </style>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: '#0a0a0c',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  container: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  glow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '400px',
    height: '400px',
    background: 'radial-gradient(circle, rgba(255, 165, 0, 0.15) 0%, transparent 70%)',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
  },
  imageWrapper: {
    width: '500px',
    height: '500px',
    borderRadius: '24px',
    overflow: 'hidden',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  textWrapper: {
    marginTop: '30px',
    textAlign: 'center',
  },
  title: {
    color: '#fff',
    fontSize: '32px',
    fontWeight: '900',
    letterSpacing: '0.3em',
    margin: 0,
    textShadow: '0 0 20px rgba(255,255,255,0.3)',
  },
  subtitle: {
    color: '#8a938c',
    fontSize: '14px',
    fontWeight: '500',
    letterSpacing: '0.15em',
    marginTop: '10px',
    textTransform: 'uppercase',
  }
};

export default MarketClashSplash;
