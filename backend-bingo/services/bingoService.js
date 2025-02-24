let timer = 59;
let winningNumbers = generateWinningNumbers();

export function startGameService(io, db) {
    setInterval(() => {
        timer--;

        if (timer <= 0) {
            timer = 59;
            winningNumbers = generateWinningNumbers();
            console.log("🎉 New Winning Numbers:", winningNumbers);

            db.query("INSERT INTO history (winning_nums) VALUES (?)", [winningNumbers], (err) => {
                if (err) console.error("❌ Database error:", err);
            });

            io.emit("game_update", { timer, winningNumbers });
        } else {
            io.emit("game_update", { timer, winningNumbers });
        }
    }, 1000);
}

export function getGameState() {
    return { timer, winningNumbers };
}

function generateWinningNumbers() {
    let numbers = [];
    while (numbers.length < 5) {
        let num = Math.floor(Math.random() * 90) + 1;
        if (!numbers.includes(num)) numbers.push(num);
    }
    return numbers.join("-");
}
