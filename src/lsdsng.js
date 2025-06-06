// base object for all data
import {
    BLOCKSIZE,
    CHANS,
    DEFAULT_INSTRUMENT,
    DEFAULT_WAV,
    LSDSNG_HTML_STYLES,
    MIDIOFFSET,
    NOTES,
    TRANSPOSE
} from "./constants";
import {lsdsngFactory} from "./lsdjsngFile";

/**
 * Unpack data into song object.
 * @param {Uint8Array} data
 * @returns {LSDJSngFile}
 */
export const unpack = (data) => {
  let lsdsngObj = lsdsngFactory();
  let decompressedData = [];
  let bank = 0;
  // set name (first 8 bytes)
  let name = data.slice(0, 8);
  lsdsngObj.name = [...name];
  // set ver (9th byte)
  lsdsngObj.ver = data[8];
  // slice the buffer for unpacking based on LSDSNG spec noted at the top
  data = data.slice(9);
  let i = 0;
  // start unpacking
  // pretty hacky, just start unpacking until we get to 32768 bytes which might support lsdprj files?
  while (decompressedData.length < 32768) {
    // if you reach a special byte
    if (data[i] === 0xc0) {
      // if you reach a special byte twice in a row
      // add that byte to the decompressed data
      if (data[i + 1] === 0xc0) {
        decompressedData.push(0xc0);
        i += 2;
      }
      // otherwise repeat data[i+1] into decompressedData, data[i+2] times
      else {
        for (let j = 0; j < data[i + 2]; j++) {
          decompressedData.push(data[i + 1]);
        }
        i += 3;
      }
    }
    // if you reach a special byte
    else if (data[i] === 0xe0) {
      // if you reach a special byte twice in a row
      // add that byte to the decompressed data
      if (data[i + 1] === 0xe0) {
        decompressedData.push(0xe0);
        i += 2;
      }
      // otherwise if following byte == 0xf1,
      // add DEFAULT_INSTRUMENT to decompressedData, data[i+2] times
      else if (data[i + 1] === 0xf1) {
        for (let j = 0; j < data[i + 2]; j++) {
          decompressedData.push(...DEFAULT_INSTRUMENT);
        }
        i += 3;
      }
      // otherwise if following byte == 0xf0,
      // add DEFAULT_WAV to decompressedData, data[i+2] times
      else if (data[i + 1] === 0xf0) {
        for (let j = 0; j < data[i + 2]; j++) {
          decompressedData.push(...DEFAULT_WAV);
        }
        i += 3;
      }
      // otherwise if following byte == 0xff
      // end of file reached, break
      else if (data[i + 1] === 0xff) {
        break;
      }
      // else, increment bank and increment i to the next bank
      else {
        bank++;
        i = bank * BLOCKSIZE;
      }
    }
    // if there was no special byte, just add the byte to decompressedData
    else {
      decompressedData.push(data[i]);
      i++;
    }
  }
  // check file size, should be 32768
  // if (decompressedData.length != 32768) {
  //   throw "Error processing file.";
  // }

  // start categorizing the data that was unpacked as per LSDSNG Spec
  i = 0;
  // phrase notes
  for (i; i < 0x0ff0; i += 16) {
    lsdsngObj.phrases.notes.push(decompressedData.slice(i, i + 16));
  }
  // bookmarks
  for (i; i < 0x1030; i += 64) {
    lsdsngObj.bookmarks = decompressedData.slice(i, i + 64);
  }
  // 96 bytes empty data, skip it
  i += 96;
  // grooves
  for (i; i < 0x1290; i += 16) {
    lsdsngObj.grooves.push(decompressedData.slice(i, i + 16));
  }
  // chains
  for (i; i < 0x1690; i += 4) {
    lsdsngObj.songchains.pu1.push(decompressedData[i]);
    lsdsngObj.songchains.pu2.push(decompressedData[i + 1]);
    lsdsngObj.songchains.wav.push(decompressedData[i + 2]);
    lsdsngObj.songchains.noi.push(decompressedData[i + 3]);
  }
  // tables.envelope
  for (i; i < 0x1890; i += 16) {
    lsdsngObj.tables.envelope.push(decompressedData.slice(i, i + 16));
  }
  // speech.words
  for (i; i < 0x1dd0; i += 32) {
    lsdsngObj.instruments.speech.words.push(decompressedData.slice(i, i + 32));
  }
  // speech.wordnames
  for (i; i < 0x1e78; i += 4) {
    lsdsngObj.instruments.speech.wordnames.push(
      decompressedData.slice(i, i + 4)
    );
  }
  // skip 2 bytes empty data
  i += 2;
  // instruments.names
  for (i; i < 0x1fba; i += 5) {
    lsdsngObj.instruments.names.push(decompressedData.slice(i, i + 5));
  }
  // skip 102 bytes empty data
  i += 102;
  // tables.allocation
  lsdsngObj.tables.allocation = decompressedData.slice(i, (i += 32));
  // instruments.allocation
  lsdsngObj.instruments.allocation = decompressedData.slice(i, (i += 64));
  // chains.phrases
  for (i; i < 0x2880; i += 16) {
    lsdsngObj.chains.phrases.push(decompressedData.slice(i, i + 16));
  }
  // chains.transpose
  for (i; i < 0x3080; i += 16) {
    lsdsngObj.chains.transpose.push(decompressedData.slice(i, i + 16));
  }
  // instruments.params
  for (i; i < 0x3480; i += 16) {
    lsdsngObj.instruments.params.push(decompressedData.slice(i, i + 16));
  }
  // tables.transpose
  for (i; i < 0x3680; i += 16) {
    lsdsngObj.tables.transpose.push(decompressedData.slice(i, i + 16));
  }
  // tables.fx
  for (i; i < 0x3880; i += 16) {
    lsdsngObj.tables.fx.push(decompressedData.slice(i, i + 16));
  }
  // tables.fxval
  for (i; i < 0x3a80; i += 16) {
    lsdsngObj.tables.fxval.push(decompressedData.slice(i, i + 16));
  }
  // tables.fx2
  for (i; i < 0x3c80; i += 16) {
    lsdsngObj.tables.fx2.push(decompressedData.slice(i, i + 16));
  }
  // tables.fx2val
  for (i; i < 0x3e80; i += 16) {
    lsdsngObj.tables.fx2val.push(decompressedData.slice(i, i + 16));
  }
  // initflags
  lsdsngObj.initflags.push(decompressedData.slice(i, (i += 2)));
  // phrases.allocation
  lsdsngObj.phrases.allocation = decompressedData.slice(i, (i += 32));
  // chains.allocation
  lsdsngObj.chains.allocation = decompressedData.slice(i, (i += 16));
  // instruments.softsynthparams
  for (i; i < 0x3fb2; i += 16) {
    lsdsngObj.instruments.softsynthparams.push(
      decompressedData.slice(i, i + 16)
    );
  }
  // clock.hours
  lsdsngObj.clock.hours = decompressedData[i++];
  // clock.minutes
  lsdsngObj.clock.minutes = decompressedData[i++];
  // tempo
  lsdsngObj.tempo = decompressedData[i++];
  // tunesetting
  lsdsngObj.tunesetting = decompressedData[i++];
  // clock.total.days
  lsdsngObj.clock.total.days = decompressedData[i++];
  // clock.total.hours
  lsdsngObj.clock.total.hours = decompressedData[i++];
  // clock.total.minutes
  lsdsngObj.clock.total.minutes = decompressedData[i++];
  //clock.total.checksum
  lsdsngObj.clock.total.checksum = decompressedData[i++];
  // options.keydelay
  lsdsngObj.options.keydelay = decompressedData[i++];
  // options.keyrepeat
  lsdsngObj.options.keyrepeat = decompressedData[i++];
  // options.font
  lsdsngObj.options.font = decompressedData[i++];
  // options.syncsetting
  lsdsngObj.options.syncsetting = decompressedData[i++];
  // options.colorset
  lsdsngObj.options.colorset = decompressedData[i++];

  // skip 1 byte empty data
  i++;

  // options.clone
  lsdsngObj.options.clone = decompressedData[i++];
  // filechanged
  lsdsngObj.filechanged = decompressedData[i++];
  // options.powersave
  lsdsngObj.options.powersave = decompressedData[i++];
  // options.prelisten
  lsdsngObj.options.prelisten = decompressedData[i++];
  // options.wavesynthoverwrite
  lsdsngObj.options.wavesynthoverwrite = decompressedData.slice(i, (i += 2));

  // skip 58 bytes empty data
  i += 58;

  // phrases.fx
  for (i; i < 0x4ff0; i += 16) {
    lsdsngObj.phrases.fx.push(decompressedData.slice(i, i + 16));
  }
  // phrases.fxval
  for (i; i < 0x5fe0; i += 16) {
    lsdsngObj.phrases.fxval.push(decompressedData.slice(i, i + 16));
  }

  // skip 32 bytes empty data
  i += 32;

  // instruments.waveframes
  for (i; i < 0x7000; i += 16) {
    lsdsngObj.instruments.waveframes.push(decompressedData.slice(i, i + 16));
  }
  // phrases.instruments
  for (i; i < 0x7ff0; i += 16) {
    lsdsngObj.phrases.instruments.push(decompressedData.slice(i, i + 16));
  }
  // initflags
  lsdsngObj.initflags.push(decompressedData.slice(i, (i += 2)));

  // skip 13 bytes empty data
  i += 13;

  // version
  lsdsngObj.version = decompressedData[i++];

  return lsdsngObj;
};

