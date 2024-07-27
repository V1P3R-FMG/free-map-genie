declare namespace MG {
    declare interface GoogleMaps {
        Size: (x: number, y: number) => void;
    }

    declare interface Google {
        maps?: GoogleMaps;
    }
}
