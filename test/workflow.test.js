import assert from "node:assert/strict";
import test from "node:test";
import { acceptRevision, canConfirm, createOffer, reviseOffer } from "dibbirha-offer-workflow";

test("a reservation needs acceptance of the current offer revision", () => {
  const original = createOffer("demo-wheel", 12500);
  assert.equal(canConfirm(original), false);
  const first = acceptRevision(original, 1);
  assert.equal(canConfirm(original, first), true);

  const revised = reviseOffer(original, 13200);
  assert.equal(canConfirm(revised, first), false);
  assert.throws(() => acceptRevision(revised, 1), RangeError);
  assert.equal(canConfirm(revised, acceptRevision(revised, 2)), true);
  assert.equal(original.priceMinor, 12500);
});

test("restoring an earlier price still requires fresh acceptance", () => {
  const offer = createOffer("demo-pump", 500);
  const reverted = reviseOffer(reviseOffer(offer, 600), 500);
  assert.equal(canConfirm(reverted, acceptRevision(offer, 1)), false);
});

test("acceptance is scoped to the offer, even at the same revision", () => {
  const first = createOffer("demo-left", 100);
  const second = createOffer("demo-right", 100);
  assert.equal(canConfirm(second, acceptRevision(first, 1)), false);
});

test("resubmitting an unchanged price preserves acceptance", () => {
  const offer = createOffer("demo-belt", 0);
  assert.equal(canConfirm(reviseOffer(offer, 0), acceptRevision(offer, 1)), true);
});

test("invalid prices, empty IDs and revision overflow are rejected", () => {
  const offer = createOffer("demo-spring", 100);
  for (const price of [-1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => createOffer("demo-light", price), RangeError);
    assert.throws(() => reviseOffer(offer, price), RangeError);
  }
  assert.throws(() => createOffer(" ", 100), RangeError);
  assert.throws(() => reviseOffer({ ...offer, revision: Number.MAX_SAFE_INTEGER }, 200), RangeError);
});
