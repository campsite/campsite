# frozen_string_literal: true

class ProjectMembershipPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      scope
    end
  end
end
