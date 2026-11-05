import React, { useEffect, useState } from 'react';
import { BatteryCharging, Maximize2, Minimize2, AlarmClock, Clock } from 'lucide-react';
import { ClockTheme } from '../types/focusrise';

interface DigitalClockViewProps {
  nextAlarmText: string;
  nextAlarmCountdown: string;
}

export const DigitalClockView: React.FC<DigitalClockViewProps> = ({
  nextAlarmText,
  nextAlarmCountdown,
}) => {
  const [now, setNow] = useState(new Date());
  const [use24Hour, setUse24Hour] = useState(false);
  const [theme, setTheme] = useState<ClockTheme>('ORANGE_DIGITAL');
  const [isFullscreenBedside, setIsFullscreenBedside] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState<number>(92);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const nav = navigator as Navigator & {
      getBattery?: () => Promise<{ level: number; addEventListener: (type: string, cb: () => void) => void }>;
    };
    if (typeof nav.getBattery === 'function') {
      nav
        .getBattery()
        .then((bat) => {
          setBatteryLevel(Math.round(bat.level * 100));
        })
        .catch(() => {
          // Keep default 92%
        });
    }
  }, []);

  const rawHours = now.getHours();
  const displayHours = use24Hour ? rawHours : rawHours % 12 || 12;
  const hoursStr = String(displayHours).padStart(2, '0');
  const minutesStr = String(now.getMinutes()).padStart(2, '0');
  const secondsStr = String(now.getSeconds()).padStart(2, '0');
  const ampm = rawHours >= 12 ? 'PM' : 'AM';

  const weekday = now.toLocaleDateString('en-US', { weekday: 'long' });
  const dateFormatted = now.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const containerClasses = isFullscreenBedside
    ? 'fixed inset-0 z-50 flex flex-col justify-between p-8 bg-[#000000] text-white'
    : 'rounded-2xl p-6 border transition-all duration-200 ' +
      (theme === 'AMOLED_MINIMAL'
        ? 'bg-[#000000] border-[#262626] text-white'
        : theme === 'ORANGE_DIGITAL'
        ? 'bg-[#111111] border-[#FF8A00] text-white shadow-[0_0_30px_rgba(255,138,0,0.08)]'
        : theme === 'FLIP_CLOCK'
        ? 'bg-[#141414] border-[#333333] text-white'
        : 'bg-[#080808] border-[#FF6D00] text-white');

  return (
    <div className={containerClasses}>
      {/* Top Bar Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-[#888888]">
          <Clock className="w-4 h-4 text-[#FF8A00]" />
          <span>{weekday}</span>
          <span aria-hidden="true">·</span>
          <span>{dateFormatted}</span>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1 text-[#16C784] tabular-nums">
            <BatteryCharging className="w-3.5 h-3.5" />
            {batteryLevel}%
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* 12H / 24H Switch */}
          <div className="flex items-center p-0.5 rounded-lg bg-[#191919] border border-[#2A2A2A]">
            <button
              type="button"
              onClick={() => setUse24Hour(false)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                !use24Hour ? 'bg-[#FF8A00] text-black font-semibold' : 'text-[#888888] hover:text-white'
              }`}
            >
              12H
            </button>
            <button
              type="button"
              onClick={() => setUse24Hour(true)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                use24Hour ? 'bg-[#FF8A00] text-black font-semibold' : 'text-[#888888] hover:text-white'
              }`}
            >
              24H
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsFullscreenBedside(!isFullscreenBedside)}
            className="min-h-[38px] px-3 py-1.5 rounded-lg bg-[#191919] hover:bg-[#252525] border border-[#2E2E2E] text-xs font-medium text-white flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
          >
            {isFullscreenBedside ? (
              <>
                <Minimize2 className="w-3.5 h-3.5 text-[#FF8A00]" />
                Exit Bedside
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-[#FF8A00]" />
                Bedside Mode
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Digital Display */}
      <div className="my-8 flex flex-col items-center justify-center select-none">
        {theme === 'FLIP_CLOCK' ? (
          <div className="flex items-center gap-3 sm:gap-5">
            <div className="bg-[#1E1E1E] border border-[#333333] rounded-2xl px-5 py-4 sm:px-8 sm:py-6 shadow-inner">
              <span className="font-mono tabular-nums text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight text-white">
                {hoursStr}
              </span>
            </div>
            <span className="font-mono text-4xl sm:text-6xl text-[#FF8A00] font-bold">:</span>
            <div className="bg-[#1E1E1E] border border-[#333333] rounded-2xl px-5 py-4 sm:px-8 sm:py-6 shadow-inner">
              <span className="font-mono tabular-nums text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight text-[#FF8A00]">
                {minutesStr}
              </span>
            </div>
            <div className="flex flex-col items-start gap-1">
              <span className="font-mono tabular-nums text-xl sm:text-3xl font-bold text-[#FFA726]">
                {secondsStr}
              </span>
              {!use24Hour && (
                <span className="text-xs sm:text-sm font-semibold tracking-wider text-[#888888]">
                  {ampm}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-baseline gap-2 sm:gap-4">
            <span
              className={`font-mono tabular-nums font-bold tracking-tight ${
                isFullscreenBedside ? 'text-7xl sm:text-9xl' : 'text-5xl sm:text-7xl md:text-8xl'
              } ${
                theme === 'ORANGE_DIGITAL'
                  ? 'text-[#FF8A00]'
                  : theme === 'AMOLED_MINIMAL'
                  ? 'text-white'
                  : 'text-[#FFA726]'
              }`}
            >
              {hoursStr}:{minutesStr}
            </span>
            <div className="flex flex-col items-start">
              <span className="font-mono tabular-nums text-2xl sm:text-4xl font-semibold text-[#FF6D00] transition-transform duration-150">
                :{secondsStr}
              </span>
              {!use24Hour && (
                <span className="text-xs sm:text-sm font-bold text-[#888888] mt-0.5">{ampm}</span>
              )}
            </div>
          </div>
        )}

        {/* Seconds smooth bar */}
        <div className="w-full max-w-md h-1 bg-[#1F1F1F] rounded-full overflow-hidden mt-6">
          <div
            className="h-full bg-gradient-to-r from-[#FF6D00] to-[#FFA726] transition-all duration-300"
            style={{ width: `${(now.getSeconds() / 59) * 100}%` }}
          />
        </div>
      </div>

      {/* Bottom Bar: Theme Selector + Next Alarm Countdown */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#222222]">
        <div className="flex items-center gap-2 text-xs text-[#888888]">
          <AlarmClock className="w-4 h-4 text-[#FF8A00]" />
          <span>Next Alarm: <strong className="text-white">{nextAlarmText}</strong></span>
          <span aria-hidden="true">·</span>
          <span className="text-[#FFA726] tabular-nums">{nextAlarmCountdown}</span>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#191919] border border-[#2A2A2A]">
          {(
            [
              { id: 'ORANGE_DIGITAL', label: 'Orange Digital' },
              { id: 'AMOLED_MINIMAL', label: 'AMOLED' },
              { id: 'FLIP_CLOCK', label: 'Flip Clock' },
              { id: 'NEON_CYBER', label: 'Neon' },
            ] as { id: ClockTheme; label: string }[]
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTheme(item.id)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                theme === item.id
                  ? 'bg-[#FF8A00] text-black font-semibold'
                  : 'text-[#888888] hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
