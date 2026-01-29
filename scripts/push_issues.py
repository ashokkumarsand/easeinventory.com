import subprocess
import re
import os

def create_issue(title, body, labels):
    cmd = [
        'gh', 'issue', 'create',
        '--title', title,
        '--body', body,
    ]
    
    print(f"Creating issue: {title}")
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode == 0:
        print(f"Success: {result.stdout.strip()}")
    else:
        print(f"Error: {result.stderr.strip()}")

def main():
    with open('docs/GITHUB_ISSUES.md', 'r') as f:
        content = f.read()

    # Get existing issues to avoid duplication
    existing_result = subprocess.run(['gh', 'issue', 'list', '--limit', '100', '--json', 'title'], capture_output=True, text=True)
    existing_titles = set()
    if existing_result.returncode == 0:
        import json
        issues = json.loads(existing_result.stdout)
        existing_titles = {issue['title'] for issue in issues}

    # Split into Epics
    epics = content.split('## Epic')[1:]
    
    for epic_content in epics:
        # Split into individual issues
        issues_raw = epic_content.split('### ')[1:]
        for issue_raw in issues_raw:
            lines = issue_raw.strip().split('\n')
            title_line = lines[0]
            
            # Simple check if already exists
            if any(title_line in t for t in existing_titles):
                print(f"Skipping existing: {title_line}")
                continue

            # Labels
            labels = []
            labels_match = re.search(r'\*\*Labels:\*\* `(.*)`', issue_raw)
            if labels_match:
                labels = labels_match.group(1).replace('`', '').split(',')

            # Body: Everything after the labels line (or title if no labels)
            body_start = issue_raw.find('**Labels:**')
            if body_start != -1:
                body = issue_raw[body_start:].strip()
            else:
                body = '\n'.join(lines[1:]).strip()
            
            create_issue(title_line, body, labels)

if __name__ == "__main__":
    main()
