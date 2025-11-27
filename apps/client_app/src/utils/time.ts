export const formatTime = (iso: string) => {
  const date = new Date(iso);

  return date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
};
