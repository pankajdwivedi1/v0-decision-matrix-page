import re

def standardize_page():
    with open('app/application/page.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    card_pattern = r'(<Card className="([^"]+)">\s*<CardHeader[^>]*>\s*<CardTitle[^>]*>(.*?)</CardTitle>\s*(?:<CardDescription[^>]*>(.*?)</CardDescription>\s*)?</CardHeader>)'
    
    current_method = "general"
    method_counters = {}
    
    def get_context(pos):
        search_text = content[:pos]
        # Look for the last method check before this position
        # We search for things like `weightMethod === "entropy"` or `{entropyResult &&`
        matches = list(re.finditer(r'weightMethod === "([^"]+)"', search_text))
        if matches:
            return matches[-1].group(1)
        
        matches = list(re.finditer(r'method === "([^"]+)"', search_text))
        if matches:
            return matches[-1].group(1)
            
        return "general"

    def replacer(match):
        full_match = match.group(0)
        card_class = match.group(2)
        raw_title = match.group(3).strip()
        raw_desc = match.group(4).strip() if match.group(4) else ""
        
        # Only process if it looks like a research asset table/chart
        # We want to catch Tables, Steps, and charts that are main results
        if not any(x in raw_title for x in ["Table", "Step", "Degree", "Weights", "Matrix", "Chart", "Ranking"]):
             return full_match
        
        # Skip if it's already a ResearchAssetHeader
        if "ResearchAssetHeader" in full_match:
            return full_match

        pos = match.start()
        method = get_context(pos)
        
        # Clean title
        clean_title = re.sub(r'^(Table \d+: |Step \d+: |Step \d+ - |Table \d+ - |Step \d+\. )', '', raw_title, flags=re.IGNORECASE).strip()
        clean_title = re.sub(r'<[^>]+>', '', clean_title).strip()
        clean_title = clean_title.upper()
        
        desc = re.sub(r'<[^>]+>', '', raw_desc).strip()
        desc = " ".join(desc.split())
        
        key_name = re.sub(r'[^a-zA-Z0-9]', '_', clean_title.lower())
        key_name = re.sub(r'_+', '_', key_name).strip('_')
        asset_key = f"{method}_{key_name}"
        
        # Asset key overrides for consistency
        if 'decision_matrix' in asset_key:
            asset_key = f"{method}_decision_matrix"
        elif 'normalized_decision_matrix' in asset_key or 'normalization' in asset_key:
            asset_key = f"{method}_normalized_matrix"
        elif 'final_weights' in asset_key or 'weights' in asset_key:
             asset_key = f"{method}_weights"
        elif 'alternative_rankings' in asset_key or 'final_rankings' in asset_key or 'ranking' in asset_key:
             asset_key = f"{method}_rankings"
             
        if not key_name:
            asset_key = f"{method}_asset_{pos}"

        if method not in method_counters:
            method_counters[method] = 1
        
        table_id = method_counters[method]
        method_counters[method] += 1
        
        # Determine label type (Table or Figure)
        label_prefix = "Figure" if "CHART" in clean_title or "PLOT" in clean_title else "Table"
        default_label = f"{label_prefix} {table_id}"

        replacement = f"""<Card className="{card_class}">
                    <div className="px-6 pt-4">
                      <ResearchAssetHeader
                        assetKey="{asset_key}"
                        defaultLabel="{default_label}"
                        title="{clean_title}"
                        included={{selectedAiAssets.has("{asset_key}")}}
                        onIncludeChange={{handleIncludeChange}}
                        onLabelChange={{handleAssetLabelChange}}
                      />
                    </div>"""
        return replacement

    # We need to process from the bottom up or use a regex sub to avoid messing with indices
    # But sub handles it.
    new_content = re.sub(card_pattern, replacer, content, flags=re.DOTALL)
    
    with open('app/application/page.tsx', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Final global standardization complete.")

standardize_page()
