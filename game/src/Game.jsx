import React, { useState, useEffect, useRef } from "react";
import clsx from "clsx";

import logo from "./assets/BillionsLogo.png";
import jumpSoundFile from "./assets/sounds/jump.mp3";
import backgroundSoundFile from "./assets/sounds/backgroundMusic.mp3";
import gameOverSoundFile from "./assets/gameOver.mp3";
import billionsIcon from "./assets/Billions.png";
// Obstacles
import obs1 from "./assets/Obstacles/robot1.png";
import obs2 from "./assets/Obstacles/robot2.png";
import obs3 from "./assets/Obstacles/robot3.png";
import obs4 from "./assets/Obstacles/robot4.png";
import obs5 from "./assets/Obstacles/robot5.png";
import obs6 from "./assets/Obstacles/robot6.png";

import run1 from "./assets/characterRunning/Run__000.png";
import run2 from "./assets/characterRunning/Run__001.png";
import run3 from "./assets/characterRunning/Run__002.png";

// Jumping frames
import jump1 from "./assets/characterJump/Jump__000.png";

// Idle
import idle1 from "./assets/characterIdle/Idle__000.png";
import idle2 from "./assets/characterIdle/Idle__001.png";

export default function NinjaAdventure() {
  const [characterBottom, setCharacterBottom] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [obstacles, setObstacles] = useState([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(
    () => Number(localStorage.getItem("highScore")) || 0
  );
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [obstacleSpeed, setObstacleSpeed] = useState(11);
  const [hasStarted, setHasStarted] = useState(false);

  const lastMilestoneRef = useRef(0);
  const maxSpeed = 20;

  const runFrames = [run1, run2, run3];
  const jumpFrames = [jump1];

  const IdleFrames = [idle1, idle2];

  // Track current frame
  const [frameIndex, setFrameIndex] = useState(0);

  const baseGravity = 0.2;
  const jumpVelocity = 9;
  const groundLevel = 0;
  const maxJumpHeight = 250;

  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);

  const isHoldingJump = useRef(false);
  const jumpSound = useRef(null);
  const gameOverSound = useRef(null);
  const [animationType, setAnimationType] = useState("idle");
  const startGame = useRef(null);

  const obstacleImages = [obs1, obs2, obs3, obs4, obs5, obs6];

  const getRandomHeight = () => Math.floor(Math.random() * 60) + 70;
  const getRandomObs = () =>
    obstacleImages[Math.floor(Math.random() * obstacleImages.length)];

  const spawnObstacles = (offset = 0) => {
    const numGroups = Math.floor(Math.random() * 3) + 1;
    const obstacleGap = 60;
    let newObstacles = [];
    let currentX = 1100 + offset;
    let groupIdCounter = Date.now(); // unique per spawn call

    for (let g = 0; g < numGroups; g++) {
      const groupSize = Math.floor(Math.random() * 3) + 1;
      const groupSpacing = 500;

      for (let i = 0; i < groupSize; i++) {
        newObstacles.push({
          left: currentX + i * obstacleGap,
          height: getRandomHeight(),
          img: getRandomObs(),
          groupId: groupIdCounter + g, // tag group
          passed: false,
        });
      }
      currentX += groupSpacing;
    }
    return newObstacles;
  };

  const resetGame = () => {
    // Handle reset game
    setCharacterBottom(groundLevel);
    setObstacles(spawnObstacles());
    setIsGameOver(false);
    setScore(0);
    setObstacleSpeed(11);
  };
  useEffect(() => {
    // Put ALL assets here
    const allAssets = [
      ...runFrames,
      ...jumpFrames,
      ...IdleFrames,
      obs1,
      obs2,
      obs3,
      obs4,
      obs5,
      obs6,
      logo,
      jumpSoundFile,
      backgroundSoundFile,
      gameOverSoundFile,
    ];

    let loadedCount = 0;
    const totalAssets = allAssets.length;

    const handleLoad = () => {
      loadedCount++;
      setLoadProgress(Math.floor((loadedCount / totalAssets) * 100));
      if (loadedCount === totalAssets) {
        setIsLoading(false); // ✅ All loaded
      }
    };

    allAssets.forEach((asset) => {
      if (asset.endsWith(".mp3")) {
        // Audio file
        const audio = new Audio(asset);
        audio.addEventListener("canplaythrough", handleLoad, { once: true });
      } else {
        // Image file
        const img = new Image();
        img.src = asset;
        img.onload = handleLoad;
      }
    });
  }, []);
  useEffect(() => {
    // Handle obstacle speed every 20
    if (
      score > 0 &&
      score % 20 === 0 &&
      score !== lastMilestoneRef.current &&
      obstacleSpeed < maxSpeed
    ) {
      setObstacleSpeed((prev) => Math.min(prev + 2, maxSpeed));
      lastMilestoneRef.current = score;
    }
  }, [score, obstacleSpeed]);

  const jump = () => {
    // handle character jump
    if (
      !isJumping &&
      !isGameOver &&
      characterBottom === groundLevel &&
      hasStarted
    ) {
      jumpSound.current?.play();
      setIsJumping(true);
      let velocity = jumpVelocity;
      let position = characterBottom;

      const animation = () => {
        const gravity = baseGravity * (obstacleSpeed / 11);

        if (isHoldingJump.current && position < maxJumpHeight) {
          velocity -= gravity * 0.4;
        } else {
          velocity -= gravity;
        }

        position += velocity;

        if (position <= groundLevel) {
          position = groundLevel;
          setCharacterBottom(position);
          setIsJumping(false);
          return;
        }

        setCharacterBottom(position);
        requestAnimationFrame(animation);
      };

      requestAnimationFrame(animation);
    }
  };

  useEffect(() => {
    let frameTimer;
    let lastTime = 0;

    const animate = (time) => {
      if (!lastTime) lastTime = time;

      const delta = time - lastTime;
      let frames, speed;

      if (!hasStarted || isGameOver) {
        frames = IdleFrames;
        speed = 120;
      } else if (isJumping) {
        frames = jumpFrames;
        speed = 90;
      } else {
        frames = runFrames;
        speed = 50;
      }

      if (delta >= speed) {
        setFrameIndex((prev) => (prev + 1) % frames.length);
        lastTime = time;
      }

      frameTimer = requestAnimationFrame(animate);
    };

    frameTimer = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameTimer);
  }, [hasStarted, isGameOver, isJumping]);

  useEffect(() => {
    if (!isGameOver && hasStarted) {
      const timer = setInterval(() => {
        setObstacles((prev) => {
          let updated = prev.map((obs) => ({
            ...obs,
            left: obs.left - obstacleSpeed,
          }));

          updated.forEach((obs) => {
            if (obs.left + 60 < 50 && !obs.passed) {
              obs.passed = true;

              // Check if this is the LAST obstacle in its group to pass
              const groupPassed = updated
                .filter((o) => o.groupId === obs.groupId)
                .every((o) => o.passed);

              if (groupPassed) {
                setScore((s) => s + 2); // +2 points per group
                setObstacleSpeed((speed) => Math.min(speed + 0.05, maxSpeed));
              }
            }
          });

          updated = updated.filter((obs) => obs.left > -60);

          const rightmost = Math.max(...updated.map((o) => o.left), 0);
          if (rightmost < 400) {
            updated = [...updated, ...spawnObstacles()];
          }

          return updated;
        });
      }, 30);

      return () => clearInterval(timer);
    }
  }, [isGameOver, obstacleSpeed, hasStarted]);

  useEffect(() => {
    const checkCollision = (obsLeft, obsHeight) => {
      return obsLeft < 80 && obsLeft > 20 && characterBottom < obsHeight + 50;
    };

    if (
      obstacles.some((obs) => checkCollision(obs.left, obs.height)) &&
      !isGameOver &&
      hasStarted
    ) {
      gameOverSound.current?.play();
      setIsGameOver(true);
      startGame.current?.pause();
      if (score > highScore) {
        localStorage.setItem("highScore", score);
        setHighScore(score);
        setIsNewHighScore(true);
      } else {
        setIsNewHighScore(false);
      }
    }
  }, [obstacles, characterBottom, isGameOver, hasStarted, score, highScore]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space") {
        isHoldingJump.current = true;
        if (!isJumping) jump();
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === "Space") {
        isHoldingJump.current = false;
      }
      if (e.code === "Enter") {
        if (!hasStarted) {
          setHasStarted(true);
          setObstacles(spawnObstacles());
          if (startGame.current) {
            startGame.current.pause(); // stop if already playing
            startGame.current.currentTime = 0; // rewind to start
            startGame.current.play(); // play from beginning
          }
        } else if (isGameOver) {
          if (startGame.current) {
            startGame.current.pause();
            startGame.current.currentTime = 0;
            startGame.current.play(); // ✅ start again after reset
          }
          resetGame();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isJumping, isGameOver, hasStarted]);

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-[#0046FE]">
      {isLoading ? (
        // Loading screen
        <div className="w-screen h-screen flex flex-col justify-center items-center bg-black text-white">
          <p className="text-2xl mb-4">Loading... {loadProgress}%</p>
          <div className="w-64 h-4 bg-gray-700 rounded">
            <div
              className="bg-green-500 h-full rounded"
              style={{ width: `${loadProgress}%` }}
            ></div>
          </div>
        </div>
      ) : (
        // Game screen
        <div className="bg-gray-200 px-2 rounded-sm flex gap-2 relative">
          <div
            className={clsx(
              "relative w-[1100px] h-[600px] overflow-hidden rounded-sm mx-auto",
              "bg-[#0195FF]"
            )}
          >
            <audio ref={jumpSound} src={jumpSoundFile} preload="auto" />
            <audio ref={gameOverSound} src={gameOverSoundFile} preload="auto" />
            <audio
              ref={startGame}
              src={backgroundSoundFile}
              preload="auto"
              loop
            />

            {/* Character */}
            <img
              src={
                !hasStarted || isGameOver
                  ? IdleFrames[frameIndex % IdleFrames.length]
                  : isJumping
                  ? jumpFrames[frameIndex % jumpFrames.length]
                  : runFrames[frameIndex % runFrames.length]
              }
              alt="Character"
              className="absolute object-contain left-[50px] w-[60px] h-[70px]"
              style={{ bottom: `${characterBottom}px` }}
            />

            {/* Obstacles */}
            {obstacles.map((obs, idx) => (
              <img
                key={idx}
                src={obs.img}
                alt={`Obstacle ${idx}`}
                className="absolute bottom-0 w-[60px]"
                style={{
                  left: `${obs.left}px`,
                  height: "100px",
                }}
              />
            ))}

            {/* Score */}
            <div className="w-full absolute top-0 py-3 flex justify-between px-3">
              <div className="px-4 py-2 h-13 bg-white rounded-sm flex items-center justify-center">
                <img src={logo} alt="" className="w-40 h-8" />
              </div>
              <div className="flex flex-col justify-end items-end">
                <span className="text-lg font-bold px-2 py-1 border-3 rounded-sm border-white  text-white w-20 flex justify-center items-center gap-2 helvetica">
                  <img src={billionsIcon} alt="" className="w-10"/>{score}
                </span>
                <div className="flex gap-2 justify-center items-center px-2 py-1 border-3 border-white rounded-sm mt-2">
                  <span className="text-lg text-white flex flex-col justify-center items-center gap-2 helvetica">
                    Highest Score:
                  </span>
                  <span className="text-lg font-bold text-white flex justify-center items-center gap-2 hel-bold">
                    {highScore}
                  </span>
                </div>
              </div>
            </div>

            {/* Game Over */}
            {isGameOver && (
              <div className="w-full h-full text-center flex flex-col mt-5 justify-center items-center ">
                <span className="text-4xl font-bold text-white helvetica">
                  GAME OVER
                </span>
                <br />
                <span className="text-lg helvetica-normal text-white blink">
                  Press <strong>[ Enter ] </strong> to Retry
                </span>
                {isNewHighScore && (
                  <div className="text-lg text-green-400 mt-2 helvetica-normal">
                    🎉 New Highest Score! 🎉
                  </div>
                )}
                <span className="text-[25px] font-bold text-white flex justify-center mt-2 items-center gap-2 helvetica">
                  <img src={billionsIcon} alt="" className="w-10"/>{score}
                </span>
              </div>
            )}

            {/* Start Screen */}
            {!hasStarted && (
              <div className="absolute left-0 w-full h-full flex flex-col justify-center items-center text-white z-10">
                <p className="text-4xl font-bold text-white mb-4 blink helvetica title">
                  Billiionaires Game
                </p>
                <p className="text-lg text-white blink helvetica-normal">
                  Press <strong>[ Enter ]</strong> to Start
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="absolute w-full bottom-[20px] text-center  blink">
        <span className="text-white text-xl helvetica-normal">
          Hold <strong className="">[ Space ]</strong> to jump higher
        </span>
      </div>
    </div>
  );
}
