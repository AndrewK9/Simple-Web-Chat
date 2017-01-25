<p align="center">
<a href="#"><img src="http://i.imgur.com/yxInXWo.png"/></a>

<a href="https://travis-ci.org/AndrewK9/Simple-Web-Chat"><img src="https://img.shields.io/badge/build-passing-brightgreen.svg?style=flat-square"/></a>
<a href="https://nodejs.org/en/"><img src="https://img.shields.io/badge/platform-Node.js-brightgreen.svg?style=flat-square"/></a>
<a href="#install"><img src="https://img.shields.io/badge/dependencies-up%20to%20date-brightgreen.svg?style=flat-square"/></a>
<a href="https://github.com/sindresorhus/xo"><img src="https://img.shields.io/badge/code%20style-XO-5ed9c7.svg?style=flat-square"/></a>
<a href="https://github.com/AndrewK9/Simple-Web-Chat/issues"><img src="https://img.shields.io/badge/issues-0%20open-brightgreen.svg?style=flat-square"/></a>
<a href="https://github.com/AndrewK9/Simple-Web-Chat/blob/master/LICENSE"><img src="https://img.shields.io/badge/license-MIT-lightgray.svg?style=flat-square"/></a>
</p>

## Table of Contents
1. [Introduction](#introduction)
1. [Install](#install)
1. [Usage](#usage)
1. [Team](#team)
1. [Code Style](#code-style)
1. [Contribute](#contribute)
1. [License](#license)

## Introduction
This is a simple web chat software developed as a homework assignment for a multiplayer games course at [Ferris State University](http://ferris.edu/dagd/). It is a prototype for another project, it's goal is to provide a basic introduction to creating rooms within [Socket.io](http://www.socket.io) along with running basic chat commands.

## Install
This project uses [Node.js](https://nodejs.org/en/) along with [Socket.io](http://www.socket.io) and [Express](http://www.expressjs.com). Go check them out if you don't already have them installed locally. Alternatively this repo already has the node modules installed and will keep them up to date.

## Usage
### Server
To launch the server just run the server.js file with nodejs.

### Client
To access the web page open a browser and go to localhost:1234. Then choose a username, the server will make sure said name is available.

Listed below are the currently accpeted commands:
```
/help - pulls up all possible commands
/room - tells the user what room they're in
/list - list all available rooms
/join <room> - joins a specific room
/leave - sends user back to the default room
/color <hex> - changes the users color to a specific hex code
/clear - clears all previous messages
```

## Team
#### Creator

Kyle Andrews |
|-----|
| [Email](andrewskyle28@gmail.com) |
| @andrewk9 |

## Code Style
This project is following the [XO](https://github.com/sindresorhus/xo) style guide.


## Contribute
Feel free to [open an issue](https://github.com/AndrewK9/Resort-Visualizer/issues) or clone this repo and start working.

## License
[MIT](https://github.com/AndrewK9/Simple-Web-Chat/blob/master/LICENSE) (c) Kyle Andrews