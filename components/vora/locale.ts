/** App language — Me setting. Hangul Lights are allowed when `ko`. */

export type VoraLocale = 'en' | 'ko'

export function normalizeLocale(value: unknown): VoraLocale {
  return value === 'ko' ? 'ko' : 'en'
}

export function allowsHangul(locale: VoraLocale): boolean {
  return locale === 'ko'
}

type Copy = {
  slogan: string
  tagline: string
  tabSky: string
  tabMe: string
  yourSky: string
  language: string
  languageEn: string
  languageKo: string
  voraPlus: string
  subscription: string
  active: string
  subscribe: string
  comingSoon: string
  opening: string
  onceMore: string
  dayWithYou: (days: number) => string
  todaysStar: string
  holdThisLight: string
  holdToSky: string
  holding: string
  rising: string
  cancel: string
  writeYourOwn: string
  releaseFromSky: string
  keep: string
  release: string
  skyBegins: string
  releasedQuiet: string
  writePlaceholder: string
  writeSentenceHint: string
  writeDuplicateHint: string
  writeHangulHint: string
  writeSwitchKo: string
  leaveLight: string
  keepWriting: string
  leave: string
  muteSound: string
  enableSound: string
  writeOwnAria: string
  closeWritingAria: string
  save: string
  share: string
  saving: string
  preparing: string
  sharing: string
  shared: string
  saved: string
  savedPhotos: string
  savedGallery: string
  today: string
  enterSky: string
  soundHint: string
  privacy: string
  terms: string
  status: string
  whoMade: string
  privacyPolicy: string
  termsOfUse: string
  skyClear: string
  holdLightAria: string
  couldNotSave: string
  couldNotShare: string
  close: string
  mainNavigation: string
  voraHome: string
  lightCard: string
  closeCard: string
  skipTransformation: string
  closing: string
  theme: string
  themeDefault: string
  themePure: string
  themeBlack: string
  themePink: string
  themeAurora: string
  themeDone: string
}

const EN: Copy = {
  slogan: 'Look at yourself.',
  tagline: 'Your words become stars.',
  tabSky: 'Sky',
  tabMe: 'Me',
  yourSky: 'Your sky',
  language: 'Language',
  languageEn: 'English',
  languageKo: '한국어',
  voraPlus: 'VORA+',
  subscription: 'Subscription',
  active: 'Active',
  subscribe: 'Subscribe',
  comingSoon: 'Coming soon',
  opening: 'Opening',
  onceMore: 'Once more.',
  dayWithYou: (days) => (days <= 1 ? 'Day 1 with you.' : `Day ${days} with you.`),
  todaysStar: "Today's Star",
  holdThisLight: 'Hold this Star',
  holdToSky: 'Hold to Sky',
  holding: 'Holding…',
  rising: 'Rising…',
  cancel: 'Cancel',
  writeYourOwn: 'Write your own',
  releaseFromSky: 'Release from Sky',
  keep: 'Keep',
  release: 'Release',
  skyBegins: 'Your sky begins.',
  releasedQuiet: 'Released into quiet.',
  writePlaceholder: 'Write a sentence, only for you…',
  writeSentenceHint: 'At least one sentence becomes a star.',
  writeDuplicateHint: 'Already in your sky today.',
  writeHangulHint: 'Writing in Korean?',
  writeSwitchKo: 'Switch to 한국어',
  leaveLight: 'Leave this Light?',
  keepWriting: 'Keep writing',
  leave: 'Leave',
  muteSound: 'Mute sound',
  enableSound: 'Enable sound',
  writeOwnAria: 'Write your own Light',
  closeWritingAria: 'Close writing',
  save: 'Save',
  share: 'Share',
  saving: 'Saving…',
  preparing: 'Preparing…',
  sharing: 'Sharing…',
  shared: 'Shared',
  saved: 'Saved',
  savedPhotos: 'Saved to Photos',
  savedGallery: 'Saved to gallery',
  today: 'Today',
  enterSky: 'Enter your Sky',
  soundHint: 'Sound is part of the sky',
  privacy: 'Privacy',
  terms: 'Terms',
  status: 'Status',
  whoMade: 'Who made this?',
  privacyPolicy: 'Privacy Policy',
  termsOfUse: 'Terms of Use',
  skyClear: 'Sky is clear.',
  holdLightAria: "Hold today's Star to your Sky",
  couldNotSave: 'Could not save',
  couldNotShare: 'Could not share',
  close: 'Close',
  mainNavigation: 'Main navigation',
  voraHome: 'VORA home',
  lightCard: 'Light card',
  closeCard: 'Close card',
  skipTransformation: 'Skip transformation',
  closing: 'Closing',
  theme: 'Theme',
  themeDefault: 'Default',
  themePure: 'Pure',
  themeBlack: 'Black',
  themePink: 'Pink',
  themeAurora: 'Aurora',
  themeDone: 'Done',
}

