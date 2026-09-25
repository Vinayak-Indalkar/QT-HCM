const fs = require('fs');
const path = require('path');

const mapping = {
    "bg-white": "dark:bg-slate-900",
    "bg-slate-50": "dark:bg-slate-800/50",
    "bg-slate-100": "dark:bg-slate-800",
    "bg-gray-50": "dark:bg-slate-900",
    "text-slate-900": "dark:text-white",
    "text-slate-800": "dark:text-slate-100",
    "text-slate-700": "dark:text-slate-200",
    "text-slate-600": "dark:text-slate-300",
    "text-slate-500": "dark:text-slate-400",
    "border-slate-200": "dark:border-slate-700",
    "border-slate-300": "dark:border-slate-700",
    "border-gray-200": "dark:border-slate-700",
    "divide-slate-200": "dark:divide-slate-700"
};

const directories = [
    "src/components/ui",
    "src/components/shell",
    "src/pages",
    "src/components/modals",
    "src/components/employee",
    "src/components/onboarding/steps",
    "src/components/table",
    "src/components/common"
];

const baseDir = "c:/Users/User/OneDrive - quantiratechnologies com/Office Data/HR Portal & Onboarding";

let updatedCount = 0;

function walkDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            walkDir(fullPath);
        } else if (file.endsWith(".tsx") || file.endsWith(".ts") || file.endsWith(".jsx") || file.endsWith(".js")) {
            processFile(fullPath);
        }
    }
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // We only want to replace whole words that are inside quotes or backticks (Tailwind classes)
    // A simple approach is to use regex with word boundaries, but wait, hyphen is a word boundary.
    // So \b(bg-white)\b works. But we need to make sure we only replace if there isn't already a dark: variant for the same prefix.
    // Actually, we can just replace all occurrences of `class` with `class dark:class` and then clean up duplicates later if needed.
    // But better: use a replacer function.

    for (const [lightClass, darkClass] of Object.entries(mapping)) {
        // Regex to find the lightClass not immediately preceded by dark: or something else weird.
        // Also ensure it's not part of another class like hover:bg-white
        const regex = new RegExp(`(?<![a-z0-9-:])${lightClass}(?![a-z0-9-])`, 'g');
        
        content = content.replace(regex, (match, offset, string) => {
            // Check if darkClass is already somewhere nearby?
            // Actually, just checking if the string already contains the darkClass is an easy heuristic,
            // but the file could have multiple elements. Some have it, some don't.
            
            // Look ahead a little bit to see if dark variant is there in the same class string
            // It's hard to parse perfectly without AST, but we can look in a window of 100 characters.
            // Or simpler: just replace it. If they have duplicate dark: classes, Tailwind handles it gracefully.
            // But we don't want `dark:bg-slate-900 dark:bg-slate-900`.
            
            // To be safer, let's see if the next characters contain the dark prefix (e.g. dark:bg)
            const prefix = darkClass.split('-')[0] + '-' + darkClass.split('-')[1]; // e.g. dark:bg
            const next100 = string.substring(offset, offset + 150);
            const prev100 = string.substring(Math.max(0, offset - 150), offset);
            
            // If the same exact darkClass is nearby in the same string literal, skip.
            // A simple check: if darkClass is in the same line.
            const lineStart = string.lastIndexOf('\\n', offset);
            const lineEnd = string.indexOf('\\n', offset);
            const line = string.substring(lineStart === -1 ? 0 : lineStart, lineEnd === -1 ? string.length : lineEnd);
            
            if (line.includes(darkClass)) {
                return match; // already has it probably
            }
            
            return `${match} ${darkClass}`;
        });
    }

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
        updatedCount++;
    }
}

for (const d of directories) {
    walkDir(path.join(baseDir, d));
}

console.log(`Updated ${updatedCount} files.`);
