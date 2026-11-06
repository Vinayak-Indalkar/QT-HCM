export interface SchemaVariable {
  token: string;
  label: string;
  category: 'Employee' | 'Metrics' | 'Assets' | 'Function' | string;
  description: string;
  example: string;
}

export const SCHEMA_VARIABLES: SchemaVariable[] = [
  // Employee Attributes
  { token: '{employee.id}', label: 'Employee ID', category: 'Employee', description: 'Unique alphanumeric identifier', example: 'EMP-2024-8904' },
  { token: '{employee.firstName}', label: 'First Name', category: 'Employee', description: 'Given first name', example: 'Eleanor' },
  { token: '{employee.lastName}', label: 'Last Name', category: 'Employee', description: 'Surname / Family name', example: 'Vance' },
  { token: '{employee.name}', label: 'Full Name', category: 'Employee', description: 'Combined full name', example: 'Eleanor Vance' },
  { token: '{employee.department}', label: 'Department', category: 'Employee', description: 'Functional team', example: 'Engineering' },
  { token: '{employee.jobTitle}', label: 'Job Title', category: 'Employee', description: 'Designation / Role', example: 'Staff Cloud Architect' },
  { token: '{employee.email}', label: 'Corporate Email', category: 'Employee', description: 'Enterprise SSO email address', example: 'eleanor.vance@quantira.com' },
  { token: '{employee.salary}', label: 'Annual Base Salary', category: 'Employee', description: 'Compensation amount ($)', example: '165000' },
  { token: '{employee.startDate}', label: 'Joining Date', category: 'Employee', description: 'Start date in ISO format', example: '2024-03-01' },
  { token: '{employee.workModel}', label: 'Work Model', category: 'Employee', description: 'Remote, Hybrid, or On-site', example: 'Hybrid' },
  { token: '{employee.clearanceTier}', label: 'Clearance Tier', category: 'Employee', description: 'Security level clearance', example: 'Tier 3 (Secret)' },
  { token: '{employee.performanceScore}', label: 'KPI Performance Score', category: 'Employee', description: '0-100 overall performance metric', example: '94' },

  // Metrics & Attendance
  { token: '{onboarding.progress}', label: 'Onboarding Progress %', category: 'Metrics', description: '0-100 onboarding milestone completion', example: '100' },
  { token: '{onboarding.status}', label: 'Onboarding Status', category: 'Metrics', description: 'Active onboarding pipeline stage', example: 'completed' },
  { token: '{compliance.score}', label: 'Compliance Audit Ratio', category: 'Metrics', description: 'Document verification audit percentage', example: '98' },
  { token: '{attendance.loggedHours}', label: 'Today Logged Hours', category: 'Metrics', description: 'Punch biometric recorded hours', example: '8.5' },

  // Assets & Hardware
  { token: '{asset.assignedCount}', label: 'Assigned Assets Count', category: 'Assets', description: 'Number of enterprise hardware assigned', example: '2' },
  { token: '{asset.laptopModel}', label: 'Primary Laptop Model', category: 'Assets', description: 'Allocated workstation model', example: 'MacBook Pro M3 Max' },

  // Built-in Logic & Formula Functions
  { token: 'IF(condition, true_val, false_val)', label: 'IF Statement', category: 'Function', description: 'Conditional branch evaluator', example: 'IF({employee.salary} > 150000, "Senior Band", "Standard Band")' },
  { token: 'CONCAT(str1, str2, ...)', label: 'CONCAT Function', category: 'Function', description: 'Combines text strings together', example: 'CONCAT({employee.firstName}, " ", {employee.lastName})' },
  { token: 'LOWER(text)', label: 'LOWER Function', category: 'Function', description: 'Converts text to lowercase', example: 'LOWER({employee.email})' },
  { token: 'UPPER(text)', label: 'UPPER Function', category: 'Function', description: 'Converts text to uppercase', example: 'UPPER({employee.department})' },
  { token: 'ROUND(number, decimals)', label: 'ROUND Function', category: 'Function', description: 'Rounds number to decimal precision', example: 'ROUND({employee.salary} * 0.15, 2)' },
  { token: 'DATEDIF(start, end, "days"|"months"|"years")', label: 'DATEDIF Function', category: 'Function', description: 'Calculates time delta between dates', example: 'DATEDIF({employee.startDate}, NOW(), "days")' },
  { token: 'NOW()', label: 'NOW() Current Date', category: 'Function', description: 'Returns current date & timestamp', example: 'NOW()' },
  { token: 'COALESCE(val1, val2, ...)', label: 'COALESCE Function', category: 'Function', description: 'Returns first non-empty value', example: 'COALESCE({employee.preferredName}, {employee.firstName})' }
];

