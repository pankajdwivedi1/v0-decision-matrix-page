import re

def standardize_page():
    with open('app/application/page.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    methods = [
        'entropy', 'critic', 'ahp', 'piprecia', 'merec', 'swara', 'wenslo', 'lopcow', 
        'dematel', 'sd', 'variance', 'mad', 'dbw', 'svp', 'mdm', 'lsw', 'gpow', 'lpwm', 
        'pcwm', 'roc', 'rr'
    ]

    # Find the bounds of the weight calculation section
    start_search = content.find('weightMethod === "entropy"')
    end_search = content.rfind('{/* AI Review Assistant Panel */}')
    if start_search == -1: 
        print("Start search failed")
        return
    if end_search == -1:
        end_search = len(content)

    prefix = content[:start_search]
    middle = content[start_search:end_search]
    suffix = content[end_search:]

    # Split middle by method starts
    # We want to find segments that start with something like {entropyResult && ...
    
    # Let's find all occurrences of method results
    markers = []
    for m in methods:
        # Search for {mResult && weightMethod === "m"
        pos = middle.find(f'{m}Result && weightMethod === "{m}"')
        if pos == -1:
            pos = middle.find(f'weightMethod === "{m}" && {m}Result')
        if pos != -1:
            markers.append((pos, m))
            
    markers.sort()
    
    new_middle = ""
    last_pos = 0
    
    for i in range(len(markers)):
        start_idx, method = markers[i]
        next_idx = markers[i+1][0] if i+1 < len(markers) else len(middle)
        
        # Segment for this method
        segment = middle[start_idx:next_idx]
        
        # Replace CardHeaders with ResearchAssetHeader
        table_id = 1
        
        def card_replacer(m):
            nonlocal table_id
            card_class = m.group(1)
            raw_title = m.group(2).strip()
            raw_desc = m.group(3).strip() if m.group(3) else ""
            
            clean_title = re.sub(r'^(Table \d+: |Step \d+: |Step \d+ - |Table \d+ - )', '', raw_title, flags=re.IGNORECASE).strip()
            clean_title = re.sub(r'<[^>]+>', '', clean_title).strip()
            clean_title = clean_title.upper()
            
            desc = re.sub(r'<[^>]+>', '', raw_desc).strip()
            desc = " ".join(desc.split())
            
            key_name = re.sub(r'[^a-zA-Z0-9]', '_', clean_title.lower())
            key_name = re.sub(r'_+', '_', key_name).strip('_')
            asset_key = f"{method}_{key_name}"
            
            # Asset key overrides
            if 'matrix' in asset_key:
                if 'decision' in asset_key: asset_key = f"{method}_decision_matrix"
                elif 'normalized' in asset_key: asset_key = f"{method}_normalized_matrix"
            elif 'weight' in asset_key:
                asset_key = f"{method}_weights"
            
            # Ensure assetKey is unique if it's generic
            if asset_key == f"{method}_" or not key_name:
                asset_key = f"{method}_table_{table_id}"
            
            replacement = f"""<Card className="{card_class}">
                    <div className="px-6 pt-4">
                      <ResearchAssetHeader
                        assetKey="{asset_key}"
                        defaultLabel="Table {table_id}"
                        title="{clean_title}"
                        included={{selectedAiAssets.has("{asset_key}")}}
                        onIncludeChange={{handleIncludeChange}}
                        onLabelChange={{handleAssetLabelChange}}
                      />
                    </div>"""
            table_id += 1
            return replacement

        # Regex for Card and Header
        card_pattern = r'<Card className="([^"]+)">\s*<CardHeader[^>]*>\s*<CardTitle[^>]*>(.*?)</CardTitle>\s*(?:<CardDescription[^>]*>(.*?)</CardDescription>\s*)?</CardHeader>'
        
        new_segment = re.sub(card_pattern, card_replacer, segment, flags=re.DOTALL)
        
        # Wrap AHP/PIPRECIA/SWARA in fragment if they are single cards now but need fragments for consistency
        # Actually they already have fragments usually.
        
        new_middle += middle[last_pos:start_idx] + new_segment
        last_pos = next_idx
        
    new_middle += middle[last_pos:]

    with open('app/application/page.tsx', 'w', encoding='utf-8') as f:
        f.write(prefix + new_middle + suffix)
    print("Standardization complete.")

standardize_page()
