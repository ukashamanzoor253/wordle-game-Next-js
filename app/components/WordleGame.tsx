"use client";
import { useState, useEffect, useCallback } from "react";

type LetterState = "correct" | "present" | "absent" | "empty";

interface Tile {
  letter: string;
  state: LetterState;
}

const WORD_LENGTH = 5;
const MAX_ATTEMPTS = 6;

export default function WordleGame() {
  const [targetWord, setTargetWord] = useState<string>("");
  const [currentGuess, setCurrentGuess] = useState<string>("");
  const [Error, setError] = useState<boolean>(false);
  const [guesses, setGuesses] = useState<Tile[][]>([]);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [gameWon, setGameWon] = useState<boolean>(false);

  useEffect(() => {
    const words = ["REACT", "APPLE", "GRAPE", "STONE", "BRUSH"];
    const randomWord = words[Math.floor(Math.random() * words.length)];
    setTargetWord(randomWord);

    setGuesses(
      Array(MAX_ATTEMPTS)
        .fill(null)
        .map(() => Array(WORD_LENGTH).fill({ letter: "", state: "empty" }))
    );
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (gameOver) return;

      const key = e.key.toUpperCase();

      if (/^[A-Z]$/.test(key) && currentGuess.length < WORD_LENGTH) {
        setCurrentGuess((prev) => prev + key);
        setError(false)
      }
      if (/^[0-9]$/.test(key) && currentGuess.length < WORD_LENGTH) {
        setError(true);
        return;
      } else if (key === "BACKSPACE") {
        setCurrentGuess((prev) => prev.slice(0, -1));
      } else if (key === "ENTER" && currentGuess.length === WORD_LENGTH) {
        submitGuess();
      }
    },
    [currentGuess, gameOver]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const evaluateGuess = (guess: string): Tile[] => {
    const result: Tile[] = [];
    const targetLetters = targetWord.split("");
    const remainingLetters = [...targetLetters];

    for (let i = 0; i < WORD_LENGTH; i++) {
      if (guess[i] === targetWord[i]) {
        result.push({ letter: guess[i], state: "correct" });
        remainingLetters[i] = null;
      } else {
        result.push({ letter: guess[i], state: "absent" });
      }
    }

    for (let i = 0; i < WORD_LENGTH; i++) {
      if (result[i].state === "correct") continue;

      const foundIndex = remainingLetters.indexOf(guess[i]);
      if (foundIndex > -1) {
        result[i].state = "present";
        remainingLetters[foundIndex] = null;
      }
    }

    return result;
  };

  const submitGuess = () => {
    const currentAttempt = guesses.findIndex((row) => row[0].letter === "");
    if (currentAttempt === -1) return;

    const evaluatedGuess = evaluateGuess(currentGuess);
    const newGuesses = [...guesses];
    newGuesses[currentAttempt] = evaluatedGuess;
    setGuesses(newGuesses);

    if (currentGuess === targetWord) {
      setGameWon(true);    
      setGameOver(true);
    } else if (currentAttempt === MAX_ATTEMPTS - 1) {
      setGameOver(true);
    }

    setCurrentGuess("");
  };

  const getBackgroundColor = (state: LetterState) => {
    switch (state) {
      case "correct":
        return "#22c55e";
      case "present":
        return "#eab308";
      case "absent":
        return "#6b7280";
      default:
        return "#ffffff";
    }
  };

  const getTextColor = (state: LetterState) => {
    return state === "empty" ? "#000000" : "#ffffff";
  };

  const getBorderColor = (state: LetterState) => {
    return state === "empty" ? "#d1d5db" : "transparent";
  };

  const renderTile = (tile: Tile, rowIndex: number, colIndex: number) => {
    const isCurrentRow =
      rowIndex === guesses.findIndex((row) => row[0].letter === "");
    const isTypingCell = isCurrentRow && colIndex < currentGuess.length;

    const letter = isTypingCell ? currentGuess[colIndex] : tile.letter;
    const state = isTypingCell ? "empty" : tile.state;

    const tileStyle = {
      width: "45px",
      height: "45px",
      background: getBackgroundColor(state),
      color: getTextColor(state),
      fontWeight: "700",
      fontSize: "41px",
      borderColor: getBorderColor(state),
      borderWidth: "2px",
      borderRadius: "0.25rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    };

    return (
      <>
        <div key={`${rowIndex}-${colIndex}`} style={tileStyle}>
          {letter}
        </div>
      </>
    );
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#f3f4f6",
        padding: "1rem",
      }}
    >
      <h1
        style={{
          fontSize: "1.875rem",
          fontWeight: "700",
          marginBottom: "2rem",
        }}
      >
        Wordle Clone
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateRows: `repeat(${MAX_ATTEMPTS}, minmax(0, 1fr))`,
          gap: "0.5rem",
          marginBottom: "2rem",
        }}
      >
        {guesses.map((row, rowIndex) => (
          <div
            key={rowIndex}
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${WORD_LENGTH}, minmax(0, 1fr))`,
              gap: "0.5rem",
            }}
          >
            {row.map((tile, colIndex) => renderTile(tile, rowIndex, colIndex))}
          </div>
        ))}
      </div>

      {gameOver && (
        <div
          style={{
            fontSize: "1.25rem",
            fontWeight: "700",
            marginBottom: "1rem",
          }}
        >
          {gameWon
            ? "🎉 Congratulations! You won!"
            : `Game over! The word was ${targetWord}`}
        </div>
      )}

      <div
        style={{
          color: "#6b7280",
        }}
      >
        Type letters to fill, Backspace to delete, Enter to submit
      </div>
    </div>
  );
}