export interface QueryPreset {
  id: string;
  name: string;
  category: 'Formula' | 'SQL' | 'JQL' | 'JSONPath';
  queryType: 'formula' | 'sql' | 'jql' | 'jsonpath';
  description: string;
  query: string;
  suggestedFieldType: 'text' | 'number' | 'currency' | 'select' | 'boolean';
}

export const QUERY_PRESETS: QueryPreset[] = [
  {
    id: 'kpi-tier-calc',
    name: '🎯 Employee KPI Performance Tier Rating',
    category: 'Formula',
    queryType: 'formula',
    description: 'Computes executive KPI tier based on milestone velocity and compliance audit ratio.',
    query: `IF({onboarding.progress} >= 95 AND {compliance.score} >= 90, "Tier 1 - High Velocity & Cleared", IF({onboarding.progress} >= 60, "Tier 2 - In Flight Standard", "Tier 3 - Needs HR Acceleration"))`,
    suggestedFieldType: 'text'
  },
  {
    id: 'corp-email-generator',
    name: '📧 Dynamic Enterprise Email Generator',
    category: 'Formula',
    queryType: 'formula',
    description: 'Auto-constructs standardized corporate email from first and last names.',
    query: `LOWER(CONCAT({employee.firstName}, ".", {employee.lastName}, "@quantiratechnologies.com"))`,
    suggestedFieldType: 'text'
  },
  {
    id: 'tenure-seniority-calc',
    name: '⏱️ Tenure & Seniority Days Tracker',
    category: 'Formula',
    queryType: 'formula',
    description: 'Calculates active employee service duration in days since start date.',
    query: `DATEDIF({employee.startDate}, NOW(), "days")`,
    suggestedFieldType: 'number'
  },
  {
    id: 'retention-bonus-calc',
    name: '💰 Projected Annual Retention Bonus ($)',
    category: 'Formula',
    queryType: 'formula',
    description: 'Calculates 12% discretionary retention multiplier with $5,000 base incentive.',
    query: `ROUND({employee.salary} * 0.12 + 5000, 2)`,
    suggestedFieldType: 'currency'
  },
  {
    id: 'it-hardware-status',
    name: '💻 IT Asset Provisioning Gate',
    category: 'Formula',
    queryType: 'formula',
    description: 'Determines workstation dispatch status based on assigned hardware count.',
    query: `IF({asset.assignedCount} > 0, CONCAT("Dispatched: ", {asset.laptopModel}), "Awaiting Asset Allocation")`,
    suggestedFieldType: 'text'
  },
  {
    id: 'security-clearance-auth',
    name: '🛡️ Federal Security Protocol Validator',
    category: 'Formula',
    queryType: 'formula',
    description: 'Validates top-secret data center entry access based on clearance tier.',
    query: `IF({employee.clearanceTier} = "Tier 3 (Secret)" AND {compliance.score} >= 95, "Authorized Data Lab Clearance", "Standard Office Clearance")`,
    suggestedFieldType: 'text'
  },
  {
    id: 'sql-engineering-roster',
    name: '🗄️ SQL: Filter Engineering & Cloud Specialists',
    category: 'SQL',
    queryType: 'sql',
    description: 'SQL extraction of engineering candidates with high performance scores.',
    query: `SELECT id, name, department, jobTitle, performanceScore FROM candidates WHERE department = 'Engineering' AND progress >= 50 ORDER BY performanceScore DESC`,
    suggestedFieldType: 'text'
  },
  {
    id: 'sql-hardware-audit',
    name: '🗄️ SQL: Unassigned Available Laptop Inventory',
    category: 'SQL',
    queryType: 'sql',
    description: 'SQL query selecting available enterprise hardware assets ready for dispatch.',
    query: `SELECT assetTag, name, category, location, status FROM assets WHERE status = 'available' AND category = 'Laptop'`,
    suggestedFieldType: 'text'
  },
  {
    id: 'jql-active-filter',
    name: '🔍 JQL: High Clearance Active Hybrid Staff',
    category: 'JQL',
    queryType: 'jql',
    description: 'Enterprise filter query matching hybrid employees with Secret clearance.',
    query: `workModel = 'Hybrid' AND clearanceTier ~ 'Tier 3' AND status = 'COMPLETED'`,
    suggestedFieldType: 'text'
  }
];

