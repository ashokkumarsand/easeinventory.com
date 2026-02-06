'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ABCXYZMatrixProps {
  matrix: Record<string, number>;
  onCellClick?: (abc: string, xyz: string) => void;
}

const CELL_COLORS: Record<string, string> = {
  AX: 'bg-green-500/20 text-green-700 dark:text-green-400 hover:bg-green-500/30',
  AY: 'bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20',
  AZ: 'bg-amber-500/20 text-amber-700 dark:text-amber-400 hover:bg-amber-500/30',
  BX: 'bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20',
  BY: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20',
  BZ: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20',
  CX: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20',
  CY: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20',
  CZ: 'bg-red-500/15 text-red-700 dark:text-red-400 hover:bg-red-500/25',
};

export function ABCXYZMatrix({ matrix, onCellClick }: ABCXYZMatrixProps) {
  const total = Object.values(matrix).reduce((s, v) => s + v, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">ABC/XYZ Classification Matrix</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-2">
          {/* Header row */}
          <div className="text-xs font-bold text-muted-foreground text-center py-2" />
          {['X', 'Y', 'Z'].map(xyz => (
            <div key={xyz} className="text-xs font-bold text-center py-2">
              <span className="text-muted-foreground">{xyz}</span>
              <span className="block text-[10px] text-muted-foreground/60">
                {xyz === 'X' ? 'Stable' : xyz === 'Y' ? 'Variable' : 'Erratic'}
              </span>
            </div>
          ))}

          {/* Matrix rows */}
          {['A', 'B', 'C'].map(abc => (
            <React.Fragment key={abc}>
              <div className="text-xs font-bold text-center py-2 flex flex-col justify-center">
                <span>{abc}</span>
                <span className="text-[10px] text-muted-foreground/60">
                  {abc === 'A' ? 'High Value' : abc === 'B' ? 'Medium' : 'Low Value'}
                </span>
              </div>
              {['X', 'Y', 'Z'].map(xyz => {
                const key = `${abc}${xyz}`;
                const count = matrix[key] || 0;
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <button
                    key={key}
                    onClick={() => onCellClick?.(abc, xyz)}
                    className={`rounded-xl p-3 text-center transition-colors cursor-pointer ${CELL_COLORS[key] || 'bg-muted'}`}
                  >
                    <p className="text-2xl font-black">{count}</p>
                    <p className="text-[10px] font-semibold opacity-70">{pct}%</p>
                  </button>
                );
              })}
            </React.Fragment>
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-center mt-3">
          Total: {total} products classified
        </p>
      </CardContent>
    </Card>
  );
}
