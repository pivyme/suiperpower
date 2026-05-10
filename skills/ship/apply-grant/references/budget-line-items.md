# Budget line items

Line items reviewers expect to see in a Sui Foundation grant application. Use real numbers, not placeholders. Tie each line to a deliverable.

## Engineering

- Move package development.
- Frontend or client SDK development.
- Testing and CI infrastructure.
- Cite either headcount * months * rate, or a fixed-bid quote.

Example:

> Engineering: 2 engineers, 4 months, blended rate $X / month = $Y. Covers M1 to M4 deliverables.

## Design

- Brand, visual identity, frontend design, video assets.
- Often outsourced. Cite the named designer or studio.

Example:

> Design: 1 designer, 6 weeks at $X / week = $Y. Covers M2 frontend redesign and the demo video assets in M3.

## Audit

- Security audit by a named firm (OtterSec, Zellic, Spearbit, others).
- Cite the firm and the engagement length if known. If unknown, cite a reasonable budget based on package size.

Example:

> Audit: OtterSec engagement, 3 weeks, $Z. Aligned with M5 security review milestone.

## Infrastructure

- RPC providers (Mysten / Blockvision / etc), Walrus storage costs at projected scale, hosting (Vercel / Cloudflare / etc), monitoring.
- Cite assumptions: expected traffic, expected storage volume.

Example:

> Infrastructure: $A / month for 6 months = $B. Covers RPC at projected 100 TPS peak, 50 GB Walrus storage, hosting + monitoring.

## Contingency

- Maximum 10% of the total. Higher reads as poor planning.
- Reserved for cost overruns and small unforeseen items.

Example:

> Contingency: 10% of the above = $C.

## What does NOT belong

- Speculative items the project may or may not need.
- Founder salaries that are not tied to specific deliverables. Salary is fine if scoped to engineering above.
- Marketing or paid acquisition unless the grant program explicitly funds growth.
- Conference travel without a clear ROI tied to the project.

## Pricing assumptions

- Engineering blended rate varies by region; cite the assumption.
- Design rates vary; cite the named provider.
- Audit prices vary; ask the audit firm for a quote and cite it.
- Infrastructure prices change; cite a recent month or a public price page.

## Common review pushback

- "Engineering is too high." Counter with a deliverable-by-deliverable breakdown.
- "Audit is missing." Add it. Mainnet without an audit is a flag.
- "Contingency is too high." Trim or justify. Reviewers prefer clear scope to large contingency.
- "Sustainability not linked to budget." Show how M3 or M6 deliverables produce the path to non-grant revenue or follow-on funding.