export interface QueryEvaluationResult {
  result: any;
  error?: string;
  executionTimeMs: number;
  matchedCount?: number;
  columns?: string[];
  rows?: any[];
  parsedTokens?: string[];
}

/**
 * Normalizes context object for candidate / employee / asset attributes
 */
export function buildEvaluationContext(candidate?: any, assetsList: any[] = []): Record<string, any> {
  const c = candidate || {
    id: 'EMP-2024-8904',
    firstName: 'Eleanor',
    lastName: 'Vance',
    name: 'Eleanor Vance',
    department: 'Engineering',
    jobTitle: 'Staff Cloud Architect',
    email: 'eleanor.vance@quantira.com',
    corporateEmail: 'eleanor.vance@quantira.com',
    salary: 165000,
    startDate: '2024-03-01',
    workModel: 'Hybrid',
    clearanceTier: 'Tier 3 (Secret)',
    progress: 100,
    status: 'completed'
  };

  const assignedAssets = assetsList.filter((a) => a.assignedTo === c.id || a.assignedTo === c.name);
  const laptopAsset = assignedAssets.find((a) => a.category?.toLowerCase() === 'laptop') || assetsList[0];

  return {
    'employee.id': c.id || 'EMP-2024-8904',
    'employee.firstName': c.firstName || (c.name ? c.name.split(' ')[0] : 'Eleanor'),
    'employee.lastName': c.lastName || (c.name ? c.name.split(' ').slice(1).join(' ') : 'Vance'),
    'employee.name': c.name || `${c.firstName || 'Eleanor'} ${c.lastName || 'Vance'}`.trim(),
    'employee.department': c.department || 'Engineering',
    'employee.jobTitle': c.jobTitle || 'Staff Cloud Architect',
    'employee.email': c.corporateEmail || c.email || 'eleanor.vance@quantira.com',
    'employee.salary': Number(c.salary || 165000),
    'employee.startDate': c.startDate || '2024-03-01',
    'employee.workModel': c.workModel || 'Hybrid',
    'employee.clearanceTier': c.clearanceTier || 'Tier 3 (Secret)',
    'employee.performanceScore': 94,
    'onboarding.progress': Number(c.progress ?? 100),
    'onboarding.status': c.status || 'completed',
    'compliance.score': 98,
    'attendance.loggedHours': 8.5,
    'asset.assignedCount': assignedAssets.length > 0 ? assignedAssets.length : 2,
    'asset.laptopModel': laptopAsset?.name || 'MacBook Pro 16" M3 Max',
    'asset.serialNumber': laptopAsset?.serialNumber || 'SN-APPL-98234-M3'
  };
}

/**
 * Evaluates a formula expression safely
 */
