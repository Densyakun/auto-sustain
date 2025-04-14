import { readFileSync } from "fs";
import { MusicalPerformanceDataType } from "../src/type";
import { plot, Plot } from 'nodeplotlib';

const performanceDataResponse: MusicalPerformanceDataType[][] = JSON.parse(readFileSync("./mid/performanceData.json", "utf-8"));

const songIndex = 3;
const song = performanceDataResponse[songIndex];

const a = song[0].noteVelocities.length;

const noteTrace: Plot = {
  type: 'heatmap',
  x: Array(song.length).fill(0).map((_, i) => song[i].time),
  z: Array(a).fill(0).map((_, i) =>
    Array(song.length).fill(0).map((_, j) => song[j].noteVelocities[i])
  ),
};

const holdTrace: Plot = {
  x: Array(song.length).fill(0).map((_, i) => song[i].time),
  y: Array(song.length).fill(0).map((_, i) => song[i].hold),
  type: 'scatter',
  yaxis: 'y2',
};

plot([noteTrace, holdTrace], {
  yaxis: {
    title: {
      text: 'note velocity'
    }
  },
  yaxis2: {
    title: {
      text: 'hold'
    },
    overlaying: 'y',
    side: 'right'
  }
});
