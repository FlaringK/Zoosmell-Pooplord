// == FlaringK's Universal Substitutor == V0.2

// This module will subsitute all instances of a word with another, maintaining the original word's casing and quirk.
// The wordList controls the subsitutions, the key is the word to be replaced, and the value is the word replacing
// i.e: "dave":"insuffrable", will replace all instances of "Dave" with "Insuffrable", and "D4V3" with "1NSUFFR4BL3", and so on

// Important notes:
//  This will only detect full words, and not parts of words.
//  This will only effect Homestuck
//  Words higher on the word list will be replaced before the others
//  This will not replicate quriks or casing when replacing title (Not that there are any)
//    If the substiution appears in page titles, make sure you format it how you would like it to appear in page titles
//  For those of you who know RegExp, The key is taken as a regex expression
//    Don't forget the \ character is an escape character in strings, so to use it in the expression you'll have to double it, i.e: \\
//  This doesn't effect flashes... yet!
//  This won't detect misspellings of words, you'll have to put those in manually

const wordList = {
  "john":"Zoosmell",
  "joooooooohn":"Zoooooooosmell",
  "egbert":"Pooplord",

  "rose":"Flighty",
  "rosesprite":"Flightysprite",
  "jasprosesprite":"Jasprightysprite",
  "lalonde":"Broad",

  "dave":"Insufferable",
  "davesprite":"Insufferablesprite",
  "strider":"Prick",

  "jade":"Farmstink",
  "jadesprite":"Farmstinksprite",
  "harley":"Buttlass"
}

module.exports = {
  title: "Zoosmell Pooplord", 
  author: "FlaringK (<a href='https://flaringk.github.io/Portfolio/'>Here's my uber cool site</a>)",
  modVersion: 0.2,

  summary: "Replace every text instance of the beta kids names with their inital, sillier ones",
  description: "This mod uses FlaringK's Universal subsitutor, names should be replaces regardless of their case or quirk, however it won't replaces names in images or flashes",


  // Replace text
  // Based of Seymour's "i have an erection." code, so this might be really inefficient, like, even more so
  edit(archive) {

    // Create universal serches for Wordlist
    for (const [key] of Object.entries(wordList)) {
      let universalKey = key
      for (const [char, quirkRegexp] of Object.entries(subsitutionTable)) {
        var charLookup = new RegExp(char, "gi")
        universalKey = universalKey.replace(charLookup, quirkRegexp)
      }
      searchList[key] = universalKey
    }

    // For every page
    for (let i = 1901; i < 9999; i++) {
      const pageString = `00${i}`;
      // if the page exists (prevents certain errors)
      if (archive.mspa.story[pageString]) {

        // For every word in the word list
        for (const [key, value] of Object.entries(wordList)) {

          // Look for word using Universal Key with no words around it in content
          const serchRegex = new RegExp("(?<![a-zA-Z])" + searchList[key] + "(?![a-zA-Z])", "gi")

          // == Title ==
          const titleMatches = [...archive.mspa.story[pageString].title.matchAll(serchRegex)].length

          for (let i = 0; i < titleMatches; i++) {

            const wordMatch = archive.mspa.story[pageString].title.match(serchRegex)[0]
            const wordMatchIndex = [...archive.mspa.story[pageString].title.matchAll(serchRegex)][0].index

            switch(wordMatch) {
              case wordMatch.toUpperCase():
                archive.mspa.story[pageString].title = archive.mspa.story[pageString].title.betterReplace(wordMatch.toUpperCase(), value.toUpperCase(), wordMatchIndex)
                break;
              case wordMatch.toLowerCase():
                archive.mspa.story[pageString].title = archive.mspa.story[pageString].title.betterReplace(wordMatch.toLowerCase(), value.toLowerCase(), wordMatchIndex)
                break;
              case captitalise(wordMatch):
                archive.mspa.story[pageString].title = archive.mspa.story[pageString].title.betterReplace(captitalise(wordMatch), captitalise(value), wordMatchIndex)
                break;
              default:
                archive.mspa.story[pageString].title = archive.mspa.story[pageString].title.betterReplace(wordMatch, value.toLowerCase(), wordMatchIndex)
                break;
            } 

          }

          // archive.mspa.story[pageString].title = archive.mspa.story[pageString].title.replace(serchRegex, value)

          // == Content ==
          const matches = [...archive.mspa.story[pageString].content.matchAll(serchRegex)].length

          // For a const amount of keys (to avoid looping forever >_>)
          for (let i = 0; i < matches; i++) {

            // I Know there's better ways to do this, but after 3 hours this is the only way that's worked and I'm scared to change it
            const wordMatch = archive.mspa.story[pageString].content.match(serchRegex)[0]
            const wordMatchIndex = [...archive.mspa.story[pageString].content.matchAll(serchRegex)][0].index
            const matchString = archive.mspa.story[pageString].content.substring(0, wordMatchIndex)

            // Get Quirk Function & Case function
            const handles = matchString.substring(matchString.lastIndexOf("</span>")).match(handleRegexp)
            const colors = matchString.substring(matchString.lastIndexOf("</span>")).match(colorRegexp)
            let quirkFunc = string => string
            let casingQuirk = string => null
            if (handles && colors) {
              const hexValue = colors.pop().slice(0, -1)
              const handle = handles.pop().slice(1, -1)
              const qurikKey = handle + hexValue
              quirkFunc = hexToTrollQurik[qurikKey] ? hexToTrollQurik[qurikKey] : string => string
              casingQuirk = trollCasing[qurikKey] ? trollCasing[qurikKey] : string => null
            }

            // Check casing and replace with value that has the same casing 
            switch(wordMatch) {
              case casingQuirk(wordMatch):
                archive.mspa.story[pageString].content = archive.mspa.story[pageString].content.betterReplace(casingQuirk(wordMatch), quirkFunc(casingQuirk(value), i), wordMatchIndex)
                break;
              case wordMatch.toUpperCase():
                archive.mspa.story[pageString].content = archive.mspa.story[pageString].content.betterReplace(wordMatch.toUpperCase(), quirkFunc(value.toUpperCase(), i), wordMatchIndex)
                break;
              case wordMatch.toLowerCase():
                archive.mspa.story[pageString].content = archive.mspa.story[pageString].content.betterReplace(wordMatch.toLowerCase(), quirkFunc(value.toLowerCase(), i), wordMatchIndex)
                break;
              case captitalise(wordMatch):
                archive.mspa.story[pageString].content = archive.mspa.story[pageString].content.betterReplace(captitalise(wordMatch), quirkFunc(captitalise(value), i), wordMatchIndex)
                break;
              default:
                archive.mspa.story[pageString].content = archive.mspa.story[pageString].content.betterReplace(wordMatch, quirkFunc(value.toLowerCase()), wordMatchIndex)
                break;
            } 
            
            //archive.mspa.story[pageString].content += "<br />" + wordMatch + " " + wordMatchIndex

          }
        }
        

      }
    }
  }
}

