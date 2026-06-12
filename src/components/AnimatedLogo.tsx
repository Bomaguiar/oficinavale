import { useId } from "react";

type Props = {
  className?: string;
  /** Base font size in px, scales everything */
  size?: number;
};

/**
 * Animated Oficina Vale wordmark.
 * "ofic[wrench]na" with diagonal stripes and skewed VALE badge.
 */
export function AnimatedLogo({ className = "", size = 28 }: Props) {
  const uid = useId().replace(/:/g, "");

  return (
    <div
      className={className}
      style={
        {
          // expose size via CSS var so keyframes can use em units
          fontSize: `${size}px`,
          ["--ov-red" as never]: "#e02020",
          ["--ov-red-dark" as never]: "#a31515",
        } as React.CSSProperties
      }
    >
      <style>{`
        .ov-${uid}{display:inline-flex;flex-direction:column;align-items:flex-end;font-family:'Arial Black',Arial,sans-serif;line-height:1;}
        .ov-${uid} .wm{display:flex;align-items:baseline;transform:skewX(-8deg);}
        .ov-${uid} .lt{color:#fff;font-weight:900;font-style:italic;font-size:1em;letter-spacing:-0.04em;display:inline-block;opacity:0;transform:translateY(0.5em) scale(.92);animation:ov${uid}In .55s cubic-bezier(.2,.9,.25,1.2) forwards;}
        .ov-${uid} .lt:nth-child(1){animation-delay:.15s}
        .ov-${uid} .lt:nth-child(2){animation-delay:.25s}
        .ov-${uid} .lt:nth-child(3){animation-delay:.35s}
        .ov-${uid} .lt:nth-child(4){animation-delay:.45s}
        .ov-${uid} .lt:nth-child(6){animation-delay:.75s}
        .ov-${uid} .lt:nth-child(7){animation-delay:.85s}
        @keyframes ov${uid}In{to{opacity:1;transform:translateY(0) scale(1);}}

        .ov-${uid} .ws{position:relative;width:.42em;height:1em;display:inline-block;}
        .ov-${uid} .wr{position:absolute;left:50%;bottom:0;width:.46em;height:1.15em;transform-origin:50% 18%;transform:translateX(-50%) translateY(-160%) rotate(-120deg);opacity:0;animation:ov${uid}Drop .7s cubic-bezier(.3,.7,.3,1.05) 1.05s forwards, ov${uid}Tight .9s ease-in-out 1.75s forwards;filter:drop-shadow(0 2px 4px rgba(224,32,32,.4));}
        @keyframes ov${uid}Drop{0%{opacity:0;transform:translateX(-50%) translateY(-160%) rotate(-120deg);}60%{opacity:1;}100%{opacity:1;transform:translateX(-50%) translateY(0) rotate(0);}}
        @keyframes ov${uid}Tight{0%{transform:translateX(-50%) rotate(0);}25%{transform:translateX(-50%) rotate(-14deg);}55%{transform:translateX(-50%) rotate(9deg);}80%{transform:translateX(-50%) rotate(-4deg);}100%{transform:translateX(-50%) rotate(0);}}

        .ov-${uid} .strow{margin-top:.18em;display:flex;align-items:center;gap:.28em;}
        .ov-${uid} .stripes{display:flex;gap:.07em;height:.28em;width:2.2em;transform:skewX(-30deg);}
        .ov-${uid} .st{flex:1;border-radius:1px;opacity:0;transform:translateX(-1em);animation:ov${uid}Stripe .45s cubic-bezier(.2,.8,.3,1) forwards;}
        .ov-${uid} .st:nth-child(1){background:#3a3a3e;animation-delay:.02s}
        .ov-${uid} .st:nth-child(2){background:#4a4a4f;animation-delay:.08s}
        .ov-${uid} .st:nth-child(3){background:#6b6b71;animation-delay:.14s}
        .ov-${uid} .st:nth-child(4){background:#8f1d1d;animation-delay:.2s}
        .ov-${uid} .st:nth-child(5){background:#b51c1c;animation-delay:.26s}
        .ov-${uid} .st:nth-child(6){background:var(--ov-red);animation-delay:.32s}
        @keyframes ov${uid}Stripe{to{opacity:1;transform:translateX(0);}}

        .ov-${uid} .vale{background:linear-gradient(180deg,#ef3030 0%,var(--ov-red) 55%,var(--ov-red-dark) 100%);color:#fff;font-style:italic;font-weight:900;font-size:.42em;letter-spacing:.14em;padding:.18em .7em;transform:skewX(-30deg) translateX(2em);opacity:0;border-radius:2px;box-shadow:0 2px 6px rgba(224,32,32,.4);animation:ov${uid}Vale .55s cubic-bezier(.2,.9,.3,1.15) 1.95s forwards;}
        .ov-${uid} .vale span{display:inline-block;transform:skewX(30deg);}
        @keyframes ov${uid}Vale{to{opacity:1;transform:skewX(-30deg) translateX(0);}}

        @media (prefers-reduced-motion: reduce){
          .ov-${uid} .lt,.ov-${uid} .st,.ov-${uid} .vale,.ov-${uid} .wr{animation:none!important;opacity:1!important;}
          .ov-${uid} .lt{transform:none;}
          .ov-${uid} .wr{transform:translateX(-50%);}
          .ov-${uid} .vale{transform:skewX(-30deg);}
        }
      `}</style>

      <div className={`ov-${uid}`}>
        <div className="wm" aria-label="Oficina Vale">
          <span className="lt">o</span>
          <span className="lt">f</span>
          <span className="lt">i</span>
          <span className="lt">c</span>
          <span className="ws" aria-hidden>
            <svg className="wr" viewBox="0 0 32 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id={`g${uid}`} x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor="#ef3030" />
                  <stop offset="1" stopColor="#a31515" />
                </linearGradient>
              </defs>
              {/* wrench head */}
              <path
                d="M16 2c-6 0-11 5-11 11 0 4 2 7.5 5.5 9.5v3h-3v6h17v-6h-3v-3C25 20.5 27 17 27 13c0-6-5-11-11-11zm0 5c3.3 0 6 2.7 6 6s-2.7 6-6 6-6-2.7-6-6 2.7-6 6-6z"
                fill={`url(#g${uid})`}
              />
              {/* handle */}
              <rect x="11" y="31" width="10" height="47" rx="2" fill={`url(#g${uid})`} />
              {/* tip detail */}
              <circle cx="16" cy="13" r="3" fill="#0d0d0f" />
            </svg>
          </span>
          <span className="lt">n</span>
          <span className="lt">a</span>
        </div>
        <div className="strow">
          <div className="stripes" aria-hidden>
            <span className="st" />
            <span className="st" />
            <span className="st" />
            <span className="st" />
            <span className="st" />
            <span className="st" />
          </div>
          <div className="vale">
            <span>VALE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
