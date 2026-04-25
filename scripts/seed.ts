import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Author from '../src/models/Author';
import Book from '../src/models/Book';
import User from '../src/models/User';
import Loan from '../src/models/Loan';
import Review from '../src/models/Review';

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

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function daysFromNow(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
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

const TEST_USERS = [
  { name: 'Admin ETSII',     email: 'admin@etsii.us.es',            password: 'Admin1234!', role: 'ADMIN' as const },
  { name: 'Juan García',     email: 'juan.garcia@alum.us.es',       password: 'User1234!',  role: 'USER'  as const },
  { name: 'María López',     email: 'maria.lopez@alum.us.es',       password: 'User1234!',  role: 'USER'  as const },
  { name: 'Carlos Martínez', email: 'carlos.martinez@alum.us.es',   password: 'User1234!',  role: 'USER'  as const },
  { name: 'Ana Fernández',   email: 'ana.fernandez@alum.us.es',     password: 'User1234!',  role: 'USER'  as const },
  { name: 'Luis Pérez',      email: 'luis.perez@alum.us.es',        password: 'User1234!',  role: 'USER'  as const },
  { name: 'Sofía Ruiz',      email: 'sofia.ruiz@alum.us.es',        password: 'User1234!',  role: 'USER'  as const },
  { name: 'David Torres',    email: 'david.torres@alum.us.es',      password: 'User1234!',  role: 'USER'  as const },
  { name: 'Elena Sánchez',   email: 'elena.sanchez@alum.us.es',     password: 'User1234!',  role: 'USER'  as const },
  { name: 'Pablo Jiménez',   email: 'pablo.jimenez@alum.us.es',     password: 'User1234!',  role: 'USER'  as const },
];

const REVIEW_COMMENTS = [
  'Excelente libro, muy recomendable para quien quiera profundizar en el tema.',
  'Buen contenido aunque en algunos capítulos se vuelve demasiado técnico.',
  'Imprescindible para cualquier estudiante de informática.',
  'La explicación es clara y los ejemplos prácticos son muy útiles.',
  'Un poco desactualizado pero sigue siendo una referencia válida.',
  'Lo he usado para preparar exámenes y me ha ayudado bastante.',
  'Interesante perspectiva, aunque esperaba más profundidad en ciertos temas.',
  'Muy completo. Cubre todos los aspectos del tema con detalle.',
  'Lenguaje accesible incluso para principiantes. Lo recomiendo.',
  'Los ejercicios al final de cada capítulo son el punto fuerte del libro.',
  'Quizás demasiado denso para leerlo de una sola vez, pero como referencia es perfecto.',
  'Me ha servido de mucho en mi proyecto final de carrera.',
  'Los autores explican los conceptos complejos de manera muy sencilla.',
  'Algo repetitivo en algunos puntos, pero en general bastante útil.',
  'Una joya de la literatura técnica. Superó mis expectativas.',
  'El índice y los diagramas son muy claros, facilitan mucho el estudio.',
  'Recomendado por el profesor y no defrauda en absoluto.',
  'Le faltan más ejemplos prácticos, pero la teoría está muy bien explicada.',
  'Perfecto para afianzar conocimientos antes de un examen.',
  'He aprendido más con este libro que con los apuntes del curso.',
];

const LOAN_DURATION_DAYS = 14;

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI no definida en .env');

  await mongoose.connect(uri);
  console.log('Conectado a MongoDB\n');

  await Promise.all([
    Author.deleteMany({}),
    Book.deleteMany({}),
    User.deleteMany({}),
    Loan.deleteMany({}),
    Review.deleteMany({}),
  ]);
  console.log('Colecciones limpiadas\n');

  // ── 1. Fetch works from Open Library ────────────────────────────────────────
  console.log(`Descargando libros de Open Library (${SUBJECTS.length} materias)...`);

  const workMap = new Map<string, OLWork>();

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

  const allBooks: { _id: mongoose.Types.ObjectId; totalCopies: number }[] = [];
  let bookCount = 0;

  for (const work of works) {
    const authorIds = (work.authors ?? [])
      .map(a => authorKeyToId.get(a.key))
      .filter((id): id is mongoose.Types.ObjectId => id !== undefined);

    const genres = (work.subject ?? []).slice(0, 5);
    const totalCopies = Math.floor(Math.random() * 5) + 1;

    const book = await Book.create({
      title: work.title,
      description: extractText(work.description),
      publishedYear: work.first_publish_year,
      genres,
      authorIds,
      totalCopies,
      availableCopies: totalCopies,
    });

    allBooks.push({ _id: book._id as mongoose.Types.ObjectId, totalCopies });
    bookCount++;
    if (bookCount % 25 === 0) {
      process.stdout.write(`  ${bookCount}/${works.length} libros\n`);
    }
  }

  console.log(`  ${bookCount} libros insertados\n`);

  // ── 4. Create users ──────────────────────────────────────────────────────────
  console.log('Creando usuarios...');

  const allUserIds: mongoose.Types.ObjectId[] = [];
  for (const { password, ...rest } of TEST_USERS) {
    const u = await User.create({ ...rest, passwordHash: await bcrypt.hash(password, 10) });
    allUserIds.push(u._id as mongoose.Types.ObjectId);
  }
  // index 0 is admin — exclude from loan/review activity
  const regularUserIds = allUserIds.slice(1);

  console.log(`  ${TEST_USERS.length} usuarios creados\n`);

  // ── 5. Create loans ──────────────────────────────────────────────────────────
  console.log('Generando préstamos...');

  // track ACTIVE+LATE loans per book to fix availableCopies later
  const activeLoansPerBook = new Map<string, number>();
  // track which books each user returned (eligible for review)
  const returnedBooksByUser = new Map<string, Set<string>>();

  const loanStats = { total: 0, returned: 0, late: 0, active: 0 };

  for (const userId of regularUserIds) {
    const loansCount = Math.floor(Math.random() * 8) + 5; // 5-12 loans per user
    const booksForUser = shuffle(allBooks).slice(0, loansCount);
    const returnedSet = new Set<string>();

    for (const book of booksForUser) {
      const bookIdStr = book._id.toString();
      const roll = Math.random();
      let loanDate: Date, dueDate: Date, returnDate: Date | undefined;
      let status: 'ACTIVE' | 'RETURNED' | 'LATE';

      if (roll < 0.60) {
        // RETURNED — completed loan in the past
        const startedDaysAgo = Math.floor(Math.random() * 150) + 20;
        loanDate = daysAgo(startedDaysAgo);
        dueDate = new Date(loanDate);
        dueDate.setDate(dueDate.getDate() + LOAN_DURATION_DAYS);
        returnDate = new Date(loanDate);
        returnDate.setDate(returnDate.getDate() + Math.floor(Math.random() * 13) + 1);
        status = 'RETURNED';
        returnedSet.add(bookIdStr);
        loanStats.returned++;
      } else if (roll < 0.80) {
        // LATE — overdue, not yet returned
        const startedDaysAgo = Math.floor(Math.random() * 60) + LOAN_DURATION_DAYS + 1;
        loanDate = daysAgo(startedDaysAgo);
        dueDate = daysAgo(startedDaysAgo - LOAN_DURATION_DAYS);
        status = 'LATE';
        const cur = activeLoansPerBook.get(bookIdStr) ?? 0;
        activeLoansPerBook.set(bookIdStr, cur + 1);
        loanStats.late++;
      } else {
        // ACTIVE — ongoing loan
        loanDate = daysAgo(Math.floor(Math.random() * 10));
        dueDate = daysFromNow(LOAN_DURATION_DAYS - Math.floor(Math.random() * 10));
        status = 'ACTIVE';
        const cur = activeLoansPerBook.get(bookIdStr) ?? 0;
        activeLoansPerBook.set(bookIdStr, cur + 1);
        loanStats.active++;
      }

      await Loan.create({ userId, bookId: book._id, loanDate, dueDate, returnDate, status });
      loanStats.total++;
    }

    returnedBooksByUser.set(userId.toString(), returnedSet);
  }

  console.log(`  ${loanStats.total} préstamos (devueltos: ${loanStats.returned}, activos: ${loanStats.active}, vencidos: ${loanStats.late})\n`);

  // ── 6. Fix availableCopies ───────────────────────────────────────────────────
  console.log('Actualizando copias disponibles...');

  for (const book of allBooks) {
    const active = activeLoansPerBook.get(book._id.toString()) ?? 0;
    const available = Math.max(0, book.totalCopies - active);
    await Book.findByIdAndUpdate(book._id, { availableCopies: available });
  }

  console.log('  Hecho\n');

  // ── 7. Create reviews ────────────────────────────────────────────────────────
  console.log('Generando reseñas...');

  const ratingsMap = new Map<string, number[]>();
  let reviewCount = 0;

  for (const [userIdStr, returnedBookIds] of returnedBooksByUser) {
    for (const bookIdStr of returnedBookIds) {
      if (Math.random() > 0.65) continue; // ~65% of returned loans get a review

      const rating = Math.floor(Math.random() * 5) + 1;
      const comment = Math.random() > 0.15 ? pick(REVIEW_COMMENTS) : undefined;

      await Review.create({
        userId: new mongoose.Types.ObjectId(userIdStr),
        bookId: new mongoose.Types.ObjectId(bookIdStr),
        rating,
        comment,
      });

      const existing = ratingsMap.get(bookIdStr) ?? [];
      existing.push(rating);
      ratingsMap.set(bookIdStr, existing);
      reviewCount++;
    }
  }

  console.log(`  ${reviewCount} reseñas creadas\n`);

  // ── 8. Recalculate book ratings ──────────────────────────────────────────────
  console.log('Recalculando ratings de libros...');

  for (const [bookIdStr, ratings] of ratingsMap) {
    const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    await Book.findByIdAndUpdate(bookIdStr, {
      averageRating: Math.round(avg * 10) / 10,
      ratingsCount: ratings.length,
    });
  }

  console.log('  Hecho\n');

  // ── 9. Summary ───────────────────────────────────────────────────────────────
  console.log('══════════════════════════════════════');
  console.log('  Seed completado');
  console.log('══════════════════════════════════════');
  console.log(`  Autores  : ${authorCount}`);
  console.log(`  Libros   : ${bookCount}`);
  console.log(`  Usuarios : ${TEST_USERS.length}`);
  console.log(`  Préstamos: ${loanStats.total} (devueltos: ${loanStats.returned}, activos: ${loanStats.active}, vencidos: ${loanStats.late})`);
  console.log(`  Reseñas  : ${reviewCount} en ${ratingsMap.size} libros`);
  console.log('\n  Credenciales:');
  for (const u of TEST_USERS) {
    console.log(`    [${u.role.padEnd(5)}] ${u.email}  /  ${u.password}`);
  }

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Error en seed:', err.message);
  process.exit(1);
});
