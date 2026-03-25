export const FIND_TYPES = [
  "movie", "book", "reel", "video", "poetry",
  "article", "music", "image", "tool", "people", "other",
] as const;

export type FindType = (typeof FIND_TYPES)[number];

export type ExpandedCard =
  | { type: "image"; src: string; caption: string; rotate?: number }
  | { type: "link"; url: string; title: string; caption: string; rotate?: number }
  | { type: "snippet"; text: string; caption: string; rotate?: number };

export interface Find {
  kind?: "find";
  id: string;
  title: string;
  type: FindType;
  note: string;
  sourceUrl?: string;
  imageUrl?: string;
  dateAdded: string;
  author?: string;
  excerpt?: string;
  coverVideoUrl?: string;
  priority?: 1 | 2 | 3;
  featured?: boolean;
  expandable?: boolean;
  sticker?: "star" | "heart" | "thumbs-up";
  expandedNote?: string;
  expandedCards?: ExpandedCard[];
  submittedBy?: string;
}

export interface FindCollection {
  kind: "collection";
  id: string;
  title: string;
  note: string;
  imageUrl?: string;
  dateAdded: string;
  priority?: 1 | 2 | 3;
  items: Find[];
}

export type FindItem = Find | FindCollection;

export const finds: Find[] = [
  {
    id: "10",
    title: "DONKS",
    type: "video",
    note: "A really fun musical animation by FelixColgrave about consumerism and greed.",
    sourceUrl: "https://youtu.be/4gvSYEqOMn8?si=zD8MH6p0Ik4K5g0m",
    imageUrl: "https://img.youtube.com/vi/4gvSYEqOMn8/mqdefault.jpg",
    dateAdded: "2026-03-24",
    author: "FelixColgrave",
    priority: 1,
  },
  {
    id: "1",
    title: "The Green Mile",
    type: "movie",
    note: "John Coffey feeling all the pain in the world and still choosing to give it love.",
    sourceUrl: "https://www.imdb.com/title/tt0120689/",
    imageUrl: "https://m.media-amazon.com/images/M/MV5BMTUxMzQyNjA5MF5BMl5BanBnXkFtZTYwOTU2NTY3._V1_.jpg",
    dateAdded: "2026-03-21",
    priority: 1,
  },
  {
    id: "2",
    title: "FIGlet",
    type: "tool",
    note: "The origin of ASCII art on the internet. Glenn Chappell built it in 1991, and by the 2000s it had 400+ community-made fonts. A little piece of internet history.",
    sourceUrl: "https://www.figlet.org/",
    imageUrl: "https://res.cloudinary.com/canonical/image/fetch/f_auto,q_auto,fl_sanitize,w_240/https%3A%2F%2Fdashboard.snapcraft.io%2Fsite_media%2Fappmedia%2F2019%2F02%2FFIG.png",
    dateAdded: "2026-03-21",
    priority: 2,
  },
  {
    id: "3",
    title: "Software is Culture",
    type: "article",
    note: "A gallery of iconic interactions from the past century that shaped how we use digital products. The art alone is worth the visit.",
    author: "Figma",
    sourceUrl: "https://www.figma.com/blog/software-is-culture/",
    imageUrl: "https://cdn.sanity.io/images/599r6htc/regionalized/96aaa8eba5993fc239a471a660a01c172f9bef7c-1920x1080.jpg?w=1200&q=70&fit=max&auto=format",
    dateAdded: "2026-03-21",
    priority: 3,
    featured: true,
    expandedNote: "This piece by Figma traces the most iconic interactions of the past century — from the first GUI to the iPhone's pinch-to-zoom. Each interaction is illustrated with gorgeous art that makes you want to linger. It's a love letter to the designers and engineers who shaped how we touch screens, click buttons, and navigate the digital world. The article argues that software isn't just a tool — it's culture, shaped by and shaping the people who use it.",
    sticker: "star",
  },
  {
    id: "4",
    title: "Icograms",
    type: "tool",
    note: "An online tool with a vast library of isometric illustrations. Very useful for creating maps and diagrams.",
    sourceUrl: "https://icograms.com/",
    imageUrl: "https://storage.icograms.com/templates/thumbnails/map-urban-rural-areas.png",
    dateAdded: "2026-03-21",
    priority: 2,
  },
  {
    id: "5",
    title: "Susan Kare",
    type: "people",
    note: 'Known as "the woman who gave Macintosh a smile", she created "Happy Mac", the Command key symbol (⌘), and the "hello" text animation you see on every new Apple product.',
    sourceUrl: "https://vimeo.com/97583369",
    imageUrl: "https://www.mac-history.net/wp-content/uploads/2022/12/Susan-Kare.jpg",
    dateAdded: "2026-03-21",
    priority: 3,
    featured: true,
    expandable: true,
    sticker: "heart",
    expandedNote: "Susan Kare is the iconographer who designed the first icons for Apple's Mac — making computers feel friendly and human. Working with Steve Jobs in the early 1980s, she created pixel-perfect icons on a 32×32 grid that became the visual language of personal computing: the Happy Mac, the paintbrush, the trash can, the command key symbol (⌘). Her presentation is a joy to watch — she walks through her process with warmth and humor. She even mentioned a book called \"Understanding Comics: The Invisible Art\" by Scott McCloud, which went straight to my read list. What strikes me most is how she proved that constraints (tiny grids, limited pixels) don't limit creativity — they focus it.",
    expandedCards: [
      {
        type: "image",
        src: "https://www.cnet.com/a/img/resize/ce8361ffff6ab6e6301e3f82454695589998c025/hub/2011/12/01/e8149075-f0ef-11e2-8c7c-d4ae52e62bcc/Smiling_computer_5x5.jpg?auto=webp&width=1200",
        caption: "Happy Mac",
        rotate: -6,
      },
      {
        type: "image",
        src: "https://i.pinimg.com/736x/46/69/d6/4669d6c2625202d4fde18a6277bf98c6.jpg",
        caption: "Original Macintosh icons",
        rotate: 4,
      },
      {
        type: "image",
        src: "https://pbs.twimg.com/media/DvrzYndXcAAgmnA.jpg",
        caption: "Solitaire game",
        rotate: -3,
      },
      {
        type: "link",
        url: "https://en.wikipedia.org/wiki/Susan_Kare",
        title: "Wikipedia",
        caption: "Susan Kare on Wikipedia",
        rotate: 2,
      },
      {
        type: "link",
        url: "https://vimeo.com/97583369",
        title: "Vimeo Talk",
        caption: "Her EG8 presentation",
        rotate: -4,
      },
    ],
  },
  {
    id: "6",
    title: "How AI Slop Will Spark the Next Human Renaissance",
    type: "video",
    note: "The idea that AI slop will eventually push people back toward real experiences and human craft. Not anti-AI, just pro-human.",
    author: "After Skool",
    sourceUrl: "https://www.youtube.com/watch?v=0iT9HbaRwfM",
    imageUrl: "https://img.youtube.com/vi/0iT9HbaRwfM/hqdefault.jpg",
    dateAdded: "2026-03-22",
    priority: 2,
  },
  {
    id: "7",
    title: "Product Management on the AI Exponential",
    type: "article",
    note: "The role of PM is dissolving into a shared responsibility between PM, design, and dev. In the AI era, everyone prototypes, everyone ships, and the lines blur in the best way.",
    author: "Cat Wu",
    sourceUrl: "https://claude.com/blog/product-management-on-the-ai-exponential",
    imageUrl: "https://cdn.prod.website-files.com/68a44d4040f98a4adf2207b6/69bc786ee19c0641392b77ad_og_product-management-on-the-ai-exponential.jpg",
    dateAdded: "2026-03-22",
    priority: 3,
  },
  {
    id: "8",
    title: "Interstellar",
    type: "movie",
    note: "The docking scene still gives me chills. A film about love disguised as sci-fi.",
    sourceUrl: "https://www.imdb.com/title/tt0816692/",
    imageUrl: "https://m.media-amazon.com/images/M/MV5BYzdjMDAxZGItMjI2My00ODA1LTlkNzItOWFjMDU5ZDJlYWY3XkEyXkFqcGc@._V1_.jpg",
    dateAdded: "2026-03-22",
    priority: 2,
  },
  {
    id: "9",
    title: "The Shawshank Redemption",
    type: "movie",
    note: "Hope is a dangerous thing. Hope can set you free.",
    sourceUrl: "https://www.imdb.com/title/tt0111161/",
    imageUrl: "https://m.media-amazon.com/images/M/MV5BMDAyY2FhYjctNDc5OS00MDNlLThiMGUtY2UxYWVkNGY2ZjljXkEyXkFqcGc@._V1_.jpg",
    dateAdded: "2026-03-22",
    priority: 1,
  },
];

