import logging
from typing import List, Dict
from openai import OpenAI
from dotenv import load_dotenv
import os
from openai.types.chat import ChatCompletionMessageToolCall
from openai.types.shared_params import FunctionDefinition
from app.rag.notes_chatbot import retrieve_relevant_chunks
import json
from openai.types.chat import ChatCompletionMessageToolCall

load_dotenv()
AZURE_API_KEY = os.getenv("AZURE_OPENAI_API_KEY")
AZURE_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
API_VERSION = os.getenv("AZURE_OPENAI_API_VERSION")
deployment_name = os.getenv("AZURE_OPENAI_MODEL")


class OpenAIService:
    def __init__(self):
        logging.debug("[OpenAIService] Initializing OpenAI Azure client...")
        self.client = OpenAI(
            api_key=AZURE_API_KEY,
            base_url=AZURE_ENDPOINT,
            default_query={"api-version": "preview"},
        )
        self.deployment_name = "gpt-4o"
        logging.debug(
            f"[OpenAIService] Client initialized with endpoint {AZURE_ENDPOINT} and deployment '{self.deployment_name}'")

    def get_system_prompt(self) -> str:
        return """You are a friendly and professional medical assistant chatbot for a healthcare platform. Your role is to:

1. **Engage in natural conversation** while gradually collecting patient information:
   - Patient's full name (first and last name)
   - Contact information (phone number or email address)
   - Age (numeric value)
   - Gender (Male/Female/Other)
   - Current symptoms and medical concerns
   - Location/city where they live
   - Any relevant medical history

2. **Conversation Guidelines:**
   - Be warm, empathetic, and professional
   - Ask one question at a time to avoid overwhelming the patient
   - If a patient provides multiple pieces of information, acknowledge each one warmly
   - If information is missing or unclear, politely ask for clarification
   - Use natural language - don't sound like a form or questionnaire
   - Show understanding and empathy for their medical concerns
   - Be conversational and friendly, not robotic

3. **Information Collection Strategy:**
   - Start by asking their name and how you can help them
   - Then ask about their symptoms or medical concerns
   - Ask for their location/city
   - Ask for their age and gender
   - Finally, ask for their contact information (phone or email)
   - If they provide information out of order, acknowledge it warmly and continue with what's missing
   - Don't rush - let the conversation flow naturally

4. **When you have collected the required information, provide a summary:**
   "Thank you for providing your information. Let me summarize what I have:
   - Name: [name]
   - Contact: [contact]
   - Age: [age]
   - Gender: [gender]
   - Symptoms: [symptoms]
   - Location: [location]

   Based on your symptoms and location, I can recommend some doctors for you. Would you like me to proceed with doctor recommendations?"

5. **When the patient confirms (says "yes", "sure", "okay", "please", "go ahead", etc.), respond:**
   "Great! I'll search for doctors based on your symptoms and location. Let me find the best matches for you..."

6. **Important Rules:**
   - Always maintain patient privacy and confidentiality
   - If a patient seems to be in immediate danger, advise them to call emergency services
   - Be supportive and reassuring
   - Don't make medical diagnoses - only collect information and provide doctor recommendations
   - If someone asks to start over or clear the conversation, be understanding and start fresh
   - Be patient and understanding if someone provides information slowly or in fragments

Current conversation context: You are starting a new conversation with a patient.
        """

    def get_rag_system_prompt(self) -> str:
        return """You are a responsible and helpful medical assistant tasked with analyzing a conversation of a 
        medical consultation during an appointment between a doctor and a patient.

    1. **Conversation Guidelines:**
       - Engage in natural conversation
       - Be warm, empathetic, and professional
       - Ask one question at a time to avoid overwhelming the patient
       - If a patient provides multiple pieces of information, acknowledge each one warmly
       - If information is missing or unclear, politely ask for clarification
       - Use natural language - don't sound like a form or questionnaire
       - Show understanding and empathy for their medical concerns
       - Be conversational and friendly, not robotic
       - Don't rush - let the conversation flow naturally

    2. **Handling general non-medical queries:**
       - If the queries are strictly non-medical, politely refuse to answer with "I am here to assist with medical 
         consultations and related questions. Please let me know how I can help you regarding 
         your appointment or health concerns."
       - Non-medical queries may include: weather, news, travel options, transport, sports, entertainment etc.
       - However, if the general non-medical queries seem to be related to medical or health concerns specific to the 
         patient based on his medical history, you can answer accordingly.
         -Example#01: If a patient asks if he should go hiking, you can assess his current or past health 
         situation (e.g. if he has a heart condition) and then advise accordingly.
         -Example#02: If a patient asks specific food consumption, or sports, or travelling, you can assess his current
          or past health situation and advise accordingly.

    3. **Handling general medical queries:**
       - If the user asks a general medical question (not related to the conversation during appointment),
        answer using general knowledge 

    4. **Handling queries from the appointment conversation:**
       - ONLY use the specific appointment conversation to answer specific questions about the consultation.
       - If the appointment conversation lacks the answer, say: 'The context does not provide 
        enough information to answer this question.
       - 

    5. **Important Rules:**
       - Always maintain patient privacy and confidentiality
       - If a patient seems to be in immediate danger, advise them to call emergency services
       - Be supportive and reassuring
       - Don't make medical diagnoses - only collect information and provide doctor recommendations
       - If someone asks to start over or clear the conversation, be understanding and start fresh
       - Be patient and understanding if someone provides information slowly or in fragments

    Current conversation context: You are starting a new conversation with a patient.
            """

    def extract_patient_info_with_llm(self, conversation_history: List[Dict]) -> Dict:
        user_messages = "\n".join(
            msg["content"] for msg in conversation_history if msg.get("role") == "user" or msg.get("isUser")
        )

        extraction_prompt = f"""You are a data extraction specialist. Extract patient information from the following conversation messages.

    Conversation:
    {user_messages}

    Extract the following information and return ONLY a valid JSON object:
    {{
      "name": "full name or empty string",
      "contact": "phone number or email or empty string", 
      "age": "numeric age or empty string",
      "gender": "Male/Female/Other or empty string",
      "location": "city name or empty string",
      "symptoms": "detailed symptoms description or empty string",
      "medicalHistory": "any mentioned medical history or empty string"
    }}

    Rules:
    - Return only valid JSON, no additional text
    - Use empty strings for missing information
    - For symptoms, be comprehensive but concise
    - For location, extract only city names
    - For age, use only numbers
    - For gender, standardize to Male/Female/Other
            """
        logging.debug("[extract_patient_info_with_llm] Extraction prompt:\n%s", extraction_prompt)

        import json

        try:
            response = self.client.chat.completions.create(
                model=self.deployment_name,
                messages=[{"role": "user", "content": extraction_prompt}],
                max_tokens=500,
                temperature=0.1,
                response_format={"type": "json_object"}
            )
            logging.debug("[extract_patient_info_with_llm] LLM raw response: %s", response)

            # Parse the string content into a Python dictionary
            response_content = response.choices[0].message.content
            extracted_data = json.loads(response_content)
            return extracted_data

        except Exception as e:
            logging.error(f"[extract_patient_info_with_llm] LLM Extraction Error: {e}")
            return {
                "name": "", "contact": "", "age": "", "gender": "",
                "location": "", "symptoms": "", "medicalHistory": ""
            }

    def recommend_doctors_with_llm(self, patient_info: Dict, doctors_database: List[Dict]) -> Dict:
        recommendation_prompt = f"""You are a medical specialist matcher.
        Patient Information:
        - Symptoms: {patient_info.get('symptoms')}
        - Location: {patient_info.get('location')}
        - Age: {patient_info.get('age')}
        - Gender: {patient_info.get('gender')}
        - Medical History: {patient_info.get('medicalHistory')}

        Available Doctors:
        {doctors_database}

Your task:
1. Analyze the patient's symptoms and determine the most appropriate medical specialties
2. Find doctors from the database that match:
   - Relevant specialty for the symptoms
   - Same or nearby location
   - Consider patient's age and gender if relevant
3. Rank the top 3-5 doctors by relevance

Return a JSON object with this structure:
{{
  "recommendedSpecialty": "primary specialty needed",
  "reasoning": "brief explanation of why this specialty",
  "doctors": [
    {{
      "id": "doctor_id",
      "name": "Doctor Name",
      "specialty": "Specialty",
      "location": "City",
      "experience": "years or description",
      "rating": "if available",
      "matchScore": "1-10 relevance score",
      "whyRecommended": "specific reason for this patient"
    }}
  ]
}}

Rules:
- Return only valid JSON
- Maximum 5 doctor recommendations
- Include match score (1-10) based on specialty relevance and location proximity
- Provide specific reasoning for each recommendation
- If no perfect matches, suggest closest alternatives
        """

        try:
            response = self.client.chat.completions.create(
                model=self.deployment_name,
                messages=[{"role": "user", "content": recommendation_prompt}],
                max_tokens=1000,
                temperature=0.3,
                response_format="json_object"
            )
            return response.choices[0].message.content
        except Exception as e:
            logging.error(f"[recommend_doctors_with_llm] LLM Recommendation Error: {e}")
            return {
                "recommendedSpecialty": "general practitioner",
                "reasoning": "Unable to process recommendations",
                "doctors": []
            }

    def chat_with_patient(self, user_message: str, conversation_history: List[Dict] = None) -> Dict:
        conversation_history = conversation_history or []
        messages = [{"role": "system", "content": self.get_system_prompt()}] + conversation_history + [
            {"role": "user", "content": user_message}]

        logging.debug("[chat_with_patient] Sending messages to OpenAI:\n%s", messages)

        try:
            response = self.client.chat.completions.create(
                model=self.deployment_name,
                messages=messages,
                max_tokens=1000,
                temperature=0.7,
                top_p=0.9,
                frequency_penalty=0,
                presence_penalty=0
            )
            logging.debug("[chat_with_patient] OpenAI response:\n%s", response)
            return {
                "success": True,
                "message": response.choices[0].message.content,
                "conversationHistory": messages
            }
        except Exception as e:
            logging.error(f"[chat_with_patient] OpenAI Chat Error: {e}")
            return {
                "success": False,
                "message": "I'm having trouble processing your request right now. Please try again later.",
                "error": str(e)
            }

    def chat_with_patient_rag(
            self,
            user_message: str,
            conversation_history: List[Dict],
            appointment_id: str
    ) -> Dict:
        import json
        from openai.types.chat import ChatCompletionMessageToolCall

        conversation_history = conversation_history or []

        # Inject appointment context
        messages = [{"role": "system", "content": f"{self.get_rag_system_prompt()}\nAppointment ID: {appointment_id}"}] \
                   + conversation_history \
                   + [{"role": "user", "content": user_message}]

        tools = [
            {
                "type": "function",
                "function": {
                    "name": "retrieve_relevant_chunks",
                    "description": "Search the medical transcript for relevant context for a user query",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "query": {"type": "string"},
                            "appointment_id": {"type": "string"},
                            "top_k": {"type": "integer", "default": 3}
                        },
                        "required": ["query", "appointment_id"],
                    },
                }
            }
        ]

        try:
            response = self.client.chat.completions.create(
                model=self.deployment_name,
                messages=messages,
                tools=tools,
                tool_choice="auto",
                max_tokens=1000,
                temperature=0.7,
                top_p=0.9,
            )

            message = response.choices[0].message

            # Tool usage
            if message.tool_calls:
                for tool_call in message.tool_calls:
                    if isinstance(tool_call,
                                  ChatCompletionMessageToolCall) and tool_call.function.name == "retrieve_relevant_chunks":
                        args = json.loads(tool_call.function.arguments)
                        query = args.get("query")
                        appointment_id = args.get("appointment_id")
                        top_k = args.get("top_k", 3)

                        from app.rag.notes_chatbot import retrieve_relevant_chunks
                        chunks = retrieve_relevant_chunks(query=query, appointment_id=appointment_id, top_k=top_k)
                        context = "\n\n".join(chunks)

                        messages.append({"role": "system", "content": f"Transcript:\n{context}"})

                        second_response = self.client.chat.completions.create(
                            model=self.deployment_name,
                            messages=messages,
                            max_tokens=1000,
                            temperature=0.7,
                            top_p=0.9,
                        )

                        reply = second_response.choices[0].message.content.strip()
                        messages.append({"role": "assistant", "content": reply})
                        return {
                            "message": reply,
                            "conversationHistory": [
                                {"role": m["role"], "content": m["content"], "isUser": m["role"] == "user"}
                                for m in messages if m["role"] in ["user", "assistant"]
                            ]
                        }

            # Fallback direct reply
            reply = message.content.strip()
            messages.append({"role": "assistant", "content": reply})

            return {
                "message": reply,
                "conversationHistory": [
                    {"role": m["role"], "content": m["content"], "isUser": m["role"] == "user"}
                    for m in messages if m["role"] in ["user", "assistant"]
                ]
            }

        except Exception as e:
            return {
                "message": "I'm having trouble processing your request right now. Please try again later.",
                "conversationHistory": conversation_history,
                "error": str(e)
            }

    def is_confirming_recommendations(self, user_message: str) -> bool:
        confirmations = [
            'yes', 'sure', 'okay', 'please', 'go ahead', 'proceed', 'continue', 'ok', 'yeah', 'yep',
            'no medical history', 'no history', 'new issue', 'first time', 'no previous', 'none',
            'recommend', 'recommendation', 'doctor', 'find', 'search', 'show', 'list'
        ]
        message = user_message.lower().strip()
        return any(term in message for term in confirmations)

    def generate_doctor_search_query(self, patient_info: Dict) -> str:
        symptom_to_specialty = {
            "headache": "neurologist", "heart": "cardiologist", "chest": "cardiologist",
            "skin": "dermatologist", "rash": "dermatologist", "anxiety": "psychiatrist",
            "depression": "psychiatrist", "stomach": "gastroenterologist", "nausea": "gastroenterologist",
            "bone": "orthopedist", "joint": "orthopedist", "eye": "ophthalmologist",
            "vision": "ophthalmologist", "ear": "otolaryngologist", "throat": "otolaryngologist",
            "chest pain": "cardiologist", "bleeding": "emergency", "heart attack": "cardiologist",
            "stroke": "neurologist", "seizure": "neurologist", "shortness of breath": "pulmonologist",
            "breathing": "pulmonologist", "breath": "pulmonologist"
        }

        symptoms = (patient_info.get("symptoms") or "").lower()
        specialty = next((spec for symptom, spec in symptom_to_specialty.items() if symptom in symptoms),
                         "general practitioner")
        location = patient_info.get("location", "").strip()
        return f"{specialty} in {location}" if location else specialty
