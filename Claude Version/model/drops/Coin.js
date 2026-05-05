// Coin: clickable drop awarding credits.

EntityRegistry.register('Coin', {
    kind:         'drop',
    assetPath:    'assets/UI/Coin.png',
    width:        25,
    height:       25,
    clickCredits: 20,
    lifespanSec:  15,
    minimapColor: 'rgb(255, 215, 60)'   // gold dot on the minimap
});
