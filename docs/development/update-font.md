1. Make sure to setup the repo.
2. Go to [fontello](https://fontello.com).
3. Set the correct font name and font prefix.<br>
    ![Set Font Settings](../assets/development/update-font/set_font_settings.png)
4. Import the current font .svg file.<br>
    ![Import Current Font](../assets/development/update-font/import_current_font.png)
5. Select all Custom icons.<br>
    ![Select Custom Icons](../assets/development/update-font/select_custom_icons.png)
6. Add icons to your liking.
7. Download the font.<br>
    ![Download Font](../assets/development/update-font/download_font.png)
8. Create `.env` file in the root folder of the project.
9. Add download path or parent path where your downloaded fonts are located
    ```.env
    FONTS_PATH="C:/Users/<name>/Downloads"
    ```
10. Run command `yarn update-font`.
