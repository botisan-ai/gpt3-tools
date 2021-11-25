export function getDate(num: number) {
  const date = new Date(num * 1000).toLocaleString();
  console.log(typeof date);

  return date;
}
