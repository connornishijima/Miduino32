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
  - [2 100K ohm Resistors](https://www.amazon.com/Projects-100EP5121K00-Ohm-Resistors-Pack/dp/B0185FIJ9A/ref=sr_1_3?ie=UTF8&qid=1547014316&sr=8-3&keywords=1kohm+resistor)
  - [4 ohm/3w Speaker](https://www.amazon.com/Cylewet-Diameter-Loudspeaker-Speaker-Arduino/dp/B01N1XLS87/ref=sr_1_4?ie=UTF8&qid=1547014341&sr=8-4&keywords=3w+4ohm)
  - [PAM8403 Amplifier](https://www.amazon.com/CHENBO-PAM8403-digital-amplifier-efficient/dp/B01D4O2GI2/ref=sr_1_2?ie=UTF8&qid=1547014379&sr=8-2&keywords=pam8403)
  - [10K ohm Potentiometer](https://www.amazon.com/HELLOYEE-Breadboard-Trim-Potentiometer-Arduino/dp/B01IK6GT1E/ref=sr_1_23?ie=UTF8&qid=1547014176&sr=8-23&keywords=potentiometer)

### ESP32 Microcontroller
This one is fairly obvious, it's the brains of the operation!

### 2 100K ohm Resistors
Since both of the ESP32 DAC outputs will be combined into one audio output, we need to prevent the ESP32 from potentially shorting one HIGH output into the LOW output of another. This would sink more current than the pins can handle! (>12ma) By placing a 100K resistor on both of the DACs, the current will instead sink to the path of much lower resistance: the amplifier. Obviously some current will still sink back through the opposite resistor, but not *nearly* enough to damage the GPIO or noticably reduce the quality of the already 8-bit audio. You can also use diodes to accomplish this, but the resistors are also doing another important job: bringing down the voltage of the raw output. Never underestimate the diminutive size of the PAM8403 amplifier, it can create startlingly powerful audio!

### 4 ohm 3w Speaker
I personally use a 4ohm speaker, but 8ohm is okay for this purpose as well, since we're not pushing output power. You can also use speakers rated for a higher wattage, they'll just be underutilized. However, it is important that the speaker be rated for at LEAST 3W, even if you're never cranking the volume - just in case something goes wrong and you get the full 3 watts from the amplifier through it.

### PAM8403 Amplifier
This thing is amazing. I remember once trying to use an LM386 amp as a beginner, but unless you're already an audio guy, finding the right passive components to pair with it, or why they are necessary, can be tough. While you can buy the PAM8403 SOIC chip on it's own, most immediate online listings will be for the chip *along with* it's required passives already mounted on a PCB. Sweet! In my experience, it absolutely does not need a heat sink, it never even gets warm with Miduino.

### 10K Ohm Potentiometer
This potentiometer sees one of it's most common use cases: a volume knob! And trust me, you'll want it. The 100K resistors keep the audio at a level safe of your ears, speakers and amp, but if you ever want to play with this while your family sleeps, they'll thank you for adding a potentiometer.
