import BattleScene from "./battle-scene";
import SoundFade from "phaser3-rex-plugins/plugins/soundfade.js";
import { pokemonEvolutions, SpeciesEvolution } from "./pokemon-evolutions";
import { default as PokemonSpecies, allSpecies, getPokemonSpecies } from "./pokemon-species";
import { Species } from "./species";
import { Type } from './type';
import * as Utils from './utils';

import beautify from 'json-beautify';

export enum Biome {
  PLAINS,
  GRASS,
  FOREST,
  WATER,
  SWAMP,
  SEA,
  MOUNTAIN,
  LAND,
  CAVE,
  DESERT,
  ICE_CAVE,
  MEADOW,
  POWER_PLANT,
  VOLCANO,
  GRAVEYARD,
  DOJO,
  RUINS,
  WASTELAND,
  ABYSS,
  SPACE
};

enum PoolTier {
  COMMON,
  UNCOMMON,
  RARE,
  SUPER_RARE,
  ULTRA_RARE,
  BOSS,
  BOSS_RARE,
  BOSS_SUPER_RARE,
  BOSS_ULTRA_RARE
};

export class BiomeArena {
  private scene: BattleScene;
  public biomeType: integer;
  private bgm: string;

  private pokemonPool: PokemonSpecies[][];

  constructor(scene: BattleScene, biome: integer, bgm: string) {
    this.scene = scene;
    this.biomeType = biome;
    this.bgm = bgm;
    this.pokemonPool = biomePools[biome];
  }

  randomSpecies(waveIndex: integer, level: integer): PokemonSpecies {
    const isBoss = waveIndex % 10 === 0 && this.pokemonPool[PoolTier.BOSS].length;
    const tierValue = Utils.randInt(!isBoss ? 512 : 64);
    let tier = !isBoss
      ? tierValue >= 156 ? PoolTier.COMMON : tierValue >= 32 ? PoolTier.UNCOMMON : tierValue >= 6 ? PoolTier.RARE : tierValue >= 1 ? PoolTier.SUPER_RARE : PoolTier.ULTRA_RARE
      : tierValue >= 20 ? PoolTier.BOSS : tierValue >= 6 ? PoolTier.BOSS_RARE : tierValue >= 1 ? PoolTier.BOSS_SUPER_RARE : PoolTier.BOSS_ULTRA_RARE;
    while (!this.pokemonPool[tier].length) {
      console.log(`Downgraded rarity tier from ${PoolTier[tier]} to ${PoolTier[tier - 1]}`);
      tier--;
    }
    const tierPool = this.pokemonPool[tier];
    let ret: PokemonSpecies;
    if (!tierPool.length)
      ret = this.scene.randomSpecies(level);
    else {
      const entry = tierPool[Utils.randInt(tierPool.length)];
      let species: Species;
      if (typeof entry === 'number')
        species = entry as Species;
      else {
        const levelThresholds = Object.keys(entry);
        for (let l = levelThresholds.length - 1; l >= 0; l--) {
          const levelThreshold = parseInt(levelThresholds[l]);
          if (level >= levelThreshold) {
            const speciesIds = entry[levelThreshold];
            if (speciesIds.length > 1)
              species = speciesIds[Utils.randInt(speciesIds.length)];
            else
              species = speciesIds[0];
            break;
          }
        }
      }
      
      ret = getPokemonSpecies(species);
    }
    const newSpeciesId = ret.getSpeciesForLevel(5);
    if (newSpeciesId !== ret.speciesId) {
      console.log('Replaced', Species[ret.speciesId], 'with', Species[newSpeciesId]);
      ret = getPokemonSpecies(newSpeciesId);
    }
    return ret;
  }

  getBiomeKey() {
    switch (this.biomeType) {
      case Biome.ABYSS:
        return 'wasteland';
      case Biome.MEADOW:
        return 'grass';
      case Biome.VOLCANO:
        return 'cave';
      case Biome.POWER_PLANT:
        return 'ruins';
    }
    return Biome[this.biomeType].toLowerCase();
  }

  playBgm() {
    this.scene.loadBgm(this.bgm);
    this.scene.load.once(Phaser.Loader.Events.COMPLETE, () => this.scene.playBgm(this.bgm));
  }

  fadeOutBgm(duration: integer) {
    SoundFade.fadeOut(this.scene, this.scene.sound.get(this.bgm), duration);
  }
}

