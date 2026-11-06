# Standalone Module Customizer & Dynamic Form Engine

A complete, self-contained, enterprise-grade **Module Customizer** and **Dynamic Form Engine** built with React, TypeScript, and Tailwind CSS. 

You can copy the entire `src/standalone-module-customizer/` directory into any React project (Vite, Next.js, Remix, Create-React-App) to enable dynamic field customization, custom sections, formula calculation, and real-time form rendering.

---

## 🚀 Features

- **22+ Field Types Supported**: Single line text, multiline textarea, number, currency, select dropdown, multi-select tags, radio buttons, switch/boolean, date picker, time, datetime, file upload, image preview, phone, email, URL, rating stars, color picker, and more.
- **Visual Custom Field Builder (`CustomFieldBuilderView`)**:
  - Live interactive preview
  - Field key auto-generation from label
  - Validation bounds (min, max, step, minLength, maxLength, file size limits, accepted formats)
  - Custom option builder with drag-and-drop / list manager
  - Section placement and permission settings
- **Query & Formula Engine (`queryEngineService`)**:
  - Excel-like formulas: `IF(cond, true, false)`, `CONCAT(...)`, `ROUND(...)`, `DATEDIF(...)`, `LOWER(...)`, `UPPER(...)`, `COALESCE(...)`, `NOW()`
  - Live syntax evaluation & execution timer
  - Schema variable token picker (`{user.email}`, `{product.price}`, etc.)
  - SQL / JQL simulated query presets
- **Universal Dynamic Field Renderer (`DynamicCustomFieldInput`)**:
  - Drop-in renderer that renders the correct UI control based on `field.type`
  - Integrated validation, required badges, help tooltips, and live computed formula evaluation
- **Module Manager (`ModuleCustomizerManager`)**:
  - Module tabs (switch between Users, Products, Tickets, Assets, etc.)
  - Section reordering (move up/down)
  - Add & delete custom sections
  - Enable/disable fields & toggle mandatory gates
  - Full-text search and filtering

---

## 📦 Required Dependencies

In your new application, install the following standard packages:

```bash
npm install lucide-react clsx tailwind-merge
# or
pnpm add lucide-react clsx tailwind-merge
# or
yarn add lucide-react clsx tailwind-merge
```

Make sure Tailwind CSS is configured in your project (`tailwind.config.js` or Tailwind v4 `@import "tailwindcss";`).

---

## 📁 Package Directory Structure

```text
standalone-module-customizer/
├── index.ts                              # Main entry point & barrel exports
├── types.ts                              # TypeScript interfaces (CustomFieldDefinition, Module, etc.)
├── README.md                             # Documentation & guides
├── components/
│   ├── ModuleCustomizerManager.tsx       # Full administration console (Sections, Fields list, KPI)
│   ├── CustomFieldBuilderView.tsx        # Visual builder + formula workbench
│   └── DynamicCustomFieldInput.tsx       # Universal dynamic input renderer
├── services/
│   ├── customizerStorageService.ts       # LocalStorage & event-driven persistence
│   └── queryEngineService.ts             # Formula evaluation & math parser
└── ui/                                   # Standalone UI Atoms
    ├── cn.ts                             # Tailwind class utility
    ├── Button.tsx
    ├── TextInput.tsx
    ├── TextArea.tsx
    ├── Select.tsx
    ├── DatePicker.tsx
    ├── Switch.tsx
    ├── Checkbox.tsx
    └── Breadcrumbs.tsx
```

---

## 🛠️ Usage Examples

### 1. Embed the Customizer Admin Console

Allow administrators to customize modules, sections, and fields:

```tsx
import React from 'react';
import { ModuleCustomizerManager } from './standalone-module-customizer';

export function AdminCustomizerPage() {
  const customModules = [
    {
      id: 'customer',
      label: 'Customer Accounts',
      description: 'Manage CRM customer attributes',
      defaultSections: ['Basic Information', 'Billing & Finance', 'Custom Fields']
    },
    {
      id: 'ticket',
      label: 'Support Tickets',
      description: 'Custom ticket fields and SLA triggers',
      defaultSections: ['Ticket Details', 'Assignment', 'Resolution']
    }
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <ModuleCustomizerManager
        modules={customModules}
        initialModuleId="customer"
        onFieldsChanged={(moduleId, fields) => {
          console.log(`Module ${moduleId} fields updated:`, fields);
          // Optional: Sync with your backend API
        }}
      />
    </div>
  );
}
```

---

### 2. Render Custom Fields Inside Any Form

Use `getModuleFields` and `DynamicCustomFieldInput` to render custom fields inside create/edit forms:

```tsx
import React, { useState, useEffect } from 'react';
import { 
  getModuleFields, 
  DynamicCustomFieldInput, 
  CustomFieldDefinition 
} from './standalone-module-customizer';

export function CustomerCreateForm() {
  const [fields, setFields] = useState<CustomFieldDefinition[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    // Load configured fields for 'customer' module
    const configuredFields = getModuleFields('customer');
    setFields(configuredFields);
  }, []);

  const handleFieldChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitted Form Data:', formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto p-4 bg-white rounded-xl border">
      <h3 className="font-bold text-lg">New Customer</h3>
      
      {fields.map((field) => (
        <DynamicCustomFieldInput
          key={field.id}
          field={field}
          value={formData[field.key] ?? field.defaultValue ?? ''}
          onChange={(val) => handleFieldChange(field.key, val)}
        />
      ))}

      <button type="submit" className="w-full py-2 bg-blue-600 text-white font-bold rounded-lg">
        Save Customer
      </button>
    </form>
  );
}
```

---

### 3. Evaluate Formulas Programmatically

Use the built-in query & formula evaluator anywhere in your app:

```typescript
import { evaluateCustomFieldQuery } from './standalone-module-customizer';

const userRecord = {
  firstName: 'John',
  lastName: 'Doe',
  salary: 120000
};

// Excel-style formula
const formula = 'CONCAT({user.firstName}, " earns $", ROUND({user.salary} / 12, 2), " /mo")';

const result = evaluateCustomFieldQuery(
  formula,
  'formula',
  userRecord
);

console.log(result.result); // "John earns $10000 /mo"
```

---

## 🗄️ Connecting to a Backend Database

By default, `customizerStorageService.ts` persists configurations to the browser's `localStorage` and emits CustomEvents for instant reactivity. 

To persist fields in a SQL / MongoDB database instead, simply replace `localStorage.getItem` / `localStorage.setItem` in `customizerStorageService.ts` with API calls:

```typescript
// Example: REST API integration in customizerStorageService.ts
export async function getModuleFieldsFromApi(moduleId: string) {
  const res = await fetch(`/api/customizer/${moduleId}/fields`);
  return await res.json();
}

export async function saveModuleFieldsToApi(moduleId: string, fields: CustomFieldDefinition[]) {
  await fetch(`/api/customizer/${moduleId}/fields`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fields)
  });
}
```

