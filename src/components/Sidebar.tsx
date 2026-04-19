import { useState, useMemo } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { ChevronDown, ChevronRight, Layout } from 'lucide-react';
import { ComponentType, SidebarItem } from '../types';
import { loadAllIcons } from '../utils/iconLoader';

interface DraggableItemProps extends SidebarItem {}

function DraggableSidebarItem({ id, type, label, description, color, iconUrl }: DraggableItemProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    data: { type, label, iconUrl, color, isFromSidebar: true },
  });

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
        className="w-10 h-10 rounded-lg flex items-center justify-center p-1 bg-white/5"
      >
        {iconUrl ? (
          <img src={iconUrl} alt={label} className="w-full h-full object-contain" />
        ) : (
          <Layout size={20} color={color} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div
          className="font-semibold text-sm truncate"
          style={{ color, textShadow: `0 0 8px ${color}50` }}
        >
          {label}
        </div>
        {description && (
          <div className="text-xs text-gray-500 truncate" title={description}>{description}</div>
        )}
      </div>
    </div>
  );
}

function CategorySection({ title, items }: { title: string; items: SidebarItem[] }) {
  const [isOpen, setIsOpen] = useState(true);
  
  if (items.length === 0) return null;
  
  return (
    <div className="mb-4">
      <button 
        className="flex items-center gap-2 w-full text-left font-bold text-gray-400 hover:text-white uppercase text-xs tracking-wider mb-2 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        {title} ({items.length})
      </button>
      
      {isOpen && (
        <div className="space-y-1">
          {items.map((item) => (
            <DraggableSidebarItem key={item.id} {...item} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  const allItems = useMemo(() => loadAllIcons(), []);
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return allItems;
    const term = searchTerm.toLowerCase();
    return allItems.filter(item => 
      (item.name && item.name.toLowerCase().includes(term)) ||
      (item.category && item.category.toLowerCase().includes(term)) ||
      item.label.toLowerCase().includes(term)
    );
  }, [allItems, searchTerm]);

  const categories = useMemo(() => {
    const cats: Record<string, SidebarItem[]> = {};
    for (const item of filteredItems) {
      const cat = item.category || 'Custom';
      if (!cats[cat]) cats[cat] = [];
      cats[cat].push(item);
    }
    return Object.entries(cats).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filteredItems]);

  return (
    <aside className="fixed left-0 top-0 h-full w-[280px] glass-panel z-50 flex flex-col">
      <div className="p-5 pb-2">
        <h2
          className="text-xl font-bold tracking-wider text-red-500 title-underline mb-4"
          style={{ fontFamily: "'Orbitron', sans-serif" }}
        >
          COMPONENTS
        </h2>
        <div className="relative mb-2">
          <input
            type="text"
            placeholder="Search components..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/40 border border-gray-700 rounded-lg py-2 pl-9 pr-8 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
          />
          <Layout className="absolute left-3 top-2.5 text-gray-500" size={14} />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2.5 text-gray-500 hover:text-white"
            >
              ×
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
        {categories.length > 0 ? (
          categories.map(([category, items]) => (
            <CategorySection key={category} title={category} items={items} />
          ))
        ) : (
          <div className="text-center text-gray-500 text-sm mt-8">
            No components found
          </div>
        )}
      </div>
      <div className="p-4 border-t border-gray-800 bg-black/20">
        <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-2">
          <Layout size={12} />
          Drag components to canvas
        </p>
      </div>
    </aside>
  );
}