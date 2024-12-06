# frozen_string_literal: true

class OrganizationPlanAddOn < ApplicationRecord
  belongs_to :organization

  def plan_add_on
    PlanAddOn.by_name!(plan_add_on_name)
  end
end
