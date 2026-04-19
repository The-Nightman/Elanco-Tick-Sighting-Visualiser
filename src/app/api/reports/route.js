import { stringify } from 'csv-stringify/sync';

export async function GET() {
  const filePath = path.join(
    process.cwd(),
    'src',
    'db',
    'data',
    'tick_sightings.csv'
  )

  const fileContent = await fs.readFile(filePath, 'utf-8')

  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  })

  const { searchParams } = new URL(req.url)
  const city = searchParams.get('city')
  const species = searchParams.get('species')

  const filtered = records.filter(row =>
    (!city || row.city === city) &&
    (!species || row.species === species)
  )

  const csv = stringify(filtered, {
    header: true,
    columns: ['species', 'latin', 'city'],
  })

  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="Ticks_Sightings.csv"'
    }
  });
}