with open('js/characters_v2.js', 'r') as f:
    c = f.read()

# All sprites and ultimates should NOT have _v3
import re
# Replace 'assets/sprites/XXX_v3.png' -> 'assets/sprites/XXX.png'
# Replace 'assets/ultimates/XXX_v3.png' -> 'assets/ultimates/XXX.png'
def repl(m):
    return m.group(0).replace('_v3.png', '.png')

c = re.sub(r'assets/sprites/[^' + "'" + r']+_v3\.png', repl, c)
c = re.sub(r'assets/ultimates/[^' + "'" + r']+_v3\.png', repl, c)
c = re.sub(r'assets/bg/[^' + "'" + r']+_v3\.png', repl, c)

with open('js/characters_v2.js', 'w') as f:
    f.write(c)

print("Restored ALL sprites to correct paths!")
