<h1 align="center">Browser Action Popup</h1>
<p align="center">
    <img src="../assets/popup/pages/bookmarks-with-data.png" />
    <img src="../assets/popup/pages/settings.png" />
</p>
<hr>
<ul>
    <li><a href="#pinning">Pinning the browser action</a></li>
    <ul>
        <li><a href="#chrome-pinning">Chrome</a></li>
        <li><a href="#firefox-pinning">Firefox</a></li>
    </ul>
    <li><a href="#using">Using the browser action</a></li>
    <ul>
        <li>
            <a href="#bookmarks">
                <img src="../assets/popup/icons/bookmarks.png" style="transform: translateY(25%)"/>
                Bookmarks
            </a>
        </li>
        <li>
            <a href="#settings">
                <img src="../assets/popup/icons/settings.png" style="transform: translateY(25%)"/>
                Settings
            </a>
        </li>
        <li>
            <a href="#info">
                <img src="../assets/popup/icons/info.png" style="transform: translateY(25%)"/>
                Info
            </a>
        </li>
        <li>
            <a href="#data">
                <img src="../assets/popup/icons/data.png" style="transform: translateY(25%)"/>
                Data
            </a>
        </li>
    </ul>
</ul>

<hr>
<h2 id="pinning">Pinning the browser action</h2>
<h3 id="chrome-pinning">Chrome</h3>
<ol>
    <li>
        <p>Press the <code>puzzle piece icon</code> on the top right balk.</p>
        <p><img src="../assets/popup/chrome-extension-pin.png" /></p>
    </li>
    <li>
        <p>Search for the <code>fmg</code> extension and press the <code>drawing pin</code> icon.</p>
        <p><img src="../assets/popup/chrome-extension-select.png" /></p>
    </li>
    <li>
        <p>The <code>drawing pin</code> should turn blue.</p>
        <p><img src="../assets/popup/chrome-extension-pinned.png" /></p>
    </li>
</ol>
<h3 id="firefox-pinning">Firefox</h3>
<ol>
    <li>
        <p>Press the <code>puzzle piece icon</code> on the top right balk.</p>
        <p><img src="../assets/popup/firefox-extension-pin.png" /></p>
    </li>
    <li>
        <p>Search for the <code>fmg</code> extension and press the <code>gear</code> icon.</p>
        <p><img src="../assets/popup/firefox-extension-select.png" /></p>
    </li>
    <li>
        <p>Press <code>Pin to Toolbar</code>.</p>
        <p><img src="../assets/popup/firefox-extension-setting-drop-down.png" /></p>
    </li>
</ol>
<hr>
<h2 id="using">Using the browser action</h2>
<h3 id="bookmarks">
    <img src="../assets/popup/icons/bookmarks.png" style="transform: translateY(25%)"/>
    Bookmarks
</h3>
<p>
    The bookmarks page allows you to bookmark any mapgenie map, 
    So you can quickly load your favorite maps.
</p>
<hr>

![Bookmarks page](/assets/popup/pages/bookmarks.png)
![Bookmarks page with data](/assets/popup/pages/bookmarks-with-data.png)

> [!NOTE]
> To add a bookmark simply go to your map page,
> and press the <code>[+]</code> button to add it to your bookmarks.
<hr>

![Bookmarks page trash mode](/assets/popup/pages/bookmarks-trash.png)
> [!NOTE]
> To remove bookmarks press the `trashcan` button in the top right corner.
> And click any bookmark you want to delete.
> After you done press the `trashcan` button again.
<hr>

<h3 id="settings">
    <img src="../assets/popup/icons/settings.png" style="transform: translateY(25%)"/>
    Settings
</h3>
<hr>

![Settings page](/assets/popup/pages/settings.png)

<table>
    <thead>
        <tr>
            <th>Setting</th>
            <th>Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Allways enable presets</td>
            <td>This setting will enable presets on every map.</td>
        </tr>
        <tr>
            <td>Mock user</td>
            <td>
                This setting will enable user mocking.
                This means it will create a dummy user with id -1.
                This will allow you to use all features without logging in.
            </td>
        </tr>
        <tr>
            <td>No confirm mark/unmark all</td>
            <td>
                This will remove the confirm dialog when clicking on the mark/unmark all
                visible locations buttons.
            </td>
        </tr>
    </tbody>
<table>
<hr>

<h3 id="info">
    <img src="../assets/popup/icons/info.png" style="transform: translateY(25%)"/>
    Info
</h3>
<p>
The info page can show some usfull information.
</p>
<hr>

![Info page](/assets/popup/pages/info.png)

<table>
    <thead>
        <tr>
            <th>Info</th>
            <th>Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>PageType</td>
            <td>
                Indicates what page type the extension thinks your currently on.
                <code>map, guide, map-selector, homepage or unknown</code>.
            </td>
        </tr>
        <tr>
            <td>Attached</td>
            <td>
                This indicates if the content script is attached correctly without any errors.
                Red means did not attach correctly or page type is unknown.
                Green means did attach correctly.
                Notice green does not always mean that the extension is working correctly.
                The console window should provide better info for that.
            </td>
        </tr>
    </tbody>
<table>
<hr>

<h3 id="data">
    <img src="../assets/popup/icons/data.png" style="transform: translateY(25%)"/>
    Data
</h3>
<p>
    The data page allows you to manipulate the current map page's data.
</p>
<hr>

![Data page](../assets/popup/pages/data.png)

<table>
    <thead>
        <tr>
            <th>Button</th>
            <th>Action</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Import</td>
            <td>
                This will import a user selected json for the current map page.
                This will error if the `gameId` or `mapId` does not match with the current map page.
                It will also warn you if you try to import data from another user, You can say yes or no if you want to import it anyway.
            </td>
        </tr>
        <tr>
            <td>Export</td>
            <td>
                This will export the stored data for the current map page.
            </td>
        </tr>
        <tr>
            <td>Export</td>
            <td>
                This will clear all the data for the current map page.
                Will ask for a confirmation first to make sure you don't accidently press
                the clear button.
            </td>
        </tr>
    </tbody>
<table>
<hr>
