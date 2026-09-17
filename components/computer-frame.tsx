import type {ReactNode} from 'react';
export function RetroComputerFrame({children}:{children:ReactNode}){return <div className="computer-frame"><div className="computer-screen">{children}</div><div className="computer-chin"><span>GAMIFY.LIFE</span><span className="hardware-label">PERSONAL GROWTH COMPUTER · 01</span><span className="power-led" role="img" aria-label="Power on"/></div></div>;}
