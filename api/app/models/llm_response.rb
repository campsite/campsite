# frozen_string_literal: true

class LlmResponse < ApplicationRecord
  include PublicIdGenerator

  belongs_to :subject, polymorphic: true

  def self.find_or_create_by_prompt!(subject:, prompt:, response:)
    prompt_string = prompt.to_json
    find_or_create_by!(
      subject: subject,
      invocation_key: create_invocation_key(prompt_string),
    ) do |llm_response|
      llm_response.prompt = prompt_string
      llm_response.response = response
    end
  end

  def self.find_by_prompt(subject:, prompt:)
    find_by(subject: subject, invocation_key: create_invocation_key(prompt.to_json))
  end

  def self.create_invocation_key(prompt_string)
    Digest::MD5.hexdigest(prompt_string)
  end
end
