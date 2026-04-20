// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  diagnostics: `${API_BASE_URL}/api/diagnostics`,
  discoverContacts: `${API_BASE_URL}/discover-contacts`,
  runAgent: `${API_BASE_URL}/run-agent`,
};
