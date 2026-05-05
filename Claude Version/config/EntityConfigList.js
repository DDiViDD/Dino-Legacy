// EntityConfigList: master list of all entity configs to load.
//
// Each group has:
//   path:    folder path (relative to index.html). Trailing slash optional.
//   configs: list of file basenames in that folder (without .js).
//
// To add a new entity: drop the config file in the right folder and
// list its name here. To add a brand new entity TYPE (e.g. structures),
// add a new group here AND register a constructor in EntityFactory.

var EntityConfigList = [
    {
        path: 'model/dinos/',
        configs: ['Brachiosaur', 'skeleton']
    },
    {
        path: 'model/drops/',
        configs: ['Coin']
    }
];
