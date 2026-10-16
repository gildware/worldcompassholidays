import type { ReactNode } from "react";

function star(cx: number, cy: number, radius: number) {
  const points: string[] = [];
  for (let i = 0; i < 5; i += 1) {
    const outer = ((-90 + i * 72) * Math.PI) / 180;
    const inner = ((-54 + i * 72) * Math.PI) / 180;
    points.push(`${(cx + radius * Math.cos(outer)).toFixed(2)},${(cy + radius * Math.sin(outer)).toFixed(2)}`);
    points.push(
      `${(cx + radius * 0.4 * Math.cos(inner)).toFixed(2)},${(cy + radius * 0.4 * Math.sin(inner)).toFixed(2)}`,
    );
  }
  return points.join(" ");
}

function FlagSvg({ label, children }: { label: string; children: ReactNode }) {
  return (
    <svg className="visa-flag" viewBox="0 0 60 40" role="img" aria-label={label}>
      {children}
    </svg>
  );
}

export function flagEmoji(code: string) {
  const iso = code.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(iso)) return "";
  return String.fromCodePoint(...iso.split("").map((char) => 127397 + char.charCodeAt(0)));
}

export function CountryMark({ code }: { code: string }) {
  return (
    <span className="visa-mark" aria-hidden="true">
      {flagEmoji(code)}
    </span>
  );
}

