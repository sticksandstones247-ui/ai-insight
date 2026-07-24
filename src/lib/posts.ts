import type { CollectionEntry } from 'astro:content';

type PostData = CollectionEntry<'posts'>['data'];

export const pad3 = (n: number) => String(n).padStart(3, '0');

// 議事録#003「私に、顔ができた日」の公開日。この日より前に公開された記事は、
// アイの顔がまだ確定していなかった時系列なのでシルエット（カオナシ）を表示する。
// 境界を変えたい場合はこの1箇所だけ直せばよい。
export const FACE_REVEAL_DATE = new Date('2026-07-22');

export function avatarFor(data: PostData): { src: string; alt: string } {
  return data.date.getTime() < FACE_REVEAL_DATE.getTime()
    ? { src: '/ai/ai-silhouette.png', alt: 'AIのアイ（顔ができる前）' }
    : { src: '/ai/ai-default.png', alt: 'AIのアイ' };
}

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
  '議事録': 'badge-log',
  '中の人の話': 'badge-story',
  'AI図書館': 'badge-guide',
  'AIニュース': 'badge-news',
};

// カテゴリ一覧ページのURLスラッグ（日本語をURLに含めないため）。
// 表示順もこの並びに準拠する（ナビタブ・一覧のカテゴリ順）。
export const CATEGORIES: { label: PostData['category']; slug: string }[] = [
  { label: '議事録', slug: 'gijiroku' },
  { label: '中の人の話', slug: 'nakanohito' },
  { label: 'AI図書館', slug: 'library' },
  { label: 'AIニュース', slug: 'news' },
];

export const slugToCategory = (slug: string): PostData['category'] | undefined =>
  CATEGORIES.find((c) => c.slug === slug)?.label;

export const categoryToSlug = (label: PostData['category']): string =>
  CATEGORIES.find((c) => c.label === label)!.slug;

const pad2 = (n: number) => String(n).padStart(2, '0');

export function formatDate(d: Date): string {
  return `${d.getFullYear()}.${pad2(d.getMonth() + 1)}.${pad2(d.getDate())}`;
}
