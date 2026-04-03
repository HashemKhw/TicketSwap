type SeatInfoInput = {
  seatSection?: string | null;
  seatRow?: string | null;
  seatFrom?: number | null;
  seatTo?: number | null;
  seatsTogether: boolean;
  seatInfo?: string | null;
  quantity: number;
};

function buildLocationPrefix(input: Pick<SeatInfoInput, "seatSection" | "seatRow">) {
  const parts: string[] = [];
  if (input.seatSection?.trim()) parts.push(`Section ${input.seatSection.trim()}`);
  if (input.seatRow?.trim()) parts.push(`Row ${input.seatRow.trim()}`);
  return parts;
}

export function buildSeatInfo(input: SeatInfoInput): string {
  const prefix = buildLocationPrefix(input);

  if (input.seatsTogether) {
    if (input.seatFrom == null || input.seatTo == null) {
      throw new Error("Seat start and seat end are required when seats are together");
    }
    if (input.seatFrom <= 0 || input.seatTo <= 0) {
      throw new Error("Seat numbers must be positive");
    }
    if (input.seatTo < input.seatFrom) {
      throw new Error("Seat end must be greater than or equal to seat start");
    }

    const expectedQuantity = input.seatTo - input.seatFrom + 1;
    if (expectedQuantity !== input.quantity) {
      throw new Error("Quantity must match the generated seat range");
    }

    prefix.push(
      expectedQuantity === 1 ? `Seat ${input.seatFrom}` : `Seats ${input.seatFrom}-${input.seatTo}`
    );
    return prefix.join(", ");
  }

  const manualSeatInfo = input.seatInfo?.trim();
  if (manualSeatInfo) {
    prefix.push(manualSeatInfo);
    return prefix.join(", ");
  }

  if (input.seatFrom != null && input.quantity === 1) {
    prefix.push(`Seat ${input.seatFrom}`);
    return prefix.join(", ");
  }

  throw new Error("Seat details are required when tickets are not together");
}
