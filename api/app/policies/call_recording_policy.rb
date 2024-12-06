# frozen_string_literal: true

class CallRecordingPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      scope.joins(:call).merge(Call.viewable_by(user))
    end
  end

  def show?
    Pundit.policy!(user, @record.call).show?
  end
end
