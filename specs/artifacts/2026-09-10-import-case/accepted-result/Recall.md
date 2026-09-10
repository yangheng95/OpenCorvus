# Recall

The selected-new import marker is an internal control value, not persisted
transaction data. Any future import normalization change must preserve it
until reconciliation decides whether to bypass a candidate match, and must
still strip it from inserted records. Duplicate matching by imported ID and
the existing fuzzy rules must remain authoritative unless the caller
explicitly requests a new transaction.

The bounded regression scenarios use fictional manual/imported baselines with
Netflix at `-8.99` on `2026-09-10` and Corner Coffee at `-8.99` on
`2026-09-08`; both read back as two persisted rows totaling `-17.98`. These
backend checks do not replace the operator's manual UI acceptance.

The original manual UI acceptance remained failed after the first repair:
Coffee was omitted from the final account. The failure showed that a selected
ordinary new row also needs the transient force-add marker, because the final
payload no longer contains the previously skipped candidate used during
preview matching.
