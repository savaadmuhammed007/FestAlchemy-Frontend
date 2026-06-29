import React from 'react';
import { Printer } from 'lucide-react';

export default function ReportViewer({ reportType, reportData }) {
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
        marginBottom: '1.5rem'
      }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Report generated successfully. Ready to print.
        </span>
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
           reportType === 'teampoints' ? 'Overall Team Standings' : ''}
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
                justifyContent: 'space-between',
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
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontStyle: 'italic', margin: '0.5rem 0 0 0' }}>
                  No results published yet for this program.
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
                <th>Chest No</th>
                <th>Member Name</th>
                <th>Team</th>
                <th>Category</th>
                <th>Events Count</th>
              </tr>
            </thead>
            <tbody>
              {reportData.members.map(m => (
                <tr key={m.id}>
                  <td style={{ fontWeight: 'bold' }}>{m.chest_no}</td>
                  <td style={{ fontWeight: 600 }}>{m.name}</td>
                  <td>{m.team_name}</td>
                  <td>{m.category_name}</td>
                  <td>{m.registered_programs_details.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {reportType === 'marksheets' && reportData.sheets && (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Judge Code</th>
                <th>Judge Name</th>
                <th>Marks Card</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {reportData.sheets.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 'bold' }}>CODE: {s.judge_code}</td>
                  <td>{s.judge_username}</td>
                  <td style={{ fontWeight: 'bold' }}>{s.score}</td>
                  <td>
                    <span className={`tag ${s.submitted ? 'tag-success' : 'tag-warning'}`}>
                      {s.submitted ? 'Submitted' : 'Draft'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {reportType === 'teampoints' && reportData.teampoints && (
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
              {reportData.teampoints.map((t, idx) => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 'bold' }}>#{idx + 1}</td>
                  <td style={{ fontWeight: 600 }}>{t.team_name}</td>
                  <td style={{ fontWeight: 'bold', color: 'var(--secondary-neon)' }}>{t.total_points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
