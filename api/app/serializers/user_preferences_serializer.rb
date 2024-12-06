# frozen_string_literal: true

class UserPreferencesSerializer < ApiSerializer
  def self.generate_preference_fields
    UserPreference::PREFERENCES.each do |key, values|
      if values.is_a?(Array)
        api_field(key, enum: values, nullable: true, required: false)
      else
        api_field(key, nullable: true, required: false)
      end
    end
  end

  generate_preference_fields
end
