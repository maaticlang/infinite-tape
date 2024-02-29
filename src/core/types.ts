export type TInfiniteTapeConfiguration = {
    itemHeight: number;
    box: {
        height: number;
        width: number;
    };
    utils: {
        textSize: number;
        unit: 'rem' | 'em';
    };
    timeOfTranslation: number;
    incrementBy: number;
}