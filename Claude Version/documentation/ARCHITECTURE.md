# Architecture

This document explains the patterns and structure of the Dino Park
codebase, aimed at students and contributors. It names each pattern in
the language used by industry and books, and points to the canonical
example file for each. Once you can navigate this map, the rest of the
code reads itself.

For a list of every config-driven type and its fields, see
[`docs/configs.md`](docs/configs.md).

## Table of contents

1. [Goals & constraints](#goals--constraints)
2. [Folder map](#folder-map)
3. [Layered architecture (MVVM)](#layered-architecture-mvvm)
4. [Event-driven model](#event-driven-model)
5. [Config-driven content (registries + factories)](#config-driven-content-registries--factories)
6. [Behaviors as systems](#behaviors-as-systems)
7. [The Scheduler](#the-scheduler)
8. [Tile reservations & the spatial index](#tile-reservations--the-spatial-index)
9. [Encapsulation via IIFE](#encapsulation-via-iife)
10. [The boot chain](#the-boot-chain)
11. [Testing](#testing)
12. [What this codebase deliberately doesn't have](#what-this-codebase-deliberately-doesnt-have)

---

## Goals & constraints

- **Runs from `file://`** with no server, no build step, no bundler. This
  was a hard constraint and shaped the whole design — no ES modules, no
  TypeScript, no React.
- **ES5 syntax.** `var`, prototypes, `Object.create` for inheritance.
  This is intentionally retro to keep the code obvious to read; the
  patterns themselves are timeless.
- **No external runtime dependencies.** Everything is in this repo.

If you're reading this in 2030 and wondering why we're not using
something modern: the original goal was teaching architecture in a form
where every line is inspectable and there's nothing happening at build
time. The patterns translate directly to React/Vue/Unity/Unreal.

## Folder map

```
config/        Master lists naming what configs to load
model/         Pure game logic. No DOM, no rendering.
  buyitems/    Buy-item configs (data files)
  dinos/       Dino species configs
  drops/       Drop-type configs
  terrain/     Terrain configs
viewmodel/     DOM renderers + input controllers. Read model, never mutate it.
view/          CSS only. One file per UI component, glued by view/style.css.
tests/         Unit tests + tiny test framework. Open tests/test.html.
docs/          Human-facing reference docs (configs.md).
assets/        Images.
```

The folder boundary IS the architectural boundary. Code in `model/`
genuinely can't reach into `viewmodel/` because we never include the
viewmodel files when running tests. The discipline is enforced by what
each file imports (or doesn't).

## Layered architecture (MVVM)

This codebase follows **Model–View–ViewModel** strictly:

- `model/` — the world, entities, tiles, actions, scheduler, game state.
  Pure JS; reading any model file should never reveal a `document.`
  call or a `getElementById`.
- `viewmodel/` — renderers and input controllers. Subscribes to model
  events, mutates the DOM in response. NEVER mutates models — if a click
  needs to change the world, the viewmodel calls a model method.
- `view/` — CSS only. One file per UI component. Imported by
  `view/style.css` so HTML still has one `<link>` tag.

**Why it matters:** you could delete the entire `viewmodel/` folder and
the model still ticks correctly. You could replace it with a Canvas
renderer or a WebGL one and never touch a model file. Most hobby games
fail this test by mid-development; we hold the line.

**Canonical examples:**
- Model: [`model/World.js`](model/World.js), [`model/Dinosaur.js`](model/Dinosaur.js)
- ViewModel: [`viewmodel/WorldView.js`](viewmodel/WorldView.js)
- View: [`view/world.css`](view/world.css)

## Event-driven model

The model never knows who's listening. It just emits events:

```js
world.on('tick',         function(payload) { /* … */ });
world.on('cameraMoved',  function(camera)  { /* … */ });
world.on('entityAdded',  function(entity)  { /* … */ });
world.on('tileChanged',  function(tile)    { /* … */ });
```

Renderers subscribe; behaviors subscribe; the HUD subscribes. The model
is unaware. This is the **observer pattern** (a.k.a. publish/subscribe),
the same pattern Vue's reactivity, React's hooks, and game engines like
Unity's events are built on.

**Canonical example:** see the listener registration in
[`model/World.js`](model/World.js). Note how `_emit` knows nothing about
its consumers.

## Config-driven content (registries + factories)

Three principles:

1. **Content is data, not code.** Adding a new dinosaur is one config
   file with no logic, plus a name in a master list. Same for buy items,
   drops, terrain. If you find yourself editing a class to add content,
   the architecture has regressed.
2. **A registry is a name → definition map.** It's the indexed store
   that makes lookups by name cheap. See [`model/EntityRegistry.js`](model/EntityRegistry.js).
3. **A factory turns a name into an object.** It uses the registry to
   look up the entity's `kind`, then calls the right constructor. See
   [`model/EntityFactory.js`](model/EntityFactory.js).

The pattern in pseudocode:

```
registry.register(name, def)              // many configs do this on load
factory.create(name, x, y)                // game code does this at runtime
   └─ kind = registry.kindOf(name)
   └─ ctor = ctorsByKind[kind]
   └─ return ctor(name, x, y)
```

The same pattern is used three times:
- `EntityRegistry` + `EntityFactory` for dinos and drops (and any future kinds)
- `TerrainRegistry` for terrain
- `BuyItemRegistry` + `BuyItemActions` for shop items

**Master config lists:**
- [`config/EntityConfigList.js`](config/EntityConfigList.js) — entity configs grouped by folder
- [`config/TerrainListConfig.js`](config/TerrainListConfig.js)
- [`config/BuyMenuConfig.js`](config/BuyMenuConfig.js)

The corresponding **loaders** (`EntityLoader`, `TerrainLoader`,
`BuyItemLoader`) read these lists and inject `<script>` tags at runtime.

## Behaviors as systems

A **behavior** is a module that attaches to the world, listens for
events, and reacts. Behaviors don't own state on entities — they
schedule callbacks against the world's scheduler.

This is the same pattern Unity calls **systems** (in their ECS), or what
old MUDs call **daemons**. The core idea: keep entity classes small,
push the cross-cutting "what happens over time" logic into separate
files that subscribe.

Two examples:

- [`model/GrassBehavior.js`](model/GrassBehavior.js) — schedules grass
  growth and spread for every tile, with version-bumping so canceled
  schedules don't fire stale callbacks.
- [`model/DinoDropBehavior.js`](model/DinoDropBehavior.js) — when a dino
  is added, schedules its periodic drop spawns; checks `dino.dead`
  before each spawn so dead dinos stop dropping.

Adding a new behavior (e.g. weather, day/night, predator-prey
relationships) is a new file in `model/` plus a `bootstrap(world)` call
in `main.js`. Existing code is untouched.

## The Scheduler

The Scheduler is a **min-heap of (fireTimeMs, callback) pairs**. Each
world tick runs all callbacks whose time has passed.

**Why a heap?** Linear lists are O(n) per insert and O(n) per "find
next due"; with hundreds of grass tiles, dino drop timers, and lifespan
expirations, that's O(n) work every tick. A min-heap is O(log n) for
both, which keeps performance flat as content grows.

It's also the right abstraction: the scheduler doesn't care what the
callbacks do, just when they should run. New systems can use it
without coordinating.

**Canonical example:** [`model/Scheduler.js`](model/Scheduler.js).
Tested in [`tests/scheduler.test.js`](tests/scheduler.test.js).

## Tile reservations & the spatial index

Two cooperating mechanisms in `World`:

- **Spatial index** (`_entitiesByTile`): a map from tile-key to the list
  of entities currently occupying that tile. Updated whenever an entity
  is added, moved, or removed. Lookups like "what's at tile (5, 7)?"
  are O(1) instead of O(n).
- **Reservations** (`_reservations`): a map from tile-key to the entity
  that's about to occupy it. When a blocker starts a `MoveToTileAction`,
  it reserves the destination. Other blockers see the reservation and
  pick a different path. The reservation is released on `onEnd`.

Together, they ensure two blocking entities never end up on the same
tile, even if their movement decisions are made on the same world tick.
This is the same problem RTS games solve; without reservations, you get
units sliding through each other.

**Canonical example:** see `tryReserveTile`, `releaseReservation`,
`isTileAvailableFor`, `_reindexEntity` in [`model/World.js`](model/World.js).

## Encapsulation via IIFE

Every JS file in `model/` and `viewmodel/` (except `Constants.js`) is
wrapped in an **Immediately-Invoked Function Expression**:

```js
(function() {
    // module-private state
    var _idCounter = 0;

    // public API
    function PublicName() { /* … */ }

    // exactly one explicit export
    window.PublicName = PublicName;
})();
```

Without the IIFE, every top-level `var` would become a global
(`window.X`). With the IIFE, only the explicit `window.X = X;` line at
the bottom is exported. Internals like `_idCounter`, `EAT_DURATION_MS`,
or `MINIMAP_TILE_PX` are truly private.

`Constants.js` is the one intentional exception — it's a bag of shared
globals like `TILE_SIZE`, `ElementType`, `MAX_SATIATION`. Those are
shared across the whole project by design.

**Canonical example:** [`model/BaseElement.js`](model/BaseElement.js).
The `_idCounter` variable is invisible from outside the file.

## The boot chain

`main.js` is a **composition root** — it builds the object graph and
starts the world, but contains no game logic itself. The boot sequence:

```
TerrainLoader.loadAll
    └─> EntityLoader.loadAll
            └─> BuyItemLoader.loadAll
                    └─> AssetLoader.loadAll
                            └─> startGame()
```

Each step waits for the previous to fully resolve. By the time
`startGame()` runs, every config is registered and every asset image is
in the browser cache and the `SpriteColorCache` has been populated. No
flicker, no missing colors on the minimap.

`startGame()` itself is a **list of constructions** with no business
logic:

1. Make the World.
2. Bootstrap behaviors (`GrassBehavior`, `DinoDropBehavior`).
3. Make the Player and GameState.
4. Make the renderers (`WorldView`, `SidebarView`, `GameHudView`,
   `VictoryView`, `DropPickupView`).
5. Spawn the starter dino.
6. Attach the camera controller.
7. Start the world tick loop.

**Canonical example:** [`main.js`](main.js).

## Testing

Pure-function logic in the model (the Scheduler heap, score formulas,
satiation decay) is testable without a browser. Tests live in `tests/`,
loaded by [`tests/test.html`](tests/test.html). The framework
[`tests/runner.js`](tests/runner.js) is small enough to read in a
sitting and provides `test`, `assert`, `assertEqual`, `assertClose`,
and `runTests`.

To add a new test:

1. Create `tests/myfeature.test.js`.
2. Inside, write `test('description', function() { /* assertions */ });`.
3. Add a `<script src="myfeature.test.js"></script>` line to
   `tests/test.html`.

The static `GameState.scoreIncrement(n)` method is a deliberate example
of **designing for testability** — by extracting the formula from the
instance method that holds world references, the formula becomes a
pure function and trivial to test.

**Canonical example:** [`tests/scheduler.test.js`](tests/scheduler.test.js).

## What this codebase deliberately doesn't have

A few omissions you might wonder about:

- **No save/load.** Would be the next major feature. The model is
  *almost* serializable; getting it the rest of the way is an
  educational exercise in removing live timers and back-references in
  favor of ids that can be re-resolved on load.
- **No InputController.** Click routing is currently scattered: WorldView
  listens for clicks on the playfield, MinimapView for clicks on the
  minimap, BuyMenuView for shop interactions. Centralizing this would be
  worthwhile if hotkeys or context-sensitive cursor behavior were
  added.
- **No type system.** No TypeScript, no JSDoc-as-types. Runtime errors
  catch what static types would prevent. For a project this size the
  trade-off is fine; for a larger one TypeScript would pay for itself
  quickly.
- **No build step / no bundler.** All scripts are loaded individually via
  `<script>` tags in `index.html`. That's slower in production than a
  bundle, but means there's nothing happening between source code and
  what runs — every line is inspectable.
- **No ECS.** A full Entity-Component-System would be over-engineered
  for this scale. We use behaviors-as-systems and a registry-driven
  factory, which gives most of the same flexibility for less ceremony.

If you're contributing or learning from this codebase, knowing what's
*not* here helps you avoid both adding unnecessary complexity and
mistaking a deliberate omission for an oversight.
