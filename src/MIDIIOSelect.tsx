import { FormControl, InputLabel, MenuItem, Select, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { useSnapshot } from "valtio";
import { store } from "./store";
import { inputMessage } from "./sustain";

export default function MIDIIOSelect() {
  const { inputId, outputId } = useSnapshot(store);

  const [inputs, setInputs] = useState<{ [key: string]: MIDIInput }>({});
  const [outputs, setOutputs] = useState<{ [key: string]: MIDIOutput }>({});

  useEffect(() => {
    window.navigator.requestMIDIAccess().then((midi) => {
      setInputs(Object.fromEntries(Array.from(midi.inputs.entries())));
      setOutputs(Object.fromEntries(Array.from(midi.outputs.entries())));
    });
  }, []);

  useEffect(() => {
    if (!inputId) return;

    const input = inputs[inputId];
    if (!input) return;

    input.onmidimessage = inputMessage;

    return () => {
      input.onmidimessage = null;
    };
  }, [inputId, inputMessage]);

  useEffect(() => {
    if (!outputId) return;

    const output = outputs[outputId];
    if (!output) return;

    store.sendMidi = (data: Uint8Array<ArrayBufferLike>) => output.send(data);

    return () => {
      store.sendMidi = () => { };
    };
  }, [outputId]);

  return (
    <>
      <Stack spacing={1}>
        <FormControl fullWidth>
          <InputLabel id="midi-input-select-label">Input</InputLabel>
          <Select
            labelId="midi-input-select-label"
            id="midi-input-select"
            value={inputId}
            label="Input"
            onChange={event =>
              store.inputId = inputs[event.target.value as string].id
            }
          >
            {Object.entries(inputs).map(([key, value]) => (
              <MenuItem key={key} value={key}>{value.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel id="midi-output-select-label">Output</InputLabel>
          <Select
            labelId="midi-output-select-label"
            id="midi-output-select"
            value={outputId}
            label="Output"
            onChange={event =>
              store.outputId = outputs[event.target.value as string].id
            }
          >
            {Object.entries(outputs).map(([key, value]) => (
              <MenuItem key={key} value={key}>{value.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
    </>
  );
}