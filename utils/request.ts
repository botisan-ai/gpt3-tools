export const fetcher = (url: string): Promise<any> => fetch(url).then((res) => res.json());
export const fetchText = (url: string): Promise<any> => fetch(url).then((res) => res.text());
