# Reminder_agent
in the terminal
# התקנת חבילות נדרשות
npm init -y
npm install @whiskeysockets/baileys @hapi/boom pino qrcode-terminal dotenv node-cron
pip install langchain langchain-ollama google-auth-oauthlib google-auth-httplib2 google-api-python-client --break-system-packages

# הורדת מודל Ollama
ollama pull llama3.2


--------------///////////
at the end
how to use:

שלב 4: הרצה
טרמינל 1 - שירות Python:
bashpython calendar_service.py
טרמינל 2 - בוט WhatsApp:
bashnode whatsapp_bot.js

איך זה עובד?

הרצה ראשונה: תקבלי QR code - סרקי אותו עם WhatsApp
אימות: Baileys שומר את הסשן ב-auth_info_baileys
תזמון: כל יום ב-08:00 הבוט:

שולח בקשה לשירות Python
Python מושך אירועים מגוגל קלנדר
Ollama מעצב הודעה יפה
הבוט שולח את ההודעה לווטסאפ שלך




