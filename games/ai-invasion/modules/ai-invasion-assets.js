// Word object template //

class Word {
  constructor(
    word,
    definition,
    isReal,
    getRandomXCoordinate,
    getRandomYCoordinate
  ) {
    // May need to play around with the 100 value here so that
    // words don't spill off the board.
    getRandomXCoordinate = () => Math.floor(Math.random() * 60) + 1;
    getRandomYCoordinate = () => Math.floor(Math.random() * 95) + 1;
    this.word = word;
    this.definition = definition;
    this.isReal = isReal;
    this.pointsScore = this.word.length;
    this.XPosition = getRandomXCoordinate() + "%";
    this.YPosition = getRandomYCoordinate() + "%";
  }

  get giveOverview() {
    if (this.isReal === true) {
      return `${this.word}. Real word. Definition: ${this.definition}.`;
    } else if (this.isReal === false) {
      return `${this.word}. Fake word. Definition: ${this.definition}.`;
    } else {
      return 'This word has an invalid "isReal" value. Please send a strongly-worded email to david.wildman@nology.io.';
    }
  }

  get renderWord() {
    console.log("Word rendered");
    return `<span data-points-score='${this.pointsScore}' data-definition='${this.definition}' data-is-real='${this.isReal}'style='top:${this.YPosition};left:${this.XPosition};' class='${this.word}' >${this.word}</span>`;
  }
}

// Fake Word object template //

class FakeWord extends Word {
  constructor(word, definition) {
    super(word, definition, false);
  }
}

// Real Word object template //

class RealWord extends Word {
  constructor(word, definition) {
    super(word, definition, true);
  }
}

/*----------- GLOBAL OBJECTS ----------*/

// Fake words //

const fakeWord1 = new FakeWord(
  "covfefe",
  "noun. widespread negative media coverage."
);
const fakeWord2 = new FakeWord("carnacé", "noun. a leather shoe or shoelace.");
const fakeWord3 = new FakeWord(
  "nonindicating",
  "adjective. not officially attesting to an opinion or statement."
);
const fakeWord4 = new FakeWord(
  "wreatheness",
  "noun. a quality or fact that is the product of time, often thought of as heritable."
);
const fakeWord5 = new FakeWord(
  "conturbulent",
  "noun. (of speech, writing, or writing styles) shaped into straight lines."
);
const fakeWord6 = new FakeWord(
  "spadazone",
  "noun. a synthetic compound of amygdalin that is one of the chief active constituents of theophylline"
);
const fakeWord7 = new FakeWord(
  "triscule",
  "adjective. small or barely visible"
);
const fakeWord8 = new FakeWord("poandie", "noun. an angry, aggressive person");
const fakeWord9 = new FakeWord(
  "teruur",
  "noun. a native or inhabitant of the former Spanish kingdom of Veracruz"
);
const fakeWord10 = new FakeWord(
  "decalcop",
  "a small structure in a thorax of leaflets"
);

// Real words //

const realWord1 = new RealWord("octothorpe", 'noun. the "hashtag" symbol.');
const realWord2 = new RealWord("agelast", "noun. a person who never laughs.");
const realWord3 = new RealWord("peristeronic", "of or relating to pigeons");
const realWord4 = new RealWord("biblioklept", "noun. one who steals books.");
const realWord5 = new RealWord(
  "acnestis",
  "noun. the part of the back which an animal cannot reach to scratch."
);
const realWord6 = new RealWord(
  "hircine",
  "ajective. of, relating to, or suggestive of a goat."
);
const realWord7 = new RealWord("tumescent", "adjective. somewhat swollen.");
const realWord8 = new RealWord(
  "dissimulate",
  "verb. to hide under a false appearance"
);
const realWord9 = new RealWord(
  "sententious",
  "adjective. given to or abounding in excessive moralizing."
);
const realWord10 = new RealWord(
  "chimerical",
  "adjective. existing only as the product of unchecked imagination"
);

const coreGameAssetsBackup = [
  fakeWord1,
  fakeWord2,
  fakeWord3,
  fakeWord4,
  fakeWord5,
  fakeWord6,
  fakeWord7,
  fakeWord8,
  fakeWord9,
  fakeWord10,
  realWord1,
  realWord2,
  realWord3,
  realWord4,
  realWord5,
  realWord6,
  realWord7,
  realWord8,
  realWord9,
  realWord10,
];

coreGameAssetsBackup;

export const coreGameAssets = [
  {
    word: "HODL",
    isReal: true,
    points: 10,
    definition: "Hold On for Dear Life",
  },
  {
    word: "FOMO",
    isReal: false,
    points: 15,
    definition: "Frequently Overlooking Market Opportunities",
  },
  {
    word: "WHALE",
    isReal: true,
    points: 10,
    definition: "A person who owns a large amount of cryptocurrency",
  },
  {
    word: "DEFI",
    isReal: true,
    points: 10,
    definition: "Decentralized Finance",
  },
  {
    word: "SHILL",
    isReal: true,
    points: 10,
    definition: "Promoting a coin for personal gain",
  },
];

