export interface Offer {
  readonly id: string;
  readonly revision: number;
  readonly priceMinor: number;
}

export interface Acceptance {
  readonly offerId: string;
  readonly revision: number;
}

function checkPrice(priceMinor: number): void {
  if (!Number.isSafeInteger(priceMinor) || priceMinor < 0) {
    throw new RangeError("Price must be a nonnegative safe integer in minor units");
  }
}

export function createOffer(id: string, priceMinor: number): Offer {
  if (id.trim().length === 0) throw new RangeError("Offer ID is required");
  checkPrice(priceMinor);
  return Object.freeze({ id, revision: 1, priceMinor });
}

export function reviseOffer(offer: Offer, priceMinor: number): Offer {
  checkPrice(priceMinor);
  if (priceMinor === offer.priceMinor) return offer;
  const revision = offer.revision + 1;
  if (!Number.isSafeInteger(revision)) throw new RangeError("Revision limit reached");
  return Object.freeze({ id: offer.id, revision, priceMinor });
}

export function acceptRevision(offer: Offer, displayedRevision: number): Acceptance {
  if (displayedRevision !== offer.revision) {
    throw new RangeError("The displayed revision is no longer current");
  }
  return Object.freeze({ offerId: offer.id, revision: displayedRevision });
}

export function canConfirm(offer: Offer, acceptance?: Acceptance | null): boolean {
  return acceptance != null &&
    acceptance.offerId === offer.id &&
    acceptance.revision === offer.revision;
}
