import { useCallback, useEffect, useRef, useState } from 'react';
import { Audio } from 'expo-av';

const SOUND_FILES = {
  play: require('../../assets/sounds/play.mp3'),
  draw: require('../../assets/sounds/draw.mp3'),
  win: require('../../assets/sounds/win.mp3'),
  click: require('../../assets/sounds/click.mp3'),
};

export function useSounds() {
  const soundsRef = useRef<Record<string, Audio.Sound>>({});
  const musicRef = useRef<Audio.Sound | null>(null);
  const [musicOn, setMusicOn] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
        for (const [key, file] of Object.entries(SOUND_FILES)) {
          const { sound } = await Audio.Sound.createAsync(file);
          if (mounted) soundsRef.current[key] = sound;
        }
        const { sound: bgm } = await Audio.Sound.createAsync(require('../../assets/sounds/bgm.mp3'), {
          isLooping: true,
          volume: 0.3,
        });
        if (mounted) musicRef.current = bgm;
      } catch (e) {
        console.warn('No se pudieron cargar los sonidos:', e);
      }
    })();

    return () => {
      mounted = false;
      Object.values(soundsRef.current).forEach((s) => s.unloadAsync().catch(() => {}));
      musicRef.current?.unloadAsync().catch(() => {});
    };
  }, []);

  const play = useCallback((key: keyof typeof SOUND_FILES) => {
    soundsRef.current[key]?.replayAsync().catch(() => {});
  }, []);

  const toggleMusic = useCallback(async () => {
    if (!musicRef.current) return;
    if (musicOn) {
      await musicRef.current.pauseAsync();
      setMusicOn(false);
    } else {
      await musicRef.current.playAsync();
      setMusicOn(true);
    }
  }, [musicOn]);

  return {
    playCardSound: () => play('play'),
    playDrawSound: () => play('draw'),
    playWinSound: () => play('win'),
    playClickSound: () => play('click'),
    toggleMusic,
    musicOn,
  };
}