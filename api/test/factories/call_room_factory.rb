# frozen_string_literal: true

FactoryBot.define do
  factory :call_room do
    subject { association(:message_thread, :dm) }
    organization { subject&.organization || association(:organization) }
    remote_room_id { Faker::Internet.uuid }
  end
end
