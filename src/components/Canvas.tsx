import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useCanvasStore } from '../store/canvasStore';
import { COMPONENT_COLORS, NODE_SIZES, CanvasNode, Position } from '../types';
import { getHandlePosition, calculateConnectionPath } from '../utils/connectionUtils';
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
  Edit2,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  storage: HardDrive,
  database: Database,
  nosql: FileText,
  cache: Zap,
  objectstorage: Cloud,
  rectangle: Square,
  circle: Circle,
  text: Type,
};

interface HandleProps {
  position: 'top' | 'bottom' | 'left' | 'right';
  node: CanvasNode;
  onConnectionStart: (nodeId: string, handle: string, pos: Position) => void;
}

function ConnectionHandle({ position, node, onConnectionStart }: HandleProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const size = NODE_SIZES[node.type];
    const width = node.width || size.width;
    const height = node.height || size.height;

    let pos: Position;
    switch (position) {
      case 'top': pos = { x: node.position.x + width / 2, y: node.position.y }; break;
      case 'bottom': pos = { x: node.position.x + width / 2, y: node.position.y + height }; break;
      case 'left': pos = { x: node.position.x, y: node.position.y + height / 2 }; break;
      case 'right': pos = { x: node.position.x + width, y: node.position.y + height / 2 }; break;
      default: pos = { x: node.position.x + width / 2, y: node.position.y + height / 2 };
    }

    onConnectionStart(node.id, position, pos);
  };

  const getStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'absolute',
      width: '10px',
      height: '10px',
      borderRadius: '50%',
      backgroundColor: '#00ffff',
      border: '2px solid #ffffff',
      boxShadow: isHovered ? '0 0 12px #00ffff, 0 0 24px #00ffff' : '0 0 6px #00ffff',
      cursor: 'crosshair',
      zIndex: 100,
      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      pointerEvents: 'all',
    };

    switch (position) {
      case 'top': return { ...base, left: '50%', top: '-5px', transform: isHovered ? 'translateX(-50%) scale(1.3)' : 'translateX(-50%)' };
      case 'bottom': return { ...base, left: '50%', bottom: '-5px', transform: isHovered ? 'translateX(-50%) scale(1.3)' : 'translateX(-50%)' };
      case 'left': return { ...base, left: '-5px', top: '50%', transform: isHovered ? 'translateY(-50%) scale(1.3)' : 'translateY(-50%)' };
      case 'right': return { ...base, right: '-5px', top: '50%', transform: isHovered ? 'translateY(-50%) scale(1.3)' : 'translateY(-50%)' };
    }
    return base;
  };

  return (
    <div
      className="connection-point"
      style={getStyle()}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    />
  );
}

interface NodeComponentProps {
  node: CanvasNode;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onContextMenu: (e: React.MouseEvent, nodeId: string) => void;
  onConnectionStart: (nodeId: string, handle: string, pos: Position) => void;
  viewport: Position;
  zoom: number;
}

