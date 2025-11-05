const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const apiDir = path.join(root, 'app', 'api')
const outFile = path.join(root, 'api-routes.csv')

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  let files = []
  for (const e of entries) {
    const res = path.join(dir, e.name)
    if (e.isDirectory()) files = files.concat(walk(res))
    else files.push(res)
  }
  return files
}

const tsFiles = walk(apiDir).filter(f => f.endsWith('route.ts'))

const rows = []
for (const file of tsFiles) {
  const content = fs.readFileSync(file, 'utf8')
  const re = /export\s+async\s+function\s+([A-Z][A-Za-z]*)/g
  let m
  while ((m = re.exec(content))) {
    const method = m[1]
    let rel = path.relative(root, file).replace(/\\/g, '/')
    // convert app/api/.../route.ts -> /api/... (replace [id] with :id)
    let route = rel.replace(/^app\/api/, 'api').replace(/\/route.ts$/, '')
    route = route.replace(/\[(.+?)\]/g, ':$1')
    rows.push(`${method},/${route}`)
  }
}

fs.writeFileSync(outFile, rows.join('\n'))
console.log(`Wrote ${rows.length} entries to ${outFile}`)
