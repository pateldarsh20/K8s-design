export type ComponentType = string;

export interface Position {
  x: number;
  y: number;
}

export interface CanvasNode {
  id: string;
  type: ComponentType;
  position: Position;
  width: number;
  height: number;
  data: {
    label: string;
    description?: string;
    customText?: string;
    color?: string;
    iconUrl?: string;
  };
}

export interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  sourceHandle: string;
  targetHandle: string;
}

export interface CanvasState {
  nodes: CanvasNode[];
  connections: Connection[];
  selectedNodeId: string | null;
  transform: Position;
  zoom: number;
}

export interface SidebarItem {
  id: string;
  type: ComponentType;
  name?: string;
  label: string;
  description?: string;
  icon?: string;
  iconUrl?: string;
  category?: string;
  color: string;
}

export const COMPONENT_COLORS: Record<string, string> = {
  rectangle: '#00ffff',
  circle: '#00ffff',
  text: '#ffffff',
};

export const NODE_SIZES: Record<string, { width: number; height: number }> = {
  rectangle: { width: 140, height: 80 },
  circle: { width: 120, height: 120 },
  text: { width: 200, height: 40 },
};