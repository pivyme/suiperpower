# Learning prompts

Direct questions to draw out the specific from a hand-wavy session. Use one per section. Push back if the answer is vague.

## What we tried

- "Walk me through the actions you took, in order. What command did you run, what file did you edit, what did you click?"
- "What was the smallest unit of work that took an hour or more this session?"
- "If you had to summarize the session in three actions, what are they?"

Reject:

- "We worked on the project."
- "Iterated on the design."
- "Made progress on Move."

## What worked

- "Name one thing that produced a result you can demo or point at."
- "What is the evidence it worked? A passing test, a shipped commit, a transaction hash, a screenshot?"
- "If you re-ran the session, what would you keep doing the same way?"

Reject:

- "It is going well."
- "Things are coming together."

## What did not work

- "What did you abandon, and what made you abandon it?"
- "What did you try twice and still hit the same wall?"
- "What surprised you in a bad way?"

Reject:

- "Some bugs."
- "It is frustrating."
- "Move is hard."

## Open questions

- "What question would block the next session if it is not answered?"
- "What did you not test that you should have?"
- "What assumption did you make that you have not verified?"

Reject answers that are not phrased as a question. Force the question form.

## Decisions

- "What did you decide that you do not want to relitigate next session?"
- "What was the trade-off, and which side did you take?"
- "What is the decision you would tell a teammate if they walked into the project tomorrow?"

Reject:

- "We will figure it out."
- "Open for now."

If a decision is not yet made, it does not belong in `Decisions`. Move it to `Open questions`.

## When the user is too tired to answer

A session may end with the user too drained for direct questions. In that case, ask one summary question:

- "If I had a memory wipe before next session, what is the one thing I would absolutely need to read in this learnings entry?"

Capture the answer under the section that fits best, and note that this entry is short on purpose. The user can extend it next time.
