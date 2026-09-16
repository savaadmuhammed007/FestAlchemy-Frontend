import React, { useState } from 'react';
import { Printer, Filter } from 'lucide-react';

export default function ReportViewer({ reportType, reportData }) {
  const [selectedStageFilter, setSelectedStageFilter] = useState('ALL');
  const [lotsFilter, setLotsFilter] = useState('all'); // 'all' | 'spinned_only'

  if (!reportData) return null;

  const normType = (reportType || '').toLowerCase();
  const isLots = normType === 'lots' || normType === 'lot' || normType.includes('spin') || normType.includes('lot') || (reportData && (reportData.lots || reportData.multiple_lots));
  const isResults = normType === 'results' || normType === 'result' || (reportData && (reportData.results || reportData.multiple_results));
  const isMembers = normType === 'members' || normType === 'member' || (reportData && reportData.members);
  const isMarksheets = normType === 'marksheets' || normType === 'marksheet' || (reportData && reportData.sheets);
  const isTeamPoints = normType === 'teampoints' || normType === 'teampoint' || (reportData && reportData.teampoints);
  const isPerformers = normType === 'performers' || normType === 'performer' || (reportData && reportData.individual_leaderboard);
  const isSchedule = normType === 'schedule' || (reportData && reportData.schedule);

  return (
    <div className="glass-panel" id="printable-area">
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
