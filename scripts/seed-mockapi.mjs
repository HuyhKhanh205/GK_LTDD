// Đẩy 12 tour mẫu lên mockapi.io.
// Cách dùng:  node scripts/seed-mockapi.mjs https://<id>.mockapi.io/api/v1/tours
import { readFile } from 'node:fs/promises';

const url = process.argv[2];
if (!url) {
  console.error('Thiếu URL. Ví dụ: node scripts/seed-mockapi.mjs https://<id>.mockapi.io/api/v1/tours');
  process.exit(1);
}

const tours = JSON.parse(await readFile(new URL('../data/tours.seed.json', import.meta.url), 'utf8'));

for (const { id, ...tour } of tours) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tour),
  });
  const created = await res.json();
  console.log(res.ok ? `✔ ${created.id} - ${created.name}` : `✘ ${res.status} ${tour.name}`);
}
