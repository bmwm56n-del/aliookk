const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const bedrock = require('bedrock-protocol');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    socket.on('start-bot', (data) => {
        // فصل الآي بي عن البورت إذا قام المستخدم بكتابتهما معاً
        const hostParts = data.host.split(':');
        const host = hostParts[0];
        // إذا لم يكتب المستخدم بورت، سيستخدم 19132 تلقائياً
        const port = parseInt(hostParts[1]) || 19132;

        console.log(`📡 محاولة الاتصال بـ: ${host} على بورت: ${port}`);

        try {
            const client = bedrock.createClient({
                host: host,
                port: port,
                username: data.username,
                offline: true, // للدخول للسيرفرات المكركة (Cracked)
                connectTimeout: 60000,
                skipPing: true // لتجاوز مشاكل الـ Timeout الأولية
            });

            client.on('spawn', () => {
                socket.emit('status', `✅ تم دخول البوت بنجاح لبورت ${port}!`);
            });

            client.on('error', (err) => {
                console.log('Error Details:', err.message);
                if (err.message.includes('Version mismatch')) {
                    socket.emit('status', '⚠️ إصدار السيرفر غير مدعوم حالياً.');
                } else {
                    socket.emit('status', `❌ فشل الاتصال: تأكد من تشغيل السيرفر وتفعيل خيار Cracked.`);
                }
            });

            client.on('close', () => {
                socket.emit('status', 'ℹ️ انقطع الاتصال.');
            });

        } catch (e) {
            socket.emit('status', '❌ خطأ في تشغيل المحرك.');
        }
    });
});

const PORT = 8080;
server.listen(PORT, () => {
    console.log(`🚀 السيرفر يعمل: http://localhost:${PORT}`);
});