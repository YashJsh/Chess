import { useGameStore } from "@/store/gameStore"

export const Moves = ()=>{
    const { history } = useGameStore();
    const moves = [];
    console.log(history);
    for (let i = 0;  i < history.length; i+=2){
        moves.push({
            moveNumber : Math.floor(i/2) + 1,
            White : history[i],
            Black : history[i+1],
        })
    };      
    return (
        <div className="flex-1 overflow-y-auto px-6 py-4 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
              Move History
            </h3>
            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
              {history.length} total moves
            </span>
          </div>
          {moves.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                <span className="text-3xl">♟</span>
              </div>
              <p className="text-slate-400 text-sm font-medium">No moves played yet</p>
              <p className="text- slate-300 text-xs mt-1">Start your game!</p>
            </div>
          ) : (
            <div className="space-y-1 border p-2 rounded-xl overflow-auto">
              {moves.map((pair, idx) => (
                <div 
                  key={idx}
                  className={`flex items-center gap-1 p-1 rounded-lg transition-all duration-200 hover:bg-slate-50 hover:shadow-sm `}
                >
                  <span className="text-xs font-bold text-slate-500 w-6 flex-shrink-0">
                    {idx+1}
                  </span>
                  
                  <div className="flex-1 flex items-center gap-3">
                    <div className="flex-1">
                      <div className="font-mono text-sm font-semibold text-slate-800 bg-slate-100 px-3 py-1.5 rounded border border-slate-200">
                        {pair.White}
                      </div>
                    </div>
                    
                    {pair.Black && (
                      <div className="flex-1">
                        <div className="font-mono text-sm font-semibold bg-primary text-primary-foreground  px-3 py-1.5 rounded">
                          {pair.Black}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        }
        </div>
    )
}