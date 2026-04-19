import { Position } from '../types';

export const getHandlePosition = (
  nodeX: number,
  nodeY: number,
  width: number,
  height: number,
  handle: string
): Position => {
  switch (handle) {
    case 'top':
      return { x: nodeX + width / 2, y: nodeY };
    case 'bottom':
      return { x: nodeX + width / 2, y: nodeY + height };
    case 'left':
      return { x: nodeX, y: nodeY + height / 2 };
    case 'right':
      return { x: nodeX + width, y: nodeY + height / 2 };
    default:
      return { x: nodeX + width / 2, y: nodeY + height / 2 };
  }
};

export const calculateConnectionPath = (
  sourcePos: Position,
  targetPos: Position,
  sourceHandle: string = 'right',
  targetHandle: string = 'left'
): string => {
  return getBezierPath(sourcePos, targetPos, sourceHandle, targetHandle);
};

export const getBezierPath = (
  sourcePos: Position,
  targetPos: Position,
  sourceHandle: string,
  targetHandle: string
): string => {
  const getControlPoint = (pos: Position, handle: string) => {
    let dx = 0, dy = 0;
    const distanceX = Math.abs(targetPos.x - sourcePos.x);
    const distanceY = Math.abs(targetPos.y - sourcePos.y);
    const c = Math.max(Math.max(distanceX, distanceY) / 2, 50);
    
    switch (handle) {
      case 'right': dx = c; break;
      case 'left': dx = -c; break;
      case 'top': dy = -c; break;
      case 'bottom': dy = c; break;
    }
    return { x: pos.x + dx, y: pos.y + dy };
  };

  const cp1 = getControlPoint(sourcePos, sourceHandle);
  const cp2 = getControlPoint(targetPos, targetHandle);

  return `M ${sourcePos.x} ${sourcePos.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${targetPos.x} ${targetPos.y}`;
};

export const getLineLength = (
  sourcePos: Position,
  targetPos: Position
): number => {
  return Math.sqrt(
    Math.pow(targetPos.x - sourcePos.x, 2) + 
    Math.pow(targetPos.y - sourcePos.y, 2)
  );
};

export const getLineAngle = (
  sourcePos: Position,
  targetPos: Position
): number => {
  return Math.atan2(
    targetPos.y - sourcePos.y,
    targetPos.x - sourcePos.x
  );
};