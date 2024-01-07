### Enviorement variables used when developing
|            |          env key         |   type    |                                               description                                                     |
| ---------- | ------------------------ | --------- | ------------------------------------------------------------------------------------------------------------- |
| `required` | **FONTS_PATH**           | *string*  |  path that resolves to the folder containing the downloaded font files used in `yarn update-font` command.    |
| `optional` | **KEEP_PROFILE_CHANGES** | *boolean* |  save profile changes when using `yarn start-chrome` or `yarn start-firefox`.                                 |           
| `required` | **CORS_PROXY**           | *string*  |  origin to use as proxy when doing web requests.                                                              |
| `optional` | **CHROME_BIN**           | *string*  |  path to chromium executable to use a browser when using command `yarn start-chrome`.                         |                   
| `optional` | **FIREFOX_PROFILE**      | *string*  |  path to chrine profile to use.                                                                               |
| `optional` | **FIREFOX_BIN**          | *string*  |  path to firefox executable to use a browser when using command `yarn start-firefox`.                         |                   
| `optional` | **FIREFOX_PROFILE**      | *string*  |  path to firefox profile to use.                                                                              |
| `optional` | **START_URL**            | *string*  |  url to have as start pagee when using `yarn start-chrome` or `yarn start-firefox`.                           |                   
| `required` | **WEB_EXT_API_KEY**      | *string*  |  mozilla developer api key to use when signing a extension.                                                   |
| `required` | **WEB_EXT_API_SECRET**   | *string*  |  mozilla developer api secret to use when signing a extension.                                                |
