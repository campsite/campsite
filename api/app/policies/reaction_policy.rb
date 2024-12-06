# frozen_string_literal: true

class ReactionPolicy < ApplicationPolicy
  def destroy?
    confirmed_user? && reaction_user?
  end

  private

  def reaction_user?
    @record.member.user == @user
  end
end