export const collections: FindCollection[] = [
  {
    kind: "collection",
    id: "collection-gary-hustwit",
    title: "Gary Hustwit",
    note: "Four design documentaries — from typography to industrial design to urban planning.",
    dateAdded: "2026-03-23",
    priority: 2,
    imageUrl: "https://www.idsa.org/wp-content/uploads/2023/01/GaryHustwit-Headshot-POST.jpg",
    items: [
      {
        id: "gh-helvetica",
        title: "Helvetica",
        type: "movie",
        note: "A documentary about typography, graphic design, and global visual culture. It explores the proliferation of one typeface as part of a larger conversation about the way type affects our lives.",
        sourceUrl: "https://www.imdb.com/title/tt0847817/",
        imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7rCyagaHz8qyKOgOR20X6ijqcIJUtRiddVD-mb-8I4IwQ-kTyLfoSvjea7fr88Q2blk2-gg&s=10",
        dateAdded: "2026-03-23",
      },
      {
        id: "gh-objectified",
        title: "Objectified",
        type: "movie",
        note: "A look at the creativity behind everything from toothbrushes to tech gadgets. Features Dieter Rams, Jony Ive, and the designers who shape the objects we use every day.",
        sourceUrl: "https://www.imdb.com/title/tt1241325/",
        imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8_LjPFDABch-2yn6NP2H2xAqYN8VXWpSKaJUtYc3ylFmkuRICAju2g8RoShqKEB67o9LE2w&s=10",
        dateAdded: "2026-03-23",
      },
      {
        id: "gh-urbanized",
        title: "Urbanized",
        type: "movie",
        note: "The design of cities and the forces that shape them. From the High Line in New York to the favelas of São Paulo.",
        sourceUrl: "https://www.imdb.com/title/tt1701976/",
        imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSO1bg_Z8aXyOWxFwD4WIK_GTSqpjRWh_QDGBQ5j7OSfh4zxqhhyTbCIgPyNasgOaV5ADfgIA&s=10",
        dateAdded: "2026-03-23",
      },
      {
        id: "gh-rams",
        title: "Rams",
        type: "movie",
        note: "A portrait of Dieter Rams, the legendary designer behind Braun and a huge influence on Apple. Less but better.",
        sourceUrl: "https://www.imdb.com/title/tt8091002/",
        imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6-b_MMCh1R8JpAzWAvDXXqImSy3whMAopXRUJZQROOxMgPRiMx-RJw_btXYRfidMlymdxoQ&s=10",
        dateAdded: "2026-03-23",
      },
    ],
  },
];
