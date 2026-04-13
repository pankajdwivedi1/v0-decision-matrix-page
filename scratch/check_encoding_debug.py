import sys

with open(r'c:\Users\PANKAJ DWIVEDI\Desktop\decisionalgo\app\application\page.tsx', 'rb') as f:
    chunk = f.read(2048)
    
print(f"Total bytes read: {len(chunk)}")
print(f"Bytes (hex): {chunk[:32].hex(' ')}")

try:
    text = chunk.decode('utf-8')
    print("Decoded as UTF-8 successfully")
except UnicodeDecodeError as e:
    print(f"UTF-8 decode error: {e}")

# Check for NULL bytes or other low ASCII
for i, b in enumerate(chunk):
    if b < 32 and b not in (9, 10, 13): # Not tab, LF, CR
        print(f"Control character {b} at byte {i}")
    if b > 127:
        print(f"Non-ASCII character {b} at byte {i}")
