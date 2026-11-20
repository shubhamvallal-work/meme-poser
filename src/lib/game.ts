import { extraReactions } from "./reaction-catalog";

export type MemeColor = "pink" | "lavender" | "orange" | "lime";

export type Meme = {
  id: string;
  name: string;
  alt: string;
  mood: string;
  difficulty: string;
  color: MemeColor;
  prompt: string;
  tip: string;
  image: string;
  position?: string;
  boss?: boolean;
};

const referenceMemes: Meme[] = [
  {
    id: "chloe", name: "Side-Eye Chloe", image: "/memes/side-eye-chloe.jpg",
    alt: "Chloe giving a skeptical sideways look with a slightly open mouth",
    mood: "PROFESSIONAL SIDE-EYE", difficulty: "A little attitude", color: "pink",
    prompt: "One raised brow. A tiny grimace. Maximum judgment.",
    tip: "Look slightly to the side. Let your eyebrows do the talking.", position: "50% 45%",
  },
  {
    id: "disaster", name: "Disaster Girl", image: "/memes/disaster-girl.jpg",
    alt: "Disaster Girl looking back with a mischievous half-smile",
    mood: "INNOCENT. OBVIOUSLY.", difficulty: "Main character energy", color: "lavender",
    prompt: "A knowing smirk. A subtle head tilt. Absolutely no regrets.",
    tip: "Turn your head a little and give the camera your sneakiest smile.", position: "72% 50%",
  },
  {
    id: "success", name: "Success Kid", image: "/memes/success-kid.jpg",
    alt: "Success Kid clenching his fist with a determined expression",
    mood: "SMALL WIN. BIG ENERGY.", difficulty: "Feeling victorious", color: "orange",
    prompt: "Clench that fist. Scrunch that face. You just won at life.",
    tip: "Tighten your lips, lower your brows, and celebrate your imaginary win.", position: "50% 50%",
  },
];

// Blank templates from the Memegen library, bundled for offline play.
const libraryTemplates = [
  ["harold","Hide the Pain Harold","Smile politely while your eyes beg for help."],
  ["oag","Overly Attached Girlfriend","Open your eyes wide and hold a fixed grin."],
  ["wonka","Condescending Wonka","Rest your cheek on your hand and smile knowingly."],
  ["morpheus","Matrix Morpheus","Lift your chin and deliver a solemn stare."],
  ["rollsafe","Roll Safe","Tap your temple with one finger and smirk."],
  ["fwp","First World Problems","Press a hand against your cheek and let your face crumple."],
  ["blb","Bad Luck Brian","Show your teeth in an awkward school-photo grin."],
  ["tenguy","10 Guy","Let your eyelids droop into a hazy half-smile."],
  ["interesting","The Most Interesting Man in the World","Angle your head and hold a composed, steady gaze."],
  ["ggg","Good Guy Greg","Relax your cheeks into a broad, easy smile."],
  ["ermg","Ermahgerd","Pull your chin back and stretch your mouth into a grin."],
  ["aint-got-time","Sweet Brown","Lift your brows and look off to one side in disbelief."],
  ["crazypills","I Feel Like I'm Taking Crazy Pills","Open your mouth and throw your hands up in disbelief."],
  ["afraid","Afraid to Ask Andy","Give a hesitant smile like you missed the question."],
  ["mordor","One Does Not Simply Walk into Mordor","Bring your thumb and finger together and look deadly serious."],
  ["toohigh","The Rent Is Too Damn High","Raise your hand and look fiercely determined."],
  ["whatyear","What Year Is It?","Widen your eyes like you just woke up in another decade."],
  ["yodawg","Xzibit Yo Dawg","Give the camera your biggest delighted grin."],
  ["aag","Ancient Aliens Guy","Half-close your eyes and smile like your wild theory explains everything."],
  ["agnes","Agnes Winking","Squeeze one eye shut and open your mouth for a theatrical wink."],
  ["badchoice","Milk Was a Bad Choice","Close your eyes and press your lips together like you regret that last sip."],
  ["both","Why Not Both?","Look sideways, lift your shoulders and give a tiny questioning smile."],
  ["box","What's in the Box?","Squint into the distance, furrow your brow and part your lips."],
  ["dwight","Schrute Facts","Pull your eyebrows together and set your mouth in a stern, straight line."],
  ["elf","You Sit on a Throne of Lies","Pin your lips shut and stare ahead like someone just betrayed you."],
  ["hagrid","I Should Not Have Said That","Lift your brows, widen your eyes and freeze halfway through a thought."],
  ["inigo","Inigo Montoya","Tip your chin down, look up and let one eyebrow rise."],
  ["keanu","Conspiracy Keanu","Raise your eyebrows and leave your mouth half open as the theory sinks in."],
  ["michael-scott","Michael Scott Says No","Drop your jaw wide open and lock eyes with the person who broke the news."],
  ["officespace","That Would Be Great","Angle your head, peer through imaginary glasses and give a tight-lipped smile."],
  ["sparta","This Is Sparta!","Draw your eyebrows down and open your mouth for a silent battle cry."],
  ["winter","Winter Is Coming","Look off to the side, pinch your brows and brace for bad weather."],
  ["yallgot","Y’all Got Any More?","Look up to one side and part your lips like you’re about to ask a favor."],
] as const;

const colors: MemeColor[] = ["pink", "lavender", "orange", "lime"];

