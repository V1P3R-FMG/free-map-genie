export interface ConfirmState {
  message: string;
  visible: boolean;
}

export const useConfirm = (cb: (accepted?: boolean) => void) => {
  const [visible, setVisible] = React.useState(false);

  const state = {
    visible,
    onConfirm(accepted: boolean) {
      setVisible(false);
      cb(accepted);
    },
  };

  const open = React.useCallback(() => setVisible(true), []);
  const close = React.useCallback(() => setVisible(false), []);

  return { state, open, close };
};
