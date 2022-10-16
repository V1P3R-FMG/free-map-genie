import { getOptions, getSettings, setSettings } from "../shared/settings";
import send from "./send";

type Status = {
    is_list: boolean,
    is_map: boolean,
    is_guide: boolean
}

let Settings: ExtensionSettings|undefined;
let $buttons: Array<JQuery<HTMLElement>> = [];
let $optionElements: Array<JQuery<HTMLElement>> = [];
let $statusElements: Array<JQuery<HTMLElement>> = [];

//Reload button to reload extension when enabled in html
$(".reload-button").on("click", () => send("reload_window").then(() => chrome.runtime.reload()));

//Shortcut to mapgenie homepage
$(".mapgenie-button").on("click", () => chrome.tabs.create({ url: "https://mapgenie.io" }));

//Closes the extension
$(".close-button").on("click", window.close.bind(window));

//Add options
function addCheckboxOption(name: string, label: string, checked: boolean, tooltip: string ="") {
    const $optionElement = $(`<div class="option" type="checkbox">
        <div class="toggle-button-cover">
            <div class="button r">
                <input class="checkbox" type="checkbox" id=${name}>
                <div class="knobs"></div>
                <div class="layer"></div>
            </div>
        </div>
        <span data-tooltip="${tooltip}">${label}</span>
        <i class="info fa fa-question-circle"></i>
    </div>`);

    $optionElement.find(".checkbox").prop("checked", checked).on("click", function () {
        if (!Settings) throw Error("Setting wasn't Initialized");

        Settings[name as keyof ExtensionSettings] = (this as HTMLInputElement).checked;
        setSettings(Settings);
        chrome.storage.sync.set({ config: Settings });
    });

    const $label = $optionElement.find("span[data-tooltip]");
    $optionElement.find(".info").on("mouseover", function () {
        $label.addClass("hover");
    }).on("mouseout", function () {
        $label.removeClass("hover");
    });

    $(".options").append($optionElement);

    $optionElements.push($optionElement);
}

for (let option of getOptions()) {
    switch(option.type) {
        case "checkbox":
            addCheckboxOption(option.name, option.label, option.default, option.tooltip);
            break;
    }
}

//Add status elements
["map", "guide"].forEach(name => {
    const $statusElement = $(`<div class="status" id="${name}">
        <div class="status-dot"></div>
        <span>${name}</span>
    </div>`);

    $(".statuses").append($statusElement);

    $statusElements.push($statusElement);
});

//Get status
send("get_status").then((status: Status) => {
    // let activeCount = 0;
    for (let $statusElement of $statusElements) {
        if (status?.[`is_${$statusElement.attr("id")}` as keyof Status]) {
            // activeCount++;
            $statusElement.addClass("active");
        } else {
            $statusElement.removeClass("active");
        }
    }
    for (let $btn of $buttons) {
        $btn.prop("disabled", !(status.is_map || status.is_guide));
    }
});

//Map data buttons to extract, import or clear data;
[
    ["button#export", "export_mapdata"],
    ["button#import", "import_mapdata"],
    ["button#clear", "clear_mapdata"]
].forEach(([ selector, action ]) => {
    $buttons.push($(selector).on("click", () => {
        send(action);
        window.close();
    }));
})

//Set extension info at the footer
fetch(chrome.runtime.getURL("settings.json"))
	.then(res => res.json())
	.then(settings => {
		$("#version").text(`v${chrome.runtime.getManifest().version_name}${settings.debug ? "-debug" : ""}`);
		$("#author").text(`by ${chrome.runtime.getManifest().author || "me"}`).on("click", () => {
			chrome.tabs.create({ url: "https://github.com/V1P3R-FMG/free-map-genie" });
		});
	});

getSettings().then(settings => {
    Settings = settings;
    for (let $optionElement of $optionElements) {
        let type = $optionElement.attr("type");
        if (type === "checkbox") {
            let $input = $optionElement.find("input");
            $input.prop("checked", settings[$input.attr("id") as keyof ExtensionSettings]);
        }
    }
});
