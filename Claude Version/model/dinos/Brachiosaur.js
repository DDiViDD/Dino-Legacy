// Brachiosaur species definition. Pure config — no logic.

EntityRegistry.register('Brachiosaur', {
    kind:                  'dino',
    assetPath:             'assets/Dinos/Brachiosaur.png',
    speed:                 35,
    width:                 64,
    height:                64,
    eatsGrass:             true,
    visionRange:           3,
    satiationDecayTimeSec: 30,
    seekFoodSatiation:     50,
    desperateSatiation:    20,
    spawnsOnDeath:         'skeleton',
    blocksTile:            true,
    isLiving:              true,
    dropsEntity:           'Coin',
    dropDelaySec:          15
});
