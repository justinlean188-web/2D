import type { SceneDef } from '../types';

export const DESERT_ISLAND_PROMPT = `STRANDED ON A DESERT ISLAND -- 30-SECOND 2D STICKMAN SHORT

Create a funny 30-second 2D stickman animation for YouTube Shorts, vertical 9:16, 1080x1920, 24 fps.

VISUAL STYLE:
Modern Pop flat 2D vector cartoon. Thick consistent black outlines, simple geometric shapes, bright tropical colors, smooth readable action, exaggerated facial expressions. Small tropical desert island with golden sand, palm trees, blue ocean, blue sky. No gradients, no textures, no watermark, no logo.

CHARACTER (LOCKED):
The exact same Angry Stickman in all five scenes. Large round white head with a thick black outline, two small black oval eyes, thick expressive black eyebrows, a small expressive black mouth, a bright red beanie, a bright yellow short-sleeved T-shirt, thin black stick arms and legs, blue trousers and solid black shoes. White mitten-shaped hands with thick black outlines and a visible thumb on each hand, connected naturally to the black wrists. Identical head size, body proportions, outfit and facial design in every shot. No detached or floating hands, no extra fingers, no colour changes.

ENVIRONMENT:
Small tropical desert island. Golden sandy beach, 2-3 green palm trees, large green tropical leaves, bright blue ocean with gentle waves, bright blue sky with soft clouds, a few coconuts near palm trees, driftwood and small rocks. Same island layout in every scene.

SHOT 1 (0-6s) -- NO WAY HOME:
Wide establishing shot. Tiny tropical island surrounded by endless blue ocean. Broken wooden raft on the beach. Stickman stands beside the broken raft. He looks at the broken wooden pieces, then toward the endless ocean. He turns his head left and right, realizing there is no one around. He raises both small mitten hands in frustration. His eyebrows angle downward and his mouth opens in disbelief. ON-SCREEN TEXT: "WHERE AM I?!" SOUND: Ocean waves, tropical birds, funny dramatic music.

SHOT 2 (6-12s) -- BUILDING A SHELTER:
Medium shot. Same island background. Stickman collects wooden branches and large green palm leaves. He places branches to create a small hut frame. He adds palm leaves to the roof. He steps back proudly and smiles. Suddenly the roof bends downward. The branches fall apart and the entire hut collapses around him. A few palm leaves fall onto his head. Only his red beanie and part of his white face remain visible under the leaves. ON-SCREEN TEXT: "MY FIVE STAR HOTEL!" SOUND: Wood tapping, leaves rustling, collapsing wood, funny crash sound.

SHOT 3 (12-18s) -- THE FISHING DISASTER:
Side view of the beach. Stickman sits on a flat rock near the water. He holds a homemade wooden fishing rod with both hands. Thin fishing line hangs into the water. He waits impatiently. Suddenly the fishing line becomes tight. A small fish bites the hook. Stickman gets excited and pulls the rod upward. The rod bends dramatically. The fish jumps out of the water, pulls the line sideways, and splashes water directly onto Stickman's face. The fish escapes back into the ocean. Stickman sits completely still, soaking wet, with an angry disappointed expression. ON-SCREEN TEXT: "I'M SUPPOSED TO EAT YOU!" SOUND: Water splashing, fishing line tightening, fish splash, funny failure sound.

SHOT 4 (18-24s) -- THE RESCUE SIGNAL:
Wide shot with slightly elevated angle. Stickman gathers large coconuts from the beach. He carefully arranges coconuts into large readable letters spelling: SOS. Letters clearly visible from elevated angle. He steps back to inspect. He sees a tiny airplane in the distant sky. His eyebrows rise and his mouth forms a huge excited smile. He jumps and waves both arms above his head. The airplane continues flying toward the island. ON-SCREEN TEXT: "FINALLY! SAVE ME!" SOUND: Coconuts rolling, uplifting music, airplane engine sound.

SHOT 5 (24-30s) -- WORST TIMING EVER:
Medium-wide shot showing Stickman, palm tree, SOS sign, and airplane. Stickman continues waving toward the airplane. A coconut becomes loose from a nearby palm tree. Show the coconut falling visibly from the tree. It falls onto the sand beside Stickman, bounces once, and gently bumps the top of his red beanie. The beanie pops off his head and spins through the air. It lands on the sand nearby. Stickman freezes with a shocked expression. The airplane flies past the island without noticing him. Stickman slowly looks toward the airplane, then looks down at the coconut. He sits down on the beach with a defeated expression. The SOS sign remains visible behind him. ON-SCREEN TEXT: "RESCUE FAILED. AGAIN." SOUND: Coconut falling, soft bump, beanie whoosh, airplane passing, sad trombone, comedic ending sound.

FINAL QUALITY RULES:
- Identical character appearance in all scenes. Never change clothing, colours, head shape or body proportions.
- Both hands stay connected to the arms at all times and keep consistent white mitten shapes with black outlines and visible thumbs.
- Show believable hand positions when holding or pulling objects.
- Keep the same island, palm trees, ocean, and environment.
- The hut must be made from visible branches and palm leaves.
- The hut collapses because its frame is unstable.
- The fish must visibly pull the fishing line before the splash.
- The SOS letters must be clearly readable from above.
- The airplane must remain in the distant sky and fly continuously.
- The coconut must visibly fall from the palm tree before hitting the beanie.
- No teleporting objects or unexplained changes in position.
- Smooth, readable animation with expressive cartoon body language.
- Vertical 9:16 composition, 24 FPS, bright modern 2D vector style.

AUDIO:
Upbeat tropical background music, ocean waves, tropical birds, wood tapping, leaves rustling, collapsing wood, funny crash, fishing line sounds, fish splash, coconuts rolling, uplifting music, airplane engine, coconut falling, beanie pop, airplane passing, sad trombone, comedic ending sound. No dialogue.`;

