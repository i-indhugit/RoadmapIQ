import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { gamificationApi, rolesApi } from '../services/api';
import {
  Lock,
  Unlock,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  ArrowRight,
  BookOpen,
  Award,
  Filter,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Shield,
  Layers,
  Info,
} from 'lucide-react';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import ErrorMessage from '../components/common/ErrorMessage';
import Badge from '../components/common/Badge';

const SkillTreePage = () => {
  const { profile, activeRole, setActiveRole, allRoles, triggerCelebration } = useApp();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [treeData, setTreeData] = useState(null);
  const [selectedRole, setSelectedRole] = useState(activeRole?.id || null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');

  const loadTree = async (roleId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await gamificationApi.getSkillTree(roleId, profile?.id);
      setTreeData(data);
      if (data.nodes?.length > 0 && !selectedNode) {
        // Select first available or in-progress node by default
        const defaultNode =
          data.nodes.find((n) => n.status === 'in_progress') ||
          data.nodes.find((n) => n.status === 'available') ||
          data.nodes[0];
        setSelectedNode(defaultNode);
      }
    } catch (err) {
      setError(err.message || 'Failed to load interactive skill tree.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const rId = selectedRole || activeRole?.id;
    loadTree(rId);
  }, [selectedRole, activeRole?.id]);

  const handleRoleChange = (e) => {
    const newRoleId = parseInt(e.target.value, 10);
    setSelectedRole(newRoleId);
    const roleObj = allRoles.find((r) => r.id === newRoleId);
    if (roleObj) setActiveRole(roleObj);
  };

  const filteredNodes = treeData?.nodes
    ? treeData.nodes.filter((node) => {
        if (filterCategory === 'all') return true;
        if (filterCategory === 'gaps') return node.status !== 'completed';
        if (filterCategory === 'technical')
          return !['Communication', 'Problem Solving', 'Leadership', 'Teamwork'].includes(
            node.category
          );
        if (filterCategory === 'soft')
          return ['Communication', 'Problem Solving', 'Leadership', 'Teamwork'].includes(
            node.category
          );
        return true;
      })
    : [];

  // Group nodes by required proficiency tiers
  const tier1Nodes = filteredNodes.filter((n) => n.required_proficiency <= 2);
  const tier2Nodes = filteredNodes.filter((n) => n.required_proficiency === 3);
  const tier3Nodes = filteredNodes.filter((n) => n.required_proficiency >= 4);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> Mastered
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5 animate-pulse" /> In Progress
          </span>
        );
      case 'available':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-glow-cyan">
            <Unlock className="w-3.5 h-3.5" /> Unlocked
          </span>
        );
      case 'locked':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            <Lock className="w-3.5 h-3.5" /> Locked
          </span>
        );
    }
  };

  const getNodeCardStyle = (status, isSelected) => {
    let base =
      'p-4 rounded-2xl border transition-all duration-200 cursor-pointer relative overflow-hidden ';
    if (isSelected) {
      base += 'ring-2 ring-brand-cyan ring-offset-2 ring-offset-navy-950 ';
    }
    switch (status) {
      case 'completed':
        return (
          base +
          'bg-emerald-950/20 border-emerald-500/40 hover:border-emerald-400 text-emerald-100 shadow-lg shadow-emerald-950/20'
        );
      case 'in_progress':
        return (
          base +
          'bg-amber-950/20 border-amber-500/40 hover:border-amber-400 text-amber-100 shadow-lg shadow-amber-950/20'
        );
      case 'available':
        return (
          base +
          'bg-cyan-950/30 border-cyan-500/40 hover:border-cyan-400 hover:shadow-glow-cyan text-cyan-50'
        );
      case 'locked':
      default:
        return (
          base +
          'bg-navy-900/40 border-slate-800/80 hover:border-slate-700 text-slate-400 opacity-75'
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header with Career Track Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 border border-slate-800/80 shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono font-semibold text-brand-cyan uppercase tracking-wider">
              RPG Skill Progression Tree
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Interactive Career Skill Tree
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            Prerequisite dependency DAG engine. Unlock skills sequentially by mastering their
            foundational dependencies and level up your overall career readiness.
          </p>
        </div>

        {/* Career Role Selector Dropdown */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative">
            <select
              value={selectedRole || ''}
              onChange={handleRoleChange}
              className="bg-navy-800 border border-slate-700 text-slate-100 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan pr-8 appearance-none"
            >
              {allRoles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.title} ({role.category})
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => loadTree(selectedRole)}
            className="btn-secondary text-xs py-2 px-3 flex items-center justify-center gap-1.5"
            title="Refresh Skill Tree"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {loading && <LoadingSkeleton count={4} />}
      {error && <ErrorMessage message={error} onRetry={() => loadTree(selectedRole)} />}

      {!loading && !error && treeData && (
        <>
          {/* Readiness & Node Counters Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-navy-900/60 border border-slate-800 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-brand-cyan/10 text-brand-cyan">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-mono text-slate-400 uppercase">Track Readiness</p>
                <p className="text-xl font-extrabold text-brand-cyan">
                  {treeData.readiness_score}%
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-navy-900/60 border border-slate-800 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-mono text-slate-400 uppercase">Mastered Skills</p>
                <p className="text-xl font-extrabold text-emerald-400">
                  {treeData.nodes.filter((n) => n.status === 'completed').length} /{' '}
                  {treeData.total_count}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-navy-900/60 border border-slate-800 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-mono text-slate-400 uppercase">In Progress</p>
                <p className="text-xl font-extrabold text-amber-400">
                  {treeData.nodes.filter((n) => n.status === 'in_progress').length}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-navy-900/60 border border-slate-800 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
                <Unlock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-mono text-slate-400 uppercase">Unlocked & Ready</p>
                <p className="text-xl font-extrabold text-cyan-400">
                  {treeData.nodes.filter((n) => n.status === 'available').length}
                </p>
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center justify-between flex-wrap gap-2 pt-1 pb-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-slate-400 mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Filters:
              </span>
              {[
                { id: 'all', label: 'All Skills' },
                { id: 'gaps', label: 'Skill Gaps Only' },
                { id: 'technical', label: 'Technical Skills' },
                { id: 'soft', label: 'Soft & Transferable' },
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setFilterCategory(btn.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                    filterCategory === btn.id
                      ? 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/40 font-semibold shadow-glow-cyan'
                      : 'bg-navy-900/70 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            <span className="text-xs font-mono text-slate-500">
              Showing {filteredNodes.length} of {treeData.total_count} skills
            </span>
          </div>

          {/* Main 2-Column Layout: Visual Tree Nodes (Left) & Node Detail Briefing (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Visual Skill Tiers Column (8 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Tier 1: Foundation Skills */}
              {tier1Nodes.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                      <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                        Tier 1: Foundation Prerequisites
                      </h3>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500">
                      Level 1-2 Required
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {tier1Nodes.map((node) => (
                      <div
                        key={node.id}
                        onClick={() => setSelectedNode(node)}
                        className={getNodeCardStyle(node.status, selectedNode?.id === node.id)}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="text-[11px] font-mono text-slate-400 uppercase">
                            {node.category}
                          </span>
                          {getStatusBadge(node.status)}
                        </div>
                        <h4 className="font-bold text-sm text-slate-100 mb-1.5">{node.name}</h4>
                        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                          <span>
                            Proficiency: {node.current_proficiency} / {node.required_proficiency}
                          </span>
                          <span className="font-mono text-amber-400/90 flex items-center gap-1">
                            <Zap className="w-3 h-3 text-amber-400" /> +50 XP
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tier 2: Intermediate Core */}
              {tier2Nodes.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                      <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                        Tier 2: Intermediate Core Competencies
                      </h3>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500">
                      Level 3 Required
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {tier2Nodes.map((node) => (
                      <div
                        key={node.id}
                        onClick={() => setSelectedNode(node)}
                        className={getNodeCardStyle(node.status, selectedNode?.id === node.id)}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="text-[11px] font-mono text-slate-400 uppercase">
                            {node.category}
                          </span>
                          {getStatusBadge(node.status)}
                        </div>
                        <h4 className="font-bold text-sm text-slate-100 mb-1.5">{node.name}</h4>
                        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                          <span>
                            Proficiency: {node.current_proficiency} / {node.required_proficiency}
                          </span>
                          <span className="font-mono text-amber-400/90 flex items-center gap-1">
                            <Zap className="w-3 h-3 text-amber-400" /> +75 XP
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tier 3: Advanced Mastery */}
              {tier3Nodes.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                      <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                        Tier 3: Advanced Specialization & Frameworks
                      </h3>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500">
                      Level 4-5 Required
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {tier3Nodes.map((node) => (
                      <div
                        key={node.id}
                        onClick={() => setSelectedNode(node)}
                        className={getNodeCardStyle(node.status, selectedNode?.id === node.id)}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="text-[11px] font-mono text-slate-400 uppercase">
                            {node.category}
                          </span>
                          {getStatusBadge(node.status)}
                        </div>
                        <h4 className="font-bold text-sm text-slate-100 mb-1.5">{node.name}</h4>
                        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                          <span>
                            Proficiency: {node.current_proficiency} / {node.required_proficiency}
                          </span>
                          <span className="font-mono text-amber-400/90 flex items-center gap-1">
                            <Zap className="w-3 h-3 text-amber-400" /> +100 XP
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Selected Node Codex / Mission Briefing (Right 5 cols) */}
            <div className="lg:col-span-5 sticky top-20">
              {selectedNode ? (
                <div className="p-6 rounded-3xl bg-navy-900/90 border border-slate-800/90 shadow-2xl space-y-5">
                  {/* Node Header */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-brand-cyan uppercase tracking-wider">
                        {selectedNode.category}
                      </span>
                      {getStatusBadge(selectedNode.status)}
                    </div>
                    <h3 className="text-xl font-extrabold text-slate-100">
                      {selectedNode.name}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {selectedNode.description ||
                        `Core proficiency skill required for ${treeData.role_title}.`}
                    </p>
                  </div>

                  {/* Prerequisites Requirement Alert */}
                  {selectedNode.unmet_prerequisites?.length > 0 && (
                    <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 space-y-1.5 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-rose-400">
                        <Lock className="w-4 h-4 shrink-0" />
                        <span>Locked Prerequisites:</span>
                      </div>
                      <p className="text-rose-200/90">
                        You must achieve at least Intermediate (Level 2+) in:
                      </p>
                      <ul className="list-disc list-inside font-semibold text-rose-300">
                        {selectedNode.unmet_prerequisites.map((p, idx) => (
                          <li key={idx}>{p}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Proficiency Level Progress Bar */}
                  <div className="space-y-1.5 p-3.5 rounded-2xl bg-navy-950/60 border border-slate-800/80">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Current vs Required</span>
                      <span className="font-mono font-bold text-brand-cyan">
                        Level {selectedNode.current_proficiency} / {selectedNode.required_proficiency}
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          selectedNode.status === 'completed'
                            ? 'bg-emerald-400'
                            : selectedNode.status === 'in_progress'
                            ? 'bg-amber-400'
                            : 'bg-brand-cyan'
                        }`}
                        style={{
                          width: `${Math.min(
                            100,
                            (selectedNode.current_proficiency / selectedNode.required_proficiency) * 100
                          )}%`,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                      <span>Est. Study: {selectedNode.estimated_hours || 12}h</span>
                      <span>Importance: {selectedNode.importance_weight || 4}/5</span>
                    </div>
                  </div>

                  {/* All Prerequisites Listed */}
                  {selectedNode.all_prerequisites?.length > 0 && (
                    <div className="space-y-1 text-xs">
                      <span className="text-slate-400 font-medium">Dependencies in DAG:</span>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {selectedNode.all_prerequisites.map((p, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-navy-850 text-slate-300 border border-slate-700"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action CTAs */}
                  <div className="pt-2 space-y-2">
                    <Link
                      to="/journey?tab=roadmap"
                      className="w-full btn-primary text-xs py-2.5 flex items-center justify-center gap-2"
                    >
                      <Map className="w-4 h-4" />
                      <span>Study this Skill in Roadmap</span>
                    </Link>

                    {selectedNode.doc_url && (
                      <a
                        href={selectedNode.doc_url}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full btn-secondary text-xs py-2 flex items-center justify-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Official Documentation</span>
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-8 rounded-3xl bg-navy-900/60 border border-slate-800 text-center text-slate-400 text-xs">
                  <Info className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  Select any skill node on the tree to view its prerequisite dependencies, learning
                  guidance, and diagnostic quiz.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SkillTreePage;

