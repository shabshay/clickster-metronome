import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None, // disable encapsulation for global styles
  imports: [
    FormsModule,
    NgForOf,
    NgIf
  ]
})
export class AppComponent implements OnInit, OnDestroy {
  bpm: number = 120;
  timeSignature: number = 4;
  accentBeat: boolean = true;
  soundType: string = 'pixabay';
  songName: string = '';
  setlistName: string = '';
  songs: any[] = [];
  setlistNames: string[] = [];

  isPlaying: boolean = false;
  intervalId: any = null;
  currentBeat: number = 0;
  beatActive: boolean = false;
  lastTap: number = 0;
  tapTimes: number[] = [];

  click1: HTMLAudioElement | null = null;
  click2: HTMLAudioElement | null = null;

  ngOnInit() {
    this.updateClickSounds();
    this.renderPresets();
    this.renderSetlists();
  }

  ngOnDestroy() {
    this.stopMetronome();
  }

  onBpmSliderChange(event: any) {
    this.bpm = parseInt(event.target.value);
  }

  changeBpm(delta: number) {
    this.bpm = Math.max(30, Math.min(240, this.bpm + delta));
  }

  updateClickSounds() {
    this.click1 = document.getElementById(`click1-${this.soundType}`) as HTMLAudioElement;
    this.click2 = document.getElementById(`click2-${this.soundType}`) as HTMLAudioElement;
    if(this.click1) {
      this.click1.currentTime = 0;
      this.click1.play();
    }
  }

  toggleMetronome() {
    this.isPlaying ? this.stopMetronome() : this.startMetronome();
  }

  startMetronome() {
    this.stopMetronome();
    const interval = 60000 / this.bpm;
    this.currentBeat = 0;
    this.intervalId = setInterval(() => {
      this.beatActive = true;
      setTimeout(() => this.beatActive = false, 100);
      if (this.accentBeat && this.currentBeat === 0 && this.click2) {
        this.click2.currentTime = 0; this.click2.play();
      } else if(this.click1) {
        this.click1.currentTime = 0; this.click1.play();
      }
      this.currentBeat = (this.currentBeat + 1) % this.timeSignature;
    }, interval);
    this.isPlaying = true;
  }

  stopMetronome() {
    if(this.intervalId) clearInterval(this.intervalId);
    this.isPlaying = false;
  }

  tapTempo() {
    const now = Date.now();
    if (this.lastTap) {
      this.tapTimes.push(now - this.lastTap);
      if(this.tapTimes.length > 4) this.tapTimes.shift();
      const avg = this.tapTimes.reduce((a, b) => a + b, 0) / this.tapTimes.length;
      this.bpm = Math.round(60000 / avg);
    }
    this.lastTap = now;
  }

  savePreset() {
    if(!this.songName.trim()) return;
    const preset = { name: this.songName, bpm: this.bpm, ts: this.timeSignature, accent: this.accentBeat };
    let songs = JSON.parse(localStorage.getItem('clicksterSongs') || '[]');
    songs.push(preset);
    localStorage.setItem('clicksterSongs', JSON.stringify(songs));
    this.renderPresets();
    this.songName = '';
  }

  renderPresets() {
    this.songs = JSON.parse(localStorage.getItem('clicksterSongs') || '[]');
  }

  loadPreset(index: number) {
    const songs = JSON.parse(localStorage.getItem('clicksterSongs') || '[]');
    const preset = songs[index];
    if(!preset) return;
    this.bpm = preset.bpm;
    this.timeSignature = preset.ts;
    this.accentBeat = preset.accent;
  }

  deletePreset(index: number) {
    let songs = JSON.parse(localStorage.getItem('clicksterSongs') || '[]');
    songs.splice(index, 1);
    localStorage.setItem('clicksterSongs', JSON.stringify(songs));
    this.renderPresets();
  }

  saveSetlist() {
    if (!this.setlistName.trim()) return;
    const currentPresets = JSON.parse(localStorage.getItem('clicksterSongs') || '[]');
    if (!currentPresets.length) return alert("No songs to save.");
    const allSetlists = JSON.parse(localStorage.getItem('clicksterSetlists') || '{}');
    allSetlists[this.setlistName] = currentPresets;
    localStorage.setItem('clicksterSetlists', JSON.stringify(allSetlists));
    alert(`Setlist '${this.setlistName}' saved.`);
    this.setlistName = '';
    this.renderSetlists();
  }

  renderSetlists() {
    const allSetlists = JSON.parse(localStorage.getItem('clicksterSetlists') || '{}');
    this.setlistNames = Object.keys(allSetlists);
  }

  loadSetlist(name: string) {
    const allSetlists = JSON.parse(localStorage.getItem('clicksterSetlists') || '{}');
    const songs = allSetlists[name];
    if(!songs) return;
    localStorage.setItem('clicksterSongs', JSON.stringify(songs));
    this.renderPresets();
  }

  deleteSetlist(name: string) {
    const allSetlists = JSON.parse(localStorage.getItem('clicksterSetlists') || '{}');
    delete allSetlists[name];
    localStorage.setItem('clicksterSetlists', JSON.stringify(allSetlists));
    this.renderSetlists();
  }
}

