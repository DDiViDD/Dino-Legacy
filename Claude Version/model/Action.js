// Action: base class for anything an entity can do over time.
// Subclass and override update(); set isDone = true when finished.

(function() {
    function Action() { this.isDone = false; }
    Action.prototype.onStart = function(entity) {};
    Action.prototype.update  = function(deltaMs, entity) {};
    Action.prototype.onEnd   = function(entity) {};
    window.Action = Action;
})();
