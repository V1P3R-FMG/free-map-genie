import { waitForProperty } from "@/common/object";

export const useOnStateUpdateHook = (onUpdate: (state: MG.State) => void) => {
  React.useEffect(() => {
    waitForProperty(window, "store").then((store) => {
      store!.subscribe(() => {
        const state = window.store!.getState();
        onUpdate(state);
      });

      // Call onUpdate immediately with the current state
      const state = store!.getState();
      onUpdate(state);
    });
  }, [onUpdate]);
};

export const OnStateUpdate = ({ onUpdate }: OnStateUpdate.Props) => {
  useOnStateUpdateHook(onUpdate);
  return null;
};

export namespace OnStateUpdate {
  export interface Props {
    onUpdate(state: MG.State): void;
  }
}
