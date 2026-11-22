# Dibbirha Offer Workflow

A small TypeScript library inspired by Dibbirha, a spare-parts marketplace for drivers in Libya. A driver accepts the price on a specific offer revision. When the shop changes that price, confirmation requires the driver's acceptance of the new revision.

## Try it

From the repository root with Node.js 20 or later, run `npm ci`, `npm run build`, and `npm test`. Start `node --input-type=module -` in the same directory, paste the example, then send EOF (Ctrl+D on Unix, Ctrl+Z then Enter on Windows).

```js
import { createOffer, reviseOffer, acceptRevision, canConfirm } from "dibbirha-offer-workflow";

const original = createOffer("fictional-filter", 15000);
const firstAcceptance = acceptRevision(original, 1);
console.log(canConfirm(original, firstAcceptance)); // true

const revised = reviseOffer(original, 16500);
console.log(canConfirm(revised, firstAcceptance)); // false

const secondAcceptance = acceptRevision(revised, 2);
console.log(canConfirm(revised, secondAcceptance)); // true
```

## Using it in a marketplace

Give each offer a unique ID that is never reused, and keep its currency fixed. Prices are nonnegative safe integers in that currency's minor units. Revisions start at 1. Changing the price returns a new offer and increments the revision, even when reverting to an earlier price. Submitting the existing price preserves the revision.

Pass the revision the driver actually saw to `acceptRevision`. A stale revision throws a `RangeError`. Store the returned acceptance for that driver and reservation. `canConfirm` checks both the offer ID and revision and returns false for missing acceptance.

The calling app authenticates the driver, loads trusted offer and acceptance records, and handles persistence and concurrent updates. Use a transaction or conditional write to serialize price changes, acceptance and confirmation for the offer. Check the latest revision and record the reservation in the same atomic operation so a price change cannot slip between those steps.

## License

MIT. See [LICENSE](LICENSE).
