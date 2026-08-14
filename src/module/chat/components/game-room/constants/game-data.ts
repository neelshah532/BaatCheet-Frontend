export const WOULD_YOU_RATHER_QUESTIONS = [
  {
    q: 'Would you rather have to speak in rhymes for the rest of the day OR only communicate in sign language?',
    a: 'Speak in rhymes',
    b: 'Use sign language',
  },
  {
    q: 'Would you rather live in a futuristic luxury smart home OR in a quiet, cozy cabin in the deep wilderness?',
    a: 'Futuristic smart home',
    b: 'Cozy cabin in wilderness',
  },
  {
    q: 'Would you rather only be able to see each other once a year for a month OR see each other every weekend for only 2 hours?',
    a: 'Once a year for a month',
    b: 'Every weekend for 2 hours',
  },
  {
    q: "Would you rather have a direct portal to each other's living rooms OR get 1 million dollars but you can't see each other for 2 years?",
    a: 'Direct portal',
    b: '1 Million Dollars',
  },
  {
    q: 'Would you rather share all of your thoughts in real-time OR never be able to talk about your feelings?',
    a: 'Share all thoughts',
    b: 'Never talk about feelings',
  },
]

export const TRUTH_OR_DARE_CARDS = {
  truth: [
    'What is the first thing you noticed about me when we met?',
    'If you could change one thing about our daily communication, what would it be?',
    'What is your favorite memory of us together?',
    'What is the most thoughtful thing I have ever done for you?',
    'If you had to describe our bond in three words, what would they be?',
  ],
  dare: [
    'Send me a silly face photo right now in direct messages.',
    'Do a 15-second funny dance on your camera feed.',
    'Sing the chorus of your favorite love song to me right now.',
    'Show me the most random item in your room and explain why you have it.',
    "Say 'I love you' or a cute compliment in a funny accent.",
  ],
}

export const CHESS_PUZZLES = [
  {
    id: 1,
    title: "Scholar's Mate Defence",
    description: 'White is threatening checkmate on f7. Find the winning checkmate move for White to finish the game right now!',
    fen: 'r1bqkbnr/pp1ppppp/2n5/2p5/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 4 4',
    solution: { from: 'f3', to: 'f7' },
    hint: 'Move your Queen from f3 to capture the pawn on f7.',
  },
  {
    id: 2,
    title: 'Back Rank Defiance',
    description: 'Find the back rank checkmate. Deliver mate on the 8th row!',
    fen: '6k1/5ppp/8/8/8/8/8/3R2K1 w - - 0 1',
    solution: { from: 'd1', to: 'd8' },
    hint: 'Move the Rook on d1 all the way to d8.',
  },
  {
    id: 3,
    title: 'Promote to Win',
    description: 'The pawn is one step away from promotion. Move it to the 8th rank to claim victory!',
    fen: '3r4/P7/8/8/8/8/8/k3K3 w - - 0 1',
    solution: { from: 'a7', to: 'a8' },
    hint: 'Move the pawn from a7 to a8.',
  },
]

export const TIME_CONTROL_PRESETS = [
  { id: 'none', label: 'No Clock', initialSeconds: 0, incrementSeconds: 0 },
  { id: 'bullet_1_0', label: 'Bullet 1|0', initialSeconds: 60, incrementSeconds: 0 },
  { id: 'bullet_2_1', label: 'Bullet 2|1', initialSeconds: 120, incrementSeconds: 1 },
  { id: 'blitz_3_0', label: 'Blitz 3|0', initialSeconds: 180, incrementSeconds: 0 },
  { id: 'blitz_5_0', label: 'Blitz 5|0', initialSeconds: 300, incrementSeconds: 0 },
  { id: 'rapid_10_0', label: 'Rapid 10|0', initialSeconds: 600, incrementSeconds: 0 },
  { id: 'rapid_15_10', label: 'Rapid 15|10', initialSeconds: 900, incrementSeconds: 10 },
]
