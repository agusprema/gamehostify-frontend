import React, { CSSProperties } from "react";
import { Game } from "./types";
import Image from "next/image";

interface Props {
  game: Game;
  onSelect: (game: Game) => void;
  style: CSSProperties;
  imageHeight: number;
  textHeight: number;
}

const GameCard: React.FC<Props> = ({ game, onSelect, style, imageHeight, textHeight }) => (
  <div style={style}>
    <button
      onClick={() => onSelect(game)}
      className="
        w-full flex flex-col rounded-2xl overflow-hidden
        bg-gray-100 dark:bg-gray-900/50
        backdrop-blur-xl
        border border-gray-300 dark:border-gray-700
        hover:border-primary-500/70 hover:shadow-lg hover:shadow-primary-500/20
        transition-all duration-300 cursor-pointer
      "
    >
      {/* Image */}
      <div style={{ height: imageHeight, overflow: "hidden" }}>
        <Image
          src={game.logo}
          alt={game.name}
          width={200}
          height={200}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>

      {/* Text */}
      <div
        className="p-3 text-center flex flex-col justify-center"
        style={{ height: textHeight }}
      >
        <h3
          className="
            text-gray-800 dark:text-white
            font-semibold text-sm leading-snug
            hover:text-primary-500 dark:hover:text-primary-400
            transition
          "
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {game.name}
        </h3>
        <span
          className="text-primary-600 dark:text-primary-400 text-xs uppercase block mt-1"
          style={{
            display: "block",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {game.category}
        </span>
      </div>
    </button>
  </div>
);

export default GameCard;
