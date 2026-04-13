
import sys
import os

target_file = r'app/application/page.tsx'

# Dictionary of corrupted sequences and their correct counterparts
replacements = {
    'âÅ“Â Ã¯Â¸Â ': '📝',
    'âÅ“…': '✅',
    'âÅ““': '✅',
    'âÅ“Â¨': '✨',
    'â†‘': '↑',
    'â†“': '↓',
    'ðŸª„': '🪄',
    'ðŸ¤–': '🤖',
    'âÅ¡Â Ã¯Â¸Â ': '⚠️',
    'âÅ¡™Ã¯Â¸Â ': '⚙️',
    'ðŸ“š': '📚',
    'ðŸ †': '🏆',
    'ââ€º“Ã¯Â¸Â ': '⛓️',
    'Ã‚©': '©',
    'ââ‚¬”': '—',
    'â†’': '→',
    '1Ã¯Â¸Â âÆ’Â£': '1️⃣',
    '2Ã¯Â¸Â âÆ’Â£': '2️⃣',
    '3Ã¯Â¸Â âÆ’Â£': '3️⃣',
    '4Ã¯Â¸Â âÆ’Â£': '4️⃣',
    '5Ã¯Â¸Â âÆ’Â£': '5️⃣',
    'Î£': 'Σ',
    'Ïƒ': 'σ',
    'ÃŽÂ£': 'Σ',
    'ÃŽÂ£Ã‚Â²': 'Σ²',
    'ÃŽÅ¾': 'Ξ',
    'ÃŽ”': 'Δ',
    'Ã â€ ': '†',
    'â »': '⁻',
    'â º': '⁺',
    'ðŸ•': '🧪',
    'ðŸŒ¡Ã¯Â¸Â ': '🌡️',
    'ðŸŸ¦': '🟦',
    'ðŸ•¸Ã¯Â¸Â ': '🕷️',
}

try:
    with open(target_file, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    original_content = content
    for old, new in replacements.items():
        content = content.replace(old, new)
    
    if content != original_content:
        with open(target_file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Successfully cleaned {target_file}")
    else:
        print("No more matches found to replace.")

except Exception as e:
    print(f"Error: {e}")