export const DESERT_ISLAND_SCENES: SceneDef[] = [
  {
    id: 1,
    name: 'Shot 1',
    title: 'No Way Home',
    timeRange: [0.0, 6.0] as [number, number],
    videoPrompt:
      'Wide establishing shot of a tiny tropical island surrounded by endless blue ocean. Golden sandy beach, 2-3 green palm trees, bright blue sky with soft clouds. A broken wooden raft lies on the beach. The stickman (red beanie, yellow short-sleeved shirt, blue trousers, black shoes, white mitten hands) stands beside the broken raft. He looks at the broken wooden pieces, then toward the endless ocean. He turns his head left and right, realizing there is no one around. He raises both hands in frustration. Eyebrows angle downward, mouth opens in disbelief.',
    animationDesc:
      '0.0-1.0s he settles into the pose looking at the raft, 1.0-2.5s he looks toward the ocean, 2.5-3.5s he turns head left and right, 3.5-4.5s he raises both hands in frustration, 4.5-6.0s he holds the disbelief expression.',
    soundDesc:
      'Ocean waves, tropical birds, funny dramatic music start. Short dramatic sting at 2.0s. Ocean ambience continues.',
    captionText: 'WHERE AM I?!',
    punchline: 'Stranded on a speck of sand in an endless ocean.',
    characterAction: 'Looks at broken raft, scans ocean, raises hands in frustration.',
    propAction: 'Broken raft pieces on beach. Ocean waves gentle.',
  },
  {
    id: 2,
    name: 'Shot 2',
    title: 'Building a Shelter',
    timeRange: [6.0, 12.0] as [number, number],
    videoPrompt:
      'Medium shot of the same tropical island. The stickman collects wooden branches and large green palm leaves from the beach. He places branches together to create a small hut frame. He adds palm leaves carefully to the roof. He steps back proudly and smiles. Suddenly the roof bends downward. The branches fall apart and the entire hut collapses around him. A few palm leaves fall onto his head. Only his red beanie and part of his white face remain visible under the leaves.',
    animationDesc:
      '6.0-7.0s he gathers branches, 7.0-8.5s he builds hut frame, 8.5-9.5s he adds palm leaves, 9.5-10.0s he steps back proudly, 10.0-10.5s roof bends, 10.5-11.0s hut collapses, 11.0-12.0s leaves fall on his head, only beanie visible.',
    soundDesc:
      'Wood tapping at 6.5s, leaves rustling at 7.5s, wood tapping at 8.5s, confident ding at 9.5s, creak at 10.0s, collapsing wood crash at 10.5s, funny crash at 11.0s, leaf flutter at 11.5s.',
    captionText: 'MY FIVE STAR HOTEL!',
    punchline: 'Luxury accommodation with a complimentary leaf facial.',
    characterAction: 'Gathers branches, builds hut, adds roof, celebrates, hut collapses, leaves fall on head.',
    propAction: 'Branches and palm leaves used to build hut. Hut frame visible, then collapses. Leaves fall on character.',
  },
  {
    id: 3,
    name: 'Shot 3',
    title: 'The Fishing Disaster',
    timeRange: [12.0, 18.0] as [number, number],
    videoPrompt:
      'Side view of the beach. The stickman sits on a flat rock near the water. He holds a homemade wooden fishing rod with both hands. A thin fishing line hangs into the water. He waits impatiently. Suddenly the fishing line becomes tight. A small fish bites the hook. Stickman gets excited and pulls the rod upward. The rod bends dramatically. The fish jumps out of the water, pulls the line sideways, and splashes water directly onto Stickman\'s face. The fish escapes back into the ocean. Stickman sits completely still, soaking wet, with an angry disappointed expression.',
    animationDesc:
      '12.0-13.0s he sits on rock with rod, 13.0-14.5s he waits impatiently, 14.5-15.0s line tightens, 15.0-15.5s he pulls excitedly, rod bends, 15.5-16.0s fish jumps out and splashes water on face, 16.0-16.5s fish escapes, 16.5-18.0s he sits soaking wet with angry expression.',
    soundDesc:
      'Water lapping at 12.2s, fishing line creak at 14.5s, excited whoosh at 15.0s, rod bend creak at 15.2s, fish splash at 15.6s, funny failure sound at 16.0s, water drip at 17.0s.',
    captionText: "I'M SUPPOSED TO EAT YOU!",
    punchline: 'The fish had other plans for dinner.',
    characterAction: 'Sits with rod, waits, line tightens, pulls excitedly, gets splashed, angry reaction.',
    propAction: 'Fishing rod with line in water. Fish jumps, splashes water on face, escapes. Water droplets on character.',
  },
  {
    id: 4,
    name: 'Shot 4',
    title: 'The Rescue Signal',
    timeRange: [18.0, 24.0] as [number, number],
    videoPrompt:
      'Wide shot with slightly elevated angle of the tropical island. The stickman gathers large coconuts from the beach. He carefully arranges the coconuts into large readable letters spelling: SOS. The letters are clearly visible from the elevated camera angle. He steps backward to inspect the finished sign. He sees a tiny airplane in the distant sky. His eyebrows rise and his mouth forms a huge excited smile. He jumps and waves both arms above his head. The airplane continues flying toward the island.',
    animationDesc:
      '18.0-19.0s he gathers coconuts, 19.0-20.5s he arranges SOS letters, 20.5-21.0s he steps back to inspect, 21.0-21.5s he spots airplane, eyebrows rise, 21.5-22.0s huge smile, 22.0-23.0s jumps and waves arms, 23.0-24.0s airplane flies toward island.',
    soundDesc:
      'Coconuts rolling at 18.5s, coconut thuds at 19.5s, uplifting music swell at 21.0s, airplane engine at 21.5s, excited whoosh at 22.0s, jump sound at 22.5s, airplane approaches.',
    captionText: 'FINALLY! SAVE ME!',
    punchline: 'SOS spelled out, airplane spotted, hope rising.',
    characterAction: 'Gathers coconuts, arranges SOS, inspects, spots airplane, jumps and waves.',
    propAction: 'Coconuts on beach arranged as SOS. Airplane in distant sky flying toward island.',
  },
  {
    id: 5,
    name: 'Shot 5',
    title: "Worst Timing Ever",
    timeRange: [24.0, 30.0] as [number, number],
    videoPrompt:
      'Medium-wide shot showing Stickman, palm tree, SOS sign, and airplane. Stickman continues waving toward the airplane. A coconut becomes loose from a nearby palm tree. Show the coconut falling visibly from the tree. It falls onto the sand beside Stickman, bounces once, and gently bumps the top of his red beanie. The beanie pops off his head and spins through the air. It lands on the sand nearby. Stickman freezes with a shocked expression. The airplane flies past the island without noticing him. Stickman slowly looks toward the airplane, then looks down at the coconut. He sits down on the beach with a defeated expression. The SOS sign remains visible behind him.',
    animationDesc:
      '24.0-25.0s continues waving, 25.0-25.3s coconut loosens, 25.3-25.6s coconut falls, 25.6-25.8s bounces and hits beanie, 25.8-26.2s beanie pops off and spins, lands, 26.2-27.0s he freezes shocked, airplane passes, 27.0-28.0s he looks at airplane then coconut, 28.0-30.0s he sits defeated on beach, SOS visible behind.',
    soundDesc:
      'Coconut loosening creak at 25.0s, falling whoosh at 25.3s, bounce thud at 25.6s, beanie pop whoosh at 25.8s, beanie land thud at 26.2s, airplane passing at 26.5s, sad trombone at 27.0s, comedic ending at 29.5s.',
    captionText: 'RESCUE FAILED. AGAIN.',
    punchline: 'So close to rescue, done in by a coconut.',
    characterAction: 'Waves, coconut hits beanie, beanie pops, freezes, airplane passes, looks defeated, sits down.',
    propAction: 'Coconut falls from palm tree, bounces, hits beanie. Beanie spins off and lands. Airplane passes. SOS coconuts visible behind.',
  },
];