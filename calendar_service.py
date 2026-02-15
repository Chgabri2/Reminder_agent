import os
from datetime import datetime, timedelta
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from langchain_ollama import OllamaLLM
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from flask import Flask, jsonify
import json

SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']

app = Flask(__name__)

class CalendarAIService:
    def __init__(self):
        self.calendar_service = self.authenticate_google()
        self.llm = OllamaLLM(model="llama3.2", temperature=0.7)
        
        self.message_template = PromptTemplate(
            input_variables=["events"],
            template="""
אתה עוזר אישי שכותב תזכורות ידידותיות בעברית.
קיבלת את רשימת האירועים הבאה מיומן גוגל:

{events}

כתוב הודעת תזכורת קצרה וברורה בעברית שמסכמת את האירועים להיום.
השתמש באימוג'י רלוונטיים והפוך את זה לנעים לקריאה.
אל תוסיף הקדמות מיותרות, רק את התזכורת עצמה.
            """
        )
        self.chain = LLMChain(llm=self.llm, prompt=self.message_template)

    def authenticate_google(self):
        creds = None
        if os.path.exists('token.json'):
            creds = Credentials.from_authorized_user_file('token.json', SCOPES)
        
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                flow = InstalledAppFlow.from_client_secrets_file(
                    'credentials.json', SCOPES)
                creds = flow.run_local_server(port=0)
            
            with open('token.json', 'w') as token:
                token.write(creds.to_json())
        
        return build('calendar', 'v3', credentials=creds)

    def get_today_events(self):
        now = datetime.utcnow()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0).isoformat() + 'Z'
        today_end = (now + timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0).isoformat() + 'Z'
        
        events_result = self.calendar_service.events().list(
            calendarId='primary',
            timeMin=today_start,
            timeMax=today_end,
            singleEvents=True,
            orderBy='startTime'
        ).execute()
        
        return events_result.get('items', [])

    def format_events_for_llm(self, events):
        if not events:
            return "אין אירועים מתוכננים להיום."
        
        formatted = []
        for event in events:
            start = event['start'].get('dateTime', event['start'].get('date'))
            try:
                start_time = datetime.fromisoformat(start.replace('Z', '+00:00'))
                time_str = start_time.strftime('%H:%M')
            except:
                time_str = "כל היום"
            
            summary = event.get('summary', 'אירוע ללא כותרת')
            location = event.get('location', '')
            
            event_str = f"⏰ {time_str} - {summary}"
            if location:
                event_str += f" (📍 {location})"
            
            formatted.append(event_str)
        
        return "\n".join(formatted)

    def generate_reminder_message(self):
        events = self.get_today_events()
        
        if not events:
            return None
        
        events_text = self.format_events_for_llm(events)
        ai_message = self.chain.run(events=events_text)
        
        return ai_message

calendar_service = CalendarAIService()

@app.route('/get-reminder', methods=['GET'])
def get_reminder():
    try:
        message = calendar_service.generate_reminder_message()
        if message:
            return jsonify({'message': message, 'has_events': True})
        else:
            return jsonify({'message': None, 'has_events': False})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)
