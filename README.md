# Final Project

-   [ ] Read the [project requirements](https://vikramsinghmtl.github.io/420-5P6-Game-Programming/project/requirements).
-   [ ] Replace the sample proposal below with the one for your game idea.
-   [ ] Get the proposal greenlit by Vik.
-   [ ] Place any assets in `assets/` and remember to update `src/config.json`.
-   [ ] Decide on a height and width inside `src/globals.js`. The height and width will most likely be determined based on the size of the assets you find.
-   [ ] Start building the individual components of your game, constantly referring to the proposal you wrote to keep yourself on track.
-   [ ] Good luck, you got this!

---

# Proposal - Hunger Cats

## ✒️ Description

The game starts with 6 cats including the player in a battle royale. The goal is to be the last one standing. In the map there will be an item that allows the player to get power ups. When the player collides with the item they will be brought to a new state that implements a plinko game. A ball will bounce down a pegboard and land in a random slot, granting the player a temporary power up. The powered-up cat then warps back into the main arena, ready to turn the tide of battle. Chaos escalates until the final showdown, where the last surviving cat becomes the ultimate Hunger Cat champion. They accumulate wins per round.

## 🕹️ Gameplay
When the match begins, a countdown timer appears. As soon as it hits zero, all players and NPCs must immediately jump or run off the starting platform before the safety window ends—anyone still on the platform when time expires will explode and lose instantly. Once safely off, players and NPCs can scatter across the arena or begin fighting right away.

NPC behavior is driven by proximity: if two NPCs come within a certain distance of each other, they will detect one another and start fighting. If the player enters an NPC’s detection range, the NPC will focus on the player instead and try to attack them.

Throughout the arena, items spawn at random. When an NPC collides with one, they receive a randomly selected temporary power-up.
Players interact with items differently. If the player collides with an item, they are transported to a separate Plinko-style bonus state. There, they drop a ball down a pegboard and whatever slot it lands in determines the temporary power-up they receive such as increased attack damage, faster movement or improved defense that reduces incoming damage. The buff lasts briefly before fading out, returning the player to normal stats.

If the player wins or looses they will be brought to a new state that will display the results as well with a play again button and their record of wins and looses. 



## 📃 Requirements
1. Import sprites
Game Start & Countdown:
1. At the start of every match, a countdown timer must be displayed.
2. When the countdown reaches zero: All players and NPCs must leave the starting platform within a specified time limit.
Anyone remaining on the platform after the limit expires must explode and be instantly eliminated.

Player Behavior:
1. Attack feature
2. Stat feautures
3. Health 
4. If player grabs item, they are transported to a separate Plinko state.
5. Pause game if brought to new state 
6.  The player can engage NPCs in combat.
7.  The Plinko outcome must determine which temporary power-up they receive.
8.  Player power-ups must only last for a limited duration before expiring.
    
NPC Behavior: 
1. NPCs must move off the platform within the countdown safety window.
2. NPCs must be able to roam or choose directions after leaving the platform.
3. NPCs must detect other NPCs within a defined detection radius.
4. When two NPCs detect each other, they must begin fighting.
5. If an NPC detects the player within the detection radius, the NPC must target and attack the player.
6. If an NPC collides with an item: they must immediately receive a random temporary power-up (no Plinko).
7. NPC power-ups must expire after a short duration.
   
Item & Power-Up System:
1. Items must spawn randomly throughout the arena.
2. Items must be collectible by both players and NPCs via collision detection.
3. Power-up types: increased attack damage, increased movement speed, increased defense/reduced damage taken 
4. Power-ups must have a timer indicating their duration.
5. After the timer ends, all affected stats return to normal.
6. Using Particle effects to display the power up maybe.

Plinko Bonus State for Player Only:
1. When a player collects an item, they must enter a new Plinko game state.
2. The Plinko board must drop a ball or (slime cat sprite) that bounces through pegs.
3. The slot the ball lands in determines the player’s power-up.
4. After receiving their power-up, the player must be returned to the main arena.
5. Smooth transition to state

Match Flow:
1. The match continues until only one character remains alive.
2. The game must declare the last surviving character as the winner.
3. The game must then transition to a victory or results screen.

Game over:
1. Display screen for win or loose.
2. Accumulate wins per round
3. Play again button 
   
Other: 
1. Sounds & Music
2. Fonts
3. Teach players how to play 

### 🤖 State Diagram

> [!note]
> Remember that you'll need diagrams for not only game states but entity states as well.

![State Diagram](./assets/images/StateDiagram.png)

### 🗺️ Class Diagram

![Class Diagram](./assets/images/ClassDiagram.png)

### 🧵 Wireframes

> [!note]
> Your wireframes don't have to be super polished. They can even be black/white and hand drawn. I'm just looking for a rough idea about what you're visualizing.

![Main Menu](./assets/images/Main-Menu.png)

-   _Let's Play_ will navigate to the main game.
-   _Upload Cards_ will navigation to the forms for uploading and parsing the data files for the game.
-   _Change Log_ will navigate the user to a page with a list of features/changes that have been implemented throughout the development of the game.

![Game Board](./assets/images/Game-Board.png)

We want to keep the GUI as simple and clear as possible by having cards with relevant images to act as a way for the user to intuitively navigate the game. We want to implement a layout that would look like as if one were playing a match of the Pokémon Trading Card Game with physical cards in real life. Clicking on any of the cards will reveal that card's details to the player.

### 🎨 Assets
cats:
https://oboropixel.itch.io/character-animations
https://9e0.itch.io/cute-legends-cat-heroes
https://elthen.itch.io/2d-pixel-art-cat-sprites
https://toffeecraft.itch.io/cat-slime-animations-rainbow

maps:
https://szadiart.itch.io/rogue-fantasy-castle
https://szadiart.itch.io/rogue-fantasy-catacombs


We used [app.diagrams.net](https://app.diagrams.net/) to create the wireframes. Wireframes are the equivalent to the skeleton of a web app since they are used to describe the functionality of the product and the users experience.

We plan on following trends already found in other trading card video games, such as Pokémon Trading Card Game Online, Hearthstone, Magic the Gathering Arena, and Gwent.

The GUI will be kept simple and playful, as to make sure the game is easy to understand what each component does and is, as well as light hearted to keep to the Pokémon theme.

#### 🖼️ Images

-   Most images will be used from the well known community driven wikipedia site, [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Main_Page).
-   Especially their [Trading Card Game section](<https://bulbapedia.bulbagarden.net/wiki/Full_Art_card_(TCG)>).

#### ✏️ Fonts

For fonts, we will use a similar font to the one from the Hunger Games franchise. It's a font that is legible and fun to keep with the theme we're going for. 

-   [Hunger Games](https://www.dafont.com/hunger-games.font)
-   [Roboto](https://fonts.google.com/specimen/Roboto)

#### 🔊 Sounds

All sounds were taken from [freesound.org](https://freesound.org) for the actions pertaining to cards.

-   [Walking](https://freesound.org/people/VKProduktion/sounds/217502/)
-   [Attack](https://freesound.org/people/Splashdust/sounds/84322/)
-   [Plinko]

### 📚 References

-   [Pokemon Rulebook](http://assets.pokemon.com/assets/cms2/pdf/trading-card-game/rulebook/xy8-rulebook-en.pdf)
