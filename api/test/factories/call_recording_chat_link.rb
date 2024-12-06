# frozen_string_literal: true

FactoryBot.define do
  factory :call_recording_chat_link do
    call_recording
    url { Faker::Internet.url }
    sender_remote_peer_id { SecureRandom.uuid }
    sender_name { Faker::Name.name }
    sent_at { Time.zone.now }
    message { [Faker::Lorem.sentence, url].join(" ") }
    remote_message_id { SecureRandom.uuid }
  end
end
