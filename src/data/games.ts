export type GameTag = 'want-to-play' | 'played-loved' | 'all-time-favorite';

export const GAME_TAG_LABEL: Record<GameTag, string> = {
  'want-to-play': 'Want to Play',
  'played-loved': 'Played and Loved',
  'all-time-favorite': 'All-Time Favorite',
};

export type GameEntry = {
  slug: string;
  tag: GameTag;
  note?: string;
};

export const gamesILove: GameEntry[] = [
  // Add games here. `slug` is the RAWG slug — find it at the end of the
  // game's URL on rawg.io (e.g. https://rawg.io/games/shadow-of-the-colossus
  // → 'shadow-of-the-colossus'). Some sequels reuse the franchise root (e.g.
  // RAWG uses 'god-of-war-2' for the 2018 reboot, not the PS2 sequel — the
  // PS2 sequel is 'god-of-war-ii').

  // — All-time favorites —
  { slug: 'shadow-of-the-colossus', tag: 'all-time-favorite' },
  { slug: 'yu-gi-oh-duel-monsters-gx-tag-force-3', tag: 'all-time-favorite' },
  { slug: 'xcom-enemy-unknown', tag: 'all-time-favorite' },
  { slug: 'xcom-2', tag: 'all-time-favorite' },
  { slug: 'minecraft', tag: 'all-time-favorite' },
  { slug: 'robocraft', tag: 'all-time-favorite' },
  { slug: 'clair-obscur-expedition-33', tag: 'all-time-favorite' },
  { slug: 'league-of-legends', tag: 'all-time-favorite' },
  { slug: 'hearthstone', tag: 'all-time-favorite' },
  { slug: 'command-conquer-red-alert-2', tag: 'all-time-favorite' },
  { slug: 'command-conquer-red-alert-2-yuris-revenge', tag: 'all-time-favorite' },
  { slug: 'command-conquer-red-alert-3-2', tag: 'all-time-favorite' },
  { slug: 'starcraft', tag: 'all-time-favorite' },
  { slug: 'starcraft-2', tag: 'all-time-favorite' },
  { slug: 'hades-2018', tag: 'all-time-favorite' },
  { slug: 'hades-ii', tag: 'all-time-favorite' },
  { slug: 'the-binding-of-isaac-rebirth', tag: 'all-time-favorite' },
  { slug: 'slay-the-spire', tag: 'all-time-favorite' },
  { slug: 'slay-the-spire-2', tag: 'all-time-favorite' },
  { slug: 'to-the-moon', tag: 'all-time-favorite' },
  { "slug": "plants-vs-zombies", "tag": "all-time-favorite" },
  { "slug": "legendary-wars", "tag": "all-time-favorite" },
  { "slug": "monster-wars", "tag": "all-time-favorite" },

  // — Played and loved —
  { slug: 'besiege', tag: 'played-loved' },
  { slug: 'robotek', tag: 'played-loved' },
  { slug: 'wildfrost', tag: 'played-loved' },
  { slug: 'warframe', tag: 'played-loved' },
  { slug: 'patapon', tag: 'played-loved' },
  { slug: 'patapon-2', tag: 'played-loved' },
  { slug: 'patapon-3', tag: 'played-loved' },
  { slug: 'god-of-war', tag: 'played-loved' },
  { slug: 'god-of-war-ii', tag: 'played-loved' },
  { slug: 'god-of-war-2', tag: 'played-loved' },
  { slug: 'the-witcher-3-wild-hunt', tag: 'played-loved' },
  { slug: 'kingdom-hearts', tag: 'played-loved' },
  { slug: 'adventures-to-go', tag: 'played-loved' },
  { slug: 'rise-of-nations-rise-of-legends', tag: 'played-loved' },
  { slug: 'yu-gi-oh-duelists-of-the-roses', tag: 'played-loved' },
  { slug: 'yu-gi-oh-5ds-tag-force-4', tag: 'played-loved' },
  { slug: 'civilization-iv', tag: 'played-loved' },
  { slug: 'civilization-v', tag: 'played-loved' },
  { slug: 'civilization-vi', tag: 'played-loved' },
  { slug: 'into-the-breach', tag: 'played-loved' },
  { slug: 'evolve-stage-2', tag: 'played-loved' },
  { slug: 'faeria', tag: 'played-loved' },
  { slug: 'pirates-outlaws', tag: 'played-loved' },
  { slug: 'void-tyrant', tag: 'played-loved' },
  { slug: 'monster-lab', tag: 'played-loved' },
  { slug: 'death-palette', tag: 'played-loved' },
  { slug: 'deemo', tag: 'played-loved' },
  { slug: 'contre-jour', tag: 'played-loved' },
  { slug: 'infinity-blade', tag: 'played-loved' },
  { slug: 'heroes-of-dragon-age', tag: 'played-loved' },
  { slug: 'army-of-darkness', tag: 'played-loved' },
  { slug: '20-minutes-till-dawn', tag: 'played-loved' },
  { slug: "might-magic-heroes-vi", tag: 'played-loved' },
  
  // — Want to play —
  { slug: 'crisis-core-final-fantasy-7', tag: 'want-to-play' },
  { slug: 'elden-ring', tag: 'want-to-play' },
  { slug: 'hollow-knight', tag: 'want-to-play' },
  { slug: 'hollow-knight-silksong', tag: 'want-to-play' },
  { slug: 'lies-of-p', tag: 'want-to-play' },
  { slug: 'absolum', tag: 'want-to-play' },
  { slug: 'blasphemous', tag: 'want-to-play' },
  { slug: 'the-last-faith', tag: 'want-to-play' },
  { slug: 'darkest-dungeon', tag: 'want-to-play' },
  { slug: 'inmost', tag: 'want-to-play' },
  { slug: 'library-of-ruina', tag: 'want-to-play' },
  { slug: 'wizard-of-legend', tag: 'want-to-play' },
  { slug: 'divinity-original-sin-2', tag: 'want-to-play' },
  { slug: 'pathfinder-wrath-of-the-righteous', tag: 'want-to-play' },
  { slug: 'baldurs-gate-3', tag: 'want-to-play' },
  { slug: 'final-fantasy-10', tag: 'want-to-play' },
  { slug: 'project-octopath-traveler', tag: 'want-to-play' },
  { slug: 'warcraft-iii-reforged', tag: 'want-to-play' },
  { slug: 'dungeons-of-dreadrock', tag: 'want-to-play' },
  { slug: 'runestone-keeper', tag: 'want-to-play' },
  { slug: 'rust-bucket', tag: 'want-to-play' },
  { slug: 'fast-like-a-fox', tag: 'want-to-play' },
  { slug: 'unciv', tag: 'want-to-play' },
  { slug: 'yu-gi-oh-capsule-monster-coliseum', tag: 'want-to-play' },
];
