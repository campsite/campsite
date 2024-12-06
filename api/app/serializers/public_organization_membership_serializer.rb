# frozen_string_literal: true

class PublicOrganizationMembershipSerializer < ApiSerializer
  api_field :public_id, name: :id
  api_field :last_viewed_posts_at do |membership|
    membership.last_viewed_posts_at || Time.current
  end
  api_association :organization, blueprint: PublicOrganizationSerializer
end
