const fs = require('fs');
const path = require('path');

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

const lightClasses = [
    "bg-white", "bg-slate-50", "bg-slate-100", "bg-gray-50",
    "text-slate-900", "text-slate-800", "text-slate-700", "text-slate-600", "text-slate-500",
    "border-slate-200", "border-slate-300", "border-gray-200",
    "divide-slate-200"
];

const filesToFix = [];

function walkDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            walkDir(fullPath);
        } else if (file.endsWith(".tsx") || file.endsWith(".ts") || file.endsWith(".jsx") || file.endsWith(".js")) {
            const content = fs.readFileSync(fullPath, 'utf8');
            let needsFix = false;
            for (const c of lightClasses) {
                if (content.includes(c)) {
                    needsFix = true;
                    break;
                }
            }
            if (needsFix) {
                filesToFix.push(fullPath.replace(baseDir, "").substring(1));
            }
        }
    }
}

for (const d of directories) {
    walkDir(path.join(baseDir, d));
}

console.log("Files to fix:");
for (const f of filesToFix) {
    console.log(f);
}
