// skeleton: leftover after a dinosaur dies. Inert and walkable.

EntityRegistry.register('skeleton', {
    kind:                  'dino',
    assetPath:             'assets/Dinos/skeleton.png',
    speed:                 0,
    width:                 64,
    height:                64,
    eatsGrass:             false,
    visionRange:           0,
    satiationDecayTimeSec: 120,
    spawnsOnDeath:         null,
    blocksTile:            false,
    isLiving:              false
/*,
    minimapColor:          'rgb(230, 230, 230)'  // bone white on the minimap*/
});
