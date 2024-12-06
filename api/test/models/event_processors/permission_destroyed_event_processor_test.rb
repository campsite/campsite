# frozen_string_literal: true

require "test_helper"

module EventProcessors
  class PermissionDestroyedEventProcessorTest < ActiveSupport::TestCase
    context "#process!" do
      before(:each) do
        org = create(:organization)
        member = create(:organization_membership, organization: org)
        project = create(:project, organization: org)
        @permission = create(:permission, user: member.user, subject: project, action: :view)
        created_event = @permission.events.created_action.first!
        @notification = create(:notification, organization_membership: member, event: created_event, target: project)
      end

      test "discards outstanding notifications" do
        @permission.discard
        event = @permission.events.destroyed_action.first!

        event.process!

        assert_predicate @notification.reload, :discarded?
      end

      test "discards follow ups when note has no project permissions" do
        note = create(:note)
        member = create(:organization_membership, organization: note.organization)
        other_member = create(:organization_membership, organization: note.organization)
        permission = create(:permission, subject: note, user: member.user)
        create(:permission, subject: note, user: other_member.user)
        no_more_access_follow_up = create(:follow_up, subject: note, organization_membership: member)
        still_accessible_follow_up = create(:follow_up, subject: note, organization_membership: other_member)
        permission.discard
        event = permission.events.destroyed_action.first!

        event.process!

        assert_not FollowUp.exists?(no_more_access_follow_up.id)
        assert FollowUp.exists?(still_accessible_follow_up.id)
      end

      test "discards favorites when note has no project permissions" do
        note = create(:note)
        member = create(:organization_membership, organization: note.organization)
        other_member = create(:organization_membership, organization: note.organization)
        permission = create(:permission, subject: note, user: member.user)
        create(:permission, subject: note, user: other_member.user)
        no_more_access_favorite = create(:favorite, favoritable: note, organization_membership: member)
        still_accessible_favorite = create(:favorite, favoritable: note, organization_membership: other_member)
        permission.discard
        event = permission.events.destroyed_action.first!

        event.process!

        assert_not Favorite.exists?(no_more_access_favorite.id)
        assert Favorite.exists?(still_accessible_favorite.id)
      end

      test "destroys subscriptions" do
        org = create(:organization)
        member = create(:organization_membership, organization: org)
        other_member = create(:organization_membership, organization: org)
        note = create(:note, subscribers: [member, other_member].map(&:user), member: create(:organization_membership, organization: org))
        permission = create(:permission, subject: note, user: member.user)
        create(:permission, subject: note, user: other_member.user)
        permission.discard
        event = permission.events.destroyed_action.first!
        event.process!

        assert note.subscriptions.exists?(user: other_member.user)
        assert_not note.subscriptions.exists?(user: member.user)
      end
    end
  end
end
