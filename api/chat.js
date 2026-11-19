
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { message } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "Please send a message."
      });
    }

    if (message.length > 4000) {
      return res.status(400).json({
        error: "Message is too long."
      });
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: `You are Fred, the friendly AI tutor
for EasyStudy. Teach students patiently.
Use hints, examples and guiding questions.
Help them understand rather than simply
giving homework answers. Be encouraging,
clear and age-appropriate.`
            },
            {
              role: "user",
              content: message
            }
          ],
          temperature: 0.7,
          max_tokens: 700
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq API error:", data);
      return res.status(502).json({
        error: "Fred is having trouble right now."
      });
    }

    return res.status(200).json({
      reply: data.choices?.[0]?.message?.content ||
        "Let's try that again!"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Something went wrong."
    });
  }
}