var logBackup = console.log;
var logMessages = [];

console.log = function() {
    logMessages.push.apply(logMessages, arguments);
    logBackup.apply(console, arguments);
};

const searchList = {}
const handleRegexp = />[a-zA-Z0-9].+?:/g
const colorRegexp = /#[a-fA-F0-9].+?"/g

const captitalise = string => string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()

// https://stackoverflow.com/questions/46009180/replace-a-string-after-specific-index-in-javascript-str-replacefrom-to-indexf
String.prototype.betterReplace = function(search, replace, from) {
  if (this.length > from) {
    return this.slice(0, from) + this.slice(from).replace(search, replace);
  }
  return this;
}

// For universal replace
const subsitutionTable = {
  ait: "(ait|8)",
  ate: "(ate|8)",
  ee: "(33|ee)",

  a: "[a4]",
  b: "[b86]",
  e: "([e3]|-+E)",
  h: "(h|\\)\\()",
  i: "(ii|[i1])",
  o: "(o\\+|[o09])",
  s: "[s25]",
  t: "[t7]",
  v: "(vv|vw|v)",
  w: "(ww|wv|w)"
}

// Functions to convert text to qurik text
// Keys are chumHandle + hexvalue
// Functions take in (text, pageNo.), use the Page No. for quirks that change throughout the story
const hexToTrollQurik = {
  // Aradia
  "AA#a10000": (string, page) => page < 3297 + 1901 ? string.replace(/o/g, "0") : string,
  "ARADIA#a10000": (string, page) => page < 3297 + 1901 ? string.replace(/o/g, "0") : string,
  // Sollux
  "TA#a1a100": string => string.replace(/s/gi, "2").replace(/i/gi, "ii"),
  "SOLLUX#a1a100": string => string.replace(/s/gi, "2").replace(/i/gi, "ii"),
  // Nepeta
  "AC#416600": string => string.replace(/ee/gi, "33"),
  "NEPETA#416600": string => string.replace(/ee/gi, "33"),
  // Terezi
  "GC#008282": string => string.replace(/A/gi, "4").replace(/I/gi, "1").replace(/E/gi, "3"),
  "TEREZI#008282": string => string.replace(/A/gi, "4").replace(/I/gi, "1").replace(/E/gi, "3"),
  // Vriska
  "AG#005682": string => string.replace(/b/gi, "8").replace(/ate/gi, "8").replace(/ait/gi, "8"),
  "VRISKA#005682": string => string.replace(/b/gi, "8").replace(/ate/gi, "8").replace(/ait/gi, "8"),
  // Equius
  "CT#000056": string => string.replace(/x/gi, "%").replace(/loo/gi, "100").replace(/ool/gi, "001"),
  "EQUIUS#000056": string => string.replace(/x/gi, "%").replace(/loo/gi, "100").replace(/ool/gi, "001"),
  // Eridan
  "CA#6a006a": string => string.replace(/W/g, "WW").replace(/V/g, "VV").replace(/w/g, "ww").replace(/v/g, "vv").replace(/ing/g, "in").replace(/ING/g, "IN"),
  "ERIDAN#6a006a": string => string.replace(/W/g, "WW").replace(/V/g, "VV").replace(/w/g, "ww").replace(/v/g, "vv").replace(/ing/g, "in").replace(/ING/g, "IN"),
  // Feferi
  "CC#77003c": string => string.replace(/h/gi, ")(").replace(/E/g, "-E"),
  "FEFERI#77003c": string => string.replace(/h/gi, ")(").replace(/E/g, "-E"),

  // Rufioh
  "RUFIOH#a1a100": string => string.replace(/i/gi, "1"),
  // Mituna
  "MITUNA#a1a100": string => string.replace(/A/g, "4").replace(/B/g, "8").replace(/E/g, "3").replace(/I/g, "1").replace(/O/g, "0").replace(/S/g, "5").replace(/T/g, "7"),
  // Kankri
  "KANKRI#ff0000": string => string.replace(/b/gi, "6").replace(/o/gi, "9"),
  // Meulin
  "MEULIN#416600": string => string.replace(/EE/gi, "33"),
  // Porrim
  "PORRIM#008141": string => string.replace(/o/g, "o+").replace(/O/g, "O+"),
  // Latula
  "LATULA#008282": string => string.replace(/A/gi, "4").replace(/I/gi, "1").replace(/E/gi, "3"),
  // Aranea
  "ARANEA#005682": string => string.replace(/b/gi, "8"),
  // Horuss
  "HORUSS#000056": string => string.replace(/x/gi, "%").replace(/loo/gi, "100").replace(/ool/gi, "001"),
  // Cronus
  "CRONUS#6a006a": string => string.replace(/w/g, "vw").replace(/v/g, "wv").replace(/b/gi, "8").replace(/W/g, "VW").replace(/V/g, "WV"),
  // Meenah
  "MEENAH#77003c": string => string.replace(/H/g, ")(").replace(/E/g, "-E").replace(/ing/g, "in").replace(/ING/g, "IN"),

  // SPRITES
  "TAVRISPRITE#0715cd": string => string.replace(/b/gi, "8").replace(/ate/gi, "8").replace(/ait/gi, "8")
}

