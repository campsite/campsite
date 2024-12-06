# frozen_string_literal: true

class MessageCallSerializer < ApiSerializer
  api_field :public_id, name: :id
  api_field :created_at
  api_field :started_at
  api_field :stopped_at, nullable: true
  api_field :formatted_duration, name: :duration, nullable: true
  api_field :active?, name: :active, type: :boolean
  api_field :title do |call, options|
    call.formatted_title(options[:member])
  end
  api_field :summary, name: :summary_html, nullable: true
  api_association :recordings, blueprint: CallRecordingSerializer, is_array: true
  api_association :peers, blueprint: CallPeerSerializer, is_array: true
end
