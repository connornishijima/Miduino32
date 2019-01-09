![Miduino for ESP32](https://i.imgur.com/xtJz2LX.jpg)

# Miduino32

Miduino32 is as it sounds: a MIDI music playback library compatible with the ESP32 under Arduino!

# VIDEO HERE

This is a modern extension of past Miduino-related projects I've written since 2013, such as [these](https://www.youtube.com/watch?v=oHhYpbQlO60) or [these](https://www.youtube.com/watch?v=hduXiwkRofU).

However, this does not play MIDI files directly from SPIFFS - the music it plays is stored in an array of unsigned integers in PROGMEM, which (while more compact) isn't very human readable. For this, I've created a GUI program for Windows that allows for the automatic conversion of a MIDI file into this special score array. :) It's included with this repository - you're going to want it to use Miduino easily! (if you don't have Windows, don't worry! Just open 
