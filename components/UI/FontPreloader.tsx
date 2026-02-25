
import React from 'react';
import { FONTS } from '../../constants';

const FontPreloader: React.FC = () => {
    return (
        <div
            style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', height: 0, overflow: 'hidden', top: '-9999px' }}
            aria-hidden="true"
        >
            {FONTS.map(f => (
                <div key={f} style={{ fontFamily: `"${f}", sans-serif` }}>
                    <span style={{ fontWeight: 400 }}>{f} 400</span>
                    <span style={{ fontWeight: 700 }}>{f} 700</span>
                    <span style={{ fontWeight: 800 }}>{f} 800</span>
                    <span style={{ fontWeight: 900 }}>{f} 900</span>
                </div>
            ))}
        </div>
    );
};

export default FontPreloader;