function CanvasNodeComponent({
  node,
  isSelected,
  onSelect,
  onMove,
  onContextMenu,
  onConnectionStart,
  viewport,
  zoom,
}: NodeComponentProps) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [dragInfo, setDragInfo] = useState<{ startX: number; startY: number; initialNodeX: number; initialNodeY: number } | null>(null);
  const [resizeInfo, setResizeInfo] = useState<{ startX: number; startY: number; initialWidth: number; initialHeight: number } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(node.data.customName || node.data.label);
  const updateNode = useCanvasStore((state) => state.updateNode);

  const color = node.data.color || COMPONENT_COLORS[node.type];
  const size = NODE_SIZES[node.type];
  const isCircle = node.type === 'circle';
  const isText = node.type === 'text';
  const isContainer = node.type === 'rectangle' || node.type === 'circle';

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('.connection-point') || target.closest('.resizer')) return;

    if (isContainer) {
      if (target.closest('.shape-border') || target.closest('.text-box')) {
        e.stopPropagation();
        e.preventDefault();
        onSelect(node.id);
        setDragInfo({ startX: e.clientX, startY: e.clientY, initialNodeX: node.position.x, initialNodeY: node.position.y });
      }
      return;
    }

    e.stopPropagation();
    e.preventDefault();
    onSelect(node.id);
    setDragInfo({ startX: e.clientX, startY: e.clientY, initialNodeX: node.position.x, initialNodeY: node.position.y });
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onSelect(node.id);
    setResizeInfo({
      startX: e.clientX,
      startY: e.clientY,
      initialWidth: node.width || size.width,
      initialHeight: node.height || size.height,
    });
  };

  useEffect(() => {
    if (!dragInfo) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = (e.clientX - dragInfo.startX) / zoom;
      const dy = (e.clientY - dragInfo.startY) / zoom;
      onMove(node.id, dragInfo.initialNodeX + dx, dragInfo.initialNodeY + dy);
    };

    const handleMouseUp = () => setDragInfo(null);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragInfo, node.id, onMove, zoom]);

  useEffect(() => {
    if (!resizeInfo) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = (e.clientX - resizeInfo.startX) / zoom;
      const dy = (e.clientY - resizeInfo.startY) / zoom;
      updateNode(node.id, {
        width: Math.max(100, resizeInfo.initialWidth + dx),
        height: Math.max(100, resizeInfo.initialHeight + dy),
      });
    };

    const handleMouseUp = () => setResizeInfo(null);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizeInfo, node.id, updateNode, zoom]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleTextSubmit = () => {
    updateNode(node.id, { data: { ...node.data, customName: editText } });
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleTextSubmit();
    else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditText(node.data.customName || node.data.label);
    }
  };

  const Icon = iconMap[node.type] || Square;

  const [isHovered, setIsHovered] = useState(false);
  const isTransparent = node.data.isTransparent !== false;

  let backgroundColor = 'rgba(20, 20, 20, 0.95)';
  let backdropFilter = 'none';

  if (isContainer) {
    backgroundColor = 'transparent';
    backdropFilter = isTransparent ? 'blur(8px)' : 'none';
  } else if (isTransparent) {
    backgroundColor = 'rgba(15, 25, 45, 0.5)';
    backdropFilter = 'blur(8px)';
  }

  const shapeFill = node.data.fillColor || 'transparent';

  return (
    <div
      ref={nodeRef}
      className={`canvas-node absolute ${isCircle ? 'circle-node' : ''} ${isSelected && !isContainer ? 'selected' : ''} ${!isContainer && !isText ? 'k8s-component' : ''} group`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        left: node.position.x,
        top: node.position.y,
        width: node.width || size.width,
        height: node.height || size.height,
        backgroundColor,
        backdropFilter,
        WebkitBackdropFilter: backdropFilter,
        border: 'none',
        borderLeft: !isContainer && !isText ? `3px solid ${color}` : undefined,
        borderTop: !isContainer && !isText ? '1px solid rgba(255, 255, 255, 0.05)' : undefined,
        borderRight: !isContainer && !isText ? '1px solid rgba(255, 255, 255, 0.05)' : undefined,
        borderBottom: !isContainer && !isText ? '1px solid rgba(255, 255, 255, 0.05)' : undefined,
        borderRadius: isCircle ? '50%' : '8px',
        pointerEvents: isContainer ? 'none' : 'auto',
        boxShadow: isSelected && !isContainer
          ? `0 0 24px ${color}80, 0 0 48px ${color}40`
          : isContainer ? 'none' : isTransparent ? `0 0 15px ${color}4d` : `0 10px 25px rgba(0, 0, 0, 0.5)`,
        cursor: dragInfo ? 'grabbing' : 'move',
        display: 'flex',
        flexDirection: isContainer ? 'column' : 'row',
        alignItems: isContainer ? 'flex-start' : 'center',
        justifyContent: isContainer ? 'flex-start' : 'flex-start',
        gap: isText || isContainer ? 0 : 12,
        padding: isText ? '8px 16px' : isContainer ? '12px' : '12px',
        transition: dragInfo || resizeInfo ? 'none' : 'all 0.2s ease',
        zIndex: isContainer ? 0 : (dragInfo ? 1000 : 10),
        position: 'absolute',
      }}
      id={`node-${node.id}`}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onContextMenu={(e) => {
        e.preventDefault();
        onContextMenu(e, node.id);
      }}
    >
      {isContainer && (
        <svg
          width="100%"
          height="100%"
          style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none' }}
        >
          {isCircle ? (
            <>
              {/* Interior */}
              <circle
                cx="50%"
                cy="50%"
                r="50%"
                fill={shapeFill}
                stroke="none"
                style={{ pointerEvents: 'fill' }}
                className="shape-interior"
              />
              {/* Border */}
              <circle
                cx="50%"
                cy="50%"
                r="50%"
                fill="transparent"
                stroke={isSelected ? '#ffaa00' : color}
                strokeWidth={isSelected ? 4 : 3}
                className={`shape-border ${isSelected ? 'selected' : ''}`}
                style={{ pointerEvents: 'stroke', cursor: 'move' }}
              />
            </>
          ) : (
            <>
              {/* Interior */}
              <rect
                width="100%"
                height="100%"
                rx="8"
                fill={shapeFill}
                stroke="none"
                style={{ pointerEvents: 'fill' }}
                className="shape-interior"
              />
              {/* Border */}
              <rect
                width="100%"
                height="100%"
                rx="8"
                fill="transparent"
                stroke={isSelected ? '#ffaa00' : color}
                strokeWidth={isSelected ? 4 : 3}
                className={`shape-border ${isSelected ? 'selected' : ''}`}
                style={{ pointerEvents: 'stroke', cursor: 'move' }}
              />
            </>
          )}
        </svg>
      )}

      {!isText && !isContainer && (
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 p-1 bg-white/5"
          style={{ color }}
        >
          {node.data.iconUrl ? (
            <img src={node.data.iconUrl} alt={node.data.label} className="w-full h-full object-contain" />
          ) : (
            <Icon size={20} />
          )}
        </div>
      )}

      <div
        className={`flex-1 min-w-0 ${isContainer ? 'w-full' : ''}`}
        style={{ pointerEvents: isContainer ? 'none' : 'inherit', zIndex: 10, position: 'relative' }}
      >
        {isEditing ? (
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleTextSubmit}
            onKeyDown={handleKeyDown}
            className="editable-text-input w-full bg-transparent outline-none"
            autoFocus
            style={{
              color,
              textAlign: isContainer ? 'left' : 'center',
              fontSize: isText ? '14px' : '13px',
              pointerEvents: 'auto'
            }}
          />
        ) : (
          <div
            className={`text-box font-semibold text-sm truncate flex items-center justify-${isContainer ? 'start' : isText ? 'center' : 'start'} gap-2 ${isContainer ? 'opacity-70' : ''}`}
            style={{
              color,
              textShadow: `0 0 8px ${color}50`,
              fontSize: isText ? '14px' : '13px',
              cursor: 'text',
              pointerEvents: 'auto'
            }}
            onDoubleClick={handleDoubleClick}
          >
            <span>{node.data.customName || node.data.label}</span>
            {isHovered && !isContainer && (
              <Edit2
                size={12}
                className="opacity-50 hover:opacity-100 cursor-pointer transition-opacity shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
              />
            )}
          </div>
        )}
      </div>

      {isContainer && isSelected && (
        <div
          className="resizer absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-transparent"
          style={{
            borderRight: `3px solid ${isSelected ? '#ffaa00' : color}`,
            borderBottom: `3px solid ${isSelected ? '#ffaa00' : color}`,
            borderBottomRightRadius: isCircle ? '0' : '8px',
            pointerEvents: 'auto'
          }}
          onMouseDown={handleResizeStart}
        />
      )}

      {!isText && !isContainer && (
        <>
          <ConnectionHandle
            position="top"
            node={node}
            onConnectionStart={onConnectionStart}
          />
          <ConnectionHandle
            position="bottom"
            node={node}
            onConnectionStart={onConnectionStart}
          />
          <ConnectionHandle
            position="left"
            node={node}
            onConnectionStart={onConnectionStart}
          />
          <ConnectionHandle
            position="right"
            node={node}
            onConnectionStart={onConnectionStart}
          />
        </>
      )}
    </div>
  );
}

