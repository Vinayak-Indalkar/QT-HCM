import { CustomFieldDefinition } from '../types';

export const STORAGE_PREFIX = 'app_customizer_';

export function getModuleFields(
  moduleId: string,
  defaultFields: CustomFieldDefinition[] = []
): CustomFieldDefinition[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}fields_${moduleId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn(`Failed to read custom fields for module ${moduleId}:`, err);
  }
  return defaultFields;
}

export function saveModuleFields(
  moduleId: string,
  fields: CustomFieldDefinition[]
): void {
  try {
    localStorage.setItem(
      `${STORAGE_PREFIX}fields_${moduleId}`,
      JSON.stringify(fields)
    );
    window.dispatchEvent(
      new CustomEvent(`${STORAGE_PREFIX}updated_${moduleId}`, {
        detail: { moduleId, fields }
      })
    );
  } catch (err) {
    console.warn(`Failed to save custom fields for module ${moduleId}:`, err);
  }
}

export function getModuleSections(
  moduleId: string,
  defaultSections: string[] = ['General', 'Details', 'System']
): string[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}sections_${moduleId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn(`Failed to read sections for module ${moduleId}:`, err);
  }
  return defaultSections;
}

export function saveModuleSections(
  moduleId: string,
  sections: string[]
): void {
  try {
    localStorage.setItem(
      `${STORAGE_PREFIX}sections_${moduleId}`,
      JSON.stringify(sections)
    );
    window.dispatchEvent(
      new CustomEvent(`${STORAGE_PREFIX}sections_updated_${moduleId}`, {
        detail: { moduleId, sections }
      })
    );
  } catch (err) {
    console.warn(`Failed to save sections for module ${moduleId}:`, err);
  }
}

export function subscribeToModuleChanges(
  moduleId: string,
  onUpdate: () => void
): () => void {
  const handler = () => onUpdate();
  window.addEventListener(`${STORAGE_PREFIX}updated_${moduleId}`, handler);
  window.addEventListener(`${STORAGE_PREFIX}sections_updated_${moduleId}`, handler);
  return () => {
    window.removeEventListener(`${STORAGE_PREFIX}updated_${moduleId}`, handler);
    window.removeEventListener(`${STORAGE_PREFIX}sections_updated_${moduleId}`, handler);
  };
}

