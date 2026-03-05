import re

def process_page_tsx():
    with open('app/application/page.tsx', 'r', encoding='utf-8') as f:
        text = f.read()

    # The block containing weight methods starts around:
    # {weightMethod === "entropy" && entropyResult && (
    
    methods = [
        'entropy', 'critic', 'ahp', 'piprecia', 'merec', 'swara', 'wenslo', 'lopcow', 
        'dematel', 'sd', 'variance', 'mad', 'dbw', 'svp', 'mdm', 'lsw', 'gpow', 'lpwm', 
        'pcwm', 'roc', 'rr'
    ]
    
    # We will search for all blocks like:
    # <CardHeader className="pb-3...">
    #   <CardTitle ...>Table X: TITLE</CardTitle>
    #   <CardDescription ...>DESC</CardDescription>
    # </CardHeader>
    # And replace with:
    # <div className="px-6 pt-4">
    #   <ResearchAssetHeader assetKey="..." title="TITLE" description="DESC" />
    # ... Wait, the original was just <ResearchAssetHeader ... /> but wrapped in <div className="px-6 pt-4"> ?
    # Wait, the CardHeader is usually replaced completely.
    # What was the structure?
    # <Card className="border-gray-200 bg-white shadow-none mb-6">
    #   <div className="px-6 pt-4">
    #     <ResearchAssetHeader assetKey="..." title="TITLE" description="DESC" />
    #   </div>
    #   <CardContent className="pt-3">
    
    def replace_card_header(match):
        full_match = match.group(0)
        card_class = match.group(1)
        header_content = match.group(2)
        
        # Extract title
        m_title = re.search(r'<CardTitle[^>]*>(.*?)</CardTitle>', header_content, re.DOTALL)
        # Extract description
        m_desc = re.search(r'<CardDescription[^>]*>(.*?)</CardDescription>', header_content, re.DOTALL)
        
        if not m_title: return full_match
        
        raw_title = m_title.group(1).strip()
        desc = "".join(m_desc.group(1).split()).strip() if m_desc else ""
        if m_desc:
            desc = re.sub(r'<[^>]+>', '', m_desc.group(1)).strip() # strip tags from desc
            desc = " ".join(desc.split())
            
        # Strip "Table X:" or "Step X:" from raw_title
        clean_title = re.sub(r'^(Table \d+: |Step \d+: )', '', raw_title, flags=re.IGNORECASE).strip()
        # Convert title to ALL CAPS
        clean_title = clean_title.upper()
        
        # Decide an assetKey based on clean_title
        key_name = re.sub(r'[^a-zA-Z0-9]', '_', clean_title.lower())
        key_name = re.sub(r'_+', '_', key_name).strip('_')
        
        # We need the method context to make it unique.
        # But we don't have the method context here easily unless we pass it.
        # So we'll use a placeholder and fix it in a second pass.
        
        replacement = f'''<Card className="{card_class}">
                    <div className="px-6 pt-4">
                      <ResearchAssetHeader
                        assetKey="METHOD__{key_name}"
                        title="{clean_title}"
                        description="{desc}"
                      />
                    </div>'''
        
        return replacement

    # We will only apply this inside the weight calculation methods area.
    # Let's find the start of the weight calculation methods.
    start_idx = text.find('{(homeTab === "rankingMethods" || homeTab === "weightMethods")')
    end_idx = text.find('{/* AI Review Assistant Panel */}')
    if start_idx == -1 or end_idx == -1:
        print("Could not find bounds")
        return

    prefix = text[:start_idx]
    suffix = text[end_idx:]
    middle = text[start_idx:end_idx]

    # Pattern to match <Card> followed by <CardHeader>
    # It might have className="..."
    pattern = r'<Card className="([^"]+)">\s*<CardHeader[^>]*>(.*?)</CardHeader>'
    
    # We segment by method
    new_middle = ""
    last_idx = 0
    
    # regex to find where a method block starts
    method_starts = []
    for m in methods:
        for match in re.finditer(rf'\{{weightMethod === "{m}"', middle):
            method_starts.append((match.start(), m))
            
    method_starts.sort()
    
    for i, (start_pos, method) in enumerate(method_starts):
        next_pos = method_starts[i+1][0] if i+1 < len(method_starts) else len(middle)
        
        block = middle[start_pos:next_pos]
        
        # Now find all CardHeaders in this block and replace
        table_count = 1
        
        def block_replacer(match):
            nonlocal table_count
            full_match = match.group(0)
            card_class = match.group(1)
            header_content = match.group(2)
            
            m_title = re.search(r'<CardTitle[^>]*>(.*?)</CardTitle>', header_content, re.DOTALL)
            m_desc = re.search(r'<CardDescription[^>]*>(.*?)</CardDescription>', header_content, re.DOTALL)
            
            if not m_title: return full_match
            
            raw_title = m_title.group(1).strip()
            desc = ""
            if m_desc:
                desc = re.sub(r'<[^>]+>', '', m_desc.group(1)).strip()
                desc = " ".join(desc.split())
                
            clean_title = re.sub(r'^(Table \d+: |Step \d+: )', '', raw_title, flags=re.IGNORECASE).strip()
            clean_title = clean_title.upper()
            
            key_name = re.sub(r'[^a-zA-Z0-9]', '_', clean_title.lower())
            key_name = re.sub(r'_+', '_', key_name).strip('_')
            
            asset_key = f"{method}_{key_name}"
            # ensure it has 'table' or similar
            if 'matrix' not in asset_key and 'weight' not in asset_key and 'value' not in asset_key:
                asset_key = f"{method}_table_{table_count}"
                
            # If it's literally just the method name for some reason
            if asset_key == f"{method}_": asset_key = f"{method}_table_{table_count}"
            
            replacement = f'''<Card className="{card_class}">
                    <div className="px-6 pt-4">
                      <ResearchAssetHeader
                        assetKey="{asset_key}"
                        title="TABLE {table_count}: {clean_title}"
                        description="{desc}"
                      />
                    </div>'''
            table_count += 1
            return replacement

        new_block = re.sub(pattern, block_replacer, block, flags=re.DOTALL)
        
        # also fix fragments for AHP and PIPRECIA and SWARA
        if method in ['ahp', 'piprecia', 'swara']:
            # if they are not wrapped in <>, wrap their primary UI content.
            # actually they already have <> if it's there, but wait, the syntax error previously was because of <> ?
            pass
            
        new_middle += new_block

    # Combine back
    final_text = prefix + new_middle + suffix
    
    # Save the file
    with open('app/application/page.tsx', 'w', encoding='utf-8') as f:
        f.write(final_text)
        
    print("Replaced and saved!")

process_page_tsx()
