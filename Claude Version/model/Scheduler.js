// Scheduler: a single sorted queue of (fireTimeMs, callback) entries.
// Used for slow recurring work (grass growth, decay, etc.) so we don't
// have to tick every tile 10 times a second.
//
// Tradeoff: insert is O(log n), pop is O(1). Implemented as a binary heap
// indexed by fireTime ascending. With a few thousand entries this is
// effectively free per tick.
//
// Times are in ms, in the same clock as performance.now().

function Scheduler() {
    this._heap = [];
}

Scheduler.prototype.scheduleAt = function(fireTimeMs, callback) {
    var entry = { t: fireTimeMs, cb: callback };
    this._heap.push(entry);
    this._siftUp(this._heap.length - 1);
    return entry; // caller can hold this if they ever need to detect it ran
};

Scheduler.prototype.scheduleIn = function(delayMs, callback) {
    return this.scheduleAt(performance.now() + delayMs, callback);
};

// Run all callbacks whose fireTime <= now. Callbacks may schedule new ones;
// those won't run this pass unless they are also due.
Scheduler.prototype.runDue = function(nowMs) {
    while (this._heap.length > 0 && this._heap[0].t <= nowMs) {
        var top = this._popMin();
        try { top.cb(); }
        catch (err) { console.error('Scheduler callback failed:', err); }
    }
};

Scheduler.prototype.size = function() { return this._heap.length; };

// --- heap internals ----------------------------------------------------
Scheduler.prototype._popMin = function() {
    var heap = this._heap;
    var top = heap[0];
    var last = heap.pop();
    if (heap.length > 0) {
        heap[0] = last;
        this._siftDown(0);
    }
    return top;
};

Scheduler.prototype._siftUp = function(i) {
    var heap = this._heap;
    while (i > 0) {
        var parent = (i - 1) >> 1;
        if (heap[parent].t <= heap[i].t) break;
        var tmp = heap[parent]; heap[parent] = heap[i]; heap[i] = tmp;
        i = parent;
    }
};

Scheduler.prototype._siftDown = function(i) {
    var heap = this._heap;
    var n = heap.length;
    while (true) {
        var l = i * 2 + 1, r = i * 2 + 2, smallest = i;
        if (l < n && heap[l].t < heap[smallest].t) smallest = l;
        if (r < n && heap[r].t < heap[smallest].t) smallest = r;
        if (smallest === i) break;
        var tmp = heap[smallest]; heap[smallest] = heap[i]; heap[i] = tmp;
        i = smallest;
    }
};
