import os
import google.generativeai as genai
import mysql.connector
genai.configure(api_key="AIzaSyDOJTJ60N9U1U_KrD4TtWjma-gylv72FGM")
history1=[]
generation_config = {
  "temperature": 1,
  "top_p": 0.95,
  "top_k": 64,
  "max_output_tokens": 8192,
  "response_mime_type": "text/plain",
}
connection = mysql.connector.connect(
    host="localhost",       
    user="root",     
    password="dhakshin78",
    database="dhakshin" 
)

if connection.is_connected():
    print("Connected to MySQL database")
    cursor = connection.cursor()
    cursor.execute("SELECT * FROM response")
    rows = cursor.fetchall()

    for row in rows:
        history1.append("the salary and name is"+str(row))

    cursor.close()
    connection.close()





model = genai.GenerativeModel(
  model_name="gemini-1.5-flash",
  generation_config=generation_config,
)

chat_session = model.start_chat(
  history=[
  ]
)

while(1):
    a=input("Enter the Question :")
    print(history1)
    response = chat_session.send_message("salary and name is in"+str(history1)+"question is "+a)
    print(response.text)