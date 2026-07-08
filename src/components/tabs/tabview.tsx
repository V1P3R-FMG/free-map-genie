import type { FmgIconsId } from "../fonticon";

export const TabView = (props: TabView.Props) => {
  return <>{props.children}</>;
};

export namespace TabView {
  export interface Props extends React.PropsWithChildren {
    name: string;
    icon: FmgIconsId;
  }
}
