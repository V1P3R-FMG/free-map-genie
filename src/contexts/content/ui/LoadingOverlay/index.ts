import { Overlay } from "./Overlay";

import { createIsolatedReactElement } from "@/common/ui/isolated";

export const mountLoadingOverlay = async (message?: string) => {
  const component = await createIsolatedReactElement({
    name: "fmg-loading-overlay",
    component: Overlay,
    props: { message: message ?? "FMG Initializing..." },
    anchor: "body",
    css: {
      url: await BrowserUtils.getCssUrl(),
    },
  });

  return () => {
    component.unmount();
  };
};
