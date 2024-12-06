# frozen_string_literal: true

class ProjectDisplayPreference < ApplicationRecord
  belongs_to :project
  belongs_to :organization_membership
end
