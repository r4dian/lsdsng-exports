/**
 * @typedef {object} LSDJSngFile
 * @property {number[]} name
 * @property {number} ver
 * @property {number} version
 * @property {number[]} initflags
 * @property {number} tempo
 * @property {number} tunesetting
 * @property {number} filechanged
 * @property {object} clock
 * @property {number} clock.hours
 * @property {number} clock.minutes
 * @property {object} clock.total
 * @property {number} clock.total.days
 * @property {number} clock.total.hours
 * @property {number} clock.total.minutes
 * @property {number} clock.total.checksum
 * @property {object} options
 * @property {number} options.keydelay
 * @property {number} options.keyrepeat
 * @property {number} options.font
 * @property {number} options.syncsetting
 * @property {number} options.colorset
 * @property {number} options.clone
 * @property {number} options.powersave
 * @property {number} options.prelisten
 * @property {number[]} options.wavesynthoverwrite
 * @property {object} songchains
 * @property {number[]} songchains.pu1
 * @property {number[]} songchains.pu2
 * @property {number[]} songchains.wav
 * @property {number[]} songchains.noi
 * @property {object} chains
 * @property {number[]} chains.phrases
 * @property {number[]} chains.transpose
 * @property {object} phrases
 * @property {number[]} phrases.allocation
 * @property {number[]} phrases.notes
 * @property {number[]} phrases.fx
 * @property {number[]} phrases.fxval
 * @property {number[]} phrases.instruments
 * @property {object} tables
 * @property {number[]} tables.allocation
 * @property {number[]} tables.envelope
 * @property {number[]} tables.transpose
 * @property {number[]} tables.fx
 * @property {number[]} tables.fxval
 * @property {number[]} tables.fx2
 * @property {number[]} tables.fx2val
 * @property {object} instruments
 * @property {number[]} instruments.allocation
 * @property {number[]} instruments.names
 * @property {number[]} instruments.params
 * @property {object} instruments.speech
 * @property {number[]} instruments.speech.words
 * @property {number[]} instruments.speech.wordnames
 * @property {number[]} instruments.softsynthparams
 * @property {number[]} instruments.waveframes
 * @property {number[]} bookmarks
 * @property {number[]} grooves
 */


/**
 * Creates a blank LSDJSngFile.
 * @returns {LSDJSngFile}
 */
export const lsdsngFactory = () => ({
  name: [],
  ver: 0,
  version: 0,
  initflags: [],
  tempo: 0,
  tunesetting: 0,
  filechanged: 0,
  clock: {
    hours: 0,
    minutes: 0,
    total: {
      days: 0,
      hours: 0,
      minutes: 0,
      checksum: 0
    }
  },
  options: {
    keydelay: 0,
    keyrepeat: 0,
    font: 0,
    syncsetting: 0,
    colorset: 0,
    clone: 0,
    powersave: 0,
    prelisten: 0,
    wavesynthoverwrite: []
  },
  songchains: {
    pu1: [],
    pu2: [],
    wav: [],
    noi: []
  },
  chains: {
    phrases: [],
    transpose: []
  },
  phrases: {
    allocation: [],
    notes: [],
    fx: [],
    fxval: [],
    instruments: []
  },
  tables: {
    allocation: [],
    envelope: [],
    transpose: [],
    fx: [],
    fxval: [],
    fx2: [],
    fx2val: []
  },
  instruments: {
    allocation: [],
    names: [],
    params: [],
    speech: {
      words: [],
      wordnames: []
    },
    softsynthparams: [],
    waveframes: []
  },
  bookmarks: [],
  grooves: []
});