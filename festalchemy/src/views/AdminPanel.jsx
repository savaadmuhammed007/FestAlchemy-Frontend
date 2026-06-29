import React, { useState, useEffect, useContext } from 'react';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { UIContext } from '../App';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  RefreshCw, Settings, Layers, Calendar, Users, 
  Play, CheckSquare, PlusCircle, Trash, Edit, 
  Save, FileText, CheckCircle, Award, UserCheck, 
  Sliders, ClipboardList, Clock, Search, Filter, Shield,
  Printer, UserPlus, Image
} from 'lucide-react';
import Modal from '../components/Modal';
import DashboardOverview from '../components/DashboardOverview';
import ProgramsSetup from '../components/ProgramsSetup';
import MembersDirectory from '../components/MembersDirectory';
import JudgeAssignments from '../components/JudgeAssignments';
import GradeSettings from '../components/GradeSettings';
import SpinLotMachine from '../components/SpinLotMachine';
import MarksheetsStatus from '../components/MarksheetsStatus';
import ScoringResults from '../components/ScoringResults';
import SchedulePlanner from '../components/SchedulePlanner';
import ReportSelector from '../components/ReportSelector';
import ReportViewer from '../components/ReportViewer';
import SettingsConfig from '../components/SettingsConfig';
import MemberRegistry from '../components/MemberRegistry';
import PosterTemplateEditor from '../components/PosterTemplateEditor';