const reactionPacks: Meme[] = [
  ...extraReactions,
  ["speed", "Speed Trying Not to Laugh", "Brainrot", "Close your eyes and press your lips into a smile you can barely hold."],
  ["rock", "Vine Boom Eyebrow", "Brainrot", "Lift just one eyebrow and hold the camera's gaze."],
  ["sigma", "Sigma Stare", "Brainrot", "Narrow your eyes, raise your chin and push your lips forward."],
  ["raju", "Raju’s Paisa Double", "Indian reactions", "Dip your chin and flash Raju’s knowing grin."],
  ["aayein", "Aayein?", "Indian reactions", "Turn slightly sideways, knit your brows and part your lips in confusion."],
  ["jethalal", "Jethalal Surprised", "Indian reactions", "Lift your brows, widen your eyes and let your jaw drop."],
].map(([id, name, pack, prompt], index) => ({
  id, name, prompt, image: `/memes/${id}.jpg`, alt: `${name}. ${prompt}`,
  mood: pack.toUpperCase(), difficulty: pack, color: colors[index % colors.length],
  tip: "Set your head angle first, then match the eyes and mouth.",
}));

export const memes: Meme[] = [
  ...referenceMemes,
  ...reactionPacks,
  ...libraryTemplates.map(([id, name, prompt], index) => ({
    id, name, prompt,
    image: `/memes/${id}.jpg`,
    alt: `${name} meme. ${prompt}`,
    color: colors[index % colors.length],
    mood: "REACTION MEME",
    difficulty: "Expression challenge",
    tip: "Match the head angle first, then the eyes and mouth.",
  })),
];

export type Result = {
  score: number | null;
  reason?: string;
  feedback?: string;
  metrics: { label: string; value: number; observation: string }[];
  snapshot: string;
};

export type RoundResult = { round: number; meme: Meme; result: Result };
export const bossRounds = 15;
export const bossSeconds = 3;
const faceBossIds = ["chloe", "agnes", "ermg", "michael-scott", "sparta", "mordor"];
type GameState =
  | { screen: "landing" }
  | { screen: "reveal"; meme: Meme }
  | { screen: "pose"; meme: Meme; deck: Meme[]; endless: boolean; finishing?: boolean; seconds: number; rounds: RoundResult[] }
  | { screen: "recap"; rounds: RoundResult[] };

type GameAction =
  | { type: "home" }
  | { type: "choose"; meme: Meme }
  | { type: "start"; deck: Meme[]; endless: boolean; seconds: number }
  | { type: "capture"; memeId: string; result: Result; nextDeck?: Meme[] }
  | { type: "finish"; scoringMemeId?: string }
;

function shuffled(pool: Meme[]) {
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
}

export function buildDeck(first: Meme, count: number, finalBoss = false) {
  const faces = shuffled(memes.filter(m => m.id !== first.id));
  const deck = [first, ...faces.splice(0, Math.max(0, (finalBoss ? bossRounds : count) - 1))];
  if (finalBoss) {
    const last = deck.length - 1;
    if (last > 0 && !faceBossIds.includes(deck[last].id)) {
      const inSet = deck.findIndex((m, i) => i > 0 && faceBossIds.includes(m.id));
      if (inSet >= 0) [deck[last], deck[inSet]] = [deck[inSet], deck[last]];
      else deck[last] = faces.find(m => faceBossIds.includes(m.id)) ?? deck[last];
    }
    deck[last] = { ...deck[last], boss: true };
  }
  return deck;
}

function recap(rounds: RoundResult[]): GameState {
  const ranked = [...rounds].sort((a, b) => (b.result.score ?? -1) - (a.result.score ?? -1) || a.round - b.round);
  return { screen: "recap", rounds: ranked };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "home": return { screen: "landing" };
    case "choose": return { screen: "reveal", meme: action.meme };
    case "start":
      if (state.screen !== "reveal" || !action.deck.length) return state;
      return { screen: "pose", meme: action.deck[0], deck: action.deck, endless: action.endless, seconds: action.seconds, rounds: [] };
    case "finish":
      if (state.screen !== "pose" || !state.endless) return state;
      if (action.scoringMemeId === state.meme.id) return { ...state, finishing: true };
      return state.rounds.length ? recap(state.rounds) : { screen: "landing" };
    case "capture": {
      if (state.screen !== "pose" || state.meme.id !== action.memeId) return state;
      const rounds = [...state.rounds, { round: state.rounds.length + 1, meme: state.meme, result: action.result }];
      if (state.finishing) return recap(rounds);
      const index = state.endless ? rounds.length % state.deck.length : rounds.length;
      if (index === 0 && action.nextDeck?.length) {
        return { ...state, deck: action.nextDeck, meme: action.nextDeck[0], rounds };
      }
      const next = state.deck[index];
      if (next) return { ...state, meme: next, rounds };
      return recap(rounds);
    }
  }
}

export function pickMeme(excludeId?: string): Meme {
  const available = memes.filter((meme) => meme.id !== excludeId);
  return available[Math.floor(Math.random() * available.length)];
}

export function verdict(score: number) {
  if (score >= 85) return { title: "SUSPICIOUSLY ICONIC.", text: "The meme called. It wants its face back." };
  if (score >= 75) return { title: "BIG MEME ENERGY.", text: "You understood the assignment. Mostly." };
  return { title: "BEAUTIFULLY UNHINGED.", text: "A new meme was born. And honestly? We love it." };
}
