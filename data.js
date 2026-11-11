/* Pokédex Pros — trivia data. All facts are in-world: species, types, evolutions, places, people and legends. */
(function (g) {
  "use strict";

  const TYPES = ["Normal", "Fire", "Water", "Electric", "Grass", "Ice", "Fighting", "Poison", "Ground",
    "Flying", "Psychic", "Bug", "Rock", "Ghost", "Dragon", "Dark", "Steel", "Fairy"];

  const TYPE_COLORS = {
    Normal: "#A8A77A", Fire: "#EE8130", Water: "#6390F0", Electric: "#F7D02C", Grass: "#7AC74C", Ice: "#96D9D6",
    Fighting: "#C22E28", Poison: "#A33EA1", Ground: "#E2BF65", Flying: "#A98FF3", Psychic: "#F95587", Bug: "#A6B91A",
    Rock: "#B6A136", Ghost: "#735797", Dragon: "#6F35FC", Dark: "#705746", Steel: "#B7B7CE", Fairy: "#D685AD"
  };

  // Attacking type -> [super effective against], [not very effective against], [no effect on]
  const CHART = {
    Normal: [[], ["Rock", "Steel"], ["Ghost"]],
    Fire: [["Grass", "Ice", "Bug", "Steel"], ["Fire", "Water", "Rock", "Dragon"], []],
    Water: [["Fire", "Ground", "Rock"], ["Water", "Grass", "Dragon"], []],
    Electric: [["Water", "Flying"], ["Electric", "Grass", "Dragon"], ["Ground"]],
    Grass: [["Water", "Ground", "Rock"], ["Fire", "Grass", "Poison", "Flying", "Bug", "Dragon", "Steel"], []],
    Ice: [["Grass", "Ground", "Flying", "Dragon"], ["Fire", "Water", "Ice", "Steel"], []],
    Fighting: [["Normal", "Ice", "Rock", "Dark", "Steel"], ["Poison", "Flying", "Psychic", "Bug", "Fairy"], ["Ghost"]],
    Poison: [["Grass", "Fairy"], ["Poison", "Ground", "Rock", "Ghost"], ["Steel"]],
    Ground: [["Fire", "Electric", "Poison", "Rock", "Steel"], ["Grass", "Bug"], ["Flying"]],
    Flying: [["Grass", "Fighting", "Bug"], ["Electric", "Rock", "Steel"], []],
    Psychic: [["Fighting", "Poison"], ["Psychic", "Steel"], ["Dark"]],
    Bug: [["Grass", "Psychic", "Dark"], ["Fire", "Fighting", "Poison", "Flying", "Ghost", "Steel", "Fairy"], []],
    Rock: [["Fire", "Ice", "Flying", "Bug"], ["Fighting", "Ground", "Steel"], []],
    Ghost: [["Psychic", "Ghost"], ["Dark"], ["Normal"]],
    Dragon: [["Dragon"], ["Steel"], ["Fairy"]],
    Dark: [["Psychic", "Ghost"], ["Fighting", "Dark", "Fairy"], []],
    Steel: [["Ice", "Rock", "Fairy"], ["Fire", "Water", "Electric", "Steel"], []],
    Fairy: [["Fighting", "Dragon", "Dark"], ["Fire", "Poison", "Steel"], []]
  };

  const REGIONS = ["Kanto", "Johto", "Hoenn", "Sinnoh", "Unova", "Kalos", "Alola", "Galar", "Paldea"];
  const GEN_END = [151, 251, 386, 493, 649, 721, 809, 905, 9999];

  // number|name|types|category (the "___ Pokémon")|evolves from|how (L16 = reaching level 16)
  const MONS = `
1|Bulbasaur|Grass/Poison|Seed||
2|Ivysaur|Grass/Poison|Seed|Bulbasaur|L16
3|Venusaur|Grass/Poison|Seed|Ivysaur|L32
4|Charmander|Fire|Lizard||
5|Charmeleon|Fire|Flame|Charmander|L16
6|Charizard|Fire/Flying|Flame|Charmeleon|L36
7|Squirtle|Water|Tiny Turtle||
8|Wartortle|Water|Turtle|Squirtle|L16
9|Blastoise|Water|Shellfish|Wartortle|L36
10|Caterpie|Bug|Worm||
11|Metapod|Bug|Cocoon|Caterpie|L7
12|Butterfree|Bug/Flying|Butterfly|Metapod|L10
13|Weedle|Bug/Poison|Hairy Bug||
14|Kakuna|Bug/Poison|Cocoon|Weedle|L7
15|Beedrill|Bug/Poison|Poison Bee|Kakuna|L10
16|Pidgey|Normal/Flying|Tiny Bird||
17|Pidgeotto|Normal/Flying|Bird|Pidgey|L18
18|Pidgeot|Normal/Flying|Bird|Pidgeotto|L36
19|Rattata|Normal|Mouse||
20|Raticate|Normal|Mouse|Rattata|L20
21|Spearow|Normal/Flying|Tiny Bird||
22|Fearow|Normal/Flying|Beak|Spearow|L20
23|Ekans|Poison|Snake||
24|Arbok|Poison|Cobra|Ekans|L22
25|Pikachu|Electric|Mouse|Pichu|High friendship
26|Raichu|Electric|Mouse|Pikachu|Using a Thunder Stone
27|Sandshrew|Ground|Mouse||
28|Sandslash|Ground|Mouse|Sandshrew|L22
29|Nidoran♀|Poison|Poison Pin||
30|Nidorina|Poison|Poison Pin|Nidoran♀|L16
31|Nidoqueen|Poison/Ground|Drill|Nidorina|Using a Moon Stone
32|Nidoran♂|Poison|Poison Pin||
33|Nidorino|Poison|Poison Pin|Nidoran♂|L16
34|Nidoking|Poison/Ground|Drill|Nidorino|Using a Moon Stone
35|Clefairy|Fairy|Fairy||
36|Clefable|Fairy|Fairy|Clefairy|Using a Moon Stone
37|Vulpix|Fire|Fox||
38|Ninetales|Fire|Fox|Vulpix|Using a Fire Stone
39|Jigglypuff|Normal/Fairy|Balloon||
40|Wigglytuff|Normal/Fairy|Balloon|Jigglypuff|Using a Moon Stone
41|Zubat|Poison/Flying|Bat||
42|Golbat|Poison/Flying|Bat|Zubat|L22
43|Oddish|Grass/Poison|Weed||
44|Gloom|Grass/Poison|Weed|Oddish|L21
45|Vileplume|Grass/Poison|Flower|Gloom|Using a Leaf Stone
46|Paras|Bug/Grass|Mushroom||
47|Parasect|Bug/Grass|Mushroom|Paras|L24
48|Venonat|Bug/Poison|Insect||
49|Venomoth|Bug/Poison|Poison Moth|Venonat|L31
50|Diglett|Ground|Mole||
51|Dugtrio|Ground|Mole|Diglett|L26
52|Meowth|Normal|Scratch Cat||
53|Persian|Normal|Classy Cat|Meowth|L28
54|Psyduck|Water|Duck||
55|Golduck|Water|Duck|Psyduck|L33
56|Mankey|Fighting|Pig Monkey||
57|Primeape|Fighting|Pig Monkey|Mankey|L28
58|Growlithe|Fire|Puppy||
59|Arcanine|Fire|Legendary|Growlithe|Using a Fire Stone
60|Poliwag|Water|Tadpole||
61|Poliwhirl|Water|Tadpole|Poliwag|L25
62|Poliwrath|Water/Fighting|Tadpole|Poliwhirl|Using a Water Stone
63|Abra|Psychic|Psi||
64|Kadabra|Psychic|Psi|Abra|L16
65|Alakazam|Psychic|Psi|Kadabra|Being traded
66|Machop|Fighting|Superpower||
67|Machoke|Fighting|Superpower|Machop|L28
68|Machamp|Fighting|Superpower|Machoke|Being traded
69|Bellsprout|Grass/Poison|Flower||
70|Weepinbell|Grass/Poison|Flycatcher|Bellsprout|L21
71|Victreebel|Grass/Poison|Flycatcher|Weepinbell|Using a Leaf Stone
72|Tentacool|Water/Poison|Jellyfish||
73|Tentacruel|Water/Poison|Jellyfish|Tentacool|L30
74|Geodude|Rock/Ground|Rock||
75|Graveler|Rock/Ground|Rock|Geodude|L25
76|Golem|Rock/Ground|Megaton|Graveler|Being traded
77|Ponyta|Fire|Fire Horse||
78|Rapidash|Fire|Fire Horse|Ponyta|L40
79|Slowpoke|Water/Psychic|Dopey||
80|Slowbro|Water/Psychic|Hermit Crab|Slowpoke|L37
81|Magnemite|Electric/Steel|Magnet||
82|Magneton|Electric/Steel|Magnet|Magnemite|L30
83|Farfetch'd|Normal/Flying|Wild Duck||
84|Doduo|Normal/Flying|Twin Bird||
85|Dodrio|Normal/Flying|Triple Bird|Doduo|L31
86|Seel|Water|Sea Lion||
87|Dewgong|Water/Ice|Sea Lion|Seel|L34
88|Grimer|Poison|Sludge||
89|Muk|Poison|Sludge|Grimer|L38
90|Shellder|Water|Bivalve||
91|Cloyster|Water/Ice|Bivalve|Shellder|Using a Water Stone
92|Gastly|Ghost/Poison|Gas||
93|Haunter|Ghost/Poison|Gas|Gastly|L25
94|Gengar|Ghost/Poison|Shadow|Haunter|Being traded
95|Onix|Rock/Ground|Rock Snake||
96|Drowzee|Psychic|Hypnosis||
97|Hypno|Psychic|Hypnosis|Drowzee|L26
98|Krabby|Water|River Crab||
99|Kingler|Water|Pincer|Krabby|L28
100|Voltorb|Electric|Ball||
101|Electrode|Electric|Ball|Voltorb|L30
102|Exeggcute|Grass/Psychic|Egg||
103|Exeggutor|Grass/Psychic|Coconut|Exeggcute|Using a Leaf Stone
104|Cubone|Ground|Lonely||
105|Marowak|Ground|Bone Keeper|Cubone|L28
106|Hitmonlee|Fighting|Kicking|Tyrogue|Reaching level 20 with Attack higher than Defense
107|Hitmonchan|Fighting|Punching|Tyrogue|Reaching level 20 with Defense higher than Attack
108|Lickitung|Normal|Licking||
109|Koffing|Poison|Poison Gas||
110|Weezing|Poison|Poison Gas|Koffing|L35
111|Rhyhorn|Ground/Rock|Spikes||
112|Rhydon|Ground/Rock|Drill|Rhyhorn|L42
113|Chansey|Normal|Egg||
114|Tangela|Grass|Vine||
115|Kangaskhan|Normal|Parent||
116|Horsea|Water|Dragon||
117|Seadra|Water|Dragon|Horsea|L32
118|Goldeen|Water|Goldfish||
119|Seaking|Water|Goldfish|Goldeen|L33
120|Staryu|Water|Star Shape||
121|Starmie|Water/Psychic|Mysterious|Staryu|Using a Water Stone
122|Mr. Mime|Psychic/Fairy|Barrier||
123|Scyther|Bug/Flying|Mantis||
124|Jynx|Ice/Psychic|Human Shape||
125|Electabuzz|Electric|Electric||
126|Magmar|Fire|Spitfire||
127|Pinsir|Bug|Stag Beetle||
128|Tauros|Normal|Wild Bull||
129|Magikarp|Water|Fish||
130|Gyarados|Water/Flying|Atrocious|Magikarp|L20
131|Lapras|Water/Ice|Transport||
132|Ditto|Normal|Transform||
133|Eevee|Normal|Evolution||
134|Vaporeon|Water|Bubble Jet|Eevee|Using a Water Stone
135|Jolteon|Electric|Lightning|Eevee|Using a Thunder Stone
136|Flareon|Fire|Flame|Eevee|Using a Fire Stone
137|Porygon|Normal|Virtual||
138|Omanyte|Rock/Water|Spiral||
139|Omastar|Rock/Water|Spiral|Omanyte|L40
140|Kabuto|Rock/Water|Shellfish||
141|Kabutops|Rock/Water|Shellfish|Kabuto|L40
142|Aerodactyl|Rock/Flying|Fossil||
143|Snorlax|Normal|Sleeping|Munchlax|High friendship
144|Articuno|Ice/Flying|Freeze||
145|Zapdos|Electric/Flying|Electric||
146|Moltres|Fire/Flying|Flame||
147|Dratini|Dragon|Dragon||
148|Dragonair|Dragon|Dragon|Dratini|L30
149|Dragonite|Dragon/Flying|Dragon|Dragonair|L55
150|Mewtwo|Psychic|Genetic||
151|Mew|Psychic|New Species||
152|Chikorita|Grass|Leaf||
153|Bayleef|Grass|Leaf|Chikorita|L16
154|Meganium|Grass|Herb|Bayleef|L32
155|Cyndaquil|Fire|Fire Mouse||
156|Quilava|Fire|Volcano|Cyndaquil|L14
157|Typhlosion|Fire|Volcano|Quilava|L36
158|Totodile|Water|Big Jaw||
159|Croconaw|Water|Big Jaw|Totodile|L18
160|Feraligatr|Water|Big Jaw|Croconaw|L30
169|Crobat|Poison/Flying|Bat|Golbat|High friendship
172|Pichu|Electric|Tiny Mouse||
175|Togepi|Fairy|Spike Ball||
176|Togetic|Fairy/Flying|Happiness|Togepi|High friendship
179|Mareep|Electric|Wool||
180|Flaaffy|Electric|Wool|Mareep|L15
181|Ampharos|Electric|Light|Flaaffy|L30
182|Bellossom|Grass|Flower|Gloom|Using a Sun Stone
183|Marill|Water/Fairy|Aqua Mouse||
184|Azumarill|Water/Fairy|Aqua Rabbit|Marill|L18
185|Sudowoodo|Rock|Imitation||
186|Politoed|Water|Frog|Poliwhirl|Being traded while holding a King's Rock
196|Espeon|Psychic|Sun|Eevee|High friendship during the day
197|Umbreon|Dark|Moonlight|Eevee|High friendship at night
199|Slowking|Water/Psychic|Royal|Slowpoke|Being traded while holding a King's Rock
201|Unown|Psychic|Symbol||
202|Wobbuffet|Psychic|Patient||
208|Steelix|Steel/Ground|Iron Snake|Onix|Being traded while holding a Metal Coat
212|Scizor|Bug/Steel|Pincer|Scyther|Being traded while holding a Metal Coat
214|Heracross|Bug/Fighting|Single Horn||
215|Sneasel|Dark/Ice|Sharp Claw||
227|Skarmory|Steel/Flying|Armor Bird||
230|Kingdra|Water/Dragon|Dragon|Seadra|Being traded while holding a Dragon Scale
236|Tyrogue|Fighting|Scuffle||
237|Hitmontop|Fighting|Handstand|Tyrogue|Reaching level 20 with Attack equal to Defense
242|Blissey|Normal|Happiness|Chansey|High friendship
243|Raikou|Electric|Thunder||
244|Entei|Fire|Volcano||
245|Suicune|Water|Aurora||
246|Larvitar|Rock/Ground|Rock Skin||
247|Pupitar|Rock/Ground|Hard Shell|Larvitar|L30
248|Tyranitar|Rock/Dark|Armor|Pupitar|L55
249|Lugia|Psychic/Flying|Diving||
250|Ho-Oh|Fire/Flying|Rainbow||
251|Celebi|Psychic/Grass|Time Travel||
252|Treecko|Grass|Wood Gecko||
253|Grovyle|Grass|Wood Gecko|Treecko|L16
254|Sceptile|Grass|Forest|Grovyle|L36
255|Torchic|Fire|Chick||
256|Combusken|Fire/Fighting|Young Fowl|Torchic|L16
257|Blaziken|Fire/Fighting|Blaze|Combusken|L36
258|Mudkip|Water|Mud Fish||
259|Marshtomp|Water/Ground|Mud Fish|Mudkip|L16
260|Swampert|Water/Ground|Mud Fish|Marshtomp|L36
280|Ralts|Psychic/Fairy|Feeling||
281|Kirlia|Psychic/Fairy|Emotion|Ralts|L20
282|Gardevoir|Psychic/Fairy|Embrace|Kirlia|L30
302|Sableye|Dark/Ghost|Darkness||
303|Mawile|Steel/Fairy|Deceiver||
328|Trapinch|Ground|Ant Pit||
329|Vibrava|Ground/Dragon|Vibration|Trapinch|L35
330|Flygon|Ground/Dragon|Mystic|Vibrava|L45
333|Swablu|Normal/Flying|Cotton Bird||
334|Altaria|Dragon/Flying|Humming|Swablu|L35
349|Feebas|Water|Fish||
350|Milotic|Water|Tender|Feebas|Raising its Beauty, or trading it with a Prism Scale
359|Absol|Dark|Disaster||
371|Bagon|Dragon|Rock Head||
372|Shelgon|Dragon|Endurance|Bagon|L30
373|Salamence|Dragon/Flying|Dragon|Shelgon|L50
374|Beldum|Steel/Psychic|Iron Ball||
375|Metang|Steel/Psychic|Iron Claw|Beldum|L20
376|Metagross|Steel/Psychic|Iron Leg|Metang|L45
380|Latias|Dragon/Psychic|Eon||
381|Latios|Dragon/Psychic|Eon||
382|Kyogre|Water|Sea Basin||
383|Groudon|Ground|Continent||
384|Rayquaza|Dragon/Flying|Sky High||
385|Jirachi|Steel/Psychic|Wish||
386|Deoxys|Psychic|DNA||
387|Turtwig|Grass|Tiny Leaf||
388|Grotle|Grass|Grove|Turtwig|L18
389|Torterra|Grass/Ground|Continent|Grotle|L32
390|Chimchar|Fire|Chimp||
391|Monferno|Fire/Fighting|Playful|Chimchar|L14
392|Infernape|Fire/Fighting|Flame|Monferno|L36
393|Piplup|Water|Penguin||
394|Prinplup|Water|Penguin|Piplup|L16
395|Empoleon|Water/Steel|Emperor|Prinplup|L36
403|Shinx|Electric|Flash||
404|Luxio|Electric|Spark|Shinx|L15
405|Luxray|Electric|Gleam Eyes|Luxio|L30
443|Gible|Dragon/Ground|Land Shark||
444|Gabite|Dragon/Ground|Cave|Gible|L24
445|Garchomp|Dragon/Ground|Mach|Gabite|L48
446|Munchlax|Normal|Big Eater||
447|Riolu|Fighting|Emanation||
448|Lucario|Fighting/Steel|Aura|Riolu|High friendship during the day
470|Leafeon|Grass|Verdant|Eevee|Using a Leaf Stone
471|Glaceon|Ice|Fresh Snow|Eevee|Using an Ice Stone
475|Gallade|Psychic/Fighting|Blade|Kirlia|Using a Dawn Stone on a male
479|Rotom|Electric/Ghost|Plasma||
483|Dialga|Steel/Dragon|Temporal||
484|Palkia|Water/Dragon|Spatial||
487|Giratina|Ghost/Dragon|Renegade||
491|Darkrai|Dark|Pitch-Black||
493|Arceus|Normal|Alpha||
495|Snivy|Grass|Grass Snake||
496|Servine|Grass|Grass Snake|Snivy|L17
497|Serperior|Grass|Regal|Servine|L36
498|Tepig|Fire|Fire Pig||
499|Pignite|Fire/Fighting|Fire Pig|Tepig|L17
500|Emboar|Fire/Fighting|Mega Fire Pig|Pignite|L36
501|Oshawott|Water|Sea Otter||
502|Dewott|Water|Discipline|Oshawott|L17
503|Samurott|Water|Formidable|Dewott|L36
570|Zorua|Dark|Tricky Fox||
571|Zoroark|Dark|Illusion Fox|Zorua|L30
607|Litwick|Ghost/Fire|Candle||
608|Lampent|Ghost/Fire|Lamp|Litwick|L41
609|Chandelure|Ghost/Fire|Luring|Lampent|Using a Dusk Stone
610|Axew|Dragon|Tusk||
611|Fraxure|Dragon|Axe Jaw|Axew|L38
612|Haxorus|Dragon|Axe Jaw|Fraxure|L48
633|Deino|Dark/Dragon|Irate||
634|Zweilous|Dark/Dragon|Hostile|Deino|L50
635|Hydreigon|Dark/Dragon|Brutal|Zweilous|L64
636|Larvesta|Bug/Fire|Torch||
637|Volcarona|Bug/Fire|Sun|Larvesta|L59
643|Reshiram|Dragon/Fire|Vast White||
644|Zekrom|Dragon/Electric|Deep Black||
646|Kyurem|Dragon/Ice|Boundary||
650|Chespin|Grass|Spiny Nut||
651|Quilladin|Grass|Spiny Armor|Chespin|L16
652|Chesnaught|Grass/Fighting|Spiny Armor|Quilladin|L36
653|Fennekin|Fire|Fox||
654|Braixen|Fire|Fox|Fennekin|L16
655|Delphox|Fire/Psychic|Fox|Braixen|L36
656|Froakie|Water|Bubble Frog||
657|Frogadier|Water|Bubble Frog|Froakie|L16
658|Greninja|Water/Dark|Ninja|Frogadier|L36
700|Sylveon|Fairy|Intertwining|Eevee|Knowing a Fairy-type move with high friendship
704|Goomy|Dragon|Soft Tissue||
705|Sliggoo|Dragon|Soft Tissue|Goomy|L40
706|Goodra|Dragon|Dragon|Sliggoo|Reaching level 50 while it is raining
716|Xerneas|Fairy|Life||
717|Yveltal|Dark/Flying|Destruction||
718|Zygarde|Dragon/Ground|Order||
722|Rowlet|Grass/Flying|Grass Quill||
723|Dartrix|Grass/Flying|Blade Quill|Rowlet|L17
724|Decidueye|Grass/Ghost|Arrow Quill|Dartrix|L34
725|Litten|Fire|Fire Cat||
726|Torracat|Fire|Fire Cat|Litten|L17
727|Incineroar|Fire/Dark|Heel|Torracat|L34
728|Popplio|Water|Sea Lion||
729|Brionne|Water|Pop Star|Popplio|L17
730|Primarina|Water/Fairy|Soloist|Brionne|L34
744|Rockruff|Rock|Puppy||
745|Lycanroc|Rock|Wolf|Rockruff|L25
778|Mimikyu|Ghost/Fairy|Disguise||
791|Solgaleo|Psychic/Steel|Sunne||
792|Lunala|Psychic/Ghost|Moone||
810|Grookey|Grass|Chimp||
811|Thwackey|Grass|Beat|Grookey|L16
812|Rillaboom|Grass|Drummer|Thwackey|L35
813|Scorbunny|Fire|Rabbit||
814|Raboot|Fire|Rabbit|Scorbunny|L16
815|Cinderace|Fire|Striker|Raboot|L35
816|Sobble|Water|Water Lizard||
817|Drizzile|Water|Water Lizard|Sobble|L16
818|Inteleon|Water|Secret Agent|Drizzile|L35
835|Yamper|Electric|Puppy||
836|Boltund|Electric|Dog|Yamper|L25
885|Dreepy|Dragon/Ghost|Lingering||
886|Drakloak|Dragon/Ghost|Caretaker|Dreepy|L50
887|Dragapult|Dragon/Ghost|Stealth|Drakloak|L60
888|Zacian|Fairy|Warrior||
889|Zamazenta|Fighting|Warrior||
890|Eternatus|Poison/Dragon|Gigantic||
906|Sprigatito|Grass|Grass Cat||
907|Floragato|Grass|Grass Cat|Sprigatito|L16
908|Meowscarada|Grass/Dark|Magician|Floragato|L36
909|Fuecoco|Fire|Fire Croc||
910|Crocalor|Fire|Fire Croc|Fuecoco|L16
911|Skeledirge|Fire/Ghost|Singer|Crocalor|L36
912|Quaxly|Water|Duckling||
913|Quaxwell|Water|Practicing|Quaxly|L16
914|Quaquaval|Water/Fighting|Dancer|Quaxwell|L36
1007|Koraidon|Fighting/Dragon|Paradox||
1008|Miraidon|Electric/Dragon|Paradox||
`.trim().split("\n").map(function (row) {
    const p = row.split("|");
    const n = +p[0];
    const gen = GEN_END.findIndex(function (e) { return n <= e; }) + 1;
    return { n: n, name: p[1], types: p[2].split("/"), cat: p[3], from: p[4] || null, how: p[5] || null, gen: gen, region: REGIONS[gen - 1] };
  });

  // Region -> first partner Pokémon [Grass, Fire, Water]
  const STARTERS = {
    Kanto: ["Bulbasaur", "Charmander", "Squirtle"], Johto: ["Chikorita", "Cyndaquil", "Totodile"],
    Hoenn: ["Treecko", "Torchic", "Mudkip"], Sinnoh: ["Turtwig", "Chimchar", "Piplup"],
    Unova: ["Snivy", "Tepig", "Oshawott"], Kalos: ["Chespin", "Fennekin", "Froakie"],
    Alola: ["Rowlet", "Litten", "Popplio"], Galar: ["Grookey", "Scorbunny", "Sobble"],
    Paldea: ["Sprigatito", "Fuecoco", "Quaxly"]
  };

  const PROFESSORS = { Kanto: "Professor Oak", Johto: "Professor Elm", Hoenn: "Professor Birch", Sinnoh: "Professor Rowan", Unova: "Professor Juniper", Kalos: "Professor Sycamore", Alola: "Professor Kukui" };

  // leader, type, city, region, badge
  const GYMS = [
    ["Brock", "Rock", "Pewter City", "Kanto", "Boulder Badge"], ["Misty", "Water", "Cerulean City", "Kanto", "Cascade Badge"],
    ["Lt. Surge", "Electric", "Vermilion City", "Kanto", "Thunder Badge"], ["Erika", "Grass", "Celadon City", "Kanto", "Rainbow Badge"],
    ["Koga", "Poison", "Fuchsia City", "Kanto", "Soul Badge"], ["Sabrina", "Psychic", "Saffron City", "Kanto", "Marsh Badge"],
    ["Blaine", "Fire", "Cinnabar Island", "Kanto", "Volcano Badge"], ["Giovanni", "Ground", "Viridian City", "Kanto", "Earth Badge"],
    ["Falkner", "Flying", "Violet City", "Johto"], ["Bugsy", "Bug", "Azalea Town", "Johto"], ["Whitney", "Normal", "Goldenrod City", "Johto"],
    ["Morty", "Ghost", "Ecruteak City", "Johto"], ["Chuck", "Fighting", "Cianwood City", "Johto"], ["Jasmine", "Steel", "Olivine City", "Johto"],
    ["Pryce", "Ice", "Mahogany Town", "Johto"], ["Clair", "Dragon", "Blackthorn City", "Johto"],
    ["Roxanne", "Rock", "Rustboro City", "Hoenn"], ["Brawly", "Fighting", "Dewford Town", "Hoenn"], ["Wattson", "Electric", "Mauville City", "Hoenn"],
    ["Flannery", "Fire", "Lavaridge Town", "Hoenn"], ["Norman", "Normal", "Petalburg City", "Hoenn"], ["Winona", "Flying", "Fortree City", "Hoenn"],
    ["Tate & Liza", "Psychic", "Mossdeep City", "Hoenn"], ["Wallace", "Water", "Sootopolis City", "Hoenn"],
    ["Roark", "Rock", "Oreburgh City", "Sinnoh"], ["Gardenia", "Grass", "Eterna City", "Sinnoh"], ["Maylene", "Fighting", "Veilstone City", "Sinnoh"],
    ["Crasher Wake", "Water", "Pastoria City", "Sinnoh"], ["Fantina", "Ghost", "Hearthome City", "Sinnoh"], ["Byron", "Steel", "Canalave City", "Sinnoh"],
    ["Candice", "Ice", "Snowpoint City", "Sinnoh"], ["Volkner", "Electric", "Sunyshore City", "Sinnoh"]
  ];

  // move, type, well-known (1) or trickier (2)
  const MOVES = [
    ["Thunderbolt", "Electric", 1], ["Flamethrower", "Fire", 1], ["Surf", "Water", 1], ["Earthquake", "Ground", 1], ["Ice Beam", "Ice", 1],
    ["Solar Beam", "Grass", 1], ["Hydro Pump", "Water", 1], ["Razor Leaf", "Grass", 1], ["Fire Blast", "Fire", 1], ["Blizzard", "Ice", 1],
    ["Thunder Wave", "Electric", 1], ["Dragon Claw", "Dragon", 1], ["Rock Slide", "Rock", 1], ["Shadow Ball", "Ghost", 1], ["Dig", "Ground", 1],
    ["Hyper Beam", "Normal", 2], ["Close Combat", "Fighting", 2], ["Sludge Bomb", "Poison", 2], ["X-Scissor", "Bug", 2], ["Crunch", "Dark", 2],
    ["Flash Cannon", "Steel", 2], ["Moonblast", "Fairy", 2], ["Quick Attack", "Normal", 2], ["Aerial Ace", "Flying", 2], ["Toxic", "Poison", 2],
    ["Will-O-Wisp", "Fire", 2], ["Iron Tail", "Steel", 2], ["Play Rough", "Fairy", 2], ["Outrage", "Dragon", 2], ["Aura Sphere", "Fighting", 2],
    ["Stone Edge", "Rock", 2], ["Bug Buzz", "Bug", 2], ["Night Shade", "Ghost", 2], ["Dark Pulse", "Dark", 2], ["Confusion", "Psychic", 2],
    ["Brave Bird", "Flying", 2], ["Giga Drain", "Grass", 2], ["Scald", "Water", 2], ["Earth Power", "Ground", 2], ["Dazzling Gleam", "Fairy", 2],
    ["Meteor Mash", "Steel", 2], ["Draco Meteor", "Dragon", 2], ["Hurricane", "Flying", 2], ["Leech Seed", "Grass", 2], ["Waterfall", "Water", 2],
    ["Volt Tackle", "Electric", 2], ["Sacred Fire", "Fire", 2], ["Aeroblast", "Flying", 2], ["Spacial Rend", "Dragon", 3], ["Roar of Time", "Dragon", 3],
    ["Shadow Force", "Ghost", 3], ["Double-Edge", "Normal", 2], ["Sucker Punch", "Dark", 2], ["Extreme Speed", "Normal", 3], ["Bullet Punch", "Steel", 3],
    ["Mach Punch", "Fighting", 2], ["Ice Shard", "Ice", 2], ["Power Gem", "Rock", 3], ["Gunk Shot", "Poison", 3], ["Bite", "Dark", 3]
  ];

  // ability, what it does, difficulty, related type tag
  const ABILITIES = [
    ["Levitate", "Makes the Pokémon immune to Ground-type moves", 2, "Ground"],
    ["Intimidate", "Lowers the opposing Pokémon's Attack when it enters battle", 2, "Dark"],
    ["Static", "May paralyze an attacker that makes contact", 2, "Electric"],
    ["Blaze", "Powers up Fire-type moves when HP is low", 2, "Fire"],
    ["Torrent", "Powers up Water-type moves when HP is low", 2, "Water"],
    ["Overgrow", "Powers up Grass-type moves when HP is low", 2, "Grass"],
    ["Sturdy", "Lets the Pokémon survive a knockout hit from full HP with 1 HP left", 2, "Rock"],
    ["Drizzle", "Makes it rain when the Pokémon enters battle", 2, "Water"],
    ["Drought", "Turns the sunlight harsh when the Pokémon enters battle", 2, "Fire"],
    ["Sand Stream", "Whips up a sandstorm when the Pokémon enters battle", 3, "Rock"],
    ["Wonder Guard", "Only super-effective moves can damage the Pokémon", 3, "Ghost"],
    ["Volt Absorb", "Restores HP when hit by an Electric-type move", 2, "Electric"],
    ["Flash Fire", "Powers up its own Fire-type moves when hit by one", 3, "Fire"],
    ["Pressure", "Makes opponents use up extra PP", 3, "Psychic"],
    ["Synchronize", "Passes poison, paralysis or a burn back to the Pokémon that caused it", 3, "Psychic"],
    ["Truant", "The Pokémon can only attack every other turn", 3, "Normal"],
    ["Huge Power", "Doubles the Pokémon's Attack stat", 3, "Fairy"],
    ["Speed Boost", "Raises the Pokémon's Speed at the end of every turn", 2, "Bug"],
    ["Swift Swim", "Doubles the Pokémon's Speed in rain", 3, "Water"],
    ["Chlorophyll", "Doubles the Pokémon's Speed in harsh sunlight", 3, "Grass"],
    ["Multiscale", "Reduces damage taken while the Pokémon is at full HP", 3, "Dragon"],
    ["Protean", "Changes the Pokémon's type to match the move it is using", 3, "Water"],
    ["Arena Trap", "Stops grounded opponents from fleeing or switching out", 3, "Ground"],
    ["Cute Charm", "May infatuate an attacker that makes contact", 3, "Fairy"],
    ["Flame Body", "May burn an attacker that makes contact", 2, "Fire"],
    ["Poison Point", "May poison an attacker that makes contact", 2, "Poison"],
    ["Inner Focus", "Protects the Pokémon from flinching", 3, "Fighting"],
    ["Insomnia", "Prevents the Pokémon from falling asleep", 2, "Psychic"],
    ["Limber", "Prevents the Pokémon from being paralyzed", 3, "Normal"],
    ["Own Tempo", "Prevents the Pokémon from becoming confused", 3, "Psychic"],
    ["Thick Fat", "Halves the damage taken from Fire- and Ice-type moves", 3, "Ice"],
    ["Guts", "Boosts Attack when the Pokémon has a status condition", 3, "Fighting"]
  ];

  // Hand-written questions: c = category, d = difficulty 1-3, q, a = answer, w = wrong answers,
  // t = type tags and m = Pokémon involved (both used by team helpers), f = fun fact shown afterwards.
  const HAND = [
    // ---------- Legends & Lore ----------
    { c: "lore", d: 1, q: "Mewtwo was created from the genes of which Pokémon?", a: "Mew", w: ["Ditto", "Alakazam", "Celebi"], t: ["Psychic"], m: ["Mewtwo", "Mew"] },
    { c: "lore", d: 1, q: "What does Cubone wear on its head?", a: "The skull of its mother", w: ["A hollowed-out rock", "A Shellder's shell", "A helmet made of fossils"], t: ["Ground"], m: ["Cubone"] },
    { c: "lore", d: 1, q: "What bites onto Slowpoke's tail when it evolves into Slowbro?", a: "A Shellder", w: ["A Krabby", "A Kabuto", "A Tentacool"], t: ["Water"], m: ["Slowpoke", "Slowbro", "Shellder"] },
    { c: "lore", d: 1, q: "Which Pokémon can rearrange its cells to transform into whatever it sees?", a: "Ditto", w: ["Porygon", "Mew", "Eevee"], t: ["Normal"], m: ["Ditto"] },
    { c: "lore", d: 1, q: "Which Pokémon stands very still and pretends to be a tree?", a: "Sudowoodo", w: ["Exeggutor", "Tangela", "Torterra"], t: ["Rock"], m: ["Sudowoodo"], f: "It looks like a tree but is a Rock type, so it hates water." },
    { c: "lore", d: 1, q: "Which Pokémon hides under a rag made to look like Pikachu?", a: "Mimikyu", w: ["Ditto", "Zorua", "Gastly"], t: ["Ghost", "Fairy"], m: ["Mimikyu"] },
    { c: "lore", d: 1, q: "What is said to happen if the flame on Charmander's tail goes out?", a: "Its life would end", w: ["It evolves", "It turns into a Water type", "It falls asleep"], t: ["Fire"], m: ["Charmander"] },
    { c: "lore", d: 1, q: "Where does Pikachu store its electricity?", a: "In its cheeks", w: ["In its tail", "In its ears", "In its paws"], t: ["Electric"], m: ["Pikachu"] },
    { c: "lore", d: 1, q: "Which of these is NOT one of Kanto's three Legendary birds?", a: "Pidgeot", w: ["Articuno", "Zapdos", "Moltres"], t: ["Flying"], m: ["Articuno", "Zapdos", "Moltres"] },
    { c: "lore", d: 2, q: "Which Pokémon is said to have shaped the universe with its one thousand arms?", a: "Arceus", w: ["Dialga", "Mew", "Giratina"], t: ["Normal"], m: ["Arceus"] },
    { c: "lore", d: 2, q: "Which Legendary Pokémon has power over time?", a: "Dialga", w: ["Palkia", "Celebi", "Giratina"], t: ["Steel", "Dragon"], m: ["Dialga"] },
    { c: "lore", d: 2, q: "Which Legendary Pokémon has power over space?", a: "Palkia", w: ["Dialga", "Deoxys", "Rayquaza"], t: ["Water", "Dragon"], m: ["Palkia"] },
    { c: "lore", d: 2, q: "Which Pokémon was banished to the Distortion World?", a: "Giratina", w: ["Darkrai", "Mewtwo", "Yveltal"], t: ["Ghost", "Dragon"], m: ["Giratina"] },
    { c: "lore", d: 2, q: "Which Pokémon is said to have expanded the seas with heavy rains?", a: "Kyogre", w: ["Lugia", "Suicune", "Palkia"], t: ["Water"], m: ["Kyogre"] },
    { c: "lore", d: 2, q: "Which Pokémon is said to have raised the continents?", a: "Groudon", w: ["Regigigas", "Torterra", "Kyogre"], t: ["Ground"], m: ["Groudon"] },
    { c: "lore", d: 2, q: "Which Pokémon descends from the sky to stop Kyogre and Groudon fighting?", a: "Rayquaza", w: ["Lugia", "Ho-Oh", "Latios"], t: ["Dragon", "Flying"], m: ["Rayquaza", "Kyogre", "Groudon"] },
    { c: "lore", d: 2, q: "Which Pokémon is said to have revived Raikou, Entei and Suicune after a tower burned down?", a: "Ho-Oh", w: ["Lugia", "Celebi", "Moltres"], t: ["Fire", "Flying"], m: ["Ho-Oh", "Raikou", "Entei", "Suicune"] },
    { c: "lore", d: 2, q: "Which Pokémon is known as the guardian of the seas?", a: "Lugia", w: ["Kyogre", "Lapras", "Suicune"], t: ["Psychic", "Flying"], m: ["Lugia"] },
    { c: "lore", d: 2, q: "Which Mythical Pokémon travels through time and is called the voice of the forest?", a: "Celebi", w: ["Jirachi", "Mew", "Dialga"], t: ["Psychic", "Grass"], m: ["Celebi"] },
    { c: "lore", d: 2, q: "Which Pokémon is said to appear just before a disaster strikes?", a: "Absol", w: ["Darkrai", "Sableye", "Gengar"], t: ["Dark"], m: ["Absol"], f: "Absol senses disasters and tries to warn people — it doesn't cause them." },
    { c: "lore", d: 2, q: "Which Pokémon gives people and Pokémon terrible nightmares?", a: "Darkrai", w: ["Gengar", "Hypno", "Giratina"], t: ["Dark"], m: ["Darkrai"] },
    { c: "lore", d: 2, q: "Which Pokémon is said to carry the genetic code of every Pokémon?", a: "Mew", w: ["Ditto", "Arceus", "Eevee"], t: ["Psychic"], m: ["Mew"] },
    { c: "lore", d: 2, q: "The shapes of Unown look like what?", a: "Ancient writing", w: ["Constellations", "Footprints", "Musical notes"], t: ["Psychic"], m: ["Unown"] },
    { c: "lore", d: 2, q: "Ninetales is said to live for how long?", a: "A thousand years", w: ["A hundred years", "Five hundred years", "Ten thousand years"], t: ["Fire"], m: ["Ninetales"] },
    { c: "lore", d: 2, q: "How many different Pokémon can Eevee evolve into?", a: "Eight", w: ["Three", "Five", "Seven"], t: ["Normal"], m: ["Eevee"] },
    { c: "lore", d: 2, q: "Which Legendary Pokémon carries a sword in its mouth in battle?", a: "Zacian", w: ["Zamazenta", "Kyurem", "Solgaleo"], t: ["Fairy"], m: ["Zacian"] },
    { c: "lore", d: 2, q: "A red Gyarados famously appears at which lake?", a: "The Lake of Rage", w: ["Lake Verity", "Lake Acuity", "Lake Valor"], t: ["Water"], m: ["Gyarados"] },
    { c: "lore", d: 2, q: "Which Pokémon changes its form depending on the weather?", a: "Castform", w: ["Ditto", "Eevee", "Rotom"], t: ["Normal"] },
    { c: "lore", d: 2, q: "Which Pokémon can copy almost any move permanently using Sketch?", a: "Smeargle", w: ["Ditto", "Mew", "Porygon"], t: ["Normal"] },
    { c: "lore", d: 2, q: "Which Pokémon species is always female?", a: "Kangaskhan", w: ["Tauros", "Hitmonlee", "Machop"], t: ["Normal"], m: ["Kangaskhan"] },
    { c: "lore", d: 2, q: "Which Pokémon has the highest base HP of all?", a: "Blissey", w: ["Snorlax", "Chansey", "Wailord"], t: ["Normal"], m: ["Blissey"] },
    { c: "lore", d: 2, q: "Which of these Pokémon is the longest?", a: "Wailord", w: ["Onix", "Gyarados", "Steelix"], t: ["Water"], f: "Wailord is 14.5 m long — Steelix is 9.2 m and Onix 8.8 m." },
    { c: "lore", d: 3, q: "For how long does Jirachi stay awake every thousand years?", a: "Seven days", w: ["One day", "One month", "One year"], t: ["Steel", "Psychic"], m: ["Jirachi"] },
    { c: "lore", d: 3, q: "In Unova's legends, Reshiram sides with the hero who seeks what?", a: "Truth", w: ["Ideals", "Power", "Peace"], t: ["Dragon", "Fire"], m: ["Reshiram"] },
    { c: "lore", d: 3, q: "In Unova's legends, Zekrom sides with the hero who pursues what?", a: "Ideals", w: ["Truth", "Courage", "Wisdom"], t: ["Dragon", "Electric"], m: ["Zekrom"] },
    { c: "lore", d: 3, q: "Which Legendary absorbs the life force of everything around it when its own life ends?", a: "Yveltal", w: ["Xerneas", "Giratina", "Eternatus"], t: ["Dark", "Flying"], m: ["Yveltal"] },
    { c: "lore", d: 3, q: "Which Legendary Pokémon is said to sleep for a thousand years in the form of a tree?", a: "Xerneas", w: ["Celebi", "Zygarde", "Torterra"], t: ["Fairy"], m: ["Xerneas"] },
    { c: "lore", d: 3, q: "Which Pokémon watches over the ecosystem of the Kalos region?", a: "Zygarde", w: ["Xerneas", "Yveltal", "Rayquaza"], t: ["Dragon", "Ground"], m: ["Zygarde"] },
    { c: "lore", d: 3, q: "Which Pokémon is known in Alola as the beast that devours the sun?", a: "Solgaleo", w: ["Lunala", "Volcarona", "Incineroar"], t: ["Psychic", "Steel"], m: ["Solgaleo"] },
    { c: "lore", d: 3, q: "Which Pokémon caused the Darkest Day in the Galar region?", a: "Eternatus", w: ["Zacian", "Darkrai", "Yveltal"], t: ["Poison", "Dragon"], m: ["Eternatus"] },
    { c: "lore", d: 3, q: "Which lake guardian is known as the Being of Knowledge?", a: "Uxie", w: ["Mesprit", "Azelf", "Cresselia"], t: ["Psychic"] },
    { c: "lore", d: 3, q: "Which lake guardian is known as the Being of Willpower?", a: "Azelf", w: ["Uxie", "Mesprit", "Jirachi"], t: ["Psychic"] },
    { c: "lore", d: 3, q: "Legend says which Pokémon towed the continents into place with ropes?", a: "Regigigas", w: ["Groudon", "Machamp", "Arceus"], t: ["Normal"] },
    { c: "lore", d: 3, q: "Spiritomb was formed from how many spirits?", a: "108", w: ["13", "99", "1,000"], t: ["Ghost", "Dark"] },
    { c: "lore", d: 3, q: "Alakazam's IQ is said to be roughly what?", a: "5,000", w: ["500", "1,000", "10,000"], t: ["Psychic"], m: ["Alakazam"] },
    { c: "lore", d: 3, q: "Which Pokémon appears from the empty shell left behind when Nincada evolves?", a: "Shedinja", w: ["Ninjask", "Kakuna", "Dwebble"], t: ["Bug", "Ghost"] },
    { c: "lore", d: 3, q: "Whose restless ghost haunts the Pokémon Tower in Lavender Town?", a: "A Marowak", w: ["A Gengar", "A Kangaskhan", "A Ninetales"], t: ["Ghost", "Ground"], m: ["Marowak"] },
    { c: "lore", d: 3, q: "Which Pokémon is said to try to tug children away by the hand?", a: "Drifloon", w: ["Jigglypuff", "Gastly", "Litwick"], t: ["Ghost"] },
    { c: "lore", d: 3, q: "What does Wobbuffet try hard to keep hidden?", a: "Its black tail", w: ["Its eyes", "Its feet", "Its real face"], t: ["Psychic"], m: ["Wobbuffet"] },
    { c: "lore", d: 3, q: "Which Pokémon has a base Defense and Special Defense of 230 each?", a: "Shuckle", w: ["Steelix", "Cloyster", "Aggron"], t: ["Bug", "Rock"] },
    { c: "lore", d: 3, q: "Which Pokémon has the highest base Speed of all?", a: "Regieleki", w: ["Ninjask", "Dragapult", "Jolteon"], t: ["Electric"] },
    { c: "lore", d: 3, q: "Mew's six base stats are all the same number. What is it?", a: "100", w: ["80", "120", "150"], t: ["Psychic"], m: ["Mew"] },
    { c: "lore", d: 3, q: "About how much does Snorlax weigh?", a: "460 kg", w: ["120 kg", "250 kg", "999 kg"], t: ["Normal"], m: ["Snorlax"] },
    { c: "lore", d: 3, q: "No two of which Pokémon are said to have the same pattern of spots?", a: "Spinda", w: ["Vivillon", "Miltank", "Stantler"], t: ["Normal"] },
    { c: "lore", d: 3, q: "Which Pokémon is the always-female counterpart of the always-male Tauros?", a: "Miltank", w: ["Kangaskhan", "Bouffalant", "Chansey"], t: ["Normal"], m: ["Tauros"] },

    // ---------- Gyms & Trainers ----------
    { c: "trainers", d: 1, q: "Which villainous team causes trouble across the Kanto region?", a: "Team Rocket", w: ["Team Aqua", "Team Galactic", "Team Plasma"] },
    { c: "trainers", d: 1, q: "Who is the boss of Team Rocket?", a: "Giovanni", w: ["Cyrus", "Archie", "Lysandre"], t: ["Ground"] },
    { c: "trainers", d: 2, q: "Which two rival teams fight over land and sea in Hoenn?", a: "Team Magma and Team Aqua", w: ["Team Rocket and Team Plasma", "Team Flare and Team Skull", "Team Galactic and Team Yell"] },
    { c: "trainers", d: 2, q: "Which team tries to remake the universe in the Sinnoh region?", a: "Team Galactic", w: ["Team Plasma", "Team Flare", "Team Magma"] },
    { c: "trainers", d: 2, q: "Who is the Champion of the Sinnoh region?", a: "Cynthia", w: ["Lance", "Diantha", "Steven"] },
    { c: "trainers", d: 2, q: "Who is the undefeated Champion of the Galar region?", a: "Leon", w: ["Alder", "Hop", "Raihan"] },
    { c: "trainers", d: 2, q: "Champion Lance is a master of which type?", a: "Dragon", w: ["Flying", "Dark", "Fire"], t: ["Dragon"] },
    { c: "trainers", d: 2, q: "Which Pokémon is Champion Cynthia's famous ace?", a: "Garchomp", w: ["Lucario", "Dragonite", "Milotic"], t: ["Dragon", "Ground"], m: ["Garchomp"] },
    { c: "trainers", d: 2, q: "Which Pokémon is Champion Leon's partner?", a: "Charizard", w: ["Cinderace", "Dragapult", "Haxorus"], t: ["Fire", "Flying"], m: ["Charizard"] },
    { c: "trainers", d: 3, q: "Who is the Champion of the Kalos region?", a: "Diantha", w: ["Cynthia", "Iris", "Wallace"] },
    { c: "trainers", d: 3, q: "Who leads Team Galactic?", a: "Cyrus", w: ["Ghetsis", "Maxie", "Guzma"] },
    { c: "trainers", d: 3, q: "Who is the leader of Team Aqua?", a: "Archie", w: ["Maxie", "Cyrus", "Giovanni"], t: ["Water"] },
    { c: "trainers", d: 3, q: "Which team wants to separate Pokémon from people in Unova?", a: "Team Plasma", w: ["Team Flare", "Team Skull", "Team Galactic"] },
    { c: "trainers", d: 3, q: "Which Steel-type expert is the Champion of Hoenn?", a: "Steven", w: ["Byron", "Jasmine", "Lance"], t: ["Steel"] },

    // ---------- Regions & Places ----------
    { c: "regions", d: 1, q: "In which town does a new Trainer's journey begin in Kanto?", a: "Pallet Town", w: ["Viridian City", "Pewter City", "Lavender Town"] },
    { c: "regions", d: 2, q: "In which town does a new Trainer's journey begin in Johto?", a: "New Bark Town", w: ["Cherrygrove City", "Violet City", "Azalea Town"] },
    { c: "regions", d: 3, q: "In which town does a new Trainer's journey begin in Hoenn?", a: "Littleroot Town", w: ["Oldale Town", "Twinleaf Town", "Verdanturf Town"] },
    { c: "regions", d: 3, q: "In which town does a new Trainer's journey begin in Sinnoh?", a: "Twinleaf Town", w: ["Sandgem Town", "Littleroot Town", "Floaroma Town"] },
    { c: "regions", d: 2, q: "Which Kanto town is home to the Pokémon Tower, a resting place for departed Pokémon?", a: "Lavender Town", w: ["Pallet Town", "Fuchsia City", "Cinnabar Island"], t: ["Ghost"] },
    { c: "regions", d: 2, q: "On which Kanto mountain are Clefairy said to gather?", a: "Mt. Moon", w: ["Mt. Silver", "Mt. Coronet", "Mt. Pyre"], t: ["Fairy"], m: ["Clefairy"] },
    { c: "regions", d: 2, q: "In which Kanto city does the ship S.S. Anne dock?", a: "Vermilion City", w: ["Cerulean City", "Fuchsia City", "Saffron City"] },
    { c: "regions", d: 3, q: "Which Kanto city is home to the Safari Zone?", a: "Fuchsia City", w: ["Celadon City", "Saffron City", "Viridian City"] },
    { c: "regions", d: 3, q: "Silph Co., maker of the Master Ball, has its headquarters in which city?", a: "Saffron City", w: ["Celadon City", "Goldenrod City", "Vermilion City"] },
    { c: "regions", d: 3, q: "Which mountain sits at the centre of the Sinnoh region?", a: "Mt. Coronet", w: ["Mt. Moon", "Mt. Chimney", "Mt. Silver"] },

    // ---------- Moves, Abilities & Items ----------
    { c: "moves", d: 1, q: "Which Poké Ball never fails to catch a Pokémon?", a: "Master Ball", w: ["Ultra Ball", "Great Ball", "Quick Ball"] },
    { c: "moves", d: 1, q: "Which item brings a fainted Pokémon back into the fight?", a: "Revive", w: ["Potion", "Antidote", "Awakening"] },
    { c: "moves", d: 1, q: "Which item cures a poisoned Pokémon?", a: "Antidote", w: ["Awakening", "Burn Heal", "Repel"], t: ["Poison"] },
    { c: "moves", d: 1, q: "What does the move Splash do?", a: "Nothing at all", w: ["Lowers the foe's accuracy", "Deals Water-type damage", "Raises the user's Speed"], t: ["Water"], m: ["Magikarp"] },
    { c: "moves", d: 1, q: "How many moves can a Pokémon know at one time?", a: "Four", w: ["Two", "Six", "Eight"] },
    { c: "moves", d: 1, q: "How many Pokémon can a Trainer carry in their party?", a: "Six", w: ["Four", "Five", "Eight"] },
    { c: "moves", d: 1, q: "What is the highest level a Pokémon can reach?", a: "Level 100", w: ["Level 50", "Level 99", "Level 250"] },
    { c: "moves", d: 1, q: "Which type of Pokémon can never be burned?", a: "Fire", w: ["Water", "Rock", "Dragon"], t: ["Fire"] },
    { c: "moves", d: 1, q: "Which type of Pokémon can never be frozen?", a: "Ice", w: ["Water", "Fire", "Steel"], t: ["Ice"] },
    { c: "moves", d: 1, q: "Which weather powers up Water-type moves?", a: "Rain", w: ["Harsh sunlight", "Sandstorm", "Snow"], t: ["Water"] },
    { c: "moves", d: 1, q: "Which move lets a Trainer travel across water outside of battle?", a: "Surf", w: ["Dive", "Whirlpool", "Bubble"], t: ["Water"] },
    { c: "moves", d: 2, q: "How many Pokémon types are there?", a: "18", w: ["15", "17", "20"] },
    { c: "moves", d: 2, q: "Which status condition halves the damage of a Pokémon's physical attacks?", a: "Burn", w: ["Paralysis", "Poison", "Confusion"], t: ["Fire"] },
    { c: "moves", d: 2, q: "Which status condition can stop a Pokémon moving and also cuts its Speed?", a: "Paralysis", w: ["Burn", "Poison", "Sleep"], t: ["Electric"] },
    { c: "moves", d: 2, q: "Which type of Pokémon can never be paralyzed?", a: "Electric", w: ["Ground", "Steel", "Ghost"], t: ["Electric"] },
    { c: "moves", d: 2, q: "Besides Poison types, which type of Pokémon cannot be poisoned?", a: "Steel", w: ["Rock", "Ghost", "Fairy"], t: ["Steel", "Poison"] },
    { c: "moves", d: 2, q: "Which item wakes up the Snorlax blocking the road in Kanto?", a: "Poké Flute", w: ["Awakening", "Silph Scope", "Rare Candy"], t: ["Normal"], m: ["Snorlax"] },
    { c: "moves", d: 2, q: "Which move always leaves the target with at least 1 HP?", a: "False Swipe", w: ["Slash", "Super Fang", "Endure"] },
    { c: "moves", d: 2, q: "What happens when a Pokémon uses Rest?", a: "It falls asleep and fully restores its HP", w: ["It skips a turn to power up", "It cures its whole team", "It raises its Defense sharply"] },
    { c: "moves", d: 2, q: "Which move lets the user pick up scattered coins after battle?", a: "Pay Day", w: ["Thief", "Covet", "Fling"], t: ["Normal"], m: ["Meowth"] },
    { c: "moves", d: 2, q: "Which move calls on a randomly chosen move?", a: "Metronome", w: ["Mimic", "Transform", "Sketch"], t: ["Normal", "Fairy"] },
    { c: "moves", d: 2, q: "Which berry restores a good chunk of a Pokémon's HP when its health gets low?", a: "Sitrus Berry", w: ["Cheri Berry", "Pecha Berry", "Rawst Berry"] },
    { c: "moves", d: 2, q: "Which item cures paralysis?", a: "Paralyze Heal", w: ["Antidote", "Ice Heal", "Awakening"] },
    { c: "moves", d: 2, q: "Which Pokémon can breed with almost any other Pokémon?", a: "Ditto", w: ["Mew", "Eevee", "Chansey"], t: ["Normal"], m: ["Ditto"] },
    { c: "moves", d: 3, q: "A move that matches its user's type gets a power boost of how much?", a: "1.5×", w: ["1.25×", "2×", "3×"] },
    { c: "moves", d: 3, q: "Which three types take no damage from a sandstorm?", a: "Rock, Ground and Steel", w: ["Rock, Ground and Fire", "Ground, Steel and Dragon", "Rock, Fighting and Steel"], t: ["Rock", "Ground", "Steel"] },
    { c: "moves", d: 3, q: "Which type of Pokémon is immune to Leech Seed and powder moves like Sleep Powder?", a: "Grass", w: ["Bug", "Poison", "Steel"], t: ["Grass"] },
    { c: "moves", d: 3, q: "Which berry cures paralysis?", a: "Cheri Berry", w: ["Chesto Berry", "Pecha Berry", "Aspear Berry"] },
    { c: "moves", d: 3, q: "Which berry cures poison?", a: "Pecha Berry", w: ["Oran Berry", "Rawst Berry", "Cheri Berry"] },
    { c: "moves", d: 3, q: "Which berry wakes up a sleeping Pokémon?", a: "Chesto Berry", w: ["Rawst Berry", "Aspear Berry", "Sitrus Berry"] },
    { c: "moves", d: 3, q: "Which Pokémon is famous for the Ability Wonder Guard?", a: "Shedinja", w: ["Sableye", "Spiritomb", "Mimikyu"], t: ["Bug", "Ghost"] },
    { c: "moves", d: 3, q: "Which powerful Pokémon is held back by the Ability Truant?", a: "Slaking", w: ["Snorlax", "Regigigas", "Tyranitar"], t: ["Normal"] },
    { c: "moves", d: 3, q: "What is the combined base stat total shared by pseudo-Legendary Pokémon like Dragonite and Garchomp?", a: "600", w: ["540", "580", "680"], t: ["Dragon"], m: ["Dragonite", "Garchomp"] }
  ];

  g.PP_DATA = { TYPES: TYPES, TYPE_COLORS: TYPE_COLORS, CHART: CHART, REGIONS: REGIONS, MONS: MONS, STARTERS: STARTERS, PROFESSORS: PROFESSORS, GYMS: GYMS, MOVES: MOVES, ABILITIES: ABILITIES, HAND: HAND };
})(typeof window !== "undefined" ? window : globalThis);