export default function AdminPanel() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast, confirm } = useContext(UIContext);
  const alert = (msg, type = 'info') => showToast(msg, type);
  
  // Dashboard stats
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  
  // Tabs Navigation
  const [activeTab, setActiveTab] = useState('dashboard');
  const [settingsSubTab, setSettingsSubTab] = useState('general');

  
  // Core lists
  const [categories, setCategories] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [teams, setTeams] = useState([]);
  const [judges, setJudges] = useState([]);
  const [members, setMembers] = useState([]); // All members directory
  const [stages, setStages] = useState([]);
  const [stageName, setStageName] = useState('');
  
  // Modals & Active Edit Items
  const [modalType, setModalType] = useState(''); 
  const [activeItem, setActiveItem] = useState(null);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Setup Specifics
  const [gradeRules, setGradeRules] = useState([]);
  const [selectedProgramGrades, setSelectedProgramGrades] = useState(null);
  const [selectedProgramJudges, setSelectedProgramJudges] = useState(null);
  const [selectedProgramSchedule, setSelectedProgramSchedule] = useState(null);
  const [selectedProgramMarksheets, setSelectedProgramMarksheets] = useState(null);
  const [marksheetData, setMarksheetData] = useState([]);
  const [marksheetsLoading, setMarksheetsLoading] = useState(false);

  // Lot spinning variables
  const [callingProgramId, setCallingProgramId] = useState('');
  const [callingData, setCallingData] = useState(null);
  const [callingLoading, setCallingLoading] = useState(false);

  // Results computation variables
  const [resultsProgramId, setResultsProgramId] = useState('');
  const [computedResults, setComputedResults] = useState([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [publishStatus, setPublishStatus] = useState(false);

  // Reports variables
  const [reportType, setReportType] = useState('dashboard');
  const [reportFilterProgram, setReportFilterProgram] = useState('');
  const [reportFilterTeam, setReportFilterTeam] = useState('');
  const [reportFilterCategory, setReportFilterCategory] = useState('');
  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportSelectionMode, setReportSelectionMode] = useState('single'); // 'single' or 'multiple'
  const [reportSelectedPrograms, setReportSelectedPrograms] = useState([]);
  const [programSearchQuery, setProgramSearchQuery] = useState('');

  // Filters for Members Directory
  const [memberSearch, setMemberSearch] = useState('');
  const [memberFilterTeam, setMemberFilterTeam] = useState('');
  const [memberFilterCategory, setMemberFilterCategory] = useState('');

  // URL to tab synchronizer
  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/admin/reports')) {
      setActiveTab('reports');
      const sub = path.replace('/admin/reports', '').replace(/^\//, '');
      if (sub) {
        setReportType(sub);
      } else {
        setReportType('dashboard');
      }
      setReportData(null);
      setReportFilterProgram('');
      setReportFilterTeam('');
      setReportFilterCategory('');
      setReportSelectedPrograms([]);
      setProgramSearchQuery('');
      setReportSelectionMode('single');
    } else if (path.startsWith('/admin/settings')) {
      setActiveTab('settings');
      const sub = path.replace('/admin/settings', '').replace(/^\//, '');
      if (sub === 'users') {
        setSettingsSubTab('users');
      } else {
        setSettingsSubTab('general');
      }
    } else if (path === '/admin/setup') {
      setActiveTab('setup');
    } else if (path === '/admin/stages') {
      setActiveTab('stages');
    } else if (path === '/admin/teams') {
      navigate('/admin/settings/users', { replace: true });
    } else if (path === '/admin/members') {
      setActiveTab('members');
    } else if (path === '/admin/registry') {
      setActiveTab('registry');
    } else if (path === '/admin/assignments') {
      setActiveTab('assignments');
    } else if (path === '/admin/grades') {
      setActiveTab('grades');
    } else if (path === '/admin/calling') {
      setActiveTab('calling');
    } else if (path === '/admin/marksheets') {
      setActiveTab('marksheets');
    } else if (path === '/admin/rankings') {
      setActiveTab('rankings');
    } else if (path === '/admin/schedule-planner') {
      setActiveTab('schedule-planner');
    } else if (path === '/admin/poster') {
      setActiveTab('poster');
    } else {
      setActiveTab('dashboard');
    }
  }, [location.pathname]);



  // Forms fields
  const [catName, setCatName] = useState('');
  const [catPrefix, setCatPrefix] = useState('');
  const [progName, setProgName] = useState('');
  const [progCategory, setProgCategory] = useState('');
  const [progType, setProgType] = useState('single');
  const [progStage, setProgStage] = useState('onstage');
  const [progDuration, setProgDuration] = useState(5);
  const [progLimit, setProgLimit] = useState(1);
  const [progWeight1, setProgWeight1] = useState(1);
  const [progWeight2, setProgWeight2] = useState(1);
  const [progWeight3, setProgWeight3] = useState(1);
  const [progMaxMarks, setProgMaxMarks] = useState(100);
  const [progVenue, setProgVenue] = useState('');
  const [progSchedule, setProgSchedule] = useState('');
  const [progJudges, setProgJudges] = useState([]);
  const [progGroupSize, setProgGroupSize] = useState(1);

  const [teamName, setTeamName] = useState('');
  const [teamLeadUser, setTeamLeadUser] = useState('');
  const [teamLeadPass, setTeamLeadPass] = useState('');
  const [teamLeadFirst, setTeamLeadFirst] = useState('');
  const [teamLeadLast, setTeamLeadLast] = useState('');

  const [judgeUser, setJudgeUser] = useState('');
  const [judgePass, setJudgePass] = useState('');
  const [judgeFirst, setJudgeFirst] = useState('');
  const [judgeLast, setJudgeLast] = useState('');
  const [judgePrograms, setJudgePrograms] = useState([]);
  const [judgeSearchQuery, setJudgeSearchQuery] = useState('');

  // Grade settings form
  const [newGradeName, setNewGradeName] = useState('');
  const [newGradeMinMarks, setNewGradeMinMarks] = useState('');
  const [newGradePoints, setNewGradePoints] = useState(0);

  // Result manual edit states
  const [resTotalMarks, setResTotalMarks] = useState('');
  const [resRank, setResRank] = useState('');
  const [resPoints, setResPoints] = useState('');
  const [resGrade, setResGrade] = useState('');

  // Fest Settings
  const [festSettings, setFestSettings] = useState(null);
  const [point1st, setPoint1st] = useState(5);
  const [point2nd, setPoint2nd] = useState(3);
  const [point3rd, setPoint3rd] = useState(1);
  const [festName, setFestName] = useState('FestAlchemy');
  const [festYear, setFestYear] = useState(2026);
  const [festTagline, setFestTagline] = useState('');

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/stats/`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setStats(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setStatsLoading(false);
    }
  };

  const loadFestSettings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/fest-settings/`);
      if (res.ok) {
        const json = await res.json();
        if (json.length > 0) {
          const settings = json[0];
          setFestSettings(settings);
          setFestName(settings.fest_name);
          setFestYear(settings.year);
          setFestTagline(settings.tagline || '');
          const ps = settings.point_system;
          if (ps) {
            setPoint1st(ps['1st'] || 5);
            setPoint2nd(ps['2nd'] || 3);
            setPoint3rd(ps['3rd'] || 1);
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadSetupData = async () => {
    try {
      const catsRes = await fetch(`${API_BASE_URL}/api/v1/categories/`);
      if (catsRes.ok) setCategories(await catsRes.json());

      const progsRes = await fetch(`${API_BASE_URL}/api/v1/programs/`);
      if (progsRes.ok) setPrograms(await progsRes.json());

      const teamsRes = await fetch(`${API_BASE_URL}/api/v1/teams/`);
      if (teamsRes.ok) setTeams(await teamsRes.json());

      const judgesRes = await fetch(`${API_BASE_URL}/api/v1/users/?role=judge`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      if (judgesRes.ok) setJudges(await judgesRes.json());

      const membersRes = await fetch(`${API_BASE_URL}/api/v1/members/`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      if (membersRes.ok) setMembers(await membersRes.json());

      const stagesRes = await fetch(`${API_BASE_URL}/api/v1/stages/`);
      if (stagesRes.ok) setStages(await stagesRes.json());

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStats();
    loadFestSettings();
    loadSetupData();
  }, [activeTab]);

  // Handle Save Fest Settings
  const handleSaveFestSettings = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        fest_name: festName,
        year: parseInt(festYear),
        tagline: festTagline,
        point_system: { '1st': parseInt(point1st), '2nd': parseInt(point2nd), '3rd': parseInt(point3rd) }
      };

      let url = `${API_BASE_URL}/api/v1/fest-settings/`;
      let method = 'POST';

      if (festSettings) {
        url = `${API_BASE_URL}/api/v1/fest-settings/${festSettings.id}/`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const json = await res.json();
        setFestSettings(json);
        alert("Fest settings saved successfully!");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save settings.");
    }
  };

  // Grade settings
  const handleOpenGrades = async (prog) => {
    setSelectedProgramGrades(prog);
    setNewGradeName('');
    setNewGradeMinMarks('');
    setNewGradePoints(0);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/programs/${prog.id}/grade_settings/`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setGradeRules(json);
        openModal('grade-rules');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddGradeRule = async (e) => {
    e.preventDefault();
    if (!newGradeName || newGradeMinMarks === '') return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/programs/${selectedProgramGrades.id}/grade_settings/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          grade_name: newGradeName,
          min_marks: parseFloat(newGradeMinMarks),
          points: parseInt(newGradePoints)
        })
      });
      const json = await res.json();
      if (res.ok) {
        setGradeRules(prev => [...prev.filter(r => r.grade_name !== newGradeName), json].sort((a,b) => b.min_marks - a.min_marks));
        setNewGradeName('');
        setNewGradeMinMarks('');
        setNewGradePoints(0);
      } else {
        alert(json.error || "Failed to add grade rule");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteGradeRule = async (ruleId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/programs/${selectedProgramGrades.id}/delete_grade_setting/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rule_id: ruleId })
      });
      if (res.ok) {
        setGradeRules(prev => prev.filter(r => r.id !== ruleId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Judge Assignment
  const handleOpenJudgeAssignment = (prog) => {
    setSelectedProgramJudges(prog);
    setJudgePrograms(prog.judges || []);
    openModal('judge-assignment');
  };

  const handleSaveJudgeAssignment = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/programs/${selectedProgramJudges.id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ judges: judgePrograms })
      });
      if (res.ok) {
        alert("Judges assigned successfully!");
        loadSetupData();
        setModalType('');
      } else {
        alert("Failed to assign judges.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Schedule
  const handleOpenScheduleEdit = (prog) => {
    setSelectedProgramSchedule(prog);
    setProgVenue(prog.venue || '');
    setProgSchedule(prog.schedule ? new Date(prog.schedule).toISOString().slice(0, 16) : '');
    openModal('edit-schedule');
  };

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/programs/${selectedProgramSchedule.id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          venue: progVenue,
          schedule: progSchedule ? new Date(progSchedule).toISOString() : null
        })
      });
      if (res.ok) {
        alert("Schedule updated successfully!");
        loadSetupData();
        setModalType('');
      } else {
        alert("Failed to update schedule.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Marksheets
  const handleOpenMarksheets = async (prog) => {
    setSelectedProgramMarksheets(prog);
    setMarksheetsLoading(true);
    openModal('view-marksheets');
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/marksheets/?program=${prog.id}`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setMarksheetData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setMarksheetsLoading(false);
    }
  };

  // Lot spinning
  const fetchCallingList = async (progId) => {
    if (!progId) {
      setCallingData(null);
      return;
    }
    setCallingLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/calling/${progId}/`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setCallingData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCallingLoading(false);
    }
  };

  const handleCallMember = async (memberId) => {
    const res = await fetch(`${API_BASE_URL}/api/calling/${callingProgramId}/`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ member_id: memberId })
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to spin lot");
    return json;
  };

  const handleRespinLot = async () => {
    const confirmed = await confirm("Reset Program Lots", "Are you sure? This clears all evaluation sheets and computed scores for this program!");
    if (!confirmed) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/calling/${callingProgramId}/respin/`, {
        method: 'POST',
        headers: { 'Authorization': `Token ${token}` }
      });
      if (res.ok) {
        alert("Lot codes and evaluations reset.", "success");
        fetchCallingList(callingProgramId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Ranks & Scores
  const handleFetchResults = async (progId) => {
    if (!progId) {
      setComputedResults([]);
      return;
    }
    setResultsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/results/?program=${progId}`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setComputedResults(json);
        if (json.length > 0) {
          setPublishStatus(json[0].published);
        } else {
          setPublishStatus(false);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setResultsLoading(false);
    }
  };

  const handleComputeResults = async () => {
    if (!resultsProgramId) return;
    setResultsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/results/compute/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ program_id: parseInt(resultsProgramId) })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to compute results");
      
      alert("Results computed successfully!");
      setComputedResults(json.data);
      if (json.data.length > 0) {
        setPublishStatus(json.data[0].published);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setResultsLoading(false);
    }
  };

  const handleTogglePublish = async (programId = null) => {
    const targetProgramId = (programId && typeof programId !== 'object') ? programId : resultsProgramId;
    if (!targetProgramId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/results/toggle_publish/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ program_id: parseInt(targetProgramId) })
      });
      const json = await res.json();
      if (res.ok) {
        alert(json.message);
        loadSetupData();
        if (targetProgramId.toString() === resultsProgramId.toString()) {
          setPublishStatus(json.published);
          setComputedResults(prev => prev.map(r => ({ ...r, published: json.published })));
        }
      } else {
        alert(json.error || "Failed to toggle publish status.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Reports
  const handleFetchReport = async () => {
    if (reportType === 'dashboard') {
      setReportData(null);
      return;
    }
    if (reportType === 'results' && reportSelectionMode === 'multiple' && reportSelectedPrograms.length === 0) {
      alert("Please select at least one program.");
      return;
    }
    setReportLoading(true);
    try {
      let url = `${API_BASE_URL}/api/reports/?type=${reportType}`;
      if (reportType === 'results') {
        if (reportSelectionMode === 'multiple') {
          url += `&program=${reportSelectedPrograms.join(',')}`;
        } else if (reportFilterProgram) {
          url += `&program=${reportFilterProgram}`;
        }
      }
      if (reportType === 'members') {
        if (reportFilterTeam) url += `&team=${reportFilterTeam}`;
        if (reportFilterCategory) url += `&category=${reportFilterCategory}`;
      }
      if (reportType === 'marksheets' && reportFilterProgram) {
        url += `&program=${reportFilterProgram}`;
      }

      const res = await fetch(url, {
        headers: { 'Authorization': `Token ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setReportData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReportLoading(false);
    }
  };

  // Setup submissions
  const openModal = (type, item = null) => {
    setModalType(type);
    setActiveItem(item);
    setFormError('');
    setFormSuccess('');
    setJudgeSearchQuery('');

    if (type === 'add-category') {
      setCatName('');
      setCatPrefix('');
    } else if (type === 'edit-category' && item) {
      setCatName(item.name);
      setCatPrefix(item.chest_prefix);
    } else if (type === 'add-stage') {
      setStageName('');
    } else if (type === 'edit-stage' && item) {
      setStageName(item.name);
    } else if (type === 'add-program') {
      setProgName('');
      setProgCategory('');
      setProgType('single');
      setProgGroupSize(1);
      setProgStage('onstage');
      setProgDuration(5);
      setProgLimit(1);
      setProgWeight1(1);
      setProgWeight2(1);
      setProgWeight3(1);
      setProgMaxMarks(100);
      setProgVenue('');
      setProgSchedule('');
      setProgJudges([]);
    } else if (type === 'edit-program' && item) {
      setProgName(item.name);
      setProgCategory(item.category);
      setProgType(item.type);
      setProgGroupSize(item.group_size || 1);
      setProgStage(item.stage_type);
      setProgDuration(item.duration);
      setProgLimit(item.participant_limit);
      setProgWeight1(item.point_weightage_1st);
      setProgWeight2(item.point_weightage_2nd);
      setProgWeight3(item.point_weightage_3rd);
      setProgMaxMarks(item.max_marks);
      setProgVenue(item.venue || '');
      setProgSchedule(item.schedule ? new Date(item.schedule).toISOString().slice(0, 16) : '');
      setProgJudges(item.judges || []);
    } else if (type === 'add-team') {
      setTeamName('');
      setTeamLeadUser('');
      setTeamLeadPass('');
      setTeamLeadFirst('');
      setTeamLeadLast('');
    } else if (type === 'edit-team' && item) {
      setTeamName(item.name || '');
      setTeamLeadUser(item.teamlead_username || '');
      setTeamLeadPass('');
      setTeamLeadFirst('');
      setTeamLeadLast('');
      if (item.teamlead) {
        fetch(`${API_BASE_URL}/api/v1/users/${item.teamlead}/`, {
          headers: { 'Authorization': `Token ${token}` }
        })
          .then(res => res.json())
          .then(data => {
            setTeamLeadFirst(data.first_name || '');
            setTeamLeadLast(data.last_name || '');
            setTeamLeadUser(data.username || '');
          })
          .catch(err => console.error("Error fetching team lead user:", err));
      }
    } else if (type === 'add-judge') {
      setJudgeUser('');
      setJudgePass('');
      setJudgeFirst('');
      setJudgeLast('');
      setJudgePrograms([]);
    } else if (type === 'edit-judge' && item) {
      setJudgeUser(item.username || '');
      setJudgePass('');
      setJudgeFirst(item.first_name || '');
      setJudgeLast(item.last_name || '');
      const assigned = programs.filter(p => p.judges && p.judges.includes(item.id)).map(p => p.id);
      setJudgePrograms(assigned);
    } else if (type === 'edit-result' && item) {
      setResTotalMarks(item.total_marks !== undefined ? item.total_marks.toString() : '');
      setResRank(item.rank !== undefined && item.rank !== null ? item.rank.toString() : '');
      setResPoints(item.points !== undefined ? item.points.toString() : '');
      setResGrade(item.grade || '');
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!catName || !catPrefix) return;
    try {
      const payload = { name: catName, chest_prefix: parseInt(catPrefix) };
      let url = `${API_BASE_URL}/api/v1/categories/`;
      let method = 'POST';

      if (modalType === 'edit-category' && activeItem) {
        url = `${API_BASE_URL}/api/v1/categories/${activeItem.id}/`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setFormSuccess("Category saved successfully!");
        loadSetupData();
        setTimeout(() => setModalType(''), 1000);
      } else {
        const err = await res.json();
        setFormError(JSON.stringify(err));
      }
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleProgramSubmit = async (e) => {
    e.preventDefault();
    if (!progName || !progCategory) return;
    try {
      const payload = {
        name: progName,
        category: parseInt(progCategory),
        type: progType,
        group_size: progType === 'group' ? parseInt(progGroupSize) : 1,
        stage_type: progStage,
        duration: parseInt(progDuration),
        participant_limit: parseInt(progLimit),
        point_weightage_1st: parseInt(progWeight1),
        point_weightage_2nd: parseInt(progWeight2),
        point_weightage_3rd: parseInt(progWeight3),
        max_marks: parseInt(progMaxMarks),
        venue: progVenue,
        schedule: progSchedule ? new Date(progSchedule).toISOString() : null,
        judges: progJudges
      };

      let url = `${API_BASE_URL}/api/v1/programs/`;
      let method = 'POST';

      if (modalType === 'edit-program' && activeItem) {
        url = `${API_BASE_URL}/api/v1/programs/${activeItem.id}/`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setFormSuccess("Program saved successfully!");
        loadSetupData();
        setTimeout(() => setModalType(''), 1000);
      } else {
        const err = await res.json();
        setFormError(JSON.stringify(err));
      }
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleTeamSubmit = async (e) => {
    e.preventDefault();
    if (modalType === 'edit-team') {
      if (!teamName || !teamLeadUser) {
        setFormError("Team name and team lead username are required.");
        return;
      }
      try {
        const teamRes = await fetch(`${API_BASE_URL}/api/v1/teams/${activeItem.id}/`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name: teamName })
        });
        if (!teamRes.ok) {
          const err = await teamRes.json();
          setFormError(err.error || JSON.stringify(err));
          return;
        }

        if (activeItem.teamlead) {
          const userPayload = {
            username: teamLeadUser,
            first_name: teamLeadFirst,
            last_name: teamLeadLast
          };
          if (teamLeadPass) {
            userPayload.password = teamLeadPass;
          }
          const userRes = await fetch(`${API_BASE_URL}/api/v1/users/${activeItem.teamlead}/edit_user/`, {
            method: 'POST',
            headers: {
              'Authorization': `Token ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(userPayload)
          });
          if (!userRes.ok) {
            const err = await userRes.json();
            setFormError(err.error || JSON.stringify(err));
            return;
          }
        }

        setFormSuccess("Team and Lead updated successfully!");
        loadSetupData();
        setTimeout(() => setModalType(''), 1000);
      } catch (err) {
        setFormError(err.message);
      }
    } else {
      if (!teamName || !teamLeadUser || !teamLeadPass) {
        setFormError("All fields including password are required for registration.");
        return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/teams/register_team_lead/`, {
          method: 'POST',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            team_name: teamName,
            username: teamLeadUser,
            password: teamLeadPass,
            first_name: teamLeadFirst,
            last_name: teamLeadLast
          })
        });

        if (res.ok) {
          setFormSuccess("Team and Lead registered successfully!");
          loadSetupData();
          setTimeout(() => setModalType(''), 1000);
        } else {
          const err = await res.json();
          setFormError(err.error || JSON.stringify(err));
        }
      } catch (err) {
        setFormError(err.message);
      }
    }
  };

  const handleJudgeSubmit = async (e) => {
    e.preventDefault();
    if (modalType === 'edit-judge') {
      if (!judgeUser) {
        setFormError("Username is required.");
        return;
      }
      try {
        const payload = {
          username: judgeUser,
          first_name: judgeFirst,
          last_name: judgeLast,
          assigned_programs: judgePrograms
        };
        if (judgePass) {
          payload.password = judgePass;
        }

        const res = await fetch(`${API_BASE_URL}/api/v1/users/${activeItem.id}/edit_user/`, {
          method: 'POST',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          setFormSuccess("Judge account updated successfully!");
          loadSetupData();
          setTimeout(() => setModalType(''), 1000);
        } else {
          const err = await res.json();
          setFormError(err.error || JSON.stringify(err));
        }
      } catch (err) {
        setFormError(err.message);
      }
    } else {
      if (!judgeUser || !judgePass) {
        setFormError("Username and password are required for new judges.");
        return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/users/add_judge/`, {
          method: 'POST',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: judgeUser,
            password: judgePass,
            first_name: judgeFirst,
            last_name: judgeLast,
            assigned_programs: judgePrograms
          })
        });

        if (res.ok) {
          setFormSuccess("Judge account created successfully!");
          loadSetupData();
          setTimeout(() => setModalType(''), 1000);
        } else {
          const err = await res.json();
          setFormError(err.error || JSON.stringify(err));
        }
      } catch (err) {
        setFormError(err.message);
      }
    }
  };

  const handleResultSubmit = async (e) => {
    e.preventDefault();
    if (!activeItem) return;
    try {
      const payload = {
        total_marks: parseFloat(resTotalMarks)
      };

      const res = await fetch(`${API_BASE_URL}/api/v1/results/${activeItem.id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setFormSuccess("Result updated successfully!");
        handleFetchResults(resultsProgramId);
        setTimeout(() => setModalType(''), 1000);
      } else {
        const err = await res.json();
        setFormError(err.error || JSON.stringify(err));
      }
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleStageSubmit = async (e) => {
    e.preventDefault();
    if (!stageName.trim()) return;
    try {
      const payload = { name: stageName.trim() };
      let url = `${API_BASE_URL}/api/v1/stages/`;
      let method = 'POST';

      if (modalType === 'edit-stage' && activeItem) {
        url = `${API_BASE_URL}/api/v1/stages/${activeItem.id}/`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setFormSuccess("Stage saved successfully!");
        const stagesRes = await fetch(`${API_BASE_URL}/api/v1/stages/`);
        if (stagesRes.ok) setStages(await stagesRes.json());
        setStageName('');
        setTimeout(() => setModalType(''), 1000);
      } else {
        const err = await res.json();
        setFormError(JSON.stringify(err));
      }
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleDeleteItem = async (type, id) => {
    const confirmed = await confirm("Delete Item", "Are you sure you want to delete this item? This action is permanent.");
    if (!confirmed) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/${type}/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${token}` }
      });
      if (res.ok) {
        showToast("Item deleted successfully.", "success");
        loadSetupData();
        if (type === 'results') {
          handleFetchResults(resultsProgramId);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered members list
  const filteredMembers = members.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(memberSearch.toLowerCase()) || 
                          (m.chest_no && m.chest_no.toString().includes(memberSearch));
    const matchesTeam = memberFilterTeam ? m.team === parseInt(memberFilterTeam) : true;
    const matchesCat = memberFilterCategory ? m.category === parseInt(memberFilterCategory) : true;
    return matchesSearch && matchesTeam && matchesCat;
  });

  return (
    <div className="admin-layout">
      
      {/* ────────────────────────────────────────────────────────
          ADMIN SIDEBAR NAVIGATION
      ──────────────────────────────────────────────────────── */}
      <aside className="glass-panel admin-sidebar">
        <div style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>Admin Control</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>FESTALCHEMY SYSTEM</span>
        </div>
        
        <button onClick={() => navigate('/admin')} className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`} style={{ justifyContent: 'flex-start', width: '100%', padding: '0.6rem 1rem', fontSize: '0.9rem' }}>
          <Shield size={16} /> Overview
        </button>
        
        <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--text-muted)', margin: '0.75rem 0 0.25rem 0.5rem', letterSpacing: '0.05em' }}>SETUP & REGISTRY</div>
        
        <button onClick={() => navigate('/admin/setup')} className={`btn ${activeTab === 'setup' ? 'btn-primary' : 'btn-secondary'}`} style={{ justifyContent: 'flex-start', width: '100%', padding: '0.6rem 1rem', fontSize: '0.9rem' }}>
          <Calendar size={16} /> Programs & Categories
        </button>
        <button onClick={() => navigate('/admin/stages')} className={`btn ${activeTab === 'stages' ? 'btn-primary' : 'btn-secondary'}`} style={{ justifyContent: 'flex-start', width: '100%', padding: '0.6rem 1rem', fontSize: '0.9rem' }}>
          <Layers size={16} /> Manage Stages
        </button>
        <button onClick={() => navigate('/admin/settings/users')} className={`btn ${activeTab === 'settings' && settingsSubTab === 'users' ? 'btn-primary' : 'btn-secondary'}`} style={{ justifyContent: 'flex-start', width: '100%', padding: '0.6rem 1rem', fontSize: '0.9rem' }}>
          <Users size={16} /> Teams & Users
        </button>
        <button onClick={() => navigate('/admin/members')} className={`btn ${activeTab === 'members' ? 'btn-primary' : 'btn-secondary'}`} style={{ justifyContent: 'flex-start', width: '100%', padding: '0.6rem 1rem', fontSize: '0.9rem' }}>
          <Users size={16} /> Members Directory
        </button>
        <button onClick={() => navigate('/admin/registry')} className={`btn ${activeTab === 'registry' ? 'btn-primary' : 'btn-secondary'}`} style={{ justifyContent: 'flex-start', width: '100%', padding: '0.6rem 1rem', fontSize: '0.9rem' }}>
          <UserPlus size={16} /> Member Registry
        </button>
        <button onClick={() => navigate('/admin/assignments')} className={`btn ${activeTab === 'assignments' ? 'btn-primary' : 'btn-secondary'}`} style={{ justifyContent: 'flex-start', width: '100%', padding: '0.6rem 1rem', fontSize: '0.9rem' }}>
          <UserCheck size={16} /> Judge Assignment
        </button>

        <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--text-muted)', margin: '0.75rem 0 0.25rem 0.5rem', letterSpacing: '0.05em' }}>LIVE OPERATIONS</div>
        
        <button onClick={() => navigate('/admin/calling')} className={`btn ${activeTab === 'calling' ? 'btn-primary' : 'btn-secondary'}`} style={{ justifyContent: 'flex-start', width: '100%', padding: '0.6rem 1rem', fontSize: '0.9rem' }}>
          <Play size={16} /> Spin Lot
        </button>
        <button onClick={() => navigate('/admin/marksheets')} className={`btn ${activeTab === 'marksheets' ? 'btn-primary' : 'btn-secondary'}`} style={{ justifyContent: 'flex-start', width: '100%', padding: '0.6rem 1rem', fontSize: '0.9rem' }}>
          <ClipboardList size={16} /> Marksheets
        </button>
        <button onClick={() => navigate('/admin/rankings')} className={`btn ${activeTab === 'rankings' ? 'btn-primary' : 'btn-secondary'}`} style={{ justifyContent: 'flex-start', width: '100%', padding: '0.6rem 1rem', fontSize: '0.9rem' }}>
          <Award size={16} /> Scoring & Results
        </button>
        <button onClick={() => navigate('/admin/schedule-planner')} className={`btn ${activeTab === 'schedule-planner' ? 'btn-primary' : 'btn-secondary'}`} style={{ justifyContent: 'flex-start', width: '100%', padding: '0.6rem 1rem', fontSize: '0.9rem' }}>
          <Clock size={16} /> Schedule Planner
        </button>

        <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--text-muted)', margin: '0.75rem 0 0.25rem 0.5rem', letterSpacing: '0.05em' }}>SYSTEM & REPORTS</div>
        
        <button onClick={() => navigate('/admin/reports')} className={`btn ${activeTab === 'reports' ? 'btn-primary' : 'btn-secondary'}`} style={{ justifyContent: 'flex-start', width: '100%', padding: '0.6rem 1rem', fontSize: '0.9rem' }}>
          <FileText size={16} /> Reports Center
        </button>
        <button onClick={() => navigate('/admin/poster')} className={`btn ${activeTab === 'poster' ? 'btn-primary' : 'btn-secondary'}`} style={{ justifyContent: 'flex-start', width: '100%', padding: '0.6rem 1rem', fontSize: '0.9rem' }}>
          <Image size={16} /> Poster Template
        </button>
        <button onClick={() => navigate('/admin/settings')} className={`btn ${activeTab === 'settings' && settingsSubTab === 'general' ? 'btn-primary' : 'btn-secondary'}`} style={{ justifyContent: 'flex-start', width: '100%', padding: '0.6rem 1rem', fontSize: '0.9rem' }}>
          <Settings size={16} /> Fest Settings
        </button>

      </aside>

      {/* ────────────────────────────────────────────────────────
          MAIN CONTENT AREA
      ──────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, minWidth: '320px' }}>
        
        {/* OVERVIEW TAB */}
        {activeTab === 'dashboard' && (
          <DashboardOverview
            statsLoading={statsLoading}
            stats={stats}
            onNavigate={navigate}
          />
        )}

        {/* SETUP TAB */}
        {activeTab === 'setup' && (
          <ProgramsSetup
            categories={categories}
            programs={programs}
            onOpenModal={openModal}
            onDelete={handleDeleteItem}
          />
        )}

        {/* STAGES TAB */}
        {activeTab === 'stages' && (
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--text-primary)' }}>Manage Stages / Venues</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Configure the venues and stages available for scheduling events.</p>
              </div>
              <button onClick={() => openModal('add-stage')} className="btn btn-primary">
                <PlusCircle size={16} /> Add Stage
              </button>
            </div>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Stage/Venue Name</th>
                    <th style={{ width: '120px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stages.map(stg => (
                    <tr key={stg.id}>
                      <td style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{stg.id}</td>
                      <td style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{stg.name}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          <button onClick={() => openModal('edit-stage', stg)} className="btn btn-secondary" style={{ padding: '0.4rem' }}>
                            <Edit size={14} />
                          </button>
                          <button onClick={() => handleDeleteItem('stages', stg.id)} className="btn btn-danger" style={{ padding: '0.4rem' }}>
                            <Trash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {stages.length === 0 && (
                    <tr>
                      <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                        No stages configured yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}



        {/* MEMBERS TAB */}
        {activeTab === 'members' && (
          <MembersDirectory
            filteredMembers={filteredMembers}
            memberSearch={memberSearch}
            setMemberSearch={setMemberSearch}
            memberFilterTeam={memberFilterTeam}
            setMemberFilterTeam={setMemberFilterTeam}
            memberFilterCategory={memberFilterCategory}
            setMemberFilterCategory={setMemberFilterCategory}
            teams={teams}
            categories={categories}
            onDelete={handleDeleteItem}
          />
        )}

        {/* REGISTRY TAB */}
        {activeTab === 'registry' && (
          <MemberRegistry
            members={members}
            teams={teams}
            categories={categories}
            programs={programs}
            token={token}
            onRefreshData={loadSetupData}
          />
        )}

        {/* ASSIGNMENTS TAB */}
        {activeTab === 'assignments' && (
          <JudgeAssignments
            programs={programs}
            onOpenJudgeAssignment={handleOpenJudgeAssignment}
          />
        )}



        {/* CALLING TAB */}
        {activeTab === 'calling' && (
          <div>
            <SpinLotMachine
              programs={programs}
              callingProgramId={callingProgramId}
              setCallingProgramId={setCallingProgramId}
              onFetchCallingList={fetchCallingList}
              callingData={callingData}
              setCallingData={setCallingData}
              callingLoading={callingLoading}
              onCallMember={handleCallMember}
              onRespinLot={handleRespinLot}
            />
          </div>
        )}

        {/* MARKSHEETS TAB */}
        {activeTab === 'marksheets' && (
          <MarksheetsStatus
            programs={programs}
            onOpenMarksheets={handleOpenMarksheets}
          />
        )}

        {/* RANKINGS TAB */}
        {activeTab === 'rankings' && (
          <ScoringResults
            programs={programs}
            resultsProgramId={resultsProgramId}
            setResultsProgramId={setResultsProgramId}
            onFetchResults={handleFetchResults}
            onComputeResults={handleComputeResults}
            resultsLoading={resultsLoading}
            computedResults={computedResults}
            publishStatus={publishStatus}
            onTogglePublish={handleTogglePublish}
            onDeleteResult={handleDeleteItem}
            onOpenModal={openModal}
            teams={teams}
            token={token}
          />
        )}

        {/* SCHEDULE PLANNER TAB */}
        {activeTab === 'schedule-planner' && (
          <SchedulePlanner
            programs={programs}
            onOpenScheduleEdit={handleOpenScheduleEdit}
          />
        )}

        {/* REPORTS TAB */}
        {activeTab === 'reports' && (
          <div>
            {reportType === 'dashboard' ? (
              <ReportSelector onNavigate={navigate} />
            ) : (
              <div>
                <button 
                  onClick={() => navigate('/admin/reports')} 
                  className="btn btn-secondary no-print" 
                  style={{ marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  &larr; Back to Reports Center
                </button>

                <div className="glass-panel no-print" style={{ marginBottom: '2rem' }}>
                  <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {reportType === 'results' && <Award size={18} style={{ color: 'var(--primary-neon)' }} />}
                    {reportType === 'members' && <Users size={18} style={{ color: 'var(--primary-neon)' }} />}
                    {reportType === 'marksheets' && <ClipboardList size={18} style={{ color: 'var(--primary-neon)' }} />}
                    {reportType === 'teampoints' && <FileText size={18} style={{ color: 'var(--primary-neon)' }} />}
                    {reportType === 'results' ? 'Event Results Configurator' : 
                     reportType === 'members' ? 'Registered Members Directory Configurator' : 
                     reportType === 'marksheets' ? 'Marksheets Entry Log Configurator' : 
                     reportType === 'teampoints' ? 'Overall Team Standings Configurator' : 'Report Configurator'}
                  </h3>

                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '1rem',
                    alignItems: 'flex-start'
                  }}>
                    {reportType === 'results' && (
                      <div style={{ width: '100%' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                          <button
                            type="button"
                            onClick={() => setReportSelectionMode('single')}
                            className={`btn ${reportSelectionMode === 'single' ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ fontSize: '0.8rem', padding: '0.35rem 0.95rem', borderRadius: 'var(--radius-full)' }}
                          >
                            Single Event
                          </button>
                          <button
                            type="button"
                            onClick={() => setReportSelectionMode('multiple')}
                            className={`btn ${reportSelectionMode === 'multiple' ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ fontSize: '0.8rem', padding: '0.35rem 0.95rem', borderRadius: 'var(--radius-full)' }}
                          >
                            Multiple Events
                          </button>
                        </div>

                        {reportSelectionMode === 'single' ? (
                          <div className="form-group" style={{ minWidth: '220px', maxWidth: '350px', marginBottom: 0 }}>
                            <label className="form-label">Choose Program</label>
                            <select className="form-control" value={reportFilterProgram} onChange={e => setReportFilterProgram(e.target.value)}>
                              <option value="">Select Event (All)...</option>
                              {programs.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <div style={{ width: '100%', maxWidth: '500px', marginTop: '0.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                              <label className="form-label" style={{ margin: 0 }}>Select Programs</label>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                  type="button"
                                  onClick={() => setReportSelectedPrograms(programs.map(p => p.id))}
                                  className="btn btn-secondary"
                                  style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem' }}
                                >
                                  Select All
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setReportSelectedPrograms([])}
                                  className="btn btn-secondary"
                                  style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem' }}
                                >
                                  Clear
                                </button>
                              </div>
                            </div>

                            <input
                              type="text"
                              className="form-control"
                              placeholder="Search programs to select..."
                              value={programSearchQuery}
                              onChange={e => setProgramSearchQuery(e.target.value)}
                              style={{ fontSize: '0.85rem', marginBottom: '0.5rem', height: '36px' }}
                            />

                            <div style={{
                              maxHeight: '180px',
                              overflowY: 'auto',
                              border: '1px solid var(--border-glass)',
                              borderRadius: '8px',
                              padding: '0.5rem',
                              background: 'var(--bg-glass)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.25rem'
                            }}>
                              {programs.filter(p => p.name.toLowerCase().includes(programSearchQuery.toLowerCase())).map(p => {
                                const isChecked = reportSelectedPrograms.includes(p.id);
                                return (
                                  <label
                                    key={p.id}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.5rem',
                                      padding: '0.35rem 0.5rem',
                                      cursor: 'pointer',
                                      borderRadius: '4px',
                                      transition: 'background 0.2s',
                                      background: isChecked ? 'rgba(255,255,255,0.04)' : 'transparent',
                                      margin: 0
                                    }}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={e => {
                                        if (e.target.checked) {
                                          setReportSelectedPrograms([...reportSelectedPrograms, p.id]);
                                        } else {
                                          setReportSelectedPrograms(reportSelectedPrograms.filter(id => id !== p.id));
                                        }
                                      }}
                                      style={{ cursor: 'pointer' }}
                                    />
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{p.name}</span>
                                    <span className="tag tag-primary" style={{ fontSize: '0.65rem', marginLeft: 'auto' }}>
                                      {p.category_name}
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {reportType === 'marksheets' && (
                      <div className="form-group" style={{ minWidth: '220px', marginBottom: 0 }}>
                        <label className="form-label">Choose Program</label>
                        <select className="form-control" value={reportFilterProgram} onChange={e => setReportFilterProgram(e.target.value)}>
                          <option value="">Select Event...</option>
                          {programs.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {reportType === 'members' && (
                      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', width: '100%' }}>
                        <div className="form-group" style={{ minWidth: '200px', flex: 1, marginBottom: 0 }}>
                          <label className="form-label">Filter Team</label>
                          <select className="form-control" value={reportFilterTeam} onChange={e => setReportFilterTeam(e.target.value)}>
                            <option value="">All Teams</option>
                            {teams.map(t => (
                              <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group" style={{ minWidth: '200px', flex: 1, marginBottom: 0 }}>
                          <label className="form-label">Filter Category</label>
                          <select className="form-control" value={reportFilterCategory} onChange={e => setReportFilterCategory(e.target.value)}>
                            <option value="">All Categories</option>
                            {categories.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    <button onClick={handleFetchReport} className="btn btn-primary" style={{ padding: '0.7rem 1.5rem', height: '42px', marginTop: '0.5rem' }}>
                      Generate Report
                    </button>
                  </div>
                </div>

                {reportLoading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                    <RefreshCw className="spinning" size={30} style={{ color: 'var(--primary-neon)' }} />
                  </div>
                ) : (
                  <ReportViewer reportType={reportType} reportData={reportData} />
                )}
              </div>
            )}
          </div>
        )}



        {/* FEST SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div style={{ maxWidth: settingsSubTab === 'general' ? '720px' : '100%', margin: '0 auto' }}>
            {/* Tab selector menu */}
            <div className="no-print" style={{ 
              display: 'flex', 
              gap: '0.5rem', 
              marginBottom: '2rem', 
              borderBottom: '1px solid var(--border-glass)', 
              paddingBottom: '0.75rem' 
            }}>
              <button 
                onClick={() => navigate('/admin/settings')} 
                className={`btn ${settingsSubTab === 'general' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}
              >
                <Settings size={16} /> General Settings
              </button>
              <button 
                onClick={() => navigate('/admin/settings/users')} 
                className={`btn ${settingsSubTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}
              >
                <Users size={16} /> User & Access
              </button>
            </div>

            <SettingsConfig
              settingsSubTab={settingsSubTab}
              festName={festName}
              setFestName={setFestName}
              festYear={festYear}
              setFestYear={setFestYear}
              festTagline={festTagline}
              setFestTagline={setFestTagline}
              point1st={point1st}
              setPoint1st={setPoint1st}
              point2nd={point2nd}
              setPoint2nd={setPoint2nd}
              point3rd={point3rd}
              setPoint3rd={setPoint3rd}
              onSaveFestSettings={handleSaveFestSettings}
              teams={teams}
              judges={judges}
              onOpenModal={openModal}
              onDeleteItem={handleDeleteItem}
            />
          </div>
        )}

        {/* POSTER TEMPLATE TAB */}
        {activeTab === 'poster' && (
          <PosterTemplateEditor token={token} />
        )}


      </div>

      {/* ────────────────────────────────────────────────────────
          MODALS / OVERLAY POPUPS
      ──────────────────────────────────────────────────────── */}
      <Modal
        isOpen={!!modalType}
        onClose={() => setModalType('')}
        title={modalType.replace('-', ' ')}
      >
        {formError && (
          <div style={{ background: 'var(--danger-soft)', border: '1px solid rgba(239, 68, 68, 0.25)', padding: '0.7rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', color: 'var(--danger)', fontSize: '0.875rem' }}>
            {formError}
          </div>
        )}

        {formSuccess && (
          <div style={{ background: 'var(--success-soft)', border: '1px solid rgba(34, 197, 94, 0.25)', padding: '0.7rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', color: 'var(--success)', fontSize: '0.875rem' }}>
            {formSuccess}
          </div>
        )}

        {/* Category Form */}
        {(modalType === 'add-category' || modalType === 'edit-category') && (
          <form onSubmit={handleCategorySubmit}>
            <div className="form-group">
              <label className="form-label">Category Name</label>
              <input type="text" className="form-control" placeholder="e.g. Sub-Junior" value={catName} onChange={e => setCatName(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Chest Prefix Number</label>
              <input type="number" className="form-control" placeholder="e.g. 100" value={catPrefix} onChange={e => setCatPrefix(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Save Category</button>
          </form>
        )}

        {/* Program Form */}
        {(modalType === 'add-program' || modalType === 'edit-program') && (
          <form onSubmit={handleProgramSubmit}>
            <div className="form-group">
              <label className="form-label">Event Name</label>
              <input type="text" className="form-control" placeholder="e.g. Oppana" value={progName} onChange={e => setProgName(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-control" value={progCategory} onChange={e => setProgCategory(e.target.value)}>
                <option value="">Choose category...</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="grid-cols-2">
              <div className="form-group">
                <label className="form-label">Category Type</label>
                <select className="form-control" value={progType} onChange={e => setProgType(e.target.value)}>
                  <option value="single">Individual</option>
                  <option value="group">Group</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Stage Type</label>
                <select className="form-control" value={progStage} onChange={e => setProgStage(e.target.value)}>
                  <option value="onstage">On Stage</option>
                  <option value="offstage">Offstage</option>
                </select>
              </div>
            </div>
            {progType === 'group' && (
              <div className="form-group">
                <label className="form-label">Group Size</label>
                <input 
                  type="number" 
                  min="1" 
                  className="form-control" 
                  placeholder="Number of members in group" 
                  value={progGroupSize} 
                  onChange={e => setProgGroupSize(e.target.value)} 
                />
              </div>
            )}
            <div className="grid-cols-3">
              <div className="form-group">
                <label className="form-label">Duration (Mins)</label>
                <input type="number" className="form-control" value={progDuration} onChange={e => setProgDuration(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Limit Per Team</label>
                <input type="number" className="form-control" value={progLimit} onChange={e => setProgLimit(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Max Marks</label>
                <input type="number" className="form-control" value={progMaxMarks} onChange={e => setProgMaxMarks(e.target.value)} />
              </div>
            </div>
            <div className="grid-cols-3">
              <div className="form-group">
                <label className="form-label">Weight 1st</label>
                <input type="number" className="form-control" value={progWeight1} onChange={e => setProgWeight1(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Weight 2nd</label>
                <input type="number" className="form-control" value={progWeight2} onChange={e => setProgWeight2(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Weight 3rd</label>
                <input type="number" className="form-control" value={progWeight3} onChange={e => setProgWeight3(e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Venue / Stage</label>
              <select 
                className="form-control" 
                value={progVenue} 
                onChange={e => setProgVenue(e.target.value)}
              >
                <option value="">-- Select Stage --</option>
                {stages.map(stg => (
                  <option key={stg.id} value={stg.name}>{stg.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Schedule Time</label>
              <input type="datetime-local" className="form-control" value={progSchedule} onChange={e => setProgSchedule(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Assign Judges</label>
              <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Search judges..." 
                  value={judgeSearchQuery} 
                  onChange={e => setJudgeSearchQuery(e.target.value)}
                  style={{ paddingLeft: '2rem', height: '34px', fontSize: '0.85rem' }}
                />
              </div>
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '0.5rem', 
                maxHeight: '150px',
                overflowY: 'auto',
                padding: '0.5rem',
                border: '1px solid var(--border-glass)',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.02)'
              }}>
                {judges
                  .filter(j => {
                    const fullName = `${j.first_name} ${j.last_name}`.toLowerCase();
                    return fullName.includes(judgeSearchQuery.toLowerCase()) || j.username.toLowerCase().includes(judgeSearchQuery.toLowerCase());
                  })
                  .map(j => {
                    const isSelected = progJudges.includes(j.id);
                    const initials = `${j.first_name?.[0] || ''}${j.last_name?.[0] || j.username?.[0] || ''}`.toUpperCase();
                    return (
                      <div
                        key={j.id}
                        onClick={() => {
                          if (isSelected) {
                            setProgJudges(prev => prev.filter(id => id !== j.id));
                          } else {
                            setProgJudges(prev => [...prev, j.id]);
                          }
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.4rem 0.75rem',
                          borderRadius: '16px',
                          border: isSelected ? '1px solid var(--primary-neon)' : '1px solid var(--border-glass)',
                          background: isSelected ? 'rgba(156, 39, 176, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                          color: isSelected ? 'var(--primary-neon)' : 'var(--text-primary)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          boxShadow: isSelected ? '0 0 6px rgba(156, 39, 176, 0.25)' : 'none',
                          userSelect: 'none',
                          fontSize: '0.85rem'
                        }}
                        className="glass-panel-hover"
                      >
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: isSelected ? 'var(--primary-neon)' : 'rgba(255, 255, 255, 0.1)',
                          color: isSelected ? '#fff' : 'var(--text-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.65rem',
                          fontWeight: 'bold'
                        }}>
                          {initials}
                        </div>
                        <span>{j.first_name} {j.last_name}</span>
                      </div>
                    );
                  })}
                {judges.length === 0 && (
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No judges registered.</span>
                )}
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Save Program</button>
          </form>
        )}

        {/* Team Form */}
        {(modalType === 'add-team' || modalType === 'edit-team') && (
          <form onSubmit={handleTeamSubmit}>
            <div className="form-group">
              <label className="form-label">Team Name</label>
              <input type="text" className="form-control" placeholder="e.g. Red Dragons" value={teamName} onChange={e => setTeamName(e.target.value)} />
            </div>
            <h4 style={{ margin: '1rem 0', fontFamily: 'var(--font-display)' }}>
              {modalType === 'edit-team' ? 'Edit Team Lead User' : 'Register Team Lead User'}
            </h4>
            <div className="form-group">
              <label className="form-label">Lead Username</label>
              <input type="text" className="form-control" value={teamLeadUser} onChange={e => setTeamLeadUser(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Lead Password {modalType === 'edit-team' && '(Leave blank to keep unchanged)'}</label>
              <input type="password" className="form-control" value={teamLeadPass} onChange={e => setTeamLeadPass(e.target.value)} placeholder={modalType === 'edit-team' ? '••••••••' : ''} />
            </div>
            <div className="grid-cols-2">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input type="text" className="form-control" value={teamLeadFirst} onChange={e => setTeamLeadFirst(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input type="text" className="form-control" value={teamLeadLast} onChange={e => setTeamLeadLast(e.target.value)} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
              {modalType === 'edit-team' ? 'Save Team Details' : 'Register Team'}
            </button>
          </form>
        )}

        {/* Judge Form */}
        {(modalType === 'add-judge' || modalType === 'edit-judge') && (
          <form onSubmit={handleJudgeSubmit}>
            <div className="form-group">
              <label className="form-label">Judge Username</label>
              <input type="text" className="form-control" placeholder="e.g. judge1" value={judgeUser} onChange={e => setJudgeUser(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Judge Password {modalType === 'edit-judge' && '(Leave blank to keep unchanged)'}</label>
              <input type="password" className="form-control" value={judgePass} onChange={e => setJudgePass(e.target.value)} placeholder={modalType === 'edit-judge' ? '••••••••' : ''} />
            </div>
            <div className="grid-cols-2">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input type="text" className="form-control" value={judgeFirst} onChange={e => setJudgeFirst(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input type="text" className="form-control" value={judgeLast} onChange={e => setJudgeLast(e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Assign Programs</label>
              <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Search programs..." 
                  value={judgeSearchQuery} 
                  onChange={e => setJudgeSearchQuery(e.target.value)}
                  style={{ paddingLeft: '2rem', height: '34px', fontSize: '0.85rem' }}
                />
              </div>
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '0.5rem', 
                maxHeight: '150px',
                overflowY: 'auto',
                padding: '0.5rem',
                border: '1px solid var(--border-glass)',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.02)'
              }}>
                {programs
                  .filter(p => {
                    const searchStr = `${p.name} ${p.category_name}`.toLowerCase();
                    return searchStr.includes(judgeSearchQuery.toLowerCase());
                  })
                  .map(p => {
                    const isSelected = judgePrograms.includes(p.id);
                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          if (isSelected) {
                            setJudgePrograms(prev => prev.filter(id => id !== p.id));
                          } else {
                            setJudgePrograms(prev => [...prev, p.id]);
                          }
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          padding: '0.4rem 0.75rem',
                          borderRadius: '16px',
                          border: isSelected ? '1px solid var(--primary-neon)' : '1px solid var(--border-glass)',
                          background: isSelected ? 'rgba(156, 39, 176, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                          color: isSelected ? 'var(--primary-neon)' : 'var(--text-primary)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          boxShadow: isSelected ? '0 0 6px rgba(156, 39, 176, 0.25)' : 'none',
                          userSelect: 'none',
                          fontSize: '0.85rem'
                        }}
                        className="glass-panel-hover"
                      >
                        <span className="tag tag-primary" style={{ fontSize: '0.6rem', padding: '0.1rem 0.3rem' }}>{p.category_name}</span>
                        <span>{p.name}</span>
                      </div>
                    );
                  })}
                {programs.length === 0 && (
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No programs registered.</span>
                )}
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
              {modalType === 'edit-judge' ? 'Save Judge Details' : 'Add Judge'}
            </button>
          </form>
        )}

        {/* Judge Assignment Form */}
        {modalType === 'judge-assignment' && selectedProgramJudges && (
          <form onSubmit={handleSaveJudgeAssignment}>
            <div style={{ marginBottom: '1.5rem' }}>
              <p>Assign judges for event: <strong>{selectedProgramJudges.name}</strong></p>
            </div>
            <div className="form-group">
              <label className="form-label">Select Judges</label>
              <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Search judges..." 
                  value={judgeSearchQuery} 
                  onChange={e => setJudgeSearchQuery(e.target.value)}
                  style={{ paddingLeft: '2rem', height: '34px', fontSize: '0.85rem' }}
                />
              </div>
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '0.5rem', 
                maxHeight: '150px',
                overflowY: 'auto',
                padding: '0.5rem',
                border: '1px solid var(--border-glass)',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.02)'
              }}>
                {judges
                  .filter(j => {
                    const fullName = `${j.first_name} ${j.last_name}`.toLowerCase();
                    return fullName.includes(judgeSearchQuery.toLowerCase()) || j.username.toLowerCase().includes(judgeSearchQuery.toLowerCase());
                  })
                  .map(j => {
                    const isSelected = judgePrograms.includes(j.id);
                    const initials = `${j.first_name?.[0] || ''}${j.last_name?.[0] || j.username?.[0] || ''}`.toUpperCase();
                    return (
                      <div
                        key={j.id}
                        onClick={() => {
                          if (isSelected) {
                            setJudgePrograms(prev => prev.filter(id => id !== j.id));
                          } else {
                            setJudgePrograms(prev => [...prev, j.id]);
                          }
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.4rem 0.75rem',
                          borderRadius: '16px',
                          border: isSelected ? '1px solid var(--primary-neon)' : '1px solid var(--border-glass)',
                          background: isSelected ? 'rgba(156, 39, 176, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                          color: isSelected ? 'var(--primary-neon)' : 'var(--text-primary)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          boxShadow: isSelected ? '0 0 6px rgba(156, 39, 176, 0.25)' : 'none',
                          userSelect: 'none',
                          fontSize: '0.85rem'
                        }}
                        className="glass-panel-hover"
                      >
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: isSelected ? 'var(--primary-neon)' : 'rgba(255, 255, 255, 0.1)',
                          color: isSelected ? '#fff' : 'var(--text-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.65rem',
                          fontWeight: 'bold'
                        }}>
                          {initials}
                        </div>
                        <span>{j.first_name} {j.last_name}</span>
                      </div>
                    );
                  })}
                {judges.length === 0 && (
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No judges registered.</span>
                )}
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Save Assignments</button>
          </form>
        )}

        {/* Grade Rules Config Form */}
        {modalType === 'grade-rules' && selectedProgramGrades && (
          <div>
            <div style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <p>Event: <strong>{selectedProgramGrades.name}</strong></p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Max Marks: {selectedProgramGrades.max_marks}</p>
            </div>

            <h4 style={{ marginBottom: '0.75rem', fontFamily: 'var(--font-display)' }}>Current Rules</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem', maxHeight: '180px', overflowY: 'auto' }}>
              {gradeRules.map(rule => (
                <div key={rule.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                  <span>Grade: <strong>{rule.grade_name}</strong> (Marks &gt;= {rule.min_marks}) &rarr; <strong>{rule.points} pts</strong></span>
                  <button onClick={() => handleDeleteGradeRule(rule.id)} className="btn btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                    <Trash size={12} />
                  </button>
                </div>
              ))}
              {gradeRules.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No grading rules yet. Results will fallback to standard rank-based points.</p>}
            </div>

            <h4 style={{ marginBottom: '0.75rem', fontFamily: 'var(--font-display)' }}>Add Grading Rule</h4>
            <form onSubmit={handleAddGradeRule}>
              <div className="grid-cols-3">
                <div className="form-group">
                  <label className="form-label">Grade (e.g. A)</label>
                  <input type="text" className="form-control" value={newGradeName} onChange={e => setNewGradeName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Min Marks</label>
                  <input type="number" step="0.1" className="form-control" value={newGradeMinMarks} onChange={e => setNewGradeMinMarks(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Points</label>
                  <input type="number" className="form-control" value={newGradePoints} onChange={e => setNewGradePoints(e.target.value)} required />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>Add Rule</button>
            </form>
          </div>
        )}

        {/* Schedule Edit Form */}
        {modalType === 'edit-schedule' && selectedProgramSchedule && (
          <form onSubmit={handleSaveSchedule}>
            <div style={{ marginBottom: '1.5rem' }}>
              <p>Edit Venue & Schedule for: <strong>{selectedProgramSchedule.name}</strong></p>
            </div>
            <div className="form-group">
              <label className="form-label">Venue Location</label>
              <select 
                className="form-control" 
                value={progVenue} 
                onChange={e => setProgVenue(e.target.value)}
              >
                <option value="">-- Select Stage --</option>
                {stages.map(stg => (
                  <option key={stg.id} value={stg.name}>{stg.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date & Time</label>
              <input type="datetime-local" className="form-control" value={progSchedule} onChange={e => setProgSchedule(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Save Schedule</button>
          </form>
        )}

        {/* View Marksheets Form */}
        {modalType === 'view-marksheets' && selectedProgramMarksheets && (
          <div>
            <div style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <p>Event: <strong>{selectedProgramMarksheets.name}</strong></p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total assigned marksheets for judges.</p>
            </div>
            
            {marksheetsLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                <RefreshCw className="spinning" size={24} style={{ color: 'var(--primary-neon)' }} />
              </div>
            ) : (
              (() => {
                // Group marksheets by judge_code
                const groupedByCode = {};
                marksheetData.forEach(sheet => {
                  const code = sheet.judge_code;
                  if (!groupedByCode[code]) {
                    groupedByCode[code] = {
                      judge_code: code,
                      sheets: []
                    };
                  }
                  groupedByCode[code].sheets.push(sheet);
                });
                const groupedList = Object.values(groupedByCode);

                return (
                  <div className="table-container" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                    <table className="custom-table" style={{ fontSize: '0.9rem' }}>
                      <thead>
                        <tr>
                          <th style={{ width: '150px' }}>Participant Code</th>
                          <th>Evaluations (Judge: Score & Status)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupedList.map(group => (
                          <tr key={group.judge_code}>
                            <td style={{ fontWeight: 'bold', fontSize: '1rem', color: 'var(--primary-neon)' }}>
                              {group.judge_code}
                            </td>
                            <td>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                                {group.sheets.map(s => (
                                  <div 
                                    key={s.id} 
                                    style={{ 
                                      display: 'inline-flex', 
                                      alignItems: 'center', 
                                      gap: '0.4rem', 
                                      background: 'var(--bg-overlay)', 
                                      padding: '0.3rem 0.65rem', 
                                      borderRadius: '6px', 
                                      border: '1px solid var(--border)' 
                                    }}
                                  >
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{s.judge_username}:</span>
                                    <strong style={{ color: 'var(--secondary-neon)', fontSize: '0.85rem' }}>{s.score}</strong>
                                    <span className={`tag ${s.submitted ? 'tag-success' : 'tag-warning'}`} style={{ fontSize: '0.6rem', padding: '0.05rem 0.3rem' }}>
                                      {s.submitted ? 'Submitted' : 'Draft'}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                        {groupedList.length === 0 && (
                          <tr>
                            <td colSpan="2" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem' }}>
                              No marksheets generated yet. Spin Lot to call participants.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                );
              })()
            )}
          </div>
        )}
        {/* Edit Result Form */}
        {modalType === 'edit-result' && activeItem && (
          <form onSubmit={handleResultSubmit}>
            <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem' }}>
              <p>Participant: <strong>{activeItem.member_name}</strong> ({activeItem.member_chest_no})</p>
              <p>Team: <strong>{activeItem.team_name}</strong></p>
            </div>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Total Marks / Avg Score</label>
              <input 
                type="number" 
                step="0.01" 
                className="form-control" 
                value={resTotalMarks} 
                onChange={e => setResTotalMarks(e.target.value)} 
                required 
              />
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                💡 Note: Rank, Grade, and Points for all participants in this event will be automatically recalculated based on the new marks when you save.
              </p>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
              Save & Recalculate Rankings
            </button>
          </form>
        )}
        {/* Add/Edit Stage Form */}
        {(modalType === 'add-stage' || modalType === 'edit-stage') && (
          <form onSubmit={handleStageSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3>{modalType === 'add-stage' ? 'Add Stage/Venue' : 'Edit Stage/Venue'}</h3>
            </div>
            <div className="form-group">
              <label className="form-label">Stage Name / Venue Location</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="e.g. Stage 1 (Auditorium)" 
                value={stageName} 
                onChange={e => setStageName(e.target.value)} 
                required 
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
              {modalType === 'add-stage' ? 'Create Stage' : 'Save Changes'}
            </button>
          </form>
        )}
      </Modal>

    </div>
  );
}
