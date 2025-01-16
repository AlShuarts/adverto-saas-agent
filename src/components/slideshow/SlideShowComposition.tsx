import { useState, useEffect, useRef } from "react";
import { SlideShowImage } from "./SlideShowImage";

type SlideShowCompositionProps = {
  images: string[];
};

export const SlideShowComposition = ({ images }: SlideShowCompositionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);

    // Créer le contexte audio et générer la musique
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Créer un oscillateur pour la mélodie
    oscillatorRef.current = audioContextRef.current.createOscillator();
    oscillatorRef.current.type = 'sine';
    oscillatorRef.current.frequency.setValueAtTime(440, audioContextRef.current.currentTime); // La note A4

    // Créer un noeud de gain pour contrôler le volume
    gainNodeRef.current = audioContextRef.current.createGain();
    gainNodeRef.current.gain.setValueAtTime(0.1, audioContextRef.current.currentTime); // Volume à 10%

    // Connecter les noeuds
    oscillatorRef.current.connect(gainNodeRef.current);
    gainNodeRef.current.connect(audioContextRef.current.destination);

    // Démarrer l'oscillateur
    oscillatorRef.current.start();

    // Ajouter une modulation simple pour rendre le son plus intéressant
    setInterval(() => {
      if (oscillatorRef.current && audioContextRef.current) {
        const now = audioContextRef.current.currentTime;
        oscillatorRef.current.frequency.setValueAtTime(440, now); // La
        setTimeout(() => {
          if (oscillatorRef.current && audioContextRef.current) {
            oscillatorRef.current.frequency.setValueAtTime(493.88, audioContextRef.current.currentTime); // Si
          }
        }, 1000);
        setTimeout(() => {
          if (oscillatorRef.current && audioContextRef.current) {
            oscillatorRef.current.frequency.setValueAtTime(523.25, audioContextRef.current.currentTime); // Do
          }
        }, 2000);
      }
    }, 3000);

    return () => {
      clearInterval(timer);
      // Arrêter et nettoyer l'audio
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      }
      if (gainNodeRef.current) {
        gainNodeRef.current.disconnect();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [images.length]);

  return (
    <div style={{ flex: 1, backgroundColor: 'black', position: 'relative', width: '100%', height: '100%' }}>
      {images.map((image, index) => (
        <SlideShowImage
          key={index}
          src={image}
          index={index}
          currentIndex={currentIndex}
        />
      ))}
    </div>
  );
};