import React from 'react';
import { Trash2, Copy } from 'lucide-react';
import { useCanvasStore } from '../store/canvasStore';

interface ContextMenuProps {
  x: number;
  y: number;
  nodeId: string;
  onClose: () => void;
}

export default function ContextMenu({ x, y, nodeId, onClose }: ContextMenuProps) {
  const { deleteNode, nodes, addNode, updateNode } = useCanvasStore();

  const node = nodes.find((n) => n.id === nodeId);

  const presetColors = [
    { name: 'Neon Blue', hex: '#3b82f6' },
    { name: 'Neon Cyan', hex: '#06b6d4' },
    { name: 'Neon Green', hex: '#10b981' },
    { name: 'Neon Purple', hex: '#8b5cf6' },
    { name: 'Neon Orange', hex: '#f59e0b' },
    { name: 'Neon Pink', hex: '#ec4899' },
    { name: 'Neon Yellow', hex: '#eab308' },
    { name: 'Neon Red', hex: '#ef4444' },
    { name: 'White', hex: '#ffffff' },
  ];

  const fillColors = [
    { name: 'No Fill / Transparent', hex: 'rgba(0,0,0,0)', css: 'bg-[url("data:image/svg+xml;utf8,<svg viewBox=%220 0 10 10%22 xmlns=%22http://www.w3.org/2000/svg%22><line x1=%220%22 y1=%2210%22 x2=%2210%22 y2=%220%22 stroke=%22red%22 stroke-width=%221%22/></svg>")] bg-cover' },
    { name: 'Glass Blue', hex: 'rgba(59,130,246,0.3)', css: 'bg-[#3b82f64d]' },
    { name: 'Glass Cyan', hex: 'rgba(6,182,212,0.3)', css: 'bg-[#06b6d44d]' },
    { name: 'Glass Green', hex: 'rgba(16,185,129,0.3)', css: 'bg-[#10b9814d]' },
    { name: 'Glass Purple', hex: 'rgba(139,92,246,0.3)', css: 'bg-[#8b5cf64d]' },
    { name: 'Glass Pink', hex: 'rgba(236,72,153,0.3)', css: 'bg-[#ec48994d]' },
    { name: 'Glass Orange', hex: 'rgba(245,158,11,0.3)', css: 'bg-[#f59e0b4d]' },
    { name: 'Glass Yellow', hex: 'rgba(234,179,8,0.25)', css: 'bg-[#eab30840]' },
    { name: 'Glass Red', hex: 'rgba(239,68,68,0.3)', css: 'bg-[#ef44444d]' },
  ];

  const handleDelete = () => {
    deleteNode(nodeId);
    onClose();
  };

  const handleDuplicate = () => {
    if (node) {
      addNode(node.type, {
        x: node.position.x + 30,
        y: node.position.y + 30,
      });
    }
    onClose();
  };

  const handleColorChange = (hex: string) => {
    if (node) {
      updateNode(node.id, { data: { ...node.data, color: hex } });
    }
  };

  const handleFillColorChange = (rgba: string) => {
    if (node) {
      updateNode(node.id, { data: { ...node.data, fillColor: rgba } });
    }
  };

  const handleTransparentToggle = () => {
    if (node) {
      const isTransparent = node.data.isTransparent !== false;
      updateNode(node.id, { data: { ...node.data, isTransparent: !isTransparent } });
    }
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (node) {
      updateNode(node.id, { data: { ...node.data, color: e.target.value } });
    }
  };

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if ((e.target as Element).closest('.context-menu')) return;
      onClose();
    };
    setTimeout(() => document.addEventListener('click', handleClickOutside), 10);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [onClose]);

  if (!node) return null;
  const currentColor = node.data.color || '#6b7280';
  const currentFill = node.data.fillColor || 'rgba(0,0,0,0)';
  const isTransparent = node.data.isTransparent !== false;
  const isContainer = node.type === 'rectangle' || node.type === 'circle';

  return (
    <div
      className="context-menu flex flex-col min-w-[200px]"
      style={{ left: x, top: y }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-2 border-b border-gray-800 mb-1">
        <div className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wider">🎨 Change Color</div>
        <div className="flex flex-wrap gap-2 mb-3">
          {presetColors.map((c) => (
            <button
              key={c.hex}
              className={`w-6 h-6 rounded-full border-2 ${currentColor === c.hex ? 'border-white' : 'border-transparent'}`}
              style={{ backgroundColor: c.hex, boxShadow: `0 0 8px ${c.hex}80` }}
              title={c.name}
              onClick={() => handleColorChange(c.hex)}
            />
          ))}
        </div>
        
        {isContainer && (
          <>
            <div className="text-xs text-gray-400 mb-2 mt-4 font-semibold uppercase tracking-wider">🖌️ Fill Color</div>
            <div className="flex flex-wrap gap-2 mb-3">
              {fillColors.map((c) => (
                <button
                  key={c.name}
                  className={`w-6 h-6 rounded-full border-2 ${currentFill === c.hex ? 'border-white' : 'border-gray-700'} ${c.css}`}
                  title={c.name}
                  onClick={() => handleFillColorChange(c.hex)}
                />
              ))}
            </div>
          </>
        )}
        
        <label className="flex items-center gap-2 text-sm cursor-pointer mb-3 hover:text-white text-gray-300">
          <input 
            type="checkbox" 
            checked={isTransparent}
            onChange={handleTransparentToggle}
            className="rounded bg-gray-900 border-gray-600 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-gray-900"
          />
          Glass / Transparent
        </label>
        
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <input 
            type="color" 
            value={currentColor}
            onChange={handleCustomColorChange}
            className="w-6 h-6 rounded cursor-pointer bg-transparent border-0 p-0"
          />
          <span>Custom Color</span>
        </div>
      </div>

      <div className="context-menu-item" onClick={handleDuplicate}>
        <Copy size={14} />
        <span>Duplicate</span>
      </div>
      <div className="context-menu-item danger" onClick={handleDelete}>
        <Trash2 size={14} />
        <span>Delete</span>
      </div>
    </div>
  );
}