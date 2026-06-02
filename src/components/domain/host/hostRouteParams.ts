export function parseRouteNumber(value: string | string[] | undefined) {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const numberValue = Number(rawValue);

  return Number.isInteger(numberValue) && numberValue > 0 ? numberValue : null;
}
