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

function GhostComponent({ type, label }: { type: ComponentType; label: string }) {
  const color = COMPONENT_COLORS[type];
  const Icon = iconMap[type] || Square;

  return (
    <div
      className="sidebar-item flex items-center gap-3 p-3 rounded-lg"
      style={{
        borderLeft: `3px solid ${color}`,
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
        className="w-10 h-10 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: `${color}20`, color }}
      >
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <div
          className="font-semibold text-sm truncate"
          style={{ color, textShadow: `0 0 8px ${color}50` }}
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
  } | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    nodeId: string;
  } | null>(null);

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
    const { type, label } = event.active.data.current || {};
    if (type) {
      setActiveDrag({ type, label });
    }
  };

const handleDragEnd = (event: DragEndEvent) => {
    setActiveDrag(null);
    const { active, over } = event;

    if (over?.id === 'canvas') {
      const { type } = active.data.current || {};
      if (type) {
        const canvasEl = document.querySelector('.canvas-background');
        if (canvasEl) {
          const rect = canvasEl.getBoundingClientRect();
          const translatedRect = event.active.rect.current.translated;
          
          if (translatedRect) {
            const state = useCanvasStore.getState();
            const x = (translatedRect.left - rect.left - state.viewport.x) / state.zoom;
            const y = (translatedRect.top - rect.top - state.viewport.y) / state.zoom;

            addNode(type as ComponentType, { x, y });
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
      <div className="relative w-full h-full overflow-hidden">
        <Sidebar />

        <div className="absolute inset-0 ml-[280px] overflow-hidden">
          <Canvas onContextMenu={handleContextMenu} />
        </div>

        <Toolbar onExportPng={handleExportPng} ref={canvasRef} />

        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            nodeId={contextMenu.nodeId}
            onClose={() => setContextMenu(null)}
          />
        )}

        <DragOverlay>
          {activeDrag && (
            <GhostComponent type={activeDrag.type} label={activeDrag.label} />
          )}
        </DragOverlay>
      </div>
    </DndContext>
  );
}