const biomePools = {
  [Biome.PLAINS]: {
    [PoolTier.COMMON]: [
      { 1: [ Species.CATERPIE ], 7: [ Species.METAPOD ] },
      { 1: [ Species.WEEDLE ], 7: [ Species.KAKUNA ] },
      Species.PIDGEY,
      Species.RATTATA,
      Species.SPEAROW,
      Species.SENTRET,
      Species.HOOTHOOT,
      Species.LEDYBA,
      Species.HOPPIP,
      Species.SUNKERN,
      Species.POOCHYENA,
      Species.ZIGZAGOON,
      { 1: [ Species.WURMPLE ], 7: [ Species.CASCOON, Species.SILCOON ] },
      Species.TAILLOW,
      Species.STARLY,
      Species.BIDOOF,
      Species.PATRAT,
      Species.LILLIPUP,
      { 1: [ Species.PURRLOIN ], 20: [ Species.LIEPARD ] },
      Species.PIDOVE,
      Species.COTTONEE
    ],
    [PoolTier.UNCOMMON]: [
      Species.EKANS,
      Species.NIDORAN_F,
      Species.NIDORAN_M,
      Species.ODDISH,
      Species.PARAS,
      Species.VENONAT,
      Species.MEOWTH,
      Species.BELLSPROUT,
      Species.PICHU,
      Species.IGGLYBUFF,
      Species.LOTAD,
      Species.SEEDOT,
      { 1: [ Species.SHROOMISH ], 23: [ Species.BRELOOM ] },
      Species.NINCADA,
      Species.WHISMUR,
      Species.AZURILL,
      Species.SKITTY,
      Species.KRICKETOT,
      Species.BUDEW,
      Species.COMBEE,
      { 1: [ Species.CHERUBI ], 25: [ Species.CHERRIM ] },
      Species.VENIPEDE,
      Species.MINCCINO,
      { 1: [ Species.FOONGUS ], 39: [ Species.AMOONGUSS ] }
    ],
    [PoolTier.RARE]: [ Species.ABRA, Species.CLEFFA, { 1: [ Species.SURSKIT ], 22: [ Species.MASQUERAIN ] }, Species.SLAKOTH, Species.DUCKLETT ],
    [PoolTier.SUPER_RARE]: [ Species.EEVEE, Species.TOGEPI, Species.SMEARGLE, Species.TYROGUE, Species.SMOOCHUM, Species.ELEKID, Species.MAGBY, Species.RALTS, Species.WYNAUT, Species.BONSLY, Species.MIME_JR, Species.HAPPINY, Species.MUNCHLAX, Species.RIOLU ],
    [PoolTier.ULTRA_RARE]: [ Species.DITTO ],
    [PoolTier.BOSS]: [],
    [PoolTier.BOSS_RARE]: [],
    [PoolTier.BOSS_SUPER_RARE]: [],
    [PoolTier.BOSS_ULTRA_RARE]: []
  },
  [Biome.GRASS]: {
    [PoolTier.COMMON]: [
      { 1: [ Species.PIDGEY ], 18: [ Species.PIDGEOTTO ], 36: [ Species.PIDGEOT ] },
      { 1: [ Species.RATTATA ], 20: [ Species.RATICATE ] },
      { 1: [ Species.SPEAROW ], 20: [ Species.FEAROW ] },
      { 1: [ Species.ODDISH ], 21: [ Species.GLOOM ], 30: [ Species.VILEPLUME ] },
      { 1: [ Species.MEOWTH ], 28: [ Species.PERSIAN ] },
      { 1: [ Species.BELLSPROUT ], 21: [ Species.WEEPINBELL ] },
      { 1: [ Species.DODUO ], 31: [ Species.DODRIO ] },
      { 1: [ Species.SENTRET ], 15: [ Species.FURRET ] },
      { 1: [ Species.LEDYBA ], 18: [ Species.LEDIAN ] },
      { 1: [ Species.HOPPIP ], 18: [ Species.SKIPLOOM ], 27: [ Species.JUMPLUFF ] },
      Species.SUNKERN,
      { 1: [ Species.ZIGZAGOON ], 20: [ Species.LINOONE ] },
      { 1: [ Species.ROSELIA ], 40: [ Species.ROSERADE ] },
      { 1: [ Species.STARLY ], 14: [ Species.STARAVIA ], 34: [ Species.STARAPTOR ] },
      { 1: [ Species.BIDOOF ], 15: [ Species.BIBAREL ] },
      { 1: [ Species.PATRAT ], 20: [ Species.WATCHOG ] },
      { 1: [ Species.LILLIPUP ], 16: [ Species.HERDIER ], 32: [ Species.STOUTLAND ] },
      { 1: [ Species.PIDOVE ], 21: [ Species.TRANQUILL ], 32: [ Species.UNFEZANT ] },
      { 1: [ Species.BLITZLE ], 27: [ Species.ZEBSTRIKA ] },
      { 1: [ Species.COTTONEE ], 20: [ Species.WHIMSICOTT ] },
      Species.MINCCINO
    ],
    [PoolTier.UNCOMMON]: [
      Species.PIKACHU,
      { 1: [ Species.JIGGLYPUFF ], 30: [ Species.WIGGLYTUFF ] },
      { 1: [ Species.VENONAT ], 31: [ Species.VENOMOTH ] },
      { 1: [ Species.MANKEY ], 28: [ Species.PRIMEAPE ] },
      { 1: [ Species.PONYTA ], 40: [ Species.RAPIDASH ] },
      { 1: [ Species.GRIMER ], 38: [ Species.MUK ] },
      Species.NOCTOWL,
      { 1: [ Species.MAREEP ], 15: [ Species.FLAAFFY ], 30: [ Species.AMPHAROS ] },
      { 1: [ Species.PINECO ], 31: [ Species.FORRETRESS ] },
      { 1: [ Species.SEEDOT ], 14: [ Species.NUZLEAF ] },
      { 1: [ Species.TAILLOW ], 22: [ Species.SWELLOW ] },
      { 1: [ Species.SHROOMISH ], 23: [ Species.BRELOOM ] },
      { 1: [ Species.WHISMUR ], 20: [ Species.LOUDRED ], 40: [ Species.EXPLOUD ] },
      { 1: [ Species.SKITTY ], 20: [ Species.DELCATTY ] },
      { 1: [ Species.KRICKETOT ], 10: [ Species.KRICKETUNE ] },
      { 1: [ Species.COMBEE ], 21: [ Species.VESPIQUEN ] },
      { 1: [ Species.CHERUBI ], 25: [ Species.CHERRIM ] },
      { 1: [ Species.GLAMEOW ], 38: [ Species.PURUGLY ] },
      { 1: [ Species.FOONGUS ], 39: [ Species.AMOONGUSS ] }
    ],
    [PoolTier.RARE]: [
      Species.CLEFAIRY,
      Species.VULPIX,
      Species.GROWLITHE,
      { 1: [ Species.ABRA ], 16: [ Species.KADABRA ] },
      { 1: [ Species.DROWZEE ], 26: [ Species.HYPNO ] },
      Species.EXEGGCUTE,
      Species.TANGELA,
      Species.PINSIR,
      Species.TAUROS,
      Species.GIRAFARIG,
      { 1: [ Species.SNUBBULL ], 23: [ Species.GRANBULL ] },
      Species.MILTANK,
      { 1: [ Species.RALTS ], 20: [ Species.KIRLIA ], 30: [ Species.GARDEVOIR ] },
      { 1: [ Species.ELECTRIKE ], 26: [ Species.MANECTRIC ] },
      Species.PLUSLE,
      Species.MINUN,
      Species.VOLBEAT,
      Species.ILLUMISE,
      Species.ZANGOOSE,
      Species.KECLEON,
      { 1: [ Species.SHINX ], 15: [ Species.LUXIO ], 30: [ Species.LUXRAY ] },
      Species.PACHIRISU,
      { 1: [ Species.BUNEARY ], 20: [ Species.LOPUNNY ] },
      Species.EMOLGA,
      Species.BOUFFALANT
    ],
    [PoolTier.SUPER_RARE]: [ Species.FARFETCHD, Species.LICKITUNG, Species.CHANSEY, Species.KANGASKHAN, Species.SCYTHER, Species.EEVEE, Species.SNORLAX, Species.SUDOWOODO, Species.DUNSPARCE, Species.SHUCKLE, Species.SMEARGLE, Species.SPINDA, Species.AUDINO ],
    [PoolTier.ULTRA_RARE]: [ Species.DITTO, Species.CASTFORM, Species.SHAYMIN ],
    [PoolTier.BOSS]: [
      Species.PERSIAN,
      Species.DODRIO,
      Species.FURRET,
      Species.NOCTOWL,
      Species.LEDIAN,
      Species.ARIADOS,
      Species.AMPHAROS,
      Species.SUNFLORA,
      Species.LINOONE,
      Species.EXPLOUD,
      Species.DELCATTY,
      Species.ZANGOOSE,
      Species.KECLEON,
      Species.BIBAREL,
      Species.ROSERADE,
      Species.LOPUNNY,
      Species.PURUGLY,
      Species.WATCHOG,
      Species.STOUTLAND,
      Species.ZEBSTRIKA,
      Species.WHIMSICOTT,
      Species.CINCCINO
    ],
    [PoolTier.BOSS_RARE]: [ Species.VENUSAUR, Species.FARFETCHD, Species.KANGASKHAN, Species.SNORLAX, Species.SUDOWOODO, Species.GIRAFARIG, Species.SHUCKLE, Species.CASTFORM, Species.LICKILICKY, Species.AUDINO ],
    [PoolTier.BOSS_SUPER_RARE]: [ Species.SHAYMIN ],
    [PoolTier.BOSS_ULTRA_RARE]: []
  },
  [Biome.FOREST]: {
    [PoolTier.COMMON]: [
      { 1: [ Species.CATERPIE ], 7: [ Species.METAPOD ] },
      { 1: [ Species.WEEDLE ], 7: [ Species.KAKUNA ] },
      { 1: [ Species.NIDORAN_F ], 16: [ Species.NIDORINA ] },
      { 1: [ Species.NIDORAN_M ], 16: [ Species.NIDORINO ] },
      { 1: [ Species.ODDISH ], 21: [ Species.GLOOM ], 30: [ Species.VILEPLUME ] },
      { 1: [ Species.PARAS ], 24: [ Species.PARASECT ] },
      { 1: [ Species.VENONAT ], 31: [ Species.VENOMOTH ] },
      { 1: [ Species.BELLSPROUT ], 21: [ Species.WEEPINBELL ] },
      { 1: [ Species.SPINARAK ], 22: [ Species.ARIADOS ] },
      { 1: [ Species.SKIPLOOM ], 27: [ Species.JUMPLUFF ] },
      { 1: [ Species.PINECO ], 31: [ Species.FORRETRESS ] },
      { 1: [ Species.WURMPLE ], 7: [ Species.CASCOON, Species.SILCOON ] },
      { 1: [ Species.SEEDOT ], 14: [ Species.NUZLEAF ] },
      { 1: [ Species.SHROOMISH ], 23: [ Species.BRELOOM ] },
      { 1: [ Species.KRICKETOT ], 10: [ Species.KRICKETUNE ] },
      { 1: [ Species.COMBEE ], 21: [ Species.VESPIQUEN ] },
      { 1: [ Species.CHERUBI ], 25: [ Species.CHERRIM ] },
      { 1: [ Species.SEWADDLE ], 20: [ Species.SWADLOON ], 30: [ Species.LEAVANNY ] },
      { 1: [ Species.VENIPEDE ], 22: [ Species.WHIRLIPEDE ], 30: [ Species.SCOLIPEDE ] },
      Species.PETILIL,
      { 1: [ Species.DEERLING ], 34: [ Species.SAWSBUCK ] },
      { 1: [ Species.FOONGUS ], 39: [ Species.AMOONGUSS ] }
    ],
    [PoolTier.UNCOMMON]: [
      Species.BUTTERFREE,
      Species.BEEDRILL,
      { 1: [ Species.EKANS ], 22: [ Species.ARBOK ] },
      { 1: [ Species.ZUBAT ], 22: [ Species.GOLBAT ] },
      Species.EXEGGCUTE,
      { 1: [ Species.KOFFING ], 35: [ Species.WEEZING ] },
      Species.TANGELA,
      Species.PINSIR,
      Species.HOOTHOOT,
      Species.AIPOM,
      { 1: [ Species.TEDDIURSA ], 30: [ Species.URSARING ] },
      Species.BEAUTIFLY,
      Species.DUSTOX,
      { 1: [ Species.NINCADA ], 20: [ Species.NINJASK ] },
      { 1: [ Species.ROSELIA ], 40: [ Species.ROSERADE ] },
      { 1: [ Species.GULPIN ], 26: [ Species.SWALOT ] },
      { 1: [ Species.BURMY ], 20: [ Species.MOTHIM, Species.WORMADAM ] },
      { 1: [ Species.STUNKY ], 34: [ Species.SKUNTANK ] },
      { 1: [ Species.PANSAGE ], 20: [ Species.SIMISAGE ] },
      { 1: [ Species.JOLTIK ], 36: [ Species.GALVANTULA ] }
    ],
    [PoolTier.RARE]: [
      { 1: [ Species.BULBASAUR ], 16: [ Species.IVYSAUR ], 32: [ Species.VENUSAUR ] },
      Species.SCYTHER,
      { 1: [ Species.CHIKORITA ], 16: [ Species.BAYLEEF ], 32: [ Species.MEGANIUM ] },
      Species.YANMA,
      Species.HERACROSS,
      Species.STANTLER,
      { 1: [ Species.TREECKO ], 16: [ Species.GROVYLE ], 36: [ Species.SCEPTILE ] },
      { 1: [ Species.SLAKOTH ], 18: [ Species.VIGOROTH ], 36: [ Species.SLAKING ] },
      Species.VOLBEAT,
      Species.ILLUMISE,
      Species.SEVIPER,
      Species.TROPIUS,
      { 1: [ Species.TURTWIG ], 18: [ Species.GROTLE ], 32: [ Species.TORTERRA ] },
      Species.CARNIVINE,
      { 1: [ Species.SNIVY ], 17: [ Species.SERVINE ], 36: [ Species.SERPERIOR ] },
      Species.KARRABLAST,
      { 1: [ Species.FERROSEED ], 40: [ Species.FERROTHORN ] },
      Species.SHELMET,
      Species.DURANT
    ],
    [PoolTier.SUPER_RARE]: [ Species.SHEDINJA, Species.CHATOT ],
    [PoolTier.ULTRA_RARE]: [ Species.CELEBI, Species.VIRIZION ],
    [PoolTier.BOSS]: [
      Species.BUTTERFREE,
      Species.BEEDRILL,
      Species.NIDOQUEEN,
      Species.NIDOKING,
      Species.VILEPLUME,
      Species.PARASECT,
      Species.VENOMOTH,
      Species.VICTREEBEL,
      Species.EXEGGUTOR,
      Species.PINSIR,
      Species.BELLOSSOM,
      Species.JUMPLUFF,
      Species.FORRETRESS,
      Species.URSARING,
      Species.BEAUTIFLY,
      Species.DUSTOX,
      Species.BRELOOM,
      Species.NINJASK,
      Species.SEVIPER,
      Species.TROPIUS,
      Species.KRICKETUNE,
      Species.WORMADAM,
      Species.MOTHIM,
      Species.VESPIQUEN,
      Species.CHERRIM,
      Species.AMBIPOM,
      Species.SKUNTANK,
      Species.CARNIVINE,
      Species.TANGROWTH,
      Species.YANMEGA,
      Species.SIMISAGE,
      Species.LEAVANNY,
      Species.SCOLIPEDE,
      Species.LILLIGANT,
      Species.SAWSBUCK,
      Species.AMOONGUSS,
      Species.GALVANTULA,
      Species.DURANT
    ],
    [PoolTier.BOSS_RARE]: [ Species.MEGANIUM, Species.HERACROSS, Species.STANTLER, Species.SCEPTILE, Species.SHIFTRY, Species.SLAKING, Species.TORTERRA, Species.LEAFEON, Species.SERPERIOR, Species.ESCAVALIER, Species.FERROTHORN, Species.ACCELGOR ],
    [PoolTier.BOSS_SUPER_RARE]: [ Species.SCIZOR, Species.CELEBI, Species.VIRIZION ],
    [PoolTier.BOSS_ULTRA_RARE]: []
  },
  [Biome.WATER]: {
    [PoolTier.COMMON]: [
      { 1: [ Species.PSYDUCK ], 33: [ Species.GOLDUCK ] },
      { 1: [ Species.POLIWAG ], 25: [ Species.POLIWHIRL ] },
      Species.MAGIKARP,
      { 1: [ Species.MARILL ], 18: [ Species.AZUMARILL ] },
      { 1: [ Species.WINGULL ], 25: [ Species.PELIPPER ] },
      { 1: [ Species.BUIZEL ], 26: [ Species.FLOATZEL ] },
      { 1: [ Species.OSHAWOTT ], 17: [ Species.DEWOTT ], 36: [ Species.SAMUROTT ] }
    ],
    [PoolTier.UNCOMMON]: [
      { 1: [ Species.TENTACOOL ], 30: [ Species.TENTACRUEL ] },
      Species.SLOWPOKE,
      Species.SLOWBRO,
      Species.SHELLDER,
      { 1: [ Species.KRABBY ], 28: [ Species.KINGLER ] },
      { 1: [ Species.STARYU ], 20: [ Species.STARMIE ] },
      { 1: [ Species.WOOPER ], 20: [ Species.QUAGSIRE ] },
      { 1: [ Species.LOTAD ], 14: [ Species.LOMBRE ] },
      { 1: [ Species.SURSKIT ], 22: [ Species.MASQUERAIN ] },
      { 1: [ Species.CORPHISH ], 30: [ Species.CRAWDAUNT ] },
      { 1: [ Species.PANPOUR ], 20: [ Species.SIMIPOUR ] },
      { 1: [ Species.TIRTOUGA ], 37: [ Species.CARRACOSTA ] },
      { 1: [ Species.DUCKLETT ], 35: [ Species.SWANNA ] }
    ],
    [PoolTier.RARE]: [
      { 1: [ Species.SQUIRTLE ], 16: [ Species.WARTORTLE ], 36: [ Species.BLASTOISE ] },
      { 1: [ Species.TOTODILE ], 18: [ Species.CROCONAW ], 30: [ Species.FERALIGATR ] },
      { 1: [ Species.PIPLUP ], 16: [ Species.PRINPLUP ], 36: [ Species.EMPOLEON ] }
    ],
    [PoolTier.SUPER_RARE]: [ Species.VAPOREON, Species.POLITOED, Species.SLOWKING ],
    [PoolTier.ULTRA_RARE]: [ Species.SUICUNE, Species.UXIE, Species.MESPRIT, Species.AZELF ],
    [PoolTier.BOSS]: [ Species.GOLDUCK, Species.POLIWRATH, Species.SLOWBRO, Species.GYARADOS, Species.AZUMARILL, Species.PELIPPER, Species.MASQUERAIN, Species.FLOATZEL, Species.SIMIPOUR, Species.SWANNA ],
    [PoolTier.BOSS_RARE]: [ Species.BLASTOISE, Species.VAPOREON, Species.FERALIGATR, Species.POLITOED, Species.SLOWKING, Species.EMPOLEON, Species.SAMUROTT ],
    [PoolTier.BOSS_SUPER_RARE]: [ Species.SUICUNE, Species.UXIE, Species.MESPRIT, Species.AZELF ],
    [PoolTier.BOSS_ULTRA_RARE]: []
  },
  [Biome.SWAMP]: {
    [PoolTier.COMMON]: [
      { 1: [ Species.EKANS ], 22: [ Species.ARBOK ] },
      { 1: [ Species.GRIMER ], 38: [ Species.MUK ] },
      { 1: [ Species.KOFFING ], 35: [ Species.WEEZING ] },
      { 1: [ Species.WOOPER ], 20: [ Species.QUAGSIRE ] },
      { 1: [ Species.LOTAD ], 14: [ Species.LOMBRE ] },
      { 1: [ Species.GULPIN ], 26: [ Species.SWALOT ] },
      { 1: [ Species.BARBOACH ], 30: [ Species.WHISCASH ] },
      { 1: [ Species.SHELLOS ], 30: [ Species.GASTRODON ] },
      { 1: [ Species.TYMPOLE ], 25: [ Species.PALPITOAD ], 36: [ Species.SEISMITOAD ] }
    ],
    [PoolTier.UNCOMMON]: [
      Species.SLOWPOKE,
      Species.SLOWBRO,
      { 1: [ Species.SKORUPI ], 40: [ Species.DRAPION ] },
      { 1: [ Species.CROAGUNK ], 37: [ Species.TOXICROAK ] },
      { 1: [ Species.TRUBBISH ], 36: [ Species.GARBODOR ] },
      Species.STUNFISK
    ],
    [PoolTier.RARE]: [ { 1: [ Species.MUDKIP ], 16: [ Species.MARSHTOMP ], 36: [ Species.SWAMPERT ] }, { 1: [ Species.TIRTOUGA ], 37: [ Species.CARRACOSTA ] } ],
    [PoolTier.SUPER_RARE]: [],
    [PoolTier.ULTRA_RARE]: [ Species.KELDEO ],
    [PoolTier.BOSS]: [ Species.ARBOK, Species.WEEZING, Species.QUAGSIRE, Species.SWALOT, Species.WHISCASH, Species.GASTRODON, Species.SEISMITOAD, Species.GARBODOR, Species.STUNFISK ],
    [PoolTier.BOSS_RARE]: [ Species.SWAMPERT, Species.LUDICOLO ],
    [PoolTier.BOSS_SUPER_RARE]: [ Species.KELDEO ],
    [PoolTier.BOSS_ULTRA_RARE]: []
  },
  [Biome.SEA]: {
    [PoolTier.COMMON]: [
      { 1: [ Species.TENTACOOL ], 30: [ Species.TENTACRUEL ] },
      Species.SHELLDER,
      { 1: [ Species.KRABBY ], 28: [ Species.KINGLER ] },
      { 1: [ Species.HORSEA ], 32: [ Species.SEADRA ] },
      { 1: [ Species.GOLDEEN ], 33: [ Species.SEAKING ] },
      { 1: [ Species.STARYU ], 20: [ Species.STARMIE ] },
      Species.MAGIKARP,
      Species.REMORAID,
      { 1: [ Species.CARVANHA ], 30: [ Species.SHARPEDO ] },
      { 1: [ Species.CORPHISH ], 30: [ Species.CRAWDAUNT ] },
      Species.CLAMPERL,
      { 1: [ Species.FINNEON ], 31: [ Species.LUMINEON ] },
      Species.BASCULIN,
      { 1: [ Species.TIRTOUGA ], 37: [ Species.CARRACOSTA ] },
      { 1: [ Species.FRILLISH ], 40: [ Species.JELLICENT ] }
    ],
    [PoolTier.UNCOMMON]: [
      { 1: [ Species.CHINCHOU ], 27: [ Species.LANTURN ] },
      Species.QWILFISH,
      Species.WAILMER,
      { 1: [ Species.BARBOACH ], 30: [ Species.WHISCASH ] },
      Species.LUVDISC,
      { 1: [ Species.SHELLOS ], 30: [ Species.GASTRODON ] }
    ],
    [PoolTier.RARE]: [ Species.LAPRAS, Species.CORSOLA, Species.OCTILLERY, Species.MANTINE, Species.MANTYKE, Species.PHIONE, Species.ALOMOMOLA, { 1: [ Species.TYNAMO ], 39: [ Species.EELEKTRIK ] } ],
    [PoolTier.SUPER_RARE]: [ { 1: [ Species.OMANYTE ], 40: [ Species.OMASTAR ] }, { 1: [ Species.KABUTO ], 40: [ Species.KABUTOPS ] }, Species.KINGDRA, Species.WAILORD, Species.RELICANTH ],
    [PoolTier.ULTRA_RARE]: [ Species.FEEBAS, Species.MANAPHY ],
    [PoolTier.BOSS]: [
      Species.TENTACRUEL,
      Species.CLOYSTER,
      Species.KINGLER,
      Species.SEAKING,
      Species.STARMIE,
      Species.GYARADOS,
      Species.LANTURN,
      Species.QWILFISH,
      Species.CORSOLA,
      Species.OCTILLERY,
      Species.MANTINE,
      Species.SHARPEDO,
      Species.CRAWDAUNT,
      Species.HUNTAIL,
      Species.GOREBYSS,
      Species.LUVDISC,
      Species.LUMINEON,
      Species.CARRACOSTA,
      Species.JELLICENT,
      Species.ALOMOMOLA
    ],
    [PoolTier.BOSS_RARE]: [ Species.OMASTAR, Species.KABUTOPS, Species.KINGDRA, Species.WAILORD, Species.RELICANTH, Species.PHIONE, Species.EELEKTROSS ],
    [PoolTier.BOSS_SUPER_RARE]: [ Species.MILOTIC, Species.MANAPHY ],
    [PoolTier.BOSS_ULTRA_RARE]: [ Species.LUGIA, Species.KYOGRE ]
  },
  [Biome.MOUNTAIN]: {
    [PoolTier.COMMON]: [
      { 1: [ Species.PIDGEY ], 18: [ Species.PIDGEOTTO ], 36: [ Species.PIDGEOT ] },
      { 1: [ Species.SPEAROW ], 20: [ Species.FEAROW ] },
      { 1: [ Species.TAILLOW ], 22: [ Species.SWELLOW ] },
      { 1: [ Species.STARLY ], 14: [ Species.STARAVIA ], 34: [ Species.STARAPTOR ] },
      { 1: [ Species.PIDOVE ], 21: [ Species.TRANQUILL ], 32: [ Species.UNFEZANT ] }
    ],
    [PoolTier.UNCOMMON]: [
      { 1: [ Species.GEODUDE ], 25: [ Species.GRAVELER ] },
      { 1: [ Species.RHYHORN ], 42: [ Species.RHYDON ] },
      Species.NOSEPASS,
      { 1: [ Species.ARON ], 32: [ Species.LAIRON ], 42: [ Species.AGGRON ] },
      { 1: [ Species.SWABLU ], 35: [ Species.ALTARIA ] },
      { 1: [ Species.ROGGENROLA ], 25: [ Species.BOLDORE ] },
      { 1: [ Species.RUFFLET ], 54: [ Species.BRAVIARY ] },
      { 1: [ Species.VULLABY ], 54: [ Species.MANDIBUZZ ] }
    ],
    [PoolTier.RARE]: [ { 1: [ Species.MACHOP ], 28: [ Species.MACHOKE ] }, Species.MURKROW, { 1: [ Species.SLUGMA ], 38: [ Species.MAGCARGO ] }, Species.SKARMORY, { 1: [ Species.SPOINK ], 32: [ Species.GRUMPIG ] } ],
    [PoolTier.SUPER_RARE]: [
      { 1: [ Species.LARVITAR ], 30: [ Species.PUPITAR ] },
      { 1: [ Species.CRANIDOS ], 30: [ Species.RAMPARDOS ] },
      { 1: [ Species.SHIELDON ], 30: [ Species.BASTIODON ] },
      { 1: [ Species.GIBLE ], 24: [ Species.GABITE ], 48: [ Species.GARCHOMP ] },
      { 1: [ Species.AXEW ], 38: [ Species.FRAXURE ] }
    ],
    [PoolTier.ULTRA_RARE]: [ Species.REGISTEEL, Species.TORNADUS ],
    [PoolTier.BOSS]: [ Species.PIDGEOT, Species.FEAROW, Species.SKARMORY, Species.SWELLOW, Species.AGGRON, Species.STARAPTOR, Species.PROBOPASS, Species.UNFEZANT, Species.BRAVIARY, Species.MANDIBUZZ ],
    [PoolTier.BOSS_RARE]: [ Species.RAMPARDOS, Species.BASTIODON ],
    [PoolTier.BOSS_SUPER_RARE]: [ Species.REGISTEEL, Species.TORNADUS ],
    [PoolTier.BOSS_ULTRA_RARE]: [ Species.HO_OH, Species.RAYQUAZA ]
  },
  [Biome.LAND]: {
    [PoolTier.COMMON]: [
      { 1: [ Species.DIGLETT ], 26: [ Species.DUGTRIO ] },
      { 1: [ Species.GEODUDE ], 25: [ Species.GRAVELER ] },
      { 1: [ Species.RHYHORN ], 42: [ Species.RHYDON ] },
      { 1: [ Species.PHANPY ], 25: [ Species.DONPHAN ] },
      { 1: [ Species.DRILBUR ], 31: [ Species.EXCADRILL ] }
    ],
    [PoolTier.UNCOMMON]: [
      { 1: [ Species.SANDSHREW ], 22: [ Species.SANDSLASH ] },
      { 1: [ Species.CUBONE ], 28: [ Species.MAROWAK ] },
      Species.GLIGAR,
      { 1: [ Species.NUMEL ], 33: [ Species.CAMERUPT ] },
      { 1: [ Species.ROGGENROLA ], 25: [ Species.BOLDORE ] }
    ],
    [PoolTier.RARE]: [ Species.ONIX ],
    [PoolTier.SUPER_RARE]: [],
    [PoolTier.ULTRA_RARE]: [ Species.TERRAKION, Species.LANDORUS ],
    [PoolTier.BOSS]: [ Species.DUGTRIO, Species.GOLEM, Species.MAROWAK, Species.DONPHAN, Species.RHYPERIOR, Species.GLISCOR, Species.EXCADRILL ],
    [PoolTier.BOSS_RARE]: [ Species.STEELIX ],
    [PoolTier.BOSS_SUPER_RARE]: [ Species.TERRAKION, Species.LANDORUS ],
    [PoolTier.BOSS_ULTRA_RARE]: [ Species.GROUDON ]
  },
  [Biome.CAVE]: {
    [PoolTier.COMMON]: [
      { 1: [ Species.ZUBAT ], 22: [ Species.GOLBAT ] },
      { 1: [ Species.ROGGENROLA ], 25: [ Species.BOLDORE ] },
      { 1: [ Species.WOOBAT ], 20: [ Species.SWOOBAT ] },
      { 1: [ Species.DWEBBLE ], 34: [ Species.CRUSTLE ] }
    ],
    [PoolTier.UNCOMMON]: [ { 1: [ Species.GEODUDE ], 25: [ Species.GRAVELER ] }, Species.MAWILE ],
    [PoolTier.RARE]: [ Species.ONIX ],
    [PoolTier.SUPER_RARE]: [],
    [PoolTier.ULTRA_RARE]: [ Species.COBALION ],
    [PoolTier.BOSS]: [ Species.ONIX, Species.CROBAT, Species.MAWILE, Species.GIGALITH, Species.SWOOBAT, Species.CRUSTLE ],
    [PoolTier.BOSS_RARE]: [],
    [PoolTier.BOSS_SUPER_RARE]: [ Species.COBALION ],
    [PoolTier.BOSS_ULTRA_RARE]: []
  },
  [Biome.DESERT]: {
    [PoolTier.COMMON]: [
      { 1: [ Species.SANDSHREW ], 22: [ Species.SANDSLASH ] },
      Species.TRAPINCH,
      { 1: [ Species.CACNEA ], 32: [ Species.CACTURNE ] },
      { 1: [ Species.HIPPOPOTAS ], 34: [ Species.HIPPOWDON ] },
      { 1: [ Species.SKORUPI ], 40: [ Species.DRAPION ] },
      { 1: [ Species.SANDILE ], 29: [ Species.KROKOROK ], 40: [ Species.KROOKODILE ] },
      Species.MARACTUS
    ],
    [PoolTier.UNCOMMON]: [ { 1: [ Species.BALTOY ], 36: [ Species.CLAYDOL ] } ],
    [PoolTier.RARE]: [ { 1: [ Species.VIBRAVA ], 45: [ Species.FLYGON ] }, { 1: [ Species.DARUMAKA ], 35: [ Species.DARMANITAN ] }, { 1: [ Species.YAMASK ], 34: [ Species.COFAGRIGUS ] } ],
    [PoolTier.SUPER_RARE]: [ { 1: [ Species.LILEEP ], 40: [ Species.CRADILY ] }, { 1: [ Species.ANORITH ], 40: [ Species.ARMALDO ] } ],
    [PoolTier.ULTRA_RARE]: [ Species.REGIROCK ],
    [PoolTier.BOSS]: [ Species.SANDSLASH, Species.CACTURNE, Species.HIPPOWDON, Species.DRAPION, Species.KROOKODILE, Species.DARMANITAN, Species.MARACTUS ],
    [PoolTier.BOSS_RARE]: [ Species.CRADILY, Species.ARMALDO ],
    [PoolTier.BOSS_SUPER_RARE]: [ Species.REGIROCK ],
    [PoolTier.BOSS_ULTRA_RARE]: []
  },
  [Biome.ICE_CAVE]: {
    [PoolTier.COMMON]: [
      { 1: [ Species.SEEL ], 34: [ Species.DEWGONG ] },
      { 1: [ Species.SPHEAL ], 32: [ Species.SEALEO ], 44: [ Species.WALREIN ] },
      { 1: [ Species.SNOVER ], 40: [ Species.ABOMASNOW ] },
      { 1: [ Species.VANILLITE ], 35: [ Species.VANILLISH ], 47: [ Species.VANILLUXE ] },
      { 1: [ Species.CUBCHOO ], 37: [ Species.BEARTIC ] }
    ],
    [PoolTier.UNCOMMON]: [ Species.SNEASEL, { 1: [ Species.SWINUB ], 33: [ Species.PILOSWINE ] }, { 1: [ Species.SNORUNT ], 42: [ Species.GLALIE ] } ],
    [PoolTier.RARE]: [ Species.JYNX, Species.FROSLASS, Species.CRYOGONAL ],
    [PoolTier.SUPER_RARE]: [ Species.DELIBIRD ],
    [PoolTier.ULTRA_RARE]: [ Species.REGICE ],
    [PoolTier.BOSS]: [ Species.DEWGONG, Species.GLALIE, Species.WALREIN, Species.ABOMASNOW, Species.WEAVILE, Species.MAMOSWINE, Species.FROSLASS, Species.VANILLUXE, Species.BEARTIC, Species.CRYOGONAL ],
    [PoolTier.BOSS_RARE]: [ Species.JYNX, Species.GLACEON ],
    [PoolTier.BOSS_SUPER_RARE]: [ Species.ARTICUNO, Species.REGICE ],
    [PoolTier.BOSS_ULTRA_RARE]: [ Species.KYUREM ]
  },
  [Biome.MEADOW]: {
    [PoolTier.COMMON]: [ { 1: [ Species.JIGGLYPUFF ], 30: [ Species.WIGGLYTUFF ] }, { 1: [ Species.SNUBBULL ], 23: [ Species.GRANBULL ] }, { 1: [ Species.COTTONEE ], 20: [ Species.WHIMSICOTT ] } ],
    [PoolTier.UNCOMMON]: [ Species.CLEFAIRY, Species.TAUROS, Species.TOGETIC, Species.MILTANK, { 1: [ Species.RALTS ], 20: [ Species.KIRLIA ], 30: [ Species.GARDEVOIR ] }, Species.MINCCINO, Species.BOUFFALANT ],
    [PoolTier.RARE]: [ Species.EEVEE ],
    [PoolTier.SUPER_RARE]: [ Species.CHANSEY ],
    [PoolTier.ULTRA_RARE]: [ Species.LATIAS, Species.LATIOS, Species.MELOETTA ],
    [PoolTier.BOSS]: [ Species.WIGGLYTUFF, Species.TAUROS, Species.GRANBULL, Species.MILTANK, Species.GARDEVOIR, Species.TOGEKISS, Species.BOUFFALANT ],
    [PoolTier.BOSS_RARE]: [ Species.CLEFABLE, Species.BLISSEY ],
    [PoolTier.BOSS_SUPER_RARE]: [ Species.LATIAS, Species.LATIOS, Species.MELOETTA ],
    [PoolTier.BOSS_ULTRA_RARE]: []
  },
  [Biome.POWER_PLANT]: {
    [PoolTier.COMMON]: [
      Species.PIKACHU,
      { 1: [ Species.MAGNEMITE ], 30: [ Species.MAGNETON ] },
      { 1: [ Species.VOLTORB ], 30: [ Species.ELECTRODE ] },
      { 1: [ Species.ELECTRIKE ], 26: [ Species.MANECTRIC ] },
      { 1: [ Species.SHINX ], 15: [ Species.LUXIO ], 30: [ Species.LUXRAY ] }
    ],
    [PoolTier.UNCOMMON]: [ Species.ELECTABUZZ, Species.PLUSLE, Species.MINUN, Species.PACHIRISU, Species.EMOLGA ],
    [PoolTier.RARE]: [],
    [PoolTier.SUPER_RARE]: [ Species.JOLTEON ],
    [PoolTier.ULTRA_RARE]: [ Species.RAIKOU, Species.ROTOM, Species.THUNDURUS ],
    [PoolTier.BOSS]: [ Species.RAICHU, Species.MANECTRIC, Species.LUXRAY, Species.MAGNEZONE, Species.ELECTIVIRE ],
    [PoolTier.BOSS_RARE]: [ Species.JOLTEON ],
    [PoolTier.BOSS_SUPER_RARE]: [ Species.ZAPDOS, Species.RAIKOU, Species.ROTOM, Species.THUNDURUS ],
    [PoolTier.BOSS_ULTRA_RARE]: [ Species.ZEKROM ]
  },
  [Biome.VOLCANO]: {
    [PoolTier.COMMON]: [ Species.VULPIX, Species.GROWLITHE, { 1: [ Species.PONYTA ], 40: [ Species.RAPIDASH ] }, { 1: [ Species.SLUGMA ], 38: [ Species.MAGCARGO ] }, { 1: [ Species.NUMEL ], 33: [ Species.CAMERUPT ] } ],
    [PoolTier.UNCOMMON]: [ Species.MAGMAR, Species.TORKOAL, { 1: [ Species.PANSEAR ], 20: [ Species.SIMISEAR ] }, Species.HEATMOR ],
    [PoolTier.RARE]: [
      { 1: [ Species.CHARMANDER ], 16: [ Species.CHARMELEON ], 36: [ Species.CHARIZARD ] },
      { 1: [ Species.CYNDAQUIL ], 14: [ Species.QUILAVA ], 36: [ Species.TYPHLOSION ] },
      { 1: [ Species.TORCHIC ], 16: [ Species.COMBUSKEN ], 36: [ Species.BLAZIKEN ] },
      { 1: [ Species.CHIMCHAR ], 14: [ Species.MONFERNO ], 36: [ Species.INFERNAPE ] },
      { 1: [ Species.TEPIG ], 17: [ Species.PIGNITE ], 36: [ Species.EMBOAR ] }
    ],
    [PoolTier.SUPER_RARE]: [ Species.FLAREON, { 1: [ Species.LARVESTA ], 59: [ Species.VOLCARONA ] } ],
    [PoolTier.ULTRA_RARE]: [ Species.ENTEI, Species.HEATRAN ],
    [PoolTier.BOSS]: [ Species.NINETALES, Species.ARCANINE, Species.RAPIDASH, Species.MAGCARGO, Species.CAMERUPT, Species.TORKOAL, Species.MAGMORTAR, Species.SIMISEAR, Species.HEATMOR ],
    [PoolTier.BOSS_RARE]: [ Species.CHARIZARD, Species.FLAREON, Species.TYPHLOSION, Species.BLAZIKEN, Species.INFERNAPE, Species.EMBOAR, Species.VOLCARONA ],
    [PoolTier.BOSS_SUPER_RARE]: [ Species.MOLTRES, Species.ENTEI, Species.HEATRAN ],
    [PoolTier.BOSS_ULTRA_RARE]: [ Species.RESHIRAM ]
  },
  [Biome.GRAVEYARD]: {
    [PoolTier.COMMON]: [
      { 1: [ Species.GASTLY ], 25: [ Species.HAUNTER ] },
      { 1: [ Species.SHUPPET ], 37: [ Species.BANETTE ] },
      { 1: [ Species.DUSKULL ], 37: [ Species.DUSCLOPS ] },
      { 1: [ Species.YAMASK ], 34: [ Species.COFAGRIGUS ] }
    ],
    [PoolTier.UNCOMMON]: [
      { 1: [ Species.CUBONE ], 28: [ Species.MAROWAK ] },
      Species.MISDREAVUS,
      { 1: [ Species.DRIFLOON ], 28: [ Species.DRIFBLIM ] },
      { 1: [ Species.LITWICK ], 41: [ Species.LAMPENT ] },
      { 1: [ Species.GOLETT ], 43: [ Species.GOLURK ] }
    ],
    [PoolTier.RARE]: [],
    [PoolTier.SUPER_RARE]: [ Species.SPIRITOMB ],
    [PoolTier.ULTRA_RARE]: [],
    [PoolTier.BOSS]: [ Species.GENGAR, Species.BANETTE, Species.DRIFBLIM, Species.MISMAGIUS, Species.DUSKNOIR, Species.COFAGRIGUS, Species.CHANDELURE, Species.GOLURK ],
    [PoolTier.BOSS_RARE]: [],
    [PoolTier.BOSS_SUPER_RARE]: [],
    [PoolTier.BOSS_ULTRA_RARE]: [ Species.GIRATINA ]
  },
  [Biome.DOJO]: {
    [PoolTier.COMMON]: [
      { 1: [ Species.MANKEY ], 28: [ Species.PRIMEAPE ] },
      { 1: [ Species.MACHOP ], 28: [ Species.MACHOKE ] },
      { 1: [ Species.MAKUHITA ], 24: [ Species.HARIYAMA ] },
      { 1: [ Species.MEDITITE ], 37: [ Species.MEDICHAM ] },
      { 1: [ Species.TIMBURR ], 25: [ Species.GURDURR ] }
    ],
    [PoolTier.UNCOMMON]: [ { 1: [ Species.CROAGUNK ], 37: [ Species.TOXICROAK ] }, { 1: [ Species.SCRAGGY ], 39: [ Species.SCRAFTY ] }, { 1: [ Species.MIENFOO ], 50: [ Species.MIENSHAO ] } ],
    [PoolTier.RARE]: [ { 1: [ Species.TYROGUE ], 20: [ Species.HITMONLEE, Species.HITMONCHAN ] }, Species.LUCARIO, Species.THROH, Species.SAWK ],
    [PoolTier.SUPER_RARE]: [ Species.HITMONTOP, Species.GALLADE ],
    [PoolTier.ULTRA_RARE]: [ Species.COBALION, Species.TERRAKION, Species.VIRIZION, Species.KELDEO ],
    [PoolTier.BOSS]: [ Species.PRIMEAPE, Species.MACHAMP, Species.HITMONLEE, Species.HITMONCHAN, Species.HARIYAMA, Species.MEDICHAM, Species.LUCARIO, Species.TOXICROAK, Species.CONKELDURR, Species.THROH, Species.SAWK, Species.SCRAFTY, Species.MIENSHAO ],
    [PoolTier.BOSS_RARE]: [ Species.HITMONTOP, Species.GALLADE ],
    [PoolTier.BOSS_SUPER_RARE]: [ Species.COBALION, Species.TERRAKION, Species.VIRIZION, Species.KELDEO ],
    [PoolTier.BOSS_ULTRA_RARE]: []
  },
  [Biome.RUINS]: {
    [PoolTier.COMMON]: [
      { 1: [ Species.DROWZEE ], 26: [ Species.HYPNO ] },
      { 1: [ Species.NATU ], 25: [ Species.XATU ] },
      Species.UNOWN,
      { 1: [ Species.BALTOY ], 36: [ Species.CLAYDOL ] },
      { 1: [ Species.KLINK ], 38: [ Species.KLANG ], 49: [ Species.KLINKLANG ] }
    ],
    [PoolTier.UNCOMMON]: [
      { 1: [ Species.ABRA ], 16: [ Species.KADABRA ] },
      { 1: [ Species.SPOINK ], 32: [ Species.GRUMPIG ] },
      { 1: [ Species.CHINGLING ], 20: [ Species.CHIMECHO ] },
      { 1: [ Species.BRONZOR ], 33: [ Species.BRONZONG ] },
      Species.SIGILYPH,
      { 1: [ Species.ELGYEM ], 42: [ Species.BEHEEYEM ] }
    ],
    [PoolTier.RARE]: [ Species.MR_MIME, Species.WOBBUFFET, { 1: [ Species.GOTHITA ], 32: [ Species.GOTHORITA ], 41: [ Species.GOTHITELLE ] } ],
    [PoolTier.SUPER_RARE]: [ Species.ESPEON, { 1: [ Species.ARCHEN ], 37: [ Species.ARCHEOPS ] } ],
    [PoolTier.ULTRA_RARE]: [ Species.VICTINI ],
    [PoolTier.BOSS]: [ Species.ALAKAZAM, Species.HYPNO, Species.XATU, Species.GRUMPIG, Species.CLAYDOL, Species.SIGILYPH, Species.GOTHITELLE, Species.KLINKLANG ],
    [PoolTier.BOSS_RARE]: [ Species.MR_MIME, Species.ESPEON, Species.WOBBUFFET, Species.ARCHEOPS ],
    [PoolTier.BOSS_SUPER_RARE]: [ Species.VICTINI ],
    [PoolTier.BOSS_ULTRA_RARE]: [ Species.MEWTWO, Species.REGIGIGAS ]
  },
  [Biome.WASTELAND]: {
    [PoolTier.COMMON]: [ Species.ALTARIA ],
    [PoolTier.UNCOMMON]: [
      { 1: [ Species.LARVITAR ], 30: [ Species.PUPITAR ] },
      { 1: [ Species.VIBRAVA ], 45: [ Species.FLYGON ] },
      { 1: [ Species.BAGON ], 30: [ Species.SHELGON ], 50: [ Species.SALAMENCE ] },
      { 1: [ Species.GIBLE ], 24: [ Species.GABITE ], 48: [ Species.GARCHOMP ] },
      { 1: [ Species.AXEW ], 38: [ Species.FRAXURE ] }
    ],
    [PoolTier.RARE]: [ { 1: [ Species.DRATINI ], 30: [ Species.DRAGONAIR ], 55: [ Species.DRAGONITE ] }, { 1: [ Species.DEINO ], 50: [ Species.ZWEILOUS ], 64: [ Species.HYDREIGON ] } ],
    [PoolTier.SUPER_RARE]: [ Species.AERODACTYL, Species.DRUDDIGON ],
    [PoolTier.ULTRA_RARE]: [],
    [PoolTier.BOSS]: [ Species.DRAGONITE, Species.TYRANITAR, Species.FLYGON, Species.ALTARIA, Species.SALAMENCE, Species.GARCHOMP, Species.HAXORUS ],
    [PoolTier.BOSS_RARE]: [ Species.AERODACTYL, Species.DRUDDIGON ],
    [PoolTier.BOSS_SUPER_RARE]: [],
    [PoolTier.BOSS_ULTRA_RARE]: [ Species.DIALGA ]
  },
  [Biome.ABYSS]: {
    [PoolTier.COMMON]: [ { 1: [ Species.HOUNDOUR ], 24: [ Species.HOUNDOOM ] }, { 1: [ Species.POOCHYENA ], 18: [ Species.MIGHTYENA ] }, Species.SABLEYE, { 1: [ Species.PURRLOIN ], 20: [ Species.LIEPARD ] } ],
    [PoolTier.UNCOMMON]: [ Species.MURKROW, { 1: [ Species.PAWNIARD ], 52: [ Species.BISHARP ] }, { 1: [ Species.DEINO ], 50: [ Species.ZWEILOUS ], 64: [ Species.HYDREIGON ] } ],
    [PoolTier.RARE]: [ Species.ABSOL, Species.SPIRITOMB, { 1: [ Species.ZORUA ], 30: [ Species.ZOROARK ] } ],
    [PoolTier.SUPER_RARE]: [ Species.UMBREON ],
    [PoolTier.ULTRA_RARE]: [ Species.DARKRAI ],
    [PoolTier.BOSS]: [ Species.HOUNDOOM, Species.MIGHTYENA, Species.SABLEYE, Species.ABSOL, Species.HONCHKROW, Species.SPIRITOMB, Species.LIEPARD, Species.ZOROARK, Species.BISHARP, Species.HYDREIGON ],
    [PoolTier.BOSS_RARE]: [ Species.UMBREON ],
    [PoolTier.BOSS_SUPER_RARE]: [ Species.DARKRAI ],
    [PoolTier.BOSS_ULTRA_RARE]: [ Species.PALKIA ]
  },
  [Biome.SPACE]: {
    [PoolTier.COMMON]: [
      Species.CLEFAIRY,
      Species.LUNATONE,
      Species.SOLROCK,
      Species.BALTOY,
      { 1: [ Species.CHINGLING ], 20: [ Species.CHIMECHO ] },
      { 1: [ Species.BRONZOR ], 33: [ Species.BRONZONG ] },
      { 1: [ Species.MUNNA ], 30: [ Species.MUSHARNA ] },
      { 1: [ Species.ELGYEM ], 42: [ Species.BEHEEYEM ] }
    ],
    [PoolTier.UNCOMMON]: [ Species.CLAYDOL ],
    [PoolTier.RARE]: [ { 1: [ Species.BELDUM ], 20: [ Species.METANG ], 45: [ Species.METAGROSS ] }, Species.SIGILYPH, { 1: [ Species.SOLOSIS ], 32: [ Species.DUOSION ], 41: [ Species.REUNICLUS ] } ],
    [PoolTier.SUPER_RARE]: [ { 1: [ Species.PORYGON ], 20: [ Species.PORYGON2 ] } ],
    [PoolTier.ULTRA_RARE]: [ Species.MEW, Species.JIRACHI, Species.DEOXYS, Species.CRESSELIA, Species.GENESECT ],
    [PoolTier.BOSS]: [ Species.CLEFABLE, Species.LUNATONE, Species.SOLROCK, Species.CHIMECHO, Species.BRONZONG, Species.MUSHARNA, Species.REUNICLUS, Species.BEHEEYEM ],
    [PoolTier.BOSS_RARE]: [ Species.METAGROSS ],
    [PoolTier.BOSS_SUPER_RARE]: [ Species.MEW, Species.JIRACHI, Species.DEOXYS, Species.PORYGON_Z, Species.CRESSELIA, Species.GENESECT ],
    [PoolTier.BOSS_ULTRA_RARE]: [ Species.ARCEUS ]
  }
};

