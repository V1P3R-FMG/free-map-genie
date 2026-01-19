import ReactDOM from "react-dom/client";
import { resolveParent, type Parent } from "./mount";

export type Component<P extends {}> =
  | React.FunctionComponent<P>
  | React.ComponentClass<P>;

type ComponentParameters<P extends {}> = keyof P extends never
  ? Parameters<(props?: P) => void>
  : Parameters<(props: P) => void>;

export class MountableComponent<P extends {}> {
  protected readonly props: P;

  private root?: ReactDOM.Root;

  public constructor(...args: ComponentParameters<P>) {
    const [props] = args;

    this.props = props ?? ({} as P);
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

  protected shouldUpdate(nextProps: P) {
    return true;
  }

  protected mergeProps(props: Partial<P>) {
    return { ...this.props, ...props };
  }

  public update(props: Partial<P>) {
    const nextProps = this.mergeProps(props);
    if (!this.shouldUpdate(nextProps)) {
      return;
    }

    Object.assign(this.props, nextProps);
    this.root?.render(this.render());
  }
}