export const wordsArray = [
  {
    word: "BAGHOLDER",
    isReal: true,
    points: 10,
    definition: "Stuck with worthless tokens",
  },
  {
    word: "APEING",
    isReal: true,
    points: 10,
    definition: "Invest without research",
  },
  {
    word: "BTD",
    isReal: true,
    points: 10,
    definition: "Buy The Dip",
  },
  {
    word: "CEX",
    isReal: true,
    points: 10,
    definition: "Centralized Exchange",
  },
  {
    word: "DEX",
    isReal: false,
    points: 15,
    definition: "Dog Exchange",
  },
  {
    word: "REKT",
    isReal: true,
    points: 10,
    definition: "Suffering heavy financial losses",
  },
  {
    word: "WAGMI",
    isReal: false,
    points: 15,
    definition: "We All Go Make Income",
  },
  {
    word: "NGMI",
    isReal: true,
    points: 10,
    definition: "Not Gonna Make It",
  },
  {
    word: "DEGEN",
    isReal: true,
    points: 10,
    definition: "A highly speculative investor",
  },
  {
    word: "ATH",
    isReal: false,
    points: 15,
    definition: "Always Trade High",
  },
  {
    word: "ICO",
    isReal: true,
    points: 10,
    definition: "Initial Coin Offering",
  },
  {
    word: "IDO",
    isReal: false,
    points: 15,
    definition: "Initial Dog Offering",
  },
  {
    word: "BEAR",
    isReal: true,
    points: 10,
    definition: "When prices are falling",
  },
  {
    word: "BULL",
    isReal: false,
    points: 15,
    definition: "A market dominated by cows",
  },
  {
    word: "BLUE CHIP",
    isReal: false,
    points: 15,
    definition: "A poker chip color",
  },
  {
    word: "MARKET CAP",
    isReal: true,
    points: 10,
    definition: "The total value of an asset",
  },
  {
    word: "SHORT",
    isReal: true,
    points: 10,
    definition: "Selling before buying",
  },
  {
    word: "LEVERAGE",
    isReal: true,
    points: 10,
    definition: "Borrowing funds to increase exposure",
  },
  {
    word: "PUMP",
    isReal: true,
    points: 10,
    definition: "Raising prices artificially, then selling",
  },
  {
    word: "STOP LOSS",
    isReal: true,
    points: 10,
    definition: "A price level to limit losses",
  },
  {
    word: "YIELD",
    isReal: false,
    points: 15,
    definition: "Growing crops for extra crypto",
  },
  {
    word: "DAY TRADE",
    isReal: true,
    points: 10,
    definition: "Buying and selling within a day",
  },
  {
    word: "MARGIN",
    isReal: false,
    points: 15,
    definition: "A reminder to buy more stocks",
  },
  {
    word: "ARBITRAGE",
    isReal: true,
    points: 10,
    definition: "Profiting from price differences",
  },
  {
    word: "SCALP",
    isReal: true,
    points: 10,
    definition: "Making quick, small profits",
  },
  {
    word: "OVERBOUGHT",
    isReal: true,
    points: 10,
    definition: "When an asset is purchased too much",
  },
  {
    word: "UNDERWATER",
    isReal: true,
    points: 10,
    definition: "When an investment is worth less than paid",
  },
  {
    word: "DEAD CAT",
    isReal: true,
    points: 10,
    definition: "A fake recovery before further drop",
  },
  {
    word: "PONZI",
    isReal: false,
    points: 15,
    definition: "A legal investment strategy",
  },
  {
    word: "ETF",
    isReal: false,
    points: 15,
    definition: "Extra Tasty Finance",
  },
  {
    word: "KYC",
    isReal: false,
    points: 15,
    definition: "Keep Your Coins",
  },
  {
    word: "DYOR",
    isReal: false,
    points: 15,
    definition: "Dance Your Own Routine",
  },
  {
    word: "P2P",
    isReal: false,
    points: 15,
    definition: "Pizza to Pineapple",
  },
  {
    word: "ROI",
    isReal: false,
    points: 15,
    definition: "Resting On Island",
  },
  {
    word: "AML",
    isReal: false,
    points: 15,
    definition: "Always Making Losses",
  },
  {
    word: "TVL",
    isReal: false,
    points: 15,
    definition: "Too Vast Losses",
  },
  {
    word: "DAO",
    isReal: false,
    points: 15,
    definition: "Donuts And Oranges",
  },
  {
    word: "POS",
    isReal: false,
    points: 15,
    definition: "Pile of Sausages",
  },
  {
    word: "POW",
    isReal: false,
    points: 15,
    definition: "Power Of Wizards",
  },
  {
    word: "KOL",
    isReal: false,
    points: 15,
    definition: "King of Llamas",
  },
  {
    word: "SAFU",
    isReal: false,
    points: 15,
    definition: "Stay Away From Unicorns",
  },
  {
    word: "BSC",
    isReal: false,
    points: 15,
    definition: "Big Spicy Chicken",
  },
  {
    word: "LFG",
    isReal: false,
    points: 15,
    definition: "Let's Find Gold",
  },
];

// for ( let i = 0; i < coreGameAssets.length; i ++) {

// })

// Sum
// wordsArray.length > 0; i = Math.round(wordsArray.length * Math.random()))
