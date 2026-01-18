import ReactDOM from "react-dom/client";
import { resolveParent, type Parent } from "./mount";

export type Component<P extends {}> =
  | React.FunctionComponent<P>
  | React.ComponentClass<P>;

export class MountableComponent<P extends {}> {
  protected readonly props: P;

  private root?: ReactDOM.Root;

  public constructor(props: P) {
    this.props = props;
  }

  public mount(parent?: Parent) {
    if (this.root) {
      throw new Error("Component allready mounted.");
    }

    const container = resolveParent(parent);

    if (!container) {
      logger.warn("Failed to mount component, parent element not found.", {
        parent,
        component: this,
      });
      return;
    }

    this.root = ReactDOM.createRoot(container);
    this.root.render(this.render());
  }

  public unmount() {
    this.root?.unmount();
  }

  protected render(): React.ReactNode {
    return null;
  }

  protected mergeProps(prev: P, next: Partial<P>) {
    return { ...prev, ...next };
  }

  public update(props: Partial<P>) {
    Object.assign(this.props, props);
    this.root?.render(this.render());
  }
}
