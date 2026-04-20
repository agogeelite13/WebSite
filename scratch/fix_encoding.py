
import sys

with open('styles.css', 'rb') as f:
    content = f.read()

# Try to decode as UTF-8 and fix specific sequences
try:
    text = content.decode('utf-8')
except UnicodeDecodeError:
    text = content.decode('latin-1')

# Fix common mangled sequences
text = text.replace('â—ˆ', '✦')
text = text.replace('Ã©lite', 'elite')
text = text.replace('ǽ?"', '✦') # From the cat output
text = text.replace('ǟlite', 'elite')

with open('styles.css', 'w', encoding='utf-8') as f:
    f.write(text)
print("Fix applied")