// Casing Functions
const trollCasing = {
  // Tavros
  "AT#a15000": string => string.charAt(0).toLowerCase() + string.slice(1).toUpperCase(),
  "TAVROS#a15000": string => string.charAt(0).toLowerCase() + string.slice(1).toUpperCase(),
  // Kanaya
  "GA#008141": string => string.replace(/(^\w|\s\w)/g, m => m.toUpperCase()),
  "KANAYA#008141": string => string.replace(/(^\w|\s\w)/g, m => m.toUpperCase()),
  // Calliope
  "UU#929292": string => string.toLowerCase().replace(/u/g, "U"),
  "CALLIOPE#929292": string => string.toLowerCase().replace(/u/g, "U"),
  // Caliborn
  "UU#323232": string => string.toUpperCase().replace(/U/g, "u"),
  "CALIBORN#323232": string => string.toUpperCase().replace(/U/g, "u"),
  // Gamzee
  "TC#2b0057": string => {
    if (string[0] == string[0].toUpperCase()) {
      let chars = string.toLowerCase().split("");
      for (let i = 0; i < chars.length; i += 2) {
        chars[i] = chars[i].toUpperCase();
      }
      return chars.join("");
    } else {
      let chars = string.toUpperCase().split("");
      for (let i = 0; i < chars.length; i += 2) {
        chars[i] = chars[i].toLowerCase();
      }
      return chars.join("");
    }
  },
  "GAMZEE#2b0057": string => {
    if (string[0] == string[0].toUpperCase()) {
      let chars = string.toLowerCase().split("");
      for (let i = 0; i < chars.length; i += 2) {
        chars[i] = chars[i].toUpperCase();
      }
      return chars.join("");
    } else {
      let chars = string.toUpperCase().split("");
      for (let i = 0; i < chars.length; i += 2) {
        chars[i] = chars[i].toLowerCase();
      }
      return chars.join("");
    }
  },

  // SPRITES
  "TAVRISPRITE#0715cd": string => string.charAt(0).toLowerCase() + string.slice(1).toUpperCase(),
}
