import os
import re

directories = [
    "src/components/ui",
    "src/components/shell",
    "src/pages",
    "src/components/modals",
    "src/components/employee",
    "src/components/onboarding/steps",
    "src/components/table",
    "src/components/common"
]

base_dir = r"c:\Users\User\OneDrive - quantiratechnologies com\Office Data\HR Portal & Onboarding"

light_classes = [
    "bg-white", "bg-slate-50", "bg-slate-100", "bg-gray-50",
    "text-slate-900", "text-slate-800", "text-slate-700", "text-slate-600", "text-slate-500",
    "border-slate-200", "border-slate-300", "border-gray-200",
    "divide-slate-200"
]

files_to_fix = []

for d in directories:
    dir_path = os.path.join(base_dir, d.replace("/", "\\"))
    if not os.path.exists(dir_path):
        continue
    
    for root, _, files in os.walk(dir_path):
        for file in files:
            if not (file.endswith(".tsx") or file.endswith(".ts") or file.endswith(".jsx") or file.endswith(".js")):
                continue
            
            filepath = os.path.join(root, file)
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
                
            needs_fix = False
            for c in light_classes:
                # Find occurrences of the class not preceded by dark: or something else
                # A simple heuristic: check if the class is in the file, and if the file lacks enough dark: equivalents
                if c in content:
                    needs_fix = True
                    break
            
            if needs_fix:
                files_to_fix.append(filepath.replace(base_dir, "").strip("\\"))

print("Files to fix:")
for f in files_to_fix:
    print(f)