export function CountryFlag({ code }: { code: string }) {
  if (code === "in") {
    const spokes = Array.from({ length: 24 }, (_, index) => {
      const angle = (index * Math.PI) / 12;
      return (
        <line
          key={index}
          x1="30"
          y1="20"
          x2={(30 + Math.cos(angle) * 4).toFixed(2)}
          y2={(20 + Math.sin(angle) * 4).toFixed(2)}
          stroke="#000080"
          strokeWidth="0.35"
        />
      );
    });
    return (
      <FlagSvg label="India flag">
        <rect width="60" height="13.34" fill="#FF9933" />
        <rect y="13.33" width="60" height="13.34" fill="#FFFFFF" />
        <rect y="26.66" width="60" height="13.34" fill="#138808" />
        {spokes}
        <circle cx="30" cy="20" r="4.15" fill="none" stroke="#000080" strokeWidth="0.55" />
        <circle cx="30" cy="20" r="0.7" fill="#000080" />
      </FlagSvg>
    );
  }
  if (code === "th") {
    return (
      <FlagSvg label="Thailand flag">
        <rect width="60" height="40" fill="#A51931" />
        <rect y="6.67" width="60" height="26.66" fill="#F4F5F8" />
        <rect y="13.33" width="60" height="13.34" fill="#2D2A4A" />
      </FlagSvg>
    );
  }
  if (code === "vn") {
    return (
      <FlagSvg label="Vietnam flag">
        <rect width="60" height="40" fill="#DA251D" />
        <polygon fill="#FFCD00" points={star(30, 20, 10)} />
      </FlagSvg>
    );
  }
  if (code === "sg") {
    return (
      <FlagSvg label="Singapore flag">
        <rect width="60" height="40" fill="#fff" />
        <rect width="60" height="20" fill="#EF3340" />
        <circle cx="13" cy="10" r="6" fill="#fff" />
        <circle cx="15.4" cy="10" r="5" fill="#EF3340" />
        <g fill="#fff">
          <polygon points={star(22, 6.5, 1.5)} />
          <polygon points={star(25.5, 8.5, 1.5)} />
          <polygon points={star(24.5, 12.2, 1.5)} />
          <polygon points={star(20.5, 12.2, 1.5)} />
          <polygon points={star(19.2, 8.5, 1.5)} />
        </g>
      </FlagSvg>
    );
  }
  if (code === "my") {
    return (
      <FlagSvg label="Malaysia flag">
        {Array.from({ length: 14 }, (_, index) => (
          <rect
            key={index}
            y={(40 / 14) * index}
            width="60"
            height={40 / 14 + 0.15}
            fill={index % 2 === 0 ? "#CC0001" : "#fff"}
          />
        ))}
        <rect width="32" height="20" fill="#010066" />
        <circle cx="13" cy="10" r="6" fill="#FC0" />
        <circle cx="15.3" cy="9" r="5" fill="#010066" />
        <polygon fill="#FC0" points={star(23, 10, 4.2)} />
      </FlagSvg>
    );
  }
  if (code === "id") {
    return (
      <FlagSvg label="Indonesia flag">
        <rect width="60" height="40" fill="#fff" />
        <rect width="60" height="20" fill="#CE1126" />
      </FlagSvg>
    );
  }
  if (code === "ae") {
    return (
      <FlagSvg label="United Arab Emirates flag">
        <rect width="60" height="13.34" fill="#00732F" />
        <rect y="13.33" width="60" height="13.34" fill="#fff" />
        <rect y="26.66" width="60" height="13.34" fill="#000" />
        <rect width="16" height="40" fill="#FF0000" />
      </FlagSvg>
    );
  }
  if (code === "mv") {
    return (
      <FlagSvg label="Maldives flag">
        <rect width="60" height="40" fill="#D21034" />
        <rect x="12" y="8" width="36" height="24" fill="#007E3A" />
        <circle cx="27" cy="20" r="7" fill="#fff" />
        <circle cx="30" cy="20" r="6" fill="#007E3A" />
      </FlagSvg>
    );
  }
  if (code === "lk") {
    return (
      <FlagSvg label="Sri Lanka flag">
        <rect width="60" height="40" fill="#8D1538" />
        <rect width="7" height="40" fill="#00534E" />
        <rect x="7" width="7" height="40" fill="#EB7400" />
        <rect x="16" y="3" width="41" height="34" fill="none" stroke="#FFBE29" strokeWidth="3" />
      </FlagSvg>
    );
  }
  if (code === "np") {
    return (
      <FlagSvg label="Nepal flag">
        <path
          d="M15 3.5 L40 16.5 L22 16.5 L44 36.5 L15 36.5 Z"
          fill="#DC143C"
          stroke="#003893"
          strokeWidth="2.4"
          strokeLinejoin="miter"
        />
        <circle cx="24" cy="12" r="2.3" fill="#fff" />
        <circle cx="25.1" cy="11.6" r="1.8" fill="#DC143C" />
        <polygon fill="#fff" points={star(27, 27, 3)} />
      </FlagSvg>
    );
  }
  if (code === "gb" || code === "au") {
    const jack = (
      <g>
        <rect width="60" height="40" fill="#012169" />
        <path d="M0 0 L60 40 M60 0 L0 40" stroke="#fff" strokeWidth="8" />
        <path d="M0 0 L60 40 M60 0 L0 40" stroke="#C8102E" strokeWidth="4" />
        <path d="M30 0 V40 M0 20 H60" stroke="#fff" strokeWidth="13" />
        <path d="M30 0 V40 M0 20 H60" stroke="#C8102E" strokeWidth="8" />
      </g>
    );
    if (code === "gb") return <FlagSvg label="United Kingdom flag">{jack}</FlagSvg>;
    return (
      <FlagSvg label="Australia flag">
        <rect width="60" height="40" fill="#012169" />
        <g transform="scale(0.5)">{jack}</g>
        <polygon fill="#fff" points={star(16, 30, 3.4)} />
        <polygon fill="#fff" points={star(40, 9, 2.2)} />
        <polygon fill="#fff" points={star(48, 16, 2.2)} />
        <polygon fill="#fff" points={star(46, 26, 2.4)} />
        <polygon fill="#fff" points={star(54, 24, 1.6)} />
        <polygon fill="#fff" points={star(42, 33, 2)} />
      </FlagSvg>
    );
  }
  if (code === "eu") {
    const stars = Array.from({ length: 12 }, (_, index) => {
      const angle = ((-90 + index * 30) * Math.PI) / 180;
      return { x: 30 + Math.cos(angle) * 11, y: 20 + Math.sin(angle) * 11 };
    });
    return (
      <FlagSvg label="European Union flag">
        <rect width="60" height="40" fill="#003399" />
        <g fill="#FC0">
          {stars.map((point) => (
            <polygon key={`${point.x}-${point.y}`} points={star(point.x, point.y, 1.7)} />
          ))}
        </g>
      </FlagSvg>
    );
  }
  if (code === "tr") {
    return (
      <FlagSvg label="Turkey flag">
        <rect width="60" height="40" fill="#E30A17" />
        <circle cx="24" cy="20" r="9" fill="#fff" />
        <circle cx="27" cy="20" r="7.2" fill="#E30A17" />
        <polygon fill="#fff" points={star(36, 20, 5)} />
      </FlagSvg>
    );
  }
  if (code === "jp") {
    return (
      <FlagSvg label="Japan flag">
        <rect width="60" height="40" fill="#fff" />
        <circle cx="30" cy="20" r="9" fill="#BC002D" />
      </FlagSvg>
    );
  }
  return (
    <FlagSvg label="World">
      <rect width="60" height="40" fill="#E5F0FD" />
      <circle cx="30" cy="20" r="10" fill="none" stroke="#3554D1" strokeWidth="1.6" />
      <ellipse cx="30" cy="20" rx="5" ry="10" fill="none" stroke="#3554D1" strokeWidth="1.4" />
      <path d="M20 20 H40 M22 15 H38 M22 25 H38" stroke="#3554D1" strokeWidth="1.2" />
    </FlagSvg>
  );
}
