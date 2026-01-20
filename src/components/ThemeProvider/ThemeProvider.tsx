import "./themes/dark.css";
import "./themes/light.css";

export const ThemeProvider = (props: ThemeProvider.Props) => {
  return (
    // Fallback to dark theme if selected theme is not available
    <div data-theme="dark">
      <div data-theme={props.theme}>{props.children}</div>
    </div>
  );
};

namespace ThemeProvider {
  export interface Props extends React.PropsWithChildren {
    theme: string;
  }
}
