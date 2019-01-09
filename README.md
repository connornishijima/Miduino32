# THIS REPOSITORY IS A WORK IN PROGRESS, AND IS BEING UPDATED OFTEN TO BRING IT TO A PRODUCTION-READY STATE. STAY TUNED! (1/8/19)

![Miduino for ESP32](https://i.imgur.com/xtJz2LX.jpg)

# Miduino32

Miduino32 is as it sounds: a MIDI music playback library compatible with the ESP32 under Arduino! This is a huge upgrade over past versions, with support for hacky analog output of up to 8 custom waveforms at a time, giving any songs you can throw at it a unique sound!

# VIDEO HERE

This is a modern extension of past Miduino-related projects I've written since 2013, such as [these](https://www.youtube.com/watch?v=oHhYpbQlO60) or [these](https://www.youtube.com/watch?v=hduXiwkRofU).

However, this does not play MIDI files directly from SPIFFS - the music it plays is stored in an array of unsigned integers in PROGMEM, which (while more compact) isn't very human readable. For this, I've created a GUI program for Windows that allows for the automatic conversion of a MIDI file into this special score array. :) It's included with this repository - you're going to want it to use Miduino easily! (If you don't have Windows, don't worry! Just open [HTML PATH] in a browser to use it, it's just a JavaScript tool on the inside!)

Some Features:
  - Up to 8 simultaneous notes on playback at a time
  - Supports MIDI velocity data to reproduce a full range of volume
  - Can play any custom waveforms you can throw at it!
  - Analog output over the 2 ESP32 DAC pins, 25 and 26.
  - EQ options, allowing for fake low and high-pass filtering of playback

# Gettting Started (HARDWARE)

To get your ESP32 started playing music, you'll need a few things:

1. [ESP32 Microcontroller](https://www.amazon.com/ACROBOTIC-Development-Bluetooth-Raspberry-ESP-WROOM-32/dp/B01MTU49AT/ref=sr_1_9?ie=UTF8&qid=1547014214&sr=8-9&keywords=esp32+arduino)
2. [4 100K ohm Resistors](https://www.amazon.com/Projects-100EP5121K00-Ohm-Resistors-Pack/dp/B0185FIJ9A/ref=sr_1_3?ie=UTF8&qid=1547014316&sr=8-3&keywords=1kohm+resistor)
3. [4 ohm/3w Speaker](https://www.amazon.com/Cylewet-Diameter-Loudspeaker-Speaker-Arduino/dp/B01N1XLS87/ref=sr_1_4?ie=UTF8&qid=1547014341&sr=8-4&keywords=3w+4ohm)
4. [PAM8403 Amplifier](https://www.amazon.com/CHENBO-PAM8403-digital-amplifier-efficient/dp/B01D4O2GI2/ref=sr_1_2?ie=UTF8&qid=1547014379&sr=8-2&keywords=pam8403)
5. [10K ohm Potentiometer](https://www.amazon.com/HELLOYEE-Breadboard-Trim-Potentiometer-Arduino/dp/B01IK6GT1E/ref=sr_1_23?ie=UTF8&qid=1547014176&sr=8-23&keywords=potentiometer)

If you already have an ESP32, the only thing you likely don't have a substitute for is the PAM8403 amplifier. Trust me, you need it, the ESP32 GPIO are not powerful enough to drive a speaker unless you want to hold it up to your ear for testing. 

## Parts

### ESP32 Microcontroller
This one is fairly obvious, it's the brains of the operation!

### 4 100K ohm Resistors
Since 4 of the ESP32 outputs will be combined into one audio output, we need to prevent the ESP32 from potentially shorting one HIGH output into the LOW output of another. This would sink more current than the pins can handle! (>12ma) By placing a 100K resistor on all 4 output pins, the current will instead sink to the path of much lower resistance: the amplifier. Obviously some current will still sink back through the other resistors, but not *nearly* enough to damage the GPIO or noticably reduce the quality of the already 8-bit audio. You can also use diodes to accomplish this, but the resistors are also doing another important job: bringing down the voltage of the raw output. Never underestimate the diminutive size of the PAM8403 amplifier, it can create startlingly powerful audio!

### 4 ohm 3w Speaker
I personally use a 4ohm speaker, but 8ohm is okay for this purpose as well, since we're not pushing output power. You can also use speakers rated for a higher wattage, they'll just be underutilized. However, it is important that the speaker be rated for at LEAST 3W, even if you're never cranking the volume - just in case something goes wrong and you get the full 3 watts from the amplifier through it.

### PAM8403 Amplifier
This thing is amazing. I remember once trying to use an LM386 amp as a beginner, but unless you're already an audio guy, finding the right passive components to pair with it, or why they are necessary, can be tough. While you can buy the PAM8403 SOIC chip on it's own, most immediate online listings will be for the chip *along with* it's required passives already mounted on a PCB. Sweet! In my experience, it absolutely does not need a heat sink, it never even gets warm with Miduino.

### 10K Ohm Potentiometer
This potentiometer sees one of it's most common use cases: a volume knob! And trust me, you'll want it. The 100K resistors keep the audio at a level safe of your ears, speakers and amp, but if you ever want to play with this while your family sleeps, they'll thank you for adding a potentiometer.

## Wiring

Once you have these parts on hand, here's how they need to be wired: (I'll post a proper schematic soon, but for now here's text)

    | ESP32 |-Pin 12 ---> 100K Resistor--v                                        |                   |
    |       |-Pin 14 ---> 100K Resistor--+--------->|POTENTIOMETER|---> "L" input-| PAM8403 AMPLIFIER |-"L" + Output -----> SPEAKER +
    |       |-Pin 27 ---> 100K Resistor--^                |                       |                   |-"L" - Output -----> SPEAKER -
    |       |-Pin 26 ---> 100K Resistor--^                |                       |                   |
    |       |-                                            v                       |                   |
    |       |-GND ----------------------------------------+-----> POWER/Input GND-|                   |
    |       |-5V/Vin Pin ------------------------------------------------> 5V Pin-|                   |

Never mind, that was way tougher than simply drawing one up. Dang it.

### Developers Note:

While Miduino does use several pins for output, it is not stereo, nor is it designed to be. Miduino has 8 internal "voices" for audio production, and puts 2 on each pin, giving them 7-bit quality. I know it's possible to let each voice potentially use the entire 8-bit space while others aren't playing, but these solutions require mixing algorithms that I either have not tried, or would be too taxing to run on this processor at an acceptable sampling rate. Any ideas are welcome!

## Getting Started (Software)

Alright, we made it! Now the easy part. Open up the Miduino GUI .exe, and select the MIDI you want to convert! Documentation and downloads for that software is in it's separate repository, but to keep it simple: play around with "INSTRUMENT SAMPLE" to get different sounds from the final product!

Assuming you've now used the GUI to convert a MIDI into an output Arduino Sketch, let's take a look at it:

    #include "Miduino32.h" // https://github.com/connornishijima/Miduino32 
    Miduino mid;           // hang.mid - Conversion took 0.069 seconds! Dropped 0 notes, removed 0 duplicates. Voices: 5/8

    const uint16_t wave_len = 600;
    uint8_t wave[wave_len] PROGMEM /* BIT CRUSH 2 */ = {106, 127, 128, 127, 128... ...127, 128, 127, 128};
    const uint16_t attack_ms = 20;
    const uint16_t decay_ms  = 20; // decay not fully working at this time

    uint16_t my_score[] PROGMEM = {65078,193,65209,4233,65188,8329,65054,12352,90,32768,4233... ...65535};

    void setup(){
      mid.vibrato(true, 5, 500, 200); // Enable vibrato at 5Hz, starting after 500ms sustain, with intensity 200 / 1000
      mid.play(my_score, wave, wave_len, attack_ms, decay_ms);
      while (mid.playing) {
        mid.run();
        // Add your own code (to run during playback) above this line,
        // but keep it brief to let the music run!
      }
    }

    void loop(){
    }
    
Not too shabby! A few things to look at, but pretty easy on the eyes considering what it does. (Most of the power is hidden in the Miduino32/Cone32 Library anyways.

The first thing you'll notice when you convert your own files, is that my_score[] can be an insanely long list of numbers. This is where the song data is stored. Any time a note starts or stops, or Miduino must wait before another event occurs, that's another number or two in the list. (The example above has truncated waveform and score data and will not do anything interesting.)

DEVELOPERS NOTE: If Arduino ever tells you the code won't fit "in region IRAM", it's 50/50 between simply being too big for the ESP32 flash storage, a it's a very bizarre bug. Apparently when single lines of Arduino code become insanely long, it will refuse to compile it until you break it up. Not a common issue unless you try to torture test it with 30-minute MIDIs or "Black MIDI", but the fix is to simply scroll a quarter of the way out, and add a line break. Repeat for another line, and another until you've run through the whole thing, to reduce the "width" of the code.
