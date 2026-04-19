import {
  Square,
  Circle,
  Type,
  Trash2,
  Grid3X3,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-react';
import { useCanvasStore } from '../store/canvasStore';

interface ToolbarProps {
  onExportPng: () => void;
  ref: HTMLDivElement | null;
}

export default function Toolbar({ onExportPng }: ToolbarProps) {
  const {
    selectedNodeId,
    deleteNode,
    clearCanvas,
    addNode,
    zoom,
    setZoom,
    viewport,
    setViewport,
  } = useCanvasStore();

  const handleAddRectangle = () => {
    addNode('rectangle', { x: 300 + Math.random() * 200, y: 200 + Math.random() * 200 });
  };

  const handleAddCircle = () => {
    addNode('circle', { x: 300 + Math.random() * 200, y: 200 + Math.random() * 200 });
  };

  const handleAddText = () => {
    addNode('text', { x: 300 + Math.random() * 200, y: 200 + Math.random() * 200 });
  };

  const handleDelete = () => {
    if (selectedNodeId) {
      deleteNode(selectedNodeId);
    }
  };

  const handleClearCanvas = () => {
    if (confirm('Clear all components from canvas?')) {
      clearCanvas();
    }
  };

  const handleZoomIn = () => {
    const { viewport } = useCanvasStore.getState();
    const newZoom = Math.min(3, zoom * 1.1);

    // Zoom around center of screen
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const newViewportX = centerX - (centerX - viewport.x) * (newZoom / zoom);
    const newViewportY = centerY - (centerY - viewport.y) * (newZoom / zoom);

    setZoom(newZoom);
    setViewport({ x: newViewportX, y: newViewportY });
  };

  const handleZoomOut = () => {
    const { viewport } = useCanvasStore.getState();
    const newZoom = Math.max(0.3, zoom * 0.9);

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const newViewportX = centerX - (centerX - viewport.x) * (newZoom / zoom);
    const newViewportY = centerY - (centerY - viewport.y) * (newZoom / zoom);

    setZoom(newZoom);
    setViewport({ x: newViewportX, y: newViewportY });
  };

  const handleResetView = () => {
    setZoom(1);
    setViewport({ x: 0, y: 0 });
  };

  return (
    <>
      <div className="fixed top-4 right-4 flex gap-2 z-50">
        <button
          onClick={handleAddRectangle}
          className="toolbar-btn"
          title="Add Rectangle"
        >
          <Square size={18} />
        </button>
        <button
          onClick={handleAddCircle}
          className="toolbar-btn"
          title="Add Circle"
        >
          <Circle size={18} />
        </button>
        <button
          onClick={handleAddText}
          className="toolbar-btn"
          title="Add Text"
        >
          <Type size={18} />
        </button>
        <div className="w-px bg-gray-700 mx-1" />
        <button
          onClick={handleDelete}
          disabled={!selectedNodeId}
          className={`toolbar-btn ${!selectedNodeId ? 'opacity-30 cursor-not-allowed' : ''}`}
          title="Delete Selected (Del)"
        >
          <Trash2 size={18} />
        </button>
        <div className="w-px bg-gray-700 mx-1" />
        <button
          onClick={handleClearCanvas}
          className="toolbar-btn"
          title="Clear Canvas"
        >
          <Grid3X3 size={18} />
        </button>
        <button
          onClick={onExportPng}
          className="toolbar-btn"
          title="Export as PNG"
        >
          <Download size={18} />
        </button>
      </div>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 glass-panel rounded-full px-4 py-2 z-50">
        <button
          onClick={handleZoomOut}
          className="zoom-btn"
          title="Zoom Out (Ctrl+Scroll Down)"
        >
          <ZoomOut size={16} />
        </button>
        <span className="text-sm text-cyan-400 min-w-[50px] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={handleZoomIn}
          className="zoom-btn"
          title="Zoom In (Ctrl+Scroll Up)"
        >
          <ZoomIn size={16} />
        </button>
        <div className="w-px h-6 bg-gray-700" />
        <button
          onClick={handleResetView}
          className="zoom-btn"
          title="Reset View (0)"
        >
          <RotateCcw size={16} />
        </button>
        <span className="text-xs text-gray-500 ml-2">
          Left Click + Drag Background to Pan
        </span>
      </div>
    </>
  );
}