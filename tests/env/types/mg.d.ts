interface GameMock {
    id: number;
    title: string;
    slug: string;
    ign_slug: string;
}

interface MapMock {
    id: number;
    title: string,
    slug: string
}

interface MapDataMock {
    map: MapMock;
    maps: MapMock[];
}

interface UserMock {
    id: number;
}

interface MGData {
    user: UserMock;
    game: GameMock;
    maps: MapMock[];
}