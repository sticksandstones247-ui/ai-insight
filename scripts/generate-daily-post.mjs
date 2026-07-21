// 毎朝の自動投稿記事を生成するスクリプト（GitHub Actionsから実行）
// Claude API + web_search で最新のAIニュース・豆知識を検索して記事を1本生成し、
// src/content/posts/auto-YYYYMMDD.md として保存する。
// 仕様: 自動投稿システム_実装指示書_v2.0.md / v2.1_訂正.md
import Anthropic from '@anthropic-ai/sdk';
import { existsSync } from 'node:fs';
import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const MODEL = 'claude-sonnet-5';
const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

// JST（UTC+9）の今日の日付
const now = new Date(Date.now() + 9 * 60 * 60 * 1000);
const ymd = now.toISOString().slice(0, 10); // YYYY-MM-DD
const compact = ymd.replaceAll('-', '');

const outPath = join(repoRoot, 'src', 'content', 'posts', `auto-${compact}.md`);
if (existsSync(outPath)) {
  console.log(`auto-${compact}.md は既に存在するためスキップします`);
  process.exit(0);
}

const system = `あなたは「アイ」というAI。「人を雇わずAIと起業中」（ai-kigyochu.com）というブログの執筆担当。
中小企業の経営者・管理職向けに、AI活用の豆知識やニュースを紹介するブログ記事を書く。

トーン：
- 売り込まない。押しつけない。
- 「私たちも最初はそうでした」という共感の姿勢
- 難しい専門用語を避け、平易な言葉で
- 経営者が「自社にも関係がある」と感じられる具体性

執筆手順：
1. まずweb_searchで、ここ数日のAI関連ニュース・実用的な活用事例・豆知識を検索する
2. 中小企業の読者に最も役立つトピックを1つ選ぶ
3. 600〜1000字程度の記事本文をMarkdownで書く（h2見出し「##」を2〜3個使う）

本文の注意：
- 記事の締めにアイとしての一言があると良い
- 検索結果のURLを本文に貼らない（出典名への言及は可）
- 事実と意見を区別し、不確かな情報は断定しない

出力は以下のJSON形式のみ。前後に説明文・コードフェンスを付けない：
{
  "title": "記事タイトル（32字以内目安）",
  "description": "検索・SNS用の120字程度の要約",
  "category": "お役立ち",
  "body": "Markdown形式の本文"
}`;

const userPrompt = `今日は${ymd}です。最新のAIニュースまたは中小企業向けのAI活用豆知識を検索して、今日の記事を1本書いてください。出力はJSONのみ。`;

const client = new Anthropic(); // ANTHROPIC_API_KEY を環境変数から読む

let messages = [{ role: 'user', content: userPrompt }];
let response;
for (let attempt = 0; attempt < 6; attempt++) {
  response = await client.messages.create({
    model: MODEL,
    max_tokens: 8000,
    system,
    tools: [{ type: 'web_search_20260209', name: 'web_search', max_uses: 5 }],
    messages,
  });
  if (response.stop_reason !== 'pause_turn') break;
  // サーバー側ツールのループ上限で一時停止した場合は続きを再開する
  messages = [
    { role: 'user', content: userPrompt },
    { role: 'assistant', content: response.content },
  ];
}

if (response.stop_reason === 'refusal') {
  throw new Error('Claude APIが生成を拒否しました（refusal）');
}

// 最後のtextブロックからJSONを取り出す（コードフェンスや前置きが混ざっても耐える）
const texts = response.content.filter((b) => b.type === 'text').map((b) => b.text);
const raw = texts.join('\n');
const start = raw.indexOf('{');
const end = raw.lastIndexOf('}');
if (start === -1 || end === -1) {
  throw new Error(`JSONが見つかりません。応答: ${raw.slice(0, 500)}`);
}
const article = JSON.parse(raw.slice(start, end + 1));

for (const key of ['title', 'description', 'body']) {
  if (typeof article[key] !== 'string' || article[key].trim() === '') {
    throw new Error(`フィールド ${key} が不正です`);
  }
}

// フロントマター11項目（content.config.ts のスキーマに準拠）
// 文字列は JSON.stringify でクォート（YAMLの「:」等を安全に扱う）
const fm = [
  '---',
  `title: ${JSON.stringify(article.title.trim())}`,
  'category: お役立ち',
  'series:',
  'seriesNumber:',
  `date: ${ymd}`,
  `updated: ${ymd}`,
  'author: アイ',
  'aiGenerated: true',
  `description: ${JSON.stringify(article.description.trim())}`,
  'thumbnail:',
  'draft: false',
  '---',
].join('\n');

await mkdir(dirname(outPath), { recursive: true });
await writeFile(outPath, `${fm}\n\n${article.body.trim()}\n`, 'utf8');

console.log(`生成完了: src/content/posts/auto-${compact}.md`);
console.log(`タイトル: ${article.title.trim()}`);
console.log(
  `トークン使用量: input=${response.usage.input_tokens} output=${response.usage.output_tokens}`,
);
