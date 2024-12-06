# frozen_string_literal: true

class ProjectView < ApplicationRecord
  belongs_to :project
  belongs_to :organization_membership
end
