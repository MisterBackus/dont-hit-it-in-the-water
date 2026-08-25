# The clubhouse board's inbox

Drop shared runs here as `<name>.json` — the name on the file is the name on
the board. A player gets one line (their best run by verified money); extra
runs from the same person can be `mike-2.json`, `mike-3.json`.

A run is what the in-game **"Copy this run for the board"** button puts on
the clipboard: the seed and the complete action log. The board
(`src/tools/board.ts`, run automatically at deploy) REPLAYS every file
through the real engine and computes the money itself — nothing here is
trusted, so nothing here can be faked. Corrupt or out-of-date files are
listed under the board, not ranked.

Push, and the board rebuilds at `<site>/board.html`.
