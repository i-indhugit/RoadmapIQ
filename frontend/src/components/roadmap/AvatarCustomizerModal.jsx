import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { profileApi } from '../../services/api';
import { AVATAR_STYLES } from '../../utils/avatarStyles';
import { X, Check, Sparkles, User, Shield } from 'lucide-react';

const AvatarCustomizerModal = ({ isOpen, onClose, onSelectAvatar }) => {
  const { profile, setProfile, addToast, triggerCelebration } = useApp();
  const [selectedStyleId, setSelectedStyleId] = useState(profile?.avatar_style || 'code_knight');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      if (profile?.id) {
        const updated = await profileApi.update(profile.id, {
          avatar_style: selectedStyleId,
        });
        setProfile(updated);
      }
      onSelectAvatar(selectedStyleId);
      triggerCelebration({ particleCount: 50, spread: 50 });
      addToast('success', `Equipped ${AVATAR_STYLES[selectedStyleId].name}!`, 'Avatar Updated');
      onClose();
    } catch (err) {
      addToast('error', 'Failed to save avatar preference.', 'Error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-xl bg-navy-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-navy-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100">
                Choose Your Journey Avatar
              </h2>
              <p className="text-xs text-slate-400">
                Select the character that travels your career roadmap
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Avatar Grid */}
        <div className="p-5 overflow-y-auto space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.values(AVATAR_STYLES).map((avatar) => {
              const isSelected = selectedStyleId === avatar.id;
              return (
                <div
                  key={avatar.id}
                  onClick={() => setSelectedStyleId(avatar.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex items-center gap-3.5 ${isSelected
                      ? 'bg-navy-850 border-brand-cyan shadow-glow-cyan/40 ring-1 ring-brand-cyan'
                      : 'bg-navy-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                >
                  <div className="shrink-0 p-1 rounded-2xl bg-navy-900 border border-slate-800">
                    {avatar.renderAvatar({ size: 50, isMoving: isSelected })}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="font-bold text-sm text-slate-100 truncate">
                        {avatar.name}
                      </span>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-brand-cyan text-navy-950 flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-brand-cyan block mb-1">
                      {avatar.title}
                    </span>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {avatar.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 bg-navy-950/80 border-t border-slate-800 flex items-center justify-end gap-3 shrink-0">
          <button onClick={onClose} className="btn-secondary text-xs py-2 px-4">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary text-xs py-2 px-5 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{saving ? 'Equipping...' : 'Equip Selected Avatar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarCustomizerModal;

