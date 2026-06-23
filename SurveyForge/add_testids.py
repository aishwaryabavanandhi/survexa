import os
import re

src_dir = r'c:\Users\B Aishwarya\OneDrive\Desktop\PDD DOC\SurveyForge\src'
count = 0

def add_testids(content):
    def replacer(match):
        global count
        tag_start = match.group(0)
        if 'data-testid' not in tag_start:
            count += 1
            tag_name = match.group(1)
            testid = f'{tag_name}-elt-{count}'
            return f'{tag_start} data-testid="{testid}"'
        return tag_start

    content = re.sub(r'<(button|input|form|a)\b', replacer, content, flags=re.IGNORECASE)
    return content

files_modified = 0
for root, dirs, files in os.walk(src_dir):
    for f in files:
        if f.endswith('.jsx'):
            path = os.path.join(root, f)
            with open(path, 'r', encoding='utf-8') as file:
                original = file.read()
            modified = add_testids(original)
            if original != modified:
                with open(path, 'w', encoding='utf-8') as file:
                    file.write(modified)
                files_modified += 1

print(f'Added {count} data-testid attributes across {files_modified} files.')
