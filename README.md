# THIS REPOSITORY IS A WORK IN PROGRESS, AND IS BEING UPDATED OFTEN TO BRING IT TO A PRODUCTION-READY STATE. STAY TUNED! (1/8/19)

![Miduino for ESP32](https://i.imgur.com/xtJz2LX.jpg)

# Miduino32

Miduino32 is as it sounds: a MIDI music playback library compatible with the ESP32 under Arduino! This is a huge upgrade over past versions, with support for real analog output of up to 8 custom waveforms at a time, giving any songs you can throw at it a unique sound!

# VIDEO HERE

This is a modern extension of past Miduino-related projects I've written since 2013, such as [these](https://www.youtube.com/watch?v=oHhYpbQlO60) or [these](https://www.youtube.com/watch?v=hduXiwkRofU).

However, this does not play MIDI files directly from SPIFFS - the music it plays is stored in an array of unsigned integers in PROGMEM, which (while more compact) isn't very human readable. For this, I've created a GUI program for Windows that allows for the automatic conversion of a MIDI file into this special score array. :) It's included with this repository - you're going to want it to use Miduino easily! (If you don't have Windows, don't worry! Just open [HTML PATH] in a browser to use it, it's just a JavaScript tool on the inside!)

Some Features:
  - Up to 8 simultaneous notes on playback at a time
  - Supports MIDI velocity data to reproduce a full range of volume
  - Can play any custom waveforms you can throw at it!
  - Analog output over the 2 ESP32 DAC pins, 25 and 26.
  - EQ options, allowing for fake low and high-pass filtering of playback

# Gettting Started

To get your ESP32 started playing music, you'll need a few things:

  - [ESP32 Microcontroller](https://www.amazon.com/ACROBOTIC-Development-Bluetooth-Raspberry-ESP-WROOM-32/dp/B01MTU49AT/ref=sr_1_9?ie=UTF8&qid=1547014214&sr=8-9&keywords=esp32+arduino)
  - [2 1Kohm Resistors](https://www.amazon.com/Projects-100EP5121K00-Ohm-Resistors-Pack/dp/B0185FIJ9A/ref=sr_1_3?ie=UTF8&qid=1547014316&sr=8-3&keywords=1kohm+resistor)
  - [4ohm/3w Speaker](https://www.amazon.com/Cylewet-Diameter-Loudspeaker-Speaker-Arduino/dp/B01N1XLS87/ref=sr_1_4?ie=UTF8&qid=1547014341&sr=8-4&keywords=3w+4ohm)
  - [PAM8403 Amplifier](https://www.amazon.com/CHENBO-PAM8403-digital-amplifier-efficient/dp/B01D4O2GI2/ref=sr_1_2?ie=UTF8&qid=1547014379&sr=8-2&keywords=pam8403)
  - [10Kohm Potentiometer](https://www.amazon.com/HELLOYEE-Breadboard-Trim-Potentiometer-Arduino/dp/B01IK6GT1E/ref=sr_1_23?ie=UTF8&qid=1547014176&sr=8-23&keywords=potentiometer)
