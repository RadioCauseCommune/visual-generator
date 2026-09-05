import React from 'react';
import { CarouselSlide, SlideTheme, BadgeColor } from './types';

interface Props {
  slide: CarouselSlide;
  mediaName?: string;
  pageIndex: number;
  totalPages: number;
  scale?: number;
  innerRef?: React.RefObject<HTMLDivElement | null>;
}

export const CarouselSlideRenderer: React.FC<Props> = ({
  slide,
  mediaName = 'Radio Cause Commune 93.1 FM',
  pageIndex,
  totalPages,
  scale = 1,
  innerRef
}) => {
  const getThemeBg = (theme: SlideTheme) => {
    switch (theme) {
      case 'white': return 'bg-[#FFFFFF] text-[#0F0F0F]';
      case 'dark': return 'bg-[#0F0F0F] text-[#FFFFFF]';
      case 'vanilla':
      default: return 'bg-[#FFFAE5] text-[#0F0F0F]';
    }
  };

  const getBadgeStyle = (color: BadgeColor, isDark: boolean) => {
    switch (color) {
      case 'red':
        return 'bg-[#D20A33] text-white border-[#0F0F0F] shadow-[6px_6px_0px_#0F0F0F]';
      case 'yellow':
        return 'bg-[#FFD600] text-[#0F0F0F] border-[#0F0F0F] shadow-[6px_6px_0px_#0F0F0F]';
      case 'green':
        return isDark
          ? 'bg-[#A3FF00] text-[#0F0F0F] border-[#000000] shadow-[6px_6px_0px_#A3FF00]'
          : 'bg-[#A3FF00] text-[#0F0F0F] border-[#0F0F0F] shadow-[6px_6px_0px_#0F0F0F]';
      case 'white':
        return 'bg-[#FFFFFF] text-[#0F0F0F] border-[#0F0F0F] shadow-[6px_6px_0px_#0F0F0F]';
      case 'dark':
        return 'bg-[#0F0F0F] text-white border-[#0F0F0F] shadow-[6px_6px_0px_#0F0F0F]';
      default:
        return 'bg-[#D20A33] text-white border-[#0F0F0F] shadow-[6px_6px_0px_#0F0F0F]';
    }
  };

  const getMicroBadgeStyle = (color: BadgeColor) => {
    switch (color) {
      case 'red': return 'bg-[#D20A33] text-white';
      case 'yellow': return 'bg-[#FFD600] text-[#0F0F0F]';
      case 'green': return 'bg-[#A3FF00] text-[#0F0F0F]';
      case 'dark': return 'bg-[#0F0F0F] text-white';
      case 'white':
      default: return 'bg-[#FFFFFF] text-[#0F0F0F]';
    }
  };

  const isDark = slide.theme === 'dark';

  // Helper to highlight words in title
  const renderHighlightedTitle = (text?: string, highlight?: string) => {
    if (!text) return null;
    if (!highlight || !highlight.trim()) {
      return <span className="whitespace-pre-line">{text}</span>;
    }

    const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return (
      <span className="whitespace-pre-line">
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <span key={i} className={isDark ? 'text-[#A3FF00]' : 'text-[#D20A33]'}>
              {part}
            </span>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </span>
    );
  };

  const containerStyle: React.CSSProperties = {
    width: '1080px',
    height: '1080px',
    transform: scale !== 1 ? `scale(${scale})` : undefined,
    transformOrigin: 'top left',
    flexShrink: 0
  };

  return (
    <div
      ref={innerRef}
      id={`slide-render-${slide.id}`}
      style={containerStyle}
      className={`relative p-[60px] flex flex-col justify-between overflow-hidden border-[12px] border-[#0F0F0F] select-none ${getThemeBg(slide.theme)}`}
    >
      {/* Top Header / Badge */}
      <div className="flex items-center justify-between z-10">
        <span
          className={`inline-block font-roboto-condensed text-[20px] font-black uppercase tracking-[1px] px-[22px] py-[10px] border-[4px] ${getBadgeStyle(slide.badgeColor, isDark)}`}
        >
          {slide.badgeText || 'CAUSE COMMUNE'}
        </span>
      </div>

      {/* Main Body */}
      <div className="flex-grow flex flex-col justify-center my-6 z-10">
        {/* LAYOUT: COVER */}
        {slide.layout === 'cover' && (
          <div className="flex flex-col justify-center">
            <h1 className="font-syne text-[62px] font-black uppercase leading-[1.08] tracking-[-1.5px] mb-6">
              {renderHighlightedTitle(slide.coverTitle, slide.coverHighlight)}
            </h1>
            {slide.coverSubtitle && (
              <p className="font-roboto text-[32px] font-bold leading-[1.3] mb-4">
                {slide.coverSubtitle}
              </p>
            )}
            {slide.coverDescription && (
              <p className={`font-roboto text-[24px] leading-[1.4] ${isDark ? 'text-[#AAAAAA]' : 'text-[#555555]'}`}>
                {slide.coverDescription}
              </p>
            )}
          </div>
        )}

        {/* LAYOUT: STATS (2x2 GRID) */}
        {slide.layout === 'stats' && (
          <div className="flex flex-col justify-center">
            {slide.statsTitle && (
              <h2 className="font-syne text-[44px] font-black uppercase leading-[1.1] mb-6 tracking-[-1px]">
                {slide.statsTitle}
              </h2>
            )}
            <div className="grid grid-cols-2 gap-6 my-2">
              {(slide.stats || []).map((st) => {
                let boxBg = 'bg-[#FFFFFF] text-[#0F0F0F]';
                let numColor = 'text-[#D20A33]';
                let labelColor = 'text-[#0F0F0F]';
                let subColor = 'text-[#555555]';

                if (st.style === 'accent') {
                  boxBg = 'bg-[#FFFAE5] text-[#0F0F0F]';
                  numColor = 'text-[#D20A33]';
                } else if (st.style === 'dark') {
                  boxBg = 'bg-[#0F0F0F] text-[#FFFFFF]';
                  numColor = 'text-[#A3FF00]';
                  labelColor = 'text-[#FFFFFF]';
                  subColor = 'text-[#AAAAAA]';
                }

                return (
                  <div
                    key={st.id}
                    className={`p-6 border-[5px] border-[#0F0F0F] shadow-[8px_8px_0px_#0F0F0F] ${boxBg}`}
                  >
                    <div className={`font-syne text-[56px] font-black leading-none mb-2 tracking-[-1px] ${numColor}`}>
                      {st.number}
                    </div>
                    <div className={`font-roboto-condensed text-[22px] font-black uppercase leading-[1.2] ${labelColor}`}>
                      {st.label}
                    </div>
                    {st.sub && (
                      <div className={`font-roboto text-[16px] mt-1 ${subColor}`}>
                        {st.sub}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* LAYOUT: BULLETS */}
        {slide.layout === 'bullets' && (
          <div className="flex flex-col justify-center">
            {slide.bulletsTitle && (
              <h2 className="font-syne text-[46px] font-black uppercase leading-[1.15] mb-6 tracking-[-1px]">
                {slide.bulletsTitle}
              </h2>
            )}
            {slide.leadText && (
              <p className={`font-roboto text-[28px] font-medium leading-[1.4] mb-6 ${isDark ? 'text-[#E5E7EB]' : 'text-[#222222]'}`}>
                {slide.leadText}
              </p>
            )}
            <ul className="space-y-4 text-[26px] leading-[1.45]">
              {(slide.bullets || []).map((b, i) => (
                <li key={i} className="flex items-start">
                  <span className={`mr-4 text-[22px] select-none ${isDark ? 'text-[#A3FF00]' : 'text-[#D20A33]'}`}>
                    ▶
                  </span>
                  <span className={isDark ? 'text-[#E5E7EB]' : 'text-[#222222]'}>
                    {b}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* LAYOUT: BADGES */}
        {slide.layout === 'badges' && (
          <div className="flex flex-col justify-center">
            {slide.badgesTitle && (
              <h2 className="font-syne text-[46px] font-black uppercase leading-[1.15] mb-6 tracking-[-1px]">
                {slide.badgesTitle}
              </h2>
            )}
            <ul className="space-y-5 text-[26px] leading-[1.5]">
              {(slide.badgeItems || []).map((item) => (
                <li key={item.id} className="flex items-center">
                  <span
                    className={`inline-block font-roboto-condensed text-[18px] font-black uppercase tracking-[0.5px] px-[14px] py-[6px] border-[3px] border-[#0F0F0F] shadow-[3px_3px_0px_#0F0F0F] mr-4 flex-shrink-0 ${getMicroBadgeStyle(item.badgeColor)}`}
                  >
                    {item.badge}
                  </span>
                  <span className={isDark ? 'text-[#E5E7EB]' : 'text-[#222222]'}>
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* LAYOUT: QUOTE */}
        {slide.layout === 'quote' && (
          <div className="flex flex-col justify-center">
            <div className={`text-[80px] font-syne font-black leading-none mb-2 ${isDark ? 'text-[#A3FF00]' : 'text-[#D20A33]'}`}>
              “
            </div>
            <blockquote className="font-syne text-[40px] font-black uppercase leading-[1.25] tracking-[-1px] mb-8">
              {slide.quoteText || 'La radio est un bien commun à défendre inlassablement.'}
            </blockquote>
            <div className="border-t-[4px] border-[#0F0F0F] pt-4 flex flex-col">
              <span className="font-roboto-condensed text-[26px] font-black uppercase">
                {slide.quoteAuthor || 'Bénévole Cause Commune'}
              </span>
              {slide.quoteRole && (
                <span className={`text-[18px] font-roboto ${isDark ? 'text-[#AAAAAA]' : 'text-[#666666]'}`}>
                  {slide.quoteRole}
                </span>
              )}
            </div>
          </div>
        )}

        {/* LAYOUT: CTA */}
        {slide.layout === 'cta' && (
          <div className="flex flex-col justify-center">
            {slide.ctaTitle && (
              <h2 className="font-syne text-[52px] font-black uppercase leading-[1.1] mb-5 tracking-[-1px]">
                {slide.ctaTitle}
              </h2>
            )}
            {slide.ctaDescription && (
              <p className={`font-roboto text-[26px] leading-[1.4] mb-6 ${isDark ? 'text-[#E5E7EB]' : 'text-[#333333]'}`}>
                {slide.ctaDescription}
              </p>
            )}
            {slide.badgeItems && slide.badgeItems.length > 0 && (
              <ul className="space-y-4 mb-6 text-[24px]">
                {slide.badgeItems.map((item) => (
                  <li key={item.id} className="flex items-center">
                    <span
                      className={`inline-block font-roboto-condensed text-[16px] font-black uppercase px-[12px] py-[4px] border-[3px] border-[#0F0F0F] shadow-[3px_3px_0px_#0F0F0F] mr-3 ${getMicroBadgeStyle(item.badgeColor)}`}
                    >
                      {item.badge}
                    </span>
                    <span className={isDark ? 'text-[#E5E7EB]' : 'text-[#222222]'}>
                      {item.text}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {slide.ctaButtonText && (
              <div
                className={`self-start font-roboto-condensed text-[24px] font-black uppercase px-8 py-3.5 border-[4px] border-[#0F0F0F] shadow-[6px_6px_0px_#0F0F0F] mt-2 ${
                  slide.ctaButtonColor === 'green'
                    ? 'bg-[#A3FF00] text-[#0F0F0F]'
                    : slide.ctaButtonColor === 'yellow'
                    ? 'bg-[#FFD600] text-[#0F0F0F]'
                    : 'bg-[#D20A33] text-white'
                }`}
              >
                {slide.ctaButtonText}
              </div>
            )}
            {slide.ctaSubtext && (
              <p className="font-roboto text-[18px] text-[#666666] mt-4">
                {slide.ctaSubtext}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Slide Footer */}
      <div
        className={`flex justify-between items-center border-t-[5px] pt-5 font-roboto-condensed text-[22px] font-black uppercase z-10 ${
          isDark ? 'border-[#444444] text-[#FFFAE5]' : 'border-[#0F0F0F] text-[#0F0F0F]'
        }`}
      >
        <span>{mediaName}</span>
        <span>
          {slide.footerText || `${pageIndex + 1}/${totalPages}`}
        </span>
      </div>
    </div>
  );
};
