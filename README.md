# Free Mapgenie Pro

Chrome extension that unlocks [Mapgenie](https://mapgenie.io/) PRO features for free. The extension is only tested on the [DL2 villedor Map](https://mapgenie.io/dying-light-2/maps/villedor) and [Elden Ring Map](https://mapgenie.io/elden-ring) and works fine so far. But I'm pretty sure it will work on other maps too. The extenions should work on both the maps and the guides(tools).

## Table Of Contents

-   [Ideas for the future](#ideas-for-the-future)
-   [How does it work](#how-does-it-work)
-   [Preview](#preview)
    -   [Mainpage](#mainpage)
    -   [Map](#map)
    -   [Guide](#guide)
-   [Installation](#installation)
    -   [Install guide chrome](#install-guide-chrome)
    -   [Install guide firefox](#install-guide-firefox)
-   [Build guide](#build-guide)
    -   [Build guide chrome](#build-guide-chrome)
    -   [Build guide firefox](#build-guide-firefox)
-   [Changelog](#changelog)

<br>
<hr>
<br>

## Ideas For The Future

Instead of an extension, use the node.js electron package to open mapgenie maps.<br>
And change scripts before loading into weppage, this makes it possible to save data to disk.
Saving data to disk is better than the browser's local storage because it can be accidentally deleted.

I also want to experiment with cloud storage to store data so that it can be accessed on different devices.

## How Does It Work

It blocks a couple of API calls that saves your data.<br>
And instead saves it in your local browser storage.<br>
This enables the ability for tracking more then 100 locations and 2 categories.
Not all pro features are supported. So if you want a pro feature or have an nice idea create a pull request.

| <h1>:warning:</h1> | beware this extension blocks all api calls that saves data to mapgenie's database and instead saves it locally on the browser. This means your data will not be transferred to other browsers.And This also means it can be accidentally deleted by clearing your browser cache. So export your data before you clear your browser or switch browsers. | <h1>:warning:</h1> |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------ |

## Preview

### Mainpage

-   Added a search bar with fuzzy search
    ![mainpage preview](./assets/previews/mg_mainpage.png?raw=true)

### Map

-   Unlimited locations marking
-   Unlimited category tracking
-   Presets unlocked
-   Remember visible categories setting unlocked
-   Added a total progress bar for tracked categories
    ![map preview](./assets//previews/mg_map.png?raw=true)

### Guide

-   Unlimited locations marking
    ![guide preview](./assets//previews/mg_guide.png?raw=true)

## Installation

### Install guide chrome

-   Download and extract dist/fmg-chrome-vX.X.X.zip.
-   Navigate to "chrome://extensions/" in the url bar... .
-   Toggle on "Developer mode" in the top-right corner.
-   Click "Load extension".
-   Select the unzipped folder.
-   The extension should now be installed.

### Install guide firefox

-   Download and extract dist/fmg-firefox-vX.X.X.zip.
-   Click the menu button in the top-right corner.
-   Select "Add-ons and themes."
-   Press the gear button under the "search addons.morzila.org" search bar.
-   Select "Install Add-on From File...".
-   Select the exported file it should end with .xpi.
-   The extension should now be installed.

## Build Guide

### Build guide chrome

-   Install [node.js + npm](https://nodejs.org/en/download/) if you don't already have it.
-   Open the project in a terminal and type `npm install` this will install some dependencies.
-   Build the extension with in debug mode `npm run build-dev -- -b "chrome"` or for production `npm run build-prod -- -b "chrome"`.
    <br> You can also add a watch flag to auto build the new extensions when the source file changes
-   after this the extension will be build under the folder dist.
-   Reference the [Chrome install guide](#install-guide-chrome) section for installation.

### Build guide firefox

-   Install [node.js + npm](https://nodejs.org/en/download/) if you don't already have it.
-   Open the project in a terminal and type `npm install` this will install some dependencies.
-   To build a firefox extension, you first need to get some api keys from [addons.mozilla.org credentials](https://addons.mozilla.org/en-US/developers/addon/api/key/).
    -   Press "Generate new credentials"
        ![firefox generate keys](./assets//firefox/firefox_generate_keys.png?raw=true)
    -   Your JWT issuer is your KEY and looks something like `user:12345:67`<br>
        And your JWT secret is your SECRET and looks something like `634f34bee43611d2f3c0fd8c06220ac780cff681a578092001183ab62c04e009`.
        ![firefox keys](./assets//firefox/firefox_keys.png?raw=true)
    -   After getting your keys, create a `.env` file.
        And fill in your credentials like the picture below.
        ![firefox keys](./assets//firefox/firefox_env.png?raw=true)
-   Build the extension with in debug mode `npm run build-dev -- -b "firefox"` or for production `npm run build-prod -- -b "firefox"`.
    <br> You can also add a watch flag to auto build the new extensions when the source file changes
-   After this the extension will be build under the folder dist.
-   Reference the [Firefox install guide](#install-guide-firefox) section for installation.
