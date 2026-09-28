import { useState, useEffect } from 'react';
import { Volume2, VolumeX, Music, Settings, HelpCircle, ArrowLeft, RotateCcw, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { LEVEL_DATA, Question, LevelConfig } from './data/gameData';
import { sound } from './utils/audio';
import { JungleLeaf, JungleFlower, WoodenFrame, WoodRibbon } from './components/WoodUI';

type GameScreen = 'home' | 'select_level' | 'playing' | 'how_to_play' | 'summary';

interface UserProgress {
  [levelId: number]: {
    score: number;
    completed: boolean;
    stars: number;
  };
}

export function App() {
  const [screen, setScreen] = useState<GameScreen>('home');
  const [selectedLevelId, setSelectedLevelId] = useState<number>(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);

  // Sound and settings
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [musicEnabled, setMusicEnabled] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);

  // Modals for In-Game
  const [feedbackState, setFeedbackState] = useState<'correct' | 'wrong' | null>(null);
  const [showLevelFinishModal, setShowLevelFinishModal] = useState<boolean>(false);
  const [showGrandFinishModal, setShowGrandFinishModal] = useState<boolean>(false);

  // Persistent Progress (Level 1 to 5)
  const [progress, setProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem('jungle_division_progress');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return {
      1: { score: 0, completed: false, stars: 0 },
      2: { score: 0, completed: false, stars: 0 },
      3: { score: 0, completed: false, stars: 0 },
      4: { score: 0, completed: false, stars: 0 },
      5: { score: 0, completed: false, stars: 0 },
    };
  });

  const currentLevel: LevelConfig = LEVEL_DATA.find((l) => l.id === selectedLevelId) || LEVEL_DATA[0];
  const currentQuestion: Question = currentLevel.questions[currentQuestionIndex] || currentLevel.questions[0];

  // Save progress
  useEffect(() => {
    localStorage.setItem('jungle_division_progress', JSON.stringify(progress));
  }, [progress]);

  // Timer countdown
  useEffect(() => {
    let timer: any = null;
    if (isTimerActive && timeLeft > 0 && screen === 'playing' && !feedbackState && !showLevelFinishModal) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isTimerActive, timeLeft, screen, feedbackState, showLevelFinishModal]);

  const handleTimeout = () => {
    sound.playWrong();
    setFeedbackState('wrong');
  };

  // Toggle sound
  const handleToggleSound = () => {
    const s = sound.toggleSound();
    setSoundEnabled(s);
  };

  const handleToggleMusic = () => {
    const m = sound.toggleMusic();
    setMusicEnabled(m);
  };

  // Trigger celebration confetti
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#eab308', '#38bdf8', '#f97316', '#ec4899'],
      });
    } catch {
      // ignore
    }
  };

  // Start specific level
  const startLevel = (levelId: number) => {
    sound.playPop();
    setSelectedLevelId(levelId);
    setCurrentQuestionIndex(0);
    setScore(0);
    setTimeLeft(60);
    setFeedbackState(null);
    setShowLevelFinishModal(false);
    setShowGrandFinishModal(false);
    setScreen('playing');
    setIsTimerActive(true);
  };

  // Handle Option Click (A, B, C)
  const handleAnswerClick = (selectedAns: number) => {
    if (feedbackState !== null) return; // Prevent multiple clicks

    if (selectedAns === currentQuestion.quotient) {
      // Correct!
      sound.playCorrect();
      setScore((prev) => prev + 1);
      setFeedbackState('correct');
      triggerConfetti();
    } else {
      // Wrong!
      sound.playWrong();
      setFeedbackState('wrong');
    }
  };

  // Next question after modal
  const handleNextQuestion = () => {
    sound.playPop();
    setFeedbackState(null);

    if (currentQuestionIndex + 1 < currentLevel.questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setTimeLeft(60); // Reset timer for next question
    } else {
      // Level Completed!
      finishLevel();
    }
  };

  // Retry same question on wrong
  const handleRetryQuestion = () => {
    sound.playPop();
    setFeedbackState(null);
    setTimeLeft(60);
  };

  // Finish level logic
  const finishLevel = () => {
    setIsTimerActive(false);
    sound.playLevelComplete();

    const finalScore = score + (feedbackState === 'correct' ? 0 : 0); // already updated
    let starsEarned = 1;
    if (finalScore >= 9) starsEarned = 3;
    else if (finalScore >= 6) starsEarned = 2;

    setProgress((prev) => ({
      ...prev,
      [selectedLevelId]: {
        score: Math.max(prev[selectedLevelId]?.score || 0, finalScore),
        completed: true,
        stars: Math.max(prev[selectedLevelId]?.stars || 0, starsEarned),
      },
    }));

    // If level 5 completed with flying colors, show Grand Finish!
    if (selectedLevelId === 5) {
      setShowGrandFinishModal(true);
      sound.playGrandWin();
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 },
      });
    } else {
      setShowLevelFinishModal(true);
    }
  };

  // Go to next level
  const handleGoToNextLevel = () => {
    sound.playPop();
    if (selectedLevelId < 5) {
      startLevel(selectedLevelId + 1);
    } else {
      setScreen('summary');
    }
  };

  // Total stars & score
  const totalCompletedLevels = Object.values(progress).filter((p) => p.completed).length;
  const totalScoreAllLevels = Object.values(progress).reduce((acc, curr) => acc + curr.score, 0);

  // Background style
  const backgroundStyle = {
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.12), rgba(0, 0, 0, 0.22)), url('/images/jungle_bg.jpg')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  };

  return (
    <div
      className="min-h-screen w-full relative flex flex-col justify-between overflow-x-hidden font-sans select-none"
      style={backgroundStyle}
    >
      {/* TOP HEADER CONTROLS (Always accessible) */}
      <header className="relative z-20 w-full px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {screen !== 'home' ? (
            <button
              onClick={() => {
                sound.playPop();
                setScreen(screen === 'playing' ? 'select_level' : 'home');
              }}
              className="w-11 h-11 md:w-12 md:h-12 rounded-2xl bg-amber-500 hover:bg-amber-400 border-2 border-amber-800 shadow-[0_4px_0_#78350f,0_6px_10px_rgba(0,0,0,0.3)] flex items-center justify-center text-white active:translate-y-1 active:shadow-none transition-all cursor-pointer"
              title="Kembali"
            >
              <ArrowLeft className="w-6 h-6 stroke-[3]" />
            </button>
          ) : (
            <div className="bg-[#78350f]/80 backdrop-blur-sm border-2 border-[#fbbf24] px-4 py-1.5 rounded-full text-amber-200 font-bold text-xs md:text-sm shadow-md flex items-center gap-1.5">
              <span>🍃</span>
              <span>Belajar Bermain Jadi Hebat</span>
            </div>
          )}
        </div>

        {/* Right audio & settings icons */}
        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            className={`w-11 h-11 md:w-12 md:h-12 rounded-2xl border-2 shadow-[0_4px_0_#78350f,0_6px_10px_rgba(0,0,0,0.3)] flex items-center justify-center text-white active:translate-y-1 active:shadow-none transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-amber-600 hover:bg-amber-500 border-amber-900'
                : 'bg-zinc-600 hover:bg-zinc-500 border-zinc-900'
            }`}
            title="Efek Suara"
          >
            {soundEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
          </button>

          {/* Music Toggle */}
          <button
            onClick={handleToggleMusic}
            className={`w-11 h-11 md:w-12 md:h-12 rounded-2xl border-2 shadow-[0_4px_0_#78350f,0_6px_10px_rgba(0,0,0,0.3)] flex items-center justify-center text-white active:translate-y-1 active:shadow-none transition-all cursor-pointer ${
              musicEnabled
                ? 'bg-emerald-600 hover:bg-emerald-500 border-emerald-900'
                : 'bg-amber-700 hover:bg-amber-600 border-amber-950'
            }`}
            title="Musik Petualangan"
          >
            <Music className="w-6 h-6" />
          </button>

          {/* Settings Modal Toggle */}
          <button
            onClick={() => {
              sound.playPop();
              setShowSettingsModal(true);
            }}
            className="w-11 h-11 md:w-12 md:h-12 rounded-2xl bg-amber-600 hover:bg-amber-500 border-2 border-amber-900 shadow-[0_4px_0_#78350f,0_6px_10px_rgba(0,0,0,0.3)] flex items-center justify-center text-white active:translate-y-1 active:shadow-none transition-all cursor-pointer"
            title="Pengaturan"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* ==============================================================
          SCREEN 1: HOME SCREEN (Matches Image 1 exactly)
      ============================================================== */}
      {screen === 'home' && (
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-2 z-10">
          <div className="flex flex-col items-center max-w-lg w-full text-center">
            {/* JUNGLE ADVENTURE BIG LOGO */}
            <div className="relative mb-4 flex flex-col items-center animate-jungle-float">
              {/* Leaves around title */}
              <div className="absolute -top-6 -left-6 drop-shadow-md">
                <JungleLeaf size={52} />
              </div>
              <div className="absolute -top-6 -right-6 drop-shadow-md">
                <JungleLeaf size={52} className="scale-x-[-1]" />
              </div>

              {/* Main JUNGLE Title */}
              <h1 className="text-5xl sm:text-7xl font-extrabold uppercase tracking-wider jungle-title-top leading-none">
                JUNGLE
              </h1>

              {/* ADVENTURE Sub-banner */}
              <div className="relative -mt-2">
                <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-wider jungle-title-bottom leading-tight">
                  ADVENTURE
                </h2>
              </div>

              {/* Wooden Subtitle Plaque: Pembagian Dasar (0 - 100) */}
              <div className="mt-3 px-6 py-2 rounded-2xl bg-gradient-to-b from-[#8B4513] via-[#70360a] to-[#532605] border-3 border-[#fef08a] shadow-[0_6px_14px_rgba(0,0,0,0.5)]">
                <p className="text-yellow-300 font-bold text-lg sm:text-xl drop-shadow-md">
                  Pembagian Dasar (0 - 100)
                </p>
              </div>

              {/* Small Credit Text below the title */}
              <p className="mt-2 text-xs sm:text-sm font-semibold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] tracking-wide">
                Created by: Widodo guru sd
              </p>
            </div>

            {/* BIG PLAY BUTTON (MULAI) */}
            <div className="mt-6 flex flex-col items-center w-full max-w-xs gap-3">
              <button
                onClick={() => {
                  sound.playPop();
                  setScreen('select_level');
                }}
                className="btn-3d-yellow w-full py-4 px-8 rounded-full flex items-center justify-center gap-3 text-2xl font-black text-[#5c2b0e] hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-2xl"
              >
                <div className="w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-l-[16px] border-l-[#5c2b0e]" />
                <span>Mulai</span>
              </button>

              {/* Grade Badge */}
              <div className="px-5 py-2 rounded-xl bg-[#5c2b0e]/90 border border-amber-300/40 text-amber-200 font-bold text-sm shadow-md">
                Untuk Kelas 1 - 3 SD
              </div>

              {/* Secondary Navigation (Cara Bermain & Ringkasan) */}
              <div className="flex gap-2 mt-2 w-full">
                <button
                  onClick={() => {
                    sound.playPop();
                    setScreen('how_to_play');
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-amber-700/90 hover:bg-amber-600 border border-amber-400 text-amber-100 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4 text-yellow-300" />
                  <span>Cara Bermain</span>
                </button>

                <button
                  onClick={() => {
                    sound.playPop();
                    setScreen('summary');
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-800/90 hover:bg-emerald-700 border border-emerald-400 text-emerald-100 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  <span>🏆</span>
                  <span>Bintang & Skor</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ==============================================================
          SCREEN 2: SELECT LEVEL (Matches Image 2 exactly)
      ============================================================== */}
      {screen === 'select_level' && (
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-4 z-10 max-w-4xl mx-auto w-full">
          {/* Header Ribbon: "Pilih Level" */}
          <div className="mb-6 flex justify-center">
            <WoodRibbon title="Pilih Level" />
          </div>

          {/* 5 Levels Cards matching the screenshot */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 md:gap-4 w-full">
            {LEVEL_DATA.map((lvl) => {
              const lvlProgress = progress[lvl.id] || { score: 0, completed: false, stars: 0 };
              const isUnlocked = lvl.id === 1 || progress[lvl.id - 1]?.completed;

              return (
                <div
                  key={lvl.id}
                  onClick={() => {
                    if (isUnlocked) startLevel(lvl.id);
                  }}
                  className={`relative flex flex-col items-center rounded-2xl p-2.5 transition-all duration-200 ${
                    isUnlocked
                      ? 'cursor-pointer hover:-translate-y-2 active:translate-y-0'
                      : 'opacity-70 cursor-not-allowed filter grayscale-[30%]'
                  } bg-gradient-to-b from-[#8B4513] via-[#65330c] to-[#432107] border-4 border-[#321703] shadow-[0_10px_20px_rgba(0,0,0,0.5)]`}
                >
                  {/* Decorative leaves */}
                  <div className="absolute -top-2 -left-2 pointer-events-none">
                    <JungleLeaf size={22} />
                  </div>
                  <div className="absolute -top-2 -right-2 pointer-events-none">
                    <JungleLeaf size={22} className="scale-x-[-1]" />
                  </div>

                  {/* Level Number Pentagon Badge */}
                  <div
                    className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center font-black text-3xl md:text-4xl text-white shadow-[0_6px_0_rgba(0,0,0,0.3),inset_0_3px_5px_rgba(255,255,255,0.4)] border-2 border-white/60 mb-2 bg-gradient-to-b ${lvl.gradient}`}
                  >
                    {lvl.id}
                  </div>

                  {/* Level Name */}
                  <span className="text-yellow-200 font-extrabold text-sm md:text-base drop-shadow-sm">
                    {lvl.title}
                  </span>

                  {/* Stars Row (3 Stars) */}
                  <div className="flex gap-1 my-1.5">
                    {[1, 2, 3].map((starIdx) => (
                      <span
                        key={starIdx}
                        className={`text-base md:text-lg drop-shadow-md ${
                          starIdx <= lvlProgress.stars ? 'text-yellow-400' : 'text-stone-500 opacity-60'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>

                  {/* Score Tag: 0/10 or score/10 */}
                  <div className="w-full bg-[#2a1304] rounded-lg py-1 px-2 text-center border border-[#783d16]">
                    <span className="text-amber-100 font-bold text-xs md:text-sm">
                      {lvlProgress.score}/10
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Motivational Bottom Banner */}
          <div className="mt-8 px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 border-2 border-yellow-200 shadow-[0_4px_10px_rgba(0,0,0,0.4)]">
            <p className="text-[#451a03] font-black text-sm md:text-base tracking-wide">
              🌟 Ayo taklukkan semua level! 🌟
            </p>
          </div>
        </main>
      )}

      {/* ==============================================================
          SCREEN 3: PLAYING GAME (Matches Image 3)
      ============================================================== */}
      {screen === 'playing' && (
        <main className="flex-1 flex flex-col items-center justify-between px-3 md:px-6 py-2 z-10 max-w-3xl mx-auto w-full">
          {/* Top Bar: Level Badge & Progress Dots */}
          <div className="w-full flex items-center justify-between gap-2 mt-1 mb-2">
            {/* Level Label Plaque */}
            <div className="px-5 py-1.5 rounded-2xl bg-gradient-to-b from-[#a0522d] via-[#853f1a] to-[#5c2b0e] border-2 border-[#fef08a] shadow-md">
              <span className="text-yellow-200 font-black text-base md:text-lg drop-shadow">
                {currentLevel.title}
              </span>
            </div>

            {/* Question Progress Dots (10 dots) */}
            <div className="flex items-center gap-1.5 bg-[#451a03]/80 px-3 py-2 rounded-2xl border border-amber-500/50 shadow-inner">
              {currentLevel.questions.map((_, i) => (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 md:w-3.5 md:h-3.5 rounded-full transition-all ${
                    i < currentQuestionIndex
                      ? 'bg-green-400 border border-green-200 shadow-sm'
                      : i === currentQuestionIndex
                      ? 'bg-yellow-300 scale-125 ring-2 ring-white'
                      : 'bg-stone-500/60'
                  }`}
                />
              ))}
              <span className="ml-1 text-white text-xs md:text-sm font-bold">
                {currentQuestionIndex + 1}/{currentLevel.questions.length}
              </span>
            </div>
          </div>

          {/* MAIN QUESTION BOARD (Big Wooden Signboard) */}
          <div className="w-full relative my-auto">
            <WoodenFrame
              hasLeaves={true}
              innerClassName="flex flex-col items-center justify-center min-h-[190px] md:min-h-[230px] text-center"
            >
              {/* Question Text */}
              <p className="text-stone-700 font-bold text-base md:text-lg mb-2">
                Berapa hasil dari
              </p>
              <div className="flex items-center justify-center gap-3 text-4xl sm:text-6xl font-black text-[#4a2305] tracking-wide my-1">
                <span>{currentQuestion.dividend}</span>
                <span className="text-amber-600">÷</span>
                <span>{currentQuestion.divisor}</span>
                <span className="text-amber-600">=</span>
                <span className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl border-4 border-dashed border-[#b45309] bg-white/60 flex items-center justify-center text-amber-700">
                  ?
                </span>
              </div>

              {/* Visual dots grouping for younger kids (Grade 1-3 SD visual aid) */}
              <div className="mt-4 flex flex-wrap justify-center gap-2 max-w-md">
                <span className="text-xs font-semibold text-stone-600 bg-amber-100/80 px-2.5 py-0.5 rounded-full border border-amber-300">
                  💡 Tips: {currentQuestion.dividend} buah dibagikan ke {currentQuestion.divisor} kelompok
                </span>
              </div>
            </WoodenFrame>

            {/* Score & Timer Badges pinned to the right of the board */}
            <div className="flex justify-between items-center px-4 mt-2">
              {/* Score Indicator */}
              <div className="flex items-center gap-2 bg-[#78350f] px-3.5 py-1.5 rounded-xl border-2 border-amber-400 text-white font-bold text-sm shadow-md">
                <span className="text-yellow-400 text-lg">★</span>
                <span>Skor: {score}</span>
              </div>

              {/* Time Indicator */}
              <div
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border-2 text-white font-bold text-sm shadow-md transition-all ${
                  timeLeft <= 10
                    ? 'bg-red-600 border-red-300 animate-pulse'
                    : 'bg-[#78350f] border-amber-400'
                }`}
              >
                <span>⏱</span>
                <span>Waktu: {timeLeft}s</span>
              </div>
            </div>
          </div>

          {/* 3 ANSWER OPTIONS (A, B, C) matching Image 3 */}
          <div className="w-full grid grid-cols-3 gap-3 md:gap-5 my-3">
            {currentQuestion.options.map((option, idx) => {
              // Colors matching reference: Orange/Yellow (A), Blue/Sky (B), Purple (C)
              const cardColors = [
                {
                  gradient: 'from-amber-400 via-orange-500 to-amber-600',
                  border: 'border-[#c2410c]',
                  bottomBorder: 'border-b-[#7c2d12]',
                  tagBg: 'bg-orange-600',
                  letter: 'A',
                },
                {
                  gradient: 'from-sky-400 via-blue-500 to-sky-600',
                  border: 'border-[#0369a1]',
                  bottomBorder: 'border-b-[#0c4a6e]',
                  tagBg: 'bg-blue-600',
                  letter: 'B',
                },
                {
                  gradient: 'from-purple-400 via-fuchsia-500 to-purple-600',
                  border: 'border-[#7e22ce]',
                  bottomBorder: 'border-b-[#581c87]',
                  tagBg: 'bg-purple-600',
                  letter: 'C',
                },
              ][idx % 3];

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswerClick(option)}
                  className={`group relative flex flex-col items-center justify-center py-5 md:py-8 rounded-3xl cursor-pointer bg-gradient-to-b ${cardColors.gradient} border-4 ${cardColors.border} border-b-8 ${cardColors.bottomBorder} shadow-[0_10px_20px_rgba(0,0,0,0.4),inset_0_3px_5px_rgba(255,255,255,0.4)] hover:scale-105 active:translate-y-2 active:border-b-4 transition-all duration-100`}
                >
                  {/* Big Number Answer */}
                  <span className="text-4xl md:text-6xl font-black text-white drop-shadow-[0_3px_5px_rgba(0,0,0,0.6)]">
                    {option}
                  </span>

                  {/* Letter Tag: A, B, or C */}
                  <div
                    className={`absolute -bottom-3.5 w-7 h-7 md:w-9 md:h-9 rounded-full ${cardColors.tagBg} border-2 border-white flex items-center justify-center font-black text-white text-xs md:text-sm shadow-md`}
                  >
                    {cardColors.letter}
                  </div>
                </button>
              );
            })}
          </div>
        </main>
      )}

      {/* ==============================================================
          MODAL 1: "HEBAT! Jawaban kamu benar!" (Matches Image 4)
      ============================================================== */}
      {feedbackState === 'correct' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-pop-in">
          <div className="relative w-full max-w-md bg-gradient-to-b from-[#8B4513] via-[#6f350b] to-[#4c2406] p-4 rounded-3xl border-4 border-[#351903] shadow-[0_20px_40px_rgba(0,0,0,0.7)] text-center">
            {/* 3 Golden Stars Overhanging the Top */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1">
              <span className="text-4xl text-yellow-400 drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)] rotate-[-12deg]">
                ★
              </span>
              <span className="text-5xl text-yellow-300 drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)] -translate-y-2">
                ★
              </span>
              <span className="text-4xl text-yellow-400 drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)] rotate-[12deg]">
                ★
              </span>
            </div>

            {/* Corner leaves and flowers */}
            <div className="absolute -top-4 -left-4 pointer-events-none">
              <JungleLeaf size={45} />
            </div>
            <div className="absolute -top-4 -right-4 pointer-events-none">
              <JungleLeaf size={45} className="scale-x-[-1]" />
            </div>
            <div className="absolute -bottom-3 -right-3 pointer-events-none">
              <JungleFlower size={36} />
            </div>

            {/* Content Body */}
            <div className="pt-8 pb-3 px-4">
              <h3 className="text-4xl md:text-5xl font-black text-yellow-300 drop-shadow-[0_3px_0_#78350f,0_5px_8px_rgba(0,0,0,0.7)] mb-2 tracking-wide font-display">
                Hebat!
              </h3>
              <p className="text-white font-bold text-lg md:text-xl drop-shadow-md mb-6">
                Jawaban kamu benar!
              </p>

              {/* Lanjut Button */}
              <button
                onClick={handleNextQuestion}
                className="btn-3d-green w-full py-3.5 px-6 rounded-full flex items-center justify-center gap-2 text-xl md:text-2xl font-black text-white cursor-pointer active:scale-95 transition-all shadow-xl"
              >
                <span>Lanjut</span>
                <ArrowRight className="w-6 h-6 stroke-[3]" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================
          MODAL 2: "Ups... Jawaban kamu masih salah" (Matches Image 5)
      ============================================================== */}
      {feedbackState === 'wrong' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-pop-in">
          <div className="relative w-full max-w-md bg-gradient-to-b from-[#8B4513] via-[#6f350b] to-[#4c2406] p-4 rounded-3xl border-4 border-[#351903] shadow-[0_20px_40px_rgba(0,0,0,0.7)] text-center">
            {/* Cute Jungle Stone / X Badge Overhanging the Top */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center justify-center">
              <div className="w-18 h-18 rounded-2xl bg-zinc-600 border-3 border-zinc-400 shadow-[0_6px_12px_rgba(0,0,0,0.5)] flex items-center justify-center text-3xl">
                <span className="drop-shadow">😢</span>
              </div>
              <div className="absolute -right-2 -bottom-1 w-9 h-9 rounded-full bg-red-600 border-2 border-white flex items-center justify-center text-white font-black text-xl shadow-lg">
                ✕
              </div>
            </div>

            {/* Corner leaves */}
            <div className="absolute -top-4 -left-4 pointer-events-none">
              <JungleLeaf size={45} />
            </div>
            <div className="absolute -top-4 -right-4 pointer-events-none">
              <JungleLeaf size={45} className="scale-x-[-1]" />
            </div>

            {/* Content Body */}
            <div className="pt-10 pb-3 px-4">
              <h3 className="text-3xl md:text-4xl font-black text-amber-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] mb-2 tracking-wide font-display">
                Ups...
              </h3>
              <p className="text-white font-bold text-base md:text-lg drop-shadow-md mb-1">
                Jawaban kamu masih salah.
              </p>
              <p className="text-yellow-200 font-semibold text-sm drop-shadow-sm mb-6">
                Yuk, coba lagi! Kamu pasti bisa!
              </p>

              {/* Coba Lagi Button */}
              <button
                onClick={handleRetryQuestion}
                className="btn-3d-orange w-full py-3.5 px-6 rounded-full flex items-center justify-center gap-2 text-xl md:text-2xl font-black text-white cursor-pointer active:scale-95 transition-all shadow-xl"
              >
                <RotateCcw className="w-6 h-6 stroke-[3]" />
                <span>Coba Lagi</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================
          MODAL 3: "Level Selesai!" (Matches Image 6)
      ============================================================== */}
      {showLevelFinishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-pop-in">
          <WoodenFrame
            hasLeaves={true}
            className="w-full max-w-md"
            innerClassName="text-center py-6 px-6"
          >
            {/* Level Finished Title Plaque */}
            <div className="-mt-11 mb-4 inline-block px-7 py-2 rounded-2xl bg-gradient-to-b from-[#a0522d] to-[#5c2b0e] border-3 border-yellow-300 shadow-lg">
              <h3 className="text-2xl md:text-3xl font-black text-yellow-300 font-display drop-shadow">
                {currentLevel.title} Selesai!
              </h3>
            </div>

            {/* 3 Golden Stars */}
            <div className="flex items-center justify-center gap-2 mb-3">
              {[1, 2, 3].map((starIdx) => (
                <span
                  key={starIdx}
                  className={`text-4xl md:text-5xl drop-shadow-[0_3px_5px_rgba(0,0,0,0.4)] ${
                    starIdx <= (progress[selectedLevelId]?.stars || 1)
                      ? 'text-yellow-400'
                      : 'text-stone-400 opacity-60'
                  }`}
                >
                  ★
                </span>
              ))}
            </div>

            <p className="text-stone-700 font-bold text-lg mb-1">Skor Level</p>

            {/* Score Box */}
            <div className="inline-flex items-center gap-2 bg-[#8B4513] text-yellow-300 px-6 py-2.5 rounded-2xl border-2 border-yellow-400 shadow-inner mb-4">
              <span className="text-2xl">★</span>
              <span className="text-2xl font-black">
                {score}/{currentLevel.questions.length}
              </span>
            </div>

            {/* Next Level Question */}
            <p className="text-stone-800 font-extrabold text-base md:text-lg mb-4">
              {selectedLevelId < 5
                ? `Lanjut ke Level ${selectedLevelId + 1}?`
                : 'Lihat Ringkasan Petualangan?'}
            </p>

            {/* Action Buttons: Ya (Green) / Nanti (Slate) */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleGoToNextLevel}
                className="btn-3d-green flex-1 py-3 px-4 rounded-full flex items-center justify-center gap-2 text-lg md:text-xl font-black text-white cursor-pointer active:scale-95 transition-all shadow-md"
              >
                <span>Ya</span>
                <ArrowRight className="w-5 h-5 stroke-[3]" />
              </button>

              <button
                onClick={() => {
                  sound.playPop();
                  setShowLevelFinishModal(false);
                  setScreen('select_level');
                }}
                className="btn-3d-gray flex-1 py-3 px-4 rounded-full text-lg md:text-xl font-black text-white cursor-pointer active:scale-95 transition-all shadow-md"
              >
                Nanti
              </button>
            </div>
          </WoodenFrame>
        </div>
      )}

      {/* ==============================================================
          MODAL 4: "Selamat! Kamu telah menyelesaikan semua level!" (Matches Image 8)
      ============================================================== */}
      {showGrandFinishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-pop-in">
          <div className="relative w-full max-w-lg bg-gradient-to-b from-[#8B4513] via-[#6f350b] to-[#4c2406] p-6 rounded-3xl border-4 border-[#351903] shadow-[0_20px_40px_rgba(0,0,0,0.7)] text-center">
            {/* Decorative Leaves */}
            <div className="absolute -top-4 -left-4 pointer-events-none">
              <JungleLeaf size={50} />
            </div>
            <div className="absolute -top-4 -right-4 pointer-events-none">
              <JungleLeaf size={50} className="scale-x-[-1]" />
            </div>
            <div className="absolute -bottom-3 -left-3 pointer-events-none">
              <JungleFlower size={40} />
            </div>
            <div className="absolute -bottom-3 -right-3 pointer-events-none">
              <JungleFlower size={40} />
            </div>

            {/* Ribbon Title */}
            <div className="-mt-11 mb-3 inline-block px-8 py-2 rounded-2xl bg-gradient-to-b from-[#a0522d] via-[#853f1a] to-[#5c2b0e] border-3 border-yellow-300 shadow-lg">
              <h2 className="text-3xl md:text-4xl font-black text-yellow-300 font-display drop-shadow">
                Selamat!
              </h2>
            </div>

            <p className="text-yellow-100 font-bold text-lg md:text-xl drop-shadow mb-4">
              Kamu telah menyelesaikan semua level!
            </p>

            {/* Inner Plaque for Final Score */}
            <div className="bg-[#fce4be] rounded-2xl p-4 border-2 border-[#d4a373] shadow-inner max-w-xs mx-auto mb-4">
              <p className="text-[#5c2b0e] font-extrabold text-base md:text-lg">Skor Akhir</p>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="text-yellow-500 text-3xl">★</span>
                <span className="text-4xl md:text-5xl font-black text-[#5c2b0e]">
                  {totalScoreAllLevels}
                </span>
              </div>
            </div>

            <p className="text-white font-bold text-sm md:text-base drop-shadow mb-5">
              Kamu hebat!
              <br />
              Terus belajar dan raih prestasi!
            </p>

            {/* Main Lagi Button */}
            <button
              onClick={() => {
                sound.playPop();
                setShowGrandFinishModal(false);
                setScreen('summary');
              }}
              className="btn-3d-green w-full max-w-xs mx-auto py-3.5 px-6 rounded-full flex items-center justify-center gap-2 text-xl font-black text-white cursor-pointer active:scale-95 transition-all shadow-xl"
            >
              <RotateCcw className="w-6 h-6 stroke-[3]" />
              <span>Lihat Ringkasan</span>
            </button>
          </div>
        </div>
      )}

      {/* ==============================================================
          SCREEN 4: RINGKASAN LEVEL (Matches Image 7)
      ============================================================== */}
      {screen === 'summary' && (
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-4 z-10 max-w-4xl mx-auto w-full">
          {/* Header Ribbon: "Ringkasan Level" */}
          <div className="mb-6 flex justify-center">
            <WoodRibbon title="Ringkasan Level" />
          </div>

          {/* Wooden Frame containing the 5 level status plaques */}
          <WoodenFrame
            hasLeaves={true}
            className="w-full max-w-3xl"
            innerClassName="p-4 md:p-6"
          >
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 md:gap-4">
              {LEVEL_DATA.map((lvl) => {
                const lvlProgress = progress[lvl.id] || { score: 0, completed: false, stars: 0 };

                return (
                  <div
                    key={lvl.id}
                    className="flex flex-col items-center p-2 rounded-2xl bg-white/70 border-2 border-stone-300 shadow-sm"
                  >
                    {/* Badge */}
                    <div
                      className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center font-black text-2xl md:text-3xl text-white shadow-md border-2 border-white/60 mb-2 bg-gradient-to-b ${lvl.gradient}`}
                    >
                      {lvl.id}
                    </div>

                    {/* Stars */}
                    <div className="flex gap-0.5 my-1">
                      {[1, 2, 3].map((starIdx) => (
                        <span
                          key={starIdx}
                          className={`text-sm md:text-base ${
                            starIdx <= lvlProgress.stars ? 'text-yellow-500' : 'text-stone-300'
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>

                    {/* Score */}
                    <div className="w-full bg-[#3d1d07] rounded-lg py-0.5 px-1 text-center mt-1">
                      <span className="text-yellow-300 font-bold text-xs md:text-sm">
                        {lvlProgress.score}/10
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </WoodenFrame>

          {/* Bottom Info Plaque & Main Lagi Button */}
          <div className="mt-6 flex flex-col sm:flex-row items-center gap-4 w-full max-w-xl justify-between">
            <div className="px-5 py-2.5 rounded-2xl bg-[#5c2b0e]/95 border-2 border-amber-400 text-amber-200 font-bold text-sm md:text-base shadow-md text-center sm:text-left">
              Kamu sudah menyelesaikan
              <br />
              <span className="text-yellow-300 font-black">{totalCompletedLevels} level</span> dari 5 level!
            </div>

            <button
              onClick={() => {
                sound.playPop();
                setScreen('select_level');
              }}
              className="btn-3d-yellow py-3.5 px-8 rounded-full flex items-center justify-center gap-2 text-xl font-black text-[#5c2b0e] cursor-pointer active:scale-95 transition-all shadow-xl"
            >
              <RotateCcw className="w-5 h-5 stroke-[3]" />
              <span>Main Lagi</span>
            </button>
          </div>
        </main>
      )}

      {/* ==============================================================
          SCREEN 5: CARA BERMAIN (Matches Image 9)
      ============================================================== */}
      {screen === 'how_to_play' && (
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-4 z-10 max-w-3xl mx-auto w-full">
          {/* Header Ribbon: "Cara Bermain" */}
          <div className="mb-4 flex justify-center">
            <WoodRibbon title="Cara Bermain" />
          </div>

          <div className="relative w-full">
            <WoodenFrame
              hasLeaves={true}
              innerClassName="p-5 md:p-8 flex flex-col justify-between"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                {/* 4 Steps Column */}
                <div className="md:col-span-2 space-y-3.5">
                  {[
                    { num: '1', text: 'Pilih level yang ingin kamu mainkan.' },
                    { num: '2', text: 'Jawab setiap soal pembagian dasar.' },
                    { num: '3', text: 'Pilih salah satu dari 3 opsi jawaban.' },
                    { num: '4', text: 'Dapatkan bintang sebanyak-banyaknya!' },
                  ].map((step) => (
                    <div key={step.num} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-b from-amber-400 to-orange-500 text-white font-black text-base flex items-center justify-center shadow-md shrink-0 border border-amber-200">
                        {step.num}
                      </div>
                      <p className="text-stone-800 font-bold text-sm md:text-base leading-snug">
                        {step.text}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Right Decorative Jungle Card */}
                <div className="bg-[#78350f] rounded-2xl p-4 border-2 border-yellow-400 text-center text-yellow-100 shadow-md">
                  <span className="text-3xl mb-1 block">🌴</span>
                  <p className="font-extrabold text-sm md:text-base text-yellow-300 leading-tight">
                    Pembagian itu mudah, ayo kita belajar!
                  </p>
                </div>
              </div>

              {/* Mulai Button at Bottom of Wooden Board */}
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => {
                    sound.playPop();
                    setScreen('select_level');
                  }}
                  className="btn-3d-yellow py-3 px-10 rounded-full flex items-center justify-center gap-2 text-xl font-black text-[#5c2b0e] cursor-pointer active:scale-95 transition-all shadow-lg"
                >
                  <div className="w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[14px] border-l-[#5c2b0e]" />
                  <span>Mulai</span>
                </button>
              </div>
            </WoodenFrame>
          </div>
        </main>
      )}

      {/* ==============================================================
          SETTINGS MODAL
      ============================================================== */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-pop-in">
          <WoodenFrame
            hasLeaves={true}
            className="w-full max-w-sm"
            innerClassName="p-5 text-center"
          >
            <div className="-mt-10 mb-4 inline-block px-6 py-1.5 rounded-2xl bg-gradient-to-b from-[#a0522d] to-[#5c2b0e] border-2 border-yellow-300 shadow-md">
              <h3 className="text-xl font-black text-yellow-300 font-display">
                Pengaturan
              </h3>
            </div>

            <div className="space-y-4 my-4">
              {/* Sound Toggle Row */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-100/80 border border-amber-300">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-amber-800" />
                  <span className="text-stone-800 font-bold text-sm">Efek Suara</span>
                </div>
                <button
                  onClick={handleToggleSound}
                  className={`px-4 py-1.5 rounded-full font-bold text-xs text-white transition-all cursor-pointer ${
                    soundEnabled ? 'bg-green-600' : 'bg-stone-500'
                  }`}
                >
                  {soundEnabled ? 'AKTIF' : 'MATI'}
                </button>
              </div>

              {/* Music Toggle Row */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-100/80 border border-amber-300">
                <div className="flex items-center gap-2">
                  <Music className="w-5 h-5 text-amber-800" />
                  <span className="text-stone-800 font-bold text-sm">Musik Latar</span>
                </div>
                <button
                  onClick={handleToggleMusic}
                  className={`px-4 py-1.5 rounded-full font-bold text-xs text-white transition-all cursor-pointer ${
                    musicEnabled ? 'bg-green-600' : 'bg-stone-500'
                  }`}
                >
                  {musicEnabled ? 'AKTIF' : 'MATI'}
                </button>
              </div>

              {/* Reset Progress Button */}
              <button
                onClick={() => {
                  sound.playPop();
                  if (confirm('Ulangi semua progres game dari awal?')) {
                    const fresh = {
                      1: { score: 0, completed: false, stars: 0 },
                      2: { score: 0, completed: false, stars: 0 },
                      3: { score: 0, completed: false, stars: 0 },
                      4: { score: 0, completed: false, stars: 0 },
                      5: { score: 0, completed: false, stars: 0 },
                    };
                    setProgress(fresh);
                    setShowSettingsModal(false);
                  }
                }}
                className="w-full py-2 px-3 rounded-xl bg-red-100 hover:bg-red-200 border border-red-300 text-red-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Reset Semua Nilai & Bintang
              </button>
            </div>

            <button
              onClick={() => {
                sound.playPop();
                setShowSettingsModal(false);
              }}
              className="btn-3d-yellow w-full py-2.5 rounded-full font-black text-[#5c2b0e] text-base cursor-pointer shadow-md"
            >
              Tutup
            </button>
          </WoodenFrame>
        </div>
      )}

      {/* FOOTER BAR (Clean, Kid-friendly) */}
      <footer className="w-full text-center py-2 z-10">
        <p className="text-[11px] font-bold text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] tracking-wide">
          🌲 Jungle Adventure: Pembagian Dasar SD Kelas 1-3 • Matematika Ceria 🌲
        </p>
      </footer>
    </div>
  );
}
export default App;
