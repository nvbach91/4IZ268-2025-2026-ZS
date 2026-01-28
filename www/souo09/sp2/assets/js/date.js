// Date formatting helpers

export const formatDate = (value) => {
  if (!value) return '-';
  // ISO format YYYY-MM-DD from <input type="date"> to DD.MM.YYYY
  const [year, month, day] = value.split('-');
  if (!year || !month || !day) {
    return value;
  }
  return `${day}.${month}.${year}`;
};

