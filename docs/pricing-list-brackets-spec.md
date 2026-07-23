# Pricing List — return full brackets — Backend Spec

`GET /admin/pricing` (the list) currently returns **only one bracket per freight type** for each
row, while `GET /admin/pricing/{pricingId}` (the detail) returns the **complete** set. This forces
the admin panel to re-fetch every international row's detail just to render its prices.

## Evidence (live, dev)

`China → Ghana` was created with **4** brackets:

| range | type | rate |
|---|---|---|
| 0–5 | AIR | 1500 |
| 5–20 | AIR | 1200 |
| 0–100 | OCEAN | 300 |
| 100–500 | OCEAN | 250 |

- `GET /admin/pricing` returns **2**: `0–5 AIR`, `0–100 OCEAN` (the first of each type). ❌
- `GET /admin/pricing/{id}` returns all **4**. ✅

Same pattern for `Nigeria → Canada`: list returns `0–3` only; detail returns `0–3` **and** `4–4`.

## The fix

`GET /admin/pricing` must return the **full `brackets` array** per row — identical to what the
detail endpoint already produces. The item schema in `PaginatedPricingResponseDto` (`IPricingDoc`)
should serialize `brackets` the same way `PricingResponseDto` does. No shape change to the bracket
object itself — just stop truncating.

For reference, one bracket as returned today (keep this shape, just return them all):

```jsonc
{ "minWeight": "0", "maxWeight": "5", "airFreightRate": "1500", "oceanFreightRate": "0", "roadFreightRate": "0" }
```

(A `freightType` field on each bracket would be a nice-to-have — the read side omits it today and
the client infers it from the non-zero rate — but the only required fix here is returning every
bracket.)

## Frontend status

Already handled. Interim workaround: the panel hydrates each international row's full brackets from
the detail endpoint (`usePricingBracketsHydration` in `lib/query/hooks/use-pricing.ts`, one cached
`GET /admin/pricing/{id}` per international row). Once the list returns full brackets, that hook
becomes a no-op and should be deleted — the table needs no other change.
