// start_frontend_dev.js
const express = require('express');
const path = require('path');
const app = express();
const port = 3001; // پورت جداگانه برای سرور فرانت‌اند

// سرویس دهی فایل index.html (یا ws_test.html)
app.use(express.static(path.join(__dirname, './'))); // فایل‌ها را از ریشه پروژه سرویس می‌دهد

app.listen(port, () => {
  console.log(
    `Development frontend server running at http://localhost:${port}/ws_test.html`,
  );
});
