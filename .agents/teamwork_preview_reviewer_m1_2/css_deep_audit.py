import re

styles_path = "/Users/etienne/Documents/ChatGPT/TradingAgents/web_ui/src/styles.css"
with open(styles_path, "r", encoding="utf-8") as f:
    css = f.read()

# 1. Check brace matching
open_braces = css.count("{")
close_braces = css.count("}")
print(f"Brace balance check: {open_braces} open braces, {close_braces} close braces -> {'BALANCED' if open_braces == close_braces else 'MISMATCH'}")

# 2. Extract defined CSS variables in :root and [data-theme="light"]
root_match = re.search(r':root\s*\{([^}]+)\}', css, re.DOTALL)
light_match = re.search(r'\[data-theme="light"\]\s*\{([^}]+)\}', css, re.DOTALL)

root_vars = set(re.findall(r'(--[a-zA-Z0-9_-]+)\s*:', root_match.group(1))) if root_match else set()
light_vars = set(re.findall(r'(--[a-zA-Z0-9_-]+)\s*:', light_match.group(1))) if light_match else set()

print(f"Total variables defined in :root: {len(root_vars)}")
print(f"Total variables defined in [data-theme='light']: {len(light_vars)}")

# Variables in :root but not in [data-theme="light"]
root_only = sorted(list(root_vars - light_vars))
print(f"Variables in :root not overridden in [data-theme='light'] ({len(root_only)}): {root_only}")

# 3. Check for any var(--...) references throughout styles.css that are never defined in :root
all_var_uses = set(re.findall(r'var\((--[a-zA-Z0-9_-]+)', css))
undefined_vars = sorted(list(all_var_uses - root_vars))
print(f"Undefined CSS variables used in styles.css ({len(undefined_vars)}): {undefined_vars}")

# 4. Check for hardcoded dark hex colors inside [data-theme="light"] blocks
hardcoded_dark = ["#05080e", "#060a0f", "#080d14", "#090e15", "#030508", "#04070c", "#0a1119", "#000000", "#000"]
light_blocks = re.findall(r'(\[data-theme="light"\][^{]*\{[^}]+\})', css, re.DOTALL)
print(f"Total [data-theme='light'] specific rule blocks: {len(light_blocks)}")

violations = []
for block in light_blocks:
    for dark_hex in hardcoded_dark:
        # Check if it's used as a background/color property value, but not in a box-shadow with low alpha like rgba(0,0,0,0.04)
        if f": {dark_hex}" in block.lower() or f":{dark_hex}" in block.lower():
            violations.append((dark_hex, block[:100]))

print(f"Hardcoded dark color violations in light theme: {len(violations)}")
for v in violations:
    print(f"  - {v[0]} in {v[1]}")

# 5. Check for duplicate [data-theme="light"] selector definitions that might conflict
selectors_in_light = []
for block in light_blocks:
    sel = block.split('{')[0].strip()
    selectors_in_light.append(sel)

duplicates = [s for s in set(selectors_in_light) if selectors_in_light.count(s) > 1]
print(f"Duplicate light mode selector blocks ({len(duplicates)}): {duplicates}")

