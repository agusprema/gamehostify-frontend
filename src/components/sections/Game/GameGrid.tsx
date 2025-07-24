import React, { memo, CSSProperties } from "react";
import {
  FixedSizeGrid as Grid,
  GridChildComponentProps,
  GridOnScrollProps,
} from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import GameCard from "./GameCard";
import { Game } from "./types";

interface Props {
  games: Game[];
  height: number;
  onSelect: (game: Game) => void;
  fetchMore: () => void;
  hasMore: boolean;
  isHome: boolean;
  loadingMore: boolean;
  scrollTriggerRatio: number;
  gap?: number;
}

const GameGrid: React.FC<Props> = ({
  games,
  height,
  onSelect,
  fetchMore,
  hasMore,
  isHome,
  loadingMore,
  scrollTriggerRatio,
  gap = 16,
}) => {
  const IMAGE_HEIGHT = 140;
  const TEXT_HEIGHT = 90;
  const ROW_HEIGHT = IMAGE_HEIGHT + TEXT_HEIGHT + gap;

  /**
   * Custom InnerElement untuk padding bawah grid
   */
  const InnerElement = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    (props, ref) => (
      <div
        ref={ref}
        {...props}
        style={{ ...(props.style || {}), paddingBottom: gap }}
      />
    )
  );
  InnerElement.displayName = "GameGridInnerElement";

  /**
   * Renderer untuk setiap cell
   */
  const Cell = memo(function CellRenderer({
    columnIndex,
    rowIndex,
    style,
    data,
  }: GridChildComponentProps) {
    const { games, columnCount, onSelect } = data;
    const index = rowIndex * columnCount + columnIndex;
    if (index >= games.length) return null;

    const game = games[index];
    const cellStyle: CSSProperties = {
      ...style,
      left: (style.left as number) + gap,
      top: (style.top as number) + gap,
      width: (style.width as number) - gap,
      height: (style.height as number) - gap,
    };

    return (
      <GameCard
        game={game}
        onSelect={onSelect}
        style={cellStyle}
        imageHeight={IMAGE_HEIGHT}
        textHeight={TEXT_HEIGHT}
      />
    );
  });

  /**
   * Hitung jumlah kolom berdasarkan lebar container
   */
  const getColumnCount = (w: number) =>
    w < 640 ? 2 : w < 768 ? 3 : w < 1024 ? 4 : 6;

  return (
    <div style={{ height, overflow: "hidden" }}>
      <AutoSizer disableHeight>
        {({ width }) => {
          const colCount = getColumnCount(width);
          const totalGap = gap * (colCount + 1);
          const itemWidth = (width - totalGap) / colCount;
          const rowCount = Math.ceil(games.length / colCount);
          const totalContentHeight = rowCount * ROW_HEIGHT;

          /**
           * Infinite scroll trigger
           */
          const handleGridScroll = ({ scrollTop }: GridOnScrollProps) => {
            if (isHome || !hasMore || loadingMore) return;
            const maxScroll = totalContentHeight - height;
            if (maxScroll <= 0) return;

            const ratio = scrollTop / maxScroll;
            if (ratio >= scrollTriggerRatio) fetchMore();
          };

          return (
            <Grid
              columnCount={colCount}
              columnWidth={itemWidth + gap}
              height={height}
              rowCount={rowCount}
              rowHeight={ROW_HEIGHT}
              width={width}
              onScroll={handleGridScroll}
              innerElementType={InnerElement}
              itemData={{ games, columnCount: colCount, onSelect }}
            >
              {Cell}
            </Grid>
          );
        }}
      </AutoSizer>
    </div>
  );
};

export default GameGrid;
