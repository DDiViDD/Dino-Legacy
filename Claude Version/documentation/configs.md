# Configs

This document lists every config-driven type in Dino Park: dinos, drops,
buy items, and terrain. Each section describes the fields a config file
may declare, their types, defaults, and what the engine does with them.

The format mirrors [OpenRA's traits documentation](https://docs.openra.net/en/release/traits/):
fields are presented as a property table per type, with required fields
marked **required**.

A short tutorial at the bottom walks through adding a new dinosaur from
scratch.

## Table of contents

- [Entities](#entities)
  - [Dinos (`kind: 'dino'`)](#dinos-kind-dino)
  - [Drops (`kind: 'drop'`)](#drops-kind-drop)
- [Buy items](#buy-items)
  - [`spawnDinosaur` action](#spawndinosaur-action)
  - [`addGrassLevel` action](#addgrasslevel-action)
- [Terrain](#terrain)
  - [Grass](#grass)
- [Master config lists](#master-config-lists)
- [Tutorial: adding a new dinosaur](#tutorial-adding-a-new-dinosaur)

---

## Entities

All entity-type configs (dinos, drops, and any future kinds) register
with **the same registry** — `EntityRegistry`. Each config declares a
`kind` field that determines which concrete class is instantiated by
`EntityFactory`.

Entity config files live in subfolders under `model/`, grouped by kind:

```
model/dinos/      kind: 'dino'
model/drops/      kind: 'drop'
```

A config file is a single registry call with a flat dictionary:

```js
EntityRegistry.register('Brachiosaur', {
    kind:        'dino',
    assetPath:   'assets/Dinos/Brachiosaur.png',
    speed:       35,
    /* …more fields… */
});
```

### Dinos (`kind: 'dino'`)

A living creature. Wanders, eats grass, gets hungry, dies, can drop
items on a timer, leaves a corpse on death.

| Property | Default | Type | Description |
| --- | --- | --- | --- |
| `kind` | **required** | String | Must be `'dino'`. Tells `EntityFactory` to use the `Dinosaur` constructor. |
| `assetPath` | **required** | String | Path to the sprite PNG, relative to the project root. |
| `width` | `0` | Integer | Sprite width in pixels. The renderer centers the sprite within its `TILE_SIZE` cell using this. |
| `height` | `0` | Integer | Sprite height in pixels. |
| `speed` | `0` | Number | Movement speed in pixels per second. `0` makes the dino stationary (used for skeletons). |
| `eatsGrass` | `false` | Boolean | Whether the dino seeks and consumes grass tiles when hungry. |
| `visionRange` | `0` | Integer | How far (in tiles) the dino can see grass. Distance is Euclidean — circular vision. |
| `satiationDecayTimeSec` | `120` (`DEFAULT_SATIATION_DECAY_TIME_SEC`) | Number | Seconds for satiation to drop from `MAX_SATIATION` (100) to 0. Set to `null` or any negative number to disable hunger entirely (useful for skeletons). |
| `seekFoodSatiation` | `50` (`DEFAULT_SEEK_FOOD_SATIATION`) | Number | Below this satiation, the dino actively seeks the highest-level grass it can see (closest as tiebreaker). |
| `desperateSatiation` | `20` (`DEFAULT_DESPERATE_SATIATION`) | Number | Below this, behavior switches to seeking the **closest** grass instead of the best (highest level as tiebreaker). |
| `spawnsOnDeath` | `null` | String | Name of an entity to spawn at this dino's position when it dies. Typically a skeleton variant. The named entity must also be registered. |
| `blocksTile` | `false` | Boolean | When `true`, this entity reserves its destination tile during movement and blocks other blockers from occupying or moving through it. Living dinos block, skeletons don't. |
| `isLiving` | `true` | Boolean | When `false`, the entity is excluded from the "living dino count" used by the score formula and the auto-spawn logic. |
| `dropsEntity` | `null` | String | If set, the dino periodically spawns a drop of this name (must be registered with `kind: 'drop'`). |
| `dropDelaySec` | `null` | Number | Seconds between drops. Required when `dropsEntity` is set. `null` or any negative number disables drops. |
| `minimapColor` | sampled | String (`'rgb(r,g,b)'`) | Optional pinned color for the minimap. When omitted, the average non-transparent pixel color of the sprite is used. Useful when sprite averaging produces a misleading color (e.g. a mostly-transparent skeleton averaging slightly off-white). |

#### Example — living dino

```js
EntityRegistry.register('Brachiosaur', {
    kind:                  'dino',
    assetPath:             'assets/Dinos/Brachiosaur.png',
    width:                 64,
    height:                64,
    speed:                 35,
    eatsGrass:             true,
    visionRange:           3,
    satiationDecayTimeSec: 120,
    seekFoodSatiation:     50,
    desperateSatiation:    20,
    spawnsOnDeath:         'skeleton',
    blocksTile:            true,
    isLiving:              true,
    dropsEntity:           'Coin',
    dropDelaySec:          15
});
```

#### Example — corpse

```js
EntityRegistry.register('skeleton', {
    kind:                  'dino',
    assetPath:             'assets/Dinos/skeleton.png',
    width:                 64,
    height:                64,
    speed:                 0,
    eatsGrass:             false,
    blocksTile:            false,
    isLiving:              false,
    minimapColor:          'rgb(230, 230, 230)'
});
```

### Drops (`kind: 'drop'`)

A clickable, collectible entity placed by another entity (typically a
dino on a timer). Awards credits when clicked. May despawn after a
configurable lifespan.

| Property | Default | Type | Description |
| --- | --- | --- | --- |
| `kind` | **required** | String | Must be `'drop'`. Tells `EntityFactory` to use the `Drop` constructor. |
| `assetPath` | **required** | String | Path to the sprite PNG. |
| `width` | `0` | Integer | Sprite width in pixels. Used by `EntityView` for centering. |
| `height` | `0` | Integer | Sprite height in pixels. |
| `clickCredits` | `0` | Integer | Coins added to the player's wallet when clicked. |
| `lifespanSec` | `null` | Number | Seconds the drop remains on the map before auto-despawning. `null` means it stays until clicked. |
| `minimapColor` | sampled | String | Same as for dinos. Recommended for drops since they're small and may average to muddy colors. |

#### Example

```js
EntityRegistry.register('Coin', {
    kind:         'drop',
    assetPath:    'assets/UI/Coin.png',
    width:        25,
    height:       25,
    clickCredits: 20,
    lifespanSec:  15,
    minimapColor: 'rgb(255, 215, 60)'
});
```

---

## Buy items

Buy items are entries in the right-side shop panel. Clicking one selects
it; clicking a tile then runs the configured action with the player and
tile as context. Right-click cancels the selection.

Each config file in `model/buyitems/` calls `BuyItemRegistry.register(id, def)`.

| Property | Default | Type | Description |
| --- | --- | --- | --- |
| `name` | **required** | String | Display name shown under the icon. |
| `cost` | **required** | Integer | Coins deducted on a successful action. |
| `assetPath` | **required** | String | Icon sprite, ~48×48 recommended. |
| `actionType` | **required** | String | Key into `BuyItemActions`. See subsections below for available actions. |
| `actionParams` | `{}` | Object | Free-form payload passed to the action handler. Shape depends on `actionType`. |
| `description` | `''` | String | Optional tooltip text shown in the shop status line. |

The action runs only if the player can afford it AND the action handler
returns `true`. If it returns `false` (e.g. the tile already has a
blocker), no coins are deducted.

### `spawnDinosaur` action

Spawns a registered entity at the clicked tile.

#### `actionParams`

| Property | Default | Type | Description |
| --- | --- | --- | --- |
| `species` | **required** | String | Name of an `EntityRegistry` entry with `kind: 'dino'`. |

The action fails if the target tile already has a blocker.

#### Example

```js
BuyItemRegistry.register('BrachiosaurEgg', {
    name:         'Brachiosaur Egg',
    cost:         100,
    assetPath:    'assets/UI/BrachiosaurEgg.png',
    actionType:   'spawnDinosaur',
    actionParams: { species: 'Brachiosaur' }
});
```

### `addGrassLevel` action

Increases the grass level of the clicked tile, capped at `GrassLevel.Level3`.

#### `actionParams`

| Property | Default | Type | Description |
| --- | --- | --- | --- |
| `amount` | `1` | Integer | How many grass levels to add. |

The action fails if the tile is already at `Level3`.

#### Example

```js
BuyItemRegistry.register('GrassSeeds', {
    name:         'Grass Seeds',
    cost:         20,
    assetPath:    'assets/UI/GrassSeeds.png',
    actionType:   'addGrassLevel',
    actionParams: { amount: 1 }
});
```

---

## Terrain

Terrain configs live in `model/terrain/` and register with `TerrainRegistry`.
Currently only `Grass` is implemented; the system is designed to support
other terrain types (water, sand, etc.) by adding new files here.

### Grass

Tiles have one of four grass levels (`GrassLevel.Level0` through `Level3`),
defined in `Constants.js`. Each level has an asset path, a satiation
gain when eaten, and timings for natural growth and spread.

| Property | Default | Type | Description |
| --- | --- | --- | --- |
| `assetPathByLevel` | **required** | Object<Integer, String> | Maps grass level (0–3) to asset path. |
| `satiationByLevel` | `{}` | Object<Integer, Integer> | How much satiation eating a tile of this level grants. Levels not listed give `0`. |
| `growthDelaySecByLevel` | `{}` | Object<Integer, Number\|null> | Seconds before a tile of this level grows to the next level. `null` or negative means "never grows" — typically used so Level3 doesn't grow further. |
| `spreadDelaySecByLevel` | `{}` | Object<Integer, Number\|null> | Seconds before a tile of this level spreads to a randomly-selected adjacent barren neighbor. `null` or negative disables spreading. Diagonal spread is rate-limited (~28% of attempts) to keep growth feeling natural. |

#### Example

```js
TerrainRegistry.register('Grass', {
    assetPathByLevel: {
        0: 'assets/Terrain/GrassLevel0.png',
        1: 'assets/Terrain/GrassLevel1.png',
        2: 'assets/Terrain/GrassLevel2.png',
        3: 'assets/Terrain/GrassLevel3.png'
    },
    satiationByLevel:    { 1: 10, 2: 25, 3: 50 },
    growthDelaySecByLevel: { 0: null, 1: 60,   2: 120,  3: null },
    spreadDelaySecByLevel: { 0: null, 1: null, 2: null, 3: 30   }
});
```

The `null` values are explicit "never" markers, made unambiguous by the
`isNeverValue()` helper in `Constants.js`. Using `null`, `undefined`,
`NaN`, or any negative number all mean "no growth/spread at this level."

---

## Master config lists

The engine doesn't scan folders; you tell it which configs exist via the
master lists in `config/`. Adding a new config file requires adding its
basename to the right list.

### `config/EntityConfigList.js`

Groups entity configs by their folder path. The loader concatenates `path`
and `configs[i] + '.js'` to get the file URL.

```js
var EntityConfigList = [
    { path: 'model/dinos/', configs: ['Brachiosaur', 'skeleton'] },
    { path: 'model/drops/', configs: ['Coin'] }
];
```

To add a brand-new entity **kind** (e.g. `structure`):
1. Add a new group `{ path: 'model/structures/', configs: [...] }` here.
2. Register a constructor in `EntityFactory`:
   ```js
   EntityFactory.register('structure',
       function(name, x, y) { return new Structure(x, y, name); });
   ```
3. Implement the `Structure` class.

### `config/TerrainListConfig.js`

```js
var TerrainListConfig = ['Grass'];
```

### `config/BuyMenuConfig.js`

Order in this list = display order in the shop.

```js
var BuyMenuConfig = ['BrachiosaurEgg', 'GrassSeeds'];
```

---

## Tutorial: adding a new dinosaur

Goal: add a small fast dinosaur called `Compy` that hatches from a 50-coin
egg, eats grass quickly, drops coins more often than the Brachiosaur, and
leaves a skeleton when it dies.

### Step 1 — drop in the sprite

Save your 64×64 PNG to `assets/Dinos/Compy.png`. (Mostly-transparent edges
are fine; the renderer handles them.)

### Step 2 — write the dino config

Create `model/dinos/Compy.js`:

```js
EntityRegistry.register('Compy', {
    kind:                  'dino',
    assetPath:             'assets/Dinos/Compy.png',
    width:                 64,
    height:                64,
    speed:                 60,
    eatsGrass:             true,
    visionRange:           4,
    satiationDecayTimeSec: 60,
    seekFoodSatiation:     60,
    desperateSatiation:    25,
    spawnsOnDeath:         'skeleton',
    blocksTile:            true,
    isLiving:              true,
    dropsEntity:           'Coin',
    dropDelaySec:          8
});
```

### Step 3 — register the dino with the engine

Open `config/EntityConfigList.js` and add `'Compy'` to the dinos group:

```js
var EntityConfigList = [
    { path: 'model/dinos/', configs: ['Brachiosaur', 'skeleton', 'Compy'] },
    { path: 'model/drops/', configs: ['Coin'] }
];
```

That's enough to make the engine know about the species. You can already
spawn one from the browser console after the page loads:

```js
__game.world.addEntity(EntityFactory.create('Compy', 200, 200));
```

### Step 4 — write the buy item

Create `model/buyitems/CompyEgg.js`:

```js
BuyItemRegistry.register('CompyEgg', {
    name:         'Compy Egg',
    cost:         50,
    assetPath:    'assets/UI/CompyEgg.png',
    actionType:   'spawnDinosaur',
    actionParams: { species: 'Compy' }
});
```

Drop a 48×48 icon at `assets/UI/CompyEgg.png`.

### Step 5 — show the buy item in the shop

Open `config/BuyMenuConfig.js` and add `'CompyEgg'`:

```js
var BuyMenuConfig = ['BrachiosaurEgg', 'CompyEgg', 'GrassSeeds'];
```

### Step 6 — refresh

Reload the page. The shop now shows the Compy egg between the Brachiosaur
egg and the grass seeds. Buying one and clicking a grass tile spawns a
fast little dino that wanders, eats hungrily, and drops coins every 8
seconds.

### What you didn't have to touch

You didn't edit any model class, any view, the World, the Scheduler, the
factory, or the asset loader. The new dino is discovered by the existing
config system, asset preloader, factory, and behavior modules.

That's the design goal: **content is data, not code.** If you find
yourself editing a class to add a creature, the architecture has
regressed and the change should probably be pulled back into config.
