import { useDraggable } from '@dnd-kit/core';
import { HardDrive, Database, FileText, Zap, Cloud, LucideIcon } from 'lucide-react';
import { SIDEBAR_ITEMS, ComponentType } from '../types';

const iconMap: Record<string, LucideIcon> = {
  'hard-drive': HardDrive,
  database: Database,
  'file-text': FileText,
  zap: Zap,
  cloud: Cloud,
};

interface DraggableItemProps {
  id: string;
  type: ComponentType;
  label: string;
  description?: string;
  color: string;
}

function DraggableSidebarItem({ id, type, label, description, color }: DraggableItemProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    data: { type, label, isFromSidebar: true },
  });

  const Icon = iconMap[id] || HardDrive;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`sidebar-item flex items-center gap-3 p-3 rounded-lg mb-2 ${
        isDragging ? 'opacity-50' : ''
      }`}
      style={{ borderLeft: `3px solid ${color}` }}
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
        {description && (
          <div className="text-xs text-gray-500 truncate">{description}</div>
        )}
      </div>
    </div>
  );
}

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-full w-[280px] glass-panel z-50 flex flex-col">
      <div className="p-5">
        <h2
          className="text-xl font-bold tracking-wider text-red-500 title-underline"
          style={{ fontFamily: "'Orbitron', sans-serif" }}
        >
          COMPONENTS
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {SIDEBAR_ITEMS.map((item) => (
          <DraggableSidebarItem key={item.id} {...item} />
        ))}
      </div>
      <div className="p-4 border-t border-gray-800">
        <p className="text-xs text-gray-600 text-center">
          Drag components to canvas
        </p>
      </div>
    </aside>
  );
}