import { proxy } from "valtio";

export const store = proxy<{
  inputId: string;
  outputId: string;
  sendMidi: (data: Uint8Array<ArrayBufferLike>) => void;
}>({
  inputId: "",
  outputId: "",
  sendMidi: () => { },
});
