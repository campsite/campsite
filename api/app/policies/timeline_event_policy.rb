# frozen_string_literal: true

class TimelineEventPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      scope.viewable_by(user)
    end
  end
end
