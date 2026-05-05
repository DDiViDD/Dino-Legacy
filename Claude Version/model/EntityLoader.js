// EntityLoader: loads all entity config files declared in EntityConfigList.
//
// Format expected:
//   var EntityConfigList = [
//       { path: 'model/dinos/', configs: ['Brachiosaur', 'skeleton'] },
//       { path: 'model/drops/', configs: ['Coin'] }
//   ];
//
// path is appended to each config name + '.js'. So adding a new entity is
// a one-line edit in EntityConfigList plus the new config file.

var EntityLoader = {
    loadAll: function(onComplete) {
        // Flatten all (path, name) pairs.
        var items = [];
        for (var i = 0; i < EntityConfigList.length; i++) {
            var group = EntityConfigList[i];
            for (var j = 0; j < group.configs.length; j++) {
                items.push({ path: group.path, name: group.configs[j] });
            }
        }
        var remaining = items.length;
        if (remaining === 0) { onComplete(); return; }

        function onOne() { remaining--; if (remaining === 0) onComplete(); }
        for (var k = 0; k < items.length; k++) {
            EntityLoader._loadScript(items[k].path, items[k].name, onOne);
        }
    },

    _loadScript: function(path, name, onDone) {
        var script = document.createElement('script');
        var src = path.charAt(path.length - 1) === '/' ? path + name + '.js' : path + '/' + name + '.js';
        script.src = src;
        script.onload  = function() { console.log('EntityLoader: loaded ' + src); onDone(); };
        script.onerror = function() {
            console.error('EntityLoader: FAILED to load ' + src);
            onDone();
        };
        document.head.appendChild(script);
    }
};
