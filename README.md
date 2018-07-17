# Miduino32

Miduino32 is as it sounds: a MIDI music playback library compatible with the ESP32 under Arduino. Using some SigmaDelta trickery, Miduino32 will play polyphonic notes in the sample of your choice and 8-bit percussion for a retro sound!

However, this does not play MIDI files directly from SPIFFS - the music it plays is stored in an array of unsigned integers in PROGMEM, which (while quite compact) isn't very human readable. For this, I've created a GUI program for Windows that allows for the automatic conversion of a MIDI file into this special score array. :) Go ahead and download it, you're going to want it to use Miduino easily.