const KO: Copy = {
  slogan: '나를 바라보세요.',
  tagline: '나의 말이 별이 됩니다.',
  tabSky: '하늘',
  tabMe: '나',
  yourSky: '나의 하늘',
  language: '언어',
  languageEn: 'English',
  languageKo: '한국어',
  voraPlus: 'VORA+',
  subscription: '구독',
  active: '이용 중',
  subscribe: '구독하기',
  comingSoon: '준비 중',
  opening: '오프닝',
  onceMore: '다시 한 번.',
  dayWithYou: (days) => (days <= 1 ? '함께한 첫날.' : `함께한 ${days}일째.`),
  todaysStar: '오늘의 별',
  holdThisLight: '이 별 담기',
  holdToSky: '하늘에 담기',
  holding: '담는 중…',
  rising: '떠오르는 중…',
  cancel: '취소',
  writeYourOwn: '내 문장 쓰기',
  releaseFromSky: '하늘에서 놓아주기',
  keep: '그대로 두기',
  release: '놓아주기',
  skyBegins: '하늘이 시작됩니다.',
  releasedQuiet: '고요 속으로 돌아갔습니다.',
  writePlaceholder: '나만의 문장을 적어보세요…',
  writeSentenceHint: '적어도 한 문장이면 별이 됩니다.',
  writeDuplicateHint: '오늘 하늘에 이미 있는 문장입니다.',
  writeHangulHint: '한국어로 쓰고 있나요?',
  writeSwitchKo: '한국어로 전환',
  leaveLight: '이 문장을 떠날까요?',
  keepWriting: '계속 쓰기',
  leave: '나가기',
  muteSound: '소리 끄기',
  enableSound: '소리 켜기',
  writeOwnAria: '나만의 빛 쓰기',
  closeWritingAria: '쓰기 닫기',
  save: '저장',
  share: '공유',
  saving: '저장 중…',
  preparing: '준비 중…',
  sharing: '공유 중…',
  shared: '공유됨',
  saved: '저장됨',
  savedPhotos: '사진에 저장됨',
  savedGallery: '갤러리에 저장됨',
  today: '오늘',
  enterSky: '하늘로 들어가기',
  soundHint: '소리도 하늘의 일부예요',
  privacy: '개인정보',
  terms: '약관',
  status: '상태',
  whoMade: '누가 만들었나요?',
  privacyPolicy: '개인정보 처리방침',
  termsOfUse: '이용약관',
  skyClear: '하늘이 맑습니다.',
  holdLightAria: '오늘의 별을 하늘에 담기',
  couldNotSave: '저장하지 못했어요',
  couldNotShare: '공유하지 못했어요',
  close: '닫기',
  mainNavigation: '주요 메뉴',
  voraHome: 'VORA 홈',
  lightCard: '빛 카드',
  closeCard: '카드 닫기',
  skipTransformation: '변환 건너뛰기',
  closing: '닫는 중',
  theme: '테마',
  themeDefault: '기본',
  themePure: '퓨어',
  themeBlack: '블랙',
  themePink: '핑크',
  themeAurora: '오로라',
  themeDone: '완료',
}

const COPY: Record<VoraLocale, Copy> = { en: EN, ko: KO }

export function copy(locale: VoraLocale): Copy {
  return COPY[locale] ?? EN
}

export function dateLocaleTag(locale: VoraLocale): string {
  return locale === 'ko' ? 'ko-KR' : 'en-US'
}
