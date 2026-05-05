// BrachiosaurEgg: pure config. Behavior comes from BuyItemActions['spawnDinosaur'].

BuyItemRegistry.register('BrachiosaurEgg', {
    name:         'Brachiosaur Egg',
    cost:         100,
    assetPath:    'assets/UI/BrachiosaurEgg.png',
    description:  'Hatches into a Brachiosaur on the chosen tile.',
    actionType:   'spawnDinosaur',
    actionParams: { species: 'Brachiosaur' }
});
