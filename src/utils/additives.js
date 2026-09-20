export const SUMMARY_URL = 'https://raw.githubusercontent.com/is-it-healthy/data/refs/heads/main/dist/ins-summary.json'
export const DETAIL_URL = 'https://raw.githubusercontent.com/is-it-healthy/data/main/dist/single/'

// keep codes in the same format as the json filenames
export function normalizeCode(value) {
  let code = String(value || '').toLowerCase().trim()
  code = code.replace(/^ins/, '').replace(/^e/, '').trim()
  code = code.replaceAll('(', '').replaceAll(')', '')

  if (!/^[1-9]\d{2,3}[a-z]{0,3}$/.test(code)) {
    return ''
  }

  return 'E' + code
}

export function searchAdditives(query, items) {
  const search = query.toLowerCase().trim()
  const code = normalizeCode(query)

  return items.filter((item) => {
    return item.name.toLowerCase().includes(search) ||
      (code && item.code.startsWith(code))
  })
}

export function matchAdditives(text, items) {
  const words = text.toLowerCase()
    .replace(/\(([ivx]+)\)/g, '$1')
    .replace(/[(),;:]/g, ' ')
    .split(/\s+/)
  const units = ['g', 'mg', 'kg', 'ml', 'l', 'kj', 'kcal', 'calories']
  const codes = []

  for (let i = 0; i < words.length; i++) {
    const word = words[i].replace(/\.$/, '')
    const nextWord = (words[i + 1] || '').replace(/\.$/, '')

    // skip measurements like 100 g
    if (units.includes(nextWord)) continue

    const code = normalizeCode(word)
    if (code) codes.push(code)
  }

  const label = ' ' + text.toLowerCase().replace(/[^a-z0-9]+/g, ' ') + ' '
  const matches = []

  for (const item of items) {
    // remove the code and abbreviation to get just the additive name
    const name = item.name.split(' - ').pop().split('(')[0]
      .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

    if (codes.includes(item.code)) {
      matches.push({ ...item, matchType: 'code' })
    } else if (name && label.includes(' ' + name + ' ')) {
      matches.push({ ...item, matchType: 'name' })
    }
  }

  return matches
}

const sectionTitles = {
  side_effects: 'Side effects',
  overview: 'Overview',
  uses: 'Uses',
  precautions: 'Precautions',
  interactions: 'Interactions',
  origin: 'Origin',
  daily_intake: 'Daily intake',
  characteristics: 'Characteristics',
  products: 'Products',
  dietary_restrictions: 'Dietary restrictions',
}

export function normalizeDetail(data, summary = {}) {
  const detail = data || {}
  const info = detail.more_info || {}
  const articles = info.articles || {}
  const code = normalizeCode(summary.code || detail.code)
  const sections = []
  const sources = []

  for (const key in sectionTitles) {
    if (typeof info[key] === 'string' && info[key].trim()) {
      sections.push({ key, title: sectionTitles[key], text: info[key] })
    }
  }

  for (const title in articles) {
    const url = articles[title]
    if (typeof url === 'string' && /^https?:\/\//.test(url)) {
      sources.push({ title, url })
    }
  }

  if (code) {
    sources.push({ title: 'INS data source', url: DETAIL_URL + code + '.json' })
  }

  // handle both the old and new field names
  return {
    code,
    name: detail.display_name || detail.names || detail.name || summary.name || code,
    category: detail.function || detail.type || '',
    regulatoryNote: info.banned_in || '',
    sections,
    sources,
  }
}
