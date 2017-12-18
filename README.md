# ShowMe Command for Botyo
[![npm](https://img.shields.io/npm/v/botyo-command-showme.svg)](https://www.npmjs.com/package/botyo-command-showme)
[![npm](https://img.shields.io/npm/dt/botyo-command-showme.svg)](https://www.npmjs.com/package/botyo-command-showme)
[![npm](https://img.shields.io/npm/l/botyo-command-showme.svg)]()

The **ShowMe Command for [Botyo](https://github.com/ivkos/botyo)** returns the first few images found in Google Images matching a query.

## Requirements
You need to set up a Google Custom Search Engine to use this module. To do so, please refer to the instructions provided for the [google-images](https://github.com/vadimdemedes/google-images/tree/93b76e58cb7cce93b22f6315df120ba91b2eeba2#set-up-google-custom-search-engine) module. Make a note of the CSE ID and the API key as you will need these for the module configuration.

## Usage
`#showme [number of images] <query>`

For example:
- `#showme cat` - Shows you a picture of a cat.
- `#showme 3 cats` - Shows you three pictures of cats.
- `#showme "3 cats`" - Shows you a picture of three cats.

## Install
**Step 1.** Install the module from npm.

`npm install --save botyo-command-showme`

**Step 2.** Register the module.
```typescript
import Botyo from "botyo";
import ShowMeCommand from "botyo-command-showme"

Botyo.builder()
    ...
    .registerModule(ShowMeCommand)
    ...
    .build()
    .start();
```

## Configuration
```yaml
modules:
  ShowMeCommand:
    defaultImageCount: 1   # how many images to return if not specified
    maxImageCount: 9       # max number of images to return
    cseId: YOUR_CSE_ID
    cseApiKey: YOUR_CSE_API_KEY
```