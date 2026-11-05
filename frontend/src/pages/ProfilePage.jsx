import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { profileApi, roadmapsApi } from '../services/api';
import {
  User,
  GraduationCap,
  Briefcase,
  Clock,
  Calendar,
  Sparkles,
  Save,
  CheckCircle2,
  Trash2,
  Plus,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Award,
  DollarSign,
  Globe,
  Sliders,
  Layers,
} from 'lucide-react';
import Badge from '../components/common/Badge';

const educationLevels = [
  'Undergraduate - 1st / 2nd Year',
  'Undergraduate - Pre-final Year',
  'Undergraduate - Final Year',
  'Postgraduate / Masters',
  'Recent Graduate (< 1 year)',
  'Self-Taught / Career Transition',
];

const educationFields = [
  'Engineering / Technology',
  'Commerce / Finance / Accounting',
  'Business Administration / Management',
  'Natural Sciences & Mathematics',
  'Arts & Humanities',
  'Diploma / Polytechnic',
  'Other Background',
];

const currentStatusOptions = [
  { value: 'student', label: 'College Student' },
  { value: 'fresher', label: 'Recent Graduate / Fresher' },
  { value: 'employed', label: 'Working Professional' },
  { value: 'career_switcher', label: 'Career Switcher' },
  { value: 'unemployed', label: 'Seeking Opportunities' },
];

const budgetOptions = [
  { value: 'free_only', label: '100% Free Resources Only (₹0)' },
  { value: 'budget_under_50', label: 'Low Budget (Under ₹4,000 / $50)' },
  { value: 'flexible', label: 'Flexible (Free + Premium)' },
];

const learningFormats = [
  { value: 'mixed', label: 'Balanced (Mixed)', desc: 'Theory, documentation, and exercises' },
  { value: 'practice', label: 'Hands-on Practice', desc: 'Code labs, case studies, and projects' },
  { value: 'documentation', label: 'Official Docs & Text', desc: 'Comprehensive guides and standards' },
  { value: 'video', label: 'Video Walkthroughs', desc: 'Visual step-by-step tutorials' },
];

const PROFICIENCY_OPTIONS = [
  { level: 1, label: 'L1: Beginner', short: 'L1' },
  { level: 2, label: 'L2: Basic', short: 'L2' },
  { level: 3, label: 'L3: Intermediate', short: 'L3' },
  { level: 4, label: 'L4: Advanced', short: 'L4' },
  { level: 5, label: 'L5: Expert', short: 'L5' },
];

