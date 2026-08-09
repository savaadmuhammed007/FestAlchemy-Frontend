import React, { useState, useContext } from 'react';
import { 
  Settings, Users, Save, PlusCircle, Trash, CheckSquare, Edit,
  RotateCcw, AlertTriangle, Trash2, RefreshCw, Square, ShieldAlert,
  Layers, MapPin, Award
} from 'lucide-react';
import Modal from './Modal';
import { API_BASE_URL } from '../context/AuthContext';
import { UIContext } from '../App';

export default function SettingsConfig({
  settingsSubTab,
  festName,
  setFestName,
  festYear,
  setFestYear,
  festTagline,
  setFestTagline,
  festDescription,
  setFestDescription,
  point1st,
  setPoint1st,
  point2nd,
  setPoint2nd,
  point3rd,
  setPoint3rd,
  onSaveFestSettings,
  teams = [],
  judges = [],
  categories = [],
  programs = [],
  members = [],
  stages = [],
  onOpenModal,
  onDeleteItem,
  festDates = [],
  setFestDates,
  token,
  loadSetupData,
  fetchStats
}) {
  const { showToast } = useContext(UIContext);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetOptions, setResetOptions] = useState({
    programs: true,
    members: true,
    teams: true,
    results: true,
    categories: false,
    stages: false,
    judges: false
  });
  const [confirmWord, setConfirmWord] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const toggleResetOption = (key) => {
    setResetOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelectAll = () => {
    setResetOptions({
      programs: true,
      members: true,
      teams: true,
      results: true,
      categories: true,
      stages: true,
      judges: true
    });
  };

  const handleDeselectAll = () => {
    setResetOptions({
      programs: false,
      members: false,
      teams: false,
      results: false,
      categories: false,
      stages: false,
      judges: false
    });
  };

  const handleExecuteReset = async () => {
    if (confirmWord !== 'RESET') {
      showToast("Please type 'RESET' to confirm data deletion.", "warning");
      return;
    }

    const payload = {
      reset_programs: resetOptions.programs,
      reset_members: resetOptions.members,
      reset_teams: resetOptions.teams,
      reset_results: resetOptions.results,
      reset_categories: resetOptions.categories,
      reset_stages: resetOptions.stages,
      reset_judges: resetOptions.judges
    };

    if (!Object.values(payload).some(Boolean)) {
      showToast("Please select at least one data option to delete.", "warning");
      return;
    }

    setIsResetting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/fest-settings/reset-data/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (res.ok) {
        showToast(json.message || "Fest data reset successfully!", "success");
        setShowResetModal(false);
        setConfirmWord('');
        if (loadSetupData) loadSetupData();
        if (fetchStats) fetchStats();
      } else {
        showToast(json.error || "Failed to reset data.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("An error occurred while resetting fest data.", "error");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div>
      {settingsSubTab === 'general' ? (
        /* ─── GENERAL SETTINGS SECTION ─── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel">
            <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Settings size={18} style={{ color: 'var(--primary-neon)' }} /> Fest Configuration Settings
            </h3>
            <form onSubmit={onSaveFestSettings}>
              <div className="form-group">
                <label className="form-label">Fest Name</label>
                <input type="text" className="form-control" value={festName} onChange={e => setFestName(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Year</label>
                <input type="number" className="form-control" value={festYear} onChange={e => setFestYear(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Tagline</label>
                <input type="text" className="form-control" value={festTagline} onChange={e => setFestTagline(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  value={festDescription}
                  onChange={e => setFestDescription(e.target.value)}
                  rows={3}
                  placeholder="Detailed fest description shown on the public home page..."
                  style={{ resize: 'vertical' }}
                />
              </div>
              
              <h4 style={{ margin: '1.5rem 0 0.75rem 0', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <PlusCircle size={16} style={{ color: 'var(--primary-neon)' }} /> Fest Dates
              </h4>
              <div className="form-group" style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <input 
                  type="date" 
                  className="form-control" 
                  id="new-fest-date-input" 
                  style={{ flex: 1 }}
                />
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ whiteSpace: 'nowrap' }}
                  onClick={() => {
                    const input = document.getElementById('new-fest-date-input');
                    const val = input ? input.value : '';
                    if (val && !festDates.includes(val)) {
                      const sorted = [...festDates, val].sort();
                      setFestDates(sorted);
                      if (input) input.value = '';
                    }
                  }}
                >
                  Add Date
                </button>
              </div>
              {festDates && festDates.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  {festDates.map((date) => (
                    <span 
                      key={date} 
                      className="tag" 
                      style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0.4rem', 
                        background: 'rgba(255,255,255,0.05)', 
                        borderColor: 'var(--border-glass)',
                        padding: '0.3rem 0.6rem',
                        borderRadius: '12px',
                        fontSize: '0.8rem'
                      }}
                    >
                      {date}
                      <Trash 
                        size={12} 
                        style={{ color: '#ff1744', cursor: 'pointer' }} 
                        onClick={() => {
                          setFestDates(prev => prev.filter(d => d !== date));
                        }}
                      />
                    </span>
                  ))}
                </div>
              )}

              <h4 style={{ margin: '1.5rem 0 0.75rem 0', fontFamily: 'var(--font-display)' }}>Rank Base Weights</h4>
              <div className="grid-cols-3">
                <div className="form-group">
                  <label className="form-label">1st Rank</label>
                  <input type="number" className="form-control" value={point1st} onChange={e => setPoint1st(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">2nd Rank</label>
                  <input type="number" className="form-control" value={point2nd} onChange={e => setPoint2nd(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">3rd Rank</label>
                  <input type="number" className="form-control" value={point3rd} onChange={e => setPoint3rd(e.target.value)} />
                </div>
              </div>
              
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}><Save size={16} /> Save Configuration</button>
            </form>
          </div>

          {/* ─── RESET DATA / DANGER ZONE PANEL ─── */}
          <div className="glass-panel" style={{ borderLeft: '4px solid #ff1744' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h4 style={{ color: '#ff1744', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <ShieldAlert size={18} /> Danger Zone: Reset Fest Data
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, maxWidth: '520px' }}>
                  Selectively reset or wipe operational data like programs, members, teams, marksheets, and results to start fresh or clear demo data.
                </p>
              </div>
              <button 
                type="button" 
                className="btn btn-danger"
                onClick={() => {
                  setConfirmWord('');
                  setShowResetModal(true);
                }}
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  padding: '0.6rem 1.2rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap'
                }}
              >
                <RotateCcw size={16} /> Reset Fest Data
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ─── USER & ACCESS SECTION ─── */
        <div className="grid-cols-2">
          {/* TEAMS PANEL */}
          <div className="glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Users size={18} style={{ color: 'var(--primary-neon)' }} /> Teams</h3>
              <button onClick={() => onOpenModal('add-team')} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                <PlusCircle size={14} /> Register Team & Lead
              </button>
            </div>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Team Name</th>
                    <th>Team Lead</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map(t => (
                    <tr key={t.id}>
                      <td style={{ fontWeight: 600 }}>{t.name}</td>
                      <td>{t.teamlead_username || 'TBD'}</td>
                      <td style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => onOpenModal('edit-team', t)} className="btn btn-secondary" style={{ padding: '0.3rem' }} title="Edit Team"><Edit size={14} /></button>
                        <button onClick={() => onDeleteItem('teams', t.id)} className="btn btn-danger" style={{ padding: '0.3rem' }} title="Delete Team"><Trash size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* JUDGES PANEL */}
          <div className="glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckSquare size={18} style={{ color: 'var(--primary-neon)' }} /> Judges</h3>
              <button onClick={() => onOpenModal('add-judge')} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                <PlusCircle size={14} /> Add Judge User
              </button>
            </div>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Username</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {judges.map(j => (
                    <tr key={j.id}>
                      <td style={{ fontWeight: 600 }}>{j.first_name} {j.last_name}</td>
                      <td>{j.username}</td>
                      <td style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => onOpenModal('edit-judge', j)} className="btn btn-secondary" style={{ padding: '0.3rem' }} title="Edit Judge"><Edit size={14} /></button>
                        <button onClick={() => onDeleteItem('users', j.id)} className="btn btn-danger" style={{ padding: '0.3rem' }} title="Delete Judge"><Trash size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── RESET DATA SELECTION MODAL ─── */}
      <Modal
        isOpen={showResetModal}
        onClose={() => !isResetting && setShowResetModal(false)}
        title="Reset Fest Data & Clear Records"
        maxWidth="600px"
      >
        <div>
          <div style={{ 
            background: 'rgba(255, 23, 68, 0.1)', 
            border: '1px solid rgba(255, 23, 68, 0.3)', 
            borderRadius: 'var(--radius-md)', 
            padding: '0.75rem 1rem', 
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.6rem'
          }}>
            <AlertTriangle size={18} style={{ color: '#ff1744', flexShrink: 0, marginTop: '2px' }} />
            <span style={{ fontSize: '0.85rem', color: '#ff5252', lineHeight: 1.4 }}>
              <strong>Warning:</strong> Selected records will be permanently removed from the database. Choose options for delete below.
            </span>
          </div>

          {/* Preset Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Selecting items to delete:
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={handleSelectAll}
                style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}
              >
                Select All
              </button>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={handleDeselectAll}
                style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}
              >
                Deselect All
              </button>
            </div>
          </div>

          {/* Option Checkboxes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
            {/* Programs Option */}
            <div 
              onClick={() => toggleResetOption('programs')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: resetOptions.programs ? 'rgba(255, 23, 68, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                border: `1px solid ${resetOptions.programs ? 'rgba(255, 23, 68, 0.4)' : 'var(--border-glass)'}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ color: resetOptions.programs ? '#ff1744' : 'var(--text-muted)' }}>
                  {resetOptions.programs ? <CheckSquare size={18} /> : <Square size={18} />}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Layers size={14} style={{ color: 'var(--primary-neon)' }} /> Programs & Events
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Deletes all programs, schedules, venues & poster templates
                  </div>
                </div>
              </div>
              <span className="tag" style={{ fontSize: '0.75rem' }}>{programs.length} Items</span>
            </div>

            {/* Members Option */}
            <div 
              onClick={() => toggleResetOption('members')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: resetOptions.members ? 'rgba(255, 23, 68, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                border: `1px solid ${resetOptions.members ? 'rgba(255, 23, 68, 0.4)' : 'var(--border-glass)'}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ color: resetOptions.members ? '#ff1744' : 'var(--text-muted)' }}>
                  {resetOptions.members ? <CheckSquare size={18} /> : <Square size={18} />}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Users size={14} style={{ color: 'var(--primary-neon)' }} /> Members & Participants
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Deletes registered participants, chest numbers & registrations
                  </div>
                </div>
              </div>
              <span className="tag" style={{ fontSize: '0.75rem' }}>{members.length} Items</span>
            </div>

            {/* Teams Option */}
            <div 
              onClick={() => toggleResetOption('teams')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: resetOptions.teams ? 'rgba(255, 23, 68, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                border: `1px solid ${resetOptions.teams ? 'rgba(255, 23, 68, 0.4)' : 'var(--border-glass)'}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ color: resetOptions.teams ? '#ff1744' : 'var(--text-muted)' }}>
                  {resetOptions.teams ? <CheckSquare size={18} /> : <Square size={18} />}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Award size={14} style={{ color: 'var(--primary-neon)' }} /> Teams & Team Leads
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Deletes team registrations and team lead links
                  </div>
                </div>
              </div>
              <span className="tag" style={{ fontSize: '0.75rem' }}>{teams.length} Items</span>
            </div>

            {/* Results & Marksheets Option */}
            <div 
              onClick={() => toggleResetOption('results')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: resetOptions.results ? 'rgba(255, 23, 68, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                border: `1px solid ${resetOptions.results ? 'rgba(255, 23, 68, 0.4)' : 'var(--border-glass)'}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ color: resetOptions.results ? '#ff1744' : 'var(--text-muted)' }}>
                  {resetOptions.results ? <CheckSquare size={18} /> : <Square size={18} />}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Trash2 size={14} style={{ color: 'var(--primary-neon)' }} /> Results, Marksheets & Lot Calls
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Clears judge marksheets, calculated ranks, lot codes & team points
                  </div>
                </div>
              </div>
              <span className="tag" style={{ fontSize: '0.75rem' }}>Scores Data</span>
            </div>

            {/* Categories Option */}
            <div 
              onClick={() => toggleResetOption('categories')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: resetOptions.categories ? 'rgba(255, 23, 68, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                border: `1px solid ${resetOptions.categories ? 'rgba(255, 23, 68, 0.4)' : 'var(--border-glass)'}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ color: resetOptions.categories ? '#ff1744' : 'var(--text-muted)' }}>
                  {resetOptions.categories ? <CheckSquare size={18} /> : <Square size={18} />}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Categories</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Deletes custom categories (reinstates default General category)
                  </div>
                </div>
              </div>
              <span className="tag" style={{ fontSize: '0.75rem' }}>{categories.length} Items</span>
            </div>

            {/* Stages Option */}
            <div 
              onClick={() => toggleResetOption('stages')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: resetOptions.stages ? 'rgba(255, 23, 68, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                border: `1px solid ${resetOptions.stages ? 'rgba(255, 23, 68, 0.4)' : 'var(--border-glass)'}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ color: resetOptions.stages ? '#ff1744' : 'var(--text-muted)' }}>
                  {resetOptions.stages ? <CheckSquare size={18} /> : <Square size={18} />}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MapPin size={14} style={{ color: 'var(--primary-neon)' }} /> Stages & Venues
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Deletes all stage setup definitions
                  </div>
                </div>
              </div>
              <span className="tag" style={{ fontSize: '0.75rem' }}>{stages.length} Items</span>
            </div>

            {/* Judges Option */}
            <div 
              onClick={() => toggleResetOption('judges')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: resetOptions.judges ? 'rgba(255, 23, 68, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                border: `1px solid ${resetOptions.judges ? 'rgba(255, 23, 68, 0.4)' : 'var(--border-glass)'}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ color: resetOptions.judges ? '#ff1744' : 'var(--text-muted)' }}>
                  {resetOptions.judges ? <CheckSquare size={18} /> : <Square size={18} />}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Judge Accounts</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Deletes registered judge user accounts
                  </div>
                </div>
              </div>
              <span className="tag" style={{ fontSize: '0.75rem' }}>{judges.length} Items</span>
            </div>
          </div>

          {/* Confirm Word Input */}
          <div style={{
            background: 'rgba(255, 23, 68, 0.06)',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(255, 23, 68, 0.2)',
            marginBottom: '1.5rem'
          }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#ff5252', marginBottom: '0.4rem' }}>
              Type <span style={{ textDecoration: 'underline', letterSpacing: '1px' }}>RESET</span> to confirm:
            </label>
            <input 
              type="text" 
              className="form-control" 
              value={confirmWord} 
              onChange={e => setConfirmWord(e.target.value)} 
              placeholder="Type RESET"
              style={{
                borderColor: confirmWord === 'RESET' ? '#00e676' : 'rgba(255, 23, 68, 0.4)',
                background: 'rgba(0,0,0,0.3)',
                fontWeight: 600
              }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => !isResetting && setShowResetModal(false)}
              disabled={isResetting}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-danger" 
              onClick={handleExecuteReset}
              disabled={confirmWord !== 'RESET' || !Object.values(resetOptions).some(Boolean) || isResetting}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              {isResetting ? <RefreshCw className="spinning" size={16} /> : <Trash2 size={16} />}
              Confirm & Reset Data
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
