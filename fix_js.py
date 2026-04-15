with open('js/characters_v2.js', 'r') as f:
    c = f.read()
# Revert non-effects back:
c = c.replace('assets/sprites/vfx_${id}_v3.png', 'assets/sprites/vfx_${id}.png')
# Check characters top map:
# In c.sprites and c.vfxKick there are no .png extensions hardcoded in the object definitions usually, they are built dynamically in character.js?
# Wait! In characters_v2.js there are no hardcoded .png for sprites, except ultimateUrl!
c = c.replace('assets/ultimates/tanjiro_v2_v3.png', 'assets/ultimates/tanjiro_v2.png')
c = c.replace('assets/ultimates/nezuko_v2_v3.png', 'assets/ultimates/nezuko_v2.png')
c = c.replace('assets/ultimates/zenitsu_v2_v3.png', 'assets/ultimates/zenitsu_v2.png')
c = c.replace('assets/ultimates/inosuke_v2_v3.png', 'assets/ultimates/inosuke_v2.png')

with open('js/characters_v2.js', 'w') as f:
    f.write(c)

print("Fixed JS!")
