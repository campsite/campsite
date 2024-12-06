# frozen_string_literal: true

# DEPRECATED: This model only exists to redirect from old digest public_ids to notes
class PostDigest < ApplicationRecord
  include PublicIdGenerator

  belongs_to :organization
  belongs_to :creator, class_name: "OrganizationMembership"
end
