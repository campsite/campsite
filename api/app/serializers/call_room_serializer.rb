# frozen_string_literal: true

class CallRoomSerializer < ApiSerializer
  api_field :public_id, name: :id
  api_field :channel_name
  api_field :url

  api_field :title, nullable: true do |call_room, options|
    call_room.formatted_title(options[:member])
  end

  api_field :viewer_token, nullable: true do |call_room, options|
    call_room.token(user: options[:user])
  end

  api_field :can_invite_participants?, name: :viewer_can_invite_participants, type: :boolean

  api_association :active_peers, blueprint: CallPeerSerializer, is_array: true
  api_association :peers, blueprint: CallPeerSerializer, is_array: true
end
