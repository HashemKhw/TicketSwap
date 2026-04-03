export type ListingSeatDraft = {
  seatSection?: string | null;
  seatRow?: string | null;
  seatFrom?: number | null;
  seatTo?: number | null;
  seatsTogether: boolean;
  seatInfo?: string | null;
  quantity: number;
};

function buildSeatPrefix(input: Pick<ListingSeatDraft, "seatSection" | "seatRow">) {
  const parts: string[] = [];
  if (input.seatSection?.trim()) parts.push(`Section ${input.seatSection.trim()}`);
  if (input.seatRow?.trim()) parts.push(`Row ${input.seatRow.trim()}`);
  return parts;
}

export function formatSeatSummary(input: ListingSeatDraft) {
  const prefix = buildSeatPrefix(input);

  if (input.seatsTogether) {
    if (input.seatFrom == null || input.seatTo == null) return "";
    prefix.push(
      input.quantity === 1 ? `Seat ${input.seatFrom}` : `Seats ${input.seatFrom}-${input.seatTo}`
    );
    return prefix.join(", ");
  }

  const manual = input.seatInfo?.trim();
  if (manual) {
    prefix.push(manual);
    return prefix.join(", ");
  }

  if (input.seatFrom != null && input.quantity === 1) {
    prefix.push(`Seat ${input.seatFrom}`);
    return prefix.join(", ");
  }

  return "";
}

export function generateSeatSequence(from?: number | null, to?: number | null) {
  if (from == null || to == null || to < from) return [];
  return Array.from({ length: to - from + 1 }, (_, index) => from + index);
}
