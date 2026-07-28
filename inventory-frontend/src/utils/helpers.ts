export const capitalize = (
  value: string | number | undefined | null
): string => {
  if (value === undefined || value === null || value === "") {
    return "-";
  }

  const text = String(value);

  return text.charAt(0).toUpperCase() + text.slice(1);
};