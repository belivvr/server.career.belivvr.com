const KR_TIME_DIFF = 9 * 60 * 60 * 1000;

export function KST(): Date {
  return new Date(Date.now() + KR_TIME_DIFF);
}
