/**
 * Today's Star — one quiet pool.
 * Founders & builders (Jobs · Musk · Altman & kin).
 * Recognizable lines. No attribution names in product copy.
 */
export const LIGHTS = [
  'Stay hungry. Stay foolish.',
  'Your time is limited, so don’t waste it living someone else’s life.',
  'The people who are crazy enough to think they can change the world are the ones who do.',
  'Remembering that you’ll die is the best way I know to avoid the trap of thinking you have something to lose.',
  'Don’t let the noise of others’ opinions drown out your own inner voice.',
  'Have the courage to follow your heart and intuition.',
  'We’re here to put a dent in the universe.',
  'It’s better to be a pirate than to join the navy.',
  'The only way to do great work is to love what you do.',
  'You have to trust that the dots will somehow connect in your future.',
  'You can’t connect the dots looking forward; you can only connect them looking backward.',
  'Getting fired was the best thing that could have ever happened to me.',
  'Innovation distinguishes between a leader and a follower.',
  'Design is not just what it looks like. Design is how it works.',
  'Sometimes when you innovate, you make mistakes. Admit them quickly, and improve the next thing.',
  'Being the richest person in the cemetery doesn’t matter to me.',
  'Find what you love the way you’d find someone to love.',
  'Your work will fill a large part of your life. Do what you believe is great work.',
  'If you haven’t found it yet, keep looking. Don’t settle.',
  'Simple can be harder than complex.',
  'When something is important enough, you do it even if the odds are against you.',
  'Failure is an option. If things aren’t failing, you aren’t innovating enough.',
  'Persistence is everything. Don’t give up unless you’re forced to.',
  'Some people don’t like change, but you need to embrace it if the alternative is disaster.',
  'Ordinary people can choose to be extraordinary.',
  'Have almost too much self-belief.',
  'The biggest risk is not taking any risk.',
  'History belongs to the doers.',
  'Have the courage to ask for what you want.',
  'Put all your eggs in one basket — and watch that basket.',
  'The most precious asset we all have is time.',
  'Life will give you great trials. Don’t lose faith in yourself.',
  'What you’ll regret most is what you didn’t do.',
  'Stop looking back at yesterday. Build tomorrow instead.',
  'People do their best work when they know the goal — and why.',
  'Keep a feedback loop. Think about what you did, and how to do it better.',
  'Focus. Connect. Believe in yourself.',
  'Make it easy to take risks.',
  'Find the intersection of what you’re good at, what you love, and what creates value.',
  'Details matter. It’s worth waiting to get it right.',
] as const

export type VoraLightLine = (typeof LIGHTS)[number]
