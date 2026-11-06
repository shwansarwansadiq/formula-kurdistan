# FORMULAK design

World: the starting grid. Frame is black (#0A0A0A) tarmac, one accent red (#E10600), white, charcoal #171717, grey #8A8A8A. No gradients, no shadows, square corners.

Shape: `.slot`, a painted grid box: a 4px bar with two 36px ticks running back. `.grid2` parks slots in staggered pairs, pole on the right. Red fill marks the leader or the current round only.

Type: Rabar for Sorani, Archivo (wide, heavy) for Latin names and race names. Sorani numerals through `ku()`.

Colour fields: black for openers and standings, red for the next-session band, white for reading and tables. Article text stays in a 680px white column.

Motion: one shutter reveal on the lead photo; colour and press feedback at 120ms; all off under reduced motion.

Data: every figure comes from `src/lib/f1data.ts` unchanged. A missing source shows a plain message, never a guess.
