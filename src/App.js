import React, { useState, useEffect, useCallback, useRef } from 'react';

const PADDLE_HEIGHT = 100;
const PADDLE_WIDTH = 20;
const BALL_SIZE = 20;
const GAME_WIDTH = 600;
const GAME_HEIGHT = 400;
const PADDLE_SPEED = 8;
const INITIAL_BALL_SPEED = 3;

export default function Pong() {
  const [ballPos, setBallPos] = useState({ x: GAME_WIDTH / 2 - BALL_SIZE / 2, y: GAME_HEIGHT / 2 - BALL_SIZE / 2 });
  const [ballVelocity, setBallVelocity] = useState({ x: INITIAL_BALL_SPEED, y: INITIAL_BALL_SPEED });
  const [paddle1Pos, setPaddle1Pos] = useState({ x: 0, y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2 });
  const [paddle2Pos, setPaddle2Pos] = useState({ x: GAME_WIDTH - PADDLE_WIDTH, y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2 });
  const [score, setScore] = useState({ player1: 0, player2: 0 });
  const [gameStarted, setGameStarted] = useState(false);

  const keysPressed = useRef({});
  const gameLoopRef = useRef(null);

  const resetBall = useCallback(() => {
    setBallPos({ x: GAME_WIDTH / 2 - BALL_SIZE / 2, y: GAME_HEIGHT / 2 - BALL_SIZE / 2 });
    const direction = Math.random() > 0.5 ? 1 : -1;
    setBallVelocity({ x: INITIAL_BALL_SPEED * direction, y: INITIAL_BALL_SPEED * (Math.random() > 0.5 ? 1 : -1) });
  }, []);

  const handleKeyDown = useCallback((e) => {
    keysPressed.current[e.key] = true;
  }, []);

  const handleKeyUp = useCallback((e) => {
    keysPressed.current[e.key] = false;
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const updateGameState = useCallback(() => {
    setPaddle1Pos(prev => ({
      ...prev,
      y: Math.max(0, Math.min(GAME_HEIGHT - PADDLE_HEIGHT, 
        prev.y + (keysPressed.current['w'] ? -PADDLE_SPEED : 0) + (keysPressed.current['s'] ? PADDLE_SPEED : 0)))
    }));
    setPaddle2Pos(prev => ({
      ...prev,
      y: Math.max(0, Math.min(GAME_HEIGHT - PADDLE_HEIGHT, 
        prev.y + (keysPressed.current['ArrowUp'] ? -PADDLE_SPEED : 0) + (keysPressed.current['ArrowDown'] ? PADDLE_SPEED : 0)))
    }));

    setBallPos(prev => {
      let newX = prev.x + ballVelocity.x;
      let newY = prev.y + ballVelocity.y;

      // Ball collision with top and bottom
      if (newY <= 0 || newY >= GAME_HEIGHT - BALL_SIZE) {
        setBallVelocity(prevVel => ({ ...prevVel, y: -prevVel.y }));
        newY = newY <= 0 ? 0 : GAME_HEIGHT - BALL_SIZE;
      }

      // Ball collision with paddles
      if (
        (newX <= PADDLE_WIDTH && newY + BALL_SIZE >= paddle1Pos.y && newY <= paddle1Pos.y + PADDLE_HEIGHT) ||
        (newX + BALL_SIZE >= GAME_WIDTH - PADDLE_WIDTH && newY + BALL_SIZE >= paddle2Pos.y && newY <= paddle2Pos.y + PADDLE_HEIGHT)
      ) {
        setBallVelocity(prevVel => ({ 
          x: -prevVel.x * 1.1,
          y: prevVel.y + (Math.random() - 0.5) * 2
        }));
        newX = newX <= PADDLE_WIDTH ? PADDLE_WIDTH : GAME_WIDTH - PADDLE_WIDTH - BALL_SIZE;
      }

      // Score
      if (newX <= 0) {
        setScore(prev => ({ ...prev, player2: prev.player2 + 1 }));
        resetBall();
        return { x: GAME_WIDTH / 2 - BALL_SIZE / 2, y: GAME_HEIGHT / 2 - BALL_SIZE / 2 };
      } else if (newX >= GAME_WIDTH - BALL_SIZE) {
        setScore(prev => ({ ...prev, player1: prev.player1 + 1 }));
        resetBall();
        return { x: GAME_WIDTH / 2 - BALL_SIZE / 2, y: GAME_HEIGHT / 2 - BALL_SIZE / 2 };
      }

      return { x: newX, y: newY };
    });
  }, [ballVelocity, paddle1Pos.y, paddle2Pos.y, resetBall]);

  useEffect(() => {
    if (gameStarted) {
      gameLoopRef.current = setInterval(updateGameState, 1000 / 60);
    } else if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameStarted, updateGameState]);

  const startGame = () => {
    setGameStarted(true);
    resetBall();
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-800">
      <div className="text-white mb-4 text-2xl font-bold">
        Player 1: {score.player1} | Player 2: {score.player2}
      </div>
      <div className="relative bg-black border-4 border-white" style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}>
        <div className="absolute bg-blue-500" style={{ left: paddle1Pos.x, top: paddle1Pos.y, width: PADDLE_WIDTH, height: PADDLE_HEIGHT }}></div>
        <div className="absolute bg-red-500" style={{ left: paddle2Pos.x, top: paddle2Pos.y, width: PADDLE_WIDTH, height: PADDLE_HEIGHT }}></div>
        <div className="absolute bg-white rounded-full" style={{ left: ballPos.x, top: ballPos.y, width: BALL_SIZE, height: BALL_SIZE }}></div>
        {!gameStarted && (
          <button
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-500 text-white px-4 py-2 rounded text-xl font-bold"
            onClick={startGame}
          >
            Start Game
          </button>
        )}
      </div>
      <div className="text-white mt-4 text-lg">
        Controls: Player 1 (W/S) | Player 2 (↑/↓)
      </div>
    </div>
  );
}
