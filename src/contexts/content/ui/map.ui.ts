import { createApp } from "vue";
import type { AllowedComponentProps, Component, VNodeProps } from "vue";

type ComponentProps<C extends Component> = C extends new (...args: any) => any
    ? Omit<InstanceType<C>["$props"], keyof VNodeProps | keyof AllowedComponentProps>
    : never;

type ComponentInstance<C extends Component> = C extends new (...args: any) => any ? InstanceType<C> : never;

import ControlPanel from "./control-panel.vue";
import ControlPanelButton from "./control-panel-button.vue";

class UI {
    private _controlPanel?: ComponentInstance<typeof ControlPanel>;
    private _controlPanelButton?: ComponentInstance<typeof ControlPanelButton>;

    public get controlPanel() {
        if (!this._controlPanel) throw "Component 'ControlPanel' is not attached.";
        return this._controlPanel;
    }

    public get controlPanelButton() {
        if (!this._controlPanelButton) throw "Component 'ControlPanelButton' is not attached.";
        return this._controlPanelButton;
    }

    private mount<C extends Component>(element: HTMLElement, component: C, props?: ComponentProps<C>) {
        return createApp(component, props).mount(element) as unknown as ComponentInstance<C>;
    }

    private mountControlPanel(props?: ComponentProps<typeof ControlPanel>) {
        const $container = $("<div>")
            .css({
                position: "absolute",
                top: 0,
                bottom: 0,
                width: "404px",
            })
            .appendTo("#app");
        return this.mount($container[0], ControlPanel, props);
    }

    private mountControlPanelButton(props?: ComponentProps<typeof ControlPanelButton>) {
        const $div = $("<div>");
        $(".mapboxgl-ctrl-bottom-right").children().first().before($div);
        return this.mount($div[0], ControlPanelButton, props);
    }

    public async attach() {
        this._controlPanel = this.mountControlPanel();

        this._controlPanelButton = this.mountControlPanelButton({
            onClick: () => this.controlPanel.toggle(),
        });
    }
}

export default new UI();
