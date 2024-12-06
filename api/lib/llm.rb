# frozen_string_literal: true

class Llm
  def initialize(model: "gpt-4o")
    @model = model
    @client = OpenAI::Client.new
  end

  def chat(messages:, temperature: 0.0)
    response = @client.chat(
      parameters: {
        model: @model,
        messages: messages,
        temperature: temperature,
      },
    )
    response.dig("choices", 0, "message", "content")
  end
end
