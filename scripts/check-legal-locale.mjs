import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (path) => readFileSync(join(root, path), 'utf8')

const privacy = read('components/vora/privacy-content.tsx')
const terms = read('components/vora/terms-content.tsx')
const sheet = read('components/vora/enter-chrome.tsx')
const publicPage = read('components/vora/legal-public-page.tsx')
const layout = read('app/layout.tsx')

for (const required of [
  '처리 목적·항목·보유기간',
  '제3자 제공·처리위탁·국외 처리',
  '파기와 이용자의 권리',
  '안전성 확보 조치',
  '아동의 개인정보',
  '북미 지역 이용자의 권리',
  '개인정보 보호 담당',
]) {
  assert.ok(privacy.includes(required), `privacy section missing: ${required}`)
}

for (const required of [
  '서비스와 약관의 적용',
  '유료 서비스와 구독',
  '책임의 범위',
  'North American consumers',
  '약관 변경과 분쟁',
]) {
  assert.ok(terms.includes(required), `terms section missing: ${required}`)
}

assert.ok(sheet.includes('<PrivacyChapters locale={locale}'))
assert.ok(sheet.includes('<TermsChapters locale={locale}'))
assert.ok(sheet.includes('STATUS_LINES[locale]'))
assert.ok(publicPage.includes('preferredLocale()'))
assert.ok(publicPage.includes('document.documentElement.lang = locale'))
assert.ok(!layout.includes('@vercel/analytics'))
assert.ok(privacy.includes('공식 앱스토어 등록정보의 개발자 연락처'))
assert.ok(terms.includes('official app-store'))
assert.ok(privacy.includes('United States privacy notice'))
assert.ok(privacy.includes('Canada privacy notice'))
assert.ok(privacy.includes('Global Privacy Control'))
assert.ok(privacy.includes('not directed to children under 13'))
assert.ok(!privacy.includes('remote usage analytics or personalized\\n          advertising SDKs. We do not transmit') || privacy.includes('website host'))

console.log('legal locale OK — Korean policy, terms, status, public pages, and no remote analytics')
