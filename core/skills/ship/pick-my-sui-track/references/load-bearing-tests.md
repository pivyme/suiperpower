# Load-bearing tests per sponsor

A score of 3 is a claim that removing the integration breaks the demo. Verify it by running the test below for each sponsor at score 3. If the test does not produce the stated outcome, downgrade to 2.

## Walrus load-bearing test

Test: comment out the Walrus retrieval call in the demo path. Run the demo. Does the user-visible output break?

- If yes (broken UI, missing media, wrong content): score 3 stands.
- If no (a fallback CDN serves the same content, or the missing blob does not matter): score 2.

## DeepBook load-bearing test

Test: remove the order placement or settlement call from the demo path. Does the project still complete its core flow?

- If yes (a static price feed could replace it, or the project does not depend on order execution): score 2.
- If no (the demo's whole point is a settled DeepBook trade): score 3.

## OpenZeppelin load-bearing test

Test: pick the most critical OZ module used. Could the project be implemented safely without it, in the timeframe of the hackathon?

- If yes (the OZ module is convenient but the same logic could be hand-written competently): score 2.
- If no (the OZ module replaces a non-trivial capability or access-control pattern that would otherwise risk a P0 finding): score 3.

## OtterSec load-bearing test

Test: walk the OtterSec checklist. For each P0 item, is there a recorded answer (resolved, mitigated, or accepted with rationale)?

- If any P0 item is unanswered: score 2 at most.
- If every P0 item has a recorded answer: score 3.

## Scallop load-bearing test

Test: in the demo, can the user (or an automated script) deposit, borrow, and repay against a live Scallop pool?

- If only one of the three works: score 2.
- If all three work: score 3.

## After verification

Update the score in the writeback. If a sponsor was claimed at 3 and the test downgrades it to 2, name the gap explicitly: "Walrus is at 2 because the demo's hero image is served from a CDN with the Walrus blob as a fallback. Move the canonical render to Walrus to upgrade to 3."
