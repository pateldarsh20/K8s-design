import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { getEventCoordinates } from '@dnd-kit/utilities';
import { toPng } from 'html-to-image';
import Sidebar from './components/Sidebar';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import ContextMenu from './components/ContextMenu';
import { HiddenPanel } from './components/HiddenPanel';
import { useCanvasStore } from './store/canvasStore';
import { COMPONENT_COLORS, ComponentType, NODE_SIZES } from './types';
import {
  HardDrive,
  Database,
  FileText,
  Zap,
  Cloud,
  Square,
  Circle,
  Type,
  LucideIcon,
  Layout,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  'hard-drive': HardDrive,
  database: Database,
  'file-text': FileText,
  zap: Zap,
  cloud: Cloud,
  rectangle: Square,
  circle: Circle,
  text: Type,
};

function GhostComponent({ type, label, iconUrl, color }: { type: ComponentType; label: string; iconUrl?: string; color?: string }) {
  const displayColor = color || COMPONENT_COLORS[type] || '#6b7280';

  return (
    <div
      className="sidebar-item flex items-center gap-3 p-3 rounded-lg"
      style={{
        borderLeft: `3px solid ${displayColor}`,
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        borderRight: '1px solid rgba(255, 255, 255, 0.05)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        backgroundColor: 'rgba(20, 20, 20, 0.95)',
        width: '248px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
        opacity: 0.9,
      }}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center p-1 bg-white/5"
      >
        {iconUrl ? (
          <img src={iconUrl} alt={label} className="w-full h-full object-contain" />
        ) : (
          <Layout size={20} color={displayColor} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div
          className="font-semibold text-sm truncate"
          style={{ color: displayColor, textShadow: `0 0 8px ${displayColor}50` }}
        >
          {label}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [canvasRef] = useState<HTMLDivElement | null>(null);
  const [activeDrag, setActiveDrag] = useState<{
    type: ComponentType;
    label: string;
    iconUrl?: string;
    color?: string;
  } | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    nodeId: string;
  } | null>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    return saved !== null ? saved === 'true' : true;
  });

  const toggleSidebar = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    localStorage.setItem('sidebarOpen', String(newState));
  };

  const { addNode } = useCanvasStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      const state = useCanvasStore.getState();
      if (e.key === '+' || e.key === '=') {
        state.setZoom(state.zoom + 0.1);
      } else if (e.key === '-') {
        state.setZoom(state.zoom - 0.1);
      } else if (e.key === '0') {
        state.setZoom(1);
        state.setViewport({ x: 0, y: 0 });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { type, label, color, iconUrl, isFromSidebar } = event.active.data.current || {};
    if (isFromSidebar && type && label) {
      setActiveDrag({ type, label, color, iconUrl });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDrag(null);
    const { active, over } = event;

    if (over?.id === 'canvas') {
      const { type, label, color, iconUrl } = active.data.current || {};
      if (type) {
        const canvasEl = document.querySelector('.canvas-background');
        if (canvasEl) {
          const rect = canvasEl.getBoundingClientRect();
          const translatedRect = event.active.rect.current.translated;

          if (translatedRect) {
            const state = useCanvasStore.getState();
            const x = (translatedRect.left - rect.left - state.viewport.x) / state.zoom;
            const y = (translatedRect.top - rect.top - state.viewport.y) / state.zoom;

            addNode(type as ComponentType, { x, y }, { label, color, iconUrl });
          }
        }
      }
    }
  };

  const handleContextMenu = (e: React.MouseEvent, nodeId: string) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      nodeId,
    });
  };

  const handleExportPng = useCallback(async () => {
    if (canvasRef) {
      try {
        const dataUrl = await toPng(canvasRef as HTMLElement, {
          backgroundColor: '#0a0a0a',
          pixelRatio: 2,
        });

        const link = document.createElement('a');
        link.download = 'k8s-canvas-diagram.png';
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Export failed:', err);
      }
    }
  }, [canvasRef]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if ((e.target as HTMLElement).tagName === 'INPUT') return;
        const selectedId = useCanvasStore.getState().selectedNodeId;
        if (selectedId) {
          useCanvasStore.getState().deleteNode(selectedId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex w-full h-full overflow-hidden bg-[#0a0a0a]">
        {/* Collapsible Sidebar */}
        <div 
          className={`relative h-full transition-all duration-300 ease-in-out flex-shrink-0 ${
            isSidebarOpen ? 'w-[280px]' : 'w-0'
          }`}
        >
          <div className={`w-[280px] h-full ${!isSidebarOpen ? 'pointer-events-none opacity-0' : 'opacity-100'} transition-opacity duration-200`}>
            <Sidebar />
          </div>
        </div>
        
        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="fixed left-0 top-1/2 -translate-y-1/2 z-[60] bg-gray-900/90 backdrop-blur-md p-2 rounded-r-xl border border-cyan-500/30 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(0,255,255,0.3)] transition-all flex items-center justify-center group"
          style={{ 
            left: isSidebarOpen ? '280px' : '0',
            transition: 'left 0.3s ease-in-out, all 0.2s ease'
          }}
          title={isSidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
        >
          {isSidebarOpen ? (
            <ChevronLeft size={20} className="text-cyan-400 group-hover:scale-110 transition-transform" />
          ) : (
            <ChevronRight size={20} className="text-cyan-400 group-hover:scale-110 transition-transform" />
          )}
        </button>

        {/* Canvas Area */}
        <div className="flex-1 relative overflow-hidden">
          <Canvas onContextMenu={handleContextMenu} />
          
          <Toolbar onExportPng={handleExportPng} ref={canvasRef} />

          {contextMenu && (
            <ContextMenu
              x={contextMenu.x}
              y={contextMenu.y}
              nodeId={contextMenu.nodeId}
              onClose={() => setContextMenu(null)}
            />
          )}

          <HiddenPanel />
        </div>

        <DragOverlay>
          {activeDrag && (
            <GhostComponent type={activeDrag.type} label={activeDrag.label} />
          )}
        </DragOverlay>
      </div>
    </DndContext>
  );
}