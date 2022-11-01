# b2rist-firebase

## Description

This project is for developing, deploying and emulating Firebase functionality on a local machine.

## Installation

### 1. Install firebase tools
- Run
``npm install -g firebase-tools@11.9.0``
- Note: upgrade firebase to the latest version when [this](https://github.com/firebase/firebase-tools/issues/5024) issue with CORS will be fixed

### 2. Login to firebase
- Run
  ``firebase login``
- Note: allow powershell to run scripts on Windows machine

### 3. Install firebase emulators
- Run
  ``firebase init emulators``
- Choose firestore and functions emulators
- Choose ports or set default

### 4. Install dependencies
- Run
``npm ci``

## Running
- To start locally run ``npm run-script serve`` or ``serve`` script from package.json for all emulators
- or run ``npm run-script serve:functions`` for all functions only

## Deployment
- Run ``npm run-script deploy``

## Export-import data from firestore to local storage
- Go to [admin sdk](https://console.firebase.google.com/u/0/project/b2rist-90936/settings/serviceaccounts/adminsdk)
- Select Node and generate new token key
- Save token to the PROJECT_DIR/functions folder as serviceAccountKey.json
- Create PROJECT_DIR/data folder
- Run ``npm run-script db:export`` to export data from the firebase storage
- Run ``db:emulator:import`` to import data to the local storage

## Links
[firestore emulator](http://localhost:4000/firestore/data)

[functions emulator logs](http://localhost:4000/logs?q=metadata.emulator.name%3D%22functions%22)
