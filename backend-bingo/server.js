import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import db from "./db.js";
import path from "path";
import { fileURLToPath } from "url";

// Convert ES Module __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

// Serve static files from public folder
app.use(express.static(path.join(__dirname, "public")));

// Serve index.html on root route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

let timer = 59;
let winningNumbers = generateWinningNumbers();

const startTimer = () => {
    setInterval(() => {
        timer--;

        if (timer <= 0) {
            timer = 59;
            winningNumbers = generateWinningNumbers();
            console.log("New Winning Numbers:", winningNumbers);

            db.query("INSERT INTO history (winning_nums) VALUES (?)", [winningNumbers], (err) => {
                if (err) console.error("Database error:", err);
            });

            io.emit("game_update", { timer, winningNumbers });
        } else {
            io.emit("game_update", { timer, winningNumbers });
        }
    }, 1000);
};

function generateWinningNumbers() {
    let numbers = [];
    while (numbers.length < 5) {
        let num = Math.floor(Math.random() * 90) + 1;
        if (!numbers.includes(num)) numbers.push(num);
    }
    return numbers.join("-");
}

startTimer();

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);
    socket.emit("game_update", { timer, winningNumbers });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`!!!Server running on http://localhost:${PORT}!!!!`);
});