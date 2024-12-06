# frozen_string_literal: true

class SlackChannelPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      scope.left_outer_joins(:members).not_private.or(
        scope.left_outer_joins(:members).where(integration_channel_members: { provider_member_id: user.slack_user_ids }),
      )
    end
  end
end
