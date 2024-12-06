# frozen_string_literal: true

class PublicOrganizationMemberSerializer < ApiSerializer
  api_association :user, blueprint: PublicUserSerializer
end
