import re

def standardize_page():
    with open('app/application/page.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # We will search for all <CardHeader> blocks that contain "Table" or "Step" in the title.
    # We will try to find the "Method context" by looking backwards for either
    # a method results check (e.g. {entropyResult && ...) OR a tab check (e.g. homeTab === "...")
    
    card_pattern = r'(<Card className="([^"]+)">\s*<CardHeader[^>]*>\s*<CardTitle[^>]*>(.*?)</CardTitle>\s*(?:<CardDescription[^>]*>(.*?)</CardDescription>\s*)?</CardHeader>)'
    
    # We need to find the overall bounds to avoid standardizing headers in Settings or Sidebar
    start_main = content.find('<main')
    if start_main == -1: start_main = 0
    
    # We'll work on the whole content but only replace if the title matches our criteria.
    
    current_method = "general"
    method_counters = {}
    
    def get_context(pos):
        # Look backwards from pos for weightMethod or similar
        search_text = content[:pos]
        
        # Check for weightMethod
        m = re.findall(r'weightMethod\s*===\s*"([^"]+)"', search_text)
        if m: 
            # We want the last one that also had a result check nearby
            # But for simplicity, we'll take the last one.
            return m[-1]
            
        # Check for ranking method
        m = re.findall(r'method\s*===\s*"([^"]+)"', search_text)
        if m: return m[-1]
        
        return "general"

    def replacer(match):
        full_match = match.group(0)
        card_class = match.group(2)
        raw_title = match.group(3).strip()
        raw_desc = match.group(4).strip() if match.group(4) else ""
        
        # Only process if it looks like a research asset table
        if not any(x in raw_title for x in ["Table", "Step", "Degree", "Weights", "Matrix"]):
             if "Chart" not in raw_title: # Keep charts if they have headers?
                 return full_match
        
        # Skip if it's already a ResearchAssetHeader (though the regex shouldn't match)
        if "ResearchAssetHeader" in full_match:
            return full_match

        pos = match.start()
        method = get_context(pos)
        
        clean_title = re.sub(r'^(Table \d+: |Step \d+: |Step \d+ - |Table \d+ - )', '', raw_title, flags=re.IGNORECASE).strip()
        clean_title = re.sub(r'<[^>]+>', '', clean_title).strip()
        clean_title = clean_title.upper()
        
        desc = re.sub(r'<[^>]+>', '', raw_desc).strip()
        desc = " ".join(desc.split())
        
        key_name = re.sub(r'[^a-zA-Z0-9]', '_', clean_title.lower())
        key_name = re.sub(r'_+', '_', key_name).strip('_')
        asset_key = f"{method}_{key_name}"
        
        # Unique counter per method context
        if method not in method_counters:
            method_counters[method] = 1
        
        table_id = method_counters[method]
        method_counters[method] += 1
        
        # Asset key overrides for consistency
        if 'matrix' in asset_key:
            if 'decision' in asset_key: asset_key = f"{method}_decision_matrix"
            elif 'normalized' in asset_key: asset_key = f"{method}_normalized_matrix"
        elif 'weight' in asset_key:
            asset_key = f"{method}_weights"
            
        if not key_name:
            asset_key = f"{method}_asset_{table_id}"

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
        return replacement

    # We only apply this after line 3000 where the results usually start
    new_content = re.sub(card_pattern, replacer, content, flags=re.DOTALL)
    
    with open('app/application/page.tsx', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Global standardization complete.")

standardize_page()
