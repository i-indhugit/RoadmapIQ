import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Scale,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  TrendingUp,
  Compass,
  Check
} from 'lucide-react';
import { rolesApi, roadmapsApi } from '../services/api';
import { useApp } from '../context/AppContext';
import Badge from '../components/common/Badge';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

const CareerComparisonPage = () => {
  const navigate = useNavigate();
  const { allRoles, profile, setActiveRoadmap, addToast, switchCareer } = useApp();
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);
  const [comparisonData, setComparisonData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Initialize with the first two roles or user's target role
  useEffect(() => {
    if (allRoles.length >= 2 && selectedRoleIds.length === 0) {
      const defaultIds = [];
      if (profile?.target_role_id) {
        defaultIds.push(profile.target_role_id);
      }
      for (const r of allRoles) {
        if (!defaultIds.includes(r.id) && defaultIds.length < 3) {
          defaultIds.push(r.id);
        }
      }
      setSelectedRoleIds(defaultIds.slice(0, 3));
    }
  }, [allRoles, profile]);

  // Fetch comparison whenever selection changes
  useEffect(() => {
    if (selectedRoleIds.length >= 2) {
      const fetchComparison = async () => {
        setIsLoading(true);
        try {
          const res = await rolesApi.compare({
            role_ids: selectedRoleIds,
            skills_assessment: profile?.skills_assessment || {},
          });
          setComparisonData(res);
        } catch (err) {
          addToast('error', err.message || 'Failed to compare career paths.', 'Comparison Error');
        } finally {
          setIsLoading(false);
        }
      };
      fetchComparison();
    }
  }, [selectedRoleIds, profile]);

  const toggleRoleSelection = (roleId) => {
    if (selectedRoleIds.includes(roleId)) {
      if (selectedRoleIds.length <= 2) {
        addToast('warning', 'Please keep at least 2 careers selected to compare.', 'Selection Notice');
        return;
      }
      setSelectedRoleIds((prev) => prev.filter((id) => id !== roleId));
    } else {
      if (selectedRoleIds.length >= 3) {
        addToast('info', 'You can compare up to 3 careers simultaneously. Deselect one first.', 'Comparison Limit');
        return;
      }
      setSelectedRoleIds((prev) => [...prev, roleId]);
    }
  };

  const handleSelectAndGenerate = async (roleId) => {
    setIsGenerating(true);
    try {
      if (switchCareer) {
        await switchCareer(roleId);
      } else {
        const payload = {
          profile_id: profile?.id,
          role_id: roleId,
          weekly_hours: profile?.weekly_study_hours || 15,
          target_duration_weeks: profile?.target_duration_weeks || 12,
          skills_assessment: profile?.skills_assessment || {},
          preferred_format: profile?.preferred_learning_format || 'mixed',
        };
        const roadmap = await roadmapsApi.generate(payload);
        setActiveRoadmap(roadmap);
      }
      addToast('success', 'Career roadmap loaded successfully!', 'Roadmap Ready');
      navigate('/roadmap');
    } catch (err) {
      addToast('error', err.message || 'Could not generate roadmap for this career.', 'Generation Error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan text-xs font-mono font-medium mb-2">
          <Scale className="w-3.5 h-3.5" />
          <span>Cross-Disciplinary Path Comparison</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Compare Career Paths
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Evaluate 2 to 3 target careers side-by-side to understand curriculum overlap, transferable strengths, and learning hours.
        </p>
      </div>

      {/* Role Selection Pills */}
      <div className="p-4 rounded-2xl bg-navy-900/40 border border-slate-800 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            Select 2 to 3 Careers to Compare ({selectedRoleIds.length} of 3 Selected)
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {allRoles.map((role) => {
            const isSelected = selectedRoleIds.includes(role.id);
            return (
              <button
                key={role.id}
                onClick={() => toggleRoleSelection(role.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-brand-cyan text-navy-950 font-semibold shadow-glow-cyan'
                    : 'bg-navy-800/80 text-slate-300 hover:bg-slate-700/60 border border-slate-700/50'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                <span>{role.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Content */}
      {isLoading ? (
        <LoadingSkeleton count={3} />
      ) : comparisonData ? (
        <div className="space-y-8">
          {/* Recommendation Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-brand-cyan/15 via-navy-900/60 to-navy-900/40 border border-brand-cyan/30 backdrop-blur-xl flex items-start gap-4">
            <Sparkles className="w-5 h-5 text-brand-cyan shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="text-xs font-mono font-semibold text-brand-cyan uppercase tracking-wider block mb-1">
                RoadmapIQ Intelligence Synthesis
              </span>
              <p className="text-sm text-slate-200 leading-relaxed">
                {comparisonData.recommendation_summary}
              </p>
            </div>
          </div>

          {/* Side-by-Side Cards */}
          <div className={`grid grid-cols-1 md:grid-cols-${comparisonData.compared_roles.length} gap-6`}>
            {comparisonData.compared_roles.map((item) => (
              <div
                key={item.role_id}
                className="p-6 rounded-2xl bg-navy-900/40 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <Badge variant="cyan">{item.category}</Badge>
                    <span className="text-[11px] font-mono text-slate-400">
                      Demand: <strong className="text-slate-200">{item.market_demand}</strong>
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">
                    {item.role_title}
                  </h3>
                  <div className="text-xs font-mono text-brand-cyan mb-4">
                    Avg Salary: {item.salary_range}
                  </div>

                  {/* Readiness Bar */}
                  <div className="p-3.5 rounded-xl bg-navy-950/60 border border-slate-800 mb-4">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-400">Current Readiness</span>
                      <span className="font-bold text-brand-cyan font-mono">{item.readiness_score}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-brand-blue to-brand-cyan h-full transition-all duration-500 rounded-full"
                        style={{ width: `${item.readiness_score}%` }}
                      />
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                    <div className="p-2.5 rounded-lg bg-navy-950/40 border border-slate-800/80">
                      <span className="text-[10px] font-mono text-slate-500 uppercase block">Required Skills</span>
                      <span className="font-semibold text-slate-200">{item.total_required_skills} Skills</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-navy-950/40 border border-slate-800/80">
                      <span className="text-[10px] font-mono text-slate-500 uppercase block">Estimated Study</span>
                      <span className="font-semibold text-slate-200">{item.estimated_learning_hours} Hours</span>
                    </div>
                  </div>

                  {/* Typical Capstone Projects */}
                  {item.typical_projects?.length > 0 && (
                    <div className="mb-4">
                      <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
                        Typical Capstone Projects:
                      </span>
                      <ul className="space-y-1">
                        {item.typical_projects.map((proj, pIdx) => (
                          <li key={pIdx} className="text-xs text-slate-300 flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-brand-cyan" />
                            <span>{proj}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleSelectAndGenerate(item.role_id)}
                  disabled={isGenerating}
                  className="w-full mt-4 py-2.5 px-4 rounded-xl text-xs font-semibold bg-navy-800 hover:bg-brand-cyan hover:text-navy-950 text-slate-200 transition-all flex items-center justify-center gap-2 border border-slate-700/60"
                >
                  <span>Build Roadmap for This Track</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Overlap & Unique Analysis Sections */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Shared Skills */}
            <div className="p-5 rounded-2xl bg-navy-900/40 border border-slate-800">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold text-brand-cyan uppercase tracking-wider mb-3">
                <CheckCircle2 className="w-4 h-4" />
                <span>Shared Core Skills ({comparisonData.shared_skills.length})</span>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Skills common to all selected tracks. Mastering these preserves high versatility across paths.
              </p>
              {comparisonData.shared_skills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {comparisonData.shared_skills.map((s, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-navy-950 border border-slate-700 text-xs text-slate-200">
                      {s}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-slate-500 italic">No exact identical skill overlap between these specific careers.</span>
              )}
            </div>

            {/* Transferable Strengths */}
            <div className="p-5 rounded-2xl bg-navy-900/40 border border-slate-800">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold text-emerald-400 uppercase tracking-wider mb-3">
                <TrendingUp className="w-4 h-4" />
                <span>Your Transferable Strengths ({comparisonData.transferable_skills.length})</span>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Skills you already know that carry value into multiple target careers.
              </p>
              {comparisonData.transferable_skills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {comparisonData.transferable_skills.map((s, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300">
                      {s}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-slate-500 italic">Complete your skill assessment to uncover transferable strengths.</span>
              )}
            </div>

            {/* Unique Skills Overview */}
            <div className="p-5 rounded-2xl bg-navy-900/40 border border-slate-800">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold text-purple-400 uppercase tracking-wider mb-3">
                <Compass className="w-4 h-4" />
                <span>Distinct Specialized Skills</span>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Specialized skills unique to each specific career track.
              </p>
              <div className="space-y-3">
                {Object.entries(comparisonData.unique_skills_by_role || {}).map(([roleName, uniqueList]) => (
                  <div key={roleName}>
                    <span className="text-xs font-medium text-slate-300 block mb-1">{roleName}:</span>
                    <div className="flex flex-wrap gap-1">
                      {uniqueList.slice(0, 3).map((u, uIdx) => (
                        <span key={uIdx} className="px-2 py-0.5 rounded bg-purple-950/30 border border-purple-500/20 text-[11px] text-purple-300">
                          {u}
                        </span>
                      ))}
                      {uniqueList.length > 3 && (
                        <span className="text-[10px] text-slate-500 self-center">+{uniqueList.length - 3} more</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default CareerComparisonPage;

