import React from 'react';
import { COMPONENT_COLORS, ComponentType, NODE_SIZES } from '../types';
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

interface DraggableComponentProps {
  id: string;
  type: ComponentType;
  label: string;
}

export default function DraggableComponent({
  id,
  type,
  label,
}: DraggableComponentProps) {
  const color = COMPONENT_COLORS[type];
  const size = NODE_SIZES[type];
  const Icon = iconMap[type] || Square;
  const isCircle = type === 'circle';
  const isText = type === 'text';

  return (
    <div
      data-dnd-item
      data-id={id}
      data-type={type}
      data-label={label}
      className={`canvas-node absolute ${isCircle ? 'circle-node' : ''}`}
      style={{
        width: size.width,
        height: size.height,
        backgroundColor: 'rgba(10, 10, 10, 0.9)',
        border: `1px solid ${color}`,
        borderRadius: isCircle ? '50%' : isText ? '8px' : '16px',
        boxShadow: `0 0 12px ${color}40`,
        cursor: 'grab',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: isText ? 0 : 8,
        padding: isText ? '8px 16px' : '12px',
        opacity: 1,
      }}
    >
      {!isText && (
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}20`, color }}
        >
          <Icon size={16} />
        </div>
      )}
      <span
        className="text-sm font-medium"
        style={{
          color,
          textShadow: `0 0 8px ${color}80`,
          fontSize: isText ? '14px' : '13px',
        }}
      >
        {label}
      </span>
    </div>
  );
}