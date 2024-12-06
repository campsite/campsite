# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module CallRooms
      class InvitationsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @organization = create(:organization)
          @call_room = create(:call_room, organization: @organization, subject: nil)
          @inviter_member = create(:organization_membership, organization: @organization)
          @inviter_user = @inviter_member.user
          @invitee_member = create(:organization_membership, organization: @organization)
          @invitee_user = @invitee_member.user
          @invitee_web_push_subscription = create(:web_push_subscription, user: @invitee_user)
        end

        context "#create" do
          test "org member can invite others to call room" do
            peer = create(:call_peer, :active, call: create(:call, room: @call_room), organization_membership: nil, name: "Alice")

            sign_in @inviter_user

            assert_query_count 15 do
              assert_difference -> { CallRoomInvitation.count }, 1 do
                post organization_call_room_invitations_path(@organization.slug, @call_room.public_id), params: {
                  member_ids: [@invitee_member.public_id],
                }
              end
            end

            assert_response :created
            assert_response_gen_schema
            assert_enqueued_sidekiq_job(DeliverWebPushCallRoomInvitationJob, args: [
              @call_room.id,
              @inviter_member.id,
              @invitee_web_push_subscription.id,
            ])
            assert_enqueued_sidekiq_job(PusherTriggerJob, args: [
              @invitee_member.user.channel_name,
              "incoming-call-room-invitation",
              {
                call_room_id: @call_room.public_id,
                call_room_url: @call_room.url,
                creator_member: OrganizationMemberSerializer.render_as_hash(@inviter_member),
                other_active_peers: [CallPeerSerializer.render_as_hash(peer)],
                skip_push: false,
              }.to_json,
            ])
            invitation = @call_room.invitations.last!
            assert_equal [@invitee_member], invitation.invitee_organization_memberships
            assert_equal @inviter_member, invitation.creator_organization_membership
          end

          test "org member can't invite to call room they can't access" do
            @call_room.update!(subject: create(:message_thread))

            sign_in @inviter_user
            post organization_call_room_invitations_path(@organization.slug, @call_room.public_id), params: {
              member_ids: [@invitee_member.public_id],
            }

            assert_response :forbidden
          end

          test "org member can't invite non-org member to call room" do
            sign_in @inviter_user
            post organization_call_room_invitations_path(@organization.slug, @call_room.public_id), params: {
              member_ids: [create(:organization_membership).public_id],
            }

            assert_response :created
            assert_response_gen_schema
            refute_enqueued_sidekiq_job(PusherTriggerJob)
          end

          test "return 403 for a random user" do
            sign_in create(:user)
            post organization_call_room_invitations_path(@organization.slug, @call_room.public_id), params: {
              member_ids: [@invitee_member.public_id],
            }

            assert_response :forbidden
          end

          test "return 401 for an unauthenticated user" do
            post organization_call_room_invitations_path(@organization.slug, @call_room.public_id), params: {
              member_ids: [@invitee_member.public_id],
            }

            assert_response :unauthorized
          end
        end
      end
    end
  end
end
