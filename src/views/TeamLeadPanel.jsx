import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { RefreshCw, UserPlus, Calendar, Clock } from 'lucide-react';
import TeamLeadMembersDashboard from '../components/TeamLeadMembersDashboard';
import TeamLeadAddMemberForm from '../components/TeamLeadAddMemberForm';
import TeamLeadAssignEventsForm from '../components/TeamLeadAssignEventsForm';

export default function TeamLeadPanel() {
  const { token, user } = useAuth();
  
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [availablePrograms, setAvailablePrograms] = useState([]);
  const [scheduleData, setScheduleData] = useState([]);
  const [festDates, setFestDates] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  const fetchSchedule = async () => {
    setScheduleLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/reports/?type=schedule`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setScheduleData(json.schedule || []);
        setFestDates(json.fest_dates || []);
      }
    } catch (err) {
      console.error("Failed to load schedule:", err);
    } finally {
      setScheduleLoading(false);
    }
  };
  
  // Navigation states
  const [currentView, setCurrentView] = useState('dashboard'); // dashboard | add-member | assign-programs
  const [selectedMember, setSelectedMember] = useState(null);

  // Form states
  const [memberName, setMemberName] = useState('');
  const [memberCategory, setMemberCategory] = useState('');
  const [selectedPrograms, setSelectedPrograms] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchTeamData = async () => {
    setLoading(true);
    try {
      const [membersRes, catsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/v1/members/`, {
          headers: { 'Authorization': `Token ${token}` }
        }),
        fetch(`${API_BASE_URL}/api/v1/categories/`, {
          headers: { 'Authorization': `Token ${token}` }
        })
      ]);

      if (membersRes.ok) {
        const membersJson = await membersRes.json();
        setMembers(membersJson);
      }
      if (catsRes.ok) {
        const catsJson = await catsRes.json();
        setCategories(catsJson);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamData();
  }, []);

  const handleOpenAddMember = async () => {
    setMemberName('');
    setMemberCategory('');
    setSelectedPrograms([]);
    setErrorMsg('');
    setSuccessMsg('');
    setCurrentView('add-member');
    
    // Fetch program availability
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/members/team_programs_availability/`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setAvailablePrograms(json);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenAssignPrograms = async (member) => {
    setSelectedMember(member);
    setSelectedPrograms(member.registered_programs);
    setErrorMsg('');
    setSuccessMsg('');
    setCurrentView('assign-programs');
    
    // Fetch program availability for this member's category
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/members/team_programs_availability/?category=${member.category}`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setAvailablePrograms(json);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckboxChange = (progId) => {
    setSelectedPrograms(prev => 
      prev.includes(progId) ? prev.filter(id => id !== progId) : [...prev, progId]
    );
  };

  const handleAddMemberSubmit = async (e) => {
    e.preventDefault();
    if (!memberName.trim() || !memberCategory) {
      setErrorMsg("Please fill in name and select category.");
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/members/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: memberName,
          category: parseInt(memberCategory),
          registered_programs: selectedPrograms
        })
      });

      const json = await res.json();

      if (!res.ok) {
        let msg = "Failed to add member";
        if (json.error) {
          msg = json.error;
        } else if (json.detail) {
          msg = json.detail;
        } else if (typeof json === 'object') {
          const firstErr = Object.values(json).flat()[0];
          if (firstErr) msg = typeof firstErr === 'string' ? firstErr : JSON.stringify(firstErr);
        }
        throw new Error(msg);
      }

      setSuccessMsg(`Member added successfully! Chest No: ${json.chest_no}`);
      setMembers(prev => [...prev, json]);
      
      setTimeout(() => {
        setCurrentView('dashboard');
      }, 1500);

    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignProgramsSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/members/${selectedMember.id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          registered_programs: selectedPrograms
        })
      });

      const json = await res.json();

      if (!res.ok) {
        let msg = "Failed to update programs";
        if (json.error) {
          msg = json.error;
        } else if (json.detail) {
          msg = json.detail;
        } else if (typeof json === 'object') {
          const firstErr = Object.values(json).flat()[0];
          if (firstErr) msg = typeof firstErr === 'string' ? firstErr : JSON.stringify(firstErr);
        }
        throw new Error(msg);
      }

      setSuccessMsg("Event registrations updated successfully!");
      setMembers(prev => prev.map(m => m.id === selectedMember.id ? json : m));

      setTimeout(() => {
        setCurrentView('dashboard');
      }, 1500);

    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem' }}>
        <RefreshCw className="spinning" size={40} style={{ color: 'var(--primary-neon)' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading team portal...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Team Header */}
      <div className="glass-panel" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="tag tag-success">Team Lead Portal</span>
          <h2 style={{ marginTop: '0.5rem', fontFamily: 'var(--font-display)', fontSize: '1.8rem' }}>
            Team: {user?.team_name || "Unassigned"}
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Manage your participants and event registrations.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {currentView === 'dashboard' && (
            <>
              <button 
                onClick={() => {
                  fetchSchedule();
                  setCurrentView('schedule');
                }} 
                className="btn btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Calendar size={18} /> Show Schedule
              </button>
              <button onClick={handleOpenAddMember} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserPlus size={18} /> Add New Member
              </button>
            </>
          )}
          {currentView === 'schedule' && (
            <button onClick={() => setCurrentView('dashboard')} className="btn btn-secondary">
              Back to Dashboard
            </button>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="glass-panel" style={{ background: 'rgba(255, 23, 68, 0.1)', borderColor: 'rgba(255, 23, 68, 0.25)', padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1.5rem', color: '#ff1744' }}>
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="glass-panel" style={{ background: 'rgba(0, 230, 118, 0.1)', borderColor: 'rgba(0, 230, 118, 0.25)', padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1.5rem', color: '#00e676' }}>
          {successMsg}
        </div>
      )}

      {/* DASHBOARD VIEW */}
      {currentView === 'dashboard' && (
        <TeamLeadMembersDashboard
          members={members}
          onOpenAssignPrograms={handleOpenAssignPrograms}
        />
      )}

      {/* ADD MEMBER VIEW */}
      {currentView === 'add-member' && (
        <TeamLeadAddMemberForm
          memberName={memberName}
          setMemberName={setMemberName}
          memberCategory={memberCategory}
          setMemberCategory={setMemberCategory}
          categories={categories}
          availablePrograms={availablePrograms}
          selectedPrograms={selectedPrograms}
          onCheckboxChange={handleCheckboxChange}
          onSubmit={handleAddMemberSubmit}
          onBack={() => setCurrentView('dashboard')}
          submitting={submitting}
        />
      )}

      {/* ASSIGN PROGRAMS VIEW */}
      {currentView === 'assign-programs' && (
        <TeamLeadAssignEventsForm
          selectedMember={selectedMember}
          availablePrograms={availablePrograms}
          selectedPrograms={selectedPrograms}
          onCheckboxChange={handleCheckboxChange}
          onSubmit={handleAssignProgramsSubmit}
          onBack={() => setCurrentView('dashboard')}
          submitting={submitting}
        />
      )}

      {/* SCHEDULE VIEW */}
      {currentView === 'schedule' && (
        <div className="glass-panel">
          <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={18} style={{ color: 'var(--primary-neon)' }} /> Event Calendar & Schedule
          </h3>
          
          {scheduleLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
              <RefreshCw className="spinning" size={24} style={{ color: 'var(--primary-neon)' }} />
            </div>
          ) : (() => {
            // Group programs by YYYY-MM-DD
            const grouped = {};
            festDates.forEach((d) => {
              grouped[d] = [];
            });
            const otherScheduled = [];
            const unscheduled = [];
            
            scheduleData.forEach((p) => {
              if (!p.schedule) {
                unscheduled.push(p);
                return;
              }
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

            const hasAnyScheduled = festDates.some(d => (grouped[d] || []).length > 0) || otherScheduled.length > 0;

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {festDates.map((dateStr, idx) => {
                  const list = grouped[dateStr] || [];
                  return (
                    <div key={dateStr}>
                      <h4 style={{ 
                        fontFamily: 'var(--font-display)', 
                        color: 'var(--primary-neon)', 
                        borderBottom: '1px solid var(--border-glass)', 
                        paddingBottom: '0.4rem', 
                        marginBottom: '1rem',
                        fontSize: '1.15rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline'
                      }}>
                        <span>Day {idx + 1}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{dateStr}</span>
                      </h4>
                      {list.length > 0 ? (
                        <div className="table-container">
                          <table className="custom-table">
                            <thead>
                              <tr>
                                <th style={{ width: '60px' }}>Sl No</th>
                                <th>Event Name</th>
                                <th>Category</th>
                                <th>Venue</th>
                                <th>Start Time</th>
                                <th>End Time</th>
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
                                    <td>{p.venue || "—"}</td>
                                    <td style={{ fontWeight: 600 }}>{startTime}</td>
                                    <td style={{ fontWeight: 600, color: 'var(--secondary-neon)' }}>{endTime}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontStyle: 'italic', marginTop: '0.5rem' }}>
                          No programs scheduled on this day yet.
                        </p>
                      )}
                    </div>
                  );
                })}

                {otherScheduled.length > 0 && (
                  <div>
                    <h4 style={{ 
                      fontFamily: 'var(--font-display)', 
                      color: 'var(--accent)', 
                      borderBottom: '1px solid var(--border-glass)', 
                      paddingBottom: '0.4rem', 
                      marginBottom: '1rem',
                      fontSize: '1.15rem'
                    }}>
                      Other Dates
                    </h4>
                    <div className="table-container">
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th style={{ width: '60px' }}>Sl No</th>
                            <th>Event Name</th>
                            <th>Category</th>
                            <th>Venue</th>
                            <th>Start Time</th>
                            <th>End Time</th>
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
                                <td>{p.venue || "—"}</td>
                                <td style={{ fontWeight: 600 }}>{startTime}</td>
                                <td style={{ fontWeight: 600, color: 'var(--secondary-neon)' }}>{endTime}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {unscheduled.length > 0 && (
                  <div>
                    <h4 style={{ 
                      fontFamily: 'var(--font-display)', 
                      color: 'var(--text-secondary)', 
                      borderBottom: '1px solid var(--border-glass)', 
                      paddingBottom: '0.4rem', 
                      marginBottom: '1rem',
                      fontSize: '1.15rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline'
                    }}>
                      <span>All Events / Pending Timetable</span>
                      <span className="tag tag-secondary" style={{ fontSize: '0.75rem' }}>{unscheduled.length} Events</span>
                    </h4>
                    <div className="table-container">
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th style={{ width: '60px' }}>Sl No</th>
                            <th>Event Name</th>
                            <th>Category</th>
                            <th>Type</th>
                            <th>Stage Type</th>
                            <th>Schedule Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {unscheduled.map((p, sIdx) => (
                            <tr key={p.id}>
                              <td>{sIdx + 1}</td>
                              <td style={{ fontWeight: 600 }}>{p.name}</td>
                              <td><span className="tag tag-primary">{p.category_name}</span></td>
                              <td style={{ textTransform: 'capitalize' }}>{p.type}</td>
                              <td style={{ textTransform: 'capitalize' }}>{p.stage_type || 'onstage'}</td>
                              <td><span className="tag tag-secondary">To Be Scheduled</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

    </div>
  );
}
