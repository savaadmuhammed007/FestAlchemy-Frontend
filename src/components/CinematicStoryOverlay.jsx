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

  // Determine current active act index (1 to 6)
  let currentAct = 1;
  if (scrollProgress >= 0.87) currentAct = 6;
  else if (scrollProgress >= 0.71) currentAct = 5;
  else if (scrollProgress >= 0.53) currentAct = 4;
  else if (scrollProgress >= 0.35) currentAct = 3;
  else if (scrollProgress >= 0.17) currentAct = 2;

  const actsList = [
    { num: 1, label: 'Intro', target: 0.03 },
    { num: 2, label: 'Intercession', target: 0.25 },
    { num: 3, label: 'Identity', target: 0.43 },
    { num: 4, label: 'Meelad Fest', target: 0.61 },
    { num: 5, label: 'Reveal', target: 0.78 },
    { num: 6, label: 'Explore', target: 0.95 },
  ];

  // ── ACT 1 PROGRESSIVE PIECES (0.00 to 0.16) ──
  const isAct1Active = scrollProgress < 0.165;
  const a1Badge = getItemStyle(scrollProgress, 0.0, 0.02, 0.13, 0.16);
  const a1Title = getItemStyle(scrollProgress, 0.0, 0.03, 0.13, 0.16); // 1. First "ഇലൽ ഹബീബ്"
  const a1Sub = getItemStyle(scrollProgress, 0.035, 0.07, 0.13, 0.16); // 2. Then "MEELAD FEST"
  const a1Inst = getItemStyle(scrollProgress, 0.075, 0.115, 0.13, 0.16); // 3. Then "Smart Vacation Madrasa & Kanzul Ulama Centre"
  const a1Prompt = getItemStyle(scrollProgress, 0.0, 0.02, 0.045, 0.065);

  // ── ACT 2 PROGRESSIVE PIECES (0.17 to 0.34) ──
  const isAct2Active = scrollProgress >= 0.165 && scrollProgress < 0.345;
  const a2Badge = getItemStyle(scrollProgress, 0.17, 0.20, 0.31, 0.34);
  const a2Heading = getItemStyle(scrollProgress, 0.18, 0.22, 0.31, 0.34); // "A Journey of Love"
  const a2Desc = getItemStyle(scrollProgress, 0.22, 0.26, 0.31, 0.34); // Supporting copy
  const a2Arabic = getItemStyle(scrollProgress, 0.25, 0.29, 0.31, 0.34); // Calligraphy

  // ── ACT 3 PROGRESSIVE PIECES (0.35 to 0.52) ──
  const isAct3Active = scrollProgress >= 0.345 && scrollProgress < 0.525;
  const a3Eyebrow = getItemStyle(scrollProgress, 0.35, 0.38, 0.49, 0.52);
  const a3Title = getItemStyle(scrollProgress, 0.36, 0.40, 0.49, 0.52); // "ഇലൽ ഹബീബ്"
  const a3Sub = getItemStyle(scrollProgress, 0.40, 0.44, 0.49, 0.52); // "Towards the Beloved"
  const a3Copy = getItemStyle(scrollProgress, 0.43, 0.47, 0.49, 0.52); // Supporting copy
  const a3Pill = getItemStyle(scrollProgress, 0.46, 0.49, 0.49, 0.52);

  // ── ACT 4 PROGRESSIVE PIECES (0.53 to 0.70) ──
  const isAct4Active = scrollProgress >= 0.525 && scrollProgress < 0.705;
  const a4Badge = getItemStyle(scrollProgress, 0.53, 0.56, 0.67, 0.70);
  const a4Heading = getItemStyle(scrollProgress, 0.54, 0.58, 0.67, 0.70); // "MEELAD FEST"
  const a4Box = getItemStyle(scrollProgress, 0.58, 0.62, 0.67, 0.70); // "Smart Vacation Madrasa"
  const a4Tags = getItemStyle(scrollProgress, 0.62, 0.66, 0.67, 0.70); // Identity chips

  // ── ACT 5 PROGRESSIVE PIECES (0.71 to 0.86) ──
  const isAct5Active = scrollProgress >= 0.705 && scrollProgress < 0.865;
  const a5Brand = getItemStyle(scrollProgress, 0.71, 0.75, 0.83, 0.86); // "ഇലൽ ഹബീബ്"
  const a5Sub = getItemStyle(scrollProgress, 0.75, 0.79, 0.83, 0.86); // "MEELAD FEST"
  const a5Quote = getItemStyle(scrollProgress, 0.79, 0.83, 0.83, 0.86); // "A celebration of love for the Beloved ﷺ"

  // ── ACT 6 PROGRESSIVE PIECES (0.87 to 1.00) ──
  const isAct6Active = scrollProgress >= 0.865;
  const a6Badge = getItemStyle(scrollProgress, 0.87, 0.90, 1.05, 1.05);
  const a6Title = getItemStyle(scrollProgress, 0.88, 0.91, 1.05, 1.05); // "ഇലൽ ഹബീബ്"
  const a6Sub = getItemStyle(scrollProgress, 0.90, 0.93, 1.05, 1.05);
  const a6Inst = getItemStyle(scrollProgress, 0.92, 0.95, 1.05, 1.05);
  const a6Buttons = getItemStyle(scrollProgress, 0.94, 0.97, 1.05, 1.05);
  const a6Hint = getItemStyle(scrollProgress, 0.96, 0.99, 1.05, 1.05);

  return (
    <div className="cinematic-overlay-container">
      {/* ── Interactive Side Stepper ── */}
      <div className="cinematic-side-stepper">
        <div className="cinematic-stepper-header">
          <span className="cinematic-stepper-brand cinematic-font-malayalam">ഇലൽ ഹബീബ്</span>
          <span className="cinematic-stepper-act">ACT {currentAct}/6</span>
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

      {/* ── ACT 1: PROGRESSIVE INTRODUCTION (0.00 - 0.16) ── */}
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
          onClick={() => onJumpToProgress && onJumpToProgress(0.25)}
          role="button"
          tabIndex={0}
        >
          <span className="cinematic-scroll-text">Scroll to Reveal Details</span>
          <ChevronDown size={18} className="cinematic-scroll-icon" />
        </div>
      </div>

      {/* ── ACT 2: THE HOPE OF INTERCESSION (0.17 - 0.34) ── */}
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

      {/* ── ACT 3: ILAL HABEEB IDENTITY (0.35 - 0.52) ── */}
      <div
        className="cinematic-story-card cinematic-story-card--center-editorial"
        style={{ display: isAct3Active ? 'flex' : 'none' }}
      >
        <span className="cinematic-eyebrow" style={a3Eyebrow}>THE THEME</span>
        <h2
          className="cinematic-title--malayalam-2line"
          style={{ ...a3Title, fontSize: 'clamp(2.8rem, 7.5vw, 6.2rem)' }}
        >
          <span className="cinematic-malayalam-word">ഇലൽ</span>
          <span className="cinematic-malayalam-word">ഹബീബ്</span>
        </h2>
        <div className="cinematic-translation-tag" style={a3Sub}>Towards the Beloved</div>
        <p className="cinematic-identity-copy" style={a3Copy}>
          An immersive Meelad celebration inspired by love, remembrance and the timeless connection to the Messenger of Allah ﷺ.
        </p>
        <div className="cinematic-decor-pill" style={a3Pill}>
          <span>Peace & Blessings Upon the Final Messenger</span>
        </div>
      </div>

      {/* ── ACT 4: THE MEELAD FEST (0.53 - 0.70) ── */}
      <div
        className="cinematic-story-card cinematic-story-card--right"
        style={{ display: isAct4Active ? 'flex' : 'none' }}
      >
        <div className="cinematic-badge" style={a4Badge}>
          <Trophy size={14} className="cinematic-badge-icon" />
          <span>OFFICIAL EVENT FEST</span>
        </div>
        <h2 className="cinematic-heading-editorial" style={a4Heading}>
          MEELAD<br />
          <span className="cinematic-gold-gradient">FEST</span>
        </h2>
        <div className="cinematic-institution-box" style={a4Box}>
          <div className="cinematic-inst-title">Smart Vacation Madrasa</div>
          <div className="cinematic-inst-subtitle">Kanzul Ulama Cultural Centre, Kannapuram</div>
        </div>
        <div className="cinematic-tags-group" style={a4Tags}>
          <span className="cinematic-chip cinematic-font-malayalam">ഇലൽ ഹബീബ്</span>
          <span className="cinematic-chip">MEELAD CELEBRATION</span>
          <span className="cinematic-chip">SMART VACATION MADRASA</span>
        </div>
      </div>

      {/* ── ACT 5: THE REVEAL (0.71 - 0.86) ── */}
      <div
        className="cinematic-story-card cinematic-story-card--reveal"
        style={{ display: isAct5Active ? 'flex' : 'none' }}
      >
        <h1
          className="cinematic-title--malayalam-2line"
          style={a5Brand}
        >
          <span className="cinematic-malayalam-word">ഇലൽ</span>
          <span className="cinematic-malayalam-word">ഹബീബ്</span>
        </h1>
        <h2 className="cinematic-reveal-sub" style={a5Sub}>MEELAD FEST</h2>
        <div className="cinematic-reveal-quote" style={a5Quote}>
          “A celebration of love for the Beloved ﷺ”
        </div>
      </div>

      {/* ── ACT 6: FINAL CLIMAX & CTA (0.87 - 1.00) ── */}
      <div
        className="cinematic-story-card cinematic-story-card--cta"
        style={{ display: isAct6Active ? 'flex' : 'none' }}
      >
        <div className="cinematic-cta-card-inner">
          <div className="cinematic-badge cinematic-badge--glow" style={a6Badge}>
            <Sparkles size={14} className="cinematic-badge-icon" />
            <span>KANZUL ULAMA CULTURAL CENTRE</span>
          </div>

          <h2
            className="cinematic-title--malayalam-2line"
            style={{ ...a6Title, fontSize: 'clamp(2.4rem, 5.5vw, 4.4rem)', margin: '0.2rem 0 0.6rem' }}
          >
            <span className="cinematic-malayalam-word">ഇലൽ</span>
            <span className="cinematic-malayalam-word">ഹബീബ്</span>
          </h2>
          <div className="cinematic-cta-subtitle" style={a6Sub}>MEELAD FESTIVAL</div>

          <p className="cinematic-cta-inst" style={a6Inst}>
            Smart Vacation Madrasa • Kannapuram
          </p>

          {/* Luxury Action Buttons */}
          <div className="cinematic-cta-buttons" style={a6Buttons}>
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
            style={a6Hint}
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
