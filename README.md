# Detoxipy Server
The server-side of a Twitch extension that allows users to visualize trending keywords in a Twitch chat using bubbles that grow and shrink depending on popularity.
___

**AWS** []()

**AWS** []()

**GitHub(Client)**

[https://github.com/DeToxers/DeToxipyClient](https://github.com/DeToxers/DeToxipyClient)

**GitHub(Server)**

[https://github.com/DeToxers/DeToxipyServer](https://github.com/DeToxers/DeToxipyServer)
___
## Branches
* Test
* Master
___
## Table of contents
* [Tools](#tools)
* [Overview](#overview)
* [Getting Started](#start)
* [Routes](#routes)
* [Models](#models)
* [Contribute](#contrib)
* [Participants](#participants)
* [Sources](#sources)
___
<a id="tools"></a>
## Tools
- Python3
- Javascript ES6
- Django 2.1.1
- Twitch Dev Rig
- Twitch Chat Bot
- D3
- Kubernetes

___
<a id="overview"></a>
## Overview
![Wireframe](/wireframe.jpeg)

___
## Getting started
<a id="start"></a>
- Clone the repository and ensure you have Docker and Docker Compose installed. Run "docker-compose up --build" from your command line and then go to localhost in your browser.
___

## Routes

<a id="routes"></a>

**GET:**  `api/v1/bubble`

- **Usage:**

    Gets data for the data visualization for the current session.

- **Output:**
```
Code Block
```

**POST:**  `api/v1/chat`

- **Usage:**

    Post route for list view and detail view of the messages.

- **Output:**
```
Code Block
```
___
## Models
<a id="models"></a>

- **Session**

    Holds the data for the current stream session. This table's contents are deleted at the end of each session. It is used to calculate the most common words per time period/

- **Main**

    Holds the historical data for the streamer. At the end of each session, the top 5 words for that session are added to this table. This table is used for data visualization of chat trends over time.

___
<a id="contrib"></a>
## Contributing to our project
- Thanks for your interest in our project! Please name your branch according to the following convention: f_featurename_yourname. Then please make a pull request back to our master branch and we will review it.
___
<a id="participants"></a>
## Participants
- Max McFarland
- Luther Mckeiver
- Chris Chapman
- Madeline Peters
- Alex Stone
___
<a id="sources"></a>
## Sources
- Twitch Documentation
- D3 Documentation
___
