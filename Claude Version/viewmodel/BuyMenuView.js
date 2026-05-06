(function() {
// BuyMenuView: renders the scrollable, two-column item list and handles
// item selection + placement.
//
// Flow:
//   1. User clicks an item button -> selectedItem set, button highlighted.
//   2. User clicks a tile -> we ask the item's onPlace() to apply itself.
//      If successful, deduct cost from the player. Otherwise no change.
//   3. Right-click or selecting again deselects.

function BuyMenuView(player, worldView, mountEl) {
    this.player    = player;
    this.worldView = worldView;
    this.selected  = null;

    this.el = document.createElement('div');
    this.el.className = 'buy-menu';

    this._title = document.createElement('div');
    this._title.className = 'buy-menu-title';
    this._title.textContent = 'Build / Buy';
    this.el.appendChild(this._title);

    this._grid = document.createElement('div');
    this._grid.className = 'buy-menu-grid';
    this.el.appendChild(this._grid);

    this._statusBar = document.createElement('div');
    this._statusBar.className = 'buy-menu-status';
    this._statusBar.textContent = 'Select an item, then click a tile.';
    this.el.appendChild(this._statusBar);

    mountEl.appendChild(this.el);

    this._buttons = [];
    this._renderItems();

    var self = this;

    // World tile click — apply selected item if any.
    this.worldView.on('tileClicked', function(payload) {
        self._handleTileClick(payload);
    });

    // Right-click anywhere to cancel selection.
    document.addEventListener('contextmenu', function(ev) {
        if (self.selected) {
            ev.preventDefault();
            self._setSelected(null);
        }
    });

    // Coins changed -> update affordability tinting.
    this.player.on('coinsChanged', function() { self._refreshAffordability(); });
}

BuyMenuView.prototype._renderItems = function() {
    this._grid.innerHTML = '';
    this._buttons = [];

    var items = BuyItemRegistry.all();
    var self  = this;
    for (var i = 0; i < items.length; i++) {
        (function(item) {
            var btn = document.createElement('button');
            btn.className = 'buy-item';
            btn.title = item.description || '';

            var img = document.createElement('img');
            img.src = item.assetPath;
            img.alt = item.name;
            img.className = 'buy-item-icon';

            var name = document.createElement('div');
            name.className = 'buy-item-name';
            name.textContent = item.name;

            var cost = document.createElement('div');
            cost.className = 'buy-item-cost';
            cost.textContent = item.cost;

            btn.appendChild(img);
            btn.appendChild(name);
            btn.appendChild(cost);

            btn.addEventListener('click', function(ev) {
                ev.stopPropagation();
                if (self.selected && self.selected.id === item.id) {
                    self._setSelected(null);
                } else {
                    self._setSelected(item);
                }
            });

            self._grid.appendChild(btn);
            self._buttons.push({ item: item, el: btn });
        })(items[i]);
    }
    this._refreshAffordability();
};

BuyMenuView.prototype._refreshAffordability = function() {
    for (var i = 0; i < this._buttons.length; i++) {
        var entry = this._buttons[i];
        if (this.player.canAfford(entry.item.cost)) {
            entry.el.classList.remove('unaffordable');
        } else {
            entry.el.classList.add('unaffordable');
        }
    }
};

BuyMenuView.prototype._setSelected = function(item) {
    this.selected = item;
    for (var i = 0; i < this._buttons.length; i++) {
        if (item && this._buttons[i].item.id === item.id) {
            this._buttons[i].el.classList.add('selected');
        } else {
            this._buttons[i].el.classList.remove('selected');
        }
    }
    if (item) {
        this._statusBar.textContent =
            'Placing: ' + item.name + ' (' + item.cost + ' coins). Right-click to cancel.';
    } else {
        this._statusBar.textContent = 'Select an item, then click a tile.';
    }
};

BuyMenuView.prototype._handleTileClick = function(payload) {
    if (!this.selected) return;
    var item = this.selected;

    if (!this.player.canAfford(item.cost)) {
        this._statusBar.textContent = 'Not enough coins for ' + item.name + '.';
        return;
    }

    var ctx = {
        world:  this.worldView.world,
        player: this.player,
        tile:   payload.tile,
        x:      payload.worldX,
        y:      payload.worldY
    };
    var ok = applyBuyItemAction(item, ctx);
    if (ok) {
        this.player.spend(item.cost);
        this._statusBar.textContent = 'Placed ' + item.name + '.';
    } else {
        this._statusBar.textContent = 'Cannot place ' + item.name + ' there.';
    }
};

    window.BuyMenuView = BuyMenuView;
})();
