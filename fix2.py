import re

def main():
    with open('app/application/page.tsx', 'r', encoding='utf-8') as f:
        text = f.read()

    # The area we want to search is where all methods are rendered.
    # We can match every <CardHeader> that has a CardTitle inside it with "Table X:" or "Step X:" or similar.
    # But ONLY if it's within a weight method.
    
    # Let's find all occurrences of <CardHeader>
    pattern = r'<Card className="([^"]+)">\s*<CardHeader[^>]*>\s*<CardTitle[^>]*>(.*?)</CardTitle>\s*<CardDescription[^>]*>(.*?)</CardDescription>\s*</CardHeader>'
    
    methods = [
        'entropy', 'critic', 'ahp', 'piprecia', 'merec', 'swara', 'wenslo', 'lopcow', 
        'dematel', 'sd', 'variance', 'mad', 'dbw', 'svp', 'mdm', 'lsw', 'gpow', 'lpwm', 
        'pcwm', 'roc', 'rr'
    ]

    # Let's identify the start of weight methods. Usually around: `weightMethod === "entropy"`
    start_idx = text.find('weightMethod === "entropy"')
    if start_idx == -1:
        print("Couldn't find entropy")
        return
        
    start_search = start_idx - 500
    end_search = text.rfind('</SidebarProvider>') # near the end of the file
    
    if end_search == -1:
        end_search = len(text)
        
    prefix = text[:start_search]
    middle = text[start_search:end_search]
    suffix = text[end_search:]

    # We will segment middle by `weightMethod === "X"`
    # So we know which method we are currently in.
    
    # We split middle into tokens
    # Actually, we can use a custom Replacer class that keeps track of the current method by looking backwards.
    
    def replacer(match):
        full_match = match.group(0)
        card_class = match.group(1)
        raw_title = match.group(2).strip()
        raw_desc = match.group(3).strip()
        
        # Strip HTML tags from description
        desc = re.sub(r'<[^>]+>', '', raw_desc).strip()
        desc = " ".join(desc.split())
        
        clean_title = re.sub(r'^(Table \d+: |Step \d+: |Step \d+ - )', '', raw_title, flags=re.IGNORECASE).strip()
        clean_title = clean_title.upper()
        
        # If clean_title still has HTML, clean it
        clean_title = re.sub(r'<[^>]+>', '', clean_title).strip()
        
        # Find which method we are currently in by looking at text before this match
        # We search backwards in `middle` from match.start() for `weightMethod === "..."`
        current_method = "unknown"
        pos = match.start()
        for method in methods:
            m_pos = middle.rfind(f'weightMethod === "{method}"', 0, pos)
            # Also it could be 'weightMethod === "equal"' which means we shouldn't touch it?
            # Equal weight doesn't have tables.
            if m_pos != -1:
                # We need the closest one
                closest_m_pos = m_pos
                closest_method = method
        
        # A robust way: find the last `weightMethod === "` before pos
        last_idx = middle.rfind('weightMethod === "', 0, pos)
        if last_idx != -1:
            q_idx = middle.find('"', last_idx + 18)
            if q_idx != -1:
                current_method = middle[last_idx + 18:q_idx]

        if current_method not in methods:
            # Maybe it's a ranking method? If so, leave it alone.
            return full_match
            
        # Let's generate a unique assetKey
        key_name = re.sub(r'[^a-zA-Z0-9]', '_', clean_title.lower())
        key_name = re.sub(r'_+', '_', key_name).strip('_')
        
        asset_key = f"{current_method}_{key_name}"
        
        # It needs sequential table numbering per method!
        # We need to maintain state.
        if not hasattr(replacer, 'counters'):
            replacer.counters = {}
            
        if current_method not in replacer.counters:
            replacer.counters[current_method] = 1
            
        t_num = replacer.counters[current_method]
        replacer.counters[current_method] += 1
        
        new_title = f"TABLE {t_num}: {clean_title}"
        if "TABLE" in clean_title:
            new_title = clean_title # avoid TABLE 1: TABLE 1:
        
        # Some assetKey overrides for standard tracking
        if 'decision_matrix' in asset_key:
            asset_key = f"{current_method}_decision_matrix"
        elif 'normalized' in asset_key:
            asset_key = f"{current_method}_normalized_matrix"
        elif 'final_weight' in asset_key or 'weight' in asset_key:
             asset_key = f"{current_method}_weights"
             
        replacement = f'''<Card className="{card_class}">
                    <div className="px-6 pt-4">
                      <ResearchAssetHeader
                        assetKey="{asset_key}"
                        title="{new_title}"
                        description="{desc}"
                      />
                    </div>'''
        return replacement

    new_middle = re.sub(pattern, replacer, middle, flags=re.DOTALL)
    
    # Post processing: fix AHP missing fragment? The syntax error was caused by a missing `<>`!
    # "Expected '</', got '{'" Next.js version: 16.0.7 (Turbopack)
    # This was because I had multiple `Card`s beside each other not wrapped in `<>...</>`.
    # Let's auto-wrap ALL method blocks if they have multiple top-level elements and are returned inside `{조건 && ( ... )}`
    
    # We can fix the syntax error directly by ensuring any `{ ... && ( ... )}` has a root element.
    # A simple regex to just insert `<>` after `(` and `</>` before `)` for these blocks.
    def wrap_fragments(m):
        code = m.group(1)
        if code.strip().startswith('<>'): return m.group(0) # already wrapped
        # If there's more than one root-level element, it needs wrapping.
        # Just wrap all of them to be safe!
        return f'{m.group(0).split("(")[0]}( \n<>\n{code}\n</> )'

    # Actually parsing JSX with regex is dangerous. I'll just save the file.
    # The syntax error in `page.tsx:3617` was related to MDM total deviation per criterion. I fixed it previously.
    
    final_text = prefix + new_middle + suffix
    with open('app/application/page.tsx', 'w', encoding='utf-8') as f:
        f.write(final_text)
    print("Replacements done!")

main()
