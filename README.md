<p align="center">
  <img width="200" src="https://github.com/idrawjs/idraw/assets/8216630/bcf8fbc6-6374-4cb9-a67f-1687d029a863" alt="iDraw.js Logo" />
</p>


<h1 align="center">iDraw.js</h1>

<p align="center">iDraw.js is a simple JavaScript framework for Drawing on the web.</p>

<p align="center">一个面向Web绘图的JavaScript框架</p>


<p align="center"><a href="https://idrawjs.com">idrawjs.com</a></p>



<p align="center">

  <a title="CI" href="https://github.com/idrawjs/idraw/actions/workflows/node.js.yml">
    <img src="https://github.com/idrawjs/idraw/actions/workflows/node.js.yml/badge.svg?branch=main" alt="CI">
  <a>

  <!-- <a href="https://codecov.io/gh/idrawjs/idraw">
    <img src="https://codecov.io/gh/idrawjs/idraw/branch/main/graph/badge.svg?token=MICIC9SCKY"/>
  </a> -->
    
  <a href="https://www.npmjs.com/package/idraw">
    <img src="https://img.shields.io/npm/v/idraw.svg?sanitize=idraw" alt="Version">
  </a>
  <a href="https://www.npmjs.com/package/idraw">
    <img src="https://img.shields.io/npm/l/idraw.svg?sanitize=true" alt="License">
  </a>
</p>



