# frozen_string_literal: true

class CommentersSerializer < ApiSerializer
  def self.schema_name
    "Commenters"
  end

  api_association :latest_commenters, is_array: true, blueprint: OrganizationMemberSerializer
end
