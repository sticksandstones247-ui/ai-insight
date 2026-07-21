import type { CollectionEntry } from 'astro:content';

type PostData = CollectionEntry<'posts'>['data'];

export const pad3 = (n: number) => String(n).padStart(3, '0');

export function displayTitle(data: PostData): string {
  return data.series && data.seriesNumber
    ? `【${data.series} #${pad3(data.seriesNumber)}】${data.title}`
    : data.title;
}

export function badgeLabel(data: PostData): string {
  return data.category === '議事録' && data.seriesNumber
    ? `議事録 #${pad3(data.seriesNumber)}`
    : data.category;
}

export const badgeClass: Record<PostData['category'], string> = {
  'ストーリー': 'badge-story',
  '議事録': 'badge-log',
  'お役立ち': 'badge-guide',
};

const pad2 = (n: number) => String(n).padStart(2, '0');

export function formatDate(d: Date): string {
  return `${d.getFullYear()}.${pad2(d.getMonth() + 1)}.${pad2(d.getDate())}`;
}
