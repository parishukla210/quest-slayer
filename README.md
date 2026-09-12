# Quest Slayer

Build a full-stack gamified RPG productivity web app ("Procrastination Slayer") with Lovable Cloud backend persistence:
1. Auth: Sign up, login, and user profile persistence.
2. Dashboard & Quest Board: Create, edit, tag, and complete real-life quests categorized into RPG stats (e.g. Coding = Intellect, Studying = Wisdom, Meditation = Mind, Fitness = Vitality).
3. Leveling & Attributes: Non-linear XP curve, character stats sheet (Intellect, Wisdom, Mind, etc.), and animated "QUEST COMPLETE!" celebrations showing XP, Gold, and stat gains (+60 XP, +30 Gold, +10 Intellect, level up banner).
4. Boss Arena: "The Procrastinator Boss" (starts at 500 HP). Every completed quest attacks the boss with visual floating combat text, health bar depletion, and attack animations. Boss taunts when quests are overdue. When HP hits 0, trigger an epic "💥 BOSS DEFEATED" victory screen, grant bonus rewards, and spawn the next boss with higher HP.
5. Streak System: Weekly quest streak tracking (Monday to Friday goals), dynamic motivational lines, and special 5-day milestone rewards.
6. Reward Shop & Inventory: Earn gold from quests; buy items like Wizard Outfit (200g), Galaxy Theme (300g), Dragon Pet (500g), Golden Sword (800g), Special Badge (1000g). Deduct gold, equip items, and apply visual cosmetics/themes.
7. Polished RPG aesthetic: Rich dark fantasy/gaming visual design, sound effects/toggles, micro-animations, and responsive layout.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e27bea32-c668-4311-8dab-2429df291b8e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
