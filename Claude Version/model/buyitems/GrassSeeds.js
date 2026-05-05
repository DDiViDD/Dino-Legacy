// GrassSeeds: pure config. Behavior comes from BuyItemActions['addGrassLevel'].

BuyItemRegistry.register('GrassSeeds', {
    name:         'Grass Seeds',
    cost:         20,
    assetPath:    'assets/UI/GrassSeeds.png',
    description:  'Raises a tile\'s grass level by one.',
    actionType:   'addGrassLevel',
    actionParams: { amount: 1 }
});
