// server.js - Backend Aplikasi
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();
const port = 3000;

// Middleware
app.use(cors()); // Mengizinkan frontend mengakses server ini
app.use(express.json());

// Konfigurasi OpenAI
// Pastikan Anda nanti membuat file .env berisi OPENAI_API_KEY Anda
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, 
});

// Endpoint untuk menerima data dari Frontend
app.post('/api/generate-bio', async (req, res) => {
    try {
        const { nama, asal, interest, hobi, kesibukan, tone } = req.body;

        // 1. Tentukan gaya bahasa (System Prompt)
        let systemInstruction = "Kamu adalah penulis biografi profesional.";
        if (tone === 'casual') systemInstruction = "Kamu adalah blogger gaya hidup yang santai dan bersahabat.";
        if (tone === 'witty') systemInstruction = "Kamu adalah penulis komedi yang cerdas, unik, dan sedikit humoris.";

        // 2. Susun Prompt User
        const userPrompt = `
            Tuliskan satu paragraf atribusi penulis (bio singkat) berdasarkan data berikut:
            - Nama: ${nama}
            - Asal: ${asal}
            - Interest: ${interest}
            - Hobi: ${hobi}
            - Kesibukan saat ini: ${kesibukan}

            Panduan:
            - Gunakan Bahasa Indonesia.
            - Gaya bahasa: ${tone}
            - Panjang maksimal 30-50 kata.
            - Buat mengalir alami, jangan kaku seperti robot.
        `;

        // 3. Panggil OpenAI API
        const completion = await openai.chat.completions.create({
            model: "gpt-5.2", // Bisa diganti gpt-4o jika punya akses
            messages: [
                { role: "system", content: systemInstruction },
                { role: "user", content: userPrompt }
            ],
            temperature: 1, // Kreativitas (0 = kaku, 1 = liar)
        });

        // 4. Kirim hasil balik ke Frontend
        const hasilTeks = completion.choices[0].message.content;
        res.json({ success: true, bio: hasilTeks });

    } catch (error) {
        console.error("Error OpenAI:", error);
        res.status(500).json({ success: false, message: "Gagal menghasilkan bio." });
    }
});

// Jalankan Server (Hanya untuk local dev, abaikan saat di Vercel)
if (require.main === module) {
    app.listen(port, () => {
        console.log(`🚀 Server berjalan di http://localhost:${port}`);
    });
}

// PENTING: Export app agar Vercel bisa menjalankannya
module.exports = app;
