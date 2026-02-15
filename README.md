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


## Step 4: Running the System

**Terminal 1 - Python Service:**
```bash
python calendar_service.py
```

**Terminal 2 - WhatsApp Bot:**
```bash
node whatsapp_bot.js
```

---

## How It Works

1. **First Run**: You'll receive a QR code - scan it with your WhatsApp
2. **Authentication**: Baileys saves the session in `auth_info_baileys` folder
3. **Scheduling**: Every day at 08:00 the bot:
   - Sends a request to the Python service
   - Python pulls events from Google Calendar
   - Ollama formats a nice message
   - The bot sends the message to your WhatsApp

---

## Advantages of This Solution:

✅ **Completely Free** - No costs at all
✅ **No Limitations** - Send as many messages as you want
✅ **Simple** - Short and clear code
✅ **Flexible** - Easy to add features
✅ **Advanced AI** - Ollama + LangChain




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




