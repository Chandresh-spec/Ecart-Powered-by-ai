async function generateMeal() {
    const prompt = document.getElementById('mealPrompt').value.trim();
    if (!prompt) return;
    
    const resultDiv = document.getElementById('plannerResult');
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = '<p>AI is thinking...</p>';
    
    try {
        const data = await apiCall('/ai/meal-planner/', 'POST', { prompt: prompt }, false);
        if (data.error) {
            resultDiv.innerHTML = `<p style="color:red;">Error: ${data.error}</p>`;
        } else {
            resultDiv.innerHTML = `<h3 style="margin-bottom: 10px; color: var(--primary-color);">AI Suggestion:</h3><p>${data.meal_suggestion}</p>`;
        }
    } catch(e) {
        resultDiv.innerHTML = `<p style="color:red;">Error: ${e.message}</p>`;
    }
}