/**
 * Makes HTML file out of the data object.
 *
 * @param {LSDJSngFile} data
 * @returns {string}
 */
export const makeHTML = (data) => {
  const EFFECTS = getVersionEffects(data);
  let chain;
  // create the top of the html file
  let outputHTML =
      `<html lang=""><head><style>${LSDSNG_HTML_STYLES}</style></head><body>` +
      `<div class="divTableBody">` +
      `<div class="dt">` +
      `<div class="dr"><div class="dc">row</div>`+
       `<div class="dc">pu1</div>` +
       `<div class="dc">pu2</div>` +
       `<div class="dc">wav</div>` +
       `<div class="dc">noi</div></div>
`;

  for (let i = 0; i < 256; i++) {
    outputHTML += `<div class="dr" onclick="expand('r${i}')"><div class="dc">${String(
      "0" + i.toString(16)
    )
      .toUpperCase()
      .slice(-2)}</div>\n`;
    for (let j = 0; j < CHANS.length; j++) {
      chain = data.songchains[CHANS[j]][i];
      if (chain === 255) {
        chain = "--";
      }
      outputHTML += `<div class="dc1">${String("0" + chain.toString(16))
        .toUpperCase()
        .slice(-2)}</div>\n`;
    }
    outputHTML += `</div>\n`;
    outputHTML += `<div class="dr2" id="r${i}" style = "visibility: collapse">\n`;
    outputHTML += `<div class="dc"></div>\n`;
    for (let j = 0; j < CHANS.length; j++) {
      outputHTML += `<div class="dc3">\n`;
      chain = data.songchains[CHANS[j]][i];
      if (chain === 255) {
        chain = "--";
      }
      for (let k = 0; k < 16; k++) {
        if (chain === "--") {
        } else {
          let phrase = data.chains.phrases[chain][k];
          let transpose = data.chains.transpose[chain][k];
          // to do: implement transpose into the note display
          if (transpose > 127) {
            transpose = transpose - 256;
          }
          if (phrase === 255) {
            phrase = "--";
          }
          outputHTML += `<div class="dr2">`;
          outputHTML += `<div class="dc4">${String("0" + phrase.toString(16))
            .toUpperCase()
            .slice(-2)}</div>`;
          outputHTML += `<div class="dc">`;
          for (let l = 0; l < 16; l++) {
            if (phrase !== "--") {
              outputHTML += `${l.toString(16).toUpperCase()}|`;
              let note = data.phrases.notes[phrase][l];
              if (note !== 0) {
                if (note + transpose <= 0) {
                  note = TRANSPOSE[(((note + transpose) % 12) + 12) % 12];
                } else {
                  note = NOTES[note + transpose];
                }
              } else {
                note = NOTES[0];
              }
              outputHTML += `${note}|`;
              let instrument = data.phrases.instruments[phrase][l];
              if (instrument === 255) {
                instrument = "--";
              }
              outputHTML += `${"I" +
                String("0" + instrument.toString(16))
                  .toUpperCase()
                  .slice(-2)}|`;
              outputHTML += `${EFFECTS[data.phrases.fx[phrase][l]] +
                " " +
                String("0" + data.phrases.fxval[phrase][l].toString(16))
                  .toUpperCase()
                  .slice(-2)}<br>`;
            }
          }
          outputHTML += `</div></div>`;
        }
      }
      outputHTML += `</div>\n`;
    }
    outputHTML += `</div>\n`;
  }
  outputHTML += `</tbody></table>`;
  outputHTML += `<script type="text/javascript">
        function expand(id) {
            var e = document.getElementById(id);
            e.style.visibility = e.style.visibility === 'collapse' ? 'visible' : 'collapse';
        }
</script>`;
  outputHTML += `</body></html>`;
  return outputHTML;
};

