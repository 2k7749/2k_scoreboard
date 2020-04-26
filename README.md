# el_scoreboard

## Installation
1. Download the [resource](https://github.com/Elipse458/el_scoreboard/archive/master.zip)
2. Rename it to `el_scoreboard` and put it in your resources folder
4. Edit the config.lua and html/config.js to your liking
5. Add `start el_scoreboard` to your server.cfg ***Make sure to add this after es_extended***
6. Start it and you're good to go

## Features
- Well... it's a scoreboard lol
- Left clicking a player in the scoreboard will copy their steam profile url
- Right clicking a player in the scoreboard will bring up an admin menu (if you're an admin)
- Customizable design
- Customizable nav & admin menu buttons
- Customizable pages

## Customization
### Navbar button format
Property | Type | Description | Extra
-------- | ---- | ----------- | ------
label | string | Label of the button | Required
page | string | The id of the page to switch to upon clicking the button | Not required if action is set
action | function | Will get executed upon clicking the button (the button will not get highlighted) | Not required if page is set

### Navbar pages
This is just the html of the page that will show up in `.main-content`, this must be a string

### Admin context button format
Property | Type | Description | Extra
-------- | ---- | ----------- | ------
label | string | Label of the button | Required
action | **string** / function | Nui callback `admin-ctx` will get executed with needed data ([check client.lua line 56](https://github.com/Elipse458/el_scoreboard/blob/master/client.lua#L56)) | Required
action | string / **function** | Will get executed when button is clicked (more about this below) | Required
style | string | Custom css styling | Optional
args | object | If set, will ask for text input (more info below) | Optional

### Admin context button - action (function)
Format (without args):
```javascript
action: function(receiver) {
  console.log("Hello, world!")
}
```
Format (with args):
```javascript
action: function(receiver,args) {
  console.log("Hello, world!")
}
```
**receiver** - string - the server id of the target player  
**args** - string - text input from the user

### Admin context button - args
#### Format
Property | Type | Description | Extra
-------- | ---- | ----------- | ------
description | string | The text that will show up above text input | Required
placeholder | string | The hint that will show up in the text input | Optional

![In-Game reference](https://i.elipse458.me/79f20d3)  
**If the cancel button is pressed, the current action will be aborted!!!**

### Button actions
#### Custom functions
Function name | Parameters | Description | Return
------------- | ---------- | ----------- | ------
hexidtodec | **string** sid | Will transform hex SteamID to SteamID64 | **string** sid64
selectPageButton | **string** page name | This will select the button corresponding to the page name | Nothing
changePage | **string** page name | This will change the current page to the specified page | Nothing
toggleMenu | **boolean** state | This will toggle the menu | Nothing
getInput | **string** description - Text above input <br>**optional string** placeholder - Hint in input <br>**function** callback - with string parameter | Asks for text input from player, if cancelled, callback parameter will be `null`, otherwise it will be a string with the text content | Nothing
copyText | **string** text <br>**string** callbackText - Text that will pop up when copied <br>**int** callbackFadeTime - How long it will take for the popup to disappear (in ms) | Will copy specified text to the clipboard | Nothing
isAdmin | Nothing | Checks if the player is admin | **boolean** admin status

You can also use [JQuery](https://api.jquery.com/) functions
#### Custom variables
Variable name | Type | Description
------------- | ---- | -----------
mygroup | string | The user's group
mysteamid | string | The user's hex steam id
mouseX | int | Cursor's X position
mouseY | int | Cursor's Y position

**These are read only! Don't rewrite them!!!**
