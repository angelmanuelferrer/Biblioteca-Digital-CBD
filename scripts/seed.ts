import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Author from '../src/models/Author';
import Book from '../src/models/Book';

dotenv.config();

// ─── Open Library types ───────────────────────────────────────────────────────

interface OLAuthorRef { key: string; name?: string }

interface OLWork {
  key: string;
  title: string;
  authors?: OLAuthorRef[];
  first_publish_year?: number;
  subject?: string[];
  cover_id?: number;
  cover_edition_key?: string;
  description?: string | { value: string };
}

interface OLSubjectResponse {
  works: OLWork[];
}

interface OLAuthorDetail {
  name?: string;
  bio?: string | { value: string };
  birth_date?: string;
  death_date?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function fetchJSON<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json() as T;
  } catch {
    return null;
  }
}

function extractText(val: string | { value: string } | undefined): string | undefined {
  if (!val) return undefined;
  if (typeof val === 'string') return val;
  return val.value;
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const SUBJECTS = [
  'computer_science',
  'algorithms',
  'programming',
  'data_structures',
  'operating_systems',
  'computer_networks',
  'databases',
  'software_engineering',
  'artificial_intelligence',
  'computer_architecture',
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI no definida en .env');

  await mongoose.connect(uri);
  console.log('Conectado a MongoDB\n');

  await Promise.all([Author.deleteMany({}), Book.deleteMany({})]);
  console.log('Colecciones limpiadas\n');

  // ── 1. Fetch works from Open Library ────────────────────────────────────────
  console.log(`Descargando libros de Open Library (${SUBJECTS.length} materias)...`);

  const workMap = new Map<string, OLWork>(); // dedup by key

  for (const subject of SUBJECTS) {
    const url = `https://openlibrary.org/subjects/${subject}.json?limit=50`;
    const data = await fetchJSON<OLSubjectResponse>(url);
    if (data?.works) {
      for (const w of data.works) workMap.set(w.key, w);
    }
    process.stdout.write(`  ${subject}: ${data?.works?.length ?? 0} obras\n`);
    await sleep(300);
  }

  const works = Array.from(workMap.values()).slice(0, 200);
  console.log(`\nTotal obras únicas: ${works.length}\n`);

  // ── 2. Resolve authors ───────────────────────────────────────────────────────
  console.log('Resolviendo autores...');

  const authorKeySet = new Set<string>();
  for (const w of works) {
    for (const a of w.authors ?? []) authorKeySet.add(a.key);
  }

  const authorKeyToId = new Map<string, mongoose.Types.ObjectId>();
  let authorCount = 0;

  for (const key of authorKeySet) {
    const url = `https://openlibrary.org${key}.json`;
    const detail = await fetchJSON<OLAuthorDetail>(url);
    const name = detail?.name ?? key.split('/').pop() ?? 'Desconocido';

    const author = await Author.create({
      name,
      bio: extractText(detail?.bio),
      birthDate: detail?.birth_date ? new Date(detail.birth_date) : undefined,
      deathDate: detail?.death_date ? new Date(detail.death_date) : undefined,
    });

    authorKeyToId.set(key, author._id as mongoose.Types.ObjectId);
    authorCount++;

    if (authorCount % 20 === 0) {
      process.stdout.write(`  ${authorCount}/${authorKeySet.size} autores\n`);
    }
    await sleep(150);
  }

  console.log(`  ${authorCount} autores insertados\n`);

  // ── 3. Insert books ──────────────────────────────────────────────────────────
  console.log('Insertando libros...');

  let bookCount = 0;

  for (const work of works) {
    const authorIds = (work.authors ?? [])
      .map(a => authorKeyToId.get(a.key))
      .filter((id): id is mongoose.Types.ObjectId => id !== undefined);

    const genres = (work.subject ?? []).slice(0, 5);
    const totalCopies = Math.floor(Math.random() * 5) + 1;

    await Book.create({
      title: work.title,
      description: extractText(work.description),
      publishedYear: work.first_publish_year,
      genres,
      authorIds,
      totalCopies,
      availableCopies: Math.floor(Math.random() * (totalCopies + 1)),
    });

    bookCount++;
    if (bookCount % 25 === 0) {
      process.stdout.write(`  ${bookCount}/${works.length} libros\n`);
    }
  }

  console.log(`  ${bookCount} libros insertados\n`);
  console.log('Seed completado.');

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Error en seed:', err.message);
  process.exit(1);
});
