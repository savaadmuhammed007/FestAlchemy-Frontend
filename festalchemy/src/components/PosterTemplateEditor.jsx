import React, { useState, useEffect, useRef, useCallback } from 'react';
import { API_BASE_URL } from '../context/AuthContext';
import { Upload, Save, Eye, Move, Type, Palette, RefreshCw, CheckCircle, AlertTriangle, Undo, Redo } from 'lucide-react';

const POSTER_W = 1080;
const POSTER_H = 1350;
const ASPECT = POSTER_W / POSTER_H;

const FIELD_LABELS = {
  program:      'Program Name',
  category:     'Category',
  rank1_label:  '1st Place Label (Text)',
  rank1_name:   '1st Place Name',
  rank1_team:   '1st Place Team',
  rank2_label:  '2nd Place Label (Text)',
  rank2_name:   '2nd Place Name',
  rank2_team:   '2nd Place Team',
  rank3_label:  '3rd Place Label (Text)',
  rank3_name:   '3rd Place Name',
  rank3_team:   '3rd Place Team',
  result_label: 'Result Label (Text)',
  result_value: 'Result Number',
};

const SAMPLE_DATA = {
  program:      'Solo Singing',
  category:     'Senior',
  rank1_label:  '1st',
  rank1_name:   'Alex Johnson',
  rank1_team:   'Phoenix House',
  rank2_label:  '2nd',
  rank2_name:   'Maria Garcia',
  rank2_team:   'Thunder Squad',
  rank3_label:  '3rd',
  rank3_name:   'James Chen',
  rank3_team:   'Galaxy Team',
  result_label: 'Result No:',
  result_value: '1',
};

const DEFAULT_CONFIG = {
  program:      { x: 540, y: 162, size: 56, color: '#ffffff' },
  category:     { x: 540, y: 243, size: 35, color: '#dddddd' },
  rank1_label:  { x: 540, y: 405, size: 30, color: '#ffd700', text: '1st' },
  rank1_name:   { x: 540, y: 473, size: 48, color: '#ffd700' },
  rank1_team:   { x: 540, y: 540, size: 30, color: '#ffd700' },
  rank2_label:  { x: 540, y: 635, size: 28, color: '#c0c0c0', text: '2nd' },
  rank2_name:   { x: 540, y: 702, size: 41, color: '#c0c0c0' },
  rank2_team:   { x: 540, y: 770, size: 26, color: '#c0c0c0' },
  rank3_label:  { x: 540, y: 864, size: 28, color: '#cd7f32', text: '3rd' },
  rank3_name:   { x: 540, y: 932, size: 41, color: '#cd7f32' },
  rank3_team:   { x: 540, y: 999, size: 26, color: '#cd7f32' },
  result_label: { x: 540, y: 1107, size: 30, color: '#ffffff', text: 'Result No:' },
  result_value: { x: 540, y: 1175, size: 30, color: '#ffffff' },
};

const SUPPORTED_FONTS = ['Inter', 'Montserrat', 'Poppins', 'Playfair Display', 'Cinzel'];

const getDefaultWeight = (key) => {
  if (key === 'program' || key.endsWith('_name')) return 'ExtraBold';
  return 'SemiBold';
};

