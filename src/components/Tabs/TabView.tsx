import type { FmgIconsId } from "../FontIcon";

export const TabView = (props: TabView.Props) => {
  return <div>{props.children}</div>;
};

export namespace TabView {
  export interface Props extends React.PropsWithChildren {
    name: string;
    icon: FmgIconsId;
  }
}
