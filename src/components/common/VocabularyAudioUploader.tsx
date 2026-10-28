import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Play, 
  Pause, 
  Trash2, 
  Mic, 
  Square, 
  Volume2, 
  Music,
  Check, 
  AlertCircle
} from 'lucide-react';

interface VocabularyAudioUploaderProps {
  audioUrl?: string;
  audioFileName?: string;
  audioDuration?: string;
  onAudioChange: (url: string | undefined, fileName: string | undefined, duration?: string) => void;
  itemName?: string;
  compact?: boolean;
}

export const VocabularyAudioUploader: React.FC<VocabularyAudioUploaderProps> = ({
  audioUrl,
  audioFileName,
  audioDuration,
  onAudioChange,
  itemName = 'kosakata',
  compact = true
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordError, setRecordError] = useState<string | null>(null);
  const [showRecordModal, setShowRecordModal] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<number | null>(null);

  // Setup / reset audio playback listeners
  useEffect(() => {
    if (!audioUrl) {
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      return;
    }

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

  // Handle Play/Pause toggle
  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current && audioUrl) {
      audioRef.current = new Audio(audioUrl);
    }
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.error('Audio playback error:', err);
        setIsPlaying(false);
      });
    }
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (< 12MB)
    if (file.size > 12 * 1024 * 1024) {
      alert('Ukuran file audio terlalu besar (maksimal 12 MB).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      
      // Calculate audio duration
      const tempAudio = new Audio(dataUrl);
      tempAudio.addEventListener('loadedmetadata', () => {
        const sec = Math.round(tempAudio.duration);
        const mins = Math.floor(sec / 60);
        const remSecs = sec % 60;
        const durStr = `${mins}:${remSecs < 10 ? '0' : ''}${remSecs}`;
        onAudioChange(dataUrl, file.name, durStr);
      });

      // Fallback if metadata fails
      setTimeout(() => {
        if (!tempAudio.duration) {
          onAudioChange(dataUrl, file.name, '0:03');
        }
      }, 500);
    };

    reader.readAsDataURL(file);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle deleting audio
  const handleDeleteAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    onAudioChange(undefined, undefined, undefined);
  };

  // Live recording functionality
  const startRecording = async () => {
    setRecordError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          const mins = Math.floor(recordingSeconds / 60);
          const secs = recordingSeconds % 60;
          const durationStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
          const cleanName = `rekaman_${itemName.replace(/[^a-zA-Z0-9]/g, '_')}.webm`;
          onAudioChange(base64Audio, cleanName, durationStr);
          setShowRecordModal(false);
          setIsRecording(false);
          setRecordingSeconds(0);
        };
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      recordTimerRef.current = window.setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Mikrofon tidak dapat diakses:', err);
      setRecordError('Izin mikrofon ditolak atau mikrofon tidak terdeteksi.');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // If audio is present: Compact Player UI
  if (audioUrl) {
    return (
      <div className="flex items-center gap-1.5 bg-emerald-50/80 border border-emerald-200/90 rounded-lg px-2 py-1 text-xs select-none">
        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={togglePlay}
          className={`w-6 h-6 rounded-full flex items-center justify-center text-white transition-transform duration-150 active:scale-95 shadow-2xs cursor-pointer ${
            isPlaying ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'
          }`}
          title={isPlaying ? 'Jeda rekaman' : 'Putar rekaman'}
        >
          {isPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current ml-0.5" />}
        </button>

        {/* Audio Info & Status */}
        <div className="flex flex-col min-w-0 max-w-[130px]">
          <span 
            className="text-[11px] font-semibold text-emerald-950 truncate"
            title={audioFileName || 'Rekaman audio'}
          >
            {audioFileName || 'Rekaman Audio'}
          </span>
          <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>/</span>
            <span>{audioDuration || formatTime(duration) || '0:03'}</span>
          </div>
        </div>

        {/* Action icons: Replace & Delete */}
        <div className="flex items-center gap-0.5 ml-auto">
          {/* Replace file input */}
          <input
            type="file"
            accept="audio/*,.mp3,.wav,.m4a,.ogg,.weba"
            onChange={handleFileChange}
            className="hidden"
            id={`audio-replace-${itemName}`}
          />
          <label
            htmlFor={`audio-replace-${itemName}`}
            className="p-1 text-slate-400 hover:text-emerald-700 rounded hover:bg-emerald-100/50 cursor-pointer transition-colors"
            title="Ganti file audio"
          >
            <Upload className="w-3 h-3" />
          </label>

          {/* Delete audio button */}
          <button
            type="button"
            onClick={handleDeleteAudio}
            className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 cursor-pointer transition-colors"
            title="Hapus rekaman audio ini"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  // If no audio: Clean Upload / Record Trigger UI
  return (
    <>
      <div className="flex items-center gap-1">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*,.mp3,.wav,.m4a,.ogg,.weba"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* 1. Upload File Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium bg-white hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 border border-slate-200 hover:border-indigo-300 rounded-md transition-all shadow-2xs cursor-pointer"
          title="Unggah file rekaman suara (.mp3, .wav, .m4a, .ogg)"
        >
          <Upload className="w-3 h-3 text-slate-400 group-hover:text-indigo-600" />
          <span>Unggah</span>
        </button>

        {/* 2. Direct Mic Recording Button */}
        <button
          type="button"
          onClick={() => setShowRecordModal(true)}
          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-md transition-all shadow-2xs cursor-pointer"
          title="Rekam suara langsung lewat mikrofon"
        >
          <Mic className="w-3 h-3" />
        </button>
      </div>

      {/* Direct Record Modal */}
      {showRecordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Rekam Suara Kosakata</h4>
                  <p className="text-[11px] text-slate-500">Glos: <b className="text-indigo-900">{itemName}</b></p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  stopRecording();
                  setShowRecordModal(false);
                }}
                className="text-slate-400 hover:text-slate-600 text-sm px-1.5 py-0.5 rounded-md hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Recording state / Visualizer */}
            <div className="text-center py-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
              {isRecording ? (
                <div className="space-y-2">
                  <div className="relative inline-flex items-center justify-center">
                    <span className="absolute w-12 h-12 bg-rose-500/20 rounded-full animate-ping pointer-events-none"></span>
                    <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-md">
                      <Mic className="w-5 h-5 animate-pulse" />
                    </div>
                  </div>
                  <div className="text-xs font-bold text-rose-600 tracking-wider">
                    SEDANG MEREKAM...
                  </div>
                  <div className="font-mono text-xl font-bold text-slate-900">
                    {formatTime(recordingSeconds)}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Ucapkan kata lokal dengan jelas di depan mikrofon
                  </p>
                </div>
              ) : (
                <div className="space-y-1 text-slate-600">
                  <Mic className="w-8 h-8 mx-auto text-slate-400" />
                  <p className="text-xs font-medium">Siap merekam suara narasumber</p>
                  <p className="text-[10px] text-slate-400">Pastikan izin mikrofon telah diberikan pada peramban</p>
                </div>
              )}

              {recordError && (
                <div className="text-[11px] text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200 mx-3 flex items-center gap-1.5 text-left">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{recordError}</span>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              {!isRecording ? (
                <button
                  type="button"
                  onClick={startRecording}
                  className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <Mic className="w-4 h-4" />
                  <span>Mulai Rekam</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Selesai & Simpan</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  stopRecording();
                  setShowRecordModal(false);
                }}
                className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
