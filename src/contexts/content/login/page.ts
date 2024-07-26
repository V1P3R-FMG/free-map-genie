import Data from "./data";
import Channel from "./channel";

class Page {
    public async getButtonFormGroup(): JQueryAsync<HTMLElement> {
        return $.waitFor(`form button[type="submit"]`).then((el) => el.parent());
    }

    public async addSpace(): JQueryAsync<HTMLDivElement> {
        const buttonGroup = await this.getButtonFormGroup();
        return $<HTMLDivElement>("<div/>")
            .css({
                padding: "0 15px",
            })
            .appendTo(buttonGroup);
    }

    public async addMockUserButton(): JQueryAsync<HTMLButtonElement> {
        const buttonGroup = await this.getButtonFormGroup();
        return $<HTMLButtonElement>("<button/>")
            .text("Mock User")
            .addClass("btn btn-outline-secondary")
            .attr("type", "button")
            .on("click", () => {
                Data.enableMockUser(true);
                Channel.sendLogin();
            })
            .appendTo(buttonGroup);
    }
}

export default new Page();