const ProfilePage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'all';

  const { profile, setProfile, allRoles, allSkills, activeRole, setActiveRoadmap, addToast, triggerCelebration, refreshGamification, switchCareer } = useApp();

  const [formData, setFormData] = useState({
    display_name: '',
    education_level: 'Undergraduate - Final Year',
    educational_field: 'Engineering / Technology',
    degree_specialization: 'B.Tech Computer Science',
    current_status: 'student',
    current_role: 'Student',
    current_experience_level: 'Intermediate',
    target_role_id: '',
    weekly_study_hours: 15,
    target_duration_weeks: 12,
    preferred_learning_format: 'mixed',
    learning_budget: 'free_only',
    preferred_language: 'en',
    placement_deadline: '',
    skills_assessment: {},
    ai_enabled: true,
  });

  const [careerSearch, setCareerSearch] = useState('');
  const [selectedSkillToAdd, setSelectedSkillToAdd] = useState('');
  const [selectedProfToAdd, setSelectedProfToAdd] = useState(2);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [errors, setErrors] = useState({});

  // Filtered roles for career dropdown
  const filteredRoles = careerSearch
    ? allRoles.filter((r) => {
        const q = careerSearch.toLowerCase();
        return (
          r.title.toLowerCase().includes(q) ||
          (r.category && r.category.toLowerCase().includes(q)) ||
          (r.domain && r.domain.toLowerCase().includes(q))
        );
      })
    : allRoles;

  // Populate form from existing profile if available
  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || '',
        education_level: profile.education_level || 'Undergraduate - Final Year',
        educational_field: profile.educational_field || 'Engineering / Technology',
        degree_specialization: profile.degree_specialization || 'B.Tech Computer Science',
        current_status: profile.current_status || 'student',
        current_role: profile.current_role || 'Student',
        current_experience_level: profile.current_experience_level || 'Intermediate',
        target_role_id: profile.target_role_id ? profile.target_role_id.toString() : '',
        weekly_study_hours: profile.weekly_study_hours || 15,
        target_duration_weeks: profile.target_duration_weeks || 12,
        preferred_learning_format: profile.preferred_learning_format || 'mixed',
        learning_budget: profile.learning_budget || 'free_only',
        preferred_language: profile.preferred_language || 'en',
        placement_deadline: profile.placement_deadline || '',
        skills_assessment: profile.skills_assessment ? { ...profile.skills_assessment } : {},
        ai_enabled: profile.ai_enabled !== false,
      });
    }
  }, [profile]);

  // One-click direct target role switcher
  const handleDirectCareerSelect = async (roleId) => {
    if (!roleId) {
      addToast('warning', 'Please select a career role from the list first.', 'Role Required');
      return;
    }
    const targetRoleId = parseInt(roleId, 10);
    setFormData((prev) => ({ ...prev, target_role_id: targetRoleId.toString() }));
    setSaving(true);
    try {
      if (switchCareer) {
        await switchCareer(targetRoleId);
      } else {
        if (profile?.id) {
          const updated = await profileApi.update(profile.id, { target_role_id: targetRoleId });
          setProfile(updated);
        }
      }
      triggerCelebration();
      const matched = allRoles.find((r) => r.id === targetRoleId);
      addToast('success', `Active target career set to ${matched?.title || 'Selected Role'}!`, 'Target Role Set');
    } catch (err) {
      addToast('error', err.message || 'Failed to update target career.', 'Error');
    } finally {
      setSaving(false);
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.display_name.trim() && !profile?.display_name) {
      errs.display_name = 'Name or nickname is required';
    }
    if (!formData.degree_specialization.trim() && !profile?.degree_specialization) {
      errs.degree_specialization = 'Degree/specialization is required';
    }
    if (formData.weekly_study_hours < 3 || formData.weekly_study_hours > 60) {
      errs.weekly_study_hours = 'Study hours must be between 3 and 60 hrs/week';
    }
    if (formData.target_duration_weeks < 2 || formData.target_duration_weeks > 52) {
      errs.target_duration_weeks = 'Target duration must be between 2 and 52 weeks';
    }
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      if (errs.display_name || errs.degree_specialization) {
        setSearchParams({ tab: 'profile' });
      }
      return false;
    }
    return true;
  };

  const handleAddSkill = () => {
    if (!selectedSkillToAdd) return;
    setFormData((prev) => ({
      ...prev,
      skills_assessment: {
        ...prev.skills_assessment,
        [selectedSkillToAdd]: parseInt(selectedProfToAdd, 10),
      },
    }));
    setSelectedSkillToAdd('');
  };

  const handleRemoveSkill = (skillSlug) => {
    setFormData((prev) => {
      const nextSkills = { ...prev.skills_assessment };
      delete nextSkills[skillSlug];
      return { ...prev, skills_assessment: nextSkills };
    });
  };

  const handleSkillProfChange = (skillSlug, profLevel) => {
    setFormData((prev) => ({
      ...prev,
      skills_assessment: {
        ...prev.skills_assessment,
        [skillSlug]: profLevel,
      },
    }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validate()) {
      addToast('error', 'Please resolve form errors before submitting.', 'Validation Error');
      return null;
    }

    setSaving(true);
    try {
      const effectiveDisplayName = formData.display_name.trim() || profile?.display_name || 'Explorer';
      const effectiveDegree = formData.degree_specialization.trim() || profile?.degree_specialization || 'Engineering / Technology';

      const payload = {
        display_name: effectiveDisplayName,
        education_level: formData.education_level,
        educational_field: formData.educational_field,
        degree_specialization: effectiveDegree,
        current_status: formData.current_status,
        current_role: formData.current_role,
        current_experience_level: formData.current_experience_level,
        target_role_id: formData.target_role_id ? parseInt(formData.target_role_id, 10) : null,
        weekly_study_hours: parseInt(formData.weekly_study_hours, 10),
        target_duration_weeks: parseInt(formData.target_duration_weeks, 10),
        preferred_learning_format: formData.preferred_learning_format,
        learning_budget: formData.learning_budget,
        preferred_language: formData.preferred_language,
        placement_deadline: formData.placement_deadline || null,
        skills_assessment: formData.skills_assessment,
        ai_enabled: formData.ai_enabled,
      };

      let res;
      if (profile?.id) {
        res = await profileApi.update(profile.id, payload);
        addToast('success', 'Profile updated successfully!', 'Profile Saved');
      } else {
        res = await profileApi.create(payload);
        addToast('success', 'Profile created successfully!', 'Profile Ready');
      }

      setProfile(res);

      // Synchronize career switch in AppContext if target_role_id is present
      if (payload.target_role_id && switchCareer) {
        await switchCareer(payload.target_role_id, { silent: true });
      }

      return res;
    } catch (err) {
      addToast('error', err.message || 'Failed to save student profile.', 'Error');
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndGenerate = async () => {
    if (!formData.target_role_id) {
      addToast('warning', 'Please select a Target Career to generate your roadmap.', 'Target Role Required');
      return;
    }

    const savedProf = await handleSubmit();
    if (!savedProf) return;

    setGenerating(true);
    try {
      addToast('info', 'Loading topologically sequenced roadmap for your target career...', 'Updating');
      const targetRoleId = parseInt(formData.target_role_id, 10);
      let roadmapPlan;
      if (switchCareer) {
        roadmapPlan = await switchCareer(targetRoleId);
      } else {
        roadmapPlan = await roadmapsApi.generate({
          profile_id: savedProf.id,
          role_id: targetRoleId,
          weekly_hours: parseInt(formData.weekly_study_hours, 10),
          target_duration_weeks: parseInt(formData.target_duration_weeks, 10),
          preferred_format: formData.preferred_learning_format,
          skills_assessment: formData.skills_assessment,
        });
        setActiveRoadmap(roadmapPlan);
      }

      triggerCelebration();
      await refreshGamification(savedProf.id);
      addToast('success', `Career roadmap ready for ${roadmapPlan?.role_title || 'Selected Career'}!`, 'Roadmap Ready');
      navigate('/roadmap');
    } catch (err) {
      addToast('error', err.message || 'Roadmap generation failed.', 'Generation Error');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="primary" className="mb-1.5">User Onboarding & Profile</Badge>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">
            Personal Learning Profile
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Personalize recommendations based on your educational background, actual competencies, and weekly pacing.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveAndGenerate}
          disabled={saving || generating}
          className="btn-primary py-2.5 px-5 shrink-0"
        >
          <Sparkles className="w-4 h-4 text-navy-950" />
          <span>{generating ? 'Calculating Plan...' : 'Generate AI Roadmap'}</span>
        </button>
      </div>

      {/* Progressive Disclosure Sub-Option Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800">
        {[
          { id: 'all', label: 'All Sections', icon: Layers },
          { id: 'profile', label: '1. Student Profile', icon: User },
          { id: 'goals', label: '2. Career Goals', icon: Briefcase },
          { id: 'skills', label: '3. Skill Preferences', icon: GraduationCap },
          { id: 'hours', label: '4. Study Hours', icon: Clock },
          { id: 'duration', label: '5. Target Duration', icon: Calendar },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSearchParams({ tab: tab.id })}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-semibold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-brand-cyan text-navy-950 shadow-glow font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Background & Education */}
        {(activeTab === 'all' || activeTab === 'profile') && (
        <div className="glass-panel p-6 space-y-4 animate-fadeIn">
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
            <User className="w-4 h-4 text-brand-cyan" />
            <span>1. Educational Background & Status</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Display Name or Nickname <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                placeholder="e.g. Alex Morgan"
                className="glass-input w-full"
              />
              {errors.display_name && <p className="text-xs text-rose-400 mt-1">{errors.display_name}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Educational Field <span className="text-rose-400">*</span>
              </label>
              <select
                value={formData.educational_field}
                onChange={(e) => setFormData({ ...formData, educational_field: e.target.value })}
                className="glass-input w-full"
              >
                {educationFields.map((field) => (
                  <option key={field} value={field} className="bg-navy-900 text-slate-200">
                    {field}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Degree & Specialization <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={formData.degree_specialization}
                onChange={(e) => setFormData({ ...formData, degree_specialization: e.target.value })}
                placeholder="e.g. B.Com Accounting, BA English, B.Tech CSE"
                className="glass-input w-full"
              />
              {errors.degree_specialization && <p className="text-xs text-rose-400 mt-1">{errors.degree_specialization}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Current Status
              </label>
              <select
                value={formData.current_status}
                onChange={(e) => setFormData({ ...formData, current_status: e.target.value })}
                className="glass-input w-full"
              >
                {currentStatusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-navy-900 text-slate-200">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Current Occupation or Role (If applicable)
              </label>
              <input
                type="text"
                value={formData.current_role}
                onChange={(e) => setFormData({ ...formData, current_role: e.target.value })}
                placeholder="e.g. Student, Accountant, Sales Associate"
                className="glass-input w-full"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Learning Budget
              </label>
              <select
                value={formData.learning_budget}
                onChange={(e) => setFormData({ ...formData, learning_budget: e.target.value })}
                className="glass-input w-full"
              >
                {budgetOptions.map((b) => (
                  <option key={b.value} value={b.value} className="bg-navy-900 text-slate-200">
                    {b.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        )}

        {/* Step 2: Target Career & Study Capacity */}
        {(activeTab === 'all' || activeTab === 'goals' || activeTab === 'hours' || activeTab === 'duration') && (
        <div className="glass-panel p-6 space-y-4 animate-fadeIn">
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
            <Briefcase className="w-4 h-4 text-sky-400" />
            <span>2. Target Career Goal & Pacing</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="block text-xs font-medium text-slate-300">
                  Target Career Path <span className="text-rose-400">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={careerSearch}
                    onChange={(e) => setCareerSearch(e.target.value)}
                    placeholder="Filter 259+ careers (e.g. Java, Python, AI, CA)..."
                    className="glass-input py-1 px-2.5 text-xs w-64 bg-navy-950/70 border-slate-700/80"
                  />
                  {careerSearch && (
                    <button
                      type="button"
                      onClick={() => setCareerSearch('')}
                      className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <select
                  value={formData.target_role_id}
                  onChange={(e) => setFormData({ ...formData, target_role_id: e.target.value })}
                  className="glass-input flex-1 font-medium bg-navy-900 border-cyan-500/30 text-white"
                >
                  <option value="" className="bg-navy-900 text-slate-400">-- Select Target Career Benchmark ({filteredRoles.length} Available) --</option>
                  {filteredRoles.map((role) => (
                    <option key={role.id} value={role.id} className="bg-navy-900 text-slate-200">
                      {role.title} ({role.category || role.domain || 'Tech'}) – {role.average_salary_range}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => handleDirectCareerSelect(formData.target_role_id)}
                  disabled={!formData.target_role_id || saving}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/20 transition cursor-pointer shrink-0 disabled:opacity-50"
                  title="Apply and set this as your active target career immediately"
                >
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  <span>Set Active Career</span>
                </button>
              </div>

              {activeRole && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-slate-400">Current Active Track:</span>
                    <strong className="text-cyan-300 font-semibold">{activeRole.title}</strong>
                    <span className="text-slate-500 font-mono">({activeRole.domain || activeRole.category})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-400 font-mono font-semibold">{activeRole.average_salary_range}</span>
                    <Link to="/discovery" className="text-[11px] font-mono text-cyan-400 hover:underline">
                      Explore All 18 Domains →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Weekly Study Hours Commitment
                </label>
                <span className="text-xs font-mono font-bold text-brand-cyan">
                  {formData.weekly_study_hours} hrs/week
                </span>
              </div>
              <input
                type="range"
                min="3"
                max="50"
                step="1"
                value={formData.weekly_study_hours}
                onChange={(e) => setFormData({ ...formData, weekly_study_hours: parseInt(e.target.value, 10) })}
                className="w-full accent-brand-cyan cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>3 hrs (Light)</span>
                <span>15 hrs (Standard)</span>
                <span>40+ hrs (Intensive)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Target Roadmap Duration
                </label>
                <span className="text-xs font-mono font-bold text-sky-400">
                  {formData.target_duration_weeks} weeks
                </span>
              </div>
              <input
                type="range"
                min="4"
                max="26"
                step="1"
                value={formData.target_duration_weeks}
                onChange={(e) => setFormData({ ...formData, target_duration_weeks: parseInt(e.target.value, 10) })}
                className="w-full accent-sky-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>4 wks (Sprint)</span>
                <span>12 wks (Quarter)</span>
                <span>24+ wks (Deep Dive)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Preferred Learning Format
              </label>
              <select
                value={formData.preferred_learning_format}
                onChange={(e) => setFormData({ ...formData, preferred_learning_format: e.target.value })}
                className="glass-input w-full"
              >
                {learningFormats.map((f) => (
                  <option key={f.value} value={f.value} className="bg-navy-900 text-slate-200">
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Target Placement Deadline (Optional)
              </label>
              <input
                type="date"
                value={formData.placement_deadline}
                onChange={(e) => setFormData({ ...formData, placement_deadline: e.target.value })}
                className="glass-input w-full"
              />
            </div>
          </div>
        </div>
        )}

        {/* Step 3: Skills & Proficiency Assessment (0-5 Scale) */}
        {(activeTab === 'all' || activeTab === 'skills') && (
        <div className="glass-panel p-6 space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-brand-cyan" />
                <span>3. Existing Skill Inventory (0–5 Proficiency Scale)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Rate skills honestly. Unadded skills default to Level 0 (Not Learned).
              </p>
            </div>
            <Link
              to="/assessment"
              className="inline-flex items-center gap-1.5 text-xs text-brand-cyan hover:underline font-mono"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Take Verified Skill Quiz</span>
            </Link>
          </div>

          {/* Add skill selector */}
          <div className="flex flex-col sm:flex-row gap-3 p-3 rounded-lg bg-navy-850/80 border border-slate-800">
            <select
              value={selectedSkillToAdd}
              onChange={(e) => setSelectedSkillToAdd(e.target.value)}
              className="glass-input flex-1"
            >
              <option value="">-- Choose skill to add (Technical or Non-Technical) --</option>
              {allSkills
                .filter((s) => !(s.slug in formData.skills_assessment))
                .map((s) => (
                  <option key={s.id} value={s.slug} className="bg-navy-900 text-slate-200">
                    {s.name} ({s.category})
                  </option>
                ))}
            </select>

            <select
              value={selectedProfToAdd}
              onChange={(e) => setSelectedProfToAdd(parseInt(e.target.value, 10))}
              className="glass-input sm:w-52"
            >
              {PROFICIENCY_OPTIONS.map((opt) => (
                <option key={opt.level} value={opt.level} className="bg-navy-900 text-slate-200">
                  {opt.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleAddSkill}
              disabled={!selectedSkillToAdd}
              className="btn-secondary py-2 px-4 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Skill</span>
            </button>
          </div>

          {/* Added Skills List */}
          <div className="space-y-2 pt-2">
            {Object.entries(formData.skills_assessment).length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500 italic">
                No skills added yet. Add your current skills above to calculate your baseline readiness score.
              </div>
            ) : (
              Object.entries(formData.skills_assessment).map(([slug, prof]) => {
                const skillObj = allSkills.find((s) => s.slug === slug);
                const skillName = skillObj ? skillObj.name : slug;
                const verifiedData = profile?.assessed_skills?.[slug];

                return (
                  <div
                    key={slug}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-navy-850/50 border border-slate-800/80 hover:border-slate-700 gap-3"
                  >
                    <div>
                      <div className="text-sm font-medium text-slate-200 flex items-center gap-2">
                        <span>{skillName}</span>
                        {verifiedData && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Verified (Quiz {verifiedData.score_percentage}%)</span>
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {skillObj?.category || 'Skill'}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex flex-wrap gap-1">
                        {PROFICIENCY_OPTIONS.map((opt) => (
                          <button
                            key={opt.level}
                            type="button"
                            onClick={() => handleSkillProfChange(slug, opt.level)}
                            className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-all ${
                              prof === opt.level
                                ? 'bg-brand-cyan text-navy-950 font-bold shadow-glow-cyan'
                                : 'bg-navy-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                            }`}
                          >
                            {opt.short}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(slug)}
                        className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                        title="Remove skill"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="btn-secondary w-full sm:w-auto px-6 py-2.5"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Profile Only'}</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAndGenerate}
            disabled={saving || generating}
            className="btn-primary w-full sm:w-auto px-6 py-2.5"
          >
            <Sparkles className="w-4 h-4 text-navy-950" />
            <span>{generating ? 'Calculating Plan...' : 'Save & Generate AI Roadmap'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;
