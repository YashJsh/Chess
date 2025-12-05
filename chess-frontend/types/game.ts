export interface room_response{
    room : string, 
    player_id : string, 
    message : string
}

export interface game_started {
    color : "White" | "Black";
    board : string;
    message : string;
    playertoMove : string;
};

export interface move_played{
    board: string;
    lastMove: { from: string; to: string };
    turn: string;
    moveHistory: { san : string, fen: string, by: string }[];
}

export interface invalid_move{
    message : string;
    from : string;
    to : string;
}

export interface invalid_chance{
    message : string;
    turn : string;
}