// Action: base class for anything an entity can do over time.
// Subclass this and override update(). Set isDone = true when finished.

function Action() {
    this.isDone = false;
}

Action.prototype.onStart = function(entity) {};
Action.prototype.update  = function(deltaMs, entity) {};
Action.prototype.onEnd   = function(entity) {};
