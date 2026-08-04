import React, { useState } from 'react';
import { Medal } from 'lucide-react';

export default function TopPerformersSection({ individualLeaderboard }) {
  const [activeCatId, setActiveCatId] = useState(null);

  if (!individualLeaderboard || individualLeaderboard.length === 0) {
    return (
      <div className="empty-state" style={{ padding: '2rem', textAlign: 'center' }}>
        <Medal size={32} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
        <p style={{ color: 'var(--text-secondary)' }}>No individual points recorded yet.</p>
      </div>
    );
  }

  const ALL = 'all';
  const currentCatId = activeCatId ?? ALL;

  let performers;
  if (currentCatId === ALL) {
    const merged = [];
    individualLeaderboard.forEach(cat => {
      cat.performers.forEach(p => {
        merged.push({ ...p, category_name: cat.category_name });
      });
    });
    performers = merged.sort((a, b) => b.total_points - a.total_points).slice(0, 30);
  } else {
    const currentCat = individualLeaderboard.find(c => c.category_id === currentCatId) || individualLeaderboard[0];
    performers = (currentCat?.performers || []).map(p => ({
      ...p,
      category_name: currentCat?.category_name,
    }));
  }

  const rankColors = ['var(--gold)', 'var(--silver)', 'var(--bronze)'];

  return (
    <div>
      {/* Category Tab Buttons */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveCatId(ALL)}
          className={`btn ${currentCatId === ALL ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.85rem', padding: '0.45rem 1.1rem', borderRadius: 'var(--radius-full)' }}
        >
          All Categories
        </button>
        {individualLeaderboard.map(cat => (
          <button
            key={cat.category_id}
            onClick={() => setActiveCatId(cat.category_id)}
            className={`btn ${currentCatId === cat.category_id ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.85rem', padding: '0.45rem 1.1rem', borderRadius: 'var(--radius-full)' }}
          >
            {cat.category_name}
          </button>
        ))}
      </div>

      {/* Performers Table */}
      {performers.length === 0 ? (
        <div className="empty-state" style={{ padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No participants recorded for this category yet.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: '55px' }}>#</th>
                <th>Participant</th>
                <th className="desktop-only">Programs & Breakdown</th>
                <th style={{ width: '90px', textAlign: 'right' }}>Total Points</th>
              </tr>
            </thead>
            <tbody>
              {performers.map((item, idx) => {
                const rank = idx + 1;
                const isTop3 = rank <= 3;
                const color = isTop3 ? rankColors[rank - 1] : 'var(--text-muted)';

                return (
                  <tr key={item.member_id}>
                    <td>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: '0.8rem',
                        background: isTop3 ? `color-mix(in srgb, ${color} 15%, transparent)` : 'var(--bg-hover)',
                        color: color,
                        border: `2px solid ${isTop3 ? color : 'var(--border)'}`,
                      }}>
                        {rank}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>{item.member_name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{item.team_name}</span>
                        {currentCatId === ALL && item.category_name && (
                          <span className="tag tag-info" style={{ fontSize: '0.6rem', padding: '0.05rem 0.35rem' }}>
                            {item.category_name}
                          </span>
                        )}
                      </div>

                      {/* Mobile-only Program Breakdown */}
                      <div className="mobile-only" style={{ display: 'none', flexWrap: 'wrap', gap: '0.2rem', marginTop: '0.35rem' }}>
                        {(item.program_breakdown || []).map(pb => (
                          <span
                            key={pb.program_id}
                            title={`${pb.program_name}: ${pb.points} pts (Rank #${pb.rank})`}
                            className="tag tag-primary"
                            style={{ fontSize: '0.6rem', padding: '0.05rem 0.3rem' }}
                          >
                            {pb.program_name}: {pb.points}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="desktop-only">
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                        {(item.program_breakdown || []).map(pb => (
                          <span
                            key={pb.program_id}
                            title={`${pb.program_name}: ${pb.points} pts (Rank #${pb.rank})`}
                            className="tag tag-primary"
                            style={{ fontSize: '0.68rem', padding: '0.12rem 0.45rem' }}
                          >
                            {pb.program_name}: {pb.points} pts (#{pb.rank})
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span style={{
                        fontSize: '1.15rem', fontWeight: 800,
                        color: isTop3 ? color : 'var(--success)',
                      }}>
                        {item.total_points}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
