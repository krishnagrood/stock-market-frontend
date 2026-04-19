import React, { useEffect, useState } from 'react';

const MarketClashSplash = ({ onComplete }) => {
  const [phase, setPhase] = useState('entrance'); // entrance, tension, clash, resolve

  useEffect(() => {
    // 1. Entrance phase - elements fade in and scale up slowly
    const timer1 = setTimeout(() => setPhase('tension'), 800);
    // 2. Tension phase - high frequency vibration, loading bar fills
    const timer2 = setTimeout(() => setPhase('clash'), 2200);
    // 3. Clash phase - screen flash, aggressive impact, glitch effect
    const timer3 = setTimeout(() => setPhase('resolve'), 3000);
    // 4. Resolve phase - fade out completely
    const timer4 = setTimeout(() => onComplete(), 3600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  return (
    <div style={{
      ...styles.overlay,
      opacity: phase === 'resolve' ? 0 : 1,
      transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
    }}>
      <div style={styles.backgroundGrid} />
      
      {/* Intense flash on clash */}
      <div style={{
        ...styles.flash,
        opacity: phase === 'clash' ? 1 : 0
      }} />

      <div style={{
        ...styles.container,
        transform: phase === 'entrance' ? 'scale(0.95)' : 
                   phase === 'tension' ? 'scale(1)' :
                   phase === 'clash' ? 'scale(1.05)' : 'scale(1.1)',
      }}>
        
        {/* Dynamic Glow */}
        <div style={{
          ...styles.glow,
          background: phase === 'clash' 
            ? 'radial-gradient(circle, rgba(239, 68, 68, 0.4) 0%, transparent 60%)'
            : 'radial-gradient(circle, rgba(78, 222, 163, 0.15) 0%, transparent 70%)',
          animation: phase === 'tension' ? 'pulseGlow 0.5s infinite alternate' : 'none'
        }} />
        
        {/* Main Image Wrapper */}
        <div style={{
          ...styles.imageWrapper,
          animation: phase === 'tension' ? 'vibrate 0.1s infinite' :
                     phase === 'clash' ? 'heavyShake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both' : 'none',
          boxShadow: phase === 'clash' 
            ? '0 0 80px rgba(239, 68, 68, 0.6)' 
            : '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
          borderColor: phase === 'clash' ? 'rgba(239, 68, 68, 0.5)' : 'rgba(255, 255, 255, 0.1)',
        }}>
          <img 
            src="/clash.png" 
            alt="Bull vs Bear" 
            style={{
              ...styles.image,
              transform: phase === 'tension' ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform 1.4s ease-out'
            }}
          />
          {/* Scanline effect over image */}
          <div style={styles.scanlines} />
        </div>

        {/* Text area */}
        <div style={{
          ...styles.textWrapper,
          animation: phase === 'clash' ? 'glitch 0.3s cubic-bezier(.25, .46, .45, .94) both infinite' : 'none'
        }}>
          <h1 style={{
            ...styles.title,
            color: phase === 'clash' ? '#ff4d4d' : '#ffffff',
            textShadow: phase === 'clash' ? '0 0 20px rgba(255,77,77,0.8)' : '0 0 20px rgba(255,255,255,0.3)'
          }}>MARKET ODYSSEY</h1>
          
          <div style={styles.loadingContainer}>
            <div style={{
              ...styles.loadingBar,
              width: phase === 'entrance' ? '10%' : 
                     phase === 'tension' ? '85%' : '100%',
              backgroundColor: phase === 'clash' ? '#ff4d4d' : '#4edea3',
              boxShadow: phase === 'clash' ? '0 0 10px #ff4d4d' : '0 0 10px #4edea3',
            }} />
          </div>
          <p style={{
            ...styles.subtitle,
            color: phase === 'clash' ? '#ff8080' : '#8a938c'
          }}>
            {phase === 'entrance' ? 'INITIALIZING TERMINAL...' : 
             phase === 'tension' ? 'CALCULATING MARKET FORCES...' : 
             phase === 'clash' ? 'SYSTEM OVERRIDE!' : 'ACCESS GRANTED'}
          </p>
        </div>
      </div>

      <style>
        {`
          @keyframes pulseGlow {
            0% { opacity: 0.8; transform: translate(-50%, -50%) scale(0.9); }
            100% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
          }
          @keyframes vibrate {
            0% { transform: translate(0) }
            20% { transform: translate(-2px, 2px) }
            40% { transform: translate(-2px, -2px) }
            60% { transform: translate(2px, 2px) }
            80% { transform: translate(2px, -2px) }
            100% { transform: translate(0) }
          }
          @keyframes heavyShake {
            10%, 90% { transform: translate3d(-4px, 0, 0) scale(1.02); }
            20%, 80% { transform: translate3d(6px, 0, 0) scale(1.02); }
            30%, 50%, 70% { transform: translate3d(-10px, 0, 0) scale(1.02); }
            40%, 60% { transform: translate3d(10px, 0, 0) scale(1.02); }
          }
          @keyframes glitch {
            0% { transform: translate(0) }
            20% { transform: translate(-5px, 5px) }
            40% { transform: translate(-5px, -5px) }
            60% { transform: translate(5px, 5px) }
            80% { transform: translate(5px, -5px) }
            100% { transform: translate(0) }
          }
          @keyframes gridMove {
            0% { transform: translateY(0); }
            100% { transform: translateY(50px); }
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
    backgroundColor: '#050706',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99999,
    overflow: 'hidden',
  },
  backgroundGrid: {
    position: 'absolute',
    top: '-50%',
    left: '-50%',
    width: '200%',
    height: '200%',
    backgroundImage: 'linear-gradient(rgba(78, 222, 163, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(78, 222, 163, 0.04) 1px, transparent 1px)',
    backgroundSize: '50px 50px',
    animation: 'gridMove 4s linear infinite',
    pointerEvents: 'none',
  },
  flash: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 1,
    transition: 'opacity 0.1s ease-out',
    pointerEvents: 'none',
  },
  container: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    transition: 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)',
    zIndex: 2,
  },
  glow: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    width: 'min(600px, 120vw)',
    height: 'min(600px, 120vw)',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
    transition: 'all 0.3s ease',
  },
  imageWrapper: {
    width: 'min(420px, 85vw)',
    height: 'min(420px, 85vw)',
    borderRadius: '30px',
    overflow: 'hidden',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    position: 'relative',
    transition: 'all 0.3s ease',
    backgroundColor: '#121212',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    filter: 'contrast(1.1) saturate(1.2)',
  },
  scanlines: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
    backgroundSize: '100% 4px, 3px 100%',
    pointerEvents: 'none',
  },
  textWrapper: {
    marginTop: '40px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  title: {
    fontSize: 'clamp(22px, 7vw, 36px)',
    fontWeight: '900',
    letterSpacing: '0.4em',
    margin: '0 0 20px 0',
    transition: 'all 0.2s ease',
    textTransform: 'uppercase',
  },
  loadingContainer: {
    width: '280px',
    height: '4px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '14px',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  loadingBar: {
    height: '100%',
    transition: 'width 1.4s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.2s ease',
  },
  subtitle: {
    fontSize: '11px',
    fontWeight: '800',
    letterSpacing: '0.25em',
    margin: 0,
    textTransform: 'uppercase',
    transition: 'color 0.2s ease',
  }
};

export default MarketClashSplash;
