# frozen_string_literal: true

class PostFeedbackRequestPolicy < PostPolicy
  def initialize(user, context)
    @feedback_request = context
    super(user, context.post)
  end

  def dismiss?
    confirmed_user? && feedback_request_user? && show?
  end

  def destroy?
    confirmed_user? && post_user? && show?
  end

  private

  def feedback_request_user?
    @feedback_request.member.user == @user
  end
end
