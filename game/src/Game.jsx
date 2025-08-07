import React, { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import character from "./assets/character1.png";
import jumpSoundFile from "./assets/jump.mp3";
import gameOverSoundFile from "./assets/gameOver.mp3";
import billionsLogo from "./assets/BillionsLogo.png";
export default function JumpGame() {
  const [characterBottom, setCharacterBottom] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [obstacleLeft, setObstacleLeft] = useState(700);
  const [obstacleHeight, setObstacleHeight] = useState(40);
  const [obstacleColor, setObstacleColor] = useState("green");
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [obstacleSpeed, setObstacleSpeed] = useState(15);
  const [hasStarted, setHasStarted] = useState(false);
  const gravity = 0.7;
  const jumpVelocity = 15;
  const groundLevel = 0;

  const gameRef = useRef(null);
  const jumpSound = useRef(null);
  const gameOverSound = useRef(null);
  const getRandomHeight = () => Math.floor(Math.random() * 30) + 30; // Handle the random height ob obstacles
  const getRandomColor = () => {
    const colors = ["green", "gray", "purple", "orange", "black"]; // Colors of obstacles
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const resetGame = () => {
    // Handle the game restart
    setCharacterBottom(groundLevel);
    setObstacleLeft(700);
    setObstacleHeight(getRandomHeight());
    setObstacleColor(getRandomColor());
    setIsGameOver(false);
    setScore(0);
    setObstacleSpeed(15);
  };

  const jump = () => {
    // Handle character jump
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
    // Handle the obstacle logic
    if (!isGameOver && hasStarted) {
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
  }, [isGameOver, obstacleSpeed, hasStarted]);

  useEffect(() => {
    if (
      obstacleLeft < 80 &&
      obstacleLeft > 20 &&
      characterBottom < obstacleHeight + 50
    ) {
      if (!isGameOver && hasStarted) {
        gameOverSound.current?.play(); // Play sound when the player die
        setIsGameOver(true);
      }
    }
  }, [obstacleLeft, characterBottom, obstacleHeight, isGameOver, hasStarted]);

  useEffect(() => {
    // Handle keys
    const handleKeyUp = (e) => {
      if (e.code === "Enter" && !hasStarted) {
        setHasStarted(true);
        return;
      }
      if (e.code === "Space") jump();
      if (e.code === "Enter" && isGameOver) resetGame();
    };
    window.addEventListener("keyup", handleKeyUp);
    return () => window.removeEventListener("keyup", handleKeyUp);
  }, [isJumping, isGameOver, hasStarted]);

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <div className="">
        <div
          ref={gameRef}
          className={clsx(
            "relative w-[700px] h-[500px] overflow-hidden border-2 rounded-sm shadow-gray-500 shadow-2xl  mx-auto ",
            "bg-[#0180ff]"
          )}
        >
          <audio ref={jumpSound} src={jumpSoundFile} preload="auto" />{" "}
          {/* Play the jump sound when the isJumping is true */}
          <audio
            ref={gameOverSound}
            src={gameOverSoundFile}
            preload="auto"
          />{" "}
          {/* Play this sound when the gameOver is true */}
          {/* Character */}
          <img
            src={character}
            alt="character"
            className="absolute left-[50px] w-[50px] h-[50px]  rounded-sm"
            style={{ bottom: `${characterBottom}px` }}
          />
          {/* Obstacle */}
          <div
            className="absolute bottom-[0px] w-[20px]"
            style={{
              left: `${obstacleLeft}px`,
              height: `${obstacleHeight}px`,
              backgroundColor: obstacleColor,
            }}
          ></div>
          {/* Header */}
          <div className="w-full absolute top-0 py-2 flex justify-between items-center px-4">
            <img
              src={billionsLogo}
              alt=""
              className="w-50 bg-white p-2 rounded-sm"
            />
            <span className="text-2xl font-bold text-white">$ {score}</span>
          </div>
          <div className="h-full w-full flex justify-center items-center">
            <h1 className="text-5xl font-bold text-white opacity-80">
              The Human and AI Network
            </h1>
          </div>
          {/* Shows when gameOver is true */}
          {isGameOver && (
            <div className="absolute top-70 w-full text-center text-3xl font-bold text-red-600">
              Game Over
              <br />
              <span className="text-lg">Press Enter to Retry</span>
              <br />
              <span className="text-lg">$ {score}</span>
            </div>
          )}
          {/* Show when the game is not started yet */}
          {!hasStarted && (
            <div className="absolute top-20 left-0 w-full h-full    bg-opacity-60 flex flex-col justify-center items-center text-white z-10">
              <h1 className="text-3xl font-bold mb-4 blink">
                Billionaires Game
              </h1>
              <p className="text-xl blink">
                Press <strong>Enter</strong> to Start
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
