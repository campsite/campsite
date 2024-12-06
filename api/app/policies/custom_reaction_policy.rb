# frozen_string_literal: true

class CustomReactionPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      scope
    end
  end
end
