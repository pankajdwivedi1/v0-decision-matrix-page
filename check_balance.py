
import sys

def check_jsx_balance(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Very primitive check for < and >
    # This won't handle comments or strings well, but might catch obvious stuff
    open_tags = []
    lines = content.split('\n')
    
    for i, line in enumerate(lines):
        # Extremely simplified: look for <Something and </Something
        # This is very prone to false positives but might help
        pass

    # Better approach: check for common bracket/brace balance
    stack = []
    pairs = {
        '(': ')',
        '[': ']',
        '{': '}'
    }
    
    for i, char in enumerate(content):
        if char in pairs:
            stack.append((char, i))
        elif char in pairs.values():
            if not stack:
                print(f"Extra closing {char} at index {i}")
                # Find line number
                line_no = content[:i].count('\n') + 1
                print(f"Around line {line_no}")
                return
            top, pos = stack.pop()
            if pairs[top] != char:
                print(f"Mismatched {top} at {pos} with {char} at {i}")
                line_no = content[:i].count('\n') + 1
                print(f"Around line {line_no}")
                return
    
    if stack:
        for char, pos in stack:
            print(f"Unclosed {char} at {pos}")
            line_no = content[:pos].count('\n') + 1
            print(f"Around line {line_no}")
    else:
        print("Brackets/Braces seem balanced.")

if __name__ == "__main__":
    check_jsx_balance(sys.argv[1])