export default function PosterTemplateEditor({ token }) {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [bgImageUrl, setBgImageUrl] = useState(null);
  const [bgFile, setBgFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [selectedFields, setSelectedFields] = useState(['program']);
  const [dragging, setDragging] = useState(null);
  const [containerWidth, setContainerWidth] = useState(500);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [dragStartCoords, setDragStartCoords] = useState({});
  const [history, setHistory] = useState([]);
  const [redoHistory, setRedoHistory] = useState([]);

  const pushStateToHistory = useCallback((customConfig = null) => {
    const stateToSave = customConfig || config;
    setHistory(prev => [...prev, JSON.parse(JSON.stringify(stateToSave))]);
    setRedoHistory([]);
  }, [config]);

  const undo = useCallback(() => {
    if (history.length === 0) return;
    const previousState = history[history.length - 1];
    setHistory(prev => prev.slice(0, prev.length - 1));
    setRedoHistory(prev => [...prev, JSON.parse(JSON.stringify(config))]);
    setConfig(previousState);
  }, [history, config]);

  const redo = useCallback(() => {
    if (redoHistory.length === 0) return;
    const nextState = redoHistory[redoHistory.length - 1];
    setRedoHistory(prev => prev.slice(0, prev.length - 1));
    setHistory(prev => [...prev, JSON.parse(JSON.stringify(config))]);
    setConfig(nextState);
  }, [redoHistory, config]);

  // Handle Undo/Redo keyboard shortcuts (Ctrl+Z / Ctrl+Y)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key?.toLowerCase() === 'z') {
          e.preventDefault();
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
        } else if (e.key?.toLowerCase() === 'y') {
          e.preventDefault();
          redo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Load existing template on mount
  useEffect(() => {
    fetchTemplate();
  }, []);

  // Update container width dynamically using ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;
    const updateWidth = () => {
      setContainerWidth(containerRef.current.getBoundingClientRect().width);
    };
    updateWidth();

    const resizeObserver = new ResizeObserver(() => {
      updateWidth();
    });
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  const convertConfigToPixels = (cfg) => {
    const newCfg = {};
    Object.entries(cfg).forEach(([key, val]) => {
      newCfg[key] = { ...val };
      if (val.x !== undefined && val.x <= 100) {
        newCfg[key].x = Math.round(val.x * 10.8);
      }
      if (val.y !== undefined && val.y <= 100) {
        newCfg[key].y = Math.round(val.y * 13.5);
      }
      if (val.size !== undefined && val.size < 100) {
        newCfg[key].size = Math.round(val.size * 1.08);
      }
    });
    return newCfg;
  };

  const fetchTemplate = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/poster-template/`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.config && Object.keys(data.config).length > 0) {
          setConfig(convertConfigToPixels({ ...DEFAULT_CONFIG, ...data.config }));
        }
        if (data.image_file) {
          // image_file could be a full URL or relative path
          const imageUrl = data.image_file.startsWith('http')
            ? data.image_file
            : `${API_BASE_URL}${data.image_file}`;
          setBgImageUrl(imageUrl);
        }
      }
    } catch (err) {
      console.error('Failed to load poster template:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      const formData = new FormData();
      formData.append('config', JSON.stringify(config));
      if (bgFile) {
        formData.append('image_file', bgFile);
      }

      const res = await fetch(`${API_BASE_URL}/api/v1/poster-template/`, {
        method: 'POST',
        headers: { 'Authorization': `Token ${token}` },
        body: formData,
      });

      if (res.ok) {
        setSaved(true);
        const data = await res.json();
        if (data.image_file) {
          const imageUrl = data.image_file.startsWith('http')
            ? data.image_file
            : `${API_BASE_URL}${data.image_file}`;
          setBgImageUrl(imageUrl);
        }
        setBgFile(null);
        setTimeout(() => setSaved(false), 3000);
      } else {
        const err = await res.json();
        setError(JSON.stringify(err));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleBgUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBgFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setBgImageUrl(ev.target.result);
    reader.readAsDataURL(file);
  };

  const updateField = (key, prop, value) => {
    const targets = selectedFields.includes(key) ? selectedFields : [key];
    setConfig(prev => {
      const next = { ...prev };
      targets.forEach(t => {
        if (next[t]) {
          next[t] = { ...next[t], [prop]: value };
        }
      });
      return next;
    });
  };

  // ─── Drag handling on the preview canvas ───
  const getCanvasCoords = useCallback((e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = ((clientX - rect.left) / rect.width) * 1080;
    const y = ((clientY - rect.top) / rect.height) * 1350;
    return { x: Math.max(0, Math.min(1080, x)), y: Math.max(0, Math.min(1350, y)) };
  }, []);

  const onPointerDown = (key, e) => {
    e.preventDefault();
    pushStateToHistory();
    
    // Multi-select key detection
    const isMulti = e.shiftKey || e.ctrlKey || e.metaKey;
    let newSelection = [...selectedFields];
    
    if (isMulti) {
      if (selectedFields.includes(key)) {
        if (selectedFields.length > 1) {
          newSelection = selectedFields.filter(k => k !== key);
        }
      } else {
        newSelection.push(key);
      }
    } else {
      if (!selectedFields.includes(key)) {
        newSelection = [key];
      }
    }
    
    setSelectedFields(newSelection);
    setDragging(key);
    
    const coords = getCanvasCoords(e);
    if (coords) {
      setDragStartPos(coords);
      const startCoords = {};
      newSelection.forEach(k => {
        if (config[k]) {
          startCoords[k] = { x: config[k].x, y: config[k].y };
        }
      });
      setDragStartCoords(startCoords);
    }
  };

  const onPointerMove = useCallback((e) => {
    if (!dragging) return;
    const coords = getCanvasCoords(e);
    if (!coords) return;
    
    const dx = coords.x - dragStartPos.x;
    const dy = coords.y - dragStartPos.y;
    
    setConfig(prev => {
      const next = { ...prev };
      selectedFields.forEach(k => {
        if (dragStartCoords[k]) {
          const targetX = dragStartCoords[k].x + dx;
          const targetY = dragStartCoords[k].y + dy;
          next[k] = {
            ...prev[k],
            x: Math.max(0, Math.min(1080, Math.round(targetX))),
            y: Math.max(0, Math.min(1350, Math.round(targetY)))
          };
        }
      });
      return next;
    });
  }, [dragging, getCanvasCoords, dragStartPos, dragStartCoords, selectedFields]);

  const onPointerUp = useCallback(() => {
    setDragging(null);
  }, []);

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', onPointerMove);
      window.addEventListener('mouseup', onPointerUp);
      window.addEventListener('touchmove', onPointerMove, { passive: false });
      window.addEventListener('touchend', onPointerUp);
      return () => {
        window.removeEventListener('mousemove', onPointerMove);
        window.removeEventListener('mouseup', onPointerUp);
        window.removeEventListener('touchmove', onPointerMove);
        window.removeEventListener('touchend', onPointerUp);
      };
    }
  }, [dragging, onPointerMove, onPointerUp]);

  // Helper to retrieve bounding box info of selected fields relative to canvas
  const getDOMInfo = () => {
    const canvas = containerRef.current;
    if (!canvas) return null;
    const canvasRect = canvas.getBoundingClientRect();
    
    return selectedFields.map(key => {
      const el = document.getElementById(`label-preview-${key}`);
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return {
        key,
        left: ((rect.left - canvasRect.left) / canvasRect.width) * 1080,
        right: ((rect.right - canvasRect.left) / canvasRect.width) * 1080,
        top: ((rect.top - canvasRect.top) / canvasRect.height) * 1350,
        bottom: ((rect.bottom - canvasRect.top) / canvasRect.height) * 1350,
        width: (rect.width / canvasRect.width) * 1080,
        height: (rect.height / canvasRect.height) * 1350,
        x: config[key]?.x ?? 540,
        y: config[key]?.y ?? 675
      };
    }).filter(Boolean);
  };

  // ─── Alignment & Layout Tools ───
  const alignLeft = () => {
    if (selectedFields.length < 2) return;
    const info = getDOMInfo();
    if (!info || info.length < 2) return;
    
    pushStateToHistory();
    const minLeft = Math.min(...info.map(item => item.left));
    
    setConfig(prev => {
      const next = { ...prev };
      info.forEach(item => {
        const align = prev[item.key]?.align || 'center';
        let targetX = minLeft;
        if (align === 'center') targetX = minLeft + item.width / 2;
        if (align === 'right') targetX = minLeft + item.width;
        
        next[item.key] = {
          ...prev[item.key],
          x: Math.round(targetX)
        };
      });
      return next;
    });
  };

  const alignHorizontalCenter = () => {
    if (selectedFields.length < 2) return;
    pushStateToHistory();
    const sumX = selectedFields.reduce((sum, key) => sum + (config[key]?.x ?? 540), 0);
    const avgX = Math.round(sumX / selectedFields.length);
    setConfig(prev => {
      const next = { ...prev };
      selectedFields.forEach(key => {
        next[key] = { ...prev[key], x: avgX };
      });
      return next;
    });
  };

  const alignRight = () => {
    if (selectedFields.length < 2) return;
    const info = getDOMInfo();
    if (!info || info.length < 2) return;
    
    pushStateToHistory();
    const maxRight = Math.max(...info.map(item => item.right));
    
    setConfig(prev => {
      const next = { ...prev };
      info.forEach(item => {
        const align = prev[item.key]?.align || 'center';
        let targetX = maxRight - item.width;
        if (align === 'center') targetX = maxRight - item.width / 2;
        if (align === 'right') targetX = maxRight;
        
        next[item.key] = {
          ...prev[item.key],
          x: Math.round(targetX)
        };
      });
      return next;
    });
  };

  const alignTop = () => {
    if (selectedFields.length < 2) return;
    const info = getDOMInfo();
    if (!info || info.length < 2) return;
    
    pushStateToHistory();
    const minTop = Math.min(...info.map(item => item.top));
    
    setConfig(prev => {
      const next = { ...prev };
      info.forEach(item => {
        next[item.key] = {
          ...prev[item.key],
          y: Math.round(minTop + item.height / 2)
        };
      });
      return next;
    });
  };

  const alignBottom = () => {
    if (selectedFields.length < 2) return;
    const info = getDOMInfo();
    if (!info || info.length < 2) return;
    
    pushStateToHistory();
    const maxBottom = Math.max(...info.map(item => item.bottom));
    
    setConfig(prev => {
      const next = { ...prev };
      info.forEach(item => {
        next[item.key] = {
          ...prev[item.key],
          y: Math.round(maxBottom - item.height / 2)
        };
      });
      return next;
    });
  };

  const centerToCanvasHorizontal = () => {
    pushStateToHistory();
    setConfig(prev => {
      const next = { ...prev };
      selectedFields.forEach(key => {
        next[key] = { ...prev[key], x: 540 };
      });
      return next;
    });
  };

  const distributeVertical = () => {
    if (selectedFields.length < 3) return;
    pushStateToHistory();
    const sortedFields = [...selectedFields].sort((a, b) => (config[a]?.y ?? 675) - (config[b]?.y ?? 675));
    const minY = config[sortedFields[0]].y;
    const maxY = config[sortedFields[sortedFields.length - 1]].y;
    const step = (maxY - minY) / (sortedFields.length - 1);
    setConfig(prev => {
      const next = { ...prev };
      sortedFields.forEach((key, index) => {
        next[key] = { ...prev[key], y: Math.round(minY + index * step) };
      });
      return next;
    });
  };

  const handleSelectField = (key, e) => {
    const isMulti = e.shiftKey || e.ctrlKey || e.metaKey;
    if (isMulti) {
      setSelectedFields(prev => {
        if (prev.includes(key)) {
          return prev.length > 1 ? prev.filter(k => k !== key) : prev;
        } else {
          return [...prev, key];
        }
      });
    } else {
      setSelectedFields([key]);
    }
  };

  const firstSelected = selectedFields[0] || 'program';
  const selectedConfig = config[firstSelected] || {};

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', gap: '0.75rem' }}>
        <RefreshCw className="spinning" size={20} style={{ color: 'var(--accent)' }} />
        <span style={{ color: 'var(--text-secondary)' }}>Loading poster template…</span>
      </div>
    );
  }

  return (
    <div>
      <style>{`
        .editor-container {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
          max-width: 1300px;
          margin: 0 auto;
        }
        .canvas-column {
          flex: 1 1 450px;
          min-width: 320px;
        }
        .settings-column {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
          flex: 1 1 600px;
          min-width: 300px;
        }
        .settings-sub-col {
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
          flex: 1 1 280px;
          min-width: 280px;
          max-width: 380px;
        }
        @media (min-width: 992px) {
          .canvas-column {
            position: sticky;
            top: 1.5rem;
            align-self: flex-start;
            max-width: 500px;
          }
        }
      `}</style>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginBottom: '0.25rem' }}>
            <Palette size={22} style={{ color: 'var(--accent)', verticalAlign: 'middle', marginRight: '0.5rem' }} />
            Poster Template Editor
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
            Upload a background and drag result fields to position them. Poster size: {POSTER_W}×{POSTER_H}px
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            onClick={undo}
            disabled={history.length === 0}
            className="btn btn-secondary"
            style={{ padding: '0.5rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
            title="Undo (Ctrl+Z)"
          >
            <Undo size={15} />
          </button>
          <button
            onClick={redo}
            disabled={redoHistory.length === 0}
            className="btn btn-secondary"
            style={{ padding: '0.5rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginRight: '0.5rem' }}
            title="Redo (Ctrl+Y)"
          >
            <Redo size={15} />
          </button>
          <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ fontSize: '0.9rem' }}>
            {saving ? <RefreshCw className="spinning" size={14} /> : <Save size={14} />}
            {saving ? 'Saving…' : 'Save Template'}
          </button>
        </div>
      </div>

      {saved && (
        <div style={{
          background: 'color-mix(in srgb, var(--success) 12%, transparent)',
          border: '1px solid var(--success)',
          borderRadius: 'var(--radius)',
          padding: '0.75rem 1rem',
          marginBottom: '1rem',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          color: 'var(--success)', fontSize: '0.85rem'
        }}>
          <CheckCircle size={16} /> Template saved successfully!
        </div>
      )}

      {error && (
        <div style={{
          background: 'color-mix(in srgb, var(--danger) 12%, transparent)',
          border: '1px solid var(--danger)',
          borderRadius: 'var(--radius)',
          padding: '0.75rem 1rem',
          marginBottom: '1rem',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          color: 'var(--danger)', fontSize: '0.85rem'
        }}>
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      <div className="editor-container">

        {/* ─── Preview Canvas (left) ─── */}
        <div className="canvas-column">
          {/* Background upload */}
          <div style={{ marginBottom: '1rem' }}>
            <label className="btn btn-secondary" style={{ cursor: 'pointer', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <Upload size={14} />
              {bgImageUrl ? 'Change Background' : 'Upload Background Image'}
              <input type="file" accept="image/*" onChange={handleBgUpload} style={{ display: 'none' }} />
            </label>
            {bgFile && <span style={{ marginLeft: '0.75rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{bgFile.name} (unsaved)</span>}
          </div>

          {/* Canvas Wrapper */}
          <div
            ref={containerRef}
            style={{
              position: 'relative',
              width: '100%',
              height: `${containerWidth * 1.25}px`,
            }}
          >
            {/* Scale Container */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '1080px',
                height: '1350px',
                transform: `scale(${containerWidth / 1080})`,
                transformOrigin: 'top left',
                background: bgImageUrl ? `url(${bgImageUrl}) center/cover no-repeat` : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                borderRadius: '8px',
                border: '2px solid var(--border-glass)',
                boxShadow: '0 8px 32px 0 rgba(0,0,0,0.37)',
                overflow: 'hidden',
                cursor: dragging ? 'grabbing' : 'default',
                touchAction: 'none',
                userSelect: 'none',
              }}
            >
              {/* Render each field as a draggable label */}
              {Object.entries(config).map(([key, field]) => {
                const isSelected = selectedFields.includes(key);
                const isRank = key.startsWith('rank');
                const label = (key === 'result_label' || key.endsWith('_label')) ? (field.text || SAMPLE_DATA[key] || FIELD_LABELS[key]) : (SAMPLE_DATA[key] || FIELD_LABELS[key]);

                const align = field.align || 'center';
                let transformStyle = 'translate(-50%, -50%)';
                if (align === 'left') transformStyle = 'translate(0, -50%)';
                if (align === 'right') transformStyle = 'translate(-100%, -50%)';

                const isHidden = field.hidden;

                return (
                  <div
                    key={key}
                    id={`label-preview-${key}`}
                    onMouseDown={(e) => onPointerDown(key, e)}
                    onTouchStart={(e) => onPointerDown(key, e)}
                    onClick={(e) => handleSelectField(key, e)}
                    style={{
                      position: 'absolute',
                      left: `${field.x}px`,
                      top: `${field.y}px`,
                      transform: transformStyle,
                      fontSize: `${field.size}px`,
                      fontFamily: `'${field.font || 'Inter'}', sans-serif`,
                      fontWeight: field.weight === 'Regular' ? 400 : field.weight === 'SemiBold' ? 600 : field.weight === 'ExtraBold' ? 800 : (key === 'program' || key.endsWith('_name') ? 800 : 600),
                      color: field.color,
                      textShadow: '0 2px 8px rgba(0,0,0,0.7)',
                      cursor: 'grab',
                      padding: '0',
                      borderRadius: '0',
                      outline: isSelected
                        ? '2px dashed var(--accent)'
                        : isHidden
                          ? '1px dashed #ef4444'
                          : '1px dashed rgba(255,255,255,0.25)',
                      outlineOffset: '4px',
                      opacity: isHidden ? 0.35 : 1,
                      background: isSelected ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                      whiteSpace: 'nowrap',
                      zIndex: isSelected ? 10 : 1,
                      transition: dragging === key ? 'none' : 'outline 0.15s, background 0.15s, opacity 0.15s',
                      lineHeight: 1.0,
                    }}
                  >
                    {label}
                  </div>
                );
              })}

              {/* Canvas overlay hint */}
              {!bgImageUrl && (
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(0,0,0,0.3)', pointerEvents: 'none',
                }}>
                  <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
                    <Upload size={48} style={{ marginBottom: '0.5rem' }} />
                    <p style={{ fontSize: '0.9rem', margin: 0 }}>Upload a poster background image</p>
                    <p style={{ fontSize: '0.75rem', margin: 0 }}>Recommended: {POSTER_W}×{POSTER_H}px</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.5rem', textAlign: 'center' }}>
            <Move size={12} style={{ verticalAlign: 'middle' }} /> Drag labels to reposition them on the poster
          </p>
        </div>

        {/* ─── Controls Panel (right) ─── */}
        <div className="settings-column">
          <div className="settings-sub-col">

          {/* Field Selector */}
          <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Type size={14} /> Select Fields
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {Object.entries(FIELD_LABELS).map(([key, label]) => {
                const isSel = selectedFields.includes(key);
                return (
                  <button
                    key={key}
                    onClick={(e) => handleSelectField(key, e)}
                    className={`btn ${isSel ? 'btn-primary' : 'btn-secondary'}`}
                    style={{
                      justifyContent: 'flex-start',
                      width: '100%',
                      padding: '0.45rem 0.8rem',
                      fontSize: '0.82rem',
                      borderLeft: isSel ? '3px solid var(--accent)' : '3px solid transparent',
                    }}
                    title="Click to select, Shift+Click to multi-select"
                  >
                    <span style={{
                      width: '10px', height: '10px', borderRadius: '50%',
                      background: config[key]?.color || '#fff',
                      display: 'inline-block', marginRight: '0.5rem', flexShrink: 0,
                      border: '1px solid rgba(255,255,255,0.2)'
                    }} />
                    {label}
                  </button>
                );
              })}
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: '0.5rem', textAlign: 'center', marginBottom: 0 }}>
              Hold Shift or Ctrl to select multiple fields.
            </p>
          </div>

          {/* Alignment & Layout Panel */}
          <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Palette size={14} /> Alignment & Layout
            </h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '0.8rem' }}>
              <button
                onClick={alignLeft}
                disabled={selectedFields.length < 2}
                className="btn btn-secondary"
                style={{ padding: '0.4rem', fontSize: '0.72rem', justifyContent: 'center' }}
                title="Align to Leftmost Position"
              >
                Align Left
              </button>
              <button
                onClick={alignHorizontalCenter}
                disabled={selectedFields.length < 2}
                className="btn btn-secondary"
                style={{ padding: '0.4rem', fontSize: '0.72rem', justifyContent: 'center' }}
                title="Align Center Horizontally"
              >
                Align Center
              </button>
              <button
                onClick={alignRight}
                disabled={selectedFields.length < 2}
                className="btn btn-secondary"
                style={{ padding: '0.4rem', fontSize: '0.72rem', justifyContent: 'center' }}
                title="Align to Rightmost Position"
              >
                Align Right
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '0.8rem' }}>
              <button
                onClick={alignTop}
                disabled={selectedFields.length < 2}
                className="btn btn-secondary"
                style={{ padding: '0.4rem', fontSize: '0.72rem', justifyContent: 'center' }}
                title="Align to Highest Position"
              >
                Align Top
              </button>
              <button
                onClick={alignBottom}
                disabled={selectedFields.length < 2}
                className="btn btn-secondary"
                style={{ padding: '0.4rem', fontSize: '0.72rem', justifyContent: 'center' }}
                title="Align to Lowest Position"
              >
                Align Bottom
              </button>
              <button
                onClick={distributeVertical}
                disabled={selectedFields.length < 3}
                className="btn btn-secondary"
                style={{ padding: '0.4rem', fontSize: '0.72rem', justifyContent: 'center' }}
                title="Distribute Fields Evenly Vertically"
              >
                Distribute
              </button>
            </div>

            <button
              onClick={centerToCanvasHorizontal}
              className="btn btn-secondary"
              style={{ width: '100%', padding: '0.45rem', fontSize: '0.78rem', justifyContent: 'center' }}
            >
              Center to Poster Canvas
            </button>
            
            {selectedFields.length < 2 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', margin: '0.5rem 0 0 0', textAlign: 'center' }}>
                Select multiple fields to enable group alignment.
              </p>
            ) : (
              <p style={{ color: 'var(--success)', fontSize: '0.72rem', margin: '0.5rem 0 0 0', textAlign: 'center', fontWeight: 600 }}>
                {selectedFields.length} fields selected
              </p>
            )}
          </div>
          </div>

          <div className="settings-sub-col">
            {/* Selected Field(s) Properties */}
            <div className="glass-panel" style={{ padding: '1rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              {selectedFields.length > 1 ? "Selected Fields" : FIELD_LABELS[firstSelected]} Properties
            </h4>

            {/* Custom Text for Permanent Label */}
            {selectedFields.length === 1 && (firstSelected === 'result_label' || firstSelected.endsWith('_label')) && (
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontSize: '0.78rem' }}>
                  Label Text
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={selectedConfig.text || SAMPLE_DATA[firstSelected] || ''}
                  onFocus={() => pushStateToHistory()}
                  onChange={(e) => updateField(firstSelected, 'text', e.target.value)}
                  style={{ width: '100%', fontSize: '0.82rem' }}
                />
              </div>
            )}

            {/* Position X */}
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontSize: '0.78rem' }}>
                X Position: {Math.round(selectedConfig.x || 540)}px
              </label>
              <input
                type="range"
                min="0" max="1080" step="1"
                value={Math.round(selectedConfig.x || 540)}
                onMouseDown={() => pushStateToHistory()}
                onTouchStart={() => pushStateToHistory()}
                onChange={(e) => updateField(firstSelected, 'x', parseInt(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            {/* Position Y */}
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontSize: '0.78rem' }}>
                Y Position: {Math.round(selectedConfig.y || 675)}px
              </label>
              <input
                type="range"
                min="0" max="1350" step="1"
                value={Math.round(selectedConfig.y || 675)}
                onMouseDown={() => pushStateToHistory()}
                onTouchStart={() => pushStateToHistory()}
                onChange={(e) => updateField(firstSelected, 'y', parseInt(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            {/* Font Size */}
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontSize: '0.78rem' }}>
                Font Size: {selectedConfig.size || 40}px
              </label>
              <input
                type="range"
                min="10" max="150" step="1"
                value={selectedConfig.size || 40}
                onMouseDown={() => pushStateToHistory()}
                onTouchStart={() => pushStateToHistory()}
                onChange={(e) => updateField(firstSelected, 'size', parseInt(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            {/* Text Align */}
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontSize: '0.78rem' }}>
                Text Align
              </label>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                {['left', 'center', 'right'].map(alignVal => (
                  <button
                    key={alignVal}
                    onClick={() => { pushStateToHistory(); updateField(firstSelected, 'align', alignVal); }}
                    className={`btn ${selectedConfig.align === alignVal || (!selectedConfig.align && alignVal === 'center') ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1, textTransform: 'capitalize', fontSize: '0.75rem', padding: '0.4rem' }}
                  >
                    {alignVal}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Family */}
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontSize: '0.78rem' }}>
                Font Family
              </label>
              <select
                className="form-control"
                value={selectedConfig.font || 'Inter'}
                onFocus={() => pushStateToHistory()}
                onChange={(e) => updateField(firstSelected, 'font', e.target.value)}
                style={{ width: '100%', fontSize: '0.82rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}
              >
                {SUPPORTED_FONTS.map(fontName => (
                  <option key={fontName} value={fontName} style={{ background: '#1e1e2f', color: '#fff' }}>
                    {fontName}
                  </option>
                ))}
              </select>
            </div>

            {/* Font Weight */}
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontSize: '0.78rem' }}>
                Font Weight
              </label>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                {['Regular', 'SemiBold', 'ExtraBold'].map(weightVal => (
                  <button
                    key={weightVal}
                    onClick={() => { pushStateToHistory(); updateField(firstSelected, 'weight', weightVal); }}
                    className={`btn ${selectedConfig.weight === weightVal || (!selectedConfig.weight && weightVal === getDefaultWeight(firstSelected)) ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1, textTransform: 'capitalize', fontSize: '0.72rem', padding: '0.45rem', justifyContent: 'center' }}
                  >
                    {weightVal === 'Regular' ? 'Normal' : weightVal === 'SemiBold' ? 'Medium' : 'Bold'}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontSize: '0.78rem' }}>
                Color
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input
                  type="color"
                  value={selectedConfig.color || '#ffffff'}
                  onMouseDown={() => pushStateToHistory()}
                  onTouchStart={() => pushStateToHistory()}
                  onChange={(e) => updateField(firstSelected, 'color', e.target.value)}
                  style={{
                    width: '40px', height: '32px', border: 'none',
                    borderRadius: '6px', cursor: 'pointer', padding: 0,
                    background: 'transparent',
                  }}
                />
                <input
                  type="text"
                  className="form-control"
                  value={selectedConfig.color || '#ffffff'}
                  onFocus={() => pushStateToHistory()}
                  onChange={(e) => updateField(firstSelected, 'color', e.target.value)}
                  style={{ flex: 1, fontSize: '0.82rem', fontFamily: 'monospace' }}
                />
              </div>
            </div>

            {/* Visibility */}
            <div className="form-group" style={{ marginBottom: '0' }}>
              <label className="form-label" style={{ fontSize: '0.78rem' }}>
                Visibility
              </label>
              <button
                onClick={() => { pushStateToHistory(); updateField(firstSelected, 'hidden', !selectedConfig.hidden); }}
                className={`btn ${selectedConfig.hidden ? 'btn-secondary' : 'btn-primary'}`}
                style={{ width: '100%', fontSize: '0.8rem', padding: '0.45rem', justifyContent: 'center' }}
              >
                {selectedConfig.hidden ? '👁️‍🗨️ Hidden' : '👁️ Visible'}
              </button>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="glass-panel" style={{ padding: '1rem', marginTop: '1rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              Quick Actions
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <button
                onClick={() => { pushStateToHistory(); setConfig(DEFAULT_CONFIG); }}
                className="btn btn-secondary"
                style={{ width: '100%', fontSize: '0.82rem', justifyContent: 'center' }}
              >
                <RefreshCw size={13} /> Reset to Defaults
              </button>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
