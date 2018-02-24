import os
import traceback
from operator import itemgetter
import json
import sys
from os.path import basename
import shutil

filepath = sys.argv[1]
drop_mode = sys.argv[2]
score_loop = sys.argv[3]
remove_duplicates = sys.argv[4]

def debug_out(txt):
	print "DEBUG%|%"+txt
	
def setup_out(txt):
	print "SETUP%|%"+txt
	
def score_out(txt):
	print "SCORE%|%"+txt
	
shutil.copy2(filepath, os.getcwd())

filename = basename(os.path.splitext(filepath)[0])
voice_count = 6

try:	
	dropped_notes = 0
	removed_dupes = 0
	used_voices = 0
	
	tempo = 500000
	ppq = 96
	
	voices = []
	output = []
	
	oldest_voice = -1
	
	for x in range(voice_count):
		voices.append({"note":0,"time":0})
		
	os.system("midicsv.exe "+filename+".mid "+filename+".csv")
	with open(filename+".csv","r") as f:
		data = f.readlines();
		
	notes = []
	notes_playing = []
	for n in range(255):
		notes_playing.append(0)
		
	for item in data:
		item = item.split(", ")
		event_time = int(item[1])
		event_type = item[2]
		
		if event_type == "Note_on_c" or event_type == "Note_off_c":
			event_note = int(item[4])
			event_velocity = int(item[5])
			
			if event_type == "Note_on_c":
				if notes_playing[event_note] == 0:
					notes_playing[event_note] = 1
				else:
					no_offs = True
					
			elif event_type == "Note_off_c":
				notes_playing[event_note] = 0
			
			event_channel = int(item[3])
			if event_channel == 9:
				event_note += 128
				
			if event_velocity == 0:
				notes_playing[event_note] = 0
				notes.append([event_time,"Note_off_c",event_note])
			else:
				notes.append([event_time,event_type,event_note])
			
		elif event_type == "Header":
			ppq = int(item[5])
			tempo_multiplier = 60000.0 / float((60000000.0/float(tempo))*ppq)
		elif event_type == "Tempo":
			tempo = int(item[3])
			mult = 60000.0 / float((60000000.0/float(tempo))*ppq)
			if tempo_multiplier == 0:
				tempo_multiplier = mult
				
			notes.append([event_time,"Tempo_change",mult])
			
	# NOTES GET SORTED BY TIME, regardless of track or channel
	notes = sorted(notes, key=itemgetter(0))
	
#	for item in notes:
#		print item
	
	if remove_duplicates == True:
		# REMOVE DUPLICATE NOTES --------------------------
		notes_out = []
		
		notes_playing = []
		for n in range(255):
			notes_playing.append(0)
		
		for item in notes:
			event_type = item[1]
			event_note = item[2]
			note_pass = False

			if event_type == "Note_on_c":
				if notes_playing[event_note] == 0:
					note_pass = True
					notes_playing[event_note] = 1
			elif event_type == "Note_off_c":
				if notes_playing[event_note] == 1:
					note_pass = True
					notes_playing[event_note] = 0
			elif event_type == "Tempo_change":
				note_pass = True
					
			if note_pass == True:
				notes_out.append(item)
			else:
				#print "DUPE REMOVED"
				removed_dupes+=1
				pass
					
		notes = notes_out
		
		# -------------------------------------------------
	
	last_note_time = 0
	tempo_multiplier_shift = tempo_multiplier
	
	out_string = ""
	for item in notes:
		out_string+=str(item)
		out_string+="\n"
	
	with open(filename+".json","w+") as f:
		f.write(out_string)
	
	for item in notes:
		note_line = {}
		
		non_note = False
		
		if item[1] == "Tempo_change":
			tempo_multiplier = item[2]
			non_note = True
			
		elif item[1] == "Note_on_c":
			empty_slot = False
			empty_index = -1
			for v in range(voice_count):
				if voices[v]["note"] == 0:
					empty_slot = True
					empty_index = v
					break
			
			if empty_slot == True:
				if v+1 > used_voices:
					used_voices = v+1
			
				voices[v]["note"] = item[2]
				voices[v]["time"] = item[0]
				this_note_time = item[0]
								
				note_line = {"event":"start","voice":empty_index,"note":voices[v]["note"],"time":-1}
			else:
				dropped_notes+=1
				if drop_mode == "FAVOR_OLD":
					if oldest_voice != -1:
						if oldest_voice+1 > used_voices:
							used_voices = oldest_voice+1
						
						voices[oldest_voice]["note"] = item[2]
						voices[oldest_voice]["time"] = item[0]
						this_note_time = item[0]
						note_line = {"event":"start","voice":oldest_voice,"note":item[2],"time":-1}					

		elif item[1] == "Note_off_c":
			for v in range(voice_count):
				if item[2] == voices[v]["note"]:
					voices[v]["note"] = 0
					voices[v]["time"] = -1
					note_line = {"event":"stop","voice":v,"note":-1,"time":-1}

			this_note_time = item[0]
		
		if non_note == False:
			wait_time = this_note_time-last_note_time
			if wait_time != 0:
				output.append({"event":"wait","voice":-1,"note":-1,"time":int(float(wait_time)*tempo_multiplier_shift)});
				tempo_multiplier_shift = tempo_multiplier
				
			if note_line != {}:
				output.append(note_line)
			
			last_note_time = this_note_time
			
			oldest_time = 999999999999999
			oldest_voice = -1
			for v in range(voice_count):
				if voices[v]["time"] < oldest_time and voices[v]["time"] != -1:
					oldest_time = voices[v]["time"]
					oldest_voice = v

	debug_out("drop_mode:"+drop_mode)
	debug_out("removed_duplicates:"+str(removed_dupes))
	debug_out("dropped_notes:"+str(dropped_notes))
	debug_out("voices_used:"+str(used_voices)+"/"+str(voice_count))
		
	array_out = ""
	running = False # Used to skip wait for score to begin
	
	for item in output:
		out_item = ""
		if item["event"] == "start":
			running = True
			out_item = "0x9"+str(item["voice"])+","+str(item["note"])+","
		elif item["event"] == "stop":
			out_item = "0x8"+str(item["voice"])+","
		elif item["event"] == "wait":
			raw_bin = str(bin(item["time"]))[2:]
			while len(raw_bin) < 16:
				raw_bin = "0"+raw_bin			
			raw_bin = "0"+raw_bin[1:]
			binleft  = raw_bin[:-8]
			binright = raw_bin[8:]
			
			out_item = str(int(binleft,2)) + "," + str(int(binright,2)) + ","
		if running == True:
			array_out+=out_item	

	if score_loop == True:
		array_out += "0xE0"
	else:
		array_out += "0xF0"

	array_out = "const uint8_t PROGMEM SCORE["+str(len(array_out.split(",")))+"] = {"+array_out+"};"

	#score_out("// "+filename)
	score_out(array_out)
	
	
	try:
		os.remove(filename+".csv")
		os.remove(filename+".json")
		os.remove(filename+".mid")
		os.remove(filename+".midi")
	except OSError:
		pass
		
except:
	print traceback.print_exc()
	
tempo = 5000000
ppq = 192
multipler = 60000.0 / float((60000000.0/float(tempo))*ppq)