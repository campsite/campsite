# frozen_string_literal: true

module Backfills
  class LlmResponsesPublicIdBackfill
    def self.run(dry_run: true)
      llm_responses = LlmResponse.where(public_id: nil)

      count = if dry_run
        llm_responses.count
      else
        result = 0

        llm_responses.find_each do |response|
          response.update_columns(public_id: LlmResponse.generate_public_id)
          result += 1
        end

        result
      end

      "#{dry_run ? "Would have updated" : "Updated"} #{count} LlmResponse #{"record".pluralize(count)}"
    end
  end
end
