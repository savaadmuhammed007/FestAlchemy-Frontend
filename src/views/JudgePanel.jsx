import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { RefreshCw } from 'lucide-react';
import JudgeProgramList from '../components/JudgeProgramList';
import JudgeMarksheetList from '../components/JudgeMarksheetList';
import JudgeEvaluationForm from '../components/JudgeEvaluationForm';

export default function JudgePanel() {
  const { token } = useAuth();
  const [programs, setPrograms] = useState([]);
  const [allMarksheets, setAllMarksheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  
  // Evaluation List variables
  const [marksheets, setMarksheets] = useState([]);
  const [evalLoading, setEvalLoading] = useState(false);
  const [isViewingCompleted, setIsViewingCompleted] = useState(false);
  
  // Evaluate detail view variables
  const [activeMarksheet, setActiveMarksheet] = useState(null);
  const [score, setScore] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  const handleSync = async (programId = null) => {
    setIsSyncing(true);
    setSyncMessage('');
    try {
      const payload = programId ? { program: programId } : {};
      const res = await fetch(`${API_BASE_URL}/api/v1/marksheets/sync/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        setSyncMessage(data.message || 'Synchronized successfully!');
      }
      // Re-fetch programs and marksheets
      await fetchAssignedPrograms(true);
      if (selectedProgram) {
        await fetchProgramEvaluations(selectedProgram, isViewingCompleted, true);
      }
    } catch (err) {
      console.error("Sync error:", err);
      await fetchAssignedPrograms(true);
      if (selectedProgram) {
        await fetchProgramEvaluations(selectedProgram, isViewingCompleted, true);
      }
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncMessage(''), 4000);
    }
  };

  const fetchAssignedPrograms = async (silent = false) => {
    if (!silent) {
      if (programs.length === 0) setLoading(true);
      else setIsRefreshing(true);
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/programs/?judge_only=true`, {
        headers: { 'Authorization': `Token ${token}` }
      });

      if (res.ok) {
        const json = await res.json();
        setPrograms(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAssignedPrograms();
    // Auto-poll every 8s for real-time updates when lot is spun on stage
    const interval = setInterval(() => {
      if (!selectedProgram && !activeMarksheet) {
        fetchAssignedPrograms(true);
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [selectedProgram, activeMarksheet]);

  const fetchProgramEvaluations = async (program, isCompleted = false, silent = false) => {
    if (!silent) setEvalLoading(true);
    setSelectedProgram(program);
    setIsViewingCompleted(isCompleted);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/marksheets/?program=${program.id}`, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      if (!res.ok) throw new Error("Failed to load evaluations");
      const json = await res.json();
      setMarksheets(json);
      setAllMarksheets(prev => {
        const ids = new Set(json.map(m => m.id));
        return [...prev.filter(m => !ids.has(m.id)), ...json];
      });
    } catch (err) {
      console.error(err);
    } finally {
      if (!silent) setEvalLoading(false);
    }
  };

  // Auto-poll marksheets every 6s when inside a program's evaluation list
  useEffect(() => {
    if (!selectedProgram || activeMarksheet) return;
    const interval = setInterval(() => {
      fetchProgramEvaluations(selectedProgram, isViewingCompleted, true);
    }, 6000);
    return () => clearInterval(interval);
  }, [selectedProgram, isViewingCompleted, activeMarksheet]);

  // Instant refresh when judge refocuses tab or switches back to this browser window
  useEffect(() => {
    const onFocusOrVisible = () => {
      if (document.visibilityState === 'visible') {
        if (selectedProgram && !activeMarksheet) {
          fetchProgramEvaluations(selectedProgram, isViewingCompleted, true);
        } else if (!selectedProgram && !activeMarksheet) {
          fetchAssignedPrograms(true);
        }
      }
    };

    document.addEventListener('visibilitychange', onFocusOrVisible);
    window.addEventListener('focus', onFocusOrVisible);
    return () => {
      document.removeEventListener('visibilitychange', onFocusOrVisible);
      window.removeEventListener('focus', onFocusOrVisible);
    };
  }, [selectedProgram, isViewingCompleted, activeMarksheet]);

  const handleOpenEvaluate = (sheet) => {
    setActiveMarksheet(sheet);
    setScore(sheet.score || '');
    setSubmitError('');
    setSubmitSuccess('');
  };

  const handleSaveMarksheet = async (isFinalSubmit) => {
    if (score === '') {
      setSubmitError("Score value is required.");
      return;
    }

    const scoreNum = parseFloat(score);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > selectedProgram.max_marks) {
      setSubmitError(`Score must be a number between 0 and ${selectedProgram.max_marks}.`);
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/marksheets/${activeMarksheet.id}/evaluate/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          score: scoreNum,
          submit: isFinalSubmit
        })
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to submit evaluation");
      }

      setSubmitSuccess(isFinalSubmit ? "Evaluation finalized successfully!" : "Draft score saved successfully.");
      
      // Update list
      setMarksheets(prev => prev.map(s => s.id === activeMarksheet.id ? json : s));
      setAllMarksheets(prev => prev.map(s => s.id === activeMarksheet.id ? json : s));
      
      // Return to list after a short delay
      setTimeout(() => {
        setActiveMarksheet(null);
      }, 1500);

    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem' }}>
        <RefreshCw className="spinning" size={40} style={{ color: 'var(--primary-neon)' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading assigned programs...</p>
      </div>
    );
  }

  // View 3: Individual Marksheet evaluation form
  if (activeMarksheet) {
    return (
      <JudgeEvaluationForm
        selectedProgram={selectedProgram}
        activeMarksheet={activeMarksheet}
        score={score}
        setScore={setScore}
        submitError={submitError}
        submitSuccess={submitSuccess}
        submitting={submitting}
        onBack={() => setActiveMarksheet(null)}
        onSave={handleSaveMarksheet}
      />
    );
  }

  // View 2: Marksheet List for selected program
  if (selectedProgram) {
    return (
      <JudgeMarksheetList
        selectedProgram={selectedProgram}
        marksheets={marksheets}
        evalLoading={evalLoading}
        isViewingCompleted={isViewingCompleted}
        onRefresh={() => fetchProgramEvaluations(selectedProgram, isViewingCompleted, false)}
        onSync={handleSync}
        isSyncing={isSyncing}
        syncMessage={syncMessage}
        onBack={() => {
          setSelectedProgram(null);
          setIsViewingCompleted(false);
          fetchAssignedPrograms(true);
        }}
        onOpenEvaluate={handleOpenEvaluate}
      />
    );
  }

  // View 1: List of Assigned Programs
  return (
    <JudgeProgramList
      programs={programs}
      allMarksheets={allMarksheets}
      isRefreshing={isRefreshing}
      onRefresh={() => fetchAssignedPrograms(false)}
      onSync={handleSync}
      isSyncing={isSyncing}
      syncMessage={syncMessage}
      onSelectProgram={fetchProgramEvaluations}
    />
  );
}
