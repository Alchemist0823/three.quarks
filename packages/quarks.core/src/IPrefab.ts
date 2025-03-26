

export interface IAnimationData {
    /** Start time in seconds */
    startTime: number;
    /** Duration in seconds */
    duration: number;
    /** Target object */
    target: any;
}

export interface IPrefab {
    /**
     * The name of the prefab.
     */
    name: string;
    /**
     * The children of the prefab.
     */
    animationData: IAnimationData[];
}