interface ConnectionLineProps {
  sourceNode: CanvasNode;
  targetNode: CanvasNode;
  sourceHandle: string;
  targetHandle: string;
  connectionId: string;
}

function ConnectionLineComponent({
  sourceNode,
  targetNode,
  sourceHandle,
  targetHandle,
  connectionId,
}: ConnectionLineProps) {
  const sourceSize = NODE_SIZES[sourceNode.type];
  const targetSize = NODE_SIZES[targetNode.type];

  const sourcePos = getHandlePosition(
    sourceNode.position.x,
    sourceNode.position.y,
    sourceNode.width || sourceSize.width,
    sourceNode.height || sourceSize.height,
    sourceHandle
  );

  const targetPos = getHandlePosition(
    targetNode.position.x,
    targetNode.position.y,
    targetNode.width || targetSize.width,
    targetNode.height || targetSize.height,
    targetHandle
  );

  const midX = (sourcePos.x + targetPos.x) / 2;
  const midY = (sourcePos.y + targetPos.y) / 2;

  const deleteConnection = useCanvasStore((state) => state.deleteConnection);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <g
      className="connection-line-group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <defs>
        <filter id="connectionGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <path
        d={calculateConnectionPath(sourcePos, targetPos, sourceHandle, targetHandle)}
        stroke="transparent"
        strokeWidth="20"
        fill="none"
        style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
      />

      <path
        d={calculateConnectionPath(sourcePos, targetPos, sourceHandle, targetHandle)}
        stroke="#00ffff"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        filter="url(#connectionGlow)"
        style={{
          strokeDasharray: '8 8',
          animation: 'flowDash 0.5s linear infinite',
          pointerEvents: 'none'
        }}
      />

      {isHovered && (
        <g
          style={{ cursor: 'pointer', pointerEvents: 'all' }}
          onClick={(e) => {
            e.stopPropagation();
            deleteConnection(connectionId);
          }}
        >
          <circle
            cx={midX}
            cy={midY}
            r={12}
            fill="rgba(255, 50, 50, 0.9)"
            stroke="#ff3333"
            strokeWidth={2}
          />
          <text
            x={midX}
            y={midY + 4}
            textAnchor="middle"
            fontSize="14"
            fill="#ffffff"
            fontWeight="bold"
          >
            ×
          </text>
        </g>
      )}
    </g>
  );
}

