import React, { useState } from 'react';
import { Printer, Filter, Trophy, Award, Medal, CheckCircle2, Search, FileText } from 'lucide-react';

export default function ReportViewer({ reportType, reportData }) {
  const [selectedStageFilter, setSelectedStageFilter] = useState('ALL');
  const [lotsFilter, setLotsFilter] = useState('all'); // 'all' | 'spinned_only'

  if (!reportData) return null;

  const normType = (reportType || '').toLowerCase();
  const isWinners = (
    normType.includes('winner') || 
    normType.includes('prize') || 
    normType === 'programs_vise' || 
    normType === 'programs_wise' || 
    Boolean(reportData && (reportData.winners || reportData.programs_wise))
  );

  // Section selection: '1' | '2' | '3' | '4' | '5' | 'all'
  const [selectedSection, setSelectedSection] = useState(() => {
    if (normType.includes('first_second') || normType.includes('1_2')) return '4';
    if (normType.includes('first') || normType.includes('1st')) return '1';
    if (normType.includes('second') || normType.includes('2nd')) return '2';
    if (normType.includes('third') || normType.includes('3rd') || normType.includes('thirt')) return '3';
    if (normType.includes('program')) return '5';
    return '1';
  });

  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [itemTypeFilter, setItemTypeFilter] = useState('all'); // 'all' | 'single' | 'group'
  const [searchFilter, setSearchFilter] = useState('');

  const isLots = !isWinners && (normType === 'lots' || normType === 'lot' || normType.includes('spin') || normType.includes('lot') || (reportData && (reportData.lots || reportData.multiple_lots)));
  const isResults = !isWinners && (normType === 'results' || normType === 'result' || (reportData && (reportData.results || reportData.multiple_results)));
  const isMembers = !isWinners && (normType === 'members' || normType === 'member' || (reportData && reportData.members));
  const isMarksheets = !isWinners && (normType === 'marksheets' || normType === 'marksheet' || (reportData && reportData.sheets));
  const isTeamPoints = !isWinners && (normType === 'teampoints' || normType === 'teampoint' || (reportData && reportData.teampoints));
  const isPerformers = !isWinners && (normType === 'performers' || normType === 'performer' || (reportData && reportData.individual_leaderboard));
  const isSchedule = !isWinners && (normType === 'schedule' || (reportData && reportData.schedule));

  // Winners data computation
  const rawWinners = reportData?.winners || [];
  const allCategories = Array.from(new Set(rawWinners.map(w => w.category_name).filter(Boolean))).sort();

  const matchesFilter = (w) => {
    if (categoryFilter !== 'ALL' && w.category_name !== categoryFilter) return false;
    if (itemTypeFilter === 'single' && w.program_type !== 'single') return false;
    if (itemTypeFilter === 'group' && w.program_type !== 'group') return false;
    if (searchFilter.trim()) {
      const q = searchFilter.trim().toLowerCase();
      const matchName = (w.member_name || '').toLowerCase().includes(q);
      const matchChest = String(w.chest_no || '').includes(q);
      const matchTeam = (w.team_name || '').toLowerCase().includes(q);
      const matchProg = (w.program_name || '').toLowerCase().includes(q);
      const matchCat = (w.category_name || '').toLowerCase().includes(q);
      if (!matchName && !matchChest && !matchTeam && !matchProg && !matchCat) return false;
    }
    return true;
  };

  const winners1st = rawWinners.filter(w => w.rank === 1 && matchesFilter(w));
  const winners2nd = rawWinners.filter(w => w.rank === 2 && matchesFilter(w));
  const winners3rd = rawWinners.filter(w => w.rank === 3 && matchesFilter(w));
  const winners1st2nd = rawWinners.filter(w => (w.rank === 1 || w.rank === 2) && matchesFilter(w));

  const top3Winners = rawWinners.filter(w => w.rank >= 1 && w.rank <= 3 && matchesFilter(w));
  const programsWiseMap = {};
  top3Winners.forEach(w => {
    const pid = w.program_id;
    if (!programsWiseMap[pid]) {
      programsWiseMap[pid] = {
        program_id: pid,
        program_name: w.program_name,
        program_type: w.program_type,
        category_id: w.category_id,
        category_name: w.category_name,
        has_ties: false,
        winners: []
      };
    }
    if (w.is_tie) programsWiseMap[pid].has_ties = true;
    programsWiseMap[pid].winners.push(w);
  });
  const programsWiseList = Object.values(programsWiseMap);

  const printSection = (sec) => {
    setSelectedSection(sec);
    setTimeout(() => {
      window.print();
    }, 120);
  };

  const renderWinnersTable = (list, sectionTitle) => {
    if (!list || list.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.9rem' }}>
          No winners found matching current filters for {sectionTitle}.
        </div>
      );
    }
    return (
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th style={{ width: '50px', textAlign: 'center' }}>Sl No</th>
              <th style={{ width: '105px', textAlign: 'center' }}>Rank</th>
              <th>Name (Candidate)</th>
              <th>Group (Team)</th>
              <th>Item (Program)</th>
              <th>Category</th>
              <th style={{ width: '85px', textAlign: 'center' }}>Avg Marks</th>
              <th style={{ width: '75px', textAlign: 'center' }}>Grade</th>
              <th style={{ width: '85px', textAlign: 'center' }}>Points</th>
            </tr>
          </thead>
          <tbody>
            {list.map((w, idx) => (
              <tr key={w.id || idx}>
                <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{idx + 1}</td>
                <td style={{ textAlign: 'center' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '0.78rem',
                    background: w.rank === 1 ? 'rgba(255, 215, 0, 0.18)' : w.rank === 2 ? 'rgba(192, 192, 192, 0.18)' : 'rgba(205, 127, 50, 0.18)',
                    color: w.rank === 1 ? '#ffd700' : w.rank === 2 ? '#c0c0c0' : '#cd7f32',
                    border: `1px solid ${w.rank === 1 ? 'rgba(255, 215, 0, 0.4)' : w.rank === 2 ? 'rgba(192, 192, 192, 0.4)' : 'rgba(205, 127, 50, 0.4)'}`
                  }}>
                    {w.rank === 1 ? '🥇 1st' : w.rank === 2 ? '🥈 2nd' : w.rank === 3 ? '🥉 3rd' : `#${w.rank}`}
                  </span>
                  {w.is_tie && (
                    <span style={{
                      display: 'inline-block',
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      marginLeft: '4px',
                      padding: '1px 5px',
                      borderRadius: '8px',
                      background: 'rgba(239, 68, 68, 0.18)',
                      color: '#ef4444',
                      border: '1px solid rgba(239, 68, 68, 0.35)'
                    }}>
                      Tie
                    </span>
                  )}
                </td>
                <td>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {w.member_name}
                  </div>
                  {w.chest_no && (
                    <div style={{ fontSize: '0.73rem', color: 'var(--primary-neon)' }}>
                      Chest #{w.chest_no}
                    </div>
                  )}
                </td>
                <td>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {w.team_name}
                  </span>
                </td>
                <td>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {w.program_name}
                  </div>
                  <span
                    className={`tag ${w.program_type === 'group' ? 'tag-warning' : 'tag-primary'}`}
                    style={{ fontSize: '0.65rem', padding: '1px 6px', marginTop: '2px', display: 'inline-block' }}
                  >
                    {w.program_type === 'group' ? 'Group Item' : 'Single Item'}
                  </span>
                </td>
                <td>
                  <span className="tag tag-secondary" style={{ fontSize: '0.72rem' }}>
                    {w.category_name}
                  </span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  {w.total_marks != null ? w.total_marks : '—'}
                </td>
                <td style={{ textAlign: 'center', fontWeight: 600 }}>
                  {w.grade || '—'}
                </td>
                <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--success-neon)' }}>
                  {w.points != null ? `${w.points} pts` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderProgramsWiseSection = () => {
    if (!programsWiseList || programsWiseList.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.9rem' }}>
          No programs found matching current filters.
        </div>
      );
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {programsWiseList.map((prog) => (
          <div
            key={prog.program_id}
            style={{
              breakInside: 'avoid',
              pageBreakInside: 'avoid',
              border: '1px solid var(--border-glass)',
              borderRadius: '10px',
              padding: '1.25rem',
              background: 'rgba(255, 255, 255, 0.02)'
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1.5px solid var(--border-glass)',
              paddingBottom: '0.6rem',
              marginBottom: '0.85rem',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                <h4 style={{ margin: 0, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', fontSize: '1.1rem' }}>
                  {prog.program_name}
                </h4>
                <span
                  className={`tag ${prog.program_type === 'group' ? 'tag-warning' : 'tag-primary'}`}
                  style={{ fontSize: '0.68rem', padding: '2px 8px' }}
                >
                  {prog.program_type === 'group' ? 'Group Item' : 'Single Item'}
                </span>
                {prog.has_ties && (
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '10px',
                    background: 'rgba(239, 68, 68, 0.18)',
                    color: '#ef4444',
                    border: '1px solid rgba(239, 68, 68, 0.35)'
                  }}>
                    Tie on Rank
                  </span>
                )}
              </div>
              <span className="tag tag-primary" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                {prog.category_name}
              </span>
            </div>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th style={{ width: '105px', textAlign: 'center' }}>Rank</th>
                    <th>Name (Candidate)</th>
                    <th>Group (Team)</th>
                    <th>Item</th>
                    <th>Category</th>
                    <th style={{ width: '85px', textAlign: 'center' }}>Avg Marks</th>
                    <th style={{ width: '75px', textAlign: 'center' }}>Grade</th>
                    <th style={{ width: '85px', textAlign: 'center' }}>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {prog.winners.map((w, wIdx) => (
                    <tr key={w.id || wIdx}>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '0.78rem',
                          background: w.rank === 1 ? 'rgba(255, 215, 0, 0.18)' : w.rank === 2 ? 'rgba(192, 192, 192, 0.18)' : 'rgba(205, 127, 50, 0.18)',
                          color: w.rank === 1 ? '#ffd700' : w.rank === 2 ? '#c0c0c0' : '#cd7f32',
                          border: `1px solid ${w.rank === 1 ? 'rgba(255, 215, 0, 0.4)' : w.rank === 2 ? 'rgba(192, 192, 192, 0.4)' : 'rgba(205, 127, 50, 0.4)'}`
                        }}>
                          {w.rank === 1 ? '🥇 1st' : w.rank === 2 ? '🥈 2nd' : w.rank === 3 ? '🥉 3rd' : `#${w.rank}`}
                        </span>
                        {w.is_tie && (
                          <span style={{
                            display: 'inline-block',
                            fontSize: '0.62rem',
                            fontWeight: 700,
                            marginLeft: '4px',
                            padding: '1px 5px',
                            borderRadius: '8px',
                            background: 'rgba(239, 68, 68, 0.18)',
                            color: '#ef4444',
                            border: '1px solid rgba(239, 68, 68, 0.35)'
                          }}>
                            Tie
                          </span>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {w.member_name}
                        </div>
                        {w.chest_no && (
                          <div style={{ fontSize: '0.73rem', color: 'var(--primary-neon)' }}>
                            Chest #{w.chest_no}
                          </div>
                        )}
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {w.team_name}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        {w.program_name}
                      </td>
                      <td>
                        <span className="tag tag-secondary" style={{ fontSize: '0.72rem' }}>
                          {w.category_name}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {w.total_marks != null ? w.total_marks : '—'}
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>
                        {w.grade || '—'}
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--success-neon)' }}>
                        {w.points != null ? `${w.points} pts` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderSignOffFooter = () => (
    <div className="print-sign-footer" style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      marginTop: '3rem', 
      paddingTop: '1.5rem', 
      borderTop: '1px dashed var(--border-glass)', 
      fontSize: '0.82rem',
      breakInside: 'avoid',
      pageBreakInside: 'avoid'
    }}>
      <div style={{ textAlign: 'center', width: '210px' }}>
        <div className="sign-line" style={{ height: '28px', borderBottom: '1.5px solid var(--text-primary)', marginBottom: '6px' }} />
        <strong>Tabulation Officer</strong>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>Name & Signature</div>
      </div>
      <div style={{ textAlign: 'center', width: '210px' }}>
        <div className="sign-line" style={{ height: '28px', borderBottom: '1.5px solid var(--text-primary)', marginBottom: '6px' }} />
        <strong>Festival Convener</strong>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>Name & Signature</div>
      </div>
      <div style={{ textAlign: 'center', width: '210px' }}>
        <div className="sign-line" style={{ height: '28px', borderBottom: '1.5px solid var(--text-primary)', marginBottom: '6px' }} />
        <strong>General Secretary / Principal</strong>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>Seal & Signature</div>
      </div>
    </div>
  );

  return (
    <div className="glass-panel" id="printable-area">
      {/* ========================================================
          WINNERS REPORT HUB (5 Dedicated Sections)
          ======================================================== */}
      {isWinners ? (
        <div>
          {/* TOP OPTION SELECTOR (Hidden on print) */}
          <div className="no-print" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Trophy size={20} style={{ color: '#ffd700' }} /> Winners List & Official Reports
                </h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Click any of the 5 report options below to view and print that section immediately. Includes group items and ties.
                </p>
              </div>
              <button
                onClick={() => window.print()}
                className="btn btn-primary"
                style={{ padding: '0.5rem 1.1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}
              >
                <Printer size={16} /> Print Active View
              </button>
            </div>

            {/* 5 Prominent Option Buttons */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
              gap: '0.75rem',
              marginBottom: '1.25rem'
            }}>
              <button
                type="button"
                onClick={() => setSelectedSection('1')}
                className={`btn ${selectedSection === '1' ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  padding: '0.75rem 0.6rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.25rem',
                  borderRadius: '10px',
                  border: selectedSection === '1' ? '2px solid #ffd700' : '1px solid var(--border-glass)',
                  background: selectedSection === '1' ? 'rgba(255, 215, 0, 0.15)' : 'var(--bg-glass)'
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>🥇</span>
                <strong style={{ fontSize: '0.85rem' }}>1. First Prize Winner</strong>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Name, Group, Item, Cat</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedSection('2')}
                className={`btn ${selectedSection === '2' ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  padding: '0.75rem 0.6rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.25rem',
                  borderRadius: '10px',
                  border: selectedSection === '2' ? '2px solid #c0c0c0' : '1px solid var(--border-glass)',
                  background: selectedSection === '2' ? 'rgba(192, 192, 192, 0.15)' : 'var(--bg-glass)'
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>🥈</span>
                <strong style={{ fontSize: '0.85rem' }}>2. Second Prize Winner</strong>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Name, Group, Item, Cat</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedSection('3')}
                className={`btn ${selectedSection === '3' ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  padding: '0.75rem 0.6rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.25rem',
                  borderRadius: '10px',
                  border: selectedSection === '3' ? '2px solid #cd7f32' : '1px solid var(--border-glass)',
                  background: selectedSection === '3' ? 'rgba(205, 127, 50, 0.15)' : 'var(--bg-glass)'
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>🥉</span>
                <strong style={{ fontSize: '0.85rem' }}>3. Third Winner</strong>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Name, Group, Item, Cat</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedSection('4')}
                className={`btn ${selectedSection === '4' ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  padding: '0.75rem 0.6rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.25rem',
                  borderRadius: '10px',
                  border: selectedSection === '4' ? '2px solid var(--accent)' : '1px solid var(--border-glass)',
                  background: selectedSection === '4' ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-glass)'
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>🥇🥈</span>
                <strong style={{ fontSize: '0.85rem' }}>4. First & Second</strong>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Combined 1st & 2nd</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedSection('5')}
                className={`btn ${selectedSection === '5' ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  padding: '0.75rem 0.6rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.25rem',
                  borderRadius: '10px',
                  border: selectedSection === '5' ? '2px solid var(--primary-neon)' : '1px solid var(--border-glass)',
                  background: selectedSection === '5' ? 'rgba(139, 92, 246, 0.18)' : 'var(--bg-glass)'
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>📋</span>
                <strong style={{ fontSize: '0.85rem' }}>5. Programs-Vise Report</strong>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>First 3 ranks per event</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedSection('all')}
                className={`btn ${selectedSection === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  padding: '0.75rem 0.6rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.25rem',
                  borderRadius: '10px',
                  border: selectedSection === 'all' ? '2px solid var(--text-primary)' : '1px solid var(--border-glass)'
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>📑</span>
                <strong style={{ fontSize: '0.85rem' }}>All 5 Sections</strong>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>View & print all</span>
              </button>
            </div>

            {/* Quick Filters Bar (Non-intrusive) */}
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'center',
              flexWrap: 'wrap',
              padding: '0.65rem 0.85rem',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '8px',
              border: '1px solid var(--border-glass)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <label style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Filter Category:</label>
                <select
                  className="form-control"
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  style={{ height: '30px', fontSize: '0.78rem', padding: '0.2rem 0.5rem', width: 'auto', minWidth: '130px' }}
                >
                  <option value="ALL">All Categories</option>
                  {allCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <label style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Item Type:</label>
                <select
                  className="form-control"
                  value={itemTypeFilter}
                  onChange={e => setItemTypeFilter(e.target.value)}
                  style={{ height: '30px', fontSize: '0.78rem', padding: '0.2rem 0.5rem', width: 'auto' }}
                >
                  <option value="all">All Items (Single & Group)</option>
                  <option value="single">Single Items Only</option>
                  <option value="group">Group Items Only</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flex: 1, minWidth: '180px' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Quick search name, team, item..."
                  value={searchFilter}
                  onChange={e => setSearchFilter(e.target.value)}
                  style={{ height: '30px', fontSize: '0.78rem', padding: '0.2rem 0.6rem' }}
                />
              </div>
            </div>
          </div>

          {/* OFFICIAL PRINT HEADER (Rendered in print) */}
          <div className="print-header" style={{ textAlign: 'center', borderBottom: '2px solid var(--border-glass)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)' }}>FESTALCHEMY OFFICIAL FESTIVAL REPORT</h2>
            <h4 style={{ color: 'var(--secondary-neon)', textTransform: 'uppercase', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              {selectedSection === '1' ? '1st Prize Winners Report (First Place)' :
               selectedSection === '2' ? '2nd Prize Winners Report (Second Place)' :
               selectedSection === '3' ? '3rd Prize Winners Report (Third Place)' :
               selectedSection === '4' ? '1st & 2nd Prize Winners Report' :
               selectedSection === '5' ? 'Programs-Vise Winners Report (First 3 Ranks)' :
               'Festival Prize Winners Publication (All Sections)'}
            </h4>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
              <span>Generated on: {new Date().toLocaleString()}</span>
              {categoryFilter !== 'ALL' && <span>• Category: <strong>{categoryFilter}</strong></span>}
              {itemTypeFilter !== 'all' && <span>• Scope: <strong>{itemTypeFilter === 'single' ? 'Single Items Only' : 'Group Items Only'}</strong></span>}
            </div>
          </div>

          {/* ========================================================
              SECTION 1: 1ST PRIZE WINNER REPORT
              ======================================================== */}
          {(selectedSection === '1' || selectedSection === 'all') && (
            <div style={{ marginBottom: '3.5rem', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(255, 215, 0, 0.05)',
                border: '1.5px solid rgba(255, 215, 0, 0.35)',
                padding: '0.85rem 1.25rem',
                borderRadius: '10px',
                marginBottom: '1rem',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}>
                <div>
                  <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.15rem', color: 'var(--text-primary)' }}>
                    <span>🥇</span> Section 1: First Prize Winner Report
                  </h3>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Official publication of 1st rank winners • Name, Group, Item, and Category
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className="tag tag-primary" style={{ fontSize: '0.75rem' }}>
                    {winners1st.length} Winners
                  </span>
                  {winners1st.filter(w => w.is_tie).length > 0 && (
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.18)', color: '#ef4444' }}>
                      ✨ {winners1st.filter(w => w.is_tie).length} Ties Shown
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => printSection('1')}
                    className="btn btn-primary no-print"
                    style={{ padding: '0.35rem 0.85rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <Printer size={14} /> Print Section 1
                  </button>
                </div>
              </div>

              {renderWinnersTable(winners1st, "1st Prize Winners")}
              {selectedSection === '1' && renderSignOffFooter()}
            </div>
          )}

          {/* ========================================================
              SECTION 2: 2ND PRIZE WINNER REPORT
              ======================================================== */}
          {(selectedSection === '2' || selectedSection === 'all') && (
            <div style={{ marginBottom: '3.5rem', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(192, 192, 192, 0.05)',
                border: '1.5px solid rgba(192, 192, 192, 0.35)',
                padding: '0.85rem 1.25rem',
                borderRadius: '10px',
                marginBottom: '1rem',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}>
                <div>
                  <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.15rem', color: 'var(--text-primary)' }}>
                    <span>🥈</span> Section 2: Second Prize Winner Report
                  </h3>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Official publication of 2nd rank winners • Name, Group, Item, and Category
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className="tag tag-primary" style={{ fontSize: '0.75rem' }}>
                    {winners2nd.length} Winners
                  </span>
                  {winners2nd.filter(w => w.is_tie).length > 0 && (
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.18)', color: '#ef4444' }}>
                      ✨ {winners2nd.filter(w => w.is_tie).length} Ties Shown
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => printSection('2')}
                    className="btn btn-primary no-print"
                    style={{ padding: '0.35rem 0.85rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <Printer size={14} /> Print Section 2
                  </button>
                </div>
              </div>

              {renderWinnersTable(winners2nd, "2nd Prize Winners")}
              {selectedSection === '2' && renderSignOffFooter()}
            </div>
          )}

          {/* ========================================================
              SECTION 3: THIRD WINNER REPORT
              ======================================================== */}
          {(selectedSection === '3' || selectedSection === 'all') && (
            <div style={{ marginBottom: '3.5rem', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(205, 127, 50, 0.05)',
                border: '1.5px solid rgba(205, 127, 50, 0.35)',
                padding: '0.85rem 1.25rem',
                borderRadius: '10px',
                marginBottom: '1rem',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}>
                <div>
                  <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.15rem', color: 'var(--text-primary)' }}>
                    <span>🥉</span> Section 3: Third Winner Report
                  </h3>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Official publication of 3rd rank winners • Name, Group, Item, and Category with ties
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className="tag tag-primary" style={{ fontSize: '0.75rem' }}>
                    {winners3rd.length} Winners
                  </span>
                  {winners3rd.filter(w => w.is_tie).length > 0 && (
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.18)', color: '#ef4444' }}>
                      ✨ {winners3rd.filter(w => w.is_tie).length} Ties Shown
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => printSection('3')}
                    className="btn btn-primary no-print"
                    style={{ padding: '0.35rem 0.85rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <Printer size={14} /> Print Section 3
                  </button>
                </div>
              </div>

              {renderWinnersTable(winners3rd, "3rd Winners")}
              {selectedSection === '3' && renderSignOffFooter()}
            </div>
          )}

          {/* ========================================================
              SECTION 4: FIRST & SECOND PRIZE WINNERS REPORT
              ======================================================== */}
          {(selectedSection === '4' || selectedSection === 'all') && (
            <div style={{ marginBottom: '3.5rem', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(99, 102, 241, 0.05)',
                border: '1.5px solid rgba(99, 102, 241, 0.35)',
                padding: '0.85rem 1.25rem',
                borderRadius: '10px',
                marginBottom: '1rem',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}>
                <div>
                  <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.15rem', color: 'var(--text-primary)' }}>
                    <span>🥇🥈</span> Section 4: First & Second Prize Winners Report
                  </h3>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Combined publication of 1st and 2nd rank winners across all events
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className="tag tag-primary" style={{ fontSize: '0.75rem' }}>
                    {winners1st2nd.length} Winners
                  </span>
                  {winners1st2nd.filter(w => w.is_tie).length > 0 && (
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.18)', color: '#ef4444' }}>
                      ✨ {winners1st2nd.filter(w => w.is_tie).length} Ties Shown
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => printSection('4')}
                    className="btn btn-primary no-print"
                    style={{ padding: '0.35rem 0.85rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <Printer size={14} /> Print Section 4
                  </button>
                </div>
              </div>

              {renderWinnersTable(winners1st2nd, "1st & 2nd Winners")}
              {selectedSection === '4' && renderSignOffFooter()}
            </div>
          )}

          {/* ========================================================
              SECTION 5: PROGRAMS-VISE REPORT (First 3 Ranks of Programs)
              ======================================================== */}
          {(selectedSection === '5' || selectedSection === 'all') && (
            <div style={{ marginBottom: '3.5rem', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(139, 92, 246, 0.05)',
                border: '1.5px solid rgba(139, 92, 246, 0.35)',
                padding: '0.85rem 1.25rem',
                borderRadius: '10px',
                marginBottom: '1rem',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}>
                <div>
                  <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.15rem', color: 'var(--text-primary)' }}>
                    <span>📋</span> Section 5: Programs-Vise Report (First 3 Ranks)
                  </h3>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Program-by-program breakdown of 1st, 2nd, and 3rd rank winners with ties & group items
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className="tag tag-primary" style={{ fontSize: '0.75rem' }}>
                    {programsWiseList.length} Programs
                  </span>
                  <button
                    type="button"
                    onClick={() => printSection('5')}
                    className="btn btn-primary no-print"
                    style={{ padding: '0.35rem 0.85rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <Printer size={14} /> Print Section 5
                  </button>
                </div>
              </div>

              {renderProgramsWiseSection()}
              {selectedSection === '5' && renderSignOffFooter()}
            </div>
          )}

          {/* Global Sign-off footer if all 5 sections are printed together */}
          {selectedSection === 'all' && renderSignOffFooter()}
        </div>
      ) : (
        /* ========================================================
            NON-WINNER REPORTS (Lots, Results, Members, Marksheets, etc.)
            ======================================================== */
        <div>
          {/* Print button bar (hidden on print) */}
          <div className="no-print" style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            borderBottom: '1px solid var(--border-glass)',
            paddingBottom: '1rem',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Report generated successfully. Ready to print.
              </span>

              {isLots && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: 600 }}>
                    <Filter size={14} /> Scope:
                  </span>
                  <button
                    type="button"
                    onClick={() => setLotsFilter('all')}
                    className={`btn ${lotsFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '0.2rem 0.65rem', fontSize: '0.75rem', borderRadius: '15px' }}
                  >
                    All Registered
                  </button>
                  <button
                    type="button"
                    onClick={() => setLotsFilter('spinned_only')}
                    className={`btn ${lotsFilter === 'spinned_only' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '0.2rem 0.65rem', fontSize: '0.75rem', borderRadius: '15px' }}
                  >
                    Spinned Lots Only
                  </button>
                </div>
              )}
              {isSchedule && reportData.schedule && (() => {
                const rawSchedule = reportData.schedule || [];
                const uniqueStages = Array.from(new Set(rawSchedule.map(p => p.venue).filter(Boolean)));
                return (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: 600 }}>
                      <Filter size={14} /> Stage Filter:
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedStageFilter('ALL')}
                      className={`btn ${selectedStageFilter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '0.2rem 0.55rem', fontSize: '0.75rem', borderRadius: '15px' }}
                    >
                      All ({rawSchedule.length})
                    </button>
                    {uniqueStages.map(stg => {
                      const count = rawSchedule.filter(p => p.venue === stg).length;
                      return (
                        <button
                          type="button"
                          key={stg}
                          onClick={() => setSelectedStageFilter(stg)}
                          className={`btn ${selectedStageFilter === stg ? 'btn-primary' : 'btn-secondary'}`}
                          style={{ padding: '0.2rem 0.55rem', fontSize: '0.75rem', borderRadius: '15px' }}
                        >
                          {stg} ({count})
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => setSelectedStageFilter('UNASSIGNED')}
                      className={`btn ${selectedStageFilter === 'UNASSIGNED' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '0.2rem 0.55rem', fontSize: '0.75rem', borderRadius: '15px' }}
                    >
                      Unassigned ({rawSchedule.filter(p => !p.venue).length})
                    </button>
                  </div>
                );
              })()}
            </div>
            <button onClick={() => window.print()} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Printer size={16} /> Print Report
            </button>
          </div>

          <div className="print-header" style={{ textAlign: 'center', borderBottom: '2px solid var(--border-glass)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)' }}>FESTALCHEMY OFFICIAL REPORT</h2>
            <h4 style={{ color: 'var(--secondary-neon)', textTransform: 'uppercase', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              {isResults ? 'Event Results & Scoreboard' : 
               isMembers ? 'Registered Members Directory' : 
               isMarksheets ? 'Marksheets Entry Log' : 
               isTeamPoints ? 'Overall Team Standings' : 
               isPerformers ? 'Top Performers — Individual Leaderboard' : 
               isSchedule ? (selectedStageFilter === 'ALL' ? 'Fest Schedule — All Venues' : `Fest Schedule — ${selectedStageFilter}`) : 
               isLots ? 'Candidate Lot Draw & Signature Verification Sheet' : 'Official Festival Report'}
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
              Generated on: {new Date().toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {isResults && reportData.results && (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Sl No</th>
                <th>Rank</th>
                <th>Name</th>
                <th>Team</th>
                <th>Avg Marks</th>
                <th>Grade</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {reportData.results.map((r, idx) => (
                <tr key={r.id}>
                  <td>{idx + 1}</td>
                  <td style={{ fontWeight: 'bold' }}>#{r.rank}</td>
                  <td style={{ fontWeight: 600 }}>{r.member_name}</td>
                  <td>{r.team_name}</td>
                  <td>{r.total_marks != null ? r.total_marks : '—'}</td>
                  <td>{r.grade || '—'}</td>
                  <td style={{ fontWeight: 'bold', color: 'var(--success-neon)' }}>{r.points} pts</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {reportType === 'results' && reportData.multiple_results && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {reportData.multiple_results.map((prog) => (
            <div key={prog.program_id} style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
              <div style={{
                display: 'flex',
                justify: 'space-between',
                alignItems: 'baseline',
                borderBottom: '1px solid var(--border-glass)',
                paddingBottom: '0.4rem',
                marginBottom: '0.8rem'
              }}>
                <h4 style={{ margin: 0, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', fontSize: '1.05rem' }}>
                  {prog.program_name}
                </h4>
                {prog.category_name && (
                  <span className="tag tag-primary" style={{ fontSize: '0.7rem' }}>
                    {prog.category_name}
                  </span>
                )}
              </div>

              {prog.results && prog.results.length > 0 ? (
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Sl No</th>
                        <th>Rank</th>
                        <th>Name</th>
                        <th>Team</th>
                        <th>Avg Marks</th>
                        <th>Grade</th>
                        <th>Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prog.results.map((r, idx) => (
                        <tr key={r.id}>
                          <td>{idx + 1}</td>
                          <td style={{ fontWeight: 'bold' }}>#{r.rank}</td>
                          <td style={{ fontWeight: 600 }}>{r.member_name}</td>
                          <td>{r.team_name}</td>
                          <td>{r.total_marks != null ? r.total_marks : '—'}</td>
                          <td>{r.grade || '—'}</td>
                          <td style={{ fontWeight: 'bold', color: 'var(--success-neon)' }}>{r.points} pts</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontStyle: 'italic', marginTop: '0.5rem' }}>
                  No published results for this program yet.
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {reportType === 'members' && reportData.members && (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Sl No</th>
                <th>Chest No</th>
                <th>Name</th>
                <th>Team</th>
                <th>Category</th>
                <th>Registered Programs</th>
              </tr>
            </thead>
            <tbody>
              {reportData.members.map((m, idx) => {
                const chestNo = m.chest_no ?? m.chest_number ?? 'TBD';
                const progList = m.registered_programs_details || m.programs || [];

                return (
                  <tr key={m.id}>
                    <td>{idx + 1}</td>
                    <td style={{ fontWeight: 'bold', color: 'var(--primary-neon)' }}>
                      {chestNo}
                    </td>
                    <td style={{ fontWeight: 600 }}>{m.name}</td>
                    <td>{m.team_name || '—'}</td>
                    <td><span className="tag tag-primary">{m.category_name || '—'}</span></td>
                    <td>
                      {progList && progList.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                          {progList.map((p, pIdx) => {
                            const progName = typeof p === 'string' ? p : (p?.name || `Program #${p?.id}`);
                            return (
                              <span 
                                key={p?.id || pIdx} 
                                className="tag tag-secondary" 
                                style={{ fontSize: '0.75rem', padding: '0.15rem 0.45rem' }}
                              >
                                {progName}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>None</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {reportType === 'marksheets' && reportData.marksheets && (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Sl No</th>
                <th>Program</th>
                <th>Judge</th>
                <th>Participant</th>
                <th>Marks</th>
                <th>Submitted At</th>
              </tr>
            </thead>
            <tbody>
              {reportData.marksheets.map((ms, idx) => (
                <tr key={ms.id}>
                  <td>{idx + 1}</td>
                  <td style={{ fontWeight: 600 }}>{ms.program_name}</td>
                  <td>{ms.judge_username}</td>
                  <td>{ms.member_name} ({ms.chest_number})</td>
                  <td style={{ fontWeight: 'bold', color: 'var(--primary-neon)' }}>{ms.total_marks}</td>
                  <td>{new Date(ms.submitted_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {reportType === 'teampoints' && reportData.standings && (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Team Name</th>
                <th>Total Points</th>
              </tr>
            </thead>
            <tbody>
              {reportData.standings.map((t, idx) => (
                <tr key={t.team_id}>
                  <td style={{ fontWeight: 'bold' }}>#{idx + 1}</td>
                  <td style={{ fontWeight: 600 }}>{t.team_name}</td>
                  <td style={{ fontWeight: 'bold', color: 'var(--secondary-neon)' }}>{t.total_points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {reportType === 'performers' && reportData.individual_leaderboard && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {reportData.individual_leaderboard.map((catGroup) => (
            <div key={catGroup.category_id || catGroup.category_name} style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
              <h3 style={{ 
                fontFamily: 'var(--font-display)', 
                color: 'var(--gold)', 
                borderBottom: '1px solid var(--border-glass)', 
                paddingBottom: '0.4rem', 
                marginBottom: '1rem',
                fontSize: '1.2rem'
              }}>
                Category: {catGroup.category_name}
              </h3>
              
              {catGroup.performers && catGroup.performers.length > 0 ? (
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th style={{ width: '60px' }}>Rank</th>
                        <th>Chest No</th>
                        <th>Participant Name</th>
                        <th>Team</th>
                        <th style={{ width: '110px' }}>Events Count</th>
                        <th style={{ width: '110px' }}>Total Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {catGroup.performers.map((p, pIdx) => (
                        <tr key={p.member_id}>
                          <td style={{ fontWeight: 'bold' }}>#{pIdx + 1}</td>
                          <td style={{ fontWeight: 'bold', color: 'var(--primary-neon)' }}>{p.chest_number || '—'}</td>
                          <td style={{ fontWeight: 600 }}>{p.member_name}</td>
                          <td>{p.team_name}</td>
                          <td style={{ fontWeight: 600 }}>{p.events_count} event{p.events_count > 1 ? 's' : ''}</td>
                          <td style={{ fontWeight: 'bold', color: 'var(--success-neon)' }}>{p.total_points} pts</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                  No published single event scores recorded for this category yet.
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {reportType === 'schedule' && reportData.schedule && (() => {
        const getScheduleByDay = () => {
          const rawSchedule = reportData.schedule || [];
          const festDates = reportData.fest_dates || [];

          const schedule = rawSchedule.filter(p => {
            if (selectedStageFilter === 'ALL') return true;
            if (selectedStageFilter === 'UNASSIGNED') return !p.venue;
            return p.venue === selectedStageFilter;
          });
          
          // Group programs by YYYY-MM-DD
          const grouped = {};
          festDates.forEach((d) => {
            grouped[d] = [];
          });
          const otherScheduled = [];
          
          schedule.forEach((p) => {
            if (!p.schedule) return;
            const dt = new Date(p.schedule);
            const year = dt.getFullYear();
            const month = String(dt.getMonth() + 1).padStart(2, '0');
            const day = String(dt.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;
            
            if (grouped[dateStr] !== undefined) {
              grouped[dateStr].push(p);
            } else {
              otherScheduled.push(p);
            }
          });
          
          return { grouped, otherScheduled, festDates };
        };

        const { grouped, otherScheduled, festDates } = getScheduleByDay();
        
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {festDates.map((dateStr, idx) => {
              const list = grouped[dateStr] || [];
              return (
                <div key={dateStr} style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                  <h3 style={{ 
                    fontFamily: 'var(--font-display)', 
                    color: 'var(--primary-neon)', 
                    borderBottom: '1px solid var(--border-glass)', 
                    paddingBottom: '0.5rem', 
                    marginBottom: '1rem',
                    fontSize: '1.25rem',
                    display: 'flex',
                    justify: 'space-between',
                    alignItems: 'baseline'
                  }}>
                    <span>Day {idx + 1}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{dateStr}</span>
                  </h3>
                  {list.length > 0 ? (
                    <div className="table-container">
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th style={{ width: '60px' }}>Sl No</th>
                            <th>Event Name</th>
                            <th>Category</th>
                            <th>Venue / Stage</th>
                            <th>Start Time</th>
                            <th>End Time</th>
                            <th style={{ width: '120px' }}>Registrations</th>
                          </tr>
                        </thead>
                        <tbody>
                          {list.map((p, sIdx) => {
                            const startTime = p.schedule ? new Date(p.schedule).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
                            const endTime = p.end_time ? new Date(p.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
                            return (
                              <tr key={p.id}>
                                <td>{sIdx + 1}</td>
                                <td style={{ fontWeight: 600 }}>{p.name}</td>
                                <td><span className="tag tag-primary">{p.category_name}</span></td>
                                <td>{p.venue || <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Not Set</span>}</td>
                                <td style={{ fontWeight: 600 }}>{startTime}</td>
                                <td style={{ fontWeight: 600, color: 'var(--secondary-neon)' }}>{endTime}</td>
                                <td style={{ fontWeight: 'bold' }}>{p.registered_members_count}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontStyle: 'italic', marginTop: '0.5rem' }}>
                      No programs scheduled on this day matching stage filter.
                    </p>
                  )}
                </div>
              );
            })}

            {otherScheduled.length > 0 && (
              <div style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                <h3 style={{ 
                  fontFamily: 'var(--font-display)', 
                  color: 'var(--accent)', 
                  borderBottom: '1px solid var(--border-glass)', 
                  paddingBottom: '0.5rem', 
                  marginBottom: '1rem',
                  fontSize: '1.25rem'
                }}>
                  Other Dates
                </h3>
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th style={{ width: '60px' }}>Sl No</th>
                        <th>Event Name</th>
                        <th>Category</th>
                        <th>Venue / Stage</th>
                        <th>Start Time</th>
                        <th>End Time</th>
                        <th style={{ width: '120px' }}>Registrations</th>
                      </tr>
                    </thead>
                    <tbody>
                      {otherScheduled.map((p, sIdx) => {
                        const startTime = p.schedule ? new Date(p.schedule).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '—';
                        const endTime = p.end_time ? new Date(p.end_time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '—';
                        return (
                          <tr key={p.id}>
                            <td>{sIdx + 1}</td>
                            <td style={{ fontWeight: 600 }}>{p.name}</td>
                            <td><span className="tag tag-primary">{p.category_name}</span></td>
                            <td>{p.venue || <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Not Set</span>}</td>
                            <td style={{ fontWeight: 600 }}>{startTime}</td>
                            <td style={{ fontWeight: 600, color: 'var(--secondary-neon)' }}>{endTime}</td>
                            <td style={{ fontWeight: 'bold' }}>{p.registered_members_count}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* SINGLE PROGRAM SPINNED LOTS REPORT */}
      {isLots && reportData.lots && (() => {
        const rawLots = reportData.lots || [];
        const displayedLots = rawLots.filter(lot => {
          if (lotsFilter === 'spinned_only') {
            return lot.status === 'called' || lot.status === 'present' || (lot.lot_code && !lot.lot_code.startsWith('#'));
          }
          return true;
        });

        return (
          <div className="printable-sheet" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
            {reportData.program && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.75rem',
                padding: '1.25rem',
                marginBottom: '1rem',
                borderRadius: '8px',
                border: '1px solid var(--border-glass)',
                background: 'var(--bg-glass)'
              }}>
                <div>
                  <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', fontSize: '1.25rem' }}>
                    {reportData.program.name}
                  </h3>
                  <div style={{ display: 'flex', gap: '0.85rem', marginTop: '0.35rem', fontSize: '0.85rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                    {reportData.program.category_name && <span><strong>Category:</strong> {reportData.program.category_name}</span>}
                    {reportData.program.venue && <span><strong>Venue:</strong> {reportData.program.venue}</span>}
                    {reportData.program.stage_type && <span><strong>Stage:</strong> {reportData.program.stage_type.toUpperCase()}</span>}
                    {reportData.program.schedule && (
                      <span><strong>Schedule:</strong> {new Date(reportData.program.schedule).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="tag tag-primary" style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }}>
                    {displayedLots.length} Candidates {lotsFilter === 'spinned_only' ? '(Spinned)' : ''}
                  </span>
                </div>
              </div>
            )}

            {/* Candidate & Official Instructions Notice */}
            <div style={{ 
              background: 'rgba(99, 102, 241, 0.08)', 
              borderLeft: '4px solid var(--primary-neon)', 
              padding: '0.65rem 0.95rem', 
              marginBottom: '1.25rem', 
              fontSize: '0.8rem', 
              color: 'var(--text-primary)',
              borderRadius: '4px'
            }}>
              <strong>Notice for Candidates & Stage Officials:</strong> Each participant must verify their Chest Number, Lot Calling Order, and provide their signature in the dedicated column prior to entering the performance stage.
            </div>

            {displayedLots.length > 0 ? (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th style={{ width: '80px', textAlign: 'center' }}>Lot Code</th>
                      <th style={{ width: '100px', textAlign: 'center' }}>Chest No</th>
                      <th>Candidate Name</th>
                      <th>Team</th>
                      <th style={{ width: '90px', textAlign: 'center' }}>Status</th>
                      <th style={{ width: '190px', textAlign: 'center' }}>Candidate Signature</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedLots.map((lot, idx) => (
                      <tr key={lot.id || idx}>
                        <td style={{ textAlign: 'center' }}>
                          <span className="badge-lot">
                            {lot.lot_code ? (lot.lot_code.startsWith('#') ? lot.lot_code : `Code ${lot.lot_code}`) : `#${lot.lot_no || idx + 1}`}
                          </span>
                        </td>
                        <td style={{ fontWeight: 'bold', textAlign: 'center', color: 'var(--primary-neon)' }}>
                          {lot.chest_no || '—'}
                        </td>
                        <td style={{ fontWeight: 600 }}>{lot.member_name}</td>
                        <td>{lot.team_name || '—'}</td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={`tag ${lot.status === 'present' ? 'tag-primary' : lot.status === 'absent' ? 'tag-danger' : lot.status === 'called' ? 'tag-success' : 'tag-secondary'}`} style={{ textTransform: 'capitalize' }}>
                            {lot.status || 'waiting'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center', verticalAlign: 'bottom', paddingBottom: '12px' }}>
                          <div className="sign-line" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic', textAlign: 'center', padding: '2.5rem' }}>
                {lotsFilter === 'spinned_only' 
                  ? 'No participants have drawn lots yet for this event. Switch scope to "All Registered" or draw lots in Stage Calling.' 
                  : 'No registered participants found for this event.'}
              </p>
            )}

            {/* Verification Sign-Off Footer */}
            <div className="print-sign-footer" style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginTop: '3rem', 
              paddingTop: '1.5rem', 
              borderTop: '1px dashed var(--border-glass)', 
              fontSize: '0.85rem' 
            }}>
              <div style={{ textAlign: 'center', width: '240px' }}>
                <div className="sign-line" style={{ height: '26px', borderBottom: '1.5px solid var(--text-primary)', marginBottom: '6px' }} />
                <strong>Stage Calling Officer</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Name & Signature</div>
              </div>
              <div style={{ textAlign: 'center', width: '240px' }}>
                <div className="sign-line" style={{ height: '26px', borderBottom: '1.5px solid var(--text-primary)', marginBottom: '6px' }} />
                <strong>Stage Manager / Judge Witness</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Name & Signature</div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MULTIPLE PROGRAMS SPINNED LOTS REPORT */}
      {isLots && reportData.multiple_lots && reportData.multiple_lots.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          {reportData.multiple_lots.map((pGroup, pIdx) => {
            const prog = pGroup.program || pGroup || {};
            const rawLots = pGroup.lots || [];
            const lots = rawLots.filter(lot => {
              if (lotsFilter === 'spinned_only') {
                return lot.status === 'called' || lot.status === 'present' || (lot.lot_code && !lot.lot_code.startsWith('#'));
              }
              return true;
            });

            const progName = prog.name || prog.program_name || `Program #${prog.id || prog.program_id || pIdx + 1}`;
            const catName = prog.category_name || '';
            const venue = prog.venue || '';
            const stageType = prog.stage_type || '';
            const schedule = prog.schedule || '';

            return (
              <div 
                key={prog.id || prog.program_id || pIdx} 
                className="printable-sheet"
                style={{ 
                  breakInside: 'avoid', 
                  pageBreakInside: 'avoid',
                  pageBreakAfter: pIdx < reportData.multiple_lots.length - 1 ? 'always' : 'auto',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '10px',
                  padding: '1.5rem',
                  background: 'var(--bg-glass)'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  borderBottom: '1px solid var(--border-glass)',
                  paddingBottom: '0.85rem',
                  marginBottom: '1rem'
                }}>
                  <div>
                    <h4 style={{ margin: 0, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', fontSize: '1.2rem' }}>
                      {progName}
                    </h4>
                    <div style={{ display: 'flex', gap: '0.85rem', marginTop: '0.35rem', fontSize: '0.82rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                      {catName && <span><strong>Category:</strong> {catName}</span>}
                      {venue && <span><strong>Venue:</strong> {venue}</span>}
                      {stageType && <span><strong>Stage:</strong> {stageType.toUpperCase()}</span>}
                      {schedule && (
                        <span><strong>Schedule:</strong> {new Date(schedule).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                      )}
                    </div>
                  </div>
                  <span className="tag tag-primary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}>
                    {lots.length} Candidates {lotsFilter === 'spinned_only' ? '(Spinned)' : ''}
                  </span>
                </div>

                {/* Candidate & Official Instructions Notice */}
                <div style={{ 
                  background: 'rgba(99, 102, 241, 0.08)', 
                  borderLeft: '4px solid var(--primary-neon)', 
                  padding: '0.55rem 0.85rem', 
                  marginBottom: '1rem', 
                  fontSize: '0.78rem', 
                  color: 'var(--text-primary)',
                  borderRadius: '4px'
                }}>
                  <strong>Notice for Candidates & Stage Officials:</strong> Each participant must verify their Chest Number, Lot Calling Order, and provide their signature in the dedicated column prior to entering the performance stage.
                </div>

                {lots.length > 0 ? (
                  <div className="table-container">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th style={{ width: '80px', textAlign: 'center' }}>Lot Code</th>
                          <th style={{ width: '100px', textAlign: 'center' }}>Chest No</th>
                          <th>Candidate Name</th>
                          <th>Team</th>
                          <th style={{ width: '90px', textAlign: 'center' }}>Status</th>
                          <th style={{ width: '190px', textAlign: 'center' }}>Candidate Signature</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lots.map((lot, idx) => (
                          <tr key={lot.id || idx}>
                            <td style={{ textAlign: 'center' }}>
                              <span className="badge-lot">
                                {lot.lot_code ? (lot.lot_code.startsWith('#') ? lot.lot_code : `Code ${lot.lot_code}`) : `#${lot.lot_no || idx + 1}`}
                              </span>
                            </td>
                            <td style={{ fontWeight: 'bold', textAlign: 'center', color: 'var(--primary-neon)' }}>
                              {lot.chest_no || '—'}
                            </td>
                            <td style={{ fontWeight: 600 }}>{lot.member_name}</td>
                            <td>{lot.team_name || '—'}</td>
                            <td style={{ textAlign: 'center' }}>
                              <span className={`tag ${lot.status === 'present' ? 'tag-primary' : lot.status === 'absent' ? 'tag-danger' : lot.status === 'called' ? 'tag-success' : 'tag-secondary'}`} style={{ textTransform: 'capitalize' }}>
                                {lot.status || 'waiting'}
                              </span>
                            </td>
                            <td style={{ textAlign: 'center', verticalAlign: 'bottom', paddingBottom: '12px' }}>
                              <div className="sign-line" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontStyle: 'italic', margin: '0.5rem 0', textAlign: 'center', padding: '1rem' }}>
                    {lotsFilter === 'spinned_only' 
                      ? 'No participants have drawn lots yet for this event.' 
                      : 'No registered participants for this event.'}
                  </p>
                )}

                {/* Verification Sign-Off Footer */}
                <div className="print-sign-footer" style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginTop: '2.5rem', 
                  paddingTop: '1.25rem', 
                  borderTop: '1px dashed var(--border-glass)', 
                  fontSize: '0.82rem' 
                }}>
                  <div style={{ textAlign: 'center', width: '230px' }}>
                    <div className="sign-line" style={{ height: '24px', borderBottom: '1.5px solid var(--text-primary)', marginBottom: '4px' }} />
                    <strong>Stage Calling Officer</strong>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>Name & Signature</div>
                  </div>
                  <div style={{ textAlign: 'center', width: '230px' }}>
                    <div className="sign-line" style={{ height: '24px', borderBottom: '1.5px solid var(--text-primary)', marginBottom: '4px' }} />
                    <strong>Stage Manager / Judge Witness</strong>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>Name & Signature</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LOTS EMPTY STATE */}
      {isLots && !reportData.lots && (!reportData.multiple_lots || reportData.multiple_lots.length === 0) && (
        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            No spinned lots data found matching your selection.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.35rem' }}>
            Try selecting a specific program with registered participants or choose another category.
          </p>
        </div>
      )}
    </div>
  );
}
