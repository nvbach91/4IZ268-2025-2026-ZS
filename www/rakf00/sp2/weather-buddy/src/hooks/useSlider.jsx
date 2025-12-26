import { useState, useCallback } from 'react';

export function useSlider(totalItems, itemsVisible = 6, itemsToScroll = 3) {
    const [startIndex, setStartIndex] = useState(0);

    const maxStartIndex = Math.max(0, totalItems - itemsVisible);

    const canGoPrev = startIndex > 0;
    const canGoNext = startIndex < maxStartIndex;

    const handleNext = useCallback(() => {
        setStartIndex(prev => Math.min(prev + itemsToScroll, maxStartIndex));
    }, [itemsToScroll, maxStartIndex]);

    const handlePrev = useCallback(() => {
        setStartIndex(prev => Math.max(prev - itemsToScroll, 0));
    }, [itemsToScroll]);

    // css

    // šírka v %
    const itemWidth = 100 / itemsVisible;

    // o kolik % posunout celý slider
    const translateX = -(startIndex * itemWidth);

    return {
        handleNext,
        handlePrev,
        canGoNext,
        canGoPrev,
        itemWidth,
        translateX,
    };
}