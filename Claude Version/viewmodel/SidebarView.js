// SidebarView: the right-hand panel. Hosts MinimapView, MoneyView, BuyMenuView.

(function() {
    function SidebarView(world, worldView, player, mountEl) {
        this.el = document.createElement('aside');
        this.el.className = 'sidebar';

        var topPanel = document.createElement('div');
        topPanel.className = 'sidebar-top';
        this.el.appendChild(topPanel);

        this.minimap = new MinimapView(world, worldView, topPanel);
        this.money   = new MoneyView(player, topPanel);
        this.buyMenu = new BuyMenuView(player, worldView, this.el);

        mountEl.appendChild(this.el);
    }

    window.SidebarView = SidebarView;
})();
