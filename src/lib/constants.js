// Central Column and Color Mapping Configuration (Legacy Enterprise Terminology)
export const COLUMN_CONFIG = [
  { id: 'urgent', title: '🚨 High Priority', color: 'crimson', label: 'High Priority', short: 'High' },
  { id: 'todo', title: '⏳ To Do', color: 'kraft', label: 'To Do', short: 'To Do' },
  { id: 'in_progress', title: '⚡ In Progress', color: 'steel', label: 'In Progress', short: 'Active' },
  { id: 'review', title: '🔍 In Review', color: 'olive', label: 'In Review', short: 'Review' },
  { id: 'completed', title: '✅ Completed', color: 'gunmetal', label: 'Completed', short: 'Done' }
];

// Guaranteed section-uniform color mapping (Preserving User Approved Palette)
export const COLUMN_COLORS = {
  urgent: 'crimson',
  todo: 'kraft',
  in_progress: 'steel',
  review: 'olive',
  completed: 'gunmetal'
};

export const COLOR_METADATA = {
  crimson: { name: 'Deep Crimson', hex: '#57161f', border: '#802330', text: '#fee2e2' },
  kraft: { name: 'Raw Kraft Cardboard', hex: '#805022', border: '#a16830', text: '#fef3c7' },
  steel: { name: 'Oceanic Steel Blue', hex: '#13273e', border: '#1f3f64', text: '#e0f2fe' },
  olive: { name: 'Tactical Field Olive', hex: '#283726', border: '#3b5038', text: '#ecfdf5' },
  gunmetal: { name: 'Matte Carbon Gunmetal', hex: '#1c212a', border: '#2e3644', text: '#e2e8f0' }
};
