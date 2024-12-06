# frozen_string_literal: true

class ProjectPinPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      scope
    end
  end
end
