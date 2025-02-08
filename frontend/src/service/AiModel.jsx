import { GoogleGenerativeAI } from "@google/generative-ai";
  
  const apiKey = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY
  console.log(import.meta.env.VITE_GOOGLE_GEMINI_API_KEY);

  const genAI = new GoogleGenerativeAI(apiKey);
  
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
  });
  
  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
  };
  

    export const chatSession = model.startChat({
      generationConfig,
      history: [
        {
          role: "user",
          parts: [
            {text: "My subject name is: Science and the Chapter name is: Photosynthesis total marks is:10, this is the ideal answer key:. This is the answer key provided by the student:. You have to compare both the answers based on the important keywords used and also the meaningfulness of the answers and provide the marks out of the total marks also show where the mistakes were made and where the marks were given in JSON format."},
          ],
        },
        {
          role: "model",
          parts: [
            {text: "Okay, I need more information to do this effectively. Please provide me with:\n\n1.  **The actual questions:** I need to know what the questions were that the students were supposed to answer.  Please list them numerically (1, 2, 3, etc.).\n\n2.  **The ideal answer key:** Provide the complete ideal answer key corresponding to the questions.  Please number each answer corresponding to the appropriate question.\n\n3.  **The student's answer key:** Provide the complete student's answer key corresponding to the questions. Please number each answer corresponding to the appropriate question.\n\nOnce you provide this information, I will be able to:\n\n*   Analyze the student's answers against the ideal answers.\n*   Identify keywords present/missing in the student's answers.\n*   Assess the meaningfulness and accuracy of the student's responses.\n*   Assign marks for each question.\n*   Provide a JSON output detailing the marks, mistakes, and rationale.\n\n**Example of how to provide the information (replace with your actual data):**\n\n**Questions:**\n\n1.  What is photosynthesis?\n2.  Name two essential requirements for photosynthesis.\n3.  What is the role of chlorophyll in photosynthesis?\n\n**Ideal Answer Key:**\n\n1.  Photosynthesis is the process by which green plants and some other organisms use sunlight to synthesize foods with the help of water and carbon dioxide. This process generates oxygen as a byproduct.\n2.  Two essential requirements for photosynthesis are sunlight and chlorophyll.\n3.  Chlorophyll absorbs sunlight, which provides the energy needed for photosynthesis to occur.\n\n**Student's Answer Key:**\n\n1.  Photosynthesis is when plants make food.\n2.  Sun and water.\n3.  It helps make plants green.\n\nOnce you give me the questions and both answer keys, I'll give you a detailed analysis and the JSON output.\n"},
          ],
        },
        {
          role: "user",
          parts: [
            {text: "My subject name is: Science and the Chapter name is: Photosynthesis total marks is:10, this is the ideal answer key:Photosynthesis is the process by which green plants, algae, and some bacteria convert light energy into chemical energy. It takes place in the chloroplasts of plant cells, where chlorophyll absorbs sunlight. The process involves the intake of carbon dioxide from the air and water from the soil. Using sunlight, these react to produce glucose and oxygen as a byproduct. This process is essential for life on Earth as it provides oxygen and forms the base of the food chain. This is the answer key provided by the student:Photosynthesis is how plants take in oxygen and produce food. It happens in the leaves, where plants drink water and breathe in air. They use sunlight to make energy, which helps them grow. The process releases carbon dioxide into the air. You have to compare both the answers based on the important keywords used and also the meaningfulness of the answers and provide the marks out of the total marks also show where the mistakes were made and where the marks were given in JSON format."},
          ],
        },
        {
          role: "model",
          parts: [
            {text: "Okay, I will analyze the student's answer against the ideal answer key and provide a JSON output with the marks, mistakes, and rationale.\n\n**Analysis:**\n\nThe student's answer demonstrates a basic understanding of photosynthesis but contains several inaccuracies and lacks detail compared to the ideal answer. Here's a breakdown:\n\n*   **Correct Concepts:** The student correctly identifies that photosynthesis is how plants make food and that sunlight is involved in making energy. They also correctly mention water intake and plant growth.\n\n*   **Incorrect Concepts:** The student incorrectly states that plants take in oxygen and release carbon dioxide during photosynthesis. This is the reverse of what actually happens. They also omit key details such as the role of carbon dioxide intake, the production of oxygen as a byproduct, the location of the process (chloroplasts), and the conversion of light energy into chemical energy (glucose).\n\n*   **Missing Concepts:** The student completely misses the important detail of chlorophyll, the role of algae and bacteria, and the importance of photosynthesis in food chain and general sustainablity of life.\n\n**JSON Output:**\n\n```json\n{\n  \"subject\": \"Science\",\n  \"chapter\": \"Photosynthesis\",\n  \"total_marks\": 10,\n  \"student_marks\": 4,\n  \"assessment\": {\n    \"overall_comment\": \"The student demonstrates a basic, but flawed, understanding of photosynthesis. The answer contains some correct concepts but includes significant inaccuracies and omissions. Focus on clarifying the inputs and outputs of the process and the location where it takes place.\",\n    \"strengths\": [\n      \"Identifies photosynthesis as a process for plants to make food.\",\n      \"Recognizes the role of sunlight in energy production.\",\n      \"Mentions water intake by plants.\",\n      \"Connects the process with plant growth.\"\n    ],\n    \"weaknesses\": [\n      \"Incorrectly states that plants take in oxygen and release carbon dioxide during photosynthesis.\",\n      \"Omission of the conversion of light energy into chemical energy (glucose).\",\n      \"Omission of the importance of chlorophyll.\",\n      \"Omission of the location of photosynthesis (chloroplasts).\",\n      \"Omission of the intake of carbon dioxide from the air.\",\n       \"Omission of algae and bacteria.\",\n      \"Omission of the process in the larger context of sustenance of life.\"\n    ],\n    \"detailed_breakdown\": [\n      {\n        \"aspect\": \"Definition of Photosynthesis\",\n        \"ideal\": \"Photosynthesis is the process by which green plants, algae, and some bacteria convert light energy into chemical energy.\",\n        \"student\": \"Photosynthesis is how plants take in oxygen and produce food.\",\n        \"marks_awarded\": 1,\n        \"justification\": \"Partial credit awarded for identifying photosynthesis as a process related to plants and food production, but significant inaccuracies regarding gas exchange and energy conversion.\"\n      },\n      {\n        \"aspect\": \"Location and Mechanism\",\n        \"ideal\": \"It takes place in the chloroplasts of plant cells, where chlorophyll absorbs sunlight. The process involves the intake of carbon dioxide from the air and water from the soil. Using sunlight, these react to produce glucose and oxygen as a byproduct.\",\n        \"student\": \"It happens in the leaves, where plants drink water and breathe in air. They use sunlight to make energy, which helps them grow. The process releases carbon dioxide into the air.\",\n        \"marks_awarded\": 2,\n        \"justification\": \"Credit for mentioning leaves, water, sunlight, and plant growth. Deductions for inaccuracies about gas exchange and omitting chlorophyll and other chemical details.\"\n      },\n      {\n        \"aspect\": \"Significance\",\n        \"ideal\": \"This process is essential for life on Earth as it provides oxygen and forms the base of the food chain.\",\n        \"student\": \"(Not Addressed)\",\n        \"marks_awarded\": 1,\n        \"justification\": \"The student did not address the broader ecological significance of photosynthesis. Partial marks for hinting the importance in growth.\"\n      }\n    ]\n  }\n}\n```\n**Explanation of Marks:**\n\n*   **4/10:** This score reflects the student's basic understanding of the concept, acknowledging the core idea that plants make food using sunlight. However, it heavily penalizes the factual inaccuracies, the lack of crucial details, and the absence of any broader ecological context.\n*   **Detailed Breakdown:** The JSON provides a structured breakdown of the assessment, identifying strengths, weaknesses, and a question-by-question analysis. This makes the evaluation transparent and actionable for both the student and the educator.\n"},
          ],
        },
      ],
    });
  
