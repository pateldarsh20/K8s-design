import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CanvasNode, Connection, ComponentType, Position } from '../types';

interface CanvasStore {
  nodes: CanvasNode[];
  connections: Connection[];
  selectedNodeId: string | null;
  transform: Position;
  viewport: Position;
  zoom: number;
  gridSize: number;
  connectingFrom: { nodeId: string; handle: string } | null;

  addNode: (type: ComponentType, position: Position, initialData?: Partial<CanvasNode['data']>) => string;
  updateNode: (id: string, updates: Partial<CanvasNode>) => void;
  deleteNode: (id: string) => void;
  selectNode: (id: string | null) => void;
  setNodes: (nodes: CanvasNode[]) => void;

  addConnection: (sourceId: string, targetId: string, sourceHandle: string, targetHandle: string) => void;
  deleteConnection: (id: string) => void;
  setConnections: (connections: Connection[]) => void;

  setTransform: (transform: Position) => void;
  setViewport: (viewport: Position) => void;
  setZoom: (zoom: number) => void;
  setGridSize: (gridSize: number) => void;
  setConnectingFrom: (connectingFrom: { nodeId: string; handle: string } | null) => void;

  snapToGrid: (position: Position) => Position;
  screenToCanvas: (screenX: number, screenY: number, canvasRect: DOMRect) => Position;
  canvasToScreen: (canvasX: number, canvasY: number, canvasRect: DOMRect) => Position;

  clearCanvas: () => void;
  loadFromLocalStorage: () => void;
}

const generateId = () => `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const generateConnId = () => `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useCanvasStore = create<CanvasStore>()(
  persist(
    (set, get) => ({
      nodes: [],
      connections: [],
      selectedNodeId: null,
      transform: { x: 0, y: 0 },
      viewport: { x: 0, y: 0 },
      zoom: 1,
      gridSize: 20,
      connectingFrom: null,

      addNode: (type, position, initialData) => {
        const gridSize = get().gridSize;
        const id = generateId();
        const snappedPos = {
          x: Math.round(position.x / gridSize) * gridSize,
          y: Math.round(position.y / gridSize) * gridSize,
        };
        const newNode: CanvasNode = {
          id,
          type,
          position: snappedPos,
          width: type === 'circle' ? 120 : type === 'text' ? 200 : type === 'rectangle' ? 140 : 160,
          height: type === 'circle' ? 120 : type === 'text' ? 40 : 80,
          data: {
            label: initialData?.label || (type.charAt(0).toUpperCase() + type.slice(1).replace('objectstorage', 'Object Storage')),
            originalName: initialData?.label || type,
            color: initialData?.color || undefined,
            iconUrl: initialData?.iconUrl || undefined,
            isTransparent: true,
          },
        };
        set({ nodes: [...get().nodes, newNode] });
        return id;
      },

      updateNode: (id, updates) => {
        if (updates.position) {
          const gridSize = get().gridSize;
          updates.position = {
            x: Math.round(updates.position.x / gridSize) * gridSize,
            y: Math.round(updates.position.y / gridSize) * gridSize,
          };
        }
        set({
          nodes: get().nodes.map((node) =>
            node.id === id ? { ...node, ...updates } : node
          ),
        });
      },

      deleteNode: (id) => {
        set({
          nodes: get().nodes.filter((node) => node.id !== id),
          connections: get().connections.filter(
            (conn) => conn.sourceId !== id && conn.targetId !== id
          ),
          selectedNodeId: get().selectedNodeId === id ? null : get().selectedNodeId,
        });
      },

      selectNode: (id) => {
        set({ selectedNodeId: id });
      },

      setNodes: (nodes) => {
        set({ nodes });
      },

      addConnection: (sourceId, targetId, sourceHandle, targetHandle) => {
        const existingConnection = get().connections.find(
          (conn) =>
            (conn.sourceId === sourceId && conn.targetId === targetId) ||
            (conn.sourceId === targetId && conn.targetId === sourceId)
        );
        if (existingConnection || sourceId === targetId) return;

        const newConnection: Connection = {
          id: generateConnId(),
          sourceId,
          targetId,
          sourceHandle,
          targetHandle,
        };
        set({ connections: [...get().connections, newConnection] });
      },

      deleteConnection: (id) => {
        set({ connections: get().connections.filter((conn) => conn.id !== id) });
      },

      setConnections: (connections) => {
        set({ connections });
      },

      setTransform: (transform) => {
        set({ transform });
      },

      setViewport: (viewport) => {
        set({ viewport });
      },

      setZoom: (zoom) => {
        set({ zoom: Math.max(0.5, Math.min(3, zoom)) });
      },

      setGridSize: (gridSize) => {
        set({ gridSize });
      },

      setConnectingFrom: (connectingFrom) => {
        set({ connectingFrom });
      },

      snapToGrid: (position) => {
        const gridSize = get().gridSize;
        return {
          x: Math.round(position.x / gridSize) * gridSize,
          y: Math.round(position.y / gridSize) * gridSize,
        };
      },

      screenToCanvas: (screenX, screenY, canvasRect) => {
        const { viewport, zoom } = get();
        return {
          x: (screenX - canvasRect.left - viewport.x) / zoom,
          y: (screenY - canvasRect.top - viewport.y) / zoom,
        };
      },

      canvasToScreen: (canvasX, canvasY, canvasRect) => {
        const { viewport, zoom } = get();
        return {
          x: canvasX * zoom + viewport.x + canvasRect.left,
          y: canvasY * zoom + viewport.y + canvasRect.top,
        };
      },

      clearCanvas: () => {
        set({ nodes: [], connections: [], selectedNodeId: null });
      },

      loadFromLocalStorage: () => {
        // Handled by persist middleware
      },
    }),
    {
      name: 'k8s-canvas-storage',
      partialize: (state) => ({
        nodes: state.nodes,
        connections: state.connections,
      }),
    }
  )
);