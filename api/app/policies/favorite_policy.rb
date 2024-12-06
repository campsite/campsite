# frozen_string_literal: true

class FavoritePolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      scope
    end
  end
end
