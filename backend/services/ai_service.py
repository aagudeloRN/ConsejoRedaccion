from google import genai
import os
import json
import asyncio
from pydantic import BaseModel
from typing import List

# Initialize the new Gemini Client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# Using gemini-2.5-flash for the best balance of speed and reliability in 2026 Free Tier
MODEL_NAME = "gemini-2.5-flash"

# GLOBAL LOCK to prevent concurrent API calls
analysis_lock = asyncio.Lock()

async def analyze_text(text: str) -> dict:
    """
    Analyzes the provided text using the Gemini SDK.
    Protected by a lock and includes basic retry logic for Free Tier stability.
    """
    async with analysis_lock:
        print(f"Acquired lock. Analyzing text (length: {len(text)} characters) with {MODEL_NAME}...")
        
        prompt = f"""
        Actúa como un analista experto en Ciencia, Tecnología e Innovación (CTi) para Ruta N Medellín.
        Ruta N es el centro de innovación y negocios de Medellín, cuya misión es articular el ecosistema de CTi para transformar la economía de la ciudad hacia una basada en el conocimiento. Sus ejes principales son: atraer talento y empresas, fomentar la innovación abierta, y fortalecer el tejido empresarial tecnológico.

        Analiza el siguiente texto extraído de una noticia o documento y genera un análisis estructurado.

        Texto a analizar:
        "{text[:15000]}"
        
        Salida requerida (SOLO JSON válido):
        {{
            "title": "Un título corto y descriptivo (máximo 15 palabras)",
            "summary": "Un resumen ejecutivo enfocado en por qué esta noticia es relevante para el ecosistema CTI (máximo 3 párrafos)",
            "theme": "Temática principal (ej: Inteligencia Artificial, Biotecnología, Política Pública, Smart Cities, etc.)",
            "geography": "Ámbito geográfico (ej: Medellín, Colombia, Latam, Global)",
            "impact": "Análisis detallado del impacto o relevancia específica para Ruta N y Medellín. Responde: ¿Cómo afecta esto a los planes de la ciudad o a las empresas del ecosistema? (3-4 líneas)",
            "keywords": ["tag1", "tag2", "tag3"]
        }}
        """

        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = await asyncio.to_thread(
                    client.models.generate_content,
                    model=MODEL_NAME, 
                    contents=prompt
                )
                
                text_response = response.text
                # Extraer JSON limpio
                cleaned_response = text_response.replace("```json", "").replace("```", "").strip()
                # A veces la respuesta trae texto extra antes o después del JSON
                start_idx = cleaned_response.find('{')
                end_idx = cleaned_response.rfind('}') + 1
                if start_idx != -1 and end_idx != 0:
                    cleaned_response = cleaned_response[start_idx:end_idx]
                
                analysis = json.loads(cleaned_response)
                return analysis
            except Exception as e:
                print(f"Attempt {attempt + 1} failed for {MODEL_NAME}: {e}")
                if attempt < max_retries - 1:
                    await asyncio.sleep(2 * (attempt + 1)) # Exponential backoff
                else:
                    return {
                        "title": "Error de Conexión (IA Sobrecargada)",
                        "summary": f"No se pudo generar el análisis tras {max_retries} intentos. Google reporta: {str(e)}",
                        "theme": "Error de Sistema",
                        "geography": "N/A",
                        "impact": "N/A",
                        "keywords": []
                    }