{
  const pokemonBiomes = [
    [ Species.BULBASAUR, Type.GRASS, Type.POISON, [
        [ Biome.FOREST, PoolTier.RARE ]
      ]
    ],
    [ Species.IVYSAUR, Type.GRASS, Type.POISON, [
        [ Biome.FOREST, PoolTier.RARE ]
      ]
    ],
    [ Species.VENUSAUR, Type.GRASS, Type.POISON, [
        [ Biome.FOREST, PoolTier.RARE ],
        [ Biome.GRASS, PoolTier.BOSS_RARE ]
      ]
    ],
    [ Species.CHARMANDER, Type.FIRE, -1, [
        [ Biome.VOLCANO, PoolTier.RARE ]
      ]
    ],
    [ Species.CHARMELEON, Type.FIRE, -1, [
        [ Biome.VOLCANO, PoolTier.RARE ]
      ]
    ],
    [ Species.CHARIZARD, Type.FIRE, Type.FLYING, [
        [ Biome.VOLCANO, PoolTier.RARE ],
        [ Biome.VOLCANO, PoolTier.BOSS_RARE ]
      ]
    ],
    [ Species.SQUIRTLE, Type.WATER, -1, [
        [ Biome.WATER, PoolTier.RARE ]
      ]
    ],
    [ Species.WARTORTLE, Type.WATER, -1, [
        [ Biome.WATER, PoolTier.RARE ]
      ]
    ],
    [ Species.BLASTOISE, Type.WATER, -1, [
        [ Biome.WATER, PoolTier.RARE ],
        [ Biome.WATER, PoolTier.BOSS_RARE ]
      ]
    ],
    [ Species.CATERPIE, Type.BUG, -1, [
        [ Biome.PLAINS, PoolTier.COMMON ],
        [ Biome.FOREST, PoolTier.COMMON ]
      ]
    ],
    [ Species.METAPOD, Type.BUG, -1, [
        [ Biome.PLAINS, PoolTier.COMMON ],
        [ Biome.FOREST, PoolTier.COMMON ]
      ]
    ],
    [ Species.BUTTERFREE, Type.BUG, Type.FLYING, [
        [ Biome.FOREST, PoolTier.UNCOMMON ],
        [ Biome.FOREST, PoolTier.BOSS ]
      ]
    ],
    [ Species.WEEDLE, Type.BUG, Type.POISON, [
        [ Biome.PLAINS, PoolTier.COMMON ],
        [ Biome.FOREST, PoolTier.COMMON ]
      ]
    ],
    [ Species.KAKUNA, Type.BUG, Type.POISON, [
        [ Biome.PLAINS, PoolTier.COMMON ],
        [ Biome.FOREST, PoolTier.COMMON ]
      ]
    ],
    [ Species.BEEDRILL, Type.BUG, Type.POISON, [
        [ Biome.FOREST, PoolTier.UNCOMMON ],
        [ Biome.FOREST, PoolTier.BOSS ]
      ]
    ],
    [ Species.PIDGEY, Type.NORMAL, Type.FLYING, [
        [ Biome.PLAINS, PoolTier.COMMON ],
        [ Biome.GRASS, PoolTier.COMMON ],
        [ Biome.MOUNTAIN, PoolTier.COMMON ]
      ]
    ],
    [ Species.PIDGEOTTO, Type.NORMAL, Type.FLYING, [
        [ Biome.GRASS, PoolTier.COMMON ],
        [ Biome.MOUNTAIN, PoolTier.COMMON ]
      ]
    ],
    [ Species.PIDGEOT, Type.NORMAL, Type.FLYING, [
        [ Biome.GRASS, PoolTier.COMMON ],
        [ Biome.MOUNTAIN, PoolTier.COMMON ],
        [ Biome.MOUNTAIN, PoolTier.BOSS ]
      ]
    ],
    [ Species.RATTATA, Type.NORMAL, -1, [
        [ Biome.PLAINS, PoolTier.COMMON ],
        [ Biome.GRASS, PoolTier.COMMON ]
      ]
    ],
    [ Species.RATICATE, Type.NORMAL, -1, [
        [ Biome.GRASS, PoolTier.COMMON ]
      ]
    ],
    [ Species.SPEAROW, Type.NORMAL, Type.FLYING, [
        [ Biome.PLAINS, PoolTier.COMMON ],
        [ Biome.GRASS, PoolTier.COMMON ],
        [ Biome.MOUNTAIN, PoolTier.COMMON ]
      ]
    ],
    [ Species.FEAROW, Type.NORMAL, Type.FLYING, [
        [ Biome.GRASS, PoolTier.COMMON ],
        [ Biome.MOUNTAIN, PoolTier.COMMON ],
        [ Biome.MOUNTAIN, PoolTier.BOSS ]
      ]
    ],
    [ Species.EKANS, Type.POISON, -1, [
        [ Biome.PLAINS, PoolTier.UNCOMMON ],
        [ Biome.FOREST, PoolTier.UNCOMMON ],
        [ Biome.SWAMP, PoolTier.COMMON ]
      ]
    ],
    [ Species.ARBOK, Type.POISON, -1, [
        [ Biome.FOREST, PoolTier.UNCOMMON ],
        [ Biome.SWAMP, PoolTier.COMMON ],
        [ Biome.SWAMP, PoolTier.BOSS ]
      ]
    ],
    [ Species.PIKACHU, Type.ELECTRIC, -1, [
        [ Biome.GRASS, PoolTier.UNCOMMON ],
        [ Biome.POWER_PLANT, PoolTier.COMMON ]
      ]
    ],
    [ Species.RAICHU, Type.ELECTRIC, -1, [
        [ Biome.POWER_PLANT, PoolTier.BOSS ],
      ]
    ],
    [ Species.SANDSHREW, Type.GROUND, -1, [
        [ Biome.LAND, PoolTier.UNCOMMON ],
        [ Biome.DESERT, PoolTier.COMMON ]
      ]
    ],
    [ Species.SANDSLASH, Type.GROUND, -1, [
        [ Biome.LAND, PoolTier.UNCOMMON ],
        [ Biome.DESERT, PoolTier.COMMON ],
        [ Biome.DESERT, PoolTier.BOSS ]
      ]
    ],
    [ Species.NIDORAN_F, Type.POISON, -1, [
        [ Biome.PLAINS, PoolTier.UNCOMMON ],
        [ Biome.FOREST, PoolTier.COMMON ]
      ]
    ],
    [ Species.NIDORINA, Type.POISON, -1, [
        [ Biome.FOREST, PoolTier.COMMON ]
      ]
    ],
    [ Species.NIDOQUEEN, Type.POISON, Type.GROUND, [
        [ Biome.FOREST, PoolTier.BOSS ]
      ]
    ],
    [ Species.NIDORAN_M, Type.POISON, -1, [
        [ Biome.PLAINS, PoolTier.UNCOMMON ],
        [ Biome.FOREST, PoolTier.COMMON ]
      ]
    ],
    [ Species.NIDORINO, Type.POISON, -1, [
        [ Biome.FOREST, PoolTier.COMMON ]
      ]
    ],
    [ Species.NIDOKING, Type.POISON, Type.GROUND, [
        [ Biome.FOREST, PoolTier.BOSS ]
      ]
    ],
    [ Species.CLEFAIRY, Type.FAIRY, -1, [
        [ Biome.GRASS, PoolTier.RARE ],
        [ Biome.MEADOW, PoolTier.UNCOMMON ],
        [ Biome.SPACE, PoolTier.COMMON ]
      ]
    ],
    [ Species.CLEFABLE, Type.FAIRY, -1, [
        [ Biome.MEADOW, PoolTier.BOSS_RARE ],
        [ Biome.SPACE, PoolTier.BOSS ],
      ]
    ],
    [ Species.VULPIX, Type.FIRE, -1, [
        [ Biome.GRASS, PoolTier.RARE ],
        [ Biome.VOLCANO, PoolTier.COMMON ]
      ]
    ],
    [ Species.NINETALES, Type.FIRE, -1, [
        [ Biome.VOLCANO, PoolTier.BOSS ]
      ]
    ],
    [ Species.JIGGLYPUFF, Type.NORMAL, Type.FAIRY, [
        [ Biome.GRASS, PoolTier.UNCOMMON ],
        [ Biome.MEADOW, PoolTier.COMMON ]
      ]
    ],
    [ Species.WIGGLYTUFF, Type.NORMAL, Type.FAIRY, [
        [ Biome.GRASS, PoolTier.UNCOMMON ],
        [ Biome.MEADOW, PoolTier.COMMON ],
        [ Biome.MEADOW, PoolTier.BOSS ]
      ]
    ],
    [ Species.ZUBAT, Type.POISON, Type.FLYING, [
        [ Biome.FOREST, PoolTier.UNCOMMON ],
        [ Biome.CAVE, PoolTier.COMMON ]
      ]
    ],
    [ Species.GOLBAT, Type.POISON, Type.FLYING, [
        [ Biome.FOREST, PoolTier.UNCOMMON ],
        [ Biome.CAVE, PoolTier.COMMON ]
      ]
    ],
    [ Species.ODDISH, Type.GRASS, Type.POISON, [
        [ Biome.PLAINS, PoolTier.UNCOMMON ],
        [ Biome.GRASS, PoolTier.COMMON ],
        [ Biome.FOREST, PoolTier.COMMON ]
      ]
    ],
    [ Species.GLOOM, Type.GRASS, Type.POISON, [
        [ Biome.GRASS, PoolTier.COMMON ],
        [ Biome.FOREST, PoolTier.COMMON ]
      ]
    ],
    [ Species.VILEPLUME, Type.GRASS, Type.POISON, [
        [ Biome.GRASS, PoolTier.COMMON ],
        [ Biome.FOREST, PoolTier.COMMON ],
        [ Biome.FOREST, PoolTier.BOSS ]
      ]
    ],
    [ Species.PARAS, Type.BUG, Type.GRASS, [
        [ Biome.PLAINS, PoolTier.UNCOMMON ],
        [ Biome.FOREST, PoolTier.COMMON ]
      ]
    ],
    [ Species.PARASECT, Type.BUG, Type.GRASS, [
        [ Biome.FOREST, PoolTier.COMMON ],
        [ Biome.FOREST, PoolTier.BOSS ]
      ]
    ],
    [ Species.VENONAT, Type.BUG, Type.POISON, [
        [ Biome.PLAINS, PoolTier.UNCOMMON ],
        [ Biome.GRASS, PoolTier.UNCOMMON ],
        [ Biome.FOREST, PoolTier.COMMON ]
      ]
    ],
    [ Species.VENOMOTH, Type.BUG, Type.POISON, [
        [ Biome.GRASS, PoolTier.UNCOMMON ],
        [ Biome.FOREST, PoolTier.COMMON ],
        [ Biome.FOREST, PoolTier.BOSS ]
      ]
    ],
    [ Species.DIGLETT, Type.GROUND, -1, [
        [ Biome.LAND, PoolTier.COMMON ]
      ]
    ],
    [ Species.DUGTRIO, Type.GROUND, -1, [
        [ Biome.LAND, PoolTier.COMMON ],
        [ Biome.LAND, PoolTier.BOSS ]
      ]
    ],
    [ Species.MEOWTH, Type.NORMAL, -1, [
        [ Biome.PLAINS, PoolTier.UNCOMMON ],
        [ Biome.GRASS, PoolTier.COMMON ]
      ]
    ],
    [ Species.PERSIAN, Type.NORMAL, -1, [
        [ Biome.GRASS, PoolTier.COMMON ],
        [ Biome.GRASS, PoolTier.BOSS ]
      ]
    ],
    [ Species.PSYDUCK, Type.WATER, -1, [
        [ Biome.WATER, PoolTier.COMMON ]
      ]
    ],
    [ Species.GOLDUCK, Type.WATER, -1, [
        [ Biome.WATER, PoolTier.COMMON ],
        [ Biome.WATER, PoolTier.BOSS ]
      ]
    ],
    [ Species.MANKEY, Type.FIGHTING, -1, [
        [ Biome.GRASS, PoolTier.UNCOMMON ],
        [ Biome.DOJO, PoolTier.COMMON ]
      ]
    ],
    [ Species.PRIMEAPE, Type.FIGHTING, -1, [
        [ Biome.GRASS, PoolTier.UNCOMMON ],
        [ Biome.DOJO, PoolTier.COMMON ],
        [ Biome.DOJO, PoolTier.BOSS ]
      ]
    ],
    [ Species.GROWLITHE, Type.FIRE, -1, [
        [ Biome.GRASS, PoolTier.RARE ],
        [ Biome.VOLCANO, PoolTier.COMMON ]
      ]
    ],
    [ Species.ARCANINE, Type.FIRE, -1, [
        [ Biome.VOLCANO, PoolTier.BOSS ]
      ]
    ],
    [ Species.POLIWAG, Type.WATER, -1, [
        [ Biome.WATER, PoolTier.COMMON ]
      ]
    ],
    [ Species.POLIWHIRL, Type.WATER, -1, [
        [ Biome.WATER, PoolTier.COMMON ]
      ]
    ],
    [ Species.POLIWRATH, Type.WATER, Type.FIGHTING, [
        [ Biome.WATER, PoolTier.BOSS ]
      ]
    ],
    [ Species.ABRA, Type.PSYCHIC, -1, [
        [ Biome.PLAINS, PoolTier.RARE ],
        [ Biome.GRASS, PoolTier.RARE ],
        [ Biome.RUINS, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.KADABRA, Type.PSYCHIC, -1, [
        [ Biome.GRASS, PoolTier.RARE ],
        [ Biome.RUINS, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.ALAKAZAM, Type.PSYCHIC, -1, [
        [ Biome.RUINS, PoolTier.BOSS ]
      ]
    ],
    [ Species.MACHOP, Type.FIGHTING, -1, [
        [ Biome.MOUNTAIN, PoolTier.RARE ],
        [ Biome.DOJO, PoolTier.COMMON ]
      ]
    ],
    [ Species.MACHOKE, Type.FIGHTING, -1, [
        [ Biome.MOUNTAIN, PoolTier.RARE ],
        [ Biome.DOJO, PoolTier.COMMON ]
      ]
    ],
    [ Species.MACHAMP, Type.FIGHTING, -1, [
        [ Biome.DOJO, PoolTier.BOSS ]
      ]
    ],
    [ Species.BELLSPROUT, Type.GRASS, Type.POISON, [
        [ Biome.PLAINS, PoolTier.UNCOMMON ],
        [ Biome.GRASS, PoolTier.COMMON ],
        [ Biome.FOREST, PoolTier.COMMON ]
      ]
    ],
    [ Species.WEEPINBELL, Type.GRASS, Type.POISON, [
        [ Biome.GRASS, PoolTier.COMMON ],
        [ Biome.FOREST, PoolTier.COMMON ]
      ]
    ],
    [ Species.VICTREEBEL, Type.GRASS, Type.POISON, [
        [ Biome.FOREST, PoolTier.BOSS ]
      ]
    ],
    [ Species.TENTACOOL, Type.WATER, Type.POISON, [
        [ Biome.WATER, PoolTier.UNCOMMON ],
        [ Biome.SEA, PoolTier.COMMON ]
      ]
    ],
    [ Species.TENTACRUEL, Type.WATER, Type.POISON, [
        [ Biome.WATER, PoolTier.UNCOMMON ],
        [ Biome.SEA, PoolTier.COMMON ],
        [ Biome.SEA, PoolTier.BOSS ]
      ]
    ],
    [ Species.GEODUDE, Type.ROCK, Type.GROUND, [
        [ Biome.MOUNTAIN, PoolTier.UNCOMMON ],
        [ Biome.LAND, PoolTier.COMMON ],
        [ Biome.CAVE, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.GRAVELER, Type.ROCK, Type.GROUND, [
        [ Biome.MOUNTAIN, PoolTier.UNCOMMON ],
        [ Biome.LAND, PoolTier.COMMON ],
        [ Biome.CAVE, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.GOLEM, Type.ROCK, Type.GROUND, [
        [ Biome.LAND, PoolTier.BOSS ]
      ]
    ],
    [ Species.PONYTA, Type.FIRE, -1, [
        [ Biome.GRASS, PoolTier.UNCOMMON ],
        [ Biome.VOLCANO, PoolTier.COMMON ]
      ]
    ],
    [ Species.RAPIDASH, Type.FIRE, -1, [
        [ Biome.GRASS, PoolTier.UNCOMMON ],
        [ Biome.VOLCANO, PoolTier.COMMON ],
        [ Biome.VOLCANO, PoolTier.BOSS ]
      ]
    ],
    [ Species.SLOWPOKE, Type.WATER, Type.PSYCHIC, [
        [ Biome.WATER, PoolTier.UNCOMMON ],
        [ Biome.SWAMP, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.SLOWBRO, Type.WATER, Type.PSYCHIC, [
        [ Biome.WATER, PoolTier.UNCOMMON ],
        [ Biome.WATER, PoolTier.BOSS ],
        [ Biome.SWAMP, PoolTier.UNCOMMON ],
      ]
    ],
    [ Species.MAGNEMITE, Type.ELECTRIC, Type.STEEL, [
        [ Biome.POWER_PLANT, PoolTier.COMMON ]
      ]
    ],
    [ Species.MAGNETON, Type.ELECTRIC, Type.STEEL, [
        [ Biome.POWER_PLANT, PoolTier.COMMON ]
      ]
    ],
    [ Species.FARFETCHD, Type.NORMAL, Type.FLYING, [
        [ Biome.GRASS, PoolTier.SUPER_RARE ],
        [ Biome.GRASS, PoolTier.BOSS_RARE ]
      ]
    ],
    [ Species.DODUO, Type.NORMAL, Type.FLYING, [
        [ Biome.GRASS, PoolTier.COMMON ]
      ]
    ],
    [ Species.DODRIO, Type.NORMAL, Type.FLYING, [
        [ Biome.GRASS, PoolTier.COMMON ],
        [ Biome.GRASS, PoolTier.BOSS ]
      ]
    ],
    [ Species.SEEL, Type.WATER, -1, [
        [ Biome.ICE_CAVE, PoolTier.COMMON ]
      ]
    ],
    [ Species.DEWGONG, Type.WATER, Type.ICE, [
        [ Biome.ICE_CAVE, PoolTier.COMMON ],
        [ Biome.ICE_CAVE, PoolTier.BOSS ]
      ]
    ],
    [ Species.GRIMER, Type.POISON, -1, [
        [ Biome.GRASS, PoolTier.UNCOMMON ],
        [ Biome.SWAMP, PoolTier.COMMON ]
      ]
    ],
    [ Species.MUK, Type.POISON, -1, [
        [ Biome.GRASS, PoolTier.UNCOMMON ],
        [ Biome.SWAMP, PoolTier.COMMON ]
      ]
    ],
    [ Species.SHELLDER, Type.WATER, -1, [
        [ Biome.WATER, PoolTier.UNCOMMON ],
        [ Biome.SEA, PoolTier.COMMON ]
      ]
    ],
    [ Species.CLOYSTER, Type.WATER, Type.ICE, [
        [ Biome.SEA, PoolTier.BOSS ]
      ]
    ],
    [ Species.GASTLY, Type.GHOST, Type.POISON, [
        [ Biome.GRAVEYARD, PoolTier.COMMON ]
      ]
    ],
    [ Species.HAUNTER, Type.GHOST, Type.POISON, [
        [ Biome.GRAVEYARD, PoolTier.COMMON ]
      ]
    ],
    [ Species.GENGAR, Type.GHOST, Type.POISON, [
        [ Biome.GRAVEYARD, PoolTier.BOSS ]
      ]
    ],
    [ Species.ONIX, Type.ROCK, Type.GROUND, [
        [ Biome.LAND, PoolTier.RARE ],
        [ Biome.CAVE, PoolTier.RARE ],
        [ Biome.CAVE, PoolTier.BOSS ]
      ]
    ],
    [ Species.DROWZEE, Type.PSYCHIC, -1, [
        [ Biome.GRASS, PoolTier.RARE ],
        [ Biome.RUINS, PoolTier.COMMON ]
      ]
    ],
    [ Species.HYPNO, Type.PSYCHIC, -1, [
        [ Biome.GRASS, PoolTier.RARE ],
        [ Biome.RUINS, PoolTier.COMMON ],
        [ Biome.RUINS, PoolTier.BOSS ]
      ]
    ],
    [ Species.KRABBY, Type.WATER, -1, [
        [ Biome.WATER, PoolTier.UNCOMMON ],
        [ Biome.SEA, PoolTier.COMMON ]
      ]
    ],
    [ Species.KINGLER, Type.WATER, -1, [
        [ Biome.WATER, PoolTier.UNCOMMON ],
        [ Biome.SEA, PoolTier.COMMON ],
        [ Biome.SEA, PoolTier.BOSS ]
      ]
    ],
    [ Species.VOLTORB, Type.ELECTRIC, -1, [
        [ Biome.POWER_PLANT, PoolTier.COMMON ]
      ]
    ],
    [ Species.ELECTRODE, Type.ELECTRIC, -1, [
        [ Biome.POWER_PLANT, PoolTier.COMMON ]
      ]
    ],
    [ Species.EXEGGCUTE, Type.GRASS, Type.PSYCHIC, [
        [ Biome.GRASS, PoolTier.RARE ],
        [ Biome.FOREST, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.EXEGGUTOR, Type.GRASS, Type.PSYCHIC, [
        [ Biome.FOREST, PoolTier.BOSS ]
      ]
    ],
    [ Species.CUBONE, Type.GROUND, -1, [
        [ Biome.LAND, PoolTier.UNCOMMON ],
        [ Biome.GRAVEYARD, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.MAROWAK, Type.GROUND, -1, [
        [ Biome.LAND, PoolTier.UNCOMMON ],
        [ Biome.GRAVEYARD, PoolTier.UNCOMMON ],
        [ Biome.LAND, PoolTier.BOSS ]
      ]
    ],
    [ Species.HITMONLEE, Type.FIGHTING, -1, [
        [ Biome.DOJO, PoolTier.RARE ],
        [ Biome.DOJO, PoolTier.BOSS ]
      ]
    ],
    [ Species.HITMONCHAN, Type.FIGHTING, -1, [
        [ Biome.DOJO, PoolTier.RARE ],
        [ Biome.DOJO, PoolTier.BOSS ]
      ]
    ],
    [ Species.LICKITUNG, Type.NORMAL, -1, [
        [ Biome.GRASS, PoolTier.SUPER_RARE ]
      ]
    ],
    [ Species.KOFFING, Type.POISON, -1, [
        [ Biome.FOREST, PoolTier.UNCOMMON ],
        [ Biome.SWAMP, PoolTier.COMMON ]
      ]
    ],
    [ Species.WEEZING, Type.POISON, -1, [
        [ Biome.FOREST, PoolTier.UNCOMMON ],
        [ Biome.SWAMP, PoolTier.COMMON ],
        [ Biome.SWAMP, PoolTier.BOSS ]
      ]
    ],
    [ Species.RHYHORN, Type.GROUND, Type.ROCK, [
        [ Biome.MOUNTAIN, PoolTier.UNCOMMON ],
        [ Biome.LAND, PoolTier.COMMON ]
      ]
    ],
    [ Species.RHYDON, Type.GROUND, Type.ROCK, [
        [ Biome.MOUNTAIN, PoolTier.UNCOMMON ],
        [ Biome.LAND, PoolTier.COMMON ]
      ]
    ],
    [ Species.CHANSEY, Type.NORMAL, -1, [
        [ Biome.GRASS, PoolTier.SUPER_RARE ],
        [ Biome.MEADOW, PoolTier.SUPER_RARE ]
      ]
    ],
    [ Species.TANGELA, Type.GRASS, -1, [
        [ Biome.GRASS, PoolTier.RARE ],
        [ Biome.FOREST, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.KANGASKHAN, Type.NORMAL, -1, [
        [ Biome.GRASS, PoolTier.SUPER_RARE ],
        [ Biome.GRASS, PoolTier.BOSS_RARE ]
      ]
    ],
    [ Species.HORSEA, Type.WATER, -1, [
        [ Biome.SEA, PoolTier.COMMON ]
      ]
    ],
    [ Species.SEADRA, Type.WATER, -1, [
        [ Biome.SEA, PoolTier.COMMON ]
      ]
    ],
    [ Species.GOLDEEN, Type.WATER, -1, [
        [ Biome.SEA, PoolTier.COMMON ]
      ]
    ],
    [ Species.SEAKING, Type.WATER, -1, [
        [ Biome.SEA, PoolTier.COMMON ],
        [ Biome.SEA, PoolTier.BOSS ]
      ]
    ],
    [ Species.STARYU, Type.WATER, -1, [
        [ Biome.WATER, PoolTier.UNCOMMON ],
        [ Biome.SEA, PoolTier.COMMON ]
      ]
    ],
    [ Species.STARMIE, Type.WATER, Type.PSYCHIC, [
        [ Biome.WATER, PoolTier.UNCOMMON ],
        [ Biome.SEA, PoolTier.COMMON ],
        [ Biome.SEA, PoolTier.BOSS ]
      ]
    ],
    [ Species.MR_MIME, Type.PSYCHIC, Type.FAIRY, [
        [ Biome.RUINS, PoolTier.RARE ],
        [ Biome.RUINS, PoolTier.BOSS_RARE ]
      ]
    ],
    [ Species.SCYTHER, Type.BUG, Type.FLYING, [
        [ Biome.GRASS, PoolTier.SUPER_RARE ],
        [ Biome.FOREST, PoolTier.RARE ]
      ]
    ],
    [ Species.JYNX, Type.ICE, Type.PSYCHIC, [
        [ Biome.ICE_CAVE, PoolTier.RARE ],
        [ Biome.ICE_CAVE, PoolTier.BOSS_RARE ]
      ]
    ],
    [ Species.ELECTABUZZ, Type.ELECTRIC, -1, [
        [ Biome.POWER_PLANT, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.MAGMAR, Type.FIRE, -1, [
        [ Biome.VOLCANO, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.PINSIR, Type.BUG, -1, [
        [ Biome.GRASS, PoolTier.RARE ],
        [ Biome.FOREST, PoolTier.UNCOMMON ],
        [ Biome.FOREST, PoolTier.BOSS ]
      ]
    ],
    [ Species.TAUROS, Type.NORMAL, -1, [
        [ Biome.GRASS, PoolTier.RARE ],
        [ Biome.MEADOW, PoolTier.UNCOMMON ],
        [ Biome.MEADOW, PoolTier.BOSS ]
      ]
    ],
    [ Species.MAGIKARP, Type.WATER, -1, [
        [ Biome.WATER, PoolTier.COMMON ],
        [ Biome.SEA, PoolTier.COMMON ]
      ]
    ],
    [ Species.GYARADOS, Type.WATER, Type.FLYING, [
        [ Biome.WATER, PoolTier.BOSS ],
        [ Biome.SEA, PoolTier.BOSS ]
      ]
    ],
    [ Species.LAPRAS, Type.WATER, Type.ICE, [
        [ Biome.SEA, PoolTier.RARE ]
      ]
    ],
    [ Species.DITTO, Type.NORMAL, -1, [
        [ Biome.PLAINS, PoolTier.ULTRA_RARE ],
        [ Biome.GRASS, PoolTier.ULTRA_RARE ]
      ]
    ],
    [ Species.EEVEE, Type.NORMAL, -1, [
        [ Biome.PLAINS, PoolTier.SUPER_RARE ],
        [ Biome.GRASS, PoolTier.SUPER_RARE ],
        [ Biome.MEADOW, PoolTier.RARE ]
      ]
    ],
    [ Species.VAPOREON, Type.WATER, -1, [
        [ Biome.WATER, PoolTier.SUPER_RARE ],
        [ Biome.WATER, PoolTier.BOSS_RARE ]
      ]
    ],
    [ Species.JOLTEON, Type.ELECTRIC, -1, [
        [ Biome.POWER_PLANT, PoolTier.SUPER_RARE ],
        [ Biome.POWER_PLANT, PoolTier.BOSS_RARE ]
      ]
    ],
    [ Species.FLAREON, Type.FIRE, -1, [
        [ Biome.VOLCANO, PoolTier.SUPER_RARE ],
        [ Biome.VOLCANO, PoolTier.BOSS_RARE ]
      ]
    ],
    [ Species.PORYGON, Type.NORMAL, -1, [
        [ Biome.SPACE, PoolTier.SUPER_RARE ]
      ]
    ],
    [ Species.OMANYTE, Type.ROCK, Type.WATER, [
        [ Biome.SEA, PoolTier.SUPER_RARE ]
      ]
    ],
    [ Species.OMASTAR, Type.ROCK, Type.WATER, [
        [ Biome.SEA, PoolTier.SUPER_RARE ],
        [ Biome.SEA, PoolTier.BOSS_RARE ]
      ]
    ],
    [ Species.KABUTO, Type.ROCK, Type.WATER, [
        [ Biome.SEA, PoolTier.SUPER_RARE ]
      ]
    ],
    [ Species.KABUTOPS, Type.ROCK, Type.WATER, [
        [ Biome.SEA, PoolTier.SUPER_RARE ],
        [ Biome.SEA, PoolTier.BOSS_RARE ]
      ]
    ],
    [ Species.AERODACTYL, Type.ROCK, Type.FLYING, [
        [ Biome.WASTELAND, PoolTier.SUPER_RARE ],
        [ Biome.WASTELAND, PoolTier.BOSS_RARE ]
      ]
    ],
    [ Species.SNORLAX, Type.NORMAL, -1, [
        [ Biome.GRASS, PoolTier.SUPER_RARE ],
        [ Biome.GRASS, PoolTier.BOSS_RARE ]
      ]
    ],
    [ Species.ARTICUNO, Type.ICE, Type.FLYING, [
        [ Biome.ICE_CAVE, PoolTier.BOSS_SUPER_RARE ]
      ]
    ],
    [ Species.ZAPDOS, Type.ELECTRIC, Type.FLYING, [
        [ Biome.POWER_PLANT, PoolTier.BOSS_SUPER_RARE ]
      ]
    ],
    [ Species.MOLTRES, Type.FIRE, Type.FLYING, [
        [ Biome.VOLCANO, PoolTier.BOSS_SUPER_RARE ]
      ]
    ],
    [ Species.DRATINI, Type.DRAGON, -1, [
        [ Biome.WASTELAND, PoolTier.RARE ]
      ]
    ],
    [ Species.DRAGONAIR, Type.DRAGON, -1, [
        [ Biome.WASTELAND, PoolTier.RARE ]
      ]
    ],
    [ Species.DRAGONITE, Type.DRAGON, Type.FLYING, [
        [ Biome.WASTELAND, PoolTier.RARE ],
        [ Biome.WASTELAND, PoolTier.BOSS ]
      ]
    ],
    [ Species.MEWTWO, Type.PSYCHIC, -1, [
        [ Biome.RUINS, PoolTier.BOSS_ULTRA_RARE ]
      ]
    ],
    [ Species.MEW, Type.PSYCHIC, -1, [
        [ Biome.SPACE, PoolTier.ULTRA_RARE ],
        [ Biome.SPACE, PoolTier.BOSS_SUPER_RARE ]
      ]
    ],
    [ Species.CHIKORITA, Type.GRASS, -1, [
        [ Biome.FOREST, PoolTier.RARE ]
      ]
    ],
    [ Species.BAYLEEF, Type.GRASS, -1, [
        [ Biome.FOREST, PoolTier.RARE ]
      ]
    ],
    [ Species.MEGANIUM, Type.GRASS, -1, [
        [ Biome.FOREST, PoolTier.RARE ],
        [ Biome.FOREST, PoolTier.BOSS_RARE ]
      ]
    ],
    [ Species.CYNDAQUIL, Type.FIRE, -1, [
        [ Biome.VOLCANO, PoolTier.RARE ]
      ]
    ],
    [ Species.QUILAVA, Type.FIRE, -1, [
        [ Biome.VOLCANO, PoolTier.RARE ]
      ]
    ],
    [ Species.TYPHLOSION, Type.FIRE, -1, [
        [ Biome.VOLCANO, PoolTier.RARE ],
        [ Biome.VOLCANO, PoolTier.BOSS_RARE ]
      ]
    ],
    [ Species.TOTODILE, Type.WATER, -1, [
        [ Biome.WATER, PoolTier.RARE ]
      ]
    ],
    [ Species.CROCONAW, Type.WATER, -1, [
        [ Biome.WATER, PoolTier.RARE ]
      ]
    ],
    [ Species.FERALIGATR, Type.WATER, -1, [
        [ Biome.WATER, PoolTier.RARE ],
        [ Biome.WATER, PoolTier.BOSS_RARE ]
      ]
    ],
    [ Species.SENTRET, Type.NORMAL, -1, [
        [ Biome.PLAINS, PoolTier.COMMON ],
        [ Biome.GRASS, PoolTier.COMMON ]
      ]
    ],
    [ Species.FURRET, Type.NORMAL, -1, [
        [ Biome.GRASS, PoolTier.COMMON ],
        [ Biome.GRASS, PoolTier.BOSS ]
      ]
    ],
    [ Species.HOOTHOOT, Type.NORMAL, Type.FLYING, [
        [ Biome.PLAINS, PoolTier.COMMON ],
        [ Biome.FOREST, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.NOCTOWL, Type.NORMAL, Type.FLYING, [
        [ Biome.GRASS, PoolTier.UNCOMMON ],
        [ Biome.GRASS, PoolTier.BOSS ]
      ]
    ],
    [ Species.LEDYBA, Type.BUG, Type.FLYING, [
        [ Biome.PLAINS, PoolTier.COMMON ],
        [ Biome.GRASS, PoolTier.COMMON ]
      ]
    ],
    [ Species.LEDIAN, Type.BUG, Type.FLYING, [
        [ Biome.GRASS, PoolTier.COMMON ],
        [ Biome.GRASS, PoolTier.BOSS ]
      ]
    ],
    [ Species.SPINARAK, Type.BUG, Type.POISON, [
        [ Biome.FOREST, PoolTier.COMMON ]
      ]
    ],
    [ Species.ARIADOS, Type.BUG, Type.POISON, [
        [ Biome.FOREST, PoolTier.COMMON ],
        [ Biome.GRASS, PoolTier.BOSS ]
      ]
    ],
    [ Species.CROBAT, Type.POISON, Type.FLYING, [
        [ Biome.CAVE, PoolTier.BOSS ]
      ]
    ],
    [ Species.CHINCHOU, Type.WATER, Type.ELECTRIC, [
        [ Biome.SEA, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.LANTURN, Type.WATER, Type.ELECTRIC, [
        [ Biome.SEA, PoolTier.UNCOMMON ],
        [ Biome.SEA, PoolTier.BOSS ]
      ]
    ],
    [ Species.PICHU, Type.ELECTRIC, -1, [
        [ Biome.PLAINS, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.CLEFFA, Type.FAIRY, -1, [
        [ Biome.PLAINS, PoolTier.RARE ]
      ]
    ],
    [ Species.IGGLYBUFF, Type.NORMAL, Type.FAIRY, [
        [ Biome.PLAINS, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.TOGEPI, Type.FAIRY, -1, [
        [ Biome.PLAINS, PoolTier.SUPER_RARE ]
      ]
    ],
    [ Species.TOGETIC, Type.FAIRY, Type.FLYING, [
        [ Biome.MEADOW, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.NATU, Type.PSYCHIC, Type.FLYING, [
        [ Biome.RUINS, PoolTier.COMMON ]
      ]
    ],
    [ Species.XATU, Type.PSYCHIC, Type.FLYING, [
        [ Biome.RUINS, PoolTier.COMMON ],
        [ Biome.RUINS, PoolTier.BOSS ]
      ]
    ],
    [ Species.MAREEP, Type.ELECTRIC, -1, [
        [ Biome.GRASS, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.FLAAFFY, Type.ELECTRIC, -1, [
        [ Biome.GRASS, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.AMPHAROS, Type.ELECTRIC, -1, [
        [ Biome.GRASS, PoolTier.UNCOMMON ],
        [ Biome.GRASS, PoolTier.BOSS ]
      ]
    ],
    [ Species.BELLOSSOM, Type.GRASS, -1, [
        [ Biome.FOREST, PoolTier.BOSS ]
      ]
    ],
    [ Species.MARILL, Type.WATER, Type.FAIRY, [
        [ Biome.WATER, PoolTier.COMMON ]
      ]
    ],
    [ Species.AZUMARILL, Type.WATER, Type.FAIRY, [
        [ Biome.WATER, PoolTier.COMMON ],
        [ Biome.WATER, PoolTier.BOSS ]
      ]
    ],
    [ Species.SUDOWOODO, Type.ROCK, -1, [
        [ Biome.GRASS, PoolTier.SUPER_RARE ],
        [ Biome.GRASS, PoolTier.BOSS_RARE ]
      ]
    ],
    [ Species.POLITOED, Type.WATER, -1, [
        [ Biome.WATER, PoolTier.SUPER_RARE ],
        [ Biome.WATER, PoolTier.BOSS_RARE ]
      ]
    ],
    [ Species.HOPPIP, Type.GRASS, Type.FLYING, [
        [ Biome.PLAINS, PoolTier.COMMON ],
        [ Biome.GRASS, PoolTier.COMMON ]
      ]
    ],
    [ Species.SKIPLOOM, Type.GRASS, Type.FLYING, [
        [ Biome.GRASS, PoolTier.COMMON ],
        [ Biome.FOREST, PoolTier.COMMON ]
      ]
    ],
    [ Species.JUMPLUFF, Type.GRASS, Type.FLYING, [
        [ Biome.GRASS, PoolTier.COMMON ],
        [ Biome.FOREST, PoolTier.COMMON ],
        [ Biome.FOREST, PoolTier.BOSS ]
      ]
    ],
    [ Species.AIPOM, Type.NORMAL, -1, [
        [ Biome.FOREST, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.SUNKERN, Type.GRASS, -1, [
        [ Biome.PLAINS, PoolTier.COMMON ],
        [ Biome.GRASS, PoolTier.COMMON ]
      ]
    ],
    [ Species.SUNFLORA, Type.GRASS, -1, [
        [ Biome.GRASS, PoolTier.BOSS ]
      ]
    ],
    [ Species.YANMA, Type.BUG, Type.FLYING, [
        [ Biome.FOREST, PoolTier.RARE ]
      ]
    ],
    [ Species.WOOPER, Type.WATER, Type.GROUND, [
        [ Biome.WATER, PoolTier.UNCOMMON ],
        [ Biome.SWAMP, PoolTier.COMMON ]
      ]
    ],
    [ Species.QUAGSIRE, Type.WATER, Type.GROUND, [
        [ Biome.WATER, PoolTier.UNCOMMON ],
        [ Biome.SWAMP, PoolTier.COMMON ],
        [ Biome.SWAMP, PoolTier.BOSS ]
      ]
    ],
    [ Species.ESPEON, Type.PSYCHIC, -1, [
        [ Biome.RUINS, PoolTier.SUPER_RARE ],
        [ Biome.RUINS, PoolTier.BOSS_RARE ]
      ]
    ],
    [ Species.UMBREON, Type.DARK, -1, [
        [ Biome.ABYSS, PoolTier.SUPER_RARE ],
        [ Biome.ABYSS, PoolTier.BOSS_RARE ]
      ]
    ],
    [ Species.MURKROW, Type.DARK, Type.FLYING, [
        [ Biome.MOUNTAIN, PoolTier.RARE ],
        [ Biome.ABYSS, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.SLOWKING, Type.WATER, Type.PSYCHIC, [
        [ Biome.WATER, PoolTier.SUPER_RARE ],
        [ Biome.WATER, PoolTier.BOSS_RARE ]
      ]
    ],
    [ Species.MISDREAVUS, Type.GHOST, -1, [
        [ Biome.GRAVEYARD, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.UNOWN, Type.PSYCHIC, -1, [
        [ Biome.RUINS, PoolTier.COMMON ]
      ]
    ],
    [ Species.WOBBUFFET, Type.PSYCHIC, -1, [
        [ Biome.RUINS, PoolTier.RARE ],
        [ Biome.RUINS, PoolTier.BOSS_RARE ]
      ]
    ],
    [ Species.GIRAFARIG, Type.NORMAL, Type.PSYCHIC, [
        [ Biome.GRASS, PoolTier.RARE ],
        [ Biome.GRASS, PoolTier.BOSS_RARE ]
      ]
    ],
    [ Species.PINECO, Type.BUG, -1, [
        [ Biome.GRASS, PoolTier.UNCOMMON ],
        [ Biome.FOREST, PoolTier.COMMON ]
      ]
    ],
    [ Species.FORRETRESS, Type.BUG, Type.STEEL, [
        [ Biome.GRASS, PoolTier.UNCOMMON ],
        [ Biome.FOREST, PoolTier.COMMON ],
        [ Biome.FOREST, PoolTier.BOSS ]
      ]
    ],
    [ Species.DUNSPARCE, Type.NORMAL, -1, [
        [ Biome.GRASS, PoolTier.SUPER_RARE ]
      ]
    ],
    [ Species.GLIGAR, Type.GROUND, Type.FLYING, [
        [ Biome.LAND, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.STEELIX, Type.STEEL, Type.GROUND, [
        [ Biome.LAND, PoolTier.BOSS_RARE ]
      ]
    ],
    [ Species.SNUBBULL, Type.FAIRY, -1, [
        [ Biome.GRASS, PoolTier.RARE ],
        [ Biome.MEADOW, PoolTier.COMMON ]
      ]
    ],
    [ Species.GRANBULL, Type.FAIRY, -1, [
        [ Biome.GRASS, PoolTier.RARE ],
        [ Biome.MEADOW, PoolTier.COMMON ],
        [ Biome.MEADOW, PoolTier.BOSS ]
      ]
    ],
    [ Species.QWILFISH, Type.WATER, Type.POISON, [
        [ Biome.SEA, PoolTier.UNCOMMON ],
        [ Biome.SEA, PoolTier.BOSS ]
      ]
    ],
    [ Species.SCIZOR, Type.BUG, Type.STEEL, [
        [ Biome.FOREST, PoolTier.BOSS_SUPER_RARE ]
      ]
    ],
    [ Species.SHUCKLE, Type.BUG, Type.ROCK, [
        [ Biome.GRASS, PoolTier.SUPER_RARE ],
        [ Biome.GRASS, PoolTier.BOSS_RARE ]
      ]
    ],
    [ Species.HERACROSS, Type.BUG, Type.FIGHTING, [
        [ Biome.FOREST, PoolTier.RARE ],
        [ Biome.FOREST, PoolTier.BOSS_RARE ]
      ]
    ],
    [ Species.SNEASEL, Type.DARK, Type.ICE, [
        [ Biome.ICE_CAVE, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.TEDDIURSA, Type.NORMAL, -1, [
        [ Biome.FOREST, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.URSARING, Type.NORMAL, -1, [
        [ Biome.FOREST, PoolTier.UNCOMMON ],
        [ Biome.FOREST, PoolTier.BOSS ]
      ]
    ],
    [ Species.SLUGMA, Type.FIRE, -1, [
        [ Biome.MOUNTAIN, PoolTier.RARE ],
        [ Biome.VOLCANO, PoolTier.COMMON ]
      ]
    ],
    [ Species.MAGCARGO, Type.FIRE, Type.ROCK, [
        [ Biome.MOUNTAIN, PoolTier.RARE ],
        [ Biome.VOLCANO, PoolTier.COMMON ],
        [ Biome.VOLCANO, PoolTier.BOSS ]
      ]
    ],
    [ Species.SWINUB, Type.ICE, Type.GROUND, [
        [ Biome.ICE_CAVE, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.PILOSWINE, Type.ICE, Type.GROUND, [
        [ Biome.ICE_CAVE, PoolTier.UNCOMMON]
      ]
    ],
    [ Species.CORSOLA, Type.WATER, Type.ROCK, [
        [ Biome.SEA, PoolTier.RARE ],
        [ Biome.SEA, PoolTier.BOSS ]
      ]
    ],
    [ Species.REMORAID, Type.WATER, -1, [
        [ Biome.SEA, PoolTier.COMMON ]
      ]
    ],
    [ Species.OCTILLERY, Type.WATER, -1, [
        [ Biome.SEA, PoolTier.RARE ],
        [ Biome.SEA, PoolTier.BOSS ]
      ]
    ],
    [ Species.DELIBIRD, Type.ICE, Type.FLYING, [
        [ Biome.ICE_CAVE, PoolTier.SUPER_RARE ]
      ]
    ],
    [ Species.MANTINE, Type.WATER, Type.FLYING, [
        [ Biome.SEA, PoolTier.RARE ],
        [ Biome.SEA, PoolTier.BOSS ]
      ]
    ],
    [ Species.SKARMORY, Type.STEEL, Type.FLYING, [
        [ Biome.MOUNTAIN, PoolTier.RARE ],
        [ Biome.MOUNTAIN, PoolTier.BOSS ]
      ]
    ],
    [ Species.HOUNDOUR, Type.DARK, Type.FIRE, [
        [ Biome.ABYSS, PoolTier.COMMON ]
      ]
    ],
    [ Species.HOUNDOOM, Type.DARK, Type.FIRE, [
        [ Biome.ABYSS, PoolTier.COMMON ],
        [ Biome.ABYSS, PoolTier.BOSS ]
      ]
    ],
    [ Species.KINGDRA, Type.WATER, Type.DRAGON, [
        [ Biome.SEA, PoolTier.SUPER_RARE ],
        [ Biome.SEA, PoolTier.BOSS_RARE ]
      ]
    ],
    [ Species.PHANPY, Type.GROUND, -1, [
        [ Biome.LAND, PoolTier.COMMON ]
      ]
    ],
    [ Species.DONPHAN, Type.GROUND, -1, [
        [ Biome.LAND, PoolTier.COMMON ],
        [ Biome.LAND, PoolTier.BOSS ]
      ]
    ],
    [ Species.PORYGON2, Type.NORMAL, -1, [
        [ Biome.SPACE, PoolTier.SUPER_RARE ]
      ]
    ],
    [ Species.STANTLER, Type.NORMAL, -1, [
        [ Biome.FOREST, PoolTier.RARE ],
        [ Biome.FOREST, PoolTier.BOSS_RARE ]
      ]
    ],
    [ Species.SMEARGLE, Type.NORMAL, -1, [
        [ Biome.PLAINS, PoolTier.SUPER_RARE ],
        [ Biome.GRASS, PoolTier.SUPER_RARE ]
      ]
    ],
    [ Species.TYROGUE, Type.FIGHTING, -1, [
        [ Biome.PLAINS, PoolTier.SUPER_RARE ],
        [ Biome.DOJO, PoolTier.RARE ]
      ]
    ],
    [ Species.HITMONTOP, Type.FIGHTING, -1, [
        [ Biome.DOJO, PoolTier.SUPER_RARE ],
        [ Biome.DOJO, PoolTier.BOSS_RARE ]
      ]
    ],
    [ Species.SMOOCHUM, Type.ICE, Type.PSYCHIC, [
        [ Biome.PLAINS, PoolTier.SUPER_RARE ]
      ]
    ],
    [ Species.ELEKID, Type.ELECTRIC, -1, [
        [ Biome.PLAINS, PoolTier.SUPER_RARE ]
      ]
    ],
    [ Species.MAGBY, Type.FIRE, -1, [
        [ Biome.PLAINS, PoolTier.SUPER_RARE ]
      ]
    ],
    [ Species.MILTANK, Type.NORMAL, -1, [
        [ Biome.GRASS, PoolTier.RARE ],
        [ Biome.MEADOW, PoolTier.UNCOMMON ],
        [ Biome.MEADOW, PoolTier.BOSS ]
      ]
    ],
    [ Species.BLISSEY, Type.NORMAL, -1, [
        [ Biome.MEADOW, PoolTier.BOSS_RARE ]
      ]
    ],
    [ Species.RAIKOU, Type.ELECTRIC, -1, [
        [ Biome.POWER_PLANT, PoolTier.ULTRA_RARE ],
        [ Biome.POWER_PLANT, PoolTier.BOSS_SUPER_RARE ]
      ]
    ],
    [ Species.ENTEI, Type.FIRE, -1, [
        [ Biome.VOLCANO, PoolTier.ULTRA_RARE ],
        [ Biome.VOLCANO, PoolTier.BOSS_SUPER_RARE ]
      ]
    ],
    [ Species.SUICUNE, Type.WATER, -1, [
        [ Biome.WATER, PoolTier.ULTRA_RARE ],
        [ Biome.WATER, PoolTier.BOSS_SUPER_RARE ]
      ]
    ],
    [ Species.LARVITAR, Type.ROCK, Type.GROUND, [
        [ Biome.MOUNTAIN, PoolTier.SUPER_RARE ],
        [ Biome.WASTELAND, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.PUPITAR, Type.ROCK, Type.GROUND, [
        [ Biome.MOUNTAIN, PoolTier.SUPER_RARE ],
        [ Biome.WASTELAND, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.TYRANITAR, Type.ROCK, Type.DARK, [
        [ Biome.WASTELAND, PoolTier.BOSS ]
      ]
    ],
    [ Species.LUGIA, Type.PSYCHIC, Type.FLYING, [
        [ Biome.SEA, PoolTier.BOSS_ULTRA_RARE ]
      ]
    ],
    [ Species.HO_OH, Type.FIRE, Type.FLYING, [
        [ Biome.MOUNTAIN, PoolTier.BOSS_ULTRA_RARE ]
      ]
    ],
    [ Species.CELEBI, Type.PSYCHIC, Type.GRASS, [
        [ Biome.FOREST, PoolTier.ULTRA_RARE ],
        [ Biome.FOREST, PoolTier.BOSS_SUPER_RARE ]
      ]
    ],
    [ Species.TREECKO, Type.GRASS, -1, [
        [ Biome.FOREST, PoolTier.RARE ]
      ]
    ],
    [ Species.GROVYLE, Type.GRASS, -1, [
        [ Biome.FOREST, PoolTier.RARE ]
      ]
    ],
    [ Species.SCEPTILE, Type.GRASS, -1, [
        [ Biome.FOREST, PoolTier.RARE ],
        [ Biome.FOREST, PoolTier.BOSS_RARE ]
      ]
    ],
    [ Species.TORCHIC, Type.FIRE, -1, [
        [ Biome.VOLCANO, PoolTier.RARE ]
      ]
    ],
    [ Species.COMBUSKEN, Type.FIRE, Type.FIGHTING, [
        [ Biome.VOLCANO, PoolTier.RARE ]
      ]
    ],
    [ Species.BLAZIKEN, Type.FIRE, Type.FIGHTING, [
        [ Biome.VOLCANO, PoolTier.RARE ],
        [ Biome.VOLCANO, PoolTier.BOSS_RARE ]
      ]
    ],
    [ Species.MUDKIP, Type.WATER, -1, [
        [ Biome.SWAMP, PoolTier.RARE ]
      ]
    ],
    [ Species.MARSHTOMP, Type.WATER, Type.GROUND, [
        [ Biome.SWAMP, PoolTier.RARE ]
      ]
    ],
    [ Species.SWAMPERT, Type.WATER, Type.GROUND, [
        [ Biome.SWAMP, PoolTier.RARE ],
        [ Biome.SWAMP, PoolTier.BOSS_RARE ]
      ]
    ],
    [ Species.POOCHYENA, Type.DARK, -1, [
        [ Biome.PLAINS, PoolTier.COMMON ],
        [ Biome.ABYSS, PoolTier.COMMON ]
      ]
    ],
    [ Species.MIGHTYENA, Type.DARK, -1, [
        [ Biome.ABYSS, PoolTier.COMMON ],
        [ Biome.ABYSS, PoolTier.BOSS ]
      ]
    ],
    [ Species.ZIGZAGOON, Type.NORMAL, -1, [
        [ Biome.PLAINS, PoolTier.COMMON ],
        [ Biome.GRASS, PoolTier.COMMON ]
      ]
    ],
    [ Species.LINOONE, Type.NORMAL, -1, [
        [ Biome.GRASS, PoolTier.COMMON ],
        [ Biome.GRASS, PoolTier.BOSS ]
      ]
    ],
    [ Species.WURMPLE, Type.BUG, -1, [
        [ Biome.PLAINS, PoolTier.COMMON ],
        [ Biome.FOREST, PoolTier.COMMON ]
      ]
    ],
    [ Species.SILCOON, Type.BUG, -1, [
        [ Biome.PLAINS, PoolTier.COMMON ],
        [ Biome.FOREST, PoolTier.COMMON ]
      ]
    ],
    [ Species.BEAUTIFLY, Type.BUG, Type.FLYING, [
        [ Biome.FOREST, PoolTier.UNCOMMON ],
        [ Biome.FOREST, PoolTier.BOSS ]
      ]
    ],
    [ Species.CASCOON, Type.BUG, -1, [
        [ Biome.PLAINS, PoolTier.COMMON ],
        [ Biome.FOREST, PoolTier.COMMON ]
      ]
    ],
    [ Species.DUSTOX, Type.BUG, Type.POISON, [
        [ Biome.FOREST, PoolTier.UNCOMMON ],
        [ Biome.FOREST, PoolTier.BOSS ]
      ]
    ],
    [ Species.LOTAD, Type.WATER, Type.GRASS, [
        [ Biome.PLAINS, PoolTier.UNCOMMON ],
        [ Biome.WATER, PoolTier.UNCOMMON ],
        [ Biome.SWAMP, PoolTier.COMMON ]
      ]
    ],
    [ Species.LOMBRE, Type.WATER, Type.GRASS, [
        [ Biome.WATER, PoolTier.UNCOMMON ],
        [ Biome.SWAMP, PoolTier.COMMON ]
      ]
    ],
    [ Species.LUDICOLO, Type.WATER, Type.GRASS, [
        [ Biome.SWAMP, PoolTier.BOSS_RARE ]
      ]
    ],
    [ Species.SEEDOT, Type.GRASS, -1, [
        [ Biome.PLAINS, PoolTier.UNCOMMON ],
        [ Biome.GRASS, PoolTier.UNCOMMON ],
        [ Biome.FOREST, PoolTier.COMMON ]
      ]
    ],
    [ Species.NUZLEAF, Type.GRASS, Type.DARK, [
        [ Biome.GRASS, PoolTier.UNCOMMON ],
        [ Biome.FOREST, PoolTier.COMMON ]
      ]
    ],
    [ Species.SHIFTRY, Type.GRASS, Type.DARK, [
        [ Biome.FOREST, PoolTier.BOSS_RARE ]
      ]
    ],
    [ Species.TAILLOW, Type.NORMAL, Type.FLYING, [
        [ Biome.PLAINS, PoolTier.COMMON ],
        [ Biome.GRASS, PoolTier.UNCOMMON ],
        [ Biome.MOUNTAIN, PoolTier.COMMON ]
      ]
    ],
    [ Species.SWELLOW, Type.NORMAL, Type.FLYING, [
        [ Biome.GRASS, PoolTier.UNCOMMON ],
        [ Biome.MOUNTAIN, PoolTier.COMMON ],
        [ Biome.MOUNTAIN, PoolTier.BOSS ]
      ]
    ],
    [ Species.WINGULL, Type.WATER, Type.FLYING, [
        [ Biome.WATER, PoolTier.COMMON ]
      ]
    ],
    [ Species.PELIPPER, Type.WATER, Type.FLYING, [
        [ Biome.WATER, PoolTier.COMMON ],
        [ Biome.WATER, PoolTier.BOSS ]
      ]
    ],
    [ Species.RALTS, Type.PSYCHIC, Type.FAIRY, [
        [ Biome.PLAINS, PoolTier.SUPER_RARE ],
        [ Biome.GRASS, PoolTier.RARE ],
        [ Biome.MEADOW, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.KIRLIA, Type.PSYCHIC, Type.FAIRY, [
        [ Biome.GRASS, PoolTier.RARE ],
        [ Biome.MEADOW, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.GARDEVOIR, Type.PSYCHIC, Type.FAIRY, [
        [ Biome.GRASS, PoolTier.RARE ],
        [ Biome.MEADOW, PoolTier.UNCOMMON ],
        [ Biome.MEADOW, PoolTier.BOSS ]
      ]
    ],
    [ Species.SURSKIT, Type.BUG, Type.WATER, [
        [ Biome.PLAINS, PoolTier.RARE ],
        [ Biome.WATER, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.MASQUERAIN, Type.BUG, Type.FLYING, [
        [ Biome.PLAINS, PoolTier.RARE ],
        [ Biome.WATER, PoolTier.UNCOMMON ],
        [ Biome.WATER, PoolTier.BOSS ]
      ]
    ],
    [ Species.SHROOMISH, Type.GRASS, -1, [
        [ Biome.PLAINS, PoolTier.UNCOMMON ],
        [ Biome.GRASS, PoolTier.UNCOMMON ],
        [ Biome.FOREST, PoolTier.COMMON ]
      ]
    ],
    [ Species.BRELOOM, Type.GRASS, Type.FIGHTING, [
        [ Biome.PLAINS, PoolTier.UNCOMMON ],
        [ Biome.GRASS, PoolTier.UNCOMMON ],
        [ Biome.FOREST, PoolTier.COMMON ],
        [ Biome.FOREST, PoolTier.BOSS ]
      ]
    ],
    [ Species.SLAKOTH, Type.NORMAL, -1, [
        [ Biome.PLAINS, PoolTier.RARE ],
        [ Biome.FOREST, PoolTier.RARE ]
      ]
    ],
    [ Species.VIGOROTH, Type.NORMAL, -1, [
        [ Biome.FOREST, PoolTier.RARE ]
      ]
    ],
    [ Species.SLAKING, Type.NORMAL, -1, [
        [ Biome.FOREST, PoolTier.RARE ],
        [ Biome.FOREST, PoolTier.BOSS_RARE ]
      ]
    ],
    [ Species.NINCADA, Type.BUG, Type.GROUND, [
        [ Biome.PLAINS, PoolTier.UNCOMMON ],
        [ Biome.FOREST, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.NINJASK, Type.BUG, Type.FLYING, [
        [ Biome.FOREST, PoolTier.UNCOMMON ],
        [ Biome.FOREST, PoolTier.BOSS ]
      ]
    ],
    [ Species.SHEDINJA, Type.BUG, Type.GHOST, [
        [ Biome.FOREST, PoolTier.SUPER_RARE ]
      ]
    ],
    [ Species.WHISMUR, Type.NORMAL, -1, [
        [ Biome.PLAINS, PoolTier.UNCOMMON ],
        [ Biome.GRASS, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.LOUDRED, Type.NORMAL, -1, [
        [ Biome.GRASS, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.EXPLOUD, Type.NORMAL, -1, [
        [ Biome.GRASS, PoolTier.UNCOMMON ],
        [ Biome.GRASS, PoolTier.BOSS ]
      ]
    ],
    [ Species.MAKUHITA, Type.FIGHTING, -1, [
        [ Biome.DOJO, PoolTier.COMMON ]
      ]
    ],
    [ Species.HARIYAMA, Type.FIGHTING, -1, [
        [ Biome.DOJO, PoolTier.COMMON ],
        [ Biome.DOJO, PoolTier.BOSS ]
      ]
    ],
    [ Species.AZURILL, Type.NORMAL, Type.FAIRY, [
        [ Biome.PLAINS, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.NOSEPASS, Type.ROCK, -1, [
        [ Biome.MOUNTAIN, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.SKITTY, Type.NORMAL, -1, [
        [ Biome.PLAINS, PoolTier.UNCOMMON ],
        [ Biome.GRASS, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.DELCATTY, Type.NORMAL, -1, [
        [ Biome.GRASS, PoolTier.UNCOMMON ],
        [ Biome.GRASS, PoolTier.BOSS ]
      ]
    ],
    [ Species.SABLEYE, Type.DARK, Type.GHOST, [
        [ Biome.ABYSS, PoolTier.COMMON ],
        [ Biome.ABYSS, PoolTier.BOSS ]
      ]
    ],
    [ Species.MAWILE, Type.STEEL, Type.FAIRY, [
        [ Biome.CAVE, PoolTier.UNCOMMON ],
        [ Biome.CAVE, PoolTier.BOSS ]
      ]
    ],
    [ Species.ARON, Type.STEEL, Type.ROCK, [
        [ Biome.MOUNTAIN, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.LAIRON, Type.STEEL, Type.ROCK, [
        [ Biome.MOUNTAIN, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.AGGRON, Type.STEEL, Type.ROCK, [
        [ Biome.MOUNTAIN, PoolTier.UNCOMMON ],
        [ Biome.MOUNTAIN, PoolTier.BOSS ]
      ]
    ],
    [ Species.MEDITITE, Type.FIGHTING, Type.PSYCHIC, [
        [ Biome.DOJO, PoolTier.COMMON ]
      ]
    ],
    [ Species.MEDICHAM, Type.FIGHTING, Type.PSYCHIC, [
        [ Biome.DOJO, PoolTier.COMMON ],
        [ Biome.DOJO, PoolTier.BOSS ]
      ]
    ],
    [ Species.ELECTRIKE, Type.ELECTRIC, -1, [
        [ Biome.GRASS, PoolTier.RARE ],
        [ Biome.POWER_PLANT, PoolTier.COMMON ]
      ]
    ],
    [ Species.MANECTRIC, Type.ELECTRIC, -1, [
        [ Biome.GRASS, PoolTier.RARE ],
        [ Biome.POWER_PLANT, PoolTier.COMMON ],
        [ Biome.POWER_PLANT, PoolTier.BOSS ]
      ]
    ],
    [ Species.PLUSLE, Type.ELECTRIC, -1, [
        [ Biome.GRASS, PoolTier.RARE ],
        [ Biome.POWER_PLANT, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.MINUN, Type.ELECTRIC, -1, [
        [ Biome.GRASS, PoolTier.RARE ],
        [ Biome.POWER_PLANT, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.VOLBEAT, Type.BUG, -1, [
        [ Biome.GRASS, PoolTier.RARE ],
        [ Biome.FOREST, PoolTier.RARE ]
      ]
    ],
    [ Species.ILLUMISE, Type.BUG, -1, [
        [ Biome.GRASS, PoolTier.RARE ],
        [ Biome.FOREST, PoolTier.RARE ]
      ]
    ],
    [ Species.ROSELIA, Type.GRASS, Type.POISON, [
        [ Biome.GRASS, PoolTier.COMMON ],
        [ Biome.FOREST, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.GULPIN, Type.POISON, -1, [
        [ Biome.FOREST, PoolTier.UNCOMMON ],
        [ Biome.SWAMP, PoolTier.COMMON ]
      ]
    ],
    [ Species.SWALOT, Type.POISON, -1, [
        [ Biome.FOREST, PoolTier.UNCOMMON ],
        [ Biome.SWAMP, PoolTier.COMMON ],
        [ Biome.SWAMP, PoolTier.BOSS ]
      ]
    ],
    [ Species.CARVANHA, Type.WATER, Type.DARK, [
        [ Biome.SEA, PoolTier.COMMON ]
      ]
    ],
    [ Species.SHARPEDO, Type.WATER, Type.DARK, [
        [ Biome.SEA, PoolTier.COMMON ],
        [ Biome.SEA, PoolTier.BOSS ]
      ]
    ],
    [ Species.WAILMER, Type.WATER, -1, [
        [ Biome.SEA, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.WAILORD, Type.WATER, -1, [
        [ Biome.SEA, PoolTier.SUPER_RARE ],
        [ Biome.SEA, PoolTier.BOSS_RARE ]
      ]
    ],
    [ Species.NUMEL, Type.FIRE, Type.GROUND, [
        [ Biome.LAND, PoolTier.UNCOMMON ],
        [ Biome.VOLCANO, PoolTier.COMMON ]
      ]
    ],
    [ Species.CAMERUPT, Type.FIRE, Type.GROUND, [
        [ Biome.LAND, PoolTier.UNCOMMON ],
        [ Biome.VOLCANO, PoolTier.COMMON ],
        [ Biome.VOLCANO, PoolTier.BOSS ]
      ]
    ],
    [ Species.TORKOAL, Type.FIRE, -1, [
        [ Biome.VOLCANO, PoolTier.UNCOMMON ],
        [ Biome.VOLCANO, PoolTier.BOSS ]
      ]
    ],
    [ Species.SPOINK, Type.PSYCHIC, -1, [
        [ Biome.MOUNTAIN, PoolTier.RARE ],
        [ Biome.RUINS, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.GRUMPIG, Type.PSYCHIC, -1, [
        [ Biome.MOUNTAIN, PoolTier.RARE ],
        [ Biome.RUINS, PoolTier.UNCOMMON ],
        [ Biome.RUINS, PoolTier.BOSS ]
      ]
    ],
    [ Species.SPINDA, Type.NORMAL, -1, [
        [ Biome.GRASS, PoolTier.SUPER_RARE]
      ]
    ],
    [ Species.TRAPINCH, Type.GROUND, -1, [
        [ Biome.DESERT, PoolTier.COMMON ]
      ]
    ],
    [ Species.VIBRAVA, Type.GROUND, Type.DRAGON, [
        [ Biome.DESERT, PoolTier.RARE ],
        [ Biome.WASTELAND, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.FLYGON, Type.GROUND, Type.DRAGON, [
        [ Biome.DESERT, PoolTier.RARE ],
        [ Biome.WASTELAND, PoolTier.UNCOMMON ],
        [ Biome.WASTELAND, PoolTier.BOSS ]
      ]
    ],
    [ Species.CACNEA, Type.GRASS, -1, [
        [ Biome.DESERT, PoolTier.COMMON ]
      ]
    ],
    [ Species.CACTURNE, Type.GRASS, Type.DARK, [
        [ Biome.DESERT, PoolTier.COMMON ],
        [ Biome.DESERT, PoolTier.BOSS ]
      ]
    ],
    [ Species.SWABLU, Type.NORMAL, Type.FLYING, [
        [ Biome.MOUNTAIN, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.ALTARIA, Type.DRAGON, Type.FLYING, [
        [ Biome.MOUNTAIN, PoolTier.UNCOMMON ],
        [ Biome.WASTELAND, PoolTier.COMMON ],
        [ Biome.WASTELAND, PoolTier.BOSS ]
      ]
    ],
    [ Species.ZANGOOSE, Type.NORMAL, -1, [
        [ Biome.GRASS, PoolTier.RARE ],
        [ Biome.GRASS, PoolTier.BOSS ]
      ]
    ],
    [ Species.SEVIPER, Type.POISON, -1, [
        [ Biome.FOREST, PoolTier.RARE ],
        [ Biome.FOREST, PoolTier.BOSS ]
      ]
    ],
    [ Species.LUNATONE, Type.ROCK, Type.PSYCHIC, [
        [ Biome.SPACE, PoolTier.COMMON ],
        [ Biome.SPACE, PoolTier.BOSS ]
      ]
    ],
    [ Species.SOLROCK, Type.ROCK, Type.PSYCHIC, [
        [ Biome.SPACE, PoolTier.COMMON ],
        [ Biome.SPACE, PoolTier.BOSS ]
      ]
    ],
    [ Species.BARBOACH, Type.WATER, Type.GROUND, [
        [ Biome.SWAMP, PoolTier.COMMON ],
        [ Biome.SEA, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.WHISCASH, Type.WATER, Type.GROUND, [
        [ Biome.SWAMP, PoolTier.COMMON ],
        [ Biome.SEA, PoolTier.UNCOMMON ],
        [ Biome.SWAMP, PoolTier.BOSS ]
      ]
    ],
    [ Species.CORPHISH, Type.WATER, -1, [
        [ Biome.WATER, PoolTier.UNCOMMON ],
        [ Biome.SEA, PoolTier.COMMON ]
      ]
    ],
    [ Species.CRAWDAUNT, Type.WATER, Type.DARK, [
        [ Biome.WATER, PoolTier.UNCOMMON ],
        [ Biome.SEA, PoolTier.COMMON ],
        [ Biome.SEA, PoolTier.BOSS ]
      ]
    ],
    [ Species.BALTOY, Type.GROUND, Type.PSYCHIC, [
        [ Biome.DESERT, PoolTier.UNCOMMON ],
        [ Biome.RUINS, PoolTier.COMMON ],
        [ Biome.SPACE, PoolTier.COMMON ]
      ]
    ],
    [ Species.CLAYDOL, Type.GROUND, Type.PSYCHIC, [
        [ Biome.DESERT, PoolTier.UNCOMMON ],
        [ Biome.RUINS, PoolTier.COMMON ],
        [ Biome.RUINS, PoolTier.BOSS ],
        [ Biome.SPACE, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.LILEEP, Type.ROCK, Type.GRASS, [
        [ Biome.DESERT, PoolTier.SUPER_RARE ]
      ]
    ],
    [ Species.CRADILY, Type.ROCK, Type.GRASS, [
        [ Biome.DESERT, PoolTier.SUPER_RARE ],
        [ Biome.DESERT, PoolTier.BOSS_RARE ]
      ]
    ],
    [ Species.ANORITH, Type.ROCK, Type.BUG, [
        [ Biome.DESERT, PoolTier.SUPER_RARE ]
      ]
    ],
    [ Species.ARMALDO, Type.ROCK, Type.BUG, [
        [ Biome.DESERT, PoolTier.SUPER_RARE ],
        [ Biome.DESERT, PoolTier.BOSS_RARE ]
      ]
    ],
    [ Species.FEEBAS, Type.WATER, -1, [
        [ Biome.SEA, PoolTier.ULTRA_RARE ]
      ]
    ],
    [ Species.MILOTIC, Type.WATER, -1, [
        [ Biome.SEA, PoolTier.BOSS_SUPER_RARE ]
      ]
    ],
    [ Species.CASTFORM, Type.NORMAL, -1, [
        [ Biome.GRASS, PoolTier.ULTRA_RARE ],
        [ Biome.GRASS, PoolTier.BOSS_RARE ]
      ]
    ],
    [ Species.KECLEON, Type.NORMAL, -1, [
        [ Biome.GRASS, PoolTier.RARE ],
        [ Biome.GRASS, PoolTier.BOSS ]
      ]
    ],
    [ Species.SHUPPET, Type.GHOST, -1, [
        [ Biome.GRAVEYARD, PoolTier.COMMON ]
      ]
    ],
    [ Species.BANETTE, Type.GHOST, -1, [
        [ Biome.GRAVEYARD, PoolTier.COMMON ],
        [ Biome.GRAVEYARD, PoolTier.BOSS ]
      ]
    ],
    [ Species.DUSKULL, Type.GHOST, -1, [
        [ Biome.GRAVEYARD, PoolTier.COMMON ]
      ]
    ],
    [ Species.DUSCLOPS, Type.GHOST, -1, [
        [ Biome.GRAVEYARD, PoolTier.COMMON ]
      ]
    ],
    [ Species.TROPIUS, Type.GRASS, Type.FLYING, [
        [ Biome.FOREST, PoolTier.RARE ],
        [ Biome.FOREST, PoolTier.BOSS ]
      ]
    ],
    [ Species.CHIMECHO, Type.PSYCHIC, -1, [
        [ Biome.RUINS, PoolTier.UNCOMMON ],
        [ Biome.SPACE, PoolTier.COMMON ],
        [ Biome.SPACE, PoolTier.BOSS ]
      ]
    ],
    [ Species.ABSOL, Type.DARK, -1, [
        [ Biome.ABYSS, PoolTier.RARE ],
        [ Biome.ABYSS, PoolTier.BOSS ]
      ]
    ],
    [ Species.WYNAUT, Type.PSYCHIC, -1, [
        [ Biome.PLAINS, PoolTier.SUPER_RARE ]
      ]
    ],
    [ Species.SNORUNT, Type.ICE, -1, [
        [ Biome.ICE_CAVE, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.GLALIE, Type.ICE, -1, [
        [ Biome.ICE_CAVE, PoolTier.UNCOMMON ],
        [ Biome.ICE_CAVE, PoolTier.BOSS ]
      ]
    ],
    [ Species.SPHEAL, Type.ICE, Type.WATER, [
        [ Biome.ICE_CAVE, PoolTier.COMMON ]
      ]
    ],
    [ Species.SEALEO, Type.ICE, Type.WATER, [
        [ Biome.ICE_CAVE, PoolTier.COMMON ]
      ]
    ],
    [ Species.WALREIN, Type.ICE, Type.WATER, [
        [ Biome.ICE_CAVE, PoolTier.COMMON ],
        [ Biome.ICE_CAVE, PoolTier.BOSS ]
      ]
    ],
    [ Species.CLAMPERL, Type.WATER, -1, [
        [ Biome.SEA, PoolTier.COMMON ]
      ]
    ],
    [ Species.HUNTAIL, Type.WATER, -1, [
        [ Biome.SEA, PoolTier.BOSS ]
      ]
    ],
    [ Species.GOREBYSS, Type.WATER, -1, [
        [ Biome.SEA, PoolTier.BOSS ]
      ]
    ],
    [ Species.RELICANTH, Type.WATER, Type.ROCK, [
        [ Biome.SEA, PoolTier.SUPER_RARE ],
        [ Biome.SEA, PoolTier.BOSS_RARE ]
      ]
    ],
    [ Species.LUVDISC, Type.WATER, -1, [
        [ Biome.SEA, PoolTier.UNCOMMON ],
        [ Biome.SEA, PoolTier.BOSS ]
      ]
    ],
    [ Species.BAGON, Type.DRAGON, -1, [
        [ Biome.WASTELAND, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.SHELGON, Type.DRAGON, -1, [
        [ Biome.WASTELAND, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.SALAMENCE, Type.DRAGON, Type.FLYING, [
        [ Biome.WASTELAND, PoolTier.UNCOMMON ],
        [ Biome.WASTELAND, PoolTier.BOSS ]
      ]
    ],
    [ Species.BELDUM, Type.STEEL, Type.PSYCHIC, [
        [ Biome.SPACE, PoolTier.RARE ]
      ]
    ],
    [ Species.METANG, Type.STEEL, Type.PSYCHIC, [
        [ Biome.SPACE, PoolTier.RARE ]
      ]
    ],
    [ Species.METAGROSS, Type.STEEL, Type.PSYCHIC, [
        [ Biome.SPACE, PoolTier.RARE ],
        [ Biome.SPACE, PoolTier.BOSS_RARE ]
      ]
    ],
    [ Species.REGIROCK, Type.ROCK, -1, [
        [ Biome.DESERT, PoolTier.ULTRA_RARE ],
        [ Biome.DESERT, PoolTier.BOSS_SUPER_RARE ]
      ]
    ],
    [ Species.REGICE, Type.ICE, -1, [
        [ Biome.ICE_CAVE, PoolTier.ULTRA_RARE ],
        [ Biome.ICE_CAVE, PoolTier.BOSS_SUPER_RARE ]
      ]
    ],
    [ Species.REGISTEEL, Type.STEEL, -1, [
        [ Biome.MOUNTAIN, PoolTier.ULTRA_RARE ],
        [ Biome.MOUNTAIN, PoolTier.BOSS_SUPER_RARE ]
      ]
    ],
    [ Species.LATIAS, Type.DRAGON, Type.PSYCHIC, [
        [ Biome.MEADOW, PoolTier.ULTRA_RARE ],
        [ Biome.MEADOW, PoolTier.BOSS_SUPER_RARE ]
      ]
    ],
    [ Species.LATIOS, Type.DRAGON, Type.PSYCHIC, [
        [ Biome.MEADOW, PoolTier.ULTRA_RARE ],
        [ Biome.MEADOW, PoolTier.BOSS_SUPER_RARE ]
      ]
    ],
    [ Species.KYOGRE, Type.WATER, -1, [
        [ Biome.SEA, PoolTier.BOSS_ULTRA_RARE ]
      ]
    ],
    [ Species.GROUDON, Type.GROUND, -1, [
        [ Biome.LAND, PoolTier.BOSS_ULTRA_RARE ]
      ]
    ],
    [ Species.RAYQUAZA, Type.DRAGON, Type.FLYING, [
        [ Biome.MOUNTAIN, PoolTier.BOSS_ULTRA_RARE ]
      ]
    ],
    [ Species.JIRACHI, Type.STEEL, Type.PSYCHIC, [
        [ Biome.SPACE, PoolTier.ULTRA_RARE ],
        [ Biome.SPACE, PoolTier.BOSS_SUPER_RARE ]
      ]
    ],
    [ Species.DEOXYS, Type.PSYCHIC, -1, [
        [ Biome.SPACE, PoolTier.ULTRA_RARE ],
        [ Biome.SPACE, PoolTier.BOSS_SUPER_RARE ]
      ]
    ],
    [ Species.TURTWIG, Type.GRASS, -1, [
        [ Biome.FOREST, PoolTier.RARE ]
      ]
    ],
    [ Species.GROTLE, Type.GRASS, -1, [
        [ Biome.FOREST, PoolTier.RARE ]
      ]
    ],
    [ Species.TORTERRA, Type.GRASS, Type.GROUND, [
        [ Biome.FOREST, PoolTier.RARE ],
        [ Biome.FOREST, PoolTier.BOSS_RARE ]
      ]
    ],
    [ Species.CHIMCHAR, Type.FIRE, -1, [
        [ Biome.VOLCANO, PoolTier.RARE ]
      ]
    ],
    [ Species.MONFERNO, Type.FIRE, Type.FIGHTING, [
        [ Biome.VOLCANO, PoolTier.RARE ]
      ]
    ],
    [ Species.INFERNAPE, Type.FIRE, Type.FIGHTING, [
        [ Biome.VOLCANO, PoolTier.RARE ],
        [ Biome.VOLCANO, PoolTier.BOSS_RARE ]
      ]
    ],
    [ Species.PIPLUP, Type.WATER, -1, [
        [ Biome.WATER, PoolTier.RARE ]
      ]
    ],
    [ Species.PRINPLUP, Type.WATER, -1, [
        [ Biome.WATER, PoolTier.RARE ]
      ]
    ],
    [ Species.EMPOLEON, Type.WATER, Type.STEEL, [
        [ Biome.WATER, PoolTier.RARE ],
        [ Biome.WATER, PoolTier.BOSS_RARE ]
      ]
    ],
    [ Species.STARLY, Type.NORMAL, Type.FLYING, [
        [ Biome.PLAINS, PoolTier.COMMON ],
        [ Biome.GRASS, PoolTier.COMMON ],
        [ Biome.MOUNTAIN, PoolTier.COMMON ]
      ]
    ],
    [ Species.STARAVIA, Type.NORMAL, Type.FLYING, [
        [ Biome.GRASS, PoolTier.COMMON ],
        [ Biome.MOUNTAIN, PoolTier.COMMON ]
      ]
    ],
    [ Species.STARAPTOR, Type.NORMAL, Type.FLYING, [
        [ Biome.GRASS, PoolTier.COMMON ],
        [ Biome.MOUNTAIN, PoolTier.COMMON ],
        [ Biome.MOUNTAIN, PoolTier.BOSS ]
      ]
    ],
    [ Species.BIDOOF, Type.NORMAL, -1, [
        [ Biome.PLAINS, PoolTier.COMMON ],
        [ Biome.GRASS, PoolTier.COMMON ]
      ]
    ],
    [ Species.BIBAREL, Type.NORMAL, Type.WATER, [
        [ Biome.GRASS, PoolTier.COMMON ],
        [ Biome.GRASS, PoolTier.BOSS ]
      ]
    ],
    [ Species.KRICKETOT, Type.BUG, -1, [
        [ Biome.PLAINS, PoolTier.UNCOMMON ],
        [ Biome.GRASS, PoolTier.UNCOMMON ],
        [ Biome.FOREST, PoolTier.COMMON ]
      ]
    ],
    [ Species.KRICKETUNE, Type.BUG, -1, [
        [ Biome.GRASS, PoolTier.UNCOMMON ],
        [ Biome.FOREST, PoolTier.COMMON ],
        [ Biome.FOREST, PoolTier.BOSS ]
      ]
    ],
    [ Species.SHINX, Type.ELECTRIC, -1, [
        [ Biome.GRASS, PoolTier.RARE ],
        [ Biome.POWER_PLANT, PoolTier.COMMON ]
      ]
    ],
    [ Species.LUXIO, Type.ELECTRIC, -1, [
        [ Biome.GRASS, PoolTier.RARE ],
        [ Biome.POWER_PLANT, PoolTier.COMMON ]
      ]
    ],
    [ Species.LUXRAY, Type.ELECTRIC, -1, [
        [ Biome.GRASS, PoolTier.RARE ],
        [ Biome.POWER_PLANT, PoolTier.COMMON ],
        [ Biome.POWER_PLANT, PoolTier.BOSS ]
      ]
    ],
    [ Species.BUDEW, Type.GRASS, Type.POISON, [
        [ Biome.PLAINS, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.ROSERADE, Type.GRASS, Type.POISON, [
        [ Biome.GRASS, PoolTier.COMMON ],
        [ Biome.FOREST, PoolTier.UNCOMMON ],
        [ Biome.GRASS, PoolTier.BOSS ],
      ]
    ],
    [ Species.CRANIDOS, Type.ROCK, -1, [
        [ Biome.MOUNTAIN, PoolTier.SUPER_RARE ]
      ]
    ],
    [ Species.RAMPARDOS, Type.ROCK, -1, [
        [ Biome.MOUNTAIN, PoolTier.SUPER_RARE ],
        [ Biome.MOUNTAIN, PoolTier.BOSS_RARE ]
      ]
    ],
    [ Species.SHIELDON, Type.ROCK, Type.STEEL, [
        [ Biome.MOUNTAIN, PoolTier.SUPER_RARE ]
      ]
    ],
    [ Species.BASTIODON, Type.ROCK, Type.STEEL, [
        [ Biome.MOUNTAIN, PoolTier.SUPER_RARE ],
        [ Biome.MOUNTAIN, PoolTier.BOSS_RARE ]
      ]
    ],
    [ Species.BURMY, Type.BUG, -1, [
        [ Biome.FOREST, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.WORMADAM, Type.BUG, Type.GRASS, [
        [ Biome.FOREST, PoolTier.UNCOMMON ],
        [ Biome.FOREST, PoolTier.BOSS ]
      ]
    ],
    [ Species.MOTHIM, Type.BUG, Type.FLYING, [
        [ Biome.FOREST, PoolTier.UNCOMMON ],
        [ Biome.FOREST, PoolTier.BOSS ]
      ]
    ],
    [ Species.COMBEE, Type.BUG, Type.FLYING, [
        [ Biome.PLAINS, PoolTier.UNCOMMON ],
        [ Biome.GRASS, PoolTier.UNCOMMON ],
        [ Biome.FOREST, PoolTier.COMMON ]
      ]
    ],
    [ Species.VESPIQUEN, Type.BUG, Type.FLYING, [
        [ Biome.GRASS, PoolTier.UNCOMMON ],
        [ Biome.FOREST, PoolTier.COMMON ],
        [ Biome.FOREST, PoolTier.BOSS ]
      ]
    ],
    [ Species.PACHIRISU, Type.ELECTRIC, -1, [
        [ Biome.GRASS, PoolTier.RARE ],
        [ Biome.POWER_PLANT, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.BUIZEL, Type.WATER, -1, [
        [ Biome.WATER, PoolTier.COMMON ]
      ]
    ],
    [ Species.FLOATZEL, Type.WATER, -1, [
        [ Biome.WATER, PoolTier.COMMON ],
        [ Biome.WATER, PoolTier.BOSS ]
      ]
    ],
    [ Species.CHERUBI, Type.GRASS, -1, [
        [ Biome.PLAINS, PoolTier.UNCOMMON ],
        [ Biome.GRASS, PoolTier.UNCOMMON ],
        [ Biome.FOREST, PoolTier.COMMON ]
      ]
    ],
    [ Species.CHERRIM, Type.GRASS, -1, [
        [ Biome.PLAINS, PoolTier.UNCOMMON ],
        [ Biome.GRASS, PoolTier.UNCOMMON ],
        [ Biome.FOREST, PoolTier.COMMON ],
        [ Biome.FOREST, PoolTier.BOSS ]
      ]
    ],
    [ Species.SHELLOS, Type.WATER, -1, [
        [ Biome.SWAMP, PoolTier.COMMON ],
        [ Biome.SEA, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.GASTRODON, Type.WATER, Type.GROUND, [
        [ Biome.SWAMP, PoolTier.COMMON ],
        [ Biome.SWAMP, PoolTier.BOSS ],
        [ Biome.SEA, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.AMBIPOM, Type.NORMAL, -1, [
        [ Biome.FOREST, PoolTier.BOSS ]
      ]
    ],
    [ Species.DRIFLOON, Type.GHOST, Type.FLYING, [
        [ Biome.GRAVEYARD, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.DRIFBLIM, Type.GHOST, Type.FLYING, [
        [ Biome.GRAVEYARD, PoolTier.UNCOMMON ],
        [ Biome.GRAVEYARD, PoolTier.BOSS ]
      ]
    ],
    [ Species.BUNEARY, Type.NORMAL, -1, [
        [ Biome.GRASS, PoolTier.RARE ]
      ]
    ],
    [ Species.LOPUNNY, Type.NORMAL, -1, [
        [ Biome.GRASS, PoolTier.RARE ],
        [ Biome.GRASS, PoolTier.BOSS ]
      ]
    ],
    [ Species.MISMAGIUS, Type.GHOST, -1, [
        [ Biome.GRAVEYARD, PoolTier.BOSS ]
      ]
    ],
    [ Species.HONCHKROW, Type.DARK, Type.FLYING, [
        [ Biome.ABYSS, PoolTier.BOSS ]
      ]
    ],
    [ Species.GLAMEOW, Type.NORMAL, -1, [
        [ Biome.GRASS, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.PURUGLY, Type.NORMAL, -1, [
        [ Biome.GRASS, PoolTier.UNCOMMON ],
        [ Biome.GRASS, PoolTier.BOSS ]
      ]
    ],
    [ Species.CHINGLING, Type.PSYCHIC, -1, [
        [ Biome.RUINS, PoolTier.UNCOMMON ],
        [ Biome.SPACE, PoolTier.COMMON ]
      ]
    ],
    [ Species.STUNKY, Type.POISON, Type.DARK, [
        [ Biome.FOREST, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.SKUNTANK, Type.POISON, Type.DARK, [
        [ Biome.FOREST, PoolTier.UNCOMMON ],
        [ Biome.FOREST, PoolTier.BOSS ]
      ]
    ],
    [ Species.BRONZOR, Type.STEEL, Type.PSYCHIC, [
        [ Biome.RUINS, PoolTier.UNCOMMON ],
        [ Biome.SPACE, PoolTier.COMMON ]
      ]
    ],
    [ Species.BRONZONG, Type.STEEL, Type.PSYCHIC, [
        [ Biome.RUINS, PoolTier.UNCOMMON ],
        [ Biome.SPACE, PoolTier.COMMON ],
        [ Biome.SPACE, PoolTier.BOSS ]
      ]
    ],
    [ Species.BONSLY, Type.ROCK, -1, [
        [ Biome.PLAINS, PoolTier.SUPER_RARE ]
      ]
    ],
    [ Species.MIME_JR, Type.PSYCHIC, Type.FAIRY, [
        [ Biome.PLAINS, PoolTier.SUPER_RARE ]
      ]
    ],
    [ Species.HAPPINY, Type.NORMAL, -1, [
        [ Biome.PLAINS, PoolTier.SUPER_RARE ]
      ]
    ],
    [ Species.CHATOT, Type.NORMAL, Type.FLYING, [
        [ Biome.FOREST, PoolTier.SUPER_RARE ]
      ]
    ],
    [ Species.SPIRITOMB, Type.GHOST, Type.DARK, [
        [ Biome.GRAVEYARD, PoolTier.SUPER_RARE ],
        [ Biome.ABYSS, PoolTier.RARE ],
        [ Biome.ABYSS, PoolTier.BOSS ]
      ]
    ],
    [ Species.GIBLE, Type.DRAGON, Type.GROUND, [
        [ Biome.MOUNTAIN, PoolTier.SUPER_RARE ],
        [ Biome.WASTELAND, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.GABITE, Type.DRAGON, Type.GROUND, [
        [ Biome.MOUNTAIN, PoolTier.SUPER_RARE ],
        [ Biome.WASTELAND, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.GARCHOMP, Type.DRAGON, Type.GROUND, [
        [ Biome.MOUNTAIN, PoolTier.SUPER_RARE ],
        [ Biome.WASTELAND, PoolTier.UNCOMMON ],
        [ Biome.WASTELAND, PoolTier.BOSS ]
      ]
    ],
    [ Species.MUNCHLAX, Type.NORMAL, -1, [
        [ Biome.PLAINS, PoolTier.SUPER_RARE ]
      ]
    ],
    [ Species.RIOLU, Type.FIGHTING, -1, [
        [ Biome.PLAINS, PoolTier.SUPER_RARE ]
      ]
    ],
    [ Species.LUCARIO, Type.FIGHTING, Type.STEEL, [
        [ Biome.DOJO, PoolTier.RARE ],
        [ Biome.DOJO, PoolTier.BOSS ]
      ]
    ],
    [ Species.HIPPOPOTAS, Type.GROUND, -1, [
        [ Biome.DESERT, PoolTier.COMMON ]
      ]
    ],
    [ Species.HIPPOWDON, Type.GROUND, -1, [
        [ Biome.DESERT, PoolTier.COMMON ],
        [ Biome.DESERT, PoolTier.BOSS ]
      ]
    ],
    [ Species.SKORUPI, Type.POISON, Type.BUG, [
        [ Biome.SWAMP, PoolTier.UNCOMMON ],
        [ Biome.DESERT, PoolTier.COMMON ]
      ]
    ],
    [ Species.DRAPION, Type.POISON, Type.DARK, [
        [ Biome.SWAMP, PoolTier.UNCOMMON ],
        [ Biome.DESERT, PoolTier.COMMON ],
        [ Biome.DESERT, PoolTier.BOSS ]
      ]
    ],
    [ Species.CROAGUNK, Type.POISON, Type.FIGHTING, [
        [ Biome.SWAMP, PoolTier.UNCOMMON ],
        [ Biome.DOJO, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.TOXICROAK, Type.POISON, Type.FIGHTING, [
        [ Biome.SWAMP, PoolTier.UNCOMMON ],
        [ Biome.DOJO, PoolTier.UNCOMMON ],
        [ Biome.DOJO, PoolTier.BOSS ]
      ]
    ],
    [ Species.CARNIVINE, Type.GRASS, -1, [
        [ Biome.FOREST, PoolTier.RARE ],
        [ Biome.FOREST, PoolTier.BOSS ]
      ]
    ],
    [ Species.FINNEON, Type.WATER, -1, [
        [ Biome.SEA, PoolTier.COMMON ]
      ]
    ],
    [ Species.LUMINEON, Type.WATER, -1, [
        [ Biome.SEA, PoolTier.COMMON ],
        [ Biome.SEA, PoolTier.BOSS ]
      ]
    ],
    [ Species.MANTYKE, Type.WATER, Type.FLYING, [
        [ Biome.SEA, PoolTier.RARE ]
      ]
    ],
    [ Species.SNOVER, Type.GRASS, Type.ICE, [
        [ Biome.ICE_CAVE, PoolTier.COMMON ]
      ]
    ],
    [ Species.ABOMASNOW, Type.GRASS, Type.ICE, [
        [ Biome.ICE_CAVE, PoolTier.COMMON ],
        [ Biome.ICE_CAVE, PoolTier.BOSS ]
      ]
    ],
    [ Species.WEAVILE, Type.DARK, Type.ICE, [
        [ Biome.ICE_CAVE, PoolTier.BOSS ]
      ]
    ],
    [ Species.MAGNEZONE, Type.ELECTRIC, Type.STEEL, [
        [ Biome.POWER_PLANT, PoolTier.BOSS ]
      ]
    ],
    [ Species.LICKILICKY, Type.NORMAL, -1, [
        [ Biome.GRASS, PoolTier.BOSS_RARE ]
      ]
    ],
    [ Species.RHYPERIOR, Type.GROUND, Type.ROCK, [
        [ Biome.LAND, PoolTier.BOSS ]
      ]
    ],
    [ Species.TANGROWTH, Type.GRASS, -1, [
        [ Biome.FOREST, PoolTier.BOSS ]
      ]
    ],
    [ Species.ELECTIVIRE, Type.ELECTRIC, -1, [
        [ Biome.POWER_PLANT, PoolTier.BOSS ]
      ]
    ],
    [ Species.MAGMORTAR, Type.FIRE, -1, [
        [ Biome.VOLCANO, PoolTier.BOSS ]
      ]
    ],
    [ Species.TOGEKISS, Type.FAIRY, Type.FLYING, [
        [ Biome.MEADOW, PoolTier.BOSS ]
      ]
    ],
    [ Species.YANMEGA, Type.BUG, Type.FLYING, [
        [ Biome.FOREST, PoolTier.BOSS ]
      ]
    ],
    [ Species.LEAFEON, Type.GRASS, -1, [
        [ Biome.FOREST, PoolTier.BOSS_RARE ]
      ]
    ],
    [ Species.GLACEON, Type.ICE, -1, [
        [ Biome.ICE_CAVE, PoolTier.BOSS_RARE ]
      ]
    ],
    [ Species.GLISCOR, Type.GROUND, Type.FLYING, [
        [ Biome.LAND, PoolTier.BOSS ]
      ]
    ],
    [ Species.MAMOSWINE, Type.ICE, Type.GROUND, [
        [ Biome.ICE_CAVE, PoolTier.BOSS ]
      ]
    ],
    [ Species.PORYGON_Z, Type.NORMAL, -1, [
        [ Biome.SPACE, PoolTier.BOSS_SUPER_RARE ]
      ]
    ],
    [ Species.GALLADE, Type.PSYCHIC, Type.FIGHTING, [
        [ Biome.DOJO, PoolTier.SUPER_RARE ],
        [ Biome.DOJO, PoolTier.BOSS_RARE ]
      ]
    ],
    [ Species.PROBOPASS, Type.ROCK, Type.STEEL, [
        [ Biome.MOUNTAIN, PoolTier.BOSS ]
      ]
    ],
    [ Species.DUSKNOIR, Type.GHOST, -1, [
        [ Biome.GRAVEYARD, PoolTier.BOSS ]
      ]
    ],
    [ Species.FROSLASS, Type.ICE, Type.GHOST, [
        [ Biome.ICE_CAVE, PoolTier.RARE ],
        [ Biome.ICE_CAVE, PoolTier.BOSS ]
      ]
    ],
    [ Species.ROTOM, Type.ELECTRIC, Type.GHOST, [
        [ Biome.POWER_PLANT, PoolTier.ULTRA_RARE ],
        [ Biome.POWER_PLANT, PoolTier.BOSS_SUPER_RARE ]
      ]
    ],
    [ Species.UXIE, Type.PSYCHIC, -1, [
        [ Biome.WATER, PoolTier.ULTRA_RARE ],
        [ Biome.WATER, PoolTier.BOSS_SUPER_RARE ]
      ]
    ],
    [ Species.MESPRIT, Type.PSYCHIC, -1, [
        [ Biome.WATER, PoolTier.ULTRA_RARE ],
        [ Biome.WATER, PoolTier.BOSS_SUPER_RARE ]
      ]
    ],
    [ Species.AZELF, Type.PSYCHIC, -1, [
        [ Biome.WATER, PoolTier.ULTRA_RARE ],
        [ Biome.WATER, PoolTier.BOSS_SUPER_RARE ]
      ]
    ],
    [ Species.DIALGA, Type.STEEL, Type.DRAGON, [
        [ Biome.WASTELAND, PoolTier.BOSS_ULTRA_RARE ]
      ]
    ],
    [ Species.PALKIA, Type.WATER, Type.DRAGON, [
        [ Biome.ABYSS, PoolTier.BOSS_ULTRA_RARE ]
      ]
    ],
    [ Species.HEATRAN, Type.FIRE, Type.STEEL, [
        [ Biome.VOLCANO, PoolTier.ULTRA_RARE ],
        [ Biome.VOLCANO, PoolTier.BOSS_SUPER_RARE ]
      ]
    ],
    [ Species.REGIGIGAS, Type.NORMAL, -1, [
        [ Biome.RUINS, PoolTier.BOSS_ULTRA_RARE ]
      ]
    ],
    [ Species.GIRATINA, Type.GHOST, Type.DRAGON, [
        [ Biome.GRAVEYARD, PoolTier.BOSS_ULTRA_RARE ]
      ]
    ],
    [ Species.CRESSELIA, Type.PSYCHIC, -1, [
        [ Biome.SPACE, PoolTier.ULTRA_RARE ],
        [ Biome.SPACE, PoolTier.BOSS_SUPER_RARE ]
      ]
    ],
    [ Species.PHIONE, Type.WATER, -1, [
        [ Biome.SEA, PoolTier.RARE ],
        [ Biome.SEA, PoolTier.BOSS_RARE ]
      ]
    ],
    [ Species.MANAPHY, Type.WATER, -1, [
        [ Biome.SEA, PoolTier.ULTRA_RARE ],
        [ Biome.SEA, PoolTier.BOSS_SUPER_RARE ]
      ]
    ],
    [ Species.DARKRAI, Type.DARK, -1, [
        [ Biome.ABYSS, PoolTier.ULTRA_RARE ],
        [ Biome.ABYSS, PoolTier.BOSS_SUPER_RARE ]
      ]
    ],
    [ Species.SHAYMIN, Type.GRASS, -1, [
        [ Biome.GRASS, PoolTier.ULTRA_RARE ],
        [ Biome.GRASS, PoolTier.BOSS_SUPER_RARE ]
      ]
    ],
    [ Species.ARCEUS, Type.NORMAL, -1, [
        [ Biome.SPACE, PoolTier.BOSS_ULTRA_RARE ]
      ]
    ],
    [ Species.VICTINI, Type.PSYCHIC, Type.FIRE, [
        [ Biome.RUINS, PoolTier.ULTRA_RARE ],
        [ Biome.RUINS, PoolTier.BOSS_SUPER_RARE ]
      ]
    ],
    [ Species.SNIVY, Type.GRASS, -1, [
        [ Biome.FOREST, PoolTier.RARE ]
      ]
    ],
    [ Species.SERVINE, Type.GRASS, -1, [
        [ Biome.FOREST, PoolTier.RARE ]
      ]
    ],
    [ Species.SERPERIOR, Type.GRASS, -1, [
        [ Biome.FOREST, PoolTier.RARE ],
        [ Biome.FOREST, PoolTier.BOSS_RARE ]
      ]
    ],
    [ Species.TEPIG, Type.FIRE, -1, [
        [ Biome.VOLCANO, PoolTier.RARE ]
      ]
    ],
    [ Species.PIGNITE, Type.FIRE, Type.FIGHTING, [
        [ Biome.VOLCANO, PoolTier.RARE ]
      ]
    ],
    [ Species.EMBOAR, Type.FIRE, Type.FIGHTING, [
        [ Biome.VOLCANO, PoolTier.RARE ],
        [ Biome.VOLCANO, PoolTier.BOSS_RARE ]
      ]
    ],
    [ Species.OSHAWOTT, Type.WATER, -1, [
        [ Biome.WATER, PoolTier.COMMON ]
      ]
    ],
    [ Species.DEWOTT, Type.WATER, -1, [
        [ Biome.WATER, PoolTier.COMMON ]
      ]
    ],
    [ Species.SAMUROTT, Type.WATER, -1, [
        [ Biome.WATER, PoolTier.COMMON ],
        [ Biome.WATER, PoolTier.BOSS_RARE ]
      ]
    ],
    [ Species.PATRAT, Type.NORMAL, -1, [
        [ Biome.PLAINS, PoolTier.COMMON ],
        [ Biome.GRASS, PoolTier.COMMON ]
      ]
    ],
    [ Species.WATCHOG, Type.NORMAL, -1, [
        [ Biome.GRASS, PoolTier.COMMON ],
        [ Biome.GRASS, PoolTier.BOSS ]
      ]
    ],
    [ Species.LILLIPUP, Type.NORMAL, -1, [
        [ Biome.PLAINS, PoolTier.COMMON ],
        [ Biome.GRASS, PoolTier.COMMON ]
      ]
    ],
    [ Species.HERDIER, Type.NORMAL, -1, [
        [ Biome.GRASS, PoolTier.COMMON ]
      ]
    ],
    [ Species.STOUTLAND, Type.NORMAL, -1, [
        [ Biome.GRASS, PoolTier.COMMON ],
        [ Biome.GRASS, PoolTier.BOSS ]
      ]
    ],
    [ Species.PURRLOIN, Type.DARK, -1, [
        [ Biome.PLAINS, PoolTier.COMMON ],
        [ Biome.ABYSS, PoolTier.COMMON ]
      ]
    ],
    [ Species.LIEPARD, Type.DARK, -1, [
        [ Biome.PLAINS, PoolTier.COMMON ],
        [ Biome.ABYSS, PoolTier.COMMON ],
        [ Biome.ABYSS, PoolTier.BOSS ]
      ]
    ],
    [ Species.PANSAGE, Type.GRASS, -1, [
        [ Biome.FOREST, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.SIMISAGE, Type.GRASS, -1, [
        [ Biome.FOREST, PoolTier.UNCOMMON ],
        [ Biome.FOREST, PoolTier.BOSS ]
      ]
    ],
    [ Species.PANSEAR, Type.FIRE, -1, [
        [ Biome.VOLCANO, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.SIMISEAR, Type.FIRE, -1, [
        [ Biome.VOLCANO, PoolTier.UNCOMMON ],
        [ Biome.VOLCANO, PoolTier.BOSS ]
      ]
    ],
    [ Species.PANPOUR, Type.WATER, -1, [
        [ Biome.WATER, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.SIMIPOUR, Type.WATER, -1, [
        [ Biome.WATER, PoolTier.UNCOMMON ],
        [ Biome.WATER, PoolTier.BOSS ]
      ]
    ],
    [ Species.MUNNA, Type.PSYCHIC, -1, [
        [ Biome.SPACE, PoolTier.COMMON ]
      ]
    ],
    [ Species.MUSHARNA, Type.PSYCHIC, -1, [
        [ Biome.SPACE, PoolTier.COMMON ],
        [ Biome.SPACE, PoolTier.BOSS ]
      ]
    ],
    [ Species.PIDOVE, Type.NORMAL, Type.FLYING, [
        [ Biome.PLAINS, PoolTier.COMMON ],
        [ Biome.GRASS, PoolTier.COMMON ],
        [ Biome.MOUNTAIN, PoolTier.COMMON ]
      ]
    ],
    [ Species.TRANQUILL, Type.NORMAL, Type.FLYING, [
        [ Biome.GRASS, PoolTier.COMMON ],
        [ Biome.MOUNTAIN, PoolTier.COMMON ]
      ]
    ],
    [ Species.UNFEZANT, Type.NORMAL, Type.FLYING, [
        [ Biome.GRASS, PoolTier.COMMON ],
        [ Biome.MOUNTAIN, PoolTier.COMMON ],
        [ Biome.MOUNTAIN, PoolTier.BOSS ]
      ]
    ],
    [ Species.BLITZLE, Type.ELECTRIC, -1, [
        [ Biome.GRASS, PoolTier.COMMON ]
      ]
    ],
    [ Species.ZEBSTRIKA, Type.ELECTRIC, -1, [
        [ Biome.GRASS, PoolTier.COMMON ],
        [ Biome.GRASS, PoolTier.BOSS ]
      ]
    ],
    [ Species.ROGGENROLA, Type.ROCK, -1, [
        [ Biome.MOUNTAIN, PoolTier.UNCOMMON ],
        [ Biome.LAND, PoolTier.UNCOMMON ],
        [ Biome.CAVE, PoolTier.COMMON ]
      ]
    ],
    [ Species.BOLDORE, Type.ROCK, -1, [
        [ Biome.MOUNTAIN, PoolTier.UNCOMMON ],
        [ Biome.LAND, PoolTier.UNCOMMON ],
        [ Biome.CAVE, PoolTier.COMMON ]
      ]
    ],
    [ Species.GIGALITH, Type.ROCK, -1, [
        [ Biome.CAVE, PoolTier.BOSS ]
      ]
    ],
    [ Species.WOOBAT, Type.PSYCHIC, Type.FLYING, [
        [ Biome.CAVE, PoolTier.COMMON ]
      ]
    ],
    [ Species.SWOOBAT, Type.PSYCHIC, Type.FLYING, [
        [ Biome.CAVE, PoolTier.COMMON ],
        [ Biome.CAVE, PoolTier.BOSS ]
      ]
    ],
    [ Species.DRILBUR, Type.GROUND, -1, [
        [ Biome.LAND, PoolTier.COMMON ]
      ]
    ],
    [ Species.EXCADRILL, Type.GROUND, Type.STEEL, [
        [ Biome.LAND, PoolTier.COMMON ],
        [ Biome.LAND, PoolTier.BOSS ]
      ]
    ],
    [ Species.AUDINO, Type.NORMAL, -1, [
        [ Biome.GRASS, PoolTier.SUPER_RARE ],
        [ Biome.GRASS, PoolTier.BOSS_RARE ]
      ]
    ],
    [ Species.TIMBURR, Type.FIGHTING, -1, [
        [ Biome.DOJO, PoolTier.COMMON ]
      ]
    ],
    [ Species.GURDURR, Type.FIGHTING, -1, [
        [ Biome.DOJO, PoolTier.COMMON ]
      ]
    ],
    [ Species.CONKELDURR, Type.FIGHTING, -1, [
        [ Biome.DOJO, PoolTier.BOSS ]
      ]
    ],
    [ Species.TYMPOLE, Type.WATER, -1, [
        [ Biome.SWAMP, PoolTier.COMMON ]
      ]
    ],
    [ Species.PALPITOAD, Type.WATER, Type.GROUND, [
        [ Biome.SWAMP, PoolTier.COMMON ]
      ]
    ],
    [ Species.SEISMITOAD, Type.WATER, Type.GROUND, [
        [ Biome.SWAMP, PoolTier.COMMON ],
        [ Biome.SWAMP, PoolTier.BOSS ]
      ]
    ],
    [ Species.THROH, Type.FIGHTING, -1, [
        [ Biome.DOJO, PoolTier.RARE ],
        [ Biome.DOJO, PoolTier.BOSS ]
      ]
    ],
    [ Species.SAWK, Type.FIGHTING, -1, [
        [ Biome.DOJO, PoolTier.RARE ],
        [ Biome.DOJO, PoolTier.BOSS ]
      ]
    ],
    [ Species.SEWADDLE, Type.BUG, Type.GRASS, [
        [ Biome.FOREST, PoolTier.COMMON ]
      ]
    ],
    [ Species.SWADLOON, Type.BUG, Type.GRASS, [
        [ Biome.FOREST, PoolTier.COMMON ]
      ]
    ],
    [ Species.LEAVANNY, Type.BUG, Type.GRASS, [
        [ Biome.FOREST, PoolTier.COMMON ],
        [ Biome.FOREST, PoolTier.BOSS ]
      ]
    ],
    [ Species.VENIPEDE, Type.BUG, Type.POISON, [
        [ Biome.PLAINS, PoolTier.UNCOMMON ],
        [ Biome.FOREST, PoolTier.COMMON ]
      ]
    ],
    [ Species.WHIRLIPEDE, Type.BUG, Type.POISON, [
        [ Biome.FOREST, PoolTier.COMMON ]
      ]
    ],
    [ Species.SCOLIPEDE, Type.BUG, Type.POISON, [
        [ Biome.FOREST, PoolTier.COMMON ],
        [ Biome.FOREST, PoolTier.BOSS ]
      ]
    ],
    [ Species.COTTONEE, Type.GRASS, Type.FAIRY, [
        [ Biome.PLAINS, PoolTier.COMMON ],
        [ Biome.GRASS, PoolTier.COMMON ],
        [ Biome.MEADOW, PoolTier.COMMON ]
      ]
    ],
    [ Species.WHIMSICOTT, Type.GRASS, Type.FAIRY, [
        [ Biome.GRASS, PoolTier.COMMON ],
        [ Biome.MEADOW, PoolTier.COMMON ],
        [ Biome.GRASS, PoolTier.BOSS ],
      ]
    ],
    [ Species.PETILIL, Type.GRASS, -1, [
        [ Biome.FOREST, PoolTier.COMMON ]
      ]
    ],
    [ Species.LILLIGANT, Type.GRASS, -1, [
        [ Biome.FOREST, PoolTier.BOSS ]
      ]
    ],
    [ Species.BASCULIN, Type.WATER, -1, [
        [ Biome.SEA, PoolTier.COMMON ]
      ]
    ],
    [ Species.SANDILE, Type.GROUND, Type.DARK, [
        [ Biome.DESERT, PoolTier.COMMON ]
      ]
    ],
    [ Species.KROKOROK, Type.GROUND, Type.DARK, [
        [ Biome.DESERT, PoolTier.COMMON ]
      ]
    ],
    [ Species.KROOKODILE, Type.GROUND, Type.DARK, [
        [ Biome.DESERT, PoolTier.COMMON ],
        [ Biome.DESERT, PoolTier.BOSS ]
      ]
    ],
    [ Species.DARUMAKA, Type.FIRE, -1, [
        [ Biome.DESERT, PoolTier.RARE ]
      ]
    ],
    [ Species.DARMANITAN, Type.FIRE, -1, [
        [ Biome.DESERT, PoolTier.RARE ],
        [ Biome.DESERT, PoolTier.BOSS ]
      ]
    ],
    [ Species.MARACTUS, Type.GRASS, -1, [
        [ Biome.DESERT, PoolTier.COMMON ],
        [ Biome.DESERT, PoolTier.BOSS ]
      ]
    ],
    [ Species.DWEBBLE, Type.BUG, Type.ROCK, [
        [ Biome.CAVE, PoolTier.COMMON ]
      ]
    ],
    [ Species.CRUSTLE, Type.BUG, Type.ROCK, [
        [ Biome.CAVE, PoolTier.COMMON ],
        [ Biome.CAVE, PoolTier.BOSS ]
      ]
    ],
    [ Species.SCRAGGY, Type.DARK, Type.FIGHTING, [
        [ Biome.DOJO, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.SCRAFTY, Type.DARK, Type.FIGHTING, [
        [ Biome.DOJO, PoolTier.UNCOMMON ],
        [ Biome.DOJO, PoolTier.BOSS ]
      ]
    ],
    [ Species.SIGILYPH, Type.PSYCHIC, Type.FLYING, [
        [ Biome.RUINS, PoolTier.UNCOMMON ],
        [ Biome.RUINS, PoolTier.BOSS ],
        [ Biome.SPACE, PoolTier.RARE ]
      ]
    ],
    [ Species.YAMASK, Type.GHOST, -1, [
        [ Biome.DESERT, PoolTier.RARE ],
        [ Biome.GRAVEYARD, PoolTier.COMMON ]
      ]
    ],
    [ Species.COFAGRIGUS, Type.GHOST, -1, [
        [ Biome.DESERT, PoolTier.RARE ],
        [ Biome.GRAVEYARD, PoolTier.COMMON ],
        [ Biome.GRAVEYARD, PoolTier.BOSS ]
      ]
    ],
    [ Species.TIRTOUGA, Type.WATER, Type.ROCK, [
        [ Biome.WATER, PoolTier.UNCOMMON ],
        [ Biome.SWAMP, PoolTier.RARE ],
        [ Biome.SEA, PoolTier.COMMON ]
      ]
    ],
    [ Species.CARRACOSTA, Type.WATER, Type.ROCK, [
        [ Biome.WATER, PoolTier.UNCOMMON ],
        [ Biome.SWAMP, PoolTier.RARE ],
        [ Biome.SEA, PoolTier.COMMON ],
        [ Biome.SEA, PoolTier.BOSS ]
      ]
    ],
    [ Species.ARCHEN, Type.ROCK, Type.FLYING, [
        [ Biome.RUINS, PoolTier.SUPER_RARE ]
      ]
    ],
    [ Species.ARCHEOPS, Type.ROCK, Type.FLYING, [
        [ Biome.RUINS, PoolTier.SUPER_RARE ],
        [ Biome.RUINS, PoolTier.BOSS_RARE ]
      ]
    ],
    [ Species.TRUBBISH, Type.POISON, -1, [
        [ Biome.SWAMP, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.GARBODOR, Type.POISON, -1, [
        [ Biome.SWAMP, PoolTier.UNCOMMON ],
        [ Biome.SWAMP, PoolTier.BOSS ]
      ]
    ],
    [ Species.ZORUA, Type.DARK, -1, [
        [ Biome.ABYSS, PoolTier.RARE ]
      ]
    ],
    [ Species.ZOROARK, Type.DARK, -1, [
        [ Biome.ABYSS, PoolTier.RARE ],
        [ Biome.ABYSS, PoolTier.BOSS ]
      ]
    ],
    [ Species.MINCCINO, Type.NORMAL, -1, [
        [ Biome.PLAINS, PoolTier.UNCOMMON ],
        [ Biome.GRASS, PoolTier.COMMON ],
        [ Biome.MEADOW, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.CINCCINO, Type.NORMAL, -1, [
        [ Biome.GRASS, PoolTier.BOSS ],
      ]
    ],
    [ Species.GOTHITA, Type.PSYCHIC, -1, [
        [ Biome.RUINS, PoolTier.RARE ]
      ]
    ],
    [ Species.GOTHORITA, Type.PSYCHIC, -1, [
        [ Biome.RUINS, PoolTier.RARE ]
      ]
    ],
    [ Species.GOTHITELLE, Type.PSYCHIC, -1, [
      [ Biome.RUINS, PoolTier.RARE ],
      [ Biome.RUINS, PoolTier.BOSS ]
      ]
    ],
    [ Species.SOLOSIS, Type.PSYCHIC, -1, [
        [ Biome.SPACE, PoolTier.RARE ]
      ]
    ],
    [ Species.DUOSION, Type.PSYCHIC, -1, [
        [ Biome.SPACE, PoolTier.RARE ]
      ]
    ],
    [ Species.REUNICLUS, Type.PSYCHIC, -1, [
        [ Biome.SPACE, PoolTier.RARE ],
        [ Biome.SPACE, PoolTier.BOSS ]
      ]
    ],
    [ Species.DUCKLETT, Type.WATER, Type.FLYING, [
        [ Biome.PLAINS, PoolTier.RARE ],
        [ Biome.WATER, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.SWANNA, Type.WATER, Type.FLYING, [
        [ Biome.WATER, PoolTier.UNCOMMON ],
        [ Biome.WATER, PoolTier.BOSS ]
      ]
    ],
    [ Species.VANILLITE, Type.ICE, -1, [
        [ Biome.ICE_CAVE, PoolTier.COMMON ]
      ]
    ],
    [ Species.VANILLISH, Type.ICE, -1, [
        [ Biome.ICE_CAVE, PoolTier.COMMON ]
      ]
    ],
    [ Species.VANILLUXE, Type.ICE, -1, [
        [ Biome.ICE_CAVE, PoolTier.COMMON ],
        [ Biome.ICE_CAVE, PoolTier.BOSS ]
      ]
    ],
    [ Species.DEERLING, Type.NORMAL, Type.GRASS, [
        [ Biome.FOREST, PoolTier.COMMON ]
      ]
    ],
    [ Species.SAWSBUCK, Type.NORMAL, Type.GRASS, [
        [ Biome.FOREST, PoolTier.COMMON ],
        [ Biome.FOREST, PoolTier.BOSS ]
      ]
    ],
    [ Species.EMOLGA, Type.ELECTRIC, Type.FLYING, [
        [ Biome.GRASS, PoolTier.RARE ],
        [ Biome.POWER_PLANT, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.KARRABLAST, Type.BUG, -1, [
        [ Biome.FOREST, PoolTier.RARE ]
      ]
    ],
    [ Species.ESCAVALIER, Type.BUG, Type.STEEL, [
        [ Biome.FOREST, PoolTier.BOSS_RARE ]
      ]
    ],
    [ Species.FOONGUS, Type.GRASS, Type.POISON, [
        [ Biome.PLAINS, PoolTier.UNCOMMON ],
        [ Biome.GRASS, PoolTier.UNCOMMON ],
        [ Biome.FOREST, PoolTier.COMMON ]
      ]
    ],
    [ Species.AMOONGUSS, Type.GRASS, Type.POISON, [
        [ Biome.PLAINS, PoolTier.UNCOMMON ],
        [ Biome.GRASS, PoolTier.UNCOMMON ],
        [ Biome.FOREST, PoolTier.COMMON ],
        [ Biome.FOREST, PoolTier.BOSS ]
      ]
    ],
    [ Species.FRILLISH, Type.WATER, Type.GHOST, [
        [ Biome.SEA, PoolTier.COMMON ]
      ]
    ],
    [ Species.JELLICENT, Type.WATER, Type.GHOST, [
        [ Biome.SEA, PoolTier.COMMON ],
        [ Biome.SEA, PoolTier.BOSS ]
      ]
    ],
    [ Species.ALOMOMOLA, Type.WATER, -1, [
        [ Biome.SEA, PoolTier.RARE ],
        [ Biome.SEA, PoolTier.BOSS ]
      ]
    ],
    [ Species.JOLTIK, Type.BUG, Type.ELECTRIC, [
        [ Biome.FOREST, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.GALVANTULA, Type.BUG, Type.ELECTRIC, [
        [ Biome.FOREST, PoolTier.UNCOMMON ],
        [ Biome.FOREST, PoolTier.BOSS ]
      ]
    ],
    [ Species.FERROSEED, Type.GRASS, Type.STEEL, [
        [ Biome.FOREST, PoolTier.RARE ]
      ]
    ],
    [ Species.FERROTHORN, Type.GRASS, Type.STEEL, [
        [ Biome.FOREST, PoolTier.RARE ],
        [ Biome.FOREST, PoolTier.BOSS_RARE ]
      ]
    ],
    [ Species.KLINK, Type.STEEL, -1, [
        [ Biome.RUINS, PoolTier.COMMON ]
      ]
    ],
    [ Species.KLANG, Type.STEEL, -1, [
        [ Biome.RUINS, PoolTier.COMMON ]
      ]
    ],
    [ Species.KLINKLANG, Type.STEEL, -1, [
        [ Biome.RUINS, PoolTier.COMMON ],
        [ Biome.RUINS, PoolTier.BOSS ]
      ]
    ],
    [ Species.TYNAMO, Type.ELECTRIC, -1, [
        [ Biome.SEA, PoolTier.RARE ]
      ]
    ],
    [ Species.EELEKTRIK, Type.ELECTRIC, -1, [
        [ Biome.SEA, PoolTier.RARE ]
      ]
    ],
    [ Species.EELEKTROSS, Type.ELECTRIC, -1, [
        [ Biome.SEA, PoolTier.BOSS_RARE ]
      ]
    ],
    [ Species.ELGYEM, Type.PSYCHIC, -1, [
        [ Biome.RUINS, PoolTier.UNCOMMON ],
        [ Biome.SPACE, PoolTier.COMMON ]
      ]
    ],
    [ Species.BEHEEYEM, Type.PSYCHIC, -1, [
        [ Biome.RUINS, PoolTier.UNCOMMON ],
        [ Biome.SPACE, PoolTier.COMMON ],
        [ Biome.SPACE, PoolTier.BOSS ]
      ]
    ],
    [ Species.LITWICK, Type.GHOST, Type.FIRE, [
        [ Biome.GRAVEYARD, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.LAMPENT, Type.GHOST, Type.FIRE, [
        [ Biome.GRAVEYARD, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.CHANDELURE, Type.GHOST, Type.FIRE, [
        [ Biome.GRAVEYARD, PoolTier.BOSS ]
      ]
    ],
    [ Species.AXEW, Type.DRAGON, -1, [
        [ Biome.MOUNTAIN, PoolTier.SUPER_RARE ],
        [ Biome.WASTELAND, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.FRAXURE, Type.DRAGON, -1, [
        [ Biome.MOUNTAIN, PoolTier.SUPER_RARE ],
        [ Biome.WASTELAND, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.HAXORUS, Type.DRAGON, -1, [
        [ Biome.WASTELAND, PoolTier.BOSS ]
      ]
    ],
    [ Species.CUBCHOO, Type.ICE, -1, [
        [ Biome.ICE_CAVE, PoolTier.COMMON ]
      ]
    ],
    [ Species.BEARTIC, Type.ICE, -1, [
        [ Biome.ICE_CAVE, PoolTier.COMMON ],
        [ Biome.ICE_CAVE, PoolTier.BOSS ]
      ]
    ],
    [ Species.CRYOGONAL, Type.ICE, -1, [
        [ Biome.ICE_CAVE, PoolTier.RARE ],
        [ Biome.ICE_CAVE, PoolTier.BOSS ]
      ]
    ],
    [ Species.SHELMET, Type.BUG, -1, [
        [ Biome.FOREST, PoolTier.RARE ]
      ]
    ],
    [ Species.ACCELGOR, Type.BUG, -1, [
        [ Biome.FOREST, PoolTier.BOSS_RARE ]
      ]
    ],
    [ Species.STUNFISK, Type.GROUND, Type.ELECTRIC, [
        [ Biome.SWAMP, PoolTier.UNCOMMON ],
        [ Biome.SWAMP, PoolTier.BOSS ]
      ]
    ],
    [ Species.MIENFOO, Type.FIGHTING, -1, [
        [ Biome.DOJO, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.MIENSHAO, Type.FIGHTING, -1, [
        [ Biome.DOJO, PoolTier.UNCOMMON ],
        [ Biome.DOJO, PoolTier.BOSS ]
      ]
    ],
    [ Species.DRUDDIGON, Type.DRAGON, -1, [
        [ Biome.WASTELAND, PoolTier.SUPER_RARE ],
        [ Biome.WASTELAND, PoolTier.BOSS_RARE ]
      ]
    ],
    [ Species.GOLETT, Type.GROUND, Type.GHOST, [
        [ Biome.GRAVEYARD, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.GOLURK, Type.GROUND, Type.GHOST, [
        [ Biome.GRAVEYARD, PoolTier.UNCOMMON ],
        [ Biome.GRAVEYARD, PoolTier.BOSS ]
      ]
    ],
    [ Species.PAWNIARD, Type.DARK, Type.STEEL, [
        [ Biome.ABYSS, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.BISHARP, Type.DARK, Type.STEEL, [
        [ Biome.ABYSS, PoolTier.UNCOMMON ],
        [ Biome.ABYSS, PoolTier.BOSS ]
      ]
    ],
    [ Species.BOUFFALANT, Type.NORMAL, -1, [
        [ Biome.GRASS, PoolTier.RARE ],
        [ Biome.MEADOW, PoolTier.UNCOMMON ],
        [ Biome.MEADOW, PoolTier.BOSS ]
      ]
    ],
    [ Species.RUFFLET, Type.NORMAL, Type.FLYING, [
        [ Biome.MOUNTAIN, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.BRAVIARY, Type.NORMAL, Type.FLYING, [
        [ Biome.MOUNTAIN, PoolTier.UNCOMMON ],
        [ Biome.MOUNTAIN, PoolTier.BOSS ]
      ]
    ],
    [ Species.VULLABY, Type.DARK, Type.FLYING, [
        [ Biome.MOUNTAIN, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.MANDIBUZZ, Type.DARK, Type.FLYING, [
        [ Biome.MOUNTAIN, PoolTier.UNCOMMON ],
        [ Biome.MOUNTAIN, PoolTier.BOSS ]
      ]
    ],
    [ Species.HEATMOR, Type.FIRE, -1, [
        [ Biome.VOLCANO, PoolTier.UNCOMMON ],
        [ Biome.VOLCANO, PoolTier.BOSS ]
      ]
    ],
    [ Species.DURANT, Type.BUG, Type.STEEL, [
        [ Biome.FOREST, PoolTier.RARE ],
        [ Biome.FOREST, PoolTier.BOSS ]
      ]
    ],
    [ Species.DEINO, Type.DARK, Type.DRAGON, [
        [ Biome.WASTELAND, PoolTier.RARE ],
        [ Biome.ABYSS, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.ZWEILOUS, Type.DARK, Type.DRAGON, [
        [ Biome.WASTELAND, PoolTier.RARE ],
        [ Biome.ABYSS, PoolTier.UNCOMMON ]
      ]
    ],
    [ Species.HYDREIGON, Type.DARK, Type.DRAGON, [
        [ Biome.WASTELAND, PoolTier.RARE ],
        [ Biome.ABYSS, PoolTier.UNCOMMON ],
        [ Biome.ABYSS, PoolTier.BOSS ]
      ]
    ],
    [ Species.LARVESTA, Type.BUG, Type.FIRE, [
        [ Biome.VOLCANO, PoolTier.SUPER_RARE ]
      ]
    ],
    [ Species.VOLCARONA, Type.BUG, Type.FIRE, [
        [ Biome.VOLCANO, PoolTier.SUPER_RARE ],
        [ Biome.VOLCANO, PoolTier.BOSS_RARE ]
      ]
    ],
    [ Species.COBALION, Type.STEEL, Type.FIGHTING, [
        [ Biome.CAVE, PoolTier.ULTRA_RARE ],
        [ Biome.CAVE, PoolTier.BOSS_SUPER_RARE ],
        [ Biome.DOJO, PoolTier.ULTRA_RARE ],
        [ Biome.DOJO, PoolTier.BOSS_SUPER_RARE ]
      ]
    ],
    [ Species.TERRAKION, Type.ROCK, Type.FIGHTING, [
        [ Biome.LAND, PoolTier.ULTRA_RARE ],
        [ Biome.LAND, PoolTier.BOSS_SUPER_RARE ],
        [ Biome.DOJO, PoolTier.ULTRA_RARE ],
        [ Biome.DOJO, PoolTier.BOSS_SUPER_RARE ]
      ]
    ],
    [ Species.VIRIZION, Type.GRASS, Type.FIGHTING, [
        [ Biome.FOREST, PoolTier.ULTRA_RARE ],
        [ Biome.FOREST, PoolTier.BOSS_SUPER_RARE ],
        [ Biome.DOJO, PoolTier.ULTRA_RARE ],
        [ Biome.DOJO, PoolTier.BOSS_SUPER_RARE ]
      ]
    ],
    [ Species.TORNADUS, Type.FLYING, -1, [
        [ Biome.MOUNTAIN, PoolTier.ULTRA_RARE ],
        [ Biome.MOUNTAIN, PoolTier.BOSS_SUPER_RARE ]
      ]
    ],
    [ Species.THUNDURUS, Type.ELECTRIC, Type.FLYING, [
        [ Biome.POWER_PLANT, PoolTier.ULTRA_RARE ],
        [ Biome.POWER_PLANT, PoolTier.BOSS_SUPER_RARE ]
      ]
    ],
    [ Species.RESHIRAM, Type.DRAGON, Type.FIRE, [
        [ Biome.VOLCANO, PoolTier.BOSS_ULTRA_RARE ]
      ]
    ],
    [ Species.ZEKROM, Type.DRAGON, Type.ELECTRIC, [
        [ Biome.POWER_PLANT, PoolTier.BOSS_ULTRA_RARE ]
      ]
    ],
    [ Species.LANDORUS, Type.GROUND, Type.FLYING, [
        [ Biome.LAND, PoolTier.ULTRA_RARE ],
        [ Biome.LAND, PoolTier.BOSS_SUPER_RARE ]
      ]
    ],
    [ Species.KYUREM, Type.DRAGON, Type.ICE, [
        [ Biome.ICE_CAVE, PoolTier.BOSS_ULTRA_RARE ]
      ]
    ],
    [ Species.KELDEO, Type.WATER, Type.FIGHTING, [
        [ Biome.SWAMP, PoolTier.ULTRA_RARE ],
        [ Biome.SWAMP, PoolTier.BOSS_SUPER_RARE ],
        [ Biome.DOJO, PoolTier.ULTRA_RARE ],
        [ Biome.DOJO, PoolTier.BOSS_SUPER_RARE ]
      ]
    ],
    [ Species.MELOETTA, Type.NORMAL, Type.PSYCHIC, [
        [ Biome.MEADOW, PoolTier.ULTRA_RARE ],
        [ Biome.MEADOW, PoolTier.BOSS_SUPER_RARE ]
      ]
    ],
    [ Species.GENESECT, Type.BUG, Type.STEEL, [
        [ Biome.SPACE, PoolTier.ULTRA_RARE ],
        [ Biome.SPACE, PoolTier.BOSS_SUPER_RARE ]
      ]
    ]
  ];

  for (let biome of Utils.getEnumValues(Biome)) {
    biomePools[biome] = {};

    for (let tier of Utils.getEnumValues(PoolTier))
      biomePools[biome][tier] = [];
  }

  for (let pb of pokemonBiomes) {
    const speciesId = pb[0] as Species;
    const biomeEntries = pb[3] as (Biome | PoolTier)[][];

    const speciesEvolutions: SpeciesEvolution[] = pokemonEvolutions.hasOwnProperty(speciesId)
      ? pokemonEvolutions[speciesId]
      : [];

    for (let b of biomeEntries) {
      const biome = b[0];
      const tier = b[1];

      const biomeTierPool = biomePools[biome][tier];

      let treeIndex = -1;
      let arrayIndex = 0;

      for (let t = 0; t < biomeTierPool.length; t++) {
        const existingSpeciesIds = biomeTierPool[t] as Species[];
        for (let es = 0; es < existingSpeciesIds.length; es++) {
          const existingSpeciesId = existingSpeciesIds[es];
          if (pokemonEvolutions.hasOwnProperty(existingSpeciesId) && (pokemonEvolutions[existingSpeciesId] as SpeciesEvolution[]).find(ese => ese.speciesId === speciesId)) {
            treeIndex = t;
            arrayIndex = es + 1;
            break;
          } else if (speciesEvolutions && speciesEvolutions.find(se => se.speciesId === existingSpeciesId)) {
            treeIndex = t;
            arrayIndex = es;
            break;
          }
        }
        if (treeIndex > -1)
          break;
      }

      if (treeIndex > -1)
        biomeTierPool[treeIndex].splice(arrayIndex, 0, speciesId);
      else
        biomeTierPool.push([ speciesId ]);
    }
  }

  for (let b of Object.keys(biomePools)) {
    for (let t of Object.keys(biomePools[b])) {
      const tier = parseInt(t) as PoolTier;
      const biomeTierPool = biomePools[b][t];
      for (let e = 0; e < biomeTierPool.length; e++) {
        const entry = biomeTierPool[e];
        if (entry.length === 1)
          biomeTierPool[e] = entry[0];
        else {
          const newEntry = {
            1: [ entry[0] ]
          };
          for (let s = 1; s < entry.length; s++) {
            const speciesId = entry[s];
            const prevolution = entry.map(s => pokemonEvolutions[s]).flat().find(e => e && e.speciesId === speciesId);
            const level = prevolution.level - (prevolution.level === 1 ? 1 : 0) + (prevolution.wildDelay * 10) - (tier >= PoolTier.BOSS ? 10 : 0);
            if (!newEntry.hasOwnProperty(level))
              newEntry[level] = [ speciesId ];
            else
              newEntry[level].push(speciesId);
          }
          biomeTierPool[e] = newEntry;
        }
      }
    }
  }

  function outputPools() {
    const output = {};

    for (let b of Object.keys(biomePools)) {
      const biome = Biome[b];
      output[biome] = {};
      for (let t of Object.keys(biomePools[b])) {
        const tier = PoolTier[t];

        output[biome][tier] = [];

        for (let f of biomePools[b][t]) {
          if (typeof f === 'number')
            output[biome][tier].push(Species[f]);
          else {
            const tree = {};

            for (let l of Object.keys(f)) {
              tree[l] = f[l].map(s => Species[s]);
            }

            output[biome][tier].push(tree);
          }
        }
      }
    }

    console.log(beautify(output, null, 2, 180).replace(/(      |      (?:\{ "\d+": \[ )?|    "(?:.*?)": \[ |, (?:(?:\{ )?"\d+": \[ )?)"(.*?)"/g, '$1Species.$2').replace(/"(\d+)": /g, '$1: ').replace(/(    )"(.*?)"/g, '$1[PoolTier.$2]').replace(/(  )"(.*?)"/g, '$1[Biome.$2]'));
  }

  outputPools();

  /*for (let pokemon of allSpecies) {
    if (pokemon.speciesId >= Species.XERNEAS)
      break;
    pokemonBiomes[pokemon.speciesId - 1][0] = Species[pokemonBiomes[pokemon.speciesId - 1][0]];
    pokemonBiomes[pokemon.speciesId - 1][1] = Type[pokemonBiomes[pokemon.speciesId - 1][1]];
    if (pokemonBiomes[pokemon.speciesId - 1][2] > -1)
      pokemonBiomes[pokemon.speciesId - 1][2] = Type[pokemonBiomes[pokemon.speciesId - 1][2]];
    for (let b of Utils.getEnumValues(Biome)) {
      if (biomePools.hasOwnProperty(b)) {
        let poolTier = -1;
        for (let t of Object.keys(biomePools[b])) {
          for (let p = 0; p < biomePools[b][t].length; p++) {
            if (biomePools[b][t][p] === pokemon.speciesId) {
              poolTier = parseInt(t) as PoolTier;
              break;
            }
          }
        }
        if (poolTier > -1)
          pokemonBiomes[pokemon.speciesId - 1][3].push([ Biome[b], PoolTier[poolTier] ]);
      } else if (biomePoolPredicates[b](pokemon)) {
        pokemonBiomes[pokemon.speciesId - 1][3].push([ Biome[b], PoolTier[PoolTier.COMMON] ]);
      }
    }
  }

  console.log(JSON.stringify(pokemonBiomes, null, '  '));*/
}