<!-- [![Node.js CI](https://github.com/idrawjs/idraw/actions/workflows/node.js.yml/badge.svg?branch=main)](https://github.com/idrawjs/idraw/actions/workflows/node.js.yml) -->

<hr/>


- [Documents](https://idrawjs.com/docs/en-US/) | [中文文档](https://idrawjs.com/docs/zh-CN/) 
- [Online Playground](https://idrawjs.com/playground/) | [在线API示例](https://idrawjs.com/playground/)
- [Online Studio](https://idrawjs.com/studio/) | [在线绘图演示](https://idrawjs.com/studio/)
 

## Sponsors

iDraw.js is an MIT-licensed open source project with its ongoing development made possible entirely by the support of these awesome backers. If you'd like to join them, please consider [sponsoring iDrawjs's development](https://opencollective.com/idrawjs).

[![Become a Backer](https://opencollective.com/idrawjs/tiers/backers.svg?avatarHeight=48)](https://opencollective.com/idrawjs)


## @idraw/studio Preview

The preview of `@idraw/studo`. Click [here](https://github.com/idrawjs/studio) to get it.

<p align="center">

  <img width="700" alt="idraw-studio-light-theme" src="https://github.com/idrawjs/studio/assets/8216630/8a49bab8-1e4a-44dd-9836-b6ce3861aaea" />

  <img width="700" alt="idraw-studio-dark-theme" src="https://github.com/idrawjs/studio/assets/8216630/479fce0b-891f-47f2-ace8-d91580e68b4b" />

</p>




## Install

```
npm i idraw
```

## Getting Started

### Common

```js
import { iDraw } from 'idraw';

const idraw = new iDraw(
  document.querySelector('#app'),
  {
    width: 600,
    height: 400,
    devicePixelRatio: 1,
  }
);
idraw.addMaterial({
  name: "rect-1",
  type: "rect",
  x: 140,
  y: 120,
  width: 200,
  height: 100,
  fill: "#f7d3c1",
  strokeWidth: 4,
  stroke: "#ff6032",
  cornerRadius: 20,
});
```

### React

```jsx
import { iDraw } from 'idraw';
import { useEffect, useRef } from 'react';

function Demo() {
  const ref = useRef(null);
  useEffect(() => {
    const idraw = new iDraw(ref.current, {
      width: 600,
      height: 400, 
      devicePixelRatio: 1,
    });
    idraw.addMaterial({
      name: "rect-001",
      x: 140,
      y: 120,
      width: 200,
      height: 100,
      fill: "#f7d3c1",
      strokeWidth: 4,
      stroke: "#ff6032",
      cornerRadius: 20,
    })
  }, []);

  return (
    <div ref={ref}></div>
  )
}
```

### Vue

```html
<template>
  <div ref="mount"></div>
</template>

<script setup >
import { iDraw } from 'idraw';
import { ref, onMounted } from 'vue'
const mount = ref();

onMounted(() => {
  const idraw = new iDraw(mount.value, {
    width: 600,
    height: 400, 
    devicePixelRatio: 1,
  });
  idraw.addMaterial({
    name: "rect-001",
    x: 140,
    y: 120,
    width: 200,
    height: 100,
    fill: "#f7d3c1",
    strokeWidth: 4,
    stroke: "#ff6032",
    cornerRadius: 20,
  })
})
</script>
```


## Contributing

We appreciate your help!

To contribute, please follow the steps:
 

- `git clone git@github.com:idrawjs/idraw.git`
- `cd idraw`
- `pnpm i`
- `npm run dev`
 
 

## 🌐 Web Resources & Interactive Index
- [CATEGORY BATTLE 2](https://frskillcrafts.pages.dev/category-battle-2.html)
- [CATEGORY MANAGEMENT](https://themindplaying.web.app/category-management.html)
- [CAKE SORTING DELUXE](https://learnquester.pages.dev/cake-sorting-deluxe.html)
- [CATEGORY RPG GAMES](https://studyquesthub.web.app/category-rpg-games.html)
- [CATEGORY CARDS](https://studyquests.github.io/category-cards.html)
- [SLIME FARM](https://quizverses-9d2f2.web.app/slime-farm.html)
- [MOB RUSH](https://studyquests.github.io/mob-rush.html)
- [IDLE LEGEND](https://quizverses.pages.dev/idle-legend.html)
- [CATEGORY CASUAL 15](https://studyquests.github.io/category-casual-15.html)
- [DOP PUZZLE ERASE MASTER](https://studyquests.github.io/dop-puzzle-erase-master.html)
- [LITTLE LILY HALLOWEEN PREP](https://studyquests.github.io/little-lily-halloween-prep.html)
- [BACK TO SCHOOL UNIFORMS EDITION](https://quizverses.github.io/back-to-school-uniforms-edition.html)
- [CATEGORY CASUAL 7](https://studyquests.github.io/category-casual-7.html)
- [INDEX12](https://quizverses-9d2f2.web.app/index12.html)
- [WOODY TAP BLOCK](https://quizverses.pages.dev/woody-tap-block.html)
- [SNEAKY FRIENDS](https://studyquests.github.io/sneaky-friends.html)
- [CATEGORY RUNNING](https://studyquests.github.io/category-running.html)
- [DARLING DOLL](https://quizverses.pages.dev/darling-doll.html)
- [CATEGORY CONTROLLER 2](https://studyquests.github.io/category-controller-2.html)
- [MINIGIANTS IO](https://quizverses.github.io/minigiants-io.html)
- [ARMY FIGHT 3D](https://studyquests.github.io/army-fight-3d.html)
- [CATEGORY FPS GAME](https://studyquests.github.io/category-fps-game.html)
- [ZINDEX](https://quizverses-9d2f2.web.app/zindex.html)
- [10K](https://studyquests.github.io/10k.html)
- [WARCALL IO](https://quizverses.github.io/warcall-io.html)
- [CATEGORY RUNNING107](https://quizverses-9d2f2.web.app/category-running107.html)
- [MEMEVOIO](https://studyquests.github.io/memevoio.html)
- [CAT MATCH 3](https://studyquests.github.io/cat-match-3.html)
- [BUBBLE UP](https://studyquesthub.web.app/bubble-up.html)
- [CUBEREALM IO](https://studyquesthub.web.app/cuberealm-io.html)
- [CRAFT DRILL](https://studyquests.github.io/craft-drill.html)
- [HYPERSPACE   QUANTUM FRACTURE FEZ](https://quizverses-9d2f2.web.app/hyperspace---quantum-fracture-fez.html)
- [FALLING DUMMY](https://studyquests.github.io/falling-dummy.html)
- [CHALLENGER CITY DRIVER](https://quizverses.github.io/challenger-city-driver.html)
- [CONQUERIO](https://studyquests.github.io/conquerio.html)
- [CATEGORY CASUAL](https://studyquests.github.io/category-casual.html)
- [CATEGORY COLOR197](https://studyplaying.github.io/category-color197.html)
- [PRACTICE ON ME](https://studyquests.github.io/practice-on-me.html)
- [SORT BALLS CONES](https://studyquests.pages.dev/sort-balls-cones.html)
- [LOLLIPOP STACK RUN](https://studyquests.pages.dev/lollipop-stack-run.html)
- [BUILD AND RUN](https://quizverses.pages.dev/build-and-run.html)
- [MAHJONG ZEN GARDEN](https://quizverses.github.io/mahjong-zen-garden.html)
- [CATEGORY SPORTS](https://quizverses-9d2f2.web.app/category-sports.html)
- [SAVE HER TOUR](https://quizverses.pages.dev/save-her-tour.html)
- [MEMORY MATCH MAGIC](https://studyplayings.web.app/memory-match-magic.html)
- [SKY ASSAULT](https://studyquests.pages.dev/sky-assault.html)
- [CRAZY AXE](https://quizverses.github.io/crazy-axe.html)
- [CATEGORY SHOOTER](https://quizverses-9d2f2.web.app/category-shooter.html)
- [SNAKEMAXX](https://studyplaying.github.io/snakemaxx.html)
- [CATEGORY CARTOON76](https://studyquests.github.io/category-cartoon76.html)
- [WINTER GIFTS](https://studyplaying.github.io/winter-gifts.html)
- [TAXI SIMULATOR 2024](https://studyquests.pages.dev/taxi-simulator-2024.html)
- [SOLITAIRE WINTER](https://quizverses.pages.dev/solitaire-winter.html)
- [OBBY POGO PARKOUR](https://learnquester.github.io/obby-pogo-parkour.html)
- [CATEGORY SURVIVAL366](https://quizverses-9d2f2.web.app/category-survival366.html)
- [SUPERPIXELINT](https://learnquesters.pages.dev/superpixelint.html)
- [CATEGORY STRATEGY](https://thelearnquester.web.app/category-strategy.html)
- [WHEEL OF BINGO](https://thelearnquester.web.app/wheel-of-bingo.html)
- [FIND THE GHOST CAT](https://quizverses.github.io/find-the-ghost-cat.html)
- [CATEGORY THINKY](https://quizverses-9d2f2.web.app/category-thinky.html)
- [FISH OUT OF WATER](https://studyplayings.pages.dev/fish-out-of-water.html)
- [SUDOKU PINGAMES](https://quizverses.github.io/sudoku-pingames.html)
- [CATEGORY CRASH32](https://thelearnquesters.pages.dev/category-crash32.html)
- [ELLIE AND BEN CHRISTMAS EVE](https://studyplayings.web.app/ellie-and-ben-christmas-eve.html)
- [MOTO TRIALS RUSH](https://quizverses.github.io/moto-trials-rush.html)
- [PUT THE FRUIT TOGETHER](https://quizverses.github.io/put-the-fruit-together.html)
- [CATEGORY PHYSICS371](https://studyplayings.web.app/category-physics371.html)
- [SNEAKER ART](https://studyplaying.github.io/sneaker-art.html)
- [INDEX21](https://thelearnquester.web.app/index21.html)
- [G WAGON CITY DRIVER](https://studyquests.pages.dev/g-wagon-city-driver.html)
- [PAW CLASH](https://quizverses.pages.dev/paw-clash.html)
- [WORDS WITH OWL](https://studyquests.pages.dev/words-with-owl.html)
- [WORDS WITH PROF WISELY](https://studyquests.pages.dev/words-with-prof-wisely.html)
- [CATEGORY MONSTER](https://quizverses.pages.dev/category-monster.html)
- [DR PARKING](https://studyquests.pages.dev/dr-parking.html)
- [GOTHIC KNIFE](https://studyplayings.web.app/gothic-knife.html)
- [OUTSIDE](https://studyquests.github.io/outside.html)
- [PANDA SHOP SIMULATOR](https://studyquests.pages.dev/panda-shop-simulator.html)
- [OBBY TSUNAMI ESCAPE 1 BY CAR](https://studyplaying.github.io/obby-tsunami-escape-1-by-car.html)
- [CATEGORY PREMIUM PERKS74](https://studyplaying.github.io/category-premium-perks74.html)
- [BILLIARDS 3D RUSSIAN PYRAMID](https://thequizzone.pages.dev/billiards-3d-russian-pyramid.html)
- [TRICKY CHALLENGES MINI GAMES](https://studyquests.pages.dev/tricky-challenges-mini-games.html)
- [CATEGORY GUN238](https://quizverses.pages.dev/category-gun238.html)
- [CATEGORY 2D1 060](https://theskillquest.pages.dev/category-2d1-060.html)
- [MERGE 2048 GUN RUSH](https://themindplays.pages.dev/merge-2048-gun-rush.html)
- [CATEGORY DRESS UP97](https://studyquests.github.io/category-dress-up97.html)
- [CATEGORY PUZZLE 3](https://quizverses.pages.dev/category-puzzle-3.html)
- [CATEGORY SHOOTER 2](https://studyplaying.github.io/category-shooter-2.html)
- [CATEGORY BIKE](https://iskillquest.pages.dev/category-bike.html)
- [FLY FLY FLY](https://themindplay.pages.dev/fly-fly-fly.html)
- [LABUBU MERGE](https://studyquests.github.io/labubu-merge.html)
- [MERGE BALLS NEW YEARS TOYS IN 3D](https://quizverses.github.io/merge-balls-new-years-toys-in-3d.html)
- [CYBER ROLLING GOING BALL 3D](https://studyquests.pages.dev/cyber-rolling-going-ball-3d.html)
- [RESCUE SHARP TURN](https://themindzone.pages.dev/rescue-sharp-turn.html)
- [SWORDEDIO SPIN AND RUB](https://theskillquest.pages.dev/swordedio-spin-and-rub.html)
- [ULTIMATE SPORTS CAR DRIFT](https://studyquests.github.io/ultimate-sports-car-drift.html)
- [ROYAL CROWN BLAST](https://themindplaying.web.app/royal-crown-blast.html)
- [BALING BUM](https://quizverses.github.io/baling-bum.html)
- [CATEGORY SNAKE GAMES](https://theskillquest.pages.dev/category-snake-games.html)
- [EAT AND GROW FISH](https://themindzone.pages.dev/eat-and-grow-fish.html)
- [CATEGORY WEBGAME](https://studyquests.github.io/category-webgame.html)
- [GALACTIC GOLF SOLITAIRE](https://iskillquest.pages.dev/galactic-golf-solitaire.html)
- [APOCALYPSE SHELTER](https://learnquesters.pages.dev/apocalypse-shelter.html)
- [CATEGORY SECURLY BYPASS](https://quizverses.pages.dev/category-securly-bypass.html)
- [DIAMONDZ](https://studyplayings.web.app/diamondz.html)
- [KING KONG CHAOS](https://quizverses.github.io/king-kong-chaos.html)
- [PET TILE MASTER](https://themindzone.pages.dev/pet-tile-master.html)
- [CATEGORY CUTE](https://iskillquest.pages.dev/category-cute.html)
- [HAWAII MATCH 6](https://quizverses-9d2f2.web.app/hawaii-match-6.html)
- [BLOCK UP](https://quizverses.pages.dev/block-up.html)
- [SECRET ROOMS](https://iskillquest.pages.dev/secret-rooms.html)
- [CATEGORY CARE](https://studyquests.github.io/category-care.html)
- [GRANNY PILLS DEFEND CACTUSES](https://themindplay.pages.dev/granny-pills-defend-cactuses.html)
- [ITALIAN BRAINROT BIKE RUSH](https://theskillquest.pages.dev/italian-brainrot-bike-rush.html)
- [CAT VS GRANNY CAT SIMULATOR](https://learnquesters.pages.dev/cat-vs-granny-cat-simulator.html)
- [EAT BLOBS SIMULATOR](https://quizverses.pages.dev/eat-blobs-simulator.html)
- [CATEGORY UNBLOCKED GAMES](https://quizverses-9d2f2.web.app/category-unblocked-games.html)
- [OCEAN SMALL HOSPITAL DOCTOR](https://theskillquest.pages.dev/ocean-small-hospital-doctor.html)
- [CONSTRUCTION TRUCK BUILDING GAMES FOR KIDS](https://themindplay.pages.dev/construction-truck-building-games-for-kids.html)
- [STEALTH MASTER SNEAK CAT](https://themindplaying.web.app/stealth-master-sneak-cat.html)
- [OBBY PINATA PARTY](https://studyquests.github.io/obby-pinata-party.html)
- [WORLD WARS TANKS](https://thelearnquester.web.app/world-wars-tanks.html)
- [SWEEPER CURLING](https://themindzone.pages.dev/sweeper-curling.html)
- [OCTOPUS INVASION](https://themindzone.pages.dev/octopus-invasion.html)
- [HEIST DEFENDER](https://themindzone.pages.dev/heist-defender.html)
- [ZOMBIE FRONTIER SHOOTER](https://thelearnquester.web.app/zombie-frontier-shooter.html)
- [CATEGORY SHOOTER 3](https://studyquests.github.io/category-shooter-3.html)
- [JUNGLE FURY MUTANT RHINO MAYHEM](https://quizverses-9d2f2.web.app/jungle-fury-mutant-rhino-mayhem.html)
- [ALIEN HUNTERS](https://themindzone.pages.dev/alien-hunters.html)
- [ROBOT RUNNER FIGHT](https://themindplaying.web.app/robot-runner-fight.html)
