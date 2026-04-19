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
  const { deleteNode, nodes, addNode } = useCanvasStore();

  const node = nodes.find((n) => n.id === nodeId);

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

  React.useEffect(() => {
    const handleClickOutside = () => onClose();
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [onClose]);

  return (
    <div
      className="context-menu"
      style={{ left: x, top: y }}
      onClick={(e) => e.stopPropagation()}
    >
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