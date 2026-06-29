import React, { useState, useEffect, useRef, useMemo, useContext } from 'react';
import { Play, RefreshCw, Lock, Sparkles, UserCheck } from 'lucide-react';
import { UIContext } from '../App';

export default function SpinLotMachine({
  programs,
  callingProgramId,
  setCallingProgramId,
  onFetchCallingList,
  callingData,
  setCallingData,
  callingLoading,
  onCallMember,
  onRespinLot
}) {
  const { showToast } = useContext(UIContext);
  const notDoneMembers = callingData?.members ? callingData.members.filter(m => !m.called) : [];
  const doneMembers = callingData?.members ? callingData.members.filter(m => m.called) : [];

  const notDonePrograms = programs.filter(p => !p.has_results && !p.lot_completed);
  const donePrograms = programs.filter(p => p.has_results || p.lot_completed);

  const selectedProgram = programs.find(p => p.id.toString() === callingProgramId);
  const isFinalized = selectedProgram?.has_results;

  // Local interactive states
  const [selectedMember, setSelectedMember] = useState(null);
  const [localIsSpinning, setLocalIsSpinning] = useState(false);
  const [localSpinningMember, setLocalSpinningMember] = useState(null);
  const [localRevealedCode, setLocalRevealedCode] = useState('');

  // Animation Refs
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const rotationAngleRef = useRef(0);
  const spinStateRef = useRef('IDLE'); // 'IDLE' | 'SPINNING_CONSTANT' | 'DECELERATING' | 'REVEALED'
  const spinTargetAngleRef = useRef(0);
  const spinDecelStartTimeRef = useRef(0);
  const spinDecelStartAngleRef = useRef(0);
  const winningCodeRef = useRef('');
  const lastSlotIndexRef = useRef(-1);
  const pegBendRef = useRef(0);
  const particlesRef = useRef([]);
  const ledPulseRef = useRef(0);

  // Wheel colors
  const colors = useMemo(() => [
    '#6366f1', // Indigo / Accent
    '#38bdf8', // Sky / Info
    '#22c55e', // Green / Success
    '#fbbf24', // Yellow / Amber
    '#f43f5e', // Rose / Danger
    '#d946ef', // Fuchsia / Pink
    '#14b8a6', // Teal
    '#a855f7'  // Purple
  ], []);

  // Compute unique pregenerated lot codes in the program
  const availableCodes = useMemo(() => {
    if (!callingData?.members) return [];
    const codes = callingData.members
      .map(m => m.judge_code)
      .filter(c => c && c !== "??");
    return Array.from(new Set(codes)).sort();
  }, [callingData]);

  // Procedural Audio Synthesizer
  const initAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  };

  const playTick = () => {
    try {
      initAudio();
      const ctx = audioContextRef.current;
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle'; // Snappy click sound
      osc.frequency.setValueAtTime(700, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.03);

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.03);
    } catch (e) {
      // Silently handle audio failures due to autoplay restrictions
    }
  };

  const playWinSound = () => {
    try {
      initAudio();
      const ctx = audioContextRef.current;
      if (!ctx) return;

      const now = ctx.currentTime;
      // Ascending major chord chime arpeggio
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.5);
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Canvas drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;

    const segments = availableCodes.length > 0 ? availableCodes : ['A', 'B', 'C', 'D'];
    const numSegments = segments.length;
    const phi = (2 * Math.PI) / numSegments;

    const draw = (timestamp) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 100;

      // Update physics based on spin state
      if (spinStateRef.current === 'SPINNING_CONSTANT') {
        rotationAngleRef.current += 0.28;
        ledPulseRef.current = (ledPulseRef.current + 0.8) % 10;
      } else if (spinStateRef.current === 'DECELERATING') {
        const elapsed = timestamp - spinDecelStartTimeRef.current;
        const duration = 3000;
        const t = Math.min(elapsed / duration, 1);
        
        const easeOutCubic = 1 - Math.pow(1 - t, 3);
        rotationAngleRef.current = spinDecelStartAngleRef.current + (spinTargetAngleRef.current - spinDecelStartAngleRef.current) * easeOutCubic;
        
        ledPulseRef.current = (ledPulseRef.current + (1 - t) * 1.5) % 10;

        if (t >= 1) {
          rotationAngleRef.current = spinTargetAngleRef.current;
          spinStateRef.current = 'REVEALED';
          setLocalIsSpinning(false);
          setLocalRevealedCode(winningCodeRef.current);
          playWinSound();

          // Particle burst
          const newParticles = [];
          for (let i = 0; i < 90; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 7 + 3;
            newParticles.push({
              x: centerX,
              y: centerY,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed - 2.5,
              size: Math.random() * 8 + 4,
              color: colors[Math.floor(Math.random() * colors.length)],
              rotation: Math.random() * Math.PI * 2,
              rotationSpeed: (Math.random() - 0.5) * 0.25,
              alpha: 1,
              decay: Math.random() * 0.015 + 0.01
            });
          }
          particlesRef.current = newParticles;

          // Optimistically update callingData so they are moved to the Called list immediately in the tables
          if (localSpinningMember) {
            const memId = localSpinningMember.id;
            const winCode = winningCodeRef.current;
            setCallingData(prev => {
              if (!prev?.members) return prev;
              return {
                ...prev,
                members: prev.members.map(m => m.id === memId ? { ...m, called: true, judge_code: winCode } : m)
              };
            });
          }
        }
      } else if (spinStateRef.current === 'IDLE') {
        rotationAngleRef.current += 0.003;
        ledPulseRef.current = (ledPulseRef.current + 0.1) % 10;
      }

      rotationAngleRef.current = rotationAngleRef.current % (2 * Math.PI);

      // Deflection trigger on crossing boundaries
      const currentSlotIndex = Math.floor((((3 * Math.PI / 2 - rotationAngleRef.current) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) / phi) % numSegments;
      if (currentSlotIndex !== lastSlotIndexRef.current) {
        if (spinStateRef.current !== 'IDLE' && spinStateRef.current !== 'REVEALED') {
          playTick();
          pegBendRef.current = 0.35;
        }
        lastSlotIndexRef.current = currentSlotIndex;
      }

      pegBendRef.current *= 0.85;

      // Glow effect for whole wheel
      ctx.shadowColor = 'rgba(99, 102, 241, 0.35)';
      ctx.shadowBlur = 16;

      // Outer border circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 14, 0, 2 * Math.PI);
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#4f46e5';
      ctx.lineWidth = 4;
      ctx.fill();
      ctx.stroke();

      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      // Draw Wedges
      for (let i = 0; i < numSegments; i++) {
        const startAngle = rotationAngleRef.current + i * phi;
        const endAngle = rotationAngleRef.current + (i + 1) * phi;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();

        // Wedge division stroke
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + Math.cos(startAngle) * radius, centerY + Math.sin(startAngle) * radius);
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Slice Label Text
        ctx.save();
        const midAngle = startAngle + phi / 2;
        ctx.translate(centerX, centerY);
        ctx.rotate(midAngle);
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur = 4;
        ctx.font = 'bold 20px Sora, sans-serif';
        ctx.fillText(segments[i], radius - 20, 0);
        ctx.restore();
      }

      // Slice pegs (physical dots)
      for (let i = 0; i < numSegments; i++) {
        const pinAngle = rotationAngleRef.current + i * phi;
        const px = centerX + Math.cos(pinAngle) * radius;
        const py = centerY + Math.sin(pinAngle) * radius;

        ctx.beginPath();
        ctx.arc(px, py, 4, 0, 2 * Math.PI);
        ctx.fillStyle = '#f8fafc';
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1;
        ctx.fill();
        ctx.stroke();
      }

      // Outer Blinking LEDs
      const numLeds = 12;
      for (let i = 0; i < numLeds; i++) {
        const ledAngle = (i * 2 * Math.PI) / numLeds;
        const lx = centerX + Math.cos(ledAngle) * (radius + 7);
        const ly = centerY + Math.sin(ledAngle) * (radius + 7);

        const phase = Math.floor(ledPulseRef.current) % 2;
        const isOn = (i % 2 === phase);

        ctx.beginPath();
        ctx.arc(lx, ly, 3, 0, 2 * Math.PI);
        if (isOn) {
          ctx.fillStyle = '#fbbf24';
          ctx.shadowColor = '#fbbf24';
          ctx.shadowBlur = 6;
        } else {
          ctx.fillStyle = '#78350f';
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
        }
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      // Center hub
      ctx.beginPath();
      ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#4f46e5';
      ctx.lineWidth = 3;
      ctx.fill();
      ctx.stroke();

      // Hub inner highlight
      ctx.beginPath();
      ctx.arc(centerX, centerY, 22, 0, 2 * Math.PI);
      ctx.fillStyle = spinStateRef.current !== 'IDLE' ? 'rgba(79, 70, 229, 0.3)' : 'rgba(79, 70, 229, 0.1)';
      ctx.fill();

      // Hub text
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 10px Sora, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (spinStateRef.current === 'SPINNING_CONSTANT') {
        ctx.fillText('WAIT', centerX, centerY);
      } else if (spinStateRef.current === 'DECELERATING') {
        ctx.fillText('STOP', centerX, centerY);
      } else {
        ctx.fillText('SPIN', centerX, centerY);
      }

      // Draw confetti particles
      if (spinStateRef.current === 'REVEALED' && particlesRef.current.length > 0) {
        particlesRef.current.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.15;
          p.vx *= 0.98;
          p.rotation += p.rotationSpeed;
          p.alpha -= p.decay;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          
          if (p.size % 2 === 0) {
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, 2 * Math.PI);
            ctx.fill();
          }
          ctx.restore();
        });

        particlesRef.current = particlesRef.current.filter(p => p.alpha > 0);
      }

      // Physical peg pointer
      ctx.save();
      ctx.translate(centerX, centerY - radius - 8);
      ctx.rotate(pegBendRef.current);
      
      ctx.beginPath();
      ctx.moveTo(-8, -10);
      ctx.lineTo(8, -10);
      ctx.lineTo(0, 12);
      ctx.closePath();
      
      const ptrGrad = ctx.createLinearGradient(0, -10, 0, 12);
      ptrGrad.addColorStop(0, '#f43f5e');
      ptrGrad.addColorStop(1, '#9f1239');
      
      ctx.fillStyle = ptrGrad;
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.restore();

      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [availableCodes, colors, localSpinningMember]);

  // Main interactive trigger function
  const handleStartSpin = async (member) => {
    if (localIsSpinning) return;

    setSelectedMember(member);
    setLocalIsSpinning(true);
    setLocalRevealedCode('');
    setLocalSpinningMember(member);

    spinStateRef.current = 'SPINNING_CONSTANT';
    lastSlotIndexRef.current = -1;

    try {
      // Trigger Web Audio API Context
      initAudio();

      // 1. Post request to backend immediately
      const result = await onCallMember(member.id);
      const code = result.judge_code;

      // 2. Set target segments
      const segments = availableCodes.length > 0 ? availableCodes : ['A', 'B', 'C', 'D'];
      const targetIdx = segments.indexOf(code);

      const numSegments = segments.length;
      const phi = (2 * Math.PI) / numSegments;
      const currentAngleMod = rotationAngleRef.current % (2 * Math.PI);
      
      // Calculate stopping angle where wedge targetIdx aligns with the top pointer (1.5 * PI)
      let targetAngleDiff = (3 * Math.PI / 2 - (targetIdx * phi + phi / 2)) - currentAngleMod;
      if (targetAngleDiff < 0) {
        targetAngleDiff += 2 * Math.PI;
      }

      const minDecelRotations = 3;
      spinTargetAngleRef.current = rotationAngleRef.current + targetAngleDiff + minDecelRotations * 2 * Math.PI;
      spinDecelStartTimeRef.current = performance.now();
      spinDecelStartAngleRef.current = rotationAngleRef.current;
      
      winningCodeRef.current = code;
      spinStateRef.current = 'DECELERATING';

    } catch (err) {
      setLocalIsSpinning(false);
      setLocalSpinningMember(null);
      spinStateRef.current = 'IDLE';
      showToast(err.message || "Failed to spin lot code.", "error");
    }
  };

  const handleResetWheel = () => {
    setSelectedMember(null);
    setLocalRevealedCode('');
    setLocalSpinningMember(null);
    spinStateRef.current = 'IDLE';
  };

  return (
    <div>
      {!callingProgramId ? (
        <div className="glass-panel" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Play size={18} style={{ color: 'var(--secondary-neon)' }} /> Lot SPIN & Call Console
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Select an Event Program to open the spin console:</p>
          
          {programs.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No programs set up yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* Pending Programs */}
              <div>
                <h4 style={{ marginBottom: '1rem', fontFamily: 'var(--font-display)', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  Pending Lot Selection ({notDonePrograms.length})
                </h4>
                {notDonePrograms.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>All programs have lot selections completed.</p>
                ) : (
                  <div className="grid-cols-3">
                    {notDonePrograms.map(p => (
                      <button 
                        key={p.id}
                        onClick={() => { setCallingProgramId(p.id.toString()); onFetchCallingList(p.id.toString()); }}
                        className="btn btn-secondary glass-panel-hover"
                        style={{ 
                          flexDirection: 'column', 
                          alignItems: 'flex-start', 
                          padding: '1.5rem', 
                          gap: '0.5rem',
                          height: 'auto',
                          textAlign: 'left',
                          width: '100%'
                        }}
                      >
                        <span className="tag tag-primary" style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>{p.category_name}</span>
                        <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginTop: '0.25rem' }}>{p.name}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {p.stage_type.toUpperCase()} • {p.type.toUpperCase()}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Done Programs */}
              <div>
                <h4 style={{ marginBottom: '1rem', fontFamily: 'var(--font-display)', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  Completed Lot Selection ({donePrograms.length})
                </h4>
                {donePrograms.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No programs completed yet.</p>
                ) : (
                  <div className="grid-cols-3">
                    {donePrograms.map(p => (
                      <button 
                        key={p.id}
                        onClick={() => { setCallingProgramId(p.id.toString()); onFetchCallingList(p.id.toString()); }}
                        className="btn btn-secondary glass-panel-hover"
                        style={{ 
                          flexDirection: 'column', 
                          alignItems: 'flex-start', 
                          padding: '1.5rem', 
                          gap: '0.5rem',
                          height: 'auto',
                          textAlign: 'left',
                          width: '100%',
                          opacity: 0.75,
                          border: p.has_results ? '1px solid rgba(255, 23, 68, 0.25)' : '1px solid rgba(0, 230, 118, 0.25)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                          <span className="tag tag-primary" style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>{p.category_name}</span>
                          <span className={`tag ${p.has_results ? 'tag-danger' : 'tag-success'}`} style={{ fontSize: '0.6rem' }}>
                            {p.has_results ? 'Finalized' : 'Completed'}
                          </span>
                        </div>
                        <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginTop: '0.25rem' }}>{p.name}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {p.stage_type.toUpperCase()} • {p.type.toUpperCase()}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      ) : (
        <div className="glass-panel" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ minWidth: '220px', display: 'flex', justifyContent: 'flex-start' }}>
              <button 
                onClick={() => { handleResetWheel(); setCallingProgramId(''); }} 
                className="btn btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                &larr; Back to Program List
              </button>
            </div>
            
            <div style={{ textAlign: 'center', flex: 1, minWidth: '200px' }}>
              <h3 style={{ color: 'var(--secondary-neon)', fontFamily: 'var(--font-display)', margin: 0 }}>
                {programs.find(p => p.id.toString() === callingProgramId)?.name || 'Selected Program'}
              </h3>
              <span className="tag tag-primary" style={{ fontSize: '0.65rem', marginTop: '0.25rem', display: 'inline-block' }}>
                {programs.find(p => p.id.toString() === callingProgramId)?.category_name || ''}
              </span>
            </div>
            
            <div className="no-print" style={{ minWidth: '220px', display: 'flex', justifyContent: 'flex-end' }}>
              {!isFinalized && onRespinLot && (
                <button 
                  onClick={onRespinLot} 
                  className="btn btn-danger" 
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}
                >
                  <RefreshCw size={16} /> Respin & Reset Lots
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {callingLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <RefreshCw className="spinning" size={30} style={{ color: 'var(--primary-neon)' }} />
        </div>
      ) : callingData && (
        <div className="grid-cols-2">
          {/* QUEUE LIST */}
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>Participant Stage Calling Queue</h3>
            
            {callingData.members.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No participants registered for this event.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {/* Waiting / Not Done */}
                <div>
                  <h4 style={{ marginBottom: '0.75rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--warning)', fontSize: '0.95rem' }}>
                    Waiting Queue ({notDoneMembers.length})
                  </h4>
                  {notDoneMembers.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', background: 'rgba(255,255,255,0.01)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      All participants have been called.
                    </p>
                  ) : (
                    <div className="table-container">
                      <table className="custom-table" style={{ fontSize: '0.85rem' }}>
                        <thead>
                          <tr>
                            <th>Chest No</th>
                            <th>Participant Name</th>
                            <th style={{ width: '110px', textAlign: 'right' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {notDoneMembers.map(m => (
                            <tr key={m.id} style={{ 
                              background: selectedMember?.id === m.id ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                              transition: 'background 0.3s'
                            }}>
                              <td style={{ fontWeight: 'bold' }}>{m.chest_no}</td>
                              <td style={{ fontWeight: 600 }}>{m.name}</td>
                              <td style={{ textAlign: 'right' }}>
                                {!isFinalized ? (
                                  <button 
                                    onClick={() => handleStartSpin(m)}
                                    className="btn btn-primary" 
                                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                                    disabled={localIsSpinning}
                                  >
                                    {localIsSpinning && localSpinningMember?.id === m.id ? 'Spinning...' : 'Spin Code'}
                                  </button>
                                ) : (
                                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Locked</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Called / Done */}
                <div>
                  <h4 style={{ marginBottom: '0.75rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', fontSize: '0.95rem' }}>
                    Called / Done ({doneMembers.length})
                  </h4>
                  {doneMembers.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', background: 'rgba(255,255,255,0.01)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      No participants have been called yet.
                    </p>
                  ) : (
                    <div className="table-container">
                      <table className="custom-table" style={{ fontSize: '0.85rem' }}>
                        <thead>
                          <tr>
                            <th>Chest No</th>
                            <th>Participant Name</th>
                            <th style={{ width: '120px', textAlign: 'right' }}>Assigned Code</th>
                          </tr>
                        </thead>
                        <tbody>
                          {doneMembers.map(m => (
                            <tr key={m.id} style={{ opacity: 0.85 }}>
                              <td style={{ color: 'var(--text-secondary)' }}>{m.chest_no}</td>
                              <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{m.name}</td>
                              <td style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--secondary-neon)' }}>
                                {m.judge_code}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>

          {/* SPIN MACHINE / LOCKED PANEL */}
          {isFinalized ? (
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', border: '1px solid rgba(255, 23, 68, 0.25)', minHeight: '350px' }}>
              <div style={{ background: 'rgba(255, 23, 68, 0.1)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
                <Lock size={32} style={{ color: 'var(--danger-neon)' }} />
              </div>
              <h4 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>Lot Selection Locked</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '300px', margin: 0 }}>
                Results for this program have been finalized and declared. Lot modifications are no longer permitted.
              </p>
            </div>
          ) : (
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', border: '1px dashed var(--primary-neon)', minHeight: '450px', position: 'relative', overflow: 'hidden' }}>
              
              {!selectedMember ? (
                // 1. Empty Selector State
                <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', opacity: 0.85 }}>
                  <div style={{ background: 'var(--accent-soft)', padding: '1.25rem', borderRadius: '50%', color: 'var(--accent)', animation: 'subtlePulse 2s infinite' }}>
                    <Sparkles size={36} />
                  </div>
                  <h4 style={{ fontFamily: 'var(--font-display)', margin: 0 }}>Spin Console Ready</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '320px', lineHeight: 1.5, margin: 0 }}>
                    Select a participant from the <strong>Waiting Queue</strong> table on the left to activate the interactive lot spinning machine.
                  </p>
                </div>
              ) : (
                // 2. Active Spin Panel
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {/* Selected Participant Card */}
                  <div className="glass-panel" style={{ 
                    width: '100%', 
                    border: '1px solid var(--accent-border)', 
                    padding: '1rem', 
                    marginBottom: '1rem', 
                    background: 'var(--accent-soft)', 
                    borderRadius: '12px',
                    textAlign: 'left',
                    boxShadow: 'inset 0 0 10px rgba(99, 102, 241, 0.05)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="tag tag-primary" style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>Ready to Call</span>
                      <span className="tag tag-warning" style={{ fontSize: '0.65rem', fontWeight: 'bold' }}>CHEST {selectedMember.chest_no}</span>
                    </div>
                    <h3 style={{ margin: '0.5rem 0 0.25rem 0', color: 'var(--text-primary)', fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>
                      {selectedMember.name}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0 }}>
                      Team: <strong>{selectedMember.team_name}</strong>
                    </p>
                  </div>

                  {/* Interactive Canvas Wheel */}
                  <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0.5rem 0' }}>
                    <canvas 
                      ref={canvasRef} 
                      width={280} 
                      height={280} 
                      style={{ 
                        cursor: (!localIsSpinning && !localRevealedCode) ? 'pointer' : 'default', 
                        maxWidth: '100%',
                        borderRadius: '50%'
                      }}
                      onClick={() => {
                        if (!localIsSpinning && !localRevealedCode) {
                          handleStartSpin(selectedMember);
                        }
                      }}
                    />
                  </div>

                  {/* Spin status & Actions */}
                  <div style={{ width: '100%', marginTop: '1rem' }}>
                    {localIsSpinning && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'center' }}>
                        <span style={{ color: 'var(--secondary-neon)', fontWeight: 'bold', fontSize: '1rem', animation: 'blink 1s infinite' }}>
                          Spinning code for {selectedMember.name}...
                        </span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                          Generating evaluation marksheets...
                        </span>
                      </div>
                    )}

                    {!localIsSpinning && localRevealedCode && (
                      <div style={{ animation: 'fadeIn 0.5s ease-in-out' }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: '0 0 0.25rem 0', textTransform: 'uppercase', letterSpacing: '1px' }}>
                          Revealed Code for {selectedMember.name}
                        </p>
                        
                        <div className="scratch-card-reveal" style={{ margin: '0.5rem 0' }}>
                          {localRevealedCode}
                        </div>

                        <p style={{ color: 'var(--success-neon)', fontSize: '0.8rem', fontWeight: 600, margin: '0 0 1rem 0' }}>
                          ✓ Marksheets generated for Judges.
                        </p>

                        <button
                          onClick={handleResetWheel}
                          className="btn btn-secondary"
                          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}
                        >
                          <UserCheck size={16} /> Acknowledge & Next Participant
                        </button>
                      </div>
                    )}

                    {!localIsSpinning && !localRevealedCode && (
                      <button
                        onClick={() => handleStartSpin(selectedMember)}
                        className="btn btn-primary"
                        style={{ 
                          width: '100%', 
                          padding: '0.85rem', 
                          fontSize: '1rem', 
                          textTransform: 'uppercase', 
                          fontFamily: 'var(--font-display)',
                          boxShadow: '0 0 15px rgba(99, 102, 241, 0.35)', 
                          borderRadius: '8px'
                        }}
                      >
                        Spin Lot Wheel
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
