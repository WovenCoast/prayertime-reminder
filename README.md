# Prayertime Reminder

A script to alert for prayer times using notifications

## Prerequisites

- Node (tested on v16.15.1)
- NPM (tested on 8.11.0)

> this probably isn't very important, just make sure you can run commonjs which uses require and stuff

## Usage

- Clone this repository

```sh
git clone https://github.com/WovenCoast/prayertime-reminder
```

- Install the dependencies

```sh
npm install
# or
yarn install
```

- [optional] Install pm2 globally on your machine

```sh
npm i -g pm2
# or
yarn global add pm2
```

- Run the script

> Note: When running the script without pm2, you have to keep the terminal window running to receive alerts

```sh
# if you didn't install pm2
npm start
# or
yarn start

# if you have installed pm2
pm2 start ecosystem.config.js
# or
pm2 start index.js -n prayertime-reminder
```

## Configuration

To configure this script, modify the first few lines of index.js (attempt was made to make it user friendly) and restart the script

```sh
pm2 restart prayertime-reminder
```

> or this can be done manually on the forever existent terminal process you have over there
