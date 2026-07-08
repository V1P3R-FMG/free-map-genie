import { waitForProperty } from "@/common/object";

export const useOnStateUpdateHook = (onUpdate: (state: MG.State) => void) => {
  const update = () => {
    const state = window.store!.getState();
    onUpdate(state);
  };

  React.useEffect(() => {
    waitForProperty(window, "store").then((store) => {
      store!.subscribe(update);

      // Call onUpdate immediately with the current state
      update();
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
