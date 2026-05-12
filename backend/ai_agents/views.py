from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.conf import settings
from google import genai
from products.models import Product
from products.serializers import ProductSerializer

def get_gemini_client():
    if not settings.GEMINI_API_KEY:
        return None
    return genai.Client(api_key=settings.GEMINI_API_KEY)

class SmartSearchView(APIView):
    permission_classes = (permissions.AllowAny,)
    
    def post(self, request):
        query = request.data.get('query', '')
        client = get_gemini_client()
        if not client:
            return Response({"error": "Gemini API key not configured"}, status=500)
            
        try:
            prompt = f"User searched for: '{query}'. Extract the key grocery items. Return just the item names separated by commas."
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
            )
            keywords = response.text.split(',')
            keywords = [k.strip() for k in keywords if k.strip()]
            
            # Simple fallback search using first keyword
            if keywords:
                products = Product.objects.filter(name__icontains=keywords[0])
                serializer = ProductSerializer(products, many=True)
                return Response({"results": serializer.data, "ai_keywords": keywords})
            return Response({"results": []})
        except Exception as e:
            return Response({"error": str(e)}, status=500)

class ChatbotView(APIView):
    permission_classes = (permissions.AllowAny,)
    
    def post(self, request):
        message = request.data.get('message', '')
        client = get_gemini_client()
        if not client:
            return Response({"error": "Gemini API key not configured"}, status=500)
            
        try:
            prompt = f"You are a helpful grocery store assistant for BigBasket. A customer asks: '{message}'. Be concise and helpful."
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
            )
            return Response({"response": response.text})
        except Exception as e:
            return Response({"error": str(e)}, status=500)

class MealPlannerView(APIView):
    permission_classes = (permissions.AllowAny,)
    
    def post(self, request):
        prompt_text = request.data.get('prompt', 'Suggest a quick healthy dinner')
        client = get_gemini_client()
        if not client:
            return Response({"error": "API Key missing"}, status=500)
            
        try:
            prompt = f"User implies this meal preference: '{prompt_text}'. Suggest a meal and list strictly ingredients needed separated by commas."
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
            )
            return Response({"meal_suggestion": response.text})
        except Exception as e:
            return Response({"error": str(e)}, status=500)
