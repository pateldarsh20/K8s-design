import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Eye, EyeOff, X } from 'lucide-react';
import { useCanvasStore } from '../store/canvasStore';
import { COMPONENT_COLORS } from '../types';

export const HiddenPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { nodes, unhideNode, unhideAll } = useCanvasStore();

  const hiddenNodes = nodes.filter((node) => node.data.isHidden);

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed right-0 top-1/2 transform -translate-y-1/2 z-50 bg-gray-900/80 backdrop-blur-md p-3 rounded-l-2xl border border-cyan-500/30 hover:border-cyan-500 transition-all shadow-[0_0_20px_rgba(0,255,255,0.1)] group ${
          isOpen ? 'translate-x-full' : 'translate-x-0'
        }`}
        title={isOpen ? 'Close Hidden Panel' : 'Show Hidden Items'}
      >
        <div className="flex flex-col items-center gap-2">
          {isOpen ? (
            <ChevronRight size={20} className="text-cyan-400" />
          ) : (
            <>
              <EyeOff size={20} className="text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest [writing-mode:vertical-lr]">
                Hidden ({hiddenNodes.length})
              </span>
            </>
          )}
        </div>
      </button>

      {/* Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-[300px] bg-gray-950/90 backdrop-blur-xl border-l border-cyan-500/20 z-[60] transition-all duration-300 ease-in-out shadow-[-10px_0_30px_rgba(0,0,0,0.5)] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-cyan-500/5 to-transparent">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <EyeOff size={18} className="text-cyan-400" />
                Hidden Items
              </h3>
              <p className="text-xs text-gray-400 mt-1">{hiddenNodes.length} components hidden</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {hiddenNodes.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-30 text-center p-8">
                <Eye size={48} className="mb-4" />
                <p className="text-sm">No hidden components</p>
                <p className="text-xs mt-2">Right-click a component to hide it</p>
              </div>
            ) : (
              hiddenNodes.map((node) => {
                const color = node.data.color || COMPONENT_COLORS[node.type] || '#6b7280';
                return (
                  <div
                    key={node.id}
                    className="group relative flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/5 hover:border-cyan-500/30 rounded-xl p-3 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-gray-900 border border-white/5"
                        style={{ color, boxShadow: `0 0 10px ${color}20` }}
                      >
                        {node.data.iconUrl ? (
                          <img src={node.data.iconUrl} className="w-6 h-6 object-contain" alt="" />
                        ) : (
                          <EyeOff size={20} />
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-sm font-medium text-white truncate">
                          {node.data.customName || node.data.label}
                        </div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider">{node.type}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => unhideNode(node.id)}
                      className="p-2 bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-white rounded-lg transition-all"
                      title="Unhide"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {hiddenNodes.length > 0 && (
            <div className="p-4 bg-gray-900/50 border-t border-white/5">
              <button
                onClick={unhideAll}
                className="w-full py-3 bg-cyan-600/20 hover:bg-cyan-600 text-cyan-400 hover:text-white border border-cyan-500/30 rounded-xl font-bold transition-all flex items-center justify-center gap-2 group"
              >
                <Eye size={18} className="group-hover:scale-110 transition-transform" />
                Unhide All Components
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
