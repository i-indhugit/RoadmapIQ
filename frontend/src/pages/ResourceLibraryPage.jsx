import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { resourcesApi } from '../services/api';
import {
  BookOpen,
  Search,
  Filter,
  ExternalLink,
  Bookmark,
  Star,
  CheckCircle2,
  Sparkles,
  Layers,
} from 'lucide-react';
import Badge from '../components/common/Badge';
import { SkeletonCard } from '../components/common/LoadingSkeleton';

const formats = ['all', 'documentation', 'practice', 'mixed', 'video'];
const difficulties = ['all', 'beginner', 'intermediate', 'advanced'];

const ResourceLibraryPage = () => {
  const { allSkills, profile, addToast } = useApp();

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  const fetchResources = async () => {
    setLoading(true);
    try {
      const params = {
        search: searchTerm || undefined,
        skill_slug: selectedSkill || undefined,
        format: selectedFormat !== 'all' ? selectedFormat : undefined,
        difficulty: selectedDifficulty !== 'all' ? selectedDifficulty : undefined,
        profile_id: profile?.id || undefined,
      };
      const data = await resourcesApi.getAll(params);
      setResources(data);
    } catch (err) {
      addToast('error', 'Could not load learning resources.', 'Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [selectedSkill, selectedFormat, selectedDifficulty]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchResources();
  };

  const handleToggleBookmark = async (resourceId) => {
    if (!profile?.id) {
      addToast('warning', 'Please create your student profile to save bookmarks.', 'Notice');
      return;
    }

    try {
      const res = await resourcesApi.toggleBookmark(resourceId, profile.id);
      setResources((prev) =>
        prev.map((r) => (r.id === resourceId ? { ...r, is_bookmarked: res.is_bookmarked } : r))
      );
      addToast('success', res.message, 'Bookmark');
    } catch (err) {
      addToast('error', 'Failed to toggle bookmark.', 'Error');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <Badge variant="primary" className="mb-2">Curriculum Assets</Badge>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 flex items-center gap-2">
          <span>Free Learning Resource Library</span>
          <BookOpen className="w-6 h-6 text-brand-cyan" />
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
          Curated, high-quality free documentation, code katas, and interactive sandboxes verified by RoadmapIQ.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search resources by title, provider, or concept..."
              className="glass-input w-full pl-10 text-sm"
            />
          </div>

          <button type="submit" className="btn-primary text-xs py-2 px-5 shrink-0">
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800 text-xs">
          {/* Skill Filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-mono">Skill:</span>
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="glass-input py-1 px-2.5 text-xs bg-navy-900"
            >
              <option value="">All Skills</option>
              {allSkills.map((s) => (
                <option key={s.id} value={s.slug} className="bg-navy-900 text-slate-200">
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Format Filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-mono">Format:</span>
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="glass-input py-1 px-2.5 text-xs bg-navy-900 capitalize"
            >
              {formats.map((f) => (
                <option key={f} value={f} className="bg-navy-900 text-slate-200">
                  {f}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-mono">Level:</span>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="glass-input py-1 px-2.5 text-xs bg-navy-900 capitalize"
            >
              {difficulties.map((d) => (
                <option key={d} value={d} className="bg-navy-900 text-slate-200">
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Resource Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : resources.length === 0 ? (
        <div className="glass-panel p-10 text-center text-slate-400">
          No learning resources match the current filter criteria. Try clearing your search parameters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {resources.map((res) => (
            <div
              key={res.id}
              className="glass-card p-5 flex flex-col justify-between border-slate-800/90 hover:border-slate-700"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30">
                    {res.provider}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="success" size="xs">100% Free</Badge>
                    <button
                      type="button"
                      onClick={() => handleToggleBookmark(res.id)}
                      className={`p-1 rounded hover:bg-slate-800 transition-colors ${
                        res.is_bookmarked ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'
                      }`}
                      title={res.is_bookmarked ? 'Bookmarked' : 'Bookmark resource'}
                    >
                      <Bookmark className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>
                </div>

                <h3 className="font-semibold text-slate-100 text-sm mb-1.5 line-clamp-2">
                  {res.title}
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 mb-4">
                  {res.description}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span className="text-slate-300 capitalize">{res.skill_name || 'Core Skill'}</span>
                  <span className="flex items-center gap-1 text-amber-400">
                    <Star className="w-3 h-3 fill-current" />
                    {res.rating}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 uppercase">
                    <span>{res.difficulty}</span>
                    <span>•</span>
                    <span>{res.format}</span>
                  </div>

                  <a
                    href={res.url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                  >
                    <span>Visit Resource</span>
                    <ExternalLink className="w-3 h-3 text-brand-cyan" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResourceLibraryPage;

