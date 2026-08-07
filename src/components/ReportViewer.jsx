import React, { useState } from 'react';
import { Printer, Filter } from 'lucide-react';

export default function ReportViewer({ reportType, reportData }) {
  const [selectedStageFilter, setSelectedStageFilter] = useState('ALL');

  if (!reportData) return null;

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
          {reportType === 'schedule' && reportData.schedule && (() => {
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
          {reportType === 'results' ? 'Event Results & Scoreboard' : 
           reportType === 'members' ? 'Registered Members Directory' : 
           reportType === 'marksheets' ? 'Marksheets Entry Log' : 
           reportType === 'teampoints' ? 'Overall Team Standings' : 
           reportType === 'schedule' ? (selectedStageFilter === 'ALL' ? 'Fest Schedule — All Venues' : `Fest Schedule — ${selectedStageFilter}`) : ''}
        </h4>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
          Generated on: {new Date().toLocaleString()}
        </p>
      </div>

      {reportType === 'results' && reportData.results && (
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
              {reportData.members.map((m, idx) => (
                <tr key={m.id}>
                  <td>{idx + 1}</td>
                  <td style={{ fontWeight: 'bold', color: 'var(--primary-neon)' }}>{m.chest_number}</td>
                  <td style={{ fontWeight: 600 }}>{m.name}</td>
                  <td>{m.team_name}</td>
                  <td><span className="tag tag-primary">{m.category_name}</span></td>
                  <td>
                    {m.programs && m.programs.length > 0 
                      ? m.programs.map(p => p.name).join(', ')
                      : <span style={{ color: 'var(--text-muted)' }}>None</span>}
                  </td>
                </tr>
              ))}
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
    </div>
  );
}
