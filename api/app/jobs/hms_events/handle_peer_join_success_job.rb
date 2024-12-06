# frozen_string_literal: true

module HmsEvents
  class HandlePeerJoinSuccessJob < BaseJob
    sidekiq_options queue: "default", retry: 3

    def perform(payload)
      event = PeerJoinSuccessEvent.new(JSON.parse(payload))
      peer = CallPeer.create_or_find_by_hms_event!(event)
      call = peer.call
      organization_membership = peer.organization_membership

      if call.subject.respond_to?(:messages) && call.subject.messages.where(call_id: call.id).none?
        begin
          call.subject.send_message!(sender: organization_membership, call: call, content: "")
        rescue ActiveRecord::RecordNotUnique
          # No-op. We've hit the unique index on call_id and message_thread_id.
          # No need to send another message.
        end
      else
        call.trigger_stale
      end

      organization_membership&.trigger_current_user_stale
      call.room.trigger_stale

      if call.subject.respond_to?(:trigger_incoming_call_prompt)
        call.subject.trigger_incoming_call_prompt(caller_organization_membership: organization_membership)
      end
    end
  end
end
