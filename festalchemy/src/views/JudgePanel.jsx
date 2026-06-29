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

  const fetchAssignedPrograms = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/programs/?judge_only=true`, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      if (!res.ok) throw new Error("Failed to load assigned programs");
      const json = await res.json();
      setPrograms(json);

      const mRes = await fetch(`${API_BASE_URL}/api/v1/marksheets/`, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      if (mRes.ok) {
        const mJson = await mRes.json();
        setAllMarksheets(mJson);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedPrograms();
  }, []);

  const fetchProgramEvaluations = async (program, isCompleted = false) => {
    setEvalLoading(true);
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
      setEvalLoading(false);
    }
  };

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
        onBack={() => {
          setSelectedProgram(null);
          setIsViewingCompleted(false);
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
      onSelectProgram={fetchProgramEvaluations}
    />
  );
}
