import "./themes/dark.css";
import "./themes/light.css";

import "./ThemeProvider.css";

export const ThemeProvider = (props: ThemeProvider.Props) => {


  React.useEffect(() => {
    document.body.setAttribute("data-theme", props.theme ?? "dark");

    return () => {
      document.body.removeAttribute("data-theme");
    };
  }, [props.theme]);

  return <>{props.children}</>
};

namespace ThemeProvider {
  export interface Props extends React.PropsWithChildren {
    theme: string;
  }
}