function deltaTime(time) {
  let vlq = time & 0x7f;
  let outBytes = [];
  if (time === 0) {
    return [0];
  }
  while (time > 0) {
    time = time >> 7;
    outBytes.unshift(vlq);
    vlq = (time & 0x7f) | 0x80;
  }
  return outBytes;
}
function toBytes(num, len) {
  let arr = [];
  for (let i = (len - 1) * 8; i >= 0; i -= 8) {
    arr.push((num >> i) & 0xff);
  }
  return arr;
}
function findCommandInTable(data, ins, com) {
  if (ins > 0x3f) {
    return Number.MAX_VALUE;
  }
  let table = data.instruments.params[ins][6] - 32;
  if (table >= 0) {
    for (let i = 0; i < 16; i++) {
      if (data.tables.fx[table][i] === com) {
        return i + data.tables.fxval[table][i];
      } else if (data.tables.fx2[table][i] === com) {
        return i + data.tables.fx2val[table][i];
      }
    }
  }
  return Number.MAX_VALUE;
}
function processTempoMetaTrack(metaEventList, tempoAdjust) {
  function compare(a, b) {
    let comparison = 0;
    if (a.time > b.time) {
      comparison = 1;
    } else if (a.time < b.time) {
      comparison = -1;
    }
    return comparison;
  }
  let prefix = [0xff, 0x51, 0x03];
  let sortedEvents = [];
  let trackOutput = [];
  let seen = {};
  for (let i = 0; i < metaEventList.length; i++) {
    let temp =
      String(metaEventList[i].time) +
      String(metaEventList[i].type) +
      String(metaEventList[i].val);
    if (!(temp in seen)) {
      seen[temp] = true;
      sortedEvents.push(metaEventList[i]);
    }
  }
  sortedEvents = sortedEvents.sort(compare);
  let lastEvent = sortedEvents[0];
  trackOutput.push(
    ...deltaTime(lastEvent.time + 5),
    ...prefix,
    ...toBytes(
      Math.round((1 / ((lastEvent.val * tempoAdjust) / 60)) * 1000000),
      3
    )
  );
  for (let i = 1; i < sortedEvents.length; i++) {
    let currEvent = sortedEvents[i];
    trackOutput.push(
      ...deltaTime(currEvent.time - lastEvent.time),
      ...prefix,
      ...toBytes(
        Math.round((1 / ((currEvent.val * tempoAdjust) / 60)) * 1000000),
        3
      )
    );
    lastEvent = currEvent;
  }
  return trackOutput;
}
export const makeMIDI = function(data) {
  const EFFECTS = getVersionEffects(data);
  let grooveSum = 0;
  let grooveLength = 16;
  for (let i = 0; i < 16; i++) {
    grooveSum += data.grooves[0][i];
    if (data.grooves[0][i] === 0) {
      grooveLength = i;
      break;
    }
  }
  let ticksPerQuarter = toBytes(((grooveSum) / grooveLength) * 80, 2);
  let adjustedTempo = (data.tempo * grooveLength * 6.0) / grooveSum;
  let midiTempo = Math.round((1 / (adjustedTempo / 60.0)) * 1000000);
  let tracks = [];
  let trackLength;
  // standard midi file header for multitrack with 5 tracks (1st track is just tempo and general midi info)
  let mThd = [
    0x4d,
    0x54,
    0x68,
    0x64,
    0x00,
    0x00,
    0x00,
    0x06,
    0x00,
    0x01,
    0x00,
    0x05,
    ...ticksPerQuarter
  ];
  // standard midi track header
  let mTrk = [0x4d, 0x54, 0x72, 0x6b];
  // time signature and key signature data
  let metaTrack = [
    0x00,
    0xff,
    0x58,
    0x04,
    0x04,
    0x02,
    0x18,
    0x08,
    0x00,
    0xff,
    0x59,
    0x02,
    0x00,
    0x00
  ];
  // Throw midi tempo into the initial midi data
  metaTrack.push(...[0x00, 0xff, 0x51, 0x03, ...toBytes(midiTempo, 3)]);
  let currEvent;
  let lastEvent;
  let eventList = [];
  let metaEventList = [];
  // loop through channels
  for (let channel = 0; channel < 4; channel++) {
    console.log("Processing channel " + CHANS[channel]);
    // keep track of time since last event
    let lastEventTime = 0;
    let currNote;
    let currInstrument;
    let noteKillTime;
    let delayTime;
    let groove = 0;
    let grooveStep = 6;
    lastEvent = {
      time: 0
    };
    // create new array for the current track
    tracks.push([]);
    eventList.push([]);
    eventList[channel].push(lastEvent);
    // add track name (just the number of the track)
    tracks[channel].push(0x00, 0xff, 0x03, 0x01, channel + 0x31);
    let currChan = CHANS[channel];
    // loop through chains
    let startOffset = 0;
    let hopsLeft = 0;
    for (let i = 0; i < 254; i++) {
      let currChain = data.songchains[currChan][i];
      if (currChain !== 255) {
        console.log("-- Processing chain " + currChain.toString(16));
        // loop through phrases
        for (let j = 0; j < 16; j++) {
          let currPhrase = data.chains.phrases[currChain][j];
          let transpose = data.chains.transpose[currChain][j];
          if (transpose > 127) {
            transpose = transpose - 256;
          }
          if (currPhrase !== 255) {
            console.log("---- Processing phrase " + currPhrase.toString(16));
            // loop through notes and create events for all note starts
            for (let k = 0; k < 16; k++) {
              console.log("------ Processing note row " + k.toString(16));
              if (EFFECTS[data.phrases.fx[currPhrase][k]] === "H") {
                if (data.phrases.fxval[currPhrase][k] < 0x10) {
                  startOffset = data.phrases.fxval[currPhrase][k];
                  k += 16;
                } else {
                  startOffset = data.phrases.fxval[currPhrase][k] % 16;
                  hopsLeft = data.phrases.fxval[currPhrase][k] / 16;
                  console.log(hopsLeft);
                  k += 16;
                }
              } else {
                if (EFFECTS[data.phrases.fx[currPhrase][k]] === "T") {
                  metaEventList.push({
                    time: lastEventTime,
                    type: "Tempo",
                    val: data.phrases.fxval[currPhrase][k]
                  });
                }
                if (EFFECTS[data.phrases.fx[currPhrase][k]] === "G") {
                  groove = data.phrases.fxval[currPhrase][k];
                  grooveStep = 0;
                }
                if (data.grooves[groove][grooveStep] === 0 || grooveStep > 15) {
                  grooveStep = 0;
                }
                currNote = data.phrases.notes[currPhrase][k];
                if (currNote !== 0) {
                  if (data.phrases.instruments[currPhrase][k] !== 255) {
                    currInstrument = data.phrases.instruments[currPhrase][k];
                  }
                  if (currInstrument === 0x40 || (data.instruments.params[currInstrument][5] & 32) !== 0) {
                    if (currNote + MIDIOFFSET < 128) {
                      currNote += MIDIOFFSET;
                    }
                  } else {
                    if (currNote + MIDIOFFSET + transpose < 128) {
                      currNote += MIDIOFFSET + transpose;
                    }
                  }
                  if (EFFECTS[data.phrases.fx[currPhrase][k]] === "D") {
                    delayTime = 20 * data.phrases.fxval[currPhrase][k];
                  } else {
                    delayTime = 0;
                  }
                  noteKillTime =
                    20 * findCommandInTable(data, currInstrument, 8);
                  currEvent = {
                    time: lastEventTime + delayTime,
                    note: currNote,
                    kill: noteKillTime
                  };
                  if (currEvent.time <= lastEvent.time) {
                    eventList[channel].pop();
                  }
                  eventList[channel].push(currEvent);
                  lastEvent = eventList[channel][eventList[channel].length - 1];
                }
                if (EFFECTS[data.phrases.fx[currPhrase][k]] === "K") {
  let noteStartTime = eventList[channel][eventList[channel].length - 1].time;
  let baseDuration = lastEventTime - noteStartTime;

  // Add extra duration if Kxx > 0 (convert K value to duration)
  let extraDuration = data.phrases.fxval[currPhrase][k] > 0
    ? data.phrases.fxval[currPhrase][k] * 20
    : 0;

  // Update the kill time for the note
  eventList[channel][eventList[channel].length - 1].kill = baseDuration + extraDuration;
}

                lastEventTime += 20 * data.grooves[groove][grooveStep];
                grooveStep += 1;
              }
            }
          }
          // skip to next chain upon first blank phrase row
          else {
            j += 16;
          }
        }
      }
    }
    // process note off and write the track
    lastEvent = eventList[channel][0];
    tracks[channel].push(
      ...[...deltaTime(0x0), 0x90 + channel, lastEvent.note, 0x70]
    );
    for (let event = 1; event < eventList[channel].length; event++) {
      currEvent = eventList[channel][event];
      if (currEvent.time > lastEvent.time + lastEvent.kill) {
        tracks[channel].push(
          ...[...deltaTime(lastEvent.kill), 0x80 + channel, lastEvent.note, 0x0]
        );
        tracks[channel].push(
          ...[
            ...deltaTime(currEvent.time - (lastEvent.time + lastEvent.kill)),
            0x90 + channel,
            currEvent.note,
            0x70
          ]
        );
      } else {
        tracks[channel].push(
          ...[
            ...deltaTime(currEvent.time - lastEvent.time),
            0x80 + channel,
            lastEvent.note,
            0x0
          ]
        );
        tracks[channel].push(
          ...[...deltaTime(0), 0x90 + channel, currEvent.note, 0x70]
        );
      }
      lastEvent = currEvent;
    }
    // push last note kill
    if (currEvent !== undefined) {
    tracks[channel].push(
      ...[
        ...deltaTime(Math.min(currEvent.kill, 120)),
        0x80 + channel,
        currEvent.note,
        0x0
      ]
    );
    }
    tracks[channel].push(...[0x00, 0xff, 0x2f, 0x00]);
    trackLength = tracks[channel].length;
    tracks[channel].unshift(...toBytes(trackLength, 4));
    tracks[channel].unshift(...mTrk);
  }
  if (metaEventList.length > 0) {
    metaTrack.push(
      ...processTempoMetaTrack(metaEventList, adjustedTempo / data.tempo)
    );
  }
  metaTrack.push(...[0x00, 0xff, 0x2f, 0x00]);
  metaTrack.unshift(...toBytes(metaTrack.length, 4));
  metaTrack.unshift(...mTrk);
  return Uint8Array.from(mThd.concat(...metaTrack, ...tracks));
};

/**
 *
 * @param {LSDJSngFile} data
 * @returns {string[]}
 */
const getVersionEffects = (data) => {
  let output = ["-", "A"];
  if (data.version > 7) {
    output.push("B");
  }
  return output.concat([
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "K",
    "L",
    "M",
    "O",
    "P",
    "R",
    "S",
    "T",
    "V",
    "Z"
  ]);
}
