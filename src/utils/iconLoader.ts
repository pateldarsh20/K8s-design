/// <reference types="vite/client" />
import { SidebarItem } from '../types';

export function formatDisplayName(baseName: string): string {
  // capitalize first letter or predefined words
  const words = baseName.split('-');
  return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    .replace('Configmap', 'ConfigMap')
    .replace('Rolebinding', 'RoleBinding')
    .replace('Clusterrole', 'ClusterRole')
    .replace('Serviceaccount', 'ServiceAccount');
}

export function getCategoryFromName(baseName: string): string {
  if (/pod|deployment|replicaset|statefulset|daemonset|job|cronjob/.test(baseName)) return 'Workload';
  if (/service|ingress|endpoint|networkpolicy/.test(baseName)) return 'Networking';
  if (/pv|pvc|storageclass|volume|snapshot|csi/.test(baseName)) return 'Storage';
  if (/configmap|secret/.test(baseName)) return 'Configuration';
  if (/role|binding|serviceaccount|podsecuritypolicy/.test(baseName)) return 'Security';
  if (/node|namespace|master|etcd|api|controller|scheduler|proxy/.test(baseName)) return 'Infrastructure';
  if (/hpa|vpa|autoscaler/.test(baseName)) return 'Autoscaling';
  return 'Custom';
}

export function getColorForCategory(category: string): string {
  const colors: Record<string, string> = {
    'Workload': '#3b82f6',
    'Networking': '#06b6d4',
    'Storage': '#10b981',
    'Configuration': '#8b5cf6',
    'Security': '#f59e0b',
    'Infrastructure': '#ec4899',
    'Autoscaling': '#eab308',
    'Custom': '#6b7280'
  };
  return colors[category] || '#6b7280';
}

export function generateDescription(baseName: string): string {
  return `Kubernetes ${formatDisplayName(baseName)} component`;
}

export function loadAllIcons(): SidebarItem[] {
  const allIcons = import.meta.glob('/src/assets/k8s-icons/**/*.{svg,png}', { eager: true, as: 'url' });
  const components: SidebarItem[] = [];
  const seen = new Map<string, string>(); // track best version of each component
  
  for (const [path, importFn] of Object.entries(allIcons)) {
    const fileName = path.split('/').pop();
    if (!fileName) continue;
    
    // Use the string directly from import.meta.glob as it resolves to a URL because of 'as: "url"'
    const url = typeof importFn === 'string' ? importFn : ((importFn as any).default || importFn);
    
    let baseName = fileName.replace(/\.(svg|png)$/i, '')
      .replace(/-(color|white|dark|plain)$/i, '')
      .replace(/^k8s-/, '')
      .replace(/-(128|256|512)$/, '')
      .toLowerCase();
      
    // Skip if we already have a better version (SVG > PNG, color > plain)
    const isSvg = path.endsWith('.svg');
    const isColor = path.includes('color');
    const existingPath = seen.get(baseName);
    
    if (!existingPath || (isSvg && !existingPath.endsWith('.svg')) || (isColor && !existingPath.includes('color'))) {
      seen.set(baseName, url as string);
    }
  }
  
  // Convert to components array
  for (const [baseName, iconPath] of seen) {
    components.push({
      id: baseName,
      type: baseName,
      name: formatDisplayName(baseName),
      label: formatDisplayName(baseName),
      iconUrl: iconPath,
      category: getCategoryFromName(baseName),
      color: getColorForCategory(getCategoryFromName(baseName)),
      description: generateDescription(baseName)
    });
  }
  
  return components.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
}
