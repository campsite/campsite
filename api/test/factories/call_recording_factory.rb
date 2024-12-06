# frozen_string_literal: true

FactoryBot.define do
  factory :call_recording do
    call
    remote_beam_id { Faker::Internet.uuid }
    remote_job_id { Faker::Internet.uuid }
    started_at { 5.minutes.ago }

    trait :with_file do
      file_path { "recording.mp4" }
    end

    trait :transcription_in_progress do
      transcription_started_at { 4.minutes.ago }
    end

    trait :with_transcription do
      transcription_started_at { 4.minutes.ago }
      transcription_succeeded_at { 3.minutes.ago }
      transcription_vtt { "WEBVTT\n\n00:00:00.000 --> 00:00:01.000\nHello World\n\n" }
      stopped_at { 2.minutes.ago }
    end
  end
end
