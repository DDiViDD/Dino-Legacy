// Unit tests for the GameState scoring formula.
// scoreIncrement is exposed as a static method specifically for testability.

test('GameState.scoreIncrement: zero living dinos yields zero', function() {
    assertEqual(GameState.scoreIncrement(0),  0, 'no dinos, no score');
    assertEqual(GameState.scoreIncrement(-1), 0, 'negative count treated as zero');
});

test('GameState.scoreIncrement: matches exp(n)/100 for positive n', function() {
    assertClose(GameState.scoreIncrement(1), Math.exp(1) / 100, 1e-12, 'n=1');
    assertClose(GameState.scoreIncrement(3), Math.exp(3) / 100, 1e-12, 'n=3');
    assertClose(GameState.scoreIncrement(5), Math.exp(5) / 100, 1e-12, 'n=5');
});

test('GameState.scoreIncrement: rewards more dinos super-linearly', function() {
    // Doubling the dinos should more than double the score.
    var oneDino  = GameState.scoreIncrement(1);
    var twoDinos = GameState.scoreIncrement(2);
    assert(twoDinos > 2 * oneDino, 'two dinos should be worth more than 2x one dino');
});
