# Technical test: chatbot

### Screenshots

<p align="center">
<img src="./screenshot_1.PNG" width="200" style="margin-right: 60px">
<img src="./screenshot_2.jpeg" width="200" style="margin-right: 60px">
<img src="./screenshot_3.PNG" width="200">
</p>


### Technical choices

- Mobile framework: **Expo**

Battle tested, great DX ecosystem, extensive and well maintained packages and plugins libraries


- Language safety: **Typescript**

Strict mode, important to avoid type mistakes and consistency

Linting and formatting: **Biome.js**

Battle tested, faster than Eslint and Prettier, easier configuration, two tools in one

- Chat UI library: **React Native Gifted Chat**

Albeit not amazing, still the best open source solution out there

- Testing: **Maestro**

Battle tested, easy yaml testing flow definition with great DX (maestro studio)

- Deployment: **Expo EAS internal testing**

Quick and easy to setup for simple distribution for simple user testing (unlike ios Testflight and Android Google Play Console)


### Files structure

Feature based folder structure

### How to run

Install yarn on your computer

```bash
yarn
yarn start
```
This will give you options to run on ios or android

### UI inspiration

https://dribbble.com/shots/25640525-Mobile-AI-Chatbot

### Notes on the development process

Total work time: 2.5 days

Development environement: Mac OS, Cursor (Pro subscription), XCode

Difficulties:

Gifted Chats is outdated (class components), some types are missing, not the best API, some elements are hard to personalize

Different behaviours on Android and IOS with the Expo camera libraries

# Chatbot

## Firebase Rate Limiting Setup

This application uses Firebase Realtime Database for IP-based API rate limiting. The system restricts the number of requests that can be made from a single IP address within a specified time window.

1. Create a Firebase project at https://console.firebase.google.com/
2. Enable the Realtime Database in your Firebase project
3. Generate a new private key for your service account:
   - Go to Project Settings > Service Accounts
   - Click "Generate new private key"
   - This will download a JSON file with your credentials
4. Create a `.env.local` file in the root of your project (copy from `.env.local.example`)
5. Add your Firebase credentials to the `.env.local` file:
   - `FIREBASE_SERVICE_ACCOUNT_KEY`: The entire JSON content of your service account key file
   - `FIREBASE_DATABASE_URL`: Your Firebase Realtime Database URL (e.g., "https://your-project-id.firebaseio.com")

By default, the chat API is limited to 10 requests per minute per IP address. You can adjust these settings in the `src/app/api/chat+api.ts` file.

Note: Make sure to never commit your `.env.local` file to version control.
