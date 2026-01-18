import ReactDOM from "react-dom/client";

export type Component<P extends {}> =
  | React.FunctionComponent<P>
  | React.ComponentClass<P>;

export class MountableComponent<P extends {}> {
  private readonly props: P;

  private root?: ReactDOM.Root;

  public constructor(props: P) {
    this.props = props;
  }

  public mount(container: ReactDOM.Container) {
    this.root = ReactDOM.createRoot(container);
    this.root.render(this.render(this.props));
  }

  public unmount() {
    this.root?.unmount();
  }

  protected render(props: P): React.ReactNode {
    return null;
  }

  protected mergeProps(prev: P, next: Partial<P>) {
    return { ...prev, ...next };
  }

  public update(props: Partial<P>) {
    Object.assign(this.props, props);
    this.root?.render(this.render(this.props));
  }
}
