# Navbar Temperature Plugin for OctoPrint

Show Raspberry Pi temperature, memory available and printer temperatures/target temperatures in the navbar.

## Setup

Install manually using this URL:

    https://github.com/breadbakerman/OctoPrint-NavbarTemp/archive/master.zip


## Requirements

You will need the following bash script in: /home/pi/bin/memavail

```
#!/bin/bash
echo $(( $(cat /proc/meminfo | grep MemAvailable | awk '{print$2}') / 1024 ))
```