interface CanvasProps {
  onContextMenu: (e: React.MouseEvent, nodeId: string) => void;
}

export default function Canvas({ onContextMenu }: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [connectingFrom, setConnectingFrom] = useState<{
    nodeId: string;
    handle: string;
    pos: Position;
  } | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [spacePressed, setSpacePressed] = useState(false);

  const {
    nodes,
    connections,
    selectedNodeId,
    selectNode,
    updateNode,
    addConnection,
    zoom,
    viewport,
    setViewport,
    setZoom,
  } = useCanvasStore();

  const { setNodeRef, isOver } = useDroppable({ id: 'canvas' });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        setSpacePressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setSpacePressed(false);
        setIsPanning(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;

    // Prevent panning if clicking the connection delete button
    if (target.closest('.connection-line-group text') || target.closest('.connection-line-group circle')) {
      return;
    }

    // Since we rely on e.stopPropagation() in child interactive elements (nodes, connection handles),
    // any mousedown that bubbles up to here should trigger canvas panning and deselect nodes.
    selectNode(null);
    setConnectingFrom(null);

    if (e.button === 1 || e.button === 2 || e.button === 0) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning) {
        const dx = e.clientX - panStart.x;
        const dy = e.clientY - panStart.y;
        setViewport({
          x: viewport.x + dx,
          y: viewport.y + dy,
        });
        setPanStart({ x: e.clientX, y: e.clientY });
      } else if (connectingFrom) {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          setMousePos({
            x: (e.clientX - rect.left - viewport.x) / zoom,
            y: (e.clientY - rect.top - viewport.y) / zoom
          });
        }
      }
    },
    [connectingFrom, isPanning, panStart, viewport, zoom, setViewport]
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    setConnectingFrom(null);
  }, []);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.min(3, Math.max(0.3, zoom * delta));

    const newViewportX = mouseX - (mouseX - viewport.x) * (newZoom / zoom);
    const newViewportY = mouseY - (mouseY - viewport.y) * (newZoom / zoom);

    setZoom(newZoom);
    setViewport({ x: newViewportX, y: newViewportY });
  };

  const connectionStart = (nodeId: string, handle: string, pos: Position) => {
    setConnectingFrom({ nodeId, handle, pos });
  };

  const handleNodeMove = useCallback(
    (id: string, x: number, y: number) => {
      updateNode(id, { position: { x, y } });
    },
    [updateNode]
  );

  const connectionLines = connections.map((conn) => {
    const sourceNode = nodes.find((n) => n.id === conn.sourceId);
    const targetNode = nodes.find((n) => n.id === conn.targetId);
    if (!sourceNode || !targetNode || sourceNode.data.isHidden || targetNode.data.isHidden) return null;

    return (
      <ConnectionLineComponent
        key={conn.id}
        sourceNode={sourceNode}
        targetNode={targetNode}
        sourceHandle={conn.sourceHandle}
        targetHandle={conn.targetHandle}
        connectionId={conn.id}
      />
    );
  });

  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${zoom})`,
    transformOrigin: '0 0',
    cursor: isPanning ? 'grabbing' : 'default',
  };

  return (
    <div
      ref={containerRef}
      className="canvas-background"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onContextMenu={(e) => e.preventDefault()}
      style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255, 50, 50, 0.3) 1px, transparent 1px)',
        backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
        backgroundPosition: `${viewport.x}px ${viewport.y}px`,
        backgroundColor: '#0a0a0a',
      }}
    >
      <style>{`
        @keyframes flowDash {
          from {
            stroke-dashoffset: 16;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>

      <div
        className="canvas-content"
        style={containerStyle}
      >
        <div ref={setNodeRef} className="absolute inset-0">
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ overflow: 'visible', zIndex: 5 }}
          >
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {connectionLines}
            {connectingFrom && (
              <path
                d={calculateConnectionPath(connectingFrom.pos, mousePos, connectingFrom.handle, 'left')}
                stroke="#00ffff"
                strokeWidth="2"
                fill="none"
                filter="url(#glow)"
                style={{
                  opacity: 0.6,
                  strokeDasharray: '8 8',
                  animation: 'flowDash 0.5s linear infinite',
                }}
              />
            )}
          </svg>

          {nodes.filter(n => !n.data.isHidden).map((node) => (
            <CanvasNodeComponent
              key={node.id}
              node={node}
              isSelected={selectedNodeId === node.id}
              onSelect={selectNode}
              onMove={handleNodeMove}
              onContextMenu={onContextMenu}
              onConnectionStart={connectionStart}
              viewport={viewport}
              zoom={zoom}
            />
          ))}

          {connectingFrom &&
            nodes.filter(n => !n.data.isHidden).map((node) => {
              if (node.id === connectingFrom.nodeId) return null;
              if (node.type === 'circle' || node.type === 'rectangle') return null;

              const nodeSize = NODE_SIZES[node.type];
              const width = node.width || nodeSize.width;
              const height = node.height || nodeSize.height;

              return (
                <div
                  key={node.id}
                  className="absolute connection-target border-2 border-transparent hover:border-[#00ff00] hover:bg-[#00ff00]/10 transition-all"
                  style={{
                    left: node.position.x,
                    top: node.position.y,
                    width: width,
                    height: height,
                    borderRadius: node.type === 'circle' ? '50%' : '16px',
                    pointerEvents: 'all',
                    cursor: 'crosshair',
                    zIndex: 50,
                  }}
                  onMouseUp={(e) => {
                    e.stopPropagation();

                    const rect = e.currentTarget.getBoundingClientRect();
                    const container = containerRef.current?.getBoundingClientRect();
                    if (!container) return;

                    const state = useCanvasStore.getState();
                    const mouseX = (e.clientX - container.left - state.viewport.x) / state.zoom;
                    const mouseY = (e.clientY - container.top - state.viewport.y) / state.zoom;

                    const relX = mouseX - node.position.x;
                    const relY = mouseY - node.position.y;

                    let closestHandle: string = 'top';
                    let minDist = Infinity;

                    const handles = [
                      { name: 'top', x: width / 2, y: 0 },
                      { name: 'bottom', x: width / 2, y: height },
                      { name: 'left', x: 0, y: height / 2 },
                      { name: 'right', x: width, y: height / 2 },
                    ];

                    handles.forEach(h => {
                      const dist = Math.sqrt(Math.pow(relX - h.x, 2) + Math.pow(relY - h.y, 2));
                      if (dist < minDist) {
                        minDist = dist;
                        closestHandle = h.name;
                      }
                    });

                    addConnection(connectingFrom.nodeId, node.id, connectingFrom.handle, closestHandle);
                    setConnectingFrom(null);
                  }}
                />
              );
            })}
        </div>
      </div>
    </div>
  );
}