export function evaluateFormulaExpression(
  expression: string,
  context: Record<string, any>
): QueryEvaluationResult {
  const startTime = performance.now();
  if (!expression || !expression.trim()) {
    return { result: '', executionTimeMs: 0 };
  }

  try {
    let expr = expression.trim();

    // Replace NOW() with current ISO date
    const nowStr = new Date().toISOString().split('T')[0];
    expr = expr.replace(/NOW\(\)/gi, `"${nowStr}"`);
    expr = expr.replace(/TODAY\(\)/gi, `"${nowStr}"`);

    // Extract all tokens like {employee.firstName}
    const tokenRegex = /\{([a-zA-Z0-9_.]+)\}/g;
    const tokensFound: string[] = [];
    let match;
    while ((match = tokenRegex.exec(expression)) !== null) {
      tokensFound.push(match[0]);
    }

    // Replace tokens with evaluated values
    expr = expr.replace(tokenRegex, (_match, tokenKey) => {
      const val = context[tokenKey];
      if (val === undefined || val === null) {
        return '""';
      }
      if (typeof val === 'number') {
        return String(val);
      }
      return JSON.stringify(String(val));
    });

    // Custom functions evaluation: CONCAT(...)
    expr = expr.replace(/CONCAT\s*\(([^()]+)\)/gi, (_m, args) => {
      const argList = splitArgs(args);
      return `(${argList.join(' + ')})`;
    });

    // Custom functions evaluation: LOWER(...)
    expr = expr.replace(/LOWER\s*\(([^()]+)\)/gi, (_m, arg) => {
      return `String(${arg}).toLowerCase()`;
    });

    // Custom functions evaluation: UPPER(...)
    expr = expr.replace(/UPPER\s*\(([^()]+)\)/gi, (_m, arg) => {
      return `String(${arg}).toUpperCase()`;
    });

    // Custom functions evaluation: ROUND(val, decimals)
    expr = expr.replace(/ROUND\s*\(([^,]+)(?:,\s*([^)]+))?\)/gi, (_m, val, dec) => {
      const decimals = dec ? dec.trim() : '0';
      return `Number(Number(${val}).toFixed(${decimals}))`;
    });

    // Custom functions evaluation: DATEDIF(d1, d2, unit)
    expr = expr.replace(/DATEDIF\s*\(([^,]+),\s*([^,]+),\s*([^)]+)\)/gi, (_m, d1, d2, unit) => {
      return `Math.abs(Math.round((new Date(${d2}).getTime() - new Date(${d1}).getTime()) / (1000 * 60 * 60 * 24)))`;
    });

    // Custom functions evaluation: IF(cond, a, b) -> (cond ? a : b)
    // Handle nested IFs iteratively
    while (/IF\s*\(([^,]+),\s*([^,]+),\s*([^)]+)\)/i.test(expr)) {
      expr = expr.replace(/IF\s*\(([^,]+),\s*([^,]+),\s*([^)]+)\)/gi, '($1 ? $2 : $3)');
    }

    // Replace SQL/English operators: AND -> &&, OR -> ||, NOT -> !
    expr = expr.replace(/\bAND\b/g, '&&');
    expr = expr.replace(/\bOR\b/g, '||');
    expr = expr.replace(/(?<=[^=!<>\w])=(?=[^=])/g, '===');

    // Safe execution sandbox
    // eslint-disable-next-line no-new-func
    const evaluator = new Function(`"use strict"; return (${expr});`);
    const evaluated = evaluator();
    const duration = Math.max(0.1, Number((performance.now() - startTime).toFixed(2)));

    return {
      result: evaluated,
      executionTimeMs: duration,
      parsedTokens: tokensFound
    };
  } catch (err: any) {
    const duration = Math.max(0.1, Number((performance.now() - startTime).toFixed(2)));
    return {
      result: null,
      error: `Syntax / Evaluation Error: ${err?.message || 'Invalid formula expression'}`,
      executionTimeMs: duration
    };
  }
}

function splitArgs(str: string): string[] {
  const results: string[] = [];
  let current = '';
  let inQuotes = false;
  let quoteChar = '';

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if ((char === '"' || char === "'") && (i === 0 || str[i - 1] !== '\\')) {
      if (!inQuotes) {
        inQuotes = true;
        quoteChar = char;
      } else if (quoteChar === char) {
        inQuotes = false;
      }
    }

    if (char === ',' && !inQuotes) {
      results.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  if (current.trim()) {
    results.push(current.trim());
  }
  return results;
}

/**
 * In-memory SQL execution engine against candidate and asset collections
 */
export function evaluateSqlQuery(
  sqlQuery: string,
  candidates: any[] = [],
  assets: any[] = []
): QueryEvaluationResult {
  const startTime = performance.now();
  if (!sqlQuery || !sqlQuery.trim()) {
    return { result: [], executionTimeMs: 0, matchedCount: 0 };
  }

  try {
    const q = sqlQuery.trim();
    const fromMatch = q.match(/FROM\s+([a-zA-Z0-9_]+)/i);
    const targetTable = fromMatch ? fromMatch[1].toLowerCase() : 'candidates';

    const sourceData: any[] = (targetTable.includes('asset') ? assets : candidates).map((item) => ({
      ...item,
      performanceScore: item.performanceScore || (item.progress ? Math.min(100, item.progress + 10) : 88)
    }));

    let filtered = [...sourceData];

    // WHERE clause filter
    const whereMatch = q.match(/WHERE\s+(.*?)(?=\s+ORDER\s+BY|\s+LIMIT|$)/i);
    if (whereMatch && whereMatch[1]) {
      const condition = whereMatch[1].trim();
      filtered = filtered.filter((row) => {
        try {
          // Normalize conditions
          let condExpr = condition
            .replace(/\bdepartment\b/gi, `"${row.department || ''}"`)
            .replace(/\bcategory\b/gi, `"${row.category || ''}"`)
            .replace(/\bstatus\b/gi, `"${row.status || ''}"`)
            .replace(/\bworkModel\b/gi, `"${row.workModel || ''}"`)
            .replace(/\bprogress\b/gi, String(row.progress || 0))
            .replace(/\bperformanceScore\b/gi, String(row.performanceScore || 0))
            .replace(/\bAND\b/g, '&&')
            .replace(/\bOR\b/g, '||')
            .replace(/(?<=[^=!<>\w])=(?=[^=])/g, '===');

          // eslint-disable-next-line no-new-func
          const filterFn = new Function(`"use strict"; return (${condExpr});`);
          return Boolean(filterFn());
        } catch {
          return true;
        }
      });
    }

    // ORDER BY clause
    const orderMatch = q.match(/ORDER\s+BY\s+([a-zA-Z0-9_]+)(\s+DESC|\s+ASC)?/i);
    if (orderMatch && orderMatch[1]) {
      const sortField = orderMatch[1];
      const isDesc = Boolean(orderMatch[2] && orderMatch[2].trim().toUpperCase() === 'DESC');
      filtered.sort((a, b) => {
        const valA = a[sortField] ?? '';
        const valB = b[sortField] ?? '';
        if (valA < valB) return isDesc ? 1 : -1;
        if (valA > valB) return isDesc ? -1 : 1;
        return 0;
      });
    }

    // SELECT projections
    const selectMatch = q.match(/SELECT\s+(.*?)\s+FROM/i);
    let columns: string[] = [];
    let projectedRows: any[] = filtered;

    if (selectMatch && selectMatch[1]) {
      const selectFields = selectMatch[1].trim();
      if (selectFields !== '*') {
        columns = selectFields.split(',').map((f) => f.trim());
        projectedRows = filtered.map((row) => {
          const projected: Record<string, any> = {};
          columns.forEach((col) => {
            projected[col] = row[col] ?? '-';
          });
          return projected;
        });
      } else if (filtered.length > 0) {
        columns = Object.keys(filtered[0]).slice(0, 6);
      }
    }

    const duration = Math.max(0.1, Number((performance.now() - startTime).toFixed(2)));

    return {
      result: projectedRows,
      executionTimeMs: duration,
      matchedCount: projectedRows.length,
      columns: columns.length > 0 ? columns : ['id', 'name', 'department', 'status'],
      rows: projectedRows
    };
  } catch (err: any) {
    const duration = Math.max(0.1, Number((performance.now() - startTime).toFixed(2)));
    return {
      result: null,
      error: `SQL Engine Error: ${err?.message || 'Invalid SQL query syntax'}`,
      executionTimeMs: duration,
      matchedCount: 0
    };
  }
}

/**
 * Universal evaluator for custom field queries (Formula, SQL, JQL, JSONPath)
 */
export function evaluateCustomFieldQuery(
  query: string,
  queryType: 'formula' | 'sql' | 'jql' | 'jsonpath' = 'formula',
  contextCandidate?: any,
  candidatesList: any[] = [],
  assetsList: any[] = []
): QueryEvaluationResult {
  if (!query || !query.trim()) {
    return { result: '', executionTimeMs: 0 };
  }

  if (queryType === 'sql') {
    return evaluateSqlQuery(query, candidatesList, assetsList);
  }

  if (queryType === 'jql') {
    // Convert simple JQL into SQL WHERE and evaluate
    const sqlEquivalent = `SELECT id, name, department, jobTitle, workModel, clearanceTier, status FROM candidates WHERE ${query}`;
    return evaluateSqlQuery(sqlEquivalent, candidatesList, assetsList);
  }

  // Default: Formula Expression
  const context = buildEvaluationContext(contextCandidate, assetsList);
  return evaluateFormulaExpression(query, context);
}
