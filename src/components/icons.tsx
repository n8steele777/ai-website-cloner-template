import type { SVGProps } from "react";

export function OffMenuLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 124 48"
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        <clipPath id="offmenu-logo-clip">
          <path d="M101.58 20.5804L107.606 1.03205H124V46.9675H113.567V33.4837C113.567 24.9245 113.697 17.5267 113.956 11.2901C113.136 14.4299 112.099 17.9138 110.846 21.7417L102.876 46.9675H93.9337L85.9635 21.7417C85.0131 18.688 83.998 15.2256 82.918 11.3546C83.134 18.5804 83.242 25.9568 83.242 33.4837V46.9675H72.8095V1.03205H89.2034L95.2945 20.774C96.1152 23.5697 97.1736 27.3761 98.4695 32.1933C99.5063 28.1073 100.543 24.2363 101.58 20.5804Z" />
          <path d="M54.8291 46.9675H45.0835L61.5413 1.03205H71.2869L54.8291 46.9675Z" />
          <path d="M40.758 41.4194C36.3949 45.8065 30.6927 48 23.6513 48C16.6099 48 10.9077 45.8065 6.54461 41.4194C2.18154 36.9892 0 31.1828 0 24C0 16.8172 2.18154 11.0108 6.54461 6.58064C10.9077 2.19355 16.6099 0 23.6513 0C30.6927 0 36.3949 2.19355 40.758 6.58064C42.7928 8.64675 44.3532 11.0122 45.439 13.6771C46.3518 15.9171 46.9292 18.3688 47.1714 21.0319C47.2589 21.9937 47.3026 22.983 47.3026 24C47.3026 31.1828 45.1211 36.9892 40.758 41.4194ZM23.6513 38.5161C19.9362 38.5161 16.9771 37.2258 14.774 34.6452C12.5276 32.1075 11.4045 28.5591 11.4045 24C11.4045 19.4409 12.5276 15.8925 14.774 13.3548C16.9771 10.7742 19.9362 9.48387 23.6513 9.48387C27.3232 9.48387 30.3039 10.7742 32.5934 13.3548C34.8398 15.8925 35.9629 19.4409 35.9629 24C35.9629 28.5591 34.8398 32.1075 32.5934 34.6452C30.3039 37.2258 27.3232 38.5161 23.6513 38.5161Z" />
        </clipPath>
      </defs>
      <rect width="124" height="48" fill="currentColor" clipPath="url(#offmenu-logo-clip)" />
    </svg>
  );
}

export function ThemeToggleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <defs>
        <mask id="offmenu-moon-mask">
          <rect width="20" height="20" fill="white" />
          <circle cx="28" cy="-4" r="7" fill="black" />
        </mask>
      </defs>
      <circle cx="10" cy="10" r="7" fill="currentColor" mask="url(#offmenu-moon-mask)" />
    </svg>
  );
}

export function MenuGridIcon(props: SVGProps<SVGSVGElement>) {
  const dots = [4, 12, 20];
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      {dots.flatMap((x) =>
        dots.map((y) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="2" fill="currentColor" />
        )),
      )}
    </svg>
  );
}

export function ArrowLeftIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 256 256" fill="none" aria-hidden="true" {...props}>
      <path
        d="M224 128a8 8 0 0 1-8 8H59.31l58.35 58.34a8 8 0 0 1-11.32 11.32l-72-72a8 8 0 0 1 0-11.32l72-72a8 8 0 0 1 11.32 11.32L59.31 120H216a8 8 0 0 1 8 8Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function ArrowRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 256 256" fill="none" aria-hidden="true" {...props}>
      <path
        d="m221.66 133.66-72 72a8 8 0 0 1-11.32-11.32L196.69 136H40a8 8 0 0 1 0-16h156.69l-58.35-58.34a8 8 0 0 1 11.32-11.32l72 72a8 8 0 0 1 0 11.32Z"
        fill="currentColor"
      />
    </svg>
  );
}
