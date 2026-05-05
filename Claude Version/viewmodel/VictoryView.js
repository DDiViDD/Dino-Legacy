// VictoryView: full-screen modal shown when GameState ends.
// Shows final score, lets the player save their name to the highscore
// cookie, displays the current top scores, and offers Play Again.

function VictoryView(gameState, mountEl) {
    this.gameState = gameState;

    this.el = document.createElement('div');
    this.el.className = 'victory-modal hidden';

    var box = document.createElement('div');
    box.className = 'victory-box';

    var title = document.createElement('h1');
    title.textContent = 'Time\'s Up!';
    box.appendChild(title);

    this._finalScoreEl = document.createElement('div');
    this._finalScoreEl.className = 'victory-score';
    box.appendChild(this._finalScoreEl);

    var nameRow = document.createElement('div');
    nameRow.className = 'victory-name-row';

    this._nameInput = document.createElement('input');
    this._nameInput.type = 'text';
    this._nameInput.maxLength = 20;
    this._nameInput.placeholder = 'Your name';
    this._nameInput.className = 'victory-name';

    this._submitBtn = document.createElement('button');
    this._submitBtn.textContent = 'Save Score';
    this._submitBtn.className = 'victory-submit';

    nameRow.appendChild(this._nameInput);
    nameRow.appendChild(this._submitBtn);
    box.appendChild(nameRow);

    var hsTitle = document.createElement('h2');
    hsTitle.textContent = 'High Scores';
    box.appendChild(hsTitle);

    this._highscoreList = document.createElement('ol');
    this._highscoreList.className = 'victory-highscores';
    box.appendChild(this._highscoreList);

    this._replayBtn = document.createElement('button');
    this._replayBtn.textContent = 'Play Again';
    this._replayBtn.className = 'victory-replay';
    box.appendChild(this._replayBtn);

    this.el.appendChild(box);
    mountEl.appendChild(this.el);

    var self = this;
    this.gameState.on('ended', function(payload) { self._show(payload.score); });
    this._submitBtn.addEventListener('click', function() { self._handleSubmit(); });
    this._nameInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') self._handleSubmit();
    });
    this._replayBtn.addEventListener('click', function() {
        window.location.reload();
    });
}

VictoryView.prototype._show = function(score) {
    this._finalScoreEl.textContent = 'Final Score: ' + Math.floor(score).toLocaleString();
    this._renderHighscores();
    this.el.classList.remove('hidden');
    var self = this;
    setTimeout(function() { self._nameInput.focus(); }, 50);
};

VictoryView.prototype._handleSubmit = function() {
    var name = this._nameInput.value.trim();
    if (!name) return;
    HighscoreStore.add(name, this.gameState.score);
    this._renderHighscores();
    this._nameInput.disabled = true;
    this._submitBtn.disabled = true;
    this._submitBtn.textContent = 'Saved';
};

VictoryView.prototype._renderHighscores = function() {
    var list = HighscoreStore.getAll();
    this._highscoreList.innerHTML = '';
    if (list.length === 0) {
        var empty = document.createElement('li');
        empty.className = 'victory-empty';
        empty.textContent = 'No scores yet — be the first!';
        this._highscoreList.appendChild(empty);
        return;
    }
    for (var i = 0; i < list.length; i++) {
        var li = document.createElement('li');
        var name = document.createElement('span');
        name.className = 'hs-name';
        name.textContent = list[i].name;
        var score = document.createElement('span');
        score.className = 'hs-score';
        score.textContent = Number(list[i].score).toLocaleString();
        li.appendChild(name);
        li.appendChild(score);
        this._highscoreList.appendChild(li);
    }
};
