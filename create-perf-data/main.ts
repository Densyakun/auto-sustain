import { readdirSync, readFileSync, writeFileSync } from "fs";
import { MusicalPerformanceDataType } from "../src/type";
import Midi from "@tonejs/midi";
import path from "path";

// MIDIファイルから演奏データセットを作成
const performanceList: MusicalPerformanceDataType[][] = [];

readdirSync("mid").forEach(file => {
  if (!file.endsWith(".mid")) return;

  const data = readFileSync(path.resolve("mid", file));
  const midi = new Midi.Midi(data);

  // デバッグ用にノートの範囲を出力する
  midi.tracks.forEach((track, trackIndex) =>
    console.log(`${file}, ${trackIndex}: ${Math.min(...track.notes.map(note => note.midi))} ~ ${Math.max(...track.notes.map(note => note.midi))}`)
  );

  const performanceData: MusicalPerformanceDataType[] = [];

  // サスティンをまとめ、並び替える
  const sustain = midi.tracks.flatMap(track =>
    track.controlChanges.sustain
  ).sort(cc => cc.ticks);

  // 全トラックのノートのオンオフとサスティンをまとめる
  const lastNodeIndice = Array(midi.tracks.length).fill(0);
  let ticks = -1;
  let isHold = 0;

  function add(toTicks = -1) {
    midi.tracks.forEach((track, trackIndex) => {
      // notesは時間に対し並び替えられている
      const notes = track.notes;
      while (lastNodeIndice[trackIndex] < notes.length) {
        const note = notes[lastNodeIndice[trackIndex]];
        if (toTicks !== -1 && toTicks < notes[lastNodeIndice[trackIndex]].ticks) break;

        // ノートのオンオフがまとめられている
        const p = performanceData.find(value => value.time === note.ticks);
        if (p)
          p.noteVelocities[note.midi] = note.velocity;
        else
          performanceData.push({
            time: note.ticks,
            noteVelocities: Array(128).fill(NaN).map((_, index) => index === note.midi ? note.velocity : NaN),
            //hold: isHold ? 1 : 0,
            hold: isHold,
          });
        const pe = performanceData.find(value => value.time === note.ticks + note.durationTicks);
        if (pe)
          pe.noteVelocities[note.midi] = 0;
        else
          performanceData.push({
            time: note.ticks + note.durationTicks,
            noteVelocities: Array(128).fill(NaN).map((_, index) => index === note.midi ? 0 : NaN),
            //hold: isHold ? 1 : 0,
            hold: isHold,
          });

        lastNodeIndice[trackIndex]++;
      }
    });
  }

  sustain.forEach(cc => {
    add(cc.ticks);
    ticks = cc.ticks;
    //isHold = 0 < cc.value;
    isHold = cc.value;
  });
  add();

  // データを時間順に並び替える
  performanceData.sort((a, b) => a.time - b.time);

  // ノートのオンオフがないデータを埋める
  const isPressed = Array(128).fill(0);
  performanceData.forEach((data, index) => {
    data.noteVelocities.forEach((value, noteIndex) => {
      if (!isNaN(value))
        isPressed[noteIndex] = value;

      performanceData[index].noteVelocities[noteIndex] = isPressed[noteIndex];
    });
  });

  performanceList.push(performanceData);
});

writeFileSync("mid/performanceData.json", JSON.stringify(performanceList));
