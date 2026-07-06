import { TabView } from "./TabView";
import { Tab } from "./Tab";

import style from "./Tabs.module.scss";

export type TabViewElement = React.ReactElement<TabView.Props, typeof TabView>;
export const TabsContainer = (props: TabsContainer.Props) => {
  const pages = React.Children.map(props.children ?? [], (child) => ({
    name: child.props.name,
    icon: child.props.icon,
  }));

  const [currentPageName, setCurrentPageName] = React.useState(
    pages?.[0]?.name ?? ""
  );

  return (
    <div className={style.tabsContainer}>
      <div className={style.tabBar}>
        {pages.map((page) => (
          <Tab
            key={page.name}
            name={page.name}
            icon={page.icon}
            selected={page.name === currentPageName}
            onClick={(name) => setCurrentPageName(name)}
          />
        ))}
      </div>
      <div className={style.tabViews}>
        {React.Children.map(props.children ?? [], (child) => (
          <div
            className={clsx(style.tabViewContainer, {
              [style.active]: child.props.name === currentPageName,
            })}
            key={child.props.name}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
};

export namespace TabsContainer {
  export interface Props {
    children?: TabViewElement | TabViewElement[];
  }
}
