export const formatDateTime = (value: string) => {
  const matched = value.match(/^\d{4}-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);

  if (!matched) return value;

  const [, month, day, hourText, minute] = matched;
  const hour = Number(hourText);
  const period = hour < 12 ? "오전" : "오후";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;

  return `${month}. ${day}. ${period} ${String(displayHour).padStart(2, "0")}:${minute}`;
};

export const formatTime = (value: string) => {
  const matched = value.match(/^\d{4}-\d{2}-\d{2}T(\d{2}):(\d{2})/);

  if (!matched) return value;

  const [, hour, minute] = matched;
  return `${hour}:${minute}`;
};

export const formatDate = (value: string) => {
  const matched = value.match(/^(\d{4})-(\d{2})-(\d{2})T/);

  if (!matched) return value;

  const [, year, month, day] = matched;
  return `${year}-${month}-${day}`;
};

export const formatDateMinute = (value: string) => {
  const matched = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);

  if (!matched) return value;

  const [, year, month, day, hour, minute] = matched;
  return `${year}-${month}-${day} · ${hour}:${minute}`;
};
