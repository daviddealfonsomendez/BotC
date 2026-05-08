export type RoleType = 'townsfolk' | 'outsider' | 'minion' | 'demon' | 'traveler' | 'fabled';
export type EditionType = 'trouble_brewing' | 'bad_moon_rising' | 'sects_and_violets' | 'experimental' | 'traveler' | 'fabled' | 'custom';

export interface Role {
  id: string;
  name: string;
  type: RoleType;
  ability: string;
  edition: EditionType;
  countAs?: number; 
}

export const ALL_ROLES: Role[] = [
  // TROUBLE BREWING
  { id: 'washerwoman', name: 'Washerwoman', type: 'townsfolk', edition: 'trouble_brewing', ability: 'Learn a Townsfolk role and 2 players, one is that role.' },
  { id: 'librarian', name: 'Librarian', type: 'townsfolk', edition: 'trouble_brewing', ability: 'Learn an Outsider role and 2 players, one is that role.' },
  { id: 'investigator', name: 'Investigator', type: 'townsfolk', edition: 'trouble_brewing', ability: 'Learn a Minion role and 2 players, one is that role.' },
  { id: 'chef', name: 'Chef', type: 'townsfolk', edition: 'trouble_brewing', ability: 'Learn how many pairs of evil players are sitting next to each other.' },
  { id: 'empath', name: 'Empath', type: 'townsfolk', edition: 'trouble_brewing', ability: 'Learn how many of your 2 alive neighbors are evil.' },
  { id: 'fortune-teller', name: 'Fortune Teller', type: 'townsfolk', edition: 'trouble_brewing', ability: 'Each night, choose 2 players: learn if either is a Demon. There is one red herring.' },
  { id: 'undertaker', name: 'Undertaker', type: 'townsfolk', edition: 'trouble_brewing', ability: 'Each night*, if a player was executed today, learn their role.' },
  { id: 'monk', name: 'Monk', type: 'townsfolk', edition: 'trouble_brewing', ability: 'Each night*, choose a player (not yourself): they are safe from the Demon tonight.' },
  { id: 'ravenkeeper', name: 'Ravenkeeper', type: 'townsfolk', edition: 'trouble_brewing', ability: 'If you die at night, you are woken to choose a player: learn their role.' },
  { id: 'slayer', name: 'Slayer', type: 'townsfolk', edition: 'trouble_brewing', ability: 'Once per game, during the day, publicly choose a player: if they are the Demon, they die.' },
  { id: 'soldier', name: 'Soldier', type: 'townsfolk', edition: 'trouble_brewing', ability: 'You are safe from the Demon.' },
  { id: 'mayor', name: 'Mayor', type: 'townsfolk', edition: 'trouble_brewing', ability: 'If only 3 players are alive and no one is executed, your team wins. If you die at night, another player might die instead.' },
  { id: 'virgin', name: 'Virgin', type: 'townsfolk', edition: 'trouble_brewing', ability: 'The first time you are nominated, if the nominator is a Townsfolk, they are executed.' },
  { id: 'butler', name: 'Butler', type: 'outsider', edition: 'trouble_brewing', ability: 'Each night, choose a player: tomorrow you may only vote if they are voting.' },
  { id: 'drunk', name: 'Drunk', type: 'outsider', edition: 'trouble_brewing', ability: 'You think you are a Townsfolk character, but your ability does not work.' },
  { id: 'saint', name: 'Saint', type: 'outsider', edition: 'trouble_brewing', ability: 'If you are executed, your team loses.' },
  { id: 'recluse', name: 'Recluse', type: 'outsider', edition: 'trouble_brewing', ability: 'You might register as evil & as a Minion or Demon, even if dead.' },
  { id: 'poisoner', name: 'Poisoner', type: 'minion', edition: 'trouble_brewing', ability: 'Each night, choose a player: they are poisoned tonight and tomorrow day.' },
  { id: 'spy', name: 'Spy', type: 'minion', edition: 'trouble_brewing', ability: 'Each night, you see the Grimoire. You might register as good & as a Townsfolk or Outsider.' },
  { id: 'baron', name: 'Baron', type: 'minion', edition: 'trouble_brewing', ability: 'There are extra Outsiders in play.' },
  { id: 'scarlet-woman', name: 'Scarlet Woman', type: 'minion', edition: 'trouble_brewing', ability: 'If 5 or more players alive and the Demon dies, you become the Demon.' },
  { id: 'imp', name: 'Imp', type: 'demon', edition: 'trouble_brewing', ability: 'Each night*, choose a player: they die. If you kill yourself, a Minion becomes the Imp.' },

  // BAD MOON RISING
  { id: 'grandmother', name: 'Grandmother', type: 'townsfolk', edition: 'bad_moon_rising', ability: 'You start knowing a good player & their role. If the Demon kills them, you die too.' },
  { id: 'sailor', name: 'Sailor', type: 'townsfolk', edition: 'bad_moon_rising', ability: 'Each night, choose a player: either you or they are drunk until dusk.' },
  { id: 'chambermaid', name: 'Chambermaid', type: 'townsfolk', edition: 'bad_moon_rising', ability: 'Each night, choose 2 players: learn how many woke tonight due to their ability.' },
  { id: 'exorcist', name: 'Exorcist', type: 'townsfolk', edition: 'bad_moon_rising', ability: 'Each night*, choose a player: if they are the Demon, they learn who you are & don\'t wake tonight.' },
  { id: 'innkeeper', name: 'Innkeeper', type: 'townsfolk', edition: 'bad_moon_rising', ability: 'Each night*, choose 2 players: they are safe from the Demon tonight, but 1 is drunk.' },
  { id: 'gambler', name: 'Gambler', type: 'townsfolk', edition: 'bad_moon_rising', ability: 'Each night*, choose a player & guess their role: if you are wrong, you die.' },
  { id: 'gossip', name: 'Gossip', type: 'townsfolk', edition: 'bad_moon_rising', ability: 'Each day, you may make a public statement. Tonight, if it was true, a player dies.' },
  { id: 'courtier', name: 'Courtier', type: 'townsfolk', edition: 'bad_moon_rising', ability: 'Once per game, at night, choose a role: they are drunk for 3 nights & 3 days.' },
  { id: 'professor', name: 'Professor', type: 'townsfolk', edition: 'bad_moon_rising', ability: 'Once per game, at night*, choose a dead Townsfolk: they are resurrected.' },
  { id: 'minstrel', name: 'Minstrel', type: 'townsfolk', edition: 'bad_moon_rising', ability: 'When a Minion dies by execution, all other players (not you) are drunk until dusk tomorrow.' },
  { id: 'tea-lady', name: 'Tea Lady', type: 'townsfolk', edition: 'bad_moon_rising', ability: 'If both your alive neighbors are good, they can\'t die.' },
  { id: 'fool', name: 'Fool', type: 'townsfolk', edition: 'bad_moon_rising', ability: 'The first time you die, you don\'t.' },
  { id: 'pacifist', name: 'Pacifist', type: 'townsfolk', edition: 'bad_moon_rising', ability: 'Executed good players might not die.' },
  { id: 'goon', name: 'Goon', type: 'outsider', edition: 'bad_moon_rising', ability: 'Each night, the first player to choose you is drunk until dusk. You become their alignment.' },
  { id: 'lunatic', name: 'Lunatic', type: 'outsider', edition: 'bad_moon_rising', ability: 'You think you are the Demon, but you are not.' },
  { id: 'tinker', name: 'Tinker', type: 'outsider', edition: 'bad_moon_rising', ability: 'You might die at any time.' },
  { id: 'moonchild', name: 'Moonchild', type: 'outsider', edition: 'bad_moon_rising', ability: 'When you learn you died, choose a player: they might die tonight.' },
  { id: 'godfather', name: 'Godfather', type: 'minion', edition: 'bad_moon_rising', ability: 'You start knowing which Outsiders are in play. If one dies by execution, you kill tonight.' },
  { id: 'devils-advocate', name: 'Devil\'s Advocate', type: 'minion', edition: 'bad_moon_rising', ability: 'Each night, choose a player: if they are executed tomorrow, they don\'t die.' },
  { id: 'assassin', name: 'Assassin', type: 'minion', edition: 'bad_moon_rising', ability: 'Once per game, at night*, choose a player: they die even if they are protected.' },
  { id: 'mastermind', name: 'Mastermind', type: 'minion', edition: 'bad_moon_rising', ability: 'If the Demon dies by execution, the game continues for 1 more day. If no one dies tomorrow, evil wins.' },
  { id: 'zombuul', name: 'Zombuul', type: 'demon', edition: 'bad_moon_rising', ability: 'Each night*, choose a player: they die. If you die, you still appear alive & can kill (each night if no one died today).' },
  { id: 'pukka', name: 'Pukka', type: 'demon', edition: 'bad_moon_rising', ability: 'Each night, choose a player: they are poisoned. The previously poisoned player dies.' },
  { id: 'shabaloth', name: 'Shabaloth', type: 'demon', edition: 'bad_moon_rising', ability: 'Each night*, choose 2 players: they die. A dead player you ate might be resurrected tonight.' },
  { id: 'po', name: 'Po', type: 'demon', edition: 'bad_moon_rising', ability: 'Each night*, choose 1 player: they die. If you chose no one last night, choose 3 tonight.' },

  // SECTS AND VIOLETS
  { id: 'clockmaker', name: 'Clockmaker', type: 'townsfolk', edition: 'sects_and_violets', ability: 'You start knowing how many steps from the Demon the nearest Minion is.' },
  { id: 'dreamer', name: 'Dreamer', type: 'townsfolk', edition: 'sects_and_violets', ability: 'Each night, choose a player (not yourself or the Demon): learn 1 good & 1 evil role, one is theirs.' },
  { id: 'snake-charmer', name: 'Snake Charmer', type: 'townsfolk', edition: 'sects_and_violets', ability: 'Each night, choose a player: if they are the Demon, you become the Demon and they become a poisoned Snake Charmer.' },
  { id: 'mathematician', name: 'Mathematician', type: 'townsfolk', edition: 'sects_and_violets', ability: 'Each night, learn how many abilities worked abnormally tonight due to other roles.' },
  { id: 'flowergirl', name: 'Flowergirl', type: 'townsfolk', edition: 'sects_and_violets', ability: 'Each night*, learn if the Demon voted today.' },
  { id: 'town-crier', name: 'Town Crier', type: 'townsfolk', edition: 'sects_and_violets', ability: 'Each night*, learn if a Minion nominated today.' },
  { id: 'oracle', name: 'Oracle', type: 'townsfolk', edition: 'sects_and_violets', ability: 'Each night*, learn how many dead players are evil.' },
  { id: 'savant', name: 'Savant', type: 'townsfolk', edition: 'sects_and_violets', ability: 'Each day, visit the Storyteller to learn 2 statements: 1 is true & 1 is false.' },
  { id: 'seamstress', name: 'Seamstress', type: 'townsfolk', edition: 'sects_and_violets', ability: 'Once per game, at night, choose 2 players: learn if they are the same alignment.' },
  { id: 'philosopher', name: 'Philosopher', type: 'townsfolk', edition: 'sects_and_violets', ability: 'Once per game, at night, choose a good character: you gain their ability. If in play, they are drunk.' },
  { id: 'artist', name: 'Artist', type: 'townsfolk', edition: 'sects_and_violets', ability: 'Once per game, during the day, ask the Storyteller any "Yes/No" question.' },
  { id: 'juggler', name: 'Juggler', type: 'townsfolk', edition: 'sects_and_violets', ability: 'On your first day, publicly guess up to 5 players\' roles. Tonight, learn how many you got right.' },
  { id: 'sage', name: 'Sage', type: 'townsfolk', edition: 'sects_and_violets', ability: 'If the Demon kills you, you learn which of 2 players is the Demon.' },
  { id: 'mutant', name: 'Mutant', type: 'outsider', edition: 'sects_and_violets', ability: 'If you are "mad" about being an Outsider, you might be executed.' },
  { id: 'sweetheart', name: 'Sweetheart', type: 'outsider', edition: 'sects_and_violets', ability: 'When you die, a player becomes drunk from now on.' },
  { id: 'barber', name: 'Barber', type: 'outsider', edition: 'sects_and_violets', ability: 'If you die, the Demon may choose 2 players (not themselves) to swap characters.' },
  { id: 'klutz', name: 'Klutz', type: 'outsider', edition: 'sects_and_violets', ability: 'When you learn you died, publicly choose a player: if they are evil, your team loses.' },
  { id: 'evil-twin', name: 'Evil Twin', type: 'minion', edition: 'sects_and_violets', ability: 'You start knowing a good player & they know you. Only 1 can be alive for your team to win.' },
  { id: 'witch', name: 'Witch', type: 'minion', edition: 'sects_and_violets', ability: 'Each night, choose a player: if they nominate tomorrow, they die.' },
  { id: 'cerenovus', name: 'Cerenovus', type: 'minion', edition: 'sects_and_violets', ability: 'Each night, choose a player & a role: they are "mad" they are that role tomorrow or might be executed.' },
  { id: 'pit-hag', name: 'Pit-Hag', type: 'minion', edition: 'sects_and_violets', ability: 'Each night*, choose a player & a role: they become that role. If they were the Demon, a new Demon is made.' },
  { id: 'fang-gu', name: 'Fang Gu', type: 'demon', edition: 'sects_and_violets', ability: 'Each night*, choose a player: they die. The first Outsider you kill instead becomes an evil Fang Gu & you die.' },
  { id: 'vigormortis', name: 'Vigormortis', type: 'demon', edition: 'sects_and_violets', ability: 'Each night*, choose a player: they die. Minions you kill keep their ability & poison a neighbor.' },
  { id: 'no-dashii', name: 'No Dashii', type: 'demon', edition: 'sects_and_violets', ability: 'Each night*, choose a player: they die. Your 2 Townfolk neighbors are poisoned.' },
  { id: 'vortox', name: 'Vortox', type: 'demon', edition: 'sects_and_violets', ability: 'Each night*, choose a player: they die. All Townfolk abilities yield false info. If no one is executed, evil wins.' },

  // TRAVELERS
  { id: 'gunslinger', name: 'Gunslinger', type: 'traveler', edition: 'traveler', ability: 'Each day, after the 1st nomination, you may choose a player: they die.' },
  { id: 'beggar', name: 'Beggar', type: 'traveler', edition: 'traveler', ability: 'You must use a vote token to vote. If you have none, a good player may give you theirs.' },
  { id: 'thief', name: 'Thief', type: 'traveler', edition: 'traveler', ability: 'Each night, choose a player: their vote counts as negative tomorrow.' },
  { id: 'bureaucrat', name: 'Bureaucrat', type: 'traveler', edition: 'traveler', ability: 'Each night, choose a player: their vote counts as 3 tomorrow.' },
  { id: 'scapegoat', name: 'Scapegoat', type: 'traveler', edition: 'traveler', ability: 'If a player of your alignment is executed, you might die instead.' },

  // FABLED
  { id: 'doomsday', name: 'Doomsday', type: 'fabled', edition: 'fabled', ability: 'If 4 or more players die in one day-night cycle, evil wins.' },
  { id: 'angel', name: 'Angel', type: 'fabled', edition: 'fabled', ability: 'Something good happens if you are nice.' },
  { id: 'hells-librarian', name: 'Hell\'s Librarian', type: 'fabled', edition: 'fabled', ability: 'Something bad happens if you talk during the night.' },
];
