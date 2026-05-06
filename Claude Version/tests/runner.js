// Tiny test framework. Tests register via test('name', function() {...}).
// Inside a test, call assert(condition, message) or assertEqual(actual,
// expected, message). The runner collects results and renders them in
// the page.
//
// Loaded by tests/test.html. Production code is unaffected.

(function() {
    var _tests = [];
    var _results = [];

    function test(name, fn) {
        _tests.push({ name: name, fn: fn });
    }

    function assert(cond, message) {
        if (!cond) throw new Error('Assertion failed: ' + (message || ''));
    }

    function assertEqual(actual, expected, message) {
        // Deep equality for numbers, strings, and small object trees.
        // Sufficient for the kinds of things we test here.
        if (!_deepEqual(actual, expected)) {
            throw new Error('Assertion failed: ' + (message || '') +
                ' (expected ' + JSON.stringify(expected) +
                ', got '      + JSON.stringify(actual) + ')');
        }
    }

    function assertClose(actual, expected, tolerance, message) {
        // For floating-point comparisons.
        var t = tolerance !== undefined ? tolerance : 1e-9;
        if (Math.abs(actual - expected) > t) {
            throw new Error('Assertion failed: ' + (message || '') +
                ' (expected ' + expected + ' ± ' + t + ', got ' + actual + ')');
        }
    }

    function _deepEqual(a, b) {
        if (a === b) return true;
        if (typeof a !== typeof b) return false;
        if (typeof a !== 'object' || a === null || b === null) return false;
        var keysA = Object.keys(a), keysB = Object.keys(b);
        if (keysA.length !== keysB.length) return false;
        for (var i = 0; i < keysA.length; i++) {
            if (!_deepEqual(a[keysA[i]], b[keysA[i]])) return false;
        }
        return true;
    }

    function run(mountEl) {
        _results = [];
        for (var i = 0; i < _tests.length; i++) {
            var t = _tests[i];
            var entry = { name: t.name, passed: false, error: null };
            try {
                t.fn();
                entry.passed = true;
            } catch (err) {
                entry.error = err.message || String(err);
            }
            _results.push(entry);
        }
        if (mountEl) _render(mountEl);
        return _results;
    }

    function _render(mountEl) {
        var passed = 0, failed = 0;
        for (var i = 0; i < _results.length; i++) {
            if (_results[i].passed) passed++; else failed++;
        }

        var summary = document.createElement('div');
        summary.className = 'test-summary' + (failed === 0 ? ' all-pass' : ' has-fail');
        summary.textContent = passed + ' passed / ' + failed + ' failed';
        mountEl.appendChild(summary);

        var ul = document.createElement('ul');
        ul.className = 'test-list';
        for (var j = 0; j < _results.length; j++) {
            var li = document.createElement('li');
            li.className = 'test-item ' + (_results[j].passed ? 'pass' : 'fail');
            var status = document.createElement('span');
            status.className = 'test-status';
            status.textContent = _results[j].passed ? '✓' : '✗';
            var name = document.createElement('span');
            name.className = 'test-name';
            name.textContent = _results[j].name;
            li.appendChild(status);
            li.appendChild(name);
            if (!_results[j].passed) {
                var err = document.createElement('div');
                err.className = 'test-error';
                err.textContent = _results[j].error;
                li.appendChild(err);
            }
            ul.appendChild(li);
        }
        mountEl.appendChild(ul);
    }

    window.test         = test;
    window.assert       = assert;
    window.assertEqual  = assertEqual;
    window.assertClose  = assertClose;
    window.runTests     = run;
})();
