# GoodWe Inverter Proxy
This is a node.js based auto-detecting Client of Goodwe  inverters which could be configured to write the data to a MQTT-server.
# Usage
as always:
```
npm install
```
and simply call
```
bin/inverterd.mjs
```
# Description
It will auto-detect all available GoodWe Inverters in your local network (UDP-broadcast, TCP is not supported). Note that detection can be sometimes unreliable, because the UDP-implementation from GoodWe seems to be sloppy. So restart if it fails...

Anyway, it is broadcasting every 60s and adds new inverters on successful detection. So let it run as daemon with auto-restart.
If you do not specify the env-variable `MQTT_URI` it will print the topics/values on the screen.

The code borrows protocol-details heavily from this very nice project https://github.com/marcelblijleven/goodwe/tree/master.

# Motivation
I didn't want to use the software from the above link, because I wanted to write my own client to learn more about GoodWe inverters and most of all: I do not like Python ;)

# Some background
The node.js code is written with `stampit` (a non mainstream coding-method from https://stampit.js.org/ which I also use heavily in commercial enterprise environments)

I am currently using 6 inverters at home and publish all metrics (default 15s interval) to my iobroker-mqtt-broker.
It is battle tested and runs now for over 1 year on Raspberries PI 3/4/5 and Intel N100 SBCs and is stable enough for me without memory-leaks or performance-regressions.
Tested for ET/DT/XS-type inverters. Support for others can be added on request and if you are willing to test :)

**Note:** I have basic write-support for some registers via MQTT, but consider this as experimental. Sometimes the communication does not work reliable for writing. In that case, restart the software :) Otherwise it should work without bothering you.

**PS:** you can also use
```
bin/discover-inverters.mjs
```
beforehand to run only the auto-detection of inverters for information/testing-purposes.

Constructive feedback would be great.

## Example for a docker compose integration:
```
...
  goodwe-inverters-mqtt-proxy:
    build:
      context: https://github.com/mrx8/goodwe-inverter.git#main
    container_name: goodwe-inverters-mqtt-proxy
    hostname: goodwe-inverters-mqtt-proxy
    network_mode: host
    restart: always
    pull_policy: always
    environment:
      TZ: "<your timezone, example: 'Europe/Berlin'>"
      PINO_LOG_LEVEL: info
      MQTT_URI: tcp://<IP_OF_MQTT_BROKER>:<PORT>
    command: ["node", "bin/inverterd.mjs"]
...
```
