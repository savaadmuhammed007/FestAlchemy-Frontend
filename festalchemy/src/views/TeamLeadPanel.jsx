import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { RefreshCw, UserPlus } from 'lucide-react';
import TeamLeadMembersDashboard from '../components/TeamLeadMembersDashboard';
import TeamLeadAddMemberForm from '../components/TeamLeadAddMemberForm';
import TeamLeadAssignEventsForm from '../components/TeamLeadAssignEventsForm';

export default function TeamLeadPanel() {
  const { token, user } = useAuth();
  
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [availablePrograms, setAvailablePrograms] = useState([]);
  
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
      // Fetch members
      const membersRes = await fetch(`${API_BASE_URL}/api/v1/members/`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      if (!membersRes.ok) throw new Error("Failed to load team members");
      const membersJson = await membersRes.json();
      setMembers(membersJson);

      // Fetch categories
      const catsRes = await fetch(`${API_BASE_URL}/api/v1/categories/`, {
        headers: { 'Authorization': `Token ${token}` }
      });
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
        throw new Error(json.error || "Failed to add member");
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
        throw new Error(json.error || "Failed to update programs");
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
        {currentView === 'dashboard' && (
          <button onClick={handleOpenAddMember} className="btn btn-primary">
            <UserPlus size={18} /> Add New Member
          </button>
        )}
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

    </div>
  );
}
