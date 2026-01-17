import React from "react";
import ReactDOM from "react-dom/client";
import {
  createIsolatedElement,
  type CreateIsolatedElementOptions,
} from "@webext-core/isolated-element";

export type Component<P extends {}> =
  | React.FunctionComponent<P>
  | React.ComponentClass<P>;

export interface IsolatedReactElement<P extends {}> {
  name: string;
  component: Component<P>;
  props: P;
  anchor?: Element | string;
  css?: CreateIsolatedElementOptions["css"];
}

export const createIsolatedReactElement = async <P extends {}>({
  name,
  component,
  props,
  anchor,
  css,
}: IsolatedReactElement<P>) => {
  const { isolatedElement, parentElement } = await createIsolatedElement({
    name,
    css,
    mode: "open",
  });

  const root = ReactDOM.createRoot(isolatedElement);

  const render = () => {
    root.render(React.createElement(component, props));
  };

  render();

  const anchorElement =
    typeof anchor === "string"
      ? document.querySelector(anchor)
      : (anchor ?? document.body);

  anchorElement?.appendChild(parentElement);

  const updateProps = (newProps: Partial<P>) => {
    Object.assign(props, newProps);
    render();
  };

  const unmount = () => {
    root.unmount();
    parentElement.remove();
  };

  return {
    updateProps,
    unmount,
  };
};
