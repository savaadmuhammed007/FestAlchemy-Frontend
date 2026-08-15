import React from 'react';
import { ArrowRight, Sparkles, Trophy, ChevronDown, Compass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Calculates smooth progressive entrance and exit styles for an individual element
 */
function getItemStyle(progress, appearStart, appearEnd, exitStart = 1.0, exitEnd = 1.0) {
  // Before appearance
  if (progress < appearStart) {
    return {
      opacity: 0,
      transform: 'translateY(28px) scale(0.97)',
      filter: 'blur(5px)',
      pointerEvents: 'none',
    };
  }
  // Appearing (Fade in + rise up)
  if (progress < appearEnd) {
    const ratio = Math.max(0, Math.min(1, (progress - appearStart) / (appearEnd - appearStart)));
    return {
      opacity: ratio,
      transform: `translateY(${28 * (1 - ratio)}px) scale(${0.97 + 0.03 * ratio})`,
      filter: `blur(${5 * (1 - ratio)}px)`,
      pointerEvents: ratio > 0.5 ? 'auto' : 'none',
    };
  }
  // Fully visible sustain range
  if (progress < exitStart) {
    return {
      opacity: 1,
      transform: 'translateY(0px) scale(1)',
      filter: 'blur(0px)',
      pointerEvents: 'auto',
    };
  }
  // Exiting (Fade out + subtle drift up)
  if (progress < exitEnd) {
    const ratio = Math.max(0, Math.min(1, (progress - exitStart) / (exitEnd - exitStart)));
    return {
      opacity: 1 - ratio,
      transform: `translateY(${-22 * ratio}px) scale(${1 - 0.02 * ratio})`,
      filter: `blur(${4 * ratio}px)`,
      pointerEvents: 'none',
    };
  }
  // After exit
  return {
    opacity: 0,
    transform: 'translateY(-22px) scale(0.98)',
    filter: 'blur(5px)',
    pointerEvents: 'none',
  };
}

export default function CinematicStoryOverlay({
  scrollProgress = 0,
  onScrollToLive = null,
  onJumpToProgress = null,
}) {
  const navigate = useNavigate();

  // Determine current active act index (1 to 3)
  let currentAct = 1;
  if (scrollProgress >= 0.67) currentAct = 3;
  else if (scrollProgress >= 0.33) currentAct = 2;

  const actsList = [
    { num: 1, label: 'Intro', target: 0.05 },
    { num: 2, label: 'Intercession', target: 0.50 },
    { num: 3, label: 'Explore', target: 0.95 },
  ];

  // ── ACT 1 PROGRESSIVE PIECES (0.00 to 0.33) ──
  const isAct1Active = scrollProgress < 0.33;
  const a1Badge = getItemStyle(scrollProgress, 0.0, 0.04, 0.27, 0.33);
  const a1Title = getItemStyle(scrollProgress, 0.0, 0.06, 0.27, 0.33); // 1. First "ഇലൽ ഹബീബ്"
  const a1Sub = getItemStyle(scrollProgress, 0.06, 0.13, 0.27, 0.33); // 2. Then "MEELAD FEST"
  const a1Inst = getItemStyle(scrollProgress, 0.13, 0.20, 0.27, 0.33); // 3. Then "Smart Vacation Madrasa & Kanzul Ulama Centre"
  const a1Prompt = getItemStyle(scrollProgress, 0.0, 0.04, 0.09, 0.13);

  // ── ACT 2 PROGRESSIVE PIECES (0.33 to 0.67) ──
  const isAct2Active = scrollProgress >= 0.33 && scrollProgress < 0.67;
  const a2Badge = getItemStyle(scrollProgress, 0.33, 0.39, 0.60, 0.67);
  const a2Heading = getItemStyle(scrollProgress, 0.35, 0.43, 0.60, 0.67); // "A Journey of Love"
  const a2Desc = getItemStyle(scrollProgress, 0.42, 0.50, 0.60, 0.67); // Supporting copy
  const a2Arabic = getItemStyle(scrollProgress, 0.48, 0.56, 0.60, 0.67); // Calligraphy

  // ── ACT 3 PROGRESSIVE PIECES (0.67 to 1.00) ──
  const isAct3Active = scrollProgress >= 0.67;
  const a3Badge = getItemStyle(scrollProgress, 0.67, 0.73, 1.05, 1.05);
  const a3Title = getItemStyle(scrollProgress, 0.70, 0.76, 1.05, 1.05); // "ഇലൽ ഹബീബ്"
  const a3Sub = getItemStyle(scrollProgress, 0.74, 0.80, 1.05, 1.05);
  const a3Inst = getItemStyle(scrollProgress, 0.78, 0.84, 1.05, 1.05);
  const a3Buttons = getItemStyle(scrollProgress, 0.82, 0.89, 1.05, 1.05);
  const a3Hint = getItemStyle(scrollProgress, 0.87, 0.94, 1.05, 1.05);

  return (
    <div className="cinematic-overlay-container">
      {/* ── Interactive Side Stepper ── */}
      <div className="cinematic-side-stepper">
        <div className="cinematic-stepper-header">
          <span className="cinematic-stepper-brand cinematic-font-malayalam">ഇലൽ ഹബീബ്</span>
          <span className="cinematic-stepper-act">ACT {currentAct}/3</span>
        </div>
        <div className="cinematic-stepper-track">
          {actsList.map((act) => {
            const isActive = currentAct === act.num;
            return (
              <button
                key={act.num}
                className={`cinematic-stepper-dot ${isActive ? 'cinematic-stepper-dot--active' : ''}`}
                onClick={() => onJumpToProgress && onJumpToProgress(act.target)}
                title={`Jump to Act ${act.num}: ${act.label}`}
                aria-label={`Jump to Act ${act.num}: ${act.label}`}
              >
                <span className="cinematic-dot-pill" />
                <span className="cinematic-dot-label">{act.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── ACT 1: PROGRESSIVE INTRODUCTION (0.00 - 0.33) ── */}
      <div
        className="cinematic-story-card cinematic-story-card--center"
        style={{ display: isAct1Active ? 'flex' : 'none' }}
      >
        <div className="cinematic-badge" style={a1Badge}>
          <Sparkles size={14} className="cinematic-badge-icon" />
          <span>MEELAD FESTIVAL 2026</span>
        </div>

        {/* 1. First: ഇലൽ ഹബീബ് (Two Lines Big) */}
        <h1
          className="cinematic-title--malayalam-2line"
          style={a1Title}
        >
          <span className="cinematic-malayalam-word">ഇലൽ</span>
          <span className="cinematic-malayalam-word">ഹബീബ്</span>
        </h1>

        {/* 2. Then: MEELAD FEST */}
        <div className="cinematic-subtitle-wrapper" style={a1Sub}>
          <span className="cinematic-gold-line" />
          <h2 className="cinematic-subtitle">MEELAD FEST</h2>
          <span className="cinematic-gold-line" />
        </div>

        {/* 3. Then: Smart Vacation Madrasa & Kanzul Ulama Centre */}
        <div className="cinematic-institution-info" style={a1Inst}>
          <p className="cinematic-madrasa-name">Smart Vacation Madrasa</p>
          <p className="cinematic-centre-name">Kanzul Ulama Cultural Centre, Kannapuram</p>
        </div>

        <div
          className="cinematic-scroll-prompt"
          style={a1Prompt}
          onClick={() => onJumpToProgress && onJumpToProgress(0.50)}
          role="button"
          tabIndex={0}
        >
          <span className="cinematic-scroll-text">Scroll to Reveal Details</span>
          <ChevronDown size={18} className="cinematic-scroll-icon" />
        </div>
      </div>

      {/* ── ACT 2: THE HOPE OF INTERCESSION (0.33 - 0.67) ── */}
      <div
        className="cinematic-story-card cinematic-story-card--left"
        style={{ display: isAct2Active ? 'flex' : 'none' }}
      >
        <div className="cinematic-badge" style={a2Badge}>
          <Compass size={14} className="cinematic-badge-icon" />
          <span>THE HOPE OF INTERCESSION</span>
        </div>
        <h2 className="cinematic-heading-editorial" style={a2Heading}>
          The Hope<br />
          <span className="cinematic-gold-italic">of Intercession</span>
        </h2>
        <p className="cinematic-description-editorial" style={a2Desc}>
          A celebration of love, remembrance, and the hope of the Beloved’s intercession in every overwhelming trial.
        </p>
        <div className="cinematic-arabic-calligraphy" style={a2Arabic}>
          هُوَ الحَبِيبُ الذِّي تُرْجَى شَفَاعَتُهُ<br />
          لِكُلِّ هَوْلٍ مِنَ الأَهْوَالِ مُقْتَحَمِ
        </div>
      </div>

      {/* ── ACT 3: FINAL CLIMAX & CTA (0.67 - 1.00) ── */}
      <div
        className="cinematic-story-card cinematic-story-card--cta"
        style={{ display: isAct3Active ? 'flex' : 'none' }}
      >
        <div className="cinematic-cta-card-inner">
          <div className="cinematic-badge cinematic-badge--glow" style={a3Badge}>
            <Sparkles size={14} className="cinematic-badge-icon" />
            <span>KANZUL ULAMA CULTURAL CENTRE</span>
          </div>

          <h2
            className="cinematic-title--malayalam-2line"
            style={{ ...a3Title, fontSize: 'clamp(2.4rem, 5.5vw, 4.4rem)', margin: '0.2rem 0 0.6rem' }}
          >
            <span className="cinematic-malayalam-word">ഇലൽ</span>
            <span className="cinematic-malayalam-word">ഹബീബ്</span>
          </h2>
          <div className="cinematic-cta-subtitle" style={a3Sub}>MEELAD FESTIVAL</div>

          <p className="cinematic-cta-inst" style={a3Inst}>
            Smart Vacation Madrasa • Kannapuram
          </p>

          {/* Luxury Action Buttons */}
          <div className="cinematic-cta-buttons" style={a3Buttons}>
            <button
              onClick={() => navigate('/results')}
              className="cinematic-btn cinematic-btn--primary"
            >
              <span>Explore Results</span>
              <ArrowRight size={18} />
            </button>

            <button
              onClick={() => {
                if (onScrollToLive) {
                  onScrollToLive();
                } else {
                  navigate('/team-status');
                }
              }}
              className="cinematic-btn cinematic-btn--secondary"
            >
              <Trophy size={16} />
              <span>Enter Meelad Fest</span>
            </button>
          </div>

          {/* Quick jump to live scoreboard */}
          <div
            className="cinematic-live-hint"
            style={a3Hint}
            onClick={onScrollToLive}
            role="button"
            tabIndex={0}
          >
            <span>View Live Team Standings & Recent Winners</span>
            <ChevronDown size={16} />
          </div>
        </div>
      </div>
    </div>
  );
}
