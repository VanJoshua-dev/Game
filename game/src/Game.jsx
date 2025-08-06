import React, { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import character from "./assets/character1.png";
import jumpSoundFile from "./assets/jump.mp3";
import gameOverSoundFile from "./assets/gameOver.mp3";
import billionsLogo from "./assets/BillionsLogo.png";
// bg-[#1E5CFF]
export default function JumpGame() {
  const [characterBottom, setCharacterBottom] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [obstacleLeft, setObstacleLeft] = useState(700);
  const [obstacleHeight, setObstacleHeight] = useState(40);
  const [obstacleColor, setObstacleColor] = useState("green");
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [obstacleSpeed, setObstacleSpeed] = useState(15);

  const gravity = 0.7;
  const jumpVelocity = 15;
  const groundLevel = 0;

  const gameRef = useRef(null);
  const jumpSound = useRef(null);
  const gameOverSound = useRef(null);
  const getRandomHeight = () => Math.floor(Math.random() * 30) + 30;
  const getRandomColor = () => {
    const colors = ["green", "gray", "purple", "orange", "black"];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const resetGame = () => {
    setCharacterBottom(groundLevel);
    setObstacleLeft(700);
    setObstacleHeight(getRandomHeight());
    setObstacleColor(getRandomColor());
    setIsGameOver(false);
    setScore(0);
    setObstacleSpeed(15);
  };

  const jump = () => {
    if (!isJumping && !isGameOver && characterBottom === groundLevel) {
      jumpSound.current?.play();
      setIsJumping(true);
      let velocity = jumpVelocity;
      let position = characterBottom;

      const animation = () => {
        velocity -= gravity;
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
    if (!isGameOver) {
      const obstacleTimer = setInterval(() => {
        setObstacleLeft((prev) => {
          if (prev < -20) {
            setObstacleHeight(getRandomHeight());
            setObstacleColor(getRandomColor());
            setScore((s) => s + 1);
            setObstacleSpeed((s) => s + 0.3);
            return 700;
          }
          return prev - obstacleSpeed;
        });
      }, 30);

      return () => clearInterval(obstacleTimer);
    }
  }, [isGameOver, obstacleSpeed]);

  useEffect(() => {
    if (
      obstacleLeft < 80 &&
      obstacleLeft > 20 &&
      characterBottom < obstacleHeight + 50
    ) {
      if (!isGameOver) {
        gameOverSound.current?.play(); // 🔊 Play the game over sound
        setIsGameOver(true);
      }
    }
  }, [obstacleLeft, characterBottom, obstacleHeight, isGameOver]);

  useEffect(() => {
    const handleKeyUp = (e) => {
      if (e.code === "Space") jump();
      if (e.code === "Enter" && isGameOver) resetGame();
    };
    window.addEventListener("keyup", handleKeyUp);
    return () => window.removeEventListener("keyup", handleKeyUp);
  }, [isJumping, isGameOver]);

  return (
    <div className="w-screen h-[100vh] py-2">
      <div
        ref={gameRef}
        className={clsx(
          "relative w-[700px] h-[500px] overflow-hidden border-2 border-black mx-auto ",
          "bg-[#0180ff]"
        )}
      >
        <audio ref={jumpSound} src={jumpSoundFile} preload="auto" />
        <audio ref={gameOverSound} src={gameOverSoundFile} preload="auto" />
        <img
          src={character}
          alt="character"
          className="absolute left-[50px] w-[50px] h-[50px] shadow-white shadow-2xl rounded-sm"
          style={{ bottom: `${characterBottom}px` }}
        />

        <div
          className="absolute bottom-[0px] w-[20px]"
          style={{
            left: `${obstacleLeft}px`,
            height: `${obstacleHeight}px`,
            backgroundColor: obstacleColor,
          }}
        ></div>

        <div className="w-full py-2 flex justify-between items-center px-4">
          <img
            src={billionsLogo}
            alt=""
            className="w-50 bg-white p-2 rounded-sm"
          />
          <span className="text-2xl font-bold text-white">$ {score}</span>
        </div>
        <div className="h-full w-full flex justify-center items-center">
          <h1 className="text-5xl font-bold text-white opacity-90">
            The Human and AI Network
          </h1>
        </div>

        {isGameOver && (
          <div className="absolute top-[40%] w-full text-center text-3xl font-bold text-red-600">
            Game Over
            <br />
            <span className="text-lg">Press Enter to Retry</span>
            <br />
            <span className="text-lg">$ {score}</span>
          </div>
        )}
      </div>
    </div>
  );
}
