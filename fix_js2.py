import re

with open('js/characters_v2.js', 'r') as f:
    c = f.read()

# I want to undo 'assets/sprites/.*_v3.png' -> '.png'
# But wait, did they originally have _v2 or nothing?
# In previous conversation logs, they were probably tanjiro_idle.png!
# Let's restore the original `characters_v2.js` from git? Is it in git?
