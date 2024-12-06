# frozen_string_literal: true

FactoryBot.define do
  factory :call_recording_summary_section do
    call_recording
    status { :pending }
    section { :summary }
  end
end
