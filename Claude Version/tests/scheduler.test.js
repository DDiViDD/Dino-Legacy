// Unit tests for Scheduler — the min-heap of delayed callbacks used for
// grass growth, drops, and other slow recurring work.

test('Scheduler: callbacks fire in time order regardless of insertion order', function() {
    var s = new Scheduler();
    var fired = [];

    s.scheduleAt(300, function() { fired.push('c'); });
    s.scheduleAt(100, function() { fired.push('a'); });
    s.scheduleAt(200, function() { fired.push('b'); });

    // Run "now = 50" — nothing should fire yet.
    s.runDue(50);
    assertEqual(fired, [], 'no callbacks should fire before their time');

    // Advance to 150 — only the t=100 one should fire.
    s.runDue(150);
    assertEqual(fired, ['a'], 'only first-due callback should fire at t=150');

    // Advance to 1000 — remaining two fire in time order.
    s.runDue(1000);
    assertEqual(fired, ['a', 'b', 'c'], 'remaining callbacks fire in time order');

    assertEqual(s.size(), 0, 'scheduler should be empty after all fire');
});

test('Scheduler: a callback can schedule another callback', function() {
    var s = new Scheduler();
    var fired = [];

    s.scheduleAt(100, function() {
        fired.push('outer');
        s.scheduleAt(200, function() { fired.push('inner'); });
    });

    s.runDue(150);
    assertEqual(fired, ['outer'], 'outer fires first');

    s.runDue(150);
    assertEqual(fired, ['outer'], 'inner not yet due at t=150');

    s.runDue(250);
    assertEqual(fired, ['outer', 'inner'], 'inner fires once due');